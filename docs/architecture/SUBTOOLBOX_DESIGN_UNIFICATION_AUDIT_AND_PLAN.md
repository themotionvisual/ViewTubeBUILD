# Subtoolbox Design Unification — Audit & Implementation Plan

**Date:** 2026-09-12
**Branch:** `claude/subtoolbox-design-unification-erkw08`
**Scope:** Studio Hub (`/studio`) and Projects (`/projects`) — every Level‑1 section
inside every module mounted on those two pages.
**Governing skill:** `.claude/skills/viewtube-toolbox-builder/SKILL.md`

---

## 0. Summary

There is already exactly one canonical Level‑1 component — `SubToolbox` in
`src/components/Toolbox.tsx`, hardened by PR #121 (`fix/canonical-subtoolbox-shell`).
**The shell is not the problem. The call sites are.**

Seven visibly different section styles ship on these two pages. Six of them are
`SubToolbox` being fed inconsistent props or being denied a palette; one
(`AccordionContainer`) and two hand-rolled panel families bypass the component
entirely.

| # | Style as reported | Real cause | Component actually used |
|---|---|---|---|
| A | Video Manager / Video Publisher | baseline — `collapsible` but no `helpText` ⇒ no **?** button | `SubToolbox` |
| B | Content Analysis — no arrow, never collapses | `collapsible` prop **omitted** ⇒ no chevron, no **?**, always open | `SubToolbox` |
| C | Strategy Params / Poll Generator — main-toolbox chrome, instant collapse | `<Toolbox variant="sub">` — **`'sub'` is not implemented** and falls through to scaffold chrome; `unmountWhenClosed` defaults `true` ⇒ body vanishes instantly | `Toolbox` |
| D | Script Architect — has the **?** button | `collapsible` **and** `subtitle` ⇒ help rail renders | `SubToolbox` |
| E | Channel To‑Do / Channel Goals — white icon box | `AccordionContainer` with `iconBoxColor="bg-white"` — Level‑0 stroke/shadow at Level‑1 height | `AccordionContainer` |
| F | Priority Stack / Publishing Board — icon rail same colour as title | rendered inside a **nested `ToolboxScaffold` with no `paletteIndex`** ⇒ palette resolves `null` ⇒ `iconBg = headerHex` | `SubToolbox` |
| G | Blueprint / Visual Canvas / The Oracle — black header, no icon rail | hand-rolled `div` + `bg-black` strip + `shadow-[6px_6px_0px_0px_black]` | none |

Plus the container defect the brief calls out: **Project Planning's module shell is
hand-rolled** (`border-[6px]` + `shadow-[12px_12px_0px_0px_black]`), not a
`ToolboxScaffold` — hence the black drop shadow where every other module carries a
header-tinted one.

And one bug found during the audit that nothing on the page can work around:

> **Sub‑toolbox colours change every time you collapse and reopen the parent module.**

---

## 1. The canonical target — one Level‑1 style

Everything below is already implemented in `SubToolbox`
(`src/components/Toolbox.tsx:521-694`). This is the contract, not a proposal.

| Token | Level 0 `ToolboxScaffold` | **Level 1 `SubToolbox` (target)** |
|---|---|---|
| header height | 80px | **56px** (`CONTROL_SHELL.headerHeight`) |
| frame stroke | 5px black | **4px black** (`SUB_TOOLBOX_STROKE`) |
| corner radius | 16px | **12px** (`SUB_TOOLBOX_RADIUS`), header corners 8px |
| shell shadow | `10px 10px` header‑hex @ **45%** | **`6px 6px` header‑hex @ 50%** (`SUB_TOOLBOX_SHADOW`) |
| icon rail | 80×80, `palette.icon` | **56×56, `palette.icon`, 4px right border** |
| title band | `palette.header`, 24→50px | **`palette.header`, h3 32→40px, `font-[900]`, `tracking-tighter`** |
| collapse indicator | `AnimatedToggleIcon` 44px | **`AnimatedToggleIcon` 28px** |
| collapse timing | 800ms `cubic-bezier(.4,0,.2,1)` | **800ms `cubic-bezier(.4,0,.2,1)`** |
| body on close | unmounts (`unmountWhenClosed=true`) | **stays mounted** (`unmountOnClose=false`) |
| help affordance | `?` pill, 22px glyph | **`?` pill, 18px glyph — only when `helpText`/`subtitle` is supplied** |
| content surface | white, `p-8` | **white, `p-4`, exports `--vt-subtoolbox-fill` / `--vt-subtoolbox-shadow`** |

