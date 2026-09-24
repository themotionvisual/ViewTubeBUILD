export type VtE1FxKey =
  | 'blur'
  | 'saturation'
  | 'brightness'
  | 'hue'
  | 'contrast'
  | 'sepia'
  | 'grayscale'
  | 'opacity';

export type VtE1FxChannel = 'filter' | 'opacity';

export interface VtE1FxDefinition {
  readonly key: VtE1FxKey;
  readonly label: string;
  readonly channel: VtE1FxChannel;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly precision: number;
  readonly defaultValue: number;
  readonly keyframeable: boolean;
}

export const VT_E1_FX_CATALOG: readonly VtE1FxDefinition[];
export const VT_E1_FX_KEYS: readonly VtE1FxKey[];
export const VT_E1_FILTER_FX_KEYS: readonly VtE1FxKey[];
export const VT_E1_ANIMATED_FX_KEYS: readonly VtE1FxKey[];
export const VT_E1_DEFAULT_FX_ORDER: readonly VtE1FxKey[];

export function vtE1FxDefinition(key: unknown): VtE1FxDefinition | null;
export function clampVtE1FxValue(key: unknown, value: unknown): number;
export function resolveVtE1FxValue(payload: Record<string, unknown> | null | undefined, key: VtE1FxKey | string): number;
export function resolveVtE1FxDisabled(payload: Record<string, unknown> | null | undefined): Partial<Record<VtE1FxKey, boolean>>;
export function normalizeVtE1FxOrder(order: unknown): VtE1FxKey[];
export function vtE1FxBypassed(payload: Record<string, unknown> | null | undefined): boolean;
export function buildVtE1Filter(payload: Record<string, unknown> | null | undefined): string;
export function resolveVtE1FxOpacity(payload: Record<string, unknown> | null | undefined, evaluatedOpacity?: number): number;
export function resetVtE1FxPatch(): Record<string, unknown> & {
  fxBypass: false;
  fxDisabled: Record<string, never>;
  fxOrder: VtE1FxKey[];
};
