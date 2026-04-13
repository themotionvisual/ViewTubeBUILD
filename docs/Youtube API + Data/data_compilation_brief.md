# 🛠️ DATA FORGE: INGESTION & COMPILATION BRIEF
*Technical specifications for feeding data into the Unified Analytics Nexus.*

To build the architecture that powers the ViewTube Google API charts, the backend data layer must be flawlessly normalized. This document contains everything you need to know to construct the data ingestion engine.

---

## 1. THE DUAL-INTAKE SYSTEM
The dashboard must accept data from two sources simultaneously without corrupting the state:
*   **API Ingestion:** Real-time data from the YouTube Analytics API (dispatched via `yt_analytics_synced` events).
*   **CSV Fallback:** Historical data imported via CSV (Table Data exports & Time-Series exports).

### The Stale Data Fallback Rule
Because API quotas are strict, the data manager must cache the last successful payload in `localStorage` under `yt_analytics_cache`. If the API fails or rate-limits, the dashboard **must fall back to the cache instantaneously** rather than blanking out the screen.

---

## 2. THE DEDUPLICATION ALGORITHM (Crucial)
YouTube CSV exports frequently contain overlapping date ranges and duplicate rows. If not deduplicated, view counts will artificially inflate.

**The Logic:**
1.  Establish a composite key: `(videoId + date)`.
2.  Route all incoming rows through a `Map()`.
3.  If `(videoId + date)` already exists in the Map, **keep the version with the highest `views` count** (YouTube sometimes retroactively increases historical views, so the highest number is the most accurate).

---

## 3. REQUIRED CALCULATED METRICS (Derived Fields)
The raw API/CSV data is insufficient to power the Ultimate Suite charts. The data normalizer (`dataNormalization.ts`) must automatically inject these derived fields into every video object during the ingestion loop:

*   **`contentArchetype`:** Auto-classify the video based on duration and title. 
    *   *Rules:* If `< 180s* -> `Short-Form`. If `> 1200s` -> `Long-Form Documentary`. If title contains "Types of" or "Ways" -> `Explainer/List`.
*   **`titleLength`:** An integer count of characters in the `Video title` (Required for the Title Power Curve chart).
*   **`engagementRate`:** `((likes + comments + shares) / totalViews) * 100`. 
    *   *Bug Fix Rule:* You MUST use `Math.max(0, rate)` to prevent negative percentages and protect against division by zero if views are 0.
*   **`subscriberConversionRate`:** `(subscribersGained / totalViews) * 1000` (Subs per 1k views). Must map strictly to `totalViews`, not `engagedViews`.
*   **`adjustedAVP`:** The Average Percentage Viewed metric. 
    *   *Bug Fix Rule:* You MUST cap this at `200%` (e.g., `Math.min(val, 200)`). The API occasionally returns massive glitch percentages (like 1000%) which destroys scatter chart scales.

---

## 4. GLOBAL STATE (WorkspaceBrain)
Instead of each component fetching data, the parsed, deduplicated, and enriched array (`normalizedVideos`) must be hoisted into a global React Context (`<DataProvider>` / `WorkspaceBrain`).

### Delivery Requirements:
*   **Shorts vs. Longform Differentiation:** The global state must strictly identify Shorts vs. Longform (using the `Duration` field) so the charts can universally color-code them (🔴 Shorts vs. 🔵 Longform).
*   **Null-Safety:** The dataset must handle nulls cleanly. (e.g., `const totalViews = video.views || 0`).

---

**Summary for the Agent:** 
*Build a centralized `DataProvider` that listens for `yt_analytics_synced`, merges it safely with CSV uploads using `videoId+date` deduplication, derives the required fields (like `contentArchetype` and capped `adjustedAVP`), and distributes a clean, normalized tree to the ViewTube UI components.*
