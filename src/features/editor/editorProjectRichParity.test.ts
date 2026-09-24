import {describe,expect,it} from 'vitest';
import {
  desktopProjectCanRoundTripThroughMobile,
  desktopProjectToMobileBridgeProject,
  mobileBridgeProjectToDesktopProject,
  type DesktopProjectRecord,
} from './editorDesktopProjectAdapter';
import {editorProjectFingerprint} from './editorDesktopBridgeRuntime';

const richProject:DesktopProjectRecord={
  schemaVersion:'EditorProjectV2',
  contentBuildId:'cb-rich-parity',
  legacyProjectId:'legacy-rich-parity',
  durationSec:24,
  meta:{
    durationSec:24,
    aspectRatio:'16:9',
    projectName:'Rich Parity Fixture',
    contentBuildId:'cb-rich-parity',
    legacyProjectId:'legacy-rich-parity',
    fps:30,
    canvas:{width:1920,height:1080},
  },
  tracks:[
    {id:'v1',name:'V1',kind:'visual',visible:true,locked:false,muted:false,color:'#ff765d'},
    {id:'a1',name:'A1',kind:'audio',visible:true,locked:false,muted:false,color:'#36e0f6'},
    {id:'o1',name:'Overlay',kind:'overlay',visible:true,locked:false,muted:false,color:'#ffff61'},
    {id:'c1',name:'Captions',kind:'caption',visible:true,locked:false,muted:false,color:'#fa618a'},
  ],
  layers:[
    {
      id:'layer-video-a',
      trackId:'v1',
      type:'video',
      visible:true,
      payload:{
        src:'/fixtures/video-a.mp4',
        x:12,
        y:-8,
        width:1920,
        height:1080,
        scale:1.05,
        rotation:2,
        crop:{top:0.02,right:0.03,bottom:0.04,left:0.05},
        blur:2.5,
        saturation:1.15,
        brightness:0.92,
        hue:-18,
        contrast:1.08,
        sepia:0.12,
        grayscale:0.06,
        opacity:0.88,
        fxOrder:['hue','blur','contrast','saturation','brightness','sepia','grayscale','opacity'],
        fxDisabled:{sepia:true},
        fxBypass:false,
      },
      customLayerState:{selectedHandle:'se'},
    },
    {
      id:'layer-video-b',
      trackId:'v1',
      type:'video',
      visible:true,
      payload:{src:'/fixtures/video-b.mp4',x:0,y:0,width:1920,height:1080,opacity:1},
    },
    {
      id:'layer-audio',
      trackId:'a1',
      type:'audio',
      visible:true,
      payload:{
        src:'/fixtures/music.wav',
        volume:0.72,
        pan:-0.15,
        fadeInSec:0.4,
        fadeOutSec:0.8,
        playbackRate:1.25,
        muted:false,
      },
    },
    {
      id:'layer-asset',
      trackId:'o1',
      type:'remotion-asset',
      visible:true,
      payload:{
        assetId:'motion-003',
        primary:'#36E0F6',
        accent:'#FA618A',
        opacity:0.9,
      },
    },
    {
      id:'layer-caption',
      trackId:'c1',
      type:'text',
      visible:true,
      payload:{
        text:'A canonical caption',
        fontFamily:'Inter',
        fontSize:72,
        fontWeight:900,
        x:0,
        y:360,
        width:1500,
        height:160,
      },
    },
  ],
  clips:[
    {
      id:'video-a',
      trackId:'v1',
      layerId:'layer-video-a',
      start:0,
      end:6,
      sourceInSec:1.25,
      sourceOutSec:7.25,
      keyframes:[
        {id:'kf-a0',offsetSec:0,values:{x:12,y:-8,scale:1.05,opacity:0.88,blur:2.5,contrast:1.08,sepia:0.12,grayscale:0.06}},
        {id:'kf-a1',offsetSec:5.5,values:{x:80,y:12,scale:1.12,opacity:1,blur:0,contrast:1.2,sepia:0,grayscale:0}},
      ],
      playbackRate:1,
    },
    {
      id:'video-b',
      trackId:'v1',
      layerId:'layer-video-b',
      start:6,
      end:12,
      sourceInSec:0,
      sourceOutSec:6,
      keyframes:[],
    },
    {
      id:'music',
      trackId:'a1',
      layerId:'layer-audio',
      start:0,
      end:18,
      sourceInSec:2,
      sourceOutSec:20,
      keyframes:[
        {id:'audio-kf-0',offsetSec:0,values:{volume:0.72}},
        {id:'audio-kf-1',offsetSec:10,values:{volume:0.4}},
      ],
    },
    {
      id:'remotion-orbit',
      trackId:'o1',
      layerId:'layer-asset',
      start:2,
      end:10,
      clipType:'remotion-asset',
      remotionAssetId:'motion-003',
      remotionAssetName:'Orbit Grid',
      remotionAssetCategory:'background',
      remotionAssetFamily:'orbital',
      remotionAssetProps:{opacity:0.9,density:0.6},
      remotionAssetMeta:{type:'motion',loopDurationSeconds:4,supportedRatios:['16:9','9:16']},
    },
    {
      id:'template-title',
      trackId:'o1',
      start:12,
      end:18,
      clipType:'design-template',
      templateId:'gradient-title-card',
      templateName:'Gradient Title Card',
      templateCategory:'title',
      templateVersion:3,
      templateRenderMode:'svg',
      templateResponsiveMode:'contain',
      templateIntrinsicBounds:{width:1920,height:1080},
      templateTransform:{x:0,y:0,scaleX:1,scaleY:1,rotation:0},
      templateOverrides:{text:{headline:'Phase A'},colors:{accent:'#36E0F6'}},
    },
    {
      id:'caption-1',
      trackId:'c1',
      layerId:'layer-caption',
      start:1,
      end:4,
      sourceInSec:0,
      sourceOutSec:3,
      captionId:'caption-source-1',
      language:'en',
    },
  ],
  transitions:[
    {
      id:'tr-video-a-b',
      leftClipId:'video-a',
      rightClipId:'video-b',
      durationSec:0.6,
      nominalSeamSec:6,
      type:'slideRight',
      presentation:'slide',
      params:{direction:'from-right'},
    },
  ],
  seamLinks:[{leftClipId:'video-a',rightClipId:'video-b',locked:true}],
  editorPreferences:{
    snapping:true,
    timelineZoom:1.75,
    inspectorWidth:318,
  },
  assetSelections:{
    thumbnail:'asset-thumb-v4',
    storyboard:'asset-story-v2',
  },
  generationProvenance:{
    provider:'veo',
    model:'fixture-only',
    requestId:'generation-fixture-1',
  },
};

