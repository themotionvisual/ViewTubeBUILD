# implementation_plan.md - Consolidated

> [!NOTE]
> This file consolidates 51 version(s) from different conversations.
> Latest version appears at the bottom.

---

## Version 1 (from 1be25b8b-7afe-4428-8b5a-789220c8432f)


This document outlines the planned aesthetic changes and the massive expansion of the chart collection with 10 new advanced visualizations.

## User Review Required
> [!IMPORTANT]
> I am adding 10 new charts to the bottom of the Research Lab. These will introduce entirely new visual styles (Maps, Heatmaps, Funnels, Box Plots). Please ensure your CSV data contains the relevant columns (e.g., Country for Maps, Publish Time for Heatmaps).

## Proposed Changes

### ResearchLab.tsx

#### 1. Technical Data Mapping ([getChartData](file:///Users/cwb/Downloads/xxx-opy-of-ustube-x%283%29%20copy/views/ResearchLab.tsx#51-197))
Add 10 new logic branches to handle the following:
- **Geo CPM**: Map `Country` name to `CPM/Revenue`.
- **Momentum Heatmap**: Group views by `DayOfWeek` and `HourOfDay` into a 24x7 grid.
- **Retention Funnel**: Waterfall data for `Views -> Shown -> Clicks`.
- **Series Consistency**: Box Plot mapping for categorized view spreads.
- **Seasonal RPM**: Monthly RPM radar points.
- **Algorithm Matrix**: Multi-axis sync for Impressions/CTR/Views.
- **OS Revenue**: Dual-ring donut for OS demographics.
- **Shelf Life**: Normalized timeline starting at `T=0`.
- **Golden Ratio**: Radar benchmark overlay.

#### 2. Chart Component Expansion
- **Google GeoChart**: Integrate `chartType="GeoChart"` for world-map visuals.
- **Google Candlestick**: Adapt for the Box Plot consistency visualization.
- **Custom Heatmap**: Create a grid-based component for the post-time momentum matrix.
- **Custom Funnel**: Build a styled SVG funnel for end-screen conversion tracking.

#### 3. UX/UI Refinements
- Ensure all new charts follow the "Pop Dashboard" aesthetic with thick borders and bold typography.
- Maintain the footer sorting control logic where applicable.

## Verification Plan

### Automated Verification
1.  Run the Vite dev server.
2.  Use the browser subagent to scroll to the bottom of the and verify all 10 new charts render without console errors.

### Manual Verification
1.  Verify the interactivity of the new GeoChart (hovering over countries).
2.  Check the labels and tooltips on the Funnel and Heatmap for accuracy.


---

## Version 2 (from 1be25b8b-7afe-4428-8b5a-789220c8432f)


This document outlines the planned aesthetic changes to match the user's reference design.

## User Review Required
> [!IMPORTANT]
> Please review the planned adjustments to the layout strings and styles to ensure they match "Picture two" from your request. Once approved, I will immediately execute them.

## Proposed Changes

### ResearchLab.tsx
The [StationCard](file:///Users/cwb/Downloads/xxx-opy-of-ustube-x%283%29/views/ResearchLab.tsx#477-837) component styles will be updated:

1. **Header Layout (Thinner and Shorter)**:
   - Decrease header `min-h` from `64px` down to `56px` (`h-14`) or `52px` to compress vertical space.
   - Adjust padding around the `h4` and `span` to securely fit the title and subtitle tightly on the left.
2. **Expand Control (Smaller and Floating)**:
   - Change the button block back to a smaller floating square: `w-9 h-9` or `w-8 h-8`.
   - Remove the `rounded-tr-2xl` matching edge. Instead, use `rounded-md border-3 border-black` with an equal margin/padding to center it vertically within the header's right corner.
3. **Card Borders (Thicker and Darker)**:
   - Upgrade the main `.pop-box` container border from `border-4` to `border-[5px]`. 
   - Ensure the delineating lines underneath the header and legend bar are equally thick `border-b-[5px]` for absolute consistency.
4. **Data Legend Enhancement**:
   - The large stat located on the right of the white bar will have a contextual label prepended beneath or beside it (e.g., "SCORE" or dynamic labels if found).
   - Increase text sizes for labels to `text-[16px]` or `text-[17px]` and enforce `font-black`.
5. **Chart Styling**:
   - For all Scatter and Bubble charts, update the Google Charts `options` properties (`hAxis.textStyle` and `vAxis.textStyle`) to have `bold: true` and a higher `fontSize: 12`.

## Verification Plan

### Manual Verification
1. Open the UI preview in the terminal.
2. Compare the dimensions of the header, the floating expand button, the border thicknesses, and the label sizes to the attached image.


---

## Version 3 (from 1be25b8b-7afe-4428-8b5a-789220c8432f)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Updated the implementation plan for the 10 new advanced analytics carts. Added detailed technical requirements for each of the new visualizations, focusing on their unique data mapping and visual styles. Marking the planning phase as complete.
- updatedAt: 2026-03-21T00:44:03.120375Z
- version: 1


This document outlines the planned aesthetic changes and the massive expansion of the chart collection with 10 new advanced visualizations.

## User Review Required
> [!IMPORTANT]
> I am adding 10 new charts to the bottom of the Research Lab. These will introduce entirely new visual styles (Maps, Heatmaps, Funnels, Box Plots). Please ensure your CSV data contains the relevant columns (e.g., Country for Maps, Publish Time for Heatmaps).

## Proposed Changes

### ResearchLab.tsx

#### 1. Technical Data Mapping (`getChartData`)
Add 10 new logic branches to handle the following:
- **Geo CPM**: Map `Country` name to `CPM/Revenue`.
- **Momentum Heatmap**: Group views by `DayOfWeek` and `HourOfDay` into a 24x7 grid.
- **Retention Funnel**: Waterfall data for `Views -> Shown -> Clicks`.
- **Series Consistency**: Box Plot mapping for categorized view spreads.
- **Seasonal RPM**: Monthly RPM radar points.
- **Algorithm Matrix**: Multi-axis sync for Impressions/CTR/Views.
- **OS Revenue**: Dual-ring donut for OS demographics.
- **Shelf Life**: Normalized timeline starting at `T=0`.
- **Golden Ratio**: Radar benchmark overlay.

#### 2. Chart Component Expansion
- **Google GeoChart**: Integrate `chartType="GeoChart"` for world-map visuals.
- **Google Candlestick**: Adapt for the Box Plot consistency visualization.
- **Custom Heatmap**: Create a grid-based component for the post-time momentum matrix.
- **Custom Funnel**: Build a styled SVG funnel for end-screen conversion tracking.

#### 3. UX/UI Refinements
- Ensure all new charts follow the "Pop Dashboard" aesthetic with thick borders and bold typography.
- Maintain the footer sorting control logic where applicable.

## Verification Plan

### Automated Verification
1.  Run the Vite dev server.
2.  Use the browser subagent to scroll to the bottom of the and verify all 10 new charts render without console errors.

### Manual Verification
1.  Verify the interactivity of the new GeoChart (hovering over countries).
2.  Check the labels and tooltips on the Funnel and Heatmap for accuracy.


---

## Version 4 (from artifacts)


This plan establishes a rigid, explicitly defined Markdown authoring syntax that perfectly emulates the actual application UX defined in `ToolboxUISystem.tsx`. 

By abandoning complex CSS "auto-boxing" guesses (which crashed the Less compiler and caused your missing padding/checkmarks) and moving to explicit Markdown markers, the entire system will become bulletproof, animated, and interactive.

## Proposed Changes

### 1. Definitive Markdown Syntax (The Rules)

To generate beautiful, accurately spaced documents, you will author markdown using the following strict elements:

#### Major Toolboxes (The Headers)
Standard markdown headers (`#`, `##`, `###`) will be exclusively used to generate the massive, colorful "Major Toolbox" headers. 
- You do NOT put content "between" headers loosely anymore. 
- Headers act as sections. All content gets loaded into **SubToolboxes**.

#### SubToolboxes (Collapsible Accordions)
We will invent a custom Markdown Directive syntax (`:::sub`) that maps to the 60px height collapsible dropdown components in your app.

**Authoring Example:**
```markdown
## 🎯 VISUAL TESTING CHECKLIST

:::sub Functional Analysis
- [ ] Renders without crashes
- [x] State updates trigger re-renders
:::

:::sub Edge Cases & Memory
- [ ] Handles blank data cleanly
:::
```

### 2. Upgrading `parser.js`

I will reprogram your `parser.js` to detect the `:::sub` and `:::` syntax during the exact millisecond you save the file. It will translate these markers into native HTML `<details>` and `<summary>` blocks under the hood. 

This means:
- The subtoolboxes will be **fully interactive**, clicking them will natively slide them open/closed in the preview.
- All markdown inside (like checkboxes and tables) will be natively parsed inside the box!
- The unicode emoji destruction code remains intact to prevent MPE parsing crashes.

### 3. Rebuilding `style.less` (Fixing the Checkboxes and Corners)

The reason your checkboxes lost their corner radius and the blank/X logic didn't work previously is that MPE uses an extremely old `Less 2.x` compiler under the hood! It couldn't understand the modern `:is()` and `:has()` CSS pseudo-commands I used, so it crashed and reverted to an old cached stylesheet.

I will strip all modern CSS macros from `style.less` and rebuild it using ultra-safe standard CSS.
- **`<summary>` Styling:** 60px height, 4px black borders, bright background, custom SVG rail icon, and custom expand/collapse chevrons.
- **`.subtoolbox-payload` Styling:** 32px padding, pure white backgrounds, tight grid rhythm.
- **Checkbox Logic:** The simplified CSS will guarantee `- [ ]` renders as the blank white box with `8px border-radius` and `- [x]` renders as the bold red 'X'.

## User Review Required

> [!IMPORTANT]
> Because you requested a definitive MD writing format, this shifts the authoring responsibility slightly. You will need to explicitly wrap your lists/content in the `:::sub [Title]` blocks to get the beautiful white bounding boxes. Any raw text floating outside a `:::sub` block will just render on the gray app background.
> 
> Does the `:::sub` syntax feel clean enough for your daily authoring workflow?

## Verification Plan

1. Compile and save the new `parser.js` and `style.less`.
2. Convert a section of `VIEWTUBE_WIDGETS_INVENTORY.md` to use the `:::sub` rules.
3. Visually verify the collapsible UI and the corrected Checkbox 8px rendering.


---

## Version 5 (from artifacts)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Implementation plan for reintegrating and bulletproofing the ViewTube Chart Systems, including an independent Mock Data flow and fixes for the Recharts ResponsiveContainer crashes.
- updatedAt: 2026-04-09T19:23:02.376823Z
- version: 1
- requestFeedback: True


**Objective:** Stabilize all charting surfaces across the application to gracefully handle API/token failures (avoiding complete UI lockups or empty arrays) and establish a unified dual-render system. This will allow the user to easily toggle between native UI styles (via Recharts) and legacy Google visuals (via react-google-charts), powered by a dedicated Mock Data Engine for styling experiments.

## User Review Required

> [!CAUTION]
> **Data Fallback Paradigm**
> Currently, when tokens expire, `GlobalDataContext` passes empty datasets downstream, causing chart logic to panic and throw `ResizeObserver` errors (the `width(-1) and height(-1)` crashes). To fix this, I propose injecting a `MockDataEngine` directly into the contexts. If the API fails, the dashboard will seamlessly switch to "Demo Mode" with robust fake data, allowing you to design and refine the UI continuously. Are you comfortable with the app automatically using mock data on API failures, or should we build an explicit "Enable Mock Data" toggle switch in the UI?

> [!WARNING]
> **The `ResponsiveContainer` Crash**
> Recharts crashes violently if its parent div doesn't have an explicit size when the component mounts. Many of these charts are buried inside lazy-loaded tabs (like `/reference-studio/legacy`). To fix this, I will add an explicit mounting delay hook and strict `min-height` wrappers to all `ResponsiveContainer` instances.

---

## Proposed Changes

### Core Data Integrity
To prevent blank screens and 400 Bad Requests from tanking the UI, we'll implement a fallback engine.

#### [NEW] `src/services/MockDataEngine.ts`
- Generates localized, realistic fallback data arrays for all chart types (Trio Pie, Video Value Matrix, Engagement Line, etc.).
- Exposes cleanly typed datasets specifically sculpted to match the exact keys expected by `ResearchLab.tsx` and `SimpleAnalytics.tsx`.

#### [MODIFY] `src/context/GlobalDataContext.tsx`
- Intercepts API failures and empty analytics states.
- If data is empty and the user requests charts, it injects the payload from `MockDataEngine`.
- Adds a `isDemoMode` boolean to the context state so components can visually indicate they are using mock testing data.

<hr/>

### Chart Rendering and Stability
Fixing the structural rendering flaws that trigger exceptions.

#### [MODIFY] `src/components/ChartEngine.tsx`
- Refactor `RenderChart` into a true dual-engine router. It will inspect `chart.provider`.
- If `google`, it routes to the `react-google-charts` wrapper.
- If `native`, it routes to a new standardized Recharts layer using our custom Neo-Brutalist toolkit variables.
- Wrap all Recharts deployments in a strict `Suspense` boundary and `div` with absolute `minHeight` bounds, solving the `ResponsiveContainer` zero-dimension layout crash.

#### [MODIFY] `src/views/PerformanceHub.tsx` & `src/views/SimpleAnalytics.tsx`
- Fix existing `ResponsiveContainer` bounds directly wrapping Recharts components `AreaChart`, `ComposedChart`, etc.
- Add "No Data" Neo-Brutalist fallback skeletons.

<hr/>

### Research Lab Reconnection
Restoring the massive data canvases inside the legacy studio tab.

#### [MODIFY] `src/views/ResearchLab.tsx`
- Disconnect hard-coded API dependencies from throwing undefined errors.
- Bridge the `TrioPieCard`, `Video Value Matrix`, and `Keyword Engine` to explicitly ask for Mock Data if global context is empty.
- Style the chart wrappers (e.g. `isTopPerformersTrio ? "min-h-[660px]" : "h-[500px]"`) to ensure they perfectly frame the `ChartEngine` outputs without scroll clipping.

---

## Open Questions

> [!IMPORTANT]
> 1. **Native UI vs Google UI Toggle:** Should I build a global toggle switch in the Toolbox/Settings that universally switches all charts from `google` to `native`, or should they be hardcoded on a per-chart basis (e.g., GeoCharts are always Google, but LineCharts are always Native)?
> 2. **Mock Data Scope:** Should the mock data reflect "massive viral channel" (millions of views) or "growing channel" (thousands of views) to best fit your UI styling preferences?

## Verification Plan

### Automated/Manual Verification
1. Open the app with empty/invalid YouTube tokens. Verify that the app instantly populates with Mock Data arrays instead of blank screens.
2. Navigate to `/reference-studio/legacy` and open "Research Lab".
3. Validate that `TopPerformersTrio` maps correctly rendering the three large pie diagrams.
4. Resize the browser window rapidly to ensure `ResponsiveContainer` elements scale without dumping `width(-1)` ResizeObserver errors to the console.
5. Click "Neural Sync" and observe smooth state transitions rather than `400 Bad Request` crashing the container.


---

## Version 6 (from artifacts)


**Objective:** Stabilize all charting surfaces across the application to gracefully handle API/token failures (avoiding complete UI lockups or empty arrays) and establish a unified dual-render system. This will allow the user to easily toggle between native UI styles (via Recharts) and legacy Google visuals (via react-google-charts), powered by a dedicated Mock Data Engine for styling experiments.

## User Review Required

> [!CAUTION]
> **Data Fallback Paradigm**
> Currently, when tokens expire, `GlobalDataContext` passes empty datasets downstream, causing chart logic to panic and throw `ResizeObserver` errors (the `width(-1) and height(-1)` crashes). To fix this, I propose injecting a `MockDataEngine` directly into the contexts. If the API fails, the dashboard will seamlessly switch to "Demo Mode" with robust fake data, allowing you to design and refine the UI continuously. Are you comfortable with the app automatically using mock data on API failures, or should we build an explicit "Enable Mock Data" toggle switch in the UI?

> [!WARNING]
> **The `ResponsiveContainer` Crash**
> Recharts crashes violently if its parent div doesn't have an explicit size when the component mounts. Many of these charts are buried inside lazy-loaded tabs (like `/reference-studio/legacy`). To fix this, I will add an explicit mounting delay hook and strict `min-height` wrappers to all `ResponsiveContainer` instances.

---

## Proposed Changes

### Core Data Integrity
To prevent blank screens and 400 Bad Requests from tanking the UI, we'll implement a fallback engine.

#### [NEW] `src/services/MockDataEngine.ts`
- Generates localized, realistic fallback data arrays for all chart types (Trio Pie, Video Value Matrix, Engagement Line, etc.).
- Exposes cleanly typed datasets specifically sculpted to match the exact keys expected by `ResearchLab.tsx` and `SimpleAnalytics.tsx`.

#### [MODIFY] `src/context/GlobalDataContext.tsx`
- Intercepts API failures and empty analytics states.
- If data is empty and the user requests charts, it injects the payload from `MockDataEngine`.
- Adds a `isDemoMode` boolean to the context state so components can visually indicate they are using mock testing data.

<hr/>

### Chart Rendering and Stability
Fixing the structural rendering flaws that trigger exceptions.

#### [MODIFY] `src/components/ChartEngine.tsx`
- Refactor `RenderChart` into a true dual-engine router. It will inspect `chart.provider`.
- If `google`, it routes to the `react-google-charts` wrapper.
- If `native`, it routes to a new standardized Recharts layer using our custom Neo-Brutalist toolkit variables.
- Wrap all Recharts deployments in a strict `Suspense` boundary and `div` with absolute `minHeight` bounds, solving the `ResponsiveContainer` zero-dimension layout crash.

#### [MODIFY] `src/views/PerformanceHub.tsx` & `src/views/SimpleAnalytics.tsx`
- Fix existing `ResponsiveContainer` bounds directly wrapping Recharts components `AreaChart`, `ComposedChart`, etc.
- Add "No Data" Neo-Brutalist fallback skeletons.

<hr/>

### Research Lab Reconnection
Restoring the massive data canvases inside the legacy studio tab.

#### [MODIFY] `src/views/ResearchLab.tsx`
- Disconnect hard-coded API dependencies from throwing undefined errors.
- Bridge the `TrioPieCard`, `Video Value Matrix`, and `Keyword Engine` to explicitly ask for Mock Data if global context is empty.
- Style the chart wrappers (e.g. `isTopPerformersTrio ? "min-h-[660px]" : "h-[500px]"`) to ensure they perfectly frame the `ChartEngine` outputs without scroll clipping.

---

## Open Questions

> [!IMPORTANT]
> 1. **Native UI vs Google UI Toggle:** Should I build a global toggle switch in the Toolbox/Settings that universally switches all charts from `google` to `native`, or should they be hardcoded on a per-chart basis (e.g., GeoCharts are always Google, but LineCharts are always Native)?
> 2. **Mock Data Scope:** Should the mock data reflect "massive viral channel" (millions of views) or "growing channel" (thousands of views) to best fit your UI styling preferences?

## Verification Plan

### Automated/Manual Verification
1. Open the app with empty/invalid YouTube tokens. Verify that the app instantly populates with Mock Data arrays instead of blank screens.
2. Navigate to `/reference-studio/legacy` and open "Research Lab".
3. Validate that `TopPerformersTrio` maps correctly rendering the three large pie diagrams.
4. Resize the browser window rapidly to ensure `ResponsiveContainer` elements scale without dumping `width(-1)` ResizeObserver errors to the console.
5. Click "Neural Sync" and observe smooth state transitions rather than `400 Bad Request` crashing the container.


---

## Version 7 (from artifacts)


Comprehensive pass to fix broken widgets, upgrade stub tools into functional mini-apps, rename misnamed widgets, consolidate redundant ones, and polish UX gaps across the dashboard.

## User Review Required

> [!IMPORTANT]
> **Comment Reply Widget**: The `fetchAllCommentThreads` API call uses `allThreadsRelatedToChannelId=mine` which is invalid — the YouTube API requires an actual channel ID, not `mine`. Fix: resolve channel ID from `data.brain.channelProfile.id` and pass it. This is why "No comments found" appears.

> [!WARNING]
> **Widget Deletion**: Upload Cadence (`upload-cadence`) will be removed from registry and renderer. System Micro Stack + Sync Connection will merge into a single "Settings" widget.

> [!IMPORTANT]
> **Community Post "Refine" button**: Currently uses a fake `setTimeout`. Will be upgraded to call Gemini `generateContent` for actual AI refinement of the user's draft text.

---

## Proposed Changes

### 1. Comment Reply Widget (rename "Community Loop" → "Comment Responder")

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRegistry.ts)
- Change `title: "Community Loop"` → `title: "Comment Responder"` (id stays `comment-replier`)
- Change `subtitle` → `"View, reply & provoke engagement"`

#### [MODIFY] [youtubeDataFetcher.ts](file:///Users/cwb/Downloads/viewtube/src/services/youtube/youtubeDataFetcher.ts)
- Fix `fetchAllCommentThreads`: replace `allThreadsRelatedToChannelId=mine` with resolved channel ID from cache/profile
- Add optional `channelId` parameter so widget can pass it

#### [MODIFY] [CommentReplyWidget.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/widgets/CommentReplyWidget.tsx)
- Pass `data.brain?.channelProfile?.id` to `fetchAllCommentThreads`
- "History" tab: load ALL threads (not just unreplied) with owner replies visible
- Fix `px: "12px"` → `padding: "0 12px"` (invalid CSS-in-JS)
- Show error state if fetch fails instead of silent empty
- Add a count badge showing number of unreplied comments

---

### 2. Community Post Widget — Real AI Refinement

#### [MODIFY] [CommunityPostWidget.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/widgets/CommunityPostWidget.tsx)
- Rename button: `"Prime Algorithm"` → `"Refine Post"`
- When user has content and clicks "Refine Post", call a new Gemini function `refineCommunityPost(content, channelContext, recentVideos)` that actually rewrites the text
- When textarea is empty, keep current behavior (auto-draft from scratch)

#### [MODIFY] [gemini.ts](file:///Users/cwb/Downloads/viewtube/src/services/gemini.ts)
- Add `refineCommunityPost()` function: takes raw draft, channel niche, recent video titles → returns polished post text

