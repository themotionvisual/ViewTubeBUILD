// Type sidecar for vtE1TimelineOperations.js. Same rationale as
// vtE1TimelineContract.d.ts — pure JS runtime, loose duck-typed shapes so
// preview / render / tests all share one implementation.

import type { VtE1Clip } from "./vtE1TimelineContract"

export const TIMELINE_MIN_CLIP_DURATION_SEC: number

export type VtE1SplitResult = { left: VtE1Clip; right: VtE1Clip } | null
export type VtE1SlideResult = { clips: VtE1Clip[]; appliedDeltaSec: number }

export function splitTimelineClip(
 clip: Partial<VtE1Clip> | null | undefined,
 cutTimeSec: number,
): VtE1SplitResult
export function slipTimelineClip(
 clip: Partial<VtE1Clip>,
 deltaSec: number,
 sourceDurationSec?: number,
): VtE1Clip
export function slideTimelineClip(
 clips: VtE1Clip[],
 clipId: string,
 deltaSec: number,
): VtE1SlideResult
export function rippleDeleteTimelineClips(
 clips: VtE1Clip[],
 clipIds: string[],
): VtE1Clip[]
