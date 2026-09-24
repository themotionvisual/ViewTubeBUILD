import React from "react"
import { BookOpen, CreditCard, Database, ExternalLink, KeyRound, Link2, ShieldCheck, Wrench } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxLinkButton,
  SubToolboxSelectableListRow,
  SubToolboxStatusBadge,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import { GUIDE_LAST_UPDATED, GUIDE_PROTOCOL_VERSION } from "../../content/userGuideContent"

type SettingsHelpSectionProps = {
  onNavigate: (to: string) => void
}

const HELP_ROWS = [
  { title: "Account connection", detail: "Identity, YouTube connection and workspace links.", path: "/user-guide#sync", icon: <Link2 size={18} /> },
  { title: "Billing + credits", detail: "Plans, top-ups, referrals and balance troubleshooting.", path: "/user-guide#billing", icon: <CreditCard size={18} /> },
  { title: "AI key + models", detail: "Gemini key setup, context and model guidance.", path: "/user-guide#sync", icon: <KeyRound size={18} /> },
  { title: "Sync + data", detail: "Public handle, exports, cache and account-linked data.", path: "/user-guide#sync", icon: <Database size={18} /> },
  { title: "Troubleshooting", detail: "Recovery for stale data, billing blocks and resets.", path: "/user-guide#troubleshooting", icon: <Wrench size={18} /> },
] as const

export const SettingsHelpSection: React.FC<SettingsHelpSectionProps> = ({ onNavigate }) => (
  <div className="grid gap-3">
    <SubToolbox
      title="Help + Legal"
      icon={<BookOpen />}
      paletteIndex={7}
      persistenceId="settings-help-guides"
      helpText="Open the exact guide lane or policy you need without leaving Settings structure."
    >
      <SubToolboxStack density="dense">
        <SubToolboxAlert
          level="l1"
          tone="info"
          icon={<BookOpen size={20} />}
          title="ViewTube user guide"
          detail="Account, billing, AI, analytics, publishing and troubleshooting."
          action={<SubToolboxStatusBadge level="l2">Protocol {GUIDE_PROTOCOL_VERSION}</SubToolboxStatusBadge>}
        />
        <SubToolboxGrid minItemWidth="standard" density="dense">
          {HELP_ROWS.map((row) => (
            <SubToolboxSelectableListRow
              key={row.title}
              level="l1"
              title={row.title}
              detail={row.detail}
              leading={row.icon}
              trailing={<ExternalLink size={16} />}
              onClick={() => onNavigate(row.path)}
            />
          ))}
        </SubToolboxGrid>
      </SubToolboxStack>
    </SubToolbox>

    <SubToolbox
      title="Reference + Policies"
      icon={<ShieldCheck />}
      paletteIndex={8}
      persistenceId="settings-help-policies"
    >
      <SubToolboxStack density="dense">
        <SubToolboxActions columns={4}>
          <SubToolboxSelectableListRow
            level="l1"
            title="Full user guide"
            detail={`Updated ${GUIDE_LAST_UPDATED}`}
            leading={<BookOpen size={18} />}
            onClick={() => onNavigate("/user-guide")}
          />
          <SubToolboxSelectableListRow
            level="l1"
            title="About ViewTube"
            detail="Product purpose and system overview."
            leading={<BookOpen size={18} />}
            onClick={() => onNavigate("/about")}
          />
          <SubToolboxLinkButton level="l1" size="standard" tone="neutral" href="/privacy.html" icon={<ShieldCheck size={18} />}>
            Privacy
          </SubToolboxLinkButton>
          <SubToolboxLinkButton level="l1" size="standard" tone="neutral" href="/terms.html" icon={<ShieldCheck size={18} />}>
            Terms
          </SubToolboxLinkButton>
        </SubToolboxActions>
      </SubToolboxStack>
    </SubToolbox>
  </div>
)
