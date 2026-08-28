export type GuideLifecycle = "live" | "beta" | "experimental" | "planned" | "legacy"
export type GuideDomain = "start" | "analytics" | "create" | "editor" | "publish" | "data" | "reference" | "help"

export interface GuideFeatureDefinition {
 id: string
 title: string
 domain: GuideDomain
 lifecycle: GuideLifecycle
 routes: readonly string[]
 summary: string
 sourceOfTruth: string
 related?: readonly string[]
}

export const GUIDE_FEATURES: readonly GuideFeatureDefinition[] = Object.freeze([
 { id:"dashboard", title:"Dashboard", domain:"start", lifecycle:"live", routes:["/"], summary:"Creator home and configurable widget dashboard.", sourceOfTruth:"PAGE_REGISTRY + dashboard WidgetRegistry" },
 { id:"studio", title:"Studio Hub", domain:"create", lifecycle:"live", routes:["/studio"], summary:"Creator tools, audience workflows, packaging and ideation.", sourceOfTruth:"StudioHub + SUPER_TOOLS" },
 { id:"projects", title:"Projects", domain:"create", lifecycle:"live", routes:["/projects","/project-calendar"], summary:"Project calendar, planning and creator workflow state.", sourceOfTruth:"ProjectCalendarPage" },
 { id:"ai-brain", title:"AI Brain", domain:"create", lifecycle:"live", routes:["/ai-brain"], summary:"Channel-aware conversational analysis and orchestration.", sourceOfTruth:"AIBrainCommandInterface" },
 { id:"analytics", title:"Analytics / VT-SYNC", domain:"analytics", lifecycle:"live", routes:["/local-analytics","/analytics","/vt-sync-local"], summary:"Canonical synced YouTube datasets, tables, visuals and Intelligence Hub.", sourceOfTruth:"vt-sync-local + analytics-canon" },
 { id:"intelligence", title:"Intelligence Hub", domain:"analytics", lifecycle:"live", routes:["/intelligence","/analytics#intelligence"], summary:"Canonical-data-backed channel reports and diagnoses.", sourceOfTruth:"VtSyncIntelligenceHubGate + IntelligenceHub" },
 { id:"graphs", title:"Graphs", domain:"analytics", lifecycle:"live", routes:["/graphs","/graphs/shorts-retention"], summary:"Specialized analytics visualizations.", sourceOfTruth:"GraphsPage + chart inventory" },
 { id:"performance-hub", title:"Performance Hub", domain:"analytics", lifecycle:"legacy", routes:["/performance"], summary:"Legacy analytics monolith being decomposed into canonical analytics surfaces.", sourceOfTruth:"PerformanceHub + docs/migration/README.md" },
 { id:"editor", title:"ViewTube Editor", domain:"editor", lifecycle:"live", routes:["/editor"], summary:"Timeline-based video editing and composition runtime.", sourceOfTruth:"EditorV1Page + VT_E1" },
 { id:"vault", title:"Creator Vault", domain:"create", lifecycle:"live", routes:["/vault"], summary:"Creator asset storage and project-linked media.", sourceOfTruth:"Vault route + Creator Vault OS" },
 { id:"video-manager", title:"Video Manager", domain:"create", lifecycle:"live", routes:["/video-manager"], summary:"Video catalog and metadata management.", sourceOfTruth:"VideoManager" },
 { id:"strategy", title:"Strategy", domain:"create", lifecycle:"live", routes:["/strategy"], summary:"Channel strategy and tactics generation surface.", sourceOfTruth:"Strategy route + creator strategy services" },
 { id:"media-analyzer", title:"Media Analyzer", domain:"create", lifecycle:"live", routes:["/media-analyzer"], summary:"Media and packaging analysis.", sourceOfTruth:"MediaAnalyzer" },
 { id:"seo-generator", title:"SEO Generator", domain:"publish", lifecycle:"live", routes:["/seo-generator"], summary:"Discoverability and metadata generation.", sourceOfTruth:"SeoGenerator" },
 { id:"video-publisher", title:"Video Publisher", domain:"publish", lifecycle:"live", routes:["/video-publisher"], summary:"Publishing metadata and upload workflow.", sourceOfTruth:"VideoPublisher" },
 { id:"hook-generator", title:"Hook Generator", domain:"create", lifecycle:"live", routes:["/hook-generator"], summary:"Opening-hook generation for retention and click intent.", sourceOfTruth:"HookGenerator" },
 { id:"thumbnail-studio", title:"Thumbnail Studio", domain:"create", lifecycle:"live", routes:["/thumbnail-studio"], summary:"Thumbnail ideation and packaging.", sourceOfTruth:"ThumbnailStudio" },
 { id:"algorithm-architect", title:"Algorithm Architect", domain:"create", lifecycle:"live", routes:["/algorithm-architect"], summary:"Creator strategy and algorithm-oriented planning surface.", sourceOfTruth:"AlgorithmArchitect route" },
 { id:"storyboard-studio", title:"Storyboard Studio", domain:"create", lifecycle:"live", routes:["/storyboard-studio"], summary:"Scene planning and storyboard generation.", sourceOfTruth:"StoryboardStudio" },
 { id:"account", title:"Account & Channel Connection", domain:"start", lifecycle:"beta", routes:["/account","/account/connect","/settings","/subscribe"], summary:"ViewTube account, Google authorization and connected YouTube channel.", sourceOfTruth:"Simple Auth V1; legacy account runtime remains during cutover" },
 { id:"data-privacy", title:"Data & Privacy", domain:"data", lifecycle:"live", routes:["/data-transparency"], summary:"Data provenance, privacy and transparency.", sourceOfTruth:"DataTransparencyCenter" },
 { id:"research-lab", title:"Research Lab", domain:"reference", lifecycle:"live", routes:["/research-lab"], summary:"Research and exploratory creator intelligence workspace.", sourceOfTruth:"ResearchLab route" },
 { id:"reference-studio", title:"Reference Studio", domain:"reference", lifecycle:"experimental", routes:["/reference-studio","/reference-studio/:tabId"], summary:"Component, chart and design-system laboratories.", sourceOfTruth:"ReferenceStudio" },
 { id:"about", title:"About ViewTube", domain:"help", lifecycle:"live", routes:["/about"], summary:"Product purpose, positioning and application information.", sourceOfTruth:"About route" },
 { id:"user-guide", title:"User Guide", domain:"help", lifecycle:"live", routes:["/user-guide"], summary:"Current product documentation; V2 replacement target.", sourceOfTruth:"UserGuide + userGuideContent.ts" },
])

export const guideFeatureById = (id: string) => GUIDE_FEATURES.find((feature) => feature.id === id) ?? null
