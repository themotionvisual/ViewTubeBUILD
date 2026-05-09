# Redundancy Registry

## Rules
- Canonical-first feature harvest only.
- No direct imports from `_quarantine/`.
- No new `copy`, `*.bak`, or backup-tree files in active runtime paths.

## Current Quarantine Inventory

| Source | Canonical Target | Status | Merge Decision |
| --- | --- | --- | --- |
| `src/components/ToolboxUISystem copy.tsx` | `src/components/ToolboxUISystem.tsx` | Quarantined | Harvest selective UI control improvements only if test-backed |
| `src/components/Graph page charts .../ChartEngine copy.tsx` | `src/components/ChartEngine.tsx` | Quarantined | Evaluate for net-new chart capabilities; otherwise retire |
| `src/components/Graph page charts .../ResearchLabCharts copy.tsx` | `src/components/ResearchLabCharts.tsx` | Quarantined | Compare chart coverage and keep canonical API shape |
| `src/components/Graph page charts .../UnifiedChartModule copy.tsx` | `src/components/UnifiedChartModule.tsx` | Quarantined | Harvest only proven rendering/contract improvements |
| `src/views/ResearchLab.tsx.before.bak` + `.after.bak` | `src/views/ResearchLab.tsx` | Quarantined | Treat as historical snapshots, not runtime candidates |
| `public/editors/BACK VRSNS/*.html` | `public/editors/VT_E1*.html` | Quarantined | Keep for provenance only; do not mount in routes |
| `src/views/dashboard/scratch/*.py` | `src/views/dashboard/*` | Quarantined | Keep as offline notes/scripts; no runtime coupling |

## Decision Workflow
1. Diff quarantined file against canonical owner.
2. Extract candidate improvements as isolated commits.
3. Add/adjust tests proving canonical behavior.
4. Mark registry row as `Harvested` or `Rejected` with reason.
