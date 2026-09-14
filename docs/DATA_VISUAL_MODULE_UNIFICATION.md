# Data Visual Module Unification

Scope: individual Analytics Data Visual modules and their evidence/canvas regions only. This work does not redefine Toolbox/SubToolbox geometry, Projects, Editor, Studio Hub, or the general widget system.

## Canonical ownership

1. The Data Visual module owns its header, controls, legend, metrics, and explanation placement.
2. `DataVisualCanvas` owns the registered evidence-canvas boundary.
3. `VisualCanvasViewport` owns canvas geometry and aspect ratio.
4. The renderer fills the viewport and owns drawing only.
5. No migrated renderer should independently impose a module-level fixed pixel height.

## Priority migration set

| Module | Family | Outer canvas | Internal plot | Density |
| --- | --- | --- | --- | --- |
| Shorts Retention | temporal | 16:9 | natural | normal |
| Publish Optimal Clock | radial | 16:9 | 1:1 | compact |
| Heat Matrix | spatial | 16:9 | natural | dense |
| Traffic Source Evolution | temporal | 16:9 | natural | normal |
| Engagement Pulse | temporal | 16:9 | natural | normal |
| Content Treemap | spatial | 16:9 | natural | dense |

## Migration rule

Migrate one real renderer at a time. Preserve legacy `ModuleFrame` sizing for unmigrated modules. A migrated module opts into `DataVisualCanvas`, removes renderer/module duplicate height ownership, and is verified in desktop, portrait phone, and landscape phone before its title-based compatibility rule is removed.

## Mobile acceptance

Portrait and landscape must keep the evidence canvas bounded, prevent runaway module height, avoid accidental SVG/Recharts overflow, preserve radial plot shape, reduce dense visual information rather than shrinking it below readability, and keep essential information available without hover-only interactions.

## Deletion gate

The legacy title-matching 16:9 compatibility layer remains until every matching production module is source-native and visually verified. It is removed per-module only after that module has zero dependency on the matcher.

## Implementation status

- Foundation registry: implemented on feature branch.
- Canonical `DataVisualCanvas`: implemented on feature branch.
- Contract tests: authored; execution pending CI.
- Production renderer migration: next step. Existing `ModuleFrame` fixed-height behavior is intentionally preserved until each real module opts in.
