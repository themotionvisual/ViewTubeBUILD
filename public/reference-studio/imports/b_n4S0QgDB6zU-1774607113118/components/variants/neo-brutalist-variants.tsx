"use client"

import { useState, useEffect, ReactNode } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════
// SET A: NEO-BRUTALIST COMPONENT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════
// Style DNA from "Tokyo Pop" Specifications:
// - Borders: 3-4px solid black
// - Shadows: Hard-edge offsets (no blur) - shadow-[4px_4px_0px_black]
// - Corners: Sharp (0px) for major sections
// - Colors: Pink (#ff66cc), Lime (#ccff00), Cyan (#00ccff), Yellow (#ffdd00), Orange (#ffb158)
// ═══════════════════════════════════════════════════════════════════════════════════

// COLOR PALETTE
const NEO = {
  pink: "#ff66cc",
  lime: "#ccff00",
  cyan: "#00ccff",
  yellow: "#ffdd00",
  orange: "#ffb158",
  black: "#000000",
  white: "#ffffff",
  gray: "#f3f4f6",
}

// ═══════════════════════════════════════════════════════════════════════════════════
// BUTTON VARIANTS (10 versions)
// ═══════════════════════════════════════════════════════════════════════════════════

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
}

// V1: Classic Pop - Standard lift on hover
export function ButtonV1({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold border-4 border-black bg-[#ff66cc] 
        hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_black]
        active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
    >
      {children}
    </button>
  )
}

// V2: Chunky Shadow - Permanent heavy shadow
export function ButtonV2({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold border-4 border-black bg-[#ccff00] shadow-[6px_6px_0px_black]
        hover:shadow-[8px_8px_0px_black] hover:-translate-x-1 hover:-translate-y-1
        active:shadow-[2px_2px_0px_black] active:translate-x-1 active:translate-y-1 transition-all"
    >
      {children}
    </button>
  )
}

// V3: Outline Ghost - Transparent with thick border
export function ButtonV3({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold border-4 border-black bg-transparent
        hover:bg-[#00ccff] transition-colors"
    >
      {children}
    </button>
  )
}

// V4: Stacked Layers - Multiple offset layers
export function ButtonV4({ children, onClick }: ButtonProps) {
  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black" />
      <div className="absolute inset-0 translate-x-1 translate-y-1 bg-[#ff66cc] border-4 border-black" />
      <button
        onClick={onClick}
        className="relative px-6 py-3 font-bold border-4 border-black bg-[#ffdd00]
          hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
      >
        {children}
      </button>
    </div>
  )
}

// V5: Split Color - Diagonal split background
export function ButtonV5({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold border-4 border-black relative overflow-hidden
        hover:shadow-[4px_4px_0px_black] transition-all"
      style={{
        background: "linear-gradient(135deg, #ff66cc 50%, #00ccff 50%)"
      }}
    >
      <span className="relative z-10">{children}</span>
    </button>
  )
}

// V6: Pill Shape - Rounded but still brutalist
export function ButtonV6({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 font-bold border-4 border-black bg-[#ffb158] rounded-full
        shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black]
        hover:-translate-y-1 transition-all"
    >
      {children}
    </button>
  )
}

// V7: Icon Slot - With icon placeholder
export function ButtonV7({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold border-4 border-black bg-[#ccff00] flex items-center gap-2
        hover:shadow-[4px_4px_0px_black] transition-all"
    >
      <span className="w-6 h-6 bg-black flex items-center justify-center text-white text-sm">+</span>
      {children}
    </button>
  )
}

// V8: Press Effect - Inset shadow on active
export function ButtonV8({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold border-4 border-black bg-[#00ccff]
        shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black]
        active:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.3)] transition-all"
    >
      {children}
    </button>
  )
}

