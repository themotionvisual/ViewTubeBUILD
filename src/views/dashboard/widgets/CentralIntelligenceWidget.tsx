import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  Brain,
  Send,
  Sparkles,
  Trash2,
  TrendingDown,
  Clapperboard,
  BarChart3,
  Lightbulb,
  Image,
  CalendarClock,
  MessagesSquare,
  HandCoins,
  Zap,
  Dna,
  Map as MapIcon,
  WandSparkles,
  Check,
  Plus,
  Copy,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetHeaderToggle } from "../WidgetPrimitives"
import { useEntitlement } from "../../../context/entitlementContext"
import { useBrain } from "../../../context/useBrain"
import { canAffordAiTokensFromState } from "../../../services/billingEntitlement"
import { getAiTokenCost } from "../../../services/aiTokenCosts"
import {
  generateJournalFollowUps,
  generateInfiniteMicroPolls,
  isGeminiConfigured,
} from "../../../services/gemini"
import { reflectAndCompress } from "../../../services/brain"

/* ═══════════════════════════════════════════════════════════════════════
 * TYPES & CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════ */

export type CentralIntelTab = "ask" | "journal" | "memory" | "prompts"

interface Message {
  role: "user" | "ai"
  text: string
  timestamp: number
}

const TABS: readonly { id: CentralIntelTab; label: string }[] = [
  { id: "ask", label: "Ask AI" },
  { id: "journal", label: "Journal" },
  { id: "memory", label: "Brain OS" },
  { id: "prompts", label: "Prompts" },
] as const

const ASK_STORAGE_KEY = "vt_askme_history"

const JOURNAL_CATEGORIES = [
  { id: "content", label: "Content", hint: "Creative ideas, video experiments, and formats" },
  { id: "goals", label: "Goals", hint: "Subscriber milestones, revenue targets, and watch hours" },
  { id: "style", label: "Style", hint: "Editing pacing, thumbnail aesthetics, and tone of voice" },
  { id: "community", label: "Community", hint: "Audience sentiment, comments, and member perks" },
  { id: "plans", label: "Plans", hint: "Upcoming series, production schedule, and scripting" },
  { id: "site", label: "Site", hint: "Platform branding, channel banner, and links" },
  { id: "self", label: "Self", hint: "Creator mindset, energy levels, and burnout management" },
  { id: "projects", label: "Projects", hint: "Sponsorships, merchandise, and collaborations" },
]

const MEMORY_QUADRANTS = [
  {
    key: "identityAndAspirations",
    label: "Identity & Mission",
    subtitle: "Creator Archetype & Voice",
    icon: Sparkles,
    color: "#FF3399",
    bgLight: "rgba(255,51,153,0.06)",
  },
  {
    key: "contentDNA",
    label: "Content DNA",
    subtitle: "Pacing, Tropes & Formats",
    icon: Dna,
    color: "#00D2FF",
    bgLight: "rgba(0,210,255,0.06)",
  },
  {
    key: "performanceLedger",
    label: "Performance Ledger",
    subtitle: "Baseline CTR, AVD & Top Pillars",
    icon: BarChart3,
    color: "#C9F830",
    bgLight: "rgba(201,248,48,0.06)",
  },
  {
    key: "futureStateMap",
    label: "Future State Map",
    subtitle: "Upcoming Series & Milestones",
    icon: MapIcon,
    color: "#FFB570",
    bgLight: "rgba(255,181,112,0.06)",
  },
] as const

