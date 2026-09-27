# ViewTube Product Architecture

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-27  
**Class:** PRODUCT_ARCHITECTURE  
**Status:** ACTIVE  
**Concern:** creator lifecycle, Master Tools, capabilities, product boundaries, and canonical system topology  
**Owner:** Product Architecture  
**Registry ID:** DOC-ARCH-PRODUCT  
**Last Audited Main SHA:** 3ed2bc91f324338fd110a160d65ddbed93806142
**Supersedes:** docs/architecture/VIEWTUBE_MASTER_PRODUCT_TOOLS_WORKSTATION_ARCHITECTURE.md after migration certification  
**Consolidates:** durable target architecture from docs/architecture/VIEWTUBE_SYSTEM_CONVERGENCE_AND_CONSOLIDATION.md  
**Related Authorities:** docs/architecture/capabilities.json; docs/programs/INTEGRATED_APPLICATION.md; scoped Domain Authorities

## Product rule

ViewTube is one creator workstation with many specialized surfaces. Deep modules keep narrow canonical ownership; pages, widgets and tools consume capabilities rather than becoming independent products or truth stores.

## Creator lifecycle

Discover → Validate → Design → Produce → Assemble → Package → Publish → Engage → Learn → Operate.

## Master Tools

1. Opportunity Radar
2. Channel Intelligence Hub
3. Content Strategy Lab
4. Project & Production Command
5. Script & Story Studio
6. Visual Development Studio
7. Vault & Asset Engine
8. Video Director & Editor
9. Packaging & Experiment Lab
10. Publisher & Distribution Center
11. Audience & Community Desk
12. Monetization & Operations Hub

Master Tools are product groupings, not backend owners. Widgets are views into capabilities, not separate products.

The compact-widget versus full-workstation boundary and reusable cross-tool workflow recipes are specified in `docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md`. That specification is subordinate to this architecture: a promoted Toolbox remains a surface over existing capabilities, and a workflow recipe remains orchestration over existing owners rather than a new domain or persistence system.

## Six canonical convergence systems

### 1. Creator Context & Knowledge
Resolves creator/channel facts, validated knowledge, style, goals, active Project/ContentBuild, current surface/selection and personalization permissions. Context may reference evidence but does not own evidence.

### 2. Evidence & Intelligence
Separates measured evidence, deterministic derived signals, and specialist interpretation. analytics-canon remains analytics truth. Statistics, Audience, Channel, Opportunity, Algorithm and other specialists remain modules rather than competing truth stores.

### 3. Project / Content / Asset Graph
Project owns workflow planning. ContentBuild owns durable evolving content identity. Asset Engine owns artifact lifecycle/lineage/version/variant semantics. Vault is the browse/search/manage/storage experience over the same asset identities. Video, Publishing, Launch and tool packages should increasingly be projections rather than copied state universes.

### 4. Creator Operations & Generation
Provides one operation/provenance contract for reasoning operations, generation, transforms, render jobs, research, tool handoffs and external execution. Existing ActionPacket, GenerationRecord and ToolReceipt concepts may converge through shared operation identity without forcing an unsafe immediate storage rewrite.

### 5. Outcomes, Evaluation & Learning
Unifies producer contracts and lifecycle across actions, outcomes, evaluations, learning candidates and governed promotion. One-off correlations or successes never silently become durable Channel Knowledge.

### 6. Brain Runtime & Experience
All creator-facing AI surfaces route through the shared BrainRuntime/BrainModelGateway/task-capability experience contract. UI requests capabilities; UI does not assemble bespoke provider stacks.

## Boundaries that remain distinct

- Analytics truth vs Intelligence interpretation.
- Creator Knowledge vs Evidence.
- Project vs ContentBuild.
- Asset Engine semantics vs Vault library/storage UX.
- Brain orchestration vs specialist intelligence.
- AI/recommendation vs Publishing/external side effects.
- Domain architecture vs Task/mission status.
- Product capability vs UI surface.

## Canonical ownership laws

- Unionize capabilities, not owners.
- Prefer projection over synchronization.
- Prefer shared contracts over giant files.
- External side effects keep strict owners.
- Models do not own calculations, permissions, durable knowledge, or task truth.
- Current code/tests/runtime may prove implementation; they do not redefine intended product architecture silently.
- A new capability must reconcile against existing capabilities and owners before acceptance.

