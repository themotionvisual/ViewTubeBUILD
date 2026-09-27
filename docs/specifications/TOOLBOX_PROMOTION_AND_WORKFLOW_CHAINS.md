# Toolbox Promotion + Workflow Chain Specification

**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27  
**Class:** SPECIFICATION  
**Status:** ACTIVE  
**Concern:** dashboard-to-toolbox promotion, cross-tool workflow recipes, ActionPacket handoff continuity, and compact-vs-workstation surface boundaries  
**Owner:** Integrated Application Program + Dashboard Widget System + Creator Operations & Generation  
**Registry ID:** DOC-SPEC-TOOLBOX-WORKFLOWS  
**Last Audited Main SHA:** 3ed2bc91f324338fd110a160d65ddbed93806142  
**Supersedes:** none  
**Related Authorities:** docs/architecture/PRODUCT_ARCHITECTURE.md; docs/programs/INTEGRATED_APPLICATION.md; docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_MASTER_RESOURCE.md; docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md; docs/brain/UNIVERSAL_TOOL_HANDOFFS_AND_SUGGESTED_CHAINS.md; docs/governance/TASK_AUTHORITY.md

## Purpose

ViewTube should not keep turning complex creator workstations into permanently oversized Dashboard widgets. The Dashboard should act as an instrument panel: status, evidence, compact controls, alerts, summaries, launchers, and resumable work. Toolbox surfaces should own deeper multi-step workflows.

This specification consolidates three related planning needs into one subordinate contract:

1. decide which existing or proposed widgets are too large or complex and should have Toolbox-scale workstation surfaces;
2. define a reusable structure for multi-tool handoff workflows;
3. preserve forty high-value creator workflow recipes without creating forty independent backend systems or forty automatic tasks.

This document is subordinate to Product Architecture, the Integrated Application Program, the Widget/Dashboard authority, the Toolbox UI authority, and the universal ActionPacket handoff protocol.

## Current-main evidence and interpretation

The 2026-09-27 current-main audit found several Dashboard/creator surfaces that already have tool-scale implementation complexity. Examples include UIReferenceLibraryWidget, VideoDirectorWidget, VideoUploaderWidget, VideoAutopsyWidget, VideoManagerWidget, DailyOracleWidget, BrainHubWidget, LongformOptimizationWidget, VideoAssetEngineWidget, and the family of thumbnail/comment/metadata/retention widgets.

File size is not itself an architectural decision. It is evidence that a surface deserves review for responsibility density, internal pages, state ownership, async operations, provenance, mutation safety, and mobile composition.

The decision rule is therefore:

- keep a Dashboard widget when its primary job is glance, inspect, compare, select, trigger, acknowledge, or resume;
- promote to a Toolbox workstation when the job needs multiple stages, multiple asset types, generation queues, editing, provenance, approvals, comparisons, history, or repeated handoffs;
- where both are useful, retain a compact widget as the launcher/status instrument and let the Toolbox own the full workflow;
- never create a second persistence owner merely because a new Toolbox exists.

## Surface boundary law

### Dashboard instrument

A Dashboard instrument should normally provide:
- current status or signal;
- one recognizable signature visual/instrument;
- bounded controls;
- one or a few high-value actions;
- selected Project/video context;
- resumable handoff to the full owner;
- intentional loading, empty, disconnected, stale and error states.

### Toolbox workstation

A Toolbox workstation may provide:
- multiple internal pages/modes;
- editable structured data;
- variant comparison;
- queue/progress/retry/cancel;
- generation controls;
- provenance and lineage;
- approval/review;
- version history;
- cross-tool Send To;
- deeper evidence inspection;
- responsive re-composition without losing functionality.

### Canonical-state rule

The compact widget and full Toolbox must share the same canonical capability owners. They may not synchronize duplicated private state as a substitute for shared ownership.

## Twenty promotion / consolidation candidates

