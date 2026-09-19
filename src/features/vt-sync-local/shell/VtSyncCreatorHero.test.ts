import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { normalizeVtSyncSnapshot } from "../adapters/snapshot"
import { VT_SYNC_SYNC_UNITS } from "../upstream/syncUnitRegistry"
import { buildVtSyncCreatorHeroModel, VtSyncCreatorHero } from "./VtSyncCreatorHero"

const snapshotWith = (overrides: Record<string, unknown> = {}) => normalizeVtSyncSnapshot({
 source: "vt-sync",
 snapshotId: "hero-test",
 capturedAt: "2026-07-28T08:00:00.000Z",
 channelName: "The Motion Visual History",
 channelCustomUrl: "@themotionvisual",
 subscriberCount: 4_130,
 channelVideoCount: 923,
 channelViewCount: 1_100_291,
 videos: [
  { id: "older", title: "Older video", publishedAt: "2026-07-20T12:00:00Z", thumbnail: "https://example.com/older.jpg" },
  { id: "newer", title: "Newer video", publishedAt: "2026-07-27T12:00:00Z", thumbnail: "https://example.com/newer.jpg" },
 ],
 ...overrides,
})

describe("VT-SYNC creator intelligence hero", () => {
 it("uses the approved status priority and action contract", () => {
  const failed = snapshotWith({
   datasetFreshness: {
    videos_analytics: { phase: "videos_analytics", status: "failed", updatedAt: "2026-07-28T08:30:00.000Z" },
   },
  })

  expect(buildVtSyncCreatorHeroModel({
   authReady: false,
   snapshot: failed,
   visibleVideos: failed.videos,
   progress: null,
  })).toMatchObject({ status: "disconnected", action: "connect", actionLabel: "Connect YouTube" })

  expect(buildVtSyncCreatorHeroModel({
   authReady: true,
   snapshot: failed,
   visibleVideos: failed.videos,
   progress: null,
  })).toMatchObject({ status: "failed", action: "recommended-sync", actionLabel: "Refresh channel data" })

  expect(buildVtSyncCreatorHeroModel({
   authReady: true,
   snapshot: snapshotWith(),
   visibleVideos: failed.videos,
   progress: {
    runId: "partial",
    startedAt: "2026-07-28T08:45:00.000Z",
    status: "partial",
    requestedCategoryIds: ["videos_analytics"],
    phases: [],
   },
  })).toMatchObject({ status: "partial", actionLabel: "Refresh channel data" })

  expect(buildVtSyncCreatorHeroModel({
   authReady: false,
   snapshot: failed,
   visibleVideos: failed.videos,
   progress: {
    runId: "active",
    startedAt: "2026-07-28T09:00:00.000Z",
    status: "running",
    requestedCategoryIds: ["videos"],
    phases: [],
   },
  })).toMatchObject({ status: "syncing", action: "progress", actionLabel: "View live progress" })
 })

 it("counts user-facing sync units instead of child queries and marks only the exact shared-phase category as running", () => {
  const snapshot = snapshotWith()
  const model = buildVtSyncCreatorHeroModel({
   authReady: true,
   snapshot,
   visibleVideos: snapshot.videos,
   progress: {
    runId: "traffic-run",
    startedAt: "2026-09-19T12:00:00.000Z",
    status: "running",
    requestedCategoryIds: ["search_terms", "ext_websites"],
    phases: [{
     id: "traffic",
     label: "Traffic Details",
     status: "running",
     rows: 10,
     currentCategoryId: "search_terms",
     nextCategoryId: "ext_websites",
    }],
    categoryStates: {
     search_terms: { categoryId: "search_terms", status: "running", rows: 10 },
     ext_websites: { categoryId: "ext_websites", status: "pending", rows: 0 },
    },
   },
  })

  expect(model.datasetsTotalCount).toBe(VT_SYNC_SYNC_UNITS.length)
  expect(model.coverage.filter((item) => item.status === "running").map((item) => item.id))
   .toEqual(["traffic_detail_search_terms"])
  expect(model.coverage.find((item) => item.id === "traffic_detail_ext_websites")?.status).not.toBe("running")
 })

  it("uses missing values instead of manufactured zeros and orders the six newest visible videos", () => {
  const empty = normalizeVtSyncSnapshot({ source: "empty", snapshotId: "empty", capturedAt: "2026-07-28T08:00:00.000Z" })
  const emptyModel = buildVtSyncCreatorHeroModel({
   authReady: true,
   snapshot: empty,
   visibleVideos: [],
   progress: null,
  })
  expect(emptyModel).toMatchObject({
   status: "first-sync",
   videos: undefined,
   subscribers: undefined,
   lifetimeViews: undefined,
  })

  const populated = snapshotWith()
  const populatedModel = buildVtSyncCreatorHeroModel({
   authReady: true,
   snapshot: populated,
   visibleVideos: populated.videos,
   progress: null,
  })
  expect(populatedModel.recentVideos.map((video) => video.id)).toEqual(["newer", "older"])
  expect(populatedModel.videos).toBe(923)
  expect(populatedModel.recentVideos).toHaveLength(2)
 })

 it("renders one creator-facing primary action without developer-only opening copy", () => {
  const snapshot = snapshotWith()
  const model = buildVtSyncCreatorHeroModel({
   authReady: true,
   snapshot,
   visibleVideos: snapshot.videos,
   progress: null,
  })
  const markup = renderToStaticMarkup(React.createElement(
   VtSyncCreatorHero,
   {
    model,
    onConnect: vi.fn(),
    onRecommendedSync: vi.fn(),
    onChooseDatasets: vi.fn(),
    onViewProgress: vi.fn(),
   },
  ))

  expect(markup.match(/data-primary-action=/g)).toHaveLength(1)
  expect(markup).toContain("Your channel. Fully visible.")
  expect(markup).toContain("The Motion Visual History")
  expect(markup).not.toContain("VT-SYNC LOCAL")
  expect(markup).not.toContain("NO CANONICAL WRITES")
  expect(markup).not.toContain("UPSTREAM:")
  expect(markup).not.toContain("LOCAL SNAPSHOT ONLY")
 })
})
