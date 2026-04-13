import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
 ArrowLeft,
 DollarSign,
 Clock,
 Users,
 Target,
 Zap,
 Globe,
 Monitor,
 Type,
 TrendingUp,
 BarChart3,
 PieChart,
 Activity,
 Database,
} from "lucide-react"
import {
 ResponsiveContainer,
 PieChart as RePieChart,
 Pie,
 Cell,
 Tooltip,
 Legend,
 ScatterChart,
 Scatter,
 XAxis,
 YAxis,
 ZAxis,
 CartesianGrid,
 ReferenceLine,
} from "recharts"

// Neo-brutalist color palette
const COLORS = {
 cyan: "#00CCFF",
 lime: "#CCFF00",
 yellow: "#FFDD00",
 orange: "#FFB158",
 pink: "#FF7497",
 purple: "#B14AED",
 black: "#000000",
 white: "#FFFFFF",
}

const CHART_COLORS = [
 COLORS.cyan,
 COLORS.lime,
 COLORS.yellow,
 COLORS.orange,
 COLORS.pink,
 COLORS.purple,
]

// Mock data - will be replaced with real API data
const mockRevenueData = [
 { name: "Video A", value: 12500 },
 { name: "Video B", value: 9800 },
 { name: "Video C", value: 7200 },
 { name: "Video D", value: 5400 },
 { name: "Video E", value: 4100 },
 { name: "Others", value: 15000 },
]

const mockWatchTimeData = [
 { name: "Video X", value: 45000 },
 { name: "Video Y", value: 38000 },
 { name: "Video Z", value: 29000 },
 { name: "Video W", value: 22000 },
 { name: "Video V", value: 18000 },
 { name: "Others", value: 68000 },
]

const mockSubscribersData = [
 { name: "Video Alpha", value: 2500 },
 { name: "Video Beta", value: 1800 },
 { name: "Video Gamma", value: 1400 },
 { name: "Video Delta", value: 1100 },
 { name: "Video Epsilon", value: 900 },
 { name: "Others", value: 4300 },
]

const mockValueMatrixData = [
 { ctr: 8.5, retention: 145, views: 125000, name: "Viral Hit" },
 { ctr: 7.2, retention: 120, views: 89000, name: "Strong Performer" },
 { ctr: 5.8, retention: 160, views: 45000, name: "Hidden Gem" },
 { ctr: 9.1, retention: 65, views: 78000, name: "Clickbait" },
 { ctr: 3.2, retention: 85, views: 12000, name: "Underperformer" },
 { ctr: 6.5, retention: 110, views: 67000, name: "Steady" },
 { ctr: 4.8, retention: 130, views: 34000, name: "Niche Content" },
 { ctr: 7.8, retention: 95, views: 56000, name: "Trending" },
]

const mockAlgorithmData = [
 { ctr: 2.1, impressions: 5000, name: "Video 1" },
 { ctr: 3.5, impressions: 12000, name: "Video 2" },
 { ctr: 5.2, impressions: 45000, name: "Video 3" },
 { ctr: 6.8, impressions: 89000, name: "Video 4" },
 { ctr: 8.1, impressions: 156000, name: "Video 5" },
 { ctr: 9.5, impressions: 234000, name: "Video 6" },
 { ctr: 4.2, impressions: 23000, name: "Video 7" },
 { ctr: 7.3, impressions: 112000, name: "Video 8" },
]

const mockDeviceData = [
 { name: "Mobile", value: 45 },
 { name: "TV", value: 28 },
 { name: "Desktop", value: 18 },
 { name: "Tablet", value: 9 },
]

const mockGeoData = [
 { name: "United States", value: 35 },
 { name: "United Kingdom", value: 15 },
 { name: "Canada", value: 8 },
 { name: "Germany", value: 7 },
 { name: "Australia", value: 6 },
 { name: "India", value: 5 },
 { name: "France", value: 4 },
 { name: "Other", value: 20 },
]

interface ChartCardProps {
 title: string
 icon: React.ElementType
 color: string
 children: React.ReactNode
 insight: string
}

const ChartCard: React.FC<ChartCardProps> = ({
 title,
 icon: Icon,
 color,
 children,
 insight,
}) => {
 return (
  <div className="bg-white border-[5px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden">
   {/* Header */}
   <div className={`${color} border-b-[4px] border-black p-4`}>
    <div className="flex items-center justify-between">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-black border-[3px] border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_white]">
       <Icon size={20} className="text-white" strokeWidth={3} />
      </div>
      <h3 className="text-lg font-black uppercase tracking-tighter text-black">
       {title}
      </h3>
     </div>
    </div>
   </div>

   {/* Chart Area */}
   <div className="p-4 h-[300px]">{children}</div>

   {/* Insights Panel */}
   <div className="border-t-[4px] border-black bg-[#f4f4f0] p-4">
    <div className="flex items-start gap-2">
     <div className="w-6 h-6 bg-[#CCFF00] border-[2px] border-black rounded flex items-center justify-center flex-shrink-0 mt-0.5">
      <TrendingUp size={12} className="text-black" strokeWidth={3} />
     </div>
     <div>
      <h4 className="text-xs font-black uppercase tracking-wider text-black/60 mb-1">
       Unique Insight
      </h4>
      <p className="text-sm font-bold text-black">{insight}</p>
     </div>
    </div>
   </div>
  </div>
 )
}

