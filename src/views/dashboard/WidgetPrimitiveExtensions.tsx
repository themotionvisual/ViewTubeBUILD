import React, { useMemo, useState } from "react"
import { AlertTriangle, Activity, ArrowRight, Award, BadgeDollarSign, BarChart3, Bell, Bookmark, Brain, CalendarDays, Camera, Check, ChevronDown, ChevronUp, CircleDollarSign, CirclePlay, Clock3, Coins, Download, Eye, FileText, Film, Filter, Flag, Flame, Folder, Gauge, Gem, Heart, Hourglass, Image, Info, Layers, Lightbulb, Link, ListChecks, ListPlus, Lock, Mail, MessageCircle, MessagesSquare, Mic, MonitorPlay, MousePointerClick, Music, OctagonAlert, Pencil, Percent, Play, Plus, Rocket, Search, Send, Settings, Share2, Sparkles, Star, Target, ThumbsUp, Timer, TrendingUp, Upload, UserPlus, Users, WandSparkles, X, Zap, type LucideIcon } from "lucide-react"
import { WIDGET_BADGE_SPECTRUM, WidgetSelect, WidgetSplitButton, resolveBadgeHue, type WidgetBadgeSpectrumName, type WidgetBadgeStatus, type WidgetBadgeTone, type WidgetSelectOption } from "./WidgetPrimitives"
import { VT_SPECTRUM_PALETTE_06, VT_VISUAL_METRIC_ORDER } from "../../styles/toolboxPalette"
import { widgetSizedControlClasses, type WidgetPrimitiveSize, type WidgetPrimitiveTone as PrimitiveTone, type WidgetPrimitiveTextFit } from "./widgetPrimitiveSystem"
import "./widgetVideoSelectButtonScroll.css"
import "./widgetCompoundPrimitives.css"

export type WidgetControlHeight = WidgetPrimitiveSize
export type WidgetPrimitiveTone = PrimitiveTone
export type WidgetTextFit = WidgetPrimitiveTextFit
export type WidgetSplitIconStyle = "white-on-color" | "color-on-light"
export const widgetControlHeightClass = (height:WidgetControlHeight=32) => `vt-size-${height} vt-sized-control is-height-${height}`
const toneClass = (tone:WidgetPrimitiveTone="default") => `vt-tone-${tone} is-tone-${tone}`
const primitiveClass = (height:WidgetControlHeight,tone:WidgetPrimitiveTone,textFit:WidgetTextFit="fixed") => widgetSizedControlClasses(height,tone,textFit)