**The one rule that unifies all seven styles:**

> Every Level‑1 section on Studio Hub and Projects is a `SubToolbox` that receives
> `collapsible`, an explicit `isOpenInitial`, a `helpText`, and an explicit
> `paletteIndex`. No exceptions, no `variant="sub"`, no `AccordionContainer`,
> no hand-rolled panels.

Reference implementations to copy: `CommunityPostGenerator.tsx` (props),
`referenceStudio/MiniToolboxLab.tsx:313` (explicit palette wiring).

---

## 2. Audit — every Level‑1 section on the two pages

Machine-generated from the call sites on `claude/subtoolbox-design-unification-erkw08`.

### Studio Hub — `src/views/StudioHub.tsx`

| Palette | Module | File | Level‑1 sections | Component | `collapsible` | `helpText`/`subtitle` | explicit `paletteIndex` | Style |
|---|---|---|---|---|---|---|---|---|
| 0 | Video Manager | `src/views/VideoManager.tsx:1275,1359,1419,1427` | 4 | `SubToolbox` | ✅ | ❌ | ❌ | **A** |
| 1 | Video Publisher | `src/views/VideoPublisher.tsx:44` | 3 | `SubToolbox` | ✅ | ❌ | ❌ | **A** |
| 2 | Content Analysis | `src/views/MediaAnalyzer.tsx:354,375,427,467,507,529` | 6 | `SubToolbox` | ❌ | ❌ | ❌ | **B** |
| 3 | Thumbnail Studio | `src/views/ThumbnailStudio.tsx:340,376,393,414,443,492` | 6 | `SubToolbox` | ✅ | ❌ | ❌ | **A** |
| 4 | Community Posts | `src/components/CommunityPostGenerator.tsx:20,30,37,47,55,61,67` | 7 | `SubToolbox` | ✅ | ❌ | ❌ | **A** |
| 5 | Comment Responder | `src/components/CommentResponder.tsx:28,43,50,54,62,66` | 6 | `SubToolbox` | ✅ | ❌ | ❌ | **A** |
| 6 | End‑Screen Architect | `src/components/EndScreenTool.tsx:210,251,267,287,326` | 5 | `SubToolbox` | ✅ | ❌ | ❌ | **A** (4 of 5 also omit `isOpenInitial`) |
| 7 | Pre‑Launch Priming | `src/components/PreLaunchPriming.tsx:133` | 1 (Poll Generator / Shorts Teaser) | `Toolbox variant="sub"` | ✅ | ❌ | ❌ | **C** |
| 8 | Hook Generator | `src/views/HookGenerator.tsx:156` | 1 | `SubToolbox` | ✅ | ❌ | ❌ | **A** |
| 9 | Tactics Engine | `src/views/ActionableTactics.tsx:199` | 1 (Strategy Params) | `Toolbox variant="sub"` | ✅ | ❌ | ✅ (same index as parent) | **C** |
| 10 | Script Architect | `src/views/ScriptArchitect.tsx:84,150,228,313,407,458,547,632,667,706,755,826,887,921` | 14 | `SubToolbox` | ✅ | ✅ | ❌ | **D** |

**Studio Hub total: 54 Level‑1 sections, 4 distinct styles (A/B/C/D).**

### Projects — `src/views/ProjectCalendarPage.tsx`

