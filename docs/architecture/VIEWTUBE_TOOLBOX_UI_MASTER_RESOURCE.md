# ViewTube Toolbox UI Master Resource

**Status:** Living design-system authority  
**Updated:** 2026-09-14  
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

**MOTION AUTHORITY CONFLICT — REQUIRES RECONCILIATION.** Do not normalize unrelated motion durations from documentation alone.

Verified current production Subtoolbox token evidence in `src/components/subtoolbox/tokens.ts` is:

- control feedback: `180ms`
- Subtoolbox collapse/open: `300ms ease-out`
- `SUBTOOLBOX_COLLAPSE_TRANSITION`: `duration-300 ease-out`

A newer documented direction proposed `600ms` shell/module disclosure motion, but this is **not currently the production Subtoolbox token authority**. Therefore the previous statement that 600ms had already superseded the 300ms production rule is itself **SUPERSEDED / CORRECTED** by this audit. Widget motion, Toolbox motion, Subtoolbox motion and dropdown motion remain separate authorities until code, Reference Library and tests are deliberately reconciled.

Reduced-motion mode remains required.

## 12. Responsive contract

- phone level-0 Toolbox/Widget modules are full width by default
- Subtoolboxes stack before labels/controls become illegible
- 4-column grids collapse 4 -> 2 -> 1; 3 -> 2 -> 1; 2 -> 1 where appropriate
- registered-height controls do not grow because children wrap
- headers never scroll
- long content uses bounded internal scrolling
- wide operational surfaces use semantic mobile modes rather than only `overflow-x:auto`
- Kanban: one-lane mobile mode is the target; current Projects implementation still requires migration/verification
- calendar/schedule: agenda/day-first mobile mode is the target; current implementation still requires migration/verification
- inspector: bounded desktop side panel, full-screen mobile sheet
- data tables/timelines: preserve essential controls and provide designed narrow-screen navigation

## 13. Accessibility contract

Every canonical interactive primitive must support keyboard navigation, logical tab order, visible `:focus-visible`, appropriate Enter/Space semantics, native control semantics where practical, correct ARIA for custom menu/disclosure/switch behavior, intentional `disabled` vs `aria-disabled`, readable icon-action labels, non-color-only selected state, sufficient contrast, reduced motion and usable mobile touch targets.

## 14. Grid/layout authority

Use canonical layout recipes before page-local `grid-template-columns`. Preferred spacing: 4, 8, 12, 16, 24px. Alignment is edge-based: peer strokes, rails, baselines and shadow offsets visually align. Avoid double padding from parent shell + child surface. Collapse columns rather than shrinking controls below their structural level.

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

A primitive is complete only when code and library demonstrate the same named contract. Certification requires the same production export/token path where practical, every supported structural level, relevant states, palette inheritance, desktop/mobile behavior, geometry comparison, keyboard/accessibility behavior, a real production caller and regression coverage.

Status vocabulary: `CANONICAL`, `IMPLEMENTED`, `VERIFIED`, `MIGRATE`, `LEGACY COMPATIBILITY`, `EXCEPTION`, `PLANNED`, `SUPERSEDED`, `REMOVE`, `REGRESSION / OPEN ISSUE`. Existing `PROPOSED`, `DESIGNED` and `IMPLEMENTING` labels may remain as descriptive aliases but must not imply verification.

## 17. Certification ledger

| Primitive/family | Code | Reference Library | Mobile | A11y | Regression tests | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| Toolbox/Subtoolbox shells | yes | yes | partial | partial | required | IMPLEMENTED |
| Standard buttons | yes | yes | partial | partial | required | IMPLEMENTED |
| Split-left actions | yes | yes | partial | partial | required | IMPLEMENTED |
| Analytics split-left dropdown | partial/design | reference direction | required | required | required | MIGRATE |
| Inputs/Textareas | yes | yes | partial | partial | required | IMPLEMENTED |
| Checkbox/Radio/Switch/Toggle | yes/partial | expanding | required | required | required | IMPLEMENTED / MIGRATE |
| Tags/Badges | yes | yes | partial | partial | required | IMPLEMENTED |
| Tight Reveal upload | yes | yes | partial | partial | required | IMPLEMENTED |
| Guide Subtoolbox | not fully canonical | designed | required | required | required | PLANNED / MIGRATE |
| State panels | yes | yes | partial | partial | required | IMPLEMENTED |
| Projects T0 tool composition | yes | update required | unverified | partial | required | IMPLEMENTED / REFERENCE UPDATE REQUIRED |

