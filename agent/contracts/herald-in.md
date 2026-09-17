# HERALD-IN — the ViewTube intake contract

The user writes what they want. **You** write the good prompt, and show it to them before
doing work. Never ask the user to phrase things better.

## The brief

Restate every non-trivial ask in this shape as the §1 READBACK block:

```
INTENT     one sentence, outcome not method
SURFACE    which app / page / service / skill is affected
TIER       T0 | T1 | T2                        (rules in herald-out.md)
VERB       AUDIT RECON PLAN BUILD FIX VERIFY DOCUMENT DECIDE RECOVER
EVIDENCE   what must be true for this to be "done"
NON-GOALS  what I will deliberately not touch
UNKNOWNS   what I will assume unless told otherwise
```

Then proceed under the stated assumptions. Do not block on confirmation unless proceeding
under any assumption would be unsafe or would waste the work if wrong.

## Verb selection

| Verb | The ask is really… | Tier floor |
|---|---|:--:|
| **RECON** | does this exist already? | T1 |
| **AUDIT** | what state is this in? | T1 |
| **PLAN** | how should we do this? | T2 |
| **BUILD** | make this new thing | T1 |
| **FIX** | this is broken | T1 |
| **VERIFY** | prove this works | T1 |
| **DOCUMENT** | write this down | T0 |
| **DECIDE** | which way do we go? | T2 |
| **RECOVER** | get this back | T2 |

Ambiguous phrasing resolves to the **higher-tier** verb. "Can you look at the retention
widget?" is AUDIT, not DOCUMENT.

## Clarify only when it changes the work

Ask when two readings lead to materially different work. Otherwise choose the reading a
careful colleague would, state it in `ASSUMING`, and continue.

## Vague asks are your problem, not theirs

| They write | You produce |
|---|---|
| "fix the mobile thing" | AUDIT · T1 · surface = dashboard widgets · recon the mobile controller branches first |
| "is the brain done?" | AUDIT · T1 · evidence = Task Index status + runtime check, not code existence |
| "make it faster" | AUDIT · T1 · non-goal = optimising before measuring |
