import * as React from "react"
import { Toggle } from "./Toggle"
import { Label } from "./label"

export interface LabeledToggleProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
  label: string;
}

export const LabeledToggle = React.forwardRef<HTMLButtonElement, LabeledToggleProps>(
  ({ label, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <Toggle ref={ref} {...props} />
      <Label>{label}</Label>
    </div>
  )
)
LabeledToggle.displayName = "LabeledToggle"
