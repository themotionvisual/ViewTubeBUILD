import { appendContentBuildEvent, bindYouTubeVideo, getContentBuild, setContentBuildStage } from "./ContentBuildRepository"
import type { ContentBuildYouTubeBinding } from "./contracts"
import type { PublishingPackageProjection } from "./PublishingPackageProjection"
import { persistApprovedPublishSnapshot } from "./ApprovedPublishSnapshot"

export type PublishTransactionStep =
 | "validate-package" | "creator-approval" | "upload-video" | "bind-youtube"
 | "apply-metadata" | "apply-thumbnail" | "apply-captions" | "apply-routing"
 | "apply-schedule-privacy" | "verify-remote-state"
export type PublishTransactionStatus = "awaiting-approval" | "approved" | "running" | "failed" | "completed"
type StepState = { status: "pending" | "running" | "completed" | "failed"; completedAt?: string | null; receipt?: Record<string, unknown>; error?: string | null }

export interface PublishAssetLock {
 projectionRevision: number
 titleAssetId: string
 thumbnailAssetId: string
 finalRenderAssetId: string
 descriptionAssetId: string
 tagsAssetId: string | null
 scheduledAt: string | null
 lockedAt: string
}
export interface ContentBuildPublishTransaction {
 id: string; contentBuildId: string; videoPackageId: string; idempotencyKey: string
 approvedSnapshotId: string; approvedSnapshotHash: string
 status: PublishTransactionStatus; steps: Partial<Record<PublishTransactionStep, StepState>>
 assetLock: PublishAssetLock; youtubeVideoId?: string | null
 startedAt: string; updatedAt: string; completedAt?: string | null
}

const KEY="viewtube_content_build_publish_transactions_v2"
let memory: ContentBuildPublishTransaction[]=[]
const now=()=>new Date().toISOString()
const uuid=()=>globalThis.crypto?.randomUUID?.()||`publish-${Date.now()}-${Math.random().toString(36).slice(2)}`
const canStore=()=>{try{return typeof localStorage!=="undefined"}catch{return false}}
const read=():ContentBuildPublishTransaction[]=>{if(!canStore())return memory;try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}}
const write=(v:ContentBuildPublishTransaction[])=>{if(!canStore()){memory=v;return}try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}}
const save=(t:ContentBuildPublishTransaction)=>{const all=read(),i=all.findIndex(x=>x.id===t.id);if(i>=0)all[i]=t;else all.push(t);write(all);return t}
export const listPublishTransactions=(contentBuildId:string)=>read().filter(x=>x.contentBuildId===contentBuildId).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))
export const getPublishTransaction=(id:string)=>read().find(x=>x.id===id)||null

export const beginPublishTransaction=(projection:PublishingPackageProjection,toolId="video-publisher")=>{
 if(!projection.ready) throw new Error("Publishing Package is not ready: "+projection.missing.join(", "))
 if(!projection.titleAssetId||!projection.thumbnailAssetId||!projection.finalRenderAssetId||!projection.descriptionAssetId) throw new Error("Publishing Package lacks required canonical assets.")
 // Preserve the strongest duplicate-upload guard first: if this exact final
 // render already has a transaction, later metadata/package edits must resume it
 // rather than silently creating another remote upload.
 const existingForRender=read().find(x=>x.contentBuildId===projection.contentBuildId&&x.assetLock.finalRenderAssetId===projection.finalRenderAssetId)
 if(existingForRender) return existingForRender

 const approvedSnapshot=persistApprovedPublishSnapshot(projection)
 const key=`publish:${approvedSnapshot.contentBuildId}:${approvedSnapshot.id}`
 const existing=read().find(x=>x.contentBuildId===approvedSnapshot.contentBuildId&&x.approvedSnapshotId===approvedSnapshot.id)
 if(existing) return existing
 const timestamp=now()
 const transaction:ContentBuildPublishTransaction={
  id:uuid(),contentBuildId:approvedSnapshot.contentBuildId,videoPackageId:approvedSnapshot.videoPackageId,idempotencyKey:key,
  approvedSnapshotId:approvedSnapshot.id,approvedSnapshotHash:approvedSnapshot.hash,
  status:"approved",steps:{"validate-package":{status:"completed",completedAt:timestamp},"creator-approval":{status:"completed",completedAt:timestamp}},
  assetLock:{projectionRevision:approvedSnapshot.contentBuildRevision,titleAssetId:approvedSnapshot.assets.titleAssetId,thumbnailAssetId:approvedSnapshot.assets.thumbnailAssetId,finalRenderAssetId:approvedSnapshot.assets.finalRenderAssetId,descriptionAssetId:approvedSnapshot.assets.descriptionAssetId,tagsAssetId:approvedSnapshot.assets.tagsAssetId,scheduledAt:approvedSnapshot.scheduledAt,lockedAt:timestamp},
  youtubeVideoId:projection.publishedVideoId||null,startedAt:timestamp,updatedAt:timestamp,
 }
 save(transaction)
 appendContentBuildEvent({contentBuildId:transaction.contentBuildId,eventType:"publish.transaction.started",entityType:"publish-transaction",entityId:transaction.id,actorType:"tool",toolId,inputAssetIds:[transaction.assetLock.finalRenderAssetId,transaction.assetLock.titleAssetId,transaction.assetLock.thumbnailAssetId,transaction.assetLock.descriptionAssetId],metadata:{idempotencyKey:key,approvedSnapshotId:transaction.approvedSnapshotId,approvedSnapshotHash:transaction.approvedSnapshotHash,assetLock:transaction.assetLock}})
 return transaction
}

