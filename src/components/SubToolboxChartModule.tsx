import React from "react"

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
  tone?: Tone
}

export interface SubToolboxMetricBadge {
  label: string
  tone?: Tone
}

export interface SubToolboxChartModuleProps {
  header: {
    title: string
    subtitle: string
    icon?: React.ReactNode
    headerStyle?: "subtoolbox" | "classic"
  }
  controlBox?: {
    count: number
    countLabel?: string
    countUnit?: string
    dropdown?: {
      value: string
      options: ControlBoxDropdownOption[]
      isOpen: boolean
      onToggle: () => void
      onSelect: (value: string) => void
    }
    extraActions?: React.ReactNode
  }
  activeContext?: {
    title: string
    stats: SubToolboxStat[]
  } | null
  layout?: {
    moduleWidth?: string
    moduleMinHeight?: string
    chartHeight?: number
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
}

const toneClass = (tone?: Tone): string => {
  if (tone === "pink") return "bg-[#FF7497]"
  if (tone === "cyan") return "bg-[#00CCFF]"
  if (tone === "lime") return "bg-[#CCFF00]"
  if (tone === "yellow") return "bg-[#FFEA00]"
  if (tone === "purple") return "bg-[#B14AED]"
  if (tone === "orange") return "bg-[#FFB158]"
  return "bg-[#E5E7EB]"
}

export const SubToolboxChartModule: React.FC<
  React.PropsWithChildren<SubToolboxChartModuleProps>
> = ({
  header,
  controlBox,
  activeContext,
  layout,
  theme,
  renderer,
  legendLayout,
  footer,
  children,
  metricBadges = [],
}) => {
  const tokens = {
    frameBg: theme?.frameBg ?? "#FFFFFF",
    frameBorder: theme?.frameBorder ?? "#000000",
    shadowColor: theme?.shadowColor ?? "#000000",
    headerBandBg: theme?.headerBandBg ?? "#FF82B0",
    iconBlockBg: theme?.iconBlockBg ?? "#26C7EC",
    iconBlockBorder: theme?.iconBlockBorder ?? "#000000",
    controlBoxBg: theme?.controlBoxBg ?? "#000000",
    controlBoxText: theme?.controlBoxText ?? "#CCFF00",
  }

  const content = renderer ? renderer.render() : children
  const badges =
    metricBadges.length > 0
      ? metricBadges
      : activeContext?.stats?.length
        ? activeContext.stats.slice(0, 4).map((s) => ({ label: s.label, tone: s.tone }))
        : []

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
      <div className="border-b-[4px] border-black flex items-stretch h-[74px]">
        <div
          className="w-[76px] h-full border-r-[4px] border-black flex items-center justify-center shrink-0"
          style={{ background: tokens.iconBlockBg, borderColor: tokens.iconBlockBorder }}
        >
          <span className="[&_svg]:h-9 [&_svg]:w-9">{header.icon}</span>
        </div>
        <div
          className="flex-1 min-w-0 pl-3 pr-0 py-0 flex items-stretch justify-between gap-0"
          style={{ background: tokens.headerBandBg }}
        >
          <div className="min-w-0 py-2 flex flex-col justify-center">
            <div className="font-[1000] text-[42px] leading-[0.85] uppercase tracking-[0em]">
              {header.title}
            </div>
            <div className="text-[14px] font-black uppercase tracking-[0.069em] opacity-80 truncate">
              {header.subtitle}
            </div>
          </div>

          {controlBox ? (
            <div
              className="relative w-[80px] h-full min-h-[72px] border-l-[4px] border-l-black rounded-none px-1 py-0 flex flex-col items-center justify-between gap-0.5 shrink-0"
              style={{ background: "#CCFF00", color: "#000000" }}
            >
              <span className="text-[32px] font-[1000] leading-[0.95] text-center w-full pt-0.5">{controlBox.count}</span>
              <div className="mt-auto mb-0 -mx-1 w-[calc(100%+8px)] flex py-1 items-center justify-center h-full overflow-hidden border-y-[4px] border-x-[4px] border-black bg-black">
                {controlBox.dropdown ? (
                  <button
                    type="button"
                    onClick={controlBox.dropdown.onToggle}
                    className="h-8 px-1 w-full bg-black text-[#CCFF00] text-[14px] font-black uppercase tracking-[0.01em] inline-flex items-center justify-center gap-1 shrink-0"
                  >
                    <span
                      className={`text-[14px] leading-none transition-transform duration-150 ${
                        controlBox.dropdown.isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                    <span className="truncate text-center">
                      {controlBox.dropdown.options.find(
                        (o) => o.value === controlBox.dropdown?.value,
                      )?.label ?? controlBox.dropdown.value}
                    </span>
                  </button>
                ) : (
                  <span className="text-[14px] font-black uppercase tracking-[0.01em] text-center leading-none w-full">
                    {controlBox.countLabel ?? "TOP PERFORMING"}
                  </span>
                )}
              </div>
              <span className="text-[14px] text-center font-black uppercase tracking-[0.01em] leading-none pb-0.5">
                {controlBox.countUnit ?? "VIDEOS"}
              </span>
              {controlBox.dropdown ? (
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] w-[88px] bg-white border-[3px] border-black rounded-[10px] overflow-hidden z-30 origin-top transition-all duration-200 ${
                    controlBox.dropdown.isOpen
                      ? "opacity-100 scale-y-100 pointer-events-auto"
                      : "opacity-0 scale-y-95 pointer-events-none"
                  }`}
                >
                  {controlBox.dropdown.options.map((option, idx) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => controlBox.dropdown?.onSelect(option.value)}
                      className={`w-full h-5 px-3 text-center text-[10px] font-black uppercase tracking-[0.06em] whitespace-nowrap hover:bg-[#CCFF00]/20 ${
                        idx === 0 ? "" : "border-t-[3px] border-black"
                      } ${
                        controlBox.dropdown?.value === option.value
                          ? "bg-[#CCFF00]/10"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {controlBox.extraActions}
            </div>
          ) : null}
        </div>
      </div>

      {activeContext ? (
        <div className="border-b-[4px] border-black px-0 py-0 bg-[#F8F8F8]">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div
              className="flex items-center justify-start text-left font-[1000] uppercase tracking-tight h-6 text-[28px] leading-[0.9] pl-2"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {activeContext.title}
            </div>
            <div className="grid grid-flow-col auto-cols-[60px] h-10 items-stretch gap-0 text-[11px] font-black uppercase tracking-[0.12em] text-black/75 border-[2px] border-black overflow-hidden">
              {activeContext.stats.map((item) => (
                <span
                  key={item.label}
                  className="h-full w-[60px] inline-flex flex-col items-stretch justify-start tabular-nums leading-none overflow-hidden border-l-[3px] first:border-l-0 border-black rounded-none"
                >
                  <span className="h-5 text-[14px] bg-white font-[1000] tracking-tight text-black inline-flex items-center justify-center">
                    {item.value}
                  </span>
                  <span
                    className={`h-5 text-[9px] font-black tracking-[0.11em] uppercase inline-flex items-center justify-center ${toneClass(item.tone)}`}
                  >
                    {item.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 p-0" style={{ minHeight: layout?.moduleMinHeight ?? "420px" }}>
        {content}
      </div>

      {(legendLayout?.left || legendLayout?.center || legendLayout?.right) && (
        <div className="px-4 py-2 border-t-[2px] border-black bg-[#F8F8F8]">
          <div className="grid grid-cols-3 items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em]">
            <div className="justify-self-start">{legendLayout.left}</div>
            <div className="justify-self-center">{legendLayout.center}</div>
            <div className="justify-self-end">{legendLayout.right}</div>
          </div>
        </div>
      )}

      {footer ? footer : null}
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
  },
  videoValueMatrixStarter: {
    header: {
      title: "VIDEO VALUE MATRIX",
      subtitle: "CTR × RETENTION × VIEWS",
      headerStyle: "subtoolbox" as const,
    },
  },
  packagingStarter: {
    header: {
      title: "PACKAGING",
      subtitle: "CTR × IMPRESSIONS",
      headerStyle: "subtoolbox" as const,
    },
  },
  engagementMapStarter: {
    header: {
      title: "ENGAGEMENT MAP",
      subtitle: "TOP RECENT BY COMMENTS",
      headerStyle: "subtoolbox" as const,
    },
  },
}
