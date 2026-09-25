export interface ShortsMultiplierPlanInput {
  sourceId: string
  sourceTitle: string
  variantCount: number
  maxTrimFrames: number
  intervalDays: number
  scheduleStart: string
}

export interface ShortsMultiplierVariant {
  id: string
  ordinal: number
  trimStartFrames: number
  trimEndFrames: number
  scheduledAt: string
  filename: string
}

export interface ShortsMultiplierPlan {
  sourceId: string
  sourceTitle: string
  variantCount: number
  maxTrimFrames: number
  intervalDays: number
  scheduleStart: string
  variants: ShortsMultiplierVariant[]
}

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)))

const safeBaseName = (title: string) =>
  title
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "short"

const buildTrimPairs = (maxTrimFrames: number): Array<[number, number]> => {
  const pairs: Array<[number, number]> = []
  for (let total = 1; total <= maxTrimFrames * 2; total += 1) {
    for (let start = Math.min(total, maxTrimFrames); start >= 0; start -= 1) {
      const end = total - start
      if (end < 0 || end > maxTrimFrames) continue
      if (start === 0 && end === 0) continue
      pairs.push([start, end])
    }
  }
  return pairs
}

export const buildShortsMultiplierPlan = (input: ShortsMultiplierPlanInput): ShortsMultiplierPlan => {
  const variantCount = clampInt(input.variantCount, 2, 10)
  const maxTrimFrames = clampInt(input.maxTrimFrames, 1, 10)
  const intervalDays = clampInt(input.intervalDays, 2, 60)
  const scheduleStart = new Date(input.scheduleStart)
  const startMs = Number.isNaN(scheduleStart.getTime()) ? Date.now() : scheduleStart.getTime()
  const pairs = buildTrimPairs(maxTrimFrames).slice(0, variantCount)
  const base = safeBaseName(input.sourceTitle)

  return {
    sourceId: input.sourceId,
    sourceTitle: input.sourceTitle,
    variantCount,
    maxTrimFrames,
    intervalDays,
    scheduleStart: new Date(startMs).toISOString(),
    variants: pairs.map(([trimStartFrames, trimEndFrames], index) => ({
      id: `${input.sourceId}:shorts-multiplier:${index + 1}`,
      ordinal: index + 1,
      trimStartFrames,
      trimEndFrames,
      scheduledAt: new Date(startMs + index * intervalDays * 86_400_000).toISOString(),
      filename: `${base}-multiplier-${String(index + 1).padStart(2, "0")}-s${trimStartFrames}-e${trimEndFrames}.mp4`,
    })),
  }
}
