# 20 Single-Video Analytics Chart Ideas (Google Charts API)

Here are 20 unique chart ideas tailored specifically for analyzing a **single video**, leveraging various styles available in the Google Charts API to deep-dive into individual performance:

## 🎯 The "Hook & Hold" Metrics

**1. The Audience Retention Curve (AreaChart)**
*   **Data**: Timestamp (X), Percentage of Viewers Remaining (Y).
*   **Style**: A smooth, filled Area Chart (with organic curves) highlighting exactly where viewers drop off or rewatch specific moments.

**2. The Impressions Funnel (SteppedAreaChart)**
*   **Data**: Impressions -> Views -> Engagements.
*   **Style**: A staircase stepped-area chart showing the brutal drop-offs at each stage of the viewer journey, acting like a conversion funnel.

**3. The Hook Success Rate (GaugeChart)**
*   **Data**: Retention at the 0:30 mark.
*   **Style**: A dashboard speedometer. If 75%+ of viewers are still watching at 30 seconds, the needle pegs into the "Green/Viral" zone.

**4. End Screen Conversion Funnel (BarChart / Waterfall)**
*   **Data**: Made it to End Screen -> Elements Shown -> Clicks.
*   **Style**: A descending colored bar chart to see if the video effectively translates its audience to the next piece of content.

## 🌍 Audience & Demographics

**5. Solo Global Reach (GeoChart)**
*   **Data**: Country vs. Views for *this specific video*.
*   **Style**: An interactive world map. Great for recognizing if a single video randomly went viral in Germany or Brazil compared to your normal audience.

**6. Demographic Matrix (Stacked ColumnChart)**
*   **Data**: Age Brackets (X), Views (Y), Stacked by Gender.
*   **Style**: Thick, bold stacked columns to immediately identify the core viewer profile (e.g., 18-24 Males vs. 25-34 Females) for this exact video.

**7. New vs. Returning Magnet (PieChart - Donut Style)**
*   **Data**: New Viewers vs. Returning Viewers.
*   **Style**: A sleek ring chart (PieChart with `pieHole: 0.6`) showing if this video served as a discovery engine (high new viewers) or a community pleaser (high returning).

**8. Device Immersion (3D PieChart)**
*   **Data**: TV vs. Mobile vs. Desktop vs. Tablet.
*   **Style**: A classic 3D Pie Chart. High TV viewership usually correlates with much higher watch time, explaining performance spikes.

**9. Subtitle Language Penetration (Horizontal BarChart)**
*   **Data**: Language (X), Watch Time (Y).
*   **Style**: A simple horizontal bar chart showing how much of the video's success relied on localized translations.

## 🚦 Traffic & Discovery

**10. Traffic Source Ecosystem (TreeMap)**
*   **Data**: Broad Sources (Browse, Search) breaking down into Specifics (Home Page, Up Next, Specific Search Terms).
*   **Style**: A cascading block map where the size of the box dictates the volume of traffic. Beautiful for complex source breakdowns.

**11. The Discovery Signature (RadarChart / Spider via Column)**
*   **Data**: Browse vs. Search vs. Suggested vs. External.
*   **Style**: A radar web plotting the "shape" of the video's traffic. A massive spike towards "Suggested" means the algorithm took over.

**12. Sharing Network (BubbleChart)**
*   **Data**: Platform (WhatsApp, X, Reddit), Shares (X), Link Clicks (Y).
*   **Style**: Floating bubbles representing where the video is being shared externally and how effectively those shares convert back into views.

**13. Playback Location (DonutChart)**
*   **Data**: YouTube Watch Page vs. Embedded on External Sites vs. YouTube Shorts Feed.
*   **Style**: A minimalist ring chart showing where the actual playback occurred.

## 💰 Monetization & Value

**14. The Ad Revenue Breakdown (Stacked BarChart)**
*   **Data**: Bumper Ads, Skippable, Non-Skippable, Premium Revenue.
*   **Style**: A single horizontal 100% stacked bar showing exactly which ad types bankrolled the video.

**15. Subscriber Impact (CandlestickChart)**
*   **Data**: Subs Gained vs. Subs Lost.
*   **Style**: Using rising (green) and falling (red) candlesticks to show the net subscriber flow. Did the video go viral but alienate your core base?

**16. Revenue vs. Watch Duration Limit (ScatterPlot)**
*   **Data**: Viewer Watch Time length vs. Revenue generated.
*   **Style**: A scatter plot proving if viewers who stay longer actually trigger the mid-roll ads and generate higher RPMs.

## ⏱️ Timeline & Momentum (Requires Daily Data)

**17. The First 7 Days Momentum (LineChart)**
*   **Data**: Day 1 to Day 7 Views.
*   **Style**: A steep, curving line chart showing the trajectory of the video's launch week compared to channel averages.

**18. Daily Click-Through Rate Heartbeat (Smoothed LineChart)**
*   **Data**: Date (X), CTR % (Y).
*   **Style**: A trendline showing how the thumbnail performed over time—did CTR drop off a cliff on Day 3, or hold steady?

**19. Algorithm Resurrection (ComboChart - Line + Bar)**
*   **Data**: Daily Impressions (Bars), Daily Views (Line).
*   **Style**: Perfect for spotting "resurrected" videos. If the bars (Impressions) suddenly spike months after upload, YouTube found a new audience for it.

**20. Interaction Density (Histogram / ColumnChart)**
*   **Data**: Video Timeline (X), Density of Comments/Likes (Y).
*   **Style**: If you have API access to comment timestamps, this creates a "heat" graph of the video, showing the exact moments that made viewers laugh, pause, and type a comment.
