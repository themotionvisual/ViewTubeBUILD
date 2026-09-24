import { resolveVtE1TransitionDefinition } from './vtE1TransitionCatalog.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const clamp01 = (value) => clamp(value, 0, 1);

const directionFor = (definition, params) => (
  String(params?.direction || definition.params?.direction || 'from-left')
);

export function transitionFrameStyleFor(
  transitionType,
  progress,
  direction,
  params = {},
) {
  const definition = resolveVtE1TransitionDefinition(transitionType);
  const p = clamp01(progress);
  const entering = direction === 'entering';

  switch (definition.id) {
    case 'cut':
      return {
        opacity: entering ? (p >= 0.5 ? 1 : 0) : (p < 0.5 ? 1 : 0),
        transform: '',
        clipPath: '',
        maskImage: '',
      };

    case 'fade':
    case 'crossfade':
      return {
        opacity: entering ? p : 1 - p,
        transform: '',
        clipPath: '',
        maskImage: '',
      };

    case 'slideLeft':
    case 'slideRight': {
      const from = directionFor(definition, params);
      const horizontal = from === 'from-left' || from === 'from-right';
      const sign = from === 'from-left' || from === 'from-top' ? -1 : 1;
      const start = entering ? sign * 100 : 0;
      const end = entering ? 0 : -sign * 100;
      const value = start + (end - start) * p;
      return {
        opacity: 1,
        transform: horizontal ? `translateX(${value}%)` : `translateY(${value}%)`,
        clipPath: '',
        maskImage: '',
      };
    }

    case 'wipeLeft':
    case 'wipeRight': {
      const from = directionFor(definition, params);
      const reveal = entering ? p : 1 - p;
      const clipPath = {
        'from-left': `inset(0 ${(1 - reveal) * 100}% 0 0)`,
        'from-right': `inset(0 0 0 ${(1 - reveal) * 100}%)`,
        'from-top': `inset(0 0 ${(1 - reveal) * 100}% 0)`,
        'from-bottom': `inset(${(1 - reveal) * 100}% 0 0 0)`,
      }[from] || `inset(0 ${(1 - reveal) * 100}% 0 0)`;
      return {
        opacity: 1,
        transform: '',
        clipPath,
        maskImage: '',
      };
    }

    case 'zoom':
      return {
        opacity: entering ? p : 1 - p,
        transform: `scale(${entering ? 0.86 + p * 0.14 : 1 + p * 0.2})`,
        clipPath: '',
        maskImage: '',
      };

    default:
      return { opacity: 1, transform: '', clipPath: '', maskImage: '' };
  }
}
