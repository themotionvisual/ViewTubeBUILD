import { describe, expect, it } from "vitest"
import { normalizeVtSyncSnapshot } from "../../features/vt-sync-local/adapters/snapshot"
import { buildAIBrainEvidencePack } from "../aiBrainCommandInterface"

describe("buildAIBrainEvidencePack", () => {
 it("projects canonical evidence into the Brain Hub display contract", () => {
  const snapshot = normalizeVtSyncSnapshot({
   source: "vt_sync",
   channelId: "channel-1",
   channelName: "Example channel",
   channelDescription: "A channel about practical craft.",
   videos: [{
    id: "video-1",
    title: "A practical example",
    publishedAt: "2026-09-20",
    metrics: { views: 1200 },
   }],
   searchTerms: [{ term: "practical craft", views: 120 }],
   syncManifest: { stop_reason: "completed" },
  })

  const pack = buildAIBrainEvidencePack("Give me a strategy read", snapshot)

  expect(pack.items.map((item) => item.id)).toEqual(expect.arrayContaining([
   "video:video-1",
   "search:practical-craft",
  ]))
  expect(pack.items.every((item) => item.label && item.source)).toBe(true)
 })
})
