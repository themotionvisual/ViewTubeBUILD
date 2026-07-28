import React from "react"
import {
 AlertTriangle,
 ArrowDown,
 CheckCircle2,
 Clapperboard,
 LoaderCircle,
 RefreshCw,
 Sparkles,
 Youtube,
} from "lucide-react"

import {
 VT_SYNC_CATEGORY_OPTIONS,
 type VtSyncDatasetFreshness,
 type VtSyncLocalSyncProgress,
 type VtSyncSnapshot,
 type VtSyncVideoItem,
} from ".."
import "./VtSyncCreatorHero.css"

type VtSyncCreatorHeroStatus =
 | "syncing"
 | "disconnected"
 | "failed"
 | "partial"
 | "stale"
 | "first-sync"
 | "available"

type VtSyncCreatorHeroAction = "connect" | "recommended-sync" | "progress"

export type VtSyncCreatorCoverageItem = {
 id: string
 label: string
 status: "synced" | "partial" | "failed" | "stale" | "never" | "running"
}

export type VtSyncCreatorHeroModel = {
 status: VtSyncCreatorHeroStatus
 statusLabel: string
 statusCopy: string
 action: VtSyncCreatorHeroAction
 actionLabel: string
 channelName: string
 channelHandle: string
 avatarUrl?: string
 videos: number | undefined
 subscribers: number | undefined
 lifetimeViews: number | undefined
 coverage: VtSyncCreatorCoverageItem[]
 coverageSummary: string
 latestUpdatedAt?: string
 sourceLabel: string
 windowLabel: string
 recentVideos: VtSyncVideoItem[]
 errorDetail?: string
}

const categoryFreshness = (
 freshness: VtSyncDatasetFreshness,
 categoryId: string,
) => freshness[categoryId] || Object.values(freshness).find((entry) => entry.phase === categoryId)

const newestIso = (values: Array<string | undefined>): string | undefined => values
 .filter((value): value is string => Boolean(value && Number.isFinite(new Date(value).getTime())))
 .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]

const normalizeCoverageStatus = (
 status?: string,
 running = false,
): VtSyncCreatorCoverageItem["status"] => {
 if (running) return "running"
 if (status === "synced") return "synced"
 if (status === "partial") return "partial"
 if (status === "failed") return "failed"
 if (status === "stale" || status === "placeholder") return "stale"
 return "never"
}

const recentVideos = (videos: VtSyncVideoItem[]): VtSyncVideoItem[] => videos
 .map((video, index) => ({ video, index }))
 .sort((left, right) => {
  const leftTime = new Date(left.video.publishedAt || 0).getTime()
  const rightTime = new Date(right.video.publishedAt || 0).getTime()
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) return rightTime - leftTime
  return left.index - right.index
 })
 .slice(0, 6)
 .map(({ video }) => video)

const sourceLabel = (source: VtSyncSnapshot["source"]): string => {
 if (source === "manual") return "Imported VT-SYNC snapshot"
 if (source === "vt-sync") return "YouTube Data + Analytics APIs"
 if (source === "viewtubex-cache") return "Migrated ViewTube snapshot"
 return "No synced source yet"
}

const windowLabel = (window?: VtSyncSnapshot["selectedTimeWindow"]): string => {
 if (window === "7d") return "Last 7 days"
 if (window === "28d") return "Last 28 days"
 if (window === "90d") return "Last 90 days"
 if (window === "365d") return "Last 365 days"
 if (window === "lifetime") return "Lifetime"
 return "Dataset-specific windows"
}