## Capability model

Capabilities are durable abilities with stable CAP IDs. A capability has one canonical owner, may participate in multiple Master Tools/domains/lifecycle stages, and may have many tasks. Task turnover never changes capability identity.

Machine registry: docs/architecture/capabilities.json.

## Change protocol

Any proposed feature/system/integration/design must be classified as:
- existing capability extension;
- new accepted capability;
- implementation of an accepted capability;
- product-surface redesign;
- consolidation/simplification;
- experimental opportunity.

Before creating a new capability, reconcile current Product Architecture, Capability Registry, Domain Authority, Task Index, active mission/PR and donor artifacts.


## Strategic master sources

Before major feature/tool/system ideation, consolidation, creator-workstation redesign, AI/agent architecture expansion, API/integration planning, analytics invention, monetization architecture, or product-roadmap work, consult:

- `docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md` — MASTER_SOURCE tier; broad research and construction blueprint containing the feature-canon methodology, master-tool consolidation model, API/capability atlas, Channel Brain and agent architecture, analytics/visualization framework, creator-workflow model, infrastructure/economics/governance research program, and final master-document production blueprint.

Use it to challenge and improve the current architecture. Promote accepted improvements through this document, the Capability Registry, Domain Authorities, Decision records, Integrated Application Program, and Task Index rather than treating source proposals as automatically canonical.


## Page-surface feature opportunity registry

**Intake date:** 2026-09-27  
**Status:** EXPERIMENTAL OPPORTUNITY CATALOG — immediately eligible for reconciliation, planning and task promotion; not an implementation claim.  
**Purpose:** preserve high-value page/tool ideas in the canonical product architecture so future development can discover, compare, consolidate and promote them without creating parallel systems.

### Promotion rule

Every item below is a **surface proposal**, not automatically a new backend capability. Before implementation:

