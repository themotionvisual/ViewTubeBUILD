# ViewTube Unified AI System — Canonical Consolidation Contract

**Date:** 2026-09-17  
**Status:** CANONICAL LIVING AI / BRAIN ARCHITECTURE AUTHORITY  
**Last audited main:** `6e5df12c2f0d3d3f8d2d1ca88e6fe2b87ce366dc`  
**Canonical owner / concern:** creator-facing Brain runtime, AI orchestration, evidence/context policy, specialist intelligence integration, model gateway, outcome/evaluation/learning boundaries, creator controls, and strangler migration away from direct legacy generation paths.  
**Executable authority:** `src/services/brain/runtime/**`, `BrainOrchestrator.ts`, `BrainContextBroker.ts`, `BrainEvidenceQuality.ts`, Brain intelligence/evaluation/outcome/learning services, and their tests.  
**Related active work:** `tasks/ai-brain-quality/**` and `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md`.  
**Herald boundary:** repository AI-work governance is owned by `agent/contracts/herald-in.md`, `herald-out.md`, `herald-workflow.md`, and `.viewtube/herald/**`; Herald is not the creator Brain runtime.  
**Rule:** unionize capabilities, not duplicate owners.

## Goal

All creator-facing AI, Brain, intelligence, packaging, analytics reasoning, audience reasoning and asset-generation workflows operate as one system while preserving specialist modules.

## Current audited implementation state

On main `6e5df12c2f0d3d3f8d2d1ca88e6fe2b87ce366dc`, the consolidation is substantially beyond the original September 17 staged plan.

### Live canonical path

```text
SidebarChatbot / AIBrainCommandInterface / BrainHubWidget
        ↓
runBrainTask
        ↓
BrainRuntime
        ↓
BrainOrchestrator
        ↓
BrainContextBroker + capability/task profiles
        ↓
BrainModelGateway
        ↓
provider adapter
```

Verified production foundations now include:

- `runBrainTask` / BrainRuntime as the creator-facing Brain facade;
- provider-neutral `BrainModelGateway` injection, while the current default gateway still adapts `generateStructuredBrainResponse` from the legacy Gemini service;
- canonical analytics evidence available through `analytics-canon`, including the imperative `getCurrentCanonicalIntelligenceEvidence()` entry point;
- `BrainEvidenceQuality` for source/scope/freshness/missingness-aware confidence;
- deterministic Statistics Intelligence and Audience Intelligence;
- Channel, Algorithm, Anomaly and Opportunity intelligence modules;
- Brain user controls and channel-scoped context policy;
- Brain outcome recording;
- algorithm evaluation checkpoints, canonical evaluation evidence, lifecycle cohorts, learning candidates and governed promotion;
- Brain intelligence persistence for algorithm events/lifecycle observations;
- durable conversation-controller and handoff/inbox infrastructure;
- Asset Engine / generation workflows that can preserve ContentBuild identity and provenance.

### Still-open consolidation seams

The system is **not** complete merely because the modules exist.

Code-backed open seams include:

- `HookGenerator` still reaches the legacy `generateHook` path directly;
- Script Architect still reaches the legacy `generateScript` path directly;
- the default Brain model gateway still depends on the legacy `gemini.ts` provider adapter;
- outcome/evaluation coverage is uneven across publisher, editor, project, comments/community, experiments and all creator-generation paths;
- active Project context and Opportunity evidence are not yet supplied consistently across every Brain portfolio path;
- immutable `ApprovedPublishSnapshot` remains a publishing-system gap;
- one canonical metric comparability guard for unit/scope/window/format is still an active Finish Program requirement;
- durable learning must continue to be governed rather than inferred from one-off actions or missing evidence.

Definitions, tests, registry entries and phase documents are not proof of production reachability. Current code paths and runtime tests remain the evidence standard.

## Herald boundary

HERALD governs **work on the ViewTube repository**, not creator-facing reasoning inside ViewTube.

Current implemented Herald authority is:

- `agent/contracts/herald-in.md` — intake/readback contract;
- `agent/contracts/herald-out.md` — canonical response/tier/evidence contract;
- `agent/contracts/herald-workflow.md` — workflow/gate/thread protocol;
- `.viewtube/herald/threads/*.json` — resumable thread state;
- `.viewtube/herald/ledger/*.jsonl` — chronological execution ledger;
- `.viewtube/exchange/` — cross-agent mission/work-order/receipt/handoff records where applicable.

The September 15 HERALD plan remains useful design history, but its original "PLAN ONLY" status is obsolete.


