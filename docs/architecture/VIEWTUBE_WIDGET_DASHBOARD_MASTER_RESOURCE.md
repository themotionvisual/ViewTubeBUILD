# ViewTube Widget + Dashboard Master Resource

**Status:** CANONICAL LIVING WIDGET / DASHBOARD PLANNING + IMPLEMENTATION RESOURCE  
**Created:** 2026-09-25  
**Last audited main:** `6e1766103153f73957013d1d499687d0ebd01b90`  
**Current registered widget count:** 68  
**Executable authority:** `src/views/dashboard/WidgetRegistryBase.ts`, `src/views/dashboard/WidgetRegistry.ts`, `src/views/dashboard/WidgetRenderer.tsx`, `src/views/dashboard/WidgetRendererBase.tsx`, `src/views/dashboard/WidgetShell.tsx`, `src/views/dashboard/DashboardCanvas.tsx`, `src/views/dashboard/storage.ts`, `src/views/dashboard/widgetCertification.ts`, `src/views/dashboard/WidgetPrimitives.tsx`, and widget-local modules under `src/views/dashboard/widgets/`.  
**Design-system authority:** `.claude/skills/viewtube-widget-dashboard-system/`, `.claude/skills/viewtube-widget-dashboard/`, `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`, and the canonical widget primitives.  
**Purpose of this document:** one continuously editable place to organize widget architecture, settings-widget evolution, merge/consolidation decisions, implementation work, no-account/empty preview behavior, source files, QA, and cross-agent handoff.

---

## 1. Operating rule and source-of-truth hierarchy

This document is the human-readable coordination authority for the Dashboard widget program. It does **not** replace executable registries or tests.

Order of authority:

1. **Runtime code and registries** — actual widget IDs, release tier, dimensions, renderer ownership and current behavior.
2. **Tests and certification contracts** — prove supported interactions, dimensions, states and integration.
3. **Widget dashboard skills** — canonical implementation rules, primitives, responsive behavior and acceptance process.
4. **This master resource** — current plan, consolidation map, task backlog, inventory and decision ledger.
5. **Specialized plans/audits** — optimization, certification, futures, migration and donor documents.
6. **Historical Library artifacts / HTML atlases** — design and feature donors only; never override current runtime truth.

When counts or implementation status conflict, remeasure current `main`; do not preserve stale numbers merely because an older document says them.

---

## 2. Current-state snapshot

Current `main` exposes **68 registered widget IDs** across system, core, analytics, AI, creation and community families.

### System
- `app-verification-explainer` — About VIEWTUBE
- `alerts-feed` — Alerts Feed
- `system-micro-stack` — Settings
- `alerts-ticker` — News Ticker
- `burnout-monitor` — Burnout Monitor
- `ui-reference-library` — UI Reference Library

### Core
- `kpi-cluster` — Channel Overview
- `channel-overview` — Social Channels
- `mini-calendar` — Mini Calendar
- `task-stack` — Task Stack
- `quick-actions` — Quick Actions
- `goals-tracker` — Goals Tracker

### AI
- `ai-prompt-box` — AI Prompt Box
- `ask-me` — Ask Me
- `daily-oracle` — Daily Oracle
- `ai-journal` — AI Journal
- `brain-hub` — Brain Hub
- `next-best-action` — Next Best Action

### Creation
- `tag-generator` — Tag Generator
- `community-post` — Community Post
- `thumb-ai` — Thumb AI
- `description-editor` — Description Editor
- `flight-check` — Publishing Command
- `image-generator` — Image Generator
- `video-uploader` — Video Uploader / pending Publisher migration
- `data-edit` — Video Manager
- `title-rewriter` — Title Rewriter
- `upload-scheduler` — Upload Scheduler
- `ab-thumbnail` — A/B Thumbnail Test
- `content-pipeline` — Content Pipeline
- `video-director` — Video Director
- `video-asset-engine` — Video Asset Engine
- `shorts-multiplier` — Shorts Multiplier

### Community
- `superfan-card` — Superfan Card
- `comment-replier` — Comment Responder
- `audience-matrix` — Audience Matrix
- `collab-matchmaker` — Collab Matchmaker
- `video-comment-operator` — Video Comment Operator
- `audience-requests` — Audience Requests

### Analytics
- `recent-uploads` — Recent Uploads
- `top-performer` — Top Performer
- `revenue-momentum` — Revenue Momentum
- `consistency-heatmap` — Upload Cadence
- `revenue-chart` — Revenue Tracker
- `realtime-performance` — Realtime
- `keyword-engine` — Keyword Engine
- `keyword-overlap-intelligence` — Keyword Overlap
- `publish-momentum` — Published Momentum
- `traffic-sources` — Traffic Sources
- `audience-retention` — Retention Dip
- `shorts-vs-long` — Long vs Short
- `reach-funnel` — Reach Funnel
- `relative-retention-benchmark` — Algo Benchmark
- `ad-stack-intelligence` — The Ad Stack
- `bridge-efficiency` — Bridge Efficiency
- `retention-sim` — Retention Simulator
- `hashtag-analyzer` — Hashtag Analyzer
- `video-autopsy` — Video Autopsy
- `algo-benchmark` — Algorithm Benchmark
- `cpm-geo` — CPM by Geography
- `device-matrix` — Device Matrix
- `guest-ratio` — Guest Ratio
- `playback-origins` — Playback Origins
- `premium-pulse` — Premium Pulse
- `sharing-dna` — Sharing DNA
- `channel-progress` — Channel Progress
- `anomaly-radar` — Anomaly Radar
- `opportunity-radar` — Opportunity Radar

