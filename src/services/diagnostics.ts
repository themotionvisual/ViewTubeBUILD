export type DiagnosticLevel = "info" | "warn" | "error"

export interface DiagnosticEntry {
  t: number
  level: DiagnosticLevel
  tag: string
  message: string
}

export interface ViewTubeDiagnostic {
  area: string
  event: string
  level: DiagnosticLevel
  whatHappened: string
  whatItMeans?: string
  whatToCheck?: readonly string[]
  debugData?: Record<string, unknown>
  error?: unknown
}

const BUFFER_LIMIT = 40
const MAX_MESSAGE_LENGTH = 240
const MAX_STRING_LENGTH = 500
const MAX_ARRAY_ITEMS = 20
const MAX_DEPTH = 4
const SENSITIVE_KEY_PATTERN = /(authorization|cookie|password|secret|token|api[-_]?key|credential|session)/i
const BEARER_TOKEN_PATTERN = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi
const SENSITIVE_QUERY_PATTERN = /([?&](?:access_token|refresh_token|api_key|key)=)[^&#\s]+/gi

const buffer: DiagnosticEntry[] = []
const bootTime = typeof performance !== "undefined" ? performance.now() : Date.now()

const now = (): number =>
  typeof performance !== "undefined"
    ? Math.round(performance.now() - bootTime)
    : Math.round(Date.now() - bootTime)

const redactText = (value: string): string => {
  const redacted = value
    .replace(BEARER_TOKEN_PATTERN, "Bearer [REDACTED]")
    .replace(SENSITIVE_QUERY_PATTERN, "$1[REDACTED]")
  return redacted.slice(0, MAX_STRING_LENGTH)
}

const sanitizeValue = (value: unknown, depth = 0, seen = new WeakSet<object>()): unknown => {
  if (value === null || value === undefined || typeof value === "number" || typeof value === "boolean") return value
  if (typeof value === "string") return redactText(value)
  if (typeof value === "bigint") return value.toString()
  if (typeof value === "function" || typeof value === "symbol") return `[${typeof value}]`
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message),
      stack: value.stack ? redactText(value.stack) : undefined,
    }
  }
  if (depth >= MAX_DEPTH) return "[MAX_DEPTH]"
  if (typeof value !== "object") return redactText(String(value))
  if (seen.has(value)) return "[CIRCULAR]"
  seen.add(value)
  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1, seen))
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : sanitizeValue(nested, depth + 1, seen),
    ]),
  )
}

export const sanitizeDiagnosticData = (
  value: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined =>
  value ? sanitizeValue(value) as Record<string, unknown> : undefined

export const recordDiagnostic = (
  level: DiagnosticLevel,
  tag: string,
  message: string,
): void => {
  buffer.push({
    t: now(),
    level,
    tag: redactText(String(tag)).slice(0, 80),
    message: redactText(String(message)).slice(0, MAX_MESSAGE_LENGTH),
  })
  if (buffer.length > BUFFER_LIMIT) buffer.shift()
}

export const readDiagnostics = (): readonly DiagnosticEntry[] => buffer.slice()

export const reportDiagnostic = (input: ViewTubeDiagnostic): void => {
  const tag = `${input.area}:${input.event}`
  recordDiagnostic(input.level, tag, input.whatHappened)

  const payload = {
    WHAT_HAPPENED: redactText(input.whatHappened),
    WHAT_IT_MEANS: input.whatItMeans ? redactText(input.whatItMeans) : undefined,
    WHAT_TO_CHECK: input.whatToCheck?.map(redactText),
    DEBUG_DATA: sanitizeDiagnosticData(input.debugData),
    error: input.error ? sanitizeValue(input.error) : undefined,
  }
  const method = input.level === "error" ? "error" : input.level === "warn" ? "warn" : "info"
  globalThis.console[method](`[ViewTube:${input.area}] ${input.event}`, payload)
}

export const formatDiagnostics = (entries: readonly DiagnosticEntry[]): string => {
  if (!entries.length) return "(no diagnostics captured)"
  return entries
    .map((entry) => `[${entry.t.toString().padStart(5, " ")}ms] ${entry.level.toUpperCase()} ${entry.tag}: ${entry.message}`)
    .join("\n")
}
