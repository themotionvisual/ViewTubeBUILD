import re

with open("src/services/youtubeService.ts", "r") as f:
    content = f.read()

# Part 1: fetchVideoReportPage
fetch_page_pattern = r"""  const fetchVideoReportPage = async \(
   ids: string,
   metrics: string\[\],
   startIndex = 1,
  \): Promise<any> => \{
   const safeMetrics = Array\.from\(new Set\(\["views", \.\.\.metrics\]\)\)
   const url = `https://youtubeanalytics\.googleapis\.com/v2/reports\?ids=\$\{ids\}&startDate=\$\{startDate\}&endDate=\$\{endDate\}&metrics=\$\{safeMetrics\.join\(\","\)\}&dimensions=video&maxResults=\$\{ANALYTICS_VIDEO_PAGE_SIZE\}&startIndex=\$\{startIndex\}&sort=-views`"""

fetch_page_repl = """  const fetchVideoReportPage = async (
   ids: string,
   metrics: string[],
   startIndex = 1,
  ): Promise<any> => {
   const safeMetrics = Array.from(new Set(["views", ...metrics]))
   const isVideoFilter = ids.startsWith("video==")
   const urlIds = isVideoFilter ? (channelId ? `channel==${channelId}` : "channel==MINE") : ids
   const filters = isVideoFilter ? `&filters=${ids}` : ""
   const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIds}&startDate=${startDate}&endDate=${endDate}&metrics=${safeMetrics.join(",")}&dimensions=video${filters}&maxResults=${ANALYTICS_VIDEO_PAGE_SIZE}&startIndex=${startIndex}&sort=-views`"""

content = re.sub(fetch_page_pattern, fetch_page_repl, content)

# Part 2: fetchVideoReport
fetch_report_pattern = r"""  const fetchVideoReport = async \(
   ids: string,
   metrics: string\[\],
  \): Promise<any> => \{
   const payloadPages: any\[\] = \[\]
   let startIndex = 1
   const remainingTargets = new Set\(targetVideoIdSet\)

   // The YouTube API explicitly rejects pagination for video dimensions when querying by channel without filters
   const maxPages = ids\.startsWith\("channel=="\) \? 1 : MAX_ANALYTICS_VIDEO_PAGES

   for \(let page = 0; page < maxPages; page \+= 1\) \{
    let payload: any
    try \{
     payload = await fetchVideoReportPage\(ids, metrics, startIndex\)
    \} catch \(error\) \{
     const status =
      typeof error === "object" && error !== null && "status" in error
       \? Number\(\(error as \{ status\?: unknown \}\)\.status\)
       : undefined

     // Some channels return HTTP 400 when paginating past available rows\.
     // Treat that as end-of-pages after at least one successful page\.
     if \(page > 0 && status === 400\) break
     throw error
    \}
    payloadPages\.push\(payload\)

    if \(remainingTargets\.size > 0\) \{
     const headers = \(payload\?\.columnHeaders \|\| \[\]\)\.map\(\(header: any\) =>
      String\(header\?\.name \|\| ""\)\.toLowerCase\(\),
     \)
     const videoIdx = headers\.findIndex\(
      \(header: string\) => header === "video" \|\| header === "videoid",
     \)
     if \(videoIdx >= 0 && Array\.isArray\(payload\?\.rows\)\) \{
      payload\.rows\.forEach\(\(row: unknown\) => \{
       if \(!Array\.isArray\(row\)\) return
       const rowVideoId = String\(row\[videoIdx\] \|\| ""\)
       if \(!rowVideoId\) return
       remainingTargets\.delete\(rowVideoId\)
      \}\)
     \}
    \}

    const rowCount = Array\.isArray\(payload\?\.rows\) \? payload\.rows\.length : 0
    if \(
     rowCount <= 0 \|\|
     rowCount < ANALYTICS_VIDEO_PAGE_SIZE \|\|
     remainingTargets\.size === 0
    \) \{
     break
    \}
    startIndex \+= rowCount
   \}

   return flattenReportPayloads\(payloadPages\)
  \}"""

fetch_report_repl = """  const fetchVideoReport = async (
   ids: string,
   metrics: string[],
  ): Promise<any> => {
   const payloadPages: any[] = []

   if (targetVideoIdSet.size > 0 && ids.startsWith("channel==")) {
    // If we have specific target videos, bypass full channel pagination and chunk them
    // Chunking by 150 ensures we stay well below URL length limits
    const allTargets = Array.from(targetVideoIdSet)
    const chunkSize = 150
    for (let i = 0; i < allTargets.length; i += chunkSize) {
     const chunk = allTargets.slice(i, i + chunkSize)
     const idsStr = `video==${chunk.join(",")}`
     
     // Since chunk size (150) < maxResults (200), we only need 1 page per chunk!
     try {
      const payload = await fetchVideoReportPage(idsStr, metrics, 1)
      payloadPages.push(payload)
     } catch (error) {
      const status =
       typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: unknown }).status)
        : undefined
      console.warn(`[fetchVideoReport] Chunk ${i} failed`, status, error)
      throw error // rethrow to fallback individual metric handling in fetchAnalytics
     }
    }
   } else {
    // Normal fallback pagination
    let startIndex = 1
    const remainingTargets = new Set(targetVideoIdSet)

    // The YouTube API explicitly rejects pagination for video dimensions when querying by channel without filters
    const maxPages = ids.startsWith("channel==") ? 1 : MAX_ANALYTICS_VIDEO_PAGES

    for (let page = 0; page < maxPages; page += 1) {
     let payload: any
     try {
      payload = await fetchVideoReportPage(ids, metrics, startIndex)
     } catch (error) {
      const status =
       typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: unknown }).status)
        : undefined

      // Some channels return HTTP 400 when paginating past available rows.
      // Treat that as end-of-pages after at least one successful page.
      if (page > 0 && status === 400) break
      throw error
     }
     payloadPages.push(payload)

     if (remainingTargets.size > 0) {
      const headers = (payload?.columnHeaders || []).map((header: any) =>
       String(header?.name || "").toLowerCase(),
      )
      const videoIdx = headers.findIndex(
       (header: string) => header === "video" || header === "videoid",
      )
      if (videoIdx >= 0 && Array.isArray(payload?.rows)) {
       payload.rows.forEach((row: unknown) => {
        if (!Array.isArray(row)) return
        const rowVideoId = String(row[videoIdx] || "")
        if (!rowVideoId) return
        remainingTargets.delete(rowVideoId)
       })
      }
     }

     const rowCount = Array.isArray(payload?.rows) ? payload.rows.length : 0
     if (
      rowCount <= 0 ||
      rowCount < ANALYTICS_VIDEO_PAGE_SIZE ||
      (targetVideoIdSet.size > 0 && remainingTargets.size === 0)
     ) {
      break
     }
     startIndex += rowCount
    }
   }

   return flattenReportPayloads(payloadPages)
  }"""

content = re.sub(fetch_report_pattern, fetch_report_repl, content)

with open("src/services/youtubeService.ts", "w") as f:
    f.write(content)

print("Patched youtubeService.ts")
