// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset } from "../vaultAdapter"
import {
 createVaultAssetHandoff,
 getVaultAssetToolTargets,
 resolveVaultAssetPayloadKind,
} from "../vaultToolLauncher"

describe("Vault asset tool launcher", () => {
 beforeEach(() => localStorage.clear())

 it("maps Vault asset kinds to canonical handoff payload kinds", () => {
  expect(resolveVaultAssetPayloadKind("image")).toBe("image")
  expect(resolveVaultAssetPayloadKind("video")).toBe("video")
  expect(resolveVaultAssetPayloadKind("document")).toBe("asset")
 })

 it("returns only compatible target tools", () => {
  const targets = getVaultAssetToolTargets("image")
  expect(targets.map((target) => target.id)).toContain("thumbnail-studio")
  expect(targets.map((target) => target.id)).toContain("video-editor")
 })

 it("creates a handoff containing asset identity instead of media blobs", () => {
  const asset = createLocalVaultAsset({ name: "Map", kind: "image", tags: ["map"] })
  const result = createVaultAssetHandoff({
   asset,
   targetToolId: "thumbnail-studio",
   contentBuildId: "cb-1",
   projectId: "p-1",
   channelId: "channel-1",
  })

  expect(result.packet.payload).toEqual({
   assetIds: [asset.id],
   primaryAssetId: asset.id,
   assetKind: "image",
   assetName: "Map",
  })
  expect(result.route).toContain("handoff=")
  expect(result.route).not.toContain("data:")
 })
})
