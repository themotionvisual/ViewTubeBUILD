export interface VtE1KeyframeLike {
  offsetSec?: number;
  values?: Record<string, unknown>;
  interp?: string;
}

export interface VtE1VisualClipLike {
  transform?: Partial<VtE1ClipVisualTransform>;
  cropLeft?: number;
  cropRight?: number;
  cropTop?: number;
  cropBottom?: number;
  keyframes?: VtE1KeyframeLike[];
  [key: string]: unknown;
}

export interface VtE1ClipVisualTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
}

export interface VtE1ResolvedVisualFrame extends VtE1ClipVisualTransform {
  payload: Record<string, unknown>;
  width: number;
  height: number;
}

export const VT_E1_VISUAL_ANIMATED_PROPS: readonly string[];
export const VT_E1_DEFAULT_CLIP_VISUAL_TRANSFORM: Readonly<VtE1ClipVisualTransform>;

export function readVtE1ClipVisualTransform(clip: VtE1VisualClipLike | null | undefined): VtE1ClipVisualTransform;
export function easeVtE1KeyframeProgress(rawT: number, interp?: string): number;
export function evaluateVtE1KeyframedValue(
  base: unknown,
  keyframes: VtE1KeyframeLike[] | undefined,
  prop: string,
  localSeconds: number,
): unknown;
export function evaluateVtE1VisualPayload(
  payload: Record<string, unknown> | null | undefined,
  clip: VtE1VisualClipLike | null | undefined,
  localSeconds: number,
): Record<string, unknown>;
export function resolveVtE1VisualFrame(
  payload: Record<string, unknown> | null | undefined,
  clip: VtE1VisualClipLike | null | undefined,
  localSeconds: number,
  defaultWidth?: number,
  defaultHeight?: number,
): VtE1ResolvedVisualFrame;
export function vtE1MediaCropStyle(clip: VtE1VisualClipLike | null | undefined): {
  transform: string;
  transformOrigin: '0 0';
};
export function sortVtE1Tracks<T extends { order?: number }>(tracks: readonly T[] | null | undefined): T[];
