import React, { useSyncExternalStore } from "react"
import {
  ArrowLeftRight,
  Clock3,
  Eraser,
  PanelLeft,
  PanelTop,
  Star,
  Command,
  History,
  Keyboard,
  LayoutPanelTop,
  Navigation,
  PanelTopClose,
  PanelsTopLeft,
  Save,
  Search,
  Smartphone,
  StickyNote,
} from "lucide-react"
import { useWorkspaceUxPreferences } from "../../hooks/useWorkspaceUxPreferences"
import {
  setWorkspaceUxToggle,
  type WorkspaceUxToggleKey,
} from "../../services/workspaceUxPreferences"
import {
  getNavigationLayout,
  getNavigationLayoutServerSnapshot,
  setNavigationLayoutPreference,
  subscribeNavigationLayout,
  type NavigationLayout,
} from "../../components/navigation/navigationContract"
import {
  clearRecentDestinations,
  getRecentDestinationsServerSnapshot,
  readRecentDestinations,
  subscribeRecentDestinations,
} from "../../services/recentDestinationHistory"
import {
  clearPinnedDestinations,
  getPinnedDestinationsServerSnapshot,
  readPinnedDestinations,
  subscribePinnedDestinations,
} from "../../services/pinnedDestinationStore"

type PreferenceItem = {
  key: WorkspaceUxToggleKey
  title: string
  description: string
  icon: React.ReactNode
}

const MOBILE_ITEMS: PreferenceItem[] = [
  {
    key: "mobileCompactTopBar",
    title: "Compact mobile top bar",
    description: "Uses the shorter mobile navigation bar so more of the active tool stays visible.",
    icon: <PanelTopClose size={21} />,
  },
  {
    key: "mobileNavigationAutoHide",
    title: "Auto-hide mobile navigation",
    description: "Hides the top navigation while scrolling down and reveals it when scrolling back up.",
    icon: <LayoutPanelTop size={21} />,
  },
  {
    key: "edgeSwipeNavigation",
    title: "Edge-swipe navigation",
    description: "Swipe inward from the left or right screen edge to move between primary ViewTube sections.",
    icon: <ArrowLeftRight size={21} />,
  },
  {
    key: "thumbZoneShortcuts",
    title: "Thumb-zone shortcuts",
    description: "Shows a compact bottom control for previous section, navigation menu, and next section.",
    icon: <Navigation size={21} />,
  },
]

const CONTINUITY_ITEMS: PreferenceItem[] = [
  {
    key: "preserveOrientationPosition",
    title: "Preserve position on rotation",
    description: "Keeps the same visible module in view when switching between portrait and landscape.",
    icon: <Smartphone size={21} />,
  },
  {
    key: "preservePagePosition",
    title: "Remember page position",
    description: "Each page remembers its own scroll position when you leave and return.",
    icon: <Save size={21} />,
  },
  {
    key: "stickyModuleHeaders",
    title: "Sticky module headers",
    description: "Keeps toolbox and subtoolbox headers reachable while scrolling through long tools.",
    icon: <StickyNote size={21} />,
  },
  {
    key: "keyboardPositionRestore",
    title: "Restore position after keyboard",
    description: "On mobile, closing the on-screen keyboard returns the workspace to its pre-keyboard position.",
    icon: <Keyboard size={21} />,
  },
  {
    key: "rememberToolboxState",
    title: "Remember toolbox state",
    description: "Toolboxes and subtoolboxes reopen in the same expanded or collapsed state you left them.",
    icon: <PanelsTopLeft size={21} />,
  },
]

const DESKTOP_ITEMS: PreferenceItem[] = [
  {
    key: "globalQuickSwitcher",
    title: "Global quick switcher",
    description: "Show the global destination launcher and open it anywhere with Command/Ctrl + K.",
    icon: <Search size={21} />,
  },
  {
    key: "rememberRecentDestinations",
    title: "Remember recent destinations",
    description: "Keep a short local history of recently opened ViewTube pages inside the quick switcher.",
    icon: <Clock3 size={21} />,
  },
  {
    key: "restoreLastWorkspace",
    title: "Restore last workspace",
    description: "When ViewTube opens at the Dashboard, return to the last Studio, Projects, Brain, Analytics, or Editor workspace you were using.",
    icon: <History size={21} />,
  },
  {
    key: "desktopKeyboardNavigation",
    title: "Desktop keyboard navigation",
    description: "Use Command/Ctrl + Shift + 1–8 to jump directly between ViewTube's primary sections.",
    icon: <Command size={21} />,
  },
]

