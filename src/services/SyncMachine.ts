import { SyncPhase } from "../types";

export class SyncMachine {
  private _phase: SyncPhase = "IDLE";
  private _isSyncing = false;

  get phase() { return this._phase; }
  get isSyncing() { return this._isSyncing; }

  async startSync() {
    if (this._isSyncing) return;
    this._isSyncing = true;
    await this.startPhase1();
    await this.startPhase2();
    await this.startPhase3();
    this._isSyncing = false;
    this._phase = "IDLE";
  }

  async startPhase1() {
    this._phase = "PHASE_1";
    console.log("Running Phase 1");
  }

  async startPhase2() {
    this._phase = "PHASE_2";
    console.log("Running Phase 2");
  }

  async startPhase3() {
    this._phase = "PHASE_3";
    console.log("Running Phase 3");
    this._phase = "COMPLETE";
  }
}
