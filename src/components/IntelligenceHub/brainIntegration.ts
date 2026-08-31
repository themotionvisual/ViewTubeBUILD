import type { BrainGenerationRecord, ChannelKnowledgeModel, ContextPacket, ToolContextPack } from "../../types"
import {
 consultBrain,
 getLatestChannelKnowledgeModelDB,
 getLatestToolContextPackDB,
 initializeBrain,
 saveChannelKnowledgeModelDB,
 saveGenerationRecordDB,
 saveToolContextPackDB,
} from "../../services/brain"
import type { CanonicalIntelligenceEvidenceBundle } from "../../services/analytics-canon"
import type { BrainUpdateResult, UltimateChannelReport } from "./types"

export type IntelligenceBrainContext = {
 packet: ContextPacket
 channelKnowledge: ChannelKnowledgeModel | null
 toolContextPack: ToolContextPack | null
 contextText: string
}

const clip = (value: string, maximum: number): string => value.slice(0, Math.max(0, maximum))

const rethrowAbort = (error: unknown) => {
 if (error instanceof DOMException && error.name === "AbortError") throw error
}

export const loadIntelligenceBrainContext = async (
 channelId: string,
): Promise<IntelligenceBrainContext> => {
 await initializeBrain()
 const [packet, channelKnowledge, toolContextPack] = await Promise.all([
  consultBrain("intelligence-hub", { channelId, surface: "/analytics" }),
  getLatestChannelKnowledgeModelDB(channelId),
  getLatestToolContextPackDB(channelId),
 ])
 const contextText = [
  packet.identityAndAspirations && `IDENTITY: ${packet.identityAndAspirations}`,
  packet.contentDNA && `CONTENT DNA: ${packet.contentDNA}`,
  packet.performanceLedger && `PERFORMANCE LEDGER: ${packet.performanceLedger}`,
  packet.futureStateMap && `FUTURE STATE: ${packet.futureStateMap}`,
  packet.strategicAdvice && `STRATEGIC ADVICE: ${packet.strategicAdvice}`,
  channelKnowledge?.summary && `CHANNEL KNOWLEDGE: ${channelKnowledge.summary}`,
  toolContextPack?.contextBlock && `LATEST TOOL CONTEXT: ${toolContextPack.contextBlock}`,
 ].filter(Boolean).join("\n")
 return { packet, channelKnowledge, toolContextPack, contextText: clip(contextText, 6_000) }
}

const createBrainGenerationRecord = (
 report: UltimateChannelReport,
 evidence: CanonicalIntelligenceEvidenceBundle,
 contextText: string,
): BrainGenerationRecord => ({
 id: report.meta.generationId,
 runId: report.meta.generationId,
 channelId: evidence.channelId,
 toolId: "intelligence-hub",
 promptVersion: report.meta.promptPackVersion,
 model: "configured-analysis-model",
 inputSummary: clip([
  `surface=/analytics`,
  `snapshot=${evidence.snapshotId}`,
  `window=${evidence.selectedWindow}`,
  `coverage=${evidence.coverage.available}/${evidence.coverage.total}`,
  contextText,
 ].join("\n"), 4_000),
 outputSummary: clip(report.executiveSummary, 2_000),
 sourceEvidenceIds: evidence.reportEvidencePack
  ? Object.keys(evidence.reportEvidencePack.evidenceIndex).filter((id) => id.startsWith("agg:")).slice(0, 240)
  : evidence.datasets.flatMap((dataset) => dataset.evidenceRefs).slice(0, 240),
 createdAt: report.meta.generatedAt,
})

