"use client"

import { useState } from "react"

// =============================================================================
// DIALOG — 10 variants (trigger + modal)
// =============================================================================
function DialogShell({ open, onClose, children, cls = "" }: { open: boolean; onClose: () => void; children: React.ReactNode; cls?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className={`relative ${cls}`} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

export function DialogV1() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ff66cc] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_black] transition-all">Open Dialog</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="border-4 border-black bg-white shadow-[8px_8px_0px_black] w-80">
        <div className="bg-[#ff66cc] border-b-4 border-b-black px-4 py-3 flex items-center justify-between"><span className="font-black text-sm uppercase">Confirm Action</span><button onClick={() => setOpen(false)} className="font-black text-lg leading-none border-2 border-black w-7 h-7 flex items-center justify-center bg-white hover:bg-[#ccff00]">×</button></div>
        <div className="px-4 py-4 font-bold text-sm">Are you sure you want to proceed? This cannot be undone.</div>
        <div className="px-4 py-3 border-t-4 border-t-black flex gap-2 justify-end">
          <button onClick={() => setOpen(false)} className="border-3 border-black bg-white font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black] hover:bg-gray-100">Cancel</button>
          <button onClick={() => setOpen(false)} className="border-3 border-black bg-[#ccff00] font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black] hover:bg-[#ffdd00]">Confirm</button>
        </div>
      </DialogShell>
    </>
  )
}

export function DialogV2() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ccff00] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Alert Dialog</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="border-4 border-black bg-[#ffdd00] shadow-[8px_8px_0px_black] w-80">
        <div className="px-4 pt-5 pb-3 text-center"><div className="text-4xl font-black mb-2">!</div><div className="font-black text-base uppercase">Warning</div><div className="font-bold text-sm mt-1">This action is irreversible.</div></div>
        <div className="flex border-t-4 border-t-black">
          <button onClick={() => setOpen(false)} className="flex-1 py-2.5 border-r-2 border-r-black font-black text-sm hover:bg-black hover:text-white transition-colors">Cancel</button>
          <button onClick={() => setOpen(false)} className="flex-1 py-2.5 font-black text-sm bg-[#ff66cc] hover:bg-[#ff44aa] border-l-2 border-l-black transition-colors">OK</button>
        </div>
      </DialogShell>
    </>
  )
}

export function DialogV3() {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState("")
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#00ccff] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Input Dialog</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="border-4 border-black bg-white shadow-[8px_8px_0px_black] w-80">
        <div className="bg-[#00ccff] border-b-4 border-b-black px-4 py-2 font-black text-sm uppercase">Enter Value</div>
        <div className="px-4 py-4">
          <label className="font-black text-xs uppercase block mb-1">Name</label>
          <input value={val} onChange={e => setVal(e.target.value)} className="w-full border-3 border-black px-3 py-2 font-bold text-sm outline-none focus:bg-[#fff8dc]" placeholder="Type here..." />
        </div>
        <div className="px-4 pb-4 flex gap-2 justify-end">
          <button onClick={() => setOpen(false)} className="border-3 border-black bg-white font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black]">Cancel</button>
          <button onClick={() => setOpen(false)} className="border-3 border-black bg-[#ff66cc] font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black]">Submit</button>
        </div>
      </DialogShell>
    </>
  )
}

export function DialogV4() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-white font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:bg-[#ff66cc] transition-colors">Fullscreen</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="border-4 border-black bg-white shadow-[12px_12px_0px_black] w-[90vw] max-w-lg">
        <div className="bg-black text-[#ccff00] border-b-4 border-b-[#ccff00] px-4 py-3 flex items-center justify-between"><span className="font-black uppercase tracking-wider">MODAL WINDOW</span><button onClick={() => setOpen(false)} className="font-black text-[#ff66cc] hover:text-white text-xl">×</button></div>
        <div className="px-4 py-6 font-bold text-sm leading-relaxed">Full-screen modal with heavy header. Content goes here. The backdrop is dark and the dialog is centered with a massive offset shadow for maximum brutalist impact.</div>
        <div className="px-4 py-3 border-t-4 border-t-black flex gap-2"><button onClick={() => setOpen(false)} className="flex-1 border-3 border-black bg-[#ccff00] font-black py-2 text-sm shadow-[3px_3px_0px_black] hover:bg-[#ffdd00]">CLOSE</button></div>
      </DialogShell>
    </>
  )
}

export function DialogV5() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ffb158] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Side Dialog</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="border-4 border-black bg-white shadow-[8px_8px_0px_black] w-72">
        <div className="flex">
          <div className="w-3 bg-[#ffb158] border-r-4 border-r-black shrink-0" />
          <div className="flex-1">
            <div className="px-3 py-3 border-b-4 border-b-black flex justify-between items-center"><span className="font-black text-sm">Side Accent</span><button onClick={() => setOpen(false)} className="font-black">×</button></div>
            <div className="px-3 py-3 font-bold text-sm">Left colored accent stripe variant for dialogs.</div>
            <div className="px-3 py-3 border-t-4 border-t-black flex gap-2">
              <button onClick={() => setOpen(false)} className="flex-1 border-3 border-black bg-[#ffb158] font-black py-1.5 text-sm shadow-[3px_3px_0px_black]">OK</button>
            </div>
          </div>
        </div>
      </DialogShell>
    </>
  )
}

export function DialogV6() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ff66cc] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Stacked Dialog</button>
      <DialogShell open={open} onClose={() => setOpen(false)}>
        <div className="relative w-80">
          <div className="absolute inset-0 translate-x-3 translate-y-3 bg-[#ccff00] border-4 border-black" />
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[#ff66cc] border-4 border-black" />
          <div className="relative border-4 border-black bg-white">
            <div className="px-4 py-3 border-b-4 border-b-black font-black text-sm uppercase">Layered Dialog</div>
            <div className="px-4 py-4 font-bold text-sm">Multi-layer shadow effect dialog.</div>
            <div className="px-4 pb-4 flex justify-end"><button onClick={() => setOpen(false)} className="border-3 border-black bg-[#ff66cc] font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black]">Close</button></div>
          </div>
        </div>
      </DialogShell>
    </>
  )
}

export function DialogV7() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ccff00] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Minimal Dialog</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="border-4 border-black bg-white shadow-[8px_8px_0px_black] w-72">
        <div className="p-6 text-center">
          <div className="font-black text-lg uppercase mb-2">Are you sure?</div>
          <div className="font-bold text-sm text-gray-600 mb-4">This will permanently delete your data.</div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 border-3 border-black bg-white font-black py-2 text-sm shadow-[3px_3px_0px_black] hover:bg-gray-100">No</button>
            <button onClick={() => setOpen(false)} className="flex-1 border-3 border-black bg-[#ff66cc] font-black py-2 text-sm shadow-[3px_3px_0px_black] hover:bg-[#ff44aa]">Yes, Delete</button>
          </div>
        </div>
      </DialogShell>
    </>
  )
}

