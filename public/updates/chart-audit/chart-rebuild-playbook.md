# Chart Rebuild Playbook

This playbook maps screenshot evidence to likely code sources and gives direct reconstruction actions.

## Source of Truth
- Primary scope: `/Users/cwb/Downloads/APP_COPIES`
- Matching mode: title/axis/metric weighted higher than date
- Date window prioritized: mid-March 2026 to early-April 2026

## media__1775761698824 copy.png
- Captured at: `2026-04-09 19:08:42`
- Labels detected: `top performers trio, views, watch time, revenue, new subs, research lab, data vizualizations, channelytics`
- Best match: `viewtube copy 8` -> `/Users/cwb/Downloads/APP_COPIES/viewtube copy 8/src/views/ResearchLab.tsx:1995` (confidence `0.8036`)
- Runner-ups: `viewtube copy 7, ustube-CHARTS, viewtube_copy_10`
- Recreate checklist:
  1. Open best-match anchor and copy the chart title/type config block.
  2. Rebuild axis labels and metric keys from nearby config/data selectors.
  3. Apply renderer-specific options and style tokens for visual parity.
  4. Use runner-up candidate to fill any missing layout or interaction behavior.

## media__1775761698833 copy.png
- Captured at: `2026-04-09 19:08:42`
- Labels detected: `video value matrix, ctr, retention, research lab, data vizualizations, channelytics`
- Best match: `viewtube copy 8` -> `/Users/cwb/Downloads/APP_COPIES/viewtube copy 8/src/views/ResearchLab.tsx:2818` (confidence `0.8036`)
- Runner-ups: `viewtube copy 7, ustube-CHARTS, viewtube_copy_10`
- Recreate checklist:
  1. Open best-match anchor and copy the chart title/type config block.
  2. Rebuild axis labels and metric keys from nearby config/data selectors.
  3. Apply renderer-specific options and style tokens for visual parity.
  4. Use runner-up candidate to fill any missing layout or interaction behavior.

## media__1777135346469.png
- Captured at: `2026-04-25 16:44:46`
- Labels detected: `shorts retention, packaging, research lab, data vizualizations, channelytics`
- Best match: `Research Lab TSX code` -> `/Users/cwb/Downloads/viewtube/docs/Research Lab TSX code/ResearchLab (2) copy.tsx:1037` (confidence `0.778`)
- Runner-ups: `Research Lab TSX code, Research Lab TSX code, Research Lab TSX code`
- Recreate checklist:
  1. Open best-match anchor and copy the chart title/type config block.
  2. Rebuild axis labels and metric keys from nearby config/data selectors.
  3. Apply renderer-specific options and style tokens for visual parity.
  4. Use runner-up candidate to fill any missing layout or interaction behavior.

## Screenshot 2026-04-02 at 1.39.42 AM.png
- Captured at: `2026-04-02 05:39:47`
- Labels detected: `engagement map, keyword engine, performance stack, research lab, data vizualizations, channelytics`
- Best match: `ustube-CHARTS` -> `/Users/cwb/Downloads/APP_COPIES/ustube-CHARTS/views/ResearchLab.tsx:1203` (confidence `0.8039`)
- Runner-ups: `viewtube copy 7, viewtube copy 8, viewtube copy 6`
- Recreate checklist:
  1. Open best-match anchor and copy the chart title/type config block.
  2. Rebuild axis labels and metric keys from nearby config/data selectors.
  3. Apply renderer-specific options and style tokens for visual parity.
  4. Use runner-up candidate to fill any missing layout or interaction behavior.

## Screenshot 2026-04-03 at 5.25.10 PM.png
- Captured at: `2026-04-03 21:25:16`
- Labels detected: `shorts retention, packaging, research lab, data vizualizations, channelytics`
- Best match: `viewtube copy 7` -> `/Users/cwb/Downloads/APP_COPIES/viewtube copy 7/src/views/ResearchLab.tsx:2003` (confidence `0.7428`)
- Runner-ups: `ustube-CHARTS, viewtube copy 8, viewtube copy 6`
- Recreate checklist:
  1. Open best-match anchor and copy the chart title/type config block.
  2. Rebuild axis labels and metric keys from nearby config/data selectors.
  3. Apply renderer-specific options and style tokens for visual parity.
  4. Use runner-up candidate to fill any missing layout or interaction behavior.

