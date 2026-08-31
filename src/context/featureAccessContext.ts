import { createContext, useContext } from "react"
import type { UnifiedAccountSnapshot } from "../services/account/accountContracts"
import type { FeatureGateDecision, FeatureGateId } from "../services/featureGating"

export type FeatureAccessContextValue = {
  snapshot: UnifiedAccountSnapshot
  verified: boolean
  checking: boolean
  decision: (id: FeatureGateId) => FeatureGateDecision
  refresh: () => Promise<void>
}

export const FeatureAccessContext = createContext<FeatureAccessContextValue | null>(null)

export const useFeatureAccess = (): FeatureAccessContextValue => {
  const value = useContext(FeatureAccessContext)
  if (!value) throw new Error("useFeatureAccess must be used inside FeatureAccessProvider")
  return value
}
