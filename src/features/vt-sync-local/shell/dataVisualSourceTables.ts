/**
 * Which Annalytics tables each Data Visual actually reads.
 *
 * This replaces a substring-matching guess (`id.includes("traffic")`, with a
 * `["videos"]` catch-all) that was wrong for most of the collection: the Sankey
 * River Delta was reported as traffic-only although it also plots geography,
 * every Tube Explorer module fell through to "Videos" regardless of what it
 * drew, and a module whose id merely contained the word "revenue" was credited
 * with an Ad Types table it never touched.
 *
 * The values here are read off each module's own data path, not from its name:
 *
 * - Core and VT2 modules: the props their registry entry destructures.
 * - Tube Explorer modules: every one of them derives from `useExplorerData`,
 *   which builds its dataset from `data`, `csvFiles`, `trafficRows` and
 *   `geographyRows`; the entry below names the slices the module then reads
 *   (`dataset.traffic`, `dataset.geography`, `dataset.monthly`, …).
 * - Modules built on `buildExpansionDatasets` additionally parse the creator's
 *   imported CSVs out of the upload cache, so they carry `imported_csv`.
 *
 * `VtSyncVisualDataSourceProvider` turns these ids into the `DATA: …` line the
 * module shells print above every subtitle, so an entry being wrong here is
 * visible to the creator as a false provenance claim. A test asserts that every
 * registered visual has an entry and that no id is silently defaulted.
 */

/** Canonical table ids. Labels live in `VtSyncVisualDataSourceContext`. */
export type DataVisualSourceTableId =
 | "videos"
 | "daily"
 | "monthly"
 | "traffic"
 | "traffic_overview"
 | "traffic_details"
 | "traffic_day"
 | "geography"
 | "demographics"
 | "creator"
 | "imported_csv"

type Tables = readonly DataVisualSourceTableId[]

/** Tube Explorer modules that read nothing but the video catalog. */
const VIDEO_CATALOG: Tables = ["videos"]

