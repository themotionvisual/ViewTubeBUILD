import { assetRegistry, motionAssets, registryAudit, staticAssets } from './catalog';
import { loopProgress } from './motion';
import type { AssetDefinition, AspectRatioKey } from './types';

export interface ValidationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface AssetLibraryValidationReport {
  passed: boolean;
  checks: ValidationCheck[];
  assetCount: number;
  staticCount: number;
  motionCount: number;
}

const ratios: readonly AspectRatioKey[] = ['16:9', '9:16', '1:1', '4:5'];
const testFps = [24, 30, 60] as const;

const check = (name: string, passed: boolean, detail: string): ValidationCheck => ({
  name,
  passed,
  detail,
});

const loopMathIsPeriodic = (asset: AssetDefinition, fps: number) => {
  if (asset.type !== 'motion') return true;
  const loopFrames = Math.max(1, Math.round(asset.loopDurationSeconds * fps));
  const start = loopProgress(0, fps, asset.loopDurationSeconds);
  const wrapped = loopProgress(loopFrames, fps, asset.loopDurationSeconds);
  return Math.abs(start - wrapped) < 1e-9;
};

const deterministicSeekProbe = (asset: AssetDefinition, fps: number) => {
  if (asset.type !== 'motion') return true;
  const frames = [0, 80, 20, Math.max(0, Math.round(asset.loopDurationSeconds * fps) - 1)];
  const first = frames.map((frame) => loopProgress(frame, fps, asset.loopDurationSeconds, 1, asset.defaults.phase));
  const second = frames.map((frame) => loopProgress(frame, fps, asset.loopDurationSeconds, 1, asset.defaults.phase));
  return first.every((value, index) => value === second[index]);
};

export const validateAssetLibrary = (): AssetLibraryValidationReport => {
  const registry = registryAudit();
  const checks: ValidationCheck[] = [
    check('registry-total', assetRegistry.length === 100, `Expected 100, found ${assetRegistry.length}`),
    check('static-total', staticAssets.length === 50, `Expected 50, found ${staticAssets.length}`),
    check('motion-total', motionAssets.length === 50, `Expected 50, found ${motionAssets.length}`),
    check('registry-uniqueness', registry.ok, registry.issues.length ? registry.issues.join('; ') : 'IDs, names and baseline metadata are unique/valid'),
    check(
      'ratio-metadata',
      assetRegistry.every((asset) => ratios.every((ratio) => asset.supportedRatios.includes(ratio))),
      'Every asset declares 16:9, 9:16, 1:1 and 4:5 support',
    ),
    check(
      'schemas',
      assetRegistry.every((asset) => asset.schema.safeParse(asset.defaults).success),
      'Every asset default prop set parses through its schema',
    ),
    check(
      'preview-frames',
      motionAssets.every((asset) => asset.previewFrame >= 0 && asset.previewFrame < asset.durationInFrames),
      'Every motion preview frame is inside its natural cycle',
    ),
    check(
      'loop-periodicity',
      motionAssets.every((asset) => testFps.every((fps) => loopMathIsPeriodic(asset, fps))),
      'Loop progress wraps to the identical phase at 24, 30 and 60 fps',
    ),
    check(
      'seek-determinism',
      motionAssets.every((asset) => testFps.every((fps) => deterministicSeekProbe(asset, fps))),
      '0→80→20→final probes produce identical frame math on repeated evaluation',
    ),
    check(
      'reduced-motion',
      motionAssets.every((asset) => asset.controls.some((control) => control.key === 'reducedMotion')),
      'Every motion asset exposes reduced-motion control',
    ),
    check(
      'speed-control',
      motionAssets.every((asset) => asset.controls.some((control) => control.key === 'speed')),
      'Every motion asset exposes deterministic speed control',
    ),
    check(
      'duration-metadata',
      motionAssets.every((asset) =>
        asset.durationInFrames === Math.round(asset.loopDurationSeconds * asset.fps)
        && asset.durationInFrames > 1
      ),
      'Natural cycle duration matches fps × loopDurationSeconds',
    ),
  ];

  return {
    passed: checks.every((entry) => entry.passed),
    checks,
    assetCount: assetRegistry.length,
    staticCount: staticAssets.length,
    motionCount: motionAssets.length,
  };
};

export const assertAssetLibraryIntegrity = () => {
  const report = validateAssetLibrary();
  if (!report.passed) {
    const failures = report.checks.filter((entry) => !entry.passed);
    throw new Error(
      `Remotion asset library validation failed:\n${failures.map((entry) => `- ${entry.name}: ${entry.detail}`).join('\n')}`,
    );
  }
  return report;
};
