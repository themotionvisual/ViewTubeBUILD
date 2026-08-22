import React, { useEffect, useState } from "react"

type ControlTone = "lime" | "cyan" | "pink" | "white"

const toneClasses: Record<ControlTone, string> = {
 lime: "bg-[#CCFF00]",
 cyan: "bg-[#00CCFF]",
 pink: "bg-[#FF3399]",
 white: "bg-white",
}

type BinaryControlProps = {
 label?: string
 active?: boolean
 color?: ControlTone
 onChange?: (active: boolean) => void
}

export const ReferenceToggle: React.FC<BinaryControlProps & { badge?: string }> = ({
 label,
 active = false,
 color = "white",
 badge,
 onChange,
}) => {
 const [isOn, setIsOn] = useState(active)
 const toggle = () => setIsOn((current) => {
  const next = !current
  onChange?.(next)
  return next
 })
 return (
  <button type="button" onClick={toggle} className="flex items-center gap-3 border-0 bg-transparent p-0 text-left">
   <span className={`relative h-[30px] w-[54px] shrink-0 rounded-full border-[3px] border-black shadow-[2px_2px_0_black] ${isOn ? toneClasses[color] : "bg-white"}`}>
    <span className={`absolute top-1/2 h-[20px] w-[20px] -translate-y-1/2 rounded-full bg-black transition-transform duration-75 ${isOn ? "translate-x-[28px]" : "translate-x-[2px]"}`} />
   </span>
   {label ? <span className="text-xs font-black uppercase">{label}</span> : null}
   {badge ? <span className="bg-black px-2 py-1 text-xs font-black uppercase text-white">{badge}</span> : null}
  </button>
 )
}

export const ReferenceCheckbox: React.FC<BinaryControlProps & { done?: boolean }> = ({
 label,
 active = false,
 color = "white",
 done = false,
 onChange,
}) => {
 const [isOn, setIsOn] = useState(active)
 const toggle = () => setIsOn((current) => {
  const next = !current
  onChange?.(next)
  return next
 })
 return (
  <button type="button" onClick={toggle} className="flex items-center gap-3 border-0 bg-transparent p-0 text-left">
   <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[6px] border-[3px] border-black shadow-[2px_2px_0_black] ${isOn ? toneClasses[color] : "bg-white"}`}>
    {isOn ? <span className="text-lg font-black leading-none">{done ? "✓" : "×"}</span> : null}
   </span>
   {label ? <span className="text-xs font-black uppercase">{label}</span> : null}
  </button>
 )
}

export const ReferenceRadio: React.FC<BinaryControlProps & { groupName: string }> = ({
 label,
 active = false,
 color = "white",
 groupName,
 onChange,
}) => {
 const [isOn, setIsOn] = useState(active)
 return (
  <label className="flex cursor-pointer items-center gap-3">
   <input type="radio" name={groupName} checked={isOn} onChange={(event) => { setIsOn(event.currentTarget.checked); onChange?.(event.currentTarget.checked) }} className="sr-only" />
   <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border-[3px] border-black bg-white shadow-[2px_2px_0_black]">
    {isOn ? <span className={`h-[18px] w-[18px] rounded-full ${toneClasses[color]}`} /> : null}
   </span>
   {label ? <span className="text-xs font-black uppercase">{label}</span> : null}
  </label>
 )
}

export const ReferenceDialog: React.FC<React.PropsWithChildren<{
 isOpen: boolean
 onClose: () => void
 title: string
 footer?: React.ReactNode
 headerColor?: "cyan" | "lime" | "pink" | "yellow" | "black"
}>> = ({ isOpen, onClose, title, footer, headerColor = "cyan", children }) => {
 useEffect(() => {
  if (!isOpen) return
  const previous = document.body.style.overflow
  document.body.style.overflow = "hidden"
  return () => { document.body.style.overflow = previous }
 }, [isOpen])
 if (!isOpen) return null
 const headerTone = { cyan: "bg-[#00CCFF]", lime: "bg-[#CCFF00]", pink: "bg-[#FF3399]", yellow: "bg-[#FFD600]", black: "bg-black text-white" }[headerColor]
 return (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 backdrop-blur-[2px]" onClick={onClose}>
   <section role="dialog" aria-modal="true" aria-label={title} className="w-[440px] max-w-[92vw] overflow-hidden rounded-[16px] border-[5px] border-black bg-white shadow-[12px_12px_0_black]" onClick={(event) => event.stopPropagation()}>
    <header className={`flex items-center justify-between border-b-[4px] border-black px-5 py-4 ${headerTone}`}>
     <span className="text-[20px] font-black uppercase tracking-wide">{title}</span>
     <button type="button" onClick={onClose} className="grid h-[30px] w-[30px] place-items-center border-2 border-black bg-black font-black text-white">×</button>
    </header>
    <div className="p-5">{children}</div>
    {footer ? <footer className="flex justify-end gap-2.5 border-t-[4px] border-black px-5 py-4">{footer}</footer> : null}
   </section>
  </div>
 )
}
