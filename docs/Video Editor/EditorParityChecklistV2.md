# EditorParityChecklistV2

## Contract
Each row must map to one parity requirement and one owner skill.

| requirement_id | expected_behavior | variant_generic | variant_clay | verdict | owner_skill | evidence |
|---|---|---|---|---|---|---|

## Seeded Baseline Rows
| runtime-01 | `/editor-v1` uses VT_E1 variants only | implemented | implemented | implemented | vt-e1-architecture-governance | route + iframe target check |
| runtime-05 | overlay controls are screen-space and style-isolated | implemented | implemented | implemented | vt-e1-visual-fx-studio | stage overlay verification |
| proj-03 | V3 export contract has non-zero composition metadata | implemented | implemented | implemented | vt-e1-remotion-render-performance | export payload inspection |
| tl-05 | timeline drag/drop stable after drop | partial | partial | partial | vt-e1-architecture-governance | timeline interaction test |
| tl-06 | drag down to create new layer track | partial | partial | partial | vt-e1-architecture-governance | timeline interaction test |

## Execution Rule
- Any `partial/missing/regressed` row must include a fix task ID and acceptance test before release.
