import type { Project } from "../../types"
import { createVideoPackage } from "./packageValidation"
import { findVideoPackageByProject, saveVideoPackage } from "./VideoPackageRepository"
import type { SuperToolId } from "../../types"

const packageFormatForProject = (project: Project): "short" | "long" | "live" => {
  const format = String(project.plan?.format || "").toLowerCase()
  if (format === "short" || format === "live") return format
  return "long"
}

export const ensureVideoPackageForProject = (
  project: Project,
  input: {
    channelId?: string | null
    sourceToolId?: SuperToolId | string
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
