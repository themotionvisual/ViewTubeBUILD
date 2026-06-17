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
    // Phase 1 logic placeholder
    this._phase = "PHASE_2";
    // Phase 2 logic placeholder
    this._phase = "COMPLETE";
    this._isSyncing = false;
    this._phase = "IDLE";
  }
}
