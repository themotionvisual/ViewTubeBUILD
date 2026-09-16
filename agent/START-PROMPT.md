# ViewTube conversation start prompt

Paste everything between the rules into the first message of any AI conversation about
ViewTube — ChatGPT, Claude, Gemini, Cursor, Codex, anything. It is self-contained: it works
with no repo access, and gets better with it.

Keep it current with `npm run agent:sync`; it is a source file, not generated.

---

You are working on **ViewTube** (`themotionvisual/ViewTubeBUILD`). Follow the process below
for this entire conversation.

## Context you must not guess at

- `main` is production and auto-deploys to viewtube.live. Never commit to `main` — branch,
  push, open a PR.
- There are **335 remote branches**, **1,598 tasks**, 79 docs, and a `_quarantine/` of prior
  attempts. **Most things I ask for have been attempted before.** Check before building.
- `ViewTube-Task-Index.html` is the **only** task/status authority. You may propose a status
  with evidence; you may never write one, and never start a second list.
- `.gitignore` is deny-by-default (`/*` at line 2). Outside the allow-listed trees a new
  file is **silently untracked** — the commit succeeds and captures nothing. Check with
  `git check-ignore -v <path>` before telling me something is saved.
- Agent clones are shallow: only `main` and the working branch exist locally. Use
  `git ls-remote --heads origin` for branch history — local refs will wrongly say nothing
  exists.

## How to answer

Pick a tier, then include its blocks. When torn, take the higher tier.

| Tier | When | Blocks |
|---|---|---|
| **T0** | no `src/` change, ≤1 file, one-command revert | 1, 9, 10 |
| **T1** | **default** — any `src/`, `server/`, `api/` change, or any new file | 1, 2, 3, 5, 6, 7, 8, 9, 10, 11 |
| **T2** | ≥2 owners · new subsystem · schema/contract change · auth, billing, publishing, OAuth | all 12 |

1. **READBACK** — restate my intent in one sentence, plus what you are assuming and what you
   are deliberately not touching. I should be able to correct you in one line.
2. **PRIOR-ART** — has this already been built? Say what you searched and give a verdict:
   `NOVEL` · `PARTIAL` · `EXISTS (<ref>)` · `FAILED-BEFORE (<ref>)`. The last two stop the
   work — report and ask.
3. **OWNER** — the canonical owner of every path you will touch. If two appear, it is T2.
4. **BETTER-PATH** *(T2)* — the simpler route you considered, and why it loses.
5. **OBSTACLES** — verified blockers, each with the command that proved it.
6. **LEVERAGE-IN** — existing scripts, skills, commands, hooks, MCP servers or CI workflows
   to reuse. If you are still writing something new, one line on why nothing fits.
7. **REFERENCES** — documents, artifacts, standalone HTML and folders to read, each labelled
   `canonical` · `prototype` · `demo` · `recovery` · `quarantined` · `superseded`. Say what a
   reference does **not** prove. A prototype proves nothing about runtime.
8. **LEVERAGE-OUT** — **name one to three GitHub repositories or tools worth adopting for
   this specific task**, with fit (`adopt-now` / `evaluate` / `defer`). Cannot verify one
   exists? Recommend it anyway marked `unverified` with `gh repo view owner/repo`. **Never
   stay silent because you could not check.** "Nothing worth adding" is fine as one explicit
   line.
9. **PLAN** — ordered steps, exact paths, exact commands, and the tests that prove it.
10. **STATUS** —
    ```
    STATUS    complete | partial | blocked
    PROVEN    what a command actually demonstrated — include the command
    CLAIMED   what you believe but did not run
    UNKNOWN   what stays unverified, and why
    CHANGED   paths
    VISUAL    file · route · viewport · branch@sha · live|fixture · auth|anon
    ARTIFACTS the conversation folder things were saved to
    ```
    Never merge PROVEN / CLAIMED / UNKNOWN. Plans are not code; code is not integration;
    integration is not verified runtime; preview is not production.
11. **KNOW** — useful things I did not ask about. Omit the block rather than pad it.
12. **LEDGER** *(T2)* — thread id, related prior turns, task ids touched.

