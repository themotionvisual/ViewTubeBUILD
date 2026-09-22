import React from "react"
import { BarChart3, Boxes, Clapperboard, FileText, Lightbulb, Rocket, Search, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Project } from "../../types"
import { getContentBuild } from "../../services/asset-engine/ContentBuildRepository"
import { SubToolboxGrid, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxBadge, SubToolboxButton, SubToolboxSurface } from "../subtoolbox/SubToolboxPrimitives"

type StageCard={
 id:string
 title:string
 subtitle:string
 route:string
 icon:React.ElementType
 ready:(project:Project)=>boolean
}

const STAGES:StageCard[]=[
 {id:"idea",title:"Idea + Strategy",subtitle:"Concept, audience promise and production intent",route:"/projects",icon:Lightbulb,ready:p=>Boolean(p.concept||p.plan?.concept)},
 {id:"research",title:"Research",subtitle:"Evidence, references and source material",route:"/research-lab",icon:Search,ready:p=>(p.plan?.references?.length||0)>0},
 {id:"script",title:"Script + Story",subtitle:"Narrative, script and storyboard structure",route:"/script-architect",icon:FileText,ready:p=>Boolean(p.script?.trim())},
 {id:"production",title:"Production",subtitle:"Storyboard, media, audio and editor handoff",route:"/storyboard-studio",icon:Clapperboard,ready:p=>(p.storyboard?.length||0)>0},
 {id:"package",title:"Packaging",subtitle:"Title, thumbnail and discovery package",route:"/thumbnail-studio",icon:Boxes,ready:p=>Boolean(p.videoTitle&&p.thumbnailUrl)},
 {id:"publish",title:"Publish",subtitle:"Metadata, schedule, readiness and launch",route:"/video-publisher",icon:Rocket,ready:p=>Boolean(p.publishDate&&p.description&&p.tags)},
 {id:"learn",title:"Performance",subtitle:"Analytics, outcomes and reusable learning",route:"/analytics",icon:BarChart3,ready:p=>["published","completed"].includes(String(p.status))},
]

const ProjectAssetEngineSimple:React.FC<{project:Project}> = ({project}) => {
 const navigate=useNavigate()
 const build=project.contentBuildId?getContentBuild(project.contentBuildId):null

 return <SubToolboxStack density="comfortable">
  <div className="flex flex-wrap gap-2">
   <SubToolboxBadge>{build?.assetIds.length||0} assets</SubToolboxBadge>
   <SubToolboxBadge>{build?.relations.length||0} relations</SubToolboxBadge>
   <SubToolboxBadge>{build?.stage||"idea"}</SubToolboxBadge>
   <SubToolboxBadge>revision {build?.revision||1}</SubToolboxBadge>
  </div>

  <SubToolboxGrid minItemWidth="wide" density="dense">
   {STAGES.map(stage=>{
    const Icon=stage.icon
    const ready=stage.ready(project)
    return <SubToolboxSurface key={stage.id} tone={ready?"accent":"subtle"}>
     <div className="grid gap-3 p-2">
      <div className="flex items-start justify-between gap-3">
       <div className="flex min-w-0 items-start gap-3">
        <Icon size={22} className="shrink-0"/>
        <div className="min-w-0">
         <div className="text-[13px] font-[1000] uppercase leading-none">{stage.title}</div>
         <div className="mt-1 text-[9px] font-bold leading-snug opacity-55">{stage.subtitle}</div>
        </div>
       </div>
       <SubToolboxBadge>{ready?"READY":"NEXT"}</SubToolboxBadge>
      </div>
      <SubToolboxButton
       size="compact"
       tone={ready?"neutral":"accent"}
       icon={ready?<Sparkles size={14}/>:<Icon size={14}/>}
       onClick={()=>navigate(stage.route)}
      >
       {ready?"Review / Continue":"Open Stage"}
      </SubToolboxButton>
     </div>
    </SubToolboxSurface>
   })}
  </SubToolboxGrid>
 </SubToolboxStack>
}

export default ProjectAssetEngineSimple
