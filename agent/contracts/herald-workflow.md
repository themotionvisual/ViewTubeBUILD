> **MIGRATION NOTICE — 2026-09-26:** This source is superseded by `docs/governance/CONVERSATION_OS.md` and `agent/contracts/conversation-os.md`. It remains intact below as donor/provenance material pending lossless Removed Archive consolidation. Do not treat it as current authority.

# HERALD-WORKFLOW — the conversation runtime

## The turn loop — every turn, every application

```
1 ORIENT   read thread file + ledger tail + task refs      NEVER SKIP
2 INTAKE   raw ask → brief (herald-in.md); assign verb + tier
3 RECON    prior-art check, cache-first
4 ROUTE    canonical owner + smallest skill set + writer lock
5 ACT      do the work
6 REPORT   emit the tier's blocks (herald-out.md)
7 RECORD   append ledger · update task refs · release lock  NEVER SKIP
```

Steps 1 and 7 are the system. A turn that produced output but wrote no ledger line **did
not happen** — the next ORIENT will not see it. This rule exists because the previous
continuity cache, designed correctly, sat empty for a year: its write path was a manual
browser gesture, so it never ran.

## The thread loop

```
INTENT → RECON → PLAN → EXECUTE → VERIFY → RECORD
           │                          │
           └─ EXISTS: stop here       └─ below PROVEN: back to EXECUTE
```

Thread state lives in `.viewtube/herald/threads/<threadId>.json`:
`verb · tier · stage · taskIds · missionId · owner · writerLock · reconRef ·
openQuestions · nextAction · entries · lastApp · lastTs`

**Resuming in another application = reading that file.** Not replaying a transcript, not
re-running recon, not re-deriving the owner. Typically under 2 KB.

## The five gates

| Gate | Blocks | Rule |
|---|---|---|
| **G1** Prior-art | RECON → PLAN | no plan without a recon verdict |
| **G2** Owner | PLAN → EXECUTE | canonical owner named; writer lock held |
| **G3** Approval | PLAN → EXECUTE | T2 needs explicit creator approval |
| **G4** Evidence | VERIFY → RECORD | `complete` requires PROVEN (levels 1–3); a UI change with no capture is `partial` |
| **G5** Record | end of turn | ledger line written |

A writer lock older than 24h is stale; any app may break it, and must record that it did.

## The nine workflows

| Verb | Stages | Exit gate | Record |
|---|---|---|---|
| RECON | ORIENT → RECON → REPORT | dossier has a verdict | recon dossier |
| AUDIT | ORIENT → RECON → ACT(read-only) → REPORT | every finding has an evidence level | `VT_RECEIPT` |
| PLAN | ORIENT → RECON → PLAN → REPORT | creator approval (G3) | `VT_MISSION` + `VT_WORK_ORDER` |
| BUILD | full loop | focused tests + typecheck + build green **+ visual evidence if UI changed** | `VT_RECEIPT` |
| FIX | ORIENT → RECON → ACT → VERIFY | reproduced → fixed → proved; **before/after shots for visible fixes** | `VT_RECEIPT` + debug-log entry |
| VERIFY | ORIENT → ACT → REPORT | evidence gathered independently | `VT_RECEIPT` |
| DOCUMENT | ORIENT → ACT → REPORT | doc committed **and tracked** | `VT_ARTIFACT_RECORD` |
| DECIDE | ORIENT → RECON → REPORT | creator decision recorded | `VT_DECISION` |
| RECOVER | ORIENT → RECON → ACT → VERIFY | rollback ref preserved first | `VT_RECEIPT` + `VT_DECISION` |

FIX debug-log format — mandatory, one line:
```
tested/changed → observed result → likely cause / next step
```

## When to skip

| Step | Skippable when | Never skip when |
|---|---|---|
| ORIENT | never | — |
| INTAKE | continuing a thread, brief unchanged | new intent, or tier would change |
| RECON | cache <24h **and** `origin/main` unmoved **and** topic unchanged | verb is PLAN, DECIDE, RECOVER |
| ROUTE | thread holds a valid unexpired lock | paths outside the lock |
| VERIFY | T0 only | any `src/`, `server/`, `api/` change |
| VISUAL capture | non-UI diffs only | anything touching components, views, CSS, widgets or charts |
| RECORD | never | — |

The two cheapest steps are the two that may never be skipped, because they are what make
every other step skippable next time.
