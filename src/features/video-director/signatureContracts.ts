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
