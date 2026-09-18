import type { ComponentType } from 'react';

export type AssetKind = 'static' | 'motion';
export type AspectRatioKey = '16:9' | '9:16' | '1:1' | '4:5';
export type MotionIntensity = 'SUBTLE' | 'AMBIENT' | 'MODERATE' | 'ENERGETIC';
export type LoopBehavior = 'loop-continuously' | 'scale-motion' | 'preserve-fixed-cycle' | 'hold';
export type MotionCycleMode = 'fixed-cycle' | 'adaptive-cycle';
export type AssetCategory =
  | 'gradient'
  | 'geometric'
  | 'editorial'
  | 'technical'
  | 'pattern'
  | 'organic'
  | 'atmospheric'
  | 'data'
  | 'frame'
  | 'transition'
  | 'kinetic'
  | 'experimental';

export type VisualFamily =
  | 'gradient-field'
  | 'radial-light'
  | 'grid-field'
  | 'modular-tiles'
  | 'orbit-system'
  | 'line-field'
  | 'wave-field'
  | 'dot-matrix'
  | 'halftone'
  | 'checker'
  | 'stripes'
  | 'frame-system'
  | 'editorial'
  | 'split-screen'
  | 'technical'
  | 'hud'
  | 'network'
  | 'particles'
  | 'star-field'
  | 'liquid'
  | 'contour'
  | 'isometric'
  | 'perspective'
  | 'tunnel'
  | 'spiral'
  | 'rings'
  | 'light-streaks'
  | 'chromatic'
  | 'reveal'
  | 'kinetic-layout';

export type AssetControlKind = 'color' | 'number' | 'boolean' | 'enum';

export interface AssetControlSpec {
  key: keyof AssetVisualProps;
  label: string;
  kind: AssetControlKind;
  min?: number;
  max?: number;
  step?: number;
  options?: readonly string[];
}

export interface NormalizedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SafeAreaMetadata {
  safeTitleRegion?: NormalizedRegion;
  safeSubtitleRegion?: NormalizedRegion;
  safeImageRegion?: NormalizedRegion;
  visualFocusRegion?: NormalizedRegion;
  edgeActivity: 'low' | 'medium' | 'high';
  centerActivity: 'low' | 'medium' | 'high';
}

export interface AssetVisualProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  opacity: number;
  density: number;
  complexity: number;
  strokeWidth: number;
  spacing: number;
  scale: number;
  rotation: number;
  speed: number;
  intensity: number;
  phase: number;
  seed: number;
  direction: 'forward' | 'reverse';
  blendMode: 'normal' | 'screen' | 'multiply' | 'overlay';
  staticMode: boolean;
  reducedMotion: boolean;
}

export interface AssetDefinition {
  id: `static-${string}` | `motion-${string}`;
  name: string;
  type: AssetKind;
  category: AssetCategory;
  family: VisualFamily;
  variant: number;
  tags: readonly string[];
  fps: number;
  durationInFrames: number;
  loopDurationSeconds: number;
  recommendedDurationSeconds: number;
  seamlessLoop: boolean;
  motionIntensity: MotionIntensity;
  cycleMode: MotionCycleMode;
  loopBehavior: LoopBehavior;
  transparent: boolean;
  supportedRatios: readonly AspectRatioKey[];
  previewFrame: number;
  controls: readonly AssetControlSpec[];
  defaults: AssetVisualProps;
  safeAreas: SafeAreaMetadata;
  recommendedUses: readonly string[];
}

export interface AssetCompositionProps extends Partial<AssetVisualProps> {
  assetId: AssetDefinition['id'];
}

export type AssetRendererComponent = ComponentType<AssetCompositionProps>;
