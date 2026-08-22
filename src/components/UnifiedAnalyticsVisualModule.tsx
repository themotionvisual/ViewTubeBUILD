import React from "react"
import { AnalyticsVisualIcon } from "./AnalyticsVisualIcon"
import { useAnalyticsVisualStyle } from "./AnalyticsVisualStyleContext"
import { VisualModuleController, type ControllerRow } from "./VisualModuleController"
import type {
  ModuleThemeTokens,
  SubToolboxChartModuleProps,
  SubToolboxMetricBadge,
} from "./SubToolboxChartModule"
import { useVtSyncVisualDataSourcePrefix } from "../features/vt-sync-local/shell/VtSyncVisualDataSourceContext"
import {
  AnalyticsActiveStats,
  resolveAnalyticsVisualContextBarHeight,
} from "./analyticsVisualContextBar"
import { HeaderHeroPlayButton } from "./HeroIntroBoundary"
import type { HeroVisualId } from "./heroVisualAnimations"

export type UnifiedAnalyticsVisualHeightPolicy = "fixedBody" | "fillWidth" | "preserveRatio" | "compact"

export interface UnifiedAnalyticsVisualModuleProps {
  title: string
  subtitle?: string
  iconKey?: string
  icon?: React.ReactNode
  headerColorPair: {
    icon: string
    title: string
  }
  controllerRows?: ControllerRow[]
  controllerWidth?: number
  controllerDensity?: "normal" | "compact"
  activeContext?: SubToolboxChartModuleProps["activeContext"]
  layout?: SubToolboxChartModuleProps["layout"] & {
    bodyMinHeight?: string
    bodyPreferredHeight?: string
    heightPolicy?: UnifiedAnalyticsVisualHeightPolicy
  }
  theme?: ModuleThemeTokens
  footer?: React.ReactNode
  metricBadges?: SubToolboxMetricBadge[]
  collapsible?: boolean
  isOpenInitial?: boolean
  canvasFitMode?: "balanced" | "fillWidth" | "preserveRatio"
  heroVisualId?: HeroVisualId
  children: React.ReactNode
}

