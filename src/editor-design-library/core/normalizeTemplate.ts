import type {TemplateDefinition, TemplateRenderMode} from './schema';

const SVG_CLIP_BEHAVIOR = {
  transparentBackground: true,
  movable: true,
  resizable: true,
  rotatable: true,
  duplicable: true,
  trimmable: true,
  layerable: true,
  preserveAspectRatio: true,
  defaultScale: 1,
  safeZoneBehavior: 'free' as const,
  snapToSafeZones: true,
};

function inferRenderMode(template: TemplateDefinition): TemplateRenderMode {
  if (template.category === 'background' || template.category === 'pattern') return 'background';
  if (template.category === 'transition') return 'transition';
  if (template.category === 'scene') return 'svg-scene';
  return 'svg-overlay';
}

export function normalizeTemplate(template: TemplateDefinition): TemplateDefinition {
  const renderMode = template.renderMode === 'svg-clip' || template.renderMode === 'full-frame'
    ? inferRenderMode(template)
    : (template.renderMode ?? inferRenderMode(template));

  const isBackground = renderMode === 'background';
  const transparent = !isBackground;
  const intrinsicBounds = template.intrinsicBounds ?? {
    width: template.width,
    height: template.height,
    viewBox: `0 0 ${template.width} ${template.height}`,
  };

  return {
    ...template,
    renderMode,
    transparent,
    intrinsicBounds,
    background: isBackground ? template.background : undefined,
    safeZoneBehavior: template.safeZoneBehavior ?? (renderMode === 'svg-scene' ? 'landscape' : 'free'),
    clipBehavior: isBackground
      ? {
          ...SVG_CLIP_BEHAVIOR,
          transparentBackground: false,
          preserveAspectRatio: true,
          safeZoneBehavior: 'landscape',
          ...template.clipBehavior,
        }
      : {
          ...SVG_CLIP_BEHAVIOR,
          ...template.clipBehavior,
          transparentBackground: true,
        },
  };
}

export function normalizeTemplateCatalog(templates: TemplateDefinition[]): TemplateDefinition[] {
  return templates.map(normalizeTemplate);
}
