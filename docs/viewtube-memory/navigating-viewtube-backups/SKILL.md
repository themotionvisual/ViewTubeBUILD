---
name: navigating-viewtube-backups
description: Handle "src copy" and .bak files when the user asks to apply "written but not applied" code.
---

## When to Use
- The user asks to "apply code that was written but not applied".
- You see directories like `src copy/` or `src_copy/`.
- You see files ending in `.bak`, `.after.bak`, or `.fullbak`.
- The codebase seems "contradictory" or out of sync with recent plans.

## Procedure

1.  **Identify the Source of Truth**:
    - Assume `src/` is the active codebase.
    - Assume `src copy/` or similar is a backup or a set of "proposals" from a previous agent or session.

2.  **Locate "Written but Not Applied" Code**:
    - If the user refers to unapplied code, search both `src/` and `src copy/` for the relevant logic.
    - Use `diff` to compare the two:
      ```bash
      diff -r "src/services" "src copy/services"
      ```
    - Check `GEMINI.md` or any `.md` plan files for code blocks that might not have been pasted into the actual files yet.

3.  **Apply Surgically**:
    - NEVER overwrite `src/` with `src copy/` entirely. This can revert bugfixes.
    - Use the `diff` output to identify specific functions or lines that are present in the backup/copy but missing in the active `src/`.
    - Apply these changes one-by-one using the `replace` tool.

4.  **Handle Corrupted Backups**:
    - Be aware that files in `src copy/` or `.bak` files might be corrupted (e.g., truncated hooks, orphaned brackets).
    - If a "proposal" from a backup causes a build error, immediately run `npm run build` or `tsc -b` to find the exact syntax error.

## Pitfalls and Fixes
- **Reverting Progress**: Applying an entire file from `src copy/` might overwrite a recent fix for API reactivity or lifetime sync.
  - **Fix**: Compare the logic. If `src/` has a fix (e.g., `originalData` preservation) that `src copy/` lacks, merge them instead of overwriting.
- **Agent Confusion**: A previous agent might have left `src copy/` in a half-finished state.
  - **Fix**: Treat `src copy/` as a *hint*, not a mandate. Verify the logic makes sense before applying.

## Verification
- After applying code from a backup, run the project build:
  ```bash
  npm run build
  ```
- Check the relevant UI (e.g., "Data Coverage Reference") to ensure the "unapplied" feature is now visible and working.
