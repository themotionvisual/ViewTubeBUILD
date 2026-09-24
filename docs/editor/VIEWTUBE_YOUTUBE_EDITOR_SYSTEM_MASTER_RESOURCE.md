# ViewTube YouTube Editor System — Living Master Resource

**Status:** canonical living resource  
**Scope:** unified desktop + mobile video editor, editor UX, project portability, Remotion, AI generation, Editor Brain assistant, assets, templates, Studio Hub integration, widgets, analytics integration, skills, plans, references, branch donors, verification, and update history  
**Canonical owner / concern:** ViewTube Editor System integration authority  
**Date created:** 2026-09-24  
**Last audited main commit:** 96a3cb13fcdfd36720aebd845e0ac5f7a5ab12c1  
**Supersedes:** no specialized authority automatically; this document consolidates and indexes them. A specialized authority remains authoritative for its bounded concern until explicitly superseded here and in docs/DOCUMENTATION_REGISTRY.md.  
**Related authorities:** docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md; docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md; docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md; docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md; docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md; docs/DOCUMENTATION_GOVERNANCE.md

## 1. Mission

ViewTube should expose one editor product across desktop and mobile:

> One project model. One durable ContentBuild identity. One capability vocabulary. One Asset/Vault lineage. One Remotion render contract. One BrainRuntime orchestration path. Different adaptive layouts, never different products.

Desktop and mobile must be able to open the same project without translation loss. A capability that exists on one editor surface should either exist on the other surface or be explicitly marked as a parity gap in this document with an owner, plan, and verification target.

This file is intentionally editable Markdown. It is the editor program's shared source of truth between conversations, coding agents, implementation branches, audits, and future planning passes.

## 2. Mandatory update contract for every editor conversation or agent

Any conversation, agent, PR, branch, audit, prototype, or implementation pass that touches the editor system MUST update this document before the work is considered handed off.

Every pass must:

1. Read this document before planning or changing editor behavior.
2. Identify the current project/state/render/AI owner instead of creating a parallel subsystem.
3. Update the Current Work table when work is planned, started, blocked, partially completed, completed, or superseded.
4. Append one row to the Update Log. The log is append-only; never rewrite history to make work appear finished.
5. Add every newly created or materially used editor plan, reference, skill, standalone HTML file, branch donor, script, test, API contract, or external source to the appropriate registry below.
6. Record exact branch/PR/commit and verification evidence when available.
7. Mark anything inferred from a conversation or old plan as unverified until checked against current main.
8. If the architecture changes, update this resource before or in the same change as implementation.
9. If mobile and desktop behavior changes, update the parity notes and verify both surfaces.
10. If AI can mutate editor state, document the tool, permission, side effects, reversibility, approval behavior, and undo behavior.

### Status vocabulary

- planned — accepted direction, no implementation begun
- started — implementation or audit is actively underway
- partial — meaningful work exists but acceptance criteria are not met
- blocked — work cannot progress until a named dependency is resolved
- completed — acceptance criteria are verified with evidence
- superseded — replaced by a newer implementation or authority

A conversation saying something is done is not sufficient evidence. Completed requires code/runtime/test or equivalent repository evidence.

## 3. Current system architecture

### 3.1 Shared creator identity

The creator-facing unit is Project. ContentBuild remains the durable engineering identity underneath. The project, Video Package, editor state, generated assets, Vault collection, Publishing Package, and published outcome should remain manifestations of the same content identity rather than disconnected copies.

Primary authorities:
- docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md
- docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md

### 3.2 Editor state

The desktop and mobile editors must converge on the same canonical project/state contracts. Current mobile implementation visibly uses EditorStore under src/features/editor/mobile/state and current editor code already includes a bridge history for desktop/mobile state.

Rules:
- do not create a mobile-only project schema;
- do not add desktop-only effect or transition identifiers that mobile cannot deserialize;
- do not fork asset identity by device;
- maintain round-trip desktop → mobile → desktop fixtures;
- keep capability IDs stable even when layout differs.

### 3.3 Rendering

Remotion owns deterministic time, frames, composition registration, media composition, and final output. Current repository authority in src/remotion-editor is Remotion 4.0.465. The repository must not casually mix Remotion package versions.

Generative models create source media; Remotion creates deterministic composition, typography, overlays, captions, transitions, effects, data visuals, timing, and final render output.

