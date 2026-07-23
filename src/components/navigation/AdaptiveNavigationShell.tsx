import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Columns2,
  Menu,
  PanelLeft,
  PanelTop,
  UserCircle2,
  X,
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useDashboard } from "../../context/DashboardContext"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"
import { useBrain } from "../../context/useBrain"
import { isOwnerEmail, type EntitlementState } from "../../services/billingEntitlement"
import { formatSyncLabel, getSyncTimestamp } from "../../services/onboardingState"
import { getNavPaletteColor, VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import { AccountActionButton } from "../account/AccountActionButton"
import { GeminiKeySettings } from "../GeminiKeySettings"
import {
  NAVIGATION_STORAGE_KEY,
  PRIMARY_NAV_ITEMS,
  parseNavigationLayout,
  type NavigationLayout,
} from "./navigationContract"
import "./adaptive-navigation.css"

interface AdaptiveNavigationShellProps {
  children: React.ReactNode
  entitlement: EntitlementState
  isEditorSurface: boolean
}

interface ApplicationScrollbarProps {
  viewportRef: React.RefObject<HTMLElement | null>
}

const ApplicationScrollbar: React.FC<ApplicationScrollbarProps> = ({ viewportRef }) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const thumbRef = useRef<HTMLDivElement | null>(null)
  const dragOffsetRef = useRef(0)
  const [thumbColor] = useState(() => (
    VT_SPECTRUM_PALETTE_06[Math.floor(Math.random() * VT_SPECTRUM_PALETTE_06.length)]
  ))

  const syncThumb = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!viewport || !track || !thumb) return

    const trackHeight = track.clientHeight
    const maximumScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
    const thumbHeight = Math.max(46, trackHeight * (viewport.clientHeight / Math.max(viewport.clientHeight, viewport.scrollHeight)))
    const maximumTravel = Math.max(0, trackHeight - thumbHeight)
    const ratio = maximumScroll ? viewport.scrollTop / maximumScroll : 0

    thumb.style.height = `${thumbHeight}px`
    thumb.style.setProperty("--vt-window-thumb-y", `${ratio * maximumTravel}px`)
  }, [viewportRef])

  const scrollFromPointer = (clientY: number) => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!viewport || !track || !thumb) return

    const maximumTravel = Math.max(1, track.clientHeight - thumb.offsetHeight)
    const thumbTop = Math.max(0, Math.min(maximumTravel, clientY - track.getBoundingClientRect().top - dragOffsetRef.current))
    const maximumScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
    viewport.scrollTo({ top: (thumbTop / maximumTravel) * maximumScroll, behavior: "auto" })
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const resizeObserver = new ResizeObserver(syncThumb)
    resizeObserver.observe(viewport)
    Array.from(viewport.children).forEach((child) => resizeObserver.observe(child))
    const mutationObserver = new MutationObserver(() => {
      Array.from(viewport.children).forEach((child) => resizeObserver.observe(child))
      syncThumb()
    })
    mutationObserver.observe(viewport, { childList: true, subtree: true })
    viewport.addEventListener("scroll", syncThumb, { passive: true })
    window.addEventListener("resize", syncThumb, { passive: true })
    syncThumb()

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      viewport.removeEventListener("scroll", syncThumb)
      window.removeEventListener("resize", syncThumb)
    }
  }, [syncThumb, viewportRef])

  return (
    <div
      ref={trackRef}
      className="custom-track vt-app-scroll-track"
      aria-hidden="true"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest(".custom-thumb")) return
        dragOffsetRef.current = (thumbRef.current?.offsetHeight || 0) / 2
        scrollFromPointer(event.clientY)
      }}
    >
      <div
        ref={thumbRef}
        className="custom-thumb vt-app-scroll-thumb"
        style={{ backgroundColor: thumbColor }}
        onPointerDown={(event) => {
          const thumb = thumbRef.current
          if (!thumb) return
          dragOffsetRef.current = event.clientY - thumb.getBoundingClientRect().top
          thumb.setPointerCapture(event.pointerId)
          event.preventDefault()
        }}
        onPointerMove={(event) => {
          if (!thumbRef.current?.hasPointerCapture(event.pointerId)) return
          scrollFromPointer(event.clientY)
        }}
      />
    </div>
  )
}

