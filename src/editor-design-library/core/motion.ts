import type {MotionPreset, TemplateAnimation} from './schema';

export interface MotionPresetDefinition {
  id: MotionPreset;
  label: string;
  duration: number;
  easing: string;
  from?: Record<string, string | number>;
  to?: Record<string, string | number>;
  stagger?: number;
}

export const MOTION_PRESETS: Record<MotionPreset, MotionPresetDefinition> = {
  none: {id: 'none', label: 'None', duration: 0, easing: 'none'},
  fade: {id: 'fade', label: 'Fade', duration: 0.45, easing: 'power2.out', from: {opacity: 0}, to: {opacity: 1}},
  slide: {id: 'slide', label: 'Slide', duration: 0.55, easing: 'power3.out', from: {y: 48, opacity: 0}, to: {y: 0, opacity: 1}},
  scale: {id: 'scale', label: 'Scale', duration: 0.5, easing: 'power2.out', from: {scale: 0.9, opacity: 0}, to: {scale: 1, opacity: 1}},
  spring: {id: 'spring', label: 'Spring', duration: 0.65, easing: 'back.out(1.7)', from: {y: 54, scale: 0.95, opacity: 0}, to: {y: 0, scale: 1, opacity: 1}},
  wipe: {id: 'wipe', label: 'Wipe', duration: 0.65, easing: 'power3.inOut', from: {xPercent: -100}, to: {xPercent: 0}},
  reveal: {id: 'reveal', label: 'Reveal', duration: 0.6, easing: 'expo.out', from: {clipPath: 'inset(0 100% 0 0)'}, to: {clipPath: 'inset(0 0% 0 0)'}},
  stagger: {id: 'stagger', label: 'Stagger', duration: 0.45, easing: 'power3.out', from: {y: 30, opacity: 0}, to: {y: 0, opacity: 1}, stagger: 0.08},
  loop: {id: 'loop', label: 'Loop', duration: 1, easing: 'sine.inOut', from: {scale: 1}, to: {scale: 1.03}},
  pop: {id: 'pop', label: 'Pop', duration: 0.42, easing: 'back.out(2)', from: {scale: 0.72, opacity: 0}, to: {scale: 1, opacity: 1}},
  overshoot: {id: 'overshoot', label: 'Overshoot', duration: 0.68, easing: 'back.out(1.9)', from: {x: -72, opacity: 0}, to: {x: 0, opacity: 1}},
  bounce: {id: 'bounce', label: 'Bounce', duration: 0.8, easing: 'bounce.out', from: {y: -100, opacity: 0}, to: {y: 0, opacity: 1}},
  elastic: {id: 'elastic', label: 'Elastic', duration: 0.9, easing: 'elastic.out(1, 0.35)', from: {scale: 0.55, opacity: 0}, to: {scale: 1, opacity: 1}},
  'type-reveal': {id: 'type-reveal', label: 'Type Reveal', duration: 0.75, easing: 'steps(12)', from: {opacity: 0}, to: {opacity: 1}},
  'mask-reveal': {id: 'mask-reveal', label: 'Mask Reveal', duration: 0.65, easing: 'power4.inOut', from: {clipPath: 'inset(0 100% 0 0)'}, to: {clipPath: 'inset(0 0% 0 0)'}},
  'line-draw': {id: 'line-draw', label: 'Line Draw', duration: 0.75, easing: 'power2.inOut', from: {strokeDashoffset: 1}, to: {strokeDashoffset: 0}},
  'rotate-in': {id: 'rotate-in', label: 'Rotate In', duration: 0.6, easing: 'back.out(1.5)', from: {rotation: -8, scale: 0.94, opacity: 0}, to: {rotation: 0, scale: 1, opacity: 1}},
  'blur-in': {id: 'blur-in', label: 'Blur In', duration: 0.55, easing: 'power2.out', from: {filter: 'blur(18px)', opacity: 0}, to: {filter: 'blur(0px)', opacity: 1}},
  'stagger-words': {id: 'stagger-words', label: 'Stagger Words', duration: 0.45, easing: 'power3.out', from: {y: 28, opacity: 0}, to: {y: 0, opacity: 1}, stagger: 0.09},
  'stagger-letters': {id: 'stagger-letters', label: 'Stagger Letters', duration: 0.35, easing: 'power2.out', from: {y: 18, opacity: 0}, to: {y: 0, opacity: 1}, stagger: 0.025},
};

export function resolveMotionPreset(animation?: TemplateAnimation): MotionPresetDefinition {
  if (!animation) return MOTION_PRESETS.none;
  const base = MOTION_PRESETS[animation.preset];
  return {
    ...base,
    duration: animation.durationFrames ? animation.durationFrames / 30 : base.duration,
    easing: animation.easing ?? base.easing,
  };
}
