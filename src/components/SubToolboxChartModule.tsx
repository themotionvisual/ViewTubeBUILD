import React from "react"
import { AnalyticsVisualIcon } from "./AnalyticsVisualIcon"
import { useAnalyticsVisualStyle } from "./AnalyticsVisualStyleContext"
import { VisualModuleController, type ControllerRow } from "./VisualModuleController"
import { useVtSyncVisualDataSourcePrefix } from "../features/vt-sync-local/shell/VtSyncVisualDataSourceContext"
import {
  VT_VISUAL_METRIC_COLORS,
} from "../styles/toolboxPalette"
import {
  AnalyticsActiveStats,
  resolveAnalyticsVisualContextBarHeight,
  type AnalyticsVisualContextBarHeight,
} from "./analyticsVisualContextBar"

type Tone = "pink" | "cyan" | "lime" | "yellow" | "purple" | "orange" | "white"

export interface ModuleThemeTokens {
  frameBg?: string
  frameBorder?: string
  shadowColor?: string
  headerBandBg?: string
  iconBlockBg?: string
  iconBlockBorder?: string
  controlBoxBg?: string
  controlBoxText?: string
}

export interface ControlBoxDropdownOption {
  value: string
  label: string
}

export interface LegendSlotConfig {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
}

export interface SubToolboxStat {
  label: string
  value: string
  /** Named UI tone or an explicit metric color from the shared visual palette. */
  tone?: Tone | string
  valueTone?: string
  backgroundTone?: string
  labelText?: string
  labelClassName?: string
  onClick?: () => void
  isActive?: boolean
  lockTone?: boolean
  compact?: boolean
  /** Minimum card width. Longer labels may expand beyond this value. */
  minWidth?: number
}

export interface SubToolboxMetricBadge {
  label: string
  tone?: Tone | string
}

export interface SubToolboxChartModuleProps {
  header: {
    title: string
    subtitle: string
    icon?: React.ReactNode
    headerStyle?: "subtoolbox" | "classic"
    titleClassName?: string
  }
  controlBox?: {
    count?: number | string
    countLabel?: string
    countUnit?: string
    onCountPrev?: () => void
    onCountNext?: () => void
    dropdown?: {
      value: string
      options: ControlBoxDropdownOption[]
      isOpen: boolean
      onToggle: () => void
      onSelect: (value: string) => void
    }
    /** A second dropdown rendered immediately after the first */
    dropdown2?: {
      value: string
      options: ControlBoxDropdownOption[]
      isOpen: boolean
      onToggle: () => void
      onSelect: (value: string) => void
    }
    extraActions?: React.ReactNode
    rightInlineControls?: React.ReactNode
  }
  controllerRows?: ControllerRow[]
  controllerWidth?: number
  controllerDensity?: "normal" | "compact"
  activeContext?: {
    title?: React.ReactNode
    stats?: SubToolboxStat[]
    leftTitle?: string
    leftStats?: SubToolboxStat[]
    rightTitle?: string
    rightStats?: SubToolboxStat[]
    bgTone?: string
    height?: AnalyticsVisualContextBarHeight
    /** Allows dense two-line labels without clipping the subtitle rail. */
    minHeight?: number
  } | null
  layout?: {
    moduleWidth?: string
    moduleMinHeight?: string
    chartHeight?: number
    bodyMinHeight?: string
    bodyPreferredHeight?: string
    heightPolicy?: "fixedBody" | "fillWidth" | "preserveRatio" | "compact"
  }
  theme?: ModuleThemeTokens
  renderer?: {
    type: "scatter" | "bar" | "line" | "area" | "combo" | "radar" | "donut" | "pie" | "custom"
    render: () => React.ReactNode
  }
  legendLayout?: LegendSlotConfig
  footerMode?: "ticker" | "plain" | "none"
  footer?: React.ReactNode
  metricBadges?: SubToolboxMetricBadge[]
  insightMarquee?: {
    chartInsight: string
    personalInsight: string
  }
  disableActiveContextBottomBorder?: boolean
  footerBorderless?: boolean
  collapsible?: boolean
  isOpenInitial?: boolean
  /** Standard two-column insight / action row rendered below chart content */
  insight?: {
    personalInsight: string
    actionInsight?: string
  }
}

