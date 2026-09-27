# Dashboard/widget full-stack authority map

## Required starting authorities

- `AGENTS.md`
- `docs/governance/DOCUMENTATION.md`
- `docs/registry.json`
- `docs/governance/CONVERGENCE.md`
- `docs/architecture/PRODUCT_ARCHITECTURE.md`
- `docs/architecture/VIEWTUBE_SYSTEM_CONVERGENCE_AND_CONSOLIDATION.md`
- `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_MASTER_RESOURCE.md`
- `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md`
- `docs/architecture/WIDGET_SYSTEM_CERTIFICATION_MASTER_2026-09-14.md`
- `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` when responsive analytics/data-visual behavior changes

## Runtime frontend ownership

- `src/views/dashboard/WidgetRegistryBase.ts`
- `src/views/dashboard/WidgetRegistry.ts`
- `src/views/dashboard/WidgetRendererBase.tsx`
- `src/views/dashboard/WidgetRenderer.tsx`
- `src/views/dashboard/WidgetShell.tsx`
- `src/views/dashboard/DashboardCanvas.tsx`
- `src/views/dashboard/storage.ts`
- `src/views/dashboard/widgetCertification.ts`
- `src/views/dashboard/WidgetPrimitives.tsx`
- `src/views/dashboard/widgets/`
- `src/views/dashboard/tokens.ts`
- `src/views/dashboard/toolboxWidgetSystem.css`

## Backend/data ownership

- `src/services/analytics-canon/` for normalized analytics consumers
- `src/features/vt-sync-local/` for raw synchronized evidence and sync lifecycle
- `src/services/brain/runtime/` for AI reasoning/orchestration
- `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md` for project/content identity
- `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md` for durable asset/provenance/variant lifecycle
- `server/simple-auth.mjs` and typed server YouTube services for auth/API boundaries
- `server/` and `src/server/` job/operation implementations for recoverable long work

## Integration rules

Use one `channelId + projectId + contentBuildId` identity chain. Treat Data Visuals as presentation, not metric storage. Treat Project, ContentBuild, Asset/Vault, Video Package, Publishing Package, editor state, and published video as manifestations of one durable content identity. Route AI through BrainRuntime. Route media generation through Video Director and durable outputs through Asset Engine/Vault. Keep external writes approved, idempotent, auditable, and reversible where possible.
