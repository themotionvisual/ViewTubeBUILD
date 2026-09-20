# Futures, prototypes, standalone HTML, and design-reference atlas

This reference separates production authority from design/recovery evidence.

## Production truth versus design evidence

A concept is a production widget only when it has:

- a registered stable ID;
- a current renderer;
- a user-reachable runtime path;
- current data/action ownership.

Standalone HTML, screenshots, old branches, prototypes, atlases and demos are **design/recovery evidence**, not proof that a feature ships.

Do not copy prototype code directly into production without reconciling tokens, primitives, data, mobile, accessibility and current ownership.

## Current preview/new widget set

These are already represented in the current registered preview set via `widgets/newWidgetSet.ts`:

- Channel Progress — trajectory against goals.
- Next Best Action — highest-value creator move.
- Anomaly Radar — recent spikes/drops outside baseline.
- Content Pipeline — idea-to-published workflow pulse.
- Audience Requests — recurring viewer requests converted into opportunities.
- Video Director — brief/storyboard/variation/generation execution surface.

Use `current-widget-inventory.md` for exact current sizing/links.

## Planned / partial / recovery families

From the current futures/recovery registry, investigate these as ideas, modes, system components, or future widgets:

| Concept/family | Current disposition guidance |
|---|---|
| Top-40 source-faithful widget set | recovery/design set; audit individually |
| 190-widget mobile-safe atlas | recovery/design set; deduplicate |
| micro-visual families | reusable embedded visual candidates |
| Analytics Command Center modules | split real widget jobs from embedded modules |
| deep-video analytics family | build/merge after canonical datasets |
| geography country/state/city/DMA | consolidate around creator jobs |
| device/OS/technology surfaces | analytics component/widget candidates |
| evidence/provenance/confidence UI | shared intelligence component |
| Project/Kanban compact manifestations | dashboard companions only when independently useful |
| project calendar/schedule manifestation | likely merge/companion |
| Creator Canvas pipeline manifestations | workflow-first; selective widgets |
| Audience Loop | evaluate distinct community creator job |
| Recommend Video | prefer Comment Responder integration |
| Vault 16:9/9:16/1:1/audio/document modules | system component first |
| Resource Library manifestation | page/toolbox first |
| Editor project/status manifestation | compact handoff candidate |
| Publisher queue/preflight manifestation | future widget after Publisher canonicalization |
| Diagnostics widget | system candidate |
| Command Module | Asset Engine manifestation candidate |
| Adaptive Presence Package | shared system component |
| Vault-Module Manifestation | merge with Vault |
| Micro Package Strip | shared component |
| Tool Launcher Package | merge with Quick Actions |
| orphan ReachFunnel/AdStack/ThumbAI drafts | recover unique behavior only; current owners supersede |

Reference:
[WIDGET_FUTURES_RECOVERY_REGISTRY_2026-09-14.md](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/architecture/WIDGET_FUTURES_RECOVERY_REGISTRY_2026-09-14.md)

## Repository-resident standalone widget libraries

### Governance widget library

Entry point:
[governance/widget-library/README.md](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/governance/widget-library/README.md)

Useful files:

- [widget-library-v10.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/governance/widget-library/widget-library-v10.html) — upload-frame variants, icon system, split badges, asset frames, widget layouts.
- [widget-library-v11-interactive-set.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/governance/widget-library/widget-library-v11-interactive-set.html) — toggles, radios/checks, segmented controls, sliders, steppers, toasts, pagination, command palette, kanban, leaderboard, stat tiles, avatars.
- [widget-library-v12-matrix.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/governance/widget-library/widget-library-v12-matrix.html) — 4 color systems × 4 heights × 19 components with interaction states.

These are reference material only.

### Other repository-resident HTML references

