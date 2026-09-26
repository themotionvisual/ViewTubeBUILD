---
name: viewtube-toolbox-builder
description: |
  How to build or convert a ViewTube creator tool so it looks and behaves like every other
  tool in the app. Use this skill whenever work involves a toolbox, sub-toolbox, a Studio Hub
  or Projects module, mounting an internal super-tool, converting a prototype/workbench view
  into house UI, or any task that says "make a tool", "add a tool to the hub", "wire up a
  hidden tool", "toolbox", "subtoolbox", "ToolboxScaffold", or "SubToolbox". Read it BEFORE
  writing the first line of a tool's JSX — it encodes the component contracts, the CSS
  gotchas that silently break layouts, and the registration checklist whose omission fails
  the build.
voice_triggers:
  - build a toolbox
  - add a tool to studio hub
  - wire up a hidden tool
  - convert a prototype to a toolbox
  - make a subtoolbox
---

# ViewTube Toolbox Builder

The app has one visual system for creator tools. A tool that does not use it looks broken
next to the others even when its logic is perfect. This is the contract.

## The component ladder

Use these; do not hand-roll equivalents. All from `src/components/Toolbox.tsx` unless noted.

| Level | Component | Use for |
| --- | --- | --- |
| 0 | `ToolboxScaffold` | The tool's outer shell. One per tool. |
| 1 | `SubToolbox` | A titled, collapsible section inside a tool. Nest freely. |
| 2 | `StandardInput`, `StandardTextArea` | Every text field. |
| 2 | `SubToolboxDropdownControl` | Labelled select. `options: string[]`, `onChange(option)`. |
| 2 | `SubToolboxGridActionButton` | The big call-to-action. |
| 2 | `SubToolboxInnerActionButton` | Compact action inside a sub-toolbox (3px stroke). |
| — | `PostActionReflection` (`src/components/PostActionReflection.tsx`) | Feedback strip after a generation. `toolId` is a plain string. |

`CommunityPostGenerator.tsx` is the reference implementation. When unsure how something
should look, copy what it does.

### Shells for the internal super-tools

Do not re-roll a hero for one of these; two shells already own the chrome.

- `src/views/supertools/InternalSuperToolWorkbench.tsx` — the seven config-only tools
  (Creator Canvas, Audience Loop, Packaging Lab, Series/Theme, Kanban, Publishing Schedule,
  Cinematic Analytics). You write an `InternalWorkbenchConfig`; the shell renders the whole
  toolbox. Editing the shell changes all seven at once.
- `src/views/supertools/SuperToolShell.tsx` — for a tool with a bespoke interior (Shorts,
  Workflow Chain, Brain Command, Retention Autopsy). It gives you the scaffold header, the
  sister-tools sub-toolbox and the hub prop shape; your sections are the children.

Both take `SuperToolMountProps` (`embedded`/`collapsible`/`isOpenInitial`/`paletteIndex`), so
spread `{...props}` and the tool mounts in a hub without further work.

### ToolboxScaffold props that matter

```tsx
<ToolboxScaffold
  title="SCRIPT ARCHITECT"              // uppercase by convention
  subtitle="One line on what it does for the creator"
  icon={<NotebookPen size={40} strokeWidth={3} className="text-black" />}
  paletteIndex={paletteIndex}            // when mounted in a hub — overrides headerColor
  headerColor="bg-[#00F0FF]"             // standalone fallback
  iconBoxColor="bg-[#CCFF00]"
  collapsible={collapsible}
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  embedded={embedded}
  helpText="What the creator should know before using it."
  contentClassName={embedded ? "p-0" : "p-8"}
>
```

Every hub-mountable tool takes this prop shape:

```tsx
interface ToolProps {
  embedded?: boolean
  collapsible?: boolean
  isOpenInitial?: boolean
  paletteIndex?: number
}
```

## CSS gotchas that will cost you an hour

These are real defects hit while building; the linter and typechecker catch none of them.

