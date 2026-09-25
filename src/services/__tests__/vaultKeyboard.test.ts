import { describe, expect, it } from "vitest"
import { resolveVaultKeyboardCommand } from "../vaultKeyboard"

describe("resolveVaultKeyboardCommand", () => {
 it("maps platform command search to focus-search", () => {
  expect(resolveVaultKeyboardCommand({ key: "k", metaKey: true, ctrlKey: false })).toBe("focus-search")
  expect(resolveVaultKeyboardCommand({ key: "k", metaKey: false, ctrlKey: true })).toBe("focus-search")
 })

 it("maps space and escape to Quick Look controls", () => {
  expect(resolveVaultKeyboardCommand({ key: " ", metaKey: false, ctrlKey: false })).toBe("toggle-quick-look")
  expect(resolveVaultKeyboardCommand({ key: "Escape", metaKey: false, ctrlKey: false })).toBe("close-transient")
 })

 it("maps m to mute only when not using a modifier", () => {
  expect(resolveVaultKeyboardCommand({ key: "m", metaKey: false, ctrlKey: false })).toBe("toggle-mute")
  expect(resolveVaultKeyboardCommand({ key: "m", metaKey: true, ctrlKey: false })).toBeNull()
 })
})
