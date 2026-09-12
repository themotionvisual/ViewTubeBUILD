# Toolbox UI migration order

1. Reconcile protected branch with current main.
2. Wire `TOOLBOX_TOKENS` into `Toolbox.tsx`; remove duplicate main-shell geometry constants.
3. Load `toolbox-system.css` globally before `subtoolbox-system.css`.
4. Promote split-left recipe through the public Subtoolbox primitive API.
5. Convert UI Library split-left actions/dropdowns first.
6. Convert Studio Hub production consumers without behavior/data changes.
7. Audit generic widget selectors and remove any Toolbox/Subtoolbox geometry bleed.
8. Run focused type/build/a11y and desktop/mobile visual regression checks.
9. Merge only after the no-loss comparison against current main passes.