describe('rich desktop/mobile editor project parity fixture',()=>{
  it('is eligible for the canonical mobile bridge',()=>{
    expect(desktopProjectCanRoundTripThroughMobile(richProject)).toBe(true);
  });

  it('preserves supported project semantics desktop → mobile → desktop',()=>{
    const mobile=desktopProjectToMobileBridgeProject(richProject);
    const restored=mobileBridgeProjectToDesktopProject(mobile,richProject);

    expect(restored.contentBuildId).toBe('cb-rich-parity');
    expect(restored.legacyProjectId).toBe('legacy-rich-parity');
    expect(restored.meta).toEqual(richProject.meta);
    expect(restored.clips).toEqual(richProject.clips);
    expect(restored.transitions).toEqual(richProject.transitions);
    expect(restored.seamLinks).toEqual(richProject.seamLinks);
    expect(restored.layers).toEqual(richProject.layers);
    expect(restored.editorPreferences).toEqual(richProject.editorPreferences);
    expect(restored.assetSelections).toEqual(richProject.assetSelections);
    expect(restored.generationProvenance).toEqual(richProject.generationProvenance);

    expect(restored.tracks).toHaveLength(richProject.tracks?.length??0);
    expect(restored.tracks?.map(track=>({
      id:track.id,
      kind:track.kind,
      visible:track.visible,
      muted:track.muted,
      locked:track.locked,
      color:track.color,
    }))).toEqual(richProject.tracks?.map(track=>({
      id:track.id,
      kind:track.kind,
      visible:track.visible,
      muted:track.muted,
      locked:track.locked,
      color:track.color,
    })));
  });

  it('preserves real template, Remotion asset, FX, crop, audio, caption, and keyframe metadata',()=>{
    const restored=mobileBridgeProjectToDesktopProject(
      desktopProjectToMobileBridgeProject(richProject),
      richProject,
    );

    const videoLayer=restored.layers?.find(layer=>layer.id==='layer-video-a');
    expect(videoLayer?.payload).toMatchObject({
      crop:{top:0.02,right:0.03,bottom:0.04,left:0.05},
      fxOrder:['hue','blur','contrast','saturation','brightness','sepia','grayscale','opacity'],
      fxDisabled:{sepia:true},
      opacity:0.88,
    });

    const videoClip=restored.clips.find(clip=>clip.id==='video-a');
    expect(videoClip?.keyframes).toEqual(richProject.clips.find(clip=>clip.id==='video-a')?.keyframes);

    expect(restored.clips.find(clip=>clip.id==='remotion-orbit')).toMatchObject({
      clipType:'remotion-asset',
      remotionAssetId:'motion-003',
      remotionAssetProps:{opacity:0.9,density:0.6},
    });

    expect(restored.clips.find(clip=>clip.id==='template-title')).toMatchObject({
      clipType:'design-template',
      templateId:'gradient-title-card',
      templateVersion:3,
      templateResponsiveMode:'contain',
      templateOverrides:{text:{headline:'Phase A'},colors:{accent:'#36E0F6'}},
    });

    expect(restored.layers?.find(layer=>layer.id==='layer-audio')?.payload).toMatchObject({
      volume:0.72,
      pan:-0.15,
      fadeInSec:0.4,
      fadeOutSec:0.8,
      playbackRate:1.25,
    });
    expect(restored.clips.find(clip=>clip.id==='caption-1')).toMatchObject({
      captionId:'caption-source-1',
      language:'en',
    });
  });

  it('detects deep semantic changes in the bridge fingerprint',()=>{
    const original=editorProjectFingerprint(richProject);
    const changedFx=editorProjectFingerprint({
      ...richProject,
      layers:richProject.layers?.map(layer=>layer.id==='layer-video-a'
        ?{...layer,payload:{...(layer.payload as Record<string,unknown>),contrast:1.4}}
        :layer),
    });
    const changedTemplate=editorProjectFingerprint({
      ...richProject,
      clips:richProject.clips.map(clip=>clip.id==='template-title'
        ?{...clip,templateOverrides:{text:{headline:'Changed'}}}
        :clip),
    });
    const changedAudio=editorProjectFingerprint({
      ...richProject,
      layers:richProject.layers?.map(layer=>layer.id==='layer-audio'
        ?{...layer,payload:{...(layer.payload as Record<string,unknown>),volume:0.5}}
        :layer),
    });

    expect(changedFx).not.toBe(original);
    expect(changedTemplate).not.toBe(original);
    expect(changedAudio).not.toBe(original);
  });
});
