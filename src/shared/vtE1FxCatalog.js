/**
 * Canonical VT_E1 clip/layer FX contract.
 *
 * This module is intentionally framework-free so editor controls, browser
 * preview, render validation, and Remotion final output can share one
 * vocabulary, ordering policy, defaults, clamping rules, and CSS filter math.
 */

export const VT_E1_FX_CATALOG = Object.freeze([
  Object.freeze({ key: 'blur', label: 'Blur', channel: 'filter', min: 0, max: 40, step: 0.25, precision: 2, defaultValue: 0, keyframeable: true }),
  Object.freeze({ key: 'saturation', label: 'Saturation', channel: 'filter', min: 0, max: 3, step: 0.05, precision: 2, defaultValue: 1, keyframeable: true }),
  Object.freeze({ key: 'brightness', label: 'Brightness', channel: 'filter', min: 0, max: 3, step: 0.05, precision: 2, defaultValue: 1, keyframeable: true }),
  Object.freeze({ key: 'hue', label: 'Hue', channel: 'filter', min: -180, max: 180, step: 2, precision: 0, defaultValue: 0, keyframeable: true }),
  Object.freeze({ key: 'contrast', label: 'Contrast', channel: 'filter', min: 0, max: 3, step: 0.05, precision: 2, defaultValue: 1, keyframeable: true }),
  Object.freeze({ key: 'sepia', label: 'Sepia', channel: 'filter', min: 0, max: 1, step: 0.05, precision: 2, defaultValue: 0, keyframeable: true }),
  Object.freeze({ key: 'grayscale', label: 'Grayscale', channel: 'filter', min: 0, max: 1, step: 0.05, precision: 2, defaultValue: 0, keyframeable: true }),
  Object.freeze({ key: 'opacity', label: 'Opacity', channel: 'opacity', min: 0, max: 1, step: 0.02, precision: 2, defaultValue: 1, keyframeable: true }),
]);

export const VT_E1_FX_KEYS = Object.freeze(VT_E1_FX_CATALOG.map((entry) => entry.key));
export const VT_E1_FILTER_FX_KEYS = Object.freeze(
  VT_E1_FX_CATALOG.filter((entry) => entry.channel === 'filter').map((entry) => entry.key),
);
export const VT_E1_ANIMATED_FX_KEYS = Object.freeze(
  VT_E1_FX_CATALOG.filter((entry) => entry.keyframeable).map((entry) => entry.key),
);
export const VT_E1_DEFAULT_FX_ORDER = VT_E1_FX_KEYS;

const byKey = new Map(VT_E1_FX_CATALOG.map((entry) => [entry.key, entry]));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function vtE1FxDefinition(key) {
  return byKey.get(String(key || '')) || null;
}

export function clampVtE1FxValue(key, value) {
  const definition = vtE1FxDefinition(key);
  if (!definition) return Number(value);
  const numeric = Number(value);
  const fallback = definition.defaultValue;
  return clamp(Number.isFinite(numeric) ? numeric : fallback, definition.min, definition.max);
}

export function resolveVtE1FxValue(payload, key) {
  const definition = vtE1FxDefinition(key);
  if (!definition) return Number(payload?.[key]);
  return clampVtE1FxValue(key, payload?.[key] ?? definition.defaultValue);
}

export function resolveVtE1FxDisabled(payload) {
  const raw = payload?.fxDisabled;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return VT_E1_FX_KEYS.reduce((result, key) => {
    if (raw[key] === true) result[key] = true;
    return result;
  }, {});
}

export function normalizeVtE1FxOrder(order) {
  const incoming = Array.isArray(order) ? order.map(String) : [];
  const seen = new Set();
  const valid = [];
  for (const key of incoming) {
    if (!byKey.has(key) || seen.has(key)) continue;
    seen.add(key);
    valid.push(key);
  }
  for (const key of VT_E1_DEFAULT_FX_ORDER) {
    if (seen.has(key)) continue;
    seen.add(key);
    valid.push(key);
  }
  return valid;
}

export function vtE1FxBypassed(payload) {
  return Boolean(payload?.fxBypass);
}

function filterToken(key, value) {
  if (key === 'blur') return value === 0 ? '' : `blur(${value}px)`;
  if (key === 'saturation') return `saturate(${value})`;
  if (key === 'brightness') return `brightness(${value})`;
  if (key === 'hue') return value === 0 ? '' : `hue-rotate(${value}deg)`;
  if (key === 'contrast') return `contrast(${value})`;
  if (key === 'sepia') return value === 0 ? '' : `sepia(${value})`;
  if (key === 'grayscale') return value === 0 ? '' : `grayscale(${value})`;
  return '';
}

export function buildVtE1Filter(payload) {
  if (vtE1FxBypassed(payload)) return '';
  const disabled = resolveVtE1FxDisabled(payload);
  return normalizeVtE1FxOrder(payload?.fxOrder)
    .filter((key) => VT_E1_FILTER_FX_KEYS.includes(key))
    .filter((key) => !disabled[key])
    .map((key) => filterToken(key, resolveVtE1FxValue(payload, key)))
    .filter(Boolean)
    .join(' ');
}

export function resolveVtE1FxOpacity(payload, evaluatedOpacity = 1) {
  if (vtE1FxBypassed(payload)) return 1;
  const disabled = resolveVtE1FxDisabled(payload);
  if (disabled.opacity) return 1;
  return clampVtE1FxValue('opacity', evaluatedOpacity);
}

export function resetVtE1FxPatch() {
  const values = VT_E1_FX_CATALOG.reduce((result, definition) => {
    result[definition.key] = definition.defaultValue;
    return result;
  }, {});
  return {
    ...values,
    fxBypass: false,
    fxDisabled: {},
    fxOrder: [...VT_E1_DEFAULT_FX_ORDER],
  };
}
