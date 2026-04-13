# 🌐 ANALYTICS ECOSYSTEM: SYSTEM SPECIFICATION
*Technical blueprints for the Unified Analytics Nexus tools surrounding the Data Forge.*

Once the `DataProvider` (The Data Forge) successfully ingests, deduplicates, and derives the base data, it feeds exactly 4 core "Tools" within the ViewTube dashboard. This document outlines the architectural logic and UI features required to build them.

---

## 1. THE GLOBAL DATA BRAIN (WorkspaceBrain)
The `WorkspaceBrain` is the state-management heartbeat of the entire app. It ensures that if you select a video in the Data Tables, it updates the visual graphs immediately.

*   **Context Structure:** Use React's `useContext` to distribute `normalizedVideos` across the app without prop-drilling.
*   **Active Selection State:** The Brain must hold an array of `selectedVideoIds`.
*   **Search/Filter State:** The Brain must hold the global `searchQuery` and `dateRange` constraints. All charts and tables must dynamically respect these global filters simultaneously.
*   **Volatility Safety:** Since the dataset can contain $900+$ videos, aggressive `useMemo` hooks must be wrapped around the filtered output before passing it to the charts to prevent frame drops during re-renders.

---

## 2. THE MASTER DATA VAULT (Data Tables / League Engine)
This is not a traditional HTML table; it is a high-speed batching engine explicitly designed to handle up to 1,000 video rows instantly.

*   **Neo-Brutalist Confinement:** The table container must have `max-height: 500px` with `overflow-y: auto`. This prevents DOM expansion and keeps the dashboard compact.
*   **Sticky Headers:** The `<th>` headers (`position: sticky`, `top: 0`) must remain visible while parsing through data.
*   **Performance Default:** On load, sort the table strictly by **Highest RPM (Descending)**, visually capped at the Top 50 or 100 rows.
*   **"Search-Aware" Interactions:** The `[Select All]` / `[Unselect All]` buttons must respect the Global Brain's search state. If a user types "Napoleon" into the search bar, clicking "Select All" must *only* add the visible Napoleon videos to the `selectedVideoIds` array, rather than all 900+ items.
*   **Momentum Indicators:** Attach miniature visual cues (e.g., ↗️ or ↘️) directly inside the row data so creators can gauge metric velocity without needing to build a chart for it.

---

## 3. CHANNELYTICS (The Command Center)
This module translates the raw numbers provided by the Global Brain into instantaneous, color-coded situational awareness for the channel. It does not look like a traditional analytics screen; it looks like a threat-monitoring dashboard.

*   **Retention Quality Score (0-100 Scale):** Build a mathematical formula combining `Retention %`, `CTR %`, and `RPM`. Return a color badge:
    *   `>80` = 🟢 Excellent (Replicate this format)
    *   `<40` = 🔴 Critical (Format failing)
*   **Duration Sweet Spot Analyzer:** Group the videos strictly by duration buckets (`0-3m`, `3-6m`, `6-10m+`). Find the bucket with the highest average views and display it as an alert (e.g., *"Your sweet spot is 6-10m"*).
*   **Topical Cluster "Surge" Detector:** Code a function that checks if 3+ videos published within 7 days share the exact same `contentArchetype` or title keywords. If yes, and if traffic spikes >20%, flash a "Cluster Surge Detected" alert to encourage series formatting.
*   **Revenue Dependency (Concentration Risk):** Feed the revenue metrics into a Pie Chart tracking the Top 3 videos versus the rest of the catalog. If the Top 3 generate $>50\%$ of the revenue, display a massive 🔴 **High Risk** warning.

---

## 4. THE ANALYSIS ORACLE (Report Lab)
An AI-integrated synthesis engine that consumes the active `selectedVideoIds` from the Global Data Brain and interfaces with `gemini.ts` to output actionable, mercilessly honest text feedback.

*   **The 5-Pillar Report Mandate:** The frontend must enforce that the AI (`INSIGHT_MASTER_PROMPT`) always returns data in exactly 5 sections:
    1.  *Channel Pulse* (Executive Summary)
    2.  *Green Flags* (Doubling down)
    3.  *Red Flags* (Weakness Audit)
    4.  *Tactical Mandates* (Prioritized 30-day To-Do list)
    5.  *Hidden Stories* (Combinatorial insights)
*   **First Minute Retention Proxy (Weak Hook Flag):** Since the API limits minute-by-minute retention curves, the Oracle must algorithmically proxy it: Any video with an overall `adjustedAVP` $< 15\%$ is automatically flagged by the frontend as having a "Weak Hook," and the Oracle must explicitly generate a new intro script for it.
*   **Specialized Matrices UI:** The Oracle module renders its own exclusive combination charts rather than universal charts. Most critically, the **Honesty Scale** (a scatter plot of `CTR` vs `AVP (capped at 200%)`). If a video falls in the "Clickbait Trap" quadrant (high CTR, low AVP), the Oracle actively scolds the packaging strategy.
