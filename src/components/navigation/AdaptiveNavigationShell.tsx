import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  PanelLeft,
  PanelTop,
  Sparkles,
  UserRound,
  X,
} from "lucide-react"
import { NavIcon } from "./navIcons"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"
import { useFeatureAccess } from "../../context/featureAccessContext"
import { useBrain } from "../../context/useBrain"
// Direct import — the feature barrel would drag in the entire VT-SYNC engine
// (tableRegistry, localSyncEngine, adapters) on every first paint even though
// the shell only needs the lightweight snapshot reader.
import { getVtSyncSnapshot } from "../../features/vt-sync-local/adapters/snapshot"
import { isOwnerEmail, type EntitlementState } from "../../services/billingEntitlement"
import { resolveAccountChipLabel } from "../../services/account/accountContracts"
import { listGenerationRecords } from "../../services/generationStore"
import { formatSyncLabel, getSyncTimestamp } from "../../services/onboardingState"
import { getSuperTool } from "../../services/superToolRegistry"
import { getNavPaletteColor, VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import { GeminiKeySettings } from "../GeminiKeySettings"
import { ApplicationAccountMenu, type ApplicationMenuRecentItem } from "./ApplicationAccountMenu"
import {
  NAVIGATION_STORAGE_KEY,
  PRIMARY_NAV_ITEMS,
  parseNavigationLayout,
  type NavigationLayout,
} from "./navigationContract"
import { useNavLayoutMorph } from "./useNavLayoutMorph"
import { prefetchRoute } from "./routePrefetch"
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

    // Coalesce every re-sync into a single rAF so a burst of DOM mutations
    // (chart re-renders, table row updates) can't cause a layout-thrash freeze
    // on mobile.
    let scheduledFrame: number | undefined
    const scheduleSync = () => {
      if (scheduledFrame !== undefined) return
      scheduledFrame = window.requestAnimationFrame(() => {
        scheduledFrame = undefined
        syncThumb()
      })
    }
    const cancelScheduled = () => {
      if (scheduledFrame !== undefined) {
        window.cancelAnimationFrame(scheduledFrame)
        scheduledFrame = undefined
      }
    }

    // ResizeObserver on the viewport itself only fires when the *container*
    // box changes (window resize / nav layout morph). It does NOT fire when
    // page content grows or shrinks — only scrollHeight changes in that case,
    // not clientHeight. So we also observe the direct content child and use a
    // MutationObserver to re-observe whenever React swaps the page component
    // on route navigation.
    const resizeObserver = new ResizeObserver(scheduleSync)
    resizeObserver.observe(viewport)

    const observeContentChild = () => {
      const child = viewport.firstElementChild
      if (child) resizeObserver.observe(child)
    }
    observeContentChild()

    // Fires when React replaces the page component (route change), giving us a
    // new firstElementChild to observe and an immediate thumb recalc.
    const mutationObserver = new MutationObserver(() => {
      observeContentChild()
      scheduleSync()
    })
    mutationObserver.observe(viewport, { childList: true })

    viewport.addEventListener("scroll", scheduleSync, { passive: true })
    window.addEventListener("resize", scheduleSync, { passive: true })
    scheduleSync()

    return () => {
      cancelScheduled()
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      viewport.removeEventListener("scroll", scheduleSync)
      window.removeEventListener("resize", scheduleSync)
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

const cleanAccountText = (value: string | null | undefined): string =>
  String(value || "").trim()

const cleanConnectedChannelName = (value: string | null | undefined): string => {
  const cleanValue = cleanAccountText(value)
  if (!cleanValue) return ""
  if (/^(syncing channel|not connected|needs verification)$/i.test(cleanValue)) return ""
  return cleanValue
}

// Any user-facing display name that reduces to one of these values is one of
// our placeholders (channelName falls back to `accountDisplayName` which
// falls back to "ViewTube Account" while we're still waiting for the Google
// profile response). Deriving initials from a placeholder produces junk like
// "VA" (V+A from "ViewTube Account") which users read as "why doesn't the
// app know my name?" instead of "the app is still loading my profile".
const PLACEHOLDER_NAMES = new Set([
  "viewtube account",
  "viewtube user",
  "unknown user",
])

const isPlaceholderName = (value: string): boolean =>
  PLACEHOLDER_NAMES.has(value.trim().toLowerCase())

// Optional `email` fallback is used when the display name is missing OR is
// one of our placeholders — the email prefix ("cbrewsterart" from
// "cbrewsterart@gmail.com") almost always yields more meaningful initials
// than the placeholder does. Returns an empty string when we have nothing
// usable, so the caller can render a person icon instead of a fake "VA".
const accountInitials = (value: string, email?: string): string => {
  const cleanValue = cleanAccountText(value)
  const cleanEmail = cleanAccountText(email)
  const nameCandidate = cleanValue && !isPlaceholderName(cleanValue) ? cleanValue : ""
  const source =
    nameCandidate ||
    (cleanEmail ? cleanEmail.split("@")[0] : "")
  if (!source) return ""
  const parts = source.split(/[\s._-]+/).filter(Boolean)
  const initials = parts.length > 1
    ? `${parts[0][0] || ""}${parts[1][0] || ""}`
    : source.slice(0, 2)
  return initials.toUpperCase()
}

const toHighResYouTubeAvatar = (url?: string | null): string => {
  const cleanUrl = cleanAccountText(url)
  if (!cleanUrl) return ""
  if (cleanUrl.includes("googleusercontent.com") || cleanUrl.includes("yt3.ggpht.com") || cleanUrl.includes("ggpht.com")) {
    return cleanUrl.replace(/=s\d+/, "=s800")
  }
  return cleanUrl
}

export const AdaptiveNavigationShell: React.FC<AdaptiveNavigationShellProps> = ({
  children,
  entitlement,
  isEditorSurface,
}) => {
  const featureAccess = useFeatureAccess()
  const location = useLocation()
  const navigate = useNavigate()
  const account = useUnifiedAccount()
  const {
    brain,
    authState,
    channelConnection,
    channelIdentity,
    connectChannel,
    disconnectChannel,
    syncChannelData,
  } = useBrain()

  const [layout, setLayoutState] = useState<NavigationLayout>(() => {
    if (typeof window === "undefined") return "top"
    return parseNavigationLayout(localStorage.getItem(NAVIGATION_STORAGE_KEY))
  })
  const [mobile, setMobile] = useState(isMobileViewport)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [geminiSettingsOpen, setGeminiSettingsOpen] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const accountButtonRef = useRef<HTMLButtonElement | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const mainViewportRef = useRef<HTMLElement | null>(null)

  const accountAuthenticated =
    account.snapshot.authentication.status === "authenticated" ||
    authState.isAuthenticated ||
    channelConnection.hasSession
  const googleConnected = account.snapshot.google.status === "connected" || account.snapshot.google.youtubeScopesGranted || channelConnection.isConnected
  const channelVerified = channelConnection.state === "connected_verified" || channelIdentity.isVerified
  const isConnected = accountAuthenticated && googleConnected
  const accountChipLabel = resolveAccountChipLabel(account.snapshot)
  const accountDisplayName =
    cleanAccountText(account.snapshot.profile.displayName) ||
    "ViewTube Account"
  // Reading the VT-SYNC snapshot on every render meant parsing a localStorage
  // JSON blob every time the shell re-rendered (auth ticks, resize, drawer
  // toggles, …). Memoize on the fields we actually source from it so the
  // parse only re-runs when a sync/logout changes the identity.
  const vtSyncSnapshot = useMemo(
    () => getVtSyncSnapshot(),
    [authState.channelName, authState.channelThumbnail, channelConnection.isConnected, channelIdentity.name, channelIdentity.avatarUrl],
  )
  const fallbackChannelName = cleanConnectedChannelName(channelConnection.channelName)
  const channelName = isConnected
    ? cleanConnectedChannelName(account.snapshot.google.channelTitle) || cleanConnectedChannelName(channelIdentity.name) || cleanConnectedChannelName(authState.channelName) || cleanConnectedChannelName(vtSyncSnapshot.channelName) || fallbackChannelName || accountDisplayName
    : accountChipLabel
  const handleValue = isConnected
    ? String(account.snapshot.google.channelHandle || channelIdentity.handle || channelConnection.handleText || vtSyncSnapshot.channelCustomUrl || "").replace(/^@/, "").trim()
    : ""
  const handleText = handleValue ? `@${handleValue}` : ""
  const accountMeta = handleText
    ? `${handleText} – ${accountDisplayName}`
    : isConnected && accountDisplayName !== "ViewTube Account"
      ? accountDisplayName
      : googleConnected ? "YouTube channel connected" : "Account active"
  const brainAvatar =
    brain.channelProfile?.thumbnail ||
    brain.channelProfile?.thumbnails?.high?.url ||
    brain.channelProfile?.thumbnails?.medium?.url ||
    brain.channelProfile?.thumbnails?.default?.url ||
    ""
  const channelAvatar = isConnected
    ? toHighResYouTubeAvatar(account.snapshot.google.channelThumbnail || channelIdentity.avatarUrl || authState.channelThumbnail || brainAvatar || vtSyncSnapshot.avatarUrl || account.snapshot.profile.avatarUrl)
    : null
  const syncLabel = channelConnection.state === "connected_verified"
    ? formatSyncLabel(getSyncTimestamp(authState))
    : channelConnection.state === "syncing"
      ? channelVerified ? "Refreshing catalog" : "Signed in"
      : isConnected
        ? channelVerified ? channelConnection.statusLabel || "Connected" : "Signed in"
        : accountChipLabel
  const label = planLabel(entitlement.subscriptionPlanId)
  const unlimited = entitlement.tier === "large"
  const credits = unlimited
    ? "Unlimited"
    : `${Math.max(0, Math.floor(entitlement.creditBalance)).toLocaleString()} credits`
  const creditCap = Math.max(1, Math.floor(entitlement.rolloverCap || entitlement.monthlyCreditGrant || 1))
  const creditPercent = unlimited
    ? 100
    : Math.max(0, Math.min(100, Math.round((Math.max(0, entitlement.creditBalance) / creditCap) * 100)))
  const canSeeApiKeys = entitlement.subscriptionPlanId === "executive" || isOwnerEmail(knownEmail()) || featureAccess.decision("settings.api_keys").disposition === "enabled"
  const applicationMenuRecentItems = useMemo<ApplicationMenuRecentItem[]>(() => {
    if (!accountOpen) return []

    const items: ApplicationMenuRecentItem[] = []
    const activeProject = brain.projects.find((project) => project.id === brain.activeProjectId)
    if (activeProject) {
      items.push({
        id: `project-${activeProject.id}`,
        label: activeProject.name || activeProject.videoTitle || "Current project",
        description: "Current project workspace",
        path: "/projects",
        kind: "project",
      })
    }

    const recentGeneration = listGenerationRecords().find((record) => record.status === "complete" && record.provider !== "mock")
    const recentTool = recentGeneration ? getSuperTool(recentGeneration.toolId) : undefined
    const publicSurfacePaths: Record<string, string> = {
      studio: "/studio",
      projects: "/projects",
      editor: "/editor",
      analytics: "/graphs",
      brain: "/ai-brain",
    }
    const generationPath = recentTool?.visibility === "public" ? publicSurfacePaths[recentTool.surface] : undefined
    if (recentGeneration && recentTool && generationPath) {
      items.push({
        id: `generation-${recentGeneration.id}`,
        label: recentTool.title,
        description: `Completed ${new Date(recentGeneration.updatedAt).toLocaleDateString()}`,
        path: generationPath,
        kind: "generation",
      })
    }

    return items
  }, [accountOpen, brain.activeProjectId, brain.projects])
  const shellLayout = mobile ? "mobile" : layout
  const isBrainWorkspace = location.pathname === "/ai-brain"

  const closeAccountMenu = (restoreFocus = false) => {
    setAccountOpen(false)
    if (restoreFocus) requestAnimationFrame(() => accountButtonRef.current?.focus())
  }

  const setLayout = (nextLayout: NavigationLayout) => {
    setLayoutState(nextLayout)
    closeAccountMenu()
    const label =
      nextLayout === "top" ? "Top bar"
      : nextLayout === "wide" ? "Wide sidebar"
      : nextLayout === "thin" ? "Thin sidebar"
      : "Icon rail"
    setAnnouncement(`${label} navigation active`)
  }
  // Toggle between the current sidebar mode and the collapsed "rail" mode —
  // one-tap way to reclaim the full-width viewport for the page content and
  // then bring the sidebar back at the same wideness.
  const previousSidebarLayoutRef = useRef<Extract<NavigationLayout, "wide" | "thin">>(
    layout === "wide" || layout === "thin" ? layout : "wide"
  )
  useEffect(() => {
    if (layout === "wide" || layout === "thin") previousSidebarLayoutRef.current = layout
  }, [layout])
  const toggleRail = () => {
    if (layout === "rail") {
      setLayout(previousSidebarLayoutRef.current)
    } else {
      // Only meaningful from a sidebar mode; from "top" this collapses the
      // top bar into a rail too (sidebar shell + icon-only column).
      setLayout("rail")
    }
  }

  const { shellRef, registerLink, registerControl, animateToSidebar, animateToTop } = useNavLayoutMorph({
    mainViewportRef,
    accountButtonRef,
    layout,
    setLayout,
  })

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
      if (target instanceof Element && target.closest('[data-state="open"]')) return
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
          ref={mobileDrawer ? undefined : registerLink(item.id)}
          onClick={() => {
            if (mobileDrawer) setDrawerOpen(false)
            closeAccountMenu()
          }}
          // Warm the target route's JS chunk on any signal of intent. Desktop
          // hover, mobile touchstart (fires ~100 ms before click on iOS), and
          // keyboard focus all count. By the time the user actually clicks,
          // the chunk is usually already parsed and the route mounts without
          // a Suspense fallback flash.
          onPointerEnter={() => prefetchRoute(item.path)}
          onTouchStart={() => prefetchRoute(item.path)}
          onFocus={() => prefetchRoute(item.path)}
          className="vt-adaptive-nav__link"
          style={{ "--vt-nav-color": getNavPaletteColor(item.paletteIndex) } as React.CSSProperties}
          title={item.label}
        >
          <NavIcon id={item.iconId} size={22} weight="fill" className="vt-adaptive-nav__icon" />
          <span className="vt-adaptive-nav__link-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )

  const renderLayoutControls = () => (
    <div ref={registerControl} className="vt-adaptive-nav__layout-controls" role="group" aria-label="Navigation layout">
      <button type="button" onClick={animateToTop} aria-label="Use top bar" title="Top bar">
        <PanelTop aria-hidden="true" />
      </button>
      {/* Rail toggle — one tap to collapse the sidebar to icon-only so the
          page reclaims full width; tapping again restores the previous
          wideness. Uses ChevronsLeft/Right so the button also indicates
          which direction it will move. */}
      <button
        type="button"
        onClick={toggleRail}
        aria-label={layout === "rail" ? "Expand navigation" : "Collapse to icon rail"}
        aria-pressed={layout === "rail"}
        title={layout === "rail" ? "Expand" : "Collapse to rail"}
      >
        {layout === "rail" ? <ChevronsRight aria-hidden="true" /> : <ChevronsLeft aria-hidden="true" />}
      </button>
    </div>
  )

  const accountTrigger = accountAuthenticated ? (
    <button
      ref={accountButtonRef}
      type="button"
      className="vt-adaptive-nav__account-trigger"
      onClick={() => {
        const willOpen = !accountOpen
        setAccountOpen(willOpen)
      }}
      aria-haspopup="dialog"
      aria-expanded={accountOpen}
      aria-controls="vt-adaptive-account-menu"
    >
      <span className="vt-adaptive-nav__avatar">
        {channelAvatar ? (
          <img src={channelAvatar} alt="" width="38" height="38" referrerPolicy="no-referrer" />
        ) : (
          (() => {
            // If we have a real name or an email, show initials from it. If
            // neither is available yet (still hydrating profile after login),
            // render a neutral person icon rather than fabricating "VA"
            // initials out of the "ViewTube Account" placeholder.
            const initials = accountInitials(channelName)
            return (
              <span className="grid size-[38px] place-items-center rounded-full border-[2px] border-black bg-white text-[10px] font-black uppercase tracking-[0.08em] shadow-[2px_2px_0_0_#000]">
                {initials || <UserRound className="size-5 opacity-70" aria-hidden="true" />}
              </span>
            )
          })()
        )}
      </span>
      <span className="vt-adaptive-nav__account-copy">
        <strong>{channelName}</strong>
        <span className="vt-adaptive-nav__account-meta">{accountMeta}</span>
        <span className="vt-adaptive-nav__auth-status">{syncLabel}</span>
      </span>
      <ChevronDown className="vt-adaptive-nav__account-chevron" aria-hidden="true" />
    </button>
  ) : (
    <button
      ref={accountButtonRef}
      type="button"
      className="vt-adaptive-nav__account-trigger vt-adaptive-nav__account-trigger--signup"
      onClick={() => {
        const willOpen = !accountOpen
        setAccountOpen(willOpen)
      }}
      aria-haspopup="dialog"
      aria-expanded={accountOpen}
      aria-controls="vt-adaptive-account-menu"
    >
      <span className="vt-adaptive-nav__avatar">
        <Sparkles aria-hidden="true" />
      </span>
      <span className="vt-adaptive-nav__account-copy">
        <strong>Join ViewTube</strong>
        <span className="vt-adaptive-nav__account-meta">Free Account Setup</span>
        <span className="vt-adaptive-nav__auth-status">Connect Channel</span>
      </span>
      <ChevronDown className="vt-adaptive-nav__account-chevron" aria-hidden="true" />
    </button>
  )

  const accountMenu = accountOpen ? (
    <ApplicationAccountMenu
      ref={accountMenuRef}
      avatarNode={channelAvatar ? (
        <img src={channelAvatar} alt="" width="38" height="38" referrerPolicy="no-referrer" />
      ) : (
        <span className="grid size-[38px] place-items-center rounded-full border-[2px] border-black bg-white text-[10px] font-black uppercase tracking-[0.08em] shadow-[2px_2px_0_0_#000]">
          {accountInitials(channelName) || <UserRound className="size-5 opacity-70" aria-hidden="true" />}
        </span>
      )}
      channelName={channelName}
      accountMeta={accountMeta}
      syncLabel={syncLabel}
      accountAuthenticated={accountAuthenticated}
      planLabel={label}
      creditsLabel={credits}
      creditPercent={creditPercent}
      channelSyncing={channelConnection.state === "syncing"}
      recentItems={applicationMenuRecentItems}
      canSeeApiKeys={canSeeApiKeys}
      onConnected={() => go("/account#workspace-data")}
      onLegacyAccountAction={onLegacyAccountAction}
      onOpenGeminiSettings={() => {
        closeAccountMenu()
        setGeminiSettingsOpen(true)
      }}
      onNavigate={go}
      onSignOut={onSignOut}
      onRequestClose={closeAccountMenu}
    />
  ) : null

  const logo = (
    <button type="button" className="vt-adaptive-nav__logo" onClick={() => navigate("/")} aria-label="Go to Dashboard">
      <span>View</span><span>Tube</span>
    </button>
  )

  return (
    <div className="vt-adaptive-shell" data-layout={shellLayout} ref={shellRef}>
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
              <button ref={registerControl} type="button" className="vt-adaptive-nav__enter-sidebar" onClick={animateToSidebar} aria-label="Use wide sidebar" title="Wide sidebar">
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
      {/* The custom scrollbar's ResizeObserver on the viewport is unnecessary
          on touch devices where the native scroller draws the thumb. Skipping
          it on mobile removes a permanent layout listener from data-heavy
          pages that was contributing to touch-scroll freezes. */}
      {!isBrainWorkspace && !mobile ? <ApplicationScrollbar viewportRef={mainViewportRef} /> : null}

      {location.pathname === "/" && !mobile && layout === "top" ? (
        <div className="vt-adaptive-legal"><a href="/privacy.html">Privacy Policy</a><span>|</span><a href="/terms.html">Terms of Service</a></div>
      ) : null}
      <span className="vt-adaptive-announcement" role="status" aria-live="polite">{announcement}</span>
      <GeminiKeySettings open={geminiSettingsOpen} onOpenChange={setGeminiSettingsOpen} />
    </div>
  )
}
