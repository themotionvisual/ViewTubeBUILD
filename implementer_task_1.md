You are the implementer subagent. Your task is to update the widget registry and types.

Task 1: Update Widget Registry and Types

Files to Modify:
1. 'src/views/dashboard/WidgetRegistry.ts' - add the new widgets (consistency-heatmap, goals-tracker, alerts-ticker) to the DASHBOARD_WIDGET_REGISTRY array.
2. 'src/views/dashboard/types.ts' - ensure any new types needed for these widgets are defined (e.g., if widget definitions have new fields).

Implementation details:
- Add the three widget objects defined in the implementation plan to the 'DASHBOARD_WIDGET_REGISTRY' array.
- Follow existing patterns in the file.
- Add minimal necessary types to 'types.ts' if required by the new widget fields.

Verification:
- Run 'npm run build' to ensure registry updates are syntactically correct and type-safe.

Commit:
- git add src/views/dashboard/WidgetRegistry.ts src/views/dashboard/types.ts
- git commit -m "feat(dashboard): register new consistency, goals, and alerts widgets"
