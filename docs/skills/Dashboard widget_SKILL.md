---
name: implement-viewtube-dashboard-widget
description: >
  Procedure for adding new widgets to the ViewTube Analytics Dashboard.
  Triggers: "add a widget", "create a goals widget", "register a new widget",
  "dashboard widget implementation".
---

## When to Use
Use this skill when you need to add a new functional widget to the main Analytics Dashboard. This ensures the widget is correctly registered, rendered, and provided with the necessary data.

## Procedure

1. **Define Widget Metadata**
   Open `src/views/dashboard/WidgetRegistry.ts`. Add a new object to the `DASHBOARD_WIDGET_REGISTRY` array.
   - `id`: unique kebab-case string (e.g., `consistency-heatmap`).
   - `title`: Human-readable title.
   - `subtitle`: Descriptive sub-text.
   - `category`: One of `DashboardWidgetCategory` (from `types.ts`).
   - `defaultSize`, `minSize`, `maxSize`: One of `DashboardSizeBucket` (`full`, `half`, `third`, `quarter`).
   - `headerColor`, `iconRailColor`: Hex codes for the industrial aesthetic.
   - `dependency`: List of required data sources (e.g., `["youtube_analytics_v2"]`).

2. **Update Type Definitions (If Needed)**
   Open `src/views/dashboard/types.ts`. If your widget uses a new category or has unique state requirements, add them to `DashboardWidgetCategory` or the relevant interfaces.

3. **Implement Rendering Logic**
   Open `src/views/dashboard/WidgetRenderer.tsx`.
   - Add a case for your widget's `id` inside the `WidgetRenderer` component.
   - Return your widget component wrapped in `WidgetShell`.
   - Example:
     ```tsx
     if (widget.id === "my-new-widget") {
       return (
         <WidgetShell {...common} icon={<Activity size={20} />}>
           <MyNewWidget data={data} />
         </WidgetShell>
       )
     }
     ```

4. **Connect Data (Optional)**
   If the widget requires specific processed data, update `src/views/dashboard/useDashboardData.ts`.
   - Add a `useMemo` block to compute or select the data.
   - Include the new data in the `DashboardData` interface and the returned object.

5. **Verify Integration**
   - Start the dev server.
   - Open the Dashboard.
   - Use the **Widget Picker Panel** (found in edit mode or at the bottom) to enable the new widget.
   - If the dashboard supports pagination, ensure the widget ID is added to the correct page in `DashboardCanvas.tsx`.

## Pitfalls and Fixes
- **Widget not appearing**: The widget might be hidden by default in the layout state. Check `src/views/dashboard/storage.ts` or reset the layout using the "Reset Layout" button in the UI.
- **Style leaks**: The dashboard uses a high-contrast industrial style. Ensure your widget component uses descendant selectors or scoped Tailwind classes to avoid conflicts.

## Verification
- Widget appears in the "Widget Picker" with the correct title and icon.
- Widget renders in the dashboard grid when toggled ON.
- Resizing the widget cycles through the defined `minSize`, `defaultSize`, and `maxSize`.
