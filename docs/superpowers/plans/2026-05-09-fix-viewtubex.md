# ViewTubeX Local Startup & Debugging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the compilation errors in the ViewTubeX codebase to ensure the application builds successfully via `tsc` and starts reliably using `vite`.
**Architecture:** The project is a React TypeScript application using Vite. Currently, `tsc -b` fails with 147 type errors. The plan involves systematically fixing these errors file-by-file or component-by-component, prioritizing broken imports, undefined variables, and property mismatch errors.
**Tech Stack:** React, TypeScript, Vite.

---

### Task 1: Fix Missing Variables and Incorrect Function Calls

**Files:**
- Modify: `src/components/GraphsPageCharts.tsx`
- Modify: `src/components/ResearchLabCharts.tsx`
- Modify: `src/components/ProjectStudio.tsx`
- Modify: `src/editor-core/export/editorProjectV3.ts`
- Modify: `src/services/__tests__/analyticsCapabilityMatrix.test.ts`
- Modify: `src/views/performanceHub40/capability.ts`

- [ ] **Step 1: Fix 'width' error in GraphsPageCharts.tsx**
Find line 761 and provide a valid value for `width` (e.g., passing it via props or using `100%`).

- [ ] **Step 2: Fix missing method in ResearchLabCharts.tsx**
On line 43, `searchVideos` does not exist on `youtubeApiClient`. Use the correct method (e.g. `youtubeDataFetcher` methods).

- [ ] **Step 3: Fix `generateProjectStrategy` arguments in ProjectStudio.tsx**
On line 154, pass the correct string representation of `activeProject`.

- [ ] **Step 4: Fix EditorProject imports in editorProjectV3.ts**
Correct the imports on lines 2-6 to point to valid exported members from `../contracts`.

- [ ] **Step 5: Fix SyncDiagnostics mock in analyticsCapabilityMatrix.test.ts**
Ensure the dummy diagnostics object passed to `getVideoMetricRuntimeStatus` satisfies the `SyncDiagnostics` interface (i.e. valid `outcome` strings).

- [ ] **Step 6: Fix possibly null values in capability.ts**
Add null checks for `summary.averages.ctr` (line 20), `avd` (line 30), and `avp` (line 32).

### Task 2: Fix React Component Prop Type Errors

**Files:**
- Modify: `src/components/Toolbox.tsx`
- Modify: `src/components/ToolboxUISystem.tsx`
- Modify: `src/views/dashboard/widgets/DescriptionEditorWidget.tsx`
- Modify: `src/views/dashboard/widgets/FormatClashWidget.tsx`
- Modify: `src/views/dashboard/widgets/GoalsTrackerWidget.tsx`
- Modify: `src/views/dashboard/widgets/KeywordOverlapWidget.tsx`
- Modify: `src/views/dashboard/widgets/PublishMomentumWidget.tsx`
- Modify: `src/views/dashboard/widgets/RetentionSimWidget.tsx`
- Modify: `src/views/dashboard/widgets/RevenueChartWidget.tsx`
- Modify: `src/views/dashboard/widgets/ThumbnailLabWidget.tsx`
- Modify: `src/views/dashboard/widgets/TrafficSourcesWidget.tsx`

- [ ] **Step 1: Fix CustomIcon props in Toolbox.tsx**
Remove the invalid `strokeWidth` property from `<CustomIcon />` usages on lines 147 and 441.

- [ ] **Step 2: Fix options array in ToolboxUISystem.tsx**
Convert string arrays to object arrays for the `options` prop on lines 2054 and 2073: `options={[{label: "Option 1", value: "opt1"}, {label: "Option 2", value: "opt2"}]}`.

- [ ] **Step 3: Remove duplicate object properties in Widgets**
Remove the duplicate `onCycleHeight` property in `DescriptionEditorWidget.tsx`, `FormatClashWidget.tsx`, `PublishMomentumWidget.tsx`, `RetentionSimWidget.tsx`, `ThumbnailLabWidget.tsx`, and `TrafficSourcesWidget.tsx`.

- [ ] **Step 4: Remove unused props from Widget Components**
Remove `onDecSize`, `onCycleHeight`, and `onDecHeight` from the destructuring in `GoalsTrackerWidget.tsx` and `KeywordOverlapWidget.tsx`. Remove them from state object definitions in `RevenueChartWidget.tsx`, `TrafficSourcesWidget.tsx`, and `PublishMomentumWidget.tsx`.

### Task 3: Fix Recharts and Global Context Type Errors

**Files:**
- Modify: `src/context/GlobalDataContext.tsx`
- Modify: `src/views/PerformanceHub.tsx`
- Modify: `vite.config.ts`

- [ ] **Step 1: Fix GlobalDataContext Context Type**
Remove `syncBatch` from the context value objects on lines 299 and 662, as it does not exist on `GlobalDataContextProps`.

- [ ] **Step 2: Fix PerformanceHub Context Usage**
Remove the extraction of `syncBatch` on line 740.

- [ ] **Step 3: Fix PerformanceHub Recharts Types**
Fix the `onMouseMove` typing (line 4028) and `labelFormatter` typing (line 4048) to align with Recharts' internal types.

- [ ] **Step 4: Fix vite.config.ts Vite/Vitest typings**
Update the `test` property to be recognized, either by adding `/// <reference types="vitest" />` or removing the block if not running vitest currently.

- [ ] **Step 5: Run Build and Verify**
Run `npm run build` to verify all type errors are cleared. If successful, confirm the dev server is running on `http://localhost:5173`.
