// @vitest-environment jsdom

import React, { act, useState } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"
import { VisualModuleController } from "./VisualModuleController"

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const OPTIONS = [
 { label: "Views", value: "views", color: "#26C7EC" },
 { label: "Watch", value: "watch", color: "#FFD84D" },
 { label: "Revenue", value: "revenue", color: "#4FFF5B" },
]

const SelectorHarness = () => {
 const [selectedValues, setSelectedValues] = useState<string[]>(["views"])
 return (
  <VisualModuleController
   rows={[{
    type: "metricMultiSelect",
    options: OPTIONS,
    selectedValues,
    minimumSelected: 1,
    maximumSelected: 2,
    onToggleValue: (value) => setSelectedValues((current) => (
     current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value]
    )),
   }]}
  />
 )
}

describe("VisualModuleController metric multi-select", () => {
 let container: HTMLDivElement | undefined
 let root: ReturnType<typeof createRoot> | undefined

 afterEach(() => {
  if (root) act(() => root?.unmount())
  container?.remove()
  document.querySelectorAll('[role="listbox"]').forEach((node) => node.remove())
  root = undefined
  container = undefined
 })

 it("enforces selection bounds and exposes multi-select semantics", async () => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)

  await act(async () => root?.render(<SelectorHarness />))
  const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Choose metrics"]')
  expect(trigger).not.toBeNull()

  await act(async () => trigger?.click())
  const listbox = document.querySelector<HTMLElement>('[role="listbox"]')
  expect(listbox?.getAttribute("aria-multiselectable")).toBe("true")
  expect(trigger?.getAttribute("aria-controls")).toBe(listbox?.id)
  expect(listbox?.getAttribute("aria-labelledby")).toBe(trigger?.id)

  const option = (label: string) => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="option"]'))
   .find((button) => button.textContent?.includes(label))

  expect(option("Views")?.disabled).toBe(true)
  await act(async () => option("Watch")?.click())
  expect(option("Revenue")?.disabled).toBe(true)
  expect(option("Views")?.disabled).toBe(false)

  await act(async () => option("Views")?.click())
  expect(option("Watch")?.disabled).toBe(true)
  expect(option("Revenue")?.disabled).toBe(false)
 })
})