export const buildVtSyncCreatorHeroModel = ({
 authReady,
 snapshot,
 visibleVideos,
 progress,
 syncError,
}: {
 authReady: boolean
 snapshot: VtSyncSnapshot
 visibleVideos: VtSyncVideoItem[]
 progress: VtSyncLocalSyncProgress | null
 syncError?: string
}): VtSyncCreatorHeroModel => {
 const freshness = snapshot.datasetFreshness || {}
 const runningIds = new Set(progress?.status === "running" ? progress.requestedCategoryIds : [])
 const coverage = VT_SYNC_CATEGORY_OPTIONS.map((category) => {
  const entry = categoryFreshness(freshness, category.id)
  return {
   id: category.id,
   label: category.label,
   status: normalizeCoverageStatus(entry?.status, runningIds.has(category.id)),
  }
 })
 const tallies = coverage.reduce<Record<VtSyncCreatorCoverageItem["status"], number>>((result, item) => {
  result[item.status] += 1
  return result
 }, { synced: 0, partial: 0, failed: 0, stale: 0, never: 0, running: 0 })
 const hasStoredData = Object.keys(freshness).length > 0 || visibleVideos.length > 0 || snapshot.source !== "empty"
 const status: VtSyncCreatorHeroStatus = progress?.status === "running"
  ? "syncing"
  : !authReady
   ? "disconnected"
   : progress?.status === "failed" || Boolean(syncError) || tallies.failed > 0
    ? "failed"
    : progress?.status === "partial" || tallies.partial > 0
     ? "partial"
     : tallies.stale > 0
      ? "stale"
      : !hasStoredData
       ? "first-sync"
       : "available"
 const statusContract: Record<VtSyncCreatorHeroStatus, {
  label: string
  copy: string
  action: VtSyncCreatorHeroAction
  actionLabel: string
 }> = {
  syncing: {
   label: "Updating now",
   copy: "Your saved channel intelligence remains available while new data arrives.",
   action: "progress",
   actionLabel: "View live progress",
  },
  disconnected: {
   label: "YouTube connection needed",
   copy: "Connect once to build your complete creator data workspace.",
   action: "connect",
   actionLabel: "Connect YouTube",
  },
  failed: {
   label: "Some data needs attention",
   copy: "Your existing data is safe. Refresh the recommended datasets to try again.",
   action: "recommended-sync",
   actionLabel: "Refresh channel data",
  },
  partial: {
   label: "Data available with gaps",
   copy: "ViewTube saved everything YouTube returned and can refresh the missing pieces.",
   action: "recommended-sync",
   actionLabel: "Refresh channel data",
  },
  stale: {
   label: "Update recommended",
   copy: "Your channel intelligence is available, with some datasets ready for an update.",
   action: "recommended-sync",
   actionLabel: "Refresh channel data",
  },
  "first-sync": {
   label: "First sync ready",
   copy: "Your channel is connected and ready to become a complete intelligence workspace.",
   action: "recommended-sync",
   actionLabel: "Build channel intelligence",
  },
  available: {
   label: "Channel data available",
   copy: "Explore your videos, audience, traffic, retention, revenue, geography, and more below.",
   action: "recommended-sync",
   actionLabel: "Update channel data",
  },
 }
 const contract = statusContract[status]
 const availableSegments = [
  `${tallies.synced} current`,
  tallies.running ? `${tallies.running} updating` : "",
  tallies.partial ? `${tallies.partial} partial` : "",
  tallies.failed ? `${tallies.failed} failed` : "",
  tallies.stale ? `${tallies.stale} need updates` : "",
  tallies.never ? `${tallies.never} not synced` : "",
 ].filter(Boolean)
 const freshnessTimes = Object.values(freshness).map((entry) => entry.updatedAt)
 const latestUpdatedAt = newestIso([...freshnessTimes, snapshot.source !== "empty" ? snapshot.capturedAt : undefined])

 return {
  status,
  statusLabel: contract.label,
  statusCopy: contract.copy,
  action: contract.action,
  actionLabel: contract.actionLabel,
  channelName: snapshot.channelName || (authReady ? "Your YouTube Channel" : "Connect Your Channel"),
  channelHandle: snapshot.channelCustomUrl || (authReady ? "Connected YouTube account" : "YouTube connection required"),
  avatarUrl: snapshot.avatarUrl || undefined,
  videos: typeof snapshot.channelVideoCount === "number"
   ? snapshot.channelVideoCount
   : hasStoredData
    ? snapshot.videos.length
    : undefined,
  subscribers: typeof snapshot.subscriberCount === "number" ? snapshot.subscriberCount : undefined,
  lifetimeViews: typeof snapshot.channelViewCount === "number"
   ? snapshot.channelViewCount
   : typeof snapshot.channelTotals?.lifetime?.views === "number"
    ? snapshot.channelTotals.lifetime.views
    : undefined,
  coverage,
  coverageSummary: availableSegments.join(" · "),
  latestUpdatedAt,
  sourceLabel: sourceLabel(snapshot.source),
  windowLabel: windowLabel(snapshot.selectedTimeWindow),
  recentVideos: recentVideos(visibleVideos),
  errorDetail: syncError || undefined,
 }
}

const compactNumber = (value: number | undefined): string => {
 if (value === undefined || !Number.isFinite(value)) return "—"
 return new Intl.NumberFormat(undefined, {
  notation: value >= 10_000 ? "compact" : "standard",
  maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
 }).format(value)
}

