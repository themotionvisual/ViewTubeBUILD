# ViewTube Product Architecture

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** PRODUCT_ARCHITECTURE  
**Status:** ACTIVE  
**Concern:** creator lifecycle, Master Tools, capabilities, product boundaries, and canonical system topology  
**Owner:** Product Architecture  
**Registry ID:** DOC-ARCH-PRODUCT  
**Last Audited Main SHA:** ee02fdbd1af2be30e81de7955dad188999a03ac4  
**Supersedes:** docs/architecture/VIEWTUBE_MASTER_PRODUCT_TOOLS_WORKSTATION_ARCHITECTURE.md after migration certification  
**Consolidates:** durable target architecture from docs/architecture/VIEWTUBE_SYSTEM_CONVERGENCE_AND_CONSOLIDATION.md  
**Related Authorities:** docs/architecture/capabilities.json; docs/programs/INTEGRATED_APPLICATION.md; scoped Domain Authorities

## Product rule

ViewTube is one creator workstation with many specialized surfaces. Deep modules keep narrow canonical ownership; pages, widgets and tools consume capabilities rather than becoming independent products or truth stores.

## Creator lifecycle

Discover → Validate → Design → Produce → Assemble → Package → Publish → Engage → Learn → Operate.

## Master Tools

1. Opportunity Radar
2. Channel Intelligence Hub
3. Content Strategy Lab
4. Project & Production Command
5. Script & Story Studio
6. Visual Development Studio
7. Vault & Asset Engine
8. Video Director & Editor
9. Packaging & Experiment Lab
10. Publisher & Distribution Center
11. Audience & Community Desk
12. Monetization & Operations Hub

Master Tools are product groupings, not backend owners. Widgets are views into capabilities, not separate products.

## Six canonical convergence systems

### 1. Creator Context & Knowledge
Resolves creator/channel facts, validated knowledge, style, goals, active Project/ContentBuild, current surface/selection and personalization permissions. Context may reference evidence but does not own evidence.

### 2. Evidence & Intelligence
Separates measured evidence, deterministic derived signals, and specialist interpretation. analytics-canon remains analytics truth. Statistics, Audience, Channel, Opportunity, Algorithm and other specialists remain modules rather than competing truth stores.

### 3. Project / Content / Asset Graph
Project owns workflow planning. ContentBuild owns durable evolving content identity. Asset Engine owns artifact lifecycle/lineage/version/variant semantics. Vault is the browse/search/manage/storage experience over the same asset identities. Video, Publishing, Launch and tool packages should increasingly be projections rather than copied state universes.

### 4. Creator Operations & Generation
Provides one operation/provenance contract for reasoning operations, generation, transforms, render jobs, research, tool handoffs and external execution. Existing ActionPacket, GenerationRecord and ToolReceipt concepts may converge through shared operation identity without forcing an unsafe immediate storage rewrite.

### 5. Outcomes, Evaluation & Learning
Unifies producer contracts and lifecycle across actions, outcomes, evaluations, learning candidates and governed promotion. One-off correlations or successes never silently become durable Channel Knowledge.

### 6. Brain Runtime & Experience
All creator-facing AI surfaces route through the shared BrainRuntime/BrainModelGateway/task-capability experience contract. UI requests capabilities; UI does not assemble bespoke provider stacks.

## Boundaries that remain distinct

- Analytics truth vs Intelligence interpretation.
- Creator Knowledge vs Evidence.
- Project vs ContentBuild.
- Asset Engine semantics vs Vault library/storage UX.
- Brain orchestration vs specialist intelligence.
- AI/recommendation vs Publishing/external side effects.
- Domain architecture vs Task/mission status.
- Product capability vs UI surface.

## Canonical ownership laws

- Unionize capabilities, not owners.
- Prefer projection over synchronization.
- Prefer shared contracts over giant files.
- External side effects keep strict owners.
- Models do not own calculations, permissions, durable knowledge, or task truth.
- Current code/tests/runtime may prove implementation; they do not redefine intended product architecture silently.
- A new capability must reconcile against existing capabilities and owners before acceptance.

## Capability model

Capabilities are durable abilities with stable CAP IDs. A capability has one canonical owner, may participate in multiple Master Tools/domains/lifecycle stages, and may have many tasks. Task turnover never changes capability identity.

Machine registry: docs/architecture/capabilities.json.

## Change protocol

Any proposed feature/system/integration/design must be classified as:
- existing capability extension;
- new accepted capability;
- implementation of an accepted capability;
- product-surface redesign;
- consolidation/simplification;
- experimental opportunity.

Before creating a new capability, reconcile current Product Architecture, Capability Registry, Domain Authority, Task Index, active mission/PR and donor artifacts.


## Strategic master sources

Before major feature/tool/system ideation, consolidation, creator-workstation redesign, AI/agent architecture expansion, API/integration planning, analytics invention, monetization architecture, or product-roadmap work, consult:

- `docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md` — MASTER_SOURCE tier; broad research and construction blueprint containing the feature-canon methodology, master-tool consolidation model, API/capability atlas, Channel Brain and agent architecture, analytics/visualization framework, creator-workflow model, infrastructure/economics/governance research program, and final master-document production blueprint.

Use it to challenge and improve the current architecture. Promote accepted improvements through this document, the Capability Registry, Domain Authorities, Decision records, Integrated Application Program, and Task Index rather than treating source proposals as automatically canonical.
