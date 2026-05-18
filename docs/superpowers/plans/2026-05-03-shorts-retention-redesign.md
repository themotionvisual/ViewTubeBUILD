# Shorts Retention Widget Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign stats cards and subtitle section of `ShortsRetentionWidgetModule` in `src/components/GraphsPageCharts.tsx` for better balance and footprint.

**Architecture:** Modify the `UnifiedChartModule` or apply direct CSS overrides in `ShortsRetentionWidgetModule` to implement the compact stats and subtitle requirements.

**Tech Stack:** React, CSS, TailwindCSS (for classes)

---

### Task 1: Create Compact Stats Variant in UnifiedChartModule
**Files:**
- Modify: `src/components/UnifiedChartModule.tsx`

- [ ] **Step 1: Update `UnifiedChartModule`**
Add `compact` prop to `UnifiedChartModule` to enable compact mode.

```tsx
interface UnifiedChartModuleProps {
  // ... existing props
  compact?: boolean
}
```

- [ ] **Step 2: Implement styling for compact mode**
In `UnifiedChartModule.tsx`, apply styles when `compact` is true:
- Reduce stats card container padding/height.
- Adjust font sizes for labels/values.
- Apply 8px rounded corners to stats card.

### Task 2: Implement Subtitle Footprint Reduction
**Files:**
- Modify: `src/components/UnifiedChartModule.tsx`

- [ ] **Step 1: Reduce container height**
Reduce container height for title section by 50%.

- [ ] **Step 2: Add truncation and dynamic sizing**
Use `-webkit-line-clamp: 2` and add logic to adjust title font size if it is too long (basic calculation or class-based).

### Task 3: Apply Compact Styles in ShortsRetentionWidgetModule
**Files:**
- Modify: `src/components/GraphsPageCharts.tsx`

- [ ] **Step 1: Update ShortsRetentionWidgetModule to use new props**

Apply `compact` to the `UnifiedChartModule` instance used by `ShortsRetentionWidgetModule`.

### Task 4: Final Validation
- [ ] **Step 1: Verify visual changes**
Check `ShortsRetentionWidgetModule` in browser for 50% height reduction, 8px corners, and 2-line title truncation.

---

### Self-Review
1. Spec coverage: All 5 requirements are covered by the tasks.
2. Placeholder scan: No placeholders.
3. Type consistency: `compact` prop is simple boolean.

Plan complete and saved to `docs/superpowers/plans/2026-05-03-shorts-retention-redesign.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
