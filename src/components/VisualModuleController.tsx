import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useAnalyticsVisualStyle } from "./AnalyticsVisualStyleContext"

export type Tone = "pink" | "cyan" | "lime" | "yellow" | "purple" | "orange" | "white" | "black"

export type ControllerRowType = "number" | "text" | "label" | "dropdown" | "split" | "rankedBy" | "metricMultiSelect" | "toggle" | "statement" | "custom"

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

export interface ControllerMetricMultiSelectRow extends ControllerRowBase {
  type: "metricMultiSelect"
  options: { label: string; value: string; color: string }[]
  selectedValues: readonly string[]
  onToggleValue: (value: string) => void
  maxLabels?: number
  minimumSelected?: number
  maximumSelected?: number
  /**
   * "timeline" matches the Multi-Metric Timeline controller:
   * selected metrics are full-height colored cells, not little badge pills.
   */
  displayMode?: "badges" | "timeline"
}

export interface ControllerToggleRow extends ControllerRowBase {
  type: "toggle"
  value: string
  options: readonly string[]
  onSelect: (value: string) => void
}

export interface ControllerStatementRow extends ControllerRowBase {
  type: "statement"
  value: string
}

export interface ControllerCustomRow extends ControllerRowBase {
  type: "custom"
  render: () => React.ReactNode
}

export type ControllerRow = ControllerNumberRow | ControllerTextRow | ControllerLabelRow | ControllerDropdownRow | ControllerSplitRow | ControllerRankedByRow | ControllerMetricMultiSelectRow | ControllerToggleRow | ControllerStatementRow | ControllerCustomRow

export interface VisualModuleControllerProps {
  rows: ControllerRow[]
  width?: number
  density?: "normal" | "compact"
}

const controllerTextSizeClass = "text-[15px]"
const controllerArrowSizeClass = "text-[15px]"
const controllerRowHeightClass = "h-[26px] min-h-[26px]"
const controllerArrowButtonClass = "inline-flex h-[20px] w-[24px] shrink-0 items-center justify-center overflow-hidden border-none bg-transparent px-0 leading-none origin-center transform-gpu transition-transform duration-100 will-change-transform"
const controllerBaseWidth = 195
const controllerMinWidth = 195
const controllerDropdownMenuMaxHeight = 240
const controllerDropdownMenuItemHeight = 28

const getComplementaryHex = (hex: string): string => {
  if (!hex || hex.length < 7) return "#B14AED"
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2
  let h = 0, s = 0
  if (mx !== mn) {
    const d = mx - mn
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
    h = r === mx ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : g === mx ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6
  }
  h = (h + 0.5) % 1
  if (s === 0) return "#B14AED"
  const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s, p2 = 2 * l - q2
  const f = (t: number) => { t = ((t % 1) + 1) % 1; return t < 1 / 6 ? p2 + (q2 - p2) * 6 * t : t < 0.5 ? q2 : t < 2 / 3 ? p2 + (q2 - p2) * (2 / 3 - t) * 6 : p2 }
  return "#" + [h + 1 / 3, h, h - 1 / 3].map(t => Math.round(f(t) * 255).toString(16).padStart(2, "0")).join("")
}

const measureTextWidth = (value: string, fontSize = 16): number => {
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

  if (row.type === "metricMultiSelect") {
    const selected = row.options.filter((option) => row.selectedValues.includes(option.value))
    const labelWidth = selected.length <= (row.maxLabels ?? 3)
      ? selected.reduce((sum, option) => sum + measureTextWidth(option.label, 10) + 16, 26)
      : selected.length * 17 + 34
    return Math.max(controllerMinWidth, labelWidth)
  }

  if (row.type === "toggle") {
    const widest = Math.max(measureTextWidth(row.value), ...row.options.map((option) => measureTextWidth(option)))
    return Math.max(controllerMinWidth, widest + 56)
  }

  if (row.type === "statement") {
    return Math.max(controllerMinWidth, Math.min(260, measureTextWidth(row.value, 11) + 24))
  }

  return controllerMinWidth
}

const applyControllerPalette = (
  row: ControllerRow,
  index: number,
  rows: ControllerRow[],
  colors: ReturnType<typeof useAnalyticsVisualStyle>["controllerColors"],
): ControllerRow => {
  if (!colors || row.type === "custom") return row
  if (row.type === "statement") {
    return {
      ...row,
      bgTone: "#ffffff",
      fgTone: row.fgTone ?? colors.middle,
    }
  }

  const middleIndex = rows.length >= 3 ? 1 : 0
  const bgTone = index < middleIndex
    ? colors.previous
    : index === middleIndex
      ? colors.middle
      : colors.next

  if (row.type === "split") {
    return {
      ...row,
      bgTone,
      fgTone: "#000000",
      leftBgTone: bgTone,
      leftFgTone: "#000000",
      rightBgTone: bgTone,
      rightFgTone: "#000000",
    }
  }

  return {
    ...row,
    bgTone,
    fgTone: "#000000",
  } as ControllerRow
}

