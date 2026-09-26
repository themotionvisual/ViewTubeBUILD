# ViewTube Widget + Dashboard Master Resource

**Status:** CANONICAL LIVING WIDGET / DASHBOARD PLANNING + IMPLEMENTATION RESOURCE  
**Created:** 2026-09-25  
**Last edited:** 2026-09-26  
**Last audited main:** `cf67573c2ce8eee58f5a63f7d2ae547e165ff3c8`  
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

## 5.6. Mobile edge + primitive correction wave II — 2026-09-25

Field QA from the live iPhone preview identified a remaining shared geometry conflict rather than isolated widget defects.

Implemented in this wave:
- removed legacy widget right margins, stale viewport clamps, and horizontal clipping rules that competed with the canonical mobile contract;
- removed the fake widened mobile scroll viewport previously used for shadow clearance; focus glows now rely on normal content inset plus visible shell overflow instead of a white layout lane;
- compensated for the live app-shell's measured extra right-side lane with separate left/right reclaim variables so visible widget gutters can match;
- upgraded full-bleed mobile sections to include both content inset and scroll-shadow allowance;
- strengthened global portrait header toggles: minimum usable width, two-line labels, no ellipsis/clipping;
- added `WidgetHeaderActionButton` and migrated Video Director's Studio handoff to it;
- increased split-left icon bay/icon scale and readable label size for controls such as Publish Video / No Changes;
- unified `WidgetTextInput` and `WidgetTextArea` default + focus styling under one final primitive owner;
- removed residual right-padding / horizontal clipping from Video Uploader and Video Manager main surfaces;
- added a portrait-specific Brain Hub header-toggle owner;
- fixed Video Asset Engine's four-tab navigation, horizontal asset rail edge geometry and black-shadow override;
- compacted Publishing Command, kept it package/video specific, retained Add Task, and moved blocker markers to canonical icon-badge primitives;
- cataloged the new header-action primitive in the UI Reference Library; `WidgetVideoSelect` remains the canonical Video Manager dropdown and is already represented there;
- added/updated regression contracts for these field-QA failures and certified Publishing Command's supported workflow intent.

Acceptance still requires visual re-check on the fresh mobile preview, especially the outer right gutter, About/Daily Oracle edge bands, Brain Hub/Image Generator header toggles, Asset Engine rail, and collapsed-widget control deck.

## 5.6. Creator Operations compound primitive donor pass — 2026-09-25

Added to the canonical widget primitive surface and UI Reference Library:
- `WidgetSectionBand` — full-width labeled divider/status band with `default / primary / secondary` monochromatic tones, oversized widget-ink label text, and full-bleed edge geometry. The reference surface shows the donor workflow labels **Lead / Proposal / Active / Paid** across the three monochromatic tone levels, with the production band typography enlarged relative to its compact height.
- `WidgetDataGrid` — semantic text/cell/badge grid for CRM, comparison, status and operations tables.
- `WidgetChecklistProgress` — controlled checklist built from canonical `WidgetCheckbox` + `WidgetProgressBar`; fill is derived directly from checked items.
- `WidgetCalendarGrid` — production/calendar grid with canonical event controls; seven-column wide layout and two-column narrow-widget layout.

UI Reference Library now includes a dedicated **COMPOUND** category with live examples of all four primitives. The widget skill names these as canonical compound workflow primitives so future widgets reuse them instead of recreating local variants.

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


---

# 2026-09-25 conversation handoff — dashboard/widget program

**Handoff status:** ACTIVE / CONTINUE FROM HERE  
**Repository:** `themotionvisual/ViewTubeBUILD`  
**Branch:** `main`  
**Handoff audit point:** after archival commits through `0dcbd638a7cde9855d9245c6a8b4855e1543058c`.

This section captures the dashboard/widget work, field QA, design decisions, donor artifacts and unfinished implementation requirements from the current conversation and its source conversation. A new agent should read this section, then the rest of this master resource, then the widget-dashboard skill before changing production code.

## A. Non-negotiable widget design doctrine

