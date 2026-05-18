---
name: viewtube-brain-loop
description: Use when rewriting or extending ViewTube's Brain and Ultimate Report loop so tool generations feed persistent channel knowledge, drive per-tool prompt-context rewrites, and improve report quality over time in viewtubeX.
---

# ViewTube Brain Loop

## Overview
Use this skill to design and execute a safe, additive rewrite of ViewTube's Brain loop in `viewtubeX`: capture generations, update channel-specific knowledge, rewrite prompt contexts per tool, and feed improved context into the Ultimate Report pipeline.

This skill is implementation-facing. It does not describe a one-off architecture memo; it defines how to migrate the live system with compatibility checks.

## Trigger Conditions
Use this skill when requests involve:
- Connecting multiple tools into one persistent Brain feedback loop
- Making prompts evolve from historical generations, user feedback, and channel specifics
- Unifying Brain memory updates with Ultimate Report generation quality
- Adding generation persistence, channel knowledge models, or per-tool context packs
- Migrating from event-only or static-prompt behavior to adaptive loop behavior

Do not use this skill for isolated UI styling tasks, single-chart fixes, or non-Brain one-off bugfixes.

## Required Workflow
1. Baseline current system behavior and failure points.
2. Define loop contracts (`GenerationRecord`, `ChannelKnowledgeModel`, `ToolContextPack`, `BrainUpdateResult`).
3. Plan additive migration phases by subsystem.
4. Integrate prompt-context rewrite into all participating tools.
5. Regenerate Ultimate Report with new context flow and compare quality continuity.
6. Run verification gates before any legacy-path deprecation.

Read references in this order:
- `references/current-system-mapping.md`
- `references/brain-loop-target-architecture.md`
- `references/rewrite-backlog.md`

## Execution Rules
- Preserve runtime continuity: no hard cutover until parity gates pass.
- Keep canonical source-of-truth in active `viewtubeX` paths; do not drift into archive copies.
- Treat Brain updates as deterministic pipeline steps with diagnostics, not opaque background magic.
- Separate data contracts from storage implementation so migration can map to current stack safely.
- Require per-phase rollback notes in rewrite plans.

## Output Requirements
When using this skill to produce an implementation plan, require:
- Current-state map: entrypoints, events, and context injection path
- Target-state map: loop contracts and update sequence
- Phased migration with explicit compatibility behavior
- Verification matrix for runtime safety and report quality
- Residual risk list and deprecation criteria
