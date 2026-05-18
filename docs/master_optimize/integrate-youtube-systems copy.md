# YouTube Systems Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate various YouTube API systems (Comments, Uploads, Search, Reporting) from the `api-samples-master` directory into the ViewTubeX platform to enable real-world creator workflows.

**Architecture:** Extend the existing `YouTubeApiClient` and `youtubeDataFetcher` with new methods based on the API samples, then update the UI components (`CommentResponder`, `IntegratedRemotionEditor`, `ResearchLabCharts`) to utilize these new capabilities.

**Tech Stack:** TypeScript, React, YouTube Data API v3, YouTube Analytics API v2, YouTube Reporting API.

---

### Task 1: Extend YouTubeApiClient with Comments and Search

**Files:**
- Modify: `src/services/youtube/youtubeApiClient.ts`
- Test: `src/services/youtube/__tests__/youtubeApiClient.test.ts`

- [ ] **Step 1: Add fetchCommentThreads and searchVideos methods**

```typescript
// Add to YouTubeApiClient class
public async fetchCommentThreads(options: { videoId?: string; allThreads?: boolean } = {}) {
  const params = new URLSearchParams({
    part: "snippet,replies",
    maxResults: "50",
  });
  if (options.videoId) params.append("videoId", options.videoId);
  else if (options.allThreads) params.append("allThreadsRelatedToChannelId", "");
  
  return this.requestYouTube(`/commentThreads?${params.toString()}`);
}

public async searchVideos(query: string, options: { location?: string; locationRadius?: string } = {}) {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "25",
  });
  if (options.location) params.append("location", options.location);
  if (options.locationRadius) params.append("locationRadius", options.locationRadius);
  
  return this.requestYouTube(`/search?${params.toString()}`);
}
```

- [ ] **Step 2: Add insertComment method**

```typescript
public async insertComment(parentId: string, text: string) {
  return this.requestYouTube("/comments?part=snippet", {
    method: "POST",
    body: JSON.stringify({
      snippet: {
        parentId: parentId,
        textOriginal: text
      }
    })
  });
}
```

- [ ] **Step 3: Run existing tests to ensure no regressions**
Run: `npm test src/services/youtube/youtubeApiClient.test.ts`
Expected: PASS

---

### Task 2: Integrate Comment Fetching into CommentResponder

**Files:**
- Modify: `src/components/CommentResponder.tsx`

- [ ] **Step 1: Add "Fetch Recent Comments" functionality**
Add a button and state to fetch real comments using `youtubeApiClient.fetchCommentThreads()`.

- [ ] **Step 2: Map fetched comments to the textarea or a new selection list**
Allow users to pick a comment to reply to, which then populates the context for Gemini.

---

### Task 3: Implement Video Upload Service

**Files:**
- Create: `src/services/youtube/youtubeUploadService.ts`
- Modify: `src/services/youtube/youtubeApiClient.ts`

- [ ] **Step 1: Create a resumable upload handler**
Implement the resumable upload flow as seen in `api-samples-master/javascript/cors_upload.js`.

- [ ] **Step 2: Add uploadVideo method to YouTubeApiClient**

---

### Task 4: Integrate YouTube Publishing into Editor

**Files:**
- Modify: `src/editor-ui/IntegratedRemotionEditor.tsx`

- [ ] **Step 1: Add "Publish to YouTube" button in the Export/Render view**
- [ ] **Step 2: Connect the button to the new upload service**
Pass the rendered video blob and metadata (title, description) from the editor state.

---

### Task 5: Integrate YouTube Search into Research Lab

**Files:**
- Modify: `src/components/ResearchLabCharts.tsx`

- [ ] **Step 1: Add a "Competitor Search" section**
- [ ] **Step 2: Implement search with geolocation filters using the new `searchVideos` API**

---

### Task 6: Implement YouTube Reporting API Integration

**Files:**
- Modify: `src/services/youtube/youtubeAnalyticsFetcher.ts`

- [ ] **Step 1: Add methods to manage reporting jobs**
`createReportingJob`, `listReportingJobs`, `getReportDownloadUrl`.

- [ ] **Step 2: Update DataDashboard to offer bulk report downloads**

---
