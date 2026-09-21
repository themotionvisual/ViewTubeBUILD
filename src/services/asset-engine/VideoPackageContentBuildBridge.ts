import type { PackageArtifactRef, ViewTubeVideoPackage } from "../video-package/contracts"
import {
 attachAssetToContentBuild,
 bindYouTubeVideo,
 createContentBuild,
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
   finalRenderAssetId: videoPackage.production.renderIds.at(-1) || null,
   toolId: "video-package",
  })
 }

 return getContentBuild(build.id)!
}
