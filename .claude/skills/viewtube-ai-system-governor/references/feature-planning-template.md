# Integrated ViewTube feature brief

## 1. Goal

- User/persona:
- Natural-language goal:
- Trigger/entry surface:
- Desired result:
- Time horizon:
- Non-goals:

## 2. Current-state audit

- Repository/branch/commit:
- Existing tools/surfaces:
- Existing canonical registries/contracts:
- Current data flow:
- Relevant tests and their status:
- Authority conflicts or stale references:

## 3. Capability contract

| Concern | Decision |
|---|---|
| Canonical owner | |
| Inputs/schema | |
| Outputs/schema | |
| Identity keys | ContentBuild/project/asset/job/remote IDs |
| Evidence/context | |
| Permissions/capabilities | |
| Sync/async lifecycle | |
| External side effects | |
| Reversibility/rollback | |
| Provenance/audit | |

## 4. End-to-end workflow

1. Goal entry:
2. Context/evidence resolution:
3. Project/ContentBuild binding:
4. Proposal/plan:
5. Approval boundary:
6. Execution/API/job:
7. Asset/provenance registration:
8. Editor/widget/dashboard integration:
9. Quality gate:
10. Export/package/publish:
11. Outcome/evaluation/learning:

## 5. Integration map

- BrainRuntime/context:
- Analytics/evidence:
- ContentBuild/project:
- Asset Engine/Vault:
- Editor/timeline/Remotion:
- Video Director/job worker:
- YouTube/auth/typed APIs:
- Packaging/publisher:
- Dashboard/widget/toolbox:
- Settings/permissions:
- Chat/handoffs:
- Sync/data table/visuals:

## 6. UI design

- Surface classification: page / Studio Hub / Toolbox / Subtoolbox / widget / editor sidecar / settings / chat
- Existing primitives/components to reuse:
- Canonical shell/tokens/motion:
- Main happy path:
- Connected state:
- Disconnected/auth-required state:
- Loading/progress state:
- Empty/no-data state:
- Partial/unsupported state:
- Error/retry/cancel state:
- Success/next-best-action state:
- Mobile/touch behavior:
- Keyboard/screen-reader behavior:
- Reference Library/certification updates:

## 7. Implementation slices

| Slice | Owner | Paths/contracts | Depends on | Verification |
|---|---|---|---|---|
| Context/evidence | | | | |
| Project/schema | | | | |
| AI/proposal | | | | |
| API/YouTube | | | | |
| Job/worker | | | | |
| Asset/provenance | | | | |
| Editor/render | | | | |
| UI surface | | | | |
| Tests/docs | | | | |

## 8. Acceptance criteria

- [ ] Goal can be completed from the intended entry surface.
- [ ] One canonical identity is preserved end to end.
- [ ] AI output is structured, bounded, attributable, and reviewable.
- [ ] External writes are authorized, idempotent, recoverable, and auditable.
- [ ] Generated assets enter canonical provenance before durable use.
- [ ] Preview and final render use the same contracts.
- [ ] Connected/disconnected/loading/empty/partial/error/success states exist.
- [ ] Desktop/mobile/accessibility behavior is verified.
- [ ] Focused tests, build, smoke, and relevant governance checks pass or known debt is separated.
- [ ] Living authorities, registries, and update logs are current.

## 9. Risks / rollback / open questions

- Risks:
- Migration seam:
- Rollback:
- Open architectural questions:
- Explicit approval required for:
