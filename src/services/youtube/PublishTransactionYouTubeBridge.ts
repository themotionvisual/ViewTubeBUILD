import type { PublishingPackageProjection } from "../asset-engine/PublishingPackageProjection"
import {
 beginPublishTransaction,
 completePublishStep,
 failPublishTransaction,
 getPublishTransaction,
 type ContentBuildPublishTransaction,
 type PublishTransactionStep,
} from "../asset-engine/PublishTransaction"
import { getUnifiedVideo, uploadUnifiedVideo, type UploadMetadata } from "./youtubeWriteTransport"

const extractVideoId=(value:unknown):string|null=>{
 if(!value||typeof value!=="object")return null
 const record=value as Record<string,unknown>
 if(typeof record.id==="string")return record.id
 if(record.video&&typeof record.video==="object"&&typeof (record.video as Record<string,unknown>).id==="string")return (record.video as Record<string,unknown>).id as string
 return null
}

export const beginYouTubePublishing=(projection:PublishingPackageProjection)=>
 beginPublishTransaction(projection,"video-publisher")

/**
 * Crash-safe upload boundary. If a prior attempt already persisted a YouTube ID,
 * the remote upload is never repeated.
 */
export const uploadPublishTransactionVideo=async(input:{
 transactionId:string
 file:Blob
 metadata:UploadMetadata
 onProgress?:(progress:number)=>void
}):Promise<ContentBuildPublishTransaction>=>{
 const transaction=getPublishTransaction(input.transactionId)
 if(!transaction)throw new Error("Unknown publish transaction: "+input.transactionId)
 if(transaction.youtubeVideoId)return transaction
 if(transaction.steps["upload-video"]?.status==="completed") {
  throw new Error("Upload step completed without a persisted YouTube video ID; manual recovery is required before retry.")
 }
 try{
  const uploaded=await uploadUnifiedVideo(input.file,input.metadata,input.onProgress)
  const videoId=extractVideoId(uploaded)
  if(!videoId)throw new Error("YouTube upload completed without returning a video ID.")
  return completePublishStep({transactionId:transaction.id,step:"upload-video",youtubeVideoId:videoId,receipt:{remoteVideoId:videoId},youtubeBinding:{status:"uploaded",uploadCompletedAt:new Date().toISOString()},toolId:"video-publisher"})
 }catch(error){
  failPublishTransaction(transaction.id,"upload-video",error,"video-publisher")
  throw error
 }
}

export const runPublishTransactionStep=async<T>(input:{
 transactionId:string
 step:Exclude<PublishTransactionStep,"upload-video"|"verify-remote-state">
 execute:(transaction:ContentBuildPublishTransaction)=>Promise<T>
 receipt?:(result:T)=>Record<string,unknown>
})=>{
 const transaction=getPublishTransaction(input.transactionId)
 if(!transaction)throw new Error("Unknown publish transaction: "+input.transactionId)
 if(transaction.steps[input.step]?.status==="completed")return transaction
 try{
  const result=await input.execute(transaction)
  return completePublishStep({transactionId:transaction.id,step:input.step,receipt:input.receipt?.(result),toolId:"video-publisher"})
 }catch(error){
  failPublishTransaction(transaction.id,input.step,error,"video-publisher")
  throw error
 }
}

export const verifyPublishTransactionRemoteState=async(transactionId:string)=>{
 const transaction=getPublishTransaction(transactionId)
 if(!transaction)throw new Error("Unknown publish transaction: "+transactionId)
 if(transaction.steps["verify-remote-state"]?.status==="completed")return transaction
 if(!transaction.youtubeVideoId)throw new Error("Cannot verify remote state before a YouTube video ID is bound.")
 try{
  const remote=await getUnifiedVideo(transaction.youtubeVideoId)
  return completePublishStep({transactionId,step:"verify-remote-state",youtubeVideoId:transaction.youtubeVideoId,receipt:{verified:true,remote},youtubeBinding:{lastVerifiedAt:new Date().toISOString()},toolId:"video-publisher"})
 }catch(error){
  failPublishTransaction(transactionId,"verify-remote-state",error,"video-publisher")
  throw error
 }
}
