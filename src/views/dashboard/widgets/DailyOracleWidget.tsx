import React, { useState, useEffect } from "react"
import { WidgetShell } from "../WidgetShell"
import { Sparkles, Zap, ArrowRight, Check, RefreshCw, Eye, Users, DollarSign, Heart, Clock3 } from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import type { DayTask } from "../../../types"

const ORACLE_STORAGE_KEY = "vt_daily_oracle"

interface OracleAdvice {
 text: string
 timeframe: string
 color: string
 shadowColor: string
 action: string
 completed: boolean
}

interface OracleState {
 dateKey: string
 priorities: OracleAdvice[]
 quickWins: OracleAdvice[]
}

type DailyOracleGoalMetric = "views" | "subscribers" | "revenue" | "engagement" | "watch-time"

const METRIC_TASKS: Record<DailyOracleGoalMetric, readonly string[]> = {
 views: ["Refresh the title and thumbnail promise on a recent video with low click-through rate.", "Create one searchable follow-up around a proven channel topic.", "Add an end screen from a top video to the strongest related upload.", "Publish one Community post that sends viewers to a relevant catalog video.", "Compare your top 3 videos and repeat the topic-hook combination with the highest reach."],
 subscribers: ["Add a clear subscriber payoff to the first 30 seconds of your next video.", "Pin a comment that asks viewers to subscribe for the next related upload.", "Turn a proven topic into a repeatable series with a named viewer promise.", "Improve the channel trailer or featured-video call to action.", "Reply to five high-intent comments with a useful next video recommendation."],
 revenue: ["Add end screens to the five videos with the strongest current watch time.", "Audit monetization eligibility and mid-roll opportunities on your longest videos.", "Create a follow-up that extends a proven revenue-driving topic.", "Improve the first minute of a high-value video to retain monetizable viewing.", "Link a relevant long-form video from a recent short or Community post."],
 engagement: ["Pin a question on the latest video that invites a specific viewer response.", "Publish a two-option Community poll based on current channel topics.", "Reply to five thoughtful comments with a follow-up question.", "Add one direct question near the end of a new upload.", "Turn a recurring audience question into a video or post."],
 "watch-time": ["Add an end screen that continues viewers to the most relevant next video.", "Review the first 30 seconds of a recent upload and sharpen its promise.", "Add timestamps to a long video so viewers can find value without leaving.", "Create a sequel around the topic with the strongest average view duration.", "Link a related playlist in the description and pinned comment."],
}

function generateAdvice(data: any): OracleState {
 const rows = data.canonicalRows || []
 const stats = data.statBlocks28d || []
 const revenueBlock = stats.find((s: any) => s.label.toLowerCase().includes("revenue"))

 // Analyze channel state to generate relevant advice
 const recentUploads = rows.filter((r: any) => {
  const d = new Date(r.uploadDate)
  return !isNaN(d.getTime()) && (Date.now() - d.getTime()) < 14 * 86400000
 })
 const hasRecentUpload = recentUploads.length > 0
 const avgTitleLen = rows.slice(0, 10).reduce((sum: number, r: any) => sum + (r.title?.length || 0), 0) / Math.max(1, Math.min(10, rows.length))

 const priorities: OracleAdvice[] = []
 const quickWins: OracleAdvice[] = []

 // Priority 1: Upload consistency
 if (!hasRecentUpload) {
  priorities.push({text: `You haven't uploaded in over 2 weeks. Impressions decay rapidly after 7 days of inactivity. Record something today, even if it's a Short.`, timeframe: "Today", color: "#FF8AAF", shadowColor: "rgba(255, 138, 175, 0.5)", action: "Upload", completed: false})
 } else {
  priorities.push({
   text: `You have ${recentUploads.length} recent uploads — good cadence. Focus on doubling down on your top format: analyze which video type gets the best engagement rate and do more of that.`,
   timeframe: "This week", color: "#579AFF", shadowColor: "rgba(87,154,255,0.5)", action: "Analyze", completed: false
  })
 }

 // Priority 2: Title optimization
 if (avgTitleLen > 60) {
  priorities.push({
   text: `Your average title length is ${Math.round(avgTitleLen)} characters — YouTube truncates at ~60 on mobile. Rewrite your last 5 titles to be punchier with emotional power words and specific outcomes.`,
   timeframe: "2-3 days", color: "#FF8AAF", shadowColor: "rgba(255,138,175,0.5)", action: "Fix", completed: false
  })
 } else {
  priorities.push({
   text: `Revenue is at ${revenueBlock?.value || "$0"} this period. Increase monetized watch time by adding timestamps and end screens to your top 10 videos — this chains viewing sessions and boosts ad impressions.`,
   timeframe: "1-2 weeks", color: "#579AFF", shadowColor: "rgba(87,154,255,0.5)", action: "Plan", completed: false
  })
 }

 // Quick Wins
 quickWins.push({text: "Add end screens to your top 5 videos — they currently drive 0 extra views without them.", timeframe: "20 min", color: "#FFFF61", shadowColor: "rgba(255, 255, 97, 0.5)", action: "Go", completed: false})
 quickWins.push({text: "Pin a comment on your latest video asking viewers a direct question to boost engagement signals.", timeframe: "5 min", color: "#40C6E9", shadowColor: "rgba(64, 198, 233, 0.5)", action: "Post", completed: false})
 quickWins.push({text: "Create a Community Tab poll with your top 3 backlog ideas as options — algorithms love poll engagement.", timeframe: "10 min", color: "#FF83EA", shadowColor: "rgba(255, 131, 234, 0.5)", action: "Poll", completed: false})

 return {
  dateKey: new Date().toISOString().split("T")[0],
  priorities,
  quickWins,
 }
}

