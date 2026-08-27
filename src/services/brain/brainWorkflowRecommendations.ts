import type { CreatorBrainResponse, SuperToolId, SuperToolSurface } from "../../types"
import type { BrainWorkflowRecommendation } from "../../components/brain/BrainWorkflowRunPanel"

const TOOL_HINTS: Array<{ pattern: RegExp; surface: SuperToolSurface; toolId: SuperToolId }> = [
 { pattern: /title|thumbnail|packag|ctr/i, surface: "studio", toolId: "packaging-lab-pro" },
 { pattern: /retention|drop.?off|watch time|analytics|performance/i, surface: "analytics", toolId: "retention-autopsy-experiment-engine" },
 { pattern: /comment|audience|community/i, surface: "studio", toolId: "audience-loop-studio" },
 { pattern: /script|concept|idea|hook/i, surface: "studio", toolId: "creator-canvas-os" },
 { pattern: /project|schedule|publish|plan/i, surface: "projects", toolId: "project-command-kanban" },
 { pattern: /asset|vault|media/i, surface: "vault", toolId: "creator-vault-os" },
]

const routeForText = (text: string) =>
 TOOL_HINTS.find((hint) => hint.pattern.test(text)) || {
  surface: "brain" as SuperToolSurface,
  toolId: "brain-command-center" as SuperToolId,
 }

const clean = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim()

/**
 * Converts an ordinary Brain answer into a conservative, user-started workflow.
 * It deliberately does not execute anything automatically: the recommendation is
 * a visible plan until the creator presses Start, and risky/final actions remain
 * approval-gated in the run panel.
 */
export const buildWorkflowRecommendationFromBrainResponse = (
 response: CreatorBrainResponse,
 seed = "brain-response",
): BrainWorkflowRecommendation | null => {
 const raw = response as unknown as Record<string, unknown>
 const candidates: string[] = []

 const pushText = (value: unknown) => {
  if (typeof value === "string" && clean(value)) candidates.push(clean(value))
  if (Array.isArray(value)) value.forEach(pushText)
 }

 // Support the current response family without coupling execution to one answer schema.
 pushText(raw.actions)
 pushText(raw.nextActions)
 pushText(raw.recommendations)
 pushText(raw.priorities)
 pushText(raw.steps)

 if (!candidates.length) return null

 const unique = [...new Set(candidates)].slice(0, 6)
 const steps = unique.map((text, index) => {
  const route = routeForText(text)
  const requiresApproval = /publish|delete|send|post|upload|replace|overwrite|launch/i.test(text)
  return {
   title: text.length > 68 ? `${text.slice(0, 65)}…` : text,
   details: text,
   surface: route.surface,
   toolId: route.toolId,
   requiresApproval,
   order: index,
  }
 })

 return {
  id: `${seed}-${Date.now()}`,
  title: clean(raw.title) || "Brain Action Plan",
  goal: clean(raw.summary) || clean(raw.answer) || "Turn this Brain recommendation into an inspectable, resumable workflow.",
  reason: "These are the concrete next actions already present in the Brain answer. Nothing runs until you start the workflow.",
  confidence: "medium",
  steps,
 }
}
