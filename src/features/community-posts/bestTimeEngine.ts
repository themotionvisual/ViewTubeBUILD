// Best-time engine — derives ranked (day, hour) publish windows from live
// analytics data. Consumed by Community Post Studio's schedule picker and
// by the weekly/monthly plan generators.

export type PostWindow = { day: number; hour: number; score: number; reason: string }

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Pulls day-of-week/hour buckets from top-quintile videos' publish times +
// dailyMetrics view peaks. When both are empty falls back to a generic
// creator best-practice heuristic (Tue/Thu/Sat evenings).
export const computeBestPostWindows = (
  videos: Array<Record<string, any>> = [],
  dailyMetrics: Array<Record<string, any>> = [],
  topN = 5,
): { best: PostWindow[]; worst: PostWindow[] } => {
  const bucket = new Map<string, { day: number; hour: number; score: number; reasons: string[] }>()
  const bump = (day: number, hour: number, add: number, reason: string) => {
    const key = `${day}:${hour}`
    const cur = bucket.get(key) || { day, hour, score: 0, reasons: [] }
    cur.score += add
    if (!cur.reasons.includes(reason)) cur.reasons.push(reason)
    bucket.set(key, cur)
  }

  // 1. Top-quintile videos by view count → publish window contributes.
  const scored = videos
    .map((v) => ({ v, views: Number(v.viewCount ?? v.views ?? v.metrics?.views ?? 0) }))
    .filter((r) => Number.isFinite(r.views))
    .sort((a, b) => b.views - a.views)
  const topSlice = scored.slice(0, Math.max(3, Math.floor(scored.length / 5)))
  for (const { v } of topSlice) {
    const ts = v.publishedAt ? new Date(v.publishedAt).getTime() : NaN
    if (!Number.isFinite(ts)) continue
    const d = new Date(ts)
    bump(d.getDay(), d.getHours(), 20, "top video published here")
  }

  // 2. dailyMetrics — reward days that historically pull the most views.
  const dayTotals = new Map<number, number>()
  for (const row of dailyMetrics) {
    const rawDate = row.day ?? row.date ?? row.Day ?? row.Date
    if (!rawDate) continue
    const d = new Date(String(rawDate))
    if (!Number.isFinite(d.getTime())) continue
    const views = Number(row.views ?? row.Views ?? 0)
    if (views <= 0) continue
    dayTotals.set(d.getDay(), (dayTotals.get(d.getDay()) || 0) + views)
  }
  const dayMax = Math.max(1, ...dayTotals.values())
  for (const [day, total] of dayTotals.entries()) {
    const strength = (total / dayMax) * 15
    // Spread across common creator prime hours (17-21) for the day.
    for (const h of [17, 18, 19, 20, 21]) bump(day, h, strength, "high-view day")
  }

  // 3. Baseline: creator best-practice evening peaks so the widget still
  //    returns useful windows when analytics is empty.
  const baselineWindows: Array<[number, number]> = [
    [2, 18], [4, 18], [6, 11],    // Tue/Thu 6pm, Sat 11am — text-post peaks
    [0, 19], [5, 17], [3, 12],
  ]
  for (const [day, hour] of baselineWindows) bump(day, hour, 8, "baseline evening peak")

  const rows = [...bucket.values()].map((b) => ({
    day: b.day,
    hour: b.hour,
    score: Math.round(b.score),
    reason: b.reasons.join(" · "),
  }))
  rows.sort((a, b) => b.score - a.score)
  const best = rows.slice(0, topN)
  const worst = rows.slice(-3).reverse()
  return { best, worst }
}

export const formatWindow = (w: PostWindow): string => {
  const dayLabel = DAY_LABELS[w.day % 7]
  const h12 = ((w.hour + 11) % 12) + 1
  const ampm = w.hour < 12 ? "am" : "pm"
  return `${dayLabel} ${h12}${ampm}`
}

// Distribute N posts across best windows without repeating a slot and
// respecting ≥ 18h spacing and ≤ 4/day. Used by weekly/monthly planners.
export const distributeAcrossWindows = (
  posts: number,
  windows: PostWindow[],
  now = Date.now(),
): Array<{ ts: number; window: PostWindow }> => {
  if (windows.length === 0) return []
  const result: Array<{ ts: number; window: PostWindow }> = []
  const perDay = new Map<string, number>()
  const nextOccurrence = (w: PostWindow, after: number): number => {
    const d = new Date(after)
    // walk forward day by day until we hit the target weekday
    for (let i = 0; i < 14; i++) {
      const cand = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, w.hour, 0, 0, 0)
      if (cand.getTime() > after && cand.getDay() === w.day) return cand.getTime()
    }
    return after + 24 * 3600 * 1000
  }

  let cursor = now
  for (let i = 0; i < posts; i++) {
    const w = windows[i % windows.length]
    let ts = nextOccurrence(w, cursor)
    const dayKey = new Date(ts).toISOString().slice(0, 10)
    // Respect ≤ 4/day.
    while ((perDay.get(dayKey) || 0) >= 4) {
      ts = nextOccurrence(w, ts + 24 * 3600 * 1000)
    }
    perDay.set(new Date(ts).toISOString().slice(0, 10), (perDay.get(dayKey) || 0) + 1)
    result.push({ ts, window: w })
    // Advance cursor by 18h so we never schedule tighter than that.
    cursor = ts + 18 * 3600 * 1000
  }
  return result
}
