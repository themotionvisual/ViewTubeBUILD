# ViewTube Toolbox UI + CSS — Master Handoff & Continuation Map

**Status:** MASTER HANDOFF / CURRENT CONTINUATION MAP  
**Created:** 2026-09-27  
**Last edited:** 2026-09-27  
**Repository:** `themotionvisual/ViewTubeBUILD`  
**Audited current main:** `d8381cd4b956cc99367cd11776b5cd5f131d5704`  
**Canonical master:** `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`  
**Component-library authority:** `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md`  
**Builder skill:** `skills/viewtube-toolbox-builder/SKILL.md` and mirrored `.claude/skills/viewtube-toolbox-builder/SKILL.md`  
**Primary code authority:** `src/components/Toolbox.tsx` + `src/components/subtoolbox/*`  
**Primary CSS authority:** `src/styles/toolbox-system.css` + `src/styles/subtoolbox-system.css`  
**Palette authority:** `src/styles/toolboxPalette.ts`  
**Token authority:** `src/components/subtoolbox/tokens.ts`

---

## 0. Why this document exists

This is the complete handoff for the ViewTube Toolbox / SubToolbox / Mini SubToolbox UI system and its CSS architecture.

It is intended to let the next agent continue UI work without rediscovering:

- the shell hierarchy;
- the exact desktop/mobile geometry;
- CSS ownership boundaries;
- the component-level size ladder;
- palette inheritance;
- header allocation rules;
- spacing and painted-edge rules;
- responsive behavior;
- field/dropdown/portal behavior;
- keyboard/mobile-input behavior;
- layout primitives;
- Studio Hub Component Library certification;
- testing/governance;
- recent regression history;
- current known risks;
- visual-certification requirements;
- migration rules;
- files that are authoritative vs historical.

This handoff is **not a replacement** for the canonical master resource. It is a continuation map. When conflicts exist, use the authority order below.

---

# 1. Authority order

Use this order when documentation, prototypes, screenshots, old branches, and current code disagree:

1. **Current `main` production code and tests**
2. `src/components/subtoolbox/tokens.ts`
3. `src/components/Toolbox.tsx`
4. `src/styles/toolbox-system.css`
5. `src/styles/subtoolbox-system.css`
6. `src/styles/toolboxPalette.ts`
7. `src/components/subtoolbox/SubToolboxPrimitives.tsx`
8. `src/components/subtoolbox/SubToolboxSplitPrimitives.tsx`
9. `src/components/subtoolbox/SubToolboxLayouts.tsx`
10. `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
11. `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md`
12. this handoff
13. historical migration docs, standalone HTML files, old screenshots, quarantine files.

### Core rule

**There must be one production authority for each geometry concern.**

Do not fix a visual bug by adding another competing selector at the bottom of a page stylesheet. If a shared Toolbox rule is wrong, fix its canonical owner.

---

# 2. Current system state

The Toolbox system is mature enough to be the application-wide shell and primitive system, but its recent mobile history shows why strict ownership is necessary.

The latest important responsive work is already merged:

| PR | Purpose | Status |
| --- | --- | --- |
| #432 | mobile input safety, header action isolation, VisualViewport handling, paint-safe spacing | merged |
| #468 | protected mobile title allocation, secondary header action strip, intrinsic mobile SubToolbox height, responsive upload height | merged |
| #470 | cross-app responsive governance against fixed-width header actions and mobile `h-full` stretching | merged |
| #471 | consolidated responsive CSS ownership and removed duplicate mobile geometry rules | **merged** |
| #474 | SEO Generator migration to canonical Toolbox primitives | merged |

PR #471 is the important CSS consolidation point. It removed a large amount of duplicate/competing responsive CSS and established:

- one 56px mobile main Toolbox shell geometry;
- one 44px mobile SubToolbox shell geometry;
- one shell-gutter authority;
- `toolbox-system.css` as structural-responsive owner;
- `subtoolbox-system.css` as control-anatomy owner;
- 44px minimum mobile help/collapse hit targets;
- governance tests against duplicate ownership returning.

### Current visual status

Code-level responsive consolidation is ahead of visual certification.

The prior mobile audit baseline was:

| Dimension | Baseline |
| --- | ---: |
| Accessibility | 2/4 |
| Performance | 3/4 |
| Responsive | 1/4 |
| Theming | 3/4 |
| Implementation integrity | 2/4 |
| **Total** | **11/20** |

The implementation fixes are substantially in place, but **do not call the responsive system VERIFIED until the current main is visually certified at the required viewport matrix**.

---

# 3. Product definition

The Toolbox system is ViewTube's application-wide neo-brutalist UI container and primitive language.

It has four responsibilities:

1. **Structure** — Toolbox / SubToolbox / nested structural levels.
2. **Identity** — 12-color paired palette inheritance.
3. **Interaction** — controls, states, collapse, dropdowns, focus, upload, selection.
4. **Composition** — reusable stacks, grids, action rows and compound modules.

The system must remain recognizable across Studio, Projects, Vault, Analytics, Editor-adjacent surfaces, settings and future tools without forcing every feature into the same composition.

---

# 4. Governing laws

1. **Hierarchy = geometry.**
2. **Level owns shell geometry.**
3. **Component owns anatomy, not shell geometry.**
4. **Color identifies family/ownership.**
5. **Fill communicates state.**
6. **4px is the base spacing rhythm.**
7. **Disconnected data never means missing interface.**
8. **Studio Hub Component Library is a certification surface, not a second style system.**
9. **Page-local CSS cannot redefine canonical Toolbox geometry.**
10. **Business behavior must survive visual migration.**
11. **Mobile titles do not shrink merely to save a bad layout.**
12. **Optional actions yield before protected title/help/collapse content.**
13. **Phone SubToolboxes are intrinsic-height by default.**
14. **Desktop equal-height layout must be breakpoint-scoped.**
15. **Every detached portal must explicitly bridge its inherited palette pair.**

---

# 5. Canonical hierarchy

## 5.1 Structural shell ladder

| Level | Meaning | Height | Stroke | Radius | Shadow | Title |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| T0 | Main Toolbox | 80px | 5px | 16px | 10px | 26px / 1000 |
| T1 | SubToolbox | 56px | 4px | 12px | 6px | 20px / 1000 |
| T2 | interior structural level | 48px | 3px | 8px | 4px | 18px / 1000 |
| T3 | dense structural level | 32px | 2px | 6px | 2px | 12px / 1000 |

### Mobile shell override

| Surface | Desktop | Mobile |
| --- | --- | --- |
| Main Toolbox | 80px header | **56px header** |
| SubToolbox | 56px header | **44px header** |

Mobile does **not** reintroduce a second historical compact-shell system. It is an explicit responsive shell override.

### Deprecated concept

The old separate "Compact SubToolbox shell" geometry is superseded.

`heightMode="compact"` may remain as compatibility/content-density vocabulary, but it must not create a competing shell height/stroke/radius/shadow ladder.

---

# 6. Component/control size ladder

Structural levels and control sizes are separate concepts.

| Control level | Height | Stroke | Radius | Shadow | Typical font |
| --- | ---: | ---: | ---: | ---: | ---: |
| L0 | 56px | 4px | 12px | ~6px | ~24px |
| L1 | 48px | 3px | 8px | ~5px | ~18px |
| L2 | 32px | 2px | 6px | ~4px | ~12px |

Additional aliases may expose:

- micro ~26px;
- compact ~32px;
- standard ~48px;
- action ~56px.

**Never infer shell geometry from a control size.**

---

# 7. Canonical file map

## Shell and orchestration

| File | Owns |
| --- | --- |
| `src/components/Toolbox.tsx` | Toolbox, SubToolbox, Mini SubToolbox structural behavior; collapse; palette-cycle context; header slots |
| `src/styles/toolbox-system.css` | shell geometry, header allocation, responsive shell rules, content gutters, Mini SubToolbox shell CSS |
| `src/styles/subtoolbox-system.css` | primitive anatomy, fields, dropdowns, header-control anatomy, states, mobile control hit targets |
| `src/styles/toolbox-entry.css` | shared CSS entry point/import composition |

## Tokens, palette, registry

| File | Owns |
| --- | --- |
| `src/components/subtoolbox/tokens.ts` | shell/control DNA, spacing, transition tokens, registered geometry |
| `src/styles/toolboxPalette.ts` | 12-color palette and title/icon pairing |
| `src/components/subtoolbox/registry.ts` | primitive recipe/migration mapping |

## Primitives

| File | Owns |
| --- | --- |
| `SubToolboxPrimitives.tsx` | buttons, fields, selectors, states, tags, uploads, cards, scrollbars, media-adjacent controls |
| `SubToolboxSplitPrimitives.tsx` | split-left button, shell action, split dropdown, KPI card |
| `SubToolboxLayouts.tsx` | Stack, Grid, Actions, Section |
| `SubToolboxMediaPrimitives.tsx` | canonical media-oriented compounds |
| `SubToolboxWorkflowPrimitives.tsx` | workflow-oriented compounds |

## Certification

| File | Owns |
| --- | --- |
| `src/components/ToolboxUIReferenceLibrary.tsx` | Studio Hub visual certification entry surface |
| `src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx` | production-import primitive examples |
| `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md` | component-library presentation authority |
| `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_VISUAL_CHECKLIST.md` | visual QA checklist |

---

# 8. CSS ownership contract

This is the most important section for avoiding regressions.

## 8.1 `toolbox-system.css` owns

- Main Toolbox shell dimensions.
- SubToolbox shell dimensions.
- mobile 56/44 structural shell geometry.
- shell radius/stroke/shadow.
- header row structural allocation.
- protected title slots.
- header-action layout.
- secondary header action strip.
- title wrapping policy.
- content insets/gutters.
- Mini SubToolbox shell geometry.
- structural mobile intrinsic-height behavior.
- split-left structural mobile sizing where shell-level geometry is involved.

## 8.2 `subtoolbox-system.css` owns

- help/collapse/palette button anatomy;
- 44px mobile hit targets;
- field states;
- textarea states;
- checkbox/radio/switch/toggle anatomy;
- dropdown/menu styling;
- portalized menu visual state;
- tags/badges;
- upload-target anatomy;
- focus-visible behavior;
- primitive-specific responsive anatomy.

## 8.3 `perf.css` must not own

- Toolbox header height;
- Toolbox title size;
- title wrapping/ellipsis;
- icon rail width;
- help/collapse geometry;
- SubToolbox header height;
- canonical shell padding.

Performance CSS may optimize rendering but must not redefine design geometry.

## 8.4 Feature/page CSS must not own

- canonical header height;
- title size;
- icon rail width;
- shell radius/stroke;
- header action fixed widths;
- mobile shell height;
- mobile title ellipsis;
- mobile `h-full` stretching of ordinary stacked SubToolboxes.

### Forbidden examples

- `w-[210px]` inside `headerActions`;
- page-local `h-full` on a SubToolbox in a mobile stack;
- page-local `overflow-wrap:anywhere` on Toolbox titles;
- page-local hard-coded title/icon colors when normal palette inheritance should apply;
- global selectors like `[data-vt-toolbox] button` that accidentally restyle all primitives.

---

# 9. Header architecture

## 9.1 Main Toolbox header

Conceptually:

`[ ICON RAIL ][ PROTECTED TITLE SLOT ][ OPTIONAL EXTRAS ][ HELP ][ COLLAPSE ]`

The icon rail, complete title, help target and collapse target are protected.

Optional actions are not protected. They may move.

## 9.2 Mobile allocation law

On phone widths:

1. Main title remains 26px.
2. Title may wrap to two complete tight lines.
3. Do not ellipsize or break words arbitrarily.
4. Help/collapse remain available.
5. Optional extras disappear from the primary row when space is insufficient.
6. The same actions render in `.vt-toolbox-header-secondary-actions`.
7. Secondary strip controls use a minimum 44px interaction height.

Current protected title width includes:

`--vt-toolbox-title-protected-width: clamp(148px, 42vw, 168px)`

## 9.3 SubToolbox header

SubToolbox title remains 20px and the mobile shell becomes 44px high.

The title may use two tight lines where needed, but should never be reduced merely because sibling actions are oversized.

## 9.4 Help and collapse controls

Interactive mobile target: **minimum 44 × 44px**.

The icon/glyph itself may be visually smaller.

Do not confuse visual glyph size with touch-target size.

---

# 10. Collapse and motion

Canonical shell collapse transition:

- **600ms ease-out**
- reduced-motion support required.

Micro interactions remain faster:

- ~150–300ms;
- canonical micro token around 180ms.

Do not change the shell collapse timing because an individual button animation uses a faster duration.

---

# 11. Content spacing and painted-edge clearance

Canonical shell gutter authority currently uses:

- desktop shell gutter: ~6px;
- mobile shell gutter: ~5px;
- painted header-edge clearance larger than sibling gap because thick borders/shadows visually consume space.

The important rule is perceptual:

> The first child below a header must look as far from the painted header edge as side/bottom children look from their painted shell edges.

This is why the top content clearance is intentionally larger than the nominal sibling gap.

### Do not

- set content padding to zero globally;
- let first controls visually collide with a 4–5px shell stroke;
- add feature-specific compensating margins for a canonical spacing bug.

---

# 12. Palette system

Canonical 12-color palette:

1. `#FA618A`
2. `#FF7F6B`
3. `#FFA85C`
4. `#FFDA47`
5. `#C0F240`
6. `#3FEE56`
7. `#4EE4BE`
8. `#36E0F6`
9. `#528FFA`
10. `#A467F4`
11. `#F55EFC`
12. `#FF7AC8`

