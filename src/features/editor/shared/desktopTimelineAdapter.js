import {
  rippleDeleteTimelineClips,
  slideTimelineClip,
  slipTimelineClip,
  splitTimelineClip,
} from '../../../shared/vtE1TimelineOperations.js';

/**
 * Thin desktop adapter for the canonical timeline operation layer.
 * Desktop hosts retain UI/history ownership while sharing the same timeline math as mobile.
 */
export const desktopTimelineAdapter = Object.freeze({
  split(clips, clipId, playheadSec, makeRightId) {
    const clip = clips.find((entry) => entry.id === clipId);
    if (!clip) return { clips, changed: false };
    const split = splitTimelineClip(clip, playheadSec);
    if (!split) return { clips, changed: false };
    const right = {...split.right,id:typeof makeRightId === 'function' ? makeRightId(clip) : `${clip.id}_r_${Date.now().toString(36)}`};
    return {clips:clips.flatMap((entry)=>entry.id===clipId?[split.left,right]:[entry]),changed:true,left:split.left,right};
  },
  slip(clips, clipId, deltaSec, sourceDurationSec = Number.POSITIVE_INFINITY) {
    const clip = clips.find((entry) => entry.id === clipId);
    if (!clip) return { clips, changed: false };
    const slipped = slipTimelineClip(clip, deltaSec, sourceDurationSec);
    if (!slipped) return { clips, changed: false };
    return {clips:clips.map((entry)=>entry.id===clipId?slipped:entry),changed:true,clip:slipped};
  },
  slide(clips, clipId, deltaSec) {
    const result = slideTimelineClip(clips, clipId, deltaSec);
    return {clips:result.clips,changed:Boolean(result.appliedDeltaSec),appliedDeltaSec:result.appliedDeltaSec,reason:result.reason??null};
  },
  rippleDelete(clips, clipIds) {
    if (!Array.isArray(clipIds) || clipIds.length === 0) return { clips, changed: false };
    return {clips:rippleDeleteTimelineClips(clips,clipIds),changed:true};
  },
});
