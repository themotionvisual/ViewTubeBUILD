import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const checker = fileURLToPath(new URL('../scripts/check-quarantine-integrity.mjs', import.meta.url));

function checkFixture(t, files) {
  const root = mkdtempSync(path.join(tmpdir(), 'viewtube-quarantine-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, '_quarantine'));
  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8' });
}

test('accepts canonical UI, archived references, and build-only artifacts', (t) => {
  const result = checkFixture(t, {
    'src/components/ui/button.tsx': 'export const Button = () => null;',
    '_quarantine/button copy.tsx': 'historical reference',
    'src/build/index.css.fullbak': 'generated build cache',
    'public/oauth-callback.html': '<!doctype html>',
    'public/worker.js': 'self.onmessage = () => {};',
  });
  assert.equal(result.status, 0, result.stderr);
});

for (const file of [
  'src/index.css.fullbak',
  'src/fix_imports.py',
  'ui/button.tsx',
  'public/Projects.tsx',
  'public/examples/sample.ts',
  'src/example.ts.bak',
  'src/.DS_Store',
]) {
  test(`rejects retired runtime artifact ${file}`, (t) => {
    const result = checkFixture(t, { [file]: 'retired artifact' });
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(file), result.stderr);
  });
}

test('rejects a runtime import of quarantined code', (t) => {
  const result = checkFixture(t, {
    'src/main.ts': 'import "../_quarantine/old.ts";',
    '_quarantine/old.ts': 'export {};',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Quarantine import violations/);
  assert.match(result.stderr, /src\/main.ts/);
});
