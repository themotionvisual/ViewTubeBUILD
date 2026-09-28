import type { ViewTubeVideoPackage } from "./video-package/contracts"
import {
 createViewTubeActionPacket,
 getViewTubeToolCapability,
 persistViewTubeActionPacket,
} from "./viewTubeToolChains"

export type PackagingDiagnosis =
 | "repackage"
 | "content-friction"
 | "hold"
 | "mixed"
 | "insufficient-evidence"

export interface PackagingIntelligenceVideoInput {
 videoId: string
 title: string
 thumbnailUrl?: string | null
 description?: string | null
 tags?: string[]
 views?: number | null
 impressions?: number | null
 ctr?: number | null
 avp?: number | null
 watchTimeHours?: number | null
}

export interface PackagingIntelligencePackageSummary {
 packageId: string | null
 contentBuildId: string | null
 projectId: string | null
 titleVariants: number
 thumbnailVariants: number
 selectedTitleId: string | null
 selectedTitleLabel: string | null
 selectedThumbnailId: string | null
 selectedThumbnailLabel: string | null
 hasDescription: boolean
 hasTags: boolean
 evidenceIds: string[]
 openBlockers: number
 experimentEvents: number
 provenanceEvents: number
}

export interface PackagingIntelligenceResult {
 videoId: string
 title: string
 diagnosis: PackagingDiagnosis
 opportunityScore: number
 confidence: "low" | "medium" | "high"
 headline: string
 rationale: string
 recommendedTarget: "packaging-lab-pro" | "content-analysis" | null
 metrics: {
  impressions: number | null
  ctr: number | null
  avp: number | null
  views: number | null
  watchTimeHours: number | null
 }
 package: PackagingIntelligencePackageSummary
 evidenceIds: string[]
 missingEvidence: string[]
}

const emptyPackageSummary = (): PackagingIntelligencePackageSummary => ({
 packageId: null,
 contentBuildId: null,
 projectId: null,
 titleVariants: 0,
 thumbnailVariants: 0,
 selectedTitleId: null,
 selectedTitleLabel: null,
 selectedThumbnailId: null,
 selectedThumbnailLabel: null,
 hasDescription: false,
 hasTags: false,
 evidenceIds: [],
 openBlockers: 0,
 experimentEvents: 0,
 provenanceEvents: 0,
})

const finite = (value: number | null | undefined): number | null => {
 if (value === null || value === undefined) return null
 const numeric = Number(value)
 return Number.isFinite(numeric) ? numeric : null
}

