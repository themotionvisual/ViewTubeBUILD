# HERALD-OUT — the ViewTube response contract

**Status:** canonical source. Generated copies live in `AGENTS.md`, `.claude/skills/`,
`.codex/skills/`, `.cursor/rules/`, `GEMINI.md`. Edit **this** file, then run
`node scripts/herald-sync.mjs`.

Applies to every AI conversation about ViewTube, in every application.

---

## 0. Answer lean — this rule outranks every block below

Blocks describe *what* to cover. This describes *how much*. When they conflict, this wins.

- Fragments, not sentences. Tables and lists, not paragraphs.
- Exact paths and commands, not descriptions of them.
- **No preamble** ("I'll now…", "Let me…"), **no restating the question**, **no summary of
  what you just said**, no closing pleasantries.
- Numbers over adjectives. "343 branches" not "a large number of branches".
- Cite a path; never paste the file.
- **A block with nothing to say is one line or omitted — never padded to look thorough.**
- Exception: **§8 always appears at T1 and T2.** "Nothing worth adding here" is a valid
  one-line answer; omitting the block is not. It was reported missing in real use because
  an earlier draft made silence the compliant response.
- Stop when done.

A thorough answer nobody reads costs the same as a thorough answer that helps. Length is a
cost, not a signal of effort.

---

## 1. Pick the tier first

Mechanical, not discretionary:

| Tier | When | Blocks required |
|---|---|---|
| **T0** | No `src/` change, ≤1 file, reversible in one command | **1, 10** — two lines total |
| **T1** | *Default.* Any `src`/`server`/`api` change, or any new file | **1, 2, 8, 9, 10** + any of 3–7, 11 that earns its place |
| **T2** | Crosses ≥2 canonical owners · adds a subsystem · changes a schema or contract · touches auth, billing, publishing or OAuth | all 12 |

When torn between two tiers, take the higher one — **but adding a block you have nothing
to say in is not thoroughness, it is cost.** Four blocks answered well beat ten padded. A T2 response to a T0 ask is waste;
a T0 response to a T2 ask is how production breaks.

---

### Response ceilings

| Tier | Target | Hard ceiling |
|---|---|---|
| T0 | 2–4 lines | 10 lines |
| T1 | ~20 lines | 60 lines |
| T2 | as needed | say so if you exceed ~150 lines, and why |

Over the ceiling means the tier was wrong, or prose crept in. Cut the prose first.

## 2. The twelve blocks

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

### §3 OWNER — T1 *(when the owner is not obvious)*, T2
Name the canonical owner of every path you will touch. `docs/migration/reference/VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json`
lists 28 systems with owner, status, dependencies and integration rule — start there. If two owners appear, it is T2.
If you cannot name an owner, stop and ask — do not guess.

### §4 BETTER-PATH — T2
The simpler route you considered and why it loses. If the simpler route wins, say so and
take it.

### §5 OBSTACLES — T1 *(when one exists)*, T2
Verified blockers only, each with the command that proved it. Always check:
- `.gitignore` is deny-by-default — will this new file be silently dropped? (`git check-ignore -v <path>`)
- Is the writer lock for these paths free?
- Is `lint:runtime` debt going to mask a real failure?

### §6 LEVERAGE-IN — what we already have — T1 *(when reusing or when writing something new)*, T2

Before writing anything, check **all eight capability surfaces**. Consult
`agent/registry/capabilities.md` first — it is the on-file inventory and is far cheaper
than rediscovering it.

| Surface | Where | Ask |
|---|---|---|
| **Skills** | `agent/skills/` (20 — source), `skills-lock.json` (60 external), built-ins | does a skill already own this? |
| **Sub-agents** | `Explore`, `Plan`, `general-purpose`, `claude-code-guide` | should this fan out instead of running inline? |
| **Slash commands** | `.claude/commands/` (`/vt`) | is this a repeatable ritual worth a command? |
| **Hooks** | `.claude/settings.json` (gitignore guard, ledger) | should this be enforced rather than remembered? |
| **MCP servers** | github · Neon · Vercel · Replit · Google Drive · vidIQ · Claude Code Remote · Claude Docs | is there a tool for this already connected? |
| **Scripts** | `scripts/` (29) | has someone automated this? |
| **npm tasks** | `package.json` (38) | `agent:sync` distributes the contract |
| **CI workflows** | `.github/workflows/` (4) | does a gate already cover this? |

