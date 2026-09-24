> **Historical donor reference — PR #241**  
> Preserved from donor head `031230f0726063bf52895c693da26c06ca6b4264` on 2026-09-24.  
> This document captures a 2026-09-12 point-in-time audit/design state. Its maturity percentages, reachability counts, branch status, provider assumptions and “current” claims are **not current authority**.  
> Use `docs/brain/PR241_DONOR_HARVEST_AUDIT_2026-09-24.md`, current Brain architecture docs, current code, and `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` for present status.  
> Valuable requirements and feature ideas are retained below as donor evidence.

# ViewTube AI Brain — Optimization Brainstorm and Front-End Design

**Date:** 2026-09-12
**Status:** Design brainstorm. **No implementation authorized.** Awaiting approval per the brainstorming process.
**Classification:** Architectural (new subsystems + restructuring)
**Companion:** `docs/VIEWTUBE_AI_SYSTEMS_VERIFIED_AUDIT_AND_IMPLEMENTATION_PLAN_2026-09-12.md`

**Decisions taken as input:**
- Brain is **both** a destination and an ambient layer, built in parallel.
- Surfaces serve **creators and operators** (trace/eval/cost tooling is in scope).
- **Autonomy is creator-configurable.** The Brain must ship a settings and control module where each creator sets what it may do on its own, including scheduled generation of community posts and content ideas.

---

## The framing problem

A brain is invisible. Everything valuable about it — what it knows, why it believes something, how sure it is, what it learned, what it did while you were away — has no natural shape on screen.

So the front-end job is not "add a chat window." It is to **externalize five things**:

| What must become visible | Today | Consequence |
|---|---|---|
| What it knows | Nothing | Creator can't correct a wrong belief |
| What it looked at | Nothing | Creator can't tell insight from guess |
| How sure it is, and why | A static chip | Confidence is decorative |
| What it learned from you | Empty UI | Product never feels like it improves |
| What it did on its own | N/A | Autonomy is unsafe without an audit trail |

This framing drives every component proposed below.

There is a second, sharper problem the audit exposed. **The AI currently looks more trustworthy than it is.** Ten of 52 dashboard widgets call `gemini.ts` generators directly with no evidence, no evaluation and no grounding check, and they render with the same visual authority as canonical analytics. Any front-end work that adds polish without fixing grounding widens that gap. This constrains the sequencing recommendation in Part 3.

---

# Part 1 — System optimization ideas

Sixty ideas, grouped. Each is tagged: **[P]** proven practice, **[N]** novel to ViewTube, **[Q]** quick win (< 1 week), **[D]** has a hard dependency.

## 1.1 Evidence and grounding

1. **Evidence Planner** — typed dataset requests per intent, not generic summaries. [P]
2. **Evidence sufficiency preflight** — decide *before* generating whether the question is answerable. [N] Turns the system's biggest weakness into its most trust-building behavior: "I can answer the CTR half of this; I'd need retention data for the rest."
3. **Freshness decay** — evidence carries an age; confident claims degrade automatically as data staleness grows. [N]
4. **Negative evidence as a first-class value** — distinguish "we looked and found nothing" from "we never looked." These are different facts and currently collapse to the same silence. [N]
5. **Evidence diffing** — "since I last looked at this video, traffic sources shifted." [N] Makes returning to the product feel alive.
6. **Claim-level citation** — every numeric sentence carries a hoverable evidence ref, not one citation list per answer. [P]
7. **Evidence gap → action** — every gap renders as a one-click fix (connect a source, run a sync, import a CSV). [N] Converts limitation into onboarding.

## 1.2 Statistics (the model interprets, never calculates)

8. **Deterministic `StatisticsEngine`.** [P][D: Phase 2]
9. **Per-channel expected-range models** — "this is inside your normal band" is far more useful than a raw number. [P]
10. **Change-point detection** — find *when* it shifted, which is what creators actually ask. [P]
11. **Automatic cohort construction** — comparable videos by format, length, topic, age. [P]
12. **Counterfactuals** — "had CTR held at your baseline, this would be ≈ 41K views." [N] The single most persuasive output shape for creators.
13. **Significance gating** — no claim ships on noise. [P] Directly prevents the most common AI-analytics failure: confident narration of randomness.
14. **Seasonality decomposition** — day-of-week and holiday effects separated before anything is called a trend. [P]

