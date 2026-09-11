import type { AIBrainContextSnapshot } from "../aiBrainCommandInterface"
import { readBrainUserControls } from "./BrainUserControls"
import type {
 BrainEvidenceExplanation,
 BrainEvidenceItem,
} from "./phaseOneIntegration"
import { explainBrainEvidence } from "./phaseOneIntegration"

/**
 * Converts the EXISTING canonical Brain evidence pack (which is assembled
 * from VT-SYNC / canonical analytics) into the shared Phase-One evidence
 * contract. No second analytics store is introduced here.
 */
export const buildAnalyticsEvidenceExplanation = (input: {
 snapshot: AIBrainContextSnapshot
 claim: string
 confidence?: number
 inference?: boolean
 caveats?: string[]
}): BrainEvidenceExplanation => {
 const controls = readBrainUserControls()
 if (!controls.allowAnalytics) {
  return explainBrainEvidence(input.claim, [], {
   confidence: 0,
   inference: true,
   missingEvidence: ["Analytics evidence is disabled in Brain User Controls."],
   caveats: ["Brain must not reconstruct private channel metrics while analytics access is disabled."],
  })
 }

 const pack = input.snapshot.evidencePack
 const evidence: BrainEvidenceItem[] = [
  ...pack.topVideos.slice(0, 5).map((video) => ({
   id: video.evidenceId,
   label: video.title,
   role: "primary" as const,
   source: "vt-sync" as const,
   detail: typeof video.metrics.views === "number"
    ? `${video.metrics.views.toLocaleString()} views`
    : "Video performance evidence",
   route: "/analytics",
  })),
  ...pack.searchTerms.slice(0, 5).map((term) => ({
   id: term.evidenceId,
   label: term.value,
   role: "context" as const,
   source: "vt-sync" as const,
   detail: "YouTube search evidence",
   route: "/analytics",
  })),
  ...pack.trafficSources.slice(0, 5).map((source) => ({
   id: source.evidenceId,
   label: source.value,
   role: "context" as const,
   source: "vt-sync" as const,
   detail: "Traffic-source evidence",
   route: "/analytics",
  })),
 ]

 return explainBrainEvidence(input.claim, evidence, {
  confidence: input.confidence ?? (input.snapshot.inferredProfile.status === "ready" ? 0.85 : 0.6),
  inference: input.inference ?? true,
  missingEvidence: pack.missingInputs.slice(0, 6),
  caveats: input.caveats ?? [],
 })
}
