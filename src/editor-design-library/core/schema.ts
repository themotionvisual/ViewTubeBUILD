export type TemplateAspectRatio = '16:9' | '9:16' | '1:1' | 'responsive';
export type TemplateCategory = 'background' | 'pattern' | 'text' | 'graphic' | 'scene';
export type TemplateElementType = 'svg' | 'text' | 'image' | 'video' | 'group';
export type MotionPreset = 'none' | 'fade' | 'slide' | 'scale' | 'spring' | 'wipe' | 'reveal' | 'stagger' | 'loop';

export interface TemplateAnimation {
  preset: MotionPreset;
  startFrame?: number;
  durationFrames?: number;
  delayFrames?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  intensity?: number;
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
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
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
}
