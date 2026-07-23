import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { VT_SYNC_ACTIVE_TABLE_IDS, VT_SYNC_TABLE_DEFINITIONS, VT_SYNC_VISIBLE_TABLE_CATEGORIES, VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../../upstream/tableRegistry"
import { normalizeVtSyncSnapshot, toVtSyncRawAppExport } from "../../adapters/snapshot"
import { buildVtSyncDemographicOverviewRows, getVtSyncContentTypeLabel } from "../../adapters/tableData"
import { formatVtSyncLocalMonthValue } from "../../adapters/tableFormatting"
import {
 VT_SYNC_TOOLBOX_CATEGORIES,
 VT_SYNC_SMALL_TABLE_COLORS,
 VT_SYNC_ROW_BATCH_SIZE,
 VT_SYNC_VIDEO_NON_COMPACT_WIDTHS,
 buildVtSyncTableViewModel,
 clampVtSyncColumnWidth,
 distributeVtSyncSparseColumnWidths,
 exportVtSyncTableCsv,
 formatVtSyncColumnValue,
 getVtSyncApiValuePresentation,
 getVtSyncAbsolutePercentRatio,
 getVtSyncAlphabeticSpectrumColors,
 getVtSyncBadgeValues,
 getVtSyncCategoryBadgePresentation,
 getVtSyncCategoryClickState,
 getVtSyncColumnSortedValues,
 getVtSyncColumnStateKey,
 getVtSyncCompactThumbnailWidth,
 getVtSyncOppositeColor,
 getVtSyncPresentationLabel,
 getVtSyncNumericRank,
 getVtSyncRankColor,
 getVtSyncRowHeight,
 getVtSyncSparkFillStyle,
 getVtSyncSparkGradient,
 getVtSyncTableGeometry,
 getVtSyncTableProvenance,
 getVtSyncVideoTitleLayout,
 getVisibleVtSyncColumns,
 getVtSyncHoverScrollIntent,
 getNextVtSyncCompositeSortState,
 getNextVtSyncRowLimit,
 getVtSyncPresentationColumns,
 isVtSyncCompositeSortActive,
 mapVtSyncCsvRowsToTable,
 measureVtSyncCompactColumnWidths,
 parseVtSyncCsvText,
 resolveVtSyncColumnWidth,
 reorderVtSyncColumnsWithinGroup,
 stableSortVtSyncRows,
 splitVtSyncSpecialCharacters,
 totalVtSyncColumn,
 type VtSyncSortState,
} from "./vtSyncToolboxTableModel"

const rendererSource = readFileSync(new URL("./VtSyncToolboxDataTable.tsx", import.meta.url), "utf8")
const rendererCss = readFileSync(new URL("./VtSyncToolboxDataTable.css", import.meta.url), "utf8")
const visualsSource = readFileSync(new URL("../VtSyncDataVisualsToolbox.tsx", import.meta.url), "utf8")

describe("VT Sync toolbox data table", () => {
 it("uses literal percentage-of-audience widths for demographic sparklines", () => {
  expect(getVtSyncAbsolutePercentRatio(3.1)).toBeCloseTo(0.031)
  expect(getVtSyncAbsolutePercentRatio(25.8)).toBeCloseTo(0.258)
  expect(getVtSyncAbsolutePercentRatio(100)).toBe(1)
  expect(getVtSyncAbsolutePercentRatio(125)).toBe(1)
 expect(getVtSyncAbsolutePercentRatio(undefined)).toBe(0)
 })

 it("renders one compact three-section demographic table without a numbered rail or duplicate age-total matrix column", () => {
  expect(rendererSource).toContain('className="vt-sync-demographic-board"')
  expect(rendererSource).toContain('id="vt-sync-gender-totals">Gender Totals</header>')
  expect(rendererSource).toContain('id="vt-sync-age-groups">Age Groups</header>')
  expect(rendererSource).toContain('id="vt-sync-age-gender-matrix">Age × Gender</header>')
  expect(rendererSource).toContain('table.id === "demographics" ? renderDemographicTable()')
  expect(rendererSource).not.toContain("setDemographicLayout")
  expect(rendererSource).not.toContain('table.id !== "demographics" && <div className="vt-sync-row-rail-viewport"')
  expect(rendererCss).toContain("grid-template-columns: 200px 220px minmax(520px, 1fr)")
  expect(rendererCss).toContain("border-top: 4px solid var(--vt-ink)")
 })

 it("shows source and synchronization time for every visible table", () => {
  const snapshot = normalizeVtSyncSnapshot({
   source: "vt-sync",
   snapshotId: "run-42",
   capturedAt: "2026-07-22T07:42:00.000Z",
   selectedTimeWindow: "28d",
   datasetFreshness: {
    demographics: { runId: "run-42", source: "current_run", status: "synced", updatedAt: "2026-07-22T07:44:00.000Z" },
   },
  })
  VT_SYNC_VISIBLE_TABLE_DEFINITIONS.forEach((definition) => {
   const provenance = getVtSyncTableProvenance(snapshot, definition)
   expect(provenance.sourceLabel).toBeTruthy()
   expect(provenance.updatedAt).toBeTruthy()
  })
  const demographics = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((definition) => definition.id === "demographics")!
  expect(getVtSyncTableProvenance(snapshot, demographics)).toMatchObject({
   sourceLabel: "YouTube Analytics API",
   updatedAt: "2026-07-22T07:44:00.000Z",
   statusLabel: "Current",
   windowLabel: "28-day window",
   runId: "run-42",
  })
  expect(getVtSyncTableProvenance(snapshot, demographics, "2026-07-22T08:00:00.000Z")).toMatchObject({
   sourceLabel: "Local CSV import",
   updatedAt: "2026-07-22T08:00:00.000Z",
   statusLabel: "Imported",
  })
  expect(rendererSource).toContain("vt-sync-table-footer-provenance")
 })

 it("builds one demographic matrix from the combined age and gender report", () => {
  const rows = buildVtSyncDemographicOverviewRows([
   { ageGroup: "age13-17", gender: "male", viewerPercentage: 10 },
   { ageGroup: "age13-17", gender: "female", viewerPercentage: 6 },
   { ageGroup: "age13-17", gender: "user_specified", viewerPercentage: 1 },
   { ageGroup: "age18-24", gender: "male", viewerPercentage: 20 },
   { ageGroup: "age18-24", gender: "female", viewerPercentage: 15 },
  ])

  expect(rows).toEqual([
   expect.objectContaining({
    ageGroup: "age13-17",
    ageGroupLabel: "Ages 13–17",
    ageOrder: 0,
    maleViewerPercentage: 10,
    femaleViewerPercentage: 6,
    otherViewerPercentage: 1,
    viewerPercentage: 17,
   }),
   expect.objectContaining({
    ageGroup: "age18-24",
    ageGroupLabel: "Ages 18–24",
    ageOrder: 1,
    maleViewerPercentage: 20,
    femaleViewerPercentage: 15,
    otherViewerPercentage: undefined,
    viewerPercentage: 35,
   }),
  ])
 })

 it("uses the matrix margins as age-only and gender-only viewer percentages", () => {
  const snapshot = normalizeVtSyncSnapshot({
   demographics: [
    { ageGroup: "age13-17", gender: "male", viewerPercentage: 10 },
    { ageGroup: "age13-17", gender: "female", viewerPercentage: 6 },
    { ageGroup: "age18-24", gender: "male", viewerPercentage: 20 },
    { ageGroup: "age18-24", gender: "female", viewerPercentage: 15 },
   ],
  })
  const overview = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "demographics")!
  const age = VT_SYNC_TABLE_DEFINITIONS.find((item) => item.id === "demog_age")!
  const gender = VT_SYNC_TABLE_DEFINITIONS.find((item) => item.id === "demog_gender")!
  const overviewRows = buildVtSyncTableViewModel(snapshot, overview).rows

  expect(snapshot.demographics[0].watchTimePct).toBeUndefined()
  expect(overview.columns.map((column) => column.label)).toEqual(["Age Group", "Male", "Female", "Other", "All Viewers"])
  expect(overview.columns.every((column) => column.key !== "watchTimePct")).toBe(true)
  expect(totalVtSyncColumn(overviewRows, overview.columns[1])).toMatchObject({ primary: "30%", secondary: "All ages" })
  expect(totalVtSyncColumn(overviewRows, overview.columns[2])).toMatchObject({ primary: "21%", secondary: "All ages" })
  expect(totalVtSyncColumn(overviewRows, overview.columns[4])).toMatchObject({ primary: "51%", secondary: "All ages" })
  expect(buildVtSyncTableViewModel(snapshot, age).rows).toEqual([
   expect.objectContaining({ cohort: "Ages 13–17", viewsPct: 16 }),
   expect.objectContaining({ cohort: "Ages 18–24", viewsPct: 35 }),
  ])
  expect(buildVtSyncTableViewModel(snapshot, gender).rows).toEqual([
   expect.objectContaining({ cohort: "Male", viewsPct: 30 }),
   expect.objectContaining({ cohort: "Female", viewsPct: 21 }),
  ])
  expect(exportVtSyncTableCsv(overview, overviewRows).split("\n")[0]).toBe("Age Group,Male,Female,Other,All Viewers")
 })

 it("does not manufacture suppressed demographic intersections or renormalize partial reports", () => {
  const [row] = buildVtSyncDemographicOverviewRows([
   { ageGroup: "age25-34", gender: "male", viewerPercentage: 25.8 },
  ])

  expect(row).toMatchObject({ maleViewerPercentage: 25.8, viewerPercentage: 25.8 })
  expect(row.femaleViewerPercentage).toBeUndefined()
  expect(row.otherViewerPercentage).toBeUndefined()
 })

 it("uses deterministic alphabetic spectrum badges for video metadata", () => {
  const library = ["APPLE", "DESIGN", "HISTORY", "NAPOLEON", "VIDEO"]
  expect(getVtSyncAlphabeticSpectrumColors("APPLE", library)).toEqual({
   stroke: "#FA618A",
   fill: "rgba(250, 97, 138, 0.35)",
  })
  expect(getVtSyncAlphabeticSpectrumColors("VIDEO", library)).toEqual({
   stroke: "#FF7AC8",
   fill: "rgba(255, 122, 200, 0.35)",
  })
  expect(getVtSyncAlphabeticSpectrumColors("NAPOLEON", library)).toEqual(
   getVtSyncAlphabeticSpectrumColors("napoleon", library),
  )
  expect(getVtSyncBadgeValues('["Knowledge","Military","knowledge"]')).toEqual(["Knowledge", "Military"])
  expect(getVtSyncBadgeValues("Spline 3D, animation | tutorial")).toEqual(["Spline 3D", "animation", "tutorial"])

  expect(getVtSyncCategoryBadgePresentation("Howto & Style")).toMatchObject({
   label: "How to & Style",
  })
  expect(getVtSyncCategoryBadgePresentation("Howto & Style").colors).toEqual(
   getVtSyncCategoryBadgePresentation("How to & Style").colors,
  )
  const videos = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((table) => table.id === "videos")!
  const csv = exportVtSyncTableCsv(videos, [{
   tags: ["Napoleon", "Cavalry"],
   topics: ["Knowledge", "Military"],
   category: "Film & Animation",
  }])
  expect(csv).toContain('"Napoleon, Cavalry"')
  expect(csv).toContain('"Knowledge, Military"')
  expect(csv).toContain("Film & Animation")
  expect(csv).not.toContain("--vt-badge-stroke")
  expect(rendererSource).toContain('className={`vt-sync-spectrum-list is-${kind}`}')
  expect(rendererSource).toContain('className="vt-sync-category-badges"')
  expect(rendererSource).toContain('<span className="vt-sync-category-badge">{presentation.label}</span>')
  expect(rendererSource).not.toContain("presentation.segments")
  expect(rendererCss).toContain(".vt-sync-spectrum-list { position: absolute;")
  expect(rendererCss).toContain(".vt-sync-category-badges { position: absolute;")
 })

 it("captures resize state before scheduling a React state update", () => {
  expect(rendererSource).toContain("const resize = resizeRef.current")
  expect(rendererSource).toContain("[resize.key]: clampVtSyncColumnWidth(resize.width + event.clientX - resize.start)")
  expect(rendererSource).not.toContain("[resizeRef.current!.key]")
 })

 it("presents API dimension values as friendly titles while preserving their raw values", () => {
  const trafficLabels: Record<string, string> = {
   SHORTS: "Shorts Feed", SUBSCRIBER: "Subscribers Feed", YT_SEARCH: "YouTube Search", EXT_URL: "External Websites",
   YT_CHANNEL: "Channel Pages", RELATED_VIDEO: "Suggested Videos", YT_OTHER_PAGE: "Other YouTube Features",
   PLAYLIST: "YouTube Playlists", NO_LINK_OTHER: "Direct / Unknown", NOTIFICATION: "Notifications",
   SOUND_PAGE: "Audio Pages", SHORTS_CONTENT_LINKS: "Shorts Links", END_SCREEN: "End Screens",
   HASHTAGS: "Hashtag Pages", ANNOTATION: "Annotations", IMMERSIVE_LIVE: "Live Streams",
  }
  const playbackLabels: Record<string, string> = {
   BROWSE: "Browsing Features", CHANNEL: "Channel Pages", EMBEDDED: "Embedded Players", EXTERNAL_APP: "External Apps",
   MOBILE: "Mobile Website / Legacy Apps", SEARCH: "YouTube Search Results", WATCH: "YouTube Watch Page / Official Apps",
   YT_OTHER: "Other YouTube Locations",
  }
  const adTypeLabels: Record<string, string> = {
   auctionTrueviewInstream: "Auction Skippable Ad", auctionInstream: "Auction Non-Skippable Ad",
   auctionBumperInstream: "Auction Bumper Ad", auctionDisplay: "Auction Display Ad",
   reservedInstream: "Reserved Non-Skippable Ad", reservedInstreamSelect: "Reserved Skippable Ad",
   reservedBumperInstream: "Reserved Bumper Ad", reservedDisplay: "Reserved Display Ad", unknown: "Unknown Ad Type",
  }
  const subscriberDetailLabels: Record<string, string> = {
   explore: "Kids: Explore", learning: "Kids: Learning", music: "Music Feed", "my-history": "Watch History",
   "my-subscriptions": "Subscriptions Page", "my-uploads": "My Uploads", podcasts: "Podcasts Page", shows: "Kids: Shows",
   "watch-later": "Watch Later", "what-to-watch": "YouTube Home", activity: "Channel Activity Feed",
   blogged: "Blog Links in Subscriptions", mychannel: "Likes, History & Watch Later",
   sdig: "Subscription Update Emails", uploaded: "New Uploads Feed", "/": "YouTube Home",
   "/my_subscriptions": "Subscriptions Page", PP: "Personalized Playlists",
  }

  Object.entries(trafficLabels).forEach(([apiValue, title]) => {
   expect(getVtSyncApiValuePresentation("traffic", "source", apiValue)).toEqual({ title, apiValue })
  })
  Object.entries(playbackLabels).forEach(([apiValue, title]) => {
   expect(getVtSyncApiValuePresentation("locations", "location", apiValue)).toEqual({ title, apiValue })
  })
  Object.entries(adTypeLabels).forEach(([apiValue, title]) => {
   expect(getVtSyncApiValuePresentation("ads", "adType", apiValue)).toEqual({ title, apiValue })
  })
  Object.entries(subscriberDetailLabels).forEach(([apiValue, title]) => {
   expect(getVtSyncApiValuePresentation("traffic_subscribers", "term", apiValue)).toEqual({ title, apiValue })
  })

  expect(getVtSyncApiValuePresentation("traffic", "source", "shorts")).toEqual({ title: "Shorts Feed", apiValue: "shorts" })
  expect(getVtSyncApiValuePresentation("traffic_subscribers", "term", "SUBSCRIBER.what-to-watch")).toEqual({ title: "YouTube Home", apiValue: "SUBSCRIBER.what-to-watch" })
  expect(getVtSyncApiValuePresentation("videos", "source", "SHORTS")).toBeNull()
  expect(getVtSyncApiValuePresentation("traffic", "source", "UNRECOGNIZED_SOURCE")).toBeNull()
  const trafficTable = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((table) => table.id === "traffic")!
  const sourceColumn = trafficTable.columns.find((column) => column.key === "source")!
  expect(formatVtSyncColumnValue({ source: "SHORTS" }, sourceColumn)).toBe("SHORTS")
  expect(exportVtSyncTableCsv(trafficTable, [{ source: "SHORTS" }])).toContain("SHORTS")
  expect(exportVtSyncTableCsv(trafficTable, [{ source: "SHORTS" }])).not.toContain("Shorts Feed")
  const subscriberTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "traffic_subscribers")!
  expect(exportVtSyncTableCsv(subscriberTable, [{ term: "what-to-watch" }])).toContain("what-to-watch")
  expect(exportVtSyncTableCsv(subscriberTable, [{ term: "what-to-watch" }])).not.toContain("YouTube Home")
  expect(rendererSource).toContain('className="vt-sync-api-value"')
  expect(rendererCss).toContain(".vt-sync-api-value strong { font-size: 14px;")
  expect(rendererCss).toContain(".vt-sync-api-value small { margin-top: 4px; font-size: 8px;")
 })
 it("does not include mock or random fallback data in the live renderer", () => {
  expect(rendererSource).not.toContain("MOCK" + "_DATA")
  expect(rendererSource).not.toContain("generate" + "MockMetrics")
  expect(rendererSource).not.toContain("Math" + ".random")
  expect(rendererSource).not.toContain("Mock " + "${")
 })

 it("exposes default-on private and unlisted exclusions in the settings panel", () => {
  expect(rendererSource).toContain('label="Exclude Private"')
  expect(rendererSource).toContain('label="Exclude Unlisted"')
  expect(rendererSource).toContain('checked={activePrivacyFilters.excludePrivate}')
  expect(rendererSource).toContain('checked={activePrivacyFilters.excludeUnlisted}')
 })

 it("exports active table CSV with registry headers", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "traffic")

  expect(table).toBeTruthy()
  expect(exportVtSyncTableCsv(table!, [{ source: "YouTube search", views: 10 }]).split("\n")[0]).toBe(
   table!.columns.map((column) => column.label).join(","),
  )
 })

 it("keeps visible tabs limited to successful table ids", () => {
  const visibleIds = VT_SYNC_VISIBLE_TABLE_CATEGORIES.flatMap((category) => category.tabs.map((tab) => tab.id))

  expect(visibleIds.sort()).toEqual([...VT_SYNC_ACTIVE_TABLE_IDS].sort())
  expect(visibleIds).not.toContain("traffic_shorts")
  expect(visibleIds).not.toContain("new_returning")
  expect(visibleIds).not.toContain("traffic_yt_playlist_page")
 })

 it("covers every active registry table exactly once in the parity categories", () => {
  const mapped = VT_SYNC_TOOLBOX_CATEGORIES.flatMap((category) => category.tableIds)
  expect(mapped.sort()).toEqual([...VT_SYNC_ACTIVE_TABLE_IDS].sort())
 expect(new Set(mapped).size).toBe(mapped.length)
 })

 it("maps every video column to the approved non-compact geometry", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const widths = table.columns.map((column, columnIndex) => resolveVtSyncColumnWidth({
   tableId: table.id,
   column,
   columnIndex,
   compact: false,
   sparklines: true,
  }))

  expect(table.columns).toHaveLength(52)
  // videoUrl uses preferredWidth (40) not the NON_COMPACT_WIDTHS array index
  expect(widths[1]).toBe(325)
  expect(widths[3]).toBe(40) // videoUrl: preferredWidth:36 → clamped to 40
  expect(widths.reduce((sum, width) => sum + width, 0)).toBeGreaterThan(4_000)
 })

 it("combines video identity and publishing fields only in presentation", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const presentation = getVtSyncPresentationColumns(table.id, table.columns)
  expect(presentation).toHaveLength(49)
  expect(presentation.map((column) => column.key)).not.toEqual(expect.arrayContaining(["videoId", "publishedDay", "publishedTime"]))
  expect(presentation.map((column) => column.key)).toEqual(expect.arrayContaining(["title", "publishedAt", "videoUrl"]))
  expect(table.columns.map((column) => column.key)).toEqual(expect.arrayContaining(["videoId", "videoUrl", "publishedDay", "publishedTime"]))
  expect(presentation.reduce((sum, column) => {
   const columnIndex = table.columns.findIndex((candidate) => candidate.key === column.key)
   return sum + resolveVtSyncColumnWidth({ tableId: table.id, column, columnIndex, compact: false, sparklines: true })
  }, 0)).toBeGreaterThan(3_500)
 })

 it("uses the approved compact widths, row heights, and resize clamp", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const measured = measureVtSyncCompactColumnWidths(table, [{ videoId: "abc", descriptionSnippet: "Long description", views: 123 }], (value) => value.length * 10)
  const width = (key: string, sparklines = true) => {
   const columnIndex = table.columns.findIndex((column) => column.key === key)
   return resolveVtSyncColumnWidth({ tableId: table.id, column: table.columns[columnIndex], columnIndex, compact: true, sparklines, compactWidths: measured })
  }

  expect(width("thumbnail")).toBe(52)
  expect(width("thumbnail", false)).toBe(30)
  expect(width("title")).toBe(120)
  expect(width("descriptionSnippet")).toBe(150)
  expect(width("views")).toBe(82)
  expect(resolveVtSyncColumnWidth({ tableId: table.id, column: table.columns[1], columnIndex: 1, compact: false, sparklines: true, override: 12 })).toBe(40)
  expect(resolveVtSyncColumnWidth({ tableId: table.id, column: table.columns[1], columnIndex: 1, compact: true, sparklines: false, override: 700 })).toBe(520)
  expect(getVtSyncRowHeight(false, true)).toBe(48)
  expect(getVtSyncRowHeight(true, true)).toBe(31)
  expect(getVtSyncRowHeight(true, false)).toBe(19)
  expect(getVtSyncCompactThumbnailWidth(true)).toBe(52)
  expect(getVtSyncCompactThumbnailWidth(false)).toBe(30)
  expect(clampVtSyncColumnWidth(12)).toBe(40)
  expect(clampVtSyncColumnWidth(700)).toBe(520)
 })

 it("uses oracle sparse, grouped, and large table geometry", () => {
  expect(getVtSyncTableGeometry(8, false, true)).toMatchObject({ mode: "sparse", useGroups: false, canPin: false, rowHeight: 64, totalsHeight: 64, columnHeaderHeight: 64 })
  expect(getVtSyncTableGeometry(9, false, true)).toMatchObject({ mode: "grouped", useGroups: true, canPin: false, rowHeight: 48 })
  expect(getVtSyncTableGeometry(10, false, true)).toMatchObject({ mode: "large", useGroups: true, canPin: true, rowHeight: 48 })
  expect(getVtSyncTableGeometry(8, true, true)).toMatchObject({ rowHeight: 31, totalsHeight: 16, columnHeaderHeight: 84 })
  expect(getVtSyncTableGeometry(8, true, false)).toMatchObject({ rowHeight: 19, totalsHeight: 16, columnHeaderHeight: 84 })
  expect(VT_SYNC_SMALL_TABLE_COLORS).toHaveLength(8)
 })

 it("sorts dates chronologically and each duration unit by elapsed time", () => {
  const dateColumn = { key: "date", label: "Date", group: "Time", format: "date" as const }
  expect(stableSortVtSyncRows([
   { id: "late", date: "7/10/26" },
   { id: "early", date: "2026-01-02" },
   { id: "middle", date: "2026-W10" },
  ], { key: "date", direction: "asc" }, dateColumn).map((row) => row.id)).toEqual(["early", "middle", "late"])

  const watchColumn = { key: "watchTime", label: "Watch Time", group: "Core Stats", format: "durationHours" as const }
  expect(stableSortVtSyncRows([
   { id: "long", watchTime: 2.5 },
   { id: "short", watchTime: .25 },
   { id: "middle", watchTime: 1 },
  ], { key: "watchTime", direction: "desc" }, watchColumn).map((row) => row.id)).toEqual(["long", "middle", "short"])

  const weekdayColumn = { key: "publishedDay", label: "Upload Day", group: "Video", format: "weekdayLocal" as const }
  expect(stableSortVtSyncRows([
   { id: "sunday", publishedDay: "2026-07-12T12:00:00" },
   { id: "monday", publishedDay: "2026-07-13T12:00:00" },
   { id: "friday", publishedDay: "2026-07-10T12:00:00" },
  ], { key: "publishedDay", direction: "asc" }, weekdayColumn).map((row) => row.id)).toEqual(["monday", "friday", "sunday"])

  const timeColumn = { key: "publishedTime", label: "Upload Time", group: "Video", format: "timeLocal" as const }
  expect(stableSortVtSyncRows([
   { id: "evening", publishedTime: "8:15 PM" },
   { id: "morning", publishedTime: "7:30 AM" },
   { id: "noon", publishedTime: "12:00 PM" },
  ], { key: "publishedTime", direction: "asc" }, timeColumn).map((row) => row.id)).toEqual(["morning", "noon", "evening"])

  expect(stableSortVtSyncRows([
   { id: "december", publishedAt: "2026-12-02T12:00:00Z" },
   { id: "january", publishedAt: "2026-01-02T12:00:00Z" },
   { id: "july", publishedAt: "2026-07-02T12:00:00Z" },
  ], { key: "publishedMonth", direction: "asc" }).map((row) => row.id)).toEqual(["january", "july", "december"])
 })

 it("splits special characters and trailing zero seconds in presentation", () => {
  expect(splitVtSyncSpecialCharacters("925:09:00", "watchTime")).toEqual({ value: "925:09", suffix: ":00", isNegative: false, prefix: undefined })
  expect(splitVtSyncSpecialCharacters("8:00", "youtubePremiumWatchTime")).toEqual({ value: "8", suffix: ":00", isNegative: false, prefix: undefined })
  expect(splitVtSyncSpecialCharacters("1:02:00", "estimatedRedMinutesWatched")).toEqual({ value: "1:02", suffix: ":00", isNegative: false, prefix: undefined })
  expect(splitVtSyncSpecialCharacters("12.35K h", "watchTime")).toEqual({ value: "12.35K h", isNegative: false, prefix: undefined, suffix: undefined })
  expect(splitVtSyncSpecialCharacters("1:02:03", "watchTime")).toEqual({ value: "1:02:03", isNegative: false, prefix: undefined, suffix: undefined })
  expect(splitVtSyncSpecialCharacters("12:30:00", "avgViewDuration")).toEqual({ value: "12:30:00", isNegative: false, prefix: undefined, suffix: undefined })
  expect(splitVtSyncSpecialCharacters("$123", "estimatedRevenue")).toEqual({ value: "123", prefix: "$", isNegative: false, suffix: undefined })
  expect(splitVtSyncSpecialCharacters("-$12.50", "estimatedRevenue")).toEqual({ value: "12.50", prefix: "$", isNegative: true, suffix: undefined })
  expect(splitVtSyncSpecialCharacters("15%", "ctr")).toEqual({ value: "15", suffix: "%", isNegative: false, prefix: undefined })
 })

 it("cycles composite Video and Published sorting in the requested order", () => {
  const unrelated = { key: "views", direction: "desc" as const }
  const videoOne = getNextVtSyncCompositeSortState("videos", "title", unrelated)!
  const videoTwo = getNextVtSyncCompositeSortState("videos", "title", videoOne)!
  const videoThree = getNextVtSyncCompositeSortState("videos", "title", videoTwo)!
  const videoFour = getNextVtSyncCompositeSortState("videos", "title", videoThree)!
  expect([videoOne, videoTwo, videoThree, videoFour]).toEqual([
   { key: "title", direction: "asc" },
   { key: "videoId", direction: "asc" },
   { key: "title", direction: "desc" },
   { key: "videoId", direction: "desc" },
  ])
  let published: VtSyncSortState = unrelated
  const publishedSequence = Array.from({ length: 8 }, () => {
   published = getNextVtSyncCompositeSortState("videos", "publishedAt", published)!
   return published
  })
  expect(publishedSequence).toEqual([
   { key: "publishedAt", direction: "asc" },
   { key: "publishedTime", direction: "asc" },
   { key: "publishedDay", direction: "asc" },
   { key: "publishedMonth", direction: "asc" },
   { key: "publishedAt", direction: "desc" },
   { key: "publishedTime", direction: "desc" },
   { key: "publishedDay", direction: "desc" },
   { key: "publishedMonth", direction: "desc" },
  ])
  expect(isVtSyncCompositeSortActive("videos", "title", videoTwo)).toBe(true)
  expect(isVtSyncCompositeSortActive("videos", "publishedAt", publishedSequence[3])).toBe(true)
 })

 it("uses the requested video metric-group labels exactly once in order", () => {
  const videos = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "videos")!
  expect([...new Set(videos.columns.map((column) => column.group))]).toEqual([
   "Video", "Details", "Format", "Core Stats", "Engagement", "Subscribers", "Revenue", "Advertising", "Premium", "Card Links",
  ])
  expect(videos.columns.find((column) => column.key === "watchTime")?.format).toBe("durationHours")
  expect(videos.columns.find((column) => column.key === "youtubePremiumWatchTime")?.format).toBe("durationHours")
 })

 it("forces States and DMA into full-width normal sparse geometry", () => {
  expect(getVtSyncTableGeometry(7, true, true, "sparse-full", "normal-only")).toMatchObject({
   mode: "sparse",
   useGroups: false,
   canPin: false,
   rowHeight: 64,
   totalsHeight: 64,
   columnHeaderHeight: 64,
  })
 })

 it("changes compact palettes without reversing magnitude or bar direction", () => {
  expect(getVtSyncOppositeColor("#FF83EA")).toBe("#4FFF5B")
  expect(getVtSyncOppositeColor("#ff83ea")).toBe("#4FFF5B")
  expect(getVtSyncRankColor(0, false)).toBe("#40C6E9")
  expect(getVtSyncRankColor(1, false)).toBe("#FF3B30")
  expect(getVtSyncRankColor(0, true)).toBe("#FF3B30")
  expect(getVtSyncRankColor(1, true)).toBe("#40C6E9")
  expect(getVtSyncSparkGradient(false)).toContain("#40C6E9 0%")
  expect(getVtSyncSparkGradient(false)).toContain("#FFFF61 50%")
  expect(getVtSyncSparkGradient(false)).toContain("#FF3B30 100%")
 expect(getVtSyncSparkGradient(true)).toContain("#FF3B30 0%")
  expect(getVtSyncSparkFillStyle(.2, getVtSyncSparkGradient(false), "spectrum")).toMatchObject({
   width: "20%",
   backgroundPosition: "left center",
   backgroundRepeat: "no-repeat",
   backgroundSize: "500% 100%",
  })
  expect(getVtSyncSparkFillStyle(.5, getVtSyncSparkGradient(false), "spectrum").backgroundSize).toBe("200% 100%")
  expect(getVtSyncSparkFillStyle(1, getVtSyncSparkGradient(false), "spectrum").backgroundSize).toBe("100% 100%")
  expect(getVtSyncSparkFillStyle(.5, "#4FFF5B", "solid")).toEqual({ width: "50%", background: "#4FFF5B" })
  expect(rendererCss).not.toContain("transform: scaleX(-1)")
 })

 it("renders rows in deterministic 50-row scroll batches", () => {
  expect(VT_SYNC_ROW_BATCH_SIZE).toBe(50)
  expect(getNextVtSyncRowLimit(50, 1_447)).toBe(100)
  expect(getNextVtSyncRowLimit(100, 1_447)).toBe(150)
  expect(getNextVtSyncRowLimit(1_400, 1_447)).toBe(1_447)
  expect(getNextVtSyncRowLimit(50, 34)).toBe(34)
  expect(rendererSource).toContain("const [rowLimit, setRowLimit] = useState(VT_SYNC_ROW_BATCH_SIZE)")
  expect(rendererSource).toContain("const renderedRows = sortedRows.slice(0, rowLimit)")
  expect(rendererSource).toContain("getNextVtSyncRowLimit(current, sortedRows.length)")
  expect(rendererSource).not.toContain("slice(0, 500)")
 })

 it("fills sparse desktop tables without changing explicit resize overrides", () => {
  const expanded = distributeVtSyncSparseColumnWidths([
   { key: "source", width: 112 },
   { key: "views", width: 72 },
   { key: "watch", width: 72 },
  ], 1_000)
  expect(Object.values(expanded).reduce((sum, width) => sum + width, 0)).toBe(942)

  const withOverride = distributeVtSyncSparseColumnWidths([
   { key: "source", width: 200, overridden: true },
   { key: "views", width: 100 },
  ], 500)
  expect(withOverride).toEqual({ source: 200, views: 242 })

  expect(distributeVtSyncSparseColumnWidths([
   { key: "source", width: 200 },
   { key: "views", width: 100 },
  ], 300)).toEqual({ source: 200, views: 100 })
 })

 it("keeps every normal video row fixed while adapting title typography", () => {
  expect(getVtSyncVideoTitleLayout("Short title", false, 180, 287)).toEqual({ fontSize: 16, lineCount: 1 })
  expect(getVtSyncVideoTitleLayout("A long measured title", false, 288, 287)).toEqual({ fontSize: 10, lineCount: 2 })
  expect(getVtSyncVideoTitleLayout("Any title", true)).toEqual({ fontSize: 10, lineCount: 1 })
  expect(formatVtSyncLocalMonthValue("2026-07-15T12:00:00Z")).toBe("Jul")
  expect(rendererCss).toContain(".vt-sync-data-table tbody tr { height: var(--vt-row-height)")
  expect(rendererCss).toContain(".vt-sync-cell-text { position: absolute; inset: 0;")
  expect(rendererCss).toContain(".vt-sync-zero-seconds { display: inline-block; flex: 0 0 auto; font-size: 10px;")
  expect(rendererCss).toContain(".vt-sync-vertical-scrollbar { position: relative; z-index: 70;")
  expect(rendererCss).toContain(".vt-sync-video-identity-meta > small")
  expect(rendererCss).toContain(".vt-sync-published-moment .vt-sync-date-badge")
  expect(rendererCss).toContain("font-size: 14px;")
  expect(rendererCss).toContain('td[data-column-key="topics"] .vt-sync-cell-text { display: -webkit-box;')
  expect(rendererCss).toContain("-webkit-line-clamp: 2;")
  expect(rendererCss).toContain('is-compact.no-spark .vt-sync-data-table td[data-column-key="topics"]')
  expect(rendererCss).toContain("-webkit-line-clamp: 1;")
 })

 it("uses one settings trigger, the oracle option order, and a mounted collapse region", () => {
  expect(rendererSource.match(/aria-label="Table settings"/g)).toHaveLength(2)
  expect(rendererSource.match(/className="vt-sync-toolbar-action"/g)).toHaveLength(3)
  expect(rendererSource).toContain("<AnimatedToggleIcon open={tableOpen}")
  expect(rendererSource).toContain("const [tableOpen, setTableOpen] = useState(true)")
  expect(rendererSource).toContain('id="vt-sync-table-content"')
  expect(rendererSource).not.toContain("unmountWhenClosed")
  const optionOrder = ["Dark Mode", "Compact", "Pin Columns", "Fullscreen", "Zebra Rows", "Format Rows", "Formula", "Hover Scroll", "Filters"]
  optionOrder.reduce((position, option) => {
   const next = rendererSource.indexOf(`label="${option}"`, position + 1)
   expect(next).toBeGreaterThan(position)
   return next
  }, -1)
  expect(rendererSource).not.toContain("Opposite Spark")
  expect(rendererSource).not.toContain("All Columns")
  expect(rendererSource).not.toContain("Highlight Max")
  expect(rendererSource).toContain('className="vt-sync-effect-settings"')
  expect(rendererSource).toContain('left="On" right="Off"')
  expect(rendererSource).toContain('left="Pill" right="Bar"')
  expect(rendererSource).toContain('left="Color" right="Invert"')
  expect(rendererSource).toContain('left="Stroke" right="Off"')
  expect(rendererSource).not.toContain("TriSwitch")
  expect(rendererCss).toContain(".vt-sync-effect-settings { display: grid;")
 })

 it("paints opaque sticky seams inside every header cell", () => {
  expect(rendererCss).toContain(".vt-sync-data-table thead th::after")
  expect(rendererCss).toContain("height: 3px; background: var(--vt-ink)")
  expect(rendererCss).toContain("background-clip: border-box")
  expect(rendererCss).toContain(".vt-sync-total-row th.is-collapsed { background: #d5f2fa; }")
  expect(rendererCss).toContain(".vt-sync-filter-row th.is-collapsed { background: var(--vt-ink); }")
 })

 it("uses only the two custom horizontal scrollbars and active left split menus", () => {
  expect(rendererSource).toContain('{renderScrollbar("top")}')
  expect(rendererSource).toContain('{renderScrollbar("bottom")}')
  expect(rendererSource).not.toContain("item.tableIds.length > 1 && !isActive")
  expect(rendererCss).toContain(".vt-sync-main-viewport::-webkit-scrollbar { width: 0; height: 0; display: none; }")
  expect(rendererCss).toContain(".vt-sync-main-viewport { flex: 1 1 auto; min-width: 0; overflow: auto; scrollbar-width: none; }")
  expect(rendererCss).toContain(".vt-sync-scrollbar.bottom { border-top: 4px solid var(--vt-ink)")
  expect(rendererCss).toContain(".vt-sync-scrollbar.top { height: 32px; min-height: 32px")
  expect(rendererCss).toContain(".vt-sync-scroll-track-window { position: absolute; inset: 2px;")
  expect(rendererCss).toContain(".vt-sync-scroll-thumb { position: absolute; top: 0; bottom: 0;")
  expect(rendererCss).toContain("box-sizing: border-box; border: 0;")
  expect(rendererSource).not.toContain("<i /></span>")
  expect(rendererCss).not.toContain(".vt-sync-scroll-thumb i")
  expect(rendererCss).toContain(".vt-sync-scrollbar.top button svg { width: 22px; height: 22px; display: block;")
 })

 it("renders one fixed row rail outside every horizontally scrolling table", () => {
  expect(rendererSource).toContain('className="vt-sync-row-rail-viewport" ref={rowRailScrollRef}')
  expect(rendererSource).toContain('className="vt-sync-data-table vt-sync-row-rail-table"')
  expect(rendererSource).toContain("rowRailScrollRef.current.scrollTop = node.scrollTop")
  expect(rendererSource).toContain("})), viewportWidth, 0)")
  expect(rendererSource).not.toContain("const showRowRail")
  expect(rendererCss).toContain(".vt-sync-row-rail-viewport { position: relative; z-index: 60; flex: 0 0 58px;")
  expect(rendererCss).toContain("box-shadow: inset -4px 0 0 var(--vt-ink)")
  expect(rendererCss).not.toContain(".vt-sync-row-number { position: sticky")
 })

 it("uses category-style toolbar strokes, shadows, and binary effect toggles", () => {
 expect(rendererCss).toContain(".vt-sync-toolbar-action { --vt-action-rail: #ff83ea; --vt-action-label: #ffff61;")
  expect(rendererCss).toContain("border: 3px solid var(--vt-ink); border-radius: 10px;")
  expect(rendererCss).toContain("filter: drop-shadow(5px 5px 0 var(--vt-action-shadow))")
  expect(rendererCss).toContain("background: var(--vt-action-label)")
  expect(rendererCss).toContain("font-size: 19px; line-height: 1.5; font-weight: bolder;")
  expect(rendererCss).toContain(".vt-sync-toolbar-action svg { width: 30px; height: 30px;")
  expect(rendererCss).toContain(".vt-sync-binary-toggle { display: grid;")
  expect(rendererCss).toContain(".vt-sync-binary-toggle button.active { background: var(--vt-binary-color)")
 })

 it("uses the oracle row states and explicit totals and stats rail labels", () => {
  expect(rendererCss).toContain("rgba(10,10,10,.17)")
  expect(rendererCss).toContain("tr.format-short:nth-child(odd)")
  expect(rendererCss).toContain("tr.format-long:nth-child(even)")
  expect(rendererCss).toContain("tr.format-live:nth-child(odd)")
  expect(rendererCss).toContain("tr.is-selected td { background: rgba(64,198,233,.30) !important;")
  expect(rendererCss).not.toContain("tr.is-selected td { outline: 3px")
  expect(rendererSource).toContain('className="vt-sync-row-rail-head is-totals">Totals</th>')
  expect(rendererSource).toContain('className="vt-sync-row-rail-head is-stats">Stats</th>')
 })

 it("keeps the standard data visuals toolbox collapsed and unmounted by default", () => {
  expect(visualsSource).toContain("const [isOpen, setIsOpen] = useState(false)")
  expect(visualsSource).toContain("<ToolboxScaffold")
  expect(visualsSource).toContain("unmountWhenClosed")
  expect(visualsSource.indexOf("buildVtSyncVisualPropsData")).toBeLessThan(visualsSource.indexOf("const [isOpen, setIsOpen]"))
 })

 it("scopes width state by table and keeps reordering inside a metric group", () => {
  const videos = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const identity = videos.columns.filter((column) => column.group === videos.columns[0].group)
  const reordered = reorderVtSyncColumnsWithinGroup(identity, identity[0].key, identity[1].key)

  expect(getVtSyncColumnStateKey("videos", "title")).toBe("videos|title")
  expect(getVtSyncColumnStateKey("playlists", "title")).toBe("playlists|title")
  expect(reordered.map((column) => column.key).slice(0, 2)).toEqual([identity[1].key, identity[0].key])
  expect(reorderVtSyncColumnsWithinGroup(videos.columns, videos.columns[0].key, videos.columns.at(-1)!.key)).toBe(videos.columns)
 })

 it("loads main datasets and opens split menus only for multi-table categories", () => {
  const initial = { categoryId: "content", tableId: "playlists", dropdownId: null }
  const inactive = { categoryId: "not-selected", tableId: "none", dropdownId: null }
  const daily = VT_SYNC_TOOLBOX_CATEGORIES.find((category) => category.id === "daily")!
  const selectedDaily = getVtSyncCategoryClickState(initial, daily)
  const toggledDaily = getVtSyncCategoryClickState(selectedDaily, daily)
  const channel = VT_SYNC_TOOLBOX_CATEGORIES.find((category) => category.id === "channel")!

  expect(selectedDaily).toEqual({ categoryId: "daily", tableId: "daily", dropdownId: "daily" })
  expect(toggledDaily).toEqual({ categoryId: "daily", tableId: "daily", dropdownId: null })
  expect(getVtSyncCategoryClickState(initial, channel)).toEqual({ categoryId: "channel", tableId: "channel_totals", dropdownId: null })
  expect(Object.fromEntries(VT_SYNC_TOOLBOX_CATEGORIES.map((category) => [category.id, getVtSyncCategoryClickState(inactive, category).tableId]))).toEqual({
   content: "videos",
   daily: "daily",
   channel: "channel_totals",
   traffic: "traffic",
   audience: "demographics",
   global: "geography",
   revenue: "ads",
  })
 })

 it("keeps presentation aliases separate from registry and export labels", () => {
  const videos = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  expect(getVtSyncPresentationLabel(videos.id, videos.label)).toBe("Videos")
  expect(getVtSyncPresentationLabel("creator", "Content Type")).toBe("Formats")
  expect(getVtSyncPresentationLabel("geography", "Overview")).toBe("Countries")
  expect(videos.label).toBe("Video Metadata & Metrics")
  expect(exportVtSyncTableCsv(videos, []).split("\n")[0]).toBe(videos.columns.map((column) => column.label).join(","))
 })

 it("derives formulas without manufacturing values from missing inputs", () => {
  const snapshot = normalizeVtSyncSnapshot({
   videos: [
    { id: "complete", title: "Complete", metrics: { views: 100, engagedViews: 25, likes: 9, dislikes: 1, subscribersGained: 3, subscribersLost: 1 } },
    { id: "missing", title: "Missing", metrics: { views: 50, likes: 0, subscribersGained: 0 } },
   ],
  })
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const rows = buildVtSyncTableViewModel(snapshot, table).rows

  expect(rows[0]).toMatchObject({ engagementRate: 25, likeRatio: 90, netSubscribers: 2, subRatio: 30, subRate: 3 })
  expect(rows[1].engagementRate).toBeUndefined()
  expect(rows[1].likeRatio).toBeUndefined()
  expect(rows[1].netSubscribers).toBeUndefined()
  expect(rows[1].subRatio).toBe(0)
  expect(rows[1].subRate).toBe(0)
  expect(getVisibleVtSyncColumns(table, rows, false, true).some((column) => column.isFormula)).toBe(false)
 })

 it("shows optional groups only when the snapshot contains meaningful values", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const emptyRevenue = buildVtSyncTableViewModel(normalizeVtSyncSnapshot({ videos: [{ id: "zero", title: "Zero", metrics: { views: 0, revenue: 0 } }] }), table).rows
  const paidRevenue = buildVtSyncTableViewModel(normalizeVtSyncSnapshot({ videos: [{ id: "paid", title: "Paid", metrics: { views: 10, revenue: 1 } }] }), table).rows

  expect(getVisibleVtSyncColumns(table, emptyRevenue, true, true).some((column) => column.group === "Revenue")).toBe(false)
  expect(getVisibleVtSyncColumns(table, paidRevenue, true, true).some((column) => column.group === "Revenue")).toBe(true)
 })

 it("keeps totals anchored when formulas are hidden", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const rows = buildVtSyncTableViewModel(normalizeVtSyncSnapshot({ videos: [{ id: "a", metrics: { views: 10 } }, { id: "b", metrics: { views: 5 } }] }), table).rows
  const views = table.columns.find((column) => column.key === "views")!
  expect(totalVtSyncColumn(rows, views).primary).toBe("15")
  expect(getVisibleVtSyncColumns(table, rows, false, true).find((column) => column.key === "views")).toBe(views)
 })

 it("renders numeric zeroes as dashes without changing raw rows or CSV exports", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const views = table.columns.find((column) => column.key === "views")!
  const duration = table.columns.find((column) => column.key === "duration")!
  const caption = table.columns.find((column) => column.key === "caption")!
  const row = { views: 0, duration: "PT0S", caption: "0" }

  expect(formatVtSyncColumnValue(row, views)).toBe("-")
  expect(formatVtSyncColumnValue(row, duration)).toBe("-")
  expect(formatVtSyncColumnValue(row, caption)).toBe("No")
  expect(row.views).toBe(0)
  expect(exportVtSyncTableCsv(table, [row])).toContain(",0,")
 })

 it("excludes zeroes from averages and every visual ranking path", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const views = table.columns.find((column) => column.key === "views")!
  const averageViewed = table.columns.find((column) => column.key === "averagePercentageViewed")!
  const rows = [{ views: 0, averagePercentageViewed: 0 }, { views: 10, averagePercentageViewed: 50 }]

  expect(totalVtSyncColumn(rows, views)).toMatchObject({ primary: "10", secondary: "Avg 10" })
  expect(totalVtSyncColumn(rows, averageViewed)).toMatchObject({ primary: "50%", secondary: "Mean avg" })
  expect(totalVtSyncColumn([{ views: 0 }], views)).toMatchObject({ primary: "-", kind: "muted" })
  expect(getVtSyncColumnSortedValues(rows, views)).toEqual([10])
  expect(getVtSyncNumericRank(0, [10])).toBe(0)
  expect(getVtSyncNumericRank(undefined, [10])).toBe(0)
  expect(getVtSyncNumericRank(10, [10])).toBe(1)
 })

 it("round-trips AI Studio-shaped JSON and placeholder inventory through one snapshot contract", () => {
  const imported = normalizeVtSyncSnapshot({
   videos: [{ id: "video-1", title: "Studio row", metrics: { views: 0, revenue: null } }],
   dailyMetrics: [{ date: "2026-07-01", views: 4 }, { date: "2026-07-08", views: 6 }],
   playlists: [{ playlistId: "pl-1", title: "Playlist", videoCount: 2 }],
   tableExports: { uploads_playlist: [{ videoId: "upload-1" }] },
  })
  const roundTrip = normalizeVtSyncSnapshot(toVtSyncRawAppExport(imported))
  expect(roundTrip.videos).toHaveLength(1)
  expect(roundTrip.videos[0].metrics?.views).toBe(0)
  expect(roundTrip.playlistsData[0]).toMatchObject({ playlistId: "pl-1", title: "Playlist" })
  expect(buildVtSyncTableViewModel(roundTrip, VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "weekly")!).rows).toHaveLength(2)

  const placeholder = normalizeVtSyncSnapshot({ tableExports: { uploads_playlist: [{ videoId: "upload-1" }] } })
  expect(placeholder.videos[0]).toMatchObject({ id: "upload-1", vtSyncPlaceholder: true })
 })

 it("imports active-table and YouTube-style CSV headers without manufacturing missing zeroes", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const parsed = parseVtSyncCsvText('Video ID,Video Title,Views,Watch Time,Avg. View Dur.,Premium Watch,Description\nabc,"A title",0,925.15,1:32,8:00,"Line one\nLine two"\ndef,"Clock import",,1:30:00,bad,1:02:00,')
  const rows = mapVtSyncCsvRowsToTable(table, parsed)

  expect(rows[0]).toMatchObject({ videoId: "abc", title: "A title", views: 0, watchTime: 925.15, avgViewDuration: 92, youtubePremiumWatchTime: 8 / 60, descriptionSnippet: "Line one\nLine two" })
  expect(rows[1]).toMatchObject({ videoId: "def", title: "Clock import", watchTime: 1.5, youtubePremiumWatchTime: 62 / 60 })
  expect(rows[1]).not.toHaveProperty("views")
  expect(rows[1]).not.toHaveProperty("avgViewDuration")
 })

 it("uses the unpinned viewport edge bands for normal and fast hover scrolling", () => {
  expect(getVtSyncHoverScrollIntent(0, 1_000)).toEqual({ direction: -1, speed: 2 })
  expect(getVtSyncHoverScrollIntent(120, 1_000)).toEqual({ direction: -1, speed: 1 })
  expect(getVtSyncHoverScrollIntent(500, 1_000)).toEqual({ direction: 0, speed: 1 })
  expect(getVtSyncHoverScrollIntent(880, 1_000)).toEqual({ direction: 1, speed: 1 })
  expect(getVtSyncHoverScrollIntent(960, 1_000)).toEqual({ direction: 1, speed: 2 })
 })

 it("formats video metadata like the approved table and builds truthful URL actions", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "videos")!
  const rows = buildVtSyncTableViewModel(normalizeVtSyncSnapshot({
   channelName: "Test Channel",
   videos: [{ id: "abc", title: "Video", publishedAt: "2026-06-16T12:00:00Z", duration: "PT12M30S", definition: "hd", privacyStatus: "public" }],
  }), table).rows
  const column = (key: string) => table.columns.find((item) => item.key === key)!

  expect(rows[0].videoUrl).toBe("https://www.youtube.com/watch?v=abc")
  expect(formatVtSyncColumnValue(rows[0], column("publishedAt"))).toBe("6/16/26")
  expect(formatVtSyncColumnValue(rows[0], column("publishedDay"))).toMatch(/^[A-Za-z]+$/)
  expect(formatVtSyncColumnValue(rows[0], column("publishedTime"))).toMatch(/^\d{1,2}:\d{2}(?:\s[AP]M)?$/i)
  expect(formatVtSyncColumnValue(rows[0], column("duration"))).toBe("12:30")
  expect(formatVtSyncColumnValue(rows[0], column("definition"))).toBe("1080p")
  expect(totalVtSyncColumn(rows, column("title"), { channelName: "Test Channel" })).toMatchObject({ primary: "Test Channel", secondary: "Channel title", kind: "context" })
  expect(totalVtSyncColumn(rows, column("duration"), {})).toMatchObject({ primary: "12:30", secondary: "Avg duration" })
 })

 it("enriches geography tables while keeping identity codes non-statistical", () => {
  const snapshot = normalizeVtSyncSnapshot({
   geography: [{ country: "US", views: 100 }],
   cities: [{ country: "GB", city: "London", views: 25 }],
   provinces: [{ province: "US-CA", views: 20 }],
   dmaRegions: [{ dma: "803", views: 10 }, { dma: "999", views: 1 }],
  })
  const view = (tableId: string) => buildVtSyncTableViewModel(
   snapshot,
   VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((table) => table.id === tableId)!,
  )

  expect(view("geography").rows[0]).toMatchObject({ countryCode: "US", countryName: "United States", countryFlag: "us" })
  expect(view("cities").rows[0]).toMatchObject({ city: "London", countryCode: "GB", countryName: "United Kingdom", countryFlag: "gb" })
  expect(view("provinces").rows[0]).toMatchObject({ provinceCode: "US-CA", stateName: "California" })
  expect(view("dma").rows[0]).toMatchObject({ dmaCode: "803", dmaName: "Los Angeles, CA" })
  expect(view("dma").rows[1]).toMatchObject({ dmaCode: "999", dmaName: "Unmapped DMA" })

  const dmaCode = view("dma").table.columns.find((column) => column.key === "dmaCode")!
  expect(dmaCode).toMatchObject({ semanticRole: "identity", visualization: "none" })
  expect(getVtSyncColumnSortedValues(view("dma").rows, dmaCode)).toEqual([])
  expect(totalVtSyncColumn(view("dma").rows, dmaCode)).toEqual({ primary: "-", kind: "muted" })
 })

 it("uses the approved geography column sets and removes only the final country Revenue group", () => {
  const table = (id: string) => VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === id)!
  const keys = (id: string) => table(id).columns.map((column) => column.key)

  expect(keys("geography").slice(0, 3)).toEqual(["countryFlag", "countryCode", "countryName"])
  expect(keys("geography")).toEqual(expect.arrayContaining(["revenue", "estimatedAdRevenue", "youtubePremiumRevenue"]))
  expect(keys("geography")).not.toEqual(expect.arrayContaining(["cpm", "grossRevenue", "monetizedPlaybacks", "playbackBasedCpm", "adImpressions"]))
  expect(keys("cities")).toEqual(["countryFlag", "city", "countryName", "views", "engagedViews", "watchTime", "avgDuration", "avgPercentageViewed"])
  expect(keys("provinces")).toEqual(["provinceCode", "stateName", "views", "engagedViews", "watchTime", "avgDuration", "avgPercentageViewed"])
  expect(keys("dma")).toEqual(["dmaCode", "dmaName", "views", "engagedViews", "watchTime", "avgDuration", "avgPercentageViewed"])
  expect(table("provinces")).toMatchObject({ layoutMode: "sparse-full", compactMode: "normal-only" })
  expect(table("dma")).toMatchObject({ layoutMode: "sparse-full", compactMode: "normal-only" })
  expect(rendererCss).toContain(".vt-sync-flag-thumbnail")
  expect(rendererSource).toContain('import "flag-icons/css/flag-icons.min.css"')
  expect(rendererSource).toContain('className={`fi fi-${text}`}')
  expect(rendererCss).toContain("aspect-ratio: 16 / 9")
  expect(rendererCss).toContain("border-radius: 0")
 })

 it("applies exact Playlist identity sizing without allowing long values to grow rows", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "playlists")!
  const playlistId = table.columns.find((column) => column.key === "playlistId")!
  const title = table.columns.find((column) => column.key === "title")!

  expect(resolveVtSyncColumnWidth({ tableId: table.id, column: playlistId, columnIndex: 0, compact: false, sparklines: true })).toBe(190)
  expect(resolveVtSyncColumnWidth({ tableId: table.id, column: title, columnIndex: 1, compact: false, sparklines: true })).toBe(240)
  expect(resolveVtSyncColumnWidth({ tableId: table.id, column: title, columnIndex: 1, compact: false, sparklines: true, override: 275 })).toBe(275)
  expect(playlistId.textSize).toBe(10)
  expect(title.textSize).toBe(13)
  expect(rendererCss).toContain('td[data-column-key="playlistId"] .vt-sync-cell-text.is-table-sized-text')
  expect(rendererCss).toContain('td[data-column-key="title"] .vt-sync-cell-text.is-table-sized-text')
 })

 it("normalizes Formats aliases while preserving unknown raw labels and CSV output", () => {
  expect(getVtSyncContentTypeLabel("shorts")).toBe("Shorts")
  expect(getVtSyncContentTypeLabel("videoOnDemand")).toBe("Long-Format")
  expect(getVtSyncContentTypeLabel("video_on_demand")).toBe("Long-Format")
  expect(getVtSyncContentTypeLabel("vod")).toBe("Long-Format")
  expect(getVtSyncContentTypeLabel("long")).toBe("Long-Format")
  expect(getVtSyncContentTypeLabel("liveStream")).toBe("Live Stream")
  expect(getVtSyncContentTypeLabel("live_stream")).toBe("Live Stream")
  expect(getVtSyncContentTypeLabel("live")).toBe("Live Stream")
  expect(getVtSyncContentTypeLabel("premiere")).toBe("premiere")

  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === "creator")!
  const rows = buildVtSyncTableViewModel(normalizeVtSyncSnapshot({
   creatorContentTypes: [{ creatorContentType: "videoOnDemand", views: 2 }],
  }), table).rows
  expect(rows[0]).toMatchObject({ contentTypeCode: "videoOnDemand", term: "Long-Format" })
  expect(exportVtSyncTableCsv(table, rows)).toContain("Long-Format")
  expect(exportVtSyncTableCsv(table, rows)).not.toContain("videoOnDemand")
 })
})
