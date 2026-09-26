import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173"
const outDir = "artifacts/widget-preconsolidation"
await mkdir(outDir, { recursive: true })

const SEEDED_LAYOUT = JSON.stringify({
  schemaVersion: 9,
  locked: false,
  order: [
    "app-verification-explainer",
    "daily-oracle",
    "system-micro-stack",
    "opportunity-radar",
    "comment-replier",
    "revenue-chart",
    "ui-reference-library",
  ],
  hidden: [],
  instances: {
    "app-verification-explainer": { collapsed: false, size: "half", height: "medium" },
    "daily-oracle": { collapsed: false, size: "half", height: "tall" },
    "system-micro-stack": { collapsed: false, size: "quarter", height: "tall" },
    "opportunity-radar": { collapsed: false, size: "half", height: "tall" },
    "comment-replier": { collapsed: false, size: "half", height: "tall" },
    "revenue-chart": { collapsed: false, size: "half", height: "tall" },
    "ui-reference-library": { collapsed: false, size: "full", height: "massive" },
  },
})

const targets = [
  ["about-viewtube-geometry", "app-verification-explainer"],
  ["daily-oracle-geometry", "daily-oracle"],
  ["settings-dashboard", "system-micro-stack"],
  ["opportunity-preview", "opportunity-radar"],
  ["comment-preview", "comment-replier"],
  ["revenue-preview", "revenue-chart"],
  ["ui-reference-preview", "ui-reference-library"],
]

const browser = await chromium.launch({ headless: true })
const report = { baseUrl, captures: [], overflow: [] }

for (const viewport of [
  { label: "desktop", width: 1440, height: 1000 },
  { label: "phone", width: 390, height: 844 },
]) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
  const page = await context.newPage()
  await page.addInitScript(([key, value]) => {
    try { localStorage.setItem(key, value) } catch {}
  }, ["vt_dashboard_layout_v9", SEEDED_LAYOUT])

  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(2500)

  const pageOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    overflows: document.documentElement.scrollWidth > window.innerWidth + 1,
  }))
  report.overflow.push({ viewport: viewport.label, ...pageOverflow })
  if (pageOverflow.overflows) {
    throw new Error(`${viewport.label} page horizontally overflows: ${pageOverflow.scrollWidth}px > ${pageOverflow.innerWidth}px`)
  }

  for (const [name, id] of targets) {
    const widget = page.locator(`[data-widget-id="${id}"]`).first()
    await widget.scrollIntoViewIfNeeded()
    await page.waitForTimeout(650)

    if (id === "system-micro-stack" && name === "settings-dashboard") {
      await widget.screenshot({ path: `${outDir}/${viewport.label}-settings-dashboard.png` })
      const next = widget.getByRole("button", { name: "Next Settings control room page" })
      await next.evaluate((button) => button.click())
      await page.waitForTimeout(350)
      await widget.screenshot({ path: `${outDir}/${viewport.label}-settings-data-preview.png` })
      await widget.getByRole("button", { name: "Previous Settings control room page" }).evaluate((button) => button.click())
    } else if (id === "ui-reference-library") {
      const next = widget.getByRole("button", { name: "Next Reference section" })
      // CONTROLS -> SIZE -> MATRIX -> COMPOUND
      await next.evaluate((button) => button.click())
      await page.waitForTimeout(100)
      await next.evaluate((button) => button.click())
      await page.waitForTimeout(100)
      await next.evaluate((button) => button.click())
      await page.waitForTimeout(350)
      await widget.screenshot({ path: `${outDir}/${viewport.label}-ui-reference-preview-state.png` })

      // COMPOUND -> VIDEO. Open a large canonical selector and capture the full
      // viewport because its menu is intentionally portalled outside the widget.
      await next.evaluate((button) => button.click())
      await page.waitForTimeout(250)
      const videoSelect = widget.getByRole("button", { name: "default select video 38px" }).first()
      await videoSelect.scrollIntoViewIfNeeded()
      await videoSelect.evaluate((button) => button.click())
      await page.waitForTimeout(250)
      const portal = page.locator(".widget-video-select-menu.is-portalled").first()
      if (!(await portal.isVisible())) throw new Error(`${viewport.label} video selector portal did not open`)
      await page.screenshot({ path: `${outDir}/${viewport.label}-video-selector-portal.png`, fullPage: false })
      await videoSelect.evaluate((button) => button.click())
    } else {
      await widget.screenshot({ path: `${outDir}/${viewport.label}-${name}.png` })
    }

    const box = await widget.boundingBox()
    report.captures.push({ viewport: viewport.label, name, id, box })
  }

  for (const variant of [
    { label: "min", size: "quarter", height: "short" },
    { label: "max", size: "full", height: "xtall" },
  ]) {
    const layout = JSON.parse(SEEDED_LAYOUT)
    layout.instances["system-micro-stack"] = { collapsed: false, size: variant.size, height: variant.height }
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), ["vt_dashboard_layout_v9", JSON.stringify(layout)])
    await page.reload({ waitUntil: "networkidle", timeout: 60000 })
    await page.waitForTimeout(1200)
    const settings = page.locator('[data-widget-id="system-micro-stack"]').first()
    await settings.scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    await settings.screenshot({ path: `${outDir}/${viewport.label}-settings-${variant.label}-${variant.size}-${variant.height}.png` })
    const box = await settings.boundingBox()
    report.captures.push({ viewport: viewport.label, name: `settings-${variant.label}`, id: "system-micro-stack", box, size: variant.size, height: variant.height })
  }

  await context.close()
}

await browser.close()
await writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2) + "\n")
console.log(JSON.stringify(report, null, 2))
