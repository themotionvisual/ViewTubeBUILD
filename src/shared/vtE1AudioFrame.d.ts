export interface VtE1AudioKeyframeLike {
  offsetSec?: number;
  values?: Record<string, unknown>;
  interp?: string;
}

export interface VtE1AudioClipLike {
  playbackRate?: number;
  keyframes?: VtE1AudioKeyframeLike[];
  [key: string]: unknown;
}

export interface VtE1AudioFrame {
  volume: number;
  rawVolume: number;
  envelope: number;
  muted: boolean;
  playbackRate: number;
  pan: number;
  fadeInSec: number;
  fadeOutSec: number;
}

export const VT_E1_AUDIO_ANIMATED_PROPS: readonly ['volume'];

export function resolveVtE1AudioFrame(
  payload: Record<string, unknown> | null | undefined,
  clip: VtE1AudioClipLike | null | undefined,
  localSeconds: number,
  durationSeconds: number,
  trackMuted?: boolean,
): VtE1AudioFrame;
