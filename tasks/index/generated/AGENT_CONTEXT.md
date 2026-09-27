# ViewTube Task Index — Agent Context

**Generated projection. Do not hand-edit.**

`tasks/index/index.json` + `tasks/index/shards/*.json` are the canonical repo-native task ledger.
Tasks: **1542** · shards: **35** · aliases: **228** · next ID: **vt-2940**

## Truth rules

- Task identity and canonical state live in the structured manifest/shards.
- Imported donor status is `CLAIMED` historical context only.
- `lifecycle: null` means unreconciled, not Not Started.
- Only Task Authority writes canonical task lifecycle/identity changes.
- DONE requires acceptance criteria plus PROVEN task-specific verification evidence.
- Crown / Conversation OS / PRs / documents propose or reference work; they do not create a second ledger.

## Current lifecycle counts

- UNRECONCILED: 1542

## Legacy source priority recovered from donor

1. runtime/test
2. canonical-main-code
3. git-history
4. explicit-user-correction
5. task-index
6. active-branch
7. artifact
8. conversation
9. memory/inference

## Efficient resume

1. Resolve the VT task ID through the manifest and owning shard.
2. Read owner/capabilities/acceptance/evidence/nextAction.
3. Read only the relevant Domain Authority / Mission / receipts.
4. Reconcile current main before trusting legacy status.
5. Submit `viewtube.task-mutation-proposal.v1` to Task Authority for canonical changes.

## Donor memory rules retained

- Use task IDs as stable cross-session references.
- Do not mark complete from conversation claims or code existence alone.
- Controller/visual, analytics, auth, editor, widget, prototype-to-production and recovery work frequently spans multiple branches/artifacts.
- Preserve latest accepted requirement and discard rejected intermediate design directions from canonical task wording.
