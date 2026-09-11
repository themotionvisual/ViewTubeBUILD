import React from "react"
import type { BrainRankedChain } from "../services/brainAdaptiveOrchestrator"

type Props={ recommendation:BrainRankedChain|null; alternatives?:BrainRankedChain[]; onStart?:(chain:BrainRankedChain)=>void }
export const BrainWorkflowRecommendation:React.FC<Props>=({recommendation,alternatives=[],onStart})=>{
 if(!recommendation)return null
 return <section style={{border:"3px solid #000",borderRadius:14,overflow:"hidden",background:"#fff",boxShadow:"5px 5px 0 #000"}}>
  <header style={{padding:"12px 14px",background:"#b7f52a",borderBottom:"3px solid #000",fontWeight:1000}}>WHY VIEWTUBE CHOSE THIS WORKFLOW</header>
  <div style={{padding:14}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"start"}}><div><strong style={{fontSize:18}}>{recommendation.title}</strong><div style={{fontSize:12,fontWeight:800,marginTop:4}}>EXPECTED OUTCOME: {recommendation.outcome}</div></div><div style={{border:"2px solid #000",borderRadius:8,padding:"5px 8px",fontWeight:1000}}>{recommendation.score}/100</div></div>
   <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:12}}>{recommendation.steps.map((step,i)=><span key={`${step.toolId}-${i}`} style={{border:"2px solid #000",borderRadius:8,padding:"6px 8px",fontWeight:900,background:i%2?"#36e0f6":"#ffda47"}}>{i+1}. {step.label}{step.optional?" (OPTIONAL)":""}</span>)}</div>
   <ul style={{paddingLeft:20,fontSize:13,fontWeight:800}}>{recommendation.reasons.map((reason,i)=><li key={i}>{reason}</li>)}</ul>
   {onStart&&<button onClick={()=>onStart(recommendation)} style={{border:"3px solid #000",borderRadius:9,background:"#fa618a",padding:"9px 12px",fontWeight:1000,boxShadow:"3px 3px 0 #000"}}>START WORKFLOW</button>}
   {alternatives.length>0&&<details style={{marginTop:12}}><summary style={{fontWeight:900,cursor:"pointer"}}>ALTERNATIVES ({alternatives.length})</summary>{alternatives.map(chain=><div key={chain.chainId} style={{padding:"8px 0",borderTop:"1px solid #bbb",fontWeight:800}}>{chain.title} — {chain.score}/100</div>)}</details>}
  </div>
 </section>
}

export default BrainWorkflowRecommendation
