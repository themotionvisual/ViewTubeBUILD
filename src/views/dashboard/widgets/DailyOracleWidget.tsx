import React, { useEffect, useMemo, useState } from "react"
import {
  Brain,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock3,
  DollarSign,
  Eye,
  Flame,
  Heart,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
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
  calculateDailyOracleStreak,
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
const ORACLE_STREAK_KEY = "vt_daily_oracle_streak_v1"
const FOCUS_SESSION_SECONDS = 25 * 60

type OraclePage = "today" | "focus"
type OracleTodayPanel = "move" | "calendar"

const ORACLE_PAGES = [
  { id: "today", label: "TODAY" },
  { id: "focus", label: "FOCUS" },
] as const

const METRICS: Array<{
  id: DailyOracleGoalMetric
  label: string
  Icon: typeof Eye
  compactLabel: string
}> = [
  { id: "views", label: "Views", compactLabel: "Views", Icon: Eye },
  { id: "subscribers", label: "Subscribers", compactLabel: "Subs", Icon: Users },
  { id: "revenue", label: "Revenue", compactLabel: "Revenue", Icon: DollarSign },
  { id: "engagement", label: "Engagement", compactLabel: "Engage", Icon: Heart },
  { id: "watch-time", label: "Watch Time", compactLabel: "Watch", Icon: Clock3 },
]

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const

type OracleUiState = {
  dateKey: string
  focusMetric: DailyOracleGoalMetric
  completedIds: string[]
  rotation: number
  refreshedAt: number
}

type OracleStreakState = {
  completionDates: string[]
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

const readStreakState = (): OracleStreakState => {
  if (typeof window === "undefined") return { completionDates: [] }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ORACLE_STREAK_KEY) || "{}") as Partial<OracleStreakState>
    return {
      completionDates: Array.isArray(parsed.completionDates)
        ? Array.from(new Set(parsed.completionDates.filter((value): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))))
        : [],
    }
  } catch {
    return { completionDates: [] }
  }
}

const uploadDate = (row: any): Date | null => {
  const raw = row?.uploadDate || row?.publishedAt || row?.publishedDate || row?.published_at
  if (!raw) return null
  const value = new Date(raw)
  return Number.isNaN(value.getTime()) ? null : value
}

const scorePercent = (value: number) => Math.max(0, Math.min(100, Math.round((value / 3) * 100)))

const formatFocusTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60).toString().padStart(2, "0")
  const remainder = (safe % 60).toString().padStart(2, "0")
  return `${minutes}:${remainder}`
}

