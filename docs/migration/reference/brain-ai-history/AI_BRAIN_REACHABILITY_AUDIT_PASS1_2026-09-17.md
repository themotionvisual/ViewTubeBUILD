> **Historical AI reference — archived 2026-09-24**  
> **Original path:** `docs/brain/AI_BRAIN_REACHABILITY_AUDIT_PASS1_2026-09-17.md`  
> **Current AI systems management authority:** `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`  
> **Current runtime architecture authority:** `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`  
> Unique durable rules from this document were harvested into current authorities before archival. Historical phase labels, maturity estimates, branch state and “current” claims below are not current status.  
> See `docs/brain/ai-systems/DOCUMENT_CONSOLIDATION_REGISTER_2026-09-24.md` for the migration disposition.

# ViewTube AI / Brain Reachability Audit — Pass 1

**Status:** HISTORICAL REACHABILITY AUDIT / evidence snapshot  
**Current authority:** `UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`  
**Wave 5 note (2026-09-24):** the audit method and the identified direct-generation debt remain useful. Current main now contains substantially more evaluation, learning, persistence and evidence-quality infrastructure; re-run production reachability before using any row below as present-state status.

**Date:** 2026-09-17  
**Evidence basis:** production imports/invocations on `main`; tests/docs are corroboration, not reachability proof.

## Executive finding

ViewTube already has a real canonical Brain path, but most creator-generation tools still bypass it through the legacy `src/services/gemini.ts` mega-service. The highest-value work is therefore migration and consolidation, not creation of another AI stack.

The verified Brain path is:

`SidebarChatbot / BrainHubWidget -> runBrainTask -> BrainRuntime -> BrainOrchestrator -> BrainModelGateway -> generateStructuredBrainResponse`

The verified parallel generation path is:

`many creator views/widgets -> individual generate* exports -> src/services/gemini.ts -> GoogleGenAI`

The architecture guard already prevents **new** direct provider invocations outside an explicit debt allowlist, but it intentionally permits the large `gemini.ts` service. This is useful containment, not completion.

## Reachability matrix

| Owner / symbol | Production reachability | Provider path | Finding | Disposition | Confidence |
|---|---|---|---|---|---|
| `runBrainTask / BrainRuntime` | SidebarChatbot, BrainHubWidget | BrainModelGateway -> gemini adapter | canonical facade is genuinely live | KEEP / EXPAND | high |
| `BrainOrchestrator` | reached by BrainRuntime | gateway-injected structured generation | live orchestration owner | KEEP | high |
| `BrainModelGateway` | reached by BrainRuntime | currently adapts `generateStructuredBrainResponse` from gemini.ts | correct seam, provider implementation still legacy-coupled | KEEP / EXPAND | high |
| `BrainCapabilityRegistry` | selected during Brain turns | no direct provider ownership | live registry includes anomaly, analytics, SEO and content-generation capability declarations | KEEP / EXPAND | high |
| `ChannelIntelligence` | workflow planner + Algorithm Intelligence | deterministic/derived | live specialist, not merely documentation | KEEP / CONNECT MORE | high |
| `AlgorithmIntelligenceOrchestrator` | AlgorithmIntelligenceAccess | deterministic composition + handoffs | live specialist portfolio owner | KEEP | high |
| `OpportunityIntelligence` | Algorithm Intelligence orchestrator | deterministic derived signals | live specialist | KEEP | high |
| `AlgorithmPrimingEngine` | Algorithm Intelligence orchestrator; workflow handoff | deterministic planning | live specialist | KEEP | high |
| Signal/Anomaly capability | BrainCapabilityRegistry + algorithm bridge evidence | analytics-derived | integrated at capability/strategy seams, needs end-to-end consumer verification | CONNECT / VERIFY | medium-high |
| `src/services/gemini.ts` | dozens of production views/widgets/features | direct GoogleGenAI | giant parallel creator-generation/provider service | MIGRATE / DECOMPOSE | high |
| `generateSeoData` | SeoGenerator, VideoPublisher | direct legacy service | duplicated surface-specific entry | MIGRATE to Creator Asset / Packaging | high |
| `generateHook` | HookGenerator | direct legacy service | creator asset generation outside canonical runtime | MIGRATE | high |
| thumbnail generation/rating/concepts | ThumbnailStudio, ReferenceStudio, ImageGeneratorWidget, EndScreenTool | direct legacy service | packaging/image generation fragmented across surfaces | MIGRATE by capability | high |
| `generateScript` | Script Architect | direct legacy service | valuable workflow but bypasses canonical generation owner | MIGRATE | high |
| storyboard/project generation | StoryboardStudio, ProjectStudioWorkflow, ProjectStudio | direct legacy service | project-aware generation is fragmented | MIGRATE | high |
| comment/community generation | creator-engagement controllers | direct legacy service | already has workflow/tool context; needs Creator Asset Engine facade | MIGRATE | high |
| analytics/report generation | Channelytics, ResearchLab, VideoAutopsyWidget, IntelligenceHub-related flows | mixed | analytical reasoning overlaps specialist intelligence | CONSOLIDATE after deterministic extraction | medium-high |
| `generateKeywordAnalysis` | no production invocation found in first pass | legacy service | probable dead/unreachable export; must confirm exact symbol definition/import variants | VERIFY -> DELETE-LATER | medium |
| `prompts.ts` | imported heavily by gemini.ts | n/a | centralized text constants but mega-prompt ownership follows legacy service rather than typed tasks | CONSOLIDATE into versioned task prompts | high |

