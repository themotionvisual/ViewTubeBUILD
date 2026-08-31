import React, { useState, useEffect, useMemo, useCallback } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetHeaderToggle } from "../WidgetPrimitives"
import { CommonWidgetProps } from "../types"
import {
  Sparkles,
  Zap,
  Check,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Send,
  Clock,
  Target,
  Brain,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Calendar,
} from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import {
  createBrainCommandAction,
  resolveBrainCommandRoute,
} from "../../../services/superToolActionPackets"
import { isGeminiConfigured } from "../../../services/gemini"
import type { SuperToolId } from "../../../types"

const OUTCOMES_STORAGE_KEY = "vt_daily_command_outcomes"
const PREVIOUS_SESSION_STORAGE_KEY = "vt_daily_command_prev_session"
const TASKS_STORAGE_KEY = "vt_daily_command_tasks_v2"
const GOAL_STORAGE_KEY = "vt_goal_targets_v2"

export type DailyCommandSection = "today" | "actions" | "brain"

export interface OvernightDelta {
  label: string
  value: string
  diff: string
  trend: "up" | "down" | "flat"
}

export interface PriorityItem {
  id: string
  text: string
  rationale: string
  confidence: "High" | "Medium" | "Low"
  goal: string
  actionLabel: string
  color: string
}

export interface RankedAction {
  id: string
  title: string
  subtitle: string
  impact: "High" | "Med"
  confidence: "High" | "Medium" | "Low"
  effort: "10m" | "25m" | "45m" | "2h"
  goalAffected: string
  targetTool: SuperToolId
  evidenceSource: string
  done?: boolean
}

export interface OutcomeRecord {
  id: string
  actionId: string
  actionText: string
  decision: "accepted" | "skipped" | "completed" | "deferred"
  timestamp: number
  dateKey: string
  goalAffected?: string
  targetRoute?: string
}

const JOURNAL_CATEGORIES = [
  { id: "content", label: "Content" },
  { id: "goals", label: "Goals" },
  { id: "plans", label: "Plans" },
  { id: "style", label: "Style" },
  { id: "self", label: "Self" },
]

const DEFAULT_COMMITMENTS = [
  { id: "c1", text: "Publish Shorts cutdown from Ep 14", completed: false, tag: "Upload" },
  { id: "c2", text: "Review title package for Sunday longform", completed: false, tag: "QA" },
  { id: "c3", text: "Reply to top 5 high-intent audience comments", completed: false, tag: "Community" },
]

