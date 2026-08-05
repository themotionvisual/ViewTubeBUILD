export type AdaptiveZeroScale = {
  domain: [number, number]
  ticks: number[]
  step: number
}

type AdaptiveScaleOptions = {
  fallbackMax: number
  headroomRatio?: number
  targetIntervals?: number
  /** Presentation ceiling for metrics with a real semantic maximum (for example Shorts length). */
  hardMax?: number
}

type BubbleRadiusOptions = {
  minRadius?: number
  maxRadius?: number
}

type ThreeStopPalette = readonly [string, string, string]

const NICE_FACTORS = [1, 1.5, 2, 2.5, 5, 10] as const

const roundScaleValue = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  return Number(value.toPrecision(12))
}

const nearestNiceStep = (roughStep: number): number => {
  if (!Number.isFinite(roughStep) || roughStep <= 0) return 1
  const exponent = Math.floor(Math.log10(roughStep))
  let best = 10 ** exponent
  let bestDistance = Number.POSITIVE_INFINITY

  for (let exp = exponent - 1; exp <= exponent + 1; exp += 1) {
    const magnitude = 10 ** exp
    for (const factor of NICE_FACTORS) {
      const candidate = factor * magnitude
      const distance = Math.abs(candidate - roughStep)
      if (distance < bestDistance) {
        best = candidate
        bestDistance = distance
      }
    }
  }

  return roundScaleValue(best)
}

const ticksThroughCeiling = (ceiling: number, step: number): number[] => {
  const ticks: number[] = []
  for (let value = 0; value < ceiling; value += step) {
    ticks.push(roundScaleValue(value))
  }
  ticks.push(roundScaleValue(ceiling))
  return ticks
}

export const buildAdaptiveZeroScale = (
  values: readonly number[],
  {
    fallbackMax,
    headroomRatio = 0.08,
    targetIntervals = 4,
    hardMax,
  }: AdaptiveScaleOptions,
): AdaptiveZeroScale => {
  const finitePositive = values.filter((value) => Number.isFinite(value) && value > 0)
  if (finitePositive.length === 0) {
    const ceiling = Math.max(1, hardMax === undefined ? fallbackMax : Math.min(fallbackMax, hardMax))
    const step = nearestNiceStep(ceiling / targetIntervals)
    return {
      domain: [0, ceiling],
      ticks: ticksThroughCeiling(ceiling, step),
      step,
    }
  }

  const maximum = Math.max(...finitePositive)
  const paddedMaximum = maximum * (1 + Math.max(0, headroomRatio))
  const step = nearestNiceStep(paddedMaximum / Math.max(1, targetIntervals))
  const naturalCeiling = roundScaleValue(Math.ceil(paddedMaximum / step) * step)
  const ceiling = hardMax === undefined ? naturalCeiling : Math.min(naturalCeiling, hardMax)
  const boundedStep = hardMax !== undefined && ceiling === hardMax
    ? nearestNiceStep(ceiling / Math.max(1, targetIntervals))
    : step

  return {
    domain: [0, ceiling],
    ticks: ticksThroughCeiling(ceiling, boundedStep),
    step: boundedStep,
  }
}

export const buildTieAwarePercentiles = (
  values: readonly (number | null | undefined)[],
): Array<number | null> => {
  const ranked = values
    .map((value, index) => ({ value, index }))
    .filter(
      (entry): entry is { value: number; index: number } =>
        typeof entry.value === "number" && Number.isFinite(entry.value) && entry.value >= 0,
    )
    .sort((a, b) => a.value - b.value)

  const result: Array<number | null> = values.map(() => null)
  if (ranked.length === 0) return result
  if (ranked.length === 1) {
    result[ranked[0].index] = 0.5
    return result
  }

  let start = 0
  while (start < ranked.length) {
    let end = start
    while (end + 1 < ranked.length && ranked[end + 1].value === ranked[start].value) end += 1
    const averageRank = (start + end) / 2
    const percentile = averageRank / (ranked.length - 1)
    for (let index = start; index <= end; index += 1) {
      result[ranked[index].index] = roundScaleValue(percentile)
    }
    start = end + 1
  }

  return result
}

const parseHexColor = (color: string): [number, number, number] => {
  const normalized = color.replace("#", "")
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return [0, 0, 0]
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]
}

const toHexColor = ([red, green, blue]: readonly number[]): string =>
  `#${[red, green, blue]
    .map((value) => Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`

export const interpolateThreeStopColor = (
  position: number,
  palette: ThreeStopPalette,
): string => {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(position) ? position : 0))
  const segment = clamped <= 0.5 ? 0 : 1
  const localPosition = segment === 0 ? clamped * 2 : (clamped - 0.5) * 2
  const start = parseHexColor(palette[segment])
  const end = parseHexColor(palette[segment + 1])
  return toHexColor(start.map((value, index) => value + (end[index] - value) * localPosition))
}

export const buildLogBubbleRadii = (
  values: readonly number[],
  {
    minRadius = 4,
    maxRadius = 30,
  }: BubbleRadiusOptions = {},
): number[] => {
  const logs = values
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.log1p(value))
  if (logs.length === 0) return values.map(() => minRadius)

  const minLog = Math.min(...logs)
  const maxLog = Math.max(...logs)
  return values.map((value) => {
    if (!Number.isFinite(value) || value <= 0) return minRadius
    if (maxLog === minLog) return roundScaleValue((minRadius + maxRadius) / 2)
    const normalized = (Math.log1p(value) - minLog) / (maxLog - minLog)
    return roundScaleValue(minRadius + (maxRadius - minRadius) * Math.sqrt(normalized))
  })
}

export const buildLinearAreaBubbleRadii = (
  values: readonly number[],
  {
    minRadius = 4,
    maxRadius = 30,
  }: BubbleRadiusOptions = {},
): number[] => {
  const finite = values.filter((value) => Number.isFinite(value) && value >= 0)
  if (finite.length === 0) return values.map(() => minRadius)

  const minVal = 0 // always scale from 0 to preserve true relative size
  const maxVal = Math.max(...finite)
  return values.map((value) => {
    if (!Number.isFinite(value) || value <= 0) return minRadius
    if (maxVal === minVal) return roundScaleValue((minRadius + maxRadius) / 2)
    const normalized = value / maxVal
    return roundScaleValue(minRadius + (maxRadius - minRadius) * Math.sqrt(normalized))
  })
}
