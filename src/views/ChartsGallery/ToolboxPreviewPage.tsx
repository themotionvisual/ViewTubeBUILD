import React, { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, LayoutGrid, Layers, RadioTower } from "lucide-react"
import { useBrain } from "../../context/GlobalDataContext"
import type { ChartConfig } from "../../types"
import { getMasterRows } from "../../services/analyticsSelectors"
import { ChannelyticsChartToolbox } from "../../components/ChannelyticsChartToolbox"
import { RenderChart } from "../../components/ChartEngine"

type PreviewSourceMode = "canonical_api" | "uploaded_hybrid" | "fixture"

type PreviewRow = Record<string, unknown>

const FIXTURE_ROWS: PreviewRow[] = [
 {
  "Video title": "How to Improve Viewer Retention in 60 Seconds",
  "Video ID": "fixture01",
  Format: "shorts",
  Views: 64793,
  Impressions: 435210,
  "CTR (%)": 4.2,
  "AVP (%)": 61.2,
  Likes: 2178,
  Comments: 124,
  Shares: 89,
  "Subscribers Gained": 38,
  "Watch Time (Hours)": 1230,
  Revenue: 27.99,
 },
 {
  "Video title": "The Thumbnail Pattern That Increased CTR",
  "Video ID": "fixture02",
  Format: "long",
  Views: 39184,
  Impressions: 288060,
  "CTR (%)": 5.1,
  "AVP (%)": 72.4,
  Likes: 1844,
  Comments: 201,
  Shares: 55,
  "Subscribers Gained": 43,
  "Watch Time (Hours)": 924.5,
  Revenue: 21.44,
 },
 {
  "Video title": "3 Editing Tweaks for Better Watch Time",
  "Video ID": "fixture03",
  Format: "shorts",
  Views: 21344,
  Impressions: 154893,
  "CTR (%)": 6.3,
  "AVP (%)": 83.8,
  Likes: 1301,
  Comments: 67,
  Shares: 102,
  "Subscribers Gained": 29,
  "Watch Time (Hours)": 414.2,
  Revenue: 9.18,
 },
]

const toPreviewRow = (row: any, index: number): PreviewRow => {
 const metricCells = (row.__metricCells || {}) as Record<string, { value?: number }>
 return {
  "Video title": row["Video title"] || row.videoTitle || `Video ${index + 1}`,
  "Video ID": row["Video ID"] || row.videoId || `row-${index + 1}`,
  Format: row.Format || row._userTag || "long",
  Views: row.Views || metricCells.views?.value || 0,
  Impressions: row.Impressions || metricCells.impressions?.value || 0,
  "CTR (%)":
   row["CTR (%)"] ||
   row["Click-Through Rate (CTR)"] ||
   metricCells.ctr?.value ||
   0,
  "AVP (%)": row["AVP (%)"] || metricCells.avp?.value || 0,
  Likes: row.Likes || metricCells.likes?.value || 0,
  Comments: row.Comments || metricCells.comments?.value || 0,
  Shares: row.Shares || metricCells.shares?.value || 0,
  "Subscribers Gained":
   row["Subscribers Gained"] || row["Subs +"] || metricCells.subscribersGained?.value || 0,
  "Watch Time (Hours)":
   row["Watch Time (Hours)"] || metricCells.watchHours?.value || 0,
  Revenue: row.Revenue || metricCells.revenue?.value || 0,
 }
}

