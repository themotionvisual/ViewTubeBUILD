# Branch reconciliation note

At the implementation checkpoint this branch is 1 commit behind `main` and contains only toolbox/UI-library architecture work relative to its merge base. The missing main commit changes `src/features/vt-sync-local/adapters/manualImports.ts`, which is outside this toolbox workstream. Reconcile that commit before merge rather than overwriting main.
