import React, { useMemo, useState } from "react"
import { CalendarDays, Film, PackageOpen, Play, Scissors, Send, Sparkles } from "lucide-react"
import { listVideoPackages } from "../../../services/video-package/VideoPackageRepository"
import type { ViewTubeVideoPackage } from "../../../services/video-package/contracts"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetIconButton,
  WidgetProgressBar,
  WidgetScrollArea,
  WidgetSizedButton,
  WidgetStepper,
} from "../WidgetPrimitives"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"
import { buildShortsMultiplierPlan } from "./shortsMultiplierModel"
import "./ShortsMultiplierWidget.css"

type ShortsMultiplierSource = {
  id: string
  title: string
  thumbnail: string | null
  sourceKind: "package" | "published"
  videoPackage: ViewTubeVideoPackage | null
  videoId: string | null
}

const isPublishedShort = (row: any) => {
  const format = String(row?.format || row?.contentType || "").toLowerCase()
  const duration = Number(row?.durationSeconds || row?.durationSec || 0)
  return format === "short" || format === "shorts" || (duration > 0 && duration <= 65)
}

const localDateTimeValue = (iso: string) => {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export const ShortsMultiplierWidget: React.FC<
  CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }
> = ({ data, onNavigate, ...common }) => {
  const packages = useMemo(() => listVideoPackages().filter((item) => item.identity.format === "short"), [data.brain])
  const sources = useMemo<ShortsMultiplierSource[]>(() => {
    const packageSources = packages.map((videoPackage) => ({
      id: `package:${videoPackage.id}`,
      title: videoPackage.identity.workingTitle,
      thumbnail: null,
      sourceKind: "package" as const,
      videoPackage,
      videoId: videoPackage.videoId || videoPackage.publishing.publishedVideoId || null,
    }))
    const packagedVideoIds = new Set(packageSources.map((item) => item.videoId).filter(Boolean))
    const publishedSources = (data.canonicalRows || [])
      .filter(isPublishedShort)
      .filter((row: any) => !packagedVideoIds.has(String(row.videoId || "")))
      .slice(0, 30)
      .map((row: any) => ({
        id: `published:${String(row.videoId || row.id || row.title)}`,
        title: String(row.title || "Published Short"),
        thumbnail: row.thumbnailUrl || row.thumbnail || null,
        sourceKind: "published" as const,
        videoPackage: null,
        videoId: String(row.videoId || row.id || "") || null,
      }))
    return [...packageSources, ...publishedSources]
  }, [data.canonicalRows, packages])

  const [selectedSourceId, setSelectedSourceId] = useState(() => sources[0]?.id || "")
  const [variantCount, setVariantCount] = useState(5)
  const [maxTrimFrames, setMaxTrimFrames] = useState(10)
  const [intervalDays, setIntervalDays] = useState(7)
  const [scheduleStart, setScheduleStart] = useState(() => new Date(Date.now() + 86_400_000).toISOString())
  const [prepared, setPrepared] = useState(false)
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null)

  const selectedSource = sources.find((source) => source.id === selectedSourceId) || sources[0] || null
  const plan = useMemo(
    () => selectedSource
      ? buildShortsMultiplierPlan({
          sourceId: selectedSource.id,
          sourceTitle: selectedSource.title,
          variantCount,
          maxTrimFrames,
          intervalDays,
          scheduleStart,
        })
      : null,
    [intervalDays, maxTrimFrames, scheduleStart, selectedSource, variantCount],
  )

  const packageHasEditorSource = Boolean(selectedSource?.videoPackage?.production.timelineId)

  const openEditor = () => {
    if (!plan || !selectedSource) return
    try {
      sessionStorage.setItem("vt_shorts_multiplier_handoff_v1", JSON.stringify({
        schemaVersion: 1,
        sourceId: selectedSource.id,
        contentBuildId: selectedSource.videoPackage?.contentBuildId || null,
        videoPackageId: selectedSource.videoPackage?.id || null,
        plan,
      }))
    } catch {}
    const buildId = selectedSource.videoPackage?.contentBuildId
    onNavigate?.(`/editor?shortsMultiplier=1${buildId ? `&contentBuildId=${encodeURIComponent(buildId)}` : ""}`)
  }

  const headerContent = (
    <div className="shorts-multiplier-header-status">
      <WidgetBadge status={sources.length ? "positive" : "warning"} height={18}>
        {sources.length ? `${sources.length} SOURCES` : "NO SHORTS"}
      </WidgetBadge>
    </div>
  )

  return (
    <WidgetShell {...common} icon={<Sparkles size={22} />} headerContent={headerContent}>
      <WidgetScrollArea ariaLabel="Shorts Multiplier workspace" contentClassName="shorts-multiplier">
        {!selectedSource ? (
          <div className="shorts-multiplier-empty">
            <Scissors size={30} />
            <strong>NO SHORT SOURCE FOUND</strong>
            <span>Prepare a Short package or sync published Shorts to begin.</span>
          </div>
        ) : (
          <>
            <section className="shorts-multiplier-setup">
              <div className="shorts-multiplier-source">
                <div className="shorts-multiplier-source-thumb">
                  {selectedSource.thumbnail ? <img src={selectedSource.thumbnail} alt="" /> : <Play size={26} />}
                </div>
                <label>
                  <span>SOURCE SHORT</span>
                  <select value={selectedSource.id} onChange={(event) => { setSelectedSourceId(event.target.value); setPrepared(false) }}>
                    {sources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.title} · {source.sourceKind === "package" ? "PACKAGE" : "PUBLISHED"}
                      </option>
                    ))}
                  </select>
                </label>
                <WidgetBadge status={selectedSource.sourceKind === "package" ? "positive" : "neutral"} height={24}>
                  {selectedSource.sourceKind === "package" ? "PACKAGE SOURCE" : "PUBLISHED SOURCE"}
                </WidgetBadge>
              </div>

              <div className="shorts-multiplier-controls">
                <div className="shorts-multiplier-control">
                  <span>VARIANTS</span>
                  <WidgetStepper height={32} tone="default" label="Variant count" value={variantCount} onChange={setVariantCount} min={2} max={10} />
                </div>
                <div className="shorts-multiplier-control">
                  <span>MAX TRIM</span>
                  <WidgetStepper height={32} tone="default" label="Maximum trim frames" value={maxTrimFrames} onChange={setMaxTrimFrames} min={1} max={10} />
                </div>
                <div className="shorts-multiplier-control">
                  <span>INTERVAL DAYS</span>
                  <WidgetStepper height={32} tone="default" label="Schedule interval days" value={intervalDays} onChange={setIntervalDays} min={2} max={60} />
                </div>
                <label className="shorts-multiplier-date-control">
                  <span>FIRST PUBLISH</span>
                  <input
                    type="datetime-local"
                    value={localDateTimeValue(scheduleStart)}
                    onChange={(event) => {
                      const next = new Date(event.target.value)
                      if (!Number.isNaN(next.getTime())) setScheduleStart(next.toISOString())
                    }}
                  />
                </label>
              </div>

              <div className="shorts-multiplier-readiness">
                <div>
                  <strong>{packageHasEditorSource ? "EDITOR SOURCE READY" : "SOURCE MEDIA HANDOFF REQUIRED"}</strong>
                  <span>{packageHasEditorSource ? "The package has a timeline identity for the editor/render path." : "The multiplier plan is ready, but Remotion rendering requires source media/timeline in VT-E1."}</span>
                </div>
                <WidgetProgressBar value={packageHasEditorSource ? 2 : 1} max={2} label="RENDER READINESS" displayValue={packageHasEditorSource ? "READY" : "1 / 2"} height={24} tone={packageHasEditorSource ? "primary" : "secondary"} />
              </div>

              <div className="shorts-multiplier-actions">
                <WidgetSizedButton height={38} tone="primary" onClick={() => setPrepared(true)}>
                  <Scissors size={18} /> BUILD MULTIPLIER SET
                </WidgetSizedButton>
                <WidgetSizedButton height={38} tone="secondary" onClick={openEditor}>
                  <Film size={18} /> OPEN IN EDITOR
                </WidgetSizedButton>
                <WidgetSizedButton height={38} tone="default" onClick={() => onNavigate?.("/video-publisher")}>
                  <Send size={18} /> OPEN PUBLISHER
                </WidgetSizedButton>
              </div>
            </section>

            {prepared && plan ? (
              <section className="shorts-multiplier-results">
                <header>
                  <div>
                    <strong>MULTIPLIER OUTPUTS</strong>
                    <span>{plan.variants.length} repost-ready render specifications · {plan.intervalDays}-day cadence</span>
                  </div>
                  <WidgetBadge status="positive" height={24}>{plan.variants.length} PLANNED</WidgetBadge>
                </header>

                <div className="shorts-multiplier-output-list">
                  {plan.variants.map((variant) => {
                    const open = expandedVariantId === variant.id
                    return (
                      <article key={variant.id} className="shorts-multiplier-output">
                        <div className="shorts-multiplier-output-thumb">
                          {selectedSource.thumbnail ? <img src={selectedSource.thumbnail} alt="" /> : <PackageOpen size={26} />}
                          <span>#{variant.ordinal}</span>
                        </div>
                        <div className="shorts-multiplier-output-main">
                          <div className="shorts-multiplier-output-title">
                            <strong>{selectedSource.title} · VARIANT {variant.ordinal}</strong>
                            <span>{variant.filename}</span>
                          </div>
                          <div className="shorts-multiplier-output-meta">
                            <div><span>DESCRIPTION</span><strong>REUSE SOURCE PACKAGE</strong></div>
                            <div><span>TAGS</span><strong>REUSE SOURCE PACKAGE</strong></div>
                          </div>
                          <div className="shorts-multiplier-output-publish">
                            <div><CalendarDays size={15}/><span>{new Date(variant.scheduledAt).toLocaleString()}</span></div>
                            <div><Scissors size={15}/><span>START −{variant.trimStartFrames}F · END −{variant.trimEndFrames}F</span></div>
                            <WidgetIconButton height={32} tone="primary" label={open ? "Hide publishing package" : "Expand publishing package"} icon={open ? <span>−</span> : <span>+</span>} onClick={() => setExpandedVariantId(open ? null : variant.id)} />
                          </div>
                          {open ? (
                            <div className="shorts-multiplier-package-detail">
                              <span>TITLE · SOURCE TITLE + VARIANT ID</span>
                              <span>THUMBNAIL · SOURCE PACKAGE</span>
                              <span>DESCRIPTION · SOURCE PACKAGE</span>
                              <span>TAGS · SOURCE PACKAGE</span>
                              <span>PUBLISH · {new Date(variant.scheduledAt).toLocaleString()}</span>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </>
        )}
      </WidgetScrollArea>
    </WidgetShell>
  )
}
