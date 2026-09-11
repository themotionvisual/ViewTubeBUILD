import type {TemplateDefinition, TemplateElement} from '../core/schema';

const W=1920,H=1080;
const lower=(id:string,name:string,primary:string,secondary:string,tags:string[]):TemplateDefinition=>({id,name,category:'graphic',tags:['youtube','lower-third','transparent-svg',...tags],aspectRatio:'responsive',width:W,height:H,durationFrames:120,customizable:true,responsive:true,renderMode:'svg-clip',clipBehavior:{transparentBackground:true,movable:true,resizable:true,rotatable:true,duplicable:true,trimmable:true,layerable:true,preserveAspectRatio:false,defaultScale:1},elements:[
{id:'plate',type:'svg',name:'Plate',x:110,y:770,width:1080,height:190,svg:'<svg viewBox="0 0 1080 190"><rect x="4" y="4" width="1072" height="182" rx="30" fill="currentColor" stroke="#171717" stroke-width="5"/></svg>',fillToken:'colors.background',strokeToken:'colors.border',editable:true,animation:{preset:'slide',durationFrames:18,direction:'left'}},
{id:'primary',type:'text',name:'Primary',x:160,y:808,width:940,height:74,text:primary,fontSize:62,fontSizeToken:'sizing.subtitleSize',fontFamilyToken:'typography.headingFamily',fontWeight:999,fillToken:'colors.foreground',editable:true,animation:{preset:'stagger-words',durationFrames:18}},
{id:'secondary',type:'text',name:'Secondary',x:160,y:888,width:920,height:48,text:secondary,fontSize:34,fontSizeToken:'sizing.bodySize',fontFamilyToken:'typography.bodyFamily',fontWeight:900,fillToken:'colors.accent',editable:true,animation:{preset:'fade',durationFrames:14,delayFrames:6}}
],responsiveLayouts:{portrait:{canvas:{aspectRatio:'9:16',safeArea:90},spacing:{padding:90,gap:24,insetX:90,insetY:150}},square:{canvas:{aspectRatio:'1:1',safeArea:68}}}});

const cta=(id:string,name:string,headline:string,sub:string,tags:string[],icon:string):TemplateDefinition=>({id,name,category:'engagement',tags:['youtube','engagement','overlay','transparent-svg',...tags],aspectRatio:'responsive',width:W,height:H,durationFrames:75,customizable:true,responsive:true,renderMode:'svg-clip',clipBehavior:{transparentBackground:true,movable:true,resizable:true,rotatable:true,duplicable:true,trimmable:true,layerable:true,preserveAspectRatio:false,defaultScale:1},elements:[
{id:'plate',type:'svg',name:'CTA Plate',x:105,y:730,width:1260,height:190,svg:'<svg viewBox="0 0 1260 190"><rect x="4" y="4" width="1252" height="182" rx="91" fill="currentColor" stroke="#171717" stroke-width="5"/></svg>',fillToken:'colors.background',strokeToken:'colors.border',editable:true,animation:{preset:'scale',durationFrames:12}},
{id:'icon-disc',type:'svg',name:'Icon Disc',x:140,y:765,width:120,height:120,svg:'<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="currentColor"/></svg>',fillToken:'colors.accent',editable:true,animation:{preset:'pop',durationFrames:16}},
{id:'icon',type:'text',name:'Icon',x:160,y:785,width:82,height:82,text:icon,fontSize:92,fontSizeToken:'sizing.iconSize',fontFamilyToken:'typography.displayFamily',fontWeight:999,fillToken:'colors.foreground',editable:true,animation:{preset:'pop',durationFrames:16}},
{id:'headline',type:'text',name:'Headline',x:300,y:762,width:960,height:76,text:headline,fontSize:68,fontSizeToken:'sizing.subtitleSize',fontFamilyToken:'typography.headingFamily',fontWeight:999,fillToken:'colors.foreground',editable:true,animation:{preset:'slide',durationFrames:18,direction:'right'}},
{id:'sub',type:'text',name:'Subline',x:302,y:846,width:980,height:50,text:sub,fontSize:34,fontSizeToken:'sizing.bodySize',fontFamilyToken:'typography.bodyFamily',fontWeight:900,fillToken:'colors.secondary',editable:true,animation:{preset:'fade',durationFrames:15,delayFrames:7}}
],responsiveLayouts:{portrait:{canvas:{aspectRatio:'9:16',safeArea:96},spacing:{padding:96,gap:28,insetX:96,insetY:190}},square:{canvas:{aspectRatio:'1:1',safeArea:72}}}});

