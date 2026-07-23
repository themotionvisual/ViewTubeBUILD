import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")
const sourceDir = path.join(repoRoot, "docs/VT Brain/super-tool-agent-plans/phase-1")
const outputDir = path.join(repoRoot, "docs/html_hub/super-tools")
const agentsDir = path.join(outputDir, "agents")

const escapeHtml = (value) =>
 String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")

const slugFromFile = (file) => path.basename(file, ".md")

const titleFromMarkdown = (markdown, fallback) => {
 const titleLine = markdown.split("\n").find((line) => line.startsWith("# "))
 return titleLine ? titleLine.replace(/^#\s+/, "").trim() : fallback
}

const renderInline = (value) =>
 escapeHtml(value)
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/`([^`]+)`/g, "<code>$1</code>")

const renderMarkdown = (markdown) => {
 const lines = markdown.split("\n")
 const html = []
 let inCode = false
 let codeLines = []

 const flushCode = () => {
  if (!codeLines.length) return
  html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`)
  codeLines = []
 }

 lines.forEach((line) => {
  if (line.startsWith("```")) {
   if (inCode) {
    inCode = false
    flushCode()
   } else {
    inCode = true
   }
   return
  }
  if (inCode) {
   codeLines.push(line)
   return
  }
  if (!line.trim()) {
   html.push("")
   return
  }
  const heading = /^(#{1,4})\s+(.+)$/.exec(line)
  if (heading) {
   const level = Math.min(heading[1].length, 4)
   html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
   return
  }
  if (/^\s*[-*]\s+/.test(line)) {
   html.push(`<p class="bullet">${renderInline(line.replace(/^\s*[-*]\s+/, ""))}</p>`)
   return
  }
  html.push(`<p>${renderInline(line)}</p>`)
 })

 flushCode()
 return html.join("\n")
}

const shell = ({ title, subtitle, cards, nav = "", sourceNote = "" }) => `<!doctype html>
<html lang="en">
<head>
 <meta charset="utf-8" />
 <meta name="viewport" content="width=device-width, initial-scale=1" />
 <title>${escapeHtml(title)}</title>
 <style>
  :root {
   --vt-black: #050505;
   --vt-paper: #f8f7f1;
   --vt-white: #ffffff;
   --vt-green: #ccff00;
   --vt-cyan: #00f0ff;
   --vt-magenta: #ff4fd8;
   --vt-yellow: #ffea5a;
  }
  * { box-sizing: border-box; }
  body {
   margin: 0;
   background: var(--vt-paper);
   color: var(--vt-black);
   font-family: Arial Black, Arial, Helvetica, sans-serif;
  }
  .page { display: grid; grid-template-columns: minmax(220px, 280px) 1fr; min-height: 100vh; }
  aside {
   position: sticky;
   top: 0;
   height: 100vh;
   overflow: auto;
   border-right: 5px solid var(--vt-black);
   background: var(--vt-black);
   color: var(--vt-white);
   padding: 18px;
  }
  main { padding: 28px; max-width: 1500px; }
  .hero {
   border: 5px solid var(--vt-black);
   background: var(--vt-white);
   box-shadow: 12px 12px 0 var(--vt-black);
   padding: 28px;
   margin-bottom: 28px;
  }
  .eyebrow { color: var(--vt-magenta); font-size: 11px; letter-spacing: .25em; text-transform: uppercase; }
  h1 { font-size: clamp(36px, 7vw, 86px); line-height: .88; margin: 10px 0; text-transform: uppercase; letter-spacing: 0; }
  h2 { border-bottom: 4px solid var(--vt-black); margin-top: 26px; padding-bottom: 8px; text-transform: uppercase; }
  h3 { margin-top: 18px; text-transform: uppercase; }
  p { font-family: Arial, Helvetica, sans-serif; font-weight: 800; line-height: 1.55; }
  a { color: inherit; }
  .nav-link {
   display: block;
   border: 3px solid var(--vt-white);
   color: var(--vt-white);
   text-decoration: none;
   padding: 10px;
   margin-bottom: 8px;
   font-size: 11px;
   text-transform: uppercase;
  }
  .nav-link:hover { background: var(--vt-green); color: var(--vt-black); }
  .card {
   border: 5px solid var(--vt-black);
   background: var(--vt-white);
   box-shadow: 8px 8px 0 var(--vt-black);
   margin-bottom: 30px;
  }
  .card-header {
   border-bottom: 5px solid var(--vt-black);
   background: var(--vt-green);
   padding: 18px;
  }
  .card:nth-child(4n) .card-header { background: var(--vt-cyan); }
  .card:nth-child(4n+1) .card-header { background: var(--vt-yellow); }
  .card:nth-child(4n+2) .card-header { background: var(--vt-magenta); color: var(--vt-white); }
  .card-body { padding: 22px; }
  .bullet {
   border: 3px solid var(--vt-black);
   background: var(--vt-paper);
   padding: 10px 12px;
   margin: 8px 0;
  }
  code {
   border: 2px solid var(--vt-black);
   background: var(--vt-yellow);
   padding: 1px 5px;
   font-family: Menlo, Monaco, Consolas, monospace;
  }
  pre {
   overflow: auto;
   border: 4px solid var(--vt-black);
   background: #111;
   color: var(--vt-green);
   padding: 16px;
   font-family: Menlo, Monaco, Consolas, monospace;
   font-weight: 700;
  }
  .source-note {
   border: 4px solid var(--vt-black);
   background: var(--vt-cyan);
   padding: 12px;
   font-size: 11px;
   text-transform: uppercase;
   letter-spacing: .08em;
  }
  @media (max-width: 900px) {
   .page { display: block; }
   aside { position: static; height: auto; border-right: 0; border-bottom: 5px solid var(--vt-black); }
   main { padding: 18px; }
  }
 </style>
</head>
<body>
 <div class="page">
  <aside>
   <div class="eyebrow">ViewTube</div>
   <h2>Agent Pack</h2>
   ${nav}
  </aside>
  <main>
   <section class="hero">
    <div class="eyebrow">Internal Super-Tool HTML Artifact</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(subtitle)}</p>
    ${sourceNote ? `<div class="source-note">${escapeHtml(sourceNote)}</div>` : ""}
   </section>
   ${cards}
  </main>
 </div>
</body>
</html>
`