**Important:** registry `status` and release tier are separate. A widget may be implemented and `ready` but not belong in the default supported cohort. Prototype widgets can still be high-quality working systems while certification or backend integration remains incomplete.

---

## 2.5. Active implementation status — Settings widget

**Started:** 2026-09-25  
**Current implementation phase:** Phase 3 responsive certification + disconnected preview  
**Latest implementation commit in this wave:** `21fa291c0661d44c5f54de74632d5e4edcd44a14`

Implemented so far:
- extracted `system-micro-stack` from the inline `WidgetRendererBase.tsx` branch;
- created `src/views/dashboard/widgets/SettingsWidget.tsx` and `SettingsWidget.css`;
- converted Settings to a lazy-loaded dedicated widget owner and removed the old Settings-only `WidgetShell` injection;
- added DASHBOARD / DATA / AI / ACCOUNT pages;
- preserved edit-mode, show-all, connect/sync, account, billing and user-guide actions;
- added live registered/visible/hidden widget counts through the Dashboard control bridge;
- replaced legacy raw control styling with canonical widget primitives for the new surface;
- routed AI handoff to the canonical `/ai-brain` route;
- added a focused Settings widget contract test;
- added tested Focus / Creation / Analytics / All layout presets;
- added export/import controls and guarded reset with cancel;
- added a live Layout Lock toggle;
- added explicit DISCONNECTED / NEVER SYNCED / STALE / CURRENT data states;
- extracted preset selection into a pure tested dashboard preset model;
- added explicit compact / standard / wide container tiers at <=420px, 421–760px and >=761px;
- added clearly labeled generic PREVIEW / CONNECT TO PERSONALIZE panels for disconnected Data and AI states;
- verified the Settings widget and dashboard preset tests pass in the full suite;
- verified the updated application-menu governance test recognizes the dedicated Settings owner.

Still required before the Settings task is complete:
- visually certify all supported size/height pairs with acceptance captures;
- add richer stale/error detail where backend state exposes specific failures;
- verify the latest production build + focused contract run;
- add desktop/mobile acceptance screenshots;
- remove any now-unused legacy imports/classes discovered by static quality;
- update User Guide screenshots/help text.

## 3. Settings widget redesign plan

### Current state

The Settings widget (`system-micro-stack`) has been extracted from `WidgetRendererBase.tsx` into the dedicated lazy module `src/views/dashboard/widgets/SettingsWidget.tsx`. Phase 1–2 now provide the four-page Dashboard Control Switchboard, live dashboard counts, presets, layout lock, visibility management, import/export/reset controls, data freshness states, AI status and account handoffs using canonical widget primitives. Remaining work is visual certification, richer stale/error detail where the data model supports it, acceptance screenshots and user-guide synchronization.

### Target identity: **Dashboard Control Switchboard**

The redesigned Settings widget should become a dedicated lazy module:

- `src/views/dashboard/widgets/SettingsWidget.tsx`
- `src/views/dashboard/widgets/SettingsWidget.css`
- optional pure model: `settingsWidgetModel.ts`
- focused contract test: `SettingsWidget.test.tsx`

Its signature component should be a compact **four-zone switchboard** with system LEDs/status cells and one page at a time. It should feel like a small control room, not a vertical stack of unrelated buttons.

### Header / page model

Use a compact canonical header toggle or stepper with four pages:

1. **DASHBOARD**
2. **DATA**
3. **AI**
4. **ACCOUNT**

Only one page renders at a time. This follows the updated UI Reference Library rule and keeps the widget height bounded.

### Page A — Dashboard

Show:

- **Visible widgets / 68 total**
- hidden widget count
- edit mode on/off
- “Show all widgets”
- compact layout summary
- current mobile behavior:
  - width resizing locked on phones
  - vertical H− / H+ still available
  - drag disabled on phones
  - Move Up / Move Down one-step controls active
  - viewport anchoring preserves screen position
- button to open full Dashboard Settings
- guarded “Reset dashboard layout” action only after confirmation
- optional preset selector later: Focus / Analytics / Creation / Minimal / Custom

Do not duplicate every widget visibility control inside this small widget; the detailed list belongs in Settings.

### Page B — Data

Show:

- channel connected / disconnected
- last successful sync
- sync status LED
- sync-now action
- canonical data source label
- stale/blocked/errors count when available
- link to Sync / Data settings

A disconnected user should see an explanatory preview, not an empty panel.

### Page C — AI

Show:

- current Brain/model label from canonical settings
- Brain connected/available status
- AI permission/governance summary when available
- link to Brain / AI settings
- avoid exposing obsolete model IDs or localStorage as the long-term authority

### Page D — Account

Show:

- current plan
- account connection status
- Account
- Billing
- User Guide
- optional Appearance / Accessibility shortcut

### Primitive and visual rules

