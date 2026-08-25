# ViewTube Video Engine — 100-feature map

Every feature from the Remotion architecture spec, with the file and symbol it
lives at in this repository. Grouped by the ten categories in the spec.

## 1. Core Composition & Temporal Model

| # | Feature | Location |
|---|---------|----------|
| 1 | Deterministic frame clock (`useCurrentFrame`) | `core/composition.tsx` → `useCurrentFrame` |
| 2 | Parameterised compositions | `core/composition.tsx` → `<Composition>` accepts typed `Props` + `defaultProps` |
| 3 | `useVideoConfig` context hook | `core/composition.tsx` → `useVideoConfig` |
| 4 | `<Composition>` primitive | `core/composition.tsx` → `Composition` |
| 5 | `<Still>` single-frame target | `core/composition.tsx` → `Still` |
| 6 | `registerRoot` entry point | `core/composition.tsx` → `registerRoot` / `getRegisteredRoot` |
| 7 | Folder hierarchy | `core/composition.tsx` → `Folder` |
| 8 | `<AbsoluteFill>` layout primitive | `core/composition.tsx` → `AbsoluteFill` |
| 9 | `getRemotionEnvironment` detection | `core/composition.tsx` → `getRemotionEnvironment`, `useEnvironment` |
| 10 | Schema validation | `core/schema.ts` → `z`, `SchemaError`; `asSchema` adapter |

## 2. Timeline & Sequencing Primitives

| # | Feature | Location |
|---|---------|----------|
| 11 | `<Sequence>` offset wrapper | `timeline/sequencing.tsx` → `Sequence.from / durationInFrames` |
| 12 | Relative time scoping | `timeline/sequencing.tsx` → `layout='local'` (default) |
| 13 | `<Series>` chaining | `timeline/sequencing.tsx` → `Series` |
| 14 | Series sequence overlaps | `timeline/sequencing.tsx` → `Series.Sequence.offset` |
| 15 | `<Loop>` utility | `timeline/sequencing.tsx` → `Loop` |
| 16 | `<Freeze>` frame locker | `timeline/sequencing.tsx` → `Freeze` |
| 17 | Premounting | `Sequence.premountFor` |
| 18 | Postmounting | `Sequence.postmountFor` |
| 19 | Non-destructive trimming | `Sequence.trimBefore / trimAfter` |
| 20 | `showInTimeline` visibility | `Sequence.showInTimeline` (+ `useTimelineHint`) |

## 3. Animation Engine & Math Primitives

| # | Feature | Location |
|---|---------|----------|
| 21 | `interpolate` | `animation/math.ts` → `interpolate` |
| 22 | `clamp` | `animation/math.ts` → `clamp` |
| 23 | Extrapolation modes | `interpolate({ extrapolateLeft, extrapolateRight })` |
| 24 | Physics-based spring | `animation/math.ts` → `spring` |
| 25 | `measureSpring` | `animation/math.ts` → `measureSpring` |
| 26 | `interpolateColors` | `animation/math.ts` → `interpolateColors` |
| 27 | Easing library | `animation/math.ts` → `Easing` |
| 28 | Multi-point interpolation | `interpolate([0,15,30], [0,1,0])` |
| 29 | Procedural noise | `animation/math.ts` → `noise2D`, `noise3D` |
| 30 | Motion-blur sampling | `animation/math.ts` → `motionBlurSamples` |
| 31 | Path stroke evolution | `svg/paths.ts` → `evolvePath` |
| 32 | Path morphing | `svg/paths.ts` → `interpolatePath` |

## 4. Vector & SVG Path Engine

| # | Feature | Location |
|---|---------|----------|
| 33 | `getLength` | `svg/paths.ts` → `getLength` |
| 34 | Sub-path trimming | `svg/paths.ts` → `cutPath` |
| 35 | Tangential alignment | `svg/paths.ts` → `getTangentAtLength` (+`getPointAtLength`) |
| 36 | `warpPath` | `svg/paths.ts` → `warpPath` |
| 37 | `normalizePath` | `svg/paths.ts` → `normalizePath` |
| 38 | `centerPath` | `svg/paths.ts` → `centerPath` |
| 39 | `scalePath` | `svg/paths.ts` → `scalePath` |
| 40 | `getBoundingBox` | `svg/paths.ts` → `getBoundingBox` |
| 41 | `reversePath` | `svg/paths.ts` → `reversePath` |
| 42 | `createSmoothSvgPath` | `svg/paths.ts` → `createSmoothSvgPath` |
| 43 | Shape synthesisers | `svg/paths.ts` → `shapes.{rect,polygon,star,gear,circle}` |

## 5. Audio Processing & Signal Analysis

| # | Feature | Location |
|---|---------|----------|
| 44 | `<Audio>` primitive | `audio/audio.tsx` → `Audio` |
| 45 | `getAudioData` | `audio/audio.tsx` → `getAudioData` |
| 46 | `useWindowedAudioData` | `audio/audio.tsx` → `useWindowedAudioData` |
| 47 | `visualizeAudio` (FFT) | `audio/audio.tsx` → `visualizeAudio` |
| 48 | `visualizeAudioWaveform` | `audio/audio.tsx` → `visualizeAudioWaveform` |
| 49 | Per-frame volume curves | `AudioProps.volume` accepts `(frame)=>number` |
| 50 | Pitch-preserved speed | `AudioProps.playbackRate` |
| 51 | `audioBufferToDataUrl` | `audio/audio.tsx` → `audioBufferToDataUrl` |
| 52 | `audioStreamIndex` | `AudioProps.audioStreamIndex` |
| 53 | Procedural tones | `audio/audio.tsx` → `synthesiseTone` |
| 54 | Captions engine | `audio/audio.tsx` → `parseSrt`, `parseVtt`, `tokenizeToWords`, `useCurrentCaption` |

