#!/usr/bin/env node
/**
 * herald-artifacts — save and organise what a conversation produced.
 * Contract: agent/contracts/herald-artifacts.md
 *
 *   init <slug>              create docs/herald/artifacts/<date>--<slug>/
 *   promote <family> <file>  make <file> the canonical version; others -> variants/
 *   index [<folder>]         regenerate README.md and SCREENSHOTS.md
 *   check                    validate the convention (CI gate)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'docs/herald/artifacts';
const IMAGE = /\.(png|jpe?g|gif|webp|svg)$/i;
const GENERATED = ['README.md', 'SCREENSHOTS.md'];
// Never an artifact: generated indexes, the version record, and directory keepers.
const META = new Set([...GENERATED, 'VERSIONS.md', '.gitkeep', '.DS_Store']);
const RESERVED = new Set(['screenshots', 'documents', 'variants']);

const abs = (...p) => path.join(ROOT, ...p);
const exists = (p) => fs.existsSync(abs(p));
const today = () => new Date().toISOString().slice(0, 10);
const dirs = (p) =>
  exists(p) ? fs.readdirSync(abs(p), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];
const files = (p) =>
  exists(p) ? fs.readdirSync(abs(p), { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name) : [];
const kb = (p) => `${Math.max(1, Math.round(fs.statSync(abs(p)).size / 1024))} KB`;
/** Files in a directory that are actual artifacts, not bookkeeping. */
const artifactFiles = (p) => files(p).filter((f) => !META.has(f));

const die = (msg) => { console.error(msg); process.exit(1); };

/** Conversation folders under BASE. */
const conversations = () => dirs(BASE).sort();

/** A family folder is any non-reserved subdirectory of a conversation. */
const families = (conv) => dirs(path.join(BASE, conv)).filter((d) => !RESERVED.has(d));


// ------------------------------------------------------- family detection
/**
 * Strip version noise from a filename to get the family it belongs to.
 * Handles the shapes this corpus actually contains: "copy", "copy 2", "(5)", "_V1",
 * "v12", trailing dates, and "final/latest/new/old/draft" suffixes.
 */
function familySlug(filename) {
  let n = filename.replace(/\.[A-Za-z0-9]+$/, '');
  n = n
    .replace(/\s*\(\d+\)/g, '')                       // "foo (5)"
    .replace(/[-_ ]*\bcopy\b[-_ ]*\d*/gi, '')          // "foo copy", "foo copy 2"
    .replace(/[-_ ]*\d{4}-\d{2}-\d{2}/g, '')           // trailing/embedded dates
    // v1, V12, v1.2 — anchored on a separator or string start, because \b fails after
    // "_" (a word character), which is exactly how "Editor_V1" is usually written.
    .replace(/(^|[-_ ])v\d+(\.\d+)*(?=$|[-_ .])/gi, '')
    .replace(/[-_ ]*\b(final|latest|new|old|draft|wip|backup|bak)\b/gi, '')
    .replace(/[-_ ]*\b\d+\b$/g, '')                    // trailing bare number
    .replace(/[-_\s]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return n || filename.replace(/\.[A-Za-z0-9]+$/, '').toLowerCase();
}

/** Date encoded in a filename, else null. Filenames beat mtime, which copying destroys. */
function dateIn(filename) {
  const m = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : null;
}

/** Version number encoded in a filename (v3, _V12, (5), copy 8), else null. */
function versionIn(filename) {
  const stem = filename.replace(/\.[A-Za-z0-9]+$/, '');
  const v = stem.match(/(?:^|[-_ ])v(\d+)(?:\.(\d+))?(?=$|[-_ .])/i);
  if (v) return Number(v[1]) * 1000 + Number(v[2] ?? 0);
  const paren = stem.match(/\((\d+)\)/);
  if (paren) return Number(paren[1]);
  const copy = stem.match(/\bcopy[-_ ]*(\d+)\b/i);
  if (copy) return Number(copy[1]);
  return null;
}

/**
 * Canonical pick, in the contract's order:
 *   1 explicit decision  2 most recent  3 largest
 * `explicit` is a filename the caller already decided on.
 */
function pickCanonical(dir, names, explicit) {
  if (explicit && names.includes(explicit)) return { name: explicit, why: 'explicit decision' };
  const rows = names.map((n) => ({
    name: n,
    date: dateIn(n),
    mtime: fs.statSync(abs(dir, n)).mtimeMs,
    size: fs.statSync(abs(dir, n)).size,
  }));
  const dated = rows.filter((r) => r.date);
  if (dated.length) {
    const newest = dated.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.size - a.size))[0];
    const tie = dated.filter((r) => r.date === newest.date);
    return { name: newest.name, why: tie.length > 1 ? 'most recent, largest of that date' : 'most recent' };
  }
  // A version number is a recency signal and outranks size: V3 supersedes V1 even when
  // the two files happen to be the same length.
  const versioned = rows.map((r) => ({ ...r, v: versionIn(r.name) })).filter((r) => r.v !== null);
  if (versioned.length) {
    const highest = versioned.sort((a, b) => b.v - a.v || b.size - a.size)[0];
    return { name: highest.name, why: 'highest version number' };
  }
  const bySize = [...rows].sort((a, b) => b.size - a.size || b.mtime - a.mtime);
  return { name: bySize[0].name, why: 'largest' };
}

