// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset } from "../vaultAdapter"
import { detachVaultAssetVersion } from "../vaultVersions"

describe("detachVaultAssetVersion", () => {
 beforeEach(() => localStorage.clear())

 it("creates an independent Vault asset while preserving parent lineage", () => {
  const source = createLocalVaultAsset({
   name: "Thumbnail V2",
   kind: "image",
   tags: ["thumbnail"],
   metadata: { parentAssetIds: ["asset-root"] },
  })

  const detached = detachVaultAssetVersion(source, { versionId: "version-2" })

  expect(detached.id).not.toBe(source.id)
  expect(detached.name).toContain("Detached")
  expect(detached.metadata?.parentAssetIds).toEqual(["asset-root", source.id])
  expect(detached.metadata?.detachedFromVersionId).toBe("version-2")
 })
})
