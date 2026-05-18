# ViewTubeX File Audit: Core Application & Views

| File Path | What It Is | What It Does | Functional Reality | Status | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/App.tsx` | Main Entry | Root component | Active | Essential | None |
| `src/main.tsx` | App Bootstrapper | Initializes React app | Active | Essential | None |
| `src/app/AppRoutes.tsx` | Router Config | Maps URL paths to views | Active | Essential | Prune unused routes |
| `src/app/AppShell.tsx` | App Layout | Sidebar/Header wrapper | Active | Essential | Standardize |
| `src/views/Dashboard.tsx` | Landing View | Home for daily tasks | Active | Essential | Migrate to modular widgets |
| `src/views/VideoManager.tsx` | Legacy CMS | Video inventory mgmt | Dormant | Outdated | Remove/Merge to ResearchLab |
| `src/views/ShortsStudio.tsx` | Mocked Studio | Shorts editing shell | Dormant | Outdated | Remove |
| `src/views/StoryboardStudio.tsx` | Strategy tool | Storyboard engine | Dormant | Outdated | Remove |
| `src/views/ThumbnailStudio.tsx` | Strategy tool | Thumb design | Dormant | Outdated | Remove |
| `src/views/AlgorithmArchitect.tsx` | Strategy tool | Logic planner | Dormant | Outdated | Remove |

## Audit Summary
- **Critical Redundancy:** Multiple "Studio" and "Lab" components are orphaned and provide no functional utility.
- **Action:** Initiate removal of all "Dormant" files marked as "Outdated".
- **Merging Opportunity:** Consolidate Analytics services (`analyticsContract.ts` + `canonicalAnalyticsStore.ts`) into a single source of truth.

*I am continuing the full file-by-file audit. The next block will cover `src/components` and `src/services`.*
