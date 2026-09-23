import type { ContentBuildSnapshot } from "./contracts"
import { getContentBuild } from "./ContentBuildRepository"
import type { PackageArtifactRef, ViewTubeVideoPackage } from "../video-package/contracts"

export const PUBLISHING_PACKAGE_PROJECTION_VERSION = 1 as const

export interface PublishingPackageProjection {
 schemaVersion: typeof PUBLISHING_PACKAGE_PROJECTION_VERSION
 contentBuildId: string
 projectId: string
 videoPackageId: string
 revision: number
 titleAssetId: string | null
 thumbnailAssetId: string | null
 scriptAssetId: string | null
 storyboardAssetId: string | null
 finalRenderAssetId: string | null
 descriptionAssetId: string | null
 tagsAssetId: string | null
 endScreenAssetId: string | null
 outroAssetId: string | null
 scheduledAt: string | null
 publishedVideoId: string | null
 approval: ViewTubeVideoPackage["publishing"]["approval"]
 checks: ViewTubeVideoPackage["publishing"]["checks"]
 blockers: ViewTubeVideoPackage["workflow"]["blockers"]
 ready: boolean
 missing: PublishingRequirement[]
}

export type PublishingRequirement =
 | "title"
 | "thumbnail"
 | "final-render"
 | "description"
 | "approval"
 | "checks"
 | "blockers"

const assetIdOf = (artifact?: PackageArtifactRef | null) =>
 artifact ? (artifact.vaultAssetId || artifact.id) : null

const selectedPackageAsset = (
 artifacts: PackageArtifactRef[],
 selectedId?: string | null,
) => assetIdOf(artifacts.find(artifact => artifact.id === selectedId))

const resolveSelection = (
 build: ContentBuildSnapshot,
 slot: string,
 packageFallback?: string | null,
) => build.selections[slot] || packageFallback || null

/**
 * A read-only publication projection. It deliberately has no repository/storage
 * of its own: ContentBuild owns durable selections and the Video Package owns
 * publication configuration/approval.
 */
export const projectPublishingPackage = (
 videoPackage: ViewTubeVideoPackage,
): PublishingPackageProjection => {
 const contentBuildId = videoPackage.contentBuildId?.trim() || videoPackage.id
 const build = getContentBuild(contentBuildId)
 if (!build) throw new Error("Unknown ContentBuild: " + contentBuildId)

 const titleAssetId = resolveSelection(
  build,
  "title",
  selectedPackageAsset(videoPackage.packaging.titleVariants, videoPackage.packaging.selectedTitleId),
 )
 const thumbnailAssetId = resolveSelection(
  build,
  "thumbnail",
  selectedPackageAsset(videoPackage.packaging.thumbnailVariants, videoPackage.packaging.selectedThumbnailId),
 )
 const scriptAssetId = resolveSelection(build, "script", assetIdOf(videoPackage.creative.script))
 const storyboardAssetId = resolveSelection(build, "storyboard", assetIdOf(videoPackage.creative.storyboard))
 const finalRenderAssetId = resolveSelection(
  build,
  "final-render",
  videoPackage.production.renderIds.at(-1) || null,
 )
 const descriptionAssetId = resolveSelection(build, "description", assetIdOf(videoPackage.packaging.description))
 const tagsAssetId = resolveSelection(build, "tags", assetIdOf(videoPackage.packaging.tags))
 const endScreenAssetId = resolveSelection(build, "end-screen", assetIdOf(videoPackage.packaging.endScreen))
 const outroAssetId = resolveSelection(build, "outro", assetIdOf(videoPackage.packaging.outro))

 const missing: PublishingRequirement[] = []
 if (!titleAssetId) missing.push("title")
 if (!thumbnailAssetId) missing.push("thumbnail")
 if (!finalRenderAssetId) missing.push("final-render")
 if (!descriptionAssetId) missing.push("description")
 if (videoPackage.publishing.approval.status !== "approved") missing.push("approval")
 if (videoPackage.publishing.checks.some(check => check.required && !check.passed)) missing.push("checks")
 if (videoPackage.workflow.blockers.some(blocker => blocker.severity === "blocking" && !blocker.resolved)) missing.push("blockers")

 return {
  schemaVersion: PUBLISHING_PACKAGE_PROJECTION_VERSION,
  contentBuildId: build.id,
  projectId: videoPackage.projectId,
  videoPackageId: videoPackage.id,
  revision: build.revision,
  titleAssetId,
  thumbnailAssetId,
  scriptAssetId,
  storyboardAssetId,
  finalRenderAssetId,
  descriptionAssetId,
  tagsAssetId,
  endScreenAssetId,
  outroAssetId,
  scheduledAt: build.youtube?.scheduledAt || videoPackage.publishing.scheduledAt || null,
  publishedVideoId: build.youtube?.videoId || videoPackage.publishing.publishedVideoId || null,
  approval: videoPackage.publishing.approval,
  checks: videoPackage.publishing.checks,
  blockers: videoPackage.workflow.blockers,
  ready: missing.length === 0,
  missing,
 }
}