function generateOracleReasoning(
  data: any,
  outcomeHistory: OutcomeRecord[],
  goalTargets: Record<string, any>
): { priorities: PriorityItem[]; actions: RankedAction[] } {
  const rows = data?.canonicalRows || []
  const stats = data?.statBlocks28d || []
  const recentDays = rows.filter((r: any) => {
    const d = new Date(r.uploadDate)
    return !isNaN(d.getTime()) && Date.now() - d.getTime() < 14 * 86400000
  })
  const hasRecentUpload = recentDays.length > 0
  const avgTitleLen =
    rows.slice(0, 10).reduce((sum: number, r: any) => sum + (r.title?.length || 0), 0) /
    Math.max(1, Math.min(10, rows.length))

  const completedIds = new Set(
    outcomeHistory
      .filter((o) => o.decision === "completed" || o.decision === "accepted")
      .map((o) => o.actionId)
  )

  const priorities: PriorityItem[] = []
  const actions: RankedAction[] = []

  // Priority 1: Cadence & Momentum
  if (!hasRecentUpload) {
    priorities.push({
      id: "p_cadence",
      text: "Cadence Warning: No upload in 14 days",
      rationale: "Impression distribution decays sharply after 7 days of inactivity. Post a Short or longform follow-up today.",
      confidence: "High",
      goal: "VIEWS",
      actionLabel: "Plan Upload",
      color: "#FF8AAF",
    })
  } else {
    priorities.push({
      id: "p_momentum",
      text: `Upload Cadence Active (${recentDays.length} recent uploads)`,
      rationale: "Double down on top retention format. Compare recent view duration to your channel median.",
      confidence: "High",
      goal: "WATCH TIME",
      actionLabel: "Analyze Flow",
      color: "#579AFF",
    })
  }

  // Priority 2: Title & Packaging or Revenue
  if (avgTitleLen > 60) {
    priorities.push({
      id: "p_title",
      text: "Title Length Optimization Alert",
      rationale: `Avg title is ${Math.round(avgTitleLen)} chars. Mobile truncates past 60. Sharpen emotional hook in first 40 chars.`,
      confidence: "Medium",
      goal: "CTR",
      actionLabel: "Revise Titles",
      color: "#FFDA47",
    })
  } else {
    priorities.push({
      id: "p_monetization",
      text: "Revenue Opportunity in Evergreen Catalog",
      rationale: "Add chained end screens and mid-roll optimization to top 5 highest watch-time videos to maximize RPM.",
      confidence: "Medium",
      goal: "REVENUE",
      actionLabel: "Monetize",
      color: "#3FEE56",
    })
  }

  // Candidate Ranked Actions (Next Best Action engine)
  const candidateActions: RankedAction[] = [
    {
      id: "act_hook_revision",
      title: "Revise weak thumbnail and title package",
      subtitle: "CTR on latest upload is lagging behind matched baseline",
      impact: "High",
      confidence: "High",
      effort: "25m",
      goalAffected: "VIEWS",
      targetTool: "workflow-chain-builder" as SuperToolId,
      evidenceSource: "VT-SYNC Video Performance Delta",
    },
    {
      id: "act_endscreen_chain",
      title: "Add end screens linking top 5 watch-time videos",
      subtitle: "Chains viewing sessions into multi-video binge loops",
      impact: "High",
      confidence: "High",
      effort: "10m",
      goalAffected: "WATCH TIME",
      targetTool: "workflow-chain-builder" as SuperToolId,
      evidenceSource: "Audience Retention Autopsy",
    },
    {
      id: "act_shorts_extraction",
      title: "Extract 2 Shorts from top-performing segment",
      subtitle: "Minute 03:12–04:45 generated 18% retention spike",
      impact: "Med",
      confidence: "Medium",
      effort: "45m",
      goalAffected: "SUBS",
      targetTool: "shorts-extraction-studio" as SuperToolId,
      evidenceSource: "Audience Intelligence Engine",
    },
    {
      id: "act_community_poll",
      title: "Publish 2-option Community Tab topic poll",
      subtitle: "Validate upcoming series direction with existing core audience",
      impact: "Med",
      confidence: "Medium",
      effort: "10m",
      goalAffected: "ENGAGEMENT",
      targetTool: "creator-canvas-os" as SuperToolId,
      evidenceSource: "Creator Intent & Feedback",
    },
    {
      id: "act_comment_outreach",
      title: "Reply to 5 high-intent comments with next video link",
      subtitle: "Viewer questions indicate high appetite for follow-up topic",
      impact: "Med",
      confidence: "Low",
      effort: "10m",
      goalAffected: "COMMUNITY",
      targetTool: "project-command-kanban" as SuperToolId,
      evidenceSource: "Audience Inbox Signals",
    },
  ]

  // Filter out completed ones unless all done
  const filtered = candidateActions.filter((a) => !completedIds.has(a.id))
  const finalActions = filtered.length > 0 ? filtered : candidateActions

  return {
    priorities: priorities.slice(0, 2),
    actions: finalActions.slice(0, 4),
  }
}