| # | Surface | Current status | Recommended Toolbox identity | Dashboard role after promotion | Canonical direction |
| --- | --- | --- | --- | --- | --- |
| 1 | UI Reference Library | existing widget/reference surface | UI Reference Studio Toolbox | developer/reference launcher only | Toolbox/UI authorities |
| 2 | Video Director | existing widget + page | Video Director Toolbox | active job, preset, queue and Generate launcher | Creator Operations + Asset Engine |
| 3 | Video Uploader / Publisher | existing widget + Studio tool | Video Publisher Toolbox | readiness/publish status + resume | Publisher |
| 4 | Video Manager | existing widget + Studio tool | Video Manager Toolbox | selected-video status + quick actions | canonical video metadata/edit workflow |
| 5 | Video Autopsy | existing widget | Video Performance Autopsy Toolbox | headline diagnosis + strongest issue | Analytics + Intelligence |
| 6 | Daily Oracle | existing widget | Daily Creator Command Toolbox | daily top action + compact evidence | Brain + Evidence + Projects |
| 7 | Brain Hub | existing widget/page family | Brain Hub Toolbox | ask/resume/status/evidence health | BrainRuntime |
| 8 | Comment Responder | existing widget/tool | Comment Operations Toolbox | queue count + priority replies | Community + Outcomes |
| 9 | Longform Optimization | existing widget | Video Optimization Toolbox | strongest optimization signal | Analytics/Brain/Packaging |
| 10 | Video Asset Engine | existing widget | Asset Engine Toolbox | package readiness + missing slot launcher | Asset Engine |
| 11 | Thumbnail Lab / ThumbAI / A-B Thumbnail | existing family | Thumbnail Studio Toolbox | selected variant + experiment status | Asset Engine + Experiments |
| 12 | Settings widget | existing compact control surface | Dashboard Control Toolbox | compact switchboard | Settings + Dashboard |
| 13 | Title Rewriter + Description Editor + Tag Generator + Hashtag Analyzer | proposed consolidation | Metadata / SEO Workbench | package score/status + open workbench | Publishing Package |
| 14 | Retention Dip + Benchmark + Simulator | proposed consolidation | Retention Lab | retention alert/summary | analytics-canon + Intelligence |
| 15 | Keyword Engine + Keyword Overlap | proposed consolidation | Keyword Intelligence | top opportunity/overlap alert | Evidence & Intelligence |
| 16 | Mini Calendar + Upload Scheduler | proposed consolidation | Publishing Calendar | next slot + conflict/status | Projects + Publishing |
| 17 | Audience Matrix + Device Matrix + Guest Ratio | proposed consolidation | Audience Intelligence | top segment shift | Analytics + Audience Intelligence |
| 18 | Traffic Sources + Playback Origins + Sharing DNA + Bridge Efficiency | proposed consolidation | Discovery & Distribution | current discovery mix | Analytics |
| 19 | Revenue Tracker + Revenue Momentum + Ad Stack + CPM Geography + Premium Pulse | proposed consolidation | Monetization Intelligence | revenue pulse | Analytics |
| 20 | Opportunity Radar | existing compact widget + broader concept | Opportunity Intelligence Workbench | spatial opportunity map + open action | Evidence & Intelligence |

## Promotion criteria

A surface becomes a promotion candidate when three or more of these are true:

1. more than three independent workflow stages;
2. more than one editable asset family;
3. async job queue, retry or provider state;
4. variant comparison/selection;
5. canonical lineage/provenance inspection;
6. multi-step approvals or irreversible side effects;
7. more than two internal navigation pages are needed to keep mobile usable;
8. cross-tool outputs are a primary responsibility;
9. historical revisions/experiments must remain inspectable;
10. the compact widget cannot preserve its signature visual while exposing all controls.

Promotion is not deletion. A useful compact widget may remain.

## Universal workflow handoff envelope

Every integrated chain should preserve, when applicable:

- workflowRunId / operation identity;
- source tool/widget and source action;
- creator/channel identity;
- Project ID;
- ContentBuild ID;
- video ID;
- selected asset IDs and versions;
- package/slot identity;
- evidence IDs and evidence-health/freshness state;
- prompt family/version/context recipe for generated/reasoned outputs;
- requested/served model/provider where relevant;
- generation/tool receipt IDs;
- creator approval state;
- reversible/irreversible side-effect classification;
- suggested destinations;
- accepted destination;
- produced artifacts;
- outcome/evaluation linkage after execution.

Existing ViewTubeActionPacket remains the current handoff protocol. OperationRecord convergence may later give the packet a shared operation identity; this specification does not create another persistence owner.

## Workflow recipe contract

Every workflow recipe records:

- title;
- creator purpose;
- ordered tools/widgets;
- starting context/assets;
- prompt intent;
- generated artifacts;
- final deliverable;
- three optimization rules;
- external-write approval boundary;
- canonical identities that must survive the chain.

A recipe is a reusable orchestration template, not an autonomous command to publish, post, reply, delete, spend money, or make another consequential external mutation.

## Forty handoff workflow recipes

### 1. Idea to Published Longform
**Purpose:** Move one evidence-backed opportunity through a complete long-form creator lifecycle.  
**Order:** Daily Oracle → Projects → Research Lab → Script Architect → Storyboard Studio → Thumbnail Studio → Editor → Video Publisher → Analytics.  
**Prompt:** Turn the selected opportunity into the strongest evidence-supported long-form project for the target audience while preserving uncertainty and the original audience promise.  
**Assets:** opportunity/evidence packet, channel context, Project/ContentBuild identity, research sources.  
**Generations:** research brief, script, storyboard, visual needs, thumbnail variants, publishing package.  
**Deliverable:** published ContentBuild with exact package/asset/outcome lineage.  
**Optimize:** (1) preserve one ContentBuild ID end to end; (2) generate missing package slots rather than parallel documents; (3) freeze the approved package before external publish.

