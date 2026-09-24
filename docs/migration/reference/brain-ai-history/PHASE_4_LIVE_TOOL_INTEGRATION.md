> **Historical AI reference — archived 2026-09-24**  
> **Original path:** `docs/brain/PHASE_4_LIVE_TOOL_INTEGRATION.md`  
> **Current AI systems management authority:** `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`  
> **Current runtime architecture authority:** `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`  
> Unique durable rules from this document were harvested into current authorities before archival. Historical phase labels, maturity estimates, branch state and “current” claims below are not current status.  
> See `docs/brain/ai-systems/DOCUMENT_CONSOLIDATION_REGISTER_2026-09-24.md` for the migration disposition.

# ViewTube Brain Phase 4 — Live Tool Integration

**Status:** HISTORICAL PHASE CLOSEOUT / live-tool integration reference  
**Current authority:** `UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`  
**Wave 5 note (2026-09-24):** retain the destination-inbox/handoff integration pattern; phase numbering and branch-closeout status are historical. Verify current consumers before claiming a destination is wired.

## Goal
Turn the Phase 1–3 intelligence, ActionPacket, Handoff Inbox, learning and adaptive workflow foundations into a reusable live-tool integration contract.

## Added
- `src/services/brainLiveToolIntegration.ts`
  - reads destination-specific queued/open handoffs
  - validates the destination capability
  - exposes open/accept/complete/dismiss lifecycle actions
  - extracts structured packet payloads for destination-tool prefill
  - sends completion/rejection signals into workflow learning
- `src/components/brain/BrainLiveToolInbox.tsx`
  - reusable ViewTube-styled destination inbox
  - shows source → destination, payload kind, summary, evidence and provenance
  - Load into tool / Complete / Dismiss controls
  - optional `onPrefill` callback so existing tools can map packet payload into their own state without replacing their UI

## Integration pattern
```tsx
<BrainLiveToolInbox
  destinationToolId="video-publisher"
  channelId={channelId}
  onPrefill={(payload) => applyPublisherPrefill(payload)}
/>
```

The destination tool owns the exact mapping from generic ActionPacket payload to its local form state. This prevents the Brain layer from knowing tool-internal UI implementation details.

## First production targets
1. Thumbnail Studio → Video Publisher
2. Brain/Hook Generator → Projects + Calendar
3. Script → Storyboard Studio
4. Storyboard/Vault → VT_E1 Editor
5. Generated image/Vault → Community Posts

## User agency
The inbox does not publish. Loading a packet pre-populates a tool; consequential actions remain governed by the destination tool's normal approval controls.

## Phase 4 closeout status
Foundation complete on branch `themotionvisual/feat/brain-phase-four-live-tool-integration-build`.

Still required before merging to a production branch:
- mount `BrainLiveToolInbox` into selected destination tools
- add destination-specific prefill adapters
- add component/service tests
- run build/typecheck and repair preview deployment
- capture real deployment screenshots

## Phase 5 direction
Cross-channel validation + evaluation: channel-owner tester program, anonymized/approved evidence collection, benchmark suites across niches, workflow success metrics, prompt/skill evaluation and controlled promotion of learned improvements.
