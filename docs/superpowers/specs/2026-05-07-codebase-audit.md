# ViewTubeX Master Architecture Audit

## 1. App Level (src/app)

### `AppRoutes.tsx`
- **What it is:** The central routing map.
- **What it does:** Defines navigation paths for the entire application.
- **Contains:** Router configuration, route definitions, component mappings.
- **Interactions:** Depends on all top-level `views` and `components`.
- **Implementation:** Integrated.
- **Visualization:** N/A (routing logic).
- **Reality:** Active.
- **Status:** Integrated.
- **Optimization:** Consolidate lazy-loaded routes to minimize initial bundle size.

### `AppShell.tsx`
- **What it is:** Global layout container.
- **What it does:** Renders header, sidebar, and layout wrapper for app content.
- **Contains:** Sidebar, header components, main content area.
- **Interactions:** Consumes `Sidebar`, `ToolHeader`.
- **Implementation:** Integrated.
- **Visualization:** Left sidebar + main content area.
- **Reality:** Active.
- **Status:** Integrated.

## 2. Views (src/views)

### `Dashboard.tsx`
- **What it is:** Application landing page.
- **What it does:** Displays daily tasks and channel health snapshots.
- **Contains:** Widgets, layout.
- **Interactions:** Reads from `GlobalDataContext`.
- **Implementation:** Active.
- **Visualization:** Neo-brutalist widget grid.
- **Reality:** Live.
- **Status:** Essential.

### `VideoManager.tsx`
- **What it is:** CMS backbone.
- **What it does:** Lists and manages YouTube video inventory.
- **Contains:** Data mapping, pagination logic.
- **Interactions:** `youtubeService`.
- **Implementation:** Dormant/Redirected (orphaned).
- **Visualization:** Data table.
- **Reality:** Needs rework or removal.
- **Status:** Remove/Merge into `ResearchLab`.

... (continuing audit for remaining components)
