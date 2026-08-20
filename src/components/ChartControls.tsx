import React, { useRef, useState } from "react"
import { createPortal } from "react-dom"

export function SlabController({
 r1,
 r2,
 r3,
 r4,
 count,
 counts,
 onCountChange,
 sort,
 sorts,
 onSortChange,
 filter,
 filters,
 onFilterChange,
 metric,
 metrics,
 onMetricChange,
}: {
 r1: string
 r2: string
 r3: string
 r4?: string
 count: number
 counts: number[]
 onCountChange: (c: number) => void
 sort: string
 sorts: string[]
 onSortChange: (s: string) => void
 filter?: string
 filters?: string[]
 onFilterChange?: (f: string) => void
 metric: string
 metrics: string[]
 onMetricChange: (m: string) => void
}) {
 const [dropdownOpen, setDropdownOpen] = useState(false)
 const dropdownAnchorRef = useRef<HTMLDivElement | null>(null)
 const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 })

 const toggleDropdown = () => {
  const rect = dropdownAnchorRef.current?.getBoundingClientRect()
  if (rect) setDropdownPosition({
   left: Math.max(8, Math.min(rect.left - 4, window.innerWidth - 163)),
   top: Math.min(rect.bottom, window.innerHeight - 8),
  })
  setDropdownOpen((open) => !open)
 }

 const cycleCount = (dir: number) => {
  const idx = counts.indexOf(count)
  let next = idx + dir
  if (next < 0) next = counts.length - 1
  if (next >= counts.length) next = 0
  onCountChange(counts[next])
 }

 const cycleSort = (dir: number) => {
  const idx = sorts.indexOf(sort)
  let next = idx + dir
  if (next < 0) next = sorts.length - 1
  if (next >= sorts.length) next = 0
  onSortChange(sorts[next])
 }

 const cycleFilter = (dir: number) => {
  if (!filters || !filter || !onFilterChange) return
  const idx = filters.indexOf(filter)
  let next = idx + dir
  if (next < 0) next = filters.length - 1
  if (next >= filters.length) next = 0
  onFilterChange(filters[next])
 }

 const hasFilter = !!filter && !!filters && filters.length > 0

 /* Metric dropdown row uses r4 when 4-row mode, r3 when 3-row mode */
 const metricBg = hasFilter ? (r4 || r3) : r3
 /* Filter row uses r3 */

 return (
  <div
   className="w-[155px] border-l-[4px] border-black flex-shrink-0 flex flex-col relative select-none"
   style={{ "--r1": r1, "--r2": r2, "--r3": r3, "--r4": r4 || r3 } as React.CSSProperties}>

   {/* ROW 1 — Count ◀ N ▶ */}
   <div
    className="flex items-center justify-center py-0 border-b-[4px] border-black h-[30px]"
    style={{ background: r1 }}>
    <button
     onClick={() => cycleCount(-1)}
     className="px-1 py-0 hover:scale-110 active:scale-90 font-black transition-transform text-black">
     ◀
    </button>
    <span className="text-[28px] font-[1000] text-black text-center min-w-[36px] leading-[1]">
     {count}
    </span>
    <button
     onClick={() => cycleCount(1)}
     className="px-1 py-0 hover:scale-110 active:scale-90 font-black transition-transform text-black">
     ▶
    </button>
   </div>

   {/* ROW 2 — Sort ◀ LABEL ▶ */}
   <div
    className="flex items-center justify-center py-0 border-b-[4px] border-black h-[18px]"
    style={{ background: r2 }}>
    <button
     onClick={() => cycleSort(-1)}
     className="px-1 py-0 hover:scale-110 active:scale-90 font-black transition-transform text-black">
     ◀
    </button>
    <span className="text-[12px] font-black text-black uppercase tracking-[0.04em] whitespace-nowrap text-center leading-none">
     {sort}
    </span>
    <button
     onClick={() => cycleSort(1)}
     className="px-1 py-0 hover:scale-110 active:scale-90 font-black transition-transform text-black">
     ▶
    </button>
   </div>

   {/* ROW 3 (optional) — Filter ◀ LABEL ▶ */}
   {hasFilter && (
    <div
     className="flex items-center justify-center py-0 border-b-[4px] border-black h-[18px]"
     style={{ background: r3 }}>
     <button
      onClick={() => cycleFilter(-1)}
      className="px-1 py-0 hover:scale-110 active:scale-90 font-black transition-transform text-black">
      ◀
     </button>
     <span className="text-[12px] font-black text-black uppercase tracking-[0.04em] whitespace-nowrap text-center leading-none">
      {filter}
     </span>
     <button
      onClick={() => cycleFilter(1)}
      className="px-1 py-0 hover:scale-110 active:scale-90 font-black transition-transform text-black">
      ▶
     </button>
    </div>
   )}

   {/* ROW 3/4 — Metric dropdown ▼ */}
   <div
    className="relative flex items-center justify-center py-[1px] px-2 cursor-pointer flex-1 min-h-[20px]"
    style={{ background: metricBg }}
    ref={dropdownAnchorRef}
    onClick={toggleDropdown}>
    <div className="flex items-center gap-[4px]">
     <span className="text-[13px] font-black text-black uppercase tracking-[0.04em]">
      {metric}
     </span>
     <span className="text-[9px] font-black text-black">▼</span>
    </div>
    {dropdownOpen && typeof document !== "undefined" && createPortal(
     <div className="fixed bg-white border-[3px] border-black rounded-b-[10px] z-[1000] overflow-hidden w-[155px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]" style={dropdownPosition}>
      {metrics.map((m) => (
       <button
        key={m}
        className={`block w-full px-[10px] py-[8px] text-[11px] uppercase tracking-[0.06em] text-center transition-colors border-t-[2px] border-black/10 text-black ${
         metric === m
          ? "font-[1000]"
          : "font-black bg-white"
        }`}
        style={{ backgroundColor: metric === m ? r1 : undefined }}
        onMouseEnter={(e) => {
         if (metric !== m) e.currentTarget.style.backgroundColor = metricBg
        }}
        onMouseLeave={(e) => {
         if (metric !== m) e.currentTarget.style.backgroundColor = "white"
        }}
        onClick={(e) => {
         e.stopPropagation()
         onMetricChange(m)
         setDropdownOpen(false)
        }}>
        {m}
       </button>
      ))}
     </div>,
     document.body,
    )}
   </div>
  </div>
 )
}