### 2. Idea to Published Short
**Purpose:** Convert a supported opportunity into a concise vertical video.  
**Order:** Opportunity Radar → Projects → Hook Generator → Script Architect → Storyboard Studio → Video Director → Editor → Video Publisher.  
**Prompt:** Build a short-form concept with an immediate first payoff and one clear viewer promise.  
**Assets:** opportunity evidence, references, project style, existing Vault media.  
**Generations:** hook variants, short script, shot list, generated media, captions/package.  
**Deliverable:** 9:16 publish-ready ContentBuild.  
**Optimize:** (1) select the hook before expensive generation; (2) reuse existing project assets; (3) author natively for 9:16 instead of late reframing.

### 3. Underperforming Upload Rescue
**Purpose:** Diagnose and improve an existing upload without random simultaneous edits.  
**Order:** Video Autopsy → Brain → Thumbnail Studio → Metadata / SEO Workbench → Video Manager → Analytics.  
**Prompt:** Diagnose this video's strongest evidence-backed weakness before proposing any mutation.  
**Assets:** CTR, retention, traffic, title, thumbnail, transcript, current package.  
**Generations:** diagnosis, title candidates, thumbnail candidates, experiment plan.  
**Deliverable:** approved rescue experiment.  
**Optimize:** (1) change one major hypothesis at a time; (2) preserve the baseline snapshot; (3) predeclare evaluation window and metric.

### 4. Thumbnail Refresh Experiment
**Purpose:** Run a traceable packaging experiment on an existing video.  
**Order:** Video Manager → Thumbnail Studio → Variant Comparator → Video Manager → Analytics.  
**Prompt:** Create materially different visual hypotheses, not cosmetic copies of the current thumbnail.  
**Assets:** current thumbnail/title, transcript, visual assets, historical CTR evidence.  
**Generations:** A/B/C thumbnail variants with rationale and provenance.  
**Deliverable:** experiment with selected/used variant lineage.  
**Optimize:** (1) preserve original variant; (2) enforce distinct concepts; (3) record the exact remotely used variant.

### 5. Title Refresh Experiment
**Purpose:** Test a new framing strategy without losing the video's actual promise.  
**Order:** Video Autopsy → Metadata / SEO Workbench → Brain → Video Manager → Analytics.  
**Prompt:** Generate title variants that preserve the underlying content promise while testing distinct framing strategies.  
**Assets:** transcript, current title, thumbnail, search/discovery evidence.  
**Generations:** A/B/C titles plus hypothesis/rationale.  
**Deliverable:** title experiment and evaluation record.  
**Optimize:** (1) separate curiosity/topic/benefit hypotheses; (2) avoid title-thumbnail duplication; (3) compare against the correct baseline window.

### 6. Retention Rescue
**Purpose:** Turn retention evidence into reversible editing proposals.  
**Order:** Retention Lab → Content Analysis → Editor → Brain → Analytics.  
**Prompt:** Identify the largest actionable retention losses and propose edits only where evidence supports a plausible mechanism.  
**Assets:** retention curve, transcript, chapter/scene/timeline context.  
**Generations:** issue markers, cut/reorder proposals, alternate hook candidates.  
**Deliverable:** previewable revision candidate.  
**Optimize:** (1) distinguish correlation from cause; (2) use typed preview patches before mutation; (3) compare compatible retention semantics.

### 7. Comment to New Video
**Purpose:** Convert repeated audience demand into a planned content opportunity.  
**Order:** Comment Operations → Brain → Opportunity Radar → Projects → Research Lab.  
**Prompt:** Cluster repeated audience requests and turn only supported demand into project candidates.  
**Assets:** source comments, video context, theme evidence.  
**Generations:** request clusters, opportunity briefs, project candidates.  
**Deliverable:** evidence-linked Project candidates.  
**Optimize:** (1) deduplicate similar requests; (2) weight repeated demand rather than the loudest comment; (3) preserve originating comment evidence IDs.

### 8. Comment to Community Campaign
**Purpose:** Test audience interest before committing to a larger production.  
**Order:** Comment Operations → Audience Intelligence → Community Posts → Brain → Projects.  
**Prompt:** Turn this audience conversation into one low-friction community interaction that can test demand.  
**Assets:** comment cluster, current projects, reusable image assets.  
**Generations:** post/poll variants and measurement intent.  
**Deliverable:** approved community campaign and resulting demand signal.  
**Optimize:** (1) ask one clear question; (2) attach an outcome target; (3) route strong responses into Projects.

### 9. Search Gap to Video
**Purpose:** Convert a credible search gap into a channel-fit project.  
**Order:** Keyword Intelligence → Opportunity Radar → Research Lab → Projects → Script Architect → Video Publisher.  
**Prompt:** Find search demand where the channel has credible topical authority but insufficient coverage.  
**Assets:** search terms, existing library, channel knowledge, competitor/reference evidence.  
**Generations:** keyword cluster, opportunity brief, title/hook package.  
**Deliverable:** search-oriented Project/ContentBuild.  
**Optimize:** (1) remove cannibalization; (2) distinguish raw demand from channel relevance; (3) measure search contribution after publish.

