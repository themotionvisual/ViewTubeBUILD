# HERALD-CURATION — what to build, and what to retire

Every conversation adds. Almost none subtract. Left alone that produces what this repo
already has: 343 branches, 79 docs, 60 unreviewed external skills, and prototypes sitting
beside canonical architecture with nothing marking the difference.

This contract covers both halves: proposing durable artifacts worth creating, and proposing
the retirement of things that are wrong, stale or duplicated.

---

## Part 1 — Proactively propose durable artifacts

When the work suggests one, offer it. One line is enough; do not build it unasked.

### Standalone HTML — the highest-value format here

This repo already runs on standalone HTML: the Task Index (1,598 tasks), widget libraries
v10–v12, the Crown Control Room, editor prototypes. They work because a single file opens
anywhere, needs no build, and survives being emailed to yourself.

**Propose one when** a thing is easier to *use* than to read about: an inventory to filter,
a matrix to compare, a gallery to scan, a flow to click through, a calculator, a decision
tree, a spec you want to tick through.

**A good one includes:**

- **Everything inline.** One file — CSS, JS and data embedded. No build step, no CDN that
  will 404 in a year, no network dependency. It must work from `file://`, offline, forever.
- **A self-describing header** — what it is, what it was generated from, and the date. In
  six months this is the difference between a useful artifact and a mystery file.
- **The data as a JSON block near the top**, so it can be regenerated or re-read by a script
  rather than scraped out of the DOM.
- **Search, filter and sort** when there is more than ~20 of anything.
- **State in `localStorage`, plus explicit export/import.** Never rely on `localStorage`
  alone — that is exactly how the Task Index ended up with `savedAt: null` and a year of
  state in one browser profile.
- **Works at phone width** (390px) as well as desktop. Check child overflow, not just page
  width.
- **Keyboard reachable**, real `<button>`s, visible focus.
- **A footer stating provenance** — source commit, generator script, what it does *not*
  cover.

**Avoid:** a second authority for data another system owns; anything needing a server;
anything whose value dies when the data goes stale, unless it says so plainly.

### Audits

Propose when a claim is repeated but never verified, when a subsystem's real state is
unknown, or before any consolidation. An audit states its **method**, its **scope**, what it
**could not check**, and a finding table with evidence per row. An audit with no
"not checked" section is not an audit.

### Reference documents

Propose when the same question has now been answered twice. A reference states what is true,
who owns it, and how to verify it — not how it came to be. Keep the narrative in the plan
and the conclusion in the reference.

### Research artifacts

Propose when a decision needs evidence that does not exist yet: a comparison, a spike, a
benchmark, a survey of prior art. Record the question, the method, the data, and the answer
**including the null result**. "We tried X and it did not work" is the most valuable and
least-written artifact in any repository.

### Skills

Propose a skill when guidance has been repeated in three conversations, is repo-specific,
and would change what an agent does. Use `viewtube-skill-finder` first, `viewtube-skill-authoring`
to write it. A skill that merely restates general knowledge is noise in every future session's
context budget.

---

## Part 2 — Propose retirement

Adding is cheap and subtracting is not, which is why nothing gets subtracted. Make it part
of the work.

**Flag for retirement when you encounter:**

| Signal | Action |
|---|---|
| Two skills whose descriptions overlap enough that the model picks arbitrarily | propose a **merge**, keeping the clearer wording and every unique rule |
| A skill never invoked since it was written | propose **fixing its description** first, deleting second |
| A doc describing an architecture that no longer exists | propose **marking it `superseded`** in `references.md`, pointing at what replaced it |
| A doc contradicting a newer one | propose **reconciling them**, and say which wins |
| A reference whose paths no longer resolve | propose **correcting or removing** it — a registry that lies is worse than none |
| Research whose conclusion has since been disproved | propose **annotating it**, never silently deleting |
| A branch with no unique content (`git cherry origin/main <branch>` shows no `+`) | propose **closing** it |
| A prototype presented as if canonical | propose **reclassifying** it per §7 |

**Rules for retirement:**

1. **Propose; do not unilaterally delete.** Retirement is the creator's call. State the
   evidence and the recommendation.
2. **Annotate before deleting.** A wrong document that says *why* it is wrong teaches more
   than a missing one. Prefer `superseded` over removal.
3. **Never delete the only record of a failure.** That is the one thing nobody can
   reconstruct.
4. **Merging keeps every unique requirement.** Move details into the survivor before
   superseding the duplicate.
5. **One retirement per conversation is enough.** This is background curation, not a project.

Record accepted retirements in `agent/registry/references.md` (reclassify) or
`candidates.md` (verdict `superseded`), so the decision survives the conversation.
