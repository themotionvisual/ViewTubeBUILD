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

  expect(html).toContain('data-vt-subtoolbox=""')
  expect(html).toContain('data-state="closed"')
  expect(html).toContain("box-shadow:6px 6px 0px 0px rgba(255, 170, 51, 0.5)")
 })

 it("clips colored fills to the canonical 16px frame", () => {
  const html = renderShell(true)

  expect(html).toContain("border-radius:16px")
  expect(html).toContain("overflow-hidden")
  expect(html).toContain("isolation:isolate")
 })

 it("renders one bottom edge when collapsed and one content seam when open", () => {
  const closed = renderShell(false)
  const open = renderShell(true)

  expect(closed).toContain("border-bottom:0 solid transparent")
  expect(open).toContain("border-bottom:4px solid black")
  expect(closed).not.toContain("margin-top:-4px")
  expect(open).not.toContain("margin-top:-4px")
 })
})
