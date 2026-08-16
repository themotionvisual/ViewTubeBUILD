import { createContext, useContext } from "react"
import { readCurrentEntitlement, type EntitlementState } from "../services/billingEntitlement"

export const EntitlementContext = createContext<EntitlementState | null>(null)

export const useEntitlement = (): EntitlementState =>
  useContext(EntitlementContext) || readCurrentEntitlement()
