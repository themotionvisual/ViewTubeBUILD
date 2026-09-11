/**
 * Dashboard baseline report.
 *
 * Phase 0 of docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md:
 * a repeatable measurement so every later phase can prove it did not regress.
 *
 *   node scripts/dashboard-baseline-report.mjs            # print a report
 *   node scripts/dashboard-baseline-report.mjs --json     # machine readable
 *   node scripts/dashboard-baseline-report.mjs --check    # compare to the
 *                                                         # committed baseline
 *
 * Build-output figures are only included when dist/ exists; run `npm run build`
 * first if you want them. Source figures never need a build.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { resolve } from "node:path"

const root = resolve(process.cwd())
const dashboardRoot = resolve(root, "src/views/dashboard")
const distAssets = resolve(root, "dist/assets")
const baselinePath = resolve(root, "docs/architecture/dashboard-baseline.json")

const args = new Set(process.argv.slice(2))
const asJson = args.has("--json")
const check = args.has("--check")
const write = args.has("--write")

const read = (p) => readFileSync(p, "utf8")

/* ── CSS ───────────────────────────────────────────────────────────── */

const cssFiles = readdirSync(dashboardRoot)
  .filter((f) => f.endsWith(".css"))
  .sort()

const css = { files: {}, totals: { lines: 0, bytes: 0, important: 0, media: 0, container: 0 } }

for (const file of cssFiles) {
  const text = read(resolve(dashboardRoot, file))
  const entry = {
    lines: text.split("\n").length,
    bytes: Buffer.byteLength(text),
    important: (text.match(/!important/g) || []).length,
    media: (text.match(/@media/g) || []).length,
    container: (text.match(/@container/g) || []).length,
  }
  css.files[file] = entry
  for (const k of Object.keys(css.totals)) css.totals[k] += entry[k]
}

// The blanket specificity prefix Phase 4 removes.
const toolbox = read(resolve(dashboardRoot, "toolboxWidgetSystem.css"))
css.barrierPrefixedRules = (toolbox.match(/^\.dashboard-barrier /gm) || []).length

// Duplicate top-level selector ownership.
const roots = (toolbox.match(/^[.#][a-zA-Z0-9_-]+/gm) || [])
const counts = roots.reduce((acc, r) => ((acc[r] = (acc[r] || 0) + 1), acc), {})
css.distinctSelectorRoots = Object.keys(counts).length
css.duplicatedSelectorRoots = Object.values(counts).filter((n) => n > 1).length

/* ── Source concentration ──────────────────────────────────────────── */

const sourceFiles = [
  "WidgetRenderer.tsx",
  "WidgetRegistry.ts",
  "WidgetPrimitives.tsx",
  "useDashboardData.ts",
  "WidgetPrimitiveExtensions.tsx",
  "DashboardCanvas.tsx",
  "WidgetShell.tsx",
  "storage.ts",
]
const source = {}
for (const file of sourceFiles) {
  const p = resolve(dashboardRoot, file)
  if (existsSync(p)) source[file] = read(p).split("\n").length
}

/* ── Registry and renderer ─────────────────────────────────────────── */

const registry = read(resolve(dashboardRoot, "WidgetRegistry.ts"))
const renderer = read(resolve(dashboardRoot, "WidgetRenderer.tsx"))

const registryIds = [...registry.matchAll(/^\s+id: "([a-z0-9-]+)"/gm)].map((m) => m[1])
const uniqueIds = new Set(registryIds)

const lazyKeys = [...renderer.matchAll(/^\s*"([a-z0-9-]+)":\s*React\.lazy/gm)].map((m) => m[1])

// Keys implemented as `if (widget.id === "…")` branches inside the resolver,
// plus the declared INLINE_WIDGET_RENDERER_KEYS list.
const inlineBlock = renderer.match(/const INLINE_WIDGET_RENDERER_KEYS[\s\S]*?\n\]/)
const inlineKeys = inlineBlock
  ? [...inlineBlock[0].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1])
  : []

const covered = new Set([...lazyKeys, ...inlineKeys])
const uncovered = registryIds.filter((id) => !covered.has(id))

const widgetsDir = resolve(dashboardRoot, "widgets")
const widgetFiles = existsSync(widgetsDir)
  ? readdirSync(widgetsDir).filter((f) => f.endsWith(".tsx")).map((f) => f.replace(/\.tsx$/, ""))
  : []

// A widget file is an orphan only if nothing anywhere in src/ names it — a file
// reached through a primitive or another widget is still wired up.
const srcText = []
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(ts|tsx)$/.test(entry.name) && !full.startsWith(widgetsDir)) {
      srcText.push(read(full))
    }
  }
}
walk(resolve(root, "src"))
// Widget files may also import each other.
for (const name of widgetFiles) {
  srcText.push(read(resolve(widgetsDir, `${name}.tsx`)))
}
const allSource = srcText.join("\n")
const orphanWidgetFiles = widgetFiles.filter(
  (name) => !new RegExp(`\\b${name}\\b`).test(allSource.split(`export const ${name}`).join("")),
)

