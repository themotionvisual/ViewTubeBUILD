import type { UnifiedAccountSnapshot } from "../../services/account/accountContracts"

export type SettingsPanel = "overview" | "account" | "ai" | "billing" | "data" | "help"

const SETTINGS_PANEL_ALIASES: Record<string, SettingsPanel> = {
  overview: "overview",
  account: "account",
  "account-profile": "account",
  profile: "account",
  connections: "account",
  ai: "ai",
  "ai-brain-context": "ai",
  "api-keys": "ai",
  billing: "billing",
  "billing-meter": "billing",
  data: "data",
  "workspace-data": "data",
  privacy: "data",
  help: "help",
  "help-policies": "help",
  "guide-protocols": "help",
}

export const resolveSettingsPanel = (value: string | null | undefined): SettingsPanel =>
  SETTINGS_PANEL_ALIASES[String(value || "").toLowerCase()] || "overview"

export type SettingsReadinessItem = {
  id: "account" | "youtube" | "billing" | "brain"
  label: string
  ready: boolean
  state: string
}

export type SettingsReadiness = {
  completed: number
  items: SettingsReadinessItem[]
  nextLabel: string
  nextPanel: SettingsPanel
}

export const resolveSettingsReadiness = (
  snapshot: UnifiedAccountSnapshot,
  channelConnected: boolean,
  brainReady: boolean,
): SettingsReadiness => {
  const accountReady = snapshot.authentication.status === "authenticated"
  const youtubeReady = snapshot.google.status === "connected" || channelConnected
  const billingReady = snapshot.billing.status === "active" || snapshot.billing.status === "trialing"
  const creatorBrainReady = snapshot.onboarding.status === "complete" || brainReady
  const items: SettingsReadinessItem[] = [
    { id: "account", label: "ViewTube account", ready: accountReady, state: accountReady ? "Ready" : "Needs action" },
    { id: "youtube", label: "YouTube channel", ready: youtubeReady, state: youtubeReady ? "Connected" : "Not connected" },
    { id: "billing", label: "Plan and credits", ready: billingReady, state: billingReady ? "Active" : "Review plan" },
    { id: "brain", label: "Creator Brain", ready: creatorBrainReady, state: creatorBrainReady ? "Personalized" : "Needs context" },
  ]

  if (!accountReady) {
    return { items, completed: items.filter((item) => item.ready).length, nextPanel: "account", nextLabel: "Create or sign in to your ViewTube account" }
  }
  if (!youtubeReady) {
    return { items, completed: items.filter((item) => item.ready).length, nextPanel: "account", nextLabel: "Connect your YouTube channel" }
  }
  if (!creatorBrainReady) {
    return { items, completed: items.filter((item) => item.ready).length, nextPanel: "ai", nextLabel: "Complete your Creator Brain profile" }
  }
  if (!billingReady) {
    return { items, completed: items.filter((item) => item.ready).length, nextPanel: "billing", nextLabel: "Review your plan and AI credits" }
  }
  return { items, completed: items.length, nextPanel: "overview", nextLabel: "Your creator system is ready" }
}
