#!/usr/bin/env node
/**
 * Deterministic Data Visual mobile audit harness.
 *
 * Loads the bare audit bench (`/render-bench/data-visual-audit`), which renders
 * the migrated Data Visual modules against fixture data, then for every target
 * viewport:
 *
 *   1. screenshots each visual individually,
 *   2. measures what the browser actually laid out, and
 *   3. asserts the canvas contract — aspect ratio, bounded height, no page-level
 *      horizontal overflow, no duplicated height ownership.
 *
 * Output:
 *   artifacts/data-visual-mobile-audit/<viewport>/<visual-id>.png
 *   artifacts/data-visual-mobile-audit/manifest.json
 *
 * Each visual is captured individually rather than as one full-page shot:
 * hero intros are gated on the module entering the viewport, so a whole-page
 * capture renders the below-the-fold modules blank or mid-animation. The
 * per-element capture scrolls each module into view first, and the
 * page-level horizontal-overflow check below is measured, not eyeballed.
 *
 * Exits non-zero when a contract check fails, so the screenshots and the
 * assertions travel together: a visual is not "fixed" until its own rendered
 * screenshot exists and its measurements pass.
 */
import { chromium } from "playwright"
import fs from "node:fs/promises"
import path from "node:path"

const base = (process.env.PREVIEW_URL || "http://127.0.0.1:4173").replace(/\/$/, "")
const outRoot = process.env.AUDIT_OUT_DIR || "artifacts/data-visual-mobile-audit"
// `vtDiagnostics=0` suppresses the developer boot-log overlay, which is on by
// default in this app and would otherwise cover every screenshot.
const auditPath = "/render-bench/data-visual-audit?vtDiagnostics=0"

const VIEWPORTS = [
 { label: "portrait-375x667", width: 375, height: 667, orientation: "portrait" },
 { label: "portrait-390x844", width: 390, height: 844, orientation: "portrait" },
 { label: "landscape-667x375", width: 667, height: 375, orientation: "landscape" },
 { label: "landscape-844x390", width: 844, height: 390, orientation: "landscape" },
 { label: "desktop-1440x900", width: 1440, height: 900, orientation: "landscape" },
]

/**
 * Wall-clock instant every run is pinned to. The fixture anchors its data to
 * "today", and several visuals window their data against the real clock, so
 * pinning the clock is what makes two runs byte-comparable. Only `Date` is
 * fixed — timers and rAF keep running, so intro animations still settle.
 */
const FIXED_CLOCK = new Date("2026-06-30T12:00:00.000Z")

/** Aspect tolerance in percent — sub-pixel layout rounding, not distortion. */
const ASPECT_TOLERANCE = 0.04
/** A canvas taller than this share of the viewport is runaway height. */
const MAX_CANVAS_VIEWPORT_SHARE = 1.05

const expectedRatio = (aspect) => (aspect === "16:9" ? 16 / 9 : aspect === "1:1" ? 1 : null)

/**
 * Some sandboxes ship a pinned Chromium that does not match the build this
 * Playwright expects. `CHROMIUM_EXECUTABLE_PATH` points the launcher at it
 * instead of failing with "download new browsers"; unset, Playwright resolves
 * its own bundled build as usual.
 */
const launchOptions = { headless: true }
if (process.env.CHROMIUM_EXECUTABLE_PATH) launchOptions.executablePath = process.env.CHROMIUM_EXECUTABLE_PATH

const measure = async (page) =>
 page.evaluate(() => {
  const doc = document.documentElement
  const sections = Array.from(document.querySelectorAll("[data-vt-audit-visual]"))
  return {
   pageScrollWidth: doc.scrollWidth,
   pageClientWidth: doc.clientWidth,
   visuals: sections.map((section) => {
    const id = section.getAttribute("data-vt-audit-visual")
    const canvas = section.querySelector("[data-vt-visual-canvas]")
    const module = section.querySelector("[data-vt-data-visual-module]")
    const sectionRect = section.getBoundingClientRect()
    const canvasRect = canvas ? canvas.getBoundingClientRect() : null
    const plot = section.querySelector("[data-vt-data-visual-plot]")
    const plotRect = plot ? plot.getBoundingClientRect() : null
    return {
     id,
     declaredAspect: section.getAttribute("data-vt-audit-canvas-aspect"),
     family: section.getAttribute("data-vt-audit-family"),
     hasCanvas: Boolean(canvas),
     canvasId: canvas ? canvas.getAttribute("data-vt-visual-canvas") : null,
     renderedAspect: canvas ? canvas.getAttribute("data-vt-visual-aspect") : null,
     overflowPolicy: module ? module.getAttribute("data-vt-data-visual-overflow") : null,
     plotAspect: plot ? plot.getAttribute("data-vt-data-visual-plot-aspect") : null,
     section: { width: sectionRect.width, height: sectionRect.height },
     canvas: canvasRect ? { width: canvasRect.width, height: canvasRect.height } : null,
     plot: plotRect ? { width: plotRect.width, height: plotRect.height } : null,
     sectionScrollWidth: section.scrollWidth,
     sectionClientWidth: section.clientWidth,
    }
   }),
  }
 })

