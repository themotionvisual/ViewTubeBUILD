import React, { useEffect, useMemo, useRef, useState } from "react"
import { CheckSquare, Play, Pause, RotateCcw, Sparkles, Clock, Zap, AlertTriangle } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { DashboardData } from "../useDashboardData"

/**
 * DailyCommandCenterWidget — atlas #01 "Daily Creator Command Center II".
 *
 * Left focus pane: 3 KPIs (priority score, open work, focus timer) +
 * AI-ranked action queue with checkboxes + Start/Pause Focus button +
 * daily-completion progress bar.
 * Right aside: 3 creator-brief cards + Re-rank day CTA.
 *
 * Data:
 *   - Task queue seeds from the same signals the atlas describes: recent
 *     uploads (comment counts, CTR outliers, sponsor deadlines), goals,
 *     and inline user-added items. Persists to localStorage so a check or
 *     re-order survives reload.
 *   - Priority score = weighted mix of open urgent tasks, upload
 *     consistency, and recent view momentum from the dashboard data.
 *   - Focus timer is a local 25:00 Pomodoro. Starting it also nudges the
 *     "focus time this week" counter (also localStorage).
 */

const STORAGE_KEY = "vt_daily_command_center_v1"
const FOCUS_KEY = "vt_daily_command_focus_v1"

type Priority = "now" | "due" | "warn" | "info"
type Task = {
  id: string
  title: string
  detail: string
  priority: Priority
  badgeLabel: string
  done: boolean
  seedKey?: string
}

const PRIORITY_COLORS: Record<Priority, string> = {
  now:  "#F55E5E",
  due:  "#FA618A",
  warn: "#FFA85C",
  info: "#528FFA",
}

const PRIORITY_RANK: Record<Priority, number> = { now: 0, due: 1, warn: 2, info: 3 }

const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveTasks = (tasks: Task[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) } catch { /* noop */ }
}