const MOBILE_QUERY = "(max-width: 760px)"

const planLabel = (planId: string): string => {
  if (planId === "creator") return "Creator"
  if (planId === "creator_plus") return "Creator Plus"
  if (planId === "creator_pro") return "Creator Pro"
  if (planId === "executive") return "Executive"
  return "Basic"
}

const knownEmail = (): string => {
  if (typeof window === "undefined") return ""
  const remembered = String(localStorage.getItem("vt_known_user_email") || "").trim().toLowerCase()
  if (remembered) return remembered
  return String(localStorage.getItem("vt_signup_email") || "").trim().toLowerCase()
}

const isMobileViewport = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches

export const AdaptiveNavigationShell: React.FC<AdaptiveNavigationShellProps> = ({
  children,
  entitlement,
  isEditorSurface,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const account = useUnifiedAccount()
  const {
    authState,
    channelConnection,
    channelIdentity,
    connectChannel,
    disconnectChannel,
    syncChannelData,
  } = useBrain()
  const {
    editMode,
    setEditMode,
    isLocked,
    setIsLocked,
    setPickerOpen,
    exportLayout,
    importLayout,
    resetLayout,
  } = useDashboard()

  const [layout, setLayoutState] = useState<NavigationLayout>(() => {
    if (typeof window === "undefined") return "top"
    return parseNavigationLayout(localStorage.getItem(NAVIGATION_STORAGE_KEY))
  })
  const [mobile, setMobile] = useState(isMobileViewport)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<"brain" | "widgets" | null>(null)
  const [announcement, setAnnouncement] = useState("")
  const accountButtonRef = useRef<HTMLButtonElement | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const mainViewportRef = useRef<HTMLElement | null>(null)

  const isConnected = account.snapshot.google.status === "connected" || channelConnection.isConnected
  const channelName = channelIdentity.name || channelConnection.channelName || "Not connected"
  const handleText = channelIdentity.handle
    ? `@${String(channelIdentity.handle).replace(/^@/, "")}`
    : channelConnection.handleText || "@not-connected"
  const channelAvatar = channelIdentity.avatarUrl || authState.channelThumbnail
  const syncLabel = channelConnection.state === "connected_verified"
    ? formatSyncLabel(getSyncTimestamp(authState))
    : channelConnection.state === "syncing"
      ? "Syncing now"
      : channelConnection.statusLabel || "Ready to connect"
  const label = planLabel(entitlement.subscriptionPlanId)
  const unlimited = entitlement.tier === "large"
  const credits = unlimited
    ? "Unlimited"
    : `${Math.max(0, Math.floor(entitlement.creditBalance)).toLocaleString()} credits`
  const creditCap = Math.max(1, Math.floor(entitlement.rolloverCap || entitlement.monthlyCreditGrant || 1))
  const creditPercent = unlimited
    ? 100
    : Math.max(0, Math.min(100, Math.round((Math.max(0, entitlement.creditBalance) / creditCap) * 100)))
  const canSeeApiKeys = entitlement.subscriptionPlanId === "executive" || isOwnerEmail(knownEmail())
  const shellLayout = mobile ? "mobile" : layout
  const isBrainWorkspace = location.pathname === "/ai-brain"

  const closeAccountMenu = (restoreFocus = false) => {
    setAccountOpen(false)
    setExpandedSection(null)
    if (restoreFocus) requestAnimationFrame(() => accountButtonRef.current?.focus())
  }

  const setLayout = (nextLayout: NavigationLayout) => {
    setLayoutState(nextLayout)
    closeAccountMenu()
    setAnnouncement(`${nextLayout === "top" ? "Top bar" : nextLayout === "wide" ? "Wide sidebar" : "Thin sidebar"} navigation active`)
  }

  useEffect(() => {
    localStorage.setItem(NAVIGATION_STORAGE_KEY, layout)
  }, [layout])

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    const updateViewport = () => {
      setMobile(mediaQuery.matches)
      if (!mediaQuery.matches) setDrawerOpen(false)
      closeAccountMenu()
    }
    updateViewport()
    mediaQuery.addEventListener("change", updateViewport)
    return () => mediaQuery.removeEventListener("change", updateViewport)
  }, [])

  useEffect(() => {
    if (!accountOpen) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (accountMenuRef.current?.contains(target) || accountButtonRef.current?.contains(target)) return
      closeAccountMenu()
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [accountOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus())
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [drawerOpen])

  const onAccountMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      closeAccountMenu(true)
      return
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    const items = Array.from(
      accountMenuRef.current?.querySelectorAll<HTMLElement>("[data-nav-menu-item]:not([disabled])") || [],
    )
    if (!items.length) return
    event.preventDefault()
    const currentIndex = items.indexOf(document.activeElement as HTMLElement)
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : event.key === "ArrowDown"
          ? (currentIndex + 1 + items.length) % items.length
          : (currentIndex - 1 + items.length) % items.length
    items[nextIndex]?.focus()
  }

  const onDrawerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setDrawerOpen(false)
      return
    }
    if (event.key !== "Tab") return
    const focusable = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>("a, button:not([disabled])") || [],
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const onLegacyAccountAction = async () => {
    if (channelConnection.isConnected) {
      await syncChannelData({ batchMode: "initial" })
      return
    }
    await connectChannel()
  }

  const onSignOut = async () => {
    closeAccountMenu()
    await account.signOut()
    disconnectChannel()
  }

  const go = (path: string) => {
    closeAccountMenu()
    navigate(path)
  }

  const renderPrimaryNavigation = (mobileDrawer = false) => (
    <nav className={mobileDrawer ? "vt-adaptive-nav__drawer-links" : "vt-adaptive-nav__links"} aria-label="Primary navigation">
      {PRIMARY_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          onClick={() => {
            if (mobileDrawer) setDrawerOpen(false)
            closeAccountMenu()
          }}
          className="vt-adaptive-nav__link"
          style={{ "--vt-nav-color": getNavPaletteColor(item.paletteIndex) } as React.CSSProperties}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  const renderLayoutControls = () => (
    <div className="vt-adaptive-nav__layout-controls" role="group" aria-label="Navigation layout">
      <button type="button" onClick={() => setLayout("top")} aria-label="Use top bar" aria-pressed={layout === "top"} title="Top bar">
        <PanelTop aria-hidden="true" />
      </button>
      <button type="button" onClick={() => setLayout("wide")} aria-label="Use wide sidebar" aria-pressed={layout === "wide"} title="Wide sidebar">
        <PanelLeft aria-hidden="true" />
      </button>
      <button type="button" onClick={() => setLayout("thin")} aria-label="Use thin sidebar" aria-pressed={layout === "thin"} title="Thin sidebar">
        <Columns2 aria-hidden="true" />
      </button>
    </div>
  )

  const accountTrigger = (
    <button
      ref={accountButtonRef}
      type="button"
      className="vt-adaptive-nav__account-trigger"
      onClick={() => {
        const willOpen = !accountOpen
        setAccountOpen(willOpen)
        if (willOpen) requestAnimationFrame(() => accountMenuRef.current?.querySelector<HTMLElement>("[data-nav-menu-item]")?.focus())
      }}
      aria-haspopup="menu"
      aria-expanded={accountOpen}
      aria-controls="vt-adaptive-account-menu"
    >
      <span className="vt-adaptive-nav__avatar">
        {channelAvatar ? (
          <img src={channelAvatar} alt="" width="38" height="38" />
        ) : (
          <UserCircle2 aria-hidden="true" />
        )}
      </span>
      <span className="vt-adaptive-nav__account-copy">
        <strong>{channelName}</strong>
        <span>{isConnected ? `${handleText} | ${syncLabel}` : "Ready to connect"}</span>
      </span>
      <span className="vt-adaptive-nav__meter">
        <span><b>{label}</b><b>{credits}</b></span>
        <i><i style={{ width: `${creditPercent}%` }} /></i>
      </span>
      <ChevronDown className="vt-adaptive-nav__account-chevron" aria-hidden="true" />
    </button>
  )

  const accountMenu = accountOpen ? (
    <div
      ref={accountMenuRef}
      id="vt-adaptive-account-menu"
      className="vt-adaptive-nav__account-menu"
      role="menu"
      aria-label="Account and workspace menu"
      onKeyDown={onAccountMenuKeyDown}
    >
      <div className="vt-adaptive-nav__menu-status">
        <span className="vt-adaptive-nav__avatar">
          {channelAvatar ? <img src={channelAvatar} alt="" width="38" height="38" /> : <UserCircle2 aria-hidden="true" />}
        </span>
        <span><strong>{channelName}</strong><small>{isConnected ? `${handleText} | ${syncLabel}` : "Channel workspace | Not connected"}</small></span>
        <b>{label} | {unlimited ? "Unlimited" : Math.max(0, Math.floor(entitlement.creditBalance)).toLocaleString()}</b>
      </div>

      <AccountActionButton
        data-nav-menu-item
        role="menuitem"
        surface="topbar"
        channelSyncing={channelConnection.state === "syncing"}
        onConnected={() => go("/account#workspace-data")}
        onLegacyAction={onLegacyAccountAction}
        className="vt-adaptive-nav__connect-action"
      />

      <div className="vt-adaptive-nav__menu-groups">
        <section aria-label="Workspace">
          <h2>Workspace</h2>
          <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/account")}><span>Account Settings</span><ChevronRight aria-hidden="true" /></button>
          {isConnected ? (
            <button data-nav-menu-item role="menuitem" type="button" onClick={() => { closeAccountMenu(); void syncChannelData({ batchMode: "initial" }) }}><span>Run Sync</span><ChevronRight aria-hidden="true" /></button>
          ) : null}
          <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/account?panel=billing")}><span>Billing & Credits</span><ChevronRight aria-hidden="true" /></button>
          <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/reference-studio/toolbox-system")}><span>Reference Studio</span><ChevronRight aria-hidden="true" /></button>
          <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/user-guide")}><span>User Guide</span><ChevronRight aria-hidden="true" /></button>
        </section>

        <section aria-label="Tools and layout">
          <h2>Tools & Layout</h2>
          <button data-nav-menu-item role="menuitem" type="button" aria-expanded={expandedSection === "brain"} onClick={() => setExpandedSection((value) => value === "brain" ? null : "brain")}><span>AI Brain Options</span><ChevronDown aria-hidden="true" /></button>
          {expandedSection === "brain" ? (
            <div className="vt-adaptive-nav__submenu">
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/ai-brain")}>Open AI Brain Command</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/ai-brain?intake=1")}>Gemini Flash Lite</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/ai-brain?intake=1")}>Gemini Pro Preview</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/ai-brain?intake=1")}>Gemini Video Analysis</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/ai-brain?intake=1")}>Gemini Image Analysis</button>
            </div>
          ) : null}
          <button data-nav-menu-item role="menuitem" type="button" aria-expanded={expandedSection === "widgets"} onClick={() => setExpandedSection((value) => value === "widgets" ? null : "widgets")}><span>Widget Options</span><ChevronDown aria-hidden="true" /></button>
          {expandedSection === "widgets" ? (
            <div className="vt-adaptive-nav__submenu">
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => { setEditMode((value) => !value); closeAccountMenu() }}>{editMode ? "Exit Rearrange Widgets" : "Rearrange Widgets"}</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => { setPickerOpen(true); closeAccountMenu() }}>Widget Availability</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => { setIsLocked((value) => !value); closeAccountMenu() }}>{isLocked ? "Unlock Layout" : "Lock Layout"}</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => { exportLayout(); closeAccountMenu() }}>Export Layout</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => { importLayout(); closeAccountMenu() }}>Import Layout</button>
              <button data-nav-menu-item role="menuitem" type="button" onClick={() => { resetLayout(); closeAccountMenu() }}>Reset Layout</button>
            </div>
          ) : null}
          {canSeeApiKeys ? (
            <button data-nav-menu-item role="menuitem" type="button" onClick={() => go("/account#api-keys")}><span>API Keys</span><ChevronRight aria-hidden="true" /></button>
          ) : null}
          <GeminiKeySettings trigger={
            <button data-nav-menu-item role="menuitem" type="button"><span>Bring Your AI Key</span><ChevronRight aria-hidden="true" /></button>
          } />
        </section>
      </div>

      {account.snapshot.authentication.status === "authenticated" || isConnected ? (
        <button data-nav-menu-item role="menuitem" type="button" className="vt-adaptive-nav__sign-out" onClick={() => void onSignOut()}>Sign Out</button>
      ) : null}
    </div>
  ) : null

  const logo = (
    <button type="button" className="vt-adaptive-nav__logo" onClick={() => navigate("/")} aria-label="Go to Dashboard">
      <span>View</span><span>Tube</span>
    </button>
  )

  return (
    <div className="vt-adaptive-shell" data-layout={shellLayout}>
      {mobile ? (
        <>
          <header className="vt-adaptive-nav vt-adaptive-nav--mobile">
            <button
              type="button"
              className="vt-adaptive-nav__mobile-control"
              onClick={() => setDrawerOpen((value) => !value)}
              aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={drawerOpen}
              aria-controls="vt-mobile-navigation-drawer"
            >
              {drawerOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
            {logo}
            {accountTrigger}
            {accountMenu}
          </header>
          {drawerOpen ? (
            <div className="vt-adaptive-nav__drawer-backdrop" role="presentation" onMouseDown={() => setDrawerOpen(false)}>
              <div
                ref={drawerRef}
                id="vt-mobile-navigation-drawer"
                className="vt-adaptive-nav__drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Application navigation"
                onMouseDown={(event) => event.stopPropagation()}
                onKeyDown={onDrawerKeyDown}
              >
                <div className="vt-adaptive-nav__drawer-head"><strong>Navigation</strong><button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close navigation"><X aria-hidden="true" /></button></div>
                {renderPrimaryNavigation(true)}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <header className="vt-adaptive-nav">
          <div className="vt-adaptive-nav__brand">{logo}</div>
          {renderPrimaryNavigation()}
          <div className="vt-adaptive-nav__utilities">
            {layout === "top" ? (
              <button type="button" className="vt-adaptive-nav__enter-sidebar" onClick={() => setLayout("wide")} aria-label="Use wide sidebar" title="Wide sidebar">
                <PanelLeft aria-hidden="true" />
              </button>
            ) : renderLayoutControls()}
            {accountTrigger}
            {accountMenu}
          </div>
        </header>
      )}

      <main
        ref={mainViewportRef}
        id="main-content"
        className={`vt-adaptive-main ${isEditorSurface ? "vt-adaptive-main--editor" : ""} ${isBrainWorkspace ? "vt-adaptive-main--brain" : ""}`}
      >
        {children}
      </main>
      {!isBrainWorkspace ? <ApplicationScrollbar viewportRef={mainViewportRef} /> : null}

      {location.pathname === "/" && !mobile && layout === "top" ? (
        <div className="vt-adaptive-legal"><a href="/privacy.html">Privacy Policy</a><span>|</span><a href="/terms.html">Terms of Service</a></div>
      ) : null}
      <span className="vt-adaptive-announcement" role="status" aria-live="polite">{announcement}</span>
    </div>
  )
}