/** Backward-compatible aliases backed by the canonical VT-SYNC metric palette. */
export const METRIC_COLORS: Record<string, string> = {
  SUBSCRIBERS: VT_VISUAL_METRIC_COLORS.subscribers,
  SUBS: VT_VISUAL_METRIC_COLORS.subscribers,
  COMMENTS: VT_VISUAL_METRIC_COLORS.comments,
  CMNTS: VT_VISUAL_METRIC_COLORS.comments,
  SHARES: VT_VISUAL_METRIC_COLORS.shares,
  SAVES: VT_VISUAL_METRIC_COLORS.playlistSaves,
  "PLAYLIST SAVES": VT_VISUAL_METRIC_COLORS.playlistSaves,
  REVENUE: VT_VISUAL_METRIC_COLORS.revenue,
  REV: VT_VISUAL_METRIC_COLORS.revenue,
  RPM: VT_VISUAL_METRIC_COLORS.rpm,
  VIEWS: VT_VISUAL_METRIC_COLORS.views,
  "WATCH TIME": VT_VISUAL_METRIC_COLORS.watchTime,
  WATCH: VT_VISUAL_METRIC_COLORS.watchTime,
  AVP: VT_VISUAL_METRIC_COLORS.avp,
  AVD: VT_VISUAL_METRIC_COLORS.avd,
  LIKES: VT_VISUAL_METRIC_COLORS.likes,
  IMPRESSIONS: "#B14AED",
  IMPRSNS: "#B14AED",
  CTR: "#00CCFF",
  RETENTION: "#FF7497",
  RET: "#FF7497",
  ENGAGED: VT_VISUAL_METRIC_COLORS.engagedViews,
  "ENGAGED VIEWS": VT_VISUAL_METRIC_COLORS.engagedViews,
  LENGTH: "#40C6E9",
}

export const SubToolboxChartModule: React.FC<
  React.PropsWithChildren<SubToolboxChartModuleProps>
