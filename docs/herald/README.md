# Herald — the ViewTube AI conversation system

One process for every AI conversation about ViewTube, in every application: Claude Code,
ChatGPT, Codex, Cursor, Gemini, Copilot.

**Problem it solves.** 343 branches, 1,598 tasks, 79 docs, a `_quarantine/` of prior
attempts. Most requests have been attempted before. Conversations rebuilt what existed,
claimed work was saved when a deny-by-default `.gitignore` had dropped it, and left every
artifact in chat scrollback.

## Start a conversation

Paste `agent/START-PROMPT.md` (~600 tokens). In Claude Code, type `/vt <ask>`.

## The answer shape

| | |
|---|---|
| **INTENT** | one line — what's wanted, what's assumed |
| **PRIOR-ART** | `NOVEL` · `PARTIAL` · `EXISTS <ref>` · `FAILED-BEFORE <ref>` — the last two stop the work |
| **PLAN** | steps, exact paths, exact commands |
| **STATUS** | `complete\|partial\|blocked` · **PROVEN** (the command that showed it) · **CLAIMED** (believed, not run) · **UNKNOWN** |

Add canonical owner, obstacles, what to reuse, a repo worth adopting, or something worth
retiring — only when it changes the decision. `T2` (2+ owners, new subsystem, schema, auth,
billing, publishing) gets the full 12 blocks and asks before building.

**Answer lean.** Fragments, tables, paths. No preamble, no restating the ask. Length is a
cost, not a signal of effort.

## Rules that prevent damage

1. `.gitignore` is deny-by-default — `git check-ignore -v <path>` before believing a commit saved it.
2. `ViewTube-Task-Index.html` is the only task authority. Propose status, never write it.
3. Never `Finished` on unproven evidence. Code existing ≠ integrated ≠ verified ≠ deployed.
4. The clone is shallow — `git ls-remote --heads origin`, never local refs.
5. UI change → capture the built app (1440×1000, plus 390×844 for mobile). No capture = `partial`.

## What gets saved

```
docs/herald/
├── CONVERSATION-LOG.md      one row per conversation: name · app · dates · status ·
│                            branch · work done · every document and screenshot
└── artifacts/<date>--<slug>/
    ├── SCREENSHOTS.md       every screenshot inline, one scrollable page
    ├── documents/           single-version documents
    └── <thing>/             2+ versions → best loose, rest in variants/
```

## Commands

| | |
|---|---|
| `npm run brief -- <topic>` | prior conversations, matching branches, registry hits — **run before re-deriving** |
| `npm run doctor` | is the system actually wired? run this when it "isn't working" |
| `npm run agent:sync` | redistribute contracts to every tool |
| `npm run artifacts:group` | sort loose versions into folders |
| `npm run log:build` | regenerate the conversation log |
| `npm run check:cost` | context floor vs budget |

## Layout

`agent/` is the **source**: `AGENTS.md`, `START-PROMPT.md`, `contracts/`, `registry/`,
`skills/` (20). `AGENTS.md` at root, `GEMINI.md`, `.cursor/`, `.claude/skills/`,
`.codex/skills/` are **generated** — edit the source, run `agent:sync`, never edit a target.

Enforcement lives in `.claude/`: a `PostToolUse` hook warns when a written path is
gitignored, a `Stop` hook appends the ledger line, `/vt` runs intake and recon.
Six `check:*` gates run in CI under `source-governance`.

## Cost

Always-on floor is budgeted at **2,500 tokens** and gated by `check:cost`. It was 6,663 —
roughly 200k input tokens across a 30-turn conversation, purely re-reading itself. Anything
added to `CLAUDE.md` or `AGENTS.md` is charged against every turn of every conversation;
detail belongs on demand.

## More

`agent/contracts/README.md` (the full spec) · `agent/contracts/herald-maintenance.md`
(changing this system) · `docs/VIEWTUBE_HERALD_CROSS_APP_AI_CONVERSATION_SYSTEM_PLAN_2026-09-15.md`
(why it is shaped this way).
