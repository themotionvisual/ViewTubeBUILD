import React from "react"
import { useNavigate } from "react-router-dom"
import {
 BarChart3,
 TrendingUp,
 Activity,
 Target,
 Zap,
 Layers,
 Eye,
} from "lucide-react"

interface CategoryCardProps {
 title: string
 subtitle: string
 chartCount: number
 icon: React.ElementType
 color: string
 iconColor: string
 route: string
 description: string
}

const CategoryCard: React.FC<CategoryCardProps> = ({
 title,
 subtitle,
 chartCount,
 icon: Icon,
 color,
 iconColor,
 route,
 description,
}) => {
 const navigate = useNavigate()

 return (
  <div
   onClick={() => navigate(route)}
   className="bg-white border-[5px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden cursor-pointer hover:shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 transition-all duration-100">
   {/* Header */}
   <div className={`${color} border-b-[4px] border-black p-4`}>
    <div className="flex items-center justify-between">
     <div className="flex items-center gap-3">
      <div
       className={`w-12 h-12 ${iconColor} border-[3px] border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_black]`}>
       <Icon size={24} className="text-black" strokeWidth={3} />
      </div>
      <div>
       <h3 className="text-xl font-black uppercase tracking-tighter text-black">
        {title}
       </h3>
       <p className="text-xs font-black uppercase tracking-widest text-black/60">
        {subtitle}
       </p>
      </div>
     </div>
     <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
      {chartCount} Charts
     </div>
    </div>
   </div>

   {/* Content */}
   <div className="p-4">
    <p className="text-sm font-bold text-black/70 leading-relaxed">
     {description}
    </p>
    <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black/50">
     <span>Click to explore</span>
     <TrendingUp size={14} strokeWidth={3} />
    </div>
   </div>
  </div>
 )
}

