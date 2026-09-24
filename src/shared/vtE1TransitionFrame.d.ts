import type { VtE1CanonicalTransitionType } from './vtE1TransitionCatalog.js';

export type VtE1TransitionDirection = 'entering' | 'exiting';

export interface VtE1TransitionFrameStyle {
  opacity: number;
  transform: string;
  clipPath: string;
  maskImage: string;
}

export function transitionFrameStyleFor(
  transitionType: VtE1CanonicalTransitionType | string | null | undefined,
  progress: number,
  direction: VtE1TransitionDirection,
  params?: Record<string, unknown>,
): VtE1TransitionFrameStyle;
