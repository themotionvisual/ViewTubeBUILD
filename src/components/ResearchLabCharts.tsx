import React, { useMemo, useState } from "react"
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 BarChart,
 Bar,
 ScatterChart,
 Scatter,
 ZAxis,
 Legend,
} from "recharts"
import { Search, MapPin, Globe, Loader2, Play } from "lucide-react"
import type { CanonicalVideoRow } from "../services/analyticsContract"
import { resolveMetricNumber } from "../services/canonicalMetricResolver"
import { youtubeApiClient } from "../services/youtube/youtubeApiClient"

const metricValue = (row: CanonicalVideoRow, metricKey: string): number => {
 return resolveMetricNumber(row, metricKey as any).value || 0
}

interface ChartProps {
 data: CanonicalVideoRow[]
}

export const YouTubeVideoSearch: React.FC = () => {
 const [query, setQuery] = useState("")
 const [location, setLocation] = useState("")
 const [radius, setRadius] = useState("50km")
 const [results, setResults] = useState<any[]>([])
 const [loading, setLoading] = useState(false)
 const [showFilters, setShowFilters] = useState(false)

 const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!query) return
  setLoading(true)
  try {
   const data = await youtubeApiClient.searchVideos(query, {
    location: location || undefined,
    locationRadius: location ? radius : undefined,
   })
   setResults(data.items || [])
  } catch (e) {
   console.error("Search failed:", e)
  } finally {
   setLoading(false)
  }
 }

 return (
  <div className="bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden flex flex-col min-h-[500px]">
   <div className="bg-[#B14AED] text-white px-4 py-3 border-b-[4px] border-black flex justify-between items-center">
    <div className="flex items-center gap-2">
     <Search size={20} />
     <span className="font-[1000] uppercase tracking-tighter">Competitor Search Lab</span>
    </div>
    <button
     onClick={() => setShowFilters(!showFilters)}
     className={`text-[10px] font-black uppercase px-2 py-1 border-2 border-white/30 rounded flex items-center gap-1 ${showFilters ? "bg-white text-black" : ""}`}
    >
     <MapPin size={10} />
     Geo-Filters
    </button>
   </div>

   <div className="p-4 bg-gray-50 border-b-[4px] border-black">
    <form onSubmit={handleSearch} className="flex flex-col gap-3">
     <div className="flex gap-2">
      <input
       type="text"
       value={query}
       onChange={(e) => setQuery(e.target.value)}
       placeholder="SEARCH TOPICS, COMPETITORS, OR TRENDS..."
       className="flex-1 border-[3px] border-black p-3 font-bold uppercase text-sm rounded-xl outline-none focus:bg-[#B14AED]/5"
      />
      <button
       type="submit"
       disabled={loading || !query}
       className="bg-[#CCFF00] border-[3px] border-black px-6 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
      >
       {loading ? <Loader2 className="animate-spin" /> : "Analyze"}
      </button>
     </div>

     {showFilters && (
      <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
       <div className="flex-1 relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
        <input
         type="text"
         value={location}
         onChange={(e) => setLocation(e.target.value)}
         placeholder="COORDINATES (E.G. 37.423021,-122.083739)"
         className="w-full border-[3px] border-black pl-10 pr-4 py-2 font-bold uppercase text-[10px] rounded-xl outline-none"
        />
       </div>
       <select
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
        className="border-[3px] border-black px-3 py-2 font-bold uppercase text-[10px] rounded-xl outline-none bg-white"
       >
        <option value="10km">10KM</option>
        <option value="50km">50KM</option>
        <option value="100km">100KM</option>
        <option value="500km">500KM</option>
       </select>
      </div>
     )}
    </form>
   </div>

   <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
    {loading ? (
     <div className="h-full flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-[#B14AED]" />
     </div>
    ) : results.length > 0 ? (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {results.map((video) => (
       <div key={video.id.videoId} className="border-[3px] border-black p-3 rounded-xl hover:bg-gray-50 transition-colors group">
        <div className="relative aspect-video border-[3px] border-black rounded-lg overflow-hidden mb-3">
         <img
          src={video.snippet.thumbnails.high.url}
          alt={video.snippet.title}
          className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a
           href={`https://youtube.com/watch?v=${video.id.videoId}`}
           target="_blank"
           rel="noopener noreferrer"
           className="bg-white text-black p-3 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_black]"
          >
           <Play fill="black" size={20} />
          </a>
         </div>
        </div>
        <h4 className="font-black text-xs uppercase line-clamp-2 mb-1">{video.snippet.title}</h4>
        <p className="text-[10px] font-bold text-black/40 uppercase">{video.snippet.channelTitle}</p>
       </div>
      ))}
     </div>
    ) : (
     <div className="h-full flex flex-col items-center justify-center opacity-20">
      <Globe size={60} className="mb-4" />
      <p className="font-black uppercase text-xl">Awaiting Inquiry</p>
     </div>
    )}
   </div>
  </div>
 )
}

const CustomTooltip = ({ active, payload, label }: any) => {
 if (active && payload && payload.length) {
  return (
   <div className="bg-white border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_black] rounded-xl z-50">
    <p className="font-black text-[12px] uppercase mb-2 border-b-2 border-black/10 pb-1">
     {label || payload[0]?.payload?.title || "Data Point"}
    </p>
    {payload.map((entry: any, index: number) => (
     <div key={index} className="flex justify-between gap-4 text-[11px] font-bold">
      <span className="uppercase opacity-60" style={{ color: entry.color }}>
       {entry.name}:
      </span>
      <span className="font-black">
       {typeof entry.value === "number" && entry.value > 1000 ?
        entry.value.toLocaleString()
       : entry.value}
      </span>
     </div>
    ))}
   </div>
  )
 }
 return null
}

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
 <div className="bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden flex flex-col h-[400px]">
  <div className="bg-black text-white px-4 py-2 text-[12px] font-black uppercase tracking-widest flex justify-between items-center">
   <span className="text-[#00CCFF]">{title}</span>
  </div>
  <div className="flex-1 p-4 pb-8 min-h-0">
   <ResponsiveContainer width="100%" height="100%">
    {children}
   </ResponsiveContainer>
  </div>
 </div>
)

