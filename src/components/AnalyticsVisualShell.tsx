import React from "react"
import { BarChart3 } from "lucide-react"
import { ChartModule, type ChartModuleProps } from "./DataVisuals/ChartModule"
import type { SubToolboxChartModuleProps } from "./SubToolboxChartModule"
import type { ControllerRow } from "./VisualModuleController"
import { AnalyticsVisualIcon } from "./AnalyticsVisualIcon"
import { UnifiedAnalyticsVisualModule } from "./UnifiedAnalyticsVisualModule"
import type {
  VtSyncVisualCanvasFitMode,
  VtSyncVisualHeaderColorPair,
} from "../features/vt-sync-local/shell/VtSyncVisualFrame"

export type AnalyticsVisualShellMode = "standard" | "vt2-preserved" | "compact-row"

export type VisualControllerSpec = {
  rows: readonly ControllerRow[]
  width?: number
  density?: "normal" | "compact"
  denseLegacy?: boolean
}

export type AnalyticsVisualShellProps = React.PropsWithChildren<{
  shellMode: AnalyticsVisualShellMode
  title: string
  subtitle?: string
  iconKey?: string
  icon?: React.ReactNode
  headerColorPair: VtSyncVisualHeaderColorPair
  controllerSpec?: VisualControllerSpec
  controllerExplanation?: string
  activeContext?: SubToolboxChartModuleProps["activeContext"]
  canvasFitMode?: VtSyncVisualCanvasFitMode
  sourceTableIds?: readonly string[]
  standard?: Omit<SubToolboxChartModuleProps, "header" | "controllerRows" | "controllerWidth" | "controllerDensity" | "activeContext" | "children">
  vt2?: Omit<ChartModuleProps, "title" | "subtitle" | "icon" | "iconBg" | "titleBg" | "bodyFitMode" | "children">
}>

const iconNode = (icon: React.ReactNode | undefined, iconKey: string | undefined): React.ReactNode => {
  if (icon) return icon
  if (iconKey) return <AnalyticsVisualIcon iconKey={iconKey} size={60} />
  return <BarChart3 size={60} strokeWidth={3} />
}

const normalizedRows = (
  controllerSpec: VisualControllerSpec | undefined,
  controllerExplanation: string | undefined,
): readonly ControllerRow[] | undefined => {
  const rows = controllerSpec?.rows ?? []
  const orderedRows = [
    ...rows.filter((row) => row.type !== "dropdown" && row.type !== "metricMultiSelect" && row.type !== "rankedBy"),
    ...rows.filter((row) => row.type === "dropdown" || row.type === "metricMultiSelect" || row.type === "rankedBy"),
  ]
  if (!controllerExplanation) return orderedRows.length > 0 ? orderedRows : undefined
  const hasStatement = orderedRows.some((row) => row.type === "statement")
  const nextRows = hasStatement
    ? orderedRows
    : [
        {
          type: "statement" as const,
          value: controllerExplanation,
          bgTone: "#000000",
          fgTone: "#CCFF00",
        },
        ...orderedRows,
      ]
  return nextRows.slice(0, controllerSpec?.denseLegacy ? undefined : 4)
}

export const AnalyticsVisualShell: React.FC<AnalyticsVisualShellProps> = ({
  shellMode,
  title,
  subtitle,
  iconKey,
  icon,
  headerColorPair,
  controllerSpec,
  controllerExplanation,
  activeContext,
  canvasFitMode = "balanced",
  standard,
  vt2,
  children,
}) => {
  const resolvedIcon = iconNode(icon, iconKey)
  const rows = normalizedRows(controllerSpec, controllerExplanation)

  if (shellMode === "vt2-preserved") {
    return (
      // data-vt-visual-module / .vt-visual-module: anchor for mobile
      // orientation-position preservation (usePreserveOrientationPosition).
      <div data-vt-visual-module className="vt-visual-module">
        <ChartModule
          {...vt2}
          title={title}
          subtitle={subtitle ?? controllerExplanation}
          icon={resolvedIcon}
          iconBg={headerColorPair.icon}
          titleBg={headerColorPair.title}
          bodyFitMode={canvasFitMode}
        >
          {children}
        </ChartModule>
      </div>
    )
  }

  return (
    // data-vt-visual-module / .vt-visual-module: anchor for mobile
    // orientation-position preservation (usePreserveOrientationPosition).
    <div data-vt-visual-module className="vt-visual-module">
      <UnifiedAnalyticsVisualModule
        title={title}
        subtitle={subtitle ?? controllerExplanation ?? ""}
        icon={resolvedIcon}
        iconKey={iconKey}
        headerColorPair={headerColorPair}
        activeContext={activeContext}
        controllerRows={rows as ControllerRow[] | undefined}
        controllerWidth={controllerSpec?.width}
        controllerDensity={controllerSpec?.density}
        theme={standard?.theme}
        layout={standard?.layout}
        footer={standard?.footer}
        metricBadges={standard?.metricBadges}
        collapsible={standard?.collapsible}
        isOpenInitial={standard?.isOpenInitial}
        canvasFitMode={canvasFitMode}
      >
        {/* .vt-visual-canvas: shared chart-body target for the mobile
            aspect-ratio + landscape-fill rules in mobileOrientation.css */}
        <div data-canvas-fit-mode={canvasFitMode} className="vt-visual-canvas vt-responsive-visual-body h-full w-full">
          {children}
        </div>
      </UnifiedAnalyticsVisualModule>
    </div>
  )
}
