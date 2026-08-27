# ViewTube Brain Phase 4 — Live Tool Integration

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