export const completePublishStep=(input:{transactionId:string;step:PublishTransactionStep;receipt?:Record<string,unknown>;youtubeVideoId?:string|null;youtubeBinding?:Partial<Omit<ContentBuildYouTubeBinding,"videoId"|"canonicalUrl"|"status">>&{status?:ContentBuildYouTubeBinding["status"]};toolId?:string})=>{
 const transaction=getPublishTransaction(input.transactionId);if(!transaction)throw new Error("Unknown publish transaction: "+input.transactionId)
 if(transaction.steps[input.step]?.status==="completed") return transaction
 const timestamp=now(),videoId=input.youtubeVideoId||transaction.youtubeVideoId||null
 const next=save({...transaction,status:"running",youtubeVideoId:videoId,steps:{...transaction.steps,[input.step]:{status:"completed",completedAt:timestamp,receipt:input.receipt}},updatedAt:timestamp})
 // Persist remote identity immediately on the upload step, not a later bind step.
 if(videoId){
  const build=getContentBuild(next.contentBuildId)
  bindYouTubeVideo({contentBuildId:next.contentBuildId,videoId,channelId:build?.channelId||null,status:input.youtubeBinding?.status||build?.youtube?.status||"uploaded",uploadStartedAt:input.youtubeBinding?.uploadStartedAt||build?.youtube?.uploadStartedAt||null,uploadCompletedAt:input.youtubeBinding?.uploadCompletedAt||build?.youtube?.uploadCompletedAt||null,scheduledAt:input.youtubeBinding?.scheduledAt||next.assetLock.scheduledAt||build?.youtube?.scheduledAt||null,premiereAt:input.youtubeBinding?.premiereAt||build?.youtube?.premiereAt||null,publishedAt:input.youtubeBinding?.publishedAt||build?.youtube?.publishedAt||null,initialTitleAssetId:next.assetLock.titleAssetId,initialThumbnailAssetId:next.assetLock.thumbnailAssetId,finalRenderAssetId:next.assetLock.finalRenderAssetId,lastVerifiedAt:input.youtubeBinding?.lastVerifiedAt||build?.youtube?.lastVerifiedAt||null,toolId:input.toolId||"video-publisher"})
 }
 appendContentBuildEvent({contentBuildId:next.contentBuildId,eventType:"publish.transaction.step.completed",entityType:"publish-transaction",entityId:next.id,actorType:input.step==="bind-youtube"?"youtube":"tool",toolId:input.toolId||"video-publisher",metadata:{step:input.step,youtubeVideoId:videoId,receipt:input.receipt||null}})
 return next
}

export const failPublishTransaction=(id:string,step:PublishTransactionStep,error:unknown,toolId="video-publisher")=>{
 const transaction=getPublishTransaction(id);if(!transaction)throw new Error("Unknown publish transaction: "+id)
 const message=error instanceof Error?error.message:String(error),timestamp=now()
 const next=save({...transaction,status:"failed",steps:{...transaction.steps,[step]:{status:"failed",error:message}},updatedAt:timestamp})
 appendContentBuildEvent({contentBuildId:next.contentBuildId,eventType:"publish.transaction.failed",entityType:"publish-transaction",entityId:next.id,actorType:"tool",toolId,metadata:{step,error:message,youtubeVideoId:next.youtubeVideoId||null}})
 return next
}
export const completePublishTransaction=(id:string,toolId="video-publisher")=>{
 const transaction=getPublishTransaction(id);if(!transaction)throw new Error("Unknown publish transaction: "+id)
 if(!transaction.youtubeVideoId)throw new Error("Cannot complete publishing without a bound YouTube video ID.")
 if(transaction.steps["verify-remote-state"]?.status!=="completed")throw new Error("Cannot complete publishing before remote verification.")
 const timestamp=now(),next=save({...transaction,status:"completed",completedAt:timestamp,updatedAt:timestamp})
 const build=getContentBuild(next.contentBuildId)
 if(build?.youtube?.status==="published")setContentBuildStage(next.contentBuildId,"published",{actorType:"youtube",toolId})
 else if(build?.youtube?.status==="scheduled")setContentBuildStage(next.contentBuildId,"scheduled",{actorType:"youtube",toolId})
 appendContentBuildEvent({contentBuildId:next.contentBuildId,eventType:"publish.transaction.completed",entityType:"publish-transaction",entityId:next.id,actorType:"tool",toolId,metadata:{youtubeVideoId:next.youtubeVideoId}})
 return next
}
export const resetPublishTransactionRepositoryForTests=()=>{memory=[];if(canStore())localStorage.removeItem(KEY)}
