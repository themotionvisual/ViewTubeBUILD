import type {TemplateDefinition} from '../core/schema';
import type {VtE1Clip} from '../../shared/vtE1TimelineContract';

export interface TemplateClipOptions {
  startSec: number;
  durationSec?: number;
  trackId?: string;
  fps?: number;
}

export function templateToTimelineClip(template: TemplateDefinition, options: TemplateClipOptions): VtE1Clip {
  const fps = options.fps ?? 30;
  const durationSec = options.durationSec ?? (template.durationFrames ? template.durationFrames / fps : 3);
  return {
    id: `template_${template.id}_${Date.now().toString(36)}`,
    trackId: options.trackId ?? 't_overlay',
    start: options.startSec,
    end: options.startSec + durationSec,
    clipType: 'design-template',
    templateId: template.id,
    templateName: template.name,
    templateCategory: template.category,
    templateDefinition: template,
    editableElements: template.elements,
    aspectRatio: template.aspectRatio,
  };
}
