import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { getAssetDefinition } from './catalog';
import {
  aspectRatioLayout,
  loopProgress,
  orbitalPosition,
  phaseOffset,
  seededRandom,
  waveValue,
} from './motion';
import type { AssetCompositionProps, AssetDefinition, AssetVisualProps } from './types';

const range = (count: number) => Array.from({ length: Math.max(0, count) }, (_, index) => index);
const pct = (value: number) => `${value}%`;
const TAU = Math.PI * 2;

const resolveProps = (
  asset: AssetDefinition,
  input: AssetCompositionProps,
): AssetVisualProps => ({
  ...asset.defaults,
  ...Object.fromEntries(
    Object.entries(input).filter(([key, value]) => key !== 'assetId' && value !== undefined),
  ),
}) as AssetVisualProps;

const WavePath: React.FC<{
  y: number;
  amplitude: number;
  progress: number;
  phase: number;
  frequency: number;
  color: string;
  width: number;
  opacity: number;
}> = ({ y, amplitude, progress, phase, frequency, color, width, opacity }) => {
  const points = range(33).map((index) => {
    const x = index / 32 * 100;
    const yy = y + Math.sin((index / 32 * frequency + progress + phase) * TAU) * amplitude;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${yy.toFixed(2)}`;
  }).join(' ');
  return <path d={points} fill="none" stroke={color} strokeWidth={width} opacity={opacity} vectorEffect="non-scaling-stroke" />;
};

const GradientField: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const id = asset.id.replace(/-/g, '');
  const a = orbitalPosition(p, 24, 18, asset.variant * 0.07);
  const b = orbitalPosition(p, 30, 24, 0.5 + asset.variant * 0.03);
  return (
    <>
      <defs>
        <radialGradient id={`${id}-a`} cx={`${50 + a.x}%`} cy={`${50 + a.y}%`} r="62%">
          <stop offset="0%" stopColor={props.primaryColor} stopOpacity="0.98" />
          <stop offset="58%" stopColor={props.secondaryColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor={props.backgroundColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx={`${50 + b.x}%`} cy={`${50 + b.y}%`} r="55%">
          <stop offset="0%" stopColor={props.accentColor} stopOpacity="0.78" />
          <stop offset="100%" stopColor={props.backgroundColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={props.backgroundColor} />
      <rect width="100" height="100" fill={`url(#${id}-a)`} />
      <rect width="100" height="100" fill={`url(#${id}-b)`} />
    </>
  );
};

const RadialLight: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const turns = 1 + (asset.variant % 3);
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      {range(10).map((i) => {
        const radius = 7 + i * 5.2;
        const pulse = 0.65 + 0.35 * Math.sin((p + i * 0.09) * TAU);
        return <circle key={i} cx="50" cy="50" r={radius} fill="none" stroke={i % 3 === 0 ? props.accentColor : props.primaryColor} strokeWidth={0.2 + props.strokeWidth * 0.22} opacity={0.08 + pulse * 0.2} />;
      })}
      <g transform={`rotate(${p * 360 * turns} 50 50)`}>
        <path d="M50 50 L98 44 A49 49 0 0 1 98 56 Z" fill={props.accentColor} opacity="0.2" />
        <line x1="50" y1="50" x2="98" y2="50" stroke={props.foregroundColor} strokeWidth="0.45" opacity="0.75" />
      </g>
      <circle cx="50" cy="50" r={4 + asset.variant * 0.6} fill={props.primaryColor} opacity="0.9" />
    </>
  );
};

const GridField: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const divisions = 8 + Math.round(props.density * 6);
  const offset = p * (100 / divisions);
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      <g opacity="0.62" transform={`translate(${offset - 100 / divisions} ${asset.variant % 2 ? 0 : offset - 100 / divisions})`}>
        {range(divisions + 3).map((i) => <line key={`v${i}`} x1={(i - 1) * 100 / divisions} y1="-20" x2={(i - 1) * 100 / divisions} y2="120" stroke={i % 4 === 0 ? props.accentColor : props.primaryColor} strokeWidth={i % 4 === 0 ? 0.42 : 0.18} />)}
        {range(divisions + 3).map((i) => <line key={`h${i}`} x1="-20" y1={(i - 1) * 100 / divisions} x2="120" y2={(i - 1) * 100 / divisions} stroke={i % 4 === 0 ? props.accentColor : props.primaryColor} strokeWidth={i % 4 === 0 ? 0.42 : 0.18} />)}
      </g>
      <rect x="8" y="8" width="84" height="84" fill="none" stroke={props.secondaryColor} strokeWidth="0.35" opacity="0.65" />
    </>
  );
};