const getDropdownPortalStyle = (
  anchor: HTMLElement | null,
  _itemCount: number,
): React.CSSProperties | null => {
  if (!anchor || typeof window === "undefined") return null
  const rect = anchor.getBoundingClientRect()
  const root = anchor.closest("[data-controller-root]") as HTMLElement | null
  const wRect = root?.getBoundingClientRect() ?? rect
  return {
    position: "fixed",
    top: rect.bottom,
    left: Math.max(4, Math.min(wRect.left, window.innerWidth - wRect.width - 4)),
    width: wRect.width,
    boxSizing: "border-box",
    zIndex: 900,
  }
}

const DropdownRow: React.FC<{ row: ControllerDropdownRow; isLast?: boolean; compact?: boolean }> = ({ row, isLast, compact }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen, row.options.length])

  const bg = row.bgTone || "#FFFFFF"
  const hoverBg = getComplementaryHex(bg)
  const fg = row.fgTone || "#000000"

  const displayLabel = row.options.find(o => o.value === row.value)?.label || row.value
  const rowPadClass = `${controllerRowHeightClass} px-2 py-0`
  const labelSizeClass = controllerTextSizeClass
  const caretSizeClass = controllerTextSizeClass

  return (
    <div
      className={`relative flex items-stretch justify-center ${rowPadClass} whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`}
      style={{ background: bg }}
    >
      <button
        type="button"
        ref={triggerRef}
        className="group inline-flex h-full w-full cursor-pointer items-center gap-[3px] border-0 bg-transparent px-2 py-0"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Choose ${row.labelPrefix ? row.labelPrefix.toLowerCase() : "module option"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {row.labelPrefix && (
          <span style={{ color: fg }} className={`font-[999] uppercase tracking-[-0.05em] mr-1 ${controllerTextSizeClass}`}>
            {row.labelPrefix}
          </span>
        )}
        <span style={{ color: fg }} className={`font-[999] uppercase tracking-[-0.05em] pointer-events-none leading-none overflow-hidden text-clip whitespace-nowrap ${labelSizeClass}`}>
          {displayLabel}
        </span>
        <span style={{ color: fg }} className={`ml-auto w-[24px] shrink-0 inline-flex items-center justify-center font-[999] pointer-events-none leading-none rotate-90 transition-transform duration-100 group-hover:scale-125 ${caretSizeClass}`}>
          ►
        </span>
      </button>
      
      {isOpen && portalStyle && typeof document !== "undefined" ? createPortal(
        <div
          role="listbox"
          ref={menuRef}
          className="bg-white border-x-[4px] border-b-[4px] border-black flex flex-col overflow-hidden pointer-events-auto"
          style={portalStyle}
        >
          {row.options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === row.value}
              className={`w-full px-2 py-[3px] font-inherit ${controllerTextSizeClass} font-[999] uppercase border-none bg-white text-black cursor-pointer text-center tracking-[-0.05em] transition-colors`}
              style={{ backgroundColor: opt.value === row.value ? bg : hoveredIndex === i ? hoverBg : "#ffffff" }}
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
        </div>,
        document.body,
      ) : null}
    </div>
  )
}

