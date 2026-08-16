import fs from "node:fs/promises";
import ts from "typescript";

const targets = [
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-assets-html-archive-docs-html-codebasededitingtools_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-docsx-gemini-canvas-masterpieces-html-8a8acv1_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-docsx-gemini-canvas-masterpieces-html-25b40vxjsx_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-8a8acv1jsx_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-docsx-gemini-canvas-masterpieces-html-6882bjsxv1_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-docsx-gemini-canvas-masterpieces-html-9v5b8jsx_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-docsx-gemini-canvas-masterpieces-html-6882bv4jsx_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-docsx-gemini-canvas-masterpieces-html-45053v1html_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-docsx-gemini-canvas-masterpieces-html-6882bjsxv2_V1.html",
  "/Users/cwb/Downloads/viewtube/docs/html_hub/misc/viewtube-html-8a8acv1_V1.html",
];

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function makeCodeViewer(source, filePath) {
  const title = filePath.split("/").pop() ?? "code-viewer.html";
  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? source;
  const text = decodeEntities(
    body
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "")
      .trim(),
  );

  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f1115;
      --panel: #171a21;
      --border: #3b4252;
      --text: #e5e9f0;
      --muted: #9aa3b2;
      --accent: #5eead4;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: radial-gradient(circle at top, #1b2130, var(--bg) 52%);
      color: var(--text);
      padding: 24px;
    }
    .shell {
      max-width: 1200px;
      margin: 0 auto;
      border: 1px solid var(--border);
      background: rgba(23, 26, 33, 0.94);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 18px;
      border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.02);
    }
    h1 {
      margin: 0;
      font-size: 14px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    p {
      margin: 0;
      font-size: 12px;
      color: var(--muted);
    }
    button {
      border: 1px solid var(--accent);
      background: transparent;
      color: var(--accent);
      padding: 8px 12px;
      font: inherit;
      cursor: pointer;
    }
    pre {
      margin: 0;
      padding: 20px;
      overflow: auto;
      line-height: 1.45;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div>
        <h1>${title}</h1>
        <p>Standalone local code viewer. This file was a rich-text code export, not runnable application HTML.</p>
      </div>
      <button id="copyBtn" type="button">Copy Source</button>
    </header>
    <pre id="source">${escaped}</pre>
  </div>
  <script>
    const sourceEl = document.getElementById('source');
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sourceEl.textContent || '');
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy Source'; }, 1200);
      } catch (error) {
        copyBtn.textContent = 'Copy Failed';
      }
    });
  </script>
