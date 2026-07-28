import React from "react"
import { Link } from "react-router-dom"
import { Sparkles, BarChart3, Wand2, CalendarDays, Video, BookOpen, ArrowRight, PartyPopper, TrendingUp, MessageSquare, Target, Send } from "lucide-react"
import { useUnifiedAccount } from "../context/UnifiedAccountContext"

const navPreview = [
  { label: "Dashboard", color: "#FA618A" },
  { label: "Studio", color: "#FF7F6B" },
  { label: "Projects", color: "#FFA85C" },
  { label: "AI Brain", color: "#FFDA47" },
  { label: "VT Sync", color: "#C0F240" },
  { label: "Editor", color: "#3FEE56" },
  { label: "Settings", color: "#36E0F6" },
  { label: "User Guide", color: "#528FFA" },
]

const statTiles = [
  { label: "Subscribers", value: "4,130", tone: "#FA618A" },
  { label: "Views", value: "1.1M", tone: "#FFA85C" },
  { label: "Watch Time", value: "16.1K", tone: "#FFDA47" },
  { label: "Avg View Dur", value: "0:53", tone: "#3FEE56" },
  { label: "Revenue", value: "$440", tone: "#36E0F6" },
  { label: "Videos", value: "953", tone: "#9933FF" },
]

const pillars = [
  {
    icon: BarChart3,
    color: "#40C6E9",
    rotate: "-1.5deg",
    title: "Analytics",
    body: "Your real channel data — views, watch time, revenue, retention, traffic sources — pulled straight from YouTube and kept in sync.",
    to: "/performance",
  },
  {
    icon: Sparkles,
    color: "#FFDA47",
    rotate: "1.5deg",
    title: "AI Brain",
    body: "One ongoing conversation. Ask a question in plain language and it answers from your own channel's data, or tells you what's missing.",
    to: "/ai-brain",
  },
  {
    icon: Wand2,
    color: "#FF7AC8",
    rotate: "-1deg",
    title: "Studio",
    body: "Titles, thumbnails, hooks, and SEO tools for turning an idea into a video that's ready to publish.",
    to: "/studio",
  },
  {
    icon: CalendarDays,
    color: "#C0F240",
    rotate: "1deg",
    title: "Projects",
    body: "A calendar for planning uploads and tracking what's in progress across your channel.",
    to: "/projects",
  },
  {
    icon: Video,
    color: "#FA618A",
    rotate: "-1.5deg",
    title: "Editor",
    body: "A lightweight editing runtime for putting a video together without leaving ViewTube.",
    to: "/editor",
  },
  {
    icon: BookOpen,
    color: "#3FEE56",
    rotate: "1.5deg",
    title: "User Guide",
    body: "A practical, tool-by-tool reference: what each surface does, how to use it, and how to troubleshoot it.",
    to: "/user-guide",
  },
]

