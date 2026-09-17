# 50 ideas to improve the ViewTube AI conversation system

Generated 2026-09-17. Grounded in what exists on `main` plus the defects observed in real
use. Effort is rough: **S** hours · **M** a day or two · **L** a week+.

---

## A. Make it measurable — the biggest blind spot

The system cannot currently tell whether it is working. Every other section is guesswork
until this one exists.

| # | Idea | Effort |
|---|---|---|
| 1 | **Block-presence telemetry.** Parse ledger entries for which of the 12 blocks actually appeared per turn. The repo-recommendation failure went unnoticed for a week; this would have caught it on day one. | M |
| 2 | **Recon hit rate.** Count `EXISTS` / `FAILED-BEFORE` verdicts. If prior-art checks never fire, either the corpus is genuinely novel or nobody is searching — and you need to know which. | S |
| 3 | **Duplicate-work counter.** When a PR touches paths another branch already touched, log it. This is the metric the whole system exists to move. | M |
| 4 | **Assumption-miss rate.** Track how often the user corrects the READBACK block. High rate means intake is guessing badly. | S |
| 5 | **Tier-accuracy audit.** Compare declared tier against the actual diff. A T0 that touched `src/` is a contract violation worth counting. | S |
| 6 | **Wire `promptfoo` over the dormant `evals.json`.** It already exists in `viewtube-ai-system-governor/evals/` and nothing runs it. Fastest credibility win available. | S |
| 7 | **A weekly `herald-report`** rolling 1–6 into one markdown page committed to the repo, so trends are visible without a dashboard. | M |

## B. Close what is built but unproven

| # | Idea | Effort |
|---|---|---|
| 8 | **`herald-doctor`** — one command that verifies hooks are loaded, settings parse, skills validate, targets are in sync and the Task Index sidecar exists. Right now nothing proves the hooks fire. | S |
| 9 | **Hook smoke test in CI** — pipe synthetic payloads at both hooks and assert their output, so a refactor cannot silently break them. | S |
| 10 | **Contract size budget.** Fail `check:agent-sync` if `AGENTS.md` exceeds ~10 KB. Always-on files are charged against every session and will bloat without a ceiling. | S |
| 11 | **Golden-transcript tests.** Freeze 5 real asks with ideal responses; diff new model output against them when the contract changes. | M |
| 12 | **A `PreToolUse` guard on `git commit`** that refuses when a staged path is gitignored — the `PostToolUse` warning is advisory and easy to skim past. | S |
| 13 | **Ledger read side** — `herald-ledger --since 7d --topic brain`. The write path exists; nothing reads it back yet, so the chronology is write-only. | M |
| 14 | **Thread files + the five gates** (plan §14.6). Specified in detail, entirely unbuilt; without them resumption across apps is still manual. | L |

## C. Prior art and recon — the highest-value unbuilt piece

| # | Idea | Effort |
|---|---|---|
| 15 | **Build RECON** (plan §5.4). §2 asks agents to search 335 branches by hand, which means in practice they do not. | L |
| 16 | **`vt-####` join-key index.** 1,598 task ids appear across branches, docs and commits. A grep-built index gives precision-1 linking with no embeddings. | M |
| 17 | **Branch triage pass.** 335 branches is itself the problem. Use `git cherry origin/main <branch>` to find which carry no unique content and close them. | M |
| 18 | **Closed-PR mining.** A closed, unmerged PR is the record of an approach that failed — the most valuable and least-read artifact in the repo. | M |
| 19 | **`FAILED-BEFORE` as a first-class verdict** with a dedicated registry, so abandoned approaches are cited rather than rediscovered. | S |
| 20 | **Quarantine search in recon.** `_quarantine/` holds 34 files recording things already tried and removed. | S |
| 21 | **Recon cache with TTL** keyed on topic + `origin/main` SHA, so repeated asks cost nothing. | S |

## D. Artifacts and screenshots

