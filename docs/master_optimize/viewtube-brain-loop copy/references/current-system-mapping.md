# Current System Mapping (viewtubeX)

## Active Loop Entry Points
- Performance trigger dispatch: `src/views/PerformanceHub.tsx` emits `vt_generate_ultimate_report`.
- Ultimate report orchestrator UI: `src/components/IntelligenceHub/IntelligenceHub.tsx` listens for that event and calls `generateUltimateChannelReport(...)`.
- Generation call path: `src/components/IntelligenceHub/ultimateReport.ts` -> `src/components/IntelligenceHub/gemini.ts`.

## Brain Context Integration (Current)
- Async context consult and enrichment:
  - `src/services/brainEngine.ts` exports `consultBrain(...)`, `emitSignal(...)`, `annotateSystemPrompt(...)`.
- Sync context consult for other Gemini surfaces:
  - `src/services/brainUtils.ts` exports `consultBrainSync(...)`, `annotateSystemPrompt(...)`.
- IntelligenceHub Gemini calls currently annotate prompts via `consultBrain('omni-brain')` before Oracle/Architect/Keyword generation.

## Current Gaps vs Persistent Loop Goal
1. Generation capture is not a unified canonical contract across tools.
2. Feedback/edit/performance reconciliation into channel knowledge is inconsistent.
3. Per-tool context packs are not versioned as a durable contract.
4. Ultimate Report consumes model outputs but loop-quality diagnostics are not formalized.

## Constraints for Rewrite
- Maintain additive rollout with existing triggers and UI behavior.
- Keep report generation resilient under partial AI payloads.
- Avoid regressions in `IntelligenceHub` ultimate mode and PerformanceHub trigger path.

## Compatibility Surfaces to Preserve
- `vt_generate_ultimate_report` event behavior.
- `generateUltimateChannelReport` return shape consumed by `IntelligenceHub`.
- Existing Brain signal emission flows used by widgets and post-action reflections.
