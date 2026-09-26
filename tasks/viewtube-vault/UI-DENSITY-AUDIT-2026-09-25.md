# ViewTube Vault — Mobile Density & Information Architecture Audit
_Date: 2026-09-25_

## Scope
Evidence reviewed:
- six iPhone screenshots supplied by the user (1206×2622 each);
- `src/views/CreatorVaultOS.tsx`;
- `src/components/subtoolbox/SubToolboxPrimitives.tsx`;
- `src/styles/subtoolbox-system.css`;
- `src/services/vaultWorkspaceState.ts`.

This is a planning/audit pass only. No UI redesign is implemented by this document.

## Implementation-integrity verdict
**Fail for interaction architecture; pass for component/system reuse.**

The Vault uses canonical Toolbox/SubToolbox primitives and real persisted state, but too many configuration, navigation, organization, and handoff concepts are presented as equally important full-width modules. The result is technically consistent yet operationally confusing.

The user must scroll through controls that configure the workspace before reaching the workspace itself. Navigator and Explorer divide navigation responsibilities without a strong mental-model boundary. Asset Operations presents external ViewTube destinations with the same visual weight as Vault-native tools. Asset cards reserve large fixed regions for metadata and notes even when those regions are empty.

## Audit health score
| Dimension | Score | Finding |
| --- | ---: | --- |
| Accessibility | 3/4 | Strong button semantics and ARIA coverage; oversized wrapping labels and dense all-caps reduce readability. |
| Performance | 2/4 | Large always-rendered control stacks and asset previews increase DOM/image cost; asset preview images are not consistently lazy/visibility optimized. |
| Responsive design | 1/4 | Mobile technically fits but requires excessive vertical scrolling; segmented controls wrap/crop and low-value controls dominate early viewports. |
| Theming | 2/4 | Strong palette system, but current Vault asset CSS still hard-codes black/white extensively and overuses heavy borders/shadows. |
| Implementation integrity | 1/4 | Multiple modules own overlapping navigation/configuration/action concepts; internal vs external tool ownership is unclear. |
| **Total** | **9/20** | **Poor — major interaction-architecture overhaul recommended.** |

## P1 findings

### Workspace Controls is configuration UI occupying primary workspace
`CreatorVaultOS.tsx` renders one full-width Show/Hide button for every module and optionally two more buttons per module for rearrangement. Every SubToolbox already has its own collapse control, so visibility/collapse/customization are exposed in overlapping ways.

**Impact:** roughly a full mobile viewport can be consumed before a creator reaches actual asset work. Workspace customization feels like the product instead of a preference.

**Direction:** remove Workspace Controls from normal document flow. Replace it with a compact Workspace/Layout popover on desktop and a sheet on mobile. Density, module visibility, and Arrange Mode belong there.

### Navigator is a filter panel, view switcher, state navigator, tag reset, and Smart Collection editor at once
Current Navigator owns:
- six view modes;
- seven library states;
- asset kind;
- source;
- sort;
- tag clearing;
- advanced metadata filters;
- Smart Collection naming/saving.

**Impact:** users cannot form a stable mental model of what Navigator means. The mobile segmented controls wrap into multiple rows and the library-state control visibly clips near Trash.

**Direction:** remove Navigator as a persistent SubToolbox. Put Search, View, Filter, Sort, and current library state in a compact Library toolbar. Advanced filters open a sheet/popover. Applied filters appear as removable chips.

### Explorer duplicates navigation and creation
Explorer mixes All Assets, Unassigned, Collections, Brand Kit creation and collection filtering. These overlap Navigator's state navigation and Group Builder's creation responsibility.

**Impact:** users must decide whether to “navigate” through Navigator or Explorer and encounter creation actions inside a navigation surface.

**Direction:** convert Explorer to a logical Library drawer/rail only: Projects, Collections, Brand Kit, Unassigned, Saved Collections. Move Create Brand Kit / create-group operations to Group Builder.

### Asset Operations conflates Vault utilities with external ViewTube destinations
The Tools mode renders Video Manager, Publisher, Projects + Calendar, Storyboard Studio, VT_E1 and Brain as large full-width buttons directly alongside Quick Look / Compare / Filmstrip / Lineage.

**Impact:** external handoff destinations read as if they are Vault-native tools. The largest controls are often low-frequency navigation actions.

**Direction:** replace persistent Asset Operations with a contextual Selection Action Bar. Vault-native actions are Tag, Batch, Group, Compare, Metadata and Export. External destinations live under a clearly named **Send to ViewTube…** menu with an external/handoff icon.