---

### 3. Publish Momentum — Clarity & Tooltips

#### [MODIFY] [PublishMomentumWidget.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/widgets/PublishMomentumWidget.tsx)
- Rename header to `"Best Times to Upload"` (clarify purpose)
- Add subtitle: `"Avg views by day & hour — white = worst, blue = best"`
- Add custom tooltip overlay on hover (replace native `title`) showing:
  - Day, time block, avg views value
  - Color-coded to match cell

---

### 4. Tag Generator — Fix Tag Lookup

#### [MODIFY] [TagGeneratorWidget.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/widgets/TagGeneratorWidget.tsx)
- Tags come from `fetchVideoSnippetDetails` (cached in `vt_video_details_cache_v1`) — currently the widget looks at `vid.tags` which is often undefined on canonicalRows
- Fix: on video select, call `fetchVideoSnippetDetails([vidId])` to get real tags from YouTube API if not already cached
- Change "Generate Insights" to actually call Gemini using video title as context

---

### 5. Revenue Tracker — 2 Decimal Places + Tooltip

#### [MODIFY] [RevenueChartWidget.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/widgets/RevenueChartWidget.tsx)
- Fix total display: `.toLocaleString()` → `.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })`
- Add visible tooltip div on bar hover (not just `title` attr) showing `$amount` and `Month Week` date
- Add toggle for "Ad Revenue" vs "Gross Revenue"

---

### 6. Traffic Sources — Bigger Chart + Fix Tooltips + Time Period

#### [MODIFY] [TrafficSourcesWidget.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/widgets/TrafficSourcesWidget.tsx)
- Increase SVG from `75%` → `95%` to fill widget body
- Fix hover: SVG `<title>` doesn't render in all browsers when inside `<path>` — switch to a custom tooltip `<div>` on mouse position
- Add legend row below chart showing source name + percentage
- Add subtitle `"Last 28 Days"` in header

---

### 7. Long vs Short — Show Time Period

#### [MODIFY] [FormatClashWidget.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/widgets/FormatClashWidget.tsx)
- Add subtitle `"All Time"` or `"Last 28 Days"` in header area (whichever matches data scope)

---

### 8. Goals Tracker — Concentric Rings with Category Buttons

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRenderer.tsx) (Goals Tracker section, ~L966-1053)
- Replace current simple goal list with:
  - **4 category buttons**: Subscribers, Views, Revenue, Other (grid layout)
  - Click → text input for target + duration select (1mo/2mo/3mo/6mo)
  - Goals persisted to `localStorage` keyed by category
  - **Concentric SVG rings**: 4 nested circles (Subs outer, Views, Revenue, Other inner)
  - Each ring shows `current / target` as arc fill percentage
  - Current values sourced from `data.statBlocks`

---

### 9. Superfan Card — Use Real Data

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRenderer.tsx) (Superfan section)
- Currently generates fake fan names from video titles — keep this approach but improve labels
- Use actual comment authors from `fetchVideoComments` if available in brain cache
- Fallback gracefully to engagement-based placeholders

---

### 10. Delete Upload Cadence Widget

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRegistry.ts)
- Remove `upload-cadence` entry from `DASHBOARD_WIDGET_REGISTRY`

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRenderer.tsx)
- Remove entire `if (widget.id === "upload-cadence")` block

---

### 11. Combine System Micro Stack + Sync Connection → Settings

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRegistry.ts)
- Remove `sync-connection` entry
- Rename `system-micro-stack` → title `"Settings"`, subtitle `"System, sync & mode controls"`

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRenderer.tsx)
- Merge sync progress bar + toggle switches into single "Settings" widget under `system-micro-stack` id
- Remove standalone `sync-connection` block

---

## Execution Order

| Phase | Items | Risk |
|-------|-------|------|
| 1 | Fix Comment Reply API (`fetchAllCommentThreads`), rename in registry | High — core broken feature |
| 2 | Community Post "Refine" button + Gemini fn | Medium — new API call |
| 3 | Revenue fixes (decimals, tooltips), Traffic Sources (size, tooltips, period) | Low — cosmetic |
| 4 | Tag Generator fix (fetch real tags), Publish Momentum clarity | Low — data path fix |
| 5 | Goals Tracker concentric rings rebuild | Medium — significant UI rewrite |
| 6 | Delete Upload Cadence, merge Settings widgets | Low — removal |
| 7 | Format Clash time period, Superfan real data | Low — labels |

---

## Verification Plan

### Automated Tests
- `tsc --noEmit` to verify type safety after all changes
- Verify no import errors from deleted widgets

### Manual Verification
- Comment Responder: Connect YouTube → verify comments load in "Unreplied" tab → click "Provocative Reply" → verify AI draft → click "Post Reply"
- Community Post: Type text → click "Refine Post" → verify AI rewrites content
- Revenue Chart: Hover bars → verify tooltip shows `$XX.XX (Jan W2)`
- Traffic Sources: Hover pie slice → verify custom tooltip shows source + %
- Goals Tracker: Click "Subscribers" → set target → verify ring appears
- Check no 3-decimal revenue amounts anywhere


---

## Version 8 (from artifacts)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Detailed implementation plan for 10 new, intensely functional mini-tools to be added to the dashboard, including 5 improvement ideas for each widget.
- updatedAt: 2026-04-20T14:15:47.156445Z
- version: 1
- requestFeedback: True


The current ViewTube dashboard establishes the structural shell and analytics foundation. This plan elevates it into an active workstation by deploying **10 powerful, functional mini-tools**—moving beyond reporting and into generation, action execution, and tactical insights.

## User Review Required

> [!IMPORTANT]
> Please review the 10 selected widgets and their proposed 5 improvements below to ensure they align with the trajectory of ViewTube. If these look correct, approve this plan so we can begin coding the integrations to the `WidgetRegistry` and `WidgetRenderer`.

---

## 1. Ask Me Anything AI

**Source:** `docs/Widget Dashboards/ask-me.html`
**Function:** An interactive chat agent tapped into channel metrics and strategy.
**5 Upgrades:**
1. **Contextual Quick-Prompts:** Auto-suggests questions targeting current active widgets (e.g. "Why is RPM down?").
2. **Inline Data Blocks:** AI replies render actual mini-charts or tables directly in the chat, not just raw text.
3. **Execution Commands:** Ability for the AI to alter tags, rename thumbnails, or execute tasks on your behalf.
4. **Knowledge Retention:** Save specific strategic brainstorms to a "Strategy Vault".
5. **Tone Switcher:** Toggle between "Encouraging Coach" and "Brutally Honest Audit".

## 2. Daily Oracle Advice

**Source:** `docs/Widget Dashboards/widget-preview copy.html`
**Function:** Prescriptive daily action items and critical warnings generated by metrics.
**5 Upgrades:**
1. **1-Click Resolutions:** Generates a "Fix It" action button directly under the advice to implement the fix instantly.
2. **"Snooze" Escalation:** If ignored, the warning escalates to a massive "Red Alert" the following day.
3. **Success Tracking:** Records if executing a prior piece of Oracle Advice actually boosted metrics down the line.
4. **Tool Linkage:** Links immediately out to the specific widget required to fix the issue (e.g., Title A/B).
5. **Audio Dictation:** Click to hear the Oracle read out the advice in an intense, robotic directive voice.

## 3. Data Multi-Edit Manager

**Source:** `docs/Widget Dashboards/widget-preview copy.html` (Data Edit module)
**Function:** Bulk editor for video metadata (titles, descriptions, tags, visibility).
**5 Upgrades:**
1. **Find & Replace:** Bulk swap links or outdated sponsor copy across N videos simultaneously.
2. **Regex Injection:** Enable Regex for power users to standardize specific formatting.
3. **Safety Undo History:** Deep rollback support to revert a broken bulk-edit.
4. **Live Analyzers:** Real-time character counts and keyword density maps while typing.
5. **Smart Tag Auto-Injector:** Automatically merges existing successful tags into the bulk payload.

## 4. Title & Thumbnail Validator

**Source:** Extrapolated from HTML mockups/docs
**Function:** Predicts success and scores split-test assets before publishing.
**5 Upgrades:**
1. **Gemini Vision Scoring:** Analyzes the uploaded Thumbnail image for visual hierarchy and contrast.
2. **Squint Test Mode:** Auto-blurs the thumbnail layout to test text legibility instantly.
3. **Aggression Radar Map:** Visualizes Emotion, Punctuation, and Curiosity gaps in the submitted title.
4. **AI Generation:** Auto-writes 5 alt titles based on the user's historical highest-CTR phrasing templates.
5. **A/B Split Simulator:** Simulates hypothetical drop-off trajectories over a 24h period for both targets.

## 5. Creator Burnout Monitor

**Source:** Custom ViewTube Strategy
**Function:** Correlates pacing volatility with mental friction to prevent channel death.
**5 Upgrades:**
1. **Volatility Stress Index:** Measures extreme algorithm swings that cause psychological stress.
2. **Rest Enforcer:** Ability to temporarily "Hide Negative Metrics" for 24 hours to enforce peace of mind.
3. **Plateau Predictor:** Estimates the exact date channel growth will halt if the current intense pace is maintained.
4. **Days-Since-Break Counter:** Gamifies resting alongside production.
5. **Repurpose Recommender:** Suggests low-effort clipping on high-burnout days.

## 6. Hook Optimizer (15-Second Clinic)

**Source:** Custom ViewTube Strategy
**Function:** Breaks down intro scripts for retention optimization.
**5 Upgrades:**
1. **Pacing Visualizer:** Calculates the words/sec tempo to prevent initial lag.
2. **Power Word Heatmap:** Color-codes aggressive, emotional triggers vs. filler fluff.
3. **Competitor X-Ray:** Paste a rival's video link to analyze/steal their hook structure.
4. **Shot-List Generator:** Auto-generates matching B-Roll ideas to align perfectly with the hook's tempo.
5. **Rewrite Modes:** 1-Click to toggle the script between "Curiosity Gap", "Aggressive", or "Story-Driven".

## 7. Sponsor Kit & Rate Calculator

**Source:** Custom ViewTube Strategy
**Function:** Generates pricing logic and media assets for sponsorships.
**5 Upgrades:**
1. **Floating Averages:** Uses rolling 30/90-day views, stripping away viral anomalies for fair pricing.
2. **Niche Modifiers:** Applies multipliers based on the channel's CPM/industry (Tech vs Gaming).
3. **Media Kit PDF:** One-click dynamic generation of a brand-ready PDF pulling live ViewTube stats.
4. **Price Escalation Tracker:** Shows historical rates to signal when it's time to increase your rate.
5. **Gemini Negotiator:** Auto-generates boilerplate counter-offer emails.

## 8. Content Repurposer

**Source:** Custom ViewTube Strategy
**Function:** Identifies long-form pillars and cuts them to Shorts.
**5 Upgrades:**
1. **Retention Peak Locator:** Scans audience analytics to isolate the 3 highest retention spikes.
2. **Evergreen Evaluation:** AI scores the relevance of the specific clip to current trends.
3. **Shorts Script Writer:** Uses the isolated segment text to write a fast-paced vertical hook.
4. **Conversion Tracker:** Tracks metric correlation (do views on this Short funnel into the Long video?).
5. **3-Week Calendar Pipeline:** Spits out a tactical release schedule for the spawned clips.

## 9. Competitor Radar

**Source:** General Web Mockups
**Function:** Monitors peer channels for breakout successes.
**5 Upgrades:**
1. **Outlier Alerts:** Dings heavily when a peer pushes a 10/10 viral anomaly.
2. **Tag Overlay:** Cross-references their hidden tags against your unused SEO list.
3. **Color Wheel Sniffer:** Analyzes their recent thumbnails to find visual blindspots (e.g., "everyone uses red, use blue").
4. **David vs Goliath:** Specifically spotlights micro-channels stealing market share in your niche.
5. **Cadence Tracker:** Maps their upload velocity against yours.

## 10. Algorithm Architect / Content DNA

**Source:** Concept identified in `Widget Dashboards` dropdown menus
**Function:** High-level strategic configuration for channel targeting.
**5 Upgrades:**
1. **DNA Visualizer:** Charts your split between Education, Entertainment, and Utility.
2. **Priming Switch:** Directly links to the backend to tweak category targeting metadata.
3. **Keyword Gravity:** Identifies the anchor words that generate the heaviest algorithmic pull.
4. **Sentiment Extractor:** Pulls emotional responses specifically from the last 1k comments.
5. **Dead Weight Identifier:** Highlights specific formats or series that represent a statistical anchor on channel growth.

---

## Technical Execution Plan
1. **Drafting:** Create 10 new React components in `src/views/dashboard/widgets/` (e.g., `AskMeWidget.tsx`, `OracleWidget.tsx`).
2. **Registration:** Map all 10 into `WidgetRegistry.ts` with appropriate standard sizes (half, full, etc.) and brutalist color schemas.
3. **Implementation:** Link them tightly into the `WidgetRenderer.tsx` index so they populate the dashboard canvas smoothly.


---

## Version 9 (from artifacts)


The current ViewTube dashboard establishes the structural shell and analytics foundation. This plan elevates it into an active workstation by deploying **10 powerful, functional mini-tools**—moving beyond reporting and into generation, action execution, and tactical insights.

## User Review Required

> [!IMPORTANT]
> Please review the 10 selected widgets and their proposed 5 improvements below to ensure they align with the trajectory of ViewTube. If these look correct, approve this plan so we can begin coding the integrations to the `WidgetRegistry` and `WidgetRenderer`.

---

## 1. Ask Me Anything AI

**Source:** `docs/Widget Dashboards/ask-me.html`
**Function:** An interactive chat agent tapped into channel metrics and strategy.
**5 Upgrades:**
1. **Contextual Quick-Prompts:** Auto-suggests questions targeting current active widgets (e.g. "Why is RPM down?").
2. **Inline Data Blocks:** AI replies render actual mini-charts or tables directly in the chat, not just raw text.
3. **Execution Commands:** Ability for the AI to alter tags, rename thumbnails, or execute tasks on your behalf.
4. **Knowledge Retention:** Save specific strategic brainstorms to a "Strategy Vault".
5. **Tone Switcher:** Toggle between "Encouraging Coach" and "Brutally Honest Audit".

## 2. Daily Oracle Advice

**Source:** `docs/Widget Dashboards/widget-preview copy.html`
**Function:** Prescriptive daily action items and critical warnings generated by metrics.
**5 Upgrades:**
1. **1-Click Resolutions:** Generates a "Fix It" action button directly under the advice to implement the fix instantly.
2. **"Snooze" Escalation:** If ignored, the warning escalates to a massive "Red Alert" the following day.
3. **Success Tracking:** Records if executing a prior piece of Oracle Advice actually boosted metrics down the line.
4. **Tool Linkage:** Links immediately out to the specific widget required to fix the issue (e.g., Title A/B).
5. **Audio Dictation:** Click to hear the Oracle read out the advice in an intense, robotic directive voice.

## 3. Data Multi-Edit Manager

**Source:** `docs/Widget Dashboards/widget-preview copy.html` (Data Edit module)
**Function:** Bulk editor for video metadata (titles, descriptions, tags, visibility).
**5 Upgrades:**
1. **Find & Replace:** Bulk swap links or outdated sponsor copy across N videos simultaneously.
2. **Regex Injection:** Enable Regex for power users to standardize specific formatting.
3. **Safety Undo History:** Deep rollback support to revert a broken bulk-edit.
4. **Live Analyzers:** Real-time character counts and keyword density maps while typing.
5. **Smart Tag Auto-Injector:** Automatically merges existing successful tags into the bulk payload.

## 4. Title & Thumbnail Validator

**Source:** Extrapolated from HTML mockups/docs
**Function:** Predicts success and scores split-test assets before publishing.
**5 Upgrades:**
1. **Gemini Vision Scoring:** Analyzes the uploaded Thumbnail image for visual hierarchy and contrast.
2. **Squint Test Mode:** Auto-blurs the thumbnail layout to test text legibility instantly.
3. **Aggression Radar Map:** Visualizes Emotion, Punctuation, and Curiosity gaps in the submitted title.
4. **AI Generation:** Auto-writes 5 alt titles based on the user's historical highest-CTR phrasing templates.
5. **A/B Split Simulator:** Simulates hypothetical drop-off trajectories over a 24h period for both targets.

## 5. Creator Burnout Monitor

**Source:** Custom ViewTube Strategy
**Function:** Correlates pacing volatility with mental friction to prevent channel death.
**5 Upgrades:**
1. **Volatility Stress Index:** Measures extreme algorithm swings that cause psychological stress.
2. **Rest Enforcer:** Ability to temporarily "Hide Negative Metrics" for 24 hours to enforce peace of mind.
3. **Plateau Predictor:** Estimates the exact date channel growth will halt if the current intense pace is maintained.
4. **Days-Since-Break Counter:** Gamifies resting alongside production.
5. **Repurpose Recommender:** Suggests low-effort clipping on high-burnout days.

## 6. Hook Optimizer (15-Second Clinic)

**Source:** Custom ViewTube Strategy
**Function:** Breaks down intro scripts for retention optimization.
**5 Upgrades:**
1. **Pacing Visualizer:** Calculates the words/sec tempo to prevent initial lag.
2. **Power Word Heatmap:** Color-codes aggressive, emotional triggers vs. filler fluff.
3. **Competitor X-Ray:** Paste a rival's video link to analyze/steal their hook structure.
4. **Shot-List Generator:** Auto-generates matching B-Roll ideas to align perfectly with the hook's tempo.
5. **Rewrite Modes:** 1-Click to toggle the script between "Curiosity Gap", "Aggressive", or "Story-Driven".

## 7. Sponsor Kit & Rate Calculator

**Source:** Custom ViewTube Strategy
**Function:** Generates pricing logic and media assets for sponsorships.
**5 Upgrades:**
1. **Floating Averages:** Uses rolling 30/90-day views, stripping away viral anomalies for fair pricing.
2. **Niche Modifiers:** Applies multipliers based on the channel's CPM/industry (Tech vs Gaming).
3. **Media Kit PDF:** One-click dynamic generation of a brand-ready PDF pulling live ViewTube stats.
4. **Price Escalation Tracker:** Shows historical rates to signal when it's time to increase your rate.
5. **Gemini Negotiator:** Auto-generates boilerplate counter-offer emails.

## 8. Content Repurposer

**Source:** Custom ViewTube Strategy
**Function:** Identifies long-form pillars and cuts them to Shorts.
**5 Upgrades:**
1. **Retention Peak Locator:** Scans audience analytics to isolate the 3 highest retention spikes.
2. **Evergreen Evaluation:** AI scores the relevance of the specific clip to current trends.
3. **Shorts Script Writer:** Uses the isolated segment text to write a fast-paced vertical hook.
4. **Conversion Tracker:** Tracks metric correlation (do views on this Short funnel into the Long video?).
5. **3-Week Calendar Pipeline:** Spits out a tactical release schedule for the spawned clips.

## 9. Competitor Radar

**Source:** General Web Mockups
**Function:** Monitors peer channels for breakout successes.
**5 Upgrades:**
1. **Outlier Alerts:** Dings heavily when a peer pushes a 10/10 viral anomaly.
2. **Tag Overlay:** Cross-references their hidden tags against your unused SEO list.
3. **Color Wheel Sniffer:** Analyzes their recent thumbnails to find visual blindspots (e.g., "everyone uses red, use blue").
4. **David vs Goliath:** Specifically spotlights micro-channels stealing market share in your niche.
5. **Cadence Tracker:** Maps their upload velocity against yours.

## 10. Algorithm Architect / Content DNA

**Source:** Concept identified in `Widget Dashboards` dropdown menus
**Function:** High-level strategic configuration for channel targeting.
**5 Upgrades:**
1. **DNA Visualizer:** Charts your split between Education, Entertainment, and Utility.
2. **Priming Switch:** Directly links to the backend to tweak category targeting metadata.
3. **Keyword Gravity:** Identifies the anchor words that generate the heaviest algorithmic pull.
4. **Sentiment Extractor:** Pulls emotional responses specifically from the last 1k comments.
5. **Dead Weight Identifier:** Highlights specific formats or series that represent a statistical anchor on channel growth.

---

## Technical Execution Plan
1. **Drafting:** Create 10 new React components in `src/views/dashboard/widgets/` (e.g., `AskMeWidget.tsx`, `OracleWidget.tsx`).
2. **Registration:** Map all 10 into `WidgetRegistry.ts` with appropriate standard sizes (half, full, etc.) and brutalist color schemas.
3. **Implementation:** Link them tightly into the `WidgetRenderer.tsx` index so they populate the dashboard canvas smoothly.


---

## Version 10 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Move app code into `viewtubeX/` subdirectory. Keep docs and research in root `viewtube/`. Ensure GitHub repo only tracks `viewtubeX/`.

## User Review Required

> [!IMPORTANT]
> **Git Tracking Change**: I will move the `.git` folder into `viewtubeX`. This means your existing GitHub repo will now look at `viewtubeX` as its root. Root-level files (like `NOTES_TOP_REMO_EDITORS.pdf`) will **NOT** be tracked by Git anymore. Is this what you want? (If you want root docs tracked too, we should keep `.git` in root and use `.gitignore` instead).

> [!WARNING]
> **Workflow Change**: You will need to `cd viewtubeX` before running `npm install` or `npm run dev`.

## Proposed Changes

### Move App Files to [NEW] `viewtubeX/`

