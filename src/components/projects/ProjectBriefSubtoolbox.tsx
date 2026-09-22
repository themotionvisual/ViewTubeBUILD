import React from "react"
import { Compass, Sparkles } from "lucide-react"
import type { Project } from "../../types"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxInput, SubToolboxTextArea } from "../subtoolbox/SubToolboxPrimitives"

const ProjectBriefSubtoolbox:React.FC<{
 project:Project
 targetNiche?:string
 onUpdate:(updates:Partial<Project>)=>void
}> = ({project,targetNiche,onUpdate}) => {
 const patchPlan=(field:string,value:string)=>onUpdate({
  plan:{
   concept:project.plan?.concept||project.concept||"",
   niche:project.plan?.niche||project.niche||targetNiche||"",
   ...(project.plan||{}),
   [field]:value,
  },
 })
 const plan=project.plan||{concept:"",niche:""}

 return <SubToolbox
  title="PROJECT BRIEF"
  subtitle="What the video is, who it is for, and what it must accomplish"
  icon={<Compass/>}
  collapsible
  isOpenInitial
  openUnits={5}
 >
  <SubToolboxStack density="comfortable">
   <SubToolboxSection label="Core idea">
    <SubToolboxTextArea
     height="compact"
     value={project.concept||plan.concept||""}
     onChange={event=>{
      onUpdate({concept:event.target.value})
      patchPlan("concept",event.target.value)
     }}
     placeholder="The central subject, story, problem or idea…"
    />
   </SubToolboxSection>

   <SubToolboxGrid minItemWidth="wide" density="dense">
    <SubToolboxSection label="Audience promise">
     <SubToolboxInput value={String(plan.audiencePromise||plan.promise||"")} onChange={event=>patchPlan("audiencePromise",event.target.value)} placeholder="What will the viewer understand, feel or gain?" />
    </SubToolboxSection>
    <SubToolboxSection label="Target audience">
     <SubToolboxInput value={String(plan.targetAudience||plan.audience||"")} onChange={event=>patchPlan("targetAudience",event.target.value)} placeholder="Who is this specifically for?" />
    </SubToolboxSection>
    <SubToolboxSection label="Creator goal">
     <SubToolboxInput value={String(plan.creatorGoal||plan.goal||"")} onChange={event=>patchPlan("creatorGoal",event.target.value)} placeholder="What should this project accomplish?" />
    </SubToolboxSection>
    <SubToolboxSection label="Hook / angle">
     <SubToolboxInput value={String(plan.hook||plan.angle||"")} onChange={event=>patchPlan("hook",event.target.value)} placeholder="Opening angle or core curiosity…" />
    </SubToolboxSection>
   </SubToolboxGrid>

   <SubToolboxGrid minItemWidth="wide" density="dense">
    <SubToolboxSection label="Visual style">
     <SubToolboxInput value={String(plan.visualStyle||plan.style?.visualStyle||"")} onChange={event=>patchPlan("visualStyle",event.target.value)} placeholder="Visual language, references, texture…" />
    </SubToolboxSection>
    <SubToolboxSection label="Narrative style">
     <SubToolboxInput value={String(plan.narrativeStyle||plan.style?.narrativeStyle||"")} onChange={event=>patchPlan("narrativeStyle",event.target.value)} placeholder="Voice, structure, point of view…" />
    </SubToolboxSection>
   </SubToolboxGrid>

   <div className="flex items-center gap-2 text-[9px] font-black uppercase opacity-50">
    <Sparkles size={13}/> These fields sync into the ContentBuild profile and follow the project into connected Studio tools.
   </div>
  </SubToolboxStack>
 </SubToolbox>
}

export default ProjectBriefSubtoolbox
