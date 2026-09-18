import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
 AnalyticsViewProvider,
 useAnalyticsViewContext,
 useAnalyticsWindow,
} from "./AnalyticsViewContext"

const Probe: React.FC<{ label: string }> = ({ label }) => {
 const [window] = useAnalyticsWindow("lifetime")
 return React.createElement("span", null, `${label}:${window}`)
}

const ContextProbe: React.FC = () => {
 const ctx = useAnalyticsViewContext()
 return React.createElement("span", null, ctx ? "provided" : "standalone")
}

describe("shared analytics view selection", () => {
 it("gives every surface under the provider the same window", () => {
  // The whole point: a 28d table beside a lifetime chart was possible before.
  const markup = renderToStaticMarkup(
   React.createElement(AnalyticsViewProvider, {
    initialWindow: "28d",
    children: [
     React.createElement(Probe, { key: "t", label: "table" }),
     React.createElement(Probe, { key: "v", label: "visuals" }),
     React.createElement(Probe, { key: "b", label: "brain" }),
    ],
   }),
  )
  expect(markup).toContain("table:28d")
  expect(markup).toContain("visuals:28d")
  expect(markup).toContain("brain:28d")
 })

 it("defaults to lifetime, preserving prior behavior", () => {
  const markup = renderToStaticMarkup(
   React.createElement(AnalyticsViewProvider, { children: React.createElement(Probe, { label: "t" }) }),
  )
  expect(markup).toContain("t:lifetime")
 })

 it("falls back to local state with no provider, so components stay standalone", () => {
  // Without this, adopting the context would be an all-or-nothing rewrite and
  // every existing component test would need a wrapper.
  const markup = renderToStaticMarkup(React.createElement(Probe, { label: "solo" }))
  expect(markup).toContain("solo:lifetime")
 })

 it("reports whether a provider is present", () => {
  expect(renderToStaticMarkup(React.createElement(ContextProbe))).toContain("standalone")
  expect(
   renderToStaticMarkup(
    React.createElement(AnalyticsViewProvider, { children: React.createElement(ContextProbe) }),
   ),
  ).toContain("provided")
 })

 it("honours a surface's own default only when standalone", () => {
  const Default28: React.FC = () => {
   const [w] = useAnalyticsWindow("28d")
   return React.createElement("span", null, `d:${w}`)
  }
  // Standalone -> its own default.
  expect(renderToStaticMarkup(React.createElement(Default28))).toContain("d:28d")
  // Under a provider -> the shared selection wins, not the local default.
  expect(
   renderToStaticMarkup(
    React.createElement(AnalyticsViewProvider, {
     initialWindow: "90d",
     children: React.createElement(Default28),
    }),
   ),
  ).toContain("d:90d")
 })
})

describe("surfaces are wired to the shared selection", () => {
 const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8")

 it("table, visuals and Brain gate all use the shared hook", () => {
  expect(read("../../features/vt-sync-local/shell/toolbox-table/VtSyncToolboxDataTable.tsx"))
   .toContain('useAnalyticsWindow("lifetime")')
  expect(read("../../features/vt-sync-local/shell/VtSyncDataVisualsToolbox.tsx"))
   .toContain('useAnalyticsWindow("lifetime")')
  expect(read("../../features/vt-sync-local/shell/VtSyncIntelligenceHubGate.tsx"))
   .toContain('useAnalyticsWindow("28d")')
 })

 it("the Brain gate no longer reads the write-once snapshot knob", () => {
  // snapshot.selectedTimeWindow is set at snapshot creation and never changed,
  // so the Brain's "selected window" was a constant no user could influence.
  // Comments may still mention it; only executable lines matter here.
  const code = read("../../features/vt-sync-local/shell/VtSyncIntelligenceHubGate.tsx")
   .split("\n")
   .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
   .join("\n")
  expect(code).not.toContain("snapshot.selectedTimeWindow")
  expect(code).toContain("window: viewWindow")
  expect(code).toContain("selectedWindow: viewWindow")
 })

 it("the analytics page mounts the provider", () => {
  expect(read("../../features/vt-sync-local/shell/VtSyncLocalAnalyticsPage.tsx"))
   .toContain("<AnalyticsViewProvider")
 })
})
