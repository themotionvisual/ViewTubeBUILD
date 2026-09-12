import type {TemplateDefinition, TemplateElement, TemplateCategory} from '../core/schema';

const W = 1920;
const H = 1080;

const textEl = (
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  role: 'title' | 'subtitle' | 'body' | 'label' = 'title',
): TemplateElement => ({
  id,
  type: 'text',
  name: id,
  x,
  y,
  width,
  height,
  text,
  editable: true,
  fillToken: 'colors.foreground',
  fontFamilyToken:
    role === 'body'
      ? 'typography.bodyFamily'
      : role === 'label'
        ? 'typography.labelFamily'
        : role === 'subtitle'
          ? 'typography.headingFamily'
          : 'typography.displayFamily',
  fontSizeToken:
    role === 'body'
      ? 'sizing.bodySize'
      : role === 'subtitle' || role === 'label'
        ? 'sizing.subtitleSize'
        : 'sizing.titleSize',
  fontWeightToken: 'typography.fontWeight',
  animation: {
    preset: role === 'label' ? 'slide' : role === 'body' ? 'fade' : 'spring',
    durationFrames: role === 'title' ? 18 : 14,
    direction: 'up',
  },
});

const svgEl = (
  id: string,
  svg: string,
  x: number,
  y: number,
  width: number,
  height: number,
): TemplateElement => ({
  id,
  type: 'svg',
  name: id,
  x,
  y,
  width,
  height,
  svg,
  editable: true,
  animation: {preset: 'reveal', durationFrames: 16},
});

const base = (
  id: string,
  name: string,
  category: TemplateCategory,
  tags: string[],
  elements: TemplateElement[],
  durationFrames = 150,
): TemplateDefinition => ({
  id,
  name,
  category,
  tags,
  aspectRatio: 'responsive',
  width: W,
  height: H,
  durationFrames,
  elements,
  responsive: true,
  customizable: true,
  entrance: {preset: 'stagger', durationFrames: 20, direction: 'up'},
  responsiveLayouts: {
    portrait: {
      sizing: {
        scale: 0.84,
        titleSize: 126,
        subtitleSize: 46,
        bodySize: 36,
        iconSize: 72,
        strokeWidth: 5,
        radius: 20,
        shadowOffset: 10,
      },
    },
    square: {
      sizing: {
        scale: 0.92,
        titleSize: 138,
        subtitleSize: 48,
        bodySize: 38,
        iconSize: 76,
        strokeWidth: 5,
        radius: 20,
        shadowOffset: 10,
      },
    },
  },
});

