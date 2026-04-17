import React, { useMemo, useState } from "react"

const zoomIn35 = new URL(
 "../../assets/icons/toolbox-toggle/zoom-in-35.png",
 import.meta.url,
).href

const zoomOut35 = new URL(
 "../../assets/icons/toolbox-toggle/zoom-out-35.png",
 import.meta.url,
).href

const RS_TRANSITION = "duration-1000 ease-in-out"

const hexToRgba = (input: string, alpha: number): string => {
 const directHex = input.match(/bg-\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\]/)?.[1]
 const hex = directHex || input.replace("#", "")
 if (!hex) return `rgba(0,0,0,${alpha})`
 const normalized = hex.length === 3
  ? hex.split("").map((c) => `${c}${c}`).join("")
  : hex
 const r = Number.parseInt(normalized.slice(0, 2), 16)
 const g = Number.parseInt(normalized.slice(2, 4), 16)
 const b = Number.parseInt(normalized.slice(4, 6), 16)
 if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(0,0,0,${alpha})`
 return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const ScopeToggleIcon: React.FC<{ open: boolean; size?: number }> = ({
 open,
 size = 24,
}) => (
 <div
  className="relative group flex items-center justify-center shrink-0 cursor-pointer"
  style={{ width: size, height: size }}>
  <div
   className={`absolute inset-0 w-full h-full transition-all ${RS_TRANSITION} rotate-45 ${open ? "scale-90" : "scale-100"} group-hover:scale-110 group-active:scale-95`}>
   <img
    alt="Open toolbox"
    src={zoomOut35}
    className={`absolute inset-0 w-full h-full inline-block select-none pointer-events-none transition-all ${RS_TRANSITION} ${open ? "opacity-0 rotate-180 scale-75" : "opacity-80 rotate-0 scale-100 group-hover:opacity-100"}`}
   />
   <img
    alt="Close toolbox"
    src={zoomIn35}
    className={`absolute inset-0 w-full h-full inline-block select-none pointer-events-none transition-all ${RS_TRANSITION} ${open ? "opacity-80 rotate-180 scale-100 group-hover:opacity-100" : "opacity-0 rotate-0 scale-75"}`}
   />
  </div>
 </div>
)

interface MainToolboxProps {
 title: string
 subtitle: string
 icon: React.ReactNode
 scopeId?: string
 headerColor?: string
 iconBoxColor?: string
 defaultOpen?: boolean
 mountOnOpen?: boolean
 children: React.ReactNode
}

export const MainToolbox: React.FC<MainToolboxProps> = ({
 title,
 subtitle,
 icon,
 scopeId,
 headerColor = "bg-[#CCFF00]",
 iconBoxColor = "bg-[#24D3FF]",
 defaultOpen = false,
 mountOnOpen = false,
 children,
}) => {
 const [open, setOpen] = useState(defaultOpen)
 const shadowColor = hexToRgba(headerColor, 0.45)

 return (
  <section
   className="w-full border-[5px] border-black rounded-2xl bg-white overflow-hidden mb-8 relative isolation-auto"
   data-rs-shell="main"
   data-rs-scope={scopeId || "default"}
   style={{
    isolation: "isolate",
    contain: "content",
    boxShadow: `10px 10px 0px 0px ${shadowColor}`,
   }}>
   <header
    className={`h-20 border-b-[5px] border-black flex items-stretch ${headerColor} cursor-pointer select-none`}
    onClick={() => setOpen((prev) => !prev)}
    role="button"
    aria-expanded={open}>
    <div className={`h-full w-20 shrink-0 border-r-[5px] border-black flex items-center justify-center ${iconBoxColor}`}>
     {icon}
    </div>
    <div className="flex-1 min-w-0 px-5 flex items-center">
     <h2 className="text-[44px] leading-none font-[1000] uppercase tracking-tighter truncate">{title}</h2>
    </div>
    <div className="h-full w-16 flex items-center justify-center pr-2">
     <ScopeToggleIcon open={open} size={30} />
    </div>
   </header>

   <div className="border-b-[5px] border-black px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black/60">
    {subtitle}
   </div>

   <div
    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
    <div className="overflow-hidden min-h-0">
     {!mountOnOpen || open ? (
      <div className="p-4 md:p-6 bg-white">{children}</div>
     ) : null}
    </div>
   </div>
  </section>
 )
}

interface SectionCardProps {
 title: string
 subtitle?: string
 scopeId?: string
 headerColor?: string
 paletteIndex?: number
 icon?: React.ReactNode
 collapsible?: boolean
 isOpenInitial?: boolean
 wrapperClassName?: string
 contentClassName?: string
 children: React.ReactNode
}

export const SectionCard: React.FC<SectionCardProps> = ({
 title,
 subtitle,
 scopeId,
 headerColor = "bg-[#24D3FF]",
 icon,
 collapsible = false,
 isOpenInitial = true,
 wrapperClassName = "",
 contentClassName = "p-4 md:p-5 flex-1 flex flex-col gap-4",
 children,
}) => {
 const [open, setOpen] = useState(isOpenInitial)
 const shadowColor = hexToRgba(headerColor, 0.45)

 const body = useMemo(
  () => (
   <div className="space-y-4">
    {subtitle ? (
     <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-50">
      {subtitle}
     </p>
    ) : null}
    {children}
   </div>
  ),
  [children, subtitle],
 )

 return (
  <div
   className={wrapperClassName}
   data-rs-shell="sub"
   data-rs-scope={scopeId || "default"}
   style={{ isolation: "isolate", contain: "content" }}>
   <article
    className="w-full border-[4px] border-black rounded-2xl bg-white overflow-hidden"
    style={{ boxShadow: `6px 6px 0px 0px ${shadowColor}` }}>
    <header
     className={`h-14 border-b-[4px] border-black flex items-center ${headerColor} select-none ${collapsible ? "cursor-pointer" : ""}`}
     onClick={collapsible ? () => setOpen((prev) => !prev) : undefined}
     role={collapsible ? "button" : undefined}
     aria-expanded={collapsible ? open : undefined}>
     <div className="flex items-center gap-2 px-3 min-w-0 flex-1">
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="text-[30px] leading-none font-[900] uppercase tracking-tighter truncate">{title}</span>
     </div>
     {collapsible ? (
      <div className="h-full w-14 flex items-center justify-center pr-2">
       <ScopeToggleIcon open={open} size={24} />
      </div>
     ) : null}
    </header>

    <div
     className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${!collapsible || open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
     <div className="overflow-hidden min-h-0">
      <div className={contentClassName}>{body}</div>
     </div>
    </div>
   </article>
  </div>
 )
}

export const PillList: React.FC<{ items: string[] }> = ({ items }) => (
 <div className="flex flex-wrap gap-2">
  {items.map((item) => (
   <span
    key={item}
    className="inline-flex items-center h-7 px-3 border-[3px] border-black rounded-lg bg-white text-[10px] font-black uppercase tracking-[0.12em]">
    {item}
   </span>
  ))}
 </div>
)

export const SourceFrame: React.FC<{
 src: string
 title: string
 heightClassName?: string
}> = ({
 src,
 title,
 heightClassName = "h-[460px]",
}) => (
 <div
  className="w-full border-[4px] border-black rounded-2xl overflow-hidden bg-white"
  data-rs-shell="source-frame"
  style={{ isolation: "isolate", contain: "layout style paint" }}>
  <div className="h-10 px-3 border-b-[4px] border-black bg-[#FFE357] flex items-center justify-between">
   <span className="text-[10px] font-black uppercase tracking-[0.14em]">
    Source Preview
   </span>
   <a
    href={src}
    target="_blank"
    rel="noreferrer"
    className="text-[9px] font-black uppercase tracking-[0.14em] underline">
    {title}
   </a>
  </div>
  <div className="w-full relative" style={{ contain: "paint layout" }}>
   <iframe
    src={src}
    title={title}
    className={`w-full bg-white ${heightClassName}`}
    loading="lazy"
   />
  </div>
 </div>
)

export const MetricTile: React.FC<{ label: string; value: string }> = ({
 label,
 value,
}) => (
 <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
  <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-50">
   {label}
  </p>
  <p className="text-3xl font-[1000] tracking-tight leading-none mt-2">{value}</p>
 </div>
)
