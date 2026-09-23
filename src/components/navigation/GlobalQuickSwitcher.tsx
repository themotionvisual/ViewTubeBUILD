import React, { useEffect, useMemo, useSyncExternalStore } from "react"
import { Clock3, CornerDownLeft, Search, Sparkles, Star, StarOff } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { DialogDescription, DialogTitle } from "../ui/dialog"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../ui/command"
import { useWorkspaceUxPreferences } from "../../hooks/useWorkspaceUxPreferences"
import {
  getRecentDestinationsServerSnapshot,
  quickSwitcherPages,
  readRecentDestinations,
  recordRecentDestination,
  resolveQuickSwitcherPage,
  subscribeRecentDestinations,
} from "../../services/recentDestinationHistory"
import {
  getPinnedDestinationsServerSnapshot,
  isDestinationPinned,
  readPinnedDestinations,
  subscribePinnedDestinations,
  togglePinnedDestination,
} from "../../services/pinnedDestinationStore"

export interface QuickSwitcherContextItem {
  id: string
  label: string
  description: string
  path: string
}

interface GlobalQuickSwitcherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contextItems?: readonly QuickSwitcherContextItem[]
}

const SECTION_LABELS: Record<string, string> = {
  studio: "Studio",
  analytics: "Analytics",
  vault: "Vault",
  account: "Account",
  editor: "Editor",
  reference: "Reference",
  system: "System",
  onboarding: "Onboarding",
  unclassified: "Other",
}

export const GlobalQuickSwitcher: React.FC<GlobalQuickSwitcherProps> = ({
  open,
  onOpenChange,
  contextItems = [],
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const preferences = useWorkspaceUxPreferences()
  const recent = useSyncExternalStore(
    subscribeRecentDestinations,
    readRecentDestinations,
    getRecentDestinationsServerSnapshot,
  )
  const pinnedPaths = useSyncExternalStore(
    subscribePinnedDestinations,
    readPinnedDestinations,
    getPinnedDestinationsServerSnapshot,
  )
  const pages = useMemo(() => quickSwitcherPages(), [])

  useEffect(() => {
    if (!preferences.globalQuickSwitcher || !preferences.rememberRecentDestinations) return
    recordRecentDestination(`${location.pathname}${location.search}${location.hash}`)
  }, [
    location.hash,
    location.pathname,
    location.search,
    preferences.globalQuickSwitcher,
    preferences.rememberRecentDestinations,
  ])

  useEffect(() => {
    if (!preferences.globalQuickSwitcher) {
      onOpenChange(false)
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) return
      if (event.code !== "KeyK") return
      event.preventDefault()
      onOpenChange(!open)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onOpenChange, open, preferences.globalQuickSwitcher])

  if (!preferences.globalQuickSwitcher) return null

  const go = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  const pinnedPathSet = new Set(pinnedPaths)
  const recentUnpinned = recent.filter((item) => !pinnedPathSet.has(item.path))
  const recentPaths = new Set(recentUnpinned.map((item) => item.path))
  const pinnedPages = pinnedPaths
    .map((path) => pages.find((page) => page.path === path))
    .filter((page): page is (typeof pages)[number] => Boolean(page))
  const currentPage = resolveQuickSwitcherPage(location.pathname)
  const currentPagePinned = currentPage ? isDestinationPinned(currentPage.path) : false

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">ViewTube Quick Switcher</DialogTitle>
      <DialogDescription className="sr-only">Search recent work and production ViewTube destinations.</DialogDescription>
      <div className="vt-quick-switcher">
        <div className="vt-quick-switcher__title">
          <span className="vt-quick-switcher__title-icon"><Search aria-hidden="true" /></span>
          <span>
            <strong>Quick Switcher</strong>
            <small>Jump anywhere in ViewTube</small>
          </span>
          <kbd>⌘/Ctrl K</kbd>
        </div>
        <CommandInput
          autoFocus
          placeholder="Search pages, tools, analytics, settings…"
          className="vt-quick-switcher__input"
        />
        <CommandList className="vt-quick-switcher__list">
          <CommandEmpty className="vt-quick-switcher__empty">No matching ViewTube destination.</CommandEmpty>

          {currentPage ? (
            <CommandGroup heading="Quick action" className="vt-quick-switcher__group">
              <CommandItem
                value={`${currentPagePinned ? "unpin" : "pin"} ${currentPage.title} favorite shortcut`}
                onSelect={() => togglePinnedDestination(currentPage.path)}
                className="vt-quick-switcher__item"
              >
                {currentPagePinned ? <StarOff aria-hidden="true" /> : <Star aria-hidden="true" />}
                <span>
                  <strong>{currentPagePinned ? "Unpin current page" : "Pin current page"}</strong>
                  <small>{currentPage.title}</small>
                </span>
              </CommandItem>
            </CommandGroup>
          ) : null}

          {pinnedPages.length ? (
            <CommandGroup heading="Pinned" className="vt-quick-switcher__group">
              {pinnedPages.map((page) => (
                <CommandItem
                  key={page.path}
                  value={`${page.title} ${SECTION_LABELS[page.section] || page.section} pinned favorite`}
                  onSelect={() => go(page.path)}
                  className="vt-quick-switcher__item"
                >
                  <Star aria-hidden="true" />
                  <span>
                    <strong>{page.title}</strong>
                    <small>{page.description || SECTION_LABELS[page.section] || page.section}</small>
                  </span>
                  <CommandShortcut><CornerDownLeft aria-hidden="true" /></CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {contextItems.length ? (
            <CommandGroup heading="Continue working" className="vt-quick-switcher__group">
              {contextItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.description}`}
                  onSelect={() => go(item.path)}
                  className="vt-quick-switcher__item"
                >
                  <Sparkles aria-hidden="true" />
                  <span><strong>{item.label}</strong><small>{item.description}</small></span>
                  <CommandShortcut><CornerDownLeft aria-hidden="true" /></CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {preferences.rememberRecentDestinations && recentUnpinned.length ? (
            <CommandGroup heading="Recent" className="vt-quick-switcher__group">
              {recentUnpinned.map((item) => (
                <CommandItem
                  key={item.path}
                  value={`${item.title} ${SECTION_LABELS[item.section] || item.section} recent`}
                  onSelect={() => go(item.path)}
                  className="vt-quick-switcher__item"
                >
                  <Clock3 aria-hidden="true" />
                  <span><strong>{item.title}</strong><small>{SECTION_LABELS[item.section] || item.section}</small></span>
                  <CommandShortcut><CornerDownLeft aria-hidden="true" /></CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          <CommandGroup heading="Destinations" className="vt-quick-switcher__group">
            {pages.filter((page) => !pinnedPathSet.has(page.path) && !recentPaths.has(page.path)).map((page) => (
              <CommandItem
                key={page.path}
                value={`${page.title} ${SECTION_LABELS[page.section] || page.section} ${page.description || ""}`}
                onSelect={() => go(page.path)}
                className="vt-quick-switcher__item"
              >
                <Search aria-hidden="true" />
                <span>
                  <strong>{page.title}</strong>
                  <small>{page.description || SECTION_LABELS[page.section] || page.section}</small>
                </span>
                <CommandShortcut><CornerDownLeft aria-hidden="true" /></CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  )
}
