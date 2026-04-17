import type { EditorEngineState } from "./editorEngine";
import type { RemotionCompositionSpec } from "./timelineToRemotionCompiler";

export interface RemotionParityDrift {
  clipId: string;
  type: "timing" | "easing" | "missingSequence";
  expected?: string;
  actual?: string;
}

export interface RemotionParityReport {
  frameDrift: RemotionParityDrift[];
  easingMismatches: RemotionParityDrift[];
  transitionMismatches: RemotionParityDrift[];
  summary: {
    totalIssues: number;
    parity: "pass" | "warn";
  };
}

export const buildRemotionParityReport = (
  timelineState: EditorEngineState,
  composition: RemotionCompositionSpec,
): RemotionParityReport => {
  const frameDrift: RemotionParityDrift[] = [];
  const easingMismatches: RemotionParityDrift[] = [];
  const transitionMismatches: RemotionParityDrift[] = [];

  timelineState.clips.forEach((clip) => {
    const sequence = composition.sequences.find((item) => item.clipId === clip.id);
    if (!sequence) {
      frameDrift.push({
        clipId: clip.id,
        type: "missingSequence",
        expected: "sequence exists",
        actual: "missing",
      });
      return;
    }

    const expectedFrames = Math.round((clip.end - clip.start) * composition.fps);
    if (Math.abs(sequence.durationInFrames - expectedFrames) > 1) {
      frameDrift.push({
        clipId: clip.id,
        type: "timing",
        expected: String(expectedFrames),
        actual: String(sequence.durationInFrames),
      });
    }

    const expectedEasing = clip.keyframes.find((keyframe) => keyframe.easing)?.easing || "linear";
    if (sequence.style.easing !== expectedEasing && !(expectedEasing === "linear" && sequence.style.easing === "linear")) {
      easingMismatches.push({
        clipId: clip.id,
        type: "easing",
        expected: expectedEasing,
        actual: sequence.style.easing,
      });
    }

    const expectedTransition = clip.transitionToNext?.type || "none";
    const actualTransition = sequence.transitionToNext?.type || "none";
    if (expectedTransition !== actualTransition) {
      transitionMismatches.push({
        clipId: clip.id,
        type: "timing",
        expected: expectedTransition,
        actual: actualTransition,
      });
    }
  });

  const totalIssues = frameDrift.length + easingMismatches.length + transitionMismatches.length;

  return {
    frameDrift,
    easingMismatches,
    transitionMismatches,
    summary: {
      totalIssues,
      parity: totalIssues === 0 ? "pass" : "warn",
    },
  };
};
