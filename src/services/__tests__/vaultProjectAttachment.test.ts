import { beforeEach, describe, expect, it } from "vitest"
import { attachVaultAssetIdsToProject } from "../vaultProjectHandoff"
import {
 getContentBuild,
 resetContentBuildRepositoryForTests,
} from "../asset-engine/ContentBuildRepository"

describe("attachVaultAssetIdsToProject", () => {
 beforeEach(() => resetContentBuildRepositoryForTests())

 it("attaches existing Vault asset IDs to the project's canonical ContentBuild", () => {
  const project = {
   id: "p-existing",
   name: "Austerlitz",
   videoTitle: "Austerlitz",
   status: "ideation",
   plan: { concept: "", niche: "history" },
  }

  const result = attachVaultAssetIdsToProject({
   project,
   assetIds: ["asset-map", "asset-voice"],
  })

  const build = getContentBuild(result.contentBuildId)
  expect(build?.assetIds).toEqual(expect.arrayContaining(["asset-map", "asset-voice"]))
  expect(result.project.id).toBe("p-existing")
 })
})
