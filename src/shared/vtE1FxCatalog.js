/**
 * Canonical VT_E1 layer FX contract.
 *
 * These effects are the payload fields that both interactive preview and final
 * Remotion composition can currently render. UI surfaces must consume this
 * catalog instead of maintaining private effect lists.
 */
export const VT_E1_FX_CATALOG = Object.freeze([
  Object.freeze({ id: 'blur', label: 'Blur', family: 'filter', min: 0, max: 40, step: 0.25, precision: 2, defaultValue: 0 }),
  Object.freeze({ id: 'saturation', label: 'Saturation', family: 'color', min: 0, max: 3, step: 0.05, precision: 2, defaultValue: 1 }),
  Object.freeze({ id: 'brightness', label: 'Brightness', family: 'color', min: 0, max: 3, step: 0.05, precision: 2, defaultValue: 1 }),
  Object.freeze({ id: 'hue', label: 'Hue', family: 'color', min: -180, max: 180, step: 2, precision: 0, defaultValue: 0 }),
  Object.freeze({ id: 'contrast', label: 'Contrast', family: 'color', min: 0, max: 3, step: 0.05, precision: 2, defaultValue: 1 }),
  Object.freeze({ id: 'sepia', label: 'Sepia', family: 'color', min: 0, max: 1, step: 0.05, precision: 2, defaultValue: 0 }),
  Object.freeze({ id: 'grayscale', label: 'Grayscale', family: 'color', min: 0, max: 1, step: 0.05, precision: 2, defaultValue: 0 }),
  Object.freeze({ id: 'opacity', label: 'Opacity', family: 'composite', min: 0, max: 1, step: 0.02, precision: 2, defaultValue: 1 }),
]);

export const VT_E1_FX_IDS = Object.freeze(VT_E1_FX_CATALOG.map((entry) => entry.id));
export const VT_E1_FILTER_FX_IDS = Object.freeze(
  VT_E1_FX_CATALOG.filter((entry) => entry.family !== 'composite').map((entry) => entry.id),
);

export const VT_E1_DEFAULT_FX_ORDER = VT_E1_FX_IDS;

export function vtE1FxDefinition(id) {
  return VT_E1_FX_CATALOG.find((entry) => entry.id === id);
}

export function normalizeVtE1FxOrder(value) {
  const requested = Array.isArray(value) ? value.map(String) : [];
  const valid = requested.filter((id, index) => VT_E1_FX_IDS.includes(id) && requested.indexOf(id) === index);
  return [...valid, ...VT_E1_FX_IDS.filter((id) => !valid.includes(id))];
}

export function normalizeVtE1FxDisabled(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return VT_E1_FX_IDS.reduce((result, id) => {
    if (Boolean(value[id])) result[id] = true;
    return result;
  }, {});
}

export function vtE1FxValue(payload, id) {
  const definition = vtE1FxDefinition(id);
  if (!definition) return undefined;
  const raw = Number(payload?.[id]);
  if (!Number.isFinite(raw)) return definition.defaultValue;
  return Math.min(definition.max, Math.max(definition.min, raw));
}

export function vtE1FxOpacity(payload = {}) {
  if (Boolean(payload.fxBypass)) return 1;
  const disabled = normalizeVtE1FxDisabled(payload.fxDisabled);
  if (disabled.opacity) return 1;
  return vtE1FxValue(payload, 'opacity') ?? 1;
}

function filterValueFor(payload, id) {
  const value = vtE1FxValue(payload, id);
  switch (id) {
    case 'blur':
      return value ? `blur(${value}px)` : '';
    case 'saturation':
      return `saturate(${value})`;
    case 'brightness':
      return `brightness(${value})`;
    case 'hue':
      return value ? `hue-rotate(${value}deg)` : '';
    case 'contrast':
      return `contrast(${value})`;
    case 'sepia':
      return value ? `sepia(${value})` : '';
    case 'grayscale':
      return value ? `grayscale(${value})` : '';
    default:
      return '';
  }
}

export function vtE1FilterCss(payload = {}) {
  if (Boolean(payload.fxBypass)) return '';
  const disabled = normalizeVtE1FxDisabled(payload.fxDisabled);
  const order = normalizeVtE1FxOrder(payload.fxOrder);
  return order
    .filter((id) => VT_E1_FILTER_FX_IDS.includes(id))
    .filter((id) => !disabled[id])
    .map((id) => filterValueFor(payload, id))
    .filter(Boolean)
    .join(' ');
}

export function resetVtE1FxPatch() {
  const patch = VT_E1_FX_CATALOG.reduce((result, definition) => {
    result[definition.id] = definition.defaultValue;
    return result;
  }, {});
  return {
    ...patch,
    fxBypass: false,
    fxDisabled: {},
    fxOrder: [...VT_E1_DEFAULT_FX_ORDER],
  };
}
