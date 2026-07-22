import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame } from 'remotion';

type LayerType = 'text' | 'shape' | 'media' | 'audio' | 'svg-overlay' | 'generative-shape';

type VTLayer = {
  id: string;
  type: LayerType;
  trackId: string;
  visible?: boolean;
  payload?: Record<string, unknown>;
};

type VTClip = {
  id: string;
  layerId: string;
  trackId: string;
  start: number;
  end: number;
  sourceInSec?: number;
  sourceOutSec?: number;
  sourceDurationSec?: number;
  sourceDurationUnknown?: boolean;
  keyframes?: Array<{
    offsetSec?: number;
    values?: Record<string, unknown>;
    interp?: string;
  }>;
};

type VTTransition = {
  id?: string;
  leftClipId: string;
  rightClipId: string;
  type?: string;
  durationSec?: number;
  nominalSeamSec?: number;
  params?: Record<string, unknown>;
};

type VTTrack = {
  id: string;
  order?: number;
};

type RenderJob = {
  compositionMeta?: {
    fps?: number;
    width?: number;
    height?: number;
  };
  project?: {
    meta?: Record<string, unknown>;
    tracks?: VTTrack[];
    layers?: VTLayer[];
    clips?: VTClip[];
    transitions?: VTTransition[];
  };
};

