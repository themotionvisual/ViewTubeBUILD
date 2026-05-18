---
name: handling-viewtube-sync-reactivity
description: Ensure UI components automatically refresh when YouTube Analytics data is synced from the API.
---

## When to Use
- Adding a new analytics panel, chart, or dashboard widget.
- User reports that data is "stale" or doesn't update after clicking the sync button.
- A component uses `useMemo` or `useEffect` to fetch/process data from the local cache.

## Procedure

1.  **Add Refresh State**:
    Add a simple numeric state to the component to trigger re-renders:
    ```typescript
    const [refreshCount, setRefreshCount] = useState(0);
    ```

2.  **Listen for Sync Event**:
    Use `useEffect` to subscribe to the custom `yt_analytics_synced` event dispatched by the `analyticsSync` service:
    ```typescript
    useEffect(() => {
      const handleSync = () => setRefreshCount((c) => c + 1);
      window.addEventListener("yt_analytics_synced", handleSync);
      return () => window.removeEventListener("yt_analytics_synced", handleSync);
    }, []);
    ```

3.  **Include in Dependency Array**:
    Add `refreshCount` to the dependency array of any `useMemo` or `useEffect` that reads from the analytics store:
    ```typescript
    const masterTableRows = useMemo(
      () => canonicalRowsToMasterTableRows(getMasterRows("lifetime", "api")),
      [refreshCount], // CRITICAL: Forces re-calculation when sync completes
    );
    ```

## Pitfalls and Fixes
- **Missing Re-render**: Component doesn't update even though the sync was successful.
  - **Fix**: Check if `refreshCount` (or the state name you used) is actually in the dependency array of the hook providing the data.
- **Event Name Mismatch**: The event is exactly `"yt_analytics_synced"`. 
  - **Hazard**: Do not use `yt-analytics-synced` or `yt_sync`.

## Verification
- Click the "Sync" or "Fetch" button in the Sidebar or Nexus Commander.
- Observe the target component: it should show a loading state (if implemented) or update its values/charts immediately upon sync completion without a page reload.
- Check the console for `Dispatching yt_analytics_synced event` to confirm the source is firing.
