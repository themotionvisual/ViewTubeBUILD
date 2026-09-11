import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.viewtube/exchange');
const args = process.argv.slice(2);
const taskIndexArg = args.find((arg) => arg.startsWith('--task-index='));
const taskIndexPath = taskIndexArg ? path.resolve(taskIndexArg.slice('--task-index='.length)) : null;

const folders = ['missions', 'work-orders', 'receipts', 'decisions', 'artifacts', 'handoffs', 'conflicts'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function jsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(dir, name));
}

const records = [];
for (const folder of folders) {
  for (const file of jsonFiles(path.join(ROOT, folder))) {
    const data = readJson(file);
    records.push({ folder, file: path.relative(process.cwd(), file), data });
  }
}

const missions = new Map();
for (const record of records.filter((record) => record.folder === 'missions')) {
  missions.set(record.data.missionId, {
    mission: record.data,
    missionFile: record.file,
    workOrders: [], receipts: [], decisions: [], artifacts: [], handoffs: [], conflicts: []
  });
}

const bucketByFolder = {
  'work-orders': 'workOrders',
  receipts: 'receipts',
  decisions: 'decisions',
  artifacts: 'artifacts',
  handoffs: 'handoffs',
  conflicts: 'conflicts'
};

const orphanRecords = [];
for (const record of records.filter((record) => record.folder !== 'missions')) {
  const dossier = missions.get(record.data.missionId);
  if (!dossier) {
    orphanRecords.push({ file: record.file, missionId: record.data.missionId || null });
    continue;
  }
  dossier[bucketByFolder[record.folder]].push({ file: record.file, ...record.data });
}

let taskIndex = { supplied: false, exists: false, path: null, taskIdsFound: [] };
if (taskIndexPath) {
  taskIndex.supplied = true;
  taskIndex.path = taskIndexPath;
  taskIndex.exists = fs.existsSync(taskIndexPath);
  if (taskIndex.exists) {
    const text = fs.readFileSync(taskIndexPath, 'utf8');
    const ids = new Set(text.match(/vt-\d{4,}/gi) || []);
    taskIndex.taskIdsFound = [...ids].sort();
  }
}

const taskIdSet = new Set(taskIndex.taskIdsFound.map((id) => id.toLowerCase()));
const dossiers = [...missions.values()].map((dossier) => {
  const taskIds = Array.isArray(dossier.mission.taskIds) ? dossier.mission.taskIds : [];
  const taskRefs = taskIds.map((taskId) => ({
    taskId,
    presentInSuppliedTaskIndex: taskIndex.exists ? taskIdSet.has(taskId.toLowerCase()) : null
  }));
  return {
    missionId: dossier.mission.missionId,
    objective: dossier.mission.objective,
    state: dossier.mission.state,
    taskRefs,
    missionFile: dossier.missionFile,
    workOrders: dossier.workOrders.map((x) => x.file),
    decisions: dossier.decisions.map((x) => x.file),
    artifacts: dossier.artifacts.map((x) => x.file),
    handoffs: dossier.handoffs.map((x) => x.file),
    conflicts: dossier.conflicts.map((x) => x.file),
    receipts: dossier.receipts.map((x) => ({ file: x.file, status: x.status, limitations: x.limitations || [] }))
  };
});

const report = {
  schemaVersion: 'viewtube.crown-link-report.v1',
  generatedAt: new Date().toISOString(),
  readOnly: true,
  exchangeRoot: path.relative(process.cwd(), ROOT),
  taskIndex,
  totals: {
    missions: missions.size,
    records: records.length,
    orphanRecords: orphanRecords.length
  },
  dossiers,
  orphanRecords
};

console.log(JSON.stringify(report, null, 2));
