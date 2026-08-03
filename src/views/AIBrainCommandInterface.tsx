import React, { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
 ArrowRight,
 BookOpen,
 Brain,
 ChevronLeft,
 HelpCircle,
 LayoutGrid,
 MessageSquare,
 PanelRight,
 Send,
 ThumbsDown,
 ThumbsUp,
 X,
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

export type ChatMessage = {
 id: string
 role: "user" | "model"
 text: string
 response?: CreatorBrainResponse
 handoff?: AIBrainChatHandoff | null
}

const shellCard = "rounded-[16px] border-[4px] border-black bg-white shadow-[6px_6px_0_0_#000]"
const innerCard = "rounded-[10px] border-[2px] border-black bg-white"
const assistantCardFrame = "w-full max-w-none shrink-0 border-y-[2px] border-black bg-white"
const kpiButton =
 "inline-flex items-center gap-2 rounded-[8px] border-[2px] border-black bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] transition hover:bg-[#3FEE56]"

export const shouldSendBrainComposerKey = ({ key, isComposing }: { key: string; isComposing: boolean }) =>
 key === "Enter" && !isComposing

const PROMPT_CARD_SUMMARIES: Record<string, string> = {
 "analyze-channel-niche": "Find your niche and fuzzy edges.",
 "niche-growth-ideas": "Choose adjacent topics that still fit.",
 "analyze-formats": "Compare views, retention, and revenue.",
 "seo-script-drafter": "Draft a concept, hook, description, and tags.",
 "format-strategy": "Plan five repeatable uploads.",
 "clarify-channel-goals": "Confirm goals, audience, and direction.",
 "revenue-levers": "Find practical 30-day revenue moves.",
 "audience-language": "Identify audience interests and wording.",
 "why-views-changed": "Diagnose momentum and choose three moves.",
 "best-video-autopsy": "Explain and replicate your best video.",
 "title-thumbnail-test": "Create the next title and thumbnail test.",
 "daily-oracle": "Get today’s priority, quick win, and action.",
}

export const promptCardSummary = (card: CreatorBrainPromptCard): string =>
 PROMPT_CARD_SUMMARIES[card.id] || card.prompt

const GENERATION_BADGES: Record<BrainGenerationPath, { label: string; color: string; description: string }> = {
 model: { label: "Full Brain", color: "#00FF00", description: "This response was prepared with the full Brain." },
 repaired_model: { label: "Refined Answer", color: "#36E0F6", description: "This response was prepared with an additional quality pass." },
 basic_guidance: { label: "Basic Guidance", color: "#FFDA47", description: "This response was prepared from available channel evidence while full generation was unavailable." },
}

export const BrainGenerationBadge: React.FC<{ path: BrainGenerationPath }> = ({ path }) => {
 const badge = GENERATION_BADGES[path]
 return (
  <span
   role="status"
   tabIndex={0}
   aria-label={`${badge.label} response status`}
   title={badge.description}
   className="max-w-full whitespace-normal break-words rounded-[6px] border-[2px] border-black px-2 py-0.5 text-center text-[8px] font-black uppercase leading-3 tracking-[0.1em] outline-none focus-visible:ring-[3px] focus-visible:ring-black"
   style={{ backgroundColor: badge.color }}
  >
   {badge.label}
  </span>
 )
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
const OpeningBriefing: React.FC<{ snapshot: AIBrainContextSnapshot }> = ({ snapshot }) => {
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
  <div className="brain-chat-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4" aria-label="Brain conversation" tabIndex={0}>
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

   </section>
  </div>
 )
}

/** Persistent task discovery. Kept outside the empty-chat branch so prior turns
 * never hide a Brain capability from returning creators. */
export const BrainPromptLibrary: React.FC<{
 cards: CreatorBrainPromptCard[]
 busy?: boolean
 headingId?: string
 onPrompt: (prompt: string) => void
}> = ({ cards, busy = false, headingId = "brain-prompt-library-title", onPrompt }) => (
 <section
  aria-labelledby={headingId}
  aria-busy={busy || undefined}
  className="rounded-[10px] border-[2px] border-black bg-white"
 >
  <div className="sticky top-0 z-10 rounded-t-[7px] border-b-[2px] border-black bg-[#FF7AC8] px-3 py-2">
   <h2 id={headingId} className="text-[12px] font-[1000] uppercase leading-4 tracking-[0.08em]">
    Prompt Library
   </h2>
   <p className="mt-0.5 text-[10px] font-bold leading-4 text-black/65">
    Start a focused Brain task at any point in the conversation.
   </p>
  </div>
  <ul className="grid grid-cols-1 gap-1.5 p-2 sm:grid-cols-2 sm:auto-rows-[50px] xl:grid-cols-3">
   {cards.map((card) => (
    <li key={card.id} className="h-full">
     <button
      type="button"
      disabled={busy}
      title={card.prompt}
      aria-label={`${card.label}: ${card.prompt}`}
      onClick={() => onPrompt(card.prompt)}
      className="group flex h-full min-h-[50px] w-full flex-col items-stretch overflow-hidden rounded-[8px] border-[2px] border-black bg-white text-left outline-none transition hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-black disabled:cursor-wait disabled:opacity-50"
      >
      <span
       className="flex h-[20px] shrink-0 items-center rounded-t-[5px] border-b-[2px] border-black px-2 text-[10px] font-[1000] uppercase leading-none"
       style={{ backgroundColor: card.color }}
      >
       {card.label}
      </span>
      <span className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_14px] items-center gap-1.5 px-2">
       <span className="line-clamp-2 block overflow-hidden text-[10px] font-bold leading-[12px] text-black/75">
        {promptCardSummary(card)}
       </span>
       <ArrowRight size={12} className="shrink-0 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
     </button>
    </li>
   ))}
  </ul>
 </section>
)

