// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createVaultSmartCollection,
 deleteVaultSmartCollection,
 listVaultSmartCollections,
} from "../vaultCollections"

describe("Vault Smart Collections", () => {
 beforeEach(() => localStorage.clear())

 it("persists a saved query as a lightweight collection rule", () => {
  const created = createVaultSmartCollection({
   name: "Thumbnail Drafts",
   query: "thumbnail",
   tags: ["draft"],
   kind: "image",
   source: "generated",
  })

  expect(created.id).toBeTruthy()
  expect(listVaultSmartCollections()).toEqual([created])
 })

 it("deletes one saved collection without affecting others", () => {
  const first = createVaultSmartCollection({ name: "A", query: "a" })
  const second = createVaultSmartCollection({ name: "B", query: "b" })

  deleteVaultSmartCollection(first.id)

  expect(listVaultSmartCollections().map((item) => item.id)).toEqual([second.id])
 })
})
