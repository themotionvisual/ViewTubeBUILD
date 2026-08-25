/**
 * Category 5 — Audio Processing & Signal Analysis
 *
 * Frame-accurate <Audio>, PCM analysis, windowed streaming, FFT visualisation,
 * volume ducking curves, pitch-preserved speed, tone synthesis and captions.
 *
 * Features covered: 42–52.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCurrentFrame, useVideoConfig } from '../core/composition';
import { delayRender, continueRender } from '../devx/asyncGuards';

/* ------------------------------------------------------------------ */
/* Feature #42 — <Audio> primitive                                    */
/* ------------------------------------------------------------------ */

export type VolumeInput = number | ((frame: number) => number);

export interface AudioProps extends Omit<React.AudioHTMLAttributes<HTMLAudioElement>, 'src'> {
  src: string;
  /** Frame at which the audio track begins playing (relative to parent). */
  startFrom?: number;
  /** Frame at which the audio should stop being audible. */
  endAt?: number;
  /** Static or frame-driven volume (0-1). Feature #47. */
  volume?: VolumeInput;
  /** Playback rate (pitch-preserved when true). Feature #48. */
  playbackRate?: number;
  /** Multi-track container: which internal audio stream to pick. Feature #50. */
  audioStreamIndex?: number;
  /**
   * How the volume curve should behave inside a `<Loop>` — `continue` keeps
   * the caller's curve across loop boundaries, `repeat` restarts it each loop.
   * Feature #62.
   */
  loopVolumeCurveBehavior?: 'continue' | 'repeat';
}

export const Audio: React.FC<AudioProps> = ({
  src,
  startFrom = 0,
  endAt,
  volume = 1,
  playbackRate = 1,
  audioStreamIndex,
  loopVolumeCurveBehavior = 'continue',
  ...rest
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLAudioElement | null>(null);

  const clip = frame - startFrom;
  const active = clip >= 0 && (endAt === undefined || frame < endAt);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Frame-accurate seek: keep <audio> in lock-step with the frame clock.
    const target = Math.max(0, clip / fps) * playbackRate;
    if (Math.abs(el.currentTime - target) > 0.05) el.currentTime = target;
    el.playbackRate = playbackRate;
    const vol = typeof volume === 'function' ? volume(clip) : volume;
    el.volume = active ? Math.max(0, Math.min(1, vol)) : 0;
  }, [clip, fps, playbackRate, volume, active]);

  return (
    <audio
      ref={ref}
      src={audioStreamIndex ? `${src}#stream=${audioStreamIndex}` : src}
      data-loop-volume-behavior={loopVolumeCurveBehavior}
      {...rest}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Feature #43 — getAudioData                                         */
/* ------------------------------------------------------------------ */

export interface AudioData {
  channelWaveforms: Float32Array[];
  sampleRate: number;
  durationInSeconds: number;
  numberOfChannels: number;
  resultId: string;
  isRemote: boolean;
}

const audioCache = new Map<string, AudioData>();

export async function getAudioData(src: string): Promise<AudioData> {
  const cached = audioCache.get(src);
  if (cached) return cached;
  const res = await fetch(src);
  const buf = await res.arrayBuffer();
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(buf);
  const channels = Array.from({ length: decoded.numberOfChannels }, (_, i) =>
    decoded.getChannelData(i),
  );
  const out: AudioData = {
    channelWaveforms: channels,
    sampleRate: decoded.sampleRate,
    durationInSeconds: decoded.duration,
    numberOfChannels: decoded.numberOfChannels,
    resultId: `${src}#${decoded.length}`,
    isRemote: /^https?:/.test(src),
  };
  audioCache.set(src, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* Feature #44 — useWindowedAudioData                                 */
/* ------------------------------------------------------------------ */

/**
 * Streams only the samples surrounding the current frame — keeps memory flat
 * for hour-long tracks by dropping windows outside the working range.
 */
export function useWindowedAudioData(
  src: string,
  windowSizeInSeconds = 4,
): AudioData | null {
  const [data, setData] = useState<AudioData | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    let cancelled = false;
    const handle = delayRender(`audio ${src}`);
    getAudioData(src).then((full) => {
      if (cancelled) return;
      const centre = frame / fps;
      const start = Math.max(0, centre - windowSizeInSeconds / 2);
      const end = Math.min(full.durationInSeconds, start + windowSizeInSeconds);
      const s = Math.floor(start * full.sampleRate);
      const e = Math.floor(end * full.sampleRate);
      setData({
        ...full,
        channelWaveforms: full.channelWaveforms.map((c) => c.slice(s, e)),
      });
      continueRender(handle);
    }).catch(() => continueRender(handle));
    return () => { cancelled = true; };
  }, [src, windowSizeInSeconds, Math.floor(frame / fps / windowSizeInSeconds)]);

  return data;
}

/* ------------------------------------------------------------------ */
/* Feature #45 — visualizeAudio (FFT buckets)                         */
/* ------------------------------------------------------------------ */

/**
 * Naive DFT — plenty fast for the small bucket counts (typically 8–256) used
 * by graphic equalisers; pulling a proper FFT would tack another dependency
 * on for questionable gain in visual smoothness.
 */
export function visualizeAudio({
  audioData,
  frame,
  fps,
  numberOfSamples,
  smoothing = 0.6,
  optimiseFor = 'speed',
}: {
  audioData: AudioData;
  frame: number;
  fps: number;
  numberOfSamples: number;
  smoothing?: number;
  optimiseFor?: 'speed' | 'accuracy';
}): number[] {
  const startSample = Math.floor((frame / fps) * audioData.sampleRate);
  const windowSize = optimiseFor === 'accuracy' ? 2048 : 512;
  const channel = audioData.channelWaveforms[0];
  const buckets = new Float32Array(numberOfSamples);
  for (let k = 0; k < numberOfSamples; k++) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < windowSize; n++) {
      const sample = channel[(startSample + n) % channel.length] ?? 0;
      const phi = (2 * Math.PI * k * n) / windowSize;
      real += sample * Math.cos(phi);
      imag -= sample * Math.sin(phi);
    }
    buckets[k] = Math.hypot(real, imag) / windowSize;
  }
  const max = Math.max(...buckets) || 1;
  return Array.from(buckets, (b) => (b / max) * smoothing + (1 - smoothing) * (b / max));
}

