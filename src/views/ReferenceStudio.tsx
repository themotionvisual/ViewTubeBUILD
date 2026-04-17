import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import {
 generateThumbnail,
 rateThumbnail,
 generateThumbnailConcept,
} from "../services/gemini"
import { AspectRatio, ImageSize, type ThumbnailHistoryItem } from "../types"
import { useBrain } from "../context/GlobalDataContext"
import { CustomIcon } from "../components/CustomIcon"
import { AccordionContainer } from "../components/Toolbox"
import { EXTERNAL_INGEST_SOURCES } from "../services/externalIngestSources"
import {
 ResponsiveContainer,
 LineChart,
 Line,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ReferenceLine,
 ScatterChart,
 Scatter,
 ZAxis,
 PieChart,
 Pie,
 Cell,
} from "recharts"

const NativeUIKit = React.lazy(() =>
 import("../components/NativeUIKit").then((module) => ({
  default: module.NativeUIKit,
 })),
)
const UIReferenceLibraryContent = React.lazy(
 () => import("../components/UIReferenceLibraryContent"),
)
const ToolboxUISystem = React.lazy(
 () => import("../components/ToolboxUISystem"),
)
const SectionSourcesLab = React.lazy(
 () => import("./referenceStudio/SectionSourcesLab"),
)
const FourSectionsRun = React.lazy(
 () => import("./referenceStudio/FourSectionsRun"),
)
const ComponentCatalog = React.lazy(
 () => import("./referenceStudio/ComponentCatalog"),
)
const ChartCatalog = React.lazy(
 () => import("./referenceStudio/ChartCatalog"),
)
const ChartSpecImplementation = React.lazy(
 () => import("./referenceStudio/ChartSpecImplementation"),
)
const ToolboxRecreation = React.lazy(
 () => import("./referenceStudio/ToolboxRecreation"),
)
const WidgetLab = React.lazy(
 () => import("./referenceStudio/WidgetLab"),
)

const LEGACY_TOOL_TAB_REGISTRY: LegacyToolTabDefinition[] = [
 {
  id: "algorithm-architect",
  label: "Algorithm Architect",
  loader: () => import("./AlgorithmArchitect"),
  status: "legacy",
 },
 {
  id: "channelytics",
  label: "Channelytics",
  loader: () => import("./Channelytics"),
  status: "active",
 },
 {
  id: "research-lab",
  label: "Research Lab",
  loader: () => import("./ResearchLab"),
  status: "legacy",
 },
 {
  id: "data-vizualizations",
  label: "Data Vizualizations",
  loader: () => import("./DataVizualizations"),
  status: "legacy",
 },
 {
  id: "settings-legacy",
  label: "Settings (Legacy)",
  loader: () => import("./Settings"),
  status: "legacy",
 },
]

const LEGACY_TOOL_COMPONENTS = Object.fromEntries(
 LEGACY_TOOL_TAB_REGISTRY.map((tab) => [tab.id, React.lazy(tab.loader)]),
) as Record<
 LegacyToolTabId,
 React.LazyExoticComponent<React.ComponentType<any>>
>

type ReferenceTab =
 | "toolbox-system"
 | "four-sections-run"
 | "component-grid"
 | "section-sources-lab"
 | "component-catalog"
 | "chart-catalog"
 | "chart-spec-implementation"
 | "toolbox-recreation"
 | "widget-lab"
 | "analytics-lab"
 | "thumbnail"
 | "library"
 | "native"
 | "legacy"

type LegacyToolTabId =
 | "algorithm-architect"
 | "channelytics"
 | "research-lab"
 | "data-vizualizations"
 | "settings-legacy"

interface LegacyToolTabDefinition {
 id: LegacyToolTabId
 label: string
 loader: () => Promise<{ default: React.ComponentType<any> }>
 status: "active" | "legacy"
}

interface ReferenceImage {
 id: string
 file: File
 previewUrl: string
 usageType: string
}

interface MegaDroppedImage {
 id: string
 file: File
 previewUrl: string
}

interface MegaRowLayout {
 id: number
 stage: string
 title: string
 widths: number[]
 tone: string
}

const MEGA_ROW_PATTERNS: number[][] = [
 [3, 2, 1],
 [1, 1, 1, 1],
 [2, 1],
 [1, 2, 1],
 [2, 2, 1],
 [1, 1, 2],
 [4, 1, 1],
 [2, 1, 1, 1],
 [3, 1],
 [1, 1, 1, 2],
 [2, 3],
 [1, 2, 2],
 [2, 1, 2],
 [3, 1, 1],
 [1, 3, 1],
 [2, 2, 2],
 [1, 1, 3],
 [4, 2],
 [2, 1, 1, 2],
 [3, 2, 2],
]

const MEGA_STAGES = ["Signal", "Routing", "Formatting", "Behavior", "Delivery"]
const MEGA_TONES = ["#00CCFF", "#CCFF00", "#FF7497", "#FFDD00", "#FFB158"]
const CAUSE_EFFECT_STEPS = [
 "Capture Inputs",
 "Normalize Rules",
 "Apply Format Logic",
 "Resolve Dependencies",
 "Render Interactive Output",
 "Track Feedback Loop",
]

const BEST_COMPONENTS = [
 {
  id: "toolbox-system",
  title: "Toolbox UI System",
  source: "Lumos thumbnail + rules module",
  reason: "Definitive aligned toolbox scaffold and standards.",
  tab: "toolbox-system" as const,
  accent: "bg-[#24D3FF]",
 },
 {
  id: "shell",
  title: "Thumbnail Studio Shell",
  source: "Header + Accordion composition",
  reason: "Best visual hierarchy and interaction density.",
  tab: "thumbnail" as const,
  accent: "bg-[#FFE357]",
 },
 {
  id: "matrix",
  title: "Mega Toolbox Matrix",
  source: "Cause-effect layouts + data table engine",
  reason: "Most scalable container pattern.",
  tab: "matrix" as const,
  accent: "bg-[#00CCFF]",
 },
 {
  id: "library",
  title: "Reference Library",
  source: "Section C + Section E components",
  reason: "Primary source of reusable UI choices.",
  tab: "library" as const,
  accent: "bg-[#B14AED]",
 },
 {
  id: "native",
  title: "Native UI Kit",
  source: "Integrated standalone component kit",
  reason: "Fastest path to consistent production styling.",
  tab: "native" as const,
  accent: "bg-[#CCFF00]",
 },
]

