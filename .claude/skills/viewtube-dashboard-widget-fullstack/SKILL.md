---
name: viewtube-dashboard-widget-fullstack
description: Build complete ViewTube dashboard and widget capabilities from creator goal through frontend, backend, data contracts, AI, analytics, jobs, persistence, security, responsive UI, and verification. Use when implementing or redesigning a dashboard/widget tool that needs end-to-end product behavior, not just presentation changes.
---

# Dashboard Widget Full-Stack Builder

Build a dashboard/widget capability as a complete product slice. The widget is the visible endpoint of a governed system: creator goal → context/evidence → typed data/action contract → operation or job → widget state → project/asset/editor/publish handoff → outcome. Do not stop at a polished card with fake data.

## First principles

- Start from the creator decision or action, not a chart type or visual mock.
- Give the capability one stable identity and one canonical owner.
- Standardize shell, grid, tokens, primitives, state semantics, and verification; keep the interior specific to the creator job.
- Treat current runtime code, registries, tests, and verified behavior as truth. Plans, screenshots, prototypes, and historical documents are evidence only.
- Never create a widget-local analytics truth store, auth system, AI provider stack, project/content store, asset store, or learning ledger.

## Mandatory reading

Read `AGENTS.md`, `docs/governance/DOCUMENTATION.md`, `docs/registry.json`, `docs/governance/CONVERGENCE.md`, `docs/architecture/PRODUCT_ARCHITECTURE.md`, `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_MASTER_RESOURCE.md`, and `references/authority-map.md`. Read the analytics, project/content, asset, Brain, editor, YouTube, or Data Visual authority named by the feature contract. Use `references/dashboard-contract.md` as the planning output shape.

## Delivery workflow

### 1. Define the job and boundary

Write a Widget Identity Brief with stable ID, title, user problem, primary input/output/action, supporting actions, signature functional component, canonical dependencies, cross-tool handoffs, supported dimensions, invariant composition, contraction/expansion behavior, and all data states.

Search current routes, registry metadata, renderer keys, widgets, services, APIs, jobs, plans, ideas, active branches, and persisted layout consumers. Record Existing Work Checked and choose one disposition: extend, combine, merge, generalize, adapt, or create-review. If the job duplicates another surface, consolidate before adding UI.

### 2. Design the contract before JSX

Specify:

- `widgetId`, capability/task ID, channel/project/ContentBuild/asset/job IDs;
- canonical data source and freshness/time-window semantics;
- view-model schema and unavailable/missing/unsupported meanings;
- read path, caching, pagination, and recovery;
- write path, operation/job lifecycle, idempotency, rollback, and audit;
- permissions, auth/session/capability checks, quota, and external side effects;
- AI context, Brain capability, structured output, provenance, and approval boundary;
- output handoffs to Project, ContentBuild, Asset/Vault, Editor, Video Director, Publisher, YouTube, Analytics, Chat, or other tools.

### 3. Build the backend truth path

Use the existing bounded service or create the smallest typed owner after proving no owner exists. Analytics consumers read through `services/analytics-canon`; VT-SYNC remains raw acquisition/sync truth. A missing window is not zero. A Data Visual is presentation, not a metric store. YouTube calls use server-owned typed auth/API services; never add browser token storage, direct provider fetches from UI, or arbitrary proxy endpoints.

For writes or expensive work, use a typed operation/job record with status, progress, cancellation, retry, idempotency key, request correlation, audit receipt, and provider-specific error mapping. Validate ownership, session, channel/content-owner context, capability and scopes on the server. Do not globally sign a user out because one widget request receives an auth/provider error.

### 4. Connect AI and durable work

UI code requests BrainRuntime capabilities; it does not call models. Bound context by surface, creator/channel, project, ContentBuild, selection, evidence, permissions, and task. Return typed proposals with source refs, confidence, freshness, model/prompt version, and cost where relevant. Require preview/accept/revise/reject for mutations. Route media generation through Video Director and register outputs in Asset Engine/Vault before inserting them into durable project/editor state.

### 5. Implement the frontend

Use the canonical dashboard shell and primitive exports. Keep `WidgetRenderer` a resolver and boundary, not an implementation dump. Give the widget one top-level owner and one registry definition. Lazy-load expensive code, libraries, data subscriptions, and provider adapters inside the widget boundary. Use container queries for internal composition and dashboard media queries only for page/grid geometry. Keep nested tracks shrinkable with `min-width: 0` and use one intentional bounded scroll region.

The signature component must perform the job: a queue, matrix, timeline, simulator, anomaly field, comparison, planning lane, media stack, or another purposeful system. Decoration does not count.

### 6. Implement honest states and dimensions

Keep shell existence independent from data availability. Implement connected/ready, loading/progress, empty, disconnected/auth-required, stale, partial/unsupported, permission/quota-blocked, error/retry, and success/next-action states. A preview is allowed only when it teaches the real interaction, is visibly labeled PREVIEW/EXAMPLE, uses generic fixtures, and offers recovery. Never mix sample values with creator analytics, evidence, persistence, AI context, or outcomes.

Declare width and height buckets. For every supported width × height combination decide FIT, ADAPT, or SCROLL. Outer height remains deterministic; body content must not expand the dashboard cell. Contract width and height independently: shrink primitive/detail/density before removing the signature component; expand detail and supporting context before adding empty space. Phone behavior must preserve desktop persisted size and use the canonical full-row/height contract where applicable.

### 7. Wire the product handoffs

Preserve the durable identity chain. A widget output should open, create, update, or hand off to the receiving owner with typed context rather than anonymous JSON. Use ActionPacket/Handoff/ToolReceipt or the current operation contract. Record selected asset IDs, project/content IDs, evidence references, and outcome hooks when they exist.

### 8. Verify and document

Run focused backend/schema/job tests, widget contract tests, dashboard registry/renderer tests, typecheck, build, accessibility checks, responsive screenshots, keyboard/touch interaction proofs, error/recovery tests, and security/privacy checks. Measure bundle, network, render, query, and operation impact for optimization work. Update the relevant master resource, registry, user-guide/route metadata, UI Reference Library, and verification receipt. Do not call a widget VERIFIED from source inspection alone.

## Non-negotiable quality gates

- one stable widget ID and one top-level implementation owner;
- no copied analytics/auth/project/asset/AI truth;
- canonical data freshness/window and missing-data semantics;
- server-side permission, quota, rate, idempotency, audit, and recovery controls;
- structured AI proposals with provenance and approval;
- deterministic shell dimensions and bounded scroll behavior;
- readable labels, focus, keyboard/touch access, reduced motion, and non-color meaning;
- connected, disconnected, empty, loading, stale, blocked, error, preview, and success evidence;
- tests plus runtime/visual interaction proof.

## Recommended verification commands

```bash
npx vitest run src/views/dashboard/__tests__
npx tsc -b
npm run build
npm run test:ai-systems-governance
```

Add the feature's focused API/job/contract tests and capture the declared desktop, narrow, portrait, and landscape states. Report pre-existing failures separately from regressions.
