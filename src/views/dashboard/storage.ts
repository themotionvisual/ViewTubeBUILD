import { z } from "zod"
import {
  DASHBOARD_LAYOUT_BACKUP_KEY,
  DASHBOARD_LAYOUT_STORAGE_KEY,
  DASHBOARD_SCHEMA_VERSION,
  DASHBOARD_TOKENS,
  HEIGHT_BUCKET_ORDER,
  LEGACY_DASHBOARD_LAYOUT_STORAGE_KEYS,
  SIZE_BUCKET_ORDER,
} from "./tokens"
import { DASHBOARD_WIDGET_BY_ID, DASHBOARD_WIDGET_REGISTRY } from "./WidgetRegistry"
import type {
  DashboardHeightBucket,
  DashboardLayoutState,
  DashboardSizeBucket,
  WidgetDefinition,
  WidgetInstanceState,
} from "./types"

const LegacyWidgetInstanceSchema = z.object({
  collapsed: z.boolean().optional(),
  size: z.string().optional(),
  height: z.string().optional(),
}).passthrough()

const ImportedDashboardLayoutSchema = z.object({
  schemaVersion: z.number().optional(),
  locked: z.boolean().optional(),
  order: z.array(z.string()).optional(),
  hidden: z.array(z.string()).optional(),
  instances: z.record(z.string(), LegacyWidgetInstanceSchema).optional(),
}).passthrough()

const SIZE_TO_INDEX = Object.fromEntries(
  SIZE_BUCKET_ORDER.map((size, index) => [size, index]),
) as Record<DashboardSizeBucket, number>

const HEIGHT_TO_INDEX = Object.fromEntries(
  HEIGHT_BUCKET_ORDER.map((height, index) => [height, index]),
) as Record<DashboardHeightBucket, number>

const orderedDefinitions = (): WidgetDefinition[] =>
  [...DASHBOARD_WIDGET_REGISTRY].sort((left, right) => left.defaultOrder - right.defaultOrder)

const defaultInstanceFor = (widget: WidgetDefinition): WidgetInstanceState => ({
  collapsed: false,
  size: widget.defaultSize,
  height: widget.defaultHeight,
})

const uniqueKnownIds = (ids: readonly string[]): string[] => {
  const seen = new Set<string>()
  return ids.filter((id) => {
    if (!DASHBOARD_WIDGET_BY_ID[id] || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

const clampDimensions = (
  widget: WidgetDefinition,
  size: string | undefined,
  height: string | undefined,
): Pick<WidgetInstanceState, "size" | "height"> => {
  const requestedSize = SIZE_BUCKET_ORDER.includes(size as DashboardSizeBucket)
    ? size as DashboardSizeBucket
    : widget.defaultSize
  const requestedHeight = HEIGHT_BUCKET_ORDER.includes(height as DashboardHeightBucket)
    ? height as DashboardHeightBucket
    : widget.defaultHeight
  const targetSizeIndex = SIZE_TO_INDEX[requestedSize]
  const targetHeightIndex = HEIGHT_TO_INDEX[requestedHeight]
  const fallback = { size: widget.defaultSize, height: widget.defaultHeight }

  return widget.supportedDimensions.reduce((nearest, candidate) => {
    const nearestDistance = Math.abs(SIZE_TO_INDEX[nearest.size] - targetSizeIndex)
      + Math.abs(HEIGHT_TO_INDEX[nearest.height] - targetHeightIndex)
    const candidateDistance = Math.abs(SIZE_TO_INDEX[candidate.size] - targetSizeIndex)
      + Math.abs(HEIGHT_TO_INDEX[candidate.height] - targetHeightIndex)
    return candidateDistance < nearestDistance ? candidate : nearest
  }, fallback)
}

export const buildDefaultDashboardLayout = (): DashboardLayoutState => {
  const definitions = orderedDefinitions()
  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    locked: false,
    order: definitions.map((widget) => widget.id),
    hidden: definitions.filter((widget) => !widget.defaultVisible).map((widget) => widget.id),
    instances: Object.fromEntries(
      definitions.map((widget) => [widget.id, defaultInstanceFor(widget)]),
    ),
  }
}

export const normalizeDashboardLayout = (input: unknown): DashboardLayoutState => {
  const parsed = ImportedDashboardLayoutSchema.safeParse(input)
  if (!parsed.success) return buildDefaultDashboardLayout()

  const definitions = orderedDefinitions()
  const defaultLayout = buildDefaultDashboardLayout()
  const requestedOrder = uniqueKnownIds(parsed.data.order ?? [])
  const requestedOrderSet = new Set(requestedOrder)
  const missingIds = definitions
    .map((widget) => widget.id)
    .filter((id) => !requestedOrderSet.has(id))
  const order = requestedOrder.length > 0
    ? [...requestedOrder, ...missingIds]
    : defaultLayout.order

  const hidden = new Set(
    requestedOrder.length > 0
      ? uniqueKnownIds(parsed.data.hidden ?? [])
      : defaultLayout.hidden,
  )
  if (requestedOrder.length > 0) {
    for (const id of missingIds) {
      if (!DASHBOARD_WIDGET_BY_ID[id]?.defaultVisible) hidden.add(id)
    }
  }

  const instances = Object.fromEntries(definitions.map((widget) => {
    const candidate = parsed.data.instances?.[widget.id]
    const dimensions = clampDimensions(widget, candidate?.size, candidate?.height)
    return [widget.id, {
      collapsed: candidate?.collapsed ?? false,
      ...dimensions,
    } satisfies WidgetInstanceState]
  }))

  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    locked: parsed.data.locked ?? false,
    order,
    hidden: order.filter((id) => hidden.has(id)),
    instances,
  }
}

const getStorage = (): Storage | null =>
  typeof window === "undefined" ? null : window.localStorage

export const loadDashboardLayout = (): DashboardLayoutState => {
  const storage = getStorage()
  if (!storage) return buildDefaultDashboardLayout()

  const keys = [DASHBOARD_LAYOUT_STORAGE_KEY, ...LEGACY_DASHBOARD_LAYOUT_STORAGE_KEYS]
  for (const key of keys) {
    const raw = storage.getItem(key)
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw) as unknown
      const layout = normalizeDashboardLayout(parsed)
      if (key !== DASHBOARD_LAYOUT_STORAGE_KEY) {
        storage.setItem(DASHBOARD_LAYOUT_BACKUP_KEY, JSON.stringify({ sourceKey: key, raw }))
        storage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layout))
      }
      return layout
    } catch {
      continue
    }
  }

  return buildDefaultDashboardLayout()
}

