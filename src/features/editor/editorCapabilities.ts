export type EditorCapabilityStatus = 'active' | 'available' | 'planned';
export type EditorCapabilityCategory = 'media' | 'edit' | 'text' | 'audio' | 'transitions' | 'effects' | 'templates' | 'export' | 'settings';
export type EditorSelectionKind = 'none' | 'video' | 'audio' | 'overlay' | 'caption' | 'transition' | 'track';

export interface EditorCapability {
  id: string;
  category: EditorCapabilityCategory;
  label: string;
  status: EditorCapabilityStatus;
  selection?: EditorSelectionKind[];
  action?: string;
  keywords?: string[];
}

export const EDITOR_CAPABILITIES: EditorCapability[] = [
  {id:'history.undo',category:'edit',label:'Undo',status:'active',action:'undo'},
  {id:'history.redo',category:'edit',label:'Redo',status:'active',action:'redo'},
  {id:'timing.trim',category:'edit',label:'Trim',status:'active',selection:['video','audio','overlay','caption']},
  {id:'timing.split',category:'edit',label:'Split',status:'active',selection:['video','audio','overlay','caption'],action:'splitClipAtPlayhead'},
  {id:'timing.duplicate',category:'edit',label:'Duplicate',status:'active',selection:['video','audio','overlay','caption'],action:'duplicateClip'},
  {id:'timing.delete',category:'edit',label:'Delete',status:'active',selection:['video','audio','overlay','caption'],action:'deleteClips'},
  {id:'timing.rippleDelete',category:'edit',label:'Ripple Delete',status:'active',selection:['video','audio','overlay','caption'],action:'rippleDeleteClips'},
  {id:'timing.slip',category:'edit',label:'Slip',status:'active',selection:['video','audio']},
  {id:'timing.slide',category:'edit',label:'Slide',status:'active',selection:['video','audio']},
  {id:'transform.position',category:'edit',label:'Position',status:'active',selection:['video','overlay','caption'],action:'updateClipTransform'},
  {id:'transform.scale',category:'edit',label:'Scale',status:'active',selection:['video','overlay','caption'],action:'updateClipTransform'},
  {id:'transform.rotate',category:'edit',label:'Rotate',status:'active',selection:['video','overlay','caption'],action:'updateClipTransform'},
  {id:'transform.crop',category:'edit',label:'Crop',status:'active',selection:['video'],action:'updateClipTransform'},
  {id:'transform.mask',category:'edit',label:'Mask',status:'planned',selection:['video','overlay']},
  {id:'media.import',category:'media',label:'Import',status:'available'},
  {id:'media.vault',category:'media',label:'Vault',status:'available'},
  {id:'media.record',category:'media',label:'Record',status:'planned'},
  {id:'text.add',category:'text',label:'Add Text',status:'active',action:'addClip'},
  {id:'text.typography',category:'text',label:'Typography',status:'planned',selection:['overlay','caption']},
  {id:'audio.mute',category:'audio',label:'Mute Track',status:'active',selection:['track'],action:'muteTrack'},
  {id:'audio.volume',category:'audio',label:'Volume',status:'active',selection:['audio'],action:'updateClip'},
  {id:'audio.playbackRate',category:'audio',label:'Playback Rate',status:'active',selection:['audio'],action:'updateClip'},
  {id:'audio.fade',category:'audio',label:'Audio Fade',status:'planned',selection:['audio']},
  {id:'transition.add',category:'transitions',label:'Add Transition',status:'active',selection:['video'],action:'addTransition'},
  {id:'transition.remove',category:'transitions',label:'Remove Transition',status:'active',selection:['transition'],action:'removeTransition'},
  {id:'transition.presentation',category:'transitions',label:'Transition Presentation',status:'available',selection:['transition']},
  {id:'effects.color',category:'effects',label:'Color',status:'planned',selection:['video','overlay']},
  {id:'effects.blur',category:'effects',label:'Blur',status:'planned',selection:['video','overlay']},
  {id:'templates.library',category:'templates',label:'Template Library',status:'active'},
  {id:'export.render',category:'export',label:'Render Video',status:'available'},
  {id:'settings.timeline',category:'settings',label:'Timeline Settings',status:'available'},
  {id:'settings.preview',category:'settings',label:'Preview Settings',status:'available'},
  {id:'settings.performance',category:'settings',label:'Performance',status:'available'},
  {id:'settings.diagnostics',category:'settings',label:'Diagnostics',status:'available'},
];

export const capabilitiesForCategory=(category:EditorCapabilityCategory)=>EDITOR_CAPABILITIES.filter(c=>c.category===category);
export const capabilityById=(id:string)=>EDITOR_CAPABILITIES.find(c=>c.id===id);
export const capabilitiesForSelection=(kind:EditorSelectionKind)=>EDITOR_CAPABILITIES.filter(c=>!c.selection||c.selection.includes(kind));
