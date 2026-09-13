# Subtoolbox Primitive System V1

> **Authority notice (2026-09-13):** Canonical cross-system rules now live in [`VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`](./VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md). This file documents the Subtoolbox implementation specialization. The Master Resource supersedes conflicting historical geometry/motion/state guidance after reconciliation with canonical code.

## Purpose

Subtoolboxes use one shell, one token source, typed primitives, layout recipes, a migration registry and automated certification. Feature surfaces own content and behavior, not frame geometry or interaction styling.

## Authority

- `src/components/subtoolbox/tokens.ts`: geometry, typography, spacing and motion.
- `src/components/Toolbox.tsx`: canonical Toolbox/Subtoolbox shell behavior.
- `src/components/subtoolbox/SubToolboxPrimitives.tsx`: fields, actions, surfaces and states.
- `src/components/subtoolbox/SubToolboxLayouts.tsx`: stack, grid, action and section composition.
- `src/components/subtoolbox/registry.ts`: supported recipes and migration waves.
- `src/styles/subtoolbox-system.css`: visual states and container responsiveness.
- `src/components/ToolboxUIReferenceLibrary.tsx`: visual certification surface.

Compatibility APIs may re-export canonical primitives but must not define a second geometry contract.

## Accepted hierarchy

Use the Master Resource semantic mapping:

| Level | Primary use | Stroke | Radius | Shadow | Height | Type |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| T0 | Main Toolbox | 5px | 16px | 10px | 80px | 26px |
| T1 | Standard Subtoolbox / peer action | 4px | 12px | 6px | 56px | 20px |
| T1 Compact | Compact Subtoolbox | 3px | 10px | 4px | 44px | 17-20px |
| T2 | Standard interior peer | 3px | 8px | 4px | 48px | ~14px |
| T3 | Dense interior peer | 2px | 6px | 2px | 32px | 9-10px |

Level owns stroke/radius/height/shadow. Component anatomy does not silently thin geometry.

## Motion reconciliation

Historical versions of this file specified 300ms collapse. That blanket rule is **SUPERSEDED**. Current accepted Toolbox direction is 600ms ease-out for Toolbox/Subtoolbox/module/disclosure open-close motion, with faster 150-300ms micro-interactions and reduced-motion support. Where production tokens still use 300ms for shell motion, treat that as explicit reconciliation work rather than a second accepted standard.

## Primitive rules

- Split-left rail width equals row height; divider equals outer level stroke.
- Analytics-style split-left dropdown splits only the left rail; label sits above arrow; right value region is uninterrupted.
- Checkbox/radio/switch/toggle controls are loose by default.
- Tight Reveal #05 is canonical upload anatomy; no dashed legacy treatment and no restored legacy black outer frame.
- State panels preserve the tool shell for loading/empty/disconnected/stale/error states.
- Connection state and data state are independent.
- All interactive primitives satisfy the Master Resource accessibility contract.

## Certification gates

- one geometry/token authority
- permanent/continuous structural dividers where specified
- no black fallback shadow replacing family-derived shadow
- no feature-local shell stroke/radius/shadow/title/collapse authority
- fields/actions/states use registered primitives
- narrow containers stack without horizontal overflow
- headers never scroll
- content remains bounded
- default/hover/focus-visible/active/selected/disabled/loading/empty/blocked/disconnected/stale/error states remain usable and accessible
- Reference Library uses production exports/tokens
- focused tests, CSS parsing and production build pass
- desktop/mobile/open/closed state snapshots cover regression-prone anatomy

## Migration rule

Merge one coherent migration wave at a time. Do not combine visual migration with data-source changes, registry-ID changes, feature removal or unrelated business-logic rewrites. Remove compatibility CSS only after all active consumers have migrated.

## Status

Historical migration-wave completion claims in older revisions are retained in git history. Current cross-page status and certification belong in the Master Resource ledger so this implementation reference does not drift into a competing project-status authority.