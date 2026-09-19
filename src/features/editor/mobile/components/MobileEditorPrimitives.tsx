import React,{useEffect,useRef,useState} from 'react';
import {Link2,Minus,Plus,RotateCw,Unlink2} from 'lucide-react';

export const MOBILE_EDITOR_TOKENS={
  ink:'#248b99',
  cyan:'#36E0F6',
  yellow:'#FFFF61',
  pink:'#FA618A',
  green:'#4EE4BE',
  blue:'#528FFA',
  orange:'#FF9B54',
  purple:'#C86BFA',
  radius:6,
  stroke:2,
  gap:4,
  touch:28,
} as const;

const T=MOBILE_EDITOR_TOKENS;
export const mobilePanel:React.CSSProperties={
  boxSizing:'border-box',border:`${T.stroke}px solid ${T.ink}`,borderRadius:T.radius,
  background:'#fff',padding:7,boxShadow:'2px 2px 0 rgba(36,139,153,.18)',
};
export const mobileButton=(active=false):React.CSSProperties=>({
  minHeight:T.touch,border:`${T.stroke}px solid ${T.ink}`,borderRadius:5,
  background:active?T.cyan:'#fff',color:'#111',fontSize:8,fontWeight:1000,
  textTransform:'uppercase',padding:'3px 6px',display:'inline-flex',
  alignItems:'center',justifyContent:'center',gap:4,touchAction:'manipulation',
});
export const MobileIconButton:React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>&{active?:boolean;size?:number}>=({
  active=false,size=28,style,children,...props
})=><button {...props} style={{...mobileButton(active),width:size,height:size,minHeight:size,padding:0,...style}}>{children}</button>;

export const MobileSection:React.FC<React.PropsWithChildren<{title:string;right?:React.ReactNode;style?:React.CSSProperties}>>=({title,right,style,children})=>
  <section style={{...mobilePanel,marginBottom:6,...style}}>
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',alignItems:'center',gap:5,marginBottom:6}}>
      <strong style={{fontSize:9,fontWeight:1000,textTransform:'uppercase',letterSpacing:.4}}>{title}</strong>
      {right}
    </div>
    {children}
  </section>;

export const AcceleratingStepper:React.FC<{
  label:string;value:number;min:number;max:number;step:number;precision?:number;suffix?:string;
  defaultValue?:number;onChange:(value:number)=>void;onReset?:()=>void;
  leftColor?:string;rightColor?:string;rightSlot?:React.ReactNode;
  keyframeState?:'none'|'attached'|'active';onKeyframe?:()=>void;
}>=({label,value,min,max,step,precision,suffix='',defaultValue,onChange,onReset,leftColor=T.cyan,rightColor=T.yellow,rightSlot,keyframeState='none',onKeyframe})=>{
  const valueRef=useRef(value);
  const timerRef=useRef<number|null>(null);
  const holdRef=useRef<{start:number;y:number;factor:number}|null>(null);
  const[factor,setFactor]=useState(1);
  valueRef.current=value;
  const stop=()=>{if(timerRef.current!=null){window.clearTimeout(timerRef.current);timerRef.current=null};holdRef.current=null;setFactor(1)};
  useEffect(()=>stop,[]);
  const decimals=precision??(step<.01?3:step<1?2:0);
  const nudge=(direction:-1|1,elapsed=0)=>{
    const acceleration=elapsed>=2800?10:elapsed>=1700?5:elapsed>=900?2:1;
    const precisionFactor=holdRef.current?.factor??1;
    const next=Math.max(min,Math.min(max,valueRef.current+direction*step*acceleration*precisionFactor));
    const fixed=Number(next.toFixed(decimals));
    valueRef.current=fixed;onChange(fixed);
  };
  const repeat=(direction:-1|1)=>{
    const elapsed=holdRef.current?performance.now()-holdRef.current.start:0;
    nudge(direction,elapsed);
    timerRef.current=window.setTimeout(()=>repeat(direction),Math.max(40,210-elapsed/18));
  };
  const begin=(direction:-1|1,event:React.PointerEvent<HTMLButtonElement>)=>{
    event.preventDefault();event.currentTarget.setPointerCapture?.(event.pointerId);stop();
    holdRef.current={start:performance.now(),y:event.clientY,factor:1};
    nudge(direction,0);
    timerRef.current=window.setTimeout(()=>repeat(direction),340);
  };
  const move=(event:React.PointerEvent<HTMLButtonElement>)=>{
    const hold=holdRef.current;if(!hold)return;
    const dy=hold.y-event.clientY;
    hold.factor=dy>54?.1:dy>24?.25:dy<-54?4:dy<-24?2:1;
    setFactor(hold.factor);
  };
  const reset=()=>{
    if(onReset){onReset();return}
    if(defaultValue!=null)onChange(defaultValue);
  };
  return <div style={{width:'min(104px,100%)',maxWidth:'100%',marginBottom:6}}>
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',alignItems:'center',gap:4,marginBottom:2}}>
      <span style={{fontSize:8,fontWeight:1000,textTransform:'uppercase',opacity:.72,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</span>
      <span style={{display:'inline-flex',alignItems:'center',gap:3}}>
        {rightSlot}
        {onKeyframe?<button
          title={keyframeState==='active'?'Keyframe at playhead':keyframeState==='attached'?'Animated property':'Add keyframe'}
          aria-label={keyframeState==='active'?'Keyframe at playhead':keyframeState==='attached'?'Animated property':'Add keyframe'}
          onClick={onKeyframe}
          style={{width:18,height:18,border:`2px solid ${T.ink}`,borderRadius:99,padding:0,background:keyframeState==='active'?T.blue:keyframeState==='attached'?'#a8caff':'#fff',display:'grid',placeItems:'center'}}
        ><span style={{width:7,height:7,borderRadius:99,border:`1.5px solid ${T.ink}`,background:keyframeState==='active'?T.cyan:'#fff'}}/></button>:null}
      </span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'24px minmax(50px,56px) 24px',width:104,maxWidth:'100%'}}>
      <button aria-label={`Decrease ${label}`} style={{...mobileButton(true),width:24,minHeight:26,padding:0,background:leftColor,borderTopRightRadius:0,borderBottomRightRadius:0}}
        onPointerDown={e=>begin(-1,e)} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><Minus size={12}/></button>
      <button aria-label={`Reset ${label}`} title="Double tap to reset" onDoubleClick={reset} style={{
        height:26,borderTop:`2px solid ${T.ink}`,borderBottom:`2px solid ${T.ink}`,borderLeft:0,borderRight:0,
        background:'#fff',display:'grid',placeItems:'center',fontSize:9,fontWeight:1000,padding:0,
      }}>{Number(value.toFixed(decimals))}{suffix}{factor!==1?<small style={{fontSize:6,opacity:.55}}> ×{factor}</small>:null}</button>
      <button aria-label={`Increase ${label}`} style={{...mobileButton(true),width:24,minHeight:26,padding:0,background:rightColor,borderTopLeftRadius:0,borderBottomLeftRadius:0}}
        onPointerDown={e=>begin(1,e)} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><Plus size={12}/></button>
    </div>
  </div>;
};

