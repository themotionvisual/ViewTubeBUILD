# Studio Hub Uniform Primitive Audit Plan — 2026-09-16

Status: HISTORICAL AUDIT / MIGRATION PLAN — geometry baseline superseded
Superseded geometry note (2026-09-24): this plan recorded the then-current desktop 56px Main / 44px SubToolbox implementation. Current production authority is desktop 80/56/48/32 and mobile shell 56/44. Preserve the defect evidence and audit method, but do not reuse the old desktop dimensions.
Herald verb: FIX + AUDIT/PLAN
Canonical page: `src/views/StudioHub.tsx`
Canonical shell owner: `src/components/Toolbox.tsx`
Canonical geometry/token owner: `src/components/subtoolbox/tokens.ts` + `src/styles/toolbox-system.css`
Certification surface: `src/components/ToolboxUIReferenceLibrary.tsx` + `src/studio-ui/StudioHubCertification.tsx`
Existing drift scanner: `scripts/audit-studio-ui-drift.mjs`

## Trigger / visual evidence

Mobile production screenshot supplied 2026-09-16 shows an expanded `THUMBNAIL STUDIO` Toolbox and expanded `CONCEPT` SubToolbox with the horizontal header divider missing beneath the square icon rail. Current `toolbox-system.css` confirms the cause: the pseudo-element divider begins at the icon-rail width (`left: 56px` for Toolbox and `left: 44px` for SubToolbox). The accepted correction is a full-width divider (`left: 0`) at the level-owned stroke width.

## Preservation rules

- Do not redesign tools or remove working behavior to normalize appearance.
- Preserve `ToolboxScaffold → SubToolbox → canonical controls/cards/results` hierarchy.
- Level owns height/stroke/radius/shadow/type scale; component owns anatomy/behavior.
- One primitive authority only; feature-local CSS must not become geometry authority.
- Do not make widget CSS authoritative for Studio Hub Toolbox UI.
- `DISCONNECTED != EMPTY != ERROR != MISSING UI`; connection gates data/actions, not interface existence.
- Preserve mobile full-width top-level Toolboxes, bounded content heights, internal scrolling where required, and semantic narrow-screen reflow.
- Reference Library is a certification surface, not a parallel mockup.

## Studio Hub top-level inventory

`StudioHub.tsx` currently mounts these Toolbox-based systems and each is in audit scope:

1. Toolbox UI Reference Library
2. Video Manager
3. Video Publisher
4. Media Analyzer
5. Thumbnail Studio
6. Community Posts / `CommunityPostGenerator`
7. Comment Responder
8. End-Screen Architect / `EndScreenTool`
9. Pre-Launch Priming
10. Hook Generator
11. Actionable Tactics
12. Script Architect

The three wrapper-owned modules in `StudioHub.tsx` (Community Posts, Comment Responder, End-Screen Architect) require special duplicate-shell review because their child components are inserted inside local `bg-white rounded-2xl` wrappers.

## Audit matrix — every component and compound component

For every mounted tool, inventory every visible UI element and classify it as:

- CANONICAL — already consumes the uniform primitive.
- MIGRATE — bespoke implementation should move to an existing primitive.
- LEGACY COMPATIBILITY — temporary adapter while consumers migrate.
- EXCEPTION — intentional context-specific anatomy with written reason.
- REMOVE — duplicate/dead presentation after consumer verification.
- REGRESSION / OPEN ISSUE — visually or behaviorally wrong.

For each element record: source file, component name, rendered role, structural level, current height/stroke/radius/shadow/type, color ownership, states, mobile behavior, accessibility semantics, canonical replacement, and verification status.

### Families to inventory

- Toolbox / SubToolbox shells and headers
- icon rails, title regions, help/collapse controls and header actions
- buttons: standard, action, icon, split-left, destructive/disabled
- dropdown/select triggers, open menus, option rows and rails
- text inputs, search, textarea, number/date/time fields
- upload/file targets and media/image frames
- checkboxes, radio, toggle, switch, slider/range, progress, knob/dial
- tags/badges/chips and removable `x` controls
- KPI/stat/metric cards and result cards
- disclosure/popover/dialog/navigation controls
- grids: stack, 2/3/4 column, auto-fit, 50/50, 1/3+2/3, media+details, metrics/actions
- bounded scroll surfaces, lists, tables and result collections
- empty/loading/error/stale/disconnected/disabled/selected states

