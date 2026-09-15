# ViewTube HERALD — Cross-Application AI Conversation System

**Status:** PLAN ONLY — no runtime wiring, no behaviour change.
**Date:** 2026-09-15
**Branch:** `claude/iewtuve-ai-system-aedxj4`
**Base:** `6bab2df` (main @ 2026-09-14)
**Scope:** How every ViewTube AI conversation — in Claude Code, Codex, Cursor, Gemini, Replit, the web app, CI — becomes informed, non-duplicative, chronological and interconnected.

> This document is written **in the response contract it proposes**, as a working example of the format.

---

## §1 READBACK — what you asked for

You want a system that makes every ViewTube-related AI conversation, in every application, maximally powerful, informed, conservative of effort, streamlined, interconnected and chronological — built from agents, prompts, workflows and response templates.

Decomposed into eleven testable requirements:

| # | Requirement | Herald component |
|---|---|---|
| R1 | My prompts become clear, descriptive, oriented | HERALD-IN (intake contract) |
| R2 | Every response restates what I actually want | §1 READBACK block |
| R3 | Every response checks whether it **already exists** across branches | RECON engine → §2 |
| R4 | Every response says whether there is a **better way** | §4 BETTER-PATH |
| R5 | Every response names **obstacles I don't know about** | §5 OBSTACLES |
| R6 | Every response names **prebuilt tools that make it easier** | §6 LEVERAGE-IN |
| R7 | Every response recommends **GitHub repos** worth adopting | §7 LEVERAGE-OUT |
| R8 | Every response gives **exact how-to** detail | §8 PLAN |
| R9 | Status/updates are precise about proven vs claimed | §9 STATUS |
| R10 | I get told useful things I did not ask about | §10 KNOW |
| R11 | Conversations are chronological and interconnected across apps | LEDGER |

**Assumptions I am making** (correct me and the plan changes):
- "All different applications" means the AI coding surfaces you use against this repo, plus the ViewTube app's own Brain — not a new end-user product.
- You want governance over *conversations about the repo*, not a replacement for the Brain runtime that ships to creators.
- Plan first, build second. Nothing here is implemented yet.

**Explicit non-goals:**
- No second sovereign. The Crown constitution already forbids "two competing supreme agents" (`docs/architecture/VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md`). Herald is a **protocol layer**, not an authority.
- No second Task Index, memory store, analytics reader or deployment authority.
- No change to `src/` runtime behaviour in phases H0–H3.

---

## §2 PRIOR-ART — what already exists (do not rebuild)

This is the part most likely to save you months. **A large share of what you described is already built.**

| Asset | Location | Verdict |
|---|---|---|
| Two-sovereign constitution (KING/EMPEROR), conflict levels L0–L3 | `docs/architecture/VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md` | **Exists — reuse as the constitution** |
| 7-stage lifecycle `DISCOVER→SYNTHESIZE→DECIDE→PLAN→EXECUTE→VERIFY→LEARN` | same | **Exists — Herald plugs into it** |
| 5 record types: `VT_MISSION`, `VT_WORK_ORDER`, `VT_RECEIPT`, `VT_DECISION`, `VT_ARTIFACT_RECORD` | same + `docs/architecture/viewtube-crown-protocols.schema.json` | **Exists — Herald emits these, invents none** |
| File-backed handoff bus (missions / work-orders / receipts / decisions / artifacts / handoffs / conflicts) | `.viewtube/exchange/` + `README.md` | **Exists — Phase B materially implemented** |
| Exchange validator | `scripts/validate-crown-exchange.mjs` | **Exists** |
| Chronology snapshot generator (git log + Task Index projection, read-only) | `scripts/generate-crown-today-snapshot.mjs` | **Exists — Herald LEDGER extends it** |
| Cross-record link reporter | `scripts/report-crown-links.mjs` | **Exists** |
| AI-ownership / anti-duplication governance, 17 canonical owners, eval rules | `.claude/skills/viewtube-ai-system-governor/SKILL.md` (152 lines) | **Exists — strongest asset in the repo** |
| Eval fixtures for the governor | `.claude/skills/viewtube-ai-system-governor/evals/evals.json` | **Exists — unwired** |
| 19 ViewTube skills (Crown, 5 Princes, arbiter, chancellor, finders, domain specialists) | `.claude/skills/` | **Exists** |
| Prior-art discipline (`skill-finder`, `solution-finder`, `docs-grill`) | `.claude/skills/viewtube-*-finder`, `-grill` | **Exists — but advisory only, not enforced** |
| External skill supply chain, 60 skills from 12 GitHub sources, hash-pinned | `skills-lock.json` | **Exists** |
| CI release gates (source-governance, focused-contracts, full-suite, static-quality, production-build, local-smoke) | `.github/workflows/release-gates.yml` | **Exists** |

