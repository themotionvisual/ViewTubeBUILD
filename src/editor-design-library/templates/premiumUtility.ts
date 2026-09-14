import type {TemplateDefinition, TemplateElement} from '../core/schema';

const clipBehavior = {
  transparentBackground: true,
  movable: true,
  resizable: true,
  rotatable: true,
  duplicable: true,
  trimmable: true,
  layerable: true,
  preserveAspectRatio: true,
  defaultScale: 1,
  safeZoneBehavior: 'free' as const,
  snapToSafeZones: true,
};

const textEl = (id:string,name:string,x:number,y:number,w:number,h:number,text:string,size:number,role:'headline'|'supporting',token:'colors.foreground'|'colors.accent'='colors.foreground'):TemplateElement => ({
  id,type:'text',name,x,y,width:w,height:h,text,fontSize:size,fontFamilyToken:role==='headline'?'typography.headingFamily':'typography.bodyFamily',fontWeight:role==='headline'?999:900,fillToken:token,tokenRole:token==='colors.accent'?'accent':'foreground',motionRole:role,editable:true,
  animation:{preset:role==='headline'?'stagger-words':'fade',durationFrames:role==='headline'?18:14,easing:role==='headline'?'power3.out':'power2.out'}
});

const iconSvg = (kind:string):string => {
  const common='fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"';
  switch(kind){
    case 'heart': return `<svg viewBox="0 0 100 100"><path ${common} d="M50 82 17 50C4 37 12 15 31 15c10 0 16 6 19 12 3-6 9-12 19-12 19 0 27 22 14 35Z"/></svg>`;
    case 'comment': return `<svg viewBox="0 0 100 100"><path ${common} d="M16 18h68v50H47L28 83V68H16Z"/></svg>`;
    case 'plus': return `<svg viewBox="0 0 100 100"><path ${common} d="M50 18v64M18 50h64"/></svg>`;
    case 'share': return `<svg viewBox="0 0 100 100"><path ${common} d="M35 68 72 31M48 28h28v28M20 45v35h35"/></svg>`;
    case 'save': return `<svg viewBox="0 0 100 100"><path ${common} d="M24 14h52v72L50 69 24 86Z"/></svg>`;
    case 'bell': return `<svg viewBox="0 0 100 100"><path ${common} d="M24 67h52l-8-11V39c0-12-8-22-18-22S32 27 32 39v17ZM42 78h16"/></svg>`;
    case 'question': return `<svg viewBox="0 0 100 100"><circle ${common} cx="50" cy="50" r="34"/><path ${common} d="M39 38c2-9 20-10 22 0 2 8-11 10-11 20M50 72h.1"/></svg>`;
    case 'arrow': return `<svg viewBox="0 0 100 100"><path ${common} d="M18 50h60M58 29l21 21-21 21"/></svg>`;
    case 'pin': return `<svg viewBox="0 0 100 100"><path ${common} d="M32 18h36l-6 20 10 10v8H28v-8l10-10ZM50 56v28"/></svg>`;
    default: return `<svg viewBox="0 0 100 100"><circle ${common} cx="50" cy="50" r="31"/></svg>`;
  }
};