## Direct legacy consumers found

The first pass found production imports from `services/gemini` in at least these active areas:

- SEO Generator and Video Publisher
- Hook Generator
- Actionable Tactics
- Storyboard Studio and Project Studio workflows
- Media Analyzer
- Pre-Launch Priming and Algorithm Architect
- Daily Advice
- Channelytics / Research Lab
- Thumbnail Studio / Reference Studio / End Screen Tool
- Script Architect
- AI Journal, Tag Generator, Image Generator, Data Edit and Video Autopsy widgets
- Community Post and Comment Responder controllers
- Video Manager
- Intelligence Hub integration surfaces

This means the legacy service is not dead code. It is the principal migration debt.

## Architecture guard status

`brainProviderArchitectureGuard.test.ts` already scans all `src/**/*.ts(x)` for `models.generateContent` and `new GoogleGenAI(`. Its explicit migration allowlist is:

- `src/context/GeminiKeyContext.tsx` — credential validation
- `src/services/CollabEngine.ts`
- `src/services/brain/Core.ts`
- `src/services/gemini.ts`
- `src/views/dashboard/widgets/VideoCommentOperatorWidget.tsx`

This is a strong existing safety rail. Phase 0 should **tighten** it over time rather than replace it.

## Corrected architecture plan

### Slice A — deterministic Statistics Intelligence

Create a bounded deterministic specialist that consumes analytics-canon evidence and returns typed calculations plus evidence refs. No model call. Initial jobs:

- baseline and delta calculations
- cohort comparisons
- CTR / retention / watch-time decomposition when source metrics exist
- percentile/rank helpers
- trend slope and volatility
- sample-size/coverage flags
- missingness and freshness summary

Do not duplicate analytics-canon storage.

### Slice B — Audience Intelligence

Build on analytics-canon + Channel Profile. Derive audience evidence separately from recommendations. Inputs must distinguish observed demographics/behavior from inferred creator strategy. Output must expose evidence, confidence, freshness and missing data.

### Slice C — Packaging Intelligence

Separate **understanding package performance** from **generating packages**. Packaging Intelligence should explain title/thumbnail/topic/package evidence and experiment history. It should not own image generation.

### Slice D — Creator Asset Engine

Use a facade over canonical owners:

`creator task -> BrainRuntime/context plan -> specialist evidence -> CreatorAssetEngine -> BrainModelGateway -> Generation Store -> Vault/project link -> ActionPacket -> outcome`

Migrate one generator at a time. SEO/package generation is the best early vertical because it currently has multiple production consumers and clear typed output.

## Immediate implementation acceptance

1. Add typed Statistics Intelligence contracts and deterministic implementation.
2. Register it as a Brain capability without adding another model call.
3. Add tests for calculations, missing evidence and provenance.
4. Do not modify `gemini.ts` behavior in the same slice.
5. After that, create the Creator Asset Engine facade and migrate one generator with parity tests.
6. Shrink the direct-provider allowlist only when the corresponding migration is proven.

## Do not delete yet

Do not delete `gemini.ts`, `prompts.ts`, or any currently imported generator. Do not replace current BrainRuntime. Do not build a second analytics reader, memory store, provider client, outcome ledger, or Vault persistence system.
