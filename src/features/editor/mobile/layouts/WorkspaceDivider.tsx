import React from 'react';
import {GripHorizontal,GripVertical} from 'lucide-react';

const INK='#248b99',CYAN='#36E0F6';

export const WorkspaceDivider:React.FC<{
  axis:'x'|'y';
  value:number;
  onChange:(value:number)=>void;
}>=({axis,value,onChange})=>{
  const start=React.useRef<{pointer:number;value:number;size:number}|null>(null);
  return <div
    role="separator"
    aria-orientation={axis==='x'?'vertical':'horizontal'}
    aria-valuemin={28}
    aria-valuemax={72}
    aria-valuenow={Math.round(value*100)}
    onPointerDown={event=>{
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const parent=event.currentTarget.parentElement?.getBoundingClientRect();
      start.current={
        pointer:axis==='x'?event.clientX:event.clientY,
        value,
        size:Math.max(1,axis==='x'?(parent?.width??1):(parent?.height??1)),
      };
    }}
    onPointerMove={event=>{
      const active=start.current;
      if(!active)return;
      const pointer=axis==='x'?event.clientX:event.clientY;
      onChange(active.value+(pointer-active.pointer)/active.size);
    }}
    onPointerUp={()=>{start.current=null}}
    onPointerCancel={()=>{start.current=null}}
    style={{
      position:'absolute',
      zIndex:30,
      ...(axis==='x'
        ?{left:`calc(${value*100}% - 7px)`,top:0,bottom:0,width:14,cursor:'col-resize'}
        :{top:`calc(${value*100}% - 7px)`,left:0,right:0,height:14,cursor:'row-resize'}),
      display:'grid',placeItems:'center',touchAction:'none',
    }}
  >
    <span style={{
      width:axis==='x'?10:28,height:axis==='x'?28:10,
      border:`2px solid ${INK}`,borderRadius:5,background:CYAN,
      display:'grid',placeItems:'center',boxShadow:'2px 2px 0 rgba(36,139,153,.22)',
    }}>
      {axis==='x'?<GripVertical size={10}/>:<GripHorizontal size={10}/>}
    </span>
  </div>;
};
