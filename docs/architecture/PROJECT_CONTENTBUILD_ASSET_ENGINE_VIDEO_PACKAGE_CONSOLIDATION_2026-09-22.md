# Projects / ContentBuild / Asset Engine / Video Package Consolidation Manifest

Date: 2026-09-22

## Governing invariant

One Project on the creator-facing surface. One ContentBuild identity underneath.

- Project manages planning, tasks, goals, schedule, board state and creator-facing status.
- ContentBuild identifies the durable content lifecycle and owns canonical lifecycle selections/history.
- Video Package specifies the structured video and publication configuration.
- Asset Engine creates, versions, relates, selects and hands off durable work.
- Vault owns durable artifact/media storage.
- Publishing Package and Launch Package are projections, not independent stores.

Identity invariant:

Project.contentBuildId === VideoPackage.contentBuildId === Asset.context.contentBuildId === Editor.contentBuildId === PublishTransaction.contentBuildId

## Current integration baseline

This branch is based on current main. The formerly primary V2 donor is no longer safe to merge wholesale: at audit time it is only 1 commit ahead and 52 commits behind main. Its remaining unique change is documentation-only. Main already contains VideoPackageRepository and the Project/ContentBuild bridge work that earlier audits identified as donor material.

## Capability disposition

| Capability | Canonical owner | Disposition |
| --- | --- | --- |
| Project planning / Board / schedule | Projects | KEEP current main / active Projects work |
| Durable content identity | ContentBuildRepository | KEEP |
| Project -> ContentBuild mapping | ProjectContentBuildBridge | KEEP |
| Video Package persistence | VideoPackageRepository | KEEP as the single repository |
| Video Package -> ContentBuild mapping | VideoPackageContentBuildBridge | KEEP and AUTO-SYNC on save |
| Asset creation/version/variants/lineage | Asset Engine + ContentBuildRepository | KEEP |
| Durable artifacts | Vault | KEEP |
| Tool transport | ActionPacket / handoff | KEEP |
| Publishing configuration | Publishing Package projection | BUILD; no independent database |
| Publication execution | PublishTransaction | CONSOLIDATE unique work only |
| YouTube identity | ContentBuild YouTube binding | KEEP canonical |
| Analytics/comments/experiments/learning | ContentBuild lifecycle writers | BUILD |
| Full Asset Engine Studio | shared ContentBuild/Asset Engine manifestations | BUILD later |

## Donor branch rules

Do not merge stale donor branches wholesale. Port only capabilities absent from current main, with tests and an explicit destination.

- feature/projects-contentbuild-workflow-authority-v2-2026-09-22: documentation parity only unless a fresh diff proves new capability.
- feature/asset-engine-contentbuild-spine: historical donor; PR #293 is already merged. Port only later unique publishing work that is still absent.
- codex/feat/video-package-store-v1: use only migration/recovery concepts not already represented by VideoPackageRepository.
- older Projects / Asset Engine / widget branches: archive after parity certification when they are 0-ahead or their unique capability has a recorded destination.
- active PR #302 Projects-owned files: do not edit in parallel; reconcile after its state is known.

## Integration waves

1. Automatic Video Package -> ContentBuild synchronization.
2. Repository migration/recovery hardening without introducing a second package store.
3. Canonical selections/versions/VariantGroups drive package and UI projections.
4. Publishing Package + Launch Package projections.
5. PublishTransaction consolidation and idempotent YouTube binding.
6. Task-specific Context Resolver + GenerationRequest.
7. Analytics/comment/experiment/evaluation/learning writers.
8. Creator-facing Project facade and shared Project context across specialist tools.
9. End-to-end vertical-slice certification.
10. One consolidation PR to main, then archive superseded branches.

## No-parallel-system acceptance rules

A change fails consolidation if it introduces:
- a second ContentBuild identity for one Project;
- a second Video Package persistence key/repository;
- a separate Publishing Package database;
- tool-local permanent copies of canonical asset selections;
- title/name-based or fuzzy identity matching when contentBuildId is available;
- publication state not traceable to one PublishTransaction and YouTube binding;
- asset versions/variants that cannot be traced to the ContentBuild.

## Vertical-slice proof

Idea -> Project -> ContentBuild -> Video Package -> Research -> Script versions -> Thumbnail variants -> selected thumbnail -> Storyboard -> Video Director -> Editor -> final render -> Publishing Package -> PublishTransaction -> YouTube binding -> analytics checkpoint -> comment/reply -> experiment -> evaluation -> learning.

The same contentBuildId must be recoverable at every stage.