export function DialogV8() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#00ccff] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Dark Dialog</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="border-4 border-[#00ccff] bg-[#0a0a14] shadow-[8px_8px_0px_#00ccff] w-80">
        <div className="bg-[#00ccff] border-b-4 border-b-[#00ccff] px-4 py-2 flex items-center justify-between"><span className="font-black text-sm text-black uppercase">System Alert</span><button onClick={() => setOpen(false)} className="font-black text-black text-xl leading-none">×</button></div>
        <div className="px-4 py-4 text-[#ccff00] font-bold text-sm">Dark themed dialog with cyan accents and neon text.</div>
        <div className="px-4 pb-4 flex gap-2 justify-end">
          <button onClick={() => setOpen(false)} className="border-2 border-[#ff66cc] text-[#ff66cc] font-black px-3 py-1.5 text-sm hover:bg-[#ff66cc] hover:text-black transition-colors">Cancel</button>
          <button onClick={() => setOpen(false)} className="border-2 border-[#ccff00] bg-[#ccff00] text-black font-black px-3 py-1.5 text-sm hover:bg-[#ffdd00]">Confirm</button>
        </div>
      </DialogShell>
    </>
  )
}

export function DialogV9() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ffdd00] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Tab Dialog</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="border-4 border-black bg-white shadow-[8px_8px_0px_black] w-80">
        <div className="flex border-b-4 border-b-black">
          {["Info","Settings","Help"].map((t,i) => <div key={t} className={`flex-1 py-2 font-black text-xs text-center border-r-2 last:border-r-0 border-r-black ${i===0?"bg-[#ffdd00]":"bg-white hover:bg-gray-50 cursor-pointer"}`}>{t}</div>)}
        </div>
        <div className="px-4 py-4 font-bold text-sm">Tab-style dialog header with multiple sections.</div>
        <div className="px-4 pb-4 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="border-3 border-black bg-white font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black]">Close</button>
          <button onClick={() => setOpen(false)} className="border-3 border-black bg-[#ffdd00] font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black]">Save</button>
        </div>
      </DialogShell>
    </>
  )
}

export function DialogV10() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ff66cc] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Notched</button>
      <DialogShell open={open} onClose={() => setOpen(false)} cls="relative w-80">
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-[#ff66cc]" />
        <div className="relative border-4 border-black bg-white">
          <div className="absolute -top-3 -left-3 w-5 h-5 bg-[#ccff00] border-3 border-black" />
          <div className="absolute -top-3 -right-3 w-5 h-5 bg-[#00ccff] border-3 border-black" />
          <div className="px-4 py-4 border-b-4 border-b-black font-black text-sm uppercase">Notched Dialog</div>
          <div className="px-4 py-4 font-bold text-sm">Corner accent markers give a distinctive brutalist frame.</div>
          <div className="px-4 pb-4 flex justify-end"><button onClick={() => setOpen(false)} className="border-3 border-black bg-[#ccff00] font-black px-4 py-1.5 text-sm shadow-[3px_3px_0px_black]">OK</button></div>
        </div>
      </DialogShell>
    </>
  )
}

// =============================================================================
// DIVIDER — 10 variants
// =============================================================================
export function DividerV1() { return <div className="border-t-3 border-t-black w-full" /> }
export function DividerV2() { return <div className="border-t-4 border-t-black w-full" style={{borderTopStyle:"dashed"}} /> }
export function DividerV3() { return <div className="flex items-center gap-3"><div className="flex-1 border-t-3 border-t-black" /><div className="border-3 border-black bg-[#ff66cc] px-3 py-0.5 font-black text-xs uppercase">OR</div><div className="flex-1 border-t-3 border-t-black" /></div> }
export function DividerV4() { return <div className="flex items-center gap-2"><div className="flex-1 border-t-3 border-t-black" /><div className="w-3 h-3 bg-[#ccff00] border-2 border-black rotate-45" /><div className="flex-1 border-t-3 border-t-black" /></div> }
export function DividerV5() { return <div className="h-3 border-3 border-black overflow-hidden relative"><div className="absolute inset-0" style={{backgroundImage:"repeating-linear-gradient(45deg,#ff66cc 0,#ff66cc 4px,#ccff00 4px,#ccff00 8px)"}} /></div> }
export function DividerV6() { return <div className="flex flex-col gap-0.5"><div className="h-px bg-black w-full" /><div className="h-1 bg-[#ff66cc] w-full" /><div className="h-px bg-black w-full" /></div> }
export function DividerV7() { return <div className="border-3 border-black p-1.5 bg-[#ffdd00] flex items-center gap-2"><div className="flex-1 border-t-2 border-t-black" /><span className="font-black text-xs uppercase">Section</span><div className="flex-1 border-t-2 border-t-black" /></div> }
export function DividerV8() { return <div className="flex items-center"><div className="w-3 h-3 border-3 border-black bg-[#ff66cc] shrink-0" /><div className="flex-1 border-t-3 border-t-black" /><div className="w-3 h-3 border-3 border-black bg-[#ccff00] shrink-0" /></div> }
export function DividerV9() { return <div className="border-t-4 border-t-[#ff66cc] w-full shadow-[0_2px_0px_#ccff00]" /> }
export function DividerV10() { return <div className="flex items-center gap-0"><div className="h-1 bg-[#ff66cc] flex-1" /><div className="h-1 bg-[#ccff00] flex-1" /><div className="h-1 bg-[#00ccff] flex-1" /><div className="h-1 bg-[#ffdd00] flex-1" /></div> }

