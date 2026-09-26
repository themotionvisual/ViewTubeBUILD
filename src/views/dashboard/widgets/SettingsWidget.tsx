import React, { useMemo, useState } from "react"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import { getCurrentEntitlement } from "../../../services/billingEntitlement"
import { Bot, CreditCard, Database, LayoutGrid, Settings2, UserCircle2 } from "lucide-react"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetHeaderStepper,
  WidgetPreviewState,
  WidgetProgressBar,
  WidgetScrollArea,
  WidgetSizedButton,
  WidgetToggleSwitch,
} from "../WidgetPrimitives"
import { SETTINGS_AI_PREVIEW_ITEMS, SETTINGS_DATA_PREVIEW_ITEMS } from "../widgetPreviewFixtures"
import "./SettingsWidget.css"

type SettingsPage = "dashboard" | "data" | "ai" | "account"

const SETTINGS_PAGES = [
  { id: "dashboard", label: "DASHBOARD" },
  { id: "data", label: "DATA" },
  { id: "ai", label: "AI" },
  { id: "account", label: "ACCOUNT" },
] as const satisfies readonly { id: SettingsPage; label: string }[]

interface DashboardControlBridge {
  editMode?: boolean
  setEditMode?: (updater: (previous: boolean) => boolean) => void
  locked?: boolean
  toggleLock?: () => void
  openPicker?: () => void
  resetLayout?: () => void
  showAllWidgets?: () => void
  hiddenWidgetCount?: number
  totalWidgetCount?: number
  handleExport?: () => void
  handleImportClick?: () => void
  applyPreset?: (preset: "focus" | "creation" | "analytics" | "all") => void
}

interface SettingsWidgetProps extends CommonWidgetProps {
  data: DashboardData
  onNavigate?: (to: string) => void
  dashboardControls?: DashboardControlBridge
}

