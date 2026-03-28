"use client"

import { useState, useEffect } from "react"

// ═══════════════════════════════════════════════════════════════════════════
// NEO-BRUTALIST INTERACTIVE COMPONENTS
// Pure SVG + React + Tailwind — Zero external libraries
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  pink: "oklch(0.65 0.28 350)",
  cyan: "oklch(0.75 0.18 195)",
  yellow: "oklch(0.92 0.19 95)",
  lime: "oklch(0.72 0.21 145)",
  purple: "oklch(0.70 0.20 280)",
  black: "oklch(0.12 0 0)",
  white: "oklch(0.98 0 0)",
  gray: "oklch(0.85 0 0)",
}

// ─────────────────────────────────────────────────────────────────────────────
// #25 LIVE CLOCK
// Real-time analog SVG clock + digital readout with pink second hand
// ─────────────────────────────────────────────────────────────────────────────
export function NeoLiveClock() {
  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const size = 200
  const center = size / 2
  const radius = 80
  
  // Use fixed values for SSR, actual time only after mount
  const hours = mounted && time ? time.getHours() % 12 : 0
  const minutes = mounted && time ? time.getMinutes() : 0
  const seconds = mounted && time ? time.getSeconds() : 0
  
  const hourAngle = (hours + minutes / 60) * 30 - 90
  const minuteAngle = (minutes + seconds / 60) * 6 - 90
  const secondAngle = seconds * 6 - 90
  
  const getHandEnd = (angle: number, length: number) => {
    const rad = (angle * Math.PI) / 180
    return {
      x: center + length * Math.cos(rad),
      y: center + length * Math.sin(rad),
    }
  }
  
  const hourHand = getHandEnd(hourAngle, 40)
  const minuteHand = getHandEnd(minuteAngle, 60)
  const secondHand = getHandEnd(secondAngle, 70)
  
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Clock face */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={COLORS.white}
          stroke={COLORS.black}
          strokeWidth={4}
        />
        
        {/* Shadow */}
        <circle
          cx={center + 4}
          cy={center + 4}
          r={radius}
          fill={COLORS.black}
          className="-z-10"
        />
        
        {/* Hour markers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const x1 = center + 65 * Math.cos(angle)
          const y1 = center + 65 * Math.sin(angle)
          const x2 = center + 75 * Math.cos(angle)
          const y2 = center + 75 * Math.sin(angle)
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={COLORS.black}
              strokeWidth={i % 3 === 0 ? 4 : 2}
            />
          )
        })}
        
        {/* Hour hand */}
        <line
          x1={center}
          y1={center}
          x2={hourHand.x}
          y2={hourHand.y}
          stroke={COLORS.black}
          strokeWidth={6}
          strokeLinecap="round"
        />
        
        {/* Minute hand */}
        <line
          x1={center}
          y1={center}
          x2={minuteHand.x}
          y2={minuteHand.y}
          stroke={COLORS.black}
          strokeWidth={4}
          strokeLinecap="round"
        />
        
        {/* Second hand */}
        <line
          x1={center}
          y1={center}
          x2={secondHand.x}
          y2={secondHand.y}
          stroke={COLORS.pink}
          strokeWidth={2}
          strokeLinecap="round"
        />
        
        {/* Center dot */}
        <circle cx={center} cy={center} r={8} fill={COLORS.pink} stroke={COLORS.black} strokeWidth={3} />
      </svg>
      
      {/* Digital readout */}
      <div className="px-4 py-2 border-3 border-black bg-black text-white font-mono text-2xl font-bold">
        {mounted && time ? time.toLocaleTimeString("en-US", { hour12: false }) : "00:00:00"}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #26 GAUGE METERS
// Semi-circle meters (Grommet-inspired)
// ─────────────────────────────────────────────────────────────────────────────
interface GaugeMeterProps {
  value: number
  max?: number
  label: string
  color?: string
}

export function NeoGaugeMeter({ value, max = 100, label, color = COLORS.pink }: GaugeMeterProps) {
  const size = 120
  const center = size / 2
  const radius = 45
  const strokeWidth = 12
  
  const percentage = Math.min(value / max, 1)
  const angle = percentage * 180
  
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = {
      x: center + radius * Math.cos((Math.PI * startAngle) / 180),
      y: center + radius * Math.sin((Math.PI * startAngle) / 180),
    }
    const end = {
      x: center + radius * Math.cos((Math.PI * endAngle) / 180),
      y: center + radius * Math.sin((Math.PI * endAngle) / 180),
    }
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} className="overflow-visible">
        {/* Background arc */}
        <path
          d={describeArc(180, 360)}
          fill="none"
          stroke={COLORS.gray}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <path
          d={describeArc(180, 180 + angle)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Border */}
        <path
          d={describeArc(180, 360)}
          fill="none"
          stroke={COLORS.black}
          strokeWidth={2}
          strokeLinecap="round"
        />
        
        {/* Value text */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          fill={COLORS.black}
          className="text-xl font-black"
        >
          {value}
        </text>
      </svg>
      
      <span className="text-sm font-bold mt-1">{label}</span>
    </div>
  )
}

