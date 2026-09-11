import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.viewtube/exchange');
const REQUIRED = ['missions','work-orders','receipts','decisions','artifacts','handoffs','conflicts'];
const errors = [];
const warnings = [];

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { errors.push(`${file}: invalid JSON (${error.message})`); return null; }
}

function filesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => name.endsWith('.json')).map(name => path.join(dir, name));
}

for (const dir of REQUIRED) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) warnings.push(`Missing optional exchange directory: ${dir}`);
}

const missions = new Map();
for (const file of filesIn(path.join(ROOT, 'missions'))) {
  const data = readJson(file); if (!data) continue;
  if (!data.missionId) errors.push(`${file}: missionId required`);
  if (!data.objective) errors.push(`${file}: objective required`);
  if (!Array.isArray(data.acceptance) || data.acceptance.length === 0) errors.push(`${file}: acceptance criteria required`);
  if (!data.authorization || typeof data.authorization !== 'object') errors.push(`${file}: authorization object required`);
  if (data.missionId) missions.set(data.missionId, data);
}

for (const [kind, dir] of [['work-order','work-orders'],['receipt','receipts'],['decision','decisions'],['artifact','artifacts'],['handoff','handoffs'],['conflict','conflicts']]) {
  for (const file of filesIn(path.join(ROOT, dir))) {
    const data = readJson(file); if (!data) continue;
    if (!data.missionId) errors.push(`${file}: missionId required`);
    else if (!missions.has(data.missionId)) errors.push(`${file}: references unknown missionId ${data.missionId}`);
    if (kind === 'work-order') {
      if (!data.checkout || !data.baseRef || !data.baseSha || !data.headRef) errors.push(`${file}: executable work order requires checkout/baseRef/baseSha/headRef`);
      const paths = new Map();
      for (const writer of data.writers || []) for (const p of writer.paths || []) {
        if (paths.has(p) && paths.get(p) !== writer.role) errors.push(`${file}: conflicting writer ownership for ${p}`);
        paths.set(p, writer.role);
      }
    }
    if (kind === 'receipt' && !['complete','partial','blocked'].includes(data.status)) errors.push(`${file}: receipt status must be complete|partial|blocked`);
  }
}

console.log(`Crown Exchange validation: ${errors.length} error(s), ${warnings.length} warning(s), ${missions.size} mission(s)`);
for (const w of warnings) console.warn(`WARN ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
if (errors.length) process.exit(1);
