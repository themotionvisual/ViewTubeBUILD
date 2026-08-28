export interface VtE1Caption {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
}

function stampToMs(value: string): number {
  const match = String(value || '').trim().match(/(\d+):(\d+):(\d+)[.,](\d+)/);
  if (!match) return 0;
  return (+match[1]) * 3_600_000 + (+match[2]) * 60_000 + (+match[3]) * 1000 + (+match[4]);
}

export function parseVtE1Srt(source: string): VtE1Caption[] {
  const blocks = String(source || '').replace(/\r/g, '').split(/\n\n+/);
  const output: VtE1Caption[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean);
    if (lines.length < 2) continue;
    const timeLine = lines.find((line) => /-->/.test(line));
    if (!timeLine) continue;
    const [start, end] = timeLine.split(/\s+-->\s+/);
    output.push({
      text: lines.slice(lines.indexOf(timeLine) + 1).join(' '),
      startMs: stampToMs(start),
      endMs: stampToMs(end),
      timestampMs: null,
      confidence: null,
    });
  }
  return output;
}

export function parseVtE1Vtt(source: string): VtE1Caption[] {
  return parseVtE1Srt(String(source || '').replace(/^WEBVTT.*?\n\n/s, ''));
}

export function tokenizeVtE1CaptionsToWords(captions: VtE1Caption[]): VtE1Caption[] {
  const output: VtE1Caption[] = [];
  for (const caption of captions || []) {
    const words = caption.text.split(/\s+/).filter(Boolean);
    const perWord = (caption.endMs - caption.startMs) / Math.max(1, words.length);
    words.forEach((word, index) => {
      output.push({
        text: word,
        startMs: caption.startMs + index * perWord,
        endMs: caption.startMs + (index + 1) * perWord,
        timestampMs: caption.startMs + index * perWord + perWord / 2,
        confidence: caption.confidence,
      });
    });
  }
  return output;
}

export function captionAtVtE1TimeMs(captions: VtE1Caption[], nowMs: number): VtE1Caption | null {
  let low = 0;
  let high = Math.max(0, captions.length - 1);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const caption = captions[mid];
    if (nowMs < caption.startMs) high = mid - 1;
    else if (nowMs >= caption.endMs) low = mid + 1;
    else return caption;
  }
  return null;
}
