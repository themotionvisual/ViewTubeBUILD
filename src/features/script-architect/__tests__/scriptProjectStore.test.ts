// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 SCRIPT_PROJECT_STATE_KEY,
 SCRIPT_PROJECT_VAULT_KEY,
 clearScriptProjectState,
 emptyScriptProject,
 normalizeScriptProject,
 readScriptProjectState,
 readScriptVault,
 removeScriptDraft,
 saveScriptDraft,
 writeScriptProjectState,
} from "../scriptProjectStore"
import type { ScriptProject } from "../../../types"

const filled = (): ScriptProject => ({
 ...emptyScriptProject(),
 topic: "Why Napoleon really lost at Waterloo",
 angle: "Contrarian",
 targetMinutes: 14,
 pacing: "tight",
 chapters: [{ id: "ch-1", name: "The Setup", description: "Europe in 1815", weight: 2 }],
 globalReferences: [{ id: "ref-1", url: "https://example.com", note: "the dispatch" }],
 globalFragments: [{ id: "f-1", label: "Cold open", text: "Forget the mud.", mode: "lock" }],
})

describe("script project persistence", () => {
 beforeEach(() => localStorage.clear())

 it("returns null before anything is saved", () => {
  expect(readScriptProjectState()).toBeNull()
 })

 it("round-trips the working draft, including the assembled result", () => {
  const project = filled()
  writeScriptProjectState(project, null)
  const restored = readScriptProjectState()

  expect(restored?.project.topic).toBe(project.topic)
  expect(restored?.project.pacing).toBe("tight")
  expect(restored?.project.chapters[0].name).toBe("The Setup")
  expect(restored?.project.globalFragments[0].mode).toBe("lock")
  expect(restored?.result).toBeNull()
 })

 it("keeps the draft id and creation time across autosaves", () => {
  writeScriptProjectState(filled(), null)
  const first = readScriptProjectState()
  writeScriptProjectState({ ...filled(), topic: "changed" }, null)
  const second = readScriptProjectState()

  expect(second?.id).toBe(first?.id)
  expect(second?.createdAt).toBe(first?.createdAt)
  expect(second?.project.topic).toBe("changed")
 })

 it("clears the working draft without touching the vault", () => {
  writeScriptProjectState(filled(), null)
  saveScriptDraft("Waterloo", filled(), null)
  clearScriptProjectState()

  expect(readScriptProjectState()).toBeNull()
  expect(readScriptVault()).toHaveLength(1)
 })

 it("survives corrupt storage instead of throwing", () => {
  localStorage.setItem(SCRIPT_PROJECT_STATE_KEY, "{not json")
  localStorage.setItem(SCRIPT_PROJECT_VAULT_KEY, '{"nope":true}')

  expect(readScriptProjectState()).toBeNull()
  expect(readScriptVault()).toEqual([])
 })

 it("repairs a half-valid stored project", () => {
  const project = normalizeScriptProject({
   topic: 42,
   pacing: "sideways",
   targetMinutes: -3,
   chapters: [{ name: "Kept", weight: "heavy" }],
   globalFragments: [{ label: "No mode", text: "hi", mode: "sideways" }],
   globalReferences: "not an array",
  })

  expect(project.topic).toBe("42")
  expect(project.pacing).toBe("standard")
  expect(project.targetMinutes).toBe(10)
  expect(project.chapters[0].name).toBe("Kept")
  expect(project.chapters[0].weight).toBe(1)
  expect(project.chapters[0].id).toBeTruthy()
  expect(project.globalFragments[0].mode).toBe("lock")
  expect(project.globalReferences).toEqual([])
 })

 it("saves named drafts, replaces a same-named one, and deletes by id", () => {
  saveScriptDraft("Waterloo", filled(), null)
  let vault = saveScriptDraft("Marshals", { ...filled(), topic: "The Marshals" }, null)
  expect(vault).toHaveLength(2)
  expect(vault[0].name).toBe("Marshals")

  // Matching is case-insensitive; the spelling the creator just typed wins.
  vault = saveScriptDraft("waterloo", { ...filled(), topic: "Rewritten" }, null)
  expect(vault).toHaveLength(2)
  expect(vault.find((draft) => draft.name === "waterloo")?.project.topic).toBe("Rewritten")

  const id = vault[0].id
  expect(removeScriptDraft(id)).toHaveLength(1)
 })

 it("falls back to the topic when a draft is saved unnamed", () => {
  const vault = saveScriptDraft("   ", filled(), null)
  expect(vault[0].name).toBe("Why Napoleon really lost at Waterloo")
 })
})
