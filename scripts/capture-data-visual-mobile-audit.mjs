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

/**
 * `bucket` mirrors the composition the app itself resolves from its media
 * queries (`dataVisualCanvasGeometry.ts`), so the harness asserts against the
 * same profile the renderer used rather than re-deriving one.
 */
const VIEWPORTS = [
 { label: "portrait-375x667", width: 375, height: 667, orientation: "portrait", bucket: "portrait" },
 { label: "portrait-390x844", width: 390, height: 844, orientation: "portrait", bucket: "portrait" },
 { label: "landscape-667x375", width: 667, height: 375, orientation: "landscape", bucket: "landscape" },
 { label: "landscape-844x390", width: 844, height: 390, orientation: "landscape", bucket: "landscape" },
 { label: "desktop-1440x900", width: 1440, height: 900, orientation: "landscape", bucket: "desktop" },
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

/** One decimal place, null-safe — keeps the metrics file diffable. */
const round = (value) => (typeof value === "number" && Number.isFinite(value) ? Math.round(value * 10) / 10 : value)

const expectedRatio = (aspect) => (aspect === "16:9" ? 16 / 9 : aspect === "1:1" ? 1 : null)

/**
 * Mark floors, mirrored from `dataVisualModuleContract.ts`. Scaling a mark is a
 * multiplier, not a licence to draw something nobody can read or hit, so the
 * harness enforces the same floors the renderers clamp to. Desktop is exempt
 * from the touch floor — it has a pointer.
 */
const MARK_FLOORS = {
 touchTarget: 24,
 fontSize: 8,
}

/** Tolerance for sub-pixel rounding when comparing against a floor. */
const FLOOR_EPSILON = 0.5

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
  const visible = (element) => {
   const rect = element.getBoundingClientRect()
   if (rect.width < 0.5 || rect.height < 0.5) return false
   const style = getComputedStyle(element)
   return style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0.01
  }

  /**
   * Mark geometry inside one canvas.
   *
   * Interactive marks are found by behaviour rather than by tag, so this works
   * across SVG marks, DOM tiles and recharts symbols alike: anything inside the
   * canvas that a reader can tap — `cursor: pointer`, a button, or a focusable
   * element. Primary marks are counted only where the renderer opts in with
   * `data-vt-mark`, so an un-annotated module reports null instead of a guess.
   */
  const measureMarks = (canvas) => {
   const all = Array.from(canvas.querySelectorAll("*"))

   const isInteractive = (element) => {
    if (!visible(element)) return false
    if (element.tagName === "BUTTON") return true
    if (element.hasAttribute("tabindex") && element.getAttribute("tabindex") !== "-1") return true
    return getComputedStyle(element).cursor === "pointer"
   }
   // `cursor: pointer` inherits, so a slice's percentage label looks interactive
   // while the real tap target is the slice around it. Measure the OUTERMOST
   // interactive element in each chain — the box a finger actually hits.
   const interactive = all.filter((element) => {
    if (!isInteractive(element)) return false
    for (let parent = element.parentElement; parent && parent !== canvas; parent = parent.parentElement) {
     if (isInteractive(parent)) return false
    }
    return true
   })
   const interactiveBoxes = interactive.map((element) => {
    const rect = element.getBoundingClientRect()
    return { width: rect.width, height: rect.height, edge: Math.min(rect.width, rect.height) }
   })

   const fontSizes = all
    .filter((element) => visible(element)
     && Array.from(element.childNodes).some((node) => node.nodeType === 3 && node.textContent.trim().length > 0))
    .map((element) => Number.parseFloat(getComputedStyle(element).fontSize))
    .filter((size) => Number.isFinite(size) && size > 0)

   const annotated = all.filter((element) => element.hasAttribute("data-vt-mark") && visible(element))
   const radii = Array.from(canvas.querySelectorAll("circle"))
    .filter(visible)
    .map((circle) => Number.parseFloat(circle.getAttribute("r") || "0"))
    .filter((radius) => Number.isFinite(radius) && radius > 0)
    .sort((a, b) => a - b)

   const panels = Array.from(canvas.querySelectorAll("[data-vt-data-visual-panel]")).filter(visible)

   return {
    interactiveCount: interactiveBoxes.length,
    smallestInteractiveEdge: interactiveBoxes.length
     ? Math.min(...interactiveBoxes.map((box) => box.edge))
     : null,
    smallestFontSize: fontSizes.length ? Math.min(...fontSizes) : null,
    markCount: annotated.length > 0 ? annotated.length : null,
    markKinds: Array.from(new Set(annotated.map((element) => element.getAttribute("data-vt-mark")))).sort(),
    panelCount: panels.length > 0 ? panels.length : null,
    circleRadii: radii.length
     ? { min: radii[0], median: radii[Math.floor(radii.length / 2)], max: radii[radii.length - 1], count: radii.length }
     : null,
   }
  }

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
     landscapeAspect: canvas ? canvas.getAttribute("data-vt-canvas-landscape-aspect") : null,
     // The box the canvas actually has to fill — its own parent, so container
     // padding and borders are not counted as width the canvas failed to take.
     availableWidth: canvas && canvas.parentElement ? canvas.parentElement.clientWidth : null,
     overflowPolicy: module ? module.getAttribute("data-vt-data-visual-overflow") : null,
     plotAspect: plot ? plot.getAttribute("data-vt-data-visual-plot-aspect") : null,
     section: { width: sectionRect.width, height: sectionRect.height },
     canvas: canvasRect ? { width: canvasRect.width, height: canvasRect.height } : null,
     plot: plotRect ? { width: plotRect.width, height: plotRect.height } : null,
     sectionScrollWidth: section.scrollWidth,
     sectionClientWidth: section.clientWidth,
     marks: canvas ? measureMarks(canvas) : null,
    }
   }),
  }
 })