Move the following to `viewtubeX/`:
- `src/`
- `public/`
- `apps/`
- `scripts/`
- `standalone/`
- `archives/`
- `index.html`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig*.json`
- `eslint.config.js`
- `.git/` (and `.github/`)
- `.vscode/`
- `.gitignore` (moved and adapted)

### Keep in Root `viewtube/`
- Research files (`*.pdf`, `*.txt`, `*.md` like `REMOTION_EDITOR_MASTER_SPEC.md`)
- `docs/` folder (contains notes)
- `scratch/` folder (temporary stuff)

## Open Questions

1. **Naming**: Is `viewtubeX` the final name or is it just a placeholder for something like `app/` or `code/`?
2. **Git Strategy**: Confirming again - should the root docs be untracked by the main GitHub repo?

## Verification Plan

### Manual Verification
- `cd viewtubeX && npm run dev` to ensure app starts.
- `git status` inside `viewtubeX` to ensure it sees the app files as usual but doesn't see root docs.
- Check paths in `vite.config.ts` if any are absolute (unlikely).


---

## Version 11 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Move app code into `viewtubeX/` subdirectory. Keep docs and research in root `viewtube/`. Move `.git` into `viewtubeX/` so the GitHub repo is limited to the app code.

## User Review Required

> [!IMPORTANT]
> **Final Confirmation:** I am moving the `.git` folder into `viewtubeX`. Your app's history and remote (GitHub) will now be centered in `viewtube/viewtubeX/`. Any git commands must be run from inside that folder. Root files like `NOTES_TOP_REMO_EDITORS.pdf` will no longer be tracked.

> [!WARNING]
> **Workflow Change**: You will need to `cd viewtubeX` before running `npm install` or `npm run dev`.

## Proposed Changes

### Move App Files to [NEW] `viewtubeX/`

Move the following to `viewtubeX/`:
- `src/`
- `public/`
- `apps/`
- `scripts/`
- `standalone/`
- `archives/`
- `index.html`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig*.json`
- `eslint.config.js`
- `skills.md`
- `gemini-dispatch.yml`
- `.git/` (and `.github/`)
- `.vscode/`
- `.gitignore` (moved and adapted)

### Keep in Root `viewtube/`
- Research files (`*.pdf`, `*.txt`, `*.md` like `REMOTION_EDITOR_MASTER_SPEC.md`)
- `docs/` folder (contains notes)
- `scratch/` folder (temporary stuff)

## Status
- **Naming**: Using `viewtubeX` (changeable later).
- **Git Strategy**: Isolated to `viewtubeX`. Confirmed by user.

## Open Questions
None. Proceeding with execution upon approval.

## Verification Plan

### Manual Verification
- `cd viewtubeX && npm run dev` to ensure app starts.
- `git status` inside `viewtubeX` to ensure it sees the app files as usual but doesn't see root docs.
- Check paths in `vite.config.ts` if any are absolute (unlikely).


---

## Version 12 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Move app code into `viewtubeX/` subdirectory. Keep docs and research in root `viewtube/`. Move `.git` into `viewtubeX/` so the GitHub repo is limited to the app code.

## User Review Required

> [!IMPORTANT]
> **Final Confirmation:** I am moving the `.git` folder into `viewtubeX`. Your app's history and remote (GitHub) will now be centered in `viewtube/viewtubeX/`. Any git commands must be run from inside that folder. Root files like `NOTES_TOP_REMO_EDITORS.pdf` will no longer be tracked.

> [!WARNING]
> **Workflow Change**: You will need to `cd viewtubeX` before running `npm install` or `npm run dev`.

## Proposed Changes

### Move App Files to [NEW] `viewtubeX/`

