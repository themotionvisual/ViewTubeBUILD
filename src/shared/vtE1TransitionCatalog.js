/**
 * Canonical VT_E1 transition catalog.
 *
 * This is shared by editor UI, browser preview, Remotion composition rendering,
 * and the render worker validation path. Do not duplicate transition IDs in
 * individual surfaces.
 */

export const VT_E1_TRANSITION_CATALOG = Object.freeze([
  Object.freeze({ id: 'cut', label: 'Cut', presentation: 'fade', renderType: 'cut', params: Object.freeze({}) }),
  Object.freeze({ id: 'fade', label: 'Fade', presentation: 'fade', renderType: 'fade', params: Object.freeze({}) }),
  Object.freeze({ id: 'crossfade', label: 'Crossfade', presentation: 'fade', renderType: 'crossfade', params: Object.freeze({}) }),
  Object.freeze({ id: 'slideLeft', label: 'Slide Left', presentation: 'slide', renderType: 'slideLeft', params: Object.freeze({ direction: 'from-left' }) }),
  Object.freeze({ id: 'slideRight', label: 'Slide Right', presentation: 'slide', renderType: 'slideRight', params: Object.freeze({ direction: 'from-right' }) }),
  Object.freeze({ id: 'wipeLeft', label: 'Wipe Left', presentation: 'wipe', renderType: 'wipeLeft', params: Object.freeze({ direction: 'from-left' }) }),
  Object.freeze({ id: 'wipeRight', label: 'Wipe Right', presentation: 'wipe', renderType: 'wipeRight', params: Object.freeze({ direction: 'from-right' }) }),
  Object.freeze({ id: 'zoom', label: 'Zoom', presentation: 'zoom', renderType: 'zoom', params: Object.freeze({}) }),
]);

export const VT_E1_TRANSITION_TYPES = Object.freeze(
  VT_E1_TRANSITION_CATALOG.map((entry) => entry.id),
);

/**
 * Legacy aliases accepted from older project snapshots.
 * New writes should always use the canonical IDs in VT_E1_TRANSITION_CATALOG.
 */
export const VT_E1_TRANSITION_TYPE_ALIASES = Object.freeze({
  slide: 'slideLeft',
  wipe: 'wipeLeft',
});

export const VT_E1_ACCEPTED_TRANSITION_TYPES = Object.freeze([
  ...VT_E1_TRANSITION_TYPES,
  ...Object.keys(VT_E1_TRANSITION_TYPE_ALIASES),
]);

export function normalizeVtE1TransitionType(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'fade';
  if (VT_E1_TRANSITION_TYPES.includes(raw)) return raw;
  return VT_E1_TRANSITION_TYPE_ALIASES[raw] || 'fade';
}

export function resolveVtE1TransitionDefinition(value) {
  const id = normalizeVtE1TransitionType(value);
  return VT_E1_TRANSITION_CATALOG.find((entry) => entry.id === id) || VT_E1_TRANSITION_CATALOG[1];
}

export function transitionPresentationFor(value) {
  return resolveVtE1TransitionDefinition(value).presentation;
}

export function transitionParamsFor(value) {
  return { ...resolveVtE1TransitionDefinition(value).params };
}
