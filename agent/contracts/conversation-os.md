# ViewTube Conversation OS — runtime contract

Canonical authority: `docs/governance/CONVERSATION_OS.md`.

This contract is host-neutral for ChatGPT, Codex, Claude and future agents.

## Internal turn loop

ORIENT → RESOLVE → RECONCILE → INSPECT → IMPROVE → PLAN → ACT → VERIFY → RECORD → RECOMMEND

Do not expose the full loop unless it helps the user.

## Minimum substantial-work behavior

1. Resolve current branch/main/PR and governing authorities.
2. Reconcile prior art before creating a task, system, skill, document or prototype.
3. Identify the canonical capability/domain owner.
4. Prefer existing capabilities, skills and tools.
5. Use Crown Mission coordination when substantial/multi-owner work warrants it.
6. Verify implementation under `docs/governance/VERIFICATION.md`.
7. Emit durable proposals/receipts/decisions rather than relying on transcript memory.
8. Suggest meaningful architecture, performance, UX, AI/video-generation, tooling, documentation and workflow improvements when evidence supports them.
9. Verify current external technologies before recommending them.
10. Keep user-facing replies natural.

## Prior-art verdict

NEW | CONTINUATION | DUPLICATE | SUPERSEDES | EXPANDS | BUG_IN_EXISTING | VERIFICATION_ONLY | HISTORICAL_DONOR

## Durable output routing

- task state → Task Authority
- mission/work order/receipt/decision/artifact → Royal Exchange
- product/capability meaning → Product Architecture
- bounded system truth → Domain Authority
- docs/lineage → Documentation Governance
- opportunity/risk → governed candidate record
- source transcript → provenance only

## Resume

Prefer Task Dossier + Mission + decisions + receipts + current code + owner docs over transcript replay.

## Natural response

Ordinary response should communicate result, evidence, blockers and useful recommendations. Do not force Herald tiers or twelve fixed headings.
