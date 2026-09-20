import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const aboutSource = readFileSync(new URL("../widgets/VerificationExplainerWidget.tsx", import.meta.url), "utf8")
const aboutCss = readFileSync(new URL("../widgets/VerificationExplainerWidget.css", import.meta.url), "utf8")
const oracleSource = readFileSync(new URL("../widgets/DailyOracleWidget.tsx", import.meta.url), "utf8")
const oracleCss = readFileSync(new URL("../widgets/DailyOracleWidget.css", import.meta.url), "utf8")
const sharedCss = readFileSync(new URL("../toolboxWidgetSystem.css", import.meta.url), "utf8")
const primitiveCss = readFileSync(new URL("../widgetPrimitiveVariants.css", import.meta.url), "utf8")
const registrySource = readFileSync(new URL("../WidgetRegistryBase.ts", import.meta.url), "utf8")

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

  it("acts as a colorful first-visit hook using the full ViewTube spectrum and creator loop", () => {
    expect(registrySource.indexOf('{ id: "app-verification-explainer", size: "half", height: "medium" }')).toBeLessThan(
      registrySource.indexOf('{ id: "kpi-cluster", size: "half", height: "medium" }'),
    )
    expect(aboutSource).toContain("about-vt__spectrum")
    expect(aboutSource).toContain("about-vt__capability-ribbon")
    expect(aboutSource).toContain("WELCOME TO VIEWTUBE")
    expect(aboutSource).toContain("ANALYZE")
    expect(aboutSource).toContain("THINK")
    expect(aboutSource).toContain("MAKE")
    expect(aboutSource).toContain("PUBLISH")
    expect(aboutSource).toContain("LEARN")
    expect(aboutCss).toContain("--vt-rose: #fa618a")
    expect(aboutCss).toContain("--vt-cyan: #36e0f6")
    expect(aboutCss).toContain("--vt-magenta: #f55efc")
    expect(aboutCss).toContain("repeat(12, minmax(0, 1fr))")
    expect(aboutCss).toContain(".about-vt__scroll .widget-scroll-viewport")
    expect(aboutCss).toContain("padding-inline-end: 0")
    expect(aboutSource).toContain('<WidgetSection edge="full" className="about-vt__intro">')
    expect(aboutSource).toContain('<WidgetSection edge="full" className="about-vt__handoff">')
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

  it("swaps the persistent calendar into the Best Next Move footprint instead of growing the widget", () => {
    expect(oracleSource).toContain("ORACLE_STREAK_KEY")
    expect(oracleSource).toContain("calculateDailyOracleStreak")
    expect(oracleSource).toContain('height={38}')
    expect(oracleSource).toContain("todayPanel === \"calendar\"")
    expect(oracleSource).toContain("daily-oracle-v2__calendar-stage")
    expect(oracleSource).toContain("daily-oracle-v2__calendar-grid")
    expect(oracleSource).toContain("DAY STREAK")
    expect(oracleSource).not.toContain("daily-oracle-v2__streak-reveal")
    expect(oracleCss).toContain(".daily-oracle-v2__calendar-stage")
    expect(oracleCss).toContain("height: var(--oracle-compass-h)")
    expect(oracleCss).toContain("grid-template-columns: repeat(7, minmax(0, 1fr))")
  })

  it("keeps the Oracle monochromatic and reserves a different hue for completion", () => {
    expect(oracleCss).toContain("--oracle-success: #c0f240")
    expect(oracleCss).not.toContain("--oracle-rose:")
    expect(oracleCss).not.toContain("--oracle-cyan:")
    expect(oracleCss).toContain(".daily-oracle-v2__day-check")
    expect(oracleCss).toContain("var(--oracle-success)")
    expect(oracleCss).toContain(".daily-oracle-v2__score.is-impact")
    expect(oracleCss).toContain("--oracle-score-color: var(--widget-color)")
  })

  it("uses compact lens copy and narrows adaptive 24px controls before clipping text", () => {
    expect(oracleSource).toContain('compactLabel: "Subs"')
    expect(oracleSource).toContain('compactLabel: "Engage"')
    expect(oracleSource).toContain('compactLabel: "Watch"')
    expect(primitiveCss).toContain("@container vt-widget (max-width: 430px)")
    expect(primitiveCss).toContain("--vt-primitive-font: 10px")
    expect(primitiveCss).toContain("@container vt-widget (max-width: 360px)")
    expect(primitiveCss).toContain("--vt-primitive-font: 9px")
  })
})
