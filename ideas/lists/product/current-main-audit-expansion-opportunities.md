# Current-Main Audit Expansion Opportunities

**Source List ID:** IDEA-LIST-AUDIT-EXPANSION-001  
**Source Type:** historical audit / idea donor  
**Original Source:** `docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md`  
**Original Blob:** `374a4a236e7e8d465c458de4810cd4860675fd60`  
**Preservation Rule:** The block below is preserved from the donor audit as idea provenance. Normalized ideas live in `ideas/registry.json`; implementation status must be reconciled against current main before promotion.

# Expansion Idea Banks — YouTube Platform, Google AI, Creator Library, and Studio Tools

These ideas extend the 100-item audit without creating duplicate architecture. They should reuse the canonical owners already named elsewhere in this document: Publisher, Video Manager, ContentBuild, Video Package, Projects, Vault, Brain/Intelligence, Analytics Canon, Dashboard widgets, Studio Toolbox primitives, Editor/Remotion, VT-SYNC, ActionPacket/handoff, and the governed outcome/evaluation/learning loop.

**Integration rule:** distinguish direct API control from assisted handoff. YouTube Data, Analytics/Reporting and Live Streaming APIs expose substantial read/write capability, but not every YouTube Studio, Shopping, monetization or account setting is publicly writable. Google Labs/Gemini products also vary in API availability. Build direct control only where an official supported API/permission exists; otherwise use import/export, deep-link, handoff, status mirroring or creator-approved manual steps.

## 10 YouTube API + YouTube Studio Integration Features

### YT-1. Unified YouTube Studio Control Center
A single ViewTube workspace that merges supported channel, video, playlist, comment, subscription, membership, live, analytics and revenue controls behind one account-scoped command surface. It should show whether each control is **directly writable**, **read-only**, **requires YouTube Studio**, or **blocked by permissions**, so the product never implies unsupported authority.

**Best integration:** Studio Hub + Dashboard command widget + canonical OAuth/session/channel readiness model.

### YT-2. Publish, Schedule and Post-Publish Operations Console
Extend the Publisher into a full YouTube operations console for upload, title/description/tags, thumbnail, captions where supported, visibility, audience settings, scheduling, premiere/live handoff, playlist placement, remote verification, retry/recovery and post-publish metadata updates. The ApprovedPublishSnapshot should remain the immutable approval boundary.

**Best integration:** Publisher + Video Manager + ContentBuild + PublishTransaction + Asset Slots.

### YT-3. Channel Customization and Homepage Architect
Manage supported channel branding and channel sections/shelves from ViewTube, with a visual preview of how playlists, popular uploads, featured groups and channel sections will appear. Where YouTube exposes only partial customization control, ViewTube should guide the creator to the exact remaining Studio action.

**Best integration:** Studio Hub settings + Channel Profile + Playlist/Series systems.

### YT-4. Comment and Community Operations Inbox
Combine comment threads, replies, moderation state, spam/report actions where supported, creator notes, saved reply styles, suggested-video routing and audience intelligence into one triage workspace. High-volume channels should get batch filters, sentiment/theme clustering and “needs creator attention” prioritization without auto-posting unless explicitly allowed.

**Best integration:** Comment Responder + Audience Loop + Brain outcome writers + Video identity.

### YT-5. Playlist, Series and Content Architecture Manager
Create, edit, reorder and organize playlists and playlist items; connect each playlist to Projects, series strategy, end-screen routing and channel sections. Add playlist health metrics, missing-video alerts, duplicate placement detection and sequence recommendations based on actual viewer flows.

**Best integration:** Projects + Video Manager + Analytics + Channel customization.

### YT-6. Live Control Room
Create and schedule broadcasts, bind streams, monitor stream health, manage eligible live settings, operate live chat moderation, moderators/bans and supported monetization/cuepoint controls, and preserve the resulting livestream as a normal ContentBuild/video after the event.

**Best integration:** Studio Hub Live toolbox + Publisher + Analytics checkpoints + Comment/Community systems.

### YT-7. Analytics, Revenue and Membership Intelligence Center
Unify YouTube Analytics/Reporting metrics and dimensions for views, watch time, retention, traffic, devices, geography, subscribers, playlists, livestreams, estimated revenue, ad performance, Premium revenue and available membership signals. Every number should retain unit, scope, window, format and provenance so comparisons pass the canonical metric-compatibility guard.

**Best integration:** Analytics page + Channel Intelligence + Revenue widgets + VT-SYNC.

