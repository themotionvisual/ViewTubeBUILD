# Toolbox/SubToolbox authority and certification

## Canonical files

- `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md`
- `src/components/Toolbox.tsx`
- `src/components/subtoolbox/tokens.ts`
- `src/styles/toolbox-system.css`
- `src/styles/subtoolbox-system.css`
- `src/styles/toolboxPalette.ts`
- `src/views/StudioHub.tsx`
- Project Builder/Board/Calendar implementations
- `src/app/pageRegistry.ts`
- `src/app/superToolViewRegistry.ts`

## Geometry authority

| Level | Desktop height | Stroke | Radius | Shadow | Type |
|---|---:|---:|---:|---:|---:|
| Toolbox T0 | 80px | 5px | 16px | 10px | 26px |
| SubToolbox T1 | 56px | 4px | 12px | 6px | 20px |
| L1 | 48px | 3px | 8px | 4px | 18px |
| L2 | 32px | 2px | 6px | 2px | 12px |

Mobile values are defined by production tokens and are an intentional density adaptation, not a second desktop authority.

## Palette and portal rules

`getToolboxPaletteColors(index)` and the 12-color spectrum own normal identity colors. The owning SubToolbox supplies pair A/pair B to descendants. A portal breaks CSS inheritance; bridge those variables onto the portal root. Semantic warning/success/error/status colors are allowed when they communicate meaning.

## Required interaction evidence

Certify real interaction for collapse control, controlled dropdown selection, header actions, palette order, focus, first-child clearance, mobile editable controls, split-left actions, upload/media previews, asset title/tag/notes editing, and recovery from disconnected/loading/error states. Capture portrait and landscape mobile plus desktop evidence where the surface supports them. Source inspection or a static catalog example is not sufficient.

## Documentation handoff

When production primitives or shell geometry change, update the Toolbox master and Component Library source of truth. When a tool changes Project/ContentBuild/Asset ownership, update the relevant Project/Asset authority. Register new skills, plans, prototypes, scripts, and external sources in `docs/registry.json` or the owning registry. Preserve historical/donor documents; do not silently promote them to authority.