## Evidence

Strongest to weakest: runtime/test · canonical main code · git history · my correction ·
Task Index · active branch · artifact · conversation · memory.

The first three are **PROVEN**; the next four are **CLAIMED**; the last two are **UNKNOWN**.
**Never propose a task as Finished on anything below PROVEN** — use `Nearly Finished`. Code
existing proves nothing about integration, reachability, runtime, mobile or deployment.

## Show me UI changes

Any change to components, views, CSS, widgets, toolboxes or charts: capture the **built app**
at **1440×1000**, plus **390×844** for anything touching mobile geometry, and a before/after
pair when modifying existing UI. State route, viewport, branch@sha, whether data is live or
fixture, and whether you were authenticated.

A screenshot of a prototype, a demo, a design mock, or a page that hit an auth wall or 404 is
**not** evidence. A UI change with no capture is `partial`, never `complete`.

## Save everything — before the turn ends

Nothing stays only in chat. Everything this conversation produces goes to:

```
docs/herald/artifacts/<YYYY-MM-DD>--<short-slug>/
├── README.md         generated index
├── SCREENSHOTS.md    EVERY screenshot embedded inline, in order, one scrollable page
├── screenshots/      the image files
├── documents/        single-version documents and standalone HTML
└── <thing-name>/     a versioned family:
    ├── <thing-name>.html    ← THE CHOSEN VERSION, loose in the folder
    ├── VERSIONS.md          ← which one is canonical and why
    └── variants/            ← every other version, nested
```

- **Two or more versions of the same thing → give it a folder.** The chosen version sits
  **loose** in that folder; **every other variant goes inside `variants/`.** Open the folder
  and the file you see is the one to use.
- **Choose the canonical version by:** an explicit decision first, else most recent, else
  largest. Record the reason in `VERSIONS.md`.
- **Never delete a variant.** A superseded version often records why an approach failed.
- **All screenshots roll up into one `SCREENSHOTS.md`** so I can scroll the whole set at
  once, locally or on GitHub, each with route · viewport · branch@sha · live/fixture · auth.
- Never hand-edit `README.md` or `SCREENSHOTS.md` — regenerate with
  `node scripts/herald-artifacts.mjs index`.
- No secrets in screenshots. Crop or redact tokens, keys and personal data.

If you have no filesystem access, still produce the files as clearly-labelled blocks with
their exact intended paths, so I can drop them straight in.

## Where the full rules live

All in `themotionvisual/ViewTubeBUILD` on `main`:

| What | Path |
|---|---|
| Cross-tool brief (short form of this) | `AGENTS.md` |
| Response contract — the 12 blocks | `agent/contracts/herald-out.md` |
| Turning a vague ask into a brief | `agent/contracts/herald-in.md` |
| Turn loop, thread state, the five gates | `agent/contracts/herald-workflow.md` |
| **Saving and organising artifacts** | `agent/contracts/herald-artifacts.md` |
| Status vocabularies and how they bind | `agent/contracts/status-vocabulary.md` |
| What tools/skills/hooks already exist | `agent/registry/capabilities.md` |
| What docs and artifacts exist, classified | `agent/registry/references.md` |
| Repos already vetted (**verified — cite these when you cannot browse**) | `agent/registry/candidates.md` |
| Saved conversation artifacts | `docs/herald/artifacts/` |
| Canonical owners — 28 systems | `docs/migration/reference/VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json` |
| Architecture and constitution | `docs/architecture/` |
| Why the system is shaped this way | `docs/VIEWTUBE_HERALD_CROSS_APP_AI_CONVERSATION_SYSTEM_PLAN_2026-09-15.md` |

Verify with `npm run typecheck`, `npm run test:focused`, `npm run build`,
`npm run check:architecture`. `npm run lint:runtime` has ~1,800 pre-existing errors on
`main` — inherited debt, not your regression; isolate it, do not chase it.

**Start by giving me the READBACK block, then continue.** Here is what I want:

<!-- your request here -->

---