- [public/widget-primitives.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/public/widget-primitives.html) — standalone primitive representation.
- [src/assets/reference/viewtube-full-component-library.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/assets/reference/viewtube-full-component-library.html) — component reference.
- [src/assets/reference/viewtube-mini-toolbox-bundle.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/assets/reference/viewtube-mini-toolbox-bundle.html) — toolbox reference, useful for contrast/comparison only; do not import toolbox geometry into widgets blindly.
- [docs/demos/ViewTube_Crown_Control_Room.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/demos/ViewTube_Crown_Control_Room.html) — demo, not runtime proof.
- [docs/migration/reference/prototypes/ADAPTIVE_BRAIN_ORCHESTRATOR_2026-09-03.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/migration/reference/prototypes/ADAPTIVE_BRAIN_ORCHESTRATOR_2026-09-03.html) — Brain orchestration exploration.
- [docs/migration/reference/prototypes/VIEWTUBE_BRAIN_USER_CONTROL_CENTER_2026-09-03.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/migration/reference/prototypes/VIEWTUBE_BRAIN_USER_CONTROL_CENTER_2026-09-03.html) — Brain control exploration.
- [public/editor-template-library.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/public/editor-template-library.html) — editor template reference, useful for asset/editor widget handoffs.
- [public/content-build-manifestations-1-5.html](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/public/content-build-manifestations-1-5.html) and [6-10](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/public/content-build-manifestations-6-10.html) — demo/reference manifestations.

## High-value external/local widget design mines named by repository planning

The following names are recorded in planning documents but may live outside current repo or remain unrecovered. **Verify existence before relying on them.**

### Production/component atlases

- `ViewTube_Standalone_Component_Library_Complete.html`
- `ViewTube-Top-40-Widgets-Source-Faithful-Production-Atlas.html`
- `ViewTube-All-190-Widgets-MOBILE-SAFE-Inline-Gallery-and-Consolidation.html`
- `STANDALONE_HTML_PROTOTYPE_INVENTORY_LIBRARY_WIDE.md`

### Widget idea families

- `viewtube-20-awesome-youtuber-widgets-v4.html`
- `ViewTube_20_Best_Dashboard_Widgets.html`
- `ViewTube_20_Real_Dashboard_Widgets.html`
- `viewtube_creator_operations_20_widgets*.html`
- `ViewTube_NextGen_20_Widget_System.html`
- `ViewTube_API_Creator_Tools_20_New_Widgets*.html`
- Volume III / IV / V creator-tool files

### Micro-visual families

- `viewtube_micro_visuals_widget.html`
- cluster v2
- ultracompact v3
- density v4/v5
- `viewtube_master_micro_dense_compositions.html`

### Planning / Kanban / Studio design mines

- `viewtube_content_planning_kanban.html`
- `viewtube_flagship_content_command_kanban.html`
- mobile-fixed flagship Kanban
- `viewtube_studio_foundation.html`
- Studio v2 design system/data engine
- Studio v3 content workspaces
- Studio v4 integrated creator OS
- Studio v5 analytics command center
- Studio v6 intelligence platform
- phase7 integrated app/platform
- intelligence studio v0.1

### Super tool/catalog references

- `viewtube_super_tools_04_11_13.html`
- `viewtube_super_tool_component_atlas.html`
- rebuilt atlas
- `viewtube-combined-catalog` variants

Source naming reference:
[VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md)

## How to mine a reference safely

For each promising idea:

1. Identify its creator job.
2. Identify the unique signature component/interaction.
3. Compare against all current registry owners.
4. Decide whether the idea is:
   - a new widget;
   - a mode of an existing widget;
   - an embedded visualization;
   - a reusable primitive;
   - a widget-specific compound component;
   - a page/toolbox feature;
   - archive only.
5. Extract the useful concept, not stale CSS.
6. Rebuild with current ViewTube primitives/tokens.
7. Connect canonical data/actions.
8. define width × height behavior.
9. certify mobile/desktop.
10. preserve source provenance in notes.

## New-widget admission rule

Do not build a new widget just because an atlas contains one.

A new stable widget ID should have:

- a distinct creator job;
- independent placement value;
- independent resizing value;
- a recognizable signature component;
- meaningful inputs/outputs/actions;
- no better existing owner;
- useful minimum/default/maximum states;
- mobile value.

## Reference registry

For classification of canonical/prototype/demo/recovery/quarantined/superseded sources, read:
[agent/registry/references.md](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/agent/registry/references.md)

The external Task Index and large local HTML corpus are not guaranteed to be available from every agent session. Never pretend they were inspected when they were not.
