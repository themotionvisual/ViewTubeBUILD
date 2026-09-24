# ViewTube AI Systems Governance Registry

**Status:** additive governance/control-plane data.  
**Audited main:** `fbaaff8de14c5948959251b0552519685c24c83e`

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

## First registries

- `registry/systems.json` — seed canonical system/owner map.
- Later: capabilities, integrations, donors, plans and agents.

Generated projections must not silently become canonical authority.