// ---------------------------------------------------------------- init
function init(slug) {
  if (!slug) die('usage: herald-artifacts init <slug>');
  const clean = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const folder = path.join(BASE, `${today()}--${clean}`);
  if (exists(folder)) die(`already exists: ${folder}`);
  for (const sub of ['screenshots', 'documents']) fs.mkdirSync(abs(folder, sub), { recursive: true });
  fs.writeFileSync(abs(folder, 'documents', '.gitkeep'), '');
  fs.writeFileSync(abs(folder, 'screenshots', '.gitkeep'), '');
  index(folder);
  console.log(`created ${folder}`);
}

// ------------------------------------------------------------- promote
function promote(familyDir, file) {
  if (!familyDir || !file) die('usage: herald-artifacts promote <family-dir> <file>');
  if (!exists(familyDir)) die(`no such family folder: ${familyDir}`);
  const target = path.basename(file);
  const all = artifactFiles(familyDir);
  const variantDir = path.join(familyDir, 'variants');
  const inVariants = artifactFiles(variantDir);
  if (!all.includes(target) && !inVariants.includes(target)) {
    die(`${target} is not in ${familyDir} or its variants/`);
  }
  fs.mkdirSync(abs(variantDir), { recursive: true });

  // Demote every currently-loose file, then raise the chosen one.
  for (const f of all) {
    if (f === target) continue;
    fs.renameSync(abs(familyDir, f), abs(variantDir, f));
  }
  if (inVariants.includes(target)) {
    fs.renameSync(abs(variantDir, target), abs(familyDir, target));
  }
  console.log(`canonical: ${path.join(familyDir, target)}`);
  console.log(`variants:  ${files(variantDir).length}`);
  console.log('Record the reason in VERSIONS.md.');
}

// --------------------------------------------------------------- index
/** Screenshot metadata from manifest.json (capture-phase5-built-ui.mjs format) or a sidecar. */
function shotMeta(conv, name) {
  const manifestPath = path.join(BASE, conv, 'screenshots', 'manifest.json');
  if (exists(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(abs(manifestPath), 'utf8'));
      const rows = Array.isArray(m) ? m : m.shots ?? [];
      const hit = rows.find((r) => r.file && path.basename(r.file) === name);
      if (hit) {
        return [hit.route ?? hit.path, hit.viewport, hit.ref, hit.data, hit.auth]
          .filter(Boolean).join(' · ');
      }
    } catch { /* manifest unreadable: fall through */ }
  }
  const sidecar = path.join(BASE, conv, 'screenshots', `${name}.json`);
  if (exists(sidecar)) {
    try {
      const s = JSON.parse(fs.readFileSync(abs(sidecar), 'utf8'));
      return [s.route, s.viewport, s.ref, s.data, s.auth].filter(Boolean).join(' · ');
    } catch { /* ignore */ }
  }
  return null;
}

const titleise = (name) =>
  name.replace(IMAGE, '').replace(/^\d+[-_]/, '').replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

function buildScreenshots(conv) {
  const shots = files(path.join(BASE, conv, 'screenshots')).filter((f) => IMAGE.test(f)).sort();
  const lines = [
    `# Screenshots — ${conv}`,
    '',
    '<!-- GENERATED by scripts/herald-artifacts.mjs — do not edit; run `node scripts/herald-artifacts.mjs index` -->',
    '',
  ];
  if (!shots.length) {
    lines.push('_No screenshots captured for this conversation._', '');
  } else {
    lines.push(`${shots.length} screenshot${shots.length === 1 ? '' : 's'}, in order. Scroll to view all.`, '');
    shots.forEach((s, i) => {
      const meta = shotMeta(conv, s);
      lines.push(`## ${i + 1}. ${titleise(s)}`, '');
      if (meta) lines.push(meta, '');
      lines.push(`![${titleise(s)}](./screenshots/${encodeURI(s)})`, '');
    });
  }
  return lines.join('\n');
}