export const persistIntelligenceBrainArtifacts = async (
 report: UltimateChannelReport,
 evidence: CanonicalIntelligenceEvidenceBundle,
 contextText: string,
 signal?: AbortSignal,
): Promise<BrainUpdateResult> => {
 signal?.throwIfAborted()
 if (report.meta.overallStatus === "failed") {
  const result: BrainUpdateResult = {
   status: "failed",
   updated: false,
   notes: ["Brain write rejected because the generation did not produce a usable report."],
   qualityFlags: ["brain_report_generation_failed"],
  }
  report.brainUpdate = result
  return result
 }
 const reportPack = evidence.reportEvidencePack
 const availableEvidenceIds = new Set(Object.keys(reportPack?.evidenceIndex || {}))
 const invalidClaims = (report.claims || []).filter((claim) => {
  const requiresEvidence = claim.classification === "fact" || claim.classification === "observation"
  return claim.validationStatus === "invalid"
   || claim.validationStatus === "unsupported"
   || (requiresEvidence && !claim.evidenceIds.length)
   || claim.evidenceIds.some((id) => !availableEvidenceIds.has(id))
 })
 const evidenceScopeMismatch = !reportPack
  || report.meta.resolvedBundleFingerprint !== reportPack.bundleFingerprint
  || report.meta.privacyFingerprint !== reportPack.privacyFingerprint
 if (!report.validation?.valid || invalidClaims.length || evidenceScopeMismatch) {
  const result: BrainUpdateResult = {
   status: "failed",
   updated: false,
   notes: ["Brain write rejected because report claims or resolved evidence scope did not pass validation."],
   qualityFlags: [
    !report.validation?.valid ? "brain_report_validation_failed" : "",
    invalidClaims.length ? "brain_report_claims_unsupported" : "",
    evidenceScopeMismatch ? "brain_resolved_evidence_scope_mismatch" : "",
   ].filter(Boolean),
  }
  report.brainUpdate = result
  return result
 }
 if (!evidence.channelId || report.meta.channelId !== evidence.channelId || report.meta.snapshotId !== evidence.snapshotId) {
  const result: BrainUpdateResult = {
   status: "failed",
   updated: false,
   notes: ["Brain write rejected because the channel or snapshot changed during generation."],
   qualityFlags: ["brain_scope_mismatch"],
  }
  report.brainUpdate = result
  return result
 }

 const generationRecord = createBrainGenerationRecord(report, evidence, contextText)
 const failures: string[] = []
 try {
  signal?.throwIfAborted()
  await saveGenerationRecordDB(generationRecord)
 } catch (error) {
  rethrowAbort(error)
  failures.push("generation_record")
 }
 if (report.channelKnowledge) {
  try {
   signal?.throwIfAborted()
   await saveChannelKnowledgeModelDB(report.channelKnowledge)
  } catch (error) {
   rethrowAbort(error)
   failures.push("channel_knowledge")
  }
 }
 if (report.toolContextPack) {
  try {
   signal?.throwIfAborted()
   await saveToolContextPackDB(report.toolContextPack)
  } catch (error) {
   rethrowAbort(error)
   failures.push("tool_context_pack")
  }
 }

 const result: BrainUpdateResult = failures.length ? {
  status: "degraded",
  updated: failures.length < 3,
  generationRecordId: failures.includes("generation_record") ? undefined : generationRecord.id,
  knowledgeModelId: failures.includes("channel_knowledge") ? undefined : report.channelKnowledge?.id,
  toolContextPackId: failures.includes("tool_context_pack") ? undefined : report.toolContextPack?.id,
  notes: [`Report retained, but Brain persistence failed for: ${failures.join(", ")}.`],
  qualityFlags: failures.map((failure) => `brain_${failure}_save_failed`),
 } : {
  status: "persisted",
  updated: true,
  generationRecordId: generationRecord.id,
  knowledgeModelId: report.channelKnowledge?.id,
  toolContextPackId: report.toolContextPack?.id,
  notes: ["Generation, channel knowledge, and tool context were saved to the channel-scoped Brain."],
  qualityFlags: [],
 }

 report.meta.brainGenerationRecord = generationRecord
 report.brainUpdate = result
 return result
}
