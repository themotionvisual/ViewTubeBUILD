import type {TemplateDefinition, TemplateElement} from '../core/schema';
import {VIEWTUBE_PALETTE} from '../core/tokens';

const graphic = (id: string, name: string, svg: string, tags: string[] = []): TemplateDefinition => ({
  id, name, category: 'graphic', tags: ['graphic','svg','overlay',...tags], aspectRatio: 'responsive', width: 1920, height: 1080, responsive: true,
  elements: [{id: `${id}-svg`, type: 'svg', name, x: 0, y: 0, width: 1920, height: 1080, svg, editable: true}],
  palette: [VIEWTUBE_PALETTE[7], '#171717', '#ffffff'],
});

const frame = (stroke = '#171717', accent = VIEWTUBE_PALETTE[7]) => `<svg viewBox="0 0 1920 1080"><rect x="54" y="54" width="1812" height="972" rx="34" fill="none" stroke="${stroke}" stroke-width="18"/><rect x="54" y="54" width="82" height="82" fill="${accent}" stroke="${stroke}" stroke-width="18"/></svg>`;
const corner = (accent = VIEWTUBE_PALETTE[0]) => `<svg viewBox="0 0 1920 1080"><path d="M70 330V70H330M1590 70h260v260M1850 750v260h-260M330 1010H70V750" fill="none" stroke="#171717" stroke-width="24"/><circle cx="330" cy="70" r="20" fill="${accent}"/></svg>`;
const rays = (accent = VIEWTUBE_PALETTE[3]) => `<svg viewBox="0 0 1920 1080"><g stroke="${accent}" stroke-width="22" opacity=".72">${Array.from({length:18},(_,i)=>`<path d="M960 540 L${960+900*Math.cos(i*Math.PI/9)} ${540+900*Math.sin(i*Math.PI/9)}"/>`).join('')}</g></svg>`;
const rule = (accent = VIEWTUBE_PALETTE[8]) => `<svg viewBox="0 0 1920 1080"><rect x="120" y="900" width="1680" height="18" rx="9" fill="#171717"/><rect x="120" y="900" width="620" height="18" rx="9" fill="${accent}"/><circle cx="120" cy="909" r="28" fill="${accent}" stroke="#171717" stroke-width="12"/></svg>`;
const brackets = (accent = VIEWTUBE_PALETTE[5]) => `<svg viewBox="0 0 1920 1080"><path d="M500 280H320v520h180M1420 280h180v520h-180" fill="none" stroke="#171717" stroke-width="28"/><rect x="320" y="280" width="40" height="120" fill="${accent}"/></svg>`;

export const graphicTemplates: TemplateDefinition[] = [
  graphic('graphic-frame','Neo Frame',frame(),['frame']),
  graphic('graphic-corners','Corner Marks',corner(),['frame','corners']),
  graphic('graphic-rays','Radial Rays',rays(),['rays','burst']),
  graphic('graphic-rule','Progress Rule',rule(),['line','lower-third']),
  graphic('graphic-brackets','Focus Brackets',brackets(),['focus','frame']),
  ...VIEWTUBE_PALETTE.slice(0,12).map((color,index) => graphic(`graphic-accent-frame-${index+1}`,`Accent Frame ${index+1}`,frame('#171717',color),['frame','palette'])),
];

export const graphicElements = (template: TemplateDefinition): TemplateElement[] => template.elements;
