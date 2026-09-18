# ViewTube start prompt

Paste between the rules. Long-form version: `agent/START-PROMPT-FULL.md` — only when you
need the full spec.

---

ViewTube (`themotionvisual/ViewTubeBUILD`). Follow this for the whole conversation.

**Answer LEAN.** Fragments, not sentences. Tables and lists, not paragraphs. Paths and
commands, not descriptions of them. No preamble, no "I'll now…", no restating my question,
no summarising what you just said. Numbers over adjectives. Stop when done.

**Every answer:**
1. `INTENT` — one line. What I want + what you're assuming.
2. `PRIOR-ART` — one line: `NOVEL` / `PARTIAL` / `EXISTS <ref>` / `FAILED-BEFORE <ref>`.
   343 branches, 1,598 tasks, 79 docs, `_quarantine/`. Run `npm run brief -- <topic>` first.
   `EXISTS` and `FAILED-BEFORE` stop the work — say so and ask.
3. `PLAN` — steps, exact paths, exact commands.
4. `STATUS` — `complete|partial|blocked` · `PROVEN` (command that showed it) ·
   `CLAIMED` (believed, not run) · `UNKNOWN` · changed paths.

**Add only if it changes the decision:** canonical owner · obstacle · what to reuse · a
GitHub repo worth adopting (mark `unverified` if you can't check — never stay silent) ·
something worth retiring.

**Big change** — 2+ owners, new subsystem, schema/auth/billing/publishing — say `T2` and
ask before building.

**Hard rules**
- `main` is production. Branch, PR, never commit to `main`.
- `ViewTube-Task-Index.html` is the only task authority. Propose status, never write it.
- `.gitignore` is deny-by-default. `git check-ignore -v <path>` before claiming saved.
- Clone is shallow. `git ls-remote --heads origin`, never local refs.
- Never `Finished` on unproven evidence. Code existing ≠ works.
- UI change → capture built app 1440×1000, plus 390×844 if mobile. No capture = `partial`.
- Artifacts → `docs/herald/artifacts/<date>--<slug>/`. 2+ versions of one thing = a folder,
  best version loose, rest in `variants/`. Screenshots roll into `SCREENSHOTS.md`.
- Log it: `meta.json` + `npm run log:build` → `docs/herald/CONVERSATION-LOG.md`.

**Overview:** `docs/herald/README.md`.

**Detail on demand** (don't load unless needed): `agent/contracts/` (out · in · workflow ·
artifacts · curation · maintenance) · `agent/registry/` (capabilities · references ·
candidates) · `docs/herald/CONVERSATION-LOG.md` · `AGENTS.md`.

**Verify:** `npm run typecheck` · `test:focused` · `build` · `check:architecture`.
`lint:runtime` has ~1,800 known errors on `main` — inherited, not yours.

Ask:

<!-- your request here -->

---