These are required for the app to build/run:
- `src/`
- `public/` (Vite assets - required)
- `scripts/` (Scripts used in `package.json` - required for dev)
- `index.html`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig*.json`
- `eslint.config.js`
- `.git/` (and `.github/`)
- `.vscode/`
- `.gitignore` (moved and adapted)

### Keep in Root `viewtube/`
- `archives/` (History - not needed for app)
- `apps/` (If these are standalone test apps, can stay out)
- `standalone/` (Can stay out)
- `skills.md` (Agent instructions - can stay in root)
- `gemini-dispatch.yml` (GitHub Action - **Note**: If moved to root, it won't run on GitHub because the repo root is now `viewtubeX`).
- Research files (`*.pdf`, `*.txt`, etc.)
- `docs/` and `scratch/`

## Status
- **Naming**: Using `viewtubeX` (changeable later).
- **Git Strategy**: Isolated to `viewtubeX`. Confirmed by user.

## Open Questions
None. Proceeding with execution upon approval.

## Verification Plan

### Manual Verification
- `cd viewtubeX && npm run dev` to ensure app starts.
- `git status` inside `viewtubeX` to ensure it sees the app files as usual but doesn't see root docs.
- Check paths in `vite.config.ts` if any are absolute (unlikely).


---

## Version 13 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Update `WidgetRegistry.ts` so every widget has the maximum flexibility for layout, allowing 4 widths and 3 heights.

## User Review Required

> [!NOTE]
> **Visual Impact:** Some widgets may have visual quirks at extreme sizes (e.g., a simple KPI might look very empty in a `full`/`tall` container). I will ensure they stretch appropriately where possible.

## Proposed Changes

### [Component Name] Dashboard Config

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)
Update all widget definitions to have:
- `minSize: "quarter"`
- `maxSize: "full"`
- `minHeight: "short"`
- `maxHeight: "tall"`

## Verification Plan

### Manual Verification
- Launch dashboard.
- Enter edit mode.
- Cycle through all 4 widths for several widgets.
- Cycle through all 3 heights for several widgets.
- Ensure no layout breakage when switching to large/small combinations.


---

## Version 14 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Implement a "Journal" system where creators can feed their goals, style, and plans into the AI, making Every tool in ViewTube context-aware.

## User Review Required

> [!IMPORTANT]
> **Context Injection:** Once enabled, the AI will start referencing your journal entries in SEO descriptions, strategic advice, and thumbnail concepts. You can toggle specific entries or categories if needed.

## Proposed Changes

### [Core] Data Architecture

#### [MODIFY] [types.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/types.ts)
- Define `JournalEntry` interface.
- Add `journalEntries: JournalEntry[]` to `WorkspaceBrain`.

#### [MODIFY] [GlobalDataContext.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/context/GlobalDataContext.tsx)
- Initialize `journalEntries` in `defaultBrain`.
- Update persistence logic to include journal data.
- Add `setJournalEntries` and `addJournalEntry` methods.

---

### [UI] AI Journal Widget

#### [NEW] [AIJournalWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AIJournalWidget.tsx)
- **Features**:
  - Neo-Brutalist text area for quick entries.
  - Category selector (Pill-based).
  - List of recent "Knowledge Nuggets" (journal entries).
  - Submit button that feeds the "Brain".
- **Design**: Matching the dashboard's vibrant, high-contrast aesthetic.

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)
- Register the `ai-journal` widget.

---

### [Services] AI Context Injection

#### [MODIFY] [gemini.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/gemini.ts)
- Create a helper `getJournalContext(entries: JournalEntry[])` to format entries for prompts.
- Inject this string into `generateSeoData`, `generateKeywordAnalysis`, and other tool prompts.

#### [MODIFY] [channelOracle.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/channelOracle.ts)
- Update `buildChannelOracleSystemPrompt` to prioritize Journal data as "Creator Intent".

## Verification Plan

### Automated Tests
- `npm run typecheck` to ensure no regressions in context usage.

### Manual Verification
- Add a journal entry: "I want to focus on a minimal, high-contrast aesthetic for my thumbnails."
- Run the **Thumbnail Studio** and verify the AI mentions or respects the "minimal aesthetic" in its prompt generation.
- Check that entries persist across page reloads.


---

## Version 15 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Implement a "Journal" system where creators can feed their goals, style, and plans into the AI, making Every tool in ViewTube context-aware.

## User Review Required

> [!IMPORTANT]
> **Context Injection:** Once enabled, the AI will start referencing your journal entries in SEO descriptions, strategic advice, and thumbnail concepts. You can toggle specific entries or categories if needed.

## Proposed Changes

### [Core] Data Architecture

#### [MODIFY] [types.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/types.ts)
- Define `JournalEntry` interface.
- Add `journalEntries: JournalEntry[]` to `WorkspaceBrain`.

#### [MODIFY] [GlobalDataContext.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/context/GlobalDataContext.tsx)
- Initialize `journalEntries` in `defaultBrain`.
- Update persistence logic to include journal data.
- Add `setJournalEntries` and `addJournalEntry` methods.

---

### [UI] AI Journal Widget

#### [NEW] [AIJournalWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AIJournalWidget.tsx)
- **Features**:
  - Neo-Brutalist text area for quick entries.
  - Category selector (Pill-based).
  - List of recent "Knowledge Nuggets" (journal entries).
  - Submit button that feeds the "Brain".
- **Design**: Matching the dashboard's vibrant, high-contrast aesthetic.

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)
- Register the `ai-journal` widget.

---

### [Services] AI Context Injection

#### [MODIFY] [gemini.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/gemini.ts)
- Create a helper `getJournalContext(entries: JournalEntry[])` to format entries for prompts.
- Inject this string into `generateSeoData`, `generateKeywordAnalysis`, and other tool prompts.

#### [MODIFY] [channelOracle.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/channelOracle.ts)
- Update `buildChannelOracleSystemPrompt` to prioritize Journal data as "Creator Intent".

## Open Questions

- **Entry Granularity**: Should the journal allow unlimited small entries (like a feed) or a fixed set of category-based text areas (Site manifesto, Style guide, etc.)?
  - *Recommendation*: Multiple entries with timestamps allow the "Brain" to track evolution.
- **AI Token Weight**: For very long journals, should we summarize the context or send everything?
  - *Recommendation*: Start with sending everything; implement summarization if token limits are hit.

## Verification Plan

### Automated Tests
- `npm run typecheck` to ensure no regressions in context usage.

### Manual Verification
- Add a journal entry: "I want to focus on a minimal, high-contrast aesthetic for my thumbnails."
- Run the **Thumbnail Studio** and verify the AI mentions or respects the "minimal aesthetic" in its prompt generation.
- Check that entries persist across page reloads.


---

## Version 16 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Implement a "Journal" system where creators can feed their goals, style, and plans into the AI, making Every tool in ViewTube context-aware.

## User Review Required

> [!IMPORTANT]
> **Context Injection:** Once enabled, the AI will start referencing your journal entries in SEO descriptions, strategic advice, and thumbnail concepts. You can toggle specific entries or categories if needed.

## Proposed Changes

### [Core] Data Architecture

#### [MODIFY] [types.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/types.ts)
- Define `JournalEntry` interface.
- Add `journalEntries: JournalEntry[]` to `WorkspaceBrain`.

#### [MODIFY] [GlobalDataContext.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/context/GlobalDataContext.tsx)
- Initialize `journalEntries` in `defaultBrain`.
- Update persistence logic to include journal data.
- Add `setJournalEntries` and `addJournalEntry` methods.

---

### [UI] AI Journal Widget

#### [NEW] [AIJournalWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AIJournalWidget.tsx)
- **Features**:
  - Neo-Brutalist text area for quick entries.
  - Category selector (Pill-based).
  - List of recent "Knowledge Nuggets" (journal entries).
  - Submit button that feeds the "Brain".
- **Design**: Matching the dashboard's vibrant, high-contrast aesthetic.

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)
- Register the `ai-journal` widget.

---

### [Services] AI Context Injection & Feedback Loop

#### [MODIFY] [gemini.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/gemini.ts)
- **New Service**: `generateJournalFollowUps(entry: string)`
  - Triggered post-submission. Returns 1-3 open-ended "Invitation Questions".
- **New Service**: `generateInfiniteMicroPolls(context: WorkspaceBrain)`
  - Periodically generates a batch of simple Y/N or 1-2 word questions.
- **Injection**: Continue injecting journal knowledge into all major tool prompts.

#### [MODIFY] [channelOracle.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/channelOracle.ts)
- Update `buildChannelOracleSystemPrompt` to prioritize Journal data as "Creator Intent".

### [UI] AI Journal Widget (Interactive Features)

#### [NEW] [AIJournalWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AIJournalWidget.tsx)
- **Sections**:
  - **The Journal**: High-contrast entry field.
  - **Reflections**: Floating cards for the AI's 1-3 open-ended questions.
  - **The Pulse (Rapid Fire)**: A specialized footer area for infinite Y/N questions.
- **State**: Track "Answered" vs "Pending" questions to keep the "Pulse" fresh.

## Open Questions

- **Micro-Poll Impact**: Should answering a "Yes/No" question (e.g., "Do you like high-saturation thumbnails?") immediately update specific brain fields (like `thumbnailState`) or just be stored as another journal entry?
  - *Recommendation*: Store as specialized metadata so the AI can weigh it heavily.
- **Micro-Poll Frequency**: How many "Pulse" questions should we queue at once?
  - *Recommendation*: Generation in batches of 5.

## Verification Plan

### Automated Tests
- `npm run typecheck` to ensure no regressions in context usage.

### Manual Verification
- Add a journal entry: "I want to focus on a minimal, high-contrast aesthetic for my thumbnails."
- Run the **Thumbnail Studio** and verify the AI mentions or respects the "minimal aesthetic" in its prompt generation.
- Check that entries persist across page reloads.


---

## Version 17 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Implement a "Journal" system where creators can feed their goals, style, and plans into the AI, making Every tool in ViewTube context-aware.

## User Review Required

> [!IMPORTANT]
> **Context Injection:** Once enabled, the AI will start referencing your journal entries in SEO descriptions, strategic advice, and thumbnail concepts. You can toggle specific entries or categories if needed.

## Proposed Changes

### [Core] Data Architecture

#### [MODIFY] [types.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/types.ts)
- Define `JournalEntry` interface.
- Add `journalEntries: JournalEntry[]` to `WorkspaceBrain`.

#### [MODIFY] [GlobalDataContext.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/context/GlobalDataContext.tsx)
- Initialize `journalEntries` in `defaultBrain`.
- Update persistence logic to include journal data.
- Add `setJournalEntries` and `addJournalEntry` methods.

---

### [UI] AI Journal Widget

#### [NEW] [AIJournalWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AIJournalWidget.tsx)
- **Features**:
  - Neo-Brutalist text area for quick entries.
  - Category selector (Pill-based).
  - List of recent "Knowledge Nuggets" (journal entries).
  - Submit button that feeds the "Brain".
- **Design**: Matching the dashboard's vibrant, high-contrast aesthetic.

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)
- Register the `ai-journal` widget.

---

### [Services] AI Context Injection & Feedback Loop

#### [MODIFY] [gemini.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/gemini.ts)
- **New Service**: `generateJournalFollowUps(entry: string)`
  - Triggered post-submission. Returns 1-3 open-ended "Invitation Questions".
- **New Service**: `generateInfiniteMicroPolls(context: WorkspaceBrain)`
  - Periodically generates a batch of simple Y/N or 1-2 word questions.
- **Injection**: Continue injecting journal knowledge into all major tool prompts.

#### [MODIFY] [channelOracle.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/channelOracle.ts)
- [x] SEO Overhaul (Done)
- [/] Channel Oracle (Next)
- [ ] Algorithm Architect (Diagnosis & Daily Brief)
- [ ] Hook Generator
- [ ] Shorts Studio
- Update `buildChannelOracleSystemPrompt` to prioritize Journal data as "Creator Intent".

### [UI] AI Journal Widget (Interactive Features)

#### [NEW] [AIJournalWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AIJournalWidget.tsx)
- **Sections**:
  - **The Journal**: High-contrast entry field.
  - **Reflections**: Floating cards for the AI's 1-3 open-ended questions.
  - **The Pulse (Rapid Fire)**: A specialized footer area for infinite Y/N questions.
- **State**: Track "Answered" vs "Pending" questions to keep the "Pulse" fresh.

## Open Questions

- **Micro-Poll Impact**: Should answering a "Yes/No" question (e.g., "Do you like high-saturation thumbnails?") immediately update specific brain fields (like `thumbnailState`) or just be stored as another journal entry?
  - *Recommendation*: Store as specialized metadata so the AI can weigh it heavily.
- **Micro-Poll Frequency**: How many "Pulse" questions should we queue at once?
  - *Recommendation*: Generation in batches of 5.

## Verification Plan

### Automated Tests
- `npm run typecheck` to ensure no regressions in context usage.

### Manual Verification
- Add a journal entry: "I want to focus on a minimal, high-contrast aesthetic for my thumbnails."
- Run the **Thumbnail Studio** and verify the AI mentions or respects the "minimal aesthetic" in its prompt generation.
- Check that entries persist across page reloads.


---

## Version 18 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Goal: Implement a "Journal" system where creators can feed their goals, style, and plans into the AI, making Every tool in ViewTube context-aware.

## User Review Required

> [!IMPORTANT]
> **Context Injection:** Once enabled, the AI will start referencing your journal entries in SEO descriptions, strategic advice, and thumbnail concepts. You can toggle specific entries or categories if needed.

## Proposed Changes

### [Core] Data Architecture

#### [MODIFY] [types.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/types.ts)
- Define `JournalEntry` interface.
- Add `journalEntries: JournalEntry[]` to `WorkspaceBrain`.

#### [MODIFY] [GlobalDataContext.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/context/GlobalDataContext.tsx)
- Initialize `journalEntries` in `defaultBrain`.
- Update persistence logic to include journal data.
- Add `setJournalEntries` and `addJournalEntry` methods.

---

### [UI] AI Journal Widget

#### [NEW] [AIJournalWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AIJournalWidget.tsx)
- **Features**:
  - Neo-Brutalist text area for quick entries.
  - Category selector (Pill-based).
  - List of recent "Knowledge Nuggets" (journal entries).
  - Submit button that feeds the "Brain".
- **Design**: Matching the dashboard's vibrant, high-contrast aesthetic.

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)
- Register the `ai-journal` widget.

---

### [Services] AI Context Injection & Feedback Loop

#### [MODIFY] [gemini.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/gemini.ts)
- **New Service**: `generateJournalFollowUps(entry: string)`
  - Triggered post-submission. Returns 1-3 open-ended "Invitation Questions".
- **New Service**: `generateInfiniteMicroPolls(context: WorkspaceBrain)`
  - Periodically generates a batch of simple Y/N or 1-2 word questions.
- **Injection**: Continue injecting journal knowledge into all major tool prompts.

#### [MODIFY] [channelOracle.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/channelOracle.ts)
- [x] SEO Overhaul (Done)
- [/] Channel Oracle (Next)
- [ ] Algorithm Architect (Diagnosis & Daily Brief)
- [ ] Hook Generator
- [ ] Shorts Studio
- Update `buildChannelOracleSystemPrompt` to prioritize Journal data as "Creator Intent".

### Phase 4: Global Brain Injection (Batch 2)

- **[gemini.ts]**: Update remaining generative services to accept `brain`.
- **[views]**: Update callers in `ThumbnailLab`, `CommunityCenter`, `TitleRewriter`, etc.
- **[verification]**: Check that "Creator Style" (from Journal) impacts thumbnail concepts and community posts.

### [UI] AI Journal Widget (Interactive Features)

#### [NEW] [AIJournalWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AIJournalWidget.tsx)
- **Sections**:
  - **The Journal**: High-contrast entry field.
  - **Reflections**: Floating cards for the AI's 1-3 open-ended questions.
  - **The Pulse (Rapid Fire)**: A specialized footer area for infinite Y/N questions.
- **State**: Track "Answered" vs "Pending" questions to keep the "Pulse" fresh.

## Open Questions

- **Micro-Poll Impact**: Should answering a "Yes/No" question (e.g., "Do you like high-saturation thumbnails?") immediately update specific brain fields (like `thumbnailState`) or just be stored as another journal entry?
  - *Recommendation*: Store as specialized metadata so the AI can weigh it heavily.
- **Micro-Poll Frequency**: How many "Pulse" questions should we queue at once?
  - *Recommendation*: Generation in batches of 5.

## Verification Plan

### Automated Tests
- `npm run typecheck` to ensure no regressions in context usage.

### Manual Verification
- Add a journal entry: "I want to focus on a minimal, high-contrast aesthetic for my thumbnails."
- Run the **Thumbnail Studio** and verify the AI mentions or respects the "minimal aesthetic" in its prompt generation.
- Check that entries persist across page reloads.


---

## Version 19 (from 62f12fb2-fa7e-45b4-b855-011e5bba8bf1)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Implementation plan for reviving ancient charts from ustube (24) into the new ViewTube app. Focuses on migrating from Google Charts to Recharts, handling data structural changes, and addressing missing statistics.
- updatedAt: 2026-04-23T08:07:16.758607Z
- requestFeedback: True


Revive and rebuild the legacy analytics charts from the "ancient version" of ustube (24) into the modern ViewTube app. The legacy application heavily relied on `react-google-charts` which is now deprecated in favor of React-native charting libraries like `recharts`. We must also adapt to the new data ingestion pipeline (`dataCoverageCatalog.ts` and `youtubeDataFetcher.ts`), handling any missing statistics and prioritizing moment-by-moment retention data and multi-dimensional audience signals.

## User Review Required

> [!WARNING]
> **Charting Library Migration:** The legacy charts used Google Charts (e.g., `GeoChart`, `PieChart`, `ScatterChart`). Google Charts expects data in 2D arrays (`[["Col", "Val"], ["A", 1]]`). We will be migrating to `recharts` which expects arrays of objects (`[{ name: 'A', value: 1 }]`). This requires a complete rewrite of the `ChartEngine.tsx` data transformation layer.

> [!IMPORTANT]
> **Geography Chart Replacement:** The old `GeographySplitView` used Google's `GeoChart` which required a Google Maps API key. `recharts` does not have a native geographic map chart.
> **Decision needed:** Should we install a dedicated mapping library like `react-simple-maps`, or represent geographic distribution using standard charts (e.g., horizontal bar charts or treemaps)?

## Open Questions

1. **Missing Data Fallbacks:** Some legacy charts relied on specific Google Analytics or YouTube API fields that might not be consistently available. Should we hide charts entirely when data is missing, or show a fallback UI (e.g., "Data not available for this period")?
2. **Chart Engine Consolidation:** Currently, there's chart rendering logic in both `ResearchLab.tsx` and `ChartEngine.tsx`. I plan to consolidate all chart rendering into a single `UniversalChartEngine.tsx` component. Is this acceptable?
3. **Third-Party Libraries:** Are we strictly limited to `recharts`, or can we use other libraries (like `nivo`) if a specific chart (like a heatmap or calendar chart) is difficult to build in `recharts`?

## Proposed Changes

---

### Data Transformation Layer

We need to bridge the gap between the new data catalog and the required chart structures.

#### [MODIFY] `src/services/analyticsSelectors.ts` or `src/services/DataEngine.ts`
- Implement a data transformer that maps `dataCoverageCatalog.ts` canonical keys to `recharts`-friendly object arrays.
- Add support for merging `fetchDailyMetrics` and `fetchRetentionCurve` outputs into the centralized `WorkspaceBrain` so charts can reactively render moment-by-moment data.

---

### Charting Engine Revamp

Migrate away from Google Charts and build a robust Recharts wrapper.

#### [DELETE] `src/components/ChartEngine.tsx`
- Remove the Google Chart wrapper (`GoogleChartWrapper`, `MemoizedGoogleChart`, `RenderGoogleChart`).

#### [NEW] `src/components/UniversalChartEngine.tsx`
- Build a generic wrapper around `recharts` (`ResponsiveContainer`, `LineChart`, `ScatterChart`, `PieChart`, etc.).
- Re-implement the `CustomTooltip` to support the Neo-Brutalist design (thick borders, uppercase text, neon accents).
- Implement specific chart reviving logic:
  - **TopPerformersTrio:** Rebuild as a CSS Grid of 3 `recharts` `PieChart` components.
  - **Shorts Retention (ScatterChart):** Rebuild using `recharts` `ScatterChart` mapping `videoLengthSeconds` (Duration) against `averageViewPercentage` (APV).
  - **Content Type Distribution:** Rebuild using a `PieChart` or stacked `BarChart`.

---

### Dashboard / Lab Integration

Inject the new charts into the existing interfaces.

#### [MODIFY] `src/views/ResearchLab.tsx`
- Remove all `react-google-charts` imports and references.
- Replace `GoogleChartWithUnifiedLoader` and `MemoizedGoogleChart` with the new `UniversalChartEngine`.
- Update the `chartConfigs` array to output `recharts`-compatible data instead of Google Chart 2D arrays.
- Ensure the Neo-Brutalist table fallback remains intact for table-type data.

## Verification Plan

### Automated Tests
- N/A for UI visual tests, but we will ensure the app compiles (`npm run dev`) and there are no TypeScript errors regarding the `ChartConfig` data typing.

### Manual Verification
1. Open the "Research Lab" and "Channelytics" views in the browser.
2. Verify that the charts load correctly using the mocked data from `youtubeDataFetcher.ts`.
3. Test hover states to ensure the Neo-Brutalist tooltips appear and display correct formatting (e.g., commas for thousands, percentages).
4. Verify the "Top Performers Trio" and "Shorts Retention" charts render correctly.


---

## Version 20 (from 62f12fb2-fa7e-45b4-b855-011e5bba8bf1)


Revive and rebuild the legacy analytics charts from the "ancient version" of ustube (24) into the modern ViewTube app. The legacy application heavily relied on `react-google-charts` which is now deprecated in favor of React-native charting libraries like `recharts`. We must also adapt to the new data ingestion pipeline (`dataCoverageCatalog.ts` and `youtubeDataFetcher.ts`), handling any missing statistics and prioritizing moment-by-moment retention data and multi-dimensional audience signals.

## User Review Required

> [!WARNING]
> **Charting Library Migration:** The legacy charts used Google Charts (e.g., `GeoChart`, `PieChart`, `ScatterChart`). Google Charts expects data in 2D arrays (`[["Col", "Val"], ["A", 1]]`). We will be migrating to `recharts` which expects arrays of objects (`[{ name: 'A', value: 1 }]`). This requires a complete rewrite of the `ChartEngine.tsx` data transformation layer.

> [!IMPORTANT]
> **Geography Chart Replacement:** The old `GeographySplitView` used Google's `GeoChart` which required a Google Maps API key. `recharts` does not have a native geographic map chart.
> **Decision needed:** Should we install a dedicated mapping library like `react-simple-maps`, or represent geographic distribution using standard charts (e.g., horizontal bar charts or treemaps)?

## Open Questions

1. **Missing Data Fallbacks:** Some legacy charts relied on specific Google Analytics or YouTube API fields that might not be consistently available. Should we hide charts entirely when data is missing, or show a fallback UI (e.g., "Data not available for this period")?
2. **Chart Engine Consolidation:** Currently, there's chart rendering logic in both `ResearchLab.tsx` and `ChartEngine.tsx`. I plan to consolidate all chart rendering into a single `UniversalChartEngine.tsx` component. Is this acceptable?
3. **Third-Party Libraries:** Are we strictly limited to `recharts`, or can we use other libraries (like `nivo`) if a specific chart (like a heatmap or calendar chart) is difficult to build in `recharts`?

## Proposed Changes

---

### Data Transformation Layer

We need to bridge the gap between the new data catalog and the required chart structures.

#### [MODIFY] `src/services/analyticsSelectors.ts` or `src/services/DataEngine.ts`
- Implement a data transformer that maps `dataCoverageCatalog.ts` canonical keys to `recharts`-friendly object arrays.
- Add support for merging `fetchDailyMetrics` and `fetchRetentionCurve` outputs into the centralized `WorkspaceBrain` so charts can reactively render moment-by-moment data.

---

### Charting Engine Revamp

Migrate away from Google Charts and build a robust Recharts wrapper.

#### [DELETE] `src/components/ChartEngine.tsx`
- Remove the Google Chart wrapper (`GoogleChartWrapper`, `MemoizedGoogleChart`, `RenderGoogleChart`).

#### [NEW] `src/components/UniversalChartEngine.tsx`
- Build a generic wrapper around `recharts` (`ResponsiveContainer`, `LineChart`, `ScatterChart`, `PieChart`, etc.).
- Re-implement the `CustomTooltip` to support the Neo-Brutalist design (thick borders, uppercase text, neon accents).
- Implement specific chart reviving logic:
  - **TopPerformersTrio:** Rebuild as a CSS Grid of 3 `recharts` `PieChart` components.
  - **Shorts Retention (ScatterChart):** Rebuild using `recharts` `ScatterChart` mapping `videoLengthSeconds` (Duration) against `averageViewPercentage` (APV).
  - **Content Type Distribution:** Rebuild using a `PieChart` or stacked `BarChart`.

---

### Dashboard / Lab Integration

Inject the new charts into the existing interfaces.

#### [MODIFY] `src/views/ResearchLab.tsx`
- Remove all `react-google-charts` imports and references.
- Replace `GoogleChartWithUnifiedLoader` and `MemoizedGoogleChart` with the new `UniversalChartEngine`.
- Update the `chartConfigs` array to output `recharts`-compatible data instead of Google Chart 2D arrays.
- Ensure the Neo-Brutalist table fallback remains intact for table-type data.

## Verification Plan

### Automated Tests
- N/A for UI visual tests, but we will ensure the app compiles (`npm run dev`) and there are no TypeScript errors regarding the `ChartConfig` data typing.

### Manual Verification
1. Open the "Research Lab" and "Channelytics" views in the browser.
2. Verify that the charts load correctly using the mocked data from `youtubeDataFetcher.ts`.
3. Test hover states to ensure the Neo-Brutalist tooltips appear and display correct formatting (e.g., commas for thousands, percentages).
4. Verify the "Top Performers Trio" and "Shorts Retention" charts render correctly.


---

## Version 21 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


## Goal Description
The objective is to create a massive library of 100 animated SVG assets (titles, icons, micro-illustrations, labels) tailored for YouTube content creation. These assets will draw direct inspiration from the provided references (pop-art style, layered "Pisces" text, isometric "Dream" text, beating hearts with sparkles, geometric patterns, and vibrant color palettes). 

Given the scale of 100 unique, multi-layered SVG animations, hand-coding 100 distinct components in a single pass is impractical. Instead, we will build a **Scalable Asset Engine**, which consists of robust base components (e.g., `LayeredText`, `BeatingHeart`, `RetroBadge`) that can be instantiated with different props, colors, and text to quickly generate the 100 variants.

## User Review Required

> [!IMPORTANT]
> Generating 100 highly customized, animated SVGs is a massive undertaking. To ensure high quality, I propose we build the **Asset Engine** first (which includes the specific examples you mentioned: the 5-layer spring-loaded "SUBSCRIBE" text and the beating pop-art heart). Once you approve the engine and the initial set of ~10 assets, we can rapidly scale up to 100.

> [!WARNING]
> Do you want these 100 assets hardcoded as individual React components (e.g., `<SubscribeText />`, `<LikeHeart />`), or would you prefer a JSON-driven configuration (similar to your `CODEX_EDITOR_X_V1.templates.v2.json`) that renders them dynamically via a single `<AssetRenderer />`?

## Open Questions
1. **Animation Library:** Do you want to use raw CSS `@keyframes` / inline styles for the animations (which fits the neo-brutalist raw HTML/CSS vibe), or do you want to use a library like `framer-motion` or Remotion's built-in `spring` mechanics?
2. **Asset Storage:** Should these be stored in a new directory like `src/components/assets/`?
3. **Target 100:** To hit the 100 mark, are you okay with permutations? (e.g. `LayeredText` applied to 20 different YouTube phrases like "Like", "Subscribe", "Comment", "Share", "Hit the Bell", etc. counting as 20 assets?)

## Proposed Changes

### 1. CSS Animation Definitions
#### [NEW] `src/styles/assetAnimations.css`
- Define keyframes for the asset library.
- `@keyframes springUp` (for the layered text spreading out).
- `@keyframes beat` (for the heart).
- `@keyframes sparkleSpin` (for the sparkles).

### 2. Base Asset Components
#### [NEW] `src/components/assets/LayeredText.tsx`
- Replicates the "PISCES" reference.
- Accepts `text`, `colors` (array of layer colors), and `strokeWidth`.
- Applies the spring-out animation on mount or hover.

#### [NEW] `src/components/assets/IsometricText.tsx`
- Replicates the "DREAM" reference.
- Extrudes text with hard shadows.

#### [NEW] `src/components/assets/HeartSparkle.tsx`
- A pink heart with 4 corner sparkles in the YouTube app colors (blue, purple, yellow).
- Hooks into the heartbeat and rotation animations.

### 3. The 100 Asset Collection
#### [NEW] `src/components/assets/AssetLibrary.tsx`
- An exported dictionary or registry of 100 configured assets using the base components.
- e.g., `AssetLibrary.SubscribeLayered`, `AssetLibrary.LikeHeart`, `AssetLibrary.CommentBadge`, etc.

## Verification Plan
### Manual Verification
1. I will build a temporary `AssetGallery` view in the dashboard where you can see all the assets laid out in a grid.
2. You can hover over or click them to test the animations, colors, and strokes.
3. Ensure the layered text perfectly matches the pop-art aesthetic of the "PISCES" image and the heart matches your exact specifications.


---

## Version 22 (from 581d5401-3df2-47b4-bbc3-e3769040d1d4)


The goal is to build a new `ResearchLabToolbox` page that centralizes all the "ready" analytics charts (which we identified as capable of running on Recharts + synced data without Google Charts). The page will use the Neo-Brutalist `ToolboxUISystem` and connect directly to the canonical data pipeline via `GlobalDataContext`.

## Proposed Changes

### [NEW] `viewtubeX/src/views/ResearchLabToolbox.tsx`
Create the main container for the new page.
- Wrap the page in the `Toolbox` UI system for Neo-Brutalist styling.
- Use `useBrain` from `GlobalDataContext` to access `channelyticsState.allData` (or use `getMasterRows` to get canonical statistics).
- Implement a grid layout (`ToolboxBody`) to display the suite of Recharts-based widgets.

### [NEW] `viewtubeX/src/components/ResearchLabCharts.tsx`
Create isolated, self-contained Recharts components that replace their Google Charts counterparts:
1. **Performance Trend & Momentum Tracker**: `AreaChart` and `LineChart` parsing `Date` vs `Views`/`Impressions`/`Watch Hours`.
2. **Engagement Map**: `BarChart` comparing `Comments`, `Likes`, and `Shares`.
3. **Best Upload Day & Duration Sweet Spot**: `BarChart` aggregating averages based on Day of Week and Duration Buckets.
4. **Video Value Matrix & Audience Growth**: `ScatterChart`/`BubbleChart` correlating `CTR`, `Retention`, `Views`, and `Subscribers`.

### [MODIFY] `viewtubeX/src/app/AppRoutes.tsx`
- Add a new route for `/research-lab-toolbox` pointing to the new `ResearchLabToolbox` view.
- (Optional) Update the sidebar or AppShell to link to this new lab page, or simply make it accessible via the route first.

## Open Questions

> [!IMPORTANT]
> **Data Scope**: Should we default the charts to a specific time window (e.g., 28d or 90d), or use Lifetime metrics as the baseline?
> **Navigation**: Do you want me to replace the existing `/legacy/research-lab` route entirely, or maintain this as a standalone `/research-lab` next to it?

## Verification Plan
1. **Render Test**: Ensure `/research-lab-toolbox` loads without Google Charts dependencies.
2. **Data Binding Test**: Confirm charts populate dynamically when `GlobalDataContext` has synced metrics (using `SyncButton` to populate data).
3. **Style Check**: Verify perfect alignment with the Neo-Brutalist `Toolbox` UI components.


---

## Version 23 (from artifacts)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Plan to build a standalone HTML preview file that recreates the legacy charts and visually displays them using Recharts, along with source code previews.
- updatedAt: 2026-04-25T16:47:04.578087Z
- requestFeedback: True


This plan outlines the approach to build a comprehensive HTML file that recreates the legacy Google Charts from `CCHARTS_M22_UTZZ` and `VTCopy_8_CHARTSREBUILD` into modern Recharts implementations, and visually renders them to match the provided screenshots.

## User Review Required

> [!IMPORTANT]
> Because rendering multiple complex React + Recharts components dynamically inside a single standalone HTML file (using Babel) can be heavy, the plan is to build a robust interactive viewer. It will use `<script src="https://unpkg.com/@babel/standalone/babel.min.js">` to parse JSX on the fly. 
> 
> Please confirm if this is acceptable, or if you prefer the HTML file to strictly be a static visual mockup using HTML/CSS without executing the heavy React/Recharts charting library logic in the browser.

## Proposed Changes

We will create a new HTML artifact named `legacy_charts_recreation.html` (or similar).

### [NEW] `legacy_charts_recreation.html`
This file will contain:
1. **Tailwind CSS** (via CDN) for Neo-Brutalist styling (thick borders, hard shadows, vibrant colors).
2. **React & Recharts** (via CDN) to render the charts live in the browser.
3. **Babel Standalone** to compile the JSX inline.
4. **Mock Data** simulating the exact data points seen in the screenshots (e.g., the exact scatter plot points, pie chart slices).
5. **Recreated Chart Components**:
   - `TopPerformersTrio`: 3 large donut charts with 3 small donuts hovering.
   - `VideoValueMatrix`: Scatter chart with 4 quadrants.
   - `RevenueDistribution` & `WatchTimeDistribution`: Pie charts with labels.
   - `SubscribersGained` & `HookEffectiveness`: Bar charts.
   - `ShortsRetention` & `Packaging`: Scatter/Bubble charts.
6. **Code Preview Boxes**: Side-by-side or toggleable views that show the *Legacy Google Charts Code* vs the *Modern Recharts Code* used to render the visual.

## Verification Plan

### Manual Verification
- Open the resulting `legacy_charts_recreation.html` in a local browser.
- Verify that the charts visually match the March 22 and April 9 screenshots (colors, borders, layouts).
- Ensure the code preview boxes accurately reflect the code from `ResearchLab_MAR22.tsx` and `Channelytics copy.tsx` against the new modern code.


---

## Version 24 (from artifacts)


This plan outlines the approach to build a comprehensive HTML file that recreates the legacy Google Charts from `CCHARTS_M22_UTZZ` and `VTCopy_8_CHARTSREBUILD` into modern Recharts implementations, and visually renders them to match the provided screenshots.

## User Review Required

> [!IMPORTANT]
> Because rendering multiple complex React + Recharts components dynamically inside a single standalone HTML file (using Babel) can be heavy, the plan is to build a robust interactive viewer. It will use `<script src="https://unpkg.com/@babel/standalone/babel.min.js">` to parse JSX on the fly. 
> 
> Please confirm if this is acceptable, or if you prefer the HTML file to strictly be a static visual mockup using HTML/CSS without executing the heavy React/Recharts charting library logic in the browser.

## Proposed Changes

We will create a new HTML artifact named `legacy_charts_recreation.html` (or similar).

### [NEW] `legacy_charts_recreation.html`
This file will contain:
1. **Tailwind CSS** (via CDN) for Neo-Brutalist styling (thick borders, hard shadows, vibrant colors).
2. **React & Recharts** (via CDN) to render the charts live in the browser.
3. **Babel Standalone** to compile the JSX inline.
4. **Mock Data** simulating the exact data points seen in the screenshots (e.g., the exact scatter plot points, pie chart slices).
5. **Recreated Chart Components**:
   - `TopPerformersTrio`: 3 large donut charts with 3 small donuts hovering.
   - `VideoValueMatrix`: Scatter chart with 4 quadrants.
   - `RevenueDistribution` & `WatchTimeDistribution`: Pie charts with labels.
   - `SubscribersGained` & `HookEffectiveness`: Bar charts.
   - `ShortsRetention` & `Packaging`: Scatter/Bubble charts.
6. **Code Preview Boxes**: Side-by-side or toggleable views that show the *Legacy Google Charts Code* vs the *Modern Recharts Code* used to render the visual.

## Verification Plan

### Manual Verification
- Open the resulting `legacy_charts_recreation.html` in a local browser.
- Verify that the charts visually match the March 22 and April 9 screenshots (colors, borders, layouts).
- Ensure the code preview boxes accurately reflect the code from `ResearchLab_MAR22.tsx` and `Channelytics copy.tsx` against the new modern code.


---

## Version 25 (from 581d5401-3df2-47b4-bbc3-e3769040d1d4)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Plan to create a /graphs route with 23 chart components, each bound to getMasterRows canonical data, styled per the legacy screenshot layout with yellow headers, subtitle bars, hover tooltips, and quadrant labels.
- updatedAt: 2026-04-25T17:16:49.294046Z
- version: 1
- requestFeedback: True


Build a `/graphs` route rendering all legacy chart types, bound to `getMasterRows` canonical data, styled per the screenshot layout (yellow headers, subtitles, hover stats, quadrant labels).

## Proposed Changes

### Chart Component Architecture

Each chart card follows the screenshot pattern:
- **Yellow header bar** with title (left) + count badge + expand icon (right)
- **Subtitle bar** with selected video info + metric stats (CTR/Retention/Views) + legend
- **Chart area** with quadrant labels where applicable
- **Hover tooltip** showing video title, CTR, retention, views, format

---

### [NEW] `src/components/GraphsPageCharts.tsx`

All chart components in one file, bound to `CanonicalVideoRow[]` via `resolveMetricNumber`. Charts:

1. **VideoValueMatrix** — Scatter (CTR x Retention x Views) with 4 quadrant labels, shorts=pink/long=cyan bubbles
2. **RevenueDistribution** — Donut pie (top 10 by revenue)
3. **WatchTimeDistribution** — Pie chart
4. **SubscribersGained** — Bar chart (top 10)
5. **HookEffectiveness** — Horizontal bar (30s retention)
6. **ShortsRetention** — Scatter (AVD% x Duration), color-coded by duration bucket
7. **Packaging** — Bubble scatter (CTR x Impressions)
8. **TopPerformersTrio** — 3 donut pairs (Revenue/WatchHrs/Subs)
9. **DurationSweetSpot** — Scatter (duration x views)
10. **EngagementMap** — Grouped bars (likes/comments/shares)
11. **PerformanceTrend** — ComposedChart (views area + subs line)
12. **AudienceGrowth** — Area chart
13. **MomentumTracker** — Dual line (revenue + impressions over time)
14. **HookQuality** — Scatter (hook% x long-term views)
15. **RevenueEfficiency** — Scatter (watch hours x $/min)
16. **ViewerLoyalty** — Bar chart (new vs returning)
17. **GoldenRatioRadar** — Radar chart (CTR/AVD/APV/Engagement/Retention/Velocity)
18. **BestUploadDay** — Bar chart (weekday x avg views)
19. **LongTailShelf** — Area decay chart
20. **MilestoneProgression** — Horizontal bar
21. **TitleStats** — Bar (title length x views)
22. **SeasonalRPM** — Line chart
23. **GrowthPulse** — Multi-line (views/subs/revenue/shares)

---

### [NEW] `src/views/GraphsPage.tsx`

Page component:
- Imports `getMasterRows` + `applyGlobalRowFilters`
- Timeline selector (7d / 28d / 90d / 365d / lifetime)
- Refresh button + sync event listener
- Grid layout: 2 columns for paired charts, full-width for wide charts
- Loading/error/empty states

---

### [MODIFY] `src/app/AppRoutes.tsx`

Add:
```tsx
import GraphsPage from "../views/GraphsPage"
// ...
<Route path="/graphs" element={<GraphsPage />} />
```

## Verification Plan

### Automated Tests
- `npm run build` — ensure no TS errors
- Launch dev server, navigate to `/graphs`

### Manual Verification
- Confirm all 23 charts render with real sync data
- Verify hover tooltips show video title + metrics
- Test timeline switching (7d → lifetime)


---

## Version 26 (from 581d5401-3df2-47b4-bbc3-e3769040d1d4)


Build a `/graphs` route rendering all legacy chart types, bound to `getMasterRows` canonical data, styled per the screenshot layout (yellow headers, subtitles, hover stats, quadrant labels).

## Proposed Changes

### Chart Component Architecture

Each chart card follows the screenshot pattern:
- **Yellow header bar** with title (left) + count badge + expand icon (right)
- **Subtitle bar** with selected video info + metric stats (CTR/Retention/Views) + legend
- **Chart area** with quadrant labels where applicable
- **Hover tooltip** showing video title, CTR, retention, views, format

---

### [NEW] `src/components/GraphsPageCharts.tsx`

All chart components in one file, bound to `CanonicalVideoRow[]` via `resolveMetricNumber`. Charts:

1. **VideoValueMatrix** — Scatter (CTR x Retention x Views) with 4 quadrant labels, shorts=pink/long=cyan bubbles
2. **RevenueDistribution** — Donut pie (top 10 by revenue)
3. **WatchTimeDistribution** — Pie chart
4. **SubscribersGained** — Bar chart (top 10)
5. **HookEffectiveness** — Horizontal bar (30s retention)
6. **ShortsRetention** — Scatter (AVD% x Duration), color-coded by duration bucket
7. **Packaging** — Bubble scatter (CTR x Impressions)
8. **TopPerformersTrio** — 3 donut pairs (Revenue/WatchHrs/Subs)
9. **DurationSweetSpot** — Scatter (duration x views)
10. **EngagementMap** — Grouped bars (likes/comments/shares)
11. **PerformanceTrend** — ComposedChart (views area + subs line)
12. **AudienceGrowth** — Area chart
13. **MomentumTracker** — Dual line (revenue + impressions over time)
14. **HookQuality** — Scatter (hook% x long-term views)
15. **RevenueEfficiency** — Scatter (watch hours x $/min)
16. **ViewerLoyalty** — Bar chart (new vs returning)
17. **GoldenRatioRadar** — Radar chart (CTR/AVD/APV/Engagement/Retention/Velocity)
18. **BestUploadDay** — Bar chart (weekday x avg views)
19. **LongTailShelf** — Area decay chart
20. **MilestoneProgression** — Horizontal bar
21. **TitleStats** — Bar (title length x views)
22. **SeasonalRPM** — Line chart
23. **GrowthPulse** — Multi-line (views/subs/revenue/shares)

---

### [NEW] `src/views/GraphsPage.tsx`

Page component:
- Imports `getMasterRows` + `applyGlobalRowFilters`
- Timeline selector (7d / 28d / 90d / 365d / lifetime)
- Refresh button + sync event listener
- Grid layout: 2 columns for paired charts, full-width for wide charts
- Loading/error/empty states

---

### [MODIFY] `src/app/AppRoutes.tsx`

Add:
```tsx
import GraphsPage from "../views/GraphsPage"
// ...
<Route path="/graphs" element={<GraphsPage />} />
```

## Verification Plan

### Automated Tests
- `npm run build` — ensure no TS errors
- Launch dev server, navigate to `/graphs`

### Manual Verification
- Confirm all 23 charts render with real sync data
- Verify hover tooltips show video title + metrics
- Test timeline switching (7d → lifetime)


---

## Version 27 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Unified input styling, header refactoring, Thumbnail Lab merge, and new Description Editor widget.

## User Review Required

> [!IMPORTANT]
> This removes the collapse (`-`/`✦`) toggle permanently — widgets always show content. Confirm this is intended for ALL widgets.

> [!IMPORTANT]
> The `?` help button will appear on every widget but won't have functionality yet — just a placeholder. Should it do anything on click (tooltip? modal? link to docs)?

## Open Questions

1. **Description Editor** — should it persist to localStorage, or integrate with YouTube Data API to push description updates?
2. **Thumbnail Lab video dropdown** — should the dropdown show ALL videos or only recent uploads (last 10)?
3. **? button** — what should clicking it do? (nothing/tooltip/link?)

---

## Proposed Changes

### 1. Unified Input Styling (CSS)

#### [MODIFY] [toolboxWidgetSystem.css](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/toolboxWidgetSystem.css)

Add a new `.vt-input` class matching the FormField "Channel URL" style from ComponentGridLab:

```css
.dashboard-barrier .vt-input {
  width: 100%;
  padding: 8px 10px;
  border: 3px solid #000;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.dashboard-barrier .vt-input:focus {
  border-color: #00CCFF;
  box-shadow: 3px 3px 0 #00CCFF;
}
.dashboard-barrier .vt-select { /* same + appearance:none */ }
.dashboard-barrier .vt-textarea { /* same + resize:vertical, min-height */ }
```

Then replace all inline input styles across:
- `AskMeWidget.tsx` (textarea + input)
- `AIJournalWidget.tsx` (textarea + inputs)
- `GoalsTrackerWidget.tsx` (number input)
- `ThumbAIWidget.tsx` → merged into ThumbnailLab
- `ABThumbnailWidget.tsx` → merged into ThumbnailLab  
- `CommentReplyWidget.tsx` (textarea)
- `CommunityPostWidget.tsx` (textarea)
- `TagGeneratorWidget.tsx` (input)
- `TitleRewriterWidget.tsx` (input)
- `HashtagAnalyzerWidget.tsx` (input)

---

### 2. WidgetShell Header Refactor

#### [MODIFY] [WidgetShell.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetShell.tsx)

**Remove:**
- `onToggleCollapse` prop and the click handler on the header
- The `toggle-icon` div (`✦`/`−`)
- The `isOpen` / `collapsed` gating on content render (line 94: `{isOpen && ...}`)
- Always render `subtoolbox-content`

**Add:**
- `hasAI?: boolean` prop — when true, show a regenerate/sparkles icon button (34×34, same style as `widget-control-btn` but sized up)
- `?` help button (white, 34×34, `widget-control-btn` style) — always shown to the right of the AI button (or in its place if no AI)

New header right section:
```
[... edit controls if editMode ...] [✦ AI button if hasAI] [? help button]
```

Button style (matching rearrange buttons but 34px):
```css
.dashboard-barrier .widget-header-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: #fff;
  border: 2px solid #000;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 2px 2px 0 0 rgba(0,0,0,0.45);
  transition: all 0.15s;
}
```

**AI-powered widgets** that get the `✦` regenerate button:
- Daily Oracle, Ask Me, AI Journal, Comment Responder, Community Post, Tag Generator, Thumb AI / Thumbnail Lab, Title Rewriter, Hashtag Analyzer, Retention Sim, Collab Matchmaker, Upload Scheduler

#### [MODIFY] [toolboxWidgetSystem.css](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/toolboxWidgetSystem.css)

- Remove `.toggle-icon` styles
- Add `.widget-header-btn` styles
- Remove the header `cursor: pointer` (no longer clickable for collapse)

---

### 3. Merge Thumb AI + A/B Thumbnail → Thumbnail Lab

#### [DELETE] [ABThumbnailWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/ABThumbnailWidget.tsx)

#### [MODIFY] [ThumbAIWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/ThumbAIWidget.tsx) → rename to ThumbnailLabWidget.tsx

- Add 3-way toggle at top: **Generate | Analyze | A/B Test** (same neo-brutal tab style as Comment Responder)
- Move video dropdown to the main content area (shared by Analyze + A/B Test modes)
- Generate mode: prompt textarea + generate button  
- Analyze mode: video dropdown → thumbnail preview → analyze button  
- A/B Test mode: video dropdown + 3 variant upload slots (from ABThumbnailWidget) + predict button

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRenderer.tsx)

- Remove `ab-thumbnail` branch, point to ThumbnailLabWidget
- Update `thumb-ai` branch to use ThumbnailLabWidget

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)

- Remove `ab-thumbnail` entry
- Rename `thumb-ai` → title "Thumbnail Lab"

---

### 4. New Description Editor Widget

#### [NEW] [DescriptionEditorWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/DescriptionEditorWidget.tsx)

Two text boxes:
1. **Main Description** — large textarea for per-video description
2. **Default Footer** — smaller textarea for boilerplate (links, socials, etc.) that appends to every description

Both use `.vt-textarea` unified input class. Persist footer to localStorage. Include a "Copy Full Description" button that combines both.

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)

Add `description-editor` entry.

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRenderer.tsx)

Add render branch for `description-editor`.

---

## Verification Plan

### Automated Tests
- `npm run dev` — confirm no build errors
- Browser check: verify all widgets render with new input styles
- Check blue focus border on every input/textarea/select
- Confirm `?` appears on all headers, `✦` only on AI widgets
- Confirm collapse (`-`) fully removed — widgets always open
- Confirm Thumbnail Lab shows all 3 modes
- Confirm Description Editor renders with two text areas


---

## Version 28 (from 022f1342-c933-4c25-bb33-7b6241caaeb3)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Create implementation plan for porting motion template system.
- updatedAt: 2026-04-28T21:27:49.691730Z


## Goal
Upgrade the template rendering engine in `VT_E1.html` to match the visual quality and features of the standalone `015b4` editor. This includes full visual parity for all 14 styles and improved animation handling.

## Proposed Changes

### VT_E1.html

#### [MODIFY] CSS Styles
- Update Google Fonts import to include `Inter` and `Space Mono`.
- Add `:root` variables for colors (`--lime`, `--cyan`, etc.).
- Add utility classes for neo-brutalist shadows:
    - `.neo-shadow`
    - `.neo-shadow-lg`
    - `.neo-shadow-xl`
- Add glitch animation CSS from the original source.

#### [MODIFY] `renderTemplateAsset`
- Rewrite the `renderByStyle` inner function to return JSX that matches the HTML structure and styling of the original standalone editor.
- Ensure `secondary` text is correctly placed (e.g., as a badge in `neo-brutalist`).
- Implement the complex gradients and layouts for `pill`, `cyber`, `y2k-window`, etc.

#### [MODIFY] `templateAnimInfluence`
- Refine the JS-based animation values to feel closer to the CSS `@keyframes`.

## Verification Plan

### Automated Tests
- I'll use `chrome-devtools-mcp` to:
    1.  Load the editor.
    2.  Switch to the "TEMPLATES" tab.
    3.  Apply a template.
    4.  Verify the rendered HTML/CSS structure in the preview.
    5.  Take screenshots of different styles.

### Manual Verification
- The user can verify the visual fidelity in the browser.


---

## Version 29 (from 022f1342-c933-4c25-bb33-7b6241caaeb3)


## Goal
Upgrade the template rendering engine in `VT_E1.html` to match the visual quality and features of the standalone `015b4` editor. This includes full visual parity for all 14 styles and improved animation handling.

## Proposed Changes

### VT_E1.html

#### [MODIFY] CSS Styles
- Update Google Fonts import to include `Inter` and `Space Mono`.
- Add `:root` variables for colors (`--lime`, `--cyan`, etc.).
- Add utility classes for neo-brutalist shadows:
    - `.neo-shadow`
    - `.neo-shadow-lg`
    - `.neo-shadow-xl`
- Add glitch animation CSS from the original source.

#### [MODIFY] `renderTemplateAsset`
- Rewrite the `renderByStyle` inner function to return JSX that matches the HTML structure and styling of the original standalone editor.
- Ensure `secondary` text is correctly placed (e.g., as a badge in `neo-brutalist`).
- Implement the complex gradients and layouts for `pill`, `cyber`, `y2k-window`, etc.

#### [MODIFY] `templateAnimInfluence`
- Refine the JS-based animation values to feel closer to the CSS `@keyframes`.

## Verification Plan

### Automated Tests
- I'll use `chrome-devtools-mcp` to:
    1.  Load the editor.
    2.  Switch to the "TEMPLATES" tab.
    3.  Apply a template.
    4.  Verify the rendered HTML/CSS structure in the preview.
    5.  Take screenshots of different styles.

### Manual Verification
- The user can verify the visual fidelity in the browser.


---

## Version 30 (from 2be51503-ddb1-4038-92db-eeaa756afcbf)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Implementation plan for three VT_E1 modifications:
1. Add 6th 'TEMPLATE' button to ADD MEDIA group (line ~4199)
2. Template Creator modal with two-step flow: pick preset combo → choose visual style + customize icon/text/color → add to timeline
3. Replace icon text input with curated dropdown library (both in Template Runtime panel and Creator modal)

Covers state management, new addTemplateToTimeline() function, ICON_LIBRARY constant, and UI layout for the popup modal.
- updatedAt: 2026-04-28T22:58:21.239767Z
- requestFeedback: True


Add a 6th "TEMPLATE" button to the ADD MEDIA group that opens a two-step creation flow, and replace the icon text input with a searchable dropdown library.

## Proposed Changes

### 1. ADD MEDIA Group — 6th Template Button

#### [MODIFY] [VT_E1.html](file:///Users/cwb/Downloads/viewtube/docs/VT_E1.html)

**Lines ~4199–4206**: Add a purple "TEMPLATE" button after the Audio button. Clicking opens a popup modal (`showTemplateCreator` state) instead of directly adding a layer.

```diff
 <button className="neo-btn" style={{ background: COLORS.blue }} onClick={() => audioUploadRef.current?.click()}><Upload size={14} />Add Audio/MP3</button>
