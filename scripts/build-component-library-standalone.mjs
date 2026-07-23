import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { viteSingleFile } from "vite-plugin-singlefile"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const entryHtml = path.join(root, "src/standalone/component-library/index.html")
const outDir = path.join(root, "node_modules/.tmp/viewtube-component-library-build")
const outputDir = path.join(root, "public/html_hub/standalone")
const outputFile = path.join(outputDir, "viewtube-component-library.html")

await fs.rm(outDir, { recursive: true, force: true })
await fs.mkdir(outputDir, { recursive: true })

await build({
  root,
  configFile: false,
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.join(root, "src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    sourcemap: false,
    minify: false,
    rollupOptions: {
      input: entryHtml,
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})

const candidateHtmlFiles = [
  path.join(outDir, "index.html"),
  path.join(outDir, "src/standalone/component-library/index.html"),
]
let builtHtml = ""
for (const candidate of candidateHtmlFiles) {
  try {
    await fs.access(candidate)
    builtHtml = candidate
    break
  } catch {}
}
if (!builtHtml) {
  throw new Error(`Vite build did not emit a component-library HTML file in ${outDir}`)
}
let html = await fs.readFile(builtHtml, "utf8")

html = html.replace(
  /<html lang="en" data-ha-style="dashboard">/,
  '<html lang="en" data-ha-style="dashboard" data-viewtube-artifact="component-library">',
)
html = html.replace(
  "</head>",
  '<meta name="viewtube-artifact" content="standalone-component-library"></head>',
)

await fs.writeFile(outputFile, html)
await fs.rm(outDir, { recursive: true, force: true })

const stat = await fs.stat(outputFile)
console.log(
  JSON.stringify(
    {
      output: outputFile,
      bytes: stat.size,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
)
