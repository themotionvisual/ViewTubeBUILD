import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { compressMediaForAnalysis } from "../analysisCompression"

describe("compressMediaForAnalysis", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MEDIA_API_BASE", "http://localhost:3000")
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("returns compression metadata and blob on success", async () => {
    const blob = new Blob(["tiny"], { type: "video/mp4" })
    ;(fetch as any).mockResolvedValueOnce(
      new Response(blob, {
        status: 200,
        headers: {
          "X-VT-Original-Bytes": "1000",
          "X-VT-Compressed-Bytes": "200",
          "X-VT-Reduction-Ratio": "0.8",
          "X-VT-Mime-Type": "video/mp4",
        },
      }),
    )

    const file = new File(["big-file"], "clip.mp4", { type: "video/mp4" })
    const result = await compressMediaForAnalysis(file)

    expect(result.originalBytes).toBe(1000)
    expect(result.compressedBytes).toBe(200)
    expect(result.reductionRatio).toBe(0.8)
    expect(result.mimeType).toBe("video/mp4")
    expect(result.compressionProfile).toBe("ultra_small_v1")
  })

  it("throws actionable error on server failure", async () => {
    ;(fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "COMPRESSED_FILE_TOO_LARGE" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const file = new File(["big-file"], "clip.mp4", { type: "video/mp4" })
    await expect(compressMediaForAnalysis(file)).rejects.toThrow("COMPRESSED_FILE_TOO_LARGE")
  })
})
