/* eslint-disable @typescript-eslint/no-explicit-any -- Legacy inline renderers are being migrated behind typed registry contracts incrementally. */
import React, { useState, useMemo } from "react"
import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  Database,
  DollarSign,
  Layers,
  Star,
  TrendingUp,
  Upload,
  UserCircle2,
  Video,
  WandSparkles,
  Edit3,
  Lock,
  Settings,
  Image as ImageIcon,
  MessageSquare,
  MessageCircle,
  Monitor,
  Rocket,
  Magnet,
  RefreshCw,
  BookOpen,
 } from "lucide-react"
import { useVideoComments, type VideoComment } from "./useVideoComments"
import type { DashboardData } from "./useDashboardData"
import type {
 CommonWidgetProps,
 WidgetDefinition,
 WidgetRenderCallbacks,
 WidgetInstanceState,
} from "./types"
import { GoalsTrackerWidget } from "./widgets/GoalsTrackerWidget"
const formatHumanNumber = (value: unknown): string => {
 const v = Number(value)
 if (isNaN(v)) return "0"
 if (v >= 1000000) return (v / 1000000).toFixed(1) + "M"
 if (v >= 1000) return (v / 1000).toFixed(1) + "K"
 return v.toString()
}

import { WidgetShell } from "./WidgetShell"
import { WidgetHeaderStepper } from "./WidgetPrimitives"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"

const LAZY_WIDGET_RENDERERS: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
 "tag-generator": React.lazy(() => import("./widgets/TagGeneratorWidget").then((module) => ({ default: module.TagGeneratorWidget }))),
 "revenue-chart": React.lazy(() => import("./widgets/RevenueChartWidget").then((module) => ({ default: module.RevenueChartWidget }))),
 "ui-reference-library": React.lazy(() => import("./widgets/UIReferenceLibraryWidget")),
 "community-post": React.lazy(() => import("./widgets/CommunityPostWidget").then((module) => ({ default: module.CommunityPostWidget }))),
 "thumb-ai": React.lazy(() => import("./widgets/ThumbnailLabWidget").then((module) => ({ default: module.ThumbnailLabWidget }))),
 "realtime-performance": React.lazy(() => import("./widgets/RealtimePerformanceWidget").then((module) => ({ default: module.RealtimePerformanceWidget }))),
 "keyword-engine": React.lazy(() => import("./widgets/KeywordEngineWidget").then((module) => ({ default: module.KeywordEngineWidget }))),
 "keyword-overlap-intelligence": React.lazy(() => import("./widgets/KeywordOverlapWidget").then((module) => ({ default: module.KeywordOverlapWidget }))),
 "publish-momentum": React.lazy(() => import("./widgets/PublishMomentumWidget").then((module) => ({ default: module.PublishMomentumWidget }))),
 "traffic-sources": React.lazy(() => import("./widgets/TrafficSourcesWidget").then((module) => ({ default: module.TrafficSourcesWidget }))),
 "ask-me": React.lazy(() => import("./widgets/AskMeWidget").then((module) => ({ default: module.AskMeWidget }))),
 "daily-oracle": React.lazy(() => import("./widgets/DailyOracleWidget").then((module) => ({ default: module.DailyOracleWidget }))),
 "flight-check": React.lazy(() => import("./widgets/FlightCheckWidget").then((module) => ({ default: module.FlightCheckWidget }))),
 "description-editor": React.lazy(() => import("./widgets/DescriptionEditorWidget").then((module) => ({ default: module.DescriptionEditorWidget }))),
 "data-edit": React.lazy(() => import("./widgets/DataEditWidget").then((module) => ({ default: module.DataEditWidget }))),
 "title-rewriter": React.lazy(() => import("./widgets/TitleRewriterWidget").then((module) => ({ default: module.TitleRewriterWidget }))),
 "retention-sim": React.lazy(() => import("./widgets/RetentionSimWidget").then((module) => ({ default: module.RetentionSimWidget }))),
 "upload-scheduler": React.lazy(() => import("./widgets/UploadSchedulerWidget").then((module) => ({ default: module.UploadSchedulerWidget }))),
 "hashtag-analyzer": React.lazy(() => import("./widgets/HashtagAnalyzerWidget").then((module) => ({ default: module.HashtagAnalyzerWidget }))),
 "burnout-monitor": React.lazy(() => import("./widgets/BurnoutMonitorWidget").then((module) => ({ default: module.BurnoutMonitorWidget }))),
 "collab-matchmaker": React.lazy(() => import("./widgets/CollabMatchmakerWidget").then((module) => ({ default: module.CollabMatchmakerWidget }))),
 "bridge-efficiency": React.lazy(() => import("./widgets/BridgeEfficiencyWidget").then((module) => ({ default: module.BridgeEfficiencyWidget }))),
 "audience-matrix": React.lazy(() => import("./widgets/AudienceMatrixWidget").then((module) => ({ default: module.AudienceMatrixWidget }))),
 "brain-hub": React.lazy(() => import("./widgets/BrainHubWidget").then((module) => ({ default: module.BrainHubWidget }))),
 "image-generator": React.lazy(() => import("./widgets/ImageGeneratorWidget").then((module) => ({ default: module.ImageGeneratorWidget }))),
 "video-uploader": React.lazy(() => import("./widgets/DataEditWidget").then((module) => ({ default: module.VideoUploaderWidget }))),
 "audience-retention": React.lazy(() => import("./widgets/AudienceRetentionWidget").then((module) => ({ default: module.AudienceRetentionWidget }))),
 "shorts-vs-long": React.lazy(() => import("./widgets/FormatClashWidget").then((module) => ({ default: module.FormatClashWidget }))),
 "comment-replier": React.lazy(() => import("./widgets/CommentReplyWidget").then((module) => ({ default: module.CommentReplyWidget }))),
 "ai-journal": React.lazy(() => import("./widgets/AIJournalWidget").then((module) => ({ default: module.AIJournalWidget }))),
}

