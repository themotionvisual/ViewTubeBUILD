import React, { useMemo, useState } from "react"
import { Activity, Boxes, Database, Layers, ListChecks, Share2, Zap, type LucideIcon } from "lucide-react"
import { AssistantCommandContextBanner } from "../../components/AssistantCommandContextBanner"
import BrainLiveToolInbox from "../../components/brain/BrainLiveToolInbox"
import { PostActionReflection } from "../../components/PostActionReflection"
import {
 StandardTextArea,
 SubToolbox,
 SubToolboxGridActionButton,
 ToolboxScaffold,
} from "../../components/Toolbox"
import { useBrain } from "../../context/useBrain"
import { createGenerationRecord, listGenerationRecords, updateGenerationRecord } from "../../services/generationStore"
import { listSuperToolsByIds } from "../../services/superToolRegistry"
import { ingestGenerationArtifacts } from "../../services/vaultAdapter"
import { createWorkflowChain, createWorkflowStep, listWorkflowChains } from "../../services/workflowEngine"
import { attachAssetToContentBuild } from "../../services/asset-engine/ContentBuildRepository"
import {
 recordContentBuildToolInput,
 recordContentBuildToolOutput,
 resolveWorkspaceContentBuildToolContext,
} from "../../services/asset-engine/ToolContext"
import type { GenerationArtifact, SuperToolId, SuperToolSurface } from "../../types"
import SuperToolPrototypeWorkspace, { type PrototypeWorkspaceConfig } from "./SuperToolPrototypeWorkspace"

type ToolModuleCard={id?:string;title:string;body:string;purpose?:string;controls?:string[];outputKind?:string;integrations?:string[];selfImprovementSignal?:string;tone:string;icon:LucideIcon}
type ToolMode={id:string;label:string;description:string}
type ToolMetricCard={label:string;value:string;icon:LucideIcon;tone:string}
type WorkflowSeed={title:string;surface:SuperToolSurface;toolId:SuperToolId;details:string}
export interface InternalWorkbenchConfig {toolId:SuperToolId;toolNumber:string;title:string;subtitle:string;railTitle:string;railSubtitle:string;railNote:string;accentClassName:string;heroShadowClassName:string;modeLabel:string;sourceLabel:string;sourcePlaceholder:string;objectiveLabel:string;objectivePlaceholder:string;notesLabel:string;notesPlaceholder:string;modules:ToolModuleCard[];prototype?:PrototypeWorkspaceConfig;modes:ToolMode[];metrics:ToolMetricCard[];sisterToolIds:SuperToolId[];outputLanes:Array<{label:string;value:string}>;buildPacket:(input:{source:string;objective:string;notes:string;mode:ToolMode;brainContext:any;workflowCount:number})=>{title:string;summary:string;packet:Record<string,unknown>;workflowTitle:string;workflowGoal:string;workflowSteps:WorkflowSeed[]}}

/**
 * Shell for the internal super-tools that are config-only (seven of them).
 *
 * The config contract is unchanged; only the chrome moved. These used to paint
 * a bespoke black hero plus a SuperToolRail, which read as a different product
 * next to every other creator tool. Everything now renders inside the house
 * ToolboxScaffold / SubToolbox ladder, so one tool converts all seven and the
 * tools mount into a hub (Projects, Studio Hub) like any other module.
 *
 * `heroShadowClassName` is kept on the config only so the seven tool files stay
 * untouched; the scaffold derives its shadow from the header colour.
 */
export interface InternalToolProps{
 embedded?:boolean
 collapsible?:boolean
 isOpenInitial?:boolean
 paletteIndex?:number
}
interface InternalSuperToolWorkbenchProps extends InternalToolProps{
 config:InternalWorkbenchConfig
 children?:React.ReactNode
}

type ActionTone="pink"|"orange"|"yellow"|"green"|"cyan"|"blue"|"purple"

/** The seven configs pick their accent as a Tailwind class; map it onto the closed tone set. */
const ACCENT_TONE:Record<string,ActionTone>={"bg-[#CCFF00]":"green","bg-[#FFEA5A]":"yellow","bg-[#FF4FD8]":"pink","bg-[#00F0FF]":"cyan"}

