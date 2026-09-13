import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
 Archive, BookOpen, Boxes, ChevronDown, Clapperboard, FileText, Image,
 Lightbulb, Mic2, PackageCheck, Search, Sparkles,
} from "lucide-react"
import { useBrain } from "../../context/useBrain"
import type { Project } from "../../types"

const PALETTE=["#ff5c5c","#ff8a3d","#ffcf4a","#b8e04b","#56d88a","#42d6c7","#58b8ff","#7187ff","#9b72ff","#d56bff"]

type SectionState={count:number;status:string;route?:string;detail:string}
type SectionDescriptor={id:string;title:string;subtitle:string;icon:React.ElementType;derive:(project:Project,brain:any)=>SectionState}

const hasText=(value:unknown)=>typeof value==="string"&&value.trim().length>0
const truthyCount=(values:unknown[])=>values.filter(value=>Array.isArray(value)?value.length>0:hasText(value)||Boolean(value)).length
const statusFor=(count:number,readyAt=1)=>count>=readyAt?"READY":count>0?"IN PROGRESS":"EMPTY"

const SECTIONS:SectionDescriptor[]=[
 {id:"concept",title:"Concept & Brief",subtitle:"Promise, angle, audience and production objective",icon:Lightbulb,derive:p=>{const count=truthyCount([p.concept,p.plan?.concept,p.niche,p.plan?.niche,p.plan?.audience,p.plan?.hook]);return{count,status:statusFor(count,3),route:"/projects",detail:"Project concept, niche, audience, hook and planning brief."}}},
 {id:"research",title:"Research & Evidence",subtitle:"Sources, claims, notes and evidence connections",icon:Search,derive:(p,b)=>{const projectEvidence=Array.isArray(p.plan?.references)?p.plan.references.length:0;const research=Array.isArray(b.researchLabState?.results)?b.researchLabState.results.length:0;const count=projectEvidence+research;return{count,status:statusFor(count),route:"/research-lab",detail:"Research Lab results and project-linked references available to this build."}}},
 {id:"script",title:"Script",subtitle:"Hook, sections, narration and revisions",icon:FileText,derive:p=>{const count=hasText(p.script)?1:0;return{count,status:statusFor(count),route:"/script-architect",detail:count?"Project script is attached to this content build.":"No project script is attached yet."}}},
 {id:"storyboard",title:"Storyboard & Visual Plan",subtitle:"Scenes, shot direction and visual structure",icon:Clapperboard,derive:p=>{const count=Array.isArray(p.storyboard)?p.storyboard.length:0;return{count,status:statusFor(count),route:"/storyboard-studio",detail:count?`${count} storyboard scene${count===1?"":"s"} attached to this project.`:"No storyboard scenes are attached yet."}}},
 {id:"media",title:"Media Assets",subtitle:"Images, video, graphics and generated media",icon:Image,derive:p=>{const sceneMedia=(p.storyboard||[]).filter(scene=>hasText(scene.imageUrl)).length;const count=sceneMedia+(hasText(p.thumbnailUrl)?1:0);return{count,status:statusFor(count),route:"/vault",detail:"Canonical media remains owned by Vault; this section reports project-linked media."}}},
 {id:"audio",title:"Audio",subtitle:"Voice, music, sound effects and mix assets",icon:Mic2,derive:p=>{const count=(p.storyboard||[]).filter(scene=>hasText(scene.voiceoverUrl)).length;return{count,status:statusFor(count),route:"/vault",detail:"Voiceover and audio assets linked through project scenes and Vault."}}},
 {id:"packaging",title:"Packaging",subtitle:"Titles, thumbnails, description and experiments",icon:Boxes,derive:(p,b)=>{const count=truthyCount([p.videoTitle,p.thumbnailUrl,p.description,p.tags,b.seoState?.winningTitle,b.seoState?.descriptionDraft]);return{count,status:statusFor(count,3),route:"/thumbnail-studio",detail:"Title, thumbnail, description and tag packaging for this build."}}},
 {id:"edit",title:"Edit & Timeline",subtitle:"Editor handoff, sequence state and render package",icon:Sparkles,derive:p=>{const count=(p.storyboard||[]).length>0||hasText(p.script)?1:0;return{count,status:count?"READY FOR HANDOFF":"EMPTY",route:"/editor",detail:"Open the editor with this project as the production context."}}},
 {id:"publishing",title:"Publishing Package",subtitle:"Metadata, schedule, checks and final handoff",icon:PackageCheck,derive:p=>{const count=truthyCount([p.publishDate,p.videoTitle,p.description,p.tags]);return{count,status:statusFor(count,4),route:"/video-publisher",detail:"Publishing metadata and schedule readiness derived from the project."}}},
 {id:"learning",title:"Performance & Learning",subtitle:"Post-publish evidence, findings and reusable lessons",icon:BookOpen,derive:(p,b)=>{const count=Array.isArray(b.channelyticsState?.topPerformers)?b.channelyticsState.topPerformers.length:0;return{count,status:count?"CONNECTED":"WAITING",route:"/channelytics",detail:"Performance evidence remains analytics-owned and can feed learning back into the build."}}},
]

