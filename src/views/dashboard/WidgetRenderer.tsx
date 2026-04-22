import React, { useState, useMemo } from "react"
import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  CheckSquare,
  Database,
  DollarSign,
  Grip,
  Layers,
  Star,
  TrendingUp,
  Upload,
  UserCircle2,
  Video,
  WandSparkles,
  X,
  Edit3,
  Lock,
  LockOpen,
  RotateCcw,
  Download,
  Settings,
  MoreVertical,
  Maximize2
 } from "lucide-react"
import { useVideoComments, type VideoComment } from "./useVideoComments"
import type { DashboardData } from "./useDashboardData"
import type {
 WidgetDefinition,
 WidgetRenderCallbacks,
 WidgetInstanceState,
} from "./types"
import { TagGeneratorWidget } from "./widgets/TagGeneratorWidget"
import { RevenueChartWidget } from "./widgets/RevenueChartWidget"
import { CommunityPostWidget } from "./widgets/CommunityPostWidget"
import { ThumbAIWidget } from "./widgets/ThumbAIWidget"
import { RealtimePerformanceWidget } from "./widgets/RealtimePerformanceWidget"
import { KeywordEngineWidget } from "./widgets/KeywordEngineWidget"
import { PublishMomentumWidget } from "./widgets/PublishMomentumWidget"
import { TrafficSourcesWidget } from "./widgets/TrafficSourcesWidget"
import { AskMeWidget } from "./widgets/AskMeWidget"
import { DailyOracleWidget } from "./widgets/DailyOracleWidget"
import { FlightCheckWidget } from "./widgets/FlightCheckWidget"
import { ABThumbnailWidget } from "./widgets/ABThumbnailWidget"
import { DataEditWidget } from "./widgets/DataEditWidget"
import { TitleRewriterWidget } from "./widgets/TitleRewriterWidget"
import { RetentionSimWidget } from "./widgets/RetentionSimWidget"
import { UploadSchedulerWidget } from "./widgets/UploadSchedulerWidget"
import { HashtagAnalyzerWidget } from "./widgets/HashtagAnalyzerWidget"
import { BurnoutMonitorWidget } from "./widgets/BurnoutMonitorWidget"
import { CollabMatchmakerWidget } from "./widgets/CollabMatchmakerWidget"
import { BridgeEfficiencyWidget } from "./widgets/BridgeEfficiencyWidget"
import { AudienceMatrixWidget } from "./widgets/AudienceMatrixWidget"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const formatHumanNumber = (value: unknown): string => {
 const v = Number(value)
 if (isNaN(v)) return "0"
 if (v >= 1000000) return (v / 1000000).toFixed(1) + "M"
 if (v >= 1000) return (v / 1000).toFixed(1) + "K"
 return v.toString()
}

import { PublishingFormatClashChart } from "./PublishingFormatClashChart"
import { AudienceRetentionWidget } from "./widgets/AudienceRetentionWidget"
import { FormatClashWidget } from "./widgets/FormatClashWidget"
import { CommentReplyWidget } from "./widgets/CommentReplyWidget"
import { AIJournalWidget } from "./widgets/AIJournalWidget"
import { WidgetShell } from "./WidgetShell"
import { useBrain } from "../../context/GlobalDataContext"

 interface WidgetRendererProps extends WidgetRenderCallbacks {
  widget: WidgetDefinition
  instance: WidgetInstanceState
  editMode: boolean
  canEdit: boolean
  data: DashboardData
  onNavigate: (to: string) => void
  dashboardControls?: any
 }

const formatUploadDate = (value: unknown): string => {
 const dt = new Date(String(value || ""))
 return Number.isNaN(dt.getTime()) ? "Unknown date" : dt.toLocaleDateString()
}

const widgetControlClass =
 "h-8 bg-[#f3f4f6] border-[3px] border-black rounded-[12px] inline-flex items-center justify-center text-[9px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.45)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.45)] transition-all"

const statusBadge = (status: string, tone: string) => (
 <span
  className="h-7 px-2 border-[3px] border-black rounded-md inline-flex items-center text-[9px] font-black uppercase tracking-[0.1em] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.35)]"
  style={{ backgroundColor: tone }}>
  {status}
 </span>
)

