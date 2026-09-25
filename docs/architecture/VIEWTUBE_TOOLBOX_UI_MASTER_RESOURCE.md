# ViewTube Toolbox UI Master Resource

**Status:** Canonical living design-system authority  
**Updated:** 2026-09-25  
**Last audited main:** `eb4097e2749d69414ec18a22470cd0aa16cbb859`  
**Canonical owner / concern:** Production Toolbox/Subtoolbox shell hierarchy, Studio control/layout rules, responsive shell behavior, shared state/motion/accessibility rules, certification and migration policy.  
**Executable authority:** `src/components/subtoolbox/tokens.ts`, `src/components/Toolbox.tsx`, `src/styles/toolbox-system.css`, `src/styles/subtoolbox-system.css`, and their contract tests.  
**Related scoped authority:** `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md` owns Component Library/catalog presentation and primitive-correction notes. Dashboard widgets and Analytics Data Visuals retain separate registries/contracts.  
**Scope:** Toolbox, Subtoolbox, Studio Hub controls, reusable layouts, states, responsive behavior, certification, migration, audits and page-specific exceptions.

## Living update log

Append one concise row for every system-level update. Use Notes for conflicts, verification gaps, superseded rules, risk and the next safe action.

| Date / time | Conversation | AI / tool | Change | Repo evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-25 | Mobile Render preview correction audit | GPT-5.6 Sol + GitHub + iPhone screenshots | Re-opened Toolbox spacing, dropdown state, collapse icon, Vault assets, palette order and Component Library contracts | PR #432 merged; main `eb4097e2` | OPEN CORRECTION WAVE | Keep PR #432 header-action isolation, 16px mobile inputs, VisualViewport handling and paint-safe spacing intent; restore the established four-arrow collapse icon. |
| 2026-09-24 | Documentation authority consolidation | GPT-5.6 Sol + GitHub | Re-audited tokens/CSS/tests, separated shell vs control ladders, and demoted stale Studio migration geometry | `988098840050f4b658a266e1a7d6fe1c4d939c81` | CURRENT CODE AUTHORITY / VISUAL CERTIFICATION STILL REQUIRED | Desktop shell: T0=80/26, T1=56/20, T2=48/18, T3=32/12. Mobile shell: Toolbox=56, SubToolbox=44 with desktop title sizes preserved. |
| 2026-09-22 | Toolbox geometry authority reconciliation | GPT-5.6 Sol + GitHub | Reconciled production shell geometry with the accepted Component Library authority and removed its private shell override | `fix/toolbox-geometry-authority-2026-09-22` | IMPLEMENTED ON BRANCH / VISUAL CERTIFICATION REQUIRED | Current authority: T0=80px/26px; T1=56px/20px; T2=48px/18px; T3=32px/12px. Historical 56/44 implementation remains traceability only. |
| 2026-09-14 | Toolbox UI master handoff / 56-44 unification | GPT-5.6 Sol + GitHub | Added reusable handoff protocol and reconciled then-current shell authority | PR #207 -> `844a708f`; PR #211 -> `400269c5`; PR #215 -> `b2e4a534` | SUPERSEDED BY 2026-09-22 GEOMETRY AUTHORITY | Historical T0=56px/28px; T1=44px/22px; separate compact shell authority removed. |
| YYYY-MM-DD HH:MM | Conversation title | AI / tool | Single-row update summary | Branch / PR / commit | STATUS | Evidence, risk, validation, next action |

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
| T1 | L0 / Subtoolbox | Direct Toolbox child / peer action | 56px | 4px | 12px | 6px | 20px / 1000 |
| Former compact shell | Historical compatibility label only | No second shell geometry | - | - | - | - | SUPERSEDED |
| T2 | L1 child | Standard interior peer | 48px | 3px | 8px | 4px | 18px / 1000 |
| T3 | L2 dense child | Dense/compact peer | 32px | 2px | 6px | 2px | 12px / 1000 |

The former separate Compact Subtoolbox shell geometry is **SUPERSEDED**. Existing `heightMode="compact"` callers are compatibility-only and must not receive alternate shell height/stroke/radius/shadow geometry. Compactness may describe content density only.