const FEEDBACK_OPTIONS = [
 ["helpful", ThumbsUp, "Helpful", "#3FEE56"],
 ["not_useful", ThumbsDown, "Not useful", "#FA618A"],
 ["inaccurate", HelpCircle, "Inaccurate", "#FFDA47"],
 ["save_insight", BookOpen, "Save insight", "#36E0F6"],
 ["ask_follow_up", MessageSquare, "Ask follow-up", "#FF7AC8"],
] as const satisfies ReadonlyArray<readonly [AIBrainFeedbackSignal["rating"], React.ComponentType<{ size?: number }>, string, string]>

export const BrainFeedbackControls: React.FC<{
 message: ChatMessage
 onFeedback: (message: ChatMessage, rating: AIBrainFeedbackSignal["rating"]) => Promise<void>
}> = ({ message, onFeedback }) => {
 const [selected, setSelected] = useState<AIBrainFeedbackSignal["rating"] | null>(null)
 const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

 const submitFeedback = async (rating: AIBrainFeedbackSignal["rating"]) => {
  if (status === "saving") return
  setSelected(rating)
  setStatus("saving")
  try {
   await onFeedback(message, rating)
   setStatus("saved")
  } catch (error) {
   console.warn("[AIBrain] Feedback was not saved:", error)
   setStatus("error")
  }
 }

 return (
  <div className="flex min-w-0 flex-wrap items-center gap-1.5" aria-label="Rate this response">
   {FEEDBACK_OPTIONS.map(([rating, Icon, label, color]) => {
    const isSelected = selected === rating
    return (
     <button
      key={rating}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={isSelected}
      disabled={status === "saving"}
      onClick={() => void submitFeedback(rating)}
      className="grid h-8 w-8 cursor-pointer place-items-center rounded-[6px] border-[2px] border-black bg-white transition hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-black disabled:cursor-wait disabled:opacity-60"
      style={{ backgroundColor: isSelected ? color : "#ffffff" }}
      onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = color)}
      onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = isSelected ? color : "#ffffff")}
     >
      <Icon size={14} aria-hidden="true" />
     </button>
    )
   })}
   <span className="ml-1 text-[10px] font-black uppercase tracking-[0.06em]" aria-live="polite" role="status">
    {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Try again" : "Rate answer"}
   </span>
  </div>
 )
}

