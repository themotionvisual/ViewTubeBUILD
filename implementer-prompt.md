# Task 4: Update Settings UI
**Files:**
- Modify: `src/views/Settings.tsx`

## Requirements:
1. Update `Settings` component to call `fetchEntitlementFromServer` when the component mounts or when the panel becomes active.
2. The `fetchEntitlementFromServer` function requires the user's email. You will need to fetch the user's email using `googleService.getUserInfo()` (implemented in Task 1).
3. Handle potential errors and update the `billingStatus` with the status of the sync.
4. If successful, refresh the local entitlement view.

## Context:
- `Settings.tsx` is the primary UI for managing billing.
- You have `getCurrentEntitlement()` and `writeStoredEntitlement()` available to manage local storage.
- You have `googleService.getUserInfo()` to retrieve the email.
- The backend API is at `VITE_BILLING_API_BASE`.
- Commit the changes after implementation.
