# ViewTube capability registry — what is available right now

Read this before proposing anything new. Verified 2026-09-16 against this checkout.
Regenerate with `node scripts/herald-capabilities.mjs` once it exists (phase H1).

## Surface coverage — 3 of 8 in use

| Surface | State | Notes |
|---|---|---|
| Skills | ✅ **in use** | 19 repo · 60 external · built-ins |
| MCP servers | ✅ **in use** | 8 connected |
| CI workflows | ✅ **in use** | 4 |
| Scripts | ⚠️ **partial** | 28 present; 2 npm entries point at missing files |
| Sub-agents | ❌ **unused** | 6 types available, 0 project-defined |
| Slash commands | ❌ **unused** | `.claude/commands/` does not exist |
| Hooks | ❌ **unused** | `.claude/settings.json` does not exist |
| Permissions | ❌ **unused** | no allowlist — every tool call prompts |

`.claude/` currently contains only `skills/`. Five of the eight surfaces are untouched, and
three of them are exactly the ones that would make the Herald contract self-enforcing
rather than self-reported.

## Skills

**Repo (19)** — `.claude/skills/`

| Domain | Skills |
|---|---|
| Coordination | `viewtube-crown` · `viewtube-king-emperor-bridge` · `viewtube-conflict-arbiter` · `viewtube-task-artifact-bridge` |
| Princes | `prince-brain` · `prince-citadel` · `prince-compass` · `prince-forge` · `prince-observatory` |
| Discipline | `viewtube-skill-finder` · `viewtube-solution-finder` · `viewtube-docs-grill` · `viewtube-skill-authoring` · `viewtube-verification-chancellor` |
| Domain | `viewtube-ai-system-governor` · `viewtube-widget-dashboard` · `viewtube-mobile-widget-system` · `viewtube-toolbox-builder` · `youtube-api-expert` |

**Orphaned** — `skills/viewtube-youtube-auth-api-stabilization/` is loaded by nothing.
`skills/viewtube-toolbox-builder/` duplicates the `.claude/` copy byte-for-byte.

**External (60)** — `skills-lock.json`, hash-pinned, from 12 third-party GitHub accounts:
`mattpocock/skills` (29) · `ZeroPointRepo/youtube-skills` (12) ·
`nextlevelbuilder/ui-ux-pro-max-skill` (7) · `qu-skills/skills` (3) · 8 others.
⚠️ Never reviewed. Worth one audit pass — these execute as instructions.

**Built-in** — `code-review` · `simplify` · `security-review` · `run` · `init` · `loop` ·
`update-config` · `fewer-permission-prompts` · `claude-api` · `dataviz` · `artifact-*` ·
`skill-creator` · `find-skills` · document skills (`docx` `pdf` `pptx` `xlsx`)

## Sub-agents — available, none defined

`Explore` (read-only fan-out search) · `Plan` (architecture) · `general-purpose` ·
`claude-code-guide` · `claude` · `statusline-setup`

`Explore` is the natural executor for RECON step 3 across 335 branches.

## MCP servers — 8 connected

`github` · `Neon` · `Vercel` · `Replit` · `Google Drive` · `vidIQ` · `Claude Code Remote` ·
`Claude Docs`

`github` is scoped to `themotionvisual/ViewTubeBUILD`. `vidIQ` and the YouTube surface are
covered by the `youtube-api-expert` skill — read it before calling either.

## Scripts — 28

Crown/governance: `validate-crown-exchange` · `generate-crown-today-snapshot` ·
`report-crown-links` · `check-src-governance` · `check-quarantine-integrity`
Release: `release-preflight` · `release-status` · `release-smoke` · `release-verify-live`
Audit: `audit-quick-wins` · `audit-studio-ui-drift` · `dashboard-baseline-report` ·
`check-css-parse` · `privacy-audit-src.sh`

⚠️ **Dead npm entries** — `generate:oracle-skill-pack` and `generate:analytics-sync-backlog`
both reference files that do not exist. Do not treat `package.json` as a capability map
without checking.

## CI workflows — 4

`release-gates.yml` (source-governance · focused-contracts · full-suite · static-quality ·
production-build · local-smoke) · `phone-branch-preview.yml` ·
`phase5-built-ui-screenshots.yml` · `user-guide-v2-screenshots.yml`

⚠️ `static-quality` fails on ~1,800 pre-existing lint errors; admin-bypass is the norm.
Any new gate must be green on `main` at merge or it inherits that irrelevance.

## Highest-value gaps

1. **A `Stop` hook** appending the ledger line. This is the fix for the root cause of the
   empty cache: it makes turn-loop step 7 mechanical instead of remembered. Use the
   `update-config` skill to add it.
2. **A `/vt` slash command** running intake + recon before an answer is drafted.
3. **A permission allowlist** in `.claude/settings.json` — use `fewer-permission-prompts`.
4. **A `viewtube-herald-recon` sub-agent** wrapping `Explore` over the branch corpus.
