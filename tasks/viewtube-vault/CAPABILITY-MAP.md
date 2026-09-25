# Capability Map — ViewTube Vault Donor Re-Harvest

**Status:** revised implementation authority  
**Base:** main @ c4a00f0c5960f9d3bb6cc6bec6c410911f2b283c  
**Donor:** uploaded Vault-Tool-main.zip  
**Architecture rule:** reuse user jobs and workflows; rebuild against ViewTube canonical owners.

## Owner map

| Capability family | Canonical owner |
|---|---|
| asset identity, durable metadata, creator organization | Vault |
| work meaning, versions, derivatives, selections, relationships | Asset Engine / ContentBuild |
| project intent, workflow state, board/calendar | Projects |
| AI reasoning, research, refinement | BrainRuntime |
| generation jobs | Video Director |
| timeline/media edit state | VT_E1 |
| deterministic render | Remotion |
| publishing | Publisher |
| cross-tool movement | ActionPacket/Handoff |

## Vault modules

- vault-library
- vault-search
- vault-selection
- vault-quick-look
- vault-import-direct
- vault-import-staging
- vault-intake-jobs
- vault-batch-organize
- vault-batch-transform-handoff
- vault-inspector
- vault-versions
- vault-lineage
- vault-captions-documents
- vault-collections
- vault-smart-collections
- vault-workspace-customization
- vault-dependency-projection
- vault-storage-telemetry
- vault-handoffs

## Matching-tool donor modules

- projects-donor-detail-workspace
- projects-checklist-progress
- projects-vault-linker
- projects-ai-research
- editor-derivative-guard
- editor-batch-transform
- packaging-end-screen-donor
- hook-polish-simulator
- video-manager-donor-interactions
- analytics-report-donor
- editor-shorts-conditional-donor

## Dependency order

vault-library/search/selection
→ quick-look
→ direct + staged intake
→ intake jobs
→ batch organize
→ collections/workspace customization
→ versions/lineage/captions
→ dependency projection/handoffs
→ storage telemetry

Projects upgrades can proceed independently once their canonical schema mapping is frozen.
Matching-tool harvests are separate PRs and must not enlarge Vault ownership.
