# ViewTube AI Creator Intelligence OS
## Architecture, Brainstorm, Implementation Plan, Front-End System, and Management Skill Draft
**Date:** 2026-09-11  
**Repository:** `themotionvisual/ViewTubeBUILD`

## Executive objective

ViewTube should become a closed-loop AI Creator Intelligence Operating System that can:

1. Understand the creator, channel, niche, audience, style, production standards, goals, constraints, historical performance, viewer behavior, comments, and prior decisions.
2. Ingest analytics, metadata, comments, research, creator criticism, instructions, project context, generated assets, and previous recommendations.
3. Generate high-value creator assets: video ideas, research briefs, outlines, hooks, scripts, Shorts, titles, descriptions, tags, chapters, timestamps, educational timestamped questions, image/thumbnail/B-roll briefs, community posts, pinned comments, comment responses, playlist/end-screen plans, editor packages, and publishing packages.
4. Measure what was actually used and what happened afterward.
5. Learn from outcomes and creator corrections without silently rewriting durable creator knowledge or overstating causality.
6. Explain its knowledge in concise, digestible, actionable form.
7. Operate as one governed runtime throughout ViewTube instead of several overlapping AI systems.

## Recommended architecture

Use one primary `BrainRuntime` with specialized canonical intelligence owners rather than either continuing independent AI stacks or building one giant monolith.

```text
Creator / UI / Projects / Feedback
              ↓
          BrainRuntime
   Intent → Capability → Evidence
              ↓
         Context Broker
              ↓
 ┌────────────┼────────────┐
 │            │            │
Knowledge   Evidence     Research
Profile     analytics    public/current
Projects    comments
Vault       outcomes
Style
 └────────────┼────────────┘
              ↓
         Intelligence
 Statistics / Channel / Audience
 Anomaly / Opportunity / Priming / Decision
              ↓
         Reasoning
        ↙           ↘
     Explain       Create
                     ↓
             Creator Asset Engine
                     ↓
         ActionPacket / Tools
                     ↓
                 Outcome
                     ↓
                Evaluation
                     ↓
                 Learning
                     ↓
              Channel Profile
```

## Canonical owners

- **VT-SYNC**: raw YouTube/API/import acquisition and freshness.
- **analytics-canon**: normalized, privacy-filtered analytics access for Brain, widgets, statistics and evaluation.
- **Channel Profile**: durable creator/channel knowledge only.
- **Projects**: project-specific intent, workflow state, planned assets, decisions and production state.
- **Vault / Video Assets**: canonical artifact identity and provenance.
- **Brain Runtime**: task routing, context/evidence planning, reasoning, explanation and orchestration.
- **Statistics Intelligence**: deterministic analytical calculations.
- **Channel Intelligence**: derived longitudinal channel patterns.
- **Audience Intelligence**: channel-specific audience model and viewer needs.
- **Signal / Anomaly Intelligence**: unusual-change detection.
- **Opportunity Intelligence**: strategically useful openings.
- **Algorithm Priming**: proactive pre-launch, launch and post-launch momentum planning.
- **Algorithm Decision**: ranked actions such as HOLD, AMPLIFY, REPACKAGE, RETARGET, REINFORCE_SESSION, CREATE_FOLLOWUP and INSPECT.
- **Creator Asset Engine**: generated creator assets plus provenance.
- **ActionPacket / Handoff**: cross-tool transport.
- **Outcome / Evaluation**: measured results.
- **Learning**: candidates, contradictions, calibration and promotion governance.

## Phase 1 — BrainRuntime consolidation

Create:

```text
src/services/brain/runtime/
  BrainRuntime.ts
  BrainRuntimeContracts.ts
  BrainIntentRouter.ts
  BrainCapabilityRouter.ts
  BrainEvidencePlanner.ts
  BrainContextAssembler.ts
  BrainModelGateway.ts
  BrainResponseVerifier.ts
  BrainExplanationBuilder.ts
  BrainTrace.ts
  BrainPolicy.ts
```

Canonical entry:

```ts
runBrainTask({
  channelId,
  projectId,
  surface,
  userRequest,
  visibleContext,
  artifactRefs,
  requestedOutput,
  permissions,
})
```

Migrate AI Brain first, then Intelligence Hub, Stats/Analytics Copilot, and tool-specific AI surfaces.

## Phase 2 — Evidence Planner

Replace broad analytics dumps with typed evidence requests.