### Executable desktop/mobile shell matrix

| Surface | Desktop | Mobile | Notes |
| --- | --- | --- | --- |
| Main Toolbox shell | 80px / 5px / 16px / 10px / 26px title | 56px height / 14px radius / 6px shadow | Mobile keeps the 26px title and permits two tight wrapped lines. |
| SubToolbox shell | 56px / 4px / 12px / 6px / 20px title | 44px height / 10px radius / 4px shadow | Mobile keeps the 20px title and permits two tight wrapped lines. |
| L1 interior structural level | 48px / 3px / 8px / 4px / 18px title | responsive composition, not a new shell | Structural level, not a Compact Subtoolbox shell. |
| L2 dense structural level | 32px / 2px / 6px / 2px / 12px title | responsive composition | Dense structural level. |

`TOOLBOX_MOBILE_HEADER_DNA` is an intentional mobile shell override, not evidence that desktop 56/44 geometry returned.

### Structural level vs component/control size

Do not conflate the shell/structural ladder with component-size variants.

| Component level | Height | Stroke | Radius | Shadow | Font |
| --- | ---: | ---: | ---: | ---: | ---: |
| L0 action | 56px | 4px | 12px | 6px | 24px |
| L1 standard | 48px | 3px | 8px | 5px | 18px |
| L2 compact/dense | 32px | 2px | 6px | 4px | 12px |

Separate control-size aliases may expose micro 26px / compact 32px / standard 48px / action 56px. A size variant changes component anatomy/density; it does not create another Toolbox/SubToolbox structural shell.

### Paired-height equations

- T1: `26 + 4 + 26 = 56px`
- T2: `22 + 4 + 22 = 48px`
- T3: `14 + 4 + 14 = 32px`
- Split-left rail width = full row height.
- A smaller control at a level does **not** silently thin the level stroke.

## 3. Token architecture

Current implementation authority remains `src/components/subtoolbox/tokens.ts`: Main Toolbox `80 / 5 / 16 / 10 / 26`, SubToolbox/L0 `56 / 4 / 12 / 6 / 20`, L1 `48 / 3 / 8 / 4 / 18`, and L2 `32 / 2 / 6 / 2 / 12`. The former `compactShell` token authority remains removed; compactness describes density, not a second shell geometry.

## 4. Color system

Production palette authority is `src/styles/toolboxPalette.ts` -> `VT_SPECTRUM_PALETTE_06`:

`#FA618A`, `#FF7F6B`, `#FFA85C`, `#FFDA47`, `#C0F240`, `#3FEE56`, `#4EE4BE`, `#36E0F6`, `#528FFA`, `#A467F4`, `#F55EFC`, `#FF7AC8`.

Canonical color inheritance is **12-color palette -> SubToolbox title/icon pair -> nested component pair**. `getToolboxPaletteColors(index)` owns the pairing rule: the SubToolbox title/header uses `getPaletteColor(index)`; the icon section uses `getPaletteColor(index + 4)`, wrapping through the same 12-color palette. `SubToolbox` exposes those two resolved colors to every nested primitive as `--pair-a` (title/header) and `--pair-b` (icon section). Components must consume that inherited pair and must not select, rotate, or synthesize their own palette pair. Component-specific props may change anatomy/state, but not silently replace the owning SubToolbox pair.

Production nested components must not expose arbitrary palette escape hatches such as `railColor`, `labelColor`, `accentColor`, `surfaceColor`, `controlColor`, `toneColor`, or equivalent props merely to recolor normal component anatomy. If a region genuinely needs a different normal palette pair, give it its own child `SubToolbox` and `paletteIndex`. Semantic colors remain valid when they encode meaning rather than decoration—for example error/warning/success state, rank/status, or a data-visual encoding.

A component rendered through a React portal must explicitly bridge the resolved `--pair-a` / `--pair-b` values onto the detached portal root because CSS inheritance stops when that DOM subtree moves under `document.body`. Open menus, popovers, and future detached surfaces must therefore retain the exact title/icon pair of their owning SubToolbox.

