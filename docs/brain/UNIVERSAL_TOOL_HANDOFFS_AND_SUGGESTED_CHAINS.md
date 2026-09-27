# ViewTube Universal Tool Handoffs + Suggested Chains

**Status:** PRODUCTION-LINKED ARCHITECTURE REFERENCE  
**Current AI authority:** docs/domains/BRAIN.md
**Last audited main:** 3ed2bc91f324338fd110a160d65ddbed93806142
**Scope:** ViewTubeActionPacket / suggested-chain product rules and creator-controlled cross-tool handoffs. This is a protocol reference, not a second Brain runtime or persistence owner.

## Decision

Action packets and workflow chains are a ViewTube-wide protocol. They are not owned by unfinished Super Tools.

The first-class participants are the production Studio Hub tools that already exist: Video Manager, Video Publisher, Content Analysis, Thumbnail Studio, Community Posts, Comment Responder, End-Screen Architect, Pre-Launch Priming, Hook Generator, and Tactics Engine. The current Studio Hub mounts those ten tools directly. Super Tools, dashboard widgets, analytics visuals, Projects, Vault, Brain, and VT_E1 can join the same protocol as their integration points mature.

## Core model

`Tool or Widget -> ViewTubeActionPacket -> compatible destination -> result/artifact -> workflow/project -> Brain reflection`

A packet carries a typed payload, creator/channel/project/video context, evidence, provenance, and suggested destinations. It does not force a destination. The creator can accept a suggested next tool, choose another compatible destination, save the packet to Vault, or stop the chain.

## Toolbox promotion and workflow recipe specification

The detailed compact-widget → Toolbox promotion boundary, twenty promotion/consolidation candidates, normalized workflow recipe contract, forty creator workflow recipes, candidate work families, and pilot-chain acceptance criteria are consolidated in:

`docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md`

This reference remains the protocol-level description of `ViewTubeActionPacket` and suggested chains. The specification does not create a second packet/runtime owner; it applies this protocol to reusable creator workflows and explicitly prevents forty recipes from becoming forty duplicate task or persistence systems.

## Immediate examples

1. Thumbnail Studio -> Video Publisher -> Video Manager
   - Send the approved thumbnail forward without re-uploading or reselecting it.
   - Preserve which Thumbnail Studio generation produced it.

2. Generated image -> Vault -> Community Posts
   - Any image generated in a ViewTube tool can become an image post or image-poll asset.
   - Vault is optional when the creator wants a direct handoff, but should preserve reusable assets.

3. Script -> Projects/Calendar -> Storyboard Studio -> VT_E1
   - A script can become a scheduled project, then a storyboard, then an editor timeline/input packet.
   - The script, storyboard, and generated assets can all be preserved in Vault.

4. Content Analysis -> Hook Generator -> Thumbnail Studio -> Pre-Launch Priming
   - The same evidence packet follows the creative decisions so the hook and thumbnail do not lose the reason they were proposed.

5. Comment Responder -> Brain -> Projects/Calendar
   - A useful audience request can become a content opportunity and then a scheduled project.

6. Video Manager -> Content Analysis -> End-Screen Architect -> Video Manager
   - Analyze a source video, select the strongest next-video destination, build the end-screen plan, and attach the plan back to the canonical video context.

7. Tactics Engine -> Hook Generator / Thumbnail Studio -> Projects
   - Convert strategy into a concrete experiment rather than leaving it as advice.

8. Vault -> VT_E1
   - Send images, B-roll, scripts, storyboards, audio, captions, or other production assets into the active editor context while retaining provenance.

## Suggested-chain UX

Every integrated tool should eventually expose a compact `SEND TO` / `NEXT` control after producing a useful output.

The menu should rank:
- recommended next step;
- other compatible tools;
- save to Vault;
- add to Project;
- ask Brain what to do next.

Suggested chains should be contextual rather than hard-coded navigation. A thumbnail should rank Publisher and Video Manager. A script should rank Project, Storyboard, Editor, and Vault. An image should rank Community Posts, Thumbnail Studio, Editor, and Vault. An analysis result should rank Brain, Tactics, Hook Generator, Thumbnail Studio, and Projects.

## Widgets

Dashboard widgets are not second-class. A widget may be:
- an evidence source;
- a packet producer;
- a packet consumer;
- a lightweight action/capability inside a chain.

Examples: an opportunity widget can send an opportunity to Projects; an audience-request widget can send a request to Brain or a script tool; a revival widget can send a selected video to Thumbnail Studio, Content Analysis, or Community Posts; a launch widget can receive the publish package and track its first 72 hours.

The widget registry should eventually declare `accepts`, `produces`, and `suggestedHandoffs` using the same payload vocabulary as Studio tools.

## Compatibility with existing Super Tool code

