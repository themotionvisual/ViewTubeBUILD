import type { PackageArtifactRef, ViewTubeVideoPackage } from "../video-package/contracts"
import {
 attachAssetToContentBuild,
 addContentBuildVariant,
 bindYouTubeVideo,
 createContentBuild,
 createContentBuildAssetVersion,
 createContentBuildVariantGroup,
 getContentBuild,
 setContentBuildSelection,
} from "./ContentBuildRepository"

const assetIdOf = (artifact?: PackageArtifactRef | null) =>
 artifact ? (artifact.vaultAssetId || artifact.id) : null

const packageArtifacts = (videoPackage: ViewTubeVideoPackage): PackageArtifactRef[] => [
 videoPackage.strategy.idea,
 videoPackage.strategy.angle,
 videoPackage.strategy.audience,
 ...videoPackage.creative.hooks,
 videoPackage.creative.script,
 videoPackage.creative.storyboard,
 ...videoPackage.creative.scenes,
 ...videoPackage.packaging.titleVariants,
 ...videoPackage.packaging.thumbnailVariants,
 videoPackage.packaging.description,
 videoPackage.packaging.tags,
 videoPackage.packaging.endScreen,
 videoPackage.packaging.outro,
 videoPackage.packaging.pinnedComment,
 ...videoPackage.packaging.communityAssets,
].filter((artifact): artifact is PackageArtifactRef => Boolean(artifact))

export const ensureContentBuildForVideoPackage = (videoPackage: ViewTubeVideoPackage) => {
 const explicitId = videoPackage.contentBuildId || videoPackage.id
 const existing = getContentBuild(explicitId)
 if (existing) return existing
 return createContentBuild({
  id: explicitId,
  channelId: videoPackage.channelId,
  legacyProjectId: videoPackage.projectId,
  legacyProjectName: videoPackage.identity.workingTitle,
  stage: videoPackage.identity.status === "published" || videoPackage.identity.status === "measuring"
   ? "published"
   : "package",
  profile: {
   workingConcept: videoPackage.identity.workingTitle,
   format: videoPackage.identity.format,
  },
  toolId: "video-package",
 })
}

