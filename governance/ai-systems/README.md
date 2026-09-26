# ViewTube AI Systems Governance Registry

**Status:** additive governance/control-plane data.  
**Audited main:** `fbc7d25c71fa89c312da32280d9f77182065b42a`

This folder is the machine-readable companion to:

- `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`
- `.claude/skills/viewtube-ai-system-governor/`

It does **not** own Brain runtime data, analytics evidence, Channel Knowledge, Projects/ContentBuild, Vault/Asset Engine, Prompt Registry, Herald, or outcomes. Registry records point to those owners.

## Versioning

- `schemaVersion` = contract version.
- `recordVersion` = individual record edit version.
- `lastAuditedMainSha` = exact repository state against which a status claim was checked.

Never infer current-main integration from PR merge state alone.

## Schema files

- `schemas/authority-record.schema.json`
- `schemas/agent-report.schema.json`
- `schemas/evidence-reference.schema.json`
- `schemas/prompt-reference.schema.json`
- `schemas/managed-action.schema.json`

## Registries

- `registry/systems.json` — canonical system/owner map.
- `registry/capabilities.json` — 14 live Brain capability definitions from `BrainCapabilityRegistry.ts`.
- `registry/plans.json` — current planning authorities and active execution programs.
- `registry/donors.json` — historical branch/PR/document donors and disposition.
- `registry/integrations.json` — cross-owner integration state and current-main verification.

Agents/runs remain projected from Herald rather than copied into a second execution ledger. A dedicated agent-class registry can be added later if it proves useful.

Generated projections must not silently become canonical authority.


## Commands

```bash
npm run test:ai-systems-governance
npm run audit:ai-systems
```

The focused test specifies the health-gate behavior. The audit reads the seed system registry, checks record integrity, competing current owners and referenced repository paths, and exits non-zero on findings.

Claim staleness is implemented as a pure audit primitive; wiring live claims from Herald is a later slice so this governance layer does not create a second work ledger.


## Herald projection

`scripts/audit/ai-systems-herald-projection.mjs` is a **read-only adapter** over existing Herald thread/ledger records.

It projects:
- active thread state / writer locks → AI Systems work claims;
- verified/completed ledger records → completion receipts.

It deliberately does **not**:
- write another repository-work ledger;
- alter Herald thread state;
- mark branch work as present on `main`;
- turn unverified in-progress records into completion receipts.

Run:

```bash
npm run test:ai-systems-herald
```

A projected receipt defaults `mainIntegrationState` to `unknown`; git ancestry/current-code verification must upgrade that state separately.


## 2026-09-26 forward-port status

The original governance stack (#422–#424) was merged only into stacked feature bases, not directly into `main`. This branch forward-ports the governance files onto current main `fbc7d25c71fa89c312da32280d9f77182065b42a`.

Current branch validation:
- 5 registries;
- 41 authority records;
- zero malformed owner/audit/main-state findings;
- zero broken code/doc/test source references;
- current package scripts expose `audit:ai-systems`, `test:ai-systems-governance`, and `test:ai-systems-herald`.

The Herald projection remains read-only and still requires current-main merge before its integration state can be upgraded from branch-only.
