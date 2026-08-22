import { reportDiagnostic } from "../diagnostics"

/** Browser-local compatibility log retained for existing sync consumers. */
const DIAGNOSTIC_FILE = "reports/diagnostics/latest.json";

/**
 * Append an error message to the diagnostics log.
 */
export const reportSyncError = (msg: string) => {
  reportDiagnostic({
    area: "analytics-sync",
    event: "sync_error",
    level: "error",
    whatHappened: msg,
    whatItMeans: "An analytics sync phase could not complete normally.",
    whatToCheck: ["Connection state", "Requested metric bundle", "Stored snapshot freshness"],
  })
  try {
    const existing = typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem(DIAGNOSTIC_FILE)
      : null;
    const logs: string[] = existing ? JSON.parse(existing) : [];
    logs.push(`${new Date().toISOString()} – ${msg}`);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(DIAGNOSTIC_FILE, JSON.stringify(logs));
    }
    // In Node/Electron environments you might write to filesystem; omitted for brevity.
  } catch (e) {
    console.warn("[AnalyticsErrorReporter] Failed to log error", e);
  }
};

/**
 * Retrieve current diagnostics log.
 */
export const getSyncDiagnostics = (): string[] => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem(DIAGNOSTIC_FILE);
      return raw ? JSON.parse(raw) : [];
    }
    return [];
  } catch {
    return [];
  }
};
