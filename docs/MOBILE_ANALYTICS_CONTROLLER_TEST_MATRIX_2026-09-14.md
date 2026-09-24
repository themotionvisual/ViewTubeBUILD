# Mobile Analytics Controller Test Matrix

**Status:** HISTORICAL / REUSABLE REGRESSION EVIDENCE MATRIX  
**Current authority:** current controller plan + mobile visual responsive contract.  
**Wave 4 note (2026-09-24):** the viewport expectations remain useful as regression evidence, but this matrix is not proof that current main has passed those screenshots.

Verify the responsive controller correction at these minimum viewports before merging:

| Viewport | Orientation | Expected controller composition |
| --- | --- | --- |
| 390×844 | portrait | Full-width controller rail below title; two-column cells; no title collision |
| 430×932 | portrait | Same geometry family; no arbitrary expansion |
| 844×390 | landscape | Title and compact horizontal controller rail share header; rail scrolls if needed |
| 932×430 | landscape | Same short-landscape composition; chart remains bounded |
| 768×1024 | tablet portrait | Existing tablet/desktop component rules remain authoritative |
| ≥1024px | desktop | No change from desktop controller layout |

For Channel Progress specifically verify: metric selector, view mode, time range, layout selector, title/subtitle, active-context row, chart plot and legend. Confirm no controller label overlaps another control and no controller forces the chart module to an unbounded height.