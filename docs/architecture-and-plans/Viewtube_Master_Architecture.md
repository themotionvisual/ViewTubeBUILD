# Viewtube_Master_Architecture.md - Consolidated

> [!NOTE]
> In-place rewritten on 2026-05-09 for a full-system architecture + modernization audit of `viewtubeX`.

## Executive Reality Snapshot

- Scope analyzed: **406 files** across `src`, `dist`, `public`, `server`, `scripts`.
- Runtime baseline: `npm run typecheck` is currently red with broad legacy/copy-file collisions and type-contract drift.
- Architecture condition: mixed modern core (`editor-core`, service contracts) plus high legacy noise (backup/copy artifacts, giant coupled files).
- Source-of-truth risk: duplicated feature variants and backup files currently compete with canonical modules.

## Method + Status Legend

- `Active`: imported/mounted runtime or explicit entrypoint.
- `Partially used/orphan candidate`: present but weak/no inbound linkage.
- `Legacy/backup`: copy/bak/scratch archival material in active tree.
- `Dead artifact`: `.DS_Store` and non-functional residue.
- `Active build artifact`: compiled output in `dist`.

## SRC System Audit

### Misc

:::sub src/App.css
- **What it is:** Stylesheet in Misc.
- **What it does:** Supports app composition.
- **What it contains:** 185 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Misc.
- **Current implementation:** File-local implementation with 10 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~10 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/App.tsx
- **What it is:** React/TSX module in Misc.
- **What it does:** Supports app composition.
- **What it contains:** 80 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, ./context/GlobalDataContext, ./app/AppShell, ./app/AppRoutes.
- **System membership:** Misc.
- **Current implementation:** File-local implementation with 10 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~10 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Shell + Routing

:::sub src/app/AppRoutes.tsx
- **What it is:** React/TSX module in Shell + Routing.
- **What it does:** Implements shell routing/composition.
- **What it contains:** 145 lines; export const AppRoutes.
- **What it interacts with:** Imports/links: react, react-router-dom, ../views/Dashboard, ../views/DashboardLegacy, ../views/StudioHub.
- **System membership:** Shell + Routing.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/app/AppShell.tsx
- **What it is:** React/TSX module in Shell + Routing.
- **What it does:** Implements shell routing/composition.
- **What it contains:** 77 lines; export const useEntitlement; export const AppShell.
- **What it interacts with:** Imports/links: react, react-router-dom, react-router-dom, lucide-react, ../components/Sidebar.
- **System membership:** Shell + Routing.
- **Current implementation:** File-local implementation with 9 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~9 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Source Assets

