import React, { useMemo } from "react"
import { Globe } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { formatTrafficSourceNickname } from "../../../services/dataUtils"
import { getVtSyncSnapshot } from "../../../features/vt-sync-local"
import {
  WidgetInteriorBody,
  WidgetVisualFrame,
} from "../../../features/vt-widgets/interior-grid"

/**
 * AudienceMatrixWidget — canonical 4-pie 1:1 audience view.
 *
 * Interior grid composition:
 *   WidgetInteriorBody (cols=4, fill)
 *     └── WidgetVisualFrame (rows=4, cols=4, ratio=1/1)   -- the matrix square
 *           └── 2×2 grid of 4 pies (Geo / Device / Source / Share)
 *
 * See viewtube-widget-interior-grid skill. Data derivation is ported from
 * the brain-owner-consent reference; the pie renderer stays inline because
 * the conic-gradient math is per-instance and not shared elsewhere.
 */

type PieDatum = { name: string; value: number; color: string }

const renderPie = (title: string, chartData: PieDatum[]) => {
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0)
  let cursor = 0
  const stops = chartData
    .map((entry) => {
      const pct = total > 0 ? (entry.value / total) * 100 : 0
      const start = cursor
      const end = cursor + pct
      cursor = end
      return `${entry.color} ${start}% ${end}%`
    })
    .join(", ")

  return (
    <div
      key={title}
      className="vt-pie"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        inlineSize: "100%",
        blockSize: "100%",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <div
        style={{
          inlineSize: "100%",
          blockSize: "100%",
          borderRadius: "50%",
          background: `conic-gradient(${stops})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "clamp(14px, 3.4cqi, 27px)",
            fontWeight: 1000,
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1,
            WebkitTextStroke: "2px #000",
            pointerEvents: "none",
          }}
        >
          {title}
        </span>
      </div>
    </div>
  )
}

export const AudienceMatrixWidget: React.FC<any> = ({
  widget,
  instance,
  editMode,
  canEdit,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
  data,
}) => {
  const common = {
    widget,
    instance,
    editMode,
    canEdit,
    onToggleCollapse,
    onCycleSize,
    onDecSize,
    onCycleHeight,
    onDecHeight,
    onRemove,
  }

  const matrixData = useMemo(() => {
    let baseViews = 10000

    if (data && data.statBlocks28d) {
      const viewsBlock = data.statBlocks28d.find((b: any) =>
        b.label?.toLowerCase().includes("views"),
      )
      if (viewsBlock) {
        const valStr = String(viewsBlock.value).replace(/,/g, "")
        if (valStr.includes("K")) baseViews = parseFloat(valStr) * 1000
        else if (valStr.includes("M")) baseViews = parseFloat(valStr) * 1_000_000
        else baseViews = parseFloat(valStr) || 10000
      }
    }

    const snapshot = getVtSyncSnapshot()

    const ts = snapshot.trafficSources?.length
      ? snapshot.trafficSources
      : data?.trafficSources || []
    const origins: PieDatum[] = ts.length > 0
      ? ts.slice(0, 4).map((s: any, idx: number) => ({
          name: formatTrafficSourceNickname(s.label || s.trafficSource),
          value: s.viewsPct ?? s.pct ?? Number(s.views) ?? 0,
          color: ["#FF83EA", "#24D3FF", "#C9F830", "#eee"][idx] || "#eee",
        }))
      : [
          { name: "Browse",    value: baseViews * 0.45, color: "#FF83EA" },
          { name: "Suggested", value: baseViews * 0.3,  color: "#24D3FF" },
          { name: "Search",    value: baseViews * 0.15, color: "#C9F830" },
          { name: "External",  value: baseViews * 0.1,  color: "#eee"    },
        ]

    const geoSrc = snapshot.geography?.length
      ? snapshot.geography
      : data?.geography || []
    const geo: PieDatum[] = geoSrc.length > 0
      ? geoSrc.slice(0, 5).map((s: any, idx: number) => ({
          name: s.label || s.geography,
          value: s.viewsPct ?? s.pct ?? Number(s.views) ?? 0,
          color: ["#4FFF5B", "#C9F830", "#24D3FF", "#FF83EA", "#eee"][idx] || "#eee",
        }))
      : [
          { name: "US",    value: baseViews * 0.42, color: "#4FFF5B" },
          { name: "UK",    value: baseViews * 0.18, color: "#C9F830" },
          { name: "CA",    value: baseViews * 0.12, color: "#24D3FF" },
          { name: "AU",    value: baseViews * 0.08, color: "#FF83EA" },
          { name: "Other", value: baseViews * 0.2,  color: "#eee"    },
        ]

    const devSrc = snapshot.devices?.length ? snapshot.devices : data?.devices || []
    const devices: PieDatum[] = devSrc.length > 0
      ? devSrc.slice(0, 4).map((s: any, idx: number) => ({
          name: s.label || s.device || s.deviceType,
          value: s.viewsPct ?? s.pct ?? Number(s.views) ?? 0,
          color: ["#000000", "#4FFF5B", "#FFB570", "#eee"][idx] || "#eee",
        }))
      : [
          { name: "Mobile",  value: baseViews * 0.65, color: "#000000" },
          { name: "Desktop", value: baseViews * 0.2,  color: "#4FFF5B" },
          { name: "TV",      value: baseViews * 0.12, color: "#FFB570" },
          { name: "Tablet",  value: baseViews * 0.03, color: "#eee"    },
        ]

    const shareSrc = snapshot.sharingService?.length
      ? snapshot.sharingService
      : data?.sharingService || []
    const sharing: PieDatum[] = shareSrc.length > 0
      ? shareSrc.slice(0, 4).map((s: any, idx: number) => ({
          name: s.label || s.sharingService,
          value: s.viewsPct ?? s.pct ?? Number(s.views) ?? 0,
          color: ["#4FFF5B", "#000000", "#24D3FF", "#eee"][idx] || "#eee",
        }))
      : [
          { name: "WhatsApp",  value: baseViews * 0.05 * 0.4, color: "#4FFF5B" },
          { name: "Twitter/X", value: baseViews * 0.05 * 0.3, color: "#000000" },
          { name: "Facebook",  value: baseViews * 0.05 * 0.2, color: "#24D3FF" },
          { name: "Copy Link", value: baseViews * 0.05 * 0.1, color: "#eee"    },
        ]

    return { geo, devices, origins, sharing }
  }, [data])

  return (
    <WidgetShell {...common} icon={<Globe size={22} />} contentLayout="flush">
      <WidgetInteriorBody cols={4} fill>
        {/*
          The matrix is a single visual frame: aspect 1:1 owns the outer
          geometry, and the interior is a 2×2 pie grid that always stays
          on the interior-grid gap.
        */}
        <WidgetVisualFrame
          rows={4}
          cols={4}
          ratio="1/1"
          stroke="none"
          tone="ghost"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gridTemplateRows:    "repeat(2, minmax(0, 1fr))",
            gap: "var(--vt-gap)",
            containerType: "inline-size",
          }}
        >
          {renderPie("Geo",    matrixData.geo)}
          {renderPie("Device", matrixData.devices)}
          {renderPie("Source", matrixData.origins)}
          {renderPie("Share",  matrixData.sharing)}
        </WidgetVisualFrame>
      </WidgetInteriorBody>
    </WidgetShell>
  )
}
