import React, { useMemo, useState } from "react"
import { Archive, BookOpen, Boxes, ChevronDown, Clapperboard, FileText, Image, Lightbulb, Mic2, PackageCheck, Search, Sparkles } from "lucide-react"

const PALETTE=["#ff5c5c","#ff8a3d","#ffcf4a","#b8e04b","#56d88a","#42d6c7","#58b8ff","#7187ff","#9b72ff","#d56bff","#ff6fcf","#ff73a1"]
const BUILDS=[{id:"current",title:"Current Content Build",kind:"VIDEO",progress:64},{id:"next",title:"Next Content Build",kind:"VIDEO",progress:28},{id:"idea",title:"Idea / Research Build",kind:"CONCEPT",progress:12}]
const SECTIONS=[
 {title:"Concept & Brief",subtitle:"Promise, angle, audience and production objective",icon:Lightbulb,status:"READY",count:4},
 {title:"Research & Evidence",subtitle:"Sources, claims, notes and evidence connections",icon:Search,status:"IN PROGRESS",count:12},
 {title:"Script",subtitle:"Hook, sections, narration and revisions",icon:FileText,status:"IN PROGRESS",count:7},
 {title:"Storyboard & Visual Plan",subtitle:"Scenes, shot direction and visual structure",icon:Clapperboard,status:"BUILDING",count:18},
 {title:"Media Assets",subtitle:"Images, video, graphics and generated media",icon:Image,status:"CONNECTED",count:26},
 {title:"Audio",subtitle:"Voice, music, sound effects and mix assets",icon:Mic2,status:"PLANNED",count:5},
 {title:"Packaging",subtitle:"Titles, thumbnails, description and experiments",icon:Boxes,status:"DRAFT",count:9},
 {title:"Edit & Timeline",subtitle:"Editor handoff, sequence state and render package",icon:Sparkles,status:"PLANNED",count:3},
 {title:"Publishing Package",subtitle:"Metadata, schedule, checks and final handoff",icon:PackageCheck,status:"BLOCKED",count:6},
 {title:"Performance & Learning",subtitle:"Post-publish evidence, findings and reusable lessons",icon:BookOpen,status:"WAITING",count:0},
]

const ContentAssetEngine:React.FC=()=>{
 const [buildId,setBuildId]=useState(BUILDS[0].id)
 const [open,setOpen]=useState<string|null>(SECTIONS[0].title)
 const build=useMemo(()=>BUILDS.find(item=>item.id===buildId)??BUILDS[0],[buildId])
 return <div className="grid gap-4 p-4 sm:p-5">
  <div className="grid gap-3 border-[3px] border-black bg-white p-3 lg:grid-cols-[minmax(0,1fr)_220px]">
   <div><div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em]"><Archive size={15}/><span>Active Content Build</span></div><div className="relative"><select value={buildId} onChange={e=>setBuildId(e.target.value)} className="h-12 w-full appearance-none border-[3px] border-black bg-white px-3 pr-10 text-sm font-black uppercase"><>{BUILDS.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={20}/></div></div>
   <div className="flex flex-col justify-end"><div className="mb-1 flex justify-between text-[9px] font-black uppercase"><span>{build.kind}</span><span>{build.progress}% complete</span></div><div className="h-4 border-2 border-black bg-white"><div className="h-full bg-black" style={{width:`${build.progress}%`}}/></div></div>
  </div>
  <div className="grid gap-3 md:grid-cols-2">{SECTIONS.map((section,index)=>{const Icon=section.icon;const isOpen=open===section.title;const color=PALETTE[index%PALETTE.length];return <section key={section.title} className="overflow-hidden border-[3px] border-black bg-white" style={{boxShadow:`4px 4px 0 ${color}80`}}><button type="button" onClick={()=>setOpen(isOpen?null:section.title)} className="grid min-h-[64px] w-full grid-cols-[58px_minmax(0,1fr)_auto] items-stretch text-left"><span className="grid aspect-square place-items-center border-r-[3px] border-black" style={{backgroundColor:color}}><Icon size={24}/></span><span className="flex min-w-0 flex-col justify-center px-3 py-2"><strong className="truncate text-[12px] font-black uppercase">{section.title}</strong><span className="mt-1 truncate text-[9px] font-bold uppercase opacity-60">{section.subtitle}</span></span><span className="flex items-center gap-2 pr-3"><span className="border-2 border-black px-2 py-1 text-[8px] font-black uppercase" style={{backgroundColor:`${color}59`}}>{section.status}</span><span className="text-[10px] font-black">{section.count}</span><ChevronDown size={16} className={isOpen?"rotate-180":""}/></span></button>{isOpen&&<div className="border-t-[3px] border-black p-3"><div className="grid grid-cols-3 gap-2">{["Open","Assets","Handoff"].map((label,i)=><button key={label} className="min-h-8 border-2 border-black px-2 text-[9px] font-black uppercase" style={{backgroundColor:i===0?color:"white"}}>{label}</button>)}</div><p className="mt-3 text-[10px] font-bold opacity-70">{section.title} for <strong>{build.title}</strong>. Project, Vault and tool handoffs attach here without duplicating canonical assets.</p></div>}</section>})}</div>
 </div>
}
export default ContentAssetEngine
