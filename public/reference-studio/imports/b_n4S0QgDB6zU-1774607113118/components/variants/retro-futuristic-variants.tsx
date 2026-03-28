"use client"

import { useState, useEffect, ReactNode } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════
// SET B: RETRO-FUTURISTIC COMPONENT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════
// Style DNA inspired by Japanese Pop Art / Manga / Retro Sci-Fi:
// - Dark backgrounds with neon accents
// - Electric blue, hot pink, lime green, violet, yellow
// - Checkered patterns, speed lines, starburst effects
// - Thick outlines, comic book style
// - Glowing/neon effects, scan lines
// ═══════════════════════════════════════════════════════════════════════════════════

// COLOR PALETTE - Inspired by the Japanese Pop Art images
const RETRO = {
  electricBlue: "#00d4ff",
  hotPink: "#ff1493",
  neonGreen: "#39ff14",
  violet: "#8b5cf6",
  neonYellow: "#ffff00",
  orange: "#ff6b35",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  darkBg: "#0a0a0f",
  darkCard: "#1a1a2e",
  white: "#ffffff",
}

// ═══════════════════════════════════════════════════════════════════════════════════
// BUTTON VARIANTS (10 versions) - Retro-Futuristic Style
// ═══════════════════════════════════════════════════════════════════════════════════

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
}