</body>
</html>`;
}

function parseImportedIconNames(fragment) {
  return fragment
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const aliasMatch = part.match(/^([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
      if (aliasMatch) return aliasMatch[2];
      return part.replace(/[^A-Za-z0-9_]/g, "");
    })
    .filter(Boolean);
}

function removeBrokenLucideImport(source) {
  const fromMarker = "} from 'lucide-react';";
  const markerIndex = source.indexOf(fromMarker);
  if (markerIndex === -1) {
    return { source, iconNames: [] };
  }

  const lineStart = source.lastIndexOf("\n", markerIndex) + 1;
  const linesBefore = source.slice(0, lineStart).split("\n");
  const removedLines = [];
  let cursor = linesBefore.length - 1;

  while (cursor >= 0) {
    const raw = linesBefore[cursor];
    const trimmed = raw.trim();
    if (!trimmed) {
      removedLines.unshift(raw);
      cursor -= 1;
      continue;
    }
    if (/^[A-Za-z0-9_]+(?:\s+as\s+[A-Za-z0-9_]+)?(?:\s*,\s*[A-Za-z0-9_]+(?:\s+as\s+[A-Za-z0-9_]+)?)*,?$/.test(trimmed)) {
      removedLines.unshift(raw);
      cursor -= 1;
      continue;
    }
    break;
  }

  const importLineEnd = markerIndex + fromMarker.length;
  const prefix = linesBefore.slice(0, cursor + 1).join("\n");
  const suffix = source.slice(importLineEnd);
  const iconNames = parseImportedIconNames(
    removedLines
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" "),
  );

  const existingNames = new Set([...source.matchAll(/\b([A-Za-z0-9_]+)=iconStub\b/g)].map((match) => match[1]));
  const missingNames = [...new Set(iconNames)].filter((name) => !existingNames.has(name));

  return {
    source: prefix + suffix,
    iconNames: missingNames,
  };
}

function stripMergeMarkers(source) {
  return source.replace(/^[<=>]{7}.*$/gm, "");
}

function extractScriptContent(source) {
  const match =
    source.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/i) ??
    source.match(/<script>([\s\S]*?)<\/script>/i);
  return match ? match[1] : "";
}

function collectDeclaredNames(script) {
  return new Set(
    [...script.matchAll(/(?:function|const|class)\s+([A-Z][A-Za-z0-9_]*)\b/g)].map((match) => match[1]),
  );
}

function collectExistingStubNames(script) {
  return new Set(
    [...script.matchAll(/\b([A-Z][A-Za-z0-9_]*)=iconStub\b/g)].map((match) => match[1]),
  );
}

function collectJsxTagNames(script) {
  return new Set([...script.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)].map((match) => match[1]));
}

function buildLeanIconStubBlock(script, importedNames, existingStubNames) {
  const declared = collectDeclaredNames(script);
  const jsxTags = collectJsxTagNames(script);
  const banned = new Set([
    "Fragment",
    "Suspense",
    "StrictMode",
    "HTMLDivElement",
    "HTMLElement",
    "SVGElement",
    "MouseEvent",
    "KeyboardEvent",
    "EventTarget",
    "Node",
    "Date",
    "Set",
    "Promise",
  ]);

  const iconNames = [...new Set([...jsxTags, ...importedNames, ...existingStubNames])]
    .filter((name) => !declared.has(name))
    .filter((name) => !banned.has(name))
    .filter((name) => !name.endsWith("Props"))
    .sort();

  if (!iconNames.length) return "";

  return `const iconStub = (props) => React.createElement('span', {
  style: { display: 'inline-flex', width: props?.size || 24, height: props?.size || 24, alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, opacity: 0.3 },
  className: props?.className || ''
}, '⬡');
const ${iconNames.map((name) => `${name}=iconStub`).join(",")};
`;
}

function transpileStandaloneScript(script) {
  return ts.transpileModule(script, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      removeComments: false,
    },
    reportDiagnostics: false,
  }).outputText;
}

function normalizeBrowserScript(script) {
  let next = script
    .replace(/^\s*Object\.defineProperty\(exports,.*\);\s*$/gm, "")
    .replace(/^\s*exports\.[^\n]*\n?/gm, "")
    .replace(/\bexports\.([A-Za-z0-9_]+)/g, "$1");

  const stubLineMatches = [...next.matchAll(/^\s*const ([A-Z][A-Za-z0-9_,=\s]*)=iconStub;\s*$/gm)];
  if (stubLineMatches.length) {
    const names = [];
    for (const match of stubLineMatches) {
      for (const inner of match[1].split(",")) {
        const name = inner.split("=")[0]?.trim();
        if (name) names.push(name);
      }
    }
    const deduped = [...new Set(names)];
    next = next.replace(/^\s*const [A-Z][A-Za-z0-9_,=\s]*=iconStub;\s*$/gm, "");
    next = next.replace(
      /(const iconStub = \(props\) => React\.createElement\('span',[\s\S]*?\}, '⬡'\);\s*)/,
      `$1const ${deduped.map((name) => `${name}=iconStub`).join(",")};\n`,
    );
  }

  return next;
}

function fixBabelHtml(source) {
  let next = stripMergeMarkers(source);
  next = next.replace(/<script src="https:\/\/unpkg\.com\/@babel\/standalone\/babel\.min\.js"><\/script>\s*/i, "");

  let script = extractScriptContent(next);
  script = stripMergeMarkers(script).replace(/^\s*export\s+/gm, "");

  const existingStubNames = collectExistingStubNames(script);
  const { source: cleanedScript, iconNames } = removeBrokenLucideImport(script);
  const scriptWithoutStubLine = cleanedScript
    .replace(/\s*const iconStub = \(props\) => React\.createElement\('span',[\s\S]*?\}, '⬡'\);\s*/m, "")
    .replace(/^\s*const [A-Z][A-Za-z0-9_,=\s]*=iconStub;\s*$/gm, "");
  const iconBlock = buildLeanIconStubBlock(scriptWithoutStubLine, iconNames, existingStubNames);
  const transpiled = normalizeBrowserScript(transpileStandaloneScript(`${iconBlock}\n${scriptWithoutStubLine}`));

  next = next.replace(
    /<script(?: type="text\/babel"[^>]*)?>[\s\S]*?<\/script>/i,
    `<script>\n${transpiled}\n</script>`,
  );

  next = next.replace(
    "</body>",
    `  <script>
    window.addEventListener('error', (event) => {
      const root = document.getElementById('root');
      if (!root) return;
      const details = event?.error?.stack || event?.message || 'Unknown runtime error';
      root.innerHTML = '<div style="font-family: ui-monospace, Menlo, monospace; margin: 24px; padding: 16px; border: 2px solid #b91c1c; background: #fff1f2; color: #7f1d1d;"><strong>Standalone render error</strong><pre style="white-space: pre-wrap; margin-top: 12px;">' + String(details).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char])) + '</pre></div>';
    });
  </script>
</body>`,
  );

  return next;
}

async function main() {
  const results = [];
  for (const filePath of targets) {
    const source = await fs.readFile(filePath, "utf8");
    const fixed = filePath.includes("codebasededitingtools")
      ? makeCodeViewer(source, filePath)
      : fixBabelHtml(source);

    if (fixed !== source) {
      await fs.writeFile(filePath, fixed, "utf8");
    }
    results.push({
      filePath,
      changed: fixed !== source,
      mode: filePath.includes("codebasededitingtools") ? "viewer" : "standalone",
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