**Conclusion:** Do **not** build a new agent framework. Herald is ~15% new code and ~85% enforcement, distribution and wiring of what you already own.

---

## §3 GAPS AND OBSTACLES — verified in this checkout

Each of these is confirmed by command, not inferred.

### O1 — `.gitignore` is deny-by-default and will silently swallow the system you are building ⚠️ **highest severity**

`.gitignore:2` is `/*`; `docs/*` is re-excluded at line 61; `.claude/` at line 84.

```
$ git check-ignore -v .claude/skills/new-skill/SKILL.md
.gitignore:84:.claude/    .claude/skills/new-skill/SKILL.md
$ git check-ignore -v docs/NEW_PLAN.md
.gitignore:61:docs/*      docs/NEW_PLAN.md
$ git check-ignore -v .viewtube/exchange/missions/new.json
.gitignore:2:/*           .viewtube/exchange/missions/new.json
```

The 31 tracked `.claude/` files and 79 tracked `docs/` files survive only because ignore rules do not apply to already-tracked files — they were force-added.

**Consequence for Herald:** an agent in *any* application that writes a new skill, a new mission record, or a new plan doc will have it **silently dropped at commit time**. The agent reports success; the file never leaves the machine. This single fact would quietly defeat "interconnected across applications."

**Fix (prescribed, Phase H0):** git cannot re-include a child whose parent directory is excluded — the repo's own comment at `.gitignore:59-60` says exactly this. So the rules must change shape, not just gain negations:

```gitignore
.claude/*                 # was: .claude/
!.claude/skills/
!.claude/skills/**
!/agent/
!/agent/**
!/AGENTS.md
!.viewtube/
!.viewtube/**
!docs/herald/
!docs/herald/**
```

### O2 — Cross-application skill mirrors have already fully drifted

```
viewtube-mobile-widget-system : DIFFERENT (103 diff lines)
viewtube-widget-dashboard     : DIFFERENT (115 diff lines)
```

Coverage today: **19** skills for Claude Code, **2** (divergent) for Codex, **0** for Cursor / Gemini / Copilot. There is no `AGENTS.md`. `skills/viewtube-toolbox-builder/` duplicates `.claude/skills/viewtube-toolbox-builder/` byte-for-byte (two copies, no generator), and `skills/viewtube-youtube-auth-api-stabilization/` exists **only** in `skills/` — Claude Code never loads it.

This is the concrete proof that "same rules in every application" is currently false.

### O3 — Prior-art recon is manual against 335 branches

`git ls-remote --heads origin` → **335** branches (134 `fix/`, 69 `feat/`, 24 `codex/`, 20 `refactor/`, 18 `docs/`, 11 `claude/`, …). No human or agent checks 335 branches before proposing work. This is precisely the duplication you are trying to stop, and it cannot be solved by instructions alone — it needs tooling.

### O4 — The clone is shallow and single-branch in agent sessions

```
$ test -f .git/shallow && echo SHALLOW   → SHALLOW
$ git for-each-ref refs/remotes/origin | wc -l   → 2
```

Only `main` and the working branch exist locally. **Any recon design that reads local refs will silently return "no prior art" and be wrong every time.** Recon must use `git ls-remote`, the GitHub API, and bounded `git fetch --depth=1 origin <branch>` on shortlisted candidates only.

