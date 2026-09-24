import { z } from "zod"
import { DASHBOARD_LAYOUT_BACKUP_KEY, DASHBOARD_LAYOUT_STORAGE_KEY, DASHBOARD_SCHEMA_VERSION, DASHBOARD_TOKENS, HEIGHT_BUCKET_ORDER, LEGACY_DASHBOARD_LAYOUT_STORAGE_KEYS, SIZE_BUCKET_ORDER } from "./tokens"
import { DASHBOARD_WIDGET_BY_ID, DASHBOARD_WIDGET_REGISTRY } from "./WidgetRegistry"
import type { DashboardHeightBucket, DashboardLayoutState, DashboardSizeBucket, WidgetDefinition, WidgetInstanceState } from "./types"

const ALL_READY_WIDGETS_VISIBLE_MIGRATION_KEY = "viewtube.dashboard.all-ready-widgets-visible.v2"
const REDESIGNED_WIDGETS_VISIBLE_MIGRATION_KEY = "viewtube.dashboard.redesigned-widgets-visible.v1"
export const REDESIGNED_DASHBOARD_WIDGET_IDS = [
 "daily-oracle",
 "brain-hub",
 "flight-check",
 "channel-progress",
 "next-best-action",
 "anomaly-radar",
 "opportunity-radar",
 "content-pipeline",
 "audience-requests",
 "video-director",
 "video-asset-engine",
] as const
const LegacyWidgetInstanceSchema = z.object({ collapsed:z.boolean().optional(), size:z.string().optional(), height:z.string().optional() }).passthrough()
const ImportedDashboardLayoutSchema = z.object({ schemaVersion:z.number().optional(), locked:z.boolean().optional(), order:z.array(z.string()).optional(), hidden:z.array(z.string()).optional(), instances:z.record(z.string(),LegacyWidgetInstanceSchema).optional() }).passthrough()
const SIZE_TO_INDEX=Object.fromEntries(SIZE_BUCKET_ORDER.map((size,index)=>[size,index])) as Record<DashboardSizeBucket,number>
const HEIGHT_TO_INDEX=Object.fromEntries(HEIGHT_BUCKET_ORDER.map((height,index)=>[height,index])) as Record<DashboardHeightBucket,number>
const orderedDefinitions=():WidgetDefinition[]=>[...DASHBOARD_WIDGET_REGISTRY].sort((a,b)=>a.defaultOrder-b.defaultOrder)
const defaultInstanceFor=(widget:WidgetDefinition):WidgetInstanceState=>({collapsed:false,size:widget.defaultSize,height:widget.defaultHeight})
const uniqueKnownIds=(ids:readonly string[]):string[]=>{const seen=new Set<string>();return ids.filter(id=>{if(!DASHBOARD_WIDGET_BY_ID[id]||seen.has(id))return false;seen.add(id);return true})}
const clampDimensions=(widget:WidgetDefinition,size:string|undefined,height:string|undefined):Pick<WidgetInstanceState,"size"|"height">=>{const requestedSize=SIZE_BUCKET_ORDER.includes(size as DashboardSizeBucket)?size as DashboardSizeBucket:widget.defaultSize;const requestedHeight=HEIGHT_BUCKET_ORDER.includes(height as DashboardHeightBucket)?height as DashboardHeightBucket:widget.defaultHeight;const targetSizeIndex=SIZE_TO_INDEX[requestedSize];const targetHeightIndex=HEIGHT_TO_INDEX[requestedHeight];const fallback={size:widget.defaultSize,height:widget.defaultHeight};return widget.supportedDimensions.reduce((nearest,candidate)=>{const nearestDistance=Math.abs(SIZE_TO_INDEX[nearest.size]-targetSizeIndex)+Math.abs(HEIGHT_TO_INDEX[nearest.height]-targetHeightIndex);const candidateDistance=Math.abs(SIZE_TO_INDEX[candidate.size]-targetSizeIndex)+Math.abs(HEIGHT_TO_INDEX[candidate.height]-targetHeightIndex);return candidateDistance<nearestDistance?candidate:nearest},fallback)}

