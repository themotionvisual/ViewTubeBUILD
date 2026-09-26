import type { Project } from "../../types"
import type { ContentBuildSnapshot } from "../asset-engine/contracts"
import type { AlgorithmProjectContext } from "./AlgorithmIntelligenceOrchestrator"

const text = (value: unknown): string | null =>
 typeof value === "string" && value.trim() ? value.trim() : null

const stringList = (value: unknown): string[] => {
 if (Array.isArray(value)) {
  return Array.from(new Set(value.map(item => text(item)).filter((item): item is string => Boolean(item))))
 }
 const single = text(value)
 return single ? [single] : []
}

export const buildAlgorithmProjectContext = (input: {
 channelId?: string | null
 projectId?: string | null
 project?: Project | null
 contentBuild?: ContentBuildSnapshot | null
 visibleContext?: Record<string, unknown> | null
 artifactRefs?: string[]
}): AlgorithmProjectContext | null => {
 const channelId = text(input.channelId)
 const requestedProjectId = text(input.projectId)
 const projectMatchesRequest = !input.project
  || !requestedProjectId
  || input.project.id === requestedProjectId
 const project = projectMatchesRequest ? input.project || null : null
 const projectId = requestedProjectId || text(project?.id)

 if (!channelId || !projectId) return null

 const visible = input.visibleContext || {}
 const contentBuildMatchesProject = Boolean(
  input.contentBuild
  && (!project?.contentBuildId || input.contentBuild.id === project.contentBuildId)
  && (!input.contentBuild.legacyProjectId || input.contentBuild.legacyProjectId === projectId),
 )
 const contentBuild = contentBuildMatchesProject ? input.contentBuild || null : null
 const profile = contentBuild?.profile || {}
 const plan = project?.plan || { concept: "", niche: "" }

 const targetAudience = stringList(
  profile.audienceSegments?.length
   ? profile.audienceSegments
   : profile.targetAudience
    || plan.audienceSegments
    || plan.targetAudience,
 )

 return {
  channelId,
  projectId,
  contentBuildId: text(contentBuild?.id)
   || text(project?.contentBuildId)
   || text(visible.contentBuildId),
  title: text(project?.videoTitle)
   || text(profile.workingConcept)
   || text(project?.name)
   || text(visible.title),
  topic: text(profile.topic)
   || text(profile.subject)
   || text(plan.topic)
   || text(project?.concept)
   || text(visible.topic),
  format: text(profile.format)
   || text(plan.format)
   || text(visible.format),
  plannedPublishAt: text(project?.publishDate)
   || text(visible.plannedPublishAt),
  ...(targetAudience.length ? { targetAudience } : {}),
  evidenceIds: Array.from(new Set(input.artifactRefs || [])).slice(0, 50),
 }
}
