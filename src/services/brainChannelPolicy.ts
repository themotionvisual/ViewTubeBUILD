import type { BrainOrchestrationMode, BrainChannelProfile } from "./brainAdaptiveOrchestrator"

export interface BrainChannelPolicy {
  channelId: string
  mode: BrainOrchestrationMode
  allowLearning: boolean
  allowCrossToolContext: boolean
  allowAutomaticHandoffs: boolean
  requireApprovalForPublishing: boolean
  requireEvidenceForRecommendations: boolean
  profile: BrainChannelProfile
  updatedAt: number
}

const KEY = "viewtube:brain-channel-policies:v1"
const read = (): BrainChannelPolicy[] => {
  if (typeof window === "undefined") return []
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]") as BrainChannelPolicy[] } catch { return [] }
}
const write = (rows: BrainChannelPolicy[]) => { if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0,100))) }

export const getBrainChannelPolicy = (channelId: string): BrainChannelPolicy => read().find(row => row.channelId === channelId) || {
  channelId,
  mode: "guided",
  allowLearning: true,
  allowCrossToolContext: true,
  allowAutomaticHandoffs: false,
  requireApprovalForPublishing: true,
  requireEvidenceForRecommendations: true,
  profile: { channelId, priorities: ["grow", "learn"] },
  updatedAt: Date.now(),
}

export const saveBrainChannelPolicy = (policy: BrainChannelPolicy) => {
  const next = { ...policy, updatedAt: Date.now() }
  write([next, ...read().filter(row => row.channelId !== policy.channelId)])
  return next
}

export const patchBrainChannelPolicy = (channelId: string, patch: Partial<Omit<BrainChannelPolicy,"channelId"|"updatedAt">>) => saveBrainChannelPolicy({ ...getBrainChannelPolicy(channelId), ...patch, channelId })

export const canBrainAutoHandoff = (policy: BrainChannelPolicy) => policy.mode === "automatic" && policy.allowAutomaticHandoffs
export const canBrainPublishWithoutApproval = (_policy: BrainChannelPolicy) => false
