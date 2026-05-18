# PerformanceHub + IntelligenceHub Companion Ops Additions

## Purpose
This companion document extends:
- `docs/ops/performancehub-intelligencehub-full-stack-ops-workflow.md`

Use this as the practical edge-case and reliability layer for real-world ops incidents.

---

## 1) Hard Cap + Pagination Policy

### Why this exists
Ops incidents repeatedly look like “missing data” when the true cause is a hidden cap in UI or table pagination.

### Required rules
- Every cap must be declared in one of these buckets:
  - Fetch cap (API/sync request limit)
  - Storage cap (cached/canonical persisted rows)
  - Display cap (UI rendering window)
- Display caps must never be interpreted as source data loss.
- If display cap is active, UI must show:
  - total available rows,
  - current displayed rows,
  - action to load/show all.

### Operator checks
- Compare fetched count vs canonical row count vs rendered count.
- If rendered << canonical, inspect display limit state first.

---

## 2) Upload Visibility Contract (CSV/ZIP/FOLDER)

### Why this exists
Uploads can succeed but appear empty if cache-backed UI state is stale.

### Required rules
- Uploaded source list must update immediately after successful upload parse.
- Source strip behavior must match storage mode:
  - `sync`: cache-backed list
  - `storage`: brain/state-backed list
  - `both`: merged + deduped list
- File removal/clear must mutate both active stores when mode requires it.

### Operator checks
- After upload, confirm source strip count increments without page reload.
- Confirm local cache and brain list reconcile.

---

## 3) Preflight Truth Table (Typed Only)

### Why this exists
False blocks occur when preflight relies on string heuristics instead of typed evidence.

### Required source checks
- `master_table`: canonical rows > 0 and KPI coverage present
- `api_cache`: parse success + expected payload shape + timestamp
- `user_profile`: `isAuthenticated === true` OR cached profile id present
- `brain`: diagnostic quality input (blocking only if policy explicitly requires)

### Blocker codes (canonical)
- `missing_master_table_rows`
- `missing_api_cache`
- `missing_user_profile_auth_or_cache`

### Operator checks
- Preflight output must include evidence fields, not only booleans.

---

## 4) Timeout + Partial Render Contract

### Why this exists
Full-report timeouts currently degrade into low-value placeholder content.

### Required rules
- Stage-specific timeout budgets must be explicit:
  - `stageA`
  - `stageB`
  - `diagnosis`
  - `keyword`
- Retry policy: max one retry per stage with reduced context.
- Partial Render is canonical behavior:
  - completed sections render fully,
  - degraded sections render with evidence + reason,
  - failed sections remain visible as failed cards.
- Never auto-upgrade failed/degraded to complete.

### Operator checks
- Timeline statuses must reconcile with stage diagnostics and section statuses.

---

## 5) Legacy Fallback Containment

### Why this exists
Legacy route/payload fallback can overwrite staged report outputs and confuse users.

### Required rules
- `/performance` uses one authoritative render contract.
- Legacy adapters are allowed only for compatibility translation, not override.
- If staged metadata exists, it is authoritative over inferred legacy block prose.
- Prompt/system/backend artifacts must never appear in user-facing section content.

---

## 6) Chart Mount Safety + Warning Dedupe

### Why this exists
Repeated chart sizing warnings and asset-fetch noise obscure real failures.

### Required rules
- Chart mount guard requires:
  - measured container dimensions > 0,
  - non-empty dataset for data-driven charts.
- On empty data, render explicit diagnostic panel (not blank chart shell).
- Deduplicate repeated warnings per run:
  - image 404 by video id
  - lottie 403 by asset URL
  - chart sizing warnings by chart key

---

## 7) Video Inventory Reconciliation

### Why this exists
Logs can show high fetch counts while UI shows empty list.

### Required checkpoints
- `inventoryFetchedCount`
- `classifiedCount`
- `canonicalRowsCount`
- `filteredRowsCount`
- `renderedRowsCount`

### Operator checks
- If fetch/classify is high but rendered is zero:
  - inspect filter chain and identity mapping,
  - inspect source mode routing,
  - inspect list/table display cap.

---

## 8) Run Health Snapshot (Required Per Sync/Generate)

### Required fields
- run id + timestamp
- source mode + analytics window
- fetch/classify/canonical/render counts
- preflight outcome + blocker codes
- stage outcomes (`stageA`, `stageB`, `diagnosis`, `keyword`)
- retries and elapsed ms
- completed/degraded/failed section counts

---

## 9) AI Access Policy Clarity (BYO Key vs Platform Meter)

### Why this exists
Entitlement errors can mask true data/system state.

### Required rules
- Distinguish clearly between:
  - platform-billed key path,
  - BYO key path.
- If BYO path is valid, do not surface paid-plan block as primary failure.
- Keep analytics/sync health visible even when AI generation is unavailable.

---

## 10) Known Failure Signatures + First Response

### Signature
- `REPORT_PREFLIGHT_BLOCKED::<json>`
### First response
- inspect typed source evidence + blocker codes; verify auth/cache/profile and canonical rows.

### Signature
- `Oracle response missing sections; using fallback shape`
### First response
- validate stage response schema; block unsafe fallback overwrite into canonical render path.

### Signature
- `Generation degraded mode ... timed out after 25000ms`
### First response
- inspect per-stage timeout budgets, retry behavior, and context size reduction path.

### Signature
- `Empty video list after initial load`
### First response
- reconcile fetch/classify/render counts; inspect filters, caps, and source mode routing.

### Signature
- `The width(-1) and height(-1) ... should be greater than 0`
### First response
- apply chart mount guard and dedupe warning logger.

---

## 11) Release Readiness Gate (Before User-Facing Rollout)

Ship only when all are true:
- preflight false-block rate is zero in tested scenarios,
- timeline + generation stream remain mounted in all terminal states,
- partial render behavior is consistent and non-deceptive,
- no hidden row/video caps causing perceived data loss,
- uploaded source strip reflects live upload state immediately,
- section content is evidence-linked and free of system/prompt leakage.
