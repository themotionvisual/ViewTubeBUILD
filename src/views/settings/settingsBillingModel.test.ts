import { describe, expect, it } from "vitest"

import {
  SETTINGS_PLAN_OPTIONS,
  getSettingsPlanOption,
} from "./settingsBillingModel"

describe("Settings billing model", () => {
  it("preserves every existing plan and price in canonical order", () => {
    expect(SETTINGS_PLAN_OPTIONS.map((plan) => [plan.id, plan.price])).toEqual([
      ["basic", "$0"],
      ["beta", "$0"],
      ["creator", "$9.99/mo"],
      ["creator_plus", "$19.99/mo"],
      ["creator_pro", "$39.99/mo"],
      ["executive", "$69.99/mo"],
    ])
  })

  it("resolves selected plan details without duplicating the card wall", () => {
    expect(getSettingsPlanOption("creator").bullets).toContain("Included AI credits")
    expect(getSettingsPlanOption("creator_plus").label).toBe("Creator Plus")
  })
})
