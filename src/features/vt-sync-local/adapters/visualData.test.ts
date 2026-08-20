import { describe, expect, it } from "vitest"

import { buildTubeExplorerVisualData } from "../../../components/tubeExplorerVisualData"
import { normalizeVtSyncSnapshot } from "./snapshot"
import { buildVtSyncVisualPropsData } from "./visualData"

describe("VT-SYNC visual data bridge", () => {
 it("preserves traffic and geography metrics as canonical metric cells", () => {
  const snapshot = normalizeVtSyncSnapshot({
   source: "vt-sync",
   channelId: "channel-1",
   capturedAt: "2026-07-23T04:00:00.000Z",
   videos: [{
    id: "video-1",
    title: "A real video",
    publishedAt: "2026-07-01T12:00:00.000Z",
    privacyStatus: "public",
    format: "long",
    metrics: {
     views: 400,
     watchTime: 50,
     engagedViews: 250,
     subscribersGained: 12,
     subscribersLost: 3,
     revenue: 8,
    },
   }],
   trafficSources: [{
    source: "YT_SEARCH",
    title: "YouTube Search",
    views: 120,
    watchTime: 6,
    engagedViews: 80,
    impressions: 500,
    ctr: 0.12,
   }],
   geography: [{ country: "US", views: 90, watchTime: 5 }],
   cities: [{ country: "US", city: "New York", views: 40, watchTime: 2 }],
  })

  const props = buildVtSyncVisualPropsData(snapshot)
  const trafficMetric = props.canonicalContext.trafficRows[0].metrics as Record<string, { value: number | null }>
  const countryMetric = props.canonicalContext.geographyRows[0].metrics as Record<string, { value: number | null }>

  expect(trafficMetric.views.value).toBe(120)
  expect(trafficMetric.watchHours.value).toBe(6)
  expect(countryMetric.views.value).toBe(90)
  expect(props.canonicalContext.geographyRows.map((row) => row.geographyLabel)).toEqual(["US", "New York"])
 })

 it("builds non-empty visual datasets from VT-SYNC rows without upload-cache fallbacks", () => {
  const snapshot = normalizeVtSyncSnapshot({
   source: "vt-sync",
   channelId: "channel-1",
   videos: [{
    id: "video-1",
    title: "A real video",
    publishedAt: "2026-07-01T12:00:00.000Z",
    privacyStatus: "public",
    format: "long",
    metrics: {
     views: 400,
     watchTime: 50,
     engagedViews: 250,
     subscribersGained: 12,
     subscribersLost: 3,
     revenue: 8,
    },
   }],
   trafficSources: [{ source: "YT_SEARCH", title: "YouTube Search", views: 120, watchTime: 6 }],
   geography: [{ country: "US", views: 90, watchTime: 5 }],
  })
  const props = buildVtSyncVisualPropsData(snapshot)
  const dataset = buildTubeExplorerVisualData(
   props.rows,
   props.csvFiles,
   props.canonicalContext.trafficRows,
   props.canonicalContext.geographyRows,
  )

  expect(dataset.coverage).toMatchObject({ hasVideos: true, hasTraffic: true, hasGeography: true })
  expect(dataset.traffic[0]).toMatchObject({ sourceTitle: "YouTube Search", views: 120, watchHours: 6 })
  expect(dataset.geography[0]).toMatchObject({ label: "US", views: 90, watchHours: 5 })
 expect(dataset.videos[0]).toMatchObject({ subscribersGained: 12, subscribersLost: 3, subscribersNet: 9 })
 expect(dataset.videos[0].valueScore).toBeGreaterThan(0)
 })

 it("carries YouTube Playlist Saves through the VT-SYNC visual bridge", () => {
  const snapshot = normalizeVtSyncSnapshot({
   source: "vt-sync",
   channelId: "channel-1",
   videos: [{
    id: "video-1",
    title: "Saved video",
    privacyStatus: "public",
    format: "long",
    metrics: {
     views: 100,
     videosAddedToPlaylists: 7,
    },
   }],
  })

  const props = buildVtSyncVisualPropsData(snapshot)
  const dataset = buildTubeExplorerVisualData(props.rows)

  expect(dataset.videos[0].saves).toBe(7)
 })
})