export const titleAndHistoryTemplates: TemplateDefinition[] = [
  base('vt-title-bold-frame','Bold Framed Title','text',['title','hero','frame','bold'],[
    svgEl('frame','<rect x="8" y="8" width="98%" height="94%" rx="32" fill="none" stroke="currentColor" stroke-width="12"/>',90,80,1740,920),
    textEl('title','THE STORY STARTS HERE',170,320,1580,220,'title'),
    textEl('subtitle','A concise supporting line goes here.',176,575,1300,90,'subtitle'),
  ]),
  base('vt-title-split','Split Screen Title','text',['title','split','chapter'],[
    svgEl('split','<rect width="50%" height="100%" fill="currentColor" opacity=".12"/><line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" stroke-width="10"/>',0,0,W,H),
    textEl('label','CHAPTER 01',120,150,700,70,'label'),
    textEl('title','A TURNING POINT',120,300,760,300,'title'),
    textEl('body','Set up the next section with one clear sentence.',1040,370,690,180,'body'),
  ]),
  base('vt-title-outline','Outline Stack','text',['title','outline','stacked'],[
    textEl('title','THE',160,190,1000,160,'title'),
    textEl('title2','BIG',160,360,1000,160,'title'),
    textEl('title3','IDEA',160,530,1250,190,'title'),
    svgEl('rule','<rect width="100%" height="100%" rx="8" fill="currentColor"/>',165,760,980,18),
  ]),
  base('vt-title-numbered','Numbered Section','text',['chapter','number','section'],[
    textEl('number','03',120,140,380,300,'title'),
    svgEl('rule','<rect width="100%" height="100%" fill="currentColor"/>',520,170,12,690),
    textEl('title','THE DECISION',610,280,1100,180,'title'),
    textEl('body','Use numbered sections to make a long-form video easier to follow.',615,500,980,160,'body'),
  ]),
  base('vt-lower-third-name','Name + Role Lower Third','graphic',['lower-third','name','role'],[
    svgEl('plate','<rect width="100%" height="100%" rx="24" fill="currentColor" opacity=".12"/><rect x="0" y="0" width="22" height="100%" fill="currentColor"/>',90,780,920,190),
    textEl('name','NAPOLEON BONAPARTE',140,815,760,70,'subtitle'),
    textEl('role','EMPEROR OF THE FRENCH · 1804–1815',140,890,760,55,'label'),
  ],120),
  base('vt-lower-third-location','Location Lower Third','graphic',['lower-third','location','map'],[
    svgEl('pin','<circle cx="60" cy="60" r="46" fill="currentColor"/><circle cx="60" cy="60" r="18" fill="white"/>',100,790,120,120),
    textEl('place','AUSTERLITZ',245,800,620,70,'subtitle'),
    textEl('meta','MORAVIA · 2 DECEMBER 1805',245,875,620,52,'label'),
  ],120),
  base('vt-lower-third-source','Source Citation Lower Third','graphic',['lower-third','source','citation'],[
    svgEl('quote','<path d="M0 0H90V90H0ZM120 0H210V90H120Z" fill="currentColor"/>',95,805,210,90),
    textEl('source','SOURCE · EYEWITNESS ACCOUNT',345,800,1050,65,'subtitle'),
    textEl('meta','MEMOIRS PUBLISHED 1823',345,870,900,50,'label'),
  ],120),
  base('vt-history-quote','Eyewitness Quote Card','scene',['history','quote','eyewitness','citation'],[
    svgEl('mark','<path d="M0 0H150V150H0ZM190 0H340V150H190Z" fill="currentColor" opacity=".16"/>',130,140,340,150),
    textEl('quote','“WE SAW THE SUN BREAK THROUGH THE FOG.”',160,330,1500,290,'title'),
    textEl('source','— EYEWITNESS ACCOUNT · 1805',165,690,1150,70,'label'),
  ],180),
  base('vt-history-date','Date + Place Scene','scene',['history','date','location'],[
    textEl('date','2 DECEMBER 1805',120,205,1300,170,'title'),
    textEl('place','AUSTERLITZ · MORAVIA',125,405,1000,80,'subtitle'),
    svgEl('line','<rect width="100%" height="100%" fill="currentColor"/>',125,530,1080,16),
    textEl('body','A date card designed to bridge sections without stopping the visual rhythm.',125,610,1180,150,'body'),
  ]),
  base('vt-history-profile','Historical Figure Profile','scene',['history','person','profile'],[
    svgEl('portrait','<rect x="8" y="8" width="94%" height="94%" rx="32" fill="currentColor" opacity=".12" stroke="currentColor" stroke-width="12"/><circle cx="50%" cy="42%" r="18%" fill="currentColor" opacity=".28"/><path d="M20% 86%Q50% 58% 80% 86%" fill="currentColor" opacity=".28"/>',110,150,620,760),
    textEl('name','MARSHAL DAVOUT',820,250,900,170,'title'),
    textEl('role','III CORPS · GRANDE ARMÉE',825,455,760,70,'subtitle'),
    textEl('body','Add a short identifying description, role, or relevance to the story.',825,570,760,170,'body'),
  ],210),
  base('vt-history-stat','Historical Statistic','scene',['history','stat','number'],[
    textEl('stat','73,000',150,205,1350,250,'title'),
    textEl('label','FRENCH TROOPS AT AUSTERLITZ',160,505,1100,80,'subtitle'),
    svgEl('bars','<rect y="0" width="100%" height="22" fill="currentColor"/><rect y="60" width="76%" height="22" fill="currentColor" opacity=".7"/><rect y="120" width="52%" height="22" fill="currentColor" opacity=".4"/>',160,690,1160,142),
  ],160),
  base('vt-history-timeline','Timeline Marker','scene',['history','timeline','date'],[
    svgEl('line','<rect x="0" y="46" width="100%" height="12" fill="currentColor"/><circle cx="20%" cy="52" r="34" fill="currentColor"/><circle cx="50%" cy="52" r="34" fill="currentColor"/><circle cx="80%" cy="52" r="34" fill="currentColor"/>',130,500,1660,110),
    textEl('date1','1799',235,365,240,80,'subtitle'),
    textEl('date2','1804',735,365,240,80,'subtitle'),
    textEl('date3','1805',1235,365,240,80,'subtitle'),
    textEl('label','FROM COUP TO EMPIRE TO AUSTERLITZ',245,675,1260,90,'label'),
  ],180),
  base('vt-map-callout','Map Callout','graphic',['map','callout','location','history'],[
    svgEl('path','<path d="M70 470C310 150 580 600 880 280S1320 170 1600 390" fill="none" stroke="currentColor" stroke-width="14" stroke-dasharray="28 18"/><circle cx="70" cy="470" r="30" fill="currentColor"/><circle cx="1600" cy="390" r="30" fill="currentColor"/>',120,200,1660,620),
    textEl('from','VIENNA',145,760,350,60,'label'),
    textEl('to','AUSTERLITZ',1410,700,350,60,'label'),
  ],160),
  base('vt-callout-arrow','Arrow Callout','graphic',['arrow','callout','highlight'],[
    svgEl('arrow','<path d="M0 80H650V0L900 150 650 300V220H0Z" fill="currentColor"/>',120,340,900,300),
    textEl('label','LOOK HERE',1080,420,570,120,'title'),
  ],100),
];

