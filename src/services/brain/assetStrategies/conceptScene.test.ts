import { describe, expect, it } from "vitest"
import {
 conceptDirectionStrategy,
 scenePlanStrategy,
 type ConceptForgeOutput,
 type ScenePlanOutput,
} from "./conceptScene"

const request = {
 channelId: "channel-1",
 assetType: "concept_direction" as const,
 instruction: "Forge three distinct directions.",
 inputs: {
  brief: {
   idea: "Napoleon's deception at Austerlitz",
   audience: "history viewers",
   promise: "Understand the trap",
   objective: "Teach through suspense",
   format: "Longform",
   runtimeMinutes: 12,
   tone: "Tense / cinematic",
   evidenceNotes: "Do not invent quotations.",
  },
 },
}

describe("Concept + Scene governed strategies", () => {
 it("requires exactly three distinct, production-usable concept directions", () => {
  const output: ConceptForgeOutput = {
   concepts: [
    { id:"a", label:"THE REVEAL", angle:"Hidden mechanism", hook:"Open on the impossible result.", viewerPromise:"Understand the trap.", visualLanguage:"Maps and evidence inserts.", narrativeShape:"Contradiction to reveal.", proofPlan:"Evidence in causal order.", risk:"Do not reveal too early.", readiness:92 },
    { id:"b", label:"INSIDE THE MOMENT", angle:"Human pressure", hook:"Enter through one eyewitness moment.", viewerPromise:"Understand the trap.", visualLanguage:"Human-scale geography.", narrativeShape:"Pressure to decision.", proofPlan:"Primary-source anchors.", risk:"Do not over-reconstruct.", readiness:88 },
    { id:"c", label:"THE DECISION MAP", angle:"Choice architecture", hook:"Start at the last reversible decision.", viewerPromise:"Understand the trap.", visualLanguage:"Decision maps and consequences.", narrativeShape:"Constraints to chain reaction.", proofPlan:"Tie claims to choices.", risk:"Avoid lecture mode.", readiness:94 },
   ],
   notes: [],
  }

  expect(conceptDirectionStrategy.rubric?.(output, request) || []).toEqual([])
  expect(conceptDirectionStrategy.promptVersion).toBe("concept-direction-v1")
  expect(conceptDirectionStrategy.evidenceClasses).toContain("channel_profile")
  expect(conceptDirectionStrategy.schema).toMatchObject({ type: "OBJECT" })
 })

 it("blocks duplicated concept angles or the wrong candidate count", () => {
  const bad: ConceptForgeOutput = {
   concepts: [
    { id:"a", label:"A", angle:"Same", hook:"Hook", viewerPromise:"Promise", visualLanguage:"Visual", narrativeShape:"Shape", proofPlan:"Proof", risk:"Risk", readiness:90 },
    { id:"b", label:"B", angle:"Same", hook:"Hook", viewerPromise:"Promise", visualLanguage:"Visual", narrativeShape:"Shape", proofPlan:"Proof", risk:"Risk", readiness:90 },
   ],
   notes: [],
  }
  const findings = conceptDirectionStrategy.rubric?.(bad, request) || []
  expect(findings.some(finding => finding.rule === "concept_count" && finding.severity === "blocking")).toBe(true)
  expect(findings.some(finding => finding.rule === "distinct_angles" && finding.severity === "blocking")).toBe(true)
 })

 it("requires a complete scene plan with motion, assets, continuity and requested count", () => {
  const sceneRequest = {
   ...request,
   assetType: "scene_plan" as const,
   inputs: { ...request.inputs, sceneCount: 3, selectedConcept: { label:"THE REVEAL", angle:"Hidden mechanism" }, scriptBeats:["Impossible result","Trap closes","Payoff"] },
  }
  const output: ScenePlanOutput = {
   scenes: [
    { id:"s1", role:"HOOK", title:"Impossible result", purpose:"Open loop", narration:"Something should not have happened.", visualDirection:"Frozen battlefield consequence.", shot:"Hero wide", camera:"Slow push", visualPrompt:"Cinematic battlefield consequence.", assetNeeds:["map"], motionBrief:"Slow push with restrained parallax.", durationSeconds:15, transition:"Hard evidence cut", continuity:"Same geography." },
    { id:"s2", role:"PROOF", title:"Trap closes", purpose:"Prove mechanism", narration:"The evidence reveals the trap.", visualDirection:"Map and source insert.", shot:"Insert sequence", camera:"Locked macro", visualPrompt:"Evidence-rich tactical insert.", assetNeeds:["map","source"], motionBrief:"Annotated route reveal.", durationSeconds:30, transition:"Matched map cut", continuity:"Preserve unit colors." },
    { id:"s3", role:"PAYOFF", title:"Payoff", purpose:"Resolve promise", narration:"Now the apparent weakness makes sense.", visualDirection:"Return to hero geography.", shot:"Resolved wide", camera:"Slow hold", visualPrompt:"Resolved battlefield geography.", assetNeeds:["hero"], motionBrief:"Slow final hold.", durationSeconds:20, transition:"End hold", continuity:"Return to opening composition." },
   ],
   notes: [],
  }
  expect(scenePlanStrategy.rubric?.(output, sceneRequest) || []).toEqual([])
  expect(scenePlanStrategy.promptVersion).toBe("scene-plan-v1")
 })
})