export const RankedByRow: React.FC<{ row: ControllerRankedByRow; isLast?: boolean }> = ({ row, isLast }) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const activeTone = row.bgTone && row.bgTone.toUpperCase() !== "#FFFFFF" ? row.bgTone : "#B14AED"
  const hoverTone = getComplementaryHex(activeTone)

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
        <span className="font-[999] uppercase tracking-[-0.05em] text-[#B14AED] leading-none text-[15px]">
          {row.label}
        </span>
      </div>
      <div className="relative flex-1 min-w-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={row.onToggle}
          className={`group h-full w-full bg-[#B14AED] border-l-[4px] border-black px-0 inline-flex items-center justify-between gap-0 ${controllerRowHeightClass}`}
        >
          <span className={`flex-1 min-w-0 overflow-visible whitespace-nowrap font-[999] uppercase tracking-[-0.05em] text-black ${controllerTextSizeClass}`}>
            {current}
          </span>
          <span className={`ml-auto w-[24px] shrink-0 inline-flex items-center justify-center font-[999] text-black leading-none rotate-90 transition-transform duration-100 group-hover:scale-125 ${controllerTextSizeClass}`}>►</span>
        </button>
        {row.open && portalStyle && typeof document !== "undefined" ? createPortal(
          <div
            ref={menuRef}
            className="bg-white border-x-[4px] border-b-[4px] border-black flex flex-col overflow-hidden pointer-events-auto"
            style={portalStyle}
          >
            {row.options.map((option, idx) => (
              <button
                key={option.key}
                type="button"
                onClick={option.onSelect}
                className={`w-full px-2 py-[3px] text-center ${controllerTextSizeClass} font-[999] uppercase tracking-[-0.05em] bg-white text-black border-none transition-colors`}
                style={{ backgroundColor: option.active ? activeTone : hoveredIndex === idx ? hoverTone : "#ffffff" }}
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

const MetricMultiSelectRow: React.FC<{ row: ControllerMetricMultiSelectRow; isLast?: boolean }> = ({ row, isLast }) => {
  const triggerId = React.useId()
  const menuId = `${triggerId}-metrics-menu`
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen, row.options.length])

  const selectedOptions = row.options.filter((option) => row.selectedValues.includes(option.value))
  const maxLabels = row.maxLabels ?? 3
  const showLabels = selectedOptions.length > 0 && selectedOptions.length <= maxLabels
  const bg = row.bgTone || "#FFFFFF"
  const hoverBg = getComplementaryHex(bg)
  const fg = row.fgTone || "#000000"

  return (
    <div
      className={`relative flex items-stretch ${controllerRowHeightClass} whitespace-nowrap select-none ${isLast ? "flex-1" : "border-b-[4px] border-black"}`}
      style={{ background: bg, color: fg }}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={`group flex h-full w-full cursor-pointer items-stretch border-0 bg-transparent py-0 ${row.displayMode === "timeline" ? "gap-0 px-0" : "gap-1 px-2"}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label="Choose metrics"
        onClick={() => setIsOpen((open) => !open)}
      >
        {row.displayMode === "timeline" ? (
          <>
            <span className="grid min-w-0 flex-1 grid-flow-col auto-cols-fr overflow-hidden">
              {selectedOptions.length === 0 ? (
                <span className={`grid place-items-center bg-white font-[999] uppercase tracking-[-0.05em] ${controllerTextSizeClass}`}>
                  SELECT
                </span>
              ) : (
                selectedOptions.map((option, index) => (
                  <span
                    key={option.value}
                    className={`grid min-w-0 place-items-center overflow-hidden px-1 text-[10px] font-[999] uppercase leading-none tracking-[0.02em] text-black ${index > 0 ? "border-l-[4px] border-black" : ""}`}
                    style={{ background: option.color }}
                    title={option.label}
                  >
                    <span className="max-w-full truncate">{option.label}</span>
                  </span>
                ))
              )}
            </span>
            <span className={`inline-flex w-[28px] shrink-0 items-center justify-center border-l-[4px] border-black bg-white font-[999] leading-none rotate-90 transition-transform duration-100 group-hover:scale-125 ${controllerTextSizeClass}`}>
              ►
            </span>
          </>
        ) : selectedOptions.length === 0 ? (
          <span className={`font-[999] uppercase tracking-[-0.05em] ${controllerTextSizeClass}`}>SELECT</span>
        ) : showLabels ? (
          selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex h-[18px] min-w-0 items-center justify-center border-[2px] border-black px-1 text-[9px] font-[999] uppercase leading-none tracking-[0.04em] text-black"
              style={{ background: option.color }}
            >
              {option.label}
            </span>
          ))
        ) : (
          <span className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden px-1">
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="h-[11px] w-[11px] shrink-0 rounded-full border-[2px] border-black"
                style={{ background: option.color }}
                title={option.label}
              />
            ))}
          </span>
        )}
        {row.displayMode !== "timeline" ? (
          <span className={`ml-auto w-[24px] shrink-0 inline-flex items-center justify-center font-[999] leading-none rotate-90 transition-transform duration-100 group-hover:scale-125 ${controllerTextSizeClass}`}>►</span>
        ) : null}
      </button>
      {isOpen && portalStyle && typeof document !== "undefined" ? createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-labelledby={triggerId}
          aria-multiselectable="true"
          className="bg-white border-x-[4px] border-b-[4px] border-black flex flex-col overflow-hidden pointer-events-auto"
          style={portalStyle}
        >
          {row.options.map((option, index) => {
            const isSelected = row.selectedValues.includes(option.value)
            const atMinimum = isSelected && row.selectedValues.length <= (row.minimumSelected ?? 0)
            const atMaximum = !isSelected && row.selectedValues.length >= (row.maximumSelected ?? Number.POSITIVE_INFINITY)
            const isDisabled = atMinimum || atMaximum
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                className={`flex w-full items-center gap-2 border-none px-2 py-[5px] text-left text-[11px] font-[999] uppercase tracking-[-0.05em] text-black transition-colors ${isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
                style={{ backgroundColor: isSelected ? option.color : hoveredIndex === index ? hoverBg : "#ffffff" }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(event) => {
                  event.stopPropagation()
                  if (!isDisabled) row.onToggleValue(option.value)
                }}
              >
                <span className="h-[10px] w-[10px] shrink-0 rounded-full border-[2px] border-black" style={{ background: isSelected ? "#000000" : option.color }} />
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{option.label}</span>
                {isSelected ? <span className="shrink-0 text-[9px]">ON</span> : null}
              </button>
            )
          })}
        </div>,
        document.body,
      ) : null}
    </div>
  )
}