const QUICK_TOPICS = [
  {
    label: "View Drop-Off",
    category: "Traffic",
    q: "Why are my views dropping? Analyze my recent video performance and recommend fixes.",
    Icon: TrendingDown,
    color: "#4FFF5B",
  },
  {
    label: "Hook Audit",
    category: "Packaging",
    q: "Audit the hooks on my top 5 videos. Which ones hold attention and which lose viewers?",
    Icon: Clapperboard,
    color: "#00D2FF",
  },
  {
    label: "Growth Levers",
    category: "Strategy",
    q: "What are my biggest growth opportunities right now based on my analytics?",
    Icon: BarChart3,
    color: "#579AFF",
  },
  {
    label: "Video Ideas",
    category: "Ideation",
    q: "Give me 10 high-potential video ideas based on my recent audience retention and performance.",
    Icon: Lightbulb,
    color: "#D074FF",
  },
  {
    label: "Thumbnail Test",
    category: "Packaging",
    q: "What thumbnail concepts and visual contrasts should I A/B test next and why?",
    Icon: Image,
    color: "#FF83EA",
  },
  {
    label: "Weekly Sprint",
    category: "Action",
    q: "Build a 7-day action plan to increase views, click-through rate, and subscribers this week.",
    Icon: CalendarClock,
    color: "#FFB570",
  },
  {
    label: "Community Boost",
    category: "Audience",
    q: "What community posts and interactive polls should I publish this week to maximize reach?",
    Icon: MessagesSquare,
    color: "#FFE35C",
  },
  {
    label: "Revenue Levers",
    category: "Monetization",
    q: "What are my fastest practical revenue improvements over the next 30 days?",
    Icon: HandCoins,
    color: "#C9F830",
  },
]

const STRATEGY_PROMPTS = [
  {
    title: "Full Content Audit",
    category: "Analytics",
    desc: "Examine your top 20 videos to uncover what makes winners win.",
    q: "Do a full content audit: which of my recent videos outperformed the baseline and why?",
    color: "#FF3399",
  },
  {
    title: "Niche Differentiation",
    category: "Positioning",
    desc: "Find your unfair advantage vs competing channels in your topic area.",
    q: "Analyze my channel positioning. How can I differentiate from creators in similar niches?",
    color: "#00D2FF",
  },
  {
    title: "Algorithm Alignment",
    category: "Reach",
    desc: "Check your upload frequency, velocity, and session-start potential.",
    q: "How well does my content structure fit the current YouTube algorithm? What should I change?",
    color: "#C9F830",
  },
  {
    title: "Retention Cliff Fix",
    category: "Audience",
    desc: "Diagnose early drop-offs and structure mid-video re-engagement spikes.",
    q: "My average view duration needs improvement. Give me 5 concrete structural edits to increase retention.",
    color: "#FFB570",
  },
  {
    title: "High-CTR Title Formula",
    category: "Packaging",
    desc: "Generate high-converting title archetypes tailored to your content style.",
    q: "Create a 5-part title formula and template set based on my top-performing video titles.",
    color: "#4FFF5B",
  },
  {
    title: "Optimal Publishing Cadence",
    category: "Cadence",
    desc: "Determine the ideal upload rhythm for your channel size and workflow.",
    q: "What is the optimal upload schedule and release timing for my channel size and audience?",
    color: "#D074FF",
  },
  {
    title: "Monetization Blueprint",
    category: "Revenue",
    desc: "Map out memberships, digital products, and high-CPM topic clusters.",
    q: "Map out all monetization opportunities and high-CPM topics I am currently leaving on the table.",
    color: "#FF83EA",
  },
  {
    title: "90-Day Growth Sprint",
    category: "Roadmap",
    desc: "Structured weekly milestone roadmap to hit your next tier.",
    q: "Build a comprehensive 90-day growth sprint plan with weekly production and testing milestones.",
    color: "#579AFF",
  },
]

/* ═══════════════════════════════════════════════════════════════════════
 * FORMATTED MESSAGE PARSER
 * ═══════════════════════════════════════════════════════════════════════ */

