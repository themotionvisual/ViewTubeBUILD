import React, { useState } from "react"
import {
  Home,
  Video,
  BarChart3,
  Calendar,
  Settings,
  ChevronDown,
  ChevronUp,
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
  Bell,
  Search,
} from "lucide-react"

/**
 * MOCKUP B: Drawer Navigation + Collapsible Sections
 * 
 * Mobile-first approach with:
 * - Hamburger menu with slide-out drawer
 * - Collapsible/accordion widget sections
 * - Compact KPI row at top
 * - Search bar in header
 */

const MobileMockupB: React.FC = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "studio">("dashboard")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["kpis", "recent"])

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const kpis = [
    { label: "Subs", value: "1.2M", icon: Users, color: "#FF8AAF" },
    { label: "Views", value: "4.8M", icon: Eye, color: "#00CCFF" },
    { label: "Revenue", value: "$8.4K", icon: DollarSign, color: "#CCFF00" },
  ]

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", color: "#FF8AAF" },
    { id: "studio", icon: Video, label: "Studio Hub", color: "#FFB570" },
    { id: "analytics", icon: BarChart3, label: "Analytics", color: "#4FFF5B" },
    { id: "calendar", icon: Calendar, label: "Calendar", color: "#40C6E9" },
    { id: "settings", icon: Settings, label: "Settings", color: "#CC00FF" },
  ]

  const dashboardSections = [
    {
      id: "kpis",
      title: "Channel Vitals",
      color: "#FF8AAF",
      content: (
        <div className="flex gap-2">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex-1 p-3 rounded-lg border-[2px] border-black"
              style={{ backgroundColor: kpi.color }}
            >
              <kpi.icon size={16} strokeWidth={3} className="mb-1" />
              <div className="text-lg font-[1000] tracking-tight">{kpi.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-tight opacity-70">{kpi.label}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "recent",
      title: "Recent Uploads",
      color: "#00CCFF",
      content: (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg border-[2px] border-black">
              <div className="w-16 h-10 bg-black/10 rounded border border-black" />
              <div className="flex-1">
                <div className="text-xs font-bold truncate">Video Title #{i}</div>
                <div className="text-[10px] text-black/50">{i * 12}K views</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "alerts",
      title: "Alerts & Milestones",
      color: "#CCFF00",
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-[#CCFF00]/30 rounded-lg border-[2px] border-black">
            <Bell size={16} />
            <span className="text-xs font-bold">New milestone: 1M subscribers!</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#FFB570]/30 rounded-lg border-[2px] border-black">
            <TrendingUp size={16} />
            <span className="text-xs font-bold">Video #42 trending in Gaming</span>
          </div>
        </div>
      ),
    },
    {
      id: "realtime",
      title: "Real-time Stats",
      color: "#FFB570",
      content: (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white rounded-lg border-[2px] border-black text-center">
            <div className="text-2xl font-[1000]">1,247</div>
            <div className="text-[9px] font-bold uppercase text-black/50">Watching Now</div>
          </div>
          <div className="p-3 bg-white rounded-lg border-[2px] border-black text-center">
            <div className="text-2xl font-[1000]">+342</div>
            <div className="text-[9px] font-bold uppercase text-black/50">Subs Today</div>
          </div>
        </div>
      ),
    },
  ]

  const studioSections = [
    {
      id: "video-manager",
      title: "Video Manager",
      color: "#FF8AAF",
      content: (
        <div className="p-4 text-center text-xs text-black/50">
          Manage your uploads, drafts, and scheduled videos
        </div>
      ),
    },
    {
      id: "seo",
      title: "SEO Generator",
      color: "#00CCFF",
      content: (
        <div className="p-4 text-center text-xs text-black/50">
          AI-powered titles, descriptions, and tags
        </div>
      ),
    },
    {
      id: "thumbnail",
      title: "Thumbnail Studio",
      color: "#CCFF00",
      content: (
        <div className="p-4 text-center text-xs text-black/50">
          Create and analyze thumbnails with AI
        </div>
      ),
    },
    {
      id: "hooks",
      title: "Hook Generator",
      color: "#FFB570",
      content: (
        <div className="p-4 text-center text-xs text-black/50">
          Write viral video intros and hooks
        </div>
      ),
    },
    {
      id: "community",
      title: "Community Posts",
      color: "#FFFF61",
      content: (
        <div className="p-4 text-center text-xs text-black/50">
          Generate engaging community tab posts
        </div>
      ),
    },
    {
      id: "comments",
      title: "Comment Responder",
      color: "#CC00FF",
      content: (
        <div className="p-4 text-center text-xs text-black/50">
          AI-assisted comment replies
        </div>
      ),
    },
  ]

  const sections = activeView === "dashboard" ? dashboardSections : studioSections

  return (
    <div className="w-full bg-[#f3f4f6] min-h-screen font-sans relative">
      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white border-r-[3px] border-black z-50 transform transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b-[3px] border-black flex items-center justify-between">
          <h1 className="text-xl font-[1000] uppercase tracking-tighter">
            <span className="text-black">VIEW</span>
            <span className="text-[#00CCFF]">TUBE</span>
          </h1>
          <button onClick={() => setDrawerOpen(false)} className="p-2">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "dashboard" || item.id === "studio") {
                  setActiveView(item.id)
                }
                setDrawerOpen(false)
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-[2px] border-black transition-all ${
                activeView === item.id
                  ? "shadow-[4px_4px_0px_0px_black]"
                  : "shadow-[2px_2px_0px_0px_black] opacity-70"
              }`}
              style={{ backgroundColor: item.color }}
            >
              <item.icon size={20} strokeWidth={2.5} />
              <span className="font-[800] uppercase text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Channel Info in Drawer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-[3px] border-black bg-[#f3f4f6]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8AAF] to-[#CC00FF] border-[2px] border-black" />
            <div>
              <div className="text-sm font-[900] uppercase">My Channel</div>
              <div className="text-[10px] text-black/50 font-semibold">1.2M subscribers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar Mock */}
      <div className="h-12 bg-black flex items-center justify-between px-6">
        <span className="text-white text-xs font-bold">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-white rounded-sm">
            <div className="w-3 h-1.5 bg-white rounded-sm m-[1px]" />
          </div>
        </div>
      </div>

      {/* Header with Hamburger */}
      <div className="bg-white border-b-[3px] border-black px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center bg-[#f3f4f6]"
          >
            <Menu size={20} strokeWidth={3} />
          </button>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border-[2px] border-black text-sm font-semibold bg-[#f3f4f6] placeholder:text-black/40"
            />
          </div>
          <button className="w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center bg-[#CCFF00]">
            <Bell size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div className="px-4 py-4 text-center">
        <h2 className="text-2xl font-[1000] uppercase tracking-tighter">
          {activeView === "dashboard" ? (
            "DASHBOARD"
          ) : (
            <>
              STUDIO <span className="text-[#00CCFF]">HUB</span>
            </>
          )}
        </h2>
      </div>

      {/* Collapsible Sections */}
      <div className="px-4 pb-8 space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border-[3px] border-black overflow-hidden shadow-[4px_4px_0px_0px_black]"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4"
              style={{ backgroundColor: section.color }}
            >
              <span className="font-[900] uppercase text-sm tracking-tight">{section.title}</span>
              {expandedSections.includes(section.id) ? (
                <ChevronUp size={20} strokeWidth={3} />
              ) : (
                <ChevronDown size={20} strokeWidth={3} />
              )}
            </button>
            {expandedSections.includes(section.id) && (
              <div className="p-4 bg-white">{section.content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileMockupB
