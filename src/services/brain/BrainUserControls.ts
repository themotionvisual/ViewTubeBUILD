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

export const readBrainUserControls = (): BrainUserControls => {
 if (!storageAvailable()) return DEFAULT_BRAIN_USER_CONTROLS
 try {
  const raw = localStorage.getItem(BRAIN_USER_CONTROLS_STORAGE_KEY)
  if (!raw) return DEFAULT_BRAIN_USER_CONTROLS
  const parsed = JSON.parse(raw) as Partial<BrainUserControls>
  return { ...DEFAULT_BRAIN_USER_CONTROLS, ...parsed }
 } catch {
  return DEFAULT_BRAIN_USER_CONTROLS
 }
}

export const writeBrainUserControls = (
 next: BrainUserControls,
): BrainUserControls => {
 const normalized = { ...DEFAULT_BRAIN_USER_CONTROLS, ...next }
 if (storageAvailable()) {
  localStorage.setItem(BRAIN_USER_CONTROLS_STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent("vt_brain_user_controls_changed", { detail: normalized }))
 }
 return normalized
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
