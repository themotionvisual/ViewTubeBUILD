export interface BrainUserControls {
 enabled: boolean
 personalization: boolean
 showEvidence: boolean
 learnFromInteractions: boolean
 allowAnalytics: boolean
 allowProjects: boolean
 allowComments: boolean
 allowVault: boolean
 allowPublisher: boolean
 externalActionsRequireApproval: boolean
 contributeDeidentifiedResearch: boolean
}

export const BRAIN_USER_CONTROLS_STORAGE_KEY = "vt_brain_user_controls_v1"
export const BRAIN_ACTIVE_CONTROL_CHANNEL_KEY = "vt_brain_active_control_channel_v1"

export const DEFAULT_BRAIN_USER_CONTROLS: BrainUserControls = {
 enabled: true,
 personalization: true,
 showEvidence: true,
 learnFromInteractions: true,
 allowAnalytics: true,
 allowProjects: true,
 allowComments: true,
 allowVault: true,
 allowPublisher: true,
 externalActionsRequireApproval: true,
 contributeDeidentifiedResearch: false,
}

const storageAvailable = () =>
 typeof window !== "undefined" && typeof localStorage !== "undefined"

const cleanChannelId = (value?: string | null): string =>
 String(value || "").trim()

const activeChannelId = (): string => {
 if (!storageAvailable()) return ""
 return cleanChannelId(localStorage.getItem(BRAIN_ACTIVE_CONTROL_CHANNEL_KEY))
}

const keyForChannel = (channelId?: string | null): string => {
 const id = cleanChannelId(channelId) || activeChannelId()
 return id ? `${BRAIN_USER_CONTROLS_STORAGE_KEY}:${id}` : BRAIN_USER_CONTROLS_STORAGE_KEY
}

/**
 * Sets which channel's policy should be used by lower-level Brain services
 * that do not receive channelId explicitly (Core consult/reflection paths).
 */
export const setActiveBrainControlChannel = (channelId?: string | null) => {
 if (!storageAvailable()) return
 const id = cleanChannelId(channelId)
 if (id) localStorage.setItem(BRAIN_ACTIVE_CONTROL_CHANNEL_KEY, id)
 else localStorage.removeItem(BRAIN_ACTIVE_CONTROL_CHANNEL_KEY)
 window.dispatchEvent(new CustomEvent("vt_brain_active_control_channel_changed", { detail: id || null }))
}

export const readBrainUserControls = (
 channelId?: string | null,
): BrainUserControls => {
 if (!storageAvailable()) return DEFAULT_BRAIN_USER_CONTROLS
 try {
  const channelKey = keyForChannel(channelId)
  const channelRaw = localStorage.getItem(channelKey)
  const globalRaw = channelKey === BRAIN_USER_CONTROLS_STORAGE_KEY
   ? null
   : localStorage.getItem(BRAIN_USER_CONTROLS_STORAGE_KEY)
  const parsedGlobal = globalRaw ? JSON.parse(globalRaw) as Partial<BrainUserControls> : {}
  const parsedChannel = channelRaw ? JSON.parse(channelRaw) as Partial<BrainUserControls> : {}
  return { ...DEFAULT_BRAIN_USER_CONTROLS, ...parsedGlobal, ...parsedChannel }
 } catch {
  return DEFAULT_BRAIN_USER_CONTROLS
 }
}

export const writeBrainUserControls = (
 next: BrainUserControls,
 channelId?: string | null,
): BrainUserControls => {
 const normalized = { ...DEFAULT_BRAIN_USER_CONTROLS, ...next }
 if (storageAvailable()) {
  const key = keyForChannel(channelId)
  localStorage.setItem(key, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent("vt_brain_user_controls_changed", {
   detail: normalized,
  }))
 }
 return normalized
}

export const clearBrainUserControlOverride = (
 channelId: string,
): BrainUserControls => {
 if (storageAvailable()) {
  localStorage.removeItem(`${BRAIN_USER_CONTROLS_STORAGE_KEY}:${cleanChannelId(channelId)}`)
 }
 const controls = readBrainUserControls(channelId)
 if (typeof window !== "undefined") {
  window.dispatchEvent(new CustomEvent("vt_brain_user_controls_changed", { detail: controls }))
 }
 return controls
}

export type BrainControlledCapability =
 | "analytics"
 | "projects"
 | "comments"
 | "vault"
 | "publisher"

export const canBrainUseCapability = (
 controls: BrainUserControls,
 capability: BrainControlledCapability,
): boolean => {
 if (!controls.enabled) return false
 if (capability === "analytics") return controls.allowAnalytics
 if (capability === "projects") return controls.allowProjects
 if (capability === "comments") return controls.allowComments
 if (capability === "vault") return controls.allowVault
 if (capability === "publisher") return controls.allowPublisher
 return false
}

export const shouldBrainLearnFromInteraction = (
 controls: BrainUserControls,
 options: { explicitlyExcluded?: boolean } = {},
): boolean => controls.enabled && controls.personalization && controls.learnFromInteractions && !options.explicitlyExcluded

export const canBrainShareResearchData = (
 controls: BrainUserControls,
): boolean => controls.enabled && controls.contributeDeidentifiedResearch
