export type TemplateAspectRatio = '16:9' | '9:16' | '1:1' | 'responsive';
export type TemplateCategory = 'background' | 'pattern' | 'text' | 'graphic' | 'scene' | 'transition' | 'engagement';
export type TemplateElementType = 'svg' | 'text' | 'image' | 'video' | 'group';
export type MotionPreset =
  | 'none'
  | 'fade'
  | 'slide'
  | 'scale'
  | 'spring'
  | 'wipe'
  | 'reveal'
  | 'stagger'
  | 'loop'
  | 'pop'
  | 'overshoot'
  | 'bounce'
  | 'elastic'
  | 'type-reveal'
  | 'mask-reveal'
  | 'line-draw'
  | 'rotate-in'
  | 'blur-in'
  | 'stagger-words'
  | 'stagger-letters';

export type StyleTokenPath =
  | 'colors.primary'
  | 'colors.secondary'
  | 'colors.accent'
  | 'colors.background'
  | 'colors.foreground'
  | 'colors.border'
  | 'colors.shadow'
  | 'typography.displayFamily'
  | 'typography.headingFamily'
  | 'typography.bodyFamily'
  | 'typography.labelFamily'
  | 'typography.fontWeight'
  | 'typography.letterSpacing'
  | 'typography.lineHeight'
  | 'sizing.scale'
  | 'sizing.titleSize'
  | 'sizing.subtitleSize'
  | 'sizing.bodySize'
  | 'sizing.iconSize'
  | 'sizing.strokeWidth'
  | 'sizing.radius'
  | 'sizing.shadowOffset'
  | 'spacing.padding'
  | 'spacing.gap'
  | 'spacing.insetX'
  | 'spacing.insetY'
  | 'motion.duration'
  | 'motion.delay'
  | 'motion.stagger'
  | 'motion.easing'
  | 'motion.direction'
  | 'motion.intensity';

export interface TemplateAnimation {
  preset: MotionPreset;
  startFrame?: number;
  durationFrames?: number;
  delayFrames?: number;
  direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
  intensity?: number;
  easing?: string;
}

export interface TemplateStyleConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    border: string;
    shadow: string;
  };
  typography: {
    displayFamily: string;
    headingFamily: string;
    bodyFamily: string;
    labelFamily: string;
    fontWeight: number;
    fontStyle: 'normal' | 'italic';
    textTransform: 'none' | 'uppercase' | 'lowercase';
    letterSpacing: number;
    lineHeight: number;
  };
  sizing: {
    scale: number;
    titleSize: number;
    subtitleSize: number;
    bodySize: number;
    iconSize: number;
    strokeWidth: number;
    radius: number;
    shadowOffset: number;
  };
  spacing: {
    padding: number;
    gap: number;
    insetX: number;
    insetY: number;
  };
  motion: {
    duration: number;
    delay: number;
    stagger: number;
    easing: string;
    direction: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
    intensity: number;
  };
  canvas: {
    aspectRatio: Exclude<TemplateAspectRatio, 'responsive'>;
    safeArea: number;
  };
}

export interface TemplateResponsiveLayout {
  landscape?: Partial<TemplateStyleConfig>;
  portrait?: Partial<TemplateStyleConfig>;
  square?: Partial<TemplateStyleConfig>;
}

export interface TemplateElement {
  id: string;
  type: TemplateElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  fill?: string;
  fillToken?: StyleTokenPath;
  stroke?: string;
  strokeToken?: StyleTokenPath;
  strokeWidth?: number;
  strokeWidthToken?: StyleTokenPath;
  text?: string;
  fontFamily?: string;
  fontFamilyToken?: StyleTokenPath;
  fontSize?: number;
  fontSizeToken?: StyleTokenPath;
  fontWeight?: number;
  fontWeightToken?: StyleTokenPath;
  svg?: string;
  children?: TemplateElement[];
  animation?: TemplateAnimation;
  editable?: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  tags: string[];
  aspectRatio: TemplateAspectRatio;
  width: number;
  height: number;
  durationFrames?: number;
  background?: string;
  elements: TemplateElement[];
  palette?: string[];
  responsive?: boolean;
  style?: Partial<TemplateStyleConfig>;
  responsiveLayouts?: TemplateResponsiveLayout;
  entrance?: TemplateAnimation;
  emphasis?: TemplateAnimation;
  loop?: TemplateAnimation;
  transition?: TemplateAnimation;
  customizable?: boolean;
}
