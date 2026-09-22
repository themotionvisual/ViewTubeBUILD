import React, { useMemo } from "react"
import { Activity, Boxes, CalendarDays, Layers3 } from "lucide-react"
import type { Project } from "../../types"
import { getContentBuild } from "../../services/asset-engine/ContentBuildRepository"
import { findVideoPackageByProject } from "../../services/video-package/VideoPackageRepository"
import type { ContentBuildStage } from "../../services/asset-engine/contracts"
import { SubToolboxGrid } from "../subtoolbox/SubToolboxLayouts"
import {
  SubToolboxBadge,
  SubToolboxProgressValue,
  SubToolboxStatCard,
  SubToolboxStepIndicator,
  SubToolboxSurface,
} from "../subtoolbox/SubToolboxPrimitives"

const STEP_STAGE: Array<{ label:string; stages:ContentBuildStage[] }> = [
 { label:"Idea", stages:["idea","research","concept","outline"] },
 { label:"Script", stages:["script","storyboard"] },
 { label:"Produce", stages:["media","edit"] },
 { label:"Package", stages:["package","review"] },
 { label:"Publish", stages:["scheduled","published","launch"] },
 { label:"Learn", stages:["monitor","evaluation","learning","archived"] },
]

const completionFor=(project:Project)=>{
 const checks=[
  project.concept||project.plan?.concept,
  project.videoTitle,
  project.script,
  project.thumbnailUrl,
  project.description,
  project.tags,
  project.publishDate,
  (project.tasks||[]).length>0,
 ]
 const complete=checks.filter(Boolean).length
 return {complete,total:checks.length,percent:Math.round((complete/checks.length)*100)}
}

const ProjectBuildCommand:React.FC<{project:Project}> = ({project}) => {
 const build=project.contentBuildId?getContentBuild(project.contentBuildId):null
 const videoPackage=findVideoPackageByProject(project.id,project.contentBuildId||null)
 const completion=completionFor(project)
 const activeIndex=useMemo(()=>{
  const stage=build?.stage||"idea"
  const found=STEP_STAGE.findIndex(step=>step.stages.includes(stage))
  return found<0?0:found
 },[build?.stage])

 return <SubToolboxSurface tone="subtle">
  <div className="grid gap-3 p-3">
   <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
     <div className="text-[24px] font-[1000] uppercase leading-[.9] tracking-[-.045em]">{project.videoTitle||project.name}</div>
     <div className="mt-2 flex flex-wrap gap-2">
      <SubToolboxBadge>{String(project.status||"ideation").replaceAll("-"," ")}</SubToolboxBadge>
      <SubToolboxBadge>{build?.stage||"idea"}</SubToolboxBadge>
      <SubToolboxBadge>{project.contentBuildId?"ContentBuild linked":"ContentBuild pending"}</SubToolboxBadge>
      <SubToolboxBadge>{videoPackage?"Video Package linked":"Video Package pending"}</SubToolboxBadge>
     </div>
    </div>
    <div className="min-w-[180px] flex-1 sm:max-w-[320px]">
     <SubToolboxProgressValue value={completion.percent} label="BUILD READINESS" />
    </div>
   </div>

   <SubToolboxStepIndicator
    steps={STEP_STAGE.map((step,index)=>({
     label:step.label,
     state:index<activeIndex?"complete":index===activeIndex?"active":"upcoming",
    }))}
   />

   <SubToolboxGrid minItemWidth="compact" density="dense">
    <SubToolboxStatCard label="PROJECT" value={project.name} delta={<Layers3 size={12}/>} />
    <SubToolboxStatCard label="ASSETS" value={build?.assetIds.length||0} delta={<Boxes size={12}/>} />
    <SubToolboxStatCard label="REVISION" value={build?.revision||1} delta={<Activity size={12}/>} />
    <SubToolboxStatCard label="PUBLISH" value={project.publishDate||"UNSCHEDULED"} delta={<CalendarDays size={12}/>} />
   </SubToolboxGrid>
  </div>
 </SubToolboxSurface>
}

export default ProjectBuildCommand
