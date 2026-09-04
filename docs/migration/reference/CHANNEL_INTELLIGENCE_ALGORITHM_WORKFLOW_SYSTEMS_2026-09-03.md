# Channel Intelligence + Algorithm + Workflow Systems

**Date:** 2026-09-03  
**Runtime branch:** `feature/channel-intelligence-algorithm-workflows`  
**Stacked on:** `themotionvisual/feat/brain-phase-five-production-chains` (PR #72)  
**Draft PR:** #79

## Purpose

Continue ViewTube's Brain production-chain architecture without adding parallel stores or workflow formats.

The new stack is:

```text
Channel Profile
+ Outcome Ledger
+ Workflow Results
        ↓
Channel Intelligence Snapshot
        ↓
Algorithm Strategy Engine
        ↓
controlled recommendation
        ↓
Brain Super Tool ActionPacket / Handoff
        ↓
destination tool
        ↓
Outcome / Learning
```

## 1. Channel Intelligence

`src/services/brain/ChannelIntelligence.ts`

The service reads existing canonical Brain/Profile infrastructure rather than creating a second channel-profile database.

Inputs:

- `ChannelProfileAdapter`
- Brain memory claims
- Brain Outcome Ledger
- channel workflow-result history

It derives compact channel-specific patterns such as:

- repeated workflow strength;
- repeated workflow weakness;
- creator tool preference;
- creator tool avoidance;
- validated Brain/Profile claims.

The output is a `ChannelIntelligenceSnapshot` with:

- profile summary;
- analytics availability;
- learned claims;
- outcome summary;
- workflow history;
- repeated channel-specific patterns;
- evidence IDs/counts.

### Rule

Channel Intelligence is a read/derived layer. It does not silently promote observations into durable Channel Profile facts.

## 2. Algorithm Strategy Engine

`src/services/brain/AlgorithmStrategyEngine.ts`

This is a deterministic recommendation engine for structured analytics/anomaly signals.

Current signal kinds include:

- traffic expansion;
- traffic contraction;
- search breakout;
- external breakout;
- audience mix shift;
- packaging decline;
- retention decline;
- retention strength;
- session opportunity;
- revenue shift;
- back-catalog resurgence.

Current commands:

- `HOLD`
- `AMPLIFY`
- `REPACKAGE`
- `RETARGET`
- `REINFORCE_SESSION`
- `CREATE_FOLLOWUP`
- `INSPECT`

Every recommendation includes:

- signal ID;
- command;
- rationale;
- score;
- confidence;
- evidence IDs;
- destination tool when appropriate;
- checkpoint;
- guardrails;
- structured signal payload.

### Important behavior

`HOLD` is a legitimate strategy result. It does not generate a write action.

Examples:

- traffic expansion + stable/strong watch quality → HOLD;
- search breakout → CREATE_FOLLOWUP;
- CTR/packaging decline + strong post-click quality → REPACKAGE;
- cold audience shift + weak watch quality → RETARGET;
- retention decline → retention diagnosis;
- session opportunity → REINFORCE_SESSION.

## 3. Algorithm Workflow Recipes

`src/services/brain/AlgorithmWorkflowRecipes.ts`

Approved recommendations are translated into the existing `BrainSuperToolBridge` rather than a new workflow packet format.

Examples:

- REPACKAGE → Packaging Lab Pro
- RETARGET → Packaging Lab Pro
- REINFORCE_SESSION → Packaging Lab Pro
- CREATE_FOLLOWUP → Creator Canvas OS
- AMPLIFY → Audience Loop Studio
- INSPECT → Cinematic Analytics Lab
- HOLD → no handoff; monitor checkpoint only

Every real action therefore continues through:

- Super Tool action packet;
- Handoff Inbox;
- evidence trail;
- creator controls;
- workflow/outcome system.

## 4. Channel Intelligence Workflow Planner

`src/services/brain/ChannelIntelligenceWorkflowPlanner.ts`

This binds the layers together.

For one request it can:

1. load the channel-specific intelligence snapshot;
2. rank algorithm signals;
3. call the existing adaptive workflow recommender;
4. return both algorithm recommendations and creator workflow options;
5. explicitly execute one selected recommendation only when requested.

Execution remains creator-controlled.

## 5. Tests

`src/services/brain/__tests__/AlgorithmStrategyEngine.test.ts`

Current test coverage includes:

- healthy distribution expansion produces HOLD rather than premature repackaging;
- search breakout routes to follow-up ideation;
- weak packaging with strong post-click quality produces REPACKAGE;
- cold audience shift with weak watch quality produces RETARGET.

## 6. Relationship to Signal Anomaly Intelligence

PR #78 / the later post-#77 anomaly branch should become a primary structured signal producer.

Target flow:

```text
VT-SYNC
 → analytics-canon
 → anomaly event
 → AlgorithmSignal
 → Channel Intelligence context
 → AlgorithmRecommendation
 → creator-approved Handoff
 → Outcome Ledger
 → Learning Ledger
 → validated Channel Profile learning
```

Anomaly detection and Algorithm Strategy must stay separate:

- Anomaly says **what changed**.
- Channel Intelligence says **what this channel has learned before**.
- Algorithm Strategy says **what action is justified now**.
- Workflow Runtime says **where that action goes**.
- Outcome/Learning says **whether it worked**.

## 7. Next build sequence

1. Add a typed adapter from Signal Anomaly Intelligence events into `AlgorithmSignal`.
2. Add prediction/evaluation metadata to recommendations so every recommendation has a measurable horizon.
3. Connect recommendation IDs to Brain Outcome Ledger records.
4. Add repeated algorithm-pattern learning without direct Profile promotion.
5. Add Channel Intelligence baselines from canonical analytics evidence.
6. Add strategy families for launch/pre-launch/post-launch states.
7. Add a creator-facing Channel Intelligence / Algorithm Momentum dashboard surface.
8. Add Stats Chat intents: what changed, why, what should I do, what has worked before.
9. Add explicit contradiction handling when historical channel patterns conflict with current evidence.
10. Keep all writes behind Brain User Control / creator approval policy.

## Canonical ownership

- VT-SYNC owns raw analytics.
- analytics-canon owns public analytics access.
- Channel Profile owns durable validated channel knowledge.
- Channel Intelligence derives compact current context.
- Anomaly owns detected changes.
- Algorithm Strategy owns deterministic action recommendations.
- Brain owns orchestration/explanation.
- ActionPacket/Handoff owns cross-tool transport.
- Outcome/Learning owns evaluation and future adaptation.