```
UI / Widget / Tool
        ↓
UnifiedAI
        ↓
BrainRuntime
 Intent → Task Profile → Capability Plan → Evidence Plan
        ↓
Canonical Context
 analytics-canon + channel profile + project + Vault + conversation + current UI
        ↓
Specialist Intelligence
 Statistics | Channel | Audience | Anomaly | Opportunity | Algorithm | Packaging
        ↓
Creator Asset Engine
 titles | thumbnails | hooks | scripts | descriptions | tags | posts | replies | packages
        ↓
BrainModelGateway
        ↓
Generation Store + Vault + ActionPacket/Handoff
        ↓
Outcome Ledger → validated learning → future context
```

## Ownership rules

1. **BrainRuntime is the only creator reasoning/orchestration entry point.**
2. **BrainModelGateway is the only creator text/reasoning model boundary.**
3. `gemini.ts` becomes a temporary compatibility/provider implementation, not a competing intelligence system.
4. **analytics-canon owns raw/normalized analytics.** Intelligence modules derive evidence; they do not create competing analytics stores.
5. **Vault owns durable creator artifacts.**
6. **Generation Store owns generated candidate/run provenance.**
7. **Outcome Ledger owns recommendation/action outcome attribution.**
8. **Channel Profile owns durable creator/channel identity and confirmed strategic facts.**
9. Specialist engines remain modules behind the same runtime; they do not become independent chatbots or provider clients.
10. UI surfaces request capabilities. They do not assemble bespoke model stacks.

## Canonical task contract

Every migrated creator-AI call must resolve to a task envelope equivalent to:

```ts
type UnifiedAITask = {
  taskId: string
  surface: string
  channelId?: string | null
  projectId?: string | null
  videoId?: string | null
  intent: string
  capability: string
  userInput: unknown
  visibleContext?: unknown
  constraints?: unknown
  requestedOutputs?: string[]
}
```

Runtime enrichment adds:

- channel/profile context
- analytics evidence
- audience evidence
- similar-video evidence
- anomaly/opportunity signals
- project context
- Vault assets/packages
- conversation context
- current research only when required
- evidence freshness, coverage and provenance

## Historical staged consolidation roadmap

### Wave 0 — lock architecture

- retain existing provider architecture guard;
- add migration inventory and canonical contract;
- prohibit new direct creator generation imports from `gemini.ts`;
- do not break current production consumers.

### Wave 1 — deterministic intelligence

Unify calculations before generation:

- Statistics Intelligence
- Channel Intelligence
- Audience Intelligence
- Signal/Anomaly Intelligence
- Opportunity Intelligence
- Algorithm Intelligence

All expose typed evidence objects with provenance, freshness, sample/coverage metadata and confidence derived from evidence quality.

### Wave 2 — Packaging Intelligence

One package object owns the relationship between:

- topic / promise
- audience
- discovery surface
- title
- thumbnail
- hook
- description/SEO
- first-frame / first-15-second strategy
- internal next-watch target
- experiment variants

Title, thumbnail and hook are evaluated as a package, not independently.

### Wave 3 — Creator Asset Engine

Create one generation facade behind BrainRuntime. Migrate:

1. SEO Generator + Video Publisher metadata
2. Hook Generator
3. Thumbnail concepts/rating/prompt preparation
4. Script Architect
5. Storyboard / project generation
6. community posts / comments / replies
7. tags / education moments / end screens
8. remaining `gemini.ts` creator-generation exports

Each migration requires parity tests before removing the old route.

### Wave 4 — channel learning loop

```
Generation
 → user selection/edit
 → publish/use
 → 1h/6h/24h/72h/7d/28d evidence
 → Outcome Ledger
 → comparison to baseline/similar videos
 → validated learning candidate
 → Channel Profile / retrieval context
```

Model self-confidence is never treated as evidence confidence.

### Wave 5 — retire parallel stacks

Only after production reachability is zero:

- quarantine superseded prompt/generator modules;
- shrink provider allowlist;
- delete duplicate context assemblers;
- delete duplicate persistence paths;
- retain compatibility adapters only while external callers remain.

## Definition of unified

The system is not considered unified merely because modules share a prompt or provider.

It is unified when:

- every creator reasoning call enters through BrainRuntime;
- every model call crosses BrainModelGateway or an explicitly separate media-provider gateway;
- every recommendation can identify its evidence;
- every generated artifact has provenance;
- every specialist reads canonical data owners;
- every outcome can be associated with the recommendation/generation that produced it;
- no UI owns a parallel AI architecture;
- no duplicate Brain memory/profile/analytics/artifact store competes with the canonical owners.

## Non-destructive migration rule

Do not wholesale-rewrite `gemini.ts`. Strangle it gradually: migrate one exported capability, redirect consumers, verify tests/build/runtime, then remove only the unreachable implementation.