## 1.3 Context engineering

15. **Token-based budgeting** with a real tokenizer, replacing character clipping. [Q]
16. **Relevance-ranked retrieval** scored on relevance, authority, freshness, contradiction risk. [P]
17. **Context compaction** — summarize older turns rather than dropping them at `.slice(0,4)`. [P]
18. **Just-in-time retrieval** — model requests more mid-turn. [D: tool loop]
19. **Per-task context recipes** — "diagnose a drop" and "draft a script" need different context shapes; one budget for both is why both are mediocre. [N]
20. **Prompt caching on stable prefixes** — constitution + channel profile are identical across turns. Large, immediate cost reduction. [P][Q]
21. **Scratchpad / structured note-taking** for multi-step reasoning. [P]

## 1.4 Model access and cost

22. **Server-side gateway.** [D: Phase 1] Prerequisite for 23–27 and for all scheduling.
23. **Model routing by task difficulty** — cheap model for tag generation, strong model for strategy. Most spend today is on a mid-tier default for everything.
24. **Report model substitution** — stop silent downgrades. [Q]
25. **Batch mode** for bulk operations (tags for 50 videos), which is dramatically cheaper than 50 calls.
26. **Streaming** for scripts and long reports — perceived latency is most of felt quality.
27. **Per-creator budget with graceful degradation** — degrade to a cheaper model and *say so* rather than failing.

## 1.5 Generation quality

28. **`StyleProfile`** — editable descriptor + 4–5 exemplars + embedding. [D: Phase 3]
29. **Style fidelity scoring and gating.** [N]
30. **Structured outputs everywhere** — markdown blobs cannot be scored, diffed, routed or learned from. [Q per generator]
31. **Multi-draft self-selection** — generate 3, rank against the rubric, present the winner with alternates one click away. [P] Large quality gain for modest cost.
32. **Per-asset-type rubric judges.** [P]
33. **Anti-pattern injection** — include the channel's *underperforming* titles as negative exemplars. [N] Nobody does this; it is cheap and the signal is strong.
34. **Format-aware generation** — shorts, long-form and community posts obey different rules.
35. **Series memory** — episode 12 matches episodes 1–11 in structure and voice. [N]
36. **Production-quality tier** — creator declares their bar (fast/weekly/cinematic) and it changes b-roll density, script detail and shot suggestions. [N] Directly serves "loyal to production quality."
37. **Hook/thumbnail/title co-generation** — generate as a *package* so they reinforce rather than compete. [N]

## 1.6 Learning — the loop that has never run

38. **Write the outcomes.** Both ledgers have zero writers today.
39. **Analytics read-back** at 24h/7d/28d joining published assets to measured performance. [D: Phase 1]
40. **Confidence calibration** — stated vs measured success, adjusted over time.
41. **Contradiction detection and demotion.**
42. **Experiment lifecycle** — hypothesis → intervention → measurement → learning.
43. **Edit-distance learning** — **when a creator edits a generated script, diff it.** [N] That diff is the highest-quality style signal the system can ever obtain: a paired (model output, creator-corrected output) example on the creator's own content. Capturing it costs almost nothing and it is strictly better training signal than any thumbs-up.
44. **Rejection reasons** — when a creator discards a recommendation, capture *why* in one tap. Rejections teach more than acceptances.
45. **Cross-channel pattern mining**, opt-in and privacy-gated — "channels in your niche and size band found X." [D: server]
46. **Recommendation lineage** — stable ID from evidence to outcome.

## 1.7 Tools and actions

47. **~12 semantic tools** rather than 65 exposed functions. [P]
48. **Bounded tool loop** with per-turn call caps recorded in the trace.
49. **Creator-configurable approval tiers.** (See Part 2.7.)
50. **ActionPacket → destination prefill**, completing handoffs.
51. **Wire the handoff inbox** — already written, currently unreachable.

## 1.8 Observability

52. **Durable `BrainTrace`.**
53. **Trace viewer** (operator).
54. **Eval harness**, three grader channels.
55. **Regression gating** as a separate CI check.
56. **Cost and latency dashboards** by feature, model and channel.

## 1.9 Autonomy and scheduling *(from your decision)*

