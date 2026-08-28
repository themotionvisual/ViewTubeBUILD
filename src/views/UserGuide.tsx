import React, { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { GuideArticlePanel } from "../components/guide/GuideArticlePanel"
import { GuideDatasetExplorer } from "../components/guide/GuideDatasetExplorer"
import { GuideMetricExplorer } from "../components/guide/GuideMetricExplorer"
import { GuideWidgetExplorer } from "../components/guide/GuideWidgetExplorer"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  ChevronRight,
  CircleHelp,
  Database,
  Film,
  Gauge,
  Search,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react"
import {
  GUIDE_ARTICLES,
  GUIDE_DATASETS,
  GUIDE_FEATURES,
  GUIDE_METRICS,
  GUIDE_PAGES,
  GUIDE_TOOLS,
  GUIDE_WIDGETS,
  type GuideDomain,
  type GuideLifecycle,
} from "../content/guide-v2"

type SearchItem = {
  id: string
  kind: "Guide" | "Feature" | "Dataset" | "Metric" | "Tool" | "Widget"
  title: string
  description: string
  href?: string
  domain?: GuideDomain
}

const domainMeta: Record<GuideDomain, { label: string; className: string }> = {
  start: { label: "Start", className: "bg-[#CCFF00]" },
  analytics: { label: "Analytics", className: "bg-[#40C6E9]" },
  create: { label: "Create", className: "bg-[#FF8AAF]" },
  editor: { label: "Editor", className: "bg-[#FFD84D]" },
  publish: { label: "Publish", className: "bg-[#B79CFF]" },
  data: { label: "Data", className: "bg-[#72E6B1]" },
  reference: { label: "Reference", className: "bg-[#FFB86B]" },
  help: { label: "Help", className: "bg-[#E5E7EB]" },
}

const lifecycleClass: Record<GuideLifecycle, string> = {
  live: "bg-[#CCFF00]",
  beta: "bg-[#FFD84D]",
  experimental: "bg-[#FFB86B]",
  planned: "bg-[#B79CFF]",
  legacy: "bg-[#E5E7EB]",
}

const quickStarts = [
  { title: "Connect your channel", copy: "Authorize ViewTube, confirm the active channel, then run your first sync.", icon: Gauge, href: "#connect" },
  { title: "Understand Analytics", copy: "Learn how VT-SYNC, datasets, metrics, time windows and provenance fit together.", icon: BarChart3, href: "#analytics" },
  { title: "Create something", copy: "Move from idea and audience context into hooks, packaging, storyboards and projects.", icon: WandSparkles, href: "#create" },
  { title: "Edit a video", copy: "Learn the timeline, clips, transitions, preview, transport and editor workflow.", icon: Film, href: "#editor" },
]

const UserGuide: React.FC = () => {
  const [query, setQuery] = useState("")
  const [domain, setDomain] = useState<GuideDomain | "all">("all")

  const searchItems = useMemo<SearchItem[]>(() => [
    ...GUIDE_PAGES.map((page) => ({
      id: `page:${page.id}`, kind: "Guide" as const, title: page.title,
      description: `${page.depths.join(" / ")} guide`, href: `#${page.id}`, domain: page.domain,
    })),
    ...GUIDE_FEATURES.map((feature) => ({
      id: `feature:${feature.id}`, kind: "Feature" as const, title: feature.title,
      description: feature.summary, href: feature.routes[0], domain: feature.domain,
    })),
    ...GUIDE_DATASETS.map((dataset) => ({
      id: `dataset:${dataset.id}`, kind: "Dataset" as const, title: dataset.label,
      description: dataset.description, href: "#datasets", domain: "analytics" as const,
    })),
    ...GUIDE_METRICS.map((metric) => ({
      id: `metric:${metric.id}`, kind: "Metric" as const, title: metric.label,
      description: metric.definition, href: "#metrics", domain: "reference" as const,
    })),
    ...GUIDE_TOOLS.map((tool) => ({
      id: `tool:${tool.id}`, kind: "Tool" as const, title: tool.title,
      description: tool.summary, href: tool.routes[0], domain: undefined,
    })),
    ...GUIDE_WIDGETS.map((widget) => ({
      id: `widget:${widget.id}`, kind: "Widget" as const, title: widget.title,
      description: widget.detailedDescription, href: "#widgets", domain: "start" as const,
    })),
  ], [])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return searchItems.filter((item) => {
      if (domain !== "all" && item.domain && item.domain !== domain) return false
      return `${item.title} ${item.description} ${item.kind}`.toLowerCase().includes(needle)
    }).slice(0, 12)
  }, [domain, query, searchItems])

  const liveFeatures = GUIDE_FEATURES.filter((feature) => feature.lifecycle !== "legacy")
  const analyticsTables = GUIDE_DATASETS.length

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1500px] overflow-x-hidden px-3 pb-28 pt-4 sm:px-5 lg:px-8">
      <header className="min-w-0 overflow-hidden rounded-[22px] border-[4px] border-black bg-[#CCFF00] shadow-[8px_8px_0_0_#000]">
        <div className="grid min-w-0 gap-6 p-5 md:grid-cols-[1.4fr_.6fr] md:p-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[.16em]">
              <BookOpen size={15} strokeWidth={3} /> Guide V2
            </div>
            <h1 className="max-w-4xl text-4xl font-black uppercase leading-[.9] tracking-[-.055em] text-black sm:text-6xl lg:text-7xl">
              Learn ViewTube by doing.
            </h1>
            <p className="mt-5 max-w-3xl text-base font-bold leading-snug text-black/75 sm:text-lg">
              One searchable manual for connecting your channel, understanding your data, creating, editing, publishing, and fixing problems.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-3 self-end">
            <Stat value={String(liveFeatures.length)} label="Current features" />
            <Stat value={String(analyticsTables)} label="Data tables" />
            <Stat value={String(GUIDE_METRICS.length)} label="Core metrics" />
            <Stat value={String(GUIDE_TOOLS.length)} label="Tool systems" />
          </div>
        </div>
        <div className="min-w-0 border-t-[4px] border-black bg-white p-3 sm:p-4 md:p-5">
          <label className="flex min-w-0 items-center gap-2 rounded-2xl sm:gap-3 border-[4px] border-black bg-white px-4 shadow-[4px_4px_0_0_#000] focus-within:bg-[#FFFBEA]">
            <Search size={24} strokeWidth={3} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ViewTube..."
              className="w-0 min-w-0 flex-1 bg-transparent py-4 text-sm font-black outline-none placeholder:text-black/35 sm:text-lg"
            />
            <kbd className="hidden rounded-lg border-2 border-black bg-[#E5E7EB] px-2 py-1 text-xs font-black sm:block">GUIDE</kbd>
          </label>
          {query && (
            <div className="mt-3 grid gap-2">
              {results.length ? results.map((item) => (
                <a key={item.id} href={item.href || "#"} className="flex items-center gap-3 rounded-xl border-[3px] border-black bg-white p-3 font-bold hover:bg-[#40C6E9]">
                  <span className="rounded-md border-2 border-black bg-[#E5E7EB] px-2 py-1 text-[10px] font-black uppercase">{item.kind}</span>
                  <span className="min-w-0 flex-1"><strong className="block truncate">{item.title}</strong><small className="block truncate text-black/60">{item.description}</small></span>
                  <ChevronRight size={18} strokeWidth={3} />
                </a>
              )) : <p className="p-3 text-sm font-black">No guide results yet.</p>}
            </div>
          )}
        </div>
      </header>

      <nav aria-label="Guide sections" className="sticky top-2 z-20 mt-6 flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain rounded-2xl border-[4px] border-black bg-white p-2 shadow-[5px_5px_0_0_#000]">
        <button onClick={() => setDomain("all")} className={`shrink-0 rounded-xl border-[3px] border-black px-3 py-2 text-xs font-black uppercase ${domain === "all" ? "bg-black text-white" : "bg-white"}`}>All</button>
        {(Object.keys(domainMeta) as GuideDomain[]).map((key) => (
          <button key={key} onClick={() => setDomain(key)} className={`shrink-0 rounded-xl border-[3px] border-black px-3 py-2 text-xs font-black uppercase ${domain === key ? domainMeta[key].className : "bg-white"}`}>{domainMeta[key].label}</button>
        ))}
      </nav>

      <section id="start" className="mt-8 scroll-mt-28">
        <SectionTitle eyebrow="01 · Start here" title="Four ways in" icon={Sparkles} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStarts.map(({ title, copy, icon: Icon, href }, index) => (
            <a key={title} href={href} className={`group rounded-2xl border-[4px] border-black p-5 shadow-[6px_6px_0_0_#000] transition-transform hover:-translate-y-1 ${["bg-[#CCFF00]","bg-[#40C6E9]","bg-[#FF8AAF]","bg-[#FFD84D]"][index]}`}>
              <Icon size={30} strokeWidth={3} />
              <h3 className="mt-8 text-2xl font-black uppercase leading-none">{title}</h3>
              <p className="mt-3 text-sm font-bold leading-snug">{copy}</p>
              <ArrowRight className="mt-5 transition-transform group-hover:translate-x-2" strokeWidth={3} />
            </a>
          ))}
        </div>
      </section>

      <section id="app-map" className="mt-10 scroll-mt-28">
        <SectionTitle eyebrow="02 · Product map" title="What is actually in ViewTube?" icon={Boxes} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {GUIDE_FEATURES.filter((feature) => domain === "all" || feature.domain === domain).map((feature) => (
            <article key={feature.id} className="rounded-2xl border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-lg border-2 border-black px-2 py-1 text-[10px] font-black uppercase ${domainMeta[feature.domain].className}`}>{domainMeta[feature.domain].label}</span>
                <span className={`rounded-full border-2 border-black px-2 py-1 text-[9px] font-black uppercase ${lifecycleClass[feature.lifecycle]}`}>{feature.lifecycle}</span>
              </div>
              <h3 className="mt-4 text-xl font-black uppercase leading-none">{feature.title}</h3>
              <p className="mt-2 min-h-[42px] text-sm font-bold text-black/65">{feature.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {feature.routes.slice(0, 2).map((route) => <Link key={route} to={route} className="rounded-lg border-2 border-black bg-[#F3F4F6] px-2 py-1 text-[10px] font-black">{route}</Link>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="widgets" className="mt-10 scroll-mt-28">
        <SectionTitle eyebrow="03 · Widgets" title="Dashboard module encyclopedia" icon={Boxes} />
        <GuideWidgetExplorer />
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="04 · Deep guides" title="Choose how deep to go" icon={BookOpen} />
        <div className="grid gap-4">
          {GUIDE_ARTICLES.map((article) => <GuideArticlePanel key={article.pageId} article={article} />)}
        </div>
      </section>

      <section id="analytics" className="mt-10 scroll-mt-28">
        <SectionTitle eyebrow="05 · Analytics" title="Data you can trace" icon={Database} />
        <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-2xl border-[4px] border-black bg-[#40C6E9] p-5 shadow-[6px_6px_0_0_#000]">
            <h3 className="text-3xl font-black uppercase leading-none">VT-SYNC is the data spine.</h3>
            <p className="mt-4 font-bold">The guide reads the same visible dataset registry as Analytics. When canonical tables change, the encyclopedia changes with them instead of drifting into a second list.</p>
            <Link to="/local-analytics" className="mt-6 inline-flex items-center gap-2 rounded-xl border-[3px] border-black bg-white px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0_0_#000]">Open Analytics <ArrowRight size={17} /></Link>
          </div>
          <div id="datasets" className="lg:col-span-2"><GuideDatasetExplorer /></div>
        </div>
      </section>

      <section id="metrics" className="mt-10 scroll-mt-28">
        <SectionTitle eyebrow="06 · Reference" title="Metric dictionary" icon={BookOpen} />
        <GuideMetricExplorer />
      </section>

      <section id="create" className="mt-10 scroll-mt-28">
        <SectionTitle eyebrow="07 · Workflows" title="Create → edit → publish" icon={Upload} />
        <div className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_0_#000]">
          <div className="grid gap-3 md:grid-cols-3">
            <FlowCard number="1" title="Create" copy="Ideas, audience signals, projects, hooks, thumbnails and storyboards." className="bg-[#FF8AAF]" />
            <FlowCard number="2" title="Edit" copy="Timeline composition, clips, transitions, preview, captions and rendering." className="bg-[#FFD84D]" id="editor" />
            <FlowCard number="3" title="Publish" copy="SEO, packaging metadata, upload preparation and post-publish learning." className="bg-[#B79CFF]" />
          </div>
        </div>
      </section>

      <section id="connect" className="mt-10 scroll-mt-28">
        <SectionTitle eyebrow="08 · Connection" title="Simple channel setup" icon={Gauge} />
        <div className="rounded-2xl border-[4px] border-black bg-[#CCFF00] p-5 shadow-[6px_6px_0_0_#000]">
          <div className="grid gap-3 md:grid-cols-3">
            {["Connect Google", "Confirm your YouTube channel", "Run the datasets you need"].map((step, index) => (
              <div key={step} className="rounded-xl border-[3px] border-black bg-white p-4">
                <span className="text-4xl font-black">{index + 1}</span><h3 className="mt-5 text-lg font-black uppercase">{step}</h3>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-bold">Technical auth migration details stay out of the beginner path. The normal workflow is intentionally just connection → channel confirmation → sync.</p>
        </div>
      </section>

      <section id="help" className="mt-10 scroll-mt-28">
        <SectionTitle eyebrow="09 · Help" title="Find the broken layer" icon={CircleHelp} />
        <div className="grid gap-3 md:grid-cols-4">
          {["Connection", "Sync & data", "Tool output", "Editor & render"].map((title, index) => (
            <div key={title} className="rounded-2xl border-[3px] border-black bg-white p-4">
              <span className="text-xs font-black uppercase text-black/45">Check {index + 1}</span>
              <h3 className="mt-2 text-xl font-black uppercase">{title}</h3>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-xl border-[3px] border-black bg-white p-3 shadow-[3px_3px_0_0_#000]">
    <div className="text-3xl font-black leading-none">{value}</div>
    <div className="mt-1 text-[10px] font-black uppercase tracking-wide">{label}</div>
  </div>
)

const SectionTitle = ({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div><p className="text-xs font-black uppercase tracking-[.18em] text-black/50">{eyebrow}</p><h2 className="mt-1 text-3xl font-black uppercase leading-none tracking-[-.035em] sm:text-4xl">{title}</h2></div>
    <Icon size={30} strokeWidth={3} />
  </div>
)

const FlowCard = ({ number, title, copy, className, id }: { number: string; title: string; copy: string; className: string; id?: string }) => (
  <article id={id} className={`scroll-mt-28 rounded-xl border-[3px] border-black p-5 ${className}`}>
    <span className="text-5xl font-black">{number}</span><h3 className="mt-8 text-2xl font-black uppercase">{title}</h3><p className="mt-2 text-sm font-bold">{copy}</p>
  </article>
)

export default UserGuide
