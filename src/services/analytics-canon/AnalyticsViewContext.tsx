/**
 * One analytics view selection, shared by every surface that reads windowed data.
 *
 * Before this, the data table, the data visuals and the Brain evidence gate each
 * held their own window state. Three independent selections meant the page could
 * show a 28-day table beside a lifetime chart, and could not answer the question
 * a creator actually asks — "show me everything at 28 days".
 *
 * Scope is deliberately just the window. The architecture reference (§4) also
 * describes custom ranges, previous-period comparison and provenance filters for
 * this context; those are NOT declared here, because a field nothing sets is
 * worse than an absent one. This provider is the seam they land on when built.
 *
 * Owner: analytics-canon (normalized consumer access). VT-SYNC still owns
 * ingestion and storage; nothing here reads or writes a snapshot.
 */

import React, { createContext, useContext, useMemo, useState } from "react"
import type { AnalyticsWindow } from "../analytics/windows"

export type AnalyticsViewContextValue = {
 window: AnalyticsWindow
 setWindow: (window: AnalyticsWindow) => void
}

const AnalyticsViewContext = createContext<AnalyticsViewContextValue | null>(null)

export const AnalyticsViewProvider: React.FC<{
 children: React.ReactNode
 /** Initial selection. Surfaces default to lifetime, matching prior behavior. */
 initialWindow?: AnalyticsWindow
}> = ({ children, initialWindow = "lifetime" }) => {
 const [window, setWindow] = useState<AnalyticsWindow>(initialWindow)
 const value = useMemo(() => ({ window, setWindow }), [window])
 return (
  <AnalyticsViewContext.Provider value={value}>
   {children}
  </AnalyticsViewContext.Provider>
 )
}

/** The provider's value, or null when a component is rendered standalone. */
export const useAnalyticsViewContext = (): AnalyticsViewContextValue | null =>
 useContext(AnalyticsViewContext)

/**
 * Window selection for one surface.
 *
 * Uses the shared selection when a provider is present, and falls back to local
 * state when it is not — so each component still works rendered on its own, in a
 * test, or in any embed that has not adopted the provider. Without the fallback,
 * adopting the context would be an all-or-nothing rewrite of every consumer.
 */
export const useAnalyticsWindow = (
 defaultWindow: AnalyticsWindow = "lifetime",
): [AnalyticsWindow, (window: AnalyticsWindow) => void] => {
 const shared = useAnalyticsViewContext()
 const [localWindow, setLocalWindow] = useState<AnalyticsWindow>(defaultWindow)
 return shared
  ? [shared.window, shared.setWindow]
  : [localWindow, setLocalWindow]
}