- Replace inline raw buttons with canonical `WidgetSizedButton`, `WidgetToggleSwitch`, `WidgetBadge`, `WidgetIconButton`, `WidgetProgressBar`, and `WidgetStatePanel`.
- No authored black borders/text/shadows; use `--widget-border`, `--vt-ink`, and assigned widget spectrum color.
- Use 4px shell / 3px module / 2px control hierarchy.
- The switchboard should stay visually recognizable at quarter, third, half and full widths.
- Mobile portrait should render two compact rows where needed; desktop/mobile landscape should favor one-row groupings.
- Titles wrap; never ellipsis.
- Do not let the settings widget become a second Settings page. It is a summary + control + route surface.

### Implementation sequence

1. Add a failing SettingsWidget contract test.
2. Extract current behavior from `WidgetRendererBase.tsx`.
3. Add a pure view-model for channel/sync/widget-count/model/account summaries.
4. Build four paged switchboard surfaces with canonical primitives.
5. Preserve existing dashboard-control callbacks.
6. Route deep configuration to Settings pages.
7. Add disconnected/loading/stale/error states.
8. Certify desktop 1440×1000, phone portrait 390×844 and mobile landscape.
9. Remove the legacy inline branch only after renderer coverage and routing tests pass.
10. Update User Guide and this resource.

---

## 4. Widget consolidation / combination candidates

The rule is to combine **duplicate jobs and overlapping actions**, not merely widgets that share a broad topic. Each consolidation requires a capability matrix, persisted-layout migration, route migration and certification before deleting an old ID.

| Candidate group | Recommended combined owner | Why combine | Disposition |
| --- | --- | --- | --- |
| Daily Oracle + Next Best Action | **Daily Oracle** | Both rank evidence-backed creator actions; NBA is already planned as donor logic for Oracle. | **High priority merge** |
| Alerts Feed + News Ticker | **Alerts / Header alert system** | News Ticker is already legacy/duplicative of header alerts; one event stream is clearer. | **High priority retire/merge** |
| Video Uploader + Publishing Command | **Video Publisher** with PREP / PREFLIGHT / PUBLISH pages | Source media, metadata, readiness and publish transaction are one workflow. | **High priority capability merge** |
| Keyword Engine + Keyword Overlap | **Keyword Intelligence** | Search opportunity discovery and overlap analysis are two views of one keyword model. | **Strong merge candidate** |
| Title Rewriter + Description Editor + Tag Generator + Hashtag Analyzer | **Metadata / SEO Workbench** | Four packaging tools edit closely related publishing metadata and can share selected-video/package context. | **Strong merge candidate** |
| Retention Dip + Algo Benchmark + Retention Simulator | **Retention Lab** | Actual retention, relative benchmark and simulation belong in one inspect/compare/model workflow. | **Strong merge candidate** |
| Mini Calendar + Upload Scheduler | **Publishing Calendar** | Calendar context and schedule editing duplicate time-based publishing work. | **Strong merge candidate** |
| Audience Matrix + Device Matrix + Guest Ratio | **Audience Intelligence** | All segment the same audience through different dimensions; tabs/lenses reduce repetition. | **Strong merge candidate** |
| Traffic Sources + Playback Origins + Sharing DNA + Bridge Efficiency | **Discovery & Distribution** | All explain how viewers arrive, move and share; one flow-oriented widget can change lenses. | **Moderate merge candidate** |
| Revenue Tracker + Revenue Momentum + Ad Stack + CPM Geography + Premium Pulse | **Monetization Intelligence** | Same revenue domain with current, trend, ad-stack, geo and premium lenses. | **Moderate merge candidate; preserve clear subviews** |
| Comment Responder + Video Comment Operator | **Comment Operations** | Both review/reply/moderate comments; selected-video scope can become one page/filter. | **Strong merge candidate** |
| Task Stack + Content Pipeline | **Content Pipeline** with TASKS lane | Generic task stack is weak alone; tasks are more useful attached to production stages. | **Moderate merge candidate** |
| Recent Uploads + Top Performer | **Video Performance Shelf** | Both are simple catalog selections with summary metrics. | **Optional merge** |

### Explicit non-merges

Keep these independent unless later evidence proves duplication:

- Brain Hub vs Daily Oracle — Brain Hub owns reasoning/runtime/governance; Oracle owns daily creator action.
- Video Manager vs Video Publisher — manage an already-published video vs publish a new/canonical package.
- Video Autopsy vs Video Manager — diagnosis vs mutation.
- Opportunity Radar vs Anomaly Radar — opportunity selection vs deviation detection.
- Video Director vs Editor — direction/generation vs timeline editing.
- UI Reference Library vs Settings — developer/reference surface vs user settings.

---

## 5. Empty, disconnected and no-data preview framework

Every widget must look intentionally designed when no account is connected, data has not synced, or the relevant collection is genuinely empty.

### State taxonomy

Do not collapse these into one generic “no data” message:

- **Disconnected** — user has not connected a channel/account.
- **Unsynced** — connected, but the dataset has never been fetched.
- **Loading** — active request/sync/generation is in progress.
- **Empty** — valid query returned zero items.
- **Blocked** — permission, dependency or approval prevents progress.
- **Stale** — data exists but exceeds freshness threshold.
- **Error** — request or transformation failed.
- **Preview/demo** — generic explanatory visualization used only when real data is unavailable.

### Generic preview rule

A disconnected/unsynced widget may show a **generic preview of what the widget does**, but:

