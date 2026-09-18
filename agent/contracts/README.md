# ViewTube agent contracts — canonical source

**Starting a conversation in ChatGPT, Gemini or anywhere without repo access?**
Paste [`agent/START-PROMPT.md`](../START-PROMPT.md) as your first message.

Edit these files. Everything else is generated.

| File | Defines |
|---|---|
| `herald-in.md` | How a raw ask becomes a structured brief |
| `herald-out.md` | **The response process** — tiers, the 11 blocks, evidence ladder, hard rules |
| `herald-workflow.md` | Turn loop, thread loop, gates, the nine workflows, skip rules |
| `status-vocabulary.md` | The four status axes and how they bind |
| `../TEMPLATE.md` | **The response and planning sections** — generated from `../template.json`; edit the data, not this |
| `herald-curation.md` | **What to build** (standalone HTML, audits, references, research, skills) **and what to retire** |
| `herald-maintenance.md` | **How to change this system safely** — sources vs generated, the three mistakes, the gates |
| `herald-artifacts.md` | **Where artifacts are saved and how versions are organised** — canonical loose, variants nested, screenshots rolled up |
| `activation.md` | **How an agent comes to use any of this** — the five mechanisms and what belongs in each |

## Registry — `agent/registry/`

| File | Defines |
|---|---|
| `capabilities.md` | On-file inventory of the eight capability surfaces. Read before §6 LEVERAGE-IN |
| `candidates.md` | Every recommendation ever made, with a verdict. Read and append in §8 LEVERAGE-OUT |
| `references.md` | Documents, artifacts, standalone HTML and folder sets, classified by authority. Read before §7 REFERENCES |

## Distribution

Sources live under `agent/`. Everything below is **generated — never edit a target**.

```
agent/AGENTS.md   ──┐                        AGENTS.md
agent/skills/ (20)  ├─ npm run agent:sync ─▶ GEMINI.md
agent/targets.json ─┘                        .github/copilot-instructions.md
                                             .cursor/rules/viewtube.mdc
                                             .claude/skills/**
                                             .codex/skills/**
```

`npm run check:agent-sync` fails on drift and runs in CI under `source-governance`.
It also refuses any `SKILL.md` without valid `name`/`description` frontmatter, or whose
`name` does not match its directory — the defect that kept one skill unloadable.

## Rationale

Full plan, findings and phasing:
`docs/VIEWTUBE_HERALD_CROSS_APP_AI_CONVERSATION_SYSTEM_PLAN_2026-09-15.md`

## Note on tracking

`.gitignore` is deny-by-default (`/*` at line 2), but `agent/`, `AGENTS.md`, `.viewtube/`,
`docs/herald/` and the four `.claude/` agent surfaces are now allow-listed, so files here
track normally. Elsewhere the trap still applies: a `PostToolUse` hook warns when a written
path is ignored, and `git check-ignore -v <path>` is the manual check.
