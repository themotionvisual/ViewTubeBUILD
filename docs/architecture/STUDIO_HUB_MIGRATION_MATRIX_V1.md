# Studio Hub Migration Matrix V1

> **Authority notice (2026-09-13):** Global geometry, state, responsive, accessibility, motion and certification rules live in [`VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`](./VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md). This file is an execution ledger only; it must not become a parallel design authority.

This ledger tracks migration of feature-owned presentation into the canonical Toolbox/Subtoolbox system without removing working behavior.

| Tool / Surface | Primary issues | Canonical direction | Risk | Status |
| --- | --- | --- | --- | --- |
| UI Reference Library | Must certify all levels/families/states and stay aligned with production exports | Master Resource certification ledger + canonical primitives | High | ACTIVE |
| Community Posts | Mixed historical action/presentation paths | canonical fields/layouts/actions | Low | IMPLEMENTED / VERIFY |
| Video Manager | disconnected replacement UI; bespoke selector/states | persistent shell, connection-aware selector, canonical metadata/actions | High | AUDITED / QUEUED |
| Video Publisher | mixed controls and state responsibilities | canonical fields/actions/upload/state contracts | Medium | QUEUED |
| Comment Responder | empty/disconnected can be conflated | persistent normal layout + explicit connection/data states | Medium | QUEUED |
| Thumbnail Studio | rich nested legacy surfaces | canonical controls, Tight Reveal, nested-level acceptance test | High | NEXT ACCEPTANCE TARGET |
| Media Analyzer | custom upload/result states | Tight Reveal + results/state primitives | Medium | QUEUED |
| Pre-Launch Priming | feature-owned presentation remains | canonical layouts/actions | Low | QUEUED |
| Hook Generator | legacy field/action paths | canonical textarea/input/actions | Low | QUEUED |
| Actionable Tactics | mixed action/content primitives | canonical layouts/actions/results | Low | QUEUED |
| Script Architect | full inventory required | text-generator/metadata/results recipes | Medium | INVENTORY REQUIRED |
| End-Screen Architect | editor-like bespoke controls | canonical controls only where Toolbox semantics apply | Medium | INVENTORY REQUIRED |
| Projects | duplicate shells, project context fragmentation, desktop-first wide surfaces | one T0 per tool, shared project context/inspector/calendar, semantic mobile modes | High | SEPARATE CONTROLLED MIGRATION |
| Creator Vault / Asset Engine | module-heavy asset workflow | canonical shells/upload/tags/bounded grids | Medium | QUEUED |

## Confirmed architecture findings

### CSS ownership

Broad input/select/textarea rules and widget styling must not become Toolbox authority. Canonical Studio/Toolbox controls require scoped ownership. Audit leakage before deleting compatibility selectors.

### Existing token authority

`src/components/subtoolbox/tokens.ts` is the current geometry authority. Any `src/studio-ui/tokens.ts` layer bridges/maps it; it does not create a second set of dimensions.

### Video Manager

Disconnected authentication must not replace the real Video Manager composition. Connection gates reads/writes and changes selector/action state. The normal UI remains visible. The bespoke Choose Video implementation should migrate to the canonical connection-aware selector/dropdown anatomy.

### Analytics cross-reference

Master Data Tables are the visual reference for the split-left dropdown: only the left rail is divided; the label is above the arrow; the right value region is uninterrupted. Reuse anatomy without importing Analytics business logic or widget CSS.

## Migration procedure

Every tool migration follows this order:

1. preserve behavior and state ownership
2. classify current presentation as canonical / migrate / compatibility / exception / remove
3. replace feature-owned geometry with canonical primitives/recipes
4. separate connection state from data state
5. verify disconnected, empty, filtered-zero, loading, error, stale and ready independently
6. verify keyboard/focus/accessibility behavior
7. verify phone-width semantic layout
8. run drift/CSS/type/build/focused tests
9. update Reference Library certification
10. update Master Resource status/decision log
11. remove legacy CSS only after no active consumer depends on it

## Current priority order

1. Reference Library completion across levels and loose controls.
2. Analytics-style split-left dropdown production primitive/open menu.
3. Motion-token reconciliation to 600ms shell/disclosure contract.
4. Accessibility/state certification rows.
5. Thumbnail Studio as visual acceptance migration.
6. Video Manager disconnected-preview normalization.
7. Comment Responder and Video Publisher state separation.
8. Remaining Studio Hub tools.
9. Projects/Vault controlled migration.
10. Application-wide legacy geometry cleanup.

## Safety

- never overwrite newer main work to make a migration branch fit
- fetch current source before substantial edits
- migrate one component family/tool at a time
- preserve business behavior
- do not delete legacy primitives before searching/migrating callers
- do not use descendant CSS shell suppression as permanent embedded architecture
- do not mark prototype-only work `IMPLEMENTED`

## Completion gate

A row becomes `VERIFIED` only after canonical code, Reference Library, desktop/mobile behavior, accessibility/states and regression checks agree, and the Master Resource ledger is updated.