import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const viewtubeRoot = "/Users/cwb/Downloads/viewtube";
const repoRoot = "/Users/cwb/Downloads/viewtube/viewtubeX";
const parentDocsRoot = path.join(viewtubeRoot, "docs");
const repoDocsRoot = path.join(repoRoot, "docs");
const parentHtmlHubRoot = path.join(parentDocsRoot, "html_hub");
const reorgLogsRoot = path.join(parentDocsRoot, "documents_resources", "reorg_logs");
const quarantineRoot = path.join(parentDocsRoot, "quarantine", "html_exact_duplicates");

const canonicalLanes = [
  "editors",
  "dashboards",
  "charts",
  "maps",
  "ui-ux",
  "api-samples",
  "data-tables",
  "storyboards",
  "misc",
];

const runtimeProtectedReasons = new Map();

function addProtected(filePath, reason) {
  runtimeProtectedReasons.set(filePath, reason);
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeLabel(filePath) {
  if (filePath.startsWith(viewtubeRoot)) {
    return path.relative(viewtubeRoot, filePath);
  }

  return filePath;
}

function csvEscape(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function listHtmlFiles(rootPath) {
  const results = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const nextPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(nextPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!/\.(html?|HTML?)$/.test(entry.name)) continue;
      results.push(nextPath);
    }
  }

  if (await pathExists(rootPath)) {
    await walk(rootPath);
  }

  return results.sort((a, b) => a.localeCompare(b));
}

