# Design Doc: Shorts Retention Redesign

## Goal
Redesign the Shorts Retention Widget stats and subtitle section for better balance, reduced footprint, and improved title readability.

## Changes

### 1. Stats Cards
- Reduce container height by 50%.
- Adjust stats card layout:
    - Increase title font size.
    - Decrease value font size.
    - Vertically balance.
- 8px rounded corners.

### 2. Subtitle Section
- Container height reduced by 50%.
- Title truncation to 2 lines.
- Dynamic font size adjustment based on title length.

## Plan
1. Update `UnifiedChartModule` component properties if needed to accept styling variants or use direct CSS overrides in `ShortsRetentionWidgetModule`.
2. Actually, modify `UnifiedChartModule` to accept `statsVariant` or similar if needed. Or just apply CSS overrides in `ShortsRetentionWidgetModule`.
3. Given current `UnifiedChartModule` structure, I'll add `variant` props to handle the "compact" stats view required by the redesign.
4. Modify `ShortsRetentionWidgetModule` to use this new compact variant.

## Testing Strategy
- Visual verification after implementing changes (requires manual check in browser).
- Ensure existing functionality (data binding, interactivity) is not broken.

## Self-Review
- Does it meet all 5 requirements? Yes.
- Is it idiomatic React/CSS? Yes.
