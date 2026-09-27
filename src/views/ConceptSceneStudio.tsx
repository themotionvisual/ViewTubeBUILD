import React, { useEffect, useMemo, useState } from "react"
import {
 ArrowDown,
 ArrowUp,
 Boxes,
 Clapperboard,
 Compass,
 FileStack,
 Lightbulb,
 Send,
 Sparkles,
 Trash2,
 WandSparkles,
} from "lucide-react"
import {
 StandardInput,
 StandardTextArea,
 SubToolbox,
 SubToolboxDropdownControl,
 SubToolboxGridActionButton,
 SubToolboxInnerActionButton,
 ToolboxScaffold,
} from "../components/Toolbox"
import { useBrain } from "../context/useBrain"
import { resolveWorkspaceContentBuildToolContext } from "../services/asset-engine/ToolContext"
import { createSuperToolActionPacket } from "../services/superToolActionPackets"
import {
 addAssetVariant,
 createAssetVariantGroup,
 createVersionedAsset,
} from "../services/assetEngine"
import {
 prepareGenerationRequest,
 recordToolReceipt,
} from "../services/asset-engine/GenerationWorkflow"
import {
 generateConceptDirections,
 generateScenePlan,
} from "../services/brain/conceptSceneAssets"
import {
 buildProductionHandoff,
 createConceptCandidates,
 createScenesFromConcept,
 moveScene,
 type ConceptBrief,
 type ConceptDirection,
 type ProductionScene,
} from "../features/concept-scene-studio/model"

interface ConceptSceneStudioProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const STORAGE_KEY = "vt_concept_scene_studio_v1"

const defaultBrief: ConceptBrief = {
 idea: "",
 audience: "Returning viewers who want a clear story, not a lecture",
 promise: "Understand the hidden decision that changes how the story looks",
 objective: "Build curiosity, prove the idea, and deliver a memorable payoff",
 format: "Longform",
 runtimeMinutes: 10,
 tone: "Tense / cinematic",
 evidenceNotes: "Separate sourced facts from reconstruction. Flag unsupported claims.",
}

type StoredDraft = {
 brief: ConceptBrief
 concepts: ConceptDirection[]
 selectedConceptId: string | null
 scenes: ProductionScene[]
 scriptBeatsText: string
}

const readDraft = (): StoredDraft | null => {
 if (typeof window === "undefined") return null
 try {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw) as Partial<StoredDraft>
  if (!parsed.brief || !Array.isArray(parsed.concepts) || !Array.isArray(parsed.scenes)) return null
  return {
   brief: { ...defaultBrief, ...parsed.brief },
   concepts: parsed.concepts,
   selectedConceptId: typeof parsed.selectedConceptId === "string" ? parsed.selectedConceptId : null,
   scenes: parsed.scenes,
   scriptBeatsText: typeof parsed.scriptBeatsText === "string" ? parsed.scriptBeatsText : "",
  }
 } catch {
  return null
 }
}

const compactLabel = "text-[8px] font-[1000] uppercase tracking-[0.12em] text-black/55"
const card = "rounded-[10px] border-[3px] border-black bg-white shadow-[3px_3px_0_0_rgba(38,50,74,0.16)]"

