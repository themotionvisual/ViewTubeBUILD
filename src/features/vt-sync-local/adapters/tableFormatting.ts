import type { VtSyncTableColumnDefinition } from "./contracts"

const isMissing = (value: unknown): boolean => value === null || value === undefined || value === ""

const stringifyStructuredValue = (value: unknown): string => {
 if (Array.isArray(value)) return value.map((entry) => stringifyStructuredValue(entry)).join(", ")
 if (value && typeof value === "object") return JSON.stringify(value)
 return String(value)
}

export type VtSyncDurationFormat = "duration" | "durationHours" | "durationMinutes"

export const parseVtSyncDurationSeconds = (
 value: unknown,
 format: VtSyncDurationFormat = "duration",
): number | undefined => {
 if (typeof value === "number" && Number.isFinite(value)) {
  if (format === "durationHours") return value * 3600
  if (format === "durationMinutes") return value * 60
  return value
 }
 if (typeof value !== "string" || !value.trim()) return undefined
 const trimmed = value.trim()
 const clock = trimmed.split(":").map(Number)
 if (clock.length > 1 && clock.every(Number.isFinite)) return clock.reduce((total, part) => total * 60 + part, 0)
 const iso = trimmed.match(/^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i)
 if (iso) return (Number(iso[1]) || 0) * 3600 + (Number(iso[2]) || 0) * 60 + (Number(iso[3]) || 0)
 const numeric = Number(trimmed.replace(/,/g, ""))
 if (!Number.isFinite(numeric)) return undefined
 if (format === "durationHours") return numeric * 3600
 if (format === "durationMinutes") return numeric * 60
 return numeric
}

export const formatVtSyncDurationSeconds = (seconds: number): string => {
 const rounded = Math.max(0, Math.round(seconds))
 const hours = Math.floor(rounded / 3600)
 const minutes = Math.floor((rounded % 3600) / 60)
 const remainder = rounded % 60
 return hours
  ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
  : `${minutes}:${String(remainder).padStart(2, "0")}`
}

export const formatVtSyncWatchTimeSeconds = (seconds: number): string => {
 const hours = Math.max(0, seconds) / 3600
 if (hours < 10_000) return formatVtSyncDurationSeconds(seconds)
 if (hours < 100_000) return `${(hours / 1_000).toFixed(2)}K h`
 if (hours < 1_000_000) return `${(hours / 1_000).toFixed(1)}K h`
 if (hours < 10_000_000) return `${(hours / 1_000_000).toFixed(3)}M h`
 if (hours < 100_000_000) return `${(hours / 1_000_000).toFixed(2)}M h`
 if (hours < 1_000_000_000) return `${(hours / 1_000_000).toFixed(1)}M h`
 return `${(hours / 1_000_000_000).toFixed(3)}B h`
}

export const parseVtSyncDateValue = (value: unknown): number | undefined => {
 if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.getTime()
 if (typeof value !== "string" || !value.trim()) return undefined
 const text = value.trim()
 const isoWeek = text.match(/^(\d{4})-W(\d{2})$/i)
 if (isoWeek) {
  const year = Number(isoWeek[1])
  const week = Number(isoWeek[2])
  const januaryFourth = new Date(Date.UTC(year, 0, 4))
  const monday = new Date(januaryFourth)
  monday.setUTCDate(januaryFourth.getUTCDate() - ((januaryFourth.getUTCDay() + 6) % 7) + ((week - 1) * 7))
  return monday.getTime()
 }
 const yearMonth = text.match(/^(\d{4})-(\d{2})$/)
 if (yearMonth) return Date.UTC(Number(yearMonth[1]), Number(yearMonth[2]) - 1, 1)
 const usDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)
 if (usDate) {
  const shortYear = Number(usDate[3])
  const year = usDate[3].length === 2 ? (shortYear >= 70 ? 1900 + shortYear : 2000 + shortYear) : shortYear
  return Date.UTC(year, Number(usDate[1]) - 1, Number(usDate[2]))
 }
 const parsed = Date.parse(text)
 return Number.isFinite(parsed) ? parsed : undefined
}

export const formatVtSyncDateValue = (value: unknown): string => {
 const timestamp = parseVtSyncDateValue(value)
 if (timestamp === undefined) return isMissing(value) ? "-" : String(value)
 return new Date(timestamp).toLocaleDateString("en-US", {
  month: "numeric",
  day: "numeric",
  year: "2-digit",
  timeZone: "UTC",
 })
}

