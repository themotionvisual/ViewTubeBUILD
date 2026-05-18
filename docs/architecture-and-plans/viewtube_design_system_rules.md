# ViewTube Neo-Brutalist Design System

This document serves as the definitive reference and universal rulebook for the ViewTube interface. It standardizes the neo-brutalist aesthetics, structural rhythm, and component behavior across the entire ecosystem. 

All future UI development, refactoring, and code scaffolding must adhere strictly to these principles.

---

## 1. The Core Hierarchy

The ViewTube interface is built on a strict, deeply nested hierarchy. You must adhere to the correct naming conventions and structural nesting.

### A. Toolbox (Level 0)
- **Role:** The outermost, often invisible bounding context.
- **Rules:** 
  - Main Toolbox content uses an **inner margin of 0**. The structural grid assumes total ownership of spacing.
  - Do not apply ad-hoc padding to the Toolbox container if it interferes with the grid's mathematical rhythm.

### B. Grid System (Level 1)
- **Role:** The structural rhythm governing responsiveness and layout.
- **Rhythm Rules (Spacing Hierarchy):**
  - **Outer Scaffold Rhythm:** Base structural rhythm consists of **24px Gaps** and **24px Internal Grid Padding**.
  - **SubToolbox Default (Inside):** `12px` gaps and `12px` padding (half-scale to preserve outer hierarchy).
  - **Dense Data Zones:** `8px` gaps and `6px` padding (for data-heavy layouts to preserve readability).
  - All widgets are assigned discrete "unit buckets" (`s-full`, `s-half`, `s-third`, `s-quarter`).
  - **No clipping:** A component should NEVER cut off contained elements with `overflow: hidden` to force a grid fit. If content exceeds a unit bucket, the module is designed to expand/open to the next mathematical level.

### C. SubToolbox (Level 2)
- **Role:** The primary container for any discrete feature, module, or widget (e.g., *Data Edit*, *Revenue AI*, *Channel Overview*).
- **Sub-Primitives:**
  - **Header (`.wh`):** The colored semantic bar.
  - **Body (`.wb`):** The contained functional UI.
  - **Icon Rail (`.ir`):** The left-aligned icon housing.

---

## 2. Mathematical Rhythm & Ratio Map

Grid logic and synchronized vertical math is the heart of the ViewTube aesthetic. Overriding these dimensions breaks the UI rhythm.

- **Closed SubToolbox:** Exactly `60px` total height. This must be structurally **inclusive** of strokes (`box-sizing: border-box`), meaning content + padding + borders total exactly 60px. Strokes are drawn structurally inward to prevent cumulative 1px drift.
- **Standard Vertical Rhythm (2 Rows):** `60px` (Row 1) + `60px` (Row 2) + `24px` (Gap) = **`144px`** tall.
- **Compact Slider Sync:** Three compact slider rows must map perfectly to the same `144px` rhythm.
- **Canvas Auto-Sync:** Canvas modules should utilize `flex-1` with `min-height: 0` to enable automatic column syncing.
- **Anti-Pattern:** AVOID fixed `min-height` values that block or disrupt synchronized vertical math mechanics.

---

## 3. Style Tokens & Neo-Brutalism

The recognizable stark, premium feel comes from disciplined application of stroke weights, shadows, and flat vibrant colors.

### A. Stroke Weights (The 4-3-2 Rule)
Strict hierarchical enforcement of Borders (`border: Xpx solid var(--text-main)`):
- **Level 1 (SubToolbox Outer Shells):** `4px` maximum stroke.
- **Level 2 (First-Level Internals):** `3px` maximum stroke (e.g., Dropdown toggles, top-level `.wb` cards).
- **Level 3 (Deeply Nested Internals):** `2px` maximum stroke (e.g., mini-tags, metric cards).

### B. Geometry & Shadows
- **Shadow Offset:** Fixed at `6px 6px 0 0 rgba(...)`. SubToolboxes cast solid shadows.
- **Corner Radii:** Universal outer module radius is `16px`. Deeply nested elements scale radii mathematically down (e.g., `8px` or `4px` depending on size calculation).
- **Anti-Pattern:** Do NOT add one-off corner/size overrides for SubToolbox-sized controls. Extend the shared shell/rail primitives instead.

### C. Color Palette
Use only the foundational vibrant palette. Do not mix shades or add opacity layers unless modifying grid lines.
- Base: `#C9F830` (Neon), `#FF00F5` (Pink), `#00F0FF` (Cyan), `#00FF41` (Green), `#FFB570` (Orange).
- Backgrounds: Hard `#ffffff` for widgets, `#f5f5f5` for the canvas/app background.
- Typography/Strokes: `#000000`.

### D. Typography Ratios
Typography strictly locks to the mathematical scaling rhythm to ensure density control.
- **SubToolbox Header Title:** `24px`
- **Body Primary Labels:** `16px`
- **Body Secondary/Meta Labels:** `12px`
- **Micro Labels / Tag Chips:** `10px` (Only to be used when mathematically space-constrained).

---

## 4. SubToolbox & Module Mechanics

Interactive modules must follow explicit rules for consistency and visual stability.

- **Icon Rails:** All SubToolbox-sized controls use one SHARED left icon-section primitive. This must maintain the *same width*, *same stroke divider*, and *full-height geometry* as the rest of the SubToolbox.
- **Motion Tokens:** Control shells must exclusively reuse the canonical SubToolbox motion tokens: `60px` height target, `4px` strokes, `16px` radius, and `600ms` timing for state changes.
- **Collapse Mechanics:** Dropdown collapses must rely exclusively on SubToolbox grid-row mechanics (`grid-template-rows: 0fr -> 1fr`). 
  - **CRITICAL:** Do NOT use fade or scale animation paths for collapses.
- **Dropdown Labels:** Form labels must stay firmly embedded *inside* their controls so that grid alignment stays locked and flush.
- **Demo Content:** SubToolbox demo data or internal content must not be artificially clipped. Always expand `.wb` to fit data cleanly.

---

## 5. Chart & Data Visualization Directives

Data visualization forms the backbone of the dashboard and Research Lab.

- **Responsive Spanning:** Chart cards have permission to span `full`, `half`, or `third` unit widths depending strictly on *data density* and *readability*.
- **Grid Lines:** Chart catalogs and spec pages must NEVER use dashed or dotted grid/cursor lines. 
  - **Rule:** Use low-opacity solid lines only (e.g., `opacity: 0.1`).
- **Rendering Integrity:** Chart primitives must render explicitly from canonical adapter outputs only. They must feature deterministic graphical fallbacks when layout dimensions restrict data rendering.
