# YouTube API Chunking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chunk YouTube Analytics API requests into 250-video batches to resolve 400 (Bad Request) URL length errors.

**Architecture:** Split large video ID arrays, execute in parallel batches, and merge results.

**Tech Stack:** TypeScript (Array methods, Promise.all)

---

### Task 1: Implement `chunkArray` Utility

**Files:**
- Create: `src/utils/arrayUtils.ts`

- [ ] **Step 1: Write test for `chunkArray`**

```typescript
import { expect, test } from 'vitest';
import { chunkArray } from './arrayUtils';

test('splits array into chunks of size 2', () => {
  expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/utils/arrayUtils.test.ts`
Expected: FAIL (file/module not found)

- [ ] **Step 3: Implement `chunkArray`**

```typescript
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/utils/arrayUtils.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/arrayUtils.ts src/utils/arrayUtils.test.ts
git commit -m "feat: add chunkArray utility"
```

### Task 2: Refactor `getVideoAnalytics` to use Chunking

**Files:**
- Modify: `src/services/youtube/youtubeAnalyticsFetcher.ts`

- [ ] **Step 1: Write mock test for chunked fetching**

Modify `src/services/youtube/youtubeAnalyticsFetcher.test.ts` (or create if needed). Assume we mock `proxyFetch`.

```typescript
import { vi, test, expect } from 'vitest';
import { getVideoAnalytics } from './youtubeAnalyticsFetcher';

test('chunks video IDs into batches of 250', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ rows: [['v1', 10]] })
  });
  // ... (setup mocks for proxyFetch)
  // Call with 300 IDs
  // Verify mockFetch called twice
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/services/youtube/youtubeAnalyticsFetcher.test.ts`
Expected: FAIL (currently only triggers one request)

- [ ] **Step 3: Update `getVideoAnalytics`**

```typescript
export const getVideoAnalytics = async (
 videoIds: string[],
 startDate: string,
 endDate: string,
) => {
 const chunks = chunkArray(videoIds, 250);
 const results = await Promise.all(chunks.map(async (chunk) => {
    // Call existing single-request logic for chunk
    // ...
 }));
 // Aggregate rows
 return { rows: results.flatMap(r => r.rows || []) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/services/youtube/youtubeAnalyticsFetcher.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/youtube/youtubeAnalyticsFetcher.ts
git commit -m "refactor: chunk getVideoAnalytics into 250-video batches"
```
