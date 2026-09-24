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

  it("Daily Oracle owns the Creator Command focus console while preserving canonical primitives", () => {
    const source = read("src/views/dashboard/widgets/DailyOracleWidget.tsx")
    expect(source).toContain("CreatorFocusConsole")
    expect(source).toContain("daily-oracle-v2__focus-console")
    expect(source).toContain("<WidgetSizedButton")
    expect(source).toContain("<WidgetIconButton")
  })

  it("Content Pipeline owns a lifecycle rail compound system", () => {
    const source = read("src/views/dashboard/widgets/ContentPipelineWidget.tsx")
    expect(source).toContain("LifecycleRail")
    expect(source).toContain("vt-content-lifecycle-rail")
    expect(source).toContain("<WidgetSizedButton")
  })

  it("Audience Requests owns a request-cluster map and canonical actions", () => {
    const source = read("src/views/dashboard/widgets/AudienceRequestsWidget.tsx")
    expect(source).toContain("RequestClusterMap")
    expect(source).toContain("vt-request-cluster-map")
    expect(source).toContain("<WidgetSizedButton")
  })

  it("Flight Check owns a launch gantry when canonical publishing state exists", () => {
    const source = read("src/views/dashboard/widgets/FlightCheckWidget.tsx")
    expect(source).toContain("LaunchGantry")
    expect(source).toContain("vt-launch-gantry")
    expect(source).toContain("<WidgetProgressBar")
    expect(source).toContain("<WidgetSizedButton")
  })

  it("the shared new-widget stylesheet no longer owns the signature systems", () => {
    const sharedCss = read("src/views/dashboard/widgets/newWidgetSet.css")
    expect(sharedCss).not.toContain(".vt-opportunity-compass")
    expect(sharedCss).not.toContain(".vt-anomaly-scope")
    expect(sharedCss).not.toContain(".vt-decision-junction")
    expect(sharedCss).not.toContain(".vt-next-action__")
    expect(sharedCss).not.toContain(".vt-radar-")
    expect(sharedCss).not.toContain(".vt-pipeline-")
    expect(sharedCss).not.toContain(".vt-request-row")
    expect(sharedCss).not.toContain(".vt-opportunity-field")
  })
})
