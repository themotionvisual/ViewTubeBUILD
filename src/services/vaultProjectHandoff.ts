import { attachAssetToContentBuild } from "./asset-engine/ContentBuildRepository"
import { initializeProjectContentIdentity } from "./projects/ProjectContentIdentityService"
import type { Project } from "../types"

export const buildVaultSelectionProjectDraft = (input: {
 name: string
 targetNiche?: string
 assetNames: string[]
 now?: number
}): Project => {
 const now = input.now ?? Date.now()
 const name = input.name.trim() || "Vault Selection"
 return {
  id: `p-vault-${now}`,
  name,
  videoTitle: name,
  concept: "",
  status: "ideation",
  color: "#24D3FF",
  publishDate: new Date(now).toISOString().slice(0, 10),
  tasks: [],
  script: "",
  description: "",
  tags: "",
  notes: "",
  storyboard: [],
  plan: {
   concept: "",
   niche: input.targetNiche || "",
   format: "long",
   sourceVaultAssetNames: [...input.assetNames],
  },
 }
}


export const attachVaultAssetIdsToProject = (input: {
 project: Project
 assetIds: string[]
 channelId?: string | null
}) => {
 const identity = initializeProjectContentIdentity(input.project, {
  channelId: input.channelId || null,
  sourceToolId: "creator-vault-os",
 })
 for (const assetId of Array.from(new Set(input.assetIds))) {
  attachAssetToContentBuild(identity.contentBuildId, assetId, {
   toolId: "creator-vault-os",
   metadata: { source: "vault-existing-project-attachment" },
  })
 }
 return identity
}
