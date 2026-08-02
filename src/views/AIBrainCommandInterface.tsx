import React, { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
 ArrowRight,
 BookOpen,
 Brain,
 ChevronLeft,
 HelpCircle,
 MessageSquare,
 PanelRight,
 Send,
 ThumbsDown,
 ThumbsUp,
 Zap,
} from "lucide-react"
import { Toolbox } from "../components/Toolbox"
import { useBrain } from "../context/useBrain"
import { TOOLBOX_PALETTE } from "../styles/toolboxPalette"
import { hasGeminiKey } from "../services/gemini"
import {
 AI_BRAIN_INTAKE_QUESTIONS,
 dismissAiBrainIntake,
 loadAiBrainContext,
 saveAiBrainContext,
 shouldShowAiBrainIntake,
 type AiBrainContext,
} from "../services/aiBrainContext"
import { getLatestBrainOnboardingSnapshot, type BrainOnboardingSnapshot } from "../services/brain"
import {
 buildAIBrainContextSnapshot,
 buildAIBrainSystemPrompt,
 buildBrainLearningQuestions,
 buildCreatorBrainPromptCards,
 buildCreatorBrainLocalFallback,
 formatCreatorBrainResponse,
 type AIBrainChatHandoff,
 type AIBrainContextSnapshot,
} from "../services/aiBrainCommandInterface"
import {
 answerAIBrainQuestionModule,
 buildCreatorGrowthContext,
 formatCreatorGrowthModules,
 listAIBrainConversationTurns,
 resumeAIBrainThread,
 saveAIBrainConversationTurn,
 sanitizeCreatorFacingBrainCopy,
 aiBrainThreadHasTurnsHint,
} from "../services/aiBrainConversationStore"
import {
 buildBrainQuickActions,
 buildInitialCreatorInsights,
 dedupeInsightsAgainstActions,
} from "../services/aiBrainInitialInsights"
import {
 captureAIBrainLearningEvent,
 listAIBrainLearningEntries,
 scoreAIBrainAnswerUsefulness,
} from "../services/aiBrainSelfImprovement"
import { runBrainTurn } from "../services/brain/BrainOrchestrator"
import { BrainAnswerModuleGrid } from "../components/brain/BrainAnswerModules"
import { BrainConfidenceChip, confidenceForEvidence } from "../components/brain/BrainConfidenceChip"
import { BrainContextRail } from "../components/brain/BrainContextRail"
import { BrainEvidenceDrawer } from "../components/brain/BrainEvidenceDrawer"
import { BrainQuestionPrompt } from "../components/brain/BrainQuestionPrompt"
import type {
 AIBrainAnswerModule,
 AIBrainConversationTurn,
 AIBrainFeedbackSignal,
 AIBrainLearningEntry,
 AIBrainQuestionAnswer,
 BrainGenerationPath,
 BrainQuickAction,
 CreatorBrainLearningQuestion,
 CreatorBrainPromptCard,
 CreatorBrainResponse,
 CreatorInitialInsight,
} from "../types"

type ChatMessage = {
 id: string
 role: "user" | "model"
 text: string
 response?: CreatorBrainResponse
 handoff?: AIBrainChatHandoff | null
}

const shellCard = "rounded-[16px] border-[4px] border-black bg-white shadow-[6px_6px_0_0_#000]"
const innerCard = "rounded-[10px] border-[2px] border-black bg-white"
const kpiButton =
 "inline-flex items-center gap-2 rounded-[8px] border-[2px] border-black bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] transition hover:bg-[#3FEE56]"

const GENERATION_BADGES: Record<BrainGenerationPath, { label: string; color: string }> = {
 model: { label: "Full Brain", color: "#00FF00" },
 repaired_model: { label: "Refined Answer", color: "#36E0F6" },
 basic_guidance: { label: "Basic Guidance", color: "#FFDA47" },
}

export const BrainGenerationBadge: React.FC<{ path: BrainGenerationPath }> = ({ path }) => {
 const badge = GENERATION_BADGES[path]
 return (
  <span
   role="status"
   tabIndex={0}
   aria-label={`${badge.label} response status`}
   title="How this answer was prepared"
   className="max-w-full whitespace-normal break-words rounded-[6px] border-[2px] border-black px-2 py-0.5 text-center text-[8px] font-black uppercase leading-3 tracking-[0.1em] outline-none focus-visible:ring-[3px] focus-visible:ring-black"
   style={{ backgroundColor: badge.color }}
  >
   {badge.label}
  </span>
 )
}

const metricText = (value: number | null | undefined) =>
 typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "Not synced yet"

/**
 * An honest one-line channel status.
 *
 * Local synced data and account sign-in are two different things: a creator can be
 * signed out while their imported data still sits in the tables. Leading with "Not
 * connected" while 900+ videos are loaded reads as broken, so when data exists we
 * name the channel and the data instead, and only surface sign-in state as a soft note.
 */
