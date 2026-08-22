import re

with open('/Users/cwb/Downloads/viewtube/viewtubeX/src/services/youtube/youtubeAnalyticsFetcher.ts', 'r') as f:
    content = f.read()

# Define the utility functions to extract
utils = """
export interface YouTubeReportHeader {
 name: string;
 columnType?: string;
 dataType?: string;
}

export interface YouTubeReportPayload {
 columnHeaders: YouTubeReportHeader[];
 rows: (string | number)[][];
}

export const flattenReportPayloads = (payloadList: any[]): YouTubeReportPayload => {
 const rowsOut: any[] = []
 let headersOut: YouTubeReportHeader[] = []
 payloadList.forEach((payload) => {
  if (
   !payload ||
   !Array.isArray(payload.rows) ||
   !Array.isArray(payload.columnHeaders)
  ) {
   return
  }
  if (headersOut.length === 0) {
   headersOut = payload.columnHeaders.map((header: any) => ({
    name: String(header?.name || ""),
   }))
  }
  payload.rows.forEach((row: any) => {
   if (Array.isArray(row)) rowsOut.push(row)
  })
 })
 return { columnHeaders: headersOut, rows: rowsOut }
}

export const filterPayloadToTargetVideos = (payload: any, targetVideoIdSet: Set<string>): any => {
 if (targetVideoIdSet.size === 0) return payload
 if (
  !payload ||
  !Array.isArray(payload.columnHeaders) ||
  !Array.isArray(payload.rows)
 ) {
  return payload
 }
 const headers = payload.columnHeaders.map((header: any) =>
  String(header?.name || "").toLowerCase(),
 )
 const videoIdx = headers.findIndex(
  (header: string) => header === "video" || header === "videoid",
 )
 if (videoIdx < 0) return payload
 return {
  ...payload,
  rows: payload.rows.filter((row: any) => {
   if (!Array.isArray(row)) return false
   const videoId = String(row[videoIdx] || "")
   return targetVideoIdSet.has(videoId)
  }),
 }
}

export const parseVideoFilterIds = (filter: string): string[] | null => {
 if (!filter.startsWith("video==")) return null
 const raw = filter.slice("video==".length)
 const ids = raw
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean)
 return ids.length > 0 ? ids : null
}

export const buildVideoFilterCandidates = (
 videoIds: string[],
 urlIdsForFiltered: string,
 startDate: string,
 endDate: string,
 maxMetricsString: string,
 maxRequestChars: number
): string[] => {
 if (videoIds.length === 0) return []
 const basePrefix = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIdsForFiltered}&startDate=${startDate}&endDate=${endDate}&metrics=${maxMetricsString}&dimensions=video&filters=`
 const baseSuffix = `&maxResults=200`
 const candidates: string[] = []
 let current: string[] = []
 const flush = () => {
  if (current.length === 0) return
  candidates.push(`video==${current.join(",")}`)
  current = []
 }
 for (const videoId of videoIds) {
  if (current.length >= 25) {
   flush()
  }
  current.push(videoId)
  const filterValue = `video==${current.join(",")}`
  const encoded = encodeURIComponent(filterValue)
  const nextUrlLen = basePrefix.length + encoded.length + baseSuffix.length
  if (nextUrlLen > maxRequestChars && current.length > 1) {
   current.pop() // remove the last one
   flush()
   current.push(videoId) // start new batch with it
  }
 }
 flush()
 return candidates
}

"""

# We need to remove these functions from inside fetchAnalytics.
def remove_function(content, func_name):
    # Regex to find: const funcName = (args) => { ... }
    # This is tricky with regex because of nested braces. 
    # Let's do it with a simple parser.
    idx = content.find(f" const {func_name} =")
    if idx == -1:
        return content
    
    brace_count = 0
    in_func = False
    start_idx = idx
    end_idx = idx
    for i in range(idx, len(content)):
        if content[i] == '{':
            in_func = True
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if in_func and brace_count == 0:
                end_idx = i + 1
                break
    
    return content[:start_idx] + content[end_idx:]

new_content = content
for f in ["flattenReportPayloads", "filterPayloadToTargetVideos", "parseVideoFilterIds", "buildVideoFilterCandidates"]:
    new_content = remove_function(new_content, f)

# insert utils at top
imports_end = new_content.find("const unsupportedVideoAnalyticsMetrics")
new_content = new_content[:imports_end] + utils + new_content[imports_end:]

# Also replace calls to filterPayloadToTargetVideos to include the set
new_content = new_content.replace("filterPayloadToTargetVideos(payload)", "filterPayloadToTargetVideos(payload, targetVideoIdSet)")
new_content = new_content.replace("filterPayloadToTargetVideos(groupedMinimalPayload)", "filterPayloadToTargetVideos(groupedMinimalPayload, targetVideoIdSet)")
new_content = new_content.replace("filterPayloadToTargetVideos(metricPayload)", "filterPayloadToTargetVideos(metricPayload, targetVideoIdSet)")

# Replace buildVideoFilterCandidates call
new_content = new_content.replace(
    "buildVideoFilterCandidates(Array.from(targetVideoIdSet))",
    "buildVideoFilterCandidates(Array.from(targetVideoIdSet), urlIdsForFiltered, startDate, endDate, maxMetricsString, maxRequestChars)"
)

with open('/tmp/refactored.ts', 'w') as f:
    f.write(new_content)
print("Done")

