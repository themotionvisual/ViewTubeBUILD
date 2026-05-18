# GRAPHS_AND_CHARTS_COMPREHENSIVE_REPORT.md - Consolidated

> [!NOTE]
> This file consolidates 2 version(s) from different conversations.
> Latest version appears at the bottom.

---

## Version 1 (from 581d5401-3df2-47b4-bbc3-e3769040d1d4)

**Metadata:**
- artifactType: ARTIFACT_TYPE_OTHER
- summary: A comprehensive audit report of the charts, visualization libraries, and statistical metrics used in the Research Lab TSX codebase.
- updatedAt: 2026-04-25T14:47:45.110301Z


This report provides a comprehensive catalog of all the data visualizations found in the `Research Lab TSX` folder. It outlines the specific chart types implemented, the visualization libraries being used, and the exact statistical metrics and dimensions displayed by each chart.

## Overview of Visualization Libraries

The analytics dashboard relies on a dual-visualization architecture to render charts:
1. **react-google-charts**: Used for complex, multi-dimensional data rendering, specialized layouts (like GeoCharts and Funnels), and high-density scatter/bubble plots.
2. **recharts**: Used primarily in specific components (e.g., `ResearchLab (2).tsx`) for internal dashboard tracking, trending, retention forecasting, and competitor analysis using Line, Bar, Scatter, and Radar charts.

---

## Comprehensive Chart Catalog

The following chart configurations are defined in the master `ChartConfig` utility (primarily in `ResearchLab.tsx`) mapping raw data into specialized visualization formats.

### 1. Performance & Trends

*   **Top Performers Trio** (`TopPerformersTrio` / Custom)
    *   **Data Displayed:** Revenue, Watch Time, Subscribers, and Trends (Views).
    *   **Metrics Mapping:** `revenueKey`, `watchTimeKey`, `subsKey`, `viewsKey`.
*   **Performance Trend** (`ComboChart` - Google)
    *   **Data Displayed:** Impressions (Left Axis), Views (Right Axis), Watch Hours (Right Axis) over Time.
*   **Momentum Tracker** (`LineChart` - Google)
    *   **Data Displayed:** 30-Day Rolling Averages for Views and Subscribers.
*   **Historical Pulse** (`AreaChart` - Google)
    *   **Data Displayed:** Daily Reach Intensity (Views over time).
*   **Long-Tail Shelf Life** (`LineChart` - Google)
    *   **Data Displayed:** Cumulative organic growth (Views) normalized to Days Since Publish.

### 2. Audience & Retention

*   **Shorts Retention** (`ScatterChart` - Google)
    *   **Data Displayed:** Duration (Seconds) vs. Average Percentage Viewed (APV) for YouTube Shorts.
*   **Performance Stack / Viral DNA Pulse** (`SteppedAreaChart` - Google)
    *   **Data Displayed:** Negative Flow (Views), CTR Anchor, Positive Flow (Stayed to Watch / Retention).
*   **Viewer Loyalty** (`BubbleChart` - Google)
    *   **Data Displayed:** New Viewers vs. Returning Viewers (Size: Views, Series: Format).
*   **Audience Growth** (`ScatterChart` - Google)
    *   **Data Displayed:** Views vs. Subscribers gained per video.
*   **Audience Geography** (`GeoChart` - Google)
    *   **Data Displayed:** Heatmap of Views mapped by Country/Geography.

### 3. Engagement & Funnels

*   **Engagement Map** (`LineChart` - Google)
    *   **Data Displayed:** Top 50 recent videos mapped by Comments, Subscribers, Shares, and Likes.
*   **Hook-to-Binge Funnel** (`Sankey` - Google)
    *   **Data Displayed:** Traffic flow mapping Impressions → Views → Hooked (>30s) → Finished → Engaged (Subs + Likes + Shares + Comments).
*   **Golden Ratio Radar** (`ColumnChart` / Benchmark - Google)
    *   **Data Displayed:** Channel Average vs. Hero Video for CTR, Retention, Engagement, and Sharing.
*   **End Screen Funnel** (`SteppedAreaChart` - Google)
    *   **Data Displayed:** Elements Shown vs. Actual Clicks for end screen retention conversions.

### 4. Packaging (Thumbnails & Titles)

*   **Packaging** (`BubbleChart` - Google)
    *   **Data Displayed:** Impressions (X-axis) vs. CTR (Y-axis), sized by Views. Differentiates Shorts vs Long-form.
*   **Keyword Engine** (`BarChart` - Google)
    *   **Data Displayed:** Title Keywords plotted against Average Views and Frequency of Use.
*   **Title Stats** (`ScatterChart` - Google)
    *   **Data Displayed:** Title Length (Characters) vs. CTR %.
*   **Category Volume** (`TreeMap` - Google)
    *   **Data Displayed:** Keyword Reach, Market Trade Volume, and Increase/Decrease weighting.
*   **Thumbnail A/B Pulse** (`LineChart` - Google)
    *   **Data Displayed:** CTR % vs. Views over time to track thumbnail iteration success.

### 5. Revenue & Monetization

