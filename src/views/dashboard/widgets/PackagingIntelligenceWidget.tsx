import React, { useEffect, useMemo, useState } from "react"
import {
 Image as ImageIcon,
 ScanSearch,
 TestTube2,
 Type,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
 WidgetBadge,
 WidgetDataGrid,
 WidgetModuleFrame,
 WidgetModuleHeader,
 WidgetScrollArea,
 WidgetSizedButton,
 WidgetStepTabs,
 WidgetVideoSelect,
} from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import { listVideoPackages } from "../../../services/video-package/VideoPackageRepository"
import type { ViewTubeVideoPackage } from "../../../services/video-package/contracts"
import { listContentBuildEvents } from "../../../services/asset-engine/ContentBuildRepository"
import {
 createPackagingIntelligenceHandoff,
 derivePackagingIntelligence,
 rankPackagingIntelligenceCandidates,
 summarizeVideoPackage,
 type PackagingIntelligencePackageSummary,
 type PackagingIntelligenceVideoInput,
} from "../../../services/packagingIntelligence"
import "./PackagingIntelligenceWidget.css"

type Page = "signal" | "package" | "history"

const PAGES: readonly { id: Page; label: string }[] = [
 { id: "signal", label: "SIGNAL" },
 { id: "package", label: "PACKAGE" },
 { id: "history", label: "HISTORY" },
]

const numberFrom = (value: unknown): number | null => {
 if (value === null || value === undefined || value === "") return null
 if (typeof value === "object" && value !== null && "value" in value) {
  return numberFrom((value as { value?: unknown }).value)
 }
 const numeric = Number(value)
 return Number.isFinite(numeric) ? numeric : null
}

const metricFrom = (row: Record<string, unknown>, ...keys: string[]) => {
 const metrics = row.metrics && typeof row.metrics === "object"
  ? row.metrics as Record<string, unknown>
  : {}
 for (const key of keys) {
  const value = numberFrom(metrics[key] ?? row[key])
  if (value != null) return value
 }
 return null
}

const textFrom = (...values: unknown[]) => {
 for (const value of values) {
  if (typeof value === "string" && value.trim()) return value
 }
 return ""
}

const stringList = (value: unknown): string[] => Array.isArray(value)
 ? value.map(String).map(item => item.trim()).filter(Boolean)
 : []

const recordFrom = (value: unknown): Record<string, unknown> =>
 value && typeof value === "object" ? value as Record<string, unknown> : {}

const formatNumber = (value: number | null | undefined) => {
 if (value == null || !Number.isFinite(value)) return "—"
 return new Intl.NumberFormat("en-US", {
  notation: value >= 10000 ? "compact" : "standard",
  maximumFractionDigits: 1,
 }).format(value)
}

const formatPercent = (value: number | null | undefined) => {
 if (value == null || !Number.isFinite(value)) return "—"
 return `${value.toFixed(value >= 10 ? 0 : 1)}%`
}

const packageVideoId = (item: ViewTubeVideoPackage) =>
 item.videoId || item.publishing.publishedVideoId || null

const buildVideoInputs = (data: DashboardData): PackagingIntelligenceVideoInput[] => {
 const rows = (data.canonicalRows || []) as unknown as Record<string, unknown>[]
 const rowsById = new Map(rows.map(row => [String(row.videoId || row.id || ""), row]))
 const ids = new Set<string>([
  ...rows.map(row => String(row.videoId || row.id || "")).filter(Boolean),
  ...(data.videoAssets || []).map(asset => asset.videoId),
 ])

 return [...ids].map(videoId => {
  const row = rowsById.get(videoId) || {}
  const original = recordFrom(row.originalData)
  const snippet = recordFrom(original.snippet)
  const asset = (data.videoAssets || []).find(candidate => candidate.videoId === videoId)
  return {
   videoId,
   title: textFrom(row.title, asset?.title, snippet.title, "Untitled video"),
   thumbnailUrl: textFrom(row.thumbnailUrl, asset?.thumbnailUrl, snippet.thumbnailUrl) || null,
   description: textFrom(row.description, snippet.description, original.description),
   tags: stringList(row.tags).length ? stringList(row.tags) : stringList(snippet.tags),
   views: metricFrom(row, "views"),
   impressions: metricFrom(row, "impressions", "videoThumbnailImpressions"),
   ctr: metricFrom(row, "ctr", "videoThumbnailImpressionsClickRate"),
   avp: metricFrom(row, "averageViewPercentage", "avgViewPercentage", "avp"),
   watchTimeHours: metricFrom(row, "watchTime", "watchHours", "estimatedHoursWatched"),
  }
 })
}

