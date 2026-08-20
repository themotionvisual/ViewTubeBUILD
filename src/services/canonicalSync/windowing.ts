import type { AnalyticsWindow } from "../analytics/DataStore"

export type WindowedCanonicalSelection<T> = {
 requestedWindow: AnalyticsWindow
 resolvedWindow: AnalyticsWindow | null
 rows: T[]
 hasRequestedWindowData: boolean
 hasAnyRows: boolean
 availableWindows: AnalyticsWindow[]
 usedFallbackWindow: boolean
}

const WINDOW_FALLBACK_ORDER: AnalyticsWindow[] = [
 "lifetime",
 "365d",
 "90d",
 "28d",
 "7d",
]

const uniqueWindowOrder = (requestedWindow: AnalyticsWindow): AnalyticsWindow[] => {
 const ordered = [requestedWindow, ...WINDOW_FALLBACK_ORDER]
 return ordered.filter(
  (window, index) => ordered.indexOf(window) === index,
 ) as AnalyticsWindow[]
}

export const selectRowsForWindow = <T extends { window: AnalyticsWindow }>(
 rows: T[],
 requestedWindow: AnalyticsWindow,
): WindowedCanonicalSelection<T> => {
 const availableWindows = Array.from(
  new Set(rows.map((row) => row.window).filter(Boolean)),
 ) as AnalyticsWindow[]
 const requestedRows = rows.filter((row) => row.window === requestedWindow)
 if (requestedRows.length > 0) {
  return {
   requestedWindow,
   resolvedWindow: requestedWindow,
   rows: requestedRows,
   hasRequestedWindowData: true,
   hasAnyRows: true,
   availableWindows,
   usedFallbackWindow: false,
  }
 }

 for (const window of uniqueWindowOrder(requestedWindow)) {
  const matched = rows.filter((row) => row.window === window)
  if (matched.length > 0) {
   return {
    requestedWindow,
    resolvedWindow: window,
    rows: matched,
    hasRequestedWindowData: false,
    hasAnyRows: true,
    availableWindows,
    usedFallbackWindow: window !== requestedWindow,
   }
  }
 }

 return {
  requestedWindow,
  resolvedWindow: null,
  rows: [],
  hasRequestedWindowData: false,
  hasAnyRows: false,
  availableWindows,
  usedFallbackWindow: false,
 }
}