1. **`.vt-input-standard` sets `width: 100%` and `text-transform: uppercase`** (`src/index.css`).
   - Never size an input with `className="w-20"` or `flex-1` — the shared rule wins and the
     field blows out. Put sizing on a **wrapper**: `<div className="grid grid-cols-[1fr_88px] gap-2">`.
   - Prose that must read normally (a script, a draft, a reply) needs an **inline style**, because
     a utility class loses to the shared selector:
     `style={{ minHeight: "140px", textTransform: "none", fontWeight: 600 }}`
     Inline `style` replaces the component's own `minHeight`, so restate it.
2. **`CustomIcon` names are a fixed map.** An unknown name silently resolves to `/icons/<name>.svg`
   and 404s — a broken image, not an error. Valid keys:
   `home search video image analytics ideas settings zap sparkles target cloud database mic
   volume headset calendar checklist play pause layers eye eye-off audio paint-bucket
   AB-TESTING`. `CustomIcon.test.ts` now fails any map entry whose asset is missing — three
   of these names (`cloud`, `layers`, `checklist`) shipped broken before that guard existed plus the `!!!`-prefixed set (`!!!TRAFIC !!!REVENUE !!!SUBSCRIBERS !!!GEOGRAPHY
   !!!YOUTUBE !!!POST-VIDEO !!!IDEA !!!ANALYTICS !!!PALETTE !!!TEXT !!!COLLECTION !!!CLOUD
   !!!GENERATE1 !!!GENERATE2`).
   Use `lucide-react` icons for `ToolboxScaffold`/`SubToolbox` `icon` props; `iconName` on the
   action buttons must come from the list above.
3. **Action-button tones are a closed set**: `pink | orange | yellow | green | cyan | blue | purple`.
4. **Palette comes from the hub, not from you.** `paletteIndex` wraps
   (`getToolboxPaletteColors` in `src/styles/toolboxPalette.ts`), so pass the next index in the
   hub and let it pick header + icon colors. Hard-coded hex only for accents inside your own body.

## House layout

- Two columns on desktop, one on phone:
  `<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start w-full">`
  inputs left, results right.
- Toggle buttons: `min-h-11 border-[3px] border-black rounded-xl font-black uppercase text-[10px]
  shadow-[3px_3px_0_0_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`,
  selected state `bg-[#FFE357]`, with `aria-pressed`.
- Give every control an `aria-label` or a real `<label htmlFor>`; the dense uppercase styling
  makes unlabelled fields unreadable to a screen reader.

## Mounting into a hub

Studio Hub (`src/views/StudioHub.tsx`) and Projects (`src/views/ProjectCalendarPage.tsx`) mount
tools as modules. Use the next free `paletteIndex` and wrap in an anchor:

```tsx
<div id="script-architect" className="scroll-mt-24">
  <ScriptArchitect collapsible isOpenInitial={false} paletteIndex={10} />
</div>
```

For a full-page internal tool that renders its own hero, pass `embedded` when mounting it inside
a hub so the page keeps one hero instead of three.

## Registration checklist — omit one and CI fails

1. **Route** in `src/app/AppRoutes.tsx` (via `lazyRoute`), **or** mount in a hub.
2. **`src/app/pageRegistry.ts`** — every `<Route path>` must have an entry. `pageRegistry.test.ts`
   enforces it. `lifecycle: "lab"` + `navigationVisibility: "hidden"` is the correct stub for
   anything not yet creator-ready; promote to `beta`/`production` when it reads real data.
3. **Internal super-tools** also need an entry in `src/app/superToolViewRegistry.ts` — that is what
   `/tools/:toolId` resolves, and `superToolViewRegistry.test.ts` asserts every tool the runtime
   plan calls mounted is routable.
4. **No orphans.** The same test fails any file in `src/views/` imported zero times. If a view is
   deliberately parked, add it to `ACCEPTED_ORPHAN_VIEWS` with a reason — that list may only shrink.
5. Optional but expected for creator-facing tools: a dashboard quick action in
   `src/views/dashboard/useDashboardData.ts` (+ its icon case in `WidgetRenderer.tsx`) and a
   `src/content/guide-v2/featureRegistry.ts` entry.

## Persistence, if the tool holds creator input