export const WidgetSizedButton:React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>&{height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;textFit?:WidgetTextFit}> = ({height=32,tone="default",textFit="fixed",className="",type="button",...props}) => <button type={type} className={`vt-button vt-interactive ${primitiveClass(height,tone,textFit)} ${className}`.trim()} {...props}/>
export const WidgetLeftSplitButton:React.FC<Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,"children">&{icon:React.ReactNode;children:React.ReactNode;tone?:WidgetPrimitiveTone;iconStyle?:WidgetSplitIconStyle;width?:"auto"|"compact"|"wide"|"full";height?:WidgetControlHeight;textFit?:WidgetTextFit}> = ({icon,children,tone="default",iconStyle="white-on-color",width="auto",height=32,textFit="fixed",className="",...props}) => <WidgetSplitButton icon={icon} tone="neutral" width={width} className={`is-left-split ${primitiveClass(height,tone,textFit)} is-icon-${iconStyle} ${className}`.trim()} {...props}>{children}</WidgetSplitButton>
export const WidgetTextInput:React.FC<React.InputHTMLAttributes<HTMLInputElement>&{height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;textFit?:WidgetTextFit}> = ({height=32,tone="default",textFit="fixed",className="",placeholder="Type…",...props}) => <input className={`vt-input widget-text-input ${primitiveClass(height,tone,textFit)} ${className}`.trim()} placeholder={placeholder} {...props}/>
export const WidgetTextArea:React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>&{tone?:WidgetPrimitiveTone}> = ({tone="default",className="",placeholder="Type…",...props}) => <textarea className={`vt-textarea widget-text-area vt-tone-${tone} is-tone-${tone} ${className}`.trim()} placeholder={placeholder} {...props}/>
const selectMenuClass = (height:WidgetControlHeight,tone:WidgetPrimitiveTone) => `vt-size-${height} is-height-${height} vt-tone-${tone} is-tone-${tone}`
const SELECT_MENU_METRICS:Record<WidgetControlHeight,{font:number;icon:number;iconStroke:number;radius:number;stroke:number}> = {
  18:{font:8,icon:12,iconStroke:2,radius:2,stroke:0},
  24:{font:16,icon:18,iconStroke:2.25,radius:3,stroke:2},
  32:{font:21,icon:24,iconStroke:2.5,radius:4,stroke:2},
  38:{font:26,icon:29,iconStroke:2.75,radius:6,stroke:2},
}
const selectMenuStyle = (height:WidgetControlHeight) => {
 const metric=SELECT_MENU_METRICS[height]
 return {
  ["--vt-primitive-height" as string]:`${height}px`,
  ["--vt-primitive-font" as string]:`${metric.font}px`,
  ["--vt-primitive-icon" as string]:`${metric.icon}px`,
  ["--vt-primitive-icon-stroke" as string]:metric.iconStroke,
  ["--vt-primitive-radius" as string]:`${metric.radius}px`,
  ["--vt-primitive-stroke" as string]:`${metric.stroke}px`,
 } as React.CSSProperties
}
export const WidgetSizedSelect:React.FC<{value:string;onChange:(value:string)=>void;options:WidgetSelectOption[];label:string;placeholder?:string;disabled?:boolean;className?:string;style?:React.CSSProperties;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;textFit?:WidgetTextFit}> = ({height=32,tone="default",textFit="fixed",className="",...props}) => <WidgetSelect className={`${primitiveClass(height,tone,textFit)} ${className}`.trim()} contentClassName={selectMenuClass(height,tone)} contentStyle={selectMenuStyle(height)} {...props}/>

export interface WidgetVideoSelectOption {value:string;label:string;thumbnail?:string;meta?:string;duration?:string;views?:string}
const resolveVideoOptionMeta = (option:WidgetVideoSelectOption) => {
 const parts=String(option.meta||"").split("·").map(part=>part.trim()).filter(Boolean)
 const first=parts[0]||""
 const firstIsDuration=/^\d{1,2}:\d{2}(?::\d{2})?$/.test(first)
 return {
  duration: option.duration || (firstIsDuration?first:""),
  views: option.views || (firstIsDuration?parts.slice(1):parts).join(" · "),
 }
}

export const WidgetVideoSelect:React.FC<{value:string;onChange:(value:string)=>void;options:WidgetVideoSelectOption[];label:string;placeholder?:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;iconStyle?:WidgetSplitIconStyle;searchable?:boolean;disabled?:boolean;className?:string}> = ({value,onChange,options,label,placeholder="Select a video…",height=38,tone="default",iconStyle="white-on-color",searchable=true,disabled=false,className=""}) => {
 const[open,setOpen]=useState(false)
 const[query,setQuery]=useState("")
 const selected=options.find(o=>o.value===value)
 const visibleOptions=useMemo(()=>{const n=query.trim().toLowerCase();return n?options.filter(o=>`${o.label} ${o.meta||""} ${o.duration||""} ${o.views||""}`.toLowerCase().includes(n)):options},[options,query])
 return <div className={`widget-video-select ${open?"is-open":""} ${className}`.trim()}>
  <button type="button" className={`widget-video-select-trigger vt-interactive ${primitiveClass(height,tone)} is-icon-${iconStyle}`} aria-label={label} aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={()=>setOpen(c=>!c)}>
   <span className="widget-video-select-trigger-selector" aria-hidden="true"><span>VIDEO</span><span>{open?<ChevronUp/>:<ChevronDown/>}</span></span>
   <span className="widget-video-select-trigger-copy">{selected?.thumbnail?<img src={selected.thumbnail} alt=""/>:null}<span>{selected?.label||placeholder}</span></span>
  </button>
  {open?<div className={`widget-video-select-menu ${selectMenuClass(height,tone)}`} style={selectMenuStyle(height)} role="listbox" aria-label={label}>
   {searchable?<div className="widget-video-select-search"><WidgetSearchInput className="widget-video-select-menu-search-row" height={height} tone="primary" iconStyle={iconStyle} label={`Search ${label}`} value={query} onChange={e=>setQuery(e.currentTarget.value)} placeholder="Search videos…"/></div>:null}
   <div className="widget-video-select-options">
    {visibleOptions.map(option=>{const meta=resolveVideoOptionMeta(option);return <button key={option.value} type="button" role="option" aria-selected={option.value===value} className={`widget-video-select-option ${option.value===value?"is-selected":""}`.trim()} onClick={()=>{onChange(option.value);setOpen(false)}}>
     <span className="widget-video-select-option-media">
      {option.thumbnail?<img src={option.thumbnail} alt=""/>:<span className="widget-video-select-option-placeholder" aria-hidden="true"/>}
      {meta.duration?<span className="widget-video-select-duration">{meta.duration}</span>:null}
     </span>
     <span className="widget-video-select-option-copy">
      <strong>{option.label}</strong>
      {meta.views?<small className="widget-video-select-views">{meta.views}</small>:null}
     </span>
    </button>})}
   </div>
  </div>:null}
 </div>
}