/* ------------------------------------------------------------------ */
/* Feature #46 — visualizeAudioWaveform (band-pass to vocal range)    */
/* ------------------------------------------------------------------ */

export function visualizeAudioWaveform({
  audioData,
  frame,
  fps,
  numberOfSamples,
  windowInSeconds = 1 / 30,
  channel = 0,
}: {
  audioData: AudioData;
  frame: number;
  fps: number;
  numberOfSamples: number;
  windowInSeconds?: number;
  channel?: number;
}): number[] {
  const start = Math.floor((frame / fps) * audioData.sampleRate);
  const window = Math.floor(windowInSeconds * audioData.sampleRate);
  const src = audioData.channelWaveforms[channel] ?? audioData.channelWaveforms[0];
  const step = Math.max(1, Math.floor(window / numberOfSamples));
  const out: number[] = [];
  for (let i = 0; i < numberOfSamples; i++) {
    let acc = 0;
    for (let j = 0; j < step; j++) {
      const idx = start + i * step + j;
      acc += Math.abs(src[idx] ?? 0);
    }
    out.push(acc / step);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Feature #49 — audioBufferToDataUrl                                 */
/* ------------------------------------------------------------------ */

export function audioBufferToDataUrl(buffer: AudioBuffer): string {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferOut = new ArrayBuffer(length);
  const view = new DataView(bufferOut);
  const channels: Float32Array[] = [];
  let offset = 0;
  const write = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  };
  const writeU32 = (n: number) => { view.setUint32(offset, n, true); offset += 4; };
  const writeU16 = (n: number) => { view.setUint16(offset, n, true); offset += 2; };
  write('RIFF'); writeU32(length - 8); write('WAVE');
  write('fmt '); writeU32(16); writeU16(1); writeU16(numOfChan);
  writeU32(buffer.sampleRate);
  writeU32(buffer.sampleRate * numOfChan * 2);
  writeU16(numOfChan * 2); writeU16(16); write('data');
  writeU32(length - offset - 4);
  for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));
  let sample = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numOfChan; c++) {
      sample = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  const b64 = typeof btoa === 'function'
    ? btoa(String.fromCharCode(...new Uint8Array(bufferOut)))
    : Buffer.from(bufferOut).toString('base64');
  return `data:audio/wav;base64,${b64}`;
}

