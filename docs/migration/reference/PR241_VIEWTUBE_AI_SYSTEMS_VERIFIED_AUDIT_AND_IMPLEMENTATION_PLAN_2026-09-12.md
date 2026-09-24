> **Historical donor reference — PR #241**  
> Preserved from donor head `031230f0726063bf52895c693da26c06ca6b4264` on 2026-09-24.  
> This document captures a 2026-09-12 point-in-time audit/design state. Its maturity percentages, reachability counts, branch status, provider assumptions and “current” claims are **not current authority**.  
> Use `docs/brain/PR241_DONOR_HARVEST_AUDIT_2026-09-24.md`, current Brain architecture docs, current code, and `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` for present status.  
> Valuable requirements and feature ideas are retained below as donor evidence.

# ViewTube AI Systems — Verified Audit, Gap Analysis and Implementation Plan

**Date:** 2026-09-12
**Repository:** `themotionvisual/ViewTubeBUILD`
**Branch audited:** `claude/ai-audit-content-optimization-gdwwp9` (parity with `main` at time of audit)
**Supersedes (as evidence):** `docs/VIEWTUBE_AI_BRAIN_SYSTEMS_AUDIT_AND_MODERNIZATION_REFERENCE_2026-09-11.md`

---

## How this document differs from the 2026-09-11 reference

The 2026-09-11 reference is a good **architectural intent** document. Its target-state design is sound and this plan keeps most of it.

However, its current-state ratings were derived from reading module names and type contracts rather than from tracing execution. This audit traced **actual call graphs and import reachability** from the app entry points, and several of its headline claims do not survive that check.

| Claim in 2026-09-11 doc | Verified reality |
|---|---|
| "Evidence grounding — 80%" | The conversational Brain never reads canonical analytics. Its entire evidence payload is a ~3,800-character text blob containing channel label, niche, pillars, video count and **five video titles**. |
| "Tool/action orchestration — 60%" | The Brain has **no tool-calling loop at all**. One model call, optionally one repair call. Capabilities are selected then discarded. |
| "Long-term learning loop — 55%" | Both outcome ledgers have **zero write callers**. The learning-ledger UI renders a permanently empty list. |
| "Algorithm Decision Engine — 60%" | Built and unit-tested, but the lifecycle/evaluation half (~975 LOC) is **not reachable from the running app**. |
| "Strong feature: unsupported-number detection" | Implemented as a substring test against `JSON.stringify(...)`, which admits most invented figures (see §2.4). |
| "Intelligence Hub integration — 65%" | The Intelligence Hub is a **second, separate reasoning stack** (4,065 LOC) that is the *only* surface actually grounded in canonical analytics. |

The correction matters because it changes the plan. The 09-11 doc concludes the main task is *consolidation of working systems*. The verified position is that ViewTube has **a well-designed skeleton with several load-bearing connections never made**, plus a large body of generation code that was never brought under the architecture at all. Consolidation is still right — but it must be preceded by wiring, and the plan must account for 60 ungoverned generators the previous audit did not mention.

---

# Part I — Method

Three passes:

1. **Static reachability.** A module graph was built over all 732 non-test `.ts`/`.tsx` files under `src/`, resolving relative imports, seeded from `src/main.tsx` and `src/App.tsx` and closed transitively. 588 modules are reachable; **146 are not**.
2. **Call-graph verification.** For every subsystem the prior audit rated, the audit searched for actual callers rather than definitions — distinguishing "exists", "imported", and "executed".
3. **Read-through of the hot path.** `BrainOrchestrator.runBrainTurn` → `BrainContextBroker.buildBrainContextPack` → `BrainCapabilityRegistry.selectBrainCapabilities` → `gemini.generateStructuredBrainResponse` was read line by line.

Every finding below cites the file and line that supports it.

---

# Part II — Verified current state

## 1. The system has two brains, and the smarter one is not the one creators talk to

This is the single most important structural fact in the codebase.

**Brain A — the conversational Brain.** `src/services/brain/BrainOrchestrator.ts` (532 LOC), reached from `SidebarChatbot.tsx:141` and `AIBrainCommandInterface.tsx:62`. Its evidence comes from `AIBrainContextSnapshot`, built in `src/services/aiBrainCommandInterface.ts:885`.

**Brain B — the Intelligence Hub.** `src/components/IntelligenceHub/` (4,065 LOC, of which `ultimateReport.ts` is 1,599). This is the surface that imports `services/analytics-canon` and runs evidence preflight (`EvidencePreflightPanel.tsx`), provenance checks and generation policy.

These two share **no** reasoning infrastructure: not the context broker, not the evaluator, not the prompt set, not the evidence contract. The repository's own canonical rule — stated in `src/services/analytics-canon/README.md` — is:

> VT-SYNC is the source of truth for analytics data. AI/Brain consumers should read through `services/analytics-canon`, not through legacy stores or feature-local caches.

The conversational Brain violates this rule. `aiBrainCommandInterface.ts:35` imports `VT_SYNC_TABLE_DEFINITIONS` **directly** from `../features/vt-sync-local/upstream/tableRegistry`, bypassing the canonical read layer entirely.

The bridge that was built to fix exactly this — `src/services/brain/BrainAnalyticsEvidence.ts`, whose own docblock says it converts the canonical evidence pack into the shared Phase-One contract "No second analytics store is introduced here" — **is not reachable from the app.** It was written, tested and never connected.

**Consequence for the user's goal.** A creator asking "why did this video lose Browse traffic?" is answered by a model that has been given five video titles and a view count. It has no traffic-source breakdown, no retention curve, no impressions or CTR, no time series, no cohort. The system *has* all of that data; the chat path is simply not wired to it.

## 2. The Brain turn: what actually executes

### 2.1 Capabilities are selected and then discarded

`BrainCapabilityRegistry.ts:6-19` defines 12 capabilities — Channel Profile, Signal/Anomaly Intelligence, Analytics Diagnosis, Top Performer Mining, Audience Promise, SEO Opportunity, Goal Coach, Daily Oracle, Journal/Memory, Niche Knowledge, Current Grounding, Content Generation.

`selectBrainCapabilities` picks up to six by intent and creator permission. Then, in `BrainOrchestrator.ts:301-302`, the result becomes `capabilityIds` — and `capabilityIds` is used **only** as metadata on the learning event (`:439`) and the conversation turn (`:457`).

`buildBrainContextPack` is never passed the capabilities (`:306-311`, `:340-347`). They do not reach the prompt. They do not dispatch handlers.