// =============================================================================
// DRAWER — 10 variants (trigger + panel)
// =============================================================================
function DrawerPanel({ open, onClose, position = "right", width = "w-72", bgClass = "bg-white", children }: { open: boolean; onClose: () => void; position?: "left" | "right" | "bottom"; width?: string; bgClass?: string; children: React.ReactNode }) {
  if (!open) return null
  const posClass = position === "right" ? "right-0 top-0 h-full" : position === "left" ? "left-0 top-0 h-full" : "bottom-0 left-0 w-full"
  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <div className={`absolute ${posClass} ${width} ${bgClass} border-l-4 border-l-black`} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

export function DrawerV1() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ff66cc] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Open Drawer</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)}>
        <div className="bg-[#ff66cc] border-b-4 border-b-black px-4 py-3 flex items-center justify-between"><span className="font-black text-sm uppercase">Menu</span><button onClick={() => setOpen(false)} className="font-black text-xl border-2 border-black w-7 h-7 flex items-center justify-center bg-white">×</button></div>
        <nav className="p-4 flex flex-col gap-2">{["Dashboard","Analytics","Settings","Profile","Help"].map(item => <a key={item} className="border-3 border-black bg-white font-bold px-3 py-2 text-sm hover:bg-[#ccff00] hover:shadow-[3px_3px_0px_black] transition-all cursor-pointer">{item}</a>)}</nav>
      </DrawerPanel>
    </>
  )
}
export function DrawerV2() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ccff00] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Left Drawer</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)} position="left" bgClass="bg-black border-r-4 border-r-[#ccff00] border-l-0">
        <div className="bg-[#ccff00] border-b-4 border-b-black px-4 py-3 flex items-center justify-between"><span className="font-black text-sm uppercase">Nav</span><button onClick={() => setOpen(false)} className="font-black text-xl">×</button></div>
        <nav className="p-4 flex flex-col gap-2">{["Home","Work","About","Contact"].map(item => <a key={item} className="text-[#ccff00] font-bold px-3 py-2 text-sm border-b border-[#ccff00]/30 hover:text-[#ff66cc] cursor-pointer">{item}</a>)}</nav>
      </DrawerPanel>
    </>
  )
}
export function DrawerV3() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#00ccff] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Bottom Sheet</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)} position="bottom" width="h-48" bgClass="bg-white border-t-4 border-t-black border-l-0">
        <div className="flex justify-center pt-2 mb-2"><div className="w-12 h-1.5 bg-black" /></div>
        <div className="bg-[#00ccff] border-b-3 border-b-black px-4 py-2 font-black text-sm uppercase flex justify-between items-center"><span>Options</span><button onClick={() => setOpen(false)} className="font-black">×</button></div>
        <div className="flex gap-3 p-4">{["Share","Copy","Delete","Archive"].map(item => <button key={item} className="flex-1 border-3 border-black bg-white font-bold py-2 text-xs hover:bg-[#00ccff] shadow-[3px_3px_0px_black] active:shadow-none">{item}</button>)}</div>
      </DrawerPanel>
    </>
  )
}
export function DrawerV4() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ffdd00] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Filter Drawer</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)} width="w-80">
        <div className="bg-[#ffdd00] border-b-4 border-b-black px-4 py-3 flex items-center justify-between"><span className="font-black text-sm uppercase">Filters</span><button onClick={() => setOpen(false)} className="font-black">×</button></div>
        <div className="p-4 flex flex-col gap-3">
          {["Category","Price Range","Rating","Date"].map(filter => <div key={filter} className="border-3 border-black p-3 bg-white"><div className="font-black text-xs uppercase mb-2 border-b-2 border-b-black pb-1">{filter}</div><div className="h-4 bg-gray-100 border-2 border-black" /></div>)}
        </div>
        <div className="p-4 border-t-4 border-t-black flex gap-2">
          <button onClick={() => setOpen(false)} className="flex-1 border-3 border-black bg-white font-black py-2 text-sm shadow-[3px_3px_0px_black]">Reset</button>
          <button onClick={() => setOpen(false)} className="flex-1 border-3 border-black bg-[#ff66cc] font-black py-2 text-sm shadow-[3px_3px_0px_black]">Apply</button>
        </div>
      </DrawerPanel>
    </>
  )
}
export function DrawerV5() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ffb158] font-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Cart Drawer</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)}>
        <div className="bg-[#ffb158] border-b-4 border-b-black px-4 py-3 flex items-center justify-between"><span className="font-black text-sm uppercase">Cart (3)</span><button onClick={() => setOpen(false)} className="font-black border-2 border-black w-7 h-7 flex items-center justify-center bg-white">×</button></div>
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">{["Item One — $12","Item Two — $8","Item Three — $24"].map(item => <div key={item} className="border-3 border-black bg-white px-3 py-2 font-bold text-sm flex items-center justify-between"><span>{item}</span><button className="font-black text-[#ff66cc] border border-black w-5 h-5 flex items-center justify-center text-xs hover:bg-[#ff66cc] hover:text-white">×</button></div>)}</div>
        <div className="p-4 border-t-4 border-t-black"><div className="flex justify-between font-black text-sm mb-3"><span>Total</span><span>$44.00</span></div><button onClick={() => setOpen(false)} className="w-full border-3 border-black bg-[#ccff00] font-black py-2 shadow-[3px_3px_0px_black] hover:bg-[#ffdd00]">Checkout</button></div>
      </DrawerPanel>
    </>
  )
}
export function DrawerV6() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ff66cc] font-black px-4 py-2 shadow-[4px_4px_0px_black]">Settings</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)}>
        <div className="h-full flex flex-col">
          <div className="bg-black border-b-4 border-b-[#ff66cc] px-4 py-3 flex items-center justify-between"><span className="font-black text-[#ccff00] text-sm uppercase">Settings</span><button onClick={() => setOpen(false)} className="font-black text-[#ff66cc]">×</button></div>
          <div className="flex-1 p-4 flex flex-col gap-3">{["Account","Privacy","Notifications","Appearance"].map(s => <div key={s} className="flex items-center justify-between border-3 border-black px-3 py-2 bg-white font-bold text-sm hover:bg-[#ff66cc] cursor-pointer transition-colors"><span>{s}</span><span className="font-black">›</span></div>)}</div>
        </div>
      </DrawerPanel>
    </>
  )
}
export function DrawerV7() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ccff00] font-black px-4 py-2 shadow-[4px_4px_0px_black]">Notifications</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)}>
        <div className="bg-[#ccff00] border-b-4 border-b-black px-4 py-3 font-black text-sm uppercase">Notifications</div>
        <div className="flex flex-col">{["New message from Alice","System update available","Payment received","New follower"].map((n,i) => <div key={n} className={`px-4 py-3 border-b-2 border-b-black font-bold text-xs flex items-start gap-2 hover:bg-[#ccff00]/30 cursor-pointer ${i===0?"bg-[#ff66cc]/20":""}`}><div className={`w-2 h-2 mt-1 shrink-0 ${i===0?"bg-[#ff66cc]":"bg-gray-300"} border border-black`} />{n}</div>)}</div>
      </DrawerPanel>
    </>
  )
}
export function DrawerV8() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#00ccff] font-black px-4 py-2 shadow-[4px_4px_0px_black]">Profile</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)}>
        <div className="bg-[#00ccff] border-b-4 border-b-black p-6 text-center">
          <div className="w-16 h-16 border-4 border-black bg-[#ff66cc] mx-auto flex items-center justify-center font-black text-2xl mb-2">AB</div>
          <div className="font-black text-sm uppercase">Alex Brutalist</div>
          <div className="font-bold text-xs text-black/70">Designer</div>
        </div>
        <nav className="p-4 flex flex-col gap-2">{["Edit Profile","My Work","Subscriptions","Log Out"].map(item => <a key={item} className="border-3 border-black bg-white font-bold px-3 py-2 text-sm hover:bg-[#00ccff] cursor-pointer">{item}</a>)}</nav>
      </DrawerPanel>
    </>
  )
}
export function DrawerV9() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ffdd00] font-black px-4 py-2 shadow-[4px_4px_0px_black]">Help</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)}>
        <div className="bg-[#ffdd00] border-b-4 border-b-black px-4 py-3 font-black text-sm uppercase flex justify-between items-center"><span>Help Center</span><button onClick={() => setOpen(false)} className="font-black">×</button></div>
        <div className="p-4 flex flex-col gap-3">{["Getting Started","FAQ","Contact Us","Video Tutorials"].map((item,i) => <div key={item} className="border-3 border-black bg-white p-3 hover:bg-[#ffdd00] cursor-pointer transition-colors"><div className="font-black text-xs uppercase text-[#ff66cc] mb-0.5">0{i+1}</div><div className="font-bold text-sm">{item}</div></div>)}</div>
      </DrawerPanel>
    </>
  )
}
export function DrawerV10() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="border-3 border-black bg-[#ff66cc] font-black px-4 py-2 shadow-[4px_4px_0px_black]">Kanban</button>
      <DrawerPanel open={open} onClose={() => setOpen(false)} width="w-80">
        <div className="h-full flex flex-col">
          <div className="bg-[#ff66cc] border-b-4 border-b-black px-4 py-3 flex items-center justify-between font-black text-sm uppercase"><span>Task Detail</span><button onClick={() => setOpen(false)}>×</button></div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="border-3 border-black p-3 bg-[#ccff00] font-black text-sm">Design new landing page</div>
            <div className="flex flex-col gap-2">{["In Progress","High Priority","Assigned: Alice"].map(tag => <span key={tag} className="border-2 border-black bg-white px-2 py-0.5 text-xs font-bold w-fit">{tag}</span>)}</div>
            <div className="border-3 border-black p-3 bg-white font-bold text-xs text-gray-700">Notes and description for this task go here. You can add as much detail as needed.</div>
          </div>
          <div className="p-4 border-t-4 border-t-black flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 border-3 border-black bg-white font-black py-2 text-sm shadow-[3px_3px_0px_black]">Edit</button>
            <button onClick={() => setOpen(false)} className="flex-1 border-3 border-black bg-[#ff66cc] font-black py-2 text-sm shadow-[3px_3px_0px_black]">Done</button>
          </div>
        </div>
      </DrawerPanel>
    </>
  )
}

