# ViewTube Controlled Release Runbook

## Canonical path

`localhost:5173` → feature/integration branch → GitHub pull request → Vercel
preview → explicit user merge approval → protected `main` → `viewtube.live`.

The merge action is production authorization. Pushing a branch or receiving a
green preview is not authorization.

## Local preparation

1. Work only on a branch other than `main`.
2. Run `npm run release:status` and verify the checkout, upstream, `origin/main`,
   and live identity.
3. Commit all intended work. Patches, archives, generated reports, credentials,
   and unrelated dirty files must remain outside the repository.
4. Run `npm run release:preflight`. Every gate must pass with zero errors.
5. Run the application from the exact commit and complete the authenticated
   visual/account/VT-SYNC acceptance checklist.
6. Push that branch. Never push `main` directly.

## Pull request and preview

- The replacement PR targets `main` from
  `integration/advanced-superset-2026-08-22`.
- Required checks are `source-governance`, `focused-contracts`, `full-suite`,
  `static-quality`, `production-build`, and `local-smoke`.
- Confirm the PR head SHA equals the locally tested and pushed SHA.
- Confirm Vercel project `viewtubebuild`
  (`prj_xCtpqziBwueQncNa8sEVKAXAgPbi`) built that SHA as a preview.
- Close PR #11 only after the consolidation manifest and required checks prove
  its head is preserved in the replacement PR.

## Production approval

Before the user merges:

- Record the current `main` SHA and the deployment currently assigned to
  `viewtube.live`.
- Create the annotated rollback tag requested by the release plan.
- Confirm the replacement PR is current with `main`, all checks are green, and
  review conversations are resolved.

After the user approves and merges, Vercel must deploy the exact merge SHA from
`main`. Verify `/api/release`, `viewtube.live`, `www.viewtube.live`, SPA routes,
the account callback, and API health before creating the release tag.

## Rollback

1. Restore the recorded ready Vercel deployment to the production aliases.
2. Open a hotfix PR that reverts the release merge commit.
3. Do not reset or force-push `main`.
4. Preserve the failed SHA, deployment/build logs, smoke output, and diagnosis.

## Vercel ownership

- Canonical: `viewtubebuild` / `prj_xCtpqziBwueQncNa8sEVKAXAgPbi`.
- Frozen duplicate: `viewtube` / `prj_uppugpF60mipEr6G5dbZJHkRghOZ`.
- `viewtube.live` and `www.viewtube.live` belong only to the canonical project.
- The duplicate project is disconnected only after the first verified release;
  it is not deleted by this release.