## 6. Media Acceleration & Frame Synchronization

| # | Feature | Location |
|---|---------|----------|
| 55 | `<Video>` frame-seek | `media/media.tsx` → `Video` |
| 56 | `<OffthreadVideo>` | `media/media.tsx` → `OffthreadVideo` |
| 57 | `staticFile` pathing | `media/media.tsx` → `staticFile` / `getPublicRoot` |
| 58 | Asset preloaders | `preloadImage/Audio/Video/Font` |
| 59 | `<Gif>` animated images | `media/media.tsx` → `Gif` |
| 60 | `getVideoMetadata` | `media/media.tsx` → `getVideoMetadata` |
| 61 | Non-destructive video crop | `VideoProps.cropLeft/Right/Top/Bottom` |
| 62 | `<HtmlCanvas>` | `media/media.tsx` → `HtmlCanvas` |
| 63 | Container `objectFit` | `VideoProps.objectFit` / `GifProps.objectFit` |
| 64 | `loopVolumeCurveBehavior` | `AudioProps.loopVolumeCurveBehavior` / `VideoProps.loopVolumeCurveBehavior` |

## 7. Developer Experience (DX) & Async Pipeline

| # | Feature | Location |
|---|---------|----------|
| 65 | `delayRender` | `devx/asyncGuards.ts` → `delayRender` |
| 66 | `continueRender` | `devx/asyncGuards.ts` → `continueRender` |
| 67 | `cancelRender` | `devx/asyncGuards.ts` → `cancelRender` |
| 68 | Timeout safeguards | `delayRender(label, { delayRenderTimeoutInMilliseconds })` |
| 69 | `onError` rules | `devx/asyncGuards.ts` → `onError`, `getErrorRules` |
| 70 | `getInputProps` | `devx/bridges.tsx` → `getInputProps`, `InputPropsProvider`, `useInputProps` |
| 71 | Three (R3F) bridge | `devx/bridges.tsx` → `ThreeCanvas`, `useThreeFrame` |
| 72 | Skia bridge | `devx/bridges.tsx` → `useSkiaFrame` |
| 73 | Lottie import | `devx/bridges.tsx` → `Lottie` |
| 74 | Tailwind integration | `devx/bridges.tsx` → `tw` helper |

## 8. Studio GUI & Interactive Controls

| # | Feature | Location |
|---|---------|----------|
| 75 | Live in-browser Studio | `studio/studio.tsx` → `StudioPreview` |
| 76 | Visual prop controls | `InteractivitySchema`, `ControlSpec`, `initialFromSchema` |
| 77 | Sub-frame scrubbing | `StudioPreview` step buttons + key bindings |
| 78 | Pan & zoom | `StudioPreview` wheel-zoom / scrollable viewport |
| 79 | FPS + speed toggles | `StudioPreview` speed picker (0.25×–4×) |
| 80 | Timeline track toggles | `useTimelineTracks` |
| 81 | Audio visualiser bar | `AudioVisualiserBar` |
| 82 | Keyboard navigation | `useKeyboardControls`, `defaultKeyMap` |

## 9. Local Rendering Engine & CLI

| # | Feature | Location |
|---|---------|----------|
| 83 | Headless orchestration | `render/headless.ts` → `runHeadlessRender` |
| 84 | Parallel workers | `runHeadlessRender` — one Chromium tab per CPU |
| 85 | FFmpeg stitching | `render/headless.ts` → `stitch` |
| 86 | `--frames` sub-range | `RenderOptions.frameRange` |
| 87 | Audio muxing | `stitch()` — passes audio track through codec matrix |
| 88 | Multi-codec support | `render/renderVideo.ts` → `codecMatrix` |
| 89 | Hardware encoders | `render/headless.ts` → `hwSwitches` (nvenc/videotoolbox/qsv) |
| 90 | Pixel-format switches | `RenderOptions.pixelFormat` (yuv420p/422p/444p/yuva420p) |
| 91 | Programmatic Node API | `render/renderVideo.ts` → `renderVideo`, `renderStill` |
| 92 | Bundler subsystem | `render/renderVideo.ts` → `bundle` (backed by `render/bundler.ts`) |

## 10. Serverless Cloud Infrastructure

| # | Feature | Location |
|---|---------|----------|
| 93 | AWS Lambda rendering | `cloud/cloud.ts` → `renderMediaOnLambda`, `getRenderProgressOnLambda` |
| 94 | Google Cloud Run | `cloud/cloud.ts` → `renderMediaOnCloudRun` |
| 95 | Chunk concatenation | `cloud/cloud.ts` → `concatChunks` |
| 96 | Cost estimator | `cloud/cloud.ts` → `estimatePrice` |
| 97 | Webhook events | `cloud/cloud.ts` → `postWebhook`, `WebhookSpec` |
| 98 | Embeddable player | `cloud/player.tsx` → `Player`, `PlayerRef` |
| 99 | Real-time client reactivity | `<Player inputProps>` diff-drives without re-render |
| 100 | Serverless thumbnails | `cloud/cloud.ts` → `renderStillOnLambda` |
| 101 | Shared asset cache | `cloud/cloud.ts` → `markCloudAssetUsed`, `snapshotAssetCache` |
| 102 | Concurrency auto-scaler | `cloud/cloud.ts` → `pickConcurrency` |
