import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SubToolbox, ToolboxScaffold } from "./Toolbox"
import {
 ToolboxHeaderCollapseButton,
 ToolboxHeaderHelpButton,
 ToolboxHeaderToggle,
} from "./subtoolbox/SubToolboxPrimitives"

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

 it("keeps one permanent divider while content slides beneath it", () => {
  const closed = renderShell(false)
  const open = renderShell(true)

  expect(closed).toContain("border-bottom:var(--vt-subtoolbox-stroke, 4px) solid black")
  expect(open).toContain("border-bottom:var(--vt-subtoolbox-stroke, 4px) solid black")
  expect(closed).toContain("margin-top:calc(var(--vt-subtoolbox-stroke, 4px) * -1)")
  expect(open).toContain("margin-top:calc(var(--vt-subtoolbox-stroke, 4px) * -1)")
  expect(closed).toContain("duration-[600ms] ease-out motion-reduce:transition-none")
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

  expect(html).toContain("text-[length:var(--vt-subtoolbox-title-size,20px)]")
 })
})

describe("ToolboxScaffold", () => {
 it("keeps the Mini Toolbox Lab divider during collapse", () => {
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
  // The title size is token-driven so the phone override can shrink it; 26px
  // stays the desktop default.
  expect(html).toContain("text-[length:var(--vt-toolbox-title-size,26px)]")
  expect(html).toContain("padding-right:var(--vt-toolbox-content-padding, 4px)")
  expect(html).toContain("padding-left:var(--vt-toolbox-content-padding, 4px)")
  expect(html).toContain("border-bottom:var(--vt-toolbox-stroke, 5px) solid black")
  expect(html).toContain("margin-top:calc(var(--vt-toolbox-stroke, 5px) * -1)")
  expect(html).toContain("duration-[600ms] ease-out motion-reduce:transition-none")
 })
})

describe("Toolbox header controls", () => {
 it("keeps native button semantics and explicit pressed / expanded state", () => {
  const toggle = renderToStaticMarkup(
   <ToolboxHeaderToggle
    value="longform"
    aria-label="Video format"
    options={[
     { value: "longform", label: "Longform" },
     { value: "shorts", label: "Shorts" },
    ]}
   />,
  )
  const help = renderToStaticMarkup(
   <ToolboxHeaderHelpButton level="toolbox" aria-label="Help" />,
  )
  const collapse = renderToStaticMarkup(
   <ToolboxHeaderCollapseButton
    level="toolbox"
    open
    aria-label="Collapse toolbox"
    icon={<span aria-hidden="true">X</span>}
   />,
  )

  expect(toggle).toContain('role="group"')
  expect(toggle).toContain('aria-label="Video format"')
  expect(toggle).toContain('aria-pressed="true"')
  expect(toggle).toContain('aria-pressed="false"')
  expect(toggle).toContain('type="button"')
  expect(toggle).toContain("Longform")
  expect(toggle).toContain("Shorts")

  expect(help).toContain('type="button"')
  expect(help).toContain('aria-label="Help"')
  expect(help).toContain('data-vt-toolbox-help="true"')

  expect(collapse).toContain('type="button"')
  expect(collapse).toContain('aria-expanded="true"')
  expect(collapse).toContain('aria-label="Collapse toolbox"')
  expect(collapse).toContain('data-vt-toolbox-toggle="true"')
 })
})

