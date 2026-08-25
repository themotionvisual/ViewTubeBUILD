# Pending features inventory — working tree vs `main`

Snapshot of everything sitting in the `ViewTube-branch-check` working directory that is NOT yet on `main` (as of 2026-08-25, `main` HEAD `7967fd1b`). Every entry below is either a set of local edits (`MOD`) or an untracked file/folder (`NEW`) that hasn't been committed.

Use this as the shipping order document — each numbered cluster below can become one PR.

## At a glance

- **40 modified files** (55,700+ code lines touched)
- **3 new source subtrees** (`src/features/creator-engagement/`, `src/shared/`, plus scattered new tests)
- **13 feature clusters** grouped by shipping unit below

## Cluster 1 — Creator Engagement framework 🔥

**Impact:** Shared controllers behind CommentResponder + CommunityPost, refactors two components + two dashboard widgets down to thin views. This is the "new comment responder / community post layout" you reported missing on the live site.

### Files
| File | Change |
| --- | --- |
| `src/features/creator-engagement/index.ts` | **NEW** — public barrel |
| `src/features/creator-engagement/types.ts` | NEW |
| `src/features/creator-engagement/communityPostStore.ts` | NEW — persistence |
| `src/features/creator-engagement/useCommentResponderController.ts` | NEW — hook |
| `src/features/creator-engagement/useCommunityPostController.ts` | NEW — hook |
| `src/features/creator-engagement/useCreatorEngagementContext.ts` | NEW — shared context |
| `src/features/creator-engagement/creatorEngagement.test.ts` | NEW — tests |
| `src/features/creator-engagement/creatorEngagementParity.test.ts` | NEW — parity tests |
| `src/components/CommentResponder.tsx` | −272 / +69 (thinned view) |
| `src/components/CommunityPostGenerator.tsx` | −92 / +70 |
| `src/views/dashboard/widgets/CommentReplyWidget.tsx` | −230 / +31 |
| `src/views/dashboard/widgets/CommunityPostWidget.tsx` | −123 / +40 |

**Ship as one PR.** All four consumers depend on the new module — can't be split.

## Cluster 2 — auth-canon Phase 2 (capabilities + server session)

**Impact:** Extends the reconciler so a server-side session can be "ready" without exposing a browser OAuth token. Adds capability gates (`canReadYouTube`, `canManageVideos`, `canUploadVideos`, `canPostComments`) driven by `grantedCapabilities`.

### Files
| File | Change |
| --- | --- |
| `src/services/auth-canon/contracts.ts` | +10 / −1 — adds `transportMode`, `grantedCapabilities`, canX flags |
| `src/services/auth-canon/reconcile.ts` | +16 / −3 — new `serverEnabled` input, capability gating |
| `src/services/auth-canon/reconcile.test.ts` | +13 / −1 — pins "server session ready without token" |
| `src/services/auth-canon/useAccountStatus.ts` | +3 / −3 — threads serverEnabled through |
| `src/services/account/accountContracts.ts` | +2 / −1 — presumably capability enum tweak |
| `src/services/account/accountSurfaceGovernance.test.ts` | +10 — surface additions |

**Ship as one PR.** Sits under the auth-canon namespace, additive, backward-compatible.

## Cluster 3 — Settings modularization 🔥

**Impact:** The huge `Settings.tsx` (1,088 lines) is being split. New `settingsControlDeck` extracts panel routing / readiness / plan-UI primitives. `Settings.tsx` and `UnifiedAccountSettingsSection.tsx` are massively thinned.

### Files
| File | Change |
| --- | --- |
| `src/views/settings/settingsControlDeck.ts` | **NEW** — panel router, readiness items, plan themes, canonical button class |
| `src/views/settings/settingsControlDeck.test.ts` | NEW — tests |
| `src/views/Settings.tsx` | −1,054 / +350 (**net −704 lines**) |
| `src/views/settings/UnifiedAccountSettingsSection.tsx` | −502 / +140 (**net −362 lines**) |

**Ship as one PR.** All three files interlock via the deck exports.

## Cluster 4 — VT-E1 Editor major rewrite 🔥

**Impact:** Big new feature work on the video editor at `/editor`. Adds **Shorts Extractor** (new pipeline for 9:16 / 1:1 / 4:5 crops with keyframe tracking, storyboard preview, transitions), a **portrait grid layout v2**, ripple-delete, project management, and render-server status polling. Uses the shared timeline math from Cluster 5.

### Files
| File | Change |
| --- | --- |
| `src/features/editor/VT_E1.jsx` | +798 / −355 — Shorts pipeline, project ops, layout v2 |
| `src/features/editor/VT_E1.css` | +475 / −12 — matching styles |
| `src/server/vt-e1-render-server.mjs` | +40 / −8 — render-server API extensions |
| `src/remotion-editor/src/Composition.tsx` | +22 / −105 — Remotion composition simplification |

**Ship as its own PR** (or two — VT_E1 core vs render-server integration).

## Cluster 5 — VT-E1 shared timeline contracts

**Impact:** New pure-JS module for VT-E1 timeline math. Zero React / DOM / Remotion — used by both the browser preview and the final Remotion render so both paths compute identical crops.

