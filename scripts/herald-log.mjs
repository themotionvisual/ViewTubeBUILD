#!/usr/bin/env node
/**
 * herald-log — one line per conversation in docs/herald/CONVERSATION-LOG.md
 *
 * The table is GENERATED from each conversation folder's meta.json plus what is actually
 * on disk and in git. Conversations never append to the shared file directly: many agents
 * editing one growing table is a merge-conflict generator, and hand-written artifact lists
 * go stale the moment another file is added.
 *
 *   init <folder>      write a meta.json stub for a conversation folder
 *   set <folder> k=v   update fields (name, app, status, summary, branch, taskIds)
 *   build              regenerate docs/herald/CONVERSATION-LOG.md from every folder
 *   check              fail if any folder lacks meta.json or the table is stale
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const BASE = 'docs/herald/artifacts';
const LOG = 'docs/herald/CONVERSATION-LOG.md';
const IMAGE = /\.(png|jpe?g|gif|webp|svg)$/i;
const META = new Set(['README.md', 'SCREENSHOTS.md', 'VERSIONS.md', 'meta.json', '.gitkeep', '.DS_Store']);
const STATUSES = ['in-progress', 'finished', 'blocked', 'abandoned'];

const abs = (...p) => path.join(ROOT, ...p);
const exists = (p) => fs.existsSync(abs(p));
const die = (m) => { console.error(m); process.exit(1); };
const git = (...a) => {
  try { return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
};
const entries = (p, kind) =>
  exists(p) ? fs.readdirSync(abs(p), { withFileTypes: true })
    .filter((e) => (kind === 'dir' ? e.isDirectory() : e.isFile())).map((e) => e.name) : [];
const conversations = () => entries(BASE, 'dir').sort();

/** Everything this conversation produced, walked from disk so it can never go stale. */
function inventory(conv) {
  const base = path.join(BASE, conv);
  const docs = entries(path.join(base, 'documents'), 'file').filter((f) => !META.has(f));
  const shots = entries(path.join(base, 'screenshots'), 'file').filter((f) => IMAGE.test(f));
  const families = entries(base, 'dir').filter((d) => !['documents', 'screenshots'].includes(d));
  const canonical = families.map((f) => {
    const loose = entries(path.join(base, f), 'file').filter((x) => !META.has(x));
    const variants = entries(path.join(base, f, 'variants'), 'file').filter((x) => !META.has(x));
    return { family: f, canonical: loose[0] ?? null, variants: variants.length };
  });
  return { docs, shots, families: canonical };
}

/** Dates: first and last git touch of the folder, falling back to filesystem mtimes. */
function dates(conv) {
  const p = path.join(BASE, conv);
  const first = git('log', '--diff-filter=A', '--follow', '--format=%as', '--reverse', '--', p).split('\n')[0];
  const last = git('log', '-1', '--format=%as', '--', p);
  const fromName = conv.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  const stat = exists(p) ? fs.statSync(abs(p)) : null;
  const fsDate = stat ? new Date(stat.mtime).toISOString().slice(0, 10) : '';
  return { started: first || fromName || fsDate, last: last || fsDate };
}

const metaPath = (conv) => path.join(BASE, conv, 'meta.json');
const readMeta = (conv) => (exists(metaPath(conv)) ? JSON.parse(fs.readFileSync(abs(metaPath(conv)), 'utf8')) : null);

// ----------------------------------------------------------------- init
function init(folder) {
  if (!folder) die('usage: herald-log init <conversation-folder>');
  const conv = folder.replace(/\/+$/, '').split('/').pop();
  if (!exists(path.join(BASE, conv))) die(`no such conversation folder: ${conv}`);
  if (exists(metaPath(conv))) die(`meta.json already exists for ${conv}`);
  const stub = {
    schemaVersion: 'viewtube.herald.conversation.v1',
    name: conv.replace(/^\d{4}-\d{2}-\d{2}--/, '').replace(/-/g, ' '),
    app: 'unknown',
    status: 'in-progress',
    branch: git('rev-parse', '--abbrev-ref', 'HEAD') || 'unknown',
    summary: 'TODO: one line on the important work done',
    taskIds: [],
    referenced: [],
  };
  fs.writeFileSync(abs(metaPath(conv)), JSON.stringify(stub, null, 2) + '\n');
  console.log(`wrote ${metaPath(conv)} — fill in app, summary and status`);
}

// ------------------------------------------------------------------ set
function set(folder, pairs) {
  if (!folder || !pairs.length) die('usage: herald-log set <folder> key=value [key=value ...]');
  const conv = folder.replace(/\/+$/, '').split('/').pop();
  const m = readMeta(conv);
  if (!m) die(`no meta.json for ${conv} — run: herald-log init ${conv}`);
  for (const p of pairs) {
    const i = p.indexOf('=');
    if (i === -1) die(`not a key=value pair: ${p}`);
    const k = p.slice(0, i), v = p.slice(i + 1);
    if (k === 'status' && !STATUSES.includes(v)) die(`status must be one of: ${STATUSES.join(', ')}`);
    m[k] = ['taskIds', 'referenced'].includes(k) ? v.split(',').map((x) => x.trim()).filter(Boolean) : v;
  }
  fs.writeFileSync(abs(metaPath(conv)), JSON.stringify(m, null, 2) + '\n');
  console.log(`updated ${metaPath(conv)}`);
}

