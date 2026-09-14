import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';

/** Properties already understood by the Remotion audio layer. Kept on the shared clip, not in mobile-only UI state. */
export interface ClipAudioProperties{volume:number;playbackRate:number;audioStreamIndex?:number;loopVolumeCurveBehavior?:'repeat'|'extend'}
export const DEFAULT_CLIP_AUDIO:ClipAudioProperties={volume:1,playbackRate:1};
export const readClipAudio=(clip:VtE1Clip):ClipAudioProperties=>{const c=clip as VtE1Clip&Partial<ClipAudioProperties>;return{volume:Number.isFinite(Number(c.volume))?Number(c.volume):1,playbackRate:Number.isFinite(Number(c.playbackRate))?Number(c.playbackRate):1,audioStreamIndex:Number.isInteger(c.audioStreamIndex)?c.audioStreamIndex:undefined,loopVolumeCurveBehavior:c.loopVolumeCurveBehavior==='extend'?'extend':c.loopVolumeCurveBehavior==='repeat'?'repeat':undefined}};
export const clampClipAudio=(patch:Partial<ClipAudioProperties>,current:ClipAudioProperties):ClipAudioProperties=>{const next={...current,...patch};return{...next,volume:Math.max(0,Math.min(4,next.volume)),playbackRate:Math.max(.1,Math.min(4,next.playbackRate)),audioStreamIndex:next.audioStreamIndex==null?undefined:Math.max(0,Math.floor(next.audioStreamIndex))}};
export const patchClipAudio=(clip:VtE1Clip,patch:Partial<ClipAudioProperties>):VtE1Clip=>({...clip,...clampClipAudio(patch,readClipAudio(clip))});
