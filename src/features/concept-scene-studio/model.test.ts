import { describe, expect, it } from "vitest"
import {
 buildProductionHandoff,
 createConceptCandidates,
 createScenesFromConcept,
 moveScene,
 type ConceptBrief,
} from "./model"

const brief: ConceptBrief = {
 idea: "How Napoleon turned apparent weakness at Austerlitz into a trap",
 audience: "history viewers who know the battle but want the human decision-making",
 promise: "understand the deception from the battlefield point of view",
 objective: "educate and create suspense",
 format: "Longform",
 runtimeMinutes: 12,
 tone: "Tense / cinematic",
 evidenceNotes: "Use eyewitness framing; do not invent quotations.",
}

describe("Concept + Scene Studio model", () => {
 it("forges three distinct production-ready concept directions from one brief", () => {
  const concepts = createConceptCandidates(brief)

  expect(concepts).toHaveLength(3)
  expect(new Set(concepts.map(concept => concept.id)).size).toBe(3)
  expect(new Set(concepts.map(concept => concept.angle)).size).toBe(3)

  for (const concept of concepts) {
   expect(concept.hook.length).toBeGreaterThan(20)
   expect(concept.viewerPromise).toContain("understand")
   expect(concept.visualLanguage.length).toBeGreaterThan(20)
   expect(concept.narrativeShape.length).toBeGreaterThan(10)
   expect(concept.readiness).toBeGreaterThanOrEqual(70)
  }
 })

 it("expands a selected direction into an editable scene blueprint", () => {
  const concept = createConceptCandidates(brief)[0]
  const scenes = createScenesFromConcept(concept, brief, 6)

  expect(scenes).toHaveLength(6)
  expect(scenes[0].role).toBe("HOOK")
  expect(scenes.at(-1)?.role).toBe("PAYOFF")
  expect(scenes.every(scene => scene.visualPrompt.length > 20)).toBe(true)
  expect(scenes.every(scene => scene.camera.length > 0)).toBe(true)
  expect(scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0)).toBeGreaterThan(0)
 })

 it("reorders scenes without losing scene identity", () => {
  const concept = createConceptCandidates(brief)[0]
  const scenes = createScenesFromConcept(concept, brief, 4)
  const moved = moveScene(scenes, 0, 2)

  expect(moved[2].id).toBe(scenes[0].id)
  expect(new Set(moved.map(scene => scene.id))).toEqual(new Set(scenes.map(scene => scene.id)))
 })

 it("builds one canonical production handoff containing concept and scene lineage", () => {
  const concept = createConceptCandidates(brief)[1]
  const scenes = createScenesFromConcept(concept, brief, 5)
  const handoff = buildProductionHandoff(brief, concept, scenes)

  expect(handoff.selectedConceptId).toBe(concept.id)
  expect(handoff.scenes).toHaveLength(5)
  expect(handoff.storyboard.scenes).toHaveLength(5)
  expect(handoff.videoDirector.concept).toBe(concept.angle)
  expect(handoff.assetNeeds.length).toBeGreaterThan(0)
 })
})