### Asset cards reserve space for empty metadata instead of the media
`SubToolboxVaultAsset` has a fixed mobile body height of `clamp(156px,46vw,228px)` and permanently divides it between preview and a two-row metadata column. The metadata column always reserves half its height for tags and half for notes. Preview media uses `object-fit: contain`.

**Impact:** screenshots show large colored/empty regions around thumbnails, large empty Notes areas, and document cards dominated by an empty preview panel. The media—the thing the Vault exists to browse—gets less space than card chrome.

**Direction:** redesign to media-first compact cards. Media occupies the card width/natural ratio; title + compact metadata/tags sit below it. Notes are hidden until selection/Inspector. Documents use a text excerpt, audio uses waveform/metadata, and generic icons are fallbacks only.

### Too much equal visual weight
Full-width buttons, thick borders, shadows, large uppercase labels, disabled full-width controls, and repeated nested frames give primary actions, secondary settings, navigation and status the same visual dominance.

**Impact:** scanning is slow; hierarchy must be read from labels instead of perceived instantly.

**Direction:** preserve neo-brutalist identity but reduce layers. One strong shell border per module; smaller interior borders; compact icon/label controls for secondary actions; full-width actions only for true primary commits.

## P2 findings
- Workspace Notes is always a first-class module even when unused; default it collapsed/hidden and expose via a Notes action.
- Task Center should collapse to a compact status row/badge when there are no active/failed jobs.
- Disabled actions such as Compare occupy significant height; contextual actions should appear only when eligible.
- View-mode choices do not all need equal permanent space on mobile; use a compact View menu or horizontally scrollable icon row.
- Smart Collection creation should live inside the Filter sheet after a useful filter exists, not as permanent empty input + disabled button.
- “All Spectrum Tags” in Navigator duplicates the dedicated Import & Tags tool.
- Module title/help/collapse chrome is repeated so often that headers become a material portion of page height.

## Positive findings to preserve
- Distinct ViewTube neo-brutalist visual identity.
- Canonical SubToolbox primitives and persistent workspace state.
- Clear ARIA labels on many interactive controls.
- Strong Vault capabilities: Grid/Masonry/Filmstrip/List/Timeline/Lineage, Smart Collections, Import & Tags, Text Editor, Task Center and Inspector.
- The current architecture already separates canonical asset ownership from Projects/Editor/Publisher; the redesign should preserve that backend ownership.

## Target mobile information architecture

### Persistent shell
1. ViewTube / Vault header.
2. **Library Toolbar** — Search, Library state, Filters, Sort, View, Workspace menu.
3. Applied filter chips only when active.
4. **Asset Library immediately.**

### Contextual surfaces
- **Library drawer:** Projects, Collections, Brand Kit, Unassigned, Saved Smart Collections.
- **Selection Action Bar:** appears only when one or more assets are selected.
- **Inspector:** bottom sheet / scroll target on mobile, right rail on wide desktop.
- **Workspace settings:** popover/sheet, never a normal scrolling module.
- **Task Center:** compact status entry unless running/failed work needs attention.

### Independent Vault tools
- **Import & Tags** remains one SubToolbox with TAGS / IMPORT modes.
- **Text Editor** remains its own SubToolbox.
- Both default collapsed unless explicitly opened or contextually invoked.

## Asset-card target
- Media-first, edge-to-edge preview.
- Respect source ratio; avoid fixed two-column body.
- Non-media chrome target: <= 96px in default compact card.
- One-line editable title.
- One compact metadata line (type · project · dimensions/duration).
- Up to 2–3 visible tag chips + “+N”.
- Notes not rendered in every card.
- Selection checkbox remains square and obvious.
- Selected card may reveal a short contextual action row; deep editing belongs in Inspector.
- Document assets show text excerpt/first lines instead of a large blank icon area.
- Disable/hide empty sections instead of reserving space.

## Mobile acceptance targets
- First Asset Library content visible within the first viewport after the Vault header on a normal return visit.
- Default pre-library control chrome <= 180 CSS px.
- No default configuration SubToolbox in document flow.
- No segmented control clips or hides an option at 320–430 CSS px width.
- No duplicated ownership for navigation, grouping, handoff, or workspace customization.
- No external ViewTube destination visually represented as a Vault-native tool.
- Empty/disabled actions do not consume full-width rows.
- Asset card chrome is materially smaller than its media region.
- Portrait and landscape preserve user scroll/selection state.