1. **No authored black UI.** Widget text, strokes, borders and shadows use ViewTube Ink / assigned widget-spectrum colors. Black is not a normal widget design token.
2. **Predominantly monochromatic widgets.** Each widget is led by its assigned spectrum color; secondary colors are justified semantic accents, not decoration.
3. **Canonical primitive ownership.** Fix a recurring control problem in the primitive/component owner first, then remove widget-local hard-coded copies.
4. **Widget anatomy:** Frame → Header → Interior → recognizable signature functional component. Explanatory material belongs in the existing help/`?` surface rather than displacing real controls.
5. **Control ladder:** canonical 18/24/32/38px visual sizes. Current explicit type mapping remains 24px control → 14px type, 32px → 18px, 38px → 22px. Dense 24px rows may adapt type only when required. Module titles do not shrink on mobile; they wrap.
6. **Geometry:** 4px shell / 3px module / 2px control hierarchy where applicable; 4px base spacing logic; square split-left rails; icon scale follows the control rather than using one universal icon size.
7. **Width × height are independent inputs.** Widgets must support declared width and height buckets without changing identity. Height buckets are real design states, not merely CSS overflow.
8. **Mobile portrait:** retain the wide mobile rendering contract (the restored width hack), but visible left/right gutters must be visually equal. Width resize is disabled on phones. Every widget can move at least one vertical size up/down.
9. **Mobile reordering:** drag is disabled on phones. Use single-arrow Move Up / Move Down controls. One press moves one slot. Viewport anchoring keeps the moved widget at approximately the same screen position while surrounding widgets pass it.
10. **Mobile controls:** the top-right widget-controls button remains available even when the widget body is collapsed. Opening it reveals the colored secondary header/control row so a collapsed widget can always be expanded again.
11. **Full-bleed vs inset vs shadow-safe zones:** every widget must distinguish normal inset content, full-bleed dividers/bands/rails, and shadow/focus-safe interactive content. Never use a narrow clipping wrapper as a substitute for layout.
12. **No clipping as responsiveness.** Labels wrap, adapt, or receive more width. Do not solve fit with ellipsis/clip except where a deliberately truncated data label has an accessible/full alternative.
13. **No emoji in production widgets.** Use the icon system. This explicitly applies to Video Director's Studio header action and similar controls.
14. **Dense composition:** conserve vertical and horizontal space. Prefer compact components, rows, and two-column/multi-column grids over long stacks when semantics allow it.
15. **Empty/no-account states are designed states.** Disconnected, unsynced, loading, empty, blocked, stale, error and preview are distinct. Generic preview visuals may explain a widget but must be clearly marked PREVIEW/EXAMPLE/CONNECT TO PERSONALIZE and never impersonate user data.

## B. Current field-QA defects that remain the next visual repair target

The latest iPhone/Render screenshots showed a shared shell/interior geometry defect still manifesting across widgets. Treat this as a system bug first, not a collection of unrelated widget bugs.

### Shared mobile shell / clipping
- Right dashboard gutter is still visibly larger than the left. Expand the usable widget row so both outer gutters match.
- A white/invisible interior edge is still clipping right-side cards, dividers, horizontal rails, focus glows and shadows; Daily Oracle also shows left-side clipping.
- Full-bleed gradient bands and dividers in **About ViewTube** and **Daily Oracle** must reach the true interior borders.
- Focus rings/glows and component shadows need clearance without creating a fake dead strip.
- Horizontal rails such as the **Video Asset Engine** readiness asset row should use the full available width and may scroll internally without being cropped by the widget body.

### Header toggles
The canonical header toggle still needs a stronger portrait contract:
- two-line labels allowed;
- active pill remains legible;
- minimum useful label width;
- no overlap;
- no ellipsis by default;
- examples requiring re-certification: Image Generator **THUMBNAIL / END SCREEN**, Brain Hub chat/controls toggle, and other long header page labels.

### About ViewTube
- Full-bleed intro/handoff gradient areas must touch the intended interior edges symmetrically.
- Bottom divider must span the complete intended width.

### Daily Oracle
- Bottom divider still stops early.
- Channel-read percentage badge and canonical creator-context copy must not be cut off.
- Remove left/right clipping and preserve complete supporting copy.
- Keep its distinctive recommendation/quick-win/evidence structure; do not flatten it into generic cards.

### Channel Overview
- Audience and Devices visuals should render from compatible synced data when their preferred dataset is unavailable but a canonical compatible synced source exists.
- Do not show “sync this dataset” when the relevant canonical dataset is already synced.

### Video Director
- Studio header action becomes a canonical header-button component; remove emoji.
- Auto-Fill Director must not have black shadow.
- Prevent vertical collisions between rows/dividers.
- Reduce wasted vertical space without changing the Director mental model.
- Preserve its specialized visual systems and use the responsive lessons document before any global primitive change.

### Image Generator
- Portrait header toggle must fit THUMBNAIL / END SCREEN; END SCREEN may wrap to two lines.
- Collapsed widget controls must remain visible/reachable so re-expansion is always possible.

### Video Uploader / Video Manager
- Video title and description must use the same canonical input/textarea styling as Image Generator: same radius, default border logic, fill and focus behavior.
- Add Suitability label must stay inside its button.
- Published Video and Refresh controls must share height; Published Video text must be large enough.
- Details / Options / Add Suitability row needs a larger, better-proportioned primitive.
- The shared split-left primitive used by Published Video / No Changes should enlarge the icon bay and label type.
- The video selector dropdown (thumbnail + title) is a canonical compound component and must be represented in the UI Reference Library.