Name what you will reuse. If you are writing something new, say in one line why nothing
above fits — that sentence is what stops the twentieth near-duplicate skill.

### §7 REFERENCES — what to read — T1 *(when a reference matters)*, T2

Name the documents, artifacts, standalone HTML files and folder sets that inform this work.
Check `agent/registry/references.md` first.

**Classify every reference by authority.** This is the whole point of the block:

| Class | Means | Proves |
|---|---|---|
| **canonical** | current owner doc, schema, registry | how it is supposed to work |
| **prototype** | workbench / TSX / standalone HTML | an idea was explored — **nothing about runtime** |
| **demo** | presentation artifact | what was shown, not what ships |
| **recovery** | preservation pack, patch, snapshot | what existed before |
| **quarantined** | `_quarantine/**` | what was removed, and often *why it failed* |
| **superseded** | dated doc a newer one replaced | history; do not plan from it |

*Never treat prototype or demo behaviour as canonical runtime behaviour.* A matching
filename proves nothing. State what each reference does **not** establish.

Cite the exact path and a one-line reason. Link; never paste the contents into the
conversation — a reference the reader must be told about in full is a reference you have
turned into context bloat.

Where the reference is a folder set (`governance/canonical-code-pack/`,
`docs/migration/reference/`, `_quarantine/performance-workflow/`), name the folder and its
entry point (`README_FIRST.md`, `MANIFEST.md`) rather than listing files.

**Quarantine is a first-class source.** "We tried that and quarantined it" is a real and
frequent answer, and it is faster than rediscovering the failure.

**Missing references go on file.** If you needed something that was not indexed, append it
to `agent/registry/references.md` with its class. If you could not find something that
should exist, record the gap there too.

### §8 LEVERAGE-OUT — what we should add — **T1 required**, T2

**Name at least one concrete thing, every T1 and T2 answer.** At T1 give one to three; at
T2 be thorough. "Nothing to recommend" is a valid answer only when you say so explicitly and
in one line — silence is not.

**Start with GitHub repositories.** They are the most common useful answer: a library, a
tool, a skill pack, an action, a reference implementation. Then widen to the rest of the
taxonomy:

- **a skill** (repo-local, or from `skills-lock.json` sources)
- **a sub-agent** for work that should fan out or run isolated
- **a slash command** for a ritual you have now performed twice
- **a hook** for a rule that keeps being forgotten
- **an MCP server** for a system being driven by hand
- **a plugin** bundling several of the above
- **an external repository** or package
- **a CI workflow** for a check being run manually

Each recommendation carries: what it gives **this specific task** · fit (**adopt now** /
evaluate / defer) · caution · verification status.

**Verification labels a recommendation; it never suppresses one.** If you cannot check
whether something exists — no browsing, no network, no repo access — still recommend it,
mark it `unverified`, and hand over the command to check:

```
`owner/repo` — what it gives this task · fit: evaluate · unverified
  verify: gh repo view owner/repo   (or open https://github.com/owner/repo)
```

An omitted recommendation helps nobody. A labelled one that turns out wrong costs a
ten-second check. Never stay silent because you could not verify.

**When you cannot browse, recommend from the registry.** `agent/registry/candidates.md`
holds entries already verified on a stated date. Citing one is accurate without any network
access, and is the preferred move in a tool with no browsing.

**Recommendations go on file.** Append every one to `agent/registry/candidates.md` with its
date, the thread that raised it, and its fit verdict. A recommendation made only in chat is
made again next month and adopted neither time — the same failure mode as the empty cache.
Before recommending, read that file: if it is already listed, cite the existing entry and
either advance its verdict or leave it alone.

**Shape of the block:**

```
§8 LEVERAGE-OUT
· `promptfoo/promptfoo` — declarative evals with CI integration; wires the dormant
  evals.json in viewtube-ai-system-governor. fit: adopt-now · verified 2026-09-15
  (registry: candidates.md)
· `github/gh-aw` — agentic workflows in Markdown + YAML, compiled to Actions; would run
  RECON on PR open. fit: evaluate · caution: technical preview · unverified
  verify: gh repo view github/gh-aw
· a `PostToolUse` hook for the lint rule this diff keeps tripping — cheaper than
  remembering it. fit: adopt-now
```

