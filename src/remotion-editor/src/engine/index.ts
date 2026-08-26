/**
 * ViewTube Video Engine — public barrel.
 *
 * A Remotion-inspired video editing engine covering all 100 features listed
 * in `FEATURES.md`. Import surface is deliberately shallow so consumers can
 * write `import { useCurrentFrame, Sequence, interpolate } from './engine'`.
 */

/* Category 1 — Core Composition & Temporal Model */
export {
  Composition,
  Still,
  Folder,
  AbsoluteFill,
  FrameProvider,
  registerRoot,
  getRegisteredRoot,
  getRegisteredCompositions,
  getRemotionEnvironment,
  useCurrentFrame,
  useVideoConfig,
  useEnvironment,
  useRafClock,
  resolveConfig,
  asSchema,
} from './core/composition';
export type {
  VideoConfig,
  Environment,
  CompositionSpec,
  CompositionMetadataResolver,
  PropSchema,
} from './core/composition';
export { z, SchemaError } from './core/schema';

/* Category 2 — Timeline */
export {
  Sequence,
  Series,
  Loop,
  Freeze,
  useTimelineHint,
  useDeclaredTimelineLayers,
} from './timeline/sequencing';
export type { SequenceProps, LoopProps, TimelineHint, TimelineDescriptor } from './timeline/sequencing';

/* Category 3 — Animation & math */
export {
  clamp,
  interpolate,
  interpolateColors,
  spring,
  measureSpring,
  Easing,
  defaultSpring,
  noise2D,
  noise3D,
  motionBlurSamples,
} from './animation/math';
export type { InterpolateOptions, ExtrapolateMode, SpringConfig, EasingFn } from './animation/math';

/* Category 4 — SVG / paths */
export {
  normalizePath,
  getLength,
  getPointAtLength,
  getTangentAtLength,
  cutPath,
  warpPath,
  getBoundingBox,
  centerPath,
  scalePath,
  reversePath,
  evolvePath,
  interpolatePath,
  createSmoothSvgPath,
  shapes,
} from './svg/paths';
export type { BBox } from './svg/paths';

/* Category 5 — Audio */
export {
  Audio,
  getAudioData,
  useWindowedAudioData,
  visualizeAudio,
  visualizeAudioWaveform,
  audioBufferToDataUrl,
  synthesiseTone,
  parseSrt,
  parseVtt,
  tokenizeToWords,
  useCurrentCaption,
} from './audio/audio';
export type { AudioProps, AudioData, Caption, VolumeInput } from './audio/audio';

/* Category 6 — Media */
export {
  staticFile,
  getPublicRoot,
  preloadImage,
  preloadAudio,
  preloadVideo,
  preloadFont,
  Video,
  OffthreadVideo,
  Gif,
  getVideoMetadata,
  HtmlCanvas,
} from './media/media';
export type { VideoProps, GifProps, VideoMetadata } from './media/media';

/* Category 7 — Async guards + bridges */
export {
  delayRender,
  continueRender,
  cancelRender,
  subscribeRenderState,
  onError,
  getErrorRules,
} from './devx/asyncGuards';
export type { ErrorFallbackRule } from './devx/asyncGuards';
export {
  getInputProps,
  useInputProps,
  InputPropsProvider,
  ThreeCanvas,
  useThreeFrame,
  useSkiaFrame,
  Lottie,
  tw,
} from './devx/bridges';
export type { LottieJSON } from './devx/bridges';

/* Category 8 — Studio */
export {
  StudioPreview,
  useKeyboardControls,
  defaultKeyMap,
  useTimelineTracks,
  AudioVisualiserBar,
  initialFromSchema,
} from './studio/studio';
export type { KeyMap, StudioPreviewProps, InteractivitySchema, ControlSpec } from './studio/studio';

/* Category 9 — Local rendering */
export {
  renderVideo,
  renderStill,
  bundle,
  codecMatrix,
} from './render/renderVideo';
export type { RenderOptions, RenderResult, Codec, BundleOptions } from './render/renderVideo';

/* Category 10 — Cloud */
export {
  renderMediaOnLambda,
  getRenderProgressOnLambda,
  renderMediaOnCloudRun,
  renderStillOnLambda,
  concatChunks,
  estimatePrice,
  postWebhook,
  markCloudAssetUsed,
  snapshotAssetCache,
  pickConcurrency,
} from './cloud/cloud';
export type {
  LambdaRenderOptions,
  LambdaRenderProgress,
  LambdaRenderHandle,
  CloudRunRenderOptions,
  WebhookSpec,
  ConcurrencyBudget,
} from './cloud/cloud';
export { Player, useThumbnail } from './cloud/player';
export type { PlayerProps, PlayerRef } from './cloud/player';

/* Extensions — transitions & kinetic text */
export {
  TransitionSeries,
  presentations,
  linearTiming,
  springTiming,
} from './transitions/transitions';
export type { PresentationProps, PresentationSpec, TimingSpec } from './transitions/transitions';
export {
  splitText,
  StaggeredText,
  TypewriterText,
  KineticCaption,
} from './text/kinetics';
export type {
  SplitUnit,
  SplitToken,
  StaggeredTextProps,
  TypewriterTextProps,
  KineticCaptionProps,
} from './text/kinetics';
