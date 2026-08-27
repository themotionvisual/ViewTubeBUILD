import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Brain, Send, Zap } from "lucide-react"
import { useBrain } from "../context/useBrain"
import { hasGeminiKey } from "../services/gemini"
import {
 buildAIBrainContextSnapshot,
 buildAIBrainSystemPrompt,
} from "../services/aiBrainCommandInterface"
import {
 buildCreatorGrowthContext,
 resumeAIBrainThread,
 sanitizeCreatorFacingBrainCopy,
} from "../services/aiBrainConversationStore"
import { runBrainTurn } from "../services/brain/BrainOrchestrator"
import {
 readBrainUserControls,
 type BrainUserControls,
} from "../services/brain/BrainUserControls"
import type { AIBrainConversationTurn } from "../types"
import { BrainAnswerModuleGrid } from "./brain/BrainAnswerModules"
import { BrainEvidenceDrawer } from "./brain/BrainEvidenceDrawer"

export const SidebarChatbot: React.FC = () => {
 const { brain, authState, channelConnection, emitSignal, getBrainMemory } = useBrain()
 const [input, setInput] = useState("")
 const [busy, setBusy] = useState(false)
 const [turns, setTurns] = useState<AIBrainConversationTurn[]>([])
 const [activeTurn, setActiveTurn] = useState<AIBrainConversationTurn | null>(null)
 const [controls, setControls] = useState<BrainUserControls>(() => readBrainUserControls())
 const channelId = authState.channelHandle || authState.channelId || null

 const snapshot = useMemo(() => buildAIBrainContextSnapshot({
  brain,
  authState,
  channelConnection,
  brainMemory: controls.personalization ? getBrainMemory() : null,
  recentConversationTurns: controls.personalization ? turns : [],
 }), [brain, authState, channelConnection, turns, controls.personalization])
 const growthContext = useMemo(() => buildCreatorGrowthContext(snapshot, turns, []), [snapshot, turns])

 const restore = async () => {
  try {
   const resumed = await resumeAIBrainThread(channelId)
   const latestFirst = resumed.turns.slice().reverse()
   setTurns(latestFirst)
   setActiveTurn(latestFirst.find((turn) => turn.response && turn.metadata?.source !== "feedback") || null)
  } catch (error) {
   console.warn("[SidebarCopilot] Shared thread unavailable:", error)
  }
 }

 useEffect(() => { void restore() }, [channelId])
 useEffect(() => {
  const onControls = (event: Event) => {
   const detail = (event as CustomEvent<BrainUserControls>).detail
   setControls(detail || readBrainUserControls())
  }
  window.addEventListener("vt_brain_user_controls_changed", onControls as EventListener)
  return () => window.removeEventListener("vt_brain_user_controls_changed", onControls as EventListener)
 }, [])

 const handleSend = async () => {
  const userText = input.trim()
  if (!userText || busy || !controls.enabled) return
  setInput("")
  setBusy(true)
  void emitSignal("VIEWTUBE_COPILOT", "USER_MESSAGE", { text: userText })
  try {
   const systemPrompt = buildAIBrainSystemPrompt({
    brain,
    authState,
    channelConnection,
    brainMemory: controls.personalization ? getBrainMemory() : null,
    recentConversationTurns: controls.personalization ? turns : [],
    creatorGrowthContext: growthContext,
   })
   const result = await runBrainTurn({
    channelId,
    userText,
    snapshot,
    systemPrompt,
    growthContext,
    recentTurns: controls.personalization ? turns : [],
    history: controls.personalization ? turns.slice(0, 4).reverse().flatMap((turn) => [
     { role: "user", parts: [{ text: turn.userText }] },
     { role: "model", parts: [{ text: turn.assistantText }] },
    ]) : [],
    allowModel: hasGeminiKey(),
   })
   setActiveTurn(result.turn)
   await restore()
  } catch (error) {
   console.warn("[SidebarCopilot] Response unavailable:", error)
   setInput(userText)
  } finally {
   setBusy(false)
  }
 }

 return (
  <section className="flex max-h-[520px] flex-col overflow-hidden rounded-[14px] border-[2px] border-black bg-white shadow-[4px_4px_0_0_#000]" aria-label="ViewTube Copilot">
   <header className="flex shrink-0 items-center justify-between gap-2 border-b-[2px] border-black bg-[#C0F240] px-3 py-2">
    <span className="inline-flex items-center gap-2 text-[10px] font-[1000] uppercase tracking-[0.08em]"><Brain size={15} />ViewTube Copilot</span>
    <Link to="/ai-brain" className="inline-flex items-center gap-1 text-[9px] font-black uppercase">Open Hub <ArrowRight size={11} /></Link>
   </header>

   <div className="grid min-h-[132px] flex-1 content-start gap-2 overflow-y-auto p-3">
    {activeTurn?.response ? (
     <>
      <p className="text-xs font-black leading-5">{sanitizeCreatorFacingBrainCopy(activeTurn.response.keyInsight)}</p>
      <BrainAnswerModuleGrid modules={(activeTurn.response.modules || []).slice(0, 1)} compact />
      {controls.showEvidence ? (
       <BrainEvidenceDrawer
        evidencePack={snapshot.evidencePack}
        confidence={activeTurn.response.confidence}
        inference
        summaryLabel="Why this answer?"
        caveats={activeTurn.response.evidenceIds?.length
         ? []
         : ["This answer has limited channel-specific evidence attached."]}
       />
      ) : null}
     </>
    ) : (
     <div>
      <h3 className="text-base font-[1000] uppercase">How can I help?</h3>
      <p className="mt-1 text-[10px] font-bold leading-4 text-black/60">Ask about your next video, audience, analytics, goals, packaging, publishing, or revenue.</p>
     </div>
    )}
    {busy ? <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase"><Zap size={12} className="animate-pulse" />Building a channel-specific answer</span> : null}
   </div>

   <div className="flex shrink-0 gap-2 border-t-[2px] border-black bg-[#f8f8f4] p-2">
    <input
     type="text"
     value={input}
     onChange={(event) => setInput(event.target.value)}
     onKeyDown={(event) => { if (event.key === "Enter") void handleSend() }}
     placeholder={controls.enabled ? "Ask ViewTube Copilot..." : "Brain is disabled in User Controls"}
     disabled={!controls.enabled}
     className="min-w-0 flex-1 rounded-[8px] border-[2px] border-black bg-white px-2 py-1.5 text-[11px] font-bold outline-none focus:bg-[#FFDA47]/20 disabled:bg-black/5 disabled:text-black/35"
    />
    <button type="button" onClick={() => void handleSend()} disabled={!input.trim() || busy || !controls.enabled} className="grid w-9 shrink-0 place-items-center rounded-[8px] border-[2px] border-black bg-[#3FEE56] disabled:opacity-40" aria-label="Send to ViewTube Copilot">
     <Send size={14} />
    </button>
   </div>
  </section>
 )
}
