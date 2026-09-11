import {VIEWTUBE_PALETTE} from '../core/tokens';

export const linearGradient = (a: string, b: string, angle = 45) =>
  `linear-gradient(${angle}deg, ${a}, ${b})`;

export const radialGradient = (inner: string, outer: string) =>
  `radial-gradient(circle at center, ${inner}, ${outer})`;

export const gradientPresets = VIEWTUBE_PALETTE.map((color, index) => ({
  id: `vt-gradient-${index + 1}`,
  name: `ViewTube Gradient ${index + 1}`,
  background: linearGradient(color, VIEWTUBE_PALETTE[(index + 3) % VIEWTUBE_PALETTE.length]),
}));

export type PatternKind = 'grid' | 'dots' | 'stripes' | 'diagonal' | 'checker' | 'crosses' | 'rings' | 'waves';

export const svgPattern = (kind: PatternKind, color = '#171717', opacity = 0.18): string => {
  const common = `stroke="${color}" stroke-opacity="${opacity}" fill="none"`;
  const shapes: Record<PatternKind, string> = {
    grid: `<path d="M0 20H40M20 0V40" ${common}/>`,
    dots: `<circle cx="10" cy="10" r="2" fill="${color}" fill-opacity="${opacity}"/>`,
    stripes: `<path d="M0 10H40M0 30H40" ${common} stroke-width="4"/>`,
    diagonal: `<path d="M-10 40L40-10M10 50L50 10" ${common} stroke-width="3"/>`,
    checker: `<path d="M0 0H20V20H0ZM20 20H40V40H20Z" fill="${color}" fill-opacity="${opacity}"/>`,
    crosses: `<path d="M20 10V30M10 20H30" ${common} stroke-width="3"/>`,
    rings: `<circle cx="20" cy="20" r="10" ${common} stroke-width="2"/>`,
    waves: `<path d="M0 20Q10 5 20 20T40 20" ${common} stroke-width="3"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">${shapes[kind]}</svg>`;
};