type Props = {
  renderJob?: RenderJob;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isVideo = (value: unknown) => /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(String(value || ''));
const toFrame = (seconds: number, fps: number) => Math.max(0, Math.round(seconds * fps));
const sortTracks = (tracks: VTTrack[]) => [...tracks].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
const durationOf = (clip: VTClip) => Math.max(0.05, Number(clip.end || 0) - Number(clip.start || 0));
const transitionWindow = (transition: VTTransition, leftClip: VTClip, rightClip: VTClip) => {
  const durationSec = clamp(Number(transition.durationSec || 0.35), 0.05, 8);
  const halfDurationSec = durationSec / 2;
  const nominal = Number(transition.nominalSeamSec);
  const seamSec = Number.isFinite(nominal) ? nominal : ((Number(leftClip.end || 0) + Number(rightClip.start || 0)) / 2);
  return { seamSec, durationSec, halfDurationSec, startSec: seamSec - halfDurationSec, endSec: seamSec + halfDurationSec };
};
const sourceTimeForClipAt = (project: NonNullable<RenderJob['project']>, clip: VTClip, sec: number) => {
  const sourceInSec = Math.max(0, Number(clip.sourceInSec || 0));
  const sourceOutSec = Number.isFinite(Number(clip.sourceOutSec)) ? Number(clip.sourceOutSec) : sourceInSec + durationOf(clip);
  const transition = (project.transitions || []).find((entry) => entry.leftClipId === clip.id || entry.rightClipId === clip.id);
  if (!transition) return Math.max(0, sourceInSec + Math.max(0, sec - Number(clip.start || 0)));
  const left = (project.clips || []).find((entry) => entry.id === transition.leftClipId);
  const right = (project.clips || []).find((entry) => entry.id === transition.rightClipId);
  if (!left || !right) return Math.max(0, sourceInSec + Math.max(0, sec - Number(clip.start || 0)));
  const win = transitionWindow(transition, left, right);
  if (clip.id === left.id && sec > left.end && sec <= win.endSec) return Math.max(0, sourceOutSec + (sec - left.end));
  if (clip.id === right.id && sec < right.start && sec >= win.startSec) return Math.max(0, sourceInSec - (right.start - sec));
  return Math.max(0, sourceInSec + Math.max(0, sec - Number(clip.start || 0)));
};
const transitionInfluenceAt = (project: NonNullable<RenderJob['project']>, transition: VTTransition | undefined, clip: VTClip, sec: number) => {
  if (!transition) return { opacity: 1, transformExtra: '', filterExtra: '' };
  const left = (project.clips || []).find((entry) => entry.id === transition.leftClipId);
  const right = (project.clips || []).find((entry) => entry.id === transition.rightClipId);
  if (!left || !right) return { opacity: 1, transformExtra: '', filterExtra: '' };
  const win = transitionWindow(transition, left, right);
  if (sec < win.startSec || sec > win.endSec) return { opacity: 1, transformExtra: '', filterExtra: '' };
  const p = clamp((sec - win.startSec) / win.durationSec, 0, 1);
  const isLeft = clip.id === left.id;
  const params = transition.params || {};
  const intensity = clamp(Number(params.intensity ?? 1), 0, 3);
  const amount = clamp(Number(params.amount ?? 1), 0, 2);
  const direction = String(params.direction || 'left');
  const dirSignX = direction === 'right' ? 1 : direction === 'left' ? -1 : (isLeft ? -1 : 1);
  const fadeOut = 1 - p;
  const fadeIn = p;
  const opacity = isLeft ? fadeOut : fadeIn;
  const amt = (1 - p) * intensity * amount;
  switch (String(transition.type || 'fade')) {
    case 'cut':
      return { opacity: isLeft ? 1 : 0, transformExtra: '', filterExtra: '' };
    case 'fade':
    case 'crossfade':
      return { opacity, transformExtra: '', filterExtra: '' };
    case 'slide':
    case 'slideLeft':
      return { opacity, transformExtra: ` translateX(${dirSignX * amt * 40}px)`, filterExtra: '' };
    case 'slideRight':
      return { opacity, transformExtra: ` translateX(${dirSignX * -amt * 40}px)`, filterExtra: '' };
    case 'wipeLeft':
      return { opacity, transformExtra: ` translateX(${dirSignX * amt * 24}px)`, filterExtra: '' };
    case 'wipeRight':
      return { opacity, transformExtra: ` translateX(${dirSignX * -amt * 24}px)`, filterExtra: '' };
    case 'zoom':
      return { opacity, transformExtra: ` scale(${isLeft ? 1 + (p * 0.2 * intensity) : 0.86 + (p * 0.14 * intensity)})`, filterExtra: '' };
    default:
      return { opacity, transformExtra: '', filterExtra: '' };
  }
};
const sequenceBoundsForClip = (project: NonNullable<RenderJob['project']>, clip: VTClip) => {
  let startSec = Number(clip.start || 0);
  let endSec = Number(clip.end || 0);
  (project.transitions || []).forEach((transition) => {
    if (transition.leftClipId !== clip.id && transition.rightClipId !== clip.id) return;
    const left = (project.clips || []).find((entry) => entry.id === transition.leftClipId);
    const right = (project.clips || []).find((entry) => entry.id === transition.rightClipId);
    if (!left || !right) return;
    const win = transitionWindow(transition, left, right);
    if (transition.rightClipId === clip.id) startSec = Math.min(startSec, win.startSec);
    if (transition.leftClipId === clip.id) endSec = Math.max(endSec, win.endSec);
  });
  return { startSec: Math.max(0, startSec), endSec: Math.max(startSec + 0.01, endSec) };
};
const ANIMATED_PAYLOAD_PROPS = [
  'x',
  'y',
  'scale',
  'rotation',
  'opacity',
  'width',
  'height',
  'fontSize',
  'strokeWidth',
  'blur',
  'saturation',
  'brightness',
  'hue',
];
const NUMERIC_PAYLOAD_PROPS = new Set(ANIMATED_PAYLOAD_PROPS);

const easeKeyframeProgress = (rawT: number, interp: string) => {
  if (interp === 'easeIn') return rawT * rawT;
  if (interp === 'easeOut') return 1 - (1 - rawT) * (1 - rawT);
  if (interp === 'easeInOut') return rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;
  if (interp === 'springy') return clamp(1 - Math.cos(rawT * Math.PI * 2.25) * Math.exp(-rawT * 4.2), 0, 1);
  if (interp === 'bell') return clamp(Math.sin(rawT * Math.PI), 0, 1);
  return rawT;
};

const valueFromKeyframes = (
  base: unknown,
  keyframes: VTClip['keyframes'],
  prop: string,
  localSeconds: number,
) => {
  const list = (keyframes || [])
    .filter((keyframe) => keyframe.values && Object.prototype.hasOwnProperty.call(keyframe.values, prop))
    .sort((a, b) => Number(a.offsetSec || 0) - Number(b.offsetSec || 0));

  if (!list.length) return base;
  if (localSeconds <= Number(list[0].offsetSec || 0)) return list[0].values?.[prop] ?? base;
  const last = list[list.length - 1];
  if (localSeconds >= Number(last.offsetSec || 0)) return last.values?.[prop] ?? base;

  let left = list[0];
  let right = last;
  for (let index = 0; index < list.length - 1; index += 1) {
    const current = list[index];
    const next = list[index + 1];
    if (localSeconds >= Number(current.offsetSec || 0) && localSeconds <= Number(next.offsetSec || 0)) {
      left = current;
      right = next;
      break;
    }
  }

  const leftValue = left.values?.[prop];
  const rightValue = right.values?.[prop];
  const span = Number(right.offsetSec || 0) - Number(left.offsetSec || 0) || 1;
  const rawT = clamp((localSeconds - Number(left.offsetSec || 0)) / span, 0, 1);
  if (NUMERIC_PAYLOAD_PROPS.has(prop)) {
    const easedT = easeKeyframeProgress(rawT, String(right.interp || left.interp || 'linear'));
    return Number(leftValue) + (Number(rightValue) - Number(leftValue)) * easedT;
  }

  return rawT < 1 ? leftValue : rightValue;
};

const evaluatePayloadAtFrame = (
  payload: Record<string, unknown>,
  clip: VTClip,
  localFrame: number,
  fps: number,
) => {
  const localSeconds = localFrame / Math.max(1, fps);
  const nextPayload = { ...payload };
  ANIMATED_PAYLOAD_PROPS.forEach((prop) => {
    nextPayload[prop] = valueFromKeyframes(nextPayload[prop], clip.keyframes, prop, localSeconds);
  });
  return nextPayload;
};

const layerFilter = (payload: Record<string, unknown>) => {
  const blur = Math.max(0, Number(payload.blur || 0));
  const saturation = Math.max(0, Number(payload.saturation ?? 1));
  const brightness = Math.max(0, Number(payload.brightness ?? 1));
  const hue = Number(payload.hue || 0);
  return [
    blur ? `blur(${blur}px)` : '',
    `saturate(${saturation})`,
    `brightness(${brightness})`,
    hue ? `hue-rotate(${hue}deg)` : '',
  ].filter(Boolean).join(' ');
};
const svgShortsDefaultPaths = [
  'M 100 50 A 50 50 0 0 1 150 100',
  'M 150 100 A 50 50 0 0 1 100 150',
  'M 100 150 A 50 50 0 0 1 50 100',
  'M 50 100 A 50 50 0 0 1 100 50',
  'M 100 70 A 30 30 0 1 0 100 130 A 30 30 0 1 0 100 70',
  'M 100 30 L 100 60',
  'M 100 140 L 100 170',
  'M 30 100 L 60 100',
  'M 140 100 L 170 100',
];

const renderShape = (payload: Record<string, unknown>, width: number, height: number) => {
  const shape = String(payload.shape || 'rect');
  const strokeWidth = Math.max(0, Number(payload.strokeWidth || 0));
  const fill = String(payload.fillColor || '#ffffff');
  const stroke = strokeWidth > 0 ? String(payload.strokeColor || '#111111') : 'transparent';
  const cornerRadius = Math.max(0, Number(payload.cornerRadius || 0));

  return (
    <div
      style={{
        width,
        height,
        borderRadius: shape === 'circle' ? 9999 : cornerRadius,
        background: fill,
        border: `${strokeWidth}px solid ${stroke}`,
      }}
    />
  );
};

const renderSvgOverlay = (
  payload: Record<string, unknown>,
  commonStyle: React.CSSProperties,
  localFrame: number,
  durationInFrames: number,
) => {
  const cfg = (payload.svgOverlayConfig || {}) as Record<string, unknown>;
  const paths = Array.isArray(cfg.svgPaths) && cfg.svgPaths.length > 0
    ? cfg.svgPaths.map((entry) => String(entry))
    : svgShortsDefaultPaths;
  const strokeColor = String(cfg.strokeColor || payload.strokeColor || '#39FF14');
  const rotationSpeed = Number(cfg.rotationSpeed || 2);
  const drawWindow = Math.max(12, Math.min(40, durationInFrames));
  const drawProgress = interpolate(localFrame, [0, drawWindow], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rotation = rotationSpeed * (localFrame / 30) * 30;
  return (
    <div style={{ ...commonStyle, width: 200, height: 200 }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: `rotate(${rotation}deg)` }}>
        {paths.map((pathValue, index) => (
          <path
            key={`${pathValue}_${index}`}
            d={pathValue}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset={(1 - drawProgress) * 400}
          />
        ))}
      </svg>
    </div>
  );
};

const renderGenerativeShape = (
  payload: Record<string, unknown>,
  commonStyle: React.CSSProperties,
  localFrame: number,
  fps: number,
) => {
  const cfg = (payload.generativeShapeConfig || {}) as Record<string, unknown>;
  const colors = Array.isArray(cfg.colors) && cfg.colors.length > 0
    ? cfg.colors.map((entry) => String(entry))
    : ['#FF0055', '#00FFCC', '#FFCC00'];
  const elements = Array.isArray(cfg.elements) ? cfg.elements : [];
  const blobs = Array.isArray(cfg.blobs) ? cfg.blobs : [];

  if (blobs.length > 0) {
    return (
      <div style={{ ...commonStyle, width: 240, height: 240 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {blobs.map((rawBlob, index) => {
            const blob = (rawBlob || {}) as Record<string, unknown>;
            const entryFrame = Math.max(0, localFrame - Number(blob.delay || index * 5));
            const blobSpring = spring({
              frame: entryFrame,
              fps,
              config: { damping: 12, stiffness: 120 },
            });
            const translateY = Math.sin((localFrame + index * 8) / 10) * 6;
            const width = Math.max(40, Number(blob.width || 160));
            const height = Math.max(40, Number(blob.height || 100));
            return (
              <div
                key={`blob_${index}`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width,
                  height,
                  marginLeft: width / -2,
                  marginTop: height / -2,
                  borderRadius: String(blob.borderRadius || '40% 60% 70% 30% / 40% 50% 60% 50%'),
                  backgroundColor: String(blob.color || colors[index % colors.length]),
                  border: '5px solid #111111',
                  boxShadow: '5px 6px 0 #111111',
                  transform: `translateY(${translateY}px) scale(${blobSpring}) rotate(${Number(blob.rotate || 0) + Math.sin(localFrame / 16) * 3}deg)`,
                  opacity: interpolate(entryFrame, [0, 6], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                  zIndex: 10 - index,
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const fallbackElements = elements.length > 0 ? elements : [
    { type: 'circle', attrs: { cx: 100, cy: 100, r: 60 }, behavior: 'pulse' },
    { type: 'circle', attrs: { cx: 100, cy: 100, r: 40 }, behavior: 'float' },
    { type: 'rect', attrs: { x: 80, y: 80, width: 40, height: 40, rx: 6 }, behavior: 'rotate' },
  ];

  return (
    <div style={{ ...commonStyle, width: 200, height: 200 }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
        {fallbackElements.map((rawElement, index) => {
          const element = (rawElement || {}) as Record<string, unknown>;
          const attrs = (element.attrs || {}) as Record<string, number>;
          const entryFrame = Math.max(0, localFrame - index * 4);
          const progress = spring({
            frame: entryFrame,
            fps,
            config: { damping: 10, stiffness: 120 },
          });
          let transform = `scale(${progress})`;
          if (element.behavior === 'pulse') {
            transform += ` scale(${1 + Math.sin(localFrame / 8) * 0.08})`;
          } else if (element.behavior === 'float') {
            transform += ` translateY(${Math.sin(localFrame / 12) * 8}px)`;
          } else if (element.behavior === 'rotate') {
            transform += ` rotate(${localFrame * 2}deg)`;
          }
          const opacity = interpolate(entryFrame, [0, 6], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const color = colors[index % colors.length];

          if (element.type === 'circle') {
            const cx = Number(attrs.cx || 100);
            const cy = Number(attrs.cy || 100);
            const r = Number(attrs.r || 40);
            return (
              <circle
                key={`shape_${index}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={color}
                style={{ transform, opacity, transformOrigin: `${cx}px ${cy}px` }}
              />
            );
          }

          const x = Number(attrs.x || 60);
          const y = Number(attrs.y || 60);
          const width = Number(attrs.width || 80);
          const height = Number(attrs.height || 80);
          return (
            <rect
              key={`shape_${index}`}
              x={x}
              y={y}
              width={width}
              height={height}
              rx={Number(attrs.rx || 6)}
              fill={color}
              style={{ transform, opacity, transformOrigin: `${x + width / 2}px ${y + height / 2}px` }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export const MyComposition: React.FC<Props> = ({ renderJob }) => {
  const frame = useCurrentFrame();
  const fps = Number(renderJob?.compositionMeta?.fps || 30);
  const width = Number(renderJob?.compositionMeta?.width || 1280);
  const height = Number(renderJob?.compositionMeta?.height || 720);
  const background = String(renderJob?.project?.meta?.chromaEnabled ? renderJob?.project?.meta?.chromaColor || '#00ff00' : '#111111');
  const project = renderJob?.project || { meta: {}, tracks: [], layers: [], clips: [], transitions: [] };
  const tracks = useMemo(() => sortTracks(Array.isArray(project.tracks) ? project.tracks : []), [project]);
  const orderedTrackIds = tracks.map((track) => track.id);
  const layers = Array.isArray(project.layers) ? project.layers : [];
  const clips = Array.isArray(project.clips) ? project.clips : [];
  const currentSec = frame / Math.max(1, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: 'hidden' }}>
      {[...clips].sort((a, b) => Number(a.start || 0) - Number(b.start || 0)).map((clip) => {
        const layer = layers.find((entry) => entry.id === clip.layerId);
        if (!layer || layer.visible === false) return null;
        const basePayload = (layer.payload || {}) as Record<string, unknown>;

        const bounds = sequenceBoundsForClip(project, clip);
        const from = toFrame(bounds.startSec, fps);
        const durationInFrames = Math.max(1, toFrame(Math.max(0, bounds.endSec - bounds.startSec), fps));
        const localFrame = Math.max(0, toFrame(Math.max(0, currentSec - Number(clip.start || 0)), fps));
        const payload = evaluatePayloadAtFrame(basePayload, clip, localFrame, fps);
        const clipTransition = (project.transitions || []).find((entry) => entry.leftClipId === clip.id || entry.rightClipId === clip.id);
        const transitionFx = transitionInfluenceAt(project, clipTransition, clip, currentSec);
        const layerWidth = Math.max(1, Number(payload.width || 320));
        const layerHeight = Math.max(1, Number(payload.height || 180));
        const left = (width / 2) + Number(payload.x || 0);
        const top = (height / 2) + Number(payload.y || 0);
        const scale = Number(payload.scale || 1);
        const rotation = Number(payload.rotation || 0);
        const opacity = clamp(Number(payload.opacity ?? 1), 0, 1);
        const zIndex = Math.max(1, orderedTrackIds.indexOf(layer.trackId) + 1);
        const commonStyle: React.CSSProperties = {
          position: 'absolute',
          left,
          top,
          width: layerWidth,
          height: layerHeight,
          transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)${transitionFx.transformExtra || ''}`,
          transformOrigin: 'center center',
          opacity: opacity * transitionFx.opacity,
          zIndex,
          overflow: 'hidden',
          filter: [layerFilter(payload), transitionFx.filterExtra].filter(Boolean).join(' '),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };

        if (layer.type === 'audio') {
          const src = String(payload.mediaUrl || '');
          if (!src) return null;
          const startFrom = toFrame(Math.max(0, sourceTimeForClipAt(project, clip, bounds.startSec)), fps);
          return (
            <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
              <Audio src={src} startFrom={startFrom} />
            </Sequence>
          );
        }

        if (layer.type === 'text') {
          return (
            <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
              <div style={commonStyle}>
                <div
                  style={{
                    width: '100%',
                    color: String(payload.fillColor || '#ffffff'),
                    fontSize: Math.max(8, Number(payload.fontSize || 48)),
                    fontFamily: String(payload.fontFamily || 'Arial Black, Arial, sans-serif'),
                    fontWeight: 900,
                    textAlign: String(payload.textAlign || 'center') as React.CSSProperties['textAlign'],
                    lineHeight: 1.05,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    WebkitTextStroke: `${Math.max(0, Number(payload.strokeWidth || 0))}px ${String(payload.strokeColor || '#111111')}`,
                  }}
                >
                  {String(payload.text || '')}
                </div>
              </div>
            </Sequence>
          );
        }

        if (layer.type === 'shape') {
          return (
            <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
              <div style={commonStyle}>{renderShape(payload, layerWidth, layerHeight)}</div>
            </Sequence>
          );
        }

        if (layer.type === 'svg-overlay') {
          return (
            <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
              {renderSvgOverlay(payload, commonStyle, localFrame, durationInFrames)}
            </Sequence>
          );
        }

        if (layer.type === 'generative-shape') {
          return (
            <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
              {renderGenerativeShape(payload, commonStyle, localFrame, fps)}
            </Sequence>
          );
        }

        if (layer.type === 'media') {
          const src = String(payload.mediaUrl || '');
          if (!src) return null;
          const startFrom = toFrame(Math.max(0, sourceTimeForClipAt(project, clip, bounds.startSec)), fps);
          return (
            <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
              <div style={commonStyle}>
                {isVideo(src) ? (
                  <OffthreadVideo src={src} startFrom={startFrom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            </Sequence>
          );
        }

        return null;
      })}
    </AbsoluteFill>
  );
};
