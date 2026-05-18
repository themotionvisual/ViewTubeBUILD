---
name: managing-viewtube-sync-coordinator
description: >
  Procedure for working with the centralized SyncCoordinator and adding new sync providers.
  Triggers: "add a sync provider", "debug sync logic", "update youtube sync",
  "SyncCoordinator usage", "centralized ledger sync".
---

## When to Use
Use this skill when you need to modify the synchronization logic for YouTube, GA4, or add a new provider (e.g., Google Search Console). It leverages the centralized `SyncCoordinator` Singleton and the "Unified Ledger Only" data flow.

## Procedure

1. **Understand the Architecture**
   - **SyncCoordinator (`src/services/SyncCoordinator.ts`)**: Central orchestrator that manages provider syncs and auto-sync intervals.
   - **CanonicalAnalyticsStore (`src/services/canonicalAnalyticsStore.ts`)**: The "Ledger" where all synced data must be committed.
   - **Providers**: Specialized fetchers (e.g., `youtubeAnalyticsFetcher.ts`, `ga4Service.ts`) that return raw reports.

2. **Add or Update a Sync Provider**
   - Open `src/services/SyncCoordinator.ts`.
   - Implement a new `sync[Provider]` method (e.g., `syncSearchConsole`).
   - Use `commitToLedger` to push the results into the centralized store.
   - Example:
     ```typescript
     public async syncNewProvider() {
       const data = await newProviderFetcher();
       commitToLedger({
         source: "new_provider",
         context: "video",
         payload: data,
         // ... other contract fields
       });
     }
     ```

3. **Handle Auto-Sync**
   - Update `syncAll` in `SyncCoordinator.ts` to include the new provider.
   - Ensure the provider respects the user's connection status (e.g., `isProviderConnected()`).

4. **Listen for Sync Events**
   - The coordinator emits `vt_channel_sync_status` for progress updates.
   - It emits provider-specific events like `yt_analytics_synced` for data availability.
   - UI components should listen to these events to trigger re-renders or updates.

5. **Debug Sync Errors**
   - Check `src/services/youtube/youtubeApiClient.ts` for low-level API error handling.
   - Look for "Quota Exceeded" or "Invalid Key" reasons in the `YouTubeApiError` class.

## Pitfalls and Fixes
- **Data not persisting**: Ensure `commitToLedger` is called. The ledger handles the actual storage into `localStorage` (with fallback to minimal snapshots).
- **Quota errors**: Use the `ytApiQueue` (`RequestQueue.ts`) to manage concurrency and avoid hitting rate limits.
- **Corrupt cache**: If sync fails repeatedly, check `ensureCanonicalSchemaVersion` in the coordinator. Increasing `ANALYTICS_SCHEMA_VERSION` will force a fresh sync.

## Verification
- Call `syncCoordinator.syncAll(true)` and monitor the "Network" tab for API requests.
- Dispatch a `vt_channel_sync_status` event and verify the UI's progress bar or spinner updates.
- Check `localStorage` for keys like `yt_analytics_cache` and `vt_analytics_schema_version`.