## Pairing rule

`getToolboxPaletteColors(index)` resolves:

- header/title region = palette index;
- icon rail = palette index + 4, wrapped through the same 12 colors.

The owning SubToolbox exposes:

- `--pair-a` = title/header color;
- `--pair-b` = icon/rail color.

Nested primitives consume the pair.

## Sequential allocation law

Where a Toolbox/Studio surface uses automatic palette allocation:

- owning Toolbox receives its palette pair;
- the first direct SubToolbox receives the next available pair;
- later siblings continue sequentially;
- nested SubToolboxes continue the sequence rather than restarting;
- explicit `paletteIndex` is an intentional override, not the default solution.

## Do not expose normal recoloring props

Avoid ordinary component props such as:

- `railColor`;
- `labelColor`;
- `accentColor`;
- `surfaceColor`;
- `controlColor`;
- `toneColor`;

unless the color encodes semantic meaning rather than decorative identity.

---

# 13. Typography

Current structural title authority:

- Main Toolbox: **26px / 1000**
- SubToolbox: **20px / 1000**
- T2 structural title: **18px / 1000**
- T3 dense title: **12px / 1000**

Established control typography remains level-specific.

### Mobile rule

Do **not** automatically shrink module titles.

Dense interior controls may reduce typography only where the primitive's responsive design explicitly permits it.

