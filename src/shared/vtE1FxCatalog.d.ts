export type VtE1FxId =
  | 'blur'
  | 'saturation'
  | 'brightness'
  | 'hue'
  | 'contrast'
  | 'sepia'
  | 'grayscale'
  | 'opacity';

export type VtE1FxFamily = 'filter' | 'color' | 'composite';

export interface VtE1FxDefinition {
  readonly id: VtE1FxId;
  readonly label: string;
  readonly family: VtE1FxFamily;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly precision: number;
  readonly defaultValue: number;
}

export const VT_E1_FX_CATALOG: readonly VtE1FxDefinition[];
export const VT_E1_FX_IDS: readonly VtE1FxId[];
export const VT_E1_FILTER_FX_IDS: readonly VtE1FxId[];
export const VT_E1_DEFAULT_FX_ORDER: readonly VtE1FxId[];

export function vtE1FxDefinition(id: string): VtE1FxDefinition | undefined;
export function normalizeVtE1FxOrder(value: unknown): VtE1FxId[];
export function normalizeVtE1FxDisabled(value: unknown): Partial<Record<VtE1FxId, boolean>>;
export function vtE1FxValue(payload: Record<string, unknown> | undefined, id: VtE1FxId): number | undefined;
export function vtE1FxOpacity(payload?: Record<string, unknown>): number;
export function vtE1FilterCss(payload?: Record<string, unknown>): string;
export function resetVtE1FxPatch(): Record<string, unknown>;