const ModularTiles: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const cols = 6 + (asset.variant % 3);
  const rows = 7;
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      {range(cols * rows).map((i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const w = 88 / cols;
        const h = 84 / rows;
        const local = phaseOffset(p, (c + r * 0.7) / (cols + rows));
        const lift = waveValue(local, 0, 1.5 + props.intensity, 1);
        return <rect key={i} x={6 + c * w + 0.7} y={8 + r * h + 0.7 + lift} width={w - 1.4} height={h - 1.4} rx={asset.variant % 2 ? 1.2 : 0.2} fill={(c + r + asset.variant) % 5 === 0 ? props.accentColor : (c + r) % 2 ? props.secondaryColor : props.primaryColor} opacity={0.22 + 0.55 * (0.5 + 0.5 * Math.sin(local * TAU))} />;
      })}
    </>
  );
};

const OrbitSystem: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    {range(6).map((i) => <ellipse key={`e${i}`} cx="50" cy="50" rx={12 + i * 6} ry={8 + i * 4} fill="none" stroke={i % 2 ? props.secondaryColor : props.primaryColor} strokeWidth="0.24" opacity="0.5" transform={`rotate(${asset.variant * 7 + i * 11} 50 50)`} />)}
    {range(9).map((i) => {
      const q = orbitalPosition(p, 12 + (i % 5) * 6, 8 + (i % 5) * 4, i / 9 + asset.variant * 0.02);
      return <circle key={i} cx={50 + q.x} cy={50 + q.y} r={i % 3 === 0 ? 1.6 : 0.9} fill={i % 4 === 0 ? props.accentColor : props.foregroundColor} />;
    })}
    <circle cx="50" cy="50" r="3.4" fill={props.accentColor} />
  </>
);

const LineField: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    <g transform={`rotate(${asset.variant % 2 ? -10 : 10} 50 50)`}>
      {range(24).map((i) => {
        const y = 5 + i * 4;
        const dash = 8 + (i % 5) * 5;
        return <line key={i} x1="-15" y1={y} x2="115" y2={y + (asset.variant % 3 - 1) * 8} stroke={i % 7 === 0 ? props.accentColor : i % 2 ? props.secondaryColor : props.primaryColor} strokeWidth={i % 7 === 0 ? 0.7 : 0.25} strokeDasharray={`${dash} ${dash * 0.6}`} strokeDashoffset={-p * dash * 3 * (i % 2 ? 1 : -1)} opacity="0.72" />
      })}
    </g>
  </>
);

const WaveField: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    {range(14).map((i) => <WavePath key={i} y={12 + i * 5.8} amplitude={1.4 + (i % 4) * 0.75 * props.intensity} progress={p * (asset.variant % 2 ? 1 : -1)} phase={i * 0.08} frequency={1.5 + (asset.variant % 4) * 0.5} color={i % 5 === 0 ? props.accentColor : i % 2 ? props.secondaryColor : props.primaryColor} width={i % 5 === 0 ? 0.62 : 0.26} opacity={0.45 + (i % 3) * 0.1} />)}
  </>
);

const DotMatrix: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number; halftone?: boolean }> = ({ asset, props, p, halftone = false }) => {
  const cols = halftone ? 18 : 14;
  const rows = halftone ? 22 : 16;
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      {range(cols * rows).map((i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = 5 + c * 90 / Math.max(1, cols - 1);
        const y = 5 + r * 90 / Math.max(1, rows - 1);
        const radial = Math.hypot(x - 50, y - 50) / 70;
        const osc = 0.5 + 0.5 * Math.sin((p * (halftone ? 2 : 1) + radial * (2 + asset.variant * 0.2) + c * 0.03) * TAU);
        const radius = halftone ? 0.25 + osc * 1.35 : 0.38 + osc * 0.65;
        return <circle key={i} cx={x} cy={y} r={radius * props.density} fill={(c + r) % 11 === 0 ? props.accentColor : c % 2 ? props.primaryColor : props.secondaryColor} opacity={halftone ? 0.68 : 0.82} />;
      })}
    </>
  );
};

