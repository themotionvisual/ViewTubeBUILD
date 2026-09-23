import React from "react"
import { WidgetSelect } from "../WidgetPrimitives"

/**
 * Legacy compatibility helper only.
 *
 * Video Manager and Video Uploader no longer render from this module. Their
 * independent widget owners are VideoManagerWidget.tsx and
 * VideoUploaderWidget.tsx. Retention Simulator and Title Rewriter still use
 * this small option-shape adapter while their own selector migrations remain
 * separate work.
 */
export const CustomDropdown = ({ value, onChange, options }: {
  value: string
  onChange: (value: string) => void
  options: { key?: string; val: string; lbl: string }[]
}) => (
  <WidgetSelect
    value={value}
    onChange={onChange}
    label="Select option"
    options={options.map((option) => ({ value: option.val, label: option.lbl }))}
  />
)
