import React from "react"
import type { EntitlementState } from "../services/billingEntitlement"
import { EntitlementContext } from "./entitlementContext"

export const EntitlementProvider: React.FC<{
  children: React.ReactNode
  value: EntitlementState
}> = ({ children, value }) => (
  <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>
)
