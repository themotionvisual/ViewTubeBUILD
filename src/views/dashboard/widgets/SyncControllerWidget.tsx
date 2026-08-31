import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
 WidgetFooter,
 WidgetScrollArea,
 WidgetSelect,
} from "../WidgetPrimitives"
import type { CommonWidgetProps } from "../types"
import { RetroLedRow, RetroLcd } from "../../../features/vt-sync-local/shell/VtSyncRetroChrome"
import { useSyncControllerWidget } from "./useSyncControllerWidget"
import {
 VT_SYNC_CONSOLE_STATUS_PRESENTATION,
 type VtSyncConsoleStatus,
} from "../../../features/vt-sync-local/shell/vtSyncProgressModel"
import { getVtSyncCompactMenuLabel } from "../../../features/vt-sync-local/shell/toolbox-table/vtSyncToolboxTableModel"
import "../../../styles/spectrumBadge.css"

// ── Formatters (mirrored from VtSyncControllerPanel, compact versions) ──

const formatRelativeTime = (iso?: string): string => {
 if (!iso) return "Never"
 const ms = Date.now() - new Date(iso).getTime()
 if (!Number.isFinite(ms)) return "Never"
 if (ms < 0 || ms < 60_000) return "Just now"
 const minutes = Math.floor(ms / 60_000)
 if (minutes < 60) return `${minutes}m ago`
 const hours = Math.floor(minutes / 60)
 if (hours < 24) return `${hours}h ago`
 const days = Math.floor(hours / 24)
 if (days < 30) return `${days}d ago`
 return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(iso))
}

const formatFreshnessParts = (iso?: string): { value: string; labels: string[] } => {
 if (!iso) return { value: "—", labels: ["never"] }
 const ms = Date.now() - new Date(iso).getTime()
 if (!Number.isFinite(ms)) return { value: "—", labels: ["never"] }
 if (ms < 0 || ms < 60_000) return { value: "0", labels: ["mins", "ago"] }
 const minutes = Math.floor(ms / 60_000)
 if (minutes < 60) return { value: minutes.toLocaleString(), labels: [minutes === 1 ? "min" : "mins", "ago"] }
 const hours = Math.floor(minutes / 60)
 if (hours < 24) return { value: hours.toLocaleString(), labels: [hours === 1 ? "hour" : "hours", "ago"] }
 const days = Math.floor(hours / 24)
 return { value: days.toLocaleString(), labels: [days === 1 ? "day" : "days", "ago"] }
}

// ── Mini Slide Switch ──

const MiniSlideSwitch: React.FC<{
 idleLabel: string
 status: VtSyncConsoleStatus
 onClick: () => void
 disabled?: boolean
 showLabel?: boolean
}> = ({ idleLabel, status, onClick, disabled, showLabel = false }) => {
 const presentation = VT_SYNC_CONSOLE_STATUS_PRESENTATION[status]
 const activated = status === "live"
 return (
  <div
   className={`sync-ctrl-mini-switch is-status-${status} ${activated ? "is-active" : ""}`}
   style={{ "--vt-sync-status-tone": presentation.tone } as React.CSSProperties}
  >
   <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="sync-ctrl-switch-hitbox"
    aria-pressed={status === "live"}
    title={`${idleLabel}: ${presentation.label}`}
    aria-label={`${idleLabel}: ${presentation.label}`}
   >
    <span className="sync-ctrl-sw-housing">
     <span className="sync-ctrl-sw-track">
      <span className="sync-ctrl-sw-nub" />
     </span>
     <span className="sync-ctrl-sw-led" aria-hidden="true" />
    </span>
   </button>
   {showLabel ? <span className="sync-ctrl-switch-label">{presentation.label}</span> : null}
  </div>
 )
}

// ── Main Widget ──

