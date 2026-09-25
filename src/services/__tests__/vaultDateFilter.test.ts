// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { searchVaultAssets } from "../vaultAdapter"

const key = "vt_creator_vault_assets_v1"

describe("Vault updated-date filter", () => {
 beforeEach(() => localStorage.clear())

 it("filters assets by inclusive updated date range", () => {
  localStorage.setItem(key, JSON.stringify([
   { id:"a", name:"Old", kind:"image", source:"local", projectId:null, projectName:"P", toolId:null, generationId:null, driveFileId:null, folderId:null, url:null, previewUrl:null, mimeType:"image/png", tags:["x"], metadata:{}, createdAt:Date.parse("2026-08-01T12:00:00Z"), updatedAt:Date.parse("2026-08-01T12:00:00Z") },
   { id:"b", name:"Inside", kind:"image", source:"local", projectId:null, projectName:"P", toolId:null, generationId:null, driveFileId:null, folderId:null, url:null, previewUrl:null, mimeType:"image/png", tags:["x"], metadata:{}, createdAt:Date.parse("2026-09-10T12:00:00Z"), updatedAt:Date.parse("2026-09-10T12:00:00Z") },
   { id:"c", name:"New", kind:"image", source:"local", projectId:null, projectName:"P", toolId:null, generationId:null, driveFileId:null, folderId:null, url:null, previewUrl:null, mimeType:"image/png", tags:["x"], metadata:{}, createdAt:Date.parse("2026-09-30T12:00:00Z"), updatedAt:Date.parse("2026-09-30T12:00:00Z") },
  ]))

  expect(searchVaultAssets({
   updatedAfter: Date.parse("2026-09-01T00:00:00Z"),
   updatedBefore: Date.parse("2026-09-20T23:59:59Z"),
   limit: 100,
  }).map((asset) => asset.name)).toEqual(["Inside"])
 })
})