Anything a creator types is expensive to re-enter. Follow
`src/features/script-architect/scriptProjectStore.ts` (itself modelled on
`communityPostStore.ts`): versioned `localStorage` key, debounced autosave, defensive
normalization so corrupt storage is repaired rather than thrown, and a named-draft vault.
Never let a quota failure interrupt editing.

## Before you call it done

- `npx tsc -b` — **not** `tsc --noEmit -p tsconfig.json`; the root config is `files: []` with
  project references, so that form is a no-op that silently passes.
- `npx vitest run src/app/__tests__` for the governance gates.
- `npm run build`, then open the tool in a browser and interact with it. The repo has Playwright
  and Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; launch with an explicit
  `executablePath`. Rendering is where the CSS gotchas above actually show up.
- eslint: add no new errors. `main` carries ~1,900 pre-existing ones, so check your files
  specifically rather than the whole repo.


## 2026-09-25 corrective contracts — read before building or migrating

These rules are mandatory until folded into the main sections above.

### Collapse control
Use the established animated **four-direction arrow** expand/collapse icon for Toolbox and SubToolbox headers. Do not substitute a generic chevron/down-arrow button. The symbol may rotate/animate with the 600ms shell motion, but its hitbox must remain isolated from help and header extras.

### Painted shell clearance
Judge spacing by painted extents, not padding tokens alone. The first child under a Toolbox/SubToolbox/MiniSubToolbox header must have visibly equal top/side/bottom clearance after accounting for strokes, shadows and focus outlines. Never patch only one feature; fix the canonical shell/compound.

### Mobile editable controls
Keep effective editable text at **16px minimum** on touch/mobile WebKit. Preserve normal pinch zoom. Focused fields must remain in place when already visible or move only enough to sit above the virtual keyboard. Keyboard handling stays separate from orientation-position restoration.

### Custom dropdowns are controlled components
For every custom dropdown/select, the displayed trigger value comes from the current controlled value; choosing an option calls the owner callback exactly once; the parent state change visibly updates the trigger; and the menu closes only after selection dispatch. Cover single-select, multi-select, portal and split-left variants with interaction tests.

### Palette sequence
The 12-color palette is sequential. Multi-tool pages advance Toolbox palette indices in order. Inside each Toolbox, the first SubToolbox continues with the next palette index and siblings/nested children continue the sequence; do not restart locally or choose decorative one-off colors. Prefer a centralized allocator to scattered literals.

### Canonical SubToolbox-level split-left action
When a full-row action visually represents a collapsed SubToolbox, use/build the shared split-left SubToolbox action: square icon rail, exact level geometry, centered icon, inherited palette pair and full-row button semantics. The Video Manager YouTube-connect action is the acceptance case. Add this compound to the Component Library.

### Thumbnail MiniSubToolbox
Thumbnail header + Upload/Generate + media preview is a reusable compound. Header actions must stay paint-safe and collision-free; the preview uses aspect-aware contain/fitted media. Add it to the Component Library and do not duplicate local anatomy.

### Vault asset cards
`VaultAssetModule` is the production visual authority for Creator Vault assets. Preserve the donor-parity fixed compound geometry from `VAULT_ASSET_MODULE_DNA` and `docs/ui/VAULT_ASSET_MODULE_REFERENCE_PARITY.md`: 276×189 standard module, 30px header, explicit landscape / landscape-swapped / portrait-single / portrait-double layouts, and 94.5px half-height audio/document variants. Keep the inline editable title, donor-style shared spectrum tag editor, contextual tag removal, dirty-save notes, donor selection placement, and real media/audio/document preview anatomy. ViewTube palette/font/focus tokens may flow into the module, but generic L0/L1/L2 CSS must not resize or restructure it. `SubToolboxVaultAsset` is compatibility-only for older consumers.

### Spectrum Tag L3 / Tag Editor #30
Create/use a dense L3 Spectrum Tag for embedded asset metadata. It remains on the 12-color spectrum and combines with the Tag Editor #30 add/remove interaction, including integrated X removal. Demonstrate L0-L3 in the Component Library.

### Certification gate
Do not describe a changed primitive as VERIFIED from source inspection alone. Require portrait + landscape mobile screenshots and interaction proofs for dropdown selection, header controls, first-child clearance, keyboard focus, palette order and Vault asset editing.
