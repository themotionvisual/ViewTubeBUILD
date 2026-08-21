# Mobile CSV rehydration fix

The original CSV-to-visuals mobile fix is already an ancestor of the Visual Time Windows branch. The later regression is a boot-time state race: CSV rows can enter React state, then temporarily become inactive when `snapshot.channelId` changes during mobile account hydration.

The patch in `patches/mobile-csv-rehydration-fix.patch` changes two rules:

1. IndexedDB CSV recovery is allowed before a channel ID is available.
2. A non-empty local CSV state cannot be replaced by an empty hydration result during boot.

Expected mobile behavior after the patch:

`IMPORT CSV → TABLES POPULATE → VISUALS POPULATE → ACCOUNT/CHANNEL HYDRATES → DATA REMAINS VISIBLE`

The patch is deliberately not a full replacement of the current Visual Time Windows files, because those files have substantial newer work that should be preserved.
