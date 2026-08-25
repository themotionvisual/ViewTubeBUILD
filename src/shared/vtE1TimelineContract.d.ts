// Type sidecar for vtE1TimelineContract.js — pure JS on purpose so the same
// module executes inside browser preview AND Remotion render without a TS
// build step. Types stay loose here (Record-based) because the JS deliberately
// accepts partial/duck-typed clips and transitions; strict types would push
// wrong-way discipline back into callers that only ever assemble partials.

export const TRANSITION_SEAM_TOLERANCE_SEC: number

export type VtE1Clip = {
 id: string
 trackId: string
 start: number
 end: number
 sourceInSec?: number
 sourceOutSec?: number
 layerId?: string
 keyframes?: Array<Record<string, unknown>>
 [key: string]: unknown
}

export type VtE1Transition = {
 leftClipId: string
 rightClipId: string
 durationSec?: number
 nominalSeamSec?: number
 [key: string]: unknown
}

export type VtE1TransitionWindow = {
 seamSec: number
 durationSec: number
 halfDurationSec: number
 startSec: number
 endSec: number
}

export type VtE1TransitionValidation = { valid: boolean; reason?: string }

export type VtE1Project = {
 clips: VtE1Clip[]
 transitions?: VtE1Transition[]
 [key: string]: unknown
}

export function clampTimelineValue(value: number, minimum: number, maximum: number): number
export function clipDurationSec(clip?: Partial<VtE1Clip>): number
export function transitionWindowFor(
 transition?: Partial<VtE1Transition>,
 leftClip?: Partial<VtE1Clip>,
 rightClip?: Partial<VtE1Clip>,
): VtE1TransitionWindow
export function validateTransitionSeam(
 leftClip?: Partial<VtE1Clip> | null,
 rightClip?: Partial<VtE1Clip> | null,
 toleranceSec?: number,
): VtE1TransitionValidation
export function sourceTimeAtTimelineSec(
 project: VtE1Project,
 clip: VtE1Clip,
 timelineSec: number,
): number
