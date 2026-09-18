import type {
  AssetCategory,
  AssetControlSpec,
  AssetDefinition,
  AssetVisualProps,
  MotionIntensity,
  SafeAreaMetadata,
  VisualFamily,
} from './types';
import { createAssetParameterSchema } from './schemas';

export const defaultAssetProps: AssetVisualProps = {
  primaryColor: '#F4F0E8',
  secondaryColor: '#6D7CFF',
  accentColor: '#FF5B45',
  backgroundColor: '#151A26',
  foregroundColor: '#F7F5EF',
  opacity: 1,
  density: 1,
  complexity: 1,
  strokeWidth: 1,
  spacing: 1,
  scale: 1,
  rotation: 0,
  speed: 1,
  intensity: 1,
  phase: 0,
  seed: 17,
  direction: 'forward',
  blendMode: 'normal',
  staticMode: false,
  reducedMotion: false,
};

export const commonAssetControls: readonly AssetControlSpec[] = [
  { key: 'primaryColor', label: 'Primary', kind: 'color' },
  { key: 'secondaryColor', label: 'Secondary', kind: 'color' },
  { key: 'accentColor', label: 'Accent', kind: 'color' },
  { key: 'backgroundColor', label: 'Background', kind: 'color' },
  { key: 'opacity', label: 'Opacity', kind: 'number', min: 0, max: 1, step: 0.01 },
  { key: 'density', label: 'Density', kind: 'number', min: 0.25, max: 2, step: 0.05 },
  { key: 'scale', label: 'Scale', kind: 'number', min: 0.25, max: 2.5, step: 0.05 },
  { key: 'rotation', label: 'Rotation', kind: 'number', min: -180, max: 180, step: 1 },
  { key: 'seed', label: 'Seed', kind: 'number', min: 0, max: 9999, step: 1 },
];

export const motionAssetControls: readonly AssetControlSpec[] = [
  ...commonAssetControls,
  { key: 'speed', label: 'Speed', kind: 'number', min: 0.1, max: 4, step: 0.05 },
  { key: 'intensity', label: 'Intensity', kind: 'number', min: 0, max: 2.5, step: 0.05 },
  { key: 'phase', label: 'Phase', kind: 'number', min: 0, max: 1, step: 0.01 },
  { key: 'direction', label: 'Direction', kind: 'enum', options: ['forward', 'reverse'] },
  { key: 'staticMode', label: 'Static mode', kind: 'boolean' },
  { key: 'reducedMotion', label: 'Reduced motion', kind: 'boolean' },
];

const supportedRatios = ['16:9', '9:16', '1:1', '4:5'] as const;
const baseSafeAreas: SafeAreaMetadata = {
  safeTitleRegion: { x: 0.1, y: 0.12, width: 0.8, height: 0.28 },
  safeSubtitleRegion: { x: 0.1, y: 0.68, width: 0.8, height: 0.15 },
  safeImageRegion: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
  visualFocusRegion: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
  edgeActivity: 'medium',
  centerActivity: 'medium',
};

const safeAreasFor = (family: VisualFamily): SafeAreaMetadata => {
  if (['frame-system', 'reveal', 'chromatic', 'light-streaks'].includes(family)) {
    return {
      ...baseSafeAreas,
      safeTitleRegion: { x: 0.18, y: 0.18, width: 0.64, height: 0.25 },
      safeSubtitleRegion: { x: 0.18, y: 0.67, width: 0.64, height: 0.13 },
      edgeActivity: 'high',
      centerActivity: 'low',
    };
  }
  if (['editorial', 'kinetic-layout', 'split-screen'].includes(family)) {
    return {
      ...baseSafeAreas,
      safeTitleRegion: { x: 0.08, y: 0.1, width: 0.48, height: 0.28 },
      safeSubtitleRegion: { x: 0.08, y: 0.7, width: 0.5, height: 0.14 },
      visualFocusRegion: { x: 0.46, y: 0.28, width: 0.46, height: 0.46 },
      edgeActivity: 'medium',
      centerActivity: 'medium',
    };
  }
  if (['hud', 'technical', 'orbit-system', 'rings', 'spiral', 'tunnel'].includes(family)) {
    return {
      ...baseSafeAreas,
      safeTitleRegion: { x: 0.08, y: 0.08, width: 0.4, height: 0.2 },
      safeSubtitleRegion: { x: 0.08, y: 0.75, width: 0.46, height: 0.12 },
      visualFocusRegion: { x: 0.28, y: 0.24, width: 0.52, height: 0.52 },
      centerActivity: 'high',
    };
  }
  if (['particles', 'star-field', 'gradient-field', 'radial-light'].includes(family)) {
    return {
      ...baseSafeAreas,
      safeTitleRegion: { x: 0.13, y: 0.22, width: 0.74, height: 0.24 },
      safeSubtitleRegion: { x: 0.17, y: 0.64, width: 0.66, height: 0.14 },
      edgeActivity: 'low',
      centerActivity: 'medium',
    };
  }
  return baseSafeAreas;
};

