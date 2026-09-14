# ViewTube Toolbox UI System Documentation

This folder is the stable documentation and reference home for the ViewTube Toolbox / Subtoolbox / Studio Hub UI system.

## Authority order

1. **Production tokens, primitives, CSS and React code** are the executable authority.
2. **Studio Hub UI Reference Library** is the visual certification surface for production primitives.
3. **Toolbox UI Master Resource** is the living rule, rationale, status, audit, migration and exception authority.
4. **Standalone HTML libraries, screenshots and infographics** are references until their contracts are deliberately promoted into production code and certified.
5. **Legacy versions** remain traceability evidence only and must not become a competing geometry authority.

A primitive is not complete merely because it appears in an HTML prototype. It becomes canonical only when its contract exists in production code/tokens, is represented in the UI Reference Library, is verified across required states/responsive conditions, and is recorded in the Master Resource/component registry.

## Folder system

- `master/` — one stable canonical Master Resource document. Git history replaces chains of `FINAL`, `FINAL_UPDATED`, etc.
- `libraries/complete/` — current complete standalone UI-system library.
- `libraries/components/` — specialized component libraries.
- `libraries/guides/` — Guide Subtoolbox / instructional recipe libraries.
- `infographics/` — visual summaries of palette, geometry, hierarchy, grids and system rules.
- `reference/` — approved screenshots and visual source references.
- `legacy/` — superseded V2/V3/V4/etc. prototype libraries retained for traceability.
- `audits/` — regression reports, migration ledgers and certification audits.
- `decisions/` — focused architecture/design decision records.

## Adding or editing a related file

1. Fetch current `main` and inspect this folder before adding anything.
2. Classify the artifact: canonical document, production-linked reference, prototype, specialized library, infographic, audit, decision record or legacy artifact.
3. Do not add another file named `FINAL`. The canonical Master Resource has one stable repository filename; version history belongs in Git.
4. If a new standalone library supersedes an older one, place the new file in the active folder and move the replaced version to `legacy/` in the same PR.
5. Update `MANIFEST.md` in the same change with purpose, status, related production code, UI Reference Library relationship and verification state.
6. Visual prototypes must say `REFERENCE ONLY — NOT PRODUCTION AUTHORITY` unless their contract has been promoted to production code and certified.
7. Component libraries must map canonical components to production primitives. Unimplemented designs must be labeled `PROPOSED` or `DESIGNED`.
8. If the artifact changes a canonical primitive, update the production primitive/token and UI Reference Library in the same change set, or explicitly record that the artifact is proposed only.
9. Preserve mobile, accessibility, interaction/data/connection states and CSS ownership boundaries in the update record.
10. Use a focused branch/PR. Never force-update `main` or discard newer main work to make documentation fit.

## Required component-record fields

Each canonical component record should include: canonical name/ID, family, structural level(s), source file, UI Reference Library section, supported states, palette behavior, mobile behavior, accessibility behavior, known consumers, status, replacement/superseded component, last verified date, verified commit SHA and notes.

## Structural rules to preserve

- Geometry is level-owned: height, stroke, radius, shadow, type scale and structural spacing travel together.
- Component type owns anatomy, not arbitrary geometry.
- The base layout rhythm is 4px; common gaps are 4 / 8 / 12 / 16 / 24px.
- Split-left rails remain square: rail width equals row height; divider equals the level stroke.
- Mobile top-level Toolbox/Widget modules are full width by default; collapse layouts before shrinking canonical control geometry.
- Bounded modules own bounded content regions; headers do not scroll.
- `disconnected`, `loading`, `empty`, `error`, `ready`, `disabled` and `selected` are distinct states.
- Authentication/connection gates capabilities and data, not the existence of the normal tool interface.
- Studio Hub Toolbox CSS and Analytics Widget CSS remain separate authorities.

## Known authority conflicts

Do not silently reconcile these in documentation:

- **Level naming:** some new visual references call Toolbox `Level 0`, Subtoolbox `Level 1`, Compact Subtoolbox `Level 2`; historical production/master-resource terminology also uses L0/L1/L2 for child/interior levels. Publish an alias mapping before changing APIs.
- **Motion:** current documented production Subtoolbox authority is 300ms ease-out; recent Analytics Widget collapse work uses 600ms. Widget timing does not automatically redefine Toolbox/Subtoolbox timing.
- **Structural level vs size variant:** `large / standard / small / micro` variants are not automatically structural hierarchy levels.
- **Prototype geometry:** any prototype radius/stroke/height that differs from production tokens is a proposal or exception until reconciled.

See `MANIFEST.md` for the companion-artifact register and import plan.