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
  selected?: boolean
}

export const StudioButton = React.forwardRef<HTMLButtonElement, StudioButtonProps>(
  ({ sizeVariant = "standard", tone = "accent", loading = false, selected = false, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      {...withStudioAttrs(sizeVariant, tone)}
      data-selected={selected || undefined}
      aria-pressed={props["aria-pressed"] ?? (selected || undefined)}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  ),
)
StudioButton.displayName = "StudioButton"

export interface StudioIconButtonProps extends Omit<StudioButtonProps, "children"> {
  icon: React.ReactNode
  label: string
}

export const StudioIconButton = React.forwardRef<HTMLButtonElement, StudioIconButtonProps>(
  ({ icon, label, ...props }, ref) => (
    <StudioButton ref={ref} aria-label={label} data-icon-only="true" {...props}>
      <span aria-hidden="true" data-vt-studio-button-icon>{icon}</span>
    </StudioButton>
  ),
)
StudioIconButton.displayName = "StudioIconButton"

export interface StudioSplitLeftButtonProps extends StudioButtonProps {
  icon: React.ReactNode
  railColor?: string
}

export const StudioSplitLeftButton = React.forwardRef<HTMLButtonElement, StudioSplitLeftButtonProps>(
  ({ icon, railColor, children, sizeVariant = "action", ...props }, ref) => (
    <StudioButton ref={ref} sizeVariant={sizeVariant} data-split-left="true" {...props}>
      <span
        aria-hidden="true"
        data-vt-studio-split-rail
        style={railColor ? { backgroundColor: railColor } : undefined}
      >
        {icon}
      </span>
      <span data-vt-studio-split-label>{children}</span>
    </StudioButton>
  ),
)
StudioSplitLeftButton.displayName = "StudioSplitLeftButton"
