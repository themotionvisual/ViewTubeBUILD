# Data, actions, integrations, and functional systems

A ViewTube widget is a functional creator tool, not merely a visualization.

## Canonical data flow

Preferred path:

`SOURCE -> CANONICAL DATASET -> SELECTOR/ADAPTER -> WIDGET VIEW MODEL -> VISUAL/CONTROL`

Do not create a widget-specific data store or private query path when canonical data already exists.

Compatible imported data should remain usable when a preferred API source is unavailable.

Always preserve provenance/freshness.

## Common source families

Depending on the widget, inspect:

- YouTube Data API / channel metadata;
- YouTube Analytics / VT-SYNC canonical datasets;
- imported Studio CSV/Sheets data;
- Projects;
- Creator Brain / evidence;
- comments/community data;
- Vault/assets;
- Editor/project state;
- Publisher/scheduling;
- local/manual widget state;
- Gemini/AI generation.

Do not infer that a registry dependency is the only source. Inspect current adapters and use the real runtime contract.

## Data-state contract

Implement deliberate states when relevant:

- loading;
- ready;
- empty;
- disconnected/blocked;
- stale;
- partial/imported;
- error.

These states are semantically different.

### Disconnected is not empty

A disconnected YouTube account should normally preserve the recognizable widget UI and show:

- what data/action requires connection;
- what local/imported functionality still works;
- a clear recovery action.

Do not replace the tool with a blank "connect" card if the interface can remain useful.

### Empty is not error

No rows, no comments, no videos, no alerts, or no schedule items may be a valid state.

Show an intentional empty composition with next-step guidance.

### Stale is not disconnected

If cached/imported data exists, render it with freshness/provenance rather than pretending no data exists.

## Action hierarchy

Every widget should identify:

- primary action;
- supporting actions;
- destructive/external actions;
- automatic background behavior.

External or destructive actions require appropriate confirmation/approval.

## Handoffs

Use ViewTube's tool-chain/handoff registry where applicable:

[src/services/viewTubeToolChains.ts](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/services/viewTubeToolChains.ts)

A widget may:

- accept video context;
- accept thumbnail/image assets;
- accept project context;
- accept comments;
- accept evidence/analysis;
- accept metadata;
- produce an asset;
- produce analysis;
- produce a project action;
- produce metadata;
- produce a comment/community post;
- open another tool with context.

Do not hand off plain text when a typed/domain payload exists.

## Brain / AI integration

AI-enhanced widgets should provide domain context rather than opening a generic chat surface.

Relevant context may include:

- selected video;
- selected asset;
- active project;
- time window;
- current filters;
- analytics evidence;
- audience segment;
- prior action/result;
- channel profile;
- user goal.

AI output should be traceable to evidence where the task is analytical.

Useful AI functions include:

- explain;
- summarize;
- rank;
- compare;
- generate;
- rewrite;
- classify;
- propose next action;
- create a draft artifact.

Do not let AI silently execute irreversible external actions.

## Creator workflow loop

When useful, connect widgets into the larger product loop:

`VT-SYNC -> Analytics -> Brain -> Projects -> Studio/Canvas -> Vault -> Editor -> Publisher -> Audience/Comments -> Learning`

A widget should know where its input came from and where its output can go.

## Function-first signature systems

Examples of useful signature systems:

- Channel Progress: target trajectory and milestone state.
- Comment Responder: comment queue + reply/recommendation workflow.
- Image Generator: prompt/style controls + generation preview + handoff actions.
- Video Manager/Uploader: selected video/thumbnail + metadata/publish workflow.
- Brain Hub: memory/directive/evidence/reflection controls.
- Upload Scheduler: weekly planner/queue.
- Anomaly Radar: anomaly field with evidence and action path.
- Audience Requests: request clusters/evidence + project handoff.
- Content Pipeline: production-stage flow + navigation.
- Video Director: brief + storyboard + variation + execution queue.

Use these as examples of function-driven identity, not templates.

## State persistence

Persist local widget state only when it improves continuity.

Good candidates:

- current page/mode;
- selected time window;
- filters/sort;
- selected item;
- draft input;
- presets;
- expanded disclosure;
- working comparison.

Do not persist transient loading/error states.

## Automation and batch features

Consider:

- multi-select;
- batch action;
- bulk tagging;
- batch scheduling;
- saved presets;
- reusable prompt/settings packs;
- repeat last action;
- apply to selected videos;
- queue processing.

Batch features must still expose progress, per-item errors, and recovery.

## Preview-before-execute

For consequential generation/publishing/editing:

1. configure;
2. preview;
3. validate/preflight;
4. execute with approval;
5. show result;
6. allow recovery/next handoff.

This is especially important for:

- publishing;
- metadata edits;
- AI-generated images/text;
- scheduling;
- external comments/posts;
- destructive asset actions.

## Useful defaults

Defaults should come from reliable context when possible:

- recent selected video;
- active project;
- current dashboard time window;
- channel-default format;
- last-used mode;
- safe publishing defaults;
- canonical dataset.

Do not use stale or speculative defaults that can surprise the creator.

## Provenance and confidence

Analytical/intelligence widgets should expose:

- source;
- time window;
- freshness;
- confidence/uncertainty when applicable;
- missing data;
- contradictions;
- links to inspect underlying analytics.

Avoid presenting inferred AI analysis as raw measurement.

## No hidden functionality

If a widget exposes a control, it must work.

Do not render:

- dead buttons;
- decorative toggles;
- fake filters;
- non-functional pagination;
- placeholder action menus

as if production-complete.

Prototype behavior must be labeled/contained.

## Performance

Hidden/collapsed widgets should avoid unnecessary:

- polling;
- observers;
- animation;
- media loading;
- AI calls;
- large data transformations.

Lazy-load heavy widget implementations and libraries.

## Useful references

- [VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md)
- [ASSET_ENGINE_CANONICAL_BACKBONE.md](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/brain/ASSET_ENGINE_CANONICAL_BACKBONE.md)
- [PHASE_1_CLOSEOUT_PHASE_2_START.md](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md)
- [VIEWTUBE_AI_BRAIN_SYSTEMS_AUDIT_AND_MODERNIZATION_REFERENCE_2026-09-11.md](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md)
- [WidgetRegistry.ts](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/WidgetRegistry.ts)
- [useDashboardData.ts](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/useDashboardData.ts)