- preview values must never be presented as the user’s data;
- mark the module clearly as `PREVIEW`, `EXAMPLE`, or `CONNECT TO PERSONALIZE`;
- use neutral generic titles such as “Example video,” “Sample opportunity,” “Typical retention curve”;
- never fabricate personalized conclusions;
- retain the widget’s actual signature visual so the surface does not appear unfinished;
- keep the primary recovery action visible: Connect / Sync / Add project / Select video / Generate;
- use skeletons only during true loading, not as permanent disconnected decoration.

### Preview patterns by widget class

- **KPI widgets:** generic stat tiles with “EXAMPLE” badges and muted trend bars.
- **Charts:** representative curve/bar geometry with a preview legend and no fake dates tied to the user.
- **Radars/scopes:** generic labeled nodes showing interaction.
- **Lists/feeds:** 2–3 sample rows with descriptive labels.
- **Creation tools:** input/output anatomy with disabled or sample package slots.
- **Publishing:** generic readiness pipeline with all stages visible.
- **Community:** neutral sample comment/request cluster.
- **AI:** example question/recommendation structure, never a fake channel claim.
- **Settings:** real local application state remains visible even when no YouTube account exists.

### Required implementation work

Create a reusable preview-state contract rather than hand-building one-offs:

- `WidgetPreviewState` primitive or recipe;
- common `previewLabel`, `previewReason`, `recoveryAction`, and `illustration/children` contract;
- widget-specific sample data stored beside each widget or in a governed preview-fixture module;
- screenshot coverage for disconnected and empty states.

---

## 5.5. Mobile field-QA corrections — 2026-09-25

Source: direct iPhone portrait screenshots of the live Dashboard.

Implemented shared/system corrections:
- removed the hidden mobile scroll-lane right inset that made widget interiors look narrower on the right;
- added symmetric shadow/glow clearance inside mobile scroll content;
- preserved the wide mobile dashboard rendering contract while keeping visual left/right gutters balanced;
- promoted a canonical `WidgetTextArea` primitive so textarea default/focus geometry matches `WidgetTextInput`;
- added mobile header-toggle wrapping support for long labels;
- codified dense mobile composition: prefer compact 24px secondary controls and multi-column grids over long stacked action lists;
- updated the widget skill so full-bleed dividers/gradient bands, equal gutters, label wrapping and shadow clearance are mandatory.

Targeted corrections completed in this pass:
- **About VIEWTUBE:** intro and handoff gradient bands now use symmetric full-bleed interior geometry.
- **Daily Oracle:** source/footer bands are full-bleed; important supporting text wraps rather than ellipsizing.
- **Channel Overview:** audience/device visualization falls back to another compatible synced window or aggregate synced rows before showing an empty state.
- **Video Director:** narrow layouts now have explicit row gaps/alignment to prevent vertical control collision.
- **Image Generator:** template header toggle has a dedicated responsive class and two-line label support.
- **Video Uploader:** title and description now use canonical text field primitives with matching default/focus states.
- **Settings:** Dashboard Controls + Layout Lock use a two-column compact grid; secondary dashboard actions use 24px compact controls; phone header stepper receives more width so labels are not cut off.

Second correction wave now implemented:
- mobile dashboard reclaim is asymmetric by design to compensate for the app-shell/browser right-side reserve measured in live iPhone screenshots;
- collapsed widgets temporarily expand their slot when the mobile control deck opens, so the expand control remains reachable;
- header toggle containers no longer clip wrapped labels on portrait layouts;
- WidgetStepTabs now derive their column count from the number of items instead of assuming three;
- Video Asset Engine now uses four correctly sized tabs, a full-width horizontal package-slot rail on mobile, and canonical footer buttons without black shadows;
- Publishing Command now always exposes package/video context when available, uses canonical checkboxes/text input for editable tasks, supports ADD TASK, uses full-bleed blocker/task rails, and compresses task rows to 28px minimum;
- Video Director Studio handoff now uses a proper header action with an ExternalLink icon and no arrow/emoji text; Auto-Fill uses the canonical sized button/shadow path;
- Image Generator and Video Uploader now share the same canonical WidgetTextInput / WidgetTextArea field primitives;
- the legacy split-action primitive now has a larger left icon bay and larger label text; its large size matches the 38px footer icon-button height;
- Video Uploader section controls wrap rather than overflow and its publish/reset controls share height;
- UI Reference Library explicitly documents the canonical Video Select / Dropdown component used by Video Manager.

Remaining visual verification:
- confirm live left/right outer gutter symmetry on iPhone portrait after deployment;
- confirm About VIEWTUBE and Daily Oracle full-bleed bands/dividers visually touch their intended usable edges;
- verify Channel Overview audience/device charts against a channel with those datasets synced;
- inspect Video Director at narrow portrait and short landscape heights;
- verify Image Generator's END SCREEN label wraps cleanly to two lines;
- verify Video Uploader input/textarea focus state parity;
- re-check Settings at quarter width for compactness and header readability.

## 6. Widget task backlog / to-do list

### P0 — System integrity
- [ ] Redesign Settings as Dashboard Control Switchboard and extract it from `WidgetRendererBase.tsx`.
- [ ] Build canonical disconnected/unsynced/empty/blocked/stale/error/preview state recipes.
- [ ] Add generic-but-clearly-labeled preview layouts to every supported widget with an otherwise-empty body.
- [ ] Audit every widget for authored black borders/text/shadows and migrate to VT ink/widget tokens.
- [ ] Finish mobile control certification: icon-only controls, phone width lock, vertical resize, one-step reorder and viewport anchoring.
- [ ] Confirm every supported size × height pair is intentional; remove impossible combinations.
- [ ] Update UI Reference Library so every production primitive is represented and only one section is visible at a time.
- [ ] Remove duplicate inline widget implementations after lazy-module replacements pass tests.