export const syncVideoPackageToContentBuild = (videoPackage: ViewTubeVideoPackage) => {
 const build = ensureContentBuildForVideoPackage(videoPackage)

 const assetIds = new Set<string>(videoPackage.production.vaultAssetIds)
 packageArtifacts(videoPackage).forEach(artifact => {
  const assetId = assetIdOf(artifact)
  if (assetId) assetIds.add(assetId)
 })
 videoPackage.production.renderIds.forEach(assetId => assetIds.add(assetId))

 assetIds.forEach(assetId => {
  attachAssetToContentBuild(build.id, assetId, {
   toolId: "video-package",
   metadata: { packageId: videoPackage.id },
  })
 })

 const synchronizeOptionGroup = (slot: "title" | "thumbnail", artifacts: PackageArtifactRef[]) => {
  if (!artifacts.length) return
  const group = createContentBuildVariantGroup({
   contentBuildId: build.id,
   slot,
   label: slot === "title" ? "Video Package Title Options" : "Video Package Thumbnail Options",
   sourceToolId: "video-package",
   metadata: { packageId: videoPackage.id },
  })
  artifacts.forEach(artifact => {
   const assetId = assetIdOf(artifact)
   if (!assetId) return
   const current = getContentBuild(build.id)!
   const existingVersion = current.versions.find(version =>
    version.assetId === assetId && version.slot === slot
   )
   const version = existingVersion || createContentBuildAssetVersion({
    contentBuildId: build.id,
    assetId,
    slot,
    label: artifact.label,
    sourceToolId: artifact.sourceToolId,
    metadata: { packageId: videoPackage.id, packageArtifactId: artifact.id, packageVersion: artifact.version },
   })
   addContentBuildVariant({
    contentBuildId: build.id,
    groupId: group.id,
    assetId,
    versionId: version.id,
    label: artifact.label,
    sourceToolId: artifact.sourceToolId,
    metadata: { packageId: videoPackage.id, packageArtifactId: artifact.id },
   })
  })
 }

 synchronizeOptionGroup("title", videoPackage.packaging.titleVariants)
 synchronizeOptionGroup("thumbnail", videoPackage.packaging.thumbnailVariants)

 const selectedTitle = videoPackage.packaging.titleVariants.find(
  artifact => artifact.id === videoPackage.packaging.selectedTitleId,
 )
 const selectedThumbnail = videoPackage.packaging.thumbnailVariants.find(
  artifact => artifact.id === videoPackage.packaging.selectedThumbnailId,
 )

 const selectedTitleAssetId = assetIdOf(selectedTitle)
 const selectedThumbnailAssetId = assetIdOf(selectedThumbnail)
 const scriptAssetId = assetIdOf(videoPackage.creative.script)

 if (selectedTitleAssetId) {
  setContentBuildSelection(build.id, "title", selectedTitleAssetId, { toolId: "video-package", final: true })
 }
 if (selectedThumbnailAssetId) {
  setContentBuildSelection(build.id, "thumbnail", selectedThumbnailAssetId, { toolId: "video-package", final: true })
 }
 if (scriptAssetId) {
  setContentBuildSelection(build.id, "script", scriptAssetId, {
   toolId: "video-package",
   final: Boolean(videoPackage.creative.script?.approvedAt),
  })
 }

 if (videoPackage.publishing.publishedVideoId) {
  return bindYouTubeVideo({
   contentBuildId: build.id,
   videoId: videoPackage.publishing.publishedVideoId,
   channelId: videoPackage.channelId,
   status: videoPackage.identity.status === "published" || videoPackage.identity.status === "measuring"
    ? "published"
    : "uploaded",
   scheduledAt: videoPackage.publishing.scheduledAt || null,
   initialTitleAssetId: selectedTitleAssetId,
   initialThumbnailAssetId: selectedThumbnailAssetId,
   finalRenderAssetId: videoPackage.production.renderIds.length ? videoPackage.production.renderIds[videoPackage.production.renderIds.length - 1] : null,
   toolId: "video-package",
  })
 }

 return getContentBuild(build.id)!
}


/**
 * Projects canonical ContentBuild selections back into the Video Package shape.
 * This is intentionally a projection: ContentBuild remains authoritative for
 * selected/final durable assets while the package retains its structured spec.
 */
export const projectContentBuildSelectionsToVideoPackage = (
 videoPackage: ViewTubeVideoPackage,
): ViewTubeVideoPackage => {
 const contentBuildId = videoPackage.contentBuildId || videoPackage.id
 const build = getContentBuild(contentBuildId)
 if (!build) return videoPackage

 const titleAssetId = build.selections.title || null
 const thumbnailAssetId = build.selections.thumbnail || null
 const scriptAssetId = build.selections.script || null
 const finalRenderAssetId = build.selections["final-render"] || build.youtube?.finalRenderAssetId || null

 const packageArtifactId = (artifacts: PackageArtifactRef[], canonicalAssetId: string | null) => {
  if (!canonicalAssetId) return null
  return artifacts.find(artifact => assetIdOf(artifact) === canonicalAssetId)?.id || null
 }

 const titleId = packageArtifactId(videoPackage.packaging.titleVariants, titleAssetId)
 const thumbnailId = packageArtifactId(videoPackage.packaging.thumbnailVariants, thumbnailAssetId)
 const renderIds = finalRenderAssetId && !videoPackage.production.renderIds.includes(finalRenderAssetId)
  ? [...videoPackage.production.renderIds, finalRenderAssetId]
  : videoPackage.production.renderIds

 return {
  ...videoPackage,
  packaging: {
   ...videoPackage.packaging,
   selectedTitleId: titleId || videoPackage.packaging.selectedTitleId || null,
   selectedThumbnailId: thumbnailId || videoPackage.packaging.selectedThumbnailId || null,
  },
  production: { ...videoPackage.production, renderIds },
  publishing: {
   ...videoPackage.publishing,
   publishedVideoId: build.youtube?.videoId || videoPackage.publishing.publishedVideoId || null,
   scheduledAt: build.youtube?.scheduledAt || videoPackage.publishing.scheduledAt || null,
  },
 }
}