57. **Autonomy policy engine** — a per-action-type permission matrix owned by the creator, not a global setting.
58. **Scheduler** — daily brief, weekly content ideas, community post drafts, anomaly watch. [D: Phase 1 — a closed browser cannot run a schedule]
59. **Draft queue** — autonomous output *always* lands in review; nothing the Brain writes publishes itself unless the creator explicitly enables that per action type.
60. **Frequency caps and quiet hours**, plus a full autonomy audit log with undo.

---

# Part 2 — Front-end design

## 2.1 The organizing metaphor

The Brain gets **one destination** and **one ambient grammar**, and they share components. The destination is where you go to *understand and configure* the Brain. The ambient layer is where the Brain *shows up while you work*.

The grammar — three primitives used identically everywhere — is what stops these from diverging:

```
  ┌──────────────────────────────────────────────────┐
  │  CLAIM          "Browse impressions fell 34%"    │
  │  ├── confidence chip    medium · retention 9d old│
  │  └── evidence ribbon    ▇▇▇▇▇ ▇▇▇ ▇▇ ▇          │
  │                         traffic_day · video_day  │
  └──────────────────────────────────────────────────┘
```

Every AI-produced statement in the product — in a widget, a chat turn, a report, a generated asset — is a **Claim** carrying a **Confidence chip** and an **Evidence ribbon**. You already have `BrainConfidenceChip` and `BrainEvidenceDrawer`; this promotes them from chat-only to universal.

## 2.2 Destination — "The Brain" toolbox

Built on `ToolboxScaffold` per `viewtube-toolbox-builder`, claiming the existing `brain-command-center` super-tool ID. Nine sub-toolboxes:

### ① Conversation
The existing chat, upgraded: inline evidence ribbons, per-claim confidence, a "show your work" expansion revealing the trace in creator-readable form, and surface-awareness ("you were looking at the retention chart for *Video X*").

### ② Channel Mind — *the knowledge base, verbalized*
The typed Channel Profile rendered as an **editable knowledge map**. Sections: identity, niche, pillars, audience promises, formats, creative rules, preferences, goals, baselines, validated patterns, known anti-patterns, current strategic state.

Every fact shows its confidence, source, evidence, age and contradictions. Every fact is **confirmable, correctable or deletable by the creator.**

This is the literal answer to "verbalize their knowledge base and turn it into digestible actionable outputs." It also solves a trust problem no chat interface can: today, if the Brain believes something wrong about a channel, the creator has no way to see or fix it.

*Component idea — the Knowledge Map.* A hierarchical or force-directed map of what the Brain knows, node colour = confidence, red edges = contradictions, dimmed = expiring. Click a node to confirm or correct. Novel, and the single most compelling demo surface in the product.

### ③ Style Studio
The `StyleProfile` editor. Shows the extracted descriptor in plain language ("wry, technical, never hypey; cold opens; no 'in this video'"), fully editable. Shows the 4–5 exemplars with swap controls. Shows fidelity scores on recent generations.

*Component idea — the Style Fingerprint.* A radar over stylometric dimensions (pace, formality, sentence length, vocabulary richness, hook style, density). Overlay "your last 10 videos" against "this draft" as two shapes. Style match becomes instantly legible without reading a number.

*Component idea — Diff-as-teaching.* Creator edits a draft inline; the diff is captured as a style signal with an optional one-tap "why." Editing becomes teaching. (Idea 43.)

### ④ Asset Studio
Unified generation for every asset type — script, short, b-roll plan, image, thumbnail concept, community post, comment reply, topic ideas, title, description, tags, timestamps, education questions.

Three panels: **Evidence** (what this is grounded in), **Style** (which profile, fidelity score), **Output** (variants).

*Component idea — Variant Comparator.* Three drafts side by side with per-dimension rubric scores. The creator's pick is captured as a learning signal, so choosing is training.

### ⑤ Action Board
Ranked actionable tasks — the thing a YouTuber actually wants. Each card: what to do, expected impact, effort, the evidence behind it, confidence. Accept / reject / snooze, with rejection reasons captured (idea 44).

*Component idea — Opportunity Radar.* Impact × effort quadrant view of `OpportunityIntelligence` output, so priority is spatial rather than a list ranking the creator must trust blindly.

### ⑥ Learning Ledger
Currently a UI rendering a permanently empty list. Made real: what the Brain learned, from what, what it got right and wrong.

