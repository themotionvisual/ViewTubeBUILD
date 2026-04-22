import type { EditorClip } from "../contracts";

export interface SnapInput {
  frame: number;
  clipId?: string;
  clips: EditorClip[];
  playheadFrame: number;
  stepFrames: number;
  thresholdFrames: number;
}

export const collectSnapPoints = (
  clips: EditorClip[],
  playheadFrame: number,
  stepFrames: number,
  ignoreClipId?: string,
): number[] => {
  const clipPoints = clips
    .filter((clip) => clip.id !== ignoreClipId)
    .flatMap((clip) => [clip.startFrame, clip.endFrame]);

  const gridPoints: number[] = [];
  const maxFrame = Math.max(600, ...clips.map((clip) => clip.endFrame + stepFrames));
  for (let frame = 0; frame <= maxFrame; frame += Math.max(1, stepFrames)) {
    gridPoints.push(frame);
  }

  return [...clipPoints, ...gridPoints, playheadFrame];
};

export const snapFrame = ({ frame, clipId, clips, playheadFrame, stepFrames, thresholdFrames }: SnapInput): number => {
  const points = collectSnapPoints(clips, playheadFrame, stepFrames, clipId);
  if (points.length === 0) return frame;
  const closest = points.reduce((best, point) => {
    const bestDist = Math.abs(best - frame);
    const nextDist = Math.abs(point - frame);
    return nextDist < bestDist ? point : best;
  }, points[0]);

  if (Math.abs(closest - frame) <= thresholdFrames) {
    return closest;
  }
  return frame;
};
