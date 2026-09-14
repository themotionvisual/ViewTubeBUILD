import React,{useState}from'react';
import type{EditorStore}from'../state/editorState';
import{EditorFeatureManifest}from'./EditorFeatureManifest';
import{EditorNavigationPage,type EditorNavPage,type EditorSettingsModel,EDITOR_NAV_ITEMS}from'./EditorNavigationPages';
import type{EditorCapabilityCategory}from'../../editorCapabilities';

const INK='#248b99',CYAN='#36E0F6';
const pageCategory:Partial<Record<EditorNavPage,EditorCapabilityCategory>>={select:'edit',media:'media',text:'text',audio:'audio',transitions:'transitions',effects:'effects',templates:'templates',export:'export',settings:'settings'};

/** Full editor manifestation surface: page navigation, live page UI, and capability map side-by-side. */
export const EditorFeaturePages:React.FC<{store:EditorStore;settings?:EditorSettingsModel;initialPage?:EditorNavPage}>=({store,settings,initialPage='select'})=>{
 const[page,setPage]=useState<EditorNavPage>(initialPage);const category=pageCategory[page];
 return <div data-editor-feature-pages style={{display:'grid',gridTemplateRows:'auto minmax(0,1fr)',gap:4,minWidth:0,minHeight:0,height:'100%',background:'#f3f3f3',padding:4,boxSizing:'border-box'}}>
  <nav aria-label="Editor pages" style={{display:'flex',gap:3,overflowX:'auto',paddingBottom:2}}>{EDITOR_NAV_ITEMS.map(item=><button key={item.id} onClick={()=>setPage(item.id)} aria-pressed={page===item.id} style={{flex:'0 0 auto',minHeight:36,minWidth:52,border:`2px solid ${INK}`,borderRadius:5,background:page===item.id?CYAN:'#fff',fontSize:7,fontWeight:900,textTransform:'uppercase',boxShadow:'2px 2px 0 rgba(54,224,246,.25)'}}><span style={{display:'block',fontSize:12}}>{item.icon}</span>{item.label}</button>)}</nav>
  <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.35fr) minmax(118px,.65fr)',gap:4,minHeight:0,minWidth:0}}>
   <main style={{minHeight:0,overflow:'auto',border:`3px solid ${INK}`,borderRadius:7,background:'#fff',padding:6}}><EditorNavigationPage page={page} store={store} settings={settings}/></main>
   <aside aria-label={`${page} feature map`} style={{minHeight:0,overflow:'auto'}}>{category&&<EditorFeatureManifest compact category={category}/>}</aside>
  </div>
 </div>;
};
