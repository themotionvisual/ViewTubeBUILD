import React from "react"
import { Link } from "react-router-dom"
import { buildAccountRoute, type AccountCapability, type AccountIntent } from "../../services/account/accountContracts"

type AccountGateLinkProps = Omit<React.ComponentProps<typeof Link>, "to"> & {
  intent: AccountIntent
  returnTo: string
  capability?: AccountCapability
}

export const AccountGateLink: React.FC<AccountGateLinkProps> = ({ intent, returnTo, capability, ...props }) => (
  <Link {...props} to={buildAccountRoute(intent, returnTo, capability)} />
)