| Palette | Module | File | Level‑1 sections | Component | Style |
|---|---|---|---|---|---|
| — | **Project Planning** (module shell) | `src/components/ProjectStudio.tsx:259` | — | **hand-rolled `div`** `border-[6px]` + `shadow-[12px_12px_0px_0px_black]` + hand-rolled 80px `<header>` | **module-shell defect** |
| — | ↳ Channel To‑Do List | `src/components/ProjectStudio.tsx:574` | 1 | `AccordionContainer` `iconBoxColor="bg-white"` | **E** |
| — | ↳ Channel Goals | `src/components/ProjectStudio.tsx:612` | 1 | `AccordionContainer` `iconBoxColor="bg-white"` | **E** |
| — | ↳ Description / Checklist / Script / Notes / Strategy Engine / Visual Storyboard | `:711,722,791,800,812,843` | 6 | `AccordionContainer` `iconBoxColor="bg-white"` | **E** |
| 1 | Storyboard Studio | `src/views/StoryboardStudio.tsx:37,38,39` | 3 (The Blueprint, Visual Canvas, The Oracle) | **hand-rolled** `border-[3px]` + `shadow-[6px_6px_0px_0px_black]` + `bg-black` header strip | **G** |
| 2 | Project Command Kanban | `src/views/ProjectCommandKanban.tsx:279` → `InternalSuperToolWorkbench` | 6 | `SubToolbox` | **D** (compliant) |
| 2 | ↳ prototype blocks | `SuperToolPrototypeWorkspace.tsx:520` (`BlueprintBlock`) | ~6 per tool | `SubToolbox`, no `collapsible`, no palette | **B + F** |
| 3 | Publishing Schedule Architect | `src/views/PublishingScheduleArchitect.tsx` → `InternalSuperToolWorkbench` | 6 | `SubToolbox` | **D** (compliant) |
| 3 | ↳ Priority Stack / Publishing Board / Pressure Tracker / Gate Checklist | `SuperToolPrototypeWorkspace.tsx:943,946,950,953` via `BlueprintBlock` | 4 | `SubToolbox`, no `collapsible`, no palette | **B + F** |

**Projects total: 8 `AccordionContainer` + 3 hand-rolled + 12 compliant + ~10 prototype blocks, 3 extra styles (E/F/G) plus the module-shell defect.**

---

## 3. Root causes, with evidence

Each finding was confirmed by rendering the real components, not by reading alone.

### 3.1 `collapsible` is opt-in, so "no arrow, never collapses" is a legal state — **B, F**

`SubToolbox` gates *both* the chevron and the `?` button behind `collapsible`
(`Toolbox.tsx:634-651`), which defaults to `false`.

```
renderToStaticMarkup(<SubToolbox title="VIDEO" icon={…}>…</SubToolbox>)
  → hasHelpButton: false   hasToggleIcon: false
```

Twelve sections on the two pages are in this state (6 in Content Analysis, ~6 per
prototype workspace). Nothing marks them as intentional.

### 3.2 No palette ⇒ the icon rail collapses into the title band — **F**

`Toolbox.tsx:566` — when no palette resolves, `iconBg = headerHex`. Both halves of
the header become the same colour, which is precisely the "same colour film"
reported.

```
// BlueprintBlock inside PrototypePanel (nested ToolboxScaffold, no paletteIndex)
F  → background-color:#00CCFF , background-color:#00CCFF    ← mono
// same SubToolbox with a palette in scope
OK → background-color:#FFDA47 , background-color:#36E0F6    ← two-tone
```

The trigger is `PrototypePanel` (`SuperToolPrototypeWorkspace.tsx:369`): it opens a
**second, nested `ToolboxScaffold` without `paletteIndex`**, which publishes a fresh
`PaletteCycleContext` whose `mainPaletteIndex` is `null`. Every `BlueprintBlock`
underneath it allocates `null` and falls back to the `#00CCFF` default. (It is also a
second Level‑0 hero nested inside a Level‑0 hero, which the skill explicitly forbids.)

### 3.3 `variant="sub"` is a no-op — **C**

`ToolboxVariant` accepts `'sub'`, but `Toolbox` only branches on `'header'` and
`'accordion'` (`Toolbox.tsx:182,204-206`). `'sub'` therefore renders **full Level‑0
chrome**: 80px header, 50px title, `MAIN_TOOLBOX_STROKE = 5`, `MAIN_TOOLBOX_SHADOW = 10`.
Because `ActionableTactics` passes the *parent's* `paletteIndex`, Strategy Params
renders in the parent's own colour at the parent's own scale — the "toolbox module used
as a subtoolbox" in the brief.

The "instant" collapse is the same root: `ToolboxProps.unmountWhenClosed` defaults to
`true` (`Toolbox.tsx:117`), so the body is destroyed on the first frame while the
grid-rows transition animates an empty shell. `SubToolbox` defaults `unmountOnClose`
to `false` and animates properly. 12 `variant="sub"` call sites repo-wide, 2 on these
pages.

### 3.4 `AccordionContainer` is Level‑0 chrome at Level‑1 height — **E**

`AccordionContainer` → `Toolbox variant="accordion"`: 56px header (Level‑1) but
`stroke = MAIN_TOOLBOX_STROKE (5)` and `shadowOffset = MAIN_TOOLBOX_SHADOW (10)`
(Level‑0), because `stroke`/`shadowOffset` are not branched per variant
(`Toolbox.tsx:162-165`). All 8 ProjectStudio call sites additionally pass
`iconBoxColor="bg-white"`, producing the white icon box in the brief. 35 call sites
repo-wide; 8 on Projects, the remaining 27 are in Reference Studio / component-library
surfaces.

### 3.5 Hand-rolled panels — **G** and the Project Planning shell

`StoryboardStudio.tsx:37-39` renders three panels as
`bg-white border-[3px] border-black rounded-xl shadow-[6px_6px_0px_0px_black]` with a
`bg-black` header strip and no icon rail. `ProjectStudio.tsx:259` renders the whole
Project Planning module as `border-[6px] border-black rounded-2xl
shadow-[12px_12px_0px_0px_black]` with a hand-copied 80px header including its own
`CustomIcon name="SYMBOLS 19"` / `"SYMBOLS 22"` chevron — a hand-swapped pair of static
SVGs standing in for the animated `AnimatedToggleIcon` every other module uses, and the
only place on either page that relies on the `*`-prefixed asset filenames the skill warns
about (`server.fs.deny`, gotcha in "CSS gotchas").

`ProjectStudio.tsx` carries **39 hard-coded `shadow-[Npx_Npx_0px_0px_black]`** values
across 8 distinct offsets (2/3/4/6/8/12/24px) — all solid black, none header-tinted.

### 3.6 Palette allocation is order-dependent and unstable — **new finding**

`SubToolbox` takes no `paletteIndex` at **73 of 75** call sites repo-wide; it allocates
one from `PaletteCycleContext` in mount order via a cursor ref
(`Toolbox.tsx:212-224`, `Toolbox.tsx:545-548`). The cursor is never reset, so any
remount re-allocates:

```
Studio Hub module, paletteIndex=2, unmountWhenClosed
  first render      : #FFDA47, #C0F240
  collapse + reopen : #3FEE56, #4EE4BE     ← different colours, same sections
```

This hits Community Posts and Comment Responder (both `unmountWhenClosed`), every
conditionally-rendered section, and every tab switch. Explicit indices are the only
stable fix.

---

## 4. Implementation plan

Six phases. Each phase is independently shippable and independently reviewable;
1 and 2 are the ones that eliminate the seven styles.

### Phase 0 — Loss-safety refs (per `CLAUDE.md`)

```bash
git tag pre-subtoolbox-unification-2026-09-12 origin/main
git branch snapshot/pre-subtoolbox-unification-HEAD-2026-09-12
SNAP=$(git stash create "pre-subtoolbox-unification local edits 2026-09-12")
git update-ref refs/snapshots/local-edits-2026-09-12 "$SNAP"
```

### Phase 1 — Make the canonical shell impossible to misuse

Single file: `src/components/Toolbox.tsx`. No call-site changes; fixes B, F, and the
colour instability wholesale.

1. **`collapsible` defaults to `true`** on `SubToolbox`. Every Level‑1 section gets a
   chevron and animates. Deliberate non-collapsing sections must say
   `collapsible={false}` out loud.
2. **Kill the mono header.** Replace `const iconBg = palette?.icon ?? headerHex` with a
   derived rail colour: resolve `headerHex` against `VT_SPECTRUM_PALETTE_06`, and use
   `getPaletteColor(i + 4)`; if the hex is off-spectrum, fall back to
   `getToolboxPaletteColors(0).icon`. The icon rail is never the title colour again.