const NAV_LAYOUT_OPTIONS: Array<{
  value: NavigationLayout
  label: string
  description: string
  icon: React.ReactNode
}> = [
  {
    value: "top",
    label: "Top Bar",
    description: "Horizontal navigation across the top.",
    icon: <PanelTop size={22} />,
  },
  {
    value: "wide",
    label: "Wide Sidebar",
    description: "Full sidebar with labels and account controls.",
    icon: <PanelLeft size={22} />,
  },
  {
    value: "thin",
    label: "Thin Sidebar",
    description: "Narrower labeled sidebar for more canvas room.",
    icon: <PanelsTopLeft size={22} />,
  },
  {
    value: "rail",
    label: "Icon Rail",
    description: "Compact icon-only rail with maximum workspace width.",
    icon: <Navigation size={22} />,
  },
]

const NavigationLayoutPreference: React.FC<{ value: NavigationLayout }> = ({ value }) => (
  <section className="overflow-hidden rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0_0_#36E0F6]">
    <header className="border-b-[4px] border-black bg-[#36E0F6] p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-black/60">Desktop navigation</p>
      <h2 className="mt-1 text-3xl font-[1000] uppercase tracking-[-0.05em]">Navigation layout</h2>
      <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-black/65">
        Choose the desktop navigation arrangement ViewTube should use. Changes apply immediately and persist for future sessions.
      </p>
    </header>
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 md:p-5">
      {NAV_LAYOUT_OPTIONS.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => setNavigationLayoutPreference(option.value)}
            className={`grid min-h-[118px] grid-cols-[42px_minmax(0,1fr)] items-start gap-3 rounded-xl border-[3px] border-black p-3 text-left shadow-[3px_3px_0_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 ${selected ? "bg-[#CCFF00]" : "bg-white"}`}
          >
            <span className="grid size-[42px] place-items-center rounded-lg border-[3px] border-black bg-white" aria-hidden="true">
              {option.icon}
            </span>
            <span className="min-w-0">
              <strong className="block text-sm font-[1000] uppercase tracking-[-0.03em]">{option.label}</strong>
              <span className="mt-1 block text-xs font-bold leading-5 text-black/60">{option.description}</span>
              <span className="mt-3 inline-block rounded-md border-2 border-black bg-white px-2 py-1 text-[9px] font-black uppercase">
                {selected ? "Current" : "Use layout"}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  </section>
)

