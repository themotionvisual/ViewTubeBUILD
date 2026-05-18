<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [📊 VIEWTUBE GRAPHS & CHARTS COMPREHENSIVE REPORT](#-viewtube-graphs--charts-comprehensive-report)
  - [📋 EXECUTIVE SUMMARY](#-executive-summary)
  - [1. GOOGLE API MASTER GRAPH CATALOG (7 Definitive Charts)](#1-google-api-master-graph-catalog-7-definitive-charts)
    - [1.1 Top Performers Trio](#11-top-performers-trio)
    - [1.2 Video Value Matrix](#12-video-value-matrix)
    - [1.3 Discovery Radar](#13-discovery-radar)
    - [1.4 Algorithm Trigger](#14-algorithm-trigger)
    - [1.5 Device Immersion](#15-device-immersion)
    - [1.6 Narrative DNA](#16-narrative-dna)
    - [1.7 Global Footprint](#17-global-footprint)
  - [2. RESEARCH LAB - GOOGLE CHARTS GALLERY (34 Charts)](#2-research-lab---google-charts-gallery-34-charts)
    - [Core Performance Charts](#core-performance-charts)
    - [Time & Scheduling Charts](#time--scheduling-charts)
    - [Revenue & Efficiency Charts](#revenue--efficiency-charts)
    - [Content Analysis Charts](#content-analysis-charts)
    - [Audience & Device Charts](#audience--device-charts)
    - [End Screen & Conversion Charts](#end-screen--conversion-charts)
  - [3. PERFORMANCE HUB (8 Recharts)](#3-performance-hub-8-recharts)
  - [4. CHANNELYTICS CHART TOOLBOX (6 Stations)](#4-channelytics-chart-toolbox-6-stations)
  - [5. DATA VISUALIZATIONS VIEW (4 Custom SVG Charts)](#5-data-visualizations-view-4-custom-svg-charts)
  - [6. DATA DASHBOARD COMPONENT (KPI Visualizations)](#6-data-dashboard-component-kpi-visualizations)
    - [Channel Overview KPI Grid](#channel-overview-kpi-grid)
  - [7. CHANNELYTICS VIEW](#7-channelytics-view)
    - [MobileLookChart (Viral Trajectory)](#mobilelookchart-viral-trajectory)
  - [8. CHART ENGINE CAPABILITIES](#8-chart-engine-capabilities)
    - [Supported Google Chart Types](#supported-google-chart-types)
    - [Supported Recharts Types](#supported-recharts-types)
    - [Special Features](#special-features)
  - [9. TOTAL CHART COUNT SUMMARY](#9-total-chart-count-summary)
  - [10. CHART TYPE BREAKDOWN](#10-chart-type-breakdown)
  - [11. VISUAL IDENTITY (Neo-Brutalist v2.2)](#11-visual-identity-neo-brutalist-v22)
    - [Borders](#borders)
    - [Shadows](#shadows)
    - [Border Radius](#border-radius)
    - [Colors (Neon High-Contrast)](#colors-neon-high-contrast)
    - [Typography](#typography)
    - [Header Pattern](#header-pattern)
  - [12. DATA FLOW ARCHITECTURE](#12-data-flow-architecture)
  - [13. KEY FILES REFERENCE](#13-key-files-reference)

<!-- /code_chunk_output -->


# 📊 VIEWTUBE GRAPHS & CHARTS COMPREHENSIVE REPORT

_Complete inventory of all data visualizations across the ViewTube Creator OS_

---

## 📋 EXECUTIVE SUMMARY

The ViewTube application features **55+ distinct chart types** across 7 major views/components, utilizing three primary charting libraries:

- **React-Google-Charts** (Google Visualization API)
- **Recharts** (D3-based React library)
- **Custom SVG implementations**

---

## 1. GOOGLE API MASTER GRAPH CATALOG (7 Definitive Charts)

Located in `docs/master_graph_catalog.md` - These are the core strategic visualizations that define the platform's visual identity:

### 1.1 Top Performers Trio

- **Type:** Custom UI / Pie Charts (Donut style)
- **Location:** `ChartEngine.tsx` → `TrioPieCard` component
- **Data:** Revenue, Watch Hours, Subscribers
- **Purpose:** Heartbeat KPI overview - massive revenue & reach snapshot

### 1.2 Video Value Matrix

- **Type:** BubbleChart / ScatterChart
- **Axes:** CTR % (X) × Retention AVP % (Y), Bubble size = Views
- **Purpose:** Quadrant-mapped performance classification:
  - **GOLD MINE:** High CTR, High Retention
  - **HIDDEN GEM:** Low CTR, High Retention
  - **CLICK BAIT:** High CTR, Low Retention
  - **GRAVEYARD:** Low CTR, Low Retention

### 1.3 Discovery Radar

- **Type:** SteppedAreaChart or RadarChart
- **Data:** Traffic origin flow (Browse vs Search vs External/Suggested)
- **Purpose:** Visualizes traffic signature and content lifecycle phase

### 1.4 Algorithm Trigger

- **Type:** ScatterChart
- **Axes:** Impressions vs CTR
- **Purpose:** Maps "Viral Momentum" - identifies tipping points where high CTR forces massive impression delivery

### 1.5 Device Immersion

- **Type:** PieChart (3D)
- **Data:** Mobile vs TV vs Desktop consumption
- **Purpose:** Dictates formatting decisions (pacing, text size, etc.)

### 1.6 Narrative DNA

- **Type:** WordTree
- **Data:** Semantic clustering from video titles
- **Purpose:** Finds keyword relationships that trigger clicks

### 1.7 Global Footprint

- **Type:** GeoChart
- **Data:** Views/Revenue by geographic region
- **Purpose:** CPM-optimized territory map for localization decisions

---

## 2. RESEARCH LAB - GOOGLE CHARTS GALLERY (34 Charts)

Located in `src/views/ResearchLab.tsx` (lines 1923-3800+) - The most comprehensive chart collection:

### Core Performance Charts

| #   | Chart Name           | Type             | Purpose                                 |
| --- | -------------------- | ---------------- | --------------------------------------- |
| 1   | Top Performers Trio  | PieChart (3x)    | Combined revenue/watch/subs with trends |
| 2   | Shorts Retention     | ScatterChart     | AVD% × Duration analysis                |
| 3   | Packaging            | BubbleChart      | CTR × Impressions momentum              |
| 4   | Engagement Map       | LineChart        | Top 50 recent by engagement metric      |
| 5   | Keyword Engine       | BarChart         | Title Words × Performance               |
| 6   | Performance Stack    | SteppedAreaChart | Viral DNA Pulse                         |
| 7   | Viewer Loyalty       | BubbleChart      | New vs Returning Viewers                |
| 8   | Title Stats          | ScatterChart     | CTR × Keywords/Title Length             |
| 9   | Audience Geography   | GeoChart         | Views × Global Reach                    |
| 10  | Hook-to-Binge Funnel | Sankey Diagram   | Views → Watch → Subs → Shares           |

### Time & Scheduling Charts

| #   | Chart Name            | Type             | Purpose                  |
| --- | --------------------- | ---------------- | ------------------------ |
| 11  | Best Upload Day       | ColumnChart      | Weekday × Avg Views      |
| 12  | Duration Sweet Spot   | BarChart         | Video Length × Avg Views |
| 13  | Revenue Calendar      | Calendar Chart   | Top 5 Days Per Month     |
| 14  | Milestone Progression | SteppedAreaChart | Cumulative Views         |
| 15  | Momentum Tracker      | LineChart        | 30-Day Rolling Average   |
| 16  | Growth Pulse          | ComboChart       | Views vs. Subs Trends    |
| 17  | Published Momentum    | ScatterChart     | Upload 24/7 Grid Heatmap |

### Revenue & Efficiency Charts

| #   | Chart Name             | Type         | Purpose                     |
| --- | ---------------------- | ------------ | --------------------------- |
| 18  | Revenue Efficiency     | ScatterChart | Earn × Duration             |
| 19  | Performance Trend      | ComboChart   | Impressions × Views × Hours |
| 20  | Seasonal RPM Pulse     | ColumnChart  | Monthly Revenue Efficiency  |
| 21  | Geography of High CPMs | GeoChart     | Global Revenue Intelligence |

### Content Analysis Charts

| #   | Chart Name           | Type             | Purpose                        |
| --- | -------------------- | ---------------- | ------------------------------ |
| 22  | Video Value Matrix   | BubbleChart      | CTR × Retention × Views        |
| 23  | Category Volume      | TreeMap          | Keyword × Reach                |
| 24  | Series Consistency   | CandlestickChart | Performance Spread Box Plot    |
| 25  | Long-Tail Shelf Life | LineChart        | Cumulative Views Normalized    |
| 26  | Golden Ratio Radar   | ColumnChart      | Benchmark Engagement Signature |

### Audience & Device Charts

| #   | Chart Name       | Type         | Purpose                       |
| --- | ---------------- | ------------ | ----------------------------- |
| 27  | Audience Growth  | ScatterChart | Views × Subs                  |
| 28  | OS Revenue Mix   | PieChart     | Mobile vs Desktop Performance |
| 29  | Historical Pulse | AreaChart    | Daily Reach Intensity         |

### End Screen & Conversion Charts

| #   | Chart Name              | Type             | Purpose                        |
| --- | ----------------------- | ---------------- | ------------------------------ |
| 30  | End Screen Funnel       | SteppedAreaChart | Retention to Clicks Conversion |
| 31  | Solo Impressions Funnel | SteppedAreaChart | Single Video Conversion Flow   |
| 32  | Solo End Screen Actions | BarChart         | Elements Shown vs Clicks       |
| 33  | Thumbnail A/B Pulse     | LineChart        | CTR × Views Annotated Timeline |
| 34  | Algorithm Trigger       | ScatterChart     | Impressions vs CTR Momentum    |

---

## 3. PERFORMANCE HUB (8 Recharts)

Located in `src/views/PerformanceHub.tsx` - "Data Visualizations" toolbox:

| #   | Chart Name         | Type                  | Metrics                              |
| --- | ------------------ | --------------------- | ------------------------------------ |
| 1   | Daily Performance  | LineChart             | Views + Watch Hours trends (30 days) |
| 2   | Views by Format    | BarChart              | Views grouped by content format      |
| 3   | Views + Revenue    | AreaChart             | Dual-area trends                     |
| 4   | Subscribers + CTR  | LineChart (Dual-Axis) | Subscribers (left) + CTR% (right)    |
| 5   | Top Views Ladder   | BarChart              | Top 10 videos ranked by views        |
| 6   | Revenue by Format  | BarChart              | Revenue comparison across formats    |
| 7   | Format Share       | PieChart (Donut)      | Percentage distribution by format    |
| 8   | Engagement Scatter | ScatterChart          | Views (X) vs Likes (Y)               |

---

## 4. CHANNELYTICS CHART TOOLBOX (6 Stations)

Located in `src/components/ChannelyticsChartToolbox.tsx`:

| Station             | Chart Type            | Purpose                     |
| ------------------- | --------------------- | --------------------------- |
| Top Performers Trio | PieChart (Google)     | Revenue/Watch/Subs leaders  |
| Video Value Matrix  | BubbleChart (Google)  | CTR × Retention × Views     |
| Algorithm Trigger   | ScatterChart (Google) | Impressions vs CTR momentum |
| Device Immersion    | PieChart 3D (Google)  | Consumption environment     |
| Global Footprint    | GeoChart (Google)     | Market heat map             |
| Narrative DNA       | WordTree (Google)     | Semantic topic clustering   |

---

## 5. DATA VISUALIZATIONS VIEW (4 Custom SVG Charts)

Located in `src/views/DataVizualizations.tsx` - Custom SVG implementations:

| #   | Chart Name               | Type                  | Purpose                               |
| --- | ------------------------ | --------------------- | ------------------------------------- |
| 1   | Custom Scatter/Bubble    | SVG                   | Video Value Matrix, Algorithm Trigger |
| 2   | Custom Bar Chart         | SVG (Horizontal)      | Device Immersion, Global Footprint    |
| 3   | Top Performers KPI Cards | Custom Stat Cards     | Total Revenue, Views, Retention       |
| 4   | Chart Container Shell    | Neo-Brutalist Wrapper | Unified styling for all charts        |

---

## 6. DATA DASHBOARD COMPONENT (KPI Visualizations)

Located in `src/components/DataDashboard.tsx`:

### Channel Overview KPI Grid

- **Primary Metrics (4 cards):** Total Views, Watch Time, Revenue, New Subs
- **Secondary Metrics (3 cards):** Avg CTR, Avg RPM, Avg AVD
- **Content Breakdown:** Horizontal progress bars (Shorts vs Long-form)

---

## 7. CHANNELYTICS VIEW

Located in `src/views/Channelytics.tsx`:

### MobileLookChart (Viral Trajectory)

- **Type:** AreaChart (Recharts)
- **Features:** Gradient fill, custom tooltips, neo-brutalist styling
- **Purpose:** Simulated mobile-kit aesthetic for view trends

---

## 8. CHART ENGINE CAPABILITIES

Located in `src/components/ChartEngine.tsx`:

### Supported Google Chart Types

- LineChart, BarChart, ColumnChart
- ScatterChart, BubbleChart
- PieChart, GeoChart
- ComboChart, SteppedAreaChart
- TreeMap, WordTree
- CandlestickChart, CalendarChart
- Sankey (custom implementation)

### Supported Recharts Types

- LineChart, BarChart, AreaChart
- ScatterChart, PieChart, RadarChart

### Special Features

- **Smart Clipping:** Prevents extreme outliers from squashing data
- **Custom Tooltips:** Neo-brutalist styled with 4px black borders
- **Format Filtering:** Shorts vs Long-form toggle
- **Time Window Filtering:** 30d, 90d, All Time
- **Data Normalization:** Handles multiple CSV formats
- **Outlier Detection:** Marks and adjusts extreme values

---

## 9. TOTAL CHART COUNT SUMMARY

| Category                         | Count  |
| -------------------------------- | ------ |
| ResearchLab GoogleChartsGallery  | 34     |
| PerformanceHub Recharts          | 8      |
| ChannelyticsChartToolbox         | 6      |
| DataVizualizations Custom SVG    | 4      |
| DataDashboard KPI Visualizations | 2      |
| Channelytics MobileLookChart     | 1      |
| Google API Master Graph Catalog  | 7      |
| **TOTAL UNIQUE VISUALIZATIONS**  | **62** |

---

## 10. CHART TYPE BREAKDOWN

| Chart Type           | Count |
| -------------------- | ----- |
| ScatterChart         | 8     |
| BarChart/ColumnChart | 12    |
| LineChart/AreaChart  | 12    |
| PieChart/Donut       | 6     |
| BubbleChart          | 5     |
| SteppedAreaChart     | 6     |
| GeoChart             | 4     |
| ComboChart           | 4     |
| Sankey               | 1     |
| Calendar             | 1     |
| TreeMap              | 1     |
| CandlestickChart     | 1     |
| WordTree             | 1     |
| Custom SVG           | 4     |
| KPI Cards            | 7     |

---

## 11. VISUAL IDENTITY (Neo-Brutalist v2.2)

All charts enforce unified styling:

### Borders

- **Containers:** `border-[5px] border-black`
- **Components:** `border-[4px] border-black`

### Shadows

- **Primary:** `shadow-[12px_12px_0px_0px_black]`
- **Inner:** `shadow-[6px_6px_0px_0px_black]`

### Border Radius

- **Containers:** `rounded-[48px]`
- **Buttons/Cards:** `rounded-3xl`

### Colors (Neon High-Contrast)

- `#ff3399` (Hot Pink)
- `#ccff00` (Lime)
- `#00ccff` (Cyan)
- `#ffdd00` (Yellow)
- `#ffb158` (Orange)
- `#b14aed` (Purple)

### Typography

- **Weight:** `font-[1000]` (Ultra Bold)
- **Case:** `uppercase`
- **Tracking:** `tracking-tighter`
- **Impact:** `italic` for emphasis

### Header Pattern

"Flush Header" - Headers stretch to container edges with negative margins (`-m-6 mb-6 p-4`)

---

## 12. DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    GLOBAL DATA HUB                          │
│              (GlobalDataContext / useBrain)                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   CSV Upload    │ │  YouTube API    │ │  Local Storage  │
│   (DataForge)   │ │  (analyticsSync)│ │    (Cache)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CHART ENGINE                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Google    │ │   Recharts  │ │  Custom     │           │
│  │   Charts    │ │   (D3)      │ │  SVG        │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  ResearchLab    │ │ PerformanceHub  │ │  Channelytics   │
│  (34 charts)    │ │ (8 charts)      │ │ (6+ charts)     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 13. KEY FILES REFERENCE

| File                                          | Purpose                         | Chart Count |
| --------------------------------------------- | ------------------------------- | ----------- |
| `src/views/ResearchLab.tsx`                   | Comprehensive analytics gallery | 34          |
| `src/views/PerformanceHub.tsx`                | Post-publish intelligence       | 8           |
| `src/components/ChannelyticsChartToolbox.tsx` | Engagement & growth stations    | 6           |
| `src/components/ChartEngine.tsx`              | Central rendering engine        | All         |
| `src/views/DataVizualizations.tsx`            | Custom SVG implementations      | 4           |
| `src/components/DataDashboard.tsx`            | Channel overview KPIs           | 2           |
| `src/views/Channelytics.tsx`                  | Channel analytics lab           | 1+          |
| `docs/master_graph_catalog.md`                | Official chart specification    | 7           |

---

_Report generated: 2026-04-04_
_Total charts analyzed: 62 unique visualizations_
_Design system: Neo-Brutalist v2.2 (Ultra-High Contrast)_
