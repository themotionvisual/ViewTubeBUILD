import type {VtE1Project} from '../../../shared/vtE1TimelineContract';

export type RenderJobStatus='queued'|'rendering'|'succeeded'|'failed';
export type RenderOutputFormat='mp4'|'mov'|'webm';
export interface RenderCompositionMeta{fps:number;width:number;height:number;durationInFrames:number;durationInSeconds:number;aspectRatio?:'16:9'|'9:16'|string}
export interface RenderJobRequest{schemaVersion:'RemotionRenderJobV1';kind:'remotionRender';sourceEditor:'VT_E1';renderMode?:'remotion-mp4'|string;outputFormat:RenderOutputFormat;project:VtE1Project;projectId?:string;contentBuildId?:string;compositionId?:string;compositionMeta:RenderCompositionMeta;previewParity?:unknown}
export interface RenderJob{jobId:string;projectId?:string;contentBuildId?:string;compositionId?:string;kind?:string;renderMode?:string;status:RenderJobStatus;outputFormat?:string;progress:number;downloadUrl?:string|null;failureReason?:string|null;warnings?:string[];diagnostics?:Record<string,unknown>;createdAt?:string;updatedAt?:string;startedAt?:string|null;completedAt?:string|null}
export interface RenderCapabilitiesResponse{ok:boolean;online:boolean;ready:boolean;status:string;capabilities?:Record<string,unknown>;renderer?:Record<string,unknown>;queue?:Record<string,unknown>;storage?:Record<string,unknown>;checks?:Record<string,unknown>}
export interface RenderValidation{valid?:boolean;errors?:string[];warnings?:string[];[key:string]:unknown}
export interface RenderJobEnvelope{job:RenderJob;validation?:RenderValidation}
export interface RenderJobClientOptions{baseUrl?:string;fetchImpl?:typeof fetch}

const json=async<T>(response:Response):Promise<T>=>{if(!response.ok){let message=`Render request failed (${response.status})`;try{const body=await response.json() as {error?:string;message?:string;validation?:{errors?:string[]}};message=body.message||body.validation?.errors?.join(' · ')||body.error||message}catch{}throw new Error(message)}return response.json() as Promise<T>};
const normalizeBase=(value:string)=>value.replace(/\/$/,'');

/** Browser-safe client for the canonical VT_E1 render proxy/worker protocol. */
export function createRenderJobClient(options:RenderJobClientOptions={}){
 const base=normalizeBase(options.baseUrl??'/api/vt-e1/render');
 const request=options.fetchImpl??fetch;
 const endpoint=(path='')=>`${base}${path}`;
 return{
  health:()=>json<{ok:boolean;status:string;service?:string}>(request(endpoint('/health'))),
  capabilities:()=>json<RenderCapabilitiesResponse>(request(endpoint('/capabilities'))),
  create:(payload:RenderJobRequest)=>json<RenderJobEnvelope>(request(endpoint(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})),
  get:(jobId:string)=>json<RenderJobEnvelope>(request(endpoint(`/${encodeURIComponent(jobId)}`))),
  downloadUrl:(job:RenderJob)=>job.downloadUrl||endpoint(`/${encodeURIComponent(job.jobId)}/download`),
  async wait(jobId:string,{intervalMs=1000,signal,onProgress}:{intervalMs?:number;signal?:AbortSignal;onProgress?:(job:RenderJob)=>void}={}):Promise<RenderJob>{for(;;){if(signal?.aborted)throw new DOMException('Render polling aborted','AbortError');const{job}=await this.get(jobId);onProgress?.(job);if(['succeeded','failed'].includes(job.status))return job;await new Promise<void>((resolve,reject)=>{const id=setTimeout(resolve,intervalMs);signal?.addEventListener('abort',()=>{clearTimeout(id);reject(new DOMException('Render polling aborted','AbortError'))},{once:true})})}}
 };
}
