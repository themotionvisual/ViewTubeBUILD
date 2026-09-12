import type {TemplateDefinition} from '../core/schema';
import type {VtE1Clip} from '../../shared/vtE1TimelineContract';
import {createTemplateClipInstance, resolveTemplateIntrinsicBounds} from './vtE1Adapter';
import type {TemplateInstanceOverrides, TemplateResponsiveMode} from './types';

export interface TemplateClipOptions {
  startSec: number;
  durationSec?: number;
  trackId?: string;
  fps?: number;
  clipId?: string;
  templateVersion?: number;
  responsiveMode?: TemplateResponsiveMode;
  overrides?: Partial<TemplateInstanceOverrides>;
}

function legacyCompatibleClipId(templateId: string): string {
  return `template_${templateId}_${Date.now().toString(36)}`;
}

/**
 * Bridge a canonical design-library template into VT_E1's existing permissive
 * clip contract. Timeline timing/tracks remain owned by VT_E1; customization,
 * responsive metadata and SVG bounds remain owned by the template instance.
 *
 * Existing callers are preserved: all previously-supported options remain
 * optional and the legacy clip metadata fields are still emitted.
 */
export function templateToTimelineClip(template: TemplateDefinition, options: TemplateClipOptions): VtE1Clip {
  const clipId = options.clipId ?? legacyCompatibleClipId(template.id);
  const instance = createTemplateClipInstance(template, {
    clipId,
    startSec: options.startSec,
    durationSec: options.durationSec,
    trackId: options.trackId,
    fps: options.fps,
    templateVersion: options.templateVersion,
    responsiveMode: options.responsiveMode,
    overrides: options.overrides,
  });
  const intrinsicBounds = resolveTemplateIntrinsicBounds(template);

  return {
    id: clipId,
    trackId: instance.trackId,
    start: instance.startSec,
    end: instance.startSec + instance.durationSec,
    clipType: 'design-template',

    // Compatibility fields used by the current VT_E1 template path.
    templateId: template.id,
    templateName: template.name,
    templateCategory: template.category,
    templateDefinition: template,
    editableElements: template.elements,
    aspectRatio: template.aspectRatio,

    // Canonical bridge fields used by the merged customizable-template path.
    templateVersion: instance.templateVersion,
    templateRenderMode: instance.renderMode,
    templateResponsiveMode: instance.responsiveMode,
    templateIntrinsicBounds: intrinsicBounds,
    templateTransform: instance.transform,
    templateOverrides: instance.overrides,
    templateInstance: instance,
  };
}