const channelStatusLine = (snapshot: AIBrainContextSnapshot): string => {
 const videos = snapshot.vtSync.videos
 const totalViews = snapshot.channel.totalViews
 const name =
  snapshot.channel.label && snapshot.channel.label !== "Not connected"
   ? snapshot.channel.label
   : snapshot.vtSync.channelName || (videos ? "Imported channel data" : "No channel yet")

 const parts = [name]
 if (videos) {
  parts.push(`${videos.toLocaleString()} videos loaded`)
  parts.push(typeof totalViews === "number" ? `${totalViews.toLocaleString()} views` : "views pending sign-in")
 } else {
  parts.push(snapshot.channel.connected ? "no videos synced yet" : "sign in or import to begin")
 }
 return parts.join(" · ")
}

const makeMessageId = () =>
 typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`

/** Opening prompts seeded from `?ask=` when a legacy route redirects into the hub. */
const ASK_SEED_PROMPTS: Record<string, string> = {
 "algorithm-diagnosis":
  "Give me an algorithm diagnosis: walk through why my views are moving the way they are across impressions, click-through, and watch time, and tell me the one thing to test next.",
}

/**
 * The Brain's own opening read. Never an empty box and never a stock greeting: it
 * is composed from whatever real evidence exists, and names what is missing when
 * there is nothing to stand on.
 */
const OpeningBriefing: React.FC<{
 snapshot: AIBrainContextSnapshot
 starters: CreatorBrainPromptCard[]
 onPrompt: (prompt: string) => void
}> = ({ snapshot, starters, onPrompt }) => {
 const confidence = confidenceForEvidence({
  hasProfile: snapshot.inferredProfile.status !== "missing",
  videoCount: snapshot.inferredProfile.videoCount || snapshot.vtSync.videos,
  dataStatus: snapshot.evidencePack.dataStatus,
 })
 const topVideo = snapshot.inferredProfile.topEvidenceVideos[0]
 const clusters = snapshot.inferredProfile.topicClusters.slice(0, 3).filter(Boolean)
 const hasEvidence = Boolean(topVideo || clusters.length || snapshot.vtSync.videos)

 const read = hasEvidence
  ? [
     clusters.length
      ? `Right now your channel reads strongest around ${clusters.join(", ")}.`
      : `I can see ${snapshot.vtSync.videos.toLocaleString()} of your videos.`,
     topVideo?.title
      ? `"${topVideo.title}" is the clearest performance signal I have to work from.`
      : "I don't have enough per-video performance yet to name a single winner.",
    ].join(" ")
  : "I don't have your channel evidence yet. Connect or sync your channel, or just tell me what you make and who it's for, and I'll start building a real read instead of generic advice."

 return (
  // Top-aligned and scrollable: the briefing is a launchpad, not a block floating in
  // the middle of an empty canvas.
  <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
   <section className="mx-auto grid max-w-[70ch] gap-4">
    <div>
     <div className="flex flex-wrap items-center gap-2">
      <h2 className="text-xl font-[1000] uppercase leading-tight sm:text-2xl">
       {hasEvidence ? "Here's what I'm seeing" : "Let's get me enough to be useful"}
      </h2>
      <BrainConfidenceChip confidence={confidence} />
     </div>
     <p className="mt-2 text-sm font-bold leading-6 text-black/75">{sanitizeCreatorFacingBrainCopy(read)}</p>
     <BrainEvidenceDrawer evidencePack={snapshot.evidencePack} className="mt-3" />
    </div>

    {starters.length ? (
     <div>
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-black/45">
       {hasEvidence ? "Start with one of these" : "Or ask me anything"}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
       {starters.map((card) => (
        <button
         key={card.id}
         type="button"
         onClick={() => onPrompt(card.prompt)}
         className="group overflow-hidden rounded-[10px] border-[2px] border-black bg-white text-left transition hover:bg-[#FFDA47]"
        >
         <span className="flex items-center justify-between gap-2 border-b-[2px] border-black px-3 py-1.5" style={{ backgroundColor: card.color }}>
          <span className="text-[11px] font-[1000] uppercase leading-4">{card.label}</span>
          <ArrowRight size={13} className="shrink-0 transition group-hover:translate-x-0.5" />
         </span>
         <span className="block px-3 py-2 text-[11px] font-bold leading-4 text-black/60">
          {card.prompt}
         </span>
        </button>
       ))}
      </div>
     </div>
    ) : null}
   </section>
  </div>
 )
}

const CreatorResponseCard: React.FC<{
 message: ChatMessage
 evidencePack: AIBrainContextSnapshot["evidencePack"]
 answeredQuestionIds: Set<string>
 onFeedback: (message: ChatMessage, rating: AIBrainFeedbackSignal["rating"]) => void
 onAnswerQuestion: (question: CreatorBrainLearningQuestion, answer: string) => void
}> = ({ message, evidencePack, answeredQuestionIds, onFeedback, onAnswerQuestion }) => {
 const response = message.response
 if (!response) {
  return (
   <article className={`${innerCard} max-w-[92%] p-4 shadow-[3px_3px_0_0_#000]`}>
    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/45">ViewTube Copilot</div>
    <p className="whitespace-pre-wrap text-sm font-bold leading-6">{sanitizeCreatorFacingBrainCopy(message.text)}</p>
   </article>
  )
 }
 const rawModules: AIBrainAnswerModule[] = response.modules?.length
  ? response.modules
  : (response.sections || []).map((section) => ({
     id: section.id,
     title: section.title,
     body: section.body,
     tone: section.tone,
     source: "growth" as const,
    }))
 // Drop prose modules that just restate the key insight (the common duplication),
 // and cap the count so every answer isn't the same tall stack.
 const keyNorm = sanitizeCreatorFacingBrainCopy(response.keyInsight).trim().toLowerCase()
 const modules = rawModules
  .filter((module) => {
   if (module.data?.metrics?.length || module.data?.items?.length) return true
   const body = sanitizeCreatorFacingBrainCopy(module.body || "").trim().toLowerCase()
   if (!body || !keyNorm) return Boolean(body)
   return !(body === keyNorm || body.startsWith(keyNorm.slice(0, 60)) || keyNorm.startsWith(body.slice(0, 60)))
  })
  .slice(0, 3)
 const openQuestions = response.questions.filter((question) => !answeredQuestionIds.has(question.id))

 return (
  <article className="flex w-full max-w-[680px] shrink-0 flex-col overflow-hidden rounded-[12px] border-[2px] border-black bg-white shadow-[4px_4px_0_0_#000]">
   <div className="shrink-0 border-b-[2px] border-black px-3 py-2" style={{ backgroundColor: TOOLBOX_PALETTE[5] }}>
    <div className="flex flex-wrap items-start justify-between gap-1.5">
     <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/55">ViewTube Copilot</div>
     {response.generationPath ? <BrainGenerationBadge path={response.generationPath} /> : null}
    </div>
    <h3 className="text-lg font-[1000] uppercase leading-none sm:text-xl">
     {sanitizeCreatorFacingBrainCopy(response.headline)}
    </h3>
   </div>
   <div className="flex flex-col gap-2.5 p-3">
    <p className="text-sm font-black leading-5">{sanitizeCreatorFacingBrainCopy(response.keyInsight)}</p>
    <BrainAnswerModuleGrid modules={modules} compact />
    {openQuestions[0] ? (
     <BrainQuestionPrompt question={openQuestions[0]} onAnswer={onAnswerQuestion} compact />
    ) : null}
    <div className="flex shrink-0 flex-wrap items-center gap-1 border-t-[2px] border-black pt-2">
     {(
      [
       ["helpful", <ThumbsUp size={13} key="up" />, "Helpful", "#3FEE56"],
       ["not_useful", <ThumbsDown size={13} key="down" />, "Not useful", "#FA618A"],
       ["inaccurate", <HelpCircle size={13} key="q" />, "Inaccurate", "#FFDA47"],
       ["save_insight", <BookOpen size={13} key="save" />, "Save insight", "#36E0F6"],
       ["ask_follow_up", <MessageSquare size={13} key="follow" />, "Ask follow-up", "#FF7AC8"],
     ] as const
     ).map(([rating, iconNode, label, hover]) => (
      <button
       key={rating}
       type="button"
       title={label}
       aria-label={label}
       onClick={() => onFeedback(message, rating as AIBrainFeedbackSignal["rating"])}
       className="grid h-7 w-7 place-items-center rounded-[6px] border-[2px] border-black bg-white transition hover:-translate-y-0.5"
       onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = hover)}
       onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = "#ffffff")}
      >
       {iconNode}
      </button>
     ))}
     <BrainEvidenceDrawer evidencePack={evidencePack} compact />
     {message.handoff ? (
      <Link
       to={message.handoff.route}
       title={`Open ${message.handoff.targetTitle}`}
       className="ml-auto inline-flex items-center gap-1.5 rounded-[6px] border-[2px] border-black bg-[#FFDA47] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em]"
      >
       Open
       <ArrowRight size={13} />
      </Link>
     ) : null}
    </div>
   </div>
  </article>
 )
}

