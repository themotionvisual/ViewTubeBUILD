import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const aboutSource = readFileSync(new URL("../widgets/VerificationExplainerWidget.tsx", import.meta.url), "utf8")
const aboutCss = readFileSync(new URL("../widgets/VerificationExplainerWidget.css", import.meta.url), "utf8")
const oracleSource = readFileSync(new URL("../widgets/DailyOracleWidget.tsx", import.meta.url), "utf8")
const oracleCss = readFileSync(new URL("../widgets/DailyOracleWidget.css", import.meta.url), "utf8")
const sharedCss = readFileSync(new URL("../toolboxWidgetSystem.css", import.meta.url), "utf8")

describe("About VIEWTUBE redesign contract", () => {
  it("uses a functional system map and a separate trust map instead of the retired marketing matrix", () => {
    expect(aboutSource).toContain("about-vt__system-map")
    expect(aboutSource).toContain("about-vt__trust-map")
    expect(aboutSource).toContain("SYSTEM_NODES")
    expect(aboutSource).toContain('route: "/analytics"')
    expect(aboutSource).toContain('route: "/ai-brain"')
    expect(aboutSource).toContain('route: "/studio"')
    expect(aboutSource).toContain('route: "/projects"')
    expect(aboutSource).toContain("<WidgetHeaderToggle")
    expect(aboutSource).toContain("<WidgetScrollArea")
    expect(aboutSource).toContain("<WidgetFooter")
    expect(aboutSource).not.toContain("widget-about__features")
    expect(sharedCss).not.toContain("Widget: About VIEWTUBE (new)")
  })

  it("keeps the four-node system composition around a recognizable ViewTube hub", () => {
    expect(aboutCss).toContain("grid-template-columns: minmax(74px, 1fr) minmax(104px, 1.25fr) minmax(74px, 1fr)")
    expect(aboutCss).toContain(".about-vt__system-node.is-north")
    expect(aboutCss).toContain(".about-vt__system-node.is-west")
    expect(aboutCss).toContain(".about-vt__system-node.is-east")
    expect(aboutCss).toContain(".about-vt__system-node.is-south")
    expect(aboutCss).toContain(".about-vt__hub")
  })
})

describe("Daily Oracle redesign contract", () => {
  it("uses Brain evidence plus a reusable decision engine instead of private hard-coded advice cards", () => {
    expect(oracleSource).toContain("buildAIBrainContextSnapshot")
    expect(oracleSource).toContain("buildCreatorGrowthContext")
    expect(oracleSource).toContain("buildDailyOraclePlan")
    expect(oracleSource).toContain("daily-oracle-v2__compass")
    expect(oracleSource).toContain("<WidgetHeaderToggle")
    expect(oracleSource).toContain("<WidgetScrollArea")
    expect(oracleSource).toContain("<WidgetSizedButton")
    expect(oracleSource).toContain("<WidgetIconButton")
    expect(oracleSource).not.toContain('className="vt-button')
    expect(sharedCss).not.toContain(".daily-oracle-actions")
    expect(sharedCss).not.toContain(".oracle-advice-card")
  })

  it("locks the primary-card = three-score-cells composition equation", () => {
    expect(oracleCss).toContain("height: var(--oracle-compass-h)")
    expect(oracleCss).toContain("grid-template-columns: minmax(0, 1.75fr) minmax(78px, .62fr)")
    expect(oracleCss).toContain("grid-template-rows: repeat(3, minmax(0, 1fr))")
    expect(oracleCss).toContain("gap: var(--oracle-gap)")
  })

  it("keeps the five growth lenses in one adaptive control row", () => {
    expect(oracleCss).toContain("grid-template-columns: repeat(5, minmax(0, 1fr))")
    expect(oracleSource).toContain('textFit="adaptive"')
  })
})
