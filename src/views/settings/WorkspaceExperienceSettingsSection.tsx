import React, { useSyncExternalStore } from "react"
import {
  ArrowLeftRight,
  Clock3,
  Command,
  Eraser,
  History,
  Keyboard,
  LayoutPanelTop,
  Navigation,
  PanelLeft,
  PanelTop,
  PanelsTopLeft,
  Save,
  Search,
  Smartphone,
  Star,
  StickyNote,
} from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxSegmentedToggle,
  SubToolboxSettingsSwitch,
} from "../../components/subtoolbox/SubToolboxPrimitives"
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
    description: "Keep more of the active tool visible.",
    icon: <PanelTop size={20} />,
  },
  {
    key: "mobileNavigationAutoHide",
    title: "Auto-hide mobile navigation",
    description: "Hide navigation while scrolling down; reveal it when scrolling up.",
    icon: <LayoutPanelTop size={20} />,
  },
  {
    key: "edgeSwipeNavigation",
    title: "Edge-swipe navigation",
    description: "Swipe from a screen edge to move between primary sections.",
    icon: <ArrowLeftRight size={20} />,
  },
  {
    key: "thumbZoneShortcuts",
    title: "Thumb-zone shortcuts",
    description: "Show compact previous, menu and next controls near the thumb zone.",
    icon: <Navigation size={20} />,
  },
]

const CONTINUITY_ITEMS: PreferenceItem[] = [
  {
    key: "preserveOrientationPosition",
    title: "Preserve position on rotation",
    description: "Keep the same visible module when portrait and landscape change.",
    icon: <Smartphone size={20} />,
  },
  {
    key: "preservePagePosition",
    title: "Remember page position",
    description: "Restore each page to the scroll position you left.",
    icon: <Save size={20} />,
  },
  {
    key: "stickyModuleHeaders",
    title: "Sticky module headers",
    description: "Keep toolbox headers reachable while long tools scroll.",
    icon: <StickyNote size={20} />,
  },
  {
    key: "keyboardPositionRestore",
    title: "Restore position after keyboard",
    description: "Return mobile workspaces to their pre-keyboard position.",
    icon: <Keyboard size={20} />,
  },
  {
    key: "rememberToolboxState",
    title: "Remember toolbox state",
    description: "Reopen toolboxes and subtoolboxes in their previous state.",
    icon: <PanelsTopLeft size={20} />,
  },
]

const DESKTOP_ITEMS: PreferenceItem[] = [
  {
    key: "restoreLastWorkspace",
    title: "Restore last workspace",
    description: "Return from Dashboard to the last creator workspace you used.",
    icon: <History size={20} />,
  },
  {
    key: "desktopKeyboardNavigation",
    title: "Desktop keyboard navigation",
    description: "Use Command/Ctrl + Shift + 1–8 for primary ViewTube sections.",
    icon: <Command size={20} />,
  },
]

const QUICK_SWITCHER_ITEMS: PreferenceItem[] = [
  {
    key: "globalQuickSwitcher",
    title: "Global quick switcher",
    description: "Open destination search anywhere with Command/Ctrl + K.",
    icon: <Search size={20} />,
  },
  {
    key: "rememberRecentDestinations",
    title: "Remember recent destinations",
    description: "Keep a short local history inside Quick Switcher.",
    icon: <Clock3 size={20} />,
  },
]

const NAV_LAYOUT_OPTIONS: Array<{ value: NavigationLayout; label: string }> = [
  { value: "top", label: "Top" },
  { value: "wide", label: "Wide" },
  { value: "thin", label: "Thin" },
  { value: "rail", label: "Rail" },
]

