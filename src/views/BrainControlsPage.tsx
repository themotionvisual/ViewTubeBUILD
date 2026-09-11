import React, { useEffect, useState } from "react"
import { Brain, Database, Eye, FlaskConical, Gauge, LockKeyhole, Package, Radar, RotateCcw, Save, ShieldCheck, Sparkles, Target, Workflow } from "lucide-react"
import { Link } from "react-router-dom"
import { useBrain } from "../context/useBrain"
import { clearBrainUserControlOverride, readBrainUserControls, writeBrainUserControls, type BrainUserControls } from "../services/brain/BrainUserControls"
import { readBrainEngineControls, resetBrainEngineControls, writeBrainEngineControls, type BrainEngineControls } from "../services/brain/BrainEngineControls"

const palette=["#ff5e89","#ffad59","#ffe04e","#39e75f","#34cdea","#5790ef","#9b5ce7","#ea58e8"]

const Toggle=({checked,onChange,label,detail,color="#34cdea"}:{checked:boolean;onChange:(v:boolean)=>void;label:string;detail:string;color?:string})=>(
 <label className="grid grid-cols-[1fr_auto] gap-3 border-b-2 border-black/10 py-3 last:border-0">
  <span><strong className="block text-[11px] font-[1000] uppercase">{label}</strong><small className="mt-1 block text-[9px] font-bold leading-4 text-black/55">{detail}</small></span>
  <button type="button" role="switch" aria-checked={checked} onClick={()=>onChange(!checked)} className="relative h-7 w-12 rounded-[7px] border-2 border-black" style={{background:checked?color:"#eee"}}><span className={`absolute top-[3px] h-[18px] w-[18px] rounded-[4px] border-2 border-black bg-white transition-transform ${checked?"translate-x-[24px]":"translate-x-[3px]"}`}/></button>
 </label>
)

const Card=({title,icon:Icon,color,children}:{title:string;icon:any;color:string;children:React.ReactNode})=>(
 <section className="overflow-hidden rounded-[12px] border-[3px] border-black bg-white shadow-[5px_5px_0_rgba(0,0,0,.14)]">
  <header className="flex items-center gap-2 border-b-[3px] border-black px-3 py-2" style={{background:color}}><Icon size={17}/><h2 className="text-[12px] font-[1000] uppercase">{title}</h2></header>
  <div className="p-3">{children}</div>
 </section>
)

