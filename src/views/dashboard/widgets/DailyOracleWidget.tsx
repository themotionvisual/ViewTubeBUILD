import React, { useState, useEffect, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { useEntitlement } from "../../../app/AppShell"
import { Sparkles, Zap, ArrowRight, Check, RefreshCw } from "lucide-react"
import { useBrain } from "../../../context/GlobalDataContext"
import { generateOracleAdvice } from "../../../services/gemini"
import { canAffordAiTokensFromState } from "../../../services/billingEntitlement"
import { getAiTokenCost } from "../../../services/aiTokenCosts"

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

function generateAdvice(data: any): OracleState {
 const rows = data.canonicalRows || []
 const stats = data.statBlocks || []
 const viewsBlock = stats.find((s: any) => s.label.toLowerCase().includes("views"))
 const revenueBlock = stats.find((s: any) => s.label.toLowerCase().includes("revenue"))
 const subsBlock = stats.find((s: any) => s.label.toLowerCase().includes("subscribers"))

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
  priorities.push({
   text: `You haven't uploaded in over 2 weeks. Impressions decay rapidly after 7 days of inactivity. Record something today, even if it's a Short.`,
   timeframe: "Today", color: "#FF8AAF", shadowColor: "rgba(255,138,175,0.5)", action: "Upload", completed: false,
  })
 } else {
  priorities.push({
   text: `You have ${recentUploads.length} recent uploads — good cadence. Focus on doubling down on your top format: analyze which video type gets the best engagement rate and do more of that.`,
   timeframe: "This week", color: "#579AFF", shadowColor: "rgba(87,154,255,0.5)", action: "Analyze", completed: false,
  })
 }

 // Priority 2: Title optimization
 if (avgTitleLen > 60) {
  priorities.push({
   text: `Your average title length is ${Math.round(avgTitleLen)} characters — YouTube truncates at ~60 on mobile. Rewrite your last 5 titles to be punchier with emotional power words and specific outcomes.`,
   timeframe: "2-3 days", color: "#FF8AAF", shadowColor: "rgba(255,138,175,0.5)", action: "Fix", completed: false,
  })
 } else {
  priorities.push({
   text: `Revenue is at ${revenueBlock?.value || "$0"} this period. Increase monetized watch time by adding timestamps and end screens to your top 10 videos — this chains viewing sessions and boosts ad impressions.`,
   timeframe: "1-2 weeks", color: "#579AFF", shadowColor: "rgba(87,154,255,0.5)", action: "Plan", completed: false,
  })
 }

 // Quick Wins
 quickWins.push({
  text: "Add end screens to your top 5 videos — they currently drive 0 extra views without them.",
  timeframe: "20 min", color: "#FFFF61", shadowColor: "rgba(255,255,97,0.5)", action: "Go", completed: false,
 })
 quickWins.push({
  text: "Pin a comment on your latest video asking viewers a direct question to boost engagement signals.",
  timeframe: "5 min", color: "#40C6E9", shadowColor: "rgba(64,198,233,0.5)", action: "Post", completed: false,
 })
 quickWins.push({
  text: "Create a Community Tab poll with your top 3 backlog ideas as options — algorithms love poll engagement.",
  timeframe: "10 min", color: "#FF83EA", shadowColor: "rgba(255,131,234,0.5)", action: "Poll", completed: false,
 })

 return {
  dateKey: new Date().toISOString().split("T")[0],
  priorities,
  quickWins,
 }
}

