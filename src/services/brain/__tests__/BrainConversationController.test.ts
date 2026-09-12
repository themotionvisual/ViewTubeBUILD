import { describe, expect, it } from "vitest"
import type { AIBrainConversationThread, AIBrainConversationTurn } from "../../../types"
import {
 buildBrainConversationHistory,
 normalizeBrainConversationState,
 visibleBrainConversationTurns,
} from "../BrainConversationController"

const turn = (
 id: string,
 source: string | undefined,
 userText: string,
 assistantText: string,
): AIBrainConversationTurn => ({
 id,
 threadId: "thread-1",
 channelId: "channel-1",
 userText,
 assistantText,
 response: {
  headline: `Answer ${id}`,
  keyInsight: assistantText,
  nextAction: "Next",
  confidence: "medium",
  evidenceIds: [],
  sections: [],
  modules: [],
  questions: [],
 },
 answerModules: [],
 questionAnswers: [],
 learningEntryIds: [],
 status: "complete",
 createdAt: `2026-09-12T00:0${id}.000Z`,
 updatedAt: `2026-09-12T00:0${id}.000Z`,
 metadata: source ? { source } : {},
}) as AIBrainConversationTurn

const thread = {
 id: "thread-1",
 channelId: "channel-1",
 title: "Test",
 summary: "",
 turnIds: [],
 createdAt: "2026-09-12T00:00:00.000Z",
 updatedAt: "2026-09-12T00:00:00.000Z",
} as AIBrainConversationThread

describe("BrainConversationController", () => {
 it("filters non-conversation persistence events from creator-visible turns", () => {
  const visible = visibleBrainConversationTurns([
   turn("3", "feedback", "feedback", "saved"),
   turn("2", undefined, "question", "answer"),
   turn("1", "journal", "note", "saved"),
  ])

  expect(visible.map((item) => item.id)).toEqual(["2"])
 })

 it("normalizes persisted chronological turns to one newest-first surface contract", () => {
  const state = normalizeBrainConversationState(thread, [
   turn("1", undefined, "first question", "first answer"),
   turn("2", undefined, "second question", "second answer"),
  ])

  expect(state.turns.map((item) => item.id)).toEqual(["2", "1"])
  expect(state.latestVisibleTurn?.id).toBe("2")
 })

 it("builds model history oldest-to-newest from a newest-first controller state", () => {
  const history = buildBrainConversationHistory([
   turn("3", undefined, "q3", "a3"),
   turn("2", undefined, "q2", "a2"),
   turn("1", undefined, "q1", "a1"),
  ], 2)

  expect(history.map((item) => item.parts[0].text)).toEqual(["q2", "a2", "q3", "a3"])
 })
})
