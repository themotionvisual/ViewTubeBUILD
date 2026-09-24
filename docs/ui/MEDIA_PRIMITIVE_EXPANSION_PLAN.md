# ViewTube Media Primitive Expansion Plan

Status: implementation wave active  
Authority chain: TOKENS → PRIMITIVES → UI LIBRARY → PRODUCTION CONSUMERS

## Goal

Create one reusable media-control language for ViewTube rather than allowing the Editor, Video Manager, Vault, Video Director, widgets, and review tools to recreate playback UI locally.

The flagship component is the canonical `SubToolboxMediaPlayer`. It is composed from smaller media primitives so production tools can use the full player or only the pieces they need.

## 10 basic primitives

| Primitive | Job | Default composition |
| --- | --- | --- |
| Media Control Button | Square transport/action control | icon-only, level-scaled |
| Media Play Toggle | Play/pause state | wide square control |
| Media Seek Bar | Current/buffered timeline | played + buffered + range input |
| Media Volume Control | Volume + mute | square mute rail + slider |
| Media Timecode | Current / duration readout | tabular time values |
| Media Duration Badge | Compact duration metadata | pill readout |
| Media Caption Toggle | Caption state | CC icon + state |
| Media Speed Control | Playback-rate selection | icon + value + chevron |
| Media Poster Frame | Ratio-aware media preview | 16:9, 1:1, 9:16, 4:5 |
| Media Status | Ready/playing/paused/processing/error | status dot + label |

## 5 compound / complex components

### 1. Media Player
Header + status + ratio-aware media surface + seek + timecode + transport + volume. Supports either an actual media `src` or a poster-only preview state.

### 2. Media Transport Bar
Back / play-pause / forward + timecode + captions + speed + fullscreen. Intended to replace hardcoded transport clusters.

### 3. Media Queue
Selectable media list with sequence number, thumbnail, title/meta, duration, status, and active state.

### 4. Media Inspector
Poster + title/status + metadata rows + action area. Intended for Vault, Video Manager, and Editor inspectors.

### 5. Media Review Panel
Large review workspace that combines a player, review notes, status, and actions. Intended for approval/review workflows.

## Responsive contract

- L0/L1/L2 are driven by component-level DNA rather than feature-local heights.
- Desktop and mobile landscape preserve horizontal transport composition when space permits.
- Mobile portrait may convert dense compounds to two rows or stacked regions.
- Media Player timeline converts from seek + timecode row to stacked layout on narrow screens.
- Media Inspector converts from two columns to one.
- Media Review Panel converts from player + review-sidecar to a vertical stack.
- Queue rows hide lower-priority duration/status metadata before truncating the title.

## Color / visual contract

- Components inherit `--pair-a` and `--pair-b` from the owning Toolbox/SubToolbox.
- Color pops communicate state: active playback, media status, selection, buffered/current progress.
- Structural sizing, stroke, radius, shadow offset, and type scale inherit component-level DNA.
- The UI Library controls presentation geometry; production consumers control available width.

## Accessibility / behavior contract

- All icon-only controls require explicit accessible labels.
- Stateful controls expose `aria-pressed`.
- Seek and volume use native range inputs.
- Playback-rate uses a native select.
- Native video is `playsInline` and does not auto-play without a controlled state request.
- Reduced-motion disables decorative pulse/press motion.

## Production migration plan

1. Certify all 15 families in desktop 1440×1000, portrait 390×844, and landscape 844×390.
2. Migrate Editor mobile `TransportBar` first because it already duplicates play/pause, skip, and speed behavior.
3. Migrate Video Manager preview/player controls.
4. Migrate Vault asset preview surfaces and media inspectors.
5. Migrate Video Director preview and playback controls.
6. Reuse Media Queue in batch-generation / project-review contexts.
7. Reuse Media Review Panel for approval, compare, and creator-feedback workflows.
8. Add architecture checks against new feature-local playback buttons/seek bars where a canonical primitive is sufficient.

## Acceptance criteria

- All 15 families appear in the Primitive/UI Library.
- Media Player is assembled from the basic primitives, not duplicate local controls.
- L0/L1/L2 are visible and usable.
- Portrait and landscape remain usable without clipped controls.
- Keyboard/focus states are visible.
- Seek, volume, mute, captions, speed, queue selection, and play/pause are interactive.
- Production build succeeds.
- Component Library regression tests pass.
- Certification harness includes all 15 families.
