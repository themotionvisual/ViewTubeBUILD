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
import type { HeroVisualId } from "./heroVisualAnimations"

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
  heroVisualId?: HeroVisualId
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
  /*
   * Row ORDER is the module's, not the shell's.
   *
   * This used to move every dropdown, multi-select and ranked-by row to the end
   * of the list, so six modules that authored their dropdowns first silently
   * rendered them last. The order they now author is the order that renders;
   * the six were re-authored to the order they were already showing, so this
   * moves the authority without moving the pixels.
   *
   * The four-row cap went with it. It only ever applied when a
   * `controllerExplanation` was present — `normalizedRows` returned early
   * otherwise — and no registered visual supplies one, so it never fired. Left
   * in place it would silently drop the fifth row of the first module that did.
   * Row budgets belong to the per-orientation controller profile (phase 5),
   * where a dropped row is still reachable rather than gone.
   */
  const rows = controllerSpec?.rows ?? []
  if (!controllerExplanation) return rows.length > 0 ? [...rows] : undefined
  if (rows.some((row) => row.type === "statement")) return [...rows]
  return [
    {
      type: "statement" as const,
      value: controllerExplanation,
      bgTone: "#000000",
      fgTone: "#CCFF00",
    },
    ...rows,
  ]
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
  heroVisualId,
}) => {
  const resolvedIcon = iconNode(icon, iconKey)
  const rows = normalizedRows(controllerSpec, controllerExplanation)

  if (shellMode === "vt2-preserved") {
    return (
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
    )
  }

  return (
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
      heroVisualId={heroVisualId}
    >
      <div data-canvas-fit-mode={canvasFitMode} className="h-full w-full">
        {children}
      </div>
    </UnifiedAnalyticsVisualModule>
  )
}