// V1: Neon Glow Button
export function RetroButtonV1({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold uppercase tracking-wider text-black bg-[#00d4ff] border-2 border-[#00d4ff]
        shadow-[0_0_10px_#00d4ff,0_0_20px_#00d4ff,0_0_30px_#00d4ff]
        hover:shadow-[0_0_15px_#00d4ff,0_0_30px_#00d4ff,0_0_45px_#00d4ff]
        active:scale-95 transition-all"
    >
      {children}
    </button>
  )
}

// V2: Checkered Pattern Button
export function RetroButtonV2({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold uppercase tracking-wider text-white border-3 border-white relative overflow-hidden
        hover:text-black transition-colors"
      style={{
        backgroundImage: `repeating-conic-gradient(#1a1a2e 0% 25%, transparent 0% 50%)`,
        backgroundSize: "8px 8px"
      }}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-[#ff1493] opacity-0 hover:opacity-100 transition-opacity -z-0" />
    </button>
  )
}

// V3: Speed Lines Button
export function RetroButtonV3({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 font-bold uppercase tracking-wider text-black bg-[#ffff00] border-3 border-black relative
        hover:-translate-x-1 transition-transform"
    >
      {children}
      <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col justify-center gap-1">
        <div className="h-0.5 bg-black w-full" />
        <div className="h-0.5 bg-black w-3/4 ml-auto" />
        <div className="h-0.5 bg-black w-1/2 ml-auto" />
      </div>
    </button>
  )
}

// V4: Starburst Button
export function RetroButtonV4({ children, onClick }: ButtonProps) {
  return (
    <div className="relative inline-block">
      <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]" viewBox="0 0 100 60">
        <polygon 
          points="50,0 55,20 75,10 60,25 80,30 60,35 75,50 55,40 50,60 45,40 25,50 40,35 20,30 40,25 25,10 45,20" 
          fill="#ffff00" 
          stroke="black" 
          strokeWidth="2"
        />
      </svg>
      <button
        onClick={onClick}
        className="relative px-6 py-3 font-black uppercase tracking-wider text-white bg-[#ff1493] border-3 border-black z-10"
      >
        {children}
      </button>
    </div>
  )
}

// V5: Scan Lines Button
export function RetroButtonV5({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold uppercase tracking-wider text-[#00d4ff] bg-[#0a0a0f] border-2 border-[#00d4ff] relative overflow-hidden
        hover:bg-[#00d4ff] hover:text-black transition-colors"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.1) 2px, rgba(0,212,255,0.1) 4px)"
      }}
    >
      {children}
    </button>
  )
}

// V6: Gradient Neon Button
export function RetroButtonV6({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold uppercase tracking-wider text-white border-3 border-white
        hover:scale-105 active:scale-95 transition-transform"
      style={{
        background: "linear-gradient(135deg, #ff1493, #8b5cf6, #00d4ff)"
      }}
    >
      {children}
    </button>
  )
}

// V7: Pixel Corner Button
export function RetroButtonV7({ children, onClick }: ButtonProps) {
  return (
    <div className="relative inline-block">
      <div className="absolute top-0 left-0 w-2 h-2 bg-[#39ff14]" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-[#39ff14]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#39ff14]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#39ff14]" />
      <button
        onClick={onClick}
        className="px-8 py-3 font-bold uppercase tracking-wider text-[#39ff14] bg-[#0a0a0f] border-2 border-[#39ff14]
          hover:bg-[#39ff14] hover:text-black transition-colors"
      >
        {children}
      </button>
    </div>
  )
}

// V8: Comic Action Button
export function RetroButtonV8({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-black uppercase tracking-wider text-black bg-[#ff6b35] border-4 border-black 
        relative -rotate-1 hover:rotate-0 transition-transform"
      style={{
        boxShadow: "4px 4px 0px #ffff00, 8px 8px 0px #ff1493"
      }}
    >
      {children}
    </button>
  )
}

// V9: Holographic Button
export function RetroButtonV9({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold uppercase tracking-wider text-white border-2 border-white/50 backdrop-blur-sm
        hover:border-white transition-colors"
      style={{
        background: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(255,20,147,0.3), rgba(139,92,246,0.3))"
      }}
    >
      {children}
    </button>
  )
}

// V10: Double Outline Button
export function RetroButtonV10({ children, onClick }: ButtonProps) {
  return (
    <div className="relative inline-block p-1">
      <div className="absolute inset-0 border-2 border-[#ff1493]" />
      <button
        onClick={onClick}
        className="relative px-6 py-3 font-bold uppercase tracking-wider text-white bg-transparent border-2 border-[#00d4ff]
          hover:bg-[#00d4ff]/20 transition-colors"
      >
        {children}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// CARD VARIANTS (10 versions) - Retro-Futuristic Style
// ═══════════════════════════════════════════════════════════════════════════════════

interface CardProps {
  title: string
  children: ReactNode
}

// V1: Neon Border Card
export function RetroCardV1({ title, children }: CardProps) {
  return (
    <div className="bg-[#1a1a2e] border-2 border-[#00d4ff] shadow-[0_0_10px_#00d4ff]">
      <div className="px-4 py-3 border-b-2 border-[#00d4ff] bg-[#00d4ff]/10">
        <span className="font-bold uppercase tracking-wider text-[#00d4ff]">{title}</span>
      </div>
      <div className="p-4 text-white">{children}</div>
    </div>
  )
}

// V2: Checkered Header Card
export function RetroCardV2({ title, children }: CardProps) {
  return (
    <div className="bg-[#1a1a2e] border-3 border-white">
      <div 
        className="px-4 py-3 border-b-3 border-white"
        style={{
          backgroundImage: `repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)`,
          backgroundSize: "10px 10px"
        }}
      >
        <span className="font-black uppercase tracking-wider text-[#ff1493] bg-black px-2">{title}</span>
      </div>
      <div className="p-4 text-white">{children}</div>
    </div>
  )
}

// V3: Gradient Border Card
export function RetroCardV3({ title, children }: CardProps) {
  return (
    <div className="p-0.5" style={{ background: "linear-gradient(135deg, #ff1493, #8b5cf6, #00d4ff)" }}>
      <div className="bg-[#0a0a0f]">
        <div className="px-4 py-3 border-b border-white/20">
          <span className="font-bold uppercase tracking-wider text-white">{title}</span>
        </div>
        <div className="p-4 text-white/80">{children}</div>
      </div>
    </div>
  )
}

// V4: Scan Lines Card
export function RetroCardV4({ title, children }: CardProps) {
  return (
    <div 
      className="bg-[#1a1a2e] border-2 border-[#39ff14] relative overflow-hidden"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.05) 2px, rgba(57,255,20,0.05) 4px)"
      }}
    >
      <div className="px-4 py-3 border-b-2 border-[#39ff14]">
        <span className="font-bold uppercase tracking-wider text-[#39ff14]">{title}</span>
      </div>
      <div className="p-4 text-[#39ff14]/80">{children}</div>
    </div>
  )
}

// V5: Corner Accent Card
export function RetroCardV5({ title, children }: CardProps) {
  return (
    <div className="bg-[#1a1a2e] border-2 border-white/30 relative">
      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#ff1493]" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#00d4ff]" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#00d4ff]" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#ff1493]" />
      <div className="px-4 py-3 border-b border-white/30">
        <span className="font-bold uppercase tracking-wider text-white">{title}</span>
      </div>
      <div className="p-4 text-white/80">{children}</div>
    </div>
  )
}

// V6: Glitch Card
export function RetroCardV6({ title, children }: CardProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[#ff1493]/30 translate-x-1 translate-y-1" />
      <div className="absolute inset-0 bg-[#00d4ff]/30 -translate-x-1 -translate-y-1" />
      <div className="relative bg-[#1a1a2e] border-2 border-white">
        <div className="px-4 py-3 border-b-2 border-white bg-black">
          <span className="font-bold uppercase tracking-wider text-white">{title}</span>
        </div>
        <div className="p-4 text-white">{children}</div>
      </div>
    </div>
  )
}

// V7: Diagonal Stripe Card
export function RetroCardV7({ title, children }: CardProps) {
  return (
    <div className="bg-[#1a1a2e] border-3 border-[#ffff00]">
      <div 
        className="px-4 py-3 border-b-3 border-[#ffff00]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #ffff00, #ffff00 10px, #1a1a2e 10px, #1a1a2e 20px)"
        }}
      >
        <span className="font-black uppercase tracking-wider text-black bg-[#ffff00] px-2">{title}</span>
      </div>
      <div className="p-4 text-white">{children}</div>
    </div>
  )
}

// V8: Dotted Border Card
export function RetroCardV8({ title, children }: CardProps) {
  return (
    <div className="bg-[#1a1a2e] border-4 border-dashed border-[#8b5cf6]">
      <div className="px-4 py-3 border-b-4 border-dashed border-[#8b5cf6]">
        <span className="font-bold uppercase tracking-wider text-[#8b5cf6]">{title}</span>
      </div>
      <div className="p-4 text-white/80">{children}</div>
    </div>
  )
}

// V9: Inverted Card
export function RetroCardV9({ title, children }: CardProps) {
  return (
    <div className="bg-white border-3 border-black">
      <div className="px-4 py-3 border-b-3 border-black bg-[#ff1493]">
        <span className="font-black uppercase tracking-wider text-white">{title}</span>
      </div>
      <div className="p-4 text-black">{children}</div>
    </div>
  )
}

// V10: Cyberpunk Card
export function RetroCardV10({ title, children }: CardProps) {
  return (
    <div className="bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#ff1493] opacity-20 blur-xl" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#00d4ff] opacity-20 blur-xl" />
      <div className="relative border border-white/20">
        <div className="px-4 py-3 border-b border-white/20 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff1493]" />
          <div className="w-2 h-2 rounded-full bg-[#ffff00]" />
          <div className="w-2 h-2 rounded-full bg-[#39ff14]" />
          <span className="font-bold uppercase tracking-wider text-white ml-2">{title}</span>
        </div>
        <div className="p-4 text-white/70">{children}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// INPUT VARIANTS (10 versions) - Retro-Futuristic Style
// ═══════════════════════════════════════════════════════════════════════════════════

interface InputProps {
  placeholder?: string
  label?: string
}

// V1: Neon Glow Input
export function RetroInputV1({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-[#00d4ff] text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 bg-[#0a0a0f] border-2 border-[#00d4ff] text-[#00d4ff] font-medium
          focus:outline-none focus:shadow-[0_0_10px_#00d4ff] transition-shadow
          placeholder:text-[#00d4ff]/50"
      />
    </div>
  )
}

// V2: Underline Glow Input
export function RetroInputV2({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-white text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 bg-transparent border-b-2 border-[#ff1493] text-white font-medium
          focus:outline-none focus:border-b-4 focus:shadow-[0_4px_10px_#ff1493] transition-all
          placeholder:text-white/30"
      />
    </div>
  )
}

// V3: Gradient Border Input
export function RetroInputV3({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-white text-sm">{label}</label>}
      <div className="p-0.5" style={{ background: "linear-gradient(90deg, #ff1493, #00d4ff)" }}>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-[#0a0a0f] text-white font-medium
            focus:outline-none placeholder:text-white/30"
        />
      </div>
    </div>
  )
}

// V4: Scan Lines Input
export function RetroInputV4({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-[#39ff14] text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 bg-[#0a0a0f] border-2 border-[#39ff14] text-[#39ff14] font-medium
          focus:outline-none placeholder:text-[#39ff14]/30"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.1) 2px, rgba(57,255,20,0.1) 4px)"
        }}
      />
    </div>
  )
}

// V5: Cyberpunk Input
export function RetroInputV5({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-[#ffff00] text-sm">{label}</label>}
      <div className="flex border-2 border-[#ffff00] bg-[#0a0a0f]">
        <div className="px-3 py-3 bg-[#ffff00] text-black font-bold">{">"}</div>
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-transparent text-[#ffff00] font-medium
            focus:outline-none placeholder:text-[#ffff00]/30"
        />
      </div>
    </div>
  )
}

// V6: Pill Input
export function RetroInputV6({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-white text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-6 py-3 bg-[#1a1a2e] border-2 border-[#8b5cf6] text-white font-medium rounded-full
          focus:outline-none focus:shadow-[0_0_15px_#8b5cf6] transition-shadow
          placeholder:text-white/30"
      />
    </div>
  )
}

// V7: Thick Accent Input
export function RetroInputV7({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-white text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 bg-[#1a1a2e] border-l-4 border-[#ff1493] text-white font-medium
          focus:outline-none focus:bg-[#ff1493]/10 transition-colors
          placeholder:text-white/30"
      />
    </div>
  )
}

// V8: Double Border Input
export function RetroInputV8({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-white text-sm">{label}</label>}
      <div className="relative p-1 border-2 border-[#00d4ff]">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-[#0a0a0f] border-2 border-[#ff1493] text-white font-medium
            focus:outline-none placeholder:text-white/30"
        />
      </div>
    </div>
  )
}

// V9: Glowing Input
export function RetroInputV9({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-bold uppercase tracking-wider text-[#ff1493] text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 bg-black border-2 border-[#ff1493] text-[#ff1493] font-medium
          shadow-[0_0_5px_#ff1493,inset_0_0_5px_rgba(255,20,147,0.2)]
          focus:outline-none focus:shadow-[0_0_15px_#ff1493,inset_0_0_10px_rgba(255,20,147,0.3)] transition-shadow
          placeholder:text-[#ff1493]/30"
      />
    </div>
  )
}

// V10: Matrix Input
export function RetroInputV10({ placeholder, label }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-mono uppercase tracking-wider text-[#39ff14] text-sm">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        className="px-4 py-3 bg-black border border-[#39ff14]/50 text-[#39ff14] font-mono
          focus:outline-none focus:border-[#39ff14] transition-colors
          placeholder:text-[#39ff14]/30"
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// BADGE VARIANTS (10 versions) - Retro-Futuristic Style
// ═══════════════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: ReactNode
}

// V1: Neon Badge
export function RetroBadgeV1({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 bg-[#00d4ff] text-black font-bold text-sm uppercase tracking-wider
      shadow-[0_0_10px_#00d4ff]">
      {children}
    </span>
  )
}

// V2: Outline Glow Badge
export function RetroBadgeV2({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 bg-transparent border-2 border-[#ff1493] text-[#ff1493] font-bold text-sm uppercase tracking-wider
      shadow-[0_0_5px_#ff1493]">
      {children}
    </span>
  )
}

// V3: Gradient Badge
export function RetroBadgeV3({ children }: BadgeProps) {
  return (
    <span 
      className="px-3 py-1 text-white font-bold text-sm uppercase tracking-wider"
      style={{ background: "linear-gradient(90deg, #ff1493, #8b5cf6)" }}
    >
      {children}
    </span>
  )
}

// V4: Pill Neon Badge
export function RetroBadgeV4({ children }: BadgeProps) {
  return (
    <span className="px-4 py-1 bg-[#39ff14] text-black font-bold text-sm uppercase tracking-wider rounded-full
      shadow-[0_0_10px_#39ff14]">
      {children}
    </span>
  )
}

// V5: Bordered Badge
export function RetroBadgeV5({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 bg-[#1a1a2e] border-2 border-white text-white font-bold text-sm uppercase tracking-wider">
      {children}
    </span>
  )
}

// V6: Glitch Badge
export function RetroBadgeV6({ children }: BadgeProps) {
  return (
    <span className="relative px-3 py-1 bg-[#ffff00] text-black font-bold text-sm uppercase tracking-wider">
      <span className="absolute inset-0 bg-[#00d4ff] translate-x-0.5 -translate-y-0.5 opacity-50" />
      <span className="relative">{children}</span>
    </span>
  )
}

// V7: Dot Badge
export function RetroBadgeV7({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 bg-[#1a1a2e] border border-[#8b5cf6] text-[#8b5cf6] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" />
      {children}
    </span>
  )
}

// V8: Angled Badge
export function RetroBadgeV8({ children }: BadgeProps) {
  return (
    <span className="px-4 py-1 bg-[#ff6b35] text-black font-bold text-sm uppercase tracking-wider -skew-x-6 inline-block">
      <span className="skew-x-6 inline-block">{children}</span>
    </span>
  )
}

// V9: Inverted Badge
export function RetroBadgeV9({ children }: BadgeProps) {
  return (
    <span className="px-3 py-1 bg-white text-black font-bold text-sm uppercase tracking-wider border-2 border-black">
      {children}
    </span>
  )
}

// V10: Striped Badge
export function RetroBadgeV10({ children }: BadgeProps) {
  return (
    <span 
      className="px-3 py-1 text-white font-bold text-sm uppercase tracking-wider border-2 border-white"
      style={{
        backgroundImage: "repeating-linear-gradient(45deg, #ff1493, #ff1493 5px, #1a1a2e 5px, #1a1a2e 10px)"
      }}
    >
      {children}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR VARIANTS (10 versions) - Retro-Futuristic Style
// ═══════════════════════════════════════════════════════════════════════════════════

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
}

// V1: Neon Progress
export function RetroProgressV1({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-[#00d4ff] text-sm">{label}</span>
        <span className="font-bold text-[#00d4ff]">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-4 bg-[#0a0a0f] border-2 border-[#00d4ff] shadow-[0_0_5px_#00d4ff]">
        <div 
          className="h-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// V2: Gradient Progress
export function RetroProgressV2({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-white text-sm">{label}</span>
        <span className="font-bold text-white">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-4 bg-[#1a1a2e] border border-white/30">
        <div 
          className="h-full transition-all"
          style={{ 
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #ff1493, #8b5cf6, #00d4ff)"
          }}
        />
      </div>
    </div>
  )
}

// V3: Segmented Progress
export function RetroProgressV3({ value, max = 100, label }: ProgressBarProps) {
  const segments = 10
  const filled = Math.round((value / max) * segments)
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-[#39ff14] text-sm">{label}</span>
        <span className="font-bold text-[#39ff14]">{Math.round((value / max) * 100)}%</span>
      </div>}
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div 
            key={i}
            className={`flex-1 h-4 border border-[#39ff14]/50 ${
              i < filled ? "bg-[#39ff14] shadow-[0_0_5px_#39ff14]" : "bg-[#0a0a0f]"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// V4: Scan Lines Progress
export function RetroProgressV4({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-[#ff1493] text-sm">{label}</span>
        <span className="font-bold text-[#ff1493]">{Math.round(percentage)}%</span>
      </div>}
      <div 
        className="h-6 bg-[#0a0a0f] border-2 border-[#ff1493]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,20,147,0.1) 2px, rgba(255,20,147,0.1) 4px)"
        }}
      >
        <div 
          className="h-full bg-[#ff1493] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// V5: Thick Progress
export function RetroProgressV5({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-[#ffff00] text-sm">{label}</span>
        <span className="font-bold text-[#ffff00]">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-8 bg-[#1a1a2e] border-3 border-[#ffff00]">
        <div 
          className="h-full bg-[#ffff00] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// V6: Striped Progress
export function RetroProgressV6({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-white text-sm">{label}</span>
        <span className="font-bold text-white">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-4 bg-[#0a0a0f] border-2 border-white/50 overflow-hidden">
        <div 
          className="h-full transition-all"
          style={{ 
            width: `${percentage}%`,
            backgroundImage: "repeating-linear-gradient(45deg, #8b5cf6, #8b5cf6 10px, #ff1493 10px, #ff1493 20px)"
          }}
        />
      </div>
    </div>
  )
}

// V7: Minimal Progress
export function RetroProgressV7({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-white/70 text-sm">{label}</span>
        <span className="font-bold text-white/70">{Math.round(percentage)}%</span>
      </div>}
      <div className="h-1 bg-white/20">
        <div 
          className="h-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// V8: Labeled Progress
export function RetroProgressV8({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <span className="font-bold uppercase tracking-wider text-white text-sm block mb-2">{label}</span>}
      <div className="h-8 bg-[#1a1a2e] border-2 border-[#ff1493] relative">
        <div 
          className="h-full bg-[#ff1493]/30 transition-all"
          style={{ width: `${percentage}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center font-bold text-[#ff1493]">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

// V9: Double Progress
export function RetroProgressV9({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-[#8b5cf6] text-sm">{label}</span>
        <span className="font-bold text-[#8b5cf6]">{Math.round(percentage)}%</span>
      </div>}
      <div className="relative">
        <div className="h-4 bg-[#8b5cf6]/20 border border-[#8b5cf6]">
          <div 
            className="h-full bg-[#8b5cf6] transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-6 bg-white border-2 border-[#8b5cf6]"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    </div>
  )
}

// V10: Pixel Progress
export function RetroProgressV10({ value, max = 100, label }: ProgressBarProps) {
  const percentage = (value / max) * 100
  const pixels = 20
  const filled = Math.round((percentage / 100) * pixels)
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2">
        <span className="font-mono uppercase tracking-wider text-[#39ff14] text-sm">{label}</span>
        <span className="font-mono text-[#39ff14]">{Math.round(percentage)}%</span>
      </div>}
      <div className="flex gap-0.5">
        {Array.from({ length: pixels }).map((_, i) => (
          <div 
            key={i}
            className={`flex-1 h-4 ${
              i < filled ? "bg-[#39ff14]" : "bg-[#39ff14]/20"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SWITCH VARIANTS (10 versions) - Retro-Futuristic Style
// ═══════════════════════════════════════════════════════════════════════════════════

interface SwitchProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

// V1: Neon Switch
export function RetroSwitchV1({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-2 relative transition-all ${
          isOn 
            ? "bg-[#00d4ff]/20 border-[#00d4ff] shadow-[0_0_10px_#00d4ff]" 
            : "bg-[#1a1a2e] border-white/30"
        }`}
      >
        <div 
          className={`absolute top-0 w-6 h-full transition-all ${
            isOn 
              ? "left-[calc(100%-24px)] bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" 
              : "left-0 bg-white/50"
          }`}
        />
      </div>
      {label && <span className="font-medium text-white">{label}</span>}
    </label>
  )
}

// V2: Gradient Switch
export function RetroSwitchV2({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-2 border-white relative transition-colors ${
          isOn ? "" : "bg-[#1a1a2e]"
        }`}
        style={isOn ? { background: "linear-gradient(90deg, #ff1493, #8b5cf6)" } : {}}
      >
        <div 
          className={`absolute top-0 w-6 h-full bg-white transition-all ${
            isOn ? "left-[calc(100%-24px)]" : "left-0"
          }`}
        />
      </div>
      {label && <span className="font-medium text-white">{label}</span>}
    </label>
  )
}

// V3: Glowing Switch
export function RetroSwitchV3({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-2 relative transition-all ${
          isOn 
            ? "bg-[#39ff14]/20 border-[#39ff14] shadow-[0_0_15px_#39ff14,inset_0_0_10px_rgba(57,255,20,0.3)]" 
            : "bg-[#0a0a0f] border-[#39ff14]/50"
        }`}
      >
        <div 
          className={`absolute top-0 w-6 h-full transition-all ${
            isOn 
              ? "left-[calc(100%-24px)] bg-[#39ff14]" 
              : "left-0 bg-[#39ff14]/50"
          }`}
        />
      </div>
      {label && <span className="font-medium text-[#39ff14]">{label}</span>}
    </label>
  )
}

// V4: Labeled Switch
export function RetroSwitchV4({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-20 h-8 border-2 relative flex items-center transition-colors ${
          isOn 
            ? "bg-[#ff1493]/20 border-[#ff1493] justify-end" 
            : "bg-[#1a1a2e] border-white/30 justify-start"
        }`}
      >
        <span className={`px-2 text-xs font-bold ${isOn ? "text-[#ff1493]" : "text-white/50"}`}>
          {isOn ? "ON" : "OFF"}
        </span>
        <div 
          className={`absolute top-0 w-8 h-full transition-all ${
            isOn 
              ? "left-[calc(100%-32px)] bg-[#ff1493]" 
              : "left-0 bg-white/30"
          }`}
        />
      </div>
      {label && <span className="font-medium text-white">{label}</span>}
    </label>
  )
}

// V5: Pill Switch
export function RetroSwitchV5({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-2 rounded-full relative transition-all ${
          isOn 
            ? "bg-[#8b5cf6] border-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]" 
            : "bg-[#1a1a2e] border-white/30"
        }`}
      >
        <div 
          className={`absolute top-0 w-6 h-full rounded-full transition-all ${
            isOn ? "left-[calc(100%-24px)] bg-white" : "left-0 bg-white/50"
          }`}
        />
      </div>
      {label && <span className="font-medium text-white">{label}</span>}
    </label>
  )
}

// V6: Icon Switch
export function RetroSwitchV6({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-2 relative transition-all ${
          isOn 
            ? "bg-[#ffff00]/20 border-[#ffff00]" 
            : "bg-[#1a1a2e] border-white/30"
        }`}
      >
        <div 
          className={`absolute top-0 w-6 h-full flex items-center justify-center text-xs font-bold transition-all ${
            isOn 
              ? "left-[calc(100%-24px)] bg-[#ffff00] text-black" 
              : "left-0 bg-white/30 text-white"
          }`}
        >
          {isOn ? "I" : "O"}
        </div>
      </div>
      {label && <span className="font-medium text-white">{label}</span>}
    </label>
  )
}

// V7: Thick Switch
export function RetroSwitchV7({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-16 h-10 border-3 relative transition-colors ${
          isOn ? "bg-[#ff6b35] border-[#ff6b35]" : "bg-[#1a1a2e] border-white"
        }`}
      >
        <div 
          className={`absolute top-0 w-7 h-full border-2 border-black transition-all ${
            isOn ? "left-[calc(100%-28px)] bg-white" : "left-0 bg-white"
          }`}
        />
      </div>
      {label && <span className="font-bold text-white">{label}</span>}
    </label>
  )
}

// V8: Dotted Switch
export function RetroSwitchV8({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border-2 border-dashed relative transition-colors ${
          isOn ? "bg-[#00d4ff]/20 border-[#00d4ff]" : "bg-[#1a1a2e] border-white/30"
        }`}
      >
        <div 
          className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
            isOn ? "left-[calc(100%-20px)] bg-[#00d4ff]" : "left-1 bg-white/50"
          }`}
        />
      </div>
      {label && <span className="font-medium text-white">{label}</span>}
    </label>
  )
}

// V9: Split Switch
export function RetroSwitchV9({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className="w-14 h-8 border-2 border-white relative overflow-hidden"
      >
        <div className="absolute inset-0 flex">
          <div className={`w-1/2 transition-colors ${isOn ? "bg-[#ff1493]" : "bg-[#1a1a2e]"}`} />
          <div className={`w-1/2 transition-colors ${!isOn ? "bg-[#00d4ff]" : "bg-[#1a1a2e]"}`} />
        </div>
        <div 
          className={`absolute top-0 w-6 h-full bg-white transition-all ${
            isOn ? "left-[calc(100%-24px)]" : "left-0"
          }`}
        />
      </div>
      {label && <span className="font-medium text-white">{label}</span>}
    </label>
  )
}

// V10: Matrix Switch
export function RetroSwitchV10({ label, checked = false, onChange }: SwitchProps) {
  const [isOn, setIsOn] = useState(checked)
  
  const toggle = () => {
    setIsOn(!isOn)
    onChange?.(!isOn)
  }
  
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={toggle}
        className={`w-14 h-8 border relative transition-all ${
          isOn 
            ? "bg-black border-[#39ff14] shadow-[0_0_5px_#39ff14]" 
            : "bg-black border-[#39ff14]/30"
        }`}
        style={isOn ? {
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.1) 2px, rgba(57,255,20,0.1) 4px)"
        } : {}}
      >
        <div 
          className={`absolute top-0 w-6 h-full transition-all ${
            isOn ? "left-[calc(100%-24px)] bg-[#39ff14]" : "left-0 bg-[#39ff14]/30"
          }`}
        />
      </div>
      {label && <span className="font-mono text-[#39ff14]">{label}</span>}
    </label>
  )
}

// Export all variants
export const RetroFuturisticVariants = {
  Button: { V1: RetroButtonV1, V2: RetroButtonV2, V3: RetroButtonV3, V4: RetroButtonV4, V5: RetroButtonV5, V6: RetroButtonV6, V7: RetroButtonV7, V8: RetroButtonV8, V9: RetroButtonV9, V10: RetroButtonV10 },
  Card: { V1: RetroCardV1, V2: RetroCardV2, V3: RetroCardV3, V4: RetroCardV4, V5: RetroCardV5, V6: RetroCardV6, V7: RetroCardV7, V8: RetroCardV8, V9: RetroCardV9, V10: RetroCardV10 },
  Input: { V1: RetroInputV1, V2: RetroInputV2, V3: RetroInputV3, V4: RetroInputV4, V5: RetroInputV5, V6: RetroInputV6, V7: RetroInputV7, V8: RetroInputV8, V9: RetroInputV9, V10: RetroInputV10 },
  Badge: { V1: RetroBadgeV1, V2: RetroBadgeV2, V3: RetroBadgeV3, V4: RetroBadgeV4, V5: RetroBadgeV5, V6: RetroBadgeV6, V7: RetroBadgeV7, V8: RetroBadgeV8, V9: RetroBadgeV9, V10: RetroBadgeV10 },
  ProgressBar: { V1: RetroProgressV1, V2: RetroProgressV2, V3: RetroProgressV3, V4: RetroProgressV4, V5: RetroProgressV5, V6: RetroProgressV6, V7: RetroProgressV7, V8: RetroProgressV8, V9: RetroProgressV9, V10: RetroProgressV10 },
  Switch: { V1: RetroSwitchV1, V2: RetroSwitchV2, V3: RetroSwitchV3, V4: RetroSwitchV4, V5: RetroSwitchV5, V6: RetroSwitchV6, V7: RetroSwitchV7, V8: RetroSwitchV8, V9: RetroSwitchV9, V10: RetroSwitchV10 },
}
