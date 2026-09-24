export type VtE1CanonicalTransitionType =
  | 'cut'
  | 'fade'
  | 'crossfade'
  | 'slideLeft'
  | 'slideRight'
  | 'wipeLeft'
  | 'wipeRight'
  | 'zoom';

export type VtE1TransitionPresentationId = 'fade' | 'slide' | 'wipe' | 'zoom';

export interface VtE1TransitionCatalogEntry {
  readonly id: VtE1CanonicalTransitionType;
  readonly label: string;
  readonly presentation: VtE1TransitionPresentationId;
  readonly renderType: VtE1CanonicalTransitionType;
  readonly params: Readonly<Record<string, unknown>>;
}

export const VT_E1_TRANSITION_CATALOG: readonly VtE1TransitionCatalogEntry[];
export const VT_E1_TRANSITION_TYPES: readonly VtE1CanonicalTransitionType[];
export const VT_E1_TRANSITION_TYPE_ALIASES: Readonly<Record<string, VtE1CanonicalTransitionType>>;
export const VT_E1_ACCEPTED_TRANSITION_TYPES: readonly string[];

export function normalizeVtE1TransitionType(value: unknown): VtE1CanonicalTransitionType;
export function resolveVtE1TransitionDefinition(value: unknown): VtE1TransitionCatalogEntry;
export function transitionPresentationFor(value: unknown): VtE1TransitionPresentationId;
export function transitionParamsFor(value: unknown): Record<string, unknown>;
