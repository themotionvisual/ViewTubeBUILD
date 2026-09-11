export type ViewTubeControlId =
 | "personalization"
 | "creator-learning"
 | "external-actions"
 | "publishing"
 | "comments"
 | "community-posts"
 | "analytics-data"
 | "channel-profile"
 | "research-sharing"

export interface ViewTubeUserControls {
 version: 1
 personalization: boolean
 creatorLearning: boolean
 externalActions: "confirm" | "blocked"
 publishing: "dry-run" | "confirm" | "blocked"
 comments: "confirm" | "blocked"
 communityPosts: "confirm" | "blocked"
 analyticsData: boolean
 channelProfile: boolean
 researchSharing: boolean
 demoMode: boolean
 updatedAt: number
}

export interface ViewTubeAuditEvent {
 id: string
 at: number
 action: string
 control?: ViewTubeControlId
 allowed: boolean
 reason: string
 metadata?: Record<string, unknown>
}

const CONTROLS_KEY = "viewtube:user-controls:v1"
const AUDIT_KEY = "viewtube:user-control-audit:v1"

export const DEFAULT_VIEWTUBE_USER_CONTROLS: ViewTubeUserControls = {
 version: 1,
 personalization: true,
 creatorLearning: true,
 externalActions: "confirm",
 publishing: "dry-run",
 comments: "confirm",
 communityPosts: "confirm",
 analyticsData: true,
 channelProfile: true,
 researchSharing: false,
 demoMode: false,
 updatedAt: 0,
}

const readJson = <T,>(key: string, fallback: T): T => {
 if (typeof window === "undefined") return fallback
 try { return JSON.parse(window.localStorage.getItem(key) || "") as T } catch { return fallback }
}

export const getViewTubeUserControls = (): ViewTubeUserControls => ({
 ...DEFAULT_VIEWTUBE_USER_CONTROLS,
 ...readJson<Partial<ViewTubeUserControls>>(CONTROLS_KEY, {}),
})

export const saveViewTubeUserControls = (next: ViewTubeUserControls) => {
 const value = { ...next, updatedAt: Date.now() }
 if (typeof window !== "undefined") window.localStorage.setItem(CONTROLS_KEY, JSON.stringify(value))
 return value
}

export const patchViewTubeUserControls = (patch: Partial<ViewTubeUserControls>) =>
 saveViewTubeUserControls({ ...getViewTubeUserControls(), ...patch, version: 1 })

export const getViewTubeAuditEvents = () => readJson<ViewTubeAuditEvent[]>(AUDIT_KEY, [])

export const appendViewTubeAuditEvent = (event: Omit<ViewTubeAuditEvent, "id" | "at">) => {
 const item: ViewTubeAuditEvent = { ...event, id: crypto.randomUUID(), at: Date.now() }
 if (typeof window !== "undefined") {
  const events = [item, ...getViewTubeAuditEvents()].slice(0, 1000)
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(events))
 }
 return item
}

export const clearViewTubeLearningData = () => {
 if (typeof window === "undefined") return
 window.localStorage.removeItem("viewtube:workflow-preferences:v1")
 appendViewTubeAuditEvent({ action: "learning-data-cleared", allowed: true, reason: "Creator requested deletion." })
}

export const evaluateViewTubeControl = (control: ViewTubeControlId) => {
 const settings = getViewTubeUserControls()
 if (settings.demoMode && ["external-actions", "publishing", "comments", "community-posts"].includes(control)) {
  return { allowed: false, requiresConfirmation: false, reason: "External actions are locked in demo mode." }
 }
 if (control === "personalization") return { allowed: settings.personalization, requiresConfirmation: false, reason: settings.personalization ? "Personalization enabled." : "Personalization disabled by creator." }
 if (control === "creator-learning") return { allowed: settings.creatorLearning, requiresConfirmation: false, reason: settings.creatorLearning ? "Creator learning enabled." : "Creator learning disabled by creator." }
 if (control === "analytics-data") return { allowed: settings.analyticsData, requiresConfirmation: false, reason: settings.analyticsData ? "Analytics access enabled." : "Analytics access disabled by creator." }
 if (control === "channel-profile") return { allowed: settings.channelProfile, requiresConfirmation: false, reason: settings.channelProfile ? "Channel Profile access enabled." : "Channel Profile access disabled by creator." }
 if (control === "research-sharing") return { allowed: settings.researchSharing, requiresConfirmation: false, reason: settings.researchSharing ? "Research sharing enabled." : "Research sharing requires explicit opt-in." }
 const value = control === "publishing" ? settings.publishing : control === "comments" ? settings.comments : control === "community-posts" ? settings.communityPosts : settings.externalActions
 return { allowed: value !== "blocked", requiresConfirmation: value === "confirm" || value === "dry-run", dryRun: value === "dry-run", reason: value === "blocked" ? `${control} blocked by creator.` : value === "dry-run" ? `${control} restricted to dry-run.` : `${control} requires creator confirmation.` }
}

export const auditViewTubeControlDecision = (control: ViewTubeControlId, action: string, metadata?: Record<string, unknown>) => {
 const decision = evaluateViewTubeControl(control)
 appendViewTubeAuditEvent({ action, control, allowed: decision.allowed, reason: decision.reason, metadata })
 return decision
}
