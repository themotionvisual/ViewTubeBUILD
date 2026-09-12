import React from 'react';

export type VtE1TransitionDirection = 'entering' | 'exiting';
export type VtE1TransitionPresentationId =
  | 'fade'
  | 'slide'
  | 'wipe'
  | 'iris'
  | 'flip'
  | 'clock-wipe';

export interface VtE1TransitionPresentationProps {
  progress: number;
  direction: VtE1TransitionDirection;
  children: React.ReactNode;
  params?: Record<string, unknown>;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, Number(value) || 0));

const layerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
};

const Fade: React.FC<VtE1TransitionPresentationProps> = ({
  progress,
  direction,
  children,
}) => {
  const p = clamp01(progress);
  return (
    <div style={{ ...layerStyle, opacity: direction === 'entering' ? p : 1 - p }}>
      {children}
    </div>
  );
};

const Slide: React.FC<VtE1TransitionPresentationProps> = ({
  progress,
  direction,
  params,
  children,
}) => {
  const p = clamp01(progress);
  const from =
    (params?.direction as 'from-left' | 'from-right' | 'from-top' | 'from-bottom' | undefined)
    ?? 'from-right';
  const horizontal = from === 'from-left' || from === 'from-right';
  const sign = from === 'from-left' || from === 'from-top' ? -1 : 1;
  const value = direction === 'entering'
    ? sign * (1 - p) * 100
    : -sign * p * 100;
  return (
    <div
      style={{
        ...layerStyle,
        transform: horizontal ? `translateX(${value}%)` : `translateY(${value}%)`,
      }}
    >
      {children}
    </div>
  );
};

const Wipe: React.FC<VtE1TransitionPresentationProps> = ({
  progress,
  direction,
  params,
  children,
}) => {
  const raw = clamp01(progress);
  const p = direction === 'entering' ? raw : 1 - raw;
  const from =
    (params?.direction as 'from-left' | 'from-right' | 'from-top' | 'from-bottom' | undefined)
    ?? 'from-left';
  const clipPath = {
    'from-left': `inset(0 ${(1 - p) * 100}% 0 0)`,
    'from-right': `inset(0 0 0 ${(1 - p) * 100}%)`,
    'from-top': `inset(0 0 ${(1 - p) * 100}% 0)`,
    'from-bottom': `inset(${(1 - p) * 100}% 0 0 0)`,
  }[from];
  return <div style={{ ...layerStyle, clipPath }}>{children}</div>;
};

const Iris: React.FC<VtE1TransitionPresentationProps> = ({
  progress,
  direction,
  children,
}) => {
  const raw = clamp01(progress);
  const p = direction === 'entering' ? raw : 1 - raw;
  return (
    <div style={{ ...layerStyle, clipPath: `circle(${p * 72}% at 50% 50%)` }}>
      {children}
    </div>
  );
};

const Flip: React.FC<VtE1TransitionPresentationProps> = ({
  progress,
  direction,
  params,
  children,
}) => {
  const p = clamp01(progress);
  const axis = params?.axis === 'x' ? 'X' : 'Y';
  const enteringDeg = -90 + p * 90;
  const exitingDeg = p * 90;
  const deg = direction === 'entering' ? enteringDeg : exitingDeg;
  return (
    <div
      style={{
        ...layerStyle,
        backfaceVisibility: 'hidden',
        transformOrigin: '50% 50%',
        transform: `perspective(1200px) rotate${axis}(${deg}deg)`,
      }}
    >
      {children}
    </div>
  );
};

const ClockWipe: React.FC<VtE1TransitionPresentationProps> = ({
  progress,
  direction,
  children,
}) => {
  const raw = clamp01(progress);
  const p = direction === 'entering' ? raw : 1 - raw;
  const degrees = Math.max(0.001, p * 360);
  return (
    <div
      style={{
        ...layerStyle,
        WebkitMaskImage: `conic-gradient(#000 0deg ${degrees}deg, transparent ${degrees}deg 360deg)`,
        maskImage: `conic-gradient(#000 0deg ${degrees}deg, transparent ${degrees}deg 360deg)`,
      }}
    >
      {children}
    </div>
  );
};

export const VT_E1_TRANSITION_PRESENTATIONS: Record<
  VtE1TransitionPresentationId,
  React.FC<VtE1TransitionPresentationProps>
> = {
  fade: Fade,
  slide: Slide,
  wipe: Wipe,
  iris: Iris,
  flip: Flip,
  'clock-wipe': ClockWipe,
};

export function resolveVtE1TransitionPresentation(
  id?: string | null,
): React.FC<VtE1TransitionPresentationProps> {
  if (id && id in VT_E1_TRANSITION_PRESENTATIONS) {
    return VT_E1_TRANSITION_PRESENTATIONS[id as VtE1TransitionPresentationId];
  }
  return Fade;
}

/**
 * Pure presentation layer only.
 *
 * The caller owns temporal placement and progress. In VT-E1 those values must
 * come from vtE1TimelineContract.transitionWindowFor() so browser preview and
 * Remotion export share the exact same seam/duration math.
 */
export const VtE1TransitionLayer: React.FC<
  VtE1TransitionPresentationProps & { presentation?: string | null }
> = ({ presentation, ...props }) => {
  const Presentation = resolveVtE1TransitionPresentation(presentation);
  return <Presentation {...props} />;
};
