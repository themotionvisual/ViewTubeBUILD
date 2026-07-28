import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

export type Tone = "pink" | "cyan" | "lime" | "yellow" | "purple" | "orange" | "white" | "black"

export type ControllerRowType = "number" | "text" | "label" | "dropdown" | "split" | "rankedBy" | "custom"

export interface ControllerRowBase {
  type: ControllerRowType
  bgTone?: string // Hex color
  fgTone?: string // Hex color
}

export interface ControllerNumberRow extends ControllerRowBase {
  type: "number"
  value: number | string
  onPrev?: () => void
  onNext?: () => void
  isBig?: boolean
}

export interface ControllerTextRow extends ControllerRowBase {
  type: "text"
  value: string
  onPrev?: () => void
  onNext?: () => void
}

export interface ControllerLabelRow extends ControllerRowBase {
  type: "label"
  value: string
}

export interface ControllerDropdownRow extends ControllerRowBase {
  type: "dropdown"
  value: string
  options: { label: string; value: string }[]
  onSelect: (value: string) => void
  labelPrefix?: string // e.g. "RANKED BY"
}

export interface ControllerSplitRow extends ControllerRowBase {
  type: "split"
  leftValue: string
  rightValue: string
  leftBgTone?: string
  leftFgTone?: string
  rightBgTone?: string
  rightFgTone?: string
  onPrev?: () => void
  onNext?: () => void
}

export interface ControllerRankedByRow extends ControllerRowBase {
  type: "rankedBy"
  label: string
  value: string
  open: boolean
  options: { key: string; label: string; active: boolean; onSelect: () => void }[]
  onToggle: () => void
}

export interface ControllerCustomRow extends ControllerRowBase {
  type: "custom"
  render: () => React.ReactNode
}

export type ControllerRow = ControllerNumberRow | ControllerTextRow | ControllerLabelRow | ControllerDropdownRow | ControllerSplitRow | ControllerRankedByRow | ControllerCustomRow

export interface VisualModuleControllerProps {
  rows: ControllerRow[]
  width?: number
  density?: "normal" | "compact"
}

const controllerTextSizeClass = "text-[13px]"
const controllerArrowSizeClass = "text-[22px]"
const controllerRowHeightClass = "h-[26px] min-h-[26px]"
const controllerBaseWidth = 195
const controllerMinWidth = 195
const controllerDropdownMenuMaxHeight = 240
const controllerDropdownMenuItemHeight = 28

const measureTextWidth = (value: string, fontSize = 13): number => {
  const length = Math.max(0, value.trim().length)
  return Math.ceil(length * fontSize * 0.72)
}

const estimateRowMinWidth = (row: ControllerRow): number => {
  if (row.type === "number") {
    const valueWidth = measureTextWidth(String(row.value), row.isBig === false ? 18 : 38)
    return Math.max(controllerMinWidth, valueWidth + 64)
  }

  if (row.type === "text") {
    return Math.max(controllerMinWidth, measureTextWidth(row.value) + 56)
  }

  if (row.type === "label") {
    return Math.max(controllerMinWidth, measureTextWidth(row.value) + 28)
  }

  if (row.type === "dropdown") {
    const labelPrefixWidth = row.labelPrefix ? measureTextWidth(row.labelPrefix, 13) + 10 : 0
    const valueWidth = measureTextWidth(row.options.find((opt) => opt.value === row.value)?.label || row.value)
    const widestOptionWidth = Math.max(valueWidth, ...row.options.map((opt) => measureTextWidth(opt.label)))
    return Math.max(controllerMinWidth, labelPrefixWidth + widestOptionWidth + 40)
  }

  if (row.type === "split") {
    const leftWidth = measureTextWidth(row.leftValue) + 32
    const rightWidth = measureTextWidth(row.rightValue) + 32
    return Math.max(controllerMinWidth, leftWidth + rightWidth + 32)
  }

  if (row.type === "rankedBy") {
    const labelWidth = measureTextWidth(row.label, 15) + 28
    const currentWidth = measureTextWidth(row.options.find((o) => o.active)?.label || row.value) + 36
    const widestOptionWidth = Math.max(currentWidth, ...row.options.map((option) => measureTextWidth(option.label) + 24))
    return Math.max(controllerMinWidth, labelWidth + widestOptionWidth)
  }

  return controllerMinWidth
}

