import type { VisualCanvasAspect, VisualCanvasFamily } from "./VisualCanvasViewport"

export type DataVisualModuleDensity = "normal" | "compact" | "dense"
export type DataVisualModuleOverflow = "clip" | "scroll" | "natural"

/**
 * Viewport buckets a Data Visual composes for. These are compositions, not
 * scaled copies of one another: each bucket may show a different number of
 * simultaneous marks, a different chrome arrangement and a different legend
 * treatment while rendering the same visualization over the same data.
 */
export type DataVisualViewportBucket = "desktop" | "landscape" | "portrait"

/**
 * Maximum number of simultaneous primary marks (columns, pillars, series
 * points, ticks) a module should draw in each bucket.
 *
 * Dense visuals reduce *simultaneous information density* on small screens
 * rather than shrinking desktop density into unreadable pixels; the remaining
 * data stays reachable through the module's declared overflow behaviour
 * (horizontal data navigation, pagination or range selection).
 */
export interface DataVisualOrientationProfile {
 desktop: number
 landscape: number
 portrait: number
}

/** @deprecated Kept as the original name of the shared per-orientation shape. */
export type DataVisualDensityProfile = DataVisualOrientationProfile

/**
 * Default per-orientation multiplier applied to mark geometry — bubble radii,
 * stroke widths, bar thickness, tile edges, marker radii.
 *
 * Density (how many marks) and scale (how big each mark is) are independent
 * decisions. A canvas that is correctly bounded still reads as a blob if it
 * draws desktop-sized marks into a phone-sized box.
 *
 * Portrait is the "halve it" instruction generalised; landscape sits between
 * because the landscape canvas is roughly 1.5x the portrait canvas area.
 */
export const DEFAULT_DATA_VISUAL_MARK_SCALE: DataVisualOrientationProfile = {
 desktop: 1,
 landscape: 0.6,
 portrait: 0.5,
}

/**
 * Legibility and touch floors. Scaling is a multiplier, not a licence to draw
 * marks nobody can read or hit, so every scaled value clamps to its floor.
 *
 * When a density budget and a floor cannot both be satisfied, **density gives
 * way** — draw fewer marks, never smaller ones than these.
 */
export const DATA_VISUAL_MARK_FLOORS = {
 /** Minimum hit area for an interactive mark, in CSS px (may exceed the visible mark). */
 touchTarget: 24,
 /** Below this a hairline disappears on low-DPR phones. */
 strokeWidth: 1.5,
 /** Below this the uppercase heavy faces stop resolving. */
 fontSize: 8,
 /** Below this a heat tile reads as noise rather than as one video. */
 tileEdge: 10,
 /** Below this a bubble is a dot and its area stops encoding anything. */
 bubbleRadius: 2,
} as const

export type DataVisualMarkFloor = keyof typeof DATA_VISUAL_MARK_FLOORS

/**
 * How a reader interacts with this module's primary marks.
 *
 * - `discrete` — each mark is a tap target in its own right (a treemap tile, a
 *   legend chip). The touch floor applies: if marks cannot be 24px and meet
 *   the density budget, density gives way.
 * - `field` — the mark is one cell in a dense field read primarily by colour
 *   or position (a heat matrix tile, a publish-clock slot, a scatter point).
 *   Per-mark tapping is a progressive enhancement over hover/focus and the
 *   active-context readout, so the touch floor does not apply — forcing 24px
 *   cells on a 7-day x 12-band clock would destroy the pattern the visual
 *   exists to show.
 *
 * `field` is an explicit, recorded decision rather than an oversight: a module
 * that omits this is treated as `discrete` and must meet the floor.
 */
export type DataVisualMarkInteraction = "discrete" | "field"

/**
 * What the canvas does with its aspect ratio on a phone in landscape.
 *
 * - `"fill"` — take the module's full width and whatever height is left under
 *   the chrome, and let the ratio fall out of that. A landscape phone is wide
 *   and short: holding a fixed 16:9 there makes height the binding constraint
 *   and leaves a third of the module width unused on either side of the
 *   evidence.
 * - a fixed aspect — hold that ratio and letterbox, for a visual whose reading
 *   genuinely depends on its proportions.
 *
 * Portrait and desktop always hold `canvasAspect`; only landscape is fluid,
 * and only there is the width actually going spare.
 */
export type DataVisualLandscapeAspect = VisualCanvasAspect | "fill"