function lower(id:string,name:string,primary:string,secondary:string,variant:number,tags:string[]):TemplateDefinition {
  const w=920,h=220;
  const elements:TemplateElement[]=[];
  if(variant===0) elements.push({id:'accent-bar',type:'svg',name:'Accent Bar',x:0,y:0,width:18,height:220,svg:'<svg viewBox="0 0 18 220"><rect width="18" height="220" rx="9" fill="currentColor"/></svg>',fillToken:'colors.accent',tokenRole:'accent',motionRole:'accent',editable:true,animation:{preset:'line-draw',durationFrames:15}});
  if(variant===1) elements.push({id:'rule',type:'svg',name:'Rule',x:0,y:184,width:640,height:10,svg:'<svg viewBox="0 0 640 10"><rect width="640" height="10" rx="5" fill="currentColor"/></svg>',fillToken:'colors.accent',tokenRole:'accent',motionRole:'underline',editable:true,animation:{preset:'line-draw',durationFrames:15}});
  if(variant===2) elements.push({id:'badge',type:'svg',name:'Badge',x:0,y:10,width:86,height:86,svg:'<svg viewBox="0 0 86 86"><rect x="3" y="3" width="80" height="80" rx="18" fill="currentColor"/></svg>',fillToken:'colors.accent',tokenRole:'accent',motionRole:'plate',editable:true,animation:{preset:'scale',durationFrames:12}});
  if(variant===3) elements.push({id:'plate',type:'svg',name:'Soft Plate',x:0,y:0,width:920,height:220,svg:'<svg viewBox="0 0 920 220"><rect x="2" y="2" width="916" height="216" rx="34" fill="currentColor" fill-opacity=".92" stroke="currentColor" stroke-width="4"/></svg>',fillToken:'colors.background',strokeToken:'colors.border',tokenRole:'background',motionRole:'plate',editable:true,animation:{preset:'scale',durationFrames:12}});
  if(variant===4) elements.push({id:'bracket',type:'svg',name:'Bracket',x:0,y:12,width:56,height:180,svg:'<svg viewBox="0 0 56 180"><path d="M48 8H10v164h38" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>',strokeToken:'colors.accent',tokenRole:'accent',motionRole:'accent',editable:true,animation:{preset:'line-draw',durationFrames:16}});
  const offset = variant===2?110:variant===0?48:variant===4?78:24;
  elements.push(textEl('primary','Primary',offset,38,w-offset-30,78,primary,68,'headline'));
  elements.push(textEl('secondary','Secondary',offset,124,w-offset-30,46,secondary,36,'supporting','colors.accent'));
  return {id,name,category:'graphic',tags:['youtube','premium','lower-third','transparent-svg',...tags],aspectRatio:'responsive',width:w,height:h,intrinsicBounds:{width:w,height:h,viewBox:`0 0 ${w} ${h}`},defaultTransform:{x:.06,y:.72,scale:1,rotation:0,anchorX:0,anchorY:1},safeZoneBehavior:'free',durationFrames:120,customizable:true,responsive:true,renderMode:'svg-overlay',transparent:true,clipBehavior,elements,entrance:{preset:'slide',durationFrames:18,direction:'left',portion:.18},exit:{preset:'fade',durationFrames:12,portion:.12}};
}

function cta(id:string,name:string,headline:string,sub:string,icon:string,variant:number,tags:string[]):TemplateDefinition {
  const w=980,h=210;
  const elements:TemplateElement[]=[];
  if(variant===0) elements.push({id:'plate',type:'svg',name:'Plate',x:0,y:0,width:w,height:h,svg:`<svg viewBox="0 0 ${w} ${h}"><rect x="2" y="2" width="976" height="206" rx="105" fill="currentColor" fill-opacity=".94" stroke="currentColor" stroke-width="4"/></svg>`,fillToken:'colors.background',strokeToken:'colors.border',tokenRole:'background',motionRole:'plate',editable:true,animation:{preset:'scale',durationFrames:12}});
  if(variant===1) elements.push({id:'plate',type:'svg',name:'Open Plate',x:0,y:0,width:w,height:h,svg:`<svg viewBox="0 0 ${w} ${h}"><path d="M24 28h820M24 182h820" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>`,strokeToken:'colors.border',tokenRole:'border',motionRole:'plate',editable:true,animation:{preset:'line-draw',durationFrames:16}});
  if(variant===2) elements.push({id:'plate',type:'svg',name:'Accent Capsule',x:0,y:0,width:w,height:h,svg:`<svg viewBox="0 0 ${w} ${h}"><rect x="2" y="2" width="976" height="206" rx="34" fill="currentColor"/></svg>`,fillToken:'colors.primary',tokenRole:'primary',motionRole:'plate',editable:true,animation:{preset:'mask-reveal',durationFrames:14}});
  elements.push({id:'icon',type:'svg',name:'Icon',x:34,y:48,width:112,height:112,svg:iconSvg(icon),strokeToken:'colors.accent',tokenRole:'accent',motionRole:'icon',editable:true,animation:{preset:'spring',durationFrames:16}});
  elements.push(textEl('headline','Headline',176,42,760,76,headline,66,'headline',variant===2?'colors.background':'colors.foreground'));
  elements.push(textEl('sub','Supporting Copy',178,124,760,46,sub,34,'supporting',variant===2?'colors.background':'colors.accent'));
  return {id,name,category:'engagement',tags:['youtube','premium','engagement','transparent-svg',...tags],aspectRatio:'responsive',width:w,height:h,intrinsicBounds:{width:w,height:h,viewBox:`0 0 ${w} ${h}`},defaultTransform:{x:.06,y:.74,scale:1,rotation:0,anchorX:0,anchorY:1},safeZoneBehavior:'free',durationFrames:90,customizable:true,responsive:true,renderMode:'svg-overlay',transparent:true,clipBehavior,elements,entrance:{preset:'pop',durationFrames:16,portion:.2},emphasis:{preset:'scale',durationFrames:12,intensity:.08},exit:{preset:'fade',durationFrames:10,portion:.12}};
}

