import "fake-indexeddb/auto"
import { describe, expect, it } from "vitest"
import type { CreatorBrainLearningQuestion, CreatorBrainResponse } from "../../types"
import {
 answerAIBrainQuestionModule,
 beginAIBrainTurn,
 completeAIBrainTurn,
 listAIBrainConversationTurns,
 resumeAIBrainThread,
 saveAIBrainConversationTurn,
 sanitizeCreatorFacingBrainCopy,
} from "../aiBrainConversationStore"

const responseFixture: CreatorBrainResponse = {
 id: "response-1",
 mode: "strategy_brief",
 headline: "Strategy Brief",
 keyInsight: "Improve one title and thumbnail around the clearest viewer promise.",
 evidenceChips: [],
 sections: [],
 modules: [
  {
   id: "what-to-do-next",
   title: "What To Do Next",
   body: "Rewrite the next upload title around one concrete viewer payoff.",
   tone: "yellow",
   source: "growth",
  },
 ],
 actions: ["Rewrite the title."],
 learningSummary: "The Brain learned the creator wants practical growth steps.",
 questions: [],
 confidence: "medium",
}

const questionFixture: CreatorBrainLearningQuestion = {
 id: "primary-goal",
 question: "Which result matters most this month: views, subscribers, revenue, watch time, consistency, or a better creative workflow?",
 reason: "A goal priority makes recommendations sharper.",
 category: "creator_goal",
 confidence: "medium",
}

describe("aiBrainConversationStore", () => {
 it("persists a pending turn before generation and completes the same record", async () => {
  const pending = await beginAIBrainTurn({
   channelId: "channel-lifecycle",
   userText: "What should I publish next?",
  })
  expect(pending.status).toBe("pending")

  const completed = await completeAIBrainTurn({
   turnId: pending.id,
   status: "complete",
   assistantText: "Build the next upload around your strongest repeatable topic.",
   response: responseFixture,
  })
  const restored = await resumeAIBrainThread("channel-lifecycle")

  expect(completed.id).toBe(pending.id)
  expect(restored.thread.turnIds).toEqual([pending.id])
  expect(restored.turns[0]?.status).toBe("complete")
  expect(restored.turns[0]?.assistantText).toContain("strongest repeatable topic")
 })

 it("converts an abandoned pending turn into a saved interrupted response", async () => {
  const pending = await beginAIBrainTurn({
   channelId: "channel-interrupted",
   userText: "Analyze this upload",
  })

  const restored = await resumeAIBrainThread("channel-interrupted")
  const turn = restored.turns.find((item) => item.id === pending.id)

  expect(turn?.status).toBe("interrupted")
  expect(turn?.assistantText).toContain("interrupted")
 })

 it("persists and reloads Brain conversation turns by channel id", async () => {
  const saved = await saveAIBrainConversationTurn({
   channelId: "channel-a",
   userText: "How should I improve my next upload?",
   assistantText: "Improve the title promise and first 30 seconds.",
   response: responseFixture,
   answerModules: responseFixture.modules,
  })
  await saveAIBrainConversationTurn({
   channelId: "channel-b",
   userText: "Different channel",
   assistantText: "Different answer",
  })

  const turns = await listAIBrainConversationTurns({ channelId: "channel-a" })

  expect(turns.map((turn) => turn.id)).toContain(saved.id)
  expect(turns.every((turn) => turn.channelId === "channel-a")).toBe(true)
  expect(turns[0]?.answerModules[0]?.title).toBe("What To Do Next")
 })

 it("saves answered question modules as learning-backed conversation turns", async () => {
  const answer = await answerAIBrainQuestionModule({
   channelId: "channel-question",
   question: questionFixture,
   answer: "Subscribers and watch time matter most this month.",
  })
  const turns = await listAIBrainConversationTurns({ channelId: "channel-question" })

  expect(answer.learningEntryId).toBeTruthy()
  expect(turns[0]?.questionAnswers[0]?.answer).toContain("Subscribers")
  expect(turns[0]?.metadata?.source).toBe("question_module")
 })

 it("keeps creator-facing copy clear of internal data plumbing language", () => {
  const clean = sanitizeCreatorFacingBrainCopy("VT-SYNC sync bundle failed through the API diagnostics manifest.")

  expect(clean).not.toMatch(/VT-SYNC|sync bundle|failed|API|diagnostics|manifest/i)
  expect(clean).toMatch(/channel data|data areas|incomplete|notes|summary/i)
 })
})