const FormattedMessage = ({ text }: { text: string }) => {
  const lines = text.split("\n")
  const colors = ["#FF3399", "#00D2FF", "#C9F830", "#FFB570", "#4FFF5B", "#B191FF", "#70FFCB"]
  let catIndex = 0

  return (
    <div className="flex flex-col gap-2">
      {lines.map((line, i) => {
        const cleanLine = line.trim()
        if (!cleanLine) return null

        // Major Section Heading (**HEADING**)
        const mainCatMatch = cleanLine.match(/^\*\*(.+)\*\*$/)
        if (mainCatMatch) {
          const color = colors[catIndex % colors.length]
          catIndex++
          const title = mainCatMatch[1].replace(/^\d+\.\s*/, "")
          return (
            <div
              key={i}
              className="inline-flex self-start items-center px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] mt-1"
              style={{ backgroundColor: color }}
            >
              {title}
            </div>
          )
        }

        // Key-Value Subheading (**Key:** Value)
        const stripped = cleanLine.replace(/^[*-]\s*/, "")
        const subCatMatch = stripped.match(/^\*\*(.+?):\*\*\s*(.*)$/)
        if (subCatMatch) {
          const [, subTitle, content] = subCatMatch
          const cleanContent = content.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1")
          return (
            <div key={i} className="text-[11px] leading-relaxed pl-1">
              <span className="font-black text-black">{subTitle}: </span>
              <span className="font-bold opacity-85">{cleanContent}</span>
            </div>
          )
        }

        // Regular Text Line
        const regularClean = stripped.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1")
        return (
          <div key={i} className="text-[11px] font-bold opacity-85 leading-relaxed">
            {regularClean}
          </div>
        )
      })}
    </div>
  )
}

/** Local heuristic fallback when Gemini API key is not configured */
function generateLocalResponse(question: string, data: any): string {
  const q = question.toLowerCase()
  const stats = data.statBlocks28d || []
  const views = stats.find((s: any) => s.label.toLowerCase().includes("views"))?.value || "0"
  const subs = stats.find((s: any) => s.label.toLowerCase().includes("subscribers"))?.value || "0"
  const revenue = stats.find((s: any) => s.label.toLowerCase().includes("revenue"))?.value || "$0"

  if (q.includes("views") || q.includes("drop") || q.includes("traffic")) {
    return `📊 **Views & Traffic Analysis**\nYour 28-day views: ${views}\n\n**Primary Diagnoses:**\n• Upload Cadence: Gaps longer than 7 days slow algorithm recommendation\n• Thumbnail CTR: Initial impression testing needs curiosity and contrast\n• Topic Momentum: Align with your highest-velocity upload themes\n\n**Action Item:** Publish your next upload within 48 hours in your proven core format.`
  }
  if (q.includes("revenue") || q.includes("money") || q.includes("earn") || q.includes("monetiz")) {
    return `💰 **Monetization Blueprint**\n28-day estimated revenue: ${revenue}\n\n**Key Levers:**\n1. Target 10+ minute formats for mid-roll placement\n2. Integrate affiliate & digital resource links in pinned comments\n3. Increase audience watch time to maximize ad yield\n\n**Quick Win:** Place end-screen video cards on top 5 videos to chain viewer sessions.`
  }
  if (q.includes("subscriber") || q.includes("growth") || q.includes("grow") || q.includes("reach")) {
    return `👥 **Audience Growth Report**\nCurrent subscribers: ${subs}\n\n**Growth Tactics:**\n1. Timed In-Video Calls-to-Action: Prompt subscription right after a major value drop\n2. Community Tab Engagement: Post interactive polls to trigger mobile feed alerts\n3. Shorts-to-Long Funnel: Convert shorts traffic into long-form views\n\n**Action Item:** Create 2 Shorts highlights from your top performing video.`
  }
  return `🤖 **Channel Intelligence Summary**\n• 28d Views: ${views}\n• Subscribers: ${subs}\n• Revenue: ${revenue}\n\n**Core Directive:** Maintain strict upload cadence and optimize thumbnail contrast. Double down on topics that generate your highest viewer retention.\n\nAsk for specific breakdowns on hooks, keywords, or retention curves.`
}

/* ═══════════════════════════════════════════════════════════════════════
 * MAIN CENTRAL INTELLIGENCE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════ */