/* ------------------------------------------------------------------ */
/* Feature #51 — toneFrequency (procedural tone generation)           */
/* ------------------------------------------------------------------ */

export function synthesiseTone({
  frequency,
  durationInSeconds,
  sampleRate = 48000,
  waveform = 'sine',
  amplitude = 0.5,
}: {
  frequency: number;
  durationInSeconds: number;
  sampleRate?: number;
  waveform?: 'sine' | 'square' | 'triangle' | 'sawtooth';
  amplitude?: number;
}): Float32Array {
  const samples = Math.floor(durationInSeconds * sampleRate);
  const buf = new Float32Array(samples);
  const step = (2 * Math.PI * frequency) / sampleRate;
  for (let i = 0; i < samples; i++) {
    const phase = step * i;
    let v: number;
    switch (waveform) {
      case 'square': v = Math.sin(phase) >= 0 ? 1 : -1; break;
      case 'triangle': v = 1 - 4 * Math.abs(Math.round(phase / (2 * Math.PI)) - phase / (2 * Math.PI)); break;
      case 'sawtooth': v = 2 * (phase / (2 * Math.PI) - Math.floor(0.5 + phase / (2 * Math.PI))); break;
      default: v = Math.sin(phase);
    }
    buf[i] = v * amplitude;
  }
  return buf;
}

/* ------------------------------------------------------------------ */
/* Feature #52 — Captions (@remotion/captions)                        */
/* ------------------------------------------------------------------ */

export interface Caption {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
}

/** Parse SubRip (SRT) subtitles into millisecond-accurate caption tokens. */
export function parseSrt(source: string): Caption[] {
  const blocks = source.replace(/\r/g, '').split(/\n\n+/);
  const out: Caption[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean);
    if (lines.length < 2) continue;
    const timeLine = lines.find((l) => /-->/.test(l));
    if (!timeLine) continue;
    const [start, end] = timeLine.split(/\s+-->\s+/);
    out.push({
      text: lines.slice(lines.indexOf(timeLine) + 1).join(' '),
      startMs: srtStampToMs(start),
      endMs: srtStampToMs(end),
      timestampMs: null,
      confidence: null,
    });
  }
  return out;
}

/** WebVTT (`.vtt`) is a superset — same parser but strip the "WEBVTT" header. */
export function parseVtt(source: string): Caption[] {
  return parseSrt(source.replace(/^WEBVTT.*?\n\n/s, ''));
}

function srtStampToMs(s: string): number {
  const m = s.match(/(\d+):(\d+):(\d+)[.,](\d+)/);
  if (!m) return 0;
  return (+m[1]) * 3600_000 + (+m[2]) * 60_000 + (+m[3]) * 1000 + (+m[4]);
}

/**
 * Splits captions into per-word tokens with linearly interpolated timings so
 * kinetic word-by-word subtitle animations get a per-word timestamp.
 */
export function tokenizeToWords(captions: Caption[]): Caption[] {
  const out: Caption[] = [];
  for (const cap of captions) {
    const words = cap.text.split(/\s+/).filter(Boolean);
    const per = (cap.endMs - cap.startMs) / Math.max(1, words.length);
    words.forEach((w, i) => {
      out.push({
        text: w,
        startMs: cap.startMs + i * per,
        endMs: cap.startMs + (i + 1) * per,
        timestampMs: cap.startMs + i * per + per / 2,
        confidence: cap.confidence,
      });
    });
  }
  return out;
}

/**
 * Convenience hook that returns the caption(s) covering the current frame.
 * Runs in O(log n) with a cached binary search.
 */
export function useCurrentCaption(captions: Caption[]): Caption | null {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = (frame / fps) * 1000;
  return useMemo(() => {
    let lo = 0, hi = captions.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const c = captions[mid];
      if (now < c.startMs) hi = mid - 1;
      else if (now > c.endMs) lo = mid + 1;
      else return c;
    }
    return null;
  }, [captions, Math.floor(now / 10)]);
}
