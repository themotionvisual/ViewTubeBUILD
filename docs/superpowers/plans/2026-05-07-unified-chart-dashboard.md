# Unified Chart Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a standalone dashboard component integrating Shorts Retention and Engagement Map charts into the `UnifiedChartModule` system.

**Architecture:** Utilize `Recharts` for data-driven visualization, wrapped in `UnifiedChartModule` for consistent branding and layout. Components will accept data via props, following existing analytics data normalization patterns.

**Tech Stack:** React, TypeScript, Recharts, Tailwind CSS.

---

### Task 1: Create Data Registry & Mocks

**Files:**
- Create: `src/components/UnifiedDashboardData.ts`

- [ ] **Step 1: Define chart data types**

```typescript
export interface ShortsRetentionData {
  timestamp: number;
  retention: number;
}

export interface EngagementData {
  timestamp: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}
```

- [ ] **Step 2: Create mock data for charts**

```typescript
export const MOCK_SHORTS_DATA: ShortsRetentionData[] = [
  { timestamp: 0, retention: 100 },
  { timestamp: 15, retention: 85 },
  { timestamp: 30, retention: 60 },
  { timestamp: 45, retention: 40 },
  { timestamp: 60, retention: 20 },
];

export const MOCK_ENGAGEMENT_DATA: EngagementData[] = [
  { timestamp: 0, views: 0, likes: 0, comments: 0, shares: 0 },
  { timestamp: 1, views: 100, likes: 10, comments: 2, shares: 1 },
  { timestamp: 2, views: 250, likes: 25, comments: 5, shares: 3 },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/components/UnifiedDashboardData.ts
git commit -m "feat: add dashboard data models and mock data"
```

### Task 2: Implement Shorts Retention Chart

**Files:**
- Create: `src/components/ShortsRetentionChart.tsx`

- [ ] **Step 1: Basic component skeleton**

```tsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ShortsRetentionData } from './UnifiedDashboardData';

export const ShortsRetentionChart: React.FC<{ data: ShortsRetentionData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Area type="monotone" dataKey="retention" stroke="#CCFF00" fill="#CCFF00" />
    </AreaChart>
  </ResponsiveContainer>
);
```

- [ ] **Step 2: Add aesthetic styling (Thick lines/Neon)**

```tsx
// Apply className for Tailwind borders and styles matching UnifiedChartModule
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ShortsRetentionChart.tsx
git commit -m "feat: implement ShortsRetentionChart"
```

### Task 3: Implement Engagement Map Chart

**Files:**
- Create: `src/components/EngagementMap.tsx`

- [ ] **Step 1: Basic multi-line component**

```tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { EngagementData } from './UnifiedDashboardData';

export const EngagementMap: React.FC<{ data: EngagementData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Legend />
      <Line type="monotone" dataKey="views" stroke="#00CCFF" />
      <Line type="monotone" dataKey="likes" stroke="#FF7497" />
    </LineChart>
  </ResponsiveContainer>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EngagementMap.tsx
git commit -m "feat: implement EngagementMap"
```

### Task 4: Integrate into Unified Dashboard

**Files:**
- Create: `src/components/UnifiedChartDashboard.tsx`

- [ ] **Step 1: Assemble layout using UnifiedChartModule**

```tsx
import React from 'react';
import { UnifiedChartModule } from './UnifiedChartModule';
import { ShortsRetentionChart } from './ShortsRetentionChart';
import { EngagementMap } from './EngagementMap';
import { MOCK_SHORTS_DATA, MOCK_ENGAGEMENT_DATA } from './UnifiedDashboardData';

export const UnifiedChartDashboard: React.FC = () => (
  <div className="flex flex-col gap-8">
    <UnifiedChartModule title="Shorts Retention" subtitle="Audience drop-off" variant="shorts-retention">
      <ShortsRetentionChart data={MOCK_SHORTS_DATA} />
    </UnifiedChartModule>
    <UnifiedChartModule title="Engagement Map" subtitle="Performance over time">
      <EngagementMap data={MOCK_ENGAGEMENT_DATA} />
    </UnifiedChartModule>
  </div>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UnifiedChartDashboard.tsx
git commit -m "feat: assemble UnifiedChartDashboard"
```