```ts
interface EvidenceRequest {
  question: string
  entityScope: "channel" | "video" | "project" | "asset" | "audience"
  evidenceClasses: string[]
  dimensions: string[]
  metrics: string[]
  windows: EvidenceWindow[]
  comparisons: ComparisonSpec[]
  freshnessRequirement: FreshnessPolicy
  maximumRows: number
}
```

Evidence packets must preserve evidence IDs, source, grain, freshness, availability, partial/missing states and uncertainty.

## Phase 3 — Statistics Intelligence

Create deterministic services for:

- robust baselines
- MAD / robust z-score
- percentiles
- rolling change
- change points
- contribution decomposition
- share shifts
- comparable video cohorts
- lifecycle-normalized comparisons
- retention curve comparison
- traffic decomposition
- seasonality
- sample sufficiency
- experiment deltas
- defensible uncertainty ranges

The LLM explains statistics; it should not invent them.

## Phase 4 — Channel Profile 2.0

Typed domains:

- identity
- niche
- content pillars
- audience promises
- audience segments
- formats
- writing voice
- visual style
- editing style
- pacing
- production quality
- creator preferences
- creator avoidances
- goals
- constraints
- publishing preferences
- historical baselines
- validated patterns
- anti-patterns
- strategic state

Each claim should carry value, confidence, source type, evidence IDs, created/validated/expiry timestamps, contradictions, and status.

## Phase 5 — Creator Style Model

Build a dedicated style layer from creator-selected examples, previous scripts, titles, descriptions, thumbnails, editing notes, published content and explicit corrections.

Separate semantic voice, writing style, visual style, editing grammar, pacing, narrative structure and production standards.

Generation modes:

- STRICT FIDELITY
- BALANCED
- EXPERIMENTAL

Do not infer a durable style rule from one artifact.

## Phase 6 — Channel Intelligence 2.0

Expand beyond workflow preference mining.

Pattern families:

- topic performance
- format performance
- title structures
- packaging performance
- thumbnail structures
- hook structures
- script structures
- audience response
- retention signatures
- traffic behavior
- subscriber conversion
- search maturity
- Browse maturity
- session continuation
- upload timing
- series/follow-up behavior
- production patterns
- community priming
- Shorts → longform routing
- creator workflow preferences
- experiment results

Each pattern should expose scope, confidence, sample size, evidence, counter-evidence, last validation, limitations and recommended uses.

## Phase 7 — Audience Intelligence

Build an audience model from comments and clusters, returning/new viewer behavior, subscribed/unsubscribed behavior, demographics/geography, search terms, traffic sources, retention, community responses, creator-stated audience and successful content promises.

Outputs:

- audience segments
- jobs-to-be-done
- recurring questions
- confusion/objections
- vocabulary
- desired depth
- pacing preferences
- content promises
- loyalty signals
- conversion paths
- emerging interests
- follow-up demand

Feed this into scripts, titles, thumbnails, SEO, community posts, comment replies and topic selection.

## Phase 8 — Algorithm Intelligence integration

Keep sibling ownership separate:

```text
Signal/Anomaly ───────┐
Opportunity ──────────┤
Channel Intelligence ─┤
Project Context ──────┤
Creator Instructions ─┤
                      ▼
             Algorithm Decision
                      │
                      ▼
               ranked actions
```

Separately:

```text
Project + Channel Intelligence
            ↓
      Algorithm Priming
            ↓
Pre-launch → Launch → Early post-launch → Sustain → Learn
```

Make all major Algorithm Intelligence systems normal Brain capabilities.

## Phase 9 — Creator Asset Engine

One engine, specialized schemas:

```text
CreatorAssetEngine
├── TopicIdeation
├── ResearchBrief
├── VideoConcept
├── AudiencePromise
├── Outline
├── Hook
├── Script
├── Shorts
├── Title
├── Description
├── Tags
├── Chapters
├── Timestamps
├── EducationalQuestions
├── ThumbnailBrief
├── ImageBrief
├── BrollPlan
├── CommunityPost
├── CommentReply
├── PinnedComment
├── EndScreenPlan
├── PlaylistPlan
├── FollowUpPlan
└── EditorPackage
```

Every generated asset receives an `AssetGenerationRecord` linking project/video scope, task type, prompt version, model, style/profile version, evidence, creator instructions, variants, selected final version and later outcomes.

## Phase 10 — Project-centered creation workflow