// =============================================================================
// DROPDOWN — 10 variants
// =============================================================================
const dropItems = ["Profile","Settings","Billing","Log Out"]

function useDropdown() {
  const [open, setOpen] = useState(false)
  return { open, toggle: () => setOpen(o => !o), close: () => setOpen(false) }
}

export function DropdownV1() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-[#ff66cc] font-black px-4 py-2 text-sm shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2">Actions <span className={`transition-transform ${open?"rotate-180":""}`}>▼</span></button>
      {open && <div className="absolute top-full left-0 mt-1 z-20 border-3 border-black bg-white shadow-[4px_4px_0px_black] min-w-full">{dropItems.map(item => <button key={item} onClick={close} className="block w-full text-left px-4 py-2 font-bold text-sm border-b-2 last:border-b-0 border-b-black hover:bg-[#ff66cc] transition-colors">{item}</button>)}</div>}
    </div>
  )
}
export function DropdownV2() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-[#ccff00] font-black px-4 py-2 text-sm shadow-[4px_4px_0px_black] flex items-center gap-2">Menu <span className={`transition-transform ${open?"rotate-180":""}`}>▾</span></button>
      {open && <div className="absolute top-full left-0 mt-1 z-20 border-3 border-black bg-white shadow-[6px_6px_0px_black] min-w-[160px]">{dropItems.map((item,i) => <button key={item} onClick={close} className={`block w-full text-left px-4 py-2.5 font-bold text-sm border-b-2 last:border-b-0 border-b-black hover:bg-[#ccff00] transition-colors flex items-center gap-2`}><span className="w-4 h-4 border-2 border-black bg-white flex items-center justify-center text-xs font-black">{i+1}</span>{item}</button>)}</div>}
    </div>
  )
}
export function DropdownV3() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-white font-black px-4 py-2 text-sm shadow-[4px_4px_0px_black] hover:bg-[#00ccff] transition-colors">Options ▾</button>
      {open && <div className="absolute top-full left-0 mt-1 z-20 border-3 border-black bg-black shadow-[4px_4px_0px_#ccff00] min-w-[160px]">{dropItems.map(item => <button key={item} onClick={close} className="block w-full text-left px-4 py-2.5 font-bold text-sm text-[#ccff00] border-b border-[#ccff00]/30 last:border-b-0 hover:bg-[#ccff00] hover:text-black transition-colors">{item}</button>)}</div>}
    </div>
  )
}
export function DropdownV4() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-[#ffdd00] font-black px-4 py-2 text-sm shadow-[4px_4px_0px_black]">Select ▾</button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 z-20 border-3 border-black bg-white shadow-[4px_4px_0px_black] min-w-[180px]">
          <div className="bg-[#ffdd00] border-b-3 border-b-black px-3 py-1 font-black text-xs uppercase">Choose Action</div>
          {dropItems.map(item => <button key={item} onClick={close} className="block w-full text-left px-4 py-2.5 font-bold text-sm border-b-2 last:border-b-0 border-b-black hover:bg-[#ffdd00] transition-colors">{item}</button>)}
        </div>
      )}
    </div>
  )
}
export function DropdownV5() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-[#ffb158] font-black px-4 py-2 text-sm shadow-[4px_4px_0px_black]">User ▾</button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-20 min-w-[180px]">
          <div className="relative">
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black" />
            <div className="relative border-3 border-black bg-white">
              {dropItems.map((item,i) => <button key={item} onClick={close} className={`block w-full text-left px-4 py-2.5 font-bold text-sm border-b-2 last:border-b-0 border-b-black transition-colors ${i===dropItems.length-1?"hover:bg-[#ff66cc] text-[#ff4444]":"hover:bg-[#ffb158]"}`}>{item}</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export function DropdownV6() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="w-10 h-10 border-3 border-black bg-[#ff66cc] font-black text-xl flex items-center justify-center shadow-[3px_3px_0px_black]">⋮</button>
      {open && <div className="absolute top-full right-0 mt-1 z-20 border-3 border-black bg-white shadow-[4px_4px_0px_black] min-w-[140px]">{dropItems.map(item => <button key={item} onClick={close} className="block w-full text-left px-3 py-2 font-bold text-sm border-b-2 last:border-b-0 border-b-black hover:bg-[#ff66cc] transition-colors">{item}</button>)}</div>}
    </div>
  )
}
export function DropdownV7() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-white font-black px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#ccff00] transition-colors shadow-[4px_4px_0px_black]"><span className="w-5 h-5 border-2 border-black bg-[#ccff00] flex items-center justify-center text-xs font-black">☰</span>Menu</button>
      {open && <div className="absolute top-full left-0 mt-1 z-20 border-3 border-black bg-white shadow-[4px_4px_0px_black] min-w-full">{dropItems.map(item => <button key={item} onClick={close} className="flex items-center gap-2 w-full text-left px-3 py-2.5 font-bold text-sm border-b-2 last:border-b-0 border-b-black hover:bg-[#ccff00] transition-colors"><span className="w-1.5 h-1.5 bg-[#ff66cc] border border-black" />{item}</button>)}</div>}
    </div>
  )
}
export function DropdownV8() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-black text-[#ccff00] font-black px-4 py-2 text-sm shadow-[4px_4px_0px_#ff66cc] flex items-center gap-2">CMD <span className="text-[#ff66cc]">▾</span></button>
      {open && <div className="absolute top-full left-0 mt-1 z-20 border-3 border-[#ccff00] bg-black shadow-[4px_4px_0px_#ccff00] min-w-[160px]">{dropItems.map(item => <button key={item} onClick={close} className="block w-full text-left px-4 py-2 font-bold text-sm text-[#ccff00] border-b border-[#ccff00]/30 last:border-b-0 hover:bg-[#ccff00] hover:text-black transition-colors">{item}</button>)}</div>}
    </div>
  )
}
export function DropdownV9() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-[#00ccff] font-black px-4 py-2 text-sm shadow-[4px_4px_0px_black] uppercase tracking-wider">Sort ▾</button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 border-3 border-black bg-white shadow-[4px_4px_0px_black] min-w-[180px]">
          <div className="flex flex-col">{["A → Z","Z → A","Newest","Oldest","Price ↑","Price ↓"].map(item => <button key={item} onClick={close} className="px-4 py-2 font-bold text-sm text-left border-b-2 last:border-b-0 border-b-black hover:bg-[#00ccff] transition-colors">{item}</button>)}</div>
        </div>
      )}
    </div>
  )
}
export function DropdownV10() {
  const { open, toggle, close } = useDropdown()
  return (
    <div className="relative w-fit">
      <button onClick={toggle} className="border-3 border-black bg-[#ff66cc] font-black px-4 py-2 text-sm shadow-[4px_4px_0px_black] flex items-center gap-2">Account <span className={`font-black transition-transform ${open?"rotate-180":""}`}>▼</span></button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 border-3 border-black bg-white shadow-[4px_4px_0px_black] min-w-[200px]">
          <div className="px-4 py-3 border-b-3 border-b-black bg-[#ff66cc]/20 flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-black bg-[#ff66cc] flex items-center justify-center font-black text-sm">AB</div>
            <div><div className="font-black text-xs">Alex B.</div><div className="text-xs font-bold text-gray-500">alex@neo.ui</div></div>
          </div>
          {dropItems.map(item => <button key={item} onClick={close} className="block w-full text-left px-4 py-2.5 font-bold text-sm border-b-2 last:border-b-0 border-b-black hover:bg-[#ff66cc]/20 transition-colors">{item}</button>)}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// ICON BUTTON — 10 variants
// =============================================================================
export function IconButtonV1() { return <button className="w-10 h-10 border-3 border-black bg-[#ff66cc] font-black flex items-center justify-center shadow-[3px_3px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_black] transition-all" aria-label="Edit">✏</button> }
export function IconButtonV2() { return <button className="w-10 h-10 border-3 border-black bg-white font-black flex items-center justify-center shadow-[3px_3px_0px_black] hover:bg-[#ccff00] transition-colors" aria-label="Search">⌕</button> }
export function IconButtonV3() { return <button className="w-10 h-10 border-3 border-black bg-[#ccff00] font-black flex items-center justify-center hover:bg-[#ffdd00] transition-colors shadow-[3px_3px_0px_black]" aria-label="Add">+</button> }
export function IconButtonV4() { return <button className="w-10 h-10 border-3 border-black bg-black text-[#ccff00] font-black flex items-center justify-center shadow-[3px_3px_0px_#ccff00] hover:bg-[#111] transition-colors" aria-label="Star">★</button> }
export function IconButtonV5() { return <button className="w-12 h-12 border-4 border-black bg-[#00ccff] font-black flex items-center justify-center shadow-[4px_4px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_black] transition-all text-lg" aria-label="Delete">⌫</button> }
export function IconButtonV6() { return <button className="w-10 h-10 border-3 border-black bg-white font-black flex items-center justify-center shadow-[3px_3px_0px_black] hover:bg-[#ff66cc] transition-colors relative overflow-hidden group" aria-label="Share"><span className="relative z-10">⤴</span><div className="absolute inset-0 bg-[#ff66cc] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" /></button> }
export function IconButtonV7() { return <button className="border-3 border-black bg-[#ffdd00] font-black px-3 py-2 flex items-center gap-1.5 shadow-[3px_3px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_black] transition-all text-sm" aria-label="Save">💾 Save</button> }
export function IconButtonV8() { return <button className="w-10 h-10 border-3 border-black bg-[#ffb158] font-black flex items-center justify-center shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all" aria-label="Settings">⚙</button> }
export function IconButtonV9() { return <div className="relative w-fit"><div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black" /><button className="relative w-10 h-10 border-3 border-black bg-[#ff66cc] font-black flex items-center justify-center hover:bg-[#ff44aa] transition-colors" aria-label="Notification">🔔</button></div> }
export function IconButtonV10() { return <button className="w-10 h-10 border-3 border-black bg-white font-bold flex items-center justify-center shadow-[3px_3px_0px_black] hover:bg-[#00ccff] transition-colors text-xs uppercase tracking-widest" aria-label="Filter">FLT</button> }

// =============================================================================
// MENU — 10 variants (vertical menus)
// =============================================================================
const menuItems = [
  { label: "Dashboard", icon: "⬛" },
  { label: "Analytics", icon: "◉" },
  { label: "Content", icon: "≡" },
  { label: "Settings", icon: "⚙" },
]

export function MenuV1({ active = "Dashboard" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="border-3 border-black shadow-[4px_4px_0px_black] w-48 overflow-hidden">
      <div className="bg-[#ff66cc] border-b-3 border-b-black px-3 py-2 font-black text-xs uppercase">Navigation</div>
      {menuItems.map(item => <button key={item.label} onClick={() => setSel(item.label)} className={`flex items-center gap-2 w-full px-3 py-2.5 font-bold text-sm border-b-2 last:border-b-0 border-b-black text-left transition-colors ${sel===item.label?"bg-[#ff66cc]":"bg-white hover:bg-gray-50"}`}><span>{item.icon}</span>{item.label}</button>)}
    </nav>
  )
}
export function MenuV2({ active = "Analytics" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="border-3 border-black shadow-[4px_4px_0px_black] w-48 bg-black overflow-hidden">
      <div className="bg-[#ccff00] border-b-3 border-b-black px-3 py-2 font-black text-xs uppercase text-black">Menu</div>
      {menuItems.map(item => <button key={item.label} onClick={() => setSel(item.label)} className={`flex items-center gap-2 w-full px-3 py-2.5 font-bold text-sm border-b border-[#ccff00]/20 last:border-b-0 text-left transition-colors ${sel===item.label?"bg-[#ccff00] text-black":"text-[#ccff00] hover:bg-[#ccff00]/10"}`}><span>{item.icon}</span>{item.label}</button>)}
    </nav>
  )
}
export function MenuV3({ active = "Content" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="w-48 flex flex-col gap-1.5">
      {menuItems.map(item => <button key={item.label} onClick={() => setSel(item.label)} className={`flex items-center gap-2 w-full px-3 py-2.5 font-bold text-sm border-3 border-black text-left transition-all shadow-[3px_3px_0px_black] ${sel===item.label?"bg-[#00ccff] -translate-x-0.5 -translate-y-0.5 shadow-[5px_5px_0px_black]":"bg-white hover:bg-[#00ccff]/30"}`}><span>{item.icon}</span>{item.label}</button>)}
    </nav>
  )
}
export function MenuV4({ active = "Settings" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="w-48 flex flex-col gap-0">
      <div className="border-3 border-black bg-[#ffdd00] px-3 py-1.5 font-black text-xs uppercase">Sections</div>
      {menuItems.map((item, i) => <button key={item.label} onClick={() => setSel(item.label)} className={`flex items-center gap-2 w-full px-3 py-2.5 font-bold text-sm text-left transition-colors border-l-3 border-r-3 border-b-3 border-black ${sel===item.label?"bg-[#ffdd00] border-l-8 border-l-black":"bg-white hover:bg-[#ffdd00]/30"}`}><span className="w-5 h-5 border-2 border-black flex items-center justify-center text-xs font-black bg-white">{i+1}</span>{item.label}</button>)}
    </nav>
  )
}
export function MenuV5({ active = "Dashboard" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="w-48 flex flex-col gap-1">
      {menuItems.map(item => (
        <button key={item.label} onClick={() => setSel(item.label)} className="relative group w-full text-left">
          {sel===item.label && <div className="absolute inset-0 translate-x-1 translate-y-1 bg-[#ff66cc]" />}
          <div className={`relative flex items-center gap-2 px-3 py-2.5 font-bold text-sm border-3 border-black transition-colors ${sel===item.label?"bg-white":"bg-white hover:bg-gray-50"}`}><span>{item.icon}</span>{item.label}</div>
        </button>
      ))}
    </nav>
  )
}
export function MenuV6({ active = "Analytics" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="w-48 border-3 border-black shadow-[4px_4px_0px_black] overflow-hidden">
      {menuItems.map((item,i) => <button key={item.label} onClick={() => setSel(item.label)} style={{backgroundColor: sel===item.label?["#ff66cc","#ccff00","#00ccff","#ffdd00"][i]:"white"}} className={`flex items-center justify-between w-full px-3 py-2.5 font-bold text-sm border-b-2 last:border-b-0 border-b-black text-left hover:opacity-90 transition-opacity`}><span className="flex items-center gap-2"><span>{item.icon}</span>{item.label}</span>{sel===item.label&&<span className="font-black text-xs">✓</span>}</button>)}
    </nav>
  )
}
export function MenuV7({ active = "Content" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="w-full flex gap-0 border-3 border-black shadow-[4px_4px_0px_black] overflow-hidden">
      {menuItems.map((item,i) => <button key={item.label} onClick={() => setSel(item.label)} style={{backgroundColor: sel===item.label?["#ff66cc","#ccff00","#00ccff","#ffdd00"][i]:"white"}} className={`flex-1 px-2 py-3 font-black text-xs text-center border-r-3 last:border-r-0 border-r-black uppercase tracking-wide transition-colors hover:opacity-80`}>{item.icon}<br/>{item.label}</button>)}
    </nav>
  )
}
export function MenuV8({ active = "Settings" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="w-48 flex flex-col gap-1">
      <div className="font-black text-xs uppercase text-black mb-1 px-1">Main Menu</div>
      {menuItems.map(item => <button key={item.label} onClick={() => setSel(item.label)} className={`flex items-center gap-2 w-full px-3 py-2 font-bold text-sm text-left transition-all ${sel===item.label?"border-3 border-black bg-[#ff66cc] shadow-[3px_3px_0px_black]":"border-3 border-transparent hover:border-black hover:bg-white"}`}><span>{item.icon}</span>{item.label}</button>)}
    </nav>
  )
}
export function MenuV9({ active = "Dashboard" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="w-48 border-4 border-black shadow-[6px_6px_0px_black] overflow-hidden">
      <div className="bg-black text-[#ff66cc] border-b-4 border-b-[#ff66cc] px-3 py-2 font-black text-xs uppercase">Navigation</div>
      {menuItems.map(item => <button key={item.label} onClick={() => setSel(item.label)} className={`flex items-center gap-2 w-full px-3 py-2.5 font-bold text-sm border-b-2 last:border-b-0 border-b-black/20 text-left transition-colors ${sel===item.label?"bg-[#ff66cc] text-black border-b-black":"bg-white hover:bg-[#ff66cc]/20"}`}><span>{item.icon}</span>{item.label}</button>)}
    </nav>
  )
}
export function MenuV10({ active = "Analytics" }: { active?: string }) {
  const [sel, setSel] = useState(active)
  return (
    <nav className="w-48 flex flex-col gap-0">
      {menuItems.map((item,i) => (
        <button key={item.label} onClick={() => setSel(item.label)} className={`group flex items-center gap-3 w-full px-3 py-2.5 font-bold text-sm text-left transition-colors border-3 border-black ${i>0?"-mt-px":""} ${sel===item.label?"bg-[#ccff00] z-10":"bg-white hover:bg-[#ccff00]/40 z-0"}`} style={{zIndex: sel===item.label?10:0}}>
          <div className={`w-1.5 h-6 ${sel===item.label?"bg-black":"bg-transparent group-hover:bg-black/30"} transition-colors`} />
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

// =============================================================================
// PAGINATION — 10 variants
// =============================================================================
function usePagination(total = 8) {
  const [page, setPage] = useState(1)
  return { page, setPage, total }
}

export function PaginationV1() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="flex items-center gap-0 border-3 border-black shadow-[3px_3px_0px_black] w-fit overflow-hidden">
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-2 border-r-3 border-r-black font-black hover:bg-[#ff66cc] disabled:opacity-40 transition-colors">←</button>
      {Array.from({length:total}).map((_,i) => <button key={i} onClick={() => setPage(i+1)} className={`w-9 py-2 font-black text-sm border-r-2 last:border-r-0 border-r-black transition-colors ${page===i+1?"bg-[#ff66cc]":"bg-white hover:bg-gray-100"}`}>{i+1}</button>)}
      <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="px-3 py-2 border-l-3 border-l-black font-black hover:bg-[#ff66cc] disabled:opacity-40 transition-colors">→</button>
    </div>
  )
}
export function PaginationV2() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="border-3 border-black bg-white font-black px-3 py-2 shadow-[3px_3px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_black] transition-all disabled:opacity-40">←</button>
      <div className="flex items-center gap-1.5">
        {Array.from({length:total}).map((_,i) => <button key={i} onClick={() => setPage(i+1)} className={`w-9 h-9 border-3 border-black font-black text-sm shadow-[2px_2px_0px_black] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${page===i+1?"bg-[#ccff00] shadow-[4px_4px_0px_black] -translate-x-0.5 -translate-y-0.5":"bg-white"}`}>{i+1}</button>)}
      </div>
      <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="border-3 border-black bg-white font-black px-3 py-2 shadow-[3px_3px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_black] transition-all disabled:opacity-40">→</button>
    </div>
  )
}
export function PaginationV3() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="border-3 border-black bg-[#ff66cc] font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black] disabled:opacity-40">Prev</button>
      <div className="border-3 border-black bg-white shadow-[3px_3px_0px_black] px-4 py-1.5 font-black text-sm">{page} / {total}</div>
      <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="border-3 border-black bg-[#ccff00] font-black px-3 py-1.5 text-sm shadow-[3px_3px_0px_black] disabled:opacity-40">Next</button>
    </div>
  )
}
export function PaginationV4() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-white p-2 flex items-center gap-2 w-fit">
      <button onClick={() => setPage(1)} disabled={page===1} className="border-2 border-black px-2 py-1 font-black text-xs hover:bg-[#ff66cc] disabled:opacity-40">⟨⟨</button>
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="border-2 border-black px-2 py-1 font-black text-xs hover:bg-[#ff66cc] disabled:opacity-40">⟨</button>
      <span className="font-black text-sm px-2 border-3 border-black bg-[#ffdd00]">{page}</span>
      <span className="font-bold text-xs">of {total}</span>
      <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="border-2 border-black px-2 py-1 font-black text-xs hover:bg-[#ccff00] disabled:opacity-40">⟩</button>
      <button onClick={() => setPage(total)} disabled={page===total} className="border-2 border-black px-2 py-1 font-black text-xs hover:bg-[#ccff00] disabled:opacity-40">⟩⟩</button>
    </div>
  )
}
export function PaginationV5() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="flex items-center gap-1">
      {Array.from({length:total}).map((_,i) => <button key={i} onClick={() => setPage(i+1)} className={`w-3 h-3 border-2 border-black transition-all ${page===i+1?"bg-[#ff66cc] scale-110":"bg-white hover:bg-gray-200"}`} />)}
      <span className="ml-2 font-bold text-xs border-2 border-black px-2 py-0.5">{page}/{total}</span>
    </div>
  )
}
export function PaginationV6() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="flex flex-col items-start gap-1 border-3 border-black shadow-[4px_4px_0px_black] bg-white p-2 w-fit">
      <div className="font-black text-xs uppercase border-b-3 border-b-black w-full pb-1 mb-1">Page</div>
      <div className="flex gap-1 flex-wrap w-40">{Array.from({length:total}).map((_,i) => <button key={i} onClick={() => setPage(i+1)} className={`w-8 h-8 border-3 border-black font-black text-sm transition-all ${page===i+1?"bg-[#ff66cc] shadow-[2px_2px_0px_black]":"bg-white hover:bg-[#ccff00]"}`}>{i+1}</button>)}</div>
    </div>
  )
}
export function PaginationV7() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="border-3 border-black bg-black text-[#ccff00] font-black px-3 py-2 shadow-[3px_3px_0px_#ccff00] hover:bg-[#111] disabled:opacity-40">◀</button>
      <div className="flex items-center gap-1">{Array.from({length:total}).map((_,i) => <button key={i} onClick={() => setPage(i+1)} className={`w-8 h-8 border-2 border-black font-black text-sm ${page===i+1?"bg-[#ccff00] text-black border-[#ccff00]":"bg-black text-white/60 hover:text-white"}`}>{i+1}</button>)}</div>
      <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="border-3 border-black bg-black text-[#ccff00] font-black px-3 py-2 shadow-[3px_3px_0px_#ccff00] hover:bg-[#111] disabled:opacity-40">▶</button>
    </div>
  )
}
export function PaginationV8() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="flex items-center gap-0 w-fit border-3 border-black overflow-hidden shadow-[4px_4px_0px_black]">
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-2 font-black bg-[#ccff00] border-r-3 border-r-black hover:bg-[#ffdd00] disabled:opacity-40">‹</button>
      {[page-1,page,page+1].filter(p=>p>=1&&p<=total).map(p=><button key={p} onClick={()=>setPage(p)} className={`w-10 py-2 font-black text-sm border-r-2 border-r-black last:border-r-0 transition-colors ${p===page?"bg-[#ff66cc]":"bg-white hover:bg-gray-100"}`}>{p}</button>)}
      <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="px-3 py-2 font-black bg-[#ccff00] border-l-3 border-l-black hover:bg-[#ffdd00] disabled:opacity-40">›</button>
    </div>
  )
}
export function PaginationV9() {
  const { page, setPage, total } = usePagination()
  const pct = ((page-1)/(total-1))*100
  return (
    <div className="flex flex-col gap-2 w-56">
      <div className="border-3 border-black h-4 bg-white overflow-hidden shadow-[2px_2px_0px_black]"><div className="h-full bg-[#ff66cc] transition-all duration-300" style={{width:`${pct}%`}} /></div>
      <div className="flex items-center justify-between">
        <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="border-3 border-black bg-white font-black px-3 py-1.5 text-sm hover:bg-[#ff66cc] disabled:opacity-40">←</button>
        <span className="font-black text-sm border-3 border-black px-3 py-1.5 bg-[#ff66cc]">{page}/{total}</span>
        <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="border-3 border-black bg-white font-black px-3 py-1.5 text-sm hover:bg-[#ccff00] disabled:opacity-40">→</button>
      </div>
    </div>
  )
}
export function PaginationV10() {
  const { page, setPage, total } = usePagination()
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="border-3 border-black bg-white font-black w-9 h-9 flex items-center justify-center shadow-[3px_3px_0px_black] hover:bg-[#ff66cc] disabled:opacity-40">‹</button>
      <div className="font-black text-sm flex items-center gap-1"><span className="border-3 border-black bg-[#ccff00] px-2 py-1">{page}</span><span className="font-bold text-gray-500">of</span><span>{total}</span></div>
      <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="border-3 border-black bg-white font-black w-9 h-9 flex items-center justify-center shadow-[3px_3px_0px_black] hover:bg-[#ccff00] disabled:opacity-40">›</button>
    </div>
  )
}

