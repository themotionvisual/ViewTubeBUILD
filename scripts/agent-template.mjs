#!/usr/bin/env node
/**
 * agent-template — manage the response and planning template.
 *
 * The template is data (agent/template.json). Everything readable is generated from it,
 * so the system can be edited without rewriting prose in five places.
 *
 *   list                        show all sections
 *   render                      regenerate agent/TEMPLATE.md
 *   propose <file.json>         an agent suggests a new section (goes to agent/proposals/)
 *   propose --new               print the proposal shape to fill in
 *   pending                     show proposals awaiting approval
 *   approve <id> [--optional]   accept a proposal into the template
 *   reject <id> <reason>        decline it, keeping the record
 *   remove <id>                 take a section out of the template
 *   check                       template valid and TEMPLATE.md current
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = 'agent/template.json';
const OUT = 'agent/TEMPLATE.md';
const PROPOSALS = 'agent/proposals';
const abs = (...p) => path.join(ROOT, ...p);
const die = (m) => { console.error(m); process.exit(1); };
const load = () => JSON.parse(fs.readFileSync(abs(SRC), 'utf8'));
const save = (t) => fs.writeFileSync(abs(SRC), JSON.stringify(t, null, 2) + '\n');
const proposals = () =>
  fs.existsSync(abs(PROPOSALS))
    ? fs.readdirSync(abs(PROPOSALS)).filter((f) => f.endsWith('.json'))
        .map((f) => ({ file: f, ...JSON.parse(fs.readFileSync(abs(PROPOSALS, f), 'utf8')) }))
    : [];

// ---------------------------------------------------------------- render
function render() {
  const t = load();
  const req = (s) => `| \`${s.label}\` | ${s.desc} |`;
  const opt = (s) => `| \`${s.label}\` | **when** ${s.when} | ${s.desc} |`;
  const md = [
    '# Response and planning template',
    '',
    '<!-- GENERATED from agent/template.json — edit that, then `npm run template:render` -->',
    '',
    '## Rules',
    '',
    ...t.rules.map((r, i) => `${i + 1}. ${r}`),
    '',
    '## Every response includes',
    '',
    '| Section | What it says |',
    '|---|---|',
    ...t.response.required.map(req),
    '',
    '```',
    ...t.response.required.map((s) => `${s.label.padEnd(11)} ${s.example ?? ''}`.trimEnd()),
    '```',
    '',
    '## Response sections used only when they apply',
    '',
    'One line each, no heading, omitted entirely when not true.',
    '',
    '| Section | Trigger | What it says |',
    '|---|---|---|',
    ...t.response.optional.map(opt),
    '',
    '## Every plan file includes',
    '',
    '| Section | What it says |',
    '|---|---|',
    ...t.plan.required.map(req),
    '',
    '## Plan sections used only when they apply',
    '',
    '| Section | Trigger | What it says |',
    '|---|---|---|',
    ...t.plan.optional.map(opt),
    '',
    '## Suggesting a new section',
    '',
    'Agents may propose sections; they are added only with the owner\'s approval.',
    '',
    '```bash',
    'node scripts/agent-template.mjs propose --new   # print the shape',
    'node scripts/agent-template.mjs pending         # what is waiting',
    'node scripts/agent-template.mjs approve <id>    # owner accepts',
    'node scripts/agent-template.mjs reject <id> "reason"',
    '```',
    '',
  ].join('\n');
  const prev = fs.existsSync(abs(OUT)) ? fs.readFileSync(abs(OUT), 'utf8') : null;
  if (prev === md) { console.log('template: TEMPLATE.md already current'); return md; }
  fs.writeFileSync(abs(OUT), md);
  console.log(`template: wrote ${OUT}`);
  return md;
}

// ------------------------------------------------------------------ list
function list() {
  const t = load();
  const show = (title, arr, withWhen) => {
    console.log(`\n${title}`);
    for (const s of arr) {
      const tag = s.integrates?.length ? `  [${s.integrates.join(', ')}]` : '';
      console.log(`  ${s.id.padEnd(14)} ${s.label.padEnd(12)}${withWhen ? ` when ${s.when}` : ''}${tag}`);
    }
  };
  show('RESPONSE — always', t.response.required, false);
  show('RESPONSE — when it applies', t.response.optional, true);
  show('PLAN — always', t.plan.required, false);
  show('PLAN — when it applies', t.plan.optional, true);
  const p = proposals().filter((x) => x.state === 'pending');
  if (p.length) console.log(`\n${p.length} proposal(s) awaiting approval — \`agent-template pending\``);
}

// --------------------------------------------------------------- propose
const SHAPE = {
  id: 'short-kebab-id',
  label: 'LABEL',
  target: 'response',
  kind: 'optional',
  when: 'the condition that makes this worth printing',
  desc: 'one line: what this section says',
  why: 'what went wrong without it — a concrete observed failure, not a hunch',
  example: 'what it looks like in a real answer',
};

function propose(arg) {
  if (!arg || arg === '--new') {
    console.log('Write this to a file, then: agent-template propose <file.json>\n');
    console.log(JSON.stringify(SHAPE, null, 2));
    return;
  }
  if (!fs.existsSync(arg)) die(`no such file: ${arg}`);
  const p = JSON.parse(fs.readFileSync(arg, 'utf8'));
  for (const k of ['id', 'label', 'target', 'kind', 'desc', 'why']) if (!p[k]) die(`proposal missing \`${k}\``);
  if (!['response', 'plan'].includes(p.target)) die('target must be response or plan');
  if (!['required', 'optional'].includes(p.kind)) die('kind must be required or optional');
  if (p.kind === 'optional' && !p.when) die('an optional section needs a `when`');
  const t0 = load();
  const taken = [...t0[p.target].required, ...t0[p.target].optional].map((s) => s.id);
  if (taken.includes(p.id)) die(`\`${p.id}\` already exists in ${p.target}`);
  fs.mkdirSync(abs(PROPOSALS), { recursive: true });
  const rec = { ...p, state: 'pending', proposedAt: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(abs(PROPOSALS, `${p.id}.json`), JSON.stringify(rec, null, 2) + '\n');
  console.log(`proposed \`${p.id}\` — awaiting approval.`);
  console.log(`  approve: node scripts/agent-template.mjs approve ${p.id}`);
  console.log(`  reject:  node scripts/agent-template.mjs reject ${p.id} "reason"`);
}

function pending() {
  const p = proposals().filter((x) => x.state === 'pending');
  if (!p.length) { console.log('no proposals awaiting approval'); return; }
  for (const x of p) {
    console.log(`\n${x.id}  →  ${x.target}.${x.kind}   [${x.label}]`);
    console.log(`  says:  ${x.desc}`);
    if (x.when) console.log(`  when:  ${x.when}`);
    console.log(`  why:   ${x.why}`);
    if (x.example) console.log(`  eg:    ${x.example}`);
  }
  console.log('');
}

function approve(id, flags) {
  if (!id) die('usage: agent-template approve <id> [--required|--optional]');
  const f = abs(PROPOSALS, `${id}.json`);
  if (!fs.existsSync(f)) die(`no proposal \`${id}\``);
  const p = JSON.parse(fs.readFileSync(f, 'utf8'));
  const kind = flags.includes('--required') ? 'required' : flags.includes('--optional') ? 'optional' : p.kind;
  const t = load();
  const entry = { id: p.id, label: p.label, desc: p.desc };
  if (kind === 'optional') entry.when = p.when;
  if (p.example) entry.example = p.example;
  if (p.integrates) entry.integrates = p.integrates;
  t[p.target][kind].push(entry);
  save(t);
  fs.writeFileSync(f, JSON.stringify({ ...p, state: 'approved', approvedAt: new Date().toISOString().slice(0, 10), kind }, null, 2) + '\n');
  console.log(`approved \`${id}\` into ${p.target}.${kind}`);
  render();
}

function reject(id, reason) {
  if (!id || !reason) die('usage: agent-template reject <id> "reason"');
  const f = abs(PROPOSALS, `${id}.json`);
  if (!fs.existsSync(f)) die(`no proposal \`${id}\``);
  const p = JSON.parse(fs.readFileSync(f, 'utf8'));
  fs.writeFileSync(f, JSON.stringify({ ...p, state: 'rejected', rejectedAt: new Date().toISOString().slice(0, 10), reason }, null, 2) + '\n');
  console.log(`rejected \`${id}\` — record kept so it is not re-proposed`);
}

function remove(id) {
  if (!id) die('usage: agent-template remove <id>');
  const t = load(); let found = false;
  for (const target of ['response', 'plan']) for (const kind of ['required', 'optional']) {
    const i = t[target][kind].findIndex((s) => s.id === id);
    if (i !== -1) { t[target][kind].splice(i, 1); found = true; console.log(`removed \`${id}\` from ${target}.${kind}`); }
  }
  if (!found) die(`no section \`${id}\``);
  save(t); render();
}

function check() {
  const t = load();
  const problems = [];
  // Ids are unique within a target, not globally: a response section and a plan section
  // may share a name (both have `done-when`, and they mean the same thing in each place).
  for (const target of ['response', 'plan']) {
    const ids = [...t[target].required, ...t[target].optional].map((s) => s.id);
    const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
    if (dupes.length) problems.push(`duplicate ids in ${target}: ${[...new Set(dupes)].join(', ')}`);
  }
  for (const target of ['response', 'plan']) {
    for (const s of t[target].optional) if (!s.when) problems.push(`${target}.${s.id}: optional section has no \`when\``);
    for (const s of [...t[target].required, ...t[target].optional]) {
      if (!s.label) problems.push(`${target}.${s.id}: no label`);
      if (!s.desc) problems.push(`${target}.${s.id}: no desc`);
    }
  }
  const cur = fs.existsSync(abs(OUT)) ? fs.readFileSync(abs(OUT), 'utf8') : null;
  const want = (() => { const o = console.log; console.log = () => {}; const m = renderString(t); console.log = o; return m; })();
  if (cur !== want) problems.push(`${OUT}: stale — run \`npm run template:render\``);
  if (problems.length) { console.error(`template: ${problems.length} problem(s)\n`); for (const p of problems) console.error(`  ${p}`); process.exit(1); }
  console.log(`template: valid — ${t.response.required.length}+${t.response.optional.length} response, ${t.plan.required.length}+${t.plan.optional.length} plan sections`);
}
function renderString() { const o = fs.writeFileSync; let captured = null; fs.writeFileSync = (p, d) => { if (String(p).endsWith('TEMPLATE.md')) captured = d; else o(p, d); }; const m = render(); fs.writeFileSync = o; return captured ?? m; }

const [cmd, ...args] = process.argv.slice(2);
switch (cmd) {
  case 'list': list(); break;
  case 'render': render(); break;
  case 'propose': propose(args[0]); break;
  case 'pending': pending(); break;
  case 'approve': approve(args[0], args.slice(1)); break;
  case 'reject': reject(args[0], args.slice(1).join(' ')); break;
  case 'remove': remove(args[0]); break;
  case 'check': check(); break;
  default:
    console.log('usage: agent-template <list|render|propose|pending|approve|reject|remove|check>');
    process.exit(cmd ? 1 : 0);
}
