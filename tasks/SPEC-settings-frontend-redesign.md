# Spec: Settings Frontend System Redesign

Date: 2026-09-24  
Status: Proposed / implementation not started  
Scope: Settings frontend architecture, information hierarchy, responsive composition, and primitive migration.  
Backend policy: Preserve existing account, billing, AI, data, authentication, dashboard, and persistence contracts.

## Objective

Replace the current Settings frontend with a compact, uniform ViewTube Settings Workspace that:

- uses the canonical Toolbox / SubToolbox primitive system instead of hand-built card/control variants;
- removes the large page hero and repeated card-inside-card chrome;
- substantially reduces vertical space while improving scanability;
- keeps all existing backend/service behavior and settings routes intact;
- works as one coherent system across desktop, tablet, mobile portrait, and mobile landscape;
- makes section navigation, state, destructive actions, and feedback consistent with the rest of ViewTube.

This is a frontend replacement, not a backend rewrite.

## Current-state audit

The current Settings surface has a sound backend/controller seam but a drifting presentation layer.

### Backend/controller assets to preserve

The current `src/views/Settings.tsx` owns or coordinates:

- ViewTube account and Google/YouTube connection state;
- `billingEntitlement` checkout, portal, top-up, referral and entitlement state;
- Creator Brain readiness/context;
- Gemini/API-key vault state;
- public-handle resolution and ingest mode;
- export bundle generation;
- soft reset, factory reset and account deletion flows;
- query-param panel routing through `settingsControlDeck`;
- workspace UX preferences;
- dashboard widget visibility;
- local recent/pinned navigation data.

These service contracts remain authoritative.

### Frontend drift to replace

The current UI duplicates the ViewTube design system through:

- giant page hero/chrome before the first setting;
- custom `Card`, `buttonClass`, `inputClass`, and toggle implementations;
- custom navigation tiles rather than canonical primitive navigation controls;
- repeated 3px/4px bordered cards nested inside larger cards;
- large plan cards that show all plans at once;
- large Experience cards for simple boolean settings;
- widget visibility cards rather than compact rows;
- separate custom styling rules across Settings subsections;
- repeated descriptions that increase height without improving the task.

The canonical primitive registry already owns the required jobs.

## Product mode

Operate.

Settings is an operational surface. Priorities are:

1. scanability;
2. fast direct manipulation;
3. low vertical overhead;
4. consistent state feedback;
5. predictable mobile interaction;
6. compact but accessible controls;
7. visual consistency with ViewTube creator tools.

## Governing frontend rules

1. **One page shell.** No giant marketing-style hero.
2. **One structural hierarchy.** Page shell -> panel -> SubToolbox -> primitive. Avoid card-inside-card nesting.
3. **Primitive-first.** Feature code may compose primitives but must not redefine primitive geometry.
4. **Level DNA owns size.**
   - Toolbox shell/header authority: canonical toolbox DNA.
   - L0: 56px / 4px / 24px type.
   - L1: 48px / 3px / 18px type.
   - L2: 32px / 2px / 12px type.
5. **Use compact variants for repeated controls.** A boolean preference should normally be one L1/L2 row, not a 100px+ card.
6. **Keep the normal state self-explanatory.** Long explanatory copy moves to help/tooltip/disclosure.
7. **Progressive disclosure.** Dangerous, advanced, referral, API-key and recovery controls can collapse until needed.
8. **No backend duplication.** New UI components receive UI-facing models/actions; they do not call billing/auth/reset services directly.
9. **No new runtime dependency.** FLOWSTACK plugin guidance informs ownership/composition only. The repository currently has no installed FLOWSTACK package, so this redesign uses ViewTube’s existing primitive system.
10. **Preserve URL contracts.** Existing `?panel=` values and aliases stay valid.

## Target information architecture

Keep the eight existing panel identities because routes, links and user memory already depend on them:

1. Overview
2. Account
3. AI Runtime
4. Dashboard Widgets
5. Experience
6. Plan + Credits
7. Data + Privacy
8. Help + Legal

Do not add another category level above them.

### Desktop layout

- compact page status/header strip;
- persistent settings rail at left;
- active panel canvas at right;
- panel canvas uses one or two columns depending on available width;
- major settings groups are `SubToolbox` sections;
- low-value/advanced groups may start collapsed;
- section rail remains visible while the content scrolls.

### Tablet / narrow desktop

