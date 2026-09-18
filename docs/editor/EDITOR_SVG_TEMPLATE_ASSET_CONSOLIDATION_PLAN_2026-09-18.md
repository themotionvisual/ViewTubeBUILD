# Editor SVG / Template / Background / Asset Consolidation Plan — 2026-09-18

## Authority
- Base branch: `main`
- Main SHA at consolidation start: `08c3627422c02bc41614bafc6ca21e3a8cbacd3b`
- Canonical consolidation branch: `consolidate/editor-svg-template-assets-2026-09-18`
- Rule: never merge stale donor branches wholesale. Port only verified unique behavior onto current main.

## Branch inventory and disposition

### 1. feat/editor-svg-template-library
Status: stale/diverged; original PR #162 already merged.
Historical value:
- Template schema/tokens/registry
- SVG background primitives
- text/graphic/scene/transition packs
- template clip adapter
- template library panel
- template renderer/selectability experiments
Post-merge commits added old mobile ToolDock/PanelSheet/state wiring plus renderer/preview work.
Disposition: DO NOT MERGE. Main already contains the library foundation and newer editor architecture. Salvage only behavior that is still absent after file-level verification.

### 2. feat/editor-template-library-main-aligned
Status: stale/diverged.
Unique intent:
- main-aligned template preview integration
- actual preview dimensions via ResizeObserver
- template clip inspector / element controls
- UI/import cleanup
Disposition: DO NOT MERGE. Use as a donor specification only. Port the missing inspector and measured preview dimensions into current main without replacing current PreviewPane or EditorNavigationPages.

### 3. feat/editor-template-library-main-aligned-v2
Status: stale/diverged.
Unique intent:
- background/pattern catalog registration
- pattern thumbnails
- Transitions category in template browser
- template inspector
- measured preview dimensions
Disposition: MOST VALUABLE DONOR, BUT DO NOT MERGE. Background/pattern registration and renderer are already on main through PR #265. Salvage remaining UI/interaction details only.

### 4. feat/editor-recovery-phases-1-3-2026-09-18 / PR #265
Status: merged to main.
Already recovered:
- TemplateCanvasRenderer
- active template clip preview overlay
- gradient background templates
- SVG pattern templates
- Backgrounds/Patterns browser categories
- current-main-safe timeline adapter work
Disposition: COMPLETE / SOURCE OF TRUTH FOR RECOVERED FEATURES.

### 5. feat/editor-creative-pages and creative-workspaces variants
Status: fully contained by main, 0 unique commits.
Disposition: ARCHIVE/DELETE CANDIDATES after final branch audit. Do not merge.

### 6. editor feature-page / manifestation branches
Status: fully contained by main, 0 unique commits.
Disposition: ARCHIVE/DELETE CANDIDATES after final branch audit. Do not merge.

### 7. projects/content asset-engine branches
Status: separate system. Most are fully contained by main; one stale live-state branch has one older ContentAssetEngine.tsx implementation.
Disposition: EXCLUDE from this editor visual-asset consolidation. Main's ContentAssetEngine is newer and broader.

## Current main baseline
Main already contains:
- editor-design-library catalog and schema
- text templates
- graphic templates
- scene templates
- transition templates
- engagement templates
- editor pack
- expansion pack
- motion graphics
- vertical scenes
- YouTuber openers
- YouTuber utility pack
- premium utility pack
- gradient background templates
- SVG pattern templates
- TemplateCanvasRenderer
- active template rendering in PreviewPane
- Backgrounds/Patterns/Text/Graphics/Scenes template browser categories
- canonical current editor navigation, transform/crop controls, timeline operations and direct manipulation

## Remaining unique work worth consolidating

### A. Template element inspector
Port from aligned branches into current main's existing selection inspector.
Controls:
- text
- fill
- opacity
- x/y
- width/height
- rotation
- font size
Requirements:
- use existing updateClip/history path
- preserve canonical clip transform/crop inspector
- do not mutate shared catalog definitions
- clone/update the clip-owned templateDefinition or canonical templateOverrides

