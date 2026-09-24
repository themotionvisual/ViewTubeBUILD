import React, { useMemo } from "react"
import { CheckCircle2, Send, ShieldCheck } from "lucide-react"
import { SubToolbox } from "../Toolbox"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxButton, SubToolboxOutputCard, SubToolboxStatePanel } from "../subtoolbox/SubToolboxPrimitives"
import { listVideoPackages } from "../../services/video-package/VideoPackageRepository"
import { projectPublishingPackage } from "../../services/asset-engine/PublishingPackageProjection"
import { listPublishTransactions } from "../../services/asset-engine/PublishTransaction"

export const StudioPublishingCockpit:React.FC=()=>{
 const state=useMemo(()=>{
  const videoPackage=listVideoPackages()[0]||null
  if(!videoPackage)return {videoPackage:null,projection:null,transaction:null}
  try{
   const projection=projectPublishingPackage(videoPackage)
   return {videoPackage,projection,transaction:listPublishTransactions(projection.contentBuildId)[0]||null}
  }catch{return {videoPackage,projection:null,transaction:null}}
 },[])
 const p=state.projection
 if(!p)return <SubToolbox title="Publishing Package" icon={<Send size={20}/>} collapsible isOpenInitial><SubToolboxStatePanel state="empty" message="No canonical Video Package is ready for publishing yet." /></SubToolbox>
 const completed=state.transaction?Object.values(state.transaction.steps).filter(step=>step?.status==="completed").length:0
 return <SubToolbox title="Publishing Package" icon={<Send size={20}/>} collapsible isOpenInitial>
  <SubToolboxStack density="comfortable">
   <SubToolboxGrid minItemWidth="compact">
    <SubToolboxOutputCard title="READINESS" icon={<ShieldCheck size={18}/>}>
     <strong>{p.ready?"READY TO PUBLISH":p.missing.length+" REQUIREMENTS"}</strong>
     <div>{p.ready?"Canonical assets + approval are ready.":p.missing.join(" · ")}</div>
    </SubToolboxOutputCard>
    <SubToolboxOutputCard title="TRANSACTION" icon={<CheckCircle2 size={18}/>}>
     <strong>{state.transaction?.status.toUpperCase()||"NOT STARTED"}</strong>
     <div>{state.transaction?completed+"/10 STEPS COMPLETE":"Resumable publishing has not started."}</div>
    </SubToolboxOutputCard>
   </SubToolboxGrid>
   <SubToolboxOutputCard title="LOCKED / CANONICAL ASSETS">
    <div>TITLE · {p.titleAssetId||"MISSING"}</div>
    <div>THUMBNAIL · {p.thumbnailAssetId||"MISSING"}</div>
    <div>RENDER · {p.finalRenderAssetId||"MISSING"}</div>
    <div>DESCRIPTION · {p.descriptionAssetId||"MISSING"}</div>
   </SubToolboxOutputCard>
   <SubToolboxActions columns={2}>
    <SubToolboxButton tone={p.ready?"success":"warning"} onClick={()=>{window.location.href="/video-publisher"}}>
     {state.transaction?"RESUME PUBLISHING":p.ready?"OPEN PUBLISHER":"FIX PACKAGE"}
    </SubToolboxButton>
    <SubToolboxButton tone="neutral" onClick={()=>{window.location.href="/projects"}}>OPEN PROJECT</SubToolboxButton>
   </SubToolboxActions>
  </SubToolboxStack>
 </SubToolbox>
}
export default StudioPublishingCockpit