### 10. High Performer to Sequel
**Purpose:** Reuse a proven audience promise without cloning surface details.  
**Order:** Performance Hub → Video Autopsy → Brain → Projects → Research Lab → Packaging Studio.  
**Prompt:** Explain which parts of this success appear reusable and design a sequel that changes the premise enough to add new value.  
**Assets:** performance evidence, comments, transcript, package, audience context.  
**Generations:** sequel angles, promise, package concepts.  
**Deliverable:** sequel Project.  
**Optimize:** (1) separate durable signal from timing luck; (2) preserve the proven audience promise; (3) deliberately vary creative premise.

### 11. Evergreen Revival
**Purpose:** Refresh and redistribute an older asset when current evidence justifies it.  
**Order:** Performance Hub → Opportunity Radar → Video Manager → Thumbnail Studio → Community Posts.  
**Prompt:** Identify whether this older video still matches current demand and what minimal refresh is justified.  
**Assets:** historical performance, current opportunity evidence, current package.  
**Generations:** refreshed package candidates and promotion copy.  
**Deliverable:** revival campaign.  
**Optimize:** (1) check topical freshness; (2) refresh packaging before promotion; (3) evaluate incremental rather than lifetime results.

### 12. Longform to Shorts
**Purpose:** Derive self-contained short-form assets from a source video.  
**Order:** Video Manager → Shorts Extraction Studio → Brain → Editor → Video Publisher.  
**Prompt:** Extract moments that deliver standalone value without requiring the full source video's context.  
**Assets:** source video, transcript, chapter/retention/highlight evidence.  
**Generations:** candidate clips, Short hooks, captions and metadata.  
**Deliverable:** multiple Short candidates linked to the source ContentBuild/video.  
**Optimize:** (1) rank by standalone payoff; (2) preserve source-video lineage; (3) batch crop/caption work.

### 13. Editor Missing-Shot Recovery
**Purpose:** Fill a concrete timeline gap without losing project continuity.  
**Order:** Editor → Brain → Video Director → Asset Engine → Editor.  
**Prompt:** Generate only the missing visual required for the selected timeline range and match established project style and continuity.  
**Assets:** adjacent frames, script segment, style context, scene references.  
**Generations:** low-cost image/video variants followed by selected final media.  
**Deliverable:** canonical candidate asset ready for timeline insertion.  
**Optimize:** (1) send timeline context automatically; (2) preview cheaply before final generation; (3) commit only the selected variant.

### 14. Storyboard to Generated Sequence
**Purpose:** Produce a visually coherent generated shot sequence.  
**Order:** Storyboard Studio → Concept Scene Studio → Video Director → Vault → Editor.  
**Prompt:** Translate storyboard panels into continuous shots with consistent subject, lens, palette, lighting and motion.  
**Assets:** storyboard, references, style fingerprint, subject references.  
**Generations:** hero frames and video clips.  
**Deliverable:** versioned shot collection.  
**Optimize:** (1) lock continuity properties; (2) approve hero frames before video generation; (3) reuse seeds/references.

### 15. Research to Historical Video
**Purpose:** Build a source-backed history production workflow.  
**Order:** Research Lab → Brain Evidence → Script Architect → Storyboard Studio → Vault → Editor.  
**Prompt:** Build the narrative only from traceable evidence and mark uncertainty rather than smoothing over gaps.  
**Assets:** primary/secondary sources, quotes, maps/images, archival references.  
**Generations:** evidence brief, cited script, visual-source manifest.  
**Deliverable:** evidence-linked historical ContentBuild.  
**Optimize:** (1) evidence ID on important claims; (2) distinguish primary from secondary sources; (3) expose missing imagery before edit.

### 16. Script to Production Package
**Purpose:** Convert an approved script into the minimum complete production asset set.  
**Order:** Script Architect → Storyboard Studio → Asset Engine → Thumbnail Studio → Editor.  
**Prompt:** Derive the required scenes and assets from this approved script and reuse existing canonical assets before generating anything new.  
**Assets:** script, style profile, Vault library, Project identity.  
**Generations:** shot list, missing-asset manifest, thumbnail concepts.  
**Deliverable:** readiness-tracked production package.  
**Optimize:** (1) reuse before generation; (2) maintain explicit package slots; (3) prioritize blocking assets.

### 17. Missing Asset Finder Loop
**Purpose:** Resolve package gaps through the cheapest valid source.  
**Order:** Asset Engine → Vault → appropriate generator or Research Lab → Asset Engine → Projects.  
**Prompt:** Resolve each empty required slot using existing assets first and new generation only when necessary.  
**Assets:** package slot registry, Vault catalog, Project context.  
**Generations:** only unresolved assets.  
**Deliverable:** updated package readiness.  
**Optimize:** (1) dedupe before generation; (2) prioritize blockers; (3) retain source/provenance for each slot.

