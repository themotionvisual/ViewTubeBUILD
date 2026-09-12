---
name: viewtube-brain-eval-harness
description: Build, extend and gate ViewTube's Brain evaluation harness — golden datasets, deterministic graders, rubric-based LLM judges, human review queues and release gating for AI quality. Use when changing Brain reasoning, context, evidence, prompts or generation quality; do not use for mission verification or general build/test gating.
---

# ViewTube Brain eval harness

## Trigger

Use when work changes anything that can alter AI output quality: Brain orchestration,
context assembly, evidence planning, statistics, prompts, capabilities, tools, asset
generation, or model routing.

Also use when a change "looks fine in one manual test" and you are about to ship it. That
is the moment this skill exists for.

## Responsibility

Make Brain quality measurable so changes are engineering rather than prompt intuition.

An agent is not a chat response. It acts over turns, uses tools, mutates state, and fails
in ways invisible if you only grade the final message. Grade the **trajectory**, not just
the text.

## Non-goals

- Not mission/PR completion verification — that is `viewtube-verification-chancellor`.
- Not build, lint or unit-test gating — the Brain eval gate is a **separate** check.
- Do not fold Brain eval results into `static-quality`. That gate carries ~1,800
  pre-existing lint errors and is routinely admin-bypassed; a quality signal hidden inside
  it is a quality signal discarded.

## Required sources

- `src/services/brain/fixtures/` — existing golden channel fixtures
- `src/services/brain/__tests__/brainGoldenAnswerQuality.test.ts`
- `src/services/brain/BrainOrchestrator.ts` — `validateBrainResponse`
- `docs/VIEWTUBE_AI_SYSTEMS_VERIFIED_AUDIT_AND_IMPLEMENTATION_PLAN_2026-09-12.md` Phase 6

## Procedure

### 1. Three grader channels, never one

Combine all three. A single channel is the failure mode the current
`validateBrainResponse` demonstrates: five lexical heuristics that reward repeating
channel nouns and containing an action verb.

**Deterministic graders** — assert on state and structure, not prose:
- were the right datasets requested?
- is every numeric claim backed by an evidence ref?
- were creator permissions respected?
- was an action taken without approval?
- tool-call count within budget?

**Rubric LLM judges** — decompose into binary decisions per criterion. Rubrics make a
judge decide "does this satisfy item 4: yes/no" rather than scoring holistically, which is
markedly more reliable. Never ask a judge for an overall 0–100.

**Human review** — sampled, for strategic quality and style fidelity. Queue it; do not
pretend a model judge substitutes for creator taste.

### 2. Fixtures must include failure states

The golden set must span data-availability states, not just rich channels:

- rich channel (military-history, restoration)
- sparse channel (gaming)
- **empty channel**
- analytics permission disabled
- partial/stale evidence

The sparse and empty cases are the highest-value tests in the suite: they catch the Brain
inventing specifics it cannot have. A suite of only rich fixtures will pass a system that
hallucinates.

### 3. Grade numbers properly

Numeric grounding checks must compare **tokenized numeric values with rounding tolerance**
(`1.2M` ≈ `1200000`), not substring-match a serialized blob. A substring test over
`JSON.stringify(evidence)` silently whitelists any short figure that appears inside a
longer ID, timestamp or view count — which is most invented percentages.

### 4. Track model substitution

Record `modelRequested` vs `modelServed` on every case. Model routing in this repository
can silently downgrade a request; an eval run that does not record which model actually
answered is not comparable across runs.

### 5. Metrics to report

Answer accuracy · evidence precision · evidence recall · unsupported-claim rate ·
tool-selection accuracy · tool-call count · context tokens · latency · repair rate ·
style fidelity · cost per turn · creator acceptance · measured recommendation success.

Report distributions, not just means — a p95 regression matters.

### 6. Gate

Wire as its own CI check. Fail on regression in grounding, unsupported-claim rate, or
style fidelity against the recorded baseline. Land the harness **before** the change you
want to measure, or you will be comparing against nothing.

## Verification

- [ ] Suite runs with one command and reports every metric above
- [ ] ≥ 50 cases spanning all data-availability states
- [ ] All three grader channels present
- [ ] Numeric grading is tokenized, not substring
- [ ] `modelServed` recorded per case
- [ ] Gate is a separate CI check from `static-quality`
- [ ] A deliberately regressed branch fails the gate (prove the gate works)

## Result format

Report: case count by category, metric table with deltas against baseline, regressions
found, and any metric not yet instrumented.

## Handoff

- Reasoning/evidence architecture changes → `viewtube-prince-brain`
- Asset-quality criteria → `viewtube-creator-asset-generation`
- Analytics provenance correctness → `viewtube-prince-observatory`
- Mission sign-off → `viewtube-verification-chancellor`
