// Shared timeline math for the editor preview and the Remotion composition.
export const TRANSITION_SEAM_TOLERANCE_SEC = 0.05;

export const clampTimelineValue = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export const clipDurationSec = (clip = {}) => Math.max(0.05, Number(clip.end || 0) - Number(clip.start || 0));

export const transitionWindowFor = (transition = {}, leftClip = {}, rightClip = {}) => {
  const durationSec = clampTimelineValue(Number(transition.durationSec || 0.35), 0.05, 8);
  const nominal = Number(transition.nominalSeamSec);
  const seamSec = Number.isFinite(nominal)
    ? nominal
    : ((Number(leftClip.end || 0) + Number(rightClip.start || 0)) / 2);
  const halfDurationSec = durationSec / 2;
  return { seamSec, durationSec, halfDurationSec, startSec: seamSec - halfDurationSec, endSec: seamSec + halfDurationSec };
};

export const validateTransitionSeam = (leftClip, rightClip, toleranceSec = TRANSITION_SEAM_TOLERANCE_SEC) => {
  if (!leftClip || !rightClip) return { valid: false, reason: 'Both clips are required for a transition.' };
  if (leftClip.trackId !== rightClip.trackId) return { valid: false, reason: 'Transitions require neighboring clips on the same visual track.' };
  if (Number(leftClip.end || 0) > Number(rightClip.start || 0) + toleranceSec) {
    return { valid: false, reason: 'Transitions cannot be created across overlapping clips.' };
  }
  const gapSec = Number(rightClip.start || 0) - Number(leftClip.end || 0);
  if (Math.abs(gapSec) > toleranceSec) {
    return { valid: false, reason: `Trim or close the ${gapSec.toFixed(2)}s gap before adding a transition.` };
  }
  return { valid: true, gapSec };
};

export const sourceTimeAtTimelineSec = (project, clip, seconds) => {
  const sourceInSec = Math.max(0, Number(clip?.sourceInSec || 0));
  const sourceOutSec = Number.isFinite(Number(clip?.sourceOutSec))
    ? Number(clip.sourceOutSec)
    : sourceInSec + clipDurationSec(clip);
  const transition = (project?.transitions || []).find((entry) => entry.leftClipId === clip?.id || entry.rightClipId === clip?.id);
  if (!transition) return Math.max(0, sourceInSec + Math.max(0, Number(seconds || 0) - Number(clip?.start || 0)));
  const left = (project?.clips || []).find((entry) => entry.id === transition.leftClipId);
  const right = (project?.clips || []).find((entry) => entry.id === transition.rightClipId);
  if (!validateTransitionSeam(left, right).valid) return Math.max(0, sourceInSec + Math.max(0, Number(seconds || 0) - Number(clip?.start || 0)));
  const window = transitionWindowFor(transition, left, right);
  if (clip?.id === left.id && seconds > left.end && seconds <= window.endSec) return Math.max(0, sourceOutSec + (seconds - left.end));
  if (clip?.id === right.id && seconds < right.start && seconds >= window.startSec) return Math.max(0, sourceInSec - (right.start - seconds));
  return Math.max(0, sourceInSec + Math.max(0, Number(seconds || 0) - Number(clip?.start || 0)));
};

export const normalizeRenderOutputFormat = (value) => ['mp4', 'mov', 'webm'].includes(String(value || '').toLowerCase())
  ? String(value).toLowerCase()
  : 'mp4';

export const renderOutputLabel = (format) => ({ mp4: 'Final MP4', mov: 'Final MOV', webm: 'Final WebM' })[normalizeRenderOutputFormat(format)];
