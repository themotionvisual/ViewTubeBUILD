import type {StyleTokenPath, TemplateStyleConfig} from './schema';
import {VIEWTUBE_INK, VIEWTUBE_PALETTE, VIEWTUBE_WHITE} from './tokens';

export const DEFAULT_TEMPLATE_STYLE: TemplateStyleConfig = {
  colors: {
    primary: VIEWTUBE_PALETTE[7],
    secondary: VIEWTUBE_PALETTE[3],
    accent: VIEWTUBE_PALETTE[0],
    background: VIEWTUBE_WHITE,
    foreground: VIEWTUBE_INK,
    border: VIEWTUBE_INK,
    shadow: VIEWTUBE_INK,
  },
  typography: {
    displayFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    headingFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    bodyFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    labelFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontWeight: 900,
    fontStyle: 'normal',
    textTransform: 'uppercase',
    letterSpacing: 0,
    lineHeight: 1,
  },
  sizing: {
    scale: 1,
    titleSize: 144,
    subtitleSize: 54,
    bodySize: 34,
    iconSize: 72,
    strokeWidth: 8,
    radius: 24,
    shadowOffset: 14,
  },
  spacing: {
    padding: 96,
    gap: 28,
    insetX: 96,
    insetY: 80,
  },
  motion: {
    duration: 0.65,
    delay: 0,
    stagger: 0.08,
    easing: 'power3.out',
    direction: 'up',
    intensity: 1,
  },
  canvas: {
    aspectRatio: '16:9',
    safeArea: 0.06,
  },
};

export type TemplateStyleLayer = Partial<{
  [K in keyof TemplateStyleConfig]: Partial<TemplateStyleConfig[K]>;
}>;

export function mergeTemplateStyle(...layers: Array<TemplateStyleLayer | undefined>): TemplateStyleConfig {
  const result: TemplateStyleConfig = structuredClone(DEFAULT_TEMPLATE_STYLE);
  for (const layer of layers) {
    if (!layer) continue;
    for (const key of Object.keys(layer) as Array<keyof TemplateStyleConfig>) {
      const value = layer[key];
      if (!value) continue;
      Object.assign(result[key], value);
    }
  }
  return result;
}

export function resolveStyleToken(style: TemplateStyleConfig, path: StyleTokenPath): string | number {
  const [group, token] = path.split('.') as [keyof TemplateStyleConfig, string];
  return (style[group] as Record<string, string | number>)[token];
}

export const FONT_REGISTRY = {
  viewtubeSans: {
    id: 'viewtube-sans',
    name: 'ViewTube Sans',
    stack: 'Inter, ui-sans-serif, system-ui, sans-serif',
    roles: ['display', 'heading', 'body', 'label'] as const,
  },
  systemSans: {
    id: 'system-sans',
    name: 'System Sans',
    stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    roles: ['display', 'heading', 'body', 'label'] as const,
  },
  serif: {
    id: 'editorial-serif',
    name: 'Editorial Serif',
    stack: 'Georgia, "Times New Roman", serif',
    roles: ['display', 'heading', 'body'] as const,
  },
  mono: {
    id: 'mono',
    name: 'Mono',
    stack: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    roles: ['heading', 'body', 'label'] as const,
  },
} as const;

export const VIEWTUBE_THEMES: Record<string, TemplateStyleLayer> = {
  classic: {},
  dark: {
    colors: {background: VIEWTUBE_INK, foreground: VIEWTUBE_WHITE, border: VIEWTUBE_WHITE, shadow: '#000000'},
  },
  history: {
    colors: {primary: '#c9a85c', secondary: '#e9ddbf', accent: '#8a2f2c', background: '#f4ecda', foreground: '#211d17', border: '#211d17', shadow: '#211d17'},
    typography: {displayFamily: FONT_REGISTRY.serif.stack, headingFamily: FONT_REGISTRY.serif.stack},
  },
  data: {
    colors: {primary: VIEWTUBE_PALETTE[7], secondary: VIEWTUBE_PALETTE[8], accent: VIEWTUBE_PALETTE[4]},
    sizing: {radius: 12, shadowOffset: 8},
  },
  minimal: {
    colors: {primary: VIEWTUBE_WHITE, secondary: '#f3f3f3', accent: VIEWTUBE_INK},
    sizing: {strokeWidth: 3, radius: 8, shadowOffset: 0},
  },
};
