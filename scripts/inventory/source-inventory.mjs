#!/usr/bin/env node
/**
 * ViewTube source inventory — vt-2253 / vt-2254 / vt-2255 / vt-2256.
 *
 * Static-analysis script (no runtime, no imports actually executed) that walks
 * `src/` and produces four inventory JSON snapshots for MANUAL review. The
 * outputs are intentionally read-only: this script does not delete or move
 * anything.
 *
 *   scripts/inventory/reports/unused-source-files.json      (vt-2253)
 *   scripts/inventory/reports/unused-exports.json           (vt-2254)
 *   scripts/inventory/reports/page-route-inventory.json     (vt-2255)
 *   scripts/inventory/reports/unnavigated-routes.json       (vt-2256)
 *
 * Run: `node scripts/inventory/source-inventory.mjs`
 *
 * Why not a package.json script? Kept off npm scripts so it's an explicit
 * human-invoked review pass, not something CI grep-parses to make changes.
 */

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs"
import { join, relative, resolve, dirname, extname } from "node:path"

const ROOT = process.cwd()
const SRC = resolve(ROOT, "src")
const OUT = resolve(ROOT, "scripts/inventory/reports")

const SOURCE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"])
const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".vite",
  ".vt-e1-render",
  "_parking",
  "_quarantine",
  "_migration_hub",
  "archive",
  "standalone",
  "generated",
  ".git",
])

/* ------------------------------------------------------------------ walk */

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, files)
    else if (SOURCE_EXTS.has(extname(full))) files.push(full)
  }
  return files
}

const allSourceFiles = walk(SRC)
const sourceFileSet = new Set(allSourceFiles.map((f) => relative(ROOT, f)))

/* ---------------------------------- import + export static analysis */

// Match `from "…"` and `import("…")` (dynamic) — enough for local-import edges.
const IMPORT_PATTERN = /(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g

// Match `export …` heads good enough for a "does something export from this file" test.
const EXPORT_HEAD_PATTERN = /^\s*export\s+(?:default\s+|const\s+|let\s+|var\s+|function\s+|async\s+function\s+|class\s+|type\s+|interface\s+|enum\s+|\*\s+from|\{)/m

// Named-export capture — `export const X`, `export function X`, `export class X`, `export { X, Y as Z }`.
const NAMED_EXPORT_PATTERN =
  /export\s+(?:const|let|var|function|async\s+function|class|type|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)|export\s*\{\s*([^}]+)\s*\}/g

function resolveLocalImport(fromFile, importPath) {
  // Only interested in local imports (start with `.` or `@/`).
  if (!importPath.startsWith(".") && !importPath.startsWith("@/")) return null
  const baseFrom = importPath.startsWith("@/")
    ? resolve(SRC, importPath.slice(2))
    : resolve(dirname(fromFile), importPath)
  // Try each candidate extension + index.
  const candidates = [
    baseFrom,
    ...SOURCE_EXTS.values() ? [...SOURCE_EXTS].map((e) => baseFrom + e) : [],
    ...SOURCE_EXTS.values() ? [...SOURCE_EXTS].map((e) => join(baseFrom, "index" + e)) : [],
  ]
  for (const c of candidates) {
    try {
      const st = statSync(c)
      if (st.isFile()) return c
    } catch {}
  }
  return null
}

// Build the file → importers-of-it graph.
const importedBy = new Map()
for (const f of allSourceFiles) importedBy.set(f, new Set())

for (const f of allSourceFiles) {
  const src = readFileSync(f, "utf8")
  const seen = new Set()
  for (const m of src.matchAll(IMPORT_PATTERN)) {
    const targetPath = m[1]
    if (seen.has(targetPath)) continue
    seen.add(targetPath)
    const resolved = resolveLocalImport(f, targetPath)
    if (resolved && importedBy.has(resolved)) importedBy.get(resolved).add(f)
  }
}

/* --------------------------------------------- vt-2253 unused source files */

// Entry points that are always reachable regardless of what imports them.
const ENTRY_PATTERNS = [
  /\/src\/main\.tsx?$/,
  /\/src\/App\.tsx?$/,
  /\/src\/index\.(?:tsx?|jsx?)$/,
  /\/src\/app\/AppRoutes\.tsx$/,
  /\/src\/app\/AppShell\.tsx$/,
  /vite\.config\.ts$/,
  // Test files reach unlimited code paths via mocks.
  /\.test\.(?:tsx?|jsx?)$/,
  /\.spec\.(?:tsx?|jsx?)$/,
  /\/__tests__\//,
  // Scripts + generators.
  /\.audit\.test\.tsx?$/,
]

function isEntry(file) {
  const norm = file.replace(/\\/g, "/")
  return ENTRY_PATTERNS.some((r) => r.test(norm))
}

const unusedFiles = []
for (const f of allSourceFiles) {
  if (isEntry(f)) continue
  const importers = importedBy.get(f) || new Set()
  if (importers.size === 0) unusedFiles.push(relative(ROOT, f))
}

/* -------------------------------------------- vt-2254 unused exports */

// Global usage index: symbol name → files that mention it.
// Cheap heuristic — matches identifier tokens anywhere in source; false positives
// are fine because the goal is a shortlist for MANUAL review, not automated deletion.
const globalUsage = new Map()
for (const f of allSourceFiles) {
  const src = readFileSync(f, "utf8")
  for (const m of src.matchAll(/\b([A-Za-z_$][A-Za-z0-9_$]{2,})\b/g)) {
    const name = m[1]
    if (!globalUsage.has(name)) globalUsage.set(name, new Set())
    globalUsage.get(name).add(f)
  }
}

const unusedExports = []
for (const f of allSourceFiles) {
  const src = readFileSync(f, "utf8")
  if (!EXPORT_HEAD_PATTERN.test(src)) continue
  const declared = new Set()
  for (const m of src.matchAll(NAMED_EXPORT_PATTERN)) {
    if (m[1]) declared.add(m[1])
    if (m[2]) {
      for (const bit of m[2].split(",")) {
        const clean = bit.trim().split(/\s+as\s+/i).pop().trim()
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(clean)) declared.add(clean)
      }
    }
  }
  for (const name of declared) {
    const users = globalUsage.get(name) || new Set()
    // The declaring file itself always mentions the identifier — needs at least
    // one OTHER file to count as "used".
    const otherUsers = new Set([...users].filter((u) => u !== f))
    if (otherUsers.size === 0) unusedExports.push({ file: relative(ROOT, f), export: name })
  }
}

