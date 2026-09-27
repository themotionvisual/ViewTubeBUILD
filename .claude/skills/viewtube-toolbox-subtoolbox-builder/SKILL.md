---
name: viewtube-toolbox-subtoolbox-builder
description: Build complete ViewTube Toolbox and SubToolbox creator tools for Studio Hub and Projects surfaces, including shell composition, primitives, responsive behavior, persistence, Project/ContentBuild integration, registration, accessibility, and interaction certification. Use for new or migrated ToolboxScaffold, SubToolbox, MiniSubToolbox, Studio Hub, Project Builder, Project Board, or project-page tools.
---

# Toolbox/SubToolbox Studio Tool Builder

Build a creator tool that belongs to ViewTube's Studio Hub or Projects experience. Start from the user's workflow and integrate the tool into the canonical shell, palette, component, project/content, asset, Brain, and handoff systems. A tool is complete only when it mounts, persists safely, behaves responsively, and passes real interaction verification.

## First principles

- The shell is a system contract, not feature decoration.
- Standardize hierarchy, geometry, palette inheritance, states, motion, accessibility, and registration; keep the tool's interior and creator job distinctive.
- Current executable tokens, components, tests, registries, and verified runtime behavior outrank old screenshots, prototype HTML, historical geometry, and donor branches.
- Extend or combine an existing owner before creating a new tool, store, palette, shell, route, or component family.
- Keep `channelId + projectId + contentBuildId` continuous when the tool works on project content. Project is the planning container; ContentBuild is durable content identity; Asset Engine/Vault owns artifacts and lineage.

## Mandatory reading

Read `AGENTS.md`, `docs/governance/DOCUMENTATION.md`, `docs/registry.json`, `docs/governance/CONVERGENCE.md`, `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`, `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md`, `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`, and `references/authority-and-certification.md`. Read the Brain, Asset, Editor, YouTube, or analytics authority when the tool crosses those boundaries. Use `references/tool-brief.md` as the planning output shape.

## Delivery workflow

### 1. Define the creator task

Identify the surface (Studio Hub, Project Builder, Project Board/Calendar, super-tool, or route), scope, selected project/content, primary action/output, supporting actions, handoffs, persistence, and completion signal. Search current tool mounts, routes, page/super-tool registries, guide metadata, imports, active plans, and existing component families. Record Existing Work Checked and choose extend, combine, merge, generalize, adapt, or create-review.

### 2. Select the structural owner

Use the current production hierarchy: Toolbox T0 for a top-level tool, SubToolbox T1 for a direct section or peer action, L1/L2 components for interior structure, and MiniSubToolbox only where the current primitive contract defines it. Configuration-driven internal tools use their shared workbench shell; bespoke super-tools use their shared shell. Never create a second hero, compact shell, or page-local shell geometry.

### 3. Adopt production geometry and palette

Read current `src/components/subtoolbox/tokens.ts`, `src/components/Toolbox.tsx`, `src/styles/toolbox-system.css`, `src/styles/subtoolbox-system.css`, and `src/styles/toolboxPalette.ts`. Use executable token values for T0/T1/L1/L2 geometry and production mobile overrides. Allocate palette by `paletteIndex` and inherit pair A/pair B from the owning SubToolbox. Descendants do not choose arbitrary palette pairs. Portaled menus, popovers, and overlays must bridge inherited variables onto their detached root.

### 4. Compose with canonical primitives

Use the existing field, textarea, dropdown/select, split-left action, button, toggle, radio, checkbox, tag, progress, upload, output card, state panel, scroll area, media selector, and asset module contracts. Introduce a new primitive only when the production need is reusable and the Component Library can demonstrate it. Do not copy CSS from a prototype or override shared geometry with `!important`.

### 5. Build the workflow interior

Make the tool's signature interaction do real work: select, compare, plan, generate, edit, organize, analyze, package, schedule, or hand off. Keep deterministic computation in code and route AI reasoning through BrainRuntime. Route generated media through Video Director and Asset Engine/Vault. Route YouTube and external writes through server-owned typed services with approval/idempotency/audit/rollback. Use ActionPacket/Handoff/ToolReceipt for cross-tool transport.

### 6. Handle persistence and state

Separate UI state, draft persistence, and durable product state. Creator-entered drafts may use a versioned, debounced, normalized, quota-safe local draft store when appropriate. Projects, ContentBuilds, assets, package data, analytics, auth, and AI learning use their canonical owners. Implement idle, hover, focus-visible, active, selected, disabled, loading, ready, empty, filtered-zero, blocked, disconnected, connecting, reconnect-required, stale, error, and success states as applicable. Disconnected means capability/data is unavailable; it does not mean missing UI.

### 7. Make responsive behavior intentional

Use intrinsic composition on mobile and a two-column/structured composition on desktop only when the workflow supports it. Keep editable text at least 16px on touch/mobile, preserve pinch zoom, protect title/header allocation, allow natural wrapping without ellipsis, preserve square split-left rails, use explicit media aspect ratios, and bound body scroll. Test width/height changes independently. Fix the highest shared CSS authority rather than adding a local patch.

### 8. Register and mount

For Studio Hub, mount through the current hub owner with a stable anchor and sequential palette index. For Projects, integrate with Project Builder/Board/Calendar ownership rather than reviving competing top-level tools. For a route, register `AppRoutes`, `pageRegistry`, and any super-tool registry required by the runtime. Add guide/quick-action metadata where creator-facing conventions require it. Keep lazy boundaries and error recovery intact. Treat orphan exemptions as temporary, named, and shrinking.

### 9. Certify real use

Run focused component/interaction tests, `npx tsc -b`, relevant app governance tests, build, browser smoke, responsive captures, and interaction proofs for collapse, dropdown selection, palette order, focus, header actions, first-child clearance, mobile keyboard behavior, uploads/media, persistence normalization, and disconnected/error recovery. Update the Toolbox master, Component Library, Project/Asset authority, user guide, registry, and verification receipt when applicable. Source presence or a static catalog example is not verification.

## Projects integration rules

The Projects product is organized around Project Builder, Project Board with BOARD/CALENDAR, and Storyboard Studio. Builder owns channel/project scope, identity, creation, brief, package fields, tasks/goals, packaging/thumbnail, and scoped ContentBuild/Asset Engine handoffs. Board owns board/calendar navigation, lane/status movement, and schedule context. Do not recreate a separate Project Studio, Publishing Schedule, Content Asset Engine, or project editor when the capability belongs inside these owners.

A project-page tool must preserve the same ContentBuild across specialist handoffs and must not replace Vault or Asset Engine with URL-only media fields. A tool that creates durable assets must preserve asset IDs, versions, variants, lineage, provenance, selection/finalization, and later outcomes.

## Interaction and CSS guardrails

- Use the canonical four-direction collapse control and isolate its hitbox from help/header actions.
- Keep painted clearance equal after borders, shadows, focus outlines, and dividers.
- Treat custom dropdowns as controlled components: trigger reflects parent value, selection dispatches once, and portaled menus preserve geometry/palette/focus.
- Use wrapper sizing when shared input selectors force width or uppercase styling; restore normal prose styles explicitly.
- Use Tight Reveal upload anatomy instead of generic dashed dropzones.
- Keep headers/titles out of scroll regions and avoid nested scroll unless the workflow requires it.
- Preserve reduced motion and meaningful non-color indicators.

## Handoff format

Record tool identity, creator job, surface/mount, scope IDs, structural level, palette allocation, reused primitives, states, responsive behavior, persistence, handoffs, registrations, changed files, tests, browser evidence, visual certification status, authority updates, rollback, and remaining risks.
