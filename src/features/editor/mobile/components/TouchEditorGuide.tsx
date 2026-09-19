import React from 'react';
import {
  CircleHelp,Combine,Download,Hand,Layers3,MoveHorizontal,Scissors,SlidersHorizontal,
  Sparkles,SquareStack,Target,Type,X,
} from 'lucide-react';

const INK='#248b99',CYAN='#36E0F6';
const sections=[
  {icon:<Hand size={14}/>,title:'Select and multi-select',text:'Tap a clip to select it. With one clip selected, press and hold another clip to add it to the selection. Continue long-pressing more clips to build a multi-selection.'},
  {icon:<MoveHorizontal size={14}/>,title:'Move clips',text:'Drag from the middle of a clip after the movement threshold. Edge zones are reserved for trimming. Same-track collision guards stop clips from being dragged through neighboring clips.'},
  {icon:<Scissors size={14}/>,title:'Trim clips',text:'Drag the left or right edge. The invisible touch targets are wider than the visible handles so trimming is easier on a phone. The active edge displays timing while you drag.'},
  {icon:<Target size={14}/>,title:'Playhead and timeline',text:'Tap the ruler to seek. Use previous, center, and next controls to jump between clip edges and keyframes. Pinch the timeline to zoom.'},
  {icon:<Layers3 size={14}/>,title:'Tracks',text:'Projects start with Video, Overlay, and Audio tracks. Empty tracks can be removed. Add tracks from the timeline header. Hiding or removing tracks reduces timeline height so the editor workspace gets the space back.'},
  {icon:<SquareStack size={14}/>,title:'Groups',text:'Multi-select clips and use Group to bind them as a reusable selection. Selecting any member selects the group. Ungroup removes the relationship without deleting clips.'},
  {icon:<Combine size={14}/>,title:'Compound clips',text:'Select two or more clips on the same track and use Combine. The timeline becomes one compound clip while render and preview expand its children internally. Uncombine restores the child clips.'},
  {icon:<SlidersHorizontal size={14}/>,title:'Clip settings and keyframes',text:'Open Clips or Inspect for timing, transform, color, text, shape, media, and audio settings. Property keyframe controls create circle or compound-diamond markers visible on the timeline.'},
  {icon:<Sparkles size={14}/>,title:'Effects and templates',text:'Clip FX controls engine-backed blur, saturation, brightness, hue, and opacity. Visual FX exposes the 100-item Remotion asset library. Custom Templates edits template text, icons, and colors.'},
  {icon:<Type size={14}/>,title:'Preview transport',text:'Playback controls exist only below the Preview canvas: rewind, play or pause, fast-forward, and Snap Back. Drag, pinch, and rotate selected visual layers directly on the canvas.'},
  {icon:<Download size={14}/>,title:'Projects and export',text:'Project lets you start, save, load, import, or export project JSON. Export can render MP4, MOV, WebM, or any supported combination of the three.'},
] as const;

export const TouchEditorGuide:React.FC<{onClose:()=>void}>=({onClose})=><div
  role="dialog"
  aria-modal="true"
  aria-label="Touch editor guide"
  style={{position:'fixed',inset:0,zIndex:500,background:'rgba(255,255,255,.96)',padding:8,boxSizing:'border-box',overflow:'hidden'}}
>
  <div style={{width:'100%',height:'100%',border:`3px solid ${INK}`,borderRadius:8,background:'#fff',display:'grid',gridTemplateRows:'44px minmax(0,1fr)',overflow:'hidden',boxShadow:'5px 5px 0 rgba(54,224,246,.35)'}}>
    <header style={{display:'grid',gridTemplateColumns:'32px minmax(0,1fr) 32px',alignItems:'center',gap:6,padding:'4px 6px',borderBottom:`3px solid ${INK}`,background:CYAN}}>
      <CircleHelp size={18}/>
      <div><div style={{fontSize:12,fontWeight:1000,textTransform:'uppercase'}}>Touch Editor Guide</div><div style={{fontSize:7,fontWeight:900,textTransform:'uppercase',opacity:.65}}>Mobile gestures, timeline, clips, effects, templates and export</div></div>
      <button aria-label="Close guide" onClick={onClose} style={{width:30,height:30,border:`2px solid ${INK}`,borderRadius:5,background:'#fff',display:'grid',placeItems:'center',padding:0}}><X size={15}/></button>
    </header>
    <div style={{overflowY:'auto',overflowX:'hidden',padding:7,WebkitOverflowScrolling:'touch'}}>
      <div style={{display:'grid',gap:6}}>
        {sections.map(section=><section key={section.title} style={{border:`2px solid ${INK}`,borderRadius:6,padding:7,background:'#fff'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>{section.icon}<b style={{fontSize:9,fontWeight:1000,textTransform:'uppercase'}}>{section.title}</b></div>
          <div style={{fontSize:9,fontWeight:750,lineHeight:1.35}}>{section.text}</div>
        </section>)}
      </div>
    </div>
  </div>
</div>;