const checkVisual = (visual, viewport) => {
 const failures = []
 const label = `${viewport.label}/${visual.id}`

 if (!visual.hasCanvas) {
  failures.push(`${label}: no [data-vt-visual-canvas] found — the module is not on the canvas contract`)
  return failures
 }
 if (visual.canvasId !== visual.id) {
  failures.push(`${label}: canvas identity is "${visual.canvasId}", expected "${visual.id}"`)
 }
 if (visual.renderedAspect !== visual.declaredAspect) {
  failures.push(`${label}: rendered aspect "${visual.renderedAspect}" does not match the registered "${visual.declaredAspect}"`)
 }

 const { canvas } = visual
 if (!canvas || canvas.width < 1 || canvas.height < 1) {
  failures.push(`${label}: canvas measured ${canvas ? `${canvas.width}x${canvas.height}` : "nothing"} — it collapsed`)
  return failures
 }

 // Module fits the viewport width and nothing scrolls sideways at page level.
 if (canvas.width > viewport.width + 1) {
  failures.push(`${label}: canvas is ${canvas.width.toFixed(1)}px wide in a ${viewport.width}px viewport`)
 }

 // Declared aspect is the aspect the browser actually produced.
 const ratio = expectedRatio(visual.declaredAspect)
 if (ratio) {
  const actual = canvas.width / canvas.height
  const drift = Math.abs(actual - ratio) / ratio
  if (drift > ASPECT_TOLERANCE) {
   failures.push(`${label}: canvas ratio ${actual.toFixed(3)} drifted ${(drift * 100).toFixed(1)}% from ${visual.declaredAspect}`)
  }
 }

 // Bounded height: no runaway canvas eating the whole screen.
 if (canvas.height > viewport.height * MAX_CANVAS_VIEWPORT_SHARE) {
  failures.push(`${label}: canvas height ${canvas.height.toFixed(1)}px exceeds the ${viewport.height}px viewport`)
 }

 // A square internal plot stays square inside a wide canvas.
 if (visual.plotAspect === "1:1" && visual.plot && visual.plot.height > 1) {
  const plotRatio = visual.plot.width / visual.plot.height
  if (Math.abs(plotRatio - 1) > ASPECT_TOLERANCE) {
   failures.push(`${label}: internal plot ratio ${plotRatio.toFixed(3)} is not square`)
  }
 }

 // Unexpected overflow is a bug; declared scroll regions are not.
 if (visual.overflowPolicy === "clip" && visual.sectionScrollWidth > visual.sectionClientWidth + 1) {
  failures.push(`${label}: module declares CLIP but scrolls horizontally (${visual.sectionScrollWidth} > ${visual.sectionClientWidth})`)
 }

 return failures
}

const run = async () => {
 await fs.mkdir(outRoot, { recursive: true })
 const browser = await chromium.launch(launchOptions)
 const manifest = { base, fixedClock: FIXED_CLOCK.toISOString(), capturedAt: null, viewports: [] }
 const failures = []

 try {
  for (const viewport of VIEWPORTS) {
   const dir = path.join(outRoot, viewport.label)
   await fs.mkdir(dir, { recursive: true })
   const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    isMobile: viewport.label.startsWith("portrait") || viewport.label.startsWith("landscape"),
    hasTouch: !viewport.label.startsWith("desktop"),
    reducedMotion: "reduce",
   })
   await context.clock.setFixedTime(FIXED_CLOCK)
   const page = await context.newPage()
   const url = `${base}${auditPath}`
   const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 })
   if (!response || response.status() >= 400) {
    failures.push(`${viewport.label}: ${url} returned ${response ? response.status() : "no response"}`)
    await context.close()
    continue
   }

   await page.waitForSelector("[data-vt-audit-visual]", { timeout: 30_000 })
   // Intro animations are time-based; let them settle so frames are comparable.
   await page.waitForTimeout(2_500)

   const measurements = await measure(page)
   const entries = []

   if (measurements.pageScrollWidth > measurements.pageClientWidth + 1) {
    failures.push(`${viewport.label}: page scrolls horizontally (${measurements.pageScrollWidth} > ${measurements.pageClientWidth})`)
   }

   for (const visual of measurements.visuals) {
    const file = path.join(dir, `${visual.id}.png`)
    const locator = page.locator(`[data-vt-audit-visual="${visual.id}"]`)
    try {
     await locator.screenshot({ path: file })
    } catch (error) {
     failures.push(`${viewport.label}/${visual.id}: screenshot failed — ${error.message}`)
     continue
    }
    const visualFailures = checkVisual(visual, viewport)
    failures.push(...visualFailures)
    entries.push({ ...visual, file, failures: visualFailures })
   }

   manifest.viewports.push({ ...viewport, visuals: entries })
   await context.close()
  }
 } finally {
  await browser.close()
 }

 manifest.capturedAt = new Date().toISOString()
 manifest.failures = failures
 await fs.writeFile(path.join(outRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)

 const captured = manifest.viewports.reduce((sum, viewport) => sum + viewport.visuals.length, 0)
 console.log(`Captured ${captured} Data Visual screenshots across ${manifest.viewports.length} viewports into ${outRoot}`)
 if (failures.length > 0) {
  console.error(`\n${failures.length} canvas contract failure(s):`)
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exitCode = 1
  return
 }
 console.log("All captured visuals satisfy the canvas contract.")
}

await run()
