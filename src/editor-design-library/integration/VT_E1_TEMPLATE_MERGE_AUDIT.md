# VT_E1 + Editor Design Library Merge Audit

Status: Phase 1 integration audit
Branch: `feat/editor-svg-template-library`
Scope: preserve the existing VT_E1 editor and merge the new customizable template system underneath it without creating a second editor state/timeline/history system.

## Verified existing VT_E1 ownership

`src/features/editor/VT_E1.jsx` already owns the editor shell and exposes a dedicated Templates tool/page. The current editor declares:

- a `TEMPLATES` tool with fallback tab `templates`;
- a template page/module described as `Template browse/apply and preset management`;
- an existing `templates-library` feature marked `already_present`, with acceptance criteria `search + apply + import/export`;
- a Templates panel containing `templates`, `search`, and `settings` modules;
- timeline operations imported from the shared VT_E1 timeline contract/operations modules;
- Remotion/export status that already treats template layers as a renderer concern.

These are preservation requirements, not replacement targets.

## Verified shared timeline contract

`src/shared/vtE1TimelineContract.d.ts` defines a deliberately permissive `VtE1Clip` shape with required:

- `id`
- `trackId`
- `start`
- `end`

and optional/extension fields. This is the correct compatibility seam for design-template clips: template metadata can be added without replacing the existing timeline contract.

The shared timeline contract also owns transition seam validation and source-time calculations. New template transitions must therefore integrate with the existing transition/seam path instead of creating an independent transition timeline.

## Verified new design-library ownership

`src/editor-design-library/core/schema.ts` already provides the canonical design-template model:

- categories including `transition` and `engagement`;
- render modes including `svg-overlay`, `svg-scene`, `background`, `transition`, `svg-clip`, and `full-frame`;
- intrinsic bounds;
- editable elements;
- token-bound style properties;
- responsive layouts;
- entrance/emphasis/loop/exit/transition animation slots;
- clip behavior flags for movement, resizing, rotation, duplication, trimming, layering, safe zones, and transparent backgrounds.

`src/editor-design-library/catalog.ts` already normalizes and combines the current template families into one catalog and exposes `filterTemplateCatalog()` and `templateById()`.

## Existing bridge

`src/editor-design-library/integration/timelineAdapter.ts` already creates a `design-template` VT_E1 clip with:

- `templateId`
- `templateName`
- `templateCategory`
- `templateDefinition`
- `editableElements`
- `aspectRatio`

This proves the two systems already have a basic connection. The next phase should extend this bridge rather than introduce a parallel clip format.

## Canonical ownership after the merge

| Concern | Canonical owner |
| --- | --- |
| timeline position/duration | VT_E1 |
| tracks/layers | VT_E1 |
| clip selection/transforms | VT_E1 |
| undo/redo/history | VT_E1 |
| project save/load | VT_E1 |
| mobile editor behavior | VT_E1 |
| template definitions | Editor Design Library |
| template catalog/search data | Editor Design Library |
| SVG composition/intrinsic bounds | Editor Design Library |
| editable template content | Editor Design Library |
| style/theme tokens | Editor Design Library |
| responsive internal layout | Editor Design Library |
| template motion definitions | Editor Design Library |
| transition seam ownership | VT_E1, using design-library presets |
| preview/export template rendering | shared canonical template instance |

## Required instance boundary

The outer VT_E1 clip owns timeline state. The inner template instance owns template-specific overrides.

```ts
interface TemplateClipInstance {
  clipId: string;
  templateId: string;
  templateVersion: number;
  renderMode: TemplateRenderMode;
  startSec: number;
  durationSec: number;
  trackId: string;
  transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    opacity: number;
  };
  overrides: {
    content: Record<string, unknown>;
    style: DeepPartial<TemplateStyleConfig>;
    layout: Record<string, unknown>;
    motion: Record<string, unknown>;
  };
  responsiveMode: '16:9' | '9:16' | '1:1';
}
```

The adapter must serialize this information into extension fields on the native `VtE1Clip`; it must not create a second timeline model.

## Preservation rules

1. Keep the current Templates page/tool and its search/apply/import/export workflow.
2. Preserve existing VT_E1 project/timeline clip behavior.
3. Preserve legacy template IDs and resolve them through aliases when a canonical replacement exists.
4. Never rewrite a legacy project merely because it was opened.
5. Route template edits through VT_E1 history when wired into the editor.
6. Keep clip-level transform state separate from template content/style/layout/motion overrides.
7. Use intrinsic SVG bounds for overlays instead of forcing every template into a full-frame 1920×1080 selection box.
8. Use VT_E1's transition seams for transition templates.
9. Use VT_E1's playback clock for template animation timing.
10. Retain the old path until visual/function parity is verified.

## Preserve / bridge / retire-later matrix

### Preserve unchanged

- VT_E1 timeline and track behavior
- native clip timing
- project persistence entry points
- Templates page/tool shell
- search/apply/import/export user workflow
- transition seam contract
- Remotion/export handoff ownership

### Bridge now

- unified catalog -> existing Templates page
- template definition -> native VT_E1 clip
- intrinsic bounds -> clip selection/render bounds
- style/content/layout/motion overrides -> persisted clip extension data
- responsive variant -> current project composition ratio
- template motion -> current clip duration/playback time

### Retire only after parity

- duplicate legacy template definitions that have canonical replacements
- duplicate renderers
- duplicate style/customization state
- any second template-only history or persistence mechanism

## Phase 2 implementation checklist

- [ ] Add a typed, serializable template-instance contract.
- [ ] Extend `timelineAdapter.ts` without breaking its current export.
- [ ] Add deterministic render-mode inference.
- [ ] Add intrinsic-bounds resolution.
- [ ] Add default clip-behavior resolution.
- [ ] Add immutable override patch helpers.
- [ ] Add legacy alias registry with identity fallback.
- [ ] Add catalog resolution through aliases.
- [ ] Export the bridge from the design-library package index.
- [ ] Then wire the unified catalog into the existing VT_E1 Templates module.

## Parity gate before touching main

The branch is not ready to merge to `main` until all of the following pass:

- existing projects still open;
- existing customizable templates remain available;
- existing search/apply/import/export remains available;
- new templates insert at the playhead as native VT_E1 clips;
- move/resize/rotate/trim/duplicate/layer behavior works;
- intrinsic overlay selection bounds work;
- undo/redo includes template edits;
- save/reload preserves overrides;
- 16:9, 9:16, and 1:1 responsive variants resolve correctly;
- transition templates use native seams;
- preview and export use the same resolved instance data;
- mobile insertion/selection/customization works;
- typecheck/build/tests pass;
- desktop/mobile regression screenshots show no feature loss.

`main` must remain untouched until this gate passes.