### Video Asset Engine
- Repair top navigation/tabs, especially the right edge.
- Full-width horizontal asset/readiness rail.
- Remove black shadow from bottom CTA.
- Preserve thumbnail-led package identity.

### Publishing Command
Redesign rather than patch:
- scope the widget to a selected video/project;
- use canonical checkbox/task primitives;
- allow tasks to be added;
- compact the checklist to eliminate excessive vertical whitespace;
- make readiness/progress respond to checklist state;
- preserve preflight/publish identity.

## C. Newly approved primitive/component donors from Creator Operations HTML

Source artifact archived in this repo at:
[Creator Operations 20 widgets mobile-fixed donor](./widget-dashboard-master-resource/artifacts/viewtube_creator_operations_20_widgets_mobile_fixed.html)

Rebuild these in ViewTube widget CSS/primitives; do **not** copy the donor's black-border styling literally.

### 1. Full-bleed labeled stage divider
Donor stages: LEAD / PROPOSAL / ACTIVE / PAID.

Canonical ViewTube version:
- full-bleed to both interior module edges;
- label type substantially larger relative to divider height;
- label uses ViewTube Ink token;
- at least three color-style variants aligned with the monochromatic widget spectrum system;
- usable as pipeline/status section divider, not tied to sponsorship semantics.

### 2. Dense data grid / table with badges
Donor: Subscriber CRM & Audience Segments table.

Canonical version:
- bordered grid cells using widget ink/spectrum tokens;
- compact multi-line cell copy;
- badge/status cell support;
- responsive behavior that preserves readable columns before considering horizontal scroll;
- appropriate for audience segments, project matrices, comparison/status tables and other dense operational data.

### 3. Checkbox-linked progress system
Donor: AI-ranked work queue.

Canonical version:
- task rows use the real ViewTube checkbox primitive;
- progress fill is derived from checked/completed task state;
- add/remove/check operations update progress deterministically;
- supports semantic badges and compact completion summary;
- suitable for Publishing Command and other readiness/workflow widgets.

### 4. Grid calendar
Donor: Content Calendar & Project Planner.

Canonical version:
- week/month grid cells;
- colored task/event chips using spectrum tags;
- compact date headers;
- current selection and overflow states;
- responsive phone behavior that preserves calendar identity;
- candidate owner for Publishing Calendar / planning surfaces and UI Reference Library.

These four components must be added to the canonical primitive/component set and to the UI Reference Library with interactive examples and mobile states.

## D. Settings widget status and target

Settings is now a dedicated widget owner and should remain the **Dashboard Control Switchboard**, not a second full Settings page.

Pages:
- DASHBOARD
- DATA
- AI
- ACCOUNT

Continue to compact it aggressively:
- controls that can share a row should share a row;
- Dashboard Controls + Layout Lock should use a dense two-column/row treatment where space allows;
- preset buttons should not consume oversized vertical bands;
- header page toggle must fit complete labels;
- keep registered/visible/hidden counts and layout state;
- preserve Focus / Creation / Analytics / All presets;
- preserve import/export/reset, layout lock, show-all and full-settings handoff;
- disconnected Data/AI states show generic labeled previews rather than blank panels.

## E. Widget consolidation direction

High-value consolidation decisions remain:
- Daily Oracle + Next Best Action → Daily Oracle;
- Alerts Feed + News Ticker → one alert/event stream;
- Video Uploader + Publishing Command → Video Publisher with prep/preflight/publish pages;
- Keyword Engine + Keyword Overlap → Keyword Intelligence;
- Title Rewriter + Description Editor + Tag Generator + Hashtag Analyzer → Metadata/SEO Workbench;
- Retention Dip + Algo Benchmark + Retention Simulator → Retention Lab;
- Mini Calendar + Upload Scheduler → Publishing Calendar;
- Audience Matrix + Device Matrix + Guest Ratio → Audience Intelligence;
- Traffic Sources + Playback Origins + Sharing DNA + Bridge Efficiency → Discovery & Distribution;
- Revenue Tracker + Revenue Momentum + Ad Stack + CPM Geography + Premium Pulse → Monetization Intelligence;
- Comment Responder + Video Comment Operator → Comment Operations;
- Task Stack + Content Pipeline → Content Pipeline with task lane;
- Recent Uploads + Top Performer → optional Video Performance Shelf.

