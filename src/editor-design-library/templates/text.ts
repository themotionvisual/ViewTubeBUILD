import type {TemplateDefinition} from '../core/schema';
import {VIEWTUBE_PALETTE} from '../core/tokens';

const textTemplate = (id: string, name: string, text: string, y: number, size: number, align: 'left'|'center' = 'left'): TemplateDefinition => ({
  id, name, category: 'text', tags: ['text','typography','editable'], aspectRatio: 'responsive', width: 1920, height: 1080, responsive: true,
  elements: [{id: `${id}-text`, type: 'text', name, x: align === 'center' ? 260 : 120, y, width: align === 'center' ? 1400 : 1500, height: size * 2.4, text, fontSize: size, fontWeight: 999, fill: '#171717', editable: true, animation: {preset: 'spring', durationFrames: 18}}],
});

export const textTemplates: TemplateDefinition[] = [
  textTemplate('text-hero-left','Hero Left','YOUR STORY STARTS HERE',180,128),
  textTemplate('text-hero-center','Hero Center','THE BIG IDEA',390,150,'center'),
  textTemplate('text-chapter','Chapter Heading','CHAPTER 01',150,96),
  textTemplate('text-quote','Quote','“A MOMENT WORTH REMEMBERING.”',300,92),
  textTemplate('text-stat','Statistic','87%',260,220),
  textTemplate('text-date','Date + Place','2 DECEMBER 1805 · AUSTERLITZ',220,72),
  textTemplate('text-hook','Video Hook','BUT THEN EVERYTHING CHANGED.',300,112),
  textTemplate('text-question','Question','WHAT HAPPENED NEXT?',320,120),
  textTemplate('text-lower-third','Lower Third','NAME · ROLE / LOCATION',780,54),
  textTemplate('text-source','Source Citation','SOURCE · EYEWITNESS ACCOUNT · 1805',900,34),
].map((template, index) => ({...template, palette: [VIEWTUBE_PALETTE[index % VIEWTUBE_PALETTE.length], '#171717', '#ffffff']}));
