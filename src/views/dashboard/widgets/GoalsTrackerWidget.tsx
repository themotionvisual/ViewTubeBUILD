import React, { useState, useEffect } from "react"
import { Activity } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetTooltip } from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"

interface GoalsTrackerWidgetProps {
  data: DashboardData
  commonProps: any
}

const GOAL_STORAGE_KEY = "vt_goal_targets_v2"

const fmt = (key: string, val: number) => {
  if (key === "Revenue") return `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return val.toLocaleString()
}

export const GoalsTrackerWidget: React.FC<GoalsTrackerWidgetProps> = ({ data, commonProps }) => {
  const [goalTargets, setGoalTargets] = useState<Record<string, any>>({})
  const [activeGoalPrompt, setActiveGoalPrompt] = useState<string | null>(null)
  const [goalInputValue, setGoalInputValue] = useState("")
  const [goalType, setGoalType] = useState<"total" | "avg">("total")
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null)

  useEffect(() => {
    const load = () => setGoalTargets(JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}"))
    load()
    window.addEventListener("storage", load)
    return () => window.removeEventListener("storage", load)
  }, [])

  const rawMetrics = data.rawMetrics || { subsTotal: 0, subscribers28d: 0, views28d: 0, revenue28d: 0, dataDaysCount: 28 }
  const daysCount = Math.max(1, rawMetrics.dataDaysCount || 28)

  // Correct totals and daily averages
  const categories = [
    {
      key: "Subscribers",
      label: "SUBS",
      color: "#FA618A",
      total: rawMetrics.subsTotal,
      daily: rawMetrics.subscribers28d / daysCount,
      period28d: rawMetrics.subscribers28d,
    },
    {
      key: "Views",
      label: "VIEWS",
      color: "#FFA85C",
      total: rawMetrics.views28d,
      daily: rawMetrics.views28d / daysCount,
      period28d: rawMetrics.views28d,
    },
    {
      key: "Revenue",
      label: "$REV",
      color: "#FFDA47",
      total: rawMetrics.revenue28d,
      daily: rawMetrics.revenue28d / daysCount,
      period28d: rawMetrics.revenue28d,
    },
    {
      key: "WatchTime",
      label: "HRS",
      color: "#3FEE56",
      total: (rawMetrics as any).watchHours28d || 0,
      daily: ((rawMetrics as any).watchHours28d || 0) / daysCount,
      period28d: (rawMetrics as any).watchHours28d || 0,
    },
  ]

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}")
    if (Object.keys(stored).length > 0) return

    const now = Date.now()
    const automaticGoals = categories.reduce<Record<string, any>>((next, category) => {
      const baseline = category.period28d > 0 ? category.period28d : category.daily * 30
      const target = Math.round(baseline * 1.1)
      if (target > 0) next[category.key] = { target, duration: "1mo", type: "total", setAt: now, auto: true }
      return next
    }, {})

    if (Object.keys(automaticGoals).length === 0) return
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(automaticGoals))
    setGoalTargets(automaticGoals)
  }, [rawMetrics.subscribers28d, rawMetrics.views28d, rawMetrics.revenue28d, (rawMetrics as any).watchHours28d, daysCount])

  const handleSaveGoal = () => {
    if (!activeGoalPrompt || !goalInputValue) { setActiveGoalPrompt(null); return }
    const current = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}")
    current[activeGoalPrompt] = {
      target: parseFloat(goalInputValue.replace(/[^0-9.]/g, "")),
      duration: "1mo",
      type: goalType,
      setAt: Date.now(),
    }
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(current))
    setGoalTargets(current)
    setActiveGoalPrompt(null)
    setGoalInputValue("")
    setGoalType("total")
    window.dispatchEvent(new Event("storage"))
  }

  const handleAutoGoals = () => {
    const current = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}")
    const now = Date.now()
    categories.forEach((cat) => {
      // 1-month goal = 10% growth over last 28-day period
      const base = cat.period28d > 0 ? cat.period28d : cat.daily * 30
      const target = Math.round(base * 1.1)
      if (target > 0) {
        current[cat.key] = { target, duration: "1mo", type: "total", setAt: now, auto: true }
      }
    })
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(current))
    setGoalTargets(current)
    window.dispatchEvent(new Event("storage"))
  }

  const hasAnyGoal = Object.keys(goalTargets).length > 0
  const hoveredCategory = categories.find((category) => category.key === hoveredMetric)
  const hoveredGoal = hoveredCategory ? goalTargets[hoveredCategory.key] : null
  const hoveredValue = hoveredCategory ? (hoveredGoal?.type === "avg" ? hoveredCategory.daily : hoveredCategory.period28d) : 0
  const hoveredPercent = hoveredCategory && hoveredGoal?.target
    ? Math.min(100, Math.round((hoveredValue / hoveredGoal.target) * 100))
    : 0

  return (
    <WidgetShell {...commonProps} icon={<Activity size={22} />}>
      <div style={{ display: "flex", height: "100%", gap: "0", position: "relative" }}>

        {/* Left sidebar — metric buttons */}
        <div style={{ width: "86px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px", paddingRight: "4px", paddingTop: "10px", paddingBottom: "10px", marginTop: "-10px", marginBottom: "-10px", height: "calc(100% + 20px)", borderRight: "3px solid var(--widget-border, #000)", marginRight: "8px", zIndex: 10 }}>
          {categories.map((cat) => {
            const goal = goalTargets[cat.key]
            const progressValue = goal?.type === "avg" ? cat.daily : cat.period28d
            const pct = goal?.target ? Math.min(100, Math.round((progressValue / goal.target) * 100)) : 0
            return (
              <WidgetTooltip
                key={cat.key}
                variant="top-center-outline"
                className="goals-tracker-metric-tooltip"
                content={<><span className="widget-tooltip-title">{cat.key} goal</span><span className="widget-tooltip-subtitle">{fmt(cat.key, progressValue)} of {fmt(cat.key, goal?.target || 0)} this month · {pct}% complete.</span></>}
                style={{ "--tooltip-surface": cat.color, "--tooltip-border": cat.color } as React.CSSProperties}
              >
              <button
                onClick={() => {
                  setActiveGoalPrompt(cat.key)
                  setGoalInputValue(goal?.target ? String(goal.target) : "")
                  setGoalType(goal?.type || "total")
                }}
                style={{
                  flex: 1,
                  padding: "4px 3px",
                  background: goal ? cat.color : "#fff",
                  border: "2px solid #000",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: 1000,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0 0 rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1px",
                  lineHeight: 1.1,
                }}>
                <span style={{ fontSize: "9px" }}>{cat.label}</span>
                <span style={{ fontSize: "10px", fontWeight: 900 }}>{fmt(cat.key, cat.period28d)}</span>
                {goal ? (
                  <span style={{ fontSize: "8px", opacity: 0.75, fontWeight: 900 }}>{pct}%</span>
                ) : (
                  <span style={{ fontSize: "8px", opacity: 0.35 }}>TAP</span>
                )}
              </button>
              </WidgetTooltip>
            )
          })}
        </div>

        {/* Right side — rings + auto-goal button */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", position: "relative" }}>
          {!hasAnyGoal && (
            <div style={{ position: "absolute", top: "8px", fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4, whiteSpace: "nowrap" }}>
              Tap a metric or auto-set
            </div>
          )}

          <div className="goals-tracker-visual" aria-label="Goal progress visual details">
          <svg width="100%" height="100%" viewBox="0 0 160 140" style={{ maxWidth: "180px", maxHeight: "160px" }}>
            {categories.map((cat, ci) => {
              const radii = [62, 48, 34, 20]
              const r = radii[ci]
              const goal = goalTargets[cat.key]
              const target = goal?.target || 0
              const progressValue = goal?.type === "avg" ? cat.daily : cat.period28d
              const circumference = 2 * Math.PI * r
              const progress = target > 0 ? Math.min(1, progressValue / target) : 0
              const offset = circumference - progress * circumference

              let aheadOverlay = null
              if (target > 0 && goal?.setAt) {
                const daysElapsed = (Date.now() - goal.setAt) / 86400000
                const totalDays = 30
                const timeProgress = Math.min(1, daysElapsed / totalDays)
                const isAhead = progress >= timeProgress
                aheadOverlay = (
                  <circle cx="80" cy="70" r={r} fill="none"
                    stroke={isAhead ? "rgba(0,220,0,0.18)" : "rgba(255,0,0,0.15)"} strokeWidth="10"
                    style={{ pointerEvents: "none" }}
                  />
                )
              }

              return (
                <g key={cat.key}>
                  <circle cx="80" cy="70" r={r} fill="none" stroke="#eee" strokeWidth="10" opacity={0.35} />
                  {aheadOverlay}
                  {target > 0 && (
                    <circle
                      cx="80" cy="70" r={r} fill="none"
                      stroke={cat.color} strokeWidth="10"
                      strokeDasharray={circumference} strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease-out", transform: "rotate(-90deg)", transformOrigin: "80px 70px" }}
                    />
                  )}
                  <circle
                    cx="80"
                    cy="70"
                    r={r}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    tabIndex={0}
                    role="button"
                    aria-label={`${cat.key} goal details`}
                    onPointerEnter={() => setHoveredMetric(cat.key)}
                    onPointerLeave={() => setHoveredMetric(null)}
                    onFocus={() => setHoveredMetric(cat.key)}
                    onBlur={() => setHoveredMetric(null)}
                  />
                </g>
              )
            })}

            {hasAnyGoal && (() => {
              const active = categories.filter((c) => goalTargets[c.key]?.target)
              const avgPct = active.length === 0 ? 0 : Math.round(
                active.reduce((sum, c) => {
                  const goal = goalTargets[c.key]
                  const pVal = goal.type === "avg" ? c.daily : c.period28d
                  return sum + Math.min(100, (pVal / goal.target) * 100)
                }, 0) / active.length
              )
              return (
                <text x="80" y="66" textAnchor="middle" style={{ fontFamily: "inherit", fontWeight: 900, fontSize: 18, fill: "#000" }}>{avgPct}%</text>
              )
            })()}
            {hasAnyGoal && (
              <text x="80" y="78" textAnchor="middle" style={{ fontFamily: "inherit", fontWeight: 800, fontSize: 7, fill: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>AVG</text>
            )}
          </svg>
          {hoveredCategory && (
            <div className="goals-tracker-visual-tooltip" style={{ "--goal-tooltip-color": hoveredCategory.color } as React.CSSProperties} role="tooltip">
              <strong>{hoveredCategory.key}</strong>
              <span>{fmt(hoveredCategory.key, hoveredValue)} / {fmt(hoveredCategory.key, hoveredGoal?.target || 0)} · {hoveredPercent}%</span>
            </div>
          )}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
            {categories.map((cat) => (
              <span key={cat.key} className="goals-tracker-legend">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, border: "1px solid #000" }} />
                <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.65 }}>{cat.label}</span>
              </span>
            ))}
          </div>

          {!hasAnyGoal && (
            <button
              onClick={handleAutoGoals}
              className="vt-button"
              style={{ height: "26px", fontSize: "9px", padding: "0 10px", background: "#FFDA47" }}>
              AUTO-SET 1MO GOALS
            </button>
          )}
        </div>

        {/* Goal setter overlay */}
        {activeGoalPrompt && (() => {
          const cat = categories.find((c) => c.key === activeGoalPrompt)!
          const displayTotal = fmt(activeGoalPrompt, cat.period28d)
          const displayDaily = fmt(activeGoalPrompt, cat.daily)

          return (
            <div className="dashboard-barrier" style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              background: "white", display: "flex", flexDirection: "column",
              zIndex: 100, padding: "8px", boxSizing: "border-box", gap: "8px",
            }}>
              {/* Header row */}
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ flex: 1, height: "32px", background: cat.color, border: "2px solid #000", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 900, boxShadow: "2px 2px 0 0 #000" }}>
                  {activeGoalPrompt.toUpperCase()}
                </div>
                <div style={{ flex: 1, height: "32px", background: "#f5f5f5", border: "2px solid #000", borderRadius: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 900 }}>
                  <span style={{ opacity: 0.45, fontSize: "7px" }}>28D TOTAL</span>
                  <span>{displayTotal}</span>
                </div>
                <div style={{ flex: 1, height: "32px", background: "#f5f5f5", border: "2px solid #000", borderRadius: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 900 }}>
                  <span style={{ opacity: 0.45, fontSize: "7px" }}>DAILY AVG</span>
                  <span>{displayDaily}</span>
                </div>
              </div>

              {/* Type toggle */}
              <div className="vt-tab-group" style={{ height: "30px", "--widget-color": cat.color, border: "2px solid black" } as any}>
                <button onClick={() => setGoalType("total")} className={`vt-tab-btn ${goalType === "total" ? "active" : ""}`} style={{ fontSize: "9px", fontWeight: 900 }}>28D TOTAL</button>
                <button onClick={() => setGoalType("avg")} className={`vt-tab-btn ${goalType === "avg" ? "active" : ""}`} style={{ fontSize: "9px", fontWeight: 900 }}>DAILY AVG</button>
              </div>

              {/* Goal input */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px", fontWeight: 900, whiteSpace: "nowrap" }}>GOAL:</span>
                <input
                  type="text"
                  value={goalInputValue}
                  onChange={(e) => setGoalInputValue(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="vt-input"
                  style={{ flex: 1, height: "30px", padding: "0 10px", fontSize: "13px" }}
                  autoFocus
                  placeholder={goalType === "avg" ? `current: ${displayDaily}/day` : `current: ${displayTotal}/mo`}
                />
              </div>

              <div style={{ fontSize: "8px", fontWeight: 800, opacity: 0.45, textTransform: "uppercase" }}>
                Goal period: 1 month
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
                <button
                  onClick={handleSaveGoal}
                  className="vt-button"
                  style={{ flex: 1, height: "30px", background: cat.color, fontSize: "11px" }}>
                  SET GOAL
                </button>
                <button
                  onClick={() => {
                    const current = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}")
                    delete current[activeGoalPrompt]
                    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(current))
                    setGoalTargets(current)
                    setActiveGoalPrompt(null)
                    window.dispatchEvent(new Event("storage"))
                  }}
                  className="vt-button"
                  style={{ width: "30px", height: "30px", background: "#fff", padding: 0, fontSize: "12px", flexShrink: 0 }}>
                  🗑
                </button>
                <button
                  onClick={() => setActiveGoalPrompt(null)}
                  className="vt-button"
                  style={{ width: "30px", height: "30px", background: "#fff", padding: 0, fontSize: "14px", flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            </div>
          )
        })()}
      </div>
    </WidgetShell>
  )
}