type Seed = {
  name: string;
  family: VisualFamily;
  category: AssetCategory;
  tags: readonly string[];
  uses: readonly string[];
};

const stillSeeds: readonly Seed[] = [
  { name: 'Aurora Mesh', family: 'gradient-field', category: 'gradient', tags: ['mesh', 'gradient', 'soft-light'], uses: ['background', 'title-card'] },
  { name: 'Solar Bloom', family: 'radial-light', category: 'atmospheric', tags: ['radial', 'light', 'glow'], uses: ['background', 'intro'] },
  { name: 'Swiss Grid', family: 'grid-field', category: 'editorial', tags: ['swiss', 'grid', 'typography'], uses: ['title-card', 'explainer'] },
  { name: 'Modular Quarry', family: 'modular-tiles', category: 'geometric', tags: ['tiles', 'modules', 'geometry'], uses: ['background', 'data'] },
  { name: 'Orbital Blueprint', family: 'orbit-system', category: 'technical', tags: ['orbit', 'diagram', 'blueprint'], uses: ['technology', 'diagram'] },
  { name: 'Signal Threads', family: 'line-field', category: 'technical', tags: ['lines', 'signal', 'technical'], uses: ['background', 'technology'] },
  { name: 'Contour Atlas', family: 'contour', category: 'organic', tags: ['contour', 'map', 'topographic'], uses: ['background', 'documentary'] },
  { name: 'Dot Relay', family: 'dot-matrix', category: 'pattern', tags: ['dots', 'matrix', 'system'], uses: ['background', 'social'] },
  { name: 'Halftone Ledger', family: 'halftone', category: 'editorial', tags: ['halftone', 'print', 'editorial'], uses: ['overlay', 'history'] },
  { name: 'Checker Shift', family: 'checker', category: 'pattern', tags: ['checker', 'y2k', 'pattern'], uses: ['background', 'social'] },
  { name: 'Editorial Blocks', family: 'editorial', category: 'editorial', tags: ['editorial', 'blocks', 'layout'], uses: ['title-card', 'documentary'] },
  { name: 'Brutalist Index', family: 'editorial', category: 'editorial', tags: ['brutalist', 'index', 'type'], uses: ['title-card', 'art'] },
  { name: 'Radiant Frame', family: 'frame-system', category: 'frame', tags: ['frame', 'radiant', 'border'], uses: ['image-frame', 'title'] },
  { name: 'Corner Relay', family: 'frame-system', category: 'frame', tags: ['corners', 'frame', 'overlay'], uses: ['overlay', 'footage'] },
  { name: 'Split Datum', family: 'split-screen', category: 'editorial', tags: ['split-screen', 'layout', 'datum'], uses: ['comparison', 'footage'] },
  { name: 'Technical Plate', family: 'technical', category: 'technical', tags: ['technical', 'diagram', 'plate'], uses: ['explainer', 'technology'] },
  { name: 'HUD Quietline', family: 'hud', category: 'technical', tags: ['hud', 'interface', 'quiet'], uses: ['overlay', 'technology'] },
  { name: 'Network Map', family: 'network', category: 'data', tags: ['network', 'nodes', 'data'], uses: ['data', 'explainer'] },
  { name: 'Particle Still', family: 'particles', category: 'atmospheric', tags: ['particles', 'field', 'ambient'], uses: ['background', 'title'] },
  { name: 'Star Archive', family: 'star-field', category: 'atmospheric', tags: ['stars', 'archive', 'space'], uses: ['background', 'documentary'] },
  { name: 'Liquid Cut', family: 'liquid', category: 'organic', tags: ['liquid', 'blob', 'organic'], uses: ['background', 'art'] },
  { name: 'Isometric Ledger', family: 'isometric', category: 'geometric', tags: ['isometric', 'grid', 'ledger'], uses: ['explainer', 'data'] },
  { name: 'Perspective Draft', family: 'perspective', category: 'geometric', tags: ['perspective', 'grid', 'draft'], uses: ['background', 'technology'] },
  { name: 'Tunnel Plate', family: 'tunnel', category: 'experimental', tags: ['tunnel', 'depth', 'geometry'], uses: ['intro', 'transition'] },
  { name: 'Spiral Register', family: 'spiral', category: 'geometric', tags: ['spiral', 'register', 'radial'], uses: ['title', 'art'] },
  { name: 'Concentric Study', family: 'rings', category: 'geometric', tags: ['rings', 'concentric', 'study'], uses: ['background', 'data'] },
  { name: 'Chromatic Edge', family: 'chromatic', category: 'experimental', tags: ['chromatic', 'edge', 'rgb'], uses: ['overlay', 'transition'] },
  { name: 'Light Ribbon', family: 'light-streaks', category: 'atmospheric', tags: ['light', 'ribbon', 'streak'], uses: ['background', 'intro'] },
  { name: 'Reveal Mask', family: 'reveal', category: 'transition', tags: ['mask', 'reveal', 'frame'], uses: ['transition', 'title'] },
  { name: 'Kinetic Poster', family: 'kinetic-layout', category: 'kinetic', tags: ['poster', 'kinetic', 'layout'], uses: ['title-card', 'social'] },
  { name: 'Wave Blueprint', family: 'wave-field', category: 'technical', tags: ['wave', 'blueprint', 'signal'], uses: ['background', 'audio'] },
  { name: 'Strata Lines', family: 'line-field', category: 'pattern', tags: ['strata', 'lines', 'layered'], uses: ['background', 'history'] },
  { name: 'Mesh Editorial', family: 'gradient-field', category: 'editorial', tags: ['mesh', 'editorial', 'gradient'], uses: ['title-card', 'art'] },
  { name: 'Tile Signal', family: 'modular-tiles', category: 'geometric', tags: ['tile', 'signal', 'modular'], uses: ['background', 'explainer'] },
  { name: 'Orbit Caption', family: 'orbit-system', category: 'editorial', tags: ['orbit', 'caption', 'frame'], uses: ['caption', 'title'] },
  { name: 'Data Constellation', family: 'network', category: 'data', tags: ['data', 'constellation', 'nodes'], uses: ['data', 'technology'] },
  { name: 'Glass Datum', family: 'frame-system', category: 'frame', tags: ['glass', 'datum', 'frame'], uses: ['image-frame', 'overlay'] },
  { name: 'Constructive Redaction', family: 'editorial', category: 'editorial', tags: ['constructivist', 'blocks', 'redaction'], uses: ['history', 'title-card'] },
  { name: 'Y2K Matrix', family: 'dot-matrix', category: 'pattern', tags: ['y2k', 'matrix', 'dots'], uses: ['social', 'technology'] },
  { name: 'Architectural Margin', family: 'grid-field', category: 'editorial', tags: ['architecture', 'margin', 'grid'], uses: ['title-card', 'documentary'] },
  { name: 'Image Portal', family: 'frame-system', category: 'frame', tags: ['image', 'portal', 'window'], uses: ['image-frame', 'footage'] },
  { name: 'Lower Third Field', family: 'split-screen', category: 'editorial', tags: ['lower-third', 'field', 'caption'], uses: ['lower-third', 'interview'] },
  { name: 'Title Chamber', family: 'frame-system', category: 'frame', tags: ['title', 'chamber', 'frame'], uses: ['title-card', 'intro'] },
  { name: 'Diagram Bay', family: 'technical', category: 'technical', tags: ['diagram', 'bay', 'technical'], uses: ['explainer', 'diagram'] },
  { name: 'Gradient Index', family: 'gradient-field', category: 'gradient', tags: ['gradient', 'index', 'color'], uses: ['background', 'title'] },
  { name: 'Organic Window', family: 'liquid', category: 'organic', tags: ['organic', 'window', 'blob'], uses: ['image-frame', 'art'] },
  { name: 'Contour Caption', family: 'contour', category: 'editorial', tags: ['contour', 'caption', 'topography'], uses: ['caption', 'documentary'] },
  { name: 'Monochrome Scanline', family: 'stripes', category: 'pattern', tags: ['scanline', 'monochrome', 'stripes'], uses: ['overlay', 'history'] },
  { name: 'Paper Signal', family: 'halftone', category: 'editorial', tags: ['paper', 'signal', 'texture'], uses: ['texture', 'documentary'] },
  { name: 'Modular Horizon', family: 'modular-tiles', category: 'geometric', tags: ['modular', 'horizon', 'tiles'], uses: ['background', 'title'] },
];

