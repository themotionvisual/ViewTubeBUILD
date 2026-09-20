import React, { useEffect, useMemo, useState } from "react"
import {
  Brain,
  CalendarPlus,
  Check,
  Clock3,
  DollarSign,
  Eye,
  Heart,
  RefreshCw,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import { buildAIBrainContextSnapshot } from "../../../services/aiBrainCommandInterface"
import { buildCreatorGrowthContext } from "../../../services/aiBrainConversationStore"
import {
  buildDailyOraclePlan,
  oracleEffortLabel,
  oracleLevelLabel,
  type DailyOracleCandidate,
  type DailyOracleGoalMetric,
} from "../../../services/brain/DailyOracleDecisionEngine"
import type { DayTask } from "../../../types"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetFooter,
  WidgetHeaderToggle,
  WidgetIconButton,
  WidgetScrollArea,
  WidgetSection,
  WidgetSizedButton,
  WidgetWorkflowMain,
} from "../WidgetPrimitives"
import "./DailyOracleWidget.css"

const ORACLE_UI_KEY = "vt_daily_oracle_v2"

type OraclePage = "today" | "focus"

const ORACLE_PAGES = [
  { id: "today", label: "TODAY" },
  { id: "focus", label: "FOCUS" },
] as const

const METRICS: Array<{
  id: DailyOracleGoalMetric
  label: string
  Icon: typeof Eye
}> = [
  { id: "views", label: "Views", Icon: Eye },
  { id: "subscribers", label: "Subscribers", Icon: Users },
  { id: "revenue", label: "Revenue", Icon: DollarSign },
  { id: "engagement", label: "Engagement", Icon: Heart },
  { id: "watch-time", label: "Watch Time", Icon: Clock3 },
]

type OracleUiState = {
  dateKey: string
  focusMetric: DailyOracleGoalMetric
  completedIds: string[]
  rotation: number
  refreshedAt: number
}

const localDateKey = (date = new Date()) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

const readUiState = (): OracleUiState => {
  const fallback: OracleUiState = {
    dateKey: localDateKey(),
    focusMetric: "views",
    completedIds: [],
    rotation: 0,
    refreshedAt: Date.now(),
  }
  if (typeof window === "undefined") return fallback

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ORACLE_UI_KEY) || "{}") as Partial<OracleUiState>
    if (parsed.dateKey !== fallback.dateKey) return fallback
    return {
      ...fallback,
      ...parsed,
      focusMetric: METRICS.some((metric) => metric.id === parsed.focusMetric) ? parsed.focusMetric! : fallback.focusMetric,
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds.filter(Boolean) : [],
      rotation: Number.isFinite(parsed.rotation) ? Math.max(0, Number(parsed.rotation)) : 0,
      refreshedAt: Number.isFinite(parsed.refreshedAt) ? Number(parsed.refreshedAt) : fallback.refreshedAt,
    }
  } catch {
    return fallback
  }
}

const uploadDate = (row: any): Date | null => {
  const raw = row?.uploadDate || row?.publishedAt || row?.publishedDate || row?.published_at
  if (!raw) return null
  const value = new Date(raw)
  return Number.isNaN(value.getTime()) ? null : value
}

const scorePercent = (value: number) => Math.max(0, Math.min(100, Math.round((value / 3) * 100)))