Do not merge Brain Hub with Daily Oracle, Video Manager with Publisher, Video Autopsy with Video Manager, Opportunity Radar with Anomaly Radar, Video Director with Editor, or UI Reference Library with Settings.

## F. Archived design/resource artifacts now in main docs

Conversation/Library artifacts copied into the repository for durable handoff:

- [viewtube_master_micro_dense_compositions.html](./widget-dashboard-master-resource/artifacts/viewtube_master_micro_dense_compositions.html)
- [DASHBOARD_WIDGET_AND_40_SIGNATURE_SYSTEMS_CATALOG.html](./widget-dashboard-master-resource/artifacts/DASHBOARD_WIDGET_AND_40_SIGNATURE_SYSTEMS_CATALOG.html)
- [ViewTube-All-190-Widgets-Source-Faithful-Gallery-and-Consolidation-Plan.html](./widget-dashboard-master-resource/artifacts/ViewTube-All-190-Widgets-Source-Faithful-Gallery-and-Consolidation-Plan.html)
- [viewtube_creator_operations_20_widgets_mobile_fixed.html](./widget-dashboard-master-resource/artifacts/viewtube_creator_operations_20_widgets_mobile_fixed.html)
- [STANDALONE_HTML_PROTOTYPE_INVENTORY_EXTRACT.md](./widget-dashboard-master-resource/library-extracts/STANDALONE_HTML_PROTOTYPE_INVENTORY_EXTRACT.md)
- [ViewTube Widget Master Resource Guide 2026-09-11 extract](./widget-dashboard-master-resource/library-extracts/ViewTube_Widget_Master_Resource_Guide_2026-09-11_EXTRACT.md)

Existing repository references that remain important:
- [Widget Dashboard Optimization Plan](./VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md)
- [Widget System Certification Master](./WIDGET_SYSTEM_CERTIFICATION_MASTER_2026-09-14.md)
- [Post-current Consolidation Plan](./VIEWTUBE_WIDGET_POST_CURRENT_CONSOLIDATION_PLAN_2026-09-24.md)
- [Shorts Multiplier notes](./SHORTS_MULTIPLIER_WIDGET_NOTES_2026-09-24.md)
- [Toolbox UI Master Resource](./VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md)
- [Studio Hub Component Library source of truth](../ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md)
- [Widget dashboard system skill](../../.claude/skills/viewtube-widget-dashboard-system/SKILL.md)
- [Current widget inventory](../../.claude/skills/viewtube-widget-dashboard-system/references/current-widget-inventory.md)
- [Source-code map](../../.claude/skills/viewtube-widget-dashboard-system/references/source-code-map.md)
- [Futures/prototypes/reference atlas](../../.claude/skills/viewtube-widget-dashboard-system/references/futures-prototypes-and-reference-atlas.md)
- [Video Director responsive lessons](../../.claude/skills/viewtube-widget-dashboard-system/references/video-director-responsive-lessons.md)
- [Governance widget library](../../governance/widget-library/README.md)

## G. Runtime ownership map for the next agent

Start here before editing:
- `src/views/dashboard/WidgetRegistryBase.ts`
- `src/views/dashboard/WidgetRegistry.ts`
- `src/views/dashboard/WidgetRendererBase.tsx`
- `src/views/dashboard/WidgetRenderer.tsx`
- `src/views/dashboard/WidgetShell.tsx`
- `src/views/dashboard/DashboardCanvas.tsx`
- `src/views/dashboard/widget-entry.css`
- `src/views/dashboard/WidgetPrimitives.tsx`
- `src/components/UIReferenceLibraryContent.tsx`
- `src/views/dashboard/widgets/UIReferenceLibraryWidget.tsx`
- `src/views/referenceStudio/WidgetLabV2.tsx`
- widget-local TSX/CSS under `src/views/dashboard/widgets/`.

High-risk areas:
- global overflow/clipping;
- mobile width hack and dashboard gutter math;
- shared header toggle sizing;
- split-left button geometry;
- input/textarea focus geometry;
- shell collapse/control-panel interaction;
- widget CSS ownership overlap.

A local widget problem must not weaken a shared primitive guarantee. Before changing shared CSS, inspect consumers and add/adjust contract tests.

## H. Next implementation sequence

### Wave 0 — geometry + primitive correction (implemented; visual certification pending)

