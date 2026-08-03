// @vitest-environment jsdom

import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { BrainFeedbackControls, type ChatMessage } from "../AIBrainCommandInterface"

describe("BrainFeedbackControls", () => {
 let container: HTMLDivElement
 let root: Root

 beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
 })

 afterEach(() => {
  act(() => root.unmount())
  container.remove()
 })

 it("shows saving and saved feedback and keeps the chosen rating selected", async () => {
  let resolveSave: (() => void) | undefined
  const onFeedback = vi.fn(() => new Promise<void>((resolve) => { resolveSave = resolve }))
  const message: ChatMessage = { id: "response-1", role: "model", text: "Answer" }

  await act(async () => {
   root.render(<BrainFeedbackControls message={message} onFeedback={onFeedback} />)
  })

  const helpful = container.querySelector<HTMLButtonElement>('button[aria-label="Helpful"]')
  expect(helpful).not.toBeNull()

  act(() => helpful?.click())
  expect(container.textContent).toContain("Saving…")
  expect(helpful?.getAttribute("aria-pressed")).toBe("true")

  await act(async () => resolveSave?.())
  expect(onFeedback).toHaveBeenCalledWith(message, "helpful")
  expect(container.textContent).toContain("Saved")
  expect(helpful?.style.backgroundColor).toBe("rgb(63, 238, 86)")
 })

 it("surfaces a retry state when feedback persistence fails", async () => {
  const onFeedback = vi.fn().mockRejectedValue(new Error("storage unavailable"))
  const message: ChatMessage = { id: "response-2", role: "model", text: "Answer" }

  await act(async () => {
   root.render(<BrainFeedbackControls message={message} onFeedback={onFeedback} />)
  })
  await act(async () => {
   container.querySelector<HTMLButtonElement>('button[aria-label="Not useful"]')?.click()
  })

  expect(container.textContent).toContain("Try again")
 })
})