export const DailyOracleWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const { brain } = useBrain()
 const ORACLE_COST = getAiTokenCost("dailyOracleRefresh")
 const entitlement = useEntitlement()
 const canAffordOracle = canAffordAiTokensFromState(entitlement, ORACLE_COST)
 const [isGenerating, setIsGenerating] = useState(false)
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const todayKey = new Date().toISOString().split("T")[0]

 const [oracle, setOracle] = useState<OracleState>(() => {
  try {
   const saved = JSON.parse(localStorage.getItem(ORACLE_STORAGE_KEY) || "{}")
   if (saved.dateKey === todayKey) return saved
  } catch {}
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

  const regenerate = async () => {
   if (!canAffordOracle) return
   setIsGenerating(true)
   try {
    const fresh = await generateOracleAdvice(data, brain)
    setOracle(fresh)
   } catch (e) {
    console.error("Oracle failed:", e)
    const fallback = generateAdvice(data)
    setOracle(fallback)
   } finally {
    setIsGenerating(false)
   }
  }

 const renderAdviceCard = (advice: OracleAdvice, idx: number, type: "priorities" | "quickWins") => {
  const isPriority = type === "priorities"
  return (
   <div
    key={idx}
    style={{
     display: "flex", background: advice.completed ? "#f0f0f0" : "#fff",
     border: `${isPriority ? 3 : 2}px solid #000`, borderRadius: "12px",
     overflow: "hidden", boxShadow: `3px 3px 0 0 ${advice.shadowColor}`,
     opacity: advice.completed ? 0.5 : 1, transition: "all 0.2s",
    }}>
    {isPriority && <div style={{ width: "6px", background: advice.color, flexShrink: 0 }} />}
    {!isPriority && <div style={{ width: "10px", height: "36px", borderRadius: "999px", border: "2px solid #000", background: advice.color, flexShrink: 0, margin: "auto 0 auto 12px" }} />}
    <div style={{ flex: 1, padding: isPriority ? "12px" : "10px 12px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
     <div style={{ flex: 1 }}>
      <div style={{
       fontWeight: 700, fontSize: isPriority ? "12px" : "11px", lineHeight: 1.4,
       textDecoration: advice.completed ? "line-through" : "none",
      }}>
       {advice.text}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
       <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.35 }}>⏱ {advice.timeframe}</span>
      </div>
     </div>
     <button
      onClick={() => toggleComplete(type, idx)}
      style={{
       width: isPriority ? "40px" : "32px", height: isPriority ? "40px" : "32px",
       borderRadius: "10px", border: `${isPriority ? 3 : 2}px solid #000`,
       background: advice.completed ? "#4FFF5B" : advice.color,
       display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
       gap: "1px", flexShrink: 0, boxShadow: "2px 2px 0 0 #000", cursor: "pointer",
      }}>
      {advice.completed ? <Check size={14} strokeWidth={4} /> : <ArrowRight size={14} strokeWidth={4} />}
      {!advice.completed && <span style={{ fontSize: "6px", fontWeight: 900, textTransform: "uppercase" }}>{advice.action}</span>}
     </button>
    </div>
   </div>
  )
 }

 const completedCount = [...oracle.priorities, ...oracle.quickWins].filter(a => a.completed).length
 const totalCount = oracle.priorities.length + oracle.quickWins.length

 return (
  <WidgetShell
   {...common}
   icon={<Sparkles size={22} />}
   hasAI
   aiCost={ORACLE_COST}
   aiDisabled={!canAffordOracle || isGenerating}
   aiDisabledReason={!canAffordOracle ? (entitlement.tier === "free" ? "Upgrade required for Oracle AI." : `Need ${ORACLE_COST} token.`) : undefined}
   onRegenerate={regenerate}>
   <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%", overflowY: "auto" }}>
    {/* Header Row */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
     <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Sparkles size={14} color="#FF8AAF" />
      <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", color: "#FF8AAF" }}>Strategic Priorities</span>
     </div>
     <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.4 }}>{completedCount}/{totalCount}</span>
       <button 
        onClick={regenerate} 
        disabled={isGenerating || !canAffordOracle}
        title="Regenerate advice" 
        style={{ 
          width: "24px", height: "24px", border: "2px solid #000", borderRadius: "6px", 
          background: "#fff", cursor: isGenerating ? "wait" : "pointer", 
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: isGenerating ? 0.5 : 1
        }}>
        <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} />
       </button>
     </div>
    </div>
    {!canAffordOracle && (
     <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>
      {entitlement.tier === "free" ? "Upgrade for Oracle AI." : `Need ${ORACLE_COST} token.`}
     </div>
    )}

    {/* Priorities */}
    {oracle.priorities.map((p, i) => renderAdviceCard(p, i, "priorities"))}

    {/* Quick Wins Header */}
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
     <Zap size={14} color="#4FFF5B" />
     <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>Quick Wins (20-30 min)</span>
    </div>

    {/* Quick Wins */}
    {oracle.quickWins.map((w, i) => renderAdviceCard(w, i, "quickWins"))}
   </div>
  </WidgetShell>
 )
}