Update this ledger whenever implementation status changes.

## 18. Current audit findings

**High:** historical CSS pathways can style similar controls; Toolbox hierarchy has regressed; split-left composition/divider thickness has regressed; mobile modules have become half-width; height systems have produced runaway content; embedded child tools can create duplicate Toolbox shells; Project Board still contains feature-local shell geometry inside its canonical T0 Toolbox.

**Medium:** dropdown open states can diverge from triggers; `.vt-input-standard` can compete with Toolbox primitives; palette tokens require verification; standalone prototypes may outrun production; page-local compatibility CSS can become permanent; motion documentation and production Subtoolbox tokens currently disagree.

Required direction: token authority, CSS isolation, bounded layouts, explicit embedded/bare API, one canonical open-menu recipe, responsive semantic modes, visual regression fixtures and controlled migration waves.

## 19. Page-specific notes

### Studio Hub
Primary certification/migration target. Reference Library must show all canonical primitives, levels and states. Migrate one real tool after each primitive-family change.

### Analytics / Master Data Tables
Canonical visual reference for Analytics-style split-left dropdown anatomy. Extract reusable anatomy without importing Analytics business logic or leaking widget CSS.

### Video Manager
Disconnected state must preserve the full UI. Connection gates data/actions, not the normal tool interface.

### Comment Responder
Persistent shell + explicit disconnected/data states. Do not conflate no comments with no connection.

### Video Publisher
Normalize geometry only while preserving publishing behavior.

### Thumbnail Studio
Primary acceptance-test candidate for nested modules, inputs, actions, uploads and collapsed sections.

### Projects
**CURRENT STATE:** creator-facing Project Board and Publishing Schedule exist. Project Board, Publishing Schedule, Project Studio and Storyboard Studio are intended to be independent T0 Toolbox modules. The temporary page-level Board/Calendar/Studio/Storyboard switcher from PR #164 is **SUPERSEDED** by the separate-Toolbox composition.

