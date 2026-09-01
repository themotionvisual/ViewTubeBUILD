import { describe, expect, it } from "vitest"
import {
 EDITOR_INTELLIGENCE_CONTEXT_SCHEMA,
 EDITOR_INTELLIGENCE_PROPOSAL_SCHEMA,
 buildEditorIntelligenceContextPack,
 createEditorIntelligenceProposal,
 reviewEditorIntelligenceProposal,
} from "./editorIntelligenceBridge"

describe("editor intelligence bridge", () => {
 it("builds a bounded project context and clearly reports missing Brain inputs", () => {
  const pack = buildEditorIntelligenceContextPack({
   project: {
    meta: { projectName: "Radical opener", aspectRatio: "9:16", durationSec: 24, fps: 30, visualDNA: "neon" },
    clips: [{ id: "clip-a" }],
    layers: [{ id: "layer-a" }, { id: "layer-b" }],
   },
   creatorBrief: "Teach a new viewer why the subject matters.",
   selectedClipId: "clip-a",
   playheadSec: 3.2,
   now: new Date("2026-08-31T12:00:00.000Z"),
  })

  expect(pack.schemaVersion).toBe(EDITOR_INTELLIGENCE_CONTEXT_SCHEMA)
  expect(pack.project).toMatchObject({ aspectRatio: "9:16", clipCount: 1, layerCount: 2, playheadSec: 3.2 })
  expect(pack.missingInputs).toEqual([
   "Channel profile evidence is not connected to this editor session.",
   "Analytics evidence is not connected to this editor session.",
  ])
 })

 it("creates review-only proposals without a hidden timeline patch", () => {
  const contextPack = buildEditorIntelligenceContextPack({ project: { meta: { projectName: "Project" } } })
  const proposal = createEditorIntelligenceProposal({ contextPack, kind: "caption-plan", requestedOutcome: "Draft readable captions." })
  const reviewed = reviewEditorIntelligenceProposal(proposal, "reviewed")

  expect(proposal.schemaVersion).toBe(EDITOR_INTELLIGENCE_PROPOSAL_SCHEMA)
  expect(proposal.reviewRequired).toBe(true)
  expect(proposal.timelinePatch).toBeNull()
  expect(reviewed.status).toBe("reviewed")
 })
})
