import React, { Suspense } from "react"

import { Spinner } from "../components/ui/spinner"
import { formatDiagnostics, readDiagnostics } from "./onScreenDiagnostics"

// After a Vercel redeploy, cached index.html can point at chunk hashes that
// no longer exist. Vite/Rolldown's dynamic imports then reject with a
// ChunkLoadError-shaped error, and if we don't handle it the page hangs on
// the Suspense fallback forever (exactly the "spinner after login" report).
// Wrapping every route in this helper does three things:
//   1. Retries a failed dynamic import once (network hiccup, not a real
//      404). Also self-heals a genuinely stale chunk by forcing a hard
//      reload the next time — after the reload the browser fetches the
//      current index.html, discovers the fresh chunk hashes, and everything
//      works again.
//   2. Times out the Suspense spinner. If a chunk takes longer than 12s the
//      user gets a visible retry button instead of a mysterious blank page.
//   3. Catches render-time errors and shows the actual error message plus a
//      reload button so we stop losing diagnostics into the void.

// Recognize every shape a stale-chunk failure takes across browsers.
// The MIME-type variant ("'text/html' is not a valid JavaScript MIME type",
// "Expected a JavaScript module script but the server responded with a MIME
// type of \"text/html\"") is the *most common* one in practice — it's what
// happens when Vercel's SPA fallback catches a request for a missing
// chunk .js and returns index.html instead. We were previously only
// catching the Vite/Chrome "Loading chunk failed" phrase and missing this
// entirely, so the retry logic never fired and users hit the raw error UI.
const CHUNK_ERROR_REGEX =
 /(Loading chunk [\d]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|import\(\) with the argument|Unable to preload CSS|is not a valid JavaScript MIME type|Expected a JavaScript(?:.| )*module script|MIME type\s*\(?["']?text\/html|MIME type checking is enabled)/i

const RELOAD_FLAG = "vt_chunk_reload_attempted"
// Track how many times the fallback timeout has fired without the page
// mounting. Persisted in sessionStorage so it survives reloads (which is the
// whole point — after ≥2 reloads that led back here, we know something
// deeper than a stale chunk is stuck).
const HANG_COUNTER = "vt_route_hang_count"

const readHangCount = (): number => {
 if (typeof window === "undefined") return 0
 try {
  const raw = sessionStorage.getItem(HANG_COUNTER)
  const n = raw ? Number(raw) : 0
  return Number.isFinite(n) ? n : 0
 } catch { return 0 }
}

const incrementHangCount = (): number => {
 const next = readHangCount() + 1
 try { sessionStorage.setItem(HANG_COUNTER, String(next)) } catch { /* ignore */ }
 return next
}

const clearHangCount = (): void => {
 try { sessionStorage.removeItem(HANG_COUNTER) } catch { /* ignore */ }
}

// Nuclear option: wipe every trace of app state so a broken auth token,
// corrupted cache, or half-migrated localStorage schema can't keep the user
// trapped. Used both by the manual button and by the auto-recovery path
// after repeated hangs.
const nukeAppStateAndReload = (): void => {
 try {
  localStorage.clear()
  sessionStorage.clear()
  // Clear any known cookies too (auth session, entitlement). Same-origin only.
  document.cookie.split(";").forEach((c) => {
   const eq = c.indexOf("=")
   const name = (eq > -1 ? c.substring(0, eq) : c).trim()
   if (!name) return
   document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
  })
 } catch { /* ignore */ }
 window.location.assign("/")
}

const isChunkLoadError = (error: unknown): boolean => {
 const message = error instanceof Error ? error.message : String(error || "")
 return CHUNK_ERROR_REGEX.test(message)
}

// One retry, then hard-reload — but only once per session, or we'd get stuck
// in a refresh loop if the deploy is actually broken.
const retryImport = <T,>(factory: () => Promise<T>): Promise<T> =>
 factory().catch((error) => {
  if (!isChunkLoadError(error)) throw error
  return new Promise<T>((resolve, reject) => {
   setTimeout(() => {
    factory().then(resolve, (secondError) => {
     if (typeof window !== "undefined" && sessionStorage.getItem(RELOAD_FLAG) !== "1") {
      sessionStorage.setItem(RELOAD_FLAG, "1")
      window.location.reload()
      // Reload doesn't cancel the current microtask synchronously, so still
      // reject after a beat to unblock React's Suspense machinery in case
      // the reload is denied.
      setTimeout(() => reject(secondError), 500)
      return
     }
     reject(secondError)
    })
   }, 400)
  })
 })

// Clear the reload flag when the app boots successfully so a *later*
// deploy can trigger its own single-reload cycle. Also clear the hang
// counter once we've actually painted something interactive — surviving to
// that point is proof the app came unstuck.
if (typeof window !== "undefined") {
 window.addEventListener("load", () => {
  try {
   sessionStorage.removeItem(RELOAD_FLAG)
  } catch { /* ignore */ }
 }, { once: true })
}

// Loose component type — routes can be React.FC, React.FC<any>, class
// components, etc. Whatever React.lazy accepts, so does this.
export const lazyRoute = <T extends React.ComponentType<any>>(
 factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> => React.lazy(() => retryImport(factory))

// ─── Route fallback that never hangs silently ────────────────────────────────

const RETRY_TIMEOUT_MS = 12_000
// After this many hang cycles we auto-recover — because if we've already
// hit the recovery UI twice and the user clicked Reload each time to no
// effect, we know a plain reload won't help. Sign them out and land clean.
const AUTO_RECOVER_AFTER_HANGS = 3

const RouteLoadingIndicator: React.FC = () => {
 const [showRetry, setShowRetry] = React.useState(false)
 // Snapshot the pre-existing hang count so the button labeling stabilizes
 // even after we bump the counter for this render.
 const previousHangCount = React.useRef(readHangCount())
 React.useEffect(() => {
  const timer = window.setTimeout(() => {
   const nextCount = incrementHangCount()
   // If the user has been trapped in a reload loop, don't wait for another
   // button tap — auto-nuke storage and land on / with a clean slate.
   if (nextCount >= AUTO_RECOVER_AFTER_HANGS) {
    clearHangCount()
    nukeAppStateAndReload()
    return
   }
   setShowRetry(true)
  }, RETRY_TIMEOUT_MS)
  return () => window.clearTimeout(timer)
 }, [])

 if (!showRetry) {
  return (
   <div
    role="status"
    aria-label="Loading page"
    className="flex min-h-[60vh] w-full items-center justify-center"
   >
    <Spinner className="size-8" />
   </div>
  )
 }

 // On the very first hang show only the soft Reload; on second or later
 // hangs — meaning a plain reload didn't fix it last time — prominently
 // offer the destructive Sign-out & clear cache option.
 const persistedFailure = previousHangCount.current >= 1
 return (
  <div
   role="status"
   className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-6 text-center"
  >
   <Spinner className="size-8 opacity-40" />
   <p className="max-w-sm text-sm font-black uppercase tracking-wide text-black/60">
    {persistedFailure
     ? "Reload didn't help — try signing out and starting fresh."
     : "Still loading — this usually means a stale cached page."}
   </p>
   <div className="flex flex-wrap justify-center gap-3">
    <button
     type="button"
     className={`rounded-full border-[3px] border-black px-5 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${persistedFailure ? "bg-white" : "bg-[#C0F240]"}`}
     onClick={() => {
      try { sessionStorage.removeItem(RELOAD_FLAG) } catch { /* ignore */ }
      window.location.reload()
     }}
    >
     Reload page
    </button>
    <button
     type="button"
     className={`rounded-full border-[3px] border-black px-5 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${persistedFailure ? "bg-[#C0F240]" : "bg-white"}`}
     onClick={nukeAppStateAndReload}
    >
     Sign out &amp; clear cache
    </button>
   </div>
   {/* On-screen diagnostics: mobile users can't open chrome://inspect from
       their phone, so surface captured errors + failed requests directly in
       the stuck UI. Screenshot-friendly. */}
   <DiagnosticPanel />
  </div>
 )
}

const DiagnosticPanel: React.FC = () => {
 const [expanded, setExpanded] = React.useState(false)
 const [text, setText] = React.useState("")
 React.useEffect(() => {
  setText(formatDiagnostics(readDiagnostics()))
 }, [expanded])

 const copyToClipboard = () => {
  const info = [
   `location: ${window.location.href}`,
   `ua: ${navigator.userAgent}`,
   `hangCount: ${readHangCount()}`,
   "",
   text || formatDiagnostics(readDiagnostics()),
  ].join("\n")
  const doCopy = navigator.clipboard?.writeText
  if (doCopy) {
   doCopy.call(navigator.clipboard, info).catch(() => { /* ignore */ })
  }
 }

 return (
  <div className="mt-6 w-full max-w-lg">
   <button
    type="button"
    className="rounded-full border-[2px] border-black bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
    onClick={() => setExpanded((prev) => !prev)}
    aria-expanded={expanded}
   >
    {expanded ? "Hide diagnostics" : "Show diagnostics"}
   </button>
   {expanded ? (
    <div className="mt-3 rounded-[12px] border-[2px] border-black bg-[#0f172a] p-3 text-left shadow-[3px_3px_0_0_#000]">
     <div className="mb-2 flex items-center justify-between">
      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#C0F240]">Runtime log</span>
      <button
       type="button"
       className="rounded-full border border-[#C0F240] bg-transparent px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#C0F240]"
       onClick={copyToClipboard}
      >
       Copy
      </button>
     </div>
     <pre className="max-h-[45vh] overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-[1.4] text-white/85">
{text || "(no diagnostics captured — the app hasn't logged anything yet)"}
     </pre>
    </div>
   ) : null}
  </div>
 )
}

// ─── ErrorBoundary that surfaces render-time crashes ─────────────────────────

interface RouteErrorBoundaryState {
 error: Error | null
}

export class RouteErrorBoundary extends React.Component<
 { children: React.ReactNode },
 RouteErrorBoundaryState
> {
 state: RouteErrorBoundaryState = { error: null }

 static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
  return { error }
 }

 componentDidCatch(error: Error, info: React.ErrorInfo): void {
  // Explicit console.error so remote-inspect on mobile actually shows the
  // stack instead of a silent white screen. Also send to Vercel Speed
  // Insights if it's listening.
  // eslint-disable-next-line no-console
  console.error("[route-error]", error, info.componentStack)

  // Chunk-shaped errors are almost always a stale-cached index.html
  // pointing at chunk hashes that no longer exist on the CDN. Auto-reload
  // once (gated by RELOAD_FLAG so we can't loop) to fetch the fresh HTML.
  if (isChunkLoadError(error)) {
   if (typeof window !== "undefined" && sessionStorage.getItem(RELOAD_FLAG) !== "1") {
    try { sessionStorage.setItem(RELOAD_FLAG, "1") } catch { /* ignore */ }
    // Give React one microtask so the error state doesn't win over the
    // navigation — otherwise the reload can be canceled by the render.
    setTimeout(() => window.location.reload(), 50)
   }
  }
 }

 handleReload = (): void => {
  try { sessionStorage.removeItem(RELOAD_FLAG) } catch { /* ignore */ }
  window.location.reload()
 }

 handleClearAndReload = (): void => {
  nukeAppStateAndReload()
 }

 render(): React.ReactNode {
  if (!this.state.error) return this.props.children
  const message = this.state.error.message || String(this.state.error)
  const chunkFailure = isChunkLoadError(this.state.error)
  return (
   <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4 px-6 text-center">
    <div className="max-w-md rounded-[16px] border-[4px] border-black bg-[#FFDA47] p-6 shadow-[6px_6px_0_0_#000]">
     <h2 className="mb-2 text-lg font-black uppercase tracking-[0.05em]">
      {chunkFailure ? "Loading interrupted" : "Something went wrong"}
     </h2>
     <p className="mb-4 text-xs font-mono break-words text-black/70">
      {message}
     </p>
     <div className="flex flex-wrap justify-center gap-2">
      <button
       type="button"
       className="rounded-full border-[3px] border-black bg-[#C0F240] px-5 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
       onClick={this.handleReload}
      >
       Reload
      </button>
      <button
       type="button"
       className="rounded-full border-[3px] border-black bg-white px-5 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
       onClick={this.handleClearAndReload}
      >
       Sign out & start over
      </button>
     </div>
    </div>
   </div>
  )
 }
}

// If the children commit (not the fallback), clear the hang counter — proof
// that the app did successfully render a route so any earlier stuck cycles
// are no longer relevant.
const RouteHangCountResetter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 React.useEffect(() => {
  clearHangCount()
 }, [])
 return <>{children}</>
}

export const RouteSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
 <RouteErrorBoundary>
  <Suspense fallback={<RouteLoadingIndicator />}>
   <RouteHangCountResetter>{children}</RouteHangCountResetter>
  </Suspense>
 </RouteErrorBoundary>
)