const NavigationDataControls: React.FC<{
  recentCount: number
  pinnedCount: number
}> = ({ recentCount, pinnedCount }) => (
  <section className="overflow-hidden rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0_0_#FFDA47]">
    <header className="border-b-[4px] border-black bg-[#FFDA47] p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-black/60">Navigation data</p>
      <h2 className="mt-1 text-3xl font-[1000] uppercase tracking-[-0.05em]">Recent + pinned</h2>
      <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-black/65">
        Manage only the local convenience data used by the Quick Switcher. These actions do not affect projects, account data, or analytics.
      </p>
    </header>
    <div className="grid gap-3 p-4 md:grid-cols-2 md:p-5">
      <button
        type="button"
        disabled={!recentCount}
        onClick={clearRecentDestinations}
        className="grid min-h-[92px] grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border-[3px] border-black bg-white p-3 text-left shadow-[3px_3px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="grid size-11 place-items-center rounded-lg border-[3px] border-black bg-[#f3f4f6]" aria-hidden="true"><Eraser size={21} /></span>
        <span>
          <strong className="block text-sm font-[1000] uppercase">Clear recent history</strong>
          <span className="mt-1 block text-xs font-bold text-black/60">Remove recently opened destinations from Quick Switcher.</span>
        </span>
        <span className="rounded-md border-2 border-black px-2 py-1 text-[10px] font-black">{recentCount}</span>
      </button>
      <button
        type="button"
        disabled={!pinnedCount}
        onClick={clearPinnedDestinations}
        className="grid min-h-[92px] grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border-[3px] border-black bg-white p-3 text-left shadow-[3px_3px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="grid size-11 place-items-center rounded-lg border-[3px] border-black bg-[#f3f4f6]" aria-hidden="true"><Star size={21} /></span>
        <span>
          <strong className="block text-sm font-[1000] uppercase">Clear pinned destinations</strong>
          <span className="mt-1 block text-xs font-bold text-black/60">Remove all Quick Switcher favorites; pages themselves are unchanged.</span>
        </span>
        <span className="rounded-md border-2 border-black px-2 py-1 text-[10px] font-black">{pinnedCount}</span>
      </button>
    </div>
  </section>
)

const ToggleRow: React.FC<{ item: PreferenceItem; enabled: boolean }> = ({ item, enabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={() => setWorkspaceUxToggle(item.key, !enabled)}
    className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border-[3px] border-black bg-white p-3 text-left shadow-[3px_3px_0_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2"
  >
    <span className="grid size-11 place-items-center rounded-lg border-[3px] border-black bg-[#f3f4f6]" aria-hidden="true">
      {item.icon}
    </span>
    <span className="min-w-0">
      <strong className="block text-sm font-[1000] uppercase tracking-[-0.02em]">{item.title}</strong>
      <span className="mt-1 block text-xs font-bold leading-5 text-black/60">{item.description}</span>
    </span>
    <span
      className={`relative h-8 w-14 rounded-full border-[3px] border-black transition-colors ${enabled ? "bg-[#CCFF00]" : "bg-[#e6e8ec]"}`}
      aria-hidden="true"
    >
      <span className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full border-[2px] border-black bg-white transition-[left] ${enabled ? "left-7" : "left-1"}`} />
    </span>
  </button>
)

const PreferenceGroup: React.FC<{
  eyebrow: string
  title: string
  description: string
  accent: string
  items: PreferenceItem[]
  values: ReturnType<typeof useWorkspaceUxPreferences>
}> = ({ eyebrow, title, description, accent, items, values }) => (
  <section className="overflow-hidden rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0_0_var(--vt-settings-accent)]" style={{ "--vt-settings-accent": accent } as React.CSSProperties}>
    <header className="border-b-[4px] border-black p-5" style={{ backgroundColor: accent }}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-black/60">{eyebrow}</p>
      <h2 className="mt-1 text-3xl font-[1000] uppercase tracking-[-0.05em]">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-black/65">{description}</p>
    </header>
    <div className="grid gap-3 p-4 md:p-5">
      {items.map((item) => (
        <ToggleRow key={item.key} item={item} enabled={values[item.key]} />
      ))}
    </div>
  </section>
)

export const WorkspaceExperienceSettingsSection: React.FC = () => {
  const preferences = useWorkspaceUxPreferences()
  const navigationLayout = useSyncExternalStore(
    subscribeNavigationLayout,
    getNavigationLayout,
    getNavigationLayoutServerSnapshot,
  )
  const recentDestinations = useSyncExternalStore(
    subscribeRecentDestinations,
    readRecentDestinations,
    getRecentDestinationsServerSnapshot,
  )
  const pinnedDestinations = useSyncExternalStore(
    subscribePinnedDestinations,
    readPinnedDestinations,
    getPinnedDestinationsServerSnapshot,
  )

  return (
    <div className="grid gap-6">
      <NavigationLayoutPreference value={navigationLayout} />
      <NavigationDataControls
        recentCount={recentDestinations.length}
        pinnedCount={pinnedDestinations.length}
      />
      <PreferenceGroup
        eyebrow="Mobile behavior"
        title="Mobile navigation"
        description="Control how ViewTube uses limited phone space. These options change navigation behavior without changing your projects or data."
        accent="#40C6E9"
        items={MOBILE_ITEMS}
        values={preferences}
      />
      <PreferenceGroup
        eyebrow="Workspace continuity"
        title="Position + focus"
        description="Choose which parts of the workspace remember where you were as you rotate, navigate, type, and move between tools."
        accent="#CCFF00"
        items={CONTINUITY_ITEMS}
        values={preferences}
      />
      <PreferenceGroup
        eyebrow="Desktop behavior"
        title="Fast navigation"
        description="Optional shortcuts that make returning to work and moving around ViewTube faster on a keyboard-and-pointer setup."
        accent="#FF83EA"
        items={DESKTOP_ITEMS}
        values={preferences}
      />
    </div>
  )
}
