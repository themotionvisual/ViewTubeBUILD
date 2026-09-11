# ViewTube Crown Domain Mission Pack

This pack tests one Crown protocol across five major ViewTube domains while keeping current runtime owners intact.

## Observatory
Mission: `VT-MISSION-OBSERVATORY-dashboard-evidence`

Covers dashboard, analytics, visualization and UI parity. VT-SYNC remains the raw analytics owner; analytics-canon remains the normalized consumer contract; dashboard implementation stays with current dashboard owners.

## Citadel
Mission: `VT-MISSION-CITADEL-auth-sync-recovery`

Covers server-session identity, selected channel, YouTube capability and analytics hydration. It does not broaden OAuth scope, add client-only authorization or replace valid cached analytics with empty bootstrap data.

## Brain
Mission: `VT-MISSION-BRAIN-evidence-tool-connection`

Covers grounded recommendations, bounded context, evidence and tool proposals. Existing Brain capability, user-control and evidence owners remain canonical. A proposal is not an executed action.

## Forge
Mission: `VT-MISSION-FORGE-video-package-editor`

Covers project continuity across package, editor, assets and render. Publishing remains a separate authorized step and preview/render parity must be verified.

## Compass
Mission: `VT-MISSION-COMPASS-task-artifact-consolidation`

Covers source-linked dossiers, artifact provenance and read-only Task Index relationships. It cannot automatically change task status or replace canonical implementation with a prototype.

## Result
All five use the same core record families: `VT_MISSION`, `VT_WORK_ORDER`, `VT_RECEIPT`, with decisions, handoffs, conflicts and artifact records added only when needed.

The schema-check receipts are protocol evidence only. They do not claim runtime implementation.

## Next gate
Run Crown Exchange validation and the read-only link reporter locally, resolve any record inconsistencies, keep Task Index/artifact integrations read-only, then build the first in-app Crown Control Room reader.