### P0 — Consolidation
- [ ] Merge Next Best Action capability into Daily Oracle, then migrate/remove NBA layout state.
- [ ] Rename Video Uploader to Video Publisher with persisted-ID/layout migration.
- [ ] Build Publisher capability parity between Dashboard and Studio surfaces.
- [ ] Decide whether Publishing Command becomes a Publisher page or remains a separate launch-control widget; avoid duplicated preflight logic.
- [ ] Retire News Ticker after Alerts/header parity is proven.

### P1 — High-value consolidation waves
- [ ] Keyword Engine + Keyword Overlap capability matrix.
- [ ] Metadata / SEO Workbench capability matrix.
- [ ] Retention Lab capability matrix.
- [ ] Publishing Calendar capability matrix.
- [ ] Audience Intelligence capability matrix.
- [ ] Comment Operations capability matrix.
- [ ] Discovery & Distribution capability matrix.
- [ ] Monetization Intelligence capability matrix.
- [ ] Task Stack → Content Pipeline task-lane migration.
- [ ] Recent Uploads / Top Performer compact-video-shelf experiment.

### P1 — Widget completeness
- [ ] Make Shorts Multiplier consume a canonical VT-E1 project/timeline for true render execution.
- [ ] Persist Shorts Multiplier generated variants as canonical Asset Engine/VideoPackage artifacts rather than only a handoff plan.
- [ ] Connect package-backed multiplier outputs to Publisher scheduling/transaction workflow.
- [ ] Finish Video Asset Engine source ownership and package readiness actions.
- [ ] Finish Video Director → ContentBuild/Asset Engine output lineage.
- [ ] Continue signature-system visual certification for all redesigned widgets.
- [ ] Add provenance/freshness labels to analytics widgets that currently hide source state.
- [ ] Ensure collapsed/hidden widgets stop avoidable polling and animation.

### P2 — Product polish
- [ ] Dashboard presets and saved layouts.
- [ ] Optional compact-density preference.
- [ ] Keyboard one-step widget reordering.
- [ ] Screen-reader announcement after reorder/hide/show.
- [ ] Widget usage analytics to identify unused or redundant surfaces.
- [ ] Per-widget “Why this matters” help linked to User Guide.
- [ ] Cross-widget selected-video / selected-project context where it materially improves workflow.
- [ ] Automated docs snapshot generated from registry metadata to reduce manual drift.

---

## 7. Code implementation map

### Registry and lifecycle
- `src/views/dashboard/WidgetRegistryBase.ts` — base definitions, default rows, supported cohort and generated dimension contracts.
- `src/views/dashboard/WidgetRegistry.ts` — merged registry, descriptions and public lookup.
- `src/views/dashboard/types.ts` — widget definition, instance, callback and layout types.
- `src/views/dashboard/widgetCertification.ts` — certification intent, dimension/state coverage and support report.
- `src/views/dashboard/instruments/instrumentCatalog.ts` — unique signature instrument contract for each widget.

### Rendering and layout
- `src/views/dashboard/WidgetRenderer.tsx` — chooses new-set vs base renderer and supplies shared callbacks.
- `src/views/dashboard/WidgetRendererBase.tsx` — legacy/lazy renderer owner; migration target for remaining inline widgets.
- `src/views/dashboard/WidgetShell.tsx` — canonical widget shell, header controls, collapse/help/edit behavior.
- `src/views/dashboard/DashboardCanvas.tsx` — grid, sorting/reorder and widget slots.
- `src/views/dashboard/DashboardRebuild.tsx` — Dashboard composition.
- `src/views/dashboard/storage.ts` — persisted layout/schema migrations; mandatory owner for ID merge/retire work.
- `src/views/dashboard/widgetMobileContract.css` — phone control/layout contract.
- `src/views/dashboard/widgetShellOwnership.css` — shell layout ownership.

### Primitives and style
- `src/views/dashboard/WidgetPrimitives.tsx` — canonical controls/modules.
- widget primitive CSS files — control size/tone/state ownership.
- widget-local CSS — signature geometry and responsive rules only.
- `src/styles/toolboxPalette.ts` — spectrum/palette authority.

### Data and integration
- `src/views/dashboard/useDashboardData.ts` — shared Dashboard data projection.
- `src/services/analytics-canon/**` and VT-SYNC adapters — canonical analytics read path.
- `src/services/asset-engine/**` — ContentBuild, publishing projection, transactions and asset lineage.
- `src/services/video-package/**` — canonical VideoPackage identity and package storage.
- editor/render contracts — VT-E1 render handoff for render-capable widgets.

### Tests and tooling
- `src/views/dashboard/__tests__/**` — registry, shell, mobile, persistence, widget contract and integration tests.
- widget-local tests — model/behavior tests.
- `scripts/dashboard-baseline-report.mjs` — measurable dashboard baseline.
- `scripts/dashboard-style-snapshot.mjs` — computed-style snapshot.
- visual acceptance artifacts — desktop + mobile screenshots where required.

---

## 8. ChatGPT Library widget-related file inventory

This is a deduplicated index of widget/dashboard/component files discoverable in the ChatGPT Library search on 2026-09-25. Library artifacts are **reference/donor material**, not executable authority.

