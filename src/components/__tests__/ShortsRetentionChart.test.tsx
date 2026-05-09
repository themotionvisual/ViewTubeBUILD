import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { ShortsRetentionChart } from '../ShortsRetentionChart';
import React from 'react';

describe('ShortsRetentionChart', () => {
  it('renders without crashing', () => {
    const data = [
      { second: 0, retention: 100 },
      { second: 1, retention: 80 },
    ];
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(<ShortsRetentionChart data={data} />);
    root.unmount();
  });
});
