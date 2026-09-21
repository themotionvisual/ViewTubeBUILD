import type { Project } from "@/types"
import {
 ensureContentBuild,
 getContentBuild,
 patchContentBuildProfile,
 setContentBuildStage,
} from "./ContentBuildRepository"
import type { ContentBuildProfile, ContentBuildStage } from "./contracts"

const nonEmpty = (value: unknown): value is string =>
 typeof value === "string" && value.trim().length > 0

const projectStage = (project: Project): ContentBuildStage => {
 const planStage = project.plan?.contentBuildStage
 if (typeof planStage === "string") return planStage as ContentBuildStage
 switch (project.status) {
  case "completed":
   return "evaluation"
  case "archived":
   return "archived"
  default:
   return "idea"
 }
}

export const contentBuildProfileFromProject = (project: Project): ContentBuildProfile => {
 const plan = project.plan || { concept: "", niche: "" }
 const style = plan.style || plan.styleProfile || {}
 const strategy = plan.strategy || plan.strategyProfile || {}

 return {
  subject: plan.subject || project.concept || plan.concept || project.videoTitle || project.name,
  topic: plan.topic || project.concept || plan.concept || project.videoTitle || project.name,
  niche: project.niche || plan.niche || undefined,
  subNiche: plan.subNiche || undefined,
  originalIdea: plan.originalIdea || project.concept || plan.concept || undefined,
  originalPrompt: plan.originalPrompt || undefined,
  workingConcept: project.videoTitle || project.name,
  intention: plan.intention || plan.creatorIntent || project.notes || undefined,
  creatorGoal: plan.creatorGoal || plan.goal || undefined,
  audiencePromise: plan.audiencePromise || plan.promise || undefined,
  targetAudience: plan.targetAudience || plan.audience || undefined,
  audienceSegments: Array.isArray(plan.audienceSegments) ? plan.audienceSegments : undefined,
  format: plan.format === "short" || plan.format === "long" || plan.format === "live" || plan.format === "other"
   ? plan.format
   : undefined,
  plannedDurationSeconds: typeof plan.plannedDurationSeconds === "number" ? plan.plannedDurationSeconds : undefined,
  style: {
   tone: style.tone || plan.tone,
   narrativeStyle: style.narrativeStyle || plan.narrativeStyle,
   visualStyle: style.visualStyle || plan.visualStyle,
   editingStyle: style.editingStyle || plan.editingStyle,
   pacingStyle: style.pacingStyle || plan.pacingStyle,
   voiceStyle: style.voiceStyle || plan.voiceStyle,
   musicStyle: style.musicStyle || plan.musicStyle,
   references: Array.isArray(style.references) ? style.references : Array.isArray(plan.visualReferences) ? plan.visualReferences : undefined,
   constraints: Array.isArray(style.constraints) ? style.constraints : Array.isArray(plan.constraints) ? plan.constraints : undefined,
   doNotDo: Array.isArray(style.doNotDo) ? style.doNotDo : Array.isArray(plan.doNotDo) ? plan.doNotDo : undefined,
  },
  strategy: {
   positioning: strategy.positioning || plan.positioning,
   discoveryIntent: strategy.discoveryIntent || plan.discoveryIntent,
   packagingIntent: strategy.packagingIntent || plan.packagingIntent,
   retentionIntent: strategy.retentionIntent || plan.retentionIntent,
   launchIntent: strategy.launchIntent || plan.launchIntent,
   successDefinition: strategy.successDefinition || plan.successDefinition,
  },
 }
}

const compactObject = <T extends Record<string, unknown>>(value: T): T =>
 Object.fromEntries(
  Object.entries(value).filter(([, item]) => {
   if (item == null || item === "") return false
   if (Array.isArray(item)) return item.length > 0
   if (typeof item === "object") return Object.values(item as Record<string, unknown>).some(Boolean)
   return true
  }),
 ) as T

const shallowProfileFingerprint = (profile: ContentBuildProfile) =>
 JSON.stringify(compactObject({
  ...profile,
  style: compactObject((profile.style || {}) as Record<string, unknown>),
  strategy: compactObject((profile.strategy || {}) as Record<string, unknown>),
 } as Record<string, unknown>))

export const ensureContentBuildForProject = (
 project: Project,
 input: { channelId?: string | null; sourceToolId?: string | null } = {},
) => {
 const build = ensureContentBuild({
  channelId: input.channelId || null,
  legacyProjectId: project.id,
  legacyProjectName: project.name,
  stage: projectStage(project),
  profile: contentBuildProfileFromProject(project),
  toolId: input.sourceToolId || "project-command-kanban",
 })
 if (!build) throw new Error("Unable to create ContentBuild for project " + project.id)
 return build
}

export const syncProjectToContentBuild = (
 project: Project,
 input: { channelId?: string | null; sourceToolId?: string | null } = {},
) => {
 const build = ensureContentBuildForProject(project, input)
 const desiredProfile = contentBuildProfileFromProject(project)
 let next = build

 if (shallowProfileFingerprint(build.profile) !== shallowProfileFingerprint(desiredProfile)) {
  next = patchContentBuildProfile(build.id, desiredProfile, {
   actorType: "tool",
   toolId: input.sourceToolId || "project-command-kanban",
  })
 }

 const desiredStage = projectStage(project)
 if (next.stage !== desiredStage) {
  next = setContentBuildStage(next.id, desiredStage, {
   actorType: "tool",
   toolId: input.sourceToolId || "project-command-kanban",
  })
 }

 return getContentBuild(next.id)!
}

export const resolveProjectContentBuildId = (project: Project) =>
 ensureContentBuildForProject(project).id

export const projectHasContentIntent = (project: Project) =>
 [
  project.name,
  project.videoTitle,
  project.concept,
  project.plan?.concept,
  project.niche,
  project.plan?.niche,
 ].some(nonEmpty)