*Component idea — Impact Cards.* For each past recommendation: predicted vs actual, with the delta. Accountability visible by default.

*Component idea — Calibration Chart.* Stated confidence on one axis, measured success rate on the other, with the diagonal drawn. A product that shows creators where its own confidence is miscalibrated earns more trust than one that hides it.

### ⑦ Autonomy & Controls — *your settings module*
See 2.7. The control room for what the Brain may do alone.

### ⑧ Evidence Explorer
What data the Brain has, freshness per dataset, what's missing, what's blocked by permissions, and one-click connect for each gap.

### ⑨ Activity Feed
"While you were away" — every autonomous action, with undo. Non-negotiable companion to any scheduling feature.

## 2.3 Ambient layer

The Brain appears where the work happens. Five mechanisms:

**A. Universal "Why?" affordance.** Every chart, widget and data point gets an explain action. Requires the `WidgetContext` contract so the Brain knows exactly which widget, dataset, window, entity, filters and selected point are in view. This is the highest-value ambient feature and the one that makes the Analytics page AI-native rather than a dashboard with a chatbot bolted on.

**B. Claim grammar everywhere.** Confidence chip + evidence ribbon on every AI statement in every surface (2.1).

**C. The 10 rogue widgets, rerouted.** `ThumbAIWidget`, `TagGeneratorWidget`, `TitleRewriterWidget`, `CommunityPostWidget`, `CommentReplyWidget`, `ImageGeneratorWidget`, `DescriptionEditorWidget` and peers keep their exact appearance but route through `AssetGenerator`. They gain evidence, style fidelity, evaluation and outcome capture **with no visual redesign.** Highest ratio of architectural gain to UI work in the whole plan.

**D. Smart empty and degraded states.** A widget with no data explains why and offers the fix, instead of rendering an empty axis.

**E. Context-aware sidecar.** `GlobalBrainSidecar` learns what page it's on and offers the two or three things worth asking here.

## 2.4 Operator tooling

Trace viewer (search, filter, replay a turn) · eval dashboard (metric trends, regressions, per-case drill-down) · golden fixture manager · prompt version diff and rollback · cost monitor by feature/model/channel · model-substitution monitor.

## 2.5 Component inventory

| Component | Status | Used by |
|---|---|---|
| `BrainConfidenceChip` | **exists** — promote to universal | everything |
| `BrainEvidenceDrawer` | **exists** — generalize | everything |
| `BrainContextRail` | **exists** | Conversation, sidecar |
| `BrainWorkflowRunPanel` | **exists** | Action Board |
| `GlobalBrainSidecar` | **exists** — add surface awareness | ambient |
| `BrainUserControlPanel` | **exists** — grows into Autonomy Console | ⑦ |
| `ClaimBlock` | new | universal grammar |
| `EvidenceRibbon` | new | universal grammar |
| `KnowledgeMap` | new | ② |
| `StyleFingerprint` | new | ③ |
| `VariantComparator` | new | ④ |
| `OpportunityRadar` | new | ⑤ |
| `ImpactCard` / `CalibrationChart` | new | ⑥ |
| `AutonomyMatrix` / `ScheduleBuilder` | new | ⑦ |
| `EvidenceGapCard` | new | ⑧, ambient |
| `ActivityFeed` | new | ⑨ |
| `TraceTimeline` | new | operator (+ optional creator) |
| `WhyButton` | new | every widget |

Six existing components carry real weight. Roughly twelve new ones, most of them small.

## 2.6 Charts

Per `dataviz` and `viewtube-widget-dashboard`: the Knowledge Map, Style Fingerprint, Opportunity Radar, Calibration Chart and Trace Timeline are all new chart forms and must use the canonical palette, honour light/dark, preserve null/zero/partial distinctions, and degrade legibly at phone width. The Calibration Chart in particular must never imply precision it lacks — small samples get wide intervals or no chart.

## 2.7 The Autonomy Console

Your requirement: creators decide for themselves, including scheduled generation.

**The matrix.** Rows are action types; columns are autonomy levels. Every cell is the creator's choice, defaulting to the leftmost column.