Exactly **two** of the twelve change behavior:
- `niche-knowledge` triggers `resolveNicheKnowledge` (`:313`)
- `current-grounding` gates Google grounding via `shouldUseCurrentGrounding` (`:329`)

The other ten — including `analytics-diagnosis`, `signal-anomaly-intelligence` and `top-performer-mining`, the three that would matter most for the user's stated goals — are **inert labels**. The capability registry is a taxonomy, not a runtime.

### 2.2 There is no tool-calling loop

`runBrainTurn` is a single `generateStructuredBrainResponse` call (`:355`), with at most one repair call (`:377`). There is no agentic loop, no tool dispatch, no iterative evidence retrieval, no ability for the model to ask for data it discovers it needs. `BRAIN_MODEL_TIMEOUT_MS = 30_000`, `BRAIN_REPAIR_TIMEOUT_MS = 20_000`.

This is a 2023-shaped architecture. Everything in the target design that depends on the Brain *fetching* evidence mid-turn is currently impossible.

### 2.3 Context assembly is fixed clipping, in characters

`BrainContextBroker.ts` (102 LOC) concatenates seven fixed sections under hard character caps: system 11,000; evidence 3,800; memory 3,200; conversation 3,200; niche 2,200; research 1,800; total 24,000 (`:23-63`).

Three problems:
- **Characters, not tokens.** No tokenizer, so the real budget is unknown and varies with content.
- **No relevance ranking.** `.slice(0, 4)` on turns, `.slice(0, 5)` on videos (`:29`, `:55`). Position, not relevance, decides what the model sees.
- **24,000 characters is roughly 6,000 tokens.** Against models with million-token windows, the Brain is operating in a keyhole — and 11,000 of those characters are a static system prompt.

### 2.4 The hallucination guard is weaker than advertised

The prior audit called unsupported-number detection a "strong feature" and "the correct pattern." The implementation (`BrainOrchestrator.ts:80-95`):

```ts
const known = JSON.stringify({ channel, profile, evidence }).replace(/,/g, "")
const matches = responseText(response).match(/\b\d[\d,]*(?:\.\d+)?%?(?![\w])/g) || []
return matches.filter(v => !known.includes(v.replace(/,/g, "")))
```

`known.includes(normalized)` is an unanchored substring test over a concatenated JSON string. Any short figure that happens to appear anywhere inside any longer number, ID, timestamp, URL or title passes. A channel with a video ID containing `4` and a view count of `1284730` silently whitelists `4`, `84`, `847`, `28`, `473` and many others. The guard catches conspicuous long invented figures and lets small ones — percentages, CTR, retention points, exactly the figures creators act on — straight through.

Additionally `:92` hardcodes `["1","2","3","4","5","7","30","60","90"]` as always-allowed.

### 2.5 Answer evaluation is keyword heuristics

`validateBrainResponse` (`:97-169`) scores five dimensions:

- `creatorSpecificity` — count of evidence words appearing in the answer × 15
- `evidenceCoverage` — same hit count × 12
- `goalAlignment` — 95 if any goal word appears, else 50
- `actionability` — 90 if the text matches `/\b(create|publish|rewrite|test|...)\b/`, else 35
- `novelty` — 100 minus Jaccard overlap with the last four turns

Pass threshold: mean ≥ 58 and no repair reasons (`:164`).

These are lexical proxies. An answer that repeats channel nouns and contains the word "test" scores well regardless of whether its reasoning is sound or its numbers are right. `confidence` on the delivered response is not computed from evidence quality at all — `:256` sets it from profile status alone (`status === "ready" ? "high" : "medium"`).

### 2.6 There is no trace

A repository-wide search for `BrainTrace`, `turnTrace` or `traceId` returns **nothing**. Turn metadata is scattered across the learning event and the conversation turn. There is no single inspectable object recording what evidence was requested, what was returned, what was rejected, which prompt version ran, what it cost, or how long it took. The prior audit listed this as a gap; it is worth restating that the gap is total, not partial.

## 3. The generation layer is outside the architecture entirely

The 2026-09-11 audit does not mention `src/services/gemini.ts`. It is **4,885 lines** and exports **60 independent generator functions**:

```
generateScript            generateStoryboard         generateHook
generateSeoData           generateTagSuggestions     rewriteTitle
generateThumbnail         generateThumbnailConcept   rateThumbnail
generateImage             generateVisualImage        generateVideo
generateVisualVideo       generateSpeech             transcribeAudio
generateCommunityPosts    refineCommunityPost        generateCommunityPostSchedule
generateCommentResponses  generatePerfectReply       generateEnhancedReply
refineUserReply           recommendVideoForComment   generateEndScreen
generateEndScreenConcept  generateEndScreenImage     generateIdeaSpark
generateEducationalTimestampQuestions                generateKeywordAnalysis
generateKeywordResearch   generateFunnelTeaser       generateInterestSeeding
generateDailyBrief        generateOracleAdvice       generateOracleReport
generateAlgorithmDiagnosis                           generateArchitectDiagnosis
generateVideoAutopsy      analyzeChannelData         analyzeChannelGoals
analyzeVideo              analyzeImage               analyzeMediaContent
generateProjectStrategy   generateProjectSuggestions generateChannelTaskSuggestions
generateTimelinePatch     performDeepResearch        askChannelQuestion
generateJournalFollowUps  generateInfiniteMicroPolls ...
```

**This is the entire feature set the user asked about** — scripts, shorts, images, b-roll, community posts, comment responses, topic ideas, SEO titles/tags/descriptions, educational timestamped questions. It all exists. None of it is governed.

Every one of these follows the same shape. `generateCommunityPosts` (`gemini.ts:4020`) in full:

```ts
export const generateCommunityPosts = async (schedule, channelData, brain?: any): Promise<string> => {
  const ai = getAiClient()
  const journalContext = getJournalKnowledge(brain)
  const prompt = `IDENTITY: Elite YouTube Community Manager.
    TASK: Generate 7 days of highly engaging community posts...
    CHANNEL CONTEXT: ${channelData}
    SCHEDULE/PLANS: ${schedule}
    CREATOR VISION: ${journalContext}
    OUTPUT: ...Markdown...`
  const response = await ai.models.generateContent({ model: getActiveModel("text"), contents: prompt })
  return response.text || ""
}
```

What this means, and it applies to all 60:

- **No context broker.** An unbounded string is interpolated into a template.
- **No evidence.** `channelData` is whatever the calling component happened to have.
- **No evaluation.** The output is returned unvalidated — no grounding check, no quality gate, no repair.
- **No learning capture.** No turn, no learning event, no outcome record. The system cannot know this generation ever happened.
- **No style model.** The only personalization is `getJournalKnowledge(brain)` (`gemini.ts:4236`), a text blob.
- **Returns markdown strings.** Unstructured, so nothing downstream can parse, score or track an asset.
- **`brain?: any`.** The type system is switched off at precisely the boundary where grounding would be enforced.