*   **Revenue Calendar** (`Calendar` - Google)
    *   **Data Displayed:** Top 5 earning days per month mapped on a heatmap calendar block.
*   **Revenue Efficiency** (`ScatterChart` - Google)
    *   **Data Displayed:** Video Duration (Minutes) vs. Revenue per Minute ($/Min).
*   **Geography of High CPMs** (`GeoChart` - Google)
    *   **Data Displayed:** Global map showing CPM (Revenue per 1000 Views) based on geographic location.
*   **OS Revenue Mix** (`PieChart` - Google)
    *   **Data Displayed:** Revenue broken down by Platform (iOS, Android, Desktop, TV).
*   **Seasonal RPM Pulse** (`ColumnChart` - Google)
    *   **Data Displayed:** Monthly RPM (Revenue per Mille) efficiency mapping.

### 6. Upload Strategy

*   **Best Upload Day** (`ColumnChart` - Google)
    *   **Data Displayed:** Day of the Week plotted against Average Views, Average CTR, and Average Subs.
*   **Duration Sweet Spot** (`BarChart` - Google)
    *   **Data Displayed:** Video Length buckets (e.g., 1-3 min, 8-12 min) mapped to Average Views.
*   **Published Momentum** (`ScatterChart` - Google / Grid Heatmap format)
    *   **Data Displayed:** 24/7 Grid tracking Hour of Day vs. Day of Week, weighted by Views.

### 7. Solo / Specific Video Analysis

A suite of charts specifically configured to drill down into an individual video's performance (`_userTag === "single_long_video"`):
*   **Solo Impressions Funnel:** Impressions → Views → Engaged Views.
*   **Solo End Screen Actions:** Elements Shown vs. Clicks.
*   **Solo Audience Magnet:** New Viewers vs. Returning Viewers (`PieChart`).
*   **Solo Subscriber Impact:** Subscribers Gained vs. Lost (`BarChart`).
*   **Solo Ad Revenue Mix:** Watch Page Ads vs. Premium vs. Transaction Revenue.

---

## Master Data Keys Utilized

The application dynamic mapping engine relies on flexible key searching (to handle YouTube API variances). The core data keys mapped across these charts include:

*   **Views:** `Views`, `viewsKey`
*   **Impressions:** `Impressions`, `impressionsKey`
*   **CTR:** `Impressions click-through rate (%)`, `ctrKey`
*   **Retention:** `Average percentage viewed (%)`, `apvKey`, `stwKey`
*   **Duration:** `Video length`, `durationKey`
*   **Revenue:** `Your estimated revenue (USD)`, `revenueKey`
*   **Engagement:** `Likes`, `Comments`, `Shares`, `Subscribers gained`/`lost`
*   **Geospatial:** `Geography`, `Country`
*   **Audience:** `New viewers`, `Returning viewers`


---

## Version 2 (from 581d5401-3df2-47b4-bbc3-e3769040d1d4)


This report provides a comprehensive catalog of all the data visualizations found in the `Research Lab TSX` folder. It outlines the specific chart types implemented, the visualization libraries being used, and the exact statistical metrics and dimensions displayed by each chart.

## Overview of Visualization Libraries

The analytics dashboard relies on a dual-visualization architecture to render charts:
1. **react-google-charts**: Used for complex, multi-dimensional data rendering, specialized layouts (like GeoCharts and Funnels), and high-density scatter/bubble plots.
2. **recharts**: Used primarily in specific components (e.g., `ResearchLab (2).tsx`) for internal dashboard tracking, trending, retention forecasting, and competitor analysis using Line, Bar, Scatter, and Radar charts.

---

## Comprehensive Chart Catalog

The following chart configurations are defined in the master `ChartConfig` utility (primarily in `ResearchLab.tsx`) mapping raw data into specialized visualization formats.

### 1. Performance & Trends

*   **Top Performers Trio** (`TopPerformersTrio` / Custom)
    *   **Data Displayed:** Revenue, Watch Time, Subscribers, and Trends (Views).
    *   **Metrics Mapping:** `revenueKey`, `watchTimeKey`, `subsKey`, `viewsKey`.
*   **Performance Trend** (`ComboChart` - Google)
    *   **Data Displayed:** Impressions (Left Axis), Views (Right Axis), Watch Hours (Right Axis) over Time.
*   **Momentum Tracker** (`LineChart` - Google)
    *   **Data Displayed:** 30-Day Rolling Averages for Views and Subscribers.
*   **Historical Pulse** (`AreaChart` - Google)
    *   **Data Displayed:** Daily Reach Intensity (Views over time).
*   **Long-Tail Shelf Life** (`LineChart` - Google)
    *   **Data Displayed:** Cumulative organic growth (Views) normalized to Days Since Publish.

### 2. Audience & Retention

*   **Shorts Retention** (`ScatterChart` - Google)
    *   **Data Displayed:** Duration (Seconds) vs. Average Percentage Viewed (APV) for YouTube Shorts.
*   **Performance Stack / Viral DNA Pulse** (`SteppedAreaChart` - Google)
    *   **Data Displayed:** Negative Flow (Views), CTR Anchor, Positive Flow (Stayed to Watch / Retention).
