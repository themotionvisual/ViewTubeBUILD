import React from "react"

export interface ModuleStatItem {
  label: string
  value: string
  tone?: "pink" | "cyan" | "lime" | "yellow" | "purple" | "orange" | "white"
}

export interface ModuleKeyItem {
  label: string
  tone?: "pink" | "cyan" | "lime" | "yellow" | "white"
}

export interface ModuleActiveVideo {
  title: string
  stats: Array<{ label: string; value: string; tone?: ModuleStatItem["tone"] }>
}

interface UnifiedChartModuleProps {
  title: string
  subtitle: string
  headerIcon?: React.ReactNode
  headerColor?: string
  keys?: ModuleKeyItem[]
  stats?: ModuleStatItem[]
  insight?: string
  visualLegend?: React.ReactNode
  activeVideo?: ModuleActiveVideo | null
  controls?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}

const keyToneClass = (tone: ModuleKeyItem["tone"]): string => {
  if (tone === "pink") return "bg-[#FF7497] border-black text-black"
  if (tone === "cyan") return "bg-[#00CCFF] border-black text-black"
  if (tone === "lime") return "bg-[#CCFF00] border-black text-black"
  if (tone === "yellow") return "bg-[#FFEA00] border-black text-black"
  return "bg-white border-black text-black"
}

const statToneClass = (tone: ModuleStatItem["tone"]): string => {
  if (tone === "pink") return "bg-[#FF7497] text-black border-black"
  if (tone === "cyan") return "bg-[#00CCFF] text-black border-black"
  if (tone === "lime") return "bg-[#CCFF00] text-black border-black"
  if (tone === "yellow") return "bg-[#FFEA00] text-black border-black"
  if (tone === "purple") return "bg-[#B14AED] text-black border-black"
  if (tone === "orange") return "bg-[#FFB158] text-black border-black"
  return "bg-white text-black border-black"
}
const statLabelToneClass = (tone: ModuleStatItem["tone"]): string => {
  if (tone === "pink") return "bg-[#FF7497]"
  if (tone === "cyan") return "bg-[#00CCFF]"
  if (tone === "lime") return "bg-[#CCFF00]"
  if (tone === "yellow") return "bg-[#FFEA00]"
  if (tone === "purple") return "bg-[#B14AED]"
  if (tone === "orange") return "bg-[#FFB158]"
  return "bg-[#E5E7EB]"
}

export const UnifiedChartModule: React.FC<UnifiedChartModuleProps> = ({
  title,
  subtitle,
  headerIcon,
  headerColor = "#CCFF00",
  keys = [],
  stats = [],
  insight,
  visualLegend,
  activeVideo,
  controls,
  children,
  footer,
}) => {
  const shadowColor = `${headerColor}55`
  return (
    <div
      className="bg-white border-[4px] border-black rounded-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: `8px 8px 0px 0px ${shadowColor}` }}
    >
      <div
        className="border-b-[4px] border-black px-4 py-2 flex items-center justify-between gap-3"
        style={{ background: headerColor }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {headerIcon ? (
            <span className="h-10 w-10 rounded-[8px] border-[3px] border-black bg-white inline-flex items-center justify-center text-[20px] leading-none shrink-0 [&_svg]:h-5 [&_svg]:w-5">
              {headerIcon}
            </span>
          ) : null}
          <div className="min-w-0">
            <span
              className="block font-[1000] text-[38px] leading-[0.92] uppercase tracking-[-0.04em]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </span>
            <span className="block text-[13px] font-black opacity-75 uppercase tracking-[0.16em] mt-1 truncate">
              {subtitle}
            </span>
          </div>
        </div>
        {controls}
      </div>

      {activeVideo && (
        <div className="border-b-[2px] border-black px-5 py-2 bg-[#F8F8F8]">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div
              className="h-14 flex items-center text-[26px] leading-[0.95] font-[1000] uppercase tracking-tight"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {activeVideo.title}
            </div>
            <div className="grid grid-flow-col auto-cols-[102px] items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/75">
              {activeVideo.stats.map((item) => (
                <span
                  key={item.label}
                  className={`h-12 w-[102px] rounded-[4px] border-[2px] inline-flex flex-col items-stretch justify-start tabular-nums leading-none overflow-hidden ${statToneClass(
                    item.tone,
                  )}`}
                >
                  <span className="h-8 bg-white text-[21px] font-[1000] tracking-tight text-black inline-flex items-center justify-center">{item.value}</span>
                  <span className={`h-4 text-[8px] font-black tracking-[0.11em] uppercase inline-flex items-center justify-center ${statLabelToneClass(item.tone)}`}>{item.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats.length > 0 && (
        <div className="border-b-[2px] border-black px-4 py-2 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className={`h-12 w-[102px] rounded-[4px] border-[2px] text-[9px] font-black uppercase tracking-[0.11em] inline-flex flex-col items-stretch justify-start tabular-nums leading-none overflow-hidden ${statToneClass(
                  item.tone,
                )}`}
              >
                <span className="h-8 bg-white text-[19px] font-[1000] tracking-tight text-black inline-flex items-center justify-center">{item.value}</span>
                <span className={`h-4 text-[8px] font-black tracking-[0.11em] uppercase inline-flex items-center justify-center ${statLabelToneClass(item.tone)}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insight && (
        <div className="px-4 py-2 border-b-[2px] border-black bg-[#F4F4F4] text-[10px] font-black uppercase tracking-[0.12em] text-black/75">
          Insight: {insight}
        </div>
      )}

      {(visualLegend || keys.length > 0) ? (
        <div className="px-4 py-2 border-b-[2px] border-black bg-white">
          {keys.length > 0 ? (
            <div className={`flex flex-wrap items-center gap-2 ${visualLegend ? "mb-2" : ""}`}>
              {keys.map((key) => (
                <span
                  key={key.label}
                  className={`h-6 px-2 inline-flex items-center rounded-[4px] border-[2px] text-[9px] font-black uppercase tracking-[0.12em] ${keyToneClass(
                    key.tone,
                  )}`}
                >
                  {key.label}
                </span>
              ))}
            </div>
          ) : null}
          {visualLegend ? visualLegend : null}
        </div>
      ) : null}

      <div className="flex-1 p-4 min-h-[320px]">{children}</div>
      {footer ? footer : null}
    </div>
  )
}