```text
IDEA
 ↓
EVIDENCE / RESEARCH
 ↓
AUDIENCE PROMISE
 ↓
CONCEPT
 ↓
PACKAGING HYPOTHESES
 ↓
OUTLINE
 ↓
SCRIPT
 ↓
VISUAL / B-ROLL PLAN
 ↓
PRODUCTION / EDITOR
 ↓
METADATA
 ↓
PRIMING
 ↓
PUBLISH
 ↓
MONITOR
 ↓
EVALUATE
 ↓
LEARN
```

The Brain should always know the current project phase and expose only relevant capabilities.

## Phase 11 — Communication ingestion

Classify creator communication as instruction, preference, correction, criticism, factual claim, goal, constraint, approval, rejection, experiment note or style feedback.

Communication is evidence; it is not automatically durable memory.

## Phase 12 — Recommendation and asset attribution

Every consequential recommendation and generated asset gets a stable identity:

```text
Evidence
 ↓
Recommendation / Generation
 ↓
Creator decision
 ↓
ActionPacket / final variant
 ↓
Tool execution / publish
 ↓
Lifecycle observations
 ↓
Evaluation
 ↓
Learning candidate
```

This lets ViewTube answer which recommendations worked, which generated variants were actually used, which outputs were heavily edited or rejected, and which high-confidence recommendations succeed in practice.

## Phase 13 — Outcome evaluation

### Titles / thumbnails
- impressions
- CTR when available/imported
- Browse/Suggested reach
- watch-quality guardrail
- cold-audience expansion

### Scripts / hooks
- opening retention
- AVP
- retention shape
- drop points
- comments indicating clarity/confusion

### Topics
- qualified views
- search/Browse distribution
- returning-viewer response
- subscriber conversion
- follow-up demand

### Community posts
- engagement
- downstream launch relationship when traceable

### Shorts
- engaged views
- stayed-to-watch when imported
- AVP
- subscriber conversion
- longform routing when measurable

Do not convert one uncontrolled observation into a causal claim.

## Phase 14 — Experiment Engine

```ts
Experiment {
  hypothesis
  intervention
  comparison
  targetMetrics
  guardrailMetrics
  start
  end
  assetVariants
  evaluationPolicy
  result
  confidence
}
```

Experiments include title/thumbnail changes, upload timing, hook structure, pacing, community priming, series packaging and Shorts routing.

## Phase 15 — Explainability and verbalization

Every analytical answer should be able to express:

```text
WHAT HAPPENED
WHY I THINK IT HAPPENED
EVIDENCE
WHAT I DO NOT KNOW
WHY IT MATTERS
WHAT TO DO
EXPECTED SIGNAL
WHEN TO CHECK AGAIN
```

Response modes:

- Quick Answer
- Action Brief
- Deep Analysis
- Evidence Report
- Experiment Plan
- Creator-Friendly Explanation

## Phase 16 — AI-native widgets

Create `WidgetIntelligenceContext` containing widget ID, dataset IDs, metrics, dimensions, window, filters, selected entities/marks, evidence IDs and available actions.

This enables “Explain this spike,” “Compare this to normal,” “What should I do about this?”, “Turn this insight into a video idea,” and “Create a community post from this opportunity.”

## Phase 17 — Semantic agent tools

Prefer high-value tools:

- `analyze_video_performance`
- `compare_video_cohort`
- `explain_retention_drop`
- `inspect_traffic_shift`
- `find_channel_opportunities`
- `build_launch_plan`
- `generate_video_package`
- `generate_script`
- `generate_short`
- `prepare_packaging_experiment`
- `generate_community_campaign`
- `prepare_comment_responses`
- `prepare_editor_package`
- `prepare_publish_package`
- `evaluate_recommendation`
- `review_learning_candidate`

Avoid hundreds of low-level getters/setters.

## Phase 18 — Model Gateway

One provider-neutral gateway owns task→model profile selection, reasoning level, structured outputs, tool loops, multimodal inputs, retry/timeout, streaming, cost/latency metadata, prompt version, trace ID and safety/guardrails.

Do not scatter provider SDK calls across surfaces.

## Phase 19 — Prompt architecture

Split into versioned modules:

```text
Brain Constitution
Creator Policy
Evidence Policy
Task Profile
Capability Instructions
Tool Contracts
Output Schema
Dynamic Context
```

Record versions on every generation.

