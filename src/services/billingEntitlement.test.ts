import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetchEntitlementFromServer, ENTITLEMENT_CHANGED_EVENT } from "./billingEntitlement"
import type { EntitlementState } from "./billingEntitlement"

describe("fetchEntitlementFromServer", () => {
  const email = "test@example.com"
  const mockEntitlement: EntitlementState = {
    tier: "medium",
    subscriptionPlanId: "creator_plus",
    status: "active",
    tokenBalance: 1000,
    tokenMonthlyLimit: 1000,
    tokenDailyAccrual: 100,
    tokenLastAccrualIso: "2023-01-01T00:00:00Z",
    currentPeriodStartIso: "2023-01-01T00:00:00Z",
    currentPeriodEndIso: "2023-02-01T00:00:00Z",
    referralCode: "VT123456",
    referralsConverted: 0,
    freeMonthsEarned: 0,
    freeMonthsApplied: 0,
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    updatedAtIso: "2023-01-01T00:00:00Z",
  }

  beforeEach(() => {
    vi.stubEnv("VITE_BILLING_API_BASE", "https://api.example.com")
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal("localStorage", localStorageMock)
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      CustomEvent: vi.fn(),
      location: { origin: "http://localhost:3000" }
    })
  })

  it("fetches and stores entitlement", async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ userId: "1", entitlement: mockEntitlement }),
    } as any)

    const result = await fetchEntitlementFromServer(email)

    expect(fetchSpy).toHaveBeenCalledWith(
      `https://api.example.com/billing/entitlement/${encodeURIComponent(email)}`
    )
    expect(result).toEqual(mockEntitlement)
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it("throws if API fails", async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 500 } as any)
    await expect(fetchEntitlementFromServer(email)).rejects.toThrow("Failed to fetch entitlement (500)")
  })
})
