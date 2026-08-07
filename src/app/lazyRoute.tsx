import React, { Suspense } from "react"

import { Spinner } from "../components/ui/spinner"

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

const CHUNK_ERROR_REGEX =
 /(Loading chunk [\d]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|import\(\) with the argument|Unable to preload CSS)/i

const RELOAD_FLAG = "vt_chunk_reload_attempted"

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
// deploy can trigger its own single-reload cycle.
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

const RouteLoadingIndicator: React.FC = () => {
 const [showRetry, setShowRetry] = React.useState(false)
 React.useEffect(() => {
  const timer = window.setTimeout(() => setShowRetry(true), RETRY_TIMEOUT_MS)
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

 return (
  <div
   role="status"
   className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-6 text-center"
  >
   <Spinner className="size-8 opacity-40" />
   <p className="text-sm font-black uppercase tracking-wide text-black/60">
    Still loading — this usually means a stale cached page.
   </p>
   <button
    type="button"
    className="rounded-full border-[3px] border-black bg-[#C0F240] px-5 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    onClick={() => {
     try { sessionStorage.removeItem(RELOAD_FLAG) } catch { /* ignore */ }
     window.location.reload()
    }}
   >
    Reload page
   </button>
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
 }

 handleReload = (): void => {
  try { sessionStorage.removeItem(RELOAD_FLAG) } catch { /* ignore */ }
  window.location.reload()
 }

 handleClearAndReload = (): void => {
  try {
   localStorage.clear()
   sessionStorage.clear()
  } catch { /* ignore */ }
  window.location.assign("/")
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

export const RouteSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
 <RouteErrorBoundary>
  <Suspense fallback={<RouteLoadingIndicator />}>{children}</Suspense>
 </RouteErrorBoundary>
)
