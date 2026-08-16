import type {
 SuperToolAgentGroup,
 SuperToolBuildState,
 SuperToolId,
 SuperToolRuntimePlanRecord,
} from "../types"

export const SUPER_TOOL_PLAN_BASE = "/Users/cwb/Downloads/viewtube/viewtubeX/docs/VT Brain"
export const SUPER_TOOL_PHASE_3_REPORT_PATH =
 "super-tool-agent-plans/phase-3/VIEWTUBEX_SUPER_TOOL_AGENT_OPTIMIZATION_REPORTS.md"

export const buildSuperToolDocHref = (path: string, anchor?: string): string => {
 const href = encodeURI(`file://${SUPER_TOOL_PLAN_BASE}/${path}`)
 return anchor ? `${href}#${anchor}` : href
}

export const MOUNTED_INTERNAL_TOOL_IDS = new Set<SuperToolId>([
 "creator-canvas-os",
 "audience-loop-studio",
 "packaging-lab-pro",
 "project-command-kanban",
 "series-and-theme-generator",
 "publishing-schedule-architect",
 "shorts-extraction-studio",
 "cinematic-analytics-lab",
 "retention-autopsy-experiment-engine",
 "brain-command-center",
 "workflow-chain-builder",
])

export const EDITOR_BOUND_TOOL_IDS = new Set<SuperToolId>([
 "motion-scene-builder",
 "timeline-asset-vault-dock",
 "template-and-foley-forge",
 "caption-and-fx-pipeline",
])

export const SUPPORTING_TOOL_IDS = new Set<SuperToolId>(["creator-vault-os"])

const stateLabel: Record<SuperToolBuildState, string> = {
 prototype_available: "Prototype available here",
 vt_e1_editor_bound: "VT_E1 editor-bound",
 supporting_utility: "Supporting utility",
 planned_or_embedded: "Planned or embedded",
}

const groupLabel: Record<SuperToolAgentGroup, string> = {
 studio_projects: "Studio / Projects",
 editor_vt_e1: "Editor / VT_E1",
 analytics_shorts: "Analytics / Shorts",
 brain_workflow: "Brain / Workflow",
 supporting_utility: "Supporting Utility",
}

