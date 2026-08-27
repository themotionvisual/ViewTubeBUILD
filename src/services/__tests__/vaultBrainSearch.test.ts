// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createLocalVaultAsset,
 searchVaultAssets,
} from "../vaultAdapter"
import {
 DEFAULT_BRAIN_USER_CONTROLS,
 setActiveBrainControlChannel,
 writeBrainUserControls,
} from "../brain/BrainUserControls"
import { searchVaultForBrain } from "../brain/BrainVaultAdapter"

describe("Vault Brain integration", () => {
 beforeEach(() => {
  localStorage.clear()
  setActiveBrainControlChannel("channel-test")
  writeBrainUserControls(DEFAULT_BRAIN_USER_CONTROLS, "channel-test")
 })

 it("searches the canonical Vault metadata instead of a second Brain index", () => {
  createLocalVaultAsset({
   name: "Austerlitz map plate",
   kind: "image",
   projectId: "project-a",
   projectName: "Austerlitz",
   tags: ["map", "history"],
  })
  createLocalVaultAsset({
   name: "Unrelated audio",
   kind: "audio",
   projectId: "project-b",
   projectName: "Other",
   tags: ["music"],
  })

  const matches = searchVaultAssets({ query: "Austerlitz", projectId: "project-a" })
  expect(matches).toHaveLength(1)
  expect(matches[0].name).toBe("Austerlitz map plate")
 })

 it("honors Brain Vault permission without disabling the creator Vault itself", () => {
  createLocalVaultAsset({ name: "Storyboard", kind: "image", tags: ["storyboard"] })
  writeBrainUserControls({ ...DEFAULT_BRAIN_USER_CONTROLS, allowVault: false }, "channel-test")

  expect(searchVaultAssets({ query: "Storyboard" })).toHaveLength(1)
  expect(searchVaultForBrain({ query: "Storyboard" }).assets).toHaveLength(0)
 })
})