Older standalone/documented palette sequences are historical references only unless production tokens are deliberately changed.

## 5. Primitive families

Standard button; split-left button; Head/Tail split-left action; Analytics-style split-left dropdown; input/search/number input; textarea; select/dropdown/multiselect; checkbox; radio; switch; toggle; segmented control; slider; badge/tag; progress; metric/stat cell; output/information card; scroll/results surface; table/data surface; state panel; Tight Reveal upload; Guide Subtoolbox; inspector/panel recipe.

Controls should be **loose by default**. Checkbox, radio, switch, toggle and peer controls do not require an enclosing card merely to exist.

## 6. Split-left contract

- rail width = row height
- rail divider = outer level stroke
- only the left rail is split in the Analytics-style dropdown
- small label such as `SET` sits above the arrow
- right region is one uninterrupted value/title area
- no separate right-side chevron compartment
- open menu preserves closed geometry, family color and shadow
- open menus use the approved small separation gap and must not be clipped

PR #207 merged this requested anatomy and token-derived radius/shadow/gap behavior. PR #211 added static-render regression assertions. Desktop/mobile visual open-state certification remains separate.

## 7. Fields and text areas

T2 standard field remains 48px / 3px / 8px / 4px / ~14px. Focus preserves structural identity and uses inherited accent. Textareas use bounded registered heights and internal scrolling. Broad global input/widget/Toolbox selectors must not leak across ownership boundaries.

## 8. Tight Reveal upload

Tight Reveal #05 is the canonical upload anatomy. It replaces legacy dashed drop zones and has no legacy black outer frame.

## 9. Guide Subtoolbox

Guide Subtoolbox remains an instruction-first T1 module with Info, Instructions and Process / AI Cost variants. Productionization/certification remains incomplete.

## 10. State contract

`idle`, `hover`, `focus-visible`, `active`, `selected/on`, `disabled`, `loading`, `ready`, `empty`, `filtered-zero`, `blocked`, `disconnected`, `connecting`, `reconnect-required`, `stale`, `error`, `success`.

Shells remain present for loading/empty/error/disconnected. Connection state and data state are independent. DISCONNECTED != EMPTY; DISCONNECTED != ERROR; DISCONNECTED != MISSING UI.

## 11. Motion authority

Current executable tokens on the audited main define:

- shell/SubToolbox collapse: **600ms ease-out** via `SUBTOOLBOX_COLLAPSE_TRANSITION`;
- control/micro interaction token: **180ms**;
- reduced-motion: transitions disabled/reduced through the production motion classes.

A historical 300ms shell rule is superseded. Feature-specific data/widget animation timing does not redefine Toolbox disclosure timing.


**MOTION AUTHORITY — RECONCILED 2026-09-22.** Toolbox/Subtoolbox/module/disclosure open-close motion is 600ms ease-out. Micro-interactions such as hover, focus, toggle feedback and icon state changes remain faster at 150–300ms. Reduced-motion mode is required.

## 12. Responsive contract

Phone top-level Toolbox/Widget modules are full width by default. Structural grids collapse semantically. Registered-height controls do not grow because children wrap. Headers never scroll. Long content uses bounded internal scrolling. T0/T1 shell geometry does not silently shrink on mobile; responsive changes must be explicit and certified.

## 13. Accessibility contract

Canonical interactive primitives require keyboard navigation, logical tab order, visible focus, appropriate native/ARIA semantics, intentional disabled vs aria-disabled behavior, icon-action labels, non-color-only selected state, sufficient contrast, reduced motion and usable mobile touch targets.

## 14. Grid/layout authority

Use canonical layout recipes before page-local grid templates. Preferred spacing: 4, 8, 12, 16, 24px. Avoid double padding. Collapse columns rather than shrinking controls below their structural level.

## 15. Implementation authority / repo map

