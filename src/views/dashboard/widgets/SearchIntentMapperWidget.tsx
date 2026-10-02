import React, { useEffect, useMemo, useState } from "react"
import { Search, Target } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
 WidgetBadge,
 WidgetDataGrid,
 WidgetModuleFrame,
 WidgetModuleHeader,
 WidgetScrollArea,
 WidgetSizedButton,
 WidgetSizedSelect,
} from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import {
 buildSearchIntentClusters,
 createSearchIntentProjectHandoff,
 resolveSearchIntentDatasetState,
 type SearchIntentCluster,
 type SearchIntentKind,
 type SearchIntentTermInput,
 type SearchIntentVideoCoverageInput,
} from "../../../services/searchIntentMapper"
import "./SearchIntentMapperWidget.css"

type IntentFilter = "all" | SearchIntentKind

const INTENT_OPTIONS = [
 { value: "all", label: "All intents" },
 { value: "EXPLAIN", label: "EXPLAIN" },
 { value: "COMPARE", label: "COMPARE" },
 { value: "DISCOVER", label: "DISCOVER" },
]

const numberFrom = (value: unknown): number => {
 if (value && typeof value === "object" && "value" in value) {
  return numberFrom((value as { value?: unknown }).value)
 }
 const parsed = Number(value)
 return Number.isFinite(parsed) ? parsed : 0
}

const stringFrom = (...values: unknown[]): string => {
 for (const value of values) {
  if (typeof value === "string" && value.trim()) return value.trim()
 }
 return ""
}

const stringList = (value: unknown): string[] => {
 if (Array.isArray(value)) return value.map(String).map(item => item.trim()).filter(Boolean)
 if (typeof value === "string") return value.split(",").map(item => item.trim()).filter(Boolean)
 return []
}

const recordFrom = (value: unknown): Record<string, unknown> =>
 value && typeof value === "object" ? value as Record<string, unknown> : {}

const formatObserved = (value: number) => new Intl.NumberFormat("en-US", {
 notation: value >= 10000 ? "compact" : "standard",
 maximumFractionDigits: 1,
}).format(value)

const formatDate = (value: string) => {
 const date = new Date(value)
 return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const buildCoverageCatalog = (data: DashboardData): SearchIntentVideoCoverageInput[] => {
 const byId = new Map<string, SearchIntentVideoCoverageInput>()
 ;((data.canonicalRows || []) as unknown as Record<string, unknown>[]).forEach(row => {
  const original = recordFrom(row.originalData)
  const snippet = recordFrom(original.snippet)
  const videoId = stringFrom(row.videoId, row.id, original.videoId, original.id)
  if (!videoId) return
  byId.set(videoId, {
   videoId,
   title: stringFrom(row.title, snippet.title, original.title, videoId),
   tags: stringList(row.tags).length ? stringList(row.tags) : stringList(snippet.tags),
  })
 })
 ;(data.videoAssets || []).forEach(asset => {
  const current = byId.get(asset.videoId)
  byId.set(asset.videoId, {
   videoId: asset.videoId,
   title: current?.title || asset.title || asset.videoId,
   tags: current?.tags || [],
  })
 })
 return [...byId.values()]
}

const searchTrafficViews = (rows: readonly Record<string, unknown>[]) => rows
 .filter(row => {
  const identity = [
   row.source,
   row.term,
   row.title,
   row.sourceType,
   row.insightTrafficSourceType,
  ].map(String).join(" ")
  return /YT_SEARCH|YouTube Search/i.test(identity)
 })
 .reduce((sum, row) => sum + numberFrom(row.views), 0)

const freshnessForSearch = (data: DashboardData) => {
 const freshness = data.overviewChartData?.datasetFreshness || {}
 return freshness.search_terms
  || freshness.traffic_detail_search_terms
  || freshness.search
  || null
}

const termInputs = (data: DashboardData): SearchIntentTermInput[] => {
 const snapshot = data.overviewChartData
 const freshness = freshnessForSearch(data)
 const inputs: SearchIntentTermInput[] = []
 ;(snapshot?.searchTerms || []).forEach(row => {
  const record = row as Record<string, unknown>
  const term = stringFrom(record.term, record.insightTrafficSourceDetail, record.detail, record.title)
  if (!term) return
  inputs.push({
   term,
   views: numberFrom(record.views),
   watchTime: record.watchTime == null ? null : numberFrom(record.watchTime),
   videoId: stringFrom(record.videoId) || null,
   source: "youtube_analytics_v2:search_terms",
   observedAt: stringFrom(record.day, record.date, record.observedAt, freshness?.updatedAt, snapshot?.capturedAt) || "unknown-date",
   coverageStatus: (
    record.coverageStatus === "complete"
    || record.coverageStatus === "partial"
    || record.coverageStatus === "unavailable"
    || record.coverageStatus === "unsupported"
   ) ? record.coverageStatus : null,
  })
 })
 return inputs
}

const stateCopy = {
 missing: {
  title: "SEARCH TERMS NOT SYNCED",
  detail: "The Search Terms dataset is missing. Missing detail is not zero demand; sync YouTube Search Terms before mapping intent.",
 },
 withheld: {
  title: "SEARCH DETAIL WITHHELD",
  detail: "YouTube Search is contributing traffic, but query-level rows are unavailable at this reporting grain. Do not interpret the missing terms as zero demand.",
 },
 zero: {
  title: "ZERO OBSERVED SEARCH TERMS",
  detail: "The Search Terms dataset synced successfully and contains no observed query rows for this scope. No search gap is inferred from an empty result.",
 },
 stale: {
  title: "SEARCH EVIDENCE IS STALE",
  detail: "The existing query rows are older than the current freshness contract. Review them cautiously or refresh Search Terms in Analytics.",
 },
 error: {
  title: "SEARCH TERMS SYNC FAILED",
  detail: "ViewTube cannot map search intent until the Search Terms dataset is available again.",
 },
 ready: {
  title: "SEARCH TERMS READY",
  detail: "",
 },
} as const

const statusForState = (state: keyof typeof stateCopy) => {
 if (state === "ready") return "positive" as const
 if (state === "error") return "danger" as const
 if (state === "stale" || state === "withheld") return "warning" as const
 return "neutral" as const
}

const ClusterNode: React.FC<{
 cluster: SearchIntentCluster
 active: boolean
 maxViews: number
 onClick: () => void
}> = ({ cluster, active, maxViews, onClick }) => {
 const weight = maxViews > 0 ? Math.max(.35, cluster.observedViews / maxViews) : .35
 return (
  <button
   type="button"
   className={`search-intent-cluster-node ${active ? "is-active" : ""}`}
   style={{ "--search-intent-node-weight": weight } as React.CSSProperties}
   aria-pressed={active}
   onClick={onClick}
  >
   <span className="search-intent-cluster-node-intent">{cluster.intent}</span>
   <strong>{cluster.unansweredCount}</strong>
   <small>UNANSWERED</small>
   <span>{cluster.coveragePct}% covered</span>
  </button>
 )
}

export const SearchIntentMapperWidget: React.FC<
 CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }
> = ({ data, onNavigate, ...common }) => {
 const [intentFilter, setIntentFilter] = useState<IntentFilter>("all")
 const [selectedClusterId, setSelectedClusterId] = useState("")

 const inputs = useMemo(() => termInputs(data), [data.overviewChartData])
 const catalog = useMemo(() => buildCoverageCatalog(data), [data.canonicalRows, data.videoAssets])
 const clusters = useMemo(() => buildSearchIntentClusters(inputs, catalog), [inputs, catalog])
 const visibleClusters = useMemo(
  () => intentFilter === "all" ? clusters : clusters.filter(cluster => cluster.intent === intentFilter),
  [clusters, intentFilter],
 )
 const freshness = freshnessForSearch(data)
 const observedSearchViews = searchTrafficViews(
  (data.overviewChartData?.trafficSources || []) as Record<string, unknown>[],
 )
 const datasetState = resolveSearchIntentDatasetState({
  rows: data.overviewChartData?.searchTerms || [],
  freshnessStatus: freshness?.status || null,
  searchTrafficViews: observedSearchViews,
 })
 const effectiveState = data.isSyncing && inputs.length === 0 ? "loading" : datasetState
 const blocked = !data.authState.isAuthenticated

 useEffect(() => {
  if (!visibleClusters.length) {
   setSelectedClusterId("")
   return
  }
  setSelectedClusterId(current => visibleClusters.some(cluster => cluster.id === current)
   ? current
   : visibleClusters[0].id)
 }, [visibleClusters])

 const selected = visibleClusters.find(cluster => cluster.id === selectedClusterId) || visibleClusters[0] || null
 const maxViews = Math.max(...visibleClusters.map(cluster => cluster.observedViews), 1)

 const openAnalytics = () => {
  if (onNavigate) onNavigate("/analytics")
  else if (typeof window !== "undefined") window.location.assign("/analytics")
 }

 const stageIdea = () => {
  if (!selected || selected.unansweredCount <= 0) return
  const handoff = createSearchIntentProjectHandoff({
   cluster: selected,
   channelId: data.authState.channelId || data.overviewChartData?.channelId || null,
  })
  if (onNavigate) onNavigate(handoff.route)
  else if (typeof window !== "undefined") window.location.assign(handoff.route)
 }

 const termRows = selected?.terms.slice(0, 8).map(term => ({
  id: term.evidenceId,
  cells: {
   term: term.term,
   views: formatObserved(term.observedViews),
   coverage: term.coverage === "matched"
    ? <WidgetBadge height={18} status="positive">ANSWERED</WidgetBadge>
    : <WidgetBadge height={18} status="warning">GAP</WidgetBadge>,
   evidence: `${formatDate(term.observedAt)} · ${term.matchReason === "direct-video" ? "direct video" : term.matchReason === "catalog-title" ? "catalog title" : "no explicit match"}`,
  },
 })) || []

 const showMappedData = !blocked && (effectiveState === "ready" || effectiveState === "stale") && clusters.length > 0

 return (
  <WidgetShell {...common} icon={<Search size={22} />}>
   <div className="search-intent-mapper-widget">
    <div className="search-intent-mapper-toolbar">
     <WidgetSizedSelect
      height={32}
      value={intentFilter}
      onChange={value => setIntentFilter(value as IntentFilter)}
      label="Search intent"
      options={INTENT_OPTIONS}
     />
     <div className="search-intent-mapper-toolbar-status">
      <WidgetBadge
       height={24}
       status={blocked ? "warning" : effectiveState === "loading" ? "neutral" : statusForState(effectiveState)}
      >
       {blocked ? "CHANNEL BLOCKED" : effectiveState === "loading" ? "SYNCING" : effectiveState.toUpperCase()}
      </WidgetBadge>
      {freshness?.updatedAt ? <span>{formatDate(freshness.updatedAt)}</span> : null}
     </div>
    </div>

    {showMappedData ? (
     <WidgetScrollArea
      ariaLabel="Search intent mapping"
      className="search-intent-mapper-workspace"
      contentClassName="search-intent-mapper-scroll"
     >
      <div className="search-intent-mapper-layout">
       <WidgetModuleFrame
        className="search-intent-mapper-map-frame"
        header={<WidgetModuleHeader
         icon={<Target />}
         title="INTENT CLUSTER MAP"
         subtitle={`${inputs.length} OBSERVED SEARCH TERMS · ${formatObserved(inputs.reduce((sum, row) => sum + numberFrom(row.views), 0))} CHANNEL SEARCH VIEWS`}
        />}
       >
        <div className="search-intent-cluster-map" aria-label="Observed search intent clusters">
         {visibleClusters.map(cluster => (
          <ClusterNode
           key={cluster.id}
           cluster={cluster}
           active={cluster.id === selected?.id}
           maxViews={maxViews}
           onClick={() => setSelectedClusterId(cluster.id)}
          />
         ))}
        </div>
        <p className="search-intent-mapper-volume-note">
         Observed views are views attributed to these search terms on this channel. They are not public search-volume estimates.
        </p>
       </WidgetModuleFrame>

       {selected ? (
        <WidgetModuleFrame
         className="search-intent-mapper-detail-frame"
         header={<WidgetModuleHeader
          title={selected.label}
          subtitle={`${selected.coveragePct}% EXPLICIT COVERAGE · ${selected.unansweredCount} UNANSWERED`}
          controls={<WidgetBadge height={18} status={selected.unansweredCount ? "warning" : "positive"}>{selected.unansweredCount ? "GAP FOUND" : "COVERED"}</WidgetBadge>}
         />}
         footer={
          <div className="search-intent-mapper-detail-footer">
           <span>{selected.evidenceIds.length} evidence refs preserved</span>
           <WidgetSizedButton
            height={24}
            tone="primary"
            textFit="adaptive"
            disabled={selected.unansweredCount <= 0}
            onClick={stageIdea}
           >
            {selected.unansweredCount > 0 ? "STAGE IDEA IN PROJECTS" : "CLUSTER COVERED"}
           </WidgetSizedButton>
          </div>
         }
        >
         <WidgetDataGrid
          ariaLabel={`${selected.intent} search terms`}
          minWidth={520}
          columns={[
           { key: "term", label: "OBSERVED TERM", width: "minmax(180px, 1fr)" },
           { key: "views", label: "VIEWS", width: "70px", align: "end" },
           { key: "coverage", label: "COVERAGE", width: "90px" },
           { key: "evidence", label: "EVIDENCE", width: "160px" },
          ]}
          rows={termRows}
         />
        </WidgetModuleFrame>
       ) : null}
      </div>
     </WidgetScrollArea>
    ) : (
     <WidgetModuleFrame
      className="search-intent-mapper-state"
      header={<WidgetModuleHeader
       icon={<Search />}
       title={blocked ? "CONNECT CHANNEL FOR SEARCH INTENT" : effectiveState === "loading" ? "SYNCING SEARCH TERMS" : stateCopy[effectiveState].title}
       subtitle={blocked ? "Search Intent Mapper only uses creator-owned canonical analytics evidence." : effectiveState === "loading" ? "Waiting for current VT-SYNC evidence" : "No unsupported demand estimate will be substituted."}
      />}
      footer={
       <WidgetSizedButton height={24} tone="primary" onClick={blocked ? () => onNavigate?.("/account") : openAnalytics}>
        {blocked ? "OPEN ACCOUNT" : "OPEN ANALYTICS"}
       </WidgetSizedButton>
      }
     >
      <div className="search-intent-mapper-state-copy">
       {blocked
        ? "Connect the YouTube channel before mapping observed search queries. ViewTube will not use generic web keywords as a substitute for creator search evidence."
        : effectiveState === "loading"
         ? "Search Terms are currently syncing. The map will appear only when source state and query rows can be distinguished."
         : stateCopy[effectiveState].detail}
      </div>
     </WidgetModuleFrame>
    )}
   </div>
  </WidgetShell>
 )
}