const end=(id:string,name:string,headline:string,sub:string,slots:1|2|3,tags:string[]):TemplateDefinition=>{const elements:TemplateElement[]=[
{id:'headline',type:'text',name:'Headline',x:130,y:100,width:1660,height:140,text:headline,fontSize:104,fontSizeToken:'sizing.titleSize',fontFamilyToken:'typography.displayFamily',fontWeight:999,fillToken:'colors.foreground',editable:true,animation:{preset:'stagger-words',durationFrames:22}},
{id:'sub',type:'text',name:'Subline',x:134,y:246,width:1500,height:68,text:sub,fontSize:40,fontSizeToken:'sizing.subtitleSize',fontFamilyToken:'typography.bodyFamily',fontWeight:900,fillToken:'colors.accent',editable:true,animation:{preset:'fade',durationFrames:16,delayFrames:6}}
];
for(let i=0;i<slots;i++){elements.push({id:`slot-${i+1}`,type:'svg',name:`YouTube End Screen Slot ${i+1}`,x:130+i*(slots===1?0:560),y:360,width:slots===1?1050:500,height:330,svg:'<svg viewBox="0 0 500 330"><rect x="4" y="4" width="492" height="322" rx="24" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="22 14"/></svg>',strokeToken:'colors.border',editable:true,animation:{preset:'scale',durationFrames:16,delayFrames:i*5}})}
elements.push({id:'subscribe-slot',type:'svg',name:'Subscribe Slot',x:1330,y:720,width:320,height:130,svg:'<svg viewBox="0 0 320 130"><rect x="4" y="4" width="312" height="122" rx="61" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="18 12"/></svg>',strokeToken:'colors.accent',editable:true,animation:{preset:'pop',durationFrames:16,delayFrames:12}});
return{id,name,category:'engagement',tags:['youtube','watch-next','end-screen','transparent-svg',...tags],aspectRatio:'responsive',width:W,height:H,durationFrames:450,customizable:true,responsive:true,renderMode:'svg-clip',clipBehavior:{transparentBackground:true,movable:true,resizable:true,rotatable:true,duplicable:true,trimmable:true,layerable:true,preserveAspectRatio:false,defaultScale:1},elements,responsiveLayouts:{portrait:{canvas:{aspectRatio:'9:16',safeArea:100},spacing:{padding:100,gap:32,insetX:100,insetY:170}},square:{canvas:{aspectRatio:'1:1',safeArea:74}}}}};

export const lowerThirdTemplates:TemplateDefinition[]=[
lower('yt-lt-name','Name Lower Third','CREATOR NAME','ROLE / CHANNEL',['name','creator']),
lower('yt-lt-name-role','Name + Role Lower Third','GUEST NAME','FOUNDER · COMPANY',['name','role']),
lower('yt-lt-handle','Handle Lower Third','@CREATORHANDLE','FOLLOW FOR MORE',['handle','social']),
lower('yt-lt-location','Location Lower Third','BROOKLYN, NEW YORK','LOCATION',['location']),
lower('yt-lt-date','Date Lower Third','11 SEPTEMBER 2026','DATE',['date']),
lower('yt-lt-date-location','Date + Location Lower Third','2 DECEMBER 1805','AUSTERLITZ · MORAVIA',['date','location']),
lower('yt-lt-source','Source Lower Third','SOURCE · PRIMARY DOCUMENT','ARCHIVE / PUBLICATION',['source','citation']),
lower('yt-lt-quote','Quote Attribution Lower Third','“QUOTE GOES HERE”','SPEAKER · YEAR',['quote','source']),
lower('yt-lt-stat','Stat Lower Third','87%','VIEWERS STAYED TO WATCH',['stat','data']),
lower('yt-lt-product','Product Lower Third','PRODUCT NAME','$129 · REVIEW UNIT',['product','review']),
lower('yt-lt-url','Website Lower Third','VIEWTUBE.LIVE','LINK / RESOURCE',['website','url']),
lower('yt-lt-tip','Tip Lower Third','QUICK TIP','ONE USEFUL SENTENCE',['tip','tutorial']),
lower('yt-lt-warning','Warning Lower Third','WATCH OUT','COMMON MISTAKE',['warning','tutorial']),
lower('yt-lt-step','Step Lower Third','STEP 03','EXPORT THE FINAL CUT',['step','tutorial']),
lower('yt-lt-definition','Definition Lower Third','RETENTION','PERCENT OF VIEWERS STILL WATCHING',['definition','education']),
lower('yt-lt-score','Score Lower Third','8.7 / 10','FINAL SCORE',['score','review']),
lower('yt-lt-price','Price Lower Third','$49 / MONTH','CURRENT PRICE',['price','review']),
lower('yt-lt-ranking','Ranking Lower Third','#03','THIRD PLACE',['ranking','list']),
lower('yt-lt-chapter','Chapter Lower Third','CHAPTER 04','THE TURNING POINT',['chapter','section']),
lower('yt-lt-live','Live Status Lower Third','LIVE NOW','Q&A · ASK A QUESTION',['live','stream'])
];