### 3.4 AI

BrainRuntime remains the creator-facing reasoning and orchestration owner:
- src/services/brain/runtime/BrainRuntime.ts
- src/services/brain/runtime/BrainModelGateway.ts
- docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md

Editor UI must not call a model provider directly. The editor asks BrainRuntime for a capability; BrainRuntime gathers bounded context/evidence and returns explanations, proposals, or semantic tool actions.

### 3.5 Generative media

Video Director owns asynchronous generative-media job orchestration. Google Veo or any future provider should be added through the existing provider/job abstraction, not as an editor-specific provider stack.

Generated outputs must enter Asset Engine / Vault with provenance before they become durable timeline content.

## 4. Desktop + mobile parity contract

The feature set is shared; presentation adapts.

| Shared capability | Desktop expression | Mobile expression |
| --- | --- | --- |
| Project + media | rail/library + inspector | page/sheet + visual browser |
| Design Library | persistent browser + filters | full-height visual library |
| Preview | central dominant canvas | highest-priority ratio-correct region |
| Clip/text/asset inspect | contextual inspector | contextual page/sheet |
| Timeline | large compound timeline | compact compound timeline |
| FX | catalog + inspector | same catalog in touch cards |
| Transitions | seam + inspector | same seam contract + touch editor |
| Captions/transcript | panel/workspace | page/sheet |
| AI Brain | contextual sidecar | dedicated page/sheet or sidecar where space permits |
| Generate | queue + browser | same queue + generation page |
| Export | export workspace | export page/sheet |
| Help | contextual explainers | contextual explainers + guided navigation |

Parity is about capabilities and project semantics, not identical pixel placement.

## 5. Editor Brain Hub Assistant plan

The editor needs a first-class assistant that can both teach and act.

### 5.1 User modes

**Guide mode — read-only**
- explain any control, panel, timeline behavior, shortcut, or editor concept;
- answer "where is..." and navigate the user to the relevant surface;
- start guided walkthroughs;
- explain error, empty, loading, disabled, and capability-unavailable states;
- use current capability registry and this resource so it never invents a feature.

**Assist mode — proposal-first**
- analyze the selected clip, range, scene, transcript, or full project;
- propose trims, splits, pacing changes, audio adjustments, caption changes, overlays, B-roll placements, transitions, and layout changes;
- return typed patches that can be previewed individually or together;
- require Accept / Revise / Reject before mutation unless the action is explicitly configured as safe and reversible.

**Create mode — generative assets**
- generate video, images, captions, subtitles, transcripts, title cards, thumbnails, overlays, visual assets, voice or sound assets where an approved provider exists;
- send media-generation work through Video Director;
- persist results through Asset Engine/Vault;
- insert results as candidate assets before making them final.

**Operate mode — semantic tool execution**
- open panels, focus selected objects, prepare exports, create caption tracks, organize assets, apply accepted editor patches, and launch supported workflows;
- mutating actions declare side effects, approval requirement, reversibility, and undo behavior.

### 5.2 Context scopes

The assistant should understand four nested scopes:
1. Selection — active clip, text element, transition, effect, caption, asset, or control.
2. Range / scene — selected timeline range and adjacent context.
3. Project — full editor project, transcript, asset set, settings, output targets.
4. ContentBuild / channel — durable project intent, package state, relevant analytics evidence, channel profile, and publishing context when permissions allow.

Context must be bounded and just-in-time. Do not dump raw analytics or entire conversation histories into every turn.

### 5.3 Target flow

Editor UI  
→ Editor Assistant Controller  
→ BrainRuntime  
→ semantic editor tools / typed edit proposals / media-generation requests  
→ user preview + approval  
→ EditorStore or Video Director  
→ Asset Engine / Vault when assets are created  
→ undoable editor state  
→ Remotion preview/final render

### 5.4 Initial semantic tools

- explain_editor_feature
- find_editor_feature
- open_editor_panel
- start_guided_walkthrough
- inspect_selection
- suggest_edit
- propose_timeline_patch
- generate_captions
- translate_captions
- search_project_assets
- generate_video_asset
- generate_image_asset
- insert_asset_candidate
- prepare_editor_package
- prepare_export

The tool catalog should be semantic and task-oriented rather than a large set of tiny getters and setters.

### 5.5 Mutation safety

