import { evaluateVtE1KeyframedValue } from './vtE1VisualFrame.js';

/**
 * Canonical VT_E1 audio-frame contract.
 *
 * Shared by interactive preview and final Remotion output so volume keyframes,
 * clip fades, mute state and playback-rate semantics do not diverge.
 */

const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));

export const VT_E1_AUDIO_ANIMATED_PROPS=Object.freeze(['volume']);

export function resolveVtE1AudioFrame(
  payload,
  clip,
  localSeconds,
  durationSeconds,
  trackMuted=false,
){
  const duration=Math.max(0.001,Number(durationSeconds)||0.001);
  const local=clamp(localSeconds,0,duration);
  const baseVolume=clamp(payload?.volume??1,0,1);
  const keyedVolume=evaluateVtE1KeyframedValue(
    baseVolume,
    clip?.keyframes,
    'volume',
    local,
  );
  const volume=clamp(keyedVolume,0,1);
  const fadeInSec=clamp(payload?.fadeInSec??0,0,duration);
  const fadeOutSec=clamp(payload?.fadeOutSec??0,0,duration);
  const fadeIn=fadeInSec>0?clamp(local/fadeInSec,0,1):1;
  const remaining=Math.max(0,duration-local);
  const fadeOut=fadeOutSec>0?clamp(remaining/fadeOutSec,0,1):1;
  const envelope=Math.min(fadeIn,fadeOut);
  const muted=Boolean(trackMuted||payload?.muted);
  const playbackRate=clamp(payload?.playbackRate??clip?.playbackRate??1,.1,4);
  const pan=clamp(payload?.pan??0,-1,1);

  return{
    volume:muted?0:volume*envelope,
    rawVolume:volume,
    envelope,
    muted,
    playbackRate,
    pan,
    fadeInSec,
    fadeOutSec,
  };
}