async function hashFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function baseWithoutExtension(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function classifyLane(filePath) {
  const full = toPosix(filePath).toLowerCase();
  const base = baseWithoutExtension(filePath).toLowerCase();

  if (
    /video editor|\/editors\/|vt_e1|codex_editor|timeline|softflow|edtr|shorts editior|video-editor/.test(
      full,
    ) ||
    /vt_e1|codex_editor|video[-_ ]?editor|timeline|softflow|edtr/.test(base)
  ) {
    return "editors";
  }

  if (/\/map\/|map-statistics|geo-variable|^map\d+/.test(full) || /map-statistics|geo-variable|^map\d+/.test(base)) {
    return "maps";
  }

  if (/api-samples|quickstart|upload_video|playlist_updates|my_uploads|player_control|event_listeners/.test(full)) {
    return "api-samples";
  }

  if (/data[-_ ]?table|tables|mastermatrix|matrix/.test(base) || /data[-_ ]?table|tables|mastermatrix|matrix/.test(full)) {
    return "data-tables";
  }

  if (/storyboard|soft_flow|softflow|flow/.test(base) || /storyboard|soft_flow|softflow/.test(full)) {
    return "storyboards";
  }

  if (
    /component|ui|ux|icon|color[_ -]?picker|brutalist|library|kit|lab/.test(base) ||
    /ui\+tools|component|icon|color[_ -]?picker|brutalist|library|kit|ui-labs/.test(full)
  ) {
    return "ui-ux";
  }

  if (/dashboard|widget|toolbox|portal/.test(base) || /dashboard|widget|toolbox|portal/.test(full)) {
    return "dashboards";
  }

  if (/graph|chart|statistics|viz|visualiz|report|retention|analytics/.test(base) || /graph|chart|statistics|viz|visualiz|report|retention|analytics/.test(full)) {
    return "charts";
  }

  return "misc";
}

function descriptiveSlug(filePath, lane) {
  const full = toPosix(filePath).toLowerCase();
  const base = baseWithoutExtension(filePath).toLowerCase();

  const specificPatterns = [
    [/map-statistics-geo-variable-lab/, "viewtube-map-statistics-geo-lab"],
    [/map-statistics-variable-lab/, "viewtube-map-statistics-lab"],
    [/graphs?_and_charts?_report|graphs?\+charts?/, "viewtube-graphs-and-charts-report"],
    [/neo[_ -]?brutalist[_ -]?color[_ -]?picker/, "neo-brutalist-color-picker"],
    [/viewtube_neo_brutalist_component_library_expanded/, "viewtube-neo-brutalist-component-library-expanded"],
    [/viewtube_neo_brutalist_component_library_compact/, "viewtube-neo-brutalist-component-library-compact"],
    [/viewtube_neo_brutalist_component_library/, "viewtube-neo-brutalist-component-library"],
    [/viewtube_components?_lab|viewtube_component_lab/, "viewtube-component-lab"],
    [/viewtube_mobile_interface/, "viewtube-mobile-interface"],
    [/viewtube_10_data_table_toolbox_options|10-data-tables/, "viewtube-data-table-toolbox"],
    [/mastermatrix/, "viewtube-master-matrix"],
    [/creatortoolsstoryboard/, "viewtube-creator-tools-storyboard"],
    [/ustube-ui-kit/, "ustube-ui-kit"],
    [/ustube_icon_set|icons$/, "viewtube-icon-set"],
    [/widget-preview/, "viewtube-widget-preview"],
    [/dashboard-v\d+/, "viewtube-dashboard-shell"],
    [/toolbox_component_set_1/, "viewtube-toolbox-component-set"],
    [/colormixer/, "viewtube-color-mixer"],
    [/videofx/, "viewtube-video-fx"],
    [/video[-_ ]?manager/, "viewtube-video-manager-toolbox"],
    [/music player/, "viewtube-music-player-component"],
    [/ask-me/, "viewtube-ask-me-widget"],
    [/codex_editor_x_v1|codex_editor_x/, "codex-editor-x"],
    [/vt_e1_clay/, "vt-e1-clay-editor-variant"],
    [/vt_e1_generic/, "vt-e1-generic-editor-variant"],
    [/vt_e1/, "vt-e1-editor-variant"],
    [/timeline/, "viewtube-timeline-editor-variant"],
    [/doctype/, "viewtube-doctype-demo"],
  ];

  for (const [pattern, slug] of specificPatterns) {
    if (pattern.test(base) || pattern.test(full)) return slug;
  }

  if (full.includes("/map/") || lane === "maps") {
    if (/^map\d+/.test(base)) return "viewtube-map-experiment";
    if (base.includes("map")) return "viewtube-map-prototype";
  }

  const cleaned = base
    .replace(/\(\d+\)/g, " ")
    .replace(/\bcopy\b/gi, " ")
    .replace(/\bpre[-_ ]?rebuild[-_ ]?backup[-_ ]?\d+\b/gi, " ")
    .replace(/\bv\d+\b/gi, " ")
    .replace(/[._]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 8);
  const genericPrefix =
    lane === "charts"
      ? "viewtube-chart"
      : lane === "maps"
        ? "viewtube-map"
        : lane === "editors"
          ? "viewtube-editor"
          : lane === "dashboards"
            ? "viewtube-dashboard"
            : lane === "ui-ux"
              ? "viewtube-ui"
              : lane === "data-tables"
                ? "viewtube-data-table"
                : lane === "storyboards"
                  ? "viewtube-storyboard"
                  : lane === "api-samples"
                    ? "viewtube-api-sample"
                    : "viewtube-html";

  if (!words.length) return genericPrefix;

  const joined = words.join("-");
  if (joined.startsWith("viewtube-")) return joined;
  if (joined.startsWith("vt-")) return joined;
  return `${genericPrefix}-${joined}`.replace(/-+/g, "-");
}

function normalizeSlug(slug) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function destinationFor(lane, slug, versionLabel) {
  return path.join(parentHtmlHubRoot, lane, `${slug}_${versionLabel}.html`);
}

function quarantineDestination(item, slug, versionLabel, duplicateIndex) {
  const sourceRootLabel = item.path.startsWith(repoDocsRoot) ? "viewtubeX-docs" : "viewtube-docs";
  const originalBase = normalizeSlug(baseWithoutExtension(item.path)) || "html-file";
  return path.join(
    quarantineRoot,
    item.lane,
    `${slug}_${versionLabel}__${sourceRootLabel}__dup${duplicateIndex}__${originalBase}.html`,
  );
}

function fileSort(a, b) {
  if (a.mtimeMs !== b.mtimeMs) return a.mtimeMs - b.mtimeMs;
  return a.path.localeCompare(b.path);
}

async function collectProtectedRuntimeHtml() {
  const publicRoot = path.join(repoRoot, "public");
  const protectedPublicHtml = await listHtmlFiles(publicRoot);
  for (const filePath of protectedPublicHtml) {
    addProtected(filePath, "public runtime html");
  }

  const explicitProtected = [
    path.join(repoDocsRoot, "Video Editor", "editors", "VT_E1.source.html"),
    path.join(repoDocsRoot, "Video Editor", "editors", "VT_E1.html"),
  ];

  for (const filePath of explicitProtected) {
    if (await pathExists(filePath)) {
      addProtected(filePath, "npm/build referenced editor html");
    }
  }
}

async function collectHtmlInventory() {
  const htmlFiles = [
    ...(await listHtmlFiles(parentDocsRoot)),
    ...(await listHtmlFiles(repoDocsRoot)),
  ];

  const uniqueFiles = [...new Set(htmlFiles)];
  const inventory = [];

  for (const filePath of uniqueFiles) {
    const stat = await fs.stat(filePath);
    const hash = await hashFile(filePath);
    const protectedReason = runtimeProtectedReasons.get(filePath) ?? "";
    inventory.push({
      path: filePath,
      relativePath: relativeLabel(filePath),
      hash,
      mtimeMs: stat.mtimeMs,
      protected: protectedReason.length > 0,
      protectedReason,
      lane: classifyLane(filePath),
      familySlug: normalizeSlug(descriptiveSlug(filePath, classifyLane(filePath))),
    });
  }

  return inventory.sort(fileSort);
}

function buildPlans(inventory) {
  const protectedItems = inventory.filter((item) => item.protected);
  const inScope = inventory.filter((item) => !item.protected);
  const familyGroups = new Map();

  for (const item of inScope) {
    const key = `${item.lane}::${item.familySlug}`;
    if (!familyGroups.has(key)) familyGroups.set(key, []);
    familyGroups.get(key).push(item);
  }

  const canonicalMoves = [];
  const quarantineMoves = [];
  const familyRows = [];
  const catalogRows = [];
  const renameRows = [];

  for (const [familyKey, items] of familyGroups.entries()) {
    items.sort(fileSort);
    const [lane, familySlug] = familyKey.split("::");
    const hashGroups = new Map();

    for (const item of items) {
      if (!hashGroups.has(item.hash)) hashGroups.set(item.hash, []);
      hashGroups.get(item.hash).push(item);
    }

    const variants = [...hashGroups.values()]
      .map((group) => group.sort(fileSort))
      .sort((a, b) => fileSort(a[0], b[0]));

    variants.forEach((group, index) => {
      const versionLabel = `V${index + 1}`;
      const destination = destinationFor(lane, familySlug, versionLabel);
      const canonicalSource =
        group.find((item) => item.path.startsWith(parentHtmlHubRoot) && !item.path.includes("/archive/")) ??
        group.find((item) => item.path.startsWith(parentHtmlHubRoot)) ??
        group[0];

      familyRows.push({
        lane,
        familySlug,
        versionLabel,
        canonicalSource: canonicalSource.relativePath,
        canonicalDestination: relativeLabel(destination),
        sha256: canonicalSource.hash,
        variantCount: group.length,
      });

      canonicalMoves.push({
        source: canonicalSource.path,
        destination,
        lane,
        familySlug,
        versionLabel,
        hash: canonicalSource.hash,
      });

      if (canonicalSource.path !== destination) {
        renameRows.push({
          originalPath: canonicalSource.relativePath,
          canonicalPath: relativeLabel(destination),
          familySlug,
          versionLabel,
        });
      }

      catalogRows.push({
        canonicalPath: relativeLabel(destination),
        originalPath: canonicalSource.relativePath,
        protected: "no",
        protectionReason: "",
        familySlug,
        versionLabel,
        sha256: canonicalSource.hash,
        lane,
        quarantineStatus: "canonical",
      });

      let duplicateIndex = 1;
      for (const item of group) {
        if (item.path === canonicalSource.path) continue;
        const quarantinePath = quarantineDestination(item, familySlug, versionLabel, duplicateIndex++);
        quarantineMoves.push({
          source: item.path,
          destination: quarantinePath,
          lane,
          familySlug,
          versionLabel,
          hash: item.hash,
        });
        catalogRows.push({
          canonicalPath: relativeLabel(destination),
          originalPath: item.relativePath,
          protected: "no",
          protectionReason: "",
          familySlug,
          versionLabel,
          sha256: item.hash,
          lane,
          quarantineStatus: "quarantined-duplicate",
        });
      }
    });
  }

  return {
    protectedItems,
    inScope,
    canonicalMoves,
    quarantineMoves,
    familyRows,
    catalogRows,
    renameRows,
  };
}

async function moveFile(source, destination) {
  if (source === destination) return;
  await ensureDir(path.dirname(destination));
  await fs.rename(source, destination);
}

async function writeCsv(filePath, headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header] ?? "")).join(","));
  }
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${lines.join("\n")}\n`, "utf8");
}

async function writeSummary(filePath, plans, inventory) {
  const summary = [
    "# HTML Reorganization Verification",
    "",
    `- HTML inventoried: ${inventory.length}`,
    `- Runtime protected: ${plans.protectedItems.length}`,
    `- In scope: ${plans.inScope.length}`,
    `- Canonical family versions: ${plans.canonicalMoves.length}`,
    `- Exact duplicates quarantined: ${plans.quarantineMoves.length}`,
    `- Canonical sink: ${parentHtmlHubRoot}`,
    `- Quarantine sink: ${quarantineRoot}`,
    "",
    "## Protected Runtime HTML",
    ...plans.protectedItems.slice(0, 20).map((item) => `- ${item.relativePath} (${item.protectedReason})`),
  ];

  await fs.writeFile(filePath, `${summary.join("\n")}\n`, "utf8");
}

async function pruneEmptyDirs(rootPath) {
  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await walk(path.join(currentPath, entry.name));
      }
    }

    const remaining = await fs.readdir(currentPath);
    if (!remaining.length && currentPath !== rootPath) {
      await fs.rmdir(currentPath);
    }
  }

  if (await pathExists(rootPath)) {
    await walk(rootPath);
  }
}

async function main() {
  await collectProtectedRuntimeHtml();
  const inventory = await collectHtmlInventory();
  const plans = buildPlans(inventory);

  await ensureDir(parentHtmlHubRoot);
  await ensureDir(quarantineRoot);
  await ensureDir(path.join(parentHtmlHubRoot, "_manifests"));
  for (const lane of canonicalLanes) {
    await ensureDir(path.join(parentHtmlHubRoot, lane));
    await ensureDir(path.join(quarantineRoot, lane));
  }

  for (const move of plans.canonicalMoves) {
    await moveFile(move.source, move.destination);
  }

  for (const move of plans.quarantineMoves) {
    await moveFile(move.source, move.destination);
  }

  await pruneEmptyDirs(path.join(parentDocsRoot, "html"));
  await pruneEmptyDirs(path.join(repoDocsRoot, "Graphs + Vizualizers"));
  await pruneEmptyDirs(path.join(repoDocsRoot, "Video Editor", "editors", "Backups"));

  await writeCsv(
    path.join(reorgLogsRoot, "html_runtime_protected_manifest.csv"),
    ["path", "reason"],
    [...runtimeProtectedReasons.entries()].map(([filePath, reason]) => ({
      path: relativeLabel(filePath),
      reason,
    })),
  );

  await writeCsv(
    path.join(reorgLogsRoot, "html_reorg_inventory_before.csv"),
    ["path", "sha256", "lane", "familySlug", "protected", "protectedReason", "mtimeMs"],
    inventory.map((item) => ({
      path: item.relativePath,
      sha256: item.hash,
      lane: item.lane,
      familySlug: item.familySlug,
      protected: item.protected ? "yes" : "no",
      protectedReason: item.protectedReason,
      mtimeMs: Math.trunc(item.mtimeMs),
    })),
  );

  await writeCsv(
    path.join(reorgLogsRoot, "html_reorg_hash_groups.csv"),
    ["sha256", "path", "protected"],
    inventory.map((item) => ({
      sha256: item.hash,
      path: item.relativePath,
      protected: item.protected ? "yes" : "no",
    })),
  );

  await writeCsv(
    path.join(reorgLogsRoot, "html_reorg_family_map.csv"),
    ["lane", "familySlug", "versionLabel", "canonicalSource", "canonicalDestination", "sha256", "variantCount"],
    plans.familyRows,
  );

  await writeCsv(
    path.join(reorgLogsRoot, "html_reorg_move_map.csv"),
    ["source", "destination", "lane", "familySlug", "versionLabel", "sha256"],
    plans.canonicalMoves.map((move) => ({
      source: relativeLabel(move.source),
      destination: relativeLabel(move.destination),
      lane: move.lane,
      familySlug: move.familySlug,
      versionLabel: move.versionLabel,
      sha256: move.hash,
    })),
  );

  await writeCsv(
    path.join(reorgLogsRoot, "html_reorg_rename_map.csv"),
    ["originalPath", "canonicalPath", "familySlug", "versionLabel"],
    plans.renameRows,
  );

  await writeCsv(
    path.join(reorgLogsRoot, "html_reorg_quarantine_map.csv"),
    ["source", "destination", "lane", "familySlug", "versionLabel", "sha256"],
    plans.quarantineMoves.map((move) => ({
      source: relativeLabel(move.source),
      destination: relativeLabel(move.destination),
      lane: move.lane,
      familySlug: move.familySlug,
      versionLabel: move.versionLabel,
      sha256: move.hash,
    })),
  );

  await writeCsv(
    path.join(parentHtmlHubRoot, "_manifests", "html_hub_catalog.csv"),
    [
      "canonicalPath",
      "originalPath",
      "protected",
      "protectionReason",
      "familySlug",
      "versionLabel",
      "sha256",
      "lane",
      "quarantineStatus",
    ],
    plans.catalogRows,
  );

  await writeSummary(path.join(reorgLogsRoot, "html_reorg_verify_summary.md"), plans, inventory);
  console.log(
    JSON.stringify(
      {
        inventoried: inventory.length,
        protected: plans.protectedItems.length,
        canonicalMoves: plans.canonicalMoves.length,
        quarantined: plans.quarantineMoves.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
