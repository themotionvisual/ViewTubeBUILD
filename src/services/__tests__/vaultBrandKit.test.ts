// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createVaultCollection,
 getVaultBrandKit,
 listVaultCollections,
 setVaultCollectionRole,
} from "../vaultManualCollections"

describe("Vault Brand Kit collection role", () => {
 beforeEach(() => localStorage.clear())

 it("promotes exactly one manual collection to the Brand Kit role", () => {
  const a = createVaultCollection("Brand Assets")
  const b = createVaultCollection("Alternate")
  setVaultCollectionRole(a.id, "brand-kit")
  expect(getVaultBrandKit()?.id).toBe(a.id)

  setVaultCollectionRole(b.id, "brand-kit")
  expect(getVaultBrandKit()?.id).toBe(b.id)
  expect(listVaultCollections().find((item) => item.id === a.id)?.role).toBe("standard")
 })

 it("keeps ordinary collections standard by default", () => {
  expect(createVaultCollection("Research").role).toBe("standard")
 })
})
