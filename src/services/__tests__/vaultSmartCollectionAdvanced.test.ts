// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createVaultSmartCollection,
 listVaultSmartCollections,
} from "../vaultCollections"

describe("Vault Smart Collection advanced criteria", () => {
 beforeEach(() => localStorage.clear())

 it("persists the full advanced filter state", () => {
  createVaultSmartCollection({
   name: "Final 4K MP4",
   query: "napoleon",
   lifecycle: "FINAL",
   orientation: "landscape",
   updatedFrom: "2026-09-01",
   updatedTo: "2026-09-30",
   mimeType: "video/mp4",
   minWidth: "3840",
   minHeight: "2160",
   minDuration: "30",
   maxDuration: "120",
   minBytesMb: "10",
   maxBytesMb: "500",
  })

  expect(listVaultSmartCollections()[0]).toMatchObject({
   lifecycle: "FINAL",
   orientation: "landscape",
   updatedFrom: "2026-09-01",
   updatedTo: "2026-09-30",
   mimeType: "video/mp4",
   minWidth: "3840",
   minHeight: "2160",
   minDuration: "30",
   maxDuration: "120",
   minBytesMb: "10",
   maxBytesMb: "500",
  })
 })

 it("backfills advanced criteria for legacy saved collections", () => {
  localStorage.setItem("vt_creator_vault_smart_collections_v1", JSON.stringify([{
   id: "legacy",
   name: "Legacy",
   query: "",
   tags: [],
   kind: "all",
   source: "all",
   createdAt: 1,
  }]))

  expect(listVaultSmartCollections()[0]).toMatchObject({
   lifecycle: "all",
   orientation: "all",
   updatedFrom: "",
   updatedTo: "",
   mimeType: "",
   minWidth: "",
   minHeight: "",
   minDuration: "",
   maxDuration: "",
   minBytesMb: "",
   maxBytesMb: "",
  })
 })
})