### Files
| File | Change |
| --- | --- |
| `src/shared/vtE1Shorts.ts` | **NEW** — `ShortsFramingConfig`, keyframe interpolation |
| `src/shared/vtE1TimelineContract.js` | NEW — timeline contract |
| `src/shared/vtE1TimelineContract.test.ts` | NEW — tests |
| `src/shared/vtE1TimelineOperations.js` | NEW — pure operations |
| `src/shared/vtE1TimelineOperations.test.ts` | NEW — tests |

**Blocks Cluster 4.** Ship first (or bundle with it in the same PR).

## Cluster 6 — Intelligence Hub deepening

**Impact:** Additional polish on Intelligence Hub's 34-dataset manifest + generation path. The core extraction landed in earlier PRs; these are follow-up improvements.

### Files
| File | Change |
| --- | --- |
| `src/services/analytics-canon/intelligenceEvidence.ts` | +49 / −21 — manifest polish |
| `src/services/analytics-canon/intelligenceEvidence.test.ts` | +50 — new coverage |
| `src/components/IntelligenceHub/IntelligenceHub.tsx` | +88 / −22 — UI features |
| `src/components/IntelligenceHub/ultimateReport.ts` | +2 / −2 — small tweak |
| `src/components/IntelligenceHub/ultimateReport.test.ts` | +10 — new case |

**Ship as one PR.** All in the IntelligenceHub / analytics-canon namespace.

## Cluster 7 — Server-side auth hardening

**Impact:** Small server-side improvements to the account-auth endpoint.

### Files
| File | Change |
| --- | --- |
| `server/account-auth.mjs` | +12 / −7 |
| `server/account-auth.test.mjs` | +13 / −1 |
| `.env.billing.example` | +2 / −1 — new env var |

**Ship as one PR.** Server-only, safe.

## Cluster 8 — YouTube transport slim-down

**Impact:** Consolidation / cleanup of the YouTube read + write transport paths. Net line count DROPS (transport is getting simpler post-proxy-fallback work).

### Files
| File | Change |
| --- | --- |
| `src/services/youtube/googleProxyErrors.ts` | +6 / −7 |
| `src/services/youtube/googleProxyErrors.test.ts` | +2 / −2 |
| `src/services/youtube/googleReadTransport.ts` | +2 / −14 |
| `src/services/youtube/googleReadTransport.test.ts` | +6 / −12 |
| `src/services/youtube/youtubeDataFetcher.ts` | +2 / −11 |
| `src/services/youtube/youtubeWriteTransport.ts` | +24 / −3 |
| `src/services/youtube/youtubeWriteTransport.test.ts` | +14 / −2 |

**Ship as one PR.** All within the transport layer, tests included.

## Cluster 9 — VT-Sync toolbox table + manual-import polish

**Impact:** UI adjustments to the data table + cleaner manual-import path.

### Files
| File | Change |
| --- | --- |
| `src/features/vt-sync-local/shell/toolbox-table/VtSyncToolboxDataTable.tsx` | +66 / −52 |
| `src/features/vt-sync-local/adapters/manualImports.ts` | +8 / −24 (net simpler) |
| `src/features/vt-sync-local/adapters/manualImports.test.ts` | +29 / −2 |
| `src/features/vt-sync-local/adapters/localDbRepository.test.ts` | +14 / −2 — new coverage |

**Ship as one PR.**

## Cluster 10 — Brain Core extension

**Impact:** `services/brain/Core.ts` extension + first test file.

### Files
| File | Change |
| --- | --- |
| `src/services/brain/Core.ts` | +23 / −5 |
| `src/services/brain/Core.test.ts` | **NEW** — first Core coverage |

**Ship as one PR.**

## Cluster 11 — StudioHub + VideoManager small features

### Files
| File | Change |
| --- | --- |
| `src/views/StudioHub.tsx` | +9 / −3 — small mount tweak |
| `src/views/VideoManager.tsx` | +26 / −6 — feature addition |

**Can go with Cluster 1** (StudioHub mounts the widgets, natural pairing).

## Cluster 12 — Hero animation micro-tweak

### Files
| File | Change |
| --- | --- |
| `src/components/heroVisualAnimations.ts` | +2 / −2 |
| `src/components/heroVisualAnimations.test.ts` | +5 / −5 |

**Ship anywhere.** Trivial.

## Cluster 13 — Config

### Files
| File | Change |
| --- | --- |
| `.env.billing.example` | +2 / −1 (already noted with Cluster 7) |

---

## Suggested shipping order

1. **Cluster 5** (shared timeline) — blocks Cluster 4
2. **Cluster 4** (VT-E1 editor rewrite) — the biggest one, highest risk, isolate early
3. **Cluster 1** (Creator Engagement) — user has been asking about the missing new layouts
4. **Cluster 3** (Settings modularization) — big Settings.tsx trim, high visibility
5. **Cluster 2** (auth-canon capabilities) — additive, safe
6. **Cluster 6** (Intelligence Hub deepening) — polish
7. **Cluster 8** (YouTube transport slim-down)
8. **Cluster 9** (VT-Sync table + imports)
9. **Cluster 10** (Brain Core)
10. **Cluster 11** (StudioHub/VideoManager small)
11. **Cluster 12** (Hero animation)
12. **Cluster 7 + 13** (server auth + env config)

---

## What is NOT here

- Anything already shipped in PRs #33–#47 has been excluded from this list (those files were already on `main` when the diff was taken).
- `docs/migration/README.md` — this file lives here and is the north star for the whole migration.

## How this doc gets maintained

Every time a cluster ships, delete its section from this file (in the same PR) and add a note to `docs/migration/README.md`'s History section.
