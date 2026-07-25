import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"
import {
  resolveAccountSurfaceLabel,
  type AccountSurface,
} from "../../services/account/accountContracts"

type AccountActionButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> & {
  surface: AccountSurface
  channelSyncing?: boolean
  onConnected?: () => void | Promise<void>
  onLegacyAction?: () => void | Promise<void>
  returnTo?: string
}

export const AccountActionButton: React.FC<AccountActionButtonProps> = ({
  surface,
  channelSyncing = false,
  onConnected,
  onLegacyAction,
  returnTo,
  disabled,
  ...buttonProps
}) => {
  const account = useUnifiedAccount()
  const location = useLocation()
  const navigate = useNavigate()
  const label = resolveAccountSurfaceLabel(account.snapshot, surface, channelSyncing)

  const activate = async () => {
    if (!account.serverEnabled && onLegacyAction) {
      await onLegacyAction()
      return
    }
    if (account.intent === "manage_account") {
      if (onConnected) await onConnected()
      else navigate("/account")
      return
    }
    const destination = returnTo || `${location.pathname}${location.search}${location.hash}`
    await account.start(account.intent, destination)
  }

  return (
    <button
      {...buttonProps}
      type="button"
      disabled={Boolean(disabled || account.pending || channelSyncing)}
      aria-busy={account.pending || channelSyncing}
      onClick={() => void activate()}
    >
      {label}
    </button>
  )
}
