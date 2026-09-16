#!/usr/bin/env node
/**
 * Stop — append one Herald ledger line per turn.
 *
 * Turn-loop step 7 (agent/contracts/herald-workflow.md). The previous continuity cache sat
 * empty for a year because its write path was a manual gesture; this makes the write
 * mechanical. Records what changed, never why — narrative stays in the receipt.
 *
 * Never blocks and never throws.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const gitRaw = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
};
// Trimmed form, for single-value reads. Never use on porcelain output: trimming eats the
// leading status space of the first record and shifts every field slice by one.
const git = (...args) => gitRaw(...args).trim();

const readStdin = async () => {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
};

try {
  const raw = await readStdin();
  const payload = raw.trim() ? JSON.parse(raw) : {};

  const root = git('rev-parse', '--show-toplevel') || process.cwd();

  // -z gives NUL-delimited records with unquoted, unescaped paths, so there is no
  // slicing or quote-unwrapping to get wrong. A rename/copy record is followed by a
  // second field holding the OLD path, which we consume and discard.
  const porcelain = gitRaw('status', '--porcelain=v1', '-z');
  const fields = porcelain ? porcelain.split('\0').filter((f) => f.length) : [];
  const changed = [];
  for (let i = 0; i < fields.length; i++) {
    const rec = fields[i];
    const xy = rec.slice(0, 2);
    changed.push(rec.slice(3));
    if (xy[0] === 'R' || xy[0] === 'C') i++; // skip the old-path field
  }

  // Nothing changed in the working tree: no ledger line worth writing.
  if (changed.length) {
    const uiTouched = changed.some((p) =>
      /^src\/(components|views|features)\/|\.css$/.test(p),
    );

    const entry = {
      ts: new Date().toISOString(),
      app: 'claude-code',
      session: payload.session_id ?? null,
      branch: git('rev-parse', '--abbrev-ref', 'HEAD') || null,
      head: git('rev-parse', '--short', 'HEAD') || null,
      changedPaths: changed.slice(0, 50),
      changedCount: changed.length,
      uiTouched,
      visualEvidenceExpected: uiTouched,
    };

    const dir = path.join(root, '.viewtube/herald/ledger');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${entry.ts.slice(0, 10)}.jsonl`);
    fs.appendFileSync(file, JSON.stringify(entry) + '\n');
  }
} catch {
  // stay silent on any failure
}
process.exit(0);