export const SUPER_TOOL_RUNTIME_PLAN_RECORDS: Record<SuperToolId, SuperToolRuntimePlanRecord> = {
 "creator-canvas-os": {
  toolId: "creator-canvas-os",
  agentNumber: 1,
  docSlug: "agent-01-creator-canvas-os",
  verdict: "Keep top-level",
  modules: ["Idea Intake", "Angle Forge", "Hook Lab", "Script Architect", "Storyboard Bridge"],
  nextStep: "Turn idea intake and storyboard handoff into the first real local action.",
  buildState: "prototype_available",
  agentGroup: "studio_projects",
  currentRouteReality: "/data-transparency?internalTool=creator-canvas-os",
  runtimeBoundary: "Mounted internal prototype; can deepen local action packets through existing workbench persistence.",
  firstFunctionalAction: "Save one idea-to-storyboard packet with evidence, storyboard needs, and VT_E1 handoff.",
  optimizationReportAnchor: "agent-01-creator-canvas-os",
 },
 "audience-loop-studio": {
  toolId: "audience-loop-studio",
  agentNumber: 2,
  docSlug: "agent-02-audience-loop-studio",
  verdict: "Keep top-level",
  modules: ["Comment Stream", "Sentiment Matrix", "Reply Composer", "Community Posts", "Request Miner"],
  nextStep: "Connect comment/request samples to a clearer reply and content-demand workflow.",
  buildState: "prototype_available",
  agentGroup: "studio_projects",
  currentRouteReality: "/data-transparency?internalTool=audience-loop-studio",
  runtimeBoundary: "Mounted internal prototype; may use local sample comments before YouTube comment sync is wired.",
  firstFunctionalAction: "Save one audience request packet that produces a reply draft and content-demand note.",
  optimizationReportAnchor: "agent-02-audience-loop-studio",
 },
 "packaging-lab-pro": {
  toolId: "packaging-lab-pro",
  agentNumber: 3,
  docSlug: "agent-03-packaging-lab-pro",
  verdict: "Keep top-level",
  modules: ["Title Systems", "Thumbnail Direction", "Description Framing", "Experiment Batch", "Scorecard"],
  nextStep: "Make title, thumbnail, and scorecard sections save a single packaging packet.",
  buildState: "prototype_available",
  agentGroup: "studio_projects",
  currentRouteReality: "/data-transparency?internalTool=packaging-lab-pro",
  runtimeBoundary: "Mounted internal prototype; must hand packaging experiments to retention and analytics without duplicate stores.",
  firstFunctionalAction: "Save one packaging experiment packet with title, thumbnail direction, score, and success metric.",
  optimizationReportAnchor: "agent-03-packaging-lab-pro",
 },
 "project-command-kanban": {
  toolId: "project-command-kanban",
  agentNumber: 4,
  docSlug: "agent-04-project-command-kanban",
  verdict: "Keep top-level",
  modules: ["Project Board", "Milestones", "Dependencies", "Blockers", "Launch Readiness"],
  nextStep: "Deepen the Kanban board into project state, blocker, and launch-readiness actions.",
  buildState: "prototype_available",
  agentGroup: "studio_projects",
  currentRouteReality: "/data-transparency?internalTool=project-command-kanban",
  runtimeBoundary: "Mounted internal prototype; becomes v1 parent for schedule and workflow-shell behavior.",
  firstFunctionalAction: "Persist a project card movement, blocker note, and launch-readiness packet.",
  optimizationReportAnchor: "agent-04-project-command-kanban",
 },
 "series-and-theme-generator": {
  toolId: "series-and-theme-generator",
  agentNumber: 5,
  docSlug: "agent-05-series-and-theme-generator",
  verdict: "Embed into Creator Canvas and Projects at v1",
  modules: ["Theme Clusters", "Sequel Tree", "Cadence Fit", "Franchise Map"],
  nextStep: "Fold series planning into Creator Canvas and Project Command without a duplicate route.",
  buildState: "prototype_available",
  agentGroup: "studio_projects",
  currentRouteReality: "/data-transparency?internalTool=series-and-theme-generator",
  runtimeBoundary: "Mounted internal prototype for design review; v1 logic embeds into Tools 01 and 04.",
  firstFunctionalAction: "Generate one series arc packet that can be attached to an idea or project card.",
  optimizationReportAnchor: "agent-05-series-and-theme-generator",
 },
 "publishing-schedule-architect": {
  toolId: "publishing-schedule-architect",
  agentNumber: 6,
  docSlug: "agent-06-publishing-schedule-architect",
  verdict: "Embed into Project Command at v1",
  modules: ["Backlog Queue", "Calendar Window", "Campaign Lane", "Readiness", "Recovery Plan"],
  nextStep: "Fold schedule planning into Project Command and calendar workflows.",
  buildState: "prototype_available",
  agentGroup: "studio_projects",
  currentRouteReality: "/data-transparency?internalTool=publishing-schedule-architect",
  runtimeBoundary: "Mounted internal prototype for design review; scheduling v1 lives under Tool 04.",
  firstFunctionalAction: "Attach a publish window and readiness checklist to a project card.",
  optimizationReportAnchor: "agent-06-publishing-schedule-architect",
 },
 "motion-scene-builder": {
  toolId: "motion-scene-builder",
  agentNumber: 7,
  docSlug: "agent-07-motion-scene-builder",
  verdict: "VT_E1 top-level editor family",
  modules: ["Scene Blueprints", "Motion Blocks", "Template Handoff", "Render Boundaries"],
  nextStep: "Keep planning visible here, but build runtime work inside VT_E1.",
  buildState: "vt_e1_editor_bound",
  agentGroup: "editor_vt_e1",
  currentRouteReality: "VT_E1 remains canonical runtime boundary",
  runtimeBoundary: "No fake Data Transparency runtime; implementation must target VT_E1 scene/timeline architecture.",
  firstFunctionalAction: "Define one scene-blueprint packet that VT_E1 can convert into deterministic timeline state.",
  optimizationReportAnchor: "agent-07-motion-scene-builder",
 },
 "timeline-asset-vault-dock": {
  toolId: "timeline-asset-vault-dock",
  agentNumber: 8,
  docSlug: "agent-08-timeline-asset-vault-dock",
  verdict: "Editor and Vault embedded family",
  modules: ["Asset Dock", "Timeline Linking", "Vault References", "Usage Provenance"],
  nextStep: "Keep asset-dock planning tied to VT_E1 and the canonical Vault.",
  buildState: "vt_e1_editor_bound",
  agentGroup: "editor_vt_e1",
  currentRouteReality: "VT_E1 and Vault integration lane only",
  runtimeBoundary: "No second Vault; implementation must dock canonical Vault assets into VT_E1.",
  firstFunctionalAction: "Attach a VaultAsset reference to a VT_E1 timeline slot with provenance.",
  optimizationReportAnchor: "agent-08-timeline-asset-vault-dock",
 },
 "template-and-foley-forge": {
  toolId: "template-and-foley-forge",
  agentNumber: 9,
  docSlug: "agent-09-template-and-foley-forge",
  verdict: "Embed into editor preset families",
  modules: ["Templates", "Foley", "Sound Kits", "Preset Library"],
  nextStep: "Treat as an editor preset sub-system, not a standalone Data Transparency runtime.",
  buildState: "vt_e1_editor_bound",
  agentGroup: "editor_vt_e1",
  currentRouteReality: "VT_E1 and Vault integration lane only",
  runtimeBoundary: "No standalone route; implementation belongs in VT_E1 presets and Vault asset kits.",
  firstFunctionalAction: "Create one reusable template/foley kit definition that VT_E1 can apply to a scene.",
  optimizationReportAnchor: "agent-09-template-and-foley-forge",
 },
 "caption-and-fx-pipeline": {
  toolId: "caption-and-fx-pipeline",
  agentNumber: 10,
  docSlug: "agent-10-caption-and-fx-pipeline",
  verdict: "VT_E1 editor family",
  modules: ["Caption Timing", "Text FX", "Emphasis", "VT_E1 Handoff"],
  nextStep: "Keep caption and FX runtime inside VT_E1.",
  buildState: "vt_e1_editor_bound",
  agentGroup: "editor_vt_e1",
  currentRouteReality: "VT_E1 remains canonical runtime boundary",
  runtimeBoundary: "No fake Data Transparency runtime; implementation must use VT_E1 caption/timeline lanes.",
  firstFunctionalAction: "Apply one caption style/timing preset to a VT_E1 text lane.",
  optimizationReportAnchor: "agent-10-caption-and-fx-pipeline",
 },
 "shorts-extraction-studio": {
  toolId: "shorts-extraction-studio",
  agentNumber: 11,
  docSlug: "agent-11-shorts-extraction-studio",
  verdict: "Keep top-level internal prototype",
  modules: ["Source Clips", "Highlight Candidates", "Cut Handles", "Vertical Preview", "VT_E1 Handoff"],
  nextStep: "Make source clip, cutter, vertical preview, and VT_E1 handoff save one useful packet.",
  buildState: "prototype_available",
  agentGroup: "analytics_shorts",
  currentRouteReality: "/data-transparency?internalTool=shorts-extraction-studio",
  runtimeBoundary: "Mounted internal prototype; final render/edit handoff must stay in VT_E1.",
  firstFunctionalAction: "Save a shorts cut packet with source, time range, caption target, and VT_E1 handoff.",
  optimizationReportAnchor: "agent-11-shorts-extraction-studio",
 },
 "creator-vault-os": {
  toolId: "creator-vault-os",
  verdict: "Supporting Vault utility",
  modules: ["Asset Uploads", "Folder Organization", "Drive Sync", "Generated Outputs"],
  nextStep: "Build the Vault as the supporting asset/product surface, not part of the 15-tool count.",
  buildState: "supporting_utility",
  agentGroup: "supporting_utility",
  currentRouteReality: "/vault",
  runtimeBoundary: "Supporting utility; must stay the canonical asset store for all tools.",
  firstFunctionalAction: "Normalize uploaded/generated assets into VaultAsset records with tags and project links.",
  optimizationReportAnchor: "creator-vault-os-supporting-utility",
 },
 "cinematic-analytics-lab": {
  toolId: "cinematic-analytics-lab",
  agentNumber: 12,
  docSlug: "agent-12-cinematic-analytics-lab",
  verdict: "Keep analytics family",
  modules: ["Metric Selector", "Comparison Stage", "Anomaly Cards", "Insight Preview"],
  nextStep: "Connect the prototype to canonical analytics selectors and insight artifacts.",
  buildState: "prototype_available",
  agentGroup: "analytics_shorts",
  currentRouteReality: "/data-transparency?internalTool=cinematic-analytics-lab",
  runtimeBoundary: "Mounted internal prototype; must use canonical analytics selectors only.",
  firstFunctionalAction: "Create one InsightArtifact from a selected metric, segment, anomaly, and action.",
  optimizationReportAnchor: "agent-12-cinematic-analytics-lab",
 },
 "retention-autopsy-experiment-engine": {
  toolId: "retention-autopsy-experiment-engine",
  agentNumber: 13,
  docSlug: "agent-13-retention-autopsy-experiment-engine",
  verdict: "Keep specialist analytics family",
  modules: ["Video Queue", "Retention Curve", "Autopsy Board", "Hypothesis Queue"],
  nextStep: "Connect retention evidence to experiments and packaging follow-up.",
  buildState: "prototype_available",
  agentGroup: "analytics_shorts",
  currentRouteReality: "/data-transparency?internalTool=retention-autopsy-experiment-engine",
  runtimeBoundary: "Mounted internal prototype; must use canonical retention and analytics data only.",
  firstFunctionalAction: "Queue one retention experiment with failure mode, hypothesis, metric, and workflow handoff.",
  optimizationReportAnchor: "agent-13-retention-autopsy-experiment-engine",
 },
 "brain-command-center": {
  toolId: "brain-command-center",
  agentNumber: 14,
  docSlug: "agent-14-brain-command-center",
  verdict: "Keep as Brain OS control surface",
  modules: ["Signal Inbox", "Priorities", "Assistant Chat", "Agent Dispatch", "Memory Candidates"],
  nextStep: "Make the assistant chat and command queue explain Brain OS confidence and handoffs clearly.",
  buildState: "prototype_available",
  agentGroup: "brain_workflow",
  currentRouteReality: "/data-transparency?internalTool=brain-command-center",
  runtimeBoundary:
   "Mounted internal prototype; Brain OS owns storage, prompt policy, reflection policy, and knowledge model. This tool only displays and reviews Brain OS commands.",
  firstFunctionalAction: "Save a Brain command note with source evidence, target tool, and confidence boundary.",
  optimizationReportAnchor: "agent-14-brain-command-center",
 },
 "workflow-chain-builder": {
  toolId: "workflow-chain-builder",
  agentNumber: 15,
  docSlug: "agent-15-workflow-chain-builder",
  verdict: "Merge shell into Project and Brain at v1",
  modules: ["Chain Templates", "Step Lane", "Artifact Drawer", "Blocker Tracking"],
  nextStep: "Preserve workflow-chain logic while merging the v1 shell into Project and Brain surfaces.",
  buildState: "prototype_available",
  agentGroup: "brain_workflow",
  currentRouteReality: "/data-transparency?internalTool=workflow-chain-builder",
  runtimeBoundary: "Mounted internal prototype; v1 UI embeds into Tools 04 and 14 while keeping WorkflowChain canonical.",
  firstFunctionalAction: "Attach artifact IDs and blocker notes to an existing WorkflowChain.",
  optimizationReportAnchor: "agent-15-workflow-chain-builder",
 },
}