export const buildDefaultDashboardLayout=():DashboardLayoutState=>{const definitions=orderedDefinitions();return{schemaVersion:DASHBOARD_SCHEMA_VERSION,locked:false,order:definitions.map(w=>w.id),hidden:definitions.filter(w=>w.status!=="ready").map(w=>w.id),instances:Object.fromEntries(definitions.map(w=>[w.id,defaultInstanceFor(w)]))}}
export const normalizeDashboardLayout=(input:unknown):DashboardLayoutState=>{const parsed=ImportedDashboardLayoutSchema.safeParse(input);if(!parsed.success)return buildDefaultDashboardLayout();const definitions=orderedDefinitions();const defaultLayout=buildDefaultDashboardLayout();const requestedOrder=uniqueKnownIds(parsed.data.order??[]);const requestedOrderSet=new Set(requestedOrder);const missingIds=definitions.map(w=>w.id).filter(id=>!requestedOrderSet.has(id));const order=requestedOrder.length>0?[...requestedOrder,...missingIds]:defaultLayout.order;const hidden=new Set(requestedOrder.length>0?uniqueKnownIds(parsed.data.hidden??[]):defaultLayout.hidden);const instances=Object.fromEntries(definitions.map(widget=>{const candidate=parsed.data.instances?.[widget.id];const dimensions=clampDimensions(widget,candidate?.size,candidate?.height);return[widget.id,{collapsed:candidate?.collapsed??false,...dimensions} satisfies WidgetInstanceState]}));return{schemaVersion:DASHBOARD_SCHEMA_VERSION,locked:parsed.data.locked??false,order,hidden:order.filter(id=>hidden.has(id)),instances}}
const getStorage=():Storage|null=>typeof window==="undefined"?null:window.localStorage
export const loadDashboardLayout=():DashboardLayoutState=>{const storage=getStorage();if(!storage)return buildDefaultDashboardLayout();const keys=[DASHBOARD_LAYOUT_STORAGE_KEY,...LEGACY_DASHBOARD_LAYOUT_STORAGE_KEYS];for(const key of keys){const raw=storage.getItem(key);if(!raw)continue;try{const parsed=JSON.parse(raw) as unknown;const layout=normalizeDashboardLayout(parsed);const shouldRevealReadyWidgets=storage.getItem(ALL_READY_WIDGETS_VISIBLE_MIGRATION_KEY)!=="1";const shouldRevealRedesignedWidgets=storage.getItem(REDESIGNED_WIDGETS_VISIBLE_MIGRATION_KEY)!=="1";let migratedLayout=shouldRevealReadyWidgets?revealAllReadyDashboardWidgets(layout):layout;if(shouldRevealRedesignedWidgets)migratedLayout=revealRedesignedDashboardWidgets(migratedLayout);if(key!==DASHBOARD_LAYOUT_STORAGE_KEY||shouldRevealReadyWidgets||shouldRevealRedesignedWidgets){if(key!==DASHBOARD_LAYOUT_STORAGE_KEY)storage.setItem(DASHBOARD_LAYOUT_BACKUP_KEY,JSON.stringify({sourceKey:key,raw}));storage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY,JSON.stringify(migratedLayout))}if(shouldRevealReadyWidgets)storage.setItem(ALL_READY_WIDGETS_VISIBLE_MIGRATION_KEY,"1");if(shouldRevealRedesignedWidgets)storage.setItem(REDESIGNED_WIDGETS_VISIBLE_MIGRATION_KEY,"1");return migratedLayout}catch{continue}}const fresh=buildDefaultDashboardLayout();storage.setItem(ALL_READY_WIDGETS_VISIBLE_MIGRATION_KEY,"1");storage.setItem(REDESIGNED_WIDGETS_VISIBLE_MIGRATION_KEY,"1");return fresh}
export const saveDashboardLayout=(layout:DashboardLayoutState):void=>{getStorage()?.setItem(DASHBOARD_LAYOUT_STORAGE_KEY,JSON.stringify(normalizeDashboardLayout(layout)))}
export const resetDashboardLayout=():DashboardLayoutState=>{const fresh=buildDefaultDashboardLayout();saveDashboardLayout(fresh);return fresh}
export const revealAllReadyDashboardWidgets=(layout:DashboardLayoutState):DashboardLayoutState=>({...layout,hidden:layout.order.filter(id=>DASHBOARD_WIDGET_BY_ID[id]?.status!=="ready")})
export const revealRedesignedDashboardWidgets=(layout:DashboardLayoutState):DashboardLayoutState=>{const redesigned=new Set<string>(REDESIGNED_DASHBOARD_WIDGET_IDS);return{...layout,hidden:layout.hidden.filter(id=>!redesigned.has(id))}}
export const exportDashboardLayout=(layout:DashboardLayoutState):string=>JSON.stringify(normalizeDashboardLayout(layout),null,2)
export const importDashboardLayout=(raw:string):DashboardLayoutState=>{const parsedJson=JSON.parse(raw) as unknown;const parsed=ImportedDashboardLayoutSchema.safeParse(parsedJson);if(!parsed.success)throw new Error("Invalid dashboard layout");const normalized=normalizeDashboardLayout(parsed.data);saveDashboardLayout(normalized);return normalized}

/* Resize is bounded, never cyclic. A click cannot jump from the largest supported size back to the smallest. */
const adjacentSupportedBucket=<T extends DashboardSizeBucket|DashboardHeightBucket>(supported:readonly T[],current:T,direction:1|-1):T=>{if(!supported.length)return current;const currentIndex=supported.indexOf(current);const safeIndex=currentIndex<0?0:currentIndex;const nextIndex=Math.min(supported.length-1,Math.max(0,safeIndex+direction));return supported[nextIndex]??current}
export const nextSizeBucket=(widgetId:string,current:DashboardSizeBucket):DashboardSizeBucket=>{const widget=DASHBOARD_WIDGET_BY_ID[widgetId];return widget?adjacentSupportedBucket(widget.supportedSizes,current,1):current}
export const prevSizeBucket=(widgetId:string,current:DashboardSizeBucket):DashboardSizeBucket=>{const widget=DASHBOARD_WIDGET_BY_ID[widgetId];return widget?adjacentSupportedBucket(widget.supportedSizes,current,-1):current}
export const nextHeightBucket=(widgetId:string,current:DashboardHeightBucket):DashboardHeightBucket=>{const widget=DASHBOARD_WIDGET_BY_ID[widgetId];return widget?adjacentSupportedBucket(widget.supportedHeights,current,1):current}
export const prevHeightBucket=(widgetId:string,current:DashboardHeightBucket):DashboardHeightBucket=>{const widget=DASHBOARD_WIDGET_BY_ID[widgetId];return widget?adjacentSupportedBucket(widget.supportedHeights,current,-1):current}

/* Layout classes are semantic only. Actual width/height geometry is owned by DashboardCanvas CSS variables, not viewport breakpoints. */
export const sizeBucketClassName=(size:DashboardSizeBucket):string=>`vt-size-${size}`
export const heightBucketClassName=(height:DashboardHeightBucket):string=>`vt-height-${height}`
export const widgetCardShellClass=`rounded-[${DASHBOARD_TOKENS.radiusLg}px] border-[${DASHBOARD_TOKENS.strokeLevel1}px] border-black bg-white overflow-hidden`