Every AI mutation must:
- produce a typed patch or semantic action record;
- identify target project and selection;
- show intended effect before commit;
- be individually accept/rejectable where practical;
- enter normal editor undo/redo history;
- preserve project schema validity;
- never silently delete source media;
- never bypass user permission, provider cost disclosure, or external-write approval.

### 5.6 Help and onboarding behavior

The assistant should be able to:
- highlight the relevant panel/control;
- explain why a control is disabled;
- adapt instructions for desktop, mobile portrait, mobile landscape, keyboard, or touch;
- offer a "show me" walkthrough rather than only text;
- link to the exact internal guide/reference;
- explain keyboard shortcuts and touch alternatives;
- use contextual examples from the user's current project without changing it.

### 5.7 Assistant evaluation matrix

A release-ready assistant should pass tests for:
- correct feature explanations;
- no hallucinated unavailable features;
- correct page/panel navigation;
- desktop/mobile instruction parity;
- correct selected-item scope;
- safe typed edit proposals;
- accept/reject/undo fidelity;
- caption generation;
- media-generation handoff;
- provenance preservation;
- provider failure and cancellation;
- cost/usage display;
- accessibility-aware guidance;
- missing-data honesty;
- no direct provider calls from editor UI.

A detailed implementation plan lives at docs/editor/EDITOR_BRAIN_HUB_ASSISTANT_PLAN.md.

## 6. Generative Media: Veo + image generation

Current public-source research as of 2026-09-24 indicates:
- Veo 3.1 production model IDs include veo-3.1-generate-001 and veo-3.1-fast-generate-001.
- Veo 3.1 supports text-to-video, image-to-video, first/last-frame guidance, reference images, extension, supported aspect ratios, and synchronized audio on supported endpoints/configurations.
- Veo is a video model; still-image creation belongs to Google's image-generation family.
- Gemini 3.1 Flash Image is the current recommended general image-generation/editing route in the Gemini family; older Imagen 4 Gemini API endpoints were deprecated/shut down in August 2026.

Authoritative external sources:
- https://ai.google.dev/gemini-api/docs/veo
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/veo/3-1-generate
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos-from-first-and-last-frames
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/generate-videos-from-references
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/extend-videos
- https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image
- https://ai.google.dev/gemini-api/docs/image-generation
- https://ai.google.dev/gemini-api/docs/deprecations

Provider capabilities must be discovered and validated at runtime; model IDs and limits are time-sensitive.

### 6.1 Canonical media-generation request

A generation request should carry:
- contentBuildId and editorProjectId;
- purpose;
- prompt and optional negative guidance;
- target aspect ratio, duration, resolution and variant count;
- reference asset IDs;
- optional first/last frames;
- optional source timeline range;
- provider policy and provider/model selection;
- audio-generation preference where supported;
- seed or deterministic hint where supported;
- creator/user identity and permission context.

### 6.2 Provenance

Store:
- provider/model/version;
- prompt and prompt-template version;
- reference assets;
- source clip/range;
- seed/settings where available;
- requested and actual cost/credits;
- timestamps and job IDs;
- safety/moderation/error state;
- output asset IDs;
- selected/used/rejected variant;
- later outcome links when measurable.

## 7. Remotion integration contract

Repository state verified on main at 96a3cb13fcdfd36720aebd845e0ac5f7a5ab12c1:
- src/remotion-editor/package-lock.json pins Remotion packages at 4.0.465.
- src/remotion-editor/src/assets/QA.md explicitly treats 4.0.465 as repository authority.
- src/remotion-editor contains asset registry, composition, engine, cloud/player, transitions, captions/media, and render-related architecture.
- src/editor-design-library/integration/remotionAssetAdapter.ts already bridges design-library assets.

Rules:
1. Keep all @remotion packages version-aligned.
2. Upgrade only through a controlled migration with preview/final-render fixtures.
3. Use Player/preview for interactive editor playback and a server-authoritative final render path.
4. Keep frame-based deterministic animation.
5. Generated media becomes source material; exact text/graphics/captions/timing remain Remotion-controlled.
6. Add preview-vs-final frame parity fixtures before broadening AI-generated timelines.
7. Treat current official Remotion documentation and official Agent Skills as upstream authority when available.

Official sources:
- https://www.remotion.dev/
- https://www.remotion.dev/docs
- https://www.remotion.dev/docs/ai/skills
- https://github.com/remotion-dev/skills

