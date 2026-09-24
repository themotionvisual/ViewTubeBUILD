import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"

describe("Creator Command consolidation", () => {
  it("keeps Daily Oracle as the canonical daily command identity", () => {
    expect(DASHBOARD_WIDGET_BY_ID["daily-oracle"]).toBeDefined()
    expect(DASHBOARD_WIDGET_BY_ID["daily-creator-command"]).toBeUndefined()
    expect(DASHBOARD_WIDGET_BY_ID["creator-command"]).toBeUndefined()
  })
})
