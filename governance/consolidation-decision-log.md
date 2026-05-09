# Consolidation Decision Log

## 2026-05-09 — Phase 1 Contamination Cleanup

### Decision
Move non-runtime legacy artifacts into `_quarantine/` without deletion.

### Why
- Typecheck and lint were contaminated by duplicate/copy files and OS artifacts.
- Duplicate file families obscured canonical ownership and created contract drift noise.

### What moved
- `.DS_Store` files under active source/public/dist paths.
- `copy` variants and backup trees in `src/components` and `public/editors/BACK VRSNS`.
- `*.bak` snapshots and dashboard scratch scripts.

### Guardrails added
- `_quarantine` excluded from TypeScript and ESLint active surfaces.
- `scripts/check-quarantine-integrity.mjs` blocks quarantine imports and duplicate-name artifacts in active paths.
- Canonical ownership map and redundancy registry created under `governance/`.

### Next merge waves
1. UI/toolbox variant feature-harvest into canonical primitives.
2. Service-layer duplicate adapter consolidation.
3. Route/view-level alternate implementation reconciliation.
