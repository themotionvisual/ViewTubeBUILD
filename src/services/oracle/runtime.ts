import { getOracleAgentProfile } from "./agents";
import { scoreCreativeQuality, DEFAULT_CREATIVE_RUBRIC } from "./quality";
import type {
  AiAsset,
  AiOutputMaterializationV1,
  MaterializationMode,
  OracleAgentId,
  OracleJobStatus,
  OracleJobV1,
  SuggestionCard,
} from "./types";

export interface OracleQueueRuntime {
  enqueue: (job: OracleJobV1) => void;
  updateStatus: (jobId: string, status: OracleJobStatus, error?: string) => void;
  list: () => OracleJobV1[];
}

const isoNow = (): string => new Date().toISOString();

export const createOracleQueueRuntime = (): OracleQueueRuntime => {
  const queue = new Map<string, OracleJobV1>();

  return {
    enqueue: (job) => {
      queue.set(job.id, { ...job, status: "queued", progress: 0, updatedAtIso: isoNow() });
    },
    updateStatus: (jobId, status, error) => {
      const existing = queue.get(jobId);
      if (!existing) return;
      const progress = status === "ready" ? 100 : status === "running" ? Math.max(existing.progress, 20) : existing.progress;
      queue.set(jobId, {
        ...existing,
        status,
        progress,
        error,
        updatedAtIso: isoNow(),
      });
    },
    list: () => Array.from(queue.values()).sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso)),
  };
};

export const suggestMaterializationMode = (
  complexityScore: number,
  preferred: MaterializationMode = "hybrid-smart",
): AiOutputMaterializationV1 => {
  const threshold = 72;
  if (preferred === "editable") {
    return { mode: "editable", complexityThresholdForPrerender: threshold, reversibleToEditable: true };
  }

  if (preferred === "prerendered") {
    return { mode: "prerendered", complexityThresholdForPrerender: threshold, reversibleToEditable: true };
  }

  const mode: MaterializationMode = complexityScore >= threshold ? "prerendered" : "editable";
  return {
    mode,
    complexityThresholdForPrerender: threshold,
    reversibleToEditable: true,
  };
};

export const buildSuggestionCard = (params: {
  id: string;
  agentId: OracleAgentId;
  title: string;
  rationale: string;
  qualitySignals: {
    hookClarity: number;
    visualContrastReadability: number;
    pacingVariance: number;
    semanticContinuity: number;
    brandVoiceFit: number;
    retentionInterruptTiming: number;
  };
  complexityScore: number;
}): SuggestionCard => {
  const score = scoreCreativeQuality(DEFAULT_CREATIVE_RUBRIC, params.qualitySignals);
  const mode = suggestMaterializationMode(params.complexityScore, "hybrid-smart").mode;

  return {
    id: params.id,
    agentId: params.agentId,
    title: params.title,
    rationale: params.rationale,
    estimatedImpact: score.score >= 85 ? "high" : score.score >= 72 ? "medium" : "low",
    qualityScore: score.score,
    requiresConfirmation: true,
    suggestedMode: mode,
  };
};

export const validateAgentRequest = (agentId: OracleAgentId, toolCallCount: number): { valid: boolean; issue?: string } => {
  const profile = getOracleAgentProfile(agentId);
  if (!profile) return { valid: false, issue: `Unknown agent: ${agentId}` };
  if (toolCallCount > profile.maxToolCallsPerSuggestion) {
    return {
      valid: false,
      issue: `Tool-call budget exceeded for ${profile.name}: ${toolCallCount} > ${profile.maxToolCallsPerSuggestion}`,
    };
  }

  return { valid: true };
};

export const selectSuggestedVariant = (asset: AiAsset): string | null => {
  if (!asset.variants.length) return null;
  const sorted = [...asset.variants].sort((a, b) => {
    const scoreA = a.qualityScore * 0.7 + a.noveltyScore * 0.3;
    const scoreB = b.qualityScore * 0.7 + b.noveltyScore * 0.3;
    return scoreB - scoreA;
  });
  return sorted[0]?.variantId ?? null;
};
