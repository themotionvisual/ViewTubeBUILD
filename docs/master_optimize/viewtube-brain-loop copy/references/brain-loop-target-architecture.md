# Brain Loop Target Architecture

## Goal
Evolve `viewtubeX` into a persistent adaptive loop:
`Tool Output -> GenerationRecord -> Brain Update -> ToolContextPack Rewrite -> Improved Next Generation -> Unified Report Delta`

## Core Contracts

### GenerationRecord
Capture each generation event with enough evidence to improve future prompts.

Required fields:
- `generationId`: stable id
- `channelId`
- `toolId`
- `requestInput`: structured or text input
- `responseOutput`: structured or text output
- `contextSnapshot`: active injected context at generation time
- `userFeedback`: loved/used/ignored/edited/none
- `userEdits`: optional edited output
- `performanceSnapshot`: optional downstream metrics
- `createdAt`

### ChannelKnowledgeModel
Channel-specific persistent model updated from generations + user customization.

Required fields:
- `channelId`
- `channelProfile`: niche, tone, audience, strategic posture
- `goals`: creator goals and priorities
- `guardrails`: constraints and avoid-list
- `observedStrengths`: repeatable winning patterns
- `observedWeaknesses`: recurring failure patterns
- `confidenceScore`: 0-100
- `lastUpdatedAt`

### ToolContextPack
Versioned context injection per tool.

Required fields:
- `channelId`
- `toolId`
- `promptContext`: concise context text
- `strategyDirectives`: structured guidance bullets
- `contextVersion`
- `sourceEvidenceIds`: contributing GenerationRecord ids
- `updatedAt`

### BrainUpdateResult
Deterministic result object from each update cycle.

Required fields:
- `knowledgeDeltaSummary`
- `updatedToolContextPacks`
- `qualityFlags`: missing-data, low-confidence, conflicts
- `diagnostics`: counters, suppressions, failures
- `nextActions`

## Update Sequence
1. Ingest new generation/user feedback/channel update.
2. Build evidence window from recent and high-impact records.
3. Compute ChannelKnowledgeModel delta.
4. Rewrite ToolContextPack for affected tools.
5. Emit diagnostics and persist update result.
6. Use updated context in subsequent tool prompts and report generation.

## Rollout Doctrine
- Additive first: dual-run/compat mode before deprecations.
- Deterministic diagnostics at each step.
- Preserve user-facing behavior while deepening loop intelligence.
