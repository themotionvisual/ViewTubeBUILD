## Design Plan: Refactor Shorts Retention Control

Refactor the top-right control section in `ShortsRetentionWidgetModule` within `GraphsPageCharts.tsx` to match the requested design:
- Top: Large centered "100" (or current count).
- Middle: Current mode (e.g., "Top Performing") in large bold centered text.
- Bottom: "VIDEOS" in larger bold centered text.

Maintain existing Neo-Brutalist styling.

### Steps
1.  Locate `controls` div within `UnifiedChartModule` in `ShortsRetentionWidgetModule`.
2.  Update the `controls` div to restructure inner components as requested.
3.  Adjust classes for font size, weight, and centering.
4.  Retain logic for mode toggling and video count.