export const DailyOracleWidget = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
  data,
  onNavigate,
}: any) => {
  const { brain, authState, channelConnection, getBrainMemory, setCalendarState } = useBrain()
  const [page, setPage] = useState<OraclePage>("today")
  const [ui, setUi] = useState<OracleUiState>(readUiState)
  const [notice, setNotice] = useState("")

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

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(ORACLE_UI_KEY, JSON.stringify(ui))
  }, [ui])

  const snapshot = useMemo(
    () => buildAIBrainContextSnapshot({
      brain,
      authState,
      channelConnection,
      brainMemory: getBrainMemory(),
      requestText: `Daily Oracle · ${ui.focusMetric}`,
    }),
    [authState, brain, channelConnection, getBrainMemory, ui.focusMetric, ui.refreshedAt],
  )

  const growth = useMemo(
    () => buildCreatorGrowthContext(snapshot, [], []),
    [snapshot],
  )

  const evidence = useMemo(() => {
    const rows = Array.isArray(data?.canonicalRows) ? data.canonicalRows : []
    const dates = rows.map(uploadDate).filter((value): value is Date => Boolean(value))
    dates.sort((a, b) => b.getTime() - a.getTime())
    const latest = dates[0] || null
    const now = Date.now()
    const recentUploadCount14d = dates.filter((date) => now - date.getTime() <= 14 * 86400000).length
    const daysSinceLatestUpload = latest ? Math.max(0, Math.floor((now - latest.getTime()) / 86400000)) : null
    const sourceStatuses = Array.isArray(snapshot.sourceStatuses) ? snapshot.sourceStatuses : []
    const readySources = sourceStatuses.filter((source) => source.status === "ready").length

    return {
      recentUploadCount14d,
      daysSinceLatestUpload,
      readySources,
      totalSources: sourceStatuses.length,
      channelConnected: Boolean(snapshot.channel.connected),
    }
  }, [data?.canonicalRows, snapshot])

  const plan = useMemo(
    () => buildDailyOraclePlan({
      growth,
      focusMetric: ui.focusMetric,
      evidence,
      rotation: ui.rotation,
    }),
    [evidence, growth, ui.focusMetric, ui.rotation],
  )

  const todayKey = localDateKey()
  const todaysTasks: DayTask[] = Array.isArray(brain.calendarState?.dayTasks?.[todayKey])
    ? brain.calendarState.dayTasks[todayKey]
    : []

  const isTaskAdded = (candidate: DailyOracleCandidate) =>
    todaysTasks.some((task) => task.text.trim().toLowerCase() === candidate.taskText.trim().toLowerCase())

  const addToToday = (candidate: DailyOracleCandidate) => {
    if (isTaskAdded(candidate)) {
      setNotice("ALREADY IN TODAY.")
      return
    }

    const task: DayTask = {
      id: `daily_oracle_${candidate.id}_${Date.now()}`,
      text: candidate.taskText,
      completed: false,
      dueDate: todayKey,
    }

    setCalendarState({
      dayTasks: {
        ...(brain.calendarState?.dayTasks || {}),
        [todayKey]: [...todaysTasks, task],
      },
    })
    setNotice("ADDED TO TODAY.")
  }

  const toggleComplete = (candidateId: string) => {
    setUi((current) => ({
      ...current,
      completedIds: current.completedIds.includes(candidateId)
        ? current.completedIds.filter((id) => id !== candidateId)
        : [...current.completedIds, candidateId],
    }))
  }

  const refresh = () => {
    setUi((current) => ({
      ...current,
      rotation: current.rotation + 1,
      refreshedAt: Date.now(),
    }))
    setNotice("RANKING REFRESHED.")
  }

  const setFocusMetric = (metric: DailyOracleGoalMetric) => {
    setUi((current) => ({ ...current, focusMetric: metric }))
    setNotice("")
  }

  const renderCompactAction = (candidate: DailyOracleCandidate) => {
    const done = ui.completedIds.includes(candidate.id)
    return (
      <article key={candidate.id} className={`daily-oracle-v2__quick-card ${done ? "is-done" : ""}`}>
        <div className="daily-oracle-v2__quick-copy">
          <strong>{candidate.title}</strong>
          <small>{candidate.evidence}</small>
        </div>
        <WidgetIconButton
          height={24}
          tone={isTaskAdded(candidate) ? "primary" : "default"}
          label={isTaskAdded(candidate) ? `${candidate.title} is already in Today` : `Add ${candidate.title} to Today`}
          icon={isTaskAdded(candidate) ? <Check /> : <CalendarPlus />}
          onClick={() => addToToday(candidate)}
        />
      </article>
    )
  }

  const headerContent = (
    <WidgetHeaderToggle
      label="Daily Oracle page"
      value={page}
      items={ORACLE_PAGES}
      onChange={setPage}
    />
  )

  return (
    <WidgetShell
      {...common}
      icon={<Sparkles size={22} aria-hidden="true" />}
      headerContent={headerContent}
    >
      <WidgetWorkflowMain className="daily-oracle-v2">
        <WidgetScrollArea
          ariaLabel={page === "today" ? "Daily Oracle ranked actions" : "Daily Oracle focus controls"}
          edge="inset"
          className="daily-oracle-v2__scroll"
          contentClassName="daily-oracle-v2__content"
        >
          {page === "today" ? (
            <>
              <WidgetSection className="daily-oracle-v2__source-strip">
                <WidgetBadge height={18} icon={<Brain size={11} />}>
                  {Math.round(growth.profileConfidenceScore)}% CHANNEL READ
                </WidgetBadge>
                <span>{plan.sourceLabel}</span>
                <span>{plan.evidenceCoverage}% EVIDENCE READY</span>
              </WidgetSection>

              <WidgetSection className="daily-oracle-v2__compass-section">
                <div className="daily-oracle-v2__compass">
                  <article className={`daily-oracle-v2__primary ${ui.completedIds.includes(plan.primary.id) ? "is-done" : ""}`}>
                    <div className="daily-oracle-v2__primary-kicker">
                      <Target size={16} aria-hidden="true" />
                      <span>BEST NEXT MOVE</span>
                    </div>
                    <strong>{plan.primary.title}</strong>
                    <p>{plan.primary.detail}</p>
                    <small>{plan.primary.evidence}</small>
                    <div className="daily-oracle-v2__primary-actions">
                      <WidgetSizedButton
                        height={24}
                        textFit="adaptive"
                        tone="primary"
                        onClick={() => addToToday(plan.primary)}
                      >
                        <CalendarPlus aria-hidden="true" />
                        {isTaskAdded(plan.primary) ? "IN TODAY" : "ADD TO TODAY"}
                      </WidgetSizedButton>
                      <WidgetIconButton
                        height={24}
                        tone={ui.completedIds.includes(plan.primary.id) ? "primary" : "default"}
                        label={ui.completedIds.includes(plan.primary.id) ? "Mark primary move active" : "Mark primary move complete"}
                        icon={<Check />}
                        onClick={() => toggleComplete(plan.primary.id)}
                      />
                    </div>
                  </article>

                  <div className="daily-oracle-v2__score-stack" aria-label="Daily Oracle decision score">
                    <div className="daily-oracle-v2__score">
                      <span>IMPACT</span>
                      <strong>{oracleLevelLabel(plan.primary.impact)}</strong>
                      <i style={{ "--oracle-score": `${scorePercent(plan.primary.impact)}%` } as React.CSSProperties} />
                    </div>
                    <div className="daily-oracle-v2__score">
                      <span>EFFORT</span>
                      <strong>{oracleEffortLabel(plan.primary.effort)}</strong>
                      <i style={{ "--oracle-score": `${scorePercent(4 - plan.primary.effort)}%` } as React.CSSProperties} />
                    </div>
                    <div className="daily-oracle-v2__score">
                      <span>EVIDENCE</span>
                      <strong>{plan.evidenceCoverage}%</strong>
                      <i style={{ "--oracle-score": `${plan.evidenceCoverage}%` } as React.CSSProperties} />
                    </div>
                  </div>
                </div>
              </WidgetSection>

              <WidgetSection className="daily-oracle-v2__quick-section">
                <div className="daily-oracle-v2__section-heading">
                  <Zap size={15} aria-hidden="true" />
                  <strong>QUICK WIN RAIL</strong>
                  <span>LOWER EFFORT · TODAY</span>
                </div>
                <div className="daily-oracle-v2__quick-grid">
                  {plan.quickWins.map(renderCompactAction)}
                </div>
              </WidgetSection>

              <WidgetSection className="daily-oracle-v2__goal-strip">
                <span>CURRENT GOAL</span>
                <strong>{growth.currentGoal}</strong>
              </WidgetSection>
            </>
          ) : (
            <>
              <WidgetSection className="daily-oracle-v2__focus-intro">
                <div>
                  <WidgetBadge height={18}>GOAL LENS</WidgetBadge>
                  <strong>WHAT SHOULD TODAY OPTIMIZE?</strong>
                </div>
                <p>Change the lens; the Oracle reranks actions without losing the same decision model.</p>
              </WidgetSection>

              <WidgetSection className="daily-oracle-v2__metric-grid-section">
                <div className="daily-oracle-v2__metric-grid" role="group" aria-label="Daily Oracle focus metric">
                  {METRICS.map(({ id, label, Icon }) => (
                    <WidgetSizedButton
                      key={id}
                      height={24}
                      textFit="adaptive"
                      tone={ui.focusMetric === id ? "primary" : "default"}
                      aria-pressed={ui.focusMetric === id}
                      onClick={() => setFocusMetric(id)}
                    >
                      <Icon aria-hidden="true" />
                      {label}
                    </WidgetSizedButton>
                  ))}
                </div>
              </WidgetSection>

              <WidgetSection className="daily-oracle-v2__focus-plan">
                <div className="daily-oracle-v2__section-heading">
                  <Target size={15} aria-hidden="true" />
                  <strong>{ui.focusMetric.replace("-", " ").toUpperCase()} PLAN</strong>
                  <span>3 ACTIONS</span>
                </div>
                <div className="daily-oracle-v2__focus-list">
                  {plan.focusTasks.map((candidate, index) => (
                    <article key={candidate.id} className="daily-oracle-v2__focus-row">
                      <span className="daily-oracle-v2__focus-index">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{candidate.title}</strong>
                        <p>{candidate.detail}</p>
                      </div>
                      <WidgetIconButton
                        height={24}
                        tone={isTaskAdded(candidate) ? "primary" : "default"}
                        label={isTaskAdded(candidate) ? `${candidate.title} is already in Today` : `Add ${candidate.title} to Today`}
                        icon={isTaskAdded(candidate) ? <Check /> : <CalendarPlus />}
                        onClick={() => addToToday(candidate)}
                      />
                    </article>
                  ))}
                </div>
              </WidgetSection>

              <WidgetSection className="daily-oracle-v2__context-grid">
                <div>
                  <span>CHANNEL READ</span>
                  <strong>{Math.round(growth.profileConfidenceScore)}%</strong>
                </div>
                <div>
                  <span>EVIDENCE READY</span>
                  <strong>{plan.evidenceCoverage}%</strong>
                </div>
                <div>
                  <span>UPLOAD CADENCE</span>
                  <strong>{evidence.daysSinceLatestUpload === null ? "UNKNOWN" : `${evidence.daysSinceLatestUpload}D AGO`}</strong>
                </div>
              </WidgetSection>
            </>
          )}
        </WidgetScrollArea>
      </WidgetWorkflowMain>

      <WidgetFooter className="daily-oracle-v2__footer">
        <WidgetSizedButton height={24} textFit="adaptive" tone="default" onClick={refresh}>
          <RefreshCw aria-hidden="true" />
          REFRESH RANKING
        </WidgetSizedButton>
        <WidgetSizedButton
          height={24}
          textFit="adaptive"
          tone="primary"
          onClick={() => onNavigate?.("/ai-brain")}
        >
          <Brain aria-hidden="true" />
          OPEN BRAIN
        </WidgetSizedButton>
        <span className="daily-oracle-v2__notice" role="status" aria-live="polite">{notice}</span>
      </WidgetFooter>
    </WidgetShell>
  )
}
