export type CrownMissionStatus = "draft" | "planned" | "verification" | "partial" | "complete" | "blocked"

export interface CrownMissionSnapshot {
  id: string
  domain: "Observatory" | "Citadel" | "Brain" | "Forge" | "Compass" | "System"
  title: string
  objective: string
  status: CrownMissionStatus
  risk: "low" | "medium" | "high"
  owner: string
  executionOwner: string
  taskIds: string[]
  acceptance: string[]
  evidence: string[]
  blockers: string[]
  artifacts: string[]
}

export const CROWN_SNAPSHOT_META = {
  schemaVersion: "viewtube.crown-runtime-snapshot.v1",
  readOnly: true,
  source: ".viewtube/exchange/**",
  note: "Committed repository snapshot. Protocol records remain canonical; this UI cannot mutate them.",
} as const

export const CROWN_MISSIONS: readonly CrownMissionSnapshot[] = [
  {
    id: "VT-MISSION-OBSERVATORY-dashboard-evidence",
    domain: "Observatory",
    title: "Dashboard evidence parity",
    objective: "Keep dashboard widgets aligned with canonical VT-SYNC / analytics-canon evidence while preserving widget identity and UI states.",
    status: "partial",
    risk: "medium",
    owner: "PRINCE Observatory",
    executionOwner: "EMPEROR + viewtube-widget-dashboard",
    taskIds: [],
    acceptance: ["Canonical metric parity", "Stable widget identity", "Loading/empty/error states preserved", "Dashboard contracts and build pass"],
    evidence: ["Mission packet exists", "Work order exists", "Schema receipt exists"],
    blockers: ["No runtime implementation receipt attached"],
    artifacts: ["VIEWTUBE_CROWN_DOMAIN_MISSION_PACK.md"],
  },
  {
    id: "VT-MISSION-CITADEL-auth-sync-recovery",
    domain: "Citadel",
    title: "Auth + sync recovery",
    objective: "Stabilize login, Google/YouTube connection ownership and sync state without duplicating server authority or widening scopes.",
    status: "partial",
    risk: "high",
    owner: "PRINCE Citadel",
    executionOwner: "EMPEROR + Service Membrane",
    taskIds: [],
    acceptance: ["Fresh login works", "Return session works", "Reconnect works", "Failure states are visible", "No scope expansion"],
    evidence: ["Mission packet exists", "Work order exists", "Schema receipt exists"],
    blockers: ["No auth journey verification receipt attached"],
    artifacts: ["VIEWTUBE_CROWN_DOMAIN_MISSION_PACK.md"],
  },
  {
    id: "VT-MISSION-BRAIN-evidence-tool-connection",
    domain: "Brain",
    title: "Evidence-backed Brain tool connection",
    objective: "Ground Brain recommendations in source-linked evidence and bounded tool proposals without creating a parallel memory or analytics store.",
    status: "partial",
    risk: "medium",
    owner: "PRINCE Brain",
    executionOwner: "EMPEROR + Brain Cognition",
    taskIds: [],
    acceptance: ["Evidence linked", "Missing evidence disclosed", "Tool proposal bounded", "No hidden write authority"],
    evidence: ["Mission packet exists", "Work order exists", "Schema receipt exists"],
    blockers: ["No end-to-end Brain runtime receipt attached"],
    artifacts: ["VIEWTUBE_CROWN_DOMAIN_MISSION_PACK.md"],
  },
  {
    id: "VT-MISSION-FORGE-video-package-editor",
    domain: "Forge",
    title: "Video package → editor workflow",
    objective: "Connect canonical video-package output to project/editor/render flow while keeping render and publish verification separate.",
    status: "partial",
    risk: "medium",
    owner: "PRINCE Forge",
    executionOwner: "EMPEROR + Video Studio",
    taskIds: [],
    acceptance: ["Package contract preserved", "Project/editor handoff explicit", "Render verified separately", "Publish remains permission-gated"],
    evidence: ["Mission packet exists", "Work order exists", "Schema receipt exists"],
    blockers: ["No editor/render runtime receipt attached"],
    artifacts: ["VIEWTUBE_CROWN_DOMAIN_MISSION_PACK.md"],
  },
  {
    id: "VT-MISSION-COMPASS-task-artifact-consolidation",
    domain: "Compass",
    title: "Task + artifact consolidation",
    objective: "Link missions, task references, plans and artifacts without replacing the Task Index or mutating canonical status automatically.",
    status: "partial",
    risk: "low",
    owner: "PRINCE Compass",
    executionOwner: "EMPEROR + Docs Archivist",
    taskIds: [],
    acceptance: ["Read-only task linkage", "Artifact provenance visible", "Conflicts retained", "No automatic task-state mutation"],
    evidence: ["Read-only bridge script exists", "Mission packet exists", "Schema receipt exists"],
    blockers: ["Canonical Task Index runtime reader not wired yet"],
    artifacts: ["VIEWTUBE_CROWN_PHASE3_READ_ONLY_BRIDGE.md"],
  },
  {
    id: "VT-MISSION-EXAMPLE-dashboard-canonical",
    domain: "System",
    title: "Crown protocol fixture",
    objective: "Demonstrate the full desired-state → executable-state → verification record chain using dashboard ownership rules.",
    status: "partial",
    risk: "medium",
    owner: "KING",
    executionOwner: "EMPEROR",
    taskIds: [],
    acceptance: ["Mission linked", "Work order linked", "Receipt linked", "No production implementation falsely claimed"],
    evidence: ["VT_MISSION exists", "VT_WORK_ORDER exists", "VT_RECEIPT exists", "Decision/handoff/conflict examples exist"],
    blockers: ["Fixture intentionally does not claim production execution"],
    artifacts: ["ViewTube_Crown_Control_Room.html"],
  },
] as const

export const CROWN_LIFECYCLE = ["DISCOVER", "SYNTHESIZE", "DECIDE", "PLAN EXECUTION", "EXECUTE", "VERIFY", "LEARN / ARCHIVE"] as const