## 8. FLOWSTACK + UI system rule

Editor UI work should use the repository's existing primitives, Toolbox/Subtoolbox system, and current FLOWSTACK/UI-review skills when they are available in the active agent environment.

Do not invent FLOWSTACK component APIs from memory. Exact package/version-specific implementation is blocked until the repository dependency or package authority for the requested component is inspected. If FLOWSTACK is only available as an agent skill and not a repository dependency, use it for design/review guidance without claiming a runtime dependency exists.

Primary UI authorities:
- docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md
- docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md
- relevant component-library source and tests
- this document's desktop/mobile parity contract

## 9. Skill and workflow registry

### 9.1 Editor lead skill

**viewtube-youtube-editor-system**  
Installed in:
- .claude/skills/viewtube-youtube-editor-system/SKILL.md
- .codex/skills/viewtube-youtube-editor-system/SKILL.md
- skills/viewtube-youtube-editor-system/SKILL.md

This skill is the lead routing and governance skill for all editor-specific work and requires agents to update this document.

### 9.2 Existing repo skills to reuse

| Skill | Role in editor work |
| --- | --- |
| viewtube-ai-system-governor | BrainRuntime, evidence, tools, generation, evals, anti-duplication |
| viewtube-prince-brain | Brain architecture/reasoning specialist |
| viewtube-skill-finder | choose smallest skill set before creating more |
| viewtube-solution-finder | search existing solution/prior art |
| viewtube-docs-grill | interrogate docs and stale assumptions |
| viewtube-verification-chancellor | verification/evidence discipline |
| viewtube-toolbox-builder | Studio Toolbox component work |
| viewtube-mobile-widget-system | touch/mobile widget composition |
| viewtube-widget-dashboard | Dashboard widget integration |
| viewtube-widget-dashboard-system | dashboard system-level widget integration |
| youtube-api-expert | only when editor work actually needs YouTube API capabilities |

### 9.3 Existing locked external skills relevant to this program

These exist in skills-lock.json but the external skill supply chain is explicitly unreviewed. Use only after reviewing the instruction content for the current task.

- ai-video-generation
- remotion-render
- captions
- subtitles
- transcript
- video-transcript
- YouTube Thumbnail Generation
- youtube-clipper
- youtube-seo
- youtube-tools
- ui-ux-pro-max
- ckm:design-system
- web-design-guidelines
- clean-code
- improve-codebase-architecture
- tdd
- prototype
- handoff
- review

### 9.4 High-value agent skills available in the current ChatGPT environment

These are environment capabilities, not repository runtime dependencies. A future agent host may not have all of them.

- Official Remotion skill family: best practices, markup, multimedia, interactivity, render, Studio, captions, SaaS, docs, upgrade.
- FLOWSTACK UI: builder, review, compose.
- UI Audit.
- Agent Skills: spec-driven development, planning/task breakdown, frontend UI engineering, source-driven development, TDD, incremental implementation, code simplification, accessibility/security/performance/observability workflows.
- Matt Skills Curated: skill-conductor, writing-for-agents, code review, research and specification workflows.
- Plan and document workflows.

If a host lacks one of these, the repository skill and the official source documentation are the fallback. Do not block the project on a host-specific plugin.

### 9.5 Skill-installation policy

- Prefer an existing skill over a near-duplicate.
- Repo-local editor behavior belongs in viewtube-youtube-editor-system.
- Official upstream Remotion skills are preferred over third-party Remotion instructions.
- Do not silently expand skills-lock.json with unreviewed third-party instruction packages.
- Any external skill adopted into the repo must be source-reviewed, hash-pinned, dated, and logged here and in agent/registry/candidates.md or capabilities.md.

## 10. Fifty-item editor improvement program

