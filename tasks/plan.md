# Implementation Plan: ViewTube Settings Frontend System Redesign

Date: 2026-09-24  
Source spec: `tasks/SPEC-settings-frontend-redesign.md`

## Overview

Rebuild the Settings presentation layer as a compact primitive-driven workspace while preserving current backend/service behavior. Implementation proceeds as vertical slices so each migrated panel is usable and verifiable before the old frontend is removed.

## Architecture decisions

1. **Preserve the backend seam.** `Settings.tsx` remains the initial owner of service calls. The redesign changes presentation architecture first.
2. **Create one grouped UI model.** Replace the giant flat prop surface with domain-grouped UI models/actions without changing the underlying services.
3. **Use ViewTube primitive authority.** `SubToolboxPrimitives`, `SubToolboxLayouts`, `Toolbox` tokens and current Studio wrappers own geometry/interaction.
4. **Do not introduce FLOWSTACK as a runtime dependency.** No FLOWSTACK package is currently installed. FLOWSTACK guidance is used for ownership/composition discipline only.
5. **Density is a product requirement.** Large hero/card presentation is intentionally replaced rather than polished.
6. **Keep URL panel identity stable.** Existing `settingsControlDeck` panel IDs and aliases are preserved.

## Dependency graph

```
Settings backend/service handlers
          |
          v
Settings UI model / controller adapter
          |
          +--> Settings workspace shell + panel navigation
          |          |
          |          +--> Overview
          |          +--> Experience
          |          +--> Account
          |          +--> AI Runtime
          |          +--> Dashboard Widgets
          |          +--> Billing
          |          +--> Data + Privacy
          |          +--> Help + Legal
          |
          +--> shared confirmation/status patterns
                     |
                     v
             legacy frontend deletion
                     |
                     v
        responsive/accessibility certification
```

## Phase 1 — Contract and shell foundation

### Task 1: Freeze Settings behavior contract

Document and test the current panel IDs, route aliases, backend actions and destructive semantics before visual replacement.

Acceptance:
- every current `SettingsPanel` ID/alias has a test;
- account/AI/billing/data action callback contracts are enumerated;
- no production UI behavior changes.

Files likely:
- `src/views/settings/settingsControlDeck.test.ts`
- new Settings frontend contract test/model file

### Task 2: Introduce grouped Settings UI model

Create a narrow presentation-facing model grouped by panel/domain, produced from current `Settings.tsx` state/actions.

Acceptance:
- no backend service changes;
- no leaf panel needs the current giant flat prop list;
- controller adapter is testable independently from visual components.

### Task 3: Build compact Settings workspace shell

Add compact page header/status, responsive panel navigation and panel canvas.

Acceptance:
- existing query-param routing still drives the active panel;
- desktop supports sticky rail;
- mobile uses a one-row selector;
- no giant hero;
- no nested top-level toolbox frame.

Checkpoint A:
- Overview route renders through new shell;
- build succeeds;
- desktop/mobile shell screenshots captured.

## Phase 2 — Low-risk panel tracer slices

### Task 4: Migrate Overview

Use metric/status primitives and one compact next-action row.

Acceptance:
- readiness data parity;
- next-panel action parity;
- at least 50% less top-of-page chrome than current desktop UI.

### Task 5: Migrate Experience

Replace custom toggle cards with primitive rows and compact grouped controls.

Acceptance:
- all current workspace UX toggles work;
- navigation layout selection remains live;
- recent/pinned reset actions remain live;
- ordinary preference rows use canonical L1/L2 geometry.

Checkpoint B:
- Overview + Experience certified on desktop/mobile;
- no custom Settings toggle geometry remains in migrated panels.

## Phase 3 — Identity and AI

### Task 6: Migrate Account

Consolidate identity, account and YouTube connection into compact status/action groups.

Acceptance:
- connect/disconnect behavior parity;
- profile/channel state parity;
- public handle/source controls shown under the same conditions as current code.

### Task 7: Migrate AI Runtime

Move Creator Brain readiness, model selection and API-key controls to primitive groups.

Acceptance:
- model selection parity;
- BYOK visibility rules parity;
- API-key reveal/save behavior parity;
- intake link parity.

Checkpoint C:
- Account + AI targeted tests pass;
- auth/connection states visually certified.

