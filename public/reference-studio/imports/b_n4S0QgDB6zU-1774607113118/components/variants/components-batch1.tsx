"use client"

import { useState, useRef } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// NEO-BRUTALIST PALETTE
// pink:#ff66cc  lime:#ccff00  cyan:#00ccff  yellow:#ffdd00  orange:#ffb158
// All borders: 3px solid black  |  Shadows: 4px 4px 0px black (no blur)
// Zero border-radius across the board
// ─────────────────────────────────────────────────────────────────────────────

// =============================================================================
// ALERT — 10 variants
// =============================================================================
const alertBase = "border-3 border-black font-bold px-4 py-3 text-sm flex items-start gap-3"

export function AlertV1({ children }: { children?: React.ReactNode }) {
  return <div className={`${alertBase} bg-[#ff66cc] shadow-[4px_4px_0px_black]`}><span className="text-black font-black text-base">!</span><span>{children ?? "This is an important alert."}</span></div>
}
export function AlertV2({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return <div className={`${alertBase} bg-[#ccff00] shadow-[4px_4px_0px_black] justify-between`}><span className="flex items-center gap-2"><span className="text-black font-black">▲</span>{children ?? "Warning: action required."}</span><button onClick={() => setOpen(false)} className="font-black text-black hover:opacity-70 text-lg leading-none ml-2">×</button></div>
}
export function AlertV3({ children }: { children?: React.ReactNode }) {
  return <div className={`${alertBase} bg-[#00ccff] border-l-8 border-l-black shadow-[4px_4px_0px_black]`}><span>{children ?? "Info: read this carefully."}</span></div>
}
export function AlertV4({ children }: { children?: React.ReactNode }) {
  return <div className="border-3 border-black bg-black text-[#ccff00] px-4 py-3 font-bold text-sm flex gap-3 shadow-[4px_4px_0px_#ccff00]"><span className="font-black text-[#ff66cc]">SYS</span><span>{children ?? "System notification received."}</span></div>
}
export function AlertV5({ children }: { children?: React.ReactNode }) {
  return <div className="border-3 border-black bg-[#ffdd00] px-4 py-3 font-bold text-sm relative overflow-hidden shadow-[4px_4px_0px_black]"><div className="absolute inset-0 opacity-20" style={{backgroundImage:"repeating-linear-gradient(45deg,black 0,black 2px,transparent 0,transparent 50%)",backgroundSize:"8px 8px"}} /><span className="relative">{children ?? "Hazard: proceed with caution."}</span></div>
}
export function AlertV6({ children }: { children?: React.ReactNode }) {
  return <div className="border-3 border-black bg-white px-4 py-3 font-bold text-sm flex gap-3 shadow-[4px_4px_0px_black]"><div className="w-5 h-5 bg-[#ff66cc] border-2 border-black shrink-0 flex items-center justify-center text-xs font-black">✓</div><span>{children ?? "Success: operation complete."}</span></div>
}
export function AlertV7({ children }: { children?: React.ReactNode }) {
  return <div className="border-3 border-black bg-[#ffb158] px-4 py-3 font-bold text-sm shadow-[6px_6px_0px_black]"><div className="text-xs font-black uppercase tracking-widest mb-1 border-b-2 border-black pb-1">Notice</div><div>{children ?? "Please review before continuing."}</div></div>
}
export function AlertV8({ children }: { children?: React.ReactNode }) {
  return <div className="border-4 border-black bg-white px-4 py-3 font-bold text-sm flex gap-3 outline outline-4 outline-[#ff66cc] outline-offset-2"><span className="w-6 h-6 rounded-full bg-[#ff66cc] border-2 border-black shrink-0 flex items-center justify-center text-xs font-black text-white">i</span><span>{children ?? "FYI: something you should know."}</span></div>
}
export function AlertV9({ children }: { children?: React.ReactNode }) {
  return <div className="bg-[#ccff00] border-3 border-black px-4 py-3 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_black] transform -skew-x-2"><span className="skew-x-2">{children ?? "ALERT: CHECK THIS OUT"}</span></div>
}
export function AlertV10({ children }: { children?: React.ReactNode }) {
  return <div className="border-3 border-black bg-white px-4 py-3 font-bold text-sm shadow-[4px_4px_0px_black] relative"><div className="absolute top-0 left-0 h-full w-2 bg-[#00ccff]" /><div className="pl-3">{children ?? "Info with side stripe accent."}</div></div>
}

// =============================================================================
// AVATAR — 10 variants
// =============================================================================
const avatarColors = ["#ff66cc","#ccff00","#00ccff","#ffdd00","#ffb158"]

export function AvatarV1({ initials = "AB" }: { initials?: string }) {
  return <div className="w-12 h-12 border-3 border-black bg-[#ff66cc] flex items-center justify-center font-black text-sm shadow-[3px_3px_0px_black]">{initials}</div>
}
export function AvatarV2({ initials = "CD" }: { initials?: string }) {
  return <div className="w-12 h-12 border-3 border-black bg-[#ccff00] flex items-center justify-center font-black text-sm shadow-[3px_3px_0px_black] transform rotate-3 hover:rotate-0 transition-transform">{initials}</div>
}
export function AvatarV3({ initials = "EF" }: { initials?: string }) {
  return <div className="w-14 h-14 border-4 border-black bg-black text-[#ff66cc] flex items-center justify-center font-black text-lg shadow-[4px_4px_0px_#ff66cc]">{initials}</div>
}
export function AvatarV4({ initials = "GH" }: { initials?: string }) {
  return <div className="relative w-12 h-12"><div className="w-12 h-12 border-3 border-black bg-[#00ccff] flex items-center justify-center font-black text-sm">{initials}</div><div className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-black bg-[#ccff00]" /></div>
}
export function AvatarV5({ initials = "IJ" }: { initials?: string }) {
  return <div className="w-12 h-12 border-3 border-black bg-[#ffdd00] flex items-center justify-center font-black text-sm shadow-[4px_4px_0px_black] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] transition-all">{initials}</div>
}
export function AvatarGroupV1({ count = 4 }: { count?: number }) {
  const cols = ["#ff66cc","#ccff00","#00ccff","#ffdd00"]
  return (
    <div className="flex -space-x-3">
      {Array.from({length: Math.min(count,4)}).map((_,i) => (
        <div key={i} className="w-10 h-10 border-3 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_black] z-10" style={{backgroundColor: cols[i], zIndex: count - i}}>
          {String.fromCharCode(65+i*2)}{String.fromCharCode(66+i*2)}
        </div>
      ))}
      {count > 4 && <div className="w-10 h-10 border-3 border-black bg-black text-white flex items-center justify-center font-black text-xs z-0">+{count-4}</div>}
    </div>
  )
}
export function AvatarV6({ initials = "KL" }: { initials?: string }) {
  return <div className="relative w-12 h-12 border-3 border-black bg-[#ffb158] flex items-center justify-center font-black text-sm shadow-[4px_4px_0px_black]">{initials}<div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#ccff00] border-2 border-black rounded-full" /></div>
}
export function AvatarV7({ initials = "MN" }: { initials?: string }) {
  return <div className="w-16 h-16 border-3 border-black bg-white shadow-[4px_4px_0px_black] flex flex-col"><div className="h-1/3 bg-[#ff66cc] border-b-3 border-b-black" /><div className="flex-1 flex items-center justify-center font-black text-base">{initials}</div></div>
}
export function AvatarV8({ initials = "OP" }: { initials?: string }) {
  return <div className="w-12 h-12 border-3 border-black bg-[#ccff00] flex items-center justify-center font-black text-sm shadow-[4px_4px_0px_black] outline outline-3 outline-black outline-offset-3">{initials}</div>
}
export function AvatarV9({ count = 5 }: { count?: number }) {
  const cols = ["#ff66cc","#ccff00","#00ccff","#ffdd00","#ffb158"]
  return (
    <div className="flex items-center gap-1">
      {Array.from({length: Math.min(count,5)}).map((_,i) => (
        <div key={i} className="w-9 h-9 border-2 border-black flex items-center justify-center font-black text-xs" style={{backgroundColor: cols[i]}}>
          {String.fromCharCode(65+i)}
        </div>
      ))}
    </div>
  )
}
export function AvatarV10({ initials = "QR" }: { initials?: string }) {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
      <div className="relative w-12 h-12 border-3 border-black bg-[#00ccff] flex items-center justify-center font-black text-sm">{initials}</div>
    </div>
  )
}

// =============================================================================
// BREADCRUMB — 10 variants
// =============================================================================
const crumbs = ["Home","Library","Components"]

export function BreadcrumbV1() {
  return <nav className="flex items-center gap-0 font-bold text-sm border-3 border-black bg-white shadow-[3px_3px_0px_black] w-fit">{crumbs.map((c,i) => <span key={c} className="flex items-center"><span className={`px-3 py-2 ${i===crumbs.length-1?"bg-[#ff66cc] border-l-3 border-l-black":""}`}>{c}</span>{i<crumbs.length-1&&<span className="px-1 text-black font-black">/</span>}</span>)}</nav>
}
export function BreadcrumbV2() {
  return <nav className="flex items-center gap-0 font-bold text-sm w-fit">{crumbs.map((c,i) => <span key={c} className="flex items-center">{i>0&&<span className="w-0 h-0 border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent border-l-[12px] border-l-black" />}<span className={`px-3 py-1.5 border-3 border-black ${i===crumbs.length-1?"bg-[#ccff00]":"bg-white"} ${i>0?"-ml-0.5":""}`}>{c}</span></span>)}</nav>
}
export function BreadcrumbV3() {
  return <nav className="flex items-center gap-2 font-bold text-sm">{crumbs.map((c,i) => <span key={c} className="flex items-center gap-2">{i>0&&<span className="font-black text-black">▶</span>}<span className={`px-2 py-1 border-b-3 border-b-black ${i===crumbs.length-1?"border-b-[#ff66cc] text-black":""}`}>{c}</span></span>)}</nav>
}
export function BreadcrumbV4() {
  return <nav className="flex items-center gap-1 font-bold text-sm">{crumbs.map((c,i) => <span key={c} className="flex items-center gap-1">{i>0&&<span className="font-black">×</span>}<span className={`px-3 py-1.5 border-3 border-black shadow-[2px_2px_0px_black] ${i===crumbs.length-1?"bg-[#ff66cc]":"bg-white hover:bg-[#ccff00] cursor-pointer"}`}>{c}</span></span>)}</nav>
}
export function BreadcrumbV5() {
  return <nav className="flex items-center gap-0 font-black text-sm uppercase tracking-wider border-3 border-black bg-black text-[#ccff00] shadow-[4px_4px_0px_#ff66cc] w-fit">{crumbs.map((c,i) => <span key={c} className="flex items-center"><span className={`px-3 py-2 ${i===crumbs.length-1?"text-[#ff66cc]":""}`}>{c}</span>{i<crumbs.length-1&&<span className="px-0.5">·</span>}</span>)}</nav>
}
export function BreadcrumbV6() {
  return <nav className="flex items-center gap-1.5 font-bold text-sm">{crumbs.map((c,i) => <span key={c} className="flex items-center gap-1.5">{i>0&&<span className="w-5 h-px bg-black" />}<span className={`border-3 border-black px-2 py-1 ${i===crumbs.length-1?"bg-[#00ccff] shadow-[3px_3px_0px_black]":"bg-white"}`}>{i+1}. {c}</span></span>)}</nav>
}
export function BreadcrumbV7() {
  return <nav className="font-bold text-sm border-3 border-black w-fit shadow-[4px_4px_0px_black]"><div className="px-3 py-1 bg-[#ccff00] border-b-3 border-b-black text-xs uppercase tracking-widest font-black">Path</div><div className="px-3 py-1.5 bg-white flex items-center gap-2">{crumbs.map((c,i)=><span key={c} className="flex items-center gap-2">{i>0&&<span>/</span>}<span className={i===crumbs.length-1?"underline underline-offset-2 decoration-[#ff66cc] decoration-2":""}>{c}</span></span>)}</div></nav>
}
export function BreadcrumbV8() {
  return <nav className="flex items-center gap-0 font-bold text-sm w-fit">{crumbs.map((c,i) => <span key={c} className={`px-3 py-2 border-3 border-black ${i>0?"-ml-px":""} ${i===crumbs.length-1?"bg-[#ff66cc] z-10":"bg-white hover:bg-gray-50 cursor-pointer"}`} style={{zIndex: i+1}}>{c}</span>)}</nav>
}
export function BreadcrumbV9() {
  return <nav className="flex items-center gap-2 font-bold text-sm">{crumbs.map((c,i) => <span key={c} className="flex items-center gap-2">{i>0&&<span className="text-[#ff66cc] font-black text-base">→</span>}<span className={i===crumbs.length-1?"bg-[#ccff00] border-3 border-black px-2 py-0.5 shadow-[2px_2px_0px_black]":"text-black hover:underline cursor-pointer"}>{c}</span></span>)}</nav>
}
export function BreadcrumbV10() {
  return <nav className="flex items-center font-bold text-sm border-3 border-black shadow-[4px_4px_0px_black] w-fit overflow-hidden">{crumbs.map((c,i) => <span key={c} style={{backgroundColor: i===0?"white":i===1?"#ffdd00":"#ff66cc"}} className={`px-3 py-2 flex items-center gap-2 ${i>0?"border-l-3 border-l-black":""}`}><span className="w-4 h-4 border-2 border-black bg-white flex items-center justify-center text-xs font-black">{i+1}</span>{c}</span>)}</nav>
}

// =============================================================================
// CAROUSEL — 10 variants
// =============================================================================
const carouselSlides = [
  { bg: "#ff66cc", label: "Slide One" },
  { bg: "#ccff00", label: "Slide Two" },
  { bg: "#00ccff", label: "Slide Three" },
]

function useCarousel(len: number) {
  const [idx, setIdx] = useState(0)
  const prev = () => setIdx(i => (i - 1 + len) % len)
  const next = () => setIdx(i => (i + 1) % len)
  return { idx, prev, next, setIdx }
}

export function CarouselV1() {
  const { idx, prev, next } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] w-full">
      <div className="h-28 flex items-center justify-center font-black text-xl border-b-3 border-b-black" style={{backgroundColor: s.bg}}>{s.label}</div>
      <div className="flex border-t-0">
        <button onClick={prev} className="flex-1 py-2 border-r-3 border-r-black font-black hover:bg-[#ff66cc] transition-colors">←</button>
        <button onClick={next} className="flex-1 py-2 font-black hover:bg-[#ccff00] transition-colors">→</button>
      </div>
    </div>
  )
}
export function CarouselV2() {
  const { idx, prev, next } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="border-3 border-black shadow-[6px_6px_0px_black] w-full relative">
      <div className="h-28 flex items-center justify-center font-black text-xl" style={{backgroundColor: s.bg}}>{s.label}</div>
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black text-white border-3 border-black font-black flex items-center justify-center hover:bg-[#ff66cc] hover:text-black">‹</button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black text-white border-3 border-black font-black flex items-center justify-center hover:bg-[#ccff00] hover:text-black">›</button>
    </div>
  )
}
export function CarouselV3() {
  const { idx, prev, next, setIdx } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] w-full">
      <div className="h-24 flex items-center justify-center font-black text-xl border-b-3 border-b-black" style={{backgroundColor: s.bg}}>{s.label}</div>
      <div className="flex items-center justify-between px-3 py-2 bg-white">
        <button onClick={prev} className="font-black hover:text-[#ff66cc]">PREV</button>
        <div className="flex gap-2">{carouselSlides.map((_,i) => <button key={i} onClick={()=>setIdx(i)} className={`w-4 h-4 border-2 border-black ${i===idx?"bg-[#ff66cc]":"bg-white hover:bg-[#ccff00]"}`} />)}</div>
        <button onClick={next} className="font-black hover:text-[#ff66cc]">NEXT</button>
      </div>
    </div>
  )
}
export function CarouselV4() {
  const { idx, prev, next } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="w-full">
      <div className="border-3 border-black shadow-[4px_4px_0px_black] h-28 flex items-center justify-center font-black text-2xl" style={{backgroundColor: s.bg}}>{s.label}</div>
      <div className="flex gap-2 mt-2">
        <button onClick={prev} className="flex-1 border-3 border-black bg-white font-black py-1.5 hover:bg-[#ff66cc] shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all">← BACK</button>
        <button onClick={next} className="flex-1 border-3 border-black bg-[#ccff00] font-black py-1.5 hover:bg-[#ffdd00] shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all">NEXT →</button>
      </div>
    </div>
  )
}
export function CarouselV5() {
  const { idx, prev, next, setIdx } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="border-4 border-black shadow-[6px_6px_0px_black] w-full bg-black">
      <div className="border-b-3 border-b-[#ccff00] px-3 py-1 flex items-center justify-between"><span className="font-black text-[#ff66cc] text-xs uppercase tracking-widest">Gallery</span><span className="font-mono text-[#ccff00] text-xs">{idx+1}/{carouselSlides.length}</span></div>
      <div className="h-24 flex items-center justify-center font-black text-xl" style={{backgroundColor: s.bg}}>{s.label}</div>
      <div className="flex justify-center gap-3 py-2">{carouselSlides.map((_,i) => <button key={i} onClick={()=>setIdx(i)} className={`w-2 h-2 border border-[#ccff00] ${i===idx?"bg-[#ccff00]":"bg-transparent"}`} />)}</div>
      <div className="flex border-t-3 border-t-[#00ccff]">
        <button onClick={prev} className="flex-1 py-2 text-[#ff66cc] font-black hover:bg-[#ff66cc]/20 border-r-3 border-r-[#00ccff] text-sm">PREV</button>
        <button onClick={next} className="flex-1 py-2 text-[#ccff00] font-black hover:bg-[#ccff00]/20 text-sm">NEXT</button>
      </div>
    </div>
  )
}
export function CarouselV6() {
  const { idx, prev, next } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] w-full overflow-hidden">
      <div className="flex">
        <button onClick={prev} className="w-10 flex items-center justify-center border-r-3 border-r-black font-black text-xl bg-white hover:bg-[#ff66cc] transition-colors">‹</button>
        <div className="flex-1 h-28 flex items-center justify-center font-black text-xl border-none" style={{backgroundColor: s.bg}}>{s.label}</div>
        <button onClick={next} className="w-10 flex items-center justify-center border-l-3 border-l-black font-black text-xl bg-white hover:bg-[#ccff00] transition-colors">›</button>
      </div>
    </div>
  )
}
export function CarouselV7() {
  const { idx, prev, next } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1 flex-1 border-3 border-black bg-white overflow-hidden"><div className="h-full bg-[#ff66cc] transition-all duration-300" style={{width:`${((idx+1)/carouselSlides.length)*100}%`}} /></div>
        <span className="font-black text-xs">{idx+1}/{carouselSlides.length}</span>
      </div>
      <div className="border-3 border-black shadow-[4px_4px_0px_black] h-24 flex items-center justify-center font-black text-xl" style={{backgroundColor: s.bg}}>{s.label}</div>
      <div className="flex justify-between mt-2">
        <button onClick={prev} className="border-3 border-black bg-white px-4 py-1.5 font-black hover:bg-[#ff66cc] shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]">←</button>
        <button onClick={next} className="border-3 border-black bg-[#ccff00] px-4 py-1.5 font-black hover:bg-[#ffdd00] shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]">→</button>
      </div>
    </div>
  )
}
export function CarouselV8() {
  const { idx, prev, next } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] w-full bg-white">
      <div className="flex items-center justify-between border-b-3 border-b-black px-3 py-2 bg-[#ffdd00]">
        <span className="font-black text-sm uppercase">Carousel</span>
        <div className="flex gap-1">{carouselSlides.map((_,i)=><span key={i} className={`w-3 h-3 border-2 border-black inline-block ${i===idx?"bg-black":""}`} />)}</div>
      </div>
      <div className="h-20 flex items-center justify-center font-black text-xl" style={{backgroundColor: s.bg}}>{s.label}</div>
      <div className="flex justify-between px-3 py-2 border-t-3 border-t-black">
        <button onClick={prev} className="font-black text-sm hover:text-[#ff66cc]">‹ Prev</button>
        <button onClick={next} className="font-black text-sm hover:text-[#ff66cc]">Next ›</button>
      </div>
    </div>
  )
}
export function CarouselV9() {
  const { idx, prev, next, setIdx } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="flex gap-2 items-stretch w-full">
      <button onClick={prev} className="w-10 border-3 border-black bg-white font-black text-xl hover:bg-[#ff66cc] shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]">‹</button>
      <div className="flex-1 flex flex-col">
        <div className="border-3 border-black shadow-[4px_4px_0px_black] h-24 flex items-center justify-center font-black text-xl" style={{backgroundColor: s.bg}}>{s.label}</div>
        <div className="flex justify-center gap-2 mt-2">{carouselSlides.map((_,i)=><button key={i} onClick={()=>setIdx(i)} className={`px-2 py-0.5 border-2 border-black font-bold text-xs ${i===idx?"bg-[#ff66cc]":"bg-white"}`}>{i+1}</button>)}</div>
      </div>
      <button onClick={next} className="w-10 border-3 border-black bg-[#ccff00] font-black text-xl hover:bg-[#ffdd00] shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]">›</button>
    </div>
  )
}
export function CarouselV10() {
  const { idx, prev, next } = useCarousel(carouselSlides.length)
  const s = carouselSlides[idx]
  return (
    <div className="w-full relative">
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black" />
      <div className="relative border-3 border-black bg-white">
        <div className="h-28 flex items-center justify-center font-black text-2xl border-b-3 border-b-black" style={{backgroundColor: s.bg}}>{s.label}</div>
        <div className="flex">
          <button onClick={prev} className="flex-1 py-2 font-black border-r-3 border-r-black hover:bg-[#ff66cc]">← PREV</button>
          <button onClick={next} className="flex-1 py-2 font-black hover:bg-[#ccff00]">NEXT →</button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// COLOR PICKER — 10 variants
// =============================================================================
const palette = ["#ff66cc","#ccff00","#00ccff","#ffdd00","#ffb158","#ff4444","#4444ff","#44ff88","#ffffff","#000000"]

export function ColorPickerV1() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] p-3 bg-white w-fit">
      <div className="font-black text-xs uppercase mb-2 border-b-3 border-b-black pb-1">Color Picker</div>
      <div className="flex flex-wrap gap-1.5 w-52">
        {palette.map(c => <button key={c} onClick={()=>setColor(c)} className={`w-8 h-8 border-3 ${color===c?"border-[#ff66cc] scale-110":"border-black"} transition-all`} style={{backgroundColor:c}} />)}
      </div>
      <div className="mt-2 border-3 border-black h-8 flex items-center px-2 font-mono text-xs gap-2"><div className="w-4 h-4 border-2 border-black" style={{backgroundColor:color}} />{color}</div>
    </div>
  )
}
export function ColorPickerV2() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-black p-3 w-fit">
      <div className="font-black text-xs uppercase mb-2 text-[#ccff00]">Pick Color</div>
      <div className="flex gap-1.5 flex-wrap w-52">
        {palette.map(c => <button key={c} onClick={()=>setColor(c)} className={`w-8 h-8 border-2 ${color===c?"border-[#ccff00]":"border-white/30"} hover:border-white transition-all`} style={{backgroundColor:c}} />)}
      </div>
      <div className="mt-2 border-2 border-[#ccff00] h-8 flex items-center px-2 font-mono text-xs text-[#ccff00] gap-2"><div className="w-4 h-4 border border-[#ccff00]" style={{backgroundColor:color}} />{color}</div>
    </div>
  )
}
export function ColorPickerV3() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-white w-fit">
      <div className="bg-[#ccff00] border-b-3 border-b-black px-3 py-1.5 font-black text-xs uppercase">Select</div>
      <div className="p-3">
        <div className="flex flex-col gap-1">
          {palette.slice(0,6).map(c => <button key={c} onClick={()=>setColor(c)} className={`flex items-center gap-2 px-2 py-1 border-2 ${color===c?"border-[#ff66cc] bg-[#ff66cc]/10":"border-transparent hover:border-black"} transition-all`}><div className="w-5 h-5 border-2 border-black" style={{backgroundColor:c}} /><span className="font-mono text-xs">{c}</span></button>)}
        </div>
      </div>
    </div>
  )
}
export function ColorPickerV4() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="flex items-center gap-3 border-3 border-black shadow-[3px_3px_0px_black] bg-white px-3 py-2 w-fit">
      <div className="w-10 h-10 border-3 border-black shadow-[3px_3px_0px_black]" style={{backgroundColor:color}} />
      <div className="flex flex-wrap gap-1 w-40">
        {palette.map(c => <button key={c} onClick={()=>setColor(c)} className={`w-5 h-5 border-2 ${color===c?"border-[#ff66cc]":"border-black"}`} style={{backgroundColor:c}} />)}
      </div>
    </div>
  )
}
export function ColorPickerV5() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="w-fit">
      <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-[#ffdd00] px-3 pt-2 pb-1">
        <div className="font-black text-xs mb-2 uppercase">Palette</div>
        <div className="grid grid-cols-5 gap-1">
          {palette.map(c => <button key={c} onClick={()=>setColor(c)} className={`w-7 h-7 border-2 border-black ${color===c?"outline outline-2 outline-[#ff66cc] outline-offset-1":""}`} style={{backgroundColor:c}} />)}
        </div>
        <div className="mt-2 font-mono text-xs font-bold border-t-2 border-t-black pt-1">{color}</div>
      </div>
    </div>
  )
}
export function ColorPickerV6() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-white p-2 w-fit flex flex-col gap-2">
      <div className="h-12 border-3 border-black" style={{backgroundColor:color}} />
      <div className="flex flex-wrap gap-1">
        {palette.map(c => <button key={c} onClick={()=>setColor(c)} className="w-6 h-6 border-2 border-black hover:scale-110 transition-transform" style={{backgroundColor:c}} />)}
      </div>
      <div className="font-mono text-xs font-bold text-center border-3 border-black py-1">{color}</div>
    </div>
  )
}
export function ColorPickerV7() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="border-4 border-black bg-white w-fit overflow-hidden shadow-[6px_6px_0px_black]">
      {palette.slice(0,5).map(c => <button key={c} onClick={()=>setColor(c)} className={`block w-full px-4 py-1.5 font-mono text-xs font-bold text-left border-b-2 border-b-black flex items-center gap-2 ${color===c?"":"hover:bg-gray-50"}`} style={{backgroundColor: color===c ? c : "white"}}><div className="w-3 h-3 border border-black" style={{backgroundColor:c}} />{c}</button>)}
    </div>
  )
}
export function ColorPickerV8() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="flex gap-2 items-center border-3 border-black p-2 bg-white shadow-[4px_4px_0px_black] w-fit">
      <div className="flex flex-col gap-1">{palette.slice(0,5).map(c => <button key={c} onClick={()=>setColor(c)} className={`w-4 h-4 border-2 ${color===c?"border-[#ff66cc]":"border-black"}`} style={{backgroundColor:c}} />)}</div>
      <div className="w-16 h-16 border-3 border-black shadow-[3px_3px_0px_black]" style={{backgroundColor:color}} />
      <div className="flex flex-col gap-1">{palette.slice(5,10).map(c => <button key={c} onClick={()=>setColor(c)} className={`w-4 h-4 border-2 ${color===c?"border-[#ff66cc]":"border-black"}`} style={{backgroundColor:c}} />)}</div>
    </div>
  )
}
export function ColorPickerV9() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-white w-fit">
      <div className="flex items-center gap-2 bg-[#ff66cc] border-b-3 border-b-black px-3 py-2">
        <div className="w-6 h-6 border-2 border-black" style={{backgroundColor:color}} />
        <span className="font-mono text-xs font-black">{color}</span>
      </div>
      <div className="p-3 grid grid-cols-5 gap-1.5">
        {palette.map(c => <button key={c} onClick={()=>setColor(c)} className={`w-8 h-8 border-3 ${color===c?"border-black":"border-transparent"} hover:border-black transition-all`} style={{backgroundColor:c}} />)}
      </div>
    </div>
  )
}
export function ColorPickerV10() {
  const [color, setColor] = useState("#ff66cc")
  return (
    <div className="w-fit">
      <div className="relative">
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black" />
        <div className="relative border-3 border-black bg-white p-3">
          <div className="flex flex-wrap gap-1.5 w-52 mb-2">
            {palette.map(c => <button key={c} onClick={()=>setColor(c)} className={`w-8 h-8 border-3 ${color===c?"border-[#ff66cc]":"border-black"} hover:-translate-y-0.5 transition-transform`} style={{backgroundColor:c}} />)}
          </div>
          <div className="flex items-center gap-2 border-3 border-black px-2 py-1">
            <div className="w-4 h-4 border-2 border-black" style={{backgroundColor:color}} />
            <span className="font-mono text-xs font-bold">{color}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// COPY BUTTON — 10 variants
// =============================================================================
function useCopy(text = "Copied!") {
  const [copied, setCopied] = useState(false)
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return { copied, copy }
}

export function CopyButtonV1({ value = "npm install neo-brutalist" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="flex items-center border-3 border-black shadow-[3px_3px_0px_black] bg-white font-mono text-xs overflow-hidden">
      <span className="px-3 py-2 flex-1 truncate">{value}</span>
      <button onClick={copy} className={`px-3 py-2 border-l-3 border-l-black font-black transition-colors ${copied?"bg-[#ccff00]":"bg-white hover:bg-[#ff66cc]"}`}>{copied?"✓":"Copy"}</button>
    </div>
  )
}
export function CopyButtonV2({ value = "npx create-next-app" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <button onClick={copy} className={`border-3 border-black font-black px-4 py-2 text-sm shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all ${copied?"bg-[#ccff00]":"bg-white hover:bg-[#ff66cc]"}`}>
      {copied ? "✓ COPIED!" : "[ COPY ]"}
    </button>
  )
}
export function CopyButtonV3({ value = "yarn add tailwindcss" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="flex flex-col gap-1 w-full border-3 border-black shadow-[4px_4px_0px_black] bg-[#ffdd00]">
      <div className="flex items-center justify-between px-3 py-1 border-b-3 border-b-black">
        <span className="font-black text-xs uppercase">Command</span>
        <button onClick={copy} className={`text-xs font-black px-2 py-0.5 border-2 border-black ${copied?"bg-[#ccff00]":"bg-white hover:bg-[#ff66cc]"}`}>{copied?"Copied!":"Copy"}</button>
      </div>
      <div className="px-3 py-2 font-mono text-xs">{value}</div>
    </div>
  )
}
export function CopyButtonV4({ value = "pnpm install" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="border-3 border-black bg-black shadow-[4px_4px_0px_#ccff00] font-mono text-xs overflow-hidden">
      <div className="px-3 py-1 border-b-3 border-b-[#ccff00] flex items-center gap-2">
        <span className="text-[#ff66cc] font-black">$</span>
        <span className="text-[#ccff00] flex-1">{value}</span>
        <button onClick={copy} className={`text-xs font-black px-2 py-0.5 border border-[#ccff00] ${copied?"text-[#00ccff] border-[#00ccff]":"text-[#ccff00] hover:bg-[#ccff00] hover:text-black"}`}>{copied?"✓":"CP"}</button>
      </div>
    </div>
  )
}
export function CopyButtonV5({ value = "git clone repo" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="flex items-center gap-0 border-3 border-black shadow-[3px_3px_0px_black] overflow-hidden w-fit">
      <div className="px-3 py-2 bg-white font-mono text-xs">{value}</div>
      <button onClick={copy} className={`w-10 h-full min-h-[36px] border-l-3 border-l-black font-black text-sm transition-colors ${copied?"bg-[#ccff00] text-black":"bg-[#ff66cc] text-black hover:bg-[#ffdd00]"}`}>{copied?"✓":"⎘"}</button>
    </div>
  )
}
export function CopyButtonV6({ value = "docker run app" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="relative group w-fit">
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black" />
      <button onClick={copy} className={`relative border-3 border-black font-black px-4 py-2 text-sm transition-colors ${copied?"bg-[#ccff00]":"bg-white hover:bg-[#ff66cc]"}`}>
        {copied ? "COPIED ✓" : "COPY CODE"}
      </button>
    </div>
  )
}
export function CopyButtonV7({ value = "curl -X POST /api" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-white overflow-hidden w-full">
      <div className="bg-[#ff66cc] border-b-3 border-b-black px-3 py-1 flex justify-between items-center">
        <span className="font-black text-xs">Terminal</span>
        <button onClick={copy} className={`text-xs font-black border-2 border-black px-2 ${copied?"bg-[#ccff00]":"bg-white hover:bg-[#ffdd00]"}`}>{copied?"Copied":"Copy"}</button>
      </div>
      <div className="px-3 py-2 font-mono text-xs flex items-center gap-2"><span className="text-[#ff66cc] font-black">›</span>{value}</div>
    </div>
  )
}
export function CopyButtonV8({ value = "ssh user@host" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="flex items-center gap-2">
      <div className="font-mono text-xs border-3 border-black px-3 py-2 bg-white shadow-[3px_3px_0px_black]">{value}</div>
      <button onClick={copy} className={`w-9 h-9 border-3 border-black font-black text-sm shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all ${copied?"bg-[#ccff00]":"bg-white hover:bg-[#ff66cc]"}`}>{copied?"✓":"⎘"}</button>
    </div>
  )
}
export function CopyButtonV9({ value = "export API_KEY=xxx" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <button onClick={copy} className={`border-3 border-black font-black text-sm px-4 py-2 w-full text-left font-mono shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-between ${copied?"bg-[#ccff00]":"bg-white hover:bg-[#ff66cc]"}`}>
      <span>{copied?"✓ Copied!":value}</span>
      <span className="text-base">{copied?"":"⎘"}</span>
    </button>
  )
}
export function CopyButtonV10({ value = "base64 encode" }: { value?: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className={`border-3 border-black shadow-[4px_4px_0px_black] overflow-hidden transition-colors ${copied?"bg-[#ccff00]":"bg-[#ffdd00]"}`}>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="font-mono text-xs font-bold">{value}</span>
        <button onClick={copy} className="border-3 border-black bg-white font-black text-xs px-2 py-0.5 hover:bg-[#ff66cc] transition-colors shadow-[2px_2px_0px_black] active:shadow-none">{copied?"Copied ✓":"Copy"}</button>
      </div>
    </div>
  )
}
