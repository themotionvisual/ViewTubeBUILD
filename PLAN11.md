## Final Stabilization Plan: UI Isolation + Canonical Data + API Expansion Readiness

### Summary
Fix the “infected UI” by isolating each Reference Studio page and toolbox from external style/behavior contracts, re-apply ToolboxUISystem primitives everywhere except source-preview iframes, lock Channel Intelligence to lifetime by default, and repair analytics sync/query contracts so unsupported metric requests stop poisoning results.  
In parallel, prepare clean integration scaffolding for YouTube Data API v3 + Analytics API v2 + Reporting API and staged Google Search + Personal Data ingestion.

### Implementation Changes
1. **UI Containment + Decontamination**
- Introduce strict scope wrappers per main toolbox (`data-ui-scope`) with local CSS variable contracts and no inherited toggle/motion styles from unrelated systems.
- Replace any mixed collapse controls with one canonical ToolboxUISystem toggle primitive (4-arrow open/close behavior, fixed header, dropdown body motion, semi-transparent shadow tokens).
- Ensure each main toolbox has independent state and style namespace so one page/toolbox cannot bleed into another.
- Keep source preview iframe boxes isolated (`all: initial` boundary wrapper where needed) so external HTML styles cannot leak into app UI.

2. **Reference Studio Surface Recovery**
- Re-apply ToolboxUISystem shell styling to:
  - section sources lab
  - component catalog
  - chart catalog
  - chart spec implementation
  - toolbox recreation
- Keep source-fidelity components inside subtoolboxes, but force shell/header/toggle primitives to the canonical system.
- Remove remaining ad-hoc plus/minus indicator variants not explicitly required by source reproduction.

3. **Channel Intelligence Lifetime Contract**
- Lock Channel Intelligence Lab default window and sync targeting to `lifetime` (UI default + sync post-refresh selection).
- Keep optional window selector for analysis comparisons, but never downgrade initial sync/read path to 28d.
- Add explicit “Lifetime Synced” state label tied to last successful lifetime bundle timestamp.

4. **Analytics Query Contract Repair (Root Data Issue)**
- Split metric requests by valid dimension scope to eliminate current 400 batches:
  - video-dimension valid metrics
  - channel-level only metrics
  - CSV-only metrics (never sent to Analytics API)
- Add capability registry (`metric -> supported dimensions/scope/source`) used by sync + table renderer.
- Hard-stop unsupported query generation (no more invalid fallback retries for impossible combos).
- Preserve canonical selector path as single source (`getMasterRows/getMetricSummary`), with applicability rules rendering explicit `N/A` for inapplicable metrics.

5. **Data Table Contract Completion**
- Finalize dataset schemas: master, daily, traffic, audience, country, device.
- Enforce per-column applicability:
  - shorts-only
  - long-only
  - channel-only
  - shared
- Remove duplicate daily columns and conflicting aliases.
- Keep verified-correct stats unchanged while restoring missing fields (shares/impressions/CPM/viewer segments only when truly available).

6. **Google + Personal Data Expansion (Staged, Readiness-First)**
- Phase A now: add provider scaffolding and connectors disabled by config until credentials are ready.
- Phase B when enabled:
  - Google Search: integrate Search Console first (query/click/impression/CTR by date/page).
  - Personal data analytics: import-first pipeline from Google Takeout/My Activity exports (policy-safe, deterministic).
- Map new sources into canonical warehouse contracts, not direct ad-hoc UI feeds.

7. **Governance (Append-Only)**
- Continue append-only updates for action log, redesign opportunities, source map, used/unused manifests.
- Add phase markers for: UI isolation complete, query-contract fixed, lifetime sync locked, table-contract complete, external-source scaffolding complete.

### Public Interfaces / Types
- `UIScopeContract` for style/toggle isolation by toolbox/page.
- `MetricCapabilityRegistry` (`metric`, `source`, `allowedDimensions`, `applicability`).
- `WindowSyncStatus` including explicit lifetime sync timestamp.
- `ExternalIngestSource` contracts for `search_console` and `takeout_personal_data`.
- No route ID changes.

### Test Plan
1. **UI Isolation**
- Open all affected Reference Studio pages and verify canonical ToolboxUISystem shell/toggle/motion/shadow consistency.
- Confirm no cross-page control contamination when toggling/opening any toolbox.
- Verify source-preview iframe content does not alter parent page styles.

2. **Lifetime Sync**
- Channel Intelligence opens on lifetime and stays lifetime after Sync Now.
- Last sync label reflects lifetime bundle timestamp.
- 28d remains optional comparison only.

3. **Analytics Integrity**
- No 400s from invalid metric+dimension query combinations in console during sync.
- Master/daily/traffic/audience/country/device tables show correct columns only.
- Shorts/long/channel-only metrics render `N/A` when inapplicable (not blank wrong values).

4. **Charts Consistency**
- Chart catalog/spec/performance all use same style tokens.
- No dashed/dotted grid/cursor lines anywhere.

5. **Expansion Readiness**
- Search Console and personal-data connectors appear as disabled-ready integrations until credentials/files are provided.
- Enabling them routes through canonical selectors without bypass logic.

### Assumptions / Defaults
- Keep ToolboxUISystem as the canonical UI; no full daisyUI migration.
- Channel Intelligence default + sync target is lifetime.
- Personal data analytics is import-first (Takeout/My Activity files) until APIs are fully configured.
- Search integration starts with Search Console when Google Cloud credentials are ready.
