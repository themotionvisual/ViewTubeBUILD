import type {TemplateDefinition} from '../core/schema';
import {VIEWTUBE_PALETTE,VIEWTUBE_INK} from '../core/tokens';
import {gradientPresets,patternKinds,svgPattern} from '../primitives/backgrounds';

export const backgroundTemplates:TemplateDefinition[]=gradientPresets.map((preset,index)=>({
 id:`background-${preset.id}`,name:preset.name,category:'background',tags:['background','gradient','color',`palette-${index+1}`],aspectRatio:'responsive',width:1920,height:1080,durationFrames:150,background:preset.background,renderMode:'background',responsive:true,customizable:true,palette:[preset.colorA,preset.colorB],elements:[]
}));

export const patternTemplates:TemplateDefinition[]=patternKinds.map((kind,index)=>{
 const accent=VIEWTUBE_PALETTE[index%VIEWTUBE_PALETTE.length];
 const svg=svgPattern(kind,{color:VIEWTUBE_INK,background:accent,opacity:.28,spacing:52,strokeWidth:3});
 return {id:`pattern-${kind}`,name:`${kind[0].toUpperCase()}${kind.slice(1)} Pattern`,category:'pattern',tags:['pattern',kind,'background','svg'],aspectRatio:'responsive',width:1920,height:1080,durationFrames:150,background:accent,renderMode:'full-frame',responsive:true,customizable:true,palette:[accent,VIEWTUBE_INK],elements:[{id:`${kind}-tile`,type:'svg',name:`${kind} pattern`,x:0,y:0,width:1920,height:1080,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs><pattern id="p" width="104" height="104" patternUnits="userSpaceOnUse"><image href="data:image/svg+xml,${encodeURIComponent(svg)}" width="104" height="104"/></pattern></defs><rect width="1920" height="1080" fill="url(#p)"/></svg>`,editable:true}]};
});
