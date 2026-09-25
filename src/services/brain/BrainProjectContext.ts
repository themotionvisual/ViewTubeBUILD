import type { AlgorithmProjectContext } from "./AlgorithmIntelligenceOrchestrator"

const text = (value: unknown): string | null =>
 typeof value === "string" && value.trim() ? value.trim() : null

export const buildAlgorithmProjectContext = (input: {
 channelId?: string | null
 projectId?: string | null
 visibleContext?: Record<string, unknown> | null
 artifactRefs?: string[]
}): AlgorithmProjectContext | null => {
 if (!input.channelId || !input.projectId) return null
 const visible = input.visibleContext || {}
 return {
  channelId: input.channelId,
  projectId: input.projectId,
  contentBuildId: text(visible.contentBuildId),
  title: text(visible.title),
  topic: text(visible.topic),
  format: text(visible.format),
  plannedPublishAt: text(visible.plannedPublishAt),
  evidenceIds: Array.from(new Set(input.artifactRefs || [])).slice(0, 50),
 }
}
