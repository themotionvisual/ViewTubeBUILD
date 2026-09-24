import React from "react"
import { Bell, CircleUserRound, Link2, Radio } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxActions, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxFieldLabel,
  SubToolboxInput,
  SubToolboxSettingsSwitch,
  SubToolboxStatusBadge,
} from "../../components/subtoolbox/SubToolboxPrimitives"

export interface SettingsAccountPanelProps {
  canResolvePublicHandle: boolean
  channelConnection: { isConnected: boolean; helper: string; settingsLabel: string; state: string }
  currentEmail: string
  currentHandleValue: string
  notifyBilling: boolean
  onConnectChannel: () => void
  onDisconnectChannel: () => void
  onHandleInputChange: (value: string) => void
  onPublicResolve: () => void
  onToggleNotifyBilling: () => void
  profileName: string
  resolveStatus: string | null
}

export const SettingsAccountPanel: React.FC<SettingsAccountPanelProps> = ({
  canResolvePublicHandle,
  channelConnection,
  currentEmail,
  currentHandleValue,
  notifyBilling,
  onConnectChannel,
  onDisconnectChannel,
  onHandleInputChange,
  onPublicResolve,
  onToggleNotifyBilling,
  profileName,
  resolveStatus,
}) => (
  <div className="grid gap-3">
    <SubToolbox
      title="Identity + Channel"
      icon={<CircleUserRound />}
      paletteIndex={1}
      persistenceId="settings-account-identity"
      helpText="Your ViewTube account identity and YouTube channel connection."
    >
      <SubToolboxStack density="dense">
        <SubToolboxAlert
          level="l1"
          tone={channelConnection.isConnected ? "success" : "warning"}
          icon={<CircleUserRound size={20} />}
          title={profileName || "No creator loaded"}
          detail={currentEmail || "Sign in to load account identity"}
          action={
            <SubToolboxStatusBadge level="l2">
              {channelConnection.isConnected ? "Connected" : "Account"}
            </SubToolboxStatusBadge>
          }
        />
        <SubToolboxAlert
          level="l1"
          tone={channelConnection.isConnected ? "success" : "warning"}
          icon={<Radio size={20} />}
          title={currentHandleValue || "YouTube channel not connected"}
          detail={channelConnection.helper || channelConnection.settingsLabel}
          action={
            channelConnection.isConnected ? (
              <SubToolboxButton level="l2" size="compact" tone="ink" onClick={onDisconnectChannel}>
                Disconnect
              </SubToolboxButton>
            ) : (
              <SubToolboxButton
                level="l2"
                size="compact"
                disabled={channelConnection.state === "syncing" || channelConnection.state === "authorizing"}
                onClick={onConnectChannel}
              >
                {channelConnection.state === "syncing" || channelConnection.state === "authorizing"
                  ? "Connecting…"
                  : "Connect"}
              </SubToolboxButton>
            )
          }
        />
        <SubToolboxAlert
          level="l1"
          tone="info"
          icon={<Bell size={20} />}
          title="Billing alerts"
          detail="Keep local billing and credit notifications enabled."
          action={
            <SubToolboxSettingsSwitch
              level="l1"
              pressed={notifyBilling}
              aria-label={notifyBilling ? "Disable billing alerts" : "Enable billing alerts"}
              onClick={onToggleNotifyBilling}
            />
          }
        />
      </SubToolboxStack>
    </SubToolbox>

    <SubToolbox
      title="Public Channel Mode"
      icon={<Link2 />}
      paletteIndex={2}
      collapsible
      isOpenInitial={canResolvePublicHandle}
      persistenceId="settings-account-public-channel"
      helpText="Resolve public Basic-plan analytics without changing the connected-account backend."
    >
      <SubToolboxStack density="dense">
        <SubToolboxFieldLabel level="l2" htmlFor="settings-public-channel">
          Channel handle or URL
        </SubToolboxFieldLabel>
        <SubToolboxInput
          id="settings-public-channel"
          level="l1"
          value={currentHandleValue}
          onChange={(event) => onHandleInputChange(event.target.value)}
          disabled={!canResolvePublicHandle}
          placeholder="@channelhandle or channel URL"
        />
        <SubToolboxActions columns={2}>
          <SubToolboxButton
            level="l1"
            tone="accent"
            disabled={!canResolvePublicHandle}
            onClick={onPublicResolve}
          >
            Resolve channel
          </SubToolboxButton>
          <SubToolboxStatusBadge level="l1">
            {canResolvePublicHandle ? "Basic public mode" : "Connected mode"}
          </SubToolboxStatusBadge>
        </SubToolboxActions>
        {resolveStatus ? (
          <SubToolboxAlert
            level="l2"
            tone="info"
            title="Resolver status"
            detail={resolveStatus}
          />
        ) : null}
      </SubToolboxStack>
    </SubToolbox>
  </div>
)
