# Studio Hub Component Library visual certification

**Status:** Active visual evidence checklist; geometry reconciled to audited production tokens  
**Audited main:** `988098840050f4b658a266e1a7d6fe1c4d939c81`

## Desktop shell
- [ ] Main Studio Hub Component Library Toolbox header is 80px tall.
- [ ] Main Toolbox icon rail is 80×80.
- [ ] Main Toolbox keeps 5px stroke, 16px radius, 10px colored shadow and 26px title.
- [ ] Nested SubToolbox header is 56px with 4px stroke, 12px radius, 6px shadow and 20px title.

## Mobile shell
- [ ] Main Toolbox header is 56px with 14px radius / 6px shadow; it does **not** expand back to desktop 80px.
- [ ] SubToolbox header is 44px with 10px radius / 4px shadow.
- [ ] Main/SubToolbox titles preserve 26px/20px sizing and wrap to at most two tight lines without clipping.
- [ ] Header icon/action rails remain square to their mobile row height.
- [ ] Page-level horizontal overflow is zero.

## Catalog / primitive coverage
- [ ] L0, L1 and L2 examples are visible; Compact is not presented as a canonical structural shell level.
- [ ] Most intrinsic controls shrink-wrap to content; naturally wide canvases use bounded widths.
- [ ] Desktop/mobile landscape can compare L0/L1/L2 in one row where practical; portrait uses deterministic two-column/two-row comparison rules.
- [ ] Split Search is visible.
- [ ] Toggle and Settings Switch are visible and anatomically distinct.
- [ ] Checkbox uses the canonical X treatment.
- [ ] Radio uses the canonical center-dot treatment.
- [ ] Slider and dual-handle Range Slider are visible.
- [ ] Tooltip, Tooltip Color, visual-key tooltip, Popover/Hover Card and Disclosure use correct floating/overlay behavior where applicable.
- [ ] Pagination and both scrollbar orientations are visible.
- [ ] Landscape, portrait, audio and document Vault modules are visible.
- [ ] Knob Dial, Controller Switch and LED families are represented by canonical primitive examples.
- [ ] Skeleton and loader variants are present in the appropriate certification catalog.
- [ ] No component family is hidden merely because channel data is disconnected.
