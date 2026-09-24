# Mobile screenshot findings — 2026-09-17

**Status:** HISTORICAL VISUAL EVIDENCE — superseded geometry interpretation  
**Current authority:** desktop Main/SubToolbox = 80/56; mobile Main/SubToolbox = 56/44.  
**Correction (2026-09-24):** the original note treated 80px as the required mobile Main Toolbox height. Current `TOOLBOX_MOBILE_HEADER_DNA` intentionally uses a 56px mobile Main Toolbox and 44px mobile SubToolbox while preserving 26px/20px title sizes. The screenshot remains useful as evidence that the catalog wiring/level distinction was wrong at that time, not as current mobile geometry authority.

## Original observation

Observed from the supplied iPhone production screenshot:

- The Studio Hub Component Library main header rendered at approximately the same structural height as nested SubToolbox headers under the then-active implementation.
- The visible certification surface presented an older partial reference implementation and did not expose the complete catalog.
- The screenshot therefore identified a wiring/authority problem, not merely a missing style declaration.

Later corrective work mounted the complete catalog and established separate desktop and mobile shell contracts. Fresh visual certification is still required whenever those production contracts materially change.