const MasterGraphsPage: React.FC = () => {
 const navigate = useNavigate()

 return (
  <div className="min-h-screen bg-[#f4f4f0]">
   {/* Header */}
   <div className="bg-white border-b-[5px] border-black sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-6 py-4">
     <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
       <button
        onClick={() => navigate("/charts-gallery")}
        className="w-10 h-10 bg-black border-[3px] border-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
        <ArrowLeft size={20} className="text-white" strokeWidth={3} />
       </button>
       <div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-black">
         Master Graphs
        </h1>
        <p className="text-xs font-black uppercase tracking-widest text-black/60">
         The Ultimate Suite — 7 Charts
        </p>
       </div>
      </div>
      <div className="flex items-center gap-3">
       <div className="flex items-center gap-2 bg-[#CCFF00] border-[3px] border-black rounded-lg px-3 py-2">
        <Database size={16} className="text-black" strokeWidth={3} />
        <span className="text-xs font-black uppercase tracking-wider text-black">
         API Sync Active
        </span>
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Main Content */}
   <div className="max-w-7xl mx-auto px-6 py-8">
    {/* Top Performers Trio */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
     <ChartCard
      title="Revenue Leaders"
      icon={DollarSign}
      color="bg-[#FFDD00]"
      insight="Video A generates $12,500 — 23% of total revenue. Top 5 videos drive 62% of earnings.">
      <ResponsiveContainer width="100%" height="100%">
       <RePieChart>
        <Pie
         data={mockRevenueData}
         cx="50%"
         cy="50%"
         innerRadius={40}
         outerRadius={80}
         paddingAngle={2}
         dataKey="value">
         {mockRevenueData.map((_, index) => (
          <Cell
           key={`cell-${index}`}
           fill={CHART_COLORS[index % CHART_COLORS.length]}
           stroke="#000"
           strokeWidth={2}
          />
         ))}
        </Pie>
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "8px",
          background: "white",
          fontFamily: "system-ui",
         }}
        />
       </RePieChart>
      </ResponsiveContainer>
     </ChartCard>

     <ChartCard
      title="Watch Time Champions"
      icon={Clock}
      color="bg-[#00CCFF]"
      insight="Video X accumulated 45K hours — your most engaging content. Long-form dominates watch time.">
      <ResponsiveContainer width="100%" height="100%">
       <RePieChart>
        <Pie
         data={mockWatchTimeData}
         cx="50%"
         cy="50%"
         innerRadius={40}
         outerRadius={80}
         paddingAngle={2}
         dataKey="value">
         {mockWatchTimeData.map((_, index) => (
          <Cell
           key={`cell-${index}`}
           fill={CHART_COLORS[index % CHART_COLORS.length]}
           stroke="#000"
           strokeWidth={2}
          />
         ))}
        </Pie>
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "8px",
          background: "white",
          fontFamily: "system-ui",
         }}
        />
       </RePieChart>
      </ResponsiveContainer>
     </ChartCard>

     <ChartCard
      title="Subscriber Magnets"
      icon={Users}
      color="bg-[#CCFF00]"
      insight="Video Alpha gained 2,500 subs — highest conversion rate at 2.1%. Tutorial content converts best.">
      <ResponsiveContainer width="100%" height="100%">
       <RePieChart>
        <Pie
         data={mockSubscribersData}
         cx="50%"
         cy="50%"
         innerRadius={40}
         outerRadius={80}
         paddingAngle={2}
         dataKey="value">
         {mockSubscribersData.map((_, index) => (
          <Cell
           key={`cell-${index}`}
           fill={CHART_COLORS[index % CHART_COLORS.length]}
           stroke="#000"
           strokeWidth={2}
          />
         ))}
        </Pie>
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "8px",
          background: "white",
          fontFamily: "system-ui",
         }}
        />
       </RePieChart>
      </ResponsiveContainer>
     </ChartCard>
    </div>

    {/* Video Value Matrix */}
    <div className="mb-8">
     <ChartCard
      title="Video Value Matrix"
      icon={Target}
      color="bg-[#FF3399]"
      insight="3 videos in GOLD MINE quadrant (high CTR + high retention). 2 videos need thumbnail optimization (Hidden Gems).">
      <ResponsiveContainer width="100%" height="100%">
       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#000" />
        <XAxis
         type="number"
         dataKey="ctr"
         name="CTR"
         unit="%"
         domain={[0, 12]}
         stroke="#000"
         strokeWidth={2}
         label={{
          value: "CTR %",
          position: "bottom",
          offset: 0,
          style: { fill: "#000", fontWeight: "bold", fontSize: 12 },
         }}
        />
        <YAxis
         type="number"
         dataKey="retention"
         name="Retention"
         unit="%"
         domain={[0, 200]}
         stroke="#000"
         strokeWidth={2}
         label={{
          value: "Retention %",
          angle: -90,
          position: "insideLeft",
          style: { fill: "#000", fontWeight: "bold", fontSize: 12 },
         }}
        />
        <ZAxis type="number" dataKey="views" range={[100, 1000]} name="Views" />
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "8px",
          background: "white",
          fontFamily: "system-ui",
         }}
         formatter={(value, name) => [
          typeof value === "number" ? value.toLocaleString() : value,
          name,
         ]}
        />
        {/* Quadrant reference lines */}
        <ReferenceLine
         x={6}
         stroke="#000"
         strokeWidth={2}
         strokeDasharray="5 5"
        />
        <ReferenceLine
         y={100}
         stroke="#000"
         strokeWidth={2}
         strokeDasharray="5 5"
        />
        <Scatter
         data={mockValueMatrixData}
         fill="#00CCFF"
         stroke="#000"
         strokeWidth={2}
        />
       </ScatterChart>
      </ResponsiveContainer>
     </ChartCard>
    </div>

    {/* Algorithm Trigger */}
    <div className="mb-8">
     <ChartCard
      title="Algorithm Trigger"
      icon={Zap}
      color="bg-[#B14AED]"
      insight="Viral trigger point at ~6.5% CTR. Videos above this threshold receive 3-5x more impressions on average.">
      <ResponsiveContainer width="100%" height="100%">
       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#000" />
        <XAxis
         type="number"
         dataKey="ctr"
         name="CTR"
         unit="%"
         stroke="#000"
         strokeWidth={2}
         label={{
          value: "CTR %",
          position: "bottom",
          offset: 0,
          style: { fill: "#000", fontWeight: "bold", fontSize: 12 },
         }}
        />
        <YAxis
         type="number"
         dataKey="impressions"
         name="Impressions"
         stroke="#000"
         strokeWidth={2}
         tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
         label={{
          value: "Impressions",
          angle: -90,
          position: "insideLeft",
          style: { fill: "#000", fontWeight: "bold", fontSize: 12 },
         }}
        />
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "8px",
          background: "white",
          fontFamily: "system-ui",
         }}
         formatter={(value, name) => [
          name === "impressions" ? value.toLocaleString() : `${value}%`,
          name,
         ]}
        />
        <Scatter
         data={mockAlgorithmData}
         fill="#CCFF00"
         stroke="#000"
         strokeWidth={2}
        />
       </ScatterChart>
      </ResponsiveContainer>
     </ChartCard>
    </div>

    {/* Bottom Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     <ChartCard
      title="Device Immersion"
      icon={Monitor}
      color="bg-[#FFB158]"
      insight="Mobile dominates at 45%, but TV viewers have 2.3x higher watch time. Optimize for both formats.">
      <ResponsiveContainer width="100%" height="100%">
       <RePieChart>
        <Pie
         data={mockDeviceData}
         cx="50%"
         cy="50%"
         innerRadius={40}
         outerRadius={80}
         paddingAngle={2}
         dataKey="value"
         label={({ name, value }) => `${name}: ${value}%`}
         labelLine={{ stroke: "#000", strokeWidth: 2 }}>
         {mockDeviceData.map((_, index) => (
          <Cell
           key={`cell-${index}`}
           fill={CHART_COLORS[index % CHART_COLORS.length]}
           stroke="#000"
           strokeWidth={2}
          />
         ))}
        </Pie>
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "8px",
          background: "white",
          fontFamily: "system-ui",
         }}
        />
       </RePieChart>
      </ResponsiveContainer>
     </ChartCard>

     <ChartCard
      title="Global Footprint"
      icon={Globe}
      color="bg-[#FF7497]"
      insight="US accounts for 35% of views with highest CPM ($12.50). UK and Canada are secondary high-value markets.">
      <ResponsiveContainer width="100%" height="100%">
       <RePieChart>
        <Pie
         data={mockGeoData}
         cx="50%"
         cy="50%"
         innerRadius={40}
         outerRadius={80}
         paddingAngle={2}
         dataKey="value"
         label={({ name, value }) => `${value}%`}
         labelLine={{ stroke: "#000", strokeWidth: 2 }}>
         {mockGeoData.map((_, index) => (
          <Cell
           key={`cell-${index}`}
           fill={CHART_COLORS[index % CHART_COLORS.length]}
           stroke="#000"
           strokeWidth={2}
          />
         ))}
        </Pie>
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "8px",
          background: "white",
          fontFamily: "system-ui",
         }}
        />
        <Legend
         verticalAlign="bottom"
         height={36}
         formatter={(value) => (
          <span style={{ color: "#000", fontWeight: "bold" }}>{value}</span>
         )}
        />
       </RePieChart>
      </ResponsiveContainer>
     </ChartCard>
    </div>
   </div>
  </div>
 )
}

export default MasterGraphsPage
