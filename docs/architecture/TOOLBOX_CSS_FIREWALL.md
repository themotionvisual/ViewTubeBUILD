# Toolbox CSS ownership firewall

The three UI systems are separate geometry owners.

- Main Toolbox: `src/components/toolbox/tokens.ts` + `src/styles/toolbox-system.css`
- Subtoolbox: `src/components/subtoolbox/tokens.ts` + `src/styles/subtoolbox-system.css`
- Widget: widget-owned tokens/styles only

## Rules

1. Main Toolbox selectors must be rooted at `[data-vt-toolbox-level="main"]`.
2. Subtoolbox selectors must be rooted at `[data-vt-toolbox-level="sub"]` or `[data-vt-subtoolbox-module="true"]`.
3. Widget CSS must not set toolbox/subtoolbox header height, stroke, radius, title size or shadow offset.
4. Split-left icon rails use a 1:1 cell: rail width equals the owning control height.
5. Studio Hub top-level tools use `ToolboxScaffold`; nested workflow modules use `SubToolbox`.
6. Legacy `Toolbox variant="accordion"` is reference compatibility only and must not replace production `SubToolbox`.
7. Feature code owns content and behavior, not frame geometry.

## Canonical hierarchy

| Level | Header | Stroke | Radius | Shadow | Title |
| --- | ---: | ---: | ---: | ---: | ---: |
| Main Toolbox | 80px | 5px | 16px | 10px | 26px |
| Subtoolbox | 56px | 4px | 12px | 6px | 20px |
| Compact Subtoolbox | 44px | 3px | 10px | 4px | 20px |
| Interior primitives | 32/48/60px | 3px | 8px | 4px | 10/14/20px |

`toolbox-system.css` must be imported once in the global stylesheet immediately before `subtoolbox-system.css`; the latter remains the visual authority for nested components.
