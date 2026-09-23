import React from "react"
import {
  ArrowLeftRight,
  Clock3,
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

  return (
    <div className="grid gap-6">
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