### 18. Vault Reuse to New Project
**Purpose:** Turn reusable archived material into a new coherent content project.  
**Order:** Vault → Project / Asset Group Builder → Projects → Brain → Script Architect or Editor.  
**Prompt:** Find a coherent new content opportunity from the selected reusable assets without duplicating them.  
**Assets:** selected Vault assets, rights/provenance/metadata.  
**Generations:** concept, reuse plan, Project brief.  
**Deliverable:** new Project/ContentBuild linked to existing assets.  
**Optimize:** (1) keep source ownership; (2) verify rights; (3) reference asset IDs rather than duplicate bytes.

### 19. Project Package Readiness
**Purpose:** Show only true blockers preventing a ContentBuild from publishing.  
**Order:** Projects → Asset Engine → Vault → Packaging Studio → Video Publisher.  
**Prompt:** Identify the exact unresolved blockers preventing this ContentBuild from reaching publish-ready state.  
**Assets:** project state, package slots, selected variants, publishing requirements.  
**Generations:** readiness report and remediation actions.  
**Deliverable:** publish-ready package.  
**Optimize:** (1) separate blockers from suggestions; (2) use one canonical readiness projection; (3) provide direct launcher for every missing slot.

### 20. Pre-Launch Command
**Purpose:** Coordinate a minimal launch sequence around a finished video.  
**Order:** Projects → Pre-Launch Priming → Thumbnail Studio → Community Posts → Video Publisher.  
**Prompt:** Prepare the smallest coordinated launch plan that supports discovery without unnecessary busywork.  
**Assets:** final package, audience evidence, project schedule.  
**Generations:** teaser/poll/community copy and launch checklist.  
**Deliverable:** approved launch package.  
**Optimize:** (1) reuse final assets; (2) tie every action to an objective; (3) avoid low-value over-scheduling.

### 21. End-Screen Optimization
**Purpose:** Improve the next-view path based on audience intent.  
**Order:** Video Manager → Content Analysis → End-Screen Architect → Discovery & Distribution → Video Manager.  
**Prompt:** Choose a next-view destination that best matches this video's viewer intent and available evidence.  
**Assets:** source video, traffic/session evidence, candidate destination videos.  
**Generations:** end-screen layout and destination plan.  
**Deliverable:** approved end-screen update.  
**Optimize:** (1) prioritize relevance over raw destination views; (2) preserve baseline; (3) measure continuation consistently.

### 22. Channel Session Builder
**Purpose:** Build coherent video-to-video viewing routes.  
**Order:** Discovery & Distribution → Performance Hub → End-Screen Architect → Video Manager → Analytics.  
**Prompt:** Identify natural continuation routes that can increase coherent session depth.  
**Assets:** suggested/browse/playlist/end-screen evidence, channel library.  
**Generations:** routing map and update candidates.  
**Deliverable:** cross-video navigation plan.  
**Optimize:** (1) avoid circular routing; (2) respect topical intent; (3) use comparable continuation metrics.

### 23. Content Series Builder
**Purpose:** Plan a multi-video series with a recognizable but non-repetitive system.  
**Order:** Brain → Series Theme Generator → Projects → Publishing Calendar → Thumbnail Studio.  
**Prompt:** Design a series with repeatable identity and distinct episode promises.  
**Assets:** channel knowledge, opportunity clusters, previous series data.  
**Generations:** series identity, episode slate, thumbnail system.  
**Deliverable:** linked multi-Project campaign.  
**Optimize:** (1) share a brand kit; (2) stagger production cost; (3) define continue/stop evaluation gates.

### 24. Calendar Gap Filler
**Purpose:** Fill an open publishing slot with the most appropriate ready work.  
**Order:** Publishing Calendar → Projects → Opportunity Radar → Daily Oracle → Project Builder.  
**Prompt:** Fill this gap using readiness, channel relevance and current opportunity rather than novelty alone.  
**Assets:** calendar, Project readiness, opportunity evidence.  
**Generations:** schedule recommendation and required next actions.  
**Deliverable:** committed publishing slot.  
**Optimize:** (1) weight readiness; (2) balance workload; (3) protect major launches from crowding.

### 25. Trend Reaction Workflow
**Purpose:** Decide whether a current trend deserves accelerated production.  
**Order:** Opportunity Radar → Research Lab → Brain → Projects → Hook Generator → Video Publisher.  
**Prompt:** Determine whether this trend is relevant and fresh enough for this channel to justify accelerated production.  
**Assets:** current external evidence, channel fit, available assets.  
**Generations:** go/no-go brief, rapid concept/script/package.  
**Deliverable:** accelerated Project only when supported.  
**Optimize:** (1) hard relevance threshold; (2) timestamp freshness; (3) automatically stop when evidence is stale.

### 26. Audience Segment Video
**Purpose:** Design content for a meaningful under-served segment.  
**Order:** Audience Intelligence → Analytics → Brain → Projects → Thumbnail Studio.  
**Prompt:** Identify an underserved audience segment large and relevant enough to justify a specific content test.  
**Assets:** geography/device/subscriber/audience evidence.  
**Generations:** segment brief, concept and packaging direction.  
**Deliverable:** audience-targeted Project.  
**Optimize:** (1) reject tiny samples; (2) compare equivalent windows; (3) validate after publish.