export const backgroundTemplates: TemplateDefinition[] = [
  base('vt-bg-moving-grid','Moving Grid','background',['background','grid','animated'],[
    svgEl('grid','<defs><pattern id="g" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M90 0H0V90" fill="none" stroke="currentColor" stroke-width="4" opacity=".18"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/>',0,0,W,H),
  ],240),
  base('vt-bg-radial-rings','Radial Rings','background',['background','rings','animated'],[
    svgEl('rings','<g fill="none" stroke="currentColor" opacity=".3" stroke-width="12"><circle cx="960" cy="540" r="130"/><circle cx="960" cy="540" r="260"/><circle cx="960" cy="540" r="390"/><circle cx="960" cy="540" r="520"/></g>',0,0,W,H),
  ],240),
  base('vt-bg-diagonal-bands','Diagonal Bands','background',['background','stripes','motion'],[
    svgEl('bands','<g transform="rotate(-18 960 540)"><rect x="-400" y="0" width="500" height="1400" fill="currentColor" opacity=".18"/><rect x="300" y="0" width="500" height="1400" fill="currentColor" opacity=".10"/><rect x="1000" y="0" width="500" height="1400" fill="currentColor" opacity=".18"/><rect x="1700" y="0" width="500" height="1400" fill="currentColor" opacity=".10"/></g>',0,0,W,H),
  ],240),
  base('vt-bg-dot-field','Dot Field','background',['background','dots','data'],[
    svgEl('dots','<defs><pattern id="d" width="72" height="72" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="7" fill="currentColor" opacity=".24"/></pattern></defs><rect width="100%" height="100%" fill="url(#d)"/>',0,0,W,H),
  ],240),
  base('vt-bg-cross-field','Cross Field','background',['background','crosses','pattern'],[
    svgEl('crosses','<defs><pattern id="c" width="110" height="110" patternUnits="userSpaceOnUse"><path d="M55 25V85M25 55H85" stroke="currentColor" stroke-width="8" opacity=".17"/></pattern></defs><rect width="100%" height="100%" fill="url(#c)"/>',0,0,W,H),
  ],240),
  base('vt-bg-radial-rays','Radial Rays','background',['background','rays','burst'],[
    svgEl('rays','<g transform="translate(960 540)" stroke="currentColor" stroke-width="34" opacity=".18"><path d="M0 0V-900"/><path d="M0 0L636-636"/><path d="M0 0H900"/><path d="M0 0L636 636"/><path d="M0 0V900"/><path d="M0 0L-636 636"/><path d="M0 0H-900"/><path d="M0 0L-636-636"/></g>',0,0,W,H),
  ],240),
  base('vt-bg-soft-frames','Soft Frames','background',['background','frames','editorial'],[
    svgEl('frames','<rect x="90" y="90" width="1740" height="900" rx="56" fill="none" stroke="currentColor" stroke-width="18" opacity=".24"/><rect x="190" y="190" width="1540" height="700" rx="40" fill="none" stroke="currentColor" stroke-width="10" opacity=".12"/>',0,0,W,H),
  ],240),
  base('vt-bg-four-panels','Four Panels','background',['background','panels','palette'],[
    svgEl('panels','<rect width="25%" height="100%" fill="currentColor" opacity=".24"/><rect x="25%" width="25%" height="100%" fill="currentColor" opacity=".12"/><rect x="50%" width="25%" height="100%" fill="currentColor" opacity=".24"/><rect x="75%" width="25%" height="100%" fill="currentColor" opacity=".12"/>',0,0,W,H),
  ],240),
];

export const editorPackTemplates: TemplateDefinition[] = [
  ...titleAndHistoryTemplates,
  ...backgroundTemplates,
];
