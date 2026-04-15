import { DASHBOARD_TOKENS, DASHBOARD_LAYOUT_STORAGE_KEY, DASHBOARD_SCHEMA_VERSION, SIZE_BUCKET_ORDER } from "./tokens"
import { DASHBOARD_WIDGET_BY_ID, DEFAULT_DASHBOARD_WIDGET_ORDER } from "./WidgetRegistry"
import type { DashboardLayoutState, DashboardSizeBucket, WidgetInstanceState } from "./types"

const SIZE_TO_INDEX = Object.fromEntries(SIZE_BUCKET_ORDER.map((size, idx) => [size, idx])) as Record<DashboardSizeBucket, number>

const defaultInstanceFor = (widgetId: string): WidgetInstanceState => ({
  collapsed: false,
  size: DASHBOARD_WIDGET_BY_ID[widgetId]?.defaultSize || "quarter",
  pinned: false,
  focus: false,
})

export const buildDefaultDashboardLayout = (): DashboardLayoutState => {
  const instances: Record<string, WidgetInstanceState> = {}
  DEFAULT_DASHBOARD_WIDGET_ORDER.forEach((id) => {
    instances[id] = defaultInstanceFor(id)
  })

  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    locked: false,
    order: [...DEFAULT_DASHBOARD_WIDGET_ORDER],
    hidden: [],
    instances,
  }
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

export const sizeBucketClassName = (size: DashboardSizeBucket): string => {
  if (size === "full") return "col-span-12"
  if (size === "half") return "col-span-12 md:col-span-6"
  if (size === "third") return "col-span-12 md:col-span-6 lg:col-span-4"
  return "col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
}

export const widgetCardShellClass =
  `rounded-[${DASHBOARD_TOKENS.radiusLg}px] border-[${DASHBOARD_TOKENS.strokeLevel1}px] border-black bg-white overflow-hidden`
