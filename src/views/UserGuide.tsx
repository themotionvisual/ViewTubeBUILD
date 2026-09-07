import React, { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Map,
  Search,
  Wrench,
} from "lucide-react"
import {
  GUIDE_LAST_UPDATED,
  GUIDE_PROTOCOL_VERSION,
  type GuideToolEntry,
  userGuideSections,
} from "../content/userGuideContent"
import { getToolboxPaletteColors } from "../styles/toolboxPalette"

type PageGroup = {
  id: string
  title: string
  routeRef: string
  audience: string
  tools: Array<GuideToolEntry & { sourceSection: string }>
}

const cleanRoute = (value: string) => {
  const path = value.split("?")[0]?.split("#")[0] || "/"
  return path.length > 1 ? path.replace(/\/$/, "") : path
}

const titleFromRoute = (route: string) => {
  if (route === "/") return "Dashboard"
  return route
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()))
    .join(" · ")
}

const PAGE_TITLE_OVERRIDES: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/ai-brain": "AI Brain",
  "/local-analytics": "Analytics / VT-SYNC",
  "/performance": "Performance Hub",
  "/studio/internal-analytics": "Internal Analytics",
  "/studio": "Studio Hub",
  "/video-manager": "Video Manager",
  "/strategy": "Strategy",
  "/seo-generator": "SEO Generator",
  "/video-publisher": "Video Publisher",
  "/media-analyzer": "Media Analyzer",
  "/hook-generator": "Hook Generator",
  "/thumbnail-studio": "Thumbnail Studio",
  "/storyboard-studio": "Storyboard Studio",
  "/editor": "ViewTube Editor",
  "/vault": "Creator Vault",
  "/settings": "Settings",
  "/account": "Account",
}

