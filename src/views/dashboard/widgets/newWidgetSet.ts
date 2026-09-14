import type React from "react"
import type { WidgetDefinitionBase } from "../types"
import { getDashboardWidgetPaletteColors } from "../../../styles/toolboxPalette"
import { ChannelProgressWidget } from "./ChannelProgressWidget"
import { NextBestActionWidget } from "./NextBestActionWidget"
import { AnomalyRadarWidget } from "./AnomalyRadarWidget"
import { ContentPipelineWidget } from "./ContentPipelineWidget"
import { AudienceRequestsWidget } from "./AudienceRequestsWidget"
import "./newWidgetSet.css"

export const NEW_WIDGET_DEFINITIONS: WidgetDefinitionBase[] = [
  { id: "channel-progress", title: "Channel Progress", subtitle: "Trajectory against current channel targets", category: "analytics", defaultSize: "half", minSize: "third", maxSize: "full", defaultHeight: "medium", minHeight: "short", maxHeight: "tall", ...getDashboardWidgetPaletteColors(55), dependency: ["youtube_analytics_v2"], status: "prototype" },
  { id: "next-best-action", title: "Next Best Action", subtitle: "Highest-value creator move from current evidence", category: "ai", defaultSize: "half", minSize: "third", maxSize: "full", defaultHeight: "medium", minHeight: "short", maxHeight: "tall", ...getDashboardWidgetPaletteColors(56), dependency: ["none"], status: "prototype" },
  { id: "anomaly-radar", title: "Anomaly Radar", subtitle: "Spikes and drops outside the recent baseline", category: "analytics", defaultSize: "half", minSize: "third", maxSize: "full", defaultHeight: "tall", minHeight: "medium", maxHeight: "xtall", ...getDashboardWidgetPaletteColors(57), dependency: ["youtube_analytics_v2"], status: "prototype" },
  { id: "content-pipeline", title: "Content Pipeline", subtitle: "Idea to published workflow pulse", category: "creation", defaultSize: "half", minSize: "third", maxSize: "full", defaultHeight: "tall", minHeight: "medium", maxHeight: "xtall", ...getDashboardWidgetPaletteColors(58), dependency: ["none"], status: "prototype" },
  { id: "audience-requests", title: "Audience Requests", subtitle: "Viewer requests converted into content opportunities", category: "community", defaultSize: "half", minSize: "third", maxSize: "full", defaultHeight: "tall", minHeight: "medium", maxHeight: "xtall", ...getDashboardWidgetPaletteColors(59), dependency: ["youtube_data_v3"], status: "prototype" },
]

export const NEW_WIDGET_RENDERERS: Record<string, React.ComponentType<any>> = {
  "channel-progress": ChannelProgressWidget,
  "next-best-action": NextBestActionWidget,
  "anomaly-radar": AnomalyRadarWidget,
  "content-pipeline": ContentPipelineWidget,
  "audience-requests": AudienceRequestsWidget,
}

export const NEW_WIDGET_IDS = NEW_WIDGET_DEFINITIONS.map((widget) => widget.id)