3. **Delete `'sub'` from `ToolboxVariant`.** TypeScript then fails all 12 call sites,
   which is the point — there is no silent wrong answer left.
4. **Re-point `AccordionContainer` at the Level‑1 tokens** — `stroke = SUB_TOOLBOX_STROKE`,
   `shadowOffset = SUB_TOOLBOX_SHADOW`, radius 12, header‑tinted shadow — by branching
   `stroke`/`shadowOffset`/`radius` on `variant` at `Toolbox.tsx:162-166`. Deprecate
   `iconBoxColor` on it (ignore the prop, drive the rail from the palette).
5. **Warn, then remove, implicit palette allocation.** Keep
   `allocateSubPaletteIndex` for one release but `console.warn` in dev when it fires,
   so Phase 2 has a checklist it can drive to zero.

*Tests:* extend `src/components/Toolbox.test.tsx` — a bare `<SubToolbox>` renders a
chevron; a palette-less `<SubToolbox>` renders two different header background colours;
`AccordionContainer` renders `border:4px` / `6px 6px` shadow.

### Phase 2 — Give every section an explicit `paletteIndex` (fixes F permanently)

One helper per tool file, derived from the module's own index:

```tsx
const subPalette = (offset: number) => paletteIndex + 1 + offset
…
<SubToolbox title="Video Info" paletteIndex={subPalette(2)} collapsible isOpenInitial … />
```

Apply across the 54 Studio Hub sections and the 12 compliant Projects sections. Then
delete `PaletteCycleContext` and its cursor from `Toolbox.tsx`. Colours become a pure
function of position — stable across collapse, remount, and tab switch.

### Phase 3 — Normalise the props on every existing `SubToolbox` (fixes A, B, D)

The A/B/D split is purely a props difference. Sweep all 54 Studio Hub sections to the
same four props:

```tsx
<SubToolbox
  title="Video Info"
  icon={<Target size={20} strokeWidth={3} />}
  paletteIndex={subPalette(n)}
  collapsible
  isOpenInitial={…}          // explicit — never rely on the default
  helpText="One line the creator needs before using this section."
>
```

Per file: `MediaAnalyzer.tsx` (+`collapsible`, +`helpText` ×6), `VideoManager.tsx` (×4),
`VideoPublisher.tsx` (×3), `ThumbnailStudio.tsx` (×6), `CommunityPostGenerator.tsx` (×7),
`CommentResponder.tsx` (×6), `EndScreenTool.tsx` (×5, plus explicit `isOpenInitial`),
`HookGenerator.tsx` (×1), `ScriptArchitect.tsx` (×14 — move `subtitle` to `helpText` so
the rail is help, not a subtitle). The `?` button then appears on **all 54**, which is
what "one style" means; style D becomes the house style.

Also: `SuperToolPrototypeWorkspace.tsx` — `BlueprintBlock` gains
`collapsible isOpenInitial paletteIndex={…} helpText={label}` (the existing `label` prop
is already the right copy and is currently discarded), and `PrototypePanel` drops its
nested `ToolboxScaffold` in favour of a plain section wrapper so the page keeps one hero.

### Phase 4 — Convert C, E, G to `SubToolbox`

| Target | Change |
|---|---|
| `ActionableTactics.tsx:199` (Strategy Params) | `<Toolbox variant="sub">` → `<SubToolbox collapsible isOpenInitial paletteIndex={subPalette(0)} helpText="…">`; drop the `Toolbox` import; replace `tacticInputBase` fields with `StandardInput` |
| `PreLaunchPriming.tsx:133` (Poll Generator) | same conversion; `headerColor` per-mode override → `paletteIndex` |
| `ProjectStudio.tsx` ×8 | `AccordionContainer` → `SubToolbox` with `paletteIndex`; delete every `iconBoxColor="bg-white"` and `headerColor="bg-[#…]"` |
| `StoryboardStudio.tsx:37-39` | three hand-rolled panels → three `SubToolbox` (The Blueprint / Visual Canvas / The Oracle); delete the `bg-black` header strips and the `shadow-[6px_6px_0px_0px_black]` values; keep the interiors verbatim |

