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
 selectContentBuildVariant,
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

export type VideoPackageContentBuildSyncMode = "strict" | "legacy"

export const ensureContentBuildForVideoPackage = (
 videoPackage: ViewTubeVideoPackage,
 input: { mode?: VideoPackageContentBuildSyncMode } = {},
) => {
 const explicitId = videoPackage.contentBuildId?.trim() || null
 if (!explicitId && (input.mode || "legacy") === "strict") {
  throw new Error(`Video Package ${videoPackage.id} must carry a canonical contentBuildId before it can be saved or synchronized.`)
 }
 const contentBuildId = explicitId || videoPackage.id
 const existing = getContentBuild(contentBuildId)
 if (existing) {
  if (existing.legacyProjectId && existing.legacyProjectId !== videoPackage.projectId) {
   throw new Error(`ContentBuild ${contentBuildId} belongs to a different Project (${existing.legacyProjectId}).`)
  }
  if (existing.channelId && existing.channelId !== videoPackage.channelId) {
   throw new Error(`ContentBuild ${contentBuildId} belongs to a different channel (${existing.channelId}).`)
  }
  return existing
 }
 return createContentBuild({
  id: contentBuildId,
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

export const syncVideoPackageToContentBuild = (
 videoPackage: ViewTubeVideoPackage,
 input: { mode?: VideoPackageContentBuildSyncMode } = {},
) => {
 const build = ensureContentBuildForVideoPackage(videoPackage, input)

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

 const synchronizeVersionedArtifact = (
  slot: "script" | "storyboard" | "final-render",
  artifact: PackageArtifactRef | null | undefined,
  assetIdOverride?: string | null,
 ) => {
  const assetId = assetIdOverride || assetIdOf(artifact)
  if (!assetId) return null
  const current = getContentBuild(build.id)!
  const existing = current.versions.find(version => version.assetId === assetId && version.slot === slot)
  return existing || createContentBuildAssetVersion({
   contentBuildId: build.id,
   assetId,
   slot,
   label: artifact?.label || (slot === "final-render" ? "Final render" : slot),
   sourceToolId: artifact?.sourceToolId || "video-package",
   metadata: {
    packageId: videoPackage.id,
    packageArtifactId: artifact?.id || null,
    packageVersion: artifact?.version || null,
   },
  })
 }

 synchronizeVersionedArtifact("script", videoPackage.creative.script)
 synchronizeVersionedArtifact("storyboard", videoPackage.creative.storyboard)
 const publicationArtifacts: Array<[string, PackageArtifactRef | undefined]> = [
  ["description", videoPackage.packaging.description],
  ["tags", videoPackage.packaging.tags],
  ["end-screen", videoPackage.packaging.endScreen],
  ["outro", videoPackage.packaging.outro],
 ]
 publicationArtifacts.forEach(([slot, artifact]) => {
  const assetId = assetIdOf(artifact)
  if (!assetId) return
  const current = getContentBuild(build.id)!
  if (current.selections[slot] !== assetId) {
   setContentBuildSelection(build.id, slot, assetId, {
    toolId: "video-package",
    actorType: "sync",
    final: Boolean(artifact?.approvedAt),
   })
  }
 })
 videoPackage.production.renderIds.forEach(renderId =>
  synchronizeVersionedArtifact("final-render", null, renderId)
 )

 const synchronizeOptionGroup = (slot: "title" | "thumbnail", artifacts: PackageArtifactRef[]) => {
  if (!artifacts.length) return null
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
  return group
 }

 const titleGroup = synchronizeOptionGroup("title", videoPackage.packaging.titleVariants)
 const thumbnailGroup = synchronizeOptionGroup("thumbnail", videoPackage.packaging.thumbnailVariants)

 const selectedTitle = videoPackage.packaging.titleVariants.find(
  artifact => artifact.id === videoPackage.packaging.selectedTitleId,
 )
 const selectedThumbnail = videoPackage.packaging.thumbnailVariants.find(
  artifact => artifact.id === videoPackage.packaging.selectedThumbnailId,
 )

 const selectedTitleAssetId = assetIdOf(selectedTitle)
 const selectedThumbnailAssetId = assetIdOf(selectedThumbnail)
 const scriptAssetId = assetIdOf(videoPackage.creative.script)
 const storyboardAssetId = assetIdOf(videoPackage.creative.storyboard)
 const finalRenderAssetId = videoPackage.production.renderIds.at(-1) || null

 const titleApproved = Boolean(selectedTitle?.approvedAt)
 const thumbnailApproved = Boolean(selectedThumbnail?.approvedAt)

 if (
  selectedTitleAssetId &&
  titleGroup &&
  (
   titleGroup.selectedAssetId !== selectedTitleAssetId ||
   (titleApproved && titleGroup.finalAssetId !== selectedTitleAssetId)
  )
 ) {
  selectContentBuildVariant({
   contentBuildId: build.id,
   groupId: titleGroup.id,
   assetId: selectedTitleAssetId,
   sourceToolId: "video-package",
   actorType: "sync",
   final: titleApproved,
  })
 }
 if (
  selectedThumbnailAssetId &&
  thumbnailGroup &&
  (
   thumbnailGroup.selectedAssetId !== selectedThumbnailAssetId ||
   (thumbnailApproved && thumbnailGroup.finalAssetId !== selectedThumbnailAssetId)
  )
 ) {
  selectContentBuildVariant({
   contentBuildId: build.id,
   groupId: thumbnailGroup.id,
   assetId: selectedThumbnailAssetId,
   sourceToolId: "video-package",
   actorType: "sync",
   final: thumbnailApproved,
  })
 }
 const currentAfterPackaging = getContentBuild(build.id)!
 if (scriptAssetId && currentAfterPackaging.selections.script !== scriptAssetId) {
  setContentBuildSelection(build.id, "script", scriptAssetId, {
   toolId: "video-package",
   actorType: "sync",
   final: Boolean(videoPackage.creative.script?.approvedAt),
  })
 }
 const currentAfterScript = getContentBuild(build.id)!
 if (storyboardAssetId && currentAfterScript.selections.storyboard !== storyboardAssetId) {
  setContentBuildSelection(build.id, "storyboard", storyboardAssetId, {
   toolId: "video-package",
   actorType: "sync",
   final: Boolean(videoPackage.creative.storyboard?.approvedAt),
  })
 }
 const currentAfterStoryboard = getContentBuild(build.id)!
 if (finalRenderAssetId && currentAfterStoryboard.selections["final-render"] !== finalRenderAssetId) {
  setContentBuildSelection(build.id, "final-render", finalRenderAssetId, {
   toolId: "video-package",
   actorType: "sync",
   final: videoPackage.identity.status === "scheduled" || videoPackage.identity.status === "published" || videoPackage.identity.status === "measuring",
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
   finalRenderAssetId,
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

 const projectOptionArtifacts = (
  slot: "title" | "thumbnail",
  stored: PackageArtifactRef[],
 ): PackageArtifactRef[] => {
  const groups = build.variantGroups.filter(group => group.slot === slot)
  const members = groups.flatMap(group => group.members)
  if (!members.length) return stored
  const known = new Map(stored.map(artifact => [assetIdOf(artifact), artifact]))
  const versions = build.versions.filter(version => version.slot === slot)
  const projected = members.map(member => {
   const existing = known.get(member.assetId)
   if (existing) return existing
   const version = versions.find(candidate => candidate.id === member.versionId || candidate.assetId === member.assetId)
   return {
    id: member.assetId,
    kind: slot,
    version: version?.version || 1,
    label: member.label || version?.label || (slot === "title" ? "Title option" : "Thumbnail option"),
    sourceToolId: version?.sourceToolId || groups.find(group => group.members.some(item => item.assetId === member.assetId))?.sourceToolId || "asset-engine",
    vaultAssetId: member.assetId,
    createdAt: member.createdAt,
    metadata: { canonicalProjection: true, versionId: member.versionId || version?.id || null },
   } satisfies PackageArtifactRef
  })
  return projected
 }

 const titleVariants = projectOptionArtifacts("title", videoPackage.packaging.titleVariants)
 const thumbnailVariants = projectOptionArtifacts("thumbnail", videoPackage.packaging.thumbnailVariants)

 const packageArtifactId = (artifacts: PackageArtifactRef[], canonicalAssetId: string | null) => {
  if (!canonicalAssetId) return null
  return artifacts.find(artifact => assetIdOf(artifact) === canonicalAssetId)?.id || null
 }

 const titleId = packageArtifactId(titleVariants, titleAssetId)
 const thumbnailId = packageArtifactId(thumbnailVariants, thumbnailAssetId)
 const renderIds = finalRenderAssetId && !videoPackage.production.renderIds.includes(finalRenderAssetId)
  ? [...videoPackage.production.renderIds, finalRenderAssetId]
  : videoPackage.production.renderIds

 return {
  ...videoPackage,
  contentBuildRevision: build.revision,
  packaging: {
   ...videoPackage.packaging,
   titleVariants,
   thumbnailVariants,
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
