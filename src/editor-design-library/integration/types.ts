import type {
  TemplateAnimation,
  TemplateDefinition,
  TemplateRenderMode,
  TemplateStyleConfig,
} from '../core/schema';

export type DeepPartial<T> =
  T extends (...args: never[]) => unknown
    ? T
    : T extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;

export type TemplateResponsiveMode = '16:9' | '9:16' | '1:1';

export interface TemplateInstanceTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
}

export interface TemplateContentOverrides {
  [elementId: string]: unknown;
}

export interface TemplateLayoutOverrides {
  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'center' | 'bottom';
  padding?: number;
  gap?: number;
  insetX?: number;
  insetY?: number;
  intrinsicWidth?: number;
  intrinsicHeight?: number;
  [key: string]: unknown;
}

export interface TemplateMotionOverrides {
  entrance?: Partial<TemplateAnimation> | null;
  emphasis?: Partial<TemplateAnimation> | null;
  loop?: Partial<TemplateAnimation> | null;
  exit?: Partial<TemplateAnimation> | null;
  transition?: Partial<TemplateAnimation> | null;
  [key: string]: unknown;
}

export interface TemplateInstanceOverrides {
  content: TemplateContentOverrides;
  style: DeepPartial<TemplateStyleConfig>;
  layout: TemplateLayoutOverrides;
  motion: TemplateMotionOverrides;
}

export interface TemplateClipInstance {
  clipId: string;
  templateId: string;
  templateVersion: number;
  renderMode: TemplateRenderMode;
  startSec: number;
  durationSec: number;
  trackId: string;
  transform: TemplateInstanceTransform;
  overrides: TemplateInstanceOverrides;
  responsiveMode: TemplateResponsiveMode;
}

export interface ResolvedTemplateInstance extends TemplateClipInstance {
  definition: TemplateDefinition;
  canonicalTemplateId: string;
  intrinsicBounds: {
    width: number;
    height: number;
    viewBox?: string;
  };
}

export interface CreateTemplateInstanceOptions {
  clipId: string;
  startSec: number;
  durationSec?: number;
  trackId?: string;
  fps?: number;
  templateVersion?: number;
  responsiveMode?: TemplateResponsiveMode;
  transform?: Partial<TemplateInstanceTransform>;
  overrides?: Partial<TemplateInstanceOverrides>;
}

export const EMPTY_TEMPLATE_OVERRIDES: TemplateInstanceOverrides = Object.freeze({
  content: {},
  style: {},
  layout: {},
  motion: {},
});