```
                          Ask me   Draft for   Do it
                          first    review      alone
  Content ideas             ○         ●          ○
  Video topic research      ○         ●          ○
  Script drafts             ●         ○          ○
  Titles / tags / desc.     ○         ●          ○
  Thumbnail concepts        ○         ●          ○
  Community posts           ○         ●          ○
  Comment replies           ●         ○          ○
  Publish anything          ●         ─          ─      ← locked
```

**Schedules.** Per action type: frequency, day/time, quantity, and which channel or project. "Generate 5 content ideas every Monday 9am" and "draft 3 community posts weekly, hold for review" are first-class, creator-built rules.

**Budgets.** Spend cap per period with a visible meter, and explicit degrade-or-stop behaviour on exhaustion.

**Quiet hours and frequency caps** so autonomy can't become noise.

**Three rules I'd hold regardless of configuration:**
1. **Publishing is never autonomous.** Posting to a creator's channel in their voice without review is the one irreversible action, and the audit found output quality is not yet measured. Revisit once Phase 6 calibration data exists.
2. **Everything autonomous is undoable**, and lands in the Activity Feed.
3. **Scheduling requires the server-side gateway.** A schedule that only fires when a browser tab is open isn't a schedule. This is a genuine Phase 1 dependency, not a preference.

---

# Part 3 — Approach proposals

You chose destination and ambient in parallel. Three ways to do that; they differ in what gets built first, not in the end state.

### Approach A — Contract-first ("one runtime, two skins")
Build `BrainRuntime`, `WidgetContext`, `StyleProfile` and the Claim grammar first. Destination and ambient then become thin skins over shared contracts.

*For:* no divergence, cheapest total, both surfaces stay consistent forever.
*Against:* slowest to first visible pixel; several weeks of work with nothing to show.

### Approach B — Vertical slice ("one asset type, all the way through")
Pick one asset type — **community posts** is the best candidate: you already generate them, they're low-risk, high-frequency, and they exercise style, evidence, scheduling and outcome measurement — and build it completely: gateway → evidence → style → eval → outcome read-back → Asset Studio panel → ambient widget → autonomy row → schedule.

*For:* proves every contract against something real; earliest honest learning; a working demo in weeks; de-risks the other 64 generators.
*Against:* first slice's design may need generalizing later.

### Approach C — Surface-led ("make it visible, then make it true")
Build the destination toolbox and ambient chips over the current backend, upgrade the backend behind stable UI.

*For:* fastest perceived progress.
*Against:* **I'd reject this one.** The audit's central finding is that the system already looks more trustworthy than it is — a weak number guard, no grounding, ungoverned generators rendering with analytics-grade authority. Approach C adds confidence chips and evidence ribbons to output that has neither. It would ship a trust surface over an untrustworthy substrate, which is worse than the current state, because right now at least nothing is claiming to be grounded.

### Recommendation: **B, then A**

Run the community-post slice end to end to validate the contracts on something real, then generalize with Approach A's discipline. This gets you a genuine working demo of the whole loop — evidence → style → generation → scheduling → measurement → learning — in one narrow lane, before committing the full front-end surface area.

Concretely, the slice would deliver: server-side gateway for one path, `StyleProfile` for one asset type, `AssetGenerator` with evaluation, the community-post autonomy row and schedule, the draft queue and Activity Feed, outcome read-back at 7d, and the first real rows in the Learning Ledger.

---

# Part 4 — Open questions before implementation

1. **Style extraction source.** Published titles and descriptions are easy. Do you have script or transcript archives to extract from, or should the first `StyleProfile` be creator-authored with extraction added later?
2. **Community-post slice, or a different one?** Titles/tags is higher-frequency but harder to attribute; scripts are highest value but slowest to measure.
3. **Does the trace get a creator-facing view?** You chose "creators + operator tooling" — I'd add a simplified creator "show your work" panel as a trust feature, but it's extra scope.
4. **Cross-channel learning.** Opt-in pattern mining across channels is powerful and privacy-sensitive. In or out of scope?
5. **Knowledge Map ambition.** A structured editable list is a fraction of the cost of an interactive graph and delivers most of the value. Which?

---

# Approval gate

**No implementation has begun and none will until you approve.** Per the brainstorming process, the next step is a written spec for whichever approach you choose, followed by an implementation plan.

To proceed, I need: the approach (B-then-A recommended), an answer on the slice choice, and a decision on the Knowledge Map's ambition. The other open questions can be resolved during the spec.
