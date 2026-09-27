// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import type { AssetModelRunner } from "./AssetGenerator"
import {
  analyzeLongformThumbnail,
  resolveThumbnailMediaDataUrl,
} from "./longformThumbnailAnalysis"

describe("Longform thumbnail vision", () => {
  it("preserves an existing image data URL as model media", async () => {
    const media = "data:image/png;base64,ZmFrZQ=="
    await expect(resolveThumbnailMediaDataUrl(media)).resolves.toBe(media)
  })

  it("creates governed visual evidence for concept, contents, style and composition", async () => {
    let mediaAttachments: string[] | undefined
    const runner = (async (call) => {
      mediaAttachments = call.mediaAttachments
      return {
        output: {
          concept: "Napoleon isolated against battlefield smoke",
          subjects: ["Napoleon", "soldiers", "smoke"],
          style: "cinematic historical",
          composition: "single dominant figure with depth layers",
          visibleText: "AUSTERLITZ",
          visualHierarchy: "face first, text second, troops third",
          emotionalTone: "urgent and triumphant",
          promiseAlignment: "Matches a decisive-battle history story",
          notes: ["Strong single focal point"],
        },
      }
    }) as AssetModelRunner

    const result = await analyzeLongformThumbnail({
      channelId: "channel-1",
      videoId: "video-1",
      title: "Napoleon at Austerlitz",
      description: "How Napoleon defeated the Third Coalition.",
      tags: ["napoleon", "austerlitz"],
      thumbnailUrl: "data:image/png;base64,ZmFrZQ==",
      runner,
    })

    expect(mediaAttachments).toEqual(["data:image/png;base64,ZmFrZQ=="])
    expect(result.analysis.status).toBe("ready")
    expect(result.analysis.concept).toContain("Napoleon")
    expect(result.analysis.subjects).toContain("soldiers")
    expect(result.analysis.style).toBe("cinematic historical")
    expect(result.analysis.composition).toContain("dominant figure")
    expect(result.analysis.evidenceId).toBe(result.record.id)
  })
})