export const premiumLowerThirdTemplates:TemplateDefinition[]=[
  lower('premium-lt-name','Premium Name','CREATOR NAME','ROLE / CHANNEL',0,['name','creator']),
  lower('premium-lt-guest','Premium Guest','GUEST NAME','FOUNDER · COMPANY',1,['guest','role']),
  lower('premium-lt-handle','Premium Handle','@CREATORHANDLE','FOLLOW FOR MORE',2,['handle','social']),
  lower('premium-lt-location','Premium Location','BROOKLYN, NEW YORK','LOCATION',3,['location']),
  lower('premium-lt-date','Premium Date','11 SEPTEMBER 2026','DATE',4,['date']),
  lower('premium-lt-date-location','Premium Date + Place','2 DECEMBER 1805','AUSTERLITZ · MORAVIA',0,['date','location']),
  lower('premium-lt-source','Premium Source','PRIMARY SOURCE','ARCHIVE · PUBLICATION',1,['source','citation']),
  lower('premium-lt-stat','Premium Stat','87%','VIEWERS STAYED TO WATCH',2,['stat','data']),
  lower('premium-lt-product','Premium Product','PRODUCT NAME','$129 · REVIEW UNIT',3,['product','review']),
  lower('premium-lt-tip','Premium Tip','QUICK TIP','ONE USEFUL SENTENCE',4,['tip','tutorial'])
];

export const premiumEngagementTemplates:TemplateDefinition[]=[
  cta('premium-cta-like','Premium Like','LIKE THIS VIDEO','If this helped you','heart',0,['like']),
  cta('premium-cta-comment','Premium Comment','LEAVE A COMMENT','Tell me what you think','comment',1,['comment']),
  cta('premium-cta-subscribe','Premium Subscribe','SUBSCRIBE','More videos like this','plus',2,['subscribe']),
  cta('premium-cta-share','Premium Share','SHARE THIS VIDEO','Send it to someone','share',0,['share']),
  cta('premium-cta-save','Premium Save','SAVE FOR LATER','Come back when you need it','save',1,['save']),
  cta('premium-cta-bell','Premium Notifications','TURN ON NOTIFICATIONS','Don’t miss the next upload','bell',2,['notifications']),
  cta('premium-cta-answer','Premium Answer','ANSWER BELOW','I want to hear your take','question',0,['question']),
  cta('premium-cta-next','Premium Next Topic','WHAT SHOULD I MAKE NEXT?','Leave your request below','arrow',1,['comment','creator']),
  cta('premium-cta-pin','Premium Pinned Comment','CHECK THE PINNED COMMENT','Links + sources are there','pin',2,['comment','resource']),
  cta('premium-cta-continue','Premium Continue','KEEP WATCHING','The best part is next','arrow',0,['retention','watch'])
];

export const premiumUtilityTemplates:TemplateDefinition[]=[...premiumLowerThirdTemplates,...premiumEngagementTemplates];
