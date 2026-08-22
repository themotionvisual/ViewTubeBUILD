import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, extname, relative, resolve } from "node:path"
import ts from "typescript"

const root = resolve(process.cwd())
const srcRoot = resolve(root, "src")
const outputRoot = resolve(root, "artifacts", "audits")
const checkMode = process.argv.includes("--check")

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist", "build", "coverage", ".vite"])
const VISUAL_NAME_PATTERN = /(chart|visual|graph|heatmap|network|radar|matrix|scatter|treemap|sankey|map|waveform|venn)/i

const walk = (directory, predicate = () => true) => {
  if (!existsSync(directory)) return []
  const files = []
  for (const entry of readdirSync(directory)) {
    if (SKIP_DIRECTORIES.has(entry)) continue
    const file = resolve(directory, entry)
    const stats = statSync(file)
    if (stats.isDirectory()) files.push(...walk(file, predicate))
    else if (predicate(file)) files.push(file)
  }
  return files
}

const sourceFiles = walk(srcRoot, (file) => SOURCE_EXTENSIONS.includes(extname(file)))
const sourceFileSet = new Set(sourceFiles)

const relativePath = (file) => relative(root, file).replaceAll("\\", "/")

const resolveLocalImport = (fromFile, specifier) => {
  if (!specifier.startsWith(".")) return null
  const candidate = resolve(dirname(fromFile), specifier)
  const attempts = [
    candidate,
    ...SOURCE_EXTENSIONS.map((extension) => `${candidate}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => resolve(candidate, `index${extension}`)),
  ]
  return attempts.find((attempt) => sourceFileSet.has(attempt)) ?? null
}

const importedFilesFor = (file) => {
  const source = readFileSync(file, "utf8")
  return ts.preProcessFile(source, true, true).importedFiles
    .map(({ fileName }) => resolveLocalImport(file, fileName))
    .filter(Boolean)
}

const entryPoints = [resolve(srcRoot, "main.tsx")].filter(existsSync)
const reachable = new Set()
const queue = [...entryPoints]
while (queue.length) {
  const file = queue.shift()
  if (!file || reachable.has(file)) continue
  reachable.add(file)
  for (const imported of importedFilesFor(file)) {
    if (!reachable.has(imported)) queue.push(imported)
  }
}

const classifyUnreachable = (file) => {
  const path = relativePath(file)
  if (/\.(test|spec)\.[cm]?[jt]sx?$|\/(test|tests|fixtures|__tests__)\//i.test(path)) return "test_or_fixture"
  if (path.startsWith("src/generated/")) return "generated_report"
  if (/\/(bench|debug|reference|internal|_parking)\//i.test(path)) return "intentional_internal_candidate"
  if (/Registry\.(ts|tsx)$|\/index\.(ts|tsx)$/.test(path)) return "registry_or_barrel_candidate"
  return "likely_orphan_review_required"
}

const reachability = sourceFiles
  .map((file) => ({
    file: relativePath(file),
    reachable: reachable.has(file),
    classification: reachable.has(file) ? "production_reachable" : classifyUnreachable(file),
  }))
  .sort((a, b) => a.file.localeCompare(b.file))

const importedSymbols = new Map()
const namespaceImports = new Set()
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8")
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
    const resolved = resolveLocalImport(file, statement.moduleSpecifier.text)
    if (!resolved || !statement.importClause) continue
    if (statement.importClause.name) {
      const key = `${resolved}::default`
      importedSymbols.set(key, (importedSymbols.get(key) ?? 0) + 1)
    }
    const bindings = statement.importClause.namedBindings
    if (bindings && ts.isNamespaceImport(bindings)) namespaceImports.add(resolved)
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        const key = `${resolved}::${element.propertyName?.text ?? element.name.text}`
        importedSymbols.set(key, (importedSymbols.get(key) ?? 0) + 1)
      }
    }
  }
}

const hasExportModifier = (node) => node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
const declarationName = (node) => node.name && ts.isIdentifier(node.name) ? node.name.text : null

const unusedExports = []
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8")
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const identifierCounts = new Map()
  const countIdentifiers = (node) => {
    if (ts.isIdentifier(node)) identifierCounts.set(node.text, (identifierCounts.get(node.text) ?? 0) + 1)
    ts.forEachChild(node, countIdentifiers)
  }
  countIdentifiers(sourceFile)

  const recordExport = (name, kind) => {
    if (!name) return
    const externalReferences = namespaceImports.has(file) ? null : (importedSymbols.get(`${file}::${name}`) ?? 0)
    const internalReferences = Math.max(0, (identifierCounts.get(name) ?? 0) - 1)
    if ((externalReferences ?? 1) > 0 || internalReferences > 0) return
    unusedExports.push({
      file: relativePath(file),
      symbol: name,
      kind,
      internalReferences,
      externalReferences,
      confidence: /\/index\.(ts|tsx)$/.test(relativePath(file)) ? "low" : "medium",
    })
  }

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      recordExport("default", "default_export")
      continue
    }
    if (ts.isExportDeclaration(statement)) continue
    if (!hasExportModifier(statement)) continue
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) recordExport(declarationName(declaration), "variable")
      continue
    }
    recordExport(declarationName(statement), ts.SyntaxKind[statement.kind] ?? "declaration")
  }
}
unusedExports.sort((a, b) => a.file.localeCompare(b.file) || a.symbol.localeCompare(b.symbol))

const routesSource = readFileSync(resolve(srcRoot, "app/AppRoutes.tsx"), "utf8")
const lazyImports = new Map()
for (const match of routesSource.matchAll(/const\s+(\w+)\s*=\s*lazy\([\s\S]*?import\("([^"]+)"\)/g)) {
  lazyImports.set(match[1], match[2])
}

const routeEntries = []
for (const match of routesSource.matchAll(/<Route\s+[\s\S]*?path="([^"]+)"[\s\S]*?element=\{<([A-Za-z0-9_]+)/g)) {
  const path = match[1]
  const component = match[2]
  routeEntries.push({
    path,
    component,
    importPath: lazyImports.get(component) ?? null,
    visibility: /^\/(internal|reference-studio|render-bench|bench|audit|component|legacy)/.test(path) ? "internal_or_reference" : "public_or_alias",
  })
}

const destinationSources = [
  resolve(srcRoot, "components/navigation/navigationContract.ts"),
  resolve(srcRoot, "components/navigation/applicationMenuContract.ts"),
]
const visibleDestinations = new Set()
for (const file of destinationSources) {
  const source = readFileSync(file, "utf8")
  for (const match of source.matchAll(/path:\s*"([^"]+)"/g)) visibleDestinations.add(match[1].split(/[?#]/)[0])
}
const routePaths = new Set(routeEntries.map((route) => route.path))
const missingVisibleRoutes = [...visibleDestinations].filter((path) => !routePaths.has(path)).sort()
const duplicateRoutePaths = [...routePaths].filter((path) => routeEntries.filter((route) => route.path === path).length > 1).sort()

const visualEntries = sourceFiles
  .filter((file) => VISUAL_NAME_PATTERN.test(relativePath(file)) || VISUAL_NAME_PATTERN.test(readFileSync(file, "utf8").slice(0, 8000)))
  .map((file) => {
    const source = readFileSync(file, "utf8")
    return {
      file: relativePath(file),
      reachable: reachable.has(file),
      renderer: source.includes("react-google-charts") ? "GoogleChart" : source.includes("recharts") ? "Recharts" : "Custom_or_shell",
      hasAnimationBoundary: source.includes("HeroIntroBoundary") || source.includes("requestAnimationFrame"),
      hasReducedMotion: source.includes("prefers-reduced-motion"),
    }
  })
  .sort((a, b) => a.file.localeCompare(b.file))

const htmlEntries = walk(root, (file) => extname(file) === ".html")
  .map((file) => {
    const path = relativePath(file)
    const category = path === "index.html" || path === "public/oauth-callback.html"
      ? "production"
      : /reference|atlas|gallery/i.test(path)
        ? "reference"
        : /prototype|experiment|standalone/i.test(path)
          ? "prototype_or_experiment"
          : "review_required"
    return { file: path, category }
  })
  .sort((a, b) => a.file.localeCompare(b.file))

const report = {
  scope: "ViewTube application source",
  entryPoints: entryPoints.map(relativePath),
  summary: {
    sourceFiles: sourceFiles.length,
    productionReachable: reachability.filter((entry) => entry.reachable).length,
    unreachableReviewCandidates: reachability.filter((entry) => !entry.reachable).length,
    unusedExportCandidates: unusedExports.length,
    routes: routeEntries.length,
    missingVisibleRoutes: missingVisibleRoutes.length,
    duplicateRoutePaths: duplicateRoutePaths.length,
    visualCandidates: visualEntries.length,
    htmlFiles: htmlEntries.length,
  },
  reachability,
  unusedExports,
  routes: routeEntries,
  routeContract: { missingVisibleRoutes, duplicateRoutePaths },
  visuals: visualEntries,
  html: htmlEntries,
}

const markdown = [
  "# ViewTube Quick-Wins Audit",
  "",
  "Generated by `npm run audit:quick-wins`. Findings are review inputs and never authorize deletion.",
  "",
  "## Summary",
  "",
  `- Source files: ${report.summary.sourceFiles}`,
  `- Production reachable: ${report.summary.productionReachable}`,
  `- Unreachable review candidates: ${report.summary.unreachableReviewCandidates}`,
  `- Unused export candidates: ${report.summary.unusedExportCandidates}`,
  `- Routes: ${report.summary.routes}`,
  `- Missing visible routes: ${report.summary.missingVisibleRoutes}`,
  `- Duplicate route paths: ${report.summary.duplicateRoutePaths}`,
  `- Visual candidates: ${report.summary.visualCandidates}`,
  `- HTML files: ${report.summary.htmlFiles}`,
  "",
  "## Route Contract",
  "",
  missingVisibleRoutes.length ? `Missing visible routes: ${missingVisibleRoutes.join(", ")}` : "No visible navigation destination points to a missing route.",
  duplicateRoutePaths.length ? `Duplicate route paths: ${duplicateRoutePaths.join(", ")}` : "No duplicate route paths were found.",
  "",
  "## Unreachable Source Review",
  "",
  "| File | Classification |",
  "|---|---|",
  ...reachability.filter((entry) => !entry.reachable).map((entry) => `| \`${entry.file}\` | ${entry.classification} |`),
  "",
  "## Unused Export Candidates",
  "",
  "| File | Symbol | Kind | Confidence |",
  "|---|---|---|---|",
  ...unusedExports.map((entry) => `| \`${entry.file}\` | \`${entry.symbol}\` | ${entry.kind} | ${entry.confidence} |`),
  "",
  "## HTML Inventory",
  "",
  "| File | Category |",
  "|---|---|",
  ...htmlEntries.map((entry) => `| \`${entry.file}\` | ${entry.category} |`),
]

if (!checkMode) {
  mkdirSync(outputRoot, { recursive: true })
  writeFileSync(resolve(outputRoot, "quick-wins-audit.json"), `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(resolve(outputRoot, "quick-wins-audit.md"), `${markdown.join("\n")}\n`)
}

const highConfidenceViolations = [...missingVisibleRoutes, ...duplicateRoutePaths]
if (checkMode && highConfidenceViolations.length) {
  console.error(`Quick-wins route audit failed: ${highConfidenceViolations.join(", ")}`)
  process.exitCode = 1
} else {
  console.log(`Quick-wins audit complete: ${sourceFiles.length} source files, ${routeEntries.length} routes, ${unusedExports.length} export candidates.`)
}
