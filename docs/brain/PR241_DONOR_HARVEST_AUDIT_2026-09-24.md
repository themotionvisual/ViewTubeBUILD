# PR #241 Donor Harvest Audit — 2026-09-24

**Donor PR:** #241 — `docs: verified AI/Brain systems audit and implementation plan`  
**Donor branch:** `claude/ai-audit-content-optimization-gdwwp9`  
**Donor head:** `031230f0726063bf52895c693da26c06ca6b4264`  
**Original base:** `d3e6c1296eae06197645407bbc0bb8e96f76e6dd`  
**Donor size:** 5 commits, 34 changed files, +5,580 / -32  
**Current integration base:** current `main` plus the active 2026-09-24 Brain-quality stack.  
**Policy:** use PR #241 as a donor. Never merge/cherry-pick the branch wholesale.

## Executive finding

PR #241 was much more important than its title suggests. It contained:

- the original verified AI reachability/operational audit;
- the original `BrainTrace`;
- deterministic `StyleProfile` / stylometrics;
- governed `AssetGenerator`;
- tokenized numeric grounding;
- model-routing observability;
- creator-asset persistence/outcomes;
- community-post governed generation;
- workflow negative-preference learning;
- AI system stewardship and eval/generation/auth skills;
- a reachability audit script;
- a large Brain/product design backlog.

Most of the core runtime code was later incorporated into current ViewTube, often byte-for-byte. Therefore the safe recovery strategy is **not** to merge the donor branch. Harvest only unique knowledge/tooling and behavior that is still absent or better than current code.

## Classification vocabulary

- **ABSORBED IDENTICAL** — donor file exists byte-identically on current main.
- **MAIN STRONGER** — same responsibility exists and current implementation has meaningful improvements.
- **DONOR UNIQUE — PORT** — donor capability is absent and still useful.
- **DONOR SEMANTIC — ADAPT** — current code exists, but donor contains a better rule/behavior worth forward-porting.
- **REFERENCE ONLY** — useful historical architecture/diagnostics, but stale as current-state authority.
- **NO PORT** — no meaningful surviving value beyond history.

## Complete 34-file matrix

