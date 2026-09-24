# Herald conversation log

**Status:** HISTORICAL / PARTIAL CONVERSATION INDEX — evidence only  
**Current Herald authority:** `../../agent/contracts/herald-in.md`, `../../agent/contracts/herald-out.md`, `../../agent/contracts/herald-workflow.md`, and `../../.viewtube/herald/**`.  
**Wave 5 note (2026-09-24):** this file predates the implemented thread/ledger contract and contains only an early generated-log shape. Keep it as evidence; do not use it to determine current conversation state, writer locks, workflow gates, or completed work.

One row per AI conversation about ViewTube.

**Generated file** — `npm run log:build` rebuilds it from each conversation's
`meta.json`, so two conversations never touch the same lines. That script does
not exist in this repository yet (not on this branch, not on `origin/main`), so
this first row is hand-written in the shape the generator will produce. Do not
hand-edit once the generator lands.

| Conversation | App | Started | Last worked | Status | Branch | Work | Artifacts |
|---|---|---|---|---|---|---|---|
| Data Visual controller unification — phases 0–4 | Claude Code | 2026-09-16 | 2026-09-18 | in-progress | `claude/viewtube-data-visual-responsive-qyk8rp` | Migrated 7 Data Visual modules onto the canvas contract; made the Data Visuals grid render with no data and stopped imports being discarded; replaced the substring-guessed source-table registry with an explicit one and rewrote every subtitle; landed controller-unification phases 0, 1 and 4. | [2026-09-18--data-visual-controller-unification](artifacts/2026-09-18--data-visual-controller-unification/) · [plan](../migration/data-visual-controller-unification-plan.md) · [canvas contract](../migration/data-visual-canvas-contract.md) · 8 screenshots |
