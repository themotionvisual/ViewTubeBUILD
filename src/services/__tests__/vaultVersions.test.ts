import { beforeEach, describe, expect, it } from "vitest"
import {
 createContentBuild,
 createContentBuildAssetVersion,
 resetContentBuildRepositoryForTests,
} from "../asset-engine/ContentBuildRepository"
import { getVaultAssetVersionStack } from "../vaultVersions"

describe("getVaultAssetVersionStack", () => {
 beforeEach(() => resetContentBuildRepositoryForTests())

 it("returns every canonical version in the same slot as the selected asset", () => {
  const build = createContentBuild({ id: "cb-vault-versions" })
  const v1 = createContentBuildAssetVersion({
   contentBuildId: build.id,
   assetId: "thumb-a",
   slot: "thumbnail",
   label: "A",
  })
  createContentBuildAssetVersion({
   contentBuildId: build.id,
   assetId: "thumb-b",
   slot: "thumbnail",
   label: "B",
   parentVersionId: v1.id,
   parentAssetId: "thumb-a",
  })

  const stack = getVaultAssetVersionStack("thumb-b")
  expect(stack.map((version) => version.assetId)).toEqual(["thumb-a", "thumb-b"])
  expect(stack.map((version) => version.version)).toEqual([1, 2])
 })
})
