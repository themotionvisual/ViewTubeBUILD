import React from "react"
import { ChevronDown } from "lucide-react"

export interface StudioDropdownOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface StudioDropdownProps {
  value?: string
  defaultValue?: string
  options: StudioDropdownOption[]
  onChange?: (value: string) => void
  placeholder?: React.ReactNode
  disabled?: boolean
  connectionMessage?: React.ReactNode
  className?: string
  id?: string
  ariaLabel?: string
}

export const StudioDropdown: React.FC<StudioDropdownProps> = ({
  value,
  defaultValue,
  options,
  onChange,
  placeholder = "Select",
  disabled = false,
  connectionMessage,
  className = "",
  id,
  ariaLabel,
}) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const controlled = value !== undefined
  const currentValue = controlled ? value : internalValue
  const enabledOptions = options.filter((option) => !option.disabled)
  const selected = options.find((option) => option.value === currentValue)

  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const selectValue = (next: string) => {
    if (!controlled) setInternalValue(next)
    onChange?.(next)
    setOpen(false)
  }

  const moveActive = (direction: 1 | -1) => {
    if (!enabledOptions.length) return
    const currentEnabledIndex = enabledOptions.findIndex((option) => option.value === options[activeIndex]?.value)
    const nextEnabledIndex = currentEnabledIndex < 0
      ? direction === 1 ? 0 : enabledOptions.length - 1
      : (currentEnabledIndex + direction + enabledOptions.length) % enabledOptions.length
    const option = enabledOptions[nextEnabledIndex]
    setActiveIndex(options.findIndex((candidate) => candidate.value === option.value))
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (!open) setOpen(true)
      moveActive(event.key === "ArrowDown" ? 1 : -1)
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        const selectedIndex = options.findIndex((option) => option.value === currentValue && !option.disabled)
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : options.findIndex((option) => !option.disabled))
      } else if (activeIndex >= 0 && !options[activeIndex]?.disabled) {
        selectValue(options[activeIndex].value)
      }
    } else if (event.key === "Escape") {
      setOpen(false)
    } else if (event.key === "Home" && open) {
      event.preventDefault()
      setActiveIndex(options.findIndex((option) => !option.disabled))
    } else if (event.key === "End" && open) {
      event.preventDefault()
      const reversed = [...options].reverse().findIndex((option) => !option.disabled)
      if (reversed >= 0) setActiveIndex(options.length - 1 - reversed)
    }
  }

  return (
    <div ref={rootRef} className={`vt-studio-dropdown ${className}`} data-vt-studio-dropdown>
      <button
        id={id}
        type="button"
        data-vt-studio-control="true"
        data-size="standard"
        data-dropdown-trigger="true"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKeyDown}
      >
        <span data-vt-studio-dropdown-value>{connectionMessage ?? selected?.label ?? placeholder}</span>
        <ChevronDown size={18} strokeWidth={3} aria-hidden="true" />
      </button>
      {open && !disabled ? (
        <div id={id ? `${id}-listbox` : undefined} role="listbox" className="vt-studio-dropdown-menu" aria-label={ariaLabel}>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === currentValue}
              disabled={option.disabled}
              className="vt-studio-dropdown-option"
              data-active={index === activeIndex || undefined}
              data-selected={option.value === currentValue || undefined}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectValue(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
