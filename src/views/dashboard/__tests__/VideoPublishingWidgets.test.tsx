// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DataEditWidget, VideoUploaderWidget } from "../widgets/DataEditWidget"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"

vi.mock("../../../services/youtubeService", () => ({
 fetchUserPlaylists: vi.fn().mockResolvedValue([]),
 fetchVideoCategories: vi.fn().mockResolvedValue([]),
 fetchVideoSnippetDetails: vi.fn().mockResolvedValue({
  video123: { description: "Published description", tags: ["history"], categoryId: "27" },
 }),
 updateVideo: vi.fn().mockResolvedValue(undefined),
 uploadVideo: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../../../context/UnifiedAccountContext", () => ({
 useUnifiedAccount: () => ({
  serverEnabled: false,
  snapshot: { grantedCapabilities: [] },
  start: vi.fn(),
 }),
}))

describe("split video publishing widgets", () => {
 let container: HTMLDivElement
 let root: Root

 beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  HTMLElement.prototype.scrollIntoView = vi.fn()
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  Object.defineProperty(window, "matchMedia", {
   configurable: true,
   value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  })
  Object.defineProperty(window, "localStorage", {
   configurable: true,
   value: { getItem: vi.fn().mockReturnValue(null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(), key: vi.fn(), length: 0 },
  })
 })

 afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
 })

 it("builds the uploader with multi-project rail, responsive details grid, and clean 2-tab navigation", async () => {
  const widget = DASHBOARD_WIDGET_BY_ID["video-uploader"]
  await act(async () => {
   root.render(
    <VideoUploaderWidget
     widget={widget}
     instance={{ collapsed: false, size: "half", height: "xtall" }}
     editMode={false}
     canEdit
     onToggleCollapse={vi.fn()}
     onCycleSize={vi.fn()}
     onDecSize={vi.fn()}
     onCycleHeight={vi.fn()}
     onDecHeight={vi.fn()}
     onRemove={vi.fn()}
     data={{ authState: { isAuthenticated: false }, videoAssets: [] } as never}
    />,
   )
  })

  // Header project draft toggle
  expect(container.querySelector(".video-uploader-header-drafts")).not.toBeNull()
  expect(container.querySelector(".video-uploader-header-drafts")?.textContent).toContain("Project 1")
  expect(container.querySelector(".video-uploader-header-add")).not.toBeNull()

  // Upload actions & frame
  expect(container.querySelectorAll(".widget-media-upload")).toHaveLength(1)
  expect(container.querySelector(".video-upload-file-action")?.textContent).toContain("UPLOAD VIDEO")
  expect(container.querySelector(".video-thumbnail-column .widget-media-upload-action")?.textContent).toContain("UPLOAD THUMBNAIL")

  // Metadata inputs
  expect(container.querySelector('[aria-label="Video title"].vt-input')).not.toBeNull()
  expect(container.querySelector('[aria-label="Description"].widget-description-textarea')).not.toBeNull()
  expect(container.querySelector('[aria-label="Category"]')?.textContent).toContain("People & Blogs")
  expect(container.querySelector('[aria-label="Playlist"]')?.textContent).toContain("Playlist")
  expect(container.querySelector('[aria-label="Visibility"]')?.textContent).toContain("PUBLIC")

  // Clean 2-tab navigation in footer
  expect(container.querySelectorAll(".video-uploader-nav-tabs > .vt-button")).toHaveLength(2)
  expect(container.querySelector(".video-uploader-nav-tabs")?.textContent).toContain("DETAILS")
  expect(container.querySelector(".video-uploader-nav-tabs")?.textContent).toContain("OPTIONS & SUITABILITY")
 })

 it("shows the selected published video's thumbnail and displays metadata in manage mode", async () => {
  const widget = DASHBOARD_WIDGET_BY_ID["data-edit"]
  await act(async () => {
   root.render(
    <DataEditWidget
     widget={widget}
     instance={{ collapsed: false, size: "half", height: "xtall" }}
     editMode={false}
     canEdit
     onToggleCollapse={vi.fn()}
     onCycleSize={vi.fn()}
     onDecSize={vi.fn()}
     onCycleHeight={vi.fn()}
     onDecHeight={vi.fn()}
     onRemove={vi.fn()}
     data={{
      authState: { isAuthenticated: false },
      videoAssets: [{
       channelId: "channel1",
       videoId: "video123",
       title: "Published test video",
       thumbnailUrl: "https://example.com/video123.jpg",
       publishedAt: null,
       durationSeconds: 300,
       format: "long",
      }],
     } as never}
    />,
   )
  })

  const trigger = document.querySelector<HTMLButtonElement>('[aria-label="Published video"]')
  expect(trigger).not.toBeNull()
  await act(async () => trigger?.click())
  const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')]
   .find((element) => element.textContent?.includes("Published test video"))
  expect(option).not.toBeUndefined()
  await act(async () => option?.click())

  const thumbnail = container.querySelector<HTMLImageElement>('img[alt="Thumbnail for Published test video"]')
  expect(thumbnail?.src).toBe("https://example.com/video123.jpg")
 })

 it("navigates to options & compliance page and displays ad suitability with education timestamps", async () => {
  const widget = DASHBOARD_WIDGET_BY_ID["video-uploader"]
  await act(async () => {
   root.render(
    <VideoUploaderWidget
     widget={widget}
     instance={{ collapsed: false, size: "half", height: "xtall" }}
     editMode={false}
     canEdit
     onToggleCollapse={vi.fn()}
     onCycleSize={vi.fn()}
     onDecSize={vi.fn()}
     onCycleHeight={vi.fn()}
     onDecHeight={vi.fn()}
     onRemove={vi.fn()}
     data={{ authState: { isAuthenticated: false }, videoAssets: [] } as never}
    />,
   )
  })

  // Select Education category
  const category = container.querySelector<HTMLButtonElement>('[aria-label="Category"]')
  await act(async () => category?.click())
  const education = [...document.querySelectorAll<HTMLElement>('[role="option"]')]
   .find((option) => option.textContent === "Education")
  await act(async () => education?.click())

  // Switch to Options & Suitability page
  const optionsTab = [...container.querySelectorAll<HTMLButtonElement>(".video-uploader-nav-tabs button")]
   .find((btn) => btn.textContent?.includes("OPTIONS & SUITABILITY"))
  expect(optionsTab).not.toBeUndefined()
  await act(async () => optionsTab?.click())

  // Verify Ad Suitability and Timestamps sections render in unified compliance page
  expect(container.querySelector(".video-uploader-ads-grid")).not.toBeNull()
  expect(container.querySelector(".video-timestamp-workspace")).not.toBeNull()
 })
})
