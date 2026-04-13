# Building Dashboard Widgets

We will enhance the Dashboard view with new, highly aesthetic widgets to provide a comprehensive overview.

## Proposed Changes

### Dashboard Widget Components
#### [NEW] `src/components/dashboard/StatBoxWidget.tsx`
- A premium, dynamic stat box component.
- Supports displaying a metric (e.g., Views, Subscribers, Revenue) for a specific time period (e.g., "Past 28 Days").
- Includes trend indicators (up/down arrows with percentages) and micro-animations on hover.

#### [NEW] `src/components/dashboard/MiniCalendarWidget.tsx`
- Create a miniaturized version of the Project Planning calendar.
- Displays a 2-week rolling view.
- Visualizes project publish dates and tasks with colorful indicators mapping to `brain.projects` data.

#### [NEW] `src/components/dashboard/StatChartWidget.tsx`
- A reusable chart widget wrapping `MobileLookChart`.
- Designed to display 28-day trends with beautiful gradients and vibrant colors.

### `src/views/Dashboard.tsx`
#### [MODIFY] `src/views/Dashboard.tsx`
- Integrate `MiniCalendarWidget`.
- Replace or augment the top stat row with `StatBoxWidget` instances for past 28-day stats (Views, Subscribers, Revenue).
- Add `StatChartWidget` instances to display multiple graphs as requested.
- Re-layout the dashboard to accommodate the new widgets while maintaining the "Creator OS v2.1" aesthetic (heavy borders, vivid colors, brutalist shadows, glassmorphism elements if appropriate).

## Verification Plan
### Manual Verification
1. User will navigate to the Dashboard view (`/`).
2. Verify that the new Stat Boxes (Subscribers, Views, Revenue) render correctly with their 28-day labels.
3. Verify that the Mini Calendar widget displays properly and visually indicates active project dates.
4. Verify that additional graphs (e.g., Revenue Trend, Subscriber Trend) render correctly and fit the premium visual language of the application.