### 27. Localization Workflow
**Purpose:** Localize a published or ready video while preserving creator meaning and terminology.  
**Order:** Video Manager → Brain → Editor → Vault → Video Publisher.  
**Prompt:** Localize captions and metadata while preserving names, meaning and creator tone.  
**Assets:** source transcript, captions, terminology/style glossary.  
**Generations:** translated captions and metadata candidates.  
**Deliverable:** localization package.  
**Optimize:** (1) lock glossary; (2) require review; (3) retain one source transcript/version.

### 28. Accessibility Completion
**Purpose:** Catch accessibility defects before release.  
**Order:** Editor → Transcript/Caption tools → Brain → Video Publisher → User Guide/System Doctor.  
**Prompt:** Identify caption, readability, overflow and audio-accessibility gaps in the final candidate.  
**Assets:** final timeline, captions, audio, render settings.  
**Generations:** corrected captions and issue report.  
**Deliverable:** accessibility-ready package.  
**Optimize:** (1) automate preflight; (2) timestamp every issue; (3) rerun after final edit.

### 29. Comment Response Campaign
**Purpose:** Process a large comment queue while preserving creator review and extracting useful audience signals.  
**Order:** Comment Operations → Brain → Community Posts → Video Manager → Outcome Ledger.  
**Prompt:** Draft useful responses in the creator's approved style and escalate meaningful repeated requests.  
**Assets:** selected comments, video/project context, channel style.  
**Generations:** reply drafts and escalation candidates.  
**Deliverable:** approved reply batch plus audience signals.  
**Optimize:** (1) batch similar questions; (2) never auto-post without approval; (3) treat creator edits as feedback.

### 30. 72-Hour Launch Review
**Purpose:** Review early performance without panic edits.  
**Order:** Video Publisher → Analytics → Daily Oracle → Video Autopsy → Video Manager.  
**Prompt:** Compare the first seventy-two hours with an appropriate baseline and surface only actionable deviations.  
**Assets:** ApprovedPublishSnapshot, early metrics, used variants.  
**Generations:** launch review and intervention candidates.  
**Deliverable:** evidence-based change/no-change decision.  
**Optimize:** (1) compatible cohorts/windows; (2) avoid premature changes; (3) preserve exact published snapshot.

### 31. Packaging Learning Loop
**Purpose:** Turn measured package experiments into governed learning.  
**Order:** Thumbnail Studio → Video Publisher → Analytics → Evaluation → Brain Learning.  
**Prompt:** Evaluate the exact packaging hypothesis that actually ran and determine whether the result supports a durable lesson.  
**Assets:** variants, used-variant receipt, publish snapshot, outcomes.  
**Generations:** evaluation and learning candidate.  
**Deliverable:** governed packaging lesson or explicit no-promotion decision.  
**Optimize:** (1) record actual used variant; (2) require minimum evidence; (3) expire/supersede contradicted learning.

### 32. Hook Learning Loop
**Purpose:** Learn from exact hooks rather than vague video-level success.  
**Order:** Hook Generator → Editor → Video Publisher → Retention Lab → Brain Learning.  
**Prompt:** Evaluate whether the selected hook changed the intended early-retention behavior.  
**Assets:** hook variants, final timeline, retention evidence.  
**Generations:** hook evaluation and learning candidate.  
**Deliverable:** governed hook lesson.  
**Optimize:** (1) record exact used hook; (2) match format/window; (3) avoid attributing unrelated edit effects to wording.

### 33. Project Postmortem
**Purpose:** Preserve what actually happened during a project and what can safely be learned.  
**Order:** Projects → Analytics → Outcome Ledger → Brain → Vault.  
**Prompt:** Summarize what was planned, changed, shipped and measured, and promote only justified lessons.  
**Assets:** project history, revisions, assets, publish snapshot, outcomes.  
**Generations:** postmortem and learning candidates.  
**Deliverable:** reusable Project memory.  
**Optimize:** (1) diff plan vs actual; (2) preserve rejected directions; (3) gate durable learning on evidence.

### 34. Experiment Design Workflow
**Purpose:** Create the smallest experiment that can answer a creator question.  
**Order:** Brain → Analytics → Variant Comparator → Projects → Video Publisher → Evaluation.  
**Prompt:** Design an experiment that isolates the stated hypothesis and predefines its evaluation conditions.  
**Assets:** baseline, candidates, target metric/context.  
**Generations:** experiment design and variants.  
**Deliverable:** traceable experiment.  
**Optimize:** (1) one hypothesis; (2) explicit evaluation window; (3) stop/decision condition defined before launch.

### 35. Revenue Opportunity Investigation
**Purpose:** Explore revenue differences without presenting correlation as guaranteed monetization.  
**Order:** Monetization Intelligence → Analytics → Brain → Projects → Publishing Calendar.  
**Prompt:** Identify meaningful revenue-pattern differences while separating monetization effects from topic, format and audience differences.  
**Assets:** revenue/RPM/geo/format evidence.  
**Generations:** opportunity brief and test candidates.  
**Deliverable:** revenue-informed content experiments.  
**Optimize:** (1) normalize format/window; (2) state causal uncertainty; (3) compare relevant cohorts.