| # | Idea | Effort |
|---|---|---|
| 22 | **Hash-dedupe on `group`.** Identical files across variants should collapse, not accumulate. `reorganize-html-docs.mjs` already hashes. | S |
| 23 | **Contact-sheet thumbnails** in `SCREENSHOTS.md` — a grid at the top linking to full images, so a 40-shot page stays scannable. | M |
| 24 | **Visual diff between variants.** For two HTML versions, render both and produce a side-by-side image. Makes "why is this canonical" self-evident. | L |
| 25 | **GitHub Pages preview for standalone HTML** so an artifact can be opened, not just downloaded. `phone-branch-preview.yml` already does this for branches. | M |
| 26 | **Image budget guard.** Fail CI if the artifact tree grows beyond a threshold; PNGs in git are permanent. | S |
| 27 | **Auto-redact screenshots** — detect token-shaped strings and email addresses before commit. | M |
| 28 | **`herald-shot.mjs`** — capture an arbitrary route on demand. The existing capture script has a fixed six-target list. | S |
| 29 | **Artifact retention policy.** Decide now what happens at 500 conversation folders, before it is urgent. | S |

## E. Task Index — still the weakest link

| # | Idea | Effort |
|---|---|---|
| 30 | **Export and commit the state.** `savedAt: null`, 1,598 tasks, one browser profile. Unrecoverable if lost, five minutes to fix. | S |
| 31 | **JSON sidecar + `task-index.mjs`** (`read` / `set-status` / `add-ref` / `append-debug`) so agents can read and propose without a browser. | M |
| 32 | **Task ↔ commit linking.** Every commit mentioning `vt-####` updates that task's evidence automatically. | M |
| 33 | **Populate the debug log.** Zero entries in a year. Make it a required output of the FIX workflow. | S |
| 34 | **Coverage report** — which of the 1,598 tasks have supporting local material and which have none. | M |
| 35 | **Staleness sweep.** 1,003 tasks sit at Not Started; some are certainly obsolete. A dated review beats a growing list. | M |

## F. Cross-application reach

| # | Idea | Effort |
|---|---|---|
| 36 | **Paste-back protocol.** ChatGPT cannot run scripts. Define an exact block format it emits that you paste into a terminal, so no-filesystem tools still produce real files. | M |
| 37 | **Registries as JSON** alongside markdown, so other tools can parse rather than read prose. | S |
| 38 | **A short START-PROMPT variant** (~1 KB) for mobile and small context windows. | S |
| 39 | **Publish the registries to a raw URL** so a browsing-capable model can fetch `candidates.md` live instead of relying on paste. | S |
| 40 | **Per-tool conformance report.** Measure which apps actually follow the contract; the answer will not be uniform. | M |
| 41 | **A `viewtube-herald-recon` sub-agent** wrapping `Explore` — the one unused Claude Code surface. | M |
| 42 | **MCP server exposing the registries** as tools, so lookups are a tool call rather than a file read. | L |

## G. Cost and waste

| # | Idea | Effort |
|---|---|---|
| 43 | **Context-cost telemetry per tier.** Confirm T0 answers are actually cheap, or discover the tiering is decorative. | M |
| 44 | **Skill invocation stats.** 20 skills exist; some are certainly never triggered. Prune or fix their descriptions. | S |
| 45 | **Deterministic-first audit.** Find places a model call is doing work a script could, which is the governor's own rule applied to itself. | M |
| 46 | **Lint-debt paydown plan.** ~1,800 errors make `static-quality` permanently red, which trains everyone to ignore CI — the credibility problem every new gate inherits. | L |

## H. Safety and governance

| # | Idea | Effort |
|---|---|---|
| 47 | **Audit the 60 external skills** in `skills-lock.json` from 12 third-party accounts. Hash-pinned but never reviewed, and they execute as instructions. | M |
| 48 | **Secret scanning over the artifact tree**, since screenshots and HTML now get committed. | S |
| 49 | **Pin external skills to commit SHAs**, not just content hashes, so provenance survives a force-push upstream. | S |
| 50 | **A "contract changed" review gate.** Edits to `agent/contracts/**` change every future conversation and deserve heavier review than ordinary code. | S |

---

## If you only do five

**30** (export the Task Index — unrecoverable), **6** (wire the evals — one day, proves the
rest), **1** (block telemetry — would have caught the repo-recommendation failure),
**15** (build RECON — makes prior-art real), **8** (`herald-doctor` — proves the system is
actually on).
