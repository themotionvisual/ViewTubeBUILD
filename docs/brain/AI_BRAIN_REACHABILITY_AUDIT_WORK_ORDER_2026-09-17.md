# AI / Brain Reachability Audit Work Order

**Status:** HISTORICAL COMPLETED WORK ORDER  
**Current authority:** `UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`  
**Wave 5 note (2026-09-24):** retain the inventory questions and verification method as an audit recipe. The work order itself is no longer the active execution owner.

## Herald intake
- Verb: BUILD
- Tier: T2
- Owner: Brain Runtime / AI System Governor
- Supporting disciplines: Prince Brain, Skill Finder, Solution Finder, Docs Grill, Verification Chancellor
- Non-goal: no deletion or main-branch replacement in this slice.

## Questions this audit must answer

For every AI/Brain service and generation function:
1. Where is it defined?
2. Which production modules import it?
3. Which production interactions invoke it?
4. Does it call a model/provider directly?
5. Which evidence sources can it access?
6. Does it use Brain Runtime/Context Broker?
7. Does it persist a Generation Record?
8. Is it Project-scoped?
9. Is it Vault/asset-linked?
10. Can its output be connected to an outcome/evaluation?
11. Is there overlapping ownership?
12. What is the migration disposition?

## Required inventories

### Runtime/orchestration
`src/services/brain/runtime/**`
`BrainOrchestrator`
`BrainContextBroker`
`BrainCapabilityRegistry`
`BrainTaskProfileRegistry`
`aiBrainCommandInterface`
`aiBrainConversationStore`

### Intelligence
`ChannelIntelligence`
`AlgorithmIntelligence*`
`OpportunityIntelligence`
`AlgorithmPriming*`
`AlgorithmStrategyEngine`
`anomaly-intelligence/**`
analytics-canon intelligence/evidence adapters

### Generation
`src/services/gemini.ts`
`src/services/prompts.ts`
SEO, Hook, Thumbnail, Publisher, Community, Storyboard, Shorts and Intelligence Hub callers.

### Knowledge/evidence
Channel Profile, Brain Memory Claims, Vault adapter, Projects, analytics-canon, niche knowledge/current research.

### Persistence/evaluation
Generation Store, BrainOutcomeLedger, workflow learning, ActionPackets, handoff inbox, experiment/evaluation services.

## Output matrix

`symbol | owner | definition | production consumers | direct provider? | Brain context? | evidence | persistence | outcome link | overlap | disposition | confidence`

## Verification

- Search import and invocation sites separately.
- Ignore tests/docs as proof of production reachability.
- Treat dynamic imports and registry dispatch as reachable only after tracing the registry consumer.
- Run focused architecture/tests when implementation begins.
- No deletion until replacement parity and outcome lineage are proven.
