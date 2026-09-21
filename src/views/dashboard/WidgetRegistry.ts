import { assertUniqueIds } from "../../services/registryAssertions"
import { HEIGHT_BUCKET_ORDER, SIZE_BUCKET_ORDER } from "./tokens"
import type { DashboardHeightBucket, DashboardSizeBucket, WidgetDefinition } from "./types"
import {
 DEFAULT_DASHBOARD_ROWS,
 SUPPORTED_DASHBOARD_WIDGET_IDS,
 DASHBOARD_WIDGET_REGISTRY as BASE_WIDGET_REGISTRY,
 WIDGET_DESCRIPTIONS as BASE_WIDGET_DESCRIPTIONS,
} from "./WidgetRegistryBase"
import { NEW_WIDGET_DEFINITIONS } from "./widgets/newWidgetSet"

export { DEFAULT_DASHBOARD_ROWS, SUPPORTED_DASHBOARD_WIDGET_IDS }

const inclusiveBucketRange = <T extends string>(order: readonly T[], minimum: T, maximum: T): readonly T[] => {
 const minIndex = Math.max(0, order.indexOf(minimum))
 const maxIndex = Math.max(minIndex, order.indexOf(maximum))
 return order.slice(minIndex, maxIndex + 1)
}

const NEW_REGISTERED_WIDGETS: WidgetDefinition[] = NEW_WIDGET_DEFINITIONS.map((widget, index) => {
 const supportedSizes = inclusiveBucketRange<DashboardSizeBucket>(SIZE_BUCKET_ORDER, widget.minSize, widget.maxSize)
 const supportedHeights = inclusiveBucketRange<DashboardHeightBucket>(HEIGHT_BUCKET_ORDER, widget.minHeight, widget.maxHeight)
 return {
  ...widget,
  status: "ready",
  rendererKey: widget.id,
  releaseTier: "preview",
  defaultVisible: false,
  defaultOrder: BASE_WIDGET_REGISTRY.length + index,
  supportedSizes,
  supportedHeights,
  supportedDimensions: supportedSizes.flatMap((size) => supportedHeights.map((height) => ({ size, height }))),
  responsiveMode: "container",
 }
})

export const DASHBOARD_WIDGET_REGISTRY: WidgetDefinition[] = [...BASE_WIDGET_REGISTRY, ...NEW_REGISTERED_WIDGETS]

if (import.meta.env.DEV) {
 assertUniqueIds(DASHBOARD_WIDGET_REGISTRY, (widget) => widget.id, "Dashboard widget registry")
}

export const DEFAULT_DASHBOARD_WIDGET_ORDER = [...DASHBOARD_WIDGET_REGISTRY]
 .sort((left, right) => left.defaultOrder - right.defaultOrder)
 .map((widget) => widget.id)

export const DASHBOARD_WIDGET_BY_ID = Object.fromEntries(DASHBOARD_WIDGET_REGISTRY.map((widget) => [widget.id, widget]))

export const WIDGET_DESCRIPTIONS: Record<string, { short: string; detailed: string }> = {
 ...BASE_WIDGET_DESCRIPTIONS,
 "channel-progress": { short: "TRACK CHANNEL TRAJECTORY AGAINST ACTIVE TARGETS.", detailed: "Compare current channel performance with active growth targets and use the trajectory signal to decide where to focus next." },
 "next-best-action": { short: "SURFACE THE HIGHEST-VALUE NEXT CREATOR ACTION.", detailed: "Turn current channel evidence into one prioritized action with direct handoffs to the relevant ViewTube workspace." },
 "anomaly-radar": { short: "DETECT UNUSUAL PERFORMANCE SPIKES AND DROPS.", detailed: "Compare recent performance against baseline behavior to surface meaningful changes in views, subscribers, revenue, and related signals." },
 "content-pipeline": { short: "FOLLOW CONTENT FROM IDEA THROUGH PUBLISH.", detailed: "See the current production pulse across ideation, build, ready, and published stages and jump directly into Projects." },
 "audience-requests": { short: "TURN VIEWER REQUESTS INTO CONTENT OPPORTUNITIES.", detailed: "Surface recurring audience questions and requests, preserve their evidence, and route promising ideas into the production workflow." },
 "video-director": { short: "DIRECT GENERATED VIDEO FROM ONE SHARED VIDEO DNA SYSTEM.", detailed: "Use the compact Dashboard execution surface for briefs, scoped Director settings, storyboard shots, variation permissions, generation planning, queue progress, and direct handoff to the expanded Studio Hub Video Director." },
 "video-asset-engine": { short: "ASSEMBLE DURABLE CREATOR ASSETS INTO ONE TRACEABLE VIDEO PACKAGE.", detailed: "Use canonical Asset Engine and Vault records to inspect package readiness, select recent assets, follow lineage, and hand work into Studio, Editor, or Vault without creating a second asset store." },
 "brain-control": { short: "GOVERN WHAT THE VIEWTUBE BRAIN KNOWS AND MAY DO.", detailed: "Inspect objective, context, tools, permissions and execution state; stage approval-aware directives; stop pending work; and review the local control audit." },
}