export const microEngagementTemplates:TemplateDefinition[]=[
cta('yt-cta-like','Like Overlay','LIKE THIS VIDEO','If this helped you','♥',['like'],'♥'),
cta('yt-cta-comment','Comment Overlay','LEAVE A COMMENT','Tell me what you think','●',['comment'],'●'),
cta('yt-cta-subscribe','Subscribe Overlay','SUBSCRIBE','More videos like this','＋',['subscribe'],'＋'),
cta('yt-cta-share','Share Overlay','SHARE THIS VIDEO','Send it to someone','↗',['share'],'↗'),
cta('yt-cta-save','Save Overlay','SAVE FOR LATER','Come back when you need it','▣',['save'],'▣'),
cta('yt-cta-bell','Notifications Overlay','TURN ON NOTIFICATIONS','Don’t miss the next upload','◉',['notifications'],'◉'),
cta('yt-cta-answer','Answer The Question','ANSWER BELOW','I want to hear your take','?',['question','comment'],'?'),
cta('yt-cta-part-two','Part Two CTA','WANT PART TWO?','Like this video and I’ll make it','2',['like','series'],'2'),
cta('yt-cta-next-topic','Next Topic CTA','WHAT SHOULD I MAKE NEXT?','Leave your request below','→',['comment','creator'],'→'),
cta('yt-cta-pin','Pinned Comment CTA','CHECK THE PINNED COMMENT','Links + sources are there','↓',['comment','resource'],'↓'),
cta('yt-cta-description','Description CTA','LINK IN DESCRIPTION','Everything you need below','↓',['description','link'],'↓'),
cta('yt-cta-poll','Poll CTA','PICK ONE','A · B · C','✓',['poll','question'],'✓'),
cta('yt-cta-rate','Rate CTA','RATE THIS 1–10','Drop your score below','★',['rating','comment'],'★'),
cta('yt-cta-disagree','Debate CTA','DO YOU AGREE?','Tell me why or why not','≠',['debate','comment'],'≠'),
cta('yt-cta-follow-series','Series CTA','FOLLOW THE SERIES','Part two is next','→',['series','subscribe'],'→'),
cta('yt-cta-members','Members CTA','JOIN THE COMMUNITY','Support the channel','◆',['membership','community'],'◆'),
cta('yt-cta-source','Sources CTA','CHECK THE SOURCES','Full references below','≡',['source','education'],'≡'),
cta('yt-cta-download','Download CTA','GET THE FREE RESOURCE','Link in description','⇩',['download','resource'],'⇩'),
cta('yt-cta-challenge','Challenge CTA','TRY THIS YOURSELF','Then tell me how it went','⚑',['challenge','comment'],'⚑'),
cta('yt-cta-continue','Continue CTA','KEEP WATCHING','The best part is next','▶',['retention','watch'],'▶')
];

export const watchNextTemplates:TemplateDefinition[]=[
end('yt-end-one','One Video + Subscribe','WATCH THIS NEXT','Continue with the next video',1,['one-video']),
end('yt-end-two','Two Video End Screen','CHOOSE WHAT TO WATCH NEXT','Two directions · one channel',2,['two-video']),
end('yt-end-series','Continue The Series','CONTINUE THE SERIES','The story isn’t over yet',1,['series']),
end('yt-end-part-two','Part Two End Screen','PART TWO IS READY','Watch the next chapter',1,['part-two']),
end('yt-end-best','Best For Viewer End Screen','WATCH NEXT','Recommended for you',1,['best-for-viewer']),
end('yt-end-latest','Latest Video End Screen','NEWEST VIDEO','See what I made next',1,['latest']),
end('yt-end-playlist','Playlist End Screen','KEEP GOING','Watch the full playlist',1,['playlist']),
end('yt-end-thanks','Thank You End Screen','THANKS FOR WATCHING','Subscribe · then watch this',1,['thank-you']),
end('yt-end-question','Question + Next Video','ONE LAST QUESTION','Answer below · then keep watching',1,['question']),
end('yt-end-two-series','Two Series Choices','PICK YOUR NEXT SERIES','Choose your path',2,['series','choice']),
end('yt-end-three','Three Choice End Screen','WHAT DO YOU WANT NEXT?','Pick one of three',3,['three-video']),
end('yt-end-vertical','Vertical Watch Next','WATCH NEXT','Portrait-safe end screen',1,['vertical','shorts'])
];

export const youtuberUtilityTemplates:TemplateDefinition[]=[...lowerThirdTemplates,...microEngagementTemplates,...watchNextTemplates];