## Screenshot 2026-03-18 at 4.59.21 PM.png
- Captured at: `2026-03-18 20:59:26`
- Labels detected: `video value matrix, revenue distribution, watch time distribution, subscribers gained, hook effectiveness, research lab, data vizualizations, channelytics`
- Best match: `Research Lab TSX code` -> `/Users/cwb/Downloads/viewtube/docs/Research Lab TSX code/ResearchLab copy 5.tsx:610` (confidence `0.611`)
- Runner-ups: `Research Lab TSX code, ustube (22), ustubeZZZ`
- Recreate checklist:
  1. Open best-match anchor and copy the chart title/type config block.
  2. Rebuild axis labels and metric keys from nearby config/data selectors.
  3. Apply renderer-specific options and style tokens for visual parity.
  4. Use runner-up candidate to fill any missing layout or interaction behavior.

## Screenshot 2026-03-20 at 2.47.17 PM 3.png
- Captured at: `2026-03-20 18:47:20`
- Labels detected: `shorts retention, packaging, engagement map, research lab, data vizualizations, channelytics`
- Best match: `xxx-opy-of-ustube-x(3) copy` -> `/Users/cwb/Downloads/APP_COPIES/xxx-opy-of-ustube-x(3) copy/views/ResearchLab.tsx:1459` (confidence `0.7236`)
- Runner-ups: `xxx-opy-of-ustube-x(3), ustube (22), ustubeZZZ`
- Recreate checklist:
  1. Open best-match anchor and copy the chart title/type config block.
  2. Rebuild axis labels and metric keys from nearby config/data selectors.
  3. Apply renderer-specific options and style tokens for visual parity.
  4. Use runner-up candidate to fill any missing layout or interaction behavior.


## QA Summary

- PASS: media__1775761698824 copy.png (top confidence: 0.8036)
- PASS: media__1775761698833 copy.png (top confidence: 0.8036)
- PASS: media__1777135346469.png (top confidence: 0.778)
- PASS: Screenshot 2026-04-02 at 1.39.42 AM.png (top confidence: 0.8039)
- PASS: Screenshot 2026-04-03 at 5.25.10 PM.png (top confidence: 0.7428)
- NEEDS_MANUAL_REVIEW: Screenshot 2026-03-18 at 4.59.21 PM.png (top confidence: 0.611)
- PASS: Screenshot 2026-03-20 at 2.47.17 PM 3.png (top confidence: 0.7236)

## April Mapping Sanity
- PASS: Screenshot 2026-04-02 at 1.39.42 AM.png -> ustube-CHARTS (expected one of ['ustube-CHARTS', 'viewtube copy 2'])
- PASS: Screenshot 2026-04-03 at 5.25.10 PM.png -> viewtube copy 7 (expected one of ['viewtube copy 7'])
- PASS: media__1775761698824 copy.png -> viewtube copy 8 (expected one of ['viewtube copy 8'])
- PASS: media__1775761698833 copy.png -> viewtube copy 8 (expected one of ['viewtube copy 8'])

## Spot Check Top 10 (title/type presence)
- PASS: Screenshot 2026-04-02 at 1.39.42 AM.png -> /Users/cwb/Downloads/APP_COPIES/ustube-CHARTS/views/ResearchLab.tsx:1203
- PASS: media__1775761698824 copy.png -> /Users/cwb/Downloads/APP_COPIES/viewtube copy 8/src/views/ResearchLab.tsx:1995
- PASS: media__1775761698833 copy.png -> /Users/cwb/Downloads/APP_COPIES/viewtube copy 8/src/views/ResearchLab.tsx:2818
- PASS: Screenshot 2026-04-02 at 1.39.42 AM.png -> /Users/cwb/Downloads/APP_COPIES/viewtube copy 7/src/views/ResearchLab.tsx:2120
- PASS: media__1777135346469.png -> /Users/cwb/Downloads/viewtube/docs/Research Lab TSX code/ResearchLab (2) copy.tsx:1037
- PASS: media__1777135346469.png -> /Users/cwb/Downloads/viewtube/docs/Research Lab TSX code/ResearchLab (3).tsx:1037
- PASS: Screenshot 2026-04-03 at 5.25.10 PM.png -> /Users/cwb/Downloads/APP_COPIES/viewtube copy 7/src/views/ResearchLab.tsx:2003
- PASS: media__1775761698824 copy.png -> /Users/cwb/Downloads/APP_COPIES/viewtube copy 7/src/views/ResearchLab.tsx:1993
- PASS: media__1775761698833 copy.png -> /Users/cwb/Downloads/APP_COPIES/viewtube copy 7/src/views/ResearchLab.tsx:2816
- PASS: Screenshot 2026-04-03 at 5.25.10 PM.png -> /Users/cwb/Downloads/APP_COPIES/ustube-CHARTS/views/ResearchLab.tsx:1082