export default function BrainControlsPage(){
 const { authState }=useBrain()
 const channelId=authState.channelId||authState.channelHandle||null
 const [policy,setPolicy]=useState<BrainUserControls>(()=>readBrainUserControls(channelId))
 const [engines,setEngines]=useState<BrainEngineControls>(()=>readBrainEngineControls(channelId))
 const [saved,setSaved]=useState(false)
 useEffect(()=>{setPolicy(readBrainUserControls(channelId));setEngines(readBrainEngineControls(channelId))},[channelId])
 const p=(key:keyof BrainUserControls)=>(v:boolean)=>setPolicy(x=>({...x,[key]:v}))
 const e=(key:keyof BrainEngineControls)=>(v:boolean)=>setEngines(x=>({...x,[key]:v}))
 const save=()=>{writeBrainUserControls(policy,channelId);writeBrainEngineControls(engines,channelId);setSaved(true);setTimeout(()=>setSaved(false),1200)}
 const reset=()=>{if(channelId) setPolicy(clearBrainUserControlOverride(channelId));setEngines(resetBrainEngineControls(channelId))}
 return <main className="min-h-screen bg-[#f5f5f2] p-3 md:p-6">
  <div className="mx-auto max-w-[1240px]">
   <header className="mb-4 grid gap-3 rounded-[14px] border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_#b9f536] md:grid-cols-[1fr_auto] md:items-center">
    <div><div className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-[9px] border-[3px] border-black bg-[#b9f536]"><Brain size={22}/></span><div><h1 className="text-xl font-[1000] uppercase tracking-tight">Brain Controls</h1><p className="text-[10px] font-black uppercase text-black/45">Policy · evidence · intelligence engines · action approvals</p></div></div></div>
    <div className="flex gap-2"><Link to="/ai-brain" className="rounded-[7px] border-2 border-black bg-white px-3 py-2 text-[9px] font-[1000] uppercase">Open Brain</Link><button onClick={save} className="inline-flex items-center gap-1 rounded-[7px] border-2 border-black bg-[#39e75f] px-3 py-2 text-[9px] font-[1000] uppercase shadow-[3px_3px_0_#000]"><Save size={13}/>{saved?"Saved":"Save"}</button></div>
   </header>
   <div className="grid gap-4 lg:grid-cols-2">
    <Card title="Master Brain Policy" icon={ShieldCheck} color={palette[4]}>
     <Toggle checked={policy.enabled} onChange={p("enabled")} label="Brain enabled" detail="Master switch for Brain reasoning and governed capabilities."/>
     <Toggle checked={policy.personalization} onChange={p("personalization")} label="Personalization" detail="Use creator memory, history and learned preferences."/>
     <Toggle checked={policy.learnFromInteractions} onChange={p("learnFromInteractions")} label="Learn from interactions" detail="Allow eligible Brain turns to improve durable creator context."/>
     <Toggle checked={policy.showEvidence} onChange={p("showEvidence")} label="Show evidence" detail="Expose evidence, provenance, confidence and caveats with answers."/>
    </Card>
    <Card title="Data Access" icon={Database} color={palette[3]}>
     <Toggle checked={policy.allowAnalytics} onChange={p("allowAnalytics")} label="Analytics + VT-SYNC" detail="Allow Brain to read canonical analytics evidence and derived metrics."/>
     <Toggle checked={policy.allowProjects} onChange={p("allowProjects")} label="Projects" detail="Allow project/video context and Algorithm Priming plans."/>
     <Toggle checked={policy.allowVault} onChange={p("allowVault")} label="Vault + video packages" detail="Allow package and asset metadata/provenance lookup."/>
     <Toggle checked={policy.allowComments} onChange={p("allowComments")} label="Comments" detail="Allow community/comment context where a Brain tool supports it."/>
     <Toggle checked={policy.allowPublisher} onChange={p("allowPublisher")} label="Publisher" detail="Allow publisher handoffs; external writes remain approval governed."/>
    </Card>
    <Card title="Intelligence Engines" icon={Workflow} color={palette[2]}>
     <Toggle checked={engines.channelIntelligence} onChange={e("channelIntelligence")} label="Channel Intelligence" detail="Durable channel patterns, validated learnings and outcome history."/>
     <Toggle checked={engines.anomalyIntelligence} onChange={e("anomalyIntelligence")} label="Signal / Anomaly Intelligence" detail="Allow already-detected material anomalies into Brain decision context."/>
     <Toggle checked={engines.opportunityIntelligence} onChange={e("opportunityIntelligence")} label="Opportunity Intelligence" detail="Allow non-anomaly strategic openings into recommendation ranking."/>
     <Toggle checked={engines.algorithmPriming} onChange={e("algorithmPriming")} label="Algorithm Priming + Momentum" detail="Prepare PRE_LAUNCH, LAUNCH, EARLY_POST_LAUNCH, SUSTAIN and LEARN plans."/>
     <Toggle checked={engines.videoPackages} onChange={e("videoPackages")} label="Video Package access" detail="Expose matching Vault package artifacts to Brain context."/>
    </Card>
    <Card title="Evidence + Safety" icon={LockKeyhole} color={palette[0]}>
     <Toggle checked={engines.autoLoadEvidence} onChange={e("autoLoadEvidence")} label="Auto-load evidence" detail="Attach bounded relevant evidence to Brain turns automatically."/>
     <Toggle checked={policy.externalActionsRequireApproval} onChange={p("externalActionsRequireApproval")} label="Require approval for external actions" detail="Recommended: no publishing/write handoff can execute without creator approval."/>
     <Toggle checked={policy.contributeDeidentifiedResearch} onChange={p("contributeDeidentifiedResearch")} label="De-identified research contribution" detail="Optional; disabled by default."/>
     <label className="block py-2"><span className="text-[10px] font-[1000] uppercase">Max evidence items · {engines.maxEvidenceItems}</span><input className="mt-2 w-full accent-black" type="range" min="3" max="30" value={engines.maxEvidenceItems} onChange={x=>setEngines(v=>({...v,maxEvidenceItems:+x.target.value}))}/></label>
     <label className="block py-2"><span className="text-[10px] font-[1000] uppercase">Anomaly minimum impact · {engines.anomalyMinimumImpact.toFixed(2)}</span><input className="mt-2 w-full accent-black" type="range" min="0" max="1" step=".05" value={engines.anomalyMinimumImpact} onChange={x=>setEngines(v=>({...v,anomalyMinimumImpact:+x.target.value}))}/></label>
     <label className="block py-2"><span className="text-[10px] font-[1000] uppercase">Anomaly confidence · {engines.anomalyMinimumConfidence.toFixed(2)}</span><input className="mt-2 w-full accent-black" type="range" min="0" max="1" step=".05" value={engines.anomalyMinimumConfidence} onChange={x=>setEngines(v=>({...v,anomalyMinimumConfidence:+x.target.value}))}/></label>
    </Card>
   </div>
   <section className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
    {[{i:Gauge,l:"Channel",v:engines.channelIntelligence},{i:Radar,l:"Anomalies",v:engines.anomalyIntelligence},{i:Target,l:"Priming",v:engines.algorithmPriming},{i:Package,l:"Packages",v:engines.videoPackages}].map(({i:Icon,l,v},n)=><div key={l} className="rounded-[9px] border-2 border-black p-3" style={{background:v?palette[n+3]:"#eee"}}><Icon size={16}/><strong className="mt-2 block text-[9px] font-[1000] uppercase">{l}</strong><small className="text-[8px] font-black uppercase opacity-55">{v?"Enabled":"Disabled"}</small></div>)}
   </section>
   <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t-2 border-black/15 pt-4"><p className="max-w-2xl text-[9px] font-bold leading-4 text-black/55">Controls are creator-owned and channel-scoped. Algorithm Intelligence remains read/reason/prepare by default; PR #79 handoffs preserve explicit approval boundaries for external writes.</p><button onClick={reset} className="inline-flex items-center gap-1 rounded-[7px] border-2 border-black bg-white px-3 py-2 text-[9px] font-[1000] uppercase"><RotateCcw size={12}/>Reset channel overrides</button></footer>
  </div>
 </main>
}
