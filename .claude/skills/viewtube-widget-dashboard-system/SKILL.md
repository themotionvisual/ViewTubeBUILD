---
name: viewtube-widget-dashboard-system
description: Canonical authority for designing, building, migrating, integrating, managing, certifying, and deploying ViewTube dashboard widgets, primitives, compound components, CSS, data states, responsive layouts, and the UI Reference Library. Use for all dashboard/widget system work.
---

# ViewTube Widget Dashboard System

This is the canonical operational owner for ViewTube dashboard/widget work. Treat the repository and current production primitives as source of truth. Preserve behavior while eliminating visual, CSS, primitive, registry, and data-path drift.

## Herald contract

Use `agent/contracts/herald-workflow.md`. Every turn follows ORIENT -> INTAKE -> RECON -> ROUTE -> ACT -> REPORT -> RECORD. PLAN/BUILD/FIX/RECOVER work must respect Herald gates, writer locks, evidence, receipts, and creator approval requirements.

## Authority order

When sources disagree, reconcile against current code and newer measured/certified authority:

`TOKENS -> PRIMITIVES -> UI REFERENCE LIBRARY -> ARCHETYPES -> COMPOUND COMPONENTS -> WIDGET -> WIDGET SHELL -> DASHBOARD GRID`

Widgets own domain content, data adapters, actions, and justified custom compound components. They do not own global primitive geometry or visual language.

Read the relevant references before changing code:
- `references/authority-and-reconciliation.md`
- `references/widget-build-and-migration.md`
- `references/primitives-color-layout.md`
- `references/data-integration-certification.md`
- `references/css-management-and-deployment.md`

Also inspect current canonical implementation: `WidgetRegistry.ts`, `WidgetRenderer.tsx`, `WidgetShell.tsx`, `WidgetPrimitives.tsx`, `WidgetPrimitiveExtensions.tsx`, `tokens.ts`, widget primitive CSS layers, responsive/mobile contracts, and the UI Reference Library widget.

## Universal build sequence

1. Define creator job, purpose, inputs, outputs, data source, primary action, states, and information hierarchy.
2. Select the smallest appropriate archetype and supported W x H range.
3. Search production primitives before writing local markup/CSS.
4. Reuse canonical primitives. If a reusable primitive is missing, add it to production primitives and expose that same implementation in the UI Reference Library.
5. Create a widget-specific compound component only when the feature requires a recognizable domain interaction/visualization. Preserve useful custom components; standardize their tokens, heights, color, states, and primitive composition rather than flattening them.
6. Implement data through SOURCE -> CANONICAL DATASET -> SELECTOR/ADAPTER -> WIDGET VIEW MODEL -> COMPONENT.
7. Implement loading, ready, empty, disconnected/blocked, stale, and error states where applicable.
8. Register exactly one stable widget ID/definition/loader. Preserve persisted IDs or add explicit migration/aliases.
9. Verify every declared W x H pair, container-responsive composition, phone full-width behavior, deterministic height, overflow, keyboard/touch, focus, accessibility, and disconnected behavior.
10. Certify and deploy only after tests/build and required visual evidence pass.

## Non-negotiable visual rules

- Use ViewTube Ink/current palette tokens; do not introduce pure-black widget text, strokes, borders, or icons where the current widget authority prohibits them.
- Widgets are predominantly monochromatic. Secondary colors require semantic purpose.
- Colors, focus, selected states, shadows, progress, tags, and upload treatments derive from active widget palette tokens; do not hardcode private blues/grays.
- Component height ladder is canonical: 18 micro, 24 compact, 32 standard, 38 large unless current production tokens supersede it. Typography/icon/radius/stroke scale with level.
- Frozen macro geometry: 24-column grid; width buckets quarter/companion/third/between/half/two-thirds/three-quarters/full; height buckets S 150, M 250, L 350, XL 450, XXL 850 unless an approved migration changes the contract.
- Phone widgets render full available width while retaining persisted desktop width.
- Content never expands a deterministic widget shell. FIT, ADAPT, or SCROLL inside the body.
- No generic dashed upload zones when canonical ViewTube upload compositions exist.
- Avoid modules-inside-modules. Use hierarchy, spacing, dividers, primitives, archetypes, and compound components.
- Headers/titles do not scroll. Keep at most one intentional body scroll region unless the archetype explicitly requires more.
- Data visuals must not rely on color alone.

## Primitive and UI Reference Library rule

The UI Reference Library is a renderer/catalog of production primitives, not an independent design implementation. A visual component that exists only in the library is not canonical. Transfer useful library-only components into the production primitive layer, then make the library consume them. Never maintain two visually similar implementations.

## CSS rule

Fix the highest shared owner. Ownership order is tokens -> grid/shell -> primitives -> archetypes -> widget-specific -> accessibility. Reduce specificity rather than escalating it. Do not add `!important` to defeat an ownership problem. Remove duplicate selectors and private primitive replacements. Keep Toolbox/Subtoolbox CSS from redefining Widget primitives and vice versa.

## Existing-widget migration

Audit first. Preserve behavior and specialized functional components. Map private controls to canonical primitives, migrate palette/tokens/heights, repair data states, responsive/mobile composition and scroll ownership, then remove obsolete CSS only after import/registry/persistence/guide consumers are proven safe. Compare before/after visuals.

## Certification

Registry `ready` is not production certification. Evaluate: IMPLEMENTED, DATA_CONNECTED, FUNCTIONAL, DATA_STATES, RESPONSIVE, MOBILE_VERIFIED, VISUALLY_CERTIFIED, ACCESSIBLE, PRODUCTION_VERIFIED, CANONICAL.

Visible changes require visual evidence under Herald. Verify representative desktop placements and phone widths 320/375/390/430/767 where relevant.

## Verification

Run focused tests first, then the current dashboard contract suite and production build. Never hardcode an old expected test count; measure the current baseline. Record changed files, tests, build/type status, visual evidence, regressions, migration/rollback needs, and production dependency status.

## Legacy retirement

Do not delete predecessor skills merely because this skill exists. First build the reconciliation matrix, migrate every valid rule/reference/consumer, update agent registries and links, mark old owners superseded/quarantined, verify no live consumer remains, then delete only with creator-approved destructive scope and Herald evidence.
