import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SubToolbox, ToolboxScaffold } from "./Toolbox"

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
  expect(html).toContain('data-vt-toolbox-level="sub"')
  expect(html).toContain('data-state="closed"')
  expect(html).toContain("--vt-subtoolbox-shell-shadow:rgba(255, 170, 51, 0.5)")
  expect(html).toContain("box-shadow:var(--vt-subtoolbox-shadow-offset, 6px)")
  expect(html).not.toContain("box-shadow:4px 4px 0 0 currentColor")
 })

 it("clips colored fills to the reduced 12px subtoolbox frame", () => {
  const html = renderShell(true)

  expect(html).toContain("border-radius:var(--vt-subtoolbox-radius, 12px)")
  expect(html).toContain("overflow-hidden")
  expect(html).toContain("isolation:isolate")
 })

 it("renders one bottom edge when collapsed and one content seam when open", () => {
  const closed = renderShell(false)
  const open = renderShell(true)

  expect(closed).toContain("border-bottom:0 solid transparent")
  expect(open).toContain("border-bottom:var(--vt-subtoolbox-stroke, 4px) solid black")
  expect(closed).not.toContain("margin-top:-4px")
  expect(open).not.toContain("margin-top:-4px")
 })

 it("is collapsible by default and keeps the canonical arrow", () => {
  const html = renderToStaticMarkup(
   <SubToolbox title="Default" icon={<span>I</span>}>
    <div>Body</div>
   </SubToolbox>,
  )

  expect(html).toContain("cursor-pointer")
  expect(html).toContain("lucide-expand")
 })

 it("matches its title size to the 20px inner action label", () => {
  const html = renderShell(true)

  expect(html).toContain("text-[20px]")
 })
})

describe("ToolboxScaffold", () => {
 it("does not double the bottom stroke when collapsed", () => {
  const html = renderToStaticMarkup(
   <ToolboxScaffold
    title="Thumbnail"
    headerColor="bg-[#FFAA33]"
    icon={<span>I</span>}
    collapsible
    isOpen={false}
   >
    <div>Body</div>
   </ToolboxScaffold>,
  )

  expect(html).toContain('data-vt-toolbox-level="main"')
  expect(html).toContain("text-[26px]")
  expect(html).toContain("padding-inline:var(--vt-toolbox-content-inline-padding, 10px)")
  expect(html).toContain("border-bottom:0 solid transparent")
  expect(html).not.toContain("margin-top:-5px")
 })
})
