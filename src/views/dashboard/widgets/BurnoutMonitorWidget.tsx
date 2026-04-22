import React, { useState, useEffect, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { Heart, Coffee, Flame, Trophy, Plus } from "lucide-react"

const STORAGE_KEY = "vt_burnout_monitor"

interface BurnoutState {
 restDays: string[]  // ISO date strings
 streakStart: string | null
}

export const BurnoutMonitorWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const [state, setState] = useState<BurnoutState>(() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"restDays":[],"streakStart":null}') }
  catch { return { restDays: [], streakStart: null } }
 })

 useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

 const todayKey = new Date().toISOString().split("T")[0]

 // Calculate stress score (0-100)
 const stressData = useMemo(() => {
  const rows = data.canonicalRows || []
  const now = Date.now()

  // Upload frequency last 14 days
  const recentUploads = rows.filter((r: any) => {
   const d = new Date(r.uploadDate)
   return !isNaN(d.getTime()) && (now - d.getTime()) < 14 * 86400000
  }).length

  // Days since last rest
  const sortedRest = [...state.restDays].sort().reverse()
  const lastRest = sortedRest[0] ? new Date(sortedRest[0]) : null
  const daysSinceRest = lastRest ? Math.floor((now - lastRest.getTime()) / 86400000) : 14

  // Upload streak
  let streak = 0
  for (let i = 0; i < 52; i++) {
   const weekStart = new Date(now - i * 7 * 86400000)
   const weekEnd = new Date(now - (i - 1) * 7 * 86400000)
   const hasUpload = rows.some((r: any) => {
    const d = new Date(r.uploadDate)
    return d >= weekStart && d < weekEnd
   })
   if (hasUpload) streak++; else break
  }

  // Stress factors
  const uploadStress = Math.min(40, recentUploads * 6)  // More uploads = more stress
  const restStress = Math.min(35, daysSinceRest * 2.5)  // No rest = stress
  const monotonyStress = Math.min(25, Math.max(0, streak - 4) * 5) // Long streaks need variety

  const score = Math.min(100, Math.round(uploadStress + restStress + monotonyStress))

  return { score, recentUploads, daysSinceRest, streak, uploadStress, restStress, monotonyStress }
 }, [data.canonicalRows, state.restDays])

 const getGaugeColor = (score: number) => {
  if (score <= 30) return "#4FFF5B"
  if (score <= 60) return "#FFE357"
  if (score <= 80) return "#FFB570"
  return "#FF1744"
 }

 const getLabel = (score: number) => {
  if (score <= 30) return "Fresh"
  if (score <= 60) return "Warming Up"
  if (score <= 80) return "Getting Hot"
  return "Burnout Risk"
 }

 const getTip = (score: number) => {
  if (score <= 30) return "Great balance! Keep up the current pace."
  if (score <= 60) return "Consider scheduling a rest day this week."
  if (score <= 80) return "You're pushing hard. Take a break before quality drops."
  return "⚠️ High burnout risk. Take tomorrow off. Batch content instead of daily grinding."
 }

 const markRestDay = () => {
  if (!state.restDays.includes(todayKey)) {
   setState(prev => ({ ...prev, restDays: [...prev.restDays, todayKey] }))
  }
 }

 const isResting = state.restDays.includes(todayKey)

 return (
  <WidgetShell {...common} icon={<Heart size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%", alignItems: "center" }}>
    {/* Gauge */}
    <div style={{ position: "relative", width: "100px", height: "60px" }}>
     <svg width="100" height="60" viewBox="0 0 100 60">
      {/* Background arc */}
      <path d="M10,55 A40,40 0 0,1 90,55" fill="none" stroke="#eee" strokeWidth="8" strokeLinecap="round" />
      {/* Filled arc */}
      <path d="M10,55 A40,40 0 0,1 90,55" fill="none"
       stroke={getGaugeColor(stressData.score)} strokeWidth="8" strokeLinecap="round"
       strokeDasharray={`${stressData.score * 1.25} 125`}
       style={{ transition: "stroke-dasharray 0.5s, stroke 0.5s" }}
      />
     </svg>
     <div style={{ position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
      <div style={{ fontSize: "20px", fontWeight: 1000, color: getGaugeColor(stressData.score) }}>{stressData.score}</div>
      <div style={{ fontSize: "7px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>{getLabel(stressData.score)}</div>
     </div>
    </div>

    {/* Stats Row */}
    <div style={{ display: "flex", gap: "6px", width: "100%" }}>
     <div style={{ flex: 1, padding: "4px", border: "2px solid #000", borderRadius: "6px", textAlign: "center", background: "#fff" }}>
      <Flame size={12} style={{ margin: "0 auto" }} />
      <div style={{ fontSize: "12px", fontWeight: 1000 }}>{stressData.streak}</div>
      <div style={{ fontSize: "6px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>Week Streak</div>
     </div>
     <div style={{ flex: 1, padding: "4px", border: "2px solid #000", borderRadius: "6px", textAlign: "center", background: "#fff" }}>
      <Trophy size={12} style={{ margin: "0 auto" }} />
      <div style={{ fontSize: "12px", fontWeight: 1000 }}>{stressData.recentUploads}</div>
      <div style={{ fontSize: "6px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>14d Uploads</div>
     </div>
     <div style={{ flex: 1, padding: "4px", border: "2px solid #000", borderRadius: "6px", textAlign: "center", background: "#fff" }}>
      <Coffee size={12} style={{ margin: "0 auto" }} />
      <div style={{ fontSize: "12px", fontWeight: 1000 }}>{stressData.daysSinceRest}d</div>
      <div style={{ fontSize: "6px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>Since Rest</div>
     </div>
    </div>

    {/* Tip */}
    <div style={{ width: "100%", padding: "8px", border: "2px solid #000", borderRadius: "8px", background: "rgba(255,228,87,0.1)", fontSize: "10px", fontWeight: 700, lineHeight: 1.4 }}>
     {getTip(stressData.score)}
    </div>

    {/* Rest Day Button */}
    <button onClick={markRestDay} disabled={isResting} style={{
     width: "100%", height: "32px", border: "2px solid #000", borderRadius: "8px",
     background: isResting ? "#4FFF5B" : "#fff", fontSize: "10px", fontWeight: 1000,
     textTransform: "uppercase", cursor: isResting ? "default" : "pointer",
     display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
     boxShadow: "2px 2px 0 0 #000",
    }}>
     {isResting ? <><Heart size={12} fill="#000" /> Resting Today!</> : <><Plus size={12} /> Mark Rest Day</>}
    </button>
   </div>
  </WidgetShell>
 )
}
