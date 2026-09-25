import { describe, expect, it } from "vitest"
import { resolveVaultSelection } from "../vaultSelection"

describe("resolveVaultSelection", () => {
 it("uses the clicked asset as the new anchor for a normal selection gesture", () => {
  expect(resolveVaultSelection({
   visibleIds: ["a", "b", "c", "d"],
   selectedIds: ["a"],
   clickedId: "c",
   nextSelected: true,
   anchorId: "a",
   shiftKey: false,
  })).toEqual({
   selectedIds: ["a", "c"],
   anchorId: "c",
  })
 })

 it("adds the contiguous visible range when shift-selecting from the anchor", () => {
  expect(resolveVaultSelection({
   visibleIds: ["a", "b", "c", "d"],
   selectedIds: ["a"],
   clickedId: "d",
   nextSelected: true,
   anchorId: "a",
   shiftKey: true,
  })).toEqual({
   selectedIds: ["a", "b", "c", "d"],
   anchorId: "a",
  })
 })

 it("removes the contiguous visible range when shift-deselecting", () => {
  expect(resolveVaultSelection({
   visibleIds: ["a", "b", "c", "d"],
   selectedIds: ["a", "b", "c", "d"],
   clickedId: "c",
   nextSelected: false,
   anchorId: "a",
   shiftKey: true,
  })).toEqual({
   selectedIds: ["d"],
   anchorId: "a",
  })
 })
})
