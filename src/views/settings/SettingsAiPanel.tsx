import React from "react"
import { Bot, Eye, EyeOff, KeyRound, Sparkles, Zap } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxFieldLabel,
  SubToolboxIconButton,
  SubToolboxMetricStrip,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import { StudioInput } from "../../studio-ui"

export interface SettingsAiPanelProps {
  canViewGeminiKey: boolean
  geminiKey: string
  showKey: boolean
  settingsSaveStatus: string | null
  modelSelector: React.ReactNode
  onOpenAiBrainIntake: () => void
  onSaveGeminiKey: () => void
  onToggleShowKey: () => void
  onUpdateGeminiKey: (value: string) => void
}

export const SettingsAiPanel: React.FC<SettingsAiPanelProps> = ({
  canViewGeminiKey,
  geminiKey,
  showKey,
  settingsSaveStatus,
  modelSelector,
  onOpenAiBrainIntake,
  onSaveGeminiKey,
  onToggleShowKey,
  onUpdateGeminiKey,
}) => (
  <div className="grid gap-3">
    <SubToolbox
      title="Creator Brain"
      icon={<Bot />}
      paletteIndex={2}
      collapsible
      isOpenInitial
      persistenceId="settings-ai-brain"
      helpText="Creator context powers recommendations, packaging, publishing plans and coaching."
    >
      <SubToolboxAlert
        level="l1"
        tone="info"
        icon={<Sparkles size={19} />}
        title="Creator context"
        detail="Niche, audience, goals, strengths and creator direction feed ViewTube's AI workflows."
        action={
          <SubToolboxButton
            level="l2"
            size="compact"
            tone="accent"
            onClick={onOpenAiBrainIntake}
          >
            Open intake
          </SubToolboxButton>
        }
      />
    </SubToolbox>

    <SubToolbox
      title="Model Runtime"
      icon={<Zap />}
      paletteIndex={3}
      collapsible
      isOpenInitial
      persistenceId="settings-ai-model-runtime"
      helpText="Keep the current model selector while presenting its runtime cost context in the shared Settings system."
    >
      <SubToolboxStack density="dense">
        {modelSelector}
        <SubToolboxMetricStrip
          level="l1"
          items={[
            { label: "Flash", value: "1–1.5x" },
            { label: "Pro", value: "10–15x" },
          ]}
        />
      </SubToolboxStack>
    </SubToolbox>

    {canViewGeminiKey ? (
      <SubToolbox
        title="API Key / BYOK"
        icon={<KeyRound />}
        paletteIndex={4}
        collapsible
        isOpenInitial={false}
        persistenceId="settings-ai-api-key"
        helpText="Gemini BYOK uses your own provider quota and billing. The existing secure vault remains the storage authority."
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSaveGeminiKey()
          }}
        >
          <SubToolboxStack density="dense">
            <SubToolboxFieldLabel htmlFor="settings-gemini-key" level="l1">
              Gemini API key
            </SubToolboxFieldLabel>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_48px] gap-2">
              <StudioInput
                id="settings-gemini-key"
                sizeVariant="standard"
                type={showKey ? "text" : "password"}
                autoComplete="new-password"
                value={geminiKey}
                onChange={(event) => onUpdateGeminiKey(event.target.value)}
                placeholder="Enter your Gemini API key"
              />
              <SubToolboxIconButton
                level="l1"
                icon={showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                ariaLabel={showKey ? "Hide API key" : "Show API key"}
                onClick={onToggleShowKey}
              />
            </div>
            <SubToolboxButton
              level="l1"
              size="standard"
              tone="success"
              type="submit"
              icon={<KeyRound size={18} />}
            >
              Save API key
            </SubToolboxButton>
            {settingsSaveStatus ? (
              <SubToolboxAlert
                level="l1"
                tone="success"
                title="API key"
                detail={settingsSaveStatus}
              />
            ) : null}
          </SubToolboxStack>
        </form>
      </SubToolbox>
    ) : null}
  </div>
)
