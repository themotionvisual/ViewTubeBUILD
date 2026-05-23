import { beforeEach, describe, expect, it, vi } from "vitest"

import {
 applyPlanToEntitlement,
 canAffordAiTokensFromState,
 consumeEntitlementTokens,
 createDefaultEntitlement,
 getCurrentEntitlement,
 registerReferralConversion,
 syncEntitlementIfDrifted,
 reconcileEntitlementWindow,
 writeStoredEntitlement,
 tierAtLeast,
} from "../billingEntitlement"

const createLocalStorageMock = () => {
 const store = new Map<string, string>()
 return {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
   store.set(key, value)
  },
  removeItem: (key: string) => {
   store.delete(key)
  },
  clear: () => {
   store.clear()
  },
 }
}

describe("billing entitlement runtime", () => {
 beforeEach(() => {
  const localStorageMock = createLocalStorageMock()
  Object.defineProperty(globalThis, "localStorage", {
   configurable: true,
   writable: true,
   value: localStorageMock,
  })
  vi.restoreAllMocks()
 })

 it("maps tier ordering correctly", () => {
  expect(tierAtLeast("large", "medium")).toBe(true)
  expect(tierAtLeast("medium", "free")).toBe(true)
  expect(tierAtLeast("free", "medium")).toBe(false)
 })

 it("resets medium token pool on period rollover", () => {
  const jan2 = new Date("2026-01-02T10:00:00.000Z")
  const state = applyPlanToEntitlement(createDefaultEntitlement(jan2), "creator_plus", jan2)

  const consumed = consumeEntitlementTokens(state, 11_500, new Date("2026-01-03T10:00:00.000Z"))
  expect(consumed.allowed).toBe(true)
  expect(consumed.next.tokenBalance).toBe(500)

  const feb2 = reconcileEntitlementWindow(consumed.next, new Date("2026-02-02T10:00:00.000Z"))
  expect(feb2.tokenBalance).toBe(feb2.tokenMonthlyLimit)
  expect(feb2.tokenMonthlyLimit).toBe(12_000)
 })

 it("applies daily accrual without exceeding monthly cap", () => {
  const start = new Date("2026-03-01T08:00:00.000Z")
  const state = applyPlanToEntitlement(createDefaultEntitlement(start), "creator_pro", start)
  const drained = consumeEntitlementTokens(state, 11_900, new Date("2026-03-01T09:00:00.000Z"))

  expect(drained.next.tokenBalance).toBe(100)

  const afterTwoDays = reconcileEntitlementWindow(
   drained.next,
   new Date("2026-03-03T10:00:00.000Z"),
  )
  expect(afterTwoDays.tokenBalance).toBe(900)

  const afterMonthLater = reconcileEntitlementWindow(
   afterTwoDays,
   new Date("2026-04-01T10:00:00.000Z"),
  )
  expect(afterMonthLater.tokenBalance).toBe(afterMonthLater.tokenMonthlyLimit)
 })

 it("allows unlimited usage on large tier", () => {
  const state = applyPlanToEntitlement(
   createDefaultEntitlement(new Date("2026-03-10T00:00:00.000Z")),
   "creator_pro",
   new Date("2026-03-10T00:00:00.000Z"),
  )

  const result = consumeEntitlementTokens(state, 500_000, new Date("2026-03-11T00:00:00.000Z"))
  expect(result.allowed).toBe(true)
  expect(result.next.tokenBalance).toBe(Number.POSITIVE_INFINITY)
 })

 it("records referral conversion as one earned free month", () => {
  const medium = applyPlanToEntitlement(
   createDefaultEntitlement(new Date("2026-03-10T00:00:00.000Z")),
   "creator_plus",
   new Date("2026-03-10T00:00:00.000Z"),
  )

  const rewarded = registerReferralConversion(medium, new Date("2026-03-12T00:00:00.000Z"))
  expect(rewarded.referralsConverted).toBe(medium.referralsConverted + 1)
  expect(rewarded.freeMonthsEarned).toBe(medium.freeMonthsEarned + 1)
 })

 it("getCurrentEntitlement performs side-effect-free reads", () => {
  const setItemSpy = vi.spyOn(localStorage, "setItem")

  const entitlement = getCurrentEntitlement()

  expect(entitlement).toBeTruthy()
  expect(setItemSpy).not.toHaveBeenCalled()
 })

 it("syncEntitlementIfDrifted writes only when reconciliation changes persisted state", () => {
  const now = new Date("2026-03-10T00:00:00.000Z")
  const plan = applyPlanToEntitlement(createDefaultEntitlement(now), "creator_plus", now)
  const stale = {
   ...plan,
   tokenBalance: 100,
   tokenLastAccrualIso: "2026-03-08T00:00:00.000Z",
  }
  writeStoredEntitlement(stale)

  const setItemSpy = vi.spyOn(localStorage, "setItem")
  syncEntitlementIfDrifted(new Date("2026-03-10T12:00:00.000Z"))
  expect(setItemSpy).toHaveBeenCalledTimes(1)

  syncEntitlementIfDrifted(new Date("2026-03-10T12:00:00.000Z"))
  expect(setItemSpy).toHaveBeenCalledTimes(1)
 })

 it("canAffordAiTokensFromState uses the provided state only", () => {
  const medium = applyPlanToEntitlement(
   createDefaultEntitlement(new Date("2026-03-10T00:00:00.000Z")),
   "creator_plus",
   new Date("2026-03-10T00:00:00.000Z"),
  )
  expect(canAffordAiTokensFromState(medium, 10)).toBe(true)
  const exhausted = {
   ...medium,
   tokenBalance: 0,
   tokenDailyAccrual: 0,
   currentPeriodEndIso: "2099-01-01T00:00:00.000Z",
   tokenLastAccrualIso: new Date().toISOString(),
  }
  expect(canAffordAiTokensFromState(exhausted, 1)).toBe(false)
 })
})
