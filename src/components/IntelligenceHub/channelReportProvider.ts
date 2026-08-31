import type { ChannelReportEvidencePackV2 } from "../../services/analytics-canon"
import type {
 LayeredChannelReportModelOutputV2,
 ReportClaimV2,
 ReportValidationV2,
} from "./types"

export const LAYERED_REPORT_SCHEMA_VERSION = "layered-channel-report-v2" as const
export const LAYERED_REPORT_PROMPT_VERSION = "evidence-bound-channel-report-v2" as const

export const LAYERED_REPORT_SECTION_IDS = [
 "executive-summary",
 "algorithm-diagnosis",
 "strategy-engine",
 "sculpting-engine",
 "channel-pulse",
 "comparative-analysis",
 "keyword-matrix",
 "engagement-matrix",
 "retention-burnout",
 "revenue-dynamics",
 "risk-guardrails",
 "execution-queue",
] as const

export type ChannelReportProviderRequest = {
 generationId: string
 channelId: string
 snapshotId: string
 promptVersion: typeof LAYERED_REPORT_PROMPT_VERSION
 schemaVersion: typeof LAYERED_REPORT_SCHEMA_VERSION
 evidence: ChannelReportEvidencePackV2
 brainContext?: string
 creatorIntent?: string
 repair?: {
  previousOutput: LayeredChannelReportModelOutputV2
  errors: string[]
 }
 signal?: AbortSignal
}

export interface ChannelReportProvider {
 generate(request: ChannelReportProviderRequest): Promise<LayeredChannelReportModelOutputV2>
}

const readJson = async <T>(response: Response): Promise<T> => {
 const payload = await response.json().catch(() => ({})) as Record<string, unknown>
 if (!response.ok) {
  const error = new Error(String(payload.error || `Report provider failed with ${response.status}.`)) as Error & { status?: number; code?: string }
  error.status = response.status
  error.code = typeof payload.code === "string" ? payload.code : undefined
  throw error
 }
 return payload as T
}

export const createHttpChannelReportProvider = (
 endpoint = "/api/intelligence/channel-report",
): ChannelReportProvider => ({
 generate: async (request) => {
  const response = await fetch(endpoint, {
   method: "POST",
   credentials: "include",
   headers: { "Content-Type": "application/json", Accept: "application/json" },
   body: JSON.stringify({
    generationId: request.generationId,
    channelId: request.channelId,
    snapshotId: request.snapshotId,
    promptVersion: request.promptVersion,
    schemaVersion: request.schemaVersion,
    evidence: request.evidence,
    brainContext: request.brainContext,
    creatorIntent: request.creatorIntent,
    repair: request.repair,
   }),
   signal: request.signal,
  })
  const payload = await readJson<{ report: LayeredChannelReportModelOutputV2 }>(response)
  if (!payload.report || typeof payload.report !== "object") throw new Error("Report provider returned no structured report.")
  return payload.report
 },
})

const numericTokens = (value: string): string[] => value.match(/\b\d[\d,]*(?:\.\d+)?%?/g) || []
const normalizedNumber = (value: string | number): string => String(value).replace(/[,\s%]/g, "").replace(/\.0+$/, "")

const reportText = (report: LayeredChannelReportModelOutputV2): string[] => [
 report.executiveSummary,
 report.executiveLayer.strongestSignal,
 report.executiveLayer.criticalGap,
 ...report.executiveLayer.nextActions,
 ...report.sections.flatMap((section) => [
  section.summary,
  ...section.bullets,
  ...section.actions,
  ...section.claims.map((claim) => claim.statement),
 ]),
].filter(Boolean)

