import {VIEWTUBE_PALETTE} from '../core/tokens';

export interface GradientOptions {
  colorA: string;
  colorB: string;
  colorC?: string;
  angle?: number;
  positionX?: number;
  positionY?: number;
}

export interface PatternOptions {
  color?: string;
  background?: string;
  opacity?: number;
  scale?: number;
  spacing?: number;
  strokeWidth?: number;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
}

export const linearGradient = (a: string, b: string, angle = 45, c?: string) =>
  `linear-gradient(${angle}deg, ${a}, ${c ? `${c}, ` : ''}${b})`;

export const radialGradient = (inner: string, outer: string, positionX = 50, positionY = 50) =>
  `radial-gradient(circle at ${positionX}% ${positionY}%, ${inner}, ${outer})`;

export const conicGradient = (a: string, b: string, angle = 0) =>
  `conic-gradient(from ${angle}deg, ${a}, ${b}, ${a})`;

export const meshGradient = (a: string, b: string, c: string, background = '#ffffff') =>
  [
    `radial-gradient(circle at 18% 18%, ${a} 0 0, transparent 34%)`,
    `radial-gradient(circle at 82% 24%, ${b} 0 0, transparent 32%)`,
    `radial-gradient(circle at 52% 84%, ${c} 0 0, transparent 38%)`,
    background,
  ].join(', ');

export const gradientPresets = VIEWTUBE_PALETTE.map((color, index) => ({
  id: `vt-gradient-${index + 1}`,
  name: `ViewTube Gradient ${index + 1}`,
  colorA: color,
  colorB: VIEWTUBE_PALETTE[(index + 3) % VIEWTUBE_PALETTE.length],
  angle: 45,
  background: linearGradient(color, VIEWTUBE_PALETTE[(index + 3) % VIEWTUBE_PALETTE.length]),
}));

export type PatternKind =
  | 'grid'
  | 'dots'
  | 'stripes'
  | 'diagonal'
  | 'checker'
  | 'crosses'
  | 'rings'
  | 'waves'
  | 'stars'
  | 'diamonds'
  | 'triangles'
  | 'pills'
  | 'bricks'
  | 'radiating';

const esc = (value: string) => value.replace(/"/g, '&quot;');

export const svgPattern = (kind: PatternKind, options: PatternOptions = {}): string => {
  const color = esc(options.color ?? '#171717');
  const opacity = options.opacity ?? 0.18;
  const scale = Math.max(0.25, options.scale ?? 1);
  const spacing = Math.max(8, options.spacing ?? 40);
  const strokeWidth = Math.max(0.5, options.strokeWidth ?? 3);
  const rotation = options.rotation ?? 0;
  const size = Math.round(spacing * scale);
  const half = size / 2;
  const quarter = size / 4;
  const common = `stroke="${color}" stroke-opacity="${opacity}" fill="none" stroke-width="${strokeWidth}"`;
  const shapes: Record<PatternKind, string> = {
    grid: `<path d="M0 ${half}H${size}M${half} 0V${size}" ${common}/>`,
    dots: `<circle cx="${quarter}" cy="${quarter}" r="${Math.max(1, strokeWidth)}" fill="${color}" fill-opacity="${opacity}"/>`,
    stripes: `<path d="M0 ${quarter}H${size}M0 ${half + quarter}H${size}" ${common}/>`,
    diagonal: `<path d="M-${quarter} ${size}L${size} -${quarter}M${quarter} ${size + quarter}L${size + quarter} ${quarter}" ${common}/>` ,
    checker: `<path d="M0 0H${half}V${half}H0ZM${half} ${half}H${size}V${size}H${half}Z" fill="${color}" fill-opacity="${opacity}"/>`,
    crosses: `<path d="M${half} ${quarter}V${half + quarter}M${quarter} ${half}H${half + quarter}" ${common}/>`,
    rings: `<circle cx="${half}" cy="${half}" r="${quarter}" ${common}/>` ,
    waves: `<path d="M0 ${half}Q${quarter} ${quarter / 2} ${half} ${half}T${size} ${half}" ${common}/>` ,
    stars: `<path d="M${half} ${quarter / 2}L${half + quarter / 3} ${half - quarter / 3}L${size - quarter / 3} ${half}L${half + quarter / 3} ${half + quarter / 3}L${half} ${size - quarter / 2}L${half - quarter / 3} ${half + quarter / 3}L${quarter / 3} ${half}L${half - quarter / 3} ${half - quarter / 3}Z" fill="${color}" fill-opacity="${opacity}"/>`,
    diamonds: `<path d="M${half} ${quarter / 2}L${size - quarter / 2} ${half}L${half} ${size - quarter / 2}L${quarter / 2} ${half}Z" ${common}/>` ,
    triangles: `<path d="M${half} ${quarter / 2}L${size - quarter / 2} ${size - quarter / 2}H${quarter / 2}Z" ${common}/>` ,
    pills: `<rect x="${quarter / 2}" y="${half - quarter / 3}" width="${size - quarter}" height="${quarter * 0.66}" rx="${quarter / 3}" fill="${color}" fill-opacity="${opacity}"/>`,
    bricks: `<path d="M0 ${half}H${size}M${half} 0V${half}M${quarter} ${half}V${size}" ${common}/>` ,
    radiating: `<path d="M${half} ${half}L${half} 0M${half} ${half}L${size} ${half}M${half} ${half}L${half} ${size}M${half} ${half}L0 ${half}M${half} ${half}L${size} 0M${half} ${half}L${size} ${size}M${half} ${half}L0 ${size}M${half} ${half}L0 0" ${common}/>` ,
  };
  const bg = options.background ? `<rect width="100%" height="100%" fill="${esc(options.background)}"/>` : '';
  const ox = options.offsetX ?? 0;
  const oy = options.offsetY ?? 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><g transform="translate(${ox} ${oy}) rotate(${rotation} ${half} ${half})">${bg}${shapes[kind]}</g></svg>`;
};

export const patternKinds: PatternKind[] = [
  'grid','dots','stripes','diagonal','checker','crosses','rings','waves','stars','diamonds','triangles','pills','bricks','radiating',
];
