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

 it("builds the uploader with a simple upload action and footer step navigation", async () => {
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

  expect(container.querySelector(".widget-dropzone")).toBeNull()
  expect(container.querySelector(".video-upload-button")).not.toBeNull()
  expect(container.querySelectorAll(".widget-toolbar.vt-full-bleed-bottom .widget-workflow-buttons > .vt-button")).toHaveLength(3)
  expect(container.querySelector('[aria-label="Video title"].vt-input')).not.toBeNull()
  expect(container.querySelector(".widget-counted-input")).toBeNull()
  expect(container.querySelectorAll(".widget-details-primary .widget-details-selects.is-three .widget-select-trigger")).toHaveLength(3)
  expect(container.querySelector('[aria-label="Category"]')?.textContent).toContain("Category")
  expect(container.querySelector('[aria-label="Playlist"]')?.textContent).toContain("Playlist")
  expect(container.querySelector('[aria-label="Description"].widget-description-textarea')).not.toBeNull()
  expect(container.querySelectorAll(".widget-control-disclosure")).toHaveLength(1)
  expect(container.querySelector(".is-green, .is-blue, .is-pink")).toBeNull()
  expect(container.querySelector(".video-meta-workspace, .video-meta-footer")).toBeNull()
 })

 it("shows the selected published video's thumbnail and keeps editor modules collapsed by default", async () => {
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
  expect([...container.querySelectorAll("details")].every((module) => !module.open)).toBe(true)
 })
})