| # | Improvement | Priority |
| --- | --- | --- |
| 1 | One canonical desktop/mobile capability contract | P0 |
| 2 | Generate capability registry from real shared modules/tests | P0 |
| 3 | One typed shared FX catalog | P0 |
| 4 | One shared transition catalog | P0 |
| 5 | Desktop → mobile → desktop project round-trip tests | P0 |
| 6 | Preview-vs-final-render frame fixtures | P0 |
| 7 | Make mobile Timeline one compound module | P0 |
| 8 | Give Preview first claim on remaining mobile space | P0 |
| 9 | Lock timeline track-row geometry | P0 |
| 10 | Explicit hidden-track recovery | P0 |
| 11 | Unify Templates/Custom/Graphics/Backgrounds/Patterns as Design Library | P1 |
| 12 | True visual thumbnails for every Design Library item | P1 |
| 13 | Favorites, Recents, Saved, Project Assets and Collections | P1 |
| 14 | Same page IDs/names/icons/order on desktop and mobile | P1 |
| 15 | Universal command palette / Add launcher | P1 |
| 16 | One selection-driven inspector | P1 |
| 17 | Progressive disclosure for advanced controls | P1 |
| 18 | Compact, Comfortable and Touch density modes | P1 |
| 19 | Approximately 44×44 primary touch targets | P0 |
| 20 | Non-drag alternatives for drag-only operations | P0 |
| 21 | Transcript-based editing synchronized to timeline | P1 |
| 22 | Natural-language visual + transcript media search | P1 |
| 23 | Beat, bar and phrase markers | P1 |
| 24 | AI silence/filler/retake detection with review queue | P1 |
| 25 | Highlight extraction and candidate Shorts | P1 |
| 26 | Semantic Auto Reframe for output ratios | P1 |
| 27 | Object/person mask + tracking abstraction | P2 |
| 28 | One-click dialogue cleanup | P1 |
| 29 | Speech-aware music ducking and loudness presets | P1 |
| 30 | Translation + multilingual captions and subtitle export | P2 |
| 31 | Selection-aware AI Brain sidecar on both editors | P0 |
| 32 | AI edits as previewable typed patches | P0 |
| 33 | Explain This contextual help on complex controls | P1 |
| 34 | Reusable AI edit recipes | P1 |
| 35 | Veo 3.1 text-to-video in Generate | P0 |
| 36 | Veo image-to-video from image/frame | P0 |
| 37 | First-frame + last-frame video generation | P1 |
| 38 | Reference-subject video generation | P1 |
| 39 | Insert generated video as candidate clips first | P0 |
| 40 | Gemini 3.1 Flash Image generation/editing | P0 |
| 41 | Persist prompt/model/reference/seed provenance | P0 |
| 42 | Show expected generation cost/credits before submission | P0 |
| 43 | Shared queue/progress/cancel/retry/variant UI across surfaces | P0 |
| 44 | Compact Generate / Video Director dashboard widget | P1 |
| 45 | Send selected timeline range directly to Video Director | P1 |
| 46 | Resolve generated media into Asset Engine/Vault before timeline commitment | P0 |
| 47 | Analytics may influence recommendations only through evidence-backed Brain tasks | P1 |
| 48 | Interactive onboarding, demo project and task-specific walkthroughs | P1 |
| 49 | Use official Remotion skill suite; audit/retire redundant overlap | P0 |
| 50 | Maintain this living Editor System status + branch recovery + parity ledger | P0 |

## 11. Resource and reference registry

### 11.1 Canonical / current authorities

- docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md — this editor integration authority and live ledger.
- docs/editor/EDITOR_BRAIN_HUB_ASSISTANT_PLAN.md — assistant implementation plan.
- docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md — project/content identity.
- docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md — assets, generation lineage, Vault integration.
- docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md — BrainRuntime authority.
- docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md — Toolbox UI.
- docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md — component/primitives UI authority.
- docs/DOCUMENTATION_GOVERNANCE.md — documentation lifecycle rules.
- docs/DOCUMENTATION_REGISTRY.md — global documentation registry.
- agent/registry/references.md — agent-facing reference index.
- agent/registry/capabilities.md — agent capability/skill inventory.
- agent/contracts/herald-out.md — cross-agent response/evidence/update discipline.

### 11.2 Editor reference/plan material

- docs/EDITOR_DESKTOP_PROJECT_BRIDGE_HOOK_HANDOFF.md
- docs/editor/EDITOR_RECOVERY_PHASES_1_3_2026-09-18.md
- docs/editor/EDITOR_SVG_TEMPLATE_ASSET_CONSOLIDATION_PLAN_2026-09-18.md
- docs/editor/MOBILE_EDITOR_PRIMITIVES_AND_TOUCH_CONTROLS_2026-09-19.md
- docs/editor/MOBILE_EDITOR_WORKSPACE_REPAIR_2026-09-18.md
- docs/editor/component-style-default.md
- src/remotion-editor/src/engine/FEATURES.md
- src/remotion-editor/src/assets/README.md
- src/remotion-editor/src/assets/QA.md