export const WidgetProgressBar:React.FC<{value:number;max?:number;label?:React.ReactNode;displayValue?:React.ReactNode;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;className?:string;style?:React.CSSProperties}> = ({value,max=100,label,displayValue,height=24,tone="default",className="",style}) => {const percentage=Math.max(0,Math.min(100,max>0?(value/max)*100:0));return <div className={`widget-progress-bar ${primitiveClass(height,tone)} ${className}`.trim()} style={{...style,["--widget-progress" as string]:`${percentage}%`}} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0,Math.min(max,value))}><span className="widget-progress-bar-fill" aria-hidden="true"/><span className="widget-progress-bar-copy"><span>{label}</span><strong>{displayValue??`${Math.round(percentage)}%`}</strong></span></div>}

export const WidgetIconButton:React.FC<Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,"children">&{icon:React.ReactNode;label:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone}> = ({icon,label,height=32,tone="default",className="",type="button",...props}) => <button type={type} aria-label={label} title={label} className={`widget-icon-button vt-shape-square vt-interactive ${primitiveClass(height,tone)} ${className}`.trim()} {...props}><span className="widget-icon-button-glyph" aria-hidden="true">{icon}</span></button>
export const WidgetIconBadge:React.FC<{icon:React.ReactNode;label?:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;className?:string}> = ({icon,label,height=32,tone="default",className=""}) => <span role={label?"img":undefined} aria-label={label} aria-hidden={label?undefined:true} className={`widget-icon-badge vt-shape-square ${primitiveClass(height,tone)} ${className}`.trim()}><span className="widget-icon-button-glyph">{icon}</span></span>
export const WidgetStepper:React.FC<{value:number;onChange:(value:number)=>void;min?:number;max?:number;step?:number;label:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;className?:string}> = ({value,onChange,min=0,max=99,step=1,label,height=32,tone="default",className=""}) => {const clamp=(n:number)=>Math.max(min,Math.min(max,n));return <div className={`widget-stepper ${primitiveClass(height,tone)} ${className}`.trim()} role="group" aria-label={label}><button type="button" className="widget-stepper-step" aria-label={`Decrease ${label}`} disabled={value<=min} onClick={()=>onChange(clamp(value-step))}>−</button><span className="widget-stepper-value" aria-live="polite">{value}</span><button type="button" className="widget-stepper-step" aria-label={`Increase ${label}`} disabled={value>=max} onClick={()=>onChange(clamp(value+step))}>+</button></div>}
export const WidgetPagination:React.FC<{page:number;pageCount:number;onChange:(page:number)=>void;label?:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;className?:string}> = ({page,pageCount,onChange,label="Pagination",height=32,tone="default",className=""}) => {const pages=useMemo(()=>{if(pageCount<=5)return Array.from({length:pageCount},(_,i)=>i+1);const start=Math.max(1,Math.min(page-2,pageCount-4));return Array.from({length:5},(_,i)=>start+i)},[page,pageCount]);return <div className={`widget-pagination ${primitiveClass(height,tone)} ${className}`.trim()} role="navigation" aria-label={label}>{pages.map(entry=><button key={entry} type="button" className={`widget-pagination-page ${entry===page?"is-active":""}`.trim()} aria-current={entry===page?"page":undefined} aria-label={`Page ${entry}`} onClick={()=>onChange(entry)}>{entry}</button>)}</div>}
/**
 * Split-left badge. `spectrum` picks one of the twelve VT_SPECTRUM_PALETTE_06
 * slots for the icon bay and body tint; without it the badge follows the
 * widget's own colour through the tone tokens, which is the existing
 * behaviour and stays the default.
 */