1. ✅ Remove the asymmetric mobile dashboard reclaim that pushed widget shells beyond the right viewport edge.
2. ✅ Normalize explicit **inset / full-bleed / shadow-safe** interior geometry so full-width surfaces do not borrow shadow/scroll clearance.
3. ✅ Upgrade the canonical **header toggle** to an intrinsic-width animated indicator that follows the selected label.
4. ✅ Correct canonical **split-left** proportions and add deliberate two-line labels for narrow actions.
5. ✅ Promote Comment Responder donor patterns into shared primitives: **video mini-card, split counter badge, speech bubble**, plus multiline split-button usage.
6. ✅ Upgrade the video selector with a square split-left bay, larger VIDEO/chevron treatment, larger option titles, and a portalled up/down menu that escapes widget clipping.
7. ✅ Make spectrum split badges use **global VT Ink** for glyph/text/divider ownership.
8. ✅ Increase compound data-grid/calendar type and align full-width section bands to the real body inset.
9. ⏳ Finalize legacy upload/file frames on the Toolbox-style solid-frame contract and enlarge/non-grey UI Reference Library supporting labels — **PR #456**.
10. ⏳ Capture built-app acceptance evidence at **1440×1000** and **390×844** before declaring Wave 0 complete.

### Wave 1 — remaining widget/system certification

11. Re-unify canonical **text input + textarea** geometry/focus treatment.
12. Re-certify About ViewTube and Daily Oracle full-bleed bands/dividers against the new shell contract.
13. Repair Video Asset Engine tabs/rail/CTA shadow.
14. Redesign Publishing Command around selected video/project + addable checklist + checkbox-driven readiness progress.
15. Repair Video Director Studio header button, spacing and shadow ownership.
16. Fix Image Generator portrait toggle and collapsed-controls recovery.
17. Certify the top widget cohort across width × height × disconnected/loading/empty/error/mobile states.
18. Continue renderer/registry extraction, CSS ownership cleanup and persisted settings/schema migration work identified by the unfinished-work audit.
19. After geometry certification, resume the planned **WidgetPreviewState** system and Settings Widget certification rather than adding new one-off widgets.

## I. Completion protocol

For every widget/system change:
- record files/selectors/tokens changed;
- record whether the change is shared or widget-local;
- update relevant tests;
- verify desktop, 390×844 portrait and phone landscape;
- verify min/default/max width and height plus one asymmetric state;
- verify disconnected/loading/empty/error where applicable;
- verify no authored black UI;
- verify no clipped labels, focus rings, glows or shadows;
- verify one intentional scroll owner;
- update this living master resource and the widget skill when the rule is systemic.

**Handoff principle:** preserve **TOKENS → CODED PRIMITIVE → UI REFERENCE LIBRARY → PRODUCTION CONSUMER** alignment. A screenshot-only fix that bypasses this chain is incomplete.


## J. 2026-09-26 field-QA correction receipt

**Source:** creator-supplied iPhone screenshots of the live Dashboard and UI Reference Library.  
**Scope:** shared shell/primitive correction, not widget-local cosmetic patching.

### Implemented shared corrections

- Mobile dashboard now uses the real viewport width rather than asymmetric left/right reclaim expansion.
- Widget interior geometry separates normal inset content from full-width surfaces and shadow-safe clearance.
- Header toggles size the selected indicator to the selected word instead of forcing equal segments.
- Split-left actions support deliberate two-line copy and keep the icon bay structurally square.
- Comment Responder donor patterns are available from the canonical primitive surface and demonstrated in the UI Reference Library.
- Video selector menus are portalled above widget overflow and can open upward or downward according to available viewport space.
- Spectrum split badges use ViewTube Ink instead of inheriting a cyan/widget-local foreground.
- Compound bands/data grids/calendars use larger typography and the real full-width interior geometry.
- Legacy upload-frame finalization and UI Reference Library caption cleanup are isolated in draft PR #456.

### Verification state

At PR #456 head `e27b43c7b4746b3312283372593db2fd1d24064c`:
- **source-governance:** pass
- **focused-contracts:** pass
- **local-smoke:** pass
- **production-build:** pass
- **full-suite:** failing on unrelated current-main Vault/Editor/navigation/VT-SYNC assertions
- **static-quality/typecheck:** failing on unrelated current-main Editor/Vault/Brain/template type debt
- **visual evidence:** pending; this wave remains **partial** until built-app desktop + phone captures prove the visible changes.

Do not reopen the old asymmetric reclaim or negative-margin/shadow-clearance geometry as a local widget fix. Any regression must be corrected at the canonical shell/primitive owner first.


---

## K. Subtractive Widget Architecture — governing direction

**Approved:** 2026-09-26  
**Status:** ACTIVE GOVERNING DIRECTION

The Dashboard program now adopts **subtractive optimization** as a primary engineering principle.

### K.1 Core rule

> **A new or redesigned widget consumes the canonical system by default. It does not create a new component system, primitive family, color system, size system, grid system, responsive system, or CSS architecture merely to achieve its interior design.**

The default implementation path is:

`REFERENCE LIBRARY CONTRACT → CODED PRIMITIVES → COMPOSITION RECIPE → WIDGET INTERIOR → DOMAIN DATA/ACTIONS`

A widget may add domain-specific composition and signature visualization. It should not restyle standard controls privately.

### K.2 Subtractive budget

For every widget redesign, explicitly report:

- canonical primitives reused;
- existing archetype/composition recipes reused;
- widget-local CSS removed;
- legacy selectors removed;
- duplicate components removed;
- new CSS selectors added;
- new component files added;
- exceptions requiring new primitives.

A redesign that adds more system-level CSS/components than it removes must explain why reuse was insufficient.

**Preferred result:** fewer selectors, fewer private components, fewer duplicated states, and fewer independent sizing rules after the redesign than before it.

### K.3 New primitive admission gate

A new primitive/component may be added only when all are true:

1. no canonical Reference Library component performs the same interaction;
2. the need occurs, or is expected to occur, in multiple production surfaces;
3. it has a stable semantic job rather than a one-widget visual preference;
4. its sizes, states, accessibility and responsive behavior can be specified centrally;
5. it is added to the UI Reference Library;
6. at least one production consumer uses it;
7. equivalent private implementations are scheduled for removal.

Otherwise compose existing primitives.

### K.4 CSS admission gate

Widget-local CSS is reserved for:

- unique domain visualization geometry;
- signature composition not expressible through the standard grid/archetype contract;
- data-driven visual encoding;
- narrowly scoped exception proven necessary by certification.

Widget-local CSS should **not** redefine buttons, inputs, dropdowns, tabs, badges, switches, typography ladders, spacing scales, borders, radii, shadows, standard grids, standard states, or responsive component sizing.

---

## L. Reference Library → Widget Interior automatic composition system

### L.1 Objective

Turn the UI Reference Library from a passive catalog into the **executable source for widget interior construction**.

A widget designer should primarily choose:

1. widget archetype;
2. spectrum identity;
3. interior grid recipe;
4. canonical components;
5. semantic component roles;
6. domain data/actions;
7. signature visualization, if needed.

The system supplies component style, allowed sizes, typography, states, spacing, alignment, responsive transformations and transitions.

### L.2 Proposed executable contract: Widget Interior Manifest

Each redesigned widget should progressively move toward a declarative manifest similar to:

```ts
type WidgetInteriorManifest = {
  archetype: WidgetArchetype;
  tone: SpectrumTone;
  grid: WidgetGridRecipe;
  regions: WidgetRegion[];
  responsivePolicy: WidgetResponsivePolicy;
};

type WidgetRegion = {
  id: string;
  row?: number;
  column?: number;
  columnSpan?: number;
  rowSpan?: number;
  role: "primary" | "secondary" | "control" | "visual" | "status" | "footer";
  component: CanonicalWidgetComponentId;
  sizePolicy: "auto" | "compact" | "standard" | "large" | "hero";
  equalGroup?: string;
};
```

This is a target architecture, not permission to introduce a second renderer prematurely. Begin by expressing these rules through existing primitives, CSS custom properties and archetype classes; extract a manifest runtime only after at least three widgets prove the pattern.

### L.3 Reference Library component registry

The Reference Library should expose machine-readable metadata for every canonical component:

- stable component ID;
- React owner;
- semantic job;
- allowed 18 / 24 / 32 / 38px size classes where applicable;
- typography token for each size;
- min/preferred/max width;
- aspect/ratio constraints;
- permitted variants;
- spectrum/tone behavior;
- default gap;
- focus/hover/active/disabled/loading states;
- coarse-pointer behavior;
- compact/standard/wide composition behavior;
- whether width may stretch;
- whether height may stretch;
- whether labels may wrap;
- accessibility contract.

Production widgets and Reference Library examples consume the **same metadata and same React primitives**. The Reference Library must never become a visually similar parallel implementation.

### L.4 Automatic widget interior workflow

When creating/redesigning a widget:

1. classify its user job and archetype;
2. select a standard grid recipe;
3. map each required interaction to an existing canonical component ID;
4. assign semantic regions and equal-size groups;
5. choose the widget spectrum identity;
6. allow the composition system to resolve component sizes from available container geometry;
7. add only the unique signature functional/visual component;
8. connect domain data/actions;
9. run dimension and state certification;
10. reject private component/CSS additions that duplicate canonical owners.

---

## M. Uniform Widget Interior Grid System

### M.1 Grid principle

Every widget interior uses a deterministic nested grid.

The dashboard continues to use its outer **24-column macro grid**. Inside a widget, the canonical interior grid should use **12 columns** with a **4px base unit**, allowing dense subdivision while remaining compatible with 8 / 12 / 24px spacing.

