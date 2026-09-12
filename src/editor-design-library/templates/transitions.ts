import type {TemplateDefinition} from '../core/schema';
import {CANVASES, VIEWTUBE_INK, VIEWTUBE_PALETTE, VIEWTUBE_WHITE} from '../core/tokens';

const c = CANVASES.landscape;

function transition(id: string, name: string, preset: TemplateDefinition['transition'] extends infer T ? any : never, color: string, tags: string[], svg: string): TemplateDefinition {
  return {
    id,
    name,
    category: 'transition',
    tags: ['transition', 'section', ...tags],
    aspectRatio: 'responsive',
    width: c.width,
    height: c.height,
    durationFrames: 30,
    responsive: true,
    customizable: true,
    style: {colors: {primary: color, background: VIEWTUBE_WHITE, foreground: VIEWTUBE_INK, border: VIEWTUBE_INK, shadow: VIEWTUBE_INK}},
    transition: preset,
    elements: [
      {id: `${id}-shape`, type: 'svg', name, x: 0, y: 0, width: c.width, height: c.height, svg, fillToken: 'colors.primary', strokeToken: 'colors.border', strokeWidthToken: 'sizing.strokeWidth', editable: true, animation: preset},
    ],
  };
}

export const transitionTemplates: TemplateDefinition[] = [
  transition('tr-color-wipe', 'Color Wipe', {preset: 'wipe', direction: 'right', durationFrames: 24, easing: 'power3.inOut'}, VIEWTUBE_PALETTE[7], ['wipe', 'horizontal'], '<rect width="100%" height="100%"/>'),
  transition('tr-arrow-wipe', 'Arrow Wipe', {preset: 'wipe', direction: 'right', durationFrames: 26, easing: 'power4.inOut'}, VIEWTUBE_PALETTE[5], ['arrow', 'wipe'], '<path d="M0 0H1540L1920 540L1540 1080H0Z"/>'),
  transition('tr-iris', 'Iris Open', {preset: 'scale', direction: 'out', durationFrames: 28, easing: 'expo.inOut'}, VIEWTUBE_PALETTE[3], ['iris', 'circle'], '<circle cx="960" cy="540" r="900"/>'),
  transition('tr-chevron', 'Chevron Push', {preset: 'slide', direction: 'right', durationFrames: 28, easing: 'power4.inOut'}, VIEWTUBE_PALETTE[2], ['chevron', 'push'], '<path d="M0 0H1220L1640 540L1220 1080H0L420 540Z"/>'),
  transition('tr-ring', 'Expanding Ring', {preset: 'scale', direction: 'out', durationFrames: 24, easing: 'expo.out'}, VIEWTUBE_PALETTE[10], ['ring', 'pulse'], '<circle cx="960" cy="540" r="220" fill="none" stroke="currentColor" stroke-width="120"/>'),
  transition('tr-diagonal', 'Diagonal Slice', {preset: 'wipe', direction: 'right', durationFrames: 24, easing: 'power3.inOut'}, VIEWTUBE_PALETTE[0], ['diagonal', 'slice'], '<path d="M-300 0H1280L2220 1080H640Z"/>'),
  transition('tr-frame-expand', 'Frame Expansion', {preset: 'scale', direction: 'out', durationFrames: 26, easing: 'back.out(1.35)'}, VIEWTUBE_PALETTE[8], ['frame', 'expand'], '<rect x="160" y="90" width="1600" height="900" rx="48" fill="none" stroke="currentColor" stroke-width="160"/>'),
  transition('tr-flash-cut', 'Flash Cut', {preset: 'fade', durationFrames: 12, easing: 'power2.inOut'}, VIEWTUBE_WHITE, ['flash', 'cut'], '<rect width="100%" height="100%"/>'),
];
