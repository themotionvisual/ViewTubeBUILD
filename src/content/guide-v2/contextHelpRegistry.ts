export interface ContextHelpEntry {
 id: string
 title: string
 route: string
 guideAnchor: string
 summary: string
}

export const CONTEXT_HELP: readonly ContextHelpEntry[] = Object.freeze([
 { id:"dashboard", title:"Dashboard help", route:"/", guideAnchor:"start", summary:"Understand the home dashboard and where to go next." },
 { id:"analytics", title:"Analytics help", route:"/local-analytics", guideAnchor:"analytics", summary:"Sync, inspect and interpret canonical YouTube datasets." },
 { id:"ai-brain", title:"AI Brain help", route:"/ai-brain", guideAnchor:"create", summary:"Use channel-grounded AI analysis and creator workflows." },
 { id:"editor", title:"Editor help", route:"/editor", guideAnchor:"editor", summary:"Timeline, clips, transitions, preview and rendering." },
 { id:"projects", title:"Projects help", route:"/projects", guideAnchor:"create", summary:"Plan and hand off creator projects." },
 { id:"settings", title:"Account help", route:"/settings", guideAnchor:"connect", summary:"Connection, account, billing and configuration." },
])

export const contextHelpForRoute = (route: string) =>
 CONTEXT_HELP.find((entry) => entry.route === route) ?? null