export const getSuperToolPlanRecord = (id: SuperToolId): SuperToolRuntimePlanRecord =>
 SUPER_TOOL_RUNTIME_PLAN_RECORDS[id]

export const getSuperToolBuildStateLabel = (id: SuperToolId): string =>
 stateLabel[getSuperToolPlanRecord(id).buildState]

export const getSuperToolAgentGroupLabel = (id: SuperToolId): string =>
 groupLabel[getSuperToolPlanRecord(id).agentGroup]

export const getSuperToolPhase1Href = (id: SuperToolId): string | null => {
 const slug = getSuperToolPlanRecord(id).docSlug
 return slug ? buildSuperToolDocHref(`super-tool-agent-plans/phase-1/${slug}.md`) : null
}

export const getSuperToolOptimizationReportHref = (id: SuperToolId): string =>
 buildSuperToolDocHref(SUPER_TOOL_PHASE_3_REPORT_PATH, getSuperToolPlanRecord(id).optimizationReportAnchor)

export const getSuperToolDocLinks = (id: SuperToolId): Array<{ label: string; href: string }> => {
 const toolPlanHref = getSuperToolPhase1Href(id)
 return [
  { label: "Portfolio Plan", href: buildSuperToolDocHref("VIEWTUBEX_SUPER_TOOL_OS_DEEP_15_PACK.md") },
  toolPlanHref ? { label: "Tool Plan", href: toolPlanHref } : null,
  {
   label: "Overlap/Synthesis",
   href: buildSuperToolDocHref("super-tool-agent-plans/phase-2/VIEWTUBEX_SUPER_TOOL_PHASE_2_SYNTHESIS.md"),
  },
  { label: "Agent Report", href: getSuperToolOptimizationReportHref(id) },
 ].filter(Boolean) as Array<{ label: string; href: string }>
}

export const listSuperToolAgentAssignments = (): SuperToolRuntimePlanRecord[] =>
 Object.values(SUPER_TOOL_RUNTIME_PLAN_RECORDS)
  .filter((record) => record.agentNumber)
  .sort((left, right) => Number(left.agentNumber) - Number(right.agentNumber))