:::sub src/assets/hero.png
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!A:B-TESTING.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!DELETE.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!GENERATE1.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!GENERATE2.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!GEOGRAPHY.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!POST-IMAGE.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!POST-VIDEO.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!REVENUE.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!SETTINGS.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!SUBSCRIBERS.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!TRAFIC.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/!!!YOUTUBE.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/*SYMBOLS19.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/*SYMBOLS22.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/calendar_apps_script_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/center_focus_weak_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/close_21dp_1F1F1F_FILL0_wght700_GRAD200_opsz20.png
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/cloud_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/format_shapes_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/home_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/lightbulb_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/mic_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/palette_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/podcasts_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/search_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/storage_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/view_cozy_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/volume_up_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/vtx.png
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/icons/wand_stars_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48(1).svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/react.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 182 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~182 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/toolbox-toggle/zoom-in-35.png
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/toolbox-toggle/zoom-in-50.png
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/toolbox-toggle/zoom-out-35.png
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/toolbox-toggle/zoom-out-50.png
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/assets/vite.svg
- **What it is:** Static media asset in Source Assets.
- **What it does:** Supports app composition.
- **What it contains:** 2 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Source Assets.
- **Current implementation:** File-local implementation with 23 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~23 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Chart Contracts

:::sub src/chartSystem/unifiedChartSpec.ts
- **What it is:** TypeScript logic module in Chart Contracts.
- **What it does:** Supports app composition.
- **What it contains:** 222 lines; export type UnifiedChartId; export type UnifiedRendererFamily; export interface UnifiedChartSpec; export const CHART_THEME.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Chart Contracts.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Component System

:::sub src/components/__tests__/ShortsRetentionChart.test.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 18 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, react-dom/client, ../ShortsRetentionChart, react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/assets/AnimatedSubscribe.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 71 lines; export const AnimatedSubscribe.
- **What it interacts with:** Imports/links: react, ./assetAnimations.css.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/assets/assetAnimations.css
- **What it is:** Stylesheet in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 100 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/BrainLinkRow.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 67 lines; export const BrainLinkRow.
- **What it interacts with:** Imports/links: react, ../context/useBrain, lucide-react, lucide-react, ../types.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ChannelyticsChartToolbox.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 1003 lines; export const ChannelyticsChartToolbox.
- **What it interacts with:** Imports/links: react, ../types, ./ChartEngine, ../chartSystem/unifiedChartSpec, ../services/metricAliasResolver.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ChartEngine.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 278 lines; export const MemoizedGoogleChart; export const RenderGoogleChart; export const TrioPieCard; export const RenderChart.
- **What it interacts with:** Imports/links: react, react-google-charts, ../types, lucide-react, ../chartSystem/unifiedChartSpec.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/CommentResponder.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 101 lines; export const CommentResponder.
- **What it interacts with:** Imports/links: react, lucide-react, ./PostActionReflection, ../services/gemini, react-markdown.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/CommunityPostGenerator.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 103 lines; export const CommunityPostGenerator.
- **What it interacts with:** Imports/links: react, lucide-react, ./PostActionReflection, ../services/gemini, react-markdown.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ComponentGridLab.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 319 lines; export const ComponentGridLab.
- **What it interacts with:** Imports/links: react, ./ui, ../views/referenceStudio/ReferenceStudioPrimitives.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/CreatorPet.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/CustomIcon.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 110 lines; export const CustomIcon.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 13 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~13 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/DailyAdviceWidget.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 176 lines; export const DailyAdviceWidget.
- **What it interacts with:** Imports/links: react, ../context/useBrain, ../services/gemini, lucide-react, react-router-dom.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/DataDashboard.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 295 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/analyticsContract, ../services/analyticsSelectors, ../services/analyticsRuntime, ../services/canonicalMetricResolver.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/EndScreenTool.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 104 lines; export const EndScreenTool.
- **What it interacts with:** Imports/links: react, lucide-react, ./PostActionReflection, ../services/gemini, react-markdown.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/EntitlementGate.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 18 lines; export const EntitlementGate.
- **What it interacts with:** Imports/links: react, react-router-dom, ../services/billingEntitlement.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ErrorBoundary.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 59 lines; export class ErrorBoundary.
- **What it interacts with:** Imports/links: react, lucide-react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/GraphsPageCharts.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 1040 lines; export interface GChartProps; export const VideoValueMatrix; export const RevenueDistribution; export const WatchTimeDistribution.
- **What it interacts with:** Imports/links: react, ./marquee.css, recharts, ../services/analyticsContract, ../services/canonicalMetricResolver.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/Icons.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 174 lines; export const Icons.
- **What it interacts with:** Imports/links: lucide-react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/InsightMarquee.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 165 lines; export type InsightBadgeTone; export interface InsightMarqueeSegment; export interface InsightMarqueeProps; export const InsightMarquee.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/IntelligenceHub/gemini.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 50 lines; No named exports detected.
- **What it interacts with:** Imports/links: ./intelligence, ../../services/brainEngine.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 32 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~32 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/IntelligenceHub/intelligence.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 68 lines; export const SYSTEM_PROMPTS.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/IntelligenceHub/IntelligenceChart.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 139 lines; export const IntelligenceChart.
- **What it interacts with:** Imports/links: react, recharts, ./types, ../StableChartFrame.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/IntelligenceHub/IntelligenceHub.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 391 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ./types, ./IntelligenceChart, ../../services/brainEngine.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/IntelligenceHub/types.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 81 lines; export interface ChartConfig; export interface OracleSection; export interface OracleReport; export interface AlgorithmDiagnosis.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 52 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~52 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/IntelligenceHub/ultimateReport.test.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 89 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ./gemini, ./ultimateReport.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/IntelligenceHub/ultimateReport.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 442 lines; export const __test__.
- **What it interacts with:** Imports/links: ./gemini, ./types.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/marquee.css
- **What it is:** Stylesheet in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 136 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/MediaAnalyzer.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 5 lines; No named exports detected.
- **What it interacts with:** Imports/links: ../views/MediaAnalyzer.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** Consolidate duplicated view/component naming boundary.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/MiniCalendarWidget.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 114 lines; export const MiniCalendarWidget.
- **What it interacts with:** Imports/links: react, ../context/useBrain.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/MobileLookChart.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 107 lines; export const MobileLookChart.
- **What it interacts with:** Imports/links: react, recharts.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/NativeUIKit.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 2072 lines; export const BoxSystemDemo; export const ButtonsDemo; export const ChipsDemo; export const TogglesDemo.
- **What it interacts with:** Imports/links: react, ./StandardButton, ./StandardInput, ./StandardDropdown, ./StandardKPI.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/NexusCommander.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 98 lines; export const NexusCommander.
- **What it interacts with:** Imports/links: react, ../context/useBrain, ./CustomIcon, lucide-react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/PostActionReflection.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 91 lines; export const PostActionReflection.
- **What it interacts with:** Imports/links: react, lucide-react, ../context/useBrain.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 12 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~12 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/PreLaunchPriming.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 255 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/gemini, ../types, lucide-react, ./Toolbox.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ProjectStudio.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 978 lines; export const ProjectStudio.
- **What it interacts with:** Imports/links: react, ../context/useBrain, ./CustomIcon, ./Toolbox, lucide-react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ReportViewer.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 259 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-markdown, ../types, lucide-react, ./ChartEngine.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ResearchLabCharts.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 319 lines; export const YouTubeVideoSearch; export const PerformanceTrendChart; export const EngagementMapChart; export const ValueMatrixChart.
- **What it interacts with:** Imports/links: react, recharts, lucide-react, ../services/analyticsContract, ../services/canonicalMetricResolver.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ShortsRetentionChart.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 31 lines; export interface ShortsRetentionData; export const ShortsRetentionChart.
- **What it interacts with:** Imports/links: react, recharts.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/Sidebar.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 195 lines; export const Sidebar.
- **What it interacts with:** Imports/links: react, ../context/useBrain, react-router-dom, ./SidebarChatbot, ./Icons.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** Consolidate with src/components/ui/Sidebar.tsx or rename by role.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/SidebarChatbot.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 179 lines; export const SidebarChatbot.
- **What it interacts with:** Imports/links: react, ../context/useBrain, ../services/gemini, lucide-react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/SimpleAnalyticsChart.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 221 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/analyticsContract, ../services/analyticsSelectors, ../services/analyticsRuntime, ../services/canonicalMetricResolver.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/SprocketHoles.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 44 lines; export const SprocketHoles.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/StableChartFrame.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 52 lines; export const StableChartFrame.
- **What it interacts with:** Imports/links: react, recharts.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/StandardButton.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 42 lines; export const StandardButton.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 5 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~5 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/StandardDropdown.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 26 lines; export const StandardDropdown.
- **What it interacts with:** Imports/links: react, ./ToolboxUISystem.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/StandardInput.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 31 lines; export const StandardInput.
- **What it interacts with:** Imports/links: react, ./ToolboxUISystem.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/StandardKPI.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 20 lines; export const StandardKPI.
- **What it interacts with:** Imports/links: react, ./ToolboxUISystem.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/SubToolboxChartModule.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 307 lines; export interface ModuleThemeTokens; export interface ControlBoxDropdownOption; export interface LegendSlotConfig; export interface SubToolboxStat.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/SubtoolboxComponentSet.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 197 lines; export const SubtoolboxActionControl; export const SubtoolboxToggleControl; export const SubtoolboxDropdownControl; export const SubtoolboxStatusStrip.
- **What it interacts with:** Imports/links: react, lucide-react, ./ToolboxUISystem.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/SyncButton.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 55 lines; export const SyncButton.
- **What it interacts with:** Imports/links: react, ../context/useBrain, ./StandardButton.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/SystemStatisticsSubToolbox.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 388 lines; export function SystemStatisticsSubToolbox.
- **What it interacts with:** Imports/links: react, lucide-react, ./Toolbox, ../services/dataCoverageInventory.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/Toolbox.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 579 lines; export const CONTROL_SHELL; export type ToolboxVariant; export type ToolboxIndicator; export const Toolbox.
- **What it interacts with:** Imports/links: react, ./CustomIcon, ../styles/toolboxPalette, ./ToolboxUISystem, lucide-react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 37 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~37 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/toolboxSystem.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 15 lines; export const toolboxSystem; export const toolboxActionButton.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ToolboxUISystem.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 5518 lines; export const CONTROL_SHELL; export const UI_CONSTANTS; export const hexToRgba; export const AnimatedToggleIcon.
- **What it interacts with:** Imports/links: react, ./StandardButton, ./StandardInput, ./StandardDropdown, ./StandardKPI.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 8 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~8 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Over-engineered/fragile due size and coupling.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ToolHeader.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 38 lines; export const ToolHeader.
- **What it interacts with:** Imports/links: react, lucide-react, ./BrainLinkRow, ./CustomIcon, ./Toolbox.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/types.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 52 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~52 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/ChannelTree.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 86 lines; export const ChannelTree.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/DailyStats.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 150 lines; export const DailyStats.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/FormField.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 99 lines; export const FormField.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/index.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 11 lines; No named exports detected.
- **What it interacts with:** Imports/links: ./StyleChip, ./Toggle, ./FormField, ./KPIStatCard, ./DailyStats.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/KPIStatCard.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 94 lines; export const KPIStatCard; export const KPIStatRow.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/Modal.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 126 lines; export const Modal.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/Sidebar.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 131 lines; export const Sidebar.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/StyleChip.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 90 lines; export const StyleChip; export const StyleChipRow.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/Toggle.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 185 lines; export const Toggle; export const Checkbox; export const Radio.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/Tooltip.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 99 lines; export const Tooltip; export const TooltipSimple.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/ui/VideoCard.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 154 lines; export const VideoCard; export const VideoCardGrid.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/UIReferenceLibraryContent.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 3205 lines; export const UIReferenceLibraryContent.
- **What it interacts with:** Imports/links: react, ../components/CustomIcon, ./Toolbox, ../components/ErrorBoundary, ../components/NativeUIKit.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/UnifiedChartModule.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 202 lines; export interface ModuleStatItem; export interface ModuleKeyItem; export interface ModuleMetricBadge; export interface ModuleActiveVideo.
- **What it interacts with:** Imports/links: react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/UnifiedDashboardData.ts
- **What it is:** TypeScript logic module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 27 lines; export interface ShortsRetentionData; export interface EngagementData; export const MOCK_SHORTS_DATA; export const MOCK_ENGAGEMENT_DATA.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/UniversalDataTable.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 432 lines; export interface DataRecord; export const UniversalDataTable.
- **What it interacts with:** Imports/links: react, lucide-react, ../services/dataExport.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/components/VTLottie.tsx
- **What it is:** React/TSX module in Component System.
- **What it does:** Implements reusable UI behavior/presentation.
- **What it contains:** 102 lines; export const VTLottie.
- **What it interacts with:** Imports/links: react, lottie-react.
- **System membership:** Component System.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Misc

:::sub src/content/userGuideContent.ts
- **What it is:** TypeScript logic module in Misc.
- **What it does:** Supports app composition.
- **What it contains:** 492 lines; export type GuideToolEntry; export type GuideSection; export const GUIDE_PROTOCOL_VERSION; export const GUIDE_LAST_UPDATED.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Misc.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### State/Context

:::sub src/context/GlobalDataContext.tsx
- **What it is:** React/TSX module in State/Context.
- **What it does:** Implements shared state orchestration.
- **What it contains:** 716 lines; export const GlobalDataContext; export const fallbackContext; export const GlobalDataProvider.
- **What it interacts with:** Imports/links: react, react, ../types, ../services/authSession, ../services/localDataReset.
- **System membership:** State/Context.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/context/useBrain.ts
- **What it is:** TypeScript logic module in State/Context.
- **What it does:** Implements shared state orchestration.
- **What it contains:** 19 lines; export const useBrain.
- **What it interacts with:** Imports/links: react, ./GlobalDataContext.
- **System membership:** State/Context.
- **Current implementation:** File-local implementation with 39 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~39 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Data Catalogs

:::sub src/data/ApiStatisticsCatalog.ts
- **What it is:** TypeScript logic module in Data Catalogs.
- **What it does:** Supports app composition.
- **What it contains:** 256 lines; export interface ApiStatistic; export const API_STATISTICS_CATALOG.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Data Catalogs.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/data/extracted_metrics.json
- **What it is:** JSON data/config in Data Catalogs.
- **What it does:** Supports app composition.
- **What it contains:** 998 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Data Catalogs.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/data/liveCanvasRegistry.tsx
- **What it is:** React/TSX module in Data Catalogs.
- **What it does:** Supports app composition.
- **What it contains:** 123 lines; export const getLiveCanvasSpec; export const getLiveCanvasOptions.
- **What it interacts with:** Imports/links: react, ../components/Toolbox, ../components/ToolHeader, ../components/MobileLookChart, ../components/SprocketHoles.
- **System membership:** Data Catalogs.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/data/referenceStudioImports.ts
- **What it is:** TypeScript logic module in Data Catalogs.
- **What it does:** Supports app composition.
- **What it contains:** 74 lines; export interface ReferenceStudioImportPack; export interface CurationPick; export interface ToolboxCoverageItem; export const referenceStudioImportPacks.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Data Catalogs.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### VT_E1 Editor Core

:::sub src/editor-core/__tests__/exportEngine.test.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 33 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../index.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/__tests__/featureOriginCompliance.test.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 52 lines; No named exports detected.
- **What it interacts with:** Imports/links: node:fs, node:path, vitest.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/__tests__/keyframeInterpolation.test.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 34 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../keyframes/interpolation.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/__tests__/remotionBridge.test.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 83 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../index.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/__tests__/timelineReducer.test.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 91 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../timeline/reducer.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/__tests__/timelineToComposition.test.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 69 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../compiler/timelineToComposition, ../timeline/reducer.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/ai/patchEngine.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 89 lines; export const validateAIPatchPlan; export const applyAIPatchPlan.
- **What it interacts with:** Imports/links: ../contracts, ../schemas, ../timeline/reducer.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/compiler/timelineToComposition.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 73 lines; export interface CompositionSequenceSpec; export interface CompositionSpec; export const timelineToComposition.
- **What it interacts with:** Imports/links: ../contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/contracts.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 412 lines; export type TrackKind; export type TrackViewportState; export type EasingType; export interface EditorTrack.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 13 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~13 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/export/editorProjectV3.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 208 lines; export const buildResolvedCompositionMeta; export const createPropsResolutionTrace; export const createEditorProjectV3; export const validateEditorProjectV3.
- **What it interacts with:** Imports/links: ../contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/export/exportEngine.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 149 lines; export const createExportArtifact; export const createExportJob; export const completeExportJob; export const buildProjectJson.
- **What it interacts with:** Imports/links: ../contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/export/remotionBridge.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 282 lines; export interface RemotionBridgeCompositionSpecV2; export interface RenderValidationResultV2; export interface FrameAuditManifestV1; export interface RemotionBridgeJobV2.
- **What it interacts with:** Imports/links: ../contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/export/renderJobs.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 217 lines; export const createRenderJobRequest; export const enqueueRemotionRenderJob; export const pollRemotionRenderJob.
- **What it interacts with:** Imports/links: ../contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/featureRegistry.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 53 lines; export const FEATURE_REGISTRY.
- **What it interacts with:** Imports/links: ./contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/index.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 13 lines; No named exports detected.
- **What it interacts with:** Imports/links: ./contracts, ./schemas, ./featureRegistry, ./timeline/snap, ./timeline/reducer.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/keyframes/interpolation.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 77 lines; export const interpolateKeyframes.
- **What it interacts with:** Imports/links: ../contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/media/mediaImport.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 109 lines; export const validateImportRequest; export const createMediaAssetFromFile; export const createMediaAssetFromUrl; export const sanitizeSvg.
- **What it interacts with:** Imports/links: ../contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/schemas.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 122 lines; export const KeyframeValueSchema; export const EditorClipSchema; export const EditorTransitionSchema; export const EditorKeyframeSchema.
- **What it interacts with:** Imports/links: zod.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/timeline/reducer.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 480 lines; export const createTimelineState; export const applyTimelineCommand; export const getAdjacentClipOnTrack.
- **What it interacts with:** Imports/links: ../contracts, ./snap.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-core/timeline/snap.ts
- **What it is:** TypeScript logic module in VT_E1 Editor Core.
- **What it does:** Implements VT_E1 timeline/export/render contracts.
- **What it contains:** 45 lines; export interface SnapInput; export const collectSnapPoints; export const snapFrame.
- **What it interacts with:** Imports/links: ../contracts.
- **System membership:** VT_E1 Editor Core.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Modern modular baseline.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Editor UI Surface

:::sub src/editor-ui/IntegratedRemotionEditor.tsx
- **What it is:** React/TSX module in Editor UI Surface.
- **What it does:** Supports app composition.
- **What it contains:** 1066 lines; export const IntegratedRemotionEditor.
- **What it interacts with:** Imports/links: react, ../context/useBrain, ../services/gemini, ../editor-core, ../services/remotionParity.
- **System membership:** Editor UI Surface.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/editor-ui/LaunchEditor.tsx
- **What it is:** React/TSX module in Editor UI Surface.
- **What it does:** Supports app composition.
- **What it contains:** 809 lines; export const LaunchEditor.
- **What it interacts with:** Imports/links: react, ../editor-core, ../services/oracle, ../services/oracle.
- **System membership:** Editor UI Surface.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Generated Manifests

:::sub src/generated/analytics-data-path-inventory.json
- **What it is:** JSON data/config in Generated Manifests.
- **What it does:** Supports app composition.
- **What it contains:** 174 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Generated Manifests.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Used for inventory/contract support; regenerate from scripts when drifted.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Generated support artifact.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/generated/api-capability-registry.json
- **What it is:** JSON data/config in Generated Manifests.
- **What it does:** Supports app composition.
- **What it contains:** 95 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Generated Manifests.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Used for inventory/contract support; regenerate from scripts when drifted.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Generated support artifact.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/generated/chart-inventory.csv
- **What it is:** .csv file in Generated Manifests.
- **What it does:** Supports app composition.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Generated Manifests.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Used for inventory/contract support; regenerate from scripts when drifted.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Generated support artifact.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/generated/chart-inventory.json
- **What it is:** JSON data/config in Generated Manifests.
- **What it does:** Supports app composition.
- **What it contains:** 3127 lines; export type UnifiedChartId; export interface ChartConfig; export const BarChartDemo; export interface ChartDefinition.
- **What it interacts with:** Imports/links: ../types, lucide-react, ./IntelligenceChart, ../types, ../components/MobileLookChart.
- **System membership:** Generated Manifests.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Used for inventory/contract support; regenerate from scripts when drifted.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Generated support artifact.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Misc

:::sub src/index.css
- **What it is:** Stylesheet in Misc.
- **What it does:** Supports app composition.
- **What it contains:** 42 lines; No named exports detected.
- **What it interacts with:** Imports/links: tailwindcss.
- **System membership:** Misc.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/main.tsx
- **What it is:** React/TSX module in Misc.
- **What it does:** Supports app composition.
- **What it contains:** 11 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-dom/client, ./index.css, ./App.tsx.
- **System membership:** Misc.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Application Services

:::sub src/services/__tests__/analyticsCapabilityMatrix.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 101 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../analyticsCapabilityMatrix.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/__tests__/apiCapabilityRegistry.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 46 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../youtube/apiCapabilityRegistry.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/__tests__/billingEntitlement.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 150 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../billingEntitlement.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/__tests__/googleService.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 45 lines; No named exports detected.
- **What it interacts with:** Imports/links: ../googleService, ../authSession, vitest.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/__tests__/oracleSystem.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 126 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../oracle/agents, ../oracle/prompts, ../oracle/registry, ../oracle/runtime.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/__tests__/unifiedSourceOfTruth.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 141 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../analyticsContract, ../unifiedSourceOfTruth.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/__tests__/videoStatsVerification.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 110 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../analyticsContract, ../analyticsSelectors, ../../views/performanceHubUtils.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/__tests__/youtubeAnalyticsFetcher.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 62 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../youtube/youtubeAnalyticsFetcher.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/aiTokenCosts.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 16 lines; export const AI_TOKEN_COSTS; export type AiTokenCostKey; export const getAiTokenCost.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/analyticsCapabilityMatrix.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 252 lines; export type CapabilityScope; export type SourceCapability; export type CapabilityRow; export type MissingMetricBacklogItem.
- **What it interacts with:** Imports/links: ./analyticsContract, ./dataCoverageCatalog, ./productArchitecture.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/analyticsContract.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 1332 lines; export type AnalyticsWindow; export const ANALYTICS_WINDOWS; export type MetricStatus; export type MetricSource.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 29 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~29 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/analyticsRuntime.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 142 lines; export type SyncSourceMode; export type StorageMode; export interface EffectiveAnalyticsRows; export interface RowFilterState.
- **What it interacts with:** Imports/links: ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 7 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~7 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/analyticsSelectors.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 1469 lines; export type AnalyticsSourceMode; export interface MetricSummary; export interface MetricAvailability; export type VideoStatsVerificationSummary.
- **What it interacts with:** Imports/links: ../types, ./dataNormalization, ./analyticsContract, ./canonicalAnalyticsStore, ./DataEngine.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 24 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~24 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/audioProviderAdapter.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 47 lines; export type SpeechProvider; export interface AudioProviderStatus; export interface SpeechRequest; export const getAudioProviderStatus.
- **What it interacts with:** Imports/links: ./keyVault, ./elevenLabsService, ./auphonicService, ./gemini.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/auphonicService.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 60 lines; export const auphonicService.
- **What it interacts with:** Imports/links: ./keyVault.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/authSession.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 307 lines; export interface AuthSessionMeta; export interface UnifiedAuthContract; export function generateRandomString; export const loginWithImplicitPopup.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 10 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~10 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/billingEntitlement.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 61 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ./billingEntitlement, ./billingEntitlement.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/billingEntitlement.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 862 lines; export type LaunchTier; export type CreditLedgerEntryType; export interface PlanDefinition; export interface TopupDefinition.
- **What it interacts with:** Imports/links: ./subscriptionPlans.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 14 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~14 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/brainEngine.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 161 lines; export const getBrainMemory; export const initializeBrain; export const saveBrainMemory; export const emitSignal.
- **What it interacts with:** Imports/links: ../types, ./gemini, ./brainPersistence.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/brainPersistence.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 81 lines; export const initDB; export const getBrainSchemaDB; export const saveBrainSchemaDB; export const getBrainSignalsDB.
- **What it interacts with:** Imports/links: ../types.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/brainUtils.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 30 lines; export const consultBrainSync; export const annotateSystemPrompt.
- **What it interacts with:** Imports/links: ../types, ./brainEngine.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/canonicalAnalyticsStore.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 219 lines; export type CanonicalMetricAvailability; export interface CanonicalMetricValue; export interface MetricCapability; export interface CanonicalDatasetWindow.
- **What it interacts with:** Imports/links: ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 7 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~7 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/canonicalMetricResolver.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 96 lines; export type CoverageRowStatus; export interface ResolvedMetricValue; export const resolveMetricNumber.
- **What it interacts with:** Imports/links: ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 5 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~5 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/canonicalStatsEngine.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 294 lines; export type CanonicalStatAvailability; export type CanonicalStatConfidence; export interface CanonicalStatCell; export type CanonicalStatKey.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/channelOracle.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 94 lines; export const CHANNEL_ORACLE_PROMPT_VERSION; export const buildChannelOracleInput; export const buildChannelOracleSystemPrompt.
- **What it interacts with:** Imports/links: ../types, ./prompts.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/CollabEngine.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 101 lines; export interface CollabPeer; export const generateCollabOpportunities.
- **What it interacts with:** Imports/links: ./gemini, @google/genai.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/csvImportUtils.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 352 lines; export type CsvExportKind; export const extractDateRangeFromName; export const parseCSV; export const inferAnalyticsWindowFromName.
- **What it interacts with:** Imports/links: jszip, ../types, ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/dataCoverageCatalog.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 210 lines; export interface DataCoverageCatalogEntry; export const DATA_COVERAGE_CATALOG.
- **What it interacts with:** Imports/links: ./dataCoverageInventory.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/dataCoverageInventory.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 81 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ./dataCoverageInventory.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/dataCoverageInventory.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 1149 lines; export type DataCoverageSource; export type DataCoverageScope; export type DataCoverageStatus; export interface DataCoverageRow.
- **What it interacts with:** Imports/links: ./analyticsContract, ./dataCoverageCatalog, ./canonicalAnalyticsStore.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/DataEngine.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 947 lines; export type DataForgeRow; export interface DataForgeIngestResult; export const parseCSV; export const extractDateRangeFromName.
- **What it interacts with:** Imports/links: jszip, ../types, ./dataNormalization, ./dataUtils, ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/dataExport.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 193 lines; export interface ExportManifest; export const rowsToCsv; export const createExportBundle; export const downloadExportBundle.
- **What it interacts with:** Imports/links: jszip, ./masterTables, ./analyticsSelectors, ./analyticsContract, ./productArchitecture.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/dataNormalization.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 96 lines; export const HEADER_MAP; export const normalizeRow; export const getStandardKey; export const METRIC_COLORS.
- **What it interacts with:** Imports/links: ./dataUtils, ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/dataUtils.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 45 lines; export const toNumber; export const toText; export const hasValue; export const parseDurationSeconds.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/editorEngine.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 258 lines; export type EditorTrackId; export interface EditorTrack; export interface KeyframePoint; export interface EditorTimelineClip.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/elevenLabsService.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 56 lines; export const elevenLabsService.
- **What it interacts with:** Imports/links: ./keyVault.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/externalIngestSources.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 59 lines; export interface ExternalIngestSource; export const EXTERNAL_INGEST_SOURCES; export const getEnabledIngestSources.
- **What it interacts with:** Imports/links: ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/formulaRegistry.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 262 lines; export interface FormulaSpec; export interface FormulaValidationResult; export interface FormulaEvaluationResult; export const FORMULA_REGISTRY.
- **What it interacts with:** Imports/links: ./productArchitecture.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/ga4Service.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 366 lines; export interface GA4Property; export interface GA4ReportRequest; export interface GA4ReportResponse; export const ga4Service.
- **What it interacts with:** Imports/links: ./authSession.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/ga4Sync.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 268 lines; export const ga4Sync; export const initGA4Sync; export const connectGA4; export const syncGA4Data.
- **What it interacts with:** Imports/links: ./SyncCoordinator, ./ga4Service, ./DataEngine.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/gemini.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 3584 lines; export const TACTICS_SYSTEM_INSTRUCTIONS; export interface AIPatchPlan; export interface OracleState; export const fetchViralTrends.
- **What it interacts with:** Imports/links: @google/genai, @/types, @/types, @/services/prompts, ../utils/RequestQueue.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 32 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~32 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/googleService.test.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 14 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ./googleService.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/googleService.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 92 lines; export class GoogleService; export const googleService.
- **What it interacts with:** Imports/links: ./authSession.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 5 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~5 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/keyVault.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 68 lines; export type VaultKeyName; export interface VaultSnapshot; export const getVaultKey; export const setVaultKey.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 5 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~5 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/localDataInspector.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 218 lines; export type LocalDataCategory; export type LocalDataEntry; export const readLocalData; export const listLocalDataEntries.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/localDataReset.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 126 lines; export const LOCAL_DATA_CHANGED_EVENT; export const clearCachedDataSoft; export const clearAnalyticsStateForFreshSync; export const factoryResetAll.
- **What it interacts with:** Imports/links: ./authSession.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/masterTables.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 348 lines; export const buildMasterTableBundle.
- **What it interacts with:** Imports/links: ./analyticsContract, ./analyticsSelectors, ./dataCoverageInventory, ./canonicalAnalyticsStore, ./productArchitecture.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/metricAliasResolver.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 73 lines; export type MetricConfidence; export const getViewsRaw; export const getImpressionsRaw; export const getCtrRawPercent.
- **What it interacts with:** Imports/links: ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/namingGovernance.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 78 lines; export interface CanonicalNamingEntry; export const DEFAULT_NAMING_TABLE; export const toCanonicalKey; export const resolveDisplayName.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/nexusSyncService.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 93 lines; export const nexusSyncService.
- **What it interacts with:** Imports/links: ./googleService, ../types.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Oracle/Agent Runtime

:::sub src/services/oracle/agents.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 71 lines; export const ORACLE_AGENT_PROFILES; export const getOracleAgentProfile.
- **What it interacts with:** Imports/links: ./types.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/index.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 10 lines; No named exports detected.
- **What it interacts with:** Imports/links: ./types, ./agents, ./tools, ./quality, ./prompts.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/markdown.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 81 lines; export interface GeneratedSkillDoc; export const generateSkillDocMarkdown; export const generateOraclePlaybookMarkdown.
- **What it interacts with:** Imports/links: ./registry, ./agents, ./tools.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 9 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~9 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/oracle-skill-registry.v1.json
- **What it is:** JSON data/config in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 78 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/oracle-skill-registry.v1.yaml
- **What it is:** .yaml file in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/oracleJobEngine.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 170 lines; export interface OracleSafePatch; export interface OracleSuggestionResult; export interface ManualOracleRequest; export interface ManualOracleResult.
- **What it interacts with:** Imports/links: ./agents, ./prompts, ./runtime, ./types.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/prompts.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 137 lines; export interface PromptBuildInput; export const ORACLE_PROMPT_TEMPLATES; export const buildOraclePrompt.
- **What it interacts with:** Imports/links: ./types.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/quality.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 86 lines; export interface QualitySignalInput; export interface QualityScoreResult; export const DEFAULT_CREATIVE_RUBRIC; export const scoreCreativeQuality.
- **What it interacts with:** Imports/links: ./types.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/registry.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 103 lines; export const ORACLE_SKILL_SPECS; export const buildOracleSystemBundle.
- **What it interacts with:** Imports/links: ./agents, ./prompts, ./quality, ./tools, ./types.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/runtime.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 117 lines; export interface OracleQueueRuntime; export const createOracleQueueRuntime; export const suggestMaterializationMode; export const buildSuggestionCard.
- **What it interacts with:** Imports/links: ./agents, ./quality, ./types.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/tools.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 87 lines; export const ORACLE_TOOL_CONTRACTS; export const getToolContract; export const validateToolPermission.
- **What it interacts with:** Imports/links: ./types.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/oracle/types.ts
- **What it is:** TypeScript logic module in Oracle/Agent Runtime.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 171 lines; export type OracleSurface; export type MaterializationMode; export type OracleJobStatus; export type OracleToolCategory.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Oracle/Agent Runtime.
- **Current implementation:** File-local implementation with 52 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~52 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Application Services

:::sub src/services/productArchitecture.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 153 lines; export type MasterTableType; export type IngestMode; export type MetricAccuracyClass; export type CoverageStatus.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 8 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~8 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/prompts.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 707 lines; export const SCULPTING_ENGINE_SYSTEM_PROMPT; export const DATA_ANALYSIS_SYSTEM_PROMPT; export const CHANNEL_ORACLE_PROMPT_VERSION; export const DATA_HANDLING_INSTRUCTIONS.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/publicHandleMode.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 237 lines; export interface PublicChannelResolution; export interface PublicChannelSnapshot; export const resolvePublicChannel; export const fetchPublicChannelSnapshot.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/remotionParity.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 90 lines; export interface RemotionParityDrift; export interface RemotionParityReport; export const buildRemotionParityReport.
- **What it interacts with:** Imports/links: ../editor-core/compiler/timelineToComposition, ../editor-core/contracts.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/sheetsService.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 98 lines; export const sheetsService.
- **What it interacts with:** Imports/links: ./authSession.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/stripeRegistry.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 26 lines; export const STRIPE_CONFIG; export type PlanKey.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/subscriptionPlans.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 153 lines; export type SubscriptionPlanId; export interface SubscriptionPlanCapabilityMatrix; export const SUBSCRIPTION_PLANS; export const getSubscriptionPlan.
- **What it interacts with:** Imports/links: ./productArchitecture.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/SyncCoordinator.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 1058 lines; export interface GA4AnalyticsData; export interface GA4SyncState; export class SyncCoordinator; export const syncCoordinator.
- **What it interacts with:** Imports/links: ./youtubeService, ./ga4Service, ./canonicalAnalyticsStore, ./dataUtils, ../utils/RequestQueue.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/timelineToRemotionCompiler.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 144 lines; export interface RemotionBindingConfig; export interface RemotionSequenceSpec; export interface RemotionCompositionSpec; export interface TimelineToRemotionCompiler.
- **What it interacts with:** Imports/links: ./editorEngine.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/unifiedSourceOfTruth.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 321 lines; export type AvailabilityClass; export type VerificationStatus; export interface CanonicalFactRow; export interface CanonicalConflictRow.
- **What it interacts with:** Imports/links: ./analyticsContract.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### YouTube Data/Sync

:::sub src/services/youtube/apiCapabilityRegistry.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 202 lines; export type ApiFamily; export type AccountContext; export type AdapterOutcome; export type RequestValidationResult.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtube/youtubeAnalyticsAdapter.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 94 lines; export type AnalyticsAdapterResult; export const youtubeAnalyticsAdapter.
- **What it interacts with:** Imports/links: ./youtubeAnalyticsFetcher, ./apiCapabilityRegistry.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtube/youtubeAnalyticsFetcher.test.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 27 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ./youtubeAnalyticsFetcher.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtube/youtubeAnalyticsFetcher.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 1684 lines; export type AnalyticsMetricGroupName; export type AnalyticsGroupFetchResult; export type VideoContentTypeSyncStatus; export type VideoContentTypeFetchResult.
- **What it interacts with:** Imports/links: ./youtubeApiClient, ../authSession, ../analyticsContract, ../productArchitecture.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 5 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~5 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtube/youtubeApiClient.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 274 lines; export const BASE_URL; export const ANALYTICS_URL; export class YouTubeApiError; export const handleYouTubeApiError.
- **What it interacts with:** Imports/links: ../authSession, ../localDataReset, ../googleService.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtube/youtubeDataAdapter.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 113 lines; export type DataAdapterResult; export const youtubeDataAdapter.
- **What it interacts with:** Imports/links: ./youtubeDataFetcher, ./apiCapabilityRegistry.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtube/youtubeDataFetcher.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 1021 lines; export const fetchChannelProfile; export const fetchVideoList; export const fetchVideoStats; export const fetchVideoSnippetDetails.
- **What it interacts with:** Imports/links: ./youtubeApiClient, ../dataUtils, ../canonicalAnalyticsStore.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtube/youtubeReportingAdapter.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 82 lines; export type ReportingAdapterResult; export const youtubeReportingAdapter.
- **What it interacts with:** Imports/links: ./youtubeAnalyticsFetcher, ./apiCapabilityRegistry.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtube/youtubeUploadService.ts
- **What it is:** TypeScript logic module in YouTube Data/Sync.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 92 lines; export interface UploadMetadata; export class YouTubeUploadService.
- **What it interacts with:** Imports/links: ../authSession.
- **System membership:** YouTube Data/Sync.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Application Services

:::sub src/services/youtubeDataFetcher.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 105 lines; No named exports detected.
- **What it interacts with:** Imports/links: ../types.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** Merge responsibilities with src/services/youtube/youtubeDataFetcher.ts.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/services/youtubeService.ts
- **What it is:** TypeScript logic module in Application Services.
- **What it does:** Implements data, business logic, or external API bridge.
- **What it contains:** 92 lines; export const youtubeService.
- **What it interacts with:** Imports/links: ./youtube/youtubeApiClient, ./youtube/youtubeDataFetcher, ./youtube/youtubeAnalyticsFetcher, ./youtube/youtubeApiClient, ./youtube/youtubeDataFetcher.
- **System membership:** Application Services.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Indirect: powers UI data/actions but not directly rendered
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed maturity; partially modern but inconsistent contracts.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Design Tokens

:::sub src/styles/toolboxPalette.ts
- **What it is:** TypeScript logic module in Design Tokens.
- **What it does:** Supports app composition.
- **What it contains:** 23 lines; export const TOOLBOX_PALETTE; export const getPaletteColor; export const getToolboxPaletteColors.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Design Tokens.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Misc

:::sub src/types.ts
- **What it is:** TypeScript logic module in Misc.
- **What it does:** Supports app composition.
- **What it contains:** 567 lines; export interface RetentionDataPoint; export interface VideoRetentionCache; export type AppTool; export interface DayTask.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Misc.
- **Current implementation:** File-local implementation with 52 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~52 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### Utilities

:::sub src/utils/arrayUtils.test.ts
- **What it is:** TypeScript logic module in Utilities.
- **What it does:** Supports app composition.
- **What it contains:** 7 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ./arrayUtils.
- **System membership:** Utilities.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/utils/arrayUtils.ts
- **What it is:** TypeScript logic module in Utilities.
- **What it does:** Supports app composition.
- **What it contains:** 8 lines; export function chunkArray.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Utilities.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/utils/RequestQueue.ts
- **What it is:** TypeScript logic module in Utilities.
- **What it does:** Supports app composition.
- **What it contains:** 79 lines; export interface QueueOptions; export class RequestQueue; export const ytApiQueue; export const geminiQueue.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Utilities.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

### View Layer

:::sub src/views/ActionableTactics.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 350 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, react-markdown, ../services/gemini, ../types.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/AlgorithmArchitect.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 346 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/gemini, ../types, lucide-react, ../context/useBrain.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/AllLinksPage.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 82 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/bench/AnalyticsHubBench.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 86 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ../referenceStudio/useCanonicalAnalytics, ../referenceStudio/chartSystem, ../../components/Toolbox.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/bench/BenchExplorer.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 96 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, lucide-react, ./benchRegistry.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/bench/benchRegistry.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 135 lines; export type BenchTag; export interface BenchEntry; export const BENCH_REGISTRY.
- **What it interacts with:** Imports/links: react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/bench/StandaloneBench.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 36 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, ./benchRegistry.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/Channelytics.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 535 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ../context/useBrain, ../services/gemini, ../types.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ChartsGallery/ChartsGalleryHome.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 257 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ChartsGallery/MasterGraphsPage.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 587 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, lucide-react, recharts, ../../services/analyticsSelectors.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ChartsGallery/ToolboxPreviewPage.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 257 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, lucide-react, ../../context/useBrain, ../../types.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ComponentCatalogView.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 24 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ./referenceStudio/ComponentCatalog.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ComponentGridView.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 22 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../components/ToolboxUISystem.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/Dashboard.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 4 lines; No named exports detected.
- **What it interacts with:** Imports/links: ./dashboard/DashboardRebuild.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 10 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~10 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/DashboardBarrier.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 23 lines; export const DashboardBarrier.
- **What it interacts with:** Imports/links: react, ./toolboxWidgetSystem.css.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/DashboardCanvas.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 336 lines; export const DashboardCanvas.
- **What it interacts with:** Imports/links: react, @dnd-kit/core, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/DashboardHeader.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 299 lines; export const DashboardHeader.
- **What it interacts with:** Imports/links: react, lucide-react, react-router-dom, ./useDashboardData, ../../app/AppShell.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/DashboardRebuild.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 14 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, ./DashboardCanvas, ./useDashboardData.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/storage.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 195 lines; export const buildDefaultDashboardLayout; export const normalizeDashboardLayout; export const loadDashboardLayout; export const saveDashboardLayout.
- **What it interacts with:** Imports/links: ./tokens, ./WidgetRegistry, ./types.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/tokens.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 20 lines; export const DASHBOARD_SCHEMA_VERSION; export const DASHBOARD_LAYOUT_STORAGE_KEY; export const DASHBOARD_TOKENS; export const SIZE_BUCKET_ORDER.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/toolboxWidgetSystem.css
- **What it is:** Stylesheet in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 637 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/types.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 75 lines; export type DashboardSizeBucket; export type DashboardHeightBucket; export type DashboardWidgetCategory; export type WidgetDependency.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 52 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~52 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/useDashboardData.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 229 lines; export const useDashboardData; export type DashboardData.
- **What it interacts with:** Imports/links: react, ../../context/useBrain, ../../services/analyticsSelectors.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/useVideoComments.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 33 lines; export interface VideoComment; export const useVideoComments.
- **What it interacts with:** Imports/links: react, ../../services/youtubeService.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/WidgetPickerPanel.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 63 lines; export const WidgetPickerPanel.
- **What it interacts with:** Imports/links: react, lucide-react, ./types.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/WidgetRegistry.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 767 lines; export const DASHBOARD_WIDGET_REGISTRY; export const DEFAULT_DASHBOARD_WIDGET_ORDER; export const DASHBOARD_WIDGET_BY_ID.
- **What it interacts with:** Imports/links: ./types.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/WidgetRenderer.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 1314 lines; export const WidgetRenderer.
- **What it interacts with:** Imports/links: react, lucide-react, ./useVideoComments, ./useDashboardData, ./types.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/__tests__/keywordOverlap.test.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 93 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../keywordOverlap.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/ABThumbnailWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 111 lines; export const ABThumbnailWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/AdStackWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 71 lines; export const AdStackWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/AIJournalWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 234 lines; export const AIJournalWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react, ../../../context/useBrain, ../../../services/gemini.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/AlgoBenchmarkWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 62 lines; export const AlgoBenchmarkWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/AskMeWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 255 lines; export const AskMeWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, ../../../app/AppShell, lucide-react, ../../../services/billingEntitlement.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/AudienceMatrixWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 141 lines; export const AudienceMatrixWidget.
- **What it interacts with:** Imports/links: react, lucide-react, ../WidgetShell.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/AudienceRetentionWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 110 lines; export const AudienceRetentionWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/BrainHubWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 221 lines; export const BrainHubWidget.
- **What it interacts with:** Imports/links: react, lucide-react, ../WidgetShell, ../types, ../useDashboardData.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/BridgeEfficiencyWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 138 lines; export const BridgeEfficiencyWidget.
- **What it interacts with:** Imports/links: react, lucide-react, ../WidgetShell, recharts, ../../../components/StableChartFrame.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/BurnoutMonitorWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 160 lines; export const BurnoutMonitorWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/CollabMatchmakerWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 233 lines; export const CollabMatchmakerWidget.
- **What it interacts with:** Imports/links: react, lucide-react, ../WidgetShell, ../../../services/CollabEngine, ../../../services/gemini.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/CommentReplyWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 396 lines; export const CommentReplyWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, ../../../app/AppShell, lucide-react, ../../../services/youtube/youtubeDataFetcher.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/CommunityPostWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 301 lines; export const CommunityPostWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react, ../../../components/VTLottie, ../../../services/gemini.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/CpmGeoWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 39 lines; export const CpmGeoWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/DailyOracleWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 237 lines; export const DailyOracleWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, ../../../app/AppShell, lucide-react, ../../../context/useBrain.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/DataEditWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 564 lines; export const CustomDropdown; export const DataEditWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react, ../../../services/youtube/youtubeDataFetcher.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/DescriptionEditorWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 83 lines; export const DescriptionEditorWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/DeviceMatrixWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 55 lines; export const DeviceMatrixWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/FlightCheckWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 106 lines; export const FlightCheckWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/FormatClashWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 125 lines; export const FormatClashWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react, ../../../services/analyticsSelectors.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/GoalsTrackerWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 300 lines; export const GoalsTrackerWidget.
- **What it interacts with:** Imports/links: react, lucide-react, ../WidgetShell, ../useDashboardData.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/GuestRatioWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 38 lines; export const GuestRatioWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/HashtagAnalyzerWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 144 lines; export const HashtagAnalyzerWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, ../../../app/AppShell, lucide-react, ../../../services/billingEntitlement.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/KeywordEngineWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 193 lines; export const KeywordEngineWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react, ../../../services/analyticsSelectors.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/keywordOverlap.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 272 lines; export type KeywordMetricMode; export interface KeywordNode; export interface KeywordSelectionSummary; export interface KeywordConstellationDataset.
- **What it interacts with:** Imports/links: ../../../services/analyticsSelectors.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/KeywordOverlapWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 326 lines; export const KeywordOverlapWidget.
- **What it interacts with:** Imports/links: react, lucide-react, ../WidgetShell, ./keywordOverlap.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/PlaybackOriginsWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 56 lines; export const PlaybackOriginsWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/PremiumPulseWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 51 lines; export const PremiumPulseWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/PublishMomentumWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 226 lines; export const PublishMomentumWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react, ../../../services/analyticsSelectors.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/ReachFunnelWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 62 lines; export const ReachFunnelWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/RealtimePerformanceWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 244 lines; export const RealtimePerformanceWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/RetentionSimWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 191 lines; export const RetentionSimWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react, ./DataEditWidget.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/RevenueChartWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 303 lines; export const RevenueChartWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/SharingDnaWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 56 lines; export const SharingDnaWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/TagGeneratorWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 387 lines; export const TagGeneratorWidget.
- **What it interacts with:** Imports/links: react, ../../../context/useBrain, ../WidgetShell, ../../../app/AppShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/ThumbAIWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 187 lines; export const ThumbAIWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/ThumbnailLabWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 310 lines; export const ThumbnailLabWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, ../../../app/AppShell, lucide-react, ../../../services/billingEntitlement.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/TitleRewriterWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 161 lines; export const TitleRewriterWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, ../../../app/AppShell, lucide-react, ../../../context/useBrain.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/TrafficSourcesWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 167 lines; export const TrafficSourcesWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/widgets/UploadSchedulerWidget.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 463 lines; export const UploadSchedulerWidget.
- **What it interacts with:** Imports/links: react, ../WidgetShell, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/dashboard/WidgetShell.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 349 lines; export const WidgetShell.
- **What it interacts with:** Imports/links: react, lucide-react, ../../components/VTLottie, ./types.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 40 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~40 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/DashboardLegacy.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 416 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, ../context/useBrain, ../components/CustomIcon, ../components/DailyAdviceWidget.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/DataTransparencyCenter.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 778 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ../components/Toolbox, ../services/masterTables, ../services/localDataInspector.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/DataVizualizations.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 291 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/analyticsSelectors, ../chartSystem/unifiedChartSpec.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/Dockerfile
- **What it is:** asset file in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/EditorPage.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 9 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../editor-ui/LaunchEditor.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/EditorV1LegacyPage.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 17 lines; No named exports detected.
- **What it interacts with:** Imports/links: react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/EditorV1Page.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 54 lines; No named exports detected.
- **What it interacts with:** Imports/links: react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/FourSectionsLabStandalone.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 189 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ./referenceStudio/sourceModules, ./referenceStudio/ReferenceStudioPrimitives.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/GraphsPage.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 113 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, ../services/analyticsSelectors, ../services/analyticsRuntime, ../services/analyticsContract.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/GraphsShortsRetentionPage.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 188 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, ../services/analyticsSelectors, ../services/analyticsRuntime, ../services/analyticsContract.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/HookGenerator.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 258 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/gemini, ../types, lucide-react, ../components/Toolbox.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/IntelligenceHub.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 187 lines; export const IntelligenceHub.
- **What it interacts with:** Imports/links: react, ../context/useBrain, ../services/brainEngine, ../components/Toolbox, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/InternalAnalyticsPanel.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 43 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../components/DataDashboard, ../components/SimpleAnalyticsChart, ../components/SystemStatisticsSubToolbox, ../services/analyticsSelectors.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/MediaAnalyzer.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 328 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../context/useBrain, ../services/gemini, ../types, recharts.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/PerformanceHub.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 4624 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, recharts, ../components/Toolbox, ../context/useBrain.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Over-engineered/fragile due size and coupling.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHub40/__tests__/capability.test.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 85 lines; No named exports detected.
- **What it interacts with:** Imports/links: vitest, ../capability, ../chartSpec40, ../../referenceStudio/useCanonicalAnalytics.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active test support.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHub40/adapter.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 57 lines; export const toChartCard40.
- **What it interacts with:** Imports/links: ../referenceStudio/chartSystem, ./chartSpec40.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHub40/capability.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 84 lines; export interface ChartCapabilityStatus40; export const evaluateChartCapability40.
- **What it interacts with:** Imports/links: ../referenceStudio/useCanonicalAnalytics, ./chartSpec40.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHub40/chartIntegration.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 103 lines; export type OnboardingStatus40; export interface PerformanceHubChartBinding40; export const buildChartBinding40.
- **What it interacts with:** Imports/links: ../../chartSystem/unifiedChartSpec, ./capability, ./chartSpec40, ./chartRegistry.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHub40/chartRegistry.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 68 lines; export type ChartLifecycleStage; export interface ChartRegistryEntry; export const CHART_REGISTRY_40; export const getChartLifecycleStage.
- **What it interacts with:** Imports/links: ./chartSpec40.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHub40/chartSpec40.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 99 lines; export type ChartPack40; export type MetricKey40; export type ChartReadiness40; export type ChartInsightType40.
- **What it interacts with:** Imports/links: ../referenceStudio/chartSystem.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 6 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~6 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHub40/PerformanceHubChartRollout.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 180 lines; export const PerformanceHubChartRollout.
- **What it interacts with:** Imports/links: react, lucide-react, ../referenceStudio/chartSystem, ../referenceStudio/useCanonicalAnalytics, ./adapter.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHub40/promotionAdapter.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 34 lines; export interface PromotionSnapshot; export const buildPromotionSnapshot.
- **What it interacts with:** Imports/links: ../referenceStudio/useCanonicalAnalytics.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/performanceHubUtils.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 679 lines; export type UnifiedRow; export type SourceSummary; export const numberFromUnknown; export const textFromUnknown.
- **What it interacts with:** Imports/links: ../types, ../services/DataEngine, ../services/metricAliasResolver, ../services/analyticsContract.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ProjectCalendarPage.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 15 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../components/ProjectStudio, ./StoryboardStudio.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ReferenceStudio.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 1378 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, ../services/gemini, ../types, ../context/useBrain.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 9 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~9 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/ChartCatalog.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 88 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ./ReferenceStudioPrimitives, ./useCanonicalAnalytics, ./chartSystem.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/ChartCatalogV2.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 96 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ../../components/Toolbox, ./useCanonicalAnalytics, ./chartSystem.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/ChartSpecImplementation.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 124 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ./ReferenceStudioPrimitives, ./useCanonicalAnalytics, ./chartSystem.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/ChartSpecImplementationV2.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 136 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ../../components/Toolbox, ./useCanonicalAnalytics, ./chartSystem.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/chartSystem.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 730 lines; export type ChartCardSize; export type ChartClassKey; export type ChartRendererKey; export interface ChartCardDefinition.
- **What it interacts with:** Imports/links: react, recharts, ./useCanonicalAnalytics, ../../components/StableChartFrame.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 14 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~14 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/ComponentCatalog.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 167 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ./ReferenceStudioPrimitives, ./sourceModules.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/ReferenceStudioPrimitives.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 254 lines; export const MainToolbox; export const SectionCard; export const PillList; export const SourceFrame.
- **What it interacts with:** Imports/links: react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 8 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~8 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/SectionSourcesLab.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 172 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ./ReferenceStudioPrimitives, ./sourceModules.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/sourceModules.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 1809 lines; export type SourceComponentId; export interface SourceInteractionContract; export interface SourceComponentModule; export interface SourceModuleCollection.
- **What it interacts with:** Imports/links: react, lucide-react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 4 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~4 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/ToolboxRecreation.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 147 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ./ReferenceStudioPrimitives, ./useCanonicalAnalytics, ./sourceModules.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/useCanonicalAnalytics.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 139 lines; export interface CanonicalAnalyticsView; export const useCanonicalAnalytics; export const formatCompactNumber; export const formatCurrency.
- **What it interacts with:** Imports/links: react, ../../services/analyticsContract, ../../services/analyticsSelectors, ../../context/useBrain.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 11 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~11 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/widgetContracts.ts
- **What it is:** TypeScript logic module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 149 lines; export type WidgetPromotionState; export type WidgetDataDependency; export interface WidgetBackendStatus; export interface WidgetSpec.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Non-visual support artifact
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/WidgetLab.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 114 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ./ReferenceStudioPrimitives, ./widgetContracts.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/referenceStudio/WidgetLabV2.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 135 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ../../components/Toolbox, ./widgetContracts.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ReferenceStudioIsolated.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 30 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ReferenceStudioV2.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 97 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, lucide-react, ./bench/benchRegistry.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ResearchLab.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 5960 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-markdown, ../services/gemini, ../components/Icons, ../components/ReportViewer.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Over-engineered/fragile due size and coupling.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ResearchLabToolbox.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 106 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/analyticsSelectors, ../services/analyticsRuntime, ../services/analyticsContract, ../components/ResearchLabCharts.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/SeoGenerator.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 559 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ../services/gemini, ../types, react-markdown.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/Settings.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 965 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, react-router-dom, ../context/useBrain, ../services/authSession.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ShortsStudio.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 7 lines; export const ShortsStudio.
- **What it interacts with:** Imports/links: react, ../editor-ui/IntegratedRemotionEditor.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/SimpleAnalytics.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 241 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, recharts, ../services/analyticsContract, ../services/analyticsSelectors, ../context/useBrain.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/SourcesLabView.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 23 lines; No named exports detected.
- **What it interacts with:** Imports/links: react.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/StoryboardStudio.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 638 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, recharts, ../context/useBrain, ../components/CustomIcon.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/StudioHub.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 101 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../components/Toolbox, ../components/CustomIcon, ./SeoGenerator, ./ThumbnailStudio.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/Stuff.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 222 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/Subscribe.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 227 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, lucide-react, ../services/subscriptionPlans, ../services/billingEntitlement.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/ThumbnailStudio.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 637 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/gemini, ../types, ../context/useBrain, ../components/CustomIcon.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 2 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~2 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/UserGuide.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 142 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-router-dom, lucide-react, ../content/userGuideContent.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/VideoManager.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 1593 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, ../services/youtubeService, ../services/youtubeService, ../context/useBrain, ../services/gemini.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub src/views/VideoPublisher.tsx
- **What it is:** React/TSX module in View Layer.
- **What it does:** Implements route-level feature surface.
- **What it contains:** 574 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, lucide-react, ../services/gemini, ../types, react-markdown.
- **System membership:** View Layer.
- **Current implementation:** File-local implementation with 1 inbound reference signal(s).
- **UI visualization:** Directly rendered in UI/route/toolbox surfaces
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~1 file(s).
- **Lifecycle status:** Active.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

## SERVER System Audit

### Local Backend

:::sub server/billing-server.mjs
- **What it is:** Node ESM script/module in Local Backend.
- **What it does:** Runs local billing backend workflow.
- **What it contains:** 648 lines; No named exports detected.
- **What it interacts with:** Imports/links: node:http, node:crypto, node:fs, node:path, node:url.
- **System membership:** Local Backend.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** No direct UI; local API/runtime process
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

## SCRIPTS System Audit

### Dev/Build Scripts

:::sub scripts/check-billing-env.mjs
- **What it is:** Node ESM script/module in Dev/Build Scripts.
- **What it does:** Automates dev/build/reporting tasks.
- **What it contains:** 63 lines; No named exports detected.
- **What it interacts with:** Imports/links: node:fs, node:path.
- **System membership:** Dev/Build Scripts.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** No UI; CLI/dev workflow surface
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub scripts/dev-all.mjs
- **What it is:** Node ESM script/module in Dev/Build Scripts.
- **What it does:** Automates dev/build/reporting tasks.
- **What it contains:** 45 lines; No named exports detected.
- **What it interacts with:** Imports/links: node:child_process.
- **System membership:** Dev/Build Scripts.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** No UI; CLI/dev workflow surface
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub scripts/generate-chart-inventory.mjs
- **What it is:** Node ESM script/module in Dev/Build Scripts.
- **What it does:** Automates dev/build/reporting tasks.
- **What it contains:** 314 lines; No named exports detected.
- **What it interacts with:** Imports/links: node:fs, node:path, recharts.
- **System membership:** Dev/Build Scripts.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** No UI; CLI/dev workflow surface
- **Runtime reality:** Present in repo but likely not mounted/imported in active graph.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Partially used/orphan candidate.
- **Optimization/refactor action:** Verify references; merge with canonical module or delete.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

## PUBLIC System Audit

### Editor Static Runtime

:::sub public/editors/assets/HEIGHT.png
- **What it is:** Static media asset in Editor Static Runtime.
- **What it does:** Provides static resources served by Vite preview/build.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Editor Static Runtime.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Served static asset/editor HTML
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active static runtime asset.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub public/editors/CODEX_EDITOR_X_V1.html
- **What it is:** Static HTML surface in Editor Static Runtime.
- **What it does:** Provides static resources served by Vite preview/build.
- **What it contains:** 4618 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-dom/client, lucide-react.
- **System membership:** Editor Static Runtime.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Served static asset/editor HTML
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active static runtime asset.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub public/editors/TEMPLATE_STARTER_PACK_V1.json
- **What it is:** JSON data/config in Editor Static Runtime.
- **What it does:** Provides static resources served by Vite preview/build.
- **What it contains:** 430 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Editor Static Runtime.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Served static asset/editor HTML
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active static runtime asset.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub public/editors/VT_E1_CLAY.html
- **What it is:** Static HTML surface in Editor Static Runtime.
- **What it does:** Provides static resources served by Vite preview/build.
- **What it contains:** 10932 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-dom/client, lucide-react, lucide-react.
- **System membership:** Editor Static Runtime.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Served static asset/editor HTML
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active static runtime asset.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub public/editors/VT_E1_GENERIC.html
- **What it is:** Static HTML surface in Editor Static Runtime.
- **What it does:** Provides static resources served by Vite preview/build.
- **What it contains:** 11036 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-dom/client, lucide-react, lucide-react.
- **System membership:** Editor Static Runtime.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Served static asset/editor HTML
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active static runtime asset.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub public/editors/VT_E1.html
- **What it is:** Static HTML surface in Editor Static Runtime.
- **What it does:** Provides static resources served by Vite preview/build.
- **What it contains:** 10300 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-dom/client, lucide-react, lucide-react.
- **System membership:** Editor Static Runtime.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Served static asset/editor HTML
- **Runtime reality:** Participates in current runtime path or test path.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active static runtime asset.
- **Optimization/refactor action:** Keep; tighten contracts/types and consolidate with adjacent modules where overlap exists.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

## DIST System Audit

### Build Output

:::sub dist/assets/AlgorithmArchitect-C7AEXr3w.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/analyticsContract-VebB4GN2.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/AnalyticsHubBench-CKTsgKna.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/blocks-D0JNiPeT.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/brainEngine-BxjsNK1L.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 600 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/Channelytics-DS-dxASz.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 2 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/ChartCatalog-BRCs6ltW.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/ChartCatalogV2-CsJ7j0F7.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/ChartSpecImplementation-CqXwtq2p.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/ChartSpecImplementationV2-BtprxuPl.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/chunk-62oNxeRG.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/clipboard-check-fO8NjQpZ.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/DataVizualizations-KWVxJkTo.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/index-BC_hhCEv.css
- **What it is:** Stylesheet in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 3 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/index-BT8Hwod5.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 651 lines; No named exports detected.
- **What it interacts with:** Imports/links: ${e.module}.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/localDataReset-SYp1_6oi.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/network-DxA9MUjS.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/RequestQueue-B9KEIaQz.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/ResearchLab-DyVmB6Dq.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 28 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/SectionSourcesLab-CKa4Y7c8.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/Settings-sg1DcZP7.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/SyncCoordinator-gibSBMqQ.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/ToolboxRecreation--vtOn4sk.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/ToolboxUISystem-B62PU5pr.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 72 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/UIReferenceLibraryContent-zBpVcLdp.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 8 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/unifiedChartSpec-B3NWHPaZ.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/widgetContracts-qquQ6zQJ.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/WidgetLab-kpIFUcbW.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/assets/WidgetLabV2-Dl04Trha.js
- **What it is:** .js file in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 1 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/editors/assets/HEIGHT.png
- **What it is:** Static media asset in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** Structured module content.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/editors/CODEX_EDITOR_X_V1.html
- **What it is:** Static HTML surface in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 4618 lines; No named exports detected.
- **What it interacts with:** Imports/links: react, react-dom/client, lucide-react.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/editors/TEMPLATE_STARTER_PACK_V1.json
- **What it is:** JSON data/config in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 430 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 0 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~0 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

:::sub dist/index.html
- **What it is:** Static HTML surface in Build Output.
- **What it does:** Ships compiled frontend runtime chunks.
- **What it contains:** 29 lines; No named exports detected.
- **What it interacts with:** Imports/links: None/asset-only.
- **System membership:** Build Output.
- **Current implementation:** File-local implementation with 3 inbound reference signal(s).
- **UI visualization:** Browser-served compiled JS/CSS chunks
- **Runtime reality:** Runtime output only; should be regenerated, not hand-edited.
- **Dependencies/dependents:** Depends on referenced imports; depended on by ~3 file(s).
- **Lifecycle status:** Active build artifact.
- **Optimization/refactor action:** Keep generated-only policy; exclude from architecture source-of-truth decisions.
- **Merge/consolidation target:** No immediate merge target beyond subsystem-level refactor.
- **Modernization quality call:** Mixed.
- **Important notes:** Verify against canonical route/service contracts before keeping or removing.
:::

## NODE_MODULES Architectural Review (Folder/Package-Level)

Scope rule applied: declared dependencies/devDependencies plus notable install-state anomalies.

- **@dnd-kit/core (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@dnd-kit/sortable (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@dnd-kit/utilities (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@google/genai (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@imgly/background-removal (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: High-cost package; keep only if image pipeline feature is actively shipped.

- **autoprefixer (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **clsx (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **framer-motion (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Validate actual usage density; remove if animation system is sparse.

- **jszip (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **lottie-react (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **lucide-react (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **postcss (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **react (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **react-dom (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **react-draggable (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **react-google-charts (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Candidate replacement: Recharts-only consolidation to reduce chart stack overlap.

- **react-is (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **react-markdown (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **react-resizable (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **react-router-dom (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **recharts (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **tailwind-merge (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **tailwindcss (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **zod (dependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in dependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@eslint/js (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@tailwindcss/vite (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@types/jszip (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@types/node (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@types/react (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@types/react-dom (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@types/react-resizable (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **@vitejs/plugin-react (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **eslint (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **eslint-plugin-react-hooks (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **eslint-plugin-react-refresh (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **globals (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **jsdom (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep for tests; remove if vitest env no longer needs DOM emulation.

- **puppeteer (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Heavy dependency; keep only if browser automation/testing is actively used.

- **typescript (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **typescript-eslint (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: No direct source reference found.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **vite (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

- **vitest (devDependency)**
  - Purpose: Package capability provider.
  - Why it exists: Declared in devDependency for this app stack.
  - Usage reality: Used in repo.
  - Health call: Check version cadence + runtime necessity.
  - Optimization path: Keep unless architecture changes.

### Notable Extraneous Package Folders

- **@emnapi/core**: extraneous in `npm ls`; likely transitive residue. Recommendation: clean reinstall + lockfile hygiene; remove if not required by declared deps.
- **@emnapi/runtime**: extraneous in `npm ls`; likely transitive residue. Recommendation: clean reinstall + lockfile hygiene; remove if not required by declared deps.
- **@emnapi/wasi-threads**: extraneous in `npm ls`; likely transitive residue. Recommendation: clean reinstall + lockfile hygiene; remove if not required by declared deps.
- **@napi-rs/wasm-runtime**: extraneous in `npm ls`; likely transitive residue. Recommendation: clean reinstall + lockfile hygiene; remove if not required by declared deps.
- **@tybys/wasm-util**: extraneous in `npm ls`; likely transitive residue. Recommendation: clean reinstall + lockfile hygiene; remove if not required by declared deps.

## Cross-System Problems + Modernization Priorities

1. **Legacy duplication overload:** backup/copy files inside `src` are contaminating typecheck and architectural clarity.
2. **Route/view-service contract drift:** large view modules (`PerformanceHub`, `ResearchLab`, `ReferenceStudio`) show type/interface skew against service layers.
3. **Canonical-source ambiguity:** multiple similarly named modules (`Sidebar`, `MediaAnalyzer`, chart copies) create ownership conflicts.
4. **Build artifact confusion:** `dist` currently co-located with source-level analysis; treat as output-only, never architecture truth.
5. **Node package hygiene gap:** extraneous modules indicate install-state drift; enforce deterministic reinstall policy.

## Recommended Consolidation Tracks

- **Track A (Immediate hygiene):** quarantine/delete `.DS_Store`, `*.bak`, `copy*`, and scratch folders from active source paths.
- **Track B (Contract repair):** stabilize shared types between `views/*` and `services/*`, then restore green `typecheck`.
- **Track C (UI source-of-truth):** converge duplicated component systems onto canonical `Toolbox/ToolboxUISystem/ui/*` primitives.
- **Track D (Analytics integrity):** keep `PerformanceHub` table/chart contracts aligned with canonical services and capability registries.
- **Track E (Editor boundary):** preserve `editor-core` as modular authority; prevent leakage from legacy view copies.
