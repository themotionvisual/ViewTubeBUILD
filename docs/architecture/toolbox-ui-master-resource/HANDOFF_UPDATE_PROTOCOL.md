# ViewTube Toolbox UI Conversation Handoff / Update Protocol

Use this protocol after any conversation that materially changes the Toolbox, Subtoolbox, Studio Hub component, primitive, hierarchy, layout, responsive, state, certification, or related UI systems.

## 1. Audit the conversation

Review relevant code edits, commits, branches, PRs, merge state, screenshots, regressions, fixes, component/primitive/token/CSS/layout/mobile changes, states, accessibility, Reference Library work, tests, legacy code, architectural decisions, and implementation lessons. Ignore unrelated ViewTube work unless it materially affects Toolbox/UI authority.

## 2. Classify every finding

Use only: `CANONICAL`, `IMPLEMENTED`, `VERIFIED`, `MIGRATE`, `LEGACY COMPATIBILITY`, `EXCEPTION`, `PLANNED`, `SUPERSEDED`, `REMOVE`, `REGRESSION / OPEN ISSUE`.

Never promote a prototype, screenshot, temporary patch, or feature-local CSS rule to CANONICAL without explicit system-level acceptance.

## 3. Record code evidence

When available record repository, branch, PR, commit, merged-to-main state, files, components, primitives, selectors, tokens, recipes, tests, previous/new behavior, affected pages, desktop/mobile verification, open/closed verification, connected/disconnected verification, loading/empty/error verification, and LOW/MEDIUM/HIGH regression risk.

## 4. Check current authorities

Current production shell direction must be verified from code before editing documentation. At the time this protocol was created, the accepted conversation decision was Toolbox 56px / 28px title and Subtoolbox 44px / 22px title, with the separate Compact Subtoolbox shell superseded. Main may advance; inspect it before every new claim.

Level owns height, stroke, radius, shadow, typography scale, and structural spacing. Component type owns internal anatomy and behavior. Base rhythm is 4px. Connection/data states remain separate: `DISCONNECTED != EMPTY`, `DISCONNECTED != ERROR`, `DISCONNECTED != MISSING UI`.

## 5. Reference Library certification

Required chain:

`TOKENS -> CODED PRIMITIVE -> UI REFERENCE LIBRARY EXAMPLE -> PRODUCTION CONSUMER`

If code changed without the library, mark `REFERENCE LIBRARY UPDATE REQUIRED`. If the library outruns production, mark `REFERENCE ONLY / NOT YET PRODUCTIONIZED`. Mark `CERTIFIED` only when code/library behavior and required states/variants are actually tested.

## 6. Motion

Verify Toolbox, Subtoolbox, Widget, Dropdown, and other disclosure motion independently. Never assume 300ms or 600ms globally. If code and documentation disagree, record `MOTION AUTHORITY CONFLICT — REQUIRES RECONCILIATION`.

## 7. Update the living master

Append one row to the top Living Update Log, then update only the affected authority, component registry, decision log, page/tool status, certification ledger, and handoff sections. Preserve history; mark obsolete rules `SUPERSEDED` instead of silently deleting them.

## 8. Required handoff output

A. Important information found.  
B. Master document changes.  
C. Code/document alignment.  
D. UI Library alignment.  
E. Genuine unfinished work.  
F. Repository status.  
G. Compact paste-ready handoff block.

## Preservation rules

Inspect current main before repository claims or writes. Do not confuse PR state with main, prototypes with production, documentation completion with application migration, or feature-local CSS with system authority. Do not duplicate canonical primitives, silently reconcile conflicting geometry/motion, or remove working behavior merely to normalize appearance. Keep Widget/Editor/Analytics CSS ownership separate from Toolbox authority.