+<button className="neo-btn" style={{ background: COLORS.purple, color: '#fff' }} onClick={() => setShowTemplateCreator(true)}><Sparkles size={14} />Template</button>
```

Grid stays `grid-cols-2`. TEXT spans 2 cols, SHAPE+IMAGE row, VIDEO+AUDIO row, TEMPLATE spans 2 cols (bottom).

---

### 2. Template Creator Modal — Two-Step Flow

New state variables at ~line 1293:
```js
const [showTemplateCreator, setShowTemplateCreator] = useState(false);
const [tplCreatorStep, setTplCreatorStep] = useState(1); // 1=pick combo, 2=pick style
const [tplCreatorCombo, setTplCreatorCombo] = useState(null);
const [tplCreatorStyle, setTplCreatorStyle] = useState('neo-brutalist');
const [tplCreatorIcon, setTplCreatorIcon] = useState('sparkles');
const [tplCreatorPrimary, setTplCreatorPrimary] = useState('');
const [tplCreatorSecondary, setTplCreatorSecondary] = useState('');
const [tplCreatorColor, setTplCreatorColor] = useState('#40C6E9');
```

**Step 1 — Pick Combo or Start Custom**:
- Grid of preset combos derived from existing `TEMPLATE_PRESET_LIST` (42 items) — shown as small buttons with icon + name
- Each button sets `tplCreatorCombo` with preset's primary/secondary/icon defaults → advances to Step 2
- "✨ CUSTOM" button at top starts with blank primary/secondary fields

**Step 2 — Pick Visual Style + Customize**:
- Style selector dropdown (14 `STYLE_VARIANT_REGISTRY` options) with color-coded preview
- Editable primary text, secondary text
- Icon picker dropdown (see §4 below)
- Color picker
- "ADD TO TIMELINE" button → calls new `addTemplateToTimeline()` function

#### New function: `addTemplateToTimeline()`

Merges logic from `convert0153dPresetToV2()` + `addLayerWithClip()`:

```js
const addTemplateToTimeline = () => {
  const preset = {
    id: uid('tpl'),
    title: tplCreatorPrimary || 'TEMPLATE',
    primary: tplCreatorPrimary,
    secondary: tplCreatorSecondary,
    color: tplCreatorColor,
    style: tplCreatorStyle,
    icon: tplCreatorIcon
  };
  const asset = motionAssetFromPreset(preset);
  // Create template layer + clip at playhead on first visual track
  // Same pattern as addLayerWithClip('template') but with motionAsset populated
  setShowTemplateCreator(false);
  setTplCreatorStep(1);
};
```

---

### 3. Template Creator Modal UI

Rendered at bottom of component tree (near other modals). Uses `media-popup-overlay` + `media-popup-card` classes that already exist in VT_E1:

```
┌─────────────────────────────────────┐
│ ✕  CREATE TEMPLATE                  │
├─────────────────────────────────────┤
│ Step 1: CHOOSE PRESET              │
│ ┌──────┐┌──────┐┌──────┐┌──────┐  │
│ │ ✨   ││🔔SUB ││👍LIKE││💬CMNT│  │
│ │CUSTOM││SCRIBE││VIDEO ││     │  │
│ └──────┘└──────┘└──────┘└──────┘  │
│ ┌──────┐┌──────┐┌──────┐┌──────┐  │
│ │↗SHARE││@     ││YT URL││⭐WOW │  │
│ │      ││HANDLE││      ││     │  │
│ └──────┘└──────┘└──────┘└──────┘  │
│ ... (42 presets + custom)          │
├─────────────────────────────────────┤
│ Step 2: STYLE & CUSTOMIZE          │
│ [Style: ▼ neo-brutalist ]          │
│ [Primary: SUBSCRIBE_____ ]         │
│ [Secondary: ____________ ]         │
│ [Icon: ▼ bell          🔔]         │
│ [Color: ██████████ ]               │
│ ┌───────────────────────────┐      │
│ │   ★ ADD TO TIMELINE ★    │      │
│ └───────────────────────────┘      │
└─────────────────────────────────────┘
```

---

### 4. Icon Dropdown Library (replaces text input)

**Both** in the Template Creator modal AND the existing Template Runtime panel (~line 4271–4276):

Replace `<input>` with a `<select>` dropdown populated from Lucide icons relevant to templates.

Curated icon list (covers all 42 preset icons + useful extras):

```js
const ICON_LIBRARY = [
  'sparkles','bell','thumbs-up','message-square','share-2','dollar-sign',
  'heart','star','crown','award','zap','play-circle','bookmark','terminal',
  'shopping-bag','user','youtube','twitter','instagram','twitch','facebook',
  'alert-triangle','x-circle','loader','info','check-circle','hard-drive',
  'flag','bar-chart','users','mail','type','image','palette','layout-grid',
  'music','camera','film','mic','headphones','globe','link','at-sign',
  'hash','search','eye','shield','lock','rocket','flame','target',
  'trending-up','gift','coffee','scissors','feather','pen-tool','compass'
];
```

Rendered as `<select>` with icon name displayed. Preview icon shown next to dropdown:

```jsx
<div className="flex items-center gap-2">
  <select value={icon} onChange={e => setIcon(e.target.value)}
    className="w-full border-2 border-black p-1 text-[10px] font-black uppercase bg-white rounded-md">
    {ICON_LIBRARY.map(name => (
      <option key={name} value={name}>{name}</option>
    ))}
  </select>
  <TemplateIconByName iconName={icon} size={18} />
</div>
```

> [!IMPORTANT]
> This replaces the text `<input>` at line 4271–4276 in the Template Runtime panel, **and** is used in the new Template Creator modal.

---

### 5. Summary of All Changes

| Location | Change |
|---|---|
| ~L1293 | Add 7 new state variables for template creator |
| ~L1971 | Add `addTemplateToTimeline()` function near `addLayerWithClip()` |
| ~L4199–4206 | Add 6th TEMPLATE button to ADD MEDIA grid |
| ~L4271–4276 | Replace icon `<input>` with `<select>` dropdown + preview in Template Runtime |
| New block near modals | Template Creator popup modal (overlay + card) |
| ~L380 (constants) | Add `ICON_LIBRARY` array |

## Open Questions

> [!IMPORTANT]
> **Combo grouping**: Should preset combos be grouped by category (Social, CTA, Retro, Widgets, etc.) or shown flat? Grouping matches the current 14 style families. Flat is simpler.

> [!NOTE]
> The existing `showTemplateChooser` state at line 1293 is declared but never used in the UI. Will repurpose/remove in favor of `showTemplateCreator`.

## Verification Plan

### Manual Verification
1. Open VT_E1.html in browser
2. Verify 6 buttons visible in ADD MEDIA group
3. Click TEMPLATE → modal opens with Step 1 preset grid
4. Pick a combo → Step 2 shows style/icon/color/text editors
5. Click ADD TO TIMELINE → template clip appears on timeline at playhead
6. Select template clip → Template Runtime panel shows icon dropdown (not text input)
7. Change icon via dropdown → preview updates, canvas reflects new icon


---

## Version 31 (from 2be51503-ddb1-4038-92db-eeaa756afcbf)


Add a 6th "TEMPLATE" button to the ADD MEDIA group that opens a two-step creation flow, and replace the icon text input with a searchable dropdown library.

## Proposed Changes

### 1. ADD MEDIA Group — 6th Template Button

#### [MODIFY] [VT_E1.html](file:///Users/cwb/Downloads/viewtube/docs/VT_E1.html)

**Lines ~4199–4206**: Add a purple "TEMPLATE" button after the Audio button. Clicking opens a popup modal (`showTemplateCreator` state) instead of directly adding a layer.

```diff
 <button className="neo-btn" style={{ background: COLORS.blue }} onClick={() => audioUploadRef.current?.click()}><Upload size={14} />Add Audio/MP3</button>
