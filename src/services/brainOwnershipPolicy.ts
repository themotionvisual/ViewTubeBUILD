import type { BrainCommandAction, SuperToolId, SuperToolRuntimePlanRecord } from "../types"

export const BRAIN_OS_CANONICAL_OWNER = "brain-os" as const
export const BRAIN_OS_CONTROL_SURFACE_TOOL_ID = "brain-command-center" as const

export type BrainOwnershipScope = "canonical-owner" | "control-surface" | "consumer"

export const BRAIN_OS_POLICY = {
 canonicalOwner: BRAIN_OS_CANONICAL_OWNER,
 controlSurfaceToolId: BRAIN_OS_CONTROL_SURFACE_TOOL_ID,
 brainOwnedCapabilities: [
  "memory-schema",
  "prompt-policy",
  "reflection-policy",
  "onboarding-knowledge",
  "creator-profile",
  "channel-knowledge",
  "context-access-rules",
  "self-improvement-policy",
 ],
 superToolAllowedCapabilities: [
  "read-brain-context",
  "emit-brain-signal",
  "queue-reviewed-command",
  "display-command-context",
  "handoff-to-target-tool",
 ],
 superToolForbiddenCapabilities: [
  "own-brain-storage",
  "define-brain-schema",
  "define-prompt-policy",
  "define-reflection-policy",
  "autonomously-sync",
  "autonomously-upload",
  "autonomously-delete",
  "autonomously-publish",
  "autonomously-render",
  "mutate-youtube-without-review",
 ],
} as const

const FORBIDDEN_SUPER_TOOL_OWNERSHIP_PATTERNS = [
 /\bowns?\s+brain\b/i,
 /\bowns?\s+brain\s+command\s+routing\b/i,
 /\bowns?\s+reflection\s+control\b/i,
 /\bowns?\s+reflection\s+policy\b/i,
 /\bowns?\s+brain\s+signal/i,
 /\bkeep\s+(as\s+)?top-level\s+brain\s+surface\b/i,
 /\bdefines?\s+brain\s+(storage|schema|memory|reflection|prompt)/i,
]

const FORBIDDEN_COMMAND_EXECUTION_KEYS = [
 "autoExecute",
 "autoRun",
 "directExecute",
 "directMutation",
 "executeImmediately",
 "skipReview",
 "youtubeMutation",
] as const

export const getBrainOwnershipScope = (toolId?: SuperToolId | string | null): BrainOwnershipScope =>
 toolId === BRAIN_OS_CONTROL_SURFACE_TOOL_ID ? "control-surface" : "consumer"

export const getSuperToolBrainOwnershipIssues = (
 record: SuperToolRuntimePlanRecord,
): string[] => {
 const searchableText = [
  record.verdict,
  record.nextStep,
  record.runtimeBoundary,
  record.firstFunctionalAction,
  ...record.modules,
 ].join("\n")

 return FORBIDDEN_SUPER_TOOL_OWNERSHIP_PATTERNS.filter((pattern) =>
  pattern.test(searchableText),
 ).map((pattern) => `Super-tool record claims Brain OS ownership: ${pattern.source}`)
}

export const isReviewOnlyBrainCommandAction = (
 action: Partial<BrainCommandAction> & Record<string, unknown>,
): boolean => {
 if (!action || typeof action !== "object") return false
 if (action.status && !["queued", "dispatched", "resolved"].includes(String(action.status))) return false
 return FORBIDDEN_COMMAND_EXECUTION_KEYS.every((key) => action[key] !== true)
}