// V9: Underline Accent - Bottom border highlight
export function ButtonV9({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold border-4 border-black bg-white
        border-b-8 border-b-[#ff66cc] hover:border-b-[#ccff00] transition-colors"
    >
      {children}
    </button>
  )
}

// V10: Neon Glow - Colored shadow
export function ButtonV10({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold border-4 border-black bg-[#ffdd00]
        shadow-[4px_4px_0px_#ff66cc] hover:shadow-[6px_6px_0px_#00ccff] transition-all"
    >
      {children}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// CARD VARIANTS (10 versions)
// ═══════════════════════════════════════════════════════════════════════════════════

interface CardProps {
  title: string
  children: ReactNode
}

// V1: Classic Card
export function CardV1({ title, children }: CardProps) {
  return (
    <div className="border-4 border-black bg-white shadow-[6px_6px_0px_black]">
      <div className="px-4 py-3 border-b-4 border-black bg-[#ff66cc] font-bold uppercase">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// V2: Offset Header
export function CardV2({ title, children }: CardProps) {
  return (
    <div className="relative mt-4">
      <div className="absolute -top-4 left-4 px-4 py-2 border-4 border-black bg-[#ccff00] font-bold uppercase z-10">
        {title}
      </div>
      <div className="border-4 border-black bg-white p-4 pt-8 shadow-[4px_4px_0px_black]">
        {children}
      </div>
    </div>
  )
}

// V3: Side Accent
export function CardV3({ title, children }: CardProps) {
  return (
    <div className="flex border-4 border-black bg-white shadow-[4px_4px_0px_black]">
      <div className="w-3 bg-[#00ccff]" />
      <div className="flex-1">
        <div className="px-4 py-3 border-b-4 border-black font-bold uppercase">{title}</div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// V4: Notched Corner
export function CardV4({ title, children }: CardProps) {
  return (
    <div className="relative border-4 border-black bg-white shadow-[4px_4px_0px_black]">
      <div className="absolute top-0 right-0 w-8 h-8 bg-[#ffdd00] border-l-4 border-b-4 border-black" />
      <div className="px-4 py-3 border-b-4 border-black font-bold uppercase">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// V5: Gradient Header
export function CardV5({ title, children }: CardProps) {
  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_black]">
      <div 
        className="px-4 py-3 border-b-4 border-black font-bold uppercase"
        style={{ background: "linear-gradient(90deg, #ff66cc, #ffdd00)" }}
      >
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// V6: Stacked Card
export function CardV6({ title, children }: CardProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-3 translate-y-3 border-4 border-black bg-[#ccff00]" />
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 border-4 border-black bg-[#00ccff]" />
      <div className="relative border-4 border-black bg-white">
        <div className="px-4 py-3 border-b-4 border-black font-bold uppercase">{title}</div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// V7: Badge Card
export function CardV7({ title, children }: CardProps) {
  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_black]">
      <div className="px-4 py-3 border-b-4 border-black flex items-center justify-between">
        <span className="font-bold uppercase">{title}</span>
        <span className="px-2 py-1 bg-[#ff66cc] border-2 border-black text-xs font-bold">NEW</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// V8: Striped Background
export function CardV8({ title, children }: CardProps) {
  return (
    <div 
      className="border-4 border-black shadow-[4px_4px_0px_black]"
      style={{
        backgroundImage: "repeating-linear-gradient(45deg, #fff, #fff 10px, #f3f4f6 10px, #f3f4f6 20px)"
      }}
    >
      <div className="px-4 py-3 border-b-4 border-black bg-[#ffb158] font-bold uppercase">{title}</div>
      <div className="p-4 bg-white">{children}</div>
    </div>
  )
}

// V9: Inverted Card
export function CardV9({ title, children }: CardProps) {
  return (
    <div className="border-4 border-black bg-black text-white shadow-[4px_4px_0px_#ff66cc]">
      <div className="px-4 py-3 border-b-4 border-white font-bold uppercase">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// V10: Double Border
export function CardV10({ title, children }: CardProps) {
  return (
    <div className="p-1 border-4 border-black bg-[#ccff00]">
      <div className="border-4 border-black bg-white">
        <div className="px-4 py-3 border-b-4 border-black font-bold uppercase">{title}</div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// INPUT VARIANTS (10 versions)
// ═══════════════════════════════════════════════════════════════════════════════════

interface InputProps {
  placeholder?: string
  label?: string
}

// V1: Classic Input
export function InputV1({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 border-4 border-black bg-white font-medium
          focus:outline-none focus:shadow-[4px_4px_0px_black] focus:-translate-x-1 focus:-translate-y-1 transition-all"
      />
    </div>
  )
}

// V2: Underline Only
export function InputV2({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 border-b-4 border-black bg-transparent font-medium
          focus:outline-none focus:border-[#ff66cc] transition-colors"
      />
    </div>
  )
}

// V3: Filled Background
export function InputV3({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 border-4 border-black bg-[#f3f4f6] font-medium
          focus:outline-none focus:bg-[#ccff00] transition-colors"
      />
    </div>
  )
}

// V4: With Icon
export function InputV4({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase text-sm">{label}</label>}
      <div className="flex border-4 border-black">
        <div className="px-4 py-3 bg-[#00ccff] border-r-4 border-black font-bold">@</div>
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-white font-medium focus:outline-none"
        />
      </div>
    </div>
  )
}

// V5: Floating Label
export function InputV5({ placeholder, label }: InputProps) {
  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState("")
  
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        className="px-4 py-3 pt-6 border-4 border-black bg-white font-medium w-full
          focus:outline-none focus:border-[#ff66cc] transition-colors"
      />
      <label 
        className={`absolute left-4 transition-all font-bold uppercase ${
          focused || value ? "top-1 text-xs text-[#ff66cc]" : "top-4 text-sm"
        }`}
      >
        {label}
      </label>
    </div>
  )
}

// V6: Shadow Input
export function InputV6({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 border-4 border-black bg-white font-medium shadow-[4px_4px_0px_black]
          focus:outline-none focus:shadow-[6px_6px_0px_#ff66cc] transition-all"
      />
    </div>
  )
}

// V7: Color Accent
export function InputV7({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase text-sm">{label}</label>}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="px-4 py-3 border-4 border-black bg-white font-medium w-full pl-6
            focus:outline-none"
        />
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ccff00]" />
      </div>
    </div>
  )
}

// V8: Chunky Input
export function InputV8({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-6 py-4 border-[6px] border-black bg-[#ffdd00] font-bold text-lg
          focus:outline-none focus:bg-[#ff66cc] transition-colors placeholder:text-black/50"
      />
    </div>
  )
}

// V9: Minimal Input
export function InputV9({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase text-sm tracking-widest">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 border-2 border-black bg-transparent font-medium
          focus:outline-none focus:bg-white transition-colors"
      />
    </div>
  )
}

// V10: Boxed Input
export function InputV10({ placeholder, label }: InputProps) {
  return (
    <div className="border-4 border-black p-1 bg-[#00ccff]">
      {label && <label className="block px-3 py-1 font-bold uppercase text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 border-4 border-black bg-white font-medium w-full
          focus:outline-none"
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// BADGE VARIANTS (10 versions)
// ═══════════════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: ReactNode
}

// V1: Classic Badge
export function BadgeV1({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 border-3 border-black bg-[#ff66cc] font-bold text-sm uppercase">
      {children}
    </span>
  )
}

// V2: Pill Badge
export function BadgeV2({ children }: BadgeProps) {
  return (
    <span className="px-4 py-1 border-3 border-black bg-[#ccff00] font-bold text-sm uppercase rounded-full">
      {children}
    </span>
  )
}

// V3: Shadowed Badge
export function BadgeV3({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 border-3 border-black bg-[#00ccff] font-bold text-sm uppercase shadow-[3px_3px_0px_black]">
      {children}
    </span>
  )
}

// V4: Inverted Badge
export function BadgeV4({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 border-3 border-black bg-black text-white font-bold text-sm uppercase">
      {children}
    </span>
  )
}

// V5: Outline Badge
export function BadgeV5({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 border-3 border-[#ff66cc] bg-transparent text-[#ff66cc] font-bold text-sm uppercase">
      {children}
    </span>
  )
}

// V6: Dot Badge
export function BadgeV6({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 border-3 border-black bg-white font-bold text-sm uppercase flex items-center gap-2">
      <span className="w-2 h-2 bg-[#ccff00] border border-black" />
      {children}
    </span>
  )
}

// V7: Rotated Badge
export function BadgeV7({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 border-3 border-black bg-[#ffdd00] font-bold text-sm uppercase -rotate-2 inline-block">
      {children}
    </span>
  )
}

// V8: Stacked Badge
export function BadgeV8({ children }: BadgeProps) {
  return (
    <span className="relative inline-block">
      <span className="absolute inset-0 translate-x-1 translate-y-1 bg-black" />
      <span className="relative px-3 py-1 border-3 border-black bg-[#ffb158] font-bold text-sm uppercase">
        {children}
      </span>
    </span>
  )
}

// V9: Icon Badge
export function BadgeV9({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 border-3 border-black bg-[#00ccff] font-bold text-sm uppercase flex items-center gap-1">
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
        <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="currentColor" stroke="black" strokeWidth="1"/>
      </svg>
      {children}
    </span>
  )
}

// V10: Double Border Badge
export function BadgeV10({ children }: BadgeProps) {
  return (
    <span className="px-1 py-0.5 border-3 border-black bg-[#ff66cc]">
      <span className="px-2 py-0.5 border-2 border-black bg-white font-bold text-sm uppercase block">
        {children}
      </span>
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ACCORDION VARIANTS (10 versions)
// ═══════════════════════════════════════════════════════════════════════════════════

interface AccordionProps {
  title: string
  children: ReactNode
  color?: string
}

// V1: Classic Accordion
export function AccordionV1({ title, children, color = "#ff66cc" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-4 border-black shadow-[4px_4px_0px_black]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between font-bold uppercase"
        style={{ backgroundColor: color }}
      >
        {title}
        <span className="text-xl">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t-4 border-black bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// V2: Slide Accordion
export function AccordionV2({ title, children, color = "#ccff00" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-4 border-black overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between font-bold uppercase"
        style={{ backgroundColor: color }}
      >
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm">
            {isOpen ? "▼" : "▶"}
          </span>
          {title}
        </span>
      </button>
      <div 
        className={`border-t-4 border-black bg-white transition-all overflow-hidden ${
          isOpen ? "max-h-96 p-4" : "max-h-0 p-0"
        }`}
      >
        {children}
      </div>
    </div>
  )
}

// V3: Bordered Accordion
export function AccordionV3({ title, children, color = "#00ccff" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-4 border-black">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between font-bold uppercase bg-white border-l-8"
        style={{ borderLeftColor: color }}
      >
        {title}
        <span className="w-8 h-8 border-3 border-black flex items-center justify-center font-bold"
          style={{ backgroundColor: color }}>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t-4 border-black bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// V4: Minimal Accordion
export function AccordionV4({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-b-4 border-black">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between font-bold uppercase"
      >
        {title}
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>
      {isOpen && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

// V5: Stacked Accordion
export function AccordionV5({ title, children, color = "#ffdd00" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black" />
      <div className="relative border-4 border-black bg-white">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between font-bold uppercase"
          style={{ backgroundColor: color }}
        >
          {title}
          <span>{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && (
          <div className="p-4 border-t-4 border-black">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

// V6: Icon Accordion
export function AccordionV6({ title, children, color = "#ffb158" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-4 border-black shadow-[4px_4px_0px_black]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center gap-3 font-bold uppercase"
        style={{ backgroundColor: color }}
      >
        <span className="w-8 h-8 bg-white border-3 border-black flex items-center justify-center">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        {title}
        <span className="ml-auto">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t-4 border-black bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// V7: Tab-style Accordion
export function AccordionV7({ title, children, color = "#ff66cc" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-6 py-3 font-bold uppercase border-4 border-black border-b-0 ${
          isOpen ? "" : "border-b-4"
        }`}
        style={{ backgroundColor: color }}
      >
        {title}
      </button>
      {isOpen && (
        <div className="p-4 border-4 border-black bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// V8: Numbered Accordion
export function AccordionV8({ title, children, color = "#ccff00" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-4 border-black">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center gap-4 font-bold uppercase bg-white"
      >
        <span className="w-10 h-10 flex items-center justify-center border-3 border-black font-black text-lg"
          style={{ backgroundColor: color }}>
          01
        </span>
        {title}
        <span className="ml-auto text-xl">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t-4 border-black bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// V9: Full-width Header Accordion
export function AccordionV9({ title, children, color = "#00ccff" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-4 border-black shadow-[4px_4px_0px_black]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 font-bold uppercase text-left text-lg"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center justify-between">
          {title}
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold">
            {isOpen ? "−" : "+"}
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="p-6 border-t-4 border-black bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// V10: Gradient Accordion
export function AccordionV10({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-4 border-black shadow-[4px_4px_0px_black]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between font-bold uppercase"
        style={{ background: "linear-gradient(90deg, #ff66cc, #ffdd00)" }}
      >
        {title}
        <span className="w-8 h-8 bg-black text-white flex items-center justify-center">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t-4 border-black bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// CHECKBOX VARIANTS (10 versions)
// ═══════════════════════════════════════════════════════════════════════════════════

interface CheckboxProps {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

// V1: Classic Checkbox
export function CheckboxV1({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-6 h-6 border-3 border-black flex items-center justify-center ${
          isChecked ? "bg-[#ff66cc]" : "bg-white"
        }`}
      >
        {isChecked && <span className="font-bold">✓</span>}
      </div>
      <span className="font-medium">{label}</span>
    </label>
  )
}

// V2: Shadowed Checkbox
export function CheckboxV2({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <div className="absolute inset-0 translate-x-1 translate-y-1 bg-black" />
        <div 
          onClick={toggle}
          className={`relative w-6 h-6 border-3 border-black flex items-center justify-center ${
            isChecked ? "bg-[#ccff00]" : "bg-white"
          }`}
        >
          {isChecked && <span className="font-bold">✓</span>}
        </div>
      </div>
      <span className="font-medium">{label}</span>
    </label>
  )
}

// V3: Circle Checkbox
export function CheckboxV3({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-6 h-6 border-3 border-black rounded-full flex items-center justify-center ${
          isChecked ? "bg-[#00ccff]" : "bg-white"
        }`}
      >
        {isChecked && <div className="w-3 h-3 bg-black rounded-full" />}
      </div>
      <span className="font-medium">{label}</span>
    </label>
  )
}

// V4: Cross Checkbox
export function CheckboxV4({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-6 h-6 border-3 border-black flex items-center justify-center ${
          isChecked ? "bg-[#ffdd00]" : "bg-white"
        }`}
      >
        {isChecked && <span className="font-bold text-lg leading-none">×</span>}
      </div>
      <span className="font-medium">{label}</span>
    </label>
  )
}

// V5: Fill Checkbox
export function CheckboxV5({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className="w-6 h-6 border-3 border-black bg-white p-0.5"
      >
        {isChecked && <div className="w-full h-full bg-[#ff66cc]" />}
      </div>
      <span className="font-medium">{label}</span>
    </label>
  )
}

// V6: Toggle Checkbox
export function CheckboxV6({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-12 h-6 border-3 border-black relative ${
          isChecked ? "bg-[#ccff00]" : "bg-white"
        }`}
      >
        <div 
          className={`absolute top-0 w-5 h-full bg-black transition-all ${
            isChecked ? "left-[calc(100%-20px)]" : "left-0"
          }`}
        />
      </div>
      <span className="font-medium">{label}</span>
    </label>
  )
}

// V7: Star Checkbox
export function CheckboxV7({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className="w-6 h-6 flex items-center justify-center"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path 
            d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" 
            fill={isChecked ? "#ffdd00" : "white"}
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      </div>
      <span className="font-medium">{label}</span>
    </label>
  )
}

// V8: Line Through Checkbox
export function CheckboxV8({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={toggle}>
      <div 
        className={`w-5 h-5 border-3 border-black ${
          isChecked ? "bg-[#ff66cc]" : "bg-white"
        }`}
      />
      <span className={`font-medium ${isChecked ? "line-through opacity-60" : ""}`}>
        {label}
      </span>
    </label>
  )
}

// V9: Large Checkbox
export function CheckboxV9({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-4 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-10 h-10 border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_black] ${
          isChecked ? "bg-[#00ccff]" : "bg-white"
        }`}
      >
        {isChecked && <span className="font-black text-2xl">✓</span>}
      </div>
      <span className="font-bold text-lg">{label}</span>
    </label>
  )
}

// V10: Inverted Checkbox
export function CheckboxV10({ label, checked = false, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  const toggle = () => {
    setIsChecked(!isChecked)
    onChange?.(!isChecked)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-6 h-6 border-3 flex items-center justify-center ${
          isChecked ? "bg-black border-black" : "bg-white border-black"
        }`}
      >
        {isChecked && <span className="font-bold text-white">✓</span>}
      </div>
      <span className="font-medium">{label}</span>
    </label>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR VARIANTS (10 versions)
// ═══════════════════════════════════════════════════════════════════════════════════

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
}

// V1: Classic Progress
export function ProgressBarV1({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-6 border-4 border-black bg-white">
        <div 
          className="h-full bg-[#ff66cc] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// V2: Chunky Progress
export function ProgressBarV2({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-8 border-4 border-black bg-white shadow-[4px_4px_0px_black]">
        <div 
          className="h-full bg-[#ccff00] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// V3: Segmented Progress
export function ProgressBarV3({ value, max = 100, label }: ProgressBarProps) {
  const segments = 10
  const filled = Math.round((value / max) * segments)
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round((value / max) * 100)}%</span>
      </div>}
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div 
            key={i}
            className={`flex-1 h-6 border-3 border-black ${
              i < filled ? "bg-[#00ccff]" : "bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// V4: Gradient Progress
export function ProgressBarV4({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-6 border-4 border-black bg-white">
        <div 
          className="h-full transition-all"
          style={{ 
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #ff66cc, #ffdd00)"
          }}
        />
      </div>
    </div>
  )
}

// V5: Striped Progress
export function ProgressBarV5({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-6 border-4 border-black bg-white overflow-hidden">
        <div 
          className="h-full transition-all"
          style={{ 
            width: `${percentage}%`,
            backgroundImage: "repeating-linear-gradient(45deg, #ffdd00, #ffdd00 10px, #ffb158 10px, #ffb158 20px)"
          }}
        />
      </div>
    </div>
  )
}

// V6: Labeled Progress
export function ProgressBarV6({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <span className="font-bold uppercase text-sm block mb-2">{label}</span>}
      <div className="h-8 border-4 border-black bg-white relative">
        <div 
          className="h-full bg-[#ff66cc] transition-all"
          style={{ width: `${percentage}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center font-black">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

// V7: Thin Progress
export function ProgressBarV7({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-3 border-3 border-black bg-white">
        <div 
          className="h-full bg-[#ccff00] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// V8: Bullet Progress
export function ProgressBarV8({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-6 border-4 border-black bg-white relative">
        <div 
          className="h-full bg-[#00ccff] transition-all"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-black"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  )
}

// V9: Stacked Progress
export function ProgressBarV9({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round(percentage)}%</span>
      </div>}
      <div className="relative">
        <div className="absolute inset-0 translate-x-1 translate-y-1 bg-black h-6" />
        <div className="relative h-6 border-4 border-black bg-white">
          <div 
            className="h-full bg-[#ffb158] transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// V10: Inverted Progress
export function ProgressBarV10({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2 text-white">
        <span className="font-bold uppercase text-sm">{label}</span>
        <span className="font-black">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-6 border-4 border-white bg-black">
        <div 
          className="h-full bg-[#ff66cc] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SWITCH VARIANTS (10 versions)
// ═══════════════════════════════════════════════════════════════════════════════════

interface SwitchProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

// V1: Classic Switch
export function SwitchV1({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-4 border-black relative transition-colors ${
          isOn ? "bg-[#ff66cc]" : "bg-white"
        }`}
      >
        <div 
          className={`absolute top-0 w-6 h-full bg-black transition-all ${
            isOn ? "left-[calc(100%-24px)]" : "left-0"
          }`}
        />
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// V2: Pill Switch
export function SwitchV2({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-4 border-black rounded-full relative transition-colors ${
          isOn ? "bg-[#ccff00]" : "bg-white"
        }`}
      >
        <div 
          className={`absolute top-0 w-6 h-full bg-black rounded-full transition-all ${
            isOn ? "left-[calc(100%-24px)]" : "left-0"
          }`}
        />
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// V3: Labeled Switch
export function SwitchV3({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-20 h-8 border-4 border-black relative transition-colors flex items-center ${
          isOn ? "bg-[#00ccff] justify-end" : "bg-white justify-start"
        }`}
      >
        <span className={`px-2 text-xs font-bold ${isOn ? "text-black" : "text-black"}`}>
          {isOn ? "ON" : "OFF"}
        </span>
        <div 
          className={`absolute top-0 w-8 h-full bg-black transition-all ${
            isOn ? "left-[calc(100%-32px)]" : "left-0"
          }`}
        />
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// V4: Icon Switch
export function SwitchV4({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-4 border-black relative transition-colors ${
          isOn ? "bg-[#ffdd00]" : "bg-white"
        }`}
      >
        <div 
          className={`absolute top-0 w-6 h-full bg-black flex items-center justify-center text-white transition-all ${
            isOn ? "left-[calc(100%-24px)]" : "left-0"
          }`}
        >
          {isOn ? "✓" : "×"}
        </div>
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// V5: Chunky Switch
export function SwitchV5({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-16 h-10 border-[5px] border-black shadow-[3px_3px_0px_black] relative transition-colors ${
          isOn ? "bg-[#ff66cc]" : "bg-white"
        }`}
      >
        <div 
          className={`absolute top-0 w-7 h-full bg-black transition-all ${
            isOn ? "left-[calc(100%-28px)]" : "left-0"
          }`}
        />
      </div>
      {label && <span className="font-bold">{label}</span>}
    </label>
  )
}

// V6: Thin Switch
export function SwitchV6({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-12 h-4 border-3 border-black relative transition-colors ${
          isOn ? "bg-[#ccff00]" : "bg-white"
        }`}
      >
        <div 
          className={`absolute -top-1 w-6 h-6 bg-black border-3 border-black transition-all ${
            isOn ? "left-[calc(100%-20px)]" : "-left-1"
          }`}
        />
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// V7: Square Knob Switch
export function SwitchV7({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-4 border-black relative transition-colors ${
          isOn ? "bg-[#00ccff]" : "bg-white"
        }`}
      >
        <div 
          className={`absolute top-1 w-4 h-4 bg-black transition-all ${
            isOn ? "left-[calc(100%-20px)]" : "left-1"
          }`}
        />
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// V8: Dotted Switch
export function SwitchV8({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-4 border-black relative transition-colors ${
          isOn ? "bg-[#ffb158]" : "bg-white"
        }`}
      >
        <div 
          className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${
            isOn ? "left-[calc(100%-20px)]" : "left-1"
          }`}
        />
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// V9: Split Color Switch
export function SwitchV9({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className="w-14 h-8 border-4 border-black relative overflow-hidden"
      >
        <div className="absolute inset-0 flex">
          <div className={`w-1/2 ${isOn ? "bg-[#ff66cc]" : "bg-white"}`} />
          <div className={`w-1/2 ${isOn ? "bg-white" : "bg-[#ccff00]"}`} />
        </div>
        <div 
          className={`absolute top-0 w-6 h-full bg-black transition-all ${
            isOn ? "left-[calc(100%-24px)]" : "left-0"
          }`}
        />
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// V10: Inverted Switch
export function SwitchV10({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-4 relative transition-colors ${
          isOn ? "bg-black border-[#ff66cc]" : "bg-black border-white"
        }`}
      >
        <div 
          className={`absolute top-0 w-6 h-full transition-all ${
            isOn ? "left-[calc(100%-24px)] bg-[#ff66cc]" : "left-0 bg-white"
          }`}
        />
      </div>
      {label && <span className="font-medium">{label}</span>}
    </label>
  )
}

// Export all variants
export const NeoBrutalistVariants = {
  Button: { V1: ButtonV1, V2: ButtonV2, V3: ButtonV3, V4: ButtonV4, V5: ButtonV5, V6: ButtonV6, V7: ButtonV7, V8: ButtonV8, V9: ButtonV9, V10: ButtonV10 },
  Card: { V1: CardV1, V2: CardV2, V3: CardV3, V4: CardV4, V5: CardV5, V6: CardV6, V7: CardV7, V8: CardV8, V9: CardV9, V10: CardV10 },
  Input: { V1: InputV1, V2: InputV2, V3: InputV3, V4: InputV4, V5: InputV5, V6: InputV6, V7: InputV7, V8: InputV8, V9: InputV9, V10: InputV10 },
  Badge: { V1: BadgeV1, V2: BadgeV2, V3: BadgeV3, V4: BadgeV4, V5: BadgeV5, V6: BadgeV6, V7: BadgeV7, V8: BadgeV8, V9: BadgeV9, V10: BadgeV10 },
  Accordion: { V1: AccordionV1, V2: AccordionV2, V3: AccordionV3, V4: AccordionV4, V5: AccordionV5, V6: AccordionV6, V7: AccordionV7, V8: AccordionV8, V9: AccordionV9, V10: AccordionV10 },
  Checkbox: { V1: CheckboxV1, V2: CheckboxV2, V3: CheckboxV3, V4: CheckboxV4, V5: CheckboxV5, V6: CheckboxV6, V7: CheckboxV7, V8: CheckboxV8, V9: CheckboxV9, V10: CheckboxV10 },
  ProgressBar: { V1: ProgressBarV1, V2: ProgressBarV2, V3: ProgressBarV3, V4: ProgressBarV4, V5: ProgressBarV5, V6: ProgressBarV6, V7: ProgressBarV7, V8: ProgressBarV8, V9: ProgressBarV9, V10: ProgressBarV10 },
  Switch: { V1: SwitchV1, V2: SwitchV2, V3: SwitchV3, V4: SwitchV4, V5: SwitchV5, V6: SwitchV6, V7: SwitchV7, V8: SwitchV8, V9: SwitchV9, V10: SwitchV10 },
}
