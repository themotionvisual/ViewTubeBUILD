# HERALD-OUT — the ViewTube response contract

**Status:** canonical source. Generated copies live in `AGENTS.md`, `.claude/skills/`,
`.codex/skills/`, `.cursor/rules/`, `GEMINI.md`. Edit **this** file, then run
`node scripts/herald-sync.mjs`.

Applies to every AI conversation about ViewTube, in every application.

---

## 1. Pick the tier first

Mechanical, not discretionary:

| Tier | When | Blocks required |
|---|---|---|
| **T0** | No `src/` change, ≤1 file, reversible in one command | 1, 8, 9 |
| **T1** | *Default.* Any `src/`/`server/`/`api/` change, or any new file | 1, 2, 3, 5, 6, 8, 9, 10 |
| **T2** | Crosses ≥2 canonical owners · adds a subsystem · changes a schema or contract · touches auth, billing, publishing or OAuth | all 11 |

When torn between two tiers, take the higher one. A T2 response to a T0 ask is waste;
a T0 response to a T2 ask is how production breaks.

---

## 2. The eleven blocks

### §1 READBACK — always
```
INTENT     one sentence, outcome not method
ASSUMING   what I am assuming unless corrected
NOT DOING  what I am deliberately leaving alone
TIER       T0 | T1 | T2      VERB  AUDIT|RECON|PLAN|BUILD|FIX|VERIFY|DOCUMENT|DECIDE|RECOVER
```

### §2 PRIOR-ART — T1, T2
Has this already been built? State what was searched and the verdict:
`NOVEL` · `PARTIAL (n prior attempts)` · `EXISTS (<ref>)` · `FAILED-BEFORE (<ref>)`

Search order: Task Index (1,598 tasks) → `.viewtube/herald/recon/` cache → `docs/` →
`_quarantine/` → `governance/` → `.viewtube/exchange/` → branches via `git ls-remote`
(**never** local refs — the agent clone is shallow) → closed PRs.

`EXISTS` and `FAILED-BEFORE` stop the work. Report and ask; do not rebuild.

### §3 OWNER — T1, T2
Name the canonical owner of every path you will touch. If two owners appear, it is T2.
If you cannot name an owner, stop and ask — do not guess.

### §4 BETTER-PATH — T2
The simpler route you considered and why it loses. If the simpler route wins, say so and
take it.

### §5 OBSTACLES — T1, T2
Verified blockers only, each with the command that proved it. Always check:
- `.gitignore` is deny-by-default — will this new file be silently dropped? (`git check-ignore -v <path>`)
- Is the writer lock for these paths free?
- Is `lint:runtime` debt going to mask a real failure?

### §6 LEVERAGE-IN — T1, T2
Existing repo scripts, skills, components and functions to reuse. Check `package.json`
scripts, `.claude/skills/`, `scripts/`, `src/components/ui/` before writing anything new.
Two `npm run` entries point at missing files — verify before trusting.

### §7 LEVERAGE-OUT — T2
External repos or packages worth adopting, each with a verification status. Never
recommend from memory alone; verify the repo exists and note when it was checked.

### §8 PLAN — always
Ordered steps with exact paths, exact commands, and the tests that will prove it.
No prose where a command will do.

### §9 STATUS — always
```
STATUS    complete | partial | blocked
PROVEN    <what a command actually demonstrated — include the command>
CLAIMED   <what I believe but did not run>
UNKNOWN   <what stays unverified, and why>
CHANGED   <paths>
```
Never merge these three. *Plans are not code; code is not integration; integration is not
verified runtime; preview is not production.*

### §10 KNOW — T1, T2
Useful things the user did not ask about. Omit the block rather than pad it.

### §11 LEDGER — T2
Thread id, related prior turns, task ids touched.

---

## 3. Evidence ladder

Adopted verbatim from the Task Index `sourcePriority`. Do not invent another.

| Level | Source | Counts as |
|---|---|---|
| 1 | runtime / test | **PROVEN** |
| 2 | canonical main code | **PROVEN** |
| 3 | git history | **PROVEN** |
| 4 | explicit user correction | CLAIMED |
| 5 | Task Index | CLAIMED |
| 6 | active branch | CLAIMED |
| 7 | artifact | CLAIMED |
| 8 | conversation | UNKNOWN |
| 9 | memory / inference | UNKNOWN |

**A task may not be proposed `Finished` on CLAIMED evidence.** Use `Nearly Finished`.

---

## 4. Hard rules

1. **Never write task status.** Propose; the Task Authority disposes. There is one ledger.
2. **One writer per path.** Acquire the lock or wait.
3. **Deterministic before model.** If a script answers it, run the script.
4. **Cite, don't restate.** Link the doc; never paste it into the conversation.
5. **Just-in-time context.** `sed -n` a range; do not dump a file. No raw analytics in prompts.
6. **Missing ≠ zero. Synthetic ≠ live.** Preserve provenance, channel, window, grain.
7. **Never broaden** OAuth scope, billing authority, publishing rights or external writes
   because it makes implementation easier.
8. **End every turn by writing the ledger line.** A turn that wrote no ledger line did not
   happen.