export const LinkToggle:React.FC<{linked:boolean;onChange:(linked:boolean)=>void;label:string}>=({linked,onChange,label})=>
  <MobileIconButton active={linked} title={linked?`Unlink ${label}`:`Link ${label}`} aria-label={linked?`Unlink ${label}`:`Link ${label}`} onClick={()=>onChange(!linked)} size={24}>
    {linked?<Link2 size={11}/>:<Unlink2 size={11}/>}
  </MobileIconButton>;

export const XYJoystick:React.FC<{x:number;y:number;range?:number;onChange:(value:{x:number;y:number})=>void;onReset?:()=>void}>=({x,y,range=500,onChange,onReset})=>{
  const ref=useRef<HTMLDivElement>(null);
  const active=useRef<number|null>(null);
  const update=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(active.current!==event.pointerId)return;
    const rect=ref.current?.getBoundingClientRect();if(!rect)return;
    const nx=Math.max(-1,Math.min(1,((event.clientX-rect.left)/Math.max(1,rect.width))*2-1));
    const ny=Math.max(-1,Math.min(1,((event.clientY-rect.top)/Math.max(1,rect.height))*2-1));
    onChange({x:Math.round(nx*range),y:Math.round(ny*range)});
  };
  return <div ref={ref} onDoubleClick={()=>onReset?.()} onPointerDown={event=>{active.current=event.pointerId;event.currentTarget.setPointerCapture?.(event.pointerId);update(event)}} onPointerMove={update}
    onPointerUp={()=>{active.current=null}} onPointerCancel={()=>{active.current=null}}
    style={{position:'relative',width:92,height:92,border:`2px solid ${T.ink}`,borderRadius:7,background:'#fff',touchAction:'none',overflow:'hidden'}}>
    <i style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:T.ink,opacity:.24}}/>
    <i style={{position:'absolute',top:'50%',left:0,right:0,height:1,background:T.ink,opacity:.24}}/>
    <i style={{position:'absolute',left:`calc(${50+(x/range)*50}% - 8px)`,top:`calc(${50+(y/range)*50}% - 8px)`,width:16,height:16,borderRadius:99,border:`2px solid ${T.ink}`,background:T.cyan,boxSizing:'border-box'}}/>
  </div>;
};

export const RotationDial:React.FC<{value:number;onChange:(value:number)=>void;onReset?:()=>void}>=({value,onChange,onReset})=>{
  const ref=useRef<HTMLDivElement>(null);
  const active=useRef<number|null>(null);
  const update=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(active.current!==event.pointerId)return;
    const rect=ref.current?.getBoundingClientRect();if(!rect)return;
    const angle=Math.atan2(event.clientY-(rect.top+rect.height/2),event.clientX-(rect.left+rect.width/2))*180/Math.PI+90;
    onChange(Math.round(angle));
  };
  return <div ref={ref} onDoubleClick={()=>onReset?.()} onPointerDown={event=>{active.current=event.pointerId;event.currentTarget.setPointerCapture?.(event.pointerId);update(event)}} onPointerMove={update}
    onPointerUp={()=>{active.current=null}} onPointerCancel={()=>{active.current=null}}
    style={{position:'relative',width:72,height:72,borderRadius:99,border:`2px solid ${T.ink}`,background:'#fff',touchAction:'none',display:'grid',placeItems:'center'}}>
    <RotateCw size={14}/>
    <i style={{position:'absolute',left:'50%',top:5,width:3,height:24,borderRadius:2,background:T.cyan,transformOrigin:'50% 31px',transform:`translateX(-50%) rotate(${value}deg)`,border:`1px solid ${T.ink}`}}/>
    <span style={{position:'absolute',bottom:4,fontSize:7,fontWeight:1000}}>{Math.round(value)}°</span>
  </div>;
};
