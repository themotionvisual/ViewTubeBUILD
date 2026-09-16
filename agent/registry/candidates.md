# Capability candidates — recommendations on file

Every §8 LEVERAGE-OUT recommendation is appended here. Read before recommending: if an
entry exists, cite it and advance its verdict rather than raising it again.

**Verdicts:** `adopt-now` · `evaluate` · `defer` · `rejected` · `adopted` · `superseded`

| Date | Candidate | Kind | For | Verdict | Notes |
|---|---|---|---|---|---|
| 2026-09-15 | [`agentsmd/agents.md`](https://github.com/agentsmd/agents.md) | standard | one instruction file every tool reads | `adopted` | generated from `agent/AGENTS.md` into 4 tool targets |
| 2026-09-15 | [`github/spec-kit`](https://github.com/github/spec-kit) | repo | intake templates | `evaluate` | mine the templates; full SDD collides with Crown |
| 2026-09-15 | [`github/gh-aw`](https://github.com/github/gh-aw) | workflow | auto-recon on PR open | `evaluate` | H4; confirm it has left technical preview |
| 2026-09-15 | [`promptfoo/promptfoo`](https://github.com/promptfoo/promptfoo) | eval | wire the dormant `evals.json` | `adopt-now` | H3; ~1 day, fastest credibility win |
| 2026-09-15 | [`humanlayer/humanlayer`](https://github.com/humanlayer/humanlayer) | service | G3 approval gate | `defer` | `VT_DECISION` records may suffice |
| 2026-09-15 | [`getzep/graphiti`](https://github.com/getzep/graphiti) | memory | temporal ledger | `defer` | H5 only; needs Neo4j/FalkorDB |
| 2026-09-15 | [`anthropics/skills`](https://github.com/anthropics/skills) | reference | validate the 19 skills' shape | `evaluate` | — |
| 2026-09-15 | [`hesreallyhim/awesome-claude-code`](https://github.com/hesreallyhim/awesome-claude-code) | catalog | `greplica`, `engram` overlap LEDGER | `evaluate` | H4; may replace part of it |
| 2026-09-15 | [`Jamie-BitFlight/claude_skills`](https://github.com/Jamie-BitFlight/claude_skills) | repo | prior art for multi-target sync | `evaluate` | read before writing `herald-sync.mjs` |
| 2026-09-15 | [`The-PR-Agent/pr-agent`](https://github.com/The-PR-Agent/pr-agent) | tool | PR review | `defer` | overlaps Claude Code Review; ownership churned |
| 2026-09-16 | `Stop` hook → ledger append | hook | makes turn step 7 mechanical | `adopted` | live in `.claude/settings.json`; writes `.viewtube/herald/ledger/<date>.jsonl` |
| 2026-09-16 | `/vt` slash command | command | intake + recon before answering | `adopted` | `.claude/commands/vt.md` |
| 2026-09-16 | `.claude/settings.json` allowlist | permissions | stop prompting on read-only calls | `adopted` | read-only git/npm calls allow-listed |
| 2026-09-16 | `viewtube-herald-recon` sub-agent | sub-agent | wrap `Explore` over 335 branches | `evaluate` | H2 |
| 2026-09-16 | `ViewTube-Kingdom-Pack` | skill pack | 30 portable skills + mirrors | `evaluate` | prior art for DISTRIBUTOR; verify it still exists |
| 2026-09-16 | `skills-lock.json` supply-chain audit | process | 60 external skills, never reviewed | `adopt-now` | one pass; they execute as instructions |
| 2026-09-16 | `scripts/reorganize-html-docs.mjs` | internal | derived classification + hash dedup for the local corpus | `adopt-now` | **already built**; extract `classifyLane`/`hashFile` into `scripts/lib/corpus.mjs` (**not built**) and reuse read-only (plan §15) |
| 2026-09-16 | embeddings / vector store for corpus search | approach | fuzzy semantic retrieval | `defer` | identifier linking via `vt-####` answers the common case exactly, free and incrementally (plan §15.9) |
| 2026-09-16 | `scripts/herald-shot.mjs` **(not built)** | internal | capture any route/viewport on demand for the VISUAL block | `adopt-now` | thin wrapper over `capture-phase5-built-ui.mjs`; reuse its auth-wall detection and manifest format |
| 2026-09-16 | before/after diff images | internal | make UI regressions obvious at a glance | `evaluate` | pairs with `dashboard-style-snapshot.mjs`, which already snapshots styles |
| 2026-09-16 | `PostToolUse` gitignore guard | hook | catches silently-untracked writes | `adopted` | `.claude/hooks/guard-gitignore.mjs` |
| 2026-09-16 | `scripts/herald-sync.mjs` | internal | one source, every tool; drift fails CI | `adopted` | gated by `npm run check:agent-sync` in source-governance |
