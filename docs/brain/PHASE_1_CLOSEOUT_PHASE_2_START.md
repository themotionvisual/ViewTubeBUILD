# Phase 1 Closeout → Phase 2 Start

## Scope lock

This branch remains `themotionvisual/feat/brain-phase-one-integration`. Do not commit this work directly to the deploy/main branch.

## Phase 1 architecture now present

- Universal `ViewTubeActionPacket` contract and capability registry.
- Suggested tool-chain registry spanning existing Studio Hub tools, Projects, Storyboard, Vault, Brain and VT_E1.
- Packet persistence through the existing GenerationRecord + Vault provenance path.
- Reusable `SendToMenu` for contextual internal handoffs.
- Thumbnail Studio output adapter as the first concrete handoff producer.
- Creator/User Control service with personalization, learning, dataset/profile access, external-action confirmation, publishing dry-run/blocking, comment/community gates, research opt-in and demo-mode lock.
- Persisted creator-control audit events.
- Creator-triggered workflow-learning deletion.

## Phase 1 rule

Brain does not duplicate domain logic. Domain operations remain in canonical ViewTube services/tools. Brain and workflow orchestration pass typed context/evidence to those tools. Internal handoffs do not grant permission for external mutations; publish/comment/community/external actions remain gated.

## Remaining production wiring before merge/release

These are integration/verification tasks, not architecture redesign:

1. Mount `ThumbnailHandoffBar` beside the actual generated-thumbnail result.
2. Add handoff packet resolution/consumption to Publisher, Video Manager and Vault.
3. Apply the User Control gate at the existing Publisher/comment/community external-write boundaries.
4. Mount the global/mobile Brain Sidecar and evidence drawer against the existing Brain endpoint.
5. Verify real VT-SYNC read, Projects read/write, comments+catalog, Publisher dry-run and resumable approval paths.
6. Add critical-path tests for controls, handoffs, audit persistence, demo lock and mobile Sidecar.

## Phase 2 has begun: adaptive workflow intelligence

Phase 2 starts without waiting for Super Tools. Existing Studio Hub tools and widgets are first-class participants.

Implemented first slice:

- `viewTubeWorkflowLearning.ts` records accepted handoff destinations only when creator learning is enabled.
- `SendToMenu` uses those signals to adapt destination ordering.
- Channel-matching signals receive higher weight so workflows can adapt per channel without rewriting global prompts.
- Creator can disable learning or delete learned workflow signals.
- Every accepted internal handoff creates an audit event.

## Phase 2 next slices

1. Record explicit rejection/dismissal of recommendations, not just acceptance.
2. Add channel-profile feature inputs to destination ranking.
3. Add project-stage and video-format context to ranking.
4. Turn repeated successful chains into reviewable WorkflowCandidates.
5. Add EvaluationRecords for Brain recommendations and resulting outcomes.
6. Add a Learning Ledger UI: evidence → candidate → creator approval/rejection → active rule → measured outcome.
7. Separate channel-local adaptation from global system experiments. Global prompt/system promotion requires its own evaluation path and must never happen silently from one creator's behavior.
8. Extend widget registry with `accepts`, `produces`, `suggestedHandoffs` and evidence-source metadata.
9. Add chain viewer showing source, evidence, transformations, artifacts, approvals and current status.
10. Add multi-channel beta instrumentation so channel-specific learning remains isolated and comparable.
