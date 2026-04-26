import React, { useState, useEffect } from "react"
import { Activity } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { DashboardData } from "../useDashboardData"

interface GoalsTrackerWidgetProps {
  data: DashboardData
  commonProps: any
}

export const GoalsTrackerWidget: React.FC<GoalsTrackerWidgetProps> = ({ data, commonProps }) => {
  const GOAL_STORAGE_KEY = "vt_goal_targets_v2"
  const [goalTargets, setGoalTargets] = useState<any>({})
  const [activeGoalPrompt, setActiveGoalPrompt] = useState<string | null>(null)
  const [goalInputValue, setGoalInputValue] = useState("")
  const [goalDurationValue, setGoalDurationValue] = useState(3)
  const [goalDurationUnit, setGoalDurationUnit] = useState<"wk"|"mo">("mo")
  const [goalType, setGoalType] = useState<"total" | "avg">("total")

  useEffect(() => {
    const handleStorage = () => {
      setGoalTargets(JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}"))
    }
    handleStorage()
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const getMetricValue = (label: string) => {
    const block = data.statBlocks.find((s: any) => s.label.toLowerCase().includes(label.toLowerCase()))
    if (!block) return 0
    const val = parseFloat(block.value.replace(/[^0-9.]/g, "") || "0")
    if (block.value.includes("K")) return val * 1000
    if (block.value.includes("M")) return val * 1000000
    return val
  }

  const categories = [
    { key: "Subscribers", current: getMetricValue("Subscribers"), color: "#4FFF5B", radius: 68 },
    { key: "Views", current: getMetricValue("Views"), color: "#24D3FF", radius: 54 },
    { key: "Revenue", current: getMetricValue("Revenue"), color: "#FFE357", radius: 40 },
    { key: "Other", current: 0, color: "#FF83EA", radius: 26 },
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
            const pct = goal?.target ? Math.min(100, Math.round((cat.current / goal.target) * 100)) : 0
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveGoalPrompt(cat.key)
                  setGoalInputValue(goal?.target ? goal.target.toString() : "")
                  const durationMatch = (goal?.duration || "3mo").match(/(\d+)(wk|mo)/)
                  if (durationMatch) {
                    setGoalDurationValue(parseInt(durationMatch[1], 10))
                    setGoalDurationUnit(durationMatch[2] as "wk"|"mo")
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
              const circumference = 2 * Math.PI * cat.radius
              const progress = target > 0 ? Math.min(1, cat.current / target) : 0
              const offset = circumference - (progress * circumference)
              
              // Determine ahead/behind overlay
              let statusOverlay = null
              if (target > 0 && goal?.setAt && goal?.duration) {
                const now = Date.now()
                const daysElapsed = (now - goal.setAt) / (1000 * 60 * 60 * 24)
                const durMatch = goal.duration.match(/(\d+)(wk|mo)/)
                const dVal = durMatch ? parseInt(durMatch[1]) : 3
                const dUnit = durMatch ? durMatch[2] : "mo"
                const totalDays = dUnit === "wk" ? dVal * 7 : dVal * 30
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
                    const t = goalTargets[c.key]?.target || 1
                    return sum + Math.min(100, (c.current / t) * 100)
                  }, 0) / categories.filter((c) => goalTargets[c.key]?.target).length
                )}%
              </div>
              <div style={{ fontSize: "8px", fontWeight: 800, color: "rgba(0,0,0,0.4)" }}>AVG PROGRESS</div>
            </div>
          )}
        </div>

        {/* Custom Goal Setter Modal */}
        {activeGoalPrompt && (() => {
          const activeCategory = categories.find(c => c.key === activeGoalPrompt)
          return (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            border: "3px solid black",
            padding: "8px 10px",
            boxShadow: "4px 4px 0px 0px black",
            borderRadius: "8px",
            fontWeight: "bold",
            zIndex: 50,
            minWidth: "160px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 900, borderBottom: "2px solid black", paddingBottom: "4px", textTransform: "uppercase" }}>Set {activeGoalPrompt} Goal</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label style={{ fontSize: "9px", textTransform: "uppercase" }}>Target Number</label>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: 900, background: "#eee", border: "2px solid black", borderRadius: "4px", padding: "2px 6px", whiteSpace: "nowrap" }}>
                  {activeCategory ? (goalType === "avg" ? Math.round(activeCategory.current / 28).toLocaleString() : activeCategory.current.toLocaleString()) : "0"} <span style={{fontSize:"8px"}}>CUR</span>
                </div>
                <input 
                  type="number"
                  value={goalInputValue}
                  onChange={(e) => setGoalInputValue(e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  name="goal_target_value_prevent_autofill"
                  style={{ flex: 1, border: "2px solid black", borderRadius: "4px", padding: "2px 6px", fontSize: "12px", outline: "none", minWidth: "0" }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label style={{ fontSize: "9px", textTransform: "uppercase" }}>Goal Type</label>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setGoalType("total")}
                  style={{
                    flex: 1, border: "2px solid black", borderRadius: "6px", padding: "2px 0", fontSize: "10px", fontWeight: 900, cursor: "pointer",
                    background: goalType === "total" ? "black" : "white", color: goalType === "total" ? "white" : "black", boxShadow: goalType === "total" ? "none" : "1px 1px 0 0 #000",
                  }}
                >
                  TOTAL
                </button>
                <button
                  onClick={() => setGoalType("avg")}
                  style={{
                    flex: 1, border: "2px solid black", borderRadius: "6px", padding: "2px 0", fontSize: "10px", fontWeight: 900, cursor: "pointer",
                    background: goalType === "avg" ? "black" : "white", color: goalType === "avg" ? "white" : "black", boxShadow: goalType === "avg" ? "none" : "1px 1px 0 0 #000",
                  }}
                >
                  AVERAGE
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label style={{ fontSize: "9px", textTransform: "uppercase" }}>Duration</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {/* Number Toggle */}
                <div style={{ display: "flex", flex: 1, border: "2px solid black", borderRadius: "6px", overflow: "hidden", background: "#fff" }}>
                  {[1, 2, 3].map(val => (
                    <button
                      key={val}
                      onClick={() => setGoalDurationValue(val)}
                      style={{
                        flex: 1,
                        background: goalDurationValue === val ? "black" : "white",
                        color: goalDurationValue === val ? "white" : "black",
                        border: "none",
                        borderRight: val < 3 ? "2px solid black" : "none",
                        padding: "2px 0",
                        fontSize: "10px",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {/* Unit Toggle */}
                <div style={{ display: "flex", flex: 1, border: "2px solid black", borderRadius: "6px", overflow: "hidden", background: "#fff" }}>
                  {[{id: "wk", label: "WEEK"}, {id: "mo", label: "MONTH"}].map(unit => (
                    <button
                      key={unit.id}
                      onClick={() => setGoalDurationUnit(unit.id as "wk"|"mo")}
                      style={{
                        flex: 1,
                        background: goalDurationUnit === unit.id ? "black" : "white",
                        color: goalDurationUnit === unit.id ? "white" : "black",
                        border: "none",
                        borderRight: unit.id === "wk" ? "2px solid black" : "none",
                        padding: "2px 0",
                        fontSize: "10px",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
              <button 
                onClick={() => setActiveGoalPrompt(null)}
                style={{
                 flex: 1,
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 height: "28px",
                 background: "#fff",
                 border: "2px solid #000",
                 borderRadius: "6px",
                 fontSize: "10px",
                 fontWeight: 900,
                 textTransform: "uppercase",
                 cursor: "pointer",
                 boxShadow: "2px 2px 0 0 #000",
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGoal}
                style={{
                 flex: 1,
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 height: "28px",
                 background: "#4FFF5B",
                 border: "2px solid #000",
                 borderRadius: "6px",
                 fontSize: "10px",
                 fontWeight: 900,
                 textTransform: "uppercase",
                 cursor: "pointer",
                 boxShadow: "2px 2px 0 0 #000",
                }}
              >
                Save
              </button>
            </div>
          </div>
        )})()}
      </div>
    </WidgetShell>
  )
}
