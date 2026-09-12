---
name: viewtube-ai-system-steward
description: Keep the ViewTube AI/Brain system streamlined, wired and measurable over time — run the AI health check, enforce the add/remove gates before merging new AI capabilities, tools, generators, prompts or widgets, and detect the decay patterns that leave subsystems built but unreachable. Use when adding or reviewing any AI subsystem, when doing a periodic AI health review, or when the Brain "has" a feature that does not appear to run.
---

# ViewTube AI system steward

## Trigger

Use when:

- adding a Brain capability, semantic tool, asset generator, prompt, ledger, or AI-calling widget;
- reviewing a PR that touches `src/services/brain/`, `src/services/gemini.ts`, `src/services/prompts.ts`, or any AI widget;
- a periodic AI health review is due (monthly, and before any release that changes AI behavior);
- someone reports that the Brain "should" do something it demonstrably does not do.

## Why this skill exists

A repository-wide audit on 2026-09-12 found ViewTube's AI architecture was ~70% *designed* and ~30% *operational*. The gap was not caused by bad design or missing effort. It was caused by six repeatable decay patterns, each of which produced code that looked finished, passed its tests, and never ran.

This skill exists to make those six patterns detectable in minutes instead of months.

## Prime directive

> **No new AI subsystem merges without a wired consumer and, if it stores anything, a write caller.**

A module that only its own tests import is not shipped. It is a draft with a green check mark.

---

## The six decay patterns

Check every AI change against these. Each was found in production code.

### 1. The orphan subsystem
Built, unit-tested, never imported by anything the app loads.

*Found:* 21 of 52 modules in `src/services/brain/` unreachable from `main.tsx`/`App.tsx`, including ~975 LOC of prediction-verification code and `BrainAnalyticsEvidence.ts` — the canonical-analytics bridge, whose own docblock explains why it exists.

*Gate:* trace the import path from an entry point before merging. If you cannot name the component that loads it, it is not done.

### 2. The ledger with no writer
A store with read APIs, a UI, and zero write callers.

*Found:* `recordBrainOutcome` and `createEvaluationRecord` both had zero callers. `ViewTubeLearningLedger.tsx` rendered a permanently empty list. `ChannelIntelligence` derived patterns from those empty tables and therefore produced nothing — a correct engine starved of input.

*Gate:* a store merges with its write call sites in the same PR, or not at all. A read API without a writer is a scheduled disappointment.

### 3. The inert registry
Entries selected at runtime, then used only as log metadata.

*Found:* 10 of 12 Brain capabilities were selected by `selectBrainCapabilities`, then passed only into the learning event's metadata. They never reached the prompt and dispatched no handler. The registry was a taxonomy wearing a runtime's clothes.

*Gate:* every registry entry must have an executable handler and a test asserting the handler ran — not a test asserting the entry was selected.

### 4. The ungoverned generator
An AI call that bypasses the runtime: builds a template string, calls the model, returns markdown.

*Found:* 60 such functions in a 4,885-line `gemini.ts`, with no evidence, evaluation, tracing, style model or structured output, typed `brain?: any` at exactly the boundary where grounding would be enforced. This was the entire creator-facing asset feature set.

*Gate:* no new `getAiClient()` call outside the gateway client. New asset types register with `AssetGenerator`. See `viewtube-creator-asset-generation`.

### 5. The canon bypass
Reading analytics around the canonical layer instead of through it.

*Found:* `aiBrainCommandInterface.ts` imported `VT_SYNC_TABLE_DEFINITIONS` directly from `features/vt-sync-local/upstream/tableRegistry`, bypassing `services/analytics-canon` — against the rule stated in that module's own README. Consequence: the conversational Brain's entire evidence payload was five video titles.

*Gate:* AI code reads analytics through `services/analytics-canon`. No exceptions.

### 6. The trust surface over an untrustworthy substrate
UI that signals grounding the output does not have.

