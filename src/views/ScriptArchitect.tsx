import React, { useState } from "react"
import {
 AlertTriangle,
 ArrowDown,
 ArrowUp,
 Clapperboard,
 Clock,
 FileText,
 Layers,
 Link2,
 NotebookPen,
 Plus,
 Save,
 ShieldCheck,
 Smartphone,
 Sparkles,
 Trash2,
} from "lucide-react"
import {
 StandardInput,
 StandardTextArea,
 SubToolbox,
 SubToolboxDropdownControl,
 SubToolboxGridActionButton,
 ToolboxScaffold,
} from "../components/Toolbox"
import { PostActionReflection } from "../components/PostActionReflection"
import {
 SubToolboxButton,
 SubToolboxIconButton,
 SubToolboxSegmentedToggle,
 SubToolboxSelectableListRow,
 SubToolboxStepper,
} from "../components/subtoolbox/SubToolboxPrimitives"
import { formatClock } from "../services/scriptBudget"
import {
 FRAGMENT_MODES,
 GOAL_OPTIONS,
 PACING_OPTIONS,
 TONE_OPTIONS,
 useScriptArchitect,
} from "../features/script-architect/useScriptArchitect"
import { getToolboxPaletteColors } from "../styles/toolboxPalette"
import type { FragmentMode } from "../types"

interface ScriptArchitectProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const FRAGMENT_TONE: Record<FragmentMode, string> = {
 lock: "bg-[#FF77D6]",
 improve: "bg-[#73DEFF]",
 inspire: "bg-[#CCFF00]",
}

const fieldLabel = "text-[10px] font-black uppercase tracking-widest text-black/50"

