/**
 * Dashboard computed-style snapshot.
 *
 * Phase 4 of docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md
 * removes the `.dashboard-barrier ` prefix from 953 rules, which drops one
 * class of specificity across nearly the whole dashboard stylesheet. The risk
 * is not that the page stops rendering — it is that some rule which used to
 * lose the cascade now wins, somewhere nobody looks.
 *
 * Pixel diffs answer "did something change" but not "what". This records the
 * resolved value of the properties that prefix can actually affect, per
 * representative selector, at every width bucket the grid can produce. A diff
 * then names the selector and the property.
 *
 *   npm run build
 *   npm run snapshot:dashboard-styles            # write the snapshot
 *   npm run snapshot:dashboard-styles -- --check # compare against it
 *
 * Starts its own `vite preview`, so no server needs to be running.
 *
 * Scope: this compares a before and an after on the SAME machine. Computed
 * widths depend on viewport, scrollbar width and font availability, so a
 * snapshot taken here will not match one taken on a CI runner. Capture, make
 * the change, re-check — do not wire it into CI as a cross-machine gate.
 */
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { chromium } from "playwright"

const root = resolve(process.cwd())
const snapshotPath = resolve(root, "docs/architecture/dashboard-style-snapshot.json")
// Ask the OS for a free port. A fixed port strands the run whenever a previous
// preview is still holding it.
const freePort = () => new Promise((res, rej) => {
  const srv = createServer()
  srv.on("error", rej)
  srv.listen(0, "127.0.0.1", () => {
    const { port } = srv.address()
    srv.close(() => res(port))
  })
})
const PORT = Number(process.env.SNAPSHOT_PORT) || (await freePort())
const args = new Set(process.argv.slice(2))
const check = args.has("--check")

if (!existsSync(resolve(root, "dist/index.html"))) {
  console.error("No dist/ — run `npm run build` first.")
  process.exit(1)
}

// The properties the specificity prefix governs. Layout, box, type and colour:
// anything a losing rule could take over if it stopped losing.
const PROPERTIES = [
  "display", "position", "box-sizing", "overflow",
  "width", "height", "min-height", "max-width",
  "padding", "margin", "gap",
  "border-width", "border-style", "border-color", "border-radius",
  "background-color", "color",
  "font-size", "font-weight", "line-height", "letter-spacing", "text-transform",
  "flex-direction", "align-items", "justify-content",
  "grid-template-columns", "container-type", "container-name",
  "box-shadow", "opacity",
]

// One representative element per structural role. First match wins; a selector
// that matches nothing is recorded as absent rather than silently skipped, so
// the snapshot notices if markup disappears.
const SELECTORS = [
  ".dashboard-barrier",
  ".dashboard-widget-slot",
  ".vt-widget",
  ".vt-widget-header",
  ".vt-widget-header .left",
  ".icon-rail",
  ".vt-widget-body",
  ".vt-button",
  ".vt-input",
  ".vt-select",
  ".widget-section",
  ".widget-footer",
  ".widget-metric",
  ".widget-scroll-area",
  ".vt-sized-control",
  ".widget-stepper",
  ".widget-pagination",
  ".widget-split-badge",
  ".widget-live-badge",
  ".widget-toggle-switch",
  ".widget-checkbox",
  ".widget-radio",
  // Reference-library primitives. These were missing from the first pass, which
  // left the spectrum badges — the densest use of the tone system on the page —
  // unguarded through the Phase 4 cascade rewrite.
  ".vt-spectrum-badge",
  ".vt-spectrum-badge.is-alphabetical",
  ".vt-spectrum-badge__icon",
  ".widget-reference-family",
  ".widget-reference-variants",
  ".widget-reference-variant",
  ".widget-tag",
  ".widget-badge",
]

// Properties whose value is derived from content rather than from the cascade,
// and so move between runs for reasons a stylesheet change did not cause. The
// dashboard wrapper's height is the sum of its mounted widgets', and a couple
// of those size themselves from data that arrives on its own schedule.
// Excluding it keeps the diff meaningful; every other property on that element
// is still compared.
const IGNORED_PROPERTIES = {
  ".dashboard-barrier": ["height"],
}

// Widths chosen from the size buckets in storage.ts: a 24-col grid at 1440
// gives roughly these widget widths, plus the mobile case where every bucket
// collapses to full width.
const VIEWPORTS = [
  { label: "desktop-1440", width: 1440, height: 1000 },
  { label: "laptop-1180", width: 1180, height: 900 },
  { label: "tablet-834", width: 834, height: 1112 },
  { label: "mobile-390", width: 390, height: 844 },
]

const preview = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
  // Own process group: npx spawns vite as a grandchild, so killing the direct
  // child alone leaves the server holding the port.
  detached: true,
})
// Drain both pipes. A full pipe buffer blocks the child, which then stops
// serving mid-run and surfaces as a connection refused on the next navigation.
const previewLog = []
preview.stdout.on("data", (d) => previewLog.push(String(d)))
preview.stderr.on("data", (d) => previewLog.push(String(d)))
preview.on("exit", (code, signal) => {
  if (code !== null && code !== 0) {
    console.error(`vite preview exited with ${code}${signal ? ` (${signal})` : ""}:`)
    console.error(previewLog.join("").trim())
  }
})
let previewStopped = false
const stopPreview = () => {
  if (previewStopped) return
  previewStopped = true
  try { process.kill(-preview.pid, "SIGTERM") } catch { /* already gone */ }
}
process.on("exit", stopPreview)
process.on("SIGINT", () => { stopPreview(); process.exit(130) })
process.on("SIGTERM", () => { stopPreview(); process.exit(143) })
process.on("uncaughtException", (err) => {
  stopPreview()
  console.error(err?.message || err)
  process.exit(1)
})

