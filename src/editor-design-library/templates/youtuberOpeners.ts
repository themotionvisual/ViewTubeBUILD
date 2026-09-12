import type {TemplateDefinition, TemplateElement, MotionPreset} from '../core/schema';

const W = 1920;
const H = 1080;

const text = (id:string, value:string, y:number, size=116, token:'colors.foreground'|'colors.background'='colors.foreground'):TemplateElement => ({
  id,type:'text',name:id,x:150,y,width:1620,height:190,text:value,fontSize:size,fontSizeToken:'sizing.titleSize',fontFamilyToken:'typography.displayFamily',fontWeight:999,fontWeightToken:'typography.fontWeight',fillToken:token,editable:true,
  animation:{preset:'stagger-words',durationFrames:22,easing:'power3.out'}
});
const label = (id:string, value:string, y:number):TemplateElement => ({
  id,type:'text',name:id,x:154,y,width:1500,height:80,text:value,fontSize:34,fontSizeToken:'sizing.subtitleSize',fontFamilyToken:'typography.labelFamily',fontWeight:900,fillToken:'colors.accent',editable:true,animation:{preset:'slide',durationFrames:16,direction:'up'}
});
const bar = (id:string,y:number):TemplateElement => ({id,type:'svg',name:id,x:150,y,width:760,height:18,svg:'<svg viewBox="0 0 760 18"><rect width="760" height="18" rx="9" fill="currentColor"/></svg>',fillToken:'colors.accent',editable:true,animation:{preset:'line-draw',durationFrames:18}});

function scene(id:string,name:string,tags:string[],headline:string,kicker:string,preset:MotionPreset='stagger-words',aspectRatio:TemplateDefinition['aspectRatio']='responsive'):TemplateDefinition {
  const headlineEl=text('headline',headline,380);
  headlineEl.animation={preset,durationFrames:24,easing:'power3.out'};
  return {id,name,category:'scene',tags,aspectRatio,width:W,height:H,durationFrames:90,background:'#ffffff',customizable:true,responsive:true,
    style:{colors:{primary:'#34cdea',secondary:'#ffd34e',accent:'#f05a67',background:'#ffffff',foreground:'#171717',border:'#171717',shadow:'#171717'}},
    elements:[label('kicker',kicker,290),headlineEl,bar('accent-rule',610)],entrance:{preset:'fade',durationFrames:8},responsiveLayouts:{portrait:{canvas:{aspectRatio:'9:16',safeArea:96},spacing:{padding:96,gap:34,insetX:96,insetY:180}},square:{canvas:{aspectRatio:'1:1',safeArea:72}}}}
}

export const hookTemplates:TemplateDefinition[] = [
 scene('yt-hook-watch-this','Watch This Hook',['youtube','hook','opening','retention'],'WATCH WHAT HAPPENS','RIGHT AT THE START','stagger-words'),
 scene('yt-hook-problem','There Is A Problem Hook',['youtube','hook','problem'],'BUT THERE’S A PROBLEM','THE PART EVERYONE MISSES','mask-reveal'),
 scene('yt-hook-changed','Everything Changed Hook',['youtube','hook','story'],'THEN EVERYTHING CHANGED','ONE MOMENT · ONE DECISION','slide'),
 scene('yt-hook-three-things','Three Things Hook',['youtube','hook','list'],'3 THINGS YOU NEED TO KNOW','BEFORE WE BEGIN','scale'),
 scene('yt-hook-result','The Result Hook',['youtube','hook','result'],'THE RESULT?','NOT WHAT I EXPECTED','overshoot'),
 scene('yt-hook-evidence','Evidence Hook',['youtube','hook','evidence'],'HERE’S THE EVIDENCE','LOOK CLOSELY','blur-in'),
 scene('yt-hook-before-you','Before You Hook',['youtube','hook','warning'],'BEFORE YOU TRY THIS…','WATCH THIS FIRST','wipe'),
 scene('yt-hook-secret','Secret Hook',['youtube','hook','curiosity'],'THE SECRET IS…','HIDDEN IN PLAIN SIGHT','type-reveal'),
 scene('yt-hook-nobody','Nobody Expected Hook',['youtube','hook','curiosity'],'NOBODY EXPECTED THIS','AND HERE’S WHY','spring'),
 scene('yt-hook-guess','Guess What Happens',['youtube','hook','question'],'GUESS WHAT HAPPENS NEXT','YOU HAVE 3 SECONDS','pop'),
 scene('yt-hook-wrong','Doing It Wrong Hook',['youtube','hook','tutorial'],'YOU’RE DOING THIS WRONG','HERE’S THE BETTER WAY','rotate-in'),
 scene('yt-hook-simple','Simple Answer Hook',['youtube','hook','answer'],'THE ANSWER IS SURPRISINGLY SIMPLE','LET ME SHOW YOU','reveal'),
 scene('yt-hook-tested','I Tested It Hook',['youtube','hook','test'],'I TESTED IT','SO YOU DON’T HAVE TO','bounce'),
 scene('yt-hook-one-detail','One Detail Hook',['youtube','hook','detail'],'ONE DETAIL CHANGES EVERYTHING','DON’T MISS THIS','mask-reveal'),
 scene('yt-hook-stop','Stop Scroll Hook',['youtube','hook','shorts'],'STOP — LOOK AT THIS','THIS TAKES 10 SECONDS','overshoot'),
 scene('yt-hook-fact','Cold Fact Hook',['youtube','hook','fact'],'87%','ONE NUMBER TELLS THE STORY','scale'),
 scene('yt-hook-quote','Cold Quote Hook',['youtube','hook','quote'],'“THIS SHOULD NOT HAVE WORKED.”','BUT IT DID','blur-in'),
 scene('yt-hook-comparison','A vs B Hook',['youtube','hook','comparison'],'A OR B?','ONE IS MUCH BETTER','slide'),
 scene('yt-hook-mistake','Biggest Mistake Hook',['youtube','hook','mistake'],'THE BIGGEST MISTAKE','AND HOW TO AVOID IT','wipe'),
 scene('yt-hook-reveal','Reveal Hook',['youtube','hook','reveal'],'HERE’S WHAT REALLY HAPPENED','THE FULL STORY','stagger-letters')
];

