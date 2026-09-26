# Creator Context Convergence — Reachability & First Migration

**Status:** ACTIVE IMPLEMENTATION EVIDENCE  
**Created:** 2026-09-26  
**Last edited:** 2026-09-26  
**Audited main:** `86a41a68d92983e16d11d885262dab97462dab2f`

## Purpose

Record the first code-backed convergence slice for the ViewTube System Convergence program. This is production-reachability evidence, not a new authority.

## Pre-migration reachability

| Concern | Existing owner / adapter | Production reachability found | Finding |
| --- | --- | --- | --- |
| Channel Profile | `ChannelProfileAdapter.loadBrainChannelProfile` | `ChannelIntelligence` | Real production reader; retain persistence adapter. |
| Channel Knowledge | `ChannelProfileAdapter.loadRelevantChannelKnowledge` → `ChannelKnowledgeProjection` | `BrainOrchestrator` | Orchestrator directly loaded knowledge as a separate context path. |
| Style | `StyleProfile.resolveStyleProfile` | `AssetGenerator` | Real governed generation dependency; retain specialist semantics. |
| Brain memory claims | `BrainMemoryClaims.listActiveBrainMemoryClaims` | `ChannelProfileAdapter` | Correctly feeds knowledge/profile projection rather than BrainContextBroker directly. |
| Niche knowledge | `NicheKnowledge.resolveNicheKnowledge` | `BrainOrchestrator` | Separate public/domain knowledge capability; later converge through bounded context recipe. |
| Project context | `BrainProjectContext.buildAlgorithmProjectContext` | `BrainOrchestrator` | Real caller, but source was transient `visibleContext` rather than canonical Project/ContentBuild lookup. |
| Surface context | `BrainSurfaceContext` | Sidebar Chatbot, Global Brain Sidecar | Legitimate UI-boundary adapter. |
| Surface selection | `BrainSurfaceSelection` | Sidebar Chatbot | Legitimate transient selection adapter. |

## First convergence implementation

Added `CreatorContextResolver.ts` as a **read-only facade**. It introduces no new persistence and delegates to existing owners.

Current envelope includes:

- channel scope;
- Brain user controls;
- Channel Profile bundle;
- task-scoped Channel Knowledge;
- Style Profile;
- bounded Project context;
- surface context;
- selected item context;
- deduplicated evidence/artifact refs;
- basic provenance.

Privacy behavior:

- no channel-scoped reads without a channel ID;
- no profile/knowledge/style resolution when personalization is disabled;
- no Project context when Project access is disabled;
- no second profile, project or knowledge database is introduced.

## BrainOrchestrator migration

Before:

```text
BrainOrchestrator
├── loadRelevantChannelKnowledge()
└── buildAlgorithmProjectContext()
```

After:

```text
BrainOrchestrator
└── resolveCreatorContext()
    ├── Channel Profile / Knowledge
    ├── Style
    └── Project context
```

BrainOrchestrator now reads:

- `creatorContext.channelKnowledge`
- `creatorContext.project`

instead of importing the two underlying adapters independently.

## TDD evidence

RED 1:
- `CreatorContextResolver.test.ts` was committed before implementation.
- CI failed with `TS2307: Cannot find module '../CreatorContextResolver'`.

GREEN 1:
- resolver added.
- `CreatorContextResolver.test.ts`: **3/3 passing**.

RED 2:
- architecture tests were changed to require BrainOrchestrator to use `resolveCreatorContext`.
- both Channel Knowledge integration and Project/Opportunity integration tests failed against the old direct imports.

GREEN 2:
- BrainOrchestrator migrated to the facade.
- `CreatorContextResolver.test.ts`: **3/3 passing**.
- `BrainChannelKnowledgeIntegration.test.ts`: **3/3 passing**.
- `BrainProjectOpportunityIntegration.test.ts`: **2/2 passing**.

Related gates on the implementation commit:
- production build: pass;
- source governance: pass;
- focused contracts: pass;
- local smoke: pass.

Repository-wide full-suite/typecheck remain red from unrelated pre-existing/moving-main failures; none of the logged typecheck failures after the facade implementation reference `CreatorContextResolver`.

## Important remaining limitation

The facade currently preserves existing Project behavior: Project context is still built from `projectId + visibleContext`.

This is intentionally transitional.

The next Project-context convergence step is:

1. pass or resolve the actual Project record through one canonical Project access seam;
2. load the linked ContentBuild directly from `ContentBuildRepository`;
3. derive the bounded Brain Project context from those canonical records;
4. use `visibleContext` only for current UI selection/ephemeral state;
5. retain the old `BrainProjectContext` shape as a compatibility projection until callers are migrated.

Do not create a second Project repository to accomplish this.