const ScriptArchitect: React.FC<ScriptArchitectProps> = ({
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
}) => {
 const architect = useScriptArchitect()
 const [isOpen, setIsOpen] = useState(isOpenInitial)
 const { project, budget, result } = architect

 const segmentColor = (index: number) => getToolboxPaletteColors(index + 1).header

 return (
  <ToolboxScaffold
   title="SCRIPT ARCHITECT"
   subtitle="Give it a spark or give it everything — assembles a timed script, visuals + priming shorts"
   icon={<NotebookPen size={40} strokeWidth={3} className="text-black" />}
   headerColor="bg-[#00F0FF]"
   iconBoxColor="bg-[#CCFF00]"
   paletteIndex={paletteIndex}
   collapsible={collapsible}
   isOpen={isOpen}
   onToggle={() => setIsOpen(!isOpen)}
   embedded={embedded}
   helpText="Fill in as much or as little as you want — every field is optional. Paste your own script pieces and mark them Lock (used word-for-word), Improve (rewritten), or Inspire (direction only), then hit Assemble Script."
   shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}>
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start w-full">
    {/* ---------------- INPUTS ---------------- */}
    <div className="flex flex-col gap-6 min-w-0">
     <SubToolbox
      title={`Script Vault · ${architect.drafts.length}`}
      subtitle={
       architect.restoredFromDraft
        ? "Your last draft was restored — everything autosaves as you type"
        : "Everything autosaves as you type"
      }
      icon={<Save />}
      collapsible
      isOpenInitial={false}>
      <div className="space-y-3">
       <div className="flex gap-2">
        <div className="flex-1 min-w-0">
         <StandardInput
          aria-label="Draft name"
          value={architect.draftName}
          onChange={(event) => architect.setDraftName(event.target.value)}
          placeholder="NAME THIS SCRIPT…"
          minHeight="48px"
         />
        </div>
        <SubToolboxButton level="l1" size="standard" tone="accent" onClick={architect.saveDraft}>
         Save
        </SubToolboxButton>
        <SubToolboxButton
         level="l1"
         size="standard"
         tone="neutral"
         onClick={architect.startNewDraft}
         title="Clear the workspace — saved drafts are untouched">
         New
        </SubToolboxButton>
       </div>
       {architect.drafts.map((draft) => (
        <div key={draft.id} className="grid grid-cols-[1fr_auto] gap-2">
         <SubToolboxSelectableListRow
          level="l2"
          className="min-w-0"
          title={draft.name || draft.project.topic || "Untitled script"}
          detail={`${draft.project.targetMinutes} min · ${draft.project.chapters.length} chapters${draft.result ? " · assembled" : ""}`}
          onClick={() => architect.loadDraft(draft.id)}
         />
         <SubToolboxIconButton
          level="l2"
          ariaLabel={`Delete draft ${draft.name}`}
          icon={<Trash2 size={15} strokeWidth={3} />}
          onClick={() => architect.deleteDraft(draft.id)}
         />
        </div>
       ))}
       ))}
       {!architect.drafts.length && (
        <p className="p-3 text-center text-[10px] font-black uppercase opacity-50">
         No saved drafts yet.
        </p>
       )}
      </div>
     </SubToolbox>

     <SubToolbox
      title="The Brief"
      subtitle="Everything optional — the engine fills the gaps"
      icon={<Sparkles />}
      collapsible
      isOpenInitial>
      <div className="space-y-4">
       <div>
        <label htmlFor="sa-topic" className={fieldLabel}>
         Topic
        </label>
        <StandardInput
         id="sa-topic"
         name="scriptTopic"
         value={project.topic}
         onChange={(event) => architect.setField("topic", event.target.value)}
         placeholder="WHAT THE VIDEO IS ABOUT…"
         className="mt-2"
        />
       </div>
       <div>
        <label htmlFor="sa-angle" className={fieldLabel}>
         Angle
        </label>
        <StandardInput
         id="sa-angle"
         name="scriptAngle"
         value={project.angle || ""}
         onChange={(event) => architect.setField("angle", event.target.value)}
         placeholder="THE SPECIFIC TAKE — CONTRARIAN, BEGINNER, DEEP-DIVE…"
         className="mt-2"
        />
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="min-w-0">
         <label htmlFor="sa-niche" className={fieldLabel}>
          Channel niche
         </label>
         <StandardInput
          id="sa-niche"
          name="scriptNiche"
          value={project.niche || ""}
          onChange={(event) => architect.setField("niche", event.target.value)}
          placeholder="YOUR LANE…"
          className="mt-2"
         />
        </div>
        <div className="min-w-0">
         <label htmlFor="sa-audience" className={fieldLabel}>
          Ideal audience
         </label>
         <StandardInput
          id="sa-audience"
          name="scriptAudience"
          value={project.audience || ""}
          onChange={(event) => architect.setField("audience", event.target.value)}
          placeholder="WHO THIS IS FOR…"
          className="mt-2"
         />
        </div>
       </div>
       <SubToolboxDropdownControl
        label="Tone / voice"
        value={project.tone || TONE_OPTIONS[0]}
        options={TONE_OPTIONS}
        onChange={(value) => architect.setField("tone", value)}
        tone="pink"
       />
       <SubToolboxDropdownControl
        label="Goal / CTA"
        value={project.goal || GOAL_OPTIONS[0]}
        options={GOAL_OPTIONS}
        onChange={(value) => architect.setField("goal", value)}
        tone="cyan"
       />
      </div>
     </SubToolbox>

     <SubToolbox
      title="Format & Pacing"
      subtitle="Duration drives the word budget"
      icon={<Clock />}
      collapsible
      isOpenInitial>
      <div className="space-y-4">
       <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className={fieldLabel}>Target length</span>
        <SubToolboxStepper
         level="l1"
         value={`${project.targetMinutes} MIN`}
         decreaseLabel="Decrease target length"
         increaseLabel="Increase target length"
         onDecrease={() => architect.setField("targetMinutes", Math.max(1, project.targetMinutes - 1))}
         onIncrease={() => architect.setField("targetMinutes", Math.min(90, project.targetMinutes + 1))}
        />
       </div>
       </div>

       <div>
        <span className={fieldLabel}>Pacing</span>        </div>
       </div>

       <div>
        <span className={fieldLabel}>Pacing</span>
        <SubToolboxSegmentedToggle
         level="l1"
         className="mt-2"
         ariaLabel="Pacing"
         value={project.pacing}
         options={PACING_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
         onValueChange={(value) => architect.setField("pacing", value as typeof project.pacing)}
        />
       </div>

       <div className="grid grid-cols-2 gap-2">        </div>
       </div>

       <div className="grid grid-cols-2 gap-2">
        {(
         [
          ["includeHook", "Hook"],
          ["includeOutro", "Outro / CTA"],
         ] as const
        ).map(([key, label]) => (
         <SubToolboxButton
          key={key}
          level="l1"
          size="standard"
          tone="neutral"
          selected={project[key]}
          onClick={() => architect.setField(key, !project[key])}>
          {project[key] ? `✓ ${label}` : label}
         </SubToolboxButton>
        ))}
       </div>

       <div className="border-[3px] border-black rounded-xl bg-[#FFF9E8]       </div>

       <div className="border-[3px] border-black rounded-xl bg-[#FFF9E8] p-4 grid grid-cols-3 gap-2 text-center">
        <div>
         <div className="text-[9px] font-black uppercase tracking-widest text-black/40">Words</div>
         <div className="text-xl font-[1000]">{budget.wordBudget}</div>
        </div>
        <div>
         <div className="text-[9px] font-black uppercase tracking-widest text-black/40">WPM</div>
         <div className="text-xl font-[1000]">{budget.wpm}</div>
        </div>
        <div>
         <div className="text-[9px] font-black uppercase tracking-widest text-black/40">Sections</div>
         <div className="text-xl font-[1000]">{budget.sections.length}</div>
        </div>
       </div>
      </div>
     </SubToolbox>

     <SubToolbox
      title={`Chapter Builder · ${project.chapters.length}`}
      subtitle="Structure — name, cover, and runtime weight"
      icon={<Layers />}
      collapsible
      isOpenInitial>
      <div className="space-y-3">
       {project.chapters.map((chapter, index) => (
        <div key={chapter.id} className="border-[3px] border-black rounded-xl p-3 bg-white space-y-2">
         <div className="flex items-center gap-2">
          <span className="size-8 shrink-0 grid place-items-center border-[2px] border-black rounded-lg bg-[#B14BFF] text-white font-black text-[10px]">
           {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
           <StandardInput
            aria-label={`Chapter ${index + 1} name`}
            value={chapter.name}
            onChange={(event) => architect.updateChapter(chapter.id, { name: event.target.value })}
            placeholder={`CHAPTER ${index + 1} NAME…`}
            minHeight="48px"
           />
          </div>
          <SubToolboxIconButton
           level="l2"
           ariaLabel={`Move chapter ${index + 1} up`}
           icon={<ArrowUp size={14} strokeWidth={3} />}
           disabled={index === 0}
           onClick={() => architect.moveChapter(chapter.id, -1)}
          />
          <SubToolboxIconButton
           level="l2"
           ariaLabel={`Move chapter ${index + 1} down`}
           icon={<ArrowDown size={14} strokeWidth={3} />}
           disabled={index === project.chapters.length - 1}
           onClick={() => architect.moveChapter(chapter.id, 1)}
          />
          <SubToolboxIconButton
           level="l2"
           ariaLabel={`Remove chapter ${index + 1}`}
           icon={<Trash2 size={14} strokeWidth={3} />}
           onClick={() => architect.removeChapter(chapter.id)}
          />
         </div>
         <div className="grid grid-cols-[1fr_88px] gap-2">         </div>
         <div className="grid grid-cols-[1fr_88px] gap-2">
          <div className="min-w-0">
           <StandardInput
            aria-label={`Chapter ${index + 1} description`}
            value={chapter.description}
            onChange={(event) =>
             architect.updateChapter(chapter.id, { description: event.target.value })
            }
            placeholder="WHAT THIS CHAPTER COVERS…"
            minHeight="48px"
           />
          </div>
          <div className="min-w-0">
           <StandardInput
            aria-label={`Chapter ${index + 1} runtime weight`}
            title="Runtime weight — how much of the body this chapter deserves"
            type="number"
            min={0.5}
            step={0.5}
            value={chapter.weight ?? 1}
            onChange={(event) =>
             architect.updateChapter(chapter.id, { weight: Number(event.target.value) || 1 })
            }
            minHeight="48px"
            className="text-center"
           />
          </div>
         </div>
         <div className="text-[9px] font-black uppercase tracking-widest text-black/40">
          {budget.sections.find((section) => section.id === chapter.id)?.words ?? 0} words ·{" "}
          {formatClock(budget.sections.find((section) => section.id === chapter.id)?.minutes ?? 0)}
         </div>
        </div>
       ))}
       {!project.chapters.length && (
        <p className="p-4 text-center text-[10px] font-black uppercase opacity-50">
         No chapters — the engine will infer a structure.
        </p>
       )}
       <SubToolboxButton level="l1" size="standard" icon={<Plus size={16} strokeWidth={3} />} onClick={architect.addChapter}>
        Add chapter
       </SubToolboxButton>
      </div>
     </SubToolbox>

     <SubToolbox
      title={`References · ${project.globalReferences.length}`}
      subtitle="Grounding — claims track your research, not the model's guesses"
      icon={<Link2 />}
      collapsible
      isOpenInitial={false}>
      <div className="space-y-3">
       {project.globalReferences.map((reference, index) => (
        <div key={reference.id} className="border-[3px] border-black rounded-xl p-3 bg-white space-y-2">
         <div className="flex gap-2">
          <div className="flex-1 min-w-0">
           <StandardInput
            aria-label={`Reference ${index + 1} link`}
            type="url"
            value={reference.url || ""}
            onChange={(event) => architect.updateReference(reference.id, { url: event.target.value })}
            placeholder="HTTPS://…"
            minHeight="48px"
           />
          </div>
          <SubToolboxIconButton
           level="l2"
           ariaLabel={`Remove reference ${index + 1}`}
           icon={<Trash2 size={14} strokeWidth={3} />}
           onClick={() => architect.removeReference(reference.id)}
          />
         </div>
         <StandardTextArea
          aria-label={`Reference ${index + 1} note`}
          value={reference.note || ""}
          onChange={(event) => architect.updateReference(reference.id, { note: event.target.value })}
          placeholder="PASTED NOTES, QUOTES, OR FACTS FROM THIS SOURCE…"
          minHeight="70px"
         />
        </div>
       ))}
       {!project.globalReferences.length && (
        <p className="p-4 text-center text-[10px] font-black uppercase opacity-50">
         No references — specific stats and quotes will be avoided.
        </p>
       )}
       <SubToolboxButton level="l1" size="standard" icon={<Plus size={16} strokeWidth={3} />} onClick={architect.addReference}>
        Add reference
       </SubToolboxButton>
      </div>
     </SubToolbox>

     <SubToolbox
      title={`Your Script Pieces · ${project.globalFragments.length}`}
      subtitle="Lock = word-for-word · Improve = rewritten · Inspire = direction only"
      icon={<FileText />}
      collapsible
      isOpenInitial={false}>
      <div className="space-y-3">
       {project.globalFragments.map((fragment, index) => (
        <div key={fragment.id} className="border-[3px] border-black rounded-xl bg-white overflow-hidden">
         <div
          className={`flex items-center gap-2 p-2 border-b-[3px] border-black ${FRAGMENT_TONE[fragment.mode]}`}>
          <div className="flex-1 min-w-0">
           <StandardInput
            aria-label={`Piece ${index + 1} label`}
            value={fragment.label}
            onChange={(event) => architect.updateFragment(fragment.id, { label: event.target.value })}
            placeholder={`PIECE ${index + 1} — E.G. COLD OPEN`}
            minHeight="48px"
           />
          </div>
          <SubToolboxIconButton
           level="l2"
           ariaLabel={`Remove piece ${index + 1}`}
           icon={<Trash2 size={14} strokeWidth={3} />}
           onClick={() => architect.removeFragment(fragment.id)}
          />
         </div>
         <div className="p-3 space-y-2">
          <SubToolboxSegmentedToggle
           level="l2"
           ariaLabel={`Piece ${index + 1} mode`}
           value={fragment.mode}
           options={FRAGMENT_MODES.map((mode) => ({
            value: mode.id,
            label: <span title={mode.hint}>{mode.label}</span>,
           }))}
           onValueChange={(value) => architect.updateFragment(fragment.id, { mode: value as FragmentMode })}
          />
          <StandardTextArea
           aria-label={`Piece ${index + 1} text`}          <StandardTextArea
           aria-label={`Piece ${index + 1} text`}
           value={fragment.text}
           onChange={(event) => architect.updateFragment(fragment.id, { text: event.target.value })}
           placeholder="PASTE THE LINES YOU ALREADY WROTE…"
           minHeight="90px"
          />
          <SubToolboxDropdownControl
           label="Pin to section"
           value={
            architect.sectionPinOptions.find((option) => option.id === (fragment.chapterId || ""))
             ?.label || "Unpinned"
           }
           options={architect.sectionPinOptions.map((option) => option.label)}
           onChange={(label) =>
            architect.updateFragment(fragment.id, {
             chapterId:
              architect.sectionPinOptions.find((option) => option.label === label)?.id || undefined,
            })
           }
           tone="orange"
          />
          <p className="text-[9px] font-black uppercase tracking-widest text-black/40">
           {FRAGMENT_MODES.find((mode) => mode.id === fragment.mode)?.hint}
          </p>
         </div>
        </div>
       ))}
       {!project.globalFragments.length && (
        <p className="p-4 text-center text-[10px] font-black uppercase opacity-50">
         Nothing pasted yet — the script will be written from scratch.
        </p>
       )}
       <SubToolboxButton level="l1" size="standard" icon={<Plus size={16} strokeWidth={3} />} onClick={architect.addFragment}>
        Add script piece
       </SubToolboxButton>
      </div>
     </SubToolbox>
    </div>

    {/* ---------------- ASSEMBLE + OUTPUTS ---------------- */}
    <div className="flex flex-col gap-6 min-w-0">
     <SubToolbox
      title="Assemble"
      subtitle="Everything above → one script"
      icon={<Sparkles />}
      collapsible
      isOpenInitial>
      <div className="space-y-4">
       <div>
        <div className="flex w-full border-[3px] border-black rounded-xl overflow-hidden shadow-[3px_3px_0_0_black]">
         {budget.sections.map((section, index) => (
          <div
           key={section.id}
           className="min-w-0 px-2 py-3 border-r-[3px] border-black last:border-r-0 flex flex-col gap-0.5"
           style={{ flex: Math.max(0.4, section.minutes), backgroundColor: segmentColor(index) }}
           title={`${section.label} · ${section.words} words`}>
           <span className="text-[9px] font-black uppercase truncate">{section.label}</span>
           <span className="text-[10px] font-black">{formatClock(section.minutes)}</span>
          </div>
         ))}
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-widest text-black/50">
         <span>Allocated · {formatClock(budget.allocatedMinutes)}</span>
         <span>
          Target · {formatClock(budget.targetMinutes)} ·{" "}
          <span className={budget.headroomMinutes >= 0 ? "text-[#1F9D55]" : "text-[#D6246E]"}>
           {budget.headroomMinutes >= 0 ? "▲" : "▼"} {formatClock(Math.abs(budget.headroomMinutes))}
          </span>
         </span>
        </div>
       </div>

       {budget.lockedOverflow && (
        <div role="alert" className="border-[3px] border-black bg-[#FFB158] rounded-xl p-3 flex gap-2">
         <AlertTriangle size={18} strokeWidth={3} className="shrink-0 mt-0.5" />
         <p className="text-[10px] font-black uppercase leading-relaxed">
          Locked pieces ({budget.lockedWords} words) exceed the {budget.wordBudget}-word budget.
          Raise the target length or switch a piece to Improve so it can be trimmed.
         </p>
        </div>
       )}

       <SubToolboxGridActionButton
        label={architect.loading ? "Assembling…" : "Assemble Script"}
        iconName="sparkles"
        tone="pink"
        disabled={architect.loading}
        onClick={architect.assemble}
       />

       {architect.error && (
        <div role="alert" className="border-[3px] border-black bg-[#FF9CD8] rounded-xl p-3 text-[10px] font-black uppercase">
         {architect.error}
        </div>
       )}
       <div role="status" aria-live="polite" className="min-h-4 text-[10px] font-black uppercase text-black/60">
        {architect.status || ""}
       </div>
      </div>
     </SubToolbox>

     {architect.loading && !result && (
      <div className="min-h-[320px] flex flex-col items-center justify-center border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50">
       <div className="w-20 h-20 bg-[#00F0FF] border-[4px] border-black rounded-full animate-ping mb-8 shadow-[6px_6px_0px_0px_black]" />
       <p className="font-black text-xl text-black/40 uppercase tracking-widest animate-pulse">
        Budgeting sections + writing…
       </p>
      </div>
     )}

     {!result && !architect.loading && (
      <div className="min-h-[320px] flex flex-col items-center justify-center border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50 p-8 text-center">
       <NotebookPen size={72} className="text-black/20 mb-6" />
       <h3 className="text-2xl font-[1000] text-black/40 uppercase tracking-tighter mb-2">
        A Spark Is Enough
       </h3>
       <p className="text-black/30 font-bold max-w-md uppercase text-sm">
        Type a topic and hit assemble. Add chapters, references and your own lines whenever you
        want more control — nothing you write by hand gets overwritten.
       </p>
      </div>
     )}

     {result && (
      <>
       {(result.assumptions.length > 0 || result.groundingNotes.length > 0) && (
        <SubToolbox
         title="Assumptions & Grounding"
         subtitle="What was inferred, and what the references could not support"
         icon={<AlertTriangle />}
         collapsible
         isOpenInitial>
         <div className="space-y-4">
          {result.assumptions.length > 0 && (
           <div>
            <h4 className={fieldLabel}>Inferred for you</h4>
            <ul className="mt-2 space-y-1">
             {result.assumptions.map((item, index) => (
              <li key={index} className="text-xs font-bold uppercase leading-snug">
               • {item}
              </li>
             ))}
            </ul>
           </div>
          )}
          {result.groundingNotes.length > 0 && (
           <div>
            <h4 className={fieldLabel}>Not grounded by your references</h4>
            <ul className="mt-2 space-y-1">
             {result.groundingNotes.map((item, index) => (
              <li key={index} className="text-xs font-bold uppercase leading-snug">
               • {item}
              </li>
             ))}
            </ul>
           </div>
          )}
         </div>
        </SubToolbox>
       )}

       <SubToolbox
        title="Visual Outline"
        subtitle="The skeleton before the prose"
        icon={<Layers />}
        collapsible
        isOpenInitial>
        <div className="space-y-3">
         {result.outline.map((entry) => {
          const timed = result.timeline.find((section) => section.id === entry.sectionId)
          return (
           <div key={entry.sectionId} className="border-[3px] border-black rounded-xl bg-white p-3">
            <div className="flex justify-between items-baseline gap-2">
             <h4 className="font-[1000] uppercase text-sm tracking-tight">{entry.section}</h4>
             {timed && (
              <span className="text-[10px] font-black uppercase text-black/50">
               {formatClock(timed.estMinutes)}
              </span>
             )}
            </div>
            <ul className="mt-2 space-y-1">
             {entry.beats.map((beat, beatIndex) => (
              <li key={beatIndex} className="flex gap-2 text-xs font-bold leading-snug">
               <span className="mt-1.5 size-2 shrink-0 border-[1.5px] border-black bg-[#CCFF00]" />
               <span>{beat}</span>
              </li>
             ))}
            </ul>
           </div>
          )
         })}
         {!result.outline.length && (
          <p className="p-4 text-center text-[10px] font-black uppercase opacity-50">
           No outline returned.
          </p>
         )}
        </div>
       </SubToolbox>

       {architect.lockSummary.total > 0 && (
        <SubToolbox
         title={`Your Locked Words · ${architect.lockSummary.verbatim}/${architect.lockSummary.total}`}
         subtitle="Checked against the script itself, not taken on trust"
         icon={<ShieldCheck />}
         collapsible
         isOpenInitial={architect.lockSummary.altered > 0}>
         <div className="space-y-2">
          {architect.lockChecks.map((check) => (
           <div
            key={check.fragmentId}
            className={`border-[3px] border-black rounded-xl p-3 ${
             check.status === "verbatim"
              ? "bg-[#8CFF8F]"
              : check.status === "empty"
                ? "bg-white"
                : "bg-[#FFB158]"
            }`}>
            <div className="flex items-center justify-between gap-2">
             <span className="font-black uppercase text-xs truncate">{check.label}</span>
             <span className="shrink-0 text-[9px] font-black uppercase tracking-widest">
              {check.status === "verbatim"
               ? "✓ Word-for-word"
               : check.status === "empty"
                 ? "Empty"
                 : "⚠ Not reproduced"}
             </span>
            </div>
            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-black/60">
             {check.status === "verbatim"
              ? `Found in ${check.foundInSectionLabel}${check.misplaced ? " — not the section you pinned it to" : ""}`
              : check.status === "empty"
                ? "No text in this piece yet."
                : "The model paraphrased or dropped it."}
            </p>
           </div>
          ))}
          {architect.lockSummary.altered > 0 && (
           <SubToolboxGridActionButton
            label="Restore My Wording"
            iconName="checklist"
            tone="pink"
            onClick={architect.restoreLockedText}
           />
          )}
         </div>
        </SubToolbox>
       )}

       {architect.reconciliation && (
        <SubToolbox
         title="Length Check"
         subtitle="What the script actually delivered against the budget"
         icon={<Clock />}
         collapsible
         isOpenInitial={architect.reconciliation.offTarget}>
         <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center border-[3px] border-black rounded-xl bg-[#FFF9E8] p-3">
           <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-black/40">Words</div>
            <div className="text-xl font-[1000]">{architect.reconciliation.actualWords}</div>
           </div>
           <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-black/40">Runtime</div>
            <div className="text-xl font-[1000]">
             {formatClock(architect.reconciliation.actualMinutes)}
            </div>
           </div>
           <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-black/40">
             Vs target
            </div>
            <div
             className={`text-xl font-[1000] ${architect.reconciliation.offTarget ? "text-[#D6246E]" : "text-[#1F9D55]"}`}>
             {architect.reconciliation.driftMinutes >= 0 ? "+" : "−"}
             {formatClock(Math.abs(architect.reconciliation.driftMinutes))}
            </div>
           </div>
          </div>
          <div className="space-y-1">
           {architect.reconciliation.sections.map((section) => (
            <div
             key={section.sectionId}
             className="flex items-center justify-between gap-2 text-[10px] font-black uppercase">
             <span className="truncate">{section.label}</span>
             <span className="shrink-0 text-black/50">
              {section.actualWords} / {section.allocatedWords} w
              <span
               className={
                Math.abs(section.deltaWords) > Math.max(25, section.allocatedWords * 0.15)
                 ? " text-[#D6246E]"
                 : " text-black/40"
               }>
               {" "}
               ({section.deltaWords >= 0 ? "+" : ""}
               {section.deltaWords})
              </span>
             </span>
            </div>
           ))}
          </div>
          {architect.reconciliation.offTarget && (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SubToolboxGridActionButton
             label="Match Target"
             iconName="target"
             tone="cyan"
             onClick={architect.matchTargetToScript}
            />
            <SubToolboxGridActionButton
             label="Rebalance Weights"
             iconName="layers"
             tone="orange"
             onClick={architect.rebalanceWeightsToScript}
            />
           </div>
          )}
         </div>
        </SubToolbox>
       )}

       <SubToolbox
        title="Full Script"
        subtitle="Edit anything here — counts and lock checks follow your edits"
        icon={<FileText />}
        collapsible
        isOpenInitial>
        <div className="space-y-3">
         <div className="max-h-[520px] overflow-y-auto border-[3px] border-black rounded-xl bg-[#FFF9E8] p-4 space-y-4">
          {result.sections.map((section) => {
           const counts = architect.reconciliation?.sections.find(
            (entry) => entry.sectionId === section.sectionId,
           )
           return (
            <div key={section.sectionId}>
             <div className="flex items-center justify-between gap-2 flex-wrap">
              <h5 className="inline-block border-[2px] border-black bg-[#CCFF00] px-2 py-0.5 font-black uppercase text-[10px] tracking-wider">
               {section.label}
               {section.lockedFragmentIds.length > 0 ? " · locked" : ""}
              </h5>
              {counts && (
               <span className="text-[9px] font-black uppercase tracking-widest text-black/40">
                {counts.actualWords} / {counts.allocatedWords} words
               </span>
              )}
             </div>
             <StandardTextArea
              aria-label={`${section.label} script`}
              value={section.script}
              onChange={(event) =>
               architect.updateSectionScript(section.sectionId, event.target.value)
              }
              placeholder="No copy returned for this section…"
              className="mt-2"
              // Script prose is the one field meant to be read, so it opts out
              // of the standard field's uppercase transform. Inline style is
              // required: the shared rule outranks a utility class.
              style={{ minHeight: "140px", textTransform: "none", fontWeight: 600 }}
             />
            </div>
           )
          })}
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SubToolboxGridActionButton
           label="Copy Script"
           iconName="layers"
           tone="green"
           disabled={!result.fullScript}
           onClick={architect.copyScript}
          />
          <SubToolboxGridActionButton
           label="Save Packet"
           iconName="database"
           tone="yellow"
           onClick={architect.savePacket}
          />
         </div>
        </div>
       </SubToolbox>

       {result.visualSuggestions.length > 0 && (
        <SubToolbox
         title="Visual Suggestions"
         subtitle="B-roll, graphics and overlays per section"
         icon={<Clapperboard />}
         collapsible
         isOpenInitial={false}>
         <div className="space-y-3">
          {result.visualSuggestions.map((suggestion) => {
           const section = result.sections.find(
            (entry) => entry.sectionId === suggestion.sectionId,
           )
           return (
            <div
             key={suggestion.sectionId}
             className="border-[3px] border-black rounded-xl bg-white p-3">
             <h4 className="font-[1000] uppercase text-xs tracking-tight">
              {section?.label || suggestion.sectionId}
             </h4>
             <ul className="mt-2 space-y-1">
              {suggestion.ideas.map((idea, index) => (
               <li key={index} className="flex gap-2 text-xs font-bold leading-snug">
                <span className="mt-1.5 size-2 shrink-0 border-[1.5px] border-black bg-[#73DEFF]" />
                <span>{idea}</span>
               </li>
              ))}
             </ul>
            </div>
           )
          })}
         </div>
        </SubToolbox>
       )}

       {result.shortsIdeas.length > 0 && (
        <SubToolbox
         title={`Priming Shorts · ${result.shortsIdeas.length}`}
         subtitle="Cut from the script to condition the audience before launch"
         icon={<Smartphone />}
         collapsible
         isOpenInitial>
         <div className="space-y-3">
          {result.shortsIdeas.map((short, index) => (
           <div key={index} className="border-[3px] border-black rounded-xl bg-white p-3 space-y-2">
            <div className="flex justify-between items-center gap-2">
             <h4 className="font-[1000] uppercase text-xs tracking-tight">{short.hook}</h4>
             <span className="shrink-0 border-[2px] border-black rounded bg-[#FFC587] px-2 py-0.5 text-[9px] font-black uppercase">
              {short.postWindow}
             </span>
            </div>
            <p className="text-xs font-semibold italic leading-snug border-l-[3px] border-black pl-2">
             {short.excerpt}
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/50">
             {short.primingRationale}
            </p>
           </div>
          ))}
         </div>
        </SubToolbox>
       )}

       <div className="animate-in slide-in-from-bottom-4 duration-700">
        <PostActionReflection toolId="SCRIPT_ARCHITECT" />
       </div>
      </>
     )}
    </div>
   </div>
  </ToolboxScaffold>
 )
}

export default ScriptArchitect
