import React, { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Bolt, SlidersHorizontal, Sparkles, ShieldCheck } from "lucide-react"
import { CONTROL_SHELL, hexToRgba } from "./ToolboxUISystem"

type RailShellProps = {
 icon: React.ReactNode
 label: string
 tone: string
 rightSlot?: React.ReactNode
 children?: React.ReactNode
 open?: boolean
}

const Rail = ({ icon, tone }: { icon: React.ReactNode; tone: string }) => (
 <div
  className="h-full shrink-0 flex items-center justify-center"
  style={{
   width: `${CONTROL_SHELL.headerHeight}px`,
   borderRight: `${CONTROL_SHELL.stroke}px solid black`,
   backgroundColor: tone,
  }}>
  {icon}
 </div>
)

const RailShell: React.FC<RailShellProps> = ({
 icon,
 label,
 tone,
 rightSlot,
 children,
 open = false,
}) => {
 const shadowColor = useMemo(() => hexToRgba(tone, 0.38), [tone])

 return (
  <div
   className={`grid transition-[grid-template-rows] ${CONTROL_SHELL.transition} ${open ? "grid-rows-[auto_1fr]" : "grid-rows-[auto_0fr]"}`}>
   <div
    className="w-full overflow-hidden rounded-2xl border-[4px] border-black bg-white"
    style={{
     height: `${CONTROL_SHELL.height}px`,
     minHeight: `${CONTROL_SHELL.height}px`,
     boxShadow: `${CONTROL_SHELL.shadowOffset}px ${CONTROL_SHELL.shadowOffset}px 0px 0px ${shadowColor}`,
    }}>
    <div className="h-full w-full flex items-center">
     <Rail icon={icon} tone={tone} />
     <div className="flex-1 min-w-0 px-4">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black/45 leading-none">
       SubToolbox Control
      </p>
      <p className="text-sm font-black uppercase tracking-tight text-black leading-tight truncate">
       {label}
      </p>
     </div>
     <div className="pr-3 shrink-0 flex items-center gap-2">{rightSlot}</div>
    </div>
   </div>

   <div
    className={`grid transition-[grid-template-rows,opacity] ${CONTROL_SHELL.transition} ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    style={{ marginTop: `-${CONTROL_SHELL.stroke}px` }}>
    <div className="overflow-hidden">
     <div className="border-x-[4px] border-b-[4px] border-black rounded-b-2xl bg-white px-4 py-3">
      {children}
     </div>
    </div>
   </div>
  </div>
 )
}

export const SubtoolboxActionControl: React.FC<{
 label: string
 onClick?: () => void
}> = ({ label, onClick }) => (
 <button className="w-full text-left" onClick={onClick} type="button">
  <RailShell
   icon={<Bolt size={18} strokeWidth={3} className="text-black" />}
   tone="#CCFF00"
   label={label}
   rightSlot={<ChevronRight size={18} strokeWidth={3} className="text-black" />}
  />
 </button>
)

export const SubtoolboxToggleControl: React.FC<{
 label: string
 value?: boolean
 onChange?: (next: boolean) => void
}> = ({ label, value = false, onChange }) => {
 const [internal, setInternal] = useState(value)
 const isOn = onChange ? value : internal

 const setNext = () => {
  const next = !isOn
  if (onChange) onChange(next)
  else setInternal(next)
 }

 return (
  <button className="w-full text-left" type="button" onClick={setNext}>
   <RailShell
    icon={<ShieldCheck size={18} strokeWidth={3} className="text-black" />}
    tone="#24D3FF"
    label={label}
    rightSlot={
     <span
      className={`relative h-6 w-12 rounded-full border-[3px] border-black transition-colors ${isOn ? "bg-[#CCFF00]" : "bg-[#E5E7EB]"}`}>
      <span
       className={`absolute top-0.5 h-4 w-4 rounded-full border-[2px] border-black bg-white transition-all ${isOn ? "left-6" : "left-0.5"}`}
      />
     </span>
    }
   />
  </button>
 )
}

export const SubtoolboxDropdownControl: React.FC<{
 label: string
 options: string[]
 initialValue?: string
}> = ({ label, options, initialValue }) => {
 const [open, setOpen] = useState(false)
 const [selected, setSelected] = useState(initialValue || options[0] || "")

 return (
  <div>
   <button className="w-full text-left" type="button" onClick={() => setOpen((v) => !v)}>
    <RailShell
     icon={<SlidersHorizontal size={18} strokeWidth={3} className="text-black" />}
     tone="#FFE357"
     label={`${label}: ${selected}`}
     open={open}
     rightSlot={
      <ChevronDown
       size={18}
       strokeWidth={3}
       className={`text-black transition-transform ${open ? "rotate-180" : "rotate-0"}`}
      />
     }>
     <div className="grid grid-cols-1 gap-2">
      {options.map((option) => (
       <button
        key={option}
        type="button"
        onClick={() => {
         setSelected(option)
         setOpen(false)
        }}
        className={`w-full text-left border-[3px] border-black rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
         selected === option ? "bg-[#CCFF00]" : "bg-white hover:bg-[#F3F4F6]"
        }`}>
        {option}
       </button>
      ))}
     </div>
    </RailShell>
   </button>
  </div>
 )
}

export const SubtoolboxStatusStrip: React.FC<{
 title: string
 value: string
 detail: string
}> = ({ title, value, detail }) => (
 <RailShell
  icon={<Sparkles size={18} strokeWidth={3} className="text-black" />}
  tone="#FF7497"
  label={title}
  rightSlot={<span className="text-xs font-black uppercase tracking-wide text-black">{value}</span>}>
  <p className="text-[11px] font-black uppercase tracking-[0.08em] text-black/55">{detail}</p>
 </RailShell>
)

export const SubtoolboxComponentSetDemo: React.FC = () => {
 return (
  <div className="space-y-4">
   <SubtoolboxActionControl label="Run Integrity Check" />
   <SubtoolboxToggleControl label="Lifetime Lock" value />
   <SubtoolboxDropdownControl
    label="Window"
    options={["Lifetime", "365D", "90D", "28D", "7D"]}
    initialValue="Lifetime"
   />
   <SubtoolboxStatusStrip
    title="Coverage Health"
    value="Stable"
    detail="Connected-source totals and master-catalog totals are both visible."
   />
  </div>
 )
}
