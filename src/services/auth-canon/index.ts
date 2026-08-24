// Public barrel — the single import path every auth consumer uses.
// If it's not re-exported here, it's not part of the canonical API.
//
// Consumers:
//   import { useAccountStatus, useCanUseYouTubeApis } from "services/auth-canon"
//
// When we retire the legacy auth-check sites (unifiedAuth.isAuthenticated()
// direct calls, useBrain().authState.isAuthenticated, useUnifiedAccount()
// ad-hoc destructuring), only files importing from this barrel will still
// compile — the sweep is straightforward.

export type {
 UnifiedAccountSnapshot,
 AccountIntent,
 AccountCapability,
 AccountStatus,
 AccountStatusPayload,
} from "./contracts"
export {
 reconcileAccountStatus,
 ANONYMOUS_ACCOUNT_STATUS,
} from "./reconcile"
export {
 useAccountStatus,
 useCanUseYouTubeApis,
 useAccountStatusKind,
} from "./useAccountStatus"
