import React, { useState, useEffect } from "react"
import { Activity } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { DashboardData } from "../useDashboardData"

interface GoalsTrackerWidgetProps {
  data: DashboardData
  commonProps: any
}

export const GoalsTrackerWidget: React.FC<GoalsTrackerWidgetProps> = ({data, commonProps, onDecSize, onCycleHeight, onDecHeight}) => {
  const GOAL_STORAGE_KEY = "vt_goal_targets_v2"
  const [goalTargets, setGoalTargets] = useState<any>({onDecSize, onCycleHeight, onDecHeight})
  const [activeGoalPrompt, setActiveGoalPrompt] = useState<string | null>(null)
  const [goalInputValue, setGoalInputValue] = useState("")
  const [goalDurationValue, setGoalDurationValue] = useState(3)
  const [goalDurationUnit, setGoalDurationUnit] = useState<"day"|"wk"|"mo">("mo")
  const [goalType, setGoalType] = useState<"total" | "avg">("total")

  useEffect(() => {
    const handleStorage = () => {
      setGoalTargets(JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}"))
    }
    handleStorage()
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const metrics = data.rawMetrics || { subsTotal: 0, subscribers28d: 0, views28d: 0, revenue28d: 0, dataDaysCount: 28 }
  const daysCount = Math.max(1, metrics.dataDaysCount || 28)

  const categories = [
    { key: "Subscribers", current: metrics.subsTotal, avg: Math.round(metrics.subscribers28d / daysCount), color: "#4FFF5B", radius: 68 },
    { key: "Views", current: metrics.views28d, avg: Math.round(metrics.views28d / daysCount), color: "#24D3FF", radius: 54 },
    { key: "Revenue", current: metrics.revenue28d, avg: Number((metrics.revenue28d / daysCount).toFixed(2)), color: "#FFE357", radius: 40 },
    { key: "Other", current: 0, avg: 0, color: "#FF83EA", radius: 26 },
  ]

  const handleSaveGoal = () => {
    if (!activeGoalPrompt || !goalInputValue) {
      setActiveGoalPrompt(null)
      return
    }
    const current = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}")
    current[activeGoalPrompt] = { target: parseFloat(goalInputValue.replace(/[^0-9.]/g, "")), duration: `${goalDurationValue}${goalDurationUnit}`, type: goalType, setAt: Date.now() }
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(current))
    setGoalTargets(current)
    setActiveGoalPrompt(null)
    setGoalInputValue("")
    setGoalDurationValue(3)
    setGoalDurationUnit("mo")
    setGoalType("total")
    window.dispatchEvent(new Event("storage"))
  }

  const hasAnyGoal = Object.keys(goalTargets).length > 0

  return (
    <WidgetShell {...commonProps} icon={<Activity size={22} />}>
      <div style={{ display: "flex", height: "100%", gap: "0", position: "relative" }}>
        {/* Left sidebar rail — info boxes */}
        <div style={{ width: "82px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px", paddingRight: "4px", borderRight: "2px solid #000", marginRight: "6px", zIndex: 10 }}>
          {categories.map((cat) => {
            const goal = goalTargets[cat.key]
            const label = cat.key === "Subscribers" ? "SUBS" : cat.key === "Views" ? "VIEWS" : cat.key === "Revenue" ? "$REV" : "OTHER"
            const progressValue = goal?.type === "avg" ? cat.avg : cat.current
            const pct = goal?.target ? Math.min(100, Math.round((progressValue / goal.target) * 100)) : 0
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveGoalPrompt(cat.key)
                  setGoalInputValue(goal?.target ? goal.target.toString() : "")
                  const durationMatch = (goal?.duration || "3mo").match(/(\d+)(day|wk|mo)/)
                  if (durationMatch) {
                    setGoalDurationValue(parseInt(durationMatch[1], 10))
                    setGoalDurationUnit(durationMatch[2] as "day"|"wk"|"mo")
                  }
                  setGoalType(goal?.type || "total")
                }}
                style={{
                  padding: "4px 3px",
                  background: goal ? cat.color : "#fff",
                  border: "2px solid #000",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 1000,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0 0 rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1px",
                  lineHeight: 1.1,
                }}>
                <span>{label}</span>
                {goal ? (
                  <span style={{ fontSize: "8px", opacity: 0.7 }}>{pct}%</span>
                ) : (
                  <span style={{ fontSize: "8px", opacity: 0.35 }}>SET</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Right side — concentric rings (as large as possible) */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {!hasAnyGoal && (
            <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5, whiteSpace: "nowrap" }}>
              Click left to set your goals
            </div>
          )}
          <svg width="100%" height="100%" viewBox="0 0 160 160" style={{ maxWidth: "180px", maxHeight: "180px" }}>
            {categories.map((cat) => {
              const goal = goalTargets[cat.key]
              const target = goal?.target || 0
              const progressValue = goal?.type === "avg" ? cat.avg : cat.current
              const circumference = 2 * Math.PI * cat.radius
              const progress = target > 0 ? Math.min(1, progressValue / target) : 0
              const offset = circumference - (progress * circumference)
              
              // Determine ahead/behind overlay
              let statusOverlay = null
              if (target > 0 && goal?.setAt && goal?.duration) {
                const now = Date.now()
                const daysElapsed = (now - goal.setAt) / (1000 * 60 * 60 * 24)
                const durMatch = goal.duration.match(/(\d+)(wk|mo)/)
                const dVal = durMatch ? parseInt(durMatch[1]) : 3
                const dUnit = durMatch ? durMatch[2] : "mo"
                const totalDays = dUnit === "day" ? dVal : dUnit === "wk" ? dVal * 7 : dVal * 30
                const timeProgress = Math.min(1, daysElapsed / totalDays)
                const isAhead = progress >= timeProgress
                const overlayColor = isAhead ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"
                
                statusOverlay = (
                  <circle
                    cx="80" cy="80" r={cat.radius} fill="none"
                    stroke={overlayColor} strokeWidth="9"
                    style={{ pointerEvents: "none" }}
                  />
                )
              }

              return (
                <g key={cat.key}>
                  <circle cx="80" cy="80" r={cat.radius} fill="none" stroke="#eee" strokeWidth="9" style={{ opacity: 0.3 }} />
                  {statusOverlay}
                  {target > 0 && (
                    <circle
                      cx="80" cy="80" r={cat.radius} fill="none"
                      stroke={cat.color} strokeWidth="9"
                      strokeDasharray={circumference} strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease-out", transform: "rotate(-90deg)", transformOrigin: "center" }}
                    />
                  )}
                </g>
              )
            })}
          </svg>
          {hasAnyGoal && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 800 }}>
                {Math.round(
                  categories.filter((c) => goalTargets[c.key]?.target).reduce((sum, c) => {
                    const goal = goalTargets[c.key]
                    const t = goal?.target || 1
                    const pVal = goal?.type === "avg" ? c.avg : c.current
                    return sum + Math.min(100, (pVal / t) * 100)
                  }, 0) / categories.filter((c) => goalTargets[c.key]?.target).length
                )}%
              </div>
              <div style={{ fontSize: "8px", fontWeight: 800, color: "rgba(0,0,0,0.4)" }}>AVG PROGRESS</div>
            </div>
          )}
        </div>

        {/* Integrated Goal Setter Page */}
        {activeGoalPrompt && (() => {
          const activeCategory = categories.find(c => c.key === activeGoalPrompt)
          
          let currentDisplayVal = 0
          if (activeCategory) {
            currentDisplayVal = (goalType === "avg") ? activeCategory.avg : activeCategory.current
          }

          const badgeStyle = {
            height: "32px",
            background: activeCategory?.color || "#eee",
            border: "2px solid black",
            borderRadius: "4px",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 800,
            boxShadow: "2px 2px 0 0 rgba(0,0,0,1)",
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden"
          }

          const labelStyle: React.CSSProperties = {
            fontSize: "11px",
            fontWeight: 800,
            whiteSpace: "nowrap",
            height: "32px",
            display: "flex",
            alignItems: "center",
            width: "120px",
            flexShrink: 0
          }

          return (
            <div className="dashboard-barrier" style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "white",
              display: "flex", flexDirection: "column", zIndex: 100, padding: "8px", boxSizing: "border-box"
            }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "space-between" }}>
                
                {/* Row 1: Badges & Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ ...badgeStyle }}>{activeGoalPrompt?.toUpperCase()}</div>
                  <div style={{ ...badgeStyle, background: "#f5f5f5" }}>{currentDisplayVal.toLocaleString()}</div>
                </div>

                {/* Row 2: Set Goal Input */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ ...labelStyle, flex: "none", width: "auto" }}>GOAL:</span>
                  <input 
                    type="text" value={goalInputValue} onChange={(e) => setGoalInputValue(e.target.value.replace(/[^0-9]/g, ''))}
                    className="vt-input"
                    style={{ flex: 1, height: "32px", padding: "0 12px", fontSize: "14px", minWidth: 0 }}
                    autoFocus
                  />
                  <div className="vt-tab-group" style={{ flex: 1.2, height: "32px", "--widget-color": activeCategory?.color || "#000", border: "2px solid black", flexShrink: 0 } as any}>
                    <button onClick={() => setGoalType("total")} className={`vt-tab-btn ${goalType === "total" ? 'active' : ''}`} style={{ fontSize: "10px", fontWeight: 800 }}>TOTAL</button>
                    <button onClick={() => setGoalType("avg")} className={`vt-tab-btn ${goalType === "avg" ? 'active' : ''}`} style={{ fontSize: "9px", fontWeight: 800 }}>DAILY AVERAGE</button>
                  </div>
                </div>

                {/* Row 3: Achieve By Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ ...labelStyle, flex: "none", width: "auto" }}>ACHIEVE BY:</span>
                  <div className="vt-tab-group" style={{ flex: 1, height: "32px", "--widget-color": activeCategory?.color || "#000", border: "2px solid black" } as any}>
                    {[1, 2, 3].map(val => (
                      <button
                        key={val} onClick={() => setGoalDurationValue(val)}
                        className={`vt-tab-btn ${goalDurationValue === val ? 'active' : ''}`}
                        style={{ fontSize: "12px", fontWeight: 800 }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="vt-tab-group" style={{ flex: 1, height: "32px", "--widget-color": activeCategory?.color || "#000", border: "2px solid black", flexShrink: 0 } as any}>
                    {[{id: "day", l: "DAYS"}, {id: "wk", l: "WEEKS"}, {id: "mo", l: "MONTHS"}].map(u => (
                      <button
                        key={u.id} onClick={() => setGoalDurationUnit(u.id as any)}
                        className={`vt-tab-btn ${goalDurationUnit === u.id ? 'active' : ''}`}
                        style={{ fontSize: "9px", fontWeight: 800 }}
                      >
                        {u.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 4: Units & Action Footer */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                    <button 
                      onClick={handleSaveGoal}
                      className="vt-button"
                      style={{ flex: 1, height: "32px", background: activeCategory?.color || "#4FFF5B", fontSize: "12px" }}
                    >
                      SET GOAL
                    </button>
                    <button 
                      onClick={() => setActiveGoalPrompt(null)}
                      className="vt-button"
                      style={{ width: "32px", height: "32px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", padding: 0, flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </WidgetShell>
  )
}
