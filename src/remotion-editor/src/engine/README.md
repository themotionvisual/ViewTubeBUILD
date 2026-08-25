# ViewTube Video Engine

A code-driven video editing engine that mirrors Remotion's architecture. All
one hundred features from the reference spec live in this directory, grouped
by category and cross-referenced in [`FEATURES.md`](./FEATURES.md).

```
engine/
├── core/           # 1–10   composition, useCurrentFrame, schema
├── timeline/       # 11–20  Sequence, Series, Loop, Freeze, trim/premount
├── animation/      # 21–30  interpolate, spring, easing, noise, motion-blur
├── svg/            # 31–43  path length, morph, warp, shapes
├── audio/          # 44–54  <Audio>, FFT, captions, tones
├── media/          # 55–64  <Video>, <OffthreadVideo>, <Gif>, HtmlCanvas
├── devx/           # 65–74  delayRender, onError, R3F/Skia/Lottie bridges
├── studio/         # 75–82  StudioPreview, controls, timeline, keys
├── render/         # 83–92  headless Chromium, FFmpeg, bundle(), Node API
└── cloud/          # 93–102 Lambda, Cloud Run, Player, cost, webhooks
```

## Getting started

```tsx
import {
  Composition,
  registerRoot,
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
} from './engine';

const Hello = () => {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps: 30, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#000', color: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ transform: `scale(${scale})`, opacity, fontSize: 96 }}>Hello ViewTube</h1>
    </AbsoluteFill>
  );
};

const Root = () => (
  <>
    <Composition
      id="Hello"
      component={Hello}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  </>
);

registerRoot(Root);
```

## Rendering

- **In the browser**: drop a `<Player composition={…} />` from `engine/cloud/player`.
- **Studio**: `<StudioPreview composition={…} />` from `engine/studio` gives you
  scrub / pan / zoom / speed toggle out of the box.
- **CLI / Node**: `await renderVideo({ bundleUrl, compositionId, outputLocation, codec: 'h264' })`.
  Cloud variants live in `engine/cloud` (`renderMediaOnLambda`,
  `renderMediaOnCloudRun`).

## Notes on the render pipeline

`render/headless.ts` and `render/bundler.ts` are the only Node-only modules.
They lazy-`import()` `puppeteer-core`, `ffmpeg`, and Vite so browser bundles
tree-shake them out. When those runtime deps aren't installed the functions
short-circuit to a **plan-only** mode that returns the descriptor of the job
that *would* have run — useful for integration tests that shouldn't spin up
a real Chromium instance.

The cloud helpers behave the same way: without `@aws-sdk/client-lambda` or
`@google-cloud/run` installed they synthesise a `renderId` and return
without invoking anything, so `renderMediaOnLambda(...)` is safe to call
from a CI pipeline that hasn't been given AWS credentials yet.