### O5 — The canonical Task Index lives outside the repo

`scripts/generate-crown-today-snapshot.mjs` accepts `--task-index=<path>` and degrades to *"Supplied canonical Task Index path is unavailable in this checkout."* Chronology has no in-repo anchor. Needs a decision (see §9 D1).

### O6 — Two npm scripts point at files that do not exist

```
npm run generate:oracle-skill-pack     → scripts/generate-oracle-skill-pack.mjs   MISSING
npm run generate:analytics-sync-backlog → scripts/generate-analytics-sync-backlog.mjs MISSING
```

Both fail immediately. Any agent that trusts `package.json` as a capability inventory is working from a false map.

### O7 — Lint debt makes the quality gate uninformative

`CLAUDE.md` records ~1,800 pre-existing `lint:runtime` errors and that "admin-bypass on merges is the current norm." A gate that always fails teaches every agent and human to ignore it, so Herald must not add gates to that same pile — Herald checks must be **green on main from day one** (see §8 H0).

### O8 — Governance exists but is advisory

`skill-finder`, `solution-finder` and `docs-grill` encode exactly the "check before you build" discipline you want, but nothing *requires* them. Compliance is currently a function of whether a given model remembered to invoke a skill.

---

## §4 BETTER-PATH — why this shape and not the obvious one

**The obvious approach** — write a long master prompt telling every AI to always do the eleven things — fails for three reasons this repo already demonstrates:

1. **Instructions drift across applications.** O2 is the proof: two mirrored files, 103 and 115 lines divergent, with no generator to keep them honest.
2. **Instructions cannot see 335 branches.** R3 ("has this already been built?") is a *data* problem. No prompt makes a model aware of branch `fix/channel-progress-mobile-controller` from eight months ago. Recon must be a script that produces a dossier the model reads.
3. **Uniform verbosity is the waste you asked to eliminate.** Demanding eleven blocks for "fix this typo" burns tokens and trains you to skim — which destroys the blocks that matter.

**Therefore:** a **generated, tiered, tool-backed contract**.

- **Generated** — one source directory, N application targets, drift fails CI (kills O2).
- **Tool-backed** — RECON and LEDGER are scripts producing structured dossiers; the model consumes facts instead of recalling them (kills O3/O4).
- **Tiered** — T0/T1/T2 response depth by task size (serves "conservative and waste-less").

**Rejected alternatives:**
- *A new orchestration framework (LangGraph/CrewAI/OpenHands).* Rejected: Crown already defines the lifecycle and record types; a framework would create the second sovereign the constitution forbids.
- *A temporal knowledge graph (Graphiti) as the chronology store, now.* Rejected for H0–H3: requires Neo4j/FalkorDB and an embedding pipeline. Append-only JSONL gives 90% of the value at ~0 infrastructure. Revisit at H5 (§7).
- *Enforcing the contract via a model-graded CI check.* Rejected initially: non-deterministic gates on top of O7's always-red gate would be ignored. Start with deterministic schema checks.

---

## §5 THE HERALD DESIGN

### 5.1 Constitutional position

```
CREATOR  (final authority — unchanged)
   │
   ├── KING     — desired state   (missions, plans, acceptance)
   ├── EMPEROR  — executable state (work orders, code, receipts)
   │
   └── HERALD   — the voice, not a sovereign
                  · shapes what goes IN to a conversation
                  · shapes what comes OUT of a conversation
                  · records the conversation chronologically
                  · carries the same rules into every application
```

A herald announces and carries messages between courts; it never rules. Herald **owns no paths in `src/`**, decides nothing, and can be deleted without changing runtime behaviour. That is deliberate: it keeps the constitution's "no second supreme agent" rule intact.

### 5.2 HERALD-IN — the prompt intake contract (R1)

Your raw intent is enough; Herald's job is to convert it, visibly, into a structured brief you can correct in one line. The agent restates in this shape **before** doing work:

```
INTENT     one sentence, outcome not method
SURFACE    which app/page/service/skill is affected
TIER       T0 micro | T1 standard | T2 mission
EVIDENCE   what must be true for this to be "done"
NON-GOALS  what I will deliberately not touch
UNKNOWNS   what I will assume unless you say otherwise
```

Two supporting pieces:

- **`/vt` slash command** (Claude Code) / equivalent prompt prefix elsewhere — expands a one-line ask into the brief above and runs RECON before answering.
- **Intent vocabulary** — a fixed verb set so intent is unambiguous across apps: `AUDIT · RECON · PLAN · BUILD · FIX · VERIFY · DOCUMENT · DECIDE · RECOVER`. Each verb maps to a default tier and a required output set.

You never have to write a good prompt. You write what you want; Herald writes the good prompt and shows it to you.

### 5.3 HERALD-OUT — the response contract (R2–R10)

Eleven blocks, tiered so small work stays small.

| § | Block | T0 | T1 | T2 | Answers |
|---|---|:--:|:--:|:--:|---|
| 1 | **READBACK** — restated intent, assumptions, non-goals | ● | ● | ● | R2 |
| 2 | **PRIOR-ART** — already built? branches/PRs/docs/quarantine searched, verdict | | ● | ● | R3 |
| 3 | **OWNER** — canonical owner of every path to be touched | | ● | ● | anti-duplication |
| 4 | **BETTER-PATH** — simpler route considered and why rejected | | | ● | R4 |
| 5 | **OBSTACLES** — verified blockers, incl. repo traps | | ● | ● | R5 |
| 6 | **LEVERAGE-IN** — existing repo scripts/skills/components to reuse | | ● | ● | R6 |
| 7 | **LEVERAGE-OUT** — external repos/packages, with verification status | | | ● | R7 |
| 8 | **PLAN** — ordered steps, exact paths, commands, tests | ● | ● | ● | R8 |
| 9 | **STATUS** — `complete/partial/blocked`, changed paths, **proven vs claimed** | ● | ● | ● | R9 |
| 10 | **KNOW** — useful things you did not ask about | | ● | ● | R10 |
| 11 | **LEDGER** — chronology id + links to prior related turns | | | ● | R11 |

**Tier selection is mechanical, not discretionary:**
- **T0** — no `src/` change, ≤1 file, reversible in one command. (typo, copy, comment)
- **T1** — default. Any `src/`/`server/`/`api/` change, or any new file.
- **T2** — crosses two or more canonical owners, adds a subsystem, changes a schema/contract, or touches auth/billing/publishing/OAuth.

**The §9 STATUS block carries the repo's hardest-won rule** (`VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md`): *plans are not code; code is not integration; integration is not verified runtime; preview is not production.* Every status must separate:

```
PROVEN    <what a command actually demonstrated, with the command>
CLAIMED   <what I believe but did not run>
UNKNOWN   <what remains unverified and why>
```

This is the single highest-value block. It is what turns "status descriptions" into something you can trust.

### 5.4 RECON — the prior-art engine (R3, R6)

`scripts/herald-recon.mjs --topic "<keywords>" [--depth quick|full]`

Pipeline, ordered cheapest-first:

1. **Local semantic sweep** — `docs/`, `docs/architecture/`, `governance/`, `_quarantine/`, `.viewtube/exchange/`, `src/` for existing components and functions.
2. **Branch sweep** — `git ls-remote --heads origin` (not local refs — see O4), fuzzy-match the 335 branch names, rank by recency and token overlap.
3. **Shortlist inspection** — `git fetch --depth=1 origin <branch>` for the top N (default 5) only; diff their touched paths against the proposed paths.
4. **Forge sweep** — GitHub API for PRs/issues matching the topic, including **closed and unmerged** ones (a closed PR is often the record of *why* an approach failed).
5. **Skill sweep** — the 19 local skills plus the 60 in `skills-lock.json`.
6. **Emit** — `.viewtube/herald/recon/<slug>.json` + a markdown digest, with a verdict:
   `NOVEL` · `PARTIAL (n prior attempts)` · `EXISTS (see <ref>)` · `FAILED-BEFORE (see <ref>)`

