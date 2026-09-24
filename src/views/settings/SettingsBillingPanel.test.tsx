import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { SettingsBillingPanel } from "./SettingsBillingPanel"

const BASE_PROPS = {
  activePlanId: "creator" as const,
  unlimited: false,
  meterLeft: 1200,
  meterUsed: 800,
  meterTotal: 2000,
  meterPct: 60,
  nextRefillLabel: "10/1/2026",
  billingStatus: null,
  loadingPlan: null,
  topups: [
    { sku: "topup_5", priceUsd: 5, creditAmount: 8000 },
    { sku: "topup_10", priceUsd: 10, creditAmount: 18000 },
  ],
  customTopupAmount: "50",
  referralCode: "CREATOR",
  referralCodeLocked: false,
  customReferralCode: "",
  onChoosePlan: vi.fn(),
  onOpenBillingPortal: vi.fn(),
  onTopup: vi.fn(),
  onCustomTopup: vi.fn(),
  onCustomTopupAmountChange: vi.fn(),
  onSetCustomReferralCode: vi.fn(),
  onCustomReferralCodeChange: vi.fn(),
}

describe("SettingsBillingPanel", () => {
  it("renders current plan and only the selected plan detail in the default path", () => {
    const html = renderToStaticMarkup(<SettingsBillingPanel {...BASE_PROPS} />)

    expect(html).toContain("Current Plan")
    expect(html).toContain("Creator")
    expect(html).toContain("1,200")
    expect(html).toContain("Change Plan")
    expect(html).toContain("Included AI credits")
    expect(html).not.toContain("Core tools")
    expect(html).not.toContain("Highest creator credits")
  })

  it("keeps top-up and referral contents collapsed by default", () => {
    const html = renderToStaticMarkup(<SettingsBillingPanel {...BASE_PROPS} />)

    expect(html).toContain("Top Up Credits")
    expect(html).toContain("Referral Rewards")
    expect(html).not.toContain("8,000")
    expect(html).not.toContain("CREATOR")
  })
})