export const DEFAULT_LANDSCAPE_ASPECT: DataVisualLandscapeAspect = "fill"

export interface DataVisualModuleCanvasContract {
 id: string
 family: VisualCanvasFamily
 /** Geometry of the outer evidence canvas. */
 canvasAspect: VisualCanvasAspect
 /**
  * Geometry of the internal plot, which is a separate concept from the outer
  * canvas. A radial module keeps a square plot centred inside a 16:9 evidence
  * canvas without the module itself ever becoming square.
  */
 plotAspect?: VisualCanvasAspect
 density?: DataVisualModuleDensity
 overflow?: DataVisualModuleOverflow
 /** How many simultaneous primary marks may be drawn. */
 densityProfile?: DataVisualOrientationProfile
 /**
  * How big each mark is drawn, as a multiplier on the renderer's desktop
  * geometry. Omit to take `DEFAULT_DATA_VISUAL_MARK_SCALE`.
  */
 markScale?: DataVisualOrientationProfile
 /**
  * Where the module's own count control starts in each composition. This is a
  * canvas-driven default, not a control redesign: the control keeps its full
  * range and the reader can still reach every value.
  */
 defaultSelection?: DataVisualOrientationProfile
 /**
  * How many sub-panels share one canvas — side-by-side plots, stacked plot
  * rows. A panel that does not fit becomes reachable (a switch), never clipped.
  */
 panelBudget?: DataVisualOrientationProfile
 /** How many simultaneous series / metric traces may be drawn. */
 seriesBudget?: DataVisualOrientationProfile
 /** Whether each mark is its own tap target, or one cell in a dense field. */
 markInteraction?: DataVisualMarkInteraction
 /** Landscape-phone aspect policy. Defaults to filling the available box. */
 landscapeAspect?: DataVisualLandscapeAspect
}

export const DATA_VISUAL_MODULE_CONTRACTS = {
 "shorts-retention": {
  id: "shorts-retention",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
  // Both in videos: the control opens at `defaultSelection` and cannot be
  // pushed past `densityProfile`, so the two never disagree on screen.
  densityProfile: { desktop: 200, landscape: 100, portrait: 50 },
  defaultSelection: { desktop: 100, landscape: 50, portrait: 25 },
  // Overlapping scatter points; the nearest-point readout is the tap affordance.
  markInteraction: "field",
 },
 /**
  * Production renderer is a 24-hour x 7-day publish grid, not a radial dial,
  * so the internal plot is left natural: forcing a 1:1 plot onto a 24x7 grid
  * would squash it. `clock-radial-burst` is the radial reference that carries
  * the wide-canvas / square-plot pattern.
  */
 "publish-optimal-clock": {
  id: "publish-optimal-clock",
  family: "spatial",
  canvasAspect: "16:9",
  plotAspect: "natural",
  density: "dense",
  overflow: "clip",
  // Hour bands. Landscape carries all 24 again: once the canvas fills the
  // module width instead of holding 16:9, it is ~810px wide, which draws 24
  // hour labels well clear of the legibility floor. Portrait still folds to 12.
  densityProfile: { desktop: 24, landscape: 24, portrait: 12 },
  // 7 day rows x 12+ hour bands; read by colour, hover names the slot.
  markInteraction: "field",
 },
 "clock-radial-burst": {
  id: "clock-radial-burst",
  family: "radial",
  canvasAspect: "16:9",
  plotAspect: "1:1",
  density: "compact",
  overflow: "clip",
  densityProfile: { desktop: 12, landscape: 10, portrait: 7 },
  // One donut plus its own legend on any phone, switchable. Once module chrome
  // is measured honestly the landscape canvas is ~400x225, where two panels
  // leave each legend rail too narrow to carry a source name at all.
  panelBudget: { desktop: 2, landscape: 1, portrait: 1 },
  // A 5% wedge cannot be 24px in a phone-sized donut at any density. The
  // wedge is a field mark read by angle and colour; the legend row beside it
  // is the full-width accessible picker for the same source.
  markInteraction: "field",
 },
 "heat-matrix": {
  id: "heat-matrix",
  family: "spatial",
  canvasAspect: "16:9",
  density: "dense",
  overflow: "clip",
  // One tile per video in a dense field; hover/lock drives the readout.
  markInteraction: "field",
  /**
   * Tile rows: the grid is 8 deep on desktop and 4 deep on a portrait phone.
   * No `densityProfile` here on purpose — the tile edge is set by the canvas
   * height and the tile floor, and how many columns that yields is an outcome,
   * not a cap. The renderer keeps its own minimum-visible-columns constant.
   *
   * Landscape is 5, not 6: the landscape canvas is very wide and very short, so
   * a sixth row costs every tile height it cannot win back in width, and the
   * grid ends up a narrow band adrift in a wide canvas.
   */
  defaultSelection: { desktop: 8, landscape: 5, portrait: 4 },
 },
 "traffic-source-evolution": {
  id: "traffic-source-evolution",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
  densityProfile: { desktop: 8, landscape: 6, portrait: 4 },
  seriesBudget: { desktop: 8, landscape: 6, portrait: 4 },
 },
 "engagement-pulse": {
  id: "engagement-pulse",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
  // The count control governs how many videos are plotted; the cap exists only
  // so an extreme choice cannot be drawn past legibility. It must never sit
  // below `defaultSelection`, or the control and the plot would disagree.
  densityProfile: { desktop: 50, landscape: 25, portrait: 20 },
  defaultSelection: { desktop: 25, landscape: 15, portrait: 10 },
  seriesBudget: { desktop: 4, landscape: 4, portrait: 3 },
 },
 "content-treemap": {
  id: "content-treemap",
  family: "spatial",
  canvasAspect: "16:9",
  density: "dense",
  overflow: "clip",
  densityProfile: { desktop: 12, landscape: 9, portrait: 6 },
  // Each pillar is a button the reader taps to drill in.
  markInteraction: "discrete",
 },
} as const satisfies Record<string, DataVisualModuleCanvasContract>