- compact top panel selector using canonical tabs or split dropdown;
- panel canvas remains one/two columns based on width;
- no left rail if it would squeeze content.

### Mobile portrait

- 56px maximum page/header strip;
- one 48px sticky section selector directly below it;
- full-width SubToolboxes with minimal horizontal margin;
- repeated preferences become compact rows;
- destructive/advanced sections collapsed by default;
- keyboard-opening inputs restore workspace position using the existing UX preference system.

### Mobile landscape

- preserve active panel, open groups, focus and scroll position;
- use compact section selector;
- allow two-column control groups when height permits;
- never hide required confirmation or save actions below clipped content.

## New frontend architecture

### 1. Settings controller seam

Keep `src/views/Settings.tsx` as the owner of existing service calls during migration.

Introduce a UI-facing grouped model rather than the current very large flat prop list.

Proposed UI groups:

- `overview`
- `identity`
- `aiRuntime`
- `dashboard`
- `experience`
- `billing`
- `dataPrivacy`
- `support`

The model may be produced by a small adapter/hook, but must not change backend service contracts.

### 2. Settings workspace shell

Proposed application-owned components:

- `SettingsWorkspace`
- `SettingsCompactHeader`
- `SettingsPanelNav`
- `SettingsPanelCanvas`
- `SettingsPanelHeader`
- `SettingsGroup`
- `SettingsControlRow`
- `SettingsStatusStrip`
- `SettingsDangerGroup`

These are composition components only. They must consume canonical ViewTube primitives rather than invent geometry.

### 3. Primitive ownership map

Use existing owners wherever possible:

| UI job | Canonical owner |
| --- | --- |
| panel shell/group | `SubToolbox` |
| compact layouts | `SubToolboxStack`, `SubToolboxGrid`, `SubToolboxActions`, `SubToolboxSection` |
| text input | `SubToolboxInput` / Studio input wrapper if required by current ownership |
| textarea | `SubToolboxTextArea` |
| field label | `SubToolboxFieldLabel` |
| select | `SubToolboxSelect` / split dropdown |
| toggle preference | `SubToolboxSettingsSwitch` |
| segmented choice | `SubToolboxSegmentedToggle` |
| buttons | `SubToolboxButton`, `SubToolboxIconButton`, canonical action buttons |
| status | `SubToolboxStatusBadge`, `SubToolboxBadge` |
| readiness/credit progress | `SubToolboxProgressValue`, `SubToolboxMeter`, `SubToolboxMetricStrip` |
| compact statistics | `SubToolboxStatCard` / `SubToolboxDataStats` |
| repeated settings rows | `SubToolboxSelectableListRow` / composition row |
| tabs | `SubToolboxTabs` |
| tooltip/help | `SubToolboxTooltip` / `SubToolboxDisclosure` |
| notices/errors | `SubToolboxAlert`, `SubToolboxStatePanel` |
| confirmation | `SubToolboxDialog` |
| loading | `SubToolboxSkeleton`, `SubToolboxLoader` |
| list/table | `SubToolboxDataTable` where tabular comparison is appropriate |

Legacy `StandardInput` / `StandardButton` should not become the new Settings authority; they are older compatibility components and duplicate newer SubToolbox primitives.

## Panel redesigns

### Overview

Replace the current hero + readiness cards with:

- one compact readiness metric strip;
- next-best-action row;
- compact account / plan / data summary rows;
- no duplicated explanatory cards.

Goal: useful Settings content visible in the first desktop viewport.

### Account

Group into:

1. Identity + ViewTube account
2. YouTube channel connection
3. Public-channel/source mode when applicable
4. Advanced account actions

Use status badges and one-line action rows. Disconnect/delete do not compete visually with normal actions.

### AI Runtime

Group into:

1. Creator Brain readiness
2. model/runtime selection
3. API key / BYOK controls
4. advanced AI links

API-key reveal/save remains explicit. Long help copy moves behind disclosure/tooltip.

### Dashboard Widgets

Replace card grid with an operational widget-management list:

- compact toolbar: search + category filter + show/hide/reset actions;
- each widget = one compact row with color marker, title, status badge and toggle;
- optional two-column list only when rows remain easy to scan;
- Preview status remains explicit;
- visibility changes still use the current dashboard layout store.

### Experience

Replace large preference cards with dense settings rows.

Groups:

