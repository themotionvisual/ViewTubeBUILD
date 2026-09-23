import type { Project, VaultAsset } from "../../types"
import { createVideoPackage } from "./packageValidation"
import { getContentBuild, setContentBuildSelection } from "../asset-engine/ContentBuildRepository"
import { findVideoPackageByProject, saveVideoPackage } from "./VideoPackageRepository"

const packageFormatForProject = (project: Project): "short" | "long" | "live" => {
  const format = String(project.plan?.format || "").toLowerCase()
  if (format === "short" || format === "live") return format
  return "long"
}

export const ensureVideoPackageForProject = (
  project: Project,
  input: {
    channelId?: string | null
    sourceToolId?: string
  } = {},
) => {
  if (!project.contentBuildId) return null
  const channelId = input.channelId?.trim()
  if (!channelId) return null

  const exact = findVideoPackageByProject(project.id, project.contentBuildId)
  if (exact) return exact

  const projectPackage = findVideoPackageByProject(project.id)
  if (projectPackage && projectPackage.contentBuildId !== project.contentBuildId) {
    throw new Error(
      `Project ${project.id} already has a Video Package scoped to a different ContentBuild (${projectPackage.contentBuildId || "missing"}).`,
    )
  }

  const videoPackage = createVideoPackage({
    id: `vp:${project.id}:${project.contentBuildId}`,
    channelId,
    projectId: project.id,
    workingTitle: project.videoTitle || project.name,
    format: packageFormatForProject(project),
    contentBuildId: project.contentBuildId,
    sourceToolId: input.sourceToolId || "project-builder",
  })
  return saveVideoPackage(videoPackage)
}


export const selectProjectVideoPackageThumbnail = (
  project: Project,
  asset: VaultAsset,
  input: {
    channelId?: string | null
    sourceToolId?: string
    now?: string
  } = {},
) => {
  if (!project.contentBuildId || !getContentBuild(project.contentBuildId)) {
    throw new Error(`Cannot select thumbnail: Project ${project.id} has no resolved ContentBuild.`)
  }

  const sourceToolId = input.sourceToolId || "project-builder"
  setContentBuildSelection(project.contentBuildId, "thumbnail", asset.id, {
    toolId: sourceToolId,
    actorType: "creator",
    final: true,
  })

  const videoPackage = ensureVideoPackageForProject(project, input)
  if (!videoPackage) return null

  const now = input.now || new Date().toISOString()
  const existing = videoPackage.packaging.thumbnailVariants.find(candidate => candidate.vaultAssetId === asset.id)
  const artifact = existing || {
    id: `thumbnail:${asset.id}`,
    kind: "thumbnail" as const,
    version: 1,
    label: asset.name,
    sourceToolId,
    vaultAssetId: asset.id,
    createdAt: now,
    metadata: {
      url: asset.url || null,
      previewUrl: asset.previewUrl || null,
      mimeType: asset.mimeType || null,
    },
  }

  const thumbnailVariants = existing
    ? videoPackage.packaging.thumbnailVariants
    : [...videoPackage.packaging.thumbnailVariants, artifact]

  return saveVideoPackage({
    ...videoPackage,
    version: videoPackage.version + 1,
    identity: { ...videoPackage.identity, updatedAt: now },
    packaging: {
      ...videoPackage.packaging,
      thumbnailVariants,
      selectedThumbnailId: artifact.id,
    },
    provenance: [
      ...videoPackage.provenance,
      {
        id: `${videoPackage.id}:thumbnail:${asset.id}:${now}`,
        action: "thumbnail_selected",
        sourceToolId,
        artifactIds: [artifact.id],
        evidenceIds: [],
        createdAt: now,
      },
    ],
  })
}


export const clearProjectVideoPackageThumbnail = (
  project: Project,
  input: { sourceToolId?: string; now?: string } = {},
) => {
  if (!project.contentBuildId) return null
  if (!getContentBuild(project.contentBuildId)) {
    throw new Error(`Cannot clear thumbnail: Project ${project.id} has no resolved ContentBuild.`)
  }

  const sourceToolId = input.sourceToolId || "project-builder"
  setContentBuildSelection(project.contentBuildId, "thumbnail", null, {
    toolId: sourceToolId,
    actorType: "creator",
  })

  const videoPackage = findVideoPackageByProject(project.id, project.contentBuildId)
  if (!videoPackage || !videoPackage.packaging.selectedThumbnailId) return videoPackage

  const now = input.now || new Date().toISOString()
  const previous = videoPackage.packaging.selectedThumbnailId
  return saveVideoPackage({
    ...videoPackage,
    version: videoPackage.version + 1,
    identity: { ...videoPackage.identity, updatedAt: now },
    packaging: { ...videoPackage.packaging, selectedThumbnailId: null },
    provenance: [
      ...videoPackage.provenance,
      {
        id: `${videoPackage.id}:thumbnail-cleared:${now}`,
        action: "thumbnail_selection_cleared",
        sourceToolId,
        artifactIds: [previous],
        evidenceIds: [],
        createdAt: now,
      },
    ],
  })
}