// =============================================================================
// PROGRESS BAR — 10 variants
// =============================================================================
export function ProgressBarV1({ value = 68 }: { value?: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between font-black text-xs mb-1"><span>Progress</span><span>{value}%</span></div>
      <div className="border-3 border-black h-6 bg-white overflow-hidden shadow-[3px_3px_0px_black]">
        <div className="h-full bg-[#ff66cc] border-r-3 border-r-black transition-all duration-500" style={{width:`${value}%`}} />
      </div>
    </div>
  )
}
export function ProgressBarV2({ value = 45 }: { value?: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between font-black text-xs mb-1"><span>Upload</span><span>{value}%</span></div>
      <div className="border-3 border-black h-5 bg-white overflow-hidden shadow-[3px_3px_0px_black] relative">
        <div className="h-full bg-[#ccff00] transition-all duration-500" style={{width:`${value}%`}} />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:"repeating-linear-gradient(90deg,transparent 0,transparent 6px,black 6px,black 7px)"}} />
      </div>
    </div>
  )
}
export function ProgressBarV3({ value = 80 }: { value?: number }) {
  return (
    <div className="w-full">
      <div className="border-3 border-black h-8 bg-white overflow-hidden shadow-[4px_4px_0px_black] relative">
        <div className="h-full bg-[#00ccff] transition-all duration-500" style={{width:`${value}%`}} />
        <div className="absolute inset-0 flex items-center justify-center font-black text-sm mix-blend-difference text-white">{value}%</div>
      </div>
    </div>
  )
}
export function ProgressBarV4({ value = 60 }: { value?: number }) {
  const segs = 10
  return (
    <div className="flex gap-1">
      {Array.from({length:segs}).map((_,i) => <div key={i} className={`h-6 flex-1 border-3 border-black transition-colors ${i<Math.round(value/100*segs)?"bg-[#ff66cc] shadow-[2px_2px_0px_black]":"bg-white"}`} />)}
    </div>
  )
}
export function ProgressBarV5({ value = 75 }: { value?: number }) {
  return (
    <div className="w-full">
      <div className="h-3 border-3 border-black bg-white overflow-hidden">
        <div className="h-full transition-all duration-500" style={{width:`${value}%`,backgroundImage:"repeating-linear-gradient(45deg,#ff66cc 0,#ff66cc 6px,#ccff00 6px,#ccff00 12px)"}} />
      </div>
    </div>
  )
}
export function ProgressBarV6({ value = 55 }: { value?: number }) {
  return (
    <div className="w-full border-3 border-black shadow-[4px_4px_0px_black] bg-black overflow-hidden">
      <div className="px-3 py-1 flex justify-between border-b-3 border-b-[#ccff00]"><span className="font-black text-xs text-[#ccff00]">Loading</span><span className="font-mono text-xs text-[#ff66cc]">{value}%</span></div>
      <div className="h-4 bg-[#111] m-2 border border-[#ccff00] overflow-hidden">
        <div className="h-full bg-[#ccff00] transition-all duration-500" style={{width:`${value}%`}} />
      </div>
    </div>
  )
}
export function ProgressBarV7({ items = [{label:"Design",v:90},{label:"Code",v:75},{label:"Test",v:40}] }: { items?: {label:string;v:number}[] }) {
  return (
    <div className="flex flex-col gap-3 border-3 border-black shadow-[4px_4px_0px_black] bg-white p-3">
      {items.map((item,i) => (
        <div key={item.label}>
          <div className="flex justify-between font-black text-xs mb-1"><span>{item.label}</span><span>{item.v}%</span></div>
          <div className="h-4 border-3 border-black bg-white overflow-hidden">
            <div className="h-full transition-all duration-500" style={{width:`${item.v}%`,backgroundColor:["#ff66cc","#ccff00","#00ccff"][i]}} />
          </div>
        </div>
      ))}
    </div>
  )
}
export function ProgressBarV8({ value = 35 }: { value?: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between font-black text-xs mb-1 uppercase tracking-wider"><span>Storage</span><span>{value}%</span></div>
      <div className="relative h-6 border-3 border-black bg-white overflow-hidden shadow-[3px_3px_0px_black]">
        <div className="h-full bg-[#ffdd00] transition-all duration-500" style={{width:`${value}%`}} />
        <div className="absolute right-2 top-0 h-full flex items-center font-black text-xs">{100-value}% free</div>
      </div>
    </div>
  )
}
export function ProgressBarV9({ steps = ["Plan","Build","Test","Deploy"], current = 2 }: { steps?: string[]; current?: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step,i) => (
        <div key={step} className="flex items-center flex-1">
          <div className={`flex-1 h-5 border-3 border-black flex items-center justify-center font-black text-xs uppercase ${i<current?"bg-[#ff66cc]":i===current?"bg-[#ccff00]":"bg-white"} ${i>0?"-ml-px":""}`} style={{zIndex:steps.length-i}}>{step}</div>
        </div>
      ))}
    </div>
  )
}
export function ProgressBarV10({ value = 82 }: { value?: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <div className="flex-1 border-4 border-black h-7 bg-white overflow-hidden shadow-[4px_4px_0px_black] relative">
          <div className="h-full bg-[#ff66cc] transition-all duration-500 border-r-4 border-r-black" style={{width:`${value}%`}} />
        </div>
        <div className="border-3 border-black bg-[#ff66cc] font-black text-sm px-2 py-1 shadow-[3px_3px_0px_black] min-w-[48px] text-center">{value}%</div>
      </div>
    </div>
  )
}

