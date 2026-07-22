import './index.css';
import React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';

type CompositionMeta = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  durationInSeconds: number;
};

type RootRenderJob = {
  compositionMeta: CompositionMeta;
  project: {
    meta: Record<string, unknown>;
    tracks: Array<{ id: string; order?: number }>;
    layers: unknown[];
    clips: unknown[];
  };
};

type RootRenderJobProps = {
  renderJob?: Partial<RootRenderJob> & {
    compositionMeta?: Partial<CompositionMeta>;
  };
};

const defaultCompositionMeta: CompositionMeta = {
  fps: 30,
  width: 1280,
  height: 720,
  durationInFrames: 300,
  durationInSeconds: 10,
};

const defaultRenderJob: RootRenderJob = {
  compositionMeta: defaultCompositionMeta,
  project: {
    meta: {
      chromaEnabled: false,
      chromaColor: '#00ff00',
    },
    tracks: [{ id: 'track_visual', order: 0 }],
    layers: [],
    clips: [],
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VTE1Renderer"
      component={MyComposition}
      durationInFrames={defaultCompositionMeta.durationInFrames}
      fps={defaultCompositionMeta.fps}
      width={defaultCompositionMeta.width}
      height={defaultCompositionMeta.height}
      defaultProps={{ renderJob: defaultRenderJob }}
      calculateMetadata={({ props }: { props: RootRenderJobProps }) => {
        const meta = {
          ...defaultCompositionMeta,
          ...(props?.renderJob?.compositionMeta || {}),
        };
        return {
          durationInFrames: Math.max(1, Number(meta.durationInFrames || defaultCompositionMeta.durationInFrames)),
          fps: Math.max(1, Number(meta.fps || defaultCompositionMeta.fps)),
          width: Math.max(1, Number(meta.width || defaultCompositionMeta.width)),
          height: Math.max(1, Number(meta.height || defaultCompositionMeta.height)),
        };
      }}
    />
  );
};