const INLINE_WIDGET_RENDERER_KEYS = [
 "app-verification-explainer",
 "reach-funnel",
 "relative-retention-benchmark",
 "consistency-heatmap",
 "ad-stack-intelligence",
 "kpi-cluster",
 "channel-overview",
 "mini-calendar",
 "quick-actions",
 "recent-uploads",
 "top-performer",
 "goals-tracker",
 "alerts-feed",
 "ai-prompt-box",
 "revenue-momentum",
 "superfan-card",
 "system-micro-stack",
 "task-stack",
 "alerts-ticker",
] as const

// Renderer coverage is exported for registry certification without eagerly loading widget modules.
// eslint-disable-next-line react-refresh/only-export-components
export const DASHBOARD_WIDGET_RENDERER_KEYS = new Set<string>([
 ...Object.keys(LAZY_WIDGET_RENDERERS),
 ...INLINE_WIDGET_RENDERER_KEYS,
])

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

const VerificationExplainerWidget: React.FC<{
 common: CommonWidgetProps
 onNavigate: (to: string) => void
}> = ({ common, onNavigate }) => {
 const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>, to: string) => {
  event.preventDefault()
  onNavigate(to)
 }

 const ctaPrimaryStyle: React.CSSProperties = {
  flex: "1 1 auto",
  minHeight: "44px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "8px 14px",
  border: "3px solid #000",
  borderRadius: "12px",
  background: "#C9F830",
  color: "#000",
  boxShadow: "4px 4px 0 #000",
  fontSize: "15px",
  fontWeight: 1000,
  textTransform: "uppercase",
  textDecoration: "none",
  textAlign: "center",
  minWidth: 0,
 }

 const ctaSecondaryStyle = (bg: string): React.CSSProperties => ({
  flex: "1 1 0",
  minHeight: "38px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 12px",
  border: "3px solid #000",
  borderRadius: "10px",
  background: bg,
  color: "#000",
  boxShadow: "3px 3px 0 #000",
  fontSize: "12px",
  fontWeight: 1000,
  textTransform: "uppercase",
  textDecoration: "none",
  minWidth: 0,
 })

 const features: Array<{ Icon: typeof TrendingUp; title: string; desc: string; bg: string }> = [
  { Icon: TrendingUp, title: "Track Performance", desc: "Views, watch time & revenue — unified.", bg: "#33D6EA" },
  { Icon: RefreshCw, title: "Sync Everything", desc: "Videos, metadata & analytics in one click.", bg: "#C9F830" },
  { Icon: CalendarDays, title: "Plan & Publish", desc: "Schedule uploads, titles & thumbnails.", bg: "#FFB570" },
  { Icon: Bot, title: "AI Brain", desc: "Ask your channel anything, grounded in your data.", bg: "#FF83EA" },
 ]

 return (
  <WidgetShell {...common} icon={<BookOpen size={22} aria-hidden="true" />}>
   <section
    className="vt-widget-fill"
    aria-label="VIEWTUBE app purpose and data use"
    style={{
     gap: "10px",
     padding: "10px",
     background: "#F6F7FB",
     justifyContent: "center",
     overflow: "hidden",
    }}>
    {/* SINGLE ROW STRUCTURE */}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "stretch" }}>
     
     {/* 1. Brand (Blue background removed) */}
     <div
      translate="no"
      style={{
       flex: "1 1 160px",
       display: "flex",
       alignItems: "center",
       justifyContent: "center",
       padding: "10px 14px",
       border: "3px solid #000",
       borderRadius: "12px",
       background: "#fff",
       boxShadow: "4px 4px 0 #000",
       fontSize: "26px",
       fontWeight: 1000,
       letterSpacing: "-0.03em",
       lineHeight: 1,
       textTransform: "uppercase",
      }}>
      <span style={{ color: "#0A0A0A" }}>View</span>
      <span style={{ color: "#17B9CE" }}>Tube</span>
     </div>

     {/* 2. Features Grid Map */}
     {features.map(({ Icon, title, desc, bg }) => (
      <div
       key={title}
       style={{
        flex: "1 1 130px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "3px solid #000",
        borderRadius: "11px",
        background: "#fff",
        boxShadow: "3px 3px 0 #000",
       }}>
       <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "6px 9px", background: bg, borderBottom: "3px solid #000" }}>
        <Icon size={16} aria-hidden="true" />
        <span style={{ fontSize: "11.5px", fontWeight: 1000, textTransform: "uppercase", letterSpacing: "-0.01em" }}>{title}</span>
       </div>
       <p style={{ margin: 0, padding: "7px 9px", fontSize: "11px", fontWeight: 800, lineHeight: 1.25 }}>{desc}</p>
      </div>
     ))}

     {/* 3. Green data-use disclosure (Wider flex basis, condensed text, centered items) */}
     <div
      style={{
       flex: "3 1 340px",
       minWidth: 0,
       display: "flex",
       alignItems: "center",
       gap: "10px",
       padding: "10px 12px",
       border: "3px solid #000",
       borderRadius: "12px",
       background: "#E7F9E4",
       boxShadow: "4px 4px 0 #000",
      }}>
      <div style={{ display: "grid", placeItems: "center", flex: "0 0 auto", width: "36px", height: "36px", border: "3px solid #000", borderRadius: "9px", background: "#4FFF5B", boxShadow: "3px 3px 0 #000" }}>
       <Lock size={18} aria-hidden="true" />
      </div>
      <div style={{ minWidth: 0 }}>
       <h3 style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: 1000, textTransform: "uppercase" }}>
        Why sign-in helps
       </h3>
       <p style={{ margin: 0, fontSize: "11px", fontWeight: 800, lineHeight: 1.3 }}>
        Signing in connects your YouTube account to show your channel, videos, comments &amp; analytics. Your data only powers your dashboard—it's never sold—and you can disconnect anytime.
       </p>
      </div>
     </div>

     {/* 4. Navigation Buttons */}
     <nav aria-label="VIEWTUBE account and help links" style={{ flex: "2 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
      <div style={{ display: "flex", flex: 1 }}>
       <a href="/account/connect" onClick={event => handleNavigate(event, "/account/connect")} style={{...ctaPrimaryStyle, flex: 1}}>
        <Rocket size={16} aria-hidden="true" /> Connect your channel
       </a>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", flex: 1, gap: "7px" }}>
       <a href="/about" onClick={event => handleNavigate(event, "/about")} style={ctaSecondaryStyle("#33D6EA")}>About</a>
       <a href="/user-guide" onClick={event => handleNavigate(event, "/user-guide")} style={ctaSecondaryStyle("#FFEE57")}>User Guide</a>
       <a href="/privacy.html" style={ctaSecondaryStyle("#FF83EA")}>Privacy</a>
       <a href="/terms.html" style={ctaSecondaryStyle("#FFB570")}>Terms</a>
      </div>
     </nav>

    </div>
   </section>
  </WidgetShell>
 )
}