1. Mobile navigation
2. Workspace continuity
3. Desktop navigation
4. Quick Switcher + history
5. Navigation data reset

Desktop navigation layout should be a compact segmented or selectable-row control, not four large cards.

### Plan + Credits

Show:

- active plan summary;
- credit meter;
- compact plan selector;
- selected plan details only;
- top-up controls;
- billing portal;
- referral controls collapsed until opened.

Do not render six full plan cards simultaneously on the normal path.

### Data + Privacy

Group into:

1. source / ingest mode
2. export / backup
3. transparency
4. local recovery/reset
5. danger zone

Reset/delete controls stay behind explicit confirmation and should be visually isolated.

### Help + Legal

Use:

- search/filter if link count warrants it;
- grouped compact link rows;
- status/availability indicators if needed;
- no oversized informational cards.

## Vertical-density targets

These are acceptance targets, not hard CSS constants:

- reduce Settings chrome above the active panel by at least 50% on desktop;
- reduce normal boolean preference height to one canonical L1 or L2 row;
- show at least 6 ordinary preference rows in a typical mobile portrait viewport without hiding labels;
- avoid more than one non-content header between page navigation and the active control;
- no panel should require scrolling through a page hero plus panel hero before reaching its first control;
- no repeated control uses custom padding/stroke/font values outside primitive tokens.

## Responsive invariants

- active panel survives orientation changes;
- panel scroll position survives orientation changes when the global preference is enabled;
- open/collapsed group state uses the existing toolbox persistence system;
- mobile titles wrap instead of ellipsizing;
- no horizontal clipping at 320px logical viewport width;
- touch targets remain usable even when visible controls are compact;
- bottom keyboard and safe-area behavior must not obscure actions.

## Accessibility requirements

- all settings rows have programmatic labels;
- switch/toggle states use semantic pressed/checked behavior;
- keyboard focus order follows visual order;
- section navigation supports keyboard and screen readers;
- alerts/status use appropriate live-region behavior only when necessary;
- destructive confirmation retains escape, focus containment and explicit typed confirmation where already required;
- reduced-motion preference must suppress non-essential transitions;
- color is never the only state indicator.

## Performance / state requirements

- do not introduce a new global state library;
- avoid parsing large localStorage blobs on every render;
- settings panel navigation should not remount unrelated backend providers;
- hidden/collapsed heavy panel content may unmount when safe;
- no dashboard widget previews or heavy data visualization should render in Settings;
- use content-visibility/virtualization only if widget/help lists prove large enough to need it.

## Verification commands

Baseline / focused:
- `npm run build`
- `npm run typecheck` (compare against known main baseline failures)
- `npm run lint:runtime -- <changed-files>` or targeted eslint invocation
- `npx vitest run src/views/settings src/components/Toolbox.test.tsx src/components/subtoolbox`
- `npm run smoke:local`

Visual:
- desktop wide;
- desktop thin/rail;
- tablet/narrow;
- mobile portrait;
- mobile landscape;
- default, focus, disabled, loading/error, disconnected and destructive-confirmation states.

## Boundaries

### Always

- use current Settings backend/service calls;
- use canonical primitive geometry;
- preserve panel query contracts;
- preserve current security/destructive-action semantics;
- verify responsive behavior visually.

### Ask first

- adding a new dependency;
- changing a billing/auth/data service contract;
- changing plan pricing/content;
- changing persistence keys;
- removing a Settings panel or route alias.

### Never

- write a second settings persistence system;
- duplicate a primitive family inside Settings;
- put backend service calls directly inside leaf presentation components;
- replace current account/billing/reset flows with mock behavior;
- hide destructive actions behind gesture-only interactions;
- add a second nested top-level Toolbox frame inside the Settings page shell.

## Success criteria

The redesign is complete when:

1. all eight Settings routes/aliases still work;
2. all existing backend actions have parity;
3. Settings leaf components use canonical primitives for supported jobs;
4. the old custom `Card`, `buttonClass`, `inputClass` and custom toggle patterns are removed from Settings;
5. desktop initial vertical chrome is reduced by at least 50%;
6. mobile portrait and landscape have no clipping and preserve workspace state;
7. targeted tests and production build have no new regressions versus main;
8. screenshot certification covers every panel at desktop and mobile breakpoints;
9. legacy Settings frontend components are deleted or reduced to compatibility wrappers with no duplicate visual authority.
