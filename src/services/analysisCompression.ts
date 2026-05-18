export interface AnalysisCompressionResult {
  file: Blob
  originalBytes: number
  compressedBytes: number
  reductionRatio: number
  mimeType: string
  durationSec?: number
  compressionProfile: "ultra_small_v1"
}

const resolveMediaApiBases = (): string[] => {
  const out: string[] = []
  const envBase = (import.meta.env?.VITE_MEDIA_API_BASE as string | undefined)?.trim()
  const billingBase = (import.meta.env?.VITE_BILLING_API_BASE as string | undefined)?.trim()
  const originBase =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : ""

  for (const base of [envBase, billingBase, originBase]) {
    if (!base) continue
    const normalized = base.replace(/\/$/, "")
    if (!out.includes(normalized)) out.push(normalized)
  }
  return out
}

export const compressMediaForAnalysis = async (file: File): Promise<AnalysisCompressionResult> => {
  const apiBases = resolveMediaApiBases()
  if (apiBases.length === 0) {
    throw new Error("Media API base is not configured. Set VITE_MEDIA_API_BASE.")
  }

  const form = new FormData()
  form.append("mode", "analysis")
  form.append("file", file)
  let lastError: string | null = null

  for (const apiBase of apiBases) {
    let response: Response
    try {
      response = await fetch(`${apiBase}/api/media/compress-analysis`, {
        method: "POST",
        body: form,
      })
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Network failure"
      continue
    }

    if (!response.ok) {
      let message = `Compression failed (${response.status}).`
      try {
        const payload = await response.json()
        if (payload?.error === "COMPRESSED_FILE_TOO_LARGE") {
          const maxOutBytes = Number(payload?.maxOutputBytes || 0)
          const maxOutMb = maxOutBytes > 0 ? Math.round(maxOutBytes / 1024 / 1024) : null
          message = maxOutMb
            ? `Compressed file is still too large for analysis (${maxOutMb}MB max). Use a shorter source clip and retry.`
            : "Compressed file is still too large for analysis. Use a shorter source clip and retry."
        } else if (payload?.message) {
          message = String(payload.message)
        } else if (payload?.error) {
          message = String(payload.error)
        }
      } catch {}
      lastError = message
      // 404 on one base may still succeed on another base (for example window origin vs API origin).
      if (response.status === 404) continue
      throw new Error(message)
    }

    const blob = await response.blob()
    const originalBytes = Number(response.headers.get("X-VT-Original-Bytes") || file.size)
    const compressedBytes = Number(response.headers.get("X-VT-Compressed-Bytes") || blob.size)
    const reductionRatio = Number(response.headers.get("X-VT-Reduction-Ratio") || "0")
    const mimeType = response.headers.get("X-VT-Mime-Type") || blob.type || "video/mp4"

    return {
      file: blob,
      originalBytes,
      compressedBytes,
      reductionRatio,
      mimeType,
      compressionProfile: "ultra_small_v1",
    }
  }

  throw new Error(
    `Analysis compressor is offline. Start the API server (for example: npm run billing:dev) or set VITE_MEDIA_API_BASE. Last error: ${lastError || "Unavailable"}`,
  )
}
