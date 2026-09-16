# Status vocabulary — four orthogonal axes

Four vocabularies coexist. They measure different things. Keep all four; never collapse them.

| Axis | Vocabulary | Authority | Scope |
|---|---|---|---|
| **Task lifecycle** | 8-state | **Task Index — sole authority** | durable, per `vt-####` |
| **Mission outcome** | `complete` / `partial` / `blocked` | Crown | per mission record |
| **Evidence quality** | `PROVEN` / `CLAIMED` / `UNKNOWN` | Herald §10 | per response |
| **Response depth** | `T0` / `T1` / `T2` | Herald | per turn |

## Task lifecycle — the 8 states

`0` Not Started · `1` Started · `2` Nearly Finished · `3` Finished · `4` Urgent ·
`5` Needs Clarification · `6` Deferred · `7` Needs Debugging

As of 2026-09-15 states 5–7 are unused in the corpus and `aiDebugLog` is empty. Populating
7 and its debug log is a required output of the FIX workflow.

## Bindings

- `Nearly Finished` ⇔ mission `partial`
- `Needs Debugging` ⇔ mission `blocked`
- **`Finished` requires PROVEN evidence** (ladder levels 1–3). No exceptions.
- Code existence proves none of: integration, reachability, data ownership, runtime
  correctness, mobile behaviour, deployment, user acceptance.

## Who writes what

Herald **proposes** a status with evidence attached. The Task Authority **disposes**.
No agent, in any application, writes task status directly. There is one ledger.