### iOS editable-control rule

On mobile/coarse-pointer contexts, editable fields must resolve to **16px effective font size** where required to prevent Safari focus zoom.

---

# 14. Icon system

Structural icon rails remain square.

Representative canonical shell/icon behavior:

- main mobile icon rail: 56 × 56;
- SubToolbox mobile icon rail: 44 × 44;
- desktop icon rail tracks shell height;
- icon glyph scales with structural level rather than using one global icon size.

Do not force all icons to identical line weight when the icon artwork itself needs optical correction.

---

# 15. Primitive families

Current system includes or is intended to include:

- standard buttons;
- icon buttons;
- split-left buttons;
- SubToolbox shell actions;
- Head/Tail actions;
- split dropdowns;
- standard dropdowns;
- top-title dropdowns;
- inputs;
- search;
- number/stepper controls;
- textarea;
- checkbox;
- radio;
- switch;
- toggle;
- segmented control;
- slider;
- badge/tag;
- Spectrum tags;
- tag editor;
- progress;
- metric/stat surfaces;
- KPI cards;
- state panels;
- output/information cards;
- upload/file targets;
- Tight Reveal upload;
- aspect-ratio frames;
- media selector/player compounds;
- toolbar;
- tree;
- scrollbars;
- workflow/media compounds;
- Mini SubToolbox;
- Thumbnail Mini SubToolbox;
- Vault asset compounds where the Studio library demonstrates them.

Controls are loose by default. Do not create a card merely to hold a checkbox/radio/switch.

---

# 16. Split-left contract

Canonical split-left action:

`[ SQUARE RAIL ][ LABEL / VALUE REGION ]`

Rules:

- rail width = control row height;
- rail divider uses level stroke;
- right side remains one uninterrupted region;
- dropdown arrow stays inside the right region;
- no extra standalone right-chevron box;
- open state preserves the closed component's family identity;
- menu separation is small and intentional;
- open menu may not be clipped by shell overflow.

