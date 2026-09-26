import React from "react"
import ReactMarkdown from "react-markdown"
import {
  Activity,
  BookOpenCheck,
  BrainCircuit,
  Compass,
  GitBranch,
  Lightbulb,
  ListChecks,
  Route,
  Search,
  ShieldCheck,
  TableProperties,
  Target,
  Workflow,
} from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import type {
  ParsedResourceSection,
  ResourceLibraryEntry,
} from "./resourceLibraryRegistry"
import { parseResourceDocument } from "./resourceLibraryRegistry"

type MarkdownBlock =
  | { kind: "markdown"; value: string }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "checklist"; items: Array<{ checked: boolean; text: string }> }
  | { kind: "mermaid"; value: string }
  | { kind: "quote"; value: string }

const tableCells = (line: string): string[] => {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "")
  return trimmed.split("|").map((cell) => cell.trim())
}

const isTableDivider = (line: string): boolean => {
  const cells = tableCells(line)
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

const isChecklistLine = (line: string): boolean => /^\s*- \[[ xX]\]\s+/.test(line)

const startsSpecialBlock = (lines: string[], index: number): boolean => {
  const line = lines[index] || ""
  if (line.startsWith("```")) return true
  if (line.startsWith("> ")) return true
  if (isChecklistLine(line)) return true
  const next = lines[index + 1] || ""
  return line.includes("|") && isTableDivider(next)
}

const parseMarkdownBlocks = (markdown: string): MarkdownBlock[] => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const blocks: MarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    if (!lines[index]?.trim()) {
      index += 1
      continue
    }

    const line = lines[index] || ""

    if (line.startsWith("```")) {
      const language = line.slice(3).trim().toLocaleLowerCase()
      const codeLines: string[] = []
      index += 1
      while (index < lines.length && !lines[index]?.startsWith("```")) {
        codeLines.push(lines[index] || "")
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push({
        kind: language === "mermaid" ? "mermaid" : "markdown",
        value:
          language === "mermaid"
            ? codeLines.join("\n")
            : [line, ...codeLines, "```"].join("\n"),
      })
      continue
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = []
      while (index < lines.length && (lines[index] || "").startsWith("> ")) {
        quoteLines.push((lines[index] || "").replace(/^>\s?/, ""))
        index += 1
      }
      blocks.push({ kind: "quote", value: quoteLines.join("\n") })
      continue
    }

    if (isChecklistLine(line)) {
      const items: Array<{ checked: boolean; text: string }> = []
      while (index < lines.length && isChecklistLine(lines[index] || "")) {
        const current = lines[index] || ""
        const match = current.match(/^\s*- \[([ xX])\]\s+(.+)$/)
        if (match) {
          items.push({
            checked: match[1]?.toLocaleLowerCase() === "x",
            text: match[2] || "",
          })
        }
        index += 1
      }
      blocks.push({ kind: "checklist", items })
      continue
    }

    const next = lines[index + 1] || ""
    if (line.includes("|") && isTableDivider(next)) {
      const headers = tableCells(line)
      index += 2
      const rows: string[][] = []
      while (index < lines.length) {
        const row = lines[index] || ""
        if (!row.trim() || !row.includes("|")) break
        rows.push(tableCells(row))
        index += 1
      }
      blocks.push({ kind: "table", headers, rows })
      continue
    }

    const markdownLines: string[] = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index]?.trim() &&
      !startsSpecialBlock(lines, index)
    ) {
      markdownLines.push(lines[index] || "")
      index += 1
    }
    blocks.push({ kind: "markdown", value: markdownLines.join("\n") })
  }

  return blocks
}

const InlineMarkdown: React.FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown
    components={{
      p: ({ children: paragraphChildren }) => <>{paragraphChildren}</>,
      a: ({ children: linkChildren, node: _node, ...props }) => (
        <a {...props} target="_blank" rel="noreferrer" className="vt-resource-inline-link">
          {linkChildren}
        </a>
      ),
    }}
  >
    {children}
  </ReactMarkdown>
)

