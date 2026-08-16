import React from "react"
import { WidgetStatePanel } from "./WidgetPrimitives"

type Props = {
  widgetId: string
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

// Recognize any dynamic-import failure shape. Kept in sync with the same
// regex in `src/app/lazyRoute.tsx` and `src/app/onScreenDiagnostics.ts` —
// duplicated on purpose so this boundary has no circular dep on the app
// shell layer.
const CHUNK_ERROR_REGEX =
  /(Loading chunk [\d]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|import\(\) with the argument|Unable to preload CSS|is not a valid JavaScript MIME type|Expected a JavaScript(?:.| )*module script|MIME type\s*\(?["']?text\/html|MIME type checking is enabled)/i

const RELOAD_FLAG = "vt_chunk_reload_attempted"

const isChunkLoadError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error || "")
  return CHUNK_ERROR_REGEX.test(message)
}

// Same cache-busting hard-reload used by the route-level boundary. Query
// param bypasses iOS Safari's stubborn HTML cache; sessionStorage flag
// prevents a reload loop if the deploy is actually broken.
const attemptChunkReload = (): void => {
  if (typeof window === "undefined") return
  try {
    if (sessionStorage.getItem(RELOAD_FLAG) === "1") return
    sessionStorage.setItem(RELOAD_FLAG, "1")
  } catch { /* ignore */ }
  const search = window.location.search ? `${window.location.search}&` : "?"
  const bustedUrl = `${window.location.pathname}${search}_v=${Date.now()}${window.location.hash}`
  window.setTimeout(() => window.location.replace(bustedUrl), 50)
}

export class WidgetErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(`[WidgetErrorBoundary] ${this.props.widgetId} crashed`, error)

    // React catches lazy-import failures inside a Suspense/ErrorBoundary
    // pair before they can bubble to window.onunhandledrejection, so the
    // app-shell's global auto-reload listener never fires for widget chunk
    // failures — every widget on the Dashboard just renders a broken card
    // forever, and the user has no way out. Trigger the same
    // cache-busting reload here for chunk-shaped errors so a single
    // stale-HTML load self-heals rather than turning the whole dashboard
    // into a graveyard of "widget failed to render" panels.
    if (isChunkLoadError(error)) attemptChunkReload()
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <WidgetStatePanel
          state={{
            status: "error",
            data: null,
            message: "This widget failed to render. The rest of the dashboard is still available.",
            recoveryAction: "Try widget again",
          }}
          onRecover={this.handleRetry}
        />
      )
    }
    return this.props.children
  }
}
