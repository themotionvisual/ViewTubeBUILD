- `[x]` **Phase 1: Global Sync State & Integration**
  - `[x]` Update `GlobalDataContext.tsx` to include `lastSyncComplete` and `isSyncing` flags
  - `[x]` Embed `globalSyncData()` wrapper resolving `performSync(true)`
  - `[x]` Tie `login()` auto-resolve to fire `globalSyncData()` automatically

- `[x]` **Phase 2: UI Centralization**
  - `[x]` Modify `Sidebar.tsx` to render "Sync Data" when authenticated, pointing tightly to `globalSyncData()`
  - `[x]` Add a loading state representation bound to `isSyncing` in the Sidebar

- `[x]` **Phase 3: Deep Component Refactoring**
  - `[x]` Refactor `PerformanceHub.tsx` to strictly use `canonicalRowsToMasterTableRows` tied to `lastSyncComplete`.
  - `[x]` Refactor `SimpleAnalytics.tsx` to utilize `getMasterRows` cleanly over legacy extractors.
  - `[x]` Overhaul `ResearchLab.tsx` to derive all ~50 chart widget mappings directly from canonical master rows instead of loose string cache lookups.
  - `[x]` Migrate `Dashboard.tsx` to use canonical canonical stats instead of localized storage.
  - `[x]` Migrate `useCanonicalAnalytics.ts` to `GlobalDataContext`. and map canonical cells directly (`r.metrics.views.value`)
  - `[x]` Ensure components automatically react to `useBrain().lastSyncComplete` rather than using disjointed window intervals or DOM event listeners
