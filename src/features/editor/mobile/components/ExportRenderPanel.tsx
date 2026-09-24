import React from 'react';
import {Check,Download,FileVideo2,LoaderCircle} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {createRenderJobClient,type RenderJob,type RenderOutputFormat} from '../../render/renderJobContract';
import {createVersionedAsset,selectContentBuildAsset} from '../../../../services/assetEngine';
import {getContentBuild} from '../../../../services/asset-engine/ContentBuildRepository';

const INK='#248b99',CYAN='#36E0F6',GREEN='#4EE4BE',YELLOW='#FFFF61',PINK='#FA618A';
const card:React.CSSProperties={border:`2px solid ${INK}`,borderRadius:7,background:'#fff',padding:8,marginBottom:7,boxShadow:'2px 2px 0 rgba(54,224,246,.22)'};
const btn=(active=false):React.CSSProperties=>({
  minHeight:34,border:`2px solid ${INK}`,borderRadius:5,background:active?CYAN:'#fff',
  color:'#111',fontSize:8,fontWeight:1000,textTransform:'uppercase',padding:'4px 6px',
  display:'inline-flex',alignItems:'center',justifyContent:'center',gap:5,
});

export const ExportRenderPanel:React.FC<{store:EditorStore}>=({store})=>{
  const client=React.useMemo(()=>createRenderJobClient(),[]);
  const[selected,setSelected]=React.useState<RenderOutputFormat[]>(['mp4']);
  const[supported,setSupported]=React.useState<RenderOutputFormat[]>(['mp4']);
  const[ready,setReady]=React.useState<boolean|null>(null);
  const[status,setStatus]=React.useState('Checking renderer');
  const[jobs,setJobs]=React.useState<Partial<Record<RenderOutputFormat,RenderJob>>>({});
  const[error,setError]=React.useState('');
  const abort=React.useRef<AbortController|null>(null);

  React.useEffect(()=>{
    let live=true;
    client.capabilities().then(response=>{
      if(!live)return;
      const raw=(response.capabilities?.supportedFormats??['mp4']) as unknown;
      const formats:RenderOutputFormat[]=Array.isArray(raw)
        ?raw.map(value=>String(value)).filter((value):value is RenderOutputFormat=>value==='mp4'||value==='mov'||value==='webm')
        :['mp4'];
      const available:RenderOutputFormat[]=formats.length?formats:['mp4'];
      setSupported(available);
      setSelected(current=>{
        const retained=current.filter(format=>available.includes(format));
        return retained.length?retained:['mp4'];
      });
      setReady(response.ready);
      setStatus(response.ready?'Renderer ready':`Renderer ${response.status||'unavailable'}`);
    }).catch(reason=>{
      if(!live)return;
      setReady(false);setStatus('Renderer unavailable');setError(reason instanceof Error?reason.message:String(reason));
    });
    return()=>{live=false;abort.current?.abort()};
  },[client]);

  const toggle=(format:RenderOutputFormat)=>{
    if(!supported.includes(format))return;
    setSelected(current=>current.includes(format)
      ?(current.length>1?current.filter(value=>value!==format):current)
      :[...current,format]);
  };

  const renderAll=async()=>{
    setError('');
    setJobs({});
    abort.current?.abort();
    abort.current=new AbortController();
    const fps=30;
    const duration=Math.max(.1,store.state.project.durationSec);
    const meta=(store.state.project.meta??{}) as Record<string,unknown>;
    const projectScope=store.state.project as typeof store.state.project&{contentBuildId?:string;id?:unknown};
    const projectId=typeof projectScope.id==='string'?projectScope.id:undefined;
    const contentBuildId=typeof projectScope.contentBuildId==='string'
      ?projectScope.contentBuildId
      :typeof meta.contentBuildId==='string'?meta.contentBuildId:null;
    const landscape=String(meta.aspectRatio??meta.aspect??'9:16')==='16:9'||meta.aspect==='landscape';
    const width=landscape?1920:1080,height=landscape?1080:1920;
    try{
      for(const format of selected){
        const created=await client.create({
          schemaVersion:'RemotionRenderJobV1',kind:'remotionRender',sourceEditor:'VT_E1',
          renderMode:'remotion-mp4',outputFormat:format,compositionId:'VTE1Renderer',
          compositionMeta:{fps,width,height,durationInFrames:Math.max(1,Math.ceil(duration*fps)),durationInSeconds:duration,aspectRatio:landscape?'16:9':'9:16'},
          project:store.state.project,
          projectId,
          contentBuildId:contentBuildId||undefined,
        });
        setJobs(current=>({...current,[format]:created.job}));
        const final=await client.wait(created.job.jobId,{
          signal:abort.current.signal,
          onProgress:job=>setJobs(current=>({...current,[format]:job})),
        });
        setJobs(current=>({...current,[format]:final}));
        if(final.status==='failed')throw new Error(final.failureReason||`${format.toUpperCase()} render failed`);
        if(final.status==='succeeded'&&contentBuildId&&getContentBuild(contentBuildId)){
          const outputUrl=client.downloadUrl(final);
          const createdAsset=createVersionedAsset({
            sourceToolId:'vt-e1-editor',
            sourceKind:'studio-tool',
            payloadKind:'video',
            name:`Final render · ${format.toUpperCase()}`,
            summary:`${duration.toFixed(1)}s ${landscape?'16:9':'9:16'} ${format.toUpperCase()} render`,
            kind:'video',
            url:outputUrl,
            tags:['editor','render','final-video','content-build',format],
            slot:'final-render',
            label:`${format.toUpperCase()} render`,
            context:{
              contentBuildId,
              stage:'production',
              parentAssetIds:Object.values(getContentBuild(contentBuildId)?.selections||{}).filter((id):id is string=>typeof id==='string'),
            },
            metadata:{renderJobId:final.jobId,format,width,height,fps,duration,compositionId:'VTE1Renderer'},
          });
          selectContentBuildAsset({
            contentBuildId,
            slot:'final-render',
            assetId:createdAsset.asset.id,
            sourceToolId:'vt-e1-editor',
            final:format==='mp4',
          });
        }
      }
    }catch(reason){
      if((reason as Error)?.name!=='AbortError')setError(reason instanceof Error?reason.message:String(reason));
    }
  };

  const busy=Object.values(jobs).some(job=>job?.status==='queued'||job?.status==='rendering');
  const finished=selected.every(format=>jobs[format]?.status==='succeeded');

  return <div style={{width:'100%',minWidth:0,overflowX:'hidden'}}>
    <section style={card}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><FileVideo2 size={14}/><b style={{fontSize:10,textTransform:'uppercase'}}>Render Formats</b></div>
      <div style={{fontSize:8,fontWeight:900,opacity:.65,marginBottom:6}}>Select one, two, or all three formats.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:5}}>
        {(['mp4','mov','webm'] as RenderOutputFormat[]).map(format=>{
          const enabled=supported.includes(format);
          const active=selected.includes(format);
          return <button key={format} disabled={!enabled||busy} style={{...btn(active),opacity:enabled?1:.35,background:active?CYAN:'#fff'}} onClick={()=>toggle(format)}>
            {active?<Check size={12}/>:<FileVideo2 size={12}/>} {format.toUpperCase()}
          </button>;
        })}
      </div>
    </section>

    <section style={card}>
      <div style={{display:'flex',alignItems:'center',gap:6,fontSize:9,fontWeight:1000}}>
        <span style={{width:10,height:10,border:`2px solid ${INK}`,borderRadius:99,background:ready===true?GREEN:ready===false?PINK:YELLOW}}/>
        {status}
      </div>
      {error?<div style={{marginTop:6,padding:6,border:`2px solid ${INK}`,borderRadius:5,background:PINK,fontSize:8,fontWeight:900}}>{error}</div>:null}
      <button style={{...btn(true),width:'100%',marginTop:7,opacity:ready&&!busy?1:.4}} disabled={!ready||busy} onClick={renderAll}>
        {busy?<LoaderCircle size={13}/>:<FileVideo2 size={13}/>}
        {busy?'Rendering':`Render ${selected.map(value=>value.toUpperCase()).join(' + ')}`}
      </button>
    </section>

    {Object.keys(jobs).length?<section style={card}>
      <div style={{fontSize:10,fontWeight:1000,textTransform:'uppercase',marginBottom:6}}>Outputs</div>
      <div style={{display:'grid',gap:5}}>
        {selected.map(format=>{
          const job=jobs[format];
          if(!job)return null;
          const progress=Math.max(0,Math.min(1,job.progress??0));
          return <div key={format} style={{border:`1.5px solid ${INK}`,borderRadius:5,padding:5}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:8,fontWeight:1000}}><span>{format.toUpperCase()}</span><span>{job.status?.toUpperCase()} · {Math.round(progress*100)}%</span></div>
            <div style={{height:8,border:`1.5px solid ${INK}`,borderRadius:4,overflow:'hidden',marginTop:4}}><div style={{height:'100%',width:`${progress*100}%`,background:CYAN}}/></div>
            {job.status==='succeeded'?<a href={client.downloadUrl(job)} style={{...btn(true),display:'flex',textDecoration:'none',marginTop:5}}><Download size={12}/>Save {format.toUpperCase()}</a>:null}
          </div>;
        })}
      </div>
      {finished?<div style={{fontSize:8,fontWeight:1000,marginTop:6}}>All selected formats are ready to save.</div>:null}
    </section>:null}
  </div>;
};
