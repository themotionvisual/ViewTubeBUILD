# ViewTube Toolbox UI Master Resource

**Status:** Living design-system authority  
**Updated:** 2026-09-13  
**Scope:** Toolbox, Subtoolbox, Studio Hub controls, reusable layouts, states, responsive behavior, certification, migration, audits and page-specific exceptions.

This document consolidates the uploaded **ViewTube Toolbox UI Master Resource Reference COMPLETE** with the existing `STUDIO_HUB_COMPONENT_STANDARDIZATION_V1.md`, `SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md`, and `STUDIO_HUB_MIGRATION_MATRIX_V1.md`. Those files remain useful historical/implementation references, but this file is the first document to consult when rules overlap.

## 1. Governing laws

1. **Hierarchy = geometry.** Structural depth controls height, stroke, radius, shadow, typography and spacing.
2. **Level owns geometry.** Component anatomy never invents structural dimensions.
3. **Component = anatomy.** Buttons, dropdowns, switches, radios, uploads and cards define internal composition and state behavior only.
4. **Color = identity.** Family color is inherited; feature children do not invent arbitrary colors.
5. **Fill = state.** Accent = identity/primary/selected; white = secondary/inactive; light tint = passive/informational; black = structural.
6. **4px rhythm.** Structural spacing derives from 4px.
7. **Disconnected != missing UI.** Authentication gates capability/data, not the existence of the interface.
8. **Reference Library = certification surface.** Production primitives must be demonstrated there using the same exports/tokens.
9. **No parallel authority.** Page-local CSS, prototypes and compatibility components cannot silently create a second geometry system.
10. **Business behavior is preserved during visual migration.** Presentation migration and data/feature removal ship separately.

## 2. Canonical hierarchy

| Semantic level | Legacy label | Primary use | Height | Stroke | Radius | Shadow | Default type |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| T0 | Toolbox shell | Top-level tool/module | 80px | 5px | 16px | 10px | 26px / 1000 |
| T1 | L0 / Standard Subtoolbox | Direct Toolbox child / peer action | 56px | 4px | 12px | 6px | 20px / 900-1000 |
| T1 Compact | Compact Subtoolbox | Compact nested shell | 44px | 3px | 10px | 4px | 17-20px |
| T2 | L1 child | Standard interior peer | 48px | 3px | 8px | 4px | ~14px |
| T3 | L2 dense child | Dense/compact peer | 32px | 2px | 6px | 2px | 9-10px |

`T0/T1/T2/T3` is the preferred semantic vocabulary. Legacy L0/L1/L2 labels may remain in existing code/docs until migrated, but must not change the geometry above.

### Paired-height equations

- T1: `26 + 4 + 26 = 56px`
- T2: `22 + 4 + 22 = 48px`
- T3: `14 + 4 + 14 = 32px`
- Split-left rail width = full row height.
- A smaller control at a level does **not** silently thin the level stroke.

## 3. Token architecture

Canonical feature code consumes semantic tokens; it does not copy structural pixel values.

```text
geometry.level.toolbox.*
geometry.level.subtoolbox.*
geometry.level.subtoolboxCompact.*
geometry.level.interior.*
geometry.level.dense.*
spacing.*
typography.*
motion.*
palette.*
state.*
responsive.*
zIndex.*
```

Current implementation authority remains `src/components/subtoolbox/tokens.ts`; any future `src/studio-ui/tokens.ts` bridge must consume or map the same authority rather than duplicate it.

## 4. Color system

Canonical documented palette:

`#FF3B30`, `#FF7A00`, `#FFDD00`, `#9BE300`, `#00D084`, `#00D9F5`, `#2C9CFF`, `#5965FF`, `#9557FF`, `#D348FF`, `#FF48BD`, `#FA618A`.

Production palette tokens must be verified before changing these values. Reconciliation is logged; colors are never silently replaced.

## 5. Primitive families

Every supported structural level should be representable in the Studio Hub Reference Library where the anatomy is meaningful:

- standard button
- split-left button
- Head/Tail split-left action
- Analytics-style split-left dropdown
- input/search/number input
- textarea
- select/dropdown/multiselect
- checkbox
- radio
- switch
- toggle
- segmented control
- slider
- badge/tag
- progress
- metric/stat cell
- output/information card
- scroll/results surface
- table/data surface
- state panel
- Tight Reveal upload
- Guide Subtoolbox
- inspector/panel recipe

Controls should be **loose by default**. Checkbox, radio, switch, toggle and peer controls do not require an enclosing card merely to exist.

## 6. Split-left contract

Split-left is anatomy, not a separate sizing system.