export type RegisteredDataVisualModuleId = keyof typeof DATA_VISUAL_MODULE_CONTRACTS

export const dataVisualModuleContract = (id: RegisteredDataVisualModuleId): DataVisualModuleCanvasContract => DATA_VISUAL_MODULE_CONTRACTS[id]

export const isRegisteredDataVisualModuleId = (id: string): id is RegisteredDataVisualModuleId => id in DATA_VISUAL_MODULE_CONTRACTS

/**
 * Simultaneous-mark budget for a module in one viewport bucket. Modules that
 * register no profile keep whatever density their renderer already chose.
 */
export const dataVisualDensityBudget = (
 id: RegisteredDataVisualModuleId,
 bucket: DataVisualViewportBucket,
): number | undefined => dataVisualModuleContract(id).densityProfile?.[bucket]

/** Mark-geometry multiplier for a module, falling back to the shared default. */
export const dataVisualMarkScale = (
 id: RegisteredDataVisualModuleId,
 bucket: DataVisualViewportBucket,
): number => dataVisualModuleContract(id).markScale?.[bucket] ?? DEFAULT_DATA_VISUAL_MARK_SCALE[bucket]

export const dataVisualDefaultSelection = (
 id: RegisteredDataVisualModuleId,
 bucket: DataVisualViewportBucket,
): number | undefined => dataVisualModuleContract(id).defaultSelection?.[bucket]

export const dataVisualPanelBudget = (
 id: RegisteredDataVisualModuleId,
 bucket: DataVisualViewportBucket,
): number | undefined => dataVisualModuleContract(id).panelBudget?.[bucket]

/** Landscape-phone aspect policy for a module. */
export const dataVisualLandscapeAspect = (
 id: RegisteredDataVisualModuleId,
): DataVisualLandscapeAspect => dataVisualModuleContract(id).landscapeAspect ?? DEFAULT_LANDSCAPE_ASPECT

/** Whether the touch floor applies to this module's marks. */
export const dataVisualMarkInteraction = (
 id: RegisteredDataVisualModuleId,
): DataVisualMarkInteraction => dataVisualModuleContract(id).markInteraction ?? "discrete"

export const dataVisualSeriesBudget = (
 id: RegisteredDataVisualModuleId,
 bucket: DataVisualViewportBucket,
): number | undefined => dataVisualModuleContract(id).seriesBudget?.[bucket]

/**
 * Scale one mark dimension and clamp it to its floor.
 *
 * The single place rounding and clamping happen, so no renderer re-derives a
 * floor and none of them drift apart.
 */
export const scaleMark = (base: number, scale: number, floor: DataVisualMarkFloor | number): number => {
 const limit = typeof floor === "number" ? floor : DATA_VISUAL_MARK_FLOORS[floor]
 if (!Number.isFinite(base) || base <= 0) return base
 return Math.max(limit, base * scale)
}
