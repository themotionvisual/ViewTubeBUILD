import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { overviewSlices } from "../widgets/channelOverviewChartData"

const mobile = readFileSync(new URL("../widgetMobileContract.css", import.meta.url), "utf8")
const scrollbar = readFileSync(new URL("../widgetScrollbar.css", import.meta.url), "utf8")
const about = readFileSync(new URL("../widgets/VerificationExplainerWidget.css", import.meta.url), "utf8")
const oracle = readFileSync(new URL("../widgets/DailyOracleWidget.css", import.meta.url), "utf8")
const imageSource = readFileSync(new URL("../widgets/ImageGeneratorWidget.tsx", import.meta.url), "utf8")
const uploaderSource = readFileSync(new URL("../widgets/VideoUploaderWidget.tsx", import.meta.url), "utf8")
const settingsCss = readFileSync(new URL("../widgets/SettingsWidget.css", import.meta.url), "utf8")
const directorCss = readFileSync(new URL("../widgets/video-director/videoDirectorWidget.css", import.meta.url), "utf8")
const shellSource = readFileSync(new URL("../WidgetShell.tsx", import.meta.url), "utf8")
const referenceSource = readFileSync(new URL("../widgets/UIReferenceLibraryWidget.tsx", import.meta.url), "utf8")
const assetCss = readFileSync(new URL("../widgets/VideoAssetEngineWidget.css", import.meta.url), "utf8")

describe("mobile widget density and edge contracts", () => {
  it("does not reserve an invisible mobile scroll gutter and reclaims extra right-side space", () => {
    expect(scrollbar).toContain("@media (pointer: coarse), (max-width: 767px)")
    expect(scrollbar).toContain("padding-inline-end: 0")
    expect(mobile).toContain("scrollbar-gutter: auto")
    expect(mobile).toContain("--vt-mobile-reclaim-left: 12px")
    expect(mobile).toContain("--vt-mobile-reclaim-right: 32px")
    expect(mobile).toContain("width: calc(100% + var(--vt-mobile-reclaim-left) + var(--vt-mobile-reclaim-right))")
  })

  it("uses full-bleed interior bands for About and Oracle", () => {
    expect(about).toContain("margin-inline: calc(-1 * var(--widget-content-inset))")
    expect(oracle).toContain("margin-inline: calc(-1 * var(--widget-content-inset))")
    expect(oracle).not.toContain("text-overflow: ellipsis")
  })

  it("lets image template labels wrap instead of collide", () => {
    expect(imageSource).toContain("image-generator-template-toggle")
  })

  it("keeps the mobile control deck visible while a widget is collapsed", () => {
    expect(mobile).toContain('.dashboard-widget-slot.is-collapsed:has(.vt-widget.mobile-controls-open)')
    expect(shellSource).toContain("mobileControlsOpen")
  })

  it("provides a full-bleed utility for bands and horizontal rails", () => {
    expect(mobile).toContain(".vt-widget-full-bleed")
    expect(assetCss).toContain("vt-asset-engine-slot-panel")
  })

  it("uses canonical text field primitives in Video Uploader", () => {
    expect(uploaderSource).toContain("WidgetTextInput")
    expect(uploaderSource).toContain("WidgetTextArea")
  })

  it("keeps Settings dense on compact widths", () => {
    expect(settingsCss).toContain(".settings-switchboard-control-grid")
    expect(settingsCss).toContain("grid-template-columns:repeat(2,minmax(0,1fr))")
  })

  it("separates Video Director rows vertically on narrow containers", () => {
    expect(directorCss).toContain("row-gap:6px")
    expect(directorCss).toContain("align-content:start")
  })

  it("documents the canonical video dropdown in the UI reference library", () => {
    expect(referenceSource).toContain("Video Select / Dropdown")
    expect(referenceSource).toContain("WidgetVideoSelect")
  })
})

describe("Channel Overview synced fallback", () => {
  it("uses synced aggregate audience/device rows when the exact window bucket is empty", () => {
    const base:any = {
      devices:[{device:"MOBILE",views:70},{device:"TV",views:30}],
      subscriptionStatuses:[{status:"SUBSCRIBED",views:60},{status:"UNSUBSCRIBED",views:40}],
      trafficByDay:[],
      datasetsByWindow:{ "28d": { device_type:[], subscription_status:[] } },
      storageMetadata:{},
      capturedAt:new Date().toISOString(),
    }
    expect(overviewSlices(base,"audience",28)).toHaveLength(2)
    expect(overviewSlices(base,"devices",28)).toHaveLength(2)
  })
})
