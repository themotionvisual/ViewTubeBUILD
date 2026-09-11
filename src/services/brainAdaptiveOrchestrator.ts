import { VIEWTUBE_SUGGESTED_TOOL_CHAINS, VIEWTUBE_TOOL_CAPABILITIES, type ViewTubePayloadKind } from "./viewTubeToolChains"
import { applyChannelLearningToChains } from "./brainWorkflowLearning"

export type BrainOrchestrationGoal = "grow" | "publish" | "package" | "produce" | "engage" | "revive" | "learn"
export type BrainOrchestrationMode = "suggest" | "guided" | "automatic"
export interface BrainChannelProfile { channelId?: string | null; niche?: string | null; formats?: string[]; priorities?: BrainOrchestrationGoal[]; preferredTools?: string[]; avoidedTools?: string[] }
export interface BrainOrchestrationRequest { goal: BrainOrchestrationGoal; payloadKind?: ViewTubePayloadKind; sourceToolId?: string; channel?: BrainChannelProfile; mode?: BrainOrchestrationMode }
export interface BrainRankedChain { chainId:string; title:string; score:number; reasons:string[]; steps:{toolId:string;label:string;purpose:string;optional:boolean}[]; outcome:string }
const GOAL_HINTS: Record<BrainOrchestrationGoal,string[]> = { grow:["analysis-to-packaging","tactic-to-experiment","comment-to-content"], publish:["thumbnail-to-publish","script-to-production"], package:["analysis-to-packaging","thumbnail-to-publish"], produce:["script-to-production","asset-to-editor"], engage:["generated-image-to-community-poll","comment-to-content"], revive:["video-to-next-video","analysis-to-packaging"], learn:["tactic-to-experiment","analysis-to-packaging"] }

export const rankViewTubeToolChains = (request: BrainOrchestrationRequest): BrainRankedChain[] => {
 const preferred=new Set(request.channel?.preferredTools||[]), avoided=new Set(request.channel?.avoidedTools||[]), goalHints=new Set(GOAL_HINTS[request.goal])
 const base=VIEWTUBE_SUGGESTED_TOOL_CHAINS.map(chain=>{ let score=goalHints.has(chain.id)?60:25; const reasons:string[]=goalHints.has(chain.id)?[`Matches ${request.goal} goal`]:[]
  if(request.sourceToolId&&(chain.startsWith.includes(request.sourceToolId)||chain.steps.some(step=>step.toolId===request.sourceToolId))){score+=18;reasons.push("Continues from the active tool")}
  const chainTools=chain.steps.map(step=>step.toolId), preferredHits=chainTools.filter(id=>preferred.has(id)).length, avoidedHits=chainTools.filter(id=>avoided.has(id)).length
  if(preferredHits){score+=preferredHits*6;reasons.push("Uses preferred tools")} if(avoidedHits){score-=avoidedHits*18;reasons.push("Includes a user-avoided tool")}
  if(request.payloadKind&&chainTools.some(id=>VIEWTUBE_TOOL_CAPABILITIES.find(tool=>tool.id===id)?.accepts.includes(request.payloadKind!))){score+=10;reasons.push(`Accepts ${request.payloadKind} context`)}
  return {chainId:chain.id,title:chain.title,score:Math.max(0,Math.min(100,score)),reasons,steps:chain.steps.map(step=>({toolId:step.toolId,label:VIEWTUBE_TOOL_CAPABILITIES.find(tool=>tool.id===step.toolId)?.label||step.toolId,purpose:step.purpose,optional:Boolean(step.optional)})),outcome:chain.outcome}
 }).sort((a,b)=>b.score-a.score)
 const channelId=request.channel?.channelId
 return channelId?applyChannelLearningToChains(channelId,request.goal,base):base
}

export const recommendNextViewTubeWorkflow=(request:BrainOrchestrationRequest)=>{const ranked=rankViewTubeToolChains(request);return{request:{...request,mode:request.mode||"guided"},primary:ranked[0]||null,alternatives:ranked.slice(1,4),generatedAt:Date.now()}}