export const formatVtSyncLocalDateValue = (value: unknown): string => {
 const timestamp = parseVtSyncDateValue(value)
 if (timestamp === undefined) return isMissing(value) ? "-" : String(value)
 return new Date(timestamp).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" })
}

export const formatVtSyncLocalWeekdayValue = (value: unknown): string => {
 const timestamp = parseVtSyncDateValue(value)
 if (timestamp === undefined) return isMissing(value) ? "-" : String(value)
 return new Date(timestamp).toLocaleDateString("en-US", { weekday: "long" })
}

export const formatVtSyncLocalTimeValue = (value: unknown): string => {
 const timestamp = parseVtSyncDateValue(value)
 if (timestamp === undefined) return isMissing(value) ? "-" : String(value)
 return new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export const formatVtSyncLocalMonthValue = (value: unknown): string => {
 const timestamp = parseVtSyncDateValue(value)
 if (timestamp === undefined) return isMissing(value) ? "-" : String(value)
 return new Date(timestamp).toLocaleDateString("en-US", { month: "short" })
}

const VT_SYNC_FULL_MONTH_NAMES = [
 "January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December",
] as const

export const formatVtSyncFullMonthValue = (value: unknown): string => {
 if (typeof value === "string") {
  const yearMonth = value.trim().match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (yearMonth) {
   const monthIndex = Number(yearMonth[2]) - 1
   return VT_SYNC_FULL_MONTH_NAMES[monthIndex] || value
  }
 }
 const timestamp = parseVtSyncDateValue(value)
 if (timestamp === undefined) return isMissing(value) ? "-" : String(value)
 return VT_SYNC_FULL_MONTH_NAMES[new Date(timestamp).getUTCMonth()]
}

export const getVtSyncLocalWeekdayIndex = (value: unknown): number | undefined => {
 const timestamp = parseVtSyncDateValue(value)
 if (timestamp !== undefined) return (new Date(timestamp).getDay() + 6) % 7
 if (typeof value !== "string") return undefined
 const index = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(value.trim().toLowerCase())
 return index >= 0 ? index : undefined
}

export const getVtSyncLocalMonthIndex = (value: unknown): number | undefined => {
 const timestamp = parseVtSyncDateValue(value)
 return timestamp === undefined ? undefined : new Date(timestamp).getMonth()
}

export const getVtSyncLocalTimeSeconds = (value: unknown): number | undefined => {
 const timestamp = parseVtSyncDateValue(value)
 if (timestamp !== undefined) {
  const date = new Date(timestamp)
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
 }
 if (typeof value !== "string") return undefined
 const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i)
 if (!match) return undefined
 let hours = Number(match[1])
 if (match[4]) hours = (hours % 12) + (/PM/i.test(match[4]) ? 12 : 0)
 return hours * 3600 + Number(match[2]) * 60 + Number(match[3] || 0)
}

const formatVtSyncDateRangeValue = (value: unknown): string => {
 if (isMissing(value)) return "-"
 const parts = String(value).split(/\s+-\s+/)
 return parts.length === 2
  ? `${formatVtSyncDateValue(parts[0])} – ${formatVtSyncDateValue(parts[1])}`
  : formatVtSyncDateValue(value)
}

export const formatVtSyncTableCellValue = (
 value: unknown,
 format?: VtSyncTableColumnDefinition["format"],
): string => {
 if (isMissing(value)) return "-"
 if (format === "date") return formatVtSyncDateValue(value)
 if (format === "dateRange") return formatVtSyncDateRangeValue(value)
 if (format === "dateLocal") return formatVtSyncLocalDateValue(value)
 if (format === "weekdayLocal") return formatVtSyncLocalWeekdayValue(value)
 if (format === "timeLocal") return formatVtSyncLocalTimeValue(value)
 if (["duration", "durationHours", "durationMinutes"].includes(format || "")) {
  const seconds = parseVtSyncDurationSeconds(value, format as VtSyncDurationFormat)
  return seconds === undefined
   ? String(value)
   : format === "duration" ? formatVtSyncDurationSeconds(seconds) : formatVtSyncWatchTimeSeconds(seconds)
 }
 if (Array.isArray(value) || (value && typeof value === "object")) return stringifyStructuredValue(value)
 if (typeof value === "number") {
  if (format === "currency") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  if (format === "percent") return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
 }
 return String(value)
}