const PreferenceRow: React.FC<{
  item: PreferenceItem
  enabled: boolean
}> = ({ item, enabled }) => (
  <SubToolboxAlert
    level="l1"
    tone="info"
    icon={item.icon}
    title={item.title}
    detail={item.description}
    action={
      <SubToolboxSettingsSwitch
        level="l1"
        pressed={enabled}
        aria-label={`${enabled ? "Disable" : "Enable"} ${item.title}`}
        onClick={() => setWorkspaceUxToggle(item.key, !enabled)}
      />
    }
  />
)

const PreferenceRows: React.FC<{
  items: PreferenceItem[]
  values: ReturnType<typeof useWorkspaceUxPreferences>
}> = ({ items, values }) => (
  <SubToolboxStack density="dense">
    {items.map((item) => (
      <PreferenceRow key={item.key} item={item} enabled={values[item.key]} />
    ))}
  </SubToolboxStack>
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
    <div className="grid gap-3">
      <SubToolbox
        title="Mobile Navigation"
        icon={<Smartphone />}
        paletteIndex={4}
        collapsible
        isOpenInitial
        persistenceId="settings-experience-mobile-navigation"
        helpText="Phone navigation controls that save screen space without changing projects or data."
      >
        <PreferenceRows items={MOBILE_ITEMS} values={preferences} />
      </SubToolbox>

      <SubToolbox
        title="Workspace Continuity"
        icon={<Save />}
        paletteIndex={5}
        collapsible
        isOpenInitial
        persistenceId="settings-experience-continuity"
        helpText="Choose which parts of the workspace remember position, focus and open state."
      >
        <PreferenceRows items={CONTINUITY_ITEMS} values={preferences} />
      </SubToolbox>

      <SubToolbox
        title="Desktop Navigation"
        icon={<PanelLeft />}
        paletteIndex={6}
        collapsible
        isOpenInitial
        persistenceId="settings-experience-desktop-navigation"
        helpText="Choose the desktop navigation arrangement and optional keyboard behavior."
      >
        <SubToolboxStack density="dense">
          <SubToolboxSegmentedToggle
            level="l1"
            ariaLabel="Desktop navigation layout"
            value={navigationLayout}
            options={NAV_LAYOUT_OPTIONS}
            onValueChange={(value) => setNavigationLayoutPreference(value as NavigationLayout)}
            style={{ ["--vt-segment-count" as string]: NAV_LAYOUT_OPTIONS.length } as React.CSSProperties}
          />
          <PreferenceRows items={DESKTOP_ITEMS} values={preferences} />
        </SubToolboxStack>
      </SubToolbox>

      <SubToolbox
        title="Quick Switcher"
        icon={<Search />}
        paletteIndex={7}
        collapsible
        isOpenInitial
        persistenceId="settings-experience-quick-switcher"
        helpText="Control global destination search plus its local recent and pinned convenience data."
      >
        <SubToolboxStack density="dense">
          <PreferenceRows items={QUICK_SWITCHER_ITEMS} values={preferences} />
          <SubToolboxAlert
            level="l1"
            tone="warning"
            icon={<Eraser size={20} />}
            title="Clear recent history"
            detail={`${recentDestinations.length} recent destination${recentDestinations.length === 1 ? "" : "s"} stored locally.`}
            action={
              <SubToolboxButton
                level="l2"
                size="compact"
                tone="warning"
                disabled={!recentDestinations.length}
                onClick={clearRecentDestinations}
              >
                Clear
              </SubToolboxButton>
            }
          />
          <SubToolboxAlert
            level="l1"
            tone="warning"
            icon={<Star size={20} />}
            title="Clear pinned destinations"
            detail={`${pinnedDestinations.length} pinned destination${pinnedDestinations.length === 1 ? "" : "s"} stored locally.`}
            action={
              <SubToolboxButton
                level="l2"
                size="compact"
                tone="warning"
                disabled={!pinnedDestinations.length}
                onClick={clearPinnedDestinations}
              >
                Clear
              </SubToolboxButton>
            }
          />
        </SubToolboxStack>
      </SubToolbox>
    </div>
  )
}