export const validateLayeredChannelReport = (
 report: LayeredChannelReportModelOutputV2,
 evidence: ChannelReportEvidencePackV2,
): ReportValidationV2 => {
 const errors: string[] = []
 const evidenceIds = new Set(Object.keys(evidence.evidenceIndex))
 const invalidClaimIds: string[] = []
 const claims = report.sections.flatMap((section) => section.claims || [])
 claims.forEach((claim) => {
  const invalidRefs = (claim.evidenceIds || []).filter((id) => !evidenceIds.has(id))
  const requiresEvidence = claim.classification === "fact" || claim.classification === "observation"
  if (invalidRefs.length || (requiresEvidence && !claim.evidenceIds?.length)) {
   invalidClaimIds.push(claim.id)
   errors.push(`Claim ${claim.id} has unavailable or missing evidence.`)
  }
  if (!Number.isFinite(claim.confidence) || claim.confidence < 0 || claim.confidence > 1) {
   invalidClaimIds.push(claim.id)
   errors.push(`Claim ${claim.id} confidence must be between 0 and 1.`)
  }
 })

 const sectionIds = report.sections.map((section) => section.id)
 LAYERED_REPORT_SECTION_IDS.forEach((id) => {
  if (!sectionIds.includes(id)) errors.push(`Missing required report section: ${id}.`)
 })
 if (new Set(sectionIds).size !== sectionIds.length) errors.push("Report contains duplicate section IDs.")

 const allowedNumbers = new Set<string>()
 evidence.facts.forEach((fact) => {
  if (typeof fact.value === "number" || typeof fact.value === "string") allowedNumbers.add(normalizedNumber(fact.value))
  numericTokens(fact.statement).forEach((token) => allowedNumbers.add(normalizedNumber(token)))
 })
 const unsupportedNumbers = Array.from(new Set(reportText(report)
  .flatMap(numericTokens)
  .filter((token) => !allowedNumbers.has(normalizedNumber(token)))))
 if (unsupportedNumbers.length) errors.push(`Unsupported numeric claims: ${unsupportedNumbers.join(", ")}.`)

 return {
  valid: errors.length === 0,
  repaired: false,
  errors,
  invalidClaimIds: Array.from(new Set(invalidClaimIds)),
  unsupportedNumbers,
 }
}

const sentenceHasUnsupportedNumber = (value: string, unsupported: Set<string>): boolean =>
 numericTokens(value).some((token) => unsupported.has(normalizedNumber(token)))

const sanitizeClaim = (claim: ReportClaimV2, validation: ReportValidationV2): ReportClaimV2 | null => {
 if (validation.invalidClaimIds.includes(claim.id)) return null
 const unsupported = new Set(validation.unsupportedNumbers.map(normalizedNumber))
 if (sentenceHasUnsupportedNumber(claim.statement, unsupported)) return null
 return { ...claim, validationStatus: "valid" }
}

export const sanitizeInvalidLayeredReport = (
 report: LayeredChannelReportModelOutputV2,
 validation: ReportValidationV2,
): LayeredChannelReportModelOutputV2 => {
 const unsupported = new Set(validation.unsupportedNumbers.map(normalizedNumber))
 const safeText = (value: string, fallback: string): string =>
  sentenceHasUnsupportedNumber(value, unsupported) ? fallback : value
 return {
  ...report,
  executiveSummary: safeText(report.executiveSummary, "The available evidence supports only a limited channel summary for this window."),
  executiveLayer: {
   ...report.executiveLayer,
   strongestSignal: safeText(report.executiveLayer.strongestSignal, "Not enough validated evidence to name a strongest signal."),
   criticalGap: safeText(report.executiveLayer.criticalGap, "Some required channel evidence is unavailable."),
   nextActions: report.executiveLayer.nextActions.filter((action) => !sentenceHasUnsupportedNumber(action, unsupported)),
  },
  sections: report.sections.map((section) => {
   const claims = (section.claims || []).map((claim) => sanitizeClaim(claim, validation)).filter((claim): claim is ReportClaimV2 => Boolean(claim))
   return {
    ...section,
    summary: safeText(section.summary, "Not enough validated evidence for this section."),
    bullets: section.bullets.filter((bullet) => !sentenceHasUnsupportedNumber(bullet, unsupported)),
    actions: section.actions.filter((action) => !sentenceHasUnsupportedNumber(action, unsupported)),
    claims,
   }
  }),
 }
}