*Found:* 10 of 52 dashboard widgets called generators directly and rendered with the same visual authority as canonical analytics. Separately, the "unsupported number" guard was a substring test over `JSON.stringify(evidence)`, which admits most invented percentages.

*Gate:* a confidence chip or evidence ribbon may only render on output that actually carries evidence refs. Never decorate ungrounded output.

---

## The health check

Run monthly and before any AI-affecting release. Compare against the ratchet baseline; **numbers may go down, never up.**

```bash
# 1. Orphans — modules never loaded by the app
node scripts/audit/reach.mjs

# 2. Ledgers with no writers (expect: no results)
grep -rn "recordBrainOutcome\|createEvaluationRecord\|resolveEvaluationRecord" src \
  --include=*.ts --include=*.tsx | grep -v "BrainOutcomeLedger.ts\|viewTubeEvaluationLedger.ts"

# 3. Ungoverned generators
grep -cE "^export (const|async function|function) (generate|refine|rewrite|analyze|fetch|ask|perform|elaborate|transcribe|recommend|rate)" \
  src/services/gemini.ts

# 4. Direct model access outside the gateway (expect: 1, the gateway client)
grep -rn "new GoogleGenAI" src

# 5. Canon bypass — reads of the upstream registry from outside analytics-canon.
#    Hits INSIDE src/services/analytics-canon/ are correct: that layer's job is to
#    read upstream. Anything else is a bypass.
grep -rn "vt-sync-local/upstream/tableRegistry" src --include=*.ts --include=*.tsx \
  | grep -v "src/services/analytics-canon/"

# 6. Widgets calling generators directly
grep -rl "services/gemini" src/views/dashboard/widgets/ | wc -l

# 7. Browser-bound state: how many modules own it directly.
#    Counts modules, not key strings. An earlier version of this check grepped for inline
#    localStorage string literals and undercounted by roughly 4x, because the common pattern
#    is `const STORAGE_KEY = "..."` followed by `localStorage.getItem(STORAGE_KEY)`. Modules
#    is also the metric that matters: the goal is fewer owners of browser-local state.
grep -rl "localStorage\." src --include=*.ts --include=*.tsx | grep -v "\.test\." | wc -l
grep -rl "localStorage\." src/services/brain --include=*.ts | grep -v "\.test\." | wc -l

# 8. Prompt sprawl
grep -c "^export const .*_PROMPT\|^export const .*_INSTRUCTIONS" src/services/prompts.ts
```

### Ratchet baseline

Two columns: the audit baseline, and the last recorded run. Record every run.

| Metric | 09-12 audit | 09-12 after Phase 0 + slice | Target | Direction |
|---|---:|---:|---:|---|
| Unreachable modules (`src/`) | 146 / 732 | 146 / 742 | < 40 | ↓ |
| Unreachable brain modules (excl. fixtures) | 14 | 14 | 0 | ↓ |
| Stores with no write caller | 2 | **1** | 0 | ↓ |
| Ungoverned generators (`gemini.ts`) | 60 | 60 | 0 | ↓ |
| `new GoogleGenAI` call sites | 2, both client-side | 2 | 1, gateway only | ↓ |
| Canon bypasses outside `analytics-canon` | 1 | 1 | 0 | ↓ |
| Widgets calling generators directly | 10 / 52 | 10 / 52 | 0 | ↓ |
| Modules owning browser-local state | — | 103 (12 in `brain/`) | < 40 | ↓ |
| Standalone prompts (`prompts.ts`) | 49 | 49 | 1 constitution + task instructions | ↓ |
| Asset types through `AssetGenerator` | 0 | **1** (community_post) | all | ↑ |

**Known regression, owned.** The community-post slice added four browser-local stores
(traces, style profiles, generated assets, asset outcomes). That moves the browser-local
metric in the wrong direction on purpose: each is shaped for server persistence and behind an
interface, and Phase 1 moves them. If Phase 1 lands and they are still browser-local, that is
a real failure, not an accepted cost. Re-check at every Phase 1 review.