const CreatorFocusConsole: React.FC<{
  focusMetric: DailyOracleGoalMetric
  onMetricChange: (metric: DailyOracleGoalMetric) => void
  remaining: number
  running: boolean
  onToggleTimer: () => void
  onResetTimer: () => void
  nextTask: DayTask | null
  openTaskCount: number
}> = ({
  focusMetric,
  onMetricChange,
  remaining,
  running,
  onToggleTimer,
  onResetTimer,
  nextTask,
  openTaskCount,
}) => {
  const progress = Math.max(0, Math.min(1, remaining / FOCUS_SESSION_SECONDS))

  return (
    <WidgetSection className="daily-oracle-v2__focus-console">
      <div className="daily-oracle-v2__focus-console-lens">
        <span>GOAL LENS</span>
        <div role="group" aria-label="Creator Command focus metric">
          {METRICS.map(({ id, compactLabel, Icon }) => (
            <WidgetSizedButton
              key={id}
              height={24}
              textFit="adaptive"
              tone={focusMetric === id ? "primary" : "default"}
              aria-pressed={focusMetric === id}
              onClick={() => onMetricChange(id)}
            >
              <Icon aria-hidden="true" />
              {compactLabel}
            </WidgetSizedButton>
          ))}
        </div>
      </div>

      <div
        className="daily-oracle-v2__focus-dial"
        style={{ "--focus-progress": `${progress * 360}deg` } as React.CSSProperties}
        aria-label={`Focus timer ${formatFocusTime(remaining)}`}
      >
        <div>
          <small>FOCUS SESSION</small>
          <strong>{formatFocusTime(remaining)}</strong>
          <span>{running ? "RUNNING" : remaining === 0 ? "COMPLETE" : "READY"}</span>
        </div>
        <div className="daily-oracle-v2__focus-dial-controls">
          <WidgetIconButton
            height={32}
            tone={running ? "primary" : "default"}
            label={running ? "Pause focus session" : "Start focus session"}
            icon={running ? <Pause /> : <Play />}
            disabled={remaining === 0}
            onClick={onToggleTimer}
          />
          <WidgetIconButton
            height={32}
            tone="default"
            label="Reset focus session"
            icon={<RotateCcw />}
            onClick={onResetTimer}
          />
        </div>
      </div>

      <div className="daily-oracle-v2__focus-console-task">
        <span>NEXT EXECUTION</span>
        <strong>{nextTask?.text || "NO OPEN TASKS TODAY"}</strong>
        <small>{openTaskCount} OPEN · CALENDAR ORDER</small>
        <div className="daily-oracle-v2__focus-task-state">
          <i aria-hidden="true" />
          <b>{nextTask ? "READY TO FOCUS" : "QUEUE CLEAR"}</b>
        </div>
      </div>
    </WidgetSection>
  )
}

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
  const [streak, setStreak] = useState<OracleStreakState>(readStreakState)
  const [notice, setNotice] = useState("")
  const [todayPanel, setTodayPanel] = useState<OracleTodayPanel>("move")
  const [focusRemaining, setFocusRemaining] = useState(FOCUS_SESSION_SECONDS)
  const [focusRunning, setFocusRunning] = useState(false)

  const common = {
    widget,
    instance,
    editMode,
    canEdit: true,
    onToggleCollapse: () => {
      setFocusRunning(false)
      onToggleCollapse()
    },
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

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(ORACLE_STREAK_KEY, JSON.stringify(streak))
  }, [streak])

  useEffect(() => {
    if (!focusRunning) return
    const interval = window.setInterval(() => {
      setFocusRemaining((seconds) => {
        if (seconds <= 1) {
          setFocusRunning(false)
          return 0
        }
        return seconds - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [focusRunning])

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
    const rows: any[] = Array.isArray(data?.canonicalRows) ? data.canonicalRows : []
    const dates: Date[] = rows
      .map((row: any) => uploadDate(row))
      .filter((value: Date | null): value is Date => Boolean(value))
    dates.sort((a: Date, b: Date) => b.getTime() - a.getTime())
    const latest = dates[0] || null
    const now = Date.now()
    const recentUploadCount14d = dates.filter((date: Date) => now - date.getTime() <= 14 * 86400000).length
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
  const streakSummary = useMemo(
    () => calculateDailyOracleStreak(streak.completionDates, todayKey),
    [streak.completionDates, todayKey],
  )

  const calendar = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: Array<{ day: number; key: string; completed: boolean; today: boolean } | null> = []

    for (let index = 0; index < firstDay; index += 1) cells.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = localDateKey(new Date(year, month, day))
      cells.push({
        day,
        key,
        completed: streak.completionDates.includes(key),
        today: key === todayKey,
      })
    }

    return {
      label: now.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      cells,
    }
  }, [streak.completionDates, todayKey])

  const todaysTasks: DayTask[] = Array.isArray(brain.calendarState?.dayTasks?.[todayKey])
    ? brain.calendarState.dayTasks[todayKey]
    : []

  const openTasks = todaysTasks.filter((task) => !task.completed)
  const nextTask = openTasks[0] || null

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

  const togglePrimaryComplete = () => {
    const completing = !streakSummary.completedToday
    const nextDates = completing
      ? Array.from(new Set([...streak.completionDates, todayKey]))
      : streak.completionDates.filter((date) => date !== todayKey)
    const nextSummary = calculateDailyOracleStreak(nextDates, todayKey)
    const normalizedTaskText = plan.primary.taskText.trim().toLowerCase()
    const existingTaskIndex = todaysTasks.findIndex((task) => task.text.trim().toLowerCase() === normalizedTaskText)
    const nextTasks = [...todaysTasks]

    if (existingTaskIndex >= 0) {
      nextTasks[existingTaskIndex] = { ...nextTasks[existingTaskIndex], completed: completing }
    } else if (completing) {
      nextTasks.push({
        id: `daily_oracle_${plan.primary.id}_${Date.now()}`,
        text: plan.primary.taskText,
        completed: true,
        dueDate: todayKey,
      })
    }

    setCalendarState({
      dayTasks: {
        ...(brain.calendarState?.dayTasks || {}),
        [todayKey]: nextTasks,
      },
    })
    setStreak({ completionDates: nextDates })
    setUi((current) => ({
      ...current,
      completedIds: nextSummary.completedToday
        ? Array.from(new Set([...current.completedIds, plan.primary.id]))
        : current.completedIds.filter((id) => id !== plan.primary.id),
    }))
    setNotice(nextSummary.completedToday
      ? `TASK COMPLETE · ${nextSummary.currentStreak}-DAY STREAK.`
      : "TODAY REOPENED.")
    setTodayPanel(nextSummary.completedToday ? "calendar" : "move")
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

  const renderCompactAction = (candidate: DailyOracleCandidate, index: number) => (
    <article key={candidate.id} className={`daily-oracle-v2__quick-card is-tone-${(index % 3) + 1}`}>
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
                {todayPanel === "calendar" && streakSummary.completedToday ? (
                  <div className="daily-oracle-v2__calendar-stage" aria-label="Daily Oracle streak calendar">
                    <div className="daily-oracle-v2__calendar-stage-header">
                      <div className="daily-oracle-v2__streak-flame" aria-hidden="true">
                        <Flame />
                      </div>
                      <div className="daily-oracle-v2__streak-copy">
                        <span>TODAY COMPLETE</span>
                        <strong>{streakSummary.currentStreak} DAY STREAK</strong>
                        <small>BEST {streakSummary.longestStreak} · TOTAL {streakSummary.totalCompleted}</small>
                      </div>
                      <WidgetIconButton
                        height={24}
                        tone="default"
                        label="Return to Best Next Move"
                        icon={<Target />}
                        onClick={() => setTodayPanel("move")}
                      />
                    </div>
                    <div className="daily-oracle-v2__calendar">
                      <div className="daily-oracle-v2__calendar-title">
                        <CalendarDays aria-hidden="true" />
                        <strong>{calendar.label}</strong>
                      </div>
                      <div className="daily-oracle-v2__calendar-grid" aria-label={`Daily Oracle completion calendar for ${calendar.label}`}>
                        {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="is-weekday">{day}</span>)}
                        {calendar.cells.map((cell, index) => cell ? (
                          <span
                            key={cell.key}
                            className={`${cell.completed ? "is-complete" : ""} ${cell.today ? "is-today" : ""}`.trim()}
                            aria-label={`${cell.key}${cell.completed ? ", completed" : ""}${cell.today ? ", today" : ""}`}
                          >
                            {cell.completed ? <Check aria-hidden="true" /> : cell.day}
                          </span>
                        ) : <span key={`blank-${index}`} className="is-blank" aria-hidden="true" />)}
                      </div>
                    </div>
                    <WidgetSizedButton
                      height={24}
                      textFit="adaptive"
                      tone="default"
                      className="daily-oracle-v2__reopen-button"
                      onClick={togglePrimaryComplete}
                    >
                      REOPEN TODAY
                    </WidgetSizedButton>
                  </div>
                ) : (
                  <div className="daily-oracle-v2__compass">
                    <article className={`daily-oracle-v2__primary ${streakSummary.completedToday ? "is-done" : ""}`}>
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
                          height={38}
                          tone={streakSummary.completedToday ? "primary" : "default"}
                          className="daily-oracle-v2__day-check"
                          label={streakSummary.completedToday ? "Open today's streak calendar" : "Complete today's Daily Oracle task"}
                          icon={streakSummary.completedToday ? <CalendarDays /> : <Check />}
                          onClick={() => streakSummary.completedToday ? setTodayPanel("calendar") : togglePrimaryComplete()}
                        />
                      </div>
                    </article>

                    <div className="daily-oracle-v2__score-stack" aria-label="Daily Oracle decision score">
                      <div className="daily-oracle-v2__score is-impact">
                        <span>IMPACT</span>
                        <strong>{oracleLevelLabel(plan.primary.impact)}</strong>
                        <i style={{ "--oracle-score": `${scorePercent(plan.primary.impact)}%` } as React.CSSProperties} />
                      </div>
                      <div className="daily-oracle-v2__score is-effort">
                        <span>EFFORT</span>
                        <strong>{oracleEffortLabel(plan.primary.effort)}</strong>
                        <i style={{ "--oracle-score": `${scorePercent(4 - plan.primary.effort)}%` } as React.CSSProperties} />
                      </div>
                      <div className="daily-oracle-v2__score is-evidence">
                        <span>EVIDENCE</span>
                        <strong>{plan.evidenceCoverage}%</strong>
                        <i style={{ "--oracle-score": `${plan.evidenceCoverage}%` } as React.CSSProperties} />
                      </div>
                    </div>
                  </div>
                )}
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
              <CreatorFocusConsole
                focusMetric={ui.focusMetric}
                onMetricChange={setFocusMetric}
                remaining={focusRemaining}
                running={focusRunning}
                onToggleTimer={() => setFocusRunning((value) => !value)}
                onResetTimer={() => {
                  setFocusRunning(false)
                  setFocusRemaining(FOCUS_SESSION_SECONDS)
                }}
                nextTask={nextTask}
                openTaskCount={openTasks.length}
              />

              <WidgetSection className="daily-oracle-v2__focus-plan">
                <div className="daily-oracle-v2__section-heading">
                  <Target size={15} aria-hidden="true" />
                  <strong>{ui.focusMetric.replace("-", " ").toUpperCase()} PLAN</strong>
                  <span>3 ACTIONS</span>
                </div>
                <div className="daily-oracle-v2__focus-list">
                  {plan.focusTasks.map((candidate, index) => (
                    <article key={candidate.id} className={`daily-oracle-v2__focus-row is-tone-${(index % 3) + 1}`}>
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
                <div className="is-purple">
                  <span>CHANNEL READ</span>
                  <strong>{Math.round(growth.profileConfidenceScore)}%</strong>
                </div>
                <div className="is-cyan">
                  <span>EVIDENCE READY</span>
                  <strong>{plan.evidenceCoverage}%</strong>
                </div>
                <div className="is-orange">
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
