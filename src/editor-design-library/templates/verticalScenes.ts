import type {TemplateDefinition} from '../core/schema';

const V=(id:string,name:string,tags:string[],elements:TemplateDefinition['elements']):TemplateDefinition=>({
  id,name,category:'scene',tags:[...tags,'vertical','9:16','shorts'],aspectRatio:'9:16',width:1080,height:1920,durationFrames:150,elements,customizable:true,responsive:false,
  entrance:{preset:'spring',durationFrames:20,intensity:0.85}
});

export const verticalSceneTemplates:TemplateDefinition[]=[
  V('vertical-hook','Vertical Hook',['hook','title'],[
    {id:'kicker',type:'text',name:'Kicker',x:90,y:210,width:900,height:120,text:'WAIT UNTIL YOU SEE THIS',fillToken:'colors.accent',fontFamilyToken:'typography.labelFamily',fontSize:50,fontWeight:900,animation:{preset:'slide',durationFrames:14,direction:'up'},editable:true},
    {id:'title',type:'text',name:'Title',x:90,y:360,width:900,height:760,text:'THE MOMENT EVERYTHING CHANGED',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:132,fontWeight:999,animation:{preset:'stagger-words',delayFrames:8,durationFrames:28},editable:true}
  ]),
  V('vertical-chapter','Vertical Chapter',['chapter','section'],[
    {id:'num',type:'text',name:'Number',x:90,y:180,width:900,height:240,text:'03',fillToken:'colors.primary',fontFamilyToken:'typography.displayFamily',fontSize:210,fontWeight:999,animation:{preset:'scale',durationFrames:16},editable:true},
    {id:'title',type:'text',name:'Title',x:90,y:520,width:900,height:600,text:'THE DECISION',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:150,fontWeight:999,animation:{preset:'slide',delayFrames:8,durationFrames:18,direction:'up'},editable:true}
  ]),
  V('vertical-quote','Vertical Quote',['quote','history'],[
    {id:'quote',type:'text',name:'Quote',x:110,y:300,width:860,height:900,text:'“WE SAW THE SUN BREAK THROUGH THE FOG.”',fillToken:'colors.foreground',fontFamilyToken:'typography.headingFamily',fontSize:96,fontWeight:900,animation:{preset:'stagger-words',durationFrames:30},editable:true},
    {id:'source',type:'text',name:'Source',x:110,y:1320,width:860,height:160,text:'EYEWITNESS ACCOUNT · 1805',fillToken:'colors.accent',fontFamilyToken:'typography.labelFamily',fontSize:44,fontWeight:900,animation:{preset:'fade',delayFrames:18,durationFrames:16},editable:true}
  ]),
  V('vertical-stat','Vertical Statistic',['stat','data'],[
    {id:'num',type:'text',name:'Stat',x:80,y:380,width:920,height:460,text:'87%',fillToken:'colors.primary',fontFamilyToken:'typography.displayFamily',fontSize:300,fontWeight:999,animation:{preset:'pop',durationFrames:18},editable:true},
    {id:'label',type:'text',name:'Label',x:120,y:940,width:840,height:240,text:'VIEWERS STAYED TO WATCH',fillToken:'colors.foreground',fontFamilyToken:'typography.headingFamily',fontSize:72,fontWeight:900,animation:{preset:'slide',delayFrames:12,durationFrames:18,direction:'up'},editable:true}
  ]),
  V('vertical-person-profile','Vertical Person Profile',['profile','person','history'],[
    {id:'name',type:'text',name:'Name',x:90,y:980,width:900,height:320,text:'NAPOLEON BONAPARTE',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:112,fontWeight:999,animation:{preset:'stagger-words',durationFrames:24},editable:true},
    {id:'role',type:'text',name:'Role',x:90,y:1320,width:900,height:180,text:'EMPEROR OF THE FRENCH',fillToken:'colors.accent',fontFamilyToken:'typography.labelFamily',fontSize:50,fontWeight:900,animation:{preset:'fade',delayFrames:12,durationFrames:16},editable:true}
  ]),
  V('vertical-map-route','Vertical Map Route',['map','route','history'],[
    {id:'route',type:'svg',name:'Route',x:130,y:280,width:820,height:1120,strokeToken:'colors.primary',strokeWidthToken:'sizing.strokeWidth',svg:'<path d="M100 980 C260 760 180 520 420 430 S660 300 730 100" fill="none" stroke="currentColor" stroke-linecap="round"/>',animation:{preset:'line-draw',durationFrames:42},editable:true},
    {id:'label',type:'text',name:'Label',x:120,y:1460,width:840,height:190,text:'VIENNA → AUSTERLITZ',fillToken:'colors.foreground',fontFamilyToken:'typography.headingFamily',fontSize:64,fontWeight:900,animation:{preset:'fade',delayFrames:30,durationFrames:14},editable:true}
  ]),
  V('vertical-list','Vertical List',['list','steps'],[
    {id:'title',type:'text',name:'Title',x:90,y:160,width:900,height:220,text:'THREE REASONS WHY',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:106,fontWeight:999,animation:{preset:'slide',durationFrames:16,direction:'up'},editable:true},
    {id:'list',type:'text',name:'List',x:120,y:520,width:840,height:920,text:'01 · SPEED\n02 · TERRAIN\n03 · TIMING',fillToken:'colors.foreground',fontFamilyToken:'typography.headingFamily',fontSize:82,fontWeight:900,animation:{preset:'stagger-words',delayFrames:10,durationFrames:34},editable:true}
  ]),
  V('vertical-comment-cta','Vertical Comment CTA',['engagement','comment','cta'],[
    {id:'title',type:'text',name:'Title',x:90,y:380,width:900,height:520,text:'WHAT WOULD YOU HAVE DONE?',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:126,fontWeight:999,animation:{preset:'spring',durationFrames:20},editable:true},
    {id:'sub',type:'text',name:'Subtitle',x:120,y:980,width:840,height:220,text:'LEAVE YOUR ANSWER IN THE COMMENTS',fillToken:'colors.accent',fontFamilyToken:'typography.headingFamily',fontSize:58,fontWeight:900,animation:{preset:'fade',delayFrames:12,durationFrames:18},editable:true}
  ]),
  V('vertical-like-subscribe','Vertical Like + Subscribe',['engagement','like','subscribe','cta'],[
    {id:'title',type:'text',name:'Title',x:80,y:420,width:920,height:420,text:'LIKE + SUBSCRIBE',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:140,fontWeight:999,animation:{preset:'pop',durationFrames:18},editable:true},
    {id:'sub',type:'text',name:'Subtitle',x:120,y:970,width:840,height:220,text:'MORE STORIES EVERY WEEK',fillToken:'colors.primary',fontFamilyToken:'typography.headingFamily',fontSize:60,fontWeight:900,animation:{preset:'slide',delayFrames:12,durationFrames:18,direction:'up'},editable:true}
  ]),
  V('vertical-source-card','Vertical Source Card',['source','citation','history'],[
    {id:'label',type:'text',name:'Label',x:90,y:320,width:900,height:120,text:'PRIMARY SOURCE',fillToken:'colors.accent',fontFamilyToken:'typography.labelFamily',fontSize:48,fontWeight:900,animation:{preset:'fade',durationFrames:14},editable:true},
    {id:'title',type:'text',name:'Source',x:90,y:520,width:900,height:620,text:'MEMOIRS OF GENERAL MARBOT',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:116,fontWeight:999,animation:{preset:'stagger-words',delayFrames:6,durationFrames:28},editable:true},
    {id:'meta',type:'text',name:'Meta',x:90,y:1270,width:900,height:180,text:'PUBLISHED 1891',fillToken:'colors.primary',fontFamilyToken:'typography.headingFamily',fontSize:54,fontWeight:900,animation:{preset:'fade',delayFrames:20,durationFrames:14},editable:true}
  ]),
  V('vertical-timeline-date','Vertical Timeline Date',['timeline','date','history'],[
    {id:'date',type:'text',name:'Date',x:90,y:450,width:900,height:360,text:'2 DECEMBER\n1805',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:138,fontWeight:999,animation:{preset:'stagger-words',durationFrames:24},editable:true},
    {id:'place',type:'text',name:'Place',x:90,y:970,width:900,height:180,text:'AUSTERLITZ · MORAVIA',fillToken:'colors.accent',fontFamilyToken:'typography.headingFamily',fontSize:60,fontWeight:900,animation:{preset:'slide',delayFrames:12,durationFrames:16,direction:'up'},editable:true}
  ]),
  V('vertical-watch-next','Vertical Watch Next',['engagement','watch-next','cta'],[
    {id:'title',type:'text',name:'Title',x:90,y:260,width:900,height:300,text:'WATCH NEXT',fillToken:'colors.foreground',fontFamilyToken:'typography.displayFamily',fontSize:140,fontWeight:999,animation:{preset:'spring',durationFrames:18},editable:true},
    {id:'sub',type:'text',name:'Subtitle',x:120,y:650,width:840,height:220,text:'CONTINUE THE STORY',fillToken:'colors.primary',fontFamilyToken:'typography.headingFamily',fontSize:64,fontWeight:900,animation:{preset:'fade',delayFrames:10,durationFrames:16},editable:true}
  ])
];
