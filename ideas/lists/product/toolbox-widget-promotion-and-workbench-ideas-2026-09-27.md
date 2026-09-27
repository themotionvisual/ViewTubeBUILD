# Toolbox, Widget and Workbench Ideas

**Idea List ID:** IDEA-LIST-TOOLBOX-WIDGETS-001  
**Production Date:** 2026-09-27  
**Source Type:** conversation + governed workflow specification  
**Source Conversation:** current ChatGPT workflow/tool/widget audit and continuation  
**Canonical Reference:** docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md  
**Item Count:** 32  
**Status:** SOURCE PROVENANCE — ideas require consolidation/review before promotion

This source list preserves the twenty widget/toolbox/workbench ideas plus twelve shared workflow-infrastructure ideas. Promotion changes presentation scale and workflow composition; it does not create duplicate backend owners.

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
