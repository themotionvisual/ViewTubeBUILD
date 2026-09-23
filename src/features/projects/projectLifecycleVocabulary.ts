import type { ContentBuildStage } from "../../services/asset-engine/contracts"
import type { VideoPackageStatus } from "../../services/video-package/contracts"

export type ProjectLaneId =
  | "ideas"
  | "planned"
  | "in-progress"
  | "review"
  | "ready"
  | "blocked"
  | "published"

const normalize = (value: unknown) => String(value || "").trim().toLowerCase()

export const projectLaneForStatus = (statusValue: unknown): ProjectLaneId => {
  const status = normalize(statusValue)
  if (status.includes("publish") && status !== "publishing") return "published"
  if (status === "publishing" || status.includes("ready")) return "ready"
  if (status.includes("review") || status.includes("approval")) return "review"
  if (status.includes("block")) return "blocked"
  if (["scripting", "filming", "editing", "production", "active", "in-progress"].includes(status)) return "in-progress"
  if (["planned", "queued", "scheduled"].includes(status)) return "planned"
  return "ideas"
}

export const projectStatusForLane = (lane: ProjectLaneId): string => {
  switch (lane) {
    case "ideas": return "ideation"
    case "planned": return "planned"
    case "in-progress": return "production"
    case "review": return "review"
    case "ready": return "ready"
    case "blocked": return "blocked"
    case "published": return "published"
  }
}

export const contentBuildStageForProjectStatus = (
  statusValue: unknown,
  input: {
    explicitStage?: unknown
    currentStage?: ContentBuildStage | null
  } = {},
): ContentBuildStage => {
  const explicit = normalize(input.explicitStage)
  const validStages: ContentBuildStage[] = [
    "idea",
    "research",
    "concept",
    "outline",
    "script",
    "storyboard",
    "media",
    "package",
    "edit",
    "review",
    "scheduled",
    "published",
    "launch",
    "monitor",
    "evaluation",
    "learning",
    "archived",
  ]
  if (validStages.includes(explicit as ContentBuildStage)) return explicit as ContentBuildStage

  const status = normalize(statusValue)
  if (status.includes("block")) return input.currentStage || "idea"
  if (!status || ["idea", "ideas", "ideation", "draft"].includes(status)) return "idea"
  if (status.includes("research")) return "research"
  if (["planning", "planned", "concept"].includes(status)) return "concept"
  if (status.includes("outline")) return "outline"
  if (["script", "scripting"].includes(status)) return "script"
  if (status.includes("storyboard")) return "storyboard"
  if (["production", "producing", "filming", "media"].includes(status)) return "media"
  if (["package", "packaging"].includes(status)) return "package"
  if (["editing", "edit", "in-progress"].includes(status)) return "edit"
  if (["review", "approval"].includes(status)) return "review"
  if (["ready", "publishing", "scheduled", "queued"].includes(status)) return "scheduled"
  if (status === "published" || status === "live") return "published"
  if (status.includes("launch")) return "launch"
  if (status.includes("monitor")) return "monitor"
  if (["completed", "evaluation"].includes(status)) return "evaluation"
  if (status.includes("learning")) return "learning"
  if (status === "archived") return "archived"
  return input.currentStage || "idea"
}

/**
 * Descriptive projection only. Video Package transitions remain governed by
 * VIDEO_PACKAGE_TRANSITIONS and are not auto-mutated by this helper.
 */
export const videoPackageStatusForContentBuildStage = (
  stage: ContentBuildStage,
): VideoPackageStatus => {
  switch (stage) {
    case "idea": return "idea"
    case "research":
    case "concept":
    case "outline":
      return "developing"
    case "script": return "scripted"
    case "storyboard": return "storyboarded"
    case "media":
    case "edit":
      return "producing"
    case "package": return "packaging"
    case "review": return "review"
    case "scheduled": return "scheduled"
    case "published":
    case "launch":
      return "published"
    case "monitor":
    case "evaluation":
    case "learning":
      return "measuring"
    case "archived":
      return "archived"
  }
}
