#!/usr/bin/env node
/**
 * Contact sheets for the Data Visual mobile audit.
 *
 * 35 individual PNGs are the record, but they are awkward to review. This lays
 * each viewport's visuals out on one sheet — at true pixel size, labelled, with
 * the measured canvas box and any contract failure printed under each — so a
 * whole composition can be taken in at a glance.
 *
 * Reads what the audit already produced; it never re-renders the app, so a
 * sheet can only ever show what the audit actually captured.
 */
import { chromium } from "playwright"
import fs from "node:fs/promises"
import path from "node:path"

const outRoot = process.env.AUDIT_OUT_DIR || "artifacts/data-visual-mobile-audit"
const sheetDir = path.join(outRoot, "contact-sheets")

const launchOptions = { headless: true }
if (process.env.CHROMIUM_EXECUTABLE_PATH) launchOptions.executablePath = process.env.CHROMIUM_EXECUTABLE_PATH

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))

const run = async () => {
 const manifest = JSON.parse(await fs.readFile(path.join(outRoot, "manifest.json"), "utf8"))
 const metrics = JSON.parse(await fs.readFile(path.join(outRoot, "mark-metrics.json"), "utf8"))
 await fs.mkdir(sheetDir, { recursive: true })

 const browser = await chromium.launch(launchOptions)
 const written = []

 try {
  for (const viewport of manifest.viewports) {
   const viewportMetrics = metrics.viewports.find((entry) => entry.viewport === viewport.label)
   const cards = await Promise.all(viewport.visuals.map(async (visual) => {
    const buffer = await fs.readFile(visual.file)
    const mark = viewportMetrics?.visuals.find((entry) => entry.id === visual.id)
    const canvas = visual.canvas ? `${Math.round(visual.canvas.width)}x${Math.round(visual.canvas.height)}` : "no canvas"
    const detail = [
     `canvas ${canvas}`,
     mark?.smallestFontSize != null ? `min font ${mark.smallestFontSize}px` : null,
     mark?.circleRadii ? `r ${mark.circleRadii.min}-${mark.circleRadii.max}` : null,
     mark?.panelCount != null ? `${mark.panelCount} panel(s)` : null,
     mark?.markInteraction === "field" ? "field marks" : null,
    ].filter(Boolean).join(" · ")
    const failures = (visual.failures || []).map((failure) => `<li>${escapeHtml(failure)}</li>`).join("")
    return `
     <figure>
      <figcaption>
       <strong>${escapeHtml(visual.id)}</strong>
       <span>${escapeHtml(detail)}</span>
       ${failures ? `<ul class="fail">${failures}</ul>` : ""}
      </figcaption>
      <img src="data:image/png;base64,${buffer.toString("base64")}" alt="${escapeHtml(visual.id)}" />
     </figure>`
   }))

   const html = `<!doctype html><meta charset="utf-8"><style>
    :root { color-scheme: light }
    body { margin: 0; padding: 20px; background: #efeee9; font: 12px/1.35 ui-sans-serif, system-ui, sans-serif; color: #111 }
    h1 { margin: 0 0 4px; font-size: 20px; letter-spacing: .04em; text-transform: uppercase }
    p.sub { margin: 0 0 18px; color: #555 }
    .grid { display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start }
    figure { margin: 0; background: #fff; border: 2px solid #111; border-radius: 10px; overflow: hidden; max-width: ${Math.min(viewport.width, 760)}px }
    figcaption { padding: 7px 9px; border-bottom: 2px solid #111; background: #fafafa }
    figcaption strong { display: block; font-size: 13px; text-transform: uppercase; letter-spacing: .03em }
    figcaption span { color: #555 }
    ul.fail { margin: 5px 0 0; padding-left: 16px; color: #b00020 }
    img { display: block; width: ${Math.min(viewport.width, 760)}px; height: auto }
   </style>
   <h1>${escapeHtml(viewport.label)}</h1>
   <p class="sub">${viewport.width}x${viewport.height} · ${escapeHtml(viewport.bucket)} composition · captured ${escapeHtml(manifest.capturedAt)}</p>
   <div class="grid">${cards.join("")}</div>`

   const context = await browser.newContext({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 })
   const page = await context.newPage()
   await page.setContent(html, { waitUntil: "load" })
   const file = path.join(sheetDir, `${viewport.label}.png`)
   await page.screenshot({ path: file, fullPage: true })
   await context.close()
   written.push(file)
  }
 } finally {
  await browser.close()
 }

 console.log(`Wrote ${written.length} contact sheet(s):`)
 written.forEach((file) => console.log(`  ${file}`))
}

await run()