const AlertsFeedWidget: React.FC<{
 commentsVideoId: string | null
 alerts: string[]
 subscriberCount: number
 common: {
  widget: WidgetDefinition
  instance: WidgetInstanceState
  editMode: boolean
  canEdit: boolean
  onToggleCollapse: () => void
  onCycleSize: () => void
  onCycleHeight: () => void
  onRemove: () => void
 }
}> = ({ commentsVideoId, alerts, subscriberCount, common }) => {
 const { comments } = useVideoComments(commentsVideoId)
 const recentComments = comments.slice(0, 3)
 const alertColors = ["#4FFF5B", "#FFE357", "#24D3FF", "#FF83EA", "#FFB570"]

 return (
  <WidgetShell {...common} icon={<Bell size={20} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
    {/* COMMENTS SECTION */}
    {recentComments.length > 0 ?
     recentComments.map((comment: VideoComment, idx: number) => (
      <div
       key={comment.id}
       style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "6px",
        padding: "10px 12px",
        borderBottom: "2px solid #f0f0f0",
       }}>
       <div
        style={{
         width: "24px",
         height: "24px",
         borderRadius: "50%",
         background: alertColors[idx % alertColors.length],
         border: "2px solid #000",
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         flexShrink: 0,
         fontSize: "10px",
         fontWeight: 900,
        }}>
        @
       </div>
       <div style={{ flex: 1, minWidth: 0 }}>
        <div
         style={{
          fontSize: "11px",
          fontWeight: 800,
          textTransform: "uppercase",
         }}>
         {comment.author}
        </div>
        <div
         style={{
          fontSize: "10px",
          fontWeight: 600,
          opacity: 0.7,
          lineHeight: 1.3,
          marginTop: "2px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as any,
         }}>
         {comment.text}
        </div>
       </div>
      </div>
     ))
    : <div
      style={{
       padding: "10px 12px",
       fontSize: "10px",
       fontWeight: 900,
       textTransform: "uppercase",
       opacity: 0.4,
      }}>
      No recent comments
     </div>
    }

    {/* SUBSCRIBER COUNT */}
    <div
     style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "10px 12px",
      borderBottom: "2px solid #f0f0f0",
     }}>
     <div
      style={{
       width: "24px",
       height: "24px",
       borderRadius: "50%",
       background: "#FF3399",
       border: "2px solid #000",
       display: "flex",
       alignItems: "center",
       justifyContent: "center",
       flexShrink: 0,
      }}>
      <UserCircle2 size={12} color="#fff" />
     </div>
     <div style={{ flex: 1 }}>
      <div
       style={{
        fontSize: "11px",
        fontWeight: 800,
        textTransform: "uppercase",
       }}>
       New Subscribers
      </div>
      <div style={{ fontSize: "10px", fontWeight: 700, opacity: 0.5 }}>
       {subscriberCount.toLocaleString()} total
      </div>
     </div>
    </div>

    {/* SYSTEM ALERTS */}
    {alerts.map((alert, idx) => (
     <div
      key={idx}
      style={{
       display: "flex",
       alignItems: "center",
       gap: "6px",
       padding: "10px 12px",
       borderBottom: idx < alerts.length - 1 ? "2px solid #f0f0f0" : "none",
      }}>
      <div
       style={{
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        background: alertColors[(idx + 3) % alertColors.length],
        border: "2px solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
       }}>
       <Activity size={10} />
      </div>
      <div style={{ flex: 1 }}>
       <div
        style={{
         fontSize: "11px",
         fontWeight: 900,
         textTransform: "uppercase",
        }}>
        {alert}
       </div>
      </div>
      <div
       style={{
        width: "6px",
        height: "6px",
        background: "#FF1744",
        borderRadius: "50%",
       }}></div>
     </div>
    ))}
   </div>
  </WidgetShell>
 )
}

