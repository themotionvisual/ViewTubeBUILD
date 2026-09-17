# Time Windows — Visuals, Controls and Shared Context

**Date:** 2026-09-17 · **Branch:** `claude/time-window-implementation-plan-lyyj7f`
**Response contract:** written under HERALD-OUT T2 (`agent/contracts/herald-out.md` @ origin/main)
**Predecessors:** `TIME_WINDOW_IMPLEMENTATION_PLAN_2026-09-11.md` (phases 0–4 landed),
`TIME_WINDOW_COMPLETION_AND_DATA_BASIN_PLAN_2026-09-14.md` (PRs 13–17 landed)

---

## §1 READBACK

```
INTENT     Finish time windows across the remaining UI: data visuals get a real
           control, all surfaces share one window selection, and the settings are
           discoverable rather than per-surface local state.
ASSUMING   "features UI visualization etc." = the 49 data-visual modules plus the
           shared selection context; NOT a new settings page or a new design system.
NOT DOING  The data basin (PRs 20-23) — separable, and stoppable after this work.
           No change to what the engines fetch; that side is complete.
TIER       T2        VERB  PLAN
```

Tier is T2 because it crosses ≥2 canonical owners (VT-SYNC snapshot/store and the
analytics/visual registries) and introduces a shared context consumed by tables,
visuals and Brain evidence.

---

## §2 PRIOR-ART

**Verdict: `PARTIAL` — the window vocabulary and the table control exist; the visual
control does not, and one duplicate vocabulary survives.**

Searched, in the contract's order:

| Source | Result |
|---|---|
| `docs/` on origin/main (79 tracked) | no doc describes visual window controls |
| `docs/DATA_VISUAL_MODULE_UNIFICATION.md` | grep `window\|7d\|28d\|time range` → **0 hits** |
| Branch sweep — `git ls-remote --heads origin`, 343 branches | 3 visual branches: `feat/data-visual-module-unification` (aa38542a), `claude/viewtube-data-visual-responsive-qyk8rp` (5da3681b), `codex/data-visual-preview-16x9` (79cbf44b) — all unification/responsive/aspect work, **none windowed** |
| This branch (18 commits) | window contract, engine loops, budget, table rail — all landed |

Two findings that change the work:

1. **`VtSyncVisualModuleSpec.controls` already declares `{ id: "window", kind: "select" }`**
   for some visuals — but it is **metadata only**. `VtSyncVisualFrame` never renders it;
   its own `controls` prop is an unrelated chrome mode (`"menu" | "inline"`). The
   declaration has always been inert.
2. **`visualData.ts:11` redeclares `AnalyticsWindow` locally** — a fourth copy of the
   vocabulary that the Phase 0 unification missed. My earlier claim that no duplicates
   remained was based on a grep for day-lookback ladders, which a bare type alias does
   not match.

---

## §3 OWNER

From `docs/migration/reference/VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json`:

| Path | System | Owner | Status |
|---|---|---|---|
| `src/features/vt-sync-local/**` | VT-SYNC | VT-SYNC snapshot/store | canonical-live |
| `src/services/analytics-canon/**` | Analytics Canon | `src/services/analytics-canon` | canonical-live |
| `src/features/vt-sync-local/shell/VtSyncVisualFrame.tsx`, visual registries | Analytics / Data Explorer / Visual Analytics | analytics surfaces + widget/visual registries | active-development |

Two owners ⇒ T2, as classified. VT-SYNC keeps ingestion; analytics-canon keeps
normalized consumer access; the visual frame owns rendering. **No ownership moves.**

---

## §4 BETTER-PATH

**Simpler route considered:** give each visual its own window `useState`, like the table
has. Rejected — 49 modules × local state is 49 places for the selection to disagree, and
the architecture reference (§4) already specifies one shared `AnalyticsViewContext` for
tables, visuals, insights and Brain evidence. A per-module knob also cannot answer "show
me everything at 28d", which is the actual creator question.

**Simpler route taken:** the frame renders the control from the `controls` array each
module already declares. No per-module UI code, no new design system, and modules opt in
declaratively — which is why the existing (inert) declaration is worth keeping rather
than replacing.

---

## §5 OBSTACLES

Each verified by command in this checkout.

