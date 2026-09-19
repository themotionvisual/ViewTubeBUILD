import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  DASHBOARD_WIDGET_BY_ID,
  DASHBOARD_WIDGET_REGISTRY,
} from "../../views/dashboard/WidgetRegistry"
import { DASHBOARD_WIDGET_RENDERER_KEYS } from "../../views/dashboard/WidgetRenderer"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("Video Director dual-surface architecture", () => {
  it("registers one canonical Dashboard widget with a renderer", () => {
    const widget = DASHBOARD_WIDGET_BY_ID["video-director"]
    expect(widget).toBeTruthy()
    expect(widget.category).toBe("creation")
    expect(widget.responsiveMode).toBe("container")
    expect(widget.supportedSizes).toContain("half")
    expect(widget.supportedSizes).toContain("full")
    expect(widget.supportedHeights).toContain("massive")
    expect(DASHBOARD_WIDGET_RENDERER_KEYS.has("video-director")).toBe(true)

    expect(
      DASHBOARD_WIDGET_REGISTRY.filter((entry) => entry.id === "video-director"),
    ).toHaveLength(1)
  })

  it("keeps the Dashboard surface inside the Widget UI system", () => {
    const source = read("src/views/dashboard/widgets/video-director/VideoDirectorWidget.tsx")
    expect(source).toContain('from "../../WidgetShell"')
    expect(source).toContain('from "../../WidgetPrimitives"')
    expect(source).toContain("WidgetWorkflowMain")
    expect(source).toContain("WidgetScrollArea")
    expect(source).toContain("WidgetFooter")
    expect(source).not.toContain("ToolboxScaffold")
    expect(source).not.toContain("SubToolbox")
    expect(source).not.toContain("../components/Toolbox")
  })

  it("keeps the Studio surface inside the Toolbox UI system", () => {
    const source = read("src/views/VideoDirector.tsx")
    expect(source).toContain("ToolboxScaffold")
    expect(source).toContain("SubToolbox")
    expect(source).toContain("StudioButton")
    expect(source).not.toContain("WidgetShell")
    expect(source).not.toContain("WidgetPrimitives")
  })

  it("shares one Video Director state channel across both surfaces", () => {
    const dashboard = read("src/views/dashboard/widgets/video-director/VideoDirectorWidget.tsx")
    const studio = read("src/views/VideoDirector.tsx")
    const store = read("src/features/video-director/projectStore.ts")

    expect(dashboard).toContain("subscribeVideoDirectorState")
    expect(dashboard).toContain("writeVideoDirectorState")
    expect(studio).toContain("subscribeVideoDirectorState")
    expect(store).toContain("VIDEO_DIRECTOR_CHANGED_EVENT")
  })

  it("keeps feature-specific Dashboard visuals beside the widget instead of promoting them to global primitives", () => {
    const source = read("src/views/dashboard/widgets/video-director/VideoDirectorWidgetComponents.tsx")
    expect(source).toContain("DirectorWidgetLensVisual")
    expect(source).toContain("DirectorWidgetMoodVisual")
    expect(source).toContain("DirectorWidgetCompositionVisual")
    expect(source).toContain("DirectorWidgetLightingVisual")
    expect(source).toContain("DirectorWidgetPacingVisual")
    expect(source).toContain("DirectorWidgetAudioStage")
    expect(source).toContain("DirectorWidgetProviderRoute")
  })

  it("keeps signature directing concepts paired across Widget and Studio implementations", () => {
    const widget = read("src/views/dashboard/widgets/video-director/VideoDirectorWidgetComponents.tsx")
    const studioCore = read("src/views/video-director/StudioDirectorSignatureControls.tsx")
    const studioAdvanced = read("src/views/video-director/StudioDirectorAdvancedSignatureControls.tsx")
    const studioMore = read("src/views/video-director/StudioDirectorMoreSignatureControls.tsx")
    const contracts = read("src/features/video-director/signatureContracts.ts")

    const concepts = [
      "Lens",
      "Mood",
      "Composition",
      "Lighting",
      "Pacing",
      "Audio",
      "CameraPath",
      "FocusDepth",
      "Texture",
      "Transition",
      "Music",
      "Caption",
      "Reference",
      "Continuity",
      "Negative",
      "Concept",
      "Style",
      "Perspective",
      "Palette",
      "Grade",
      "ShotStructure",
      "Speed",
      "Dialogue",
      "Sfx",
      "Title",
      "Overlay",
      "Effects",
      "Output",
    ]

    for (const concept of concepts) {
      expect(widget).toContain(concept)
      expect(studioCore + studioAdvanced + studioMore).toContain(concept)
    }

    expect(contracts).toContain("DirectorLensControlProps")
    expect(contracts).toContain("DirectorCameraPathProps")
    expect(contracts).toContain("DirectorContinuityLedgerProps")
  })


  it("preserves selected category and scope when handing Dashboard work into Studio", () => {
    const dashboard = read("src/views/dashboard/widgets/video-director/VideoDirectorWidget.tsx")
    const studio = read("src/views/VideoDirector.tsx")
    const handoff = read("src/features/video-director/surfaceHandoff.ts")

    expect(dashboard).toContain("writeVideoDirectorSurfaceHandoff")
    expect(dashboard).toContain('target: "studio"')
    expect(studio).toContain('readVideoDirectorSurfaceHandoff("studio")')
    expect(studio).toContain("clearVideoDirectorSurfaceHandoff")
    expect(handoff).toContain("categoryId")
    expect(handoff).toContain("scopeKey")
  })


  it("keeps the Dashboard Video Director in its compact 24px execution profile", () => {
    const widget = read("src/views/dashboard/widgets/video-director/VideoDirectorWidget.tsx")
    const css = read("src/views/dashboard/widgets/video-director/videoDirectorWidget.css")

    expect(widget).toContain('className="widget-header-toggle vtdw-header-studio"')
    expect(widget).toContain("STUDIO ↗")
    expect(widget).not.toContain("height={38}")
    expect(widget).not.toContain("height={32}")
    expect(css).toContain("--vt-primitive-font:10px")
    expect(css).toContain("font-size:10px !important")
    expect(css).not.toContain("min-height:44px")
    expect(css).toContain("grid-template-columns:repeat(4,minmax(0,1fr))")
  })

})