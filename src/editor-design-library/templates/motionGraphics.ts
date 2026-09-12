import type {TemplateDefinition} from '../core/schema';

const G = (id:string,name:string,tags:string[],elements:TemplateDefinition['elements'],entrance:TemplateDefinition['entrance']={preset:'spring',durationFrames:18,intensity:0.8}):TemplateDefinition=>({
  id,name,category:'graphic',tags,aspectRatio:'responsive',width:1920,height:1080,durationFrames:120,elements,responsive:true,customizable:true,entrance,
  responsiveLayouts:{portrait:{sizing:{scale:0.88,titleSize:82,subtitleSize:42,bodySize:34,iconSize:72,strokeWidth:8,radius:26,shadowOffset:12} as any,spacing:{padding:88,gap:28,insetX:72,insetY:88} as any},square:{sizing:{scale:0.94,titleSize:92,subtitleSize:44,bodySize:34,iconSize:76,strokeWidth:8,radius:24,shadowOffset:12} as any}}
});

export const motionGraphicsTemplates:TemplateDefinition[]=[
  G('motion-underline-draw','Animated Underline',['motion','underline','highlight','draw'],[
    {id:'line',type:'svg',name:'Underline',x:260,y:650,width:1400,height:120,strokeToken:'colors.accent',strokeWidthToken:'sizing.strokeWidth',svg:'<path d="M20 70 C360 20 1040 110 1380 55" fill="none" stroke="currentColor" stroke-linecap="round"/>',animation:{preset:'line-draw',durationFrames:28,easing:'power2.out'},editable:true}
  ],{preset:'line-draw',durationFrames:28}),
  G('motion-circle-draw','Hand Drawn Circle',['motion','circle','highlight','draw'],[
    {id:'circle',type:'svg',name:'Circle',x:560,y:180,width:800,height:700,strokeToken:'colors.accent',strokeWidthToken:'sizing.strokeWidth',svg:'<ellipse cx="400" cy="350" rx="340" ry="250" fill="none" stroke="currentColor" stroke-linecap="round"/>',animation:{preset:'line-draw',durationFrames:32},editable:true}
  ],{preset:'line-draw',durationFrames:32}),
  G('motion-pointer-arrow','Pointer Arrow',['motion','arrow','pointer','callout'],[
    {id:'arrow',type:'svg',name:'Arrow',x:280,y:280,width:900,height:500,strokeToken:'colors.foreground',strokeWidthToken:'sizing.strokeWidth',svg:'<path d="M40 240 C260 80 560 120 760 260 M690 170 L780 270 L650 300" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',animation:{preset:'line-draw',durationFrames:24},editable:true},
    {id:'label',type:'text',name:'Label',x:1120,y:300,width:560,height:220,text:'LOOK HERE',fillToken:'colors.foreground',fontFamilyToken:'typography.headingFamily',fontSizeToken:'sizing.subtitleSize',fontWeightToken:'typography.fontWeight',animation:{preset:'pop',delayFrames:16,durationFrames:14},editable:true}
  ]),
  G('motion-highlight-swipe','Marker Highlight Swipe',['motion','highlight','marker','swipe'],[
    {id:'bar',type:'svg',name:'Highlight',x:280,y:430,width:1360,height:220,fillToken:'colors.secondary',svg:'<path d="M20 80 Q300 30 660 70 T1340 75 L1320 170 Q800 125 30 175 Z" fill="currentColor"/>',animation:{preset:'wipe',durationFrames:20,direction:'right'},editable:true},
    {id:'text',type:'text',name:'Text',x:380,y:420,width:1160,height:220,text:'IMPORTANT DETAIL',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSizeToken:'sizing.titleSize',fontWeightToken:'typography.fontWeight',animation:{preset:'stagger-words',delayFrames:10,durationFrames:24},editable:true}
  ]),
  G('motion-counter','Animated Counter',['motion','counter','number','stat'],[
    {id:'num',type:'text',name:'Counter',x:320,y:260,width:1280,height:420,text:'73,000',fillToken:'colors.primary',fontFamilyToken:'typography.displayFamily',fontSize:240,fontWeight:999,animation:{preset:'scale',durationFrames:18,intensity:0.9},editable:true},
    {id:'label',type:'text',name:'Label',x:420,y:710,width:1080,height:120,text:'TOTAL TROOPS',fillToken:'colors.foreground',fontFamilyToken:'typography.labelFamily',fontSizeToken:'sizing.bodySize',fontWeightToken:'typography.fontWeight',animation:{preset:'fade',delayFrames:10,durationFrames:16},editable:true}
  ]),
  G('motion-progress-bar','Animated Progress Bar',['motion','progress','bar','data'],[
    {id:'track',type:'svg',name:'Track',x:280,y:480,width:1360,height:140,svg:'<rect x="0" y="30" width="1360" height="70" rx="35" fill="#ffffff" stroke="currentColor"/>',strokeToken:'colors.foreground',editable:true},
    {id:'fill',type:'svg',name:'Fill',x:280,y:480,width:1040,height:140,fillToken:'colors.primary',svg:'<rect x="0" y="30" width="1040" height="70" rx="35" fill="currentColor"/>',animation:{preset:'wipe',durationFrames:30,direction:'right'},editable:true}
  ]),
  G('motion-word-reveal','Word Reveal',['motion','text','words','reveal'],[
    {id:'text',type:'text',name:'Text',x:260,y:300,width:1400,height:440,text:'THREE WORD REVEAL',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSizeToken:'sizing.titleSize',fontWeightToken:'typography.fontWeight',animation:{preset:'stagger-words',durationFrames:34},editable:true}
  ],{preset:'stagger-words',durationFrames:34}),
  G('motion-letter-reveal','Letter Reveal',['motion','text','letters','reveal'],[
    {id:'text',type:'text',name:'Text',x:220,y:300,width:1480,height:440,text:'AUSTERLITZ',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:190,fontWeight:999,animation:{preset:'stagger-letters',durationFrames:40},editable:true}
  ],{preset:'stagger-letters',durationFrames:40}),
  G('motion-timeline-marker','Timeline Marker',['motion','timeline','date','marker'],[
    {id:'line',type:'svg',name:'Line',x:230,y:500,width:1460,height:120,strokeToken:'colors.foreground',strokeWidthToken:'sizing.strokeWidth',svg:'<path d="M0 60 H1460" fill="none" stroke="currentColor"/>',animation:{preset:'line-draw',durationFrames:24},editable:true},
    {id:'dot',type:'svg',name:'Dot',x:850,y:445,width:110,height:110,fillToken:'colors.accent',svg:'<circle cx="55" cy="55" r="42" fill="currentColor"/>',animation:{preset:'pop',delayFrames:18,durationFrames:14},editable:true},
    {id:'date',type:'text',name:'Date',x:650,y:270,width:600,height:140,text:'2 DEC 1805',fillToken:'colors.foreground',fontFamilyToken:'typography.headingFamily',fontSizeToken:'sizing.subtitleSize',fontWeightToken:'typography.fontWeight',animation:{preset:'slide',delayFrames:20,durationFrames:16,direction:'up'},editable:true}
  ]),
  G('motion-map-route','Map Route Draw',['motion','map','route','history'],[
    {id:'route',type:'svg',name:'Route',x:220,y:180,width:1480,height:760,strokeToken:'colors.primary',strokeWidthToken:'sizing.strokeWidth',svg:'<path d="M120 580 C360 400 470 220 720 290 S1080 620 1370 180" fill="none" stroke="currentColor" stroke-linecap="round"/>',animation:{preset:'line-draw',durationFrames:42},editable:true},
    {id:'start',type:'svg',name:'Start',x:270,y:690,width:80,height:80,fillToken:'colors.secondary',svg:'<circle cx="40" cy="40" r="34" fill="currentColor"/>',animation:{preset:'pop',durationFrames:12},editable:true},
    {id:'end',type:'svg',name:'End',x:1510,y:250,width:90,height:90,fillToken:'colors.accent',svg:'<circle cx="45" cy="45" r="38" fill="currentColor"/>',animation:{preset:'pop',delayFrames:36,durationFrames:12},editable:true}
  ],{preset:'line-draw',durationFrames:42}),
  G('motion-focus-brackets','Animated Focus Brackets',['motion','focus','brackets','highlight'],[
    {id:'brackets',type:'svg',name:'Brackets',x:500,y:210,width:920,height:660,strokeToken:'colors.primary',strokeWidthToken:'sizing.strokeWidth',svg:'<path d="M120 220 V70 H270 M650 70 H800 V220 M800 440 V590 H650 M270 590 H120 V440" fill="none" stroke="currentColor" stroke-linecap="square"/>',animation:{preset:'mask-reveal',durationFrames:24},editable:true}
  ]),
  G('motion-pulse-ring','Pulse Ring',['motion','ring','pulse','emphasis'],[
    {id:'ring',type:'svg',name:'Ring',x:610,y:210,width:700,height:700,strokeToken:'colors.accent',strokeWidthToken:'sizing.strokeWidth',svg:'<circle cx="350" cy="350" r="250" fill="none" stroke="currentColor"/>',animation:{preset:'scale',durationFrames:22,intensity:1.15},editable:true}
  ])
];
