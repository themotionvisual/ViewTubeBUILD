import type {TemplateAnimation} from '../core/schema';

export const MOTION_PRESETS: Record<string, TemplateAnimation> = {
  fadeIn: {preset: 'fade', startFrame: 0, durationFrames: 15},
  slideLeft: {preset: 'slide', startFrame: 0, durationFrames: 18, direction: 'left', intensity: 1},
  slideRight: {preset: 'slide', startFrame: 0, durationFrames: 18, direction: 'right', intensity: 1},
  slideUp: {preset: 'slide', startFrame: 0, durationFrames: 18, direction: 'up', intensity: 1},
  springIn: {preset: 'spring', startFrame: 0, durationFrames: 22, intensity: 1},
  scaleIn: {preset: 'scale', startFrame: 0, durationFrames: 16, intensity: 0.85},
  wipeLeft: {preset: 'wipe', startFrame: 0, durationFrames: 20, direction: 'left'},
  reveal: {preset: 'reveal', startFrame: 0, durationFrames: 20},
  stagger: {preset: 'stagger', startFrame: 0, durationFrames: 24, delayFrames: 3},
  ambientLoop: {preset: 'loop', startFrame: 0, durationFrames: 90, intensity: 0.5},
};