| Donor file | Current state | Disposition | Reason / action |
|---|---|---|---|
| `.claude/skills/viewtube-ai-system-steward/SKILL.md` | absent; overlaps current `viewtube-ai-system-governor` | DONOR UNIQUE — ADAPT | Do not create a second AI authority. Move the six decay patterns, health checks, ratchet concept and reachability/write-caller gates into the current governor + a health-check reference. |
| `.claude/skills/viewtube-brain-eval-harness/SKILL.md` | absent | DONOR UNIQUE — PORT/UPDATE | Add as a distinct quality-evaluation skill. It does not overlap mission verification; update source paths and current contracts. |
| `.claude/skills/viewtube-creator-asset-generation/SKILL.md` | absent | DONOR UNIQUE — PORT/UPDATE | Add as specialist skill under current AssetGenerator/PromptConstitution/BrainTrace architecture. |
| `.claude/skills/viewtube-youtube-auth-api-stabilization/SKILL.md` | absent; concepts substantially represented in current auth references | REFERENCE ONLY / MERGE GAPS | Avoid another overlapping skill. Preserve donor copy historically and merge any missing diagnostics/merge rules into `VIEWTUBE_AUTH_API_STABILIZATION_REFERENCE.md`. |
| `docs/VIEWTUBE_AI_BRAIN_BRAINSTORM_AND_FRONTEND_DESIGN_2026-09-12.md` | absent | REFERENCE ONLY + FEATURE HARVEST | Preserve under migration/reference with supersession header; extract still-unbuilt Brain UI ideas into current roadmap. |
| `docs/VIEWTUBE_AI_SYSTEMS_VERIFIED_AUDIT_AND_IMPLEMENTATION_PLAN_2026-09-12.md` | absent | REFERENCE ONLY + REQUIREMENT HARVEST | Preserve historically. Its operational ratings are stale; its audit methodology, failure patterns and phased requirements remain valuable. |
| `scripts/audit/reach.mjs` | absent; no current `scripts/audit` directory | DONOR UNIQUE — PORT | Restore as low-risk operational reachability tooling and expose it through the AI governor/health check. |
| `src/app/pageRegistry.ts` | current main adds later render-bench route | MAIN STRONGER | Donor only lacks newer route; do not port. |
| `src/components/SendToMenu.tsx` | current main lost donor's skip-above negative signals | **DONOR UNIQUE — PORT** | Restore tested rule: when a lower-ranked destination is chosen, higher-ranked shown targets get `accepted:false`; lower-ranked/unseen targets are not penalized. |
| `src/components/crown/CrownLiveBrain.tsx` | differs only in optional chaining around arrays | NO PORT by default | Current typed state expects arrays. Revisit only if runtime nullability evidence appears; do not create incidental UI churn. |
| `src/features/creator-engagement/useCommunityPostController.ts` | current main is substantially stronger | MAIN STRONGER | Main retains governed AssetGenerator + outcome tracking and adds linked-video URL resolution, media attachments, ref-based generation tracking and governed refine. |
| `src/services/__tests__/brainOrchestrator.test.ts` | main lost donor warning/blocker distinction | **DONOR SEMANTIC — ADAPT** | Reintroduce test coverage distinguishing fabricated numeric claims (block) from unverified derived rates/percentages (warning/review), adapted to current numeric auditor and quality loop. |
| `src/services/brain/AssetGenerator.ts` | current main adds media attachments and later prompt-quality work | MAIN STRONGER | Keep main. |
| `src/services/brain/BrainOrchestrator.ts` | current main has richer evidence/audience/algorithm/channel-knowledge/project context; donor had better numeric warning semantics | MAIN STRONGER + DONOR SEMANTIC | Never replace current orchestrator. Port only the numeric blocker/warning distinction through current quality contracts. |
| `src/services/brain/BrainTrace.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/StyleProfile.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/__tests__/AlgorithmMonitoringSchedule.test.ts` | trivial divergence | NO PORT | No meaningful donor behavior identified. |
| `src/services/brain/__tests__/AssetGenerator.test.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/__tests__/BrainTrace.test.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/__tests__/StyleProfile.test.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/__tests__/assetOutcomes.test.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/__tests__/creatorAssets.test.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/__tests__/modelRouting.test.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/__tests__/numericClaims.test.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/__tests__/styleMetrics.test.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/assetModelRunner.ts` | current main uses provider-owned `generateSchemaJsonObject`, records requested/served IDs, supports media | MAIN STRONGER | Donor's direct client adapter is superseded; do not restore. |
| `src/services/brain/assetOutcomes.ts` | byte-identical | ABSORBED IDENTICAL | Core edit/copy/save outcome logic already retained. |
| `src/services/brain/assetStrategies/communityPost.ts` | byte-identical | ABSORBED IDENTICAL | Governed community-post strategy already retained. |
| `src/services/brain/creatorAssets.ts` | current main adds media attachments | MAIN STRONGER | Keep main. |
| `src/services/brain/modelRouting.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/brain/numericClaims.ts` | byte-identical | ABSORBED IDENTICAL | Core tokenized/tolerant numeric auditor retained. |
| `src/services/brain/styleMetrics.ts` | byte-identical | ABSORBED IDENTICAL | No action. |
| `src/services/gemini.ts` | current main has provider-owned Brain/schema JSON helpers and media support; donor added `resolveActiveModel` reporting | MAIN STRONGER / CONCEPT ABSORBED | Keep current provider seam. Ensure requested-vs-served model provenance remains observable through current gateway/runner. |
| `src/types.ts` | current main evolved ContentBuild/evidence types; donor had `unverifiedDerivedNumbers` distinction | MAIN STRONGER + DONOR SEMANTIC | Do not replace types. Restore the semantic distinction via the current Brain answer-quality/evaluation contract if still absent. |

## Donor code already retained exactly

The following high-value PR #241 foundations are byte-identical on current main:

- `BrainTrace.ts`
- `StyleProfile.ts`
- `styleMetrics.ts`
- `numericClaims.ts`
- `modelRouting.ts`
- `assetOutcomes.ts`
- `assetStrategies/communityPost.ts`
- AssetGenerator, BrainTrace, StyleProfile, asset-outcome, creator-asset, model-routing, numeric-claim and style-metric test foundations (where noted above).

This is important: these should be treated as **successfully harvested history**, not missing work.

## Donor code absorbed and improved

Current implementations are stronger in these areas:

- `AssetGenerator`: media-aware generation and current shared prompt/evidence architecture.
- `assetModelRunner`: provider-owned schema JSON generation instead of direct provider client ownership in the adapter.
- `creatorAssets`: media attachments.
- `useCommunityPostController`: governed generation *and* refine path, linked-video URL enforcement, media attachments, safer generation tracking.
- `BrainOrchestrator`: canonical statistics/evidence quality, Audience Intelligence, Algorithm Intelligence, Channel Knowledge and project context.
- `gemini.ts`: current shared Brain/schema provider helpers.

## Behavior still worth harvesting

### 1. SendToMenu negative preference signal

PR #241 recorded a negative preference only for ranked destinations shown above the creator's eventual choice. This is high-quality implicit feedback:

- chosen target → accepted;
- higher-ranked target passed over → rejected signal;
- lower-ranked targets → no signal because the creator may not have considered them.

Current main contains the positive signal but lost the skip-above negatives. Port this with focused tests.

### 2. Numeric blocker vs warning distinction

PR #241 intentionally separated:

