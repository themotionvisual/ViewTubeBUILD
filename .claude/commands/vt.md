---
description: Run ViewTube intake + prior-art recon, then answer under the Herald contract
---

Handle this request under the ViewTube Herald contract: **$ARGUMENTS**

## 1. Load the contract
Read `agent/contracts/herald-out.md`. Read `herald-workflow.md` too if this looks like T2.

## 2. Intake (`herald-in.md`)
Produce the brief before doing any work:
```
INTENT     one sentence, outcome not method
SURFACE    app / page / service / skill affected
TIER       T0 | T1 | T2
VERB       AUDIT RECON PLAN BUILD FIX VERIFY DOCUMENT DECIDE RECOVER
EVIDENCE   what must be true for this to be done
NON-GOALS  what I will not touch
UNKNOWNS   what I assume unless told otherwise
```

## 3. Prior art — before proposing anything
Search in this order, stopping when the answer is clear:
1. `agent/registry/references.md` — the classified index
2. `docs/`, `docs/architecture/`, `governance/`, `_quarantine/`
3. `git ls-remote --heads origin` — **335 branches; never read local refs, the clone is shallow**
4. `agent/registry/capabilities.md` — does a script, skill or hook already do this?

Report the verdict: `NOVEL` · `PARTIAL` · `EXISTS (<ref>)` · `FAILED-BEFORE (<ref>)`.
`EXISTS` and `FAILED-BEFORE` stop the work — report and ask.

## 4. Owner
Name the canonical owner of every path you will touch.
`docs/migration/reference/VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json` lists 28 systems.

## 5. Answer in the tier's blocks
Per `herald-out.md`. Always separate `PROVEN` / `CLAIMED` / `UNKNOWN`, and never propose
`Finished` on CLAIMED evidence.

If you changed UI, capture it (1440×1000, plus 390×844 for mobile geometry) — a UI change
with no capture is `partial`.

Before claiming a file is committed, run `git check-ignore -v <path>`.
