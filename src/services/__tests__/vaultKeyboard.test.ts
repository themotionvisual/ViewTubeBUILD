import { describe, expect, it } from "vitest"
import { resolveVaultKeyboardCommand, resolveVaultTagHotkey } from "../vaultKeyboard"

describe("resolveVaultKeyboardCommand", () => {
 it("maps platform command search to focus-search", () => {
  expect(resolveVaultKeyboardCommand({ key: "k", metaKey: true, ctrlKey: false })).toBe("focus-search")
  expect(resolveVaultKeyboardCommand({ key: "k", metaKey: false, ctrlKey: true })).toBe("focus-search")
 })

 it("maps platform command g to project handoff", () => {
  expect(resolveVaultKeyboardCommand({ key: "g", metaKey: true, ctrlKey: false })).toBe("project-selection")
  expect(resolveVaultKeyboardCommand({ key: "g", metaKey: false, ctrlKey: true })).toBe("project-selection")
 })

 it("maps space and escape to Quick Look controls", () => {
  expect(resolveVaultKeyboardCommand({ key: " ", metaKey: false, ctrlKey: false })).toBe("toggle-quick-look")
  expect(resolveVaultKeyboardCommand({ key: "Escape", metaKey: false, ctrlKey: false })).toBe("close-transient")
 })

 it("maps Enter to the selected asset Inspector", () => {
  expect(resolveVaultKeyboardCommand({ key: "Enter", metaKey: false, ctrlKey: false })).toBe("focus-inspector")
  expect(resolveVaultKeyboardCommand({ key: "Enter", metaKey: true, ctrlKey: false })).toBeNull()
 })

 it("maps m to mute only when not using a modifier", () => {
  expect(resolveVaultKeyboardCommand({ key: "m", metaKey: false, ctrlKey: false })).toBe("toggle-mute")
  expect(resolveVaultKeyboardCommand({ key: "m", metaKey: true, ctrlKey: false })).toBeNull()
 })
})


describe("resolveVaultTagHotkey", () => {
 it("maps unmodified 1-9 keys to zero-based tag indexes", () => {
  expect(resolveVaultTagHotkey({ key: "1", metaKey: false, ctrlKey: false })).toBe(0)
  expect(resolveVaultTagHotkey({ key: "9", metaKey: false, ctrlKey: false })).toBe(8)
 })

 it("ignores zero, non-digits and modified number keys", () => {
  expect(resolveVaultTagHotkey({ key: "0", metaKey: false, ctrlKey: false })).toBeNull()
  expect(resolveVaultTagHotkey({ key: "a", metaKey: false, ctrlKey: false })).toBeNull()
  expect(resolveVaultTagHotkey({ key: "1", metaKey: true, ctrlKey: false })).toBeNull()
 })
})
