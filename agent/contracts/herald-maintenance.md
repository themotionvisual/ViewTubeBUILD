# HERALD-MAINTENANCE — changing the conversation system itself

Read this before editing anything under `agent/`, `.claude/` or `scripts/herald-*`. The
system is small and mostly generated; the mistakes are all the same three.

## The map

```
agent/                         SOURCE — edit here
├── AGENTS.md                  cross-tool brief
├── START-PROMPT.md            paste-into-any-tool prompt
├── targets.json               where the brief and skills are distributed
├── contracts/*.md             the process itself
├── registry/*.md              what exists: capabilities, references, candidates
└── skills/*/SKILL.md          20 skills

  ↓ npm run agent:sync

AGENTS.md · GEMINI.md · .github/copilot-instructions.md · .cursor/rules/viewtube.mdc
.claude/skills/** · .codex/skills/**        GENERATED — never edit

.claude/settings.json          hooks + permissions
.claude/hooks/*.mjs            the enforcement that makes the contract real
.claude/commands/vt.md         /vt
scripts/herald-*.mjs           sync · artifacts · log · brief · doctor
docs/herald/artifacts/         what conversations produced
docs/herald/CONVERSATION-LOG.md  generated index of every conversation
```

## The three mistakes

1. **Editing a generated file.** `AGENTS.md` at the root, `.claude/skills/**` and
   `.codex/skills/**` are outputs. Your edit will be silently overwritten by the next sync,
   and `check:agent-sync` will fail in CI. Edit `agent/` and run `npm run agent:sync`.
2. **Assuming a new file is tracked.** `.gitignore` is deny-by-default. Allow-listed trees
   are `agent/`, `.viewtube/`, `docs/herald/`, `.codex/`, `skills/` and four `.claude/`
   subdirectories. Anywhere else, `git check-ignore -v <path>` before believing a commit.
3. **Changing the contract without running the gates.** A contract edit changes every future
   conversation. Run `npm run doctor` and the four checks below.

## After any change

```bash
npm run agent:sync        # redistribute the brief and skills
npm run doctor            # is the machinery actually on?
npm run check:agent-sync  # no drift between source and targets
npm run check:artifacts   # artifact folders valid
npm run check:log         # conversation log current
```

`doctor` is the one to run when someone says "the contract isn't working". It checks
sources, generated targets, hooks, the `/vt` command, permissions, the gitignore allow-list
and every gate — and it knows that hooks only load when Claude Code sees `settings.json` at
session start.

## Common edits

| To change | Edit | Then |
|---|---|---|
| The response blocks or tier rules | `agent/contracts/herald-out.md` | sync + check |
| What every tool sees first | `agent/AGENTS.md` | sync |
| The pasteable prompt | `agent/START-PROMPT.md` | nothing — it is a source, not distributed |
| A skill | `agent/skills/<name>/SKILL.md` | sync (frontmatter `name` **must** match the directory) |
| Where skills are distributed | `agent/targets.json` | sync |
| A hook | `.claude/hooks/*.mjs` | pipe a synthetic payload at it; then `/hooks` or restart |
| What exists | `agent/registry/capabilities.md` | check |
| What was recommended | `agent/registry/candidates.md` | advance the verdict, do not re-raise |

## Adding a new contract file

1. Write `agent/contracts/<name>.md`.
2. Add a row to `agent/contracts/README.md`.
3. If every tool must see it, summarise it in `agent/AGENTS.md` — **summarise**, do not
   inline. Always-on files are charged against every session.
4. If a conversation must follow it, add a line to `agent/START-PROMPT.md`.
5. `npm run agent:sync && npm run doctor`.

## Adding a new script

Name it `scripts/herald-<verb>.mjs`, no dependencies, `--check` mode if it can be gated,
never throw on malformed input. Add npm entries, then wire `check:*` into
`.github/workflows/release-gates.yml` under `source-governance` — **but only once it passes
on `main`.** A gate that is red on arrival teaches everyone to ignore gates, which is
already true of `static-quality` and its ~1,800 lint errors.

## The bar for contract changes

A change here alters every future conversation in every tool. Before proposing one:

- Name the observed failure it fixes. "Might be better" is not a reason.
- Say which block, tier or rule changes, and what it costs in context.
- Prefer deleting a rule that is not working over adding one beside it.
- Check whether the failure is a missing rule or a missing *mechanism*. Most are mechanism:
  the repository-recommendation block did not fail because the rule was unclear, it failed
  because the rule was gated to a tier that rarely fires, and because its verification
  clause made silence the compliant answer.
