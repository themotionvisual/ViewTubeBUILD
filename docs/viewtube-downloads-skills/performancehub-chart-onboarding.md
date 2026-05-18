# PerformanceHub Chart Onboarding Playbook

Generated: 2026-05-06T13:12:17.476Z

## Pipeline
1. Inventory chart-bearing files (`chart-inventory.json`).
2. Bind each chart to a unified spec entry (`unifiedChartSpec.ts`).
3. Bind renderer + metrics alias adapters (`performanceHub40/adapter.ts`, `performanceHub40/capability.ts`).
4. Register lifecycle and rollout state (`performanceHub40/chartRegistry.ts`).
5. Promote by pack in `PerformanceHubChartRollout` when capability is ready.

## Chart Actions
| Chart ID | Status | Stage | Action |
|---|---|---|---|
| video-value-matrix | ready_for_rollout | candidate | Assign/verify in active pack and validate rendering. |
| algorithm-trigger-matrix | not_ready_contract | candidate | Add missing unified spec contract fields. |
| top-performers-trio | ready_for_rollout | production | Assign/verify in active pack and validate rendering. |
| global-footprint | not_ready_data | incubator | Complete metric adapter coverage and set analyticsReady=true. |
| discovery-radar | not_ready_contract | incubator | Add missing unified spec contract fields. |
| golden-ratio-dashboard | not_ready_contract | incubator | Add missing unified spec contract fields. |
| retention-triangle | not_ready_contract | incubator | Add missing unified spec contract fields. |
| geo-high-cpm | not_ready_contract | incubator | Add missing unified spec contract fields. |
| engagement-scatter | not_ready_contract | incubator | Add missing unified spec contract fields. |
| viral-trajectory | not_ready_contract | incubator | Add missing unified spec contract fields. |
| views-revenue-dual | not_ready_contract | incubator | Add missing unified spec contract fields. |
| subs-ctr-dual | not_ready_contract | incubator | Add missing unified spec contract fields. |
| daily-performance-stack | not_ready_contract | incubator | Add missing unified spec contract fields. |
| seasonal-rpm-pulse | not_ready_contract | incubator | Add missing unified spec contract fields. |
| ad-format-dominance | not_ready_contract | incubator | Add missing unified spec contract fields. |
| premium-standard-monetization | not_ready_contract | incubator | Add missing unified spec contract fields. |
| viewer-loyalty-index | not_ready_contract | incubator | Add missing unified spec contract fields. |
| publish-time-momentum | not_ready_contract | incubator | Add missing unified spec contract fields. |
| best-upload-grid | not_ready_contract | incubator | Add missing unified spec contract fields. |
| source-retention-timeline | not_ready_contract | incubator | Add missing unified spec contract fields. |
| thumbnail-ab-pulse | not_ready_contract | incubator | Add missing unified spec contract fields. |
| momentum-tracker | not_ready_contract | incubator | Add missing unified spec contract fields. |
| packaging-score-tile | not_ready_contract | incubator | Add missing unified spec contract fields. |
| title-stats-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| keyword-engine-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| device-immersion-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| os-revenue-mix-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| content-breakdown-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| duration-sweet-spot-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| revenue-efficiency-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| end-screen-actions-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| solo-impressions-funnel-mini | not_ready_contract | incubator | Add missing unified spec contract fields. |
| narrative-dna | not_ready_contract | incubator | Add missing unified spec contract fields. |
| hook-to-binge-funnel | not_ready_contract | incubator | Add missing unified spec contract fields. |
| playback-cpm-density | not_ready_contract | incubator | Add missing unified spec contract fields. |
| interaction-density-index | not_ready_contract | incubator | Add missing unified spec contract fields. |
| long-tail-shelf-life | not_ready_contract | incubator | Add missing unified spec contract fields. |
| series-consistency-box | not_ready_contract | incubator | Add missing unified spec contract fields. |
| audience-overlap-live-vod-shorts | not_ready_contract | incubator | Add missing unified spec contract fields. |
| conversion-power-of-views | not_ready_contract | incubator | Add missing unified spec contract fields. |
