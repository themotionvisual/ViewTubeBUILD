import type {TemplateDefinition, TemplateRenderMode} from '../core/schema';
import {canonicalTemplateId, resolveTemplateById} from './legacyTemplateAliases';
import type {
  CreateTemplateInstanceOptions,
  DeepPartial,
  ResolvedTemplateInstance,
  TemplateClipInstance,
  TemplateInstanceOverrides,
  TemplateInstanceTransform,
} from './types';

const DEFAULT_TRACK_ID = 't_overlay';
const DEFAULT_DURATION_SEC = 3;
const DEFAULT_FPS = 30;

const DEFAULT_TRANSFORM: TemplateInstanceTransform = Object.freeze({
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
});

export function inferTemplateRenderMode(template: TemplateDefinition): TemplateRenderMode {
  if (template.renderMode) return template.renderMode;
  if (template.category === 'transition') return 'transition';
  if (template.category === 'background' || template.category === 'pattern') return 'background';
  if (template.category === 'scene') return template.transparent === false ? 'full-frame' : 'svg-scene';
  return 'svg-overlay';
}

export function resolveTemplateIntrinsicBounds(template: TemplateDefinition) {
  return {
    width: template.intrinsicBounds?.width ?? template.width,
    height: template.intrinsicBounds?.height ?? template.height,
    ...(template.intrinsicBounds?.viewBox ? {viewBox: template.intrinsicBounds.viewBox} : {}),
  };
}

function mergeRecord<T extends Record<string, unknown>>(base: T, patch?: Partial<T>): T {
  return {...base, ...(patch ?? {})};
}

export function mergeTemplateOverrides(
  base: TemplateInstanceOverrides,
  patch?: Partial<TemplateInstanceOverrides>,
): TemplateInstanceOverrides {
  if (!patch) {
    return {
      content: {...base.content},
      style: {...base.style},
      layout: {...base.layout},
      motion: {...base.motion},
    };
  }

  return {
    content: mergeRecord(base.content, patch.content),
    style: {...base.style, ...(patch.style ?? {})} as DeepPartial<TemplateInstanceOverrides['style']>,
    layout: mergeRecord(base.layout, patch.layout),
    motion: mergeRecord(base.motion, patch.motion),
  };
}

export function createTemplateClipInstance(
  template: TemplateDefinition,
  options: CreateTemplateInstanceOptions,
): TemplateClipInstance {
  const fps = options.fps ?? DEFAULT_FPS;
  const durationSec = options.durationSec
    ?? (template.durationFrames ? template.durationFrames / fps : DEFAULT_DURATION_SEC);

  return {
    clipId: options.clipId,
    templateId: template.id,
    templateVersion: options.templateVersion ?? 1,
    renderMode: inferTemplateRenderMode(template),
    startSec: options.startSec,
    durationSec,
    trackId: options.trackId ?? DEFAULT_TRACK_ID,
    transform: {...DEFAULT_TRANSFORM, ...(options.transform ?? {})},
    overrides: mergeTemplateOverrides(
      {content: {}, style: {}, layout: {}, motion: {}},
      options.overrides,
    ),
    responsiveMode: options.responsiveMode ?? '16:9',
  };
}

export function applyTemplateOverrides(
  instance: TemplateClipInstance,
  patch: Partial<TemplateInstanceOverrides>,
): TemplateClipInstance {
  return {
    ...instance,
    overrides: mergeTemplateOverrides(instance.overrides, patch),
  };
}

export function resolveTemplateInstance(instance: TemplateClipInstance): ResolvedTemplateInstance | undefined {
  const definition = resolveTemplateById(instance.templateId);
  if (!definition) return undefined;

  return {
    ...instance,
    templateId: definition.id,
    canonicalTemplateId: canonicalTemplateId(instance.templateId),
    renderMode: inferTemplateRenderMode(definition),
    definition,
    intrinsicBounds: resolveTemplateIntrinsicBounds(definition),
  };
}

export function isTemplateClipInstance(value: unknown): value is TemplateClipInstance {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TemplateClipInstance>;
  return Boolean(
    candidate.clipId
    && candidate.templateId
    && candidate.trackId
    && typeof candidate.startSec === 'number'
    && typeof candidate.durationSec === 'number'
    && candidate.transform
    && candidate.overrides,
  );
}