const buildArtifact=(recordId:string,title:string,packet:Record<string,unknown>):GenerationArtifact=>({id:crypto.randomUUID(),kind:"json",label:`${title} packet`,sourceRecordId:recordId,metadata:packet})
const buildSelfImprovementTrail=(modules:ToolModuleCard[],input:{source:string;objective:string;notes:string;sourceLabel:string;objectiveLabel:string;notesLabel:string},built:ReturnType<InternalWorkbenchConfig["buildPacket"]>)=>({inputsUsed:[input.source?input.sourceLabel:null,input.objective?input.objectiveLabel:null,input.notes?input.notesLabel:null].filter(Boolean),inferred:built.summary,missing:[input.source?null:input.sourceLabel,input.objective?null:input.objectiveLabel,input.notes?null:input.notesLabel].filter(Boolean),handedOffTo:built.workflowSteps.map(step=>`${step.surface}:${step.toolId}`),improveNext:modules.map(module=>module.selfImprovementSignal).filter(Boolean).slice(0,6)})

/** Prose fields must opt out of the uppercase in `.vt-input-standard`; a utility class loses to it. */
const PROSE_FIELD:React.CSSProperties={minHeight:"120px",textTransform:"none",fontWeight:600}

const TOGGLE_BASE="min-h-11 px-3 border-[3px] border-black rounded-xl font-black uppercase text-[10px] shadow-[3px_3px_0_0_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow,background-color]"

