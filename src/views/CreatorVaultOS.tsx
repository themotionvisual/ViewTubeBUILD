import React, { useMemo, useState } from "react"
import { SuperToolRail } from "../components/SuperToolRail"
import { listGenerationRecords } from "../services/generationStore"
import { listPublicSuperToolsByIds } from "../services/superToolRegistry"
import { createWorkflowChain, createWorkflowStep, listWorkflowChains } from "../services/workflowEngine"
import {
 createLocalVaultAsset,
 linkDriveVaultFolder,
 listVaultAssets,
} from "../services/vaultAdapter"
import type { VaultAssetKind } from "../types"

const VAULT_TOOL_IDS = [
 "creator-vault-os",
 "timeline-asset-vault-dock",
 "workflow-chain-builder",
] as const

const CreatorVaultOS: React.FC = () => {
 const [assetName, setAssetName] = useState("")
 const [projectName, setProjectName] = useState("")
 const [kind, setKind] = useState<VaultAssetKind>("image")
 const [refreshTick, setRefreshTick] = useState(0)
 const [driveStatus, setDriveStatus] = useState<string | null>(null)

 const assets = useMemo(() => listVaultAssets(), [refreshTick])
 const workflows = useMemo(() => listWorkflowChains(), [refreshTick])
 const generations = useMemo(() => listGenerationRecords().slice(0, 6), [refreshTick])
 const vaultTools = useMemo(() => listPublicSuperToolsByIds([...VAULT_TOOL_IDS]), [])

 const groupedAssets = useMemo(() => {
  return assets.reduce<Record<string, typeof assets>>((acc, asset) => {
   const key = asset.projectName || "Unassigned"
   acc[key] = acc[key] || []
   acc[key].push(asset)
   return acc
  }, {})
 }, [assets])

 const handleAddAsset = () => {
  if (!assetName.trim()) return
  createLocalVaultAsset({
   name: assetName.trim(),
   projectName: projectName.trim() || null,
   kind,
   toolId: "creator-vault-os",
   tags: [kind, "manual-entry"],
  })

  if (projectName.trim()) {
   createWorkflowChain({
    title: `${projectName.trim()} Asset Intake`,
    goal: "Track new Vault asset intake and attach it to the creator workflow.",
    primaryToolId: "workflow-chain-builder",
    steps: [
     createWorkflowStep("Collect asset", "vault", "creator-vault-os", "Asset entered from the Vault OS panel."),
     createWorkflowStep("Route to project", "projects", "project-command-kanban", "Attach asset to current production work."),
     createWorkflowStep("Expose in editor", "editor", "timeline-asset-vault-dock", "Make the asset available inside VT_E1."),
    ],
    provenance: ["creator-vault-os.manual-entry"],
   })
  }

  setAssetName("")
  setProjectName("")
  setKind("image")
  setRefreshTick((value) => value + 1)
 }

 const handleDriveLink = async () => {
  if (!projectName.trim()) {
   setDriveStatus("Enter a project name before linking Drive.")
   return
  }
  setDriveStatus("Linking Drive folder...")
  try {
   const linked = await linkDriveVaultFolder(projectName.trim())
   setDriveStatus(`Drive folder linked: ${linked.name}`)
   setRefreshTick((value) => value + 1)
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   setDriveStatus(`Drive link failed: ${message}`)
  }
 }

 return (
  <div className="mx-auto flex max-w-[1600px] flex-col gap-8 pb-24">
   <div className="rounded-[24px] border-[5px] border-black bg-[#0f0f0f] px-8 py-8 text-white shadow-[12px_12px_0px_0px_#CCFF00]">
    <div className="text-[11px] font-black uppercase tracking-[0.35em] text-[#CCFF00]">
     Vault Surface
    </div>
    <h1 className="mt-3 text-6xl font-[1000] uppercase leading-none tracking-[-0.07em]">
     Creator Vault OS
    </h1>
    <p className="mt-4 max-w-4xl text-sm font-bold uppercase tracking-[0.12em] text-white/70">
     Drive-first asset storage, generated-output persistence, and project-linked media routing for the ViewTube super-tool stack.
    </p>
   </div>

   <SuperToolRail
    title="Vault and Workflow Layer"
    subtitle="Storage, timeline reuse, and creator process orchestration"
    tools={vaultTools}
    accentClassName="bg-[#00F0FF]"
    note="Every generation, asset, and workflow should remain addressable and reusable across Studio, Projects, VT_E1, and Analytics."
   />

   <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Asset Intake
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Add Vault Assets
      </div>
     </div>
     <div className="grid gap-4 p-6 md:grid-cols-2">
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Asset name
       <input
        value={assetName}
        onChange={(event) => setAssetName(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black px-4 text-sm font-bold uppercase tracking-[0.08em] text-black"
        placeholder="Napoleon hero image"
       />
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Project
       <input
        value={projectName}
        onChange={(event) => setProjectName(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black px-4 text-sm font-bold uppercase tracking-[0.08em] text-black"
        placeholder="Roman Engineering Series"
       />
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Asset kind
       <select
        value={kind}
        onChange={(event) => setKind(event.target.value as VaultAssetKind)}
        className="h-12 rounded-[14px] border-[4px] border-black px-4 text-sm font-bold uppercase tracking-[0.08em] text-black"
       >
        {["image", "video", "audio", "font", "document", "template", "generated", "other"].map((option) => (
         <option key={option} value={option}>
          {option}
         </option>
        ))}
       </select>
      </label>
      <div className="flex flex-col gap-3">
       <button
        onClick={handleAddAsset}
        className="h-12 rounded-[14px] border-[4px] border-black bg-[#FF4FD8] px-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[5px_5px_0px_0px_black]"
       >
        Save asset
       </button>
       <button
        onClick={handleDriveLink}
        className="h-12 rounded-[14px] border-[4px] border-black bg-[#111] px-4 text-sm font-black uppercase tracking-[0.12em] text-[#CCFF00] shadow-[5px_5px_0px_0px_black]"
       >
        Link Drive folder
       </button>
      </div>
      {driveStatus ? (
       <div className="md:col-span-2 rounded-[14px] border-[4px] border-black bg-[#f6f1da] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black/70">
        {driveStatus}
       </div>
      ) : null}
     </div>
    </div>

    <div className="rounded-[22px] border-[4px] border-black bg-[#111] text-white shadow-[8px_8px_0px_0px_#FF4FD8]">
     <div className="border-b-[4px] border-black bg-[#FF4FD8] px-6 py-5 text-black">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Persistence
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Live Status
      </div>
     </div>
     <div className="grid gap-4 p-6">
      {[
       { label: "Vault assets", value: assets.length },
       { label: "Saved generations", value: generations.length },
       { label: "Workflow chains", value: workflows.length },
      ].map((metric) => (
       <div
        key={metric.label}
        className="rounded-[18px] border-[4px] border-white/20 bg-black/40 px-5 py-4"
       >
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
         {metric.label}
        </div>
        <div className="mt-2 text-4xl font-[1000] uppercase leading-none tracking-[-0.04em] text-[#CCFF00]">
         {metric.value}
        </div>
       </div>
      ))}
     </div>
    </div>
   </section>

   <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#FFEA5A] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Vault inventory
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Project Groups
      </div>
     </div>
     <div className="grid gap-5 p-6">
      {Object.entries(groupedAssets).length ? (
       Object.entries(groupedAssets).map(([group, groupAssets]) => (
        <div key={group} className="rounded-[18px] border-[4px] border-black bg-[#f8f7f1]">
         <div className="border-b-[4px] border-black bg-white px-4 py-3 text-xl font-[1000] uppercase tracking-[-0.04em]">
          {group}
         </div>
         <div className="grid gap-3 p-4 md:grid-cols-2">
          {groupAssets.map((asset) => (
           <div key={asset.id} className="rounded-[14px] border-[3px] border-black bg-white px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
             {asset.kind} · {asset.source}
            </div>
            <div className="mt-1 text-lg font-[1000] uppercase tracking-[-0.03em]">
             {asset.name}
            </div>
            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-black/60">
             {asset.tags.join(" · ") || "No tags"}
            </div>
           </div>
          ))}
         </div>
        </div>
       ))
      ) : (
       <div className="rounded-[16px] border-[4px] border-dashed border-black/35 bg-[#f8f7f1] px-5 py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-black/55">
        No vault assets yet. Add one above to seed the creator storage system.
       </div>
      )}
     </div>
    </div>

    <div className="grid gap-8">
     <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
      <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
        Latest generations
       </div>
       <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
        AI Output Log
       </div>
      </div>
      <div className="grid gap-3 p-5">
       {generations.length ? (
        generations.map((generation) => (
         <div key={generation.id} className="rounded-[14px] border-[3px] border-black bg-[#f8f7f1] px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
           {generation.toolId} · {generation.status}
          </div>
          <div className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-black/70">
           {generation.model}
          </div>
          <div className="mt-2 line-clamp-3 text-xs font-bold text-black/70">
           {generation.prompt}
          </div>
         </div>
        ))
       ) : (
        <div className="rounded-[14px] border-[3px] border-dashed border-black/35 bg-[#f8f7f1] px-4 py-6 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
         No saved generations yet.
        </div>
       )}
      </div>
     </div>

     <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
      <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
        Workflow builder
       </div>
       <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
        Process History
       </div>
      </div>
      <div className="grid gap-3 p-5">
       {workflows.length ? (
        workflows.slice(0, 5).map((workflow) => (
         <div key={workflow.id} className="rounded-[14px] border-[3px] border-black bg-[#f8f7f1] px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
           {workflow.status} · {workflow.steps.length} steps
          </div>
          <div className="mt-1 text-lg font-[1000] uppercase tracking-[-0.03em]">
           {workflow.title}
          </div>
          <div className="mt-2 text-xs font-bold text-black/70">{workflow.goal}</div>
         </div>
        ))
       ) : (
        <div className="rounded-[14px] border-[3px] border-dashed border-black/35 bg-[#f8f7f1] px-4 py-6 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
         No workflow chains yet.
        </div>
       )}
      </div>
     </div>
    </div>
   </section>
  </div>
 )
}

export default CreatorVaultOS
