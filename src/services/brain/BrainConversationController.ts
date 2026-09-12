import type { AIBrainConversationThread, AIBrainConversationTurn } from "../../types"
import { resumeAIBrainThread } from "../aiBrainConversationStore"

export const BRAIN_CONVERSATION_CHANGED_EVENT = "vt_brain_conversation_changed"

export const NON_CONVERSATION_SOURCES = new Set([
 "feedback",
 "journal",
 "quick_action",
 "creator_intake",
 "question_module",
])

export type BrainConversationState = {
 thread: AIBrainConversationThread
 turns: AIBrainConversationTurn[]
 visibleTurns: AIBrainConversationTurn[]
 latestVisibleTurn: AIBrainConversationTurn | null
 questionAnswers: NonNullable<AIBrainConversationTurn["questionAnswers"]>
 history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>
}

export const visibleBrainConversationTurns = (
 turns: AIBrainConversationTurn[],
): AIBrainConversationTurn[] => turns.filter((turn) =>
 Boolean(turn.response)
 && !NON_CONVERSATION_SOURCES.has(String(turn.metadata?.source || "")),
)

export const buildBrainConversationHistory = (
 turnsNewestFirst: AIBrainConversationTurn[],
 limit = 4,
): BrainConversationState["history"] => turnsNewestFirst
 .filter((turn) => Boolean(turn.response))
 .slice(0, limit)
 .reverse()
 .flatMap((turn) => [
  { role: "user" as const, parts: [{ text: turn.userText }] },
  { role: "model" as const, parts: [{ text: turn.assistantText }] },
 ])

export const normalizeBrainConversationState = (
 thread: AIBrainConversationThread,
 persistedTurns: AIBrainConversationTurn[],
): BrainConversationState => {
 // Persistence returns the durable thread in chronological order. Creator surfaces
 // consume newest-first state so they all share the same ordering contract.
 const turns = persistedTurns.slice().reverse()
 const visibleTurns = visibleBrainConversationTurns(turns)
 return {
  thread,
  turns,
  visibleTurns,
  latestVisibleTurn: visibleTurns[0] || null,
  questionAnswers: turns.flatMap((turn) => turn.questionAnswers || []),
  history: buildBrainConversationHistory(turns),
 }
}

export const loadBrainConversationState = async (
 channelId?: string | null,
): Promise<BrainConversationState> => {
 const resumed = await resumeAIBrainThread(channelId)
 return normalizeBrainConversationState(resumed.thread, resumed.turns)
}

export type BrainConversationChangedDetail = {
 channelId: string | null
 source: string
 turnId?: string | null
 changedAt: string
}

export const notifyBrainConversationChanged = ({
 channelId,
 source,
 turnId = null,
}: Omit<BrainConversationChangedDetail, "changedAt">): void => {
 if (typeof window === "undefined") return
 window.dispatchEvent(new CustomEvent<BrainConversationChangedDetail>(BRAIN_CONVERSATION_CHANGED_EVENT, {
  detail: {
   channelId: channelId || null,
   source,
   turnId,
   changedAt: new Date().toISOString(),
  },
 }))
}

export const subscribeBrainConversationChanges = (
 channelId: string | null | undefined,
 listener: (detail: BrainConversationChangedDetail) => void,
): (() => void) => {
 if (typeof window === "undefined") return () => undefined
 const normalizedChannelId = channelId || null
 const handler = (event: Event) => {
  const detail = (event as CustomEvent<BrainConversationChangedDetail>).detail
  if (!detail || detail.channelId !== normalizedChannelId) return
  listener(detail)
 }
 window.addEventListener(BRAIN_CONVERSATION_CHANGED_EVENT, handler as EventListener)
 return () => window.removeEventListener(BRAIN_CONVERSATION_CHANGED_EVENT, handler as EventListener)
}
