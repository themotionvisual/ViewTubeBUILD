# Mobile Visual Phase 2

- Started from current `main`, which already contains the responsive `VtSyncVisualFrame` contract.
- Promoted Heat Matrix to the reference spatial visual in the mobile CSS contract.
- Removed legacy phone minimum-height behavior at the registered visual boundary.
- Tightened landscape sizing to use the available short viewport as the limiting dimension.
- Added reusable spatial, radial, and natural responsive presets for registry migration.
- Added Vitest assertions for the preset contract.
- Added deterministic portrait/landscape QA acceptance criteria.

Next renderer migrations: Shorts Retention, Publish Optimal Clock, Traffic Source Evolution, Engagement Pulse, Content Treemap.
