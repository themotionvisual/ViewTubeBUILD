# Billing & Subscription Integration Design

**Goal:** Integrate frontend billing state with the backend `billing-server.mjs` using Google Email as the user identifier.

**Architecture:**
1. **User Identity:** Frontend retrieves email from Google's `userinfo` API.
2. **Backend Sync:** Frontend fetches entitlement status from backend at `/billing/entitlement/:email`.
3. **State Management:** Backend remains the authoritative source. Frontend `localStorage` syncs with backend on fetch.

**Tech Stack:**
- Frontend: TypeScript/React, Google OAuth (Implicit Flow)
- Backend: Node.js (mock billing server)

**Components:**
- `src/services/authSession.ts`: Update OAuth scopes.
- `src/services/googleService.ts`: Add `getUserInfo` method.
- `src/services/billingEntitlement.ts`: Add `fetchEntitlementFromServer` and backend sync logic.
- `src/views/Settings.tsx`: Update UI to show backend status and sync.