const UserMessage: React.FC<{ text: string }> = ({ text }) => (
 <article className={`${innerCard} ml-auto max-w-[82%] shrink-0 bg-[#f8f8f4] p-4 shadow-[3px_3px_0_0_#000]`}>
  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/45">You</div>
  <p className="whitespace-pre-wrap text-sm font-bold leading-6">{sanitizeCreatorFacingBrainCopy(text)}</p>
 </article>
)

const CreatorIntakeWizard: React.FC<{
 context: AiBrainContext
 onChange: (context: AiBrainContext) => void
 onSave: () => void
 onDefer: () => void
}> = ({ context, onChange, onSave, onDefer }) => {
 const [questionIndex, setQuestionIndex] = useState(0)
 const update = (key: keyof AiBrainContext, value: string) => onChange({ ...context, [key]: value })
 const question = AI_BRAIN_INTAKE_QUESTIONS[questionIndex]
 const lastQuestion = questionIndex === AI_BRAIN_INTAKE_QUESTIONS.length - 1
 return (
  <section className={`${shellCard} flex h-full min-h-0 flex-col overflow-hidden`}>
   <div className="border-b-[4px] border-black bg-[#3FEE56] px-5 py-4">
    <div className="flex items-center justify-between gap-3">
     <div>
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">Creator Profile Setup</div>
      <h2 className="mt-1 text-2xl font-[1000] uppercase leading-none sm:text-3xl">Help ViewTube Understand Your Channel</h2>
     </div>
     <span className="rounded-[8px] border-[2px] border-black bg-white px-3 py-1 text-xs font-black">
      {questionIndex + 1} / {AI_BRAIN_INTAKE_QUESTIONS.length}
     </span>
    </div>
   </div>
   <div className="grid min-h-0 flex-1 place-items-center p-4 sm:p-6">
    <label key={question.id} className={`${innerCard} block w-full max-w-4xl overflow-hidden`}>
     <span className="block border-b-[2px] border-black px-4 py-3" style={{ backgroundColor: TOOLBOX_PALETTE[(questionIndex + 2) % TOOLBOX_PALETTE.length] }}>
      <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-black/55">{question.label}</span>
      <span className="mt-1 block text-lg font-[1000] leading-6">{question.prompt}</span>
     </span>
     <textarea
      value={String(context[question.id] || "")}
      onChange={(event) => update(question.id, event.target.value)}
      placeholder={question.placeholder}
      className="h-[clamp(150px,28vh,250px)] w-full resize-none border-0 bg-white p-4 text-base font-bold leading-7 outline-none focus:bg-[#FFDA47]/20"
     />
    </label>
   </div>
   <div className="border-t-[4px] border-black bg-[#f8f8f4] p-4">
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
     <p className="text-sm font-bold leading-6 text-black/70">
      Answer what you know now. You can skip and continue later.
     </p>
     <button type="button" onClick={onDefer} className={`${kpiButton} justify-center`}>
      Skip for now
     </button>
     <button
      type="button"
      onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
      disabled={questionIndex === 0}
      className={`${kpiButton} justify-center disabled:opacity-40`}
     >
      <ChevronLeft size={14} /> Previous
     </button>
     <button
      type="button"
      onClick={() => lastQuestion ? onSave() : setQuestionIndex((index) => Math.min(AI_BRAIN_INTAKE_QUESTIONS.length - 1, index + 1))}
      className="inline-flex items-center justify-center gap-2 rounded-[10px] border-[2px] border-black bg-[#3FEE56] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] shadow-[3px_3px_0_0_#000]"
     >
      {lastQuestion ? "Save Creator Profile" : "Next Question"}
      <ArrowRight size={15} />
     </button>
    </div>
   </div>
  </section>
 )
}

