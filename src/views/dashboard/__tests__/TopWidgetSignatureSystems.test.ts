import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8")

describe("Top widget signature systems", () => {
  it("Opportunity Radar owns an interactive opportunity compass built around canonical controls", () => {
    const source = read("src/views/dashboard/widgets/OpportunityRadarWidget.tsx")
    expect(source).toContain("OpportunityCompass")
    expect(source).toContain("vt-opportunity-compass")
    expect(source).toContain("<WidgetBadge")
    expect(source).toContain("<WidgetSizedButton")
  })

  it("Anomaly Radar owns an anomaly scope instead of a generic list-only layout", () => {
    const source = read("src/views/dashboard/widgets/AnomalyRadarWidget.tsx")
    expect(source).toContain("AnomalyScope")
    expect(source).toContain("vt-anomaly-scope")
    expect(source).toContain("<WidgetBadge")
    expect(source).toContain("<WidgetSizedButton")
  })

  it("Next Best Action owns a decision junction with selectable branches", () => {
    const source = read("src/views/dashboard/widgets/NextBestActionWidget.tsx")
    expect(source).toContain("DecisionJunction")
    expect(source).toContain("vt-decision-junction")
    expect(source).toContain("<WidgetBadge")
    expect(source).toContain("<WidgetSizedButton")
  })

  it("the shared new-widget stylesheet no longer owns the signature systems", () => {
    const sharedCss = read("src/views/dashboard/widgets/newWidgetSet.css")
    expect(sharedCss).not.toContain(".vt-opportunity-compass")
    expect(sharedCss).not.toContain(".vt-anomaly-scope")
    expect(sharedCss).not.toContain(".vt-decision-junction")
  })
})
