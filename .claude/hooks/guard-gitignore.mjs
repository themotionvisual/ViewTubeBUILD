#!/usr/bin/env node
/**
 * PostToolUse(Write|Edit) — warn when a just-written file is gitignored.
 *
 * This repo's .gitignore is deny-by-default (`/*` at line 2), so a new file in an
 * un-allow-listed tree is silently untracked: the commit succeeds and captures nothing.
 * Surfaced as additionalContext so the agent can `git add -f` or fix the allow-list.
 *
 * Never blocks and never throws — a broken guard must not break the session.
 */
import { execFileSync } from 'node:child_process';

const readStdin = async () => {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
};

try {
  const raw = await readStdin();
  const payload = raw.trim() ? JSON.parse(raw) : {};
  const file =
    payload?.tool_response?.filePath ??
    payload?.tool_input?.file_path ??
    payload?.tool_input?.notebook_path;

  if (file) {
    let ignoredBy = null;
    try {
      // -v prints "<gitignore>:<line>:<pattern>\t<path>"; non-zero exit = not ignored.
      ignoredBy = execFileSync('git', ['check-ignore', '-v', '--', file], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    } catch {
      ignoredBy = null;
    }

    if (ignoredBy) {
      const rule = ignoredBy.split('\t')[0];
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: 'PostToolUse',
            additionalContext:
              `GITIGNORE GUARD: ${file} is ignored by ${rule}. ` +
              `A plain \`git add\` will NOT stage it and the commit will silently capture nothing. ` +
              `Use \`git add -f\` for a one-off, or add an allow-list entry in .gitignore if this ` +
              `path should be tracked routinely.`,
          },
        }),
      );
    }
  }
} catch {
  // stay silent on any failure
}
process.exit(0);
