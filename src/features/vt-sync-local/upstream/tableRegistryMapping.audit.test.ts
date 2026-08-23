// vt-2643 — Audit tableRegistry / tableData / localSyncEngine mappings.
//
// Regression-grade "the wiring hasn't drifted" test suite. It doesn't prove
// the data itself is correct; it proves the plumbing is internally consistent
// so that when a later refactor accidentally reverts a mapping (which is the
// concrete failure mode the task names — August VT-SYNC refactors sometimes
// pointed a visible table at the wrong upstream dataset), CI fails LOUDLY
// instead of silently shipping bad data to users.
//
// If a real regression trips one of these, the correct fix is almost never to
// relax the assertion. It's to either:
//   * restore the missing entry / redirect / dataset key on the definition, OR
//   * add the new table to the visible/active set alongside the existing one.

import { describe, it, expect } from "vitest"
import {
 VT_SYNC_TABLE_DEFINITIONS,
 VT_SYNC_LEGACY_TABLE_REDIRECTS,
 VT_SYNC_ACTIVE_TABLE_IDS,
 resolveVtSyncCanonicalTableId,
} from "./tableRegistry"
import {
 VT_SYNC_SYNC_UNITS,
 getVtSyncUnitCategoryIds,
} from "./syncUnitRegistry"
import { VT_SYNC_CATEGORY_OPTIONS } from "./syncCategoryRegistry"

/** Fields on `VtSyncSnapshot` that a `snapshotKeys: string[]` entry may reference.
 *  Kept as a literal set here (instead of `keyof VtSyncSnapshot`) so the audit
 *  fails at test time — not compile time — when a table definition references a
 *  snapshot key that no longer exists. Compile-time `keyof` would silently pass
 *  after the snapshot type is edited to drop a field.
 *  Update this set intentionally when adding or removing a real snapshot slot.
 *  Derived from `VtSyncSnapshot` in adapters/contracts.ts (as of 2026-08-23). */
const KNOWN_SNAPSHOT_KEYS = new Set([
 "adTypes",
 "audienceWatchBehavior",
 "channelTotals",
 "cities",
 "continentsData",
 "creatorContentTypes",
 "dailyMetrics",
 "demographics",
 "demographicsByAge",
 "demographicsByGender",
 "deviceOs",
 "devices",
 "dmaRegions",
 "extWebsites",
 "formatSubscriberStatuses",
 "geography",
 "hashtags",
 "monthlyMetrics",
 "newReturningViewers",
 "operatingSystems",
 "playbackLocations",
 "playlistsData",
 "provinces",
 "retentions",
 "revenueSource",
 "searchTerms",
 "sharingService",
 "soundPages",
 "subscriptionSource",
 "subscriptionStatuses",
 "suggestedVideos",
 "trafficAdvertising",
 "trafficBrowseFeatures",
 "trafficByDay",
 "trafficCampaignCard",
 "trafficCard",
 "trafficChannelPages",
 "trafficDetails",
 "trafficEndScreen",
 "trafficLiveRedirect",
 "trafficNoLinkEmbedded",
 "trafficNoLinkOther",
 "trafficNotification",
 "trafficOtherFeatures",
 "trafficPlaylist",
 "trafficShorts",
 "trafficShortsContentLink",
 "trafficSources",
 "trafficSubscriberData",
 "trafficYtPlaylistPage",
 "videos",
])