export const UnifiedAnalyticsVisualModule: React.FC<UnifiedAnalyticsVisualModuleProps> = ({
  title,
  subtitle = "",
  iconKey,
  icon,
  headerColorPair,
  controllerRows,
  controllerWidth,
  controllerDensity,
  activeContext,
  layout,
  theme,
  footer,
  collapsible = false,
  isOpenInitial = true,
  canvasFitMode = "balanced",
  children,
  heroVisualId,
}) => {
  const sourcePrefix = useVtSyncVisualDataSourcePrefix()
  const visualStyle = useAnalyticsVisualStyle()
  const [internalOpen, setInternalOpen] = React.useState(isOpenInitial)
  const [hasOpened, setHasOpened] = React.useState(isOpenInitial)
  const resolvedHeaderPair = visualStyle?.headerColorPair ?? headerColorPair
  const resolvedIconKey = visualStyle?.iconKey ?? iconKey
  const resolvedSubtitle = sourcePrefix ? `${sourcePrefix} · ${subtitle}` : subtitle
  const resolvedIcon = resolvedIconKey ? <AnalyticsVisualIcon iconKey={resolvedIconKey} size={60} /> : icon
  const frameShadow = visualStyle?.headerColorPair?.title
    ? `${visualStyle.headerColorPair.title}73`
    : theme?.shadowColor ?? "#000000"
  const bodyMinHeight = layout?.bodyMinHeight ?? layout?.moduleMinHeight ?? "420px"
  const bodyPreferredHeight = layout?.bodyPreferredHeight ?? (layout?.chartHeight ? `${layout.chartHeight}px` : bodyMinHeight)
  const heightPolicy = layout?.heightPolicy ?? "fixedBody"
  const activeContextHeight = resolveAnalyticsVisualContextBarHeight(activeContext)

  const toggleOpen = () => {
    if (!collapsible) return
    setInternalOpen((open) => !open)
    setHasOpened(true)
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border-[4px]"
      data-visual-height-policy={heightPolicy}
      style={{
        background: theme?.frameBg ?? "#FFFFFF",
        borderColor: theme?.frameBorder ?? "#000000",
        boxShadow: `8px 8px 0px 0px ${frameShadow}`,
        maxWidth: layout?.moduleWidth ?? "100%",
      }}
    >
      <div
        className={`flex min-h-[80px] flex-col sm:flex-row sm:items-stretch ${internalOpen ? "border-b-[4px] border-black" : ""} ${collapsible ? "cursor-pointer" : ""}`}
        onClick={toggleOpen}
      >
        <div className="flex min-w-0 flex-1 items-stretch" style={{ background: resolvedHeaderPair.title }}>
          <div
            className="flex aspect-square min-w-[80px] flex-none shrink-0 items-center justify-center self-stretch border-r-[4px] border-black"
            style={{ background: resolvedHeaderPair.icon }}
          >
            <span className="[&_svg]:h-[60px] [&_svg]:w-[60px]">
              {resolvedIcon ?? <AnalyticsVisualIcon size={60} />}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="max-w-full text-[clamp(20px,5vw,42px)] font-[1000] uppercase leading-[0.88] tracking-[0em] text-black">
                {title}
              </div>
              <div className="max-w-full truncate text-[clamp(10px,2.2vw,14px)] font-black uppercase tracking-[0.069em] text-black opacity-80">
                {resolvedSubtitle}
              </div>
            </div>
            {heroVisualId ? <HeaderHeroPlayButton visualId={heroVisualId} placement="header" /> : null}
          </div>
        </div>
        {controllerRows ? (
          <div
            className="flex w-full shrink-0 items-stretch overflow-x-auto border-t-[4px] border-black sm:w-auto sm:border-t-0"
            style={{ background: resolvedHeaderPair.title }}
            onClick={(event) => event.stopPropagation()}
          >
            <VisualModuleController rows={controllerRows} width={controllerWidth ?? 195} density={controllerDensity ?? "normal"} />
          </div>
        ) : null}
      </div>

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${internalOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="relative flex flex-col overflow-hidden">
          {activeContext ? (
            <div
              className="overflow-x-auto overflow-y-hidden border-b-[4px] border-black px-0 py-0"
              style={{
                background: activeContext.bgTone ?? "#FFFFFF",
                height: activeContextHeight,
                minHeight: activeContextHeight,
              }}
            >
              <div className="flex h-full w-full items-stretch justify-between">
                <div className="flex h-full shrink-0 items-stretch overflow-hidden">
                  {activeContext.leftTitle ? (
                    <div className="flex shrink-0 items-center justify-center border-r-[4px] border-black px-2 text-[13px] font-[1000]" style={{ color: activeContext.bgTone === "#080816" ? "#F3F4F6" : "#000000" }}>
                      {activeContext.leftTitle}
                    </div>
                  ) : null}
                  {activeContext.leftStats ? <AnalyticsActiveStats stats={activeContext.leftStats} darkStats={activeContext.darkStats} /> : null}
                </div>
                <div className="flex h-full min-w-0 flex-1 items-stretch overflow-hidden" style={{ background: activeContext.bgTone ?? "#FFFFFF" }}>
                  {activeContext.title ? (
                    <div className="flex min-w-0 flex-1 items-center px-2 text-[clamp(13px,1.4vw,18px)] font-[1000] leading-tight" style={{ color: activeContext.bgTone === "#080816" ? "#F3F4F6" : "#000000" }}>
                      {activeContext.title}
                    </div>
                  ) : null}
                </div>
                <div className="flex h-full shrink-0 items-stretch overflow-hidden">
                  {activeContext.rightTitle ? (
                    <div className="flex shrink-0 items-center justify-center border-l-[4px] border-black px-2 text-[13px] font-[1000]" style={{ color: activeContext.bgTone === "#080816" ? "#F3F4F6" : "#000000" }}>
                      {activeContext.rightTitle}
                    </div>
                  ) : null}
                  {activeContext.rightStats ? <AnalyticsActiveStats stats={activeContext.rightStats} darkStats={activeContext.darkStats} /> : null}
                  {!activeContext.rightStats && activeContext.stats ? <AnalyticsActiveStats stats={activeContext.stats} darkStats={activeContext.darkStats} /> : null}
                </div>
              </div>
            </div>
          ) : null}

          <div
            className="vt-chart-interior flex-1 p-0"
            data-canvas-fit-mode={canvasFitMode}
            style={{
              minHeight: bodyMinHeight,
              height: bodyPreferredHeight,
              background: activeContext?.bgTone ?? undefined,
            }}
          >
            {hasOpened ? children : null}
          </div>

          {footer ? (
            <div className="border-t-[4px] border-black bg-black">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
