import type { AssetParameterSchema, AssetVisualProps } from './types';

const finite = (value: unknown, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const color = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback;

const enumValue = <T extends string>(
  value: unknown,
  values: readonly T[],
  fallback: T,
): T => values.includes(value as T) ? value as T : fallback;

export const createAssetParameterSchema = (
  defaults: AssetVisualProps,
): AssetParameterSchema => {
  const parse = (input: unknown): AssetVisualProps => {
    const source = input && typeof input === 'object'
      ? input as Partial<AssetVisualProps>
      : {};

    return {
      primaryColor: color(source.primaryColor, defaults.primaryColor),
      secondaryColor: color(source.secondaryColor, defaults.secondaryColor),
      accentColor: color(source.accentColor, defaults.accentColor),
      backgroundColor: color(source.backgroundColor, defaults.backgroundColor),
      foregroundColor: color(source.foregroundColor, defaults.foregroundColor),
      opacity: clamp(finite(source.opacity, defaults.opacity), 0, 1),
      density: clamp(finite(source.density, defaults.density), 0.1, 4),
      complexity: clamp(finite(source.complexity, defaults.complexity), 0.1, 4),
      strokeWidth: clamp(finite(source.strokeWidth, defaults.strokeWidth), 0, 12),
      spacing: clamp(finite(source.spacing, defaults.spacing), 0.1, 8),
      scale: clamp(finite(source.scale, defaults.scale), 0.05, 6),
      rotation: finite(source.rotation, defaults.rotation),
      speed: clamp(finite(source.speed, defaults.speed), 0.01, 8),
      intensity: clamp(finite(source.intensity, defaults.intensity), 0, 5),
      phase: ((finite(source.phase, defaults.phase) % 1) + 1) % 1,
      seed: Math.round(clamp(finite(source.seed, defaults.seed), 0, 2147483647)),
      direction: enumValue(source.direction, ['forward', 'reverse'] as const, defaults.direction),
      blendMode: enumValue(source.blendMode, ['normal', 'screen', 'multiply', 'overlay'] as const, defaults.blendMode),
      staticMode: typeof source.staticMode === 'boolean' ? source.staticMode : defaults.staticMode,
      reducedMotion: typeof source.reducedMotion === 'boolean' ? source.reducedMotion : defaults.reducedMotion,
    };
  };

  return {
    parse,
    safeParse: (input: unknown) => {
      try {
        return { success: true as const, data: parse(input) };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    },
  };
};
