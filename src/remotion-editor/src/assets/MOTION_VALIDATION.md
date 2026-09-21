# Motion Loop Validation

## Mathematical contract

`loopProgress(frame, fps, seconds, speed, phase)` converts Remotion's frame counter into a normalized periodic phase. At default speed and zero phase:

- frame 0 → phase 0
- frame `fps × loopDurationSeconds` → phase 0
- any direct frame lookup produces the same phase every time
- fps changes preserve cycle length in seconds

The validation suite checks every motion asset at 24, 30 and 60 fps.

## Seek probes

Each motion asset is probed in the requested non-linear order:

1. frame 0
2. frame 80
3. frame 20
4. final natural-cycle frame

The same probe is immediately repeated and values are compared. No historical state is used.

## Static and reduced-motion mode

Both modes replace live loop phase with the asset's designated `previewFrame / durationInFrames`. This makes thumbnails, paused previews and reduced-motion output deterministic.

## Duration behavior

All current motion entries declare `loop-continuously` and `fixed-cycle` honestly because the renderer preserves their authored periodic cycle:

- clips shorter than the cycle show a deterministic segment
- clips equal to the cycle complete one period
- clips longer than the cycle repeat seamlessly
- speed changes multiply frame-derived phase without introducing timers

Adaptive-cycle metadata should only be introduced when a renderer actually scales a complete cycle to the clip duration.
