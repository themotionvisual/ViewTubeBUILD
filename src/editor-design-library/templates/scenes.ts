import type {TemplateDefinition, TemplateElement} from '../core/schema';
import {VIEWTUBE_PALETTE} from '../core/tokens';

const text = (id:string,value:string,x:number,y:number,w:number,size:number,weight=999):TemplateElement => ({id,type:'text',name:value,x,y,width:w,height:size*2,text:value,fontSize:size,fontWeight:weight,fill:'#171717',editable:true,animation:{preset:'spring',durationFrames:20}});
const box = (id:string,x:number,y:number,w:number,h:number,fill:string):TemplateElement => ({id,type:'svg',name:id,x,y,width:w,height:h,svg:`<svg viewBox="0 0 ${w} ${h}"><rect x="8" y="8" width="${w-16}" height="${h-16}" rx="28" fill="${fill}" stroke="#171717" stroke-width="16"/></svg>`,editable:true,animation:{preset:'scale',durationFrames:16}});

const scene = (id:string,name:string,elements:TemplateElement[],accent:string,tags:string[]):TemplateDefinition => ({id,name,category:'scene',tags:['scene','editable',...tags],aspectRatio:'16:9',width:1920,height:1080,durationFrames:120,background:'#ffffff',elements,palette:[accent,'#171717','#ffffff'],responsive:true});

export const sceneTemplates: TemplateDefinition[] = [
 scene('scene-title','Title Scene',[box('panel',80,90,1760,900,VIEWTUBE_PALETTE[7]),text('eyebrow','VIEWTUBE PRESENTS',150,180,1300,42,900),text('title','THE BIG STORY',150,330,1500,150),text('sub','A COMPLETE VISUAL EXPLANATION',155,720,1300,46,800)],VIEWTUBE_PALETTE[7],['title','intro']),
 scene('scene-chapter','Chapter Break',[text('num','01',120,170,500,250),text('title','CHAPTER TITLE',620,290,1120,120),text('sub','THE NEXT PART OF THE STORY',630,520,1000,42,800)],VIEWTUBE_PALETTE[3],['chapter']),
 scene('scene-stat','Statistic Scene',[box('statbox',110,150,780,780,VIEWTUBE_PALETTE[4]),text('stat','87%',190,260,650,230),text('label','KEY STATISTIC',200,650,600,48),text('body','Add a short explanation of why this number matters.',1010,340,720,58,800)],VIEWTUBE_PALETTE[4],['stat','data']),
 scene('scene-quote','Quote Scene',[text('quote','“I SAW IT MYSELF.”',160,260,1500,118),text('source','— EYEWITNESS ACCOUNT · 1805',170,600,1200,44,800)],VIEWTUBE_PALETTE[10],['quote','history']),
 scene('scene-date-place','Date + Location',[text('date','2 DECEMBER 1805',140,220,1500,120),box('placebox',140,520,1050,170,VIEWTUBE_PALETTE[0]),text('place','AUSTERLITZ · MORAVIA',190,555,950,64)],VIEWTUBE_PALETTE[0],['date','location','history']),
 scene('scene-person','Person Profile',[box('portrait',110,120,650,840,'#f1f1ed'),text('name','NAPOLEON BONAPARTE',860,250,900,100),text('role','EMPEROR OF THE FRENCH',870,490,850,44,800),text('detail','1769 — 1821',870,620,600,38,800)],VIEWTUBE_PALETTE[8],['profile','history']),
 scene('scene-question','Question Scene',[text('q','WHAT HAPPENED NEXT?',150,300,1600,150),text('hint','THE ANSWER CHANGED EVERYTHING.',160,650,1200,48,800)],VIEWTUBE_PALETTE[2],['question','hook']),
 scene('scene-cta','Call To Action',[box('cta',190,220,1540,640,VIEWTUBE_PALETTE[11]),text('title','KEEP WATCHING',300,340,1300,140),text('sub','THE NEXT CHAPTER IS READY',310,650,1100,44,800)],VIEWTUBE_PALETTE[11],['cta','outro']),
];
