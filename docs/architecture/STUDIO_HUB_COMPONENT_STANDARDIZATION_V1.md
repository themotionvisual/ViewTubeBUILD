# Studio Hub Component Standardization V1

> **Authority notice (2026-09-13):** The consolidated governing resource is [`VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`](./VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md). This file remains the Studio Hub implementation/migration specialization. If geometry, motion, accessibility, responsive, state or certification rules conflict, reconcile against the Master Resource and current canonical code rather than creating a second authority.

Status: HISTORICAL / SPECIALIZED MIGRATION REFERENCE — current rules live in VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md.
Wave 3 note (2026-09-24): retain this file for migration rationale and control-family inventory; do not use it to establish geometry, motion, mobile shell sizing, or certification status.

## Governing rule

Studio Hub -> Main Toolbox -> Subtoolbox -> Component/Layout Primitive -> Control.

Feature components choose primitives. Feature components do not redefine primitives. Authentication gates capabilities, not UI visibility. Data emptiness and connection state are independent.

## Canonical hierarchy

Use the semantic T0/T1/T2/T3 hierarchy and exact geometry defined by the Master Resource. Existing legacy level names may remain temporarily in code but do not own separate dimensions.

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

`src/components/subtoolbox/tokens.ts` remains current geometry authority. Any Studio token layer must bridge/map it rather than duplicate geometry.

## CSS ownership

Studio Hub controls require an explicit ownership boundary. Analytics widgets remain independently rooted and must not style Studio Hub controls. Avoid generic `input`, `select`, `textarea`, or `button` selectors crossing system boundaries.

Target style ownership:

```text
toolbox-system.css
subtoolbox-system.css
studio-control-system.css
widget-system.css
widget-control-system.css
```

## Canonical control family

Input, textarea, select/dropdown, search, number input, toggle, checkbox, radio, switch, slider, progress, segmented control, primary/secondary/icon/split-left buttons, Analytics-style split-left dropdown, tag, badge, KPI/stat card, information/output card, scroll/results surfaces, table, state panels, Guide Subtoolbox and Tight Reveal upload.

Controls use only registered structural levels/sizes. Feature JSX does not invent structural pixel values.

### Dropdowns

Closed trigger and open menu are one visual component. Menu inherits structural level, accent, stroke, radius family, shadow, typography and registered row height. The Analytics-style split-left dropdown splits only the left rail, with the small label above the arrow and one uninterrupted value region.

### Buttons / split-left

Geometry is independent from semantics. The leading rail is always H x H and its divider equals the component structural stroke. Head/Tail fill relationships and all supported levels are defined by the Master Resource.

### Loose controls

Checkbox, radio, switch, toggle and peer binary controls are loose by default; they do not require enclosing cards. Their visual geometry is level-owned and their interaction/accessibility states follow the Master Resource.

### Tags

Canonical tags use palette inheritance, compact information/action anatomy and documented add/selected/remove states. Exact geometry comes from current canonical tokens rather than page-local CSS.

### Upload

Tight Reveal #05 is the canonical Studio Hub upload target. Recipes: 16:9 video, 9:16 video, 1:1 image, thumbnail, document, audio and generic file. It replaces dashed legacy drop zones and does not restore the removed legacy black outer stroke.

## Layout primitives

`SubToolboxStack`, `SubToolboxGrid`, `SubToolboxActions`, `SubToolboxSection`, `SubToolboxSplit`, `SubToolboxScroll`, and `SubToolboxMetrics` own composition. Responsive collapse belongs to layouts, not feature JSX. Phone level-0 modules are full width; long content is bounded; headers never scroll.

## State contracts

Connection state and data state remain independent. Disconnected tools keep their real Toolbox/Subtoolbox composition visible. API-dependent controls become connection-aware. Never equate empty data with disconnected authentication.

## Motion

The older blanket 300ms shell-collapse rule is superseded by the Master Resource: current Toolbox shell/module/disclosure direction is 600ms ease-out, while micro-interactions remain faster (normally 150-300ms). Reduced-motion behavior is required. Production tokens/tests still require reconciliation where older 300ms values remain.

## Accessibility

Every interactive Studio primitive must satisfy the Master Resource accessibility contract: keyboard operation, visible focus, correct native/ARIA semantics, non-color-only selected state, reduced motion, labels for icon-only controls and usable mobile hit targets.

## Reference-library certification

The UI Reference Library is the certification surface. It must exercise shells, layouts, inputs, buttons, dropdowns, split-left families, loose binary controls, tags, upload, metrics, data states, connection states and mobile behavior across supported levels and palettes.

A primitive is not `VERIFIED` until production code, Reference Library, responsive behavior, accessibility and regression coverage align.

## Migration waves

1. Freeze token/semantic-level authority and CSS isolation.
2. Complete/certify Reference Library.
3. Reconcile motion and palette authority.
4. Complete fields/dropdowns/split-left/loose binary controls.
5. Uploads/tags/Guide Subtoolbox.
6. Thumbnail Studio acceptance migration.
7. Video Manager disconnected-preview normalization.
8. Comment Responder + Video Publisher state separation.
9. Remaining Studio Hub tools one at a time.
10. Legacy cleanup only after consumers migrate.

## Enforcement

Presentation audits should flag suspicious feature-local structural borders, arbitrary radii/shadows/heights, hardcoded palette values and dashed upload frames. These are review triggers, not blanket syntax bans.

## Definition of done

A Studio Hub tool can be composed from canonical Toolbox/Subtoolbox shells, layouts and primitives and automatically receives correct hierarchy, sizing, typography, palette inheritance, focus/shadows, responsive behavior, accessibility, data states and connection behavior without feature-specific presentation geometry.

## Execution safety

Do not mass-rewrite. Audit -> freeze tokens -> isolate CSS -> certify Reference Library -> migrate one component family -> migrate one tool -> remove legacy CSS last. Preserve feature behavior and verify desktop/mobile/open/closed/data/disconnected states after each wave.