| Area | Authority |
| --- | --- |
| `src/components/Toolbox.tsx` | canonical Toolbox/Subtoolbox structural behavior |
| `src/styles/toolbox-system.css` | Toolbox shell visual system |
| `src/styles/subtoolbox-system.css` | Subtoolbox/container states |
| `src/components/subtoolbox/tokens.ts` | geometry/type/spacing/motion authority |
| `src/components/subtoolbox/SubToolboxPrimitives.tsx` | reusable controls/surfaces/states |
| `src/components/subtoolbox/SubToolboxSplitPrimitives.tsx` | split-left button/dropdown and KPI anatomy |
| `src/styles/subtoolbox-split-primitives.css` | split-left/KPI visual implementation |
| `src/components/subtoolbox/SubToolboxLayouts.tsx` | reusable composition recipes |
| `src/components/subtoolbox/registry.ts` | recipe/migration mapping |
| `src/components/ToolboxUIReferenceLibrary.tsx` | visual certification surface |
| `src/styles/toolboxPalette.ts` | production palette authority |
| `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` | governance/rules/audits/status authority |

Legacy/quarantine files are reference-only and must not become a second authority.

## 16. Coded primitives <-> Reference Library certification

Required chain: `TOKENS -> CODED PRIMITIVE -> UI REFERENCE LIBRARY EXAMPLE -> PRODUCTION CONSUMER`.

Use status vocabulary: `CANONICAL`, `IMPLEMENTED`, `VERIFIED`, `MIGRATE`, `LEGACY COMPATIBILITY`, `EXCEPTION`, `PLANNED`, `SUPERSEDED`, `REMOVE`, `REGRESSION / OPEN ISSUE`.

## 17. Certification ledger

| Primitive/family | Code | Reference Library | Tests | Current status |
| --- | --- | --- | --- | --- |
| Toolbox/Subtoolbox shells | yes | yes | visual required | 80/56 authority implemented on `fix/toolbox-geometry-authority-2026-09-22`; visual certification required before VERIFIED |
| Standard buttons | yes | yes | required | IMPLEMENTED |
| Split-left actions | yes | yes | partial | IMPLEMENTED |
| Analytics split-left dropdown | yes | yes | static-render yes | IMPLEMENTED / TEST-CERTIFIED; visual certification open |
| Inputs/Textareas | yes | yes | required | IMPLEMENTED |
| Checkbox/Radio/Switch/Toggle | yes/partial | expanding | required | IMPLEMENTED / MIGRATE |
| Tags/Badges | yes | yes | required | IMPLEMENTED |
| Tight Reveal upload | yes | yes | required | IMPLEMENTED |
| Guide Subtoolbox | not fully canonical | designed | required | PLANNED / MIGRATE |
| Projects T0 tool composition | yes | update required | required | IMPLEMENTED / REFERENCE UPDATE REQUIRED |

## 18. Current audit findings

**Resolved/advanced:** Analytics split-left anatomy is in production code with static-render coverage; separate compact shell token authority is removed; current shell hierarchy is T0 80px/26px title, T1 56px/20px title, T2 48px/18px and T3 32px/12px.

**Remaining:** visual desktop/mobile certification of the 80/56 hierarchy; historical `heightMode="compact"` callers/labels cleanup; CSS ownership leaks; bounded-height/mobile regressions; duplicate embedded shells; Projects feature-local shell debt; motion authority reconciliation by system.

## 19. Page-specific notes

### Studio Hub
Primary certification/migration target. Reference Library must show canonical primitives, levels and states.

### Analytics / Master Data Tables
PR #207 productionized the left-rail label/arrow + uninterrupted value region; PR #211 locks trigger semantics/anatomy. Feature-local table/toolbar CSS must not become Toolbox authority.

### Video Manager
Disconnected state must preserve the full UI. Connection gates data/actions, not the normal tool interface.

### Comment Responder
Persistent shell + explicit disconnected/data states. Do not conflate no comments with no connection.

### Video Publisher
Normalize geometry only while preserving publishing behavior.

### Thumbnail Studio
Primary acceptance-test candidate for nested modules, inputs, actions, uploads and collapsed sections.

