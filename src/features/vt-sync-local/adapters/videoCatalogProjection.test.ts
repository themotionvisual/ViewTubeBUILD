import { describe, expect, it } from "vitest"

import type { VtSyncVideoInventoryRecord, VtSyncVideoItem } from "./contracts"
import { buildVtSyncVideoCatalogProjection } from "./videoCatalogProjection"

const inventoryRow = (videoId: string): VtSyncVideoInventoryRecord => ({
 id: `channel::${videoId}`,
 channelId: "channel",
 videoId,
 uploadsPlaylistId: "uploads",
 firstSeenAt: "2026-08-14T00:00:00.000Z",
 lastSeenAt: "2026-08-14T00:00:00.000Z",
 firstInventoryRunId: "run",
 lastInventoryRunId: "run",
})

describe("VT-SYNC video catalog projection", () => {
 it("keeps every inventory video when metadata and analytics coverage are partial", () => {
  const inventory = Array.from({ length: 1_446 }, (_, index) => inventoryRow(`video-${index + 1}`))
  const persisted = Array.from({ length: 1_442 }, (_, index) => ({
   id: `video-${index + 1}`,
   title: `Video ${index + 1}`,
   thumbnail: `https://img.example/${index + 1}.jpg`,
  }))
  const live = Array.from({ length: 1_388 }, (_, index) => ({
   id: `video-${index + 1}`,
   title: `Video ${index + 1}`,
   metrics: { views: index + 1 },
   metricProvenance: { views: "youtube_analytics_v2" },
  })) as VtSyncVideoItem[]

  const projection = buildVtSyncVideoCatalogProjection({
   inventoryRows: inventory,
   persistedRows: persisted,
   liveRows: live,
   importedRows: [],
  })

  expect(projection.rows).toHaveLength(1_446)
  expect(projection.coverage).toMatchObject({
   catalogTotal: 1_446,
   metadataAvailable: 1_442,
   analyticsAvailable: 1_388,
   importOnly: 0,
   unresolvedImports: 0,
  })
  expect(projection.rows.at(-1)).toMatchObject({
   id: "video-1446",
   title: "Metadata pending",
  })
 })

 it("supplements matching API rows without letting a smaller import replace the catalog", () => {
  const inventory = Array.from({ length: 100 }, (_, index) => inventoryRow(`video-${index + 1}`))
  const live = inventory.map((row) => ({
   id: row.videoId,
   title: `API ${row.videoId}`,
   metrics: { views: 10 },
  })) as VtSyncVideoItem[]
  const imported = Array.from({ length: 77 }, (_, index) => ({
   videoId: `video-${index + 1}`,
   title: `CSV ${index + 1}`,
   descriptionSnippet: `Imported description ${index + 1}`,
   views: 999,
  }))

  const projection = buildVtSyncVideoCatalogProjection({
   inventoryRows: inventory,
   persistedRows: [],
   liveRows: live,
   importedRows: imported,
  })

  expect(projection.rows).toHaveLength(100)
  expect(projection.rows[0]).toMatchObject({
   id: "video-1",
   title: "API video-1",
   descriptionSnippet: "Imported description 1",
   metrics: { views: 10 },
  })
 })

 it("keeps valid unmatched imports separate and reports invalid identities", () => {
  const projection = buildVtSyncVideoCatalogProjection({
   inventoryRows: [inventoryRow("api-video")],
   persistedRows: [],
   liveRows: [{ id: "api-video", title: "API Video" }],
   importedRows: [
    { videoId: "import-only", title: "Imported Video" },
    { videoId: "-", title: "No identity" },
   ],
  })

  expect(projection.rows).toHaveLength(2)
  expect(projection.rows[1]).toMatchObject({
   id: "import-only",
   catalogProvenance: "import_only",
  })
  expect(projection.coverage).toMatchObject({ importOnly: 1, unresolvedImports: 1 })
 })
})
