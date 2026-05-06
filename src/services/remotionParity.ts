import type { CompositionSpec } from "../editor-core/compiler/timelineToComposition";
import type { TimelineState } from "../editor-core/contracts";

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
  timelineState: TimelineState,
  composition: CompositionSpec,
): RemotionParityReport => {
  const frameDrift: RemotionParityDrift[] = [];
  const easingMismatches: RemotionParityDrift[] = [];
  const transitionMismatches: RemotionParityDrift[] = [];

  const transitionByFromClip = new Map(
    timelineState.transitions.map((transition) => [transition.fromClipId, transition]),
  );

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

    const expectedFrames = clip.endFrame - clip.startFrame;
    if (Math.abs(sequence.durationInFrames - expectedFrames) > 0) {
      frameDrift.push({
        clipId: clip.id,
        type: "timing",
        expected: String(expectedFrames),
        actual: String(sequence.durationInFrames),
      });
    }

    const firstKeyframe = timelineState.keyframes.find(kf => kf.clipId === clip.id);
    const expectedEasing = firstKeyframe?.easing || "linear";
    if (sequence.easing !== expectedEasing) {
      easingMismatches.push({
        clipId: clip.id,
        type: "easing",
        expected: expectedEasing,
        actual: sequence.easing,
      });
    }

    const expectedTransition = transitionByFromClip.get(clip.id)?.type || "none";
    const actualTransition = sequence.transitionType || "none";
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