const files = fs
 .readdirSync(sourceDir)
 .filter((file) => /^agent-\d{2}-.+\.md$/.test(file))
 .sort()
 .map((file) => {
  const fullPath = path.join(sourceDir, file)
  const markdown = fs.readFileSync(fullPath, "utf8")
  return {
   file,
   fullPath,
   slug: slugFromFile(file),
   title: titleFromMarkdown(markdown, file),
   markdown,
   html: renderMarkdown(markdown),
  }
 })

fs.mkdirSync(agentsDir, { recursive: true })

const nav = files
 .map((agent) => `<a class="nav-link" href="#${agent.slug}">${escapeHtml(agent.title)}</a>`)
 .join("\n")

const packCards = files
 .map(
  (agent) => `<article class="card" id="${agent.slug}">
 <div class="card-header">
  <div class="eyebrow">${escapeHtml(agent.file)}</div>
  <h2>${escapeHtml(agent.title)}</h2>
 </div>
 <div class="card-body">
  ${agent.html}
 </div>
</article>`,
 )
 .join("\n")

fs.writeFileSync(
 path.join(outputDir, "viewtube-super-tools-phase-1-pack.html"),
 shell({
  title: "ViewTube Super-Tools Phase 1 Pack",
  subtitle: "One consolidated standalone HTML artifact sourced from all 15 canonical phase-1 agent markdown plans.",
  nav,
  cards: packCards,
  sourceNote: `Generated from ${path.relative(repoRoot, sourceDir)} on ${new Date().toISOString()}`,
 }),
)

files.forEach((agent) => {
 fs.writeFileSync(
  path.join(agentsDir, `${agent.slug}.html`),
  shell({
   title: agent.title,
   subtitle: `Standalone artifact for ${agent.file}, sourced from the canonical phase-1 markdown plan.`,
   nav: `<a class="nav-link" href="../viewtube-super-tools-phase-1-pack.html">Back to full pack</a>`,
   cards: `<article class="card" id="${agent.slug}">
 <div class="card-header">
  <div class="eyebrow">${escapeHtml(agent.file)}</div>
  <h2>${escapeHtml(agent.title)}</h2>
 </div>
 <div class="card-body">${agent.html}</div>
</article>`,
   sourceNote: `Generated from ${path.relative(repoRoot, agent.fullPath)} on ${new Date().toISOString()}`,
  }),
 )
})

console.log(`Generated ${files.length + 1} super-tool HTML artifacts in ${path.relative(repoRoot, outputDir)}`)
