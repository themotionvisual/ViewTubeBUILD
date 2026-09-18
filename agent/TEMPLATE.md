# Response and planning template

<!-- GENERATED from agent/template.json — edit that, then `npm run template:render` -->

## Rules

1. A section appears only if it changes what the user does next. No empty headings, no 'N/A', no padding.
2. Required sections always appear. Optional sections appear when their 'when' is true.
3. Prefer removing code to adding it. Use the shared or default component before building a new one.
4. Quarantine before deleting. Record where it came from and how to restore it.
5. Separate what you ran and observed from what you believe but did not run.
6. Link to files; do not paste them into the conversation.
7. A prototype or demo proves nothing about what actually runs.

## Every response includes

| Section | What it says |
|---|---|
| `TASK` | Restate the task in one plain sentence, in the user's words. |
| `DONE WHEN` | The observable thing that will be true, and how it gets checked. |
| `ALREADY?` | Whether this was built before: new | partly done | already exists | tried and stopped. |
| `FILES` | Exact paths to create, edit or delete. |
| `PLAN` | Numbered steps with the commands that prove each one. |
| `NET` | Lines added vs removed. Adding only? Say what was considered for removal. |

```
TASK        Add rate limiting to the upload endpoint.
DONE WHEN   Uploads over 10/min return 429 · checked by: npm run test:upload
ALREADY?    partly done — middleware/rateLimit.ts exists, not wired to uploads
FILES       edit routes/upload.ts · edit middleware/rateLimit.ts
PLAN        1. Wire limiter  2. Add 429 test  3. npm run test:upload
NET         +42 / −118 (removed the duplicate limiter)
```

## Response sections used only when they apply

One line each, no heading, omitted entirely when not true.

| Section | Trigger | What it says |
|---|---|---|
| `BETTER IDEA` | **when** a simpler route exists than the one asked for | The simpler route and why it might win. |
| `TOOLS` | **when** an existing library or tool would do this job | 2–3 GitHub projects, what each gives THIS task, marked unverified if unchecked. |
| `DOCS` | **when** a document, spec, audit or design file matters here | Files to read, each marked current / outdated / prototype / demo, and what it does not prove. |
| `BRANCHES` | **when** branches or PRs relate to this task | Related branches and closed PRs with dates — what was tried before. |
| `REDUCE` | **when** duplicates, unused code or near-copies were found | What can be merged, quarantined or deleted instead of added to. |
| `RISK` | **when** a real blocker was verified | The blocker and the command that proved it. |
| `PROTOTYPE` | **when** seeing it beats reading about it | A small standalone HTML file or demo worth building first, and what it should leave out. |
| `OWNER` | **when** it is unclear which part of the codebase owns these files | Who or what owns each path, so two changes do not collide. |
| `TESTS` | **when** the changed files have tests, or conspicuously do not | Which tests cover this, or that none do. |
| `ROLLBACK` | **when** the change is hard to undo | How to reverse it. |
| `COST` | **when** the work is large or open-ended | Rough effort and where it might overrun. |
| `SKILL` | **when** the same guidance has come up three times | A reusable skill, rule or command worth saving. |
| `TASK` | **when** this maps to a tracked task id | The task id, and the status being proposed with its evidence. |
| `SAVED` | **when** files, docs or screenshots were produced | Where they were saved. |
| `RETIRE` | **when** something outdated, duplicated or wrong was noticed | One thing worth deleting, merging or correcting. |
| `UNFINISHED` | **when** work remains | What is left and what would unblock it. |

## Every plan file includes

| Section | What it says |
|---|---|
| `Goal` | One sentence: what this task achieves. |
| `Done when` | The observable result and the command that checks it. |
| `Steps` | Checkboxes, ticked as work proceeds. |
| `Before → After` | Real evidence: behaviour, line counts, screenshots. |
| `Status` | in progress | finished | blocked | abandoned, plus branch and date. |

## Plan sections used only when they apply

| Section | Trigger | What it says |
|---|---|---|
| `Prior work` | **when** earlier attempts exist | Branches, PRs and files from previous attempts. |
| `References` | **when** documents inform the work | Docs, audits, designs — with what each does not prove. |
| `Decisions` | **when** a choice was made between options | What was chosen and why the alternative lost. |
| `Risks` | **when** something could go wrong | What might break and the early warning sign. |
| `Reduction` | **when** code was removed, merged or quarantined | What went, where it went, and how to restore it. |
| `Follow-ups` | **when** work is deliberately deferred | What was left out on purpose. |

## Suggesting a new section

Agents may propose sections; they are added only with the owner's approval.

```bash
node scripts/agent-template.mjs propose --new   # print the shape
node scripts/agent-template.mjs pending         # what is waiting
node scripts/agent-template.mjs approve <id>    # owner accepts
node scripts/agent-template.mjs reject <id> "reason"
```
