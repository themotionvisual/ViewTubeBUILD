import React from "react"
import {
 ArrowRight,
 BarChart3,
 BookOpen,
 Brain,
 ChevronDown,
 HelpCircle,
 Search,
 Sparkles,
 TrendingUp,
 Video,
} from "lucide-react"
import type { AIBrainAnswerModule, BrainQuickAction } from "../../types"
import { sanitizeCreatorFacingBrainCopy } from "../../services/aiBrainConversationStore"

export type { BrainQuickAction }

/** Tone -> palette. Kept semantic so a "green" module renders green everywhere. */
const MODULE_TONE: Record<AIBrainAnswerModule["tone"], string> = {
 green: "#3FEE56",
 yellow: "#FFDA47",
 pink: "#FF7AC8",
 blue: "#36E0F6",
 orange: "#FFA85C",
 white: "#FFFFFF",
}

const SOURCE_ICON: Record<string, React.ReactNode> = {
 analytics: <BarChart3 size={15} />,
 growth: <TrendingUp size={15} />,
 seo: <Search size={15} />,
 oracle: <Sparkles size={15} />,
 journal: <BookOpen size={15} />,
 memory: <Brain size={15} />,
 question: <HelpCircle size={15} />,
}

const cardShell = "overflow-hidden rounded-[10px] border-[2px] border-black bg-white"

const DELTA_TONE: Record<string, string> = {
 up: "bg-[#3FEE56]",
 down: "bg-[#FA618A]",
 flat: "bg-white",
}