const checkVisual = (visual, viewport, contracts) => {
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

 /*
  * On a landscape phone a canvas may declare that it FILLS its box rather than
  * holding a ratio, so there the contract to check is "did it actually take the
  * width that was going spare", not "did it keep 16:9".
  */
 const fillsLandscape = viewport.bucket === "landscape" && visual.landscapeAspect === "fill"
 if (fillsLandscape) {
  const available = Math.min(visual.availableWidth ?? canvas.width, canvas.height * 4)
  if (canvas.width + 1 < available) {
   failures.push(`${label}: canvas is ${canvas.width.toFixed(1)}px wide but ${available.toFixed(1)}px was available — it is meant to fill, not letterbox`)
  }
 } else {
  // Declared aspect is the aspect the browser actually produced.
  const ratio = expectedRatio(visual.declaredAspect)
  if (ratio) {
   const actual = canvas.width / canvas.height
   const drift = Math.abs(actual - ratio) / ratio
   if (drift > ASPECT_TOLERANCE) {
    failures.push(`${label}: canvas ratio ${actual.toFixed(3)} drifted ${(drift * 100).toFixed(1)}% from ${visual.declaredAspect}`)
   }
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

 failures.push(...checkMarks(visual, viewport, label, contracts))

 return failures
}

/**
 * Mark-level assertions.
 *
 * The canvas checks above prove the box is right; these prove what is drawn
 * inside it is readable and reachable. Where a density budget and a floor
 * cannot both hold, density is what must give — so a budget breach and a floor
 * breach are both failures, and the messages say which knob to turn.
 */
const checkMarks = (visual, viewport, label, contracts) => {
 const failures = []
 const marks = visual.marks
 if (!marks) return failures

 const bucket = viewport.bucket
 const contract = contracts[visual.id]

 // Dense-field modules declare `markInteraction: "field"`: the mark is read by
 // colour or position and tapping it is an enhancement over hover/focus and the
 // active-context readout, so the touch floor would force a density that
 // destroys the pattern. The size is still recorded in mark-metrics.json.
 const fieldMarks = contract?.markInteraction === "field"
 if (!fieldMarks
  && bucket !== "desktop"
  && marks.smallestInteractiveEdge !== null
  && marks.smallestInteractiveEdge + FLOOR_EPSILON < MARK_FLOORS.touchTarget) {
  failures.push(`${label}: smallest tap target is ${marks.smallestInteractiveEdge.toFixed(1)}px, below the ${MARK_FLOORS.touchTarget}px touch floor — reduce density rather than mark size`)
 }

 if (marks.smallestFontSize !== null && marks.smallestFontSize + FLOOR_EPSILON < MARK_FLOORS.fontSize) {
  failures.push(`${label}: smallest rendered text is ${marks.smallestFontSize.toFixed(1)}px, below the ${MARK_FLOORS.fontSize}px legibility floor`)
 }

 const densityBudget = contract?.densityProfile?.[bucket]
 if (marks.markCount !== null && densityBudget !== undefined && marks.markCount > densityBudget) {
  failures.push(`${label}: drew ${marks.markCount} primary marks against a density budget of ${densityBudget}`)
 }

 const panelBudget = contract?.panelBudget?.[bucket]
 if (marks.panelCount !== null && panelBudget !== undefined && marks.panelCount > panelBudget) {
  failures.push(`${label}: drew ${marks.panelCount} panels against a panel budget of ${panelBudget}`)
 }

 return failures
}

/**
 * Captures one visual, including whatever sits below the fold.
 *
 * A module is deliberately allowed to be taller than a landscape phone screen:
 * the canvas and the chrome above it fit, and the bottom section (guides, keys,
 * legends) scrolls. Chromium only rasterises what has actually been on screen,
 * so an element screenshot of a taller-than-viewport module comes back blank
 * below the fold — which silently turns "I did not look" into "there was
 * nothing there". Instead the module is photographed a screenful at a time and
 * the strips are stitched back together at full resolution.
 */
const captureVisual = async (browser, page, viewport, id, file) => {
 const locator = page.locator(`[data-vt-audit-visual="${id}"]`)
 const box = await locator.boundingBox()
 if (!box) throw new Error("element has no box")
 if (box.height <= viewport.height) {
  await locator.screenshot({ path: file })
  return
 }

 const sliceCount = Math.ceil(box.height / viewport.height)
 const slices = []
 for (let index = 0; index < sliceCount; index += 1) {
  // The bench scrolls inside its own container, not the document, so move the
  // element by the delta between where its top currently is and where this
  // strip wants it — then read the offset back rather than assuming a position.
  const wanted = -Math.min(index * viewport.height, box.height - viewport.height)
  const offset = await page.evaluate(({ selector, wantedTop }) => {
   const element = document.querySelector(selector)
   if (!element) return 0
   const scroller = element.closest("[data-vt-data-visual-audit]") || document.scrollingElement
   scroller.scrollTop += element.getBoundingClientRect().top - wantedTop
   return element.getBoundingClientRect().top
  }, { selector: `[data-vt-audit-visual="${id}"]`, wantedTop: wanted })
  await page.waitForTimeout(350)
  slices.push({ buffer: await page.screenshot(), offset })
 }

 const html = `<!doctype html><meta charset="utf-8"><style>
  body { margin: 0; background: #fff }
  #sheet { position: relative; width: ${box.width}px; height: ${box.height}px; overflow: hidden }
  #sheet img { position: absolute; width: ${viewport.width}px; height: ${viewport.height}px; left: ${-box.x}px }
 </style><div id="sheet">${
  // Each strip shows the page from its own scroll position. The element's top
  // sat at `offset` in that viewport, so the strip belongs at `-offset` in a
  // sheet whose origin is the element's top-left corner.
  slices.map((slice) => `<img style="top:${-slice.offset}px" src="data:image/png;base64,${slice.buffer.toString("base64")}" />`).join("")
 }</div>`

 const context = await browser.newContext({
  viewport: { width: Math.ceil(box.width), height: Math.ceil(box.height) },
  deviceScaleFactor: 2,
 })
 try {
  const stitcher = await context.newPage()
  await stitcher.setContent(html, { waitUntil: "load" })
  await stitcher.locator("#sheet").screenshot({ path: file })
 } finally {
  await context.close()
 }
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

   const openBench = async (query) => {
    const url = `${base}${auditPath}${query}`
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 })
    if (!response || response.status() >= 400) {
     failures.push(`${viewport.label}: ${url} returned ${response ? response.status() : "no response"}`)
     return false
    }
    await page.waitForSelector("[data-vt-audit-visual]", { timeout: 30_000 })
    // Hero intros are time-based and resize their module as they play; let them
    // settle so a measurement and the frame beside it describe the same layout.
    await page.waitForTimeout(2_500)
    return true
   }

   if (!(await openBench(""))) {
    await context.close()
    continue
   }

   // The bench page publishes the registered contracts, so the harness asserts
   // against the same source of truth the renderers read — no second copy.
   const contracts = await page.evaluate(() => window.__VT_DATA_VISUAL_CONTRACTS__ || {})
   if (Object.keys(contracts).length === 0) {
    failures.push(`${viewport.label}: audit bench published no Data Visual contracts`)
   }

   const registeredIds = (await measure(page)).visuals.map((visual) => visual.id)
   const entries = []

   /*
    * Each visual is captured on its own page load (`?only=<id>`).
    *
    * Capturing them from one stacked page looked cheaper, but an element
    * screenshot there is taken against a bounding box computed before
    * Playwright scrolls — and the hero intro that fires on scroll resizes the
    * module underneath it. The result was frames showing the WRONG visual's
    * content while the numbers beside them were correct. A screenshot that
    * cannot be trusted is worse than no screenshot, so each visual now gets a
    * page containing only itself: nothing above it to shift, nothing to scroll.
    */
   for (const id of registeredIds) {
    if (!(await openBench(`&only=${encodeURIComponent(id)}`))) continue

    const isolated = await measure(page)
    const visual = isolated.visuals.find((entry) => entry.id === id)
    if (!visual) {
     failures.push(`${viewport.label}/${id}: did not render in isolation`)
     continue
    }

    if (isolated.pageScrollWidth > isolated.pageClientWidth + 1) {
     failures.push(`${viewport.label}/${id}: page scrolls horizontally (${isolated.pageScrollWidth} > ${isolated.pageClientWidth})`)
    }

    const file = path.join(dir, `${id}.png`)
    try {
     await captureVisual(browser, page, viewport, id, file)
    } catch (error) {
     failures.push(`${viewport.label}/${id}: screenshot failed — ${error.message}`)
     continue
    }

    const visualFailures = checkVisual(visual, viewport, contracts)
    failures.push(...visualFailures)
    entries.push({
     ...visual,
     markInteraction: contracts[id]?.markInteraction ?? "discrete",
     file,
     failures: visualFailures,
    })
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

 // Mark metrics travel as their own small, diffable file: a change in mark
 // density or size shows up as a reviewable diff instead of being spotted by
 // eye across 35 screenshots.
 const markMetrics = {
  capturedAt: manifest.capturedAt,
  floors: MARK_FLOORS,
  viewports: manifest.viewports.map((entry) => ({
   viewport: entry.label,
   bucket: entry.bucket,
   visuals: entry.visuals.map((visual) => ({
    id: visual.id,
    canvas: visual.canvas ? { width: round(visual.canvas.width), height: round(visual.canvas.height) } : null,
    ...(visual.marks
     ? {
      markInteraction: visual.markInteraction,
      interactiveCount: visual.marks.interactiveCount,
      smallestInteractiveEdge: round(visual.marks.smallestInteractiveEdge),
      smallestFontSize: round(visual.marks.smallestFontSize),
      markCount: visual.marks.markCount,
      markKinds: visual.marks.markKinds,
      panelCount: visual.marks.panelCount,
      circleRadii: visual.marks.circleRadii
       ? {
        count: visual.marks.circleRadii.count,
        min: round(visual.marks.circleRadii.min),
        median: round(visual.marks.circleRadii.median),
        max: round(visual.marks.circleRadii.max),
       }
       : null,
     }
     : {}),
   })),
  })),
 }
 await fs.writeFile(path.join(outRoot, "mark-metrics.json"), `${JSON.stringify(markMetrics, null, 2)}\n`)

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