- rail width = row height
- rail divider = outer level stroke
- only the left rail is split in the Analytics-style dropdown
- small label (for example `SET`) sits above the arrow
- right region is one uninterrupted value/title area
- open menu preserves closed width, stroke, radius family, row scale, typography, family color and shadow
- open menus use the approved small separation gap; they must not visually fuse or be clipped by the parent table/toolbox
- Head = accent rail + white title region with accent-derived shadow treatment
- Tail = inverse fill relationship

## 7. Fields and text areas

- T2 standard field: 48px, 3px structural border, 8px radius, ~14px heavy type, inherited light accent tint, 4px accent-derived shadow.
- Focus preserves structural identity and uses inherited accent.
- Textareas use bounded registered heights; long content scrolls internally.
- Textarea idle may use subtle tint; focused state becomes white with a stronger accent focus treatment.
- Broad `.vt-input-standard`, global `input/select/textarea`, widget selectors and Toolbox selectors must not leak across ownership boundaries.

## 8. Tight Reveal upload

Tight Reveal #05 is the canonical upload anatomy. It replaces legacy dashed drop zones.

Supported recipes include 16:9 video, 9:16 video, 1:1 image, thumbnail, document, audio and generic file. The canonical upload frame has no legacy black outer stroke. One primitive owns interaction, drag state and styling.

## 9. Guide Subtoolbox

Guide Subtoolbox is an instruction-first T1 module. Approved variants:

- **Info** - short context and input/output description
- **Instructions** - ordered pre-use guidance/options
- **Process / AI Cost** - cost/stat cell, progress and result/preparation state

Recommended anatomy: title, brief task-oriented description, optional AI cost/stat, compact progress, input description, output description, loose options and optional miniature `Toolbox -> Subtoolbox -> Guide` hierarchy.

## 10. State contract

All interactive primitives define relevant states from this vocabulary:

`idle`, `hover`, `focus-visible`, `active`, `selected/on`, `disabled`, `loading`, `ready`, `empty`, `filtered-zero`, `blocked`, `disconnected`, `connecting`, `reconnect-required`, `stale`, `error`, `success`.

State rules:

- shell remains present for loading/empty/error/disconnected states
- disabled and disconnected are not synonyms
- connection state and data state are independent
- focus is visible and accent-derived
- state changes may alter fill/shadow/opacity/cursor/copy, but not structural geometry
- selected/on state must remain visually distinguishable without relying only on color

## 11. Motion authority

**Resolved 2026-09-13:** shell/module/disclosure open-close motion uses **600ms ease-out** in the current Toolbox direction. Micro-interactions such as hover, focus, toggle/thumb feedback and menu-row feedback should remain faster, normally **150-300ms**. Reduced-motion mode removes nonessential animation.

This supersedes the older blanket 300ms shell-collapse rule in `SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md`. Code tokens, reference examples and regression tests must be reconciled together; do not leave mixed shell durations.

## 12. Responsive contract

- phone level-0 Toolbox/Widget modules are full width by default
- Subtoolboxes stack before labels/controls become illegible
- 4-column grids collapse 4 -> 2 -> 1; 3 -> 2 -> 1; 2 -> 1 where appropriate
- registered-height controls do not grow because children wrap
- headers never scroll
- long content uses bounded internal scrolling
- wide operational surfaces use semantic mobile modes rather than only `overflow-x:auto`
- Kanban: one-lane mobile mode
- calendar/schedule: agenda/day-first mobile mode
- inspector: bounded desktop side panel, full-screen mobile sheet
- data tables/timelines: preserve essential controls and provide designed narrow-screen navigation

## 13. Accessibility contract

Every canonical interactive primitive must support:

- keyboard navigation and logical tab order
- visible `:focus-visible`
- Enter/Space semantics appropriate to role
- native control semantics where practical
- correct ARIA for custom menu/disclosure/switch behavior
- `disabled` vs `aria-disabled` used intentionally
- readable labels for icon-only actions
- selected/on state not communicated by color alone
- sufficient contrast across palette/state combinations
- reduced-motion behavior
- mobile touch interaction with usable hit targets; small visual controls may use a larger invisible hit area without changing structural visual geometry

## 14. Grid/layout authority

Use the canonical layout recipes before page-local `grid-template-columns`.

Preferred spacing: 4, 8, 12, 16, 24px. Alignment is edge-based: peer strokes, rails, baselines and shadow offsets visually align. Avoid double padding from parent shell + child surface. Collapse columns rather than shrinking controls below their structural level.

## 15. Implementation authority / repo map

