# YouTube API Stabilization V1 — Branch-Only Migration Tracker

> Safety rule: do not merge this branch into `main` until the verification checklist at the end is complete.

## Canonical architecture

- Browser auth truth: `GET /api/auth/session`
- Google credentials: server-only refresh/access tokens
- Data API v3: typed `/api/youtube/*` routes
- Analytics API v2: server-side matrix-validated query service
- Reporting API v1: server-side bulk-report job/download/ingest service
- Widgets never call Google directly and never own auth state.

## Wave A — Auth + comments + capability model

- [x] Legacy UnifiedAccountContext is now a compatibility projection of SimpleAuthProvider; it no longer owns login, legacy OAuth fallback, or auth events.

- [x] Canonical server-owned session introduced.
- [x] Comment Responder reads through typed server endpoint.
- [x] Comment replies through typed server endpoint.
- [x] Full comment-thread pagination.
- [x] Full reply hydration for threads whose inline replies are incomplete.
- [x] Typed top-level comment endpoint.
- [x] Typed comment moderation endpoint.
- [x] Typed mark-as-spam endpoint.
- [x] Dashboard Video Comment Operator migrated off legacy YouTube write path.
- [x] Reporting capability corrected for normal creator/channel accounts.
- [x] Monetary analytics scope separated from ordinary Reporting access.
- [x] Analytics report-family compatibility validator added.
- [ ] Add Comment Responder moderation UI controls.
- [ ] Remove legacy comment access/auth helpers after parity tests pass.

## Wave B — Video/content tools

- [x] Canonical owned-video inventory endpoint using uploads playlist + batched videos.list.
- [x] Canonical single-video endpoint.
- [x] Safe partial video metadata/status patch endpoint that hydrates existing resource before videos.update.
- [x] Migrate Video Manager list/details/save to typed video service.
- [x] Add canonical playlist list/membership/add/remove endpoints.
- [x] Migrate Video Manager playlists.
- [x] Add typed thumbnail upload endpoint.
- [~] Video Manager thumbnail edit migrated; Thumbnail Studio and A/B thumbnail widgets remain.
- [ ] Add resumable upload endpoint/session for Video Publisher.
- [ ] Add caption list/insert/update/download routes.
- [ ] Migrate Video Publisher to upload -> thumbnail -> captions -> final metadata/status sequence.
- [x] Add per-operation Data API quota estimates.

## Wave C — Analytics + VT-SYNC

- [x] Matrix derived from official report families is encoded locally.
- [x] Build server Analytics query endpoint using the matrix validator.
- [ ] Remove Analytics API browser proxy/token dependencies.
- [ ] Split VT-SYNC datasets into explicit report families:
  - core activity
  - traffic source
  - playback location
  - device/OS
  - subscription status
  - geography
  - demographics
  - retention
  - playlist performance
  - cards/end screens
- [ ] Fix Deep-Cut single-video bundle to query each compatible family independently.
- [ ] Make missing scope / no data / invalid combination / not applicable distinct availability states.
- [ ] Retire runtime 400-learning/quarantine logic after matrix parity.

## Wave D — Reporting API bulk ingestion

- [x] reportTypes.list endpoint.
- [x] jobs.list/create/delete endpoints.
- [x] reports.list/get endpoints.
- [x] secure report download endpoint.
- [ ] canonical dedupe by report id + create time.
- [ ] ingest channel_basic_a2.
- [ ] ingest channel_traffic_source_a2.
- [ ] ingest channel_demographics_a1.
- [ ] ingest channel_playback_location_a2.
- [ ] ingest channel_device_os_a2.
- [ ] ingest channel_subtitles_a2.
- [ ] define Analytics-vs-Reporting precedence and provenance.

## Wave E — Legacy deletion

Only after all migrated tools pass:
- remove generic `/api/account/google-proxy`
- remove browser Google access-token persistence
- remove browser refresh logic
- remove `vt_auth_changed` / auth event-bus ownership
- remove `auth-canon`
- remove direct `googleapis.com` fetches under `src/`
- remove duplicate youtubeApiClient/youtubeDataFetcher/youtubeService pathways
- remove analytics-cache authentication
- remove widget-specific reconnect logic

## Verification gate before main

### Mobile auth
- [ ] iPhone Safari sign-in completes.
- [ ] 10 consecutive reloads remain signed in.
- [ ] navigation between Account, Comment Responder, Video Manager, Analytics does not alter auth state.
- [ ] no localStorage Google token is required.
- [ ] expired access token refreshes server-side without UI logout.
- [ ] revoked refresh token becomes exactly `reconnect_required`.

### Comments
- [ ] recent comments load.
- [ ] pagination reaches older comments.
- [ ] all replies hydrate.
- [ ] reply posts.
- [ ] top-level comment posts.
- [ ] moderation actions work.
- [ ] comments-disabled returns a local tool error, not global logout.

### Video Manager
- [ ] full upload inventory loads in correct order.
- [ ] details/statistics load.
- [ ] title/description/tags/category save.
- [ ] privacy save.
- [ ] playlists load and update.
- [ ] thumbnail upload works.

### Publisher
- [ ] resumable upload works.
- [ ] thumbnail stage works.
- [ ] captions stage works.
- [ ] failed later stage does not duplicate upload.
- [ ] quota estimate displayed.

### Analytics / VT-SYNC
- [ ] core queries validate and load.
- [ ] traffic queries validate and load.
- [ ] retention query loads.
- [ ] demographics query loads.
- [ ] revenue query requires monetary capability.
- [ ] invalid cross-family query is rejected locally before Google request.

### Reporting
- [ ] report type discovery works for creator account.
- [ ] jobs list/create works with analytics readonly scope.
- [ ] reports list works.
- [ ] download + ingest works.
- [ ] rerun is idempotent.

### Governance
- [ ] no migrated widget imports legacy auth.
- [ ] no migrated widget calls Google directly.
- [ ] no API error other than revoked credentials can globally log out the app.
