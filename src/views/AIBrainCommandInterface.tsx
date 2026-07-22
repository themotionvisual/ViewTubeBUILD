import React, { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
 ArrowRight,
 BookOpen,
 Brain,
 HelpCircle,
 MessageSquare,
 Send,
 ThumbsDown,
 ThumbsUp,
 Zap,
} from "lucide-react"
import { Toolbox } from "../components/Toolbox"
import { useBrain } from "../context/useBrain"
import { TOOLBOX_PALETTE } from "../styles/toolboxPalette"
import { generateChatResponse, hasGeminiKey } from "../services/gemini"
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
 queueAIBrainReviewedAction,
 type AIBrainChatHandoff,
 type AIBrainContextSnapshot,
} from "../services/aiBrainCommandInterface"
import {
 answerAIBrainQuestionModule,
 buildCreatorGrowthContext,
 formatCreatorGrowthModules,
 listAIBrainConversationTurns,
 saveAIBrainConversationTurn,
 sanitizeCreatorFacingBrainCopy,
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
import { BrainAnswerModuleGrid } from "../components/brain/BrainAnswerModules"
import { BrainConfidenceChip, confidenceForEvidence } from "../components/brain/BrainConfidenceChip"
import { BrainContextRail } from "../components/brain/BrainContextRail"
import { BrainEvidenceDrawer } from "../components/brain/BrainEvidenceDrawer"
import { BrainQuestionPrompt } from "../components/brain/BrainQuestionPrompt"
import type {
 AIBrainConversationTurn,
 AIBrainFeedbackSignal,
 AIBrainLearningEntry,
 AIBrainQuestionAnswer,
 BrainQuickAction,
 CreatorBrainLearningQuestion,
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

const metricText = (value: number | null | undefined) =>
 typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "Not synced yet"

const makeMessageId = () =>
 typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const shouldOfferReviewedHandoff = (text: string): boolean =>
 /\b(open|draft|build|create|queue|handoff|canvas|thumbnail|goal tracker|editor|journal|publish checklist|storyboard)\b/i.test(
  text,
 )

/**
 * The Brain's own opening read. Never an empty box and never a stock greeting: it
 * is composed from whatever real evidence exists, and names what is missing when
 * there is nothing to stand on.
 */
const OpeningBriefing: React.FC<{
 snapshot: AIBrainContextSnapshot
}> = ({ snapshot }) => {
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
  <section className="max-w-[68ch]">
   <div className="flex flex-wrap items-center gap-2">
    <h2 className="text-xl font-[1000] uppercase leading-tight">
     {hasEvidence ? "Here's what I'm seeing" : "Let's get me enough to be useful"}
    </h2>
    <BrainConfidenceChip confidence={confidence} />
   </div>
   <p className="mt-2 text-sm font-bold leading-6 text-black/75">{sanitizeCreatorFacingBrainCopy(read)}</p>
   <BrainEvidenceDrawer evidencePack={snapshot.evidencePack} className="mt-3" />
  </section>
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
 const modules = response.modules?.length
  ? response.modules
  : (response.sections || []).map((section) => ({
     id: section.id,
     title: section.title,
     body: section.body,
     tone: section.tone,
     source: "growth" as const,
    }))
 const openQuestions = response.questions.filter((question) => !answeredQuestionIds.has(question.id))

 return (
  <article className="max-w-[96%] overflow-hidden rounded-[12px] border-[2px] border-black bg-white shadow-[4px_4px_0_0_#000]">
   <div className="border-b-[2px] border-black px-4 py-3" style={{ backgroundColor: TOOLBOX_PALETTE[5] }}>
    <div className="flex flex-wrap items-center justify-between gap-2">
     <div>
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/55">ViewTube Copilot</div>
      <h3 className="text-2xl font-[1000] uppercase leading-none">
       {sanitizeCreatorFacingBrainCopy(response.headline)}
      </h3>
     </div>
     <BrainConfidenceChip confidence={response.confidence} />
    </div>
   </div>
   <div className="grid gap-4 p-4">
    <p className="text-base font-black leading-7">{sanitizeCreatorFacingBrainCopy(response.keyInsight)}</p>
    <BrainAnswerModuleGrid modules={modules} />
    <BrainEvidenceDrawer evidencePack={evidencePack} />
    {openQuestions.length ? (
     <div className="grid gap-2">
      {openQuestions.map((question) => (
       <BrainQuestionPrompt key={question.id} question={question} onAnswer={onAnswerQuestion} compact />
      ))}
     </div>
    ) : null}
    <div className="flex flex-wrap items-center gap-2">
     {(
      [
       ["helpful", <ThumbsUp size={14} key="up" />, "Helpful"],
       ["not_useful", <ThumbsDown size={14} key="down" />, "Not useful"],
       ["inaccurate", <HelpCircle size={14} key="q" />, "Inaccurate"],
       ["save_insight", <BookOpen size={14} key="save" />, "Save insight"],
       ["ask_follow_up", <MessageSquare size={14} key="follow" />, "Ask follow-up"],
      ] as const
     ).map(([rating, iconNode, label]) => (
      <button
       key={rating}
       type="button"
       onClick={() => onFeedback(message, rating as AIBrainFeedbackSignal["rating"])}
       className={kpiButton}
      >
       {iconNode}
       {label}
      </button>
     ))}
     {message.handoff ? (
      <Link
       to={message.handoff.route}
       className="inline-flex items-center gap-2 rounded-[8px] border-[2px] border-black bg-[#FFDA47] px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em]"
      >
       Open {message.handoff.targetTitle}
       <ArrowRight size={14} />
      </Link>
     ) : null}
    </div>
   </div>
  </article>
 )
}

const UserMessage: React.FC<{ text: string }> = ({ text }) => (
 <article className={`${innerCard} ml-auto max-w-[82%] bg-[#f8f8f4] p-4 shadow-[3px_3px_0_0_#000]`}>
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
 const update = (key: keyof AiBrainContext, value: string) => onChange({ ...context, [key]: value })
 return (
  <section className={`${shellCard} overflow-hidden`}>
   <div className="border-b-[4px] border-black bg-[#3FEE56] px-5 py-4">
    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">Creator Profile Setup</div>
    <h2 className="mt-1 text-3xl font-[1000] uppercase leading-none">Help ViewTube Understand Your Channel</h2>
    <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-black/70">
     Answer what you can now. I'll also infer from your channel data, but your answers help me rank goals, content
     advice, series ideas, and monetization recommendations around what you actually want.
    </p>
   </div>
   <div className="grid gap-4 p-4 lg:grid-cols-2">
    {AI_BRAIN_INTAKE_QUESTIONS.map((question) => (
     <label key={question.id} className={`${innerCard} block overflow-hidden`}>
      <span className="block border-b-[2px] border-black px-3 py-2" style={{ backgroundColor: TOOLBOX_PALETTE[3] }}>
       <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-black/55">{question.label}</span>
       <span className="block text-sm font-[1000] leading-5">{question.prompt}</span>
      </span>
      <textarea
       value={String(context[question.id] || "")}
       onChange={(event) => update(question.id, event.target.value)}
       placeholder={question.placeholder}
       className="min-h-[96px] w-full resize-y border-0 bg-white p-3 text-sm font-bold leading-6 outline-none focus:bg-[#FFDA47]/20"
      />
     </label>
    ))}
   </div>
   <div className="border-t-[4px] border-black bg-[#f8f8f4] p-4">
    <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
     <p className="text-sm font-bold leading-6 text-black/70">
      You can skip this and just start talking to me — I'll ask for what I need as it becomes relevant.
     </p>
     <button type="button" onClick={onDefer} className={`${kpiButton} justify-center`}>
      Skip for now
     </button>
     <button
      type="button"
      onClick={onSave}
      className="inline-flex items-center justify-center gap-2 rounded-[10px] border-[2px] border-black bg-[#3FEE56] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] shadow-[3px_3px_0_0_#000]"
     >
      Save Creator Profile
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
 const [learningEntries, setLearningEntries] = useState<AIBrainLearningEntry[]>([])
 const [recentTurns, setRecentTurns] = useState<AIBrainConversationTurn[]>([])
 const [questionAnswers, setQuestionAnswers] = useState<AIBrainQuestionAnswer[]>([])
 const [onboardingSnapshot, setOnboardingSnapshot] = useState<BrainOnboardingSnapshot | null>(null)
 const [intakeOpen, setIntakeOpen] = useState(false)
 const [intakeContext, setIntakeContext] = useState<AiBrainContext>(() => loadAiBrainContext())
 const bottomRef = useRef<HTMLDivElement | null>(null)
 const layoutRef = useRef<HTMLDivElement | null>(null)
 const [fittedHeight, setFittedHeight] = useState<number | null>(null)
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

 /**
  * Size the workspace to whatever viewport space is left below the app chrome.
  *
  * The amount of chrome above this point is not a constant: the top bar, sidebar,
  * and the Toolbox header (which can expand a help panel) all vary. Measuring the
  * real offset is the only way the conversation and the rail reliably land on one
  * screen instead of being clipped by the Toolbox's own overflow.
  */
 useEffect(() => {
  const measure = () => {
   const node = layoutRef.current
   if (!node || typeof window === "undefined") return
   if (!window.matchMedia("(min-width: 1280px)").matches) {
    setFittedHeight(null)
    return
   }
   const documentTop = node.getBoundingClientRect().top + window.scrollY
   setFittedHeight(Math.max(520, Math.round(window.innerHeight - documentTop - 24)))
  }
  const frame = window.requestAnimationFrame(measure)
  window.addEventListener("resize", measure)
  return () => {
   window.cancelAnimationFrame(frame)
   window.removeEventListener("resize", measure)
  }
 }, [])

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
   const turns = await listAIBrainConversationTurns({ channelId, limit: 20 })
   setRecentTurns(turns)
   setQuestionAnswers(turns.flatMap((turn) => turn.questionAnswers || []))
   const restoredMessages = turns
    .filter((turn) => turn.response && turn.metadata?.source !== "feedback")
    .slice()
    .reverse()
    .flatMap<ChatMessage>((turn) => [
     { id: `${turn.id}-user`, role: "user", text: turn.userText },
     { id: turn.id, role: "model", text: turn.assistantText, response: turn.response, handoff: null },
    ])
   setMessages(restoredMessages)
  } catch (error) {
   console.warn("[AIBrain] Conversation thread unavailable:", error)
  }
 }

 useEffect(() => {
  void refreshLearning()
  void refreshConversationTurns()
 }, [channelId])

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
   const historyPayload = messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
   }))
   const responseText = canUseGemini
    ? await generateChatResponse(historyPayload, userText, false, systemPrompt)
    : buildCreatorBrainLocalFallback(userText, snapshot)
   const handoff = shouldOfferReviewedHandoff(`${userText} ${responseText}`)
    ? await queueAIBrainReviewedAction({
       request: userText,
       response: responseText,
       channelId: authState.channelHandle || null,
      })
    : null
   const response = formatCreatorBrainResponse(responseText, snapshot, { requestText: userText })
   const modules = formatCreatorGrowthModules(response, creatorGrowthContext)
   const responseWithModules: CreatorBrainResponse = { ...response, modules }
   setMessages((current) => [
    ...current,
    { id: makeMessageId(), role: "model", text: responseText, response: responseWithModules, handoff },
   ])
   const learningEntry = await captureLearning({
    channelId,
    source: "copilot",
    summary: `Conversation about: ${userText}`,
    detail: responseWithModules.keyInsight,
    category: "preference",
    confidence: responseWithModules.confidence,
    evidence: responseWithModules.modules?.map((module) => module.title) || [],
    metadata: {
     answerMode: responseWithModules.mode,
     usefulnessScore: scoreAIBrainAnswerUsefulness({ response: responseWithModules }),
    },
   })
   await saveAIBrainConversationTurn({
    channelId,
    userText,
    assistantText: responseText,
    response: responseWithModules,
    answerModules: modules,
    learningEntryIds: learningEntry ? [learningEntry.id] : [],
    metadata: handoff ? { handoffRoute: handoff.route, handoffTarget: handoff.targetTitle } : undefined,
   })
   await refreshConversationTurns()
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   const creatorMessage = buildCreatorBrainLocalFallback(userText, snapshot)
   const response = formatCreatorBrainResponse(creatorMessage, snapshot, { requestText: userText })
   console.warn("[AIBrain] Copilot answer failed:", message)
   setMessages((current) => [
    ...current,
    {
     id: makeMessageId(),
     role: "model",
     text: creatorMessage,
     response: { ...response, modules: formatCreatorGrowthModules(response, creatorGrowthContext) },
    },
   ])
  } finally {
   setBusy(false)
   window.requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }))
  }
 }

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
  <main className="min-h-screen bg-[#f3f4f6] px-4 py-6 text-black sm:px-6 lg:px-8">
   <div className="mx-auto max-w-[1700px]">
    <Toolbox
     title="ViewTube Brain Hub"
     subtitle="One assistant for channel strategy, analytics, goals, content planning, SEO, and publishing. It decides what to focus on for you."
     icon={<Brain />}
     paletteIndex={5}
     collapsible={false}
     contentClassName="bg-[#f3f4f6] p-4 sm:p-6"
    >
     <div className="grid gap-5">
      {intakeOpen ? (
       <CreatorIntakeWizard
        context={intakeContext}
        onChange={setIntakeContext}
        onSave={handleSaveIntake}
        onDefer={handleDeferIntake}
       />
      ) : null}

      <section className={`${shellCard} overflow-hidden`}>
       <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-[4px] border-black bg-white px-4 py-3">
        <h1 className="text-2xl font-[1000] uppercase leading-none sm:text-3xl">Ask ViewTube Copilot Anything</h1>
        <dl className="flex flex-wrap items-center gap-2">
         {(
          [
           ["Channel", snapshot.channel.label],
           ["Videos", snapshot.vtSync.videos ? snapshot.vtSync.videos.toLocaleString() : "None synced"],
           ["Views", metricText(snapshot.channel.totalViews)],
          ] as const
         ).map(([label, value]) => (
          <div
           key={label}
           className="flex items-baseline gap-1.5 rounded-[8px] border-[2px] border-black bg-[#f8f8f4] px-2 py-1"
          >
           <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-black/45">{label}</dt>
           <dd className="text-[11px] font-[1000] uppercase leading-4">{value}</dd>
          </div>
         ))}
        </dl>
       </div>

       <div
        ref={layoutRef}
        style={fittedHeight ? { height: `${fittedHeight}px` } : undefined}
        className="grid gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_330px]"
       >
        <div className={`${innerCard} flex min-h-0 flex-col overflow-hidden max-xl:min-h-[520px]`}>
         <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto bg-white p-4">
          {messages.length === 0 ? (
           <OpeningBriefing snapshot={snapshot} />
          ) : (
           <div className="grid gap-4">
            {messages.map((message) =>
             message.role === "user" ? (
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
             ),
            )}
            <div ref={bottomRef} />
           </div>
          )}
         </div>

         <div className="border-t-[4px] border-black bg-[#f8f8f4] p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
           {promptCards.slice(0, 6).map((card) => (
            <button
             key={card.id}
             type="button"
             onClick={() => void handleSend(card.prompt)}
             className="rounded-[10px] border-[2px] border-black bg-white px-2 py-1.5 text-[10px] font-black uppercase hover:bg-[#FFDA47]"
            >
             {card.label}
            </button>
           ))}
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
           <label className="sr-only" htmlFor="brain-composer">
            Ask ViewTube Copilot
           </label>
           <textarea
            id="brain-composer"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
             if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void handleSend()
            }}
            placeholder="Ask about CTR, scripts, revenue, retention, goals, thumbnails, SEO, publishing, or your channel direction..."
            className="min-h-[58px] flex-1 rounded-[12px] border-[3px] border-black bg-white p-2.5 text-sm font-bold leading-6 outline-none focus:bg-[#FFDA47]/25"
           />
           <button
            type="button"
            onClick={() => void handleSend()}
            disabled={busy || !input.trim()}
            className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[12px] border-[3px] border-black bg-[#3FEE56] px-5 text-sm font-black uppercase tracking-[0.12em] shadow-[4px_4px_0_0_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
           >
            {busy ? <Zap className="animate-pulse" size={18} /> : <Send size={18} />}
            Send
           </button>
          </div>

          <details className="mt-3 overflow-hidden rounded-[10px] border-[2px] border-black bg-white">
           <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-[#FF7AC8]">
            <BookOpen size={14} />
            Save a note to memory
           </summary>
           <div className="grid gap-2 border-t-[2px] border-black p-3">
            <label className="sr-only" htmlFor="brain-journal">
             Note to save to Brain memory
            </label>
            <textarea
             id="brain-journal"
             value={journalInput}
             onChange={(event) => setJournalInput(event.target.value)}
             placeholder="A goal, a content style note, an audience insight, a constraint — anything you want me to remember."
             className="min-h-[90px] rounded-[8px] border-[2px] border-black bg-white p-3 text-sm font-bold leading-6 outline-none focus:bg-[#FFDA47]/25"
            />
            <button
             type="button"
             onClick={handleJournalSave}
             disabled={!journalInput.trim()}
             className="inline-flex w-fit items-center gap-2 rounded-[8px] border-[2px] border-black bg-[#3FEE56] px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] disabled:opacity-50"
            >
             <Send size={13} />
             Remember this
            </button>
           </div>
          </details>
         </div>
        </div>

        <div className="custom-scrollbar min-h-0 xl:overflow-y-auto">
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
      </section>
     </div>
    </Toolbox>
   </div>
  </main>
 )
}

export default AIBrainCommandInterface