const ToolboxPreviewPage: React.FC = () => {
 const { brain } = useBrain()
 const [sourceMode, setSourceMode] = useState<PreviewSourceMode>("canonical_api")

 const canonicalApiRows = useMemo(
  () => getMasterRows("lifetime", "api").map((row, index) => toPreviewRow(row, index)),
  [],
 )

 const uploadedHybridRows = useMemo(() => {
  const channelyticsRows = (brain.channelyticsState?.allData || []) as PreviewRow[]
  const researchRows = (brain.researchLabState?.allData || []) as PreviewRow[]
  return [...channelyticsRows, ...researchRows].map((row, index) =>
   toPreviewRow(row, index),
  )
 }, [brain.channelyticsState?.allData, brain.researchLabState?.allData])

 const activeRows = useMemo(() => {
  if (sourceMode === "fixture") return FIXTURE_ROWS
  if (sourceMode === "uploaded_hybrid") return uploadedHybridRows
  return canonicalApiRows
 }, [canonicalApiRows, uploadedHybridRows, sourceMode])

 const sampleLineChart = useMemo<ChartConfig>(
  () => ({
   title: "Preview: Engagement Map",
   subtitle: "COMMENTS × SUBS × SHARES × LIKES",
   type: "line",
   provider: "google",
   xAxisKey: "Video",
   dataKeys: ["Comments", "Subscribers", "Shares", "Likes"],
   data: () => [
    ["Video", "Comments", "Subscribers", "Shares", "Likes"],
    ...activeRows.slice(0, 20).map((row, idx) => [
     String(row["Video title"] || `Video ${idx + 1}`),
     Number(row.Comments || 0),
     Number(row["Subscribers Gained"] || 0),
     Number(row.Shares || 0),
     Number(row.Likes || 0),
    ]),
   ],
   tier: "A",
   requiredMetrics: ["comments", "subscribers_gained", "shares", "likes"],
   insight: {
    title: "Engagement Rank Rail",
    statPair: "COMMENTS x LIKES",
    reveal: "Ranks recent videos by selected social signal and exposes outliers.",
   },
  }),
  [activeRows],
 )

 const sampleBubbleChart = useMemo<ChartConfig>(
  () => ({
   title: "Preview: Value Matrix",
   subtitle: "CTR × RETENTION × VIEWS",
   type: "bubble",
   provider: "google",
   xAxisKey: "CTR %",
   dataKeys: ["Retention %", "Views"],
   data: () => [
    ["ID", "CTR %", "Retention %", "Type", "Views"],
    ...activeRows.slice(0, 25).map((row, idx) => [
     String(row["Video title"] || `Video ${idx + 1}`),
     Number(row["CTR (%)"] || 0),
     Number(row["AVP (%)"] || 0),
     String(row.Format || "long"),
     Number(row.Views || 0),
    ]),
   ],
   tier: "A",
   requiredMetrics: ["ctr_percent", "retention_percent", "views"],
   insight: {
    title: "Value Quadrants",
    statPair: "CTR x RETENTION",
    reveal: "Shows packaging-delivery fit with bubble size weighted by views.",
   },
  }),
  [activeRows],
 )

 return (
  <div className="min-h-screen bg-[#f4f4f0] pb-10">
   <div className="max-w-[1500px] mx-auto px-4 md:px-8 pt-6 space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
     <div className="flex items-center gap-3">
      <Link
       to="/charts-gallery"
       className="h-11 px-4 inline-flex items-center gap-2 bg-white border-[3px] border-black rounded-xl font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_black]">
       <ArrowLeft size={14} />
       Back
      </Link>
      <div>
       <h1 className="text-3xl font-[1000] uppercase tracking-tight">
        Toolbox Preview
       </h1>
       <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">
        ChannelyticsChartToolbox + ChartEngine QA Surface
       </p>
      </div>
     </div>
     <div className="h-11 px-4 bg-white border-[3px] border-black rounded-xl inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em]">
      <RadioTower size={14} />
      {activeRows.length.toLocaleString()} rows loaded
     </div>
    </div>

    <div className="bg-white border-[4px] border-black rounded-2xl p-4 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-black/55 mr-2">
       Data Source
      </span>
      <button
       type="button"
       onClick={() => setSourceMode("canonical_api")}
       className={`h-9 px-3 border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-wider ${
        sourceMode === "canonical_api" ? "bg-black text-white" : "bg-white text-black"
       }`}>
       Live canonical API cache
      </button>
      <button
       type="button"
       onClick={() => setSourceMode("uploaded_hybrid")}
       className={`h-9 px-3 border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-wider ${
        sourceMode === "uploaded_hybrid" ? "bg-black text-white" : "bg-white text-black"
       }`}>
       Live uploaded CSV / hybrid
      </button>
      <button
       type="button"
       onClick={() => setSourceMode("fixture")}
       className={`h-9 px-3 border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-wider ${
        sourceMode === "fixture" ? "bg-black text-white" : "bg-white text-black"
       }`}>
       Deterministic fixture
      </button>
    </div>

    <section className="space-y-3">
     <div className="flex items-center gap-2 text-black">
      <Layers size={16} />
      <h2 className="text-xl font-[1000] uppercase tracking-tight">
       ChannelyticsChartToolbox
      </h2>
     </div>
     <ChannelyticsChartToolbox
      rows={activeRows}
      dataDateRange="LIFETIME (PREVIEW SURFACE)"
     />
    </section>

    <section className="space-y-3">
     <div className="flex items-center gap-2 text-black">
      <LayoutGrid size={16} />
      <h2 className="text-xl font-[1000] uppercase tracking-tight">ChartEngine</h2>
     </div>
     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="border-[4px] border-black rounded-2xl bg-white p-3">
       <RenderChart chart={sampleLineChart} isModal data={activeRows} />
      </div>
      <div className="border-[4px] border-black rounded-2xl bg-white p-3">
       <RenderChart chart={sampleBubbleChart} isModal data={activeRows} />
      </div>
     </div>
    </section>
   </div>
  </div>
 )
}

export default ToolboxPreviewPage
