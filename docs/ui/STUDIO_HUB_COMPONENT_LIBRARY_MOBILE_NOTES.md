# Mobile screenshot findings — 2026-09-17

Observed from the supplied iPhone production screenshot:

- The Studio Hub Component Library main header is rendered at approximately the same structural height as nested subtoolbox headers. This contradicts the documented 80px Main Toolbox authority.
- The visible certification surface still presents the older partial reference implementation and does not expose the newly authored complete catalog.
- The screenshot therefore confirms a wiring problem, not merely a missing style declaration: component source existing elsewhere is insufficient unless the Studio Hub toolbox mounts it.

The corrective pass mounts the complete catalog directly and restores the main-level header geometry inside the library scope. Fresh production/mobile screenshots are still required after deployment before checking the visual-certification checklist as complete.