- **fabricated count/magnitude absent from evidence** → blocker + repair;
- **unverified derived percentage/rate** → warning/observability, because it may be a valid derivation that deterministic statistics should eventually supply.

Current main's older Brain validation collapses these into one unsupported-number bucket. The 2026-09-24 Brain-quality stack has already restored parsed numeric auditing, but the blocker/warning distinction must be retained explicitly rather than silently treating every derived rate as fabricated.

Do not copy the donor orchestrator. Adapt the rule into the current answer-quality/trace/repair contracts.

## Donor skills / operational knowledge

### AI system steward

The skill's **six decay patterns** remain highly valuable:

1. orphan subsystem;
2. ledger with no writer;
3. inert registry;
4. ungoverned generator;
5. canonical analytics bypass;
6. trustworthy-looking UI over ungrounded output.

Its monthly/release health checks and ratchet idea should become a reference owned by the current `viewtube-ai-system-governor`, not a competing skill.

### Brain eval harness

Still unique and needed. Retain these requirements:

- deterministic + rubric-model + human grader channels;
- sparse/empty/stale/permission-disabled golden fixtures;
- parsed numeric grounding;
- requested-vs-served model attribution;
- output distributions, not only means;
- separate AI-quality CI gate rather than hiding under existing static-quality debt;
- deliberate regression test proving the gate can fail.

### Creator asset generation

Still unique as a specialist operational skill. Retain the four contracts:

**grounded + style-faithful + evaluated + traceable**.

Update the donor wording to current owners: BrainRuntime/PromptConstitution/analytics-canon/AssetGenerator/BrainTrace/Generation or asset provenance/outcome evaluation.

### YouTube auth/API stabilization

Do not install as another active skill because current auth references already own this space. Preserve historically and reconcile only gaps. Its most durable rules are already represented in current docs:

- one server-owned auth/session truth;
- distinguish session vs authorization vs channel vs feature readiness;
- classify 401/403 before changing auth state;
- verify production SHA and READY deployment;
- retain diagnostics on mobile;
- remove duplicate routes/functions after parity;
- treat platform function limits as architecture constraints.

## PR #241 product/design backlog

The donor brainstorm contains product concepts not represented by changed files. Current-main search on 2026-09-24 found no implementation under these names:

- `KnowledgeMap`
- `StyleFingerprint`
- `VariantComparator`
- `OpportunityRadar`
- `ImpactCard`
- `CalibrationChart`
- `TraceTimeline`
- `WhyButton`
- `EvidenceGapCard`
- `ActivityFeed`
- `AutonomyMatrix`
- `ScheduleBuilder`

These should not all be built merely because the names are absent. They remain **feature donors** to current Brain Hub / widget planning and must be evaluated against today's toolbox/component system.

Partially retained concepts:

- `BrainConfidenceChip` and `BrainEvidenceDrawer` exist in the Brain interface, but the donor's universal Claim/Evidence grammar is not universal.
- StyleProfile backend exists, but a creator-facing Style Fingerprint/teaching surface is not established.
- BrainTrace exists, but a full creator/operator Trace Timeline is not established.
- governed Community Post generation exists; the donor's autonomy/scheduling/read-back ambitions are only partially realized.
- Channel Knowledge now exists; the donor's editable Knowledge Map remains a UI/product opportunity.

## Donor document handling

The two donor documents must be kept, but **never as current status authority**.

1. Preserve the 2026-09-12 verified audit under `docs/migration/reference/` with a supersession header.
2. Preserve the brainstorm/frontend design under `docs/migration/reference/` with a supersession header.
3. Link them from the migration/reference README and current AI cross-branch harvest documentation.
4. Current authority remains the 2026-09-17 unified AI contract, current Brain docs, current Finish Program, and current code.

## Harvest decisions

### Port now
- historical donor documents with status headers;
- reachability audit script;
- eval-harness skill, adapted;
- creator-asset-generation skill, adapted;
- AI governor operational health reference;
- SendToMenu skip-above negative signals;
- numeric blocker/warning semantic distinction.

### Preserve as reference, do not activate directly
- donor AI steward as a separate owner;
- donor auth stabilization skill;
- old maturity percentages and point-in-time reachability counts;
- old provider/client assumptions;
- donor BrainOrchestrator/gemini/types files wholesale.

### Do not port
- identical files;
- older versions where main has media/provider/context improvements;
- incidental Crown optional-chaining change without evidence of a runtime nullability defect;
- stale page registry state.

## Completion criterion for the PR #241 harvest

The donor can be considered exhausted when:

- all 34 file changes have one of the dispositions above;
- donor-only documentation is preserved with supersession metadata;
- operational skill knowledge has a current owner;
- reachability checks are runnable on current code;
- the two donor-superior runtime behaviors have focused tests and current implementations;
- the unimplemented product ideas are registered in current Brain/UI planning rather than stranded in an old PR;
- a final compare/reachability pass confirms no other unique donor behavior remains.