const Checker: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number; stripes?: boolean }> = ({ asset, props, p, stripes = false }) => {
  if (stripes) {
    const shift = p * 18;
    return (
      <>
        <rect width="100" height="100" fill={props.backgroundColor} />
        <g transform={`translate(${shift - 18} 0) rotate(${asset.variant % 2 ? -18 : 18} 50 50)`}>
          {range(14).map((i) => <rect key={i} x={-30 + i * 12} y="-30" width={5 + (i % 3)} height="160" fill={i % 5 === 0 ? props.accentColor : i % 2 ? props.primaryColor : props.secondaryColor} opacity={0.22 + (i % 3) * 0.16} />)}
        </g>
      </>
    );
  }
  const size = 12.5;
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      {range(10).map((r) => (
        <g key={r} transform={`translate(${((r % 2 ? p : -p) * size * 2) - size * 2} 0)`}>
          {range(12).map((c) => <rect key={c} x={c * size - size} y={r * 10} width={size} height="10" fill={(c + r + asset.variant) % 2 ? props.primaryColor : props.secondaryColor} opacity={(c + r) % 7 === 0 ? 0.9 : 0.35} />)}
        </g>
      ))}
    </>
  );
};

const FrameSystem: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    {!asset.transparent && <rect width="100" height="100" fill={props.backgroundColor} />}
    <rect x="6" y="6" width="88" height="88" rx={asset.variant % 3 ? 2 : 0} fill="none" stroke={props.primaryColor} strokeWidth={0.4 + props.strokeWidth * 0.15} strokeDasharray="18 5" strokeDashoffset={-p * 46} opacity="0.85" />
    <path d="M6 24 H18 V6 M82 6 V18 H94 M94 76 H82 V94 M18 94 V82 H6" fill="none" stroke={props.accentColor} strokeWidth="1.2" />
    <line x1={8 + p * 84} y1="3" x2={8 + p * 84} y2="8" stroke={props.secondaryColor} strokeWidth="1.5" />
    <line x1={92 - p * 84} y1="92" x2={92 - p * 84} y2="97" stroke={props.secondaryColor} strokeWidth="1.5" />
  </>
);

const Editorial: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number; kinetic?: boolean }> = ({ asset, props, p, kinetic = false }) => {
  const offset = kinetic ? Math.sin(p * TAU) * 8 : (p - 0.5) * 8;
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      <rect x={8 + offset} y="10" width="54" height="12" fill={props.primaryColor} opacity="0.88" />
      <rect x="8" y={27 - offset * 0.35} width="32" height="5" fill={props.accentColor} />
      <rect x="8" y="37" width="84" height="1.2" fill={props.secondaryColor} opacity="0.8" />
      <rect x={46 - offset * 0.5} y="44" width="46" height="34" fill={props.secondaryColor} opacity="0.26" />
      <rect x="8" y="44" width="32" height="34" fill={props.primaryColor} opacity="0.16" />
      {range(7).map((i) => <rect key={i} x="8" y={84 + i * 1.7} width={20 + ((i * 17 + asset.variant * 7) % 50)} height="0.65" fill={i === 0 ? props.accentColor : props.foregroundColor} opacity={0.35 + i * 0.04} />)}
    </>
  );
};

const SplitScreen: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const x = 45 + Math.sin((p + asset.variant * 0.03) * TAU) * 8 * props.intensity;
  return (
    <>
      {!asset.transparent && <rect width="100" height="100" fill={props.backgroundColor} />}
      <rect x="4" y="7" width={Math.max(18, x - 7)} height="86" fill={props.primaryColor} opacity="0.12" stroke={props.primaryColor} strokeWidth="0.45" />
      <rect x={x + 3} y="7" width={Math.max(18, 93 - x)} height="86" fill={props.secondaryColor} opacity="0.12" stroke={props.secondaryColor} strokeWidth="0.45" />
      <line x1={x} y1="4" x2={x} y2="96" stroke={props.accentColor} strokeWidth="1.1" />
      <circle cx={x} cy="50" r="2.4" fill={props.accentColor} />
    </>
  );
};

const Technical: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number; hud?: boolean }> = ({ asset, props, p, hud = false }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    <g transform={`rotate(${hud ? p * 360 : asset.variant * 9} 50 50)`}>
      {range(24).map((i) => {
        const angle = i / 24 * TAU;
        const r1 = 30 + (i % 3) * 2;
        const r2 = 39 + (i % 2) * 3;
        return <line key={i} x1={50 + Math.cos(angle) * r1} y1={50 + Math.sin(angle) * r1} x2={50 + Math.cos(angle) * r2} y2={50 + Math.sin(angle) * r2} stroke={i % 6 === 0 ? props.accentColor : props.primaryColor} strokeWidth={i % 6 === 0 ? 0.8 : 0.25} />;
      })}
      {hud && <path d="M50 50 L92 50 A42 42 0 0 1 88 68 Z" fill={props.accentColor} opacity="0.18" />}
    </g>
    <circle cx="50" cy="50" r="27" fill="none" stroke={props.secondaryColor} strokeWidth="0.32" strokeDasharray="3 2" />
    <circle cx="50" cy="50" r="14" fill="none" stroke={props.primaryColor} strokeWidth="0.55" />
    <rect x="47" y="47" width="6" height="6" fill={props.accentColor} opacity="0.9" />
  </>
);

