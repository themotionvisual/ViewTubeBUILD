---
name: viewtube-creator-asset-generation
description: Build and review ViewTube AI creator-asset generation so titles, packages, hooks, scripts, storyboards, thumbnails, community posts, comments, SEO metadata and other generated assets are grounded, style-aware, validated, traceable and outcome-linked. Use for AssetGenerator strategies and migrations of legacy creator generation.
---

# ViewTube Creator Asset Generation

## Core contract

Every significant generated creator asset must be:

1. **Grounded** — channel/project/video claims come from canonical evidence.
2. **Style-aware** — use current creator/channel style knowledge where permitted and measure style when the asset type supports it.
3. **Validated** — deterministic schema/claim checks first; selective critique/repair for high-value outputs.
4. **Traceable** — stable asset/output ID + `BrainTrace` + prompt/model/evidence provenance.
5. **Outcome-linkable** — creator selection/edit/export/use and later measured performance can join back to the generated asset.

## Canonical owners

- BrainRuntime / PromptConstitution — reasoning and shared AI rules.
- analytics-canon — normalized analytics evidence.
- Channel Profile / Channel Knowledge — durable creator/channel knowledge.
- Projects / ContentBuild — work identity and project intent.
- `AssetGenerator.ts` — governed creator generation path.
- `StyleProfile.ts` / `styleMetrics.ts` — measurable style contract.
- `creatorAssets.ts` — generated creator-asset records.
- `assetOutcomes.ts` / BrainOutcomeLedger — creator decision/outcome signals.
- BrainTrace — generation provenance.
- provider/gateway layer — model invocation and requested/served model attribution.

Never create a second asset engine, style store, evidence reader or model client.

## Before adding/migrating an asset type

Define:
- creator job and asset type;
- required evidence classes;
- sparse/missing-evidence behavior;
- task instruction;
- typed output schema;
- deterministic validation;
- style/rubric criteria;
- repair policy;
- stable identity/provenance;
- creator-decision/outcome hooks;
- target project/Vault/publishing handoff if applicable.

## Prompt rules

Compose from the shared Prompt Constitution and the asset/task family. Do not duplicate a giant system prompt per generator.

Prompts must not fabricate search volume, CPC, competition, audience demographics, algorithm boosts or future performance.

Title/thumbnail/hook work should converge toward a **package-level** strategy instead of three unrelated generators.

## Style rules

Use measurable/creator-confirmed style signals.

Preferred evidence:
1. explicit creator rules;
2. creator edits of generated work;
3. accepted/published exemplars;
4. repeated observed patterns.

Do not invent a voice description because samples are sparse.

When a creator edits generated text, retain the pair as correction/style evidence where controls allow it.

## Quality loop

Use the cheapest sufficient path:

- simple structured asset → generate + deterministic validate;
- higher-value asset → strategy + generate + validate;
- major package/script → strategy + diverse candidates + evidence-backed critique + deterministic validation + at most bounded repair/revision.

A failed repair must not loop indefinitely. Preserve the stronger draft and mark `needs_review` when necessary.

## Outcome rules

Capture meaningful decisions without overclaiming causality:

- selected/accepted;
- edited/corrected;
- exported/copied;
- rejected/discarded with reason where available;
- used/published variant;
- later measured outcome tied to exact asset/package identity.

Creator preference is not measured performance.

## Migration rule for legacy generators

Do not rewrite `gemini.ts` wholesale.

Migrate families incrementally:
1. packaging/SEO metadata;
2. hooks;
3. title/thumbnail/package;
4. scripts/storyboards;
5. community/comments;
6. remaining helpers.

Each migration must preserve UI behavior while moving model access, evidence, schema, trace and outcome handling behind canonical owners. Delete the old path only after parity/reachability proof.

## Verification

Use `viewtube-brain-eval-harness` plus focused unit/integration tests. Include rich, sparse and empty evidence fixtures. Verify requested/served model attribution and that no direct UI→provider path was introduced.

## Result format

Return: asset type; canonical owner; evidence/style/schema contract; prompt/version; validation/repair plan; trace/outcome path; migration/deletion status; verification receipts.