## Phase 20 — Trace / observability

Every meaningful turn should record trace ID, surface, request, intent, task profile, capabilities, evidence requested, evidence accepted/rejected, profile claims used, project context, research, context budget, prompt versions, model, tool calls, validation, repairs, recommendations, artifacts, creator decisions and later outcomes.

Create an internal Brain Inspector.

## Phase 21 — Eval Harness

Evaluate evidence correctness, unsupported claims, missing-data honesty, routing, tool selection, tool trajectory, creator specificity, style fidelity, actionability, schema compliance, latency, token usage, repair rate, creator acceptance and measured recommendation success.

Use deterministic graders first, model graders second, and human review where subjective.

## Phase 22 — Self-evaluation modernization

Separate:

- Answer Quality Evaluation
- Evidence Evaluation
- Tool Trajectory Evaluation
- Asset Quality Evaluation
- Outcome Evaluation
- Learning Evaluation

Do not let the same generative call be its only judge.

## Phase 23 — Learning governance

Four levels:

```text
Observation
↓
Measured Outcome
↓
Learning Candidate
↓
Durable Knowledge
```

Promotion thresholds differ for explicit creator teaching, preferences, analytics patterns, experiments, anomalies and causal claims.

Support contradiction, supersession, expiry, confidence decay and creator review.

## Phase 24 — Confidence calibration

Track predicted confidence, recommendation confidence and measured outcome. Use historical calibration to identify overconfidence and underconfidence. Do not silently modify strategy weights until the calibration adjustment system itself is evaluated and governed.

## Phase 25 — Asset provenance graph

```text
Research
→ Idea
→ Outline
→ Script
→ Hook
→ Title
→ Thumbnail
→ Description
→ Video
→ Shorts
→ Community
→ Comments
→ Analytics
→ Evaluation
→ Learning
```

## Phase 26 — Multimedia generation

Common `MediaGenerationRequest` should carry project, asset type, purpose, audience, style profile, script range, visual references, duration, aspect ratio, production quality, evidence and creator instructions.

Generated media should land in Vault with provenance.

## Phase 27 — SEO / metadata intelligence

Use actual channel search evidence, audience vocabulary, semantic script/transcript context, successful historical metadata, creator style, and current research when needed.

Generate titles, descriptions, tags, chapters, timestamps, educational timestamped questions, playlist strategy and semantic entities.

## Phase 28 — Comment and community intelligence

Comments: cluster themes, detect questions/confusion, learn vocabulary, detect requests, infer follow-up demand cautiously, and draft channel-style replies.

Community: warm audience, test ideas, gather feedback, support launches and reinforce follow-ups.

## Phase 29 — Autonomy

### Suggest
Advice only.

### Guided
Prepare ActionPackets and ask approval.

### Automatic
Only explicitly permitted low-risk, reversible actions.

Keep publishing, destructive edits and consequential external communication approval-gated by default.

## Phase 30 — Persistence

Durably persist traces, recommendations, ActionPackets, outcomes, lifecycle observations, learning candidates, experiments, generation records, artifact provenance and profile claim history.

Local storage should be cache/offline support, not production authority.

# Front-end system brainstorm

The Brain should not be represented only as chat.

## 1. Brain Command Center
Conversation + context rail + current goal + active project + strategic state + recommendations + evidence + approvals + evaluation inbox.

## 2. Intelligence Stack
Compact modules for Channel Intelligence, Audience Intelligence, Algorithm Intelligence, Opportunity Radar, Anomaly Radar, Priming Status, Evaluation Health and Learning Health.

## 3. Brain Toolbox Drawer
Semantic tools grouped as Ask, Analyze, Compare, Explain, Research, Create, Plan, Experiment, Evaluate and Learn.

## 4. Evidence Drawer
For every answer: evidence used, missing evidence, freshness, grain, confidence and contradictions.

## 5. “Why this?” Inspector
Shows why a capability/evidence source/recommendation was selected and what outcome would change the conclusion.

## 6. Channel Knowledge Map
Interactive map of niche, pillars, audience, style, formats, validated patterns, uncertain hypotheses, goals and constraints. Users can approve/edit/dispute/retire claims.

## 7. Creator Style Studio
Writing voice, visual style, pacing, production level, strict/balanced/experimental mode, references and anti-patterns.

## 8. Strategy Board
Cards for HOLD / AMPLIFY / REPACKAGE / RETARGET / REINFORCE_SESSION / CREATE_FOLLOWUP / INSPECT with evidence, confidence and review horizon.