const asPercent = (value: number | null | undefined): number | null => {
 const numeric = finite(value)
 if (numeric === null) return null
 if (numeric > 0 && numeric <= 1) return numeric * 100
 return numeric
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export const summarizeVideoPackage = (
 videoPackage: ViewTubeVideoPackage | null | undefined,
): PackagingIntelligencePackageSummary => {
 if (!videoPackage) return emptyPackageSummary()
 const selectedTitle = videoPackage.packaging.titleVariants.find(
  variant => variant.id === videoPackage.packaging.selectedTitleId,
 )
 const selectedThumbnail = videoPackage.packaging.thumbnailVariants.find(
  variant => variant.id === videoPackage.packaging.selectedThumbnailId,
 )
 const evidenceIds = new Set<string>()
 videoPackage.strategy.evidence.forEach(item => evidenceIds.add(item.id))
 videoPackage.provenance.forEach(item => item.evidenceIds.forEach(id => evidenceIds.add(id)))
 return {
  packageId: videoPackage.id,
  contentBuildId: videoPackage.contentBuildId || null,
  projectId: videoPackage.projectId || null,
  titleVariants: videoPackage.packaging.titleVariants.length,
  thumbnailVariants: videoPackage.packaging.thumbnailVariants.length,
  selectedTitleId: videoPackage.packaging.selectedTitleId || null,
  selectedTitleLabel: selectedTitle?.label || null,
  selectedThumbnailId: videoPackage.packaging.selectedThumbnailId || null,
  selectedThumbnailLabel: selectedThumbnail?.label || null,
  hasDescription: Boolean(videoPackage.packaging.description),
  hasTags: Boolean(videoPackage.packaging.tags),
  evidenceIds: [...evidenceIds],
  openBlockers: videoPackage.workflow.blockers.filter(blocker => !blocker.resolved).length,
  experimentEvents: videoPackage.provenance.filter(item => /experiment|test/i.test(item.action)).length,
  provenanceEvents: videoPackage.provenance.length,
 }
}

export const derivePackagingIntelligence = (
 video: PackagingIntelligenceVideoInput,
 packageSummary: PackagingIntelligencePackageSummary = emptyPackageSummary(),
): PackagingIntelligenceResult => {
 const impressions = finite(video.impressions)
 const ctr = asPercent(video.ctr)
 const avp = asPercent(video.avp)
 const views = finite(video.views)
 const watchTimeHours = finite(video.watchTimeHours)
 const missingEvidence: string[] = []
 if (impressions === null || impressions <= 0) missingEvidence.push("impressions")
 if (ctr === null) missingEvidence.push("ctr")
 if (avp === null) missingEvidence.push("avp")

 const hasEnoughExposure = (impressions || 0) >= 500
 const weakClick = ctr !== null && ctr < 4
 const strongClick = ctr !== null && ctr >= 6
 const strongWatch = avp !== null && avp >= 40
 const weakWatch = avp !== null && avp < 30

 let diagnosis: PackagingDiagnosis = "mixed"
 let headline = "Packaging signal is mixed"
 let rationale = "Click response and post-click quality do not yet isolate one clear packaging action."
 let recommendedTarget: PackagingIntelligenceResult["recommendedTarget"] = "packaging-lab-pro"
 let baseScore = 50

 if (!hasEnoughExposure || ctr === null || avp === null) {
  diagnosis = "insufficient-evidence"
  headline = "More comparable evidence is needed"
  rationale = "Packaging should not be changed from a thin sample or missing click/watch evidence."
  recommendedTarget = null
  baseScore = 10
 } else if (weakClick && strongWatch) {
  diagnosis = "repackage"
  headline = "Strong watch quality, weak click response"
  rationale = "People who click appear to watch well, while the click response is weak enough to justify a controlled packaging review."
  recommendedTarget = "packaging-lab-pro"
  baseScore = 82
 } else if (strongClick && weakWatch) {
  diagnosis = "content-friction"
  headline = "Packaging earns clicks; post-click quality is weak"
  rationale = "The package is attracting clicks, so title or thumbnail changes are unlikely to be the first problem to solve."
  recommendedTarget = "content-analysis"
  baseScore = 66
 } else if (ctr >= 4.5 && strongWatch) {
  diagnosis = "hold"
  headline = "Current package is earning healthy response"
  rationale = "Click response and watch quality are both healthy enough that an unnecessary package change could interrupt a working promise."
  recommendedTarget = null
  baseScore = 20
 }

 const exposureBonus = impressions && impressions > 0
  ? Math.min(12, Math.max(0, Math.log10(impressions) * 2))
  : 0
 const packageGapBonus = (
  packageSummary.selectedTitleId && packageSummary.selectedThumbnailId ? 0 : 4
 ) + (packageSummary.openBlockers > 0 ? 3 : 0)
 const opportunityScore = clamp(baseScore + (diagnosis === "repackage" ? exposureBonus + packageGapBonus : 0))
 const confidence: PackagingIntelligenceResult["confidence"] =
  !hasEnoughExposure || ctr === null || avp === null
   ? "low"
   : (impressions || 0) >= 10000
    ? "high"
    : "medium"

 return {
  videoId: video.videoId,
  title: video.title,
  diagnosis,
  opportunityScore,
  confidence,
  headline,
  rationale,
  recommendedTarget,
  metrics: { impressions, ctr, avp, views, watchTimeHours },
  package: packageSummary,
  evidenceIds: [...new Set(packageSummary.evidenceIds)],
  missingEvidence,
 }
}

export const rankPackagingIntelligenceCandidates = (
 videos: PackagingIntelligenceVideoInput[],
 packageByVideoId: Record<string, PackagingIntelligencePackageSummary> = {},
): PackagingIntelligenceResult[] => videos
 .map(video => derivePackagingIntelligence(video, packageByVideoId[video.videoId]))
 .sort((left, right) =>
  right.opportunityScore - left.opportunityScore
  || (right.metrics.impressions || 0) - (left.metrics.impressions || 0)
  || left.title.localeCompare(right.title),
 )

export const createPackagingIntelligenceHandoff = (input: {
 result: PackagingIntelligenceResult
 targetToolId: "packaging-lab-pro" | "thumbnail-studio" | "content-analysis"
 channelId?: string | null
}) => {
 const target = getViewTubeToolCapability(input.targetToolId)
 if (!target) throw new Error(`Unknown Packaging Intelligence handoff target: ${input.targetToolId}`)
 const packet = createViewTubeActionPacket({
  sourceToolId: "packaging-intelligence",
  sourceKind: "widget",
  payloadKind: "analysis",
  title: `${input.result.title} packaging intelligence`,
  summary: input.result.rationale,
  payload: {
   videoId: input.result.videoId,
   diagnosis: input.result.diagnosis,
   headline: input.result.headline,
   rationale: input.result.rationale,
   metrics: input.result.metrics,
   package: input.result.package,
   missingEvidence: input.result.missingEvidence,
   requestedTarget: input.targetToolId,
  },
  contentBuildId: input.result.package.contentBuildId,
  projectId: input.result.package.projectId,
  channelId: input.channelId || null,
  videoId: input.result.videoId,
  evidence: input.result.evidenceIds,
  provenance: [
   "analytics-canon/VT-SYNC",
   "VideoPackage/ContentBuild",
   "Packaging Intelligence",
  ],
  suggestedTargets: [input.targetToolId],
 })
 persistViewTubeActionPacket(packet)
 const separator = target.route.includes("?") ? "&" : "?"
 return {
  packet,
  route: `${target.route}${separator}handoff=${encodeURIComponent(packet.id)}`,
 }
}