export const DATA_VISUAL_SOURCE_TABLES: Record<string, Tables> = {
 // ── Core modules ─────────────────────────────────────────────────────────
 "combo-channel-progress": ["videos", "daily", "monthly"],
 "engagement-lines": VIDEO_CATALOG,
 "top-performers-trio": VIDEO_CATALOG,
 "format-comparison-donuts": ["videos", "creator"],
 "shorts-retention-widget": VIDEO_CATALOG,
 "algorithm-trigger": VIDEO_CATALOG,
 "revenue-distribution": VIDEO_CATALOG,
 "revenue-efficiency": VIDEO_CATALOG,
 "hook-effectiveness": VIDEO_CATALOG,
 // Reads `demographicRows` only — it never touches the video catalog.
 "age-gender-audience": ["demographics"],
 "subscribers-gained": VIDEO_CATALOG,
 "watch-time-distribution": VIDEO_CATALOG,
 "video-value-matrix": VIDEO_CATALOG,
 "growth-pulse": VIDEO_CATALOG,
 "signal-matrix": VIDEO_CATALOG,
 "custom-scatter": VIDEO_CATALOG,
 "traffic-source-evolution": ["videos", "traffic", "traffic_day", "imported_csv"],
 "keyword-treemap": ["videos", "imported_csv"],
 "keyword-venn": ["videos", "imported_csv"],
 "upload-time-heatmap": ["videos", "imported_csv"],
 "conversion-funnel": ["videos", "imported_csv"],
 "performance-gauges": ["videos", "imported_csv"],
 "lissajous-web": ["videos", "imported_csv"],
 "orbital": ["videos", "imported_csv"],

 // ── Tube Explorer modules ────────────────────────────────────────────────
 /*
  * Splits its traffic rows by `datasetKind`: the summary rows drive the
  * overview donut and the detail rows the drilldown. Deliberately NOT
  * `traffic_day` — the module excludes Traffic Source × Day by design.
  */
 "tube-explorer-clock-radial-burst": ["videos", "traffic_overview", "traffic_details"],
 "tube-explorer-barcode-fingerprint": VIDEO_CATALOG,
 "tube-explorer-views-subs-growth-quadrant": VIDEO_CATALOG,
 "tube-explorer-subscriber-waterfall": VIDEO_CATALOG,
 "tube-explorer-shorts-vs-longs": VIDEO_CATALOG,
 "tube-explorer-content-treemap": VIDEO_CATALOG,
 "tube-explorer-engagement-radar": VIDEO_CATALOG,
 "tube-explorer-traffic-day-river-delta": ["traffic", "traffic_day"],
 "tube-explorer-revenue-efficiency-map": VIDEO_CATALOG,
 "tube-explorer-like-rate-waveform": VIDEO_CATALOG,
 "tube-explorer-seasonality-radar": VIDEO_CATALOG,
 "tube-explorer-bubble-universe": VIDEO_CATALOG,
 "tube-explorer-retention-curve-atlas": VIDEO_CATALOG,
 "tube-explorer-publish-optimal-clock": VIDEO_CATALOG,
 "tube-explorer-sankey-river-delta": ["traffic", "geography"],
 "tube-explorer-title-word-network": VIDEO_CATALOG,
 "tube-explorer-channel-vital-signs": VIDEO_CATALOG,
 "tube-explorer-thermal-imaging": VIDEO_CATALOG,
 "tube-explorer-keyword-treemap": VIDEO_CATALOG,
 "tube-explorer-channel-health-radar": VIDEO_CATALOG,
 "tube-explorer-revenue-forecast": VIDEO_CATALOG,
 "tube-explorer-traffic-evolution": ["videos", "traffic"],
 "tube-explorer-video-value-matrix": VIDEO_CATALOG,
 "tube-explorer-sub-net-flow": VIDEO_CATALOG,
 "tube-explorer-content-donut": VIDEO_CATALOG,
 "tube-explorer-performance-gauges": VIDEO_CATALOG,
 "tube-explorer-revenue-waterfall": VIDEO_CATALOG,
 "tube-explorer-conversion-funnel": VIDEO_CATALOG,
 "tube-explorer-upload-heatmap": VIDEO_CATALOG,
 "tube-explorer-ecg-vitals-monitor": VIDEO_CATALOG,
 "tube-explorer-chrono-spiral": VIDEO_CATALOG,
 "tube-explorer-content-dna-gel": VIDEO_CATALOG,
 "tube-explorer-performance-waveform": VIDEO_CATALOG,
 "tube-explorer-orbital-system": VIDEO_CATALOG,
 "tube-explorer-lissajous-web": VIDEO_CATALOG,
 "tube-explorer-keyword-venn-chart": VIDEO_CATALOG,
 "tube-explorer-thermal-heatmap-grid": ["videos", "monthly"],
 "tube-explorer-emission-spectrum": ["videos", "geography"],
 "tube-explorer-stalactite-drip": VIDEO_CATALOG,
 "tube-explorer-contour-density-map": VIDEO_CATALOG,
 "tube-explorer-retention-mosaic": VIDEO_CATALOG,
 "tube-explorer-perfection-quadrant": VIDEO_CATALOG,
 "tube-explorer-duration-retention-scatter": VIDEO_CATALOG,
 "tube-explorer-beeswarm-like-rate": VIDEO_CATALOG,
 "tube-explorer-calendar-heat-signature": ["videos", "monthly"],
 "tube-explorer-us-state-dot-map": ["videos", "geography"],

 // ── Data Visuals 2 modules ───────────────────────────────────────────────
 "vt2-weekly-sparklines": ["videos", "daily"],
 "vt2-revenue-mosaic": VIDEO_CATALOG,
 "vt2-search-term-gravity": ["videos", "traffic"],
 "vt2-video-fingerprint": VIDEO_CATALOG,
 "vt2-channel-big-bang": ["videos", "daily"],
 "vt2-trajectory-forecaster": ["videos", "daily"],
 "vt2-multi-metric-timeline": ["videos", "daily"],
}

/**
 * Tables a visual reads, or an empty list when the visual is not registered.
 *
 * Deliberately NOT falling back to `["videos"]`: an unregistered visual should
 * print no provenance line at all rather than a guess the creator would read as
 * a fact. The registry test fails before that can reach anyone.
 */
export const dataVisualSourceTables = (id: string): Tables =>
 DATA_VISUAL_SOURCE_TABLES[id] ?? []
