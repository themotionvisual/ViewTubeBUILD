# Unified Chart Dashboard Design Specification

## Overview
A standalone HTML component incorporating:
1. **Shorts Retention Chart:** Time-series visualization of retention percentages.
2. **Engagement Map:** Multi-line animation tracking views, likes, comments, shares.

## Data Structures (API Based)
- **Shorts Retention:** `Array<{ timestamp: number; retention: number }>`
- **Engagement Map:** `Array<{ timestamp: number; views: number; likes: number; comments: number; shares: number }>`

## Design & Style
- **Aesthetic:** Neon-brutalist (thick borders, high-contrast colors).
- **Core Component:** Uses `UnifiedChartModule` pattern.
- **Animations:** CSS-based entrance and transition for retention curve and engagement lines.

## Components
- `ShortsRetentionChart`: Wraps Recharts area chart with custom tooltip/hover.
- `EngagementMap`: Multi-line chart with animated path transitions.
- `UnifiedChartModule`: Reused container for standardized titles and stats.
