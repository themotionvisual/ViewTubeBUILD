import React, { useEffect, useMemo, useState } from "react"
import { Check, Rocket, RotateCcw } from "lucide-react"
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
    if (!videoPackage) return { packageName: null, projection: null, transaction: null }

    try {
      const projection = projectPublishingPackage(videoPackage)
      const transaction = listPublishTransactions(projection.contentBuildId)[0] || null
      return {
        packageName: videoPackage.identity.workingTitle || "VIDEO PACKAGE",
        projection,
        transaction,
      }
    } catch {
      return {
        packageName: videoPackage.identity.workingTitle || "VIDEO PACKAGE",
        projection: null,
        transaction: null,
      }
    }
  }, [instance?.collapsed])

  const command = buildPublishingCommandModel({
    projection: canonical.projection,
    transaction: canonical.transaction,
  })

  const toggle = (idx: number) => {
    setItems((prev: any[]) => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item))
  }

  const reset = () => setItems(DEFAULT_ITEMS)
  const doneCount = items.filter((item: any) => item.done).length
  const fallbackPct = Math.round((doneCount / items.length) * 100)
  const canonicalPct = command.stages.length
    ? Math.round((command.stages.filter((stage) => stage.status === "complete").length / command.stages.length) * 100)
    : 0
  const pct = command.source === "canonical" ? canonicalPct : fallbackPct

  const canonicalView = command.source === "canonical" ? (
    <>
      <div className="vt-publishing-command__source">
        <span>CANONICAL PUBLISHING PACKAGE</span>
        <WidgetBadge status={command.ready ? "positive" : "warning"} height={18}>
          {command.transactionStatus?.toUpperCase() || (command.ready ? "READY" : "PREFLIGHT")}
        </WidgetBadge>
      </div>

      <div className="vt-publishing-command__package">
        <span>ACTIVE PACKAGE</span>
        <strong>{canonical.packageName || "VIDEO PACKAGE"}</strong>
        <small>{command.blockers.length ? `${command.blockers.length} REQUIRED ITEM${command.blockers.length === 1 ? "" : "S"} MISSING` : "NO PACKAGE BLOCKERS"}</small>
      </div>

      <WidgetProgressBar
        value={pct}
        max={100}
        label="PUBLISHING READINESS"
        displayValue={pct + "%"}
        height={24}
        tone={command.ready ? "primary" : "secondary"}
      />

      <div className="vt-publishing-command__stages" aria-label="Publishing command stages">
        {command.stages.map((stage) => (
          <div key={stage.id} className="vt-publishing-command__stage" data-status={stage.status}>
            <span>{stage.id}</span>
            <strong>{stage.status.toUpperCase()}</strong>
          </div>
        ))}
      </div>

      {command.blockers.length ? (
        <WidgetScrollArea ariaLabel="Publishing blockers" className="vt-publishing-command__blockers">
          {command.blockers.map((blocker) => (
            <div key={blocker} className="vt-publishing-command__blocker">
              <span aria-hidden="true">×</span>
              <strong>{blocker.replaceAll("-", " ").toUpperCase()}</strong>
            </div>
          ))}
        </WidgetScrollArea>
      ) : null}

      <div className="vt-publishing-command__actions">
        <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/video-publisher")}>
          <Rocket aria-hidden="true" />
          {command.published ? "OPEN PUBLISHED VIDEO" : command.ready ? "OPEN PUBLISHER" : "FIX PACKAGE"}
        </WidgetSizedButton>
        <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/tools/publishing-schedule-architect")}>
          SCHEDULE
        </WidgetSizedButton>
      </div>
    </>
  ) : null

  const fallbackView = command.source === "fallback" ? (
    <>
      <div className="vt-publishing-command__source">
        <span>MANUAL FLIGHT CHECK FALLBACK</span>
        <WidgetBadge status={fallbackPct === 100 ? "positive" : "warning"} height={18}>{fallbackPct}%</WidgetBadge>
      </div>
      <WidgetProgressBar
        value={fallbackPct}
        max={100}
        label="MANUAL CHECKLIST"
        displayValue={fallbackPct + "%"}
        height={24}
        tone={fallbackPct === 100 ? "primary" : "secondary"}
      />
      <WidgetScrollArea ariaLabel="Manual flight check items" className="vt-publishing-command__manual-list">
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
          disabled={fallbackPct !== 100}
          onClick={() => onNavigate?.("/video-publisher")}
        >
          <Rocket aria-hidden="true" />
          PUBLISH
        </WidgetSizedButton>
        <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          RESET
        </WidgetSizedButton>
      </div>
    </>
  ) : null

  return (
    <WidgetShell {...common} icon={<Check size={22} />}>
      <div className="vt-publishing-command">
        {canonicalView || fallbackView}
      </div>
    </WidgetShell>
  )
}