const widgets = {
  registered: registryIds.length,
  uniqueIds: uniqueIds.size,
  duplicateIds: registryIds.length - uniqueIds.size,
  lazyRenderers: lazyKeys.length,
  inlineRenderers: inlineKeys.length,
  uncoveredIds: uncovered,
  orphanWidgetFiles,
}

/* ── Build output ──────────────────────────────────────────────────── */

let build = null
if (existsSync(distAssets)) {
  build = {}
  const interesting = /^(Dashboard|UIReferenceLibraryWidget|index)-/
  for (const file of readdirSync(distAssets).sort()) {
    if (!interesting.test(file)) continue
    const buf = readFileSync(resolve(distAssets, file))
    // Hashes change every build; key on the stable prefix so --check can compare.
    build[file.replace(/-[A-Za-z0-9_-]{8,}\./, ".")] = {
      raw: buf.length,
      gzip: gzipSync(buf).length,
    }
  }
}

const report = { measuredAt: new Date().toISOString().slice(0, 10), css, source, widgets, build }

/* ── Output ────────────────────────────────────────────────────────── */

if (write) {
  writeFileSync(baselinePath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`wrote ${baselinePath}`)
  process.exit(0)
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`

console.log("Dashboard baseline\n")
console.log(`  CSS          ${css.totals.lines} lines across ${cssFiles.length} files, ${kb(css.totals.bytes)}`)
console.log(`               ${css.totals.important} !important (occurrences), ${css.totals.media} @media, ${css.totals.container} @container`)
console.log(`               ${css.barrierPrefixedRules} .dashboard-barrier-prefixed rules`)
console.log(`               ${css.duplicatedSelectorRoots} of ${css.distinctSelectorRoots} selector roots defined more than once`)
console.log(`\n  Widgets      ${widgets.registered} registered (${widgets.duplicateIds} duplicate ids)`)
console.log(`               ${widgets.lazyRenderers} lazy, ${widgets.inlineRenderers} inline`)
console.log(`               ${widgets.uncoveredIds.length} uncovered ids${widgets.uncoveredIds.length ? `: ${widgets.uncoveredIds.join(", ")}` : ""}`)
console.log(`               ${widgets.orphanWidgetFiles.length} orphan widget files${widgets.orphanWidgetFiles.length ? `: ${widgets.orphanWidgetFiles.join(", ")}` : ""}`)
console.log("\n  Source")
for (const [file, lines] of Object.entries(source).sort((a, b) => b[1] - a[1])) {
  console.log(`               ${String(lines).padStart(5)}  ${file}`)
}
if (build) {
  console.log("\n  Build")
  for (const [file, { raw, gzip }] of Object.entries(build)) {
    console.log(`               ${kb(raw).padStart(9)} raw  ${kb(gzip).padStart(9)} gzip  ${file}`)
  }
} else {
  console.log("\n  Build        (no dist/ — run `npm run build` to include bundle figures)")
}

if (check) {
  if (!existsSync(baselinePath)) {
    console.error(`\nNo committed baseline at ${baselinePath}. Run with --write to create one.`)
    process.exit(1)
  }
  const prev = JSON.parse(read(baselinePath))
  const regressions = []
  const budgets = [
    ["css.totals.important", css.totals.important, prev.css.totals.important],
    ["css.barrierPrefixedRules", css.barrierPrefixedRules, prev.css.barrierPrefixedRules],
    ["widgets.duplicateIds", widgets.duplicateIds, prev.widgets.duplicateIds],
    ["widgets.uncoveredIds", widgets.uncoveredIds.length, prev.widgets.uncoveredIds.length],
  ]
  for (const [name, now, before] of budgets) {
    if (now > before) regressions.push(`${name}: ${before} -> ${now}`)
  }
  if (build && prev.build) {
    for (const [file, { gzip }] of Object.entries(build)) {
      const before = prev.build[file]?.gzip
      if (before && gzip > before) regressions.push(`${file} gzip: ${before} -> ${gzip}`)
    }
  }
  if (regressions.length) {
    console.error(`\nRegressions against the committed baseline:\n  ${regressions.join("\n  ")}`)
    process.exit(1)
  }
  console.log("\nNo regressions against the committed baseline.")
}