### B. Template element direct selection
TemplateCanvasRenderer already exposes selected/onSelectElement.
Wire this into current editor selection state without creating a second editor state model.
Goal:
- tap text/SVG element in preview
- highlight selected element
- inspector focuses that element
- timeline clip remains the owning selection

### C. Measured preview dimensions
Port only the ResizeObserver behavior from aligned-v2.
Do NOT replace current PreviewPane.
Replace renderPreview({widthPx:0,heightPx:0}) with measured surface dimensions while preserving:
- direct clip manipulation
- pinch scale
- drag
- rotate handle
- split/reset/delete
- template overlay

### D. Template browser completion
Add only missing safe browser behavior:
- Transitions filter/category if desired for template assets
- real SVG pattern thumbnails
- use current editor visual tokens/ink rules
Do not regress current mobile layout or template insertion behavior.

### E. Background/pattern customization
Build on the existing template primitives already in main:
- gradient colors and angle
- radial position
- pattern color/background
- opacity
- scale
- spacing
- stroke width
- rotation
- x/y offset
Persist customization as per-clip template overrides.

### F. Responsive canvas correctness
Normalize element sizing to the measured preview/composition rather than viewport-wide CSS units.
Use template intrinsic coordinates and composition scale for 16:9, 9:16 and 1:1.

## Explicitly rejected merges
Never wholesale-merge:
- feat/editor-svg-template-library
- feat/editor-template-library-main-aligned
- feat/editor-template-library-main-aligned-v2
These branches contain stale versions of ToolDock, PanelBodies, PreviewPane, editorState and navigation files that would remove newer main behavior.

## Safe implementation waves

### Wave 1 — low risk
1. Start from current main.
2. Add measured preview dimensions surgically.
3. Add pattern thumbnail rendering.
4. Add Transitions category only if catalog routing is consistent.
5. Build/typecheck/test.
6. Visual QA portrait + landscape.

### Wave 2 — medium risk
1. Add clip-owned template element inspector.
2. Persist edits through updateClip/history.
3. Verify undo/redo.
4. Verify template duplication does not share mutable object references.
5. QA text and SVG templates.

### Wave 3 — medium/high risk
1. Wire element selection from TemplateCanvasRenderer.
2. Add selected-element focus/highlight.
3. Add drag/resize/rotate for template elements using canonical element coordinates.
4. Verify gestures do not conflict with clip transform gestures.
5. QA all four mobile combinations: portrait phone/9:16, portrait phone/16:9, landscape phone/9:16, landscape phone/16:9.

### Wave 4 — customization
1. Gradient editor.
2. Pattern editor.
3. Per-clip override persistence.
4. Responsive adaptation.
5. Remotion render parity.

## Verification gates before PR merge
- Branch must be 0 behind main immediately before final review.
- No whole-file replacement of current PreviewPane, EditorNavigationPages, PanelBodies, ToolDock or editorState from donor branches.
- `npm run build` passes.
- Relevant unit/tests pass.
- No TypeScript errors in editor-design-library/mobile editor.
- Existing video preview still renders.
- Template clips render at playhead.
- Backgrounds and patterns insert correctly.
- Editing one instance does not mutate another instance or the catalog.
- Undo/redo covers template edits.
- 16:9 and 9:16 preview screenshots checked on portrait and landscape phones.
- Diff reviewed for suspicious large deletions.
- Merge to main only after explicit approval.

## Cleanup after successful merge
After the consolidation PR is merged and verified:
- retain PR #162 and PR #265 as historical records
- delete/archive feat/editor-template-library-main-aligned
- delete/archive feat/editor-template-library-main-aligned-v2
- delete/archive feat/editor-svg-template-library after confirming no unique refs remain
- clean fully-contained creative-workspace/feature-page branches in a separate branch-cleanup pass