const statusForDiagnosis = (diagnosis: string) => {
 if (diagnosis === "hold") return "positive" as const
 if (diagnosis === "repackage" || diagnosis === "mixed") return "warning" as const
 if (diagnosis === "content-friction") return "danger" as const
 return "neutral" as const
}

export const PackagingIntelligenceWidget: React.FC<
 CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }
> = ({ data, onNavigate, ...common }) => {
 const [page, setPage] = useState<Page>("signal")
 const [selectedVideoId, setSelectedVideoId] = useState("")

 const packages = useMemo(() => listVideoPackages(), [data.brain, data.videoAssets])
 const videoInputs = useMemo(() => buildVideoInputs(data), [data.canonicalRows, data.videoAssets])
 const packageByVideoId = useMemo(() => {
  const result: Record<string, PackagingIntelligencePackageSummary> = {}
  packages.forEach(item => {
   const videoId = packageVideoId(item)
   if (videoId) result[videoId] = summarizeVideoPackage(item)
  })
  return result
 }, [packages])
 const ranked = useMemo(
  () => rankPackagingIntelligenceCandidates(videoInputs, packageByVideoId),
  [packageByVideoId, videoInputs],
 )

 useEffect(() => {
  if (!ranked.length) {
   setSelectedVideoId("")
   return
  }
  setSelectedVideoId(current => current && ranked.some(item => item.videoId === current)
   ? current
   : ranked[0].videoId)
 }, [ranked])

 const selectedRanked = ranked.find(item => item.videoId === selectedVideoId) || ranked[0] || null
 const selectedVideo = videoInputs.find(item => item.videoId === selectedRanked?.videoId) || null
 const selected = selectedVideo
  ? derivePackagingIntelligence(selectedVideo, packageByVideoId[selectedVideo.videoId])
  : selectedRanked
 const selectedPackage = packages.find(item => packageVideoId(item) === selected?.videoId) || null
 const channelId = data.authState.channelId
  || (selected ? data.videoAssets.find(asset => asset.videoId === selected.videoId)?.channelId : null)
  || null

 const videoOptions = ranked.map((item, index) => {
  const video = videoInputs.find(candidate => candidate.videoId === item.videoId)
  return {
   value: item.videoId,
   label: item.title,
   thumbnail: video?.thumbnailUrl || undefined,
   meta: `#${index + 1} · ${item.diagnosis.replaceAll("-", " ")} · score ${item.opportunityScore}`,
  }
 })

 const openTarget = (targetToolId: "packaging-lab-pro" | "thumbnail-studio" | "content-analysis") => {
  if (!selected) return
  const handoff = createPackagingIntelligenceHandoff({
   result: selected,
   targetToolId,
   channelId,
  })
  onNavigate?.(handoff.route)
 }

 const packageRows = selected ? [
  { id: "titles", cells: { area: "TITLE VARIANTS", current: String(selected.package.titleVariants), selected: selected.package.selectedTitleLabel || "—", state: selected.package.selectedTitleId ? "SELECTED" : "OPEN" } },
  { id: "thumbs", cells: { area: "THUMBNAIL VARIANTS", current: String(selected.package.thumbnailVariants), selected: selected.package.selectedThumbnailLabel || "—", state: selected.package.selectedThumbnailId ? "SELECTED" : "OPEN" } },
  { id: "description", cells: { area: "DESCRIPTION", current: selected.package.hasDescription ? "1" : "0", selected: selected.package.hasDescription ? "Attached" : "Missing", state: selected.package.hasDescription ? "READY" : "OPEN" } },
  { id: "tags", cells: { area: "TAGS", current: selected.package.hasTags ? "1" : "0", selected: selected.package.hasTags ? "Attached" : "Missing", state: selected.package.hasTags ? "READY" : "OPEN" } },
  { id: "evidence", cells: { area: "EVIDENCE", current: String(selected.package.evidenceIds.length), selected: `${selected.package.experimentEvents} experiment events`, state: selected.package.evidenceIds.length ? "LINKED" : "OPEN" } },
  { id: "blockers", cells: { area: "BLOCKERS", current: String(selected.package.openBlockers), selected: selected.package.openBlockers ? "Needs review" : "None", state: selected.package.openBlockers ? "CHECK" : "CLEAR" } },
 ] : []

 const historyRows = useMemo(() => {
  if (!selected) return []
  const packageEvents = selectedPackage?.provenance.map(item => ({
   id: `package:${item.id}`,
   at: new Date(item.createdAt).getTime(),
   when: new Date(item.createdAt).toLocaleDateString(),
   source: item.sourceToolId,
   event: item.action,
   detail: `${item.artifactIds.length} assets · ${item.evidenceIds.length} evidence`,
  })) || []
  const buildEvents = selected.package.contentBuildId
   ? listContentBuildEvents(selected.package.contentBuildId).map(item => ({
      id: `build:${item.id}`,
      at: new Date(item.timestamp).getTime(),
      when: new Date(item.timestamp).toLocaleDateString(),
      source: item.toolId || item.actorType,
      event: item.eventType,
      detail: String((item.metadata as Record<string, unknown> | undefined)?.note || item.entityType || ""),
     }))
   : []
  return [...packageEvents, ...buildEvents]
   .sort((left, right) => right.at - left.at)
   .slice(0, 20)
   .map(item => ({
    id: item.id,
    cells: {
     when: item.when,
     event: item.event,
     source: item.source,
     detail: item.detail,
    },
   }))
 }, [selected, selectedPackage])

 const packageCompleteness = selected
  ? [selected.package.selectedTitleId, selected.package.selectedThumbnailId, selected.package.hasDescription, selected.package.hasTags].filter(Boolean).length
  : 0

 return (
  <WidgetShell {...common} icon={<ScanSearch size={22} />}>
   <div className="packaging-intelligence-widget">
    {selected ? (
     <>
      <div className="packaging-intelligence-command">
       <WidgetVideoSelect
        value={selected.videoId}
        onChange={value => {
         setSelectedVideoId(value)
         setPage("signal")
        }}
        options={videoOptions}
        label="Packaging Intelligence video"
        height={32}
        tone="default"
        className="packaging-intelligence-video-select"
        searchable
       />
       <WidgetSizedButton
        height={32}
        tone="primary"
        textFit="adaptive"
        onClick={() => openTarget("packaging-lab-pro")}
       >
        OPEN PACKAGING LAB
       </WidgetSizedButton>
      </div>

      <div className="packaging-intelligence-signal-strip" aria-label="Packaging signal summary">
       <span><small>EXPOSURE</small><b>{formatNumber(selected.metrics.impressions)}</b></span>
       <span><small>CTR</small><b>{formatPercent(selected.metrics.ctr)}</b></span>
       <span><small>AVP</small><b>{formatPercent(selected.metrics.avp)}</b></span>
       <span><small>PACKAGE</small><b>{packageCompleteness}/4</b></span>
      </div>

      <WidgetStepTabs label="Packaging Intelligence workflow" value={page} items={PAGES} onChange={setPage} />

      <WidgetScrollArea
       ariaLabel={`Packaging Intelligence ${page}`}
       className="packaging-intelligence-workspace"
       contentClassName="packaging-intelligence-scroll-content"
      >
       {page === "signal" ? (
        <WidgetModuleFrame
         className="packaging-intelligence-signal-card"
         header={<WidgetModuleHeader
          icon={<ScanSearch />}
          title={selected.headline}
          subtitle={`${selected.confidence.toUpperCase()} CONFIDENCE · OPPORTUNITY ${selected.opportunityScore}`}
          controls={<WidgetBadge height={18} status={statusForDiagnosis(selected.diagnosis)}>{selected.diagnosis.replaceAll("-", " ")}</WidgetBadge>}
         />}
         footer={
          <div className="packaging-intelligence-actions">
           <WidgetSizedButton height={24} tone="primary" textFit="adaptive" onClick={() => openTarget("packaging-lab-pro")}>PACKAGING LAB</WidgetSizedButton>
           <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => openTarget("thumbnail-studio")}>THUMBNAIL STUDIO</WidgetSizedButton>
           {selected.recommendedTarget === "content-analysis" ? (
            <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" onClick={() => openTarget("content-analysis")}>CONTENT ANALYSIS</WidgetSizedButton>
           ) : null}
          </div>
         }
        >
         <div className="packaging-intelligence-diagnosis">
          <strong>{selected.rationale}</strong>
          <div className="packaging-intelligence-evidence">
           <WidgetBadge height={18}>{formatNumber(selected.metrics.impressions)} IMPRESSIONS</WidgetBadge>
           <WidgetBadge height={18}>{formatPercent(selected.metrics.ctr)} CTR</WidgetBadge>
           <WidgetBadge height={18}>{formatPercent(selected.metrics.avp)} AVP</WidgetBadge>
           <WidgetBadge height={18}>{selected.package.titleVariants} TITLES</WidgetBadge>
           <WidgetBadge height={18}>{selected.package.thumbnailVariants} THUMBS</WidgetBadge>
           {selected.missingEvidence.map(item => <WidgetBadge key={item} height={18} status="warning">MISSING: {item}</WidgetBadge>)}
          </div>
          <p>Packaging Intelligence interprets observed package evidence. It does not claim that CTR changes prove causation or replace post-click content diagnosis.</p>
         </div>
        </WidgetModuleFrame>
       ) : null}

       {page === "package" ? (
        <div className="packaging-intelligence-package">
         <WidgetModuleFrame
          header={<WidgetModuleHeader
           icon={<Type />}
           title="CANONICAL PACKAGE STATE"
           subtitle={selected.package.packageId ? `${selected.package.provenanceEvents} provenance events · ${selected.package.openBlockers} open blockers` : "NO VIDEO PACKAGE LINKED YET"}
           controls={<WidgetBadge height={18} status={selected.package.packageId ? "positive" : "warning"}>{selected.package.packageId ? "LINKED" : "UNLINKED"}</WidgetBadge>}
          />}
         >
          <WidgetDataGrid
           ariaLabel="Packaging state"
           minWidth={560}
           columns={[
            { key: "area", label: "AREA", width: "150px" },
            { key: "current", label: "COUNT", width: "70px", align: "end" },
            { key: "selected", label: "CURRENT / SELECTED" },
            { key: "state", label: "STATE", width: "90px" },
           ]}
           rows={packageRows}
          />
         </WidgetModuleFrame>
         {!selectedPackage ? (
          <div className="packaging-intelligence-empty">
           <ImageIcon aria-hidden="true" />
           <span>This video has analytics evidence but no canonical Video Package yet. Continue in Packaging Lab Pro to create package variants instead of storing them in the widget.</span>
          </div>
         ) : null}
        </div>
       ) : null}

       {page === "history" ? (
        <div className="packaging-intelligence-history">
         <WidgetModuleFrame
          header={<WidgetModuleHeader
           icon={<TestTube2 />}
           title="PACKAGE / EXPERIMENT HISTORY"
           subtitle="Projected from Video Package provenance and ContentBuild events"
          />}
         >
          {historyRows.length ? (
           <WidgetDataGrid
            ariaLabel="Packaging provenance and experiment history"
            minWidth={620}
            columns={[
             { key: "when", label: "DATE", width: "90px" },
             { key: "event", label: "EVENT", width: "180px" },
             { key: "source", label: "SOURCE", width: "130px" },
             { key: "detail", label: "DETAIL" },
            ]}
            rows={historyRows}
           />
          ) : (
           <div className="packaging-intelligence-empty">No package provenance or ContentBuild history is available for the selected video yet.</div>
          )}
         </WidgetModuleFrame>
        </div>
       ) : null}
      </WidgetScrollArea>
     </>
    ) : (
     <div className="packaging-intelligence-no-data">
      <ScanSearch aria-hidden="true" />
      <strong>NO VIDEO PACKAGING DATA</strong>
      <span>Sync video analytics or import compatible video rows. Packaging Intelligence will use canonical impressions, CTR, AVP, Video Package and ContentBuild evidence when available.</span>
     </div>
    )}
   </div>
  </WidgetShell>
 )
}