export function NeoGaugeMeters() {
  return (
    <div className="flex flex-wrap gap-4">
      <NeoGaugeMeter value={75} label="CPU" color={COLORS.pink} />
      <NeoGaugeMeter value={45} label="Memory" color={COLORS.cyan} />
      <NeoGaugeMeter value={90} label="Storage" color={COLORS.yellow} />
      <NeoGaugeMeter value={30} label="Network" color={COLORS.lime} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #27 AVATARS
// Individual + stacked avatar groups with status indicators
// ─────────────────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string
  color?: string
  status?: "online" | "offline" | "away"
  size?: "sm" | "md" | "lg"
}

export function NeoAvatar({ name, color = COLORS.pink, status, size = "md" }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  }
  
  const statusColors = {
    online: COLORS.lime,
    offline: COLORS.gray,
    away: COLORS.yellow,
  }
  
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  
  return (
    <div className="relative inline-block">
      <div
        className={`${sizes[size]} flex items-center justify-center font-black border-3 border-black`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      
      {status && (
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-black"
          style={{ backgroundColor: statusColors[status] }}
        />
      )}
    </div>
  )
}

export function NeoAvatarGroup() {
  const users = [
    { name: "Alice Smith", color: COLORS.pink, status: "online" as const },
    { name: "Bob Jones", color: COLORS.cyan, status: "away" as const },
    { name: "Carol White", color: COLORS.yellow, status: "online" as const },
    { name: "David Brown", color: COLORS.lime, status: "offline" as const },
  ]
  
  return (
    <div className="flex flex-col gap-6">
      {/* Individual avatars */}
      <div className="flex gap-4">
        {users.map((user, i) => (
          <NeoAvatar key={i} {...user} />
        ))}
      </div>
      
      {/* Stacked group */}
      <div className="flex -space-x-3">
        {users.map((user, i) => (
          <div key={i} className="relative" style={{ zIndex: users.length - i }}>
            <NeoAvatar {...user} />
          </div>
        ))}
        <div className="w-12 h-12 flex items-center justify-center font-black border-3 border-black bg-white ml-1">
          +5
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #28 PAGINATION
// Interactive page selector with active state
// ─────────────────────────────────────────────────────────────────────────────
interface PaginationProps {
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function NeoPagination({ currentPage = 1, totalPages = 5, onPageChange }: PaginationProps) {
  const [page, setPage] = useState(currentPage)
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      onPageChange?.(newPage)
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      {/* Previous */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="w-10 h-10 flex items-center justify-center border-3 border-black font-bold bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        &lt;
      </button>
      
      {/* Page numbers */}
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i + 1)}
          className={`w-10 h-10 flex items-center justify-center border-3 border-black font-bold transition-all ${
            page === i + 1
              ? "bg-pink-500 -translate-y-1 shadow-[4px_4px_0px_black]"
              : "bg-white hover:bg-gray-100"
          }`}
          style={{ backgroundColor: page === i + 1 ? COLORS.pink : undefined }}
        >
          {i + 1}
        </button>
      ))}
      
      {/* Next */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className="w-10 h-10 flex items-center justify-center border-3 border-black font-bold bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        &gt;
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #29 NAME-VALUE LIST
// Key-value detail list with hover highlights
// ─────────────────────────────────────────────────────────────────────────────
interface NameValueListProps {
  items?: { name: string; value: string }[]
}

export function NeoNameValueList({ items }: NameValueListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const defaultItems = [
    { name: "Channel Name", value: "Tech Reviews" },
    { name: "Subscribers", value: "1.2M" },
    { name: "Total Views", value: "45.8M" },
    { name: "Videos", value: "342" },
    { name: "Join Date", value: "Jan 2020" },
  ]
  
  const listItems = items || defaultItems
  
  return (
    <div className="border-3 border-black">
      {listItems.map((item, index) => (
        <div
          key={index}
          className={`flex justify-between px-4 py-3 border-b-3 border-black last:border-b-0 transition-colors cursor-pointer ${
            hoveredIndex === index ? "bg-yellow-300" : "bg-white"
          }`}
          style={{ backgroundColor: hoveredIndex === index ? COLORS.yellow : undefined }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <span className="font-bold">{item.name}</span>
          <span className="font-black">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #30 STEP INDICATOR
// 5-step publish wizard with progress
// ─────────────────────────────────────────────────────────────────────────────
interface StepIndicatorProps {
  steps?: string[]
  currentStep?: number
}

export function NeoStepIndicator({ steps, currentStep = 2 }: StepIndicatorProps) {
  const defaultSteps = ["Upload", "Details", "Thumbnail", "Visibility", "Publish"]
  const stepList = steps || defaultSteps
  
  return (
    <div className="flex items-center gap-0">
      {stepList.map((step, index) => {
        const isComplete = index < currentStep
        const isCurrent = index === currentStep
        
        return (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center border-3 border-black font-black transition-all ${
                  isCurrent ? "-translate-y-1 shadow-[4px_4px_0px_black]" : ""
                }`}
                style={{
                  backgroundColor: isComplete ? COLORS.lime : isCurrent ? COLORS.pink : COLORS.white,
                }}
              >
                {isComplete ? "✓" : index + 1}
              </div>
              <span className={`text-xs mt-2 font-bold ${isCurrent ? "text-pink-600" : ""}`}>
                {step}
              </span>
            </div>
            
            {/* Connector line */}
            {index < stepList.length - 1 && (
              <div
                className="w-12 h-1 border-t-3 border-black mx-1"
                style={{
                  borderColor: isComplete ? COLORS.lime : COLORS.black,
                  backgroundColor: isComplete ? COLORS.lime : "transparent",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #31 ADVANCED SLIDERS
// Velocity + Storage with ring gauge sync
// ─────────────────────────────────────────────────────────────────────────────
interface SliderProps {
  value?: number
  label: string
  color?: string
  onChange?: (value: number) => void
}

export function NeoSlider({ value = 50, label, color = COLORS.pink, onChange }: SliderProps) {
  const [sliderValue, setSliderValue] = useState(value)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    setSliderValue(newValue)
    onChange?.(newValue)
  }
  
  // Ring gauge
  const size = 60
  const center = size / 2
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (sliderValue / 100) * circumference
  
  return (
    <div className="flex items-center gap-4 w-full max-w-xs">
      {/* Ring gauge */}
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={COLORS.gray}
          strokeWidth={6}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Slider */}
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-bold">{label}</span>
          <span className="text-sm font-black">{sliderValue}%</span>
        </div>
        <div className="relative h-4 border-3 border-black bg-white">
          <div
            className="absolute top-0 left-0 h-full"
            style={{ width: `${sliderValue}%`, backgroundColor: color }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}

export function NeoAdvancedSliders() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <NeoSlider label="Velocity" value={65} color={COLORS.pink} />
      <NeoSlider label="Storage" value={45} color={COLORS.cyan} />
      <NeoSlider label="Bandwidth" value={80} color={COLORS.yellow} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #32 DROPDOWN MENU
// Action menu with hover-to-pink transitions
// ─────────────────────────────────────────────────────────────────────────────
interface DropdownMenuProps {
  items?: { label: string; icon?: string }[]
}

export function NeoDropdownMenu({ items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const defaultItems = [
    { label: "Edit", icon: "✏️" },
    { label: "Duplicate", icon: "📋" },
    { label: "Share", icon: "🔗" },
    { label: "Archive", icon: "📦" },
    { label: "Delete", icon: "🗑️" },
  ]
  
  const menuItems = items || defaultItems
  
  return (
    <div className="relative inline-block">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 border-3 border-black font-bold transition-all ${
          isOpen
            ? "-translate-y-1 shadow-[4px_4px_0px_black]"
            : "hover:-translate-y-1 hover:shadow-[4px_4px_0px_black]"
        }`}
        style={{ backgroundColor: isOpen ? COLORS.pink : COLORS.white }}
      >
        Actions ▼
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 border-3 border-black bg-white shadow-[4px_4px_0px_black] z-50">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full px-4 py-3 text-left font-bold border-b-3 border-black last:border-b-0 transition-colors flex items-center gap-2"
              style={{
                backgroundColor: hoveredIndex === index ? COLORS.pink : COLORS.white,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setIsOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BONUS: NEO-BRUTALIST BUTTON
// ─────────────────────────────────────────────────────────────────────────────
interface NeoButtonProps {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "accent"
  onClick?: () => void
}

export function NeoButton({ children, variant = "primary", onClick }: NeoButtonProps) {
  const colors = {
    primary: COLORS.pink,
    secondary: COLORS.cyan,
    accent: COLORS.yellow,
  }
  
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 border-3 border-black font-bold transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_black] active:translate-y-0 active:shadow-[2px_2px_0px_black]"
      style={{ backgroundColor: colors[variant] }}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BONUS: NEO-BRUTALIST CARD
// ─────────────────────────────────────────────────────────────────────────────
interface NeoCardProps {
  title: string
  children: React.ReactNode
  color?: string
}

export function NeoCard({ title, children, color = COLORS.white }: NeoCardProps) {
  return (
    <div
      className="border-3 border-black shadow-[4px_4px_0px_black]"
      style={{ backgroundColor: color }}
    >
      <div className="px-4 py-3 border-b-3 border-black bg-black text-white">
        <h3 className="font-black text-lg">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BONUS: NEO-BRUTALIST BADGE
// ─────────────────────────────────────────────────────────────────────────────
interface NeoBadgeProps {
  children: React.ReactNode
  variant?: "pink" | "cyan" | "yellow" | "lime"
}

export function NeoBadge({ children, variant = "pink" }: NeoBadgeProps) {
  const colors = {
    pink: COLORS.pink,
    cyan: COLORS.cyan,
    yellow: COLORS.yellow,
    lime: COLORS.lime,
  }
  
  return (
    <span
      className="inline-flex px-3 py-1 border-3 border-black font-bold text-sm"
      style={{ backgroundColor: colors[variant] }}
    >
      {children}
    </span>
  )
}
