# css_inconsistency_audit.md - Consolidated

> [!NOTE]
> This file consolidates 2 version(s) from different conversations.
> Latest version appears at the bottom.

---

## Version 1 (from 99877096-e967-4c05-84e0-38457938934b)

**Metadata:**
- artifactType: ARTIFACT_TYPE_OTHER
- summary: Comprehensive audit of 80 CSS and component inconsistencies across the ViewTube codebase (excluding ReferenceStudio). Organized into 15 categories covering border widths, shadows, radii, input styles, button patterns, redundant components, color anomalies, padding, empty states, animations, layouts, modals, loading indicators, and misc one-offs. Each item includes file locations, instance counts, and specific values. Concludes with 10 prioritized standardization recommendations including adopting the 3 unused Standard* components.
- updatedAt: 2026-05-02T10:26:22.412131Z
- requestFeedback: True


> [!IMPORTANT]
> This audit catalogs **one-off style exceptions and redundant component patterns** across the codebase (excluding ReferenceStudio). Each item is a unique pattern violation — duplicate occurrences are noted with count and locations.

---

## CATEGORY A: BORDER WIDTH CHAOS

**Canonical standard**: `border-[4px]` (SubToolbox/inner), `border-[5px]` (ToolboxScaffold/outer shell)

### 1. `border-[3px]` on text inputs — inconsistent with 4px standard
- **Files**: SeoGenerator.tsx (8 inputs, L377–457), ActionableTactics.tsx (6 inputs via `tacticInputBase`, L179–249), ThumbnailStudio.tsx (L364, L370, L384, L412, L453, L474)
- **Count**: ~20 instances across 3 files
- **Fix**: Standardize to `border-[4px]` or create `StandardInput` variant

### 2. `border-[5px]` used inside SubToolbox content (not outer shell)
- **Files**: CommunityPostGenerator.tsx (textarea L52, button L58), CommentResponder.tsx (textarea L52, button L58), EndScreenTool.tsx (input L53, button L59)
- **Count**: 6 instances across 3 files
- **Note**: These 3 components are the ONLY ones using 5px borders on inner form elements. Every other tool uses 4px.

### 3. `border-[6px]` on non-modal elements
- **Files**: VideoManager.tsx (L898 dialog wrapper, L1414 dropdown), ThumbnailStudio.tsx (L620 analyze button), SeoGenerator.tsx (L559 analysis box)
- **Count**: 4 instances. Standard reserves 6px for modal overlays (`UniversalDataTable`) and page-level shells.

### 4. `border-[2px]` on interactive elements that should be 3-4px
- **Files**: ActionableTactics.tsx (copy button L103), ThumbnailStudio.tsx (style chips L347, upload icon L403, palette hex inputs L474, ref image borders L419–422)
- **Count**: ~12 instances across 2 files
- **Note**: Creates visual inconsistency where some buttons feel "thinner" than peers

### 5. `border-2` (Tailwind default, not bracket notation) mixed with bracket notation
- **Files**: CommentResponder.tsx (copy button L75), CommunityPostGenerator.tsx (copy button L75), EndScreenTool.tsx (copy button L76)
- **Count**: 3 instances — all identical copy buttons using `border-2` while rest of app uses `border-[Npx]`

---

## CATEGORY B: SHADOW INCONSISTENCY

### 6. `shadow-[3px_3px_0px_0px_black]` — non-standard shadow offset
- **Files**: SeoGenerator.tsx (header toggles L279, L297), ThumbnailStudio.tsx (header toggle L267, upload button L412)
- **Count**: 4 instances. Standard offsets are 4px, 6px, 8px, 10px, 12px.

### 7. `shadow-[2px_2px_0px_0px_black]` — undersized shadow
- **Files**: VideoManager.tsx (pill badges L94), ActionableTactics.tsx (elaborate button L69, copy button L103), ThumbnailStudio.tsx (auto-refine button L330, upload icon L403)
- **Count**: ~8 instances. Too subtle against 4px+ border elements.

### 8. `shadow-[16px_16px_0px_0px_black]` — oversized shadow on non-hero elements
- **Files**: VideoManager.tsx (publish button L1557), ReportViewer.tsx (stat cards L117)
- **Count**: 2 instances. 16px shadow reserved for hero/page-level elements per design system.

### 9. `shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]` — semi-transparent shadow (unique)
- **Files**: VideoManager.tsx (pill badge L94)
- **Count**: 1 instance. No other element in the app uses rgba shadows on small elements.

### 10. `shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)]` — mixed opacity + large offset
- **Files**: VideoManager.tsx (dropdown panel L1067)
- **Count**: 1 instance. Hybrid of two shadow conventions.

---

## CATEGORY C: BORDER RADIUS ANARCHY

### 11. `rounded-[48px]` on content containers
- **Files**: ThumbnailStudio.tsx (canvas area L485), UniversalDataTable.tsx (modal shell), SimpleAnalyticsChart.tsx (L117)
- **Count**: 3 instances. Standard is `rounded-2xl` (16px) or `rounded-[24px]`.

### 12. `rounded-[32px]` on empty state containers
- **Files**: HookGenerator.tsx (L183, L230), ActionableTactics.tsx (L317), CommunityPostGenerator.tsx (L84), CommentResponder.tsx (L84), EndScreenTool.tsx (L85)
- **Count**: 6 instances, all empty state placeholders. Should be standardized.

### 13. `rounded-[20px]` on mixed elements
- **Files**: ThumbnailStudio.tsx (AddButton L241, history items L296), PreLaunchPriming.tsx (action selector L110, L120)
- **Count**: 4 instances. Non-standard — not 16px or 24px.

### 14. `rounded-[24px]` vs `rounded-2xl` used interchangeably
- **Files**: VideoManager.tsx (L1032), PreLaunchPriming.tsx (L131), HookGenerator.tsx (L155, L194)
- **Count**: ~6 instances of `rounded-[24px]` alongside dozens of `rounded-2xl` (which is 16px, NOT 24px). These are actually different values used as if they're the same.

---

## CATEGORY D: TEXT INPUT STYLE FRAGMENTATION

### 15. `pop-input` CSS class — used only in specific tools
- **Files**: PreLaunchPriming.tsx (4 inputs, L156–202), ThumbnailStudio.tsx (text inputs L364, L370, palette inputs L474, aspect/resolution selects L515, L530, ref select L425)
- **Count**: ~10 instances. `pop-input` is a global CSS class but has NO relationship to `StandardInput` component.

### 16. Inline input styling with `bg-gray-50` focus → `bg-white`
- **Files**: VideoManager.tsx (title L1339, description L1350, tags L1361, category L1374, language L1387)
- **Count**: 5 instances. This focus pattern doesn't exist in any other tool.

