import type {
  AudioAcquisitionResult,
  PublishedVideoContext,
  TranscriptAcquisitionResult,
} from "../types"

type YouTubeAcquireResponse = {
  ok: boolean
  metadata?: Partial<PublishedVideoContext>
  transcript?: TranscriptAcquisitionResult
  audio?: AudioAcquisitionResult
  error?: string
  message?: string
}

const localApiBase =
  typeof window !== "undefined" &&
  window.location?.hostname &&
  /^(localhost|127(?:\.\d+){3})$/i.test(window.location.hostname)
    ? "http://localhost:3000"
    : ""

const resolveApiBases = (): string[] => {
  const out: string[] = []
  const envBase = (import.meta.env?.VITE_MEDIA_API_BASE as string | undefined)?.trim()
  const billingBase = (import.meta.env?.VITE_BILLING_API_BASE as string | undefined)?.trim()
  const originBase =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : ""

  for (const base of [envBase, billingBase, localApiBase, originBase]) {
    if (!base) continue
    const normalized = base.replace(/\/$/, "")
    if (!out.includes(normalized)) out.push(normalized)
  }
  return out
}

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

export const acquireYouTubeAssets = async (input: {
  videoId?: string
  videoUrl?: string
  includeAudioBase64?: boolean
}): Promise<YouTubeAcquireResponse> => {
  const apiBases = resolveApiBases()
  if (apiBases.length === 0) {
    throw new Error("Media API base is not configured. Set VITE_MEDIA_API_BASE.")
  }

  let lastError = "Unavailable"
  for (const apiBase of apiBases) {
    try {
      const response = await fetch(`${apiBase}/api/youtube/acquire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })
      const payload = await parseJsonSafely<YouTubeAcquireResponse>(response)
      if (!response.ok) {
        lastError = payload?.message || payload?.error || `Request failed (${response.status})`
        if (response.status === 404) continue
        throw new Error(lastError)
      }
      if (!payload) throw new Error("YouTube acquisition returned no response.")
      return payload
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Network failure"
    }
  }

  throw new Error(`YouTube acquisition endpoint is offline. Last error: ${lastError}`)
}