### 36. Channel Strategy Sprint
**Purpose:** Turn current channel evidence into a bounded multi-video production slate.  
**Order:** Performance Hub → Audience Intelligence → Opportunity Radar → Brain → Projects → Publishing Calendar.  
**Prompt:** Build the next N-video slate from verified strengths, audience needs, opportunity and production capacity.  
**Assets:** recent performance, audience evidence, pipeline/readiness.  
**Generations:** strategy brief and Project slate.  
**Deliverable:** scheduled production program.  
**Optimize:** (1) balance exploitation/exploration; (2) include production cost; (3) define review checkpoint.

### 37. Algorithm Explanation to Action
**Purpose:** Convert creator education into one testable action.  
**Order:** Algorithm Architect / Resource Library → Brain → Analytics → Tactics Engine → Projects.  
**Prompt:** Explain the selected recommendation-system concept using this channel's actual evidence, then convert it into one testable creator action.  
**Assets:** creator guide, channel evidence, active projects.  
**Generations:** contextual explanation and experiment.  
**Deliverable:** learning-driven action plan.  
**Optimize:** (1) separate general platform knowledge from channel evidence; (2) avoid causal certainty; (3) one action at a time.

### 38. System Doctor to Recovery
**Purpose:** Route an app problem to its real owner instead of duplicating repair logic.  
**Order:** User Guide/System Doctor → Diagnostics → owning tool/service → repair handoff.  
**Prompt:** Diagnose why the expected capability is unavailable and route to the canonical owner with evidence.  
**Assets:** runtime diagnostics, auth/sync/tool state, error receipts.  
**Generations:** diagnosis and repair sequence.  
**Deliverable:** resolved state or explicit blocker.  
**Optimize:** (1) owner-based diagnosis; (2) retain error receipts; (3) avoid generic retry loops.

### 39. Asset Rights Preflight
**Purpose:** Prevent packages from publishing with unknown or insufficient asset rights.  
**Order:** Vault → Asset Engine → Projects → Video Publisher → Brain/Evidence.  
**Prompt:** Identify selected assets whose source, rights or license metadata is insufficient for this intended use.  
**Assets:** selected package assets, rights metadata, provenance.  
**Generations:** rights-gap report and remediation options.  
**Deliverable:** cleared package or explicit publishing blockers.  
**Optimize:** (1) check early; (2) reuse verified protected/GOLDEN assets where suitable; (3) never infer rights from appearance or filename.

### 40. Full Creator Improvement Loop
**Purpose:** Close the loop from recommendation to creation to measurement to governed learning.  
**Order:** Daily Oracle → Projects → appropriate production toolchain → Video Publisher → Analytics → Outcomes → Evaluation → Brain Learning → next Daily Oracle.  
**Prompt:** Choose the next action from current evidence, preserve identity and provenance, measure the result, and use only justified learning in the next recommendation.  
**Assets:** canonical Project/ContentBuild/evidence/asset/outcome graph.  
**Generations:** workflow-specific assets and reasoning outputs.  
**Deliverable:** one closed creator learning cycle.  
**Optimize:** (1) one canonical identity chain; (2) an evaluation target for every consequential action; (3) governed rather than automatic learning promotion.

## Dedupe against existing work

These items are not forty new feature tasks.

### Already represented by existing architecture

- ViewTubeActionPacket and Send To / NEXT behavior already exist as the universal handoff direction.
- Thumbnail Studio → Publisher/Manager/Vault, Manager → Analysis/End Screen/Brain, Comment → Brain/Projects/Community, and script/storyboard → Project/Editor/Vault are existing handoff examples.
- WidgetRegistry handoff metadata is already an explicit planned requirement.
- Daily Oracle, Video Publisher, Video Manager and several widget consolidation groups already exist in the Widget/Dashboard authority.
- Project/ContentBuild identity, Asset Engine/Vault identity, analytics-canon, BrainRuntime, outcomes/evaluation and Toolbox primitives remain canonical owners.
- Metadata/SEO, Retention, Keyword, Publishing Calendar, Audience, Discovery/Distribution and Monetization workbenches are consolidation targets, not new backend domains.

### New planning contribution

This specification adds:
- one explicit compact-widget vs Toolbox-workstation promotion law;
- one twenty-surface promotion/consolidation map;
- one normalized workflow-recipe schema;
- forty detailed recipes as reusable orchestration prior art;
- a rule that recipes map to shared capabilities and candidate work families instead of becoming one task each;
- an end-to-end optimization doctrine centered on identity continuity, provenance, evaluation and bounded side effects.

## Current-main handoff foundations already present

The current-main audit prevents this specification from reopening work that already exists:

