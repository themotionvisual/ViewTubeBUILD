# ViewTube Community Bulk Campaign Generator

## Objective
Extend the existing Community Post Generator with Single and Bulk modes. Bulk mode creates 3-30 coordinated posts, one campaign plan, suggested publishing dates/times, mixed post formats, selected-video routing, visual briefs, campaign audit, and ZIP-ready export data.

## Product rules
- Preserve the current single-post workflow.
- Bulk post count is hard-limited to 3-30.
- Default cadence is one post per day starting on the selected start date.
- Supported campaign formats: text, image, poll, image poll, video, quiz.
- Goals: community interaction, video traffic, engagement, upload priming, niche establishing, audience research, returning viewers, subscriber conversion, custom.
- Suggested times must be labeled suggestions unless backed by channel evidence.
- Do not claim Community posts directly boost recommendation ranking.
- Video posts use exact `https://youtu.be/{videoId}` links.
- Publishing remains a manual YouTube/Studio handoff because the official YouTube Data API does not expose Community-post publishing.

## Generation pipeline
1. Campaign Strategist: create the full sequence and give every day a strategic purpose.
2. Post Writer: generate final copy, CTA, polls/quizzes, and video-link integration.
3. Visual Director: produce square-first image briefs/prompts and coherent image-poll sets.
4. Campaign Critic: score the complete campaign and selectively revise weak/repetitive posts.
5. User Review: edit/regenerate/approve individual posts or the full campaign.
6. Export: generate campaign manifest, schedule CSV, campaign plan, and one folder per day.

## UI
Add `Single | Bulk Campaign` mode to Post Workspace. Bulk Campaign Parameters should include post count, start date, timezone, goal, custom goal, selected videos, allowed formats, style, visual generation and instructions. The result view becomes a campaign timeline with one collapsible SubToolbox per day and campaign-level Regenerate Plan, Regenerate Unapproved, Approve All, Save Campaign and Download ZIP actions.

## Export structure
`ViewTube_Community_Campaign/`
- `CAMPAIGN_PLAN.md`
- `SCHEDULE.csv`
- `MANIFEST.json`
- `01_DATE_TIME_TYPE/POST.txt`
- per-day `STRATEGY.md`, `SCHEDULE.txt`, `POLL.json`, `VIDEO.json`, `IMAGE_PROMPT.txt`, and generated image assets as applicable.

Folder names must include day number, date, suggested local time, and post type.

## Integration phases
### Phase 1 — contracts and planner
Campaign types, limits, deterministic initial planner, prompt contracts, youtu.be routing.

### Phase 2 — AI orchestration
Connect strategist/writer/visual-director/critic to the existing ViewTube AI transport and Brain evidence without creating a parallel AI stack.

### Phase 3 — UI
Add bulk controls and campaign timeline using the canonical SubToolbox system.

### Phase 4 — media and video intelligence
Reuse Image Generator handoffs. Rank selected/candidate videos by campaign goal and avoid repetitive promotion.

### Phase 5 — export
Build ZIP, CSV and JSON export with deterministic filenames and mobile-friendly download behavior.

### Phase 6 — validation
Unit-test 3/10/30-post campaigns, format rotation, date generation, video URLs, export manifest, malformed AI responses, partial image-generation failure and campaign regeneration. Run typecheck/build/tests before merge.
