import type {TemplateDefinition} from '../core/schema';

const text = (id:string,name:string,text:string,y:number,sizeToken:'sizing.titleSize'|'sizing.subtitleSize'|'sizing.bodySize'='sizing.titleSize') => ({
  id,name,type:'text' as const,x:120,y,width:1680,height:220,text,editable:true,
  fillToken:'colors.foreground' as const,fontFamilyToken:'typography.displayFamily' as const,fontSizeToken:sizeToken,fontWeightToken:'typography.fontWeight' as const,
});

const base = (id:string,name:string,category:TemplateDefinition['category'],tags:string[],elements:TemplateDefinition['elements'],extra:Partial<TemplateDefinition>={}):TemplateDefinition => ({
  id,name,category,tags,aspectRatio:'responsive',width:1920,height:1080,responsive:true,customizable:true,elements,
  entrance:{preset:'spring',durationFrames:18,easing:'power3.out'},
  responsiveLayouts:{portrait:{spacing:{padding:90,gap:28,insetX:70,insetY:90}},square:{spacing:{padding:90,gap:24,insetX:90,insetY:90}}},
  ...extra,
});

export const expansionPackTemplates: TemplateDefinition[] = [
  base('vt-title-editorial-stack','Editorial Stack','text',['title','editorial','stack'],[
    text('k','Kicker','CHAPTER 04',170,'sizing.subtitleSize'),
    text('t','Title','THE MOMENT EVERYTHING CHANGED',300),
    text('s','Subtitle','A compact editorial chapter opener',720,'sizing.bodySize'),
  ]),
  base('vt-title-side-rule','Side Rule Title','text',['title','rule','minimal'],[
    {id:'rule',name:'Rule',type:'svg',x:120,y:150,width:24,height:760,fillToken:'colors.accent',editable:true,svg:'<rect width="24" height="760" rx="12"/>'},
    {...text('t','Title','A NEW PHASE BEGINS',250),x:210,width:1480},
    {...text('s','Subtitle','Use for chapters, arguments, or section changes.',560,'sizing.bodySize'),x:210,width:1300},
  ]),
  base('vt-title-badge-heading','Badge Heading','text',['title','badge','label'],[
    {id:'badge',name:'Badge',type:'svg',x:120,y:170,width:300,height:90,fillToken:'colors.secondary',strokeToken:'colors.border',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<rect width="300" height="90" rx="28"/>'},
    text('t','Title','THE DECISION',320),text('s','Subtitle','Context, consequence, outcome',650,'sizing.bodySize'),
  ]),
  base('vt-title-vertical-safe','Vertical Hero','text',['title','portrait','shorts','vertical'],[
    {...text('t','Title','WATCH THIS PART',250),x:110,width:820},
    {...text('s','Subtitle','Designed to remain safe in a 9:16 crop.',720,'sizing.bodySize'),x:110,width:780},
  ],{aspectRatio:'9:16',width:1080,height:1920}),
  base('vt-lower-third-minimal','Minimal Lower Third','text',['lower-third','minimal','name'],[
    {id:'line',name:'Accent line',type:'svg',x:110,y:790,width:22,height:140,fillToken:'colors.accent',editable:true,svg:'<rect width="22" height="140" rx="11"/>'},
    {...text('name','Name','ARTHUR WELLESLEY',800,'sizing.subtitleSize'),x:165,width:930,height:65},
    {...text('role','Role','DUKE OF WELLINGTON',865,'sizing.bodySize'),x:165,width:900,height:55},
  ]),
  base('vt-lower-third-pill','Pill Lower Third','text',['lower-third','pill','speaker'],[
    {id:'pill',name:'Pill',type:'svg',x:100,y:790,width:1150,height:150,fillToken:'colors.background',strokeToken:'colors.border',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<rect width="1150" height="150" rx="75"/>'},
    {...text('name','Name','MARSHAL DAVOUT',825,'sizing.subtitleSize'),x:170,width:760,height:55},
    {...text('role','Role','III CORPS · GRANDE ARMÉE',880,'sizing.bodySize'),x:170,width:760,height:44},
  ]),
  base('vt-lower-third-stat','Stat Lower Third','text',['lower-third','stat','data'],[
    {id:'plate',name:'Plate',type:'svg',x:95,y:760,width:900,height:200,fillToken:'colors.primary',strokeToken:'colors.border',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<rect width="900" height="200" rx="28"/>'},
    {...text('stat','Statistic','87%',790),x:145,width:330,height:100},
    {...text('label','Label','VIEWERS STAYED TO WATCH',885,'sizing.bodySize'),x:145,width:680,height:50},
  ]),
  base('vt-callout-arrow-label','Arrow Label Callout','graphic',['callout','arrow','label'],[
    {id:'arrow',name:'Arrow',type:'svg',x:270,y:300,width:900,height:260,fillToken:'colors.accent',strokeToken:'colors.border',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<path d="M20 130H700L610 40L760 130L610 220L700 130H20Z"/>'},
    {...text('label','Label','LOOK HERE',560,'sizing.subtitleSize'),x:330,width:700,height:80},
  ],{emphasis:{preset:'pop',durationFrames:14,intensity:1.1}}),
  base('vt-callout-circle-marker','Circle Marker','graphic',['callout','circle','marker'],[
    {id:'ring',name:'Ring',type:'svg',x:470,y:210,width:520,height:520,strokeToken:'colors.accent',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<circle cx="260" cy="260" r="225" fill="none"/>'},
    {...text('label','Label','KEY POSITION',730,'sizing.subtitleSize'),x:560,width:700,height:70},
  ],{emphasis:{preset:'scale',durationFrames:16,intensity:1.15}}),
  base('vt-callout-bracket-focus','Bracket Focus','graphic',['callout','bracket','focus'],[
    {id:'brackets',name:'Brackets',type:'svg',x:360,y:180,width:760,height:620,strokeToken:'colors.primary',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<path d="M150 0H0V150M610 0H760V150M0 470V620H150M760 470V620H610" fill="none"/>'},
    {...text('label','Label','FOCUS',820,'sizing.subtitleSize'),x:640,width:480,height:70},
  ]),

  base('vt-transition-grid-shutter','Grid Shutter','transition',['transition','grid','shutter'],[
    {id:'grid',name:'Grid Shutter',type:'svg',x:0,y:0,width:1920,height:1080,fillToken:'colors.primary',editable:true,svg:'<g><rect x="0" y="0" width="480" height="540"/><rect x="960" y="0" width="480" height="540"/><rect x="480" y="540" width="480" height="540"/><rect x="1440" y="540" width="480" height="540"/></g>',animation:{preset:'stagger',durationFrames:20}},
  ],{durationFrames:24,transition:{preset:'stagger',durationFrames:24}}),
  base('vt-transition-center-slice','Center Slice','transition',['transition','slice','center'],[
    {id:'slice',name:'Slice',type:'svg',x:0,y:0,width:1920,height:1080,fillToken:'colors.secondary',editable:true,svg:'<polygon points="850,0 1070,0 1420,1080 500,1080"/>',animation:{preset:'wipe',durationFrames:18,direction:'in'}},
  ],{durationFrames:22}),
  base('vt-transition-cross-bars','Cross Bars','transition',['transition','bars','cross'],[
    {id:'h',name:'Horizontal Bar',type:'svg',x:0,y:430,width:1920,height:220,fillToken:'colors.accent',editable:true,svg:'<rect width="1920" height="220"/>',animation:{preset:'slide',durationFrames:16,direction:'right'}},
    {id:'v',name:'Vertical Bar',type:'svg',x:850,y:0,width:220,height:1080,fillToken:'colors.primary',editable:true,svg:'<rect width="220" height="1080"/>',animation:{preset:'slide',durationFrames:16,direction:'down'}},
  ],{durationFrames:22}),
  base('vt-transition-corner-sweep','Corner Sweep','transition',['transition','corner','sweep'],[
    {id:'corner',name:'Corner Sweep',type:'svg',x:0,y:0,width:1920,height:1080,fillToken:'colors.primary',editable:true,svg:'<path d="M0 0H1920V160L160 1080H0Z"/>',animation:{preset:'wipe',durationFrames:20,direction:'right'}},
  ],{durationFrames:24}),
  base('vt-transition-double-chevron','Double Chevron','transition',['transition','chevron','directional'],[
    {id:'a',name:'Chevron A',type:'svg',x:-200,y:0,width:1200,height:1080,fillToken:'colors.primary',editable:true,svg:'<path d="M0 0H640L1080 540L640 1080H0L440 540Z"/>',animation:{preset:'slide',durationFrames:18,direction:'right'}},
    {id:'b',name:'Chevron B',type:'svg',x:500,y:0,width:1200,height:1080,fillToken:'colors.secondary',editable:true,svg:'<path d="M0 0H640L1080 540L640 1080H0L440 540Z"/>',animation:{preset:'slide',durationFrames:18,direction:'right'}},
  ],{durationFrames:24}),
  base('vt-transition-outline-box','Outline Box Reveal','transition',['transition','outline','box'],[
    {id:'box',name:'Outline Box',type:'svg',x:120,y:80,width:1680,height:920,strokeToken:'colors.foreground',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<rect x="20" y="20" width="1640" height="880" rx="60" fill="none"/>',animation:{preset:'line-draw',durationFrames:22}},
  ],{durationFrames:26}),

  base('vt-engage-subscribe-corner','Subscribe Corner Card','engagement',['subscribe','corner','cta'],[
    {id:'plate',name:'Card',type:'svg',x:1180,y:690,width:620,height:260,fillToken:'colors.primary',strokeToken:'colors.border',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<rect width="620" height="260" rx="34"/>'},
    {...text('h','Headline','SUBSCRIBE',740,'sizing.subtitleSize'),x:1240,width:430,height:70},
    {...text('s','Subtitle','FOR THE NEXT CHAPTER',835,'sizing.bodySize'),x:1240,width:430,height:55},
  ],{emphasis:{preset:'pop',durationFrames:16}}),
  base('vt-engage-comment-question','Comment Question','engagement',['comment','question','cta'],[
    text('h','Headline','WHAT WOULD YOU HAVE DONE?',300),text('s','Subtitle','LEAVE YOUR ANSWER IN THE COMMENTS',610,'sizing.subtitleSize'),
  ]),
  base('vt-engage-like-part-two','Like For Part Two','engagement',['like','part-two','cta'],[
    text('h','Headline','WANT PART TWO?',300),text('s','Subtitle','LIKE THIS VIDEO AND I’LL MAKE IT',610,'sizing.subtitleSize'),
  ]),
  base('vt-engage-combined-end','End Card: Like + Subscribe','engagement',['like','subscribe','end-card','cta'],[
    text('h','Headline','LIKE + SUBSCRIBE',280),text('s','Subtitle','MORE STORIES · MORE SOURCES · MORE HISTORY',590,'sizing.subtitleSize'),
    {id:'button',name:'Button',type:'svg',x:690,y:760,width:540,height:140,fillToken:'colors.accent',strokeToken:'colors.border',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<rect width="540" height="140" rx="70"/>'},
  ]),
  base('vt-engage-next-video','Watch Next','engagement',['watch-next','end-screen','cta'],[
    text('h','Headline','WATCH NEXT',220),text('s','Subtitle','CONTINUE THE STORY',500,'sizing.subtitleSize'),
    {id:'frame',name:'Video Frame',type:'svg',x:560,y:650,width:800,height:300,strokeToken:'colors.border',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<rect x="10" y="10" width="780" height="280" rx="30" fill="none"/>'},
  ]),
  base('vt-engage-vertical-subscribe','Vertical Subscribe','engagement',['subscribe','vertical','shorts','cta'],[
    {...text('h','Headline','SUBSCRIBE FOR MORE',430),x:90,width:900},
    {...text('s','Subtitle','NEW VIDEOS EVERY WEEK',860,'sizing.subtitleSize'),x:90,width:900},
    {id:'pill',name:'Subscribe Pill',type:'svg',x:190,y:1090,width:700,height:180,fillToken:'colors.accent',strokeToken:'colors.border',strokeWidthToken:'sizing.strokeWidth',editable:true,svg:'<rect width="700" height="180" rx="90"/>'},
  ],{aspectRatio:'9:16',width:1080,height:1920}),
];
