// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createVaultChecklistItem,
 deleteVaultChecklistItem,
 listVaultChecklistItems,
 toggleVaultChecklistItem,
} from "../vaultChecklists"

describe("Vault workspace checklists", () => {
 beforeEach(() => localStorage.clear())

 it("creates and toggles a persistent checklist item", () => {
  const item = createVaultChecklistItem("Review thumbnail rights")
  const toggled = toggleVaultChecklistItem(item.id)

  expect(toggled?.done).toBe(true)
  expect(listVaultChecklistItems()[0].text).toBe("Review thumbnail rights")
 })

 it("deletes a checklist item without touching assets", () => {
  const item = createVaultChecklistItem("Temporary")
  deleteVaultChecklistItem(item.id)
  expect(listVaultChecklistItems()).toEqual([])
 })
})