export const introTemplates:TemplateDefinition[] = [
 scene('yt-intro-micro','Micro Video Intro',['youtube','intro','title'],'VIDEO TITLE','0.75 SECOND MICRO INTRO','scale'),
 scene('yt-intro-channel','Channel Signature',['youtube','intro','channel'],'CHANNEL NAME','A CHANNEL SIGNATURE','stagger-letters'),
 scene('yt-intro-presenter','Presenter Intro',['youtube','intro','presenter'],'CREATOR NAME','CHANNEL · TOPIC','slide'),
 scene('yt-intro-promise','Promise Intro',['youtube','intro','promise'],'TODAY YOU’LL LEARN…','A CLEAR VIEWER PROMISE','stagger-words'),
 scene('yt-intro-preview','Three Part Preview',['youtube','intro','preview'],'1 · 2 · 3','THREE THINGS WE’LL COVER','pop'),
 scene('yt-intro-story','Story Intro',['youtube','intro','story'],'PLACE · DATE · EVENT','THE STORY BEGINS HERE','blur-in'),
 scene('yt-intro-documentary','Documentary Intro',['youtube','intro','documentary'],'THE UNTOLD STORY','A DOCUMENTARY TITLE','reveal'),
 scene('yt-intro-series','Series Intro',['youtube','intro','series'],'SERIES · EPISODE 04','VIDEO TITLE','slide'),
 scene('yt-intro-tutorial','Tutorial Intro',['youtube','intro','tutorial'],'HOW TO DO THIS','STEP-BY-STEP GUIDE','wipe'),
 scene('yt-intro-review','Review Intro',['youtube','intro','review'],'IS IT WORTH IT?','FULL REVIEW','overshoot'),
 scene('yt-intro-case-study','Case Study Intro',['youtube','intro','case study'],'HOW THIS GREW 300%','CASE STUDY','scale'),
 scene('yt-intro-interview','Interview Intro',['youtube','intro','interview'],'GUEST NAME','CONVERSATION · EPISODE 12','slide'),
 scene('yt-intro-explainer','Explainer Intro',['youtube','intro','explainer'],'HOW IT ACTUALLY WORKS','EXPLAINED SIMPLY','mask-reveal'),
 scene('yt-intro-ranking','Ranking Intro',['youtube','intro','ranking'],'TOP 10','RANKED FROM WORST TO BEST','pop'),
 scene('yt-intro-challenge','Challenge Intro',['youtube','intro','challenge'],'7 DAYS · ONE GOAL','THE CHALLENGE STARTS NOW','spring')
];

export const questionTemplates:TemplateDefinition[] = [
 scene('yt-question-what-do','What Would You Do',['youtube','question','comment'],'WHAT WOULD YOU DO?','ANSWER IN THE COMMENTS','pop'),
 scene('yt-question-choose','Which Would You Choose',['youtube','question','choice'],'WHICH WOULD YOU CHOOSE?','A OR B','slide'),
 scene('yt-question-agree','Do You Agree',['youtube','question','opinion'],'DO YOU AGREE?','YES · NO · IT DEPENDS','scale'),
 scene('yt-question-guess','Guess The Answer',['youtube','question','quiz'],'CAN YOU GUESS THE ANSWER?','DON’T SKIP AHEAD','type-reveal'),
 scene('yt-question-next','What Happens Next',['youtube','question','story'],'WHAT HAPPENS NEXT?','MAKE YOUR PREDICTION','blur-in'),
 scene('yt-question-better','Which Is Better',['youtube','question','comparison'],'WHICH IS BETTER?','PICK ONE','overshoot'),
 scene('yt-question-truefalse','True Or False',['youtube','question','quiz'],'TRUE OR FALSE?','LOCK IN YOUR ANSWER','pop'),
 scene('yt-question-didknow','Did You Know',['youtube','question','fact'],'DID YOU KNOW THIS?','MOST PEOPLE DON’T','reveal'),
 scene('yt-question-right','Who Was Right',['youtube','question','debate'],'WHO WAS RIGHT?','TELL ME WHY','slide'),
 scene('yt-question-next-topic','What Should I Make Next',['youtube','question','creator'],'WHAT SHOULD I MAKE NEXT?','LEAVE A REQUEST','stagger-words'),
 scene('yt-question-rate','Rate This',['youtube','question','rating'],'RATE THIS 1–10','DROP YOUR SCORE BELOW','scale'),
 scene('yt-question-spot','Can You Spot It',['youtube','question','visual'],'CAN YOU SPOT IT?','LOOK CLOSELY','mask-reveal'),
 scene('yt-question-one-word','One Word Answer',['youtube','question','comment'],'DESCRIBE IT IN ONE WORD','I’LL PIN MY FAVORITE','type-reveal'),
 scene('yt-question-before-after','Before Or After',['youtube','question','comparison'],'BEFORE OR AFTER?','WHICH ONE WINS?','wipe'),
 scene('yt-question-predict','Make A Prediction',['youtube','question','prediction'],'WHAT DO YOU THINK HAPPENS?','PREDICT BEFORE THE REVEAL','spring')
];

export const youtuberOpenerTemplates:TemplateDefinition[]=[...hookTemplates,...introTemplates,...questionTemplates];
