# Toolbox UI Master Resource — 50 Improvement Ideas

**Status:** REFERENCE IDEA BACKLOG — not current authority  
**Current authority:** `../../../architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`  
**Wave 3 note (2026-09-24):** many authority/registry/mobile/certification ideas have since been implemented or absorbed. Keep this list for future improvement discovery; verify every item before treating it as open work.

1. Create a one-page executive authority map: Code → Reference Library → Master Resource → Feature Consumers → Historical Prototypes.
2. Adopt one canonical level naming scheme and publish aliases for historical names.
3. Separate structural hierarchy levels from control size variants.
4. Add one token matrix for height, stroke, radius, shadow, type, icon, padding and gap.
5. Add a machine-readable appendix mirroring production token names exactly.
6. Add a `verified against main` date and commit SHA beside code-authority claims.
7. Add semantic document versioning: major rule / minor primitive / patch clarification.
8. Add a page-one summary of changes since the previous Master Resource.
9. Maintain a contradiction ledger for unresolved authority conflicts.
10. Standardize statuses: PROPOSED, DESIGNED, CODED, CERTIFIED, MIGRATING, CANONICAL, SUPERSEDED, REMOVED.
11. Add a component certification scorecard for code, library, mobile, accessibility, states and regression coverage.
12. Maintain one complete component registry instead of scattering status through prose.
13. Give every primitive a stable canonical ID.
14. Give every layout recipe a stable canonical ID.
15. Record exact repository paths for primitive, CSS, tokens, tests and certification examples.
16. Add known-consumer lists before changing shared primitives.
17. Add replacement fields for every legacy/superseded primitive.
18. Mark historical prototype sections `DO NOT USE FOR NEW WORK`.
19. Add a prototype-promotion checklist: prototype → token contract → React primitive → Reference Library → tests → Master Resource.
20. Add a deprecation checklist that blocks deletion until consumers are verified.
21. Add a visual hierarchy diagram for Toolbox → Subtoolbox → component → control.
22. Add a grid cookbook for stack, 2/3/4 column, auto-fit, split, media/details, metrics and actions.
23. Publish exact responsive breakpoints and behavior at each breakpoint.
24. Add a dedicated mobile certification page.
25. Define when horizontal scrolling is allowed versus semantic mobile redesign.
26. Add an overflow matrix for headers, bodies, tables, notes, tags, menus and canvases.
27. Add a focus-state matrix for every interactive family.
28. Add keyboard behavior for dropdowns, toggles, radios, sliders, steppers and disclosures.
29. Add minimum touch-target rules while distinguishing visual geometry from hit-area expansion.
30. Define reduced-motion behavior for every animated family.
31. Split motion tokens by shell disclosure, menu disclosure, micro-interaction, drag/drop and data transition.
32. Add mount → transition → unmount timing diagrams.
33. Add a color inheritance diagram from Toolbox accent through child/component state derivation.
34. Add contrast/accessibility notes for all 12 palette colors with black/white text.
35. Record approved tint and shadow mixing percentages beside the palette.
36. Define when solid, stripe, grid and dot patterns are allowed.
37. Separate connection, data, interaction, validation and capability state taxonomies.
38. Add examples proving Disconnected ≠ Empty ≠ Error ≠ Loading.
39. Document capability-gated UI: unavailable actions remain visible/disabled where appropriate rather than disappearing.
40. Add a canonical Tight Reveal upload section and quarantine dashed legacy upload zones.
41. Add a canonical tag section with alphabetical spectrum mapping and add/select/remove states.
42. Add a canonical KPI/metric section derived from the Master Data Tables pattern.
43. Add a Guide Subtoolbox section using the 10-concept library as recipes rather than separate shell authorities.
44. Add a split-left anatomy page: rail width = row height; divider = level stroke; selected inversion behavior.
45. Add a dropdown anatomy page: closed trigger, 5px menu gap, rounded menu, overflow constraints.
46. Add a visual-regression checklist for divider thickness, radius, shadow, menu gap and mobile width.
47. Add CSS isolation tests proving Studio Hub and Analytics Widget systems cannot resize each other.
48. Maintain a companion-artifact manifest so every HTML, infographic, screenshot and library has a stable docs path.
49. Archive replaced prototypes under `legacy/` rather than leaving competing authorities beside current references.
50. Require every system update to record rule, code path, library example, tests, consumers, migration impact, screenshots/artifacts and status.

## Priority grouping

**P0 — authority and regression safety:** 1–3, 6, 9–12, 15–20, 37–39, 46–50.

**P1 — geometry, responsive and accessibility certification:** 4–5, 21–35, 40–45.

**P2 — communication and reference quality:** 7–8, 13–14, 36.

The Master Resource should track implementation status for these improvements rather than marking the whole list complete simply because the ideas are documented.