`SubToolboxShellAction` is the shell-like full-row action for actions that should resemble a collapsed SubToolbox.

---

# 17. Fields and editable controls

Canonical field states include:

- idle;
- hover;
- focus-visible;
- disabled;
- selected/on where applicable;
- error/success where semantically needed.

Focus state preserves the component's identity color.

The system uses inherited pair values rather than hard-coded feature color.

Textareas must use bounded heights with internal scroll rather than unbounded page growth.

---

# 18. Dropdown and portal contract

Detached dropdowns/popovers are a known failure point.

When a menu is portaled to `document.body`, ordinary CSS variable inheritance from the owning SubToolbox stops.

Therefore portal roots must explicitly receive:

- `--pair-a`;
- `--pair-b`.

### Selection behavior

Controlled dropdowns must:

1. call their owner callback with the selected value;
2. update visible selected state from the controlled value;
3. close only after selection is committed;
4. not let outside-pointer handling unmount the menu before the option click fires.

### Regression test

Every custom dropdown family should be tested with a realistic sequence:

- open;
- pointer/mousedown on option;
- click/select;
- callback fires;
- controlled value changes;
- displayed label changes;
- menu closes.

---

# 19. Mobile keyboard and editable-field contract

The app intentionally separates orientation-position preservation from software-keyboard behavior.

Current keyboard-safe behavior uses `VisualViewport` only while editing.

Requirements:

- compute keyboard occlusion;
- publish it through `--vt-keyboard-occlusion`;
- reveal the focused editable only if it leaves the visible viewport;
- avoid unnecessary page jumps when the field was already visible;
- restore/settle position after editing;
- use canonical scroll-margin rules.

Do not restore the old global VisualViewport orientation behavior that caused keyboard-induced jump regressions.

---

# 20. Upload/file target contract

Tight Reveal is the canonical upload style.

Rules:

- no legacy dashed drop-zone frame;
- no generic large black outer frame added by a page;
- preview/upload geometry is responsive;
- phone height is capped responsively rather than fixed at a desktop `minHeight={220}`;
- empty, hover, loading, success and error states must remain legible.

---

# 21. Layout primitives

Use these before inventing page-local layout CSS:

### `SubToolboxStack`
Vertical sequence with canonical density/gap.

### `SubToolboxGrid`
Responsive grid with registered minimum item width.

### `SubToolboxActions`
Action group with 1–4 columns.

### `SubToolboxSection`
Named interior grouping.

### Rule

Parent layouts own equal-height relationships.

Individual phone SubToolboxes do **not** force themselves to `h-full` merely to match a desktop sibling.

---

# 22. Mobile responsive contract

## Main shell

- full width by default;
- 56px header;
- protected 26px title;
- optional extras move to secondary strip;
- 44px help/collapse hit targets.

## SubToolbox shell

- 44px header;
- 20px title;
- intrinsic height by default;
- no ordinary mobile `h-full`.

## Grids

- collapse semantically;
- preserve component legibility;
- do not shrink registered controls below their level merely to maintain column count.

## Long content

- use bounded internal scrolling;
- headers themselves never become scroll regions.

## Landscape phone

Dense rows may stay horizontal when there is room, but title/hit-target rules remain.

---

# 23. Mini SubToolbox contract

Mini SubToolbox is a compound component with its own shell DNA.

It is not just a small SubToolbox created by shrinking T1 arbitrarily.

Current Mini concerns include:

- compact square icon rail;
- compact title;
- actions aligned inside header;
- content uses canonical shell-edge clearance;
- Thumbnail Mini SubToolbox uses a 16:9 preview and compact header actions.

When Mini header actions crowd the painted edges, fix Mini's canonical anatomy rather than feature-specific margins.

---

# 24. State system

Canonical state vocabulary includes:

- idle;
- hover;
- focus-visible;
- active;
- selected/on;
- disabled;
- loading;
- ready;
- empty;
- filtered-empty / filtered-zero;
- disconnected;
- connecting;
- reconnect-required;
- blocked;
- permission;
- stale;
- error;
- success.

### State law

A shell remains present for loading/empty/error/disconnected states.

