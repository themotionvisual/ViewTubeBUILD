import { chromium } from "playwright"
import fs from "node:fs/promises"

const base = process.env.PREVIEW_URL || process.env.VERCEL_URL || "http://localhost:5173"
const share = process.env.VERCEL_SHARE_URL || ""
const root = base.startsWith("http") ? base : `https://${base}`
const out = process.env.STUDIO_COMPONENT_CERT_OUT || "artifacts/studio-component-certification"
const requestedFamilies = new Set(
  (process.env.CERT_FAMILIES || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
)

const viewports = [
  { label: "desktop", width: 1440, height: 1000 },
  { label: "mobile", width: 390, height: 844 },
  { label: "mobile-landscape", width: 844, height: 390 },
]

const priorityStates = new Map([
  ["Split Menu", ["default", "hover", "focus", "open"]],
  ["Split Left Button", ["default", "hover", "focus"]],
  ["Split Search", ["default", "focus", "populated"]],
  ["Input Action", ["default", "focus", "populated"]],
  ["Tag Editor", ["default", "open", "populated"]],
  ["Slider", ["default", "focus", "changed"]],
  ["Range Slider", ["default", "focus", "changed"]],
  ["Settings Switch", ["default", "focus", "selected"]],
  ["Checkbox", ["default", "focus", "selected"]],
  ["Radio", ["default", "focus", "selected"]],
  ["Tooltip", ["default", "hover", "focus"]],
  ["Progress Value", ["default"]],
  ["Knob Dial", ["default", "focus", "changed"]],
  ["Tooltip Color", ["default", "hover", "focus"]],
  ["Hover Card", ["default", "hover", "focus"]],
  ["Controller Switch", ["default", "focus", "selected"]],
  ["LED Light", ["default"]],
  ["LED Dot", ["default"]],
  ["Horizontal Scrollbar", ["default"]],
  ["Vertical Scrollbar", ["default"]],
  ["Calendar", ["default", "selected"]],
  ["Loader", ["default"]],
  ["Loader Progress", ["default"]],
  ["Loader Split", ["default"]],
  ["Loader Orbit", ["default"]],
  ["Loader Bars", ["default"]],
  ["Tree View", ["default"]],
  ["Tooltip Visual Key", ["default", "hover", "focus"]],
  ["Skeleton Compact", ["default"]],
  ["Skeleton Media", ["default"]],
])

const geometryMinimumUnits = new Map([
  ["Split Left Button", 4.0],
  ["Split Menu", 4.6],
  ["Dropdown", 4.5],
  ["Select Menu", 4.5],
  ["Top Title Dropdown", 4.7],
  ["Text Input", 5.0],
  ["Textarea", 5.2],
  ["Split Search", 5.0],
  ["Number Field", 3.8],
  ["Input Action", 4.5],
  ["Stepper", 3.0],
  ["Slider", 5.1],
  ["Range Slider", 5.4],
])

const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const attrSelector = (name) => `[data-vt-family="${String(name).replaceAll('"', '\\"')}"]`

await fs.mkdir(out, { recursive: true })

const browser = await chromium.launch({ headless: true })
const manifest = {
  generatedAt: new Date().toISOString(),
  root,
  viewports,
  families: [],
  priorityStates: Object.fromEntries(priorityStates),
  captures: [],
  errors: [],
}

async function navigateToLibrary(page) {
  if (share) {
    try {
      await page.goto(share, { waitUntil: "networkidle", timeout: 45000 })
      await page.waitForTimeout(1000)
    } catch (error) {
      manifest.errors.push({ phase: "share-auth", message: error.message })
    }
  }

  const response = await page.goto(new URL("/studio", root).toString(), {
    waitUntil: "networkidle",
    timeout: 45000,
  })
  if (!response || response.status() >= 400) {
    throw new Error(`Studio route failed with status ${response?.status() ?? "unknown"}`)
  }

  await page.locator("#toolbox-ui-library").waitFor({ state: "visible", timeout: 30000 })

  for (const id of ["toolbox-ui-library-hardcoded", "toolbox-ui-library-primitive"]) {
    const track = page.locator(`#${id}`)
    const shell = track.locator('[data-vt-toolbox][data-vt-toolbox-level="main"]').first()
    const family = track.locator("[data-vt-family]").first()
    if (!(await family.count())) {
      await shell.locator(":scope > header").click()
    }
    await family.waitFor({ state: "attached", timeout: 30000 })
  }

  await page.waitForTimeout(250)
}

async function captureLocator(locator, file) {
  await locator.scrollIntoViewIfNeeded()
  await locator.screenshot({ path: file })
}

async function firstInteractive(level) {
  const candidates = level.locator(
    'input:not([type="hidden"]), textarea, button, [role="slider"], [tabindex]:not([tabindex="-1"])',
  )
  return candidates.first()
}

async function applyState(level, family, state) {
  const interactive = await firstInteractive(level)
  if (state === "default") return
  if (state === "hover") {
    if (await interactive.count()) await interactive.hover()
    return
  }
  if (state === "focus") {
    if (await interactive.count()) await interactive.focus()
    return
  }
  if (state === "populated") {
    const input = level.locator('input:not([type="range"]):not([type="hidden"]), textarea').first()
    if (await input.count()) {
      await input.fill(family === "Tag Editor" ? "AUSTERLITZ" : "NAPOLEON")
      return
    }
    const addTag = level.getByRole("button", { name: /add tag/i }).first()
    if (await addTag.count()) await addTag.click()
    const newTag = level.getByRole("textbox", { name: /new tag/i }).first()
    if (await newTag.count()) await newTag.fill("AUSTERLITZ")
    return
  }
  if (state === "selected") {
    if (family === "Calendar") {
      const day = level.getByRole("button", { name: "19" }).first()
      if (await day.count()) await day.click()
      return
    }
    if (await interactive.count()) await interactive.click()
    return
  }
  if (state === "open") {
    const addTag = level.getByRole("button", { name: /add tag/i }).first()
    if (family === "Tag Editor" && await addTag.count()) {
      await addTag.click()
      return
    }
    if (await interactive.count()) await interactive.click()
    return
  }
  if (state === "changed") {
    if (family === "Knob Dial") {
      const knob = level.locator('[role="slider"]').first()
      if (await knob.count()) {
        await knob.focus()
        await knob.press("ArrowRight")
      }
      return
    }
    const ranges = level.locator('input[type="range"]')
    const count = await ranges.count()
    for (let index = 0; index < count; index += 1) {
      await ranges.nth(index).evaluate((element, offset) => {
        const input = /** @type {HTMLInputElement} */ (element)
        const min = Number(input.min || 0)
        const max = Number(input.max || 100)
        const next = Math.min(max, Math.max(min, Number(input.value) + (offset === 0 ? 7 : -7)))
        input.value = String(next)
        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }, index)
    }
  }
}

async function inspectPrimitiveGeometry(family, familyName, viewport) {
  const minUnits = geometryMinimumUnits.get(familyName)
  if (!minUnits) return

  for (const levelName of ["l0", "l1", "l2"]) {
    const level = family.locator(`[data-level="${levelName}"]`).first()
    if (!(await level.count())) continue
    const root = level.locator("[data-vt-control-level]").first()
    if (!(await root.count())) continue

    const geometry = await root.evaluate((element, expectedUnits) => {
      const rootRect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      const componentHeight = Number.parseFloat(style.getPropertyValue("--vt-component-height")) || rootRect.height
      const widthUnits = componentHeight > 0 ? rootRect.width / componentHeight : 0
      const rail = element.querySelector(
        ".vt-subtoolbox-split-button-rail,.vt-subtoolbox-split-dropdown-rail,.vt-subtoolbox-split-field-rail",
      )
      const railRect = rail?.getBoundingClientRect() ?? null
      const squareRailDelta = railRect ? Math.abs(railRect.width - railRect.height) : 0
      const textNodes = Array.from(element.querySelectorAll(
        ".vt-subtoolbox-split-button-label,.vt-subtoolbox-split-dropdown-label b,.vt-subtoolbox-menu-label b",
      ))
      const clippedLabels = textNodes
        .filter((node) => node.scrollWidth > node.clientWidth + 1)
        .map((node) => node.textContent?.trim() || node.className)
      const field = element.querySelector("input,textarea")
      const fieldRect = field?.getBoundingClientRect() ?? null
      const fieldUnits = fieldRect && componentHeight > 0 ? fieldRect.width / componentHeight : null

      return {
        width: rootRect.width,
        height: rootRect.height,
        componentHeight,
        widthUnits,
        expectedUnits,
        squareRailDelta,
        clippedLabels,
        fieldUnits,
      }
    }, minUnits)

    manifest.captures.push({
      kind: "geometry",
      family: familyName,
      track: "primitive",
      level: levelName,
      viewport: viewport.label,
      geometry,
    })

    if (geometry.widthUnits + 0.08 < minUnits) {
      manifest.errors.push({
        phase: "geometry",
        family: familyName,
        level: levelName,
        viewport: viewport.label,
        message: `width ratio ${geometry.widthUnits.toFixed(2)} is below required ${minUnits.toFixed(2)} component-height units`,
      })
    }
    if (geometry.squareRailDelta > 1.1) {
      manifest.errors.push({
        phase: "geometry",
        family: familyName,
        level: levelName,
        viewport: viewport.label,
        message: `split rail is not square (delta ${geometry.squareRailDelta.toFixed(2)}px)`,
      })
    }
    if (geometry.clippedLabels.length > 0) {
      manifest.errors.push({
        phase: "geometry",
        family: familyName,
        level: levelName,
        viewport: viewport.label,
        message: `canonical label clipped: ${geometry.clippedLabels.join(", ")}`,
      })
    }
    if (familyName === "Split Search" && geometry.fieldUnits !== null && geometry.fieldUnits < 2.35) {
      manifest.errors.push({
        phase: "geometry",
        family: familyName,
        level: levelName,
        viewport: viewport.label,
        message: `search body collapsed to ${geometry.fieldUnits.toFixed(2)} component-height units`,
      })
    }
  }
}

async function capturePriorityStates(page, viewport, trackId, trackName, familyName) {
  const family = page.locator(`#${trackId} ${attrSelector(familyName)}`).first()
  if (!(await family.count())) return

  const states = priorityStates.get(familyName) || ["default"]
  for (const levelName of ["l0", "l1", "l2"]) {
    const level = family.locator(`[data-level="${levelName}"]`).first()
    if (!(await level.count())) continue

    for (const state of states) {
      try {
        await applyState(level, familyName, state)
        const file = `${out}/${slug(familyName)}-${trackName}-${levelName}-${state}-${viewport.label}.png`
        const floatingOverlayFamily = ["Tooltip", "Tooltip Color", "Tooltip Visual Key", "Hover Card"].includes(familyName)
        if (floatingOverlayFamily && state !== "default") {
          await level.scrollIntoViewIfNeeded()
          await page.waitForTimeout(80)
          await page.screenshot({ path: file })
        } else {
          await captureLocator(level, file)
        }
        manifest.captures.push({
          kind: "state",
          family: familyName,
          track: trackName,
          level: levelName,
          state,
          viewport: viewport.label,
          file,
          captureMode: floatingOverlayFamily && state !== "default" ? "viewport" : "locator",
        })
      } catch (error) {
        manifest.errors.push({
          phase: "state",
          family: familyName,
          track: trackName,
          level: levelName,
          state,
          viewport: viewport.label,
          message: error.message,
        })
      }
    }
  }
}

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()

  try {
    await navigateToLibrary(page)

    const primitiveFamilyNames = await page
      .locator('#toolbox-ui-library-primitive [data-vt-family]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-vt-family")).filter(Boolean))
    const hardcodedFamilyNames = new Set(
      await page
        .locator('#toolbox-ui-library-hardcoded [data-vt-family]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-vt-family")).filter(Boolean)),
    )

    if (manifest.families.length === 0) manifest.families = primitiveFamilyNames

    const families = primitiveFamilyNames.filter((family) =>
      requestedFamilies.size === 0 || requestedFamilies.has(family),
    )

    for (const familyName of families) {
      const primitive = page.locator(
        `#toolbox-ui-library-primitive ${attrSelector(familyName)}`,
      ).first()
      const primitiveBox = await primitive.boundingBox()
      const primitiveFile = `${out}/${slug(familyName)}-primitive-default-${viewport.label}.png`
      await captureLocator(primitive, primitiveFile)

      await inspectPrimitiveGeometry(primitive, familyName, viewport)

      let hardcodedBox = null
      let hardcodedFile = null
      if (hardcodedFamilyNames.has(familyName)) {
        const hardcoded = page.locator(
          `#toolbox-ui-library-hardcoded ${attrSelector(familyName)}`,
        ).first()
        hardcodedBox = await hardcoded.boundingBox()
        hardcodedFile = `${out}/${slug(familyName)}-hardcoded-default-${viewport.label}.png`
        await captureLocator(hardcoded, hardcodedFile)
      }

      manifest.captures.push({
        kind: "family-default",
        family: familyName,
        viewport: viewport.label,
        hardcodedFile,
        primitiveFile,
        paired: Boolean(hardcodedFile),
        geometry: {
          hardcoded: hardcodedBox ? { width: hardcodedBox.width, height: hardcodedBox.height } : null,
          primitive: primitiveBox ? { width: primitiveBox.width, height: primitiveBox.height } : null,
          delta: hardcodedBox && primitiveBox
            ? {
                width: primitiveBox.width - hardcodedBox.width,
                height: primitiveBox.height - hardcodedBox.height,
              }
            : null,
        },
      })
    }

    for (const familyName of priorityStates.keys()) {
      if (requestedFamilies.size > 0 && !requestedFamilies.has(familyName)) continue
      await capturePriorityStates(
        page,
        viewport,
        "toolbox-ui-library-hardcoded",
        "hardcoded",
        familyName,
      )
      await capturePriorityStates(
        page,
        viewport,
        "toolbox-ui-library-primitive",
        "primitive",
        familyName,
      )
    }

    const overviewFile = `${out}/component-library-overview-${viewport.label}.png`
    await page.locator("#toolbox-ui-library").scrollIntoViewIfNeeded()
    await page.screenshot({ path: overviewFile, fullPage: true })
    manifest.captures.push({ kind: "overview", viewport: viewport.label, file: overviewFile })
  } catch (error) {
    manifest.errors.push({
      phase: "viewport",
      viewport: viewport.label,
      message: error.message,
    })
  } finally {
    await context.close()
  }
}

await browser.close()

manifest.summary = {
  familyCount: manifest.families.length,
  captureCount: manifest.captures.length,
  errorCount: manifest.errors.length,
  pairedDefaultCount: manifest.captures.filter(
    (capture) => capture.kind === "family-default" && capture.paired,
  ).length,
  primitiveOnlyDefaultCount: manifest.captures.filter(
    (capture) => capture.kind === "family-default" && !capture.paired,
  ).length,
}

await fs.writeFile(`${out}/manifest.json`, JSON.stringify(manifest, null, 2))
console.log(JSON.stringify(manifest.summary, null, 2))

if (manifest.errors.length > 0) process.exitCode = 2