const UserGuide: React.FC = () => {
  const location = useLocation()
  const activeHash = useMemo(() => location.hash.replace("#", ""), [location.hash])
  const [query, setQuery] = useState("")
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({})

  const pages = useMemo<PageGroup[]>(() => {
    const groups = new Map<string, PageGroup>()

    for (const section of userGuideSections) {
      for (const tool of section.tools) {
        const routeRef = cleanRoute(tool.routeRef)
        const id = `page-${routeRef === "/" ? "dashboard" : routeRef.slice(1).replace(/[^a-z0-9]+/gi, "-")}`
        const existing = groups.get(routeRef)
        const nextTool = { ...tool, sourceSection: section.title }

        if (existing) {
          existing.tools.push(nextTool)
          if (!existing.audience.includes(section.audience)) {
            existing.audience = `${existing.audience} ${section.audience}`
          }
        } else {
          groups.set(routeRef, {
            id,
            title: PAGE_TITLE_OVERRIDES[routeRef] || titleFromRoute(routeRef),
            routeRef,
            audience: section.audience,
            tools: [nextTool],
          })
        }
      }
    }

    return Array.from(groups.values()).sort((a, b) => {
      const order = [
        "/",
        "/projects",
        "/ai-brain",
        "/local-analytics",
        "/performance",
        "/studio/internal-analytics",
        "/studio",
        "/video-manager",
        "/strategy",
        "/media-analyzer",
        "/hook-generator",
        "/thumbnail-studio",
        "/storyboard-studio",
        "/seo-generator",
        "/video-publisher",
        "/editor",
        "/vault",
        "/account",
        "/settings",
      ]
      const ai = order.indexOf(a.routeRef)
      const bi = order.indexOf(b.routeRef)
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      return a.title.localeCompare(b.title)
    })
  }, [])

  const filteredPages = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return pages

    return pages
      .map((page) => ({
        ...page,
        tools: page.tools.filter((tool) =>
          `${page.title} ${page.routeRef} ${tool.toolName} ${tool.whatItDoes} ${tool.sourceSection}`
            .toLowerCase()
            .includes(needle),
        ),
      }))
      .filter((page) => page.tools.length > 0)
  }, [pages, query])

  const totalTools = pages.reduce((sum, page) => sum + page.tools.length, 0)

  return (
    <main className="mx-auto w-full max-w-[1500px] px-3 pb-24 pt-4 sm:px-5 lg:px-8">
      <header className="overflow-hidden rounded-2xl border-[4px] border-black bg-[#CCFF00] shadow-[7px_7px_0_0_#000]">
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center lg:px-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[.14em]">
              <BookOpen size={13} strokeWidth={3} /> ViewTubeX Guide {GUIDE_PROTOCOL_VERSION}
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase leading-[.9] tracking-[-.045em] sm:text-4xl">
              Tools organized by page.
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-bold text-black/65">
              Find the page you are on, then see every documented tool, workflow, troubleshooting step, and QA check attached to it.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat value={String(pages.length)} label="Pages" />
            <Stat value={String(totalTools)} label="Tools" />
            <Stat value={GUIDE_LAST_UPDATED} label="Updated" compact />
          </div>
        </div>

        <div className="border-t-[4px] border-black bg-white p-2.5">
          <label className="flex items-center gap-2 rounded-xl border-[3px] border-black bg-white px-3 focus-within:bg-[#FFFBEA]">
            <Search size={19} strokeWidth={3} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages and tools..."
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-black outline-none placeholder:text-black/30"
            />
            <span className="rounded-md border-2 border-black bg-[#E5E7EB] px-2 py-0.5 text-[9px] font-black uppercase">
              {filteredPages.length} pages
            </span>
          </label>
        </div>
      </header>

      <section className="mt-5 rounded-2xl border-[4px] border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
        <div className="mb-2 flex items-center gap-2">
          <Map size={18} strokeWidth={3} />
          <h2 className="text-sm font-black uppercase">Browse by page</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pages.map((page, index) => {
            const palette = getToolboxPaletteColors(index)
            const isActive = activeHash === page.id
            return (
              <a
                key={page.id}
                href={`#${page.id}`}
                className={`shrink-0 rounded-lg border-[2px] border-black px-2.5 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000] ${isActive ? "ring-2 ring-black ring-offset-1" : ""}`}
                style={{ backgroundColor: palette.header }}
              >
                {page.title}
              </a>
            )
          })}
        </div>
      </section>

      <div className="mt-5 space-y-4">
        {filteredPages.map((page, pageIndex) => {
          const palette = getToolboxPaletteColors(pageIndex)
          return (
            <section
              key={page.id}
              id={page.id}
              className="scroll-mt-24 overflow-hidden rounded-2xl border-[4px] border-black bg-white shadow-[5px_5px_0_0_#000]"
            >
              <div className="flex min-w-0 items-stretch border-b-[4px] border-black" style={{ backgroundColor: palette.header }}>
                <div
                  className="flex w-14 shrink-0 items-center justify-center border-r-[4px] border-black text-xl font-black"
                  style={{ backgroundColor: palette.icon }}
                >
                  {String(pageIndex + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-xl font-black uppercase leading-none">{page.title}</h2>
                      <p className="mt-1 truncate text-[11px] font-bold text-black/60">{page.audience}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border-2 border-black bg-white/75 px-2 py-1 text-[8px] font-black uppercase">
                        {page.tools.length} {page.tools.length === 1 ? "tool" : "tools"}
                      </span>
                      <Link
                        to={page.routeRef}
                        className="rounded-lg border-2 border-black bg-white px-2 py-1 text-[9px] font-black"
                      >
                        {page.routeRef}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 p-3 lg:grid-cols-2">
                {page.tools.map((tool, toolIndex) => {
                  const toolPalette = getToolboxPaletteColors(pageIndex + toolIndex + 1)
                  const expanded = expandedTools[tool.toolId] ?? false
                  return (
                    <article
                      key={tool.toolId}
                      className="min-w-0 overflow-hidden rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_0_#000]"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedTools((state) => ({ ...state, [tool.toolId]: !expanded }))}
                        className="flex w-full min-w-0 items-stretch text-left"
                        style={{ backgroundColor: toolPalette.header }}
                      >
                        <span
                          className="flex w-11 shrink-0 items-center justify-center border-r-[3px] border-black"
                          style={{ backgroundColor: toolPalette.icon }}
                        >
                          <Wrench size={18} strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1 px-3 py-2.5">
                          <span className="block truncate text-[13px] font-black uppercase leading-none">{tool.toolName}</span>
                          <span className="mt-1 line-clamp-2 block text-[10px] font-bold leading-tight text-black/65">{tool.whatItDoes}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 px-2">
                          <span className="hidden rounded-md border-2 border-black bg-white/70 px-1.5 py-0.5 text-[7px] font-black uppercase sm:block">
                            {tool.sourceSection}
                          </span>
                          {expanded ? <ChevronDown size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
                        </span>
                      </button>

                      {expanded && (
                        <div className="grid gap-2 border-t-[3px] border-black bg-[#F3F4F6] p-2.5 xl:grid-cols-3">
                          <DetailBlock title="How to use" icon={Wrench} items={tool.howToSteps} />
                          <DetailBlock title="Troubleshooting" icon={AlertTriangle} items={tool.troubleshooting} />
                          <DetailBlock title="QA checklist" icon={CheckCircle2} items={tool.qaChecks} />
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {!filteredPages.length && (
        <div className="mt-5 rounded-2xl border-[4px] border-black bg-white p-8 text-center shadow-[5px_5px_0_0_#000]">
          <p className="text-xl font-black uppercase">No matching guide tools.</p>
          <p className="mt-2 text-sm font-bold text-black/55">Try another page name, route, or tool name.</p>
        </div>
      )}
    </main>
  )
}

const DetailBlock = ({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  items: string[]
}) => (
  <div className="rounded-lg border-[2px] border-black bg-white p-3">
    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.12em]">
      <Icon size={13} strokeWidth={3} /> {title}
    </p>
    <ul className="space-y-1.5 pl-4 text-xs font-bold leading-snug">
      {items.map((item) => (
        <li key={item} className="list-disc">{item}</li>
      ))}
    </ul>
  </div>
)

const Stat = ({ value, label, compact = false }: { value: string; label: string; compact?: boolean }) => (
  <div className="min-w-0 rounded-lg border-[3px] border-black bg-white px-2.5 py-2 shadow-[2px_2px_0_0_#000]">
    <div className={`${compact ? "text-xs" : "text-2xl"} truncate font-black leading-none`}>{value}</div>
    <div className="mt-1 text-[8px] font-black uppercase tracking-wide">{label}</div>
  </div>
)

export default UserGuide
