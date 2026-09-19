export interface DirectorLensControlProps {
  focalLength: number
  aperture: number
}

export interface DirectorMoodControlProps {
  horizontal: number
  vertical: number
}

export interface DirectorCompositionControlProps {
  subjectX: number
  subjectY: number
  horizonY: number
  safeZones: boolean
}

export interface DirectorLightingControlProps {
  azimuth: number
  elevation: number
  temperatureK: number
}

export interface DirectorPacingControlProps {
  duration: number
  hook: number
  hold: number
}

export interface DirectorAudioStageProps {
  width: number
  targetLufs: number
}

export interface DirectorShotStripProps {
  shots: Array<{
    id: string
    label: string
    durationSeconds: number
    enabled: boolean
  }>
}

export interface DirectorProviderRouteProps {
  mode: string
  provider?: string | null
  model?: string | null
}

export interface DirectorPaletteProps {
  colors: string[]
  exactLock: boolean
}

export interface DirectorOutputFrameProps {
  ratio: string
  quality: string
  outputs: number
}
export interface DirectorCameraPathProps {
  type: string
  speed: number
  panDegrees: number
  tiltDegrees: number
  orbitDegrees: number
}

export interface DirectorFocusDepthProps {
  mode: string
  focusDistanceMeters: number
  depthStrength: number
  bokeh: number
}

export interface DirectorTextureStackProps {
  grain: number
  halation: number
  bloom: number
  vignette: number
  filmStock: string
}

export interface DirectorTransitionBridgeProps {
  type: string
  durationFrames: number
  matchMotion: boolean
}

export interface DirectorMusicBeatProps {
  bpm: number
  intensity: number
  beatSync: string
}

export interface DirectorCaptionPreviewProps {
  position: string
  animation: string
  maxWordsPerLine: number
  burnIn: boolean
}

export interface DirectorReferenceBoardProps {
  referenceCount: number
  seed: number | null
  lockSeed: boolean
  variationNoise: number
}

export interface DirectorContinuityLedgerProps {
  entityCount: number
  identityStrength: number
  wardrobeStrength: number
  environmentStrength: number
}

export interface DirectorNegativeBankProps {
  tagCount: number
  enforcement: string
  freeText: string
}
