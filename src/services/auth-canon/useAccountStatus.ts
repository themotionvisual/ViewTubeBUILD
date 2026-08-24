// The single hook every consumer uses to answer "is this user signed
// in?" / "can I call YouTube APIs?" / "should I show the reconnect
// prompt?".
//
// Under the hood it reads UnifiedAccountContext for the snapshot and
// unifiedAuth for the live token, then runs reconcileAccountStatus to
// produce one consistent answer. When the token disappears (e.g. after
// a 401 → onChannelAuthInvalidated → logout), every consumer of this
// hook flips together — no more "signed in but nothing works".
//
// Consumer migration cheat sheet:
//
//   OLD:
//     const { authState } = useBrain()
//     if (!authState.isAuthenticated) return <SignedOut />
//
//   OLD:
//     const account = useUnifiedAccount()
//     const isAuth = account.snapshot.authentication.status === "authenticated"
//
//   NEW:
//     const status = useAccountStatus()
//     if (status.status === "anonymous") return <SignedOut />
//     if (status.status === "needs_reconnect") return <ReconnectPrompt />
//     if (!status.canUseYouTubeApis) return <Loading />

import { useEffect, useMemo, useState } from "react"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"
import * as unifiedAuth from "../auth/authSession"
import type { AccountStatusPayload } from "./contracts"
import { reconcileAccountStatus } from "./reconcile"

/**
 * Live token-presence check. Not a hook itself — used inside the hook
 * below plus useEffect subscribers to vt_auth_changed so the value
 * updates when logout/login fires.
 */
const readTokenPresent = (): boolean => {
 try { return unifiedAuth.isAuthenticated() } catch { return false }
}

export const useAccountStatus = (): AccountStatusPayload => {
 const account = useUnifiedAccount()
 const [tokenPresent, setTokenPresent] = useState<boolean>(readTokenPresent)

 // Keep tokenPresent in sync with vt_auth_changed. UnifiedAccountContext
 // already dispatches this whenever it commits a new snapshot (and
 // unifiedAuth.logout dispatches it directly), so subscribing here
 // guarantees we re-read the token exactly when it might have changed.
 useEffect(() => {
  const refresh = () => setTokenPresent(readTokenPresent())
  window.addEventListener("vt_auth_changed", refresh)
  return () => window.removeEventListener("vt_auth_changed", refresh)
 }, [])

 return useMemo(
  () => reconcileAccountStatus({ snapshot: account.snapshot, tokenPresent }),
  [account.snapshot, tokenPresent],
 )
}

/**
 * Boolean-only variant for the common "am I signed in and connected?"
 * check. Cheaper for `React.memo` boundaries because the returned
 * value is a primitive.
 */
export const useCanUseYouTubeApis = (): boolean => {
 const status = useAccountStatus()
 return status.canUseYouTubeApis
}

/**
 * Coarse account-status enum for switch statements. Same memoization
 * story as useCanUseYouTubeApis.
 */
export const useAccountStatusKind = (): AccountStatusPayload["status"] => {
 const status = useAccountStatus()
 return status.status
}
