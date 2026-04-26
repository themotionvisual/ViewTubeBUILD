import { getOracleAgentProfile } from "./agents";
import { buildOraclePrompt } from "./prompts";
import { buildSuggestionCard, createOracleQueueRuntime, validateAgentRequest } from "./runtime";
import type { OracleAgentId, OracleJobV1, SuggestionCard } from "./types";

export interface OracleSafePatch {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  text?: string;
}

export interface OracleSuggestionResult extends SuggestionCard {
  variantLabel: string;
  rationaleDetail: string;
  safePatch?: OracleSafePatch;
}

export interface ManualOracleRequest {
  agentId: OracleAgentId;
  objective: string;
  channelVoiceDna: string;
  audienceStyle: string;
  creatorConstraints: string[];
  timelineContextJson: string;
  complexityScore: number;
  toolCallCount?: number;
}

export interface ManualOracleResult {
  job: OracleJobV1;
  prompt: string;
  suggestions: OracleSuggestionResult[];
}

const oracleQueue = createOracleQueueRuntime();

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });

const buildSafePatch = (
  agentId: OracleAgentId,
  complexityScore: number,
  variantIndex: number,
): OracleSafePatch | undefined => {
  const delta = Math.min(0.35, Math.max(0.06, complexityScore / 350));

  switch (agentId) {
    case "visual-motion":
      return {
        scale: Number((1 + delta + variantIndex * 0.05).toFixed(2)),
        rotation: Math.round((variantIndex + 1) * 6),
        opacity: Number((Math.max(0.68, 1 - delta / 2)).toFixed(2)),
      };
    case "story-beat":
      return {
        x: variantIndex === 0 ? -32 : variantIndex === 1 ? 0 : 32,
        y: variantIndex === 2 ? -24 : 0,
      };
    case "render-optimization":
      return {
        opacity: Number((Math.max(0.75, 1 - delta / 3)).toFixed(2)),
      };
    default:
      return undefined;
  }
};

const buildQualitySignals = (complexityScore: number, variantIndex: number) => {
  const base = Math.max(62, Math.min(94, 76 + Math.round((complexityScore - 50) / 8)));
  const variance = variantIndex * 3;

  return {
    hookClarity: Math.max(50, base - 3 + variance),
    visualContrastReadability: Math.max(55, base - 1 + variance),
    pacingVariance: Math.max(52, base - 4 + variance),
    semanticContinuity: Math.max(58, base + variance),
    brandVoiceFit: Math.max(60, base - 2 + variance),
    retentionInterruptTiming: Math.max(58, base - 1 + variance),
  };
};

export const runManualOracleJob = async (
  request: ManualOracleRequest,
): Promise<ManualOracleResult> => {
  const profile = getOracleAgentProfile(request.agentId);
  if (!profile) {
    throw new Error(`Unknown Oracle agent: ${request.agentId}`);
  }

  const toolCallCount = request.toolCallCount ?? Math.min(3, profile.maxToolCallsPerSuggestion);
  const validation = validateAgentRequest(request.agentId, toolCallCount);
  if (!validation.valid) {
    throw new Error(validation.issue ?? "Oracle request invalid.");
  }

  const jobId = `oracle_job_${Date.now()}`;
  const now = new Date().toISOString();
  const baseJob: OracleJobV1 = {
    id: jobId,
    status: "queued",
    agentId: request.agentId,
    request: {
      task: profile.name,
      objective: request.objective,
      userInitiated: true,
      surface: "oracle-only",
    },
    progress: 0,
    createdAtIso: now,
    updatedAtIso: now,
  };

  oracleQueue.enqueue(baseJob);
  oracleQueue.updateStatus(jobId, "running");

  const prompt = buildOraclePrompt({
    agentId: request.agentId,
    objective: request.objective,
    channelVoiceDna: request.channelVoiceDna,
    audienceStyle: request.audienceStyle,
    creatorConstraints: request.creatorConstraints,
    timelineContextJson: request.timelineContextJson,
  });

  await sleep(220);

  const suggestions = [0, 1, 2].map((variantIndex): OracleSuggestionResult => {
    const signals = buildQualitySignals(request.complexityScore, variantIndex);
    const card = buildSuggestionCard({
      id: `${jobId}_variant_${variantIndex + 1}`,
      agentId: request.agentId,
      title: `${profile.name} Variant ${variantIndex + 1}`,
      rationale: `${request.objective} (variant ${variantIndex + 1})`,
      qualitySignals: signals,
      complexityScore: request.complexityScore + variantIndex * 4,
    });

    return {
      ...card,
      variantLabel: `Option ${variantIndex + 1}`,
      rationaleDetail:
        variantIndex === 0
          ? "Conservative adjustment: preserve current pacing with tighter visual focus."
          : variantIndex === 1
            ? "Balanced adjustment: improve pattern interrupts while keeping continuity stable."
            : "Aggressive adjustment: stronger retention contrast for first impression impact.",
      safePatch: buildSafePatch(request.agentId, request.complexityScore, variantIndex),
    };
  });

  oracleQueue.updateStatus(jobId, "ready");
  const finalJob = oracleQueue.list().find((job) => job.id === jobId);
  if (!finalJob) {
    throw new Error("Oracle job completed but could not be resolved.");
  }

  return {
    job: finalJob,
    prompt,
    suggestions,
  };
};

export const listOracleJobs = (): OracleJobV1[] => oracleQueue.list().slice().reverse();