export const saveDashboardLayout = (layout: DashboardLayoutState): void => {
  getStorage()?.setItem(
    DASHBOARD_LAYOUT_STORAGE_KEY,
    JSON.stringify(normalizeDashboardLayout(layout)),
  )
}

export const resetDashboardLayout = (): DashboardLayoutState => {
  const fresh = buildDefaultDashboardLayout()
  saveDashboardLayout(fresh)
  return fresh
}

export const exportDashboardLayout = (layout: DashboardLayoutState): string =>
  JSON.stringify(normalizeDashboardLayout(layout), null, 2)

export const importDashboardLayout = (raw: string): DashboardLayoutState => {
  const parsedJson = JSON.parse(raw) as unknown
  const parsed = ImportedDashboardLayoutSchema.safeParse(parsedJson)
  if (!parsed.success) throw new Error("Invalid dashboard layout")
  const normalized = normalizeDashboardLayout(parsed.data)
  saveDashboardLayout(normalized)
  return normalized
}

const nextSupportedBucket = <T extends DashboardSizeBucket | DashboardHeightBucket>(
  supported: readonly T[],
  current: T,
  direction: 1 | -1,
): T => {
  const currentIndex = Math.max(0, supported.indexOf(current))
  const nextIndex = (currentIndex + direction + supported.length) % supported.length
  return supported[nextIndex] ?? current
}

export const nextSizeBucket = (widgetId: string, current: DashboardSizeBucket): DashboardSizeBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  return widget ? nextSupportedBucket(widget.supportedSizes, current, 1) : current
}

export const prevSizeBucket = (widgetId: string, current: DashboardSizeBucket): DashboardSizeBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  return widget ? nextSupportedBucket(widget.supportedSizes, current, -1) : current
}

export const nextHeightBucket = (widgetId: string, current: DashboardHeightBucket): DashboardHeightBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  return widget ? nextSupportedBucket(widget.supportedHeights, current, 1) : current
}

export const prevHeightBucket = (widgetId: string, current: DashboardHeightBucket): DashboardHeightBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  return widget ? nextSupportedBucket(widget.supportedHeights, current, -1) : current
}

export const sizeBucketClassName = (size: DashboardSizeBucket): string => {
  if (size === "full") return "col-span-24"
  if (size === "three-quarters") return "col-span-24 md:col-span-18"
  if (size === "two-thirds") return "col-span-24 md:col-span-16"
  if (size === "half") return "col-span-24 md:col-span-12"
  if (size === "between") return "col-span-24 md:col-span-10"
  if (size === "third") return "col-span-24 md:col-span-8"
  if (size === "companion") return "col-span-24 md:col-span-7"
  if (size === "quarter") return "col-span-24 md:col-span-6"
  if (size === "sixth") return "col-span-12 md:col-span-4"
  if (size === "eighth") return "col-span-12 md:col-span-3"
  if (size === "twelfth") return "col-span-12 md:col-span-2"
  if (size === "twenty-fourth") return "col-span-6 md:col-span-1"
  return "col-span-24 md:col-span-6"
}

export const heightBucketClassName = (height: DashboardHeightBucket): string => {
  if (height === "short") return "h-[150px]"
  if (height === "medium") return "h-[250px]"
  if (height === "tall") return "h-[350px]"
  if (height === "xtall") return "h-[450px]"
  if (height === "massive") return "h-[850px]"
  if (height === "colossal") return "h-[1200px]"
  if (height === "titanic") return "h-[1600px]"
  if (height === "boundless") return "h-[2200px]"
  return "h-[250px]"
}

export const widgetCardShellClass =
  `rounded-[${DASHBOARD_TOKENS.radiusLg}px] border-[${DASHBOARD_TOKENS.strokeLevel1}px] border-black bg-white overflow-hidden`