## Phase 4 — Dashboard widget management

### Task 8: Replace widget cards with compact management rows

Use search, primitive filters, status badges and switches.

Acceptance:
- show ready / show previews / hide all / reset parity;
- search/category filter parity;
- every widget row exposes title, status and visibility;
- Preview widgets remain clearly marked;
- no widget preview rendering is added.

## Phase 5 — Billing and data

### Task 9: Migrate Plan + Credits

Replace all-plan card wall with active-plan summary + compact selector + selected-plan detail.

Acceptance:
- current plan and credit meter parity;
- checkout, portal, top-up and referral actions unchanged;
- plan pricing/copy comes from current sources/constants;
- only selected plan detail is expanded by default.

### Task 10: Migrate Data + Privacy

Consolidate ingest mode, public handle, export, transparency and recovery controls.

Acceptance:
- ingest/public-handle parity;
- export parity;
- soft reset / factory reset parity;
- transparency link parity.

### Task 11: Replace destructive confirmation chrome with primitive dialog composition

Retain current typed confirmations and focus behavior.

Acceptance:
- Escape closes;
- focus remains contained/restored;
- required confirmation string preserved;
- account deletion semantics unchanged.

Checkpoint D:
- billing/data actions manually exercised against current backend;
- no service import moved into presentation leaf components.

## Phase 6 — Help, cleanup and governance

### Task 12: Migrate Help + Legal

Use compact grouped link rows and primitive disclosures.

Acceptance:
- all current destinations preserved;
- no duplicate link card style remains.

### Task 13: Delete legacy Settings visual authority

Remove obsolete custom card/button/input/toggle implementations and unused CSS/classes.

Acceptance:
- no Settings-local duplicate primitive geometry;
- no dead Settings frontend components;
- no orphan imports.

### Task 14: Add Settings primitive-governance tests

Guard against future drift.

Acceptance:
- test rejects legacy custom Settings control classes/patterns;
- test asserts migrated panels import canonical primitive owners;
- route/backend contract tests remain green.

## Phase 7 — Responsive and accessibility certification

### Task 15: Responsive certification

Capture and inspect:
- desktop top navigation;
- desktop wide/thin/rail;
- narrow/tablet;
- mobile portrait;
- mobile landscape.

Acceptance:
- no clipping/overflow;
- mobile titles wrap;
- panel state survives orientation changes;
- sticky elements do not cover content;
- vertical chrome target met.

### Task 16: Interaction/accessibility certification

Exercise:
- keyboard-only;
- focus states;
- disconnected/error/loading/disabled;
- destructive confirmation;
- reduced motion.

Acceptance:
- semantic states exposed correctly;
- focus order matches layout;
- no color-only state;
- touch targets remain usable.

## Checkpoint: Complete

- all eight panels migrated;
- all current backend actions have parity;
- production build passes with no new failures versus main;
- targeted Settings/Toolbox tests pass;
- local smoke passes;
- screenshot matrix approved;
- old Settings frontend authority removed.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Settings backend and UI are tightly entangled | High | introduce grouped UI model before broad visual migration |
| Current main has unrelated type/test failures | Medium | compare every verification result to same-day main baseline; require zero new failures |
| Primitive API is broad and migration waves are still active elsewhere | Medium | use only registry families marked ready/current; avoid changing primitive geometry in this initiative |
| Billing/auth destructive regressions | High | migrate those panels after shell/low-risk slices; preserve service owners and add parity tests |
| Density hurts readability | Medium | L1 as default repeated setting row; L2 only for secondary/metadata controls; mobile certification |
| New shell duplicates Toolbox hierarchy | Medium | page shell remains application-owned; only settings groups use SubToolbox |
| Main branch moves quickly | High | one feature branch per wave; overlap audit before every PR/merge |

## Parallelization

Safe after Tasks 1–3 settle the contracts:
- Overview + Experience
- Account + AI
- Dashboard Widgets
- Help + Legal

Sequential:
- UI model before panel migrations;
- Billing/Data after confirmation contract;
- legacy deletion only after parity;
- certification after all panels land.

## Definition of done

The Settings page should feel like the same product as Studio/Projects: one system, one primitive vocabulary, compact operational hierarchy, and no custom frontend subsystem hiding inside Settings.
