// Veo client shim.
//
// Real Veo access lands with the video-generation service (not yet wired
// into the app). Until then this shim returns deterministic stub URIs
// so the widget's timeline, trim, and editor-handoff flow can be
// validated end-to-end without external calls.
//
// When the real client lands, replace the body of `generateShortClip`
// with the actual generateVideo() call and keep the return shape.

export type VeoClipRequest = {
  prompt: string
  durationSec: number   // 1..8
  aspect?: "9:16" | "1:1" | "16:9"
  seed?: number
}

export type VeoClipResult = {
  videoUrl?: string         // playable video URL (blob:, https:, or data:)
  posterUrl?: string        // preview poster image
  durationSec: number
  meta: { model: string; prompt: string; stub?: true }
}

const stubPoster = (prompt: string, dur: number): string => {
  const hue = Math.abs([...prompt].reduce((a, c) => (a * 33 + c.charCodeAt(0)) | 0, 7)) % 360
  const label = prompt.split(/\s+/).slice(0, 3).join(" ").toUpperCase().slice(0, 22)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 320'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='hsl(${hue},80%,58%)'/>
      <stop offset='1' stop-color='hsl(${(hue + 42) % 360},80%,42%)'/>
    </linearGradient></defs>
    <rect width='180' height='320' fill='url(%23g)'/>
    <text x='90' y='168' text-anchor='middle' font-family='sans-serif' font-size='13' font-weight='900' fill='#050505'>${label}</text>
    <text x='90' y='186' text-anchor='middle' font-family='sans-serif' font-size='10' font-weight='800' fill='#050505'>${dur}s</text>
  </svg>`
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23").replace(/\n/g, "")}`
}

export const generateShortClip = async (req: VeoClipRequest): Promise<VeoClipResult> => {
  // Simulated latency so the UI's generating state has time to render
  // and users can see the parallel "gen all" state resolve one-by-one.
  await new Promise((r) => setTimeout(r, 400 + Math.floor(Math.random() * 400)))
  return {
    posterUrl: stubPoster(req.prompt, req.durationSec),
    durationSec: Math.max(1, Math.min(8, req.durationSec)),
    meta: { model: "veo-stub", prompt: req.prompt, stub: true },
  }
}