**O1 — `.gitignore` will silently drop two of the paths this work wants.**
```
$ git check-ignore -v agent/registry/candidates.md
.gitignore:2:/*        agent/registry/candidates.md
$ git check-ignore -v docs/herald/TEST.md
.gitignore:61:docs/*   docs/herald/TEST.md
$ git check-ignore -v docs/migration/TEST_PLAN.md
.gitignore:64:!docs/migration/**   → TRACKABLE
```
`agent/registry/candidates.md` **exists on origin/main** (force-added) but is ignored
here. §8 LEVERAGE-OUT says to append recommendations to it; doing so on this branch
would commit nothing and report success. This plan therefore lands in
`docs/migration/`, the one tracked docs subtree.

**O2 — `main` does not build.** Two unresolved `editor-design-library` imports in
`src/features/editor/mobile/components/TemplateLibraryPanel.tsx` (commit `497c45f`,
an off-by-one in a relative path). Verified identical on `e68fcfd` with none of this
branch's code present. `npm run build` is therefore **not** a usable gate; the gate is
*no new* errors versus the main baseline.

**O3 — Baseline is not green and must be diffed, never counted.** `main` carries 56
type errors and 11 failing tests. A raw count hides a swap; every check compares error
*sets*.

**O4 — The visual frame cannot render in tests.** `VtSyncToolboxDataTable` (6.4k lines)
and the visual shells carry browser dependencies, which is why their suites are
source-assertion based. Visual control work needs Playwright evidence, not unit tests
(§10 VISUAL).

**O5 — 41 of 48 windowable tables still show nothing** until a windowed sync runs. The
same will be true of visuals. This is correct behaviour, not a defect — but it means UI
work cannot be validated without either a real channel or a fixture snapshot.

---

## §6 LEVERAGE-IN

Checked against `agent/registry/capabilities.md` (verified 2026-09-16).

| Surface | Reusing |
|---|---|
| Skills | `viewtube-prince-observatory` (lead), `viewtube-widget-dashboard`, `viewtube-mobile-widget-system`, `dataviz`, `viewtube-verification-chancellor`, `run` |
| Scripts | `scripts/capture-phase5-built-ui.mjs` — Playwright capture that already handles auth walls and writes `manifest.json` |
| MCP | Vercel (preview verification), GitHub (PR) |
| Existing code | `services/analytics/windows.ts` (vocabulary), `windowDerivation.ts` (free windows), `windowBudget.ts` (cost), `resolveVtSyncTableRowsForWindow` (resolution + provenance), `VtSyncVisualModuleSpec.controls` (declaration already present) |
| CI | `.github/workflows/release-gates.yml` |

**Nothing new is needed.** The one genuinely new artefact is the frame-level control
renderer, because no existing component renders `VtSyncVisualControlSpec`.

---

## §7 REFERENCES

| Path | Class | Establishes | Does NOT establish |
|---|---|---|---|
| `agent/contracts/herald-out.md` @ origin/main | canonical | this response format | — |
| `docs/migration/reference/VIEWTUBE_VT_SYNC_ANALYTICS_ARCHITECTURE_MASTER_REFERENCE_2026-09-03.md` §3–§9 | canonical | window model, `AnalyticsViewContext` shape | nothing about current code |
| `docs/migration/reference/VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json` | canonical | 28 systems, owners | — |
| `docs/DATA_VISUAL_MODULE_UNIFICATION.md` | canonical | visual module unification | **no window content — 0 grep hits** |
| `feat/data-visual-module-unification` @ aa38542a | active branch | unification in flight | not windows |
| `docs/migration/TIME_WINDOW_*` (this branch, ×2) | canonical | what landed and why | — |

---

## §8 LEVERAGE-OUT

Recorded here because `agent/registry/candidates.md` is unwritable on this branch (O1).
**Merge these into that file from a branch where `agent/` is tracked.**

| Candidate | Surface | Gives this task | Fit | Caution | Verified |
|---|---|---|---|---|---|
| `scripts/herald-capabilities.mjs` (phase H1, not yet built) | script | regenerates the capability registry instead of hand-verifying | evaluate | does not exist yet | 2026-09-17, absent from origin/main |
| Playwright visual-regression gate in `release-gates.yml` | CI workflow | would make §10 VISUAL automatic rather than remembered | defer | needs stable fixture data first (O5) | 2026-09-17 |
| `.claude/settings.json` hook enforcing HERALD-OUT tiers | hook | capability registry lists hooks as unused; this contract is currently remembered, not enforced | evaluate | Herald phase H0 owns this; do not pre-empt | 2026-09-17, file absent |