### Projects
Project Board, Publishing Schedule, Project Studio and Storyboard Studio remain independent T0 Toolboxes. The PR #164 page-level switcher composition is SUPERSEDED. Duplicate inner shell geometry remains MIGRATE / OPEN ISSUE. Preserve Kanban/calendar behavior while removing duplicate chrome. Projects Reference Library certification remains required.

### Creator Vault / Asset Engine
Use canonical shells, upload, tags and bounded grids.

### Editor
Editor timeline controls are a separate system. Reuse tokens selectively; do not force Toolbox hierarchy onto timeline-specific controls.

## 20. Production migration order

1. certify current 56/44 shell hierarchy on desktop/mobile/open/closed
2. migrate/rename historical compact-shell callers and Reference Library labels without changing geometry
3. complete/certify Reference Library
4. reconcile motion authority independently by system
5. complete loose binary control families
6. Thumbnail Studio acceptance migration
7. Studio Hub tools one Toolbox at a time
8. Video Manager disconnected-preview normalization
9. Comment Responder + Video Publisher state separation
10. Analytics cross-reference without CSS leakage
11. Projects duplicate-shell cleanup without feature loss
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
- [ ] Master Resource updated
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
- [ ] motion uses actual authority for that system
- [ ] mobile structural module becomes full width
- [ ] content remains bounded
- [ ] disconnected/loading/empty/error preserve shell
- [ ] keyboard/focus/ARIA verified
- [ ] canonical primitive used instead of one-off CSS
- [ ] widget/editor CSS cannot leak into Toolbox system
- [ ] exactly one visible T0 shell/title per tool
- [ ] no consumer receives alternate shell geometry from a historical compact label

## 23. Adjustment / decision log

| Date | Decision | Status |
| --- | --- | --- |
| 2026-09-13 | Established living Toolbox UI master authority | CURRENT |
| 2026-09-13 | Structural level owns geometry | DEFINED |
| 2026-09-13 | Added loose binary controls | IMPLEMENTING |
| 2026-09-13 | Tight Reveal canonical upload | IMPLEMENTED |
| 2026-09-13 | 600ms shell/module open-close documented as direction | PROMOTED TO CURRENT AUTHORITY 2026-09-22 |
| 2026-09-14 | Production Subtoolbox tokens verified at 300ms collapse and 180ms control | SUPERSEDED BY 2026-09-22 MOTION RECONCILIATION |
| 2026-09-14 | Analytics split-left anatomy merged PR #207; regression assertions merged PR #211 | IMPLEMENTED / TEST-CERTIFIED |
| 2026-09-14 | Main Toolbox header 56px/28px; Subtoolbox 44px/22px | SUPERSEDED / HISTORICAL PR #215 |
| 2026-09-22 | Main Toolbox 80px/26px; Subtoolbox 56px/20px; L1 48px/18px; L2 32px/12px | CURRENT AUTHORITY / VISUAL CERTIFICATION REQUIRED |
| 2026-09-22 | Mobile-only shell density: Main Toolbox 56px / 14px radius / 6px shadow; SubToolbox 44px / 10px radius / 4px shadow; 26px/20px title sizes unchanged | CURRENT MOBILE AUTHORITY / VISUAL CERTIFICATION REQUIRED |
| 2026-09-14 | Separate Compact Subtoolbox shell geometry eliminated | SUPERSEDED / PR #215 |
| 2026-09-14 | T1 paired-height equation 20 + 4 + 20 = 44 | SUPERSEDED / HISTORICAL |
| 2026-09-22 | T1 paired-height equation becomes 26 + 4 + 26 = 56 | CURRENT |
| 2026-09-14 | Projects page-level switcher is not accepted composition | SUPERSEDED |
| 2026-09-14 | Project Board duplicate inner shell is migration debt | MIGRATE |
| 2026-09-14 | `studio-ui/tokens.ts` still read the `compactShell` geometry removed by PR #215, so `STUDIO_TOKENS` threw on load and every Studio Hub render failed; compact aliases now resolve to the single canonical shell | REGRESSION FIXED |
| 2026-09-14 | Header divider spans the full header width, icon rail included | CURRENT |
| 2026-09-14 | Phone-only 36px/30px shell geometry | SUPERSEDED / HISTORICAL |
| 2026-09-22 | Mobile density revised from screenshot certification: T0 56px and T1 44px; square rail follows row height; 26px/20px titles remain and may wrap to two lines | CURRENT / VISUAL CERTIFICATION REQUIRED |
| 2026-09-14 | Toolbox/SubToolbox title columns carry `min-w-0`; flex `min-width:auto` was overflowing the phone viewport | REGRESSION FIXED |
| 2026-09-14 | Landscape edge-rail navigation keys off the shell's own 760px mobile breakpoint, not a separate `max-height: 560px` test | REGRESSION FIXED |
| 2026-09-14 | Diagnostic overlay is opt-in from Navigation → Diagnostics; DIAG and Brain launchers do not render on phones | CURRENT |
| 2026-09-22 | Reference Library consumes production shell geometry directly; desktop/mobile visual capture remains outstanding | VISUAL CERTIFICATION REQUIRED |