const Network: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const count = 18;
  const nodes = range(count).map((i) => {
    const x0 = 8 + seededRandom(props.seed, i * 2) * 84;
    const y0 = 8 + seededRandom(props.seed, i * 2 + 1) * 84;
    const drift = orbitalPosition(p, 2 + seededRandom(props.seed + 7, i) * 4 * props.intensity, 1.5 + seededRandom(props.seed + 11, i) * 3, i / count);
    return { x: x0 + drift.x, y: y0 + drift.y };
  });
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      {range(count).flatMap((i) => range(2).map((j) => {
        const to = (i * 5 + j * 7 + 3 + asset.variant) % count;
        return <line key={`${i}-${to}`} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[to].x} y2={nodes[to].y} stroke={j ? props.secondaryColor : props.primaryColor} strokeWidth="0.22" opacity="0.26" />;
      }))}
      {nodes.map((node, i) => <circle key={i} cx={node.x} cy={node.y} r={i % 5 === 0 ? 1.45 : 0.72} fill={i % 5 === 0 ? props.accentColor : props.foregroundColor} opacity="0.9" />)}
    </>
  );
};

const ParticleField: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number; stars?: boolean }> = ({ asset, props, p, stars = false }) => {
  const count = stars ? 90 : 55;
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      {range(count).map((i) => {
        const baseX = seededRandom(props.seed, i * 3) * 100;
        const baseY = seededRandom(props.seed, i * 3 + 1) * 100;
        const rate = 0.25 + seededRandom(props.seed, i * 3 + 2) * 1.2;
        const x = stars ? baseX : (baseX + p * rate * 45 * (asset.variant % 2 ? -1 : 1) + 120) % 120 - 10;
        const y = stars ? (baseY + p * rate * 8) % 100 : baseY + Math.sin((p * rate + i * 0.03) * TAU) * 4 * props.intensity;
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((p * rate + i * 0.13) * TAU));
        return <circle key={i} cx={x} cy={y} r={stars ? 0.18 + seededRandom(props.seed + 4, i) * 0.7 : 0.35 + seededRandom(props.seed + 4, i) * 1.0} fill={i % 13 === 0 ? props.accentColor : i % 2 ? props.primaryColor : props.secondaryColor} opacity={twinkle} />;
      })}
    </>
  );
};

const Liquid: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    {range(6).map((i) => {
      const pos = orbitalPosition(p, 13 + i * 2, 10 + i * 1.4, i / 6 + asset.variant * 0.04);
      const radius = 13 + i * 1.8 + waveValue(p, i * 0.15, 2.5 * props.intensity, 1);
      return <ellipse key={i} cx={50 + pos.x} cy={50 + pos.y} rx={radius} ry={radius * (0.62 + (i % 3) * 0.11)} fill={i % 3 === 0 ? props.accentColor : i % 2 ? props.primaryColor : props.secondaryColor} opacity={0.12 + i * 0.045} transform={`rotate(${p * 360 * (i % 2 ? 1 : -1) + i * 23} ${50 + pos.x} ${50 + pos.y})`} />;
    })}
  </>
);

const Contour: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    {range(18).map((i) => {
      const pulse = waveValue(p, i * 0.06, 1.6 * props.intensity, 1);
      const rx = 8 + i * 2.5 + pulse;
      const ry = 5 + i * 2 + pulse * 0.7;
      return <ellipse key={i} cx={47 + Math.sin((i + asset.variant) * 0.9) * 4} cy={52 + Math.cos((i + asset.variant) * 0.7) * 3} rx={rx} ry={ry} fill="none" stroke={i % 6 === 0 ? props.accentColor : i % 2 ? props.primaryColor : props.secondaryColor} strokeWidth={i % 6 === 0 ? 0.55 : 0.22} opacity={0.35 + i * 0.02} transform={`rotate(${asset.variant * 8 + i * 2 + p * 8} 50 50)`} />;
    })}
  </>
);