export const CentralIntelligenceWidget: React.FC<any> = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  data,
  defaultTab = "ask",
}) => {
  const common = {
    widget,
    instance,
    editMode,
    canEdit: true,
    onToggleCollapse,
    onCycleSize,
    onRemove,
    onDecSize,
    onCycleHeight,
    onDecHeight,
  }

  const [activeTab, setActiveTab] = useState<CentralIntelTab>(defaultTab)

  /* ─── ASK AI STATE ─── */
  const ASK_COST = getAiTokenCost("askMeQuestion")
  const entitlement = useEntitlement()
  const canAffordAsk = canAffordAiTokensFromState(entitlement, ASK_COST)
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined" || typeof localStorage.getItem !== "function") return []
    try { return JSON.parse(localStorage.getItem(ASK_STORAGE_KEY) || "[]") } catch { return [] }
  })
  const [askInput, setAskInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab === "ask") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages, activeTab])

  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && typeof localStorage.setItem === "function") {
      try {
        localStorage.setItem(ASK_STORAGE_KEY, JSON.stringify(messages.slice(-50)))
      } catch {}
    }
  }, [messages])

  const buildContext = useCallback(() => {
    const stats = data?.statBlocks28d?.map((s: any) => `${s.label}: ${s.value}`).join(", ") || "No stats available"
    const topVideos = (data?.canonicalRows || []).slice(0, 5).map((v: any) => v.title).join(", ") || "No videos"
    const subs = data?.brain?.recentMetrics?.currentSubscribers || 0
    return `Channel stats (28d): ${stats}. Subscribers: ${subs}. Recent videos: ${topVideos}.`
  }, [data])

  const handleSend = useCallback(async (question?: string) => {
    const q = question || askInput.trim()
    if (!q || !canAffordAsk) return
    setAskInput("")
    setMessages((prev) => [...prev, { role: "user", text: q, timestamp: Date.now() }])
    setIsThinking(true)

    try {
      const context = buildContext()
      const { askChannelQuestion } = await import("../../../services/gemini")
      const answer = await askChannelQuestion(q, context, data?.brain)
      setMessages((prev) => [...prev, { role: "ai", text: answer, timestamp: Date.now() }])
    } catch {
      const fallback = generateLocalResponse(q, data || {})
      setMessages((prev) => [...prev, { role: "ai", text: fallback, timestamp: Date.now() }])
    } finally {
      setIsThinking(false)
    }
  }, [askInput, canAffordAsk, buildContext, data])

  const clearHistory = () => {
    setMessages([])
    if (typeof localStorage !== "undefined" && typeof localStorage.removeItem === "function") {
      try { localStorage.removeItem(ASK_STORAGE_KEY) } catch {}
    }
  }

  const handleCopyMessage = (text: string, index: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    }
  }

  /* ─── JOURNAL STATE ─── */
  const { brain, addJournalEntry, addFollowUp, answerFollowUp, answerMicroPoll, setMicroPolls, getBrainMemory } = useBrain()
  const [journalContent, setJournalContent] = useState("")
  const [journalCategory, setJournalCategory] = useState("content")
  const [isJournalSubmitting, setIsJournalSubmitting] = useState(false)
  const [isGeneratingPulse, setIsGeneratingPulse] = useState(false)
  const [geminiReady, setGeminiReady] = useState(false)

  useEffect(() => {
    try { setGeminiReady(isGeminiConfigured()) } catch { setGeminiReady(false) }
  }, [])

  const currentCategoryHint = useMemo(() => {
    return JOURNAL_CATEGORIES.find((c) => c.id === journalCategory)?.hint || ""
  }, [journalCategory])

  const refreshPulse = async () => {
    if (!geminiReady) return
    setIsGeneratingPulse(true)
    try {
      const polls = await generateInfiniteMicroPolls(brain)
      setMicroPolls(polls)
    } catch (error) {
      console.warn("[CentralIntelligence] Pulse generation skipped:", error)
    } finally {
      setIsGeneratingPulse(false)
    }
  }

  const handleJournalSubmit = async () => {
    if (!journalContent.trim()) return
    setIsJournalSubmitting(true)
    try {
      const entry = addJournalEntry(journalContent, journalCategory)
      setJournalContent("")
      const questions = geminiReady ? await generateJournalFollowUps(journalContent, brain) : []
      questions.forEach((q: string) => addFollowUp(entry.id, q))
      if (geminiReady) refreshPulse()
    } finally {
      setIsJournalSubmitting(false)
    }
  }

  const pendingFollowUps = (brain?.journalFollowUps || []).filter((f: any) => !f.answer).slice(0, 3)
  const pendingPolls = (brain?.microPolls || []).filter((p: any) => !p.answer).slice(0, 5)

  /* ─── BRAIN OS STATE ─── */
  const memory = getBrainMemory()
  const [isReflecting, setIsReflecting] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const handleReflect = async () => {
    setIsReflecting(true)
    try {
      await reflectAndCompress()
      window.location.reload()
    } catch {
      setIsReflecting(false)
    }
  }

  const lastSync = memory?.lastReflection
    ? new Date(memory.lastReflection).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Never"

  /* ─── PROMPTS STATE ─── */
  const [customPromptInput, setCustomPromptInput] = useState("")

  const handleDispatchPrompt = (q: string) => {
    setActiveTab("ask")
    setTimeout(() => handleSend(q), 60)
  }

  return (
    <WidgetShell {...common} icon={<Brain size={22} />}>
      {/* Tab Navigation Header Toggle */}
      <WidgetHeaderToggle
        label="Intelligence mode"
        value={activeTab}
        items={TABS}
        onChange={setActiveTab}
      />

      <WidgetScrollArea ariaLabel="Central Intelligence Hub" contentClassName="flex min-h-full flex-col gap-3 p-1">

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 1: ASK AI (Channel Intelligence Chat)                   */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "ask" && (
          <div className="flex flex-col gap-2.5 flex-1 min-h-0">
            {/* OODA Strategic Banner */}
            {memory?.strategicAdvice && (
              <div className="flex items-center gap-2 p-2.5 bg-black text-[#CCFF00] border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000]">
                <div className="p-1 bg-[#CCFF00] text-black rounded flex items-center justify-center shrink-0">
                  <Zap size={13} strokeWidth={3} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#CCFF00]/60">
                    OODA Priority Directive
                  </span>
                  <span className="text-[11px] font-black leading-tight truncate">
                    "{memory.strategicAdvice}"
                  </span>
                </div>
              </div>
            )}

            {/* Quick Strategy Topics */}
            {messages.length === 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Strategy Shortcuts
                  </span>
                  <span className="text-[8px] font-black uppercase text-gray-400">
                    1-Click Diagnostics
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_TOPICS.map((t, i) => {
                    const IconComponent = t.Icon
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(t.q)}
                        disabled={!canAffordAsk}
                        className="flex items-center gap-2 p-2 rounded-lg border-2 border-black text-left transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] active:translate-y-0 disabled:opacity-50"
                        style={{ backgroundColor: t.color }}
                      >
                        <IconComponent size={14} className="shrink-0 text-black" strokeWidth={2.5} />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[10px] font-black text-black uppercase leading-tight truncate">
                            {t.label}
                          </span>
                          <span className="text-[8px] font-extrabold text-black/60 uppercase">
                            {t.category}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {!canAffordAsk && (
                  <div className="text-[9px] font-black text-red-500 uppercase">
                    {entitlement?.tier === "free" ? "Upgrade required for AI co-pilot." : `Requires ${ASK_COST} credits.`}
                  </div>
                )}
              </div>
            )}

            {/* Chat Conversation History */}
            <div className="flex flex-col gap-2 flex-1 min-h-[120px] pr-1">
              {messages.map((msg, i) => {
                const isUser = msg.role === "user"
                return (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 max-w-[92%] p-2.5 rounded-lg border-2 border-black transition-all ${
                      isUser
                        ? "self-end bg-[#579AFF] text-white shadow-[2px_2px_0_0_#000]"
                        : "self-start bg-white text-black shadow-[2px_2px_0_0_rgba(0,0,0,0.15)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-wider ${isUser ? "text-white/70" : "text-gray-400"}`}>
                        {isUser ? "You" : "ViewTube Brain"}
                      </span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, i)}
                          className="p-0.5 rounded hover:bg-gray-100 text-gray-500"
                          title="Copy message"
                        >
                          {copiedIndex === i ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>

                    {isUser ? (
                      <div className="text-[11px] font-bold leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    ) : (
                      <FormattedMessage text={msg.text} />
                    )}
                  </div>
                )
              })}

              {isThinking && (
                <div className="self-start flex items-center gap-2 p-2.5 bg-gray-50 border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000]">
                  <Sparkles size={14} className="animate-spin text-[#FF3399]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">
                    Synthesizing channel signals...
                  </span>
                </div>
              )}
            </div>

            {/* Input Composer */}
            <div className="flex gap-1.5 pt-1 mt-auto">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  title="Clear conversation"
                  className="vt-button is-icon-only shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <textarea
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about retention, CTR, topics, competitors..."
                rows={2}
                className="vt-textarea flex-1 min-h-[56px] resize-none"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isThinking || !askInput.trim() || !canAffordAsk}
                title={!canAffordAsk ? "Upgrade required" : `Ask AI (${ASK_COST} credits)`}
                className="vt-button primary shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 2: JOURNAL (Double-Loop Creator Journal)                */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "journal" && (
          <div className="flex flex-col gap-3">
            {/* Category Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-1" role="group" aria-label="Journal category">
                {JOURNAL_CATEGORIES.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`vt-button ${journalCategory === id ? "primary" : ""}`.trim()}
                    aria-pressed={journalCategory === id}
                    onClick={() => setJournalCategory(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-[9px] font-bold text-gray-500 italic pl-0.5">
                💡 {currentCategoryHint}
              </span>
            </div>

            {/* Note Composer */}
            <div className="flex flex-col gap-1.5">
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Log a creative breakthrough, experiment result, or workflow change..."
                className="vt-textarea min-h-[72px]"
              />
              <button
                type="button"
                onClick={handleJournalSubmit}
                disabled={isJournalSubmitting || !journalContent.trim()}
                className="vt-button primary w-full"
              >
                <Send size={14} />
                <span>Save to Brain Memory</span>
              </button>
            </div>

            {/* AI Follow-Ups / Reflections */}
            {pendingFollowUps.length > 0 && (
              <div className="flex flex-col gap-2 pt-1 border-t border-gray-200">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#B191FF] tracking-wide">
                  <Sparkles size={13} />
                  <span>AI Reflection Prompts</span>
                </div>
                <div className="flex flex-col gap-2">
                  {pendingFollowUps.map((f: any) => (
                    <div
                      key={f.id}
                      className="p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000] flex flex-col gap-2"
                    >
                      <span className="text-[11px] font-extrabold leading-snug">{f.question}</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Optional reply..."
                          className="vt-input flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              answerFollowUp(f.id, (e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            answerFollowUp(f.id, input.value || "Acknowledged")
                          }}
                          className="vt-button primary is-icon-only shrink-0"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* The Pulse (Micro-Polls) */}
            <div className="flex flex-col gap-2 pt-1 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#FFB570] tracking-wide">
                  <Zap size={13} />
                  <span>The Pulse (Feedback Loop)</span>
                </div>
                {isGeneratingPulse && (
                  <span className="text-[8px] font-black animate-pulse uppercase">Syncing...</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {pendingPolls.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000] flex items-center justify-between gap-2"
                  >
                    <span className="text-[10px] font-black leading-tight flex-1">{p.question}</span>
                    <div className="flex gap-1 shrink-0">
                      {p.type === "binary" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => answerMicroPoll(p.id, "Yes")}
                            className="vt-button"
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            onClick={() => answerMicroPoll(p.id, "No")}
                            className="vt-button"
                          >
                            NO
                          </button>
                        </>
                      ) : (
                        <div className="flex gap-1 items-center">
                          <input
                            type="text"
                            placeholder="Response..."
                            className="vt-input w-28"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") answerMicroPoll(p.id, (e.target as HTMLInputElement).value)
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement
                              answerMicroPoll(p.id, input.value || "Answered")
                            }}
                            className="vt-button primary is-icon-only"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {pendingPolls.length === 0 && !isGeneratingPulse && (
                  <button
                    type="button"
                    onClick={refreshPulse}
                    className="vt-button w-full text-[10px]"
                  >
                    <RefreshCw size={12} />
                    <span>Generate Fresh Feedback Questions</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 3: BRAIN OS (Memory & OODA Directives)                   */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "memory" && (
          <div className="flex flex-col gap-2.5 flex-1">
            {/* OODA Directive Primary Banner */}
            {memory?.strategicAdvice && (
              <div className="p-3 bg-black text-[#CCFF00] border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000] flex items-start gap-2.5">
                <div className="p-1.5 bg-[#CCFF00] text-black rounded flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={16} strokeWidth={3} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#CCFF00]/60">
                    OODA Executive Directive
                  </span>
                  <span className="text-[12px] font-black uppercase leading-snug">
                    "{memory.strategicAdvice}"
                  </span>
                </div>
              </div>
            )}

            {/* 4 Memory Quadrants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MEMORY_QUADRANTS.map(({ key, label, subtitle, icon: Icon, color, bgLight }) => {
                const value = (memory as any)?.[key] || "Awaiting signal data..."
                const isExpanded = expandedSection === key

                return (
                  <div
                    key={key}
                    onClick={() => setExpandedSection(isExpanded ? null : key)}
                    className="flex flex-col p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] cursor-pointer transition-all"
                    style={{ backgroundColor: isExpanded ? bgLight : "#ffffff" }}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center border border-black shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          <Icon size={12} className="text-black" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-wide truncate">
                            {label}
                          </span>
                          <span className="text-[8px] font-bold text-gray-500 truncate">
                            {subtitle}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={12}
                        className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </div>

                    <p className={`text-[10px] font-bold text-gray-700 leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
                      {value}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Footer Status & Reflect */}
            <div className="flex items-center justify-between p-2 mt-auto bg-gray-50 border-2 border-black rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4FFF5B] border border-black animate-pulse" />
                <span className="text-[9px] font-black uppercase text-gray-600">
                  Synced: {lastSync}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-white border border-black">
                  {memory?.interactionCount || 0} Signals
                </span>
              </div>

              <button
                type="button"
                onClick={handleReflect}
                disabled={isReflecting}
                className="vt-button primary text-[9px] font-black uppercase"
              >
                <Zap size={11} />
                <span>{isReflecting ? "Reflecting..." : "Reflect & Compress"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 4: PROMPTS (Strategy Prompt Workbench)                  */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "prompts" && (
          <div className="flex flex-col gap-3">
            {/* Custom Prompt Builder */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                Custom Strategy Prompt
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customPromptInput}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customPromptInput.trim()) {
                      handleDispatchPrompt(customPromptInput.trim())
                      setCustomPromptInput("")
                    }
                  }}
                  placeholder="Ask a custom question..."
                  className="vt-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customPromptInput.trim()) {
                      handleDispatchPrompt(customPromptInput.trim())
                      setCustomPromptInput("")
                    }
                  }}
                  disabled={!customPromptInput.trim() || !canAffordAsk}
                  className="vt-button primary is-icon-only shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            {/* Strategy Prompt Matrix */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                  Curated Strategy Prompts
                </span>
                <span className="text-[8px] font-black uppercase text-gray-400">
                  1-Tap Execution
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STRATEGY_PROMPTS.map((p, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wide truncate">
                          {p.title}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-black shrink-0"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold text-gray-600 mb-2 leading-snug">
                        {p.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDispatchPrompt(p.q)}
                      disabled={!canAffordAsk}
                      className="vt-button w-full text-[9px] font-black uppercase"
                      style={{ backgroundColor: p.color }}
                    >
                      <WandSparkles size={11} />
                      <span>Run Prompt</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </WidgetScrollArea>
    </WidgetShell>
  )
}
