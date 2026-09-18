#!/usr/bin/env node
/**
 * herald-cost — what does this system cost per conversation, before any work is done?
 *
 * Rough tokens ≈ bytes / 4. The point is not precision, it is that the number is visible:
 * an always-on file is charged against every single turn of every conversation.
 */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const size = (p) => { try { return fs.statSync(path.join(ROOT, p)).size; } catch { return 0; } };
const tok = (b) => Math.round(b / 4);
const row = (label, bytes, when) => ({ label, bytes, tokens: tok(bytes), when });

const ALWAYS = [
  row('CLAUDE.md', size('CLAUDE.md'), 'every Claude Code turn'),
  row('AGENTS.md', size('AGENTS.md'), 'every Codex/Cursor/Gemini turn'),
];
const PASTED = [row('START-PROMPT.md', size('agent/START-PROMPT.md'), 'pasted, then every turn')];
const ONDEMAND = fs.existsSync(path.join(ROOT, 'agent/contracts'))
  ? fs.readdirSync(path.join(ROOT, 'agent/contracts')).filter((f) => f.endsWith('.md'))
      .map((f) => row(`contracts/${f}`, size(`agent/contracts/${f}`), 'when loaded'))
  : [];
const REG = fs.existsSync(path.join(ROOT, 'agent/registry'))
  ? fs.readdirSync(path.join(ROOT, 'agent/registry')).filter((f) => f.endsWith('.md'))
      .map((f) => row(`registry/${f}`, size(`agent/registry/${f}`), 'when read'))
  : [];

const show = (title, rows) => {
  if (!rows.length) return 0;
  console.log(`\n${title}`);
  for (const r of rows.sort((a, b) => b.bytes - a.bytes)) {
    console.log(`  ${String(r.tokens).padStart(6)} tok  ${String((r.bytes / 1024).toFixed(1)).padStart(6)} KB  ${r.label}`);
  }
  const t = rows.reduce((a, r) => a + r.tokens, 0);
  console.log(`  ${String(t).padStart(6)} tok  subtotal`);
  return t;
};

console.log('herald-cost — context charged before any work happens');
const a = show('ALWAYS ON (every turn, every conversation)', ALWAYS);
const p = show('PASTED PROMPT (in context for the whole conversation)', PASTED);
const o = show('ON DEMAND (only when loaded)', ONDEMAND);
const r = show('REGISTRIES (only when read)', REG);

const floor = a + p;
console.log(`\n  FLOOR: ~${floor} tokens of input before the first useful word.`);
console.log(`  Over a 30-turn conversation that is ~${(floor * 30 / 1000).toFixed(0)}k input tokens, repeated.`);
console.log(`  Worst case with every contract and registry loaded: ~${floor + o + r} tokens.\n`);

const BUDGET = Number(process.env.HERALD_FLOOR_BUDGET || 2500);
if (floor > BUDGET) {
  console.error(`FAIL: floor ${floor} tok exceeds budget ${BUDGET} tok.`);
  console.error('Always-on files are charged against every turn. Cut, or move detail on-demand.');
  process.exit(1);
}
console.log(`OK: floor ${floor} tok is within budget ${BUDGET} tok.`);