const Isometric: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const shift = (p * 12) % 12;
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      <g transform={`translate(0 ${shift - 12})`}>
        {range(13).map((i) => <line key={`a${i}`} x1={-50 + i * 14} y1="0" x2={40 + i * 14} y2="120" stroke={i % 5 === 0 ? props.accentColor : props.primaryColor} strokeWidth="0.28" opacity="0.62" />)}
        {range(13).map((i) => <line key={`b${i}`} x1={150 - i * 14} y1="0" x2={60 - i * 14} y2="120" stroke={props.secondaryColor} strokeWidth="0.28" opacity="0.5" />)}
        {range(12).map((i) => <line key={`c${i}`} x1="-20" y1={i * 12} x2="120" y2={i * 12} stroke={props.foregroundColor} strokeWidth="0.18" opacity="0.25" />)}
      </g>
    </>
  );
};

const Perspective: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    {range(17).map((i) => <line key={i} x1="50" y1="45" x2={-20 + i * 9} y2="105" stroke={i % 5 === 0 ? props.accentColor : props.primaryColor} strokeWidth="0.28" opacity="0.55" />)}
    {range(14).map((i) => {
      const q = phaseOffset(p, i / 14);
      const y = 45 + Math.pow(q, 1.8) * 60;
      return <line key={`h${i}`} x1={8 - q * 20} y1={y} x2={92 + q * 20} y2={y} stroke={i % 4 === 0 ? props.secondaryColor : props.foregroundColor} strokeWidth={0.2 + q * 0.25} opacity={0.2 + q * 0.6} />;
    })}
    <rect x="7" y="7" width="86" height="86" fill="none" stroke={props.secondaryColor} strokeWidth="0.3" opacity="0.45" />
  </>
);

const Tunnel: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    {range(14).map((i) => {
      const q = phaseOffset(p, i / 14);
      const size = 8 + q * 108;
      const rotate = (asset.variant % 2 ? -1 : 1) * q * 35;
      return <rect key={i} x={50 - size / 2} y={50 - size / 2} width={size} height={size} rx={asset.variant % 3 ? size * 0.08 : 0} fill="none" stroke={i % 4 === 0 ? props.accentColor : i % 2 ? props.primaryColor : props.secondaryColor} strokeWidth={0.25 + q * 0.5} opacity={0.15 + q * 0.7} transform={`rotate(${rotate} 50 50)`} />;
    })}
  </>
);

const Spiral: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const points = range(90).map((i) => {
    const t = i / 89;
    const angle = t * TAU * (4 + asset.variant * 0.2);
    const r = 2 + t * 44;
    return `${i === 0 ? 'M' : 'L'} ${(50 + Math.cos(angle) * r).toFixed(2)} ${(50 + Math.sin(angle) * r).toFixed(2)}`;
  }).join(' ');
  return (
    <>
      <rect width="100" height="100" fill={props.backgroundColor} />
      <g transform={`rotate(${p * 360} 50 50)`}>
        <path d={points} fill="none" stroke={props.primaryColor} strokeWidth="0.65" strokeDasharray="5 2" strokeDashoffset={-p * 14} opacity="0.8" />
        <path d={points} fill="none" stroke={props.accentColor} strokeWidth="0.22" transform="rotate(180 50 50)" opacity="0.9" />
      </g>
    </>
  );
};

const Rings: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => (
  <>
    <rect width="100" height="100" fill={props.backgroundColor} />
    {range(13).map((i) => {
      const q = phaseOffset(p, i / 13);
      const r = 4 + q * 52;
      return <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={i % 4 === 0 ? props.accentColor : i % 2 ? props.primaryColor : props.secondaryColor} strokeWidth={0.2 + (1 - q) * 0.75} opacity={(1 - q) * 0.8} />;
    })}
    <circle cx="50" cy="50" r="2.5" fill={props.foregroundColor} />
  </>
);

const LightStreaks: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number; chromatic?: boolean }> = ({ asset, props, p, chromatic = false }) => (
  <>
    {!asset.transparent && <rect width="100" height="100" fill={props.backgroundColor} />}
    {range(chromatic ? 9 : 12).map((i) => {
      const q = phaseOffset(p, i / (chromatic ? 9 : 12));
      const x = -30 + q * 160;
      const color = chromatic ? [props.primaryColor, props.secondaryColor, props.accentColor][i % 3] : i % 4 === 0 ? props.accentColor : i % 2 ? props.primaryColor : props.secondaryColor;
      return <line key={i} x1={x} y1={-10 + i * 8} x2={x + 28 + asset.variant * 2} y2={24 + i * 8} stroke={color} strokeWidth={chromatic ? 1.1 : 0.65 + (i % 3) * 0.5} opacity={chromatic ? 0.5 : 0.25 + (i % 4) * 0.13} />;
    })}
  </>
);