const waitForServer = async () => {
  for (let i = 0; i < 60; i += 1) {
    if (preview.exitCode !== null) {
      throw new Error(`vite preview exited early (${preview.exitCode}):\n${previewLog.join("").trim()}`)
    }
    try {
      const res = await fetch(`http://localhost:${PORT}/`)
      if (res.ok) return
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`vite preview did not come up on :${PORT}:\n${previewLog.join("").trim()}`)
}

await waitForServer()

const browser = await chromium.launch({
  headless: true,
  // The repo pins playwright 1.62.1 but the image ships build 1194.
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
})

// Most primitives only exist inside the UI Reference Library widget, which is
// not in the default visible set. Without seeding it, the whole tone/height
// lattice and every v12 matrix control would go unguarded through a cascade
// rewrite. Seeding a layout that shows it is what puts them on the page.
const SEEDED_LAYOUT = JSON.stringify({
  schemaVersion: 9,
  locked: false,
  order: ["ui-reference-library", "kpi-cluster", "channel-overview"],
  hidden: [],
  instances: {
    "ui-reference-library": { collapsed: false, size: "full", height: "massive" },
  },
})

const snapshot = {}
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await context.newPage()
  await page.addInitScript(
    ([key, value]) => {
      try { window.localStorage.setItem(key, value) } catch { /* storage blocked */ }
    },
    ["vt_dashboard_layout_v9", SEEDED_LAYOUT],
  )
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(2000)

  // Widgets below the fold are mounted by IntersectionObserver, so measuring
  // straight after load captures however many happened to be ready — which
  // makes container heights and counts differ run to run. Scroll the whole
  // page to force every deferred widget to mount, then come back to the top.
  // This also puts more primitives on the page than a first-screen capture.
  await page.evaluate(async () => {
    const scroller =
      document.querySelector("main.vt-adaptive-main") ||
      document.scrollingElement ||
      document.documentElement
    const step = window.innerHeight * 0.8
    const limit = scroller.scrollHeight
    for (let y = 0; y < limit + step; y += step) {
      scroller.scrollTop = y
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    scroller.scrollTop = 0
    window.scrollTo(0, 0)
  })
  // Settle: last mounts, lazy chunks, and any entry animation.
  await page.waitForTimeout(3000)
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))))

  snapshot[vp.label] = await page.evaluate(
    ({ selectors, properties }) => {
      const out = {}
      for (const selector of selectors) {
        const el = document.querySelector(selector)
        if (!el) { out[selector] = null; continue }
        const styles = getComputedStyle(el)
        const entry = {}
        for (const prop of properties) {
          // Round sub-pixel values. Font loading and scrollbar width move them
          // by hundredths, which is noise, not a cascade change.
          entry[prop] = styles
            .getPropertyValue(prop)
            .replace(/-?\d+\.\d+px/g, (m) => `${Math.round(parseFloat(m))}px`)
        }
        out[selector] = entry
      }
      out["__counts"] = {
        widgets: document.querySelectorAll(".vt-widget").length,
        slots: document.querySelectorAll(".dashboard-widget-slot").length,
      }
      // A horizontal scrollbar on the page body is always a layout bug.
      out["__overflow"] = {
        documentScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        overflows: document.documentElement.scrollWidth > window.innerWidth,
      }
      return out
    },
    { selectors: SELECTORS, properties: PROPERTIES },
  )
  await context.close()
}
await browser.close()
stopPreview()

if (!check) {
  writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`wrote ${snapshotPath}`)
  const missing = []
  for (const [vp, entries] of Object.entries(snapshot)) {
    for (const [sel, value] of Object.entries(entries)) {
      if (value === null) missing.push(`${vp} ${sel}`)
    }
  }
  if (missing.length) console.log(`\nSelectors not present on the page (recorded as absent):\n  ${missing.join("\n  ")}`)
  process.exit(0)
}

if (!existsSync(snapshotPath)) {
  console.error(`No snapshot at ${snapshotPath}. Run without --check to create one.`)
  process.exit(1)
}

const prev = JSON.parse(readFileSync(snapshotPath, "utf8"))
const diffs = []
for (const [vp, entries] of Object.entries(snapshot)) {
  const before = prev[vp]
  if (!before) { diffs.push(`${vp}: viewport missing from snapshot`); continue }
  for (const [sel, value] of Object.entries(entries)) {
    const was = before[sel]
    if (was === undefined) { diffs.push(`${vp} ${sel}: not in snapshot`); continue }
    if (was === null || value === null) {
      if (was !== value) diffs.push(`${vp} ${sel}: ${was === null ? "absent -> present" : "present -> absent"}`)
      continue
    }
    // How many widgets have mounted depends on IntersectionObserver timing, so
    // the count is informational. Overflow is not — that is a real layout fact.
    if (sel === "__counts") continue
    const ignored = IGNORED_PROPERTIES[sel] || []
    for (const [prop, now] of Object.entries(value)) {
      if (ignored.includes(prop)) continue
      if (was[prop] !== now) diffs.push(`${vp} ${sel} { ${prop}: ${was[prop]} -> ${now} }`)
    }
  }
}

if (diffs.length) {
  console.error(`Computed-style changes against the snapshot:\n  ${diffs.join("\n  ")}`)
  console.error(`\n${diffs.length} difference(s). Each is a cascade change to justify or fix.`)
  process.exit(1)
}
console.log("No computed-style changes against the snapshot.")
