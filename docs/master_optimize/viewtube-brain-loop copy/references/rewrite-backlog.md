# Rewrite Backlog (Phased, Additive)

## Phase 0: Baseline and Instrumentation
- Map current generation paths by tool.
- Identify where context is consulted and injected today.
- Add loop diagnostics counters (ingest count, update count, context rewrite count, suppressed failures).
- Define parity baseline for Ultimate Report output continuity.

Exit criteria:
- Baseline map approved.
- Diagnostics visible for each loop cycle.

## Phase 1: Contract Introduction
- Introduce internal contract types:
  - `GenerationRecord`
  - `ChannelKnowledgeModel`
  - `ToolContextPack`
  - `BrainUpdateResult`
- Add normalizers and compatibility mappers from current structures.
- Keep existing behavior intact via adapters.

Exit criteria:
- New contracts available without breaking active flows.

## Phase 2: Generation Capture + Feedback Binding
- Capture outputs from all participating generation tools into `GenerationRecord`.
- Bind user feedback and user edits to prior generation IDs.
- Attach optional performance snapshots when available.

Exit criteria:
- End-to-end evidence chain exists for sampled tools.

## Phase 3: Knowledge Update Engine
- Add deterministic update pass from evidence window -> `ChannelKnowledgeModel` delta.
- Track confidence and conflict flags.
- Persist update results with diagnostics.

Exit criteria:
- Knowledge model updates after accepted generation events.

## Phase 4: Prompt Context Rewrite System
- Generate/update `ToolContextPack` per tool from latest knowledge model.
- Add context versioning and evidence references.
- Inject rewritten context into tool prompt paths.

Exit criteria:
- Prompt context changes are observable and deterministic per update cycle.

## Phase 5: Ultimate Report Integration
- Feed updated context and knowledge summaries into ultimate report orchestration.
- Add continuity checks for non-empty sections under partial data.
- Add delta signals for “what changed since last loop cycle”.

Exit criteria:
- Ultimate report quality continuity holds; no runtime exceptions.

## Phase 6: Verification and Legacy Decommission Gates
- Run regression suite and manual runtime checks.
- Validate channel-specific divergence across accounts/channels.
- Validate user customization influence on recommendations/prompt context.
- Define explicit deprecation criteria for legacy paths.

Exit criteria:
- All gates pass; deprecation plan approved.

## Mandatory Verification Matrix
- No uncaught runtime exceptions in loop path.
- Context rewrite occurs after each accepted generation update.
- Report remains non-empty under partial/malformed model output.
- Channel-specific context differs across channels/accounts.
- User customization deterministically affects recommendations and prompt context.

## Risk Register (Track Each Iteration)
- Context drift due to weak evidence windows.
- Overfitting to short-term performance spikes.
- Silent regressions in trigger/event contracts.
- Backward-compat adapter mismatches.
