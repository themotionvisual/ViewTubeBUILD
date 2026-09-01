import React, { useState } from "react"
import {
  UserCircle2,
  LogOut,
  Unplug,
  RefreshCw,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetScrollArea,
  WidgetBadge,
} from "../WidgetPrimitives"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"

/**
 * AccountBillingWidget — single-view account, connection, credits, and
 * subscription. No tabs; every important field is visible on one dense
 * scroll pane so the widget doesn't hide information behind clicks.
 * Chrome flows from `.vt-button` and widget-color CSS variables.
 */

export const AccountBillingWidget: React.FC<any> = ({
  widget, instance, editMode,
  onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove,
}) => {
  const common = {
    widget, instance, editMode, canEdit: true,
    onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove,
  }

  const account = useUnifiedAccount()
  const s = account?.snapshot
  const [busy, setBusy] = useState<"signin" | "signout" | "disconnect" | "delete" | "refresh" | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const run = async (id: typeof busy, fn: () => Promise<unknown> | void) => {
    setBusy(id); setNotice(null)
    try { await fn() }
    catch (err) { setNotice(err instanceof Error ? err.message : "Action failed") }
    finally { setBusy(null) }
  }

  const authStatus = s?.authentication?.status ?? "anonymous"
  const googleStatus = s?.google?.status ?? "disconnected"
  const isAuthed = authStatus === "authenticated"
  const isGoogleConnected = googleStatus === "connected"

  const authStatusName: "positive" | "warning" | "neutral" | "danger" =
    isAuthed ? "positive" : authStatus === "pending" ? "warning" : "neutral"
  const googleStatusName: "positive" | "warning" | "neutral" | "danger" =
    isGoogleConnected ? "positive"
    : googleStatus === "expired" || googleStatus === "revoked" ? "warning"
    : "neutral"
  const billingStatus = s?.billing?.status ?? "inactive"
  const billingStatusName: "positive" | "warning" | "neutral" | "danger" =
    billingStatus === "active" ? "positive"
    : billingStatus === "past_due" ? "danger"
    : "neutral"

  const planId = s?.billing?.planId ?? null
  const aiCredits = s?.ai?.availableCredits ?? 0
  const aiPlan = s?.ai?.planId ?? null

  return (
    <WidgetShell {...common} icon={<UserCircle2 size={22} />} contentLayout="flush">
      <WidgetScrollArea ariaLabel="Account and billing" edge="inset">
        <div className="widget-account">

          {notice && (
            <div role="status" className="widget-inline-alert">{notice}</div>
          )}

          {/* Identity block — avatar + name + email + status chips. Sign-in/out
              buttons live inline so the primary action is always one click away. */}
          <div className="widget-account-identity">
            <div className="widget-account-avatar">
              {s?.profile?.avatarUrl ? (
                <img
                  src={s.profile.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = "none" }}
                />
              ) : (
                <UserCircle2 size={30} strokeWidth={2} />
              )}
            </div>
            <div className="widget-account-identity__body">
              <div className="widget-account-identity__name">{s?.profile?.displayName || "Guest"}</div>
              <div className="widget-account-identity__email">{s?.profile?.email || "Not signed in"}</div>
              <div className="widget-account-identity__chips">
                <WidgetBadge status={authStatusName}>{authStatus}</WidgetBadge>
                <WidgetBadge status={googleStatusName}>YT · {googleStatus}</WidgetBadge>
              </div>
            </div>
            <div className="widget-account-identity__cta">
              {isAuthed ? (
                <button type="button" onClick={() => run("signout", () => account.signOut())} disabled={busy !== null} className="vt-button">
                  <LogOut size={13} />
                  <span>{busy === "signout" ? "…" : "Sign Out"}</span>
                </button>
              ) : (
                <button type="button" onClick={() => run("signin", () => account.start(account.intent, window.location.pathname))} disabled={busy !== null} className="vt-button primary">
                  <Sparkles size={13} />
                  <span>{busy === "signin" ? "…" : (account?.label ?? "Sign In")}</span>
                </button>
              )}
              <button type="button" onClick={() => run("refresh", () => account.refresh())} disabled={busy !== null} className="vt-button" title="Refresh account">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Metric strip — two headline metrics side-by-side: AI Credits + Plan. */}
          <div className="widget-account-metrics">
            <div className="widget-account-metric">
              <div className="widget-account-metric__label">
                <Sparkles size={11} /> AI Credits
                <span style={{ marginLeft: "auto" }}><WidgetBadge tone="magenta">{aiPlan ? String(aiPlan).toUpperCase() : "Free"}</WidgetBadge></span>
              </div>
              <div className="widget-account-metric__value">{aiCredits.toLocaleString()}</div>
              <button type="button" onClick={() => window.open("/billing", "_blank", "noopener")} className="vt-button primary">
                <Sparkles size={12} /><span>Top Up</span>
              </button>
            </div>
            <div className="widget-account-metric">
              <div className="widget-account-metric__label">
                <CreditCard size={11} /> Subscription
                <span style={{ marginLeft: "auto" }}><WidgetBadge status={billingStatusName}>{billingStatus}</WidgetBadge></span>
              </div>
              <div className="widget-account-metric__value" style={{ fontSize: "20px" }}>
                {planId ? String(planId).toUpperCase() : "FREE"}
              </div>
              <button type="button" onClick={() => window.open("/billing", "_blank", "noopener")} className="vt-button">
                <CreditCard size={12} /><span>{billingStatus === "active" ? "Manage" : "Upgrade"}</span>
              </button>
            </div>
          </div>

          {/* Channel block — thumbnail + channel meta + inline disconnect. */}
          <div className="widget-account-channel">
            <div className="widget-account-channel__head">
              <ShieldCheck size={13} />
              <span className="widget-account-channel__title">YouTube Connection</span>
              <span style={{ marginLeft: "auto" }}><WidgetBadge status={googleStatusName}>{googleStatus}</WidgetBadge></span>
            </div>
            <dl className="widget-account-defs">
              <div><dt>Channel</dt><dd>{s?.google?.channelTitle || "—"}</dd></div>
              <div><dt>Handle</dt><dd>{s?.google?.channelHandle ? `@${String(s.google.channelHandle).replace(/^@/, "")}` : "—"}</dd></div>
              <div><dt>Scopes</dt><dd>{s?.google?.youtubeScopesGranted ? "YouTube Read granted" : "Not granted"}</dd></div>
              <div><dt>Owners</dt><dd>{(s?.google?.contentOwners?.length ?? 0) > 0 ? `${s?.google?.contentOwners?.length}` : "None"}</dd></div>
            </dl>
            <div className="widget-account-channel__cta">
              <button
                type="button"
                onClick={() => run(isGoogleConnected ? "refresh" : "signin", () => (
                  isGoogleConnected ? account.refresh() : account.start(account.intent, window.location.pathname)
                ))}
                disabled={busy !== null}
                className={`vt-button ${isGoogleConnected ? "" : "primary"}`}
              >
                <RefreshCw size={12} /><span>{isGoogleConnected ? "Refresh" : (account?.label ?? "Connect")}</span>
              </button>
              <button
                type="button"
                onClick={() => run("disconnect", () => account.disconnectGoogle())}
                disabled={busy !== null || !isGoogleConnected}
                className="vt-button"
              >
                <Unplug size={12} /><span>{busy === "disconnect" ? "…" : "Disconnect"}</span>
              </button>
              <a href={s?.google?.channelHandle ? `https://youtube.com/@${String(s.google.channelHandle).replace(/^@/, "")}` : "https://youtube.com"} target="_blank" rel="noreferrer" className="vt-button">
                <ExternalLink size={12} /><span>Open</span>
              </a>
            </div>
          </div>

          {/* Danger row — compact, at the bottom so it's out of the way. */}
          <div className="widget-account-danger">
            <span className="widget-account-danger__label">Danger</span>
            <button
              type="button"
              onClick={() => {
                if (!deleteConfirm) { setDeleteConfirm(true); setTimeout(() => setDeleteConfirm(false), 4000); return }
                setDeleteConfirm(false)
                run("delete", () => account.deleteAccount())
              }}
              disabled={busy !== null || !isAuthed}
              className="vt-button widget-account-danger__btn"
            >
              <Trash2 size={12} />
              <span>{deleteConfirm ? "Tap again to confirm" : busy === "delete" ? "Deleting…" : "Delete Account"}</span>
            </button>
          </div>
        </div>
      </WidgetScrollArea>
    </WidgetShell>
  )
}
