import React from "react"
import { Image as ImageIcon, Images, PackageOpen, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Project } from "../../types"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxButton, SubToolboxInput, SubToolboxMediaCard, SubToolboxStatePanel } from "../subtoolbox/SubToolboxPrimitives"

const ProjectPackagingSubtoolbox:React.FC<{
 project:Project
 onUpdate:(updates:Partial<Project>)=>void
}> = ({project,onUpdate}) => {
 const navigate=useNavigate()
 const hasThumbnail=Boolean(project.thumbnailUrl)

 return <SubToolbox
  title="PACKAGING"
  subtitle="Thumbnail and packaging entry point for this project"
  icon={<Images/>}
  collapsible
  isOpenInitial
  openUnits={4}
 >
  <SubToolboxStack density="comfortable">
   <SubToolboxSection label="Current thumbnail">
    {hasThumbnail?(
     <SubToolboxMediaCard
      title={project.videoTitle||project.name}
      meta="Current project thumbnail"
      preview={<img src={project.thumbnailUrl} alt="" className="h-full w-full object-cover" />}
      trailing={<ImageIcon size={16}/>}
      onClick={()=>navigate("/thumbnail-studio")}
     />
    ):(
     <SubToolboxStatePanel state="empty" message="No thumbnail has been selected for this project yet." />
    )}
   </SubToolboxSection>

   <SubToolboxSection label="Thumbnail asset reference">
    <SubToolboxInput
     value={project.thumbnailUrl||""}
     onChange={event=>onUpdate({thumbnailUrl:event.target.value})}
     placeholder="Paste or hand off a thumbnail asset reference…"
     aria-label="Thumbnail asset reference"
    />
   </SubToolboxSection>

   <SubToolboxGrid minItemWidth="compact" density="dense">
    <SubToolboxButton tone="accent" icon={<Images size={16}/>} onClick={()=>navigate("/thumbnail-studio")}>Open Thumbnail Studio</SubToolboxButton>
    <SubToolboxButton tone="neutral" icon={<PackageOpen size={16}/>} onClick={()=>navigate("/vault")}>Open Vault</SubToolboxButton>
    {hasThumbnail?<SubToolboxButton tone="danger" icon={<Trash2 size={16}/>} onClick={()=>onUpdate({thumbnailUrl:""})}>Clear Thumbnail</SubToolboxButton>:null}
   </SubToolboxGrid>
  </SubToolboxStack>
 </SubToolbox>
}

export default ProjectPackagingSubtoolbox