const AIBrainCommandInterface: React.FC = () => {
 const location = useLocation()
 const navigate = useNavigate()
 const brainContext = useBrain()
 const {
  brain,
  authState,
  channelConnection,
  updateBrain,
  getBrainMemory,
  addJournalEntry,
  emitSignal,
 } = brainContext
 const [input, setInput] = useState("")
 const [journalInput, setJournalInput] = useState("")
 const [busy, setBusy] = useState(false)
 const [messages, setMessages] = useState<ChatMessage[]>([])
 // Gate the opening launchpad so it doesn't flash before a restored conversation
 // loads on refresh. When a channel has no saved turns (first-time users, and the
 // static-render tests), start hydrated so the launchpad shows immediately.
 const [hydrated, setHydrated] = useState(
  () => !aiBrainThreadHasTurnsHint(authState.channelHandle || authState.channelId || null),
 )
 const [learningEntries, setLearningEntries] = useState<AIBrainLearningEntry[]>([])
 const [recentTurns, setRecentTurns] = useState<AIBrainConversationTurn[]>([])
 const [questionAnswers, setQuestionAnswers] = useState<AIBrainQuestionAnswer[]>([])
 const [onboardingSnapshot, setOnboardingSnapshot] = useState<BrainOnboardingSnapshot | null>(null)
 const [intakeOpen, setIntakeOpen] = useState(false)
 const [intakeContext, setIntakeContext] = useState<AiBrainContext>(() => loadAiBrainContext())
 const [contextRailOpen, setContextRailOpen] = useState(false)
 const [journalOpen, setJournalOpen] = useState(false)
 const composerRef = useRef<HTMLInputElement | null>(null)
 const bottomRef = useRef<HTMLDivElement | null>(null)
 const askSeededRef = useRef(false)
 const canUseGemini = hasGeminiKey()
 const promptCards = useMemo(() => buildCreatorBrainPromptCards(), [])
 const channelId = authState.channelHandle || authState.channelId || null

 const snapshot = useMemo(
  () =>
   buildAIBrainContextSnapshot({
    brain,
    authState,
    channelConnection,
    brainMemory: getBrainMemory(),
    brainOnboardingSnapshot: onboardingSnapshot,
    recentConversationTurns: recentTurns,
   }),
  [brain, authState, channelConnection, onboardingSnapshot, recentTurns],
 )
 const creatorGrowthContext = useMemo(
  () => buildCreatorGrowthContext(snapshot, recentTurns, learningEntries),
  [snapshot, recentTurns, learningEntries],
 )
 const initialInsights = useMemo(() => buildInitialCreatorInsights(snapshot, "", 3), [snapshot])
 const answeredQuestionIds = useMemo(
  () => new Set(questionAnswers.map((answer) => answer.questionId)),
  [questionAnswers],
 )
 const learningQuestions = useMemo(
  () => buildBrainLearningQuestions(snapshot).filter((question) => !answeredQuestionIds.has(question.id)),
  [snapshot, answeredQuestionIds],
 )
 const quickActions = useMemo(
  () => buildBrainQuickActions(snapshot, creatorGrowthContext, 2),
  [snapshot, creatorGrowthContext],
 )
 // An insight and a quick action are often the same advice about the same video.
 // Whichever is more actionable wins, and the other is dropped.
 const railInsights = useMemo(
  () => dedupeInsightsAgainstActions(initialInsights, quickActions),
  [initialInsights, quickActions],
 )

 useEffect(() => {
  const query = new URLSearchParams(location.search)
  if (query.get("intake") === "1") {
   setIntakeContext(loadAiBrainContext())
   setIntakeOpen(true)
   return
  }
  if (shouldShowAiBrainIntake(authState.isAuthenticated)) {
   setIntakeContext(loadAiBrainContext())
   setIntakeOpen(true)
  }
 }, [authState.isAuthenticated, location.search])

 const refreshLearning = async () => {
  try {
   const entries = await listAIBrainLearningEntries({ channelId, limit: 12 })
   setLearningEntries(entries)
  } catch (error) {
   console.warn("[AIBrain] Learning ledger unavailable:", error)
  }
 }

 const refreshConversationTurns = async () => {
  try {
   const resumed = await resumeAIBrainThread(channelId)
   const turns = resumed.turns.slice().reverse()
   setRecentTurns(turns)
   setQuestionAnswers(turns.flatMap((turn) => turn.questionAnswers || []))
  } catch (error) {
   console.warn("[AIBrain] Conversation thread unavailable:", error)
  } finally {
   setHydrated(true)
  }
 }

 useEffect(() => {
  void refreshLearning()
  void refreshConversationTurns()
 }, [channelId])

 const visibleTurns = useMemo(
  () => recentTurns.filter((turn) => turn.response && !["feedback", "journal", "quick_action", "creator_intake", "question_module"].includes(String(turn.metadata?.source || ""))),
  [recentTurns],
 )

 // The conversation is one continuous, scrollable thread: rebuild every exchange
 // oldest-first so new answers append to the bottom like a normal chat. Skip while a
 // send is in flight so the optimistic user bubble isn't clobbered mid-request.
 useEffect(() => {
  if (busy) return
  const chronological = [...visibleTurns].reverse()
  setMessages(
   chronological.flatMap((turn) => [
    { id: `${turn.id}-user`, role: "user" as const, text: turn.userText },
    { id: turn.id, role: "model" as const, text: turn.assistantText, response: turn.response, handoff: null },
   ]),
  )
 }, [busy, visibleTurns])

 // Keep the newest exchange in view as the thread grows.
 useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
 }, [messages.length, busy])

 useEffect(() => {
  let active = true
  const loadOnboardingSnapshot = async () => {
   try {
    const id = authState.channelId || authState.channelHandle || null
    const latest = await getLatestBrainOnboardingSnapshot(id)
    if (active) setOnboardingSnapshot(latest)
   } catch (error) {
    console.warn("[AIBrain] Inferred channel profile unavailable:", error)
   }
  }
  void loadOnboardingSnapshot()
  const onCompleted = (event: Event) => {
   const detail = (event as CustomEvent<BrainOnboardingSnapshot>).detail
   if (active && detail) setOnboardingSnapshot(detail)
  }
  window.addEventListener("vt_brain_onboarding_bootstrap_completed", onCompleted as EventListener)
  return () => {
   active = false
   window.removeEventListener("vt_brain_onboarding_bootstrap_completed", onCompleted as EventListener)
  }
 }, [authState.channelId, authState.channelHandle])

 const captureLearning = async (inputData: Parameters<typeof captureAIBrainLearningEvent>[0]) => {
  try {
   const entry = await captureAIBrainLearningEvent(inputData)
   await refreshLearning()
   return entry
  } catch (error) {
   console.warn("[AIBrain] Learning capture skipped:", error)
   return null
  }
 }

 const handleSend = async (override?: string) => {
  const userText = (override || input).trim()
  if (!userText || busy) return
  if (shouldShowAiBrainIntake(authState.isAuthenticated)) {
   setIntakeContext(loadAiBrainContext())
   setIntakeOpen(true)
   return
  }
  setInput("")
  setBusy(true)
  const userMessage: ChatMessage = { id: makeMessageId(), role: "user", text: userText }
  // Append to the ongoing thread; the post-send refresh rebuilds it authoritatively.
  setMessages((current) => [...current, userMessage])
  try {
   const systemPrompt = buildAIBrainSystemPrompt({
    brain,
    authState,
    channelConnection,
    brainMemory: getBrainMemory(),
    brainOnboardingSnapshot: onboardingSnapshot,
    recentConversationTurns: recentTurns,
    creatorGrowthContext,
   })
   const historyPayload = recentTurns
    .filter((turn) => turn.response)
    .slice(0, 4)
    .reverse()
    .flatMap((turn) => [
     { role: "user", parts: [{ text: turn.userText }] },
     { role: "model", parts: [{ text: turn.assistantText }] },
    ])
   const result = await runBrainTurn({
    channelId,
    userText,
    snapshot,
    systemPrompt,
    growthContext: creatorGrowthContext,
    recentTurns,
    history: historyPayload,
    allowModel: canUseGemini,
   })
   setMessages((current) => [
    ...current,
    { id: result.turn.id, role: "model", text: result.turn.assistantText, response: result.response, handoff: null },
   ])
   await refreshConversationTurns()
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   console.warn("[AIBrain] Copilot answer failed:", message)
   const fallbackText = buildCreatorBrainLocalFallback(userText, snapshot)
   const fallbackResponse = formatCreatorBrainResponse(fallbackText, snapshot, { requestText: userText })
   const response = {
    ...fallbackResponse,
    modules: formatCreatorGrowthModules(fallbackResponse, creatorGrowthContext),
    generationPath: "basic_guidance" as const,
    fallbackReason: "provider_error" as const,
   }
   setMessages((current) => [
    ...current,
    { id: makeMessageId(), role: "model", text: fallbackText, response },
   ])
  } finally {
   setBusy(false)
  }
 }

 // Legacy routes fold into the one conversation by seeding an opening question the
 // Brain then routes internally, rather than selecting a mode. `/algorithm-architect`
 // redirects here with `?ask=algorithm-diagnosis`.
 useEffect(() => {
  if (askSeededRef.current) return
  const ask = new URLSearchParams(location.search).get("ask")
  if (!ask) return
  askSeededRef.current = true
  const seed = ASK_SEED_PROMPTS[ask]
  if (seed && messages.length === 0) void handleSend(seed)
  navigate("/ai-brain", { replace: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [location.search])

 const handleFeedback = (message: ChatMessage, rating: AIBrainFeedbackSignal["rating"]) => {
  void (async () => {
   const learningEntry = await captureLearning({
    channelId,
    source: "feedback",
    summary: `Creator marked Copilot answer as ${rating.replace(/_/g, " ")}`,
    detail: message.response?.keyInsight || message.text,
    confidence: rating === "helpful" || rating === "save_insight" ? "high" : "medium",
    evidence: [message.response?.headline || "Copilot response"].filter(Boolean),
    metadata: {
     messageId: message.id,
     rating,
     usefulnessScore: scoreAIBrainAnswerUsefulness({ response: message.response || message.text, feedback: rating }),
    },
   })
   await saveAIBrainConversationTurn({
    channelId,
    userText: `Feedback: ${rating.replace(/_/g, " ")}`,
    assistantText: message.response?.keyInsight || message.text,
    response: message.response,
    answerModules: message.response?.modules || [],
    feedback: { messageId: message.id, rating, createdAt: new Date().toISOString() },
    learningEntryIds: learningEntry ? [learningEntry.id] : [],
    metadata: { source: "feedback" },
   })
   await refreshConversationTurns()
  })()
 }

 const handleAnswerQuestion = (question: CreatorBrainLearningQuestion, answer: string) => {
  const trimmed = answer.trim()
  if (!trimmed) return
  void (async () => {
   try {
    const saved = await answerAIBrainQuestionModule({ channelId, question, answer: trimmed })
    setQuestionAnswers((current) => [saved, ...current.filter((item) => item.id !== saved.id)])
    await refreshLearning()
    await refreshConversationTurns()
   } catch (error) {
    console.warn("[AIBrain] Question answer was not saved:", error)
   }
  })()
 }

 const handleAskInsight = (insight: CreatorInitialInsight) => {
  void handleSend(`Use the ${insight.title} read and give me a specific plan for my channel.`)
 }

 const handleAcceptQuickAction = (action: BrainQuickAction) => {
  void (async () => {
   const learningEntry = await captureLearning({
    channelId,
    source: "daily_oracle",
    summary: `Creator accepted a Brain quick action: ${action.title}`,
    detail: action.body,
    category: "tool_workflow",
    confidence: "medium",
    evidence: ["Brain quick action"],
   })
   await saveAIBrainConversationTurn({
    channelId,
    userText: "Accepted a suggested next move",
    assistantText: `${action.title} — ${action.body}`,
    learningEntryIds: learningEntry ? [learningEntry.id] : [],
    metadata: { source: "quick_action", quickActionId: action.id },
   })
   await refreshConversationTurns()
   void handleSend(`Walk me through this step by step: ${action.title}. ${action.body}`)
  })()
 }

 const handleJournalSave = () => {
  const content = journalInput.trim()
  if (!content) return
  addJournalEntry(content, "content")
  setJournalInput("")
  void emitSignal("AI_BRAIN_HUB", "JOURNAL_ENTRY_CAPTURED", { content })
  void (async () => {
   const learningEntry = await captureLearning({
    channelId,
    source: "journal",
    summary: "Creator saved a note to Brain memory",
    detail: content,
    category: "channel_fact",
    confidence: "medium",
    evidence: ["Creator note"],
   })
   await saveAIBrainConversationTurn({
    channelId,
    userText: "Saved a note to memory",
    assistantText: content,
    learningEntryIds: learningEntry ? [learningEntry.id] : [],
    metadata: { source: "journal" },
   })
   await refreshConversationTurns()
  })()
 }

 const handleSaveIntake = () => {
  const saved = saveAiBrainContext({ ...intakeContext, source: "wizard" })
  setIntakeContext(saved)
  updateBrain({
   creatorPreferences: {
    what_next_goal: saved.mainYoutubeGoal || saved.successDefinition || saved.whatNext,
    primary_channel_goal: saved.primaryGoal,
    audience_niche: saved.mainTopicFocus || saved.audienceNiche,
    channel_description: saved.channelDescription,
    audience_description: saved.audienceDescription,
    success_definition: saved.successDefinition,
    recurring_series: [saved.recurringSeriesName, saved.recurringSeriesDescription].filter(Boolean).join(": "),
    biggest_youtube_weakness: saved.biggestWeakness,
    most_successful_video: saved.mostSuccessfulVideo,
    viewtube_signup_reason: saved.signupReason,
   },
  })
  void captureLearning({
   channelId,
   source: "journal",
   summary: "Creator completed the ViewTube Brain profile intake",
   detail: [
    saved.channelDescription,
    saved.mainTopicFocus,
    saved.audienceDescription,
    saved.successDefinition,
    saved.mainYoutubeGoal,
   ]
    .filter(Boolean)
    .join(" "),
   category: "channel_fact",
   confidence: "high",
   evidence: ["Creator profile intake"],
  })
   .then((entry) =>
    entry
     ? saveAIBrainConversationTurn({
        channelId,
        userText: "Creator profile intake completed",
        assistantText: "Creator profile saved for future ViewTube Copilot coaching.",
        learningEntryIds: [entry.id],
        metadata: { source: "creator_intake" },
       })
     : null,
   )
   .then(() => {
    void refreshLearning()
    void refreshConversationTurns()
   })
  setIntakeOpen(false)
  navigate("/ai-brain", { replace: true })
 }

 const handleDeferIntake = () => {
  dismissAiBrainIntake()
  setIntakeOpen(false)
  navigate("/ai-brain", { replace: true })
 }

 return (
  <main className="h-full min-h-0 overflow-hidden bg-[#f3f4f6] text-black">
   <Toolbox
    title="ViewTube Brain Hub"
    subtitle="One assistant for channel strategy, analytics, goals, content planning, SEO, and publishing."
    icon={<Brain />}
    paletteIndex={5}
    collapsible={false}
    indicator="none"
    fillAvailable
    contentClassName="h-full min-h-0 overflow-hidden bg-[#f3f4f6]"
   >
    {intakeOpen ? (
     <CreatorIntakeWizard
      context={intakeContext}
      onChange={setIntakeContext}
      onSave={handleSaveIntake}
      onDefer={handleDeferIntake}
     />
    ) : (
     <section className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <header className="flex min-h-[48px] shrink-0 items-center justify-between gap-3 border-b-[3px] border-black bg-white px-3 py-2">
       <div className="min-w-0">
        <h1 className="truncate text-lg font-[1000] uppercase leading-none sm:text-2xl">Ask ViewTube Copilot Anything</h1>
        <p className="mt-1 truncate text-[10px] font-black uppercase text-black/50">{channelStatusLine(snapshot)}</p>
       </div>
       <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" className={`${kpiButton} xl:hidden`} onClick={() => setContextRailOpen(true)} aria-label="Open channel context">
         <PanelRight size={15} />
        </button>
       </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-2 p-2 xl:grid-cols-[minmax(0,1fr)_310px]">
       <div className={`${innerCard} flex min-h-0 flex-col overflow-hidden`}>
        <div className="grid min-h-0 flex-1 gap-2 bg-white p-2">
         {!hydrated && messages.length === 0 ? (
          <div className="min-h-0 flex-1" aria-hidden="true" />
         ) : messages.length === 0 ? (
          <OpeningBriefing snapshot={snapshot} starters={promptCards.slice(0, 6)} onPrompt={(prompt) => void handleSend(prompt)} />
         ) : (
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
           {messages.map((message) => message.role === "user" ? (
            <UserMessage key={message.id} text={message.text} />
           ) : (
            <CreatorResponseCard
             key={message.id}
             message={message}
             evidencePack={snapshot.evidencePack}
             answeredQuestionIds={answeredQuestionIds}
             onFeedback={handleFeedback}
             onAnswerQuestion={handleAnswerQuestion}
            />
           ))}
           <div ref={bottomRef} aria-hidden="true" />
          </div>
         )}
        </div>

        <footer className="shrink-0 border-t-[4px] border-black bg-[#f8f8f4] p-2">
         <div className="mb-1.5 flex flex-wrap gap-1">
          {promptCards.slice(0, 4).map((card) => (
           <button key={card.id} type="button" onClick={() => void handleSend(card.prompt)} className="rounded-[7px] border-[2px] border-black bg-white px-2 py-1 text-[9px] font-black uppercase hover:bg-[#FFDA47]">
            {card.label}
           </button>
          ))}
          <button type="button" onClick={() => composerRef.current?.focus()} className="rounded-[7px] border-[2px] border-black bg-[#FF7AC8] px-2 py-1 text-[9px] font-black uppercase">Growth prompts</button>
          <button type="button" onClick={() => void handleSend("Run my Daily Oracle and give me one priority, one quick win, and one measurable action for today.")} className="rounded-[7px] border-[2px] border-black bg-[#FFDA47] px-2 py-1 text-[9px] font-black uppercase">Run Daily Oracle</button>
          <button type="button" onClick={() => setJournalOpen(true)} className="rounded-[7px] border-[2px] border-black bg-[#36E0F6] px-2 py-1 text-[9px] font-black uppercase"><BookOpen size={12} className="mr-1 inline" />AI Journal</button>
         </div>
         <div className="flex gap-2">
          <label className="sr-only" htmlFor="brain-composer">Ask ViewTube Copilot</label>
          <input
           ref={composerRef}
           type="text"
           id="brain-composer"
           value={input}
           onChange={(event) => setInput(event.target.value)}
           onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void handleSend() }}
           placeholder="Ask about your next video, audience, analytics, goals, thumbnails, SEO, publishing, or revenue..."
           className="h-[52px] min-w-0 flex-1 rounded-[9px] border-[2px] border-black bg-white p-2 text-sm font-bold leading-5 outline-none focus:bg-[#FFDA47]/20"
          />
          <button type="button" onClick={() => void handleSend()} disabled={busy || !input.trim()} className="inline-flex w-[74px] shrink-0 items-center justify-center gap-1 rounded-[9px] border-[2px] border-black bg-[#3FEE56] text-xs font-black uppercase disabled:opacity-50">
           {busy ? <Zap className="animate-pulse" size={16} /> : <Send size={16} />} Send
          </button>
         </div>
        </footer>
       </div>

       <div className="hidden min-h-0 overflow-hidden xl:block">
        <BrainContextRail
         snapshot={snapshot}
         growthContext={creatorGrowthContext}
         insights={railInsights}
         questions={learningQuestions}
         quickActions={quickActions}
         onAskInsight={handleAskInsight}
         onAcceptQuickAction={handleAcceptQuickAction}
         onAnswerQuestion={handleAnswerQuestion}
        />
       </div>
      </div>

      {contextRailOpen ? (
       <div className="absolute inset-0 z-40 grid bg-white p-3 xl:hidden">
        <div className="mb-2 flex items-center justify-between border-b-[2px] border-black pb-2">
         <h2 className="text-lg font-[1000] uppercase">Your Channel Context</h2>
         <button type="button" className={kpiButton} onClick={() => setContextRailOpen(false)}>Close</button>
        </div>
        <BrainContextRail snapshot={snapshot} growthContext={creatorGrowthContext} insights={railInsights} questions={learningQuestions} quickActions={quickActions} onAskInsight={handleAskInsight} onAcceptQuickAction={handleAcceptQuickAction} onAnswerQuestion={handleAnswerQuestion} />
       </div>
      ) : null}

      {journalOpen ? (
       <div className="absolute inset-0 z-50 grid place-items-center bg-black/40 p-4">
        <section className={`${shellCard} w-full max-w-2xl overflow-hidden`}>
         <div className="border-b-[2px] border-black bg-[#36E0F6] px-4 py-3"><h2 className="text-xl font-[1000] uppercase">Save To AI Journal</h2></div>
         <div className="grid gap-3 p-4">
          <textarea value={journalInput} onChange={(event) => setJournalInput(event.target.value)} placeholder="A goal, content style note, audience insight, constraint, or decision you want the Brain to remember." className="h-[180px] resize-none rounded-[8px] border-[2px] border-black p-3 text-sm font-bold leading-6 outline-none" />
          <div className="flex justify-end gap-2">
           <button type="button" className={kpiButton} onClick={() => setJournalOpen(false)}>Cancel</button>
           <button type="button" className={`${kpiButton} bg-[#3FEE56]`} disabled={!journalInput.trim()} onClick={() => { handleJournalSave(); setJournalOpen(false) }}>Remember this</button>
          </div>
         </div>
        </section>
       </div>
      ) : null}
     </section>
    )}
   </Toolbox>
  </main>
 )
}

export default AIBrainCommandInterface