`DISCONNECTED != EMPTY`  
`DISCONNECTED != ERROR`  
`DISCONNECTED != MISSING UI`

---

# 25. Accessibility contract

All canonical interactive primitives require:

- native semantics where practical;
- explicit ARIA when needed;
- logical tab order;
- visible focus;
- keyboard operability;
- labels for icon-only controls;
- selected state not communicated by color alone;
- disabled vs `aria-disabled` used intentionally;
- reduced-motion support;
- sufficient contrast;
- mobile touch targets of at least 44px where the control is a primary tap target.

---

# 26. Studio Hub Component Library contract

The Component Library is the **visual certification surface for production primitives**.

Required chain:

`TOKENS -> PRODUCTION PRIMITIVE -> COMPONENT LIBRARY EXAMPLE -> PRODUCTION CONSUMER`

A catalog mock does not certify a production primitive.

The production-import track should render the actual exported component.

### Component Library must demonstrate

- structural levels;
- L0/L1/L2 controls;
- open/closed states;
- hover/focus/selected/disabled;
- dropdown open state;
- mobile composition;
- portal color inheritance;
- upload states;
- Mini SubToolbox;
- split-left families;
- relevant compound modules;
- palette sequence.

---

# 27. Tests and governance

Important protection lives in:

- `src/components/SubToolboxDesignGovernance.test.ts`;
- `src/components/Toolbox.test.tsx`;
- primitive-specific tests;
- Studio Hub Component Library tests;
- feature-specific Toolbox governance tests.

Current governance explicitly checks that:

- feature header actions do not use fixed pixel width locks;
- Video Publisher no longer contains `w-[210px]`;
- mobile SubToolboxes do not use ordinary `shellClassName="h-full"`;
- desktop equal-height behavior is breakpoint-scoped;
- `perf.css` does not own main Toolbox header geometry;
- portalized dropdowns receive the pair variables;
- canonical shell geometry has one owner;
- header controls preserve mobile hit targets.

### Rule for future changes

A fix is incomplete until its regression test is added or an existing test is strengthened.

---

# 28. Visual certification matrix

Every system-level shell/CSS change should be inspected at:

- 1440px desktop;
- 1024px/narrow desktop or tablet landscape;
- 768px/tablet edge;
- 430px phone portrait;
- 390px phone portrait;
- 375px phone portrait;
- phone landscape.

At minimum verify:

- full title visibility;
- no mid-word clipping;
- no overlap;
- icon rail square;
- help/collapse reachable;
- no horizontal page overflow;
- content edge spacing;
- dropdown open state;
- focus state;
- upload height;
- SubToolbox intrinsic height;
- stacked modules;
- collapse animation;
- first/last child shell spacing.

---

# 29. Current visual-certification hotspot: Video Publisher

The recent iPhone screenshot exposed the main regression family.

Historical symptoms:

- `VIDEO PUBLISHER` clipped/broken;
- header extras competed with title;
- Video Upload and Video Script stretched vertically;
- large dead white space;
- inconsistent painted clearance.

Current code should now have:

- `ToolboxHeaderToggle`;
- no `w-[210px]` header action block;
- no unscoped mobile `shellClassName="h-full"`;
- no unscoped mobile `contentClassName="h-full"`;
- no fixed `minHeight={220}` upload target;
- canonical palette allocation;
- secondary phone action strip.

This surface remains the fastest visual smoke test for the current responsive contract.

---

# 30. Known current risks / open certification work

## P1 — visual certification still required

The current main must be visually checked after PR #471 consolidation.

## P1 — CSS archaeology can return

Do not add duplicate media-query geometry blocks.

## P1 — page-local overrides

New tools can still accidentally introduce:

- fixed width header action groups;
- `h-full` mobile stacks;
- arbitrary hard-coded palette overrides;
- legacy field wrappers.

Governance should continue expanding to high-risk consumers.

## P2 — Mini SubToolbox crowding

Mini headers need ongoing visual verification as new header actions are added.

## P2 — dropdown families

Every custom dropdown family must remain covered against pointer/outside-close regressions.

## P2 — Component Library parity

New primitives must be demonstrated using production exports, not catalog-only imitations.

---

# 31. Common anti-patterns and their replacements

