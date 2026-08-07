// Mobile users can't open chrome://inspect from their phone, so a hung
// spinner is opaque — we have no idea what's actually broken. This module
// records the useful runtime signals into an in-memory ring buffer that the
// RouteLoadingIndicator can render on screen after a hang. Users can then
// screenshot and share the diagnostic without needing a desktop debugger.
//
// Captured:
//   - Uncaught JS errors + unhandled rejections
//   - Failed script/CSS/image loads (via document-level "error" listener)
//   - Failed fetch()/XHR responses (any 4xx/5xx or network error)
//   - Timing markers we push manually from key hook init points
//
// Everything gets a monotonic timestamp relative to app boot so the sequence
// is clear even when clocks skew.

export interface DiagnosticEntry {
 t: number
 level: "error" | "warn" | "info"
 tag: string
 message: string
}

const BUFFER_LIMIT = 40
const buffer: DiagnosticEntry[] = []
const bootTime = typeof performance !== "undefined" ? performance.now() : Date.now()

// Same shape check as `lazyRoute.tsx#CHUNK_ERROR_REGEX`. Duplicated here so
// this file has no dependency on lazyRoute (they both need it at boot).
const STALE_CHUNK_REGEX =
 /(Loading chunk [\d]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|import\(\) with the argument|Unable to preload CSS|is not a valid JavaScript MIME type|Expected a JavaScript(?:.| )*module script|MIME type\s*\(?["']?text\/html|MIME type checking is enabled)/i

const isStaleChunkMessage = (message: string): boolean =>
 typeof message === "string" && STALE_CHUNK_REGEX.test(message)

const RELOAD_FLAG = "vt_chunk_reload_attempted"

// Global auto-reload for any dynamic import failure that looks stale-chunk-
// shaped. Cache-busts via ?_v= so iOS Safari can't serve the stale HTML,
// gated by sessionStorage so we can't loop.
const attemptAutoReload = (): void => {
 if (typeof window === "undefined") return
 try {
  if (sessionStorage.getItem(RELOAD_FLAG) === "1") return
  sessionStorage.setItem(RELOAD_FLAG, "1")
 } catch { /* ignore */ }
 const search = window.location.search ? `${window.location.search}&` : "?"
 const bustedUrl = `${window.location.pathname}${search}_v=${Date.now()}${window.location.hash}`
 // location.replace() so the busted URL doesn't linger in history.
 window.setTimeout(() => window.location.replace(bustedUrl), 50)
}

const now = (): number =>
 typeof performance !== "undefined"
  ? Math.round(performance.now() - bootTime)
  : Math.round(Date.now() - bootTime)

const push = (entry: DiagnosticEntry): void => {
 buffer.push(entry)
 if (buffer.length > BUFFER_LIMIT) buffer.shift()
}

export const recordDiagnostic = (
 level: DiagnosticEntry["level"],
 tag: string,
 message: string,
): void => {
 push({ t: now(), level, tag, message: String(message).slice(0, 240) })
}

export const readDiagnostics = (): readonly DiagnosticEntry[] => buffer.slice()

// ── Global installers ────────────────────────────────────────────────────────

let installed = false

export const installOnScreenDiagnostics = (): void => {
 if (installed || typeof window === "undefined") return
 installed = true

 window.addEventListener("error", (event) => {
  // event.target for asset-load failures is the failing HTMLElement, not window.
  const raw = event.target as unknown as HTMLElement | Window | null
  if (raw && raw !== window && (raw as HTMLElement).tagName) {
   const target = raw as HTMLElement & { src?: string; href?: string }
   const src = target.src || target.href || "<unknown>"
   recordDiagnostic("error", `${target.tagName.toLowerCase()}-load`, src)
   return
  }
  const message = event.error?.message || event.message || "unknown error"
  recordDiagnostic("error", "window-error", message)
 }, true)

 window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason
  const message =
   reason instanceof Error ? reason.message
   : typeof reason === "string" ? reason
   : (() => { try { return JSON.stringify(reason).slice(0, 200) } catch { return String(reason) } })()
  recordDiagnostic("error", "unhandled-rejection", message)
  // Global safety net for any dynamic import that failed with a stale-chunk
  // shape — routes are already wrapped in `lazyRoute`, but Dashboard widgets
  // (30+ `React.lazy(() => import(...))` sites in WidgetRenderer) use raw
  // React.lazy and their failures bubble as unhandled rejections. Auto-reload
  // once with a busted URL so users self-heal without the whole dashboard
  // becoming a graveyard of "Importing a module script failed" cards.
  if (isStaleChunkMessage(message)) attemptAutoReload()
 })

 window.addEventListener("error", (event) => {
  // Catch chunk-load errors thrown from anywhere in the module graph — the
  // same global fallback for widget-level `React.lazy` failures. This runs
  // in addition to the target-tagged asset-load listener above; the
  // condition below matches when event.target is window (i.e. a real JS
  // runtime error, not an asset load failure).
  if (event.target === window) {
   const message = event.error?.message || event.message || ""
   if (isStaleChunkMessage(message)) attemptAutoReload()
  }
 })

 // Wrap fetch to log non-2xx responses and network errors — the two mobile
 // symptoms most likely to hang a data-hydration Suspense boundary.
 const originalFetch = window.fetch
 if (typeof originalFetch === "function") {
  window.fetch = async (...args) => {
   const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url || "<request>"
   const started = now()
   try {
    const response = await originalFetch(...args)
    if (!response.ok) {
     recordDiagnostic("warn", "fetch-nonok", `${response.status} ${url} (${now() - started}ms)`)
    }
    return response
   } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    recordDiagnostic("error", "fetch-fail", `${message} ${url} (${now() - started}ms)`)
    throw error
   }
  }
 }

 recordDiagnostic("info", "boot", `${navigator.userAgent.slice(0, 100)}`)
}

export const formatDiagnostics = (entries: readonly DiagnosticEntry[]): string => {
 if (!entries.length) return "(no diagnostics captured)"
 return entries
  .map((entry) => `[${entry.t.toString().padStart(5, " ")}ms] ${entry.level.toUpperCase()} ${entry.tag}: ${entry.message}`)
  .join("\n")
}