export function DeepController({
 r1,
 r2,
 r3,
 r4,
 text2,
 text3,
 numberText,
 labelTop,
 labelBottom,
 timeWindow,
 timeWindows,
 onTimeWindowChange,
}: {
 r1: string
 r2: string
 r3: string
 r4: string
 text2: string
 text3: string
 numberText: string | number
 labelTop: string
 labelBottom: string
 timeWindow: string
 timeWindows: string[]
 onTimeWindowChange: (t: string) => void
}) {
 const [dropdownOpen, setDropdownOpen] = useState(false)
 const dropdownAnchorRef = useRef<HTMLDivElement | null>(null)
 const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 })

 const toggleDropdown = () => {
  const rect = dropdownAnchorRef.current?.getBoundingClientRect()
  if (rect) setDropdownPosition({
   left: Math.max(8, Math.min(rect.left - 4, window.innerWidth - 136)),
   top: Math.min(rect.bottom, window.innerHeight - 8),
  })
  setDropdownOpen((open) => !open)
 }

 return (
  <div
   className="w-[128px] border-l-[4px] border-black flex-shrink-0 flex flex-col relative select-none"
   style={{ "--r1": r1, "--r2": r2, "--r3": r3, "--r4": r4 } as React.CSSProperties}>
   <div
    className="flex items-center justify-center py-1 border-b-[4px] border-black h-[38px]"
    style={{ background: r1 }}>
    <span className="text-[32px] font-[1000] text-black text-center min-w-[44px] leading-[0.8]">
     {numberText}
    </span>
   </div>
   <div
    className="flex items-center justify-center py-[2px] border-b-[4px] border-black h-[18px]"
    style={{ background: r2 }}>
    <span
     className="text-[13px] font-black uppercase tracking-[0.06em] leading-none"
     style={{ color: text2 }}>
     {labelTop}
    </span>
   </div>
   <div
    className="flex items-center justify-center py-1 border-b-[4px] border-black h-[28px]"
    style={{ background: r2 }}>
    <span
     className="text-[19px] font-[1000] text-center leading-none mt-1"
     style={{ color: text3 }}>
     {labelBottom}
    </span>
   </div>
   <div
    className="relative flex items-center justify-center py-[6px] px-2 cursor-pointer flex-1"
    style={{ background: r4 }}
    ref={dropdownAnchorRef}
    onClick={toggleDropdown}>
    <div className="flex items-center gap-[6px]">
     <span className="text-[13px] font-black text-black uppercase tracking-[0.04em]">
      {timeWindow}
     </span>
     <span className="text-[10px] font-black text-black">▼</span>
    </div>
    {dropdownOpen && typeof document !== "undefined" && createPortal(
     <div className="fixed bg-white border-[3px] border-black rounded-b-[10px] z-[1000] overflow-hidden w-[128px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]" style={dropdownPosition}>
      {timeWindows.map((m) => (
       <button
        key={m}
        className={`block w-full px-[10px] py-[8px] text-[11px] uppercase tracking-[0.06em] text-center transition-colors border-t-[2px] border-black/10 text-black ${
         timeWindow === m ? "font-[1000]" : "font-black bg-white"
        }`}
        style={{ backgroundColor: timeWindow === m ? r1 : undefined }}
        onMouseEnter={(e) => {
         if (timeWindow !== m) e.currentTarget.style.backgroundColor = r4
        }}
        onMouseLeave={(e) => {
         if (timeWindow !== m) e.currentTarget.style.backgroundColor = "white"
        }}
        onClick={(e) => {
         e.stopPropagation()
         onTimeWindowChange(m)
         setDropdownOpen(false)
        }}>
        {m}
       </button>
      ))}
     </div>,
     document.body,
    )}
   </div>
  </div>
 )
}
