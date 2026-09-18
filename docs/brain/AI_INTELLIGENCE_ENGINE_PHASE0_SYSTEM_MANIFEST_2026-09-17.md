# ViewTube AI / Brain System Manifest — Phase 0

**Status:** implementation baseline  
**Branch:** `feat/ai-intelligence-engine-phase0-2026-09-17`  
**Authority:** `.claude/skills/viewtube-ai-system-governor/SKILL.md`  
**Process:** `agent/contracts/herald-workflow.md`

## Mission

Consolidate ViewTube's existing AI systems around Brain Runtime instead of creating another Brain. Establish explicit ownership and reachability before implementing Statistics Intelligence, Audience Intelligence, Packaging Intelligence, Content Intelligence, and the Creator Asset Engine.

## Canonical boundaries

- VT-SYNC owns raw analytics acquisition/freshness.
- analytics-canon owns normalized analytics evidence.
- Channel Profile owns durable creator/channel knowledge.
- Projects own project intent/workflow state.
- Vault / Video Assets own artifact identity/provenance.
- Brain Runtime owns routing, context assembly, reasoning and orchestration.
- Specialist intelligence engines derive bounded evidence-backed intelligence.
- Creator Asset Engine will own generated creator assets and generation provenance.
- Outcome/Evaluation owns measured results; Learning owns promotion governance.

## Current system disposition

| System | Current state | Phase-0 disposition | Target |
|---|---|---|---|
| BrainRuntime | live | KEEP | mandatory AI task entry point |
| BrainOrchestrator | live | KEEP | orchestration owner |
| BrainModelGateway | live foundation | KEEP/EXPAND | sole provider gateway |
| BrainContextBroker | live | KEEP | bounded evidence/context assembly |
| BrainCapabilityRegistry | live | KEEP/EXPAND | register specialist intelligence capabilities |
| BrainTaskProfileRegistry | live | KEEP/EXPAND | typed task behavior |
| ChannelProfileAdapter | live/partial | KEEP/CONNECT | durable channel context |
| ChannelIntelligence | built/partial | KEEP/EXPAND | longitudinal channel intelligence |
| Algorithm Intelligence | built/partial | KEEP/CONNECT | ranked algorithm strategy |
| Opportunity Intelligence | built | KEEP/CONNECT | opportunity specialist |
| Algorithm Priming | built | KEEP/CONNECT | launch/momentum specialist |
| anomaly-intelligence | foundation/island | CONNECT | canonical anomaly specialist |
| BrainOutcomeLedger | built | KEEP/CONNECT | outcome/evaluation lineage |
| BrainVaultAdapter | live/partial | KEEP/EXPAND | asset evidence/provenance |
| Generation Store | live | KEEP/EXPAND | generation persistence/lineage |
| ActionPacket/workflows | live/partial | KEEP | cross-tool transport |
| gemini.ts direct creator generation | live parallel path | MIGRATE | provider implementation behind BrainModelGateway |
| prompts.ts mega-prompts | live parallel path | CONSOLIDATE | versioned task prompt modules |
| generateKeywordAnalysis | apparently unreferenced | VERIFY/DELETE-LATER | no duplicate keyword path |
| Audience Intelligence | planned, no canonical engine found | BUILD | evidence-backed audience model |
| Statistics Intelligence | planned owner | BUILD | deterministic analytics calculations |
| Packaging Intelligence | planned | BUILD | package performance understanding |
| Packaging Engine | fragmented generation | BUILD/CONSOLIDATE | title+thumbnail+metadata package generation |
| Creator Asset Engine | planned owner | BUILD | canonical generation owner |
| Content Intelligence/Creation | fragmented | CONSOLIDATE | project-aware content pipeline |

## Reachability rules

A system is **live** only when a production consumer reaches it. A definition, test, document, registry entry, or toggle alone is not proof of runtime use.

Classify each AI export/service:
- KEEP — canonical and reached.
- CONNECT — valuable but isolated or only indirectly exposed.
- MIGRATE — working behavior that bypasses canonical ownership.
- CONSOLIDATE — duplicates another owner.
- QUARANTINE — obsolete but retained for parity/recovery.
- DELETE-LATER — no unique behavior after verification.

## Target intelligence contract

```ts
export interface IntelligenceBundle {
  channel: unknown
  audience: unknown
  analytics: unknown
  content: unknown
  packaging: unknown
  opportunities: unknown
  anomalies: unknown
  algorithm: unknown
  evidence: unknown[]
  confidence: unknown
  missingEvidence: unknown[]
}
```

This is a planning contract only. Concrete types must reuse existing evidence/profile/outcome types before new types are introduced.

## First implementation slices

1. Produce symbol-level reachability map for `gemini.ts`, `prompts.ts`, Brain services, intelligence services, generation stores, and creator-generation views.
2. Add architecture tests preventing new UI-to-provider direct calls.
3. Define specialist engine interfaces without model calls.
4. Implement Statistics Intelligence first because deterministic calculations reduce prompt load and unsupported claims.
5. Implement Audience Intelligence against analytics-canon + Channel Profile evidence.
6. Implement Packaging Intelligence separately from Packaging generation.
7. Introduce Creator Asset Engine facade and migrate one low-risk generator end-to-end.
8. Persist evidence refs, prompt/model profile, variants, selection/use state and outcome links.
9. Verify parity before quarantining any legacy generator.
10. Update this manifest after every migration slice.

## Acceptance for Phase 0

- No changes to `main`.
- No new provider-specific product logic.
- No second analytics or creator-memory store.
- Every new engine has one canonical owner and typed input/output boundary.
- Existing working generators remain available until parity is proven.
- Every future significant generation is traceable: Evidence -> Generation -> Creator decision -> Artifact/Action -> Outcome -> Evaluation -> Learning.
