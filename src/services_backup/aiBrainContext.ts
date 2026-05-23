export type BrainPrimaryGoal =
  | "views"
  | "subscribers"
  | "revenue"
  | "retention"
  | "consistency"

export type AiBrainContext = {
  whatNext: string
  primaryGoal: BrainPrimaryGoal
  audienceNiche: string
  completedAt: string | null
}

const STORAGE_KEY = "vt_ai_brain_context_v1"
const COMPLETED_KEY = "vt_ai_brain_context_completed_v1"
const DISMISSED_KEY = "vt_ai_brain_context_dismissed_v1"

const defaultContext: AiBrainContext = {
  whatNext: "",
  primaryGoal: "views",
  audienceNiche: "",
  completedAt: null,
}

export const loadAiBrainContext = (): AiBrainContext => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultContext
    const parsed = JSON.parse(raw) as Partial<AiBrainContext>
    return {
      whatNext: String(parsed.whatNext || ""),
      primaryGoal: (parsed.primaryGoal as BrainPrimaryGoal) || "views",
      audienceNiche: String(parsed.audienceNiche || ""),
      completedAt: parsed.completedAt || null,
    }
  } catch {
    return defaultContext
  }
}

export const saveAiBrainContext = (
  next: Pick<AiBrainContext, "whatNext" | "primaryGoal" | "audienceNiche">,
): AiBrainContext => {
  const payload: AiBrainContext = {
    whatNext: String(next.whatNext || "").trim(),
    primaryGoal: next.primaryGoal || "views",
    audienceNiche: String(next.audienceNiche || "").trim(),
    completedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  localStorage.setItem(COMPLETED_KEY, "true")
  localStorage.removeItem(DISMISSED_KEY)
  return payload
}

export const hasCompletedAiBrainContext = (): boolean =>
  localStorage.getItem(COMPLETED_KEY) === "true"

export const shouldShowAiBrainIntake = (isAuthenticated: boolean): boolean => {
  if (!isAuthenticated) return false
  if (hasCompletedAiBrainContext()) return false
  if (localStorage.getItem(DISMISSED_KEY) === "true") return false
  const hasSignupEmail = String(localStorage.getItem("vt_signup_email") || "").trim().length > 0
  const hasKnownEmail = String(localStorage.getItem("vt_known_user_email") || "").trim().length > 0
  return hasSignupEmail || hasKnownEmail
}

export const dismissAiBrainIntake = (): void => {
  localStorage.setItem(DISMISSED_KEY, "true")
}
