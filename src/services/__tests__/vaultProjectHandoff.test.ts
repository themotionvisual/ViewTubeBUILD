import { describe, expect, it } from "vitest"
import { buildVaultSelectionProjectDraft } from "../vaultProjectHandoff"

describe("buildVaultSelectionProjectDraft", () => {
 it("creates a canonical project-shaped draft from selected Vault assets", () => {
  const project = buildVaultSelectionProjectDraft({
   name: "Austerlitz Assets",
   targetNiche: "Napoleonic history",
   assetNames: ["map.png", "charge.mp4"],
   now: 1234,
  })

  expect(project).toMatchObject({
   id: "p-vault-1234",
   name: "Austerlitz Assets",
   videoTitle: "Austerlitz Assets",
   status: "ideation",
   plan: {
    niche: "Napoleonic history",
    sourceVaultAssetNames: ["map.png", "charge.mp4"],
   },
  })
 })
})
