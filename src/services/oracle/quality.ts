import type { CreativeQualityRubricV1, RetentionDiagnostic } from "./types";

export interface QualitySignalInput {
  hookClarity: number;
  visualContrastReadability: number;
  pacingVariance: number;
  semanticContinuity: number;
  brandVoiceFit: number;
  retentionInterruptTiming: number;
}

export interface QualityScoreResult {
  score: number;
  pass: boolean;
  needsRevision: boolean;
  reasons: string[];
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const DEFAULT_CREATIVE_RUBRIC: CreativeQualityRubricV1 = {
  id: "creative-quality-default-v1",
  minScore: 72,
  weights: {
    hookClarity: 0.2,
    visualContrastReadability: 0.18,
    pacingVariance: 0.16,
    semanticContinuity: 0.16,
    brandVoiceFit: 0.15,
    retentionInterruptTiming: 0.15,
  },
};

export const scoreCreativeQuality = (
  rubric: CreativeQualityRubricV1,
  input: QualitySignalInput,
): QualityScoreResult => {
  const normalized: QualitySignalInput = {
    hookClarity: clamp(input.hookClarity, 0, 100),
    visualContrastReadability: clamp(input.visualContrastReadability, 0, 100),
    pacingVariance: clamp(input.pacingVariance, 0, 100),
    semanticContinuity: clamp(input.semanticContinuity, 0, 100),
    brandVoiceFit: clamp(input.brandVoiceFit, 0, 100),
    retentionInterruptTiming: clamp(input.retentionInterruptTiming, 0, 100),
  };

  const weighted =
    normalized.hookClarity * rubric.weights.hookClarity +
    normalized.visualContrastReadability * rubric.weights.visualContrastReadability +
    normalized.pacingVariance * rubric.weights.pacingVariance +
    normalized.semanticContinuity * rubric.weights.semanticContinuity +
    normalized.brandVoiceFit * rubric.weights.brandVoiceFit +
    normalized.retentionInterruptTiming * rubric.weights.retentionInterruptTiming;

  const score = Math.round(clamp(weighted, 0, 100));
  const reasons: string[] = [];

  if (normalized.hookClarity < 60) reasons.push("Hook clarity below threshold.");
  if (normalized.visualContrastReadability < 60) reasons.push("Visual readability risk detected.");
  if (normalized.pacingVariance < 55) reasons.push("Pacing variance too flat.");
  if (normalized.brandVoiceFit < 65) reasons.push("Channel voice mismatch likely.");

  const pass = score >= rubric.minScore && reasons.length === 0;

  return {
    score,
    pass,
    needsRevision: !pass,
    reasons,
  };
};

export const detectCreativeConflicts = (diagnostics: RetentionDiagnostic[]): string[] => {
  const issues: string[] = [];
  const hasCaptionOverload = diagnostics.some((d) => d.riskType === "caption-overload" && d.severity !== "low");
  const hasTransitionOverload = diagnostics.some((d) => d.riskType === "transition-overload" && d.severity !== "low");
  const hasAudioFlatline = diagnostics.some((d) => d.riskType === "audio-flatline" && d.severity === "high");

  if (hasCaptionOverload) issues.push("Caption clutter detected. Reduce on-screen text density.");
  if (hasTransitionOverload) issues.push("Transition spam detected. Increase hold durations.");
  if (hasAudioFlatline) issues.push("Audio energy flatline detected. Add controlled dynamic shifts.");

  return issues;
};