`recordBrainOutcome` now has write callers, so `ChannelIntelligence` receives real input for
the first time. `viewTubeEvaluationLedger` is still writer-less and remains the open one.

Record each run's numbers. A metric that rises is a regression and needs a named owner and a date, not a note.

---

## Merge gates

### Adding a Brain capability
- [ ] Has an executable handler returning `CapabilityResult`
- [ ] A test asserts the handler *ran and contributed*, not merely that it was selected
- [ ] Declares its evidence classes
- [ ] Respects `readBrainUserControls()`
- [ ] Appears in a trace

### Adding a semantic tool
- [ ] Semantic, not a thin wrapper over one function (12 good tools beat 65 exposed ones)
- [ ] Declares inputs, outputs, side effects and approval tier
- [ ] Counted against the per-turn tool-call budget
- [ ] Covered by an eval case

### Adding an asset generator
- [ ] Registered with `AssetGenerator`, no direct model call
- [ ] Typed output schema, not a markdown string
- [ ] Consumes a `StyleProfile`; emits a style score
- [ ] Graded before delivery; repairs on failure
- [ ] Persists an asset record with a stable recommendation ID
- [ ] Golden fixtures include a **sparse** and an **empty** channel
- [ ] No `brain?: any`

### Adding a prompt
- [ ] Composes from the constitution rather than restating it
- [ ] Independently versioned
- [ ] Lives beside the capability it governs

### Adding an AI-calling widget
- [ ] Routes through the runtime, never `gemini.ts` directly
- [ ] Exposes a `WidgetContext` so the Brain can answer "why is this?"
- [ ] Confidence and evidence affordances only if the output carries evidence refs
- [ ] Honest empty and degraded states

### Adding an autonomous behaviour
- [ ] Has a row in the Autonomy Matrix — creator-configurable, defaulting to the most conservative level
- [ ] Output lands in the draft queue; nothing publishes itself
- [ ] Appears in the Activity Feed with undo
- [ ] Respects budget caps, frequency caps and quiet hours
- [ ] Runs server-side — a schedule that needs an open browser tab is not a schedule

---

## Removal rules

Deletion is stewardship. Each month:

1. Run the reachability check.
2. For each orphan, decide **wire it or delete it** — and record the decision in the module header with a date. An undecided orphan returns next month as noise.
3. Delete code superseded by the runtime rather than leaving it as a "fallback." Parallel paths silently become the real path.
4. Never delete a module that a documented phase depends on; wire it instead. The audit found ~975 LOC of already-tested prediction-verification code that was worth keeping and worth connecting.

---

## Verification

A steward pass is complete when:

- [ ] All eight health checks ran and numbers are recorded against the baseline
- [ ] Every regression has a named owner and a date
- [ ] Every orphan has a wire-or-delete decision in its header
- [ ] Applicable merge gates pass for everything in the review window
- [ ] The Brain eval gate is green (`viewtube-brain-eval-harness`)

## Result format

Report: the metric table with deltas against the previous run; regressions with owners; wire-or-delete decisions taken; gate failures blocking merge; and the single highest-leverage cleanup for next month.

Keep it short. This report is read monthly; if it becomes long it stops being read, and an unread health check is the seventh decay pattern.

## Handoff

- Reasoning, memory, evidence authority → `viewtube-prince-brain`
- Analytics ownership and provenance → `viewtube-prince-observatory`
- Asset generation quality → `viewtube-creator-asset-generation`
- Eval coverage and gating → `viewtube-brain-eval-harness`
- Auth/API/proxy boundary for the gateway → `viewtube-youtube-auth-api-stabilization`
- Widget registration and layout → `viewtube-widget-dashboard`
- Tool/toolbox construction → `viewtube-toolbox-builder`
- Ownership disputes between the above → `viewtube-conflict-arbiter`
