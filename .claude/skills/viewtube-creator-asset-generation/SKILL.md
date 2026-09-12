---
name: viewtube-creator-asset-generation
description: Build and review ViewTube AI asset generation — scripts, shorts, b-roll plans, images, thumbnails, community posts, comment replies, video topics, SEO titles/tags/descriptions, timestamps and educational questions — so every generated asset is evidence-grounded, style-faithful, evaluated and traceable. Use for any work touching a generator in services/gemini.ts or the AssetGenerator path; do not use for editor, render or publishing pipeline work.
---

# ViewTube creator asset generation

## Trigger

Use when work involves generating or reviewing a creator-facing asset with AI: scripts,
hooks, storyboards, shorts, b-roll plans, images, thumbnail concepts, end screens,
community posts, comment replies, video topic ideas, titles, descriptions, tags,
timestamps, or educational timestamped questions.

Also use when editing any `generate*` / `refine*` / `rewrite*` export in
`src/services/gemini.ts`.

## Responsibility

Every generated asset must satisfy four contracts. An asset that fails any of them is not
finished, regardless of how good the prose looks.

1. **Grounded** — channel-specific claims trace to evidence read through
   `src/services/analytics-canon`. Never through `features/vt-sync-local/upstream/tableRegistry`.
2. **Style-faithful** — generated against a `StyleProfile` for the channel and asset type,
   and scored against it before delivery.
3. **Evaluated** — graded for grounding, rubric compliance and style fidelity, with a
   repair attempt on failure, before the creator sees it.
4. **Traceable** — emits a `BrainTrace` and a persisted asset record so the outcome loop
   can later measure whether it worked.

## Non-goals

- Do not own the editor, render worker, or publishing pipeline — that is
  `viewtube-prince-forge`.
- Do not own reasoning, memory or evidence authority — that is `viewtube-prince-brain`.
- Do not own analytics selectors or provenance rules — that is
  `viewtube-prince-observatory`.
- Do not create a second channel profile, style store, or analytics cache.

## Required sources

Read before changing generation code:

- `src/services/gemini.ts` — the 60 existing generators and the model client
- `src/services/prompts.ts` — existing system prompts
- `src/services/brain/BrainCapabilityRegistry.ts` — the `content-generation` capability
- `src/services/analytics-canon/README.md` — the canonical read rule
- `docs/VIEWTUBE_AI_SYSTEMS_VERIFIED_AUDIT_AND_IMPLEMENTATION_PLAN_2026-09-12.md` §3, Phase 3

## Procedure

### 1. Never add a bare generator

The dominant anti-pattern in this repository is a standalone exported function that builds
a template string, calls the model, and returns markdown. There are 60 of them. Do not
add the 61st.

A new asset type is a **strategy registered with `AssetGenerator`**, supplying only:

- its output schema (typed — never a markdown string)
- its task instruction (not a whole system prompt)
- the evidence classes it needs
- the style scope it generates under

Evidence retrieval, context budgeting, style application, evaluation, repair, tracing and
persistence are inherited. If you find yourself writing `getAiClient()` in a new file,
stop — you are bypassing the runtime.

### 2. Style is measured, not asserted

- Load the `StyleProfile` for `(channelId, assetType)`, falling back to channel scope.
- Include **4–5 exemplars maximum**. Fidelity plateaus after 4–5 demonstrations; more
  exemplars spend context budget for no measurable gain.
- Include the descriptor, and treat it as creator-editable. Extraction proposes; the
  creator decides. Never present an extracted voice as fixed.
- Score the output: embedding cosine similarity against the style embedding, plus a rubric
  judge over the descriptor's explicit prefer/avoid rules.
- On failure, repair against the **specific violated rules**, not a generic "match the
  style better".

### 3. Structured output only

Return typed objects. An asset returned as a markdown blob cannot be scored, diffed, sent
to a destination tool, or joined to its later performance — which silently disables the
learning loop for that asset type.

### 4. Respect creator controls

Check `readBrainUserControls()`. When analytics access is disabled, generate without
private metrics and say so — never reconstruct channel figures from memory. When
personalization is disabled, do not apply a stored `StyleProfile`.

### 5. Record the recommendation

Every delivered asset gets a persisted record with a stable ID, its evidence refs, its
style score, and its trace. Without the ID there is nothing for Phase 5's analytics
read-back to join to.

## Verification

Before claiming an asset generator is done:

- [ ] No `getAiClient()` call outside the gateway client
- [ ] Output is a typed schema, not a string
- [ ] Every numeric channel claim has an evidence ref
- [ ] `grep -rn "tableRegistry" <changed files>` returns nothing
- [ ] Style score is computed and gated, not just logged
- [ ] A `BrainTrace` is emitted with `modelRequested` and `modelServed`
- [ ] Asset record persists with a stable recommendation ID
- [ ] Golden-fixture run includes a **sparse** and an **empty** channel — the asset must
      degrade honestly rather than inventing specifics
- [ ] No `brain?: any` parameter introduced

## Result format

Report: asset types touched, contracts satisfied, style scores observed on fixtures,
evidence classes consumed, and any generator left unmigrated with the reason.

## Handoff

- Evidence or memory authority questions → `viewtube-prince-brain`
- Analytics selector or provenance questions → `viewtube-prince-observatory`
- Editor / render / publish integration → `viewtube-prince-forge`
- Eval coverage for a new asset type → `viewtube-brain-eval-harness`
