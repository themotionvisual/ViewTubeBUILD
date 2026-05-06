import React, { useMemo, useState } from "react"
import { Pin, PinOff } from "lucide-react"
import { ChartRendererSurface, getSpanClassForChartSize } from "../referenceStudio/chartSystem"
import { useCanonicalAnalytics } from "../referenceStudio/useCanonicalAnalytics"
import { toChartCard40 } from "./adapter"
import { evaluateChartCapability40 } from "./capability"
import { CHART_PACK_LABELS_40, CHART_SPECS_40, type ChartPack40 } from "./chartSpec40"
import { CHART_REGISTRY_40, getChartLifecycleStage } from "./chartRegistry"
import { buildPromotionSnapshot } from "./promotionAdapter"

const PACK_ORDER: ChartPack40[] = [
  "revenue",
  "growth",
  "retention",
  "audience",
  "packaging",
  "experimental",
]

const statusTone = (status: "ready" | "limited" | "unavailable"): string => {
  if (status === "ready") return "bg-[#CCFF00]"
  if (status === "limited") return "bg-[#FFE357]"
  return "bg-[#FF7497]"
}

export const PerformanceHubChartRollout: React.FC = () => {
  const analytics = useCanonicalAnalytics("28d")
  const [activePack, setActivePack] = useState<ChartPack40>("revenue")
  const [pinnedHeroes, setPinnedHeroes] = useState<string[]>([])
  const snapshot = useMemo(() => buildPromotionSnapshot(analytics), [analytics])

  const charts = useMemo(() => {
    return CHART_SPECS_40.map((spec) => ({
      spec,
      card: toChartCard40(spec),
      capability: evaluateChartCapability40(spec, analytics),
    }))
  }, [analytics])

  const packCharts = charts.filter((entry) => entry.spec.pack === activePack)
  const heroCharts = charts.filter((entry) => entry.spec.standalone && pinnedHeroes.includes(entry.spec.id))
  const promotedCharts = charts.filter(
    (entry) => getChartLifecycleStage(entry.spec.id) === "production",
  )

  const togglePin = (id: string) => {
    setPinnedHeroes((current) => {
      if (current.includes(id)) return current.filter((entry) => entry !== id)
      return [...current, id]
    })
  }

  return (
    <div className="space-y-4">
      <div className="border-[3px] border-black rounded-xl bg-white p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.12em]">
          Promotion Snapshot
        </div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="border-[2px] border-black rounded-lg p-2 text-[10px] font-black uppercase">
            Rows: {snapshot.totalRows.toLocaleString()}
          </div>
          <div className="border-[2px] border-black rounded-lg p-2 text-[10px] font-black uppercase">
            Views: {Math.round(snapshot.totals.views).toLocaleString()}
          </div>
          <div className="border-[2px] border-black rounded-lg p-2 text-[10px] font-black uppercase">
            Watch Hours: {Math.round(snapshot.totals.watchHours).toLocaleString()}
          </div>
          <div className="border-[2px] border-black rounded-lg p-2 text-[10px] font-black uppercase">
            Revenue: ${snapshot.totals.revenue.toFixed(2)}
          </div>
        </div>
        <div className="mt-3 text-[9px] font-black uppercase tracking-[0.1em] text-black/70">
          Promoted now: {promotedCharts.map((entry) => entry.spec.title).join(", ") || "None"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PACK_ORDER.map((pack) => (
          <button
            key={pack}
            onClick={() => setActivePack(pack)}
            className={`px-3 py-2 border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-wider ${
              activePack === pack ? "bg-[#00CCFF] text-black" : "bg-white text-black"
            }`}
          >
            {CHART_PACK_LABELS_40[pack]}
          </button>
        ))}
      </div>

      {heroCharts.length > 0 && (
        <div className="border-[3px] border-black rounded-xl bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.12em] mb-3">Pinned Hero Charts</div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {heroCharts.map((entry) => (
              <div key={`hero-${entry.spec.id}`} className={`space-y-2 ${getSpanClassForChartSize(entry.card.size)}`}>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black uppercase">{entry.spec.title}</div>
                  <button
                    onClick={() => togglePin(entry.spec.id)}
                    className="h-7 px-2 border-[2px] border-black rounded bg-[#FFE357] text-[9px] font-black uppercase inline-flex items-center gap-1"
                  >
                    <PinOff size={12} /> Unpin
                  </button>
                </div>
                <div className="h-[250px] border-[3px] border-black rounded-xl bg-white p-2">
                  <ChartRendererSurface card={entry.card} analytics={analytics} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {packCharts.map((entry) => {
          const { readiness, missingHard, missingSoft } = entry.capability
          return (
            <div key={entry.spec.id} className={`${getSpanClassForChartSize(entry.card.size)} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-black uppercase">{entry.spec.title}</div>
                <span className="h-7 px-2 border-[2px] border-black rounded bg-white text-[9px] font-black uppercase inline-flex items-center">
                  {getChartLifecycleStage(entry.spec.id)}
                </span>
                {entry.spec.standalone ? (
                  <button
                    onClick={() => togglePin(entry.spec.id)}
                    className="h-7 px-2 border-[2px] border-black rounded bg-white text-[9px] font-black uppercase inline-flex items-center gap-1"
                  >
                    <Pin size={12} /> {pinnedHeroes.includes(entry.spec.id) ? "Pinned" : "Pin"}
                  </button>
                ) : null}
              </div>
              <div className={`h-[260px] border-[3px] border-black rounded-xl p-2 ${statusTone(readiness)}`}>
                {readiness === "unavailable" ? (
                  <div className="h-full w-full border-[2px] border-black rounded-lg bg-white p-4">
                    <div className="text-[11px] font-black uppercase">Missing Required Metrics</div>
                    <div className="mt-2 text-[10px] font-bold">
                      {missingHard.join(", ") || "Unavailable"}
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full border-[2px] border-black rounded-lg bg-white p-2">
                    <ChartRendererSurface card={entry.card} analytics={analytics} />
                    {readiness === "limited" && (
                      <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-black/65">
                        Limited data: {missingSoft.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-black/65">
                Source route:{" "}
                {CHART_REGISTRY_40.find((item) => item.chartId === entry.spec.id)
                  ?.sourceRoute || "/reference-studio"}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

