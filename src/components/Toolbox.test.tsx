import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SubToolbox } from "./Toolbox"

const renderShell = (open: boolean) =>
 renderToStaticMarkup(
  <SubToolbox
   title="Thumbnail"
   headerColor="bg-[#FFAA33]"
   icon={<span aria-hidden="true">I</span>}
   collapsible
   isOpen={open}
  >
   <div>Body</div>
  </SubToolbox>,
 )

describe("SubToolbox", () => {
 it("uses the header color for the translucent shell shadow", () => {
  const html = renderShell(false)

  expect(html).toContain('data-vt-subtoolbox="true"')
  expect(html).toContain('data-state="closed"')
  expect(html).toContain("box-shadow:6px 6px 0px 0px rgba(255, 170, 51, 0.5)")
 })

 it("clips colored fills to the reduced 12px subtoolbox frame", () => {
  const html = renderShell(true)

  expect(html).toContain("border-radius:12px")
  expect(html).toContain("overflow-hidden")
  expect(html).toContain("isolation:isolate")
 })

 it("keeps the divider under the title band in both states", () => {
  const closed = renderShell(false)
  const open = renderShell(true)

  // The header border is the divider. It is permanent: toggling it on `open`
  // removed the line for the whole collapse animation.
  expect(closed).toContain("border-bottom:4px solid black")
  expect(open).toContain("border-bottom:4px solid black")
 })

 it("lets nothing below the header overlap the divider", () => {
  const closed = renderShell(false)
  const open = renderShell(true)

  // A negative seam pulls the content over the border, and WebKit composites
  // the fading content above the header — which paints the divider out.
  for (const html of [closed, open]) {
   expect(html).not.toMatch(/margin-top:-\d/)
  }
 })
})