const InternalSuperToolWorkbench:React.FC<InternalSuperToolWorkbenchProps>=({config,embedded=false,collapsible=false,isOpenInitial=true,paletteIndex,children})=>{
 const {brain,consultBrain,emitSignal}=useBrain();const [selectedModeId,setSelectedModeId]=useState(config.modes[0]?.id||"");const [source,setSource]=useState("");const [objective,setObjective]=useState("");const [notes,setNotes]=useState("");const [status,setStatus]=useState<string|null>(null);const [refreshTick,setRefreshTick]=useState(0);const [latestChainId,setLatestChainId]=useState<string|null>(null);const [isOpen,setIsOpen]=useState(isOpenInitial)
 const tools=useMemo(()=>listSuperToolsByIds(config.sisterToolIds),[config.sisterToolIds]);const generations=useMemo(()=>listGenerationRecords().filter(record=>record.toolId===config.toolId),[refreshTick,config.toolId]);const workflows=useMemo(()=>listWorkflowChains().filter(chain=>chain.primaryToolId===config.toolId),[refreshTick,config.toolId]);const selectedMode=config.modes.find(mode=>mode.id===selectedModeId)||config.modes[0];const latestWorkflow=workflows.find(chain=>chain.id===latestChainId)||workflows[0]||null;const latestGeneration=generations[0]||null
 const tone=ACCENT_TONE[config.accentClassName]||"yellow"
 const fieldId=(name:string)=>`${config.toolId}-${name}`
 const heroIcon=useMemo(()=>{const Icon=config.modules[0]?.icon;return Icon?React.createElement(Icon,{size:40,strokeWidth:2.5}):<Boxes size={40} strokeWidth={2.5}/>},[config.modules])
 const applyIncoming=(payload:Record<string,unknown>)=>{const p=payload as any;setSource(String(p.source??p.concept??p.title??p.project??p.script??source));setObjective(String(p.objective??p.goal??p.summary??p.intent??objective));const context=[p.notes,p.analysis,p.strategicAnalysis,p.description,p.evidence,p.provenance].flat().filter(Boolean).join("\n");if(context)setNotes(prev=>[prev,context].filter(Boolean).join("\n\n"));if(p.mode&&config.modes.some(m=>m.id===p.mode))setSelectedModeId(p.mode);setStatus("Incoming Brain/tool handoff loaded. Review the fields, then create the packet when ready.")}
 const handleCreatePacket=async()=>{
  setStatus("Consulting Brain and building persisted super-tool packet...")
  const contentContext=resolveWorkspaceContentBuildToolContext(brain,config.toolId)
  const brainContext=await consultBrain(config.toolId,{
   source,
   objective,
   notes,
   mode:selectedMode.id,
   contentBuildId:contentContext?.contentBuildId||null,
  }).catch(()=>null)
  const built=config.buildPacket({
   source:source.trim(),
   objective:objective.trim(),
   notes:notes.trim(),
   mode:selectedMode,
   brainContext,
   workflowCount:workflows.length,
  })
  const selfImprovement=buildSelfImprovementTrail(
   config.modules,
   {
    source:source.trim(),
    objective:objective.trim(),
    notes:notes.trim(),
    sourceLabel:config.sourceLabel,
    objectiveLabel:config.objectiveLabel,
    notesLabel:config.notesLabel,
   },
   built,
  )
  const contentBuildId=contentContext?.contentBuildId||null
  const projectId=contentContext?.build.legacyProjectId||null
  const outputPacket={
   ...built.packet,
   contentBuildId,
   projectId,
   selfImprovement,
  }

  if(contentBuildId){
   recordContentBuildToolInput({
    contentBuildId,
    toolId:config.toolId,
    assetIds:Object.values(contentContext?.selectedAssets||{}).filter(Boolean).map(asset=>asset!.id),
    evidenceIds:contentContext?.evidenceIds||[],
    summary:`${config.title}: ${source.trim()||"untitled work"}`,
    metadata:{mode:selectedMode.id,objective:objective.trim(),notes:notes.trim()},
   })
  }

  const record=createGenerationRecord({
   toolId:config.toolId,
   provider:"mock",
   model:"viewtube-supertool-shell-v1",
   prompt:JSON.stringify({
    source:source.trim(),
    objective:objective.trim(),
    notes:notes.trim(),
    mode:selectedMode.id,
    contentBuildId,
   }),
   status:"running",
   artifacts:[],
   metadata:{
    contentBuildId,
    projectId,
    source:source.trim(),
    objective:objective.trim(),
    mode:selectedMode.id,
    selfImprovement,
   },
  })
  const artifact=buildArtifact(record.id,config.title,outputPacket)
  updateGenerationRecord(record.id,{
   status:"complete",
   outputText:built.summary,
   outputJson:outputPacket,
   artifacts:[artifact],
   usage:{promptTokens:0,completionTokens:0,totalTokens:0},
   estimatedCostCents:0,
  })
  const [vaultAsset]=ingestGenerationArtifacts([artifact],{
   toolId:config.toolId,
   projectId,
   projectName:contentContext?.build.legacyProjectName||null,
   generationId:record.id,
   tags:[
    config.toolId,
    selectedMode.id,
    "internal-super-tool",
    ...(contentBuildId?["content-build"]:[]),
   ],
  })

  if(contentBuildId&&vaultAsset){
   attachAssetToContentBuild(contentBuildId,vaultAsset.id,{
    toolId:config.toolId,
    generationRecordId:record.id,
    metadata:{mode:selectedMode.id,packetType:"internal-super-tool"},
   })
   recordContentBuildToolOutput({
    contentBuildId,
    toolId:config.toolId,
    assetIds:[vaultAsset.id],
    generationRecordId:record.id,
    summary:built.summary,
    metadata:{mode:selectedMode.id,workflowTitle:built.workflowTitle},
   })
  }

  const chain=createWorkflowChain({
   title:built.workflowTitle,
   goal:built.workflowGoal,
   projectId,
   primaryToolId:config.toolId,
   steps:built.workflowSteps.map(step=>createWorkflowStep(step.title,step.surface,step.toolId,step.details)),
   provenance:[
    `${config.toolId}.internal-workbench.${selectedMode.id}`,
    ...(contentBuildId?[`content-build:${contentBuildId}`]:[]),
    ...selfImprovement.handedOffTo,
   ],
  })
  await emitSignal(config.toolId,"INTERNAL_PACKET_CREATED",{
   contentBuildId,
   projectId,
   generationId:record.id,
   workflowId:chain.id,
   mode:selectedMode.id,
   source:source.trim(),
   objective:objective.trim(),
   selfImprovement,
  })
  setLatestChainId(chain.id)
  setRefreshTick(v=>v+1)
  setStatus(`${config.title} packet saved to ${contentBuildId||"standalone workspace"}, Vault artifact created, and workflow chain queued.`)
 }

 return (
  <ToolboxScaffold
   title={config.title}
   subtitle={config.subtitle}
   icon={heroIcon}
   paletteIndex={paletteIndex}
   headerColor={config.accentClassName}
   collapsible={collapsible}
   isOpen={collapsible?isOpen:true}
   onToggle={()=>setIsOpen(open=>!open)}
   embedded={embedded}
   helpText={`Super-tool ${config.toolNumber}. ${config.subtitle} ${config.railNote}`}
   contentClassName={embedded?"p-0":"p-4 sm:p-6 lg:p-8"}>

   <div className="flex w-full flex-col gap-6">
    <AssistantCommandContextBanner targetToolId={config.toolId}/>
    <BrainLiveToolInbox destinationToolId={config.toolId} onPrefill={applyIncoming}/>

    <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
     <div className="flex min-w-0 flex-col gap-6">
      <SubToolbox
       title="Handoff Builder"
       icon={<Zap />}
       collapsible
       isOpenInitial
       helpText="Incoming work can prefill these fields. Review, edit, then persist the packet, Vault artifact, workflow chain, provenance and Brain signal.">
       <fieldset className="border-none p-0 m-0">
        <legend className="text-[10px] font-black uppercase tracking-wider">{config.modeLabel}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
         {config.modes.map(mode=>(
          <button
           key={mode.id}
           type="button"
           aria-pressed={selectedModeId===mode.id}
           title={mode.description}
           onClick={()=>setSelectedModeId(mode.id)}
           className={`${TOGGLE_BASE} ${selectedModeId===mode.id?"bg-[#FFE357]":"bg-white"}`}>
           {mode.label}
          </button>
         ))}
        </div>
       </fieldset>

       {selectedMode?.description?(
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-black/50">{selectedMode.description}</p>
       ):null}

       <label htmlFor={fieldId("source")} className="mt-4 block text-[10px] font-black uppercase tracking-wider">{config.sourceLabel}</label>
       <StandardTextArea id={fieldId("source")} name={fieldId("source")} value={source} onChange={event=>setSource(event.target.value)} placeholder={config.sourcePlaceholder} className="mt-2" style={PROSE_FIELD}/>

       <label htmlFor={fieldId("objective")} className="mt-4 block text-[10px] font-black uppercase tracking-wider">{config.objectiveLabel}</label>
       <StandardTextArea id={fieldId("objective")} name={fieldId("objective")} value={objective} onChange={event=>setObjective(event.target.value)} placeholder={config.objectivePlaceholder} className="mt-2" style={PROSE_FIELD}/>

       <label htmlFor={fieldId("notes")} className="mt-4 block text-[10px] font-black uppercase tracking-wider">{config.notesLabel}</label>
       <StandardTextArea id={fieldId("notes")} name={fieldId("notes")} value={notes} onChange={event=>setNotes(event.target.value)} placeholder={config.notesPlaceholder} className="mt-2" style={PROSE_FIELD}/>

       <div className="mt-4">
        <SubToolboxGridActionButton label="Create + Route Packet" iconName="zap" tone={tone} onClick={handleCreatePacket}/>
       </div>

       {status?(
        <p role="status" className="mt-4 rounded-xl border-[3px] border-black bg-[#f8f7f1] p-3 text-[10px] font-black uppercase leading-relaxed tracking-[0.08em]">{status}</p>
       ):null}
      </SubToolbox>

      <SubToolbox
       title="Core Modules"
       icon={<Layers />}
       collapsible
       isOpenInitial={false}
       helpText="The functional modules this tool owns. Every packet records its evidence, workflow handoffs and self-improvement trail.">
       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {config.modules.map(module=>(
         <article key={module.id||module.title} className="overflow-hidden rounded-[14px] border-[3px] border-black bg-white">
          <div className={`${module.tone} flex items-center gap-2 border-b-[3px] border-black px-3 py-2`}>
           <module.icon size={16} aria-hidden="true"/>
           <span className="text-[11px] font-black uppercase leading-tight tracking-[0.04em]">{module.title}</span>
          </div>
          <p className="p-3 text-xs font-bold leading-5 text-black/75">{module.purpose||module.body}</p>
         </article>
        ))}
       </div>
      </SubToolbox>
     </div>

     <div className="flex min-w-0 flex-col gap-6">
      <SubToolbox title="Signals" icon={<Activity />} collapsible isOpenInitial helpText="What this tool watches while you work.">
       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {config.metrics.map(metric=>(
         <article key={metric.label} className="overflow-hidden rounded-[14px] border-[3px] border-black bg-white">
          <div className={`${metric.tone} flex items-center gap-2 border-b-[3px] border-black px-3 py-2`}>
           <metric.icon size={16} aria-hidden="true"/>
           <span className="text-[10px] font-black uppercase tracking-[0.14em]">{metric.label}</span>
          </div>
          <p className="px-3 py-3 text-sm font-[1000] uppercase leading-tight tracking-[-0.02em]">{metric.value}</p>
         </article>
        ))}
       </div>
      </SubToolbox>

      {config.outputLanes.length?(
       <SubToolbox title="Output Lanes" icon={<ListChecks />} collapsible isOpenInitial={false} helpText="Where a finished packet is meant to land.">
        <dl className="grid grid-cols-1 gap-2">
         {config.outputLanes.map(lane=>(
          <div key={lane.label} className="rounded-[12px] border-[3px] border-black bg-white px-3 py-2">
           <dt className="text-[9px] font-black uppercase tracking-[0.18em] text-black/50">{lane.label}</dt>
           <dd className="mt-1 text-xs font-bold leading-5 text-black/80">{lane.value}</dd>
          </div>
         ))}
        </dl>
       </SubToolbox>
      ):null}

      <SubToolbox title="Latest Run" icon={<Database />} collapsible isOpenInitial helpText="The most recent packet and workflow chain this tool persisted on this device.">
       <div className="grid grid-cols-1 gap-3">
        <div className="rounded-[12px] border-[3px] border-black bg-white px-3 py-2">
         <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/50">Latest generation · {generations.length}</div>
         <p className="mt-1 text-xs font-bold leading-5 text-black/80">{latestGeneration?.outputText||"No packet yet."}</p>
        </div>
        <div className="rounded-[12px] border-[3px] border-black bg-white px-3 py-2">
         <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/50">Latest workflow · {workflows.length}</div>
         <p className="mt-1 text-xs font-bold leading-5 text-black/80">{latestWorkflow?.title||"No workflow yet."}</p>
        </div>
       </div>
       {latestGeneration?<div className="mt-4"><PostActionReflection toolId={config.toolId}/></div>:null}
      </SubToolbox>

      {tools.length?(
       <SubToolbox title="Sister Tools" icon={<Share2 />} collapsible isOpenInitial={false} helpText={`${config.railTitle}. ${config.railSubtitle} ${config.railNote}`}>
        <div className="grid grid-cols-1 gap-3">
         {tools.map(tool=>(
          <article key={tool.id} className="rounded-[12px] border-[3px] border-black bg-white px-3 py-2">
           <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/50">{tool.category} · {tool.surface}</div>
           <div className="mt-1 text-sm font-[1000] uppercase leading-tight tracking-[-0.02em]">{tool.title}</div>
           <p className="mt-1 text-xs font-bold leading-5 text-black/70">{tool.summary}</p>
          </article>
         ))}
        </div>
       </SubToolbox>
      ):null}
     </div>
    </div>

    {config.prototype?<SuperToolPrototypeWorkspace config={config.prototype}/>:null}
    {children}
   </div>
  </ToolboxScaffold>
 )
}
export default InternalSuperToolWorkbench
