import React, { useEffect, useMemo, useState } from "react"
import { BarChart3, Brain, Database, ExternalLink, MessageSquare, Package, Radar, RefreshCw, Send, Settings2, ShieldCheck, Sparkles, Target } from "lucide-react"
import { Link } from "react-router-dom"
import { WidgetShell } from "../WidgetShell"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"
import { useBrain } from "../../../context/useBrain"
import { hasGeminiKey } from "../../../services/gemini"
import { buildAIBrainContextSnapshot, buildAIBrainSystemPrompt } from "../../../services/aiBrainCommandInterface"
import { runBrainTurn } from "../../../services/brain/BrainOrchestrator"
import { readBrainUserControls, setActiveBrainControlChannel, type BrainUserControls } from "../../../services/brain/BrainUserControls"
import { readBrainEngineControls, type BrainEngineControls } from "../../../services/brain/BrainEngineControls"
import { readAlgorithmIntelligenceForBrain, type AlgorithmIntelligenceAccessResult } from "../../../services/brain/AlgorithmIntelligenceAccess"
import type { AlgorithmIntelligencePortfolio } from "../../../services/brain/AlgorithmIntelligenceOrchestrator"
import { searchVaultForBrain } from "../../../services/brain/BrainVaultAdapter"
import type { AIBrainConversationTurn } from "../../../types"

interface BrainHubWidgetProps extends CommonWidgetProps { data: DashboardData }
type Tab="chat"|"intelligence"|"evidence"|"packages"

const pill=(active:boolean,color:string):React.CSSProperties=>({border:"2px solid color-mix(in srgb, var(--widget-color) 72%, #45172a)",background:active?color:"#fff",color:"color-mix(in srgb, var(--widget-color) 54%, #45172a)",borderRadius:6,height:24,padding:"0 7px",fontSize:8,fontWeight:1000,textTransform:"uppercase",cursor:"pointer"})