The Brain's own `content-generation` capability (`BrainCapabilityRegistry.ts:18`) describes drafting "scripts, hooks, pinned comments, descriptions, tags, titles, community posts, and replies" — the same list — but as established in §2.1 that capability is inert. So ViewTube has two disconnected answers to "generate an asset", and the one creators actually use is the ungoverned one.

**There is no style or voice model anywhere in the codebase.** Searches for `voiceProfile`, `styleProfile`, `StyleModel`, `toneProfile`, `writingStyle`, `creatorVoice` return zero matches in `src/`. The user's requirement that output be "customizable, unique and loyal to the user's intended and previous content styles and production quality" currently has **no implementation surface at all**. This is a greenfield gap, not a partial one.

### 3.1 Prompts are 49 independent monoliths

`src/services/prompts.ts` is 1,040 lines holding 49 standalone system prompts — `SCULPTING_ENGINE_SYSTEM_PROMPT`, `DATA_ANALYSIS_SYSTEM_PROMPT`, `KEYWORD_ANALYSIS_SYSTEM_PROMPT`, `HOOK_GENERATION_SYSTEM_PROMPT`, `STRATEGY_CHAT_SYSTEM_PROMPT`, `ALGORITHM_DIAGNOSIS_SYSTEM_PROMPT`, and so on. There is no shared constitution, no composition, and exactly one version constant in the file (`CHANNEL_ORACLE_PROMPT_VERSION`, `:153`). Rules are restated per prompt and drift independently.

### 3.2 Model access is client-side

`getAiClient()` (`gemini.ts:465`) constructs `new GoogleGenAI({ apiKey })` **in the browser**, with the key resolved from a user-pasted Key Vault value or `import.meta.env.VITE_GOOGLE_API_KEY` (`:440-450`). `api/` contains `auth`, `account`, `youtube` and `render` routes — there is no AI proxy.

Consequences: if an env key is used it ships in the client bundle and is extractable; there is no server-side rate limiting, cost attribution, audit log, caching or abuse control; no prompt or output can be logged centrally; and per-creator cost governance is impossible. `src/services/aiTokenCosts.ts` exists but cannot see what it does not proxy.

The canonical-model shim (`:334-405`) also silently rewrites requested models through `toCanonicalModel`, with fallback chains reaching back to `gemini-1.5-*`. A caller asking for `gemini-3.1-flash` can be served `gemini-3.1-flash-lite` (`:356`) with no signal to the caller or the creator.

## 4. The learning loop is not closed — it is not connected

The target loop is `recommendation → action → outcome → evaluation → learning → profile`. Verified state of each writer:

| Store | File | Write callers |
|---|---|---|
| `BrainOutcomeLedger.recordBrainOutcome` | `brain/BrainOutcomeLedger.ts:47` | **0** |
| `viewTubeEvaluationLedger.createEvaluationRecord` | `viewTubeEvaluationLedger.ts:12` | **0** |
| `viewTubeEvaluationLedger.resolveEvaluationRecord` | `:18` | **0** |
| `viewTubeEvaluationLedger.proposeWorkflowCandidate` | `:24` | **0** |
| `viewTubeWorkflowLearning.recordWorkflowPreferenceSignal` | `viewTubeWorkflowLearning.ts:22` | 1 — `SendToMenu.tsx:39` |

`src/components/ViewTubeLearningLedger.tsx:2` imports `listEvaluationRecords` and `listWorkflowCandidates` to render them. Nothing writes to either store. **The Learning Ledger UI displays a permanently empty list.**

The one live signal is also one-sided: `SendToMenu.tsx:39` records `accepted: true` and nothing ever records `accepted: false`, so the `-0.5` rejection branch in `rankWorkflowTargets` (`viewTubeWorkflowLearning.ts:36`) is dead. Preference scores can only increase.

This cascades. `ChannelIntelligence.ts:3` derives its patterns from `listBrainOutcomes` and `summarizeBrainOutcomes`. Since nothing writes outcomes, `summarizeBrainOutcomes` always returns `total: 0, acceptanceRate: 0`, and Channel Intelligence produces no workflow strengths, weaknesses, preferences or avoidances. The engine is correct; it is being fed an empty table.

**Directly against the user's requirement.** "Determine the effectiveness of their previous advice, generations, recommended actions, assets, content etc… and make adjustments based on that evidence" requires a populated outcome store joined to analytics. Today no generation is recorded as a recommendation, no recommendation is linked to a published video, and no published video's performance is read back. The loop has never run once.

### 4.1 All AI state is browser-local

37 distinct `localStorage` keys carry AI state, including `vt_brain_outcome_ledger_v1`, `viewtube:evaluation-ledger:v1`, `viewtube:workflow-candidates:v1`, `viewtube:workflow-preferences:v1`, `vt_brain_command_actions_v1` and the Brain conversation store. Records are capped in-place — outcomes at 500 (`BrainOutcomeLedger.ts:37`), evaluations at 5,000, preferences at 2,000.

So even once writers exist, learning would be per-browser: lost on cache clear, absent on a second device, invisible to any server process, and impossible to aggregate for calibration or cross-channel pattern mining. Durable learning requires server persistence, which requires the AI gateway from §3.2.

## 5. Dead and unreachable code

146 of 732 modules are unreachable from `main.tsx`/`App.tsx`. Within `src/services/brain/`, 21 of 52 are unreachable; excluding the 7 legitimate test fixtures, **14 real modules (~1,550 LOC)**:

| Module | LOC | What was lost |
|---|---|---|
| `CanonicalAlgorithmEvaluation.ts` | 197 | Canonical evaluation of algorithm recommendations |
| `BrainAnswerQuality.ts` | 197 | A second, richer answer-quality scorer |
| `AlgorithmMonitoringSchedule.ts` | 167 | Scheduled re-measurement of predictions |
| `AlgorithmLifecycleObservationStore.ts` | 157 | Longitudinal observation persistence |
| `AlgorithmIntelligenceEventLedger.ts` | 134 | Algorithm event lineage |
| `AlgorithmLifecycleCohorts.ts` | 123 | Cohort construction |
| `AlgorithmEvaluationEngine.ts` | 122 | Did the recommendation work? |
| `ChannelIntelligenceWorkflowPlanner.ts` | 106 | Workflow planning from channel intelligence |
| `BrainHandoffInbox.ts` | 104 | Tool handoff inbox |
| `BrainWorkflowRecipes.ts` | 93 | Recipe library |
| `AlgorithmLifecycleBaseline.ts` | 75 | Baseline computation |
| `brainWorkflowRecommendations.ts` | 71 | Recommendation surfacing |
| `BrainAnalyticsEvidence.ts` | 68 | **The canonical-analytics → Brain bridge** |