## 24. Document editing protocol

This file is authority, not a scratchpad. Stable rules belong in numbered sections; page exceptions stay local; every production rule change gets a dated decision entry; every system-level conversation adds one concise Living update log row; prototype-only work remains non-production; retain superseded history; inspect code when docs disagree; update code/registry/Reference Library/tests/master together for new primitives; search consumers before deletion.

## 25. Definition of done

A Toolbox UI migration is complete only when hierarchy, geometry, color inheritance, state behavior, accessibility, motion, mobile composition and business functionality are verified; the Reference Library uses the same canonical primitive; regression checks pass; no competing geometry authority is introduced; and this document's ledger/log/page notes are updated.

## 26. Conversation implementation evidence — 2026-09-14

| Finding | Classification | Evidence / status |
| --- | --- | --- |
| Analytics split-left requested anatomy | IMPLEMENTED | PR #207 -> `844a708f` |
| Split-left trigger/listbox regression coverage | TEST-CERTIFIED | PR #211 -> `400269c5` |
| T0 56px / 28px title | IMPLEMENTED | PR #215 -> `b2e4a534` |
| T1 44px / 22px title | IMPLEMENTED | PR #215 -> `b2e4a534`; one shell authority in `tokens.ts` |
| Separate compact shell geometry | SUPERSEDED | PR #215 removes `compactShell` token authority |
| T1 paired controls | CANONICAL | `20 + 4 + 20 = 44` |
| Visual certification of 56/44 hierarchy | REGRESSION / OPEN ISSUE | Merge state is not visual verification |
| Historical compact callers/labels | LEGACY COMPATIBILITY / MIGRATE | Search/rename after consumer verification |
| Motion 180/300 vs historical 600 direction | REGRESSION / OPEN ISSUE | Audit systems independently |
| Projects duplicate inner shell | MIGRATE / OPEN ISSUE | Preserve behavior; remove presentation shell only |

### Repository snapshot

