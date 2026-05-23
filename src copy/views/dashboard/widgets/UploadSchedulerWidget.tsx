import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { WidgetShell } from "../WidgetShell"
import { Calendar, Clock, Sparkles, Upload, FileVideo, ArrowRight, Pencil, X, Star, Zap } from "lucide-react"

const STORAGE_KEY = "vt_upload_schedule"
const UPLOAD_FILES_KEY = "vt_uploaded_files"

interface ScheduleEntry {
 dateKey: string
 time: string
 videoTitle: string
}

interface UploadedFile {
 name: string
 size: number
 addedAt: number
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOUR_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"]

export const UploadSchedulerWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
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

 // --- Upload State ---
 const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
  try { return JSON.parse(localStorage.getItem(UPLOAD_FILES_KEY) || "[]") } catch { return [] }
 })
 const [isDragOver, setIsDragOver] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)

 // --- Schedule State ---
 const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") } catch { return [] }
 })

 // --- View State ---
 const [view, setView] = useState<"upload" | "times" | "schedule">("upload")

 useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule)) }, [schedule])
 useEffect(() => { localStorage.setItem(UPLOAD_FILES_KEY, JSON.stringify(uploadedFiles)) }, [uploadedFiles])

 // --- Best upload times from historical data ---
 const recommendedSlots = useMemo(() => {
  const rows = data.canonicalRows || []
  const dayHourBuckets: Record<string, { views: number; count: number }> = {}

  rows.forEach((r: any) => {
   const d = new Date(r.uploadDate || r.publishedAt || r.Date)
   if (isNaN(d.getTime())) return
   const dayOfWeek = d.getDay()
   const hour = d.getHours()
   const bucket = Math.floor(hour / 3) // 0-7 (8 buckets of 3 hours)
   const key = `${dayOfWeek}-${bucket}`
   if (!dayHourBuckets[key]) dayHourBuckets[key] = { views: 0, count: 0 }
   dayHourBuckets[key].views += (r.views || 0)
   dayHourBuckets[key].count += 1
  })

  // Sort by performance (views per upload)
  const ranked = Object.entries(dayHourBuckets)
   .map(([key, val]) => {
    const [day, bucket] = key.split("-").map(Number)
    return { day, bucket, avgViews: val.count > 0 ? val.views / val.count : 0, count: val.count }
   })
   .filter(s => s.count >= 1)
   .sort((a, b) => b.avgViews - a.avgViews)
   .slice(0, 5)

  // Map to next 7 days
  const today = new Date()
  const todayDay = today.getDay()
  const results: { date: Date; dateKey: string; dayName: string; dateNum: number; timeLabel: string; avgViews: number; rank: number }[] = []

  ranked.forEach((slot, idx) => {
   let daysUntil = slot.day - todayDay
   if (daysUntil < 0) daysUntil += 7
   if (daysUntil === 0) daysUntil = 7 // push to next week if today already
   const targetDate = new Date(today)
   targetDate.setDate(today.getDate() + daysUntil)
   targetDate.setHours(slot.bucket * 3, 0, 0, 0)

   const hourStart = slot.bucket * 3
   const hourEnd = hourStart + 3
   const fmt = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}${ampm}`
   }

   results.push({
    date: targetDate,
    dateKey: targetDate.toISOString().split("T")[0],
    dayName: daysUntil <= 1 ? (daysUntil === 0 ? "Today" : "Tomorrow") : DAY_NAMES[slot.day],
    dateNum: targetDate.getDate(),
    timeLabel: `${fmt(hourStart)}–${fmt(hourEnd)}`,
    avgViews: Math.round(slot.avgViews),
    rank: idx + 1,
   })
  })

  // If no data, generate smart defaults
  if (results.length === 0) {
   const defaults = [
    { dayOffset: 2, hour: 15, label: "3PM–6PM" },
    { dayOffset: 4, hour: 12, label: "12PM–3PM" },
    { dayOffset: 5, hour: 9, label: "9AM–12PM" },
    { dayOffset: 6, hour: 18, label: "6PM–9PM" },
   ]
   defaults.forEach((d, idx) => {
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + d.dayOffset)
    results.push({date: targetDate, dateKey: targetDate.toISOString().split("T")[0], dayName: DAY_NAMES[targetDate.getDay()], dateNum: targetDate.getDate(), timeLabel: d.label, avgViews: 0, rank: idx + 1, onDecSize, onCycleHeight, onDecHeight})
   })
  }

  return results
 }, [data.canonicalRows])

 // --- Drag and Drop ---
 const handleDragOver = useCallback((e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragOver(true)
 }, [])

 const handleDragLeave = useCallback((e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragOver(false)
 }, [])

 const handleDrop = useCallback((e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragOver(false)
  const files = Array.from(e.dataTransfer.files)
  const videoFiles = files.filter(f => f.type.startsWith("video/") || f.name.match(/\.(mp4|mov|avi|mkv|webm)$/i))
  if (videoFiles.length === 0) return
  const newFiles: UploadedFile[] = videoFiles.map(f => ({name: f.name, size: f.size, addedAt: Date.now(), onDecSize, onCycleHeight, onDecHeight}))
  setUploadedFiles(prev => [...prev, ...newFiles])
  setView("times") // auto-advance to recommended times
 }, [])

 const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return
  const newFiles: UploadedFile[] = files.map(f => ({name: f.name, size: f.size, addedAt: Date.now(), onDecSize, onCycleHeight, onDecHeight}))
  setUploadedFiles(prev => [...prev, ...newFiles])
  setView("times")
  if (fileInputRef.current) fileInputRef.current.value = ""
 }, [])

 const removeFile = (idx: number) => {
  setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
 }

 const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
 }

 // --- Navigate to Data Edit Widget ---
 const navigateToDataEdit = (videoTitle?: string) => {
  // Dispatch a custom event that the dashboard can listen for to scroll to / focus the data-edit widget
  window.dispatchEvent(new CustomEvent("vt_navigate_widget", {
   detail: { targetWidget: "data-edit", videoTitle: videoTitle || uploadedFiles[0]?.name || "" }
  }))
  // Also scroll to the widget if it exists in the DOM
  const el = document.querySelector("[data-widget-id='data-edit']")
  if (el) {
   el.scrollIntoView({behavior: "smooth", block: "center", onDecSize, onCycleHeight, onDecHeight})
   // Flash highlight
   ;(el as HTMLElement).style.outline = "3px solid var(--widget-color, #FFD700)"
   setTimeout(() => { (el as HTMLElement).style.outline = "" }, 2000)
  }
 }

 const selectTimeSlot = (slot: typeof recommendedSlots[0]) => {
  const title = uploadedFiles[uploadedFiles.length - 1]?.name?.replace(/\.[^.]+$/, "") || "Untitled Video"
  setSchedule(prev => [
   ...prev.filter(s => s.dateKey !== slot.dateKey),
   { dateKey: slot.dateKey, time: slot.timeLabel.split("–")[0], videoTitle: title }
  ])
  setView("schedule")
 }

 return (
  <WidgetShell {...common} icon={<Calendar size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "6px", height: "100%" }}>

    {/* Tab Bar */}
    <div style={{ display: "flex", gap: "4px" }}>
     {[
      { key: "upload" as const, label: "Upload", icon: <Upload size={12} strokeWidth={2.5} /> },
      { key: "times" as const, label: "Best Times", icon: <Sparkles size={12} strokeWidth={2.5} /> },
      { key: "schedule" as const, label: `Queue (${schedule.length})`, icon: <Clock size={12} strokeWidth={2.5} /> },
     ].map(tab => (
      <button
       key={tab.key}
       className="vt-tab-button"
       onClick={() => setView(tab.key)}
       style={{
        flex: 1,
        padding: "6px 4px",
        fontSize: "8px",
        fontWeight: 900,
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        background: view === tab.key ? "color-mix(in srgb, var(--widget-color, #FFD700) 30%, white)" : "#fff",
        border: `2px solid color-mix(in srgb, var(--widget-color, #FFD700) 60%, black)`,
        borderRadius: "6px",
        cursor: "pointer",
        color: view === tab.key ? "color-mix(in srgb, var(--widget-color, #FFD700) 60%, black)" : "rgba(0,0,0,0.4)",
        transition: "all 0.15s ease",
       }}
      >
       {tab.icon} {tab.label}
      </button>
     ))}
    </div>

    {/* === UPLOAD VIEW === */}
    {view === "upload" && (
     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", overflow: "auto" }}>

      {/* Drop Zone */}
      {uploadedFiles.length === 0 && (
       <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
         flex: 1,
         minHeight: "80px",
         border: `2px dashed ${isDragOver ? "color-mix(in srgb, var(--widget-color, #FFD700) 60%, black)" : "rgba(0,0,0,0.15)"}`,
         borderRadius: "10px",
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         justifyContent: "center",
         gap: "6px",
         cursor: "pointer",
         background: isDragOver ? "color-mix(in srgb, var(--widget-color, #FFD700) 15%, white)" : "#fafafa",
         transition: "all 0.2s ease",
         padding: "12px",
        }}
       >
        <Upload size={24} strokeWidth={2} style={{ opacity: isDragOver ? 1 : 0.3 }} />
        <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: isDragOver ? 1 : 0.35 }}>
         {isDragOver ? "Drop video here" : "Drag & Drop or Click to Upload"}
        </span>
        <span style={{ fontSize: "8px", fontWeight: 700, opacity: 0.2 }}>MP4, MOV, AVI, MKV, WEBM</span>
        <input
         ref={fileInputRef}
         type="file"
         accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
         multiple
         onChange={handleFileSelect}
         style={{ display: "none" }}
        />
       </div>
      )}

      {/* Uploaded File List */}
      {uploadedFiles.length > 0 && (
       <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>
         {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} ready
        </span>
        {uploadedFiles.map((f, idx) => (
         <div key={idx} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 8px", borderRadius: "8px",
          border: "2px solid color-mix(in srgb, var(--widget-color, #FFD700) 60%, black)",
          background: "#fff", fontSize: "10px",
         }}>
          <FileVideo size={14} strokeWidth={2.5} style={{ flexShrink: 0, opacity: 0.5 }} />
          <span style={{ flex: 1, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
           {f.name}
          </span>
          <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.3, flexShrink: 0 }}>{formatSize(f.size)}</span>
          <button onClick={(e) => { e.stopPropagation(); removeFile(idx) }} style={{
           background: "none", border: "none", cursor: "pointer", opacity: 0.4, display: "flex", padding: "2px",
          }}><X size={12} strokeWidth={3} /></button>
         </div>
        ))}

        {/* Clear/Reset Button */}
        <button
         className="vt-button"
         onClick={() => setUploadedFiles([])}
         style={{ marginTop: "4px", padding: "6px", fontSize: "9px" }}
        >
         <X size={12} strokeWidth={3} /> Clear / Upload Another
        </button>

        {/* Proceed to Times Button */}
        <button
         className="vt-button primary"
         onClick={() => setView("times")}
         style={{ marginTop: "4px", padding: "8px", fontSize: "10px" }}
        >
         <Sparkles size={14} strokeWidth={2.5} /> Pick Best Upload Time
        </button>
       </div>
      )}
     </div>
    )}

    {/* === RECOMMENDED TIMES VIEW === */}
    {view === "times" && (
     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "auto" }}>
      <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>
       ⭐ Recommended upload windows (next 7 days)
      </span>
      {recommendedSlots.map((slot, idx) => (
       <button
        key={idx}
        className="vt-button"
        onClick={() => selectTimeSlot(slot)}
        style={{
         width: "100%",
         padding: "8px 10px",
         justifyContent: "flex-start",
         gap: "8px",
         background: idx === 0 ? "color-mix(in srgb, var(--widget-color, #FFD700) 25%, white)" : "#fff",
        }}
       >
        <span style={{
         width: "20px", height: "20px", borderRadius: "6px",
         background: idx === 0 ? "color-mix(in srgb, var(--widget-color, #FFD700) 80%, black)" : "rgba(0,0,0,0.08)",
         display: "flex", alignItems: "center", justifyContent: "center",
         fontSize: "9px", fontWeight: 1000, color: idx === 0 ? "#fff" : "#000",
        }}>
         {idx === 0 ? <Star size={10} fill="currentColor" /> : idx + 1}
        </span>
        <span style={{ fontSize: "11px", fontWeight: 900, minWidth: "36px" }}>{slot.dayName}</span>
        <span style={{ fontSize: "9px", fontWeight: 900, opacity: 0.5 }}>{slot.dateNum}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "10px", fontWeight: 900 }}>{slot.timeLabel}</span>
        {slot.avgViews > 0 && (
         <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.3 }}>~{slot.avgViews.toLocaleString()} views</span>
        )}
       </button>
      ))}

      {/* Skip and go to edit */}
      <button
       className="vt-button"
       onClick={() => navigateToDataEdit()}
       style={{ marginTop: "auto", padding: "8px", fontSize: "10px" }}
      >
       <Pencil size={12} strokeWidth={2.5} /> Edit Video Details & Publish
      </button>
     </div>
    )}

    {/* === SCHEDULE QUEUE VIEW === */}
    {view === "schedule" && (
     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "auto" }}>
      {schedule.length === 0 ? (
       <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        border: "2px dashed rgba(0,0,0,0.1)", borderRadius: "10px", gap: "6px",
       }}>
        <Clock size={20} style={{ opacity: 0.15 }} />
        <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.2 }}>
         No uploads scheduled
        </span>
        <button className="vt-button" onClick={() => setView("upload")} style={{ padding: "6px 12px", fontSize: "9px" }}>
         <Upload size={12} /> Upload a Video
        </button>
       </div>
      ) : (
       <>
        <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>
         {schedule.length} scheduled
        </span>
        {schedule.map((entry, idx) => {
         const d = new Date(entry.dateKey + "T00:00:00")
         const dayName = DAY_NAMES[d.getDay()]
         return (
          <div key={idx} style={{
           display: "flex", alignItems: "center", gap: "8px",
           padding: "8px 10px",
           border: "2px solid color-mix(in srgb, var(--widget-color, #FFD700) 60%, black)",
           borderRadius: "8px",
           background: "color-mix(in srgb, var(--widget-color, #FFD700) 10%, white)",
          }}>
           <div style={{
            width: "36px", height: "36px",
            background: "color-mix(in srgb, var(--widget-color, #FFD700) 60%, white)",
            borderRadius: "8px",
            border: "2px solid color-mix(in srgb, var(--widget-color, #FFD700) 60%, black)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
           }}>
            <span style={{ fontSize: "8px", fontWeight: 1000, textTransform: "uppercase", lineHeight: 1 }}>{dayName}</span>
            <span style={{ fontSize: "13px", fontWeight: 1000, lineHeight: 1 }}>{d.getDate()}</span>
           </div>
           <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
             {entry.videoTitle}
            </div>
            <div style={{ fontSize: "9px", fontWeight: 900, opacity: 0.4 }}>
             <Clock size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
             {entry.time}
            </div>
           </div>
           <button
            className="vt-button"
            onClick={() => navigateToDataEdit(entry.videoTitle)}
            style={{ padding: "5px 8px", fontSize: "8px", flexShrink: 0 }}
           >
            <Pencil size={10} strokeWidth={2.5} /> Edit
           </button>
           <button
            onClick={() => setSchedule(prev => prev.filter((_, i) => i !== idx))}
            style={{
             background: "none", border: "none", cursor: "pointer", opacity: 0.3,
             display: "flex", padding: "2px", flexShrink: 0,
            }}
           >
            <X size={14} strokeWidth={3} />
           </button>
          </div>
         )
        })}

        {/* Edit Details CTA */}
        <button
         className="vt-button primary"
         onClick={() => navigateToDataEdit()}
         style={{ marginTop: "auto", padding: "8px", fontSize: "10px" }}
        >
         <Pencil size={14} strokeWidth={2.5} /> Edit Video Details & Publish
        </button>
       </>
      )}
     </div>
    )}
   </div>
  </WidgetShell>
 )
}
