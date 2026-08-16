import React, { createContext, useContext, useMemo } from "react"

const VtSyncVisualDataSourceContext = createContext("")

const SOURCE_TABLE_LABELS: Record<string, string> = {
 videos: "Videos", daily: "Daily Stats", traffic_day: "Traffic × Day", channel_totals: "Channel Totals",
 traffic: "Traffic Sources", traffic_overview: "Traffic Overview", traffic_details: "Traffic Details", demographics: "Demographics", geography: "Geography",
 revenue: "Revenue", ads: "Ad Types", playlists: "Playlists", retention: "Audience Retention", audience: "Audience",
}

const humanizeTableId = (tableId: string) => tableId.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())

/** The provenance prefix always comes before a visual's own explanatory copy. */
export const formatVtSyncVisualDataSourcePrefix = (sourceTableIds: readonly string[]) => {
 const labels = [...new Set(sourceTableIds.map((tableId) => SOURCE_TABLE_LABELS[tableId] || humanizeTableId(tableId)))]
 return labels.length ? `DATA: ${labels.join(" + ")}`.toUpperCase() : ""
}

export const VtSyncVisualDataSourceProvider: React.FC<{ sourceTableIds: readonly string[]; children: React.ReactNode }> = ({ sourceTableIds, children }) => {
 const prefix = useMemo(() => formatVtSyncVisualDataSourcePrefix(sourceTableIds), [sourceTableIds])
 return <VtSyncVisualDataSourceContext.Provider value={prefix}>{children}</VtSyncVisualDataSourceContext.Provider>
}

export const useVtSyncVisualDataSourcePrefix = () => useContext(VtSyncVisualDataSourceContext)
