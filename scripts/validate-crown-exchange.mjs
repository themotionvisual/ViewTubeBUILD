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
  if (data.schemaVersion !== 'viewtube.mission.v2') errors.push(`${file}: unsupported mission schemaVersion`);
  if (!data.missionId) errors.push(`${file}: missionId required`);
  if (!data.objective) errors.push(`${file}: objective required`);
  if (!Array.isArray(data.acceptance) || data.acceptance.length === 0) errors.push(`${file}: acceptance criteria required`);
  if (!data.authorization || typeof data.authorization !== 'object') errors.push(`${file}: authorization object required`);
  if (!['draft','approved-for-execution','executing','verification','complete','partial','blocked'].includes(data.state)) errors.push(`${file}: invalid mission state`);
  if (data.missionId) missions.set(data.missionId, data);
}

const kinds = [['work-order','work-orders'],['receipt','receipts'],['decision','decisions'],['artifact','artifacts'],['handoff','handoffs'],['conflict','conflicts']];
for (const [kind, dir] of kinds) {
  for (const file of filesIn(path.join(ROOT, dir))) {
    const data = readJson(file); if (!data) continue;
    if (!data.missionId) errors.push(`${file}: missionId required`);
    else if (!missions.has(data.missionId)) errors.push(`${file}: references unknown missionId ${data.missionId}`);

    if (kind === 'work-order') {
      if (data.schemaVersion !== 'viewtube.work-order.v1') errors.push(`${file}: unsupported work-order schemaVersion`);
      if (!data.executionId) errors.push(`${file}: executionId required`);
      if (!data.checkout || !data.baseRef || !data.baseSha || !data.headRef) errors.push(`${file}: executable work order requires checkout/baseRef/baseSha/headRef`);
      if (!Array.isArray(data.orderedSteps) || !data.orderedSteps.length) errors.push(`${file}: orderedSteps required`);
      if (!Array.isArray(data.testsRequired)) errors.push(`${file}: testsRequired array required`);
      const paths = new Map();
      for (const writer of data.writers || []) for (const p of writer.paths || []) {
        if (paths.has(p) && paths.get(p) !== writer.role) errors.push(`${file}: conflicting writer ownership for ${p}`);
        paths.set(p, writer.role);
      }
    }

    if (kind === 'receipt') {
      if (data.schemaVersion !== 'viewtube.receipt.v1') errors.push(`${file}: unsupported receipt schemaVersion`);
      if (!data.worker) errors.push(`${file}: worker required`);
      if (!Array.isArray(data.checks)) errors.push(`${file}: checks array required`);
      if (!Array.isArray(data.limitations)) errors.push(`${file}: limitations array required`);
      if (!['complete','partial','blocked'].includes(data.status)) errors.push(`${file}: receipt status must be complete|partial|blocked`);
    }

    if (kind === 'decision') {
      if (data.schemaVersion !== 'viewtube.decision.v1') errors.push(`${file}: unsupported decision schemaVersion`);
      if (!data.decisionId || !data.question) errors.push(`${file}: decisionId and question required`);
      if (!Array.isArray(data.evidence) || !data.evidence.length) errors.push(`${file}: decision evidence required`);
      if (!['proposed','accepted','rejected','needs-creator-decision'].includes(data.state)) errors.push(`${file}: invalid decision state`);
    }

    if (kind === 'artifact') {
      if (data.schemaVersion !== 'viewtube.artifact-record.v1') errors.push(`${file}: unsupported artifact schemaVersion`);
      if (!data.artifactId || !data.title || !data.type || !data.status || !data.source) errors.push(`${file}: artifactId/title/type/status/source required`);
      if (typeof data.verified !== 'boolean') errors.push(`${file}: artifact verified must be boolean`);
      if (typeof data.source === 'string' && !data.source.includes('://') && !fs.existsSync(path.resolve(data.source))) warnings.push(`${file}: local artifact source does not currently exist: ${data.source}`);
    }

    if (kind === 'handoff') {
      if (data.schemaVersion !== 'viewtube.handoff.v1') errors.push(`${file}: unsupported handoff schemaVersion`);
      if (!data.handoffId || !data.from || !data.to || !data.scope) errors.push(`${file}: handoffId/from/to/scope required`);
      if (!Array.isArray(data.requiredOutputs) || !data.requiredOutputs.length) errors.push(`${file}: requiredOutputs required`);
    }

    if (kind === 'conflict') {
      if (data.schemaVersion !== 'viewtube.conflict.v1') errors.push(`${file}: unsupported conflict schemaVersion`);
      if (!data.conflictId || !data.level || !data.topic) errors.push(`${file}: conflictId/level/topic required`);
      if (!['L0','L1','L2','L3'].includes(data.level)) errors.push(`${file}: conflict level must be L0|L1|L2|L3`);
      if (!['open','resolved','creator-decision-required'].includes(data.state)) errors.push(`${file}: invalid conflict state`);
    }
  }
}

console.log(`Crown Exchange validation: ${errors.length} error(s), ${warnings.length} warning(s), ${missions.size} mission(s)`);
for (const w of warnings) console.warn(`WARN ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
if (errors.length) process.exit(1);
