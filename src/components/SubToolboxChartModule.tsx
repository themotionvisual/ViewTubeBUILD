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
  onClick?: () => void
  isActive?: boolean
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
    count: number | string
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
    title?: React.ReactNode
    stats?: SubToolboxStat[]
    leftTitle?: string
    leftStats?: SubToolboxStat[]
    rightTitle?: string
    rightStats?: SubToolboxStat[]
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
              className="relative w-fit h-full min-h-[70px] border-l-[4px] border-l-black rounded-none px-0 py-0 flex flex-col items-center justify-start gap-0 shrink-0 overflow-visible"
              style={{ background: tokens.iconBlockBg, color: "#000000" }}
            >
                <span className={`font-[1000] leading-[0.9] text-center w-full pt-1 px-1 break-all ${String(controlBox.count).length > 5 ? 'text-[24px]' : 'text-[32px]'}`}>
                  {controlBox.count}
                </span>
                <div className="mt-auto mb-0 w-full flex items-center justify-center border-y-[2px] border-black bg-black h-[22px] shrink-0 overflow-hidden">
                  {controlBox.dropdown ? (
                    <button
                      type="button"
                      onClick={controlBox.dropdown.onToggle}
                      className="h-full px-2 w-full bg-black text-[#CCFF00] text-[18px] font-black uppercase tracking-[0.01em] inline-flex items-center justify-center gap-1 shrink-0"
                    >
                      <span
                        className={`text-[12px] leading-none transition-transform duration-150 ${
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
                    <span className="text-[14px] font-black uppercase tracking-[0.01em] text-center leading-none w-full px-2">
                      {controlBox.countLabel ?? "TOP PERFORMING"}
                    </span>
                  )}
                </div>
                <div className="flex-1 w-full flex items-center justify-center">
                  <span className="text-[16px] text-center font-black uppercase tracking-[0.01em] leading-none">
                    {controlBox.countUnit ?? "VIDEOS"}
                  </span>
                </div>
              {controlBox.dropdown ? (
                <div
                  className={`absolute left-0 right-0 top-[calc(100%+6px)] bg-white border-[4px] border-black rounded-[10px] overflow-hidden z-30 origin-top transition-all duration-200 ${
                    controlBox.dropdown.isOpen
                      ? "opacity-100 scale-y-100 pointer-events-auto"
                      : "opacity-0 scale-y-95 pointer-events-none"
                  }`}
                >
                  {controlBox.dropdown.options.map((option, idx) => {
                    const isActive = controlBox.dropdown?.value === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => controlBox.dropdown?.onSelect(option.value)}
                        style={{ 
                          backgroundColor: isActive ? tokens.iconBlockBg : 'white' 
                        }}
                        className={`w-full h-8 px-3 text-center text-[12px] font-[1000] uppercase tracking-[0.06em] whitespace-nowrap border-black flex items-center justify-center transition-colors duration-150 ${
                          idx === 0 ? "" : "border-t-[4px]"
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = tokens.iconBlockBg;
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {controlBox.extraActions}
            </div>
          ) : null}
        </div>
      </div>

      {activeContext ? (
        <div className="border-b-[4px] border-black px-0 py-0 bg-white h-10 overflow-hidden">
          <div className="flex items-stretch h-full w-full justify-between">
            {/* Left Section */}
            <div className="flex items-stretch h-full overflow-hidden shrink-0">
              {activeContext.leftTitle && (
                <div className="px-2 flex items-center justify-center font-[1000] text-[18px] border-r-[4px] border-black bg-white shrink-0">
                  {activeContext.leftTitle}
                </div>
              )}
              {activeContext.leftStats && (
                <div className="flex items-stretch h-full">
                  {activeContext.leftStats.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      disabled={!item.onClick}
                      className={`h-full w-auto px-0.5 inline-flex flex-col items-stretch justify-start tabular-nums leading-none border-r-[4px] border-black overflow-hidden transition-colors ${
                        item.onClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                      } ${item.isActive ? 'bg-white' : 'bg-gray-100 grayscale-[0.5]'}`}
                    >
                      <span className={`h-5 text-[14px] font-[1000] tracking-tight inline-flex items-center justify-center pt-0.5 ${item.isActive ? 'text-black' : 'text-black/40'}`}>
                        {item.value}
                      </span>
                      <span
                        className={`h-5 text-[11px] font-black tracking-tight uppercase inline-flex items-center justify-center w-full ${toneClass(item.tone)} ${item.isActive ? 'opacity-100' : 'opacity-40 grayscale'}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Middle Section (Filler / Title) */}
            <div className="flex-1 bg-white flex items-stretch h-full overflow-hidden min-w-0">
              {activeContext.title && (
                <div className={`flex items-stretch flex-1 min-w-0 ${activeContext.leftStats || activeContext.leftTitle ? 'border-l-[4px]' : ''} ${activeContext.rightStats || activeContext.rightTitle || activeContext.stats ? 'border-r-[4px]' : ''} border-black`}>
                  {typeof activeContext.title === 'string' ? (
                    <div className="flex items-center px-2 font-[1000] text-[22px] leading-tight flex-1 truncate">
                      {activeContext.title}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-stretch min-w-0">
                      {activeContext.title}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-stretch h-full overflow-hidden shrink-0">
              {activeContext.rightStats && (
                <div className="flex items-stretch h-full">
                  {activeContext.rightStats.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      disabled={!item.onClick}
                      className={`h-full w-auto px-0.5 inline-flex flex-col items-stretch justify-start tabular-nums leading-none border-l-[4px] border-black overflow-hidden transition-colors ${
                        item.onClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                      } ${item.isActive ? 'bg-white' : 'bg-gray-100 grayscale-[0.5]'}`}
                    >
                      <span className={`h-5 text-[14px] font-[1000] tracking-tight inline-flex items-center justify-center pt-0.5 ${item.isActive ? 'text-black' : 'text-black/40'}`}>
                        {item.value}
                      </span>
                      <span
                        className={`h-5 text-[11px] font-[1000] tracking-tight uppercase inline-flex items-center justify-center w-full ${toneClass(item.tone)} ${item.isActive ? 'opacity-100' : 'opacity-40 grayscale'}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {activeContext.rightTitle && (
                <div className="px-2 flex items-center justify-center font-[1000] text-[18px] border-l-[4px] border-black bg-white shrink-0">
                  {activeContext.rightTitle}
                </div>
              )}
              {!activeContext.rightStats && activeContext.stats && (
                <div className="flex items-stretch h-full">
                  {activeContext.stats.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      disabled={!item.onClick}
                      className={`h-full w-auto px-0.5 inline-flex flex-col items-stretch justify-start tabular-nums leading-none border-l-[4px] border-black overflow-hidden transition-colors ${
                        item.onClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                      } ${item.isActive ? 'bg-white' : 'bg-gray-100 grayscale-[0.5]'}`}
                    >
                      <span className={`h-5 text-[14px] font-[1000] tracking-tight inline-flex items-center justify-center pt-0.5 ${item.isActive ? 'text-black' : 'text-black/40'}`}>
                        {item.value}
                      </span>
                      <span
                        className={`h-5 text-[11px] font-[1000] tracking-tight uppercase inline-flex items-center justify-center w-full ${toneClass(item.tone)} ${item.isActive ? 'opacity-100' : 'opacity-40 grayscale'}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 p-0" style={{ minHeight: layout?.moduleMinHeight ?? "420px" }}>
        {content}
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
        <div className="border-t-[4px] border-black bg-black">
          {footer}
        </div>
      ) : null}
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
