# Studio Hub Component Standardization V1

Status: implementation authority for the Studio Hub migration branch.

## Governing rule

Studio Hub -> Main Toolbox -> Subtoolbox -> Component/Layout Primitive -> Control.

Feature components choose primitives. Feature components do not redefine primitives. Authentication gates capabilities, not UI visibility. Data emptiness and connection state are independent.

## Canonical hierarchy

| Level | Height | Stroke | Radius | Shadow | Primary type |
| --- | ---: | ---: | ---: | ---: | ---: |
| Main Toolbox | 80px header | 5px | 16px | 10px | 26px |
| Subtoolbox | 56px | 4px | 12px | 6px | 20px |
| Compact Subtoolbox | 44px | 3px | 10px | 4px | 20px |
| Interior Component | 32 / 48 / 56px | 3px | 8px | 4px | 10 / 14 / 20px |

No Studio Hub feature may redefine these dimensions except through an explicitly documented exception.

## Target architecture

```text
src/studio-ui/
  tokens.ts
  palette.ts
  primitives/
  layouts/
  states/
  recipes/
  index.ts
```

`STUDIO_TOKENS` owns toolbox, subtoolbox, compactSubtoolbox, component, typography, spacing, radius, stroke, shadow, motion, and breakpoints. Existing `src/components/subtoolbox/tokens.ts` is the current geometry authority and should be migrated/bridged rather than duplicated.

## CSS ownership

Studio Hub owns scoped selectors rooted at `[data-vt-toolbox]`, `[data-vt-subtoolbox]`, and `[data-vt-studio-control]`. Analytics widgets remain independently rooted and must not style Studio Hub controls. Avoid generic input/select/textarea/button selectors crossing these boundaries.

Target style ownership:

```text
toolbox-system.css
subtoolbox-system.css
studio-control-system.css
widget-system.css
widget-control-system.css
```

## Canonical control family

Input, textarea, select/dropdown, search, number input, toggle, checkbox, radio, slider, progress, segmented control, primary/secondary/icon/split-left buttons, tag, badge, KPI card, information card, scroll/results surfaces, table, empty/error/loading/success/connection states, and upload target.

Controls use registered sizes only: compact 32px, standard 48px, action 56px.

### Fields

Standard field: 48px high, 3px black structural border, 8px radius, 14px/800 type, light parent-accent tint, 4px accent shadow. Focus preserves the black border and adds a 3px parent-accent outline plus colored shadow. Textareas use the same contract with registered content heights.

### Dropdowns

Closed trigger and open menu are one visual component. Menu inherits parent accent, structural stroke, radius family, shadow, typography and registered row height. Connection affects data/behavior, not primitive appearance.

### Buttons

Geometry is independent from semantics. Sizes are compact/standard/action; appearances are primary, secondary, neutral, danger, warning, success, disabled, selected and loading.

### Split-left

The leading icon rail is always H x H. Its divider equals the component structural stroke. Accent is inherited. Subtoolbox split-left actions use collapsed Subtoolbox height and title typography.

### Tags

Canonical compact tags use the established A-Z spectrum mapped through the ViewTube 12-color palette: 20px family, 8px/900 uppercase, 2px stroke, 4px radius, translucent accent fill and matching shadow. Interaction states: available `+`, selected `x`, removable `-`.

### Upload

Tight Reveal #05 is the canonical Studio Hub upload target. Recipes: 16:9 video, 9:16 video, 1:1 image, thumbnail, document, audio and generic file. One primitive owns interaction and styling.

## Layout primitives

`SubToolboxStack`, `SubToolboxGrid`, `SubToolboxActions`, `SubToolboxSection`, `SubToolboxSplit`, `SubToolboxScroll`, and `SubToolboxMetrics` own composition. Registered recipes: 1/2/3/4 columns, auto-fit, 50/50, 1/3+2/3, media+details, metrics and actions.

Responsive collapse belongs to layouts, not feature JSX. Phone widths use full-width Main Toolboxes and full available-width Subtoolboxes. Grids collapse 4->2->1, 3->2->1, 2->1. Registered-height controls do not grow merely because children wrap; scroll internally where appropriate and never scroll headers.

## State contracts

```ts
export type StudioDataState = 'idle' | 'loading' | 'ready' | 'empty' | 'error'
export type StudioConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnect_required'
```

Disconnected tools keep their real Toolbox/Subtoolbox composition visible. API-dependent controls become connection-aware. Never equate empty data with disconnected authentication.

## Palette inheritance

Main Toolbox palette assignment -> Subtoolbox palette assignment -> component accent inheritance -> derived focus/shadow/state. The existing ViewTube 12-color spectrum remains authoritative. Feature children do not hardcode tool-specific colors.

## Reference-library certification

The UI Reference Library is the certification surface. It must exercise SHELLS, LAYOUTS, INPUTS, BUTTONS, DROPDOWNS, SPLIT LEFT, TAGS, UPLOAD, METRICS, DATA STATES, CONNECTION STATES and MOBILE across hierarchy levels, 12 colors and idle/hover/focus/active/selected/disabled/loading/error/empty/disconnected states.

A primitive is not production-ready until it passes this surface.

## Recipes

Canonical repeated compositions: `VIDEO_SELECTOR`, `TEXT_GENERATOR`, `MEDIA_UPLOAD`, `TAG_EDITOR`, `METRIC_STRIP`, `SEARCH_RESULTS`, `ASSET_SELECTOR`, `CONNECTION_REQUIRED`, `PUBLISH_ACTIONS`, `AI_GENERATOR`, `METADATA_EDITOR`.

## Migration matrix

Audit Video Manager, Video Publisher, Comment Responder, Community Posts, Thumbnail Studio, Media Analyzer, Pre-Launch Priming, Hook Generator, Actionable Tactics, Script Architect, End-Screen Architect, UI Reference Library and every other Studio Hub tool for current shell/controls, legacy CSS, hardcoded geometry/colors, connection gates, custom fields/dropdowns/uploads/buttons/states, canonical replacement and migration risk. Classify each item as CANONICAL, MIGRATE, LEGACY COMPATIBILITY, EXCEPTION or REMOVE.

## Waves

1. Foundations: audit, tokens, CSS isolation, primitive contracts, reference library.
2. Inputs: fields, textarea, dropdown, search, toggles; begin with Community Posts.
3. Buttons/actions: compact, standard, action, icon, split-left.
4. Uploads/tags: Tight Reveal and spectrum tags.
5. Video Manager: canonical controls plus disconnected-preview behavior.
6. Comment Responder + Video Publisher: connection/data state separation.
7. Remaining Studio Hub tools one at a time.
8. Legacy cleanup only after all consumers migrate.

## Enforcement

Add a Studio Hub presentation audit that reports suspicious feature-local `border-[4px]`, `border-[5px]`, arbitrary `rounded-*`, `shadow-*`, `h-[...]`, `min-h-[...]`, hardcoded hex colors and `border-dashed`. These are review triggers, not blanket syntax bans.

## Definition of done

A new Studio Hub tool can be composed from `ToolboxScaffold`, `SubToolbox`, canonical layouts and Studio controls and automatically receives correct hierarchy, sizing, typography, palette inheritance, focus/shadows, responsive behavior, data states and connection behavior without feature-specific presentation CSS.

## Execution safety

Do not mass-rewrite. Audit -> freeze tokens -> isolate CSS -> complete/certify reference library -> migrate one component family -> migrate one tool -> remove legacy CSS last. Run typecheck, focused tests, CSS checks, build and mobile/browser verification after each wave. Do not merge this branch to main until the migration slice is verified.