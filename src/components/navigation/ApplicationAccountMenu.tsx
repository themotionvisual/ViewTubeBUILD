import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  CircleUserRound,
  Clapperboard,
  CreditCard,
  FileClock,
  ListChecks,
  FlaskConical,
  FolderKanban,
  Info,
  KeyRound,
  LineChart,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react"
import { AccountActionButton } from "../account/AccountActionButton"
import {
  APPLICATION_MENU_DESTINATIONS,
  APPLICATION_MENU_GROUPS,
  searchApplicationMenuDestinations,
  type ApplicationMenuDestination,
  type ApplicationMenuIconId,
} from "./applicationMenuContract"

export interface ApplicationMenuRecentItem {
  id: string
  label: string
  description: string
  path: string
  kind: "project" | "generation"
}

interface ApplicationAccountMenuProps {
  avatarNode: React.ReactNode
  channelName: string
  accountMeta: string
  syncLabel: string
  accountAuthenticated: boolean
  planLabel: string
  creditsLabel: string
  creditPercent: number
  channelSyncing: boolean
  recentItems: readonly ApplicationMenuRecentItem[]
  canSeeApiKeys: boolean
  onConnected: () => void
  onLegacyAccountAction: () => void | Promise<void>
  onOpenGeminiSettings: () => void
  onNavigate: (path: string) => void
  onSignOut: () => void | Promise<void>
  onRequestClose: (restoreFocus?: boolean) => void
}

const iconById: Record<ApplicationMenuIconId, React.ComponentType<{ "aria-hidden"?: boolean }>> = {
  studio: WandSparkles,
  projects: FolderKanban,
  editor: Clapperboard,
  analytics: BarChart3,
  brain: Bot,
  research: FlaskConical,
  graphs: LineChart,
  account: CircleUserRound,
  billing: CreditCard,
  access: ListChecks,
  settings: Settings,
  privacy: ShieldCheck,
  integrations: KeyRound,
  guide: BookOpen,
  about: Info,
}

const matchesRecentItem = (item: ApplicationMenuRecentItem, query: string): boolean => {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const text = `${item.label} ${item.description}`.toLocaleLowerCase()
  return terms.every((term) => text.includes(term))
}

