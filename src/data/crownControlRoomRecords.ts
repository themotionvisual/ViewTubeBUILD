export interface CrownTaskAuthoritySnapshot {
  authority: string
  status: "external-authority"
  embedded: false
  note: string
}

export interface CrownArtifactSnapshot {
  id: string
  missionId: string | null
  title: string
  type: "prototype" | "plan" | "reference"
  status: "PROTOTYPE" | "REFERENCE"
  source: string
  verified: boolean
}

export interface CrownDecisionSnapshot {
  id: string
  missionId: string
  question: string
  recommendation: string
  state: "accepted" | "proposed" | "rejected" | "needs-creator-decision"
  evidenceCount: number
}

export interface CrownExecutionSnapshot {
  missionId: string
  record: string
  kind: "work-order"
  state: "recorded"
}

export interface CrownVerificationSnapshot {
  missionId: string
  record: string
  kind: "schema-check" | "verification"
  state: "partial"
}

export const CROWN_TASK_AUTHORITY: CrownTaskAuthoritySnapshot = {
  authority: "/Users/cwb/Downloads/viewtube/ViewTube-Task-Index.html",
  status: "external-authority",
  embedded: false,
  note: "The canonical Task Index is not committed into this runtime bundle. Crown may show mission task references, but it must not invent or mutate task status.",
}

export const CROWN_ARTIFACTS: readonly CrownArtifactSnapshot[] = [
  {
    id: "VT-ARTIFACT-crown-control-room",
    missionId: "VT-MISSION-EXAMPLE-dashboard-canonical",
    title: "ViewTube Crown Control Room",
    type: "prototype",
    status: "PROTOTYPE",
    source: "docs/demos/ViewTube_Crown_Control_Room.html",
    verified: false,
  },
  {
    id: "VT-ARTIFACT-crown-domain-pack",
    missionId: null,
    title: "Crown Domain Mission Pack",
    type: "reference",
    status: "REFERENCE",
    source: "docs/architecture/VIEWTUBE_CROWN_DOMAIN_MISSION_PACK.md",
    verified: true,
  },
  {
    id: "VT-ARTIFACT-crown-bridge-plan",
    missionId: "VT-MISSION-COMPASS-task-artifact-consolidation",
    title: "Phase 3 Read-Only Task + Artifact Bridge",
    type: "plan",
    status: "REFERENCE",
    source: "docs/architecture/VIEWTUBE_CROWN_PHASE3_READ_ONLY_BRIDGE.md",
    verified: true,
  },
] as const

export const CROWN_DECISIONS: readonly CrownDecisionSnapshot[] = [
  {
    id: "VT-DECISION-EXAMPLE-dashboard-owner",
    missionId: "VT-MISSION-EXAMPLE-dashboard-canonical",
    question: "Should Crown introduce a new analytics store to simplify the dashboard mission?",
    recommendation: "No. Keep VT-SYNC as raw analytics authority, analytics-canon as consumer parity authority, and Crown as coordination/provenance only.",
    state: "accepted",
    evidenceCount: 3,
  },
] as const

const WORK_ORDER_MISSIONS = [
  "VT-MISSION-OBSERVATORY-dashboard-evidence",
  "VT-MISSION-CITADEL-auth-sync-recovery",
  "VT-MISSION-BRAIN-evidence-tool-connection",
  "VT-MISSION-FORGE-video-package-editor",
  "VT-MISSION-COMPASS-task-artifact-consolidation",
  "VT-MISSION-EXAMPLE-dashboard-canonical",
] as const

export const CROWN_EXECUTION: readonly CrownExecutionSnapshot[] = WORK_ORDER_MISSIONS.map((missionId) => ({
  missionId,
  record: `.viewtube/exchange/work-orders/${missionId}__emperor.json`,
  kind: "work-order" as const,
  state: "recorded" as const,
}))

export const CROWN_VERIFICATION: readonly CrownVerificationSnapshot[] = [
  ...WORK_ORDER_MISSIONS.filter((missionId) => missionId !== "VT-MISSION-EXAMPLE-dashboard-canonical").map((missionId) => ({
    missionId,
    record: `.viewtube/exchange/receipts/${missionId}__schema-check.json`,
    kind: "schema-check" as const,
    state: "partial" as const,
  })),
  {
    missionId: "VT-MISSION-EXAMPLE-dashboard-canonical",
    record: ".viewtube/exchange/receipts/VT-MISSION-EXAMPLE-dashboard-canonical__verification.json",
    kind: "verification",
    state: "partial",
  },
] as const
