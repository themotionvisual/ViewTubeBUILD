# 📈 THE ULTIMATE CHART SYSTEM RECONSTRUCTION BIBLE

Yo! This is the definitive brain-dump of everything we built, broke, and planned for the ViewTube chart system (specifically from the `1be25b8b` run). If you're looking to re-create or re-integrate these visuals, this is your map.

---

## 🎨 THE DESIGN DNA (Don't break the vibe)
Before you touch the code, remember the **Pop-Dashboard / Neo-Brutalist** rules we established:
- **Thick Borders**: Everything gets `border-[6px] black`. No exceptions.
- **Bold Typography**: Video titles in hover banners should be `21px`. Large numeric stats.
- **Margins are Key**: We fixed the Y-axis "..." bug by setting `chartArea.left` to `100`. Keep it wide.
- **The "Hover Banner" Logic**: 
  - Redesigned for raw data (removed the colored dots).
  - Use a **stacked layout**: Large Number on top, Label (L, C, S, V) centered underneath.
  - Height is locked at `56px` to prevent layout jumps when titles wrap.
- **Footer Controls**: Move sorting buttons (Likes, Comments, etc.) out of the title area and into the **chart footer**. Use the "Radio Button" style: large dots with bold labels.

---

## 🚀 THE 10 "RESEARCH LAB" EXPANSIONS (Backlog)
These charts were planned and logic-mapped but **not yet integrated** into the active Research Lab. Here’s the technical juice on how to build them:

### [ ] 1. Geo CPM (World Heatmap)
- **Tech**: Use `google.visualization.GeoChart`.
- **Logic**: Map `Country` names from CSV to `Revenue/CPM`.

### [ ] 2. Momentum Heatmap (The 24/7 Grid)
- **Tech**: Custom Grid / Heatmap component.
- **Logic**: A 7x24 grid (Day of Week vs. Hour of Day). Each cell’s color intensity = View volume.

### [ ] 3. Retention Funnel (The Drop-off)
- **Tech**: Styled SVG Funnel or `google.visualization.SteppedAreaChart`.
- **Logic**: Waterfall data: `Impressions -> Views -> Clicks`. 

### [ ] 4. Series vs. Standalone (Box Plot)
- **Tech**: `google.visualization.CandlestickChart`.
- **Logic**: Map median, quartiles, and outliers for video views in a specific series.

### [ ] 5. Seasonal RPM Radar (Spider Chart)
- **Tech**: Radar/Spider chart.
- **Logic**: 12 points (Jan-Dec) showing RPM/Views.

### [ ] 6. Thumbnail A/B Test Annotation
- **Tech**: `LineChart` with `Annotation` columns.
- **Logic**: Add vertical markers at timestamps where metadata (Title/Thumbnail) changed.

### [ ] 7. Algorithm Trigger Matrix
- **Tech**: ComboChart (Double Y-Axis).
- **Logic**: Overlay `Impressions`, `CTR`, and `Views` on one timeline.
- **The "Gotcha"**: Look for the point where Impressions spike while CTR stays flat.

### [ ] 8. OS Revenue vs. Volume
- **Tech**: Nested Donut (Sunburst).
- **Logic**: Inner ring = Volume (Views per OS), Outer ring = Revenue.

### [ ] 9. Long-Tail Shelf Life (Day 0 Normalization)
- **Tech**: Smoothed LineChart.
- **Logic**: Reset every video's publish date to `Day 0` on the X-axis.

### [ ] 10. Golden Ratio Benchmark
- **Tech**: Overlay Radar.
- **Logic**: Set a "Top 1% Success" video as a ghost background.

---

## ✅ COMPLETED REFINEMENTS (Verified)
The layout is now rock-solid. These items were pushed live and verified:
- **Header Shave**: Decreased header heights for a thinner, more professional look.
- **The 'Expand' Button**: Small, full border, perfectly padded.
- **Subtitle Fix**: Positioned subtitle directly under titles.
- **Metric Labels**: Added labels to the legend bar numbers.
- **Heavy Borders**: Standardized to `border-[6px]` across all station frames.
- **Engagement Map Overhaul**: Sorting buttons moved to footer; Hover banner rebuilt (stacked layout, no dots, 21px title).

---

## 📝 SCRATCHPAD & INSIGHTS
*Insider field notes from the development logs.*

- **The Algorithm Trigger**: Momentum is the point where **Impressions spike while CTR and AVD stay consistent**. Re-creating the `Algorithm Trigger Matrix` requires normalized timelines.
- **JSON Parsing**: API responses often come wrapped in markdown code blocks. Always manual-clean before running `JSON.parse`.
- **Margin Math**: The `100px` left margin for `chartArea` is the magic number to prevent numeric truncation ("..." bug).

### Data Requirements
To build the backlog, your source must include:
- `Country` (string)
- `PublishTime` (ISO string/timestamp)
- `EndScreenClicks` (integer)
- `Impressions` & `CTR` (timelines)
- `DeviceType` & `RevenuePerDemographic`

---

## 🎯 SINGLE-VIDEO "DEEP DIVE" IDEAS
If you're building a "Video Details" page, here are the top picks from our 20-chart brainstorm:
- **Audience Retention Curve**: AreaChart showing the exact "hold" percentages.
- **New vs. Returning Magnet**: A ring chart (`pieHole: 0.6`) for community vs. discovery.
- **Device Immersion**: 3D Pie Chart (TV vs. Mobile vs. Desktop).
- **Traffic Source Ecosystem**: A cascading `TreeMap` for sources (Search, Browse, Suggested).
- **Sharing Network**: `BubbleChart` plotting Platform (X) vs Link Clicks (Y).
