import type { VtE1Clip } from '../../../shared/vtE1TimelineContract';

export interface DesktopTimelineSplitResult {
  clips: VtE1Clip[];
  changed: boolean;
  left?: VtE1Clip;
  right?: VtE1Clip;
}

export interface DesktopTimelineClipResult {
  clips: VtE1Clip[];
  changed: boolean;
  clip?: VtE1Clip;
}

export interface DesktopTimelineSlideResult {
  clips: VtE1Clip[];
  changed: boolean;
  appliedDeltaSec?: number;
  reason?: string | null;
}

export interface DesktopTimelineRippleDeleteResult {
  clips: VtE1Clip[];
  changed: boolean;
}

export const desktopTimelineAdapter: Readonly<{
  split(
    clips: VtE1Clip[],
    clipId: string,
    playheadSec: number,
    makeRightId?: (clip: VtE1Clip) => string,
  ): DesktopTimelineSplitResult;
  slip(
    clips: VtE1Clip[],
    clipId: string,
    deltaSec: number,
    sourceDurationSec?: number,
  ): DesktopTimelineClipResult;
  slide(
    clips: VtE1Clip[],
    clipId: string,
    deltaSec: number,
  ): DesktopTimelineSlideResult;
  rippleDelete(
    clips: VtE1Clip[],
    clipIds: string[],
  ): DesktopTimelineRippleDeleteResult;
}>;
