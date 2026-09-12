import type {TemplateDefinition} from './schema';

export type TemplateQualitySeverity = 'error' | 'warning';
export interface TemplateQualityIssue {
  code: string;
  severity: TemplateQualitySeverity;
  message: string;
  elementId?: string;
}

const OVERLAY_MODES = new Set(['svg-overlay', 'svg-clip']);

export function validateTemplateQuality(template: TemplateDefinition): TemplateQualityIssue[] {
  const issues: TemplateQualityIssue[] = [];
  const isOverlay = template.renderMode ? OVERLAY_MODES.has(template.renderMode) : false;

  if (isOverlay && template.background) {
    issues.push({code:'overlay-background', severity:'error', message:'Transparent SVG overlays must not define a full-frame background.'});
  }
  if (isOverlay && template.transparent !== true) {
    issues.push({code:'overlay-transparency', severity:'error', message:'SVG overlays must explicitly render transparent.'});
  }
  if (isOverlay && !template.intrinsicBounds) {
    issues.push({code:'intrinsic-bounds', severity:'error', message:'SVG overlays require intrinsic bounds so VT_E1 can size them like normal visual clips.'});
  }
  if (isOverlay && !template.defaultTransform) {
    issues.push({code:'default-transform', severity:'warning', message:'Overlay should provide a sensible default transform/anchor.'});
  }
  if (isOverlay && (!template.clipBehavior?.movable || !template.clipBehavior?.resizable || !template.clipBehavior?.trimmable || !template.clipBehavior?.layerable)) {
    issues.push({code:'clip-behavior', severity:'error', message:'Overlay must support move, resize, trim, and layering.'});
  }

  for (const element of template.elements) {
    if (element.type === 'text' && typeof element.fontSize === 'number') {
      const isSupporting = element.motionRole === 'supporting';
      const minimum = isSupporting ? 28 : 46;
      if (element.fontSize < minimum) {
        issues.push({
          code:'small-video-text', severity:'warning', elementId:element.id,
          message:`Video text is ${element.fontSize}px; production minimum for this role is ${minimum}px.`,
        });
      }
    }
    if (element.svg?.includes('filter="drop-shadow') || element.svg?.includes('<feDropShadow')) {
      issues.push({code:'heavy-shadow', severity:'warning', elementId:element.id, message:'Drop shadows should be opt-in style variants, not a default template treatment.'});
    }
    if (element.svg && /#[0-9a-fA-F]{6}/.test(element.svg) && !element.fillToken && !element.strokeToken) {
      issues.push({code:'raw-svg-color', severity:'warning', elementId:element.id, message:'SVG contains a raw hex color without a semantic style token.'});
    }
  }

  return issues;
}

export function templateQualityScore(template: TemplateDefinition): number {
  const issues = validateTemplateQuality(template);
  const penalty = issues.reduce((sum, issue) => sum + (issue.severity === 'error' ? 12 : 4), 0);
  return Math.max(0, 100 - penalty);
}

export function isProductionReadyTemplate(template: TemplateDefinition, minimumScore = 85): boolean {
  return templateQualityScore(template) >= minimumScore && !validateTemplateQuality(template).some((issue) => issue.severity === 'error');
}