const CreatorResponseCard: React.FC<{
 message: ChatMessage
 evidencePack: AIBrainContextSnapshot["evidencePack"]
 answeredQuestionIds: Set<string>
 onFeedback: (message: ChatMessage, rating: AIBrainFeedbackSignal["rating"]) => Promise<void>
 onAnswerQuestion: (question: CreatorBrainLearningQuestion, answer: string) => void
}> = ({ message, evidencePack, answeredQuestionIds, onFeedback, onAnswerQuestion }) => {
 const response = message.response
 if (!response) {
  return (
   <article className={`${assistantCardFrame} p-4`}>
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
 const openQuestions = response.questions.filter(
  (question) => question.category !== "creator_goal" && !answeredQuestionIds.has(question.id),
 )

 return (
  <article className={`${assistantCardFrame} flex flex-col overflow-hidden`}>
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
   </div>
   <div className="flex min-h-9 shrink-0 flex-wrap items-center gap-1 border-t-[2px] border-black bg-[#f8f8f4] px-3 py-1">
     <BrainFeedbackControls message={message} onFeedback={onFeedback} />
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
  </article>
 )
}

export const UserMessage: React.FC<{ text: string }> = ({ text }) => (
 <article className="grid min-h-[68px] w-full shrink-0 grid-cols-[84px_minmax(0,1fr)] overflow-hidden border-y-[2px] border-black bg-[#36E0F6]">
  <div className="flex items-center border-r-[2px] border-black bg-[#24C8E2] px-3 text-[14px] font-[1000] uppercase tracking-[0.06em]">
   You:
  </div>
  <p className="flex min-w-0 items-center whitespace-pre-wrap px-4 py-3 text-sm font-bold leading-6">
   {sanitizeCreatorFacingBrainCopy(text)}
  </p>
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
 const [promptRailOpen, setPromptRailOpen] = useState(false)
 const [contextRailOpen, setContextRailOpen] = useState(false)
 const [journalOpen, setJournalOpen] = useState(false)
 const composerRef = useRef<HTMLInputElement | null>(null)
 const promptLauncherRef = useRef<HTMLButtonElement | null>(null)
 const contextLauncherRef = useRef<HTMLButtonElement | null>(null)
 const promptCloseRef = useRef<HTMLButtonElement | null>(null)
 const contextCloseRef = useRef<HTMLButtonElement | null>(null)
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
 const latestResponseQuestions = useMemo(
  () => [...messages]
   .reverse()
   .find((message) => message.role === "model" && message.response)
   ?.response?.questions.filter(
    (question) => question.category === "creator_goal" && !answeredQuestionIds.has(question.id),
   ) || [],
  [messages, answeredQuestionIds],
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
  if (!promptRailOpen && !contextRailOpen) return
  const closeButton = promptRailOpen ? promptCloseRef.current : contextCloseRef.current
  const launcher = promptRailOpen ? promptLauncherRef.current : contextLauncherRef.current
  closeButton?.focus()
  const handleDrawerKeyboard = (event: KeyboardEvent) => {
   if (event.key === "Escape") {
    event.preventDefault()
    setPromptRailOpen(false)
    setContextRailOpen(false)
    return
   }
   if (event.key !== "Tab") return
   const dialog = closeButton?.closest<HTMLElement>('[role="dialog"]')
   const focusable = Array.from(
    dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') || [],
   )
   if (!focusable.length) return
   const first = focusable[0]
   const last = focusable[focusable.length - 1]
   if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
   } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
   }
  }
  document.addEventListener("keydown", handleDrawerKeyboard)
  return () => {
   document.removeEventListener("keydown", handleDrawerKeyboard)
   launcher?.focus()
  }
 }, [promptRailOpen, contextRailOpen])

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

 const handleFeedback = async (message: ChatMessage, rating: AIBrainFeedbackSignal["rating"]) => {
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
  if (rating === "ask_follow_up") {
   setInput(`Follow up on ${message.response?.headline || "this answer"}: `)
   composerRef.current?.focus()
  }
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
      <div className="grid min-h-0 flex-1 gap-3 bg-[#f3f4f6] px-3 pb-3 pt-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(520px,1fr)]">
       <div className={`${innerCard} flex min-h-0 flex-col overflow-hidden`}>
        <div className="grid min-h-0 flex-1 bg-white">
         {!hydrated && messages.length === 0 ? (
          <div className="min-h-0 flex-1" aria-hidden="true" />
         ) : messages.length === 0 ? (
          <OpeningBriefing snapshot={snapshot} />
         ) : (
          <div className="brain-chat-scrollbar flex min-h-0 w-full flex-1 flex-col gap-2 overflow-y-auto overscroll-contain" aria-label="Brain conversation" aria-live="polite" role="log" tabIndex={0}>
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

        <footer className="shrink-0 border-t-[2px] border-black bg-[#f8f8f4] p-2">
         <div className="mx-auto w-full max-w-[880px]">
          <div className="mb-1.5 flex flex-wrap gap-1 xl:hidden">
           <button ref={promptLauncherRef} type="button" onClick={() => setPromptRailOpen(true)} aria-label="Open prompt library" className="inline-flex min-h-9 items-center gap-1 rounded-[7px] border-[2px] border-black bg-[#FF7AC8] px-2 py-1 text-[9px] font-black uppercase outline-none focus-visible:ring-[3px] focus-visible:ring-black xl:hidden">
            <LayoutGrid size={13} aria-hidden="true" /> Prompt Library
           </button>
           <button ref={contextLauncherRef} type="button" onClick={() => setContextRailOpen(true)} aria-label="Open channel context" className="inline-flex min-h-9 items-center gap-1 rounded-[7px] border-[2px] border-black bg-[#3FEE56] px-2 py-1 text-[9px] font-black uppercase outline-none focus-visible:ring-[3px] focus-visible:ring-black xl:hidden">
            <PanelRight size={13} aria-hidden="true" /> Channel Context
           </button>
          </div>
          <div className="flex gap-2">
           <button type="button" onClick={() => setJournalOpen(true)} aria-label="Open AI Journal" title="Open AI Journal" className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[9px] border-[2px] border-black bg-[#36E0F6] outline-none transition hover:bg-[#FFDA47] focus-visible:ring-[3px] focus-visible:ring-black">
            <BookOpen size={18} aria-hidden="true" />
           </button>
           <label className="sr-only" htmlFor="brain-composer">Ask ViewTube Copilot</label>
           <input
            ref={composerRef}
            type="text"
            id="brain-composer"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
             if (!shouldSendBrainComposerKey({ key: event.key, isComposing: event.nativeEvent.isComposing })) return
             event.preventDefault()
             void handleSend()
            }}
            placeholder="Ask about your next video, audience, analytics, goals, thumbnails, SEO, publishing, or revenue..."
            className="h-[52px] min-w-0 flex-1 rounded-[9px] border-[2px] border-black bg-white p-2 text-sm font-bold leading-5 outline-none focus:bg-[#FFDA47]/20 focus-visible:ring-[3px] focus-visible:ring-black"
           />
           <button type="button" onClick={() => void handleSend()} disabled={busy || !input.trim()} className="inline-flex w-[74px] shrink-0 items-center justify-center gap-1 rounded-[9px] border-[2px] border-black bg-[#3FEE56] text-xs font-black uppercase outline-none focus-visible:ring-[3px] focus-visible:ring-black disabled:opacity-50">
            {busy ? <Zap className="animate-pulse" size={16} /> : <Send size={16} />} Send
           </button>
          </div>
         </div>
        </footer>
       </div>

       <div className="hidden min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden xl:grid">
        <div className="min-h-0" aria-label="Prompt library">
         <BrainPromptLibrary cards={promptCards} busy={busy} onPrompt={(prompt) => void handleSend(prompt)} />
        </div>
        <div className="min-h-0 overflow-hidden" aria-label="Channel context">
         <BrainContextRail
          snapshot={snapshot}
          growthContext={creatorGrowthContext}
          insights={railInsights}
          questions={learningQuestions}
          responseQuestions={latestResponseQuestions}
          quickActions={quickActions}
          onAskInsight={handleAskInsight}
          onAcceptQuickAction={handleAcceptQuickAction}
          onAnswerQuestion={handleAnswerQuestion}
          compactGrid
         />
        </div>
       </div>
      </div>

      {promptRailOpen ? (
       <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brain-prompt-library-dialog-title"
        className="absolute inset-0 z-40 grid min-h-0 grid-rows-[auto_1fr] bg-white p-3 xl:hidden"
       >
        <div className="mb-2 flex items-center justify-between border-b-[2px] border-black pb-2">
         <h2 id="brain-prompt-library-dialog-title" className="text-lg font-[1000] uppercase">Prompt Library</h2>
         <button ref={promptCloseRef} type="button" className={kpiButton} onClick={() => setPromptRailOpen(false)}>
          <X size={14} aria-hidden="true" /> Close
         </button>
        </div>
        <div className="vt-scrollless min-h-0 overflow-y-auto overscroll-contain" aria-label="Prompt library" tabIndex={0}>
         <BrainPromptLibrary
          cards={promptCards}
          busy={busy}
          headingId="brain-prompt-library-drawer-title"
          onPrompt={(prompt) => {
           setPromptRailOpen(false)
           void handleSend(prompt)
          }}
         />
        </div>
       </div>
      ) : null}

      {contextRailOpen ? (
       <div role="dialog" aria-modal="true" aria-labelledby="brain-context-dialog-title" className="absolute inset-0 z-40 grid min-h-0 grid-rows-[auto_1fr] bg-white p-3 xl:hidden">
        <div className="mb-2 flex items-center justify-between border-b-[2px] border-black pb-2">
         <h2 id="brain-context-dialog-title" className="text-lg font-[1000] uppercase">Your Channel Context</h2>
         <button ref={contextCloseRef} type="button" className={kpiButton} onClick={() => setContextRailOpen(false)}><X size={14} aria-hidden="true" /> Close</button>
        </div>
        <div className="vt-scrollless min-h-0 overflow-y-auto overscroll-contain" aria-label="Channel context" tabIndex={0}>
         <BrainContextRail snapshot={snapshot} growthContext={creatorGrowthContext} insights={railInsights} questions={learningQuestions} responseQuestions={latestResponseQuestions} quickActions={quickActions} onAskInsight={handleAskInsight} onAcceptQuickAction={handleAcceptQuickAction} onAnswerQuestion={handleAnswerQuestion} />
        </div>
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
