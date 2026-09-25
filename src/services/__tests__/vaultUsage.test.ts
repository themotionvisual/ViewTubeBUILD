import { beforeEach, describe, expect, it } from "vitest"
import {
 attachAssetToContentBuild,
 createContentBuild,
 resetContentBuildRepositoryForTests,
 setContentBuildSelection,
} from "../asset-engine/ContentBuildRepository"
import { getVaultAssetUsage } from "../vaultUsage"

describe("getVaultAssetUsage", () => {
 beforeEach(() => resetContentBuildRepositoryForTests())

 it("reports every ContentBuild using the asset and any selected slot", () => {
  const build = createContentBuild({
   id: "cb-usage",
   legacyProjectId: "p-usage",
   legacyProjectName: "Austerlitz",
  })
  attachAssetToContentBuild(build.id, "asset-thumb", { toolId: "test" })
  setContentBuildSelection(build.id, "thumbnail", "asset-thumb")

  expect(getVaultAssetUsage("asset-thumb")).toEqual([
   expect.objectContaining({
    contentBuildId: "cb-usage",
    projectName: "Austerlitz",
    selectedSlots: ["thumbnail"],
   }),
  ])
 })
})