- `src/services/viewTubeToolChains.ts` already defines `ViewTubeToolCapability`, `ViewTubeActionPacket`, `accepts`, `produces`, compatible-target resolution and eight suggested chain templates.
- persisting an ActionPacket already creates a GenerationRecord, stores a JSON artifact through the Vault adapter, links the generated asset to ContentBuild when scoped, appends a ContentBuild handoff event and enqueues Brain handoffs;
- `src/components/SendToMenu.tsx` already ranks compatible destinations, persists packets, records internal handoff audit events and routes packet identity to destinations;
- `src/components/ThumbnailHandoffBar.tsx` is already a concrete universal packet producer;
- `src/services/viewTubeWorkflowLearning.ts` already records accepted selections and skipped-higher-ranked negative signals only when creator learning is enabled;
- `src/views/WorkflowChainBuilder.tsx` + `src/services/workflowEngine.ts` already provide a separate local workflow-chain foundation with steps, status, artifacts and provenance.

The remaining program is therefore primarily **convergence, richer identity, missing producer/receiver wiring, Toolbox promotion and certification**, not construction of these foundations from zero.

## Candidate work families

The recipes collapse into a much smaller implementation set:

1. **Promotion framework — OPEN.** Reusable compact-widget → Toolbox launcher/resume contract.
2. **Handoff metadata convergence — PARTIAL.** `accepts` / `produces` already exist in `VIEWTUBE_TOOL_CAPABILITIES`; add required-context, mutation/resume semantics, explicit suggested-handoff metadata where useful, and bridge tool metadata with WidgetRegistry rather than recreating it.
3. **Universal operation envelope — PARTIAL.** ActionPacket already fans into GenerationRecord, Vault and ContentBuild events; converge these IDs/receipts/BrainTrace/render-generation records toward shared operation identity.
4. **Workflow recipe registry — PARTIAL.** Eight hard-coded suggested chain templates already exist; generalize them into structured validated recipe definitions and add the remaining catalog without creating another execution owner.
5. **Workflow chain viewer convergence — PARTIAL.** WorkflowChainBuilder/workflowEngine already exist; connect them to universal packet receipts, evidence, canonical IDs and outcomes instead of building a parallel viewer.
6. **Brain-compatible destination ranking — PARTIAL.** Preference-based ranking already exists; extend ranking with bounded Project/evidence/required-context compatibility and User Controls.
7. **Creator preference learning — IMPLEMENTED FOUNDATION / CERTIFY + CONNECT.** Accepted/rejected suggestion signals are already creator-learning gated; remaining work is governed outcome/evaluation integration, freshness/decay policy if required, and certification.
8. **Core Toolbox promotions — OPEN / PER-SURFACE AUDIT.** Director, Publisher, Manager, Autopsy, Oracle, Brain Hub, Comment Operations, Optimization, Asset Engine and Thumbnail Studio.
9. **Domain-workbench consolidation — OPEN / EXISTING PLAN CONTINUATION.** Metadata/SEO, Retention, Keyword, Calendar, Audience, Discovery and Monetization.
10. **Project/asset identity continuity certification — PARTIAL FOUNDATION.** ActionPacket already carries Project/ContentBuild/video/evidence fields and persists scoped events; prove package/asset/version identity through real destination consumers.
11. **Outcome/evaluation closure — OPEN / SHARED PROGRAM CONTINUATION.** Consequential recipes declare outcome target/checkpoint and bind later measurements.
12. **Responsive/accessibility certification — OPEN.** Compact widget and full Toolbox pairs pass desktop/narrow/mobile portrait/mobile landscape and relevant state matrices.

These are candidate work families. Permanent VT task IDs must not be allocated until Task Authority VNext identity is resolved and duplicate/current-main reconciliation is complete.

## Recommended pilot chains

The first implementation pilots should exercise different payload types without requiring broad system rewrites:

1. **Thumbnail Refresh Experiment** — image asset + variant + Video Manager mutation + analytics outcome.
2. **Comment to New Video** — audience evidence + Brain + Project creation handoff.
3. **Editor Missing-Shot Recovery** — timeline selection + generation + Asset Engine lineage + Editor return.
4. **72-Hour Launch Review** — ApprovedPublishSnapshot + analytics + Brain + Manager intervention.
5. **Missing Asset Finder Loop** — package slot + Vault lookup + conditional generation + readiness projection.

## Acceptance criteria

This specification is successfully implemented when:

- no promoted Toolbox creates a new parallel persistence owner;
- compact Dashboard versions remain bounded and recognizable;
- every supported handoff declares accepted and produced payloads;
- Project/ContentBuild/video/asset/package/evidence identities survive supported chains;
- generated artifacts preserve prompt/model/provider/provenance receipts where relevant;
- creator approval remains required for external mutations;
- workflows can stop safely at any step;
- chain history can show source, transformations, destination, artifacts, evidence and outcome linkage;
- accepted/rejected next-step suggestions are never treated as durable preference learning unless learning is enabled and governed;
- the forty recipe catalog remains prior art and orchestration guidance, not forty hidden task identities;
- each implementation slice is verified through the owning Domain Authority and ViewTube Verification contract.
