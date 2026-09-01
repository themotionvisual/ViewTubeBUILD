export type ThumbnailTitleLayout = {
  lines: [string, string]
  fontSize: number
}

export const THUMBNAIL_TITLE_MAX_SIZE = 15
export const THUMBNAIL_TITLE_BASE_SIZE = 11
export const THUMBNAIL_TITLE_MIN_SIZE = 6
export const THUMBNAIL_TITLE_LETTER_SPACING_EM = 0.034
// Default (max) size deliberately large — AutoFitCommentBubble ratchets
// this down via the findLargestFittingFontSize search only when the comment
// cannot fit inside the standard bubble beside the video card.
export const COMMENT_BUBBLE_MAX_SIZE = 34
export const COMMENT_BUBBLE_MIN_SIZE = 10

export const findLargestFittingFontSize = (
  fits: (fontSize: number) => boolean,
  { min = 8, max = 18, step = 0.25 }: { min?: number; max?: number; step?: number } = {},
) => {
  for (let fontSize = max; fontSize >= min; fontSize = Number((fontSize - step).toFixed(2))) {
    if (fits(fontSize)) return fontSize
  }
  return min
}

/** Finds the largest word-safe two-band setting that fits the measured card. */
export const fitThumbnailTitle = (
  input: string,
  availableWidth: number,
  measureText: (value: string, fontSize: number) => number = (value, fontSize) => value.length * fontSize * 0.58,
): ThumbnailTitleLayout => {
  const title = input.replace(/\s+/g, " ").trim()
  if (!title) return { lines: ["UNTITLED", "VIDEO"], fontSize: THUMBNAIL_TITLE_BASE_SIZE }

  const words = title.split(" ")
  if (words.length === 1) {
    const fontSize = findLargestFittingFontSize(
      (candidate) => measureText(title, candidate) <= availableWidth,
      { min: THUMBNAIL_TITLE_MIN_SIZE, max: THUMBNAIL_TITLE_MAX_SIZE },
    )
    return { lines: [title, "\u00a0"], fontSize }
  }

  let fallback: ThumbnailTitleLayout = {
    lines: [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")],
    fontSize: THUMBNAIL_TITLE_MIN_SIZE,
  }
  for (let fontSize = THUMBNAIL_TITLE_MAX_SIZE; fontSize >= THUMBNAIL_TITLE_MIN_SIZE; fontSize -= 0.25) {
    const candidates = words.slice(1).map((_, index) => {
      const first = words.slice(0, index + 1).join(" ")
      const second = words.slice(index + 1).join(" ")
      return {
        lines: [first, second] as [string, string],
        balance: Math.abs(first.length - second.length),
        widest: Math.max(measureText(first, fontSize), measureText(second, fontSize)),
      }
    }).filter(candidate => candidate.widest <= availableWidth)

    if (candidates.length) {
      candidates.sort((a, b) => a.balance - b.balance || a.widest - b.widest)
      return { lines: candidates[0].lines, fontSize }
    }
    if (fontSize === THUMBNAIL_TITLE_MIN_SIZE && words.length > 1) {
      const middle = Math.ceil(words.length / 2)
      fallback = { lines: [words.slice(0, middle).join(" "), words.slice(middle).join(" ")], fontSize }
    }
  }
  return fallback
}

export const formatCommentTimestamp = (value?: string, now = new Date()) => {
  const date = new Date(value || "")
  if (Number.isNaN(date.getTime())) return { absolute: "DATE UNAVAILABLE", dateLabel: "DATE UNAVAILABLE", meridiem: "", relative: "" }
  const hour = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const meridiem = hour >= 12 ? "PM" : "AM"
  const dateLabel = `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)} ${hour % 12 || 12}:${minutes}`
  const absolute = `${dateLabel}${meridiem}`
  const base = { absolute, dateLabel, meridiem }
  if (date.getTime() > now.getTime()) return { ...base, relative: "NOW" }
  const elapsedMs = Math.max(0, now.getTime() - date.getTime())
  const elapsedHours = Math.floor(elapsedMs / 3_600_000)
  const isSameDay = now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()
  if (isSameDay && elapsedHours < 2) return { ...base, relative: "NOW" }
  if (isSameDay) return { ...base, relative: `${elapsedHours} HOURS AGO` }
  const elapsedDays = Math.max(0, Math.round((
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ) / 86_400_000))
  if (elapsedDays === 1) return { ...base, relative: "YESTERDAY" }
  if (elapsedDays < 14) return { ...base, relative: `${elapsedDays} DAYS AGO` }
  const elapsedWeeks = Math.floor(elapsedDays / 7)
  if (elapsedWeeks <= 4) return { ...base, relative: `${elapsedWeeks} WEEKS AGO` }
  const elapsedMonths = Math.floor(elapsedDays / 30)
  if (elapsedMonths < 12) return { ...base, relative: `${elapsedMonths} MONTHS AGO` }
  return { ...base, relative: `${Math.floor(elapsedDays / 365)} YEARS AGO` }
}