const getDropdownPortalStyle = (
  anchor: HTMLElement | null,
  itemCount: number,
): React.CSSProperties | null => {
  if (!anchor || typeof window === "undefined") return null
  const rect = anchor.getBoundingClientRect()
  const estimatedHeight = Math.min(itemCount * controllerDropdownMenuItemHeight + 8, controllerDropdownMenuMaxHeight)
  const roomBelow = window.innerHeight - rect.bottom
  const roomAbove = rect.top
  const openUpward = roomBelow < estimatedHeight && roomAbove > estimatedHeight
  const top = openUpward ? Math.max(4, rect.top - estimatedHeight) : rect.bottom
  const left = Math.max(4, Math.min(rect.left, window.innerWidth - rect.width - 4))
  return {
    position: "fixed",
    top,
    left,
    width: rect.width,
    boxSizing: "border-box",
    zIndex: 900,
  }
}

const DropdownRow: React.FC<{ row: ControllerDropdownRow; isLast?: boolean; compact?: boolean }> = ({ row, isLast, compact }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const bg = row.bgTone || "#FFFFFF"
  const hoverBg = bg.toUpperCase() !== "#FFFFFF" ? bg : "#B14AED"
  const fg = row.fgTone || "#000000"

  const displayLabel = row.options.find(o => o.value === row.value)?.label || row.value
  const rowPadClass = `${controllerRowHeightClass} px-2 py-0`
  const labelSizeClass = controllerTextSizeClass
  const caretSizeClass = controllerTextSizeClass

  return (
    <div
      className={`relative flex items-stretch justify-center ${rowPadClass} whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`}
      style={{ background: bg }}
      ref={menuRef}
    >
      <button
        type="button"
        className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-[3px] border-0 bg-transparent px-2 py-0"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Choose ${row.labelPrefix ? row.labelPrefix.toLowerCase() : "module option"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {row.labelPrefix && (
          <span style={{ color: fg }} className={`font-[900] uppercase tracking-[0.05em] mr-1 ${controllerTextSizeClass}`}>
            {row.labelPrefix}
          </span>
        )}
        <span style={{ color: fg }} className={`font-[900] uppercase tracking-[0.05em] pointer-events-none leading-none overflow-hidden text-clip whitespace-nowrap ${labelSizeClass}`}>
          {displayLabel}
        </span>
        <span style={{ color: fg }} className={`font-[900] pointer-events-none mt-[1px] shrink-0 ${caretSizeClass}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-[100%] left-[-4px] right-[-4px] bg-white border-x-[4px] border-b-[4px] border-black flex flex-col z-[700] max-h-[240px] overflow-y-auto overflow-x-hidden"
        >
          {row.options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === row.value}
              className={`w-full px-2 py-[3px] font-inherit ${controllerTextSizeClass} font-[900] uppercase border-none bg-white text-black cursor-pointer text-center tracking-[0.04em] transition-colors`}
              style={{ backgroundColor: hoveredIndex === i ? hoverBg : "#ffffff" }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => {
                e.stopPropagation()
                row.onSelect(opt.value)
                setIsOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const RankedByRow: React.FC<{ row: ControllerRankedByRow; isLast?: boolean }> = ({ row, isLast }) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const hoverTone = row.bgTone && row.bgTone.toUpperCase() !== "#FFFFFF" ? row.bgTone : "#B14AED"

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedAnchor = triggerRef.current?.contains(target)
      const clickedMenu = menuRef.current?.contains(target)
      if (row.open && !clickedAnchor && !clickedMenu) {
        row.onToggle()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [row])

  useEffect(() => {
    if (!row.open) {
      setPortalStyle(null)
      return
    }
    const updatePosition = () => setPortalStyle(getDropdownPortalStyle(triggerRef.current, row.options.length))
    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [row.open, row.options.length])

  const current = row.options.find((o) => o.active)?.label || row.value

  return (
    <div
      className={`relative z-[60] flex items-stretch ${controllerRowHeightClass} whitespace-nowrap select-none overflow-visible ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`}
      style={{ background: row.bgTone || "#FFFFFF" }}
    >
      <div className="flex items-center justify-center bg-black px-1 min-w-[34px]">
        <span className="font-black uppercase tracking-[0.11em] text-[#B14AED] leading-none text-[13px]">
          {row.label}
        </span>
      </div>
      <div className="relative flex-1 min-w-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={row.onToggle}
          className={`h-full w-full bg-[#B14AED] border-l-[4px] border-black px-0 inline-flex items-center justify-between gap-0 ${controllerRowHeightClass}`}
        >
          <span className={`flex-1 min-w-0 overflow-visible whitespace-nowrap font-black uppercase tracking-[0.06em] text-black ${controllerTextSizeClass}`}>
            {current}
          </span>
          <span className={`shrink-0 font-black text-black leading-none ${controllerTextSizeClass}`}>▼</span>
        </button>
        {row.open && portalStyle && typeof document !== "undefined" ? createPortal(
          <div
            ref={menuRef}
            className="bg-white border-x-[4px] border-b-[4px] border-black flex flex-col max-h-[240px] overflow-y-auto overflow-x-hidden pointer-events-auto"
            style={portalStyle}
          >
            {row.options.map((option, idx) => (
              <button
                key={option.key}
                type="button"
                onClick={option.onSelect}
                className={`w-full px-2 py-[3px] text-center ${controllerTextSizeClass} font-black uppercase tracking-[0.06em] bg-white text-black border-none transition-colors`}
                style={{ backgroundColor: hoveredIndex === idx ? hoverTone : "#ffffff" }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        ) : null}
      </div>
    </div>
  )
}

export const VisualModuleController: React.FC<VisualModuleControllerProps> = ({ rows, width = controllerBaseWidth, density = "normal" }) => {
  const compact = density === "compact"
  const rowPadClass = compact ? "py-[0px]" : "py-[0px]"
  const textSizeClass = controllerTextSizeClass
  const labelSizeClass = controllerTextSizeClass
  const numberValueFontSize = "38px"
  const computedWidth = Math.max(width, ...rows.map(estimateRowMinWidth))
  return (
    <div 
      className="flex flex-col h-full overflow-visible shrink-0 border-l-[4px] border-l-black relative"
      style={{ width: computedWidth }}
    >
      {rows.map((row, i) => {
        const bg = row.bgTone || "#FFFFFF"
        const fg = row.fgTone || "#000000"
        const isLast = i === rows.length - 1

        if (row.type === "number") {
          const isBig = row.isBig !== false
          return (
            <div key={i} className={`flex items-center justify-center ${rowPadClass} whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`} style={{ background: bg }}>
              <button 
                type="button"
                onClick={row.onPrev}
                disabled={!row.onPrev}
                aria-label="Previous value"
                className={`font-[900] border-none bg-transparent ${row.onPrev ? 'cursor-pointer hover:opacity-70' : 'cursor-default opacity-30'} px-1 leading-none shrink-0 ${controllerArrowSizeClass}`}
                style={{ color: fg }}
              >
                ◀
              </button>
              <span 
                className="font-[900] tracking-[-0.02em] leading-none pointer-events-none flex-1 text-center"
                style={{ color: fg, fontSize: isBig ? numberValueFontSize : (compact ? '16px' : '18px') }}
              >
                {row.value}
              </span>
              <button 
                type="button"
                onClick={row.onNext}
                disabled={!row.onNext}
                aria-label="Next value"
                className={`font-[900] border-none bg-transparent ${row.onNext ? 'cursor-pointer hover:opacity-70' : 'cursor-default opacity-30'} px-1 leading-none shrink-0 ${controllerArrowSizeClass}`}
                style={{ color: fg }}
              >
                ▶
              </button>
            </div>
          )
        }

        if (row.type === "text") {
          return (
            <div key={i} className={`flex items-center justify-center ${rowPadClass} whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`} style={{ background: bg }}>
              <button 
                type="button"
                onClick={row.onPrev}
                disabled={!row.onPrev}
                aria-label="Previous option"
                className={`font-[900] border-none bg-transparent ${row.onPrev ? 'cursor-pointer hover:opacity-70' : 'cursor-default opacity-30'} px-1 leading-none shrink-0 ${textSizeClass}`}
                style={{ color: fg }}
              >
                ◀
              </button>
              <span 
                className={`font-[900] uppercase tracking-[0.05em] flex-1 text-center pointer-events-none overflow-hidden text-clip whitespace-nowrap ${textSizeClass}`}
                style={{ color: fg }}
              >
                {row.value}
              </span>
              <button 
                type="button"
                onClick={row.onNext}
                disabled={!row.onNext}
                aria-label="Next option"
                className={`font-[900] border-none bg-transparent ${row.onNext ? 'cursor-pointer hover:opacity-70' : 'cursor-default opacity-30'} px-1 leading-none shrink-0 ${textSizeClass}`}
                style={{ color: fg }}
              >
                ▶
              </button>
            </div>
          )
        }

        if (row.type === "label") {
          return (
            <div key={i} className={`flex items-center justify-center ${controllerRowHeightClass} px-2 whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`} style={{ background: bg }}>
              <span 
                className={`font-[900] uppercase tracking-[0.06em] text-center w-full pointer-events-none overflow-hidden text-clip whitespace-nowrap ${labelSizeClass}`}
                style={{ color: fg }}
              >
                {row.value}
              </span>
            </div>
          )
        }

        if (row.type === "dropdown") {
          return <DropdownRow key={i} row={row} isLast={isLast} compact={compact} />
        }

        if (row.type === "split") {
          const leftBg = row.leftBgTone || row.bgTone || "#000000"
          const leftFg = row.leftFgTone || row.fgTone || "#CCFF00"
          const rightBg = row.rightBgTone || "#B14AED"
          const rightFg = row.rightFgTone || "#000000"
          return (
            <div key={i} className={`flex items-stretch ${controllerRowHeightClass} whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`} style={{ background: leftBg }}>
              <button
                type="button"
                onClick={row.onPrev}
                disabled={!row.onPrev}
                aria-label="Previous split value"
                className={`w-[16px] shrink-0 border-none flex items-center justify-center leading-none font-black px-0 ${controllerTextSizeClass} ${row.onPrev ? 'cursor-pointer hover:opacity-80' : 'cursor-default opacity-30'}`}
                style={{ background: leftBg, color: leftFg }}
              >
                ◀
              </button>
              <div className="flex flex-1 min-w-0">
                <div className="flex-1 min-w-0 flex items-center justify-center px-0" style={{ background: leftBg, color: leftFg }}>
                  <span className={`overflow-hidden text-clip whitespace-nowrap font-black uppercase tracking-[0.08em] ${controllerTextSizeClass}`} style={{ color: leftFg }}>
                    {row.leftValue}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-center px-0 border-l-[4px] border-black" style={{ background: rightBg, color: rightFg }}>
                  <span className={`overflow-hidden text-clip whitespace-nowrap font-black uppercase tracking-[0.08em] ${controllerTextSizeClass}`} style={{ color: rightFg }}>
                    {row.rightValue}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={row.onNext}
                disabled={!row.onNext}
                aria-label="Next split value"
                className={`w-[16px] shrink-0 border-none flex items-center justify-center leading-none font-black px-0 ${controllerTextSizeClass} ${row.onNext ? 'cursor-pointer hover:opacity-80' : 'cursor-default opacity-30'}`}
                style={{ background: rightBg, color: rightFg }}
              >
                ▶
              </button>
            </div>
          )
        }

        if (row.type === "rankedBy") {
          return <RankedByRow key={i} row={row} isLast={isLast} />
        }

        if (row.type === "custom") {
          return (
            <div
              key={i}
              className={`flex items-stretch select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`}
              style={{ background: row.bgTone || "#FFFFFF", color: row.fgTone || "#000000" }}
            >
              {row.render()}
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
