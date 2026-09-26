import React from "react"
import { BookOpenText, FileText, Search, Sparkles } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { SubToolbox, ToolboxScaffold } from "../../components/Toolbox"
import ResourceDocumentRenderer from "./ResourceDocumentRenderer"
import {
  RESOURCE_LIBRARY_ENTRIES,
  getResourceById,
} from "./resourceLibraryRegistry"
import "./resource-library.css"

const ResourceLibrary: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedResource = getResourceById(searchParams.get("resource"))
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("All")

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(RESOURCE_LIBRARY_ENTRIES.map((resource) => resource.category)))],
    [],
  )

  const filteredResources = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return RESOURCE_LIBRARY_ENTRIES.filter((resource) => {
      if (category !== "All" && resource.category !== category) return false
      if (!normalizedQuery) return true
      const haystack = [
        resource.title,
        resource.shortTitle,
        resource.description,
        resource.category,
        ...resource.secondaryCategories,
        ...resource.tags,
      ]
        .join(" ")
        .toLocaleLowerCase()
      return normalizedQuery.split(/\s+/).every((term) => haystack.includes(term))
    })
  }, [category, query])

  const selectedResource =
    requestedResource && filteredResources.some((resource) => resource.id === requestedResource.id)
      ? requestedResource
      : filteredResources[0] || null

  const selectResource = (resourceId: string) => {
    const next = new URLSearchParams(searchParams)
    next.set("resource", resourceId)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="vt-resource-library-page">
      <ToolboxScaffold
        title="RESOURCE LIBRARY"
        subtitle="Source-grounded creator references, guides, playbooks and reusable learning resources."
        icon={<BookOpenText />}
        paletteIndex={8}
        collapsible={false}
        contentClassName="vt-resource-library-shell"
        helpText="Browse creator-facing references. Each document is stored as canonical Markdown and rendered through ViewTube Toolbox/SubToolbox primitives."
      >
        <section className="vt-resource-library-overview" aria-label="Resource Library overview">
          <div className="vt-resource-overview-module">
            <span>LIBRARY</span>
            <strong>{RESOURCE_LIBRARY_ENTRIES.length}</strong>
            <small>published resource{RESOURCE_LIBRARY_ENTRIES.length === 1 ? "" : "s"}</small>
          </div>
          <div className="vt-resource-overview-module">
            <span>FORMAT</span>
            <strong>MD</strong>
            <small>canonical editable source</small>
          </div>
          <div className="vt-resource-overview-module">
            <span>DESIGN</span>
            <strong>VT UI</strong>
            <small>Toolbox document renderer</small>
          </div>
          <div className="vt-resource-overview-module">
            <span>FIRST SERIES</span>
            <strong>15</strong>
            <small>creator references planned</small>
          </div>
        </section>

        <div className="vt-resource-library-layout">
          <aside className="vt-resource-library-index">
            <SubToolbox
              title="RESOURCE INDEX"
              icon={<Search />}
              isOpenInitial
              unmountOnClose={false}
              contentClassName="vt-resource-index-content"
              persistenceId="resource-library:index"
              helpText="Search and filter published Resource Library documents."
            >
              <label className="vt-resource-search-field">
                <span>SEARCH</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Recommendations, analytics, Shorts..."
                />
              </label>

              <label className="vt-resource-filter-field">
                <span>CATEGORY</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <div className="vt-resource-index-results">
                {filteredResources.map((resource) => {
                  const active = selectedResource?.id === resource.id
                  return (
                    <button
                      key={resource.id}
                      type="button"
                      className={`vt-resource-card ${active ? "is-active" : ""}`}
                      onClick={() => selectResource(resource.id)}
                      aria-pressed={active}
                    >
                      <div className="vt-resource-card-icon"><FileText aria-hidden="true" /></div>
                      <div className="vt-resource-card-copy">
                        <span>{resource.category}</span>
                        <strong>{resource.shortTitle}</strong>
                        <small>{resource.readTime} · {resource.difficulty}</small>
                      </div>
                    </button>
                  )
                })}

                {filteredResources.length === 0 ? (
                  <div className="vt-resource-empty">
                    <Sparkles aria-hidden="true" />
                    <strong>No matching resources</strong>
                    <span>Clear the search or choose another category.</span>
                  </div>
                ) : null}
              </div>
            </SubToolbox>
          </aside>

          <main className="vt-resource-library-reader">
            {selectedResource ? (
              <ResourceDocumentRenderer resource={selectedResource} />
            ) : (
              <div className="vt-resource-empty vt-resource-empty--reader">
                <BookOpenText aria-hidden="true" />
                <strong>Select a resource</strong>
                <span>The document will open here without leaving the Resource Library.</span>
              </div>
            )}
          </main>
        </div>
      </ToolboxScaffold>
    </div>
  )
}

export default ResourceLibrary