// =============================================================================
// PROGRESS RING — 10 variants
// =============================================================================
function RingSVG({ value, size=80, stroke=8, color="#ff66cc", bg="white", label="" }: { value:number; size?:number; stroke?:number; color?:string; bg?:string; label?:string }) {
  const r = (size-stroke*2)/2
  const circ = 2*Math.PI*r
  const dash = (value/100)*circ
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill={bg} stroke="black" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke-2} strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="square" />
      </svg>
      <div className="absolute text-center"><div className="font-black text-sm leading-none">{value}%</div>{label&&<div className="font-bold text-xs mt-0.5">{label}</div>}</div>
    </div>
  )
}

export function ProgressRingV1({ value = 72 }: { value?: number }) { return <div className="border-3 border-black p-4 bg-white shadow-[4px_4px_0px_black] w-fit"><RingSVG value={value} color="#ff66cc" /></div> }
export function ProgressRingV2({ value = 58 }: { value?: number }) { return <div className="border-3 border-black p-4 bg-black shadow-[4px_4px_0px_#ccff00] w-fit"><RingSVG value={value} color="#ccff00" bg="#111" label="Score" /></div> }
export function ProgressRingV3({ value = 88 }: { value?: number }) { return <div className="border-3 border-black p-4 bg-[#ccff00] shadow-[4px_4px_0px_black] w-fit"><RingSVG value={value} color="#00ccff" bg="#ccff00" /></div> }
export function ProgressRingV4({ value = 45 }: { value?: number }) {
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-white p-4 flex flex-col items-center gap-2 w-fit">
      <RingSVG value={value} color="#ffb158" size={70} stroke={10} />
      <div className="border-3 border-black bg-[#ffb158] px-3 py-0.5 font-black text-xs uppercase">Progress</div>
    </div>
  )
}
export function ProgressRingV5({ items = [{v:80,c:"#ff66cc"},{v:60,c:"#ccff00"},{v:40,c:"#00ccff"}] }: { items?: {v:number;c:string}[] }) {
  return (
    <div className="flex gap-3 border-3 border-black p-4 shadow-[4px_4px_0px_black] bg-white w-fit">
      {items.map((item,i) => <RingSVG key={i} value={item.v} color={item.c} size={65} stroke={7} />)}
    </div>
  )
}
export function ProgressRingV6({ value = 65 }: { value?: number }) {
  return (
    <div className="flex items-center gap-4 border-3 border-black p-3 shadow-[4px_4px_0px_black] bg-white w-fit">
      <RingSVG value={value} color="#ff66cc" size={60} stroke={8} />
      <div><div className="font-black text-sm uppercase">Completion</div><div className="font-bold text-xs text-gray-500">Task progress</div><div className="h-1.5 border-2 border-black bg-white w-24 mt-1 overflow-hidden"><div className="h-full bg-[#ff66cc]" style={{width:`${value}%`}} /></div></div>
    </div>
  )
}
export function ProgressRingV7({ value = 92 }: { value?: number }) {
  return (
    <div className="border-3 border-black p-4 bg-white shadow-[4px_4px_0px_black] w-fit flex flex-col items-center gap-1">
      <div className="font-black text-xs uppercase border-b-3 border-b-black w-full text-center pb-1 mb-1">Uptime</div>
      <RingSVG value={value} color="#ccff00" size={72} stroke={9} />
      <div className="font-bold text-xs text-green-700 border-2 border-black bg-[#ccff00] px-2">LIVE</div>
    </div>
  )
}
export function ProgressRingV8({ value = 50 }: { value?: number }) {
  const r = 30, circ = 2*Math.PI*r, dash=(value/100)*circ
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-white p-4 w-fit">
      <svg width={80} height={80}>
        <circle cx={40} cy={40} r={r} fill="white" stroke="black" strokeWidth={4} />
        <circle cx={40} cy={40} r={r} fill="none" stroke="#ff66cc" strokeWidth={6} strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="square" transform="rotate(-90 40 40)" />
        <circle cx={40} cy={40} r={r} fill="none" stroke="#ccff00" strokeWidth={6} strokeDasharray={`${circ-dash} ${dash}`} strokeDashoffset={-dash} strokeLinecap="square" transform="rotate(-90 40 40)" />
        <text x={40} y={44} textAnchor="middle" fontSize={12} fontWeight="900" fill="black">{value}%</text>
      </svg>
    </div>
  )
}
export function ProgressRingV9({ items = [{label:"CPU",v:75},{label:"RAM",v:45},{label:"GPU",v:90}] }: { items?: {label:string;v:number}[] }) {
  const colors = ["#ff66cc","#ccff00","#00ccff"]
  return (
    <div className="border-3 border-black shadow-[4px_4px_0px_black] bg-white p-4 w-fit">
      <div className="font-black text-xs uppercase border-b-3 border-b-black pb-1 mb-3">System Load</div>
      <div className="flex gap-4">{items.map((item,i) => <div key={item.label} className="flex flex-col items-center gap-1"><RingSVG value={item.v} color={colors[i]} size={60} stroke={7} /><div className="font-black text-xs uppercase">{item.label}</div></div>)}</div>
    </div>
  )
}
export function ProgressRingV10({ value = 77 }: { value?: number }) {
  return (
    <div className="relative w-fit">
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-[#ff66cc]" />
      <div className="relative border-3 border-black bg-white p-4 flex flex-col items-center gap-2">
        <RingSVG value={value} color="#ff66cc" size={72} stroke={9} />
        <div className="font-black text-xs uppercase">Goal</div>
      </div>
    </div>
  )
}