| Do not | Use instead |
| --- | --- |
| fixed-width `headerActions` | canonical `ToolboxHeaderToggle` or responsive extras |
| page-level title font overrides | shell-owned title token |
| mobile `h-full` SubToolbox | intrinsic mobile height + breakpoint-scoped desktop equalization |
| arbitrary feature hex colors | `paletteIndex` / inherited pair |
| color props on ordinary primitives | owner SubToolbox palette pair |
| dashed upload area | Tight Reveal |
| custom checkbox/radio CSS per page | canonical primitive |
| custom open-menu portal colors | bridged `--pair-a` / `--pair-b` |
| `overflow-wrap:anywhere` titles | normal word wrapping + protected allocation |
| visual-only fix with no test | canonical fix + governance regression test |

---

# 32. How to build a new Toolbox correctly

1. Start with `ToolboxScaffold`.
2. Give it a semantic title and icon.
3. Prefer automatic/intentional palette sequencing.
4. Use `headerActions` only with canonical compact controls.
5. Build direct child groups with `SubToolbox`.
6. Use `SubToolboxStack`, `Grid`, `Actions`, and `Section`.
7. Use coded primitives from `SubToolboxPrimitives` / split/media/workflow families.
8. Do not create feature-local geometry CSS unless the visual is genuinely feature-specific.
9. Add the primitive/compound to the Studio Hub Component Library if it is reusable.
10. Add/extend tests.
11. Capture desktop/mobile screenshots.
12. Update the master resource living log for system-level changes.

---

# 33. Debugging playbook

## Title is clipped on mobile

Check in this order:

1. Is the title using the canonical title slot?
2. Is a feature action using fixed width?
3. Is an optional action still in the primary header row?
4. Did a page/global stylesheet restore nowrap/ellipsis?
5. Did `perf.css` accidentally gain header geometry ownership?

Do **not** solve by shrinking the title first.

## SubToolbox is too tall on phone

Check:

1. `shellClassName="h-full"`;
2. `contentClassName="h-full"`;
3. parent grid equal-height behavior;
4. generated `openUnits` minimum height;
5. child upload/media fixed minimum height.

## Dropdown closes but selection does not change

Check:

1. portal/outside-pointer listener;
2. whether mousedown unmounts menu before click;
3. controlled value callback;
4. displayed selected label derives from controlled value;
5. portal pair bridge.

## Colors look wrong

Check:

1. owning `paletteIndex`;
2. `--pair-a` / `--pair-b`;
3. portal bridge;
4. feature-local inline style;
5. stale hard-coded CSS.

## First component touches header

Check:

1. canonical painted-edge clearance;
2. whether content class replaced padding;
3. nested wrapper/inset;
4. thick control shadow extending into the apparent gap.

---

# 34. Documentation map

## Canonical

- `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md`

## Specialized reference

