import type { AIBrainEvidenceIntent, CreatorBrainResponse } from "../../types"
import type {
 BrainCreatorAssetKind,
 BrainTaskProfile,
 BrainTaskProfileId,
} from "./BrainTaskProfileRegistry"

export type BrainContextOmission =
 | "channel_scope_missing"
 | "analytics_disabled"
 | "personalization_disabled"
 | "algorithm_intelligence_disabled"
 | "project_context_missing"

export interface BrainContextRequirements {
 canonicalAnalytics: boolean
 statistics: boolean
 audience: boolean
 algorithm: boolean
 channelKnowledge: boolean
 nicheKnowledge: boolean
 currentResearch: boolean
 projectContext: boolean
}

export interface BrainContextPlan {
 version: "vt-brain-context-plan-v1"
 taskProfileId: BrainTaskProfileId
 intent: AIBrainEvidenceIntent
 answerMode: CreatorBrainResponse["mode"]
 capabilityIds: string[]
 requires: BrainContextRequirements
 budget: {
  maximumCharacters: number
  channelKnowledgeRecords: number
  analyticsEvidenceCharacters: number
  audienceEvidenceCharacters: number
 }
 requestedOutputs: string[]
 requestedCount: number
 explicitSubject: string | null
 omissions: BrainContextOmission[]
}

const maximumCharactersFor = (task: BrainTaskProfile): number => {
 if (task.id === "creator_asset_draft") return 26_000
 if (["analytics", "audience", "revenue", "best_video_autopsy"].includes(task.id)) return 28_000
 return 24_000
}

const outputKindsFor = (task: BrainTaskProfile): string[] => {
 if (task.assetKind) return [task.assetKind satisfies BrainCreatorAssetKind]
 return [task.answerMode]
}

export const resolveBrainContextPlan = (input: {
 taskProfile: BrainTaskProfile
 capabilityIds: string[]
 channelId?: string | null
 projectId?: string | null
 personalizationEnabled: boolean
 analyticsEnabled: boolean
 algorithmEnabled: boolean
 timelyRequest: boolean
}): BrainContextPlan => {
 const capabilityIds = [...new Set(input.capabilityIds)]
 const hasCapability = (id: string): boolean => capabilityIds.includes(id)
 const hasChannel = Boolean(input.channelId)
 const analyticsRequested = capabilityIds.some((id) => [
  "statistics-intelligence",
  "algorithm-intelligence",
  "signal-anomaly-intelligence",
  "analytics-diagnosis",
  "top-performer-mining",
 ].includes(id))

 const statistics = hasChannel
  && input.analyticsEnabled
  && hasCapability("statistics-intelligence")
 const audience = statistics
  && input.taskProfile.intent === "audience"
  && hasCapability("audience-promise")
 const algorithm = hasChannel
  && input.analyticsEnabled
  && input.algorithmEnabled
  && hasCapability("algorithm-intelligence")
 const channelKnowledge = hasChannel && input.personalizationEnabled
 const projectContext = Boolean(input.projectId) && hasChannel
 const omissions: BrainContextOmission[] = []

 if (!hasChannel) omissions.push("channel_scope_missing")
 if (analyticsRequested && !input.analyticsEnabled) omissions.push("analytics_disabled")
 if (!input.personalizationEnabled) omissions.push("personalization_disabled")
 if (hasCapability("algorithm-intelligence") && !input.algorithmEnabled) {
  omissions.push("algorithm_intelligence_disabled")
 }
 if (algorithm && !input.projectId) omissions.push("project_context_missing")

 return {
  version: "vt-brain-context-plan-v1",
  taskProfileId: input.taskProfile.id,
  intent: input.taskProfile.intent,
  answerMode: input.taskProfile.answerMode,
  capabilityIds,
  requires: {
   canonicalAnalytics: statistics || audience || algorithm,
   statistics,
   audience,
   algorithm,
   channelKnowledge,
   nicheKnowledge: hasCapability("niche-knowledge"),
   currentResearch: input.timelyRequest,
   projectContext,
  },
  budget: {
   maximumCharacters: maximumCharactersFor(input.taskProfile),
   channelKnowledgeRecords: input.taskProfile.id === "creator_asset_draft" ? 12 : 10,
   analyticsEvidenceCharacters: audience ? 16_000 : 12_000,
   audienceEvidenceCharacters: audience ? 4_200 : 0,
  },
  requestedOutputs: outputKindsFor(input.taskProfile),
  requestedCount: input.taskProfile.requestedCount,
  explicitSubject: input.taskProfile.explicitSubject,
  omissions,
 }
}