+<button className="neo-btn" style={{ background: COLORS.purple, color: '#fff' }} onClick={() => setShowTemplateCreator(true)}><Sparkles size={14} />Template</button>
```

Grid stays `grid-cols-2`. TEXT spans 2 cols, SHAPE+IMAGE row, VIDEO+AUDIO row, TEMPLATE spans 2 cols (bottom).

---

### 2. Template Creator Modal — Two-Step Flow

New state variables at ~line 1293:
```js
const [showTemplateCreator, setShowTemplateCreator] = useState(false);
const [tplCreatorStep, setTplCreatorStep] = useState(1); // 1=pick combo, 2=pick style
const [tplCreatorCombo, setTplCreatorCombo] = useState(null);
const [tplCreatorStyle, setTplCreatorStyle] = useState('neo-brutalist');
const [tplCreatorIcon, setTplCreatorIcon] = useState('sparkles');
const [tplCreatorPrimary, setTplCreatorPrimary] = useState('');
const [tplCreatorSecondary, setTplCreatorSecondary] = useState('');
const [tplCreatorColor, setTplCreatorColor] = useState('#40C6E9');
```

**Step 1 — Pick Combo or Start Custom**:
- Grid of preset combos derived from existing `TEMPLATE_PRESET_LIST` (42 items) — shown as small buttons with icon + name
- Each button sets `tplCreatorCombo` with preset's primary/secondary/icon defaults → advances to Step 2
- "✨ CUSTOM" button at top starts with blank primary/secondary fields

**Step 2 — Pick Visual Style + Customize**:
- Style selector dropdown (14 `STYLE_VARIANT_REGISTRY` options) with color-coded preview
- Editable primary text, secondary text
- Icon picker dropdown (see §4 below)
- Color picker
- "ADD TO TIMELINE" button → calls new `addTemplateToTimeline()` function

#### New function: `addTemplateToTimeline()`

Merges logic from `convert0153dPresetToV2()` + `addLayerWithClip()`:

```js
const addTemplateToTimeline = () => {
  const preset = {
    id: uid('tpl'),
    title: tplCreatorPrimary || 'TEMPLATE',
    primary: tplCreatorPrimary,
    secondary: tplCreatorSecondary,
    color: tplCreatorColor,
    style: tplCreatorStyle,
    icon: tplCreatorIcon
  };
  const asset = motionAssetFromPreset(preset);
  // Create template layer + clip at playhead on first visual track
  // Same pattern as addLayerWithClip('template') but with motionAsset populated
  setShowTemplateCreator(false);
  setTplCreatorStep(1);
};
```

---

### 3. Template Creator Modal UI

Rendered at bottom of component tree (near other modals). Uses `media-popup-overlay` + `media-popup-card` classes that already exist in VT_E1:

```
┌─────────────────────────────────────┐
│ ✕  CREATE TEMPLATE                  │
├─────────────────────────────────────┤
│ Step 1: CHOOSE PRESET              │
│ ┌──────┐┌──────┐┌──────┐┌──────┐  │
│ │ ✨   ││🔔SUB ││👍LIKE││💬CMNT│  │
│ │CUSTOM││SCRIBE││VIDEO ││     │  │
│ └──────┘└──────┘└──────┘└──────┘  │
│ ┌──────┐┌──────┐┌──────┐┌──────┐  │
│ │↗SHARE││@     ││YT URL││⭐WOW │  │
│ │      ││HANDLE││      ││     │  │
│ └──────┘└──────┘└──────┘└──────┘  │
│ ... (42 presets + custom)          │
├─────────────────────────────────────┤
│ Step 2: STYLE & CUSTOMIZE          │
│ [Style: ▼ neo-brutalist ]          │
│ [Primary: SUBSCRIBE_____ ]         │
│ [Secondary: ____________ ]         │
│ [Icon: ▼ bell          🔔]         │
│ [Color: ██████████ ]               │
│ ┌───────────────────────────┐      │
│ │   ★ ADD TO TIMELINE ★    │      │
│ └───────────────────────────┘      │
└─────────────────────────────────────┘
```

---

### 4. Icon Dropdown Library (replaces text input)

**Both** in the Template Creator modal AND the existing Template Runtime panel (~line 4271–4276):

Replace `<input>` with a `<select>` dropdown populated from Lucide icons relevant to templates.

Curated icon list (covers all 42 preset icons + useful extras):

```js
const ICON_LIBRARY = [
  'sparkles','bell','thumbs-up','message-square','share-2','dollar-sign',
  'heart','star','crown','award','zap','play-circle','bookmark','terminal',
  'shopping-bag','user','youtube','twitter','instagram','twitch','facebook',
  'alert-triangle','x-circle','loader','info','check-circle','hard-drive',
  'flag','bar-chart','users','mail','type','image','palette','layout-grid',
  'music','camera','film','mic','headphones','globe','link','at-sign',
  'hash','search','eye','shield','lock','rocket','flame','target',
  'trending-up','gift','coffee','scissors','feather','pen-tool','compass'
];
```

Rendered as `<select>` with icon name displayed. Preview icon shown next to dropdown:

```jsx
<div className="flex items-center gap-2">
  <select value={icon} onChange={e => setIcon(e.target.value)}
    className="w-full border-2 border-black p-1 text-[10px] font-black uppercase bg-white rounded-md">
    {ICON_LIBRARY.map(name => (
      <option key={name} value={name}>{name}</option>
    ))}
  </select>
  <TemplateIconByName iconName={icon} size={18} />
</div>
```

> [!IMPORTANT]
> This replaces the text `<input>` at line 4271–4276 in the Template Runtime panel, **and** is used in the new Template Creator modal.

---

### 5. Summary of All Changes

| Location | Change |
|---|---|
| ~L1293 | Add 7 new state variables for template creator |
| ~L1971 | Add `addTemplateToTimeline()` function near `addLayerWithClip()` |
| ~L4199–4206 | Add 6th TEMPLATE button to ADD MEDIA grid |
| ~L4271–4276 | Replace icon `<input>` with `<select>` dropdown + preview in Template Runtime |
| New block near modals | Template Creator popup modal (overlay + card) |
| ~L380 (constants) | Add `ICON_LIBRARY` array |

## Open Questions

> [!IMPORTANT]
> **Combo grouping**: Should preset combos be grouped by category (Social, CTA, Retro, Widgets, etc.) or shown flat? Grouping matches the current 14 style families. Flat is simpler.

> [!NOTE]
> The existing `showTemplateChooser` state at line 1293 is declared but never used in the UI. Will repurpose/remove in favor of `showTemplateCreator`.

## Verification Plan

### Manual Verification
1. Open VT_E1.html in browser
2. Verify 6 buttons visible in ADD MEDIA group
3. Click TEMPLATE → modal opens with Step 1 preset grid
4. Pick a combo → Step 2 shows style/icon/color/text editors
5. Click ADD TO TIMELINE → template clip appears on timeline at playhead
6. Select template clip → Template Runtime panel shows icon dropdown (not text input)
7. Change icon via dropdown → preview updates, canvas reflects new icon


---

## Version 32 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


A thin, fixed header bar that slides in from the right on load, consolidating the dashboard title, account controls, widget rearrangement tools, and a configurable live ticker into one premium module.

## User Review Required

> [!IMPORTANT]
> **Color Palette**: The v4 reference uses black/red for the topbar and marquee. Per your request, this plan replaces those with a **#C9F830 (lime)** header background and a **#40C6E9 (cyan) → #579AFF (blue) gradient** ticker strip — matching the existing Neo-Brutalist palette. Does this work, or would you prefer a different pair?

> [!IMPORTANT]
> **System-Micro-Stack Fate**: Dashboard controls (Rearrange, Lock, Widgets, Reset, Export, Import) currently live inside the `system-micro-stack` widget. This plan moves them into the header. Should we **remove** `system-micro-stack` entirely, or **keep it** as a settings-only widget (API key, model choice, sync status)?

## Proposed Changes

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER BAR (fixed, 48px tall, slides in from right)              │
│ ┌──────┬──────────────────────────┬──────────────────────────┐   │
│ │ LOGO │    DASHBOARD TITLE       │  CONTROLS (right side)   │   │
│ │  VT  │    "Widget Lab"          │  🔒 ✏️ 📦 ⬇ ⬆ ⟲ ⚙️   │   │
│ └──────┴──────────────────────────┴──────────────────────────┘   │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ TICKER (28px, marquee)  📈 TRENDING  · 💬 COMMENT · ⚡ MIL │   │
│ └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

### Component: DashboardHeader

#### [NEW] [DashboardHeader.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/DashboardHeader.tsx)

A new React component with three horizontal zones:

**Zone 1 — Identity (left)**
- ViewTube logo mark (tiny `VT` in a circle, matching sidebar)
- Dashboard title: `"WIDGET LAB"` in weight-1000 uppercase, 18px
- Editable on double-click (saved to localStorage)

**Zone 2 — Controls (right)**
- Compact icon buttons (24×24, same Neo-Brutalist spec as widget header buttons):
  - **Rearrange** (Edit3) — toggles `editMode`
  - **Lock/Unlock** (Lock/LockOpen) — toggles `layout.locked`
  - **Widgets** (Layers) — opens `WidgetPickerPanel`
  - **Reset** (RotateCcw) — resets layout
  - **Export** (Download) — exports JSON
  - **Import** (Upload) — imports JSON
  - **Settings** (Settings) — opens a dropdown with API key/model config (extracted from system-micro-stack)

**Zone 3 — Ticker Strip (bottom edge, 28px)**
- CSS `@keyframes marquee` animation (identical to dashboard-v4.html pattern)
- Scrolling items from user-configurable feed sources
- Small **"LIVE"** label on left in a pill badge (lime background, not red)
- **"⚙"** gear icon on right to open ticker config modal

#### Ticker Feed Sources (user-configurable):
| Source | Default | Description |
|---|---|---|
| `comments` | ✅ ON | Latest comments from recent uploads |
| `milestones` | ✅ ON | Sub milestones, view milestones |
| `news` | ✅ ON | YouTube/creator economy headlines |
| `subscriptions` | ❌ OFF | Activity from channels user subscribes to |
| `alerts` | ✅ ON | System alerts (API quota, sync status) |

Config stored in localStorage under `vt-ticker-config`.

---

### Styling

#### [MODIFY] [toolboxWidgetSystem.css](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/toolboxWidgetSystem.css)

Add new CSS block for the header module:

```css
/* ═══ DASHBOARD HEADER MODULE ═══ */
.dashboard-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 3px solid #000;
  border-radius: 0 0 12px 12px;
  margin: 0 -4px 16px;
  overflow: hidden;
  box-shadow: 0 4px 0 0 rgba(0,0,0,0.08);
  /* Slide-in animation */
  animation: headerSlideIn 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform: translateX(100%);
}

@keyframes headerSlideIn {
  to { transform: translateX(0); }
}

.dashboard-header-bar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #C9F830;
  border-bottom: 3px solid #000;
}

.dashboard-header-ticker {
  height: 28px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(90deg, #40C6E9, #579AFF);
}
```

Color tokens:
- **Header bar**: `#C9F830` (lime) — matches KPI cluster and revenue widgets
- **Ticker strip**: `#40C6E9 → #579AFF` gradient — matches AI widgets
- **LIVE pill**: `#C9F830` text on `#000` bg
- **Highlight tags**: `#FFE357` (yellow) for trending, `#FF83EA` (pink) for milestones
- **Strokes**: `#000` (standard Neo-Brutalist 3px)

---

### Integration

#### [MODIFY] [DashboardCanvas.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/DashboardCanvas.tsx)

- Import and render `<DashboardHeader />` above the `<DndContext>` grid
- Pass `dashboardControls` props to the header instead of (or in addition to) the system-micro-stack widget
- Pass `data` for ticker content (comments, milestones, channel name)

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRenderer.tsx)

- Remove dashboard control buttons from the `system-micro-stack` widget body (keep API key/model/sync as standalone settings widget)
- Remove the static `alerts-ticker` widget rendering (replaced by header ticker)

---

### Ticker Config Modal

#### [NEW] [TickerConfigModal.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/TickerConfigModal.tsx)

A small popup/dropdown modal (Neo-Brutalist styled) that appears when clicking the gear icon on the ticker strip:

- Toggle switches for each feed source (comments, milestones, news, subscriptions, alerts)
- Input field for custom messages (e.g., "Remember to batch-edit thumbnails this week")
- Speed slider (slow / medium / fast marquee)
- Saved to `localStorage` under `vt-ticker-config`

---

## Open Questions

1. **Dashboard Title**: Should the title be user-editable (double-click to rename), or always say "WIDGET LAB"?
2. **Ticker Data**: For comments, should we show the 3 most recent, or rotate through the last 10?
3. **Dark Mode**: Should the header respect dark mode, or stay light as a persistent anchor?

## Verification Plan

### Automated Tests
- Verify header renders above the grid
- Verify ticker animation runs with CSS `animation` property
- Verify controls (rearrange, lock, reset) still function correctly
- Verify ticker config persists across reloads via localStorage

### Manual Verification
- Visual inspection: header slides in from right on page load
- Visual inspection: ticker scrolls smoothly with live data
- Visual inspection: controls match Neo-Brutalist 24×24 button spec
- Test: toggling ticker sources shows/hides corresponding items


---

## Version 33 (from ccec471b-f845-46ca-8ead-00cbb121fde5)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Creating implementation plan for rebuilding infrastructure components.
- updatedAt: 2026-04-29T22:19:35.582085Z


Rebuild generalized source-module placeholders in `sourceModules.tsx` with high-fidelity components extracted from legacy HTML sources (`toolbox_component_set_1.html`, `TOOLS:SUBTOOLS:WIDGITS.html`, `ustube-ui-kit-3.html`, and `shim.html`).

## User Review Required

> [!IMPORTANT]
> The migration involves replacing generic React components with exact visual representations of legacy HTML/CSS. This will significantly change the visual fidelity of the `SectionSourcesLab` dashboard.

## Proposed Changes

### Reference Studio Infrastructure

#### [MODIFY] [sourceModules.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/referenceStudio/sourceModules.tsx)
- Upgrade `KpiSixPack` to match the `metric-card` style.
- Replace `ToggleCheckRadioBlock` and `StrikeTaskList` with high-fidelity versions.
- Implement specific renders for:
    - **Section E Box 02** (Graphic, Minimalist, Cinematic)
    - **Section E Box 05** (Channel URL, Category, Daily Stats)
    - **Section E Box 13** (Sidebar Nav)
    - **Section E Box 14** (Collapsible Tree)
    - **Section E Box 17/18** (Tooltip/Modal)
    - **Section E Box 22** (Video Cards/Status Pills)
- Implement `Section C` toolboxes (Analytics Protocol, Viral Passing, Hook Architect) using the `subtoolbox` rules (header + icon rail + borders).

### Documentation

#### [NEW] [ACTION_LOG.md](file:///Users/cwb/Downloads/viewtube/viewtubeX/ACTION_LOG.md)
- Initialize the action log to track infrastructure recovery progress.

## Verification Plan

### Automated Tests
- N/A (Visual/Integration focus)

### Manual Verification
- Verify that components in `SectionSourcesLab.tsx` reflect the high-fidelity styles.
- Ensure hover effects and transitions match the legacy behavior.


---

## Version 34 (from ccec471b-f845-46ca-8ead-00cbb121fde5)


Rebuild generalized source-module placeholders in `sourceModules.tsx` with high-fidelity components extracted from legacy HTML sources (`toolbox_component_set_1.html`, `TOOLS:SUBTOOLS:WIDGITS.html`, `ustube-ui-kit-3.html`, and `shim.html`).

## User Review Required

> [!IMPORTANT]
> The migration involves replacing generic React components with exact visual representations of legacy HTML/CSS. This will significantly change the visual fidelity of the `SectionSourcesLab` dashboard.

## Proposed Changes

### Reference Studio Infrastructure

#### [MODIFY] [sourceModules.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/referenceStudio/sourceModules.tsx)
- Upgrade `KpiSixPack` to match the `metric-card` style.
- Replace `ToggleCheckRadioBlock` and `StrikeTaskList` with high-fidelity versions.
- Implement specific renders for:
    - **Section E Box 02** (Graphic, Minimalist, Cinematic)
    - **Section E Box 05** (Channel URL, Category, Daily Stats)
    - **Section E Box 13** (Sidebar Nav)
    - **Section E Box 14** (Collapsible Tree)
    - **Section E Box 17/18** (Tooltip/Modal)
    - **Section E Box 22** (Video Cards/Status Pills)
- Implement `Section C` toolboxes (Analytics Protocol, Viral Passing, Hook Architect) using the `subtoolbox` rules (header + icon rail + borders).

### Documentation

#### [NEW] [ACTION_LOG.md](file:///Users/cwb/Downloads/viewtube/viewtubeX/ACTION_LOG.md)
- Initialize the action log to track infrastructure recovery progress.

## Verification Plan

### Automated Tests
- N/A (Visual/Integration focus)

### Manual Verification
- Verify that components in `SectionSourcesLab.tsx` reflect the high-fidelity styles.
- Ensure hover effects and transitions match the legacy behavior.


---

## Version 35 (from artifacts)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Plan to reconstruct the ViewTube Editor (VT_E1) using the soft, claymorphism aesthetic from iPod.HTML.
- updatedAt: 2026-05-01T17:55:50.578210Z
- requestFeedback: True


This plan outlines recreating the ViewTube Editor (VT_E1) prototype as a pure HTML/CSS/JS file, mapping its functional layout to the "Soft Flow" claymorphism aesthetic found in `iPod.HTML`.

## Goal
Combine the comprehensive video editor layout from `NEOBRUTALIST_VT_EDITOR.txt` with the soft, shadow-driven visual style of `iPod.HTML`.

## User Review Required
> [!IMPORTANT]
> **Aesthetic Shift:** We are replacing the harsh, 4px-bordered Neo-Brutalist UI with the neumorphic/claymorphic shadows (`--inner-shadow`, `--outer-shadow`) from `iPod.HTML`.
> **Filename:** I will create `VT_E1_SoftFlow.html`. Let me know if you prefer a different name.

## Proposed Changes

### [NEW] `VT_E1_SoftFlow.html`
A single-file HTML prototype containing:

1.  **Global CSS:**
    *   Import fonts (`Inter`, `Righteous`).
    *   Import Lucide icons.
    *   Port all CSS variables (`--bg`, `--outer-shadow`, `--inner-shadow`, etc.) and utility classes (`.clay-card`, `.clay-inset`, `.btn-pill`) from `iPod.HTML`.

2.  **Left Sidebar (from VTE):**
    *   **Logo:** "VIEWTUBE" styled with soft text shadows.
    *   **Navigation:** Buttons for Dashboard, Studio, Calendar, Shorts, Performance, Settings (styled as soft `.btn-pill`).
    *   **AI Assistant:** A `.clay-inset` box at the bottom featuring the "Ask AI-ssistant..." input and action button.

3.  **Main Content Area (from VTE):**
    *   **Header:** Toolbar containing tools (Cut, Add Track, Settings) rendered as soft icon buttons (`.btn-sq`).
    *   **Preview Window:** A prominent `.clay-inset` area acting as the video stage, with a soft overlay for playback controls (Skip Back, Play, Skip Forward, Timecode).
    *   **Timeline:** 
        *   Ruler and global keyframe markers.
        *   Track rows (`V1`, `V2`) styled as inset strips.
        *   Media clips styled as convex blocks (`box-shadow: var(--outer-shadow)`) spanning the track, with colored accents and soft draggable edges.

4.  **JavaScript:**
    *   Include the Lucide icon initialization.
    *   Basic interactivity (button press feedback, playhead drag simulation) similar to the script in `iPod.HTML` to make the prototype feel "alive".

## Verification Plan
*   **Visual Check:** Open `VT_E1_SoftFlow.html` in a browser to ensure no sharp borders exist, confirming the Neumorphic style is fully applied.
*   **Layout Check:** Verify all components from the `NEOBRUTALIST_VT_EDITOR` (Sidebar, AI Assistant, Stage, Timeline, Playback controls) are present and correctly positioned.


---

## Version 36 (from artifacts)


This plan outlines recreating the ViewTube Editor (VT_E1) prototype as a pure HTML/CSS/JS file, mapping its functional layout to the "Soft Flow" claymorphism aesthetic found in `iPod.HTML`.

## Goal
Combine the comprehensive video editor layout from `NEOBRUTALIST_VT_EDITOR.txt` with the soft, shadow-driven visual style of `iPod.HTML`.

## User Review Required
> [!IMPORTANT]
> **Aesthetic Shift:** We are replacing the harsh, 4px-bordered Neo-Brutalist UI with the neumorphic/claymorphic shadows (`--inner-shadow`, `--outer-shadow`) from `iPod.HTML`.
> **Filename:** I will create `VT_E1_SoftFlow.html`. Let me know if you prefer a different name.

## Proposed Changes

### [NEW] `VT_E1_SoftFlow.html`
A single-file HTML prototype containing:

1.  **Global CSS:**
    *   Import fonts (`Inter`, `Righteous`).
    *   Import Lucide icons.
    *   Port all CSS variables (`--bg`, `--outer-shadow`, `--inner-shadow`, etc.) and utility classes (`.clay-card`, `.clay-inset`, `.btn-pill`) from `iPod.HTML`.

2.  **Left Sidebar (from VTE):**
    *   **Logo:** "VIEWTUBE" styled with soft text shadows.
    *   **Navigation:** Buttons for Dashboard, Studio, Calendar, Shorts, Performance, Settings (styled as soft `.btn-pill`).
    *   **AI Assistant:** A `.clay-inset` box at the bottom featuring the "Ask AI-ssistant..." input and action button.

3.  **Main Content Area (from VTE):**
    *   **Header:** Toolbar containing tools (Cut, Add Track, Settings) rendered as soft icon buttons (`.btn-sq`).
    *   **Preview Window:** A prominent `.clay-inset` area acting as the video stage, with a soft overlay for playback controls (Skip Back, Play, Skip Forward, Timecode).
    *   **Timeline:** 
        *   Ruler and global keyframe markers.
        *   Track rows (`V1`, `V2`) styled as inset strips.
        *   Media clips styled as convex blocks (`box-shadow: var(--outer-shadow)`) spanning the track, with colored accents and soft draggable edges.

4.  **JavaScript:**
    *   Include the Lucide icon initialization.
    *   Basic interactivity (button press feedback, playhead drag simulation) similar to the script in `iPod.HTML` to make the prototype feel "alive".

## Verification Plan
*   **Visual Check:** Open `VT_E1_SoftFlow.html` in a browser to ensure no sharp borders exist, confirming the Neumorphic style is fully applied.
*   **Layout Check:** Verify all components from the `NEOBRUTALIST_VT_EDITOR` (Sidebar, AI Assistant, Stage, Timeline, Playback controls) are present and correctly positioned.


---

## Version 37 (from 99877096-e967-4c05-84e0-38457938934b)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Create implementation plan for export functionality.
- updatedAt: 2026-05-01T22:21:42.724243Z


The user needs to be able to download processed analytics data and AI-generated reports. While some export features exist in the "Data Transparency Center," they are not easily discoverable or available directly in the analytics views (Research Lab).

## User Review Required

> [!IMPORTANT]
> I am adding direct "Download" buttons to the **Matrix Overlay** and **AI Diagnostic Report**. These will allow immediate export of the currently viewed data and insights.

## Proposed Changes

### [Component Name] [Analytics Services]

#### [MODIFY] [dataExport.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/dataExport.ts)
- Export the `rowsToCsv` utility so it can be reused in the UI components for on-the-fly CSV generation.

### [Component Name] [UI Components]

#### [MODIFY] [UniversalDataTable.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/components/UniversalDataTable.tsx)
- Add an "Export CSV" button to the control bar.
- Implement `handleExportCSV` using the exported `rowsToCsv` utility.
- Ensure the export respects the current search/filter state.

#### [MODIFY] [ReportViewer.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/components/ReportViewer.tsx)
- Add a "Download Report" button (Markdown format).
- Implement report generation logic that compiles the executive summary, metrics, and insights into a clean Markdown file.

#### [MODIFY] [Sidebar.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/components/Sidebar.tsx)
- Add a visible link to the **Data Transparency Center** to improve discoverability of the main export hub.

## Verification Plan

### Automated Tests
- Manual verification of the downloaded CSV and Markdown files.

### Manual Verification
1. Navigate to Research Lab.
2. Open Matrix Overlay (Database icon).
3. Click "Export CSV" and verify content.
4. Generate an AI Report.
5. Click "Download Report" and verify the Markdown structure.
6. Verify the new "Data Transparency" link in the Sidebar.


---

## Version 38 (from 99877096-e967-4c05-84e0-38457938934b)


The user needs to be able to download processed analytics data and AI-generated reports. While some export features exist in the "Data Transparency Center," they are not easily discoverable or available directly in the analytics views (Research Lab).