Default interior geometry:

- 12 logical columns;
- 4px base spatial unit;
- 8px dense gap;
- 12px standard gap;
- 24px major-region gap only when the widget size supports it;
- row height determined by canonical component size or explicit content region;
- no arbitrary margins used to force alignment.

### M.2 Row equality rule

Components sharing a visual row must normally share:

- control height;
- baseline;
- vertical padding family;
- type-size tier;
- radius family;
- stroke tier.

A 24px button should not casually sit beside a 38px select in the same control row.

If a row intentionally mixes sizes, the manifest/composition must identify a dominant alignment rule and the difference must communicate hierarchy.

### M.3 Column equality rule

Repeated components in the same column family should share:

- width behavior;
- internal horizontal padding;
- label/value alignment;
- type tier;
- comparable component density.

For paired or repeated columns, combined heights including gaps must align at the next shared grid boundary.

### M.4 Equal-group contract

Components can declare an `equalGroup`.

Members of an equal group resolve to the same:

- rendered height;
- width when in equivalent columns;
- component-size tier;
- text tier;
- vertical alignment.

Examples:

- a row of three actions;
- KPI tiles;
- paired selects;
- Details / Options / Suitability actions;
- Published Video / Refresh;
- two-column settings controls.

### M.5 No accidental empty geometry

A widget should not contain unexplained blank vertical bands caused by fixed component heights or old margins.

Space must belong to one of:

- grid gap;
- deliberate breathing region;
- scroll viewport;
- visualization;
- reserved state region.

---

## N. Two-dimensional widget resizing contract

### N.1 Independent axes

Widget width and height are independent inputs.

A widget must be able to move:

- narrower;
- wider;
- shorter;
- taller;

within its declared supported dimension matrix without losing its identity, controls, hierarchy or primary function.

### N.2 Responsive composition is container-driven

Internal composition responds to the widget's actual allocated dimensions, not merely viewport width.

Each archetype defines four composition modes:

1. **COMPACT**
2. **STANDARD**
3. **EXPANDED**
4. **HERO**

These are composition/component-density modes, not separate widget implementations.

### N.3 Continuous resize + discrete morph

Resizing has two simultaneous behaviors:

**Continuous geometry**
- grid tracks, gaps, region widths and flexible visuals interpolate smoothly;
- components that permit stretch adjust within their min/max width;
- chart/media regions preserve their declared ratio or crop policy;
- transitions use transform/size/opacity where appropriate.

**Discrete primitive morph**
- when geometry crosses a canonical threshold, controls switch to the matching canonical component size/style;
- the supported component ladder remains **18 / 24 / 32 / 38px** where applicable;
- typography changes with the canonical size token;
- no arbitrary 27px/31px/35px private variants are generated.

This provides smooth resizing while preserving a small, testable component system.

### N.4 Hysteresis

Component-size thresholds should use a small hysteresis band so a control does not rapidly oscillate between sizes while a user drags around a breakpoint.

Example concept:

- enter STANDARD at threshold X;
- remain STANDARD until shrinking below X minus the hysteresis margin.

### N.5 Layout morph examples

A four-action region may become:

- HERO: one row, 4 × large/38 controls;
- EXPANDED: one row, 4 × 32 controls;
- STANDARD: two rows, 2 × 2 using 24/32 controls;
- COMPACT: two rows or compact rail using 24 controls.

A KPI region may become:

- 4-up;
- 2 × 2;
- 2-up scroll/stack only when the archetype permits it.

The semantic order never changes arbitrarily.

### N.6 Animation contract

Resize/morph animation should be centralized.

Target behavior:

- approximately 180–240ms for component/layout settling;
- CSS custom properties/classes rather than widget-local animation code;
- animate dimensions/transforms/opacity only where motion remains readable;
- avoid animating every text metric continuously;
- respect `prefers-reduced-motion`;
- drag-resize may use immediate geometry with a short settle animation after threshold changes to avoid sluggish direct manipulation.

---

## O. Widget Archetype + Grid recipes

Every production widget should ultimately declare one primary archetype:

1. **KPI / Score**
2. **Chart / Analytical**
3. **Feed / Queue**
4. **Matrix / Comparison**
5. **Workflow / Pipeline**
6. **Generator / Editor**
7. **Command / Control**
8. **Media / Asset**

Each archetype owns:

- interior grid template;
- COMPACT / STANDARD / EXPANDED / HERO compositions;
- allowed scroll ownership;
- default state placement;
- skeleton family;
- preview/no-account recipe;
- standard control regions;
- supported component-size transitions;
- minimum useful geometry;
- accessibility expectations.

Widgets own domain content and their unique signature component, not a new layout language.

---

