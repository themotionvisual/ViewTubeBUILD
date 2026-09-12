# Next toolbox normalization steps

1. Wire `TOOLBOX_TOKENS` into `Toolbox.tsx` and remove duplicate Main Toolbox geometry constants.
2. Promote split-left geometry to a canonical public primitive so icon rail width always equals component height.
3. Audit dropdown implementation CSS against the UI Library examples and remove generic/legacy menu overrides.
4. Namespace Widget, Toolbox and Subtoolbox geometry rules under separate ownership roots.
5. Add focused governance tests for Main > Sub hierarchy, square split-left rails and CSS isolation.
6. Verify Studio Hub on desktop and mobile before merging.
