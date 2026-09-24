---
name: viewtube-youtube-editor-system
description: Govern, plan, build, audit, verify, and document the ViewTube YouTube video editor across desktop and mobile, including shared project state, timeline, preview, assets, templates, Remotion, Video Director, AI generation, Editor Brain assistant, captions, effects, transitions, export, responsive/touch UX, and editor-related widgets. Use whenever work changes or evaluates the editor system. Do NOT use for generic YouTube API-only work, unrelated dashboard widgets, or Brain work with no editor impact.
---

# ViewTube YouTube Editor System

## Purpose

Keep the ViewTube editor one coherent product across desktop and mobile while connecting it safely to Project/ContentBuild, Asset Engine/Vault, Remotion, Video Director and BrainRuntime.

## Mandatory first read

Read:
1. docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md
2. docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md when AI is involved
3. docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md when project identity is involved
4. docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md when assets/generation are involved
5. current source/tests for the specific capability

Use viewtube-skill-finder to choose the smallest supporting skill set.

## Core invariants

1. One canonical project model across desktop and mobile.
2. Stable capability IDs; layouts may adapt, capabilities may not silently disappear.
3. Project/ContentBuild identity survives every editor, asset, generation and publishing handoff.
4. Remotion is deterministic time/render authority.
5. BrainRuntime is creator reasoning/orchestration authority.
6. Video Director owns async media-generation jobs/provider routing.
7. Asset Engine/Vault owns generated asset identity and provenance.
8. AI edits are proposal-first, previewable, approval-aware and undoable.
9. Editor UI never calls a model/media provider directly.
10. Every editor work pass updates the living master resource and its append-only Update Log.

## Supporting-skill routing

Use only when relevant:
- viewtube-ai-system-governor for Brain/model/evidence/tool/generation/eval work.
- viewtube-prince-brain for deeper Brain architecture.
- viewtube-toolbox-builder for Studio Toolbox primitives.
- viewtube-mobile-widget-system for touch/mobile widget composition.
- viewtube-widget-dashboard for Dashboard generation/widget integration.
- youtube-api-expert only when the editor actually needs YouTube API behavior.
- viewtube-verification-chancellor for release evidence.
- official Remotion skills when available for Remotion-specific APIs and current upstream guidance.
- source-driven development when a framework/provider API is version-sensitive.

Do not load every skill by default.

## Procedure

### 1. Classify

Identify:
- editor surface: desktop, mobile portrait, mobile landscape, shared;
- domain: project state, timeline, preview, inspect, design library, FX, transitions, audio, captions, AI, generation, export, rendering;
- whether the change affects saved project semantics;
- whether visible parity is required on the other surface.

### 2. Recon prior art

Search:
- current main code/tests;
- the master resource registry;
- docs/editor;
- agent/registry/references.md;
- _quarantine for failed prior approaches;
- donor branches listed in the master resource;
- closed PRs when relevant.

Never wholesale-merge a stale editor branch because it contains one useful feature.

### 3. Name canonical owners

Before changing code, name the owner for:
- project state;
- asset identity;
- render/time;
- AI reasoning;
- generation job;
- UI primitive/system;
- analytics evidence if used.

If two modules claim the same responsibility, stop and resolve ownership.

### 4. Define parity

For every user-facing capability answer:
- desktop behavior;
- mobile portrait behavior;
- mobile landscape behavior;
- project serialization impact;
- keyboard path;
- touch path;
- empty/loading/error/disabled states.

### 5. Implement vertically

Prefer one complete capability slice over horizontal rewrites.

Examples:
- shared transition ID → desktop picker → mobile picker → preview → final render → tests;
- caption generation → project asset → timeline track → mobile/desktop editing → export;
- AI trim proposal → preview → accept/reject → undo → desktop/mobile.

### 6. AI and generation rules

For editor assistant work:
- call BrainRuntime rather than a direct provider;
- use typed semantic actions/proposals;
- require approval for mutations unless explicitly safe/reversible;
- add accepted mutations to undo/redo;
- expose uncertainty and unavailable capabilities.

For generated media:
- send through Video Director;
- store provenance;
- resolve output into Asset Engine/Vault;
- insert as candidate before final commitment;
- preserve provider job/cost/error state.

### 7. Remotion rules

- inspect src/remotion-editor package versions before coding;
- keep @remotion packages aligned;
- use frame-driven deterministic animation;
- preserve preview/final parity;
- add or update render fixtures when output changes;
- do not upgrade Remotion casually;
- use official current Remotion docs/skills for version-sensitive APIs.

### 8. UI rules

- use current ViewTube primitives and Toolbox/Subtoolbox authorities;
- do not invent FLOWSTACK APIs without inspecting exact available package/skill guidance;
- optimize mobile for touch without reducing the underlying feature set;
- preserve Preview and Timeline usability;
- avoid duplicate primary controls;
- use progressive disclosure rather than hiding capabilities permanently.

### 9. Verification

At minimum for affected scope:
- focused tests;
- project serialization/round-trip test if state changes;
- preview/final fixture if rendered output changes;
- desktop visual evidence for visible changes;
- phone visual evidence for responsive/mobile changes;
- keyboard/touch alternative;
- undo/redo for mutations;
- AI/provider error paths when applicable.

A visible UI change without visual evidence is partial, not complete.

### 10. Mandatory documentation handoff

Before ending:
1. update docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md Current Work;
2. append an Update Log row;
3. register every new/used plan, standalone HTML, branch donor, skill, source or important resource;
4. link PR/branch/commit and verification;
5. update docs/DOCUMENTATION_REGISTRY.md or agent registries if authority/capability inventory changed.

## Stop conditions

Stop and investigate if:
- desktop and mobile would save different project shapes;
- a second AI/model runtime is being created;
- editor UI is about to call Veo/Gemini/another provider directly;
- generated media would bypass Asset Engine/Vault;
- a destructive AI edit has no preview/undo;
- a new effect/transition ID is not shared;
- preview and final render use different semantics;
- an old plan/prototype is being treated as current code;
- a FLOWSTACK or Remotion API is being guessed from memory;
- the living master resource cannot be updated with a truthful status.

## Result format

Return:
1. intent and affected editor surfaces;
2. canonical owners;
3. prior art reused;
4. implementation or audit result;
5. desktop/mobile parity impact;
6. AI/generation/render impact;
7. verification evidence;
8. changed paths;
9. master-resource Update Log entry;
10. next exact action.

## Handoff

Editor work is not fully handed off until the living master resource contains the new status, references, evidence and next action.
