# Studio Hub Component Library — Herald corrective pass

## Trigger
Mobile production screenshot showed two concrete failures after the first catalog merge:

1. The new standalone-library component families existed in source but were not mounted into the Studio Hub Component Library toolbox.
2. `toolbox-system.css` globally forced main toolbox headers to 56px, collapsing the visual hierarchy so main toolboxes looked like subtoolboxes.

## Corrective implementation
- `ToolboxUIReferenceLibrary` now mounts `StudioHubCompletePrimitiveCatalog` directly as its certification surface.
- The mounted catalog contains 56 families at L0/L1/L2 (168 examples), including split search, toggles/switches, checkbox, radio, slider/range, popover, pagination, Vault assets, knob, controller switch and LED.
- The library locally restores the Main Toolbox authority to 80px header / 5px stroke / 16px radius / 10px shadow / 26px title while nested SubToolbox remains a separate level.
- The old hand-maintained partial gallery was removed from this surface so future component additions cannot exist in a side registry without appearing in the toolbox.

## Herald gate
Do not mark visually certified until a fresh mobile render confirms the 80px main header and the complete catalog are visible in production. Source-contract tests cover catalog presence and hierarchy declarations; they are not a substitute for browser/mobile certification.