| Area | Authority |
| --- | --- |
| `src/components/Toolbox.tsx` | canonical Toolbox/Subtoolbox structural behavior |
| `src/styles/toolbox-system.css` | Toolbox shell visual system |
| `src/styles/subtoolbox-system.css` | Subtoolbox/container states |
| `src/components/subtoolbox/tokens.ts` | geometry/type/spacing/motion authority |
| `src/components/subtoolbox/SubToolboxPrimitives.tsx` | reusable controls/surfaces/states |
| `src/components/subtoolbox/SubToolboxLayouts.tsx` | reusable composition recipes |
| `src/components/subtoolbox/registry.ts` | recipe/migration mapping |
| `src/components/ToolboxUIReferenceLibrary.tsx` | visual certification surface |
| `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` | governance/rules/audits/status authority |

Legacy/quarantine files are reference-only and must not become a second authority.

## 16. Coded primitives <-> Reference Library certification

A primitive is complete only when code and library demonstrate the same named contract.

Certification requires:

1. same production export/token path wherever practical
2. every supported structural level
3. relevant state rows
4. palette inheritance examples
5. desktop and mobile behavior
6. geometry comparison: height, stroke, divider, radius, shadow, rail, type, gap, padding
7. keyboard/accessibility behavior
8. real production caller identified or migrated
9. visual regression coverage

Status vocabulary:

- `PROPOSED` - idea/audit recommendation
- `DESIGNED` - approved reference contract, not necessarily coded
- `IMPLEMENTING` - active branch work
- `IMPLEMENTED` - canonical production code exists
- `VERIFIED` - desktop/mobile/states/reference/tests aligned
- `SUPERSEDED` - historical decision retained but no longer authoritative

## 17. Certification ledger

| Primitive/family | Code | Reference Library | Mobile | A11y | Regression tests | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| Toolbox/Subtoolbox shells | yes | yes | partial | partial | required | IMPLEMENTED |
| Standard buttons | yes | yes | partial | partial | required | IMPLEMENTED |
| Split-left actions | yes | yes | partial | partial | required | IMPLEMENTED |
| Analytics split-left dropdown | partial/design | reference direction | required | required | required | DESIGNED / MIGRATE |
| Inputs/Textareas | yes | yes | partial | partial | required | IMPLEMENTED |
| Checkbox/Radio/Switch/Toggle | yes/partial | expanding | required | required | required | IMPLEMENTING |
| Tags/Badges | yes | yes | partial | partial | required | IMPLEMENTED |
| Tight Reveal upload | yes | yes | partial | partial | required | IMPLEMENTED |
| Guide Subtoolbox | not fully canonical | designed | required | required | required | DESIGNED |
| State panels | yes | yes | partial | partial | required | IMPLEMENTED |

Update this ledger whenever implementation status changes.

## 18. Current audit findings

**High:** historical CSS pathways can style similar controls; Toolbox hierarchy has regressed; split-left composition/divider thickness has regressed; mobile modules have become half-width; height systems have produced runaway content; embedded child tools can create duplicate Toolbox shells.

**Medium:** dropdown open states can diverge from triggers; `.vt-input-standard` can compete with Toolbox primitives; palette tokens require verification; standalone prototypes may outrun production; page-local compatibility CSS can become permanent.

Required direction: token authority, CSS isolation, bounded layouts, explicit embedded/bare API, one canonical open-menu recipe, responsive semantic modes, visual regression fixtures and controlled migration waves.

## 19. Page-specific notes

### Studio Hub
Primary certification/migration target. Reference Library must show all canonical primitives, levels and states. Migrate one real tool after each primitive-family change.

### Analytics / Master Data Tables
Canonical visual reference for Analytics-style split-left dropdown anatomy. Extract the reusable anatomy without importing Analytics business logic or leaking widget CSS.

### Video Manager
Disconnected state must preserve the full UI. Remove replacement-screen behavior; selectors/actions become connection-aware. Preserve business logic.

### Comment Responder
Persistent shell + explicit disconnected/data states. Do not conflate no comments with no connection.

### Video Publisher
Normalize geometry only while preserving publishing behavior.

### Thumbnail Studio
Primary acceptance-test candidate for nested modules, inputs, actions, uploads and collapsed sections.

### Projects
Project is persistent context; tools are views/actions on it. Exactly one visible T0 title per tool. Child tools begin with Subtoolboxes/surfaces/primitives. Shared Project Inspector and shared Calendar Engine are target architecture. Kanban and calendar require semantic mobile modes.

### Creator Vault / Asset Engine
Use canonical shells, upload, tags and bounded grids. Workspace project identity should synchronize while standalone fallback remains safe.

