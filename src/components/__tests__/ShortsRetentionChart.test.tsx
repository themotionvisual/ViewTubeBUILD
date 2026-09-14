// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { ShortsRetentionChart } from '../ShortsRetentionChart';
import React from 'react';

describe('ShortsRetentionChart', () => {
  it('renders with the source-native temporal responsive canvas contract', () => {
    const data = [
      { second: 0, retention: 100 },
      { second: 1, retention: 80 },
    ];
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<ShortsRetentionChart data={data} />);
    });

    const canvas = container.querySelector('[data-vt-visual-canvas="shorts-retention"]') as HTMLElement | null;
    expect(canvas).not.toBeNull();
    expect(canvas?.dataset.vtVisualFamily).toBe('temporal');
    expect(canvas?.dataset.vtVisualAspect).toBe('16:9');
    expect(canvas?.style.aspectRatio).toBe('16 / 9');
    expect(canvas?.style.maxWidth).toBe('100%');
    expect(canvas?.style.overflow).toBe('hidden');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});