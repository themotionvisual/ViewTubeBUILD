# Studio Hub Migration Matrix V1

Branch: `refactor/studio-hub-component-standardization`

This is the execution ledger for migrating feature-owned presentation into the canonical Studio Hub system without removing working behavior.

| Tool / Surface | Current assessment | Primary issues | Canonical replacement | Risk | Status |
| --- | --- | --- | --- | --- | --- |
| Community Posts | Newer Subtoolbox architecture | Mixed legacy action primitives and local presentation | Studio inputs/search + canonical Subtoolbox layouts | Low | MIGRATION STARTED |
| Video Manager | Functional but heavily bespoke | Disconnected early-return replaces UI; custom 100px video dropdown; hardcoded tags/states/buttons | `VIDEO_SELECTOR`, `METADATA_EDITOR`, canonical controls and connection/data states | High | AUDITED |
| Video Publisher | Uses canonical layout primitives in places | Mixed controls and connection/data state responsibilities | canonical actions, fields, uploads and state contracts | Medium | QUEUED |
| Comment Responder | Connection-sensitive data tool | Empty/disconnected behavior can be conflated; local controls | connection-aware normal layout + canonical state panels | Medium | QUEUED |
| Thumbnail Studio | Rich tool with multiple legacy surfaces | custom fields/uploads/actions | canonical controls + Tight Reveal recipes | High | QUEUED |
| Media Analyzer | Data/media surface | custom upload and result states | `MEDIA_UPLOAD`, results surface, data-state contract | Medium | QUEUED |
| Pre-Launch Priming | Toolbox/Subtoolbox consumer | presentation still feature-owned in places | canonical layouts/actions | Low | QUEUED |
| Hook Generator | Toolbox/Subtoolbox consumer | legacy `StandardTextArea` path | Studio textarea/input/actions | Low | QUEUED |
| Actionable Tactics | Toolbox/Subtoolbox consumer | mixed action/content primitives | canonical layouts/actions/results | Low | QUEUED |
| Script Architect | Requires full audit | likely mixed form/content surfaces | `TEXT_GENERATOR`, `METADATA_EDITOR`, results | Medium | INVENTORY REQUIRED |
| End-Screen Architect | Requires full audit | likely bespoke editor controls | canonical controls/layouts where appropriate | Medium | INVENTORY REQUIRED |
| Toolbox UI Reference Library | Existing canonical reference surface | main branch changed during this migration; must not overwrite | mount/consume `StudioHubCertification` after synchronizing main | Low | HOLD FOR MAIN SYNC |

## Confirmed architecture findings

### Global field leakage

`src/index.css` still contains broad `input`, `textarea`, and `select` normalization driven by `--widget-color`. New Studio controls therefore use an explicit `[data-vt-studio-control]` ownership boundary so Widget Dashboard CSS cannot become their visual authority.

### Existing subtoolbox authority

`src/components/subtoolbox/tokens.ts` already carries most of the desired hierarchy contract. `src/studio-ui/tokens.ts` bridges that source instead of creating a competing geometry system.

### Video Manager connection gate

`src/views/VideoManager.tsx` currently contains `if (!connected) return (...)`, replacing the real Video Manager with a Channel Offline composition. This must be removed during the Video Manager wave. Connection will gate reads/writes and alter control copy/actions, not hide the normal tool composition.

### Video Manager selector

The current Choose Video interface is a feature-owned custom dropdown with a 100px trigger, bespoke search field, hardcoded borders/radii/shadows and its own open-menu implementation. It should be replaced by `VideoSelectorRecipe`, which uses the canonical `StudioDropdown`, `StudioSearchInput`, and Connect Channel action.

## New canonical implementation now available

- `src/studio-ui/tokens.ts`
- `src/studio-ui/palette.ts`
- `src/studio-ui/states/index.ts`
- `src/studio-ui/primitives/StudioControls.tsx`
- `src/studio-ui/primitives/StudioDropdown.tsx`
- `src/studio-ui/layouts/index.tsx`
- `src/studio-ui/recipes/index.tsx`
- `src/studio-ui/StudioHubCertification.tsx`
- `src/styles/studio-control-system.css`
- `scripts/audit-studio-ui-drift.mjs`

## Migration rule

Every tool migration follows this order:

1. Preserve feature behavior and state ownership.
2. Remove presentation-only local implementations.
3. Replace them with a canonical primitive or recipe.
4. Separate connection state from data state.
5. Verify disconnected, empty, loading, error and ready independently.
6. Verify phone-width layout.
7. Run drift audit and focused tests.
8. Remove legacy CSS only after no active consumer depends on it.

## Main synchronization note

During this branch, `main` advanced by two commits that modify `src/components/ToolboxUIReferenceLibrary.tsx`. This migration branch intentionally does not overwrite that file. Synchronize/rebase the latest main before mounting `StudioHubCertification` into the reference library or merging the branch.