### 17. Inline input styling with `bg-[#F5F5F5]` background
- **Files**: SeoGenerator.tsx (all 8 form inputs, L377–457)
- **Count**: 8 instances. Only SeoGenerator uses this specific gray. Others use `bg-gray-50`, `bg-white`, or nothing.

### 18. Inline input with `focus:bg-[#FFB570]/10` highlight color
- **Files**: MediaAnalyzer.tsx (textarea L168, 3 info inputs L193–215)
- **Count**: 4 instances. Unique focus tint not used anywhere else.

### 19. Inline input with `focus:bg-[#FF7497]/10` highlight color
- **Files**: HookGenerator.tsx (textarea L168)
- **Count**: 1 instance. Tool-specific focus color.

### 20. Inline input with `focus:bg-[#FFDD00]/10` highlight color
- **Files**: CommunityPostGenerator.tsx (textarea L52)
- **Count**: 1 instance. Tool-specific focus color.

### 21. Inline input with `focus:bg-[#FF3399]/10` highlight color
- **Files**: CommentResponder.tsx (textarea L52)
- **Count**: 1 instance. Tool-specific focus color.

### 22. Inline input with `focus:bg-[#FFB158]/10` highlight color
- **Files**: EndScreenTool.tsx (input L53)
- **Count**: 1 instance. Tool-specific focus color.

### 23. Textarea `h-40` vs `h-32` vs `h-28` vs `h-56` vs `h-80` — no standard height
- **Files**: CommunityPostGenerator (h-40), CommentResponder (h-40), MediaAnalyzer (h-32), ThumbnailStudio (h-28), SeoGenerator (h-56), VideoManager (h-80)
- **Count**: 6 different heights across 6 files. No standardized "small/medium/large" textarea.

### 24. `StandardInput` component exists but is NEVER imported by any tool
- **Files**: StandardInput.tsx defined at components/StandardInput.tsx
- **Count**: 0 usages. Every tool hand-rolls its own input styling.

### 25. `StandardButton` component exists but is NEVER imported by any tool
- **Files**: StandardButton.tsx defined at components/StandardButton.tsx
- **Count**: 0 usages. Every tool hand-rolls button classes.

### 26. `StandardDropdown` component exists but is NEVER imported by any tool
- **Files**: StandardDropdown.tsx defined at components/StandardDropdown.tsx
- **Count**: 0 usages. Selects are all inline-styled.

---

## CATEGORY E: BUTTON STYLE FRAGMENTATION

### 27. Primary action button — at least 8 different patterns
| File | Border | Padding | Shadow | Radius | BG Color |
|------|--------|---------|--------|--------|----------|
| MediaAnalyzer | 4px | p-4 | 6px | rounded-xl | #00CCFF |
| HookGenerator | 4px | p-4 | 6px | rounded-xl | #FF7497 |
| PreLaunchPriming | 4px | p-5 | 6px | rounded-xl | #CCFF00 |
| CommunityPost | 5px | p-4 | 6px | rounded-xl | #FF3399 |
| CommentResponder | 5px | p-4 | 6px | rounded-xl | #FFB158 |
| EndScreenTool | 5px | p-4 | 6px | rounded-xl | #FF6666 |
| SeoGenerator | 4px | h-14 | 5px | rounded-xl | #FF8AAF |
| VideoManager | 4px | p-6 | 8px | rounded-2xl | #FF3399 |