export const DailyOracleWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
 const { setCalendarState } = useBrain()
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
 const todayKey = new Date().toISOString().split("T")[0]

 const [oracle, setOracle] = useState<OracleState>(() => {
  try {
   const saved = JSON.parse(localStorage.getItem(ORACLE_STORAGE_KEY) || "{}")
   if (saved.dateKey === todayKey) return saved
  } catch {
   // Ignore malformed legacy state and regenerate today's local advice.
  }
  return generateAdvice(data)
 })

 useEffect(() => {
  localStorage.setItem(ORACLE_STORAGE_KEY, JSON.stringify(oracle))
 }, [oracle])

 const toggleComplete = (type: "priorities" | "quickWins", idx: number) => {
  setOracle(prev => {
   const next = { ...prev, [type]: [...prev[type]] }
   next[type][idx] = { ...next[type][idx], completed: !next[type][idx].completed }
   return next
  })
 }

 const refresh = () => setOracle(generateAdvice(data))

 const focusMetric = (metric: DailyOracleGoalMetric) => {
  const dateKey = new Date().toISOString().slice(0, 10)
  const tasks: DayTask[] = METRIC_TASKS[metric].map((text, index) => ({
   id: `daily_oracle_${metric}_${Date.now()}_${index}`,
   text,
   completed: false,
   dueDate: dateKey,
  }))
  const existing = data.brain?.calendarState?.dayTasks?.[dateKey] || []
  setCalendarState({ dayTasks: { ...(data.brain?.calendarState?.dayTasks || {}), [dateKey]: [...existing, ...tasks] } })
  setOracle((current) => ({
   ...current,
   priorities: [{
    text: `${metric.replace("-", " ")} task pack added: ${tasks[0].text}`,
    timeframe: "Today",
    color: "#579AFF",
    shadowColor: "rgba(87,154,255,0.5)",
    action: "Review",
    completed: false,
   }, ...current.priorities].slice(0, 2),
  }))
 }

 const renderAdviceCard = (advice: OracleAdvice, idx: number, type: "priorities" | "quickWins") => {
  const isPriority = type === "priorities"
  return (
   <div
    key={idx}
    className="oracle-advice-card"
    style={{
     flexShrink: 0,
     display: "flex", background: advice.completed ? "color-mix(in srgb, var(--widget-color) 10%, white)" : "#fff",
     border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)", borderRadius: "4px",
     overflow: "hidden", boxShadow: `2px 2px 0 0 ${advice.shadowColor}`,
     opacity: advice.completed ? 0.78 : 1,
    }}>
    {isPriority && <div style={{ width: "6px", background: advice.color, flexShrink: 0 }} />}
    {!isPriority && <div style={{ width: "8px", borderRadius: "999px", background: advice.color, flexShrink: 0, margin: "8px 0 8px 10px" }} />}
    <div style={{ flex: 1, padding: isPriority ? "7px 8px" : "6px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
     <div style={{ flex: 1 }}>
      <div style={{
       fontWeight: 700, fontSize: isPriority ? "11px" : "10px", lineHeight: 1.4,
       textDecoration: "none",
      }}>
       {advice.text}
       <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4, marginLeft: "6px", display: "inline-block" }}>
        ⏱ {advice.timeframe}
       </span>
       {advice.completed ? <span className="oracle-outcome-copy">Verify the outcome in channel metrics, then repeat the approach that improved the result.</span> : null}
      </div>
     </div>
     <button
      onClick={() => toggleComplete(type, idx)}
      className="vt-button"
      style={{
       background: advice.completed ? "#4FFF5B" : advice.color,
       flexShrink: 0,
       width: "32px",
       height: "32px",
       padding: "0",
       flexDirection: "column",
       gap: "2px",
      }}>
      {advice.completed ? <Check size={16} strokeWidth={3} /> : <ArrowRight size={16} strokeWidth={3} />}
      {!advice.completed && <span style={{ fontSize: "7px", fontWeight: 900 }}>{advice.action}</span>}
     </button>
    </div>
   </div>
  )
 }

 return (
  <WidgetShell
   {...common}
   icon={<Sparkles size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%", minHeight: 0 }}>
    <div className="daily-oracle-actions" aria-label="Generate goal-focused tasks">
     <button type="button" className="vt-button is-icon-only" onClick={refresh} aria-label="Refresh daily guidance"><RefreshCw size={15} /></button>
     {([
      ["views", "Views", Eye], ["subscribers", "Subscribers", Users], ["revenue", "Revenue", DollarSign], ["engagement", "Engagement", Heart], ["watch-time", "Watch time", Clock3],
     ] as const).map(([id, label, Icon]) => <button key={id} type="button" className="vt-button" onClick={() => focusMetric(id)}><Icon size={13} />{label}</button>)}
    </div>
    <div className="daily-oracle-list">
     {/* Priorities */}
     {oracle.priorities.map((p, i) => renderAdviceCard(p, i, "priorities"))}

     {/* Quick Wins Header */}
     <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexShrink: 0 }}>
      <Zap size={14} color="#4FFF5B" />
      <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>Quick Wins (20-30 min)</span>
     </div>

     {/* Quick Wins */}
     {oracle.quickWins.map((w, i) => renderAdviceCard(w, i, "quickWins"))}
    </div>
   </div>
  </WidgetShell>
 )
}