## User Review Required

> [!IMPORTANT]
> I am adding direct "Download" buttons to the **Matrix Overlay** and **AI Diagnostic Report**. These will allow immediate export of the currently viewed data and insights.

## Proposed Changes

### [Component Name] [Analytics Services]

#### [MODIFY] [dataExport.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/services/dataExport.ts)
- Export the `rowsToCsv` utility so it can be reused in the UI components for on-the-fly CSV generation.

### [Component Name] [UI Components]

#### [MODIFY] [UniversalDataTable.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/components/UniversalDataTable.tsx)
- Add an "Export CSV" button to the control bar.
- Implement `handleExportCSV` using the exported `rowsToCsv` utility.
- Ensure the export respects the current search/filter state.

#### [MODIFY] [ReportViewer.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/components/ReportViewer.tsx)
- Add a "Download Report" button (Markdown format).
- Implement report generation logic that compiles the executive summary, metrics, and insights into a clean Markdown file.

#### [MODIFY] [Sidebar.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/components/Sidebar.tsx)
- Add a visible link to the **Data Transparency Center** to improve discoverability of the main export hub.

## Verification Plan

### Automated Tests
- Manual verification of the downloaded CSV and Markdown files.

### Manual Verification
1. Navigate to Research Lab.
2. Open Matrix Overlay (Database icon).
3. Click "Export CSV" and verify content.
4. Generate an AI Report.
5. Click "Download Report" and verify the Markdown structure.
6. Verify the new "Data Transparency" link in the Sidebar.


---

## Version 39 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Reorganize the default dashboard assembly into intentional rows and eliminate one-off inline styling across widget buttons/inputs/selects.

## User Review Required

> [!IMPORTANT]
> The default layout order below is interpreted directly from your request. Confirm it matches your intent before execution.

**Proposed Default Row Assembly:**

| Row | Widget | Default Size | Col Span |
|-----|--------|-------------|----------|
| 1 | Channel Overview (`kpi-cluster`) | `third` | 4 |
| 1 | Community Post (`community-post`) | `third` | 4 |
| 1 | Comment Responder (`comment-replier`) | `third` | 4 |
| 2 | Upload Cadence (`consistency-heatmap`) | `quarter` | 3 |
| 2 | Realtime Performance (`realtime-performance`) | `quarter` | 3 |
| 2 | Goals Tracker (`goals-tracker`) | `quarter` | 3 |
| 2 | Keyword Engine (`keyword-engine`) | `quarter` | 3 |
| 3 | AI Oracle (`daily-oracle`) | `half` | 6 |
| 3 | Ask Me (`ask-me`) | `half` | 6 |

All remaining widgets follow after Row 3 in current prioritized order.

## Open Questions

> [!IMPORTANT]
> **Community Post "fixed layout"** — From the screenshot, the current layout is: tab selector → textarea → actions footer. You said it needs a "fixed layout." Does that mean:
> - (A) The textarea should not be resizable and the widget should have a fixed internal structure at all sizes?
> - (B) Something else is broken about the layout that needs fixing?
> 
> I'll assume (A) — lock the internal proportions so type-selector, editor, and action bar always occupy fixed ratios regardless of widget height.

> [!NOTE]
> **Standardization scope** — This plan covers converting the Community Post and Comment Replier widgets to use the unified `vt-button`, `vt-input`, `vt-textarea`, and `vt-select` CSS classes already defined in `toolboxWidgetSystem.css`. Other widgets with inline button styles (e.g. `CollabMatchmakerWidget`) will also be flagged for cleanup, but those two are the priority since they appear in Row 1.

---

## Proposed Changes

### 1. Default Layout Order & Sizing

#### [MODIFY] [WidgetRegistry.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRegistry.ts)

- Change `defaultSize` for these widgets:
  - `kpi-cluster`: `"full"` → `"third"`
  - `community-post`: `"third"` → `"third"` (already correct)
  - `comment-replier`: current → `"third"`
  - `consistency-heatmap`: current → `"quarter"`
  - `realtime-performance`: current → `"quarter"`
  - `goals-tracker`: current → `"quarter"`
  - `keyword-engine`: current → `"quarter"`
  - `daily-oracle`: current → `"half"`
  - `ask-me`: current → `"half"`

- Rewrite `prioritizedOrder` array to match the 3-row assembly above, then append all remaining widgets.

---

### 2. Community Post Widget — Fixed Layout + Standardized UI

#### [MODIFY] [CommunityPostWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/CommunityPostWidget.tsx)

**Layout fixes:**
- Replace all inline `style={{}}` objects on buttons with `className="vt-button"` / `className="vt-button primary"`.
- Replace `widget-control-btn` (non-standard) → `vt-button`.
- Replace inline-styled type selector buttons → use CSS class `vt-tab-btn` (new).
- Lock textarea to `resize: none` (fixed layout).
- Set the action footer to `flex: 0` so it pins to bottom regardless of content height.
- Ensure the editor area uses `flex: 1; overflow-y: auto` for scrollable content that doesn't push buttons off-screen.

**Prop fix:**
- The `common` object is missing `onDecSize`, `onDecHeight`, and `onCycleHeight` — add them to match the new `WidgetShell` interface.

---

### 3. Comment Replier Widget — Standardized UI

#### [MODIFY] [CommentReplyWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/CommentReplyWidget.tsx)

**Button standardization:**
- Lines 399-419: Replace all three action buttons (CREATE REPLY, POST REPLY, SUGGEST VIDEOS) from inline `style={{...}}` → `className="vt-button"` / `className="vt-button primary"` / `className="vt-button secondary"`.
- Replace `brutal-input` class on reply textarea (line 362) → `vt-textarea`.
- Pagination buttons (lines 222-233): Replace inline styles with standardized classes.

**Prop fix:**
- Add missing `onDecSize` and `onDecHeight` to `common` object.

---

### 4. New CSS: Tab Button Class

#### [MODIFY] [toolboxWidgetSystem.css](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/toolboxWidgetSystem.css)

Add a standardized `.vt-tab-btn` class for type/tab selectors used in Community Post and other widgets:

```css
.dashboard-barrier .vt-tab-group {
  display: flex;
  gap: 2px;
  background: #f5f5f5;
  padding: 3px;
  border-radius: 8px;
  border: 3px solid #000;
}

.dashboard-barrier .vt-tab-btn {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  transition: all 0.15s ease;
}

.dashboard-barrier .vt-tab-btn.active {
  background: var(--widget-color, #FFB570);
  border-color: #000;
  box-shadow: 1px 1px 0 0 #000;
}
```

---

## Verification Plan

### Automated Tests
- `npm run build` — confirm no TypeScript errors from prop changes.

### Manual Verification
- Open dashboard and confirm Row 1/2/3 arrangement renders correctly at default.
- Resize Community Post widget through all 6 sizes → confirm layout doesn't break (textarea stays fixed, actions pin to bottom).
- Resize Comment Replier through all sizes → confirm buttons use standard Neo-Brutalist styling.
- Enter edit mode → confirm +W/-W +H/-H buttons work on all three row-1 widgets.


---

## Version 40 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Standardizing the Row 1 widgets (Channel Overview, Community Post, Comment Responder) to have unified heights, layouts, and industrial aesthetics. Fixing console errors related to charts and Lottie animations.

## User Review Required

> [!IMPORTANT]
> - **Unified Height**: Setting a fixed height for Row 1 widgets when in "tall" mode to ensure perfect alignment.
> - **Input Shadows**: Removing focus shadows from all input boxes globally; only changing border/text color on focus.
> - **Community Post Layout**: Refactoring the post style selector to be inline (icon + text) and removing internal dividers to save vertical space.

## Proposed Changes

### Dashboard UI System

#### [MODIFY] [toolboxWidgetSystem.css](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/toolboxWidgetSystem.css)
- Unified input focus styles (remove shadow).
- Standardized layout helper classes.
- Ensure `subtoolbox` has consistent border and radius logic.

#### [MODIFY] [WidgetShell.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetShell.tsx)
- Remove `VTLottie` dependency (unnecessary and error-prone).
- Replace Lottie AI button with a static SVG icon or Lucide Sparkles with animation.

#### [MODIFY] [storage.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/storage.ts)
- Update `heightBucketClassName` to use exact pixel heights for Row 1 consistency (e.g., `tall` = 420px).

### Row 1 Widgets

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRenderer.tsx)
- **KPI Cluster (Channel Overview)**: 
  - Increase profile picture size.
  - Decrease KPI card widths to accommodate larger sidebar.
  - Thicken borders (4px).
  - Add full-width footer with name, handle, and "Visit Channel" button.

#### [MODIFY] [CommunityPostWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/CommunityPostWidget.tsx)
- Icon next to title in post style selection.
- Remove divider line between buttons and text input.
- Match button sizes with other widgets (32px).
- Remove Lottie.

#### [MODIFY] [CommentReplyWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/CommentReplyWidget.tsx)
- Ensure consistent button sizing and spacing.

### Bug Fixes

#### [MODIFY] [BridgeEfficiencyWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/BridgeEfficiencyWidget.tsx)
- Fix `ResponsiveContainer` warnings by ensuring min-height/min-width is handled.

#### [MODIFY] [KeywordOverlapWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/KeywordOverlapWidget.tsx)
- Ensure chart container has proper sizing to avoid console errors.

## Verification Plan

### Automated Tests
- N/A (UI focused)

### Manual Verification
- Check Dashboard in browser.
- Verify Row 1 alignment (all same height).
- Verify Channel Overview pfp size and card borders.
- Verify Community Post style selector layout.
- Confirm console is free of Lottie 403 errors and Chart width -1 errors.


---

## Version 41 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Standardizing the Row 1 widgets (Channel Overview, Community Post, Comment Responder) and secondary charts to have unified heights, layouts, and industrial aesthetics. Fixing console errors related to charts and Lottie animations.

## User Review Required

> [!IMPORTANT]
> - **Unified Height**: Setting a fixed height for Row 1 widgets when in "tall" mode to ensure perfect alignment.
> - **Input Shadows**: Removing focus shadows from all input boxes globally; only changing border/text color on focus.
> - **Pie Chart Alignment**: Standardizing `AudienceMatrixWidget` and `FormatClashWidget` to use thick black strokes and consistent conic-gradient rendering.
> - **Chart Stabilization**: Fixing `ResponsiveContainer` warnings across all Recharts widgets.

## Proposed Changes

### Dashboard UI System

#### [MODIFY] [toolboxWidgetSystem.css](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/toolboxWidgetSystem.css)
- Unified input focus styles (remove shadow, just color border).
- Standardized layout helper classes for grids and flex stacks.
- Add `pie-stroke` helper for conic-gradients (simulated border with inner circle).

#### [MODIFY] [WidgetShell.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetShell.tsx)
- [DELETE] `VTLottie` dependency.
- Replace AI button Lottie with a static `Sparkles` icon with a subtle hover pulse.

#### [MODIFY] [storage.ts](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/storage.ts)
- Standardize `tall` height to a fixed pixel value for Row 1 consistency (e.g., `420px`).

### Row 1 Widgets

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRenderer.tsx)
- **KPI Cluster (Channel Overview)**: 
  - Thicken borders to 4px.
  - Increase profile picture size.
  - Decrease KPI card widths for sidebar breathing room.
  - Add full-width footer with "VISIT CHANNEL" button.

#### [MODIFY] [CommunityPostWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/CommunityPostWidget.tsx)
- Icon next to title in post style selection.
- Remove divider line between buttons and text input.
- Standardize button heights (32px).

#### [MODIFY] [CommentReplyWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/CommentReplyWidget.tsx)
- Ensure 32px buttons and unified input styles.

### Chart & Matrix Widgets

#### [MODIFY] [AudienceMatrixWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AudienceMatrixWidget.tsx)
- Add thick 3px black stroke to pie slices (using conic-gradient masking or SVG).
- Standardize spacing and labels.

#### [MODIFY] [FormatClashWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/FormatClashWidget.tsx)
- Align pie styling with `AudienceMatrixWidget`.
- Remove legacy inline styles in favor of CSS classes.

#### [MODIFY] [TrafficSourcesWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/TrafficSourcesWidget.tsx)
- Add 3px black strokes to SVG paths.
- Ensure `ResponsiveContainer` parity.

### Bug Fixes

#### [MODIFY] [BridgeEfficiencyWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/BridgeEfficiencyWidget.tsx)
#### [MODIFY] [KeywordOverlapWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/KeywordOverlapWidget.tsx)
- Wrap charts in `min-h-[0]` and `min-w-[0]` containers to fix Recharts width calculation errors.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
- Verify Row 1 widgets are perfectly aligned at the top.
- Check pie charts for thick black borders.
- Confirm no `VTLottie` related 403s or console warnings.
- Test input focus states (no shadows).


---

## Version 42 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


Finalizing visual and technical standardization for the ViewTube dashboard. Standardizing Row 1 widgets, KPI cards, and all chart components.

## User Review Required

> [!IMPORTANT]
> Pie-based widgets (`FormatClashWidget`, `AudienceMatrixWidget`, `TrafficSourcesWidget`) will be standardized to use SVG conic-gradients with uniform 3px black strokes. Legacy heterogeneous chart styles will be removed.

## Proposed Changes

### Dashboard Layout & Row 1 Standardization

#### [MODIFY] [WidgetRenderer.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/WidgetRenderer.tsx)
- Ensure all Row 1 widgets (`channel-overview`, `community-post`, `comment-responder`) are explicitly forced into the `tall` height bucket.
- Standardize Profile Picture size in KPI Cluster (Row 1).

#### [MODIFY] [CommunityPostWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/CommunityPostWidget.tsx)
- Standardize button heights to 32px.
- Remove horizontal dividers between input and buttons to match industrial Neo-Brutalist look.
- Align tab selector icons inline with text.

#### [MODIFY] [TagGeneratorWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/TagGeneratorWidget.tsx)
- Standardize action buttons to 32px height.
- Apply uniform 4px border and 12px border-radius tokens.

### Chart & Visualization Fixes

#### [MODIFY] [BridgeEfficiencyWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/BridgeEfficiencyWidget.tsx)
- Fix `ResponsiveContainer` warnings by ensuring `minHeight` is defined.

#### [MODIFY] [FormatClashWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/FormatClashWidget.tsx)
- Upgrade pie chart rendering to standard conic-gradient with 3px stroke.

#### [MODIFY] [AudienceMatrixWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/AudienceMatrixWidget.tsx)
- Upgrade pie chart rendering to standard conic-gradient with 3px stroke.

#### [MODIFY] [TrafficSourcesWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/TrafficSourcesWidget.tsx)
- Upgrade pie chart rendering to standard conic-gradient with 3px stroke.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no regression in production bundling.
- Validate browser console for `ResponsiveContainer` warnings.

### Manual Verification
- Visual inspection of Row 1 widget alignment.
- Verify consistent 32px button heights across all modified widgets.
- Verify uniform pie chart aesthetics.


---

## Version 43 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


This plan addresses layout, functionality, and storage issues in the Retention Simulator widget.

## User Review Required
No significant architectural changes require review; these are functional and cosmetic fixes to align with the Neo-Brutalist standard and add requested utility.

## Open Questions
None.

## Proposed Changes

### [MODIFY] `RetentionSimWidget.tsx`
- **Fix Height Controls**: Add `onCycleHeight` and `onDecHeight` to the destructured props and pass them into the `common` object for the `WidgetShell`. This will re-enable the `+H` / `-H` buttons.
- **Scroll Container**: Move `overflowY: "auto"` to the outermost `div` of the widget content. Remove nested `overflow: "auto"` on the results container so the entire widget scrolls as one document.
- **Fix Oval Dots**: Replace SVG `<circle>` elements with absolutely positioned HTML `<div>` elements overlaid on top of the SVG container. This avoids the stretching caused by `preserveAspectRatio="none"`.
- **Save Previous Reports**:
  - Introduce `localStorage` state for `savedReports` to map `videoId` -> `Analysis`.
  - When a report is generated, save it to `savedReports`.
  - When a video is selected, check if a report exists in `savedReports` and display it immediately.
- **Un-published Video Uploads**:
  - Add a hidden `<input type="file" accept="video/*" />`.
  - Add an "UPLOAD" button next to the dropdown menu.
  - On file selection, create a mock local video entry with the filename, append it to a `customVideos` state, and select it automatically.
- **Formatting the Search / Upload buttons**:
  - Refactor the top row controls to use `vt-button` and `vt-input` standards.
  - Ensure `flex-wrap` or appropriate `min-width` so buttons and inputs don't get squished uncontrollably.

## Verification Plan
- Verify height controls update widget size.
- Ensure dots are perfectly circular regardless of container width.
- Upload a local file and verify it is analyzed.
- Verify that refreshing the page retains past reports.


---

## Version 44 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


This plan expands upon the Retention Simulator fixes to include a comprehensive UI audit and standardization pass across all remaining widgets identified in the screenshots.

## User Review Required
Please confirm that converting the remaining custom Tailwind/inline-styled inputs and buttons (in AI Journal, Ask Me, and Settings) to the global `.vt-input` and `.vt-button` classes aligns with your vision for the Neo-Brutalist standard.

## Open Questions
None.

## Proposed Changes

### [MODIFY] `RetentionSimWidget.tsx`
- **Height Controls**: Expose `onCycleHeight` and `onDecHeight` through the `common` props to enable vertical resizing.
- **Scrolling**: Move `overflowY: "auto"` to the main wrapper to allow the entire content block to scroll.
- **Synthetic Report State**: Implement a `localStorage` or `useMemo` caching layer to persist analysis results per video.
- **Offline Video Uploads**: Add a hidden file input and an "UPLOAD" button adjacent to the dropdown. Generating an analysis from a local file will mock a video entry in the dropdown.
- **Top Bar Styling**: Convert the video selector and search input to standard `.vt-button` / `.vt-input` classes for flexible wrapping.
- **SVG Circular Nodes**: Replace `<circle>` elements inside the `preserveAspectRatio="none"` SVG with absolutely positioned HTML `<div>` elements to prevent horizontal stretching.

### [MODIFY] `WidgetRenderer.tsx` (Settings Widget)
- **Settings Widget Controls**: Refactor the "Settings" (`system-micro-stack`) block.
  - Convert `brutal-btn` to `.vt-button primary` (SYNC) and `.vt-button` (RE-CONNECT) to ensure correct border geometry and drop-shadows.
  - Convert `brutal-input` password and select fields to `.vt-input` to match standard padding and focus states.

### [MODIFY] `DailyOracleWidget.tsx`
- **Text Box Truncation**: Refactor the `renderAdviceCard` flex containers.
  - Ensure the internal text container has `height: "auto"` and remove any implicit restrictions that cause the text to cut off vertically.
  - Add standard padding and ensure the action button (`flexShrink: 0`) does not compress the text container ungracefully.

### [MODIFY] `AskMeWidget.tsx`
- **Prompt Textarea**: Replace `vt-textarea` with `vt-input` to guarantee the dynamic color-changing focus borders.
- **Quick Topics**: Strip inline CSS from the suggestion buttons and apply the universal `.vt-button` class for hover animations and structural consistency.

### [MODIFY] `AIJournalWidget.tsx`
- **Textarea Standardization**: Strip Tailwind utility classes (`w-full h-24 p-3 border-[3px]...`) from the main journal prompt and apply `.vt-input`.
- **Submit Button**: Convert the absolute-positioned submit button to a `.vt-button primary` to inherit the correct active states.
- **Category Tabs**: Convert the custom-colored pill tabs to match the `.vt-tab-group` and `.vt-tab-btn` conventions established in `CommunityPostWidget.tsx`.

## Verification Plan
- Preview `RetentionSimWidget` to ensure file uploads and scrolling function correctly.
- Verify `SettingsWidget` inputs and buttons adopt 4px/2px standard borders.
- Check `DailyOracleWidget` card expansion with long multi-line text.
- Test `AskMeWidget` and `AIJournalWidget` textareas for correct focus-border color changes.


---

## Version 45 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


1. **Widget Layout Reordering:** Set the default widget placement and sizing to exactly match the requested three-row layout (Row 1: Overview, Community, Comments. Row 2: Cadence, Realtime, Goals, Keywords. Row 3: Oracle, Ask Me, Journal).
2. **Goals Tracker Data Fixes:** Fix the underlying logic that drives the "Goals Tracker" daily averages and totals, which are currently displaying incorrect or nonsensical values (e.g. lifetime subscribers divided by 28). We will export raw data from `useDashboardData` to ensure calculation accuracy.
3. **Goals Tracker Reformatting:** Reformat the "Set Goal" inner panel of the Goals Tracker widget to strictly adhere to the Neo-Brutalist `.vt-*` utility classes for exact visual alignment with the provided screenshot.

## User Review Required

- Is there a preference for what the "Total" metric should track for Subscribers? Currently, if you look at "Subscribers", do you want to track *total lifetime subscribers* or *new subscribers gained over the 28-day period*? The plan assumes you want to track **total lifetime subscribers** for the "TOTAL" view, but use **new subscribers** to calculate the "AVG" (daily average of new subscribers).

## Proposed Changes

### Configuration & Architecture

#### [MODIFY] `src/views/dashboard/WidgetRegistry.ts`
- Update `prioritizedOrder` to match the exact 3-row layout requested.
- Move `ai-journal` into the Row 3 "AI zone".
- Update the `defaultSize` property:
  - `kpi-cluster`, `community-post`, `comment-replier` -> `"third"`
  - `consistency-heatmap`, `realtime-performance`, `goals-tracker`, `keyword-engine` -> `"quarter"`
  - `daily-oracle`, `ask-me`, `ai-journal` -> `"third"`

#### [MODIFY] `src/views/dashboard/useDashboardData.ts`
- Expose a `rawMetrics` object in the return payload, extracting un-stringified, high-precision numbers directly from `summary28d.totals` and `authState`.
- Provide `subsTotal`, `subscribers28d`, `views28d`, and `revenue28d` so `GoalsTrackerWidget` can pull accurate values without parsing comma-separated strings.

### Goals Tracker Standardization