### Phase 5 — Fix the Project Planning module shell

`ProjectStudio.tsx:259-300` → a real `ToolboxScaffold`:

```tsx
<ToolboxScaffold
  title="PROJECT PLANNING"
  subtitle="Plan channel work and per-project production in one place"
  icon={<CustomIcon name="analytics" size={40} />}
  paletteIndex={0}
  collapsible isOpen={isMainToolOpen} onToggle={() => setIsMainToolOpen(v => !v)}
  headerActions={<ChannelProjectsSwitch … />}   // the CHANNEL/PROJECTS pill moves here
  helpText="…"
>
```

This removes `shadow-[12px_12px_0px_0px_black]` in favour of the header-tinted shell
shadow, removes the hand-copied header, and replaces the static
`CustomIcon name="SYMBOLS 19"` / `"SYMBOLS 22"` chevron pair with `AnimatedToggleIcon`. Then give Projects a palette ladder in
`ProjectCalendarPage.tsx`: `ProjectStudio paletteIndex={0}` alongside the existing 1/2/3.

While in the file, replace the 39 `shadow-[Npx_Npx_0px_0px_black]` interior values with
the two house depths (`3px` inner control, `6px` panel) so nothing inside the module
out-shouts the module.

### Phase 6 — Lock it in

1. **Test gate** — new `src/components/__tests__/subtoolboxUnification.test.tsx`: parse
   every `.tsx` under `src/views` and `src/components`, fail on
   (a) `<Toolbox variant="sub"`, (b) a `<SubToolbox` with no `paletteIndex`,
   (c) a `<SubToolbox` with no `helpText`/`subtitle`, (d) `<AccordionContainer` outside
   the allow-listed Reference Studio files. Ship with an explicit shrink-only
   allow-list, exactly like `ACCEPTED_ORPHAN_VIEWS`.
2. **Skill update** — add a "One Level‑1 style" section to
   `skills/viewtube-toolbox-builder/SKILL.md` (and the `.claude/skills` mirror; they are
   byte-identical today and must stay so) stating the four required props, that
   `variant="sub"` no longer exists, and that `AccordionContainer` is reference-surface
   only.
3. **Verify** — `npx tsc -b`; `npx vitest run src/app/__tests__ src/components`;
   `npm run build`; then Playwright screenshots of `/studio` and `/projects` at 1440px
   and 400px, against the Phase‑0 tag, confirming one header height, one stroke, one
   radius, one shadow depth and one two-tone rail everywhere.

---

## 5. Sizing

| Phase | Files | Risk | Why |
|---|---|---|---|
| 0 refs | 0 | none | |
| 1 shell | 1 (`Toolbox.tsx`) + tests | **med** | touches every toolbox in the app; visual regression is broad but uniform |
| 2 palette | ~14 | low | mechanical; deterministic colours |
| 3 props | ~10 | low | additive props only |
| 4 C/E/G | 4 | med | real JSX rewrites; interiors must be carried over verbatim |
| 5 shell | 2 | med | `ProjectStudio.tsx` is 1000+ lines with a hand-built header |
| 6 gates | 3 | low | |

Recommended landing order as a PR stack into `main`: **1 → 2 → 3 → 4 → 5 → 6**, each with
its own Vercel preview compared against production before merge. Phases 1–3 alone
collapse styles A, B, D and F into one; 4 and 5 clear C, E, G and the black module shadow.

## 6. Out of scope (deliberate)

- The 27 `AccordionContainer` call sites in `ReferenceStudio.tsx`,
  `UIReferenceLibraryContent.tsx` and `liveCanvasRegistry.tsx` — those surfaces exist to
  catalogue styles. Phase 6's allow-list names them; it may only shrink.
- The 10 `variant="sub"` call sites in `referenceStudio/` and `bench/` — Phase 1 step 3
  breaks their build, so they must be converted in the same PR, but they are not Studio
  Hub or Projects and need no design review.
- Level‑2 controls (`MiniToolbox`, `MicroToolbox`, `SubToolboxDropdownControl`,
  action buttons) — already consistent; not part of this brief.
