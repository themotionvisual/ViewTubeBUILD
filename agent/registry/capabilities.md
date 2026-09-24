# ViewTube capability registry — what is available right now

Read this before proposing anything new. Verified 2026-09-24 for the Editor System addition; the remaining baseline inventory dates from 2026-09-16.
Regenerate with `node scripts/herald-capabilities.mjs` once it exists (phase H1).

## Surface coverage — 3 of 8 in use

| Surface | State | Notes |
|---|---|---|
| Skills | ✅ **in use** | 21 repo · 60 external · built-ins |
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

**Repo (21)** — `.claude/skills/`

| Domain | Skills |
|---|---|
| Coordination | `viewtube-crown` · `viewtube-king-emperor-bridge` · `viewtube-conflict-arbiter` · `viewtube-task-artifact-bridge` |
| Princes | `prince-brain` · `prince-citadel` · `prince-compass` · `prince-forge` · `prince-observatory` |
| Discipline | `viewtube-skill-finder` · `viewtube-solution-finder` · `viewtube-docs-grill` · `viewtube-skill-authoring` · `viewtube-verification-chancellor` |
| Domain | `viewtube-ai-system-governor` · `viewtube-youtube-editor-system` · `viewtube-widget-dashboard` · `viewtube-mobile-widget-system` · `viewtube-toolbox-builder` · `youtube-api-expert` |

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

## Visual evidence — Playwright, already wired

| Asset | Note |
|---|---|
| `scripts/capture-phase5-built-ui.mjs` | Playwright capture; canonical viewports **desktop 1440×1000** and **mobile 390×844**; detects Vercel auth walls and 404s; writes `manifest.json`; exits 2 if nothing rendered |
| `.github/workflows/phase5-built-ui-screenshots.yml` | builds the branch, serves it, captures, uploads as a GitHub artifact |
| `.github/workflows/user-guide-v2-screenshots.yml` | user-guide captures |
| `.github/workflows/phone-branch-preview.yml` | deploys a chosen branch to a Pages preview slot for phone inspection |
| Vercel preview URL | every pushed branch gets one (see `CLAUDE.md`) |
| Chromium + Playwright | preinstalled in remote sessions (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`); never run `playwright install` |
| `run` skill | launches the app to see a change working |

Phone contract: below **768px** every `.vt-dash-cell` spans the full 24-column row. Height
buckets S 150 · M 250 · L 350 · XL 450 · XXL 850. Capture mobile at **390×844**.

⚠️ `artifacts/` is gitignored — deliver images in the reply or the PR; keep the JSON
manifest with the receipt.

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


### Editor-system addition — 2026-09-24

- Lead editor skill: .claude/skills/viewtube-youtube-editor-system/SKILL.md.
- Mirrors: .codex/skills/viewtube-youtube-editor-system/SKILL.md and skills/viewtube-youtube-editor-system/SKILL.md.
- Living authority: docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md.
- Mandatory handoff: every editor-related conversation/agent updates the living authority Update Log.
- Official Remotion Agent Skills are preferred upstream guidance when available; repository vendoring/pinning remains subject to the external skill supply-chain audit.