/* -------------------------------------------- vt-2255 page/route inventory */

// Discover Page/Route source files: anything under src/views or src/pages, plus
// components matching *Page.tsx.
const pageFiles = allSourceFiles.filter((f) => {
  const norm = f.replace(/\\/g, "/")
  return /\/src\/views\//.test(norm) || /\/src\/pages\//.test(norm) || /Page\.tsx?$/.test(norm)
})

const appRoutesSource = readFileSync(resolve(ROOT, "src/app/AppRoutes.tsx"), "utf8")
// Extract every <Route path="…" element={…}> pair + the imported component name.
const routeMatches = [
  ...appRoutesSource.matchAll(/<Route\s+[^>]*path="([^"]+)"[^>]*element=\{<([A-Za-z0-9_]+)/g),
]
const routedComponents = new Set(routeMatches.map((m) => m[2]))
const routePaths = routeMatches.map((m) => ({ path: m[1], component: m[2] }))

const pageInventory = pageFiles.map((f) => {
  const src = readFileSync(f, "utf8")
  // Guess exported component names.
  const exports = [...src.matchAll(/export\s+(?:default\s+)?(?:const|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)].map((m) => m[1])
  const isReferencedInRoutes = exports.some((name) => routedComponents.has(name))
  return {
    file: relative(ROOT, f),
    exports,
    isReferencedInRoutes,
  }
})

/* -------------------------------------------- vt-2256 unnavigated routes */

// Find every navigation entry (from PRIMARY_NAV_ITEMS + APPLICATION_MENU_DESTINATIONS
// + any <NavLink to="…"> / navigate("…") calls) and diff against routePaths.
const navigationSources = allSourceFiles.filter((f) => {
  const norm = f.replace(/\\/g, "/")
  return /navigation\/navigationContract/.test(norm)
      || /navigation\/applicationMenuContract/.test(norm)
      || /components\/navigation\//.test(norm)
})

const navigatedPaths = new Set()
// Also collect from anywhere the source uses navigate("…") or <NavLink to="…">
for (const f of allSourceFiles) {
  const src = readFileSync(f, "utf8")
  for (const m of src.matchAll(/(?:navigate|to)\s*[=(]\s*["'`]([^"'`?]+)/g)) {
    const p = m[1]
    if (p.startsWith("/")) navigatedPaths.add(p)
  }
}
for (const f of navigationSources) {
  const src = readFileSync(f, "utf8")
  for (const m of src.matchAll(/path:\s*["'`]([^"'`?]+)/g)) {
    if (m[1].startsWith("/")) navigatedPaths.add(m[1])
  }
}

const unnavigatedRoutes = routePaths
  .filter(({ path }) => path !== "*" && !path.includes(":") && !navigatedPaths.has(path))
  .map(({ path, component }) => ({ path, component }))

/* -------------------------------------------------------------- write */

mkdirSync(OUT, { recursive: true })

const timestamp = new Date().toISOString()

writeFileSync(
  join(OUT, "unused-source-files.json"),
  JSON.stringify({ task: "vt-2253", generatedAt: timestamp, count: unusedFiles.length, files: unusedFiles }, null, 2) + "\n",
)
writeFileSync(
  join(OUT, "unused-exports.json"),
  JSON.stringify({ task: "vt-2254", generatedAt: timestamp, count: unusedExports.length, exports: unusedExports }, null, 2) + "\n",
)
writeFileSync(
  join(OUT, "page-route-inventory.json"),
  JSON.stringify(
    {
      task: "vt-2255",
      generatedAt: timestamp,
      totalPageFiles: pageInventory.length,
      referenced: pageInventory.filter((p) => p.isReferencedInRoutes).length,
      unreferenced: pageInventory.filter((p) => !p.isReferencedInRoutes).length,
      pages: pageInventory,
    },
    null,
    2,
  ) + "\n",
)
writeFileSync(
  join(OUT, "unnavigated-routes.json"),
  JSON.stringify(
    {
      task: "vt-2256",
      generatedAt: timestamp,
      count: unnavigatedRoutes.length,
      routes: unnavigatedRoutes,
    },
    null,
    2,
  ) + "\n",
)

console.log(`
✓ Inventory generated under scripts/inventory/reports/

  vt-2253 unused-source-files.json     ${unusedFiles.length} candidate files
  vt-2254 unused-exports.json          ${unusedExports.length} candidate exports
  vt-2255 page-route-inventory.json    ${pageInventory.length} page files (${pageInventory.filter((p) => !p.isReferencedInRoutes).length} unreferenced)
  vt-2256 unnavigated-routes.json      ${unnavigatedRoutes.length} routes with no <NavLink to>/navigate() reference

These outputs are for MANUAL review. Static analysis is a shortlist, not proof —
false positives (dynamic imports, string-composed paths, lazy-loaded pages)
happen. Do not auto-delete anything from the JSON.
`)
