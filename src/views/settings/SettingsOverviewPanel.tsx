import React from "react"
import { ArrowRight, CircleUserRound, CreditCard, Database, Gauge } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxGrid, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxMetricStrip,
  SubToolboxSelectableListRow,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import type { SettingsPanel } from "./settingsControlDeck"
import type { SettingsOverviewModel } from "./settingsWorkspaceModel"

export interface SettingsOverviewPanelProps {
  model: SettingsOverviewModel
  onPanelChange: (panel: SettingsPanel) => void
}

export const SettingsOverviewPanel: React.FC<SettingsOverviewPanelProps> = ({
  model,
  onPanelChange,
}) => (
  <div className="grid gap-3">
    <SubToolbox
      title="System Readiness"
      icon={<Gauge />}
      paletteIndex={0}
      collapsible
      isOpenInitial
      persistenceId="settings-overview-readiness"
      helpText="Account, YouTube, billing and Creator Brain readiness."
    >
      <SubToolboxStack density="dense">
        <SubToolboxMetricStrip
          level="l1"
          aria-label="Settings readiness"
          items={model.readiness.items.map((item) => ({
            label: item.label,
            value: item.state,
          }))}
        />
        <SubToolboxAlert
          level="l1"
          tone={model.readiness.nextPanel === "overview" ? "success" : "info"}
          icon={<ArrowRight size={18} />}
          title={model.readiness.nextLabel}
          detail={
            model.readiness.nextPanel === "overview"
              ? "All creator systems are ready."
              : "Open the control that needs attention."
          }
          action={
            model.readiness.nextPanel === "overview" ? undefined : (
              <SubToolboxButton
                level="l2"
                size="compact"
                tone="accent"
                onClick={() => onPanelChange(model.readiness.nextPanel)}
              >
                Open
              </SubToolboxButton>
            )
          }
        />
      </SubToolboxStack>
    </SubToolbox>

    <SubToolbox
      title="Workspace Summary"
      icon={<CircleUserRound />}
      paletteIndex={1}
      collapsible
      isOpenInitial
      persistenceId="settings-overview-summary"
      helpText="Jump directly to the creator, billing or data control that owns each value."
    >
      <SubToolboxGrid minItemWidth="standard" density="dense">
        <SubToolboxSelectableListRow
          level="l1"
          title={model.identity.title}
          detail={model.identity.detail}
          leading={<CircleUserRound size={18} />}
          trailing="Account"
          onClick={() => onPanelChange("account")}
        />
        <SubToolboxSelectableListRow
          level="l1"
          title={model.plan.title}
          detail={model.plan.detail}
          leading={<CreditCard size={18} />}
          trailing="Plan"
          onClick={() => onPanelChange("billing")}
        />
        <SubToolboxSelectableListRow
          level="l1"
          title={model.data.title}
          detail={model.data.detail}
          leading={<Database size={18} />}
          trailing="Data"
          onClick={() => onPanelChange("data")}
        />
      </SubToolboxGrid>
    </SubToolbox>
  </div>
)