const relativeTime = (iso?: string): string => {
 if (!iso) return "Not synced yet"
 const time = new Date(iso).getTime()
 if (!Number.isFinite(time)) return "Not synced yet"
 const minutes = Math.max(0, Math.floor((Date.now() - time) / 60_000))
 if (minutes < 1) return "Just now"
 if (minutes < 60) return `${minutes}m ago`
 const hours = Math.floor(minutes / 60)
 if (hours < 24) return `${hours}h ago`
 const days = Math.floor(hours / 24)
 if (days < 30) return `${days}d ago`
 return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

const initials = (name: string): string => name
 .split(/\s+/)
 .filter(Boolean)
 .slice(0, 2)
 .map((word) => word[0])
 .join("")
 .toUpperCase() || "VT"

export const VtSyncCreatorHero: React.FC<{
 model: VtSyncCreatorHeroModel
 onConnect: () => void
 onRecommendedSync: () => void
 onChooseDatasets: () => void
 onViewProgress: () => void
}> = ({ model, onConnect, onRecommendedSync, onChooseDatasets, onViewProgress }) => {
 const runPrimaryAction = () => {
  if (model.action === "connect") onConnect()
  else if (model.action === "progress") onViewProgress()
  else onRecommendedSync()
 }

 return (
  <section className={`vt-sync-creator-hero is-${model.status}`} aria-labelledby="vt-sync-creator-title">
   <header className="vt-sync-creator-masthead">
    <span className="vt-sync-creator-icon" aria-hidden="true"><Sparkles /></span>
    <div>
     <p>ViewTube Channel Intelligence</p>
     <h1 id="vt-sync-creator-title">Your channel. Fully visible.</h1>
    </div>
    <strong className="vt-sync-creator-status-stamp">
     {model.status === "syncing" ? <LoaderCircle className="is-spinning" /> : model.status === "failed" ? <AlertTriangle /> : <CheckCircle2 />}
     {model.statusLabel}
    </strong>
   </header>

   <div className="vt-sync-creator-stage">
    <section className="vt-sync-creator-identity" aria-label="Connected channel">
     <div className="vt-sync-creator-avatar">
      {model.avatarUrl ? <img src={model.avatarUrl} alt="" /> : <span>{initials(model.channelName)}</span>}
     </div>
     <div className="vt-sync-creator-identity-copy">
      <span className="vt-sync-creator-kicker">Your creator universe</span>
      <h2>{model.channelName}</h2>
      <p>{model.channelHandle}</p>
     </div>
    </section>

    <dl className="vt-sync-creator-scoreboard" aria-label="Channel totals">
     {[
      ["Videos", model.videos],
      ["Subscribers", model.subscribers],
      ["Lifetime views", model.lifetimeViews],
     ].map(([label, value]) => (
      <div key={String(label)}>
       <dt>{label}</dt>
       <dd>{compactNumber(value as number | undefined)}</dd>
       <small>{value === undefined ? "Not yet synced" : "Connected channel total"}</small>
      </div>
     ))}
    </dl>

    <aside className="vt-sync-creator-command" aria-live="polite">
     <span className="vt-sync-creator-command-kicker">Intelligence status</span>
     <h2>{model.statusLabel}</h2>
     <p>{model.statusCopy}</p>
     <dl>
      <div><dt>Updated</dt><dd><time dateTime={model.latestUpdatedAt}>{relativeTime(model.latestUpdatedAt)}</time></dd></div>
      <div><dt>Coverage</dt><dd>{model.windowLabel}</dd></div>
     </dl>
     <button type="button" className="vt-sync-creator-primary" data-primary-action={model.action} onClick={runPrimaryAction}>
      {model.action === "connect" ? <Youtube /> : model.action === "progress" ? <ArrowDown /> : <RefreshCw />}
      {model.actionLabel}
     </button>
     <button type="button" className="vt-sync-creator-secondary" onClick={onChooseDatasets}>
      Choose datasets <ArrowDown />
     </button>
     {model.errorDetail ? (
      <details className="vt-sync-creator-error">
       <summary>Why some data could not update</summary>
       <p>{model.errorDetail}</p>
      </details>
     ) : null}
    </aside>
   </div>

   <section className="vt-sync-creator-coverage" aria-label="Dataset availability">
    <div className="vt-sync-creator-coverage-copy">
     <strong>Your data picture</strong>
     <span>{model.coverageSummary}</span>
    </div>
    <div className="vt-sync-creator-coverage-grid">
     {model.coverage.map((item) => (
      <span key={item.id} className={`is-${item.status}`} title={`${item.label}: ${item.status}`} aria-label={`${item.label}: ${item.status}`} />
     ))}
    </div>
   </section>

   <section className="vt-sync-creator-filmstrip" aria-labelledby="vt-sync-library-title">
    <header>
     <Clapperboard aria-hidden="true" />
     <div><strong id="vt-sync-library-title">Your channel library</strong><small>Most recently published visible videos</small></div>
    </header>
    <div className="vt-sync-creator-reels">
     {model.recentVideos.length ? model.recentVideos.map((video) => (
      <a key={video.id} href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`} target="_blank" rel="noreferrer">
       <span className="vt-sync-creator-reel-image">
        {video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" /> : <span aria-hidden="true"><Clapperboard /></span>}
       </span>
       <strong>{video.title || "Untitled video"}</strong>
       <small>{video.id}</small>
      </a>
     )) : (
      <div className="vt-sync-creator-empty-reel">
       <Clapperboard aria-hidden="true" />
       <strong>Your videos appear here after the first sync.</strong>
      </div>
     )}
    </div>
   </section>

   <footer className="vt-sync-creator-provenance">
    <span><b>Source</b>{model.sourceLabel}</span>
    <span><b>Updated</b>{relativeTime(model.latestUpdatedAt)}</span>
    <span><b>Coverage</b>{model.windowLabel}</span>
    <span><b>Status</b>{model.statusLabel}</span>
   </footer>
  </section>
 )
}
