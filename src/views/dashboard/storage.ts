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
    "brain-hub",
    "thumb-ai",
    "quick-actions",
    "ai-prompt-box",
    "revenue-momentum",
    "superfan-card",
    "keyword-overlap-intelligence",
    "bridge-efficiency",
    "retention-sim",
    "upload-scheduler",
    "flight-check",
    "title-rewriter",
    "description-editor",
    "hashtag-analyzer",
    "tag-generator",
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
    "burnout-monitor"
  ],
  "hidden": [
    "top-performer",
    "recent-uploads",
    "burnout-monitor",
    "alerts-ticker",
    "revenue-chart",
    "channel-overview",
    "relative-retention-benchmark",
    "audience-retention",
    "ad-stack-intelligence",
    "reach-funnel",
    "alerts-feed",
    "collab-matchmaker",
    "mini-calendar",
    "task-stack"
  ],
  "instances": {
    "kpi-cluster": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "tall"
    },
    "channel-overview": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "mini-calendar": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "task-stack": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "quick-actions": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "xtall"
    },
    "recent-uploads": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "medium"
    },
    "top-performer": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "medium"
    },
    "alerts-feed": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "ai-prompt-box": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "medium"
    },
    "revenue-momentum": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "medium"
    },
    "superfan-card": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "system-micro-stack": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "consistency-heatmap": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "goals-tracker": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "alerts-ticker": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "full",
      "height": "medium"
    },
    "tag-generator": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "revenue-chart": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "community-post": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "tall"
    },
    "thumb-ai": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "description-editor": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "realtime-performance": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "keyword-engine": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "keyword-overlap-intelligence": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "publish-momentum": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "tall"
    },
    "traffic-sources": {
      "collapsed": true,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "tall"
    },
    "audience-retention": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "shorts-vs-long": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "tall"
    },
    "comment-replier": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "tall"
    },
    "reach-funnel": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "relative-retention-benchmark": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "ad-stack-intelligence": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "audience-matrix": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "tall"
    },
    "bridge-efficiency": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "companion",
      "height": "medium"
    },
    "ask-me": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "xtall"
    },
    "daily-oracle": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "xtall"
    },
    "flight-check": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "image-generator": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "xtall"
    },
    "data-edit": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "xtall"
    },
    "title-rewriter": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "retention-sim": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "upload-scheduler": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "hashtag-analyzer": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "quarter",
      "height": "medium"
    },
    "burnout-monitor": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "collab-matchmaker": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "medium"
    },
    "ai-journal": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "third",
      "height": "xtall"
    },
    "brain-hub": {
      "collapsed": false,
      "pinned": false,
      "focus": false,
      "size": "half",
      "height": "xtall"
    }
  }
} as unknown as DashboardLayoutState;
}

const clampSize = (widgetId: string, size: DashboardSizeBucket): DashboardSizeBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return size
  const minIdx = SIZE_TO_INDEX[widget.minSize]
  const maxIdx = SIZE_TO_INDEX[widget.maxSize]
  const currentIdx = SIZE_TO_INDEX[size]
  const clampedIdx = Math.min(maxIdx, Math.max(minIdx, currentIdx))
  return SIZE_BUCKET_ORDER[clampedIdx]
}

const clampHeight = (widgetId: string, height: DashboardHeightBucket): DashboardHeightBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return height
  const minIdx = HEIGHT_TO_INDEX[widget.minHeight]
  const maxIdx = HEIGHT_TO_INDEX[widget.maxHeight]
  const currentIdx = HEIGHT_TO_INDEX[height]
  const clampedIdx = Math.min(maxIdx, Math.max(minIdx, currentIdx))
  return HEIGHT_BUCKET_ORDER[clampedIdx]
}

export const normalizeDashboardLayout = (raw: Partial<DashboardLayoutState> | null | undefined): DashboardLayoutState => {
  const fallback = buildDefaultDashboardLayout()
  if (!raw) return fallback

  const rawInstances = raw.instances || {}
  const rawOrder = Array.isArray(raw.order) ? raw.order : []
  const rawHidden = Array.isArray(raw.hidden) ? raw.hidden : []

  const knownIds = Object.keys(DASHBOARD_WIDGET_BY_ID)
  const knownIdSet = new Set(knownIds)

  const dedupedOrder = rawOrder.filter((id, idx) => knownIdSet.has(id) && rawOrder.indexOf(id) === idx)
  const missing = knownIds.filter((id) => !dedupedOrder.includes(id))
  const order = [...dedupedOrder, ...missing]

  const hidden = rawHidden.filter((id, idx) => knownIdSet.has(id) && rawHidden.indexOf(id) === idx)

  const instances: Record<string, WidgetInstanceState> = {}
  knownIds.forEach((id) => {
    const fallbackInstance = defaultInstanceFor(id)
    const candidate = rawInstances[id]
    if (!candidate) {
      instances[id] = fallbackInstance
      return
    }

    instances[id] = {
      collapsed: Boolean(candidate.collapsed),
      pinned: Boolean(candidate.pinned),
      focus: Boolean(candidate.focus),
      size: clampSize(id, candidate.size || fallbackInstance.size),
      height: clampHeight(id, candidate.height || fallbackInstance.height),
    }
  })

  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    locked: Boolean(raw.locked),
    order,
    hidden,
    instances,
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
