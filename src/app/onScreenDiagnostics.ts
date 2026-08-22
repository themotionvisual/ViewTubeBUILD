// Compatibility entrypoint for developer-facing runtime diagnostics.
import { isDeveloperDiagnosticsEnabled, recordDiagnostic } from "../services/diagnostics"

export { formatDiagnostics, readDiagnostics, recordDiagnostic } from "../services/diagnostics"
export type { DiagnosticEntry } from "../services/diagnostics"

const STALE_CHUNK_REGEX =
 /(Loading chunk [\d]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|import\(\) with the argument|Unable to preload CSS|is not a valid JavaScript MIME type|Expected a JavaScript(?:.| )*module script|MIME type\s*\(?["']?text\/html|MIME type checking is enabled)/i
const RELOAD_FLAG = "vt_chunk_reload_attempted"
let installed = false
let requestSequence = 0

const isStaleChunkMessage = (message: string): boolean => STALE_CHUNK_REGEX.test(message)

const describeRejection = (reason: unknown): string => {
 if (reason instanceof Error) return reason.message
 if (typeof reason === "string") return reason
 try { return JSON.stringify(reason).slice(0, 200) } catch { return String(reason) }
}

const attemptAutoReload = (): void => {
 if (typeof window === "undefined") return
 try {
  if (sessionStorage.getItem(RELOAD_FLAG) === "1") return
  sessionStorage.setItem(RELOAD_FLAG, "1")
 } catch {
  // Storage can be unavailable in private browsing; reload recovery still proceeds.
 }
 const search = window.location.search ? `${window.location.search}&` : "?"
 window.setTimeout(() => window.location.replace(`${window.location.pathname}${search}_v=${Date.now()}${window.location.hash}`), 50)
}

const installLongTaskDiagnostics = () => {
 if (!isDeveloperDiagnosticsEnabled() || typeof PerformanceObserver === "undefined") return
 let count = 0
 let total = 0
 let maximum = 0
 let flushTimer: number | null = null
 const flush = () => {
  flushTimer = null
  if (!count) return
  recordDiagnostic("warn", "long-task-summary", `${count} long task(s), ${Math.round(total)}ms total, ${Math.round(maximum)}ms max`)
  count = 0
  total = 0
  maximum = 0
 }
 try {
  const observer = new PerformanceObserver((list) => {
   list.getEntries().forEach((entry) => {
    count += 1
    total += entry.duration
    maximum = Math.max(maximum, entry.duration)
   })
   if (flushTimer === null) flushTimer = window.setTimeout(flush, 5000)
  })
  observer.observe({ type: "longtask", buffered: true })
 } catch {
  // Long-task observation is optional and unsupported browsers continue normally.
 }
}

export const installOnScreenDiagnostics = (): void => {
 if (installed || typeof window === "undefined") return
 installed = true

 window.addEventListener("error", (event) => {
  const raw = event.target as unknown as HTMLElement | Window | null
  if (raw && raw !== window && (raw as HTMLElement).tagName) {
   const target = raw as HTMLElement & { src?: string; href?: string }
   recordDiagnostic("error", `${target.tagName.toLowerCase()}-load`, target.src || target.href || "<unknown>")
   return
  }
  const message = event.error?.message || event.message || "unknown error"
  recordDiagnostic("error", "window-error", message)
  if (isStaleChunkMessage(message)) attemptAutoReload()
 }, true)

 window.addEventListener("unhandledrejection", (event) => {
  const message = describeRejection(event.reason)
  recordDiagnostic("error", "unhandled-rejection", message)
  if (isStaleChunkMessage(message)) attemptAutoReload()
 })

 recordDiagnostic("info", "boot", navigator.userAgent.slice(0, 100))
 installLongTaskDiagnostics()

 if (!isDeveloperDiagnosticsEnabled() || typeof window.fetch !== "function") return
 const originalFetch = window.fetch
 window.fetch = async (...args) => {
  const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url || "<request>"
  const requestId = `browser-${++requestSequence}`
  const started = performance.now()
  const slowTimer = window.setTimeout(() => {
   recordDiagnostic("warn", "fetch-slow", `${requestId} ${url} still pending after 3000ms`)
  }, 3000)
  try {
   const response = await originalFetch(...args)
   if (!response.ok) recordDiagnostic("warn", "fetch-nonok", `${requestId} ${response.status} ${url} (${Math.round(performance.now() - started)}ms)`)
   return response
  } catch (error) {
   recordDiagnostic("error", "fetch-fail", `${requestId} ${error instanceof Error ? error.message : String(error)} ${url} (${Math.round(performance.now() - started)}ms)`)
   throw error
  } finally {
   window.clearTimeout(slowTimer)
  }
 }
}

export const recordBootPhase = (phase: string, detail?: string): void => {
 recordDiagnostic("info", "boot-phase", detail ? `${phase} — ${detail}` : phase)
}