1. reconcile it against \`docs/architecture/capabilities.json\`;
2. attach it to the owning Domain Authority and existing task/mission where one exists;
3. reuse canonical Project/ContentBuild, Asset Engine/Vault, analytics-canon, BrainRuntime, outcome/evaluation, widget, publishing and UI contracts instead of creating duplicate owners;
4. classify the work as capability extension, accepted new capability, implementation, surface redesign, consolidation, or experiment;
5. create exact implementation tasks in Task Authority only after the owning systems and acceptance boundary are known;
6. update the User Guide projection when creator-facing behavior ships;
7. verify data → logic → UI → outcome, plus mobile/accessibility where applicable.

### Page owner / code crosswalk

| Page | Primary product/domain authority | Current code / registry anchors |
| --- | --- | --- |
| Dashboard | \`docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_MASTER_RESOURCE.md\` | \`src/views/dashboard/WidgetRegistry.ts\`, \`WidgetRenderer.tsx\`, \`DashboardCanvas.tsx\`, widget certification/storage contracts |
| Studio | Product Architecture + Projects/ContentBuild + Brain + Asset Engine + Toolbox UI | \`src/views/StudioHub.tsx\`, \`src/services/superToolRegistry.ts\`, \`src/app/superToolViewRegistry.ts\`, Studio Hub component/toolbox authorities |
| Projects | \`docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md\` | \`src/components/projects/ProjectBuilder.tsx\`, \`src/views/ProjectCalendarPage.tsx\`, ContentBuild/identity services |
| Analytics | \`docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md\` | \`src/services/analytics-canon/**\`, \`VT_SYNC_VISIBLE_TABLE_DEFINITIONS\`, VT-SYNC sync/query registries, Data Visual contracts |
| Editor | \`docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md\` | \`EditorV1Page\`, responsive/mobile editor store/shell, shared editor contracts, Remotion render path |
| Vault | Asset Engine authority + \`docs/handoffs/VIEWTUBE_VAULT_MASTER_HANDOFF_2026-09-26.md\` | \`src/views/CreatorVaultOS.tsx\`, Vault asset modules/services, Project/ContentBuild handoff contracts |
| Settings | Product Architecture + owning domain authorities | \`src/views/settings/SettingsWorkspace.tsx\`, settings sections, workspace UX persistence, \`PAGE_REGISTRY\` |
| User Guide | \`docs/user-guide-v2/VIEWTUBE_USER_GUIDE_V2_MASTER_RESOURCE.md\` | \`src/content/guide-v2/**\`, \`src/views/UserGuide.tsx\`, guide registry/governance tests |

### Dashboard opportunities

| ID | Feature idea | Intended role / integration direction |
| --- | --- | --- |
| IDEA-DASH-001 | Creator Command Center | Master operational view of channel health, active projects, urgent work, publishing state, anomalies, opportunities, AI recommendations and recent changes; compose existing capabilities rather than own new state. |
| IDEA-DASH-002 | Opportunity Radar | Surface unusually strong topics, videos, formats, traffic sources, search terms, audience behaviors and content gaps from canonical evidence + Opportunity Intelligence. |
| IDEA-DASH-003 | Channel Pulse | Compact current-health instrument combining views, watch time, subscribers, revenue, CTR, retention, publishing frequency and momentum against truthful baselines. |
| IDEA-DASH-004 | Anomaly Monitor | Detect meaningful deviations and explain what changed, when, affected scope and evidence; reuse analytics-canon and specialist anomaly intelligence. |
| IDEA-DASH-005 | Today / This Week Workspace | Prioritized operational view over projects, tasks, comments, deadlines, publishing plans and actionable intelligence. |
| IDEA-DASH-006 | AI Brain Briefing | Channel-aware daily/period briefing generated through BrainRuntime from canonical context, evidence, projects, audience and objectives. |
| IDEA-DASH-007 | Content Pipeline Visualizer | Show content moving through Idea → Research → Script → Production → Edit → Package → Publish → Measure → Learn using canonical Project/ContentBuild state. |
| IDEA-DASH-008 | Goal & Forecast Tracker | Track creator-defined goals and measured trajectories without replacing source analytics or presenting model estimates as measured fact. |
| IDEA-DASH-009 | Recent Changes / Activity Ledger | Unified projection of uploads, edits, generations, analytics changes, project actions, Vault additions, experiments and system activity; project from existing receipts/events rather than another generic ledger. |
| IDEA-DASH-010 | Dashboard Composer | Saved creator-defined dashboard layouts for Channel, Production, Revenue, Shorts, Research, Projects and custom workflows using the existing widget/layout system. |

### Studio opportunities

| ID | Feature idea | Intended role / integration direction |
| --- | --- | --- |
| IDEA-STUDIO-001 | Unified Content Builder | Central creation environment spanning idea, research, script, assets, generation, edit, packaging, publishing and measurement while preserving Project/ContentBuild identity. |
| IDEA-STUDIO-002 | AI Director | Convert concept/script into scenes, shot lists, visual prompts, camera direction, transitions, audio/pacing guidance and governed generation instructions. |
| IDEA-STUDIO-003 | Research Workbench | Project-aware research surface for sources, evidence, quotes, images, references, competing videos, notes and citations feeding canonical evidence/context. |
| IDEA-STUDIO-004 | Script Studio | Channel-aware writing environment with structure, hooks, pacing, scene links, evidence, narration timing, versioning and Brain assistance. |
| IDEA-STUDIO-005 | Video Generation Console | Unified governed interface for text/image-to-video, avatar, B-roll, animation, Remotion, voice, music and batch provider jobs through canonical operations/generation contracts. |
| IDEA-STUDIO-006 | Thumbnail Studio | Thumbnail ideation, generation, composition, title pairing, variants, historical-performance context and experiment handoff tied to canonical assets. |
| IDEA-STUDIO-007 | Packaging Studio | Assemble title, description, tags, chapters, thumbnail, pinned comment, community post, Shorts derivatives, end screens and publishing metadata around one ContentBuild. |
| IDEA-STUDIO-008 | Asset Engine | Project-aware required-asset planning that finds existing assets, identifies gaps and routes generation/import to the canonical Asset Engine/Vault. |
| IDEA-STUDIO-009 | Content Repurposing Lab | Derive Shorts, clips, social/community posts, alternate cuts, images, quotes and follow-up content while preserving source lineage. |
| IDEA-STUDIO-010 | Production Recipe System | Save reusable creator workflows/presets containing stages, tools, prompts, expected assets and project defaults without cloning canonical lifecycle state. |

### Projects opportunities

| ID | Feature idea | Intended role / integration direction |
| --- | --- | --- |
| IDEA-PROJ-001 | Project Command Board | Unified Builder + Board command view of lifecycle, stage, readiness, assets, blockers, tasks, publish target and ContentBuild state. |
| IDEA-PROJ-002 | Smart Project Templates | Reusable project structures with predefined stages, briefs, asset requirements, checklists, tools and AI instructions. |
| IDEA-PROJ-003 | Project Readiness Engine | Evaluate research, script, visuals, audio, metadata, thumbnail, policy/legal checks and publishing requirements using explicit blockers/evidence. |
| IDEA-PROJ-004 | Dependency & Blocker Graph | Represent task/asset/decision/generation/approval dependencies so blockers explain what downstream work they prevent. |
| IDEA-PROJ-005 | Project Memory | Durable project-scoped record of decisions, versions, rejected directions, research, style choices, prompts and lessons using governed context/knowledge rather than a new memory silo. |
| IDEA-PROJ-006 | Project Timeline | Chronological projection of meaningful project events, AI work, edits, files, generations, renders, publishing changes and analytics links. |
| IDEA-PROJ-007 | Project Intelligence Panel | Project-scoped recommendations grounded in Channel Knowledge, evidence, historical performance, audience context and comparable content. |
| IDEA-PROJ-008 | Multi-Video Campaigns | Group related Projects into series, campaigns, playlists, courses, launches or experiment programs without replacing Project identity. |
| IDEA-PROJ-009 | Version & Experiment Manager | Track alternative scripts, edits, titles, thumbnails, hooks, cuts, prompts and packaging variants with explicit lineage and outcomes. |
| IDEA-PROJ-010 | Post-Publish Learning Loop | Bind publication performance/evidence and validated lessons back to the originating Project/ContentBuild and governed learning system. |

### Analytics opportunities

| ID | Feature idea | Intended role / integration direction |
| --- | --- | --- |
| IDEA-AN-001 | Analytics Explorer | Flexible governed query workspace for supported metrics, dimensions, windows, formats, traffic sources, geography and project/video scope. |
| IDEA-AN-002 | Performance Decomposition | Explain performance change by decomposing impressions, CTR, retention, traffic, viewer mix, geography, format and other measurable contributors without implying causality. |
| IDEA-AN-003 | Audience Journey Map | Show supported discovery/watch/continuation/subscription/return/playlist paths where evidence exists; explicitly mark unavailable transitions. |
| IDEA-AN-004 | Video Lifecycle Analyzer | Compare launch, growth, plateau, revival and long-tail shapes across videos using truthful time-series/window semantics. |
| IDEA-AN-005 | Retention Intelligence Lab | Detect hooks, dips, spikes, rewatch points, abandonment zones, chapter effects, duration patterns and recurring retention structures. |
| IDEA-AN-006 | Traffic Intelligence | Deep explorer across browse, suggested, search, Shorts feed, external, playlists, channel pages, notifications, end screens and other supported sources. |
| IDEA-AN-007 | Content Pattern Discovery | Discover correlations among topics, lengths, styles, titles, thumbnail traits, timing, structure, formats and performance while separating correlation from causation. |
| IDEA-AN-008 | Comparative Cohorts | Creator-defined cohorts such as topic, format, duration, impression threshold or upload period with compatible metric/window comparisons. |
| IDEA-AN-009 | Experiment Analytics | Central evidence view for thumbnail/title/format/workflow/publishing/content experiments with hypothesis, exposure, measured outcome and limitations. |
| IDEA-AN-010 | Analytics-to-Brain Learning Pipeline | Convert validated analytical findings into structured evidence/learning candidates for BrainRuntime/Channel Knowledge instead of silent model memory. |

### Editor opportunities

| ID | Feature idea | Intended role / integration direction |
| --- | --- | --- |
| IDEA-EDIT-001 | AI Rough Cut | Assemble a proposed initial edit from script, narration, footage, generated media, timestamps and scene definitions; creator accepts/edits rather than irreversible auto-mutation. |
| IDEA-EDIT-002 | Script-Synchronized Timeline | Link timeline ranges to script paragraphs, narration sentences, scenes, evidence and source assets. |
| IDEA-EDIT-003 | Smart B-Roll Manager | Identify sections needing visual coverage and recommend existing Vault assets or generation operations with provenance. |
| IDEA-EDIT-004 | Scene Inspector | Scene-level view of script, assets, prompt, camera treatment, audio, captions, effects, sources and alternatives. |
| IDEA-EDIT-005 | Timeline Intelligence | Detect dead space, pacing anomalies, missing media, long static regions, audio gaps, duplicate footage and unresolved placeholders. |
| IDEA-EDIT-006 | Version Branching | Create alternate cuts/versions while sharing underlying canonical project/assets instead of duplicating the whole project universe. |
| IDEA-EDIT-007 | Visual Style System | Project-level reusable typography, colors, motion language, captions, transitions, overlays, grain, framing and recurring graphics. |
| IDEA-EDIT-008 | Remotion Component Browser | Browse and place reusable animated components, charts, maps, lower thirds, timelines, backgrounds and diagrams from governed registries. |
| IDEA-EDIT-009 | AI Edit Assistant | Conversational edit proposals through BrainRuntime with preview/diff/approval before state mutation. |
| IDEA-EDIT-010 | Automated Quality Control | Pre-render checks for missing files, clipping, blank frames, silence, caption overflow, crop safety, transitions, ratios and render configuration. |

### Vault opportunities

| ID | Feature idea | Intended role / integration direction |
| --- | --- | --- |
| IDEA-VAULT-001 | Universal Asset Library | Unified browse/manage experience for images, video, audio, documents, generated assets, references, templates, prompts, renders and project materials using canonical asset identity. |
| IDEA-VAULT-002 | Semantic Asset Search | Meaning-based retrieval over approved metadata/embeddings such as scenes, subjects, places, visual traits and intended use. |
| IDEA-VAULT-003 | Asset Intelligence Enrichment | Derive descriptions, tags, entities, dates, colors, ratios, technical properties, provenance and project relationships with clear factual/inferred status. |
| IDEA-VAULT-004 | Asset Relationship Graph | Traverse source → edit → derivative → generation → project → publication → performance relationships from canonical lineage. |
| IDEA-VAULT-005 | Duplicate & Near-Duplicate Detector | Detect exact copies, resized/re-encoded versions and near-identical generations without merging destructively by default. |
| IDEA-VAULT-006 | Smart Collections | Dynamic collections by tags, projects, subjects, formats, providers, dates, people, usage or creator-defined rules. |
| IDEA-VAULT-007 | Asset Usage History | Show every known use across projects, videos, generations, thumbnails, edits and publications. |
| IDEA-VAULT-008 | Asset Version Families | Group original, crop, retouch, upscale, animation, alternate generation, audio edit and derivative files into lineage families. |
| IDEA-VAULT-009 | Vault Inbox / Import Station | Batch intake with classification, tagging, duplicate checks, metadata extraction and project assignment using real processing state. |
| IDEA-VAULT-010 | Missing Asset Finder | Compare active Project/ContentBuild requirements with current assets and expose missing imagery, footage, narration, music, documents, graphics or generations. |

### Settings opportunities

| ID | Feature idea | Intended role / integration direction |
| --- | --- | --- |
| IDEA-SET-001 | AI Brain Control Center | Manage model/provider preferences, reasoning profiles, memory/context sources, evidence policies, tool permissions and scope without bypassing BrainRuntime ownership. |
| IDEA-SET-002 | Creator Profile & Style DNA | Creator-controlled voice, audience, visual language, topics, editorial principles, recurring formats and style preferences feeding Creator Context. |
| IDEA-SET-003 | Integration Manager | Unified connection/status/permission surface for YouTube, Google, AI/generation providers, storage, publishing, analytics and future connectors. |
| IDEA-SET-004 | Automation Center | Configure sync, project, asset-processing, publishing, analytics-refresh, notification and governed AI routines from their real owners. |
| IDEA-SET-005 | Data & Sync Controller | Configure datasets, windows, dimensions, traffic/geography scope, schedules, failures and status through VT-SYNC contracts. |
| IDEA-SET-006 | Model Routing Rules | Creator/admin policy for which approved models/providers serve research, scripting, reasoning, media generation, classification and batch jobs. |
| IDEA-SET-007 | Workspace & Interface Profiles | Save density, dashboard layouts, navigation choices, themes, mobile behaviors, toolbox preferences and workspace presets. |
| IDEA-SET-008 | Notifications & Attention Rules | Configure anomaly, publish failure, render completion, comment, blocker, sync and opportunity notifications with explicit priority rules. |
| IDEA-SET-009 | Privacy / Data Governance Center | Explain stored data, provenance, AI-use permissions, retention/export/deletion controls and connected-service scope. |
| IDEA-SET-010 | System Health & Diagnostics | User-facing account/API/sync/queue/provider/storage/configuration diagnostics and recovery actions. |

### User Guide opportunities

| ID | Feature idea | Intended role / integration direction |
| --- | --- | --- |
| IDEA-GUIDE-001 | Interactive ViewTube Academy | Structured learning paths from first connection through advanced AI, analytics, production and automation. |
| IDEA-GUIDE-002 | Contextual Help Mode | Optional in-product explanations attached to pages, controls, widgets, metrics and workflows using Guide registry IDs. |
| IDEA-GUIDE-003 | Ask ViewTube Guide | Brain-assisted documentation Q&A grounded in current Guide registries, product authorities and lifecycle/status truth. |
| IDEA-GUIDE-004 | Workflow Cookbook | Step-by-step creator recipes for common goals such as creating a Short, historical research, CTR investigation and thumbnail experiments. |
| IDEA-GUIDE-005 | Feature Explorer | Searchable catalog of pages, widgets, tools, primitives, AI capabilities, integrations and automations derived from canonical registries. |
| IDEA-GUIDE-006 | Interactive Guided Tours | Replayable in-product tours that highlight live controls and actions instead of relying only on static screenshots. |
| IDEA-GUIDE-007 | Metric Encyclopedia | Explain metrics, dimensions, source, scope, compatibility, limitations and interpretation from canonical analytics definitions. |
| IDEA-GUIDE-008 | What Can I Do? Navigator | Goal-to-capability router that maps creator intent to the correct ViewTube tool/workflow and prepares a handoff without inventing a second tool registry. |
| IDEA-GUIDE-009 | Release & Change Center | Human-readable projection of shipped features, redesigns, migrations, renamed systems, deprecations and behavioral changes. |
| IDEA-GUIDE-010 | Troubleshooting & System Doctor | Diagnose missing analytics, broken sign-in, failed generations, unavailable assets, render errors, sync failures and empty-state problems by routing to owning diagnostics/actions. |

### Consolidation architecture for the 80 ideas

The catalog intentionally resolves to a smaller shared foundation:

1. **Intelligence layer** — BrainRuntime + Creator Context/Knowledge + Evidence & Intelligence + specialist modules + Outcomes/Evaluation/Learning.
2. **ContentBuild layer** — Idea/brief → research → script → assets → production → edit → package → publish → performance → learning around Project/ContentBuild identity.
3. **Asset layer** — Asset Engine + Vault + generation/render provenance + lineage + project/publication relationships.
4. **Measurement layer** — VT-SYNC + analytics-canon + cohorts/experiments/anomalies/outcomes/evidence.
5. **Orchestration layer** — Projects + tasks + operations + workflows + approvals + integrations + notifications.

A page may expose several of these layers, but should not recreate their persistence, lifecycle or truth ownership.

### Immediate development-use rule

Future ideation, audits and implementation plans for Dashboard, Studio, Projects, Analytics, Editor, Vault, Settings or User Guide must check this registry first. When an idea is selected for development, keep its \`IDEA-*\` ID in the scoped plan/task/PR until it is either:

- promoted into an accepted capability/implementation;
- merged into another idea/capability;
- deferred with reason;
- retired as redundant;
- shipped and documented.

This keeps the ideas active in future development without falsely representing them as completed product behavior.
