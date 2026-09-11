import React from "react"
import {
  BookOpen,
  Bot,
  CalendarDays,
  Lock,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { CommonWidgetProps } from "../types"

export const VerificationExplainerWidget: React.FC<
  CommonWidgetProps & { onNavigate: (to: string) => void }
> = ({ onNavigate, ...common }) => {
 const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>, to: string) => {
  event.preventDefault()
  onNavigate(to)
 }

 // Six on-brand feature chips, each on a different VT palette stop.
 // Deliberately short two-word verb phrases so the grid stays magnetic and
 // scannable at glance — the visitor's brain sees "OWN THE ALGO / KILL
 // GUESSWORK / SHIP FASTER" and gets the pitch before reading anything.
 const features: Array<{ Icon: typeof TrendingUp; title: string; desc: string; tone: string }> = [
  { Icon: TrendingUp, title: "OWN THE ALGO",   desc: "Live views, watch time, revenue in one canonical stream.",      tone: "cyan" },
  { Icon: RefreshCw,  title: "SYNC EVERYTHING", desc: "One tap pulls every video, comment, and metric — no CSVs.",     tone: "lime" },
  { Icon: CalendarDays,title: "PLAN & PUBLISH", desc: "Draft, schedule, and ship uploads on your cadence.",            tone: "orange" },
  { Icon: Bot,        title: "AI BRAIN",       desc: "Ask your channel anything, grounded in your data.",              tone: "magenta" },
  { Icon: Zap,        title: "KILL GUESSWORK", desc: "Metric-mapped diagnostics tell you what to change, not just what happened.", tone: "yellow" },
  { Icon: ShieldCheck,title: "STAY IN CONTROL", desc: "Your data lives in your browser cache. Disconnect anytime.",    tone: "royal" },
 ]

 return (
  <WidgetShell {...common} icon={<BookOpen size={22} aria-hidden="true" />}>
   <section className="widget-about" aria-label="Join VIEWTUBE">
    {/* HERO — big magnetic pitch. Word-per-line stacking keeps the
        typography feeling engineered, not slapped on. */}
    <header className="widget-about__hero">
     <div className="widget-about__hero-brand" translate="no">
      <span>View</span><span>Tube</span>
     </div>
     <div className="widget-about__hero-tagline">
      <b>The creator OS</b>
      <em>Everything you need to grow. Nothing you don't.</em>
     </div>
     <a
      href="/account/connect"
      onClick={event => handleNavigate(event, "/account/connect")}
      className="widget-about__hero-cta">
      <Rocket size={18} strokeWidth={2.75} aria-hidden="true" />
      <span>JOIN VIEWTUBE</span>
      <Sparkles size={16} strokeWidth={2.75} aria-hidden="true" />
     </a>
    </header>

    {/* Feature matrix — 6 on-brand chips */}
    <ul className="widget-about__features" aria-label="What VIEWTUBE does">
     {features.map(({ Icon, title, desc, tone }) => (
      <li key={title} className={`widget-about__feature is-${tone}`}>
       <span className="widget-about__feature-icon"><Icon size={18} strokeWidth={2.6} aria-hidden="true" /></span>
       <b>{title}</b>
       <p>{desc}</p>
      </li>
     ))}
    </ul>

    {/* Trust panel — smaller, quieter, but present so the "your data" question
        is answered before someone bounces. */}
    <aside className="widget-about__trust">
     <span className="widget-about__trust-lock"><Lock size={16} strokeWidth={2.75} aria-hidden="true" /></span>
     <p>
      <b>Private by design.</b> Data lives in your browser. Never sold. Disconnect anytime.
     </p>
    </aside>

    {/* Secondary links row */}
    <nav className="widget-about__links" aria-label="VIEWTUBE resources">
     <a href="/about" onClick={event => handleNavigate(event, "/about")} className="is-cyan">About</a>
     <a href="/user-guide" onClick={event => handleNavigate(event, "/user-guide")} className="is-yellow">User Guide</a>
     <a href="/privacy.html" className="is-magenta">Privacy</a>
     <a href="/terms.html" className="is-orange">Terms</a>
    </nav>
   </section>
  </WidgetShell>
 )
}