These references must be reconciled against current code before they are promoted to current authority.

### 11.3 Important source areas

- src/features/editor/
- src/features/editor/mobile/
- src/editor-design-library/
- src/remotion-editor/
- src/services/brain/runtime/
- src/components/brain/
- src/features/video-director/
- server/video-director-*
- API routes used by Video Director generation jobs
- Asset Engine / Vault / ContentBuild services and adapters

### 11.4 Known standalone HTML / prototype references

These are reference/prototype artifacts, not runtime authority:
- public/editor-template-library.html
- public/widget-primitives.html
- src/assets/reference/viewtube-full-component-library.html
- src/assets/reference/viewtube-mini-toolbox-bundle.html
- docs/migration/reference/prototypes/ADAPTIVE_BRAIN_ORCHESTRATOR_2026-09-03.html
- docs/migration/reference/prototypes/VIEWTUBE_BRAIN_USER_CONTROL_CENTER_2026-09-03.html
- docs/demos/ViewTube_Crown_Control_Room.html

The global inventory remains in docs/DOCUMENTATION_REGISTRY.md and agent/registry/references.md. Every newly used or created editor-related standalone artifact must also be added here.

## 12. Branch donor / recovery audit log

Verified branch existence on 2026-09-24 through GitHub branch search. Existence does not mean safe-to-merge.

| Branch | Known relevance | Current disposition |
| --- | --- | --- |
| plan/mobile-editor-consolidation-2026-09-22 | mobile/desktop convergence and layout consolidation plan | donor plan; harvest current ideas, do not treat as runtime |
| feat/editor-template-library-main-aligned-v2 | template/design-library donor work | inspect behavior-level deltas; no wholesale merge |
| feat/editor-svg-template-library | older template/SVG donor | inspect only missing behavior; no wholesale merge |
| feature/video-director-foundation-2026-09-19 | Video Director foundation | current main already contains major infrastructure; compare unique commits before any harvest |
| feature/editor-system-living-authority-2026-09-24 | this living-resource/skill work | active branch until PR disposition |

For any branch audit, record:
- branch;
- base/head SHA;
- ahead/behind counts;
- unique commits via git cherry or equivalent;
- files/capabilities with unique value;
- stale/conflicting owners;
- disposition: merge / cherry-pick / manually harvest / archive / delete candidate;
- verification after harvest.

## 13. Current Work

| Work item | Status | Owner / surface | Verification target | Next action |
| --- | --- | --- | --- | --- |
| Living editor authority + shared update log | started | docs/editor + agent guidance | PR review; references resolve | merge authority PR after review |
| Editor-specific agent skill | started | skills/.claude/.codex | identical skill content, discoverable paths | merge authority PR |
| Cross-agent editor update requirement | started | AGENTS / CLAUDE / Herald | agents point to master resource | merge authority PR |
| Mobile/desktop capability parity | planned | editor state + UI | round-trip fixtures + capability matrix | audit current capability registry |
| Shared FX/transition catalogs | planned | editor core | same IDs and rendering on both surfaces | inventory desktop/mobile catalogs |
| Preview ↔ final Remotion parity | planned | editor + remotion | frame fixtures pass | establish fixture set |
| Editor Brain Hub assistant | planned | BrainRuntime + editor | eval matrix in section 5.7 | implement plan phases |
| Veo/Gemini generative media adapter | planned | Video Director + Asset Engine | provider contract/job tests | verify provider API + add adapter |
| Unified generation queue/widget | planned | editor + Dashboard + Studio Hub | same job state across surfaces | reuse Video Director job model |
| Official Remotion skill adoption | partial | agent tooling | source-reviewed/pinned or environment-provided | complete supply-chain audit before vendoring |
| External skills-lock audit | planned | agent tooling | all editor-relevant external instructions reviewed | inspect hashes/sources and classify retain/replace |
| Editor donor-branch audit | planned | GitHub | unique-commit matrix for each donor | run branch-level audit |

## 14. Phased implementation plan

### Phase A — truth and parity foundations

