export type ApplicationMenuGroupId = "create" | "insights" | "account" | "support"

export type ApplicationMenuIconId =
  | "studio"
  | "projects"
  | "editor"
  | "analytics"
  | "brain"
  | "research"
  | "graphs"
  | "account"
  | "billing"
  | "settings"
  | "privacy"
  | "integrations"
  | "guide"
  | "about"

export interface ApplicationMenuDestination {
  id: string
  path: string | null
  label: string
  description: string
  group: ApplicationMenuGroupId
  icon: ApplicationMenuIconId
  keywords: readonly string[]
  action?: "gemini-settings"
}

export interface ApplicationMenuGroup {
  id: ApplicationMenuGroupId
  label: string
  accent: string
}

export const APPLICATION_MENU_GROUPS: readonly ApplicationMenuGroup[] = [
  { id: "create", label: "Create", accent: "#c0f240" },
  { id: "insights", label: "Understand & Grow", accent: "#36e0f6" },
  { id: "account", label: "Account & App", accent: "#ffda47" },
  { id: "support", label: "Help", accent: "#fa618a" },
] as const

export const APPLICATION_MENU_DESTINATIONS: readonly ApplicationMenuDestination[] = [
  {
    id: "studio",
    path: "/studio",
    label: "Studio",
    description: "Create, optimize and publish content",
    group: "create",
    icon: "studio",
    keywords: ["thumbnail", "publisher", "comments", "hooks", "content analysis", "community"],
  },
  {
    id: "projects",
    path: "/projects",
    label: "Projects",
    description: "Plan and manage content work",
    group: "create",
    icon: "projects",
    keywords: ["calendar", "campaign", "planning", "workspace"],
  },
  {
    id: "editor",
    path: "/editor",
    label: "Editor",
    description: "Edit videos and production assets",
    group: "create",
    icon: "editor",
    keywords: ["video", "timeline", "assets", "production"],
  },
  {
    id: "analytics",
    path: "/local-analytics",
    label: "Analytics",
    description: "Understand channel and video performance",
    group: "insights",
    icon: "analytics",
    keywords: ["performance", "metrics", "retention", "views", "watch time"],
  },
  {
    id: "ai-brain",
    path: "/ai-brain",
    label: "AI Brain",
    description: "Ask questions using your channel context",
    group: "insights",
    icon: "brain",
    keywords: ["assistant", "strategy", "advice", "context", "ai"],
  },
  {
    id: "research",
    path: "/research-lab",
    label: "Research",
    description: "Explore topics and opportunities",
    group: "insights",
    icon: "research",
    keywords: ["research lab", "topics", "trends", "opportunities"],
  },
  {
    id: "graphs",
    path: "/graphs",
    label: "Advanced Analytics",
    description: "Explore deeper visual analysis",
    group: "insights",
    icon: "graphs",
    keywords: ["graphs", "charts", "visuals", "data", "retention"],
  },
  {
    id: "account",
    path: "/account",
    label: "Account & Channel",
    description: "Manage identity and YouTube connection",
    group: "account",
    icon: "account",
    keywords: ["profile", "youtube", "connect", "identity", "channel"],
  },
  {
    id: "billing",
    path: "/account?panel=billing",
    label: "Billing & Credits",
    description: "Review your plan, usage and payments",
    group: "account",
    icon: "billing",
    keywords: ["plan", "credits", "subscription", "payment", "usage"],
  },
  {
    id: "settings",
    path: "/settings",
    label: "Settings",
    description: "Manage app preferences",
    group: "account",
    icon: "settings",
    keywords: ["preferences", "configuration", "options"],
  },
  {
    id: "data-privacy",
    path: "/data-transparency",
    label: "Data & Privacy",
    description: "Review stored data and permissions",
    group: "account",
    icon: "privacy",
    keywords: ["transparency", "permissions", "storage", "delete", "trust"],
  },
  {
    id: "ai-integrations",
    path: null,
    label: "AI & Integrations",
    description: "Manage your Gemini provider key",
    group: "account",
    icon: "integrations",
    keywords: ["gemini", "api", "key", "provider", "byok"],
    action: "gemini-settings",
  },
  {
    id: "user-guide",
    path: "/user-guide",
    label: "User Guide",
    description: "Learn how to use ViewTube",
    group: "support",
    icon: "guide",
    keywords: ["help", "documentation", "instructions", "learn"],
  },
  {
    id: "about",
    path: "/about",
    label: "About ViewTube",
    description: "Product purpose and trust information",
    group: "support",
    icon: "about",
    keywords: ["about", "product", "trust", "information"],
  },
] as const

const normalizeSearchText = (value: string): string =>
  value.trim().toLocaleLowerCase().replace(/\s+/g, " ")

export const searchApplicationMenuDestinations = (
  query: string,
): ApplicationMenuDestination[] => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return [...APPLICATION_MENU_DESTINATIONS]

  const terms = normalizedQuery.split(" ")
  return APPLICATION_MENU_DESTINATIONS.filter((destination) => {
    const searchableText = normalizeSearchText([
      destination.label,
      destination.description,
      ...destination.keywords,
    ].join(" "))
    return terms.every((term) => searchableText.includes(term))
  })
}
