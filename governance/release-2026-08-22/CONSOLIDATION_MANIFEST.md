# ViewTube Advanced Superset Consolidation Manifest

Generated for `integration/advanced-superset-2026-08-22`. Production is not
authorized by this manifest.

## Pinned sources

| Source | Commit | Representation |
| --- | --- | --- |
| GitHub `main` before consolidation | `cf93ce6046f32b9b621fa2a748093fa5541335b7` | Merge base |
| PR #11 / align branch | `f37d5a3966204f378325734019290d7b4d186f10` | Direct ancestor |
| Quick-wins | `6c6d6903cbf78cb5b5fa4104109db8223623a082` | Direct ancestor |
| Auth/sync/performance | `2741e98c38b0198095fc2e1c5fd42a6466b1a961` | Direct ancestor through merge `69073407` |
| Dark insight donor | `81fd3bcc` | Reviewed equivalent in `5b439968` |
| Custom visual donor | `b4371317` | Reviewed equivalent in `6a21e1f5` |
| Shared dark stats and Clock Burst layout | `799abdcc` | Direct ancestor |
| Single replay ownership | `35e86fdf` | Direct ancestor |

The replacement PR must target `main` from
`integration/advanced-superset-2026-08-22`. PR #11 may be closed as superseded
only after its head remains an ancestor of the replacement PR head and the
feature-contract gates pass.

## Recovery artifacts

These files intentionally remain outside the repository.

| Artifact | SHA-256 |
| --- | --- |
| `/Users/cwb/ViewTube-advanced-superset-visuals-2026-08-22.patch` | `b725722f7849f4ad3ce96c065f06e98d8f16a5a70dc53e8ad4e58696f26d68cd` |
| `/Users/cwb/ViewTube-branch-check-staged-rollbacks-2026-08-22.patch` | `55a6c4c0ca1999fd17a78b9616f452341a2239c622248d57bbbcc202f4e92e6e` |

The rollback-style patch is quarantined evidence. None of its seven reversions
may be applied to the release branch.

## Required behavior evidence

- Account identity, session, refresh tokens, channel selection, billing, and
  reconnect behavior remain server-owned.
- Google proxy errors distinguish retryable, reconnect-required, and ordinary
  unauthenticated states without converting the latter into server outage.
- Sync retries are bounded and API/snapshot VT-SYNC rows cannot be removed by
  supplemental imports.
- Orientation anchoring, comment access ownership, route/build diagnostics,
  deferred visuals, custom Tube Explorer art, and three deterministic hero
  variants remain present.
- `insightDark` owns the shared dark context-bar convention for dark-canvas
  modules; individual modules do not duplicate that style contract.
- Format Dominance and Heat Matrix each have exactly one `HeroIntroBoundary`
  replay owner and no component-local replay event listener.

## Release invariants

- `main` is never pushed directly or force-updated.
- A Vite build is not sufficient evidence without typecheck, lint, focused
  contracts, full tests, governance, and smoke checks.
- The tested local SHA, pushed branch SHA, Vercel preview SHA, PR head SHA, and
  eventual production SHA must match at their respective gates.
- The auth and quick-wins worktrees and branches remain available until a
  production release is verified and their removal is separately approved.
