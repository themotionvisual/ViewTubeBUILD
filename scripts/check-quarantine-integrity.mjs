import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const QUARANTINE_DIR = path.join(ROOT, '_quarantine');
const SELF_PATH = fileURLToPath(import.meta.url);
const ACTIVE_DIRS = ['src', 'public', 'server', 'scripts'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const importViolations = [];
for (const folder of ACTIVE_DIRS) {
  const files = walk(path.join(ROOT, folder));
  for (const file of files) {
    if (file === SELF_PATH) continue;
    const ext = path.extname(file);
    if (!SOURCE_EXTENSIONS.has(ext)) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes('_quarantine/') || text.includes('../_quarantine/') || text.includes('/_quarantine/')) {
      importViolations.push(path.relative(ROOT, file));
    }
  }
}

const duplicateSignals = [];
const badNamePatterns = [/\bcopy\b/i, /\.bak$/i, /\.DS_Store$/i];
for (const folder of ACTIVE_DIRS) {
  const files = walk(path.join(ROOT, folder));
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (rel.startsWith('_quarantine/')) continue;
    if (badNamePatterns.some((re) => re.test(path.basename(rel))) || rel.includes('BACK VRSNS')) {
      duplicateSignals.push(rel);
    }
  }
}

if (!fs.existsSync(QUARANTINE_DIR)) {
  console.error('Missing _quarantine directory. Expected quarantine to exist for archived variants.');
  process.exit(1);
}

if (importViolations.length || duplicateSignals.length) {
  if (importViolations.length) {
    console.error('\nQuarantine import violations:');
    for (const file of importViolations) console.error(`- ${file}`);
  }

  if (duplicateSignals.length) {
    console.error('\nLegacy artifact patterns still present in active paths:');
    for (const file of duplicateSignals) console.error(`- ${file}`);
  }

  process.exit(1);
}

console.log('Quarantine integrity check passed: no active imports from _quarantine and no copy/bak/.DS_Store artifacts in active paths.');
