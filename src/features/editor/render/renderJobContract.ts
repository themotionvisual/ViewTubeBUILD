import type {VtE1Project} from '../../../shared/vtE1TimelineContract';

export type RenderJobStatus='idle'|'queued'|'rendering'|'completed'|'failed'|'cancelled';
export type RenderCodec='h264'|'h265'|'vp8'|'vp9';
export interface RenderJobRequest{project:VtE1Project;compositionId:string;codec:RenderCodec;fileName?:string}
export interface RenderJob{jobId:string;status:RenderJobStatus;progress:number;outputUrl?:string;error?:string;createdAt?:string;updatedAt?:string}
export interface RenderCapabilities{online:boolean;ready:boolean;status:string;primaryFormat?:string;supportedFormats?:string[]}
export interface RenderJobClientOptions{baseUrl?:string;fetchImpl?:typeof fetch}

const json=async<T>(response:Response):Promise<T>=>{if(!response.ok){let message=`Render request failed (${response.status})`;try{const body=await response.json() as {error?:string;message?:string};message=body.message||body.error||message}catch{}throw new Error(message)}return response.json() as Promise<T>};
const normalizeBase=(value:string)=>value.replace(/\/$/,'');

/**
 * Browser-safe client for the canonical VT_E1 hosted-render proxy.
 * The proxy forwards these requests to the configured render worker; Node/Remotion
 * execution and output storage remain server-side.
 */
export function createRenderJobClient(options:RenderJobClientOptions={}){
 const base=normalizeBase(options.baseUrl??'/api/vt-e1/render');
 const request=options.fetchImpl??fetch;
 const endpoint=(path='')=>`${base}${path}`;
 return{
  capabilities:()=>json<RenderCapabilities>(request(endpoint('/capabilities'))),
  create:(payload:RenderJobRequest)=>json<RenderJob>(request(endpoint('/jobs'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})),
  get:(jobId:string)=>json<RenderJob>(request(endpoint(`/jobs/${encodeURIComponent(jobId)}`))),
  cancel:(jobId:string)=>json<RenderJob>(request(endpoint(`/jobs/${encodeURIComponent(jobId)}`),{method:'DELETE'})),
  async wait(jobId:string,{intervalMs=1000,signal}:{intervalMs?:number;signal?:AbortSignal}={}):Promise<RenderJob>{for(;;){if(signal?.aborted)throw new DOMException('Render polling aborted','AbortError');const job=await this.get(jobId);if(['completed','failed','cancelled'].includes(job.status))return job;await new Promise<void>((resolve,reject)=>{const id=setTimeout(resolve,intervalMs);signal?.addEventListener('abort',()=>{clearTimeout(id);reject(new DOMException('Render polling aborted','AbortError'))},{once:true})})}}
 };
}