*   **Viewer Loyalty** (`BubbleChart` - Google)
    *   **Data Displayed:** New Viewers vs. Returning Viewers (Size: Views, Series: Format).
*   **Audience Growth** (`ScatterChart` - Google)
    *   **Data Displayed:** Views vs. Subscribers gained per video.
*   **Audience Geography** (`GeoChart` - Google)
    *   **Data Displayed:** Heatmap of Views mapped by Country/Geography.

### 3. Engagement & Funnels

*   **Engagement Map** (`LineChart` - Google)
    *   **Data Displayed:** Top 50 recent videos mapped by Comments, Subscribers, Shares, and Likes.
*   **Hook-to-Binge Funnel** (`Sankey` - Google)
    *   **Data Displayed:** Traffic flow mapping Impressions → Views → Hooked (>30s) → Finished → Engaged (Subs + Likes + Shares + Comments).
*   **Golden Ratio Radar** (`ColumnChart` / Benchmark - Google)
    *   **Data Displayed:** Channel Average vs. Hero Video for CTR, Retention, Engagement, and Sharing.
*   **End Screen Funnel** (`SteppedAreaChart` - Google)
    *   **Data Displayed:** Elements Shown vs. Actual Clicks for end screen retention conversions.

### 4. Packaging (Thumbnails & Titles)

*   **Packaging** (`BubbleChart` - Google)
    *   **Data Displayed:** Impressions (X-axis) vs. CTR (Y-axis), sized by Views. Differentiates Shorts vs Long-form.
*   **Keyword Engine** (`BarChart` - Google)
    *   **Data Displayed:** Title Keywords plotted against Average Views and Frequency of Use.
*   **Title Stats** (`ScatterChart` - Google)
    *   **Data Displayed:** Title Length (Characters) vs. CTR %.
*   **Category Volume** (`TreeMap` - Google)
    *   **Data Displayed:** Keyword Reach, Market Trade Volume, and Increase/Decrease weighting.
*   **Thumbnail A/B Pulse** (`LineChart` - Google)
    *   **Data Displayed:** CTR % vs. Views over time to track thumbnail iteration success.

### 5. Revenue & Monetization

*   **Revenue Calendar** (`Calendar` - Google)
    *   **Data Displayed:** Top 5 earning days per month mapped on a heatmap calendar block.
*   **Revenue Efficiency** (`ScatterChart` - Google)
    *   **Data Displayed:** Video Duration (Minutes) vs. Revenue per Minute ($/Min).
*   **Geography of High CPMs** (`GeoChart` - Google)
    *   **Data Displayed:** Global map showing CPM (Revenue per 1000 Views) based on geographic location.
*   **OS Revenue Mix** (`PieChart` - Google)
    *   **Data Displayed:** Revenue broken down by Platform (iOS, Android, Desktop, TV).
*   **Seasonal RPM Pulse** (`ColumnChart` - Google)
    *   **Data Displayed:** Monthly RPM (Revenue per Mille) efficiency mapping.

### 6. Upload Strategy

*   **Best Upload Day** (`ColumnChart` - Google)
    *   **Data Displayed:** Day of the Week plotted against Average Views, Average CTR, and Average Subs.
*   **Duration Sweet Spot** (`BarChart` - Google)
    *   **Data Displayed:** Video Length buckets (e.g., 1-3 min, 8-12 min) mapped to Average Views.
*   **Published Momentum** (`ScatterChart` - Google / Grid Heatmap format)
    *   **Data Displayed:** 24/7 Grid tracking Hour of Day vs. Day of Week, weighted by Views.

### 7. Solo / Specific Video Analysis

A suite of charts specifically configured to drill down into an individual video's performance (`_userTag === "single_long_video"`):
*   **Solo Impressions Funnel:** Impressions → Views → Engaged Views.
*   **Solo End Screen Actions:** Elements Shown vs. Clicks.
*   **Solo Audience Magnet:** New Viewers vs. Returning Viewers (`PieChart`).
*   **Solo Subscriber Impact:** Subscribers Gained vs. Lost (`BarChart`).
*   **Solo Ad Revenue Mix:** Watch Page Ads vs. Premium vs. Transaction Revenue.

---

## Master Data Keys Utilized

The application dynamic mapping engine relies on flexible key searching (to handle YouTube API variances). The core data keys mapped across these charts include:

*   **Views:** `Views`, `viewsKey`
*   **Impressions:** `Impressions`, `impressionsKey`
*   **CTR:** `Impressions click-through rate (%)`, `ctrKey`
*   **Retention:** `Average percentage viewed (%)`, `apvKey`, `stwKey`
*   **Duration:** `Video length`, `durationKey`
*   **Revenue:** `Your estimated revenue (USD)`, `revenueKey`
*   **Engagement:** `Likes`, `Comments`, `Shares`, `Subscribers gained`/`lost`
*   **Geospatial:** `Geography`, `Country`
*   **Audience:** `New viewers`, `Returning viewers`


---