### Editor
Editor interaction/timeline controls are a separate system. Reuse tokens selectively; do not force Toolbox hierarchy onto timeline-specific controls.

## 20. Production migration order

1. token authority and semantic level API
2. complete/certify Reference Library
3. reconcile motion and palette authority
4. complete split-left dropdown + loose binary control families
5. Thumbnail Studio acceptance migration
6. Studio Hub tools one Toolbox at a time
7. Video Manager disconnected-preview normalization
8. Comment Responder + Video Publisher state separation
9. Analytics cross-reference without CSS leakage
10. Projects/Vault hierarchy + responsive modes
11. application-wide legacy geometry audit
12. remove compatibility CSS only after consumers migrate

## 21. New primitive checklist

- [ ] existing primitive cannot express anatomy through composition/props
- [ ] supported structural levels declared
- [ ] geometry comes from canonical level tokens
- [ ] palette inheritance defined
- [ ] interaction + accessibility states defined
- [ ] responsive behavior defined
- [ ] exported from canonical primitive module
- [ ] registry/migration mapping updated
- [ ] Reference Library includes levels/states
- [ ] this Master Resource updated
- [ ] production caller migrated/identified
- [ ] visual regression coverage added
- [ ] no new global CSS leakage

## 22. UI audit checklist

- [ ] correct semantic structural level
- [ ] peers share stroke/radius/height/shadow
- [ ] split-left divider equals outer stroke
- [ ] rail width equals row height
- [ ] gaps derive from 4px
- [ ] paired controls satisfy parent-height equation
- [ ] open state preserves trigger geometry
- [ ] correct 600ms shell/disclosure motion or approved micro duration
- [ ] mobile structural module becomes full width
- [ ] content remains bounded
- [ ] disconnected/loading/empty/error preserve shell
- [ ] keyboard/focus/ARIA behavior verified
- [ ] canonical primitive used instead of one-off CSS
- [ ] widget/editor CSS cannot leak into Toolbox system

## 23. Adjustment / decision log

| Date | Decision | Status |
| --- | --- | --- |
| 2026-09-13 | Established living Toolbox UI master authority | CURRENT |
| 2026-09-13 | Structural level owns geometry | DEFINED |
| 2026-09-13 | Added loose binary controls | IMPLEMENTING |
| 2026-09-13 | Added paired-height equations | DEFINED |
| 2026-09-13 | Split-left dropdown matches Analytics anatomy: label above arrow, only left rail split | DESIGNED / MIGRATE |
| 2026-09-13 | Tight Reveal is canonical upload; no dashed treatment or legacy black outer stroke | IMPLEMENTED |
| 2026-09-13 | Semantic T0/T1/T2/T3 vocabulary added while preserving legacy mappings | DEFINED |
| 2026-09-13 | 600ms shell/module open-close supersedes blanket 300ms rule; micro interactions remain 150-300ms | DEFINED / CODE RECONCILIATION REQUIRED |
| 2026-09-13 | Accessibility and certification contracts promoted to system-level requirements | DEFINED |
| 2026-09-13 | Existing Studio Hub/Subtoolbox docs consolidated under this authority | CURRENT |

## 24. Document editing protocol

This file is authority, not a scratchpad.

- stable reusable rules belong in numbered sections
- page exceptions belong in page notes/audits, not global geometry
- every production rule change gets a dated decision entry
- prototype-only work remains `DESIGNED`
- retain superseded history instead of silently erasing it
- when code and docs disagree, inspect canonical source and log reconciliation
- new primitives must update code, registry, Reference Library, responsive examples, tests and this resource
- removed primitives must be searched/migrated before deletion
- branch/PR references belong in status notes, not permanent geometry rules

## 25. Definition of done

A Toolbox UI migration is complete only when hierarchy, geometry, color inheritance, state behavior, accessibility, motion, mobile composition and business functionality are verified; the Reference Library uses the same canonical primitive; visual/regression checks pass; no competing geometry authority is introduced; and this document's ledger/log/page notes are updated.

## Related resources

These are subordinate supporting references and should link back to this Master Resource when next edited:

- `docs/architecture/STUDIO_HUB_COMPONENT_STANDARDIZATION_V1.md`
- `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md`
- `docs/architecture/STUDIO_HUB_MIGRATION_MATRIX_V1.md`
- `docs/architecture/MOBILE_WIDGET_PHASE2_CLASSIFICATION.md`
- `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md`
- `docs/MOBILE_VISUAL_QA_MATRIX.md`

**Rule:** if a supporting resource conflicts with this file, verify production code/current accepted direction, reconcile deliberately, and record the result here.