## P. Skill workflow addition — Subtractive Widget Design

The canonical widget skill must include this workflow before implementation:

### Step 1 — RECON
Inspect:

- current widget;
- Reference Library;
- canonical primitive owners;
- closest archetype;
- existing grid recipes;
- related widget implementations;
- widget-local CSS.

### Step 2 — REUSE MAP
Create a table:

`Need | Existing primitive/component | Existing recipe | Reuse? | Exception reason`

No implementation begins until standard owners have been checked.

### Step 3 — DELETE PLAN
Identify before coding:

- private components to remove;
- widget-local selectors to remove;
- legacy selectors made obsolete;
- duplicated responsive rules to remove.

### Step 4 — GRID SPEC
Define:

- 12-column regions;
- rows;
- equal groups;
- min/default/max dimensions;
- compact/standard/expanded/hero transformations;
- scroll owner.

### Step 5 — RED TESTS
For behavior changes, add failing tests first covering:

- dimension resolution;
- equal-group sizing;
- component-size threshold changes;
- semantic order through layout morphs;
- reduced-motion behavior where testable.

### Step 6 — IMPLEMENT BY COMPOSITION
Use Reference Library primitives first. Add domain logic and signature visualization. Do not add a private control implementation.

### Step 7 — SUBTRACT
Delete the superseded CSS/components in the same change where safe.

### Step 8 — CERTIFY
Verify:

- min/default/max width;
- min/default/max height;
- at least one asymmetric width × height combination;
- resizing in both directions;
- all relevant data states;
- 1440×1000;
- 390×844;
- phone landscape;
- keyboard/coarse pointer/reduced motion;
- no clipping;
- one scroll owner.

### Step 9 — RECORD
Update this resource with:

- before/after file counts;
- CSS selector delta;
- primitive reuse;
- exceptions;
- captures/tests;
- remaining debt.

---

## Q. Subtractive Dashboard Work Queue

### P0 — architecture
- [ ] Add machine-readable metadata to canonical Reference Library components.
- [ ] Establish canonical 12-column widget interior grid utilities/recipes using existing CSS architecture rather than another parallel stylesheet.
- [ ] Add archetype metadata to production widget definitions.
- [ ] Add COMPACT / STANDARD / EXPANDED / HERO composition policy.
- [ ] Centralize component-size threshold resolution and hysteresis.
- [ ] Centralize resize/morph motion and reduced-motion behavior.
- [ ] Add equal-group row/column geometry contracts.

### P0 — deletion
- [ ] Measure legacy `toolboxWidgetSystem.css` ownership remaining.
- [ ] Move owned rules into existing canonical owners and delete equivalent legacy rules in the same waves.
- [ ] Block new private control styling in widget-local CSS.
- [ ] Block new raw black UI, raw spectrum values and unjustified `!important`.
- [ ] Track CSS/component **net delta** per widget redesign.
- [ ] Delete `toolboxWidgetSystem.css` once parity is proven.

### P1 — migration
- [ ] Convert Settings to the new interior grid/equal-group contract as first reference implementation.
- [ ] Convert one KPI widget, one chart widget, one workflow widget and one media widget.
- [ ] Use those four migrations to finalize the eight archetype recipes.
- [ ] Migrate the remaining supported cohort in bounded groups.
- [ ] Fold repeated widget-local responsive rules back into archetype owners.

### P1 — responsive certification
- [ ] Certify horizontal and vertical resizing independently.
- [ ] Certify every declared dimension pair.
- [ ] Add drag-resize threshold/morph acceptance coverage.
- [ ] Verify animation and reduced-motion behavior.
- [ ] Verify labels wrap rather than clip during morphs.

### P1 — system completion
- [ ] Implement canonical `WidgetPreviewState`.
- [ ] Finish System Health / Diagnostics widget.
- [ ] Continue planned widget consolidation before adding new IDs.
- [ ] Complete Top-40/190 donor classification, then close the historical atlas backlog.

---

## R. Updated definition of a finished widget

A widget is not finished merely because it renders.

A canonical widget:

1. uses the shared shell;
2. uses Reference Library primitives for standard interactions;
3. declares an archetype;
4. follows the canonical interior grid;
5. has explicit equal groups where appropriate;
6. supports its declared width × height matrix;
7. morphs through canonical component sizes instead of private variants;
8. has designed data states including preview where applicable;
9. has one intentional scroll owner;
10. adds no duplicate component/CSS system;
11. removes superseded private implementation where safe;
12. passes functional, responsive, mobile, visual, accessibility and production certification.

**New governing metric:** dashboard quality is measured partly by what can be removed. A successful redesign should normally reduce local styling and duplicated implementation while increasing capability and consistency.
