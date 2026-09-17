#!/usr/bin/env node
/**
 * herald-brief — assemble a compact context pack for a topic.
 *
 * Saves AI usage. Instead of a conversation re-reading five registries, re-running git and
 * re-deriving what was already known, it pastes one small brief. Spend the context once,
 * keep the conclusion, start the next conversation from the cache.
 *
 *   herald-brief <topic words...> [--full]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const FULL = args.includes('--full');
const terms = args.filter((a) => !a.startsWith('--')).map((t) => t.toLowerCase());
if (!terms.length) {
  console.log('usage: herald-brief <topic words...> [--full]');
  process.exit(0);
}

const read = (p) => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return ''; } };
const git = (...a) => {
  try { return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
};
const hit = (line) => terms.some((t) => line.toLowerCase().includes(t));
const cap = (arr, n) => (FULL ? arr : arr.slice(0, n));

const out = [];
const section = (title, lines, empty) => {
  out.push(`## ${title}`, '');
  if (lines.length) out.push(...lines, '');
  else out.push(`_${empty}_`, '');
};

out.push(`# Brief: ${terms.join(' ')}`, '', `Generated ${new Date().toISOString().slice(0, 10)} by \`herald-brief\`. Paste this instead of re-deriving.`, '');

// 1. Prior conversations — the cheapest and most specific signal
const log = read('docs/herald/CONVERSATION-LOG.md').split('\n').filter((l) => l.startsWith('|') && hit(l) && !l.includes('---'));
section('Prior conversations on this topic', cap(log, 5), 'none logged — this may be genuinely new');

// 2. Branches, remote-side (the clone is shallow; local refs would lie)
const branches = git('ls-remote', '--heads', 'origin').split('\n')
  .map((l) => l.split('refs/heads/')[1]).filter(Boolean).filter(hit);
section(`Branches (${branches.length} of ${git('ls-remote', '--heads', 'origin').split('\n').filter(Boolean).length} total)`,
  cap(branches, 12).map((b) => `- \`${b}\``), 'no branch names match — check docs and quarantine before assuming novel');

// 3. Task ids
const taskSrc = read('docs/herald/CONVERSATION-LOG.md') + read('agent/registry/references.md');
const tasks = [...new Set((taskSrc.match(/vt-\d{4,}/gi) || []).map((t) => t.toLowerCase()))];
section('Task ids referenced nearby', tasks.length ? [tasks.slice(0, 20).join(' · ')] : [], 'none — check the Task Index directly');

// 4. Registries
for (const [title, file, empty] of [
  ['References', 'agent/registry/references.md', 'nothing indexed — search docs/ and _quarantine/ directly'],
  ['Capabilities already available', 'agent/registry/capabilities.md', 'nothing matched'],
  ['Vetted external candidates', 'agent/registry/candidates.md', 'nothing on file — recommend something new, marked unverified'],
]) {
  const lines = read(file).split('\n').filter((l) => hit(l) && l.trim() && !l.startsWith('#')).map((l) => l.trim());
  section(title, cap(lines, 6), empty);
}

// 5. Docs and quarantine, by filename
const walk = (dir, acc = []) => {
  let ents = [];
  try { ents = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }); } catch { return acc; }
  for (const e of ents) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, acc);
    else if (hit(e.name)) acc.push(p);
  }
  return acc;
};
section('Files whose names match', cap([...walk('docs'), ...walk('_quarantine'), ...walk('governance')], 10).map((f) => `- \`${f}\``),
  'no filename matches');

const body = out.join('\n');
process.stdout.write(body + '\n');
console.error(`\n[herald-brief] ${Buffer.byteLength(body)} bytes${FULL ? '' : ' — pass --full for everything'}`);
