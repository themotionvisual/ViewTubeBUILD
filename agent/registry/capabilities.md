# ViewTube capability registry — what is available right now

Read this before proposing anything new. Verified 2026-09-16 against this checkout.
Regenerate with `node scripts/herald-capabilities.mjs` once it exists (phase H1).

## Surface coverage — 7 of 8 in use

| Surface | State | Notes |
|---|---|---|
| Skills | ✅ **in use** | **20** sourced from `agent/skills/`, generated into `.claude/` and `.codex/` · 60 external · built-ins |
| MCP servers | ✅ **in use** | 8 connected |
| CI workflows | ✅ **in use** | 4 · `check:agent-sync` gates contract drift |
| Scripts | ✅ **in use** | 29 · no dead npm references |
| Hooks | ✅ **in use** | `PostToolUse` gitignore guard · `Stop` ledger append |
| Slash commands | ✅ **in use** | `/vt` — intake + recon before answering |
| Permissions | ✅ **in use** | read-only allowlist in `.claude/settings.json` |
| Sub-agents | ❌ **unused** | 6 types available, 0 project-defined — `Explore` is the natural RECON executor |

`.claude/` now holds `skills/`, `settings.json`, `hooks/` and `commands/`. The two hooks are
what make the contract self-enforcing rather than self-reported: the guard catches the
deny-by-default `.gitignore` at write time, and the `Stop` hook writes the ledger line
without anyone remembering to.

## Skills

**Repo (19)** — `.claude/skills/`

| Domain | Skills |
|---|---|
| Coordination | `viewtube-crown` · `viewtube-king-emperor-bridge` · `viewtube-conflict-arbiter` · `viewtube-task-artifact-bridge` |
| Princes | `prince-brain` · `prince-citadel` · `prince-compass` · `prince-forge` · `prince-observatory` |
| Discipline | `viewtube-skill-finder` · `viewtube-solution-finder` · `viewtube-docs-grill` · `viewtube-skill-authoring` · `viewtube-verification-chancellor` |
| Domain | `viewtube-ai-system-governor` · `viewtube-widget-dashboard` · `viewtube-mobile-widget-system` · `viewtube-toolbox-builder` · `youtube-api-expert` |

**Source of truth is `agent/skills/` (20).** `.claude/skills/` and `.codex/skills/` are
generated — never edit them; edit the source and run `npm run agent:sync`.
`viewtube-youtube-auth-api-stabilization` was loaded by nothing because it had **no YAML
frontmatter**; it now has valid frontmatter and is live. The byte-identical duplicate under
`skills/` is gone. `herald-sync` refuses to generate from a SKILL.md whose frontmatter is
missing, or whose `name` does not match its directory.

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

Both dead entries (`generate:oracle-skill-pack`, `generate:analytics-sync-backlog`) have
been removed. `npm run agent:sync` / `check:agent-sync` distribute and gate the contract.

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

## Remaining gaps

1. **A `viewtube-herald-recon` sub-agent** wrapping `Explore` over the 335-branch corpus (H2).
2. **`scripts/herald-shot.mjs`** *(not built)* — on-demand capture of an arbitrary route for the VISUAL
   block; `capture-phase5-built-ui.mjs` has a fixed six-target list.
3. **Corpus discovery** (`herald-scan` / `herald-find`) for the local file corpus — plan §15.
4. **Thread files and gate enforcement** (`herald-thread`, `herald-audit`) — plan §14.6.
5. **An audit of the 60 external skills** in `skills-lock.json`; they execute as instructions.