export const WidgetLeftSplitBadge:React.FC<{icon:React.ReactNode;children:React.ReactNode;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;spectrum?:WidgetBadgeSpectrumName;iconStyle?:WidgetSplitIconStyle;className?:string}> = ({icon,children,height=32,tone="default",spectrum,iconStyle="white-on-color",className=""}) => <span className={`widget-split-badge is-left-split ${primitiveClass(height,tone)} ${spectrum?`is-spectrum-${spectrum}`:""} is-icon-${iconStyle} ${className}`.trim().replace(/\s+/g," ")}><span className="widget-split-badge-icon" aria-hidden="true">{icon}</span><span className="widget-split-badge-label">{children}</span></span>
export const WidgetSearchInput:React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>,"type">&{label:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;iconStyle?:WidgetSplitIconStyle}> = ({label,height=32,tone="default",iconStyle="white-on-color",className="",...props}) => <label className={`widget-search-input is-left-split ${primitiveClass(height,tone)} is-icon-${iconStyle} ${className}`.trim()}><span className="widget-search-input-icon" aria-hidden="true"><Search strokeWidth={2.5}/></span><span className="vt-visually-hidden">{label}</span><input type="search" aria-label={label} {...props}/></label>
export const WidgetLiveBadge:React.FC<{children?:React.ReactNode;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;className?:string}> = ({children="Live",height=24,tone="primary",className=""}) => <span className={`widget-live-badge ${primitiveClass(height,tone)} ${className}`.trim()}><span className="widget-live-badge-dot" aria-hidden="true"/><span>{children}</span></span>

