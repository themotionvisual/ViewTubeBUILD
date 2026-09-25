import type { VaultAsset, VaultAssetKind } from "../types"
import {
 createViewTubeActionPacket,
 getCompatibleHandoffTargets,
 getViewTubeToolCapability,
 persistViewTubeActionPacket,
 type ViewTubePayloadKind,
} from "./viewTubeToolChains"

export const resolveVaultAssetPayloadKind = (kind: VaultAssetKind): ViewTubePayloadKind => {
 if (kind === "image") return "image"
 if (kind === "video") return "video"
 if (kind === "json") return "json"
 return "asset"
}

export const getVaultAssetToolTargets = (kind: VaultAssetKind) =>
 getCompatibleHandoffTargets({
  sourceToolId: "vault",
  payloadKind: resolveVaultAssetPayloadKind(kind),
 })
 .filter((target) => target.status !== "planned")

export const createVaultAssetHandoff = (input: {
 asset: VaultAsset
 targetToolId: string
 contentBuildId?: string | null
 projectId?: string | null
 channelId?: string | null
}) => {
 const target = getViewTubeToolCapability(input.targetToolId)
 if (!target) throw new Error(`Unknown ViewTube handoff target: ${input.targetToolId}`)
 const payloadKind = resolveVaultAssetPayloadKind(input.asset.kind)
 if (!target.accepts.includes(payloadKind)) {
  throw new Error(`${target.label} cannot accept ${payloadKind} assets.`)
 }

 const packet = createViewTubeActionPacket({
  sourceToolId: "vault",
  sourceKind: "vault",
  payloadKind,
  title: `Vault asset → ${target.label}`,
  summary: `Send ${input.asset.name} from the canonical Vault to ${target.label}.`,
  payload: {
   assetIds: [input.asset.id],
   primaryAssetId: input.asset.id,
   assetKind: input.asset.kind,
   assetName: input.asset.name,
  },
  contentBuildId: input.contentBuildId || null,
  projectId: input.projectId || input.asset.projectId || null,
  channelId: input.channelId || null,
  evidence: [],
  provenance: [
   `vault-asset:${input.asset.id}`,
   ...(input.contentBuildId ? [`content-build:${input.contentBuildId}`] : []),
  ],
  suggestedTargets: [target.id],
 })
 persistViewTubeActionPacket(packet)

 const separator = target.route.includes("?") ? "&" : "?"
 return {
  packet,
  route: `${target.route}${separator}handoff=${encodeURIComponent(packet.id)}`,
  target,
 }
}