const REFERENCE_TABS: { id: ReferenceTab; label: string; accent: string }[] = [
 { id: "toolbox-system", label: "Toolbox UI System", accent: "bg-[#24D3FF]" },
 { id: "four-sections-run", label: "4 Sections Run", accent: "bg-[#FFB158]" },
 { id: "component-grid", label: "Component Grid", accent: "bg-[#C9F830]" },
 { id: "section-sources-lab", label: "Section Sources Lab", accent: "bg-[#FFB158]" },
 { id: "component-catalog", label: "Component Catalog", accent: "bg-[#B14AED]" },
 { id: "chart-catalog", label: "Chart Catalog", accent: "bg-[#00CCFF]" },
 {
  id: "chart-spec-implementation",
  label: "Chart Spec Implementation",
  accent: "bg-[#FFE357]",
 },
 { id: "toolbox-recreation", label: "Toolbox Recreation", accent: "bg-[#FF7497]" },
 { id: "widget-lab", label: "Widget Lab", accent: "bg-[#B14AED]" },
 { id: "analytics-lab", label: "Analytics Lab", accent: "bg-[#FFB158]" },
 { id: "thumbnail", label: "Thumbnail", accent: "bg-[#FFE357]" },
 { id: "library", label: "Library", accent: "bg-[#B14AED]" },
 { id: "native", label: "Native Kit", accent: "bg-[#CCFF00]" },
 { id: "legacy", label: "Legacy Tools", accent: "bg-[#FF7497]" },
]

const DEFAULT_REFERENCE_TAB: ReferenceTab = "toolbox-system"

const isReferenceTab = (value: string | undefined): value is ReferenceTab =>
 !!value && REFERENCE_TABS.some((tab) => tab.id === value)

