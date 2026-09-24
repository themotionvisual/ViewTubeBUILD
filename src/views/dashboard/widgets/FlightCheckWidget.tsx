import React, { useEffect, useMemo, useState } from "react"
import { Check, Rocket, RotateCcw, ShieldCheck } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetProgressBar,
  WidgetScrollArea,
  WidgetSizedButton,
} from "../WidgetPrimitives"
import { listVideoPackages } from "../../../services/video-package/VideoPackageRepository"
import { projectPublishingPackage } from "../../../services/asset-engine/PublishingPackageProjection"
import { listPublishTransactions } from "../../../services/asset-engine/PublishTransaction"
import { buildPublishingCommandModel } from "./publishingCommandModel"
import "./FlightCheckWidget.css"

const STORAGE_KEY = "vt_flight_check"

const DEFAULT_ITEMS = [
  { text: "Rendered in 4K/1080p", done: false },
  { text: "Thumbnail A/B Uploaded", done: false },
  { text: "Tags & Description SEO", done: false },
  { text: "Cards & End Screens", done: false },
  { text: "Community Post Drafted", done: false },
  { text: "Monetization Checks Pass", done: false },
]

const LaunchGantry: React.FC<{
  stages: ReturnType<typeof buildPublishingCommandModel>["stages"]
}> = ({ stages }) => (
  <div className="vt-launch-gantry" aria-label="Publishing launch stages">
    <div className="vt-launch-gantry__rail" aria-hidden="true" />
    {stages.map((stage, index) => (
      <React.Fragment key={stage.id}>
        <div className="vt-launch-gantry__station" data-status={stage.status}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <b>{stage.id}</b>
          <small>{stage.status.toUpperCase()}</small>
        </div>
        {index < stages.length - 1 ? <div className="vt-launch-gantry__connector" aria-hidden="true" /> : null}
      </React.Fragment>
    ))}
  </div>
)

export const FlightCheckWidget = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
  onNavigate,
}: any) => {
  const common = {
    widget,
    instance,
    editMode,
    canEdit: true,
    onToggleCollapse,
    onCycleSize,
    onRemove,
    onDecSize,
    onCycleHeight,
    onDecHeight,
  }

  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || DEFAULT_ITEMS
    } catch {
      return DEFAULT_ITEMS
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const canonical = useMemo(() => {
    const videoPackage = listVideoPackages()[0] || null
    if (!videoPackage) return { videoPackage: null, projection: null, transaction: null }
    try {
      const projection = projectPublishingPackage(videoPackage)
      return {
        videoPackage,
        projection,
        transaction: listPublishTransactions(projection.contentBuildId)[0] || null,
      }
    } catch {
      return { videoPackage, projection: null, transaction: null }
    }
  }, [instance?.collapsed])

  const model = buildPublishingCommandModel({
    projection: canonical.projection,
    transaction: canonical.transaction,
  })

  const toggle = (idx: number) => {
    setItems((prev: any[]) => prev.map((item, index) => index === idx ? { ...item, done: !item.done } : item))
  }

  const reset = () => setItems(DEFAULT_ITEMS)
  const doneCount = items.filter((item: any) => item.done).length
  const fallbackPct = Math.round((doneCount / items.length) * 100)
  const fallbackReady = fallbackPct === 100
  const canonicalPct = model.stages.length
    ? Math.round((model.stages.filter((stage) => stage.status === "complete").length / model.stages.length) * 100)
    : 0

  return (
    <WidgetShell {...common} icon={<Check size={22} />}>
      <div className="vt-publishing-command">
        {model.source === "canonical" ? (
          <>
            <div className="vt-publishing-command__header">
              <div>
                <span>PUBLISHING COMMAND</span>
                <strong>{canonical.videoPackage?.identity.workingTitle || "ACTIVE VIDEO PACKAGE"}</strong>
              </div>
              <WidgetBadge height={24} status={model.ready ? "positive" : "warning"}>
                {model.transactionStatus?.toUpperCase() || (model.ready ? "READY" : "PREFLIGHT")}
              </WidgetBadge>
            </div>

            <LaunchGantry stages={model.stages} />

            <WidgetProgressBar
              value={canonicalPct}
              max={100}
              label="LAUNCH READINESS"
              displayValue={canonicalPct + "%"}
              height={24}
              tone={model.ready ? "primary" : "secondary"}
            />

            <section className="vt-publishing-command__status-grid">
              <div>
                <span>PACKAGE</span>
                <strong>{model.stages.find((stage) => stage.id === "PACKAGE")?.status.toUpperCase()}</strong>
              </div>
              <div>
                <span>SCHEDULE</span>
                <strong>{model.scheduled ? "SET" : "OPEN"}</strong>
              </div>
              <div>
                <span>BLOCKERS</span>
                <strong>{model.blockers.length}</strong>
              </div>
            </section>

            <WidgetScrollArea ariaLabel="Publishing blockers" className="vt-publishing-command__blockers">
              {model.blockers.length ? model.blockers.map((blocker) => (
                <div key={blocker} className="vt-publishing-command__blocker">
                  <span aria-hidden="true">×</span>
                  <strong>{blocker.replaceAll("-", " ").toUpperCase()}</strong>
                </div>
              )) : (
                <div className="vt-publishing-command__clear">
                  <ShieldCheck aria-hidden="true" />
                  <strong>NO CANONICAL BLOCKERS</strong>
                  <small>PACKAGE IS CLEAR TO CONTINUE.</small>
                </div>
              )}
            </WidgetScrollArea>

            <div className="vt-publishing-command__actions">
              <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/video-publisher")}>
                <Rocket aria-hidden="true" />
                {model.published ? "OPEN PUBLISHED VIDEO" : model.ready ? "OPEN PUBLISHER" : "FIX PACKAGE"}
              </WidgetSizedButton>
              <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/studio")}>
                OPEN STUDIO
              </WidgetSizedButton>
            </div>
          </>
        ) : (
          <>
            <div className="vt-publishing-command__header">
              <div>
                <span>MANUAL FLIGHT CHECK</span>
                <strong>FALLBACK PREFLIGHT</strong>
              </div>
              <WidgetBadge height={24} status={fallbackReady ? "positive" : "warning"}>
                {fallbackPct}%
              </WidgetBadge>
            </div>

            <WidgetProgressBar
              value={fallbackPct}
              max={100}
              label="MANUAL READINESS"
              displayValue={fallbackPct + "%"}
              height={24}
              tone={fallbackReady ? "primary" : "secondary"}
            />

            <WidgetScrollArea ariaLabel="Flight check items" className="vt-publishing-command__manual-list">
              {items.map((item: any, idx: number) => (
                <button
                  key={item.text}
                  type="button"
                  className="vt-publishing-command__manual-item"
                  data-done={item.done ? "true" : "false"}
                  onClick={() => toggle(idx)}
                >
                  <span aria-hidden="true">{item.done ? "✓" : "×"}</span>
                  <strong>{item.text}</strong>
                </button>
              ))}
            </WidgetScrollArea>

            <div className="vt-publishing-command__actions">
              <WidgetSizedButton
                height={32}
                tone="primary"
                textFit="adaptive"
                disabled={!fallbackReady}
                onClick={() => onNavigate?.("/video-publisher")}
              >
                <Rocket aria-hidden="true" /> PUBLISH
              </WidgetSizedButton>
              <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={reset}>
                <RotateCcw aria-hidden="true" /> RESET
              </WidgetSizedButton>
            </div>
          </>
        )}
      </div>
    </WidgetShell>
  )
}