The pattern is unmistakable: **the measurement and feedback half of the architecture was built and never plugged in.** Baseline, cohorts, observation store, evaluation engine, monitoring schedule, event ledger — that is a complete prediction-and-verification subsystem sitting inert.

The reachable half (`AlgorithmStrategyEngine`, `AlgorithmPrimingEngine`, `OpportunityIntelligence`, `AnomalySignalBridge`, `ChannelIntelligence`) reaches the app through exactly one path: `AlgorithmIntelligenceAccess.ts` → `views/dashboard/widgets/BrainHubWidget.tsx:55`. One dashboard widget. It is not in the chat path, not in the Intelligence Hub, not in any tool.

## 6. Corrected maturity assessment

Scored on *operational* maturity — does it execute in production for a real creator — not on whether types and modules exist.

| Area | 09-11 estimate | Verified | Why the difference |
|---|---:|---:|---|
| Brain chat/orchestration | 75% | **45%** | Real orchestration, but single-shot, no tools, inert capabilities |
| Context engineering | 70% | **35%** | Fixed character clipping; no tokens, no relevance, 24k cap |
| Evidence grounding | 80% | **20%** | Chat Brain never reads analytics-canon; 5 video titles |
| VT-SYNC → AI data ownership | 85% | **60%** | VT-SYNC is strong; Brain bypasses canon via direct registry import |
| Channel Profile | 70% | **45%** | Assembles from artifacts; untyped facts, no provenance per fact |
| Channel Intelligence | 55% | **25%** | Correct engine, empty inputs |
| Algorithm Decision Engine | 60% | **35%** | Built + tested; reachable only via one widget |
| Algorithm Priming | 55% | **30%** | Same |
| Anomaly integration | 50-60% | **30%** | Service exists and uses canon; not in chat path |
| Opportunity Intelligence | 45% | **25%** | Same |
| Brain self-evaluation | 65% | **35%** | Lexical heuristics; weak number guard; richer scorer unreachable |
| Long-term learning loop | 55% | **10%** | Zero write callers on both ledgers |
| Tool/action orchestration | 60% | **25%** | No tool-calling loop; handoff inbox unreachable |
| Intelligence Hub integration | 65% | **50%** | Works well — as a separate stack |
| Brain ↔ analytics widgets | 45% | **15%** | No widget context contract |
| **Asset generation** *(not rated in 09-11)* | — | **30%** | Broad coverage, zero governance, no style model |
| **Style/voice fidelity** *(not rated)* | — | **0%** | No implementation exists |
| **AI gateway / server-side** *(not rated)* | — | **0%** | Client-side keys, no proxy |
| Full autonomous closed loop | 35-45% | **5%** | Loop has never executed |
| AI observability/evals | 40% | **10%** | No trace object; no eval harness |
| **Overall planned AI OS** | ~60-65% | **~30%** | |

**~30% operational, against a design that is ~70% *drawn*.** The design work is genuinely good and largely worth keeping. The build is much earlier than the previous audit reported.

---

# Part III — Research: what current practice says

Findings from current public guidance, mapped onto ViewTube's specific gaps.