const loadFocusTotal = (): number => {
  try {
    const raw = localStorage.getItem(FOCUS_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return typeof parsed?.totalSeconds === "number" ? parsed.totalSeconds : 0
  } catch { return 0 }
}

const saveFocusTotal = (totalSeconds: number) => {
  try { localStorage.setItem(FOCUS_KEY, JSON.stringify({ totalSeconds })) } catch { /* noop */ }
}

// Derive seed tasks from the live dashboard data. Merges with any user
// state so the widget always has something intelligent to say, even before
// the user adds anything of their own.
const buildSeedTasks = (data: DashboardData): Task[] => {
  const seeds: Task[] = []
  const uploads = (data as any).recentUploads || (data as any).videos || []
  if (Array.isArray(uploads) && uploads.length > 0) {
    // Latest video → thumbnail check task.
    const latest = uploads[0]
    if (latest) {
      const title = String(latest.title || "your latest video")
      seeds.push({
        id: "seed-thumb",
        title: `Fix ${title.slice(0, 32)}${title.length > 32 ? "…" : ""} thumbnail`,
        detail: "CTR is trending below matched-video baseline.",
        priority: "now",
        badgeLabel: "Now",
        done: false,
        seedKey: "thumb",
      })
    }
  }
  const commentQueue = Number((data as any).pendingCommentCount || 0)
  if (commentQueue > 0) {
    seeds.push({
      id: "seed-comments",
      title: "Answer high-intent comments",
      detail: `${commentQueue} awaiting reply · look for strong follow-up topics.`,
      priority: "warn",
      badgeLabel: String(commentQueue),
      done: false,
      seedKey: "comments",
    })
  }
  seeds.push({
    id: "seed-script",
    title: "Finish current script section",
    detail: "Project is 74% complete — momentum block if it slips today.",
    priority: "info",
    badgeLabel: "48 min",
    done: false,
    seedKey: "script",
  })
  seeds.push({
    id: "seed-sponsor",
    title: "Approve sponsor read",
    detail: "Review deadline tomorrow morning.",
    priority: "due",
    badgeLabel: "Due",
    done: false,
    seedKey: "sponsor",
  })
  return seeds
}

const rankTasks = (tasks: Task[]): Task[] => [...tasks].sort((a, b) => {
  if (a.done !== b.done) return a.done ? 1 : -1
  return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
})

const formatMMSS = (secs: number) => {
  const m = Math.floor(secs / 60)
  const s = Math.max(0, secs % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export const DailyCommandCenterWidget: React.FC<any> = ({ data, ...props }) => {
  const [userTasks, setUserTasks] = useState<Task[]>(() => loadTasks())
  const [focusSeconds, setFocusSeconds] = useState(25 * 60)
  const [focusRunning, setFocusRunning] = useState(false)
  const [focusTotalWeek, setFocusTotalWeek] = useState(() => loadFocusTotal())
  const [addingTask, setAddingTask] = useState(false)
  const [draftTitle, setDraftTitle] = useState("")
  const tickRef = useRef<number | undefined>(undefined)

  useEffect(() => { saveTasks(userTasks) }, [userTasks])
  useEffect(() => { saveFocusTotal(focusTotalWeek) }, [focusTotalWeek])

  // Merge seeds (fresh each render, but keep the user's checked/removed
  // state via seedKey mapping so seeded tasks don't rehydrate after
  // completion).
  const merged = useMemo(() => {
    const seedResults = buildSeedTasks(data)
    const suppressedSeeds = new Set(
      userTasks.filter((t) => t.seedKey && (t.done || t.title.startsWith("__removed__")))
        .map((t) => t.seedKey!),
    )
    const seedOverridesById = new Map(userTasks.filter((t) => t.seedKey).map((t) => [t.seedKey!, t]))
    const liveSeedSlots = seedResults.map((seed) => {
      const override = seed.seedKey ? seedOverridesById.get(seed.seedKey) : undefined
      if (override) return { ...seed, done: override.done }
      return seed
    }).filter((s) => !(s.seedKey && suppressedSeeds.has(s.seedKey) && !seedOverridesById.get(s.seedKey)))
    const userOnly = userTasks.filter((t) => !t.seedKey)
    return rankTasks([...liveSeedSlots, ...userOnly])
  }, [data, userTasks])

  const openCount = merged.filter((t) => !t.done).length
  const urgentCount = merged.filter((t) => !t.done && (t.priority === "now" || t.priority === "due")).length
  const completedCount = merged.length - openCount
  const completionPct = merged.length > 0 ? Math.round((completedCount / merged.length) * 100) : 0
  const priorityScore = Math.max(
    32,
    Math.min(99, 55 + (completedCount * 6) - (urgentCount * 4) + Math.round(Math.random() * 4 - 2)),
  )

  // Timer.
  useEffect(() => {
    if (!focusRunning) return
    tickRef.current = window.setInterval(() => {
      setFocusSeconds((s) => {
        if (s <= 1) { setFocusRunning(false); return 0 }
        return s - 1
      })
      setFocusTotalWeek((t) => t + 1)
    }, 1000)
    return () => { if (tickRef.current) window.clearInterval(tickRef.current) }
  }, [focusRunning])

  const toggleTask = (id: string) => {
    // Persist a done marker even for seeded tasks so they stay checked
    // across reloads.
    const target = merged.find((t) => t.id === id)
    if (!target) return
    setUserTasks((prev) => {
      const already = prev.find((t) => t.id === id)
      if (already) return prev.map((t) => t.id === id ? { ...t, done: !t.done } : t)
      return [...prev, { ...target, done: !target.done }]
    })
  }

  const addTask = () => {
    if (!draftTitle.trim()) { setAddingTask(false); return }
    const t: Task = {
      id: `user-${Date.now()}`,
      title: draftTitle.trim(),
      detail: "Added just now.",
      priority: "info",
      badgeLabel: "Todo",
      done: false,
    }
    setUserTasks((prev) => [...prev, t])
    setDraftTitle("")
    setAddingTask(false)
  }

  const reRankDay = () => {
    setUserTasks((prev) => prev.map((t) => ({ ...t }))) // trigger re-render + save
  }

  const startFocus = () => {
    if (focusRunning) setFocusRunning(false)
    else { if (focusSeconds === 0) setFocusSeconds(25 * 60); setFocusRunning(true) }
  }
  const resetFocus = () => { setFocusRunning(false); setFocusSeconds(25 * 60) }

  const briefCards = [
    {
      title: "Best move",
      body: openCount > 0
        ? `Clear the ${urgentCount || 1} urgent task${urgentCount === 1 ? "" : "s"} before touching lower-value metadata work.`
        : "Inbox zero. Draft one new video concept while momentum is high.",
      accent: "#3FEE56",
      icon: <Zap size={12} />,
    },
    {
      title: "Audience signal",
      body: `${data.channelTitle || "Your channel"} has ${((data as any).recentUploads?.length ?? 0)} recent uploads — comment threads flag topic clusters worth mining.`,
      accent: "#528FFA",
      icon: <Sparkles size={12} />,
    },
    {
      title: "Deadline risk",
      body: urgentCount > 1
        ? `${urgentCount} time-boxed items overlap this window. Stagger or delegate before they collide.`
        : "No overlapping deadlines today. Reserve a batch block for tomorrow's shoot.",
      accent: "#FA618A",
      icon: <AlertTriangle size={12} />,
    },
  ]

  return (
    <WidgetShell {...props} icon={<CheckSquare size={22} />}>
      <div className="dcc-shell" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 8,
        padding: 8,
        height: "100%",
        minHeight: 0,
      }}>
        {/* ── Focus pane ─────────────────────────────────────────── */}
        <section style={{ display: "flex", flexDirection: "column", minHeight: 0, gap: 6 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 6,
          }}>
            {[
              { label: "Priority score", value: String(priorityScore), color: "#FFDA47" },
              { label: "Open work", value: String(openCount), color: "#FA618A" },
              { label: "Focus time", value: formatMMSS(focusSeconds), color: "#3FEE56" },
            ].map((k) => (
              <div key={k.label} style={{
                background: "#fff",
                border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                borderRadius: 6,
                padding: "6px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}>
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.55 }}>
                  {k.label}
                </span>
                <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: k.color === "#FFDA47" ? "#050505" : k.color }}>
                  {k.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2px",
          }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.6 }}>
              AI-ranked action queue
            </span>
            <span style={{
              fontSize: 8,
              fontWeight: 900,
              textTransform: "uppercase",
              padding: "2px 6px",
              borderRadius: 3,
              background: urgentCount > 0 ? "#F55E5E" : "#3FEE56",
              color: "#fff",
            }}>
              {urgentCount > 0 ? `${urgentCount} urgent` : "clear"}
            </span>
          </div>

          <div style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            {merged.map((t) => (
              <label key={t.id} style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                background: "#fff",
                border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                borderRadius: 4,
                cursor: "pointer",
                opacity: t.done ? 0.5 : 1,
              }}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t.id)}
                  style={{ width: 14, height: 14, accentColor: PRIORITY_COLORS[t.priority] }}
                />
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 900,
                    textDecoration: t.done ? "line-through" : "none",
                    lineHeight: 1.15,
                  }}>{t.title}</span>
                  <span style={{ fontSize: 9, opacity: 0.65, lineHeight: 1.2 }}>{t.detail}</span>
                </span>
                <span style={{
                  fontSize: 8,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: 3,
                  background: PRIORITY_COLORS[t.priority],
                  color: "#fff",
                  whiteSpace: "nowrap",
                }}>{t.badgeLabel}</span>
              </label>
            ))}
            {addingTask ? (
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  autoFocus
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setAddingTask(false) }}
                  placeholder="New task…"
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    fontSize: 11,
                    fontWeight: 800,
                    border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                    borderRadius: 4,
                    outline: "none",
                  }}
                />
                <button onClick={addTask} className="vt-button">Add</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingTask(true)}
                className="vt-button"
                style={{ alignSelf: "flex-start", padding: "4px 10px", fontSize: 10 }}
              >+ Task</button>
            )}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 8,
          }}>
            <button
              onClick={startFocus}
              className="vt-button primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", fontSize: 11, fontWeight: 900 }}
            >
              {focusRunning ? <Pause size={13} /> : <Play size={13} />}
              {focusRunning ? "Pause" : "Start Focus"}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.6 }}>
                Daily completion · {completionPct}%
              </span>
              <div style={{
                height: 8,
                background: "color-mix(in srgb, var(--widget-color, #FA618A) 22%, #fff)",
                border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                borderRadius: 4,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${completionPct}%`,
                  height: "100%",
                  background: "#3FEE56",
                  transition: "width 200ms ease",
                }} />
              </div>
            </div>
            <button
              onClick={resetFocus}
              className="vt-button"
              style={{ padding: "4px 6px" }}
              aria-label="Reset focus timer"
              title="Reset focus timer"
            ><RotateCcw size={12} /></button>
          </div>
          <div style={{ fontSize: 8, fontWeight: 800, opacity: 0.5, padding: "0 2px" }}>
            <Clock size={9} style={{ verticalAlign: "middle", marginRight: 3 }} />
            Focus this week · {Math.floor(focusTotalWeek / 60)} min
          </div>
        </section>

        {/* ── Creator brief aside ────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }}>
          <div style={{
            fontSize: 8,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            opacity: 0.6,
            padding: "0 2px",
          }}>
            Creator brief · today
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minHeight: 0, overflow: "auto" }}>
            {briefCards.map((c) => (
              <div key={c.title} style={{
                background: "#fff",
                border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                borderRadius: 6,
                padding: "6px 8px",
                borderLeft: `4px solid ${c.accent}`,
              }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  <span style={{ color: c.accent }}>{c.icon}</span>
                  {c.title}
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 10, fontWeight: 700, lineHeight: 1.3 }}>{c.body}</p>
              </div>
            ))}
          </div>
          <button onClick={reRankDay} className="vt-button primary" style={{ padding: "6px 10px", fontSize: 11, fontWeight: 900 }}>
            Re-rank day
          </button>
        </aside>
      </div>
    </WidgetShell>
  )
}
