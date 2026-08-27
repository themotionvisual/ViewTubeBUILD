import type {
 BrainMemoryClaim,
 ChannelEvidencePacket,
 ChannelKnowledgeModel,
 NicheKnowledgeProfile,
 ToolContextPack,
} from "../../types"
import {
 getLatestChannelEvidencePacketDB,
 getLatestChannelKnowledgeModelDB,
 getLatestNicheKnowledgeProfileDB,
 getLatestToolContextPackDB,
 listBrainMemoryClaimsDB,
} from "./Persistence"
import { readBrainUserControls } from "./BrainUserControls"

export interface BrainChannelProfileBundle {
 channelId: string
 personalizationEnabled: boolean
 analyticsEnabled: boolean
 knowledgeModel: ChannelKnowledgeModel | null
 toolContextPack: ToolContextPack | null
 evidencePacket: ChannelEvidencePacket | null
 nicheKnowledge: NicheKnowledgeProfile | null
 memoryClaims: BrainMemoryClaim[]
 loadedAt: string
}

/**
 * Canonical channel-profile reader for all Brain-aware tools.
 *
 * The profile is assembled from the EXISTING Brain onboarding/persistence
 * stores rather than introducing a second profile database. Each connected
 * channel is loaded independently using its channelId.
 */
export const loadBrainChannelProfile = async (
 channelId: string,
): Promise<BrainChannelProfileBundle> => {
 const controls = readBrainUserControls(channelId)
 if (!controls.enabled || !controls.personalization) {
  return {
   channelId,
   personalizationEnabled: false,
   analyticsEnabled: controls.allowAnalytics,
   knowledgeModel: null,
   toolContextPack: null,
   evidencePacket: null,
   nicheKnowledge: null,
   memoryClaims: [],
   loadedAt: new Date().toISOString(),
  }
 }

 const [knowledgeModel, toolContextPack, evidencePacket, nicheKnowledge, memoryClaims] =
  await Promise.all([
   getLatestChannelKnowledgeModelDB(channelId),
   getLatestToolContextPackDB(channelId),
   controls.allowAnalytics ? getLatestChannelEvidencePacketDB(channelId) : Promise.resolve(null),
   getLatestNicheKnowledgeProfileDB(channelId),
   listBrainMemoryClaimsDB(channelId),
  ])

 return {
  channelId,
  personalizationEnabled: true,
  analyticsEnabled: controls.allowAnalytics,
  knowledgeModel,
  toolContextPack,
  evidencePacket,
  nicheKnowledge,
  memoryClaims: memoryClaims.filter((claim) => claim.status !== "retired"),
  loadedAt: new Date().toISOString(),
 }
}

const clip = (value: unknown, maximum = 1200): string => {
 const text = typeof value === "string" ? value : JSON.stringify(value || "")
 return text.length > maximum ? `${text.slice(0, maximum)}…` : text
}

/**
 * Compact, tool-safe profile context. Full raw evidence remains in the
 * canonical stores and is retrieved only when a specific tool needs it.
 */
export const buildToolChannelProfileContext = async (input: {
 channelId: string
 toolId: string
}): Promise<{
 channelId: string
 toolId: string
 profileSummary: string
 learnedClaims: string[]
 analyticsAvailable: boolean
}> => {
 const profile = await loadBrainChannelProfile(input.channelId)
 if (!profile.personalizationEnabled) {
  return {
   channelId: input.channelId,
   toolId: input.toolId,
   profileSummary: "Channel personalization is disabled by the creator.",
   learnedClaims: [],
   analyticsAvailable: false,
  }
 }

 const summaryParts = [
  profile.toolContextPack ? clip(profile.toolContextPack) : "",
  profile.knowledgeModel ? clip(profile.knowledgeModel) : "",
  profile.nicheKnowledge ? clip(profile.nicheKnowledge, 800) : "",
 ].filter(Boolean)

 return {
  channelId: input.channelId,
  toolId: input.toolId,
  profileSummary: summaryParts.join("\n").slice(0, 2600) || "No channel profile has been learned yet.",
  learnedClaims: profile.memoryClaims.slice(0, 12).map((claim) => claim.statement),
  analyticsAvailable: profile.analyticsEnabled && Boolean(profile.evidencePacket),
 }
}