### YT-8. Subscriber, Subscription and Member Relationship Center
Separate three commonly confused concepts: channel subscriber performance, the authenticated account's own subscriptions, and channel membership data available to eligible channels. Build cohort views, churn/cancellation-reason analysis where data exists, member-perk tracking, subscriber conversion paths and relationship history without pretending that private subscriber identities are universally available.

**Best integration:** Audience Analytics + Community + Membership/Revenue + CRM-like creator notes.

### YT-9. Monetization, Shopping and Commerce Operations Hub
Combine revenue analytics, ad-performance signals, Premium revenue, Super Chat/Super Thanks-style event data where available, memberships and YouTube Shopping/merchant readiness into one commerce workspace. Shopping controls that are not exposed by a supported API should appear as synchronized status, checklist and deep-link handoffs rather than fake in-app controls.

**Best integration:** Revenue Analytics + Publisher readiness + Project launch package + external commerce connectors.

### YT-10. Content Planning Calendar with YouTube State Synchronization
One calendar for Projects, drafts, scheduled uploads, premieres, livestreams, campaign moments, community tasks and post-publish checkpoints. It should reconcile planned ViewTube dates with actual YouTube publish/live state and flag drift, missed deadlines, competing releases, missing assets and under-supported launch windows.

**Best integration:** Projects + Daily Oracle + Publisher + Live + Analytics checkpoints.

---

## 15 Google Labs + Gemini AI Feature Ideas

**Current capability anchors for this idea bank (September 2026):** Gemini 3.1 family and Gemini Omni, Veo 3.1, Nano Banana 2 / Nano Banana Pro, Google Flow, Flow Agent and Flow Tools, Flow Music with Lyria 3 Pro, Gemini Notebook (formerly NotebookLM), Gemini Live, Deep Research, Google AI Studio/Gemini API, and related Google creative/research systems. Availability, plan limits and developer API access must be validated per feature before implementation.

### GAI-1. Flow / Veo Scene Director inside Video Director
Turn a storyboard shot, reference frame, Asset Slot or selected Vault media into Veo scene generations, including portrait 9:16 outputs, first/last-frame continuity, ingredients/reference guidance and native audio when available. Generated clips should return as versioned assets with prompt/model/provenance metadata.

### GAI-2. Nano Banana Thumbnail and Key-Art Lab
Use Nano Banana 2/Pro for thumbnail ideation, controlled image editing, subject consistency, text-aware compositions, background replacement, visual cleanup and variant generation. It should operate on existing thumbnail assets rather than create a parallel image store.

### GAI-3. Gemini Omni Multimodal Remix Workbench
Let creators drop text, images, audio and video references into one workspace and ask for a cohesive remix plan or generated output. Use cases include transforming an existing Short into a new visual concept, creating alternate hooks from footage, or adapting long-form material into several platform-ready variants.

### GAI-4. Flow Agent Batch Creative Director
Map Flow Agent-style multi-step planning into ViewTube Projects: generate several scene variants, batch-edit a recurring visual choice, organize generated assets into collections and propose the next creative action while preserving explicit creator approval gates.

### GAI-5. Flow Tools / Creator Workflow Recipe Builder
Create reusable visual workflow recipes such as “historical map → cinematic establishing shot → 9:16 crop → title card → music cue” or “product image → three ad concepts → six hook variants.” Where Flow Tools are not directly callable, export structured recipes/prompts and re-import resulting assets.

### GAI-6. Flow Music / Lyria Soundtrack Studio
Generate project-scoped music beds, stingers, transitions and theme variations using Lyria-powered workflows, with duration, mood, tempo, intensity and edit-marker controls. Track usage rights/provenance and route approved audio directly into Editor/Vault.

### GAI-7. Gemini Notebook Creator Research Room
Create one source-grounded notebook per Project, series or channel topic containing research documents, transcripts, links, notes and prior videos. Use it to produce cited research answers, briefs, FAQs, timelines, Audio/Video Overviews and reusable evidence packets for the Brain.

### GAI-8. Gemini Deep Research Topic Intelligence
Run structured research for upcoming videos, competitors/topics, historical claims, product comparisons or audience questions, then convert the result into a ViewTube Evidence Pack with sources, confidence, freshness and explicit claims requiring human verification.

### GAI-9. Gemini Live Studio Copilot
Add an optional voice-first copilot for brainstorming, script rehearsal, live editing decisions, shot review and hands-free navigation in the Studio Hub. The copilot should control ViewTube tools through typed actions rather than directly manipulating state outside canonical owners.

### GAI-10. Google Photos / Personal Intelligence Reference Picker
With explicit opt-in, allow creators to discover relevant personal photos or visual references from connected Google context for autobiographical content, thumbnails or B-roll planning. Nothing should be imported into Vault until the creator selects it.

