import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { getCurrentEntitlement, tierAtLeast, type LaunchTier } from "../services/billingEntitlement"

export const EntitlementGate: React.FC<{
 minimumTier: LaunchTier
 children: React.ReactElement
}> = ({ minimumTier, children }) => {
 const location = useLocation()
 const entitlement = getCurrentEntitlement()
 const allowed = tierAtLeast(entitlement.tier, minimumTier)

 if (allowed) return children

 const from = `${location.pathname}${location.search}`
 return <Navigate to={`/subscribe?from=${encodeURIComponent(from)}&need=${minimumTier}`} replace />
}
