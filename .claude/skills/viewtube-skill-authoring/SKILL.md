---
name: viewtube-skill-authoring
description: Write and maintain ViewTube SKILL.md packages that are concise, source-grounded, and compatible with the current repository.
---

# ViewTube skill authoring

Before writing a skill, inspect existing entries in `.claude/skills` and the current architecture documents. Reuse an existing owner when possible.

A new skill should define its trigger, responsibility, non-goals, required source files, procedure, verification steps, result format, and handoff target. Keep large background material in references instead of copying it into the main skill file.

For Crown-aware skills, identify which shared record is consumed or produced: mission, work order, receipt, decision, or artifact record. Avoid overlapping authority with an existing skill.