1. Establish this living authority and skill.
2. Audit capability IDs from actual code/tests.
3. Build one desktop/mobile capability matrix.
4. Extract shared FX and transition catalogs.
5. Add desktop → mobile → desktop round-trip fixtures.
6. Add Preview → final Remotion frame fixtures.

Exit gate: project state survives surface changes; shared catalog IDs are proven; render parity has fixtures.

### Phase B — editor UX consolidation

1. Compound mobile Timeline.
2. Preview-first responsive sizing.
3. Hidden-track recovery.
4. Unified Design Library.
5. Same navigation vocabulary and page IDs.
6. Selection-driven inspector.
7. Touch/keyboard alternatives and accessible target sizing.

Exit gate: feature parity with adaptive layouts, no device-specific project logic.

### Phase C — Editor Brain guide + proposal assistant

1. Add editor-specific context adapter to BrainRuntime.
2. Add Guide mode and feature/navigation knowledge.
3. Add typed edit-proposal schema.
4. Integrate preview/accept/reject/undo.
5. Add help/walkthrough anchors to UI capability IDs.
6. Add assistant evals.

Exit gate: assistant cannot hallucinate unavailable controls and cannot silently mutate editor state.

### Phase D — Generative Media

1. Verify current Google API/model limits from official docs.
2. Add Google provider adapter to existing Video Director provider registry.
3. Support text-to-video and image-to-video first.
4. Add first/last-frame, reference, extension and audio options only where current provider contract supports them.
5. Add Gemini image generation/editing.
6. Persist every output in Asset Engine/Vault with provenance.
7. Add candidate insertion into editor.
8. Share queue/progress/cancel/retry UI with widget/Studio surfaces.

Exit gate: no direct editor→provider call; every durable output has provenance and ContentBuild identity.

### Phase E — analytics, learning and advanced workflows

1. Add transcript semantic editing/search.
2. Add AI cleanup/highlight/Shorts recipes.
3. Permit analytics-informed recommendations through Brain evidence only.
4. Link accepted AI actions/generation choices to later outcomes where measurable.
5. Feed results into governed Evaluation/Learning, never direct unreviewed profile mutation.

Exit gate: evidence → recommendation/generation → creator decision → artifact/action → outcome → evaluation trace exists.

## 15. Verification and quality gates

For every relevant change:
- focused unit/contract tests;
- project round-trip fixtures;
- final render fixture where output changes;
- desktop 1440×1000 visual evidence for UI changes;
- mobile 390×844 plus relevant landscape capture for responsive changes;
- keyboard and touch path;
- undo/redo;
- empty/loading/error/disabled states;
- accessibility checks;
- provider error/cancel/retry tests for generation;
- provenance and identity assertions;
- no direct provider call from editor UI;
- no second project model;
- no new AI store or parallel Brain runtime.

## 16. Risks / ask-first boundaries

Ask before:
- changing canonical project schema or migration;
- changing ContentBuild identity semantics;
- changing Remotion package version;
- adding a third-party external skill to the repo without source review/hash pinning;
- changing OAuth scopes or external publishing permissions;
- introducing irreversible AI edits;
- adding a paid provider path without cost/usage disclosure;
- deleting old editor branches or reference artifacts;
- replacing a specialized canonical authority rather than indexing it here.

## 17. Update Log — append only

| Date / time | Agent / conversation | Branch / PR | Status | Work completed / begun / planned | Changed or created paths | Verification / evidence | New references / sources | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-24 | ChatGPT editor-system living authority pass | feature/editor-system-living-authority-2026-09-24 | started | Created canonical living editor resource; planned Brain Hub assistant; created editor skill and cross-agent update contract; indexed research, skills, branches and references | docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md and linked files | main baseline 96a3cb13fcdfd36720aebd845e0ac5f7a5ab12c1; GitHub source/branch searches; Deep Research source audit | official Remotion + Google Veo/Gemini docs; current repo authorities | open PR, review, then begin Phase A |

## 18. Handoff template for future agents

Before ending an editor-related turn, add an Update Log row containing:

- Agent / conversation identifier:
- Date:
- Branch / PR / commit:
- Status:
- Intent:
- Started:
- Completed:
- Blocked:
- Changed paths:
- Tests / runtime / screenshots:
- New docs / HTML / skills / branches / sources:
- Current risks:
- Next exact action:

If this document was not updated, the editor work is not fully handed off.
