import type { VtSyncCategoryGroup, VtSyncSyncUnitDefinition } from "../adapters/contracts"
import { getVtSyncAvailableTrafficDetailSources } from "./trafficDetailRegistry"

export const VT_SYNC_GROUP_ORDER: VtSyncCategoryGroup[] = [
 "channel",
 "time",
 "traffic",
 "audience",
 "geography",
 "revenue",
]

export const VT_SYNC_GROUP_LABELS: Record<VtSyncCategoryGroup, string> = {
 channel: "Channel",
 time: "Time",
 videos: "Videos",
 traffic: "Traffic",
 audience: "Audience",
 geography: "Geography",
 device: "Devices",
 revenue: "Revenue",
 playlists: "Playlists",
 retention: "Retention",
 workspace: "Workspace",
}

const unit = (
 id: string,
 label: string,
 description: string,
 group: VtSyncSyncUnitDefinition["group"],
 tableCategoryId: string,
 tableId: string,
 categoryId: string,
 defaultEnabled = false,
 refreshPolicy: VtSyncSyncUnitDefinition["refreshPolicy"] = "on_demand",
): VtSyncSyncUnitDefinition => ({ id, label, description, group, tableCategoryId, tableId, categoryIds: [categoryId], defaultEnabled, refreshPolicy })

/**
 * The controller owns user-facing sync outcomes, not implementation phases.
 * Each named query is displayed and executed under one owning unit in the
 * controller and progress rail. Internal phases may share one table-level
 * switch, but selecting another unit must not auto-run those phases.
 */
export const VT_SYNC_SYNC_UNITS: VtSyncSyncUnitDefinition[] = [
 { id: "channel_overview_windows", label: "Channel Overview + Windows", description: "Channel identity, public counts, and lifetime and rolling channel totals.", group: "channel", tableCategoryId: "channel_totals", tableId: "channel_totals", categoryIds: ["channel_metadata", "channel_totals"], defaultEnabled: true, refreshPolicy: "each_run" },
 { id: "video_catalog", label: "Video Catalog & Analytics", description: "Catalog inventory, metadata, and per-video Analytics.", group: "channel", tableCategoryId: "videos", tableId: "videos", categoryIds: ["uploads_playlist", "video_metadata", "videos_analytics"], defaultEnabled: true, refreshPolicy: "daily_incremental" },
 unit("daily_stats", "Daily Stats", "Day-by-day channel-wide analytics.", "time", "daily", "daily", "daily_metrics", true, "each_run"),
 unit("monthly_stats", "Monthly Stats", "API-native calendar-month channel analytics.", "time", "daily", "monthly", "monthly_metrics", false, "each_run"),
 unit("traffic_by_day", "Traffic × Day", "Daily performance split by traffic source.", "time", "daily", "traffic_day", "traffic_day"),
 unit("traffic_overview", "Traffic Overview", "High-level source distribution.", "traffic", "traffic", "traffic", "traffic_overview", true, "each_run"),
 unit("audience_demographics", "Audience Demographics", "Age and gender audience analytics.", "audience", "demographics", "demographics", "audience_demographics", true, "each_run"),
 unit("content_type", "Formats", "Performance by creator content type.", "channel", "content", "creator", "creator_content_type"),
 unit("formats_subscriber_status", "Formats x Subscriber Status", "Creator content type performance split by subscribed status.", "channel", "content", "formats_subscribers", "formats_subscriber_status"),
 unit("sharing_services", "Sharing Services", "Where viewers share videos.", "channel", "content", "shares", "sharing_service"),
 unit("playback_locations", "Playback Locations", "Where viewers watch videos.", "channel", "traffic", "locations", "playback_location"),
 unit("subscription_status", "Subscriber Status", "Subscribed versus unsubscribed audience analytics.", "channel", "channel_totals", "subs", "subscription_status"),
 unit("geography_country", "Countries", "Country geography analytics.", "geography", "geography", "geography", "geography_country", true, "each_run"),
 unit("geography_city", "Cities", "City geography analytics.", "geography", "geography", "cities", "geography_city"),
 unit("geography_province", "US States", "State geography analytics.", "geography", "geography", "provinces", "geography_province"),
 unit("geography_dma", "DMA Regions", "DMA geography analytics.", "geography", "geography", "dma", "geography_dma"),
 unit("device_type", "Devices", "Device-type analytics.", "audience", "devices", "devices", "device_type"),
 unit("operating_system", "Operating Systems", "Operating-system analytics.", "audience", "devices", "os", "operating_system"),
 unit("device_os", "Device × OS", "Combined device and operating-system analytics.", "audience", "devices", "device_os", "device_os"),
 unit("playlists", "Playlists", "Playlist performance analytics.", "channel", "playlists", "playlists", "playlists_analytics"),
 unit("revenue_source", "Revenue Sources", "Revenue source analytics.", "revenue", "revenue", "revenue", "revenue_source"),
 unit("ad_type", "Ad Types", "Advertising type analytics.", "revenue", "revenue", "ads", "ad_type"),
 unit("retention", "Retention", "Selected-video audience retention curves.", "channel", "content", "retentions", "retention"),
]

VT_SYNC_SYNC_UNITS.push(...getVtSyncAvailableTrafficDetailSources().map(({ categoryId, label, sourceType }) => unit(
 `traffic_detail_${categoryId}`,
 label,
 `${sourceType} source-detail report.`,
 categoryId === "traffic_subscribers" ? "audience" : "traffic",
 "traffic",
 `traffic_detail_${categoryId}`,
 categoryId,
)))

export const getVtSyncDefaultUnitIds = () => VT_SYNC_SYNC_UNITS.filter((entry) => entry.defaultEnabled).map((entry) => entry.id)
export const getVtSyncUnitCategoryIds = (unitId: string) => VT_SYNC_SYNC_UNITS.find((entry) => entry.id === unitId)?.categoryIds || []
