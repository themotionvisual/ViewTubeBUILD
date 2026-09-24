import React from "react"
import { Bot, Eye, EyeOff, KeyRound, Sparkles } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { AIModelSelector } from "../../components/ui/AIModelSelector"
import { SubToolboxActions, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxFieldLabel,
  SubToolboxIconButton,
  SubToolboxInput,
  SubToolboxMetricStrip,
} from "../../components/subtoolbox/SubToolboxPrimitives"

export interface SettingsAiRuntimePanelProps {
  canViewGeminiKey: boolean
  geminiKey: string
  onOpenAiBrainIntake: () => void
  onSaveGeminiKey: () => void
  onToggleShowKey: () => void
  onUpdateGeminiKey: (value: string) => void
  settingsSaveStatus: string | null
  showKey: boolean
}

export const SettingsAiRuntimePanel: React.FC<SettingsAiRuntimePanelProps> = ({
  canViewGeminiKey,
  geminiKey,
  onOpenAiBrainIntake,
  onSaveGeminiKey,
  onToggleShowKey,
  onUpdateGeminiKey,
  settingsSaveStatus,
  showKey,
}) => (
  <div className="grid gap-3 xl:grid-cols-2">
    <SubToolbox
      title="Creator Brain"
      icon={<Bot />}
      paletteIndex={2}
      persistenceId="settings-ai-brain"
      helpText="Creator context shared by Copilot, Oracle, Journal and creator coaching."
    >
      <SubToolboxStack density="dense">
        <SubToolboxAlert
          level="l1"
          tone="info"
          icon={<Sparkles size={20} />}
          title="One creator profile"
          detail="Niche, audience, goals, strengths, weaknesses and direction feed creator workflows."
          action={
            <SubToolboxButton level="l2" size="compact" onClick={onOpenAiBrainIntake}>
              Open intake
            </SubToolboxButton>
          }
        />
        <SubToolboxMetricStrip
          level="l1"
          items={[
            { label: "Flash", value: "1–1.5x" },
            { label: "Pro", value: "10–15x" },
          ]}
        />
      </SubToolboxStack>
    </SubToolbox>

    <SubToolbox
      title="Model Runtime"
      icon={<Sparkles />}
      paletteIndex={3}
      persistenceId="settings-ai-model-runtime"
      helpText="Choose the default model for creator workflows."
    >
      <AIModelSelector />
    </SubToolbox>

    {canViewGeminiKey ? (
      <div className="xl:col-span-2">
        <SubToolbox
          title="Bring Your Own Key"
          icon={<KeyRound />}
          paletteIndex={4}
          collapsible
          isOpenInitial={Boolean(geminiKey)}
          persistenceId="settings-ai-byok"
          helpText="Gemini requests use your own quota and billing when BYOK is enabled."
        >
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSaveGeminiKey()
            }}
          >
            <SubToolboxStack density="dense">
              <SubToolboxFieldLabel level="l2" htmlFor="settings-gemini-key">
                Gemini API key
              </SubToolboxFieldLabel>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                <SubToolboxInput
                  id="settings-gemini-key"
                  level="l1"
                  type={showKey ? "text" : "password"}
                  autoComplete="new-password"
                  value={geminiKey}
                  onChange={(event) => onUpdateGeminiKey(event.target.value)}
                  placeholder="Enter your Gemini API key"
                />
                <SubToolboxIconButton
                  level="l1"
                  icon={showKey ? <EyeOff /> : <Eye />}
                  ariaLabel={showKey ? "Hide API key" : "Show API key"}
                  onClick={onToggleShowKey}
                />
              </div>
              <SubToolboxActions columns={2}>
                <SubToolboxButton level="l1" type="submit" icon={<KeyRound size={18} />}>
                  Save API key
                </SubToolboxButton>
                {settingsSaveStatus ? (
                  <SubToolboxAlert
                    level="l1"
                    tone="success"
                    title="Key status"
                    detail={settingsSaveStatus}
                  />
                ) : null}
              </SubToolboxActions>
            </SubToolboxStack>
          </form>
        </SubToolbox>
      </div>
    ) : null}
  </div>
)
