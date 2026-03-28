# Reference Studio Rules

## Purpose
Lock the UI/game-control rules and tool contracts so we can iterate style aggressively while preserving structural "bones".

## Non-Negotiable UI Rules
1. Keep the Neo-Brutalist skeleton: heavy borders, explicit depth, block hierarchy.
2. Preserve existing layout topology before style upgrades (header, left rail, main tool containers, accordion sections).
3. Keep tool wrappers standardized: same header rhythm, icon box, action area, open/close behavior.
4. Maintain high-contrast readability in both light and dark modes.
5. Motion must be tactical: hover compression, open/close easing, chart emphasis only.
6. New style packs can alter skin tokens, never core navigation IA.
7. All upgrades must remain responsive on desktop + mobile.

## Token Rules
- Border language: `3px`, `4px`, `5px`, `6px` black strokes by hierarchy.
- Shadow language: hard offset shadow (primary) + optional neon glow (dark mode).
- Accent core: `#00CCFF`, `#CCFF00`, `#FF3399`, `#FFDD00`, `#FFB158`, optional `#B14AED`.
- Typography: heavyweight uppercase for structural labels; lighter support text for metadata.

## Tool Container Contract
Every movable/modular tool shell should support:
- `id`
- `title`
- `icon`
- `headerColor`
- `defaultSize`
- `minSize`
- `isCollapsible`
- `serializeState()`
- `restoreState()`

## Top-Level Tool and Subtool Map
### Overview / Dashboard
- Metric cards
- Realtime views chart
- Traffic Pulse module
- Oracle module

### Strategy
- Projects planner cards
- Workflow/status widgets

### Studio Hub
- SEO Generator
- Thumbnail Studio
- Storyboard Studio
- Content Analyzer
- Hook Generator
- Pre-Launch Priming
- Community Posts
- Comment Responder
- End-Screen Architect

### Shorts Studio
- Shorts creation + optimization modules

### Performance Hub
- Channelytics
- Research Lab
- Analytics chart/table modules

### Vault
- Asset and prompt/archive modules

### System
- Auth panel
- Key vault
- Visual mode controls

### Reference Studio
- Section A/B/C/D/E/G component libraries
- Imported style packs
- Curated best-of component board
- Baseline coverage map

## Curation Rules For Component Library
1. Keep every original section untouched below curation surface.
2. Add curated picks near top only (no destructive replacement).
3. For each category, keep one "best current default" and mark others as alternates.
4. Promote selections only after visual + interaction parity check.
5. Record source for each pick: Reference Studio, imported pack, or external benchmark.

## Data UI Rules (Channelytics + Research Lab)
1. Shared metric names and formatters across all tables/charts.
2. Avoid duplicate logic for parsing/normalization.
3. Dashboard cards must have cache fallbacks for core KPIs.
4. Prefer in-house chart styling over Google chart defaults where feasible.

## Dark Mode Rules
1. No global inversion filter.
2. Keep brutalist structure, shift skin to deep surfaces + neon edge glow.
3. Preserve chart contrast and text legibility first.

## Delivery Rules
- Run build after UI system changes.
- Keep docs and component decisions in sync.
- Ship in small reversible slices.
