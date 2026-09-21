export const CONTENT_BUILD_SCHEMA_VERSION = 1 as const

export type ContentBuildStage =
 | "idea"
 | "research"
 | "concept"
 | "outline"
 | "script"
 | "storyboard"
 | "media"
 | "package"
 | "edit"
 | "review"
 | "scheduled"
 | "published"
 | "launch"
 | "monitor"
 | "evaluation"
 | "learning"
 | "archived"

export type ContentBuildFormat = "short" | "long" | "live" | "other"

export interface ContentBuildStyleProfile {
 tone?: string
 narrativeStyle?: string
 visualStyle?: string
 editingStyle?: string
 pacingStyle?: string
 voiceStyle?: string
 musicStyle?: string
 references?: string[]
 constraints?: string[]
 doNotDo?: string[]
}

export interface ContentBuildStrategyProfile {
 positioning?: string
 discoveryIntent?: string
 packagingIntent?: string
 retentionIntent?: string
 launchIntent?: string
 successDefinition?: string
}

export interface ContentBuildProfile {
 subject?: string
 topic?: string
 niche?: string
 subNiche?: string
 originalIdea?: string
 originalPrompt?: string
 workingConcept?: string
 intention?: string
 creatorGoal?: string
 audiencePromise?: string
 targetAudience?: string
 audienceSegments?: string[]
 format?: ContentBuildFormat
 plannedDurationSeconds?: number | null
 style?: ContentBuildStyleProfile
 strategy?: ContentBuildStrategyProfile
}

export type ContentBuildRelationType =
 | "derived-from"
 | "generated-from"
 | "edited-from"
 | "supports"
 | "used-by"
 | "selected-as"
 | "published-as"
 | "belongs-to"
 | "adapted-from"
 | "forked-from"
 | "evaluated-by"
 | "resulted-in"

export interface ContentBuildAssetRelation {
 id: string
 contentBuildId: string
 fromAssetId: string
 toAssetId: string
 relation: ContentBuildRelationType
 createdAt: string
 sourceToolId?: string | null
 metadata?: Record<string, unknown>
}

export interface ContentBuildYouTubeBinding {
 channelId?: string | null
 videoId: string
 canonicalUrl: string
 uploadStartedAt?: string | null
 uploadCompletedAt?: string | null
 scheduledAt?: string | null
 premiereAt?: string | null
 publishedAt?: string | null
 status: "uploaded" | "scheduled" | "published" | "private" | "unlisted" | "removed" | "unknown"
 initialTitleAssetId?: string | null
 initialThumbnailAssetId?: string | null
 finalRenderAssetId?: string | null
 lastVerifiedAt?: string | null
}

export interface ContentBuildWorkflowState {
 definitionId?: string | null
 instanceId?: string | null
 currentStepId?: string | null
 completedStepIds: string[]
 blockerIds: string[]
}

export interface ContentBuildSnapshot {
 schemaVersion: typeof CONTENT_BUILD_SCHEMA_VERSION
 id: string
 revision: number
 channelId?: string | null
 legacyProjectId?: string | null
 legacyProjectName?: string | null
 profile: ContentBuildProfile
 stage: ContentBuildStage
 assetIds: string[]
 selections: Record<string, string | null>
 relations: ContentBuildAssetRelation[]
 workflow: ContentBuildWorkflowState
 youtube?: ContentBuildYouTubeBinding | null
 createdAt: string
 updatedAt: string
}

export type ContentBuildEventType =
 | "build.created"
 | "profile.updated"
 | "stage.changed"
 | "asset.created"
 | "asset.attached"
 | "asset.detached"
 | "asset.versioned"
 | "asset.variant.created"
 | "asset.selected"
 | "asset.finalized"
 | "asset.relation.created"
 | "handoff.created"
 | "handoff.accepted"
 | "handoff.rejected"
 | "workflow.started"
 | "workflow.step.completed"
 | "workflow.blocker.added"
 | "workflow.blocker.resolved"
 | "youtube.bound"
 | "youtube.state.changed"
 | "analytics.checkpoint"
 | "comment.observed"
 | "comment.reply.posted"
 | "experiment.started"
 | "experiment.completed"
 | "learning.candidate.created"

export interface ContentBuildEvent<T = Record<string, unknown>> {
 id: string
 contentBuildId: string
 timestamp: string
 eventType: ContentBuildEventType
 entityType?: string | null
 entityId?: string | null
 actorType: "creator" | "brain" | "tool" | "youtube" | "analytics" | "sync" | "system"
 actorId?: string | null
 toolId?: string | null
 previousState?: unknown
 resultingState?: unknown
 inputAssetIds: string[]
 outputAssetIds: string[]
 evidenceIds: string[]
 generationRecordId?: string | null
 actionPacketId?: string | null
 traceId?: string | null
 metadata?: T
}

export interface CreateContentBuildInput {
 id?: string
 channelId?: string | null
 legacyProjectId?: string | null
 legacyProjectName?: string | null
 stage?: ContentBuildStage
 profile?: ContentBuildProfile
 createdAt?: string
 actorType?: ContentBuildEvent["actorType"]
 actorId?: string | null
 toolId?: string | null
}

export interface BindYouTubeVideoInput {
 contentBuildId: string
 videoId: string
 channelId?: string | null
 canonicalUrl?: string
 status?: ContentBuildYouTubeBinding["status"]
 uploadStartedAt?: string | null
 uploadCompletedAt?: string | null
 scheduledAt?: string | null
 premiereAt?: string | null
 publishedAt?: string | null
 initialTitleAssetId?: string | null
 initialThumbnailAssetId?: string | null
 finalRenderAssetId?: string | null
 lastVerifiedAt?: string | null
 toolId?: string | null
}