describe("VT-SYNC table registry — mapping audit (vt-2643)", () => {
 describe("VT_SYNC_TABLE_DEFINITIONS structural integrity", () => {
  it("has no duplicate table IDs", () => {
   const ids = VT_SYNC_TABLE_DEFINITIONS.map((t) => t.id)
   const seen = new Set<string>()
   const dupes: string[] = []
   for (const id of ids) {
    if (seen.has(id)) dupes.push(id)
    seen.add(id)
   }
   expect(dupes).toEqual([])
  })

  it("every definition has non-empty columns", () => {
   for (const t of VT_SYNC_TABLE_DEFINITIONS) {
    expect(t.columns.length, `table "${t.id}" has no columns`).toBeGreaterThan(0)
   }
  })

  it("every definition has a non-empty performanceHubDatasetId (the tableData lookup key)", () => {
   for (const t of VT_SYNC_TABLE_DEFINITIONS) {
    expect(typeof t.performanceHubDatasetId, `table "${t.id}"`).toBe("string")
    expect(t.performanceHubDatasetId.length, `table "${t.id}"`).toBeGreaterThan(0)
   }
  })

  it("every definition has a non-empty exportName", () => {
   for (const t of VT_SYNC_TABLE_DEFINITIONS) {
    expect(t.exportName, `table "${t.id}"`).toBeTruthy()
   }
  })

  it("every definition has at least one categoryId", () => {
   for (const t of VT_SYNC_TABLE_DEFINITIONS) {
    expect(t.categoryIds.length, `table "${t.id}" has no categoryIds`).toBeGreaterThan(0)
   }
  })

  it("every declared snapshotKey references a real VtSyncSnapshot field", () => {
   const offenders: Array<{ table: string; badKey: string }> = []
   for (const t of VT_SYNC_TABLE_DEFINITIONS) {
    for (const key of t.snapshotKeys ?? []) {
     if (!KNOWN_SNAPSHOT_KEYS.has(key)) {
      offenders.push({ table: t.id, badKey: key })
     }
    }
   }
   expect(offenders).toEqual([])
  })
 })

 describe("VT_SYNC_LEGACY_TABLE_REDIRECTS integrity", () => {
  it("every redirect target is a real table definition", () => {
   const definedIds = new Set(VT_SYNC_TABLE_DEFINITIONS.map((t) => t.id))
   const brokenTargets: Array<{ from: string; to: string }> = []
   for (const [from, to] of Object.entries(VT_SYNC_LEGACY_TABLE_REDIRECTS)) {
    if (!definedIds.has(to)) brokenTargets.push({ from, to })
   }
   expect(brokenTargets).toEqual([])
  })

  it("no redirect source is itself in VT_SYNC_ACTIVE_TABLE_IDS (would double-count)", () => {
   const doubles = Object.keys(VT_SYNC_LEGACY_TABLE_REDIRECTS).filter((source) =>
    VT_SYNC_ACTIVE_TABLE_IDS.has(source),
   )
   expect(doubles).toEqual([])
  })

  it("no redirect chains — the target of a redirect is never itself redirected", () => {
   const chained: Array<{ from: string; to: string; further: string }> = []
   for (const [from, to] of Object.entries(VT_SYNC_LEGACY_TABLE_REDIRECTS)) {
    if (to in VT_SYNC_LEGACY_TABLE_REDIRECTS) {
     chained.push({ from, to, further: VT_SYNC_LEGACY_TABLE_REDIRECTS[to] })
    }
   }
   expect(chained).toEqual([])
  })

  it("resolveVtSyncCanonicalTableId resolves every legacy source to a defined table", () => {
   const definedIds = new Set(VT_SYNC_TABLE_DEFINITIONS.map((t) => t.id))
   for (const from of Object.keys(VT_SYNC_LEGACY_TABLE_REDIRECTS)) {
    const canonical = resolveVtSyncCanonicalTableId(from)
    expect(
     definedIds.has(canonical),
     `resolveVtSyncCanonicalTableId("${from}") -> "${canonical}" is not in VT_SYNC_TABLE_DEFINITIONS`,
    ).toBe(true)
   }
  })

  it("resolveVtSyncCanonicalTableId is a no-op for non-legacy IDs", () => {
   // Sample a few known-current IDs — resolver should return them unchanged.
   for (const id of ["videos", "daily", "channel_totals", "traffic"]) {
    expect(resolveVtSyncCanonicalTableId(id)).toBe(id)
   }
  })
 })

 describe("VT_SYNC_SYNC_UNITS ↔ tableRegistry consistency", () => {
  it("every sync unit's tableId resolves to a real table (via redirects if legacy)", () => {
   const definedIds = new Set(VT_SYNC_TABLE_DEFINITIONS.map((t) => t.id))
   const orphaned: Array<{ unit: string; tableId: string; canonical: string }> = []
   for (const unit of VT_SYNC_SYNC_UNITS) {
    const canonical = resolveVtSyncCanonicalTableId(unit.tableId)
    if (!definedIds.has(canonical)) {
     orphaned.push({ unit: unit.id, tableId: unit.tableId, canonical })
    }
   }
   expect(orphaned).toEqual([])
  })

  it("every sync unit's tableCategoryId matches the table's mainCategoryId (when set)", () => {
   const tablesById = new Map(VT_SYNC_TABLE_DEFINITIONS.map((t) => [t.id, t]))
   const mismatches: Array<{ unit: string; unitCat: string; tableCat: string | undefined }> = []
   for (const unit of VT_SYNC_SYNC_UNITS) {
    const canonical = resolveVtSyncCanonicalTableId(unit.tableId)
    const table = tablesById.get(canonical)
    if (!table || !table.mainCategoryId) continue
    if (table.mainCategoryId !== unit.tableCategoryId) {
     mismatches.push({ unit: unit.id, unitCat: unit.tableCategoryId, tableCat: table.mainCategoryId })
    }
   }
   expect(mismatches).toEqual([])
  })

  it("getVtSyncUnitCategoryIds returns each unit's declared categoryIds", () => {
   for (const unit of VT_SYNC_SYNC_UNITS) {
    expect(getVtSyncUnitCategoryIds(unit.id)).toEqual(unit.categoryIds)
   }
  })

  it("every unit's categoryIds are all known categories", () => {
   const knownCategoryIds = new Set(VT_SYNC_CATEGORY_OPTIONS.map((c) => c.id))
   const offenders: Array<{ unit: string; categoryId: string }> = []
   for (const unit of VT_SYNC_SYNC_UNITS) {
    for (const cid of unit.categoryIds) {
     if (!knownCategoryIds.has(cid)) offenders.push({ unit: unit.id, categoryId: cid })
    }
   }
   expect(offenders).toEqual([])
  })
 })

 describe("VT_SYNC_ACTIVE_TABLE_IDS derivation", () => {
  it("is non-empty (all sync units + visible categories can't produce zero)", () => {
   expect(VT_SYNC_ACTIVE_TABLE_IDS.size).toBeGreaterThan(0)
  })

  it("contains no legacy-redirect source IDs", () => {
   for (const source of Object.keys(VT_SYNC_LEGACY_TABLE_REDIRECTS)) {
    expect(
     VT_SYNC_ACTIVE_TABLE_IDS.has(source),
     `legacy source "${source}" should have been resolved away, not marked active`,
    ).toBe(false)
   }
  })

  it("every entry corresponds to a real table definition", () => {
   const definedIds = new Set(VT_SYNC_TABLE_DEFINITIONS.map((t) => t.id))
   const phantoms: string[] = []
   for (const id of VT_SYNC_ACTIVE_TABLE_IDS) {
    if (!definedIds.has(id)) phantoms.push(id)
   }
   expect(phantoms).toEqual([])
  })
 })

 describe("vt-2641 — Channel table Engagement/Revenue group dedup", () => {
  /*
   * Regression: an earlier refactor put netSubscribers and impressions BOTH into
   * their own duplicate Engagement/Revenue group headers on the far right of
   * the Channel Totals table (visible as two "Engagement" sections instead of
   * one). Fix landed by placing them adjacent to their canonical metric
   * families. This test locks it in.
   *
   *   netSubscribers  → Engagement group (single occurrence)
   *   impressions     → Revenue    group (single occurrence)
   *
   * If someone later moves either metric into a different group OR duplicates
   * them so more than one instance carries the same key, this fails loudly.
   */
  const channelTotals = VT_SYNC_TABLE_DEFINITIONS.find((d) => d.id === "channel_totals")

  it("channel_totals has exactly one netSubscribers column, in Engagement", () => {
   const netSubs = channelTotals?.columns.filter((c) => c.key === "netSubscribers") ?? []
   expect(netSubs.length, "expected exactly one netSubscribers column in channel_totals").toBe(1)
   expect(netSubs[0]?.group).toBe("Engagement")
  })

  it("channel_totals has exactly one impressions column, in Revenue", () => {
   const imps = channelTotals?.columns.filter((c) => c.key === "impressions") ?? []
   expect(imps.length, "expected exactly one impressions column in channel_totals").toBe(1)
   expect(imps[0]?.group).toBe("Revenue")
  })

  it("channel_totals has no duplicate column keys across the full table", () => {
   const keys = (channelTotals?.columns ?? []).map((c) => c.key)
   const dupes = keys.filter((k, i) => keys.indexOf(k) !== i)
   expect(dupes, "duplicate column keys in channel_totals").toEqual([])
  })
 })

 describe("Explicit anchors — the specific mappings August refactors bounced (vt-2643)", () => {
  /*
   * These are the individual table→dataset bindings the roadmap explicitly
   * calls out as "the tables that must be drawing from the intended upstream
   * dataset". Named one-by-one so a future silent flip is caught by name.
   */
  it("videos → performanceHubDatasetId 'videos'", () => {
   const t = VT_SYNC_TABLE_DEFINITIONS.find((d) => d.id === "videos")
   expect(t?.performanceHubDatasetId).toBe("videos")
  })
  it("daily → performanceHubDatasetId 'daily' + snapshotKeys ['dailyMetrics']", () => {
   const t = VT_SYNC_TABLE_DEFINITIONS.find((d) => d.id === "daily")
   expect(t?.performanceHubDatasetId).toBe("daily")
   expect(t?.snapshotKeys).toEqual(["dailyMetrics"])
  })
  it("monthly → performanceHubDatasetId 'monthly_api' + snapshotKeys ['monthlyMetrics']", () => {
   const t = VT_SYNC_TABLE_DEFINITIONS.find((d) => d.id === "monthly")
   expect(t?.performanceHubDatasetId).toBe("monthly_api")
   expect(t?.snapshotKeys).toEqual(["monthlyMetrics"])
  })
  it("channel_totals → performanceHubDatasetId 'channel_totals'", () => {
   const t = VT_SYNC_TABLE_DEFINITIONS.find((d) => d.id === "channel_totals")
   expect(t?.performanceHubDatasetId).toBe("channel_totals")
  })
  it("traffic → performanceHubDatasetId 'traffic' + snapshotKeys ['trafficSources']", () => {
   const t = VT_SYNC_TABLE_DEFINITIONS.find((d) => d.id === "traffic")
   expect(t?.performanceHubDatasetId).toBe("traffic")
   expect(t?.snapshotKeys).toEqual(["trafficSources"])
  })
  it("traffic_day → snapshotKeys ['trafficByDay']", () => {
   const t = VT_SYNC_TABLE_DEFINITIONS.find((d) => d.id === "traffic_day")
   expect(t?.snapshotKeys).toEqual(["trafficByDay"])
  })
  it("legacy 'monthly_api' redirects to 'monthly'", () => {
   expect(VT_SYNC_LEGACY_TABLE_REDIRECTS["monthly_api"]).toBe("monthly")
   expect(resolveVtSyncCanonicalTableId("monthly_api")).toBe("monthly")
  })
  it("legacy 'search' redirects to 'traffic_detail_search_terms'", () => {
   expect(VT_SYNC_LEGACY_TABLE_REDIRECTS["search"]).toBe("traffic_detail_search_terms")
  })
 })
})
