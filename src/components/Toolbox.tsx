import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/toolbox-entry.css';
import { CustomIcon } from './CustomIcon';
import { getToolboxPaletteColors } from '../styles/toolboxPalette';
import { hexToRgba, AnimatedToggleIcon } from './ToolboxUISystem';
import { ChevronDown, CircleQuestionMark, Cloud, Zap } from 'lucide-react';
import {
  CONTROL_SHELL,
  SUBTOOLBOX_COLLAPSE_TRANSITION,
  SUBTOOLBOX_TOKENS,
  resolveSubtoolboxMinHeight,
} from './subtoolbox/tokens';

export { CONTROL_SHELL } from './subtoolbox/tokens';

const SHELL_COLLAPSE_TRANSITION = SUBTOOLBOX_COLLAPSE_TRANSITION;
const SHELL_COLLAPSE_DURATION_MS = SUBTOOLBOX_TOKENS.motion.collapseMs;
const MAIN_TOOLBOX_STROKE = 5;
const MAIN_TOOLBOX_SHADOW = 10;
const SUB_TOOLBOX_STROKE = SUBTOOLBOX_TOKENS.shell.stroke;
const SUB_TOOLBOX_SHADOW = SUBTOOLBOX_TOKENS.shell.shadowOffset;
const SUB_TOOLBOX_RADIUS = SUBTOOLBOX_TOKENS.shell.radius;
const SUB_TOOLBOX_INNER_STROKE = SUBTOOLBOX_TOKENS.shell.stroke;
const SUB_TOOLBOX_INNER_SHADOW = SUBTOOLBOX_TOKENS.interior.shadowOffset;

interface IconRailProps {
  backgroundColor: string;
  stroke?: number;
  children: React.ReactNode;
}