type MotionSeed = Seed & {
  seconds: number;
  intensity: MotionIntensity;
  cycleMode?: 'fixed-cycle' | 'adaptive-cycle';
};

const motionSeeds: readonly MotionSeed[] = [
  { name: 'Aurora Drift', family: 'gradient-field', category: 'gradient', tags: ['aurora', 'mesh', 'ambient'], uses: ['background', 'title-card'], seconds: 8, intensity: 'AMBIENT' },
  { name: 'Signal Sweep', family: 'line-field', category: 'technical', tags: ['signal', 'lines', 'scan'], uses: ['overlay', 'technology'], seconds: 4, intensity: 'SUBTLE' },
  { name: 'Orbit Grid', family: 'orbit-system', category: 'technical', tags: ['orbit', 'grid', 'technical'], uses: ['background', 'technology'], seconds: 6, intensity: 'AMBIENT' },
  { name: 'Contour Drift', family: 'contour', category: 'organic', tags: ['contour', 'drift', 'topographic'], uses: ['background', 'documentary'], seconds: 8, intensity: 'AMBIENT' },
  { name: 'Solar Rings', family: 'rings', category: 'geometric', tags: ['rings', 'radial', 'solar'], uses: ['title-card', 'technology'], seconds: 6, intensity: 'MODERATE' },
  { name: 'Vector Current', family: 'wave-field', category: 'technical', tags: ['wave', 'vector', 'current'], uses: ['background', 'audio'], seconds: 5, intensity: 'MODERATE' },
  { name: 'Modular Pulse', family: 'modular-tiles', category: 'geometric', tags: ['tiles', 'pulse', 'modular'], uses: ['background', 'social'], seconds: 4, intensity: 'MODERATE' },
  { name: 'Chromatic Tunnel', family: 'tunnel', category: 'experimental', tags: ['tunnel', 'chromatic', 'depth'], uses: ['intro', 'transition'], seconds: 6, intensity: 'ENERGETIC' },
  { name: 'Editorial Conveyor', family: 'editorial', category: 'editorial', tags: ['editorial', 'conveyor', 'layout'], uses: ['title-card', 'explainer'], seconds: 5, intensity: 'MODERATE' },
  { name: 'Radiant Frame Scan', family: 'frame-system', category: 'frame', tags: ['frame', 'scan', 'radiant'], uses: ['overlay', 'image-frame'], seconds: 4, intensity: 'SUBTLE' },
  { name: 'Mesh Breathing', family: 'gradient-field', category: 'gradient', tags: ['mesh', 'breathing', 'soft'], uses: ['background', 'interview'], seconds: 10, intensity: 'SUBTLE' },
  { name: 'Perspective Transit', family: 'perspective', category: 'geometric', tags: ['perspective', 'transit', 'grid'], uses: ['background', 'technology'], seconds: 6, intensity: 'MODERATE' },
  { name: 'Dot Phase', family: 'dot-matrix', category: 'pattern', tags: ['dots', 'phase', 'matrix'], uses: ['background', 'data'], seconds: 4, intensity: 'AMBIENT' },
  { name: 'Halftone Tide', family: 'halftone', category: 'editorial', tags: ['halftone', 'tide', 'print'], uses: ['background', 'history'], seconds: 6, intensity: 'AMBIENT' },
  { name: 'Checker March', family: 'checker', category: 'pattern', tags: ['checker', 'march', 'pattern'], uses: ['social', 'transition'], seconds: 3, intensity: 'MODERATE' },
  { name: 'Stripe Current', family: 'stripes', category: 'pattern', tags: ['stripes', 'current', 'lines'], uses: ['background', 'title'], seconds: 4, intensity: 'MODERATE' },
  { name: 'HUD Radar', family: 'hud', category: 'technical', tags: ['hud', 'radar', 'scan'], uses: ['technology', 'overlay'], seconds: 5, intensity: 'MODERATE' },
  { name: 'Network Signal', family: 'network', category: 'data', tags: ['network', 'signal', 'nodes'], uses: ['data', 'explainer'], seconds: 8, intensity: 'AMBIENT' },
  { name: 'Particle Crosswind', family: 'particles', category: 'atmospheric', tags: ['particles', 'wind', 'field'], uses: ['background', 'title'], seconds: 6, intensity: 'AMBIENT' },
  { name: 'Starfield Parallax', family: 'star-field', category: 'atmospheric', tags: ['stars', 'parallax', 'space'], uses: ['background', 'documentary'], seconds: 10, intensity: 'AMBIENT' },
  { name: 'Liquid Orbit', family: 'liquid', category: 'organic', tags: ['liquid', 'orbit', 'blob'], uses: ['background', 'art'], seconds: 8, intensity: 'AMBIENT' },
  { name: 'Isometric March', family: 'isometric', category: 'geometric', tags: ['isometric', 'march', 'grid'], uses: ['explainer', 'data'], seconds: 6, intensity: 'MODERATE' },
  { name: 'Spiral Relay', family: 'spiral', category: 'geometric', tags: ['spiral', 'relay', 'radial'], uses: ['transition', 'intro'], seconds: 5, intensity: 'ENERGETIC' },
  { name: 'Ring Echo', family: 'rings', category: 'geometric', tags: ['rings', 'echo', 'pulse'], uses: ['title', 'data'], seconds: 4, intensity: 'MODERATE' },
  { name: 'Light Streak Pass', family: 'light-streaks', category: 'atmospheric', tags: ['light', 'streak', 'pass'], uses: ['transition', 'intro'], seconds: 3, intensity: 'ENERGETIC' },
  { name: 'Chromatic Split', family: 'chromatic', category: 'experimental', tags: ['chromatic', 'split', 'rgb'], uses: ['transition', 'social'], seconds: 4, intensity: 'ENERGETIC' },
  { name: 'Reveal Aperture', family: 'reveal', category: 'transition', tags: ['reveal', 'aperture', 'mask'], uses: ['transition', 'title'], seconds: 3, intensity: 'MODERATE' },
  { name: 'Kinetic Scaffold', family: 'kinetic-layout', category: 'kinetic', tags: ['kinetic', 'scaffold', 'layout'], uses: ['title-card', 'social'], seconds: 5, intensity: 'MODERATE' },
  { name: 'Wave Interference', family: 'wave-field', category: 'technical', tags: ['wave', 'interference', 'signal'], uses: ['background', 'audio'], seconds: 6, intensity: 'AMBIENT' },
  { name: 'Grid Conveyor', family: 'grid-field', category: 'geometric', tags: ['grid', 'conveyor', 'motion'], uses: ['background', 'technology'], seconds: 4, intensity: 'MODERATE' },
  { name: 'Orbital Telegraph', family: 'orbit-system', category: 'technical', tags: ['orbit', 'telegraph', 'signal'], uses: ['background', 'history'], seconds: 8, intensity: 'AMBIENT' },
  { name: 'Data Pulse', family: 'network', category: 'data', tags: ['data', 'pulse', 'nodes'], uses: ['data', 'explainer'], seconds: 4, intensity: 'MODERATE' },
  { name: 'Scanline Field', family: 'stripes', category: 'pattern', tags: ['scanline', 'field', 'lines'], uses: ['overlay', 'technology'], seconds: 3, intensity: 'SUBTLE' },
  { name: 'Technical Sweep', family: 'technical', category: 'technical', tags: ['technical', 'sweep', 'diagram'], uses: ['explainer', 'overlay'], seconds: 5, intensity: 'MODERATE' },
  { name: 'Atmospheric Radar', family: 'radial-light', category: 'atmospheric', tags: ['radar', 'atmosphere', 'light'], uses: ['background', 'documentary'], seconds: 10, intensity: 'SUBTLE' },
  { name: 'Gradient Rotor', family: 'gradient-field', category: 'gradient', tags: ['gradient', 'rotor', 'mesh'], uses: ['background', 'title'], seconds: 8, intensity: 'AMBIENT' },
  { name: 'Tile Cascades', family: 'modular-tiles', category: 'geometric', tags: ['tiles', 'cascade', 'modules'], uses: ['background', 'social'], seconds: 6, intensity: 'MODERATE' },
  { name: 'Dot Lens', family: 'dot-matrix', category: 'pattern', tags: ['dots', 'lens', 'matrix'], uses: ['background', 'data'], seconds: 5, intensity: 'AMBIENT' },
  { name: 'Contour Breathing', family: 'contour', category: 'organic', tags: ['contour', 'breathing', 'slow'], uses: ['background', 'documentary'], seconds: 10, intensity: 'SUBTLE' },
  { name: 'Frame Circuit', family: 'frame-system', category: 'frame', tags: ['frame', 'circuit', 'line'], uses: ['overlay', 'technology'], seconds: 6, intensity: 'SUBTLE' },
  { name: 'Split Parallax', family: 'split-screen', category: 'editorial', tags: ['split-screen', 'parallax', 'layout'], uses: ['comparison', 'footage'], seconds: 5, intensity: 'MODERATE' },
  { name: 'Editorial Flipbook', family: 'editorial', category: 'editorial', tags: ['editorial', 'flipbook', 'blocks'], uses: ['title-card', 'social'], seconds: 4, intensity: 'ENERGETIC' },
  { name: 'Perspective Horizon', family: 'perspective', category: 'geometric', tags: ['perspective', 'horizon', 'grid'], uses: ['background', 'documentary'], seconds: 8, intensity: 'AMBIENT' },
  { name: 'Tunnel Breach', family: 'tunnel', category: 'transition', tags: ['tunnel', 'breach', 'transition'], uses: ['transition', 'intro'], seconds: 3, intensity: 'ENERGETIC' },
  { name: 'Isometric Oscillator', family: 'isometric', category: 'geometric', tags: ['isometric', 'oscillator', 'grid'], uses: ['explainer', 'technology'], seconds: 5, intensity: 'MODERATE' },
  { name: 'Star Lattice', family: 'star-field', category: 'atmospheric', tags: ['stars', 'lattice', 'ambient'], uses: ['background', 'title'], seconds: 12, intensity: 'SUBTLE' },
  { name: 'Liquid Chromatic', family: 'liquid', category: 'organic', tags: ['liquid', 'chromatic', 'blob'], uses: ['background', 'art'], seconds: 6, intensity: 'AMBIENT' },
  { name: 'Particle Vortex', family: 'particles', category: 'atmospheric', tags: ['particles', 'vortex', 'field'], uses: ['background', 'intro'], seconds: 8, intensity: 'MODERATE' },
  { name: 'Wave Curtain', family: 'wave-field', category: 'atmospheric', tags: ['wave', 'curtain', 'lines'], uses: ['background', 'title'], seconds: 5, intensity: 'AMBIENT' },
  { name: 'Signal Bloom', family: 'radial-light', category: 'atmospheric', tags: ['signal', 'bloom', 'radial'], uses: ['background', 'technology'], seconds: 6, intensity: 'AMBIENT' },
];

