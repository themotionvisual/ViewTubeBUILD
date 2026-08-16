import {
  getAccessToken,
  getSessionMeta,
  isAuthenticated,
  login,
} from "../auth/authSession"

/**
 * Temporary migration seam for the feature-flagged legacy OAuth flow.
 * UI components must use UnifiedAccountContext when Auth V2 is enabled.
 */
export const legacyAccountBridge = {
  getAccessToken,
  getSessionMeta,
  isAuthenticated,
  login,
}