function buildReadme(conv) {
  const base = path.join(BASE, conv);
  const docs = artifactFiles(path.join(base, 'documents')).sort();
  const fams = families(conv).sort();
  const shots = files(path.join(base, 'screenshots')).filter((f) => IMAGE.test(f));

  const out = [
    `# ${conv}`,
    '',
    '<!-- GENERATED by scripts/herald-artifacts.mjs — do not edit; run `node scripts/herald-artifacts.mjs index` -->',
    '',
    `Artifacts produced by this conversation. Contract: [\`agent/contracts/herald-artifacts.md\`](../../../../agent/contracts/herald-artifacts.md)`,
    '',
    `| | Count |`,
    `|---|---|`,
    `| Documents | ${docs.length} |`,
    `| Versioned families | ${fams.length} |`,
    `| Screenshots | ${shots.length} |`,
    '',
  ];

  if (shots.length) out.push(`**[All ${shots.length} screenshots in one scrollable page →](./SCREENSHOTS.md)**`, '');

  if (docs.length) {
    out.push('## Documents', '');
    for (const d of docs) out.push(`- [\`${d}\`](./documents/${encodeURI(d)}) — ${kb(path.join(base, 'documents', d))}`);
    out.push('');
  }

  if (fams.length) {
    out.push('## Versioned families', '', 'The canonical version sits loose in each folder; every other variant is in `variants/`.', '');
    for (const f of fams) {
      const loose = artifactFiles(path.join(base, f));
      const variants = artifactFiles(path.join(base, f, 'variants'));
      const canonical = loose[0];
      out.push(
        `### \`${f}/\``,
        canonical
          ? `- **Canonical:** [\`${canonical}\`](./${encodeURI(f)}/${encodeURI(canonical)}) — ${kb(path.join(base, f, canonical))}`
          : `- ⚠️ **no canonical file loose in this folder**`,
        `- Variants: ${variants.length}${variants.length ? ` — [\`variants/\`](./${encodeURI(f)}/variants/)` : ''}`,
        exists(path.join(base, f, 'VERSIONS.md')) ? `- [VERSIONS.md](./${encodeURI(f)}/VERSIONS.md)` : `- ⚠️ no VERSIONS.md`,
        '',
      );
    }
  }
  return out.join('\n');
}

function index(folder) {
  const targets = folder
    ? [folder.replace(/\/+$/, '').replace(new RegExp(`^${BASE}/`), '')]
    : conversations();
  if (!targets.length) { console.log('herald-artifacts: no conversation folders yet'); return []; }
  const written = [];
  for (const conv of targets) {
    if (!exists(path.join(BASE, conv))) die(`no such conversation folder: ${conv}`);
    for (const [name, body] of [['SCREENSHOTS.md', buildScreenshots(conv)], ['README.md', buildReadme(conv)]]) {
      const p = path.join(BASE, conv, name);
      const prev = exists(p) ? fs.readFileSync(abs(p), 'utf8') : null;
      if (prev !== body) { fs.writeFileSync(abs(p), body); written.push(p); }
    }
  }
  console.log(written.length ? `herald-artifacts: wrote ${written.length} file(s)` : 'herald-artifacts: indexes already current');
  for (const w of written) console.log(`  ${w}`);
  return written;
}


// ---------------------------------------------------------------- save
function save(args) {
  const toIdx = args.indexOf('--to');
  const conv = toIdx !== -1 ? args[toIdx + 1] : conversations().slice(-1)[0];
  const inputs = (toIdx !== -1 ? [...args.slice(0, toIdx), ...args.slice(toIdx + 2)] : args).filter(Boolean);
  if (!inputs.length) die('usage: herald-artifacts save <file...> [--to <conversation-folder>]');
  if (!conv) die('no conversation folder yet — run: herald-artifacts init <slug>');
  const convDir = conv.startsWith(BASE) ? conv : path.join(BASE, conv);
  if (!exists(convDir)) die(`no such conversation folder: ${convDir}`);

  const saved = [];
  for (const src of inputs) {
    if (!fs.existsSync(src)) { console.error(`  skipped (missing): ${src}`); continue; }
    const name = path.basename(src);
    const dest = path.join(convDir, IMAGE.test(name) ? 'screenshots' : 'documents', name);
    fs.mkdirSync(abs(path.dirname(dest)), { recursive: true });
    fs.copyFileSync(src, abs(dest));
    saved.push(dest);
  }
  for (const s2 of saved) console.log(`  saved ${s2}`);
  index(convDir);
  console.log('Run `herald-artifacts group` if any of these are new versions of an existing thing.');
}

// --------------------------------------------------------------- group
/** Detect version families among loose documents and organise them. */
function group(convArg) {
  const targets = convArg
    ? [convArg.replace(/\/+$/, '').replace(new RegExp(`^${BASE.replace(/\//g, '\\/')}\/`), '')]
    : conversations();
  let moved = 0;
  for (const conv of targets) {
    const base = path.join(BASE, conv);
    const docsDir = path.join(base, 'documents');
    const loose = artifactFiles(docsDir);
    const byFamily = new Map();
    for (const f of loose) {
      const k = familySlug(f);
      if (!byFamily.has(k)) byFamily.set(k, []);
      byFamily.get(k).push(f);
    }
    for (const [slug, members] of byFamily) {
      if (members.length < 2) continue; // one version stays loose — no folder churn
      const famDir = path.join(base, slug);
      const varDir = path.join(famDir, 'variants');
      fs.mkdirSync(abs(varDir), { recursive: true });
      const { name: canonical, why } = pickCanonical(docsDir, members);
      for (const m of members) {
        fs.renameSync(abs(docsDir, m), abs(m === canonical ? famDir : varDir, m));
        moved++;
      }
      if (!exists(path.join(famDir, 'VERSIONS.md'))) {
        const rows = members
          .filter((m) => m !== canonical)
          .map((m) => `| \`variants/${m}\` | ${dateIn(m) ?? 'unknown'} | ${kb(path.join(varDir, m))} | | superseded |`)
          .join('\n');
        fs.writeFileSync(abs(famDir, 'VERSIONS.md'),
`# ${slug}

**Canonical:** \`${canonical}\` — selected automatically by **${why}**.
**Selected by:** ${why}

> Auto-grouped by \`herald-artifacts group\`. If a different version is actually the best
> one, run \`herald-artifacts promote ${famDir} <file>\` and replace this line with why.

| Variant | Date | Size | What it was | Why not canonical |
|---|---|---|---|---|
${rows}
`);
      }
      console.log(`  ${slug}/  canonical: ${canonical}  (${why})  variants: ${members.length - 1}`);
    }
    index(path.join(BASE, conv));
  }
  console.log(moved ? `herald-artifacts: grouped ${moved} file(s)` : 'herald-artifacts: no version families found');
}

// --------------------------------------------------------------- check
function check() {
  const problems = [];
  for (const conv of conversations()) {
    const base = path.join(BASE, conv);
    for (const f of families(conv)) {
      const loose = artifactFiles(path.join(base, f));
      const variants = artifactFiles(path.join(base, f, 'variants'));
      if (loose.length === 0) problems.push(`${base}/${f}: no canonical file loose in the folder`);
      if (loose.length > 1) problems.push(`${base}/${f}: ${loose.length} loose files — exactly one is canonical, the rest belong in variants/ (${loose.join(', ')})`);
      if (variants.length && !exists(path.join(base, f, 'VERSIONS.md'))) problems.push(`${base}/${f}: has variants but no VERSIONS.md recording the canonical choice`);
    }
    // stale generated indexes
    for (const [name, body] of [['SCREENSHOTS.md', buildScreenshots(conv)], ['README.md', buildReadme(conv)]]) {
      const p = path.join(base, name);
      if (!exists(p) || fs.readFileSync(abs(p), 'utf8') !== body) problems.push(`${p}: stale — run \`node scripts/herald-artifacts.mjs index\``);
    }
  }
  if (problems.length) {
    console.error(`herald-artifacts: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(`herald-artifacts: ${conversations().length} conversation folder(s) valid`);
}

// ----------------------------------------------------------------- cli
const [cmd, ...args] = process.argv.slice(2);
switch (cmd) {
  case 'init': init(args[0]); break;
  case 'promote': promote(args[0], args[1]); break;
  case 'save': save(args); break;
  case 'group': group(args[0]); break;
  case 'index': index(args[0]); break;
  case 'check': check(); break;
  default:
    console.log('usage: herald-artifacts <init|save|group|promote|index|check> [args]');
    console.log('see agent/contracts/herald-artifacts.md');
    process.exit(cmd ? 1 : 0);
}
