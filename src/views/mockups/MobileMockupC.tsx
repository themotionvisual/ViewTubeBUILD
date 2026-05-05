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
  ArrowLeft,
  Bell,
  MoreHorizontal,
  Plus,
  Target,
  Clock,
} from "lucide-react"

/**
 * MOCKUP C: Gesture-Based Tabs + Hero Cards
 * 
 * Mobile-first approach with:
 * - Top pill navigation (swipeable tabs)
 * - Hero card with primary metric
 * - Horizontal scrolling widget rows
 * - Quick action chips
 */

const MobileMockupC: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "studio">("dashboard")
  const [activeMetric, setActiveMetric] = useState(0)

  const metrics = [
    { label: "Subscribers", value: "1,247,892", change: "+2,431 today", icon: Users, color: "#FF8AAF", bgGradient: "from-[#FF8AAF] to-[#FF6B9D]" },
    { label: "Total Views", value: "4,821,093", change: "+142K this week", icon: Eye, color: "#00CCFF", bgGradient: "from-[#00CCFF] to-[#00A3CC]" },
    { label: "Revenue", value: "$8,421", change: "+$842 this month", icon: DollarSign, color: "#CCFF00", bgGradient: "from-[#CCFF00] to-[#A3CC00]" },
  ]

  const quickActions = [
    { label: "Upload", icon: Plus, color: "#FF8AAF" },
    { label: "Schedule", icon: Clock, color: "#00CCFF" },
    { label: "Analytics", icon: BarChart3, color: "#CCFF00" },
    { label: "Goals", icon: Target, color: "#FFB570" },
  ]

  const dashboardCards = [
    {
      title: "Live Activity",
      items: [
        { label: "Watching Now", value: "1,247", color: "#FF8AAF" },
        { label: "Subs Today", value: "+342", color: "#00CCFF" },
        { label: "Comments", value: "89", color: "#CCFF00" },
      ],
    },
    {
      title: "Top Videos",
      items: [
        { label: "Tutorial #42", value: "890K", color: "#FFB570" },
        { label: "Review Video", value: "654K", color: "#FFFF61" },
        { label: "Behind Scenes", value: "421K", color: "#CC00FF" },
      ],
    },
  ]

  const studioTools = [
    { icon: Video, label: "Video Manager", color: "#FF8AAF", desc: "Uploads & drafts" },
    { icon: FileText, label: "SEO Tools", color: "#00CCFF", desc: "Titles & tags" },
    { icon: Image, label: "Thumbnails", color: "#CCFF00", desc: "AI-powered" },
    { icon: Zap, label: "Hooks", color: "#FFB570", desc: "Viral intros" },
    { icon: MessageSquare, label: "Community", color: "#FFFF61", desc: "Posts & polls" },
    { icon: Layers, label: "Comments", color: "#CC00FF", desc: "AI replies" },
  ]

  const recentActivity = [
    { type: "upload", text: "Tutorial #43 published", time: "2h ago", color: "#FF8AAF" },
    { type: "milestone", text: "1.2M subscribers reached!", time: "1d ago", color: "#CCFF00" },
    { type: "comment", text: "New pinned comment on Tutorial #42", time: "2d ago", color: "#00CCFF" },
  ]

  return (
    <div className="w-full max-w-[390px] mx-auto bg-black min-h-screen font-sans">
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
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-[1000] uppercase tracking-tighter">
            <span className="text-white">VIEW</span>
            <span className="text-[#00CCFF]">TUBE</span>
          </h1>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Bell size={18} className="text-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8AAF] to-[#CC00FF] border-[2px] border-white/30" />
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2 p-1 bg-white/10 rounded-full">
          {["dashboard", "studio"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "dashboard" | "studio")}
              className={`flex-1 py-2.5 rounded-full text-xs font-[900] uppercase tracking-tight transition-all ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "text-white/60"
              }`}
            >
              {tab === "dashboard" ? "Dashboard" : "Studio Hub"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <div className="bg-[#f3f4f6] min-h-screen rounded-t-[32px] pt-6 px-4 pb-8">
          {/* Hero Metric Card */}
          <div
            className={`bg-gradient-to-br ${metrics[activeMetric].bgGradient} rounded-2xl p-5 border-[3px] border-black shadow-[6px_6px_0px_0px_black] mb-4`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                {metrics[activeMetric].label}
              </span>
              <metrics[activeMetric].icon size={24} strokeWidth={2.5} />
            </div>
            <div className="text-4xl font-[1000] tracking-tight mb-1">
              {metrics[activeMetric].value}
            </div>
            <div className="text-xs font-bold opacity-70">{metrics[activeMetric].change}</div>
          </div>

          {/* Metric Selector Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {metrics.map((m, idx) => (
              <button
                key={m.label}
                onClick={() => setActiveMetric(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeMetric === idx ? "w-6" : ""
                }`}
                style={{ backgroundColor: m.color }}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-[2px] border-black bg-white shadow-[3px_3px_0px_0px_black] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: action.color }}
                >
                  <action.icon size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-[800] uppercase tracking-tight">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Horizontal Scroll Cards */}
          {dashboardCards.map((section) => (
            <div key={section.title} className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-black/50">
                  {section.title}
                </h3>
                <ChevronRight size={16} className="text-black/30" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex-shrink-0 w-[120px] p-4 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]"
                  >
                    <div
                      className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                      style={{ backgroundColor: item.color }}
                    >
                      <TrendingUp size={16} strokeWidth={3} />
                    </div>
                    <div className="text-xl font-[1000] tracking-tight">{item.value}</div>
                    <div className="text-[9px] font-bold text-black/50 uppercase">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Recent Activity */}
          <div className="mt-4">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-black/50 mb-3">
              Recent Activity
            </h3>
            <div className="space-y-2">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border-[2px] border-black"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: activity.color }}
                  >
                    <Sparkles size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{activity.text}</div>
                    <div className="text-[10px] text-black/40">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#f3f4f6] min-h-screen rounded-t-[32px] pt-6 px-4 pb-8">
          {/* Studio Hero */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-[1000] uppercase tracking-tighter">
              STUDIO <span className="text-[#00CCFF]">HUB</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mt-1">
              Production & Optimization
            </p>
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-2 gap-3">
            {studioTools.map((tool) => (
              <button
                key={tool.label}
                className="bg-white rounded-2xl p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_black] active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all text-left"
              >
                <div
                  className="w-12 h-12 rounded-xl border-[2px] border-black flex items-center justify-center mb-3"
                  style={{ backgroundColor: tool.color }}
                >
                  <tool.icon size={24} strokeWidth={2.5} />
                </div>
                <h4 className="font-[900] text-sm uppercase tracking-tight">{tool.label}</h4>
                <p className="text-[10px] text-black/50 font-semibold mt-0.5">{tool.desc}</p>
              </button>
            ))}
          </div>

          {/* Recent Projects */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-black/50">
                Recent Projects
              </h3>
              <button className="text-[10px] font-black uppercase text-[#00CCFF]">View All</button>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border-[2px] border-black"
                >
                  <div className="w-14 h-10 bg-black/10 rounded-lg border border-black" />
                  <div className="flex-1">
                    <div className="text-xs font-bold">Project Draft #{i}</div>
                    <div className="text-[10px] text-black/40">In progress</div>
                  </div>
                  <ChevronRight size={16} className="text-black/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileMockupC
