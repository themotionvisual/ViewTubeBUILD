// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createVaultScratchpad,
 deleteVaultScratchpad,
 listVaultScratchpads,
 updateVaultScratchpad,
} from "../vaultScratchpads"

describe("Vault scratchpads", () => {
 beforeEach(() => localStorage.clear())

 it("creates and updates a saved workspace note", () => {
  const note = createVaultScratchpad({ title: "Research", content: "Check maps" })
  const updated = updateVaultScratchpad(note.id, { content: "Check maps and memoirs" })

  expect(updated?.id).toBe(note.id)
  expect(listVaultScratchpads()[0].content).toBe("Check maps and memoirs")
 })

 it("deletes a scratchpad independently from assets", () => {
  const note = createVaultScratchpad({ title: "Temp", content: "x" })
  deleteVaultScratchpad(note.id)
  expect(listVaultScratchpads()).toEqual([])
 })
})
