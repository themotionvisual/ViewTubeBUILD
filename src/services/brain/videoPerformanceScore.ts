/**
 * Shared video performance scoring for every Brain surface.
 *
 * This exists because ranking "the channel's best video" was previously done in two
 * places with the same three defects:
 *
 * 1. Rate metrics were added raw while volume metrics were log-compressed. Since
 *    "average percentage viewed" can exceed 100% on Shorts replays (real channels
 *    report values above 2,000%), a single retention figure could outweigh every
 *    other signal combined and crown a video nobody watched.
 * 2. Rate metrics were trusted regardless of sample size, so 100% retention from
 *    32 views ranked above solid retention from 30,000 views.
 * 3. Nothing accounted for age, so a years-old outlier could outrank a full year of
 *    current uploads that the creator can actually learn from.
 */

export type VideoPerformanceInput = {
 views?: number | null
 watchTime?: number | null
 subscribers?: number | null
 revenue?: number | null
 /** Click-through rate, accepted as either a 0-1 fraction or a 0-100 percentage. */
 ctr?: number | null
 /** Average percentage viewed, same dual format. Values above 100 are replay loops. */
 retention?: number | null
 publishedAt?: string | null
}

const numeric = (value: unknown): number =>
 typeof value === "number" && Number.isFinite(value) ? value : 0

/**
 * Rate metrics arrive as either 0-1 fractions or 0-100 percentages, and Shorts
 * replays push retention far past 100. Normalize to 0-100 and cap it: "watched the
 * whole thing" is the strongest meaningful signal, and a 2,000% replay loop is not
 * twenty times better than that.
 */
export const normalizeRateMetric = (value: unknown): number => {
 const raw = numeric(value)
 if (raw <= 0) return 0
 return Math.min(100, raw <= 1 ? raw * 100 : raw)
}

/**
 * A rate is only as trustworthy as the traffic behind it. This shrinks a rate's
 * contribution toward zero when the view count is too small to mean anything.
 */
export const RATE_RELIABILITY_VIEWS = 250

export const rateReliability = (views: number): number =>
 views > 0 ? views / (views + RATE_RELIABILITY_VIEWS) : 0

/** Below this floor an all-time winner would vanish entirely, which is also wrong. */
export const RECENCY_WEIGHT_FLOOR = 0.25

/**
 * Full weight through roughly the first six months, then a smooth decay. A video
 * from the last year stays highly rankable; a four-year-old outlier is damped to
 * near the floor.
 */
export const videoRecencyWeight = (
 publishedAt: string | null | undefined,
 now: number = Date.now(),
): number => {
 const raw = String(publishedAt || "").trim()
 if (!raw) return 0.6
 const published = Date.parse(raw)
 if (!Number.isFinite(published)) return 0.6
 const ageYears = Math.max(0, (now - published) / (365 * 24 * 60 * 60 * 1000))
 return Math.max(RECENCY_WEIGHT_FLOOR, 1 / (1 + 0.75 * Math.max(0, ageYears - 0.5)))
}

/**
 * Reach (how many people it actually got to) is log-compressed and dominant.
 * Quality (how well it held them) refines the ranking between comparable videos
 * instead of overturning it. Recency then favors work the creator can still act on.
 */
export const scoreVideoPerformance = (
 input: VideoPerformanceInput,
 now: number = Date.now(),
): number => {
 const views = numeric(input.views)
 const reliability = rateReliability(views)

 const reach =
  Math.log10(views + 1) * 8 +
  Math.log10(numeric(input.watchTime) + 1) * 5 +
  Math.log10(Math.abs(numeric(input.subscribers)) + 1) * 4 +
  Math.log10(numeric(input.revenue) + 1) * 3

 const quality =
  (normalizeRateMetric(input.retention) / 100) * 8 * reliability +
  (normalizeRateMetric(input.ctr) / 100) * 6 * reliability

 return (reach + quality) * videoRecencyWeight(input.publishedAt, now)
}