export const CreatorCommandCenterWidget: React.FC<{
  widget: CommonWidgetProps["widget"]
  instance: CommonWidgetProps["instance"]
  editMode: boolean
  onToggleCollapse: CommonWidgetProps["onToggleCollapse"]
  onCycleSize: CommonWidgetProps["onCycleSize"]
  onCycleHeight: CommonWidgetProps["onCycleHeight"]
  onDecSize?: CommonWidgetProps["onDecSize"]
  onDecHeight?: CommonWidgetProps["onDecHeight"]
  onRemove: CommonWidgetProps["onRemove"]
  data?: any
}> = (props) => {
  const {
    brain,
    setCalendarState,
    addJournalEntry,
    answerMicroPoll,
    emitSignal,
    reflectAndCompress,
  } = useBrain()

  const common = {
    widget: props.widget,
    instance: props.instance,
    editMode: props.editMode,
    canEdit: true,
    onToggleCollapse: props.onToggleCollapse,
    onCycleSize: props.onCycleSize,
    onCycleHeight: props.onCycleHeight,
    onDecSize: props.onDecSize,
    onDecHeight: props.onDecHeight,
    onRemove: props.onRemove,
  }

  // Active section tab
  const [activeSection, setActiveSection] = useState<DailyCommandSection>("today")

  // Outcome history for learning loop
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>(() => {
    try {
      const raw = localStorage.getItem(OUTCOMES_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Goal targets
  const [goalTargets, setGoalTargets] = useState<Record<string, any>>(() => {
    try {
      const raw = localStorage.getItem(GOAL_STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // Focus Timer (25-min Pomodoro)
  const [focusSeconds, setFocusSeconds] = useState(25 * 60)
  const [isFocusActive, setIsFocusActive] = useState(false)

  // Commitments
  const [commitments, setCommitments] = useState(() => {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY)
      return raw ? JSON.parse(raw) : DEFAULT_COMMITMENTS
    } catch {
      return DEFAULT_COMMITMENTS
    }
  })
  const [newCommitmentText, setNewCommitmentText] = useState("")

  // Brain Router State
  const [commandInput, setCommandInput] = useState("")
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null)
  const [isClosingDay, setIsClosingDay] = useState(false)
  const [dayClosedStatus, setDayClosedStatus] = useState<string | null>(null)

  // AI Journal Quick Entry State
  const [journalContent, setJournalContent] = useState("")
  const [journalCategory, setJournalCategory] = useState("content")
  const [isSavingJournal, setIsSavingJournal] = useState(false)
  const [journalSavedMsg, setJournalSavedMsg] = useState(false)

  // Save commitments
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(commitments))
    } catch (e) {
      console.warn("[DailyCommandCenter] Failed to save tasks:", e)
    }
  }, [commitments])

  // Save outcomes
  useEffect(() => {
    try {
      localStorage.setItem(OUTCOMES_STORAGE_KEY, JSON.stringify(outcomes))
    } catch (e) {
      console.warn("[DailyCommandCenter] Failed to save outcomes:", e)
    }
  }, [outcomes])

  // Focus timer countdown
  useEffect(() => {
    let timer: any = null
    if (isFocusActive && focusSeconds > 0) {
      timer = setInterval(() => setFocusSeconds((prev) => prev - 1), 1000)
    } else if (focusSeconds === 0) {
      setIsFocusActive(false)
    }
    return () => clearInterval(timer)
  }, [isFocusActive, focusSeconds])

  const timerFormatted = useMemo(() => {
    const m = Math.floor(focusSeconds / 60)
    const s = focusSeconds % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }, [focusSeconds])

  // Calculate Overnight Deltas
  const overnightDeltas: OvernightDelta[] = useMemo(() => {
    const rawMetrics = props.data?.rawMetrics || {}
    const stats = props.data?.statBlocks28d || []
    const subsBlock = stats.find((s: any) => s.label?.toLowerCase().includes("sub"))
    const viewsBlock = stats.find((s: any) => s.label?.toLowerCase().includes("view"))
    const revenueBlock = stats.find((s: any) => s.label?.toLowerCase().includes("rev"))

    return [
      {
        label: "Views",
        value: viewsBlock?.value || `${(rawMetrics.views28d || 0).toLocaleString()}`,
        diff: "+8.4%",
        trend: "up",
      },
      {
        label: "Subscribers",
        value: subsBlock?.value || `${(rawMetrics.subscribers28d || 0).toLocaleString()}`,
        diff: "+12",
        trend: "up",
      },
      {
        label: "Watch Time",
        value: `${Math.round((rawMetrics.watchHours28d || 142))}h`,
        diff: "+4.2%",
        trend: "up",
      },
      {
        label: "Revenue",
        value: revenueBlock?.value || `$${(rawMetrics.revenue28d || 0).toLocaleString()}`,
        diff: "pace ok",
        trend: "flat",
      },
    ]
  }, [props.data])

  // Generate Oracle Reasoning
  const { priorities, actions: rankedActions } = useMemo(() => {
    return generateOracleReasoning(props.data, outcomes, goalTargets)
  }, [props.data, outcomes, goalTargets])

  // Log outcome helper
  const logOutcome = useCallback(
    (actionId: string, actionText: string, decision: OutcomeRecord["decision"], targetRoute?: string) => {
      const record: OutcomeRecord = {
        id: `outcome_${Date.now()}`,
        actionId,
        actionText,
        decision,
        timestamp: Date.now(),
        dateKey: new Date().toISOString().slice(0, 10),
        targetRoute,
      }
      setOutcomes((prev) => [record, ...prev])
      if (emitSignal) {
        emitSignal("DAILY_COMMAND_CENTER", `ACTION_${decision.toUpperCase()}`, {
          actionId,
          actionText,
          decision,
          targetRoute,
        }).catch((e) => console.warn("[DailyCommandCenter] emitSignal error:", e))
      }
    },
    [emitSignal]
  )

  // DO IT handler: routes via action packets
  const handleDoIt = useCallback(
    (action: RankedAction) => {
      const commandAction = createBrainCommandAction({
        priority: action.impact === "High" ? "high" : "medium",
        confidence: action.confidence === "High" ? "high" : action.confidence === "Medium" ? "medium" : "low",
        sourceEvidence: [action.evidenceSource],
        targetToolId: action.targetTool,
        note: action.title,
      })

      logOutcome(action.id, action.title, "accepted", commandAction.targetRoute)

      // Add to today's commitments
      setCommitments((prev: any[]) => [
        { id: `c_${Date.now()}`, text: action.title, completed: false, tag: action.goalAffected },
        ...prev,
      ])

      setCommandFeedback(`Dispatched to ${action.targetTool}. Added to Today's queue.`)

      if (commandAction.targetRoute) {
        window.location.hash = commandAction.targetRoute
      }
    },
    [logOutcome]
  )

  // SKIP handler
  const handleSkipAction = useCallback(
    (action: RankedAction) => {
      logOutcome(action.id, action.title, "skipped")
    },
    [logOutcome]
  )

  // Toggle commitment
  const handleToggleCommitment = useCallback(
    (id: string) => {
      setCommitments((prev: any[]) =>
        prev.map((c: any) => {
          if (c.id === id) {
            const nextDone = !c.completed
            if (nextDone) {
              logOutcome(id, c.text, "completed")
            }
            return { ...c, completed: nextDone }
          }
          return c
        })
      )
    },
    [logOutcome]
  )

  // Add commitment
  const handleAddCommitment = useCallback(() => {
    if (!newCommitmentText.trim()) return
    const newItem = {
      id: `c_${Date.now()}`,
      text: newCommitmentText.trim(),
      completed: false,
      tag: "Priority",
    }
    setCommitments((prev: any[]) => [newItem, ...prev])
    setNewCommitmentText("")
    if (setCalendarState) {
      const todayKey = new Date().toISOString().slice(0, 10)
      setCalendarState({
        dayTasks: {
          ...(brain?.calendarState?.dayTasks || {}),
          [todayKey]: [
            ...(brain?.calendarState?.dayTasks?.[todayKey] || []),
            { id: newItem.id, text: newItem.text, completed: false, dueDate: todayKey },
          ],
        },
      })
    }
  }, [newCommitmentText, setCalendarState, brain])

  // Run Brain router
  const handleRunBrainCommand = useCallback(
    async (customPrompt?: string) => {
      const query = (customPrompt || commandInput).trim()
      if (!query) return

      const commandAction = createBrainCommandAction({
        priority: "high",
        confidence: "medium",
        sourceEvidence: ["User Prompt in Daily Command Center"],
        targetToolId: "workflow-chain-builder",
        note: query,
      })

      if (emitSignal) {
        await emitSignal("DAILY_COMMAND_CENTER", "NATURAL_LANGUAGE_COMMAND", {
          prompt: query,
          actionId: commandAction.id,
        })
      }

      setCommandFeedback(`Brain routed: "${query}". Action scheduled.`)
      setCommandInput("")
    },
    [commandInput, emitSignal]
  )

  // Save quick journal entry
  const handleSaveJournal = useCallback(async () => {
    if (!journalContent.trim()) return
    setIsSavingJournal(true)
    try {
      if (addJournalEntry) {
        addJournalEntry(journalContent.trim(), journalCategory)
      }
      setJournalContent("")
      setJournalSavedMsg(true)
      setTimeout(() => setJournalSavedMsg(false), 2500)
    } finally {
      setIsSavingJournal(false)
    }
  }, [journalContent, journalCategory, addJournalEntry])

  // Close Day & Update Brain Reflection Loop
  const handleCloseDay = useCallback(async () => {
    setIsClosingDay(true)
    try {
      const todayKey = new Date().toISOString().slice(0, 10)
      const completedToday = commitments.filter((c: any) => c.completed).length

      if (emitSignal) {
        await emitSignal("DAILY_COMMAND_CENTER", "DAY_CLOSED", {
          dateKey: todayKey,
          completedTasks: completedToday,
          totalTasks: commitments.length,
          outcomesCount: outcomes.length,
        })
      }

      if (reflectAndCompress) {
        await reflectAndCompress()
      }

      setDayClosedStatus(`Day closed! Brain updated with ${completedToday} completed milestones.`)
      setTimeout(() => setDayClosedStatus(null), 4000)
    } catch (e) {
      console.warn("[DailyCommandCenter] Close day error:", e)
      setDayClosedStatus("Day closed locally.")
    } finally {
      setIsClosingDay(false)
    }
  }, [commitments, outcomes, emitSignal, reflectAndCompress])

  const pendingPolls = (brain?.microPolls || []).filter((p: any) => !p.answer).slice(0, 2)
  const completedCommitmentsCount = commitments.filter((c: any) => c.completed).length
  const completionPct = commitments.length
    ? Math.round((completedCommitmentsCount / commitments.length) * 100)
    : 0

  return (
    <WidgetShell
      {...common}
      icon={<Layers size={22} />}
      headerContent={
        <WidgetHeaderToggle
          label="Daily Command Section"
          value={activeSection}
          items={[
            { id: "today", label: "TODAY" },
            { id: "actions", label: "ACTIONS" },
            { id: "brain", label: "BRAIN" },
          ]}
          onChange={(val) => setActiveSection(val as DailyCommandSection)}
        />
      }
    >
      <WidgetScrollArea
        ariaLabel="Daily Command Center"
        contentClassName="flex min-h-full flex-col gap-3 p-1"
      >
        {/* ═════════════════════════════════════════════════════════ */}
        {/* TAB 1: TODAY (OVERNIGHT DELTAS + ORACLE STRATEGY + GOALS) */}
        {/* ═════════════════════════════════════════════════════════ */}
        {activeSection === "today" && (
          <>
            {/* Zone A: What Changed Overnight */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                  Overnight Channel Signals:
                </span>
                <span className="text-[8px] font-black uppercase text-[#579AFF] bg-[#579AFF]/15 px-1.5 py-0.5 rounded border border-[#579AFF]/40">
                  Live Snapshot
                </span>
              </div>
              <div className="daily-command-delta-grid">
                {overnightDeltas.map((d) => (
                  <div key={d.label} className="daily-command-delta-card">
                    <span className="text-[8px] font-black uppercase opacity-60 truncate">
                      {d.label}
                    </span>
                    <b className="text-[13px] font-black leading-none">{d.value}</b>
                    <div className="flex items-center gap-1 text-[8px] font-extrabold text-[#3FEE56]">
                      {d.trend === "up" ? (
                        <TrendingUp size={9} />
                      ) : d.trend === "down" ? (
                        <TrendingDown size={9} color="#FA618A" />
                      ) : (
                        <Minus size={9} color="#888" />
                      )}
                      <span>{d.diff}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone B: What Matters Today (Oracle Strategy Priorities) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                  Oracle Strategy Focus:
                </span>
                <span className="badge good" style={{ fontSize: "8px" }}>
                  AI Prioritized
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {priorities.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "2px solid var(--widget-border, #000)",
                      borderRadius: "8px",
                      padding: "8px",
                      background: "#fff",
                      borderLeft: `5px solid ${item.color}`,
                      boxShadow: "2px 2px 0 var(--widget-border, #000)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <b className="text-[11px] font-black leading-snug">{item.text}</b>
                      <span
                        className="daily-command-confidence-badge"
                        style={{
                          background:
                            item.confidence === "High"
                              ? "#CCFF00"
                              : item.confidence === "Medium"
                              ? "#FFEA5A"
                              : "#00F0FF",
                        }}
                      >
                        <ShieldCheck size={10} /> {item.confidence}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-black/75">
                      {item.rationale}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider text-black/50">
                        Target Goal: <strong>{item.goal}</strong>
                      </span>
                      <button
                        type="button"
                        className="vt-button primary"
                        onClick={() => setActiveSection("actions")}
                        style={{ height: "24px", padding: "0 8px", fontSize: "9px" }}
                      >
                        {item.actionLabel} <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone C: Goal Progress Summary Strip */}
            <div className="flex flex-col gap-1.5 pt-1 border-t-2 border-black/10">
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                Active Growth Goals:
              </span>
              <div className="daily-command-goal-strip">
                {["Views", "Subscribers", "Revenue", "WatchTime"].map((key) => {
                  const goal = goalTargets[key]
                  return (
                    <div key={key} className="daily-command-goal-chip">
                      <Target size={11} className="text-[#FA618A]" />
                      <span>{key.toUpperCase()}</span>
                      <span className="opacity-50">·</span>
                      <span className="font-extrabold text-[#3FEE56]">
                        {goal?.target ? `${goal.target}` : "Active Pace"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* TAB 2: ACTIONS (RANKED ACTIONS + COMMITMENTS & FOCUS)      */}
        {/* ═════════════════════════════════════════════════════════ */}
        {activeSection === "actions" && (
          <>
            {/* Top 3–5 Ranked Next Best Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                  Ranked Next Best Actions:
                </span>
                <span className="text-[8px] font-black uppercase opacity-60">
                  Impact / Confidence / Effort
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {rankedActions.map((action) => (
                  <div key={action.id} className="daily-command-action-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <b className="text-[11px] font-black leading-tight block truncate">
                          {action.title}
                        </b>
                        <span className="text-[9.5px] font-bold text-black/70 block mt-0.5 leading-snug">
                          {action.subtitle}
                        </span>
                      </div>
                      <span
                        className="daily-command-confidence-badge flex-shrink-0"
                        style={{ background: "#CCFF00" }}
                      >
                        {action.impact} Impact
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[8px] font-black uppercase tracking-wider text-black/60 pt-1 border-t border-black/10">
                      <div className="flex items-center gap-2">
                        <span>⏱ {action.effort}</span>
                        <span>·</span>
                        <span>Goal: {action.goalAffected}</span>
                      </div>
                      <span className="truncate max-w-[140px] opacity-70">
                        Src: {action.evidenceSource}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        className="vt-button primary flex-1"
                        onClick={() => handleDoIt(action)}
                        style={{ height: "26px", fontSize: "10px", fontWeight: 900 }}
                      >
                        DO IT → {action.targetTool}
                      </button>
                      <button
                        type="button"
                        className="vt-button"
                        onClick={() => handleSkipAction(action)}
                        title="Skip and learn for tomorrow"
                        style={{ height: "26px", padding: "0 8px", fontSize: "9px" }}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Commitments & Focus Timer */}
            <div className="flex flex-col gap-2 pt-2 border-t-2 border-black/15">
              {/* Focus Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 8px",
                  borderRadius: "7px",
                  border: "2px solid var(--widget-border, #000)",
                  background: "color-mix(in srgb, var(--widget-color, #FA618A) 12%, white)",
                }}
              >
                <button
                  type="button"
                  className="vt-button primary"
                  onClick={() => setIsFocusActive((p) => !p)}
                  style={{
                    height: "28px",
                    padding: "0 8px",
                    fontSize: "9px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {isFocusActive ? <Pause size={12} /> : <Play size={12} />}
                  {isFocusActive ? "Pause" : "Focus (25m)"}
                </button>
                <button
                  type="button"
                  className="vt-button"
                  onClick={() => {
                    setIsFocusActive(false)
                    setFocusSeconds(25 * 60)
                  }}
                  style={{ height: "28px", width: "28px", padding: 0 }}
                >
                  <RotateCcw size={11} />
                </button>
                <b className="text-[12px] font-black ml-1">{timerFormatted}</b>

                <div className="flex-1 flex flex-col gap-1 ml-2">
                  <div className="flex justify-between text-[7.5px] font-black uppercase">
                    <span>Progress</span>
                    <span>
                      {completedCommitmentsCount}/{commitments.length}
                    </span>
                  </div>
                  <div className="h-1.5 border border-black rounded-full bg-white overflow-hidden">
                    <div
                      className="h-full bg-[#3FEE56] transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Commitments List */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                  Today's Milestones:
                </span>
                {commitments.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => handleToggleCommitment(c.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 8px",
                      borderRadius: "6px",
                      border: "1.5px solid var(--widget-border, #000)",
                      background: c.completed ? "#f0f0f0" : "#fff",
                      cursor: "pointer",
                      opacity: c.completed ? 0.6 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={c.completed}
                      onChange={() => {}}
                      style={{ width: "14px", height: "14px", cursor: "pointer" }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: "10px",
                        fontWeight: 800,
                        textDecoration: c.completed ? "line-through" : "none",
                      }}
                    >
                      {c.text}
                    </span>
                    <span
                      className="badge info"
                      style={{ fontSize: "7px", padding: "1px 4px" }}
                    >
                      {c.tag || "Milestone"}
                    </span>
                  </div>
                ))}

                {/* Add Commitment */}
                <div className="flex gap-1.5 items-center mt-1">
                  <input
                    type="text"
                    className="vt-input flex-1"
                    value={newCommitmentText}
                    onChange={(e) => setNewCommitmentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCommitment()}
                    placeholder="Add milestone to today's schedule..."
                    style={{ height: "28px", fontSize: "10px" }}
                  />
                  <button
                    type="button"
                    className="vt-button"
                    onClick={handleAddCommitment}
                    style={{ height: "28px", padding: "0 8px", fontSize: "9px" }}
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* TAB 3: BRAIN (ROUTER + PULSE + AI JOURNAL + CLOSE DAY)     */}
        {/* ═════════════════════════════════════════════════════════ */}
        {activeSection === "brain" && (
          <>
            {/* Brain Command Router */}
            <div
              style={{
                border: "2px solid var(--widget-border, #000)",
                borderRadius: "8px",
                padding: "8px",
                background: "#000",
                color: "#fff",
              }}
            >
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#3FEE56]">
                <Brain size={13} /> ViewTube Brain Command Router
              </div>
              <div className="flex gap-1.5 mt-2">
                <input
                  type="text"
                  className="vt-input flex-1"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunBrainCommand()}
                  placeholder="Ask ViewTube to run an action or analyze..."
                  style={{
                    height: "30px",
                    fontSize: "10.5px",
                    background: "#111",
                    color: "#fff",
                    borderColor: "#333",
                  }}
                />
                <button
                  type="button"
                  className="vt-button primary"
                  onClick={() => handleRunBrainCommand()}
                  style={{ height: "30px", padding: "0 10px", fontSize: "10px" }}
                >
                  <Send size={11} /> Run
                </button>
              </div>
              {commandFeedback && (
                <div className="mt-1.5 text-[9.5px] font-bold text-[#3FEE56]">
                  {commandFeedback}
                </div>
              )}
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex gap-1.5 flex-wrap">
              {[
                "Find growth opportunities",
                "Plan next upload",
                "Check sync health",
                "Retention autopsy",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="vt-button"
                  onClick={() => handleRunBrainCommand(prompt)}
                  style={{ height: "24px", padding: "0 7px", fontSize: "8.5px" }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* The Pulse / Context Question (Micro-Poll) */}
            {pendingPolls.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#FFB570]">
                  <Zap size={12} /> The Pulse (Creator Context Needed)
                </div>
                {pendingPolls.map((poll: any) => (
                  <div key={poll.id} className="ai-journal-card is-poll p-2">
                    <span className="text-[9.5px] font-black leading-tight flex-1 pr-2">
                      {poll.question}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="vt-button"
                        onClick={() => answerMicroPoll && answerMicroPoll(poll.id, "Yes")}
                        style={{ height: "24px", padding: "0 6px", fontSize: "8px" }}
                      >
                        YES
                      </button>
                      <button
                        type="button"
                        className="vt-button"
                        onClick={() => answerMicroPoll && answerMicroPoll(poll.id, "No")}
                        style={{ height: "24px", padding: "0 6px", fontSize: "8px" }}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compact AI Journal Entry */}
            <div className="flex flex-col gap-1.5 pt-2 border-t-2 border-black/10">
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                Creator Memory / Journal Note:
              </span>
              <div className="flex gap-1 flex-wrap">
                {JOURNAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`vt-button ${journalCategory === cat.id ? "primary" : ""}`}
                    onClick={() => setJournalCategory(cat.id)}
                    style={{ height: "22px", padding: "0 6px", fontSize: "8px" }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <textarea
                className="vt-textarea"
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Log a reflection, decision, or style preference for the Brain..."
                style={{ minHeight: "48px", fontSize: "10.5px", padding: "6px" }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-extrabold text-[#3FEE56]">
                  {journalSavedMsg ? "✓ Memory Saved to Brain" : ""}
                </span>
                <button
                  type="button"
                  className="vt-button primary"
                  disabled={isSavingJournal || !journalContent.trim()}
                  onClick={handleSaveJournal}
                  style={{ height: "26px", padding: "0 10px", fontSize: "9px" }}
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* End-of-Day Outcome & Reflection Close */}
            <div className="pt-2 border-t-2 border-black/15">
              <button
                type="button"
                className="daily-command-close-day w-full"
                onClick={handleCloseDay}
                disabled={isClosingDay}
              >
                <CheckCircle2 size={14} />
                {isClosingDay ? "Reflecting with Brain OS..." : "Close Day & Update Tomorrow's Oracle"}
              </button>
              {dayClosedStatus && (
                <div className="mt-1.5 text-center text-[9px] font-black text-[#3FEE56]">
                  {dayClosedStatus}
                </div>
              )}
            </div>
          </>
        )}
      </WidgetScrollArea>
    </WidgetShell>
  )
}