| File | Role |
| --- | --- |
| `ViewTube_Widget_Master_Resource_Guide_2026-09-11.docx` | Earlier 59-widget master guide covering registry, layout, build standards and roadmap. Superseded in current-state facts by this document/runtime. |
| `ViewTube_Widget_Master_Resource_Guide_2026-09-11.pdf` | PDF export of the earlier widget master guide. |
| `VIEWTUBE_WIDGET_DASHBOARD_UI_AUDIT_2026-09-12.md` | UI/CSS audit covering cascade ownership, responsive sizing, primitives, accessibility and performance. |
| `DASHBOARD_WIDGET_AND_40_SIGNATURE_SYSTEMS_CATALOG.docx` | Catalog of signature widget systems and functional identities. |
| `DASHBOARD_WIDGET_AND_40_SIGNATURE_SYSTEMS_CATALOG.html` | HTML version of the signature-system catalog. |
| `ViewTube_Valuable_Unmerged_Widget_Dashboard_UI_Component_Branches_2026-09-17.md` | Donor-branch inventory for recoverable widget/dashboard/UI component work. |
| `ViewTube-Top-40-Widgets-Source-Faithful-Production-Atlas.html` | Source-faithful Top-40 widget atlas; useful as a feature/signature donor, not current styling authority. |
| `ViewTube-All-190-Widgets-MOBILE-SAFE-Inline-Gallery-and-Consolidation.html` | Large historical widget gallery/consolidation reference with mobile-safe ideas. |
| `ViewTube_Standalone_Component_Library_Complete.html` | Standalone component library reference. |
| `ViewTube_Standalone_Component_Library_Complete(1).html` | Alternate/duplicate complete component-library artifact. |
| `ViewTube_Standalone_Component_Library_ALL_Added.html` | Expanded standalone component-library iteration. |
| `ViewTube_Standalone_Component_Library_ALL_Added(1).html` | Expanded component-library variant. |
| `ViewTube_Standalone_Component_Library_ALL_Added(2).html` | Expanded component-library variant. |
| `ViewTube_Standalone_Component_Library_ALL_Added(3).html` | Expanded component-library variant. |
| `ViewTube_Standalone_Component_Library_SourceTrue.html` | Source-true component-library reference. |
| `ViewTube_Standalone_Component_Library_SourceTrue(1).html` | Alternate source-true component-library artifact. |
| `viewtube_video_director_toolbox_v2.html` | Video Director toolbox/component reference useful for the dashboard Video Director widget. |

**Library search note:** the previously discussed `ViewTube_40_Canonical_Widget_Atlas.html` name was not returned by the current Library search. Do not claim it is present without locating it again.

---

## 9. Repository `docs/` widget-related inventory

The following 49 files are currently matched in `docs/` by widget/dashboard/toolbox/component/visual/primitive scope.

### Dashboard / widget architecture
- `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md` — measured dashboard architecture and optimization execution plan.
- `docs/architecture/VIEWTUBE_WIDGET_POST_CURRENT_CONSOLIDATION_PLAN_2026-09-24.md` — Publisher/Manager/Oracle follow-on consolidation plan.
- `docs/architecture/WIDGET_SYSTEM_CERTIFICATION_MASTER_2026-09-14.md` — widget certification program and acceptance rules.
- `docs/architecture/WIDGET_FUTURES_RECOVERY_REGISTRY_2026-09-14.md` — future/donor widget concept registry; not runtime registry.
- `docs/architecture/MOBILE_WIDGET_PHASE2_CLASSIFICATION.md` — mobile widget classification and responsive migration planning.
- `docs/architecture/SHORTS_MULTIPLIER_WIDGET_NOTES_2026-09-24.md` — design/feature notes for Shorts Multiplier.
- `docs/architecture/VIDEO_ASSET_ENGINE_WIDGET_IDEAS_2026-09-20.md` — feature ideas/reference for Video Asset Engine.
- `docs/architecture/dashboard-baseline.json` — measured Dashboard baseline data used by optimization work.
- `docs/architecture/dashboard-style-snapshot.json` — Dashboard style snapshot for regression comparison.

