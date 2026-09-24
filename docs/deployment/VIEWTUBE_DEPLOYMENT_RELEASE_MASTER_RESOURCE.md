# ViewTube Deployment & Release — Master Resource

**Status:** CANONICAL LIVING DEPLOYMENT / RELEASE AUTHORITY  
**Created:** 2026-09-24  
**Last audited main:** `2efe0f56eb52c1029c71543291cf65e2b1a2245f`  
**Canonical owner / concern:** production release identity, branch/preflight rules, Vercel web deployment verification, release gates, live SHA verification, and separation of the VT_E1 render worker from the web deployment.  
**Executable authority:** `scripts/release-status.mjs`, `release-preflight.mjs`, `release-verify-live.mjs`, `release-smoke.mjs`, `.github/workflows/release-gates.yml`, `vercel.json`, and `/api/release`.

## 1. Production web target

Canonical web project recorded by the release tooling:

- Vercel project name: `viewtubebuild`
- Vercel project ID: `prj_xCtpqziBwueQncNa8sEVKAXAgPbi`
- production URL: `https://viewtube.live`
- live identity endpoint: `https://viewtube.live/api/release`

Repository state is not proof of deployed state. Production truth requires checking the live release metadata.

## 2. Branch rule

Do not prepare release work directly on `main`.

`release-preflight.mjs` requires:

- a non-detached feature branch;
- branch is not `main`;
- clean working tree;
- upstream exists;
- branch is not behind its upstream;
- current branch contains `origin/main`;
- forbidden artifacts/secrets are not tracked.

## 3. Release gates

The canonical preflight/release gate set includes:

- source route checks;
- CSS parsing;
- quarantine integrity;
- source governance;
- privacy source audit;
- focused contracts;
- Node account contracts;
- full Vitest suite;
- TypeScript;
- runtime lint;
- production build;
- local browser smoke.

GitHub's `ViewTube release gates` workflow separates these into source-governance, focused-contracts, full-suite, static-quality, production-build and local-smoke jobs.

A green build alone is not a complete release proof.

## 4. Local smoke contract

`release-smoke.mjs` verifies:

- `/api/release` metadata shape;
- `/api/account/snapshot` authentication shape;
- browser load of `/`, `/account/connect`, and `/local-analytics`;
- absence of uncaught page errors in that smoke pass.

## 5. Live verification

After production deployment, run the equivalent of:

```text
npm run release:status
npm run release:verify-live -- --expected <commit-sha>
```

`release-verify-live.mjs` requires production metadata and an exact commit match.

Do not infer that a Vercel "redeploy" is current main. Historical auth incidents demonstrated that redeploying an old deployment can keep serving an old commit.

## 6. Preview/deployment failures

Differentiate:

- application build failure;
- test/governance failure;
- Vercel build-rate/quota/resource failure;
- deployment state that never reaches READY;
- stale deployment serving the wrong Git SHA.

A platform quota/resource failure does not prove application code is broken, but it also does not count as preview verification.

## 7. VT_E1 render worker

The video render worker is a separate deployment concern.

`docs/vt-e1-render-worker.md` describes the Docker worker contract used by web-proxied render requests. It requires a host capable of running the worker and server-side shared-secret configuration.

Do not assume the worker is deployed merely because the web app is deployed.

## 8. Obsolete deployment trigger markers

These files are marker artifacts, not durable runbooks:

- `docs/production-deployment-trigger.md`
- `docs/deployment/PRODUCTION_DEPLOY_TRIGGER.md`

They are retirement candidates for the cleanup wave after inbound-reference verification.

## 9. Release acceptance

A production release is proven when:

1. intended commit is merged to `main`;
2. required release gates have been evaluated and inherited debt is explicitly distinguished from branch-caused failures;
3. a fresh production deployment exists;
4. `/api/release` reports environment `production`;
5. live commit equals the intended release SHA;
6. required smoke routes work;
7. any user-visible changed surface has its required runtime/visual evidence.
