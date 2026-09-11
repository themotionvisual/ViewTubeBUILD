import { SUPER_TOOLS } from "../superToolRegistry"
import { getBrainBindingForRoute, type BrainSurfaceContext } from "./phaseOneIntegration"
import type { BrainUserControls } from "./BrainUserControls"

export interface BrainLiveSurfaceContext extends BrainSurfaceContext {
 capabilityIds: string[]
 superToolIds: string[]
 sourceOfTruth: string[]
 blockedCapabilities: string[]
}

const capabilityAllowed = (id: string, controls: BrainUserControls): boolean => {
 if (id === "analytics") return controls.allowAnalytics
 if (id === "projects") return controls.allowProjects
 if (id === "comment-responder") return controls.allowComments
 if (id === "vault") return controls.allowVault
 if (id === "publisher") return controls.allowPublisher
 return controls.enabled
}

export const buildBrainSurfaceContext = (input: {
 pathname: string
 search?: string
 controls: BrainUserControls
 projectId?: string | null
 videoId?: string | null
 commentId?: string | null
 dateRange?: string | null
}): BrainLiveSurfaceContext => {
 const bindings = getBrainBindingForRoute(input.pathname)
 const matchingSuperTools = SUPER_TOOLS.filter((tool) =>
  tool.routes.some((route) => input.pathname === route || input.pathname.startsWith(`${route}/`)),
 )
 const blockedCapabilities = bindings
  .filter((binding) => !capabilityAllowed(binding.id, input.controls))
  .map((binding) => binding.id)
 const capabilityIds = bindings
  .filter((binding) => capabilityAllowed(binding.id, input.controls))
  .map((binding) => binding.id)

 return {
  route: input.pathname,
  projectId: input.projectId ?? null,
  videoId: input.videoId ?? null,
  commentId: input.commentId ?? null,
  dateRange: input.dateRange ?? null,
  capabilityIds,
  superToolIds: matchingSuperTools.map((tool) => tool.id),
  sourceOfTruth: bindings.map((binding) => binding.sourceOfTruth),
  blockedCapabilities,
 }
}

export const parseBrainSurfaceContextFromLocation = (
 location: { pathname: string; search?: string },
 controls: BrainUserControls,
): BrainLiveSurfaceContext => {
 const params = new URLSearchParams(location.search || "")
 return buildBrainSurfaceContext({
  pathname: location.pathname,
  search: location.search,
  controls,
  projectId: params.get("projectId") || params.get("project") || null,
  videoId: params.get("videoId") || params.get("video") || null,
  commentId: params.get("commentId") || params.get("comment") || null,
  dateRange: params.get("range") || params.get("dateRange") || null,
 })
}