**IMPLEMENTED:** creator-facing Kanban foundation (PR #158) and publishing calendar (PR #159) were merged. The Projects composition was subsequently restored to separate T0 Toolbox modules in the later main-line work discussed in this handoff.

**REGRESSION / OPEN ISSUE:** Project Board still contains a bespoke inner outer-shell/header treatment inside the canonical Toolbox. Feature-local `4px` border, `14px` radius and `8px` shadow values must not be promoted to system authority. They are migration debt.

**NEXT SAFE MIGRATION:** preserve all Kanban data/drag/filter/detail behavior; remove only duplicate exterior chrome; move search/filter/action groups and appropriate functional sections onto canonical T1/T2 primitives. Audit Publishing Schedule, Project Studio and Storyboard for the same double-shell pattern before changing them.

**MOBILE:** the 70px project-overlay safe-area correction is an implementation-specific compatibility fix, not a global geometry rule. One-lane Kanban and agenda/day-first scheduling remain planned/uncertified.

**CERTIFICATION:** REFERENCE LIBRARY UPDATE REQUIRED. Do not mark Projects Toolbox composition VERIFIED until desktop/mobile, open/closed and relevant state behavior are visually tested.

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
10. Projects: remove duplicate inner shells and migrate internals without feature loss
11. Projects/Vault responsive semantic modes
12. application-wide legacy geometry audit
13. remove compatibility CSS only after consumers migrate

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
- [ ] motion uses the actual authority for that system; do not assume 300ms or 600ms globally
- [ ] mobile structural module becomes full width
- [ ] content remains bounded
- [ ] disconnected/loading/empty/error preserve shell
- [ ] keyboard/focus/ARIA behavior verified
- [ ] canonical primitive used instead of one-off CSS
- [ ] widget/editor CSS cannot leak into Toolbox system
- [ ] exactly one visible T0 shell/title per tool

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
| 2026-09-13 | 600ms shell/module open-close documented as direction | SUPERSEDED / CONFLICT FOUND |
| 2026-09-14 | Production Subtoolbox tokens verified at 300ms collapse and 180ms control; motion systems must be reconciled explicitly | REGRESSION / OPEN ISSUE |
| 2026-09-14 | Projects page-level view switcher is not the accepted composition; major Projects tools return to separate T0 Toolboxes | CURRENT |
| 2026-09-14 | Project Board duplicate inner shell is migration debt, not a new geometry authority | MIGRATE |
| 2026-09-14 | Projects consumer changes require Reference Library certification before VERIFIED status | REFERENCE UPDATE REQUIRED |

## 24. Document editing protocol

This file is authority, not a scratchpad.

- stable reusable rules belong in numbered sections
- page exceptions belong in page notes/audits, not global geometry
- every production rule change gets a dated decision entry
- prototype-only work remains explicitly non-production
- retain superseded history instead of silently erasing it
- when code and docs disagree, inspect canonical source and log reconciliation
- new primitives must update code, registry, Reference Library, responsive examples, tests and this resource
- removed primitives must be searched/migrated before deletion
- branch/PR references belong in status notes, not permanent geometry rules

## 25. Definition of done

A Toolbox UI migration is complete only when hierarchy, geometry, color inheritance, state behavior, accessibility, motion, mobile composition and business functionality are verified; the Reference Library uses the same canonical primitive; visual/regression checks pass; no competing geometry authority is introduced; and this document's ledger/log/page notes are updated.

## 26. Projects conversation implementation evidence — 2026-09-14

| Finding | Classification | Evidence / status |
| --- | --- | --- |
| Creator-facing Kanban replaces developer-facing Project Command workbench | IMPLEMENTED | PR #158; canonical project records retained with workspace metadata layer |
| Creator publishing calendar with Month/Week/Agenda + unscheduled backlog | IMPLEMENTED | PR #159; uses `Project.publishDate` |
| Page-level Board/Calendar/Studio/Storyboard switcher | SUPERSEDED | PR #164 merged that composition; later accepted direction restored separate Toolbox modules |
| Project Board, Publishing Schedule, Project Studio, Storyboard Studio as separate T0 modules | IMPLEMENTED | Main-line composition direction; preserve as current Projects hierarchy |
| Duplicate Project Board custom shell/header | MIGRATE / OPEN ISSUE | Remove presentation shell only; preserve behavior |
| `fix/projects-toolbox-internal-hierarchy` | PLANNED | Dedicated cleanup branch was created from an earlier main; reconcile with current main before writing because main advanced |
| Projects mobile overlay top offset | LEGACY COMPATIBILITY / EXCEPTION | 70px mobile shell accommodation; do not globalize without overlay-system audit |
| Projects Reference Library examples | REFERENCE UPDATE REQUIRED | Consumer composition changed without corresponding certification pass |

### Repository snapshot for this update

- Repository: `themotionvisual/ViewTubeBUILD`
- Main inspected before this edit: `844a708f63e86ce52980a079d2c5907c0b710e41` (merge PR #207)
- PR #158: merged Projects Kanban foundation
- PR #159: merged creator publishing calendar
- PR #164: merged temporary compact workspace switcher; composition is now **SUPERSEDED**
- Current cleanup work must be rebased/reconciled from current main before further implementation; do not overwrite newer main work.

### Handoff rule

For the next Projects UI pass: keep each major Projects tool as one T0 Toolbox; never nest a second main-style shell/title inside it; use T1/T2/T3 primitives for internal functional groups; preserve all business/data behavior; do not globalize feature-local geometry or the 70px overlay compatibility rule; verify mobile/open/closed/states; then update the Reference Library and this ledger before marking the migration VERIFIED.

## Related resources

These are subordinate supporting references and should link back to this Master Resource when next edited:

- `docs/architecture/STUDIO_HUB_COMPONENT_STANDARDIZATION_V1.md`
- `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md`
- `docs/architecture/STUDIO_HUB_MIGRATION_MATRIX_V1.md`
- `docs/architecture/MOBILE_WIDGET_PHASE2_CLASSIFICATION.md`
- `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md`
- `docs/MOBILE_VISUAL_QA_MATRIX.md`

**Rule:** if a supporting resource conflicts with this file, verify production code/current accepted direction, reconcile deliberately, and record the result here.