`superToolActionPackets.ts` remains valid for existing Super Tool callers. New production integrations should use the universal `ViewTubeActionPacket` contract in `src/services/viewTubeToolChains.ts`. Once enough consumers are migrated, `createSuperToolActionPacket()` can become a compatibility wrapper around the universal packet rather than a separate architecture.

## Workflow recipe catalog and Toolbox promotion

The detailed multi-tool recipe catalog now lives in `docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md`. That specification adds forty creator workflows and a twenty-surface widget/Toolbox promotion audit while preserving this document as the protocol reference for `ViewTubeActionPacket`, suggested destinations and creator-controlled handoffs.

The forty recipes are not forty new backend workflows and must not be allocated as forty tasks. They should reuse a smaller set of shared seams:

1. evidence/opportunity → Project;
2. Project/script/storyboard → assets/editor;
3. editor selection → generation → canonical asset → editor;
4. package/variant → Publisher/Manager;
5. published snapshot → analytics → evaluation;
6. comments/audience → Brain/Projects/Community;
7. package slot → Vault reuse or conditional generation.

The first cross-system pilot set is:
- Thumbnail Refresh Experiment;
- Comment → New Video;
- Editor Missing-Shot Recovery;
- 72-Hour Launch Review;
- Missing Asset Finder.

Widget participation should stay compact: status, evidence, selection, quick action and resumable handoff. Multi-stage authoring, generation, comparison, provenance and history belong in Toolbox-scale workstations.

## Safety and creator control

A chain recommendation is not permission to perform an external write. Sending context between ViewTube tools is an internal handoff. Posting a comment, publishing/uploading, modifying external data, or other external mutations must still pass the relevant creator approval and User Control gates.

## Current implementation status and next section

Current-main reconciliation at `3ed2bc91f324338fd110a160d65ddbed93806142` changes several older “next” items into implemented or partial foundations:

1. **SendToMenu — IMPLEMENTED FOUNDATION.** `src/components/SendToMenu.tsx` resolves compatible targets, persists the packet, records an audit event, ranks destinations, records creator-learning preference signals and routes with packet identity.
2. **Thumbnail Studio handoff — IMPLEMENTED PRODUCER / RECEIVER PARITY PARTIAL.** `ThumbnailHandoffBar.tsx` produces a universal thumbnail packet and suggests Publisher, Manager, Pre-Launch, Vault and Editor. Destination-specific consumption still needs capability-parity certification.
3. **Community Posts image intake — REGISTRY READY / RECEIVER INTEGRATION OPEN.** The universal capability registry declares image intake, but current-main search did not establish a dedicated universal receiver on the Community Posts surface.
4. **Video Manager selection → Analysis / End Screen / Brain — OPEN PRODUCER INTEGRATION.** Current Manager contains a universal receiver for specific inbound optimization packets; a canonical outbound selection packet still needs explicit implementation/certification.
5. **Comment Responder audience request → Brain / Projects / Community — OPEN PRODUCER INTEGRATION.**
6. **Script/storyboard → Project / Storyboard / Editor / Vault — PARTIAL.** Super Tool packets and universal payload compatibility exist, but exact producer/receiver continuity must be certified rather than assumed.
7. **Tool capability metadata — IMPLEMENTED FOUNDATION / WIDGET BRIDGE OPEN.** `VIEWTUBE_TOOL_CAPABILITIES` already owns `accepts` and `produces`; remaining work is required-context, mutation/resume semantics and WidgetRegistry/tool-registry convergence rather than recreating these fields.
8. **Destination ranking — IMPLEMENTED FOUNDATION / CONTEXT EXPANSION OPEN.** `rankWorkflowTargets` already adapts order from creator-learning signals; bounded Project/evidence/required-context ranking remains open.
9. **Accepted/rejected workflow preference signals — IMPLEMENTED FOUNDATION.** `buildWorkflowSelectionSignals` records the chosen target positively and skipped-higher-ranked targets negatively; persistence is gated by the creator-learning User Control. Remaining work is governed outcome/evaluation integration and certification.
10. **Workflow chain UI/storage — IMPLEMENTED PARALLEL FOUNDATION / CONVERGENCE OPEN.** `WorkflowChainBuilder.tsx` and `workflowEngine.ts` already create chains, steps, statuses and artifact links. They must be reconciled with universal ActionPacket receipts, evidence IDs, canonical identities and outcomes rather than replaced by a second chain viewer.

The next work should therefore focus on **convergence and continuity**, not rebuilding these foundations: expand universal packet identity/provenance, wire the missing producers/receivers, bridge widget/tool registries, converge the existing WorkflowChainBuilder with universal receipts, and certify the pilot chains defined by the Toolbox Promotion + Workflow Chain specification.