## Phase 1 — automated drift inventory

Expand `scripts/audit-studio-ui-drift.mjs` from a coarse filename-pattern scanner into a Studio Hub ownership audit. It should discover the actual `StudioHub.tsx` import graph and flag, without auto-fixing:

- hardcoded structural heights/strokes/radii/shadows/type sizes
- hardcoded palette values where token/palette ownership exists
- feature-local shell borders and duplicate rounded outer modules
- raw `<button>`, `<input>`, `<textarea>`, `<select>` and upload targets where a canonical primitive is appropriate
- direct use of retired compatibility APIs such as compact shell geometry
- nested Toolbox-in-Toolbox or module-in-module duplication
- unbounded overflow and mobile fixed-width assumptions
- state branches that erase the normal interface when disconnected/loading/error

Output should be grouped by tool and primitive family, not just a flat warning list.

## Phase 2 — primitive mapping

Map each finding to the existing authority before creating anything new:

`TOKENS → CODED PRIMITIVE → UI REFERENCE LIBRARY → PRODUCTION CONSUMER`

Primary existing sources include `Toolbox.tsx`, `src/components/subtoolbox/*`, `src/studio-ui/*`, split-left primitives, standard field/upload primitives, KPI primitives, and Reference Library recipes. A new primitive is allowed only when no existing anatomy can represent the requirement without feature-local geometry.

## Phase 3 — shell/header normalization

Certify all 12 Studio Hub top-level Toolboxes and all nested SubToolboxes against the same shell law. Current accepted conversation authority is:

- Main Toolbox: 56px header, 5px stroke, 16px radius, 10px shadow, 28px title.
- SubToolbox: 44px header, 4px stroke, 12px radius, 6px shadow, 22px title.
- Separate Compact SubToolbox shell: retired.
- Expanded header divider: full width including beneath icon rail; 5px at Toolbox, 4px at SubToolbox.

Do not call these VERIFIED until desktop/mobile open/closed captures prove them on the deployed code.

## Phase 4 — controls and fields

Migrate the highest-frequency primitives first: buttons, inputs/textareas, dropdowns, upload targets, toggles/selection controls, tags/badges, KPI cards. Preserve tool-specific labels/data/actions; replace only presentation/anatomy duplication. Remove compatibility CSS only after named consumers are source-native and verified.

## Phase 5 — compound layouts

Normalize repeated compositions into canonical recipes: field+action, selector+result, upload+preview, media+details, metrics, actions, result collection, and bounded-scroll collections. Do not turn each feature variation into a new component.

## Phase 6 — responsive/state certification

For every tool verify at minimum:

- phone portrait and landscape
- desktop
- Toolbox open/closed
- nested SubToolbox open/closed
- long titles/header actions
- dropdown open/closed and unclipped
- loading, empty, error, disconnected, disabled and selected where supported
- no page-level horizontal overflow
- bounded internal scrolling where contents exceed the selected shell/layout height
- keyboard/focus-visible/native or ARIA semantics

## Phase 7 — Reference Library and tests

Every migrated primitive must have a matching Reference Library example. Add focused tests for structural attributes, states, accessibility and regression-prone anatomy. Certification is only complete when tokens, coded primitive, Reference Library example and production consumer agree.

## Recommended migration order

1. Global expanded-header divider regression (Toolbox + SubToolbox).
2. Studio Hub shell/header audit across all 12 mounted tools.
3. Community Posts, Comment Responder and End-Screen Architect duplicate-wrapper cleanup.
4. Thumbnail Studio, Media Analyzer and Video Publisher control/field normalization.
5. Video Manager state-shell and selector/action normalization.
6. Pre-Launch Priming, Hook Generator, Actionable Tactics and Script Architect primitive migration.
7. Reference Library parity and focused tests.
8. Mobile/desktop visual certification pass.
9. Compatibility/dead CSS removal only after consumer verification.

## Herald completion gate

This plan is not application completion. A migration item is complete only after code change + focused tests/typecheck/build + visual evidence for UI changes. Until the supplied screenshot defect has an after-capture, the divider fix is IMPLEMENTED on its branch, not VERIFIED.