**Cache:** keyed on topic + `origin/main` SHA, TTL 24h, so repeated asks cost nothing. This is the waste-elimination mechanism.

`FAILED-BEFORE` is the highest-value verdict the engine can return, and no prompt-only system can produce it.

### 5.5 LEDGER — chronology across applications (R11)

Append-only JSONL, one line per conversational turn that changed something:

```
.viewtube/herald/ledger/2026-09-15.jsonl
{"ts":"2026-09-15T14:02:11Z","app":"claude-code","session":"...","tier":"T2",
 "missionId":"VT-MISSION-...","intent":"...","verb":"PLAN",
 "changedPaths":["docs/..."],"status":"complete",
 "recon":"herald/recon/<slug>.json","prev":"<ledger id>","next":"..."}
```

Properties that deliver "interconnected and chronological":
- **Any application can append** — it is a file write, not an API. Codex, Cursor, a CI job and the web app all use the same line format.
- **`prev`/`next` form conversation chains** across applications and across days.
- **`missionId` joins Herald turns to existing Crown records** in `.viewtube/exchange/` — one spine, not a parallel history.
- **Read side reuses what exists** — extend `scripts/generate-crown-today-snapshot.mjs`, which already builds a read-only git-log projection, rather than writing a second reader.

`scripts/herald-ledger.mjs --since 7d --topic brain` renders the chronology for a topic across every application.

Deliberately **not** a memory store. The governor forbids parallel memory authorities; the ledger records *what conversations happened*, never durable creator knowledge.

### 5.6 DISTRIBUTOR — one source, every application (fixes O2)

```
agent/                          ← single source of truth (tracked)
├── contracts/
│   ├── herald-in.md            intake contract
│   ├── herald-out.md           response contract + tier table
│   └── status-vocabulary.md    proven / claimed / unknown
├── skills/                     canonical ViewTube skills (the 19, deduped)
└── targets.json                which target gets which subset

        │  node scripts/herald-sync.mjs
        ▼
AGENTS.md                       cross-agent standard (root)
.claude/skills/**               Claude Code
.codex/skills/**                Codex
.cursor/rules/*.mdc             Cursor
GEMINI.md                       Gemini
.github/copilot-instructions.md Copilot
```

- `herald-sync.mjs --check` fails on any drift → wired into `release-gates.yml` as a **new, always-green** job (not added to the red `static-quality` pile, per O7).
- Resolves the `skills/` ↔ `.claude/skills/` byte-identical duplication and surfaces `viewtube-youtube-auth-api-stabilization`, currently loaded by nothing.
- **`AGENTS.md` is the keystone for "all different applications"** — it is the cross-tool open standard (adopted by 20k+ repositories, formalised Aug 2025 by OpenAI, Google, Cursor, Factory and Sourcegraph), so one generated file covers tools Herald has no explicit target for.

### 5.7 BUDGET — the conservative / waste-less layer

Encoded as hard rules in `herald-out.md`:

1. **Deterministic before model.** If a script can answer it, run the script. (Already governor doctrine; Herald enforces it at conversation level.)
2. **Recon cache before recon.** Never re-scan 335 branches inside a TTL.
3. **Tier honestly.** T2 blocks on a T0 task is waste, not thoroughness.
4. **Just-in-time context.** No full-file dumps where a `sed -n` range answers it; no raw analytics in prompts.
5. **One writer per path.** Existing Crown rule — prevents the most expensive waste of all, two agents editing one file.
6. **Cite, don't restate.** Link `docs/architecture/...`; never paste it into the conversation.

---

## §6 AGENT ROSTER — reuse first, add four

**Reused unchanged (19):** Crown, the five Princes (Observatory, Citadel, Brain, Forge, Compass), conflict-arbiter, verification-chancellor, king-emperor-bridge, task-artifact-bridge, docs-grill, skill-finder, solution-finder, skill-authoring, ai-system-governor, widget-dashboard, mobile-widget-system, toolbox-builder, youtube-api-expert.

