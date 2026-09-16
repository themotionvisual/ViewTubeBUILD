import React, { useState } from "react"
import { CheckSquare, Plus, Sparkles, Target } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxBadge, SubToolboxButton, SubToolboxCheckbox, SubToolboxInput, SubToolboxSelect, SubToolboxStatePanel, SubToolboxSurface } from "../subtoolbox/SubToolboxPrimitives"
import { generateProjectPlanningSuggestions, type ProjectPlanningKind, type ProjectPlanningSuggestion } from "../../services/projectPlanningIntelligence"
import type { DayTask, Project } from "../../types"

type ProjectGoal = { id:string; text:string; completed:boolean; category?:string }
const goalsOf = (project: Project): ProjectGoal[] => Array.isArray(project.plan?.projectGoals) ? project.plan!.projectGoals : []

const ProjectPlanningList: React.FC<{project:Project;kind:ProjectPlanningKind}> = ({project,kind}) => {
 const { brain, updateProject } = useBrain()
 const isTodo=kind==="todo"
 const items = isTodo ? (project.tasks||[]) : goalsOf(project)
 const [draft,setDraft]=useState("")
 const [dueDate,setDueDate]=useState(project.publishDate||"")
 const [suggestions,setSuggestions]=useState<ProjectPlanningSuggestion[]>([])
 const [generating,setGenerating]=useState(false)
 const [error,setError]=useState("")
 const save=(next:any[])=>isTodo?updateProject(project.id,{tasks:next as DayTask[]}):updateProject(project.id,{plan:{...(project.plan||{concept:project.concept||project.name,niche:project.niche||brain.targetNiche}),projectGoals:next}})
 const add=(text:string,category="Production")=>{const value=text.trim();if(!value||items.some(item=>item.text.trim().toLowerCase()===value.toLowerCase()))return;save([...items,{id:`p${isTodo?"t":"g"}-${Date.now()}`,text:value,completed:false,...(isTodo&&dueDate?{dueDate}:{}),...(!isTodo?{category}:{})}]);setDraft("")}
 const toggle=(id:string)=>save(items.map(item=>item.id===id?{...item,completed:!item.completed}:item))
 const generate=async()=>{setGenerating(true);setError("");try{const next=await generateProjectPlanningSuggestions(kind,project,brain);const existing=new Set(items.map(item=>item.text.toLowerCase()));setSuggestions(next.filter(item=>!existing.has(item.text.toLowerCase())))}catch(cause){console.error(cause);setError("AI Brain project planning could not complete.")}finally{setGenerating(false)}}
 return <SubToolbox title={isTodo?"PROJECT TO-DO LIST":"PROJECT GOALS"} subtitle={isTodo?"Tasks for this individual project; dated tasks appear on the Project Studio calendar":"Measurable outcomes for this individual project"} icon={isTodo?<CheckSquare/>:<Target/>} paletteIndex={isTodo?0:4} collapsible isOpenInitial openUnits={4}><SubToolboxStack density="comfortable">
  <SubToolboxSection label={isTodo?"Add project task":"Add project goal"}><SubToolboxStack density="dense"><SubToolboxGrid minItemWidth="wide" density="dense"><SubToolboxInput value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")add(draft)}} placeholder={isTodo?"Add a project task…":"Add a measurable project goal…"}/><SubToolboxButton tone="ink" icon={<Plus size={16}/>} onClick={()=>add(draft)}>Add</SubToolboxButton></SubToolboxGrid>{isTodo?<SubToolboxInput type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} aria-label="Project task due date"/>:null}</SubToolboxStack></SubToolboxSection>
  <SubToolboxSection label={isTodo?"Current tasks":"Current goals"}>{items.length?<SubToolboxStack density="dense">{items.map((item:any)=><SubToolboxSurface key={item.id} tone="subtle"><div className="flex items-center justify-between gap-3"><SubToolboxCheckbox checked={Boolean(item.completed)} onChange={()=>toggle(item.id)} label={<span className={item.completed?"line-through opacity-40":""}>{item.text}</span>}/><div className="flex items-center gap-2">{isTodo&&item.dueDate?<SubToolboxBadge>{item.dueDate}</SubToolboxBadge>:null}{!isTodo&&item.category?<SubToolboxBadge>{item.category}</SubToolboxBadge>:null}</div></div></SubToolboxSurface>)}</SubToolboxStack>:<SubToolboxStatePanel state="empty" message={isTodo?"No project tasks yet. Add one or generate tasks from this project's context.":"No project goals yet. Add one or generate goals from this project's context."}/>}</SubToolboxSection>
  <SubToolboxSection label="AI Brain suggestions"><SubToolboxStack density="dense"><SubToolboxButton tone="accent" icon={<Sparkles size={16}/>} disabled={generating} onClick={generate}>{generating?"Consulting AI Brain":isTodo?"Generate project tasks":"Generate project goals"}</SubToolboxButton>{generating?<SubToolboxStatePanel state="loading" message="Reading this project's plan, script, schedule and channel context…"/>:null}{error?<SubToolboxStatePanel state="error" message={error}/>:null}{suggestions.map((s,i)=><SubToolboxSurface key={`${s.text}-${i}`} tone="accent"><SubToolboxStack density="dense"><div className="flex items-center justify-between gap-2"><strong className="text-[12px] font-black uppercase">{s.text}</strong><SubToolboxBadge>{s.category}</SubToolboxBadge></div><p className="text-[10px] font-bold">{s.rationale}</p><p className="text-[9px] font-black uppercase opacity-50">Evidence: {s.evidence}</p><SubToolboxButton size="compact" tone="neutral" icon={<Plus size={14}/>} onClick={()=>{add(s.text,s.category);setSuggestions(current=>current.filter((_,index)=>index!==i))}}>Add suggestion</SubToolboxButton></SubToolboxStack></SubToolboxSurface>)}</SubToolboxStack></SubToolboxSection>
 </SubToolboxStack></SubToolbox>
}

const ProjectPlanningSubtoolboxes: React.FC = () => {
 const {brain,setActiveProject}=useBrain()
 const project=brain.projects.find(p=>p.id===brain.activeProjectId)||brain.projects[0]||null
 if(!project)return <SubToolboxStatePanel state="empty" message="Create a project in Project Studio to add project tasks and goals."/>
 return <SubToolboxStack density="comfortable"><SubToolboxSection label="Project planning target"><SubToolboxSelect value={project.id} onChange={e=>setActiveProject(e.target.value)}>{brain.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</SubToolboxSelect></SubToolboxSection><SubToolboxGrid minItemWidth="wide" density="comfortable"><ProjectPlanningList project={project} kind="todo"/><ProjectPlanningList project={project} kind="goal"/></SubToolboxGrid></SubToolboxStack>
}
export default ProjectPlanningSubtoolboxes
