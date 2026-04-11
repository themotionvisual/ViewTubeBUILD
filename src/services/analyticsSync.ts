// src/services/analyticsSync.ts
// Note: YouTube API and Auth integration is pending. This is a stub for the CSV-first architecture.

export const performSync = async () => {
  console.log("Analytics Sync: CSV Priority Mode Active.");
  // Implementation will follow once YouTube API services are ported.
};

export const startAutoSync = (intervalMinutes = 30) => {
  console.log(`Auto-sync started (Interval: ${intervalMinutes}m)`);
};

export const stopAutoSync = () => {
  console.log("Auto-sync stopped");
};