### GAI-11. Gemini API Model Router and Experiment Bench
Build a controlled model-testing surface that compares Gemini model/prompt/context combinations against the versioned AI regression corpus. Capture latency, cost, schema validity, groundedness, usefulness and evidence quality before promoting a model configuration into production.

### GAI-12. AI Studio Prompt-to-Tool Prototyping Bridge
Use Google AI Studio as an experimentation donor for structured-output prompts, multimodal inputs, function/tool calling and model behavior. ViewTube should import proven prompt contracts and tests—not create a permanent second prompt authority.

### GAI-13. Gemini Notebook Auto-Learning Library Builder
Turn completed Projects, postmortems, high-performing videos and verified reference docs into source-grounded creator notebooks. The system could generate a “what we learned” brief, glossary, study guide, infographic or video overview and then publish approved versions into the ViewTube Library page.

### GAI-14. Cross-Modal Brand Consistency Engine
Use Gemini reasoning plus Nano Banana/Veo/Flow references to compare thumbnails, frames, generated video and audio against the creator’s Style Fingerprint. Instead of a single vague style score, show concrete mismatches in palette, typography, subject treatment, pacing, camera language and recurring motifs.

### GAI-15. Multimodal Adaptation Factory
Take one approved long-form ContentBuild and generate a governed adaptation plan for Shorts, teaser clips, thumbnail/key-art variants, localized versions, alternate intros, social cutdowns and music treatments. Each derivative remains linked to the source ContentBuild and records which Google model/tool created it.

---

## 15 High-Value Creator Reference Documents for the Library Page

These should be maintained as **living, versioned reference documents** rather than static blog posts. Each document should include a last-reviewed date, official-source links, examples from the creator’s own channel where appropriate, a glossary, common misinterpretations and a short “what to do with this information” section.

### LIB-1. How YouTube Recommendations and Discovery Work
A plain-language but evidence-grounded guide to Home/Browse, Suggested/Related, Search, Shorts Feed, subscriptions, notifications and other discovery surfaces—and what creators can and cannot infer about “the algorithm.”

### LIB-2. YouTube Metrics and Dimensions Master Glossary
Definitions for views, engaged views, watch time, average view duration, average percentage viewed, impressions, CTR, unique viewers, subscribers gained/lost, revenue, RPM/CPM-style measures, traffic dimensions, geography, device, content type and other analytics fields.

### LIB-3. Shorts vs Long-Form: Different Systems, Different Signals
Explain format differences in viewer behavior, distribution, retention interpretation, packaging, session behavior, monetization, cadence, creative structure and the danger of comparing unlike metrics directly.

### LIB-4. Publishing Best Practices and Preflight Checklist
A step-by-step reference covering metadata, title, description, tags where useful, thumbnail, captions, audience settings, visibility, schedule, playlists, chapters, end screens/cards where applicable, rights checks, quality control and post-publish verification.

### LIB-5. Thumbnail and Title Packaging Handbook
A practical guide to promise, clarity, curiosity, subject hierarchy, text restraint, contrast, mobile readability, title-thumbnail complementarity, variant testing and diagnosing high-retention/low-CTR versus high-CTR/low-satisfaction patterns.

### LIB-6. Audience Retention and Watch Behavior Guide
Explain retention curves, intros, dips, spikes, average percentage viewed, duration effects, chapter/segment analysis, Shorts looping behavior and how not to overreact to small samples.

### LIB-7. Traffic Sources and Discovery Pathways
Explain Browse, Suggested/Related, Search, External, Channel pages, Shorts Feed, playlists, notifications, end screens, hashtags, sound pages, remixes and other traffic sources, including how the same video can behave differently across them.

### LIB-8. Audience, Subscribers and Returning Viewers
Explain subscriber gains/losses, new vs returning viewers, viewer loyalty, audience overlap, cohort thinking, why subscriber count is not the same as active audience, and how to interpret subscriber conversion without chasing vanity metrics.

### LIB-9. YouTube Revenue and Monetization Fundamentals
Explain estimated revenue, ad revenue, Premium revenue, monetized playbacks, CPM/RPM concepts, memberships, fan funding, shopping/commerce considerations and why revenue reports can change after initial estimates.

### LIB-10. Live Streaming Operations Handbook
Cover scheduling, stream setup, encoder/health checks, chat moderation, DVR/latency choices, live analytics, monetization considerations, failure recovery and how to repurpose the archive afterward.

### LIB-11. Playlist, Series and Channel Architecture Guide
Explain playlists as viewer journeys, series structure, channel homepage sections, sequencing, evergreen versus campaign playlists, internal routing and how playlists differ from simple folders.