const ContentAssetEngine:React.FC=()=>{
 const {brain}=useBrain()
 const navigate=useNavigate()
 const projects=Array.isArray(brain.projects)?brain.projects:[]
 const [buildId,setBuildId]=useState<string>(brain.activeProjectId||projects[0]?.id||"")
 const [open,setOpen]=useState<string|null>("concept")

 useEffect(()=>{
  if(buildId&&projects.some(project=>project.id===buildId))return
  setBuildId(brain.activeProjectId||projects[0]?.id||"")
 },[brain.activeProjectId,buildId,projects])

 const build=useMemo(()=>projects.find(project=>project.id===buildId)||null,[buildId,projects])
 const sectionStates=useMemo(()=>build?SECTIONS.map(section=>({...section,state:section.derive(build,brain)})):[],[brain,build])
 const completeSections=sectionStates.filter(section=>section.state.status==="READY"||section.state.status==="CONNECTED"||section.state.status==="READY FOR HANDOFF").length
 const progress=sectionStates.length?Math.round((completeSections/sectionStates.length)*100):0

 if(!build)return <div className="p-4 sm:p-5"><div className="border-[3px] border-black bg-white p-6 text-center"><Archive className="mx-auto mb-3" size={32}/><strong className="block text-sm font-black uppercase">No Content Builds Yet</strong><p className="mt-2 text-[10px] font-bold uppercase opacity-60">Create a project in Project Studio. Projects are the canonical content builds used by the Asset Engine.</p><button type="button" onClick={()=>navigate("/projects")} className="mt-4 min-h-10 border-[3px] border-black bg-white px-4 text-[10px] font-black uppercase shadow-[4px_4px_0_rgba(0,0,0,.25)]">Open Project Studio</button></div></div>

 return <div className="grid gap-4 p-4 sm:p-5">
  <div className="grid gap-3 border-[3px] border-black bg-white p-3 lg:grid-cols-[minmax(0,1fr)_220px]">
   <div><div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em]"><Archive size={15}/><span>Active Content Build</span></div><div className="relative"><select value={buildId} onChange={e=>setBuildId(e.target.value)} className="h-12 w-full appearance-none border-[3px] border-black bg-white px-3 pr-10 text-sm font-black uppercase">{projects.map(project=><option key={project.id} value={project.id}>{project.videoTitle||project.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={20}/></div></div>
   <div className="flex flex-col justify-end"><div className="mb-1 flex justify-between text-[9px] font-black uppercase"><span>{build.status||"PROJECT"}</span><span>{progress}% pipeline ready</span></div><div className="h-4 border-2 border-black bg-white"><div className="h-full bg-black" style={{width:`${progress}%`}}/></div></div>
  </div>
  <div className="grid gap-3 md:grid-cols-2">{sectionStates.map((section,index)=>{const Icon=section.icon;const isOpen=open===section.id;const color=PALETTE[index%PALETTE.length];return <section key={section.id} className="overflow-hidden border-[3px] border-black bg-white" style={{boxShadow:`4px 4px 0 ${color}80`}}><button type="button" onClick={()=>setOpen(isOpen?null:section.id)} className="grid min-h-[64px] w-full grid-cols-[58px_minmax(0,1fr)_auto] items-stretch text-left"><span className="grid aspect-square place-items-center border-r-[3px] border-black" style={{backgroundColor:color}}><Icon size={24}/></span><span className="flex min-w-0 flex-col justify-center px-3 py-2"><strong className="truncate text-[12px] font-black uppercase">{section.title}</strong><span className="mt-1 truncate text-[9px] font-bold uppercase opacity-60">{section.subtitle}</span></span><span className="flex items-center gap-2 pr-3"><span className="border-2 border-black px-2 py-1 text-[8px] font-black uppercase" style={{backgroundColor:`${color}59`}}>{section.state.status}</span><span className="text-[10px] font-black">{section.state.count}</span><ChevronDown size={16} className={isOpen?"rotate-180":""}/></span></button>{isOpen&&<div className="border-t-[3px] border-black p-3"><div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>section.state.route&&navigate(section.state.route)} className="min-h-8 border-2 border-black px-2 text-[9px] font-black uppercase" style={{backgroundColor:color}}>Open Tool</button><button type="button" onClick={()=>navigate("/vault")} className="min-h-8 border-2 border-black bg-white px-2 text-[9px] font-black uppercase">Open Vault</button></div><p className="mt-3 text-[10px] font-bold opacity-70">{section.state.detail}</p></div>}</section>})}</div>
 </div>
}
export default ContentAssetEngine