const ReferenceStudio: React.FC = () => {
 const { brain } = useBrain()
 const navigate = useNavigate()
 const location = useLocation()
 const { tabId } = useParams<{ tabId?: string }>()
 const referenceBasePath = location.pathname.startsWith("/render-bench/reference-studio")
  ? "/render-bench/reference-studio"
  : "/reference-studio"
 const activeReferenceTab: ReferenceTab = isReferenceTab(tabId)
  ? tabId
  : DEFAULT_REFERENCE_TAB

 // Tab State
 const [activeTab, setActiveTab] = useState<"generate" | "analyze">("generate")
 const [isMainToolOpen, setIsMainToolOpen] = useState(true)
 const [activeLegacyTab, setActiveLegacyTab] = useState<LegacyToolTabId>(
  LEGACY_TOOL_TAB_REGISTRY[0].id,
 )
 const [engagementSortMetric, setEngagementSortMetric] = useState<
  "likes" | "comments" | "shares" | "views"
 >("comments")
 const [analyticsRange, setAnalyticsRange] = useState<"lifetime" | "28d">("lifetime")

 // Loading States
 const [genLoading, setGenLoading] = useState(false)
 const [conceptLoading, setConceptLoading] = useState(false)
 const [analyzeLoading, setAnalyzeLoading] = useState(false)

 // Core States
 const [prompt, setPrompt] = useState("")
 const [largeText, setLargeText] = useState("")
 const [smallText, setSmallText] = useState("")
 const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
  AspectRatio.LANDSCAPE_16_9,
 )
 const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K)
 const [generatedImage, setGeneratedImage] = useState<string | null>(null)
 const [history, setHistory] = useState<ThumbnailHistoryItem[]>([])

 // Advanced States
 const [selectedStyles, setSelectedStyles] = useState<string[]>([])
 const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
 const [palette, setPalette] = useState<string[]>([
  "#C9F830",
  "#FF7497",
  "",
  "",
  "",
 ])

 // Analyzer States
 const [analysisFile, setAnalysisFile] = useState<File | null>(null)
 const [analysisPreview, setAnalysisPreview] = useState<string | null>(null)
 const [analysisResult, setAnalysisResult] = useState<string>("")
 const fileInputRef = useRef<HTMLInputElement>(null)

 // Mega Toolbox States
 const [activeCauseStep, setActiveCauseStep] = useState(1)
 const [impactBias, setImpactBias] = useState(64)
 const [globalFormat, setGlobalFormat] = useState<
  "compact" | "balanced" | "expanded"
 >("balanced")
 const [megaFilter, setMegaFilter] = useState<"all" | "signal" | "delivery">(
  "all",
 )
 const [megaDroppedImages, setMegaDroppedImages] = useState<MegaDroppedImage[]>(
  [],
 )
 const [draggingMegaImageId, setDraggingMegaImageId] = useState<string | null>(
  null,
 )
 const [activeMegaCells, setActiveMegaCells] = useState<
  Record<string, boolean>
 >({})
 const megaImageInputRef = useRef<HTMLInputElement>(null)
 const megaImagesRef = useRef<MegaDroppedImage[]>([])

 const THUMBNAIL_STYLES = [
  "Educational",
  "Clickbait",
  "Cinematic",
  "Graphic",
  "Simplified",
  "Mysterious",
  "Minimalist",
  "Vibrant",
  "Dark & Moody",
  "Retro/Vintage",
  "Futuristic",
  "Hand-drawn",
 ]

 const currentSeoResult = brain.seoState?.results?.[0] || null

 const megaRows = useMemo<MegaRowLayout[]>(
  () =>
   MEGA_ROW_PATTERNS.map((widths, index) => {
    const stage = MEGA_STAGES[index % MEGA_STAGES.length]
    return {
     id: index + 1,
     stage,
     title: `${stage} Interaction Matrix ${String(index + 1).padStart(2, "0")}`,
     widths,
     tone: MEGA_TONES[index % MEGA_TONES.length],
    }
   }),
  [],
 )

 const filteredMegaRows = useMemo(() => {
  if (megaFilter === "all") return megaRows
  if (megaFilter === "signal") return megaRows.filter((_, idx) => idx % 2 === 0)
  return megaRows.filter((_, idx) => idx % 2 === 1)
 }, [megaRows, megaFilter])

 const impactTrendData = useMemo(
  () =>
   CAUSE_EFFECT_STEPS.map((_, index) => {
    const phase = index + 1
    const influence = Math.round(
     impactBias +
      phase * 4 +
      (activeCauseStep >= phase ? 9 : -4) +
      ((phase % 2) * 3 - 1),
    )
    const stability = Math.max(
     24,
     Math.round(98 - phase * 6 + (activeCauseStep >= phase ? 3 : -6)),
    )
    return {
     phase: `S${phase}`,
     influence,
     stability,
    }
   }),
  [activeCauseStep, impactBias],
 )

 const outputMixData = useMemo(
  () =>
   ["Charts", "Tables", "State Flows", "Media Rails", "Function Buses"].map(
    (label, index) => ({
     label,
     value: Math.max(
      12,
      Math.round(
       impactBias / 2 +
        index * 7 +
        (index + 1 <= activeCauseStep ? 12 : -2) +
        (globalFormat === "expanded" ? 8 : globalFormat === "compact" ? -4 : 2),
      ),
     ),
    }),
   ),
  [activeCauseStep, globalFormat, impactBias],
 )

 const analyticsRows = useMemo(() => {
  type Row = {
   id: string
   title: string
   format: "shorts" | "long"
   views: number
   likes: number
   comments: number
   shares: number
   subs: number
   watchHours: number
   revenue: number
   ctr: number
   avp: number
   publishedAt: string
  }
  try {
   const cacheRaw = localStorage.getItem("yt_analytics_cache")
   if (!cacheRaw) return [] as Row[]
   const cache = JSON.parse(cacheRaw) as any
   const videos = Array.isArray(cache?.videos) ? cache.videos : []
   const stats = cache?.stats || {}
   const analytics = cache?.analytics || {}
   const headers = (analytics?.columnHeaders || []).map((h: any) =>
    String(h?.name || ""),
   )
   const rows = Array.isArray(analytics?.rows) ? analytics.rows : []
   const byVideo = new Map<string, any>()

   rows.forEach((row: any) => {
    if (Array.isArray(row)) {
      const idx = headers.findIndex((h: string) => h.toLowerCase() === "video")
      if (idx >= 0 && row[idx]) byVideo.set(String(row[idx]), row)
    } else if (row?.video || row?.["Video ID"]) {
      byVideo.set(String(row.video || row["Video ID"]), row)
    }
   })

   const getVal = (source: any, keys: string[]) => {
    if (!source) return 0
    if (Array.isArray(source)) {
      for (const key of keys) {
       const idx = headers.findIndex(
        (h: string) => h.toLowerCase() === key.toLowerCase(),
       )
       if (idx >= 0) {
        const n = Number(String(source[idx] ?? "").replace(/[^0-9.-]/g, ""))
        if (Number.isFinite(n)) return n
       }
      }
      return 0
    }
    for (const key of keys) {
      const n = Number(String(source?.[key] ?? "").replace(/[^0-9.-]/g, ""))
      if (Number.isFinite(n)) return n
    }
    return 0
   }
   const now = Date.now()
   const cutoff28d = now - 28 * 24 * 60 * 60 * 1000

   const sortedVideos = [...videos].sort((a: any, b: any) => {
    const ta = new Date(String(a?.publishedAt || 0)).getTime()
    const tb = new Date(String(b?.publishedAt || 0)).getTime()
    return tb - ta
   })

   return sortedVideos
    .filter((video: any) => {
     if (analyticsRange === "lifetime") return true
     const ts = new Date(String(video?.publishedAt || 0)).getTime()
     return Number.isFinite(ts) && ts >= cutoff28d
    })
    .slice(0, 50)
    .map((video: any) => {
    const id = String(video?.videoId || "")
    const stat = stats[id] || {}
    const analytic = byVideo.get(id)
    const duration = Number(stat?.durationSeconds || 0)
    const contentType = String(
     cache?.videoContentType?.[id] ?? stat?.contentType ?? "",
    ).toLowerCase()
    const hasShortSignal =
     contentType === "shorts" ||
     contentType === "short" ||
     stat?.isShort === true
    const isShort = duration > 180 ? false : hasShortSignal
    const periodViews = getVal(analytic, ["views", "Views"])
    const periodLikes = getVal(analytic, ["likes", "Likes"])
    const periodComments = getVal(analytic, ["comments", "Comments"])
    const lifetimeViews = Number(stat?.viewCount || 0)
    const lifetimeLikes = Number(stat?.likeCount || 0)
    const lifetimeComments = Number(stat?.commentCount || 0)

    const views =
     analyticsRange === "lifetime" && lifetimeViews > 0
      ? lifetimeViews
      : periodViews || lifetimeViews
    const likes =
     analyticsRange === "lifetime" && lifetimeLikes > 0
      ? lifetimeLikes
      : periodLikes || lifetimeLikes
    const comments =
     analyticsRange === "lifetime" && lifetimeComments > 0
      ? lifetimeComments
      : periodComments || lifetimeComments
    const shares = getVal(analytic, ["shares", "Shares"])
    const subs = getVal(analytic, ["subscribersGained", "Subscribers Gained"])
    const watchMin = getVal(analytic, ["estimatedMinutesWatched", "Watch Min"])
    const watchHours = watchMin > 0 ? watchMin / 60 : 0
    const revenue = getVal(analytic, ["estimatedRevenue", "Revenue"])
    const ctrRaw = getVal(analytic, [
     "impressionClickThroughRate",
     "CTR (%)",
     "Click-Through Rate (CTR)",
    ])
    const ctr = ctrRaw > 0 && ctrRaw <= 1 ? ctrRaw * 100 : ctrRaw
    const avpRaw = getVal(analytic, ["averageViewPercentage", "AVP (%)"])
    const avp = avpRaw > 0 && avpRaw <= 1 ? avpRaw * 100 : avpRaw
    return {
     id,
     title: String(video?.title || "Untitled"),
     format: isShort ? "shorts" : "long",
     views,
     likes,
     comments,
     shares,
     subs,
     watchHours,
     revenue,
     ctr,
     avp,
     publishedAt: String(video?.publishedAt || ""),
    } as Row
   })
  } catch {
   return []
  }
 }, [analyticsRange])

 const engagementLineRows = useMemo(() => {
  const sorted = [...analyticsRows].sort(
   (a, b) => Number(b[engagementSortMetric]) - Number(a[engagementSortMetric]),
  )
  return sorted.slice(0, 50).map((row, index) => ({
   order: index + 1,
   likes: row.likes,
   comments: row.comments,
   shares: row.shares,
   views: row.views,
   title: row.title,
  }))
 }, [analyticsRows, engagementSortMetric])

 const splitTotals = useMemo(() => {
  const sum = (format: "shorts" | "long", key: keyof (typeof analyticsRows)[number]) =>
   analyticsRows
    .filter((r) => r.format === format)
    .reduce((total, row) => total + Number(row[key] || 0), 0)

  return {
   views: [
    { name: "Long", value: sum("long", "views"), color: "#00CCFF" },
    { name: "Shorts", value: sum("shorts", "views"), color: "#FF7497" },
   ],
   subs: [
    { name: "Long", value: sum("long", "subs"), color: "#00CCFF" },
    { name: "Shorts", value: sum("shorts", "subs"), color: "#FF7497" },
   ],
   watch: [
    { name: "Long", value: sum("long", "watchHours"), color: "#00CCFF" },
    { name: "Shorts", value: sum("shorts", "watchHours"), color: "#FF7497" },
   ],
   revenue: [
    { name: "Long", value: sum("long", "revenue"), color: "#00CCFF" },
    { name: "Shorts", value: sum("shorts", "revenue"), color: "#FF7497" },
   ],
  }
 }, [analyticsRows])

 useEffect(() => {
  megaImagesRef.current = megaDroppedImages
 }, [megaDroppedImages])

 useEffect(() => {
  return () => {
   megaImagesRef.current.forEach((image) =>
    URL.revokeObjectURL(image.previewUrl),
   )
  }
 }, [])

 const handleManualConceptGen = async () => {
  if (!currentSeoResult && !prompt) return
  setConceptLoading(true)
  try {
   const concept = await generateThumbnailConcept(
    currentSeoResult || undefined,
    prompt,
   )
   setPrompt(concept.prompt)
   setAspectRatio(concept.aspectRatio)
  } catch {
   alert("Failed to generate concept.")
  } finally {
   setConceptLoading(false)
  }
 }

 const handleStyleToggle = (style: string) => {
  setSelectedStyles((prev) => {
   if (prev.includes(style)) return prev.filter((s) => s !== style)
   if (prev.length >= 4) return prev
   return [...prev, style]
  })
 }

 const handleDrop = useCallback((e: React.DragEvent) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
   const newImages = files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    usageType: "background",
   }))
   setReferenceImages((prev) => [...prev, ...newImages])
  }
 }, [])

 const handleDragOver = (e: React.DragEvent) => e.preventDefault()

 const addMegaImages = useCallback((files: File[]) => {
  const imageFiles = files.filter((file) => file.type.startsWith("image/"))
  if (!imageFiles.length) return

  const uploaded = imageFiles.map((file) => ({
   id: crypto.randomUUID(),
   file,
   previewUrl: URL.createObjectURL(file),
  }))

  setMegaDroppedImages((prev) => [...uploaded, ...prev].slice(0, 18))
 }, [])

 const handleMegaToolboxDrop = useCallback(
  (e: React.DragEvent) => {
   e.preventDefault()
   addMegaImages(Array.from(e.dataTransfer.files))
  },
  [addMegaImages],
 )

 const handleMegaToolboxDragOver = (e: React.DragEvent) => e.preventDefault()

 const handleMegaImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files?.length) return
  addMegaImages(Array.from(e.target.files))
  e.target.value = ""
 }

 const removeMegaImage = (id: string) => {
  setMegaDroppedImages((prev) => {
   const toRemove = prev.find((img) => img.id === id)
   if (toRemove) URL.revokeObjectURL(toRemove.previewUrl)
   return prev.filter((img) => img.id !== id)
  })
 }

 const reorderMegaImages = (targetId: string) => {
  if (!draggingMegaImageId || draggingMegaImageId === targetId) return
  setMegaDroppedImages((prev) => {
   const from = prev.findIndex((img) => img.id === draggingMegaImageId)
   const to = prev.findIndex((img) => img.id === targetId)
   if (from < 0 || to < 0) return prev
   const next = [...prev]
   const [moved] = next.splice(from, 1)
   next.splice(to, 0, moved)
   return next
  })
  setDraggingMegaImageId(null)
 }

 const toggleMegaCell = (cellId: string) => {
  setActiveMegaCells((prev) => ({ ...prev, [cellId]: !prev[cellId] }))
 }

 const handleGenerate = async () => {
  if (!prompt) return
  setGenLoading(true)
  try {
   const img = await generateThumbnail(
    prompt,
    aspectRatio,
    imageSize,
    largeText,
    smallText,
   )
   setGeneratedImage(img)
   setHistory([
    {
     id: crypto.randomUUID(),
     url: img,
     prompt: prompt,
     timestamp: Date.now(),
    },
    ...history,
   ])
  } catch {
   alert("Generation Failed.")
  } finally {
   setGenLoading(false)
  }
 }

 const handleAnalyze = async () => {
  if (!analysisFile) return
  setAnalyzeLoading(true)
  try {
   const reader = new FileReader()
   reader.onloadend = async () => {
    const base64String = (reader.result as string).split(",")[1]
    const res = await rateThumbnail(base64String, analysisFile.type)
    setAnalysisResult(res)
    setAnalyzeLoading(false)
   }
   reader.readAsDataURL(analysisFile)
  } catch {
   setAnalyzeLoading(false)
  }
 }

 useEffect(() => {
  if (!isReferenceTab(tabId)) {
   navigate(`${referenceBasePath}/${DEFAULT_REFERENCE_TAB}`, { replace: true })
  }
 }, [navigate, referenceBasePath, tabId])

 const openReferenceTab = (tab: ReferenceTab) => {
  navigate(`${referenceBasePath}/${tab}`)
  window.scrollTo({ top: 0, behavior: "smooth" })
 }

 const activeLegacyTool = useMemo(
  () =>
   LEGACY_TOOL_TAB_REGISTRY.find((tab) => tab.id === activeLegacyTab) ||
   LEGACY_TOOL_TAB_REGISTRY[0],
  [activeLegacyTab],
 )

 const ActiveLegacyToolComponent = LEGACY_TOOL_COMPONENTS[activeLegacyTool.id]

 const sectionLoadingFallback = (
  <div className="w-full max-w-[1400px] mx-auto mb-24 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] p-12 text-center">
   <p className="text-xs font-black uppercase tracking-[0.24em] opacity-50">
    Loading section...
   </p>
  </div>
 )

 return (
  <div className="min-h-screen w-full bg-[#f3f4f6] flex flex-col p-4 overflow-y-auto custom-scrollbar animate-fade-in">
   <div className="w-full max-w-[1400px] mx-auto mb-10 bg-white border-[5px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
     {REFERENCE_TABS.map((tab) => {
      const isActive = activeReferenceTab === tab.id
      return (
       <button
        key={tab.id}
        onClick={() => openReferenceTab(tab.id)}
        className={`h-12 border-[4px] border-black rounded-xl overflow-hidden transition-all ${
         isActive
          ? "shadow-[4px_4px_0px_0px_black]"
          : "shadow-[2px_2px_0px_0px_black] hover:shadow-[3px_3px_0px_0px_black]"
        }`}>
        <span className="flex h-full w-full items-stretch">
         <span className={`w-10 shrink-0 border-r-[4px] border-black ${tab.accent}`} />
         <span
          className={`flex-1 px-3 flex items-center justify-start text-[10px] font-black uppercase tracking-[0.16em] ${
           isActive ? `${tab.accent} text-black` : "bg-white text-black"
          }`}>
          {tab.label}
         </span>
        </span>
       </button>
      )
     })}
    </div>
    <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-50 text-center">
     Tip: Open <span className="opacity-100">Library</span> to browse the
     reference code sections.
    </p>
   </div>

   {activeReferenceTab === "toolbox-system" && (
    <React.Suspense fallback={sectionLoadingFallback}>
     <ToolboxUISystem mode="ui-system" />
    </React.Suspense>
   )}

   {activeReferenceTab === "four-sections-run" && (
    <React.Suspense fallback={sectionLoadingFallback}>
     <FourSectionsRun />
    </React.Suspense>
   )}

   {activeReferenceTab === "component-grid" && (
   <React.Suspense fallback={sectionLoadingFallback}>
    <ToolboxUISystem mode="component-grid" />
   </React.Suspense>
  )}

   {activeReferenceTab === "section-sources-lab" && (
    <React.Suspense fallback={sectionLoadingFallback}>
     <SectionSourcesLab />
    </React.Suspense>
   )}

   {activeReferenceTab === "component-catalog" && (
    <React.Suspense fallback={sectionLoadingFallback}>
     <ComponentCatalog />
    </React.Suspense>
   )}

   {activeReferenceTab === "chart-catalog" && (
    <React.Suspense fallback={sectionLoadingFallback}>
     <ChartCatalog />
    </React.Suspense>
   )}

   {activeReferenceTab === "chart-spec-implementation" && (
    <React.Suspense fallback={sectionLoadingFallback}>
     <ChartSpecImplementation />
    </React.Suspense>
   )}

   {activeReferenceTab === "toolbox-recreation" && (
   <React.Suspense fallback={sectionLoadingFallback}>
    <ToolboxRecreation />
   </React.Suspense>
  )}

   {activeReferenceTab === "widget-lab" && (
    <React.Suspense fallback={sectionLoadingFallback}>
     <WidgetLab />
    </React.Suspense>
   )}

   {activeReferenceTab === "analytics-lab" && (
   <div className="w-full max-w-[1400px] mx-auto mb-24 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] p-6 space-y-6">
     <div className="h-14 px-4 border-[4px] border-black rounded-xl bg-[#FFB158] flex items-center justify-between">
      <h3 className="text-2xl font-[1000] uppercase tracking-tight">
       Reference Analytics Lab
      </h3>
     <div className="flex items-center gap-2">
       <button
        onClick={() => setAnalyticsRange("lifetime")}
        className={`h-9 px-4 border-[3px] border-black rounded-lg text-[10px] font-black uppercase ${
         analyticsRange === "lifetime" ? "bg-black text-white" : "bg-white text-black"
        }`}>
        Lifetime
       </button>
       <button
        onClick={() => setAnalyticsRange("28d")}
        className={`h-9 px-4 border-[3px] border-black rounded-lg text-[10px] font-black uppercase ${
         analyticsRange === "28d" ? "bg-black text-white" : "bg-white text-black"
        }`}>
       28D
       </button>
      </div>
     </div>
     <div className="h-10 px-4 border-[3px] border-black rounded-xl bg-[#CCFF00] flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-[0.14em]">
       Channel Intelligence Sync Target
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.14em]">
       {analyticsRange === "lifetime" ? "Lifetime Synced (Default)" : "28D Comparison Mode"}
      </span>
     </div>

     <div className="border-[4px] border-black rounded-xl overflow-hidden">
      <div className="h-10 px-4 bg-[#CCFF00] border-b-[4px] border-black flex items-center justify-between">
       <span className="text-[10px] font-black uppercase tracking-[0.14em]">
        Ingest Source Readiness
       </span>
       <span className="text-[9px] font-black uppercase tracking-[0.12em] opacity-70">
        Multi-source contract
       </span>
      </div>
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
       {EXTERNAL_INGEST_SOURCES.map((source) => (
        <div
         key={source.id}
         className={`h-10 px-3 border-[3px] border-black rounded-lg flex items-center justify-between text-[9px] font-black uppercase tracking-[0.12em] ${
          source.enabled ? "bg-[#CCFF00]" : "bg-[#f3f4f6]"
         }`}>
         <span className="truncate max-w-[65%]">{source.label}</span>
         <span className={source.enabled ? "opacity-100" : "opacity-55"}>
          {source.enabled ? "Enabled" : "Staged"}
         </span>
        </div>
       ))}
      </div>
     </div>

     <div className="border-[4px] border-black rounded-xl overflow-hidden">
      <div className="h-12 px-4 bg-[#24D3FF] border-b-[4px] border-black flex items-center justify-between">
       <span className="text-[11px] font-black uppercase tracking-[0.14em]">
        1.2 Video Value Matrix
       </span>
       <span className="text-[10px] font-black uppercase tracking-[0.12em]">
        CTR X AVP | Bubble = Views
       </span>
      </div>
      <div className="h-[360px] p-4 bg-[#f5f6f8]">
       <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 14, right: 24, bottom: 10, left: 12 }}>
         <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
         <XAxis type="number" dataKey="ctr" name="CTR %" unit="%" domain={[0, "auto"]} />
         <YAxis type="number" dataKey="avp" name="AVP %" unit="%" domain={[0, 100]} />
         <ZAxis type="number" dataKey="views" range={[50, 420]} />
         <ReferenceLine x={5} stroke="#000" strokeOpacity={0.42} />
         <ReferenceLine y={50} stroke="#000" strokeOpacity={0.42} />
         <Tooltip cursor={{ stroke: "#9ca3af", strokeOpacity: 0.42 }} />
         <Legend />
         <Scatter
          name="Long"
          data={analyticsRows.filter((r) => r.format === "long")}
          fill="#00CCFF"
          stroke="#000"
          strokeWidth={1.2}
         />
         <Scatter
          name="Shorts"
          data={analyticsRows.filter((r) => r.format === "shorts")}
          fill="#FF7497"
          stroke="#000"
          strokeWidth={1.2}
         />
        </ScatterChart>
       </ResponsiveContainer>
      </div>
     </div>

     <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {[
       { key: "subs", label: "New Subscribers" },
       { key: "views", label: "Total Views" },
       { key: "watch", label: "Total Time" },
       { key: "revenue", label: "Total Revenue" },
      ].map((pie) => (
       <div key={pie.key} className="border-[4px] border-black rounded-xl overflow-hidden bg-white">
        <div className="h-10 px-3 bg-[#C9F830] border-b-[4px] border-black flex items-center text-[10px] font-black uppercase tracking-[0.12em]">
         {pie.label}
        </div>
        <div className="h-[220px] p-3">
         <ResponsiveContainer width="100%" height="100%">
          <PieChart>
           <Tooltip />
           <Pie
            data={(splitTotals as any)[pie.key]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={78}
            stroke="#000"
            strokeWidth={2}
            label>
            {(splitTotals as any)[pie.key].map((entry: any, index: number) => (
             <Cell key={`${pie.key}-${index}`} fill={entry.color} />
            ))}
           </Pie>
          </PieChart>
         </ResponsiveContainer>
        </div>
       </div>
      ))}
     </div>

     <div className="border-[4px] border-black rounded-xl overflow-hidden">
      <div className="h-12 px-4 bg-[#FCAF57] border-b-[4px] border-black flex flex-wrap items-center justify-between gap-2">
       <span className="text-[11px] font-black uppercase tracking-[0.14em]">
        Engagement Map · Latest 50 Videos
       </span>
       <div className="flex items-center gap-2">
        {(["comments", "likes", "shares", "views"] as const).map((metric) => (
         <button
          key={metric}
          onClick={() => setEngagementSortMetric(metric)}
          className={`h-8 px-3 border-[2px] border-black rounded-lg text-[9px] font-black uppercase ${
           engagementSortMetric === metric ? "bg-[#FFE357]" : "bg-white"
          }`}>
          {metric}
         </button>
        ))}
       </div>
      </div>
      <div className="h-[320px] p-4 bg-[#f5f6f8]">
       <ResponsiveContainer width="100%" height="100%">
        <LineChart data={engagementLineRows} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
         <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
         <XAxis dataKey="order" />
         <YAxis />
         <Tooltip />
         <Legend />
         <Line dataKey="comments" stroke="#24D3FF" strokeWidth={2.5} dot={false} />
         <Line dataKey="likes" stroke="#FF7497" strokeWidth={2.5} dot={false} />
         <Line dataKey="shares" stroke="#FFE357" strokeWidth={2.5} dot={false} />
         <Line dataKey="views" stroke="#C9F830" strokeWidth={2.5} dot={false} />
        </LineChart>
       </ResponsiveContainer>
      </div>
     </div>
    </div>
   )}

   {activeReferenceTab === "thumbnail" && (
    <div className="w-full max-w-[1400px] mx-auto mb-40 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] flex flex-col overflow-hidden">
     {/* Main Header — Large Icon + Ultra-Large Title (Image #3 Style) */}
     <header className="bg-[#FFE357] h-[80px] flex items-center justify-between px-0 overflow-hidden border-b-[6px] border-black">
      <div
       onClick={() => setIsMainToolOpen(!isMainToolOpen)}
       className="flex items-center h-full cursor-pointer">
       {/* Large Colored Icon Box */}
       <div className="bg-[#FF7497] h-full w-[80px] flex items-center justify-center border-r-[6px] border-black flex-shrink-0">
        <CustomIcon name="image" size={48} />
       </div>
       <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">
        THUMBNAIL STUDIO
       </h1>
      </div>

      <div className="flex items-center gap-6 pr-6">
       {/* Tab Switcher */}
       <div className="flex bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_black]">
        <button
         onClick={() => setActiveTab("generate")}
         className={`px-5 py-2 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${activeTab === "generate" ? "bg-black text-white" : "text-black/30 hover:text-black"}`}>
         Studio
        </button>
        <button
         onClick={() => setActiveTab("analyze")}
         className={`px-5 py-2 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${activeTab === "analyze" ? "bg-black text-white" : "text-black/30 hover:text-black"}`}>
         Analyzer
        </button>
       </div>

       <div
        onClick={() => setIsMainToolOpen(!isMainToolOpen)}
        className={`cursor-pointer transition-all duration-700 ease-in-out transform ${isMainToolOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}>
        <CustomIcon
         name={isMainToolOpen ? "SYMBOLS 19" : "SYMBOLS 22"}
         size={48}
         className="opacity-80 hover:opacity-100 transition-opacity"
        />
       </div>
      </div>
     </header>

     {/* Main Content Area — Grid-based for perfect collapse */}
     <div
      className={`grid transition-[grid-template-rows,opacity] duration-700 ease-in-out ${isMainToolOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
      <div className="overflow-hidden">
       <main className="p-8 bg-white min-h-[600px] relative">
        {/* Studio Tab — Animated Transition */}
        <div
         className={`transition-all duration-500 transform ${activeTab === "generate" ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 -translate-x-10 pointer-events-none absolute inset-8"}`}>
         <div className="grid grid-cols-2 gap-8 items-stretch h-full">
          {/* Column 1: Narrower Tool Stack */}
          <div className="flex flex-col h-full gap-6">
           <AccordionContainer
            title="Concept"
            icon="!!!IDEA"
            headerColor="bg-[#24D3FF]"
            iconBoxColor="bg-[#FFE357]"
            isOpenInitial={true}>
            <div className="space-y-4">
             <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image concept..."
              className="w-full h-28 p-0 text-sm font-bold bg-transparent outline-none resize-none border-none placeholder:text-black/10 text-black leading-tight"
             />
             <div className="flex justify-end">
              <button
               onClick={handleManualConceptGen}
               disabled={conceptLoading}
               className="bg-[#C9F830] text-[10px] font-black uppercase text-black px-4 py-1.5 rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all">
               {conceptLoading ? "REFRESHING..." : "✨ AUTO-REFINE"}
              </button>
             </div>
            </div>
           </AccordionContainer>

           <AccordionContainer
            title="Styles"
            icon="!!!COLLECTION"
            headerColor="bg-[#C9F830]"
            iconBoxColor="bg-[#24D3FF]">
            <div className="grid grid-cols-3 gap-2">
             {THUMBNAIL_STYLES.map((style) => (
              <button
               key={style}
               onClick={() => handleStyleToggle(style)}
               className={`px-2 py-2 border-[2px] border-black rounded-lg font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none transition-all ${selectedStyles.includes(style) ? "bg-[#FFE357]" : "bg-white"}`}>
               {style}
              </button>
             ))}
            </div>
           </AccordionContainer>

           <AccordionContainer
            title="Text"
            icon="!!!TEXT"
            headerColor="bg-[#FFE357]"
            iconBoxColor="bg-[#C9F830]">
            <div className="space-y-4">
             <input
              value={largeText}
              onChange={(e) => setLargeText(e.target.value)}
              placeholder="TITLE"
              className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
             />
             <input
              value={smallText}
              onChange={(e) => setSmallText(e.target.value)}
              placeholder="SUBTITLE"
              className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
             />
            </div>
           </AccordionContainer>

           <AccordionContainer
            title="Images"
            icon="image"
            headerColor="bg-[#FCAF57]"
            iconBoxColor="bg-[#FFE357]">
            <div className="space-y-4">
             <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full h-28 border-[3px] border-black border-dashed rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-2 group hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => document.getElementById("med-up")?.click()}>
              <input
               type="file"
               multiple
               id="med-up"
               className="hidden"
               onChange={(e) => {
                if (e.target.files) {
                 const news = Array.from(e.target.files).map((f) => ({
                  id: crypto.randomUUID(),
                  file: f,
                  previewUrl: URL.createObjectURL(f),
                  usageType: "background",
                 }))
                 setReferenceImages((prev) => [...prev, ...news])
                }
               }}
              />
              <div className="bg-white p-2 rounded-full border-[2px] border-black shadow-[2px_2px_0px_0px_black]">
               <CustomIcon name="!!!CLOUD" size={20} />
              </div>
              <span className="font-black uppercase text-[10px] tracking-tight text-black/30 group-hover:text-black transition-colors">
               Drop files or Click to Upload
              </span>
             </div>
             <button
              onClick={() => document.getElementById("med-up")?.click()}
              className="w-full h-10 bg-[#FCAF57] border-[3px] border-black rounded-xl font-[1000] uppercase text-sm tracking-tighter shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all flex items-center justify-center gap-2">
              <CustomIcon name="!!!CLOUD" size={16} />
              Upload Images
             </button>
             <div className="grid grid-cols-1 gap-2">
              {referenceImages.map((img) => (
               <div
                key={img.id}
                className="border-[2px] border-black p-2 rounded-lg bg-white flex gap-3 items-center shadow-[3px_3px_0px_0px_black]">
                <img
                 src={img.previewUrl}
                 className="w-10 h-10 object-cover border-[2px] border-black rounded-md"
                 alt="ref"
                />
                <select className="pop-input flex-1 p-1 text-[9px] font-black uppercase border-[2px] rounded-md">
                 <option>Background</option>
                 <option>Subject</option>
                </select>
                <button
                 onClick={() =>
                  setReferenceImages((prev) =>
                   prev.filter((i) => i.id !== img.id),
                  )
                 }
                 className="text-xl font-black px-2 hover:text-red-500 transition-colors">
                 ×
                </button>
               </div>
              ))}
             </div>
            </div>
           </AccordionContainer>

           <AccordionContainer
            title="Palette"
            icon="!!!PALETTE"
            headerColor="bg-[#FF7497]"
            iconBoxColor="bg-[#FCAF57]">
            <div className="flex justify-between items-start gap-3 py-2">
             {palette.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
               <div
                style={{ backgroundColor: c || "#f3f4f6" }}
                onClick={() => document.getElementById(`cp7-${i}`)?.click()}
                className="w-full aspect-[2/3] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] relative overflow-hidden flex items-center justify-center cursor-pointer group">
                <input
                 id={`cp7-${i}`}
                 type="color"
                 value={c || "#ffffff"}
                 onChange={(e) => {
                  const n = [...palette]
                  n[i] = e.target.value
                  setPalette(n)
                 }}
                 className="absolute inset-0 opacity-0 pointer-events-none"
                />
                {!c && (
                 <span className="text-black/10 font-black text-lg">+</span>
                )}
               </div>
               <input
                value={c}
                onChange={(e) => {
                 const n = [...palette]
                 n[i] = e.target.value
                 setPalette(n)
                }}
                className="pop-input w-full p-1.5 text-xs font-mono text-center border-[2px] rounded-md uppercase font-black"
                maxLength={7}
               />
              </div>
             ))}
            </div>
           </AccordionContainer>
          </div>

          {/* Column 2: Canvas (Matched Width) + Controls */}
          <div className="flex flex-col h-full gap-6 min-h-[520px]">
           <div className="flex-1 w-full border-[4px] border-black bg-[#f1f5f9] rounded-[48px] shadow-[12px_12px_0px_0px_black] relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700">
            {generatedImage ? (
             <img
              src={generatedImage}
              alt="Gen"
              className="max-w-full max-h-full object-contain border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_0px_black]"
             />
            ) : (
             <div className="text-center p-12 bg-white border-[4px] border-black rounded-[48px] shadow-[8px_8px_0px_0px_black] w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
              <div className="w-20 h-20 bg-[#FF7497] border-[4px] border-black rounded-full mx-auto mb-8 flex items-center justify-center shadow-[6px_6px_0px_0px_black] animate-pulse">
               <CustomIcon name="zap" size={32} />
              </div>
              <h3 className="text-4xl font-[1000] uppercase tracking-tighter text-black leading-none mb-4 italic">
               CANVAS STANDBY
              </h3>
              <p className="font-black text-black/20 uppercase tracking-[0.3em] text-[10px]">
               Generator Sequence Ready
              </p>
             </div>
            )}
           </div>

           {/* Moved Controls Section */}
           <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-black/20 tracking-[0.2em] pl-1">
              Vibe Ratio
             </label>
             <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="pop-input w-full h-[64px] px-6 border-[4px] border-black text-xl rounded-2xl font-[1000] appearance-none bg-white cursor-pointer shadow-[4px_4px_0_0_black] hover:shadow-none transition-all">
              {Object.values(AspectRatio).map((r) => (
               <option key={r} value={r}>
                {r}
               </option>
              ))}
             </select>
            </div>
            <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-black/20 tracking-[0.2em] pl-1">
              Resolution
             </label>
             <select
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value as ImageSize)}
              className="pop-input w-full h-[64px] px-6 border-[4px] border-black text-xl rounded-2xl font-[1000] appearance-none bg-white cursor-pointer shadow-[4px_4px_0_0_black] hover:shadow-none transition-all">
              {Object.values(ImageSize).map((s) => (
               <option key={s} value={s}>
                {s}
               </option>
              ))}
             </select>
            </div>
           </div>

           {/* Generate Button — Styled to EXACTLY match sub-toolbox titles (High Density) */}
           <button
            onClick={handleGenerate}
            disabled={genLoading || !prompt}
            className="w-full h-14 bg-[#f3f4f6] border-[4px] border-black rounded-2xl overflow-hidden flex items-center group transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_black] hover:shadow-none translate-y-0 hover:translate-y-1 hover:translate-x-1">
            <div className="bg-gray-200 h-full w-14 flex items-center justify-center border-r-[4px] border-black flex-shrink-0 group-hover:bg-[#FF7497] transition-colors">
             <CustomIcon
              name="zap"
              size={32}
              className="opacity-40 group-hover:opacity-100 transition-opacity"
             />
            </div>
            <div className="flex-1 flex items-center justify-center pr-14">
             <span className="text-[36px] font-[1000] uppercase tracking-tighter text-black/30 group-hover:text-black transition-colors leading-none mt-[-2px]">
              {genLoading ? "CREATING..." : "GENERATE ART"}
             </span>
            </div>
           </button>
          </div>
         </div>
        </div>

        {/* Analyzer Tab — Animated Transition */}
        <div
         className={`transition-all duration-500 transform ${activeTab === "analyze" ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-10 pointer-events-none absolute inset-8"}`}>
         <div className="flex flex-col lg:flex-row gap-10 h-full">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
           <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-[4px] border-black bg-white rounded-2xl shadow-[8px_8px_0px_0px_black] group cursor-pointer overflow-hidden">
            <div className="h-14 bg-[#FF7497] border-b-[4px] border-black flex items-center px-6 gap-4">
             <div className="bg-white p-2 rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_black]">
              <CustomIcon name="!!!CLOUD" size={20} />
             </div>
             <span className="text-lg font-[1000] uppercase tracking-tighter text-black">
              Upload Visuals
             </span>
            </div>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 p-6">
             <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
               if (e.target.files?.[0]) {
                setAnalysisFile(e.target.files[0])
                const r = new FileReader()
                r.onloadend = () => setAnalysisPreview(r.result as string)
                r.readAsDataURL(e.target.files[0])
               }
              }}
             />
             {analysisPreview ? (
              <img
               src={analysisPreview}
               alt="Preview"
               className="h-full object-contain border-[4px] border-black rounded-xl shadow-[6px_6px_0px_0px_black]"
              />
             ) : (
              <div className="text-center opacity-20">
               <CustomIcon name="search" size={64} />
               <p className="font-black mt-4 uppercase">No Media Loaded</p>
              </div>
             )}
            </div>
           </div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl border-[4px] border-black p-6">
           <div className="flex items-center justify-between gap-3 mb-4">
            <h4 className="text-xl font-black uppercase">Analysis Result</h4>
            <button
             onClick={handleAnalyze}
             disabled={!analysisFile || analyzeLoading}
             className="h-10 px-4 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_black] disabled:opacity-40 disabled:cursor-not-allowed">
             {analyzeLoading ? "Running..." : "Run Analysis"}
            </button>
           </div>
           <div className="prose max-w-none text-sm font-bold">
            {analyzeLoading
             ? "Running Neural Analysis..."
             : analysisResult || "Upload a thumbnail to see scores."}
           </div>
          </div>
         </div>
        </div>
       </main>
      </div>
     </div>
    </div>
   )}

   {/* 3. Global UI Reference Library — Unified Design System Layer */}
   {activeReferenceTab === "library" && (
    <div className="w-full max-w-[1400px] mx-auto mb-40">
     <div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black shadow-[16px_16px_0px_0px_black] rounded-[3rem] border-[4px]">
      <div className="max-w-[1400px] mx-auto text-center">
       <h2 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#B14AED] text-white inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
        REFERENCE LIBRARY
       </h2>
       <p className="mt-8 font-black uppercase text-lg opacity-50 tracking-[0.3em] text-black">
        Tokyo-Pop Component Repository & Design Tokens
       </p>
      </div>
     </div>
     <React.Suspense fallback={sectionLoadingFallback}>
      <UIReferenceLibraryContent />
     </React.Suspense>
    </div>
   )}

   {activeReferenceTab === "native" && (
    <div className="w-full max-w-[1400px] mx-auto mb-40">
     <div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black shadow-[16px_16px_0px_0px_black] rounded-[3rem] border-[4px]">
      <div className="max-w-[1400px] mx-auto text-center">
       <h2 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#CCFF00] text-black inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
        NATIVE UI KIT
       </h2>
       <p className="mt-8 font-black uppercase text-lg opacity-50 tracking-[0.3em] text-black">
        Standalone Component Kit Pulled In From Shared Library Modules
       </p>
      </div>
     </div>
     <div className="bg-white border-[6px] border-black rounded-[48px] shadow-[12px_12px_0px_0px_black] overflow-hidden">
      <div className="bg-black text-white px-8 py-4 flex justify-between items-center">
       <span className="font-[1000] uppercase tracking-widest text-lg">
        Native UI Kit
       </span>
       <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-[#FF3399]" />
        <div className="w-3 h-3 rounded-full bg-[#CCFF00]" />
        <div className="w-3 h-3 rounded-full bg-[#00CCFF]" />
       </div>
      </div>
      <div className="p-8 bg-white">
       <React.Suspense fallback={sectionLoadingFallback}>
        <NativeUIKit />
       </React.Suspense>
      </div>
     </div>
    </div>
   )}

   {activeReferenceTab === "legacy" && (
    <div className="w-full max-w-[1400px] mx-auto mb-40">
     <div className="p-12 border-b-[12px] border-black bg-white mb-8 text-black shadow-[16px_16px_0px_0px_black] rounded-[3rem] border-[4px]">
      <div className="max-w-[1400px] mx-auto text-center">
       <h2 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#FF7497] text-black inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
        LEGACY TOOLS
       </h2>
       <p className="mt-8 font-black uppercase text-lg opacity-50 tracking-[0.3em] text-black">
        One tab per unplaced tool for visibility and comparison
       </p>
      </div>
     </div>

     <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] p-4 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
       {LEGACY_TOOL_TAB_REGISTRY.map((toolTab) => {
        const isActive = activeLegacyTab === toolTab.id
        return (
         <button
          key={toolTab.id}
          onClick={() => setActiveLegacyTab(toolTab.id)}
          className={`min-h-[52px] px-4 border-[3px] border-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex flex-col justify-center items-start ${
           isActive
            ? "bg-[#CCFF00] shadow-[3px_3px_0px_0px_black]"
            : "bg-white hover:bg-[#f3f4f6]"
          }`}>
          <span>{toolTab.label}</span>
          <span className="text-[8px] opacity-50">{toolTab.status}</span>
         </button>
        )
       })}
      </div>
     </div>

     <div className="bg-white border-[6px] border-black rounded-[32px] shadow-[12px_12px_0px_0px_black] overflow-hidden">
      <div className="bg-black text-white px-8 py-4 flex items-center justify-between">
       <span className="font-[1000] uppercase tracking-[0.24em] text-sm">
        {activeLegacyTool.label}
       </span>
       <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
        {activeLegacyTool.status}
       </span>
      </div>
      <div className="p-6 bg-[#f3f4f6]">
       <React.Suspense fallback={sectionLoadingFallback}>
        <ActiveLegacyToolComponent />
       </React.Suspense>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}

export default ReferenceStudio