const SuperfanCardWidget: React.FC<{
  data: DashboardData
  common: CommonWidgetProps
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
      <div className="vt-widget-fill" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
  common: CommonWidgetProps
}> = ({ data, common }) => {
  const [metric, setMetric] = useState<"revenue" | "views" | "subscribers">("revenue")
  const [renderedAt] = useState(() => Date.now())
  
  const weeklyData = useMemo(() => {
    // Basic 4-week simulation based on canonicalRows if direct week-buckets aren't available
    const weeks = [0, 0, 0, 0]
    data.canonicalRows.forEach(row => {
      const d = new Date(row.uploadDate)
      const diff = (renderedAt - d.getTime()) / (1000 * 3600 * 24 * 7)
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
  }, [data.canonicalRows, metric, renderedAt])

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
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemoveWidget,
}) => {
  const account = useUnifiedAccount();
  const timeWindows = ["7 DAYS", "14 DAYS", "28 DAYS", "60 DAYS", "90 DAYS", "180 DAYS", "365 DAYS", "LIFETIME"];
  const [kpiTimeWindowIdx, setKpiTimeWindowIdx] = useState(2);

  const common = {
  widget,
  instance,
  editMode,
  canEdit,
  onToggleCollapse: () => onToggleCollapse(widget.id),
  onCycleSize: () => onCycleSize(widget.id),
  onDecSize: () => onDecSize(widget.id),
  onCycleHeight: () => onCycleHeight(widget.id),
  onDecHeight: () => onDecHeight(widget.id),
  onRemove: () => onRemoveWidget(widget.id),
 }

 if (widget.id === "app-verification-explainer") {
  return <VerificationExplainerWidget common={common} onNavigate={onNavigate} />
 }

 const LazyWidgetRenderer = LAZY_WIDGET_RENDERERS[widget.rendererKey]
 if (LazyWidgetRenderer) {
  return <LazyWidgetRenderer {...common} data={data} editMode={editMode} />
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
    <WidgetShell {...common} icon={<CalendarDays size={22} />}>
     <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: "4px" }}>
      <span style={{ fontSize: "10px", fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
       Last 21 Days
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
          <div key={day.dateStr} 
           className="group"
           style={{ 
           aspectRatio: "1/1",
           background: bgStyle, 
           border: brdStyle, 
           borderStyle: brdDashed ? "dashed" : "solid",
           borderRadius: "8px",
           display: "flex", alignItems: "center", justifyContent: "center",
           position: "relative",
           minWidth: "24px",
           overflow: "hidden"
          }}>
           {day.isToday && (
             <span style={{ fontSize: "6px", fontWeight: 800, color: "#FF3399", textTransform: "uppercase", position: "absolute", bottom: "2px" }}>Today</span>
           )}
           <div className="opacity-0 group-hover:opacity-50 transition-opacity absolute bottom-0 right-0 flex flex-col items-center justify-end leading-none p-[2px]" style={{ fontSize: "10px", fontWeight: 900, background: "transparent", borderTopLeftRadius: "4px" }}>
             <span style={{ transform: "scale(0.85)" }}>{new Date(day.dateStr).toLocaleDateString([], {weekday: 'short'}).toUpperCase()}</span>
             <span style={{ transform: "scale(0.85)" }}>{day.dayNum}</span>
           </div>
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

  // 1. CHANNEL OVERVIEW
  if (widget.id === "kpi-cluster") {
   const avatar = data.avatarUrl || ""
   const isSmall = instance.size === "quarter" || instance.size === "third" || instance.size === "half"
   const rainbowKpiColors = [
    "#40C6E9", // cyan
    "#579AFF", // blue
    "#7A2BFF", // purple
    "#FF83EA", // pink
    "#FF4D4D", // red
    "#FFB570", // orange
    "#FFE357", // yellow
    "#4FFF5B", // green
    "#3FE0C5", // turquoise
   ]

   const timeWindowToggle = (
    <WidgetHeaderStepper
     label="Channel overview time window"
     value={timeWindows[kpiTimeWindowIdx]}
     onPrevious={() => setKpiTimeWindowIdx(prev => (prev > 0 ? prev - 1 : timeWindows.length - 1))}
     onNext={() => setKpiTimeWindowIdx(prev => (prev + 1) % timeWindows.length)}
    />
   )

   return (
    <WidgetShell {...common} icon={<TrendingUp size={22} />} headerContent={timeWindowToggle}>
     <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="kpi-cluster-row" style={{ display: "flex", gap: "6px", flex: 1, overflow: "hidden", padding: "2px" }}>
       {/* Circular Avatar Sidebar — replaced with a sign-up nudge when no account is connected */}
       {!data.authState.isAuthenticated ? (
        <div className="kpi-cluster-avatar" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "8px",
          flexShrink: 0,
          width: "clamp(72px, 30vw, 222px)",
          height: "clamp(72px, 30vw, 222px)",
        }}>
         <p style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.3, margin: "0 0 2px" }}>
          Connect your channel to see real analytics here.
         </p>
         <button
          onClick={() => void account.start(account.intent, window.location.pathname + window.location.search + window.location.hash)}
          style={{ border: "2px solid #000", borderRadius: "8px", background: "#000", color: "#C0F240", padding: "9px 10px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", textAlign: "left", boxShadow: "3px 3px 0 0 rgba(0,0,0,.35)" }}
         >
          Join ViewTube — Free
         </button>
         <button
          onClick={() => onNavigate("/about")}
         style={{ border: "2px solid #000", borderRadius: "8px", background: "#40C6E9", padding: "8px 10px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", textAlign: "left" }}
         >
          About ViewTube
         </button>
         <button
          onClick={() => onNavigate("/user-guide")}
          style={{ border: "2px solid #000", borderRadius: "8px", background: "#FFDA47", padding: "8px 10px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", textAlign: "left" }}
         >
          User Guide
         </button>
        </div>
       ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          flexShrink: 0,
          width: "222px",
          marginRight: "0px",
          paddingRight: "0px",
          height: "222px"
        }}>
         <div style={{
           width: "204px",
           height: "204px",
           borderRadius: "50%",
           border: "4px solid color-mix(in srgb, var(--widget-color, #000) 60%, black)",
           overflow: "hidden",
           background: "rgb(238, 238, 238)",
           boxShadow: "rgba(0, 0, 0, 0.1) 4px 4px 0px 0px"
         }}>
          {avatar ? (
            <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={isSmall ? 40 : 60} opacity={0.2} />
            </div>
          )}
         </div>
        </div>
       )}

       {/* Stats Grid - 3x2 on small, 6x1 on large */}
       <div style={{
         flex: 1,
         display: "grid",
         gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
         gridTemplateRows: "repeat(3, minmax(0, 1fr))",
         gap: "4px"
       }}>
        {data.getKpiStatBlocks(timeWindows[kpiTimeWindowIdx] === "LIFETIME" ? 99999 : parseInt(timeWindows[kpiTimeWindowIdx])).map((stat: any, idx: number) => {
          const bars = stat.bars || [40, 60, 45, 80, 55, 90, 75]

          let cleanTrend = stat.trend || ""
          if (cleanTrend) {
           const match = cleanTrend.match(/([+-]?)(\d+(\.\d+)?)%/)
           if (match) {
             const sign = match[1]
             const val = parseFloat(match[2])
             cleanTrend = val >= 100 ? `${sign}${Math.round(val).toString().slice(0, 4)}%` : `${sign}${val.toFixed(1).slice(0, 4)}%`
           }
          }

         const cardColor = stat.color || rainbowKpiColors[idx % rainbowKpiColors.length]

           return (
             <div
             key={idx}
             style={{
              background: "#fff",
              border: `2px solid black`,
              borderRadius: "8px",
              boxShadow: `2px 2px 0px 0px rgba(0,0,0,0.1)`,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden"
             }}>
             <div
              style={{
               background: cardColor,
               borderBottom: "2px solid black",
               height: "22px",
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               padding: "0 4px",
              }}>
              <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.02em", color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
               {stat.label}
              </span>
             </div>
              <div style={{ padding: "2px 4px 0px", display: "flex", alignItems: "baseline", justifyContent: (stat as any).secondaryValue ? "space-between" : "center", gap: "2px" }}>
               <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
                {stat.value}
               </div>
               {(stat as any).secondaryValue != null ? (
                 <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "2px", lineHeight: 1 }}>
                   <span style={{ fontSize: "16px", fontWeight: 900, color: (stat as any).secondaryIsIncrease ? "#008B00" : "#D32F2F" }}>
                     {(stat as any).secondaryValue}
                   </span>
                   <span style={{ fontSize: "10px", fontWeight: 900, color: (stat as any).secondaryIsIncrease ? "#008B00" : "#D32F2F" }}>
                     {(stat as any).secondaryIsIncrease ? "▲" : "▼"}
                   </span>
                 </div>
               ) : stat.trend ? (
                 <span style={{ fontSize: "8px", fontWeight: 900, color: stat.trend.includes("▲") || stat.trend.includes("+") ? "#008B00" : "#D32F2F" }}>
                   {cleanTrend} {stat.trend.includes("▲") || stat.trend.includes("+") ? "▲" : "▼"}
                 </span>
               ) : null}
              </div>
             <div style={{ display: "flex", alignItems: "flex-end", gap: "1px", padding: "0 2px 0", height: "14px", marginTop: "auto" }}>
              {bars.map((h: number, i: number) => (
               <div key={i} style={{ flex: 1, height: `${h}%`, background: cardColor, opacity: 0.4 + (h / 100) * 0.6, borderRadius: "1px 1px 0 0" }} />
              ))}
             </div>
            </div>
           )
        })}
       </div>
      </div>

      {/* Full Width Footer */}
      <div style={{
        borderTop: "3px solid var(--widget-border, #000)",
        background: "#eee",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "auto",
        marginLeft: "-10px",
        marginRight: "-10px",
        marginBottom: "-10px",
        width: "calc(100% + 20px)"
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "18px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            {data.channelTitle}
          </div>
          <div style={{ fontSize: "12px", fontWeight: 800, opacity: 0.5 }}>
            {data.channelCustomUrl.startsWith("@") ? data.channelCustomUrl : `@${data.channelCustomUrl}`}
          </div>
        </div>
        <a
          href={`https://youtube.com/${data.brain?.channelProfile?.channelHandle ? '@' + data.brain.channelProfile.channelHandle.replace(/^@/, '') : (data.authState?.channelHandle ? '@' + data.authState.channelHandle.replace(/^@/, '') : "")}`}
          target="_blank"
          rel="noreferrer"
          className="vt-button primary"
          style={{
            height: "32px",
            padding: "0 16px",
            fontSize: "11px",
            fontWeight: 900,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
         >
          VISIT CHANNEL
        </a>
      </div>
     </div>
    </WidgetShell>
   )
  }

 // 2. SOCIAL CHANNELS (was Channel Overview)
 if (widget.id === "channel-overview") {
  return (
   <WidgetShell {...common} icon={<UserCircle2 size={22} />}>
    <div className="vt-widget-fill" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", height: "100%", minHeight: 0 }}>
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
    {(() => {
      const pages = data.quickActions.filter((a: any) => !a.isTool);
      const tools = data.quickActions.filter((a: any) => a.isTool);

      const renderAction = (action: any, idx: number) => {
        let IconComponent = Layers;
        if (action.icon === "Video") IconComponent = Video;
        else if (action.icon === "Upload") IconComponent = Upload;
        else if (action.icon === "Activity") IconComponent = Activity;
        else if (action.icon === "Image") IconComponent = ImageIcon;
        else if (action.icon === "MessageSquare") IconComponent = MessageSquare;
        else if (action.icon === "MessageCircle") IconComponent = MessageCircle;
        else if (action.icon === "Monitor") IconComponent = Monitor;
        else if (action.icon === "Rocket") IconComponent = Rocket;
        else if (action.icon === "Magnet") IconComponent = Magnet;
        else if (action.icon === "WandSparkles") IconComponent = WandSparkles;
        else if (action.icon === "Layers") IconComponent = Layers;
        else if (action.icon === "CalendarDays") IconComponent = CalendarDays;
        else if (action.icon === "Bot") IconComponent = Bot;
        else if (action.icon === "RefreshCw") IconComponent = RefreshCw;
        else if (action.icon === "Edit3") IconComponent = Edit3;
        else if (action.icon === "Settings") IconComponent = Settings;
        else if (action.icon === "BookOpen") IconComponent = BookOpen;

        return (
         <button
          key={idx}
          onClick={() => onNavigate(action.to)}
          className={`vt-button split primary`}
          style={{
           "--widget-color": action.color || undefined,
           fontSize: "12px",
           border: action.isTool ? "2px solid #000" : undefined,
           color: action.isTool ? "#000" : undefined,
          } as React.CSSProperties}
         >
          <span className="split-icon" style={{
              ...(action.iconColor ? { color: action.iconColor } : {}),
              ...(action.isTool ? { color: "#000", borderRight: "2px solid #000" } : {})
          }}>
            <IconComponent size={18} strokeWidth={2.5} />
          </span>
          <span className="split-label">{action.label}</span>
         </button>
        )
      }

      return (
        <div className="vt-widget-fill">
          <div
           style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "4px",
           }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {pages.map((action: any, idx: number) => renderAction(action, idx))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {tools.map((action: any, idx: number) => renderAction(action, idx))}
            </div>
          </div>
        </div>
      )
    })()}
   </WidgetShell>
  )
 }

 // 6. UPLOADS
 if (widget.id === "recent-uploads") {
  return (
   <WidgetShell {...common} icon={<Upload size={22} />}>
    <div className="vt-widget-fill" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
      className="vt-widget-fill"
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
    return <GoalsTrackerWidget data={data} commonProps={common} />
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
    <div className="vt-widget-fill" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
  const model = localStorage.getItem("GEMINI_MODEL") || "gemini-3.0-flash"
  const isConnected = data.authState.isAuthenticated
  const lastSyncTimestamp = data.lastSyncComplete ? Date.parse(data.lastSyncComplete) : null
  const lastSync = data.formatRelativeTime(Number.isFinite(lastSyncTimestamp) ? lastSyncTimestamp : null)
  const planId = String(localStorage.getItem("vt_last_plan") || "basic").toUpperCase()
  const currentModelLabel =
   model === "gemini-3.1-pro-preview"
    ? "GEMINI 3.1 PRO PREVIEW"
    : model === "gemini-3.1-flash-lite"
     ? "GEMINI 3.1 FLASH LITE"
     : model === "gemini-3-flash-preview"
      ? "GEMINI 3 FLASH PREVIEW"
      : model === "gemini-3.1-flash-image-preview"
       ? "GEMINI 3.1 FLASH IMAGE"
       : "GEMINI 3.1 FLASH LITE"

  return (
   <WidgetShell {...common} icon={<Database size={22} />}>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
     <div style={{ display: "flex", gap: "6px" }}>
      <div style={{ flex: 1, border: "2px solid #000", borderRadius: "8px", padding: "6px 8px", background: isConnected ? "#4FFF5B" : "#FF1744" }}>
       <div style={{ fontSize: "8px", fontWeight: 900, opacity: 0.7, textTransform: "uppercase" }}>Channel</div>
       <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>{isConnected ? "Connected" : "Not connected"}</div>
      </div>
      <div style={{ flex: 1, border: "2px solid #000", borderRadius: "8px", padding: "6px 8px", background: "#fff" }}>
       <div style={{ fontSize: "8px", fontWeight: 900, opacity: 0.7, textTransform: "uppercase" }}>Last Sync</div>
       <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>{isConnected ? lastSync : "Never"}</div>
      </div>
     </div>

     <div style={{ border: "2px solid #000", borderRadius: "8px", padding: "6px 8px", background: "#fff", display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
       <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.7, textTransform: "uppercase" }}>Active AI Brain</span>
       <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", border: "2px solid #000", borderRadius: "6px", padding: "1px 6px", background: "#f3f4f6" }}>{currentModelLabel}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
       <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.7, textTransform: "uppercase" }}>Plan</span>
       <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", border: "2px solid #000", borderRadius: "6px", padding: "1px 6px", background: "#f3f4f6" }}>{planId}</span>
      </div>
     </div>

     <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
      <button
       className="vt-button primary"
       style={{ flex: 1, height: "32px", fontSize: "9px", background: "#00D2FF" }}
       onClick={async () => {
        if (isConnected) await data.globalSyncData({ batchMode: "initial" })
        else onNavigate("/connect")
       }}
      >
       {isConnected ? "SYNC NOW" : "CONNECT"}
      </button>
      <button
       className="vt-button"
       style={{ flex: 1, height: "32px", fontSize: "9px", background: "#eee" }}
       onClick={() => onNavigate("/account")}
      >
       ACCOUNT
      </button>
     </div>
     <div style={{ display: "flex", gap: "6px" }}>
      <button className="vt-button" style={{ flex: 1, height: "30px", fontSize: "9px", background: "#f3f4f6" }} onClick={() => onNavigate("/account?panel=billing")}>
       BILLING
      </button>
      <button className="vt-button" style={{ flex: 1, height: "30px", fontSize: "9px", background: "#f3f4f6" }} onClick={() => onNavigate("/user-guide")}>
       USER GUIDE
      </button>
     </div>
    </div>
   </WidgetShell>
  )
 }

 // 15. NEWS TICKER (placeholder)
 // Alerts ticker removed (now implemented in DashboardHeader)

 if (widget.id === "task-stack" || widget.id === "alerts-ticker") {
  return (
   <WidgetShell {...common} icon={widget.id === "alerts-ticker" ? <Bell size={20} /> : <Layers size={20} />}>
    <div className="widget-state-panel is-empty" role="status">
     <strong>Preview module</strong>
     <p>{widget.id === "alerts-ticker"
      ? "Live alerts now appear in the dashboard header. This legacy module remains available for layout compatibility."
      : "Task Stack is preserved as a preview until its data and interaction certification is complete."}</p>
    </div>
   </WidgetShell>
  )
 }

 return (
  <WidgetShell {...common}>
   <p className="label-tiny" style={{ opacity: 0.3 }}>
    Widget Unmapped
   </p>
  </WidgetShell>
 )
}