const SuperfanCardWidget: React.FC<{
  data: DashboardData
  common: {
    widget: WidgetDefinition
    instance: WidgetInstanceState
    editMode: boolean
    canEdit: boolean
    onToggleCollapse: () => void
    onCycleSize: () => void
    onCycleHeight: () => void
    onRemove: () => void
  }
}> = ({ data, common }) => {
  const recentVideoId = data.canonicalRows[0]?.videoId || null
  const { comments, loading } = useVideoComments(recentVideoId)
  
  const displayFans = useMemo(() => {
    if (comments.length > 0) {
      return comments.slice(0, 4).map((comment, i) => ({
        name: `@${comment.author.replace(/[^a-zA-Z0-9]/g, "")}`,
        color: ["#00D2FF", "#FF3399", "#4FFF5B", "#FFE357"][i % 4],
        detail: i === 0 ? "Most recent commenter" : "Active audience member",
        tag: ["SUPERFAN", "LOYALTY", "VIBE", "LEGEND"][i % 4],
      }))
    }
    
    // If no comments, use fallback profiles based on actual channel name
    const channelBase = (data.authState.channelName || "Create").split(" ")[0]
    return [
      { name: `@${channelBase}Max`, color: "#00D2FF", detail: "Top 1% Engagement", tag: "SUPERFAN" },
      { name: `@${channelBase}Pro`, color: "#FF3399", detail: "Sub Shared 5+ Videos", tag: "LOYALTY" },
      { name: `@${channelBase}User`, color: "#4FFF5B", detail: "Frequent Commenter", tag: "VIBE" },
      { name: `@${channelBase}Fan`, color: "#FFE357", detail: "Early Supporter", tag: "LEGEND" },
    ].slice(0, common.instance.size === "quarter" ? 1 : 4)
  }, [comments, data.authState.channelName, common.instance.size])

  return (
    <WidgetShell {...common} icon={<Star size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {loading ? (
          <div style={{ opacity: 0.3, fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>Scanning for superfans...</div>
        ) : (
          displayFans.map((fan, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                borderBottom: idx < displayFans.length - 1 ? "1px solid #eee" : "none",
                paddingBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: fan.color,
                  border: "2px solid #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {fan.name.charAt(1).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800 }}>{fan.name}</span>
                  <span style={{ fontSize: "8px", fontWeight: 900, background: fan.color, padding: "1px 4px", borderRadius: "4px", border: "1px solid #000" }}>{fan.tag}</span>
                </div>
                <div style={{ fontSize: "9px", fontWeight: 700, opacity: 0.5 }}>{fan.detail}</div>
              </div>
            </div>
          ))
        )}
     </div>
   </WidgetShell>
  )
}

const RevenueMomentumWidget: React.FC<{
  data: DashboardData
  common: any
}> = ({ data, common }) => {
  const [metric, setMetric] = useState<"revenue" | "views" | "subscribers">("revenue")
  
  const weeklyData = useMemo(() => {
    // Basic 4-week simulation based on canonicalRows if direct week-buckets aren't available
    const weeks = [0, 0, 0, 0]
    data.canonicalRows.forEach(row => {
      const d = new Date(row.uploadDate)
      const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24 * 7)
      const weekIdx = Math.floor(diff)
      if (weekIdx < 4) {
        let val = 0
        if (metric === "revenue") val = row.metrics.revenue?.value || 0
        else if (metric === "views") val = row.metrics.views?.value || 0
        else if (metric === "subscribers") val = row.metrics.subscribersGained?.value || 0
        weeks[3 - weekIdx] += val
      }
    })
    return weeks
  }, [data.canonicalRows, metric])

  const maxVal = Math.max(...weeklyData, 1)

  return (
    <WidgetShell {...common} icon={<TrendingUp size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "9px", fontWeight: 800, opacity: 0.4, textTransform: "uppercase" }}>Momentum Pulse</span>
          <select 
            value={metric} 
            onChange={(e) => setMetric(e.target.value as any)}
            className="brutal-input"
            style={{ height: "24px", fontSize: "9px", padding: "0 4px", width: "auto" }}
          >
            <option value="revenue">REVENUE</option>
            <option value="views">VIEWS</option>
            <option value="subscribers">SUBS</option>
          </select>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, justifyContent: "center" }}>
          {weeklyData.map((val, i) => {
            const pct = (val / maxVal) * 100
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "20px", fontSize: "9px", fontWeight: 800 }}>W{i+1}</span>
                <div style={{ flex: 1, height: "18px", border: "2px solid #000", borderRadius: "6px", background: "#f2f2f2", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#C9F830", borderRight: "2px solid #000" }} />
                </div>
                <span style={{ width: "35px", textAlign: "right", fontSize: "9px", fontWeight: 800 }}>
                  {metric === "revenue" ? `$${val.toFixed(0)}` : formatHumanNumber(val)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </WidgetShell>
  )
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  instance,
  editMode,
  canEdit,
  data,
  onNavigate,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onRemoveWidget,
  dashboardControls
}) => {
  const { brain } = useBrain();
  const common = {
  widget,
  instance,
  editMode,
  canEdit,
  onToggleCollapse: () => onToggleCollapse(widget.id),
  onCycleSize: () => onCycleSize(widget.id),
  onCycleHeight: () => onCycleHeight(widget.id),
  onRemove: () => onRemoveWidget(widget.id),
 }

 // 17. TAG GENERATOR
 if (widget.id === "tag-generator") {
  return <TagGeneratorWidget {...common} data={data} editMode={editMode} />
 }

 // 18. REVENUE CHART
 if (widget.id === "revenue-chart") {
  return <RevenueChartWidget {...common} data={data} editMode={editMode} />
 }

 // 19. COMMUNITY POST
 if (widget.id === "community-post") {
  return <CommunityPostWidget {...common} data={data} editMode={editMode} />
 }

 // 20. THUMB AI
 if (widget.id === "thumb-ai") {
  return <ThumbAIWidget {...common} data={data} editMode={editMode} />
 }

 // 21. REALTIME PERFORMANCE
 if (widget.id === "realtime-performance") {
  return (
   <RealtimePerformanceWidget {...common} data={data} editMode={editMode} />
  )
 }

 // 22. KEYWORD ENGINE
 if (widget.id === "keyword-engine") {
  return <KeywordEngineWidget {...common} data={data} editMode={editMode} />
 }

 // 23. PUBLISH MOMENTUM
 if (widget.id === "publish-momentum") {
  return <PublishMomentumWidget {...common} data={data} editMode={editMode} />
 }

 // 24. TRAFFIC SOURCES
 if (widget.id === "traffic-sources") {
  return <TrafficSourcesWidget {...common} data={data} editMode={editMode} />
 }

 // 25. AUDIENCE RETENTION
 if (widget.id === "audience-retention") {
  return <AudienceRetentionWidget {...common} data={data} editMode={editMode} />
 }

 // 26. FORMAT CLASH
 if (widget.id === "shorts-vs-long") {
  return <FormatClashWidget {...common} data={data} editMode={editMode} />
 }

 // 27. COMMENT REPLY
 if (widget.id === "comment-replier") {
  return <CommentReplyWidget {...common} data={data} editMode={editMode} />
 }

  if (widget.id === "ai-journal") {
    return <AIJournalWidget {...common} editMode={editMode} />
  }

 // 28. REACH FUNNEL
 if (widget.id === "reach-funnel") {
  return (
   <WidgetShell {...common} icon={<TrendingUp size={22} />}>
    <div className="flex flex-col h-full justify-center items-center gap-2">
     <span className="text-[10px] font-black uppercase opacity-40">
      Thumbnail Impressions
     </span>
     <div className="text-3xl font-[1000]">
      {Math.round(
       data.brain?.recentMetrics?.totalImpressions || 0,
      ).toLocaleString()}
     </div>
     <div className="w-full h-2 bg-gray-100 rounded-full border-2 border-black overflow-hidden mt-2">
      <div
       className="h-full bg-[#00CCFF]"
       style={{ width: `${data.brain?.recentMetrics?.ctr || 5}%` }}
      />
     </div>
     <span className="text-[11px] font-black uppercase text-[#00CCFF]">
      CTR: {(data.brain?.recentMetrics?.ctr || 0).toFixed(1)}%
     </span>
    </div>
   </WidgetShell>
  )
 }

 // 29. RELATIVE RETENTION
 if (widget.id === "relative-retention-benchmark") {
  return (
   <WidgetShell {...common} icon={<Activity size={22} />}>
    <div className="flex flex-col h-full gap-3">
     <div className="flex justify-between items-baseline">
      <span className="text-[10px] font-black uppercase opacity-40">
       Algo Benchmark
      </span>
      <span className="text-lg font-black uppercase text-[#FF00FF]">
       EXCEPTIONAL
      </span>
     </div>
     <div className="flex-1 bg-gray-50 border-2 border-black rounded-xl relative overflow-hidden flex items-end">
      {/* Mocking the relative performance curve vs average */}
      <svg
       viewBox="0 0 100 100"
       className="w-full h-full opacity-30 absolute inset-0">
       <path
        d="M0 50 Q 50 50 100 80"
        fill="none"
        stroke="black"
        strokeWidth="2"
        strokeDasharray="4"
       />
      </svg>
      <div className="w-full h-1/2 bg-[#FF00FF]/20 border-t-2 border-[#FF00FF] relative z-10" />
     </div>
    </div>
   </WidgetShell>
  )
 }

  // 29.5 UPLOAD CONSISTENCY
  if (widget.id === "consistency-heatmap") {
   const cDays = data.consistencyDays || []
   return (
    <WidgetShell {...common} title="UPLOAD CADENCE" icon={<CalendarDays size={22} />}>
     <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: "4px" }}>
      <span style={{ fontSize: "10px", fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
       Last 14 Days
      </span>
       <div style={{ 
         display: "grid", 
         gridTemplateColumns: "repeat(7, 1fr)", 
         gap: "4px", 
         width: "100%",
         maxWidth: "400px" 
        }}>
        {cDays.map((day) => {
         let bgStyle = "#f5f5f5"
         let brdStyle = "2px solid #000"
         let brdDashed = false
         
         if (day.active) {
          if (day.hasLong && day.hasShort) bgStyle = "#4FFF5B"
          else if (day.hasLong) bgStyle = "#00D2FF"
          else if (day.hasShort) bgStyle = "#FFE32E"
         } else if (day.isToday) {
          bgStyle = "transparent"
          brdStyle = "2.5px solid #FF3399"
         } else if (day.isFuture) {
          bgStyle = "transparent"
          brdStyle = "1.5px solid #000"
          brdDashed = true
         }
         
         return (
          <div key={day.dateStr} style={{ 
           aspectRatio: "1/1",
           background: bgStyle, 
           border: brdStyle, 
           borderStyle: brdDashed ? "dashed" : "solid",
           borderRadius: "8px",
           display: "flex", alignItems: "center", justifyContent: "center",
           position: "relative",
           minWidth: "24px"
          }}>
           {day.isToday && (
             <span style={{ fontSize: "6px", fontWeight: 800, color: "#FF3399", textTransform: "uppercase", position: "absolute", bottom: "2px" }}>Today</span>
           )}
          </div>
         )
        })}
       </div>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
         <div style={{ width: "10px", height: "10px", background: "#00D2FF", border: "1.5px solid #000", borderRadius: "2px" }} />
         <span style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase" }}>Long</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
         <div style={{ width: "10px", height: "10px", background: "#FFE32E", border: "1.5px solid #000", borderRadius: "2px" }} />
         <span style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase" }}>Short</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
         <div style={{ width: "10px", height: "10px", background: "#4FFF5B", border: "1.5px solid #000", borderRadius: "2px" }} />
         <span style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase" }}>Both</span>
        </div>
       </div>
      </div>
     </WidgetShell>
    )
   }

 if (widget.id === "ad-stack-intelligence") {
  const revenueBlock = data.statBlocks.find((s) => s.label.toLowerCase().includes("revenue"))
  const revenue = revenueBlock?.value || "0.00"
  const revNum = parseFloat(revenue.replace(/[^0-9.]/g, "")) || 0
  const viewsBlock = data.statBlocks.find((s) => s.label.toLowerCase().includes("views"))
  const viewsNum = parseFloat((viewsBlock?.value || "0").replace(/[^0-9.]/g, "")) || 0
  const viewsMultiplier = (viewsBlock?.value || "").includes("M") ? 1000000 : (viewsBlock?.value || "").includes("K") ? 1000 : 1
  const totalViews = viewsNum * viewsMultiplier
  const cpm = totalViews > 0 ? ((revNum / totalViews) * 1000).toFixed(2) : "0.00"
  return (
   <WidgetShell {...common} icon={<DollarSign size={22} />}>
    <div className="grid grid-cols-2 gap-3 h-full">
     <div className="flex flex-col justify-center bg-gray-50 border-2 border-black rounded-xl p-3">
      <span className="text-[9px] font-black uppercase opacity-40">
       Gross Rev
      </span>
      <div className="text-xl font-black">${revenue}</div>
     </div>
     <div className="flex flex-col justify-center bg-gray-50 border-2 border-black rounded-xl p-3">
      <span className="text-[9px] font-black uppercase opacity-40">
       CPM (Est)
      </span>
      <div className="text-xl font-black text-[#C9F830]">${cpm}</div>
     </div>
    </div>
   </WidgetShell>
  )
 }

 // ADVANCED TELEMETRY (CONSOLIDATED)
 if (widget.id === "audience-matrix") return <AudienceMatrixWidget {...common} data={data} />
 if (widget.id === "bridge-efficiency") return <BridgeEfficiencyWidget {...common} data={data} />

 // 1. CHANNEL OVERVIEW
 if (widget.id === "kpi-cluster") {
  const avatar = data.avatarUrl || ""
  return (
   <WidgetShell {...common} icon={<TrendingUp size={22} />}>
    <div style={{ display: "flex", gap: "6px", height: "100%" }}>
      {/* Circular Avatar Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", flexShrink: 0, width: "170px", padding: "2px", marginLeft: "-8px" }}>
       <div style={{ width: "150px", height: "150px", borderRadius: "50%", border: "3px solid #000", overflow: "hidden", background: "#eee" }}>
        {avatar ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserCircle2 size={56} strokeWidth={1} style={{ margin: "47px" }} />}
       </div>
       <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
         {data.brain?.channelProfile?.name || data.authState?.channelName || "Your Channel"}
        </div>
        <div style={{ fontSize: "10px", fontWeight: 900, opacity: 0.6 }}>
         {data.brain?.channelProfile?.handle ? `@${data.brain.channelProfile.handle.replace(/^@/, '')}` : (data.authState?.channelHandle ? `@${data.authState.channelHandle.replace(/^@/, '')}` : `@${(data.authState?.channelName || "handle").replace(/\s+/g, "").toLowerCase()}`)}
        </div>
       </div>
       <a
        href={`https://youtube.com/${data.brain?.channelProfile?.handle ? '@' + data.brain.channelProfile.handle.replace(/^@/, '') : (data.authState?.channelHandle ? '@' + data.authState.channelHandle.replace(/^@/, '') : "")}`}
        target="_blank"
        rel="noreferrer"
        style={{
         padding: "4px 10px",
         background: "#000",
         color: "#fff",
         borderRadius: "6px",
         fontSize: "9px",
         fontWeight: 800,
         textDecoration: "none",
         textTransform: "uppercase",
         boxShadow: "2px 2px 0 0 rgba(0,0,0,0.2)",
         marginTop: "2px",
        }}
       >
        Visit Channel
       </a>
      </div>
     {/* Stats Grid */}
     <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
      {data.statBlocks.map((stat, idx) => {
       const bars = Array.from({ length: 7 }, (_, i) => {
        const seed = ((idx * 7 + i + 1) * 17) % 100
        return 40 + (seed % 50)
       })

       // Trend formatting: truncate to 4 digits, remove decimals if >= 100
       let cleanTrend = stat.trend || ""
       if (cleanTrend) {
        const match = cleanTrend.match(/([+-]?)(\d+(\.\d+)?)%/)
        if (match) {
          const sign = match[1]
          const val = parseFloat(match[2])
          if (val >= 100) {
           cleanTrend = `${sign}${Math.round(val).toString().slice(0, 4)}%`
          } else {
           cleanTrend = `${sign}${val.toFixed(1).slice(0, 4)}%`
          }
        }
       }

       return (
        <div
         key={idx}
         style={{
          background: "#fff",
          border: "2px solid #000",
          borderRadius: "6px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
         }}>
         <div
          style={{
           background: stat.color,
           borderBottom: "2px solid #000",
           height: "22px",
           display: "flex",
           justifyContent: "center",
           alignItems: "center",
          }}>
          <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", color: "#000", lineHeight: 1 }}>
           {stat.label}
          </span>
         </div>
         <div style={{ padding: "6px 6px 0px", display: "flex", alignItems: "baseline", justifyContent: "center", gap: "6px" }}>
          <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: "#000" }}>
           {stat.value.endsWith("K") ? <>{stat.value.slice(0, -1)}<span style={{ fontSize: "0.6em" }}>K</span></> : stat.value.endsWith("M") ? <>{stat.value.slice(0, -1)}<span style={{ fontSize: "0.6em" }}>M</span></> : stat.value}
          </div>
          {stat.trend && <span style={{ fontSize: "10px", fontWeight: 900, color: stat.trend.includes("▲") ? "#008B00" : "#D32F2F" }}>{cleanTrend}</span>}
         </div>
         <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5px", padding: "2px 4px 0", height: "40px", marginTop: "auto" }}>
          {bars.map((h, i) => (
           <div key={i} style={{ flex: 1, height: `${Math.min(100, h * 1.5)}%`, background: stat.color, opacity: 0.3 + (h / 100) * 0.7, borderRadius: "2px 2px 0 0", border: "1px solid rgba(0,0,0,0.15)", borderBottom: "none" }} />
          ))}
         </div>
        </div>
       )
      })}
     </div>
    </div>
   </WidgetShell>
  )
 }

 // 2. SOCIAL CHANNELS (was Channel Overview)
 if (widget.id === "channel-overview") {
  return (
   <WidgetShell {...common} icon={<UserCircle2 size={22} />}>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
     <div
      style={{
       display: "flex",
       justifyContent: "space-between",
       alignItems: "center",
       background: "#fff",
       border: "2px solid #000",
       borderRadius: "8px",
       padding: "6px 10px",
       boxShadow: "2px 2px 0 0 #FF1744",
      }}>
      <span style={{ fontSize: "10px", fontWeight: 900, color: "#FF1744" }}>
       YOUTUBE
      </span>
      <span style={{ fontSize: "14px", fontWeight: 800 }}>
       {data.brain?.recentMetrics?.currentSubscribers?.toLocaleString() || "0"}
      </span>
     </div>
     <div
      style={{
       display: "flex",
       justifyContent: "space-between",
       alignItems: "center",
       background: "#fff",
       border: "2px solid #000",
       borderRadius: "8px",
       padding: "6px 10px",
       boxShadow: "2px 2px 0 0 #000",
      }}>
      <span style={{ fontSize: "10px", fontWeight: 900, color: "#000" }}>
       TWITTER
      </span>
      <span style={{ fontSize: "14px", fontWeight: 800 }}>21.2K</span>
     </div>
     <div
      style={{
       display: "flex",
       justifyContent: "space-between",
       alignItems: "center",
       background: "#fff",
       border: "2px solid #000",
       borderRadius: "8px",
       padding: "6px 10px",
       boxShadow: "2px 2px 0 0 #00D2FF",
      }}>
      <span style={{ fontSize: "10px", fontWeight: 900, color: "#00D2FF" }}>
       TIKTOK
      </span>
      <span style={{ fontSize: "14px", fontWeight: 800 }}>145K</span>
     </div>
    </div>
   </WidgetShell>
  )
 }

 // 3. CALENDAR + TASKS MERGED
 if (widget.id === "mini-calendar") {
  return (
   <WidgetShell {...common} icon={<CalendarDays size={22} />}>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", height: "100%" }}>
     {/* Mini Calendar Grid */}
     <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
      {data.upcomingDays.map((day) => (
       <div
        key={day.dateStr}
        style={{
         aspectRatio: "1",
         borderRadius: "2px",
         border: "1px solid #000",
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         fontSize: "8px",
         fontWeight: 900,
         backgroundColor:
          day.isToday ? "#FFB570"
          : day.tasks.length > 0 ? "#FFD8B3"
          : "#eee",
         opacity: day.tasks.length > 0 || day.isToday ? 1 : 0.5,
        }}>
        {day.date.getDate()}
       </div>
      ))}
     </div>
     
     {/* Task checklist integrated below */}
     <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", padding: "4px 0" }}>
      <span style={{ fontSize: "8px", fontWeight: 800, opacity: 0.4, textTransform: "uppercase" }}>Daily Checklist</span>
      {(data.todayTasks.length > 0 ? data.todayTasks : [{text: "No tasks for today", completed: false}]).slice(0, 3).map((task: any, idx: number) => (
        <div
         key={idx}
         style={{
          display: "flex",
          background: "#fff",
          border: "1px solid #000",
          borderRadius: "6px",
          padding: "4px 8px",
          alignItems: "center",
          gap: "6px",
          opacity: task.completed ? 0.4 : 1,
         }}>
         <div
          style={{
           width: "8px",
           height: "8px",
           borderRadius: "1px",
           border: "1.5px solid #000",
           background: task.completed ? "#4FFF5B" : "#eee",
          }}></div>
         <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase" }}>{task.text}</span>
        </div>
     ))}
    </div>
    </div>
   </WidgetShell>
  )
 }

 // 5. QUICK ACTIONS
 if (widget.id === "quick-actions") {
  return (
   <WidgetShell {...common} icon={<Layers size={22} />}>
    <div
     style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "4px",
     }}>
     {data.quickActions.map((action, idx) => (
      <button
       key={idx}
       onClick={() => onNavigate(action.to)}
       style={{
        height: "40px",
        border: "2px solid #000",
        borderRadius: "10px",
        background: idx % 2 === 0 ? "#4FFF5B" : "#579AFF",
        fontSize: "9px",
        fontWeight: 900,
        textTransform: "uppercase",
        boxShadow: "2px 2px 0 0 #000",
        cursor: "pointer",
       }}>
       {action.label}
      </button>
     ))}
    </div>
   </WidgetShell>
  )
 }

 // 6. UPLOADS
 if (widget.id === "recent-uploads") {
  return (
   <WidgetShell {...common} icon={<Upload size={22} />}>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
     {data.recentUploads.slice(0, 3).map((video) => (
      <div
       key={video.videoId}
       style={{
        display: "flex",
        background: "#fff",
        border: "2px solid #000",
        borderRadius: "10px",
        padding: "4px",
        gap: "6px",
        boxShadow: "2px 2px 0 0 rgba(0,0,0,0.05)",
       }}>
       <div
        style={{
         width: "60px",
         height: "34px",
         borderRadius: "6px",
         border: "1px solid #000",
         background: "#eee",
         overflow: "hidden",
         flexShrink: 0,
        }}>
        <img
         src={
          video.thumbnailUrl ||
          `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
         }
         className="w-full h-full object-cover"
        />
       </div>
       <div style={{ flex: 1, minWidth: 0 }}>
        <div
         style={{
          fontSize: "10px",
          fontWeight: 800,
          textTransform: "uppercase",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
         }}>
         {video.title}
        </div>
        <div className="label-tiny" style={{ opacity: 0.4, marginTop: "2px" }}>
         {formatUploadDate(video.uploadDate)}
        </div>
       </div>
      </div>
     ))}
    </div>
   </WidgetShell>
  )
 }

 // 7. TOP PERFORMER
 if (widget.id === "top-performer") {
  return (
   <WidgetShell {...common} icon={<Video size={22} />}>
    {data.topPerformer ?
     <div
      style={{
       display: "flex",
       flexDirection: "column",
       alignItems: "center",
       justifyContent: "center",
       padding: "4px",
       gap: "4px",
      }}>
      <div
       style={{
        width: "100%",
        maxWidth: "180px",
        aspectRatio: "16/9",
        borderRadius: "8px",
        border: "2px solid #000",
        overflow: "hidden",
        boxShadow: "3px 3px 0 0 rgba(0,0,0,0.1)",
       }}>
       <img
        src={
         data.topPerformer.thumbnailUrl ||
         `https://img.youtube.com/vi/${data.topPerformer.videoId}/mqdefault.jpg`
        }
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
       />
      </div>
      <div
       style={{
        fontSize: "12px",
        fontWeight: 800,
        textTransform: "uppercase",
        textAlign: "center",
        lineHeight: 1.2,
       }}>
       {data.topPerformer.title}
      </div>
      <div
       style={{
        fontSize: "36px",
        fontWeight: 800,
        color: "#FF3399",
        letterSpacing: "-0.04em",
       }}>
       {Math.round(
        data.topPerformer.metrics.views?.value || 0,
       ).toLocaleString()}
      </div>
      <span className="label-tiny" style={{ opacity: 0.4 }}>
       Views All Time
      </span>
     </div>
    : <div className="label-tiny" style={{ opacity: 0.3 }}>
      No Data
     </div>
    }
   </WidgetShell>
  )
 }


 // 16. GOALS TRACKER
 if (widget.id === "goals-tracker") {
  const GOAL_STORAGE_KEY = "vt_goal_targets_v2"
  const goalTargets = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || '{}')

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

  const handleSetGoal = (category: string) => {
   const target = prompt(`Set ${category} target:`)
   if (!target) return
   const duration = prompt("Duration: 1mo, 3mo, or 6mo?", "3mo") || "3mo"
   const current = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || "{}")
   current[category] = { target: parseFloat(target.replace(/[^0-9.]/g, "")), duration, setAt: Date.now() }
   localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(current))
   window.dispatchEvent(new Event("storage"))
  }

  const hasAnyGoal = Object.keys(goalTargets).length > 0

  return (
   <WidgetShell {...common} icon={<Activity size={22} />}>
    <div style={{ display: "flex", height: "100%", gap: "0" }}>
     {/* Left sidebar rail — info boxes */}
     <div style={{ width: "62px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px", paddingRight: "4px", borderRight: "2px solid #000", marginRight: "6px" }}>
      {categories.map((cat) => {
       const goal = goalTargets[cat.key]
       const label = cat.key === "Subscribers" ? "SUBS" : cat.key === "Views" ? "VIEWS" : cat.key === "Revenue" ? "$REV" : "OTHER"
       const pct = goal?.target ? Math.min(100, Math.round((cat.current / goal.target) * 100)) : 0
       return (
        <button
         key={cat.key}
         onClick={() => handleSetGoal(cat.key)}
         style={{
          padding: "4px 3px",
          background: goal ? cat.color : "#fff",
          border: "2px solid #000",
          borderRadius: "6px",
          fontSize: "7px",
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
          <span style={{ fontSize: "6px", opacity: 0.7 }}>{pct}%</span>
         ) : (
          <span style={{ fontSize: "6px", opacity: 0.35 }}>SET</span>
         )}
        </button>
       )
      })}
     </div>

     {/* Right side — concentric rings (as large as possible) */}
     <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <svg width="100%" height="100%" viewBox="0 0 160 160" style={{ maxWidth: "180px", maxHeight: "180px" }}>
       {categories.map((cat) => {
        const goal = goalTargets[cat.key]
        const target = goal?.target || 0
        const circumference = 2 * Math.PI * cat.radius
        const progress = target > 0 ? Math.min(1, cat.current / target) : 0
        const offset = circumference - (progress * circumference)
        return (
         <g key={cat.key}>
          <circle cx="80" cy="80" r={cat.radius} fill="none" stroke="#eee" strokeWidth="9" style={{ opacity: 0.3 }} />
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
          }, 0) / Math.max(1, categories.filter((c) => goalTargets[c.key]?.target).length),
         )}%
        </div>
        <div style={{ fontSize: "6px", fontWeight: 900, opacity: 0.5 }}>AVG PROGRESS</div>
       </div>
      )}
     </div>
    </div>
   </WidgetShell>
  )
 }

 // 9. ALERTS FEED — comments + subscriber alerts + insights
 if (widget.id === "alerts-feed") {
  return (
   <AlertsFeedWidget
    commentsVideoId={data.topPerformer?.videoId || null}
    alerts={data.alerts}
    subscriberCount={data.brain?.recentMetrics?.currentSubscribers ?? 0}
    common={common}
   />
  )
 }



 // 11. ORACLE (Strategic)
 if (widget.id === "ai-prompt-box") {
  return (
   <WidgetShell {...common} icon={<WandSparkles size={22} />}>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
     <div
      style={{
       display: "flex",
       alignItems: "center",
       gap: "4px",
       marginBottom: "2px",
      }}>
      <Activity size={14} className="text-[#FF8AAF]" />
      <span className="label-tiny" style={{ color: "#FF8AAF" }}>
       Strategic Priorities
      </span>
     </div>
     <div
      style={{
       display: "flex",
       background: "#fff",
       border: "2px solid #000",
       borderRadius: "10px",
       overflow: "hidden",
       boxShadow: "3px 3px 0 0 rgba(255,138,175,0.4)",
      }}>
      <div style={{ width: "5px", background: "#FF8AAF", flexShrink: 0 }}></div>
      <div
       style={{ flex: 1, padding: "6px", fontSize: "13px", fontWeight: 700 }}>
       Title hooks are generic. Commit to 2 unique scripts this week.
      </div>
     </div>
     <div className="label-tiny" style={{ opacity: 0.3 }}>
      Ask Agent Anything
     </div>
     <input
      className="brutal-input"
      style={{ height: "36px" }}
      placeholder="Drop a question..."
     />
    </div>
   </WidgetShell>
  )
 }

 // 12. REVENUE MOMENTUM
 if (widget.id === "revenue-momentum") {
  return <RevenueMomentumWidget data={data} common={common} />
 }

 // 13. SUPERFAN
 if (widget.id === "superfan-card") {
  return <SuperfanCardWidget data={data} common={common} />
 }

 // 14. SETTINGS (merged: system + sync)
 if (widget.id === "system-micro-stack") {
  const [apiKey, setApiKey] = useState(localStorage.getItem("GEMINI_API_KEY") || "")
  const [model, setModel] = useState(localStorage.getItem("GEMINI_MODEL") || "gemini-1.5-flash")

  const saveSettings = (k: string, m: string) => {
   localStorage.setItem("GEMINI_API_KEY", k)
   localStorage.setItem("GEMINI_MODEL", m)
   window.dispatchEvent(new Event("storage"))
  }

  const isConnected = data.authState.isAuthenticated
  const lastSync = data.formatRelativeTime(data.lastSyncComplete)
  const storagePct = Math.min(100, Math.round((JSON.stringify(data.brain).length / 500000) * 100))

  return (
   <WidgetShell {...common} icon={<Database size={22} />}>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", height: "100%" }}>
     {/* Status Row */}
     <div style={{ display: "flex", gap: "6px" }}>
      <div style={{ flex: 1, border: "2px solid #000", borderRadius: "8px", padding: "4px 8px", background: isConnected ? "#4FFF5B" : "#FF1744" }}>
       <div style={{ fontSize: "8px", fontWeight: 800, opacity: 0.6 }}>STATUS</div>
       <div style={{ fontSize: "10px", fontWeight: 800 }}>{isConnected ? "CONNECTED" : "OFFLINE"}</div>
      </div>
      <div style={{ flex: 1, border: "2px solid #000", borderRadius: "8px", padding: "4px 8px", background: "#fff" }}>
       <div style={{ fontSize: "8px", fontWeight: 800, opacity: 0.6 }}>STORAGE</div>
       <div style={{ fontSize: "10px", fontWeight: 800 }}>{storagePct}% USED</div>
      </div>
     </div>

     <div style={{ fontSize: "9px", fontWeight: 800, opacity: 0.5, marginTop: "-4px" }}>
      CHANNEL: {data.authState.channelName || "NOT LINKED"} • LAST SYNC: {lastSync}
     </div>

     {/* Config Section */}
     <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "8px", fontWeight: 800, opacity: 0.6 }}>AI API KEY</label>
      <input
       type="password"
       className="brutal-input"
       value={apiKey}
       placeholder="••••••••"
       onChange={(e) => { setApiKey(e.target.value); saveSettings(e.target.value, model); }}
       style={{ height: "28px", fontSize: "10px" }}
      />

      <label style={{ fontSize: "8px", fontWeight: 800, opacity: 0.6, marginTop: "4px" }}>MODEL CHOICE</label>
      <select
       className="brutal-input"
       value={model}
       onChange={(e) => { setModel(e.target.value); saveSettings(apiKey, e.target.value); }}
       style={{ height: "28px", fontSize: "10px" }}
      >
       <option value="gemini-1.5-flash">GEMINI 1.5 FLASH</option>
       <option value="gemini-1.5-pro">GEMINI 1.5 PRO</option>
       <option value="gemini-2.0-flash">GEMINI 2.0 FLASH</option>
      </select>
     </div>

     {/* Action Buttons */}
     <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
      <button
       className="brutal-btn"
       style={{ flex: 1, height: "32px", fontSize: "9px", background: "#00D2FF" }}
       onClick={() => { /* Sync logic */ }}
      >
       SYNC CHANNEL
      </button>
      <button
       className="brutal-btn"
       style={{ flex: 1, height: "32px", fontSize: "9px", background: "#eee" }}
       onClick={() => { /* Connect logic */ }}
      >
       RE-CONNECT
      </button>
     </div>
     {/* Dashboard Controls Module */}
     {dashboardControls && (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "auto", borderTop: "2px solid #e5e5e5", paddingTop: "6px" }}>
       <button
        onClick={() => dashboardControls.setEditMode((prev: boolean) => !prev)}
        className="widget-control-btn" style={{ flex: 1, padding: "2px" }}>
        <Edit3 size={12} style={{ marginRight: "4px" }} />
        {dashboardControls.editMode ? "DONE" : "REARRANGE"}
       </button>
       <button
        onClick={() => dashboardControls.toggleLock()}
        className="widget-control-btn" style={{ flex: 1, padding: "2px" }}>
        {dashboardControls.locked ? <Lock size={12} style={{ marginRight: "4px" }} /> : <LockOpen size={12} style={{ marginRight: "4px" }} />}
        {dashboardControls.locked ? "LOCKED" : "UNLOCKED"}
       </button>
       <button
        onClick={() => dashboardControls.openPicker()}
        className="widget-control-btn" style={{ flex: 1, padding: "2px" }}>
        <Layers size={12} style={{ marginRight: "4px" }} />
        WIDGETS
       </button>
       <div style={{ width: "100%", display: "flex", gap: "4px" }}>
        <button
         onClick={() => dashboardControls.resetLayout()}
         className="widget-control-btn" style={{ flex: 1, padding: "2px" }}>
         <RotateCcw size={12} style={{ marginRight: "4px" }} />
         RESET
        </button>
        <button
         onClick={dashboardControls.handleExport}
         className="widget-control-btn" style={{ flex: 1, padding: "2px" }}>
         <Download size={12} style={{ marginRight: "4px" }} />
         EXPORT
        </button>
        <button
         onClick={dashboardControls.handleImportClick}
         className="widget-control-btn" style={{ flex: 1, padding: "2px" }}>
         <Upload size={12} style={{ marginRight: "4px" }} />
         IMPORT
        </button>
       </div>
      </div>
     )}
    </div>
   </WidgetShell>
  )
 }

 // 15. NEWS TICKER (placeholder)
 if (widget.id === "alerts-ticker") {
  return (
   <WidgetShell {...common} icon={<Activity size={22} />}>
    <div
     style={{
      height: "40px",
      background: "#FF1744",
      border: "2px solid #000",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      boxShadow: "3px 3px 0 0 #000",
     }}>
     <div
      style={{
       background: "#000",
       color: "#fff",
       height: "100%",
       paddingLeft: "12px",
       paddingRight: "12px",
       display: "flex",
       alignItems: "center",
       fontSize: "12px",
       fontWeight: 900,
       flexShrink: 0,
      }}>
      LIVE
     </div>
     <div
      style={{
       whiteSpace: "nowrap",
       paddingLeft: "12px",
       fontSize: "12px",
       fontWeight: 800,
       color: "#fff",
      }}>
      OpenAI announces GPT-5 with native video understanding...
     </div>
    </div>
   </WidgetShell>
  )
 }

 if (widget.id === "ask-me") return <AskMeWidget {...common} data={data} />
 if (widget.id === "daily-oracle") return <DailyOracleWidget {...common} data={data} />
 if (widget.id === "flight-check") return <FlightCheckWidget {...common} data={data} />
 if (widget.id === "ab-thumbnail") return <ABThumbnailWidget {...common} data={data} />
 if (widget.id === "data-edit") return <DataEditWidget {...common} data={data} />
 if (widget.id === "title-rewriter") return <TitleRewriterWidget {...common} data={data} />
 if (widget.id === "retention-sim") return <RetentionSimWidget {...common} data={data} />
 if (widget.id === "upload-scheduler") return <UploadSchedulerWidget {...common} data={data} />
 if (widget.id === "hashtag-analyzer") return <HashtagAnalyzerWidget {...common} data={data} />
 if (widget.id === "burnout-monitor") return <BurnoutMonitorWidget {...common} data={data} />

 if (widget.id === "collab-matchmaker") return <CollabMatchmakerWidget {...common} data={data} />

 return (
  <WidgetShell {...common}>
   <p className="label-tiny" style={{ opacity: 0.3 }}>
    Widget Unmapped
   </p>
  </WidgetShell>
 )
}
