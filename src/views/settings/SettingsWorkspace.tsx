import React from "react"
import {
  Bot,
  CircleUserRound,
  CreditCard,
  Database,
  LayoutDashboard,
  LayoutGrid,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import {
  SubToolboxSelectableListRow,
  SubToolboxStatusBadge,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import {
  SubToolboxSplitDropdown,
  type SubToolboxSplitDropdownOption,
} from "../../components/subtoolbox/SubToolboxSplitPrimitives"
import { useWorkspaceUxPreferences } from "../../hooks/useWorkspaceUxPreferences"
import type { SettingsPanel, SettingsReadiness } from "./settingsControlDeck"
import {
  SETTINGS_PANEL_DEFINITIONS,
  getSettingsPanelDefinition,
} from "./settingsWorkspaceModel"

const PANEL_ICONS: Record<SettingsPanel, React.ReactNode> = {
  overview: <LayoutDashboard size={18} />,
  account: <CircleUserRound size={18} />,
  ai: <Bot size={18} />,
  widgets: <LayoutGrid size={18} />,
  experience: <SlidersHorizontal size={18} />,
  billing: <CreditCard size={18} />,
  data: <Database size={18} />,
  help: <ShieldCheck size={18} />,
}

export const getSettingsWorkspaceBottomPadding = (thumbZoneShortcuts: boolean): string =>
  thumbZoneShortcuts ? "pb-4 sm:pb-5 max-[760px]:pb-20" : "pb-4 sm:pb-5"

export interface SettingsWorkspaceProps {
  activePanel: SettingsPanel
  readiness: SettingsReadiness
  onPanelChange: (panel: SettingsPanel) => void
  children: React.ReactNode
}

export const SettingsWorkspace: React.FC<SettingsWorkspaceProps> = ({
  activePanel,
  readiness,
  onPanelChange,
  children,
}) => {
  const workspaceUx = useWorkspaceUxPreferences()
  const activeDefinition = getSettingsPanelDefinition(activePanel)
  const mobileOptions: SubToolboxSplitDropdownOption[] = SETTINGS_PANEL_DEFINITIONS.map((panel) => ({
    value: panel.id,
    label: panel.label,
    icon: PANEL_ICONS[panel.id],
  }))

  return (
    <div
      data-vt-settings-workspace="true"
      className={`mx-auto w-full max-w-[1680px] min-w-0 px-2 sm:px-3 lg:px-4 ${getSettingsWorkspaceBottomPadding(workspaceUx.thumbZoneShortcuts)}`}
    >
      <header className="sticky top-0 z-30 mb-2 flex min-h-14 items-center gap-3 bg-white py-1">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center bg-[#FF83EA]"
        >
          <SettingsIcon size={26} strokeWidth={3} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-[1000] uppercase leading-none tracking-[-0.04em]">
            Settings
          </h1>
          <p className="mt-1 hidden truncate text-[10px] font-black uppercase tracking-[0.08em] text-black/55 sm:block">
            {readiness.nextLabel}
          </p>
        </div>
        <SubToolboxStatusBadge level="l2">
          {readiness.completed}/{readiness.items.length} ready
        </SubToolboxStatusBadge>
      </header>

      <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="hidden min-w-0 xl:sticky xl:top-[64px] xl:block">
          <nav aria-label="Settings sections" className="grid gap-1">
            {SETTINGS_PANEL_DEFINITIONS.map((panel) => {
              const active = panel.id === activePanel
              return (
                <SubToolboxSelectableListRow
                  key={panel.id}
                  level="l1"
                  title={panel.label}
                  leading={PANEL_ICONS[panel.id]}
                  selected={active}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onPanelChange(panel.id)}
                />
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="sticky top-[56px] z-20 mb-2 bg-white py-1 xl:hidden">
            <SubToolboxSplitDropdown
              level="l1"
              ariaLabel="Settings sections"
              value={activePanel}
              options={mobileOptions}
              icon={PANEL_ICONS[activePanel]}
              onChange={(value) => onPanelChange(value as SettingsPanel)}
            />
          </div>

          <section
            id={`settings-panel-${activePanel}`}
            aria-label={`${activeDefinition.label} settings`}
            tabIndex={-1}
            className="min-w-0 space-y-3"
          >
            {children}
          </section>
        </div>
      </div>
    </div>
  )
}
