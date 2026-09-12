import React from "react"
import type { StudioControlSize } from "../tokens"

export type StudioControlTone = "accent" | "neutral" | "danger" | "warning" | "success"

const withStudioAttrs = (size: StudioControlSize, tone?: StudioControlTone) => ({
  "data-vt-studio-control": "true",
  "data-size": size,
  ...(tone ? { "data-tone": tone } : {}),
})

export const StudioInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { sizeVariant?: Exclude<StudioControlSize, "action"> }
>(({ sizeVariant = "standard", ...props }, ref) => (
  <input ref={ref} {...withStudioAttrs(sizeVariant)} {...props} />
))
StudioInput.displayName = "StudioInput"

export const StudioSearchInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { sizeVariant?: Exclude<StudioControlSize, "action"> }
>(({ sizeVariant = "standard", type = "search", ...props }, ref) => (
  <input ref={ref} type={type} {...withStudioAttrs(sizeVariant)} {...props} />
))
StudioSearchInput.displayName = "StudioSearchInput"

export const StudioNumberInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { sizeVariant?: Exclude<StudioControlSize, "action"> }
>(({ sizeVariant = "standard", type = "number", ...props }, ref) => (
  <input ref={ref} type={type} {...withStudioAttrs(sizeVariant)} {...props} />
))
StudioNumberInput.displayName = "StudioNumberInput"

export const StudioTextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => <textarea ref={ref} {...withStudioAttrs("standard")} {...props} />)
StudioTextArea.displayName = "StudioTextArea"

export const StudioSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { sizeVariant?: Exclude<StudioControlSize, "action"> }
>(({ sizeVariant = "standard", ...props }, ref) => (
  <select ref={ref} {...withStudioAttrs(sizeVariant)} {...props} />
))
StudioSelect.displayName = "StudioSelect"

export interface StudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  sizeVariant?: StudioControlSize
  tone?: StudioControlTone
  loading?: boolean
}

export const StudioButton = React.forwardRef<HTMLButtonElement, StudioButtonProps>(
  ({ sizeVariant = "standard", tone = "accent", loading = false, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      {...withStudioAttrs(sizeVariant, tone)}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  ),
)
StudioButton.displayName = "StudioButton"
