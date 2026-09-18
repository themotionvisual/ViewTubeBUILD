# Data Visual controller unification — phases 0–4

**Conversation:** Data Visual responsive canvas → controller unification
**Branch:** `claude/viewtube-data-visual-responsive-qyk8rp`
**Dates:** 2026-09-16 → 2026-09-18
**App:** Claude Code

## What this conversation did

Migrated seven Analytics Data Visual modules onto the canvas contract, made the
Data Visuals grid render without data, replaced a substring-guessed data-source
registry with an explicit one, and began the controller unification plan
(phases 0, 1 and 4 of seven).

## Contents

| Path | What |
|---|---|
| `SCREENSHOTS.md` | every capture, in order, one scrollable page |
| `screenshots/` | 8 PNGs — 4 visuals × 2 viewports |
| `documents/data-visual-controller-unification-plan.md` | the seven-phase plan (also at `docs/migration/`) |

## Status of the plan

| Phase | State |
|---|---|
| 0 — record current controller shape | **done** — `dataVisualControllerShape.test.tsx` + snapshot |
| 1 — delete the dead registry spec | **done** |
| 2 — one row renderer, one width authority | **partial** — width rule extracted to `controllerRowWidth.ts`; the two render paths are not yet merged |
| 3 — collapse the row vocabulary | not started |
| 4 — row order back to the modules | **done** |
| 5 — `controllerProfile` per visual, band/sheet layouts | not started |
| 6 — retire `vt2-preserved` | not started |
| 7 — wire or delete the responsive attributes | not started |

## Generators

`node scripts/herald-artifacts.mjs index` and `npm run log:build` do not exist
in this repository yet — not on this branch and not on `origin/main`. This
README and `SCREENSHOTS.md` were written by hand in the shape the contract
prescribes, and should be regenerated once the scripts land.
