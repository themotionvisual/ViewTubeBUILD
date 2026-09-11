// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
 BRAIN_USER_CONTROLS_STORAGE_KEY,
 DEFAULT_BRAIN_USER_CONTROLS,
 canBrainShareResearchData,
 canBrainUseCapability,
 readBrainUserControls,
 setActiveBrainControlChannel,
 shouldBrainLearnFromInteraction,
 writeBrainUserControls,
} from "../brain/BrainUserControls"
import { buildBrainSurfaceContext } from "../brain/BrainSurfaceContext"

describe("Brain user controls", () => {
 beforeEach(() => {
  localStorage.clear()
 })

 it("defaults to personal learning on and shared research off", () => {
  const controls = readBrainUserControls()
  expect(controls.learnFromInteractions).toBe(true)
  expect(controls.contributeDeidentifiedResearch).toBe(false)
  expect(canBrainShareResearchData(controls)).toBe(false)
 })

 it("persists creator choices and emits a controls-changed event", () => {
  const listener = vi.fn()
  window.addEventListener("vt_brain_user_controls_changed", listener)
  const saved = writeBrainUserControls({
   ...DEFAULT_BRAIN_USER_CONTROLS,
   allowAnalytics: false,
   personalization: false,
  })

  expect(saved.allowAnalytics).toBe(false)
  expect(readBrainUserControls().personalization).toBe(false)
  expect(localStorage.getItem(BRAIN_USER_CONTROLS_STORAGE_KEY)).toContain('"allowAnalytics":false')
  expect(listener).toHaveBeenCalledTimes(1)
  window.removeEventListener("vt_brain_user_controls_changed", listener)
 })

 it("supports different control profiles for different connected channels", () => {
  writeBrainUserControls({ ...DEFAULT_BRAIN_USER_CONTROLS, allowAnalytics: false }, "channel-a")
  writeBrainUserControls({ ...DEFAULT_BRAIN_USER_CONTROLS, allowAnalytics: true, allowComments: false }, "channel-b")

  expect(readBrainUserControls("channel-a").allowAnalytics).toBe(false)
  expect(readBrainUserControls("channel-b").allowAnalytics).toBe(true)
  expect(readBrainUserControls("channel-b").allowComments).toBe(false)

  setActiveBrainControlChannel("channel-a")
  expect(readBrainUserControls().allowAnalytics).toBe(false)
  setActiveBrainControlChannel("channel-b")
  expect(readBrainUserControls().allowComments).toBe(false)
 })

 it("does not let a disabled capability through", () => {
  const controls = { ...DEFAULT_BRAIN_USER_CONTROLS, allowAnalytics: false }
  expect(canBrainUseCapability(controls, "analytics")).toBe(false)
  expect(canBrainUseCapability(controls, "projects")).toBe(true)
 })

 it("keeps personal learning separate from research contribution", () => {
  const personalOnly = {
   ...DEFAULT_BRAIN_USER_CONTROLS,
   learnFromInteractions: true,
   contributeDeidentifiedResearch: false,
  }
  expect(shouldBrainLearnFromInteraction(personalOnly)).toBe(true)
  expect(canBrainShareResearchData(personalOnly)).toBe(false)
  expect(shouldBrainLearnFromInteraction(personalOnly, { explicitlyExcluded: true })).toBe(false)
 })

 it("filters route capabilities using creator controls", () => {
  const context = buildBrainSurfaceContext({
   pathname: "/analytics",
   controls: { ...DEFAULT_BRAIN_USER_CONTROLS, allowAnalytics: false },
  })
  expect(context.capabilityIds).not.toContain("analytics")
  expect(context.blockedCapabilities).toContain("analytics")
 })
})
