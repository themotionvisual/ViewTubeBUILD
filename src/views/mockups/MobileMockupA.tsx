import React, { useState } from "react"
import {
  Home,
  Video,
  BarChart3,
  Calendar,
  Settings,
  ChevronRight,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  Play,
  Sparkles,
  MessageSquare,
  Layers,
  FileText,
  Image,
  Zap,
  Menu,
  X,
} from "lucide-react"

/**
 * MOCKUP A: Bottom Tab Navigation + Card Stack
 * 
 * Mobile-first approach with:
 * - Fixed bottom tab bar for primary navigation
 * - Swipeable horizontal KPI cards at top
 * - Vertically stacked widget cards
 * - Floating action button for quick actions
 */

const MobileMockupA: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "studio">("dashboard")
  const [activeKPI, setActiveKPI] = useState(0)

  const kpis = [
    { label: "Subscribers", value: "1.2M", change: "+2.4%", icon: Users, color: "#FF8AAF" },
    { label: "Views (28d)", value: "4.8M", change: "+12%", icon: Eye, color: "#00CCFF" },
    { label: "Revenue", value: "$8,420", change: "+8.2%", icon: DollarSign, color: "#CCFF00" },
    { label: "Watch Time", value: "312K hrs", change: "+5.1%", icon: Play, color: "#FFB570" },
  ]

  const dashboardWidgets = [
    { id: 1, title: "Recent Uploads", subtitle: "3 videos this week", icon: Video, color: "#FF8AAF" },
    { id: 2, title: "Real-time Views", subtitle: "1,247 watching now", icon: TrendingUp, color: "#00CCFF" },
    { id: 3, title: "Top Performer", subtitle: "Tutorial #42 - 890K views", icon: BarChart3, color: "#CCFF00" },
    { id: 4, title: "Alerts", subtitle: "2 new milestones", icon: Sparkles, color: "#FFB570" },
  ]

  const studioTools = [
    { id: 1, title: "Video Manager", subtitle: "Manage uploads & drafts", icon: Video, color: "#FF8AAF" },
    { id: 2, title: "SEO Generator", subtitle: "Optimize titles & tags", icon: FileText, color: "#00CCFF" },
    { id: 3, title: "Thumbnail Studio", subtitle: "AI-powered thumbnails", icon: Image, color: "#CCFF00" },
    { id: 4, title: "Hook Generator", subtitle: "Write viral intros", icon: Zap, color: "#FFB570" },
    { id: 5, title: "Community Posts", subtitle: "Engage your audience", icon: MessageSquare, color: "#FFFF61" },
    { id: 6, title: "Comment Responder", subtitle: "AI reply drafts", icon: Layers, color: "#CC00FF" },
  ]

  return (
    <div className="w-full max-w-[390px] mx-auto bg-[#f3f4f6] min-h-screen pb-20 font-sans">
      {/* Status Bar Mock */}
      <div className="h-12 bg-black flex items-center justify-between px-6">
        <span className="text-white text-xs font-bold">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-white rounded-sm">
            <div className="w-3 h-1.5 bg-white rounded-sm m-[1px]" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b-[3px] border-black px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-[1000] uppercase tracking-tighter">
            <span className="text-black">VIEW</span>
            <span className="text-[#00CCFF]">TUBE</span>
          </h1>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8AAF] to-[#CC00FF] border-[2px] border-black" />
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <>
          {/* KPI Carousel */}
          <div className="px-4 py-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {kpis.map((kpi, idx) => (
                <button
                  key={kpi.label}
                  onClick={() => setActiveKPI(idx)}
                  className={`flex-shrink-0 w-[140px] p-3 rounded-xl border-[3px] border-black transition-all ${
                    activeKPI === idx
                      ? "shadow-[4px_4px_0px_0px_black] translate-x-0"
                      : "shadow-[2px_2px_0px_0px_black] opacity-80"
                  }`}
                  style={{ backgroundColor: kpi.color }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <kpi.icon size={16} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{kpi.label}</span>
                  </div>
                  <div className="text-xl font-[1000] tracking-tight">{kpi.value}</div>
                  <div className="text-[10px] font-bold text-black/60">{kpi.change}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Widget Stack */}
          <div className="px-4 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black/40 mb-2">
              Quick Insights
            </h2>
            {dashboardWidgets.map((widget) => (
              <div
                key={widget.id}
                className="bg-white rounded-xl border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_black] active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border-[2px] border-black flex items-center justify-center"
                    style={{ backgroundColor: widget.color }}
                  >
                    <widget.icon size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-[900] text-sm uppercase tracking-tight">{widget.title}</h3>
                    <p className="text-xs text-black/50 font-semibold">{widget.subtitle}</p>
                  </div>
                  <ChevronRight size={20} className="text-black/30" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Studio Header */}
          <div className="px-4 py-4">
            <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-center">
              STUDIO <span className="text-[#00CCFF]">HUB</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 text-center mt-1">
              Production Suite
            </p>
          </div>

          {/* Tool Grid */}
          <div className="px-4 grid grid-cols-2 gap-3">
            {studioTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-xl border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_black] active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center mb-3"
                  style={{ backgroundColor: tool.color }}
                >
                  <tool.icon size={20} strokeWidth={2.5} />
                </div>
                <h3 className="font-[900] text-xs uppercase tracking-tight leading-tight">{tool.title}</h3>
                <p className="text-[10px] text-black/50 font-semibold mt-1 leading-tight">{tool.subtitle}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-4 w-14 h-14 bg-[#CC00FF] rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all">
        <Sparkles size={24} strokeWidth={2.5} />
      </button>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-white border-t-[3px] border-black">
        <div className="flex">
          {[
            { id: "dashboard" as const, icon: Home, label: "Dashboard", color: "#FF8AAF" },
            { id: "studio" as const, icon: Video, label: "Studio", color: "#FFB570" },
            { id: "analytics" as const, icon: BarChart3, label: "Analytics", color: "#4FFF5B" },
            { id: "calendar" as const, icon: Calendar, label: "Calendar", color: "#40C6E9" },
            { id: "settings" as const, icon: Settings, label: "Settings", color: "#CC00FF" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "dashboard" || tab.id === "studio") {
                  setActiveTab(tab.id)
                }
              }}
              className="flex-1 py-3 flex flex-col items-center gap-1"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === tab.id
                    ? "border-[2px] border-black shadow-[2px_2px_0px_0px_black]"
                    : ""
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? tab.color : "transparent",
                }}
              >
                <tab.icon
                  size={20}
                  strokeWidth={activeTab === tab.id ? 3 : 2}
                  className={activeTab === tab.id ? "text-black" : "text-black/40"}
                />
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-tight ${
                  activeTab === tab.id ? "text-black" : "text-black/40"
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default MobileMockupA
