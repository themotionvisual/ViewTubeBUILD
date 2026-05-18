# Shorts Retention Module Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the UI redesign of the Shorts Retention Module as per the approved spec.

**Architecture:** Modifying `src/components/GraphsPageCharts.tsx` CSS and component structure, integrating a marquee-styled insight footer.

**Tech Stack:** React, Tailwind (where applicable), Vanilla CSS.

---

### Task 1: Refactor Top-Right Control Section

**Files:**
- Modify: `src/components/GraphsPageCharts.tsx`

- [ ] **Step 1: Locate `ShortsRetentionWidgetModule` component control block**
- [ ] **Step 2: Reformat 100/label layout**
  Change the control block structure to display "100" at the top, selected mode centered below, and "VIDEOS" in large bold text at the bottom.
- [ ] **Step 3: Update CSS**
  Adjust classes for typography sizing and centering.

### Task 2: Redesign Stats Cards & Subtitle Section

**Files:**
- Modify: `src/components/GraphsPageCharts.tsx`

- [ ] **Step 1: Reduce container size**
  Update wrapper styles for stats cards to 50% width and height.
- [ ] **Step 2: Update typography**
  Increase title font size and decrease value font size to align vertically.
- [ ] **Step 3: Resize subtitle section**
  Reduce the container height for the video subtitle section by 50%.
- [ ] **Step 4: Implement text resizing logic**
  Add logic to truncate video titles to 2 lines and adjust font size dynamically based on available width.

### Task 3: Implement Marquee Footer

**Files:**
- Modify: `src/components/GraphsPageCharts.tsx`

- [ ] **Step 1: Add marquee CSS**
  Add the marquee animation (`@keyframes marquee`) and base classes (`marquee`, `marquee-track`, `marquee-item`) from the infra spec to the chart's style block.
- [ ] **Step 2: Replace static insight footer**
  Replace the existing static insight buttons/text with the new marquee component showing `shortsInsight`.

### Task 4: Layout Cleanup

**Files:**
- Modify: `src/components/GraphsPageCharts.tsx`

- [ ] **Step 1: Adjust padding/margins**
  Tighten inner padding and module margins to maximize container utilization.
- [ ] **Step 2: Center labels**
  Update label CSS for central alignment.
- [ ] **Step 3: Clean up bottom-left corner**
  Modify the corner SVG/markup to remove extra lines and set to a single zero with a rounded corner.
- [ ] **Step 4: Commit**
  `git add src/components/GraphsPageCharts.tsx`
  `git commit -m "feat: redesign shorts retention module layout"`
---

**Plan complete and saved to `docs/superpowers/plans/2026-05-06-shorts-retention-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
