// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { ShortsRetentionChart } from '../ShortsRetentionChart';
import React from 'react';

describe('ShortsRetentionChart', () => {
  it('renders inside the registered temporal canvas contract', () => {
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

    // Geometry is declared by the contract attributes and applied by
    // `styles/data-visual-canvas.css`, so the renderer carries no height,
    // aspect ratio or overflow of its own.
    const canvas = container.querySelector('[data-vt-visual-canvas="shorts-retention"]') as HTMLElement | null;
    expect(canvas).not.toBeNull();
    expect(canvas?.dataset.vtVisualFamily).toBe('temporal');
    expect(canvas?.dataset.vtVisualAspect).toBe('16:9');
    expect(canvas?.style.height).toBe('');
    expect(canvas?.style.minHeight).toBe('');

    const module = canvas?.querySelector('[data-vt-data-visual-module="shorts-retention"]') as HTMLElement | null;
    expect(module).not.toBeNull();
    expect(module?.dataset.vtDataVisualOverflow).toBe('clip');
    expect(module?.dataset.vtDataVisualDensity).toBe('normal');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
