// @vitest-environment jsdom
//
// vt-2072 — Test route-top behavior for the ScrollToTop component (shipped
// in PR #13 as part of QW#7). The project doesn't use @testing-library, so
// this uses `createRoot` + a mocked `useLocation` to drive the two behaviors
// under test:
//
//   1. First mount → window.scrollTo called with (0, 0)
//   2. Re-render with a hash-only change → window.scrollTo NOT called again
//
// The full route-transition test lives one integration boundary out; this
// unit test guards the hook logic that decides WHEN to scroll.

import React, { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"

// Mock react-router-dom's useLocation so we can drive it manually without
// having to mount a real router in the test.
let currentLocation: { pathname: string; hash: string } = { pathname: "/", hash: "" }
vi.mock("react-router-dom", () => ({
 useLocation: () => currentLocation,
}))

// Import AFTER the mock is registered.
import { ScrollToTop } from "../ScrollToTop"

describe("ScrollToTop (vt-2072)", () => {
 let container: HTMLDivElement
 let root: Root
 let scrollToSpy: ReturnType<typeof vi.fn>

 beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  scrollToSpy = vi.fn()
  Object.defineProperty(window, "scrollTo", {
   configurable: true,
   writable: true,
   value: scrollToSpy,
  })
  currentLocation = { pathname: "/", hash: "" }
 })

 afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
 })

 it("scrolls to top on initial mount", () => {
  act(() => root.render(<ScrollToTop />))
  expect(scrollToSpy).toHaveBeenCalledTimes(1)
  const call = scrollToSpy.mock.calls[0]
  const arg = call[0]
  if (typeof arg === "object" && arg !== null) {
   expect(arg.top).toBe(0)
   expect(arg.left).toBe(0)
  } else {
   expect(call).toEqual([0, 0])
  }
 })

 it("scrolls again when the pathname changes", () => {
  act(() => root.render(<ScrollToTop />))
  const initialCalls = scrollToSpy.mock.calls.length

  // Simulate a route change by updating the mocked location + re-rendering.
  currentLocation = { pathname: "/next", hash: "" }
  act(() => root.render(<ScrollToTop />))
  expect(scrollToSpy.mock.calls.length).toBeGreaterThan(initialCalls)
 })

 it("does NOT scroll when only the hash changes (anchor navigation)", () => {
  act(() => root.render(<ScrollToTop />))
  const initialCalls = scrollToSpy.mock.calls.length

  currentLocation = { pathname: "/", hash: "#section" }
  act(() => root.render(<ScrollToTop />))
  // Effect body has an early-return on hash; scrollTo count unchanged.
  expect(scrollToSpy.mock.calls.length).toBe(initialCalls)
 })

 it("resumes scrolling to top when pathname changes after a hash-only nav", () => {
  act(() => root.render(<ScrollToTop />))

  currentLocation = { pathname: "/", hash: "#one" }
  act(() => root.render(<ScrollToTop />))
  const afterHash = scrollToSpy.mock.calls.length

  currentLocation = { pathname: "/other", hash: "" }
  act(() => root.render(<ScrollToTop />))
  expect(scrollToSpy.mock.calls.length).toBeGreaterThan(afterHash)
 })

 it("renders nothing to the DOM", () => {
  act(() => root.render(<ScrollToTop />))
  expect(container.textContent).toBe("")
  expect(container.children.length).toBe(0)
 })
})
