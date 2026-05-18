# PerformanceHub Validation

## Primary validation surface
`src/views/PerformanceHub.tsx`

## Acceptance checks after sync changes
1. `syncDiagnostics` exists for the active analytics window.
2. `attemptedGroups.impressions_ctr` shows explicit thumbnail metric attempts.
3. `failureReasons` is 0 on the happy path, or explains the exact thumbnail request class that failed.
4. `knownInvalidCombos` does not grow unbounded for the same impressions/CTR request class in one run.
5. Master video table shows non-placeholder values for `Impressions` and thumbnail `CTR` when the API returns data.
6. Header row does not contain duplicate semantic CTR or impressions columns.
7. If thumbnail metrics remain unavailable, the UI presents an actionable unavailable state instead of silently rendering `0`.
8. When request-shape failure persists, PerformanceHub/DataTransparency show CSV fallback guidance and keep `Impressions`/`CTR %` visible as `-`.

## Diagnostics interpretation
- If `failureReasons` includes `impressions_ctr`, inspect request-shape compatibility first.
- A `requestClass` of `video_top_videos_channel_filter` with `outcome=quarantined` means the API rejected the current top-videos request shape for that run; keep the columns visible and treat the state as temporarily unavailable.
- If `disabledMetrics` contains thumbnail metrics, verify fallback logic and invalid-combo suppression behavior.
- If group succeeds with 0 rows, verify target video IDs, page depth, and upstream data availability windows before changing aliases.

## QA smoke scenarios
- Scenario A: prior 400 on thumbnail metrics is resolved by switching away from per-video filtered requests.
- Scenario B: alias conflict still resolves to one canonical impressions column and one canonical CTR column.
- Scenario C: `creatorContentType` still fails, but impressions/CTR diagnostics remain isolated and actionable.
- Scenario D: AI queue failure occurs, but analytics diagnostics and table data remain intact.

## Done criteria
A change is done when:
- diagnostics are explicit,
- data mappings are stable,
- table/chart outputs match canonical metric contracts,
- and no silent fallback masks root cause.

## Post-launch optimization backlog
- Quarantine and later optimize `creatorContentType` retries and fallbacks.
- Review auth popup COOP polling noise in `authSession.ts`.
- Audit `setInterval` / forced reflow hotspots after the analytics launch path is stable.