const formatMetricValue = (
 value: number | null | undefined,
 displayValue?: string,
): string => {
 if (displayValue) return displayValue
 if (typeof value !== "number" || !Number.isFinite(value)) return "—"
 if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
 if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}K`
 return value.toLocaleString()
}

/** A minimal area sparkline for a module's trend points (trend_chart / retention_curve). */
const BrainSparkline: React.FC<{ points: Array<{ label: string; value: number | null }>; accent: string }> = ({
 points,
 accent,
}) => {
 const values = points.map((point) => (typeof point.value === "number" && Number.isFinite(point.value) ? point.value : 0))
 if (values.length < 2) return null
 const max = Math.max(...values)
 const min = Math.min(...values)
 const range = max - min || 1
 const width = 240
 const height = 44
 const pad = 3
 const step = (width - pad * 2) / (values.length - 1)
 const coords = values.map((value, index): [number, number] => [
  pad + index * step,
  height - pad - ((value - min) / range) * (height - pad * 2),
 ])
 const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
 const last = coords[coords.length - 1]
 const area = `${line} L${last[0].toFixed(1)},${height - pad} L${coords[0][0].toFixed(1)},${height - pad} Z`
 return (
  <figure className="rounded-[7px] border-[2px] border-black bg-white p-1.5">
   <svg viewBox={`0 0 ${width} ${height}`} className="h-11 w-full" preserveAspectRatio="none" role="img" aria-label="Trend">
    <path d={area} fill={accent} opacity="0.35" />
    <path d={line} fill="none" stroke="#000" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx={last[0]} cy={last[1]} r="3" fill={accent} stroke="#000" strokeWidth="1.5" />
   </svg>
  </figure>
 )
}

/**
 * A Brain answer module.
 *
 * The header carries an icon cell, the module name, and an optional short code chip
 * so a stack of modules stays scannable. Each module renders whichever structured
 * payload it actually carries (figures, ranked items) and falls back to prose, which
 * keeps a module honest: it cannot show a metric row it has no metrics for.
 * Collapsing uses native <details> so it works with the keyboard and without JS.
 */
export const BrainKpiModule: React.FC<{
 module: AIBrainAnswerModule
 compact?: boolean
 className?: string
}> = ({ module, compact = false, className = "" }) => {
 const metrics = module.data?.metrics || []
 const items = module.data?.items || []
 const points = module.data?.points || []
 const missingReason = module.data?.missingReason
 const icon = SOURCE_ICON[module.source || "growth"] || SOURCE_ICON.growth
 const accent = MODULE_TONE[module.tone] || MODULE_TONE.white
 const hasStructured = metrics.length > 0 || items.length > 0 || points.length >= 2

 // Prose-only module: a light labeled section, not a card inside the answer card.
 // Nesting bordered cards for plain text was needless visual weight on every answer.
 if (!hasStructured) {
  if (!module.body && !missingReason) return null
  return (
   <section className={className}>
    <div className="mb-1 flex flex-wrap items-center gap-1.5">
     <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] border-[1.5px] border-black" style={{ backgroundColor: accent }} aria-hidden="true" />
     <h4 className="text-[10px] font-[1000] uppercase leading-4 tracking-[0.1em] text-black/55">
      {sanitizeCreatorFacingBrainCopy(module.title)}
     </h4>
     {module.code ? (
      <span className="rounded-[4px] border-[1.5px] border-black px-1 text-[8px] font-[1000] uppercase tracking-[0.06em]">{module.code}</span>
     ) : null}
    </div>
    {module.body ? (
     <p className="text-[13px] font-bold leading-6 text-black/80">{sanitizeCreatorFacingBrainCopy(module.body)}</p>
    ) : null}
    {missingReason ? (
     <p className="mt-1 text-xs font-bold leading-5 text-black/55">{sanitizeCreatorFacingBrainCopy(missingReason)}</p>
    ) : null}
   </section>
  )
 }

 // Structured module (metrics / ranked evidence): a real data widget earns its card.
 return (
  <article className={`${cardShell} ${className}`}>
   <details open>
    <summary
     className="grid min-h-[36px] cursor-pointer list-none grid-cols-[34px_minmax(0,1fr)_auto_28px] items-stretch border-b-[2px] border-black"
     style={{ backgroundColor: accent }}
    >
     <span className="grid place-items-center border-r-[2px] border-black bg-white">{icon}</span>
     <h4 className="min-w-0 self-center truncate px-2.5 py-1.5 text-[11px] font-[1000] uppercase leading-4 tracking-[0.04em]">
      {sanitizeCreatorFacingBrainCopy(module.title)}
     </h4>
     {module.code ? (
      <span className="my-auto mr-1 self-center rounded-[5px] border-[2px] border-black bg-white/80 px-1.5 py-0.5 text-[8px] font-[1000] uppercase tracking-[0.06em]">
       {module.code}
      </span>
     ) : (
      <span />
     )}
     <span className="grid place-items-center border-l-[2px] border-black bg-white/30">
      <ChevronDown size={14} />
     </span>
    </summary>

    <div className={`grid ${compact ? "gap-2 p-3" : "gap-2.5 p-3.5"}`}>
     {metrics.length ? (
      <dl className="grid grid-cols-3 gap-1.5">
       {metrics.slice(0, 3).map((metric) => (
        <div key={metric.label} className="rounded-[7px] border-[2px] border-black px-1.5 py-1">
         <dt className="text-[8px] font-black uppercase tracking-[0.1em] text-black/45">{metric.label}</dt>
         <dd className="text-sm font-[1000] leading-5 tabular-nums">
          {formatMetricValue(metric.value, metric.displayValue)}
         </dd>
         {typeof metric.change === "number" && Number.isFinite(metric.change) ? (
          <dd
           className={`mt-0.5 inline-block rounded-[4px] border-[1.5px] border-black px-1 text-[8px] font-black tabular-nums ${
            DELTA_TONE[metric.change > 0 ? "up" : metric.change < 0 ? "down" : "flat"]
           }`}
          >
           {metric.change > 0 ? "+" : ""}
           {metric.change}%
          </dd>
         ) : null}
        </div>
       ))}
      </dl>
     ) : null}

     {points.length >= 2 ? <BrainSparkline points={points} accent={accent} /> : null}

     {items.length ? (
      <ol className="grid gap-1.5">
       {items.slice(0, 4).map((item, index) => (
        <li
         key={`${item.title}-${index}`}
         className="grid grid-cols-[22px_minmax(0,1fr)] items-start gap-2 rounded-[7px] border-[2px] border-black px-1.5 py-1"
        >
         <span className="grid h-[18px] place-items-center rounded-[4px] border-[1.5px] border-black bg-[#FFDA47] text-[9px] font-[1000] tabular-nums">
          {index + 1}
         </span>
         <span className="min-w-0">
          <b className="block truncate text-[11px] font-[1000] leading-4">{item.title}</b>
          {item.detail ? (
           <span className="block truncate text-[9px] font-bold uppercase tracking-[0.04em] text-black/50">
            {item.detail}
           </span>
          ) : null}
         </span>
        </li>
       ))}
      </ol>
     ) : null}

     {module.body ? (
      <p className={`font-bold text-black/75 ${compact ? "text-xs leading-5" : "text-[13px] leading-6"}`}>
       {sanitizeCreatorFacingBrainCopy(module.body)}
      </p>
     ) : null}

     {missingReason ? (
      <p className="rounded-[6px] border-[2px] border-black bg-[#FA618A]/20 px-2 py-1 text-[10px] font-bold leading-4">
       {sanitizeCreatorFacingBrainCopy(missingReason)}
      </p>
     ) : null}

     {module.actionLabel ? (
      <span className="inline-flex w-fit rounded-[7px] border-[2px] border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.06em]">
       {module.actionLabel}
      </span>
     ) : null}
    </div>
   </details>
  </article>
 )
}

export const BrainAnswerModuleGrid: React.FC<{
 modules: AIBrainAnswerModule[]
 compact?: boolean
}> = ({ modules, compact = false }) => {
 if (!modules.length) return null
 return (
  <div className={`grid gap-2.5 ${compact ? "" : "sm:grid-cols-2"}`}>
   {modules.map((module) => (
    <BrainKpiModule key={module.id} module={module} compact={compact} />
   ))}
  </div>
 )
}

const EFFORT_TEXT = ["", "5 minutes", "20 minutes", "An hour", "Half a day", "Multi-day"]
const REWARD_TEXT = ["", "Marginal", "Useful", "Solid", "Strong", "Channel-moving"]

const clampScore = (value: number): number => Math.max(1, Math.min(5, Math.round(value)))

/**
 * The effort x reward card. The Brain only raises actions with a strong
 * result-to-effort ratio, so both scores stay visible to the creator.
 */
export const BrainQuickActionCard: React.FC<{
 action: BrainQuickAction
 onAccept?: (action: BrainQuickAction) => void
 compact?: boolean
}> = ({ action, onAccept, compact = false }) => {
 const effort = clampScore(action.effort)
 const reward = clampScore(action.reward)

 if (compact) {
  return (
   <button
    type="button"
    onClick={() => onAccept?.(action)}
    className="group grid w-full grid-cols-[minmax(0,1fr)_13px] items-start gap-2 rounded-[8px] border-[2px] border-black bg-white px-2.5 py-2 text-left transition hover:bg-[#FFDA47]"
   >
    <span className="min-w-0">
     <span className="block text-[10px] font-[1000] uppercase leading-4">
      {sanitizeCreatorFacingBrainCopy(action.title)}
     </span>
     <span className="mt-1 block line-clamp-2 text-[11px] font-bold leading-4 text-black/65">
      {sanitizeCreatorFacingBrainCopy(action.body)}
     </span>
     <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.06em] text-black/45">
      {EFFORT_TEXT[effort]} · {REWARD_TEXT[reward]} payoff
     </span>
    </span>
    <ArrowRight size={13} className="mt-0.5 shrink-0 transition group-hover:translate-x-0.5" />
   </button>
  )
 }

 return (
  <article className={cardShell}>
   <h4 className="border-b-[2px] border-black bg-[#C0F240] px-2.5 py-1.5 text-[11px] font-[1000] uppercase leading-4 tracking-[0.04em]">
    {sanitizeCreatorFacingBrainCopy(action.title)}
   </h4>
   <div className="grid gap-2 p-2.5">
    <p className="text-[11px] font-bold leading-4 text-black/75">
     {sanitizeCreatorFacingBrainCopy(action.body)}
    </p>
    <div className="flex flex-wrap gap-1">
     <span className="rounded-[7px] border-[2px] border-black bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.06em]">
      {EFFORT_TEXT[effort]}
     </span>
     <span className="rounded-[7px] border-[2px] border-black bg-[#FFDA47] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.06em]">
      {REWARD_TEXT[reward]} payoff
     </span>
    </div>
    {onAccept ? (
     <button
      type="button"
      onClick={() => onAccept(action)}
      className="inline-flex w-fit items-center gap-1.5 rounded-[7px] border-[2px] border-black bg-[#3FEE56] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.06em] hover:bg-[#FFDA47]"
     >
      {action.routeLabel || "Start this"}
      <ArrowRight size={12} />
     </button>
    ) : null}
   </div>
  </article>
 )
}

export default BrainKpiModule