export const BrainHubWidget: React.FC<BrainHubWidgetProps> = ({ data: _data, ...common }) => {
 const { brain, authState, channelConnection, getBrainMemory }=useBrain()
 const channelId=authState.channelId||authState.channelHandle||null
 const [tab,setTab]=useState<Tab>("chat")
 const [input,setInput]=useState("")
 const [busy,setBusy]=useState(false)
 const [turns,setTurns]=useState<AIBrainConversationTurn[]>([])
 const [answer,setAnswer]=useState<AIBrainConversationTurn|null>(null)
 const [controls,setControls]=useState<BrainUserControls>(()=>readBrainUserControls(channelId))
 const [engines,setEngines]=useState<BrainEngineControls>(()=>readBrainEngineControls(channelId))
 const [portfolio,setPortfolio]=useState<AlgorithmIntelligencePortfolio|null>(null)
 const [intelStatus,setIntelStatus]=useState<string>("Not loaded")

 useEffect(()=>{
  setActiveBrainControlChannel(channelId)
  setControls(readBrainUserControls(channelId))
  setEngines(readBrainEngineControls(channelId))
  const refresh=()=>{setControls(readBrainUserControls(channelId));setEngines(readBrainEngineControls(channelId))}
  window.addEventListener("vt_brain_user_controls_changed",refresh)
  window.addEventListener("vt_brain_engine_controls_changed",refresh)
  return()=>{window.removeEventListener("vt_brain_user_controls_changed",refresh);window.removeEventListener("vt_brain_engine_controls_changed",refresh)}
 },[channelId])

 const snapshot=useMemo(()=>buildAIBrainContextSnapshot({brain,authState,channelConnection,brainMemory:controls.personalization?getBrainMemory():null,recentConversationTurns:controls.personalization?turns:[]}),[brain,authState,channelConnection,controls.personalization,turns,getBrainMemory])
 const packages=useMemo(()=>controls.allowVault&&engines.videoPackages?searchVaultForBrain({query:"package",limit:8}):{assets:[],evidence:[]},[controls.allowVault,engines.videoPackages,answer])
 const evidence=(((snapshot.evidencePack as any)?.items)||[]).slice(0,engines.maxEvidenceItems)

 const loadIntelligence=async()=>{
  if(!channelId||!controls.enabled||!controls.allowAnalytics){setIntelStatus("Analytics access disabled");return}
  setIntelStatus("Building portfolio…")
  const result:AlgorithmIntelligenceAccessResult<AlgorithmIntelligencePortfolio>=await readAlgorithmIntelligenceForBrain({channelId})
  if(result.status==="ok"){setPortfolio(result.value);setIntelStatus("Ready")}else setIntelStatus(result.message)
 }

 const send=async()=>{
  const text=input.trim();if(!text||busy||!controls.enabled)return
  setInput("");setBusy(true)
  try{
   if(engines.channelIntelligence&&!portfolio) await loadIntelligence()
   const system=buildAIBrainSystemPrompt({brain,authState,channelConnection,brainMemory:controls.personalization?getBrainMemory():null,recentConversationTurns:controls.personalization?turns:[]})+`\n\nBRAIN COMMAND WIDGET POLICY\nAnalytics=${controls.allowAnalytics}; Projects=${controls.allowProjects}; Vault=${controls.allowVault}; Publisher=${controls.allowPublisher}; ApprovalRequired=${controls.externalActionsRequireApproval}.\nEngine policy: channelIntelligence=${engines.channelIntelligence}; anomalyIntelligence=${engines.anomalyIntelligence}; opportunityIntelligence=${engines.opportunityIntelligence}; algorithmPriming=${engines.algorithmPriming}; videoPackages=${engines.videoPackages}.\nNever claim an engine supplied evidence when it is disabled or absent. External write/publish actions remain explicit approval-aware handoffs.`
   const result=await runBrainTurn({channelId,userText:text,snapshot,systemPrompt:system,recentTurns:controls.personalization?turns:[],history:controls.personalization?turns.slice(0,4).reverse().flatMap(t=>[{role:"user",parts:[{text:t.userText}]},{role:"model",parts:[{text:t.assistantText}]}]):[],allowModel:hasGeminiKey()})
   setAnswer(result.turn);setTurns(v=>[result.turn,...v].slice(0,12))
  }catch(error){console.warn("[BrainHubWidget] turn failed",error);setInput(text)}finally{setBusy(false)}
 }

 const tabs:[Tab,string,React.ComponentType<{size?:number}>][]=[["chat","Chat",MessageSquare],["intelligence","Intel",Target],["evidence","Evidence",Database],["packages","Packages",Package]]
 return <WidgetShell {...common} icon={<Brain size={22}/>}>
  <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0,gap:7,color:"color-mix(in srgb, var(--widget-color) 52%, #3b1020)"}}>
   <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:4}}>{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} style={pill(tab===id,"color-mix(in srgb, var(--widget-color) 42%, white)")}><Icon size={10}/>{label}</button>)}</div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:4}}>
    {[{l:"Analytics",on:controls.allowAnalytics,i:BarChart3},{l:"Anomaly",on:engines.anomalyIntelligence,i:Radar},{l:"Priming",on:engines.algorithmPriming,i:Target},{l:"Packages",on:engines.videoPackages&&controls.allowVault,i:Package}].map(({l,on,i:Icon})=><div key={l} style={{border:"1.5px solid currentColor",borderRadius:5,padding:"3px 5px",background:on?"color-mix(in srgb, var(--widget-color) 18%, white)":"#f3f3f3",opacity:on?1:.45}}><Icon size={9}/><b style={{display:"block",fontSize:7,textTransform:"uppercase"}}>{l}</b></div>)}
   </div>

   <div style={{flex:1,minHeight:0,overflow:"auto",border:"2px solid currentColor",borderRadius:8,background:"#fff",padding:8}}>
    {tab==="chat"&&<div>
     {answer?.response?<><div style={{fontSize:8,fontWeight:1000,textTransform:"uppercase",opacity:.45}}>Brain answer · {answer.response.confidence}</div><p style={{fontSize:11,fontWeight:850,lineHeight:1.35,margin:"5px 0"}}>{answer.response.keyInsight}</p><div style={{display:"flex",gap:4,flexWrap:"wrap"}}><span style={pill(true,"#b9f536")}>{answer.response.evidenceIds?.length||0} evidence</span><span style={pill(true,"#34cdea")}>{answer.response.modules?.length||0} modules</span></div></>:<div style={{display:"grid",placeItems:"center",minHeight:100,textAlign:"center"}}><div><Sparkles size={22}/><b style={{display:"block",fontSize:12,textTransform:"uppercase"}}>Brain Command</b><small style={{fontSize:9,fontWeight:700}}>Ask about analytics, evidence, packages, anomalies, opportunities, priming or next actions.</small></div></div>}
    </div>}
    {tab==="intelligence"&&<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><b style={{fontSize:10,textTransform:"uppercase"}}>Algorithm Intelligence Portfolio</b><button onClick={()=>void loadIntelligence()} style={pill(true,"#ffe04e")}><RefreshCw size={9}/> Refresh</button></div><small style={{fontSize:8,fontWeight:800}}>{intelStatus}</small>{portfolio&&<div style={{display:"grid",gap:5,marginTop:7}}><div style={{fontSize:9,fontWeight:900}}>CHANNEL PATTERNS · {portfolio.channelIntelligence.patterns.length}</div><div style={{fontSize:9,fontWeight:900}}>ANOMALY SIGNALS · {portfolio.anomalySignals.length}</div><div style={{fontSize:9,fontWeight:900}}>OPPORTUNITIES · {portfolio.opportunitySignals.length}</div><div style={{fontSize:9,fontWeight:900}}>RECOMMENDATIONS · {portfolio.recommendations.length}</div><div style={{fontSize:9,fontWeight:900}}>PRIMING · {portfolio.primingPlan?portfolio.primingPlan.steps.length+" steps":"Needs project context"}</div>{portfolio.primaryRecommendation&&<div style={{padding:6,border:"2px solid currentColor",borderRadius:6,background:"#ffe04e55"}}><small style={{fontSize:7,fontWeight:1000}}>PRIMARY</small><b style={{display:"block",fontSize:10}}>{portfolio.primaryRecommendation.title}</b></div>}</div>}</div>}
    {tab==="evidence"&&<div><b style={{fontSize:10,textTransform:"uppercase"}}>Analytics + Evidence Access</b><p style={{fontSize:8,fontWeight:700,opacity:.6}}>Showing {evidence.length} of the bounded Brain evidence pack.</p><div style={{display:"grid",gap:4}}>{evidence.map((item:any)=><div key={item.id} style={{borderLeft:"4px solid var(--widget-color)",padding:"4px 6px",background:"color-mix(in srgb,var(--widget-color) 8%,white)"}}><b style={{display:"block",fontSize:8}}>{item.label||item.id}</b><small style={{fontSize:7}}>{item.source||"evidence"}{item.detail?` · ${item.detail}`:""}</small></div>)}</div></div>}
    {tab==="packages"&&<div><b style={{fontSize:10,textTransform:"uppercase"}}>Video Packages + Vault</b><p style={{fontSize:8,fontWeight:700,opacity:.6}}>{controls.allowVault&&engines.videoPackages?`${packages.assets.length} matching package assets`:`Package access disabled in Brain Controls.`}</p><div style={{display:"grid",gap:4}}>{packages.assets.map(asset=><div key={asset.id} style={{padding:5,border:"2px solid currentColor",borderRadius:6}}><b style={{display:"block",fontSize:8}}>{asset.name}</b><small style={{fontSize:7}}>{asset.kind} · {asset.projectName||"No project"} · {asset.source}</small></div>)}</div></div>}
   </div>

   <div style={{display:"grid",gridTemplateColumns:"1fr 34px",gap:5}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void send()}} disabled={!controls.enabled} placeholder={controls.enabled?"Ask Brain…":"Brain disabled"} style={{height:32,border:"2px solid currentColor",borderRadius:7,padding:"0 8px",fontSize:10,fontWeight:800,outline:"none",minWidth:0}}/><button onClick={()=>void send()} disabled={!input.trim()||busy||!controls.enabled} style={{height:32,border:"2px solid currentColor",borderRadius:7,background:"#b9f536",display:"grid",placeItems:"center",opacity:busy?0.55:1}} aria-label="Send"><Send size={13}/></button></div>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:5}}><span style={{fontSize:7,fontWeight:1000,textTransform:"uppercase",opacity:.5}}><ShieldCheck size={9} style={{display:"inline"}}/> {controls.externalActionsRequireApproval?"Approval gated":"Approval policy relaxed"}</span><Link to="/brain-controls" style={{...pill(true,"color-mix(in srgb,var(--widget-color) 24%,white)"),display:"inline-flex",alignItems:"center",gap:3,textDecoration:"none"}}><Settings2 size={9}/> Controls <ExternalLink size={8}/></Link></div>
  </div>
 </WidgetShell>
}
