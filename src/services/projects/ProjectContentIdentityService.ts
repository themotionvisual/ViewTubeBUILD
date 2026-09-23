import type { Project } from "../../types"
import { syncProjectToContentBuild } from "../asset-engine/ProjectContentBuildBridge"
import { ensureVideoPackageForProject } from "../video-package/ProjectVideoPackageBridge"

export type ProjectContentIdentityResult = {
  project: Project
  contentBuildId: string
  videoPackageId: string | null
}

/**
 * Canonical Project creation/resolution transaction.
 *
 * Project remains the creator-facing planning object. ContentBuild is the
 * durable lifecycle identity. Video Package is initialized only against that
 * same ContentBuild and may remain pending while channel scope is unavailable.
 */
export const initializeProjectContentIdentity = (
  project: Project,
  input: {
    channelId?: string | null
    sourceToolId?: string
  } = {},
): ProjectContentIdentityResult => {
  const build = syncProjectToContentBuild(project, {
    channelId: input.channelId || null,
    sourceToolId: input.sourceToolId || "project-builder",
  })
  const canonicalProject = project.contentBuildId === build.id
    ? project
    : { ...project, contentBuildId: build.id }

  const videoPackage = ensureVideoPackageForProject(canonicalProject, {
    channelId: input.channelId || null,
    sourceToolId: input.sourceToolId || "project-builder",
  })

  if (videoPackage?.contentBuildId && videoPackage.contentBuildId !== build.id) {
    throw new Error(
      `Project ${project.id} resolved ContentBuild ${build.id} but Video Package ${videoPackage.id} resolved ${videoPackage.contentBuildId}.`,
    )
  }

  return {
    project: canonicalProject,
    contentBuildId: build.id,
    videoPackageId: videoPackage?.id || null,
  }
}
