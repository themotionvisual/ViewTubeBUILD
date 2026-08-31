export type GuidePageDepth = "quick" | "learn" | "technical"

export interface GuidePageDefinition {
 id: string
 title: string
 slug: string
 domain: "start" | "analytics" | "create" | "editor" | "publish" | "data" | "reference" | "help"
 featureIds: readonly string[]
 depths: readonly GuidePageDepth[]
 status: "ready" | "content-needed"
}

export const GUIDE_PAGES: readonly GuidePageDefinition[] = Object.freeze([
 { id:"start", title:"Start Here", slug:"start", domain:"start", featureIds:["dashboard","account"], depths:["quick","learn"], status:"ready" },
 { id:"connect", title:"Connect Your Channel", slug:"start/connect", domain:"start", featureIds:["account"], depths:["quick","learn","technical"], status:"ready" },
 { id:"feature-access", title:"Feature Access", slug:"start/feature-access", domain:"start", featureIds:["feature-access","account"], depths:["quick","learn","technical"], status:"ready" },
 { id:"app-map", title:"ViewTube at a Glance", slug:"start/app-map", domain:"start", featureIds:["dashboard","studio","analytics","editor","vault"], depths:["quick","learn"], status:"ready" },
 { id:"widgets", title:"Widget Encyclopedia", slug:"reference/widgets", domain:"reference", featureIds:["dashboard"], depths:["quick","learn"], status:"ready" },
 { id:"analytics", title:"Analytics", slug:"analytics", domain:"analytics", featureIds:["analytics","graphs","intelligence"], depths:["quick","learn","technical"], status:"ready" },
 { id:"metrics", title:"Metrics Encyclopedia", slug:"reference/metrics", domain:"reference", featureIds:["analytics"], depths:["quick","learn","technical"], status:"ready" },
 { id:"datasets", title:"Dataset Encyclopedia", slug:"reference/datasets", domain:"reference", featureIds:["analytics"], depths:["quick","learn","technical"], status:"ready" },
 { id:"create", title:"Create", slug:"create", domain:"create", featureIds:["studio","projects","ai-brain","video-manager","media-analyzer","hook-generator","thumbnail-studio","storyboard-studio"], depths:["quick","learn"], status:"ready" },
 { id:"editor", title:"ViewTube Editor", slug:"editor", domain:"editor", featureIds:["editor"], depths:["quick","learn","technical"], status:"ready" },
 { id:"publish", title:"Publish", slug:"publish", domain:"publish", featureIds:["seo-generator","video-publisher"], depths:["quick","learn"], status:"ready" },
 { id:"data", title:"Data, Sync & Privacy", slug:"data", domain:"data", featureIds:["analytics","data-privacy","account"], depths:["quick","learn","technical"], status:"ready" },
 { id:"help", title:"Troubleshooting", slug:"help", domain:"help", featureIds:["account","analytics","editor"], depths:["quick","learn","technical"], status:"ready" },
])