### Context engineering
The governing idea is to find "the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome" — deliberately designing what the model sees on every call rather than maximizing what it is given ([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [Sourcegraph](https://sourcegraph.com/blog/context-engineering)). ViewTube's 24,000-character fixed clip is the wrong axis: it is simultaneously too small for real analytics and too undifferentiated to be high-signal. The fix is retrieval and ranking, not a bigger cap.

### Tools
2026 practice is to curate a small set of high-signal, semantically meaningful tools per agent and expose the long tail through search rather than registering everything ([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [MLflow](https://mlflow.org/articles/ai-agent-tool-use-best-practices-for-practitioners/)). This directly validates the 09-11 doc's recommendation of semantic capabilities (`analyze_video_performance`, `build_launch_plan`) over exposing 60 generator functions. It also implies the generators should become the *implementation* behind a dozen or so tools, not the tool surface itself.

### Evals
Evaluating an agent is not evaluating a chat response: agents act over turns, use tools and mutate state, and fail in ways invisible if you only grade the final message. Practice is to combine deterministic code graders (assert on resulting state), model-based judges (natural-language quality), and human calibration — never a single channel ([Anthropic via Arize](https://arize.com/blog/anthropic-tips-how-to-build-evals-you-can-trust/), [ai-eval.org](https://ai-eval.org/post/anthropic-demystifying-evals-for-ai-agents), [LangChain](https://www.langchain.com/blog/agent-evaluation-readiness-checklist)). ViewTube's `validateBrainResponse` is a single lexical channel — the weakest of the three.

### Style fidelity
This is the most actionable research for the user's differentiating requirement. Few-shot exemplars outperform other style-matching strategies by a wide margin — up to 23.5× — but **fidelity plateaus after 4–5 demonstrations**, with additional exemplars adding almost nothing ([alphaXiv](https://www.alphaxiv.org/abs/2509.14543), [arXiv 2509.24930](https://arxiv.org/abs/2509.24930)). Effective pipelines are *neutral paraphrase → style-descriptor extraction → context-driven rewrite* rather than one-shot "write in my voice" ([TinyStyler](https://arxiv.org/pdf/2406.15586), [StyleAdaptedLM](https://arxiv.org/html/2507.18294v1)). LLMs remain measurably weaker at implicit, casual voice than at formal register — which is most of YouTube — so style must be **measured**, via embedding cosine similarity against creator exemplars plus stylometric distance, not assumed.

Design consequences for ViewTube:
- Store **4–5 well-chosen exemplars per format**, not a large corpus. This is cheap and bounded.
- Extract an explicit, **editable** style descriptor — the creator must be able to correct it, which also satisfies the "customizable" requirement.
- Score style fidelity numerically and gate on it, the same way grounding is gated.

### Rubric grading
Rubrics convert a judge from holistic scoring into a series of binary decisions per criterion, which is markedly more reliable ([arXiv 2502.13337](https://arxiv.org/pdf/2502.13337)). ViewTube's five 0-100 heuristics should become explicit binary rubric items.

### Memory
Agent memory as durable, audited, cross-session storage with per-write audit logs is now standard practice. ViewTube's localStorage ledgers are the anti-pattern this replaces.

---

# Part IV — Target architecture

The 09-11 doc's six-layer target is retained. What follows adds the three layers it omitted (Gateway, Generation, Style) and specifies the contracts.

```
                     ┌─────────────────────────────────┐
                     │   SURFACES                      │
                     │   Chat · Hub · Tools · Widgets  │
                     └───────────────┬─────────────────┘
                                     │  one entry point
                     ┌───────────────▼─────────────────┐
                     │   BrainRuntime.run(request)     │
                     │   ─ intent → plan → act → grade │
                     └───────────────┬─────────────────┘
          ┌──────────────┬───────────┼───────────┬──────────────┐
          ▼              ▼           ▼           ▼              ▼
    EvidencePlanner  ContextBroker  ToolRuntime  Evaluator   TraceRecorder
          │              │           │           │              │
          ▼              ▼           ▼           ▼              ▼
    analytics-canon   ranked      semantic    rubric +      BrainTrace
    + StatsEngine     retrieval   tools       grounding     (durable)
          │                           │           │              │
          └───────────────┬───────────┴───────────┴──────────────┘
                          ▼
                   AI GATEWAY  (server-side: /api/ai/*)
                   keys · cost · cache · audit · model routing
                          ▼
                   Model providers
                          │
                          ▼
                 OUTCOME LEDGER (server, durable)
                          ▼
                 EVALUATION ENGINE  ←── YouTube analytics read-back
                          ▼
                 LEARNING LEDGER → Channel Profile promotion
                          ▼
                    next turn is better
```

Two contracts do most of the work.

**`BrainRequest` / `BrainTrace`** — every AI operation in the product, chat or generation, enters as a `BrainRequest` and emits a `BrainTrace`. This is what makes the system measurable.

```ts
interface BrainRequest {
  kind: "question" | "asset" | "report" | "analysis"
  assetType?: AssetType           // script | short | community_post | comment_reply |
                                  // title | description | tags | timestamps | thumbnail_concept |
                                  // broll_plan | video_topic | education_questions
  channelId: string
  projectId?: string
  userText: string
  surfaceContext?: WidgetContext  // what the creator is looking at
  styleTarget?: StyleProfileRef
  evidenceHints?: DatasetId[]
}

interface BrainTrace {
  id, requestId, channelId, createdAt
  intent, taskProfileId, capabilitiesInvoked: CapabilityResult[]
  evidenceRequested: EvidenceRequest[]
  evidenceReturned: EvidenceRef[]
  evidenceMissing: string[]
  statsComputed: StatResult[]
  contextBudget: { tokensUsed, tokensAvailable, sectionsIncluded, sectionsDropped }
  promptVersions: Record<string, string>
  modelRequested, modelServed          // surfaces the silent downgrade
  toolCalls: ToolCall[]
  claims: Claim[]                      // each with evidenceRefs
  grades: { grounding, styleFidelity, rubric, novelty }
  repairAttempts: number
  cost: { inputTokens, outputTokens, cents }
  latencyMs
  outputRef                            // → asset or answer
}
```

**`StyleProfile`** — the missing spine for everything the user asked for on voice and quality.

```ts
interface StyleProfile {
  id, channelId, scope: "channel" | "format" | "series"
  assetType?: AssetType
  descriptor: {                         // extracted, creator-editable
    voice: string                       // "wry, technical, never hypey"
    pacing: string
    vocabulary: { prefer: string[]; avoid: string[] }
    structure: string
    openingPattern: string
    closingPattern: string
    productionQuality: string
  }
  exemplars: StyleExemplar[]            // 4-5 — research-backed plateau
  embedding?: number[]                  // for cosine fidelity scoring
  source: "creator_authored" | "extracted_from_published" | "hybrid"
  confidence, createdAt, validatedAt
  contradictions: string[]
}
```

Two rules keep this honest. Exemplars are capped at five per scope — more is measurably wasted budget. And `descriptor` is always creator-editable, so extraction is a starting proposal, never an imposed identity.

---

# Part V — Implementation plan

Eight phases, ordered by dependency. Phases 0–2 are prerequisites for everything else; a team could stop after Phase 3 and have delivered most of the user-visible value.

Each phase states scope, key changes, acceptance criteria and risk. Effort is in engineer-weeks for one experienced full-stack engineer.

---

## Phase 0 — Stop the bleeding (1 week)

Small, safe, unblocks measurement.

**0.1 Fix the number guard.** Replace the substring test in `BrainOrchestrator.ts:80-95` with tokenized numeric comparison: extract numbers from evidence into a `Set<number>`, compare with tolerance for rounding and formatting (`1.2M` ≈ `1200000`), and treat percentages as a distinct class. Remove the hardcoded allowlist at `:92` in favor of a "small ordinals in prose" rule that does not whitelist analytics-shaped figures.

**0.2 Record model substitution.** `toCanonicalModel` (`gemini.ts:350`) must return `{ requested, served }` and callers must surface a downgrade. Silent substitution makes every quality measurement uninterpretable.

**0.3 Delete or resurrect, per module.** For each of the 14 unreachable brain modules (§5), decide explicitly. Recommendation: keep and wire `BrainAnalyticsEvidence`, `BrainAnswerQuality`, `BrainHandoffInbox`, and the six Algorithm lifecycle/evaluation modules (they are Phase 5's foundation); delete `BrainWorkflowRecipes` and `brainWorkflowRecommendations` if Phase 4 supersedes them. Record the decision in the module header so this does not recur.

**0.4 Record rejection.** `SendToMenu.tsx` must call `recordWorkflowPreferenceSignal({ accepted: false })` on dismissal. One line; makes the existing ranking function actually work.

*Acceptance:* a test proves an invented `47%` is caught; `BrainTrace`-precursor metadata includes `modelServed`; no unreachable brain module lacks a documented decision.

*Risk:* low. **Do not skip 0.1** — every later quality metric inherits this guard's error rate.

---

## Phase 1 — AI Gateway (3 weeks)

Everything durable depends on getting model access server-side.

**1.1 Add `api/ai/[...path].mjs`** following the existing `api/youtube/` proxy pattern. Responsibilities: hold provider keys server-side; authenticate the ViewTube session; enforce per-plan rate limits and budget caps (wire to `billingEntitlement.ts` and `subscriptionPlans.ts`); cache identical requests; write an audit record per call; return `{ output, usage, modelRequested, modelServed, cacheHit, traceId }`.

**1.2 Replace `getAiClient()`.** `gemini.ts:465` becomes a thin client that posts to the gateway. Keep the function signature so the 60 generators keep compiling — this is the change that lets Phase 3 proceed without a rewrite. Retain the browser-key path only as an explicit "bring your own key" developer mode, clearly labelled and off by default.

**1.3 Persist traces server-side.** New Neon tables: `ai_trace`, `ai_claim`, `ai_evidence_ref`, `ai_cost`. Use the existing Vercel-Neon integration; note the 10-database-branch cap documented in `CLAUDE.md` when creating preview branches.

*Acceptance:* no API key in the client bundle (assert in a build test); every model call produces a server trace row; cost per channel per day is queryable; rate limits demonstrably enforced.

*Risk:* medium — touches every AI feature. Mitigate by keeping the client signature identical and shipping behind a flag with the direct path as fallback for one release.

---

## Phase 2 — Evidence, statistics and context (4 weeks)

Fixes the §1 and §2.3 findings: give the Brain real data and a real budget.

**2.1 `EvidencePlanner`** (`src/services/brain/EvidencePlanner.ts`, new). Maps intent + asset type to typed dataset requests. Example — "why did views accelerate?" requests `traffic_day`, `video_day`, `retention`, `search_terms`, `external_sources`, `subscriber_status`, publication timestamp, channel baseline, comparable-video cohort. Returns `EvidenceRequest[]`, each resolved through `analytics-canon` **only**, preserving availability, freshness, provenance, and null/zero/partial distinction per the observatory skill's rules.

**2.2 Wire the existing bridge.** Make `BrainAnalyticsEvidence.ts` reachable and route `aiBrainCommandInterface`'s evidence assembly through `analytics-canon` instead of the direct `tableRegistry` import at `:35`. This alone closes the largest single gap in the audit.

**2.3 `StatisticsEngine`** (`src/services/brain/StatisticsEngine.ts`, new). Deterministic, pure, unit-testable: robust z-score/MAD, percentiles, moving baselines, change-point detection, cohort comparison, rolling growth, share shift, traffic decomposition, retention-curve comparison, launch velocity, conversion funnels, confidence intervals, seasonality, expected-range models. **The model never calculates; it interprets `StatResult[]`.** This is the highest-leverage quality change in the plan: it converts "the model guessed a trend" into "the model explained a computed one."

**2.4 Rewrite `BrainContextBroker`.** Token-based budgeting with a real tokenizer. Relevance-ranked assembly scoring each candidate on relevance to the question, authority of the source, freshness, and contradiction risk; fill the budget highest-value-first. Raise the ceiling well above 24k once ranking exists. Emit `sectionsIncluded`/`sectionsDropped` into the trace.

**2.5 Make capabilities execute.** Give `BrainCapabilityDefinition` a `handler` that returns `CapabilityResult { contribution, evidenceRefs, statRequests }`. `runBrainTurn` invokes selected handlers and merges results into the context pack. This turns §2.1's ten inert labels into real behavior — in particular `analytics-diagnosis`, `top-performer-mining` and `signal-anomaly-intelligence`, which become the routes by which Channel/Anomaly/Opportunity Intelligence finally reach a normal chat turn.

*Acceptance:* a golden question ("why did video X lose Browse traffic?") retrieves ≥ 6 typed datasets, computes ≥ 3 stats, and cites evidence refs for every numeric claim; zero direct `tableRegistry` imports outside `analytics-canon`; context budget reported in tokens.

*Risk:* medium-high — the deepest change. Land 2.1–2.3 behind a flag and A/B against the current path using the Phase 6 harness before switching.

---

## Phase 3 — Governed generation and style fidelity (5 weeks)

This is the phase that delivers most of what the user asked for.

**3.1 `StyleProfile` service** (`src/services/brain/StyleProfile.ts`, new). Implements the §IV contract. Extraction pipeline, following the research: pull the creator's published titles/descriptions/scripts/community posts → neutral paraphrase → extract style descriptors → present to the creator for editing → store descriptor + **4–5 exemplars per format** + embedding. Exemplars are selected for coverage, not recency, and the cap is enforced.

**3.2 `AssetGenerator`** (`src/services/brain/AssetGenerator.ts`, new). One governed path for every asset type:

```
BrainRequest(kind:"asset", assetType)
  → EvidencePlanner        (what proved effective for THIS channel)
  → StyleProfile           (descriptor + exemplars for this assetType)
  → ContextBroker          (ranked, budgeted)
  → Gateway                (structured output, not markdown)
  → Evaluator              (grounding + rubric + style fidelity)
  → repair if below gate
  → persist Asset + BrainTrace + Recommendation record
```

**3.3 Migrate the 60 generators.** Do **not** rewrite them all at once. Convert each to an `AssetGenerator` strategy that supplies its schema and task instruction while inheriting evidence, style, evaluation and tracing. Order by creator value:

1. `generateScript`, `generateHook`, `generateStoryboard`
2. `generateSeoData`, `generateTagSuggestions`, `rewriteTitle`, `generateEducationalTimestampQuestions`
3. `generateCommunityPosts`, `generateCommentResponses`, `generatePerfectReply`
4. `generateIdeaSpark`, `generateProjectSuggestions` (video topics)
5. `generateThumbnailConcept`, `generateEndScreenConcept`, b-roll planning
6. Image/video/audio generators — these need the gateway most (cost) and style least

**3.4 Structured outputs everywhere.** Replace markdown-string returns with typed schemas. An asset that cannot be parsed cannot be scored, tracked, sent to a tool, or learned from. This is the precondition for Phase 5.

**3.5 Style fidelity scoring.** Cosine similarity between generated-asset embedding and the style embedding, plus a rubric judge on the descriptor's explicit rules. Gate generation on a floor; on failure, repair with the specific violated rules — the same evidence-repair pattern already proven in `runBrainTurn:377`.

**3.6 Unify prompts.** Split `prompts.ts` into `BRAIN_CONSTITUTION` (small, shared, versioned) + per-asset task instructions + evidence policy + style policy, composed at runtime. Version each independently so Phase 5 can attribute outcomes to configurations.

*Acceptance:* every asset type flows through `AssetGenerator`; every generated asset has a trace, evidence refs, a style score and a persisted record; blind creator review prefers styled output over current output at a stated rate; zero `brain?: any` parameters remain in migrated generators.

*Risk:* medium. Scope control matters — migrate in the stated order and ship incrementally rather than holding all 65 for one release.

---

## Phase 4 — Semantic tools and the action loop (3 weeks)

**4.1 Define ~12 semantic tools**, per the research on curated high-signal tool sets: `analyze_video_performance`, `compare_video_cohort`, `inspect_traffic_shift`, `diagnose_retention`, `find_seo_opportunity`, `mine_top_performers`, `build_launch_plan`, `prepare_packaging_experiment`, `generate_asset`, `send_to_tool`, `record_creator_decision`, `search_channel_history`. Each is backed by existing services — this is a façade over the generators and engines, not new logic.

**4.2 Add the tool-calling loop** to `runBrainTurn`, replacing the single-shot call at `:355`. Bounded iterations with a per-turn tool-call cap recorded in the trace. This is what lets the Brain discover mid-turn that it needs retention data and go get it.

**4.3 Complete Recommendation → ActionPacket → Tool → Outcome.** Wire `BrainHandoffInbox` (currently unreachable) so destination tools consume and prefill from packets. Every consequential recommendation gets a stable ID carried through to the outcome record.

*Acceptance:* the Brain can answer a multi-step analytics question by calling ≥ 2 tools; an ActionPacket created in chat prefills the destination tool; every packet has a recommendation ID.

*Risk:* medium. Cap tool calls per turn and enforce the approval policy — do not let autonomy outrun Phase 6's observability.

---

## Phase 5 — Closing the learning loop (4 weeks)

The phase that makes the product compound. Depends on Phases 1 (durable storage), 3 (structured assets) and 4 (recommendation IDs).

**5.1 Server-side ledgers.** Move outcome, evaluation and learning records from localStorage to Neon: `recommendation`, `creator_decision`, `asset`, `asset_publication`, `outcome`, `learning_claim`. Migrate existing local records on first authenticated load.

**5.2 Write the outcomes that never got written** (§4). Call sites: creator accepts/rejects/edits a recommendation; an asset is copied, exported or sent to a tool; an asset is published; a creator gives explicit feedback. This finally populates `ChannelIntelligence`'s inputs.

**5.3 Analytics read-back.** Scheduled job — reachable now that Phase 1 provides server-side execution — joins published assets to their YouTube performance at 24h/7d/28d, compares against the `StatisticsEngine` baseline and expected range, and writes an `outcome` with measured effect. **This is the mechanism by which the system learns whether its own advice worked.**

**5.4 Resurrect the lifecycle stack.** Wire `AlgorithmLifecycleBaseline`, `AlgorithmLifecycleCohorts`, `AlgorithmLifecycleObservationStore`, `AlgorithmEvaluationEngine`, `AlgorithmMonitoringSchedule`, `CanonicalAlgorithmEvaluation` — ~975 LOC of already-written, already-tested prediction verification (§5).

**5.5 Confidence calibration.** Periodically compare stated confidence against measured success and adjust. A "high confidence" recommendation should demonstrate high historical success or the label is recalibrated.

**5.6 Typed Channel Knowledge with promotion governance.** Every durable fact carries `value, confidence, source, evidenceRefs, createdAt, validatedAt, expiresAt?, contradictions, status`. Different learning classes get different promotion rules — a creator-stated fact is authoritative immediately; an analytics-derived hypothesis needs corroboration and expires; a temporary anomaly never promotes. Contradiction detection demotes patterns that new evidence disproves.

**5.7 Feed learning back into generation.** `EvidencePlanner` requests "what worked for this channel" for the asset type; `AssetGenerator` includes proven patterns and known anti-patterns. This closes the loop end to end.

*Acceptance:* a recommendation can be traced from chat → asset → publication → measured outcome → learning claim → altered future generation; the Learning Ledger UI shows real records; calibration report shows stated vs measured confidence.

*Risk:* medium. Attribution is genuinely hard — a video's performance has many causes. State effects as correlations with confidence intervals, never as proven causation; the `StatisticsEngine` already provides the machinery to be honest about this.

---

## Phase 6 — Eval harness and observability (3 weeks, starts parallel with Phase 2)

**6.1 Golden dataset.** Extend the existing fixtures (`brain/fixtures/` — military-history-rich, restoration-rich, gaming-sparse, empty-channel) into 50+ cases across question types, asset types and data-availability states. The sparse and empty fixtures matter most: they catch the failure mode where the Brain invents data it does not have.

**6.2 Three grader channels**, per the research — never one:
- **Deterministic:** did it retrieve the right datasets? are all numeric claims backed? did it respect creator permissions? did it avoid unapproved actions?
- **Rubric-based LLM judge:** binary decisions per criterion, not holistic scores.
- **Human review queue:** strategic quality and style fidelity, sampled.

**6.3 Metrics:** answer accuracy, evidence precision/recall, unsupported-claim rate, tool-selection accuracy, tool-call count, context tokens, latency, repair rate, style fidelity, cost per turn, creator acceptance, measured recommendation success.

**6.4 Release gate.** Wire into the `static-quality` gate. Note the ~1,800 pre-existing lint errors documented in `CLAUDE.md` — the Brain eval gate must be a **separate** check so it is not lost in that noise and cannot be admin-bypassed by habit.

**6.5 Brain trace viewer.** A diagnostics surface rendering `BrainTrace` as a first-class category alongside auth/sync/runtime in `services/diagnostics.ts`.

*Acceptance:* `npm run eval:brain` runs the suite and reports all metrics; a regression in grounding fails CI; any turn is inspectable end to end.

*Risk:* low, high value. **Land 6.1–6.2 before Phase 2 ships** so context and evidence changes can be measured rather than guessed at.

---

## Phase 7 — Surface consolidation (3 weeks)

**7.1 Intelligence Hub onto `BrainRuntime`.** Keep the report surface and its generation policy; replace its parallel orchestration with runtime calls. Its evidence-preflight discipline is the best in the codebase and should be *promoted* into the shared runtime, not discarded.

**7.2 Widget context contract.** Implement the 09-11 doc's `WidgetContext` (`widgetId, datasetIds, dimensions, metrics, window, filters, entities, currentState, evidenceRefs, availableActions`) per the `viewtube-widget-dashboard` skill's registration rules. Creator asks "why did this chart spike here?" and the Brain knows exactly which widget, dataset, period, entity and filters are in view.

**7.3 Retire duplicate paths.** Once chat, hub and tools share the runtime, remove the parallel orchestration.

*Acceptance:* one `BrainRuntime.run` entry point for all surfaces; widget-context questions answer against the exact selection; no surface holds its own model-calling code.

---

## Sequencing

```
Phase 0  ▓                                              1w
Phase 1  ░▓▓▓                                           3w   (blocks 5)
Phase 6a   ░░▓▓                                         2w   (harness before Phase 2 lands)
Phase 2     ░░▓▓▓▓                                      4w   (blocks 3,4)
Phase 3          ░░▓▓▓▓▓                                5w   ← most user-visible value
Phase 4               ░░▓▓▓                             3w
Phase 5                    ░░▓▓▓▓                       4w   ← compounding value
Phase 6b                        ░░▓                     1w
Phase 7                          ░░▓▓▓                  3w
```

Roughly **22 engineer-weeks** of sequential critical path; less with parallelism across Phases 1/6a and 3/4.

**If only three phases are funded: 0, 1, 3.** That yields governed, evidence-grounded, style-faithful asset generation with server-side cost control — the core of the user's request — without the full learning loop.

**Do not reorder Phase 5 before Phase 1.** Closing the learning loop on localStorage produces per-browser learning that cannot calibrate, cannot aggregate and will be silently lost.

---

# Part VI — How the plan maps to the stated requirements

| Requirement | Where it is delivered | Current state |
|---|---|---|
| Valuable insights to channel owners | Phases 2, 4 — evidence planner, statistics engine, semantic tools | 20% — 5 video titles |
| Generate scripts, videos, shorts, images, b-roll | Phase 3 — `AssetGenerator` + gateway | 30% — exists, ungoverned |
| Community posts, comment responses | Phase 3.3 group 3 | 30% — exists, ungoverned |
| Video topic ideas | Phase 3.3 group 4 | 30% |
| SEO titles, tags, descriptions, timestamps | Phase 3.3 group 2 | 30% |
| Educational timestamped questions | Phase 3.3 group 2 (`generateEducationalTimestampQuestions` exists) | 30% |
| Customizable, loyal to previous style/quality | **Phase 3.1 `StyleProfile`** | **0% — no implementation** |
| Niche/audience specificity | Phases 2, 5 — evidence + learned patterns | 25% |
| Intake evidence, analytics, communication, metadata, research, criticism, instructions | Phase 2 (`EvidencePlanner`) + Phase 5.2 (decisions, feedback) | 20% |
| Determine effectiveness of previous advice/assets | **Phase 5.3 analytics read-back** | **0% — loop never ran** |
| Adjust future outputs toward success | Phase 5.7 | 0% |
| Verbalize knowledge base into digestible actionable outputs | Phase 3.4 structured outputs + Phase 7 surfaces | 40% |

The two hard zeros — style fidelity and effectiveness measurement — are precisely the two capabilities that would differentiate ViewTube from any generic prompt wrapper. Both are addressed, and neither requires research risk: the style approach is established practice with a known exemplar plateau, and the measurement approach needs only the wiring of code that already exists.

---

# Part VII — Skills

### Installed this session

- **`viewtube-youtube-auth-api-stabilization`** — present in the repo at `skills/` but never installed to `.claude/skills/`. It governs the auth/API/proxy boundary that Phase 1's AI gateway must follow, so it becomes load-bearing for this plan. Now installed.

A marketplace search across agent-evaluation, prompt-engineering, observability, RAG, scriptwriting and SEO keywords returned no additional installable skills.

### Authored this session

Following `viewtube-skill-authoring` (define trigger, responsibility, non-goals, sources, procedure, verification, handoff) and `viewtube-skill-finder`'s rule that the smallest existing skill set should own a task before new skills are created. Two gaps had no owner:

- **`viewtube-creator-asset-generation`** — governs Phase 3. No existing skill owns AI asset generation quality: `viewtube-prince-forge` owns the editor/render/publish pipeline, and `viewtube-prince-brain` owns reasoning and memory, but neither owns the evidence-grounded, style-faithful generation path or the 60 generators in `gemini.ts`.
- **`viewtube-brain-eval-harness`** — governs Phase 6. `viewtube-verification-chancellor` verifies *mission completion*, not *AI output quality*; no skill owns golden datasets, grader mixes or eval release gates.

Deliberately **not** created, to avoid skill sprawl: an AI-gateway skill (belongs to `viewtube-youtube-auth-api-stabilization`'s proxy rules plus `viewtube-prince-brain`), and a statistics skill (belongs to `viewtube-prince-observatory`'s analytics-canon ownership).

---

# Appendix A — Verification commands

```bash
# Reachability: which brain modules never load in the app
node scripts/audit/reach.mjs      # see Part I method

# Ledger writers (expect: zero results — this is the §4 finding)
grep -rn "recordBrainOutcome\|createEvaluationRecord" src --include=*.ts --include=*.tsx \
  | grep -v "BrainOutcomeLedger.ts\|viewTubeEvaluationLedger.ts"

# Canon violations: Brain reading VT-SYNC directly
grep -rn "vt-sync-local/upstream/tableRegistry" src/services --include=*.ts

# Client-side key exposure
grep -rn "new GoogleGenAI" src

# Style model (expect: zero results until Phase 3.1)
grep -rn "styleProfile\|voiceProfile\|StyleModel" src --include=*.ts --include=*.tsx
```

# Appendix B — Primary evidence index

| Finding | Evidence |
|---|---|
| Capabilities inert | `brain/BrainOrchestrator.ts:301,306-311,340-347,439,457` |
| No tool loop | `brain/BrainOrchestrator.ts:355,377` |
| Character clipping | `brain/BrainContextBroker.ts:11,23-63` |
| Weak number guard | `brain/BrainOrchestrator.ts:80-95` |
| Lexical evaluation | `brain/BrainOrchestrator.ts:97-169,256` |
| Canon bypass | `aiBrainCommandInterface.ts:35`; `analytics-canon/README.md` |
| Bridge unreachable | `brain/BrainAnalyticsEvidence.ts` (not in module closure) |
| 60 ungoverned generators | `gemini.ts` (4,885 LOC) |
| Client-side keys | `gemini.ts:440-450,465,472`; `context/GeminiKeyContext.tsx:49` |
| Silent model downgrade | `gemini.ts:334-405` |
| Zero outcome writers | `brain/BrainOutcomeLedger.ts:47`; `viewTubeEvaluationLedger.ts:12,18,24` |
| Empty ledger UI | `components/ViewTubeLearningLedger.tsx:2` |
| One-sided preference signal | `components/SendToMenu.tsx:39`; `viewTubeWorkflowLearning.ts:36` |
| Channel Intelligence starved | `brain/ChannelIntelligence.ts:3` |
| Two brains | `components/IntelligenceHub/` (4,065 LOC) vs `brain/BrainOrchestrator.ts` (532 LOC) |
| No style model | zero matches, repository-wide |
| No trace | zero matches for `BrainTrace`/`traceId` |