const ChartsGalleryHome: React.FC = () => {
 const categories: CategoryCardProps[] = [
  {
   title: "Master Graphs",
   subtitle: "The Ultimate Suite",
   chartCount: 7,
   icon: Zap,
   color: "bg-[#CCFF00]",
   iconColor: "bg-[#00CCFF]",
   route: "/charts-gallery/master-graphs",
   description:
    "The 7 definitive charts that define ViewTube's visual identity. Revenue, Value Matrix, Algorithm Trigger, and more.",
  },
  {
   title: "Research Lab",
   subtitle: "Deep Analytics Gallery",
   chartCount: 34,
   icon: Layers,
   color: "bg-[#FF3399]",
   iconColor: "bg-[#00CCFF]",
   route: "/charts-gallery/research-lab",
   description:
    "Comprehensive analytics gallery covering performance, time patterns, revenue efficiency, content analysis, and audience insights.",
  },
  {
   title: "Performance Hub",
   subtitle: "Post-Publish Intelligence",
   chartCount: 8,
   icon: Activity,
   color: "bg-[#00CCFF]",
   iconColor: "bg-[#CCFF00]",
   route: "/charts-gallery/performance-hub",
   description:
    "Recharts-powered visualizations for daily performance, format analysis, revenue trends, and engagement metrics.",
  },
  {
   title: "Channelytics",
   subtitle: "Engagement Stations",
   chartCount: 6,
   icon: Target,
   color: "bg-[#FFB158]",
   iconColor: "bg-[#FF3399]",
   route: "/charts-gallery/channelytics",
   description:
    "Six stations for top performers, value matrix, algorithm triggers, device breakdown, geography, and narrative analysis.",
  },
  {
   title: "Data Visualizations",
   subtitle: "Custom SVG Charts",
   chartCount: 4,
   icon: BarChart3,
   color: "bg-[#B14AED]",
   iconColor: "bg-[#FF3399]",
   route: "/charts-gallery/data-viz",
   description:
    "Lightweight custom SVG implementations for scatter plots, bar charts, KPI cards, and chart containers.",
  },
  {
   title: "KPI Dashboard",
   subtitle: "Key Performance Indicators",
   chartCount: 2,
   icon: Eye,
   color: "bg-[#FFDD00]",
   iconColor: "bg-[#00CCFF]",
   route: "/charts-gallery/kpi",
   description:
    "Channel overview KPI grid and content breakdown progress bars for at-a-glance performance monitoring.",
  },
  {
   title: "Toolbox Preview",
   subtitle: "QA Surface",
   chartCount: 2,
   icon: Layers,
   color: "bg-[#f0f0f0]",
   iconColor: "bg-[#00CCFF]",
   route: "/charts-gallery/toolbox-preview",
   description:
    "Visual regression surface for ChannelyticsChartToolbox and ChartEngine with source toggles.",
  },
 ]

 return (
  <div className="min-h-screen bg-[#f4f4f0]">
   {/* Header */}
   <div className="bg-white border-b-[5px] border-black">
    <div className="max-w-7xl mx-auto px-6 py-8">
     <div className="flex items-center gap-4 mb-2">
      <div className="w-16 h-16 bg-[#00CCFF] border-[4px] border-black rounded-xl flex items-center justify-center shadow-[6px_6px_0px_0px_black]">
       <BarChart3 size={32} className="text-black" strokeWidth={3} />
      </div>
      <div>
       <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
        Charts Gallery
       </h1>
       <p className="text-sm font-black uppercase tracking-widest text-black/60">
        Complete Data Visualization Suite
       </p>
      </div>
     </div>

     {/* Stats */}
     <div className="grid grid-cols-4 gap-4 mt-6">
      <div className="bg-[#FF3399] border-[3px] border-black rounded-xl p-3 text-center shadow-[4px_4px_0px_0px_black]">
       <div className="text-2xl font-black text-white">62</div>
       <div className="text-[10px] font-black uppercase text-white/80 tracking-widest">
        Total Charts
       </div>
      </div>
      <div className="bg-[#00CCFF] border-[3px] border-black rounded-xl p-3 text-center shadow-[4px_4px_0px_0px_black]">
       <div className="text-2xl font-black text-white">15</div>
       <div className="text-[10px] font-black uppercase text-white/80 tracking-widest">
        Chart Types
       </div>
      </div>
      <div className="bg-[#CCFF00] border-[3px] border-black rounded-xl p-3 text-center shadow-[4px_4px_0px_0px_black]">
       <div className="text-2xl font-black text-black">7</div>
       <div className="text-[10px] font-black uppercase text-black/60 tracking-widest">
        Master Graphs
       </div>
      </div>
      <div className="bg-[#FFDD00] border-[3px] border-black rounded-xl p-3 text-center shadow-[4px_4px_0px_0px_black]">
       <div className="text-2xl font-black text-black">3</div>
       <div className="text-[10px] font-black uppercase text-black/60 tracking-widest">
        Libraries
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Main Content */}
   <div className="max-w-7xl mx-auto px-6 py-8">
    {/* Category Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {categories.map((category) => (
      <CategoryCard key={category.title} {...category} />
     ))}
    </div>

    {/* Footer Info */}
    <div className="mt-12 bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
     <h2 className="text-xl font-black uppercase tracking-tighter text-black mb-4">
      About Charts Gallery
     </h2>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
       <h3 className="text-sm font-black uppercase tracking-wider text-black/60 mb-2">
        Data Source
       </h3>
       <p className="text-sm font-bold text-black">
        All charts connect directly to YouTube Analytics API through the unified
        sync system. Real-time data with 4-hour cache refresh.
       </p>
      </div>
      <div>
       <h3 className="text-sm font-black uppercase tracking-wider text-black/60 mb-2">
        Charting Libraries
       </h3>
       <p className="text-sm font-bold text-black">
        React-Google-Charts for complex visualizations, Recharts for interactive
        charts, and custom SVG for lightweight implementations.
       </p>
      </div>
      <div>
       <h3 className="text-sm font-black uppercase tracking-wider text-black/60 mb-2">
        Visual Identity
       </h3>
       <p className="text-sm font-bold text-black">
        Neo-Brutalist v2.2 styling with 5px borders, 12px shadows, and neon
        high-contrast colors for maximum visual impact.
       </p>
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}

export default ChartsGalleryHome
