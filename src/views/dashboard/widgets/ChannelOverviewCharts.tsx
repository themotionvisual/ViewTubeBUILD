import { useState } from "react"
import type { OverviewChartData, ChartSlice } from "./channelOverviewChartData"
import { overviewSlices, overviewTraffic } from "./channelOverviewChartData"
import "./channelOverviewCharts.css"

const colors = ["#FA618A", "#36E0F6", "#FFA85C", "#C0F240", "#A467F4"]
const formatSource = (value: string) => value.replace(/^(YT_|INSIGHT_TRAFFIC_SOURCE_)/, "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

const Donut = ({ title, slices }: { title: string; slices: ChartSlice[] }) => {
 const radius = 38
 const circumference = 2 * Math.PI * radius
 const dominant = slices[0]
 return <section className="overview-chart-tile" aria-label={`${title} breakdown`}>
  <h3>{title}</h3>
  {dominant ? <>
   <div className="overview-donut-wrap">
    <svg viewBox="0 0 100 100" role="img" aria-label={`${title}: ${slices.map(s => `${s.label} ${s.share.toFixed(1)} percent`).join(', ')}`}>
     <circle className="overview-donut-track" cx="50" cy="50" r={radius} fill="none" strokeWidth="13" />
     {slices.map((slice, index) => {
      const length = circumference * slice.share / 100
      const offset = circumference * slices.slice(0, index).reduce((sum, previous) => sum + previous.share / 100, 0)
      return <circle key={slice.label} cx="50" cy="50" r={radius} fill="none" stroke={colors[index % colors.length]} strokeWidth="13" strokeDasharray={`${Math.max(0, length - 1)} ${circumference}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />
     })}
    </svg>
    <span className="overview-donut-value">{dominant.share.toFixed(0)}%</span>
   </div>
   <div className="overview-chart-caption">{dominant.label} · {dominant.value.toLocaleString()} views</div>
   <details><summary>All {title.toLowerCase()} categories</summary><ul>{slices.map((slice) => <li key={slice.label}>{slice.label}: {slice.share.toFixed(1)}% ({slice.value.toLocaleString()} views)</li>)}</ul></details>
  </> : <p className="overview-chart-empty">No {title.toLowerCase()} breakdown for this range. Sync its dataset to see shares.</p>}
 </section>
}

export const ChannelOverviewCharts = ({ data, days, syncing }: { data: OverviewChartData; days: number; syncing: boolean }) => {
 const [selected, setSelected] = useState(-1)
 const audience = overviewSlices(data, "audience", days)
 const devices = overviewSlices(data, "devices", days)
 const traffic = overviewTraffic(data, days)
 const selectedIndex = selected < 0 ? Math.max(0, traffic.points.length - 1) : Math.min(selected, Math.max(0, traffic.points.length - 1))
 const point = traffic.points[selectedIndex]
 const rows = traffic.sources.map((source, index) => ({ source, color: colors[index % colors.length] }))
 const layers = rows.map(({ source, color }, layer) => {
  const upper = traffic.points.map((entry, index) => {
   const below = rows.slice(0, layer).reduce((sum, row) => sum + (entry.shares[row.source] || 0), 0)
   return `${index * 100 / (traffic.points.length - 1)},${100 - below - entry.shares[source]}`
  })
  const lower = traffic.points.map((entry, index) => {
   const below = rows.slice(0, layer).reduce((sum, row) => sum + (entry.shares[row.source] || 0), 0)
   return `${index * 100 / (traffic.points.length - 1)},${100 - below}`
  }).reverse()
  return <polygon key={source} points={[...upper, ...lower].join(" ")} fill={color} />
 })
 return <div className="overview-charts" aria-busy={syncing}>
  <Donut title="Audience" slices={audience} />
  <Donut title="Devices" slices={devices} />
  <section className="overview-chart-tile overview-chart-traffic" aria-label="Discovery traffic source share">
   <h3>Discovery · traffic source share</h3>
   {traffic.points.length > 1 ? <>
    <svg className="overview-traffic-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Traffic source shares from ${traffic.points[0].date} to ${traffic.points[traffic.points.length - 1].date}`}>
     <path d="M0 25H100M0 50H100M0 75H100" className="overview-area-grid" />
     {layers}
    </svg>
    <div className="overview-traffic-axis"><span>{traffic.points[0].date}</span><span>100% of views</span><span>{traffic.points[traffic.points.length - 1].date}</span></div>
    <label className="overview-traffic-select">Inspect date <input type="range" min="0" max={traffic.points.length - 1} value={selectedIndex} onChange={(event) => setSelected(Number(event.target.value))} aria-label="Inspect traffic source date" /></label>
    <div className="overview-traffic-detail" aria-live="polite"><strong>{point.date}</strong>{rows.map(({ source, color }) => <span key={source}><i style={{ background: color }} />{formatSource(source)} {point.shares[source].toFixed(1)}%</span>)}</div>
   </> : <p className="overview-chart-empty">{traffic.partial ? "Complete traffic history is loading. Open Analytics to refresh the synced dataset." : "Traffic source history needs at least two dated observations. Sync Traffic by Day to see the trend."}</p>}
  </section>
 </div>
}