const About: React.FC = () => {
  const account = useUnifiedAccount()
  const joinViewTube = () => void account.start(account.intent, "/")

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24 pt-8 space-y-8">
      {/* Hero */}
      <section className="relative border-[4px] border-black rounded-[28px] bg-[#FFDA47] shadow-[10px_10px_0px_0px_black] overflow-hidden px-6 py-10 md:px-10 md:py-14">
        <span
          aria-hidden="true"
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-[4px] border-black bg-[#FF7AC8] hidden md:block"
          style={{ transform: "rotate(8deg)" }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-6 -left-8 w-20 h-20 rounded-2xl border-[4px] border-black bg-[#40C6E9] hidden md:block"
          style={{ transform: "rotate(-12deg)" }}
        />
        <span
          aria-hidden="true"
          className="absolute top-10 right-24 w-12 h-12 rounded-full border-[3px] border-black bg-[#3FEE56] hidden lg:block"
          style={{ transform: "rotate(4deg)" }}
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 border-[3px] border-black rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0px_0px_black]">
            <PartyPopper size={14} strokeWidth={3} /> Hey, welcome
          </span>
          <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-black uppercase leading-[0.92] tracking-[-0.03em] text-black mt-4">
            This is<br />ViewTube.
          </h1>
          <p className="text-lg md:text-xl font-bold text-black mt-4 max-w-2xl">
            One workspace for YouTube creators: analytics, content planning, SEO, thumbnails,
            editing, and an AI assistant that ties them together. Ask "why did views drop" and
            get an answer you can act on, not a dashboard to decode.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button
              type="button"
              onClick={joinViewTube}
              className="group inline-flex items-center gap-2 px-6 py-4 border-[3px] border-black rounded-2xl bg-black text-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
            >
              Join ViewTube — it's free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/user-guide"
              className="px-6 py-4 border-[3px] border-black rounded-2xl bg-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_black] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_black] transition-all"
            >
              Read the User Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Live showcase — a real mock of the app's own UI, not stock imagery */}
      <section className="border-[4px] border-black rounded-[28px] bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
        <div className="px-6 pt-6 md:px-8 md:pt-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Peek inside</h2>
          <p className="text-sm md:text-base font-bold text-gray-700 mt-1">This is the actual look and feel — bold color, thick borders, hard shadows, everywhere.</p>
        </div>

        <div className="p-4 md:p-6 space-y-3">
          {/* Mini nav bar, exact palette */}
          <div className="border-[3px] border-black rounded-2xl bg-[#f3f4f6] p-2 flex flex-wrap gap-1.5">
            {navPreview.map((item) => (
              <span
                key={item.label}
                className="px-3 py-2 border-[2px] border-black rounded-lg text-[10px] font-black uppercase tracking-wide"
                style={{ backgroundColor: item.color }}
              >
                {item.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Channel Overview mock */}
            <div className="border-[3px] border-black rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#d8d8d8] border-b-[3px] border-black">
                <TrendingUp size={16} strokeWidth={3} />
                <span className="text-xs font-black uppercase tracking-wide">Channel Overview</span>
              </div>
              <div className="p-3 grid grid-cols-3 gap-2 bg-white">
                {statTiles.map((tile) => (
                  <div key={tile.label} className="border-[2px] border-black rounded-lg p-2" style={{ backgroundColor: tile.tone }}>
                    <div className="text-[8px] font-black uppercase tracking-wide opacity-70">{tile.label}</div>
                    <div className="text-lg font-black uppercase tracking-tight">{tile.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Post mock */}
            <div className="border-[3px] border-black rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#FF7F6B] border-b-[3px] border-black">
                <MessageSquare size={16} strokeWidth={3} />
                <span className="text-xs font-black uppercase tracking-wide">Community Post</span>
              </div>
              <div className="p-3 bg-white space-y-2">
                <div className="border-[2px] border-black rounded-lg bg-[#f3f4f6] h-12 px-3 py-2 text-[11px] font-bold text-gray-500">What's on your mind?</div>
                <div className="border-[2px] border-black rounded-lg bg-[#FF7F6B] py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase">
                  <Send size={12} strokeWidth={3} /> Post to Channel
                </div>
              </div>
            </div>

            {/* Goals Tracker mock */}
            <div className="border-[3px] border-black rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#3FEE56] border-b-[3px] border-black">
                <Target size={16} strokeWidth={3} />
                <span className="text-xs font-black uppercase tracking-wide">Goals Tracker</span>
              </div>
              <div className="p-3 bg-white flex items-center gap-3">
                <div className="w-16 h-16 rounded-full border-[3px] border-black grid place-items-center text-sm font-black" style={{ background: "conic-gradient(#3FEE56 0 29%, #fff 29%)" }}>29%</div>
                <div className="flex flex-col gap-1.5 flex-1">
                  {["Subs", "Views", "$Rev"].map((g) => (
                    <span key={g} className="border-[2px] border-black rounded-md px-2 py-1 text-[9px] font-black uppercase text-center">{g}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Brain mock */}
            <div className="border-[3px] border-black rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#FFDA47] border-b-[3px] border-black">
                <Sparkles size={16} strokeWidth={3} />
                <span className="text-xs font-black uppercase tracking-wide">AI Brain</span>
              </div>
              <div className="p-3 bg-white space-y-2">
                <div className="border-[2px] border-black rounded-lg bg-[#f8f8f4] p-2 text-[11px] font-bold">"Why did views drop last week?"</div>
                <div className="border-[2px] border-black rounded-lg bg-[#FFDA47] p-2 text-[10px] font-black">Your last 2 uploads skipped Shorts — that's usually 40% of your weekly views.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-[4px] border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_black] p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Who it's for</h2>
        <p className="text-base font-bold text-gray-800 max-w-3xl">
          Working YouTube creators, channel owners, and the editors or managers who run channels
          for them. Connect your channel once — every tool in ViewTube works from that same real
          data, so nothing you look at is a guess.
        </p>
      </section>

      {/* Pillars */}
      <section>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 px-1">What's inside</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <Link
                key={pillar.title}
                to={pillar.to}
                className="border-[3px] border-black rounded-2xl bg-white shadow-[5px_5px_0px_0px_black] p-5 flex flex-col gap-3 hover:-translate-y-[3px] hover:shadow-[7px_7px_0px_0px_black] transition-all"
              >
                <span
                  className="w-12 h-12 grid place-items-center border-[3px] border-black rounded-xl"
                  style={{ backgroundColor: pillar.color, transform: `rotate(${pillar.rotate})` }}
                >
                  <Icon size={22} strokeWidth={2.5} className="text-black" />
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight">{pillar.title}</h3>
                <p className="text-sm font-bold text-gray-700">{pillar.body}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-[4px] border-black rounded-[28px] bg-[#101010] text-white shadow-[8px_8px_0px_0px_black] overflow-hidden p-7 md:p-10">
        <span
          aria-hidden="true"
          className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-[4px] border-black bg-[#C0F240] opacity-90 hidden md:block"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Ready to connect your channel?</h2>
            <p className="text-sm md:text-base font-bold text-white/70 mt-2">Sign up is free, and your first sync takes about two minutes.</p>
          </div>
          <button
            type="button"
            onClick={joinViewTube}
            className="relative px-6 py-4 border-[3px] border-white rounded-2xl bg-[#C0F240] text-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_white] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_white] transition-all"
          >
            Join ViewTube
          </button>
        </div>
      </section>
    </div>
  )
}

export default About
