import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const sharedOwners = [
  ["DashboardHeader.tsx", readFileSync(new URL("../DashboardHeader.tsx", import.meta.url), "utf8")],
  ["WidgetRendererBase.tsx", readFileSync(new URL("../WidgetRendererBase.tsx", import.meta.url), "utf8")],
  ["widgetControlOwnership.css", readFileSync(new URL("../widgetControlOwnership.css", import.meta.url), "utf8")],
] as const

const forbiddenStructuralColorPatterns = [
  /\btext-black\b/g,
  /\bborder-black\b/g,
  /\bbg-black\b/g,
  /\b(?:bg|text|border)-gray-\d+\b/g,
  /#000(?:000)?\b/gi,
  /rgba\(0\s*,\s*0\s*,\s*0\s*,/gi,
]

describe("dashboard shared semantic color ownership", () => {
  it.each(sharedOwners)("%s contains no authored structural black or neutral gray", (_name, source) => {
    for (const pattern of forbiddenStructuralColorPatterns) {
      expect(source.match(pattern) ?? []).toEqual([])
    }
  })

  it("keeps shared control fallbacks on semantic widget and VT ink tokens", () => {
    const css = sharedOwners.find(([name]) => name === "widgetControlOwnership.css")?.[1] ?? ""
    expect(css).toContain("var(--widget-color,#34cdea)")
    expect(css).toContain("var(--text-main,var(--vt-ink")
    expect(css).not.toContain("var(--widget-color,#000)")
    expect(css).not.toContain("var(--text-main,#000)")
  })
})