## 9. Evaluation Inbox
Overdue evaluations, insufficient evidence, wins/losses, unresolved experiments, learning candidates and calibration warnings.

## 10. Learning Ledger
Observations / Outcomes / Candidates / Approved / Disputed / Retired.

## 11. Creation Composer
Choose project, asset type, evidence scope and style mode; generate variants; compare; send to tool; save to Vault; mark final used version.

## 12. Project Intelligence Strip
Audience promise, evidence strength, current phase, next best action, relevant patterns and priming checklist.

## 13. Widget Copilot
Explain / Compare / Ask / Create From Insight / Experiment / Send to Project.

## 14. Brain Health / Developer Inspector
Trace, context budget, capability route, tool calls, model, latency, tokens, validation, repairs, eval scores and outcome links.

# Implementation order

1. Inventory direct model/provider calls.
2. Inventory all Brain/Intelligence prompt paths.
3. Introduce BrainRuntime façade without changing behavior.
4. Route AI Brain through it.
5. Route Intelligence Hub through it.
6. Route Stats/Analytics Copilot through it.
7. Consolidate capability registries.
8. Build Evidence Planner.
9. Build Statistics Intelligence.
10. Add Algorithm Intelligence to normal Brain turns.
11. Expand Channel Intelligence.
12. Build Audience Intelligence.
13. Normalize Channel Profile claims.
14. Build Creator Style Model.
15. Build Creator Asset Engine.
16. Add AssetGenerationRecord.
17. Bind Projects to creation pipeline.
18. Complete ActionPacket/Handoff.
19. Complete Outcome/Evaluation.
20. Add asset-to-video attribution.
21. Add Experiment Engine.
22. Add learning governance.
23. Add WidgetIntelligenceContext.
24. Add Brain Trace.
25. Add Eval Harness.
26. Add Brain Inspector.
27. Add confidence calibration.
28. Remove superseded parallel orchestration after parity.
29. Update docs and User Guide.
30. Expand autonomy only after eval thresholds are met.

# Key acceptance scenarios

## Analytics diagnosis
“Why did this video stop growing?”
- identify the entity
- plan evidence
- retrieve canonical data
- compare lifecycle/cohort
- run deterministic statistics
- explain uncertainty
- propose action
- define success signal
- do not invent unavailable metrics

## Generate a full video package
“Make my next video about Napoleon’s retreat from Moscow.”
- use channel/niche/profile/style
- inspect audience and historical patterns
- research external facts when needed
- generate concept, audience promise, outline, script, titles, description, tags, thumbnail brief, B-roll, chapters/questions, Shorts/follow-up ideas
- link everything to one Project
- record generation provenance

## Outcome learning
A generated title is published.
- know which variant was used
- monitor valid metrics
- compare fairly
- avoid causal overclaim
- record outcome
- accumulate repeated evidence
- require governance before durable learning

## Criticism
“Your scripts are too dramatic and repetitive.”
- capture correction
- identify affected style dimensions
- apply it to future script work
- avoid modifying unrelated Profile facts
- track whether creator acceptance improves

## Widget intelligence
Creator taps a spike and asks “What happened?”
- receive exact widget context
- retrieve supporting evidence
- explain
- optionally convert the insight into a Project or ActionPacket

# Research-derived design principles

- Context is finite; curate rather than accumulate.
- Prefer semantic, high-value tools to broad low-level tool catalogs.
- Evaluate full agent trajectories, not only final answers.
- Add complexity only when evals prove it improves outcomes.
- Use multi-agent research selectively for parallel, breadth-heavy tasks.
- Keep deterministic workflow where predictability matters.
- Preserve evidence provenance and uncertainty.
- Separate reasoning from execution permissions.
- Require approval for consequential actions.
- Improve with measured outcomes, not model self-confidence.

# Definition of done

The system is successful when it can truthfully say:

> I understand your channel, audience, creative style, goals, evidence, current project, historical results, prior advice, the assets I helped make, which versions you actually used, and what happened afterward. I can explain what I know, what I do not know, what I recommend, why I recommend it, how confident I am, and what result would change my mind. I can turn that understanding into useful creator work while preserving your approval, voice and ownership.

And the code can prove that through canonical data ownership, evidence provenance, traces, evals, attribution, outcome measurement, governed learning and creator controls.