- `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md`
- `docs/architecture/STUDIO_HUB_COMPONENT_STANDARDIZATION_V1.md`
- `docs/architecture/STUDIO_HUB_MIGRATION_MATRIX_V1.md`
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_VISUAL_CHECKLIST.md`

## Historical/toolbox-system folder

- `docs/ui/toolbox-system/README.md`
- `docs/ui/toolbox-system/MANIFEST.md`

Those files contain useful provenance and standalone-library references, but they do not replace production code/current canonical master.

---

# 35. Standalone HTML/reference artifact policy

Standalone HTML libraries are valuable for:

- visual ideation;
- donor harvesting;
- side-by-side comparison;
- mobile screenshot review;
- prototyping new compounds.

They are **not production authority**.

Before importing a standalone design:

1. identify the current production primitive that it corresponds to;
2. preserve the useful visual/anatomy details;
3. bind it to production tokens and palette;
4. avoid copying obsolete CSS ownership;
5. add the real coded primitive to the Component Library;
6. verify mobile/desktop;
7. document intentional differences.

The same rule applies to current Vault asset-module standalone files and earlier complete Toolbox UI libraries.

---

# 36. Recent important decisions to preserve

- Desktop shell authority is **80 / 56**, not the old 56 / 44 desktop system.
- Mobile shell authority is **56 / 44**.
- Main title remains **26px** on mobile.
- SubToolbox title remains **20px** on mobile.
- Titles wrap instead of being ellipsized.
- Optional header actions move to a secondary strip on phone.
- Mobile help/collapse hit targets are >=44px.
- Phone SubToolboxes are intrinsic height.
- `perf.css` is not a geometry owner.
- `toolbox-system.css` owns structural responsive allocation.
- `subtoolbox-system.css` owns header-control anatomy.
- palette pairs are inherited.
- portalized menus explicitly bridge pair variables.
- collapse is 600ms ease-out.
- painted-edge clearance is larger than the ordinary sibling gap.
- Component Library examples must use production components.

---

# 37. Verification checklist before merging Toolbox UI changes

### Architecture
- [ ] Correct canonical file owns the change.
- [ ] No new duplicate authority.
- [ ] No historical token resurrected.

### Header
- [ ] Full title visible.
- [ ] No fixed-width action collision.
- [ ] Help and collapse accessible.
- [ ] Optional actions move correctly on phone.

### Content
- [ ] Top painted clearance matches side/bottom perception.
- [ ] No double padding.
- [ ] No mobile vertical stretching.
- [ ] Upload/media targets remain responsive.

### Controls
- [ ] Focus visible.
- [ ] Keyboard works.
- [ ] Pointer selection works.
- [ ] Mobile fields do not trigger Safari zoom.
- [ ] Dropdown displayed value updates.

### Color
- [ ] Correct pair inherited.
- [ ] No arbitrary normal recolor prop.
- [ ] Portal keeps pair.

### Responsive
- [ ] 375 / 390 / 430 portrait checked.
- [ ] phone landscape checked.
- [ ] tablet/narrow desktop checked.
- [ ] desktop checked.

### Tests
- [ ] focused tests green.
- [ ] governance tests green.
- [ ] production build green or unrelated baseline failure documented.

---

# 38. Handoff protocol for the next agent

Before changing the Toolbox system:

1. Read this handoff.
2. Read the canonical master resource.
3. Read current `tokens.ts`.
4. Read only the relevant sections of both canonical CSS files.
5. Inspect the production consumer that shows the bug.
6. Search for competing selectors before adding CSS.
7. Verify whether the problem is structural, primitive-specific, or feature-local.
8. Make the smallest canonical change.
9. Add/extend a regression test.
10. Capture screenshots.
11. Update the master resource living log if the change is system-level.

### Never do this

- append an emergency global override and stop;
- alter several ownership layers simultaneously without a source-of-truth decision;
- trust an old standalone HTML over current code;
- trust an old migration document's geometry values over current tokens;
- mark a visual change VERIFIED without screenshot evidence.

---

# 39. Recommended immediate continuation

1. Complete visual certification of current main after PR #471.
2. Re-audit Video Publisher at 375/390/430 portrait and phone landscape.
3. Re-audit one ordinary SubToolbox-heavy Studio surface.
4. Re-audit Studio Hub Component Library.
5. Confirm no title/action regressions.
6. Confirm intrinsic mobile heights.
7. Confirm Mini SubToolbox actions do not crowd edges.
8. Re-run the UI audit and update the baseline score.
9. Promote the responsive system from IMPLEMENTED to VERIFIED only after screenshots pass.
10. Keep future Toolbox fixes on the canonical ownership path described above.

---

# 40. Current definition of done

The Toolbox UI/CSS system is considered fully handed off and stable when a new agent can:

- locate the correct code/CSS owner without guesswork;
- build a new Toolbox entirely from canonical components;
- understand desktop vs mobile shell geometry;
- preserve the palette sequence;
- avoid mobile title/action collisions;
- avoid accidental phone height stretching;
- use the correct layout primitives;
- implement dropdowns/portals safely;
- verify keyboard/mobile editing behavior;
- certify the primitive in Studio Hub;
- run the correct tests;
- identify historical references without treating them as authority;
- update the living master resource rather than creating a parallel design system.

---

## Final handoff note

The core architecture is now stronger than the screenshots that originally exposed the mobile problems. The priority is no longer to invent another responsive CSS layer. The priority is to **certify, simplify, and protect the single canonical layer that now exists**.

When the next visual defect appears, assume first that it is either:

1. a consumer violating the canonical contract, or
2. a remaining canonical rule that needs correction at its owner.

Do not create a third explanation in page-local CSS until those two possibilities have been ruled out.
