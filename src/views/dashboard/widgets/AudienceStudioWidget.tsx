import React, { useMemo, useState } from "react"
import { Globe, Monitor, Smartphone, Tv, DollarSign, BarChart2 } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetHeaderToggle, WidgetScrollArea, WidgetMetric } from "../WidgetPrimitives"
import { formatTrafficSourceNickname } from "../../../services/dataUtils"
import { getVtSyncSnapshot } from "../../../features/vt-sync-local"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"

type AudienceTab = "geography" | "traffic" | "devices" | "cpm"

interface AudienceStudioProps extends CommonWidgetProps {
  data: DashboardData
  initialTab?: AudienceTab
}

export const AudienceStudioWidget: React.FC<AudienceStudioProps> = ({
  data,
  initialTab = "geography",
  ...common
}) => {
  const [activeTab, setActiveTab] = useState<AudienceTab>(initialTab)
  const [selectedDevice, setSelectedDevice] = useState<"mobile" | "desktop" | "tv">("mobile")

  // Matrix and distribution data
  const matrixData = useMemo(() => {
    let baseViews = 10000

    if (data?.statBlocks28d) {
      const viewsBlock = data.statBlocks28d.find((b: any) =>
        b.label?.toLowerCase().includes("views")
      )
      if (viewsBlock) {
        const valStr = String(viewsBlock.value).replace(/,/g, "")
        if (valStr.includes("K")) baseViews = parseFloat(valStr) * 1000
        else if (valStr.includes("M")) baseViews = parseFloat(valStr) * 1000000
        else baseViews = parseFloat(valStr) || 10000
      }
    }

    const snapshot = getVtSyncSnapshot()

    const ts = snapshot.trafficSources?.length ? snapshot.trafficSources : data?.trafficSources || []
    const origins =
      ts.length > 0
        ? ts.slice(0, 4).map((s: any, idx: number) => ({
            name: formatTrafficSourceNickname(s.label || s.trafficSource),
            value: s.viewsPct ?? s.pct ?? Number(s.views) ?? 0,
            color: ["#FF83EA", "#24D3FF", "#C9F830", "#eee"][idx] || "#eee",
          }))
        : [
            { name: "Browse", value: baseViews * 0.45, color: "#FF83EA" },
            { name: "Suggested", value: baseViews * 0.3, color: "#24D3FF" },
            { name: "Search", value: baseViews * 0.15, color: "#C9F830" },
            { name: "External", value: baseViews * 0.1, color: "#eee" },
          ]

    const geoSrc = snapshot.geography?.length ? snapshot.geography : data?.geography || []
    const geo =
      geoSrc.length > 0
        ? geoSrc.slice(0, 5).map((s: any, idx: number) => ({
            name: s.label || s.geography,
            value: s.viewsPct ?? s.pct ?? Number(s.views) ?? 0,
            color: ["#4FFF5B", "#C9F830", "#24D3FF", "#FF83EA", "#eee"][idx] || "#eee",
          }))
        : [
            { name: "US", value: baseViews * 0.42, color: "#4FFF5B" },
            { name: "UK", value: baseViews * 0.18, color: "#C9F830" },
            { name: "CA", value: baseViews * 0.12, color: "#24D3FF" },
            { name: "DE", value: baseViews * 0.08, color: "#FF83EA" },
            { name: "AU", value: baseViews * 0.06, color: "#eee" },
          ]

    return { origins, geo }
  }, [data])

  const headerControls = (
    <WidgetHeaderToggle
      label="Audience View"
      value={activeTab}
      items={[
        { id: "geography", label: "GEO" },
        { id: "traffic", label: "TRAFFIC" },
        { id: "devices", label: "DEVICES" },
        { id: "cpm", label: "CPM" },
      ]}
      onChange={(id) => setActiveTab(id as AudienceTab)}
    />
  )

  return (
    <WidgetShell
      {...common}
      icon={<Globe size={22} />}
      headerContent={headerControls}
    >
      <div className="widget-workspace widget-form-stack" style={{ gap: "var(--widget-component-gap, 6px)" }}>
        <WidgetScrollArea ariaLabel="Audience intelligence" contentClassName="flex flex-col gap-2 min-h-full">
          {/* ── TAB 1: GEOGRAPHY ── */}
          {activeTab === "geography" && (
            <div className="widget-bar-stack">
              <span className="text-[9px] font-mono font-black uppercase opacity-60">Top Viewer Regions</span>
              {matrixData.geo.map((g) => (
                <div key={g.name} className="widget-bar-item">
                  <div className="flex justify-between items-center text-[10px] font-mono font-black">
                    <span>{g.name}</span>
                    <span>{typeof g.value === "number" ? `${Math.round(g.value)}%` : g.value}</span>
                  </div>
                  <div className="widget-bar-track">
                    <div
                      className="widget-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(8, Number(g.value) || 10))}%`,
                        backgroundColor: g.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB 2: TRAFFIC SOURCES ── */}
          {activeTab === "traffic" && (
            <div className="widget-bar-stack">
              <span className="text-[9px] font-mono font-black uppercase opacity-60">Traffic Origins</span>
              {matrixData.origins.map((o) => (
                <div key={o.name} className="widget-bar-item">
                  <div className="flex justify-between items-center text-[10px] font-mono font-black">
                    <span>{o.name}</span>
                    <span>{typeof o.value === "number" ? `${Math.round(o.value)}%` : o.value}</span>
                  </div>
                  <div className="widget-bar-track">
                    <div
                      className="widget-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(8, Number(o.value) || 10))}%`,
                        backgroundColor: o.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB 3: DEVICES ── */}
          {activeTab === "devices" && (
            <div className="flex flex-col gap-2 h-full">
              <div className="flex rounded-lg overflow-hidden border-2 border-black">
                <button
                  type="button"
                  onClick={() => setSelectedDevice("mobile")}
                  className={`flex-1 flex justify-center items-center py-1.5 ${
                    selectedDevice === "mobile" ? "bg-black text-[#FFB570]" : "bg-white text-black"
                  }`}
                >
                  <Smartphone size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDevice("desktop")}
                  className={`flex-1 flex justify-center items-center py-1.5 border-x-2 border-black ${
                    selectedDevice === "desktop" ? "bg-black text-[#FFB570]" : "bg-white text-black"
                  }`}
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDevice("tv")}
                  className={`flex-1 flex justify-center items-center py-1.5 ${
                    selectedDevice === "tv" ? "bg-black text-[#FFB570]" : "bg-white text-black"
                  }`}
                >
                  <Tv size={14} />
                </button>
              </div>

              <div className="flex-1 bg-white border-2 border-black rounded-lg p-3 flex items-center justify-center relative min-h-[90px]">
                <div
                  className={`bg-white border-2 border-black flex overflow-hidden ${
                    selectedDevice === "mobile" ? "flex-col w-[54px] h-[86px] rounded-sm" : ""
                  } ${selectedDevice === "desktop" ? "flex-col w-[110px] h-[75px] rounded-md" : ""} ${
                    selectedDevice === "tv" ? "w-full h-[80px] rounded-md object-cover relative" : ""
                  }`}
                >
                  <div
                    className={`bg-gray-300 border-black ${
                      selectedDevice === "tv" ? "w-full h-full" : "w-full h-1/2 border-b-2"
                    }`}
                  />
                  {selectedDevice !== "tv" && (
                    <div className="p-1">
                      <div className="bg-black h-1 rounded mb-1 w-full" />
                      <div className="bg-gray-400 h-1 rounded w-2/3" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1.5 right-1.5 px-1 bg-black text-[#FFB570] text-[8px] font-mono font-black uppercase rounded">
                  {selectedDevice.toUpperCase()} VIEW
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: CPM & MONETIZATION ── */}
          {activeTab === "cpm" && (
            <div className="flex flex-col gap-2">
              <div className="widget-kpi-grid is-2-up">
                <WidgetMetric
                  label="Top CPM Geo"
                  value="Australia"
                  variant="kpi"
                />
                <WidgetMetric
                  label="Avg Playback CPM"
                  value="$18.40"
                  variant="kpi"
                />
              </div>

              <div className="widget-kpi-grid is-2-up">
                <WidgetMetric
                  label="US Playback CPM"
                  value="$16.20"
                  variant="kpi"
                />
                <WidgetMetric
                  label="UK Playback CPM"
                  value="$14.80"
                  variant="kpi"
                />
              </div>
            </div>
          )}
        </WidgetScrollArea>
      </div>
    </WidgetShell>
  )
}
