---
name: viewtube-king-emperor-bridge
description: Translate a ViewTube KING mission into an EMPEROR work order and translate execution receipts back into product/artifact truth.
---

# KING ↔ EMPEROR BRIDGE

Use this skill whenever work crosses from plans/artifacts into executable code or returns from code into product records.

## Input
A valid `viewtube.mission.v2` mission with objective, acceptance criteria, authorization, canonical owners, non-goals and rollback.

## Mission → work order
1. Resolve the current main/target SHA and checkout.
2. Map each requested capability to the actual owner paths.
3. Reject stale path assumptions from old plans when main has moved.
4. Partition work into ordered, non-overlapping writer scopes.
5. Define the narrowest tests plus build/runtime/deployment checks required.
6. Emit a `viewtube.work-order.v1` record.

## Receipt → mission
1. Compare changed paths with the approved work order.
2. Verify tests/build/runtime receipts independently.
3. Record deviations, side effects and rollback.
4. Update artifact/task recommendations without silently changing status.
5. Return the unresolved decision to KING when product intent and executable constraints conflict.

## Hard rules
- KING cannot claim shipped behavior from a plan.
- EMPEROR cannot broaden product scope because implementation is convenient.
- No client-only gate is treated as authority for auth, billing, credits or publishing.
- No prototype silently replaces a canonical production owner.