const pad = (value: number) => String(value).padStart(3, '0');

const makeStill = (seed: Seed, index: number): AssetDefinition => ({
  id: `static-${pad(index + 1)}` as AssetDefinition['id'],
  name: seed.name,
  type: 'static',
  category: seed.category,
  family: seed.family,
  variant: index % 8,
  tags: seed.tags,
  fps: 30,
  durationInFrames: 1,
  loopDurationSeconds: 0,
  recommendedDurationSeconds: 0,
  seamlessLoop: true,
  motionIntensity: 'SUBTLE',
  cycleMode: 'fixed-cycle',
  loopBehavior: 'hold',
  transparent: ['frame-system', 'split-screen', 'reveal', 'chromatic'].includes(seed.family),
  supportedRatios,
  previewFrame: 0,
  controls: commonAssetControls,
  schema: createAssetParameterSchema({ ...defaultAssetProps, seed: 100 + index * 13 }),
  defaults: { ...defaultAssetProps, seed: 100 + index * 13 },
  safeAreas: safeAreasFor(seed.family),
  recommendedUses: seed.uses,
});

const makeMotion = (seed: MotionSeed, index: number): AssetDefinition => {
  const durationInFrames = Math.round(seed.seconds * 30);
  return {
    id: `motion-${pad(index + 1)}` as AssetDefinition['id'],
    name: seed.name,
    type: 'motion',
    category: seed.category,
    family: seed.family,
    variant: index % 8,
    tags: seed.tags,
    fps: 30,
    durationInFrames,
    loopDurationSeconds: seed.seconds,
    recommendedDurationSeconds: seed.seconds,
    seamlessLoop: true,
    motionIntensity: seed.intensity,
    cycleMode: seed.cycleMode ?? 'fixed-cycle',
    loopBehavior: 'loop-continuously',
    transparent: ['frame-system', 'split-screen', 'reveal', 'chromatic', 'light-streaks'].includes(seed.family),
    supportedRatios,
    previewFrame: Math.max(0, Math.round(durationInFrames * 0.4)),
    controls: motionAssetControls,
    schema: createAssetParameterSchema({
      ...defaultAssetProps,
      seed: 1000 + index * 29,
      intensity: seed.intensity === 'SUBTLE' ? 0.55 : seed.intensity === 'AMBIENT' ? 0.8 : seed.intensity === 'MODERATE' ? 1.1 : 1.45,
    }),
    defaults: {
      ...defaultAssetProps,
      seed: 1000 + index * 29,
      intensity: seed.intensity === 'SUBTLE' ? 0.55 : seed.intensity === 'AMBIENT' ? 0.8 : seed.intensity === 'MODERATE' ? 1.1 : 1.45,
    },
    safeAreas: safeAreasFor(seed.family),
    recommendedUses: seed.uses,
  };
};

