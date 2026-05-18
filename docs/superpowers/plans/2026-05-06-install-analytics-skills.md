# Analytics and Chart Skills Installation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install and verify the `vt-analytics-ops` skill within the ViewTube development environment.

**Architecture:** Utilize the `gemini skills` CLI to install the packaged `.skill` file into the workspace scope, followed by a manual reload and verification step to ensure the skills are correctly registered and available.

**Tech Stack:** Gemini CLI, Skill System.

---

### Task 1: Install vt-analytics-ops Skill

**Files:**
- Path: `/Users/cwb/Downloads/viewtube/viewtubeX/docs/skills/dist/vt-analytics-ops.skill`

- [ ] **Step 1: Install skill locally**

Run: `gemini skills install /Users/cwb/Downloads/viewtube/viewtubeX/docs/skills/dist/vt-analytics-ops.skill --scope workspace`

- [ ] **Step 2: Verify installation command success**

Run: `gemini skills list`
Expected: `vt-analytics-ops` appears in the list (user may need to reload first).

---

### Task 2: Reload and Final Verification

- [ ] **Step 1: Notify user for reload**

The user must manually run `/skills reload` in their interactive session to finalize the installation.

- [ ] **Step 2: Verify skill activation**

Once reloaded, verify:
Run: `/skills list`
Expected: `vt-analytics-ops` listed as active.
