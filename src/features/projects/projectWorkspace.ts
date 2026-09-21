import type { Project } from "../../types"

export const PROJECT_WORKSPACE_STORAGE_KEY = "viewtube.projects.workspace.v1"

export const PROJECT_LANES = [
 { id: "ideas", label: "Ideas", description: "Captured work not planned yet" },
 { id: "planned", label: "Planned", description: "Scoped and ready to start" },
 { id: "in-progress", label: "In Progress", description: "Work currently moving" },
 { id: "review", label: "Review", description: "Waiting on review or approval" },
 { id: "ready", label: "Ready", description: "Ready to schedule or publish" },
 { id: "blocked", label: "Blocked", description: "Needs a decision or dependency" },
 { id: "published", label: "Published", description: "Live and complete" },
] as const

export type ProjectLaneId = (typeof PROJECT_LANES)[number]["id"]
export type ProjectPriority = "low" | "medium" | "high" | "urgent"
export type ProjectWorkspaceView = "board" | "calendar" | "list" | "timeline"

export interface ProjectWorkspaceMeta {
 projectId: string
 lane: ProjectLaneId
 order: number
 priority: ProjectPriority
 owner: string
 tags: string[]
 archived: boolean
 updatedAt: string
}

export interface ProjectWorkspaceState {
 version: 1
 projects: Record<string, ProjectWorkspaceMeta>
 view: ProjectWorkspaceView
 query: string
 priorityFilter: "all" | ProjectPriority
 ownerFilter: string
 showArchived: boolean
}

const DEFAULT_STATE: ProjectWorkspaceState = {
 version: 1,
 projects: {},
 view: "board",
 query: "",
 priorityFilter: "all",
 ownerFilter: "all",
 showArchived: false,
}

const isLane = (value: unknown): value is ProjectLaneId =>
 PROJECT_LANES.some((lane) => lane.id === value)

const inferLane = (project: Project): ProjectLaneId => {
 const status = String(project.status || "").toLowerCase()
 if (status.includes("publish") && status !== "publishing") return "published"
 if (status === "publishing" || status.includes("ready")) return "ready"
 if (status.includes("review") || status.includes("approval")) return "review"
 if (status.includes("block")) return "blocked"
 if (["scripting", "filming", "editing", "production", "active", "in-progress"].includes(status)) return "in-progress"
 if (["planned", "queued", "scheduled"].includes(status)) return "planned"
 return "ideas"
}

const normalizeMeta = (project: Project, candidate: Partial<ProjectWorkspaceMeta> | undefined, order: number): ProjectWorkspaceMeta => ({
 projectId: project.id,
 lane: isLane(candidate?.lane) ? candidate.lane : inferLane(project),
 order: Number.isFinite(candidate?.order) ? Number(candidate?.order) : order,
 priority: ["low", "medium", "high", "urgent"].includes(String(candidate?.priority))
  ? candidate!.priority as ProjectPriority
  : "medium",
 owner: typeof candidate?.owner === "string" ? candidate.owner : "",
 tags: Array.isArray(candidate?.tags) ? candidate.tags.filter((tag): tag is string => typeof tag === "string") : [],
 archived: Boolean(candidate?.archived),
 updatedAt: typeof candidate?.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
})

export const readProjectWorkspace = (): ProjectWorkspaceState => {
 if (typeof window === "undefined") return DEFAULT_STATE
 try {
  const raw = window.localStorage.getItem(PROJECT_WORKSPACE_STORAGE_KEY)
  if (!raw) return DEFAULT_STATE
  const parsed = JSON.parse(raw) as Partial<ProjectWorkspaceState>
  return {
   ...DEFAULT_STATE,
   ...parsed,
   version: 1,
   projects: parsed.projects && typeof parsed.projects === "object" ? parsed.projects as Record<string, ProjectWorkspaceMeta> : {},
   priorityFilter: ["all", "low", "medium", "high", "urgent"].includes(String(parsed.priorityFilter))
    ? parsed.priorityFilter as ProjectWorkspaceState["priorityFilter"]
    : "all",
   showArchived: Boolean(parsed.showArchived),
  }
 } catch {
  return DEFAULT_STATE
 }
}

export const hydrateProjectWorkspace = (
 state: ProjectWorkspaceState,
 projects: Project[],
): ProjectWorkspaceState => {
 const nextProjects: Record<string, ProjectWorkspaceMeta> = { ...state.projects }
 let changed = false
 projects.forEach((project, index) => {
  const normalized = normalizeMeta(project, nextProjects[project.id], index)
  const current = nextProjects[project.id]
  if (!current || JSON.stringify(current) !== JSON.stringify(normalized)) {
   nextProjects[project.id] = normalized
   changed = true
  }
 })
 return changed ? { ...state, projects: nextProjects } : state
}

export const writeProjectWorkspace = (state: ProjectWorkspaceState) => {
 if (typeof window === "undefined") return
 try {
  window.localStorage.setItem(PROJECT_WORKSPACE_STORAGE_KEY, JSON.stringify(state))
 } catch {
  // Persistence is best-effort; the project records themselves remain canonical in Brain state.
 }
}

export const patchProjectMeta = (
 state: ProjectWorkspaceState,
 projectId: string,
 patch: Partial<Omit<ProjectWorkspaceMeta, "projectId">>,
): ProjectWorkspaceState => {
 const current = state.projects[projectId]
 if (!current) return state
 return {
  ...state,
  projects: {
   ...state.projects,
   [projectId]: {
    ...current,
    ...patch,
    projectId,
    updatedAt: new Date().toISOString(),
   },
  },
 }
}

export const statusForLane = (lane: ProjectLaneId): string => {
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
