import React, { useState, useEffect, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { Calendar, Clock, Sparkles } from "lucide-react"

const STORAGE_KEY = "vt_upload_schedule"

interface ScheduleEntry {
 dateKey: string
 time: string
 videoTitle: string
}

export const UploadSchedulerWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") } catch { return [] }
 })
 const [editingDay, setEditingDay] = useState<string | null>(null)
 const [editTitle, setEditTitle] = useState("")
 const [editTime, setEditTime] = useState("12:00")

 useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule)) }, [schedule])

 const next7Days = useMemo(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
   const d = new Date()
   d.setDate(d.getDate() + i)
   d.setHours(0, 0, 0, 0)
   const key = d.toISOString().split("T")[0]
   const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en", { weekday: "short" })
   const dateNum = d.getDate()
   days.push({ key, dayName, dateNum, date: d })
  }
  return days
 }, [])

 const addToSchedule = (dateKey: string) => {
  if (!editTitle.trim()) return
  setSchedule(prev => [...prev.filter(s => s.dateKey !== dateKey), { dateKey, time: editTime, videoTitle: editTitle.trim() }])
  setEditingDay(null)
  setEditTitle("")
 }

 const removeFromSchedule = (dateKey: string) => {
  setSchedule(prev => prev.filter(s => s.dateKey !== dateKey))
 }

 // Best slots from publish momentum data (simple heuristic)
 const bestSlots = useMemo(() => {
  const rows = data.canonicalRows || []
  const dayCounts: Record<number, number> = {}
  rows.forEach((r: any) => {
   const d = new Date(r.uploadDate)
   if (!isNaN(d.getTime())) dayCounts[d.getDay()] = (dayCounts[d.getDay()] || 0) + 1
  })
  return dayCounts
 }, [data.canonicalRows])

 return (
  <WidgetShell {...common} icon={<Calendar size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "6px", height: "100%" }}>
    <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5, display: "flex", justifyContent: "space-between" }}>
     <span>Next 7 Days</span>
     <span>{schedule.length} Scheduled</span>
    </div>

    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "auto" }}>
     {next7Days.map((day) => {
      const entry = schedule.find(s => s.dateKey === day.key)
      const isEditing = editingDay === day.key
      const isBestDay = bestSlots[day.date.getDay()] > 2

      return (
       <div key={day.key} style={{ border: "2px solid #000", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{
         display: "flex", alignItems: "center", padding: "6px 8px", gap: "8px",
         background: entry ? "rgba(79,255,91,0.1)" : "#fff", cursor: "pointer",
        }} onClick={() => { if (!entry) { setEditingDay(isEditing ? null : day.key); setEditTitle(""); setEditTime("12:00") } }}>
         <div style={{
          width: "28px", height: "28px", borderRadius: "6px", border: "2px solid #000",
          background: entry ? "#4FFF5B" : isBestDay ? "#FFE357" : "#f5f5f5",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
         }}>
          <span style={{ fontSize: "10px", fontWeight: 1000, lineHeight: 1 }}>{day.dateNum}</span>
          <span style={{ fontSize: "6px", fontWeight: 900, opacity: 0.5, textTransform: "uppercase" }}>{day.dayName.slice(0, 3)}</span>
         </div>
         <div style={{ flex: 1, minWidth: 0 }}>
          {entry ? (
           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={10} opacity={0.5} />
            <span style={{ fontSize: "9px", fontWeight: 900, opacity: 0.5 }}>{entry.time}</span>
            <span style={{ fontSize: "11px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.videoTitle}</span>
           </div>
          ) : (
           <span style={{ fontSize: "9px", fontWeight: 700, opacity: 0.2 }}>
            {isBestDay ? "⭐ Best upload day" : "Click to schedule"}
           </span>
          )}
         </div>
         {entry && (
          <button onClick={(e) => { e.stopPropagation(); removeFromSchedule(day.key) }} style={{
           fontSize: "8px", fontWeight: 900, background: "none", border: "1px solid rgba(0,0,0,0.2)",
           borderRadius: "4px", padding: "2px 4px", cursor: "pointer", opacity: 0.5,
          }}>✕</button>
         )}
        </div>
        {isEditing && (
         <div style={{ padding: "6px 8px", borderTop: "1px solid #000", display: "flex", gap: "4px", background: "#f9f9f9" }}>
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Video title..." style={{
           flex: 1, padding: "4px 6px", border: "1px solid #000", borderRadius: "4px", fontSize: "10px", fontWeight: 700, outline: "none",
          }} />
          <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} style={{
           width: "60px", padding: "4px", border: "1px solid #000", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
          }} />
          <button onClick={() => addToSchedule(day.key)} style={{
           padding: "4px 8px", background: "#4FFF5B", border: "1px solid #000", borderRadius: "4px",
           fontSize: "8px", fontWeight: 1000, cursor: "pointer", textTransform: "uppercase",
          }}>Set</button>
         </div>
        )}
       </div>
      )
     })}
    </div>
   </div>
  </WidgetShell>
 )
}
