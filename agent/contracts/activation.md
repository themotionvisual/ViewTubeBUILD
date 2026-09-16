# Activation — how an agent comes to use this system

Five mechanisms, in descending order of how reliably they fire. Pick by how much the rule
matters, not by convenience.

| # | Mechanism | Fires | Reliability | Cost |
|---|---|---|---|---|
| 1 | **Hooks** (`.claude/settings.json`) | harness runs them | **guaranteed** | needs config |
| 2 | **`CLAUDE.md`** | every Claude Code session here | **automatic** | bloats every session |
| 3 | **`AGENTS.md`** | every session in Codex, Cursor, Gemini, Copilot | **automatic** | same |
| 4 | **Skills** | when the model judges the description relevant | conditional | free until invoked |
| 5 | **Slash commands** | when the user types them | 100% typed / 0% not | user effort |

## The layering rule

An always-on file is charged against every session, so it may only carry rules that must
never be missed. Everything else loads on demand.

```
Hooks            the floor      — what cannot be skipped even by a careless agent
CLAUDE.md        ~20 lines      — the four rules that prevent damage, plus a pointer
AGENTS.md        ~80 lines      — the same for tools that have no skills
Skills           on demand      — the full contract, loaded when relevant
Slash commands   on request     — rituals the user invokes deliberately
```

**Current state (2026-09-16):** 2 and 3 are live. 1, 4 and 5 are not built.

## What belongs where

**Hooks — for anything that must not depend on the agent remembering.**
- `SessionStart` → inject the contract summary and the current thread state
- `Stop` → append the ledger line (turn-loop step 7). This is the fix for the cache that sat
  empty for a year: its write path was a manual gesture, so it never ran.
- `PostToolUse` on Edit/Write → warn when the written path is gitignored

Configure with the `update-config` skill; the harness executes hooks, not the model.

**`CLAUDE.md` — only rules whose absence causes damage.** Currently four: the gitignore
trap, never write task status, separate proven from claimed, check before you build.

**`AGENTS.md` — the same, plus what skills would have carried**, since Codex, Cursor and
Gemini have no skill layer. It is the single highest-leverage file for tools this repo does
not explicitly target.

**Skills — the full contract and the domain specialists.** A skill only fires if its
`description` matches how the work is actually described, so write the description in the
user's words, not the system's.

**Slash commands — deliberate rituals.** `/vt <ask>` runs intake and recon before drafting.

## Telling an agent right now, before the rest is built

Paste this:

```
Read agent/contracts/README.md and agent/contracts/herald-out.md, then follow that
contract for this task. Check agent/registry/references.md and git ls-remote for prior
art before building anything.
```

In a tool with no repo access, paste `AGENTS.md` itself.

## Why not just write a long prompt

Three reasons this repo already demonstrates:

1. **Instructions drift across tools.** `.codex/` and `.claude/` copies of two skills are
   103 and 115 diff lines apart, with no generator keeping them honest.
2. **Instructions cannot see data.** "Has this been built already?" is a question about 335
   branches and 1,598 tasks. No prompt makes a model aware of them; a script must.
3. **Self-reported compliance decays.** The contract holds because the model chose to follow
   it. Hooks are the only mechanism that removes the choice.

Mechanisms 2 and 3 tell an agent the system exists. Only mechanism 1 makes it true.