#### [MODIFY] `src/views/dashboard/widgets/GoalsTrackerWidget.tsx`
- **Data Fix:** Swap out the `getMetricValue` string parser and instead pull directly from `data.rawMetrics`.
- **Calculation Fix:** When showing the `avg` for Subscribers, use `rawMetrics.subscribers28d / 28` instead of `lifetime subs / 28`. For Views and Revenue, divide the 28D totals by 28.
- **UI Reformat:** Standardize the "Integrated Goal Setter Page" to perfectly match the screenshot layout.
  - Implement `.vt-input` for the "SET YOUR GOAL" field.
  - Implement `.vt-button` for the action buttons (`D/W/M`, `SET GOAL`, `X`).
  - Standardize `.vt-tab-group` and `.vt-tab-btn` for the `TOTAL/AVG` toggle.
  - Ensure bold borders, precise font sizes, and layout flex gaps perfectly replicate the reference image.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. Open the dashboard and verify the default layout populates the first three rows accurately.
2. Open the Goals Tracker settings modal.
3. Verify that changing to "AVG" displays a sensible number (e.g. `New Subs / 28`) rather than lifetime subs divided by 28.
4. Verify the Neo-Brutalist styling (borders, padding, hovers) exactly match the screenshot.


---

## Version 46 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


This plan outlines the redesign of the Upload Scheduler widget to shift it from a simple calendar list into a dedicated "Upload Hub" as requested.

## Goal Description
The objective is to replace the current 7-day schedule list with a three-part upload workflow:
1. A top-level drag-and-drop / upload button area.
2. A middle section that calculates and displays the best recommended upload times for the coming week.
3. A bottom-level action button that links out to the "Data Edit" widget for finalizing video metadata.

## User Review Required

> [!IMPORTANT]
> **Data Edit Widget Routing**: The dashboard currently does not have a global routing or "focus widget" system built into the `WidgetRenderer`. For the "Edit Video Details" button, I plan to have it emit a generic custom browser event (`vt_focus_widget`) and trigger a standard browser `alert()` stating it's transitioning to the Data Edit Widget (since it's a prototype). Is this acceptable, or is there an existing tab/focus mechanism I should use?

## Open Questions

- Should the drag-and-drop zone actually process fake files, or just trigger a visual "uploaded" state when clicked/dropped?
- Are the "best upload times" dynamically generated based on existing mock data, or is it okay to use a static intelligent algorithm (e.g. finding the two highest traffic days based on historical `canonicalRows`)?

## Proposed Changes

---

### UploadSchedulerWidget

#### [MODIFY] [UploadSchedulerWidget.tsx](file:///Users/cwb/Downloads/viewtube/viewtubeX/src/views/dashboard/widgets/UploadSchedulerWidget.tsx)
- Completely replace the `next7Days` mapping loop with the new layout.
- **Top Section**: Implement a dashed-border drag-and-drop zone using `onDragOver` and `onDrop` events. Include a stylized `.vt-button` for manual file selection.
- **Middle Section**: Use the existing `bestSlots` logic (which looks at `data.canonicalRows`) to find the top 2 days, and format them nicely into a "Recommended Times" box (e.g., "Thursday @ 3:00 PM").
- **Bottom Section**: Add a prominent `Edit Details & Publish` button that triggers the focus event.
- Apply the Neo-Brutalist `.vt-` classes to ensure the new components fit seamlessly.

## Verification Plan

### Manual Verification
- Render the dashboard.
- Verify the drag-and-drop zone visually responds to hover/drop states.
- Ensure the "Recommended Times" block successfully renders days based on the mock data without crashing.
- Click the "Edit Details" button to confirm the alert/event fires correctly.


---

## Version 47 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


The objective is to combine multiple standalone metadata tools (Title Rewriter, Tag Generator, Description Editor) into a single "Super" Data Edit Widget. Additionally, we will add support for playlists, categories, and privacy settings, and refine the handoff from the Upload Scheduler.

## Proposed Changes

### 1. Upload Scheduler Widget Refinement
- **Hide Dropzone After Upload:** Once a user uploads a video file, we will completely hide the drag-and-drop zone / upload button in the "Upload" tab. We will replace it with the file list and a "Clear / Upload Another" button to reset the state, alongside the primary CTA to pick upload times.

### 2. Data Edit "Super Widget" Architecture
We will completely rewrite `DataEditWidget.tsx` to include:

- **Mode Toggle:** A top-level toggle to switch between `[Upload New Video]` and `[Edit Published Video]`.
  - **Edit Mode:** Shows the existing search/dropdown to select a video from `canonicalRows`.
  - **Upload Mode:** Hides the dropdown. Uses a blank slate (or pre-fills the title from the `vt_navigate_widget` event if redirected from the Upload Scheduler).
- **Collapsible Sections (Neo-Brutalist Accordions):**
  1. **Title:**
     - Standard text input.
     - **AI Integration:** Style presets (Mr Beast, Educational, etc.) and a "Generate" button from the `TitleRewriterWidget`. Results will appear inline; clicking a result applies it to the title input.
  2. **Description:**
     - Standard textarea.
     - **Integration:** Default Footer field (auto-saved to localStorage) from `DescriptionEditorWidget`, automatically appended to the main description.
  3. **Tags:**
     - Current tags display + manual tag input.
     - **AI Integration:** "Generate AI Suggestions" button from `TagGeneratorWidget`. Shows color-coded tags with scores/volume that can be clicked to add to the current tags.
  4. **Playlists & Organization:**
     - **Category:** Dropdown using `fetchVideoCategories()`.
     - **Privacy:** Public / Unlisted / Private radio buttons or dropdown.
     - **Playlists:** Checklist of user playlists using `fetchUserPlaylists()`.
- **Save Workflow:**
  - In Edit Mode: Calls `updateVideo()` and updates playlists (`addToPlaylist` / `removeFromPlaylist`).
  - In Upload Mode: Since actual video ingestion isn't implemented via API yet, this will act as a metadata drafting state or mock the save.

## User Review Required

> [!WARNING]
> **API Capabilities**
> The `youtubeDataFetcher.ts` has `updateVideo`, `fetchVideoCategories`, and `fetchUserPlaylists`, but it **does not** have an actual `uploadVideo` (video binary ingestion) function.
> When a user selects "Upload New Video", fills out the metadata, and clicks "Save", we will mock the save process (showing a success state) unless there is a specific local ingestion endpoint you'd like us to call. Is a mocked save acceptable for the "Upload New Video" mode?

> [!TIP]
> To handle the "Upload New Video" flow, when the user is routed from the Upload Scheduler, we will automatically set the Data Edit toggle to "Upload New Video" and pre-fill the title with the filename.

## Verification Plan
1. **Upload Scheduler:** Upload a file and verify the dropzone disappears.
2. **Data Edit Mode Switch:** Verify the toggle switches cleanly between selecting a video vs. a blank slate.
3. **Data Edit AI Integrations:** Verify Title Rewriter tokens are consumed, Tag Generator shows color-coded pills, and Description includes the saved footer.
4. **Data Edit API Updates:** Ensure Playlists, Category, and Privacy fetch and save correctly for existing videos.


---

## Version 48 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


The objective is to combine multiple standalone metadata tools (Title Rewriter, Tag Generator, Description Editor) into a single "Super" Data Edit Widget. Additionally, we will add support for playlists, categories, and privacy settings, and refine the handoff from the Upload Scheduler.

## Proposed Changes

### 1. Upload Scheduler Widget Refinement
- **Hide Dropzone After Upload:** Once a user uploads a video file, we will completely hide the drag-and-drop zone / upload button in the "Upload" tab. We will replace it with the file list and a "Clear / Upload Another" button to reset the state, alongside the primary CTA to pick upload times.

### 2. Data Edit "Super Widget" Architecture
We will completely rewrite `DataEditWidget.tsx` to include:

- **Mode Toggle:** A top-level toggle to switch between `[Upload New Video]` and `[Edit Published Video]`.
  - **Edit Mode:** Shows the existing search/dropdown to select a video from `canonicalRows`.
  - **Upload Mode:** Hides the dropdown. Uses a blank slate (pre-filled with the title from the `vt_navigate_widget` event if redirected from the Upload Scheduler).
- **Collapsible Sections (Neo-Brutalist Accordions):**
  1. **Title:** Standard text input + **AI Integration** (Style presets and a "Generate" button from the `TitleRewriterWidget`).
  2. **Description:** Standard textarea + **Integration** (Default Footer field automatically appended to the main description).
  3. **Tags:** Current tags display + manual tag input + **AI Integration** ("Generate AI Suggestions" button showing color-coded tags with scores/volume).
  4. **Playlists & Organization:**
     - **Category:** Dropdown using `fetchVideoCategories()`.
     - **Privacy:** Public / Unlisted / Private radio buttons or dropdown.
     - **Playlists:** Checklist of user playlists using `fetchUserPlaylists()`.
- **Save Workflow:**
  - In Edit Mode: Calls `updateVideo()` and updates playlists (`addToPlaylist` / `removeFromPlaylist`).
  - In Upload Mode: Shows a mocked upload/save state.

## User Review Required

> [!WARNING]
> **API Capabilities Confirmed**
> You are correct! I checked `youtubeDataFetcher.ts` and `youtubeApiClient.ts`. While the application has `updateVideo` (which makes a `PUT` request to edit metadata on already-published videos), it **does not** currently have the `youtube.videos.insert` endpoint needed to actually upload and publish new video binaries to YouTube.
> 
> Because of this, when the user is in "Upload New Video" mode inside the Data Edit widget, clicking "Publish/Save" will just show a mocked success state for the UI demo. Does this approach work for you, or do you want me to also build the backend API integration to actually upload video files to YouTube?

## Verification Plan
1. **Upload Scheduler:** Upload a file and verify the dropzone disappears.
2. **Data Edit Mode Switch:** Verify the toggle switches cleanly between selecting a video vs. a blank slate.
3. **Data Edit AI Integrations:** Verify Title Rewriter tokens are consumed, Tag Generator shows color-coded pills, and Description includes the saved footer.
4. **Data Edit API Updates:** Ensure Playlists, Category, and Privacy fetch and save correctly for existing videos.


---

## Version 49 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


The objective is to combine multiple standalone metadata tools (Title Rewriter, Tag Generator, Description Editor) into a single "Super" Data Edit Widget. Additionally, we will add support for playlists, categories, and privacy settings, refine the handoff from the Upload Scheduler, and implement the backend API for actual video ingestion.

## Proposed Changes

### 1. Upload Scheduler Widget Refinement
- **Hide Dropzone After Upload:** Once a user uploads a video file, we will completely hide the drag-and-drop zone / upload button in the "Upload" tab. We will replace it with the file list and a "Clear / Upload Another" button to reset the state, alongside the primary CTA to pick upload times.

### 2. YouTube Backend API Expansion
- **Video Upload (`youtubeDataFetcher.ts`):** 
  - Add an `uploadVideo(file: File, metadata: any)` function.
  - Implement a `multipart/form-data` upload to `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart`.
  - Pass the necessary `snippet`, `status`, and `recordingDetails` parts in the JSON payload, along with the binary video file.

### 3. Data Edit "Super Widget" Architecture
We will completely rewrite `DataEditWidget.tsx` to include a two-page interface:

**Mode Toggle:** A top-level toggle to switch between `[Upload New Video]` and `[Edit Published Video]`.

#### Page 1: Main Details
- **Title:** Text input + AI Rewrite presets & Generation.
- **Description:** Textarea + Default Footer integration.
- **Tags:** Current tags + Manual input + AI Suggested tags with scores.
- **Privacy & Playlists:** Privacy (Public/Unlisted/Private) and Playlist multi-select.
- **Navigation Button:** An `[Additional Options]` button to flip to Page 2.

#### Page 2: Additional Options
A sprawling settings page mirroring YouTube Studio advanced settings:
- **Audience:** Made for kids (Yes/No), Age restriction.
- **Disclosures:** Paid promotion, Altered content (Yes/No).
- **Collaboration:** Invite a collaborator.
- **Automatic Settings:** Automatic chapters, Featured places, Automatic concepts.
- **Language & Certification:** Video language, Caption certification.
- **Recording Info:** Recording date, Video location.
- **License & Distribution:** License (Standard/Creative Commons), Distribution (Everywhere), Allow embedding, Publish to subscriptions feed.
- **Shorts Remixing:** Allow video and audio remixing, Allow only audio remixing.
- **Category:** Dropdown (Entertainment, Education, etc.).
- **Comments & Ratings:** Comments (On/Off), Moderation level, Who can comment, Sort by, Show how many viewers like this video.

## User Review Required

> [!WARNING]
> **API Field Limitations**
> The public YouTube Data API v3 supports many of these fields (e.g., Category, Privacy, Tags, Title, Description, License, Embeddable, Made for Kids, Recording Date/Location, Language). 
> However, some highly specific YouTube Studio UI toggles (e.g., "Altered content", "Automatic concepts", "Featured places", "Shorts remixing", "Paid promotion") are **not exposed** in the public YouTube API. 
> For those unsupported fields, I will build the exact UI you requested so it looks identical to YouTube Studio, but we will have to store their values locally in the `DashboardData` metadata since they cannot be sent to Google's servers. Is this acceptable?

## Verification Plan
1. **Upload Scheduler:** Upload a file and verify the dropzone disappears.
2. **Data Edit API:** Implement `uploadVideo` and verify the `multipart` fetch call is structured correctly.
3. **Data Edit UI:** Verify Main Page vs Additional Options Page toggle.
4. **Data Edit Settings:** Verify all requested settings from the screenshots exist in the UI with correct styling.


---

## Version 50 (from 50997498-bffd-4e49-930f-b857d8fdaac6)

**Metadata:**
- artifactType: ARTIFACT_TYPE_IMPLEMENTATION_PLAN
- summary: Updated plan to include the massive scope of the Data Edit Super Widget, including backend upload, advanced YouTube options, category-specific metadata fields, and Ad Suitability self-certification.
- updatedAt: 2026-05-04T01:17:25.900719Z
- version: 23
- requestFeedback: True


The objective is to combine multiple standalone metadata tools into a single "Super" Data Edit Widget. We will add backend API support for uploading video files and build an exhaustive interface mirroring YouTube Studio's advanced settings, category-specific metadata, and ad suitability certification.

## Proposed Changes

### 1. Upload Scheduler Widget Refinement
- **Hide Dropzone After Upload:** Once a user uploads a video file, we will completely hide the drag-and-drop zone / upload button in the "Upload" tab. We will replace it with the file list and a "Clear / Upload Another" button to reset the state, alongside the primary CTA to pick upload times.

### 2. YouTube Backend API Expansion
- **Video Upload (`youtubeDataFetcher.ts`):** 
  - Add an `uploadVideo(file: File, metadata: any)` function.
  - Implement a `multipart/form-data` upload to `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart`.
  - Pass the necessary `snippet`, `status`, and `recordingDetails` parts in the JSON payload, along with the binary video file.

### 3. Data Edit "Super Widget" Architecture
We will completely rewrite `DataEditWidget.tsx` to include a three-page interface:

**Mode Toggle:** A top-level toggle to switch between `[Upload New Video]` and `[Edit Published Video]`.

#### Page 1: Main Details
- **Title:** Text input + AI Rewrite presets & Generation.
- **Description:** Textarea + Default Footer integration.
- **Tags:** Current tags + Manual input + AI Suggested tags with scores.
- **Privacy & Playlists:** Privacy (Public/Unlisted/Private) and Playlist multi-select.
- **Category:** Dropdown (Entertainment, Education, Gaming, etc.).
- **Navigation Buttons:** Buttons to access `[Additional Options]` and `[Ad Suitability]`.

#### Page 2: Additional Options & Category Metadata
A sprawling settings page mirroring YouTube Studio advanced settings:
- **Audience:** Made for kids (Yes/No), Age restriction.
- **Disclosures:** Paid promotion, Altered content (Yes/No).
- **Collaboration:** Invite a collaborator.
- **Automatic Settings:** Automatic chapters, Featured places, Automatic concepts.
- **Language & Certification:** Video language, Caption certification.
- **Recording Info:** Recording date, Video location.
- **License & Distribution:** License (Standard/Creative Commons), Distribution (Everywhere), Allow embedding, Publish to subscriptions feed.
- **Shorts Remixing:** Allow video and audio remixing, Allow only audio remixing.
- **Category-Specific Options (Dynamic based on Category selection on Page 1):**
  - *If Gaming:* Game title (optional).
  - *If Education:* Type, Problems (textarea), Academic system, Level, Exam/course/standard.
- **Comments & Ratings:** Comments (On/Off), Moderation level, Who can comment, Sort by, Show how many viewers like this video.

#### Page 3: Ad Suitability
A full self-certification questionnaire page mirroring YouTube Studio:
- **Categories (Accordions):** Inappropriate language, Adult content, Violence, Shocking content, Harmful acts, Recreational drugs, Enabling dishonest behavior, Hateful & derogatory, Firearms-related, Sensitive events, Controversial issues.
- **Certification:** A "None of the above" checkbox.
- **Submission:** When "None of the above" is checked, the right-side panel displays "Safe for ads" with a "Submit rating" button to lock in the monetization status.

## User Review Required

> [!WARNING]
> **API Field Limitations**
> As discussed, the public YouTube Data API v3 does not support saving highly specific Studio UI toggles (e.g., "Altered content", "Ad suitability self-certification", "Education Academic System"). For all unsupported fields, we will build the exact UI you requested to match YouTube Studio perfectly, and we will save their values locally in the ViewTube metadata. 

> [!TIP]
> Given the massive scope of the Data Edit widget, we will implement it using a horizontal tab or step-based navigation (e.g., "1. Details", "2. Options", "3. Monetization") to keep the interface clean within the Neo-Brutalist design constraints.

## Verification Plan
1. **Upload API:** Implement `uploadVideo` and verify the `multipart` fetch call is structured correctly.
2. **Data Edit Navigation:** Verify tab navigation between Main Details, Additional Options, and Ad Suitability.
3. **Data Edit Dynamic UI:** Verify the Gaming/Education fields only appear when those categories are selected.
4. **Ad Suitability Logic:** Verify checking "None of the above" enables the "Safe for ads" rating submission.


---

## Version 51 (from 50997498-bffd-4e49-930f-b857d8fdaac6)


The objective is to combine multiple standalone metadata tools into a single "Super" Data Edit Widget. We will add backend API support for uploading video files and build an exhaustive interface mirroring YouTube Studio's advanced settings, category-specific metadata, and ad suitability certification.

## Proposed Changes

### 1. Upload Scheduler Widget Refinement
- **Hide Dropzone After Upload:** Once a user uploads a video file, we will completely hide the drag-and-drop zone / upload button in the "Upload" tab. We will replace it with the file list and a "Clear / Upload Another" button to reset the state, alongside the primary CTA to pick upload times.

### 2. YouTube Backend API Expansion
- **Video Upload (`youtubeDataFetcher.ts`):** 
  - Add an `uploadVideo(file: File, metadata: any)` function.
  - Implement a `multipart/form-data` upload to `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart`.
  - Pass the necessary `snippet`, `status`, and `recordingDetails` parts in the JSON payload, along with the binary video file.

### 3. Data Edit "Super Widget" Architecture
We will completely rewrite `DataEditWidget.tsx` to include a three-page interface:

**Mode Toggle:** A top-level toggle to switch between `[Upload New Video]` and `[Edit Published Video]`.

#### Page 1: Main Details
- **Title:** Text input + AI Rewrite presets & Generation.
- **Description:** Textarea + Default Footer integration.
- **Tags:** Current tags + Manual input + AI Suggested tags with scores.
- **Privacy & Playlists:** Privacy (Public/Unlisted/Private) and Playlist multi-select.
- **Category:** Dropdown (Entertainment, Education, Gaming, etc.).
- **Navigation Buttons:** Buttons to access `[Additional Options]` and `[Ad Suitability]`.

#### Page 2: Additional Options & Category Metadata
A sprawling settings page mirroring YouTube Studio advanced settings:
- **Audience:** Made for kids (Yes/No), Age restriction.
- **Disclosures:** Paid promotion, Altered content (Yes/No).
- **Collaboration:** Invite a collaborator.
- **Automatic Settings:** Automatic chapters, Featured places, Automatic concepts.
- **Language & Certification:** Video language, Caption certification.
- **Recording Info:** Recording date, Video location.
- **License & Distribution:** License (Standard/Creative Commons), Distribution (Everywhere), Allow embedding, Publish to subscriptions feed.
- **Shorts Remixing:** Allow video and audio remixing, Allow only audio remixing.
- **Category-Specific Options (Dynamic based on Category selection on Page 1):**
  - *If Gaming:* Game title (optional).
  - *If Education:* Type, Problems (textarea), Academic system, Level, Exam/course/standard.
- **Comments & Ratings:** Comments (On/Off), Moderation level, Who can comment, Sort by, Show how many viewers like this video.

#### Page 3: Ad Suitability
A full self-certification questionnaire page mirroring YouTube Studio:
- **Categories (Accordions):** Inappropriate language, Adult content, Violence, Shocking content, Harmful acts, Recreational drugs, Enabling dishonest behavior, Hateful & derogatory, Firearms-related, Sensitive events, Controversial issues.
- **Certification:** A "None of the above" checkbox.
- **Submission:** When "None of the above" is checked, the right-side panel displays "Safe for ads" with a "Submit rating" button to lock in the monetization status.

## User Review Required

> [!WARNING]
> **API Field Limitations**
> As discussed, the public YouTube Data API v3 does not support saving highly specific Studio UI toggles (e.g., "Altered content", "Ad suitability self-certification", "Education Academic System"). For all unsupported fields, we will build the exact UI you requested to match YouTube Studio perfectly, and we will save their values locally in the ViewTube metadata. 

> [!TIP]
> Given the massive scope of the Data Edit widget, we will implement it using a horizontal tab or step-based navigation (e.g., "1. Details", "2. Options", "3. Monetization") to keep the interface clean within the Neo-Brutalist design constraints.

## Verification Plan
1. **Upload API:** Implement `uploadVideo` and verify the `multipart` fetch call is structured correctly.
2. **Data Edit Navigation:** Verify tab navigation between Main Details, Additional Options, and Ad Suitability.
3. **Data Edit Dynamic UI:** Verify the Gaming/Education fields only appear when those categories are selected.
4. **Ad Suitability Logic:** Verify checking "None of the above" enables the "Safe for ads" rating submission.


---

