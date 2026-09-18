#!/usr/bin/env node
/**
 * herald-doctor — is the conversation system actually on?
 *
 * Every other check validates content. This one validates that the machinery is wired:
 * hooks present and parseable, settings valid, commands installed, targets in sync,
 * registries current, gates runnable. Run it after changing the system, and when an agent
 * reports the contract "isn't working".
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const has = (p) => fs.existsSync(path.join(ROOT, p));
const read = (p) => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return null; } };

const results = [];
const ok = (n, d = '') => results.push({ s: 'ok', n, d });
const warn = (n, d) => results.push({ s: 'warn', n, d });
const bad = (n, d) => results.push({ s: 'fail', n, d });

// --- sources
for (const f of ['agent/AGENTS.md', 'agent/targets.json', 'agent/START-PROMPT.md',
                 'agent/contracts/herald-out.md', 'agent/contracts/herald-artifacts.md']) {
  has(f) ? ok(f) : bad(f, 'missing source file');
}
const skills = has('agent/skills') ? fs.readdirSync(path.join(ROOT, 'agent/skills')) : [];
skills.length ? ok('agent/skills', `${skills.length} skills`) : bad('agent/skills', 'no skills');

// --- generated targets
for (const f of ['AGENTS.md', 'GEMINI.md', '.github/copilot-instructions.md', '.cursor/rules/viewtube.mdc']) {
  has(f) ? ok(f) : bad(f, 'target missing — run `npm run agent:sync`');
}

// --- activation surfaces
const settings = read('.claude/settings.json');
if (!settings) bad('.claude/settings.json', 'no hooks configured — the contract is self-reported only');
else {
  try {
    const s = JSON.parse(settings);
    const post = s.hooks?.PostToolUse?.length ?? 0;
    const stop = s.hooks?.Stop?.length ?? 0;
    post ? ok('hook: PostToolUse', 'gitignore guard') : warn('hook: PostToolUse', 'not configured');
    stop ? ok('hook: Stop', 'ledger append') : warn('hook: Stop', 'not configured');
    (s.permissions?.allow?.length ?? 0) ? ok('permissions allowlist', `${s.permissions.allow.length} rules`)
      : warn('permissions allowlist', 'every read-only call will prompt');
  } catch (e) { bad('.claude/settings.json', `invalid JSON: ${e.message}`); }
}
for (const [f, label] of [['.claude/hooks/guard-gitignore.mjs', 'hook script: gitignore guard'],
                          ['.claude/hooks/ledger-append.mjs', 'hook script: ledger'],
                          ['.claude/commands/vt.md', 'slash command: /vt']]) {
  has(f) ? ok(label) : bad(label, `${f} missing`);
}

// --- the gitignore trap
const probe = ['agent/x.md', '.claude/settings.json', 'docs/herald/x.md', 'AGENTS.md'];
const ignored = probe.filter((p) => {
  try { execFileSync('git', ['check-ignore', '-q', '--', p], { stdio: 'ignore' }); return true; } catch { return false; }
});
ignored.length ? bad('gitignore allow-list', `${ignored.join(', ')} would be silently untracked`)
               : ok('gitignore allow-list', 'agent paths track normally');

// --- gates
for (const t of ['check:agent-sync', 'check:artifacts', 'check:log', 'check:cost', 'check:template']) {
  try { execFileSync('npm', ['run', t, '--silent'], { cwd: ROOT, stdio: 'ignore' }); ok(`gate: ${t}`); }
  catch { bad(`gate: ${t}`, 'failing — run it to see why'); }
}

// --- report
const icon = { ok: '  ✓', warn: '  !', fail: '  ✗' };
console.log('herald-doctor\n');
for (const r of results) console.log(`${icon[r.s]} ${r.n}${r.d ? `  — ${r.d}` : ''}`);
const fails = results.filter((r) => r.s === 'fail').length;
const warns = results.filter((r) => r.s === 'warn').length;
console.log(`\n${results.length - fails - warns} ok · ${warns} warning(s) · ${fails} failure(s)`);
if (fails) {
  console.log('\nNote: hooks only load when Claude Code sees settings.json at session start.');
  console.log('If the files exist but hooks never fire, open /hooks once or restart.');
}
process.exit(fails ? 1 : 0);