export const PerformanceTrendChart: React.FC<ChartProps> = ({ data }) => {
 const chartData = useMemo(() => {
  return [...data]
   .sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime())
   .map((row) => ({
    title: row.title.substring(0, 30) + "...",
    date: new Date(row.uploadDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    views: metricValue(row, "views"),
    impressions: metricValue(row, "impressions"),
   }))
 }, [data])

 return (
  <ChartContainer title="Performance Trend (Views vs Impressions)">
   <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
    <defs>
     <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#00CCFF" stopOpacity={0.8} />
      <stop offset="95%" stopColor="#00CCFF" stopOpacity={0} />
     </linearGradient>
     <linearGradient id="colorImps" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.8} />
      <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
     </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000015" />
    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#000", fontWeight: 900 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
    <YAxis tickFormatter={(val) => (val > 1000 ? `${(val / 1000).toFixed(0)}k` : val)} tick={{ fontSize: 10, fill: "#000", fontWeight: 900 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
    <Tooltip content={<CustomTooltip />} />
    <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }} />
    <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#CCFF00" strokeWidth={4} fillOpacity={1} fill="url(#colorImps)" />
    <Area type="monotone" dataKey="views" name="Views" stroke="#00CCFF" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
   </AreaChart>
  </ChartContainer>
 )
}

export const EngagementMapChart: React.FC<ChartProps> = ({ data }) => {
 const chartData = useMemo(() => {
  return [...data]
   .sort((a, b) => metricValue(b, "likes") - metricValue(a, "likes"))
   .slice(0, 15) // Top 15 by likes
   .map((row) => ({
    title: row.title.substring(0, 20) + "...",
    likes: metricValue(row, "likes"),
    comments: metricValue(row, "comments"),
    shares: metricValue(row, "shares"),
   }))
 }, [data])

 return (
  <ChartContainer title="Engagement Map (Top 15)">
   <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000015" />
    <XAxis dataKey="title" tick={{ fontSize: 9, fill: "#000", fontWeight: 900 }} tickLine={false} axisLine={{ strokeWidth: 2 }} angle={-45} textAnchor="end" height={60} />
    <YAxis tickFormatter={(val) => (val > 1000 ? `${(val / 1000).toFixed(0)}k` : val)} tick={{ fontSize: 10, fill: "#000", fontWeight: 900 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#0000000a" }} />
    <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }} />
    <Bar dataKey="likes" name="Likes" fill="#FF7497" radius={[4, 4, 0, 0]} />
    <Bar dataKey="comments" name="Comments" fill="#FFDD00" radius={[4, 4, 0, 0]} />
    <Bar dataKey="shares" name="Shares" fill="#B14AED" radius={[4, 4, 0, 0]} />
   </BarChart>
  </ChartContainer>
 )
}

export const ValueMatrixChart: React.FC<ChartProps> = ({ data }) => {
 const chartData = useMemo(() => {
  return data
   .map((row) => {
    const ctr = metricValue(row, "ctr")
    const views = metricValue(row, "views")
    const watchHours = metricValue(row, "watchHours")
    // Use watchHours as a proxy for retention value if AVD/APV not perfectly clean
    return {
     title: row.title,
     ctr: Number(ctr.toFixed(2)),
     views,
     watchHours: Number(watchHours.toFixed(1)),
    }
   })
   .filter((d) => d.views > 0 && d.ctr > 0)
 }, [data])

 return (
  <ChartContainer title="Video Value Matrix (CTR vs Watch Hrs vs Views)">
   <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#00000015" />
    <XAxis type="number" dataKey="ctr" name="CTR" unit="%" tick={{ fontSize: 10, fontWeight: 900 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
    <YAxis type="number" dataKey="watchHours" name="Watch Hours" tick={{ fontSize: 10, fontWeight: 900 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
    <ZAxis type="number" dataKey="views" name="Views" range={[50, 800]} />
    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
    <Scatter name="Videos" data={chartData} fill="#CCFF00" stroke="#000" strokeWidth={2} />
   </ScatterChart>
  </ChartContainer>
 )
}

export const AudienceGrowthChart: React.FC<ChartProps> = ({ data }) => {
 const chartData = useMemo(() => {
  return data
   .map((row) => ({
    title: row.title,
    views: metricValue(row, "views"),
    subs: metricValue(row, "subscribersGained"),
   }))
   .filter((d) => d.views > 0)
 }, [data])

 return (
  <ChartContainer title="Audience Growth Engine (Views vs Subs)">
   <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#00000015" />
    <XAxis type="number" dataKey="views" name="Views" tickFormatter={(v) => (v > 1000 ? `${(v/1000).toFixed(0)}k` : v)} tick={{ fontSize: 10, fontWeight: 900 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
    <YAxis type="number" dataKey="subs" name="Subscribers" tick={{ fontSize: 10, fontWeight: 900 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
    <ZAxis type="number" range={[60, 60]} />
    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
    <Scatter name="Videos" data={chartData} fill="#FFB158" stroke="#000" strokeWidth={2} />
   </ScatterChart>
  </ChartContainer>
 )
}
