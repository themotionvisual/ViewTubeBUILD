# Brain Runtime Phase 1 — Model and Orchestration Inventory

**Status:** HISTORICAL PHASE-1 INVENTORY / provider-migration evidence  
**Current authority:** `UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`  
**Wave 5 note (2026-09-24):** BrainRuntime is now a live facade and the provider gateway seam exists. Preserve this inventory for direct-provider debt history and migration rationale; current reachability must be verified from main.

**Date:** 2026-09-11  
**Branch:** `feat/brain-runtime-phase-one-consolidation-2026-09-11`

## Purpose

Establish the current AI/model/orchestration surface before consolidating ViewTube onto one `BrainRuntime` facade. This inventory is intentionally additive: it identifies current owners and migration seams without deleting or replacing working paths yet.

## Current primary Brain path

`src/services/brain/BrainOrchestrator.ts` is already the strongest general-purpose Brain orchestration path.

It currently owns:

1. task profile resolution
2. capability selection
3. context assembly through `BrainContextBroker`
4. bounded niche knowledge retrieval
5. optional current public grounding
6. structured model generation through `generateStructuredBrainResponse`
7. creator-facing response normalization
8. deterministic response validation
9. repair attempt after failed validation
10. local fallback behavior
11. conversation persistence
12. answer-quality learning-event capture
13. generation-path / fallback / repair metadata

This existing orchestrator should become the first implementation behind the new facade rather than being replaced immediately.

## Current direct consumers of `runBrainTurn`

Main currently contains direct consumers including:

- `src/views/AIBrainCommandInterface.tsx`
- `src/views/dashboard/widgets/BrainHubWidget.tsx`
- `src/components/SidebarChatbot.tsx`
- Brain orchestrator tests

### Migration rule

These surfaces should move from direct `runBrainTurn` imports to `runBrainTask` through the new runtime facade one at a time after parity coverage exists.

## Current primary provider layer

`src/services/gemini.ts` is the current provider utility/service layer and contains `generateStructuredBrainResponse`, model selection, client creation, retry behavior, and other generation helpers.

The current Brain orchestrator imports `generateStructuredBrainResponse` directly from this provider-oriented module.

### Phase 1 target

Introduce `BrainModelGateway` as a provider-neutral seam. Initially it may delegate to the existing Gemini helpers. Provider behavior must remain unchanged until parity tests are in place.

## Direct provider/model call sites found outside the main Brain orchestrator

### `src/services/brain/Core.ts`

The Brain core dynamically imports the Gemini service for `reflectAndCompress` and directly calls `ai.models.generateContent(...)` through the shared helper client.

**Classification:** Brain-internal AI operation.  
**Target:** migrate behind `BrainModelGateway` after the facade is stable.

### `src/services/CollabEngine.ts`

Uses `getAiClient`, `getActiveModel`, `executeWithRetry`, and direct `ai.models.generateContent(...)`.

**Classification:** separate AI-powered collaboration subsystem.  
**Target:** migrate to the shared model gateway later, but do not force it through chat-oriented task logic.

### `src/views/dashboard/widgets/VideoCommentOperatorWidget.tsx`

The widget directly calls `getAiClient().models.generateContent(...)` to draft a pinned comment recommendation.

**Classification:** creator-asset generation embedded in a UI component.  
**Target:** high-priority migration to a semantic creator-asset capability / `CreatorAssetEngine` path so UI does not own model invocation.

### `src/context/GeminiKeyContext.tsx`

Directly instantiates the provider SDK and performs a tiny validation request when checking a custom key.

**Classification:** provider credential/connection validation, not creator reasoning.  
**Target:** keep separate from `BrainRuntime`; eventually place behind provider-account/connection infrastructure, not the creator task runtime.

## Intelligence Hub generation path

`src/components/IntelligenceHub/ultimateReport.ts` is a substantial parallel generation pipeline.

It imports provider-facing helpers directly:

- `generateArchitectDiagnosis`
- `generateKeywordResearch`
- `generateOracleReport`
- `isGeminiConfigured`

It also owns report-specific prompt packs, timeouts, section generation, normalization, degradation handling, and report assembly.

### Assessment

The Intelligence Hub should keep its report schema and report UX, but its model invocation, evidence policy, context policy, tracing, and verification should progressively reuse shared Brain Runtime services.

It should not become a second general-purpose Brain.

## Existing boundaries that should be preserved

### `BrainContextBroker`

Already provides a bounded context assembly layer. Phase 1 should wrap and evolve it rather than bypass it.

### `BrainCapabilityRegistry`

Already centralizes a meaningful subset of capabilities. Consolidation should expand/normalize it rather than create another competing registry.

### `BrainTaskProfileRegistry`

Already supplies task-specific intent/answer behavior. Keep it as an input to the future runtime task router.

### `analytics-canon`

Remains the only canonical analytics consumer boundary. The runtime facade must not introduce direct VT-SYNC reads.

### Channel Profile / memory / outcome owners

The facade is orchestration only. It must not become another persistence authority for creator knowledge, handoffs, outcomes, or analytics.

## Phase 1 migration sequence

1. Add additive `BrainRuntime` contracts and facade.
2. Delegate facade calls to existing `runBrainTurn` with behavior unchanged.
3. Add runtime metadata/versioning so new surfaces can identify the canonical path.
4. Add tests proving facade-to-orchestrator parity.
5. Migrate `AIBrainCommandInterface` to the facade.
6. Migrate `BrainHubWidget`.
7. Migrate `SidebarChatbot`.
8. Add `BrainModelGateway` wrapper around current provider helpers.
9. Move `BrainOrchestrator` provider call through `BrainModelGateway`.
10. Move Brain Core reflection/compression through the gateway.
11. Define Intelligence Hub adapter to shared runtime/model/evidence services without changing report schema.
12. Migrate UI-owned model generation such as `VideoCommentOperatorWidget` into semantic creator-asset services.
13. Migrate other provider-oriented subsystems such as `CollabEngine` only after their task contracts are explicit.
14. Forbid new direct provider calls from UI components through architecture tests/lint checks.
15. Remove superseded paths only after parity and eval verification.

## Phase 1 non-goals

- Do not replace VT-SYNC or analytics-canon.
- Do not redesign Channel Profile storage.
- Do not merge Anomaly Intelligence and Algorithm Priming.
- Do not change creator-facing Brain behavior yet.
- Do not switch model providers as part of the facade migration.
- Do not delete `gemini.ts` in the first phase.
- Do not move provider-key validation into the Brain task runtime.

## Acceptance criteria

Phase 1 foundation is successful when:

- new AI surfaces have one canonical runtime entry point;
- existing Brain chat behavior is preserved;
- provider-specific calls are isolated behind a gateway path rather than spreading further;
- task/capability/context/evidence ownership stays explicit;
- Intelligence Hub can be migrated without losing report-specific schemas;
- UI components no longer need to know provider SDK details for creator-generation tasks;
- every future AI change has a clear place for tracing, verification, evaluation, and outcome attribution.
