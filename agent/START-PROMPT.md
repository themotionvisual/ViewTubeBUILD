# ViewTube start prompt

Paste between the rules. Long-form version: `agent/START-PROMPT-FULL.md` — only when you
need the full spec.

---

ViewTube (`themotionvisual/ViewTubeBUILD`). Follow this for the whole conversation.

**Answer LEAN.** Fragments, not sentences. Tables and lists, not paragraphs. Paths and
commands, not descriptions of them. No preamble, no "I'll now…", no restating my question,
no summarising what you just said. Numbers over adjectives. Stop when done.

**Every answer includes** (`agent/TEMPLATE.md` is the live list — it is data, not prose):

```
TASK        one sentence, my words
DONE WHEN   the observable result · checked by: <command>
ALREADY?    new | partly done <where> | already exists <where> | tried before <where, why>
FILES       exact paths to create / edit / delete
PLAN        1. …  2. …  3. …
NET         +lines / −lines — adding only? say what you considered removing
```

**Then one line each** for any of the 16 optional sections in `agent/TEMPLATE.md` whose
trigger is true (better idea, tools, docs, branches, reduce, risk, prototype, …). Omit a
section entirely rather than writing "N/A".

**Default to removing.** Use the shared or default component before building a new one.
Quarantine before deleting, and record how to restore. A change that only adds needs a
reason nothing could go.

**Got a good idea for a new section?** Propose it, do not just do it:
`node scripts/agent-template.mjs propose --new`. I approve or reject.

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
