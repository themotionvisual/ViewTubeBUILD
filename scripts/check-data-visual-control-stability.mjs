/**
 * Changing a setting must not resize a Data Visual's chrome.
 *
 * The controller column and the stat row sit beside and above the evidence
 * canvas, so anything in them that grows to fit its contents drags the canvas
 * with it: switch the treemap's metric from VIEWS to WATCH TIME and the stat
 * card widens, the row widens, and the title beside it is squeezed. Rows and
 * cards are therefore sized for the widest value they can ever show and hold
 * that width for every setting.
 *
 * This walks every element of each visual's chrome, steps every "next" control
 * it can find, and fails on anything whose width moved. Marks inside the plot
 * are excluded — they are supposed to change with the data.
 *
 *   node scripts/check-data-visual-control-stability.mjs
 *
 * Reads PREVIEW_URL (default http://127.0.0.1:4173) and, where the sandbox
 * ships a mismatched Chromium, CHROMIUM_EXECUTABLE_PATH.
 */

import { chromium } from "playwright"

const base = (process.env.PREVIEW_URL || "http://127.0.0.1:4173").replace(/\/$/, "")
const launchOptions = { headless: true }
if (process.env.CHROMIUM_EXECUTABLE_PATH) launchOptions.executablePath = process.env.CHROMIUM_EXECUTABLE_PATH

/** Sub-pixel layout noise; anything at or below this is not a resize. */
const TOLERANCE = 1
const STEPS = 8

const VISUALS = [
 "shorts-retention",
 "publish-optimal-clock",
 "clock-radial-burst",
 "heat-matrix",
 "content-treemap",
 "traffic-source-evolution",
 "engagement-pulse",
 "channel-progress",
]

const measure = (page) =>
 page.evaluate(() => {
  const root = document.querySelector("[data-vt-data-visual-module-root]")
  if (!root) return {}
  const canvas = root.querySelector("[data-vt-visual-canvas]")
  const pathOf = (el) => {
   const parts = []
   let node = el
   while (node && node !== root) {
    parts.unshift(`${node.tagName.toLowerCase()}[${[...node.parentElement.children].indexOf(node)}]`)
    node = node.parentElement
   }
   return parts.join(">")
  }
  const out = {}
  for (const el of root.querySelectorAll("*")) {
   // Marks are meant to move with the data; only chrome is under contract.
   if (el.closest("svg")) continue
   if (canvas && canvas.contains(el)) continue
   const width = el.getBoundingClientRect().width
   if (width > 0) out[pathOf(el)] = width
  }
  return out
 })

const step = (page) =>
 page.evaluate(() => {
  const buttons = [...document.querySelectorAll("button")]
   .filter((button) => /^(Next|Change)/.test(button.getAttribute("aria-label") || ""))
  buttons.forEach((button) => button.click())
  return buttons.length
 })

const run = async () => {
 const browser = await chromium.launch(launchOptions)
 const failures = []
 try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  for (const id of VISUALS) {
   await page.goto(`${base}/render-bench/data-visual-audit?only=${id}`, { waitUntil: "networkidle" })
   await page.waitForTimeout(900)
   const first = await measure(page)
   const moved = new Map()
   for (let i = 0; i < STEPS; i += 1) {
    if ((await step(page)) === 0) break
    await page.waitForTimeout(220)
    for (const [path, width] of Object.entries(await measure(page))) {
     const before = first[path]
     if (before === undefined || Math.abs(before - width) <= TOLERANCE) continue
     const seen = moved.get(path) || new Set([Math.round(before)])
     seen.add(Math.round(width))
     moved.set(path, seen)
    }
   }
   if (moved.size > 0) {
    const worst = [...moved.entries()].slice(0, 4)
     .map(([path, widths]) => `      ${[...widths].join(" -> ")}  ${path}`)
     .join("\n")
    failures.push(`${id}: ${moved.size} chrome element(s) resize when a setting changes\n${worst}`)
   }
   process.stdout.write(`${id.padEnd(26)} ${moved.size === 0 ? "stable" : `${moved.size} moved`}\n`)
  }
 } finally {
  await browser.close()
 }

 if (failures.length > 0) {
  console.error(`\nControl stability failures:\n${failures.join("\n")}`)
  process.exitCode = 1
  return
 }
 console.log("\nEvery visual holds its chrome width across settings.")
}

run().catch((error) => {
 console.error(error)
 process.exitCode = 1
})
