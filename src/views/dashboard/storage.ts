import { DASHBOARD_TOKENS, DASHBOARD_LAYOUT_STORAGE_KEY, DASHBOARD_SCHEMA_VERSION, SIZE_BUCKET_ORDER, HEIGHT_BUCKET_ORDER } from "./tokens"
import { DASHBOARD_WIDGET_BY_ID, DEFAULT_DASHBOARD_WIDGET_ORDER } from "./WidgetRegistry"
import type { DashboardLayoutState, DashboardSizeBucket, DashboardHeightBucket, WidgetInstanceState } from "./types"

const SIZE_TO_INDEX = Object.fromEntries(SIZE_BUCKET_ORDER.map((size, idx) => [size, idx])) as Record<DashboardSizeBucket, number>
const HEIGHT_TO_INDEX = Object.fromEntries(HEIGHT_BUCKET_ORDER.map((size, idx) => [size, idx])) as Record<DashboardHeightBucket, number>

const defaultInstanceFor = (widgetId: string): WidgetInstanceState => ({
  collapsed: false,
  size: DASHBOARD_WIDGET_BY_ID[widgetId]?.defaultSize || "quarter",
  height: DASHBOARD_WIDGET_BY_ID[widgetId]?.defaultHeight || "medium",
  pinned: false,
  focus: false,
})

export const buildDefaultDashboardLayout = (): DashboardLayoutState => {
  return {
    "schemaVersion": 7,
    "locked": false,
    "order": [
      "kpi-cluster",
      "community-post",
      "comment-replier",
      "consistency-heatmap",
      "realtime-performance",
      "goals-tracker",
      "keyword-engine",
      "daily-oracle",
      "ask-me",
      "ai-journal",
      "image-generator",
      "data-edit",
      "traffic-sources",
      "shorts-vs-long",
      "publish-momentum",
      "audience-matrix",
      "system-micro-stack",
      "keyword-overlap-intelligence",
      "retention-sim",
      "upload-scheduler",
      "brain-hub",
      "thumb-ai",
      "quick-actions",
      "ai-prompt-box",
      "revenue-momentum",
      "title-rewriter",
      "description-editor",
      "hashtag-analyzer",
      "tag-generator",
      "superfan-card",
      "flight-check",
      "bridge-efficiency",
      "reach-funnel",
      "alerts-feed",
      "mini-calendar",
      "task-stack",
      "collab-matchmaker",
      "channel-overview",
      "audience-retention",
      "relative-retention-benchmark",
      "ad-stack-intelligence",
      "revenue-chart",
      "recent-uploads",
      "top-performer",
      "alerts-ticker",
      "burnout-monitor",
      "ui-reference-library"
    ],
    "hidden": [
      "bridge-efficiency",
      "reach-funnel",
      "alerts-feed",
      "mini-calendar",
      "task-stack",
      "collab-matchmaker"
    ],
    "instances": {
      "kpi-cluster": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "tall" },
      "community-post": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "tall" },
      "comment-replier": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "tall" },
      
      "consistency-heatmap": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "realtime-performance": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "goals-tracker": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "keyword-engine": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      
      "daily-oracle": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "xtall" },
      "ask-me": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "xtall" },
      "ai-journal": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "xtall" },
      
      "image-generator": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "xtall" },
      "data-edit": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "xtall" },
      
      "traffic-sources": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "tall" },
      "shorts-vs-long": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "tall" },
      "publish-momentum": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "tall" },
      "audience-matrix": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "tall" },
      
      "system-micro-stack": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "keyword-overlap-intelligence": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "retention-sim": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "upload-scheduler": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      
      "brain-hub": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "xtall" },
      "thumb-ai": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "xtall" },
      
      "quick-actions": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "xtall" },
      "ai-prompt-box": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "xtall" },
      "revenue-momentum": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "xtall" },
      
      "title-rewriter": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "description-editor": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "hashtag-analyzer": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "tag-generator": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      
      "superfan-card": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "flight-check": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      
      "bridge-efficiency": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "reach-funnel": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "alerts-feed": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "mini-calendar": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "task-stack": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "collab-matchmaker": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "channel-overview": { "collapsed": false, "pinned": false, "focus": false, "size": "quarter", "height": "medium" },
      "audience-retention": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "relative-retention-benchmark": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "ad-stack-intelligence": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "revenue-chart": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "recent-uploads": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "medium" },
      "top-performer": { "collapsed": false, "pinned": false, "focus": false, "size": "third", "height": "medium" },
      "alerts-ticker": { "collapsed": false, "pinned": false, "focus": false, "size": "full", "height": "medium" },
      "burnout-monitor": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "medium" },
      "ui-reference-library": { "collapsed": false, "pinned": false, "focus": false, "size": "half", "height": "xtall" }
    }
  }
  
}

