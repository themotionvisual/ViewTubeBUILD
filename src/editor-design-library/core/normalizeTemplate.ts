import type {TemplateDefinition} from './schema';

const SVG_CLIP_BEHAVIOR = {
  transparentBackground: true,
  movable: true,
  resizable: true,
  rotatable: true,
  duplicable: true,
  trimmable: true,
  layerable: true,
  preserveAspectRatio: false,
  defaultScale: 1,
} as const;

export function normalizeTemplate(template: TemplateDefinition): TemplateDefinition {
  const isDedicatedBackground = template.category === 'background' || template.category === 'pattern';

  if (!template.customizable) {
    return {
      ...template,
      renderMode: template.renderMode ?? (isDedicatedBackground ? 'full-frame' : 'svg-clip'),
    };
  }

  if (isDedicatedBackground) {
    return {
      ...template,
      renderMode: 'full-frame',
      clipBehavior: {
        ...SVG_CLIP_BEHAVIOR,
        transparentBackground: false,
        preserveAspectRatio: true,
        ...template.clipBehavior,
      },
    };
  }

  return {
    ...template,
    // Customizable overlays/scenes render as one transparent SVG composition clip.
    // Internal plates, text, icons and shapes stay editable inside the composition,
    // while the finished composition behaves like an image/text/shape clip in VT_E1.
    background: undefined,
    renderMode: 'svg-clip',
    clipBehavior: {
      ...SVG_CLIP_BEHAVIOR,
      ...template.clipBehavior,
      transparentBackground: true,
    },
  };
}

export function normalizeTemplateCatalog(templates: TemplateDefinition[]): TemplateDefinition[] {
  return templates.map(normalizeTemplate);
}