No external repositories recommended — nothing here needs a dependency.

---

## §9 PLAN

### PR 18 — visual window control (the last user-facing gap)

1. `src/features/vt-sync-local/adapters/visualData.ts:11` — delete the local
   `AnalyticsWindow` alias; import from `services/analytics/windows`.
2. `src/features/vt-sync-local/shell/VtSyncVisualFrame.tsx` — render
   `spec.controls` where `kind` is `select` and `id` is `window`, from
   `ANALYTICS_WINDOWS` + `WINDOW_SHORT_LABELS`. One renderer; all 49 modules opt in
   by declaration.
3. `VtSyncVisualModuleSpec` — add `supportedWindows?: AnalyticsWindow[]` so a
   window-invariant module hides the control instead of showing a dead one.
4. Route visual data through the same resolver the tables use, so a visual reports
   `derived` / `window_exact` / `not_synced` identically. **A chart silently redrawing
   lifetime data under a 28d label is worse than a table doing it — there is no column
   header to check.**
5. Per `dataviz` + `viewtube-widget-dashboard`: empty, loading, partial, stale and
   `not_synced` are acceptance states, at 390px too.

```bash
npx tsc -b            # diff error set vs main (O3)
npx vitest run
npm run check:css && npm run check:architecture
node scripts/capture-phase5-built-ui.mjs   # §10 VISUAL, 1440x1000 + 390x844
```

### PR 19 — one shared selection

`AnalyticsViewContext` per architecture reference §4, defaulting to each surface's
**current** local state, migrated table → visuals → Brain evidence one at a time. Do
not rewrite all three at once.

### PR 20 — settings surface

Persist the selection (per channel) and expose default-window preference. Only after
19, so there is one thing to persist rather than three.

---

## §10 STATUS

```
STATUS    partial
PROVEN    Herald contract located and read (git show origin/main:agent/contracts/herald-out.md)
          Branch sweep: 343 remote branches, 0 with visual window work (git ls-remote --heads origin)
          Ignore traps: candidates.md + docs/herald ignored; docs/migration trackable (git check-ignore -v)
          Owners resolved from VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json
          Table window rail renders, responds to clicks, disables on lifetime-only
            tables, and wraps at 390px (Playwright, /analytics, anon, fixture-empty)
CLAIMED   PR 18-20 sequencing is correct and the frame-level renderer is sufficient
            for all 49 modules — inferred from the spec shape, not executed
UNKNOWN   No windowed sync has ever run against a real channel; every window_exact
            path is proven only with synthetic snapshots
          DB v2 upgrade proven only against fake-indexeddb, never a real profile
          Visual control not yet built, so no VISUAL evidence for it exists
CHANGED   docs/migration/TIME_WINDOW_UI_VISUALS_PLAN_2026-09-17.md (this file)
VISUAL    not required — this change is a doc
```

---

## §11 KNOW

- **`main` has been broken since `497c45f`.** Production auto-deploys from `main`
  (`CLAUDE.md`), so a failing build there outranks everything in this plan. One-character
  fix, own PR, not this branch.
- **Five of eight capability surfaces are unused** (`agent/registry/capabilities.md`):
  sub-agents, slash commands, hooks, permissions, and half of scripts. Hooks are the one
  that matters here — this contract is currently remembered rather than enforced.
- **I previously told you the herald process did not exist.** It did. I searched my
  working tree and local refs, but merged `main` on 09-14 and the doc landed 09-15; I
  never re-fetched before declaring absence. The lesson is the contract's own rule:
  branch sweeps use `git ls-remote`, never local refs.

---

## §12 LEDGER

- Thread: time-window implementation, session `01P4Yu3S3jJCJh6WBiCigygZ`
- Prior turns: plan (9e77d4a) → contract (674ee85) → provenance (80c1b48) → 7d (d5d558a)
  → derivation (4e5723c) → display+ledger (5a8cbe6) → DB v2 (b2a7180) → engine loops
  (d6102ee) → controller (ec75879) → table rail (fea1ebf) → main merge (4cbac13)
  → review fixes (747611d) → budget (7291f17) → video windows (52f8bd6)
  → traffic/playlists (1119f73) → canonical+coordinator (740e6ee)
- Related docs: `TIME_WINDOW_IMPLEMENTATION_PLAN_2026-09-11.md`,
  `TIME_WINDOW_COMPLETION_AND_DATA_BASIN_PLAN_2026-09-14.md`
