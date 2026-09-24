# Editor Brain Hub Assistant — Implementation Plan

**Status:** active-plan  
**Scope:** creator-facing AI assistant embedded in the ViewTube desktop/mobile editor  
**Canonical owner / concern:** BrainRuntime owns reasoning/orchestration; Editor owns user interaction and editor-state application; Video Director owns async media-generation jobs; Asset Engine/Vault owns generated asset identity/provenance  
**Date created:** 2026-09-24  
**Last audited main commit:** 96a3cb13fcdfd36720aebd845e0ac5f7a5ab12c1  
**Parent authority:** docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md  
**Related authority:** docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md

## Objective

Add a creator-facing Brain assistant to both desktop and mobile editors that can:

- explain how the editor works;
- locate and open features;
- guide users through workflows;
- inspect the active selection/range/project;
- propose reversible edits;
- create captions and other project assets;
- generate image/video assets through the existing generation architecture;
- carry accepted actions through editor state safely;
- retain one conversation/project context across device layouts.

The assistant must not become a second AI runtime or a second editor state system.

## Capability map

| Module | Responsibility | Depends on |
| --- | --- | --- |
| editor-assistant-context | bounded selection/range/project/UI context packet | EditorStore, capability registry |
| editor-guide | explain, find, navigate, walkthrough | context, editor docs/capabilities |
| editor-proposals | typed edit proposals and preview | context, BrainRuntime, EditorStore |
| editor-actions | accepted semantic editor tools | proposals, undo/redo |
| editor-captions | caption/transcript generation and editing | BrainRuntime/tool adapter, project media |
| editor-generative-media | image/video generation request handoff | Video Director, Asset Engine |
| editor-assistant-ui | desktop sidecar + mobile page/sheet | all above |
| editor-assistant-evals | behavior, safety, parity and capability truth | all above |

Dependency order:
editor-assistant-context → editor-guide → editor-proposals → editor-actions → editor-captions/editor-generative-media → editor-assistant-ui hardening → eval/certification.

## Architecture decisions

1. **BrainRuntime remains the only creator reasoning/orchestration entry point.**
2. **Editor state changes are typed proposals before mutation.**
3. **Every accepted mutation enters normal undo/redo history.**
4. **Guide mode is read-only and may navigate/highlight UI without editing project content.**
5. **Media generation goes through Video Director provider/jobs.**
6. **Generated durable assets enter Asset Engine/Vault before final timeline commitment.**
7. **The assistant sees stable capability IDs, not scraped UI labels.**
8. **Mobile and desktop use one assistant conversation/project context, adapted to different layouts.**
9. **Analytics enters only as evidence through existing canonical analytics/Brain paths.**
10. **No model may infer a feature exists merely because it appears in an old plan or prototype.**

## Typed proposal contract

Every editor proposal should carry:
- proposalId;
- projectId / contentBuildId;
- source user request;
- scope: selection, range, project or ContentBuild;
- target IDs;
- semantic operation type;
- before summary;
- proposed after summary;
- concrete patch or action payload;
- expected visual/audio consequence;
- reversible flag;
- approval requirement;
- estimated cost if an external generation operation is involved;
- evidence/context refs;
- confidence and unresolved assumptions.

## Initial semantic tool set

Read-only:
- explain_editor_feature
- find_editor_feature
- inspect_selection
- inspect_timeline_range
- search_project_assets
- start_guided_walkthrough

Proposal:
- suggest_edit
- propose_timeline_patch
- propose_audio_cleanup
- propose_caption_edit
- propose_reframe

Mutating after approval:
- apply_editor_patch
- open_editor_panel
- create_caption_track
- insert_asset_candidate
- prepare_export

Creation:
- generate_captions
- translate_captions
- generate_video_asset
- generate_image_asset
- prepare_editor_package

## UI behavior

Desktop:
- contextual sidecar that can collapse;
- visible scope indicator: Selection / Range / Project / Channel;
- proposed changes tray with Accept, Accept All, Revise, Reject;
- generation jobs visible without blocking editing;
- Help/Explain actions surfaced contextually.

Mobile:
- same conversation and tool capabilities;
- dedicated assistant page/sheet;
- scope and proposal cards optimized for touch;
- no hidden destructive action behind gesture-only controls;
- assistant page must not permanently steal Preview or Timeline space.

## User guidance model

The assistant should answer:
- "How do I add captions?"
- "Where is the transition browser?"
- "Why is this button disabled?"
- "How do I do this on mobile?"
- "Show me how to trim precisely."
- "What does this effect do?"
- "Which parts of this project can I edit from my phone?"

When the user says "show me", the assistant should prefer guided navigation/highlighting where supported, not only prose.

## Media-generation flow

Editor request  
→ BrainRuntime intent/context  
→ media-generation semantic tool  
→ Video Director canonical request  
→ provider registry / adapter  
→ async job  
→ progress/cancel/retry  
→ output ingestion  
→ Asset Engine/Vault provenance record  
→ candidate in editor  
→ creator accepts/rejects  
→ Remotion composition/render

No direct Editor React component → Google/Veo call.

## Provider rules

- provider and model support are runtime-discovered or config-declared;
- limits and model IDs are time-sensitive;
- provider acceptance must be tracked to avoid duplicate billable fallback;
- cancellation semantics must distinguish pre-submit vs accepted-provider states;
- cost/credits are shown before or at submission and reconciled after completion;
- rejected/failed outputs retain useful job provenance without becoming timeline content.

## Evaluation cases

Minimum deterministic and model-assisted eval set:
1. feature explanation from current capability registry;
2. navigation to existing feature;
3. refusal to invent planned-only feature;
4. desktop/mobile instruction parity;
5. selection-scoped trim proposal;
6. project-scoped pacing proposal;
7. proposal accept/reject;
8. undo accepted AI edit;
9. caption generation with correct timing schema;
10. generated media handoff with ContentBuild identity;
11. provider error/cancel/retry;
12. cost disclosure;
13. stale reference/model handling;
14. accessibility guidance;
15. analytics evidence missing vs zero;
16. user asks assistant to delete source footage;
17. user changes orientation mid-conversation;
18. same project opens on desktop and mobile after assistant edit.

## Phases and tasks

### Phase 1 — context + guide

- Define EditorAssistantContext from current UI/selection/project state.
- Add capability lookup adapter from the real capability registry.
- Add Guide-mode Brain task contract.
- Add find/open/highlight semantic navigation actions.
- Build desktop and mobile assistant shells using current primitives.
- Add tests for existing vs unavailable capabilities.

Acceptance:
- explanation references only real capabilities;
- mobile and desktop share conversation/project identity;
- no project mutation occurs in Guide mode.

### Phase 2 — proposal-first editing

- Define EditorProposal schema.
- Map safe proposal types to existing EditorStore operations.
- Add proposal preview tray.
- Add per-proposal Accept/Reject/Revise.
- Wire accepted changes into undo/redo.
- Add diff/summary rendering for timing, transforms, text, audio and captions.

Acceptance:
- no silent mutation;
- every accepted change is undoable;
- rejected proposal changes nothing.

### Phase 3 — captions and semantic edit recipes

- Generate captions/transcript through approved services.
- Add caption correction/translation proposals.
- Add initial recipes: Tighten Pacing, Remove Dead Air, Shorts Cut, B-roll Pass, Dialogue Cleanup.
- Maintain source timing/provenance.

### Phase 4 — Generative Media

- Add Google media provider adapter to Video Director after official API verification.
- Start with text-to-video and image-to-video.
- Add first/last frame, reference subject, extension and generated audio only where current provider docs/contracts support them.
- Add Gemini image generation/editing.
- Persist outputs before editor insertion.
- Add queue/progress/cancel/retry/variant UI shared with Video Director/widget.

### Phase 5 — evidence and learning

- Allow analytics-backed recommendations through canonical Brain evidence only.
- Record creator acceptance/rejection of suggestions.
- Link accepted action/artifact to measurable outcomes where possible.
- Feed evaluated results into governed Learning Candidates, not directly into durable profile knowledge.

## Verification checkpoints

After every phase:
- focused tests;
- Brain/runtime contract tests;
- editor project schema validation;
- desktop and mobile UI captures for visible changes;
- keyboard + touch;
- undo/redo;
- error/empty/loading/disabled states;
- project round-trip;
- no direct provider call in editor UI;
- living master resource updated.

## Risks

- Assistant hallucinating an old/planned control.
- Parallel editor state path.
- Direct provider calls bypassing Video Director.
- Generated media without provenance.
- Mobile UI becoming a reduced product.
- Non-reversible AI edits.
- Provider limits/model IDs changing.
- Context packet becoming too large.
- Analytics claims losing source/window/grain provenance.
- UI help drifting from actual capability registry.

## Ask first

Ask before:
- new project schema or migration;
- new provider billing path;
- OAuth/scope expansion;
- irreversible tool action;
- automatic acceptance of AI edits;
- direct publishing;
- Remotion version upgrade;
- durable learning promotion policy changes.
