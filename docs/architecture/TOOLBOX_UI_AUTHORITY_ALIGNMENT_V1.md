# ViewTube Toolbox UI Authority Alignment V1

Status: IMPLEMENTING  
Scope: Toolbox / Subtoolbox / primitives / UI Reference Library  
Branch: `refactor/toolbox-level-authority-v1`

## Authority chain

`Master Resource → tokens.ts → levelAuthority.ts → canonical components → Toolbox UI Reference Library → production callers → regression tests`

No feature page is a geometry authority. Feature code chooses a structural level and primitive/recipe; it does not create a new stroke, radius, height, shadow or title scale.

## Structural levels

| Level | Height | Stroke | Radius | Shadow | Title | Purpose |
|---|---:|---:|---:|---:|---:|---|
| Toolbox | 80 | 5 | 16 | 10 | 26 | top-level tool/module |
| L0 | 56 | 4 | 12 | 6 | 20 | standard Subtoolbox / direct peer action |
| Compact | 44 | 3 | 10 | 4 | 20 | compact nested shell |
| L1 | 48 | 3 | 8 | 4 | 14 | standard interior component |
| L2 | 32 | 2 | 6 | 2 | 10 | dense interior component |

Canonical source: `src/components/subtoolbox/tokens.ts` → `TOOLBOX_LEVEL_TOKENS`.

## Alignment rules

1. Structural level owns height, outer stroke, radius, shadow offset and title scale.
2. Split-left rail width equals row height.
3. A divider uses the stroke of the structural boundary it represents.
4. Color identity comes from the canonical 12-stop spectrum and inherited palette context.
5. Shadow offset comes from level; shadow color comes from the active family/accent.
6. Layout uses the 4px rhythm. Preferred gaps: 4, 8, 12, 16, 24.
7. A page/tool may not redefine canonical geometry through local utility classes.
8. The Reference Library should render exported production primitives, not redraw them with independent CSS.

## Current production palette authority

`src/styles/toolboxPalette.ts` is the coded palette authority:

Rose `#FA618A` · Coral `#FF7F6B` · Orange `#FFA85C` · Yellow `#FFDA47` · Lime `#C0F240` · Green `#3FEE56` · Teal `#4EE4BE` · Cyan `#36E0F6` · Royal `#528FFA` · Purple `#A467F4` · Magenta `#F55EFC` · Pink `#FF7AC8`.

Any older palette table in the Master Resource must be marked superseded or reconciled to these values rather than maintained as a second palette authority.

## Current motion decision

Production collapse timing remains 300ms during the level-authority migration. The newer 600ms direction is recorded as an unresolved contract decision. Do not mix 300ms and 600ms collapse behavior across individual components. Resolve it once, then change the shared token and visual tests together.

## Known drift to remove

- `Toolbox.tsx` still restates main Toolbox stroke/shadow and header heights with local literals.
- `Toolbox.tsx` has independent 500ms help/open transition classes.
- Main Toolbox content injects legacy `--vt-level1-stroke` / `--vt-level1-shadow` values rather than consuming a typed structural-level bridge.
- The UI Reference Library currently prints hierarchy measurements as copy; it should read/display the shared tokens.
- Feature pages still contain bespoke control geometry and compatibility selectors.

## Migration procedure

1. Replace structural literals in `Toolbox.tsx` with `TOOLBOX_LEVEL_TOKENS`.
2. Route Toolbox/Subtoolbox CSS variables through `levelAuthority.ts` where runtime style variables are required.
3. Update the UI Reference Library hierarchy specimen to derive labels/measurements from the tokens.
4. Audit primitive modules for local 32/44/48/56/80, stroke, radius and shadow literals.
5. Add lint/test coverage that rejects unapproved peer geometry in canonical primitive modules.
6. Migrate production callers page by page, starting with Projects.
7. Remove compatibility CSS only after caller migration and visual certification.

## Certification gate

A primitive/level is VERIFIED only when:

- coded geometry comes from canonical tokens;
- Reference Library uses the production component;
- desktop and mobile examples match;
- open/closed/focus/selected/disabled states are represented where relevant;
- palette inheritance works without page-local hardcoding;
- at least one production caller is validated;
- regression coverage exists for its structural geometry.
