import { clampTimelineValue, clipDurationSec } from './vtE1TimelineContract.js';

export const TIMELINE_MIN_CLIP_DURATION_SEC = 0.05;

const byStart = (left, right) => Number(left.start || 0) - Number(right.start || 0);
const copy = (clip, patch) => ({ ...clip, ...patch });

export const splitTimelineClip = (clip, cutTimeSec) => {
  const start = Number(clip?.start || 0);
  const end = Number(clip?.end || 0);
  const cut = Number(cutTimeSec);
  if (!clip || !(cut > start && cut < end)) return null;

  const offset = cut - start;
  const sourceInSec = Math.max(0, Number(clip.sourceInSec || 0));
  const sourceOutSec = Number.isFinite(Number(clip.sourceOutSec))
    ? Number(clip.sourceOutSec)
    : sourceInSec + clipDurationSec(clip);
  const sourceCutSec = clampTimelineValue(sourceInSec + offset, sourceInSec, sourceOutSec);
  const keyframes = Array.isArray(clip.keyframes) ? clip.keyframes : [];

  return {
    left: copy(clip, {
      end: cut,
      sourceOutSec: sourceCutSec,
      keyframes: keyframes.filter((keyframe) => Number(keyframe.offsetSec || 0) <= offset)
    }),
    right: copy(clip, {
      start: cut,
      sourceInSec: sourceCutSec,
      keyframes: keyframes
        .filter((keyframe) => Number(keyframe.offsetSec || 0) >= offset)
        .map((keyframe) => ({ ...keyframe, offsetSec: Number(keyframe.offsetSec || 0) - offset }))
    })
  };
};

export const slipTimelineClip = (clip, deltaSec, sourceDurationSec = Number.POSITIVE_INFINITY) => {
  if (!clip) return null;
  const duration = clipDurationSec(clip);
  const sourceIn = Math.max(0, Number(clip.sourceInSec || 0));
  const knownSourceDuration = Number(sourceDurationSec);
  const maximumIn = Number.isFinite(knownSourceDuration)
    ? Math.max(0, knownSourceDuration - duration)
    : Number.POSITIVE_INFINITY;
  const nextSourceIn = clampTimelineValue(sourceIn + Number(deltaSec || 0), 0, maximumIn);
  return copy(clip, {
    sourceInSec: nextSourceIn,
    sourceOutSec: nextSourceIn + duration
  });
};

// Slide keeps the outer span fixed: the previous clip's end and the next clip's
// start move with the selected clip, while all three remain contiguous.
export const slideTimelineClip = (clips, clipId, deltaSec) => {
  const selected = (clips || []).find((clip) => clip.id === clipId);
  if (!selected) return { clips, appliedDeltaSec: 0, reason: 'Select a clip to slide.' };
  const trackClips = (clips || [])
    .filter((clip) => clip.trackId === selected.trackId)
    .sort(byStart);
  const index = trackClips.findIndex((clip) => clip.id === clipId);
  const previous = trackClips[index - 1];
  const next = trackClips[index + 1];
  if (!previous || !next) return { clips, appliedDeltaSec: 0, reason: 'Slide requires adjacent clips on both sides.' };

  const isContiguous = Math.abs(Number(previous.end) - Number(selected.start)) <= TIMELINE_MIN_CLIP_DURATION_SEC
    && Math.abs(Number(selected.end) - Number(next.start)) <= TIMELINE_MIN_CLIP_DURATION_SEC;
  if (!isContiguous) return { clips, appliedDeltaSec: 0, reason: 'Close both seams before sliding this clip.' };

  const requested = Number(deltaSec || 0);
  const minDelta = TIMELINE_MIN_CLIP_DURATION_SEC - clipDurationSec(previous);
  const maxDelta = clipDurationSec(next) - TIMELINE_MIN_CLIP_DURATION_SEC;
  const appliedDeltaSec = clampTimelineValue(requested, minDelta, maxDelta);
  if (!appliedDeltaSec) return { clips, appliedDeltaSec: 0, reason: '' };

  const moved = new Map([
    [previous.id, copy(previous, { end: Number(previous.end) + appliedDeltaSec })],
    [selected.id, copy(selected, { start: Number(selected.start) + appliedDeltaSec, end: Number(selected.end) + appliedDeltaSec })],
    [next.id, copy(next, { start: Number(next.start) + appliedDeltaSec })]
  ]);
  return { clips: (clips || []).map((clip) => moved.get(clip.id) || clip), appliedDeltaSec, reason: '' };
};

export const rippleDeleteTimelineClips = (clips, clipIds) => {
  const removed = new Set((clipIds || []).filter(Boolean));
  if (!removed.size) return clips || [];
  const byTrack = new Map();
  (clips || []).forEach((clip) => {
    if (!byTrack.has(clip.trackId)) byTrack.set(clip.trackId, []);
    byTrack.get(clip.trackId).push(clip);
  });

  return Array.from(byTrack.values()).flatMap((trackClips) => {
    let shiftSec = 0;
    return trackClips.sort(byStart).flatMap((clip) => {
      if (removed.has(clip.id)) {
        shiftSec += clipDurationSec(clip);
        return [];
      }
      return [copy(clip, { start: Math.max(0, Number(clip.start) - shiftSec), end: Math.max(TIMELINE_MIN_CLIP_DURATION_SEC, Number(clip.end) - shiftSec) })];
    });
  });
};
