# YouTube API Chunking Design

**Goal:** Resolve YouTube API 400 (Bad Request) errors by chunking video analytics requests.

**Architecture:**
- `getVideoAnalytics` will now split the input `videoIds` into chunks of 250.
- Each chunk will be executed as a separate request to the YouTube Analytics API.
- Results will be aggregated by concatenating the `rows` property from all successful responses.

**Tech Stack:**
- TypeScript (Array methods for chunking)
- Promise.all (Parallelizing chunked requests)

**Design Sections:**

### 1. Chunking Implementation
We will implement a `chunkArray` utility:
```typescript
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
```

### 2. Aggregator logic
The `getVideoAnalytics` function will:
1. Divide `videoIds` into chunks of 250.
2. For each chunk, call the existing fetching logic.
3. Use `Promise.all` to fetch concurrently.
4. Merge `rows` arrays from all responses.

### 3. Error Handling & Aggregation
If a chunk fails (e.g., 500 error), it will be logged and skipped to allow other chunks to succeed. The result will be a partial dataset rather than a full failure.

---
**Spec self-review:**
- **Placeholder scan:** None.
- **Internal consistency:** Matches requirement (250 items).
- **Scope:** Correct for a single service method refactor.
- **Ambiguity:** Merging logic is defined.