export const loadDashboardLayout = (): DashboardLayoutState => {
  try {
    const raw = localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY)
    if (!raw) return buildDefaultDashboardLayout()
    const parsed = JSON.parse(raw) as DashboardLayoutState
    if (!parsed || typeof parsed !== "object") return buildDefaultDashboardLayout()
    if (parsed.schemaVersion !== DASHBOARD_SCHEMA_VERSION) {
      return normalizeDashboardLayout(parsed)
    }
    return normalizeDashboardLayout(parsed)
  } catch {
    return buildDefaultDashboardLayout()
  }
}

export const saveDashboardLayout = (layout: DashboardLayoutState): void => {
  localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layout))
}

export const resetDashboardLayout = (): DashboardLayoutState => {
  const fresh = buildDefaultDashboardLayout()
  saveDashboardLayout(fresh)
  return fresh
}

export const exportDashboardLayout = (layout: DashboardLayoutState): string => {
  return JSON.stringify(layout, null, 2)
}

export const importDashboardLayout = (raw: string): DashboardLayoutState => {
  const parsed = JSON.parse(raw) as Partial<DashboardLayoutState>
  const normalized = normalizeDashboardLayout(parsed)
  saveDashboardLayout(normalized)
  return normalized
}

export const nextSizeBucket = (widgetId: string, current: DashboardSizeBucket): DashboardSizeBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return current
  const minIdx = SIZE_TO_INDEX[widget.minSize]
  const maxIdx = SIZE_TO_INDEX[widget.maxSize]
  const idx = SIZE_TO_INDEX[current]
  const candidate = idx >= maxIdx ? minIdx : idx + 1
  const next = Math.min(maxIdx, Math.max(minIdx, candidate))
  return SIZE_BUCKET_ORDER[next]
}

export const prevSizeBucket = (widgetId: string, current: DashboardSizeBucket): DashboardSizeBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return current
  const minIdx = SIZE_TO_INDEX[widget.minSize]
  const maxIdx = SIZE_TO_INDEX[widget.maxSize]
  const idx = SIZE_TO_INDEX[current]
  const candidate = idx <= minIdx ? maxIdx : idx - 1
  const next = Math.min(maxIdx, Math.max(minIdx, candidate))
  return SIZE_BUCKET_ORDER[next]
}

export const nextHeightBucket = (widgetId: string, current: DashboardHeightBucket): DashboardHeightBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return current
  const minIdx = HEIGHT_TO_INDEX[widget.minHeight]
  const maxIdx = HEIGHT_TO_INDEX[widget.maxHeight]
  const idx = HEIGHT_TO_INDEX[current]
  const candidate = idx >= maxIdx ? minIdx : idx + 1
  const next = Math.min(maxIdx, Math.max(minIdx, candidate))
  return HEIGHT_BUCKET_ORDER[next]
}

export const prevHeightBucket = (widgetId: string, current: DashboardHeightBucket): DashboardHeightBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return current
  const minIdx = HEIGHT_TO_INDEX[widget.minHeight]
  const maxIdx = HEIGHT_TO_INDEX[widget.maxHeight]
  const idx = HEIGHT_TO_INDEX[current]
  const candidate = idx <= minIdx ? maxIdx : idx - 1
  const next = Math.min(maxIdx, Math.max(minIdx, candidate))
  return HEIGHT_BUCKET_ORDER[next]
}

export const sizeBucketClassName = (size: DashboardSizeBucket): string => {
  if (size === "full") return "col-span-24"
  if (size === "three-quarters") return "col-span-24 md:col-span-18"
  if (size === "two-thirds") return "col-span-24 md:col-span-16"
  if (size === "half") return "col-span-24 md:col-span-12"
  if (size === "between") return "col-span-24 md:col-span-10"
  if (size === "third") return "col-span-24 md:col-span-8"
  if (size === "companion") return "col-span-24 md:col-span-7"
  return "col-span-24 md:col-span-6"
}

export const heightBucketClassName = (height: DashboardHeightBucket): string => {
  if (height === "short") return "h-[150px]"
  if (height === "medium") return "h-[250px]"
  if (height === "tall") return "h-[350px]"
  if (height === "xtall") return "h-[450px]"
  if (height === "massive") return "h-[850px]"
  return "h-[250px]"
}

export const widgetCardShellClass =
  `rounded-[${DASHBOARD_TOKENS.radiusLg}px] border-[${DASHBOARD_TOKENS.strokeLevel1}px] border-black bg-white overflow-hidden`