#### Also propose what to build, and what to retire

Beyond tools, offer durable artifacts when the work suggests one — **a standalone HTML
file**, an audit, a reference document, a research artifact, a skill. And flag one thing
worth **retiring**: overlapping skills to merge, a doc describing an architecture that no
longer exists, a reference whose paths no longer resolve, research since disproved, a branch
with no unique content. Propose; never unilaterally delete. One retirement per conversation
is enough. Full guidance: `herald-curation.md`.

### §9 PLAN — always
Ordered steps with exact paths, exact commands, and the tests that will prove it.
No prose where a command will do.

### §10 STATUS — always
```
STATUS    complete | partial | blocked
PROVEN    <what a command actually demonstrated — include the command>
CLAIMED   <what I believe but did not run>
UNKNOWN   <what stays unverified, and why>
CHANGED   <paths>
VISUAL    <file> · <route> · <viewport> · <branch@sha> · live|fixture · auth|anon
ARTIFACTS <conversation folder these were saved to>
LOG       <conversation-log row updated: yes | n/a>
```
Never merge PROVEN, CLAIMED and UNKNOWN. *Plans are not code; code is not integration;
integration is not verified runtime; preview is not production.*

#### VISUAL — show the change, don't describe it

**Required whenever the diff touches** `src/components/**` · `src/views/**` ·
`src/features/**` UI · any `.css` · widget, toolbox, dashboard or chart files · user-visible
copy. Attach the image in the reply; on a PR, post it to the PR.

**Not required** for `server/`, `api/`, `scripts/`, types, tests or docs — a screenshot of
unchanged UI is noise.

| Change | Minimum |
|---|---|
| Any visible change | desktop **1440×1000** |
| Mobile geometry, responsive, widget height/width | **plus** phone **390×844** — non-negotiable |
| Modifying existing UI | **before/after pair**, same route and viewport |
| Chart or data visual | include the empty, loading and error states |

**A screenshot only counts as evidence (ladder level 1) when it is the built app.**
State route, viewport, branch@sha, auth state, and whether data is live or fixture.

These do **not** count, and must be labelled per §7 REFERENCES:
- a standalone HTML prototype or demo — class `prototype`/`demo`, proves nothing about runtime
- a capture that hit an auth wall, a 404, or an error boundary
- a design mock or a hand-drawn layout
- a desktop shot standing in for a mobile claim

Save every capture into the conversation's `screenshots/` folder and regenerate the
scrollable index with `npm run artifacts:index` — see `herald-artifacts.md`.

Capture with `scripts/capture-phase5-built-ui.mjs` (Playwright; already handles Vercel auth
walls, records `manifest.json`, exits non-zero when nothing rendered), or against the
branch's Vercel preview URL. Images land in `artifacts/` — which is gitignored, so deliver
them in the reply or the PR and keep the JSON manifest with the receipt.

**If you changed UI and did not capture it, say so in UNKNOWN.** "Looks right" is not
evidence, and a UI change with no visual is `partial`, never `complete`.

### §11 KNOW — T1 *(only when you have something)*, T2
Useful things the user did not ask about. Omit the block rather than pad it.

### §12 LEDGER — T2
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
9. **Start from the cache, not from scratch.** Run `npm run brief -- <topic>` before
   re-deriving what is already known: prior conversations, matching branches, registry
   entries. Spend the context once and reuse the conclusion.
10. **Log the conversation.** Keep `meta.json` current in the conversation folder and run
   `npm run log:build`, so `docs/herald/CONVERSATION-LOG.md` shows what happened, where it
   is saved and whether it finished.
11. **Save every artifact before the turn ends.** Documents, standalone HTML and screenshots
   go to `docs/herald/artifacts/<date>--<slug>/` under `herald-artifacts.md`: canonical
   version loose, variants in `variants/`, all screenshots rolled into one scrollable
   `SCREENSHOTS.md`. An artifact left in chat scrollback does not exist.