const readLocal = (key: string, fallback: string) => {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

const resolveModelLabel = (model: string) => {
  if (model === "gemini-3.1-pro-preview") return "GEMINI 3.1 PRO"
  if (model === "gemini-3.1-flash-image-preview") return "GEMINI 3.1 IMAGE"
  if (model === "gemini-3-flash-preview") return "GEMINI 3 FLASH"
  return "GEMINI 3.1 FLASH"
}

const StatusCell: React.FC<{
  label: string
  value: React.ReactNode
  status?: "positive" | "warning" | "danger" | "neutral"
}> = ({ label, value, status = "neutral" }) => (
  <div className="settings-switchboard-status-cell">
    <span>{label}</span>
    <WidgetBadge height={24} status={status}>{value}</WidgetBadge>
  </div>
)

export const SettingsWidget: React.FC<SettingsWidgetProps> = ({
  data,
  onNavigate = () => {},
  dashboardControls,
  ...common
}) => {
  const [page, setPage] = useState<SettingsPage>("dashboard")
  const [resetArmed, setResetArmed] = useState(false)
  const account = useUnifiedAccount()
  const entitlement = getCurrentEntitlement()
  const isConnected = account.snapshot.google.status === "connected" || data.authState.isAuthenticated
  const hidden = Math.max(0, dashboardControls?.hiddenWidgetCount ?? 0)
  const total = Math.max(0, dashboardControls?.totalWidgetCount ?? 68)
  const visible = Math.max(0, total - hidden)
  const model = readLocal("GEMINI_MODEL", "gemini-3.1-flash-lite")
  const planId = String(entitlement.subscriptionPlanId || "basic").toUpperCase()
  const lastSyncTimestamp = data.lastSyncComplete ? Date.parse(data.lastSyncComplete) : null
  const lastSync = data.formatRelativeTime(Number.isFinite(lastSyncTimestamp) ? lastSyncTimestamp : null)
  const syncAgeMs = Number.isFinite(lastSyncTimestamp) ? Date.now() - Number(lastSyncTimestamp) : null
  const dataIssue = String(data.videoAssetCatalogError || "").trim()
  const dataState = !isConnected
    ? "DISCONNECTED"
    : dataIssue
      ? "ERROR"
      : !Number.isFinite(lastSyncTimestamp)
        ? "NEVER SYNCED"
        : syncAgeMs !== null && syncAgeMs > 24 * 60 * 60 * 1000
          ? "STALE"
          : "CURRENT"

  const dashboardProgress = useMemo(
    () => total > 0 ? Math.round((visible / total) * 100) : 0,
    [total, visible],
  )

  const pageIndex = Math.max(0, SETTINGS_PAGES.findIndex((item) => item.id === page))
  const headerContent = (
    <WidgetHeaderStepper
      label="Settings control room page"
      value={SETTINGS_PAGES[pageIndex]?.label ?? "DASHBOARD"}
      onPrevious={() => setPage(SETTINGS_PAGES[(pageIndex + SETTINGS_PAGES.length - 1) % SETTINGS_PAGES.length].id)}
      onNext={() => setPage(SETTINGS_PAGES[(pageIndex + 1) % SETTINGS_PAGES.length].id)}
    />
  )

  return (
    <WidgetShell {...common} icon={<Settings2 size={22} />} headerContent={headerContent}>
      <WidgetScrollArea ariaLabel="Dashboard settings control switchboard" contentClassName="settings-switchboard">
        {page === "dashboard" && (
          <section className="settings-switchboard-page" aria-label="Dashboard settings">
            <div className="settings-switchboard-status-grid">
              <StatusCell label="REGISTERED" value={total} status="positive" />
              <StatusCell label="VISIBLE" value={visible} status={hidden ? "warning" : "positive"} />
              <StatusCell label="HIDDEN" value={hidden} status={hidden ? "warning" : "neutral"} />
              <StatusCell label="LAYOUT" value={dashboardControls?.locked ? "LOCKED" : "EDITABLE"} />
            </div>

            <WidgetProgressBar
              value={dashboardProgress}
              label="DASHBOARD VISIBILITY"
              displayValue={`${visible} / ${total}`}
              height={24}
              tone="primary"
            />

            <div className="settings-switchboard-control-grid">
              <div className="settings-switchboard-control-row">
                <div>
                  <strong>DASHBOARD CONTROLS</strong>
                  <span>Show resize, hide and arrangement controls.</span>
                </div>
                <WidgetToggleSwitch
                  checked={Boolean(dashboardControls?.editMode)}
                  onChange={() => dashboardControls?.setEditMode?.((previous) => !previous)}
                  label="Dashboard controls"
                  height={24}
                  tone="primary"
                />
              </div>

              <div className="settings-switchboard-control-row">
                <div>
                  <strong>LAYOUT LOCK</strong>
                  <span>Prevent accidental layout changes while keeping widget tools usable.</span>
                </div>
                <WidgetToggleSwitch
                  checked={Boolean(dashboardControls?.locked)}
                  onChange={() => dashboardControls?.toggleLock?.()}
                  label="Layout lock"
                  height={24}
                  tone="secondary"
                />
              </div>
            </div>

            <div className="settings-switchboard-preset-grid" role="group" aria-label="Dashboard layout presets">
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => dashboardControls?.applyPreset?.("focus")}>FOCUS</WidgetSizedButton>
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => dashboardControls?.applyPreset?.("creation")}>CREATION</WidgetSizedButton>
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => dashboardControls?.applyPreset?.("analytics")}>ANALYTICS</WidgetSizedButton>
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => dashboardControls?.applyPreset?.("all")}>ALL</WidgetSizedButton>
            </div>

            <div className="settings-switchboard-actions">
              <WidgetSizedButton height={24} tone="primary" textFit="adaptive" onClick={() => dashboardControls?.openPicker?.()}>
                MANAGE WIDGETS
              </WidgetSizedButton>
              <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" disabled={!hidden} onClick={() => dashboardControls?.showAllWidgets?.()}>
                SHOW ALL WIDGETS{hidden ? ` (${hidden})` : ""}
              </WidgetSizedButton>
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => onNavigate("/settings?panel=widgets")}>
                FULL SETTINGS
              </WidgetSizedButton>
            </div>

            <div className="settings-switchboard-actions">
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => dashboardControls?.handleExport?.()}>EXPORT</WidgetSizedButton>
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => dashboardControls?.handleImportClick?.()}>IMPORT</WidgetSizedButton>
              {!resetArmed ? (
                <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" onClick={() => setResetArmed(true)}>RESET LAYOUT</WidgetSizedButton>
              ) : (
                <div className="settings-switchboard-reset-confirm">
                  <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" onClick={() => { dashboardControls?.resetLayout?.(); setResetArmed(false) }}>CONFIRM RESET</WidgetSizedButton>
                  <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => setResetArmed(false)}>CANCEL RESET</WidgetSizedButton>
                </div>
              )}
            </div>

            <div className="settings-switchboard-mobile-note">
              <LayoutGrid size={18} aria-hidden="true" />
              <div>
                <strong>MOBILE CONTROL MODE</strong>
                <span>Width is locked on phones. Height remains adjustable. Widgets move one step up/down while the viewport stays anchored.</span>
              </div>
            </div>
          </section>
        )}

        {page === "data" && (
          <section className="settings-switchboard-page" aria-label="Data settings">
            <div className="settings-switchboard-hero">
              <Database size={26} aria-hidden="true" />
              <div>
                <strong>{isConnected ? "CHANNEL DATA CONNECTED" : "CONNECT YOUR CHANNEL"}</strong>
                <span>{isConnected ? `Last successful sync: ${lastSync}` : "Connect YouTube to activate personalized analytics and creator intelligence."}</span>
              </div>
              <WidgetBadge height={24} status={dataState === "CURRENT" ? "positive" : dataState === "ERROR" ? "danger" : "warning"}>
                {data.isSyncing ? "SYNCING" : dataState}
              </WidgetBadge>
            </div>

            <WidgetProgressBar
              value={!isConnected ? 0 : dataState === "CURRENT" ? 2 : 1}
              max={2}
              label="DATA READINESS"
              displayValue={!isConnected ? "0 / 2" : dataState === "CURRENT" ? "READY" : "REVIEW"}
              height={24}
              tone={dataState === "CURRENT" ? "primary" : "secondary"}
            />

            {!isConnected && (
              <WidgetPreviewState
                compact
                ariaLabel="Settings data preview"
                previewReason="Connect to personalize this data-control surface."
                recoveryAction="CONNECT CHANNEL"
                onRecover={() => onNavigate("/connect")}
              >
                <div className="settings-switchboard-preview-grid">
                  {SETTINGS_DATA_PREVIEW_ITEMS.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </WidgetPreviewState>
            )}

            {isConnected && (
              <div className="settings-switchboard-status-grid is-two">
                <StatusCell label="LAST SYNC" value={lastSync} status={dataState === "CURRENT" ? "positive" : "warning"} />
                <StatusCell label="SOURCE HEALTH" value={dataIssue ? "ISSUE" : data.isSyncing ? "SYNCING" : "READY"} status={dataIssue ? "danger" : data.isSyncing ? "warning" : "positive"} />
              </div>
            )}

            {dataIssue && (
              <div className="settings-switchboard-issue" role="alert">
                <strong>DATA SOURCE ISSUE</strong>
                <span>{dataIssue}</span>
              </div>
            )}

            <div className="settings-switchboard-actions">
              <WidgetSizedButton
                height={24}
                tone="primary"
                textFit="adaptive"
                onClick={() => isConnected ? void data.globalSyncData({ batchMode: "initial" }) : onNavigate("/connect")}
              >
                {isConnected ? "SYNC NOW" : "CONNECT"}
              </WidgetSizedButton>
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => onNavigate("/settings?panel=data")}>
                DATA SETTINGS
              </WidgetSizedButton>
            </div>
          </section>
        )}

        {page === "ai" && (
          <section className="settings-switchboard-page" aria-label="AI settings">
            <div className="settings-switchboard-hero">
              <Bot size={26} aria-hidden="true" />
              <div>
                <strong>ACTIVE AI BRAIN</strong>
                <span>Dashboard recommendations, generation and creator intelligence use the current governed AI configuration.</span>
              </div>
              <WidgetBadge height={24} status="positive">{resolveModelLabel(model)}</WidgetBadge>
            </div>

            <div className="settings-switchboard-status-grid is-two">
              <StatusCell label="MODEL" value={resolveModelLabel(model)} status="positive" />
              <StatusCell label="CHANNEL CONTEXT" value={isConnected ? "AVAILABLE" : "PREVIEW"} status={isConnected ? "positive" : "warning"} />
            </div>

            {!isConnected && (
              <WidgetPreviewState
                compact
                ariaLabel="Settings AI preview"
                previewReason="Connect a channel to ground AI advice in your evidence and active projects."
                recoveryAction="CONNECT CHANNEL"
                onRecover={() => onNavigate("/connect")}
              >
                <div className="settings-switchboard-preview-grid">
                  {SETTINGS_AI_PREVIEW_ITEMS.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </WidgetPreviewState>
            )}

            <div className="settings-switchboard-actions">
              <WidgetSizedButton height={24} tone="primary" textFit="adaptive" onClick={() => onNavigate("/ai-brain")}>
                OPEN BRAIN HUB
              </WidgetSizedButton>
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => onNavigate("/settings?panel=ai")}>
                AI SETTINGS
              </WidgetSizedButton>
            </div>
          </section>
        )}

        {page === "account" && (
          <section className="settings-switchboard-page" aria-label="Account settings">
            <div className="settings-switchboard-hero">
              <UserCircle2 size={26} aria-hidden="true" />
              <div>
                <strong>{isConnected ? "ACCOUNT CONNECTED" : "ACCOUNT SETUP"}</strong>
                <span>Plan, billing, account connection and help remain one tap away.</span>
              </div>
              <WidgetBadge height={24} status={isConnected ? "positive" : "warning"}>{planId}</WidgetBadge>
            </div>

            <div className="settings-switchboard-actions is-account">
              <WidgetSizedButton height={24} tone="primary" textFit="adaptive" onClick={() => onNavigate("/account")}>
                ACCOUNT
              </WidgetSizedButton>
              <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" onClick={() => onNavigate("/account?panel=billing")}>
                <CreditCard size={16} aria-hidden="true" /> BILLING
              </WidgetSizedButton>
              <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => onNavigate("/user-guide")}>
                USER GUIDE
              </WidgetSizedButton>
            </div>
          </section>
        )}
      </WidgetScrollArea>
    </WidgetShell>
  )
}

export default SettingsWidget
