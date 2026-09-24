import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { BrainRuntimePanel } from "./BrainRuntimePanel"

describe("BrainRuntimePanel", () => {
 it("renders the live backend pipeline without turning it into a developer-only dump", () => {
  const html = renderToStaticMarkup(
   <BrainRuntimePanel
    snapshot={{
     project: { id: "project-2", name: "Austerlitz package", status: "active" },
     build: {
      id: "cb:project:project-2",
      stage: "package",
      revision: 7,
      assetCount: 8,
      versionCount: 6,
      variantGroupCount: 1,
      relationCount: 3,
      selectedSlotCount: 4,
      eventCount: 19,
      youtubeStatus: "scheduled",
      blockerCount: 0,
     },
     generation: {
      requestCount: 4,
      receiptCount: 4,
      latestRequest: {
       id: "generation_request_1",
       toolId: "video-publisher",
       operation: "generate-package",
       targetSlot: "title",
       mode: "new-option",
       contextManifestId: "context-1",
       contextRevision: 7,
       requestedAt: "2026-09-24T05:01:00.000Z",
       requestedSlotCount: 5,
       selectedAssetCount: 1,
       sourceAssetCount: 1,
       evidenceCount: 2,
      },
      latestReceipt: {
       id: "tool_receipt_1",
       requestId: "generation_request_1",
       toolId: "video-publisher",
       completedAt: "2026-09-24T05:01:02.000Z",
       outputAssetCount: 6,
       versionCount: 6,
       relationshipCount: 1,
       variantGroupId: "variant-group-1",
       generationRecordId: "generation-record-1",
      },
     },
     brain: {
      capabilityCount: 14,
      traceCount: 5,
      latestTrace: {
       id: "trace-1",
       kind: "asset",
       status: "complete",
       intent: "content_generation",
       capabilityCount: 1,
       evidenceReturned: 2,
       evidenceMissing: 0,
       latencyMs: 820,
       modelServed: "gemini-2.5-pro",
       promptVersionCount: 2,
       repairAttempts: 0,
       gradeAverage: 96,
       outputRef: "generation-record-1",
      },
     },
     outcomes: {
      total: 8,
      accepted: 6,
      negative: 2,
      acceptanceRate: 75,
      completed: 4,
      corrected: 1,
      rejected: 1,
      abandoned: 0,
     },
     lifecycle: {
      latestEventType: "publish.transaction.completed",
      latestEventAt: "2026-09-24T05:02:00.000Z",
      publishEventCount: 3,
      analyticsCheckpointCount: 2,
      commentEventCount: 1,
      experimentEventCount: 0,
      learningEventCount: 1,
     },
    }}
   />,
  )

  expect(html).toContain("LIVE BRAIN RUNTIME")
  expect(html).toContain("Project")
  expect(html).toContain("ContentBuild")
  expect(html).toContain("Context")
  expect(html).toContain("Generation")
  expect(html).toContain("Receipt")
  expect(html).toContain("Brain Trace")
  expect(html).toContain("Austerlitz package")
  expect(html).toContain("Video Publisher")
  expect(html).toContain("Gemini 2.5 Pro")
  expect(html).toContain("75%")
 })

 it("supports the flat embedded composition used by the Brain Hub mobile surface", () => {
  const html = renderToStaticMarkup(
   <BrainRuntimePanel
    embedded
    snapshot={{
     project: null,
     build: null,
     generation: { requestCount: 0, receiptCount: 0, latestRequest: null, latestReceipt: null },
     brain: { capabilityCount: 14, traceCount: 0, latestTrace: null },
     outcomes: { total: 0, accepted: 0, negative: 0, acceptanceRate: 0, completed: 0, corrected: 0, rejected: 0, abandoned: 0 },
     lifecycle: { latestEventType: null, latestEventAt: null, publishEventCount: 0, analyticsCheckpointCount: 0, commentEventCount: 0, experimentEventCount: 0, learningEventCount: 0 },
    }}
   />,
  )

  expect(html).toContain('data-vt-brain-runtime-shell="merged"')
  expect(html).not.toContain("LIVE BRAIN RUNTIME")
  expect(html).toContain('data-vt-runtime-cell="compact"')
  expect(html).toContain("md:flex")
 })
})
