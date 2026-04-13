# Channelytics UI Lock Checklist

## Source Priority (Determined)
- [x] **Tier 1 (Must Follow):**
  - `CHANNELYTICS_UI_LOCK_CHECKLIST.md` (UI shell + tool boundaries)
  - `data_compilation_brief.md` (ingestion, dedup, derived fields)
  - `analytics_ecosystem_spec.md` (WorkspaceBrain behavior + table/selection rules)
- [x] **Tier 2 (Implement in Phases):**
  - `master_graph_catalog.md` (7 definitive Google API charts)
- [x] **Tier 3 (Reference, not strict):**
  - `VIEWTUBE_ULTIMATE_COMPILATION.md` legacy/variant material (valuable ideas, not always canonical)

## Locked Tool Architecture
- [x] 4 main tools only:
  - Data & Statistics Asset Manager
  - Data Visualizations
  - Channel Analysis Report
  - Data Tables
- [x] No nested main-tool-in-main-tool stacking.
- [x] One unified row model feeding table + charts + report.

## Phase 1: Frontend Lock (No Data Refactor)
- [x] Keep 4 main tools only:
  - Data & Statistics Asset Manager
  - Data Visualizations
  - Channel Analysis Report
  - Data Tables
- [x] Apply single toolbox shell behavior across all 4 tools.
- [x] Match command-bar pattern for Data Manager:
  - `SYNC NOW`
  - `Auto Detect`
  - `UPLOAD CSV/ZIP/FOLDER`
  - `GENERATE REPORT`
- [x] Match Data Tables toolbox shell:
  - Header + search
  - Master table strip
  - Select-visible workflow
  - Load-more pagination
  - Shorts/Long legend

## Phase 2: Ingestion Hardening
- [ ] RTF trap detection (`{\rtf1}` pre-check)
- [ ] Quoted-comma-safe CSV parser
- [ ] Composite-key dedup (`videoId|date`) with highest-value win
- [ ] Table-data fallback when chart rows are missing

## Phase 3: Data Normalization
- [ ] Canonical header mapping (`Views`, `Revenue`, `RPM`, `CTR (%)`, etc.)
- [ ] Auto tagging (`shorts`, `long`, `combined`, etc.)
- [ ] Derived fields (`titleLength`, engagement helpers)

## Phase 4: Chart + Report Binding
- [ ] Bind all visualization metrics to normalized state
- [ ] Keep Oracle report in strict 5-pillar format
- [ ] Ensure table/chart/report use the same unified row model

## Phase 5: Master Graph Catalog (Top-Priority Rollout)
- [x] Chart 1: Top Performers Trio
- [x] Chart 2: Video Value Matrix (CTR × AVP, bubble by Views)
- [ ] Chart 3: Discovery Radar / Traffic Signature
- [x] Chart 4: Algorithm Trigger (Impressions × CTR)
- [x] Chart 5: Device Immersion (3D Pie)
- [x] Chart 6: Narrative DNA (WordTree)
- [x] Chart 7: Global Footprint (GeoChart)
- [ ] Apply unified neo-brutalist chart shell styling to all 7

## Rule of Execution
- UI parity first, data second.
- No new nested toolbox layers.
- One source of truth for parsed rows feeding all 4 tools.