- **Note**: Border width alternates between 4px and 5px. Shadow offset varies 5–8px. Padding uses p-4, p-5, p-6, or h-14. BG color is always different (expected for theming but the structural properties shouldn't vary).

### 28. "Missing API Key" button — 2 completely different implementations
- **Files**: SeoGenerator.tsx (L466, black bg + yellow text + transparent shadow), ThumbnailStudio.tsx (L543, black bg + yellow text + yellow shadow + scale transform)
- **Count**: 2 instances doing the same thing with different styling.

### 29. VideoManager publish button — unique `border-[6px]` + `text-4xl` + `rounded-[32px]`
- **Files**: VideoManager.tsx L1557
- **Count**: 1 instance. Largest button in the entire app. No other button uses 6px border + 32px radius + 4xl text.

### 30. Copy/action mini-buttons — 3 different patterns
- **Pattern A**: `bg-black text-white p-2 rounded-lg` (SeoGenerator CopyBox L61)
- **Pattern B**: `bg-black text-white rounded-lg border-2 border-black shadow-[2px_2px]` (CommunityPost/CommentResponder/EndScreen L75)
- **Pattern C**: `bg-gray-100 border-[2px] border-black rounded-lg shadow-[2px_2px]` (ActionableTactics L103)

---

## CATEGORY F: REDUNDANT/ONE-OFF COMPONENTS

### 31. `CopyBox` — custom component in SeoGenerator only
- **File**: SeoGenerator.tsx L28–76
- **Note**: Builds its own header+copy card. Could use `SubToolbox` with a copy `actionButton`.

### 32. `ConsolidatedCopyBox` — custom component in SeoGenerator only
- **File**: SeoGenerator.tsx L78–127
- **Note**: List variant of CopyBox. Should be a SubToolbox variant.

### 33. `TacticCard` — custom card component in ActionableTactics only
- **File**: ActionableTactics.tsx L30–128
- **Note**: Builds own card with 4px border, 6px shadow, hover transform. Duplicates SubToolbox visual pattern.

### 34. `AddButton` — custom inline component in ThumbnailStudio only
- **File**: ThumbnailStudio.tsx L228–249
- **Note**: Icon-left button with specific 4px/8px shadow pattern. Could be a `StandardButton` variant.

### 35. VideoManager `StatusBadge` inline pattern — pill with unique shadow
- **File**: VideoManager.tsx L94
- **Note**: `border-[4px] rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]`. Unique rgba shadow + pill shape not used elsewhere.

### 36. VideoManager tooltip — custom floating tooltip
- **File**: VideoManager.tsx L118
- **Note**: `border-[4px] border-black shadow-[6px_6px] rounded-2xl pointer-events-none`. One-off tooltip component.

### 37. VideoManager video card — custom accordion card
- **File**: VideoManager.tsx L1032
- **Note**: Complex inline card with `rounded-[24px] border-[4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]`. Could use SubToolbox.

### 38. VideoManager stats grid — custom stat blocks with unique hover colors
- **File**: VideoManager.tsx L1159–1257
- **Note**: 9 identical stat blocks each with a DIFFERENT hover color (`#40C6E9`, `#B9FF58`, `#FF83EA`, `#FFFF61`, `#FFB570`, `#5EE4FF`, `#FF8AAF`, `#4FFF5B`, `#FFE357`). These 9 colors aren't in the palette system.

---

## CATEGORY G: FONT WEIGHT / SIZE INCONSISTENCIES

### 39. `font-[1000]` vs `font-black` (900) used interchangeably
- **Files**: Every file. `font-[1000]` on headers/buttons, `font-black` on labels/body. No rule for which gets which.
- **Count**: 100+ instances total. Should pick one for headings, one for body.

### 40. Header title sizes vary wildly within the same hierarchy level
- `text-[50px]` — ToolboxScaffold headers (Toolbox.tsx L199)
- `text-[36px]` — ThumbnailStudio generate button (L562)
- `text-[32px]` — AccordionContainer headers (Toolbox.tsx L197)
- `text-4xl` — VideoManager publish (L1557), ActionableTactics header (L281)
- `text-3xl` — HookGenerator result title (L197)
- `text-2xl` — SubToolbox title (Toolbox.tsx L146)

### 41. Label text — 3 patterns
- `text-[10px] font-black uppercase tracking-widest text-black/50` (MediaAnalyzer, SeoGenerator, PreLaunchPriming)
- `text-[10px] font-black uppercase tracking-[0.2em] text-black/20` (ThumbnailStudio)
- `text-[10px] font-black uppercase tracking-wider text-[#FF3399] opacity-80` (ActionableTactics)

---

## CATEGORY H: COLOR ANOMALIES (Non-palette colors)

### 42. `#FF6666` — used ONLY in EndScreenTool
- **File**: EndScreenTool.tsx (button L59, result header L70)
- **Count**: 2 instances. Not in any palette or design token.

### 43. `#FF8AAF` — used ONLY in SeoGenerator
- **File**: SeoGenerator.tsx (generate button L472, validation ring L377/L392)
- **Count**: 3 instances. Similar to but NOT the same as `#FF7497`.

### 44. `#00d2ff` — used ONLY in SeoGenerator ConsolidatedCopyBox default
- **File**: SeoGenerator.tsx L83
- **Count**: 1 instance. Similar to but NOT `#00CCFF`.

### 45. `#C9F830` — used ONLY in ThumbnailStudio
- **File**: ThumbnailStudio.tsx (auto-refine button L330)
- **Count**: 1 instance. Similar to but NOT `#CCFF00`.

### 46. `#FCAF57` — used ONLY in ThumbnailStudio
- **File**: ThumbnailStudio.tsx (upload button L412)
- **Count**: 1 instance. Similar to but NOT `#FFB158`.

### 47. `#CC99FF` — used ONLY in ThumbnailStudio
- **File**: ThumbnailStudio.tsx (Text accordion L357, Images accordion iconBox L379)
- **Count**: 2 instances. Not in any palette.

### 48. `#00ff99` — used ONLY in VideoManager success banner
- **File**: VideoManager.tsx L891
- **Count**: 1 instance. Not the same as `#00FF99` in palette (actually IS same hex, but used as border+shadow color on a one-off banner).

### 49. `#B14AED` — used ONLY in Stuff.tsx headers
- **File**: Stuff.tsx L82, L130
- **Count**: 2 instances. Purple not in design system.

### 50. `#40C6E9`, `#B9FF58`, `#FF83EA`, `#FFFF61`, `#5EE4FF`, `#FF8AAF`, `#4FFF5B`, `#FFE357` — VideoManager stat hovers
- **File**: VideoManager.tsx L1159–1257
- **Count**: 8 unique colors used ONLY as hover states on stat grid blocks.

---

## CATEGORY I: PADDING / SPACING EXCEPTIONS

### 51. Content padding `p-8` vs `p-6` vs `p-5` inside SubToolboxes
- **Standard**: SubToolbox default is `p-6`
- **Exceptions**: MediaAnalyzer uses `p-5` (L148, L170, L184, L224), HookGenerator uses `p-6` and `p-8` mixed (L159, L209)
- **Count**: ~10 instances

### 52. `contentClassName="p-5"` on SubToolbox — unique to MediaAnalyzer
- **File**: MediaAnalyzer.tsx (L148, L170, L184, L224)
- **Count**: 4 SubToolboxes with non-standard padding

### 53. Gap values: `gap-6` vs `gap-8` vs `gap-10` between sibling elements
- Varies per file with no discernible rule. MediaAnalyzer uses `gap-8`, SeoGenerator `gap-4`, ThumbnailStudio `gap-6`.

---

## CATEGORY J: EMPTY STATE PATTERN DUPLICATION

### 54. Empty state — 4 different implementations of the same concept
- **Pattern A** (HookGenerator L230): `border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50 p-8` + icon 80px + 3xl title + paragraph
- **Pattern B** (CommunityPost L84): Same as A but `min-h-[400px]`
- **Pattern C** (CommentResponder L84): Same as B
- **Pattern D** (EndScreenTool L85): Same as B
- **Pattern E** (ActionableTactics L317): `h-96 rounded-[32px] border-[4px] border-black border-dashed opacity-20`
- **Note**: Should be one `EmptyState` component.

---

## CATEGORY K: ANIMATION INCONSISTENCIES

### 55. `animate-fade-in` — custom animation class used inconsistently
- Some ToolboxScaffolds get `shellClassName="animate-fade-in"`, others don't.
- **With**: MediaAnalyzer, HookGenerator, PreLaunchPriming, SeoGenerator
- **Without**: VideoManager, ActionableTactics (uses inner div instead)

### 56. `animate-in fade-in slide-in-from-bottom-4` — Tailwind animate plugin class
- **File**: SeoGenerator.tsx L319, L480
- **Count**: 2 instances. Only SeoGenerator uses this. Others use `animate-fade-in`.

### 57. `animate-bounce-in` — custom animation class
- **File**: ActionableTactics.tsx (toast L330)
- **Count**: 1 instance. Only toast in entire app.

### 58. `animate-ping` on loading indicator
- **File**: HookGenerator.tsx L184
- **Count**: 1 instance. Other loaders use `animate-spin` (Loader2 icon).

---

## CATEGORY L: LAYOUT PATTERN FRAGMENTATION

### 59. Two-column tool layout — 3 different grid implementations
- `grid grid-cols-1 lg:grid-cols-2 gap-8` (HookGenerator, CommunityPost, CommentResponder, EndScreenTool)
- `flex-1 flex flex-col lg:flex-row gap-8` (MediaAnalyzer)
- `toolboxSystem.shellRow` constant (ActionableTactics only)
- **Note**: `toolboxSystem` in toolboxSystem.ts defines canonical layout classes but only ActionableTactics uses them.

### 60. `toolboxSystem` layout utilities — defined but barely used
- **File**: components/toolboxSystem.ts
- **Used by**: ActionableTactics.tsx ONLY
- **Note**: Defines `shellRow`, `inputColumn`, `resultPanel`, `label` but zero other tools import it.

### 61. Header toggle groups — 2 different implementations
- **Pattern A** (SeoGenerator L279): `bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px] h-12`
- **Pattern B** (ThumbnailStudio L267): Same as A but subtly different padding
- **Note**: Both are binary toggle switches in toolbox headers. Should be one `HeaderToggle` component.

---

## CATEGORY M: MODAL / OVERLAY PATTERNS

### 62. VideoManager dialog — custom modal pattern
- **File**: VideoManager.tsx L898
- **Note**: `border-[6px] border-black rounded-2xl shadow-[12px_12px]`. Different from UniversalDataTable modal (`border-[6px] rounded-[48px] shadow-[24px_24px]`).

### 63. VideoManager dropdown — custom dropdown overlay
- **File**: VideoManager.tsx L1067, L1414
- **Note**: 2 completely different dropdown implementations in the same file. First uses `border-[5px] rounded-b-[24px]`, second uses `border-[6px] rounded-2xl`.

---

## CATEGORY N: PROGRESS / LOADING INDICATORS

### 64. Progress bar — only in MediaAnalyzer
- **File**: MediaAnalyzer.tsx L134–138
- **Note**: `bg-gray-200 rounded-2xl h-6 border-[4px] border-black shadow-[4px_4px]` with `bg-[#CCFF00]` fill. No other tool has a progress bar.

### 65. Loading spinner implementations vary
- `Loader2 className="animate-spin"` (SeoGenerator, CommunityPost, CommentResponder, EndScreenTool, ActionableTactics)
- Custom pinging circle (HookGenerator L184)
- Custom `border-2 border-t-transparent rounded-full animate-spin` (SeoGenerator L502, L514)

---

## CATEGORY O: MISCELLANEOUS ONE-OFFS

### 66. `text-white` on SubToolbox header — only CommentResponder
- **File**: CommentResponder.tsx L42 (`textColor="text-white"`)
- **Count**: 1 instance. All other SubToolbox headers use black text.

### 67. `.prose` markdown container styling — 4 variants
- `prose prose-sm max-w-none font-bold text-black/80` (CommunityPost, CommentResponder, EndScreenTool)
- `prose prose-sm max-w-none font-bold text-black/80` + heading overrides (same 3)
- `prose prose-invert prose-sm max-w-none font-medium text-white/80` (SeoGenerator L563)
- `prose max-w-none text-sm font-bold` (ThumbnailStudio L628)

### 68. `custom-scrollbar` class — applied inconsistently
- Used in: CommunityPost, CommentResponder, EndScreenTool (on result panels), ThumbnailStudio (history bar L288)
- NOT used in: MediaAnalyzer results, HookGenerator results, ActionableTactics results

### 69. VideoManager file upload area — unique dashed border with dynamic color
- **File**: VideoManager.tsx L1274
- **Note**: `border-[4px] border-dashed` that changes to `border-[#FF83EA] bg-[#FF83EA]/10` on drag. Only drag-aware upload in the app.

### 70. `hover:-translate-y-1` vs `hover:translate-y-[-4px]` vs `hover:-translate-y-2`
- 3 different hover lift amounts used across cards: -1 (SeoGenerator CopyBox), -4px (ThumbnailStudio history), -2 (ProjectStudio)

### 71. Action button hover: `hover:translate-x-1 hover:translate-y-1` vs `hover:translate-y-0.5` vs `hover:scale-110`
- 3 completely different hover interaction models used on buttons of the same visual weight.

### 72. `mt-6` on generate buttons — only CommunityPost/CommentResponder/EndScreenTool
- **Count**: 3 instances. Other generate buttons use `mt-4` or no margin (handled by parent spacing).

### 73. `h-16` forced height on EndScreenTool input
- **File**: EndScreenTool.tsx L53
- **Count**: 1 instance. Other single-line inputs use `h-12` or auto-height.

### 74. `h-14` fixed height buttons — only SeoGenerator
- **File**: SeoGenerator.tsx L466, L472
- **Count**: 2 instances. Other tools use `p-4`/`p-5` padding instead of fixed height.

### 75. `max-h-[400px]` on result containers
- **Files**: SeoGenerator.tsx (CopyBox L65, ConsolidatedCopyBox L108), CommunityPost/CommentResponder/EndScreenTool result panels
- **Count**: 5 instances. Other result panels have no max-height.

### 76. `font-mono` text — only in SeoGenerator CopyBox
- **File**: SeoGenerator.tsx L67
- **Count**: 1 instance. Every other text display uses system font.

### 77. `italic` on header text — only ThumbnailStudio canvas standby
- **File**: ThumbnailStudio.tsx L497
- **Count**: 1 instance. No other heading in the app uses italic.

### 78. `-rotate-12` decorative rotation
- **File**: VideoManager.tsx L1001
- **Count**: 1 instance. Rotated icon circle, unique decoration.

### 79. `grayscale` filter class
- **File**: ThumbnailStudio.tsx (disabled button L553)
- **Count**: 1 instance. Other disabled states use `opacity-50` only.

### 80. `inset shadow` — `shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]`
- **File**: VideoManager.tsx L1534 (tags display)
- **Count**: 1 instance. Only inset shadow in entire app.

---

## SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| Border width violations | 50+ |
| Shadow offset anomalies | 20+ |
| Border radius exceptions | 20+ |
| Input style variations | 30+ |
| Button pattern variations | 25+ |
| Redundant components | 7 |
| Color anomalies | 15+ |
| Unused standard components | 3 (`StandardInput`, `StandardButton`, `StandardDropdown`) |
| Layout pattern fragments | 5 |

## RECOMMENDED STANDARDIZATION PRIORITIES

1. **Adopt `StandardInput`/`StandardButton`/`StandardDropdown`** across ALL tools — they already exist and are unused
2. **Create `EmptyState` component** — deduplicate 5 identical empty state patterns
3. **Create `HeaderToggle` component** — standardize the binary toggle switches
4. **Lock border widths**: 4px (inner/sub), 5px (outer shell), 6px (modal only)
5. **Lock shadow offsets**: 4px (small), 6px (medium), 8px (large), 12px (hero)
6. **Lock border radii**: `rounded-xl` (12px inner), `rounded-2xl` (16px standard), `rounded-[24px]` (cards), `rounded-[48px]` (modal only)
7. **Standardize textarea heights**: small (h-28), medium (h-40), large (h-56)
8. **Consolidate focus colors** into palette-driven variable or remove entirely
9. **Kill one-off colors**: Map `#FF8AAF`→`#FF7497`, `#00d2ff`→`#00CCFF`, `#C9F830`→`#CCFF00`, `#FCAF57`→`#FFB158`
10. **Adopt `toolboxSystem` layout utilities** in all tools, not just ActionableTactics


---

## Version 2 (from 99877096-e967-4c05-84e0-38457938934b)


> [!IMPORTANT]
> This audit catalogs **one-off style exceptions and redundant component patterns** across the codebase (excluding ReferenceStudio). Each item is a unique pattern violation — duplicate occurrences are noted with count and locations.

---

## CATEGORY A: BORDER WIDTH CHAOS

**Canonical standard**: `border-[4px]` (SubToolbox/inner), `border-[5px]` (ToolboxScaffold/outer shell)

### 1. `border-[3px]` on text inputs — inconsistent with 4px standard
- **Files**: SeoGenerator.tsx (8 inputs, L377–457), ActionableTactics.tsx (6 inputs via `tacticInputBase`, L179–249), ThumbnailStudio.tsx (L364, L370, L384, L412, L453, L474)
- **Count**: ~20 instances across 3 files
- **Fix**: Standardize to `border-[4px]` or create `StandardInput` variant

### 2. `border-[5px]` used inside SubToolbox content (not outer shell)
- **Files**: CommunityPostGenerator.tsx (textarea L52, button L58), CommentResponder.tsx (textarea L52, button L58), EndScreenTool.tsx (input L53, button L59)
- **Count**: 6 instances across 3 files
- **Note**: These 3 components are the ONLY ones using 5px borders on inner form elements. Every other tool uses 4px.

### 3. `border-[6px]` on non-modal elements
- **Files**: VideoManager.tsx (L898 dialog wrapper, L1414 dropdown), ThumbnailStudio.tsx (L620 analyze button), SeoGenerator.tsx (L559 analysis box)
- **Count**: 4 instances. Standard reserves 6px for modal overlays (`UniversalDataTable`) and page-level shells.

### 4. `border-[2px]` on interactive elements that should be 3-4px
- **Files**: ActionableTactics.tsx (copy button L103), ThumbnailStudio.tsx (style chips L347, upload icon L403, palette hex inputs L474, ref image borders L419–422)
- **Count**: ~12 instances across 2 files
- **Note**: Creates visual inconsistency where some buttons feel "thinner" than peers

### 5. `border-2` (Tailwind default, not bracket notation) mixed with bracket notation
- **Files**: CommentResponder.tsx (copy button L75), CommunityPostGenerator.tsx (copy button L75), EndScreenTool.tsx (copy button L76)
- **Count**: 3 instances — all identical copy buttons using `border-2` while rest of app uses `border-[Npx]`

---

## CATEGORY B: SHADOW INCONSISTENCY

### 6. `shadow-[3px_3px_0px_0px_black]` — non-standard shadow offset
- **Files**: SeoGenerator.tsx (header toggles L279, L297), ThumbnailStudio.tsx (header toggle L267, upload button L412)
- **Count**: 4 instances. Standard offsets are 4px, 6px, 8px, 10px, 12px.

### 7. `shadow-[2px_2px_0px_0px_black]` — undersized shadow
- **Files**: VideoManager.tsx (pill badges L94), ActionableTactics.tsx (elaborate button L69, copy button L103), ThumbnailStudio.tsx (auto-refine button L330, upload icon L403)
- **Count**: ~8 instances. Too subtle against 4px+ border elements.

### 8. `shadow-[16px_16px_0px_0px_black]` — oversized shadow on non-hero elements
- **Files**: VideoManager.tsx (publish button L1557), ReportViewer.tsx (stat cards L117)
- **Count**: 2 instances. 16px shadow reserved for hero/page-level elements per design system.

### 9. `shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]` — semi-transparent shadow (unique)
- **Files**: VideoManager.tsx (pill badge L94)
- **Count**: 1 instance. No other element in the app uses rgba shadows on small elements.

### 10. `shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)]` — mixed opacity + large offset
- **Files**: VideoManager.tsx (dropdown panel L1067)
- **Count**: 1 instance. Hybrid of two shadow conventions.

---

## CATEGORY C: BORDER RADIUS ANARCHY

### 11. `rounded-[48px]` on content containers
- **Files**: ThumbnailStudio.tsx (canvas area L485), UniversalDataTable.tsx (modal shell), SimpleAnalyticsChart.tsx (L117)
- **Count**: 3 instances. Standard is `rounded-2xl` (16px) or `rounded-[24px]`.

### 12. `rounded-[32px]` on empty state containers
- **Files**: HookGenerator.tsx (L183, L230), ActionableTactics.tsx (L317), CommunityPostGenerator.tsx (L84), CommentResponder.tsx (L84), EndScreenTool.tsx (L85)
- **Count**: 6 instances, all empty state placeholders. Should be standardized.

### 13. `rounded-[20px]` on mixed elements
- **Files**: ThumbnailStudio.tsx (AddButton L241, history items L296), PreLaunchPriming.tsx (action selector L110, L120)
- **Count**: 4 instances. Non-standard — not 16px or 24px.

### 14. `rounded-[24px]` vs `rounded-2xl` used interchangeably
- **Files**: VideoManager.tsx (L1032), PreLaunchPriming.tsx (L131), HookGenerator.tsx (L155, L194)
- **Count**: ~6 instances of `rounded-[24px]` alongside dozens of `rounded-2xl` (which is 16px, NOT 24px). These are actually different values used as if they're the same.

---

## CATEGORY D: TEXT INPUT STYLE FRAGMENTATION

### 15. `pop-input` CSS class — used only in specific tools
- **Files**: PreLaunchPriming.tsx (4 inputs, L156–202), ThumbnailStudio.tsx (text inputs L364, L370, palette inputs L474, aspect/resolution selects L515, L530, ref select L425)
- **Count**: ~10 instances. `pop-input` is a global CSS class but has NO relationship to `StandardInput` component.

### 16. Inline input styling with `bg-gray-50` focus → `bg-white`
- **Files**: VideoManager.tsx (title L1339, description L1350, tags L1361, category L1374, language L1387)
- **Count**: 5 instances. This focus pattern doesn't exist in any other tool.

### 17. Inline input styling with `bg-[#F5F5F5]` background
- **Files**: SeoGenerator.tsx (all 8 form inputs, L377–457)
- **Count**: 8 instances. Only SeoGenerator uses this specific gray. Others use `bg-gray-50`, `bg-white`, or nothing.

### 18. Inline input with `focus:bg-[#FFB570]/10` highlight color
- **Files**: MediaAnalyzer.tsx (textarea L168, 3 info inputs L193–215)
- **Count**: 4 instances. Unique focus tint not used anywhere else.

### 19. Inline input with `focus:bg-[#FF7497]/10` highlight color
- **Files**: HookGenerator.tsx (textarea L168)
- **Count**: 1 instance. Tool-specific focus color.

### 20. Inline input with `focus:bg-[#FFDD00]/10` highlight color
- **Files**: CommunityPostGenerator.tsx (textarea L52)
- **Count**: 1 instance. Tool-specific focus color.

### 21. Inline input with `focus:bg-[#FF3399]/10` highlight color
- **Files**: CommentResponder.tsx (textarea L52)
- **Count**: 1 instance. Tool-specific focus color.

### 22. Inline input with `focus:bg-[#FFB158]/10` highlight color
- **Files**: EndScreenTool.tsx (input L53)
- **Count**: 1 instance. Tool-specific focus color.

### 23. Textarea `h-40` vs `h-32` vs `h-28` vs `h-56` vs `h-80` — no standard height
- **Files**: CommunityPostGenerator (h-40), CommentResponder (h-40), MediaAnalyzer (h-32), ThumbnailStudio (h-28), SeoGenerator (h-56), VideoManager (h-80)
- **Count**: 6 different heights across 6 files. No standardized "small/medium/large" textarea.

### 24. `StandardInput` component exists but is NEVER imported by any tool
- **Files**: StandardInput.tsx defined at components/StandardInput.tsx
- **Count**: 0 usages. Every tool hand-rolls its own input styling.

### 25. `StandardButton` component exists but is NEVER imported by any tool
- **Files**: StandardButton.tsx defined at components/StandardButton.tsx
- **Count**: 0 usages. Every tool hand-rolls button classes.

### 26. `StandardDropdown` component exists but is NEVER imported by any tool
- **Files**: StandardDropdown.tsx defined at components/StandardDropdown.tsx
- **Count**: 0 usages. Selects are all inline-styled.

---

## CATEGORY E: BUTTON STYLE FRAGMENTATION

### 27. Primary action button — at least 8 different patterns
| File | Border | Padding | Shadow | Radius | BG Color |
|------|--------|---------|--------|--------|----------|
| MediaAnalyzer | 4px | p-4 | 6px | rounded-xl | #00CCFF |
| HookGenerator | 4px | p-4 | 6px | rounded-xl | #FF7497 |
| PreLaunchPriming | 4px | p-5 | 6px | rounded-xl | #CCFF00 |
| CommunityPost | 5px | p-4 | 6px | rounded-xl | #FF3399 |
| CommentResponder | 5px | p-4 | 6px | rounded-xl | #FFB158 |
| EndScreenTool | 5px | p-4 | 6px | rounded-xl | #FF6666 |
| SeoGenerator | 4px | h-14 | 5px | rounded-xl | #FF8AAF |
| VideoManager | 4px | p-6 | 8px | rounded-2xl | #FF3399 |

- **Note**: Border width alternates between 4px and 5px. Shadow offset varies 5–8px. Padding uses p-4, p-5, p-6, or h-14. BG color is always different (expected for theming but the structural properties shouldn't vary).

### 28. "Missing API Key" button — 2 completely different implementations
- **Files**: SeoGenerator.tsx (L466, black bg + yellow text + transparent shadow), ThumbnailStudio.tsx (L543, black bg + yellow text + yellow shadow + scale transform)
- **Count**: 2 instances doing the same thing with different styling.

### 29. VideoManager publish button — unique `border-[6px]` + `text-4xl` + `rounded-[32px]`
- **Files**: VideoManager.tsx L1557
- **Count**: 1 instance. Largest button in the entire app. No other button uses 6px border + 32px radius + 4xl text.

### 30. Copy/action mini-buttons — 3 different patterns
- **Pattern A**: `bg-black text-white p-2 rounded-lg` (SeoGenerator CopyBox L61)
- **Pattern B**: `bg-black text-white rounded-lg border-2 border-black shadow-[2px_2px]` (CommunityPost/CommentResponder/EndScreen L75)
- **Pattern C**: `bg-gray-100 border-[2px] border-black rounded-lg shadow-[2px_2px]` (ActionableTactics L103)

---

## CATEGORY F: REDUNDANT/ONE-OFF COMPONENTS

### 31. `CopyBox` — custom component in SeoGenerator only
- **File**: SeoGenerator.tsx L28–76
- **Note**: Builds its own header+copy card. Could use `SubToolbox` with a copy `actionButton`.

### 32. `ConsolidatedCopyBox` — custom component in SeoGenerator only
- **File**: SeoGenerator.tsx L78–127
- **Note**: List variant of CopyBox. Should be a SubToolbox variant.

### 33. `TacticCard` — custom card component in ActionableTactics only
- **File**: ActionableTactics.tsx L30–128
- **Note**: Builds own card with 4px border, 6px shadow, hover transform. Duplicates SubToolbox visual pattern.

### 34. `AddButton` — custom inline component in ThumbnailStudio only
- **File**: ThumbnailStudio.tsx L228–249
- **Note**: Icon-left button with specific 4px/8px shadow pattern. Could be a `StandardButton` variant.

### 35. VideoManager `StatusBadge` inline pattern — pill with unique shadow
- **File**: VideoManager.tsx L94
- **Note**: `border-[4px] rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]`. Unique rgba shadow + pill shape not used elsewhere.

### 36. VideoManager tooltip — custom floating tooltip
- **File**: VideoManager.tsx L118
- **Note**: `border-[4px] border-black shadow-[6px_6px] rounded-2xl pointer-events-none`. One-off tooltip component.

### 37. VideoManager video card — custom accordion card
- **File**: VideoManager.tsx L1032
- **Note**: Complex inline card with `rounded-[24px] border-[4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]`. Could use SubToolbox.

### 38. VideoManager stats grid — custom stat blocks with unique hover colors
- **File**: VideoManager.tsx L1159–1257
- **Note**: 9 identical stat blocks each with a DIFFERENT hover color (`#40C6E9`, `#B9FF58`, `#FF83EA`, `#FFFF61`, `#FFB570`, `#5EE4FF`, `#FF8AAF`, `#4FFF5B`, `#FFE357`). These 9 colors aren't in the palette system.

---

## CATEGORY G: FONT WEIGHT / SIZE INCONSISTENCIES

### 39. `font-[1000]` vs `font-black` (900) used interchangeably
- **Files**: Every file. `font-[1000]` on headers/buttons, `font-black` on labels/body. No rule for which gets which.
- **Count**: 100+ instances total. Should pick one for headings, one for body.

### 40. Header title sizes vary wildly within the same hierarchy level
- `text-[50px]` — ToolboxScaffold headers (Toolbox.tsx L199)
- `text-[36px]` — ThumbnailStudio generate button (L562)
- `text-[32px]` — AccordionContainer headers (Toolbox.tsx L197)
- `text-4xl` — VideoManager publish (L1557), ActionableTactics header (L281)
- `text-3xl` — HookGenerator result title (L197)
- `text-2xl` — SubToolbox title (Toolbox.tsx L146)

### 41. Label text — 3 patterns
- `text-[10px] font-black uppercase tracking-widest text-black/50` (MediaAnalyzer, SeoGenerator, PreLaunchPriming)
- `text-[10px] font-black uppercase tracking-[0.2em] text-black/20` (ThumbnailStudio)
- `text-[10px] font-black uppercase tracking-wider text-[#FF3399] opacity-80` (ActionableTactics)

---

## CATEGORY H: COLOR ANOMALIES (Non-palette colors)

### 42. `#FF6666` — used ONLY in EndScreenTool
- **File**: EndScreenTool.tsx (button L59, result header L70)
- **Count**: 2 instances. Not in any palette or design token.

### 43. `#FF8AAF` — used ONLY in SeoGenerator
- **File**: SeoGenerator.tsx (generate button L472, validation ring L377/L392)
- **Count**: 3 instances. Similar to but NOT the same as `#FF7497`.

### 44. `#00d2ff` — used ONLY in SeoGenerator ConsolidatedCopyBox default
- **File**: SeoGenerator.tsx L83
- **Count**: 1 instance. Similar to but NOT `#00CCFF`.

### 45. `#C9F830` — used ONLY in ThumbnailStudio
- **File**: ThumbnailStudio.tsx (auto-refine button L330)
- **Count**: 1 instance. Similar to but NOT `#CCFF00`.

### 46. `#FCAF57` — used ONLY in ThumbnailStudio
- **File**: ThumbnailStudio.tsx (upload button L412)
- **Count**: 1 instance. Similar to but NOT `#FFB158`.

### 47. `#CC99FF` — used ONLY in ThumbnailStudio
- **File**: ThumbnailStudio.tsx (Text accordion L357, Images accordion iconBox L379)
- **Count**: 2 instances. Not in any palette.

### 48. `#00ff99` — used ONLY in VideoManager success banner
- **File**: VideoManager.tsx L891
- **Count**: 1 instance. Not the same as `#00FF99` in palette (actually IS same hex, but used as border+shadow color on a one-off banner).

### 49. `#B14AED` — used ONLY in Stuff.tsx headers
- **File**: Stuff.tsx L82, L130
- **Count**: 2 instances. Purple not in design system.

### 50. `#40C6E9`, `#B9FF58`, `#FF83EA`, `#FFFF61`, `#5EE4FF`, `#FF8AAF`, `#4FFF5B`, `#FFE357` — VideoManager stat hovers
- **File**: VideoManager.tsx L1159–1257
- **Count**: 8 unique colors used ONLY as hover states on stat grid blocks.

---

## CATEGORY I: PADDING / SPACING EXCEPTIONS

### 51. Content padding `p-8` vs `p-6` vs `p-5` inside SubToolboxes
- **Standard**: SubToolbox default is `p-6`
- **Exceptions**: MediaAnalyzer uses `p-5` (L148, L170, L184, L224), HookGenerator uses `p-6` and `p-8` mixed (L159, L209)
- **Count**: ~10 instances

### 52. `contentClassName="p-5"` on SubToolbox — unique to MediaAnalyzer
- **File**: MediaAnalyzer.tsx (L148, L170, L184, L224)
- **Count**: 4 SubToolboxes with non-standard padding

### 53. Gap values: `gap-6` vs `gap-8` vs `gap-10` between sibling elements
- Varies per file with no discernible rule. MediaAnalyzer uses `gap-8`, SeoGenerator `gap-4`, ThumbnailStudio `gap-6`.

---

## CATEGORY J: EMPTY STATE PATTERN DUPLICATION

### 54. Empty state — 4 different implementations of the same concept
- **Pattern A** (HookGenerator L230): `border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50 p-8` + icon 80px + 3xl title + paragraph
- **Pattern B** (CommunityPost L84): Same as A but `min-h-[400px]`
- **Pattern C** (CommentResponder L84): Same as B
- **Pattern D** (EndScreenTool L85): Same as B
- **Pattern E** (ActionableTactics L317): `h-96 rounded-[32px] border-[4px] border-black border-dashed opacity-20`
- **Note**: Should be one `EmptyState` component.

---

## CATEGORY K: ANIMATION INCONSISTENCIES

### 55. `animate-fade-in` — custom animation class used inconsistently
- Some ToolboxScaffolds get `shellClassName="animate-fade-in"`, others don't.
- **With**: MediaAnalyzer, HookGenerator, PreLaunchPriming, SeoGenerator
- **Without**: VideoManager, ActionableTactics (uses inner div instead)

### 56. `animate-in fade-in slide-in-from-bottom-4` — Tailwind animate plugin class
- **File**: SeoGenerator.tsx L319, L480
- **Count**: 2 instances. Only SeoGenerator uses this. Others use `animate-fade-in`.

### 57. `animate-bounce-in` — custom animation class
- **File**: ActionableTactics.tsx (toast L330)
- **Count**: 1 instance. Only toast in entire app.

### 58. `animate-ping` on loading indicator
- **File**: HookGenerator.tsx L184
- **Count**: 1 instance. Other loaders use `animate-spin` (Loader2 icon).

---

## CATEGORY L: LAYOUT PATTERN FRAGMENTATION

### 59. Two-column tool layout — 3 different grid implementations
- `grid grid-cols-1 lg:grid-cols-2 gap-8` (HookGenerator, CommunityPost, CommentResponder, EndScreenTool)
- `flex-1 flex flex-col lg:flex-row gap-8` (MediaAnalyzer)
- `toolboxSystem.shellRow` constant (ActionableTactics only)
- **Note**: `toolboxSystem` in toolboxSystem.ts defines canonical layout classes but only ActionableTactics uses them.

### 60. `toolboxSystem` layout utilities — defined but barely used
- **File**: components/toolboxSystem.ts
- **Used by**: ActionableTactics.tsx ONLY
- **Note**: Defines `shellRow`, `inputColumn`, `resultPanel`, `label` but zero other tools import it.

### 61. Header toggle groups — 2 different implementations
- **Pattern A** (SeoGenerator L279): `bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px] h-12`
- **Pattern B** (ThumbnailStudio L267): Same as A but subtly different padding
- **Note**: Both are binary toggle switches in toolbox headers. Should be one `HeaderToggle` component.

---

## CATEGORY M: MODAL / OVERLAY PATTERNS

### 62. VideoManager dialog — custom modal pattern
- **File**: VideoManager.tsx L898
- **Note**: `border-[6px] border-black rounded-2xl shadow-[12px_12px]`. Different from UniversalDataTable modal (`border-[6px] rounded-[48px] shadow-[24px_24px]`).

### 63. VideoManager dropdown — custom dropdown overlay
- **File**: VideoManager.tsx L1067, L1414
- **Note**: 2 completely different dropdown implementations in the same file. First uses `border-[5px] rounded-b-[24px]`, second uses `border-[6px] rounded-2xl`.

---

## CATEGORY N: PROGRESS / LOADING INDICATORS

### 64. Progress bar — only in MediaAnalyzer
- **File**: MediaAnalyzer.tsx L134–138
- **Note**: `bg-gray-200 rounded-2xl h-6 border-[4px] border-black shadow-[4px_4px]` with `bg-[#CCFF00]` fill. No other tool has a progress bar.

### 65. Loading spinner implementations vary
- `Loader2 className="animate-spin"` (SeoGenerator, CommunityPost, CommentResponder, EndScreenTool, ActionableTactics)
- Custom pinging circle (HookGenerator L184)
- Custom `border-2 border-t-transparent rounded-full animate-spin` (SeoGenerator L502, L514)

---

## CATEGORY O: MISCELLANEOUS ONE-OFFS

### 66. `text-white` on SubToolbox header — only CommentResponder
- **File**: CommentResponder.tsx L42 (`textColor="text-white"`)
- **Count**: 1 instance. All other SubToolbox headers use black text.

### 67. `.prose` markdown container styling — 4 variants
- `prose prose-sm max-w-none font-bold text-black/80` (CommunityPost, CommentResponder, EndScreenTool)
- `prose prose-sm max-w-none font-bold text-black/80` + heading overrides (same 3)
- `prose prose-invert prose-sm max-w-none font-medium text-white/80` (SeoGenerator L563)
- `prose max-w-none text-sm font-bold` (ThumbnailStudio L628)

### 68. `custom-scrollbar` class — applied inconsistently
- Used in: CommunityPost, CommentResponder, EndScreenTool (on result panels), ThumbnailStudio (history bar L288)
- NOT used in: MediaAnalyzer results, HookGenerator results, ActionableTactics results

### 69. VideoManager file upload area — unique dashed border with dynamic color
- **File**: VideoManager.tsx L1274
- **Note**: `border-[4px] border-dashed` that changes to `border-[#FF83EA] bg-[#FF83EA]/10` on drag. Only drag-aware upload in the app.

### 70. `hover:-translate-y-1` vs `hover:translate-y-[-4px]` vs `hover:-translate-y-2`
- 3 different hover lift amounts used across cards: -1 (SeoGenerator CopyBox), -4px (ThumbnailStudio history), -2 (ProjectStudio)

### 71. Action button hover: `hover:translate-x-1 hover:translate-y-1` vs `hover:translate-y-0.5` vs `hover:scale-110`
- 3 completely different hover interaction models used on buttons of the same visual weight.

### 72. `mt-6` on generate buttons — only CommunityPost/CommentResponder/EndScreenTool
- **Count**: 3 instances. Other generate buttons use `mt-4` or no margin (handled by parent spacing).

### 73. `h-16` forced height on EndScreenTool input
- **File**: EndScreenTool.tsx L53
- **Count**: 1 instance. Other single-line inputs use `h-12` or auto-height.

### 74. `h-14` fixed height buttons — only SeoGenerator
- **File**: SeoGenerator.tsx L466, L472
- **Count**: 2 instances. Other tools use `p-4`/`p-5` padding instead of fixed height.

### 75. `max-h-[400px]` on result containers
- **Files**: SeoGenerator.tsx (CopyBox L65, ConsolidatedCopyBox L108), CommunityPost/CommentResponder/EndScreenTool result panels
- **Count**: 5 instances. Other result panels have no max-height.

### 76. `font-mono` text — only in SeoGenerator CopyBox
- **File**: SeoGenerator.tsx L67
- **Count**: 1 instance. Every other text display uses system font.

### 77. `italic` on header text — only ThumbnailStudio canvas standby
- **File**: ThumbnailStudio.tsx L497
- **Count**: 1 instance. No other heading in the app uses italic.

### 78. `-rotate-12` decorative rotation
- **File**: VideoManager.tsx L1001
- **Count**: 1 instance. Rotated icon circle, unique decoration.

### 79. `grayscale` filter class
- **File**: ThumbnailStudio.tsx (disabled button L553)
- **Count**: 1 instance. Other disabled states use `opacity-50` only.

### 80. `inset shadow` — `shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]`
- **File**: VideoManager.tsx L1534 (tags display)
- **Count**: 1 instance. Only inset shadow in entire app.

---

## SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| Border width violations | 50+ |
| Shadow offset anomalies | 20+ |
| Border radius exceptions | 20+ |
| Input style variations | 30+ |
| Button pattern variations | 25+ |
| Redundant components | 7 |
| Color anomalies | 15+ |
| Unused standard components | 3 (`StandardInput`, `StandardButton`, `StandardDropdown`) |
| Layout pattern fragments | 5 |

## RECOMMENDED STANDARDIZATION PRIORITIES

1. **Adopt `StandardInput`/`StandardButton`/`StandardDropdown`** across ALL tools — they already exist and are unused
2. **Create `EmptyState` component** — deduplicate 5 identical empty state patterns
3. **Create `HeaderToggle` component** — standardize the binary toggle switches
4. **Lock border widths**: 4px (inner/sub), 5px (outer shell), 6px (modal only)
5. **Lock shadow offsets**: 4px (small), 6px (medium), 8px (large), 12px (hero)
6. **Lock border radii**: `rounded-xl` (12px inner), `rounded-2xl` (16px standard), `rounded-[24px]` (cards), `rounded-[48px]` (modal only)
7. **Standardize textarea heights**: small (h-28), medium (h-40), large (h-56)
8. **Consolidate focus colors** into palette-driven variable or remove entirely
9. **Kill one-off colors**: Map `#FF8AAF`→`#FF7497`, `#00d2ff`→`#00CCFF`, `#C9F830`→`#CCFF00`, `#FCAF57`→`#FFB158`
10. **Adopt `toolboxSystem` layout utilities** in all tools, not just ActionableTactics


---