### LIB-12. Comments, Community and Audience Feedback Playbook
Cover moderation, response prioritization, recurring-question mining, suggested-video replies, handling criticism, identifying content opportunities and separating anecdotal comments from statistically meaningful audience evidence.

### LIB-13. Content Planning, Experiments and Learning Loops
Teach creators how to move from idea → hypothesis → package → publish → measurement → outcome → learning, including test design, avoiding simultaneous uncontrolled changes and recording what actually changed.

### LIB-14. Copyright, Rights, Reuse and AI-Generated Media Reference
A creator-oriented reference for music, footage, images, remixes, licensing, claims/strikes, attribution, AI-generated assets, provenance and when to seek official/legal guidance rather than relying on assumptions.

### LIB-15. Reading Analytics Correctly: Scope, Windows, Missingness and Statistical Traps
Explain time-window mismatches, lifecycle windows, percentages versus counts, sparse data, delayed metrics, geography/sample limitations, invalid cross-format comparisons, correlation versus causation and why “up” or “down” does not automatically explain why.

---

## 15 Studio Hub, Projects and Analytics Tool Ideas

### SPA-1. Creator Mission Control
A Studio Hub command surface that shows the active Project, current ContentBuild, blockers, next action, pending approvals, publishing readiness, recent anomalies and the most important evidence-backed recommendation without becoming another Brain.

### SPA-2. Research-to-Project Builder
Turn a research brief, Gemini Notebook, URL set, transcript bundle or Brain conversation into a real Project with goals, evidence, tasks, script outline, asset slots and a ContentBuild identity in one guided flow.

### SPA-3. Packaging Laboratory
A dedicated title-thumbnail-description experimentation workspace with variant sets, evidence, rubric comparison, creator selection, historical performance context and later outcome attribution to the exact package used.

### SPA-4. Publish Flight Deck
A dense but visual final readiness tool showing VIDEO → PACKAGE → RIGHTS → METADATA → AUDIENCE → SCHEDULE → APPROVAL → PUBLISH → VERIFY. It should absorb duplicate preflight/checklist surfaces rather than add another parallel publisher.

### SPA-5. Video Lifecycle Timeline
A single chronological view of idea, research, project creation, script, generated assets, edits, render, package approval, publish, analytics checkpoints, experiments, comments, outcomes and learned corrections for one video.

### SPA-6. Project Dependency and Blocker Radar
Visualize tasks and assets that are actually preventing completion: missing thumbnail choice, unresolved research claim, render failure, auth problem, unapproved package, absent captions or incomplete rights review. Rank blockers by downstream impact.

### SPA-7. Content Experiment Manager
Create experiments around packaging, intro structure, publishing time, format or follow-up strategy; lock the hypothesis and changed variables; then join measured results back to the exact variant and ContentBuild.

### SPA-8. Retention Scene and Chapter Diagnostics
Overlay retention behavior on chapters, transcript sections, edit markers and scene boundaries so creators can see where viewer behavior changes relative to actual content structure rather than only a generic line chart.

### SPA-9. Traffic Pathway Explorer
A flow/network visualization showing how viewers arrive through Search, Browse, Suggested, playlists, external sources, Shorts Feed, channel pages and internal routing, then where they go next when evidence is available.

### SPA-10. Audience Cohort Workbench
Compare new viewers, returning viewers, subscriber conversion, geography, device, format, traffic-source and lifecycle cohorts with strict metric-compatibility rules. Save useful cohorts as reusable analytics lenses rather than permanent duplicate datasets.

### SPA-11. Revenue Opportunity Analyzer
Join content type, traffic, geography, watch behavior, ad/Premium revenue, memberships and publishing cadence to identify where revenue changes came from—while separating observed data from inferred opportunity.

### SPA-12. Series and Playlist Architect
Plan a multi-video series visually, assign Projects/ContentBuilds to episodes, define playlist order, internal routing, follow-up candidates, recurring assets and publication cadence, then sync the supported playlist structure to YouTube.

### SPA-13. Comment-to-Content Opportunity Miner
Cluster repeated viewer questions, requests and pain points across comments; connect clusters to existing videos/projects; estimate evidence strength; and create a Project or follow-up idea only after creator approval.

### SPA-14. Channel Change Journal and Outcome Map
Automatically log significant creator actions—new thumbnail, title change, publish, playlist move, live event, experiment, major editor revision—and overlay later analytics so creators can inspect correlations without pretending they prove causation.

### SPA-15. Scenario Planner
Let creators model “what if” plans such as more Shorts, fewer but larger long-form uploads, a weekly live stream, a sequel series or different publishing cadence. Use historical channel evidence to show assumptions and ranges, not fake forecasts or guaranteed outcomes.
