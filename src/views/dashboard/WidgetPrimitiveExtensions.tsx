import React, { useMemo, useRef, useState } from "react"
import { AlertTriangle, Check, ChevronDown, ChevronUp, FileVideo2, Info, OctagonAlert, Search, X } from "lucide-react"
import { WIDGET_BADGE_SPECTRUM, WidgetSelect, WidgetSplitButton, resolveBadgeHue, type WidgetBadgeSpectrumName, type WidgetBadgeStatus, type WidgetBadgeTone, type WidgetSelectOption } from "./WidgetPrimitives"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import { widgetSizedControlClasses, type WidgetPrimitiveSize, type WidgetPrimitiveTone as PrimitiveTone, type WidgetPrimitiveTextFit } from "./widgetPrimitiveSystem"
import "./widgetVideoSelectButtonScroll.css"

export type WidgetControlHeight = WidgetPrimitiveSize
export type WidgetPrimitiveTone = PrimitiveTone
export type WidgetTextFit = WidgetPrimitiveTextFit
export type WidgetSplitIconStyle = "white-on-color" | "color-on-light"
export const widgetControlHeightClass = (height:WidgetControlHeight=32) => `vt-size-${height} vt-sized-control is-height-${height}`
const toneClass = (tone:WidgetPrimitiveTone="default") => `vt-tone-${tone} is-tone-${tone}`
const primitiveClass = (height:WidgetControlHeight,tone:WidgetPrimitiveTone,textFit:WidgetTextFit="fixed") => widgetSizedControlClasses(height,tone,textFit)

export const WidgetSizedButton:React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>&{height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;textFit?:WidgetTextFit}> = ({height=32,tone="default",textFit="fixed",className="",type="button",...props}) => <button type={type} className={`vt-button vt-interactive ${primitiveClass(height,tone,textFit)} ${className}`.trim()} {...props}/>
export const WidgetLeftSplitButton:React.FC<Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,"children">&{icon:React.ReactNode;children:React.ReactNode;tone?:WidgetPrimitiveTone;iconStyle?:WidgetSplitIconStyle;width?:"auto"|"compact"|"wide"|"full";height?:WidgetControlHeight;textFit?:WidgetTextFit}> = ({icon,children,tone="default",iconStyle="white-on-color",width="auto",height=32,textFit="fixed",className="",...props}) => <WidgetSplitButton icon={icon} tone="neutral" width={width} className={`is-left-split ${primitiveClass(height,tone,textFit)} is-icon-${iconStyle} ${className}`.trim()} {...props}>{children}</WidgetSplitButton>
export const WidgetTextInput:React.FC<React.InputHTMLAttributes<HTMLInputElement>&{height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;textFit?:WidgetTextFit}> = ({height=32,tone="default",textFit="fixed",className="",...props}) => <input className={`vt-input widget-text-input ${primitiveClass(height,tone,textFit)} ${className}`.trim()} {...props}/>
export const WidgetSizedSelect:React.FC<{value:string;onChange:(value:string)=>void;options:WidgetSelectOption[];label:string;placeholder?:string;disabled?:boolean;className?:string;style?:React.CSSProperties;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;textFit?:WidgetTextFit}> = ({height=32,tone="default",textFit="fixed",className="",...props}) => <WidgetSelect className={`${primitiveClass(height,tone,textFit)} ${className}`.trim()} contentClassName={primitiveClass(height,tone,textFit)} {...props}/>

export interface WidgetVideoSelectOption {value:string;label:string;thumbnail?:string;meta?:string}
export const WidgetVideoSelect:React.FC<{value:string;onChange:(value:string)=>void;options:WidgetVideoSelectOption[];label:string;placeholder?:string;height?:WidgetControlHeight;tone?:WidgetPrimitiveTone;iconStyle?:WidgetSplitIconStyle;searchable?:boolean;disabled?:boolean;className?:string}> = ({value,onChange,options,label,placeholder="Select a video…",height=38,tone="default",iconStyle="white-on-color",searchable=true,disabled=false,className=""}) => {
 const[open,setOpen]=useState(false);const[query,setQuery]=useState("");const listRef=useRef<HTMLDivElement>(null);const selected=options.find(o=>o.value===value);const visibleOptions=useMemo(()=>{const n=query.trim().toLowerCase();return n?options.filter(o=>`${o.label} ${o.meta||""}`.toLowerCase().includes(n)):options},[options,query]);const scrollList=(direction:-1|1)=>{const list=listRef.current;if(!list)return;const row=list.querySelector<HTMLElement>(".widget-video-select-option");const distance=(row?.offsetHeight||Math.max(height,38))*Math.min(3,Math.max(1,visibleOptions.length));list.scrollBy({top:direction*distance,behavior:"smooth"})};return <div className={`widget-video-select ${open?"is-open":""} ${className}`.trim()}><button type="button" className={`widget-video-select-trigger vt-interactive ${primitiveClass(height,tone)} is-icon-${iconStyle}`} aria-label={label} aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={()=>setOpen(c=>!c)}><span className="widget-video-select-trigger-icon" aria-hidden="true"><FileVideo2 strokeWidth={2.5}/></span><span className="widget-video-select-trigger-copy">{selected?.thumbnail?<img src={selected.thumbnail} alt=""/>:null}<span>{selected?.label||placeholder}</span></span><span className="widget-video-select-trigger-chevron" aria-hidden="true"><ChevronDown strokeWidth={2.5}/></span></button>{open?<div className={`widget-video-select-menu ${primitiveClass(height,tone)}`} role="listbox" aria-label={label}>{searchable?<div className="widget-video-select-search"><Search size={13} aria-hidden="true"/><WidgetTextInput height={32} tone="secondary" value={query} onChange={e=>setQuery(e.currentTarget.value)} placeholder="Search videos…"/></div>:null}<button type="button" className="widget-video-select-scroll-button is-top" aria-label={`Scroll ${label} up`} onClick={()=>scrollList(-1)} disabled={visibleOptions.length<=4}><ChevronUp aria-hidden="true"/></button><div className="widget-video-select-options" ref={listRef}>{visibleOptions.map(option=><button key={option.value} type="button" role="option" aria-selected={option.value===value} className={`widget-video-select-option ${option.value===value?"is-selected":""}`.trim()} onClick={()=>{onChange(option.value);setOpen(false)}}>{option.thumbnail?<img src={option.thumbnail} alt=""/>:<span/>}<span className="widget-video-select-option-copy"><strong>{option.label}</strong>{option.meta?<small>{option.meta}</small>:null}</span></button>)}</div><button type="button" className="widget-video-select-scroll-button is-bottom" aria-label={`Scroll ${label} down`} onClick={()=>scrollList(1)} disabled={visibleOptions.length<=4}><ChevronDown aria-hidden="true"/></button></div>:null}</div>}

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