export const WidgetSpectrumFillBadge:React.FC<{children:React.ReactNode;spectrum:WidgetBadgeSpectrumName;height?:18|24;className?:string}> = ({children,spectrum,height=24,className=""}) => <span className={`widget-spectrum-fill-badge ${widgetControlHeightClass(height)} is-spectrum-${spectrum} ${className}`.trim()}>{children}</span>
export const WidgetToggleSwitch:React.FC<{checked:boolean;onChange:(checked:boolean)=>void;label:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;disabled?:boolean;className?:string}> = ({checked,onChange,label,height=24,tone="default",disabled=false,className=""}) => <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className={`widget-toggle-switch ${primitiveClass(height,tone)} ${checked?"is-checked":""} ${className}`.trim()} onClick={()=>onChange(!checked)}><span className="widget-toggle-switch-thumb" aria-hidden="true"/></button>
export const WidgetRadio:React.FC<{checked:boolean;onChange:()=>void;label:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;disabled?:boolean;className?:string}> = ({checked,onChange,label,height=24,tone="default",disabled=false,className=""}) => <button type="button" role="radio" aria-checked={checked} aria-label={label} disabled={disabled} className={`widget-radio vt-shape-round ${primitiveClass(height,tone)} ${checked?"is-checked":""} ${className}`.trim()} onClick={onChange}><span className="widget-radio-dot" aria-hidden="true"/></button>
export const WidgetCheckbox:React.FC<{checked:boolean;onChange:(checked:boolean)=>void;label:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;disabled?:boolean;className?:string}> = ({checked,onChange,label,height=24,tone="default",disabled=false,className=""}) => <button type="button" role="checkbox" aria-checked={checked} aria-label={label} disabled={disabled} className={`widget-checkbox vt-shape-square ${primitiveClass(height,tone)} ${checked?"is-checked":""} ${className}`.trim()} onClick={()=>onChange(!checked)}>{checked?<X aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"/>:null}</button>


export type WidgetSectionBandTone = WidgetPrimitiveTone
export const WidgetSectionBand:React.FC<{children:React.ReactNode;tone?:WidgetSectionBandTone;edge?:"inset"|"full";className?:string}> = ({children,tone="primary",edge="full",className=""}) => (
 <div className={`widget-section-band vt-tone-${tone} is-tone-${tone} is-edge-${edge} ${className}`.trim()}>{children}</div>
)

export interface WidgetDataGridColumn {key:string;label:React.ReactNode;width?:string;align?:"start"|"center"|"end"}
export interface WidgetDataGridRow {id:string;cells:Record<string,React.ReactNode>}
export const WidgetDataGrid:React.FC<{ariaLabel:string;columns:readonly WidgetDataGridColumn[];rows:readonly WidgetDataGridRow[];minWidth?:number;className?:string}> = ({ariaLabel,columns,rows,minWidth=520,className=""}) => {
 const template=columns.map(column=>column.width||"minmax(0,1fr)").join(" ")
 return <div className={`widget-data-grid-scroll ${className}`.trim()}>
  <div className="widget-data-grid" role="table" aria-label={ariaLabel} style={{["--widget-data-grid-template" as string]:template,["--widget-data-grid-min" as string]:`${minWidth}px`}}>
   <div className="widget-data-grid-row is-header" role="row">
    {columns.map(column=><div key={column.key} className={`widget-data-grid-cell is-align-${column.align||"start"}`} role="columnheader">{column.label}</div>)}
   </div>
   {rows.map(row=><div key={row.id} className="widget-data-grid-row" role="row">
    {columns.map(column=><div key={column.key} className={`widget-data-grid-cell is-align-${column.align||"start"}`} role="cell">{row.cells[column.key]??null}</div>)}
   </div>)}
  </div>
 </div>
}

export interface WidgetChecklistProgressItem {id:string;label:React.ReactNode;detail?:React.ReactNode;badge?:React.ReactNode;disabled?:boolean}
export const WidgetChecklistProgress:React.FC<{items:readonly WidgetChecklistProgressItem[];checkedIds:readonly string[];onChange:(checkedIds:string[])=>void;label?:React.ReactNode;tone?:WidgetPrimitiveTone;className?:string}> = ({items,checkedIds,onChange,label="Completion",tone="primary",className=""}) => {
 const checked=new Set(checkedIds)
 const completed=items.reduce((total,item)=>total+(checked.has(item.id)?1:0),0)
 const percentage=items.length?Math.round((completed/items.length)*100):0
 const toggle=(id:string,next:boolean)=>onChange(next?[...checkedIds.filter(entry=>entry!==id),id]:checkedIds.filter(entry=>entry!==id))
 return <div className={`widget-checklist-progress ${className}`.trim()}>
  <div className="widget-checklist-progress-list">
   {items.map(item=><div key={item.id} className={`widget-checklist-progress-row ${checked.has(item.id)?"is-complete":""}`.trim()}>
    <WidgetCheckbox checked={checked.has(item.id)} onChange={next=>toggle(item.id,next)} label={typeof item.label==="string"?item.label:`Toggle ${item.id}`} height={24} tone={tone} disabled={item.disabled}/>
    <span className="widget-checklist-progress-copy"><strong>{item.label}</strong>{item.detail?<small>{item.detail}</small>:null}</span>
    {item.badge?<span className="widget-checklist-progress-badge">{item.badge}</span>:null}
   </div>)}
  </div>
  <WidgetProgressBar value={completed} max={Math.max(1,items.length)} label={label} displayValue={`${percentage}%`} height={24} tone={tone}/>
 </div>
}

export interface WidgetCalendarEvent {id:string;label:React.ReactNode;tone?:WidgetPrimitiveTone;disabled?:boolean}
export interface WidgetCalendarDay {id:string;label:React.ReactNode;events?:readonly WidgetCalendarEvent[]}
export const WidgetCalendarGrid:React.FC<{ariaLabel:string;days:readonly WidgetCalendarDay[];onEventClick?:(event:WidgetCalendarEvent,day:WidgetCalendarDay)=>void;className?:string}> = ({ariaLabel,days,onEventClick,className=""}) => (
 <div className={`widget-calendar-grid ${className}`.trim()} role="grid" aria-label={ariaLabel}>
  {days.map(day=><section key={day.id} className="widget-calendar-day" role="gridcell">
   <header className="widget-calendar-day-label">{day.label}</header>
   <div className="widget-calendar-events">
    {(day.events||[]).map(event=><button key={event.id} type="button" className={`widget-calendar-event vt-tone-${event.tone||"default"} is-tone-${event.tone||"default"}`} disabled={event.disabled} onClick={()=>onEventClick?.(event,day)}>{event.label}</button>)}
   </div>
  </section>)}
 </div>
)

export const WidgetAlphabeticalTag:React.FC<{letter:string;children?:React.ReactNode;selected?:boolean;removable?:boolean;onClick?:()=>void;className?:string}> = ({letter,children,selected=false,removable=false,onClick,className=""}) => {const normalized=letter.trim().slice(0,1).toUpperCase();const index=Math.max(0,Math.min(25,normalized.charCodeAt(0)-65));const color=VT_SPECTRUM_PALETTE_06[Math.round((index/25)*(VT_SPECTRUM_PALETTE_06.length-1))]||VT_SPECTRUM_PALETTE_06[0];const content=<><span>{children??normalized}</span><span className="widget-alpha-tag-action" aria-hidden="true">{removable?"−":selected?"×":"+"}</span></>;const style={"--widget-alpha-color":color} as React.CSSProperties;return onClick?<button type="button" className={`widget-alpha-tag ${selected?"is-selected":""} ${removable?"is-removable":""} ${className}`.trim()} style={style} onClick={onClick}>{content}</button>:<span className={`widget-alpha-tag ${selected?"is-selected":""} ${removable?"is-removable":""} ${className}`.trim()} style={style}>{content}</span>}
/**
 * Toast / alert. One bar with an icon bay, a title, optional detail and an
 * optional dismiss.
 *
 * `status` carries the meaning (positive / warning / danger / neutral) and
 * resolves to a spectrum slot through resolveBadgeHue, so an alert can never
 * introduce a colour from outside VT_SPECTRUM_PALETTE_06. `spectrum` overrides
 * the hue for catalogue and non-semantic use without changing the icon.
 *
 * Status is not carried by colour alone: each status has its own glyph, and
 * a danger or warning toast announces itself assertively.
 */
export const WidgetSplitCounter:React.FC<{value:number;onChange:(value:number)=>void;min?:number;max?:number;step?:number;label:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;className?:string}> = ({value,onChange,min=0,max=99,step=1,label,height=32,tone="default",className=""}) => {const clamp=(n:number)=>Math.max(min,Math.min(max,n));return <div className={`widget-split-counter ${primitiveClass(height,tone)} ${className}`.trim()} role="group" aria-label={label}><span className="widget-split-counter-controls"><button type="button" aria-label={`Increase ${label}`} disabled={value>=max} onClick={()=>onChange(clamp(value+step))}><ChevronUp aria-hidden="true"/></button><button type="button" aria-label={`Decrease ${label}`} disabled={value<=min} onClick={()=>onChange(clamp(value-step))}><ChevronDown aria-hidden="true"/></button></span><span className="widget-split-counter-value" aria-live="polite">{value}</span></div>}

const resolveSpectrumHue = (spectrum:WidgetBadgeSpectrumName) => VT_SPECTRUM_PALETTE_06[Math.max(0,WIDGET_BADGE_SPECTRUM.indexOf(spectrum))] || VT_SPECTRUM_PALETTE_06[0]

export const WIDGET_TINY_ICON_SET = {
 activity:Activity, arrow:ArrowRight, award:Award, analytics:BarChart3, bell:Bell,
 bookmark:Bookmark, brain:Brain, calendar:CalendarDays, camera:Camera, check:Check,
 revenue:CircleDollarSign, clock:Clock3, download:Download, eye:Eye, document:FileText,
 film:Film, filter:Filter, flag:Flag, flame:Flame, folder:Folder,
 gauge:Gauge, gem:Gem, heart:Heart, image:Image, info:Info,
 layers:Layers, idea:Lightbulb, link:Link, tasks:ListChecks, lock:Lock,
 mail:Mail, comment:MessageCircle, mic:Mic, video:MonitorPlay, music:Music,
 edit:Pencil, play:Play, plus:Plus, rocket:Rocket, search:Search,
 send:Send, settings:Settings, sparkles:Sparkles, star:Star, target:Target,
 trend:TrendingUp, upload:Upload, users:Users, magic:WandSparkles, zap:Zap,
 metricViews:CirclePlay, metricEngagedViews:MousePointerClick, metricWatchTime:Hourglass,
 metricSubscribers:UserPlus, metricRevenue:BadgeDollarSign, metricComments:MessagesSquare,
 metricAvp:Percent, metricAvd:Timer, metricLikes:ThumbsUp, metricRpm:Coins,
 metricShares:Share2, metricPlaylistSaves:ListPlus,
} satisfies Record<string,LucideIcon>
export type WidgetTinyIconName = keyof typeof WIDGET_TINY_ICON_SET

export const WIDGET_METRIC_ICON_SET = [
 { metric:VT_VISUAL_METRIC_ORDER[0], label:"Views", name:"metricViews", spectrum:"rose", color:VT_SPECTRUM_PALETTE_06[0] },
 { metric:VT_VISUAL_METRIC_ORDER[1], label:"Engaged Views", name:"metricEngagedViews", spectrum:"coral", color:VT_SPECTRUM_PALETTE_06[1] },
 { metric:VT_VISUAL_METRIC_ORDER[2], label:"Watch Time", name:"metricWatchTime", spectrum:"orange", color:VT_SPECTRUM_PALETTE_06[2] },
 { metric:VT_VISUAL_METRIC_ORDER[3], label:"Subscribers", name:"metricSubscribers", spectrum:"yellow", color:VT_SPECTRUM_PALETTE_06[3] },
 { metric:VT_VISUAL_METRIC_ORDER[4], label:"Revenue", name:"metricRevenue", spectrum:"lime", color:VT_SPECTRUM_PALETTE_06[4] },
 { metric:VT_VISUAL_METRIC_ORDER[5], label:"Comments", name:"metricComments", spectrum:"green", color:VT_SPECTRUM_PALETTE_06[5] },
 { metric:VT_VISUAL_METRIC_ORDER[6], label:"Average % Viewed", name:"metricAvp", spectrum:"teal", color:VT_SPECTRUM_PALETTE_06[6] },
 { metric:VT_VISUAL_METRIC_ORDER[7], label:"Average View Duration", name:"metricAvd", spectrum:"cyan", color:VT_SPECTRUM_PALETTE_06[7] },
 { metric:VT_VISUAL_METRIC_ORDER[8], label:"Likes", name:"metricLikes", spectrum:"royal", color:VT_SPECTRUM_PALETTE_06[8] },
 { metric:VT_VISUAL_METRIC_ORDER[9], label:"RPM", name:"metricRpm", spectrum:"purple", color:VT_SPECTRUM_PALETTE_06[9] },
 { metric:VT_VISUAL_METRIC_ORDER[10], label:"Shares", name:"metricShares", spectrum:"magenta", color:VT_SPECTRUM_PALETTE_06[10] },
 { metric:VT_VISUAL_METRIC_ORDER[11], label:"Playlist Saves", name:"metricPlaylistSaves", spectrum:"pink", color:VT_SPECTRUM_PALETTE_06[11] },
] as const satisfies readonly {metric:(typeof VT_VISUAL_METRIC_ORDER)[number];label:string;name:WidgetTinyIconName;spectrum:WidgetBadgeSpectrumName;color:string}[]

export const WidgetTinySpectrumIcon:React.FC<{name:WidgetTinyIconName;spectrum:WidgetBadgeSpectrumName;label?:string;height?:18|24;className?:string}> = ({name,spectrum,label,height=18,className=""}) => {const Icon=WIDGET_TINY_ICON_SET[name];return <span className={`widget-tiny-spectrum-icon is-height-${height} ${className}`.trim()} role={label?"img":undefined} aria-label={label} aria-hidden={label?undefined:true} style={{["--widget-tiny-icon-color" as string]:resolveSpectrumHue(spectrum)}}><Icon aria-hidden="true"/></span>}

export const WidgetAccentRailModule:React.FC<{spectrum:WidgetBadgeSpectrumName;title?:React.ReactNode;detail?:React.ReactNode;action?:React.ReactNode;className?:string;children?:React.ReactNode}> = ({spectrum,title,detail,action,className="",children}) => <section className={`widget-accent-rail-module ${className}`.trim()} style={{["--widget-module-accent" as string]:resolveSpectrumHue(spectrum)}}><span className="widget-accent-rail" aria-hidden="true"/><div className="widget-accent-rail-copy">{title?<strong>{title}</strong>:null}{detail?<small>{detail}</small>:null}{children}</div>{action?<div className="widget-accent-rail-action">{action}</div>:null}</section>

export const WidgetIconTitleModule:React.FC<{spectrum:WidgetBadgeSpectrumName;icon:React.ReactNode;title:React.ReactNode;subtitle?:React.ReactNode;action?:React.ReactNode;className?:string}> = ({spectrum,icon,title,subtitle,action,className=""}) => <section className={`widget-icon-title-module ${className}`.trim()} style={{["--widget-module-accent" as string]:resolveSpectrumHue(spectrum)}}><span className="widget-icon-title-module-icon" aria-hidden="true">{icon}</span><span className="widget-icon-title-module-copy"><strong>{title}</strong>{subtitle?<small>{subtitle}</small>:null}</span>{action?<span className="widget-icon-title-module-action">{action}</span>:null}</section>

export const WidgetRainbowDivider:React.FC<{className?:string}> = ({className=""}) => <span className={`widget-rainbow-divider ${className}`.trim()} aria-hidden="true"/>

export const WidgetRainbowPanel:React.FC<{children:React.ReactNode;className?:string}> = ({children,className=""}) => <section className={`widget-rainbow-panel ${className}`.trim()}>{children}<WidgetRainbowDivider/></section>

export const WidgetModuleHeader:React.FC<{title:React.ReactNode;subtitle?:React.ReactNode;icon?:React.ReactNode;controls?:React.ReactNode;className?:string}> = ({title,subtitle,icon,controls,className=""}) => <header className={`widget-module-header ${icon?"has-icon":""} ${className}`.trim()}>{icon?<span className="widget-module-header-icon" aria-hidden="true">{icon}</span>:null}<span className="widget-module-header-copy"><strong>{title}</strong>{subtitle?<small>{subtitle}</small>:null}</span>{controls?<span className="widget-module-header-controls">{controls}</span>:null}</header>

export const WidgetModuleFrame:React.FC<{header?:React.ReactNode;children:React.ReactNode;footer?:React.ReactNode;className?:string}> = ({header,children,footer,className=""}) => <section className={`widget-module-frame ${className}`.trim()}>{header}{<div className="widget-module-frame-body">{children}</div>}{footer?<div className="widget-module-frame-footer">{footer}</div>:null}</section>

/** Module-private: the `icon` prop is the public override. */
const WIDGET_TOAST_ICONS: Record<WidgetBadgeStatus, React.ReactNode> = {
  positive: <Check aria-hidden="true" />,
  warning: <AlertTriangle aria-hidden="true" />,
  danger: <OctagonAlert aria-hidden="true" />,
  neutral: <Info aria-hidden="true" />,
}

export const WidgetToast: React.FC<{
  title: React.ReactNode
  detail?: React.ReactNode
  status?: WidgetBadgeStatus
  spectrum?: WidgetBadgeSpectrumName
  icon?: React.ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
}> = ({ title, detail, status = "neutral", spectrum, icon, onDismiss, dismissLabel = "Dismiss", className = "" }) => {
  const urgent = status === "danger" || status === "warning"
  return (
    <div
      className={`widget-toast ${spectrum ? `is-spectrum-${spectrum}` : ""} is-${status} ${className}`.trim().replace(/\s+/g, " ")}
      data-widget-toast-status={status}
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      style={spectrum ? undefined : ({ "--widget-toast-hue": resolveBadgeHue(undefined, status) } as React.CSSProperties)}
    >
      <span className="widget-toast-icon" aria-hidden="true">{icon ?? WIDGET_TOAST_ICONS[status]}</span>
      <div className="widget-toast-body">
        <div className="widget-toast-title">{title}</div>
        {detail ? <div className="widget-toast-detail">{detail}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className="widget-toast-dismiss" aria-label={dismissLabel} onClick={onDismiss}>
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export { WIDGET_BADGE_SPECTRUM }
export type { WidgetBadgeTone }
