# ShortsRetentionChart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `ShortsRetentionChart` to visualize video retention metrics.

**Architecture:** Use `UnifiedChartModule` for consistent aesthetics. Accept `data` prop.

**Tech Stack:** React, TypeScript, TailwindCSS.

---

### Task 1: Create ShortsRetentionChart component

**Files:**
- Create: `/Users/cwb/Downloads/viewtube/viewtubeX/src/components/ShortsRetentionChart.tsx`
- Create (Test): `/Users/cwb/Downloads/viewtube/viewtubeX/src/components/__tests__/ShortsRetentionChart.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from '@testing-library/react';
import { ShortsRetentionChart } from '../ShortsRetentionChart';

test('renders ShortsRetentionChart', () => {
  const { getByTestId } = render(<ShortsRetentionChart data={[]} />);
  expect(getByTestId('shorts-retention-chart')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/__tests__/ShortsRetentionChart.test.tsx`
Expected: FAIL ("ShortsRetentionChart not defined")

- [ ] **Step 3: Write minimal implementation**

```tsx
import React from 'react';

interface ShortsRetentionChartProps {
  data: any[];
}

export const ShortsRetentionChart: React.FC<ShortsRetentionChartProps> = ({ data }) => {
  return <div data-testid="shorts-retention-chart">Shorts Retention Chart</div>;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/__tests__/ShortsRetentionChart.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ShortsRetentionChart.tsx src/components/__tests__/ShortsRetentionChart.test.tsx
git commit -m "feat: implement ShortsRetentionChart"
```