const Reveal: React.FC<{ asset: AssetDefinition; props: AssetVisualProps; p: number }> = ({ asset, props, p }) => {
  const q = 0.5 - 0.5 * Math.cos(p * TAU);
  return (
    <>
      {!asset.transparent && <rect width="100" height="100" fill={props.backgroundColor} />}
      <rect x={50 - q * 44} y={50 - q * 38} width={q * 88} height={q * 76} rx={asset.variant % 2 ? 50 * q : 1} fill={props.primaryColor} opacity="0.16" stroke={props.accentColor} strokeWidth="0.9" />
      <path d={`M8 ${50 - q * 36} H18 M82 ${50 + q * 36} H92 M${50 - q * 42} 8 V18 M${50 + q * 42} 82 V92`} stroke={props.secondaryColor} strokeWidth="1.1" />
    </>
  );
};

const renderFamily = (asset: AssetDefinition, props: AssetVisualProps, p: number) => {
  const common = { asset, props, p };
  switch (asset.family) {
    case 'gradient-field': return <GradientField {...common} />;
    case 'radial-light': return <RadialLight {...common} />;
    case 'grid-field': return <GridField {...common} />;
    case 'modular-tiles': return <ModularTiles {...common} />;
    case 'orbit-system': return <OrbitSystem {...common} />;
    case 'line-field': return <LineField {...common} />;
    case 'wave-field': return <WaveField {...common} />;
    case 'dot-matrix': return <DotMatrix {...common} />;
    case 'halftone': return <DotMatrix {...common} halftone />;
    case 'checker': return <Checker {...common} />;
    case 'stripes': return <Checker {...common} stripes />;
    case 'frame-system': return <FrameSystem {...common} />;
    case 'editorial': return <Editorial {...common} />;
    case 'kinetic-layout': return <Editorial {...common} kinetic />;
    case 'split-screen': return <SplitScreen {...common} />;
    case 'technical': return <Technical {...common} />;
    case 'hud': return <Technical {...common} hud />;
    case 'network': return <Network {...common} />;
    case 'particles': return <ParticleField {...common} />;
    case 'star-field': return <ParticleField {...common} stars />;
    case 'liquid': return <Liquid {...common} />;
    case 'contour': return <Contour {...common} />;
    case 'isometric': return <Isometric {...common} />;
    case 'perspective': return <Perspective {...common} />;
    case 'tunnel': return <Tunnel {...common} />;
    case 'spiral': return <Spiral {...common} />;
    case 'rings': return <Rings {...common} />;
    case 'light-streaks': return <LightStreaks {...common} />;
    case 'chromatic': return <LightStreaks {...common} chromatic />;
    case 'reveal': return <Reveal {...common} />;
    default: return <GridField {...common} />;
  }
};

export const AssetRenderer: React.FC<AssetCompositionProps> = (input) => {
  const asset = getAssetDefinition(input.assetId);
  const props = resolveProps(asset, input);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ratio = aspectRatioLayout(width, height);
  const previewProgress = asset.type === 'motion'
    ? asset.previewFrame / Math.max(1, asset.durationInFrames)
    : 0.37;
  const liveProgress = asset.type === 'motion'
    ? loopProgress(frame, fps, asset.loopDurationSeconds, props.speed, props.phase)
    : previewProgress;
  const directionProgress = props.direction === 'reverse' ? 1 - liveProgress : liveProgress;
  const progress = props.staticMode || props.reducedMotion ? previewProgress : directionProgress;
  const portraitScale = ratio.isPortrait ? 1.08 : 1;
  const rootBackground = asset.transparent ? 'transparent' : props.backgroundColor;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: rootBackground,
        overflow: 'hidden',
        opacity: props.opacity,
        mixBlendMode: props.blendMode,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          scale: String(props.scale * portraitScale),
          rotate: `${props.rotation}deg`,
          transformOrigin: '50% 50%',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio={ratio.isPortrait ? 'xMidYMid slice' : 'xMidYMid slice'}
          width="100%"
          height="100%"
          aria-label={asset.name}
          role="img"
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          {renderFamily(asset, props, progress)}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const AssetThumbnail: React.FC<AssetCompositionProps> = (props) => (
  <AssetRenderer {...props} staticMode />
);