export const SyncControllerWidget: React.FC<any> = (props) => {
 const common = props.common || props
 const navigate = useNavigate()
 const ctrl = useSyncControllerWidget()
 const progressUnitById = useMemo(
  () => new Map(ctrl.consoleModel.units.map((unit) => [unit.id, unit])),
  [ctrl.consoleModel.units],
 )
 const progressGroupById = useMemo(
  () => new Map(ctrl.consoleModel.groups.map((group) => [group.group, group])),
  [ctrl.consoleModel.groups],
 )

 return (
  <WidgetShell
   {...common}
   icon={<RefreshCw size={22} />}
   headerContent={<RetroLedRow leds={ctrl.syncLeds} />}
  >
   <WidgetScrollArea>
    <div className="sync-ctrl-body" data-widget-id="sync-controller">

     {/* ── Queue Strip ── */}
     <div className="sync-ctrl-queue-strip">
      <div className="sync-ctrl-queue-cell sync-ctrl-queue-active">
       <strong>Now</strong>
       <span>{ctrl.consoleModel.queue.currentLabel}</span>
      </div>
      <div className="sync-ctrl-queue-cell sync-ctrl-queue-next">
       <strong>Next</strong>
       <span>{ctrl.consoleModel.queue.nextLabel}</span>
      </div>
     </div>

     {/* ── Status Grid ── */}
     <div className="sync-ctrl-status-grid" role="status" aria-label={`${ctrl.consoleModel.units.length} sync units`}>
      {ctrl.VT_SYNC_CONSOLE_STATUS_ORDER.map((status) => (
       <span
        key={status}
        className={`sync-ctrl-status-cell is-status-${status} ${ctrl.consoleModel.tally[status] === 0 ? "is-empty" : ""}`}
        style={{ "--vt-sync-status-tone": ctrl.VT_SYNC_CONSOLE_STATUS_PRESENTATION[status].tone } as React.CSSProperties}
       >
        <i aria-hidden="true" />
        <span>{ctrl.VT_SYNC_CONSOLE_STATUS_PRESENTATION[status].label}</span>
        <b>{ctrl.consoleModel.tally[status]}</b>
       </span>
      ))}
     </div>

     {/* ── Command Rail ── */}
     <div className="sync-ctrl-command-rail">
      <div className="sync-ctrl-global-actions">
       <button
        type="button"
        className="vt-button sync-ctrl-action-btn"
        onClick={() => void ctrl.startAll()}
        disabled={ctrl.isSyncing}
       >
        SYNC ALL
       </button>
       <button
        type="button"
        className="vt-button sync-ctrl-action-btn"
        onClick={() => void ctrl.startSelected()}
        disabled={ctrl.isSyncing || ctrl.selectedUnitCount === 0}
       >
        SYNC SELECTED ({ctrl.selectedUnitCount})
       </button>
      </div>
      {ctrl.contentOwners.length > 1 ? (
       <div className="sync-ctrl-owner-select">
        <WidgetSelect
         label="Content Owner"
         value={ctrl.activeContentOwnerId || ""}
         onChange={(value) => { if (value) void ctrl.onSelectContentOwner(value) }}
         options={[
          { value: "", label: "Select owner" },
          ...ctrl.contentOwners.map((owner) => ({ value: owner.id, label: owner.displayName })),
         ]}
        />
       </div>
      ) : null}
     </div>

     {/* ── Error Banner ── */}
     {ctrl.syncError ? (
      <div className="sync-ctrl-error-banner" role="alert">
       <strong>Error:</strong> {ctrl.syncError}
      </div>
     ) : null}

     {/* ── Group Accordion ── */}
     <div className="sync-ctrl-group-accordion">
      {ctrl.unitGroups.map(({ group, units }) => {
       const expanded = ctrl.openGroups.has(group)
       const contentId = `sync-ctrl-group-${group}`
       const groupCategoryIds = [...new Set(units.flatMap((unit) => unit.categoryIds))]
       const progressGroup = progressGroupById.get(group)

       return (
        <section key={group} className="sync-ctrl-group-section">
         {/* Group Header */}
         <div
          className="sync-ctrl-group-row"
          style={{ backgroundColor: ctrl.GROUP_COLORS[group] }}
         >
          <button
           type="button"
           aria-expanded={expanded}
           aria-controls={contentId}
           onClick={() => ctrl.toggleGroup(group)}
           className="sync-ctrl-group-toggle"
          >
           <span className="sync-ctrl-group-chevron" aria-hidden="true">
            {expanded ? <ChevronDown strokeWidth={3} size={14} /> : <ChevronRight strokeWidth={3} size={14} />}
           </span>
           <span className="sync-ctrl-group-title">{progressGroup?.label || group}</span>
          </button>
          <div className="sync-ctrl-group-meta">
           {progressGroup?.issueCount ? (
            <span
             className="vt-spectrum-badge sync-ctrl-issue-badge"
             style={{ "--vt-spectrum-badge-stroke": VT_SYNC_CONSOLE_STATUS_PRESENTATION.failed.tone } as React.CSSProperties}
            >
             {progressGroup.issueCount}
            </span>
           ) : null}
           <span
            className="vt-spectrum-badge sync-ctrl-status-badge"
            style={{ "--vt-spectrum-badge-stroke": VT_SYNC_CONSOLE_STATUS_PRESENTATION[progressGroup?.effectiveStatus || "never"].tone } as React.CSSProperties}
           >
            {VT_SYNC_CONSOLE_STATUS_PRESENTATION[progressGroup?.effectiveStatus || "never"].label}
           </span>
           <MiniSlideSwitch
            idleLabel="SYNC ALL"
            status={progressGroup?.effectiveStatus || "never"}
            onClick={() => void ctrl.startCategories(groupCategoryIds)}
           />
          </div>
         </div>

         {/* Unit Rows */}
         <div id={contentId} hidden={!expanded} className="sync-ctrl-unit-list">
          {units.map((unit) => {
           const checked = unit.categoryIds.every((id) => ctrl.selectedSet.has(id))
           const progressUnit = progressUnitById.get(unit.id)
           const effectiveStatus = progressUnit?.effectiveStatus || "never"
           const resultCount = progressUnit?.displayRows || 0
           const resultNoun = resultCount === 1 ? unit.resultNoun.singular : unit.resultNoun.plural
           const freshness = formatFreshnessParts(progressUnit?.completedAt || progressUnit?.storedUpdatedAt)
           const unitTitle = getVtSyncCompactMenuLabel(unit.tableId, unit.label)

           return (
            <div key={unit.id} className="sync-ctrl-unit-row">
             <label className={`sync-ctrl-unit-check ${checked ? "is-selected" : ""}`}>
              <input
               type="checkbox"
               checked={checked}
               onChange={() => ctrl.toggleMany(unit.categoryIds)}
               aria-label={`${checked ? "Remove" : "Add"} ${unit.label}`}
              />
             </label>
             <span className="sync-ctrl-unit-name" title={unit.description}>
              {unitTitle}
             </span>
             <span
              className="vt-spectrum-badge sync-ctrl-unit-status"
              style={{ "--vt-spectrum-badge-stroke": VT_SYNC_CONSOLE_STATUS_PRESENTATION[effectiveStatus].tone } as React.CSSProperties}
             >
              {VT_SYNC_CONSOLE_STATUS_PRESENTATION[effectiveStatus].label}
             </span>
             <span className="sync-ctrl-unit-count" title={`${resultCount.toLocaleString()} ${resultNoun}`}>
              <b>{resultCount.toLocaleString()}</b>
             </span>
             <span className="sync-ctrl-unit-fresh">
              <b>{freshness.value}</b>
              <small>{freshness.labels.join(" ")}</small>
             </span>
             <MiniSlideSwitch
              idleLabel="SYNC"
              status={effectiveStatus}
              onClick={() => void ctrl.startCategories(unit.categoryIds)}
             />
             {/* Issues inline */}
             {progressUnit?.issues.length ? (
              <div className="sync-ctrl-unit-issues">
               {progressUnit.issues.map((issue) => (
                <div key={`${unit.id}-${issue.category.id}`} className="sync-ctrl-issue-row">
                 <b>{issue.category.label}:</b> {issue.message}
                </div>
               ))}
              </div>
             ) : null}
            </div>
           )
          })}
         </div>
        </section>
       )
      })}
     </div>
    </div>
   </WidgetScrollArea>

   {/* ── Footer ── */}
   <WidgetFooter surface="subtle">
    <div className="sync-ctrl-footer">
     <RetroLcd tone={VT_SYNC_CONSOLE_STATUS_PRESENTATION.synced.tone}>
      {formatRelativeTime(ctrl.consoleModel.latestDatasetAt)}
     </RetroLcd>
     {!ctrl.isAuthenticated ? (
      <button
       type="button"
       className="vt-button primary sync-ctrl-connect-btn"
       onClick={() => void ctrl.login()}
      >
       CONNECT
      </button>
     ) : (
      <button
       type="button"
       className="vt-button sync-ctrl-analytics-link"
       onClick={() => navigate("/local-analytics")}
      >
       FULL CONSOLE →
      </button>
     )}
    </div>
   </WidgetFooter>
  </WidgetShell>
 )
}
