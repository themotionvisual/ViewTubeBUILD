import type { AlgorithmProjectContext } from "./AlgorithmIntelligenceOrchestrator"
import {
 buildChannelKnowledgeContextFromProfile,
 loadBrainChannelProfile,
 type BrainChannelProfileBundle,
} from "./ChannelProfileAdapter"
import type { ChannelKnowledgeRetrieval } from "./ChannelKnowledgeProjection"
import { buildAlgorithmProjectContext } from "./BrainProjectContext"
import type { BrainLiveSurfaceContext } from "./BrainSurfaceContext"
import type { BrainSurfaceSelection } from "./BrainSurfaceSelection"
import {
 readBrainUserControls,
 type BrainUserControls,
} from "./BrainUserControls"
import {
 resolveStyleProfile,
 type StyleProfile,
} from "./StyleProfile"

export const CREATOR_CONTEXT_VERSION = "vt-creator-context-v1" as const

export interface ResolveCreatorContextInput {
 channelId?: string | null
 query: string
 projectId?: string | null
 visibleContext?: Record<string, unknown> | null
 artifactRefs?: string[]
 assetType?: string
 surface?: BrainLiveSurfaceContext | null
 selection?: BrainSurfaceSelection | null
}

export interface CreatorContextEnvelope {
 version: typeof CREATOR_CONTEXT_VERSION
 channelId: string | null
 controls: BrainUserControls
 profile: BrainChannelProfileBundle | null
 channelKnowledge: ChannelKnowledgeRetrieval | null
 styleProfile: StyleProfile | null
 project: AlgorithmProjectContext | null
 surface: BrainLiveSurfaceContext | null
 selection: BrainSurfaceSelection | null
 evidenceRefs: string[]
 provenance: {
  profileLoadedAt: string | null
  selectionUpdatedAt: string | null
  projectSource: "visible_context" | null
 }
}

export interface CreatorContextResolverDependencies {
 readControls: (channelId?: string | null) => BrainUserControls
 loadProfile: (channelId: string) => Promise<BrainChannelProfileBundle>
 buildKnowledge: (input: {
  profile: BrainChannelProfileBundle
  query: string
  limit?: number
 }) => ChannelKnowledgeRetrieval | null
 resolveStyle: (input: {
  channelId: string
  assetType?: string
 }) => StyleProfile | null
 buildProject: (input: {
  channelId?: string | null
  projectId?: string | null
  visibleContext?: Record<string, unknown> | null
  artifactRefs?: string[]
 }) => AlgorithmProjectContext | null
}

const DEFAULT_DEPENDENCIES: CreatorContextResolverDependencies = {
 readControls: readBrainUserControls,
 loadProfile: loadBrainChannelProfile,
 buildKnowledge: buildChannelKnowledgeContextFromProfile,
 resolveStyle: resolveStyleProfile,
 buildProject: buildAlgorithmProjectContext,
}

const cleanId = (value?: string | null): string | null => {
 const normalized = String(value || "").trim()
 return normalized || null
}

const uniqueRefs = (...groups: Array<string[] | undefined>): string[] =>
 Array.from(new Set(groups.flatMap((group) => group || []).map((value) => String(value || "").trim()).filter(Boolean))).slice(0, 100)

/**
 * Read-only convergence facade over the existing canonical context owners.
 *
 * This deliberately introduces no new persistence. It resolves the context
 * already owned by Channel Profile/Knowledge, Style, Project and surface
 * selection systems into one bounded envelope for Brain-aware consumers.
 */
export const resolveCreatorContext = async (
 input: ResolveCreatorContextInput,
 dependencies: CreatorContextResolverDependencies = DEFAULT_DEPENDENCIES,
): Promise<CreatorContextEnvelope> => {
 const channelId = cleanId(input.channelId)
 const controls = dependencies.readControls(channelId)
 const evidenceRefs = uniqueRefs(input.artifactRefs, input.selection?.evidenceIds)

 let profile: BrainChannelProfileBundle | null = null
 let channelKnowledge: ChannelKnowledgeRetrieval | null = null
 let styleProfile: StyleProfile | null = null

 if (channelId && controls.enabled && controls.personalization) {
  profile = await dependencies.loadProfile(channelId)
  if (profile.personalizationEnabled) {
   channelKnowledge = dependencies.buildKnowledge({
    profile,
    query: input.query,
    limit: 10,
   })
   styleProfile = dependencies.resolveStyle({
    channelId,
    assetType: input.assetType,
   })
  }
 }

 const project = channelId && input.projectId && controls.enabled && controls.allowProjects
  ? dependencies.buildProject({
    channelId,
    projectId: input.projectId,
    visibleContext: input.visibleContext,
    artifactRefs: evidenceRefs,
   })
  : null

 return {
  version: CREATOR_CONTEXT_VERSION,
  channelId,
  controls,
  profile,
  channelKnowledge,
  styleProfile,
  project,
  surface: input.surface || null,
  selection: input.selection || null,
  evidenceRefs,
  provenance: {
   profileLoadedAt: profile?.loadedAt || null,
   selectionUpdatedAt: input.selection?.updatedAt || null,
   projectSource: project ? "visible_context" : null,
  },
 }
}