const ConceptSceneStudio: React.FC<ConceptSceneStudioProps> = ({
 embedded = false,
 collapsible = true,
 isOpenInitial = false,
 paletteIndex = 11,
}) => {
 const { brain, setStoryboardState, authState } = useBrain()
 const initial = useMemo(() => readDraft(), [])
 const [brief, setBrief] = useState<ConceptBrief>(initial?.brief || {
  ...defaultBrief,
  idea: brain.coreConcept || "",
 })
 const [concepts, setConcepts] = useState<ConceptDirection[]>(initial?.concepts || [])
 const [selectedConceptId, setSelectedConceptId] = useState<string | null>(initial?.selectedConceptId || null)
 const [scenes, setScenes] = useState<ProductionScene[]>(initial?.scenes || [])
 const [sceneCount, setSceneCount] = useState(Math.max(3, initial?.scenes.length || 6))
 const [scriptBeatsText, setScriptBeatsText] = useState(initial?.scriptBeatsText || "")
 const [conceptGenerating, setConceptGenerating] = useState(false)
 const [sceneGenerating, setSceneGenerating] = useState(false)
 const [isOpen, setIsOpen] = useState(isOpenInitial)
 const [handoffStatus, setHandoffStatus] = useState("No production handoff sent yet.")

 const selectedConcept = concepts.find(concept => concept.id === selectedConceptId) || null
 const contentContext = useMemo(
  () => resolveWorkspaceContentBuildToolContext(brain, "creator-canvas-os", ["script", "storyboard"]),
  [brain],
 )

 useEffect(() => {
  if (typeof window === "undefined") return
  const timer = window.setTimeout(() => {
   try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ brief, concepts, selectedConceptId, scenes, scriptBeatsText }))
   } catch {
    // Draft persistence must never interrupt editing.
   }
  }, 180)
  return () => window.clearTimeout(timer)
 }, [brief, concepts, selectedConceptId, scenes, scriptBeatsText])

 const updateBrief = <K extends keyof ConceptBrief>(key: K, value: ConceptBrief[K]) =>
  setBrief(current => ({ ...current, [key]: value }))

 const resolveGenerationChannelId = () =>
  contentContext?.build.channelId || (authState as { channelId?: string | null } | null)?.channelId || null

 const forgeConcepts = async () => {
  const fallback = createConceptCandidates(brief)
  const channelId = resolveGenerationChannelId()
  setConceptGenerating(true)
  setScenes([])
  try {
   if (!channelId) {
    setConcepts(fallback)
    setSelectedConceptId(fallback[0]?.id || null)
    setHandoffStatus("Three local directions forged. Connect a channel or active ContentBuild to use governed Brain generation.")
    return
   }
   const prepared = contentContext ? prepareGenerationRequest({
    contentBuildId: contentContext.contentBuildId,
    channelId,
    projectId: contentContext.build.legacyProjectId || null,
    toolId: "creator-canvas-os",
    operation: "forge-concepts",
    targetSlot: "concept",
    mode: "new-option",
    creatorIntent: `Forge three distinct creative directions for: ${brief.idea}`,
    requestedSlots: ["concept", "script", "storyboard"],
    constraints: { brief },
    outputSpec: { candidateCount: 3, structured: true },
   }) : null
   const generated = await generateConceptDirections({
    context: { channelId },
    brief: { ...brief },
    ...(contentContext?.build.legacyProjectId ? { projectId: contentContext.build.legacyProjectId } : {}),
   })
   const output = generated.record.output
   const conceptsFromBrain: ConceptDirection[] | null = output?.concepts?.length === 3
    ? output.concepts.map((concept, index) => ({ ...concept, id: concept.id?.trim() || `concept-ai-${index + 1}` }))
    : null
   const resolved = conceptsFromBrain || fallback
   setConcepts(resolved)
   setSelectedConceptId(resolved[0]?.id || null)

   if (prepared && conceptsFromBrain) {
    const group = createAssetVariantGroup({
     contentBuildId: prepared.request.contentBuildId,
     slot: "concept",
     label: "Concept Forge directions",
     sourceToolId: "creator-canvas-os",
     metadata: { requestId: prepared.request.id, traceId: generated.trace.id },
    })
    const created = conceptsFromBrain.map((concept, index) => {
     const asset = createVersionedAsset({
      sourceToolId: "creator-canvas-os",
      sourceKind: "super-tool",
      payloadKind: "json",
      name: concept.label,
      summary: concept.angle,
      kind: "json",
      artifactKind: "json",
      payload: concept,
      tags: ["concept-forge", "creative-direction", `candidate-${index + 1}`],
      slot: "concept",
      label: concept.label,
      context: {
       contentBuildId: prepared.request.contentBuildId,
       channelId,
       projectId: prepared.request.projectId,
       projectName: contentContext?.build.legacyProjectName || null,
       stage: "concept",
       traceId: generated.trace.id,
       evidence: generated.record.evidenceRefs.map(id => ({ id })),
       provenance: [generated.record.id, prepared.request.id],
      },
     })
     addAssetVariant({
      contentBuildId: prepared.request.contentBuildId,
      groupId: group.id,
      assetId: asset.asset.id,
      versionId: asset.version?.id || null,
      label: concept.label,
      score: concept.readiness,
      sourceToolId: "creator-canvas-os",
      metadata: { conceptId: concept.id, traceId: generated.trace.id },
     })
     return asset
    })
    recordToolReceipt({
     request: prepared.request,
     outputAssetIds: created.map(item => item.asset.id),
     generationRecordId: generated.record.id,
     versionIds: created.map(item => item.version?.id).filter((id): id is string => Boolean(id)),
     variantGroupId: group.id,
     traceId: generated.trace.id,
     summary: "Generated three governed Concept Forge directions and attached them as ContentBuild variants.",
     metadata: { providerPath: "governed-asset-generator", brainAssetRecordId: generated.record.id },
    })
    setHandoffStatus(`Three Brain-generated directions saved with variant lineage · ${generated.record.status.replaceAll("_", " ")}.`)
   } else {
    setHandoffStatus(conceptsFromBrain
     ? `Three governed Brain directions forged · ${generated.record.status.replaceAll("_", " ")}.`
     : "Brain generation was incomplete; local production-safe concept directions were restored.")
   }
  } catch (error) {
   console.warn("[ConceptSceneStudio] Concept generation fell back to local directions.", error)
   setConcepts(fallback)
   setSelectedConceptId(fallback[0]?.id || null)
   setHandoffStatus("Brain generation was unavailable, so local production-safe concept directions were restored.")
  } finally {
   setConceptGenerating(false)
  }
 }

 const buildScenes = async () => {
  if (!selectedConcept) return
  const fallback = createScenesFromConcept(selectedConcept, brief, sceneCount)
  const channelId = resolveGenerationChannelId()
  const scriptBeats = scriptBeatsText.split(/\\n+/).map(beat => beat.trim()).filter(Boolean)
  setSceneGenerating(true)
  try {
   if (!channelId) {
    setScenes(fallback)
    setHandoffStatus(`${fallback.length} local production scenes created from ${selectedConcept.label}.`)
    return
   }
   const prepared = contentContext ? prepareGenerationRequest({
    contentBuildId: contentContext.contentBuildId,
    channelId,
    projectId: contentContext.build.legacyProjectId || null,
    toolId: "creator-canvas-os",
    operation: "design-scenes",
    targetSlot: "storyboard",
    mode: "new-version",
    creatorIntent: `Design ${sceneCount} production scenes for ${selectedConcept.label}.`,
    requestedSlots: ["concept", "script", "storyboard"],
    constraints: { brief, selectedConcept, scriptBeats },
    outputSpec: { sceneCount, includesMotionBrief: true, includesAssetNeeds: true },
   }) : null
   const generated = await generateScenePlan({
    context: { channelId },
    brief: { ...brief },
    selectedConcept: { ...selectedConcept },
    sceneCount,
    scriptBeats,
    ...(contentContext?.build.legacyProjectId ? { projectId: contentContext.build.legacyProjectId } : {}),
   })
   const output = generated.record.output
   const validRoles: ProductionScene["role"][] = ["HOOK","SETUP","PROOF","ESCALATION","PIVOT","PAYOFF"]
   const scenesFromBrain: ProductionScene[] | null = output?.scenes?.length === sceneCount
    ? output.scenes.map((scene, index) => ({
       ...scene,
       id: scene.id?.trim() || `scene-ai-${index + 1}`,
       order: index + 1,
       role: validRoles.includes(scene.role as ProductionScene["role"])
        ? scene.role as ProductionScene["role"]
        : index === 0 ? "HOOK" : index === output.scenes.length - 1 ? "PAYOFF" : "PROOF",
      }))
    : null
   const resolved = scenesFromBrain || fallback
   setScenes(resolved)

   if (prepared && scenesFromBrain) {
    const created = createVersionedAsset({
     sourceToolId: "creator-canvas-os",
     sourceKind: "super-tool",
     payloadKind: "storyboard",
     name: `${selectedConcept.label} scene blueprint`,
     summary: `${resolved.length} governed production scenes with shot, motion, asset and continuity briefs.`,
     kind: "json",
     artifactKind: "json",
     payload: { selectedConceptId: selectedConcept.id, scenes: resolved, notes: output?.notes || [] },
     tags: ["scene-design", "storyboard", "production-blueprint"],
     slot: "storyboard",
     label: "Scene Design Studio blueprint",
     context: {
      contentBuildId: prepared.request.contentBuildId,
      channelId,
      projectId: prepared.request.projectId,
      projectName: contentContext?.build.legacyProjectName || null,
      stage: "visual-plan",
      traceId: generated.trace.id,
      evidence: generated.record.evidenceRefs.map(id => ({ id })),
      provenance: [generated.record.id, prepared.request.id, selectedConcept.id],
     },
    })
    recordToolReceipt({
     request: prepared.request,
     outputAssetIds: [created.asset.id],
     generationRecordId: generated.record.id,
     versionIds: created.version?.id ? [created.version.id] : [],
     traceId: generated.trace.id,
     summary: `Generated and attached ${resolved.length} governed production scenes.`,
     metadata: { providerPath: "governed-asset-generator", brainAssetRecordId: generated.record.id, scriptBeatCount: scriptBeats.length },
    })
    setHandoffStatus(`${resolved.length} Brain-generated scenes saved to the active ContentBuild · ${generated.record.status.replaceAll("_", " ")}.`)
   } else {
    setHandoffStatus(scenesFromBrain
     ? `${resolved.length} governed Brain scenes created from ${selectedConcept.label}.`
     : "Brain scene generation was incomplete; the local production-safe blueprint was restored.")
   }
  } catch (error) {
   console.warn("[ConceptSceneStudio] Scene generation fell back to local blueprint.", error)
   setScenes(fallback)
   setHandoffStatus("Brain scene generation was unavailable, so the local production-safe blueprint was restored.")
  } finally {
   setSceneGenerating(false)
  }
 }

 const updateScene = <K extends keyof ProductionScene>(id: string, key: K, value: ProductionScene[K]) =>
  setScenes(current => current.map(scene => scene.id === id ? { ...scene, [key]: value } : scene))

 const removeScene = (id: string) =>
  setScenes(current => current.filter(scene => scene.id !== id).map((scene, index) => ({ ...scene, order: index + 1 })))

 const addScene = () => {
  if (!selectedConcept) return
  const seed = createScenesFromConcept(selectedConcept, brief, Math.min(12, scenes.length + 1)).at(-1)
  if (!seed) return
  setScenes(current => [...current, { ...seed, id: `${selectedConcept.id}-scene-custom-${Date.now()}`, order: current.length + 1, title: `CUSTOM · ${current.length + 1}` }])
 }

 const sendProductionHandoff = (destination: "storyboard-studio" | "video-director" | "video-asset-engine" | "video-editor") => {
  if (!selectedConcept || !scenes.length) return
  const payload = buildProductionHandoff(brief, selectedConcept, scenes)
  const scope = contentContext
  const routeByDestination = {
   "storyboard-studio": "/storyboard-studio",
   "video-director": "/studio",
   "video-asset-engine": "/projects",
   "video-editor": "/editor",
  } as const

  const result = createSuperToolActionPacket({
   toolId: "creator-canvas-os",
   moduleId: "concept-scene-production-handoff",
   title: `Concept + Scene Studio → ${destination}`,
   summary: `${selectedConcept.label}: ${scenes.length} production scenes ready for ${destination}.`,
   contentBuildId: scope?.contentBuildId || null,
   projectId: scope?.build.legacyProjectId || brain.activeProjectId || null,
   projectName: scope?.build.legacyProjectName || null,
   channelId: scope?.build.channelId || null,
   videoId: scope?.build.youtube?.videoId || null,
   inputs: {
    brief,
    selectedConceptId: selectedConcept.id,
    contentBuildId: scope?.contentBuildId || null,
   },
   outputs: payload,
   confidence: brief.idea.trim() && brief.promise.trim() ? "high" : "medium",
   evidence: [],
   missingInputs: [
    !brief.idea.trim() ? "source idea" : "",
    !brief.evidenceNotes.trim() ? "evidence constraints" : "",
   ].filter(Boolean),
   handoffTargets: [destination, "project:storyboard-studio", "studio:video-director", "studio:video-asset-engine", "editor:video-editor"],
   workflowTitle: "Concept to production blueprint",
   workflowGoal: "Carry one selected creative direction into storyboard, directing, asset generation, and editing without losing Project or ContentBuild identity.",
   workflowSteps: [
    { title: "Shape concept", surface: "studio", toolId: "creator-canvas-os", details: selectedConcept.angle },
    { title: "Plan scenes", surface: "studio", toolId: "creator-canvas-os", details: `${scenes.length} production scenes` },
    { title: "Prepare editor execution", surface: "editor", toolId: "motion-scene-builder", details: "Carry shots, prompts, continuity, and asset needs into production." },
   ],
   tags: ["concept", "scene-design", "storyboard", "production-blueprint"],
  })

  setStoryboardState({
   scenes: payload.storyboard.scenes.map(scene => ({
    id: scene.id,
    name: scene.name,
    text: scene.text,
    broll: scene.broll,
    imageUrl: null,
    emotionScore: 50,
    durationEstimate: scene.durationEstimate,
   })),
   estimatedDuration: scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0),
   pacingHealth: "Excellent",
  })
  setHandoffStatus(`Handoff ${result.packet.id.slice(0, 8)} saved to the shared workflow and prepared for ${destination}.`)
  if (typeof window !== "undefined") window.location.assign(routeByDestination[destination])
 }

 const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0)
 const readiness = selectedConcept
  ? Math.round((selectedConcept.readiness + (scenes.length ? 100 : 35) + (brief.evidenceNotes.trim() ? 100 : 55)) / 3)
  : 20

 return (
  <div id="concept-scene-studio" className="scroll-mt-24">
   <ToolboxScaffold
    title="CONCEPT + SCENE STUDIO"
    subtitle="Forge the creative direction, then turn it into a production-ready scene blueprint"
    icon={<WandSparkles size={40} strokeWidth={3} />}
    paletteIndex={paletteIndex}
    collapsible={collapsible}
    isOpen={isOpen}
    onToggle={() => setIsOpen(value => !value)}
    embedded={embedded}
    unmountWhenClosed={false}
    helpText="One connected creative workflow: define the viewer promise, compare distinct concepts, select one direction, design scenes, then hand the same Project/ContentBuild context to Storyboard, Video Director, Asset Engine, or Editor."
    contentClassName="p-2 sm:p-3"
   >
    <div className="mb-2 grid grid-cols-2 gap-1.5 md:grid-cols-4">
     {[
      ["1", "BRIEF", brief.idea.trim() ? "READY" : "NEEDS IDEA"],
      ["2", "DIRECTION", selectedConcept?.label || "NOT SELECTED"],
      ["3", "SCENES", scenes.length ? `${scenes.length} · ${Math.round(totalDuration / 60)} MIN` : "NOT BUILT"],
      ["4", "READINESS", `${readiness}%`],
     ].map(([step, label, value]) => (
      <div key={label} className="flex min-w-0 items-center gap-2 rounded-[8px] border-[2px] border-black bg-white px-2 py-1.5">
       <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-[#FFE357] text-[10px] font-[1000]">{step}</span>
       <div className="min-w-0">
        <div className={compactLabel}>{label}</div>
        <div className="truncate text-[10px] font-[1000] uppercase text-[#26324A]">{value}</div>
       </div>
      </div>
     ))}
    </div>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
     <div className="space-y-2">
      <SubToolbox
       title="CONCEPT FORGE"
       subtitle="Define the creative problem before asking AI for answers"
       icon={<Lightbulb />}
       isOpenInitial
       openUnits={5}
       overflowVisible
       helpText="This brief is the constraint system for every generated direction. It is saved locally and carried into the shared ContentBuild handoff."
      >
       <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="md:col-span-2">
         <label className={compactLabel}>SOURCE IDEA</label>
         <StandardTextArea
          aria-label="Source idea"
          value={brief.idea}
          onChange={event => updateBrief("idea", event.target.value)}
          placeholder="What is the video really about?"
          minHeight="88px"
          style={{ minHeight: "88px", textTransform: "none", fontWeight: 700, fontSize: "16px" }}
         />
        </div>
        <div>
         <label className={compactLabel}>TARGET VIEWER</label>
         <StandardTextArea aria-label="Target viewer" value={brief.audience} onChange={event => updateBrief("audience", event.target.value)} minHeight="76px" style={{ minHeight: "76px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
        </div>
        <div>
         <label className={compactLabel}>VIEWER PROMISE</label>
         <StandardTextArea aria-label="Viewer promise" value={brief.promise} onChange={event => updateBrief("promise", event.target.value)} minHeight="76px" style={{ minHeight: "76px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
        </div>
        <div>
         <label className={compactLabel}>CREATOR OBJECTIVE</label>
         <StandardTextArea aria-label="Creator objective" value={brief.objective} onChange={event => updateBrief("objective", event.target.value)} minHeight="76px" style={{ minHeight: "76px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
        </div>
        <div>
         <label className={compactLabel}>EVIDENCE / CONSTRAINTS</label>
         <StandardTextArea aria-label="Evidence constraints" value={brief.evidenceNotes} onChange={event => updateBrief("evidenceNotes", event.target.value)} minHeight="76px" style={{ minHeight: "76px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
        </div>
        <SubToolboxDropdownControl label="FORMAT" value={brief.format} options={["Longform", "Short", "Series", "Explainer", "Documentary"]} onChange={value => updateBrief("format", value)} tone="yellow" />
        <SubToolboxDropdownControl label="TONE" value={brief.tone} options={["Tense / cinematic", "Investigative", "Intimate", "Energetic", "Reflective"]} onChange={value => updateBrief("tone", value)} tone="cyan" />
        <div>
         <label className={compactLabel}>TARGET RUNTIME · MINUTES</label>
         <StandardInput aria-label="Target runtime minutes" type="number" min={1} max={180} value={brief.runtimeMinutes} onChange={event => updateBrief("runtimeMinutes", Math.max(1, Number(event.target.value) || 1))} style={{ fontSize: "16px" }} />
        </div>
        <div className="flex items-end">
         <SubToolboxGridActionButton label={conceptGenerating ? "FORGING…" : "FORGE 3 DIRECTIONS"} iconName="sparkles" tone="yellow" onClick={() => void forgeConcepts()} disabled={!brief.idea.trim() || conceptGenerating} className="w-full" />
        </div>
       </div>
      </SubToolbox>

      <SubToolbox
       title="DIRECTION DECK"
       subtitle="Compare genuinely different treatments before committing"
       icon={<Compass />}
       isOpenInitial
       openUnits={5}
       helpText="The selected concept becomes the parent creative direction for every scene. Selecting a different card does not silently overwrite existing scenes."
      >
       {concepts.length ? (
        <div className="grid grid-cols-1 gap-2">
         {concepts.map((concept, index) => {
          const selected = concept.id === selectedConceptId
          return (
           <article key={concept.id} className={`${card} overflow-hidden ${selected ? "ring-[3px] ring-[#45C8E9] ring-offset-1" : ""}`}>
            <button type="button" onClick={() => setSelectedConceptId(concept.id)} className="w-full text-left">
             <div className="flex items-center justify-between gap-2 border-b-[3px] border-black px-3 py-2" style={{ backgroundColor: ["#FFE357", "#FF77D6", "#73DEFF"][index % 3] }}>
              <div className="min-w-0">
               <div className="text-[8px] font-[1000] uppercase tracking-[0.12em]">DIRECTION {index + 1}</div>
               <h3 className="text-[18px] font-[1000] uppercase leading-none text-[#26324A]">{concept.label}</h3>
              </div>
              <span className="rounded-[6px] border-[2px] border-black bg-white px-2 py-1 text-[9px] font-[1000] uppercase">{selected ? "SELECTED" : `${concept.readiness}% READY`}</span>
             </div>
             <div className="space-y-2 p-3">
              <p className="text-[14px] font-[900] leading-tight text-[#26324A]">{concept.angle}</p>
              <p className="text-[12px] font-bold leading-snug text-[#26324A]/75">{concept.hook}</p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
               <div className="rounded-[7px] border-[2px] border-black/25 bg-[#F6F8FB] p-2"><div className={compactLabel}>VISUAL LANGUAGE</div><p className="mt-1 text-[10px] font-bold leading-snug">{concept.visualLanguage}</p></div>
               <div className="rounded-[7px] border-[2px] border-black/25 bg-[#F6F8FB] p-2"><div className={compactLabel}>NARRATIVE SHAPE</div><p className="mt-1 text-[10px] font-bold leading-snug">{concept.narrativeShape}</p></div>
              </div>
             </div>
            </button>
           </article>
          )
         })}
         <div className="grid grid-cols-[100px_1fr] gap-2">
          <StandardInput aria-label="Scene count" type="number" min={3} max={12} value={sceneCount} onChange={event => setSceneCount(Math.max(3, Math.min(12, Number(event.target.value) || 6)))} style={{ fontSize: "16px" }} />
          <SubToolboxGridActionButton label={sceneGenerating ? "DESIGNING…" : "BUILD SCENE BLUEPRINT"} iconName="video" tone="cyan" onClick={() => void buildScenes()} disabled={!selectedConcept || sceneGenerating} />
         </div>
        </div>
       ) : (
        <div className="grid min-h-[220px] place-items-center rounded-[9px] border-[3px] border-black/20 bg-[#F6F8FB] p-5 text-center">
         <div><Sparkles className="mx-auto mb-2" /><p className="text-[13px] font-[1000] uppercase text-[#26324A]">Forge the brief to compare three creative directions.</p></div>
        </div>
       )}
      </SubToolbox>
     </div>

     <div className="space-y-2">
      <SubToolbox
       title="SCENE DESIGN STUDIO"
       subtitle="Direct purpose, narration, visuals, camera, prompt, timing, and continuity"
       icon={<Clapperboard />}
       isOpenInitial
       openUnits={7}
       overflowVisible
       helpText="Scenes are production blueprints, not just script paragraphs. Every scene carries intent, shot grammar, prompt material, asset needs, timing, transition, and continuity."
      >
       <div className="mb-2 rounded-[9px] border-[3px] border-black bg-[#F6F8FB] p-2">
        <label className={compactLabel}>SCRIPT BEATS</label>
        <StandardTextArea
         aria-label="Script beats"
         value={scriptBeatsText}
         onChange={event => setScriptBeatsText(event.target.value)}
         placeholder={"Paste or write one script beat per line. Scene Design preserves these as structural source material.\n\nExample:\nThe impossible result\nThe deception is established\nThe trap closes\nThe payoff"}
         minHeight="112px"
         style={{ minHeight: "112px", textTransform: "none", fontWeight: 700, fontSize: "16px" }}
        />
        <p className="mt-1 text-[9px] font-bold leading-snug text-[#26324A]/60">Optional · one beat per line · carried into governed scene generation and the production packet.</p>
       </div>
       {scenes.length ? (
        <div className="space-y-2">
         {scenes.map((scene, index) => (
          <article key={scene.id} className={card}>
           <div className="flex items-center gap-2 border-b-[3px] border-black bg-[#F6F8FB] p-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] border-[2px] border-black bg-[#A8DC4A] text-[10px] font-[1000]">{scene.order}</span>
            <div className="min-w-0 flex-1">
             <div className={compactLabel}>{scene.role}</div>
             <StandardInput aria-label={`Scene ${scene.order} title`} value={scene.title} onChange={event => updateScene(scene.id, "title", event.target.value)} minHeight="36px" style={{ minHeight: "36px", fontSize: "16px", textTransform: "none" }} />
            </div>
            <div className="flex shrink-0 gap-1">
             <button type="button" aria-label="Move scene up" disabled={index === 0} onClick={() => setScenes(current => moveScene(current, index, index - 1))} className="grid h-9 w-9 place-items-center rounded-[6px] border-[2px] border-black bg-white disabled:opacity-30"><ArrowUp size={16} /></button>
             <button type="button" aria-label="Move scene down" disabled={index === scenes.length - 1} onClick={() => setScenes(current => moveScene(current, index, index + 1))} className="grid h-9 w-9 place-items-center rounded-[6px] border-[2px] border-black bg-white disabled:opacity-30"><ArrowDown size={16} /></button>
             <button type="button" aria-label="Delete scene" onClick={() => removeScene(scene.id)} className="grid h-9 w-9 place-items-center rounded-[6px] border-[2px] border-black bg-[#FF9CD8]"><Trash2 size={16} /></button>
            </div>
           </div>
           <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2">
            <div>
             <label className={compactLabel}>NARRATION / BEAT</label>
             <StandardTextArea aria-label={`Scene ${scene.order} narration`} value={scene.narration} onChange={event => updateScene(scene.id, "narration", event.target.value)} minHeight="100px" style={{ minHeight: "100px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
            </div>
            <div>
             <label className={compactLabel}>VISUAL DIRECTION</label>
             <StandardTextArea aria-label={`Scene ${scene.order} visual direction`} value={scene.visualDirection} onChange={event => updateScene(scene.id, "visualDirection", event.target.value)} minHeight="100px" style={{ minHeight: "100px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
            </div>
            <div>
             <label className={compactLabel}>SHOT + CAMERA</label>
             <StandardTextArea aria-label={`Scene ${scene.order} camera`} value={`${scene.shot}\n${scene.camera}`} onChange={event => {
              const [shot, ...camera] = event.target.value.split("\n")
              updateScene(scene.id, "shot", shot)
              updateScene(scene.id, "camera", camera.join("\n"))
             }} minHeight="86px" style={{ minHeight: "86px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
            </div>
            <div>
             <label className={compactLabel}>GENERATION PROMPT</label>
             <StandardTextArea aria-label={`Scene ${scene.order} generation prompt`} value={scene.visualPrompt} onChange={event => updateScene(scene.id, "visualPrompt", event.target.value)} minHeight="86px" style={{ minHeight: "86px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
            </div>
            <div className="md:col-span-2">
             <label className={compactLabel}>MOTION BRIEF</label>
             <StandardTextArea aria-label={`Scene ${scene.order} motion brief`} value={scene.motionBrief} onChange={event => updateScene(scene.id, "motionBrief", event.target.value)} minHeight="72px" style={{ minHeight: "72px", textTransform: "none", fontWeight: 700, fontSize: "16px" }} />
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-2 md:col-span-2">
             <div>
              <label className={compactLabel}>SECONDS</label>
              <StandardInput aria-label={`Scene ${scene.order} duration`} type="number" min={1} value={scene.durationSeconds} onChange={event => updateScene(scene.id, "durationSeconds", Math.max(1, Number(event.target.value) || 1))} style={{ fontSize: "16px" }} />
             </div>
             <div>
              <label className={compactLabel}>TRANSITION</label>
              <StandardInput aria-label={`Scene ${scene.order} transition`} value={scene.transition} onChange={event => updateScene(scene.id, "transition", event.target.value)} style={{ fontSize: "16px", textTransform: "none" }} />
             </div>
            </div>
            <div className="md:col-span-2">
             <div className={compactLabel}>ASSET NEEDS</div>
             <div className="mt-1 flex flex-wrap gap-1">{scene.assetNeeds.map(asset => <span key={asset} className="rounded-[5px] border-[2px] border-black bg-[#EEF2F7] px-2 py-1 text-[8px] font-[1000] uppercase">{asset}</span>)}</div>
            </div>
           </div>
          </article>
         ))}
         <SubToolboxInnerActionButton label="ADD SCENE" iconName="video" tone="green" onClick={addScene} className="w-full" />
        </div>
       ) : (
        <div className="grid min-h-[320px] place-items-center rounded-[9px] border-[3px] border-black/20 bg-[#F6F8FB] p-5 text-center">
         <div><Clapperboard className="mx-auto mb-2" /><p className="text-[13px] font-[1000] uppercase text-[#26324A]">Select a direction and build its scene blueprint.</p></div>
        </div>
       )}
      </SubToolbox>

      <SubToolbox
       title="PRODUCTION HANDOFF"
       subtitle="One blueprint, four destinations, shared Project + ContentBuild identity"
       icon={<Send />}
       isOpenInitial
       openUnits={4}
       helpText="Each handoff records a shared action packet, generation artifact, workflow chain, and ContentBuild event before navigating to the destination."
      >
       <div className={compactLabel}>READINESS REVIEW</div>
       <div className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <div className="rounded-[7px] border-[2px] border-black bg-white p-2"><div className={compactLabel}>DIRECTION</div><div className="mt-1 text-[11px] font-[1000] uppercase">{selectedConcept?.label || "—"}</div></div>
        <div className="rounded-[7px] border-[2px] border-black bg-white p-2"><div className={compactLabel}>SCENES</div><div className="mt-1 text-[11px] font-[1000]">{scenes.length}</div></div>
        <div className="rounded-[7px] border-[2px] border-black bg-white p-2"><div className={compactLabel}>ASSETS</div><div className="mt-1 text-[11px] font-[1000]">{new Set(scenes.flatMap(scene => scene.assetNeeds)).size}</div></div>
        <div className="rounded-[7px] border-[2px] border-black bg-white p-2"><div className={compactLabel}>READY</div><div className="mt-1 text-[11px] font-[1000]">{readiness}%</div></div>
       </div>
       <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SubToolboxGridActionButton label="STORYBOARD STUDIO" iconName="video" tone="yellow" onClick={() => sendProductionHandoff("storyboard-studio")} disabled={!selectedConcept || !scenes.length} />
        <SubToolboxGridActionButton label="VIDEO DIRECTOR" iconName="sparkles" tone="purple" onClick={() => sendProductionHandoff("video-director")} disabled={!selectedConcept || !scenes.length} />
        <SubToolboxGridActionButton label="VIDEO ASSET ENGINE" iconName="layers" tone="cyan" onClick={() => sendProductionHandoff("video-asset-engine")} disabled={!selectedConcept || !scenes.length} />
        <SubToolboxGridActionButton label="VIDEO EDITOR" iconName="video" tone="green" onClick={() => sendProductionHandoff("video-editor")} disabled={!selectedConcept || !scenes.length} />
       </div>
       <div className="mt-2 flex items-start gap-2 rounded-[7px] border-[2px] border-black bg-[#EEF2F7] p-2">
        {contentContext ? <Boxes size={18} className="shrink-0" /> : <FileStack size={18} className="shrink-0" />}
        <div className="min-w-0">
         <div className={compactLabel}>{contentContext ? "CONTENTBUILD BOUND" : "CHANNEL-WIDE DRAFT"}</div>
         <p className="mt-1 text-[10px] font-bold leading-snug text-[#26324A]">{handoffStatus}</p>
        </div>
       </div>
      </SubToolbox>
     </div>
    </div>
   </ToolboxScaffold>
  </div>
 )
}

export default ConceptSceneStudio