**New (4) — deliberately minimal:**

| Agent | Role | Why it cannot be an existing skill |
|---|---|---|
| `viewtube-herald-intake` | Converts raw intent → HERALD-IN brief; assigns tier and verb | No existing skill shapes *input*; all 19 shape output |
| `viewtube-herald-recon` | Runs and interprets the recon dossier; issues the verdict | `solution-finder` reasons over what it is told; nothing gathers across 335 branches |
| `viewtube-herald-scribe` | Writes the LEDGER entry; maintains `prev`/`next` chains | `task-artifact-bridge` is read-only by charter and must stay that way |
| `viewtube-herald-auditor` | Scores a response against the tier's required blocks | Enforcement role; no existing skill audits conversations |

Four new agents against nineteen reused is the ratio the `skill-finder` discipline demands.

---

## §7 LEVERAGE-OUT — external repositories worth adopting

Verified by web search on 2026-09-15. **Adopt none blindly** — §8 H1 includes a supply-chain review step, and the `pr-agent` entry below shows why.

| Repo | What it gives Herald | Fit | Caution |
|---|---|---|---|
| [`agentsmd/agents.md`](https://github.com/agentsmd/agents.md) · [agents.md](https://agents.md/) | The cross-agent instruction standard; 20k+ repos; nearest-file-wins precedence | **Adopt — H1.** The DISTRIBUTOR's primary output format | Format only, no runtime |
| [`github/spec-kit`](https://github.com/github/spec-kit) | Spec-Driven Development templates and workflow; multi-assistant | **Mine for HERALD-IN — H1.** Its spec templates are a proven intake shape | Full SDD adoption would collide with Crown's lifecycle; take the templates, not the methodology |
| [`github/gh-aw`](https://github.com/github/gh-aw) (GitHub Agentic Workflows) | Agentic automation defined in Markdown + YAML frontmatter, compiled to Actions; built for triage, PR review, CI-failure investigation | **Strong — H4.** The natural host for automated RECON on PR open | Technical preview; verify status before depending on it |
| [`promptfoo/promptfoo`](https://github.com/promptfoo/promptfoo) + [`promptfoo-action`](https://github.com/promptfoo/promptfoo-action) | Declarative prompt/agent eval with CI integration | **High — H3.** `viewtube-ai-system-governor/evals/evals.json` already exists and is unwired; this wires it | Now under OpenAI stewardship; MIT, still open source |
| [`humanlayer/humanlayer`](https://github.com/humanlayer/humanlayer) | Deterministic human-approval gates on high-stakes tool calls | **Conceptual now, real at H5.** Directly implements "Creator remains final authority" and the governor's approval-gate rule | Adds a service dependency; the file-backed `VT_DECISION` record may be sufficient |
| [`getzep/graphiti`](https://github.com/getzep/graphiti) | Temporal knowledge graph with provenance and fact-change-over-time; MCP server included | **H5 upgrade path for LEDGER.** Its temporal model matches "chronological" exactly | Needs Neo4j/FalkorDB + embeddings. Do **not** start here — JSONL first |
| [`anthropics/skills`](https://github.com/anthropics/skills) · [`anthropics/claude-plugins-official`](https://github.com/anthropics/claude-plugins-official) | Reference patterns for skill structure and packaging | **Reference — H1.** Validate the 19 skills against official shape | — |
| [`hesreallyhim/awesome-claude-code`](https://github.com/hesreallyhim/awesome-claude-code) | Catalog; notably **greplica** (indexes repo + session transcripts as persistent memory) and **engram** (turns past sessions into reusable guidance) | **Evaluate at H4** — both overlap LEDGER; one may replace part of it | Community catalog; quality varies per entry |
| [`Jamie-BitFlight/claude_skills`](https://github.com/Jamie-BitFlight/claude_skills) | Prior art for one skill source targeting Claude Code, Codex **and** Cursor | **Study before writing `herald-sync.mjs` — H1** | Verify maintenance before depending on it |
| [`systempromptio/awesome-ai-agent-governance`](https://github.com/systempromptio/awesome-ai-agent-governance) | Policy enforcement, audit trails, MCP/Claude Code security | **Reference — H2** for the audit-trail design | Curated list, not a library |
| [`TensorBlock/awesome-mcp-servers`](https://github.com/TensorBlock/awesome-mcp-servers) | Knowledge-management / memory MCP server index | **Reference — H5** | — |
| [`qodo-ai/pr-agent`](https://github.com/qodo-ai/pr-agent) → now [`The-PR-Agent/pr-agent`](https://github.com/The-PR-Agent/pr-agent) | Automated PR analysis and review | **Defer.** Overlaps the Claude Code Review already on this repo | ⚠️ Ownership and naming have churned (Codium → Qodo → community). Exactly the case for verifying before adopting |

---

## §8 PLAN — phased implementation

Each phase is independently mergeable, PR-to-`main`, and reversible. Phases H0–H2 touch no `src/`.

### H0 — Unblock the plumbing *(½ day, prerequisite for everything)*

1. Fix `.gitignore` per O1 so new agent/doc/exchange files are trackable without `git add -f`.
2. Verify with the three `git check-ignore` commands from O1 — all must return not-ignored.
3. Repair or remove the two dead npm scripts (O6).
4. Document in `CLAUDE.md` that `.gitignore` is deny-by-default and which trees are allow-listed.

**Gate:** `git check-ignore` clean on all target paths; `npm run` inventory has no dead entries.

### H1 — Contracts and distribution *(2–3 days, delivers R1, R2, R8, and fixes O2)*

1. Create `agent/contracts/{herald-in,herald-out,status-vocabulary}.md`.
2. Move the 19 skills to `agent/skills/`; dedupe `skills/viewtube-toolbox-builder`; adopt the orphaned `viewtube-youtube-auth-api-stabilization`.
3. Write `scripts/herald-sync.mjs` (generate + `--check`), studying `Jamie-BitFlight/claude_skills` first.
4. Generate `AGENTS.md`, `.claude/skills/**`, `.codex/skills/**`, `.cursor/rules/*.mdc`, `GEMINI.md`, `.github/copilot-instructions.md`.
5. Add a **new** `herald-drift` job to `release-gates.yml` — must be green on `main` at merge (O7).

**Gate:** `node scripts/herald-sync.mjs --check` exits 0; Codex and Claude skill trees byte-identical where shared.

### H2 — RECON and LEDGER *(3–5 days, delivers R3, R6, R11)*

1. `scripts/herald-recon.mjs` — the six-stage pipeline in §5.4. **Must use `git ls-remote`, never local refs** (O4).
2. `scripts/herald-ledger.mjs` — append + render.
3. Extend `generate-crown-today-snapshot.mjs` to fold ledger entries into the chronology.
4. Seed the recon cache against ten known-duplicated topics and measure.

**Gate:** recon on a topic with known prior art (e.g. `channel-progress-mobile-controller`) returns `EXISTS` with the correct branch; full run under 60s warm.

### H3 — Enforcement and evals *(2–3 days, delivers R9)*

1. `viewtube-herald-auditor` skill + `scripts/herald-audit.mjs` — deterministic block-presence check against tier.
2. Wire `promptfoo` over the existing `viewtube-ai-system-governor/evals/evals.json`.
3. Add response-contract cases: does the model produce §2 PRIOR-ART when prior art exists? Does §9 correctly separate proven from claimed?

**Gate:** eval suite runs in CI; baseline recorded; no regression gate until baseline is stable.

### H4 — Automation *(3–5 days)*

1. `gh-aw` workflow: run RECON automatically on PR open, post the dossier as a PR comment.
2. Evaluate **greplica** / **engram** against LEDGER; absorb or reject with a written `VT_DECISION`.

### H5 — Optional depth *(revisit only if H2 proves insufficient)*

Graphiti-backed temporal ledger; HumanLayer approval gates. Both add infrastructure — only justified by measured pain.

---

## §9 STATUS

```
STATUS    complete  (planning deliverable)

PROVEN    · 19 Claude skills, 2 Codex skills, 0 Cursor/Gemini/Copilot  [ls, diff]
          · Codex mirrors drifted 103 and 115 diff lines               [diff]
          · 335 remote branches                                        [git ls-remote | wc -l]
          · clone is shallow; only 2 local remote refs                 [.git/shallow, for-each-ref]
          · new files under .claude/, docs/, .viewtube/ are ignored    [git check-ignore -v]
          · 2 npm scripts reference missing files                      [ls]
          · 60 external skills hash-pinned from 12 sources             [skills-lock.json]
          · Crown lifecycle, 5 record types, exchange bus, validator   [read]
          · all 12 recommended repos exist at the URLs given           [web search 2026-09-15]

CLAIMED   · effort estimates in §8 (judgement, not measurement)
          · that H2's JSONL ledger suffices before H5's graph
          · that the tier table matches how you actually work

UNKNOWN   · where the canonical Task Index lives (O5)
          · which applications beyond Claude Code and Codex you use in practice
          · whether `gh-aw` has left technical preview

CHANGED   docs/VIEWTUBE_HERALD_CROSS_APP_AI_CONVERSATION_SYSTEM_PLAN_2026-09-15.md  (new)
```

---

## §10 KNOW — things you did not ask about

1. **`.gitignore` (O1) is the finding that matters most today.** It is not a Herald problem — it affects every session right now. Work that agents believe they saved may not be in the repository. Worth an independent check of recent sessions.
2. **You already own the hardest part.** `viewtube-ai-system-governor` (152 lines, 17 canonical owners, anti-duplication checks, eval rules) is more rigorous than most production AI governance. The gap is distribution and enforcement, not doctrine.
3. **`evals/evals.json` exists and nothing runs it.** Fastest credibility win in the plan — H3, roughly a day.
4. **335 branches is itself a standing risk.** Independent of Herald, a branch-triage pass using the `git cherry origin/main <branch>` recipe already in `CLAUDE.md` would shrink recon's search space and reduce cost permanently.
5. **`skills-lock.json` is an unreviewed supply chain.** 60 skills from 12 third-party GitHub accounts execute as instructions in your sessions. They are hash-pinned (good), but never reviewed. Worth one audit pass.
6. **The lint debt (O7) is quietly training everyone to ignore CI.** Every new gate inherits that credibility problem. This is why Herald's gates must be green from day one — and why the debt deserves its own PR sooner than it looks.
7. **`_quarantine/` holds `brain-legacy` and `performance-workflow`.** RECON must search it; "we already tried that and quarantined it" is a real and frequent answer.

---

## §11 OPEN DECISIONS

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Where does the canonical Task Index live? (O5) | (a) bring into repo under `docs/herald/` (b) keep external, pass `--task-index=` (c) derive from exchange records | **(a)** — chronology needs an in-repo anchor or it degrades in every fresh clone |
| D2 | Which applications are in scope? | Claude Code + Codex only / + Cursor + Gemini / + Copilot + Replit | `AGENTS.md` covers unknown tools at near-zero cost — generate it regardless |
| D3 | Contract enforcement strength | advisory / deterministic block check / model-graded | **deterministic first** (H3); model-graded only after O7 is resolved |
| D4 | Do H0 as part of this work or as its own PR? | bundled / separate | **separate, first** — it is a repo-wide correctness fix, valuable even if Herald is never built |

---

## §12 NEXT ACTION

Approve the shape, then **H0 as a standalone PR** — it is small, independently valuable, and every later phase depends on it.

**Verification recipe for this document:**

```bash
git ls-remote --heads origin | wc -l                       # 335
diff .codex/skills/viewtube-widget-dashboard/SKILL.md \
     .claude/skills/viewtube-widget-dashboard/SKILL.md | wc -l   # 115
git check-ignore -v .claude/skills/new-skill/SKILL.md      # ignored
ls scripts/generate-oracle-skill-pack.mjs                  # missing
test -f .git/shallow && echo SHALLOW                       # SHALLOW
```