> = ({
  header,
  controlBox,
  controllerRows,
  controllerWidth,
  controllerDensity,
  activeContext,
  layout,
  theme,
  renderer,
  legendLayout,
  footer,
  children,
  metricBadges = [],
  disableActiveContextBottomBorder = false,
  footerBorderless = false,
  collapsible = false,
  isOpenInitial = true,
  insight,
}) => {
  const sourcePrefix = useVtSyncVisualDataSourcePrefix()
  const visualStyle = useAnalyticsVisualStyle()
  const resolvedSubtitle = sourcePrefix ? `${sourcePrefix} · ${header.subtitle}` : header.subtitle
  const [internalOpen, setInternalOpen] = React.useState(isOpenInitial)
  const [hasOpened, setHasOpened] = React.useState(isOpenInitial)
  const setOpen = () => {
    setInternalOpen((prev) => !prev)
    setHasOpened(true)
  }

  const tokens = {
    frameBg: theme?.frameBg ?? "#FFFFFF",
    frameBorder: theme?.frameBorder ?? "#000000",
    shadowColor: visualStyle?.headerColorPair?.title ? `${visualStyle.headerColorPair.title}73` : theme?.shadowColor ?? "#000000",
    headerBandBg: visualStyle?.headerColorPair?.title ?? theme?.headerBandBg ?? "#FF82B0",
    iconBlockBg: visualStyle?.headerColorPair?.icon ?? theme?.iconBlockBg ?? "#26C7EC",
    iconBlockBorder: theme?.iconBlockBorder ?? "#000000",
    controlBoxBg: theme?.controlBoxBg ?? "#000000",
    controlBoxText: theme?.controlBoxText ?? "#CCFF00",
  }
  const resolvedHeaderIcon = visualStyle?.iconKey
    ? <AnalyticsVisualIcon iconKey={visualStyle.iconKey} size={60} />
    : header.icon

  const content = renderer ? renderer.render() : children
  const badges =
    metricBadges.length > 0
      ? metricBadges
      : activeContext?.stats?.length
        ? activeContext.stats.slice(0, 4).map((s) => ({ label: s.label, tone: s.tone }))
        : []
  const headerBorderClass = collapsible && !internalOpen ? "" : "border-b-[4px] border-black"
  const interiorMinHeight = collapsible && !internalOpen ? 0 : (layout?.moduleMinHeight ?? "420px")
  const activeContextHeight = resolveAnalyticsVisualContextBarHeight(activeContext)

  return (
    <div
      className="border-[4px] rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: tokens.frameBg,
        borderColor: tokens.frameBorder,
        boxShadow: `8px 8px 0px 0px ${tokens.shadowColor}`,
        maxWidth: layout?.moduleWidth ?? "100%",
      }}
    >
      {/*
        Header layout is width-adaptive:
        - On landscape / tablet / desktop (≥ 640 px) it stays a single flex row:
          [icon square] [title/subtitle] [controllers pinned right].
        - On portrait phones the controllers used to eat a fixed ~195 px on the
          right, which left ~90 px for the title and forced "CHANNEL PROGRESS"
          to `break-words` character-by-character (one letter per row). Below
          640 px we now stack vertically: [icon + title/subtitle] on top,
          controllers on their own row underneath, spanning the full width.
      */}
      <div
        className={`${headerBorderClass} flex flex-col sm:flex-row sm:items-stretch min-h-[80px] ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? setOpen : undefined}
      >
        <div
          className="flex items-stretch flex-1 min-w-0"
          style={{ background: tokens.headerBandBg }}
        >
          {/* self-stretch fills the header's full height (no white frame showing beneath),
              and aspect-square drives the width off that height so the block stays square. */}
          <div
            className="self-stretch aspect-square min-w-[80px] shrink-0 flex-none border-r-[4px] border-black flex items-center justify-center"
            style={{ background: tokens.iconBlockBg, borderColor: tokens.iconBlockBorder }}
          >
            <span className="[&_svg]:h-8 [&_svg]:w-8">{resolvedHeaderIcon}</span>
          </div>
          <div className="min-w-0 flex-1 pl-3 pr-2 py-2 flex flex-col justify-center text-black">
            <div className={`max-w-full font-[1000] uppercase tracking-[0em] ${header.titleClassName ?? "text-[clamp(20px,5vw,42px)] leading-[0.88]"}`}>
              {header.title}
            </div>
            <div className="max-w-full text-[clamp(10px,2.2vw,14px)] font-black uppercase tracking-[0.069em] text-black/80 truncate">
              {resolvedSubtitle}
            </div>
          </div>
        </div>

        {(controlBox?.rightInlineControls || controllerRows || controlBox) ? (
        <div
          className="flex shrink-0 items-stretch border-t-[4px] sm:border-t-0 border-black w-full sm:w-auto overflow-x-auto"
          style={{ background: tokens.headerBandBg }}
          onClick={(event) => event.stopPropagation()}
        >
          {controlBox?.rightInlineControls ? (
            <div className="flex items-center justify-end gap-2 pr-2 py-2">
              {controlBox.rightInlineControls}
            </div>
          ) : null}

          {controllerRows ? (
            <VisualModuleController rows={controllerRows} width={controllerWidth ?? 195} density={controllerDensity ?? "normal"} />
          ) : controlBox ? (
            <div className="flex shrink-0 relative h-full">
              <VisualModuleController width={controllerWidth ?? 195} density={controllerDensity ?? "normal"} rows={[
                ...(controlBox.count !== undefined ? [
                  { type: "number" as const, value: controlBox.count, bgTone: tokens.iconBlockBg, fgTone: "#000000", onPrev: controlBox.onCountPrev, onNext: controlBox.onCountNext }
                ] : []),
                ...(controlBox.dropdown ? [{
                   type: "dropdown" as const,
                   value: controlBox.dropdown.value,
                   options: controlBox.dropdown.options,
                   onSelect: controlBox.dropdown.onSelect,
                   bgTone: "#FFFFFF",
                   fgTone: "#000000"
                }] : (controlBox.count !== undefined ? [{ type: "label" as const, value: controlBox.countLabel ?? "BEST", bgTone: "#FFFFFF", fgTone: tokens.iconBlockBg }] : [])),
                ...(controlBox.dropdown2 ? [{
                   type: "dropdown" as const,
                   value: controlBox.dropdown2.value,
                   options: controlBox.dropdown2.options,
                   onSelect: controlBox.dropdown2.onSelect,
                   bgTone: "#FFFFFF",
                   fgTone: "#000000"
                }] : []),
                { type: "label" as const, value: controlBox.countUnit ?? "VIDEOS", bgTone: "#FFFFFF", fgTone: "#000000" }
              ]} />
              {controlBox.extraActions}
            </div>
          ) : null}
        </div>
        ) : null}
      </div>

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${internalOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden flex flex-col relative">
          {activeContext ? (
            <div
              className={`${disableActiveContextBottomBorder ? "" : "border-b-[4px] border-black"} px-0 py-0 overflow-x-auto overflow-y-hidden`}
              style={{
                background: activeContext.bgTone ?? "#FFFFFF",
                height: activeContextHeight,
                minHeight: activeContextHeight,
              }}
            >
              <div
                className="flex h-full items-stretch w-full justify-between"
              >
                {/* Left Section */}
                <div className="flex items-stretch h-full overflow-hidden shrink-0">
                  {activeContext.leftTitle && (
                    <div
                      className="px-2 flex items-center justify-center font-[1000] text-[13px] border-r-[4px] border-black shrink-0"
                      style={{ background: activeContext.bgTone ?? "#FFFFFF", color: activeContext.bgTone === "#080816" ? "#F3F4F6" : "#000000" }}
                    >
                      {activeContext.leftTitle}
                    </div>
                  )}
                  {activeContext.leftStats && (
                    <div className="flex items-stretch h-full border-r-[4px] border-black">
                      <AnalyticsActiveStats stats={activeContext.leftStats} />
                    </div>
                  )}
                </div>

                {/* Middle Section (Filler / Title) */}
                <div className="flex-1 flex items-stretch h-full overflow-hidden min-w-0" style={{ background: activeContext.bgTone ?? "#FFFFFF" }}>
                  {activeContext.title && (
                    <div className={`flex items-stretch flex-1 min-w-0 ${activeContext.leftStats || activeContext.leftTitle ? 'border-l-[4px]' : ''} ${activeContext.rightStats || activeContext.rightTitle || activeContext.stats ? 'border-r-[4px]' : ''} border-black`}>
                      {typeof activeContext.title === 'string' ? (
                        <div className="flex items-center px-2 font-[1000] text-[clamp(13px,1.4vw,18px)] leading-tight flex-1 truncate" style={{ color: activeContext.bgTone === "#080816" ? "#F3F4F6" : "#000000" }}>
                          {activeContext.title}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-stretch min-w-0" style={{ color: activeContext.bgTone === "#080816" ? "#F3F4F6" : "#000000" }}>
                          {activeContext.title}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Section */}
                <div className="flex items-stretch h-full overflow-hidden shrink-0">
                  {activeContext.rightTitle && (
                    <div
                      className="px-2 flex items-center justify-center font-[1000] text-[13px] border-l-[4px] border-black shrink-0"
                      style={{ background: activeContext.bgTone ?? "#FFFFFF", color: activeContext.bgTone === "#080816" ? "#F3F4F6" : "#000000" }}
                    >
                      {activeContext.rightTitle}
                    </div>
                  )}
                  {activeContext.rightStats ? <AnalyticsActiveStats stats={activeContext.rightStats} /> : null}
                  {!activeContext.rightStats && activeContext.stats && (
                    <AnalyticsActiveStats stats={activeContext.stats} />
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div
            className="flex-1 p-0 vt-chart-interior"
            style={{ minHeight: interiorMinHeight }}
          >
            {hasOpened ? content : null}
          </div>

          {(legendLayout?.left || legendLayout?.center || legendLayout?.right) && (
            <div className="px-4 py-2 border-t-[4px] border-black bg-[#F8F8F8]">
              <div className="grid grid-cols-3 items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em]">
                <div className="justify-self-start">{legendLayout.left}</div>
                <div className="justify-self-center">{legendLayout.center}</div>
                <div className="justify-self-end">{legendLayout.right}</div>
              </div>
            </div>
          )}

          {footer ? (
            <div className={`${footerBorderless ? "" : "border-t-[4px] border-black"} bg-black`}>
              {footer}
            </div>
          ) : null}

          {insight ? (
            <div className="border-t-[4px] border-black bg-[#0c0c14] text-white flex items-stretch">
              <div className="flex flex-1 min-h-[56px] items-center gap-3 border-r border-white/10 px-4 py-3">
                <span className="shrink-0 border border-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black bg-[#CCFF00] whitespace-nowrap">
                  INSIGHT
                </span>
                <span className="text-[11px] font-medium leading-5 text-white/75">{insight.personalInsight}</span>
              </div>
              {insight.actionInsight ? (
                <div className="flex flex-1 min-h-[56px] items-center gap-3 px-4 py-3">
                  <span className="shrink-0 border border-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black bg-[#00CCFF] whitespace-nowrap">
                    ACTION
                  </span>
                  <span className="text-[11px] font-medium leading-5 text-white/75">{insight.actionInsight}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const subToolboxChartPresets = {
  shortsRetentionPreset: {
    header: {
      title: "SHORTS RETENTION",
      subtitle: "AVD% × $REV × LENGTH",
      headerStyle: "subtoolbox" as const,
    },
    layout: { moduleMinHeight: "420px" },
    videoCountOptions: [25, 50, 75, 100, 200],
    formatOptions: ["All", "Shorts", "Long"] as string[],
  },
  videoValueMatrixStarter: {
    header: {
      title: "VIDEO VALUE MATRIX",
      subtitle: "CTR × RETENTION × VIEWS",
      headerStyle: "subtoolbox" as const,
    },
    videoCountOptions: [10, 15, 20, 25, 50, 100],
    formatOptions: ["All", "Long"] as string[],
  },
  packagingStarter: {
    header: {
      title: "PACKAGING",
      subtitle: "CTR × IMPRESSIONS",
      headerStyle: "subtoolbox" as const,
    },
    videoCountOptions: [10, 15, 20, 25, 50],
    formatOptions: ["All", "Shorts", "Long"] as string[],
  },
  engagementMapStarter: {
    header: {
      title: "ENGAGEMENT MAP",
      subtitle: "TOP RECENT BY COMMENTS",
      headerStyle: "subtoolbox" as const,
    },
    videoCountOptions: [10, 15, 20, 25, 50],
    formatOptions: ["All", "Shorts", "Long"] as string[],
  },
}
