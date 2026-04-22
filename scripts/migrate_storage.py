import sys

path = "src/views/dashboard/storage.ts"
with open(path, "r") as f:
    text = f.read()

# Replace Imports
text = text.replace(
    'SIZE_BUCKET_ORDER } from "./tokens"',
    'SIZE_BUCKET_ORDER, HEIGHT_BUCKET_ORDER } from "./tokens"'
)
text = text.replace(
    'DashboardSizeBucket, WidgetInstanceState } from "./types"',
    'DashboardSizeBucket, DashboardHeightBucket, WidgetInstanceState } from "./types"'
)

# Add HEIGHT_TO_INDEX
text = text.replace(
    'const SIZE_TO_INDEX = Object.fromEntries(SIZE_BUCKET_ORDER.map((size, idx) => [size, idx])) as Record<DashboardSizeBucket, number>',
    'const SIZE_TO_INDEX = Object.fromEntries(SIZE_BUCKET_ORDER.map((size, idx) => [size, idx])) as Record<DashboardSizeBucket, number>\nconst HEIGHT_TO_INDEX = Object.fromEntries(HEIGHT_BUCKET_ORDER.map((size, idx) => [size, idx])) as Record<DashboardHeightBucket, number>'
)

# defaultInstanceFor
text = text.replace(
    'size: DASHBOARD_WIDGET_BY_ID[widgetId]?.defaultSize || "quarter",',
    'size: DASHBOARD_WIDGET_BY_ID[widgetId]?.defaultSize || "quarter",\n  height: DASHBOARD_WIDGET_BY_ID[widgetId]?.defaultHeight || "medium",'
)

# Add clampHeight
clampSize_str = '''const clampSize = (widgetId: string, size: DashboardSizeBucket): DashboardSizeBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return size
  const minIdx = SIZE_TO_INDEX[widget.minSize]
  const maxIdx = SIZE_TO_INDEX[widget.maxSize]
  const currentIdx = SIZE_TO_INDEX[size]
  const clampedIdx = Math.min(maxIdx, Math.max(minIdx, currentIdx))
  return SIZE_BUCKET_ORDER[clampedIdx]
}'''

clampHeight_str = '''const clampHeight = (widgetId: string, height: DashboardHeightBucket): DashboardHeightBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return height
  const minIdx = HEIGHT_TO_INDEX[widget.minHeight]
  const maxIdx = HEIGHT_TO_INDEX[widget.maxHeight]
  const currentIdx = HEIGHT_TO_INDEX[height]
  const clampedIdx = Math.min(maxIdx, Math.max(minIdx, currentIdx))
  return HEIGHT_BUCKET_ORDER[clampedIdx]
}'''

text = text.replace(clampSize_str, clampSize_str + '\n\n' + clampHeight_str)

# normalizeDashboardLayout
text = text.replace(
    'size: clampSize(id, candidate.size || fallbackInstance.size),',
    'size: clampSize(id, candidate.size || fallbackInstance.size),\n      height: clampHeight(id, candidate.height || fallbackInstance.height),'
)

# nextSizeBucket
nextSizeBucket_str = '''export const nextSizeBucket = (widgetId: string, current: DashboardSizeBucket): DashboardSizeBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return current
  const minIdx = SIZE_TO_INDEX[widget.minSize]
  const maxIdx = SIZE_TO_INDEX[widget.maxSize]
  const idx = SIZE_TO_INDEX[current]
  const candidate = idx >= maxIdx ? minIdx : idx + 1
  const next = Math.min(maxIdx, Math.max(minIdx, candidate))
  return SIZE_BUCKET_ORDER[next]
}'''

nextHeightBucket_str = '''export const nextHeightBucket = (widgetId: string, current: DashboardHeightBucket): DashboardHeightBucket => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return current
  const minIdx = HEIGHT_TO_INDEX[widget.minHeight]
  const maxIdx = HEIGHT_TO_INDEX[widget.maxHeight]
  const idx = HEIGHT_TO_INDEX[current]
  const candidate = idx >= maxIdx ? minIdx : idx + 1
  const next = Math.min(maxIdx, Math.max(minIdx, candidate))
  return HEIGHT_BUCKET_ORDER[next]
}'''

text = text.replace(nextSizeBucket_str, nextSizeBucket_str + '\n\n' + nextHeightBucket_str)

# sizeBucketClassName
sizeBucketClassName_str = '''export const sizeBucketClassName = (size: DashboardSizeBucket): string => {
  if (size === "full") return "col-span-12"
  if (size === "half") return "col-span-12 md:col-span-6"
  if (size === "third") return "col-span-12 md:col-span-6 lg:col-span-4"
  return "col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
}'''

heightBucketClassName_str = '''export const heightBucketClassName = (height: DashboardHeightBucket): string => {
  if (height === "short") return "h-[220px]"
  if (height === "medium") return "h-[360px]"
  if (height === "tall") return "h-[500px]"
  return "h-[360px]"
}'''

text = text.replace(sizeBucketClassName_str, sizeBucketClassName_str + '\n\n' + heightBucketClassName_str)

with open(path, "w") as f:
    f.write(text)

print("storage.ts updated successfully")