export const VisualModuleController: React.FC<VisualModuleControllerProps> = ({ rows, width = controllerBaseWidth, density = "normal" }) => {
  const visualStyle = useAnalyticsVisualStyle()
  const displayRows = rows.map((row, index) => applyControllerPalette(row, index, rows, visualStyle?.controllerColors))
  const compact = density === "compact"
  const rowPadClass = compact ? "py-[0px]" : "py-[0px]"
  const textSizeClass = controllerTextSizeClass
  const labelSizeClass = controllerTextSizeClass
  const numberValueFontSize = "38px"
  const computedWidth = Math.max(width, ...displayRows.map(estimateRowMinWidth))
  return (
    <div 
      data-controller-root
      className="flex flex-col h-full overflow-hidden shrink-0 border-l-[4px] border-l-black relative"
      style={{ width: computedWidth }}
    >
      {displayRows.map((row, i) => {
        const bg = row.bgTone || "#FFFFFF"
        const fg = row.fgTone || "#000000"
        const isLast = i === rows.length - 1

        if (row.type === "number") {
          const isBig = row.isBig !== false
          return (
            <div key={i} className={`flex h-[42px] min-h-[42px] items-center justify-center overflow-hidden ${rowPadClass} whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`} style={{ background: bg }}>
              <button 
                type="button"
                onClick={row.onPrev}
                disabled={!row.onPrev}
                aria-label="Previous value"
                className={`${controllerArrowButtonClass} font-[999] ${row.onPrev ? 'cursor-pointer hover:scale-125 active:scale-[.85]' : 'cursor-default opacity-30'} ${controllerArrowSizeClass} rotate-180`}
                style={{ color: fg }}
              >
                ►
              </button>
              <span 
                className="font-[999] tracking-[-0.02em] leading-none pointer-events-none flex-1 text-center"
                style={{ color: fg, fontSize: isBig ? numberValueFontSize : (compact ? '16px' : '18px') }}
              >
                {row.value}
              </span>
              <button 
                type="button"
                onClick={row.onNext}
                disabled={!row.onNext}
                aria-label="Next value"
                className={`${controllerArrowButtonClass} font-[999] ${row.onNext ? 'cursor-pointer hover:scale-125 active:scale-[.85]' : 'cursor-default opacity-30'} ${controllerArrowSizeClass}`}
                style={{ color: fg }}
              >
                ►
              </button>
            </div>
          )
        }

        if (row.type === "text") {
          return (
            <div key={i} className={`flex items-center justify-center overflow-hidden ${controllerRowHeightClass} ${rowPadClass} whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`} style={{ background: bg }}>
              <button 
                type="button"
                onClick={row.onPrev}
                disabled={!row.onPrev}
                aria-label="Previous option"
                className={`${controllerArrowButtonClass} font-[999] ${row.onPrev ? 'cursor-pointer hover:scale-125 active:scale-[.85]' : 'cursor-default opacity-30'} ${textSizeClass} rotate-180`}
                style={{ color: fg }}
              >
                ►
              </button>
              <span 
                className={`font-[999] uppercase tracking-[-0.05em] flex-1 text-center pointer-events-none overflow-hidden text-clip whitespace-nowrap ${textSizeClass}`}
                style={{ color: fg }}
              >
                {row.value}
              </span>
              <button 
                type="button"
                onClick={row.onNext}
                disabled={!row.onNext}
                aria-label="Next option"
                className={`${controllerArrowButtonClass} font-[999] ${row.onNext ? 'cursor-pointer hover:scale-125 active:scale-[.85]' : 'cursor-default opacity-30'} ${textSizeClass}`}
                style={{ color: fg }}
              >
                ►
              </button>
            </div>
          )
        }

        if (row.type === "label") {
          return (
            <div key={i} className={`flex items-center justify-center ${controllerRowHeightClass} px-2 whitespace-nowrap select-none ${isLast ? 'flex-1' : 'border-b-[4px] border-black'}`} style={{ background: bg }}>
              <span 
                className={`font-[999] uppercase tracking-[-0.05em] text-center w-full pointer-events-none overflow-hidden text-clip whitespace-nowrap ${labelSizeClass}`}
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
                className={`w-[20px] h-full shrink-0 border-none flex items-center justify-center overflow-hidden leading-none font-[999] px-0 origin-center transform-gpu transition-transform duration-100 will-change-transform ${controllerTextSizeClass} ${row.onPrev ? 'cursor-pointer hover:scale-125 active:scale-[.85]' : 'cursor-default opacity-30'} rotate-180`}
                style={{ background: leftBg, color: leftFg }}
              >
                ►
              </button>
              <div className="flex flex-1 min-w-0">
                <div className="flex-1 min-w-0 flex items-center justify-center px-0" style={{ background: leftBg, color: leftFg }}>
                  <span className={`overflow-hidden text-clip whitespace-nowrap font-[999] uppercase tracking-[-0.05em] ${controllerTextSizeClass}`} style={{ color: leftFg }}>
                    {row.leftValue}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-center px-0 border-l-[4px] border-black" style={{ background: rightBg, color: rightFg }}>
                  <span className={`overflow-hidden text-clip whitespace-nowrap font-[999] uppercase tracking-[-0.05em] ${controllerTextSizeClass}`} style={{ color: rightFg }}>
                    {row.rightValue}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={row.onNext}
                disabled={!row.onNext}
                aria-label="Next split value"
                className={`w-[20px] h-full shrink-0 border-none flex items-center justify-center overflow-hidden leading-none font-[999] px-0 origin-center transform-gpu transition-transform duration-100 will-change-transform ${controllerTextSizeClass} ${row.onNext ? 'cursor-pointer hover:scale-125 active:scale-[.85]' : 'cursor-default opacity-30'}`}
                style={{ background: rightBg, color: rightFg }}
              >
                ►
              </button>
            </div>
          )
        }

        if (row.type === "rankedBy") {
          return <RankedByRow key={i} row={row} isLast={isLast} />
        }

        if (row.type === "metricMultiSelect") {
          return <MetricMultiSelectRow key={i} row={row} isLast={isLast} />
        }

        if (row.type === "toggle") {
          const selectedIndex = Math.max(0, row.options.indexOf(row.value))
          const prevValue = row.options.length > 0 ? row.options[(selectedIndex - 1 + row.options.length) % row.options.length] : row.value
          const nextValue = row.options.length > 0 ? row.options[(selectedIndex + 1) % row.options.length] : row.value
          return (
            <div key={i} className={`flex items-center justify-center overflow-hidden ${controllerRowHeightClass} whitespace-nowrap select-none ${isLast ? "flex-1" : "border-b-[4px] border-black"}`} style={{ background: bg }}>
              <button
                type="button"
                onClick={() => row.onSelect(prevValue)}
                aria-label="Previous toggle option"
                className={`${controllerArrowButtonClass} font-[999] hover:scale-125 active:scale-[.85] ${textSizeClass} rotate-180`}
                style={{ color: fg }}
              >
                ►
              </button>
              <span className={`flex-1 overflow-hidden text-clip whitespace-nowrap text-center font-[999] uppercase tracking-[-0.05em] ${textSizeClass}`} style={{ color: fg }}>
                {row.value}
              </span>
              <button
                type="button"
                onClick={() => row.onSelect(nextValue)}
                aria-label="Next toggle option"
                className={`${controllerArrowButtonClass} font-[999] hover:scale-125 active:scale-[.85] ${textSizeClass}`}
                style={{ color: fg }}
              >
                ►
              </button>
            </div>
          )
        }

        if (row.type === "statement") {
          return (
            <div key={i} className={`flex items-center justify-center overflow-hidden ${controllerRowHeightClass} px-2 whitespace-nowrap select-none ${isLast ? "flex-1" : "border-b-[4px] border-black"}`} style={{ background: row.bgTone ?? "#000000" }}>
              <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[10px] font-[999] uppercase tracking-[-0.05em]" style={{ color: row.fgTone ?? "#CCFF00" }}>
                {row.value}
              </span>
            </div>
          )
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