// ---------------------------------------------------------------- build
const BADGE = { finished: '✅ finished', 'in-progress': '🔶 in progress', blocked: '⛔ blocked', abandoned: '⚪ abandoned' };

function buildTable() {
  const rows = [];
  for (const conv of conversations()) {
    const m = readMeta(conv) ?? {};
    const inv = inventory(conv);
    const d = dates(conv);
    const link = `[${m.name || conv}](./artifacts/${encodeURI(conv)}/)`;
    const files = [
      ...inv.docs.map((f) => `\`${f}\``),
      ...inv.families.map((f) => `\`${f.canonical ?? f.family}\`${f.variants ? ` (+${f.variants})` : ''}`),
    ];
    const artifacts = [
      files.length ? files.join('<br>') : '—',
      inv.shots.length ? `<br>${inv.shots.length} screenshot${inv.shots.length === 1 ? '' : 's'} → [SCREENSHOTS](./artifacts/${encodeURI(conv)}/SCREENSHOTS.md)` : '',
      (m.referenced?.length ? `<br>_ref:_ ${m.referenced.map((r) => `\`${r}\``).join(', ')}` : ''),
    ].join('');
    rows.push(`| ${link} | ${m.app ?? '—'} | ${d.started || '—'} | ${d.last || '—'} | ${BADGE[m.status] ?? m.status ?? '—'} | \`${m.branch ?? '—'}\` | ${m.summary ?? '—'} | ${artifacts} |`);
  }
  return [
    '# ViewTube conversation log',
    '',
    '<!-- GENERATED by scripts/herald-log.mjs — do not edit; run `npm run log:build` -->',
    '',
    'One row per AI conversation. Each row is generated from that conversation folder\'s',
    '`meta.json` plus what is actually on disk and in git, so artifact lists cannot go stale',
    'and no two conversations edit the same lines.',
    '',
    `**${conversations().length} conversation${conversations().length === 1 ? '' : 's'}.** Full detail is in each folder\'s README.`,
    '',
    '| Conversation | App | Started | Last worked | Status | Branch | Work done | Documents, HTML & screenshots |',
    '|---|---|---|---|---|---|---|---|',
    ...rows,
    '',
    '---',
    '',
    'Adding a row: `npm run log:init <folder>` then `herald-log set <folder> app=… summary=… status=…`,',
    'then `npm run log:build`. Statuses: `in-progress` · `finished` · `blocked` · `abandoned`.',
    '',
  ].join('\n');
}

function build() {
  const body = buildTable();
  const prev = exists(LOG) ? fs.readFileSync(abs(LOG), 'utf8') : null;
  if (prev === body) { console.log('herald-log: already current'); return; }
  fs.mkdirSync(abs(path.dirname(LOG)), { recursive: true });
  fs.writeFileSync(abs(LOG), body);
  console.log(`herald-log: wrote ${LOG} (${conversations().length} row(s))`);
}

// ---------------------------------------------------------------- check
function check() {
  const problems = [];
  for (const conv of conversations()) {
    const m = readMeta(conv);
    if (!m) { problems.push(`${BASE}/${conv}: no meta.json — run \`herald-log init ${conv}\``); continue; }
    for (const k of ['name', 'app', 'status', 'branch', 'summary']) {
      if (!m[k]) problems.push(`${BASE}/${conv}/meta.json: missing \`${k}\``);
    }
    if (m.status && !STATUSES.includes(m.status)) problems.push(`${BASE}/${conv}/meta.json: status "${m.status}" not one of ${STATUSES.join(', ')}`);
    if (typeof m.summary === 'string' && m.summary.startsWith('TODO')) problems.push(`${BASE}/${conv}/meta.json: summary is still the stub`);
  }
  if (!exists(LOG) || fs.readFileSync(abs(LOG), 'utf8') !== buildTable()) {
    problems.push(`${LOG}: stale — run \`npm run log:build\``);
  }
  if (problems.length) {
    console.error(`herald-log: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(`herald-log: ${conversations().length} conversation(s) logged`);
}

const [cmd, ...args] = process.argv.slice(2);
switch (cmd) {
  case 'init': init(args[0]); break;
  case 'set': set(args[0], args.slice(1)); break;
  case 'build': build(); break;
  case 'check': check(); break;
  default:
    console.log('usage: herald-log <init|set|build|check> [args]');
    process.exit(cmd ? 1 : 0);
}
