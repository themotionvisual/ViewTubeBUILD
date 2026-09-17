# ViewTube agent contracts — canonical source

Edit these files. Everything else is generated.

| File | Defines |
|---|---|
| `herald-in.md` | How a raw ask becomes a structured brief |
| `herald-out.md` | **The response process** — tiers, the 11 blocks, evidence ladder, hard rules |
| `herald-workflow.md` | Turn loop, thread loop, gates, the nine workflows, skip rules |
| `status-vocabulary.md` | The four status axes and how they bind |

## Registry — `agent/registry/`

| File | Defines |
|---|---|
| `capabilities.md` | On-file inventory of the eight capability surfaces. Read before §6 LEVERAGE-IN |
| `candidates.md` | Every recommendation ever made, with a verdict. Read and append in §8 LEVERAGE-OUT |
| `references.md` | Documents, artifacts, standalone HTML and folder sets, classified by authority. Read before §7 REFERENCES |

## Distribution

```
agent/contracts/  ──  node scripts/herald-sync.mjs  ──▶  AGENTS.md
                                                         .claude/skills/
                                                         .codex/skills/
                                                         .cursor/rules/
                                                         GEMINI.md
                                                         .github/copilot-instructions.md
```

`herald-sync.mjs --check` fails on drift. It is not built yet (phase H1) — until it is,
the generated copies will drift, exactly as `.codex/` already has (103 and 115 diff lines).

## Rationale

Full plan, findings and phasing:
`docs/VIEWTUBE_HERALD_CROSS_APP_AI_CONVERSATION_SYSTEM_PLAN_2026-09-15.md`

## Note on tracking

`.gitignore` is deny-by-default (`/*` at line 2). These files required `git add -f`.
Until phase H0 adds `!/agent/` and `!/agent/**` to the allow-list, **every new file here
will be silently untracked**. Verify with `git check-ignore -v <path>` before assuming a
commit captured your work.
