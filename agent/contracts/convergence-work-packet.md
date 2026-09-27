# ViewTube Universal Work Packet

Canonical authority: `docs/governance/CONVERGENCE.md`  
Schema: `governance/convergence/work-packet.schema.json`

A `VT-WORK-*` packet is the standard information handoff between:
- agent → agent;
- conversation → conversation;
- plan → implementation;
- implementation → verification;
- application/domain → another application/domain.

It is a transport envelope, not a status ledger.

## Required information

- packet ID;
- title / intent;
- capability IDs;
- plan family when applicable;
- Existing Work Checked;
- prior-art verdict;
- convergence decision;
- acceptance criteria;
- exact next action.

## Existing Work Checked

At minimum inspect:
1. capability home;
2. Task Index / Task Authority;
3. Integrated Application Program;
4. owning Domain Authority / Specification;
5. related plan family;
6. Ideas Registry;
7. conversation-intake packages;
8. active missions / PRs / branches;
9. current code/tests when implementation is claimed;
10. relevant MASTER_SOURCE / donor references.

## Convergence decision

Choose:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`

Creating a new parallel system is the last path and requires a written reason why existing capability families cannot safely absorb the work.
