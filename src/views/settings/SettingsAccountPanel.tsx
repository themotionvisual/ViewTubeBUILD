import React from "react"
import { Bell, CircleUserRound, Globe2, Link2, LogOut } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxFieldLabel,
  SubToolboxNameValueList,
  SubToolboxSettingsSwitch,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import { StudioInput } from "../../studio-ui"

export interface SettingsAccountPanelProps {
  profileName: string
  currentHandleValue: string
  currentEmail: string
  connected: boolean
  connectionHelper: string
  connectionState: string
  canResolvePublicHandle: boolean
  resolveStatus: string | null
  notifyBilling: boolean
  connectAction: React.ReactNode
  onDisconnect: () => void
  onHandleInputChange: (value: string) => void
  onPublicResolve: () => void
  onToggleNotifyBilling: () => void
}

export const SettingsAccountPanel: React.FC<SettingsAccountPanelProps> = ({
  profileName,
  currentHandleValue,
  currentEmail,
  connected,
  connectionHelper,
  connectionState,
  canResolvePublicHandle,
  resolveStatus,
  notifyBilling,
  connectAction,
  onDisconnect,
  onHandleInputChange,
  onPublicResolve,
  onToggleNotifyBilling,
}) => (
  <div className="grid gap-3">
    <SubToolbox
      title="Creator Identity"
      icon={<CircleUserRound />}
      paletteIndex={1}
      collapsible
      isOpenInitial
      persistenceId="settings-account-identity"
      helpText="Your ViewTube identity and current YouTube channel connection."
    >
      <SubToolboxStack density="dense">
        <SubToolboxNameValueList
          level="l1"
          items={[
            { name: "Display name", value: profileName || "Not loaded" },
            { name: "Channel", value: currentHandleValue || "Not connected" },
            { name: "Email", value: currentEmail || "Sign in to load email" },
            { name: "Connection", value: connected ? "Connected" : "Not connected" },
          ]}
        />
        <SubToolboxAlert
          level="l1"
          tone={connected ? "success" : "warning"}
          icon={<Link2 size={19} />}
          title={connected ? "YouTube connected" : "Connect YouTube"}
          detail={connectionHelper || connectionState}
          action={connected ? undefined : connectAction}
        />
      </SubToolboxStack>
    </SubToolbox>

    <SubToolbox
      title="Public Channel Mode"
      icon={<Globe2 />}
      paletteIndex={2}
      collapsible
      isOpenInitial={canResolvePublicHandle}
      persistenceId="settings-account-public-channel"
      helpText="Basic can resolve limited public analytics from a channel handle or URL without OAuth."
    >
      <SubToolboxStack density="dense">
        <SubToolboxFieldLabel htmlFor="settings-public-channel" level="l1">
          Channel handle or URL
        </SubToolboxFieldLabel>
        <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <StudioInput
            id="settings-public-channel"
            sizeVariant="standard"
            value={currentHandleValue}
            onChange={(event) => onHandleInputChange(event.target.value)}
            disabled={!canResolvePublicHandle}
            placeholder="@channelhandle or channel URL"
            aria-describedby={resolveStatus ? "settings-public-channel-status" : undefined}
          />
          <SubToolboxButton
            level="l1"
            size="standard"
            tone="accent"
            disabled={!canResolvePublicHandle}
            onClick={onPublicResolve}
          >
            Resolve
          </SubToolboxButton>
        </div>
        {resolveStatus ? (
          <SubToolboxAlert
            id="settings-public-channel-status"
            level="l1"
            tone={resolveStatus.toLowerCase().includes("fail") ? "danger" : "info"}
            title="Public channel"
            detail={resolveStatus}
          />
        ) : null}
      </SubToolboxStack>
    </SubToolbox>

    <SubToolbox
      title="Account Preferences"
      icon={<Bell />}
      paletteIndex={3}
      collapsible
      isOpenInitial
      persistenceId="settings-account-preferences"
    >
      <SubToolboxAlert
        level="l1"
        tone="info"
        icon={<Bell size={19} />}
        title="Billing alerts"
        detail="Keep local billing and credit notifications enabled on this device."
        action={
          <SubToolboxSettingsSwitch
            level="l1"
            pressed={notifyBilling}
            aria-label={notifyBilling ? "Disable billing alerts" : "Enable billing alerts"}
            onClick={onToggleNotifyBilling}
          />
        }
      />
    </SubToolbox>

    {connected ? (
      <SubToolbox
        title="Advanced Account"
        icon={<LogOut />}
        paletteIndex={4}
        collapsible
        isOpenInitial={false}
        persistenceId="settings-account-advanced"
        helpText="Connection recovery controls are separated from routine account settings."
      >
        <SubToolboxAlert
          level="l1"
          tone="warning"
          icon={<LogOut size={19} />}
          title="Disconnect YouTube"
          detail="Remove the current channel connection. Your ViewTube account remains available."
          action={
            <SubToolboxButton level="l2" size="compact" tone="warning" onClick={onDisconnect}>
              Disconnect
            </SubToolboxButton>
          }
        />
      </SubToolbox>
    ) : null}
  </div>
)
