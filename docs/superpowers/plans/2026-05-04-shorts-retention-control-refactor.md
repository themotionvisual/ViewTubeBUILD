# Shorts Retention Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the top-right control section in `ShortsRetentionWidgetModule` to improve visual hierarchy and match neo-brutalist design guidelines.

**Architecture:** Modifying `src/components/GraphsPageCharts.tsx` to update the JSX structure of the `controls` property of `UnifiedChartModule`.

**Tech Stack:** React, TypeScript, TailwindCSS.

---

### Task 1: Update ShortsRetentionWidgetModule Controls UI

**Files:**
- Modify: `src/components/GraphsPageCharts.tsx:590-625`

- [ ] **Step 1: Locate the `controls` div in `ShortsRetentionWidgetModule`**

- [ ] **Step 2: Update JSX structure for vertical alignment**

Change structure to:
```tsx
<div ref={modeMenuRef} className="relative w-[144px] bg-black text-[#CCFF00] border-[2px] border-black rounded-[8px] p-2 flex flex-col items-center gap-0">
  <span className="text-[32px] font-[1000] leading-none">{cd.points.length}</span>
  <button
    type="button"
    onClick={() => setModeMenuOpen((prev) => !prev)}
    className="w-full mt-1 mb-1 px-2 py-1 bg-white text-black border-[2px] border-black rounded-[4px] text-[10px] font-black uppercase tracking-[0.08em] inline-flex items-center justify-center gap-1 transition-colors duration-200 hover:bg-[#EEF7FF]">
    <span className="truncate">{mode === "most-recent" ? "Recent" : "Top"}</span>
    <span className={`text-[8px] transition-transform duration-200 ${modeMenuOpen ? "rotate-180" : ""}`}>▼</span>
  </button>
  <span className="text-[12px] font-black uppercase tracking-[0.12em]">VIDEOS</span>
  {/* Menu remains unchanged */}
</div>
```

- [ ] **Step 3: Commit changes**

```bash
git add src/components/GraphsPageCharts.tsx
git commit -m "refactor(ui): update shorts retention control layout"
```
