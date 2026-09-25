// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset, searchVaultAssets } from "../vaultAdapter"

describe("Vault orientation filter", () => {
 beforeEach(() => localStorage.clear())

 it("filters portrait, landscape, and square assets from factual dimensions", () => {
  createLocalVaultAsset({ name: "Wide", kind: "image", tags: ["x"], projectName: "P", metadata: { width: 1920, height: 1080 } })
  createLocalVaultAsset({ name: "Tall", kind: "image", tags: ["x"], projectName: "P", metadata: { width: 1080, height: 1920 } })
  createLocalVaultAsset({ name: "Square", kind: "image", tags: ["x"], projectName: "P", metadata: { width: 1080, height: 1080 } })

  expect(searchVaultAssets({ orientation: "landscape", limit: 100 }).map((a) => a.name)).toEqual(["Wide"])
  expect(searchVaultAssets({ orientation: "portrait", limit: 100 }).map((a) => a.name)).toEqual(["Tall"])
  expect(searchVaultAssets({ orientation: "square", limit: 100 }).map((a) => a.name)).toEqual(["Square"])
 })
})