const MarkdownContent: React.FC<{ value: string }> = ({ value }) => (
  <ReactMarkdown
    components={{
      h3: ({ children }) => <h3 className="vt-resource-h3">{children}</h3>,
      h4: ({ children }) => <h4 className="vt-resource-h4">{children}</h4>,
      p: ({ children }) => <p className="vt-resource-paragraph">{children}</p>,
      ul: ({ children }) => <ul className="vt-resource-list">{children}</ul>,
      ol: ({ children }) => <ol className="vt-resource-list vt-resource-list--ordered">{children}</ol>,
      li: ({ children }) => <li>{children}</li>,
      strong: ({ children }) => <strong className="vt-resource-strong">{children}</strong>,
      a: ({ children, node: _node, ...props }) => (
        <a {...props} target="_blank" rel="noreferrer" className="vt-resource-inline-link">
          {children}
        </a>
      ),
      code: ({ children }) => <code className="vt-resource-inline-code">{children}</code>,
      hr: () => <hr className="vt-resource-rule" />,
    }}
  >
    {value}
  </ReactMarkdown>
)

const ResourceTable: React.FC<Extract<MarkdownBlock, { kind: "table" }>> = ({
  headers,
  rows,
}) => (
  <div className="vt-resource-table-wrap" role="region" aria-label="Reference table">
    <table className="vt-resource-table">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={`header-${index}`}>
              <InlineMarkdown>{header}</InlineMarkdown>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {headers.map((_, columnIndex) => (
              <td key={`cell-${rowIndex}-${columnIndex}`}>
                <InlineMarkdown>{row[columnIndex] || ""}</InlineMarkdown>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const ResourceChecklist: React.FC<Extract<MarkdownBlock, { kind: "checklist" }>> = ({
  items,
}) => (
  <div className="vt-resource-checklist" role="list">
    {items.map((item, index) => (
      <div className="vt-resource-checklist-row" role="listitem" key={`check-${index}`}>
        <span
          className={`vt-resource-checkmark ${item.checked ? "is-checked" : ""}`}
          aria-hidden="true"
        >
          {item.checked ? "✓" : ""}
        </span>
        <span><InlineMarkdown>{item.text}</InlineMarkdown></span>
      </div>
    ))}
  </div>
)

const flowLabels = (code: string): string[] => {
  const labels = new Map<string, string>()
  const order: string[] = []
  const add = (id: string, label?: string) => {
    if (!labels.has(id)) order.push(id)
    labels.set(id, label || labels.get(id) || id)
  }

  for (const line of code.split("\n")) {
    const match = line.match(
      /^\s*([A-Za-z0-9_]+)(?:\[([^\]]+)\])?\s*-->\s*([A-Za-z0-9_]+)(?:\[([^\]]+)\])?/,
    )
    if (!match) continue
    add(match[1] || "", match[2])
    add(match[3] || "", match[4])
  }

  return order.map((id) => labels.get(id) || id)
}

const ResourceFlow: React.FC<{ value: string }> = ({ value }) => {
  const labels = flowLabels(value)
  if (labels.length < 2) {
    return (
      <pre className="vt-resource-diagram-code" aria-label="Mermaid diagram source">
        {value}
      </pre>
    )
  }

  return (
    <div className="vt-resource-flow" aria-label="Process diagram">
      {labels.map((label, index) => (
        <React.Fragment key={`${label}-${index}`}>
          <div className="vt-resource-flow-node">{label}</div>
          {index < labels.length - 1 ? <div className="vt-resource-flow-arrow">→</div> : null}
        </React.Fragment>
      ))}
    </div>
  )
}

const quoteTone = (value: string): string => {
  const normalized = value.toLocaleLowerCase()
  if (normalized.includes("unknown")) return "unknown"
  if (normalized.includes("important limitation") || normalized.includes("do not conclude")) return "warning"
  if (normalized.includes("officially documented") || normalized.includes("strong evidence")) return "evidence"
  if (normalized.includes("creator observation")) return "observation"
  return "note"
}

const ResourceQuote: React.FC<{ value: string }> = ({ value }) => (
  <blockquote className={`vt-resource-quote is-${quoteTone(value)}`}>
    <InlineMarkdown>{value}</InlineMarkdown>
  </blockquote>
)

const SectionBlocks: React.FC<{ body: string }> = ({ body }) => {
  const blocks = React.useMemo(() => parseMarkdownBlocks(body), [body])

  return (
    <div className="vt-resource-section-blocks">
      {blocks.map((block, index) => {
        if (block.kind === "table") return <ResourceTable key={index} {...block} />
        if (block.kind === "checklist") return <ResourceChecklist key={index} {...block} />
        if (block.kind === "mermaid") return <ResourceFlow key={index} value={block.value} />
        if (block.kind === "quote") return <ResourceQuote key={index} value={block.value} />
        return <MarkdownContent key={index} value={block.value} />
      })}
    </div>
  )
}

const sectionIcon = (section: ParsedResourceSection): React.ReactNode => {
  const title = section.title.toLocaleLowerCase()
  if (title.includes("quick") || title.includes("summary")) return <Compass />
  if (title.includes("architecture") || title.includes("stage")) return <Workflow />
  if (title.includes("signal") || title.includes("metric")) return <Activity />
  if (title.includes("surface")) return <Route />
  if (title.includes("evidence")) return <ShieldCheck />
  if (title.includes("myth")) return <BrainCircuit />
  if (title.includes("decision")) return <GitBranch />
  if (title.includes("checklist") || title.includes("action")) return <ListChecks />
  if (title.includes("reference") || title.includes("glossary")) return <BookOpenCheck />
  if (title.includes("source")) return <Search />
  if (title.includes("table") || title.includes("matrix")) return <TableProperties />
  if (title.includes("example")) return <Lightbulb />
  return <Target />
}

export interface ResourceDocumentRendererProps {
  resource: ResourceLibraryEntry
}

export const ResourceDocumentRenderer: React.FC<ResourceDocumentRendererProps> = ({
  resource,
}) => {
  const parsed = React.useMemo(
    () => parseResourceDocument(resource.markdown),
    [resource.markdown],
  )

  return (
    <article className="vt-resource-document" data-resource-id={resource.id}>
      <header className="vt-resource-document-hero">
        <div className="vt-resource-document-kicker">
          {resource.category} · {resource.format.toUpperCase()} · {resource.status.toUpperCase()}
        </div>
        <h1>{parsed.title}</h1>
        <p>{resource.description}</p>
        <div className="vt-resource-document-meta-grid">
          <div><span>READ</span><strong>{resource.readTime}</strong></div>
          <div><span>LEVEL</span><strong>{resource.difficulty}</strong></div>
          <div><span>UPDATED</span><strong>{resource.updatedAt}</strong></div>
          <div><span>SECTIONS</span><strong>{parsed.sections.length}</strong></div>
        </div>
        <div className="vt-resource-tag-row">
          {resource.tags.slice(0, 8).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </header>

      {parsed.intro ? (
        <div className="vt-resource-intro">
          <MarkdownContent value={parsed.intro} />
        </div>
      ) : null}

      <div className="vt-resource-section-stack">
        {parsed.sections.map((section, index) => (
          <SubToolbox
            key={section.id}
            title={section.title}
            icon={sectionIcon(section)}
            isOpenInitial
            unmountOnClose={false}
            contentClassName="vt-resource-subtoolbox-content"
            persistenceId={`resource:${resource.id}:${section.id}`}
            helpText={`Section ${index + 1} of ${parsed.sections.length} · ${resource.shortTitle}`}
          >
            <SectionBlocks body={section.body} />
          </SubToolbox>
        ))}
      </div>
    </article>
  )
}

export default ResourceDocumentRenderer
