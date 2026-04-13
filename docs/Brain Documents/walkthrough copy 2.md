# Engagement Map & Station UI Refinements

The `Engagement Map` and `StationCard` have been overhauled to meet the latest design requirements, focusing on readability and a cleaner data visualization experience.

## Technical Accomplishments

### 1. Engagement Map Overhaul
- **Sorting Controls Relocation**: Moved the selection/sorting buttons from the orange title section to the chart footer, positioning them near the horizontal axis title for a more intuitive UX.
- **Stacked Hover Banner**: Redesigned the individual video statistics in the white hover banner to use a stacked numeric layout (Number above centered Label).
- **Clean Data Display**: Removed all colored circle icons from the hover banner to emphasize the raw data.
- **Enhanced Typography**: Increased the video title font size to `21px` for better legibility during hover interactions.

### 2. Chart Geometry & Fixes
- **Y-Axis Truncation Fix**: Increased the `chartArea.left` margin to `100` to prevent engagement numbers from being truncated into the "..." ellipsis.
- **Vertical Maximization**: Reduced vertical padding (`top` and `bottom` in `chartArea`) to increase the physical height of the chart within the station frame.
- **Fluid Animation**: Restored line animations specifically for the `Engagement Map` when switching between sorting metrics (Likes, Comments, Shares, Subs).

### 3. Layout Stability
- **Locked Banner Dimensions**: Fixed the hover banner's height to `56px` to prevent "layout jumps" when video titles wrap onto two lines.

## Verification Highlights

### Hover Banner (Before vs after)
- **Before**: Small title text, stats with dots in a row.
- **After**: Large title text (`21px`), stacked numeric stats, no dots, perfectly centered labels.

### Sorting Controls
- **'Radio Button' Restyle**: Converted sorting controls into large circular dots with bold labels. The active selection is now clearly indicated by a centralized black dot, identical to the provided reference mockup.
- **Location**: Now centered at the bottom of the chart in a clean, row-based layout.

## Visual Verification

![Engagement Map Hover State](/Users/cwb/.gemini/antigravity/brain/1be25b8b-7afe-4428-8b5a-789220c8432f/engagement_map_hover_verification_1774051933646.png)

![Engagement Map Verification Recording](/Users/cwb/.gemini/antigravity/brain/1be25b8b-7afe-4428-8b5a-789220c8432f/engagement_map_final_check_1774051835550.webp)

---

> [!TIP]
> Use the sorting buttons at the bottom of the Engagement Map to dynamically realign the chart data based on Likes, Comments, Shares, or Subscribers!