export const ApplicationAccountMenu = forwardRef<HTMLDivElement, ApplicationAccountMenuProps>(({
  avatarNode,
  channelName,
  accountMeta,
  syncLabel,
  accountAuthenticated,
  planLabel,
  creditsLabel,
  creditPercent,
  channelSyncing,
  recentItems,
  canSeeApiKeys,
  onConnected,
  onLegacyAccountAction,
  onOpenGeminiSettings,
  onNavigate,
  onSignOut,
  onRequestClose,
}, forwardedRef) => {
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement | null>(null)
  const normalizedQuery = query.trim()
  const filteredDestinations = useMemo(
    () => searchApplicationMenuDestinations(query),
    [query],
  )
  const filteredRecentItems = useMemo(
    () => recentItems.filter((item) => matchesRecentItem(item, query)),
    [query, recentItems],
  )
  const visibleResultCount = filteredDestinations.length + filteredRecentItems.length

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  const renderDestination = (destination: ApplicationMenuDestination) => {
    const Icon = iconById[destination.icon]
    const content = (
      <>
        <span className="vt-application-menu__destination-icon"><Icon aria-hidden /></span>
        <span className="vt-application-menu__destination-copy">
          <strong>{destination.label}</strong>
          <small>{destination.description}</small>
        </span>
        <ChevronRight aria-hidden className="vt-application-menu__destination-arrow" />
      </>
    )

    if (destination.action === "gemini-settings") {
      return (
        <button key={destination.id} type="button" className="vt-application-menu__destination" onClick={onOpenGeminiSettings}>
          {content}
        </button>
      )
    }

    return (
      <button
        key={destination.id}
        type="button"
        className="vt-application-menu__destination"
        onClick={() => destination.path && onNavigate(destination.path)}
      >
        {content}
      </button>
    )
  }

  const renderRecentItem = (item: ApplicationMenuRecentItem) => (
    <button
      key={item.id}
      type="button"
      className="vt-application-menu__destination vt-application-menu__destination--recent"
      onClick={() => onNavigate(item.path)}
    >
      <span className="vt-application-menu__destination-icon">
        {item.kind === "project" ? <FolderKanban aria-hidden /> : <FileClock aria-hidden />}
      </span>
      <span className="vt-application-menu__destination-copy">
        <strong>{item.label}</strong>
        <small>{item.description}</small>
      </span>
      <ChevronRight aria-hidden className="vt-application-menu__destination-arrow" />
    </button>
  )

  return (
    <div
      ref={forwardedRef}
      id="vt-adaptive-account-menu"
      className="vt-adaptive-nav__account-menu vt-application-menu"
      role="dialog"
      aria-modal="false"
      aria-labelledby="vt-application-menu-title"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return
        event.preventDefault()
        onRequestClose(true)
      }}
    >
      <h2 id="vt-application-menu-title" className="sr-only">ViewTube application and account menu</h2>

      <section className="vt-adaptive-nav__menu-status" aria-label="Channel and account status">
        <span className="vt-adaptive-nav__avatar">{avatarNode}</span>
        <span>
          <strong>{channelName}</strong>
          <small>{accountAuthenticated ? `${accountMeta} | ${syncLabel}` : "Connect your channel to personalize ViewTube"}</small>
        </span>
        <span className="vt-adaptive-nav__menu-meter">
          <b>{planLabel} · {creditsLabel}</b>
          <i aria-hidden><i style={{ width: `${creditPercent}%` }} /></i>
        </span>
      </section>

      <AccountActionButton
        surface="topbar"
        channelSyncing={channelSyncing}
        onConnected={onConnected}
        onLegacyAction={onLegacyAccountAction}
        className="vt-adaptive-nav__connect-action"
      />

      <div className="vt-application-menu__search" role="search">
        <Search aria-hidden />
        <label htmlFor="vt-application-menu-search" className="sr-only">Search ViewTube destinations</label>
        <input
          ref={searchRef}
          id="vt-application-menu-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ViewTube…"
          autoComplete="off"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear destination search">
            <X aria-hidden />
          </button>
        ) : null}
      </div>

      <span className="sr-only" aria-live="polite">
        {normalizedQuery ? `${visibleResultCount} destination${visibleResultCount === 1 ? "" : "s"} found` : ""}
      </span>

      <div className="vt-application-menu__scroll-region">
        {normalizedQuery ? (
          <section className="vt-application-menu__group" style={{ "--vt-menu-accent": "#36e0f6" } as React.CSSProperties} aria-labelledby="vt-menu-search-results">
            <h3 id="vt-menu-search-results">Search results</h3>
            {filteredRecentItems.map(renderRecentItem)}
            {filteredDestinations.map(renderDestination)}
            {!visibleResultCount ? (
              <div className="vt-application-menu__empty">
                <Search aria-hidden />
                <strong>No destination found</strong>
                <span>Try a tool, workflow, metric, or account setting.</span>
              </div>
            ) : null}
          </section>
        ) : (
          <>
            {recentItems.length ? (
              <section className="vt-application-menu__group" style={{ "--vt-menu-accent": "#b14aed" } as React.CSSProperties} aria-labelledby="vt-menu-continue">
                <h3 id="vt-menu-continue">Continue Working</h3>
                {recentItems.map(renderRecentItem)}
              </section>
            ) : null}

            {APPLICATION_MENU_GROUPS.map((group) => {
              const destinations = APPLICATION_MENU_DESTINATIONS.filter((destination) => destination.group === group.id)
              return (
                <nav
                  key={group.id}
                  className="vt-application-menu__group"
                  style={{ "--vt-menu-accent": group.accent } as React.CSSProperties}
                  aria-labelledby={`vt-menu-group-${group.id}`}
                >
                  <h3 id={`vt-menu-group-${group.id}`}>{group.label}</h3>
                  {destinations.map(renderDestination)}
                  {group.id === "account" && canSeeApiKeys ? (
                    <button type="button" className="vt-application-menu__destination" onClick={() => onNavigate("/account")}>
                      <span className="vt-application-menu__destination-icon"><KeyRound aria-hidden /></span>
                      <span className="vt-application-menu__destination-copy"><strong>API Keys</strong><small>Manage developer access keys</small></span>
                      <ChevronRight aria-hidden className="vt-application-menu__destination-arrow" />
                    </button>
                  ) : null}
                </nav>
              )
            })}
          </>
        )}
      </div>

      {accountAuthenticated ? (
        <button type="button" className="vt-adaptive-nav__sign-out" onClick={() => void onSignOut()}>
          <LogOut aria-hidden /> Sign Out
        </button>
      ) : (
        <div className="vt-application-menu__signed-out-note"><Sparkles aria-hidden /> Connect a channel to unlock personalized work shortcuts.</div>
      )}
    </div>
  )
})

ApplicationAccountMenu.displayName = "ApplicationAccountMenu"
