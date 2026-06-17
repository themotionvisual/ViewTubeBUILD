# SyncMachine & Mutex Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement SyncMachine service with mutex and 3-phase state machine.

**Architecture:** Mutex `isSyncing`, state machine logic IDLE -> PHASE_1 -> PHASE_2 -> COMPLETE.

**Tech Stack:** TypeScript.

---

### Task 1: Implement SyncMachine & Concurrency Lock

**Files:**
- Modify: `src/types.ts`
- Create: `src/services/SyncMachine.ts`
- Test: `tests/services/SyncMachine.test.ts`

- [ ] **Step 1: Add SyncPhase to src/types.ts**

```typescript
export type SyncPhase = "IDLE" | "PHASE_1" | "PHASE_2" | "COMPLETE";
```

- [ ] **Step 2: Implement SyncMachine in src/services/SyncMachine.ts**

```typescript
import { SyncPhase } from "../types";

export class SyncMachine {
  private _phase: SyncPhase = "IDLE";
  private _isSyncing = false;

  get phase() { return this._phase; }
  get isSyncing() { return this._isSyncing; }

  async startSync() {
    if (this._isSyncing) return;
    this._isSyncing = true;
    this._phase = "PHASE_1";
    // Phase 1 logic
    this._phase = "PHASE_2";
    // Phase 2 logic
    this._phase = "COMPLETE";
    this._isSyncing = false;
    this._phase = "IDLE";
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types.ts src/services/SyncMachine.ts docs/superpowers/plans/2026-06-11-sync-machine.md
git commit -m "feat(services): implement SyncMachine and SyncPhase"
```