### Toolbox / component system
- `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` — canonical Toolbox/Subtoolbox design-system authority.
- `docs/architecture/STUDIO_HUB_COMPONENT_STANDARDIZATION_V1.md` — Studio component standardization program.
- `docs/architecture/STUDIO_HUB_UNIFORM_PRIMITIVE_AUDIT_PLAN_2026-09-16.md` — primitive adoption audit/plan.
- `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md` — Subtoolbox primitive architecture and ownership.
- `docs/architecture/toolbox-ui-master-resource/HANDOFF_UPDATE_PROTOCOL.md` — update/handoff protocol for the Toolbox master resource.
- `docs/architecture/toolbox-ui-master-resource/README.md` — support index for the Toolbox master resource.
- `docs/ui/MEDIA_PRIMITIVE_EXPANSION_PLAN.md` — plan for richer media/player primitives.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_CHANGELOG_2026-09-17.md` — component-library change log.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_COMPONENT_INDEX.md` — indexed component inventory.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_HERALD_FIX_2026-09-17.md` — Herald-tracked fixes for component library.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_HERALD_STATUS.md` — component-library status/handoff.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_MOBILE_NOTES.md` — mobile component-library behavior notes.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md` — component-library source-of-truth contract.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_VISUAL_CHECKLIST.md` — visual QA checklist.
- `docs/ui/toolbox-system/MANIFEST.md` — toolbox-system document manifest.
- `docs/ui/toolbox-system/README.md` — toolbox-system entry point.
- `docs/ui/toolbox-system/audits/MASTER_RESOURCE_50_IMPROVEMENTS_2026-09-13.md` — 50-point Toolbox/UI improvement audit.

### Data visual system
- `docs/DATA_VISUAL_MODULE_UNIFICATION.md` — plan/contract for unifying data visual modules.
- `docs/DATA_VISUAL_MODULE_UNIFICATION_STATUS.md` — status tracking for that unification.
- `docs/MOBILE_VISUAL_PHASE2_CHANGELOG.md` — mobile visual change log.
- `docs/MOBILE_VISUAL_QA_MATRIX.md` — mobile visual QA matrix.
- `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` — mobile data-visual responsive rules.
- `docs/PRIMITIVE_FIX_PREVIEW_TRIGGER.md` — preview/review trigger for primitive fixes.
- `docs/migration/data-visual-canvas-contract.md` — migration-era data visual canvas contract.
- `docs/migration/data-visual-controller-unification-plan.md` — plan to standardize data visual controllers.
- `docs/migration/data-visual-mobile-mark-scale-plan.md` — mobile mark/scale behavior plan.

### Herald data-visual evidence
- `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/README.md` — artifact package overview.
- `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/SCREENSHOTS.md` — visual evidence index.
- `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/documents/data-visual-controller-unification-plan.md` — captured implementation plan.
- `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/meta.json` — artifact metadata.
- `.../screenshots/channel-progress--1440x1000.png` — desktop Channel Progress acceptance evidence.
- `.../screenshots/channel-progress--390x844.png` — mobile Channel Progress acceptance evidence.
- `.../screenshots/content-treemap--1440x1000.png` — desktop Content Treemap evidence.
- `.../screenshots/content-treemap--390x844.png` — mobile Content Treemap evidence.
- `.../screenshots/heat-matrix--1440x1000.png` — desktop Heat Matrix evidence.
- `.../screenshots/heat-matrix--390x844.png` — mobile Heat Matrix evidence.
- `.../screenshots/publish-optimal-clock--1440x1000.png` — desktop publish-time visual evidence.
- `.../screenshots/publish-optimal-clock--390x844.png` — mobile publish-time visual evidence.

### Editor / shared visual primitives
- `docs/editor/MOBILE_EDITOR_PRIMITIVES_AND_TOUCH_CONTROLS_2026-09-19.md` — touch/control primitive rules relevant to shared mobile UI.
- `docs/editor/component-style-default.md` — default editor component styling reference.

---

## 10. Additional section 1 — Architecture ownership boundaries

Every widget must declare five owners:

1. **UI owner** — widget module and local CSS.
2. **data owner** — analytics-canon, ContentBuild, VideoPackage, Brain, YouTube, etc.
3. **action owner** — service that mutates state or triggers workflow.
4. **persistence owner** — dashboard storage, package repository, ContentBuild, remote API, etc.
5. **route/handoff owner** — destination page/tool.

A widget must not invent a local shadow repository simply because the UI needs a convenient state shape.

---

## 11. Additional section 2 — Widget lifecycle and release gates

Lifecycle:

`concept → registered preview → implemented → contract-tested → visually certified → supported → consolidated/retired`

A widget can move to supported only after:

- unique intent and primary action;
- canonical data/action owner;
- all six state classes;
- supported dimensions;
- keyboard/touch path;
- mobile portrait + landscape;
- production route/permission check;
- no duplicate owner conflict;
- screenshot evidence;
- certification entry.

Retirement requires an explicit layout/storage migration.

---

## 12. Additional section 3 — Data and backend dependency matrix

For every widget, maintain:

- source dataset/service;
- channel scope;
- time window;
- grain;
- freshness threshold;
- required permissions;
- fallback source;
- mutation service;
- canonical artifact/project/video identity;
- stale/error semantics.

Analytics widgets must not silently mix incompatible populations/windows. Creation/publishing widgets must preserve ContentBuild/VideoPackage identity and provenance.

---

## 13. Additional section 4 — Responsive geometry contract

- Page grid remains 24-column on capable desktop layouts.
- Widget internals respond to container size, not viewport alone.
- Phone: logical single-column stack with restored wider canvas hack.
- Phone width resize controls are disabled.
- Phone height resize controls remain available.
- Phone drag is replaced by one-step up/down.
- Reorder preserves viewport position.
- Module titles wrap rather than shrink or ellipsis.
- Split-left rails remain square.
- Rows may become two rows in portrait when necessary.
- Every widget must declare real min/default/max height with at least one vertical step.

---

## 14. Additional section 5 — Accessibility and touch contract

- Coarse-pointer targets: minimum 44px where interaction density allows.
- Every icon-only control has an accessible label.
- Status cannot depend on color alone.
- Focus survives collapse, page switch, reorder and removal.
- Keyboard reorder must be added to match phone one-step semantics.
- Reduced motion applies to reorder, collapse and signature animation.
- Charts need a textual summary or equivalent accessible data view.
- Tooltips supplement labels; they never replace them.

---

## 15. Additional section 6 — Performance and runtime budget

Per widget classify `light / moderate / heavy`.

Rules:

- lazy-load dedicated heavy widgets;
- defer below-fold widget mounting;
- stop polling while hidden/collapsed;
- stop nonessential animation when offscreen;
- memoize expensive aggregation;
- avoid duplicating canonical datasets in component state;
- code-split widget-local CSS where practical;
- monitor Dashboard JS/CSS bundle size and initial DOM count.

Use `dashboard-baseline-report.mjs` before and after large migration waves.

---

## 16. Additional section 7 — Test and visual-certification matrix

Required layers:

- pure model tests;
- component behavior tests;
- registry/renderer coverage;
- storage migration tests;
- mobile contract tests;
- accessibility interaction tests;
- production build;
- source governance;
- focused contracts;
- desktop screenshot 1440×1000;
- phone portrait screenshot 390×844;
- landscape capture for widgets with unique landscape behavior.

A red unrelated repository gate must be documented separately from a widget-specific regression.

---

## 17. Additional section 8 — Migration, ID and persistence policy

Never casually rename/delete a widget ID.

For merges/renames:

1. define new canonical owner;
2. map old ID → new ID;
3. migrate `order`, `hidden`, `instances`, sizes, heights and collapse state;
4. back up previous schema;
5. de-duplicate if old and new IDs both exist;
6. preserve nearest valid dimension;
7. add tests for old schema import;
8. only then retire renderer/registry entry.

This is mandatory for Video Uploader → Video Publisher and NBA → Daily Oracle.

---

## 18. Additional section 9 — Observability and product-usage evidence

Add privacy-respecting widget telemetry for:

- shown/hidden rate;
- opens/collapses;
- page/tab changes;
- primary action use;
- resize frequency;
- removal frequency;
- time to first useful action;
- empty/disconnected frequency;
- error/recovery rate.

Use this to identify genuine duplication before merging widgets and to detect widgets that are visually attractive but not useful.

---

## 19. Additional section 10 — Change ledger and agent handoff

Every substantial widget wave should append:

| Date | Main SHA / branch | Widget(s) | Change | Tests/evidence | Remaining work |
| --- | --- | --- | --- | --- | --- |
| 2026-09-25 | current program | Dashboard mobile system | Icon-only controls, phone width lock, vertical resize, step reorder + viewport anchoring | production build + contract work | full visual certification |
| 2026-09-25 | current program | UI Reference Library | One section at a time; height capped | contract tests | visual capture |
| 2026-09-25 | current program | Shorts Multiplier | Registered 68th widget; trim/schedule planning + editor/publisher handoff | model tests + production build | true VT-E1 render + artifact persistence |
| 2026-09-25 | planned | Settings | Dashboard Control Switchboard redesign | — | implement |

Agents should update this table, the relevant task checkbox, and the `Last audited main` line whenever the program materially changes.

---

## 20. Decision framework for future widget proposals

Before adding widget #69+:

1. Does an existing widget already own this job?
2. Is this a new **decision/action**, or merely another visualization of the same data?
3. Could it be a page/lens inside an existing signature widget?
4. Is there a canonical backend owner?
5. Does it have a unique signature component?
6. Is there enough data when disconnected/empty to explain its purpose honestly?
7. Does it need to be a Dashboard widget, or is Studio/Analytics/Settings the better home?
8. Will the widget remain useful at mobile portrait width?
9. Can its primary action be completed without a dead-end handoff?
10. What old surface can be simplified or retired if this one is added?

The Dashboard should become **more capable with fewer duplicate jobs**, not grow indefinitely.

---

## 21. Near-term execution order

### Wave 1 — Settings + state quality
1. SettingsWidget extraction/redesign.
2. Preview-state framework.
3. Apply disconnected/empty preview states to the top supported widgets.
4. Visual certification.

### Wave 2 — Consolidate obvious duplicates
1. Daily Oracle absorbs NBA.
2. Alerts/Header absorbs News Ticker.
3. Video Publisher capability merge and rename migration.
4. Comment Operations audit.

### Wave 3 — Domain workbenches
1. Retention Lab.
2. Keyword Intelligence.
3. Metadata / SEO Workbench.
4. Publishing Calendar.
5. Audience Intelligence.

### Wave 4 — Analytics consolidation
1. Discovery & Distribution.
2. Monetization Intelligence.
3. Video Performance Shelf experiment.
4. usage telemetry review before further deletion.

### Wave 5 — Runtime and documentation cleanup
1. remove retired IDs/renderers/styles after migrations;
2. shrink `WidgetRendererBase.tsx`;
3. regenerate current inventories;
4. update Guide;
5. update this master resource and documentation registry.

---

## 22. Definition of done for the living widget program

The widget system is considered structurally mature when:

- Settings accurately reflects the current Dashboard/application state;
- every supported widget has intentional disconnected/loading/empty/stale/error visuals;
- no major duplicate job remains as separate widgets without a documented reason;
- every widget uses canonical primitives for primitive-owned UI;
- every widget has a unique functional signature component;
- all supported dimensions are certified;
- mobile portrait/landscape behavior is deliberate;
- persisted layouts survive IDs being merged/renamed;
- canonical data/action ownership is documented;
- hidden/collapsed widgets do not waste runtime;
- the UI Library matches production primitives;
- Library artifacts and repo docs are indexed here;
- this document, registry, certification matrix and User Guide no longer contradict one another.