- Repository: `themotionvisual/ViewTubeBUILD`
- Main inspected during handoff: `b48bb588440efc6f29e19b25659407f86e7fe303` (merge PR #222)
- PR #207 merged split-left geometry reconciliation
- PR #211 merged split-left anatomy regression certification
- PR #215 merged 56/44 shell unification and compact-shell authority removal
- PR #222 merged Master Data mobile UI unification; feature-local table/toolbar CSS does not become Toolbox authority

## 27. Conversation handoff / master-resource update protocol

### 27.1 Audit
Review relevant code edits, commits, branches, PRs, merge state, screenshots, regressions, fixes, primitive/token/CSS/layout/mobile changes, states, API/connection UI behavior, accessibility, Reference Library work, tests, legacy code and lessons. Ignore unrelated ViewTube work unless it materially affects this system.

### 27.2 Classify
Use: CANONICAL, IMPLEMENTED, VERIFIED, MIGRATE, LEGACY COMPATIBILITY, EXCEPTION, PLANNED, SUPERSEDED, REMOVE, REGRESSION / OPEN ISSUE. Never promote a prototype, screenshot, temporary patch or feature-local rule to CANONICAL without explicit system acceptance.

### 27.3 Evidence
Record repository, branch, PR, commit, merged-to-main YES/NO/UNKNOWN, files, components, primitives, selectors, tokens, recipes, tests, previous/new behavior, affected pages, desktop/mobile/open/closed/connection/data-state verification and regression risk when available.

### 27.4 Authority checks
T0=80/5/16/10/26. T1=56/4/12/6/20. Former Compact shell=SUPERSEDED. T2=48/3/8/4/18. T3=32/2/6/2/12. Level owns geometry; component owns anatomy. Base rhythm 4px. Paired heights T1 26+4+26=56, T2 22+4+22=48, T3 14+4+14=32. Split rail width=row height. Preserve canonical shell geometry on mobile; collapse layout before shrinking registered controls.

### 27.5 Code <-> Reference Library
`TOKENS -> CODED PRIMITIVE -> UI REFERENCE LIBRARY EXAMPLE -> PRODUCTION CONSUMER`.

Code changed without library -> REFERENCE LIBRARY UPDATE REQUIRED. Library outruns production -> REFERENCE ONLY / NOT YET PRODUCTIONIZED. Code/library/states/variants/tests align -> CERTIFIED.

### 27.6 Registry / decisions / page status
For changed components record canonical name, family, levels, source, Reference Library section, states, palette/mobile/accessibility behavior, consumers, status, replacement, last verification and notes. Add dated decisions. Update affected pages with CURRENT STATE, WHAT CHANGED, WHAT REMAINS, NEXT SAFE MIGRATION, KNOWN REGRESSIONS and CERTIFICATION STATUS.

### 27.7 Motion
Verify Toolbox, Subtoolbox, module and disclosure shells at the 600ms open-close authority while keeping micro-interactions in the 150–300ms range. Dropdown-specific menu motion may remain faster where it is a micro-interaction rather than a shell disclosure. Reduced-motion behavior must remain intact.

### 27.8 Required output
A. IMPORTANT INFORMATION FOUND  
B. MASTER DOCUMENT CHANGES  
C. CODE <-> DOCUMENT ALIGNMENT  
D. UI LIBRARY ALIGNMENT  
E. UNFINISHED WORK  
F. REPOSITORY STATUS  
G. HANDOFF BLOCK

### 27.9 Preservation / GitHub rules
Inspect current main before claims/writes; do not overwrite newer work; preserve history and mark superseded rules; do not confuse PR state with main, prototypes with production or docs with migration completion; do not duplicate canonical primitives; do not silently reconcile conflicting motion/geometry; preserve working behavior; keep Widget/Editor CSS separate from Toolbox CSS; edit the living DOCX rather than replacing it with a smaller file; commit DOCX only through a binary-safe verified path.

## Related resources

- `docs/architecture/STUDIO_HUB_COMPONENT_STANDARDIZATION_V1.md`
- `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md`
- `docs/architecture/STUDIO_HUB_MIGRATION_MATRIX_V1.md`
- `docs/architecture/MOBILE_WIDGET_PHASE2_CLASSIFICATION.md`
- `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md`
- `docs/MOBILE_VISUAL_QA_MATRIX.md`

**Rule:** if a supporting resource conflicts with this file, verify production code/current accepted direction, reconcile deliberately, and record the result here.


## 24. 2026-09-25 mobile correction wave

This wave comes directly from Render/iPhone visual review and overrides any earlier wording that treated the current mobile Toolbox system as visually certified.

### 24.1 Keep the useful PR #432 fixes; restore the correct collapse symbol
Keep the isolated header action/help/collapse layout, 16px minimum mobile editable text, VisualViewport keyboard handling, and the structural-gutter versus paint-safe-edge-clearance distinction. Revert only the chevron substitution: Toolbox and SubToolbox headers must use the established animated four-direction arrow expand/collapse symbol, with the repaired independent hitbox and 600ms shell motion. Do not add a second down-arrow button.

### 24.2 Painted interior clearance
Top spacing is certified by visible painted clearance, not raw padding numbers. The first control under a Toolbox, SubToolbox, or MiniSubToolbox header must have visually equal top/side/bottom clearance after accounting for child strokes, hard shadows and focus outlines. The Video Manager Thumbnail MiniSubToolbox is the primary acceptance case; Upload/Generate must not crowd the top or right header edges.

### 24.3 P1 custom-dropdown state regression
Observed behavior: choosing a new custom-dropdown option closes the menu but leaves the old visible value. Treat all custom Toolbox dropdown families as unverified until interaction-tested. Every controlled dropdown must derive its trigger from the current controlled value, dispatch the selection exactly once, reflect the parent state immediately, and close after dispatch. Audit `SubToolboxDropdownControl`, `SubToolboxTopTitleDropdown`, split-left dropdowns, StudioDropdown, video selectors and any legacy custom select still in production. Add interaction tests, not only static source tests.

### 24.4 Vault asset-module redesign
`SubToolboxVaultAsset` is not complete. The shared landscape/portrait/image/video/audio/document anatomy must support an inline editable title using the canonical input focus style; a much larger canonical selection checkbox/X control; an adaptive preview viewport that contains 16:9, 9:16, 1:1 and intermediate source ratios without changing the outer card dimensions; canonical notes input/textarea; and canonical tag editing instead of placeholder text. Audio/document variants keep the same card grammar and swap only the preview renderer.

### 24.5 Spectrum Tag L3 + Tag Editor #30 compound
Add a denser L3 Spectrum Tag for asset-card metadata. It remains on the 12-color spectrum and combines with Tag Editor #30 behavior: add new tags, integrated X removal, immediate asset update, and no Vault-local duplicate styling. The Component Library must show L0/L1/L2/L3 plus the removable/editable compound.

### 24.6 New SubToolbox-level split-left action
Create a canonical full-row split-left action whose collapsed appearance matches a collapsed SubToolbox: square icon rail, exact level stroke/radius/shadow, centered icon, inherited palette pair and full-row button semantics. Migrate the Video Manager "CONNECT YOUR YOUTUBE CHANNEL TO LOAD VIDEOS" action to this component and add it to the Component Library.

### 24.7 New Thumbnail MiniSubToolbox compound
Promote the Thumbnail header + Upload/Generate + preview composition into a reusable compound. Header actions must remain paint-safe and collision-free; media preview uses aspect-aware contain/fitted behavior; narrow layouts compact intentionally rather than overflow. Add the compound to the Component Library.

### 24.8 Sequential 12-color allocation law
The palette is an ordered allocation system, not just a color source. Top-level Toolboxes advance through the 12 colors in order. Inside each Toolbox, the first SubToolbox uses the next sequential palette pair, and siblings/nested children continue the sequence instead of restarting or choosing feature-local decorative colors. Prefer a centralized allocator over scattered numeric `paletteIndex` literals. Add wraparound and sample-tree tests.

### 24.9 Component Library additions required by this wave
Add and certify: restored four-arrow collapse control; interactive dropdown selection proof; SubToolbox-level split-left action; Thumbnail MiniSubToolbox; Spectrum Tag L3; L3 + Tag Editor #30 compound; Vault editable title; large Vault selection checkbox; Vault notes field; Vault tag editor; landscape/portrait/intermediate-ratio media states; and a deterministic palette-sequence specimen.

### 24.10 Implementation order before final documentation/skill certification
1. restore four-arrow collapse control while preserving PR #432 header isolation;
2. fix painted top/interior clearance for Toolbox, SubToolbox and MiniSubToolbox;
3. fix controlled custom-dropdown behavior and add interaction tests;
4. formalize palette allocation and migrate Studio Hub/Vault/Video Manager ordering;
5. build the SubToolbox split-left action and migrate the YouTube-connect row;
6. build the Thumbnail MiniSubToolbox compound and migrate Video Manager;
7. redesign Vault asset cards for editable/adaptive production behavior;
8. add L3 Spectrum Tags + Tag Editor #30;
9. add all changed/new states to the Component Library;
10. certify portrait/landscape mobile plus desktop/narrow layouts before marking this wave VERIFIED.
