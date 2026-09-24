# Prompt and Model Governance

Primary authority:
- `docs/brain/VIEWTUBE_PROMPT_SYSTEM_AUTHORITY_2026-09-24.md`
- `docs/brain/VIEWTUBE_PROMPT_REGISTRY_2026-09-24.json`
- `docs/brain/VIEWTUBE_PROMPT_IMPROVEMENT_PROGRAM_2026-09-24.md`

## Management rules

- Reference prompt IDs/versions; do not copy prompt payloads into the AI Systems master.
- Material prompt behavior changes require versioning and eval evidence.
- Record requested and served model where available.
- Record context-resolver/schema/constitution versions for consequential generation.
- Current evidence outranks stale learning.
- Creator-confirmed preference outranks inferred preference.
- Missing values never become zero.
- Fabricated metrics are blockers; unverified legitimate derived values are warnings/review until deterministically supported.

## Migration

Legacy `prompts.ts` and creator-facing `gemini.ts` generators are strangler-migration debt, not candidates for wholesale deletion or rewrite.

Remove only after:
- callers migrated;
- output parity/evals;
- trace/model/prompt provenance;
- zero production reachability of old path.
