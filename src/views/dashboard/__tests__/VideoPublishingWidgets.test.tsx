// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { VideoUploaderWidget } from "../widgets/VideoUploaderWidget"
import { VideoManagerWidget } from "../widgets/VideoManagerWidget"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"

vi.mock("../../../services/youtubeService", () => ({
 fetchUserPlaylists: vi.fn().mockResolvedValue([]),
 fetchVideoCategories: vi.fn().mockResolvedValue([]),
 fetchVideoSnippetDetails: vi.fn().mockResolvedValue({
  video123: { description: "Published description", tags: ["history"], categoryId: "27" },
 }),
 fetchChannelPublishingDefaults: vi.fn().mockResolvedValue({ description: "", tags: [] }),
 updateVideo: vi.fn().mockResolvedValue(undefined),
 updateVideoThumbnail: vi.fn().mockResolvedValue(undefined),
 uploadVideo: vi.fn().mockResolvedValue({ id: "uploaded123" }),
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

 it("builds the uploader around its independent upload gantry", async () => {
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

  expect(container.querySelector(".video-uploader-widget")).not.toBeNull()
  expect(container.querySelectorAll(".video-uploader-gantry .widget-media-upload")).toHaveLength(2)
  expect(container.querySelector(".video-uploader-source-frame")).not.toBeNull()
  expect(container.querySelector(".video-uploader-thumbnail-frame")).not.toBeNull()
  expect(container.querySelector('[aria-label="Video title"].vt-input')).not.toBeNull()
  expect(container.querySelector('[aria-label="Description"].video-uploader-description')).not.toBeNull()
  expect(container.querySelectorAll(".video-uploader-selects .widget-select-trigger")).toHaveLength(3)
  expect(container.querySelectorAll(".video-uploader-pages > .vt-button")).toHaveLength(3)
  expect(container.querySelector(".video-uploader-footer .widget-split-button")?.textContent).toContain("Publish video")
  expect(container.querySelector(".video-manager-widget")).toBeNull()
 })

 it("builds the manager around its independent video package desk and canonical video selector", async () => {
  const widget = DASHBOARD_WIDGET_BY_ID["data-edit"]
  await act(async () => {
   root.render(
    <VideoManagerWidget
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

  expect(container.querySelector(".video-manager-widget")).not.toBeNull()
  const trigger = container.querySelector<HTMLButtonElement>('[aria-label="Published video"]')
  expect(trigger).not.toBeNull()
  expect(trigger?.className).toContain("widget-video-select-trigger")

  await act(async () => trigger?.click())
  const option = [...container.querySelectorAll<HTMLElement>('[role="option"]')]
   .find((element) => element.textContent?.includes("Published test video"))
  expect(option).not.toBeUndefined()
  await act(async () => option?.click())
  await act(async () => Promise.resolve())

  const thumbnail = container.querySelector<HTMLImageElement>('img[alt="Thumbnail for Published test video"]')
  expect(thumbnail?.src).toBe("https://example.com/video123.jpg")
  expect(container.querySelector(".video-manager-package-desk")).not.toBeNull()
  expect(container.querySelector(".video-manager-package-status")?.textContent).toContain("PACKAGE LOADED")
  expect(container.querySelector(".video-uploader-widget")).toBeNull()
 })

 it("adds the uploader timestamps page when Education is selected", async () => {
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

  const category = container.querySelector<HTMLButtonElement>('[aria-label="Category"]')
  await act(async () => category?.click())
  const education = [...document.querySelectorAll<HTMLElement>('[role="option"]')]
   .find((option) => option.textContent === "Education")
  await act(async () => education?.click())

  expect(container.querySelector(".video-uploader-pages")?.textContent).toContain("Timestamps")
 })
})