export const staticAssets: readonly AssetDefinition[] = stillSeeds.map(makeStill);
export const motionAssets: readonly AssetDefinition[] = motionSeeds.map(makeMotion);
export const assetRegistry: readonly AssetDefinition[] = [...staticAssets, ...motionAssets];

export const assetById = new Map(assetRegistry.map((asset) => [asset.id, asset]));

export const getAssetDefinition = (id: string) => {
  const asset = assetById.get(id as AssetDefinition['id']);
  if (!asset) throw new Error(`Unknown Remotion asset: ${id}`);
  return asset;
};

export const searchAssets = (query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...assetRegistry];
  return assetRegistry.filter((asset) =>
    [asset.id, asset.name, asset.category, asset.family, ...asset.tags, ...asset.recommendedUses]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
};

export const registryAudit = () => {
  const ids = new Set<string>();
  const names = new Set<string>();
  const issues: string[] = [];
  for (const asset of assetRegistry) {
    if (ids.has(asset.id)) issues.push(`duplicate id: ${asset.id}`);
    if (names.has(asset.name)) issues.push(`duplicate name: ${asset.name}`);
    ids.add(asset.id);
    names.add(asset.name);
    if (asset.supportedRatios.length !== 4) issues.push(`${asset.id}: incomplete ratio support`);
    if (asset.type === 'motion' && (!asset.seamlessLoop || asset.durationInFrames <= 1)) {
      issues.push(`${asset.id}: invalid motion timing metadata`);
    }
  }
  if (staticAssets.length !== 50) issues.push(`expected 50 static assets, received ${staticAssets.length}`);
  if (motionAssets.length !== 50) issues.push(`expected 50 motion assets, received ${motionAssets.length}`);
  return {
    ok: issues.length === 0,
    total: assetRegistry.length,
    staticCount: staticAssets.length,
    motionCount: motionAssets.length,
    issues